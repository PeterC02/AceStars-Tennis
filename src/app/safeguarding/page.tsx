import Link from 'next/link'
import { ChevronRight, Shield, Users, Phone } from 'lucide-react'

export const metadata = {
  title: 'Safeguarding',
  description: 'Acestars Tennis Coaching safeguarding policy. All our coaches hold safeguarding certificates issued by the LTA.',
}

const safeguardedCoaches = [
  { name: 'Wojtek Specylak', role: 'Head Coach' },
  { name: 'Peter Collier', role: 'Operations Director' },
  { name: 'Andy Fryatt', role: 'Coach' },
  { name: 'Tom Mawby', role: 'Coach' },
  { name: 'Oliver Walker', role: 'Coach' },
  { name: 'Jake Griffiths', role: 'Coach' },
  { name: 'James Newman', role: 'Coach' },
]

export default function SafeguardingPage() {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section 
        className="relative min-h-[50vh] flex items-center justify-center overflow-hidden"
        style={{ 
          backgroundImage: 'url(/images/uploads/2019/03/Depositphotos_115174380_xl-2015-wide-outlined.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(30, 35, 51, 0.85)' }}></div>
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url(/images/uploads/2020/03/wave3-homepage.svg)',
            backgroundRepeat: 'repeat-x',
            backgroundPosition: 'left bottom',
            backgroundSize: 'contain',
          }}
        ></div>
        <div 
          className="absolute bottom-0 left-0 right-0 h-20"
          style={{
            backgroundImage: 'url(/images/uploads/2020/02/wave-1.svg)',
            backgroundRepeat: 'repeat-x',
            backgroundPosition: 'center bottom',
            backgroundSize: 'auto 100%',
          }}
        ></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-heading">
            Safeguarding
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Acestars is committed to safeguarding and promoting the welfare of all children and young people in our care.
          </p>
        </div>
      </section>

      {/* Safeguarding Certificates */}
      <section className="py-24" style={{ backgroundColor: '#F7F9FA' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="section-number" style={{ color: '#F87D4D' }}>01</span>
              <span className="section-line"></span>
              <span className="font-semibold uppercase tracking-wider text-sm" style={{ color: '#1E2333' }}>Safeguarding</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading" style={{ color: '#1E2333' }}>
              All our coaches hold safeguarding certificates issued by LTA.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {safeguardedCoaches.map((coach) => (
              <div key={coach.name} className="rounded-2xl p-6 text-center transition-all hover:shadow-xl hover:-translate-y-1" style={{ backgroundColor: '#FFF', border: '1px solid #EAEDE6' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(101,184,99,0.1)' }}>
                  <Shield size={28} style={{ color: '#65B863' }} />
                </div>
                <h3 className="font-bold text-lg mb-1" style={{ color: '#1E2333' }}>{coach.name}</h3>
                <p className="text-sm mb-3" style={{ color: '#676D82' }}>{coach.role}</p>
                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: 'rgba(101,184,99,0.1)', color: '#65B863' }}>
                  Safeguard ✓
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="relative py-32 text-white"
        style={{ 
          backgroundImage: 'url(/images/uploads/2019/02/9.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(46, 53, 78, 0.85)' }}></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-heading">Join Us Now!</h2>
          <h5 className="text-xl mb-8" style={{ color: '#AFB0B3' }}>
            Are you ready to take your tennis to the next level with us? Click below to find our booking form.
          </h5>
          <Link href="/booking" className="inline-flex items-center gap-2 hover:gap-3 px-10 py-4 rounded-full font-bold text-lg transition-all duration-300" style={{ backgroundColor: '#dfd300', color: '#1E2333' }}>
            Become Ace Now! <ChevronRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  )
}
