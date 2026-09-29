import { format, formatDistanceToNowStrict } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatRelative(date: Date | string): string {
  return formatDistanceToNowStrict(new Date(date), { locale: ptBR, addSuffix: true })
}

export function formatDate(date: Date | string, pattern = "dd/MM/yyyy 'às' HH:mm"): string {
  return format(new Date(date), pattern, { locale: ptBR })
}
