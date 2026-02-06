import Link from 'next/link'
import { ChevronRight, Shield, Users, Phone } from 'lucide-react'

export default function SafeguardingPage() {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-primary via-primary-dark to-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-heading">
            Safeguarding
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Acestars is committed to safeguarding and promoting the welfare of all children and young people in our care.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-50 rounded-2xl p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-primary" size={32} />
              </div>
              <h3 className="font-semibold text-primary mb-2">DBS Checked</h3>
              <p className="text-gray-600 text-sm">All coaches are DBS checked and vetted</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-accent" size={32} />
              </div>
              <h3 className="font-semibold text-primary mb-2">LTA Accredited</h3>
              <p className="text-gray-600 text-sm">Following LTA safeguarding guidelines</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="text-primary" size={32} />
              </div>
              <h3 className="font-semibold text-primary mb-2">Always Available</h3>
              <p className="text-gray-600 text-sm">Open communication with parents</p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-primary mb-4">Our Commitment</h2>
            <p className="text-gray-600 mb-6">
              At Acestars, we believe that every child has the right to participate in tennis in a safe and enjoyable environment. We are committed to ensuring that all children who participate in our coaching programmes are protected from harm.
            </p>

            <h2 className="text-2xl font-bold text-primary mb-4 mt-8">Our Safeguarding Policy</h2>
            <p className="text-gray-600 mb-4">Our safeguarding policy ensures that:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>All coaches hold valid DBS (Disclosure and Barring Service) certificates</li>
              <li>All coaches are trained in safeguarding and child protection</li>
              <li>We follow the LTA's safeguarding policies and procedures</li>
              <li>We have clear reporting procedures for any concerns</li>
              <li>We maintain appropriate adult-to-child ratios during sessions</li>
              <li>We have a designated safeguarding lead</li>
            </ul>

            <h2 className="text-2xl font-bold text-primary mb-4 mt-8">Code of Conduct</h2>
            <p className="text-gray-600 mb-4">All our coaches adhere to a strict code of conduct that includes:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>Treating all children with respect and dignity</li>
              <li>Maintaining appropriate boundaries at all times</li>
              <li>Never being alone with a child in a private setting</li>
              <li>Using appropriate language and behavior</li>
              <li>Reporting any concerns immediately</li>
            </ul>

            <h2 className="text-2xl font-bold text-primary mb-4 mt-8">Reporting Concerns</h2>
            <p className="text-gray-600 mb-6">
              If you have any concerns about the welfare of a child, or if you witness any behavior that concerns you, please report it immediately to our safeguarding lead or contact us directly.
            </p>

            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <h3 className="font-semibold text-primary mb-4">Contact Our Safeguarding Lead</h3>
              <p className="text-gray-600">
                <strong>Acestars Limited</strong><br />
                Email: acestarsbookings@gmail.com<br />
                Phone: 07915 269562
              </p>
            </div>

            <h2 className="text-2xl font-bold text-primary mb-4 mt-8">External Resources</h2>
            <p className="text-gray-600 mb-4">For more information on safeguarding in tennis, please visit:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>LTA Safeguarding: <a href="https://www.lta.org.uk/about-us/safeguarding/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">www.lta.org.uk/safeguarding</a></li>
              <li>NSPCC: <a href="https://www.nspcc.org.uk" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">www.nspcc.org.uk</a></li>
              <li>Childline: 0800 1111</li>
            </ul>
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
