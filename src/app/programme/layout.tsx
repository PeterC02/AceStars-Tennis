import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Programmes',
  description: 'Explore tennis coaching programmes at Ludgrove School, Edgbarrow School, and AceStars community venues. Private coaching, group sessions, and holiday camps.',
}

export default function ProgrammeLayout({ children }: { children: React.ReactNode }) {
  return children
}
