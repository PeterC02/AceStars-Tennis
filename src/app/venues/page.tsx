'use client'

import Link from 'next/link'
import { ChevronRight, ExternalLink } from 'lucide-react'

const clubs = [
  {
    name: 'Iver Heath Tennis Club',
    location: 'Iver Heath',
    address: 'The Recreation Ground, Church Road, Iver Heath, SL0 0RW',
    website: 'http://www.ihltc.co.uk',
    image: '/images/uploads/2019/02/12.jpg',
  },
  {
    name: 'AceStars Community Tennis Club',
    location: 'Coming Soon',
    address: 'Location to be announced',
    website: '',
    comingSoon: true,
    image: '/images/uploads/2019/02/9.jpg',
  },
  {
    name: "Buckler's Park Courts",
    location: 'Crowthorne',
    address: 'Crowthorne, Berkshire',
    website: '',
    image: '/images/uploads/2019/02/10.jpg',
  },
  {
    name: 'Sandhurst Memorial Park Courts',
    location: 'Sandhurst',
    address: 'Yorktown Road, Sandhurst, Berkshire, GU47 9BJ',
    website: '',
    image: '/images/uploads/2019/02/11.jpg',
  },
]

const schools = [
  { 
    name: 'Ludgrove School', 
    location: 'Wokingham',
    address: 'Ludgrove, Wokingham, Berkshire, RG40 3AB',
    image: '/images/schools/ludgrove.svg',
    programme: '/programme/ludgrove',
  },
  { 
    name: 'Edgbarrow School', 
    location: 'Crowthorne',
    address: 'Grant Road, Crowthorne, Berkshire, RG45 7HZ',
    image: '/images/schools/edgbarrow.svg',
    programme: '/programme/edgbarrow',
  },
  { 
    name: 'Yateley Manor', 
    location: 'Yateley',
    address: '51 Reading Road, Yateley, GU46 7UQ',
    image: '/images/schools/yateley-manor.svg',
    programme: '',
  },
  { 
    name: 'Nine Mile Ride Junior School', 
    location: 'Wokingham',
    address: '430 Finchampstead Rd, Finchampstead, Wokingham, RG40 3RB',
    image: '/images/schools/nine-mile-ride.svg',
    programme: '',
  },
  { 
    name: 'Luckley House School', 
    location: 'Wokingham',
    address: 'Luckley Road, Wokingham, Berkshire, RG40 3EU',
    image: '/images/schools/luckley-house.svg',
    programme: '',
  },
  { 
    name: 'C of E Primary School', 
    location: 'Crowthorne',
    address: "Duke\u2019s Ride, Crowthorne RG45 6ND",
    image: '/images/schools/cofe-primary.svg',
    programme: '',
  },
  { 
    name: 'Oaklands Junior School', 
    location: 'Wokingham',
    address: 'Butler Rd, Crowthorne RG45 6QZ',
    image: '/images/schools/oaklands-junior.svg',
    programme: '',
  },
  { 
    name: "Our Lady\u2019s Preparatory School", 
    location: 'Crowthorne',
    address: '19 The Avenue, Crowthorne RG45 6PB',
    image: '/images/schools/our-ladys-prep.svg',
    programme: '',
  },
]

export default function VenuesPage() {
  return (
    <div className="pt-20">
      {/* Hero Section - Banner with wave */}
      <section 
        className="relative min-h-[60vh] flex items-center justify-center"
        style={{ 
          backgroundImage: 'url(/images/uploads/2019/03/Depositphotos_115174380_xl-2015-wide-outlined.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(30, 35, 51, 0.7)' }}></div>
        <div className="wave-bottom" style={{ backgroundImage: "url('/images/wave-2.svg')" }}></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-heading">
            Where we Coach
          </h1>
          <h5 className="text-xl max-w-3xl mx-auto" style={{ color: '#676D82' }}>
            Acestars have been providing tennis coaching in schools & clubs covering Berkshire, Hampshire & Surrey.
          </h5>
          <div className="flex justify-center gap-4 mt-8">
            <a href="#clubs" className="btn-primary">Our Clubs</a>
            <a href="#schools" className="btn-secondary">Our Schools</a>
          </div>
        </div>
      </section>

      {/* Clubs Section */}
      <section id="clubs" className="py-24" style={{ backgroundColor: '#F7F9FA' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-8">
            <span className="section-number">01</span>
            <span className="section-line"></span>
            <span style={{ color: '#1E2333' }} className="font-semibold uppercase tracking-wider text-sm">Clubs / Satellite Venues</span>
          </div>
          <h2 className="section-title mb-4">Our Clubs / Satellite Venues</h2>
          <p className="section-subtitle mb-12">
            Acestars is a well-established professional tennis coaching school, operating in the home counties of Hampshire, Berkshire and Surrey. We currently coach at various clubs and school centres.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {clubs.map((club, index) => (
              <div 
                key={index} 
                className="relative min-h-[350px] rounded-lg overflow-hidden group"
                style={{ 
                  backgroundImage: `url(${club.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/90 via-primary-dark/50 to-transparent"></div>
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <p className="text-sm mb-1" style={{ color: '#AFB0B3' }}>{club.location}</p>
                  <h3 className="text-2xl font-bold mb-2 font-heading">{club.name}</h3>
                  <p className="text-sm mb-4" style={{ color: '#F9FAF7' }}>{club.address}</p>
                  {'comingSoon' in club && club.comingSoon && (
                    <span className="inline-block px-3 py-1 mb-4 text-xs font-bold rounded-full" style={{ backgroundColor: '#dfd300', color: '#1E2333' }}>Coming Soon</span>
                  )}
                  <div className="flex gap-4">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(club.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-sm font-bold rounded-full border-2 border-white hover:bg-white hover:text-primary-dark transition-all"
                    >
                      Directions
                    </a>
                    {club.website && (
                      <a
                        href={club.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 text-sm font-bold rounded-full border-2 border-white hover:bg-white hover:text-primary-dark transition-all inline-flex items-center gap-1"
                      >
                        Website <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schools Section */}
      <section id="schools" className="py-24" style={{ backgroundColor: '#F7F9FA' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-8">
            <span className="section-number">02</span>
            <span className="section-line"></span>
            <span style={{ color: '#1E2333' }} className="font-semibold uppercase tracking-wider text-sm">Our Schools</span>
          </div>
          <h3 className="text-3xl font-bold mb-12" style={{ color: '#1E2333' }}>Our Schools</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {schools.map((school, index) => {
              const CardWrapper = school.programme ? Link : 'div'
              const cardProps = school.programme ? { href: school.programme } : {}
              return (
                <CardWrapper
                  key={index}
                  {...cardProps as any}
                  className="rounded-2xl overflow-hidden bg-white transition-all hover:shadow-xl hover:-translate-y-1 group"
                  style={{ border: '1px solid #EAEDE6' }}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={school.image}
                      alt={school.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/images/uploads/2019/02/9.jpg' }}
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-sm mb-1" style={{ color: '#676D82' }}>{school.location}</p>
                    <h3 className="text-lg font-bold mb-2 font-heading" style={{ color: '#1E2333' }}>{school.name}</h3>
                    <p className="text-sm" style={{ color: '#676D82' }}>{school.address}</p>
                    {school.programme && (
                      <div className="flex items-center gap-1 mt-3 text-sm font-bold" style={{ color: '#F87D4D' }}>
                        View Programme <ChevronRight size={16} />
                      </div>
                    )}
                  </div>
                </CardWrapper>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 text-white" style={{ backgroundColor: '#2E354E' }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-heading">Join Us Now!</h2>
          <h5 className="text-xl mb-8" style={{ color: '#676D82' }}>
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
