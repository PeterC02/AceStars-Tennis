'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Calendar, User, Mail, Phone, MapPin, Clock, ChevronRight, CheckCircle, GraduationCap, Building2, CircleDot, Star, Plus, Minus, X, Info, ShoppingCart } from 'lucide-react'

// Child type
type Child = {
  name: string
  age: string
  experience: string
  medicalInfo: string
}

// Day selection type for camps - per week
type WeekDaySelection = {
  mon: boolean
  tue: boolean
  wed: boolean
  thu: boolean
  fri: boolean
}

// Ludgrove session preferences
type SessionPreference = {
  preferred: ('breakfast' | 'fruit' | 'rest')[]
  avoid: ('breakfast' | 'fruit' | 'rest')[]
  preferredDays: ('mon' | 'tue' | 'wed' | 'thu' | 'fri')[]
  avoidDays: ('mon' | 'tue' | 'wed' | 'thu' | 'fri')[]
  notes: string
}

// Basket item type
type BasketItem = {
  uid: string
  venueKey: VenueKey
  programmeId: string
  weekSelections?: Record<string, WeekDaySelection>
  singleWeekDays?: WeekDaySelection
  sessionPrefs?: SessionPreference
}

const defaultChild: Child = { name: '', age: '', experience: '', medicalInfo: '' }
const defaultWeekDays: WeekDaySelection = { mon: false, tue: false, wed: false, thu: false, fri: false }
const defaultSessionPreference: SessionPreference = { preferred: [], avoid: [], preferredDays: [], avoidDays: [], notes: '' }

// Summer camp weeks
const summerCampWeeks = [
  { id: 'summer-w1', name: 'Week 1', dates: '21st - 25th July 2026' },
  { id: 'summer-w2', name: 'Week 2', dates: '28th July - 1st Aug 2026' },
  { id: 'summer-w3', name: 'Week 3', dates: '4th - 8th Aug 2026' },
  { id: 'summer-w4', name: 'Week 4', dates: '11th - 15th Aug 2026' },
  { id: 'summer-w5', name: 'Week 5', dates: '18th - 22nd Aug 2026' },
  { id: 'summer-w6', name: 'Week 6', dates: '25th - 29th Aug 2026' },
]

// All available programmes organized by venue
const allProgrammes = {
  ludgrove: {
    name: 'Ludgrove School',
    type: 'Private School',
    color: '#F87D4D',
    icon: 'graduation',
    programmes: [
      { id: 'lud-standard', name: 'Weekly Private 1-2-1 Coaching', category: 'Private Coaching', price: '£324/term (9 lessons)', priceNum: 324, day: 'Weekly', time: 'Scheduled per child', hasSessionPrefs: true },
      { id: 'lud-additional', name: 'Additional Private 1-2-1 Coaching', category: 'Private Coaching', price: '£30+VAT/lesson', priceNum: 36, day: 'Weekly', time: 'Subject to availability', hasSessionPrefs: true, hasVAT: true },
      { id: 'lud-clinic', name: 'Sunday Clinic', category: 'Clinics', price: '£90/term (5 sessions)', priceNum: 90, day: 'Sunday', time: 'Non-exeat Sundays', hasSessionPrefs: false },
    ]
  },
  edgbarrow: {
    name: 'Edgbarrow School',
    type: 'Secondary School',
    color: '#65B863',
    icon: 'building',
    programmes: [
      { id: 'edg-perf-girls', name: 'Performance Girls', category: 'Performance', price: '£216/term (inc. VAT)', priceNum: 180, day: 'Tuesday', time: '3:30pm - 5:30pm', hasSessionPrefs: false, hasVAT: true },
      { id: 'edg-perf-boys', name: 'Performance Boys', category: 'Performance', price: '£216/term (inc. VAT)', priceNum: 180, day: 'Monday', time: '3:30pm - 5:30pm', hasSessionPrefs: false, hasVAT: true },
      { id: 'edg-dev-y78', name: 'Development Y7/8', category: 'Development', price: '£144/term (inc. VAT)', priceNum: 120, day: 'Tuesday', time: '3:30pm - 4:30pm', hasSessionPrefs: false, hasVAT: true },
      { id: 'edg-dev-y910', name: 'Development Y9/10', category: 'Development', price: '£144/term (inc. VAT)', priceNum: 120, day: 'Tuesday', time: '3:30pm - 4:30pm', hasSessionPrefs: false, hasVAT: true },
      { id: 'edg-club-y7', name: 'Y7 AfterSchool Club', category: 'AfterSchool Club', price: '£78/term (inc. VAT)', priceNum: 65, day: 'Monday', time: '3:30pm - 4:20pm', hasSessionPrefs: false, hasVAT: true },
      { id: 'edg-club-y8', name: 'Y8 AfterSchool Club', category: 'AfterSchool Club', price: '£78/term (inc. VAT)', priceNum: 65, day: 'Thursday', time: '3:30pm - 4:20pm', hasSessionPrefs: false, hasVAT: true },
      { id: 'edg-club-y910', name: 'Y9/10 AfterSchool Club', category: 'AfterSchool Club', price: '£78/term (inc. VAT)', priceNum: 65, day: 'Wednesday', time: '3:30pm - 4:20pm', hasSessionPrefs: false, hasVAT: true },
    ]
  },
  acestars: {
    name: 'AceStars Tennis',
    type: 'Open to All',
    color: '#dfd300',
    icon: 'tennis',
    programmes: [
      { id: 'ace-orange', name: 'Orange/Green Ball', category: 'Term Time', price: '£107.88/term', priceNum: 107.88, day: 'Tuesday', time: '6:30pm - 7:30pm', hasSessionPrefs: false },
      { id: 'ace-yellow', name: 'Yellow Ball', category: 'Term Time', price: '£107.88/term', priceNum: 107.88, day: 'Tuesday', time: '5:30pm - 6:30pm', hasSessionPrefs: false },
      { id: 'ace-red', name: 'Mini Red', category: 'Term Time', price: '£107.88/term', priceNum: 107.88, day: 'Sunday', time: '10:15am - 11:15am', hasSessionPrefs: false },
      { id: 'ace-trial', name: 'Trial Session', category: 'Term Time', price: '£8.99', priceNum: 8.99, day: 'Any', time: 'Contact us', hasSessionPrefs: false },
      { id: 'ace-easter1', name: 'Easter Camp Week 1', category: 'Holiday Camps', price: '£30/day or £120/week', priceNum: 30, day: 'Mon-Fri', time: '9:00am - 3:00pm', hasSessionPrefs: false, dates: '7th - 11th April 2026' },
      { id: 'ace-easter2', name: 'Easter Camp Week 2', category: 'Holiday Camps', price: '£30/day or £120/week', priceNum: 30, day: 'Mon-Fri', time: '9:00am - 3:00pm', hasSessionPrefs: false, dates: '14th - 17th April 2026' },
      { id: 'ace-summer', name: 'Summer Camps', category: 'Holiday Camps', price: '£30/day or £120/week', priceNum: 30, day: 'Mon-Fri', time: '9:00am - 3:00pm', hasSessionPrefs: false, isSummerCamp: true },
      { id: 'ace-private', name: 'Private Coaching', category: 'Private', price: 'From £40/hour', priceNum: 40, day: 'Flexible', time: 'By arrangement', hasSessionPrefs: false },
    ]
  }
}

type VenueKey = keyof typeof allProgrammes

const getProgramme = (venueKey: VenueKey, programmeId: string) => {
  return allProgrammes[venueKey].programmes.find(p => p.id === programmeId)
}

const calculateWeekPrice = (days: WeekDaySelection): number => {
  const selectedDays = Object.values(days).filter(Boolean).length
  if (selectedDays === 0) return 0
  const monToThu = days.mon && days.tue && days.wed && days.thu
  if (monToThu) return 120
  return selectedDays * 30
}

const calculateItemPrice = (item: BasketItem): number => {
  const prog = getProgramme(item.venueKey, item.programmeId)
  if (!prog) return 0
  if (prog.category === 'Holiday Camps') {
    if ((prog as any)?.isSummerCamp && item.weekSelections) {
      let total = 0
      Object.values(item.weekSelections).forEach(days => { total += calculateWeekPrice(days) })
      return total
    } else if (item.singleWeekDays) {
      return calculateWeekPrice(item.singleWeekDays)
    }
    return 0
  }
  return (prog as any).priceNum
}

function BookingPageContent() {
  const searchParams = useSearchParams()
  const [basket, setBasket] = useState<BasketItem[]>([])
  const [browseVenue, setBrowseVenue] = useState<VenueKey | null>(null)
  const [step, setStep] = useState<'browse' | 'checkout'>('browse')
  const [parentData, setParentData] = useState({ parentName: '', parentEmail: '', parentPhone: '', message: '' })
  const [children, setChildren] = useState<Child[]>([{ ...defaultChild }])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  // Pre-select from URL query params
  useEffect(() => {
    const venue = searchParams.get('venue') as VenueKey | null
    const programme = searchParams.get('programme')
    if (venue && allProgrammes[venue]) {
      if (programme) {
        const found = allProgrammes[venue].programmes.find(p => p.id === programme)
        if (found) {
          const newItem: BasketItem = {
            uid: `${programme}-${Date.now()}`,
            venueKey: venue,
            programmeId: programme,
            ...(found.category === 'Holiday Camps' && (found as any)?.isSummerCamp ? { weekSelections: {} } : {}),
            ...(found.category === 'Holiday Camps' && !(found as any)?.isSummerCamp ? { singleWeekDays: { ...defaultWeekDays } } : {}),
            ...((found as any)?.hasSessionPrefs ? { sessionPrefs: { ...defaultSessionPreference } } : {}),
          }
          setBasket([newItem])
          setExpandedItem(newItem.uid)
        }
      }
      setBrowseVenue(venue)
    }
  }, [searchParams])

  const addToBasket = (venueKey: VenueKey, programmeId: string) => {
    const prog = getProgramme(venueKey, programmeId)
    if (!prog) return
    const exists = basket.find(b => b.venueKey === venueKey && b.programmeId === programmeId)
    if (exists && prog.category !== 'Holiday Camps') return
    const newItem: BasketItem = {
      uid: `${programmeId}-${Date.now()}`,
      venueKey,
      programmeId,
      ...(prog.category === 'Holiday Camps' && (prog as any)?.isSummerCamp ? { weekSelections: {} } : {}),
      ...(prog.category === 'Holiday Camps' && !(prog as any)?.isSummerCamp ? { singleWeekDays: { ...defaultWeekDays } } : {}),
      ...((prog as any)?.hasSessionPrefs ? { sessionPrefs: { ...defaultSessionPreference } } : {}),
    }
    setBasket(prev => [...prev, newItem])
    setExpandedItem(newItem.uid)
  }

  const removeFromBasket = (uid: string) => {
    setBasket(prev => prev.filter(b => b.uid !== uid))
    if (expandedItem === uid) setExpandedItem(null)
  }

  const isInBasket = (venueKey: VenueKey, programmeId: string) => {
    return basket.some(b => b.venueKey === venueKey && b.programmeId === programmeId)
  }

  const updateItemWeekSelection = (uid: string, weekId: string, day: keyof WeekDaySelection) => {
    setBasket(prev => prev.map(item => {
      if (item.uid !== uid) return item
      const current = item.weekSelections || {}
      const weekDays = current[weekId] || { ...defaultWeekDays }
      return { ...item, weekSelections: { ...current, [weekId]: { ...weekDays, [day]: !weekDays[day] } } }
    }))
  }

  const selectItemFullWeek = (uid: string, weekId: string) => {
    setBasket(prev => prev.map(item => {
      if (item.uid !== uid) return item
      const current = item.weekSelections || {}
      return { ...item, weekSelections: { ...current, [weekId]: { mon: true, tue: true, wed: true, thu: true, fri: true } } }
    }))
  }

  const clearItemWeek = (uid: string, weekId: string) => {
    setBasket(prev => prev.map(item => {
      if (item.uid !== uid) return item
      const current = item.weekSelections || {}
      return { ...item, weekSelections: { ...current, [weekId]: { ...defaultWeekDays } } }
    }))
  }

  const toggleItemSingleDay = (uid: string, day: keyof WeekDaySelection) => {
    setBasket(prev => prev.map(item => {
      if (item.uid !== uid) return item
      const current = item.singleWeekDays || { ...defaultWeekDays }
      return { ...item, singleWeekDays: { ...current, [day]: !current[day] } }
    }))
  }

  const toggleItemSessionPref = (uid: string, type: 'preferred' | 'avoid', slot: 'breakfast' | 'fruit' | 'rest') => {
    setBasket(prev => prev.map(item => {
      if (item.uid !== uid || !item.sessionPrefs) return item
      const current = item.sessionPrefs[type]
      const newList = current.includes(slot) ? current.filter(s => s !== slot) : [...current, slot]
      return { ...item, sessionPrefs: { ...item.sessionPrefs, [type]: newList } }
    }))
  }

  const toggleItemDayPref = (uid: string, type: 'preferredDays' | 'avoidDays', day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri') => {
    setBasket(prev => prev.map(item => {
      if (item.uid !== uid || !item.sessionPrefs) return item
      const current = item.sessionPrefs[type]
      const newList = current.includes(day) ? current.filter(d => d !== day) : [...current, day]
      return { ...item, sessionPrefs: { ...item.sessionPrefs, [type]: newList } }
    }))
  }

  const basketTotal = basket.reduce((sum, item) => sum + calculateItemPrice(item) * children.length, 0)

  const addChild = () => { if (children.length < 5) setChildren([...children, { ...defaultChild }]) }
  const removeChild = (index: number) => { if (children.length > 1) setChildren(children.filter((_, i) => i !== index)) }
  const updateChild = (index: number, field: keyof Child, value: string) => {
    setChildren(children.map((child, i) => i === index ? { ...child, [field]: value } : child))
  }
  const handleParentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setParentData({ ...parentData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (basket.length === 0) return
    setIsSubmitting(true)
    try {
      for (const item of basket) {
        const prog = getProgramme(item.venueKey, item.programmeId)
        const venue = allProgrammes[item.venueKey]
        const isCamp = prog?.category === 'Holiday Camps'
        const isSummer = (prog as any)?.isSummerCamp === true
        const itemPrice = calculateItemPrice(item) * children.length

        const campDaysData = isCamp ? (
          isSummer
            ? summerCampWeeks.map(week => ({
                week_id: week.id, week_name: week.name,
                days: Object.entries(item.weekSelections?.[week.id] || {}).filter(([_, selected]) => selected).map(([day]) => day)
              })).filter(w => w.days.length > 0)
            : [{ week_id: 'single', week_name: prog?.name || '',
                days: Object.entries(item.singleWeekDays || {}).filter(([_, selected]) => selected).map(([day]) => day) }]
        ) : undefined

        const sessionPrefsData = item.sessionPrefs ? {
          preferred_slots: item.sessionPrefs.preferred, avoid_slots: item.sessionPrefs.avoid,
          preferred_days: item.sessionPrefs.preferredDays, avoid_days: item.sessionPrefs.avoidDays, notes: item.sessionPrefs.notes
        } : undefined

        const response = await fetch('/api/bookings', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            venue: venue.name, programmeId: prog?.id, programmeName: prog?.name, programmeCategory: prog?.category,
            parentName: parentData.parentName, parentEmail: parentData.parentEmail, parentPhone: parentData.parentPhone,
            children, campDays: campDaysData, sessionPreferences: sessionPrefsData,
            totalPrice: itemPrice, hasVAT: !!(prog as any)?.hasVAT, paymentMethod: 'invoice', notes: parentData.message,
          }),
        })
        const data = await response.json()
        if (!data.booking) throw new Error(data.error || 'Failed to create booking')
      }
      setSubmitted(true)
    } catch (error) {
      console.error('Booking error:', error)
      alert('There was an error submitting your booking. Please try again.')
    }
    setIsSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F7F9FA' }}>
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl p-12" style={{ boxShadow: '0 2px 16px 0 rgba(46, 53, 78, 0.05)' }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#65B863' }}>
              <CheckCircle className="text-white" size={48} />
            </div>
            <h1 className="text-3xl font-bold mb-4" style={{ color: '#1E2333' }}>Booking Request Sent!</h1>
            <p className="mb-2" style={{ color: '#676D82' }}>
              Thank you for your booking request for {basket.length} programme{basket.length > 1 ? 's' : ''}.
            </p>
            <p className="mb-8" style={{ color: '#676D82' }}>
              An invoice will be sent to your email for each programme. We will confirm your place shortly.
            </p>
            <a href="/" className="inline-block px-10 py-4 rounded-full font-bold text-lg transition-all duration-300" style={{ backgroundColor: '#dfd300', color: '#1E2333' }}>
              Return Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  const VenueIcon = ({ icon, size = 24, className = '' }: { icon: string; size?: number; className?: string }) => {
    if (icon === 'graduation') return <GraduationCap size={size} className={className} />
    if (icon === 'building') return <Building2 size={size} className={className} />
    return <CircleDot size={size} className={className} />
  }

  return (
    <div className="pt-20">
      {/* Hero */}
      <section 
        className="relative min-h-[40vh] flex items-end overflow-hidden"
        style={{ 
          backgroundImage: 'url(/images/uploads/2019/03/Depositphotos_115174380_xl-2015-wide-outlined.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(30, 35, 51, 0.88)' }}></div>
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: 'url(/images/uploads/2020/03/wave3-homepage.svg)',
            backgroundRepeat: 'repeat-x',
            backgroundPosition: 'left bottom',
            backgroundSize: 'contain',
          }}
        ></div>
        <div 
          className="absolute bottom-0 left-0 right-0 h-16"
          style={{
            backgroundImage: 'url(/images/uploads/2020/02/wave-1.svg)',
            backgroundRepeat: 'repeat-x',
            backgroundPosition: 'center bottom',
            backgroundSize: 'auto 100%',
          }}
        ></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 pb-20 pt-32 w-full">
          <div className="flex items-end justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5" style={{ backgroundColor: 'rgba(223, 211, 0, 0.2)' }}>
                <Star size={14} style={{ color: '#dfd300' }} />
                <span className="text-sm font-bold" style={{ color: '#dfd300' }}>
                  {step === 'browse' ? 'Step 1 — Choose Programmes' : 'Step 2 — Complete Booking'}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-3 font-heading">
                {step === 'browse' ? 'Book a Course' : 'Checkout'}
              </h1>
              <p className="text-xl max-w-2xl" style={{ color: '#AFB0B3' }}>
                {step === 'browse' ? 'Browse our venues and add programmes to your basket' : 'Review your selections and fill in your details'}
              </p>
            </div>
            {step === 'browse' && basket.length > 0 && (
              <button onClick={() => setStep('checkout')}
                className="hidden md:flex items-center gap-3 px-7 py-4 rounded-full font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl"
                style={{ backgroundColor: '#dfd300', color: '#1E2333' }}>
                <div className="relative">
                  <ShoppingCart size={22} />
                  <span className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ backgroundColor: '#1E2333', color: '#FFFFFF' }}>{basket.length}</span>
                </div>
                Checkout — £{basketTotal.toFixed(2)}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* BROWSE MODE */}
      {step === 'browse' && (
        <>
          {/* Venue Selection Cards — shown when no venue selected */}
          {!browseVenue && (
            <section className="py-16" style={{ backgroundColor: '#F7F9FA' }}>
              <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-3" style={{ color: '#1E2333' }}>Choose Your Venue</h2>
                  <p style={{ color: '#676D82' }}>Select a venue to browse available programmes</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {(Object.keys(allProgrammes) as VenueKey[]).map((venueKey) => {
                    const venue = allProgrammes[venueKey]
                    const itemsInBasket = basket.filter(b => b.venueKey === venueKey).length
                    return (
                      <button
                        key={venueKey}
                        onClick={() => setBrowseVenue(venueKey)}
                        className="group bg-white rounded-2xl p-8 text-left transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden"
                        style={{ border: '2px solid #EAEDE6' }}
                      >
                        {/* Decorative top accent */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 transition-all duration-300 group-hover:h-2" style={{ backgroundColor: venue.color }}></div>
                        
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: venue.color }}>
                          <VenueIcon icon={venue.icon} size={32} className={venue.color === '#dfd300' ? '' : 'text-white'} />
                        </div>
                        <h3 className="text-xl font-bold mb-1" style={{ color: '#1E2333' }}>{venue.name}</h3>
                        <p className="text-sm mb-4" style={{ color: '#676D82' }}>{venue.type}</p>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold flex items-center gap-1" style={{ color: venue.color }}>
                            {venue.programmes.length} programmes <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                          </p>
                          {itemsInBasket > 0 && (
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: venue.color }}>
                              {itemsInBasket} in basket
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Programme Browser — shown when venue is selected */}
          {browseVenue && (
            <section className="py-10" style={{ backgroundColor: '#F7F9FA' }}>
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Left: Programme cards */}
                  <div className="flex-1 min-w-0">
                    {/* Venue header with back button */}
                    {(() => {
                      const venue = allProgrammes[browseVenue]
                      return (
                        <div className="rounded-2xl p-6 mb-8 relative overflow-hidden" style={{ backgroundColor: venue.color }}>
                          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10" style={{ backgroundColor: '#FFFFFF', transform: 'translate(30%, -30%)' }}></div>
                          <button onClick={() => setBrowseVenue(null)} className="text-sm mb-3 flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity" style={{ color: venue.color === '#dfd300' ? '#1E2333' : '#FFFFFF' }}>
                            ← All Venues
                          </button>
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                              <VenueIcon icon={venue.icon} size={28} className={venue.color === '#dfd300' ? '' : 'text-white'} />
                            </div>
                            <div>
                              <h2 className="text-2xl font-bold" style={{ color: venue.color === '#dfd300' ? '#1E2333' : '#FFFFFF' }}>{venue.name}</h2>
                              <p className="text-sm opacity-80" style={{ color: venue.color === '#dfd300' ? '#1E2333' : '#FFFFFF' }}>{venue.type} • {venue.programmes.length} programmes</p>
                            </div>
                          </div>
                          {/* Quick venue switcher */}
                          <div className="flex gap-2 mt-4">
                            {(Object.keys(allProgrammes) as VenueKey[]).filter(k => k !== browseVenue).map(venueKey => {
                              const v = allProgrammes[venueKey]
                              return (
                                <button key={venueKey} onClick={() => setBrowseVenue(venueKey)}
                                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105"
                                  style={{ backgroundColor: 'rgba(255,255,255,0.25)', color: venue.color === '#dfd300' ? '#1E2333' : '#FFFFFF' }}>
                                  {v.name}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })()}

                    {/* Programme cards grouped by category */}
                    {(() => {
                      const venue = allProgrammes[browseVenue]
                      const categories = Array.from(new Set(venue.programmes.map(p => p.category)))
                      return categories.map(category => (
                        <div key={category} className="mb-10">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-1 h-6 rounded-full" style={{ backgroundColor: venue.color }}></div>
                            <h3 className="text-lg font-bold" style={{ color: '#1E2333' }}>{category}</h3>
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#EAEDE6', color: '#676D82' }}>
                              {venue.programmes.filter(p => p.category === category).length}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {venue.programmes.filter(p => p.category === category).map(prog => {
                              const inBasket = isInBasket(browseVenue, prog.id)
                              return (
                                <div
                                  key={prog.id}
                                  className="group bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                                  style={{ 
                                    border: inBasket ? `2px solid ${venue.color}` : '1px solid #EAEDE6',
                                    boxShadow: inBasket ? `0 0 0 3px ${venue.color}20` : undefined
                                  }}
                                >
                                  {/* Color accent bar */}
                                  <div className="h-1" style={{ backgroundColor: inBasket ? venue.color : '#EAEDE6' }}></div>
                                  <div className="p-5">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                          <h4 className="font-bold" style={{ color: '#1E2333' }}>{prog.name}</h4>
                                          {inBasket && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: venue.color }}>
                                              Added
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm mb-3" style={{ color: '#676D82' }}>
                                          <span className="flex items-center gap-1.5">
                                            <Calendar size={14} style={{ color: venue.color }} /> {prog.day}
                                          </span>
                                          <span className="flex items-center gap-1.5">
                                            <Clock size={14} style={{ color: venue.color }} /> {prog.time}
                                          </span>
                                        </div>
                                        <p className="text-lg font-bold" style={{ color: venue.color }}>{prog.price}</p>
                                      </div>
                                      <button
                                        onClick={() => inBasket && prog.category !== 'Holiday Camps' ? removeFromBasket(basket.find(b => b.programmeId === prog.id)?.uid || '') : addToBasket(browseVenue, prog.id)}
                                        className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                                        style={{
                                          backgroundColor: inBasket ? venue.color : '#F7F9FA',
                                          color: inBasket ? (venue.color === '#dfd300' ? '#1E2333' : '#FFFFFF') : '#676D82',
                                          border: inBasket ? 'none' : '2px solid #EAEDE6'
                                        }}
                                      >
                                        {inBasket && prog.category !== 'Holiday Camps' ? <CheckCircle size={22} /> : <Plus size={22} />}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))
                    })()}
                  </div>

                  {/* Right: Basket sidebar */}
                  <div className="lg:w-80 flex-shrink-0">
                    <div className="bg-white rounded-2xl shadow-lg sticky top-24 overflow-hidden" style={{ border: '1px solid #EAEDE6' }}>
                      {/* Basket header with gradient */}
                      <div className="px-5 py-4" style={{ background: 'linear-gradient(135deg, #1E2333 0%, #2E354E 100%)' }}>
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-white flex items-center gap-2">
                            <ShoppingCart size={18} /> Basket
                          </h3>
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#dfd300', color: '#1E2333' }}>
                            {basket.length} item{basket.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      {basket.length === 0 ? (
                        <div className="p-8 text-center">
                          <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: '#F7F9FA' }}>
                            <ShoppingCart size={24} style={{ color: '#AFB0B3' }} />
                          </div>
                          <p className="text-sm font-medium" style={{ color: '#676D82' }}>Your basket is empty</p>
                          <p className="text-xs mt-1" style={{ color: '#AFB0B3' }}>Click + on any programme to add it</p>
                        </div>
                      ) : (
                        <>
                          <div className="divide-y max-h-[350px] overflow-y-auto" style={{ borderColor: '#EAEDE6' }}>
                            {basket.map(item => {
                              const prog = getProgramme(item.venueKey, item.programmeId)
                              const venue = allProgrammes[item.venueKey]
                              const itemPrice = calculateItemPrice(item)
                              const isCamp = prog?.category === 'Holiday Camps'
                              const needsConfig = isCamp && itemPrice === 0
                              return (
                                <div key={item.uid} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                                  <div className="flex items-start gap-3">
                                    <div className="w-1.5 h-10 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: venue.color }}></div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium truncate" style={{ color: '#1E2333' }}>{prog?.name}</p>
                                      <p className="text-xs" style={{ color: venue.color }}>{venue.name}</p>
                                      {needsConfig && (
                                        <p className="text-[10px] mt-0.5 flex items-center gap-1" style={{ color: '#F87D4D' }}><Info size={10} /> Configure at checkout</p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <span className="text-sm font-bold" style={{ color: '#1E2333' }}>{itemPrice > 0 ? `£${itemPrice.toFixed(2)}` : '—'}</span>
                                      <button onClick={() => removeFromBasket(item.uid)} className="p-1 rounded-full hover:bg-red-50 transition-all">
                                        <X size={14} style={{ color: '#EF4444' }} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          {/* Basket footer */}
                          <div className="px-5 py-4 border-t" style={{ borderColor: '#EAEDE6', backgroundColor: '#FAFBFC' }}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs" style={{ color: '#676D82' }}>{basket.length} programme{basket.length > 1 ? 's' : ''}</span>
                              <span className="text-xs" style={{ color: '#676D82' }}>{children.length} child{children.length > 1 ? 'ren' : ''}</span>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-sm font-medium" style={{ color: '#1E2333' }}>Estimated Total</span>
                              <span className="text-2xl font-bold" style={{ color: '#1E2333' }}>£{basketTotal.toFixed(2)}</span>
                            </div>
                            <button onClick={() => setStep('checkout')}
                              className="w-full py-3.5 rounded-full font-bold text-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2"
                              style={{ backgroundColor: '#dfd300', color: '#1E2333' }}>
                              Proceed to Checkout <ChevronRight size={16} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* CHECKOUT MODE */}
      {step === 'checkout' && (
        <section className="py-10" style={{ backgroundColor: '#F7F9FA' }}>
          <div className="max-w-5xl mx-auto px-4">
            <button onClick={() => setStep('browse')} className="text-sm mb-6 flex items-center gap-1 hover:underline" style={{ color: '#676D82' }}>
              ← Back to programmes
            </button>
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1 min-w-0">
                <div className="bg-white rounded-2xl p-8" style={{ boxShadow: '0 2px 16px 0 rgba(46, 53, 78, 0.05)' }}>
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basket items with config */}
                    <div>
                      <h3 className="text-lg font-bold mb-4" style={{ color: '#1E2333' }}>Your Programmes</h3>
                      <div className="space-y-3">
                        {basket.map(item => {
                          const prog = getProgramme(item.venueKey, item.programmeId)
                          const venue = allProgrammes[item.venueKey]
                          const isCamp = prog?.category === 'Holiday Camps'
                          const isSummer = (prog as any)?.isSummerCamp === true
                          const hasPrefs = !!(prog as any)?.hasSessionPrefs
                          const isExpanded = expandedItem === item.uid
                          const itemPrice = calculateItemPrice(item)
                          return (
                            <div key={item.uid} className="rounded-xl overflow-hidden" style={{ border: '1px solid #EAEDE6' }}>
                              <div className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50" onClick={() => setExpandedItem(isExpanded ? null : item.uid)}>
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: venue.color }}></div>
                                  <div className="min-w-0">
                                    <p className="font-medium text-sm truncate" style={{ color: '#1E2333' }}>{prog?.name}</p>
                                    <p className="text-xs" style={{ color: '#676D82' }}>{venue.name} • {prog?.day} • {prog?.time}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                  <span className="font-bold" style={{ color: venue.color }}>{itemPrice > 0 ? `£${itemPrice.toFixed(2)}` : '—'}</span>
                                  {(isCamp || hasPrefs) && (
                                    <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#F7F9FA', color: '#676D82' }}>{isExpanded ? 'Collapse' : 'Configure'}</span>
                                  )}
                                  <button type="button" onClick={(e) => { e.stopPropagation(); removeFromBasket(item.uid) }} className="p-1 rounded-full hover:bg-red-50">
                                    <X size={14} style={{ color: '#EF4444' }} />
                                  </button>
                                </div>
                              </div>

                              {/* Summer camp day selection */}
                              {isExpanded && isCamp && isSummer && (
                                <div className="px-5 pb-5 border-t" style={{ borderColor: '#EAEDE6' }}>
                                  <p className="text-xs mt-3 mb-3" style={{ color: '#676D82' }}>£30/day • Book Mon-Thu and get Friday FREE! (£120/week)</p>
                                  <div className="space-y-3">
                                    {summerCampWeeks.map(week => {
                                      const weekDays = item.weekSelections?.[week.id] || { ...defaultWeekDays }
                                      const monToThu = weekDays.mon && weekDays.tue && weekDays.wed && weekDays.thu
                                      const weekPrice = calculateWeekPrice(weekDays)
                                      const hasSelection = Object.values(weekDays).some(Boolean)
                                      return (
                                        <div key={week.id} className="p-3 rounded-lg" style={{ backgroundColor: hasSelection ? '#F0FDF4' : '#F7F9FA', border: hasSelection ? '1px solid #65B863' : '1px solid #EAEDE6' }}>
                                          <div className="flex items-center justify-between mb-2">
                                            <div>
                                              <span className="text-xs font-bold" style={{ color: '#1E2333' }}>{week.name}</span>
                                              <span className="text-[10px] ml-2" style={{ color: '#AFB0B3' }}>{week.dates}</span>
                                            </div>
                                            <div className="flex gap-1">
                                              <button type="button" onClick={() => selectItemFullWeek(item.uid, week.id)} className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#65B863', color: '#FFF' }}>All</button>
                                              {hasSelection && <button type="button" onClick={() => clearItemWeek(item.uid, week.id)} className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#EF4444', color: '#FFF' }}>Clear</button>}
                                            </div>
                                          </div>
                                          <div className="flex flex-wrap gap-1.5">
                                            {(['mon', 'tue', 'wed', 'thu', 'fri'] as const).map(day => {
                                              const isSelected = weekDays[day]
                                              const isFree = day === 'fri' && monToThu
                                              return (
                                                <button key={day} type="button" onClick={() => updateItemWeekSelection(item.uid, week.id, day)}
                                                  className="px-3 py-1 rounded text-[11px] font-bold transition-all"
                                                  style={{ backgroundColor: isSelected ? (isFree ? '#65B863' : '#dfd300') : '#FFF', color: isSelected ? (isFree ? '#FFF' : '#1E2333') : '#AFB0B3', border: isSelected ? 'none' : '1px solid #EAEDE6' }}>
                                                  {day.charAt(0).toUpperCase() + day.slice(1)}{isFree && isSelected ? ' ✓' : ''}
                                                </button>
                                              )
                                            })}
                                            {hasSelection && <span className="ml-auto text-xs font-bold" style={{ color: '#65B863' }}>£{weekPrice}</span>}
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Easter camp single week */}
                              {isExpanded && isCamp && !isSummer && (
                                <div className="px-5 pb-5 border-t" style={{ borderColor: '#EAEDE6' }}>
                                  <p className="text-xs mt-3 mb-3" style={{ color: '#676D82' }}>£30/day • Book Mon-Thu and get Friday FREE!</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(['mon', 'tue', 'wed', 'thu', 'fri'] as const).map(day => {
                                      const isSelected = item.singleWeekDays?.[day] || false
                                      const monToThu = item.singleWeekDays?.mon && item.singleWeekDays?.tue && item.singleWeekDays?.wed && item.singleWeekDays?.thu
                                      const isFree = day === 'fri' && monToThu
                                      return (
                                        <button key={day} type="button" onClick={() => toggleItemSingleDay(item.uid, day)}
                                          className="px-4 py-2 rounded-lg font-bold text-xs transition-all"
                                          style={{ backgroundColor: isSelected ? (isFree ? '#65B863' : '#dfd300') : '#F7F9FA', color: isSelected ? (isFree ? '#FFF' : '#1E2333') : '#676D82', border: isSelected ? 'none' : '1px solid #EAEDE6' }}>
                                          {day.charAt(0).toUpperCase() + day.slice(1)}{isFree && isSelected ? ' (FREE!)' : ''}
                                        </button>
                                      )
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Ludgrove session preferences */}
                              {isExpanded && hasPrefs && item.sessionPrefs && (
                                <div className="px-5 pb-5 border-t" style={{ borderColor: '#EAEDE6' }}>
                                  <p className="text-xs mt-3 mb-3" style={{ color: '#676D82' }}>Help us schedule your child&apos;s lessons</p>
                                  <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div className="p-3 rounded-lg" style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                                      <p className="text-[10px] font-bold mb-2" style={{ color: '#1E2333' }}>Preferred Slots</p>
                                      <div className="flex flex-wrap gap-1">
                                        {(['breakfast', 'fruit', 'rest'] as const).map(slot => (
                                          <button key={slot} type="button" onClick={() => toggleItemSessionPref(item.uid, 'preferred', slot)}
                                            className="px-2 py-1 rounded text-[10px] font-medium transition-all"
                                            style={{ backgroundColor: item.sessionPrefs!.preferred.includes(slot) ? '#65B863' : '#FFF', color: item.sessionPrefs!.preferred.includes(slot) ? '#FFF' : '#676D82', border: '1px solid #EAEDE6' }}>
                                            {slot.charAt(0).toUpperCase() + slot.slice(1)}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="p-3 rounded-lg" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
                                      <p className="text-[10px] font-bold mb-2" style={{ color: '#1E2333' }}>Avoid Slots</p>
                                      <div className="flex flex-wrap gap-1">
                                        {(['breakfast', 'fruit', 'rest'] as const).map(slot => (
                                          <button key={slot} type="button" onClick={() => toggleItemSessionPref(item.uid, 'avoid', slot)}
                                            className="px-2 py-1 rounded text-[10px] font-medium transition-all"
                                            style={{ backgroundColor: item.sessionPrefs!.avoid.includes(slot) ? '#EF4444' : '#FFF', color: item.sessionPrefs!.avoid.includes(slot) ? '#FFF' : '#676D82', border: '1px solid #EAEDE6' }}>
                                            {slot.charAt(0).toUpperCase() + slot.slice(1)}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-lg" style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                                      <p className="text-[10px] font-bold mb-2" style={{ color: '#1E2333' }}>Preferred Days</p>
                                      <div className="flex flex-wrap gap-1">
                                        {(['mon', 'tue', 'wed', 'thu', 'fri'] as const).map(day => (
                                          <button key={day} type="button" onClick={() => toggleItemDayPref(item.uid, 'preferredDays', day)}
                                            className="px-2 py-1 rounded text-[10px] font-medium transition-all"
                                            style={{ backgroundColor: item.sessionPrefs!.preferredDays.includes(day) ? '#65B863' : '#FFF', color: item.sessionPrefs!.preferredDays.includes(day) ? '#FFF' : '#676D82', border: '1px solid #EAEDE6' }}>
                                            {day.charAt(0).toUpperCase() + day.slice(1)}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="p-3 rounded-lg" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
                                      <p className="text-[10px] font-bold mb-2" style={{ color: '#1E2333' }}>Avoid Days</p>
                                      <div className="flex flex-wrap gap-1">
                                        {(['mon', 'tue', 'wed', 'thu', 'fri'] as const).map(day => (
                                          <button key={day} type="button" onClick={() => toggleItemDayPref(item.uid, 'avoidDays', day)}
                                            className="px-2 py-1 rounded text-[10px] font-medium transition-all"
                                            style={{ backgroundColor: item.sessionPrefs!.avoidDays.includes(day) ? '#EF4444' : '#FFF', color: item.sessionPrefs!.avoidDays.includes(day) ? '#FFF' : '#676D82', border: '1px solid #EAEDE6' }}>
                                            {day.charAt(0).toUpperCase() + day.slice(1)}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                      <button type="button" onClick={() => setStep('browse')} className="mt-3 text-sm font-medium flex items-center gap-1 hover:underline" style={{ color: '#676D82' }}>
                        <Plus size={14} /> Add another programme
                      </button>
                    </div>

                    {/* Parent Details */}
                    <div>
                      <h3 className="text-lg font-bold mb-4" style={{ color: '#1E2333' }}>Parent/Guardian Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: '#1E2333' }}>Full Name *</label>
                          <input type="text" name="parentName" required value={parentData.parentName} onChange={handleParentChange}
                            className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2" style={{ borderColor: '#EAEDE6' }} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: '#1E2333' }}>Email Address *</label>
                          <input type="email" name="parentEmail" required value={parentData.parentEmail} onChange={handleParentChange}
                            className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2" style={{ borderColor: '#EAEDE6' }} />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-2" style={{ color: '#1E2333' }}>Phone Number *</label>
                          <input type="tel" name="parentPhone" required value={parentData.parentPhone} onChange={handleParentChange}
                            className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2" style={{ borderColor: '#EAEDE6' }} />
                        </div>
                      </div>
                    </div>

                    {/* Children Details */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold" style={{ color: '#1E2333' }}>Children Details ({children.length}/5)</h3>
                        {children.length < 5 && (
                          <button type="button" onClick={addChild} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all" style={{ backgroundColor: '#65B863', color: '#FFFFFF' }}>
                            <Plus size={16} /> Add Child
                          </button>
                        )}
                      </div>
                      {children.map((child, index) => (
                        <div key={index} className="mb-4 p-4 rounded-xl" style={{ backgroundColor: '#F7F9FA', border: '1px solid #EAEDE6' }}>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-sm" style={{ color: '#1E2333' }}>Child {index + 1}</h4>
                            {children.length > 1 && (
                              <button type="button" onClick={() => removeChild(index)} className="p-1.5 rounded-full hover:bg-red-100 transition-all">
                                <X size={14} style={{ color: '#EF4444' }} />
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: '#1E2333' }}>Name *</label>
                              <input type="text" required value={child.name} onChange={(e) => updateChild(index, 'name', e.target.value)}
                                className="w-full px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 bg-white text-sm" style={{ borderColor: '#EAEDE6' }} />
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: '#1E2333' }}>Age *</label>
                              <input type="text" required value={child.age} onChange={(e) => updateChild(index, 'age', e.target.value)}
                                className="w-full px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 bg-white text-sm" style={{ borderColor: '#EAEDE6' }} />
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: '#1E2333' }}>Experience</label>
                              <select value={child.experience} onChange={(e) => updateChild(index, 'experience', e.target.value)}
                                className="w-full px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 bg-white text-sm" style={{ borderColor: '#EAEDE6' }}>
                                <option value="">Select level</option>
                                <option value="Complete Beginner">Complete Beginner</option>
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: '#1E2333' }}>Medical Info</label>
                              <input type="text" value={child.medicalInfo} onChange={(e) => updateChild(index, 'medicalInfo', e.target.value)}
                                placeholder="Allergies, conditions, etc." className="w-full px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 bg-white text-sm" style={{ borderColor: '#EAEDE6' }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Additional Info */}
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#1E2333' }}>Additional Message</label>
                      <textarea name="message" rows={3} value={parentData.message} onChange={handleParentChange}
                        className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 resize-none" style={{ borderColor: '#EAEDE6' }}
                        placeholder="Any questions or special requirements..." />
                    </div>

                    <button type="submit" disabled={isSubmitting || basket.length === 0}
                      className="w-full py-4 rounded-full font-bold text-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      style={{ backgroundColor: '#dfd300', color: '#1E2333' }}>
                      {isSubmitting ? 'Submitting...' : `Submit Booking — £${basketTotal.toFixed(2)}`}
                      <ChevronRight size={20} />
                    </button>
                    <p className="text-center text-sm" style={{ color: '#676D82' }}>An invoice will be sent to your email address for each programme.</p>
                  </form>
                </div>
              </div>

              {/* Order summary sidebar */}
              <div className="lg:w-72 flex-shrink-0">
                <div className="bg-white rounded-2xl shadow-sm sticky top-24" style={{ border: '1px solid #EAEDE6' }}>
                  <div className="px-5 py-4 border-b" style={{ borderColor: '#EAEDE6' }}>
                    <h3 className="font-bold text-sm" style={{ color: '#1E2333' }}>Order Summary</h3>
                  </div>
                  <div className="px-5 py-4 space-y-3">
                    {basket.map(item => {
                      const prog = getProgramme(item.venueKey, item.programmeId)
                      const venue = allProgrammes[item.venueKey]
                      const itemPrice = calculateItemPrice(item)
                      return (
                        <div key={item.uid} className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate" style={{ color: '#1E2333' }}>{prog?.name}</p>
                            <p className="text-[10px]" style={{ color: venue.color }}>{venue.name}</p>
                          </div>
                          <span className="text-xs font-bold flex-shrink-0" style={{ color: '#1E2333' }}>£{(itemPrice * children.length).toFixed(2)}</span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="px-5 py-4 border-t" style={{ borderColor: '#EAEDE6' }}>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium" style={{ color: '#676D82' }}>Total</span>
                      <span className="text-xl font-bold" style={{ color: '#1E2333' }}>£{basketTotal.toFixed(2)}</span>
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: '#AFB0B3' }}>{children.length} child{children.length > 1 ? 'ren' : ''} × {basket.length} programme{basket.length > 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Mobile sticky basket bar */}
      {step === 'browse' && basket.length > 0 && browseVenue && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2" style={{ background: 'linear-gradient(to top, #F7F9FA 60%, transparent)' }}>
          <button onClick={() => setStep('checkout')}
            className="w-full py-4 rounded-full font-bold text-sm flex items-center justify-center gap-3 shadow-xl"
            style={{ backgroundColor: '#dfd300', color: '#1E2333' }}>
            <div className="relative">
              <ShoppingCart size={18} />
              <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center" style={{ backgroundColor: '#1E2333', color: '#FFF' }}>{basket.length}</span>
            </div>
            Checkout — £{basketTotal.toFixed(2)} ({basket.length} item{basket.length > 1 ? 's' : ''})
          </button>
        </div>
      )}
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="pt-20 min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#F87D4D] border-t-transparent rounded-full" /></div>}>
      <BookingPageContent />
    </Suspense>
  )
}
