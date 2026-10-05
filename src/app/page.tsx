import { BarChart3, Code2, FileDown, LayoutTemplate, ListChecks, Webhook } from 'lucide-react'
import { Landing, type LandingContent } from '@/components/marketing/landing'

const content: LandingContent = {
  eyebrow: 'Pesquisas, briefings e inscrições',
  title: 'Formulários que viram decisões, não planilhas bagunçadas',
  subtitle:
    'Monte o formulário arrastando perguntas, compartilhe um link ou incorpore no site e veja o resumo das respostas na hora — com NPS, gráficos por pergunta, CSV e webhook para o seu CRM.',
  screenshot: { src: '/screenshots/summary.png', alt: 'Resumo de respostas do Form Flow' },
  proof: ['12 tipos de pergunta', 'Incorporável em qualquer site', 'Webhook a cada resposta'],
  features: [
    { icon: ListChecks, title: 'Construtor com pré-visualização', description: 'Adicione, reordene e duplique perguntas vendo exatamente o que o respondente vai ver.' },
    { icon: BarChart3, title: 'Resumo automático', description: 'Gráfico por opção, média de avaliações, NPS com promotores e detratores, e volume por dia.' },
    { icon: Code2, title: 'Link ou iframe', description: 'Compartilhe um link curto ou cole o código de incorporação no WordPress, Wix ou HTML.' },
    { icon: Webhook, title: 'Webhooks', description: 'Cada resposta dispara um POST em JSON para n8n, Zapier, Make ou sua API — com log de entregas.' },
    { icon: FileDown, title: 'Exportação CSV', description: 'Todas as respostas em uma planilha pronta para o Excel, com proteção contra injeção de fórmulas.' },
    { icon: LayoutTemplate, title: 'Modelos prontos', description: 'NPS, briefing de projeto e inscrição em evento para começar em segundos.' },
  ],
  steps: [
    { title: 'Monte as perguntas', description: 'Escolha um modelo ou comece do zero. Validação e campos obrigatórios em um clique.' },
    { title: 'Publique e compartilhe', description: 'Link público, QR no material impresso ou incorporado na página do seu site.' },
    { title: 'Analise e integre', description: 'Acompanhe o resumo, exporte o CSV e envie cada resposta automaticamente para outros sistemas.' },
  ],
  stack: [
    { name: 'Next.js 16 + React 19', detail: 'Server Components para os relatórios, Server Actions para salvar e responder.' },
    { name: 'Validação dinâmica com Zod', detail: 'O esquema de cada formulário é gerado a partir das perguntas e aplicado no servidor.' },
    { name: 'Prisma 7 + PostgreSQL', detail: 'Respostas em JSONB indexadas por formulário e data.' },
    { name: 'Webhooks seguros', detail: 'Timeout, entrega após a resposta (after()) e bloqueio de redes privadas contra SSRF.' },
    { name: 'Anti-spam', detail: 'Campo honeypot invisível e formulários em rascunho inacessíveis publicamente.' },
    { name: 'Auth.js v5', detail: 'Sessão JWT e isolamento total dos dados por conta.' },
  ],
}

export default function HomePage() {
  return <Landing content={content} />
}
