'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Phone, MapPin, Send, ChevronRight } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [submitError, setSubmitError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSubmitted(true)
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to send message. Please try again.')
    }
    setIsSubmitting(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

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
            Contact
          </h1>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24" style={{ backgroundColor: '#F7F9FA' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div>
              <h3 className="text-2xl font-bold mb-6" style={{ color: '#1E2333' }}>Address</h3>
              
              <div className="mb-8">
                <h5 className="text-lg mb-4" style={{ color: '#676D82' }}>
                  ABC Tennis Ltd<br />
                  (Trading as AceStars Tennis)<br />
                  15 Camperdown House, Windsor, Berkshire SL4 3HQ
                </h5>
                <p style={{ color: '#1E2333' }}>
                  E: <a href="mailto:acestarsbookings@gmail.com" style={{ color: '#dfd300' }}>acestarsbookings@gmail.com</a><br />
                  M: 07915 269562
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h3 className="text-2xl font-bold mb-6" style={{ color: '#1E2333' }}>Contact Form</h3>
              
              {submitted ? (
                <div className="bg-white rounded-lg p-8 text-center" style={{ border: '1px solid #88D286' }}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#88D286' }}>
                    <Send className="text-white" size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#1E2333' }}>Message Sent!</h3>
                  <p style={{ color: '#676D82' }}>
                    Thank you for contacting us. We will get back to you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: '#1E2333' }}>
                      Your Name (required)
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-5 py-4 rounded-lg transition-all"
                      style={{ border: '1px solid #BCBFB9', backgroundColor: '#FEFFFC' }}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#1E2333' }}>
                      Your Email (required)
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-5 py-4 rounded-lg transition-all"
                      style={{ border: '1px solid #BCBFB9', backgroundColor: '#FEFFFC' }}
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2" style={{ color: '#1E2333' }}>
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-5 py-4 rounded-lg transition-all"
                      style={{ border: '1px solid #BCBFB9', backgroundColor: '#FEFFFC' }}
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2" style={{ color: '#1E2333' }}>
                      Your Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-5 py-4 rounded-lg transition-all resize-none"
                      style={{ border: '1px solid #BCBFB9', backgroundColor: '#FEFFFC' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#dfd300', color: '#1E2333' }}
                  >
                    {isSubmitting ? 'Sending...' : 'Send'}
                  </button>
                </form>
              )}
            </div>
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
