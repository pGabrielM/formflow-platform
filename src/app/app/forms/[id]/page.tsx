import { redirect } from 'next/navigation'

export default async function FormIndex({ params }: { params: Promise<{ id: string }> }) {
  redirect(`/app/forms/${(await params).id}/responses`)
}
