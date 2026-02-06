import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin, Facebook, Instagram } from 'lucide-react'

const Footer = () => {
  const footerLinks = [
    { name: 'Home', href: '/' },
    { name: 'Venues', href: '/venues' },
    { name: 'Programme', href: '/programme' },
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Safeguarding', href: '/safeguarding' },
    { name: 'Contact', href: '/contact' },
  ]

  return (
    <footer style={{ backgroundColor: '#2E354E' }} className="text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <Image 
              src="/images/logo-white.png" 
              alt="Acestars Tennis Coaching" 
              width={132} 
              height={70}
              className="h-14 w-auto mb-4"
            />
            <p className="text-white/70 mb-6">
              Professional tennis coaching in Berkshire, Hampshire & Surrey for over 10 years.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-white/70">
                <MapPin size={18} className="text-accent" />
                <span>15 Camperdown House, Windsor, Berkshire SL4 3HQ</span>
              </div>
              <div className="flex items-center space-x-3 text-white/70">
                <Phone size={18} className="text-accent" />
                <span>07915 269562</span>
              </div>
              <div className="flex items-center space-x-3 text-white/70">
                <Mail size={18} className="text-accent" />
                <a href="mailto:acestarsbookings@gmail.com" className="hover:text-accent transition-colors">
                  acestarsbookings@gmail.com
                </a>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Join Us Now!</h4>
            <p className="text-white/70 mb-6">
              Are you ready to take your tennis to the next level with us?
            </p>
            <Link href="/booking" className="btn-primary inline-block">
              Become Ace Now!
            </Link>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex justify-center items-center gap-4 mt-12 mb-8">
          <span className="text-white/75 font-bold">Follow Us</span>
          <a href="https://www.facebook.com/acestars" target="_blank" rel="noopener noreferrer" className="text-white/75 hover:text-accent transition-colors">
            <Facebook size={22} />
          </a>
          <a href="https://www.instagram.com/acestars" target="_blank" rel="noopener noreferrer" className="text-white/75 hover:text-accent transition-colors">
            <Instagram size={22} />
          </a>
        </div>

        <div className="relative">
          <div className="border-t border-white/20 mt-8"></div>
          <div className="flex justify-center -mt-4">
            <div style={{ backgroundColor: '#2E354E' }} className="px-4 text-center text-white/75 text-sm">
              <p>©2019 Acestars, Ascot</p>
            </div>
          </div>
          <p className="text-center text-white/50 text-xs mt-4">
            All trademarks, logos and brands are property of their respective owners.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
