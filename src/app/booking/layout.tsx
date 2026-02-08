import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Book a Course',
  description: 'Book tennis coaching at Ludgrove School, Edgbarrow School, or AceStars community programmes. Private lessons, group coaching, and holiday camps available.',
}

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return children
}
