import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Acestars Tennis Coaching. Contact us about lessons, bookings, or any enquiries. Based in Berkshire, Hampshire & Surrey.',
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
