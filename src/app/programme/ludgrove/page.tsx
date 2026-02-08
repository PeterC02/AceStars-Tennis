'use client'

import Link from 'next/link'
import { Clock, MapPin, ChevronRight, Calendar, CheckCircle, AlertCircle, Star } from 'lucide-react'

// Ludgrove Term Dates
const ludgroveTermDates = {
  term: 'Summer Term 2026',
  venue: 'Ludgrove School',
  address: 'Ludgrove, Wokingham, Berkshire, RG40 3AB',
  startDate: 'Wednesday 22nd April 12 noon',
  halfTerm: 'Friday 22nd May - Monday 1st June 8:30am',
  endDate: 'Thursday 2nd July 12 noon',
}

// Ludgrove Programmes - matching Edgbarrow format
const ludgroveProgrammes = [
  {
    id: 'standard-121',
    category: 'Private Coaching',
    name: 'Weekly Private 1-2-1 Coaching',
    day: 'Weekly',
    time: 'Scheduled per child',
    venue: 'Ludgrove School',
    address: 'Ludgrove, Wokingham, Berkshire, RG40 3AB',
    access: 'Standard Package',
    ageGroup: 'All Years',
    description: 'Weekly private coaching sessions throughout the term. 9 lessons for Summer Term 2026.',
    pricePerLesson: 30,
    vatRate: 20,
    totalLessons: 9,
    paymentTerms: 'Payment is required upfront for this package. Invoices will be issued on Monday 20th April 2026.',
    paymentNote: 'Payment must be received within 7 days of invoice issue to guarantee your child\'s space and ensure uninterrupted service.',
    color: '#F87D4D',
  },
  {
    id: 'additional-121',
    category: 'Private Coaching',
    name: 'Additional Private 1-2-1 Coaching',
    day: 'Weekly',
    time: 'Subject to availability',
    venue: 'Ludgrove School',
    address: 'Ludgrove, Wokingham, Berkshire, RG40 3AB',
    access: 'Optional Add-On',
    ageGroup: 'All Years',
    description: 'We will endeavour to provide an additional weekly lesson. However, due to occasional coach or court unavailability, the total number of sessions may vary slightly.',
    pricePerLesson: 30,
    vatRate: 20,
    totalLessons: null,
    paymentTerms: 'A separate invoice will be issued at the end of term for this service.',
    paymentNote: 'Payment must be made within 7 days of invoice being sent.',
    color: '#65B863',
  },
  {
    id: 'sunday-clinic',
    category: 'Private Coaching',
    name: 'Sunday Invite Only Tennis Clinic',
    day: 'Sunday (Non-Exeat)',
    time: '2:30pm - 3:30pm',
    venue: 'Ludgrove School',
    address: 'Ludgrove, Wokingham, Berkshire, RG40 3AB',
    access: 'Invite Only',
    ageGroup: 'Selected Players',
    description: 'Exclusive Sunday clinic sessions for invited players. Typically 4-5 clinics per term on non-exeat Sundays.',
    pricePerLesson: 15,
    vatRate: 20,
    totalLessons: 5,
    paymentTerms: 'Clinic sessions will be included in the same invoice as Standard 1-2-1 lessons, issued on Monday 20th April 2026.',
    paymentNote: 'Payment must be received within 7 days of invoice issue.',
    color: '#dfd300',
  },
]

type LudgroveProgramme = typeof ludgroveProgrammes[0]


export default function LudgroveProgrammePage() {
  const calculateTotal = (prog: LudgroveProgramme) => {
    if (!prog.pricePerLesson || !prog.totalLessons) return null
    const subtotal = prog.pricePerLesson * prog.totalLessons
    const vat = subtotal * (prog.vatRate / 100)
    return { subtotal, vat, total: subtotal + vat }
  }

  const groupedProgrammes = ludgroveProgrammes.reduce((acc, prog) => {
    if (!acc[prog.category]) acc[prog.category] = []
    acc[prog.category].push(prog)
    return acc
  }, {} as Record<string, LudgroveProgramme[]>)

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section 
        className="relative min-h-[50vh] flex items-center justify-center overflow-hidden"
        style={{ 
          backgroundImage: 'url(/images/schools/ludgrove.svg)',
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
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-heading">
            Programme
          </h1>
          <h5 className="text-xl max-w-3xl mx-auto mb-8" style={{ color: '#AFB0B3' }}>
            Summer Term 2026 - Private Tennis Coaching at Ludgrove School
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
            {/* Ludgrove School - Selected */}
            <div 
              className="relative rounded-2xl overflow-hidden"
              style={{ border: '3px solid #dfd300', boxShadow: '0 0 20px rgba(223, 211, 0, 0.3)' }}
            >
              <div 
                className="h-64"
                style={{ 
                  backgroundImage: 'url(/images/schools/ludgrove.svg)',
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
                <h4 className="text-2xl font-bold text-white mb-1">Ludgrove School</h4>
                <p className="text-sm text-white/80 mb-3">Boarding students only • Private 1-2-1 coaching</p>
                <div className="flex items-center gap-2" style={{ color: '#dfd300' }}>
                  <span className="font-bold">Selected</span>
                  <CheckCircle size={18} />
                </div>
              </div>
            </div>

            {/* Edgbarrow School */}
            <Link 
              href="/programme/edgbarrow"
              className="relative rounded-2xl overflow-hidden cursor-pointer group transition-all hover:shadow-2xl hover:-translate-y-1"
              style={{ border: '2px solid #EAEDE6' }}
            >
              <div 
                className="h-64"
                style={{ 
                  backgroundImage: 'url(/images/schools/edgbarrow.svg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:from-black/95 transition-all"></div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3" style={{ backgroundColor: '#65B863', color: '#FFFFFF' }}>
                  Secondary School
                </span>
                <h4 className="text-2xl font-bold text-white mb-1">Edgbarrow School</h4>
                <p className="text-sm text-white/80 mb-3">Students only • Performance & Development</p>
                <div className="flex items-center gap-2 text-white/90 group-hover:text-white transition-all">
                  <span className="font-bold">View Programmes</span>
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

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

      {/* Term Dates Banner - matching Edgbarrow style */}
      <section id="programmes" className="py-16" style={{ backgroundColor: '#F7F9FA' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className="rounded-xl p-6 mb-12"
            style={{ backgroundColor: '#2E354E' }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{ludgroveTermDates.term}</h3>
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="flex-shrink-0 mt-1" style={{ color: '#dfd300' }} />
                  <p style={{ color: '#AFB0B3' }}>{ludgroveTermDates.venue} • {ludgroveTermDates.address}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/10 rounded-lg px-4 py-2">
                  <p className="text-xs font-bold" style={{ color: '#dfd300' }}>Start</p>
                  <p className="text-sm text-white">{ludgroveTermDates.startDate}</p>
                </div>
                <div className="bg-white/10 rounded-lg px-4 py-2">
                  <p className="text-xs font-bold" style={{ color: '#dfd300' }}>Half Term</p>
                  <p className="text-sm text-white">{ludgroveTermDates.halfTerm}</p>
                </div>
                <div className="bg-white/10 rounded-lg px-4 py-2">
                  <p className="text-xs font-bold" style={{ color: '#dfd300' }}>End</p>
                  <p className="text-sm text-white">{ludgroveTermDates.endDate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Programme Categories - matching Edgbarrow format */}
          {Object.entries(groupedProgrammes).map(([category, programmes]) => (
            <div key={category} className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold" style={{ color: '#1E2333' }}>{category}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {programmes.map((prog) => {
                  const pricing = calculateTotal(prog)
                  return (
                    <div 
                      key={prog.id}
                      className="bg-white rounded-xl overflow-hidden transition-all hover:shadow-lg cursor-pointer flex flex-col"
                      style={{ border: '1px solid #EAEDE6', minHeight: '480px' }}
                      onClick={() => {}}
                    >
                      <div className="h-2" style={{ backgroundColor: prog.color }}></div>
                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold mb-1" style={{ color: '#1E2333' }}>{prog.name}</h3>
                            <p className="text-sm" style={{ color: '#676D82' }}>{prog.ageGroup}</p>
                          </div>
                          <span 
                            className="px-3 py-1 rounded-full text-xs font-bold"
                            style={{ backgroundColor: prog.color + '20', color: prog.color }}
                          >
                            {prog.access}
                          </span>
                        </div>
                        
                        <p className="text-sm mb-4" style={{ color: '#676D82' }}>{prog.description}</p>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center gap-3">
                            <Calendar size={16} style={{ color: '#AFB0B3' }} />
                            <span style={{ color: '#1E2333' }}>{prog.day}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Clock size={16} style={{ color: '#AFB0B3' }} />
                            <span style={{ color: '#1E2333' }}>{prog.time}</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <MapPin size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#AFB0B3' }} />
                            <div>
                              <p style={{ color: '#1E2333' }}>{prog.venue}</p>
                            </div>
                          </div>
                        </div>

                        {pricing && (
                          <div className="rounded-lg p-3 mb-4" style={{ backgroundColor: '#F7F9FA' }}>
                            <div className="flex justify-between text-sm">
                              <span style={{ color: '#676D82' }}>{prog.totalLessons} lessons × £{prog.pricePerLesson} + VAT</span>
                              <span className="font-bold" style={{ color: prog.color }}>£{pricing.total.toFixed(2)}</span>
                            </div>
                          </div>
                        )}

                        {!pricing && prog.pricePerLesson && (
                          <div className="rounded-lg p-3 mb-4" style={{ backgroundColor: '#F7F9FA' }}>
                            <div className="flex justify-between text-sm">
                              <span style={{ color: '#676D82' }}>Per lesson</span>
                              <span className="font-bold" style={{ color: '#1E2333' }}>£{prog.pricePerLesson} + VAT</span>
                            </div>
                          </div>
                        )}

                        {!prog.pricePerLesson && (
                          <div className="rounded-lg p-3 mb-4" style={{ backgroundColor: '#F7F9FA' }}>
                            <p className="text-sm text-center" style={{ color: '#676D82' }}>Pricing on invitation</p>
                          </div>
                        )}

                        <div className="rounded-lg p-3 mb-4" style={{ backgroundColor: '#FFF9E6', border: '1px solid #dfd300' }}>
                          <div className="flex items-start gap-2">
                            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" style={{ color: '#B8A600' }} />
                            <p className="text-xs" style={{ color: '#676D82' }}>{prog.paymentTerms}</p>
                          </div>
                        </div>

                        <div className="mt-auto">
                          <Link 
                            href={`/booking?venue=ludgrove&programme=${prog.id === 'standard-121' ? 'lud-standard' : prog.id === 'additional-121' ? 'lud-additional' : 'lud-clinic'}`}
                            className="block w-full py-3 rounded-full font-bold text-sm text-center transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                            style={{ backgroundColor: prog.color, color: prog.id === 'sunday-clinic' ? '#1E2333' : '#FFFFFF' }}
                          >
                            Book Now <ChevronRight size={16} className="inline ml-1" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Admin Timetable Scheduler - Only for Peter */}
      <section className="py-16" style={{ backgroundColor: '#1E2333' }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">Coach Timetable Scheduler</h2>
          <p className="text-lg mb-8" style={{ color: '#AFB0B3' }}>
            Generate and manage the weekly coaching timetable for all 7 coaches
          </p>
          <Link 
            href="/admin" 
            className="inline-flex items-center gap-2 hover:gap-3 px-10 py-4 rounded-full font-bold text-lg transition-all duration-300"
            style={{ backgroundColor: '#65B863', color: '#FFFFFF' }}
          >
            <Calendar size={20} /> Open Timetable Scheduler <ChevronRight size={20} />
          </Link>
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
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-heading">Questions?</h2>
          <h5 className="text-xl mb-8" style={{ color: '#AFB0B3' }}>
            Contact us for more information about our Ludgrove coaching programmes
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
