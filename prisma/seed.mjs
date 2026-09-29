// Seeds (or resets) the public demo account. Safe to run repeatedly.
import { config } from 'dotenv'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

config({ path: '.env.local', quiet: true })
config({ quiet: true })

const prisma = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL) })
const DEMO = { email: 'demo@formflow.dev', password: 'demo1234', name: 'Estúdio Aurora' }

// Deterministic pseudo-random so the demo looks the same after every reset.
let seed = 42
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
const pick = (list) => list[Math.floor(rand() * list.length)]
const weighted = (entries) => {
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0)
  let roll = rand() * total
  for (const [value, weight] of entries) if ((roll -= weight) <= 0) return value
  return entries[0][0]
}
const daysAgo = (max) => new Date(Date.now() - Math.floor(rand() * max * 86400000) - Math.floor(rand() * 3600000))

const FIRST = ['Ana', 'Bruno', 'Carla', 'Diego', 'Eduarda', 'Felipe', 'Gabriela', 'Henrique', 'Isabela', 'João', 'Larissa', 'Marcos', 'Natália', 'Otávio', 'Paula', 'Rafael', 'Sofia', 'Thiago', 'Vitória']
const LAST = ['Silva', 'Souza', 'Oliveira', 'Pereira', 'Almeida', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Rocha']
const person = () => {
  const first = pick(FIRST)
  const last = pick(LAST)
  return { name: `${first} ${last}`, email: `${first}.${last}`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') + '@email.com' }
}

async function createForm(ownerId, form, fields) {
  return prisma.form.create({
    data: {
      ownerId,
      ...form,
      fields: { create: fields.map((field, position) => ({ required: false, options: [], ...field, position })) },
    },
    include: { fields: { orderBy: { position: 'asc' } } },
  })
}

async function addResponses(form, count, days, build) {
  const byLabel = Object.fromEntries(form.fields.map((field) => [field.label, field.id]))
  const data = Array.from({ length: count }, () => {
    const values = build()
    const answers = Object.fromEntries(Object.entries(values).map(([label, value]) => [byLabel[label], value]))
    return { formId: form.id, answers, createdAt: daysAgo(days) }
  })
  await prisma.response.createMany({ data })
}

async function main() {
  await prisma.user.deleteMany({ where: { email: DEMO.email } })
  const user = await prisma.user.create({
    data: { email: DEMO.email, name: DEMO.name, passwordHash: await bcrypt.hash(DEMO.password, 10) },
  })

  const nps = await createForm(
    user.id,
    {
      title: 'Pesquisa de satisfação — pós-atendimento',
      description: 'Leva menos de 1 minuto. Sua opinião ajuda a melhorar nosso atendimento.',
      slug: 'demo-satisfacao',
      status: 'PUBLISHED',
      successMessage: 'Obrigado pelo feedback! Vamos ler com atenção.',
    },
    [
      { type: 'NPS', label: 'De 0 a 10, quanto você recomendaria o Estúdio Aurora a um amigo?', required: true },
      { type: 'RATING', label: 'Como você avalia o atendimento da equipe?', required: true },
      { type: 'MULTIPLE_CHOICE', label: 'O que você mais gostou?', options: ['Atendimento', 'Prazo de entrega', 'Qualidade do resultado', 'Preço', 'Comunicação'] },
      { type: 'SINGLE_CHOICE', label: 'Como nos conheceu?', options: ['Instagram', 'Google', 'Indicação', 'Evento', 'Outro'] },
      { type: 'LONG_TEXT', label: 'O que podemos melhorar?' },
      { type: 'YES_NO', label: 'Podemos entrar em contato sobre sua resposta?' },
    ],
  )
  const comments = [
    'Atendimento impecável, voltarei com certeza.',
    'Entregaram antes do prazo, superou minhas expectativas!',
    'Gostei muito, só achei o preço um pouco alto.',
    'Poderiam responder mais rápido pelo WhatsApp.',
    'O resultado final ficou lindo, obrigado a toda a equipe.',
    'Faltou um pouco de clareza no orçamento inicial.',
    'Tudo perfeito do começo ao fim.',
    'Gostaria de mais opções de horário para as reuniões.',
  ]
  await addResponses(nps, 64, 45, () => {
    const score = weighted([[10, 18], [9, 14], [8, 9], [7, 5], [6, 3], [5, 2], [3, 1]])
    return {
      'De 0 a 10, quanto você recomendaria o Estúdio Aurora a um amigo?': score,
      'Como você avalia o atendimento da equipe?': Math.max(1, Math.min(5, Math.round(score / 2) + (rand() > 0.7 ? -1 : 0))),
      'O que você mais gostou?': ['Atendimento', 'Prazo de entrega', 'Qualidade do resultado', 'Preço', 'Comunicação'].filter(() => rand() > 0.55),
      'Como nos conheceu?': weighted([['Instagram', 9], ['Indicação', 7], ['Google', 5], ['Evento', 2], ['Outro', 1]]),
      'O que podemos melhorar?': rand() > 0.45 ? pick(comments) : '',
      'Podemos entrar em contato sobre sua resposta?': rand() > 0.4 ? 'Sim' : 'Não',
    }
  })

  const briefing = await createForm(
    user.id,
    {
      title: 'Briefing de projeto',
      description: 'Conte um pouco sobre o que você precisa. Retornamos com uma proposta em até 2 dias úteis.',
      slug: 'demo-briefing',
      status: 'PUBLISHED',
      submitLabel: 'Enviar briefing',
      successMessage: 'Recebemos seu briefing! Em breve entraremos em contato com a proposta.',
    },
    [
      { type: 'SHORT_TEXT', label: 'Seu nome', required: true },
      { type: 'EMAIL', label: 'E-mail', required: true },
      { type: 'PHONE', label: 'WhatsApp' },
      { type: 'SINGLE_CHOICE', label: 'Tipo de projeto', required: true, options: ['Identidade visual', 'Site institucional', 'Loja virtual', 'Social media', 'Outro'] },
      { type: 'LONG_TEXT', label: 'Descreva o projeto', required: true, helpText: 'Objetivo, público e referências.' },
      { type: 'DROPDOWN', label: 'Orçamento estimado', options: ['Até R$ 5 mil', 'R$ 5–15 mil', 'R$ 15–40 mil', 'Acima de R$ 40 mil', 'Ainda não sei'] },
      { type: 'DATE', label: 'Prazo desejado' },
    ],
  )
  const ideas = [
    'Nova identidade para uma cafeteria de bairro, público jovem.',
    'Site para escritório de advocacia com blog e formulário de contato.',
    'Loja virtual de roupas fitness, integração com Pix e frete.',
    'Gestão de Instagram para clínica odontológica.',
    'Rebranding completo de uma marca de cosméticos naturais.',
  ]
  await addResponses(briefing, 19, 30, () => {
    const p = person()
    const deadline = new Date(Date.now() + (20 + Math.floor(rand() * 60)) * 86400000).toISOString().slice(0, 10)
    return {
      'Seu nome': p.name,
      'E-mail': p.email,
      WhatsApp: `(41) 9${Math.floor(1000 + rand() * 8999)}-${Math.floor(1000 + rand() * 8999)}`,
      'Tipo de projeto': weighted([['Identidade visual', 6], ['Site institucional', 5], ['Loja virtual', 3], ['Social media', 4], ['Outro', 1]]),
      'Descreva o projeto': pick(ideas),
      'Orçamento estimado': weighted([['Até R$ 5 mil', 5], ['R$ 5–15 mil', 7], ['R$ 15–40 mil', 3], ['Acima de R$ 40 mil', 1], ['Ainda não sei', 3]]),
      'Prazo desejado': deadline,
    }
  })

  const event = await createForm(
    user.id,
    {
      title: 'Inscrição — Workshop de Branding',
      description: 'Encontro presencial de 3 horas. Vagas limitadas.',
      slug: 'demo-workshop',
      status: 'CLOSED',
      successMessage: 'Inscrição confirmada! Enviaremos os detalhes por e-mail.',
    },
    [
      { type: 'SHORT_TEXT', label: 'Nome completo', required: true },
      { type: 'EMAIL', label: 'E-mail', required: true },
      { type: 'SINGLE_CHOICE', label: 'Qual turma?', required: true, options: ['Manhã', 'Tarde', 'Noite'] },
      { type: 'RATING', label: 'Nível de conhecimento no tema', helpText: '1 = iniciante, 5 = avançado' },
    ],
  )
  await addResponses(event, 27, 60, () => {
    const p = person()
    return {
      'Nome completo': p.name,
      'E-mail': p.email,
      'Qual turma?': weighted([['Manhã', 3], ['Tarde', 2], ['Noite', 5]]),
      'Nível de conhecimento no tema': weighted([[1, 3], [2, 6], [3, 5], [4, 2], [5, 1]]),
    }
  })

  await createForm(
    user.id,
    { title: 'Pesquisa de clima interno (rascunho)', slug: 'demo-clima', status: 'DRAFT' },
    [
      { type: 'RATING', label: 'Quanto você se sente valorizado(a) no time?', required: true },
      { type: 'LONG_TEXT', label: 'Comentários' },
    ],
  )

  console.log(`Demo account ready: ${DEMO.email} / ${DEMO.password}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
