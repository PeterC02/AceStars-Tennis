'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X, ChevronRight } from 'lucide-react'

const coaches = [
  {
    id: 1,
    name: 'Wojtek Specylak',
    title: 'Head Coach',
    role: 'RPT National Master Professional',
    image: '/images/uploads/2020/02/wojtek-400.png',
    description: `Wojtek is an RPT National Master Professional and the founder of Acestars Tennis Coaching. With over 20 years of coaching experience, he has worked with players of all levels from beginners to international competitors. Wojtek has trained at some of the world's most prestigious tennis academies including Sanchez Casal Academy in Barcelona, Piper Sands in Florida, and Annabel Croft Tennis Academy in Tenerife. He holds a Masters in Individual Sports Psychology and a PhD in Fitness, bringing a unique scientific approach to tennis coaching. Wojtek is passionate about developing young talent and has helped numerous players achieve county, national, and international success.`,
  },
  {
    id: 2,
    name: 'Peter Collier',
    title: 'Operations Director',
    role: 'Operations Director',
    image: '/images/uploads/2020/02/don-400.png',
    description: `Peter is the Operations Director at Acestars Tennis Coaching, responsible for overseeing the day-to-day operations and ensuring the smooth running of all coaching programmes across our venues. With a strong background in sports management and business operations, Peter plays a crucial role in coordinating schedules, managing venue relationships, and supporting our coaching team. His organisational skills and dedication help ensure that every player receives a high-quality tennis experience.`,
  },
  {
    id: 3,
    name: 'Andy Fryatt',
    title: 'Coach',
    role: 'Head Coach at Iver Heath Tennis Club',
    image: '/images/uploads/2020/06/lewis.png',
    description: `Andy is Head Coach at Iver Heath Tennis Club and a Coach at Crowthorne Tennis Club with LTA & PTR experience. He works with juniors, adults of all standards and individually with county juniors in taking their game up to the next level. He offers guidance and mentoring. He is also an LTA Tournament Organiser. Andy is County Captain for the Berkshire Over 45 Team and plays in the national and Berkshire leagues. He holds an LTA rating of 3.2, he is also very active on the ITF Seniors & LTA Ratings circuit.`,
  },
  {
    id: 4,
    name: 'Tom Mawby',
    title: 'Coach',
    role: 'LTA Accredited Coach',
    image: '/images/uploads/2020/02/wojtek-400.png',
    description: `Tom is an LTA accredited coach with a passion for developing players of all ages and abilities. He brings enthusiasm and energy to every session, creating a positive and encouraging learning environment. Tom has experience coaching at both club and school level, and is committed to helping players improve their technical skills while enjoying the game. His friendly approach makes him popular with juniors and adults alike.`,
  },
  {
    id: 5,
    name: 'Oliver Walker',
    title: 'Coach',
    role: 'Head Coach at Farnborough Tennis Club',
    image: '/images/uploads/2020/02/don-400.png',
    description: `Oliver is the Head Coach at Farnborough Tennis Club. He is an LTA accredited coach with extensive experience working with players of all levels. Oliver has a strong focus on technical development and match play tactics, helping players build a solid foundation while developing their competitive edge. He is passionate about junior development and has helped many young players progress through the ranks.`,
  },
  {
    id: 6,
    name: 'Jake Griffiths',
    title: 'Coach',
    role: 'LTA Accredited Coach',
    image: '/images/uploads/2020/06/lewis.png',
    description: `Jake is an LTA accredited coach who brings a dynamic and engaging coaching style to Acestars. With experience in both individual and group coaching, Jake excels at adapting his approach to suit each player's needs and goals. He has a particular talent for working with junior players, helping them develop not only their tennis skills but also their confidence and love for the sport.`,
  },
  {
    id: 7,
    name: 'James Newman',
    title: 'Coach',
    role: 'LTA Accredited Coach',
    image: '/images/uploads/2020/02/wojtek-400.png',
    description: `James is an LTA accredited coach with a wealth of experience in tennis coaching. He is dedicated to helping players of all ages and abilities improve their game through structured, enjoyable sessions. James has a keen eye for technique and works closely with players to refine their strokes and develop their tactical awareness. His patient and supportive coaching style makes learning tennis an enjoyable experience.`,
  },
]

export default function TeamPage() {
  const [selectedCoach, setSelectedCoach] = useState<typeof coaches[0] | null>(null)

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
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-heading">
            The Team
          </h1>
          <h5 className="text-xl max-w-3xl mx-auto" style={{ color: '#AFB0B3' }}>
            Meet our team of qualified and experienced tennis coaches
          </h5>
        </div>
      </section>

      {/* Team Grid Section */}
      <section className="py-24" style={{ backgroundColor: '#F7F9FA' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-8">
            <span className="section-number">01</span>
            <span className="section-line"></span>
            <span style={{ color: '#1E2333' }} className="font-semibold uppercase tracking-wider text-sm">Our Coaches</span>
          </div>
          <h2 className="text-4xl font-bold mb-12" style={{ color: '#1E2333' }}>Meet The Team</h2>

          {/* Row 1: Wojtek & Peter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 max-w-4xl mx-auto">
            {coaches.slice(0, 2).map((coach) => (
              <div
                key={coach.id}
                onClick={() => setSelectedCoach(coach)}
                className="relative min-h-[420px] rounded-lg overflow-hidden cursor-pointer group"
                style={{ 
                  border: '1px solid #EAEDE6',
                  backgroundColor: '#F7F9FA',
                  boxShadow: '0 2px 16px 0 rgba(46, 53, 78, 0.05)',
                }}
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${coach.image})` }}
                ></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent">
                  <p className="text-sm text-right mb-4" style={{ color: '#AFB0B3' }}>{coach.title}</p>
                  <h3 className="text-xl font-bold" style={{ color: '#1E2333' }}>{coach.name}</h3>
                </div>
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-95 transition-opacity duration-300 p-6 flex flex-col justify-center"
                  style={{ backgroundColor: '#65B863' }}
                >
                  <h3 className="text-2xl font-bold text-white mb-2">{coach.name}</h3>
                  <p className="text-sm font-bold mb-4" style={{ color: '#2E354E' }}>{coach.role}</p>
                  <p className="text-sm text-white line-clamp-6">{coach.description.substring(0, 200)}...</p>
                  <button className="mt-4 px-6 py-2 rounded-full font-bold text-sm border-2 border-white text-white hover:bg-white hover:text-green-600 transition-all self-start">
                    Read More
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Row 2: Andy & Tom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 max-w-4xl mx-auto">
            {coaches.slice(2, 4).map((coach) => (
              <div
                key={coach.id}
                onClick={() => setSelectedCoach(coach)}
                className="relative min-h-[380px] rounded-lg overflow-hidden cursor-pointer group"
                style={{ 
                  border: '1px solid #EAEDE6',
                  backgroundColor: '#F7F9FA',
                  boxShadow: '0 2px 16px 0 rgba(46, 53, 78, 0.05)',
                }}
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${coach.image})` }}
                ></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent">
                  <p className="text-sm text-right mb-4" style={{ color: '#AFB0B3' }}>{coach.title}</p>
                  <h3 className="text-xl font-bold" style={{ color: '#1E2333' }}>{coach.name}</h3>
                </div>
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-95 transition-opacity duration-300 p-6 flex flex-col justify-center"
                  style={{ backgroundColor: '#65B863' }}
                >
                  <h3 className="text-2xl font-bold text-white mb-2">{coach.name}</h3>
                  <p className="text-sm font-bold mb-4" style={{ color: '#2E354E' }}>{coach.role}</p>
                  <p className="text-sm text-white line-clamp-6">{coach.description.substring(0, 200)}...</p>
                  <button className="mt-4 px-6 py-2 rounded-full font-bold text-sm border-2 border-white text-white hover:bg-white hover:text-green-600 transition-all self-start">
                    Read More
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Row 3: Oliver, Jake & James */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coaches.slice(4).map((coach) => (
              <div
                key={coach.id}
                onClick={() => setSelectedCoach(coach)}
                className="relative min-h-[400px] rounded-lg overflow-hidden cursor-pointer group"
                style={{ 
                  border: '1px solid #EAEDE6',
                  backgroundColor: '#F7F9FA',
                  boxShadow: '0 2px 16px 0 rgba(46, 53, 78, 0.05)',
                }}
              >
                {/* Coach Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${coach.image})` }}
                ></div>
                
                {/* Default Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent">
                  <p className="text-sm text-right mb-4" style={{ color: '#AFB0B3' }}>{coach.title}</p>
                  <h3 className="text-xl font-bold" style={{ color: '#1E2333' }}>{coach.name}</h3>
                </div>

                {/* Hover Overlay */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-95 transition-opacity duration-300 p-6 flex flex-col justify-center"
                  style={{ backgroundColor: '#65B863' }}
                >
                  <h3 className="text-2xl font-bold text-white mb-2">{coach.name}</h3>
                  <p className="text-sm font-bold mb-4" style={{ color: '#2E354E' }}>{coach.role}</p>
                  <p className="text-sm text-white line-clamp-6">{coach.description.substring(0, 200)}...</p>
                  <button 
                    className="mt-4 px-6 py-2 rounded-full font-bold text-sm border-2 border-white text-white hover:bg-white hover:text-green-600 transition-all self-start"
                  >
                    Read More
                  </button>
                </div>
              </div>
            ))}
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

      {/* Modal Popup */}
      {selectedCoach && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCoach(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70"></div>
          
          {/* Modal Content */}
          <div 
            className="relative bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedCoach(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center z-10 hover:bg-gray-100 transition-colors"
              style={{ backgroundColor: '#F7F9FA' }}
            >
              <X size={24} style={{ color: '#1E2333' }} />
            </button>

            {/* Header with Image */}
            <div 
              className="relative h-64 bg-cover bg-center"
              style={{ 
                backgroundImage: `url(${selectedCoach.image})`,
                backgroundColor: '#65B863'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
            </div>

            {/* Content */}
            <div className="p-8 -mt-16 relative">
              <div 
                className="inline-block px-4 py-1 rounded-full text-sm font-bold mb-4"
                style={{ backgroundColor: '#65B863', color: 'white' }}
              >
                {selectedCoach.title}
              </div>
              <h2 className="text-3xl font-bold mb-2" style={{ color: '#1E2333' }}>{selectedCoach.name}</h2>
              <p className="text-lg mb-6" style={{ color: '#676D82' }}>{selectedCoach.role}</p>
              <div className="prose max-w-none">
                <p style={{ color: '#676D82', lineHeight: '1.8' }}>{selectedCoach.description}</p>
              </div>
              
              {/* Contact Button */}
              <div className="mt-8 pt-6" style={{ borderTop: '1px solid #EAEDE6' }}>
                <Link 
                  href="/contact"
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all"
                  style={{ backgroundColor: '#dfd300', color: '#1E2333' }}
                >
                  Get in Touch <ChevronRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
