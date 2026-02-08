import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Our Venues',
  description: 'Find Acestars Tennis Coaching venues across Berkshire, Hampshire & Surrey. Clubs and schools including Ludgrove, Edgbarrow, Iver Heath, and more.',
}

export default function VenuesLayout({ children }: { children: React.ReactNode }) {
  return children
}
