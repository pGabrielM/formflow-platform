import type { FieldType } from '@prisma/client'

type TemplateField = { type: FieldType; label: string; helpText?: string; required?: boolean; options?: string[] }

export type FormTemplate = {
  id: string
  name: string
  description: string
  title: string
  formDescription: string
  successMessage: string
  fields: TemplateField[]
}

export const TEMPLATES: FormTemplate[] = [
  {
    id: 'nps',
    name: 'Pesquisa de satisfação (NPS)',
    description: 'Mede a lealdade dos clientes e coleta o motivo da nota.',
    title: 'Como foi sua experiência?',
    formDescription: 'Leva menos de 1 minuto. Sua opinião ajuda a melhorar nosso atendimento.',
    successMessage: 'Obrigado pelo feedback! Vamos ler com atenção.',
    fields: [
      { type: 'NPS', label: 'De 0 a 10, quanto você recomendaria nossa empresa a um amigo?', required: true },
      { type: 'LONG_TEXT', label: 'O que mais influenciou a sua nota?' },
      { type: 'MULTIPLE_CHOICE', label: 'O que você mais gostou?', options: ['Atendimento', 'Prazo de entrega', 'Qualidade', 'Preço', 'Comunicação'] },
      { type: 'YES_NO', label: 'Podemos entrar em contato sobre sua resposta?' },
      { type: 'EMAIL', label: 'Seu e-mail', helpText: 'Opcional' },
    ],
  },
  {
    id: 'briefing',
    name: 'Briefing de projeto',
    description: 'Coleta as informações necessárias antes de orçar um site ou sistema.',
    title: 'Briefing de projeto',
    formDescription: 'Conte um pouco sobre o que você precisa. Retornamos com uma proposta em até 2 dias úteis.',
    successMessage: 'Recebemos seu briefing! Em breve entraremos em contato com a proposta.',
    fields: [
      { type: 'SHORT_TEXT', label: 'Seu nome', required: true },
      { type: 'EMAIL', label: 'E-mail', required: true },
      { type: 'PHONE', label: 'WhatsApp' },
      { type: 'SINGLE_CHOICE', label: 'Tipo de projeto', required: true, options: ['Site institucional', 'Loja virtual', 'Sistema sob medida', 'Aplicativo', 'Integração/automação'] },
      { type: 'LONG_TEXT', label: 'Descreva o projeto', required: true, helpText: 'Objetivo, público e funcionalidades principais.' },
      { type: 'DROPDOWN', label: 'Orçamento estimado', options: ['Até R$ 5 mil', 'R$ 5–15 mil', 'R$ 15–40 mil', 'Acima de R$ 40 mil', 'Ainda não sei'] },
      { type: 'DATE', label: 'Prazo desejado' },
    ],
  },
  {
    id: 'event',
    name: 'Inscrição em evento',
    description: 'Inscrições com dados de contato, preferências e restrições.',
    title: 'Inscrição — Workshop',
    formDescription: 'Garanta sua vaga. As vagas são limitadas.',
    successMessage: 'Inscrição confirmada! Enviaremos os detalhes por e-mail.',
    fields: [
      { type: 'SHORT_TEXT', label: 'Nome completo', required: true },
      { type: 'EMAIL', label: 'E-mail', required: true },
      { type: 'SHORT_TEXT', label: 'Empresa' },
      { type: 'SINGLE_CHOICE', label: 'Qual turma?', required: true, options: ['Manhã', 'Tarde', 'Noite'] },
      { type: 'YES_NO', label: 'Possui alguma restrição alimentar?' },
      { type: 'RATING', label: 'Qual seu nível de conhecimento no tema?', helpText: '1 = iniciante, 5 = avançado' },
    ],
  },
  {
    id: 'blank',
    name: 'Em branco',
    description: 'Comece do zero.',
    title: 'Formulário sem título',
    formDescription: '',
    successMessage: 'Obrigado! Sua resposta foi registrada.',
    fields: [{ type: 'SHORT_TEXT', label: 'Seu nome', required: true }],
  },
]
