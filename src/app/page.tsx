import Link from 'next/link'
import { Award, Users, MapPin, Calendar, ChevronRight } from 'lucide-react'
import { coaches as sharedCoaches } from '@/lib/coaches'

const clubs = [
  'Iver Heath Tennis Club',
  'AceStars Community Tennis Club (Coming Soon)',
  "Buckler's Park Courts",
  'Sandhurst Memorial Park Courts',
]

const schools = [
  'Ludgrove School',
  'Edgbarrow School',
  'Yateley Manor',
  'Nine Mile Ride Junior School',
  'Luckley House School',
]

const credentials = [
  'Over 30 years of combined experience.',
  'The highest international qualifications from the top tennis organisations (RPT, LTA, PLTA, PTR & USPTA).',
  'Experience at top global tennis academies (including Sanchez Cazal, Piper Sands Florida, Annabel Croft Tenerife).',
  'Masters in Individual Sports Psychology & PhD in Fitness.',
  'Established tennis programmes in the UK & Internationally.',
]

const coaches = sharedCoaches.map(c => ({
  ...c,
  description: c.shortBio,
}))

export default function Home() {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section 
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
        style={{ 
          backgroundImage: 'url(/images/uploads/2019/03/Depositphotos_115174380_xl-2015-wide-outlined.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(30, 35, 51, 0.85)' }}></div>
        {/* Wave Background */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url(/images/uploads/2020/03/wave3-homepage.svg)',
            backgroundRepeat: 'repeat-x',
            backgroundPosition: 'left bottom',
            backgroundSize: 'contain',
          }}
        ></div>
        {/* Wave Bottom */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-20"
          style={{
            backgroundImage: 'url(/images/uploads/2020/02/wave-1.svg)',
            backgroundRepeat: 'repeat-x',
            backgroundPosition: 'center bottom',
            backgroundSize: 'auto 100%',
          }}
        ></div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-heading">
            Become <span className="text-accent">Ace</span> at Tennis!
          </h1>
          <h4 className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto" style={{ color: '#676D82' }}>
            For over 10 years, Acestars have been providing high quality professional tennis coaching (individuals & groups) to communities in Berkshire, Hampshire & Surrey.
          </h4>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/booking" className="btn-primary text-lg">
              Book a Course
            </Link>
            <Link href="/venues" className="btn-secondary text-lg">
              Our Venues
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24" style={{ backgroundColor: '#F7F9FA' }} id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="section-number">01</span>
                <span className="section-line"></span>
                <span style={{ color: '#1E2333' }} className="font-semibold uppercase tracking-wider text-sm">About Acestars</span>
              </div>
              <h2 className="section-title">Professional Tennis Coaching Excellence</h2>
              <p className="section-subtitle mb-6">
                Over this period, we have successfully opened clubs in over 20 junior, secondary & private schools, provided coaching to several local tennis clubs and worked with number of county, national & international players.
              </p>
              <p className="text-gray-600 mb-8">
                Our qualified team of coaches is led by Head Coach Wojtek Specylak, an RPT National Master Professional. Other members of the team hold various levels of LTA & ITF teaching qualifications, meaning they are right up to date with the latest teaching methods & have a combined experience of over 30 years.
              </p>
              
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
                  <Award className="text-accent" size={20} />
                  Acestars & their coaches have:
                </h3>
                <ul className="space-y-3">
                  {credentials.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-600">
                      <ChevronRight className="text-accent flex-shrink-0 mt-1" size={16} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-accent/20 to-primary/20 rounded-3xl flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-8xl font-bold text-primary/10 mb-4">10+</div>
                  <p className="text-2xl font-semibold text-primary">Years of Excellence</p>
                  <p className="text-gray-600 mt-2">in Tennis Coaching</p>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-accent text-white p-6 rounded-2xl shadow-xl">
                <div className="text-3xl font-bold">30+</div>
                <div className="text-sm">Years Combined Experience</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Venues Section */}
      <section className="py-24" style={{ backgroundColor: '#F7F9FA' }} id="venues">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="section-number">02</span>
              <span className="section-line"></span>
              <span style={{ color: '#1E2333' }} className="font-semibold uppercase tracking-wider text-sm">Where we coach</span>
            </div>
            <h2 className="section-title">Venues</h2>
            <p className="section-subtitle mx-auto">
              Acestars have been actively providing tennis coaching in multiple venues (schools & clubs) covering Berkshire, Hampshire & Surrey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Clubs Card */}
            <div 
              className="relative min-h-[400px] rounded-lg overflow-hidden group"
              style={{ 
                backgroundImage: 'url(/images/uploads/2019/02/9.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/95 via-primary-dark/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <p className="text-sm mb-2" style={{ color: '#AFB0B3' }}>Clubs / Satellite Venues</p>
                <h3 className="text-3xl font-bold mb-4 font-heading">Our Clubs</h3>
                <ul className="space-y-2 mb-6">
                  {clubs.map((club, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#dfd300' }}></div>
                      {club}
                    </li>
                  ))}
                </ul>
                <Link 
                  href="/venues" 
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm border-2 border-white hover:bg-white hover:text-primary-dark transition-all"
                >
                  Explore <ChevronRight size={16} />
                </Link>
              </div>
            </div>

            {/* Schools Card */}
            <div 
              className="relative min-h-[400px] rounded-lg overflow-hidden group"
              style={{ 
                backgroundImage: 'url(/images/uploads/2019/02/10.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/95 via-primary-dark/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <p className="text-sm mb-2" style={{ color: '#AFB0B3' }}>Schools</p>
                <h3 className="text-3xl font-bold mb-4 font-heading">Check for Schools</h3>
                <ul className="space-y-2 mb-6">
                  {schools.slice(0, 5).map((school, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#dfd300' }}></div>
                      {school}
                    </li>
                  ))}
                </ul>
                <Link 
                  href="/venues" 
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm border-2 border-white hover:bg-white hover:text-primary-dark transition-all"
                >
                  Explore <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24" style={{ backgroundColor: '#F7F9FA' }} id="team">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-8">
            <span className="section-number">03</span>
            <span className="section-line"></span>
            <span style={{ color: '#1E2333' }} className="font-semibold uppercase tracking-wider text-sm">Our Coaches</span>
          </div>
          <h2 className="text-4xl font-bold mb-12" style={{ color: '#1E2333' }}>Meet The Team</h2>

          {/* Row 1: Wojtek & Peter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 max-w-4xl mx-auto">
            {coaches.slice(0, 2).map((coach) => (
              <Link
                key={coach.id}
                href="/team"
                className="relative min-h-[380px] rounded-lg overflow-hidden cursor-pointer group block"
                style={{ 
                  border: '1px solid #EAEDE6',
                  backgroundColor: '#F7F9FA',
                  boxShadow: '0 2px 16px 0 rgba(46, 53, 78, 0.05)',
                }}
              >
                <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${coach.image})` }}></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent">
                  <p className="text-sm text-right mb-4" style={{ color: '#AFB0B3' }}>{coach.title}</p>
                  <h3 className="text-xl font-bold" style={{ color: '#1E2333' }}>{coach.name}</h3>
                </div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-95 transition-opacity duration-300 p-6 flex flex-col justify-center" style={{ backgroundColor: '#65B863' }}>
                  <h3 className="text-2xl font-bold text-white mb-2">{coach.name}</h3>
                  <p className="text-sm font-bold mb-4" style={{ color: '#2E354E' }}>{coach.role}</p>
                  <p className="text-sm text-white line-clamp-4">{coach.description}</p>
                  <span className="mt-4 px-6 py-2 rounded-full font-bold text-sm border-2 border-white text-white self-start">View Profile</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Row 2: Andy & Tom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 max-w-4xl mx-auto">
            {coaches.slice(2, 4).map((coach) => (
              <Link
                key={coach.id}
                href="/team"
                className="relative min-h-[350px] rounded-lg overflow-hidden cursor-pointer group block"
                style={{ 
                  border: '1px solid #EAEDE6',
                  backgroundColor: '#F7F9FA',
                  boxShadow: '0 2px 16px 0 rgba(46, 53, 78, 0.05)',
                }}
              >
                <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${coach.image})` }}></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent">
                  <p className="text-sm text-right mb-4" style={{ color: '#AFB0B3' }}>{coach.title}</p>
                  <h3 className="text-xl font-bold" style={{ color: '#1E2333' }}>{coach.name}</h3>
                </div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-95 transition-opacity duration-300 p-6 flex flex-col justify-center" style={{ backgroundColor: '#65B863' }}>
                  <h3 className="text-2xl font-bold text-white mb-2">{coach.name}</h3>
                  <p className="text-sm font-bold mb-4" style={{ color: '#2E354E' }}>{coach.role}</p>
                  <p className="text-sm text-white line-clamp-4">{coach.description}</p>
                  <span className="mt-4 px-6 py-2 rounded-full font-bold text-sm border-2 border-white text-white self-start">View Profile</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Row 3: Oliver, Jake & James */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coaches.slice(4).map((coach) => (
              <Link
                key={coach.id}
                href="/team"
                className="relative min-h-[320px] rounded-lg overflow-hidden cursor-pointer group block"
                style={{ 
                  border: '1px solid #EAEDE6',
                  backgroundColor: '#F7F9FA',
                  boxShadow: '0 2px 16px 0 rgba(46, 53, 78, 0.05)',
                }}
              >
                <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${coach.image})` }}></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent">
                  <p className="text-sm text-right mb-4" style={{ color: '#AFB0B3' }}>{coach.title}</p>
                  <h3 className="text-xl font-bold" style={{ color: '#1E2333' }}>{coach.name}</h3>
                </div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-95 transition-opacity duration-300 p-6 flex flex-col justify-center" style={{ backgroundColor: '#65B863' }}>
                  <h3 className="text-2xl font-bold text-white mb-2">{coach.name}</h3>
                  <p className="text-sm font-bold mb-4" style={{ color: '#2E354E' }}>{coach.role}</p>
                  <p className="text-sm text-white line-clamp-4">{coach.description}</p>
                  <span className="mt-4 px-6 py-2 rounded-full font-bold text-sm border-2 border-white text-white self-start">View Profile</span>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link 
              href="/team" 
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold transition-all"
              style={{ backgroundColor: '#dfd300', color: '#1E2333' }}
            >
              View All Coaches <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24" style={{ backgroundColor: '#1E2333' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="section-number" style={{ color: '#dfd300' }}>05</span>
              <span className="section-line" style={{ backgroundColor: '#dfd300' }}></span>
              <span className="font-semibold uppercase tracking-wider text-sm" style={{ color: '#dfd300' }}>Testimonials</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-heading">What Parents Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah M.', role: 'Parent, Ludgrove School', text: 'My son has been coached by Acestars for two years now and the improvement in his game has been remarkable. The coaches are professional, patient, and genuinely care about each child\'s development.' },
              { name: 'James T.', role: 'Parent, Edgbarrow School', text: 'The after-school tennis club has been brilliant for our daughter. She looks forward to it every week and has made great friends. The coaches make it fun while still teaching proper technique.' },
              { name: 'Rebecca L.', role: 'Parent, Holiday Camp', text: 'We\'ve sent both our children to the AceStars holiday camps for the past three summers. They absolutely love it. Great value, well organised, and the kids come home exhausted and happy!' },
            ].map((testimonial, i) => (
              <div key={i} className="rounded-2xl p-8 relative" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-4xl font-bold mb-4" style={{ color: '#dfd300' }}>&ldquo;</div>
                <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.7)' }}>{testimonial.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm" style={{ backgroundColor: '#dfd300', color: '#1E2333' }}>
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white">{testimonial.name}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with Photo */}
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
          <h2 className="text-4xl md:text-6xl font-bold mb-6 font-heading">Join Us Now!</h2>
          <h5 className="text-xl mb-8" style={{ color: '#AFB0B3' }}>
            Are you ready to take your tennis to the next level with us? Click below to find our booking form.
          </h5>
          <Link 
            href="/booking" 
            className="inline-flex items-center gap-2 hover:gap-3 px-10 py-4 rounded-full font-bold text-lg transition-all duration-300"
            style={{ backgroundColor: '#dfd300', color: '#1E2333' }}
          >
            Become Ace Now! <ChevronRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  )
}
