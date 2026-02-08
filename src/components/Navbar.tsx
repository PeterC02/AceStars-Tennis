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
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm"
      >
        <User size={16} />
        <span className="hidden lg:inline">Staff</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl shadow-2xl overflow-hidden" style={{ backgroundColor: '#1E2333', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="px-4 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'rgba(255,255,255,0.35)' }}>Staff Access</p>
          </div>
          <Link href="/admin" onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-all">
            <Shield size={15} style={{ color: '#dfd300' }} />
            <div>
              <p className="font-bold text-xs">Admin</p>
              <p className="text-[10px] text-white/40">Bookings &amp; scheduling</p>
            </div>
          </Link>
          <Link href="/teacher-admin" onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-all">
            <GraduationCap size={15} style={{ color: '#F87D4D' }} />
            <div>
              <p className="font-bold text-xs">Div Master Portal</p>
              <p className="text-[10px] text-white/40">Upload timetables</p>
            </div>
          </Link>
          <Link href="/teacher-admin" onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-all">
            <Dumbbell size={15} style={{ color: '#65B863' }} />
            <div>
              <p className="font-bold text-xs">Coach Portal</p>
              <p className="text-[10px] text-white/40">View your schedule</p>
            </div>
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
              <div className="border-t border-white/10 pt-4 mt-2">
                <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Staff Access</p>
                <Link href="/admin" className="flex items-center gap-2 py-2 text-white/70 hover:text-white text-sm" onClick={() => setIsOpen(false)}>
                  <Shield size={14} /> Admin (Peter)
                </Link>
                <Link href="/teacher-admin" className="flex items-center gap-2 py-2 text-white/70 hover:text-white text-sm" onClick={() => setIsOpen(false)}>
                  <GraduationCap size={14} /> Div Master Portal
                </Link>
                <Link href="/teacher-admin" className="flex items-center gap-2 py-2 text-white/70 hover:text-white text-sm" onClick={() => setIsOpen(false)}>
                  <Dumbbell size={14} /> Coach Portal
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
