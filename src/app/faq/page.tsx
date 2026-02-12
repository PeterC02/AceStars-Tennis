'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, ChevronDown, HelpCircle } from 'lucide-react'

const faqs = [
  {
    category: 'Booking & Payment',
    questions: [
      {
        q: 'How do I book a course?',
        a: 'You can book directly through our website by visiting the Book a Course page. Select your venue, choose a programme, add your child\'s details, and proceed to checkout.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept bank transfers and card payments. For Ludgrove School programmes, invoices are issued termly. For AceStars and Edgbarrow programmes, payment is taken at the time of booking.',
      },
      {
        q: 'Can I get a refund if my child can\'t attend?',
        a: 'Refund policies vary by programme. For term-time programmes, we offer pro-rata refunds if notice is given before the term starts. For holiday camps, refunds are available up to 7 days before the camp begins. Please contact us for specific circumstances.',
      },
      {
        q: 'Do you offer trial sessions?',
        a: 'Yes! We offer trial sessions for our AceStars community programmes at just \u00A38.99. This is a great way to see if tennis coaching is right for your child before committing to a full term.',
      },
    ],
  },
  {
    category: 'Coaching & Programmes',
    questions: [
      {
        q: 'What age groups do you coach?',
        a: 'We coach children from age 4 upwards, as well as adults. Our programmes are tailored to different age groups and abilities, from Mini Red (ages 4-8) through to Yellow Ball and adult coaching.',
      },
      {
        q: 'What qualifications do your coaches have?',
        a: 'All our coaches hold internationally recognised qualifications from organisations including the LTA, RPT, PTR, and USPTA. Our head coach Wojtek holds a Masters in Individual Sports Psychology and a PhD in Fitness.',
      },
      {
        q: 'What\'s the difference between Performance and Development programmes?',
        a: 'Performance programmes are for selected players who show strong potential and commitment. They involve more intensive coaching with a focus on competition preparation. Development programmes are open to all students and focus on building core skills and enjoyment of the game.',
      },
      {
        q: 'How many children are in each group session?',
        a: 'Group sizes vary by programme. AfterSchool Clubs typically have up to 12 players, Development groups up to 8, and Performance groups up to 6. Private 1-2-1 sessions are individual.',
      },
    ],
  },
  {
    category: 'Venues & Logistics',
    questions: [
      {
        q: 'Where are your venues located?',
        a: 'We operate across Berkshire, Hampshire, and Surrey. Our main venues include Ludgrove School (Wokingham), Edgbarrow School (Crowthorne), and various community courts for AceStars programmes.',
      },
      {
        q: 'What happens if it rains?',
        a: 'For outdoor sessions, we monitor the weather closely. If conditions are unsafe, sessions will be cancelled and rescheduled where possible. Some venues have indoor facilities or covered courts as backup.',
      },
      {
        q: 'Does my child need their own racket?',
        a: 'We have spare rackets available for beginners, but we recommend children bring their own racket once they\'re committed to regular coaching. We can advise on the right racket size and type for your child.',
      },
      {
        q: 'What should my child wear?',
        a: 'Comfortable sportswear and proper tennis or sports shoes are required. For school programmes, students should wear their PE kit. We recommend bringing water and sun protection in summer.',
      },
    ],
  },
  {
    category: 'Holiday Camps',
    questions: [
      {
        q: 'What times do holiday camps run?',
        a: 'Our holiday camps typically run from 9:00am to 1:00pm (half day) or 9:00am to 3:00pm (full day). Drop-off is from 8:45am.',
      },
      {
        q: 'Can I book individual days or do I need to book the whole week?',
        a: 'You can book individual days at \u00A330 per day, or book the full week (Monday to Thursday) for \u00A3120 \u2014 saving \u00A30 with Friday free! Friday is included as a bonus day when you book the full week.',
      },
      {
        q: 'What does my child need to bring to camp?',
        a: 'Children should bring a packed lunch (for full-day camps), water bottle, sun cream, a hat, and comfortable sportswear with tennis/sports shoes. Rackets are provided if needed.',
      },
    ],
  },
]

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (id: string) => {
    setOpenItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

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
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center pb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-heading">
            Frequently Asked Questions
          </h1>
          <h5 className="text-xl max-w-3xl mx-auto mb-8" style={{ color: '#AFB0B3' }}>
            Everything you need to know about our tennis coaching programmes
          </h5>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-24" style={{ backgroundColor: '#F7F9FA' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {faqs.map((section, sIdx) => (
            <div key={section.category} className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <span className="section-number" style={{ color: '#F87D4D' }}>
                  {String(sIdx + 1).padStart(2, '0')}
                </span>
                <span className="section-line"></span>
                <h2 className="text-2xl font-bold" style={{ color: '#1E2333' }}>{section.category}</h2>
              </div>

              <div className="space-y-3">
                {section.questions.map((faq, qIdx) => {
                  const id = `${sIdx}-${qIdx}`
                  const isOpen = openItems.includes(id)
                  return (
                    <div key={id} className="rounded-2xl overflow-hidden transition-all" style={{ backgroundColor: '#FFF', border: '1px solid #EAEDE6' }}>
                      <button
                        onClick={() => toggleItem(id)}
                        className="w-full flex items-center justify-between p-5 text-left transition-all hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <HelpCircle size={18} style={{ color: '#F87D4D', flexShrink: 0 }} />
                          <span className="font-bold text-sm" style={{ color: '#1E2333' }}>{faq.q}</span>
                        </div>
                        <ChevronDown
                          size={18}
                          className={`transition-transform flex-shrink-0 ml-4 ${isOpen ? 'rotate-180' : ''}`}
                          style={{ color: '#676D82' }}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 pt-0">
                          <div className="pl-[30px]">
                            <p className="text-sm leading-relaxed" style={{ color: '#676D82' }}>{faq.a}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary via-primary-dark to-primary text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-heading">Still Have Questions?</h2>
          <p className="text-xl text-white/80 mb-8">
            Get in touch with our team and we&apos;ll be happy to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="bg-accent hover:bg-accent-dark text-white px-10 py-4 rounded-full font-semibold text-lg transition-all duration-300 inline-flex items-center gap-2 hover:gap-3">
              Contact Us <ChevronRight size={20} />
            </Link>
            <Link href="/booking" className="btn-secondary text-lg">
              Book a Course
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
