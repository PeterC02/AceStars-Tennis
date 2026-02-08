'use client'

import Link from 'next/link'
import { Clock, MapPin, ChevronRight, Calendar, CheckCircle, Users, Star } from 'lucide-react'

const edgbarrowTermDates = {
  term: 'Summer Term 2026',
  venue: 'Edgbarrow School',
  address: 'Grant Road, Crowthorne, Berkshire, RG45 7HZ',
  startDate: 'Week commencing 20th April 2026',
  halfTerm: '25th May - 29th May 2026',
  endDate: 'Week ending 17th July 2026',
}

const edgbarrowProgrammes = [
  {
    id: 'perf-girls',
    category: 'Performance Programme',
    name: 'Performance Girls',
    day: 'Tuesday',
    time: '3:30pm - 5:30pm',
    venue: 'Edgbarrow School',
    address: 'Grant Road, Crowthorne, Berkshire, RG45 7HZ',
    access: 'By Selection',
    ageGroup: 'Selected Girls',
    description: 'High-intensity performance coaching for selected female players. Focus on match play, tactical awareness, and competitive preparation.',
    pricePerTerm: 180,
    vatRate: 20,
    totalWithVAT: 216,
    sessions: 12,
    color: '#E91E8C',
  },
  {
    id: 'perf-boys',
    category: 'Performance Programme',
    name: 'Performance Boys',
    day: 'Monday',
    time: '3:30pm - 5:30pm',
    venue: 'Edgbarrow School',
    address: 'Grant Road, Crowthorne, Berkshire, RG45 7HZ',
    access: 'By Selection',
    ageGroup: 'Selected Boys',
    description: 'High-intensity performance coaching for selected male players. Focus on match play, tactical awareness, and competitive preparation.',
    pricePerTerm: 180,
    vatRate: 20,
    totalWithVAT: 216,
    sessions: 12,
    color: '#3B82F6',
  },
  {
    id: 'dev-y78',
    category: 'Development Programme',
    name: 'Development Y7/8',
    day: 'Tuesday',
    time: '3:30pm - 4:30pm',
    venue: 'Edgbarrow School',
    address: 'Grant Road, Crowthorne, Berkshire, RG45 7HZ',
    access: 'Open to All Y7/8',
    ageGroup: 'Year 7 & 8',
    description: 'Development programme for Year 7 and 8 students. Building core tennis skills, footwork, and rally consistency.',
    pricePerTerm: 120,
    vatRate: 20,
    totalWithVAT: 144,
    sessions: 12,
    color: '#65B863',
  },
  {
    id: 'dev-y910',
    category: 'Development Programme',
    name: 'Development Y9/10',
    day: 'Tuesday',
    time: '3:30pm - 4:30pm',
    venue: 'Edgbarrow School',
    address: 'Grant Road, Crowthorne, Berkshire, RG45 7HZ',
    access: 'Open to All Y9/10',
    ageGroup: 'Year 9 & 10',
    description: 'Development programme for Year 9 and 10 students. Advancing technique, introducing tactical play and match situations.',
    pricePerTerm: 120,
    vatRate: 20,
    totalWithVAT: 144,
    sessions: 12,
    color: '#F59E0B',
  },
  {
    id: 'club-y7',
    category: 'AfterSchool Club',
    name: 'Y7 AfterSchool Club',
    day: 'Monday',
    time: '3:30pm - 4:20pm',
    venue: 'Edgbarrow School',
    address: 'Grant Road, Crowthorne, Berkshire, RG45 7HZ',
    access: 'Open to All Y7',
    ageGroup: 'Year 7',
    description: 'Fun, social tennis club for Year 7 students. Perfect introduction to tennis in a relaxed after-school setting.',
    pricePerTerm: 65,
    vatRate: 20,
    totalWithVAT: 78,
    sessions: 12,
    color: '#8B5CF6',
  },
  {
    id: 'club-y8',
    category: 'AfterSchool Club',
    name: 'Y8 AfterSchool Club',
    day: 'Thursday',
    time: '3:30pm - 4:20pm',
    venue: 'Edgbarrow School',
    address: 'Grant Road, Crowthorne, Berkshire, RG45 7HZ',
    access: 'Open to All Y8',
    ageGroup: 'Year 8',
    description: 'Fun, social tennis club for Year 8 students. Building on fundamentals with games and friendly competition.',
    pricePerTerm: 65,
    vatRate: 20,
    totalWithVAT: 78,
    sessions: 12,
    color: '#EC4899',
  },
  {
    id: 'club-y910',
    category: 'AfterSchool Club',
    name: 'Y9/10 AfterSchool Club',
    day: 'Wednesday',
    time: '3:30pm - 4:20pm',
    venue: 'Edgbarrow School',
    address: 'Grant Road, Crowthorne, Berkshire, RG45 7HZ',
    access: 'Open to All Y9/10',
    ageGroup: 'Year 9 & 10',
    description: 'Social tennis club for Year 9 and 10 students. Mix of drills, games, and match play in a fun environment.',
    pricePerTerm: 65,
    vatRate: 20,
    totalWithVAT: 78,
    sessions: 12,
    color: '#14B8A6',
  },
]

type EdgbarrowProgramme = typeof edgbarrowProgrammes[0]

export default function EdgbarrowProgrammePage() {
  const groupedProgrammes = edgbarrowProgrammes.reduce((acc, prog) => {
    if (!acc[prog.category]) acc[prog.category] = []
    acc[prog.category].push(prog)
    return acc
  }, {} as Record<string, EdgbarrowProgramme[]>)

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section 
        className="relative min-h-[50vh] flex items-center justify-center overflow-hidden"
        style={{ 
          backgroundImage: 'url(https://www.edgbarrowschool.co.uk/wp-content/uploads/2023/09/Edgbarrow-School-July-2023-45-1024x683.jpg)',
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
            Programme
          </h1>
          <h5 className="text-xl max-w-3xl mx-auto mb-8" style={{ color: '#AFB0B3' }}>
            Summer Term 2026 - Tennis Coaching at Edgbarrow School
          </h5>
          <div className="flex justify-center gap-4">
            <a href="#programmes" className="btn-primary">View Programmes</a>
            <Link href="/programme" className="btn-secondary">Back to All Venues</Link>
          </div>
        </div>
      </section>

      {/* Venue Selection */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold mb-2" style={{ color: '#1E2333' }}>Select Your Venue</h3>
            <p style={{ color: '#676D82' }}>Choose a venue to view available programmes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Ludgrove School */}
            <Link 
              href="/programme/ludgrove"
              className="relative rounded-2xl overflow-hidden cursor-pointer group transition-all hover:shadow-2xl hover:-translate-y-1"
              style={{ border: '2px solid #EAEDE6' }}
            >
              <div 
                className="h-64"
                style={{ 
                  backgroundImage: 'url(https://www.ludgroveschool.co.uk/wp-content/uploads/2023/03/Ludgrove-School-March-2023-101-scaled.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:from-black/95 transition-all"></div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3" style={{ backgroundColor: '#F87D4D', color: '#FFFFFF' }}>
                  Boarding School
                </span>
                <h4 className="text-2xl font-bold text-white mb-1">Ludgrove School</h4>
                <p className="text-sm text-white/80 mb-3">Boarding students only &bull; Private 1-2-1 coaching</p>
                <div className="flex items-center gap-2 text-white/90 group-hover:text-white transition-all">
                  <span className="font-bold">View Programmes</span>
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Edgbarrow School - Selected */}
            <div 
              className="relative rounded-2xl overflow-hidden"
              style={{ border: '3px solid #65B863', boxShadow: '0 0 20px rgba(101, 184, 99, 0.3)' }}
            >
              <div 
                className="h-64"
                style={{ 
                  backgroundImage: 'url(https://www.edgbarrowschool.co.uk/wp-content/uploads/2023/09/Edgbarrow-School-July-2023-45-1024x683.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3" style={{ backgroundColor: '#65B863', color: '#FFFFFF' }}>
                  Currently Viewing
                </span>
                <h4 className="text-2xl font-bold text-white mb-1">Edgbarrow School</h4>
                <p className="text-sm text-white/80 mb-3">Students only &bull; Performance &amp; Development</p>
                <div className="flex items-center gap-2" style={{ color: '#65B863' }}>
                  <span className="font-bold">Selected</span>
                  <CheckCircle size={18} />
                </div>
              </div>
            </div>

            {/* AceStars Tennis */}
            <Link 
              href="/programme/acestars"
              className="relative rounded-2xl overflow-hidden cursor-pointer group transition-all hover:shadow-2xl hover:-translate-y-1"
              style={{ border: '2px solid #EAEDE6' }}
            >
              <div 
                className="h-64"
                style={{ 
                  backgroundImage: 'url(/images/uploads/2019/02/9.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:from-black/95 transition-all"></div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3" style={{ backgroundColor: '#dfd300', color: '#1E2333' }}>
                  Open to All
                </span>
                <h4 className="text-2xl font-bold text-white mb-1">AceStars Tennis</h4>
                <p className="text-sm text-white/80 mb-3">Everyone welcome &bull; Term time &amp; Holiday camps</p>
                <div className="flex items-center gap-2 text-white/90 group-hover:text-white transition-all">
                  <span className="font-bold">View Programmes</span>
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Term Info */}
      <section className="py-8" style={{ backgroundColor: '#F7F9FA' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4" style={{ backgroundColor: '#FFF', border: '1px solid #EAEDE6' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(101,184,99,0.1)' }}>
                <Calendar size={20} style={{ color: '#65B863' }} />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: '#1E2333' }}>{edgbarrowTermDates.term}</p>
                <p className="text-xs" style={{ color: '#676D82' }}>{edgbarrowTermDates.venue}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(101,184,99,0.1)' }}>
                <MapPin size={20} style={{ color: '#65B863' }} />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: '#1E2333' }}>{edgbarrowTermDates.address}</p>
                <p className="text-xs" style={{ color: '#676D82' }}>Half Term: {edgbarrowTermDates.halfTerm}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Programmes */}
      <section id="programmes" className="py-16" style={{ backgroundColor: '#F7F9FA' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {Object.entries(groupedProgrammes).map(([category, progs]) => (
            <div key={category} className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <span className="section-number" style={{ color: '#65B863' }}>
                  {category === 'Performance Programme' ? '01' : category === 'Development Programme' ? '02' : '03'}
                </span>
                <span className="section-line" style={{ backgroundColor: '#65B863' }}></span>
                <h2 className="text-2xl font-bold" style={{ color: '#1E2333' }}>{category}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {progs.map((prog) => (
                  <div key={prog.id} className="rounded-2xl overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1" style={{ backgroundColor: '#FFF', border: '1px solid #EAEDE6' }}>
                    <div className="h-2" style={{ backgroundColor: prog.color }}></div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold mb-1" style={{ color: '#1E2333' }}>{prog.name}</h3>
                          <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold" style={{ backgroundColor: `${prog.color}15`, color: prog.color }}>
                            {prog.access}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm mb-4" style={{ color: '#676D82' }}>{prog.description}</p>

                      <div className="space-y-2 mb-5">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock size={14} style={{ color: '#65B863' }} />
                          <span style={{ color: '#676D82' }}>{prog.day} &bull; {prog.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users size={14} style={{ color: '#65B863' }} />
                          <span style={{ color: '#676D82' }}>{prog.ageGroup}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Star size={14} style={{ color: '#65B863' }} />
                          <span style={{ color: '#676D82' }}>{prog.sessions} sessions per term</span>
                        </div>
                      </div>

                      <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: '#F7F9FA' }}>
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: '#676D82' }}>Price per term</p>
                            <p className="text-2xl font-bold" style={{ color: '#1E2333' }}>&pound;{prog.totalWithVAT}</p>
                          </div>
                          <p className="text-xs" style={{ color: '#AFB0B3' }}>inc. VAT (&pound;{prog.pricePerTerm} + VAT)</p>
                        </div>
                      </div>

                      <Link
                        href={`/booking?venue=edgbarrow&programme=edg-${prog.id.replace('perf-', 'perf-').replace('dev-', 'dev-').replace('club-', 'club-')}`}
                        className="block w-full py-3 rounded-xl font-bold text-sm text-center text-white transition-all hover:scale-[1.02] hover:shadow-lg"
                        style={{ backgroundColor: '#65B863' }}
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary via-primary-dark to-primary text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-heading">Ready to Play?</h2>
          <p className="text-xl text-white/80 mb-8">
            Join our tennis programmes at Edgbarrow School and take your game to the next level.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/booking?venue=edgbarrow" className="bg-accent hover:bg-accent-dark text-white px-10 py-4 rounded-full font-semibold text-lg transition-all duration-300 inline-flex items-center gap-2 hover:gap-3">
              Book Now <ChevronRight size={20} />
            </Link>
            <Link href="/contact" className="btn-secondary text-lg">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
