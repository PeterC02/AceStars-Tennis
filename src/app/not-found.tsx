import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="pt-20 min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F7F9FA' }}>
      <div className="max-w-lg mx-auto px-4 text-center">
        <div className="mb-8">
          <span className="text-[120px] md:text-[180px] font-bold leading-none font-heading" style={{ color: '#EAEDE6' }}>
            404
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 font-heading" style={{ color: '#1E2333' }}>
          Page Not Found
        </h1>
        <p className="text-lg mb-8" style={{ color: '#676D82' }}>
          Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-primary text-lg">
            Back to Home
          </Link>
          <Link href="/contact" className="btn-secondary text-lg">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}
