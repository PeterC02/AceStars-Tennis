import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Our Team',
  description: 'Meet the Acestars Tennis Coaching team. Experienced, internationally qualified coaches with over 30 years of combined experience.',
}

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return children
}
