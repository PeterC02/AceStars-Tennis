'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Clock, MapPin, ChevronRight, Calendar, CheckCircle, Users, Zap, Trophy } from 'lucide-react'

// Programme to booking page ID mapping
const bookingIdMap: Record<string, string> = {
  'perf-girls': 'edg-perf-girls',
  'perf-boys': 'edg-perf-boys',
  'dev-y78': 'edg-dev-y78',
  'dev-y910': 'edg-dev-y910',
  'club-y7': 'edg-club-y7',
  'club-y8': 'edg-club-y8',
  'club-y910': 'edg-club-y910',
}

// Summer Term Time Programmes
const summerTermProgrammes = [
  {
    id: 'perf-girls',
    category: 'Performance',
    name: 'Performance Girls',
    day: 'Tuesday',
    time: '3:30pm - 5:30pm',
    duration: '2 hours',
    venue: 'Edgbarrow School',
    address: 'Grant Road, Crowthorne, Berkshire, RG45 7HZ',
    access: 'Invite Only',
    ageGroup: 'Selected Players',
    price: '£15 + VAT per session (£216 per term)',
    termPrice: '£216',
    sessionPrice: '£15 + VAT',
    sessions: 12,
    color: '#F87D4D',
    icon: 'trophy',
    highlights: ['2-hour intensive sessions', 'Match play & tactics', 'Competition preparation'],
  },
  {
    id: 'perf-boys',
    category: 'Performance',
    name: 'Performance Boys',
    day: 'Monday',
    time: '3:30pm - 5:30pm',
    duration: '2 hours',
    venue: 'Edgbarrow School',
    address: 'Grant Road, Crowthorne, Berkshire, RG45 7HZ',
    access: 'Invite Only',
    ageGroup: 'Selected Players',
    price: '£15 + VAT per session (£216 per term)',
    termPrice: '£216',
    sessionPrice: '£15 + VAT',
    sessions: 12,
    color: '#F87D4D',
    icon: 'trophy',
    highlights: ['2-hour intensive sessions', 'Match play & tactics', 'Competition preparation'],
  },
  {
    id: 'dev-y78',
    category: 'Development',
    name: 'Development Y7/8',
    day: 'Tuesday',
    time: '3:30pm - 4:30pm',
    duration: '1 hour',
    venue: 'Edgbarrow School',
    address: 'Grant Road, Crowthorne, Berkshire, RG45 7HZ',
    access: 'Invite Only',
    ageGroup: 'Year 7 & 8',
    price: '£10 + VAT per session (£144 per term)',
    termPrice: '£144',
    sessionPrice: '£10 + VAT',
    sessions: 12,
    color: '#65B863',
    icon: 'zap',
    highlights: ['Skill development focus', 'Stroke technique', 'Footwork & movement'],
  },
  {
    id: 'dev-y910',
    category: 'Development',
    name: 'Development Y9/10',
    day: 'Tuesday',
    time: '3:30pm - 4:30pm',
    duration: '1 hour',
    venue: 'Edgbarrow School',
    address: 'Grant Road, Crowthorne, Berkshire, RG45 7HZ',
    access: 'Invite Only',
    ageGroup: 'Year 9 & 10',
    price: '£10 + VAT per session (£144 per term)',
    termPrice: '£144',
    sessionPrice: '£10 + VAT',
    sessions: 12,
    color: '#65B863',
    icon: 'zap',
    highlights: ['Skill development focus', 'Stroke technique', 'Footwork & movement'],
  },
  {
    id: 'club-y7',
    category: 'AfterSchool Club',
    name: 'Y7 AfterSchool Club',
    day: 'Monday',
    time: '3:30pm - 4:20pm',
    duration: '50 mins',
    venue: 'Edgbarrow School',
    address: 'Grant Road, Crowthorne, Berkshire, RG45 7HZ',
    access: 'All Welcome',
    ageGroup: 'Year 7',
    price: '£6.50 inc VAT per session (£78 per term)',
    termPrice: '£78',
    sessionPrice: '£6.50 inc VAT',
    sessions: 12,
    color: '#dfd300',
    icon: 'users',
    highlights: ['Fun & social tennis', 'All abilities welcome', 'Great way to start'],
  },
  {
    id: 'club-y8',
    category: 'AfterSchool Club',
    name: 'Y8 AfterSchool Club',
    day: 'Thursday',
    time: '3:30pm - 4:20pm',
    duration: '50 mins',
    venue: 'Edgbarrow School',
    address: 'Grant Road, Crowthorne, Berkshire, RG45 7HZ',
    access: 'All Welcome',
    ageGroup: 'Year 8',
    price: '£6.50 inc VAT per session (£78 per term)',
    termPrice: '£78',
    sessionPrice: '£6.50 inc VAT',
    sessions: 12,
    color: '#dfd300',
    icon: 'users',
    highlights: ['Fun & social tennis', 'All abilities welcome', 'Great way to start'],
  },
  {
    id: 'club-y910',
    category: 'AfterSchool Club',
    name: 'Y9/10 AfterSchool Club',
    day: 'Wednesday',
    time: '3:30pm - 4:20pm',
    duration: '50 mins',
    venue: 'Edgbarrow School',
    address: 'Grant Road, Crowthorne, Berkshire, RG45 7HZ',
    access: 'All Welcome',
    ageGroup: 'Year 9 & 10',
    price: '£6.50 inc VAT per session (£78 per term)',
    termPrice: '£78',
    sessionPrice: '£6.50 inc VAT',
    sessions: 12,
    color: '#dfd300',
    icon: 'users',
    highlights: ['Fun & social tennis', 'All abilities welcome', 'Great way to start'],
  },
]

// Term Dates
const termDates = {
  term: 'Summer Term 2026',
  startDate: 'Monday 13th April',
  halfTerm: 'Monday 25th May - Friday 29th May',
  endDate: 'Friday 17th July',
}

type Programme = typeof summerTermProgrammes[0]

const categoryIcons: Record<string, React.ReactNode> = {
  'Performance': <Trophy size={22} />,
  'Development': <Zap size={22} />,
  'AfterSchool Club': <Users size={22} />,
}

const categoryDescriptions: Record<string, string> = {
  'Performance': 'Intensive coaching for selected players competing at county level and above.',
  'Development': 'Focused skill-building sessions for players looking to improve their game.',
  'AfterSchool Club': 'Fun, social tennis sessions open to all students - no experience needed!',
}

export default function ProgrammePage() {
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  const groupedProgrammes = summerTermProgrammes.reduce((acc, prog) => {
    if (!acc[prog.category]) acc[prog.category] = []
    acc[prog.category].push(prog)
    return acc
  }, {} as Record<string, Programme[]>)

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section 
        className="relative min-h-[70vh] flex items-center justify-center overflow-hidden"
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
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center pb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-heading">
            Programmes
          </h1>
          <p className="text-xl max-w-3xl mx-auto mb-10" style={{ color: '#AFB0B3' }}>
            Summer Term 2026 — Professional tennis coaching across all venues
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#programmes" className="btn-primary">View Programmes</a>
            <Link href="/programme/acestars?tab=camps" className="btn-secondary">Holiday Camps</Link>
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
                  Private School
                </span>
                <h4 className="text-2xl font-bold text-white mb-1">Ludgrove School</h4>
                <p className="text-sm text-white/80 mb-3">Boarding students only • Private 1-2-1 coaching</p>
                <div className="flex items-center gap-2 text-white/90 group-hover:text-white transition-all">
                  <span className="font-bold">View Programmes</span>
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Edgbarrow School */}
            <div 
              className="relative rounded-2xl overflow-hidden"
              style={{ border: '3px solid #dfd300', boxShadow: '0 0 20px rgba(223, 211, 0, 0.3)' }}
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
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3" style={{ backgroundColor: '#dfd300', color: '#1E2333' }}>
                  Currently Viewing
                </span>
                <h4 className="text-2xl font-bold text-white mb-1">Edgbarrow School</h4>
                <p className="text-sm text-white/80 mb-3">Students only • Performance & Development</p>
                <div className="flex items-center gap-2" style={{ color: '#dfd300' }}>
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
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3" style={{ backgroundColor: '#65B863', color: '#FFFFFF' }}>
                  Open to All
                </span>
                <h4 className="text-2xl font-bold text-white mb-1">AceStars Tennis</h4>
                <p className="text-sm text-white/80 mb-3">Everyone welcome • Term time & Holiday camps</p>
                <div className="flex items-center gap-2 text-white/90 group-hover:text-white transition-all">
                  <span className="font-bold">View Programmes</span>
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Summer Term Programmes */}
      <section id="programmes" className="py-16" style={{ backgroundColor: '#F7F9FA' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Term Dates Banner */}
            <div 
              className="rounded-2xl p-8 mb-12 relative overflow-hidden"
              style={{ backgroundColor: '#2E354E' }}
            >
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5" style={{ backgroundColor: '#dfd300', transform: 'translate(30%, -30%)' }}></div>
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar size={20} style={{ color: '#dfd300' }} />
                    <h3 className="text-2xl font-bold text-white">{termDates.term}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} style={{ color: '#AFB0B3' }} />
                    <p className="text-sm" style={{ color: '#AFB0B3' }}>Edgbarrow School, Crowthorne</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#dfd300' }}>Start</p>
                    <p className="text-sm font-medium text-white">{termDates.startDate}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#dfd300' }}>Half Term</p>
                    <p className="text-sm font-medium text-white">{termDates.halfTerm}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#dfd300' }}>End</p>
                    <p className="text-sm font-medium text-white">{termDates.endDate}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Programme Categories */}
            {Object.entries(groupedProgrammes).map(([category, programmes]) => (
              <div key={category} className="mb-14">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: programmes[0].color + '20', color: programmes[0].color }}>
                    {categoryIcons[category]}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold" style={{ color: '#1E2333' }}>{category}</h2>
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{ 
                          backgroundColor: programmes[0].access === 'Invite Only' ? '#F87D4D15' : '#65B86315',
                          color: programmes[0].access === 'Invite Only' ? '#F87D4D' : '#65B863',
                        }}
                      >
                        {programmes[0].access}
                      </span>
                    </div>
                    <p className="text-sm mt-1" style={{ color: '#676D82' }}>{categoryDescriptions[category]}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {programmes.map((prog) => {
                    const isExpanded = expandedCard === prog.id
                    return (
                      <div 
                        key={prog.id}
                        className="bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl group"
                        style={{ border: '1px solid #EAEDE6' }}
                        onMouseEnter={() => setExpandedCard(prog.id)}
                        onMouseLeave={() => setExpandedCard(null)}
                      >
                        <div className="h-1.5 transition-all duration-300" style={{ backgroundColor: prog.color, height: isExpanded ? '4px' : '6px' }}></div>
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-bold mb-1 group-hover:translate-x-0.5 transition-transform" style={{ color: '#1E2333' }}>{prog.name}</h3>
                              <p className="text-sm" style={{ color: '#676D82' }}>{prog.ageGroup}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2.5 mb-5">
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F7F9FA' }}>
                                <Calendar size={14} style={{ color: '#676D82' }} />
                              </div>
                              <span className="text-sm font-medium" style={{ color: '#1E2333' }}>{prog.day}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F7F9FA' }}>
                                <Clock size={14} style={{ color: '#676D82' }} />
                              </div>
                              <span className="text-sm font-medium" style={{ color: '#1E2333' }}>{prog.time} ({prog.duration})</span>
                            </div>
                          </div>

                          {/* Highlights */}
                          <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-32 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
                            <div className="space-y-1.5">
                              {prog.highlights.map((h, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <CheckCircle size={12} style={{ color: prog.color }} />
                                  <span className="text-xs" style={{ color: '#676D82' }}>{h}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="rounded-xl p-4 mb-5" style={{ backgroundColor: '#F7F9FA' }}>
                            <div className="flex items-baseline justify-between">
                              <div>
                                <p className="text-xs" style={{ color: '#676D82' }}>{prog.sessions} sessions × {prog.sessionPrice}</p>
                              </div>
                              <p className="text-xl font-bold" style={{ color: prog.color }}>{prog.termPrice}<span className="text-xs font-normal" style={{ color: '#676D82' }}>/term</span></p>
                            </div>
                          </div>

                          <Link 
                            href={`/booking?venue=edgbarrow&programme=${bookingIdMap[prog.id]}`}
                            className="block w-full py-3 rounded-full font-bold text-sm text-center transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                            style={{ backgroundColor: prog.color, color: prog.color === '#dfd300' ? '#1E2333' : '#FFFFFF' }}
                          >
                            Book Now <ChevronRight size={16} className="inline ml-1" />
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

      {/* CTA Section */}
      <section 
        className="relative py-24 text-white"
        style={{ 
          backgroundImage: 'url(/images/uploads/2019/02/9.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(46, 53, 78, 0.9)' }}></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-heading">Join Us Now!</h2>
          <h5 className="text-xl mb-8" style={{ color: '#AFB0B3' }}>
            Ready to take your tennis to the next level? Book your place today!
          </h5>
          <Link 
            href="/contact" 
            className="inline-flex items-center gap-2 hover:gap-3 px-10 py-4 rounded-full font-bold text-lg transition-all duration-300"
            style={{ backgroundColor: '#dfd300', color: '#1E2333' }}
          >
            Contact Us <ChevronRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  )
}
