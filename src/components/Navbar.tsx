'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, User, Shield, GraduationCap, Dumbbell } from 'lucide-react'

const StaffDropdown = () => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm border border-white/10 hover:border-white/25"
      >
        <User size={14} />
        <span className="hidden lg:inline text-xs font-medium">Staff Login</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-3 w-72 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl" style={{ backgroundColor: 'rgba(30,35,51,0.98)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="px-5 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'linear-gradient(135deg, rgba(223,211,0,0.08), rgba(248,125,77,0.08))' }}>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>Staff Portal</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>Select your role to sign in</p>
          </div>

          <Link href="/admin" onClick={() => setOpen(false)}
            className="flex items-center gap-3.5 px-5 py-3.5 text-white/80 hover:text-white hover:bg-white/[0.04] transition-all group"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110" style={{ backgroundColor: 'rgba(223,211,0,0.15)' }}>
              <Shield size={16} style={{ color: '#dfd300' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[13px] leading-tight">Admin Dashboard</p>
              <p className="text-[10px] mt-0.5 leading-tight" style={{ color: 'rgba(255,255,255,0.35)' }}>All bookings, scheduling &amp; publishing</p>
            </div>
            <span className="text-[9px] px-2 py-1 rounded-md font-bold flex-shrink-0" style={{ backgroundColor: 'rgba(223,211,0,0.12)', color: '#dfd300' }}>PIN</span>
          </Link>

          <Link href="/teacher-admin" onClick={() => setOpen(false)}
            className="flex items-center gap-3.5 px-5 py-3.5 text-white/80 hover:text-white hover:bg-white/[0.04] transition-all group"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110" style={{ backgroundColor: 'rgba(248,125,77,0.15)' }}>
              <GraduationCap size={16} style={{ color: '#F87D4D' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[13px] leading-tight">Div Master Portal</p>
              <p className="text-[10px] mt-0.5 leading-tight" style={{ color: 'rgba(255,255,255,0.35)' }}>Upload timetables &amp; manage boys</p>
            </div>
            <span className="text-[9px] px-2 py-1 rounded-md font-bold flex-shrink-0" style={{ backgroundColor: 'rgba(248,125,77,0.12)', color: '#F87D4D' }}>Register</span>
          </Link>

          <Link href="/teacher-admin" onClick={() => setOpen(false)}
            className="flex items-center gap-3.5 px-5 py-3.5 text-white/80 hover:text-white hover:bg-white/[0.04] transition-all group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110" style={{ backgroundColor: 'rgba(101,184,99,0.15)' }}>
              <Dumbbell size={16} style={{ color: '#65B863' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[13px] leading-tight">Coach Portal</p>
              <p className="text-[10px] mt-0.5 leading-tight" style={{ color: 'rgba(255,255,255,0.35)' }}>View published timetable</p>
            </div>
            <span className="text-[9px] px-2 py-1 rounded-md font-bold flex-shrink-0" style={{ backgroundColor: 'rgba(101,184,99,0.12)', color: '#65B863' }}>PIN</span>
          </Link>
        </div>
      )}
    </div>
  )
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Venues', href: '/venues' },
    { name: 'Team', href: '/team' },
    { name: 'Programme', href: '/programme' },
    { name: 'Contact', href: '/contact' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary-dark/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center">
            <Image 
              src="/images/logo-white.png" 
              alt="Acestars Tennis Coaching" 
              width={132} 
              height={70}
              className="h-14 w-auto"
            />
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="nav-link">
                {link.name}
              </Link>
            ))}
            <Link href="/booking" className="btn-primary">
              Book a Course
            </Link>
            <StaffDropdown />
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-6">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="nav-link py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <Link href="/booking" className="btn-primary text-center mt-4">
                Book a Course
              </Link>
              <div className="border-t border-white/10 pt-4 mt-2 space-y-1">
                <p className="text-white/30 text-[10px] uppercase tracking-[0.15em] font-bold mb-3">Staff Portal</p>
                <Link href="/admin" className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all" onClick={() => setIsOpen(false)}>
                  <Shield size={16} style={{ color: '#dfd300' }} />
                  <div className="flex-1">
                    <p className="text-sm font-bold">Admin Dashboard</p>
                    <p className="text-[10px] text-white/35">Bookings &amp; scheduling</p>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded font-bold" style={{ backgroundColor: 'rgba(223,211,0,0.12)', color: '#dfd300' }}>PIN</span>
                </Link>
                <Link href="/teacher-admin" className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all" onClick={() => setIsOpen(false)}>
                  <GraduationCap size={16} style={{ color: '#F87D4D' }} />
                  <div className="flex-1">
                    <p className="text-sm font-bold">Div Master Portal</p>
                    <p className="text-[10px] text-white/35">Upload timetables</p>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded font-bold" style={{ backgroundColor: 'rgba(248,125,77,0.12)', color: '#F87D4D' }}>Register</span>
                </Link>
                <Link href="/teacher-admin" className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all" onClick={() => setIsOpen(false)}>
                  <Dumbbell size={16} style={{ color: '#65B863' }} />
                  <div className="flex-1">
                    <p className="text-sm font-bold">Coach Portal</p>
                    <p className="text-[10px] text-white/35">View timetable</p>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded font-bold" style={{ backgroundColor: 'rgba(101,184,99,0.12)', color: '#65B863' }}>PIN</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
