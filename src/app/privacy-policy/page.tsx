import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-primary via-primary-dark to-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-heading">
            Privacy Policy
          </h1>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-primary mb-4">Introduction</h2>
            <p className="text-gray-600 mb-6">
              Acestars Limited ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our tennis coaching services.
            </p>

            <h2 className="text-2xl font-bold text-primary mb-4 mt-8">Information We Collect</h2>
            <p className="text-gray-600 mb-4">We may collect information about you in a variety of ways, including:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li><strong>Personal Data:</strong> Name, email address, phone number, and postal address when you book a course or contact us.</li>
              <li><strong>Child Information:</strong> For junior coaching, we collect the child's name, age, and any relevant medical information with parental consent.</li>
              <li><strong>Payment Information:</strong> Payment details are processed securely through our payment providers.</li>
              <li><strong>Usage Data:</strong> Information about how you use our website.</li>
            </ul>

            <h2 className="text-2xl font-bold text-primary mb-4 mt-8">How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>Provide and manage tennis coaching services</li>
              <li>Process bookings and payments</li>
              <li>Communicate with you about lessons, schedules, and updates</li>
              <li>Improve our services and website</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2 className="text-2xl font-bold text-primary mb-4 mt-8">Data Security</h2>
            <p className="text-gray-600 mb-6">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>

            <h2 className="text-2xl font-bold text-primary mb-4 mt-8">Your Rights</h2>
            <p className="text-gray-600 mb-4">Under GDPR, you have the right to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>Access your personal data</li>
              <li>Rectify inaccurate data</li>
              <li>Request erasure of your data</li>
              <li>Object to processing of your data</li>
              <li>Data portability</li>
            </ul>

            <h2 className="text-2xl font-bold text-primary mb-4 mt-8">Contact Us</h2>
            <p className="text-gray-600 mb-6">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <p className="text-gray-600">
                <strong>Acestars Limited</strong><br />
                15 Camperdown House<br />
                Windsor, Berkshire SL4 3HQ<br />
                Email: acestarsbookings@gmail.com<br />
                Phone: 07915 269562
              </p>
            </div>

            <p className="text-gray-500 text-sm">
              Last updated: January 2024
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary via-primary-dark to-primary text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-heading">Join Us Now!</h2>
          <p className="text-xl text-white/80 mb-8">
            Are you ready to take your tennis to the next level with us?
          </p>
          <Link href="/booking" className="bg-accent hover:bg-accent-dark text-white px-10 py-4 rounded-full font-semibold text-lg transition-all duration-300 inline-flex items-center gap-2 hover:gap-3">
            Become Ace Now! <ChevronRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  )
}
