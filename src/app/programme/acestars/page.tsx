'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Clock, MapPin, ChevronRight, Calendar, Users, Star, X, CheckCircle, AlertCircle } from 'lucide-react'

// Easter Holiday Camps
const easterCamps = [
  { id: 'easter-1', week: 'Week 1', dates: '6th - 10th April 2026', days: ['Mon 6th', 'Tue 7th', 'Wed 8th', 'Thu 9th', 'Fri 10th'], time: '9am - 1pm', dayPrice: 30, weekPrice: 120 },
  { id: 'easter-2', week: 'Week 2', dates: '13th - 17th April 2026', days: ['Mon 13th', 'Tue 14th', 'Wed 15th', 'Thu 16th', 'Fri 17th'], time: '9am - 1pm', dayPrice: 30, weekPrice: 120 },
]

// Summer Holiday Camps
const summerCamps = [
  { id: 'summer-1', week: 'Week 1', dates: '20th - 24th July 2026', days: ['Mon 20th', 'Tue 21st', 'Wed 22nd', 'Thu 23rd', 'Fri 24th'], time: '9am - 1pm', dayPrice: 30, weekPrice: 120 },
  { id: 'summer-2', week: 'Week 2', dates: '27th - 31st July 2026', days: ['Mon 27th', 'Tue 28th', 'Wed 29th', 'Thu 30th', 'Fri 31st'], time: '9am - 1pm', dayPrice: 30, weekPrice: 120 },
  { id: 'summer-3', week: 'Week 3', dates: '3rd - 7th August 2026', days: ['Mon 3rd', 'Tue 4th', 'Wed 5th', 'Thu 6th', 'Fri 7th'], time: '9am - 1pm', dayPrice: 30, weekPrice: 120 },
  { id: 'summer-4', week: 'Week 4', dates: '10th - 14th August 2026', days: ['Mon 10th', 'Tue 11th', 'Wed 12th', 'Thu 13th', 'Fri 14th'], time: '9am - 1pm', dayPrice: 30, weekPrice: 120 },
  { id: 'summer-5', week: 'Week 5', dates: '17th - 21st August 2026', days: ['Mon 17th', 'Tue 18th', 'Wed 19th', 'Thu 20th', 'Fri 21st'], time: '9am - 1pm', dayPrice: 30, weekPrice: 120 },
  { id: 'summer-6', week: 'Week 6', dates: '24th - 28th August 2026', days: ['Mon 24th', 'Tue 25th', 'Wed 26th', 'Thu 27th', 'Fri 28th'], time: '9am - 1pm', dayPrice: 30, weekPrice: 120 },
]

type Camp = typeof easterCamps[0]

// Day selection state type
type DaySelections = {
  [campId: string]: {
    mon: boolean;
    tue: boolean;
    wed: boolean;
    thu: boolean;
    fri: boolean;
  }
}

// Calculate price based on selected days
const calculateCampPrice = (selections: { mon: boolean; tue: boolean; wed: boolean; thu: boolean; fri: boolean }) => {
  const monToThu = [selections.mon, selections.tue, selections.wed, selections.thu].filter(Boolean).length
  const allMonToThu = selections.mon && selections.tue && selections.wed && selections.thu
  
  if (allMonToThu) {
    // Mon-Thu booked = £120, Friday is FREE
    return { price: 120, friIsFree: true, daysCount: selections.fri ? 5 : 4 }
  }
  
  // Otherwise £30 per day
  const totalDays = [selections.mon, selections.tue, selections.wed, selections.thu, selections.fri].filter(Boolean).length
  return { price: totalDays * 30, friIsFree: false, daysCount: totalDays }
}

type TermClass = {
  name: string;
  day: string;
  time: string;
  color: string;
}

function AceStarsProgrammeContent() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<'private' | 'term' | 'camps'>('private')
  
  // Read tab from URL query parameter
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'camps' || tab === 'term' || tab === 'private') {
      setActiveTab(tab)
    }
  }, [searchParams])
  const [selectedCamp, setSelectedCamp] = useState<Camp | null>(null)
  const [selectedTermClass, setSelectedTermClass] = useState<TermClass | null>(null)
  const [bookingSubmitted, setBookingSubmitted] = useState(false)
  const [daySelections, setDaySelections] = useState<DaySelections>({})
  const [termFormData, setTermFormData] = useState({
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    childName: '',
    childAge: '',
    medicalInfo: '',
  })
  const [formData, setFormData] = useState({
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    childName: '',
    childAge: '',
    medicalInfo: '',
    emergencyContact: '',
    emergencyPhone: '',
  })

  // Initialize day selections for all camps
  const initializeDaySelections = () => {
    const allCamps = [...easterCamps, ...summerCamps]
    const initial: DaySelections = {}
    allCamps.forEach(camp => {
      initial[camp.id] = { mon: false, tue: false, wed: false, thu: false, fri: false }
    })
    return initial
  }

  // Toggle day selection for a camp
  const toggleDay = (campId: string, day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri') => {
    setDaySelections(prev => ({
      ...prev,
      [campId]: {
        ...(prev[campId] || { mon: false, tue: false, wed: false, thu: false, fri: false }),
        [day]: !(prev[campId]?.[day] || false)
      }
    }))
  }

  // Select full week (Mon-Thu + Fri free)
  const selectFullWeek = (campId: string) => {
    setDaySelections(prev => ({
      ...prev,
      [campId]: { mon: true, tue: true, wed: true, thu: true, fri: true }
    }))
  }

  // Clear week selection
  const clearWeek = (campId: string) => {
    setDaySelections(prev => ({
      ...prev,
      [campId]: { mon: false, tue: false, wed: false, thu: false, fri: false }
    }))
  }

  // Get selection for a camp
  const getCampSelection = (campId: string) => {
    return daySelections[campId] || { mon: false, tue: false, wed: false, thu: false, fri: false }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Create mailto link with form data
    const subject = encodeURIComponent(`Holiday Camp Booking - ${selectedCamp?.week} (${selectedCamp?.dates})`)
    const body = encodeURIComponent(
      `Camp: ${selectedCamp?.week}\n` +
      `Dates: ${selectedCamp?.dates}\n` +
      `Time: ${selectedCamp?.time}\n` +
      `Price: £${selectedCamp?.weekPrice}/week or £${selectedCamp?.dayPrice}/day\n\n` +
      `Parent/Guardian: ${formData.parentName}\n` +
      `Email: ${formData.parentEmail}\n` +
      `Phone: ${formData.parentPhone}\n\n` +
      `Child Name: ${formData.childName}\n` +
      `Child Age: ${formData.childAge}\n` +
      `Medical Info: ${formData.medicalInfo}\n\n` +
      `Emergency Contact: ${formData.emergencyContact}\n` +
      `Emergency Phone: ${formData.emergencyPhone}`
    )
    window.location.href = `mailto:acestarsbookings@gmail.com?subject=${subject}&body=${body}`
    
    setBookingSubmitted(true)
  }

  const closeModal = () => {
    setSelectedCamp(null)
    setBookingSubmitted(false)
    setFormData({
      parentName: '',
      parentEmail: '',
      parentPhone: '',
      childName: '',
      childAge: '',
      medicalInfo: '',
      emergencyContact: '',
      emergencyPhone: '',
    })
  }

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section 
        className="relative min-h-[50vh] flex items-center justify-center overflow-hidden"
        style={{ 
          backgroundImage: 'url(/images/uploads/2019/02/9.jpg)',
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
            AceStars Tennis - Open to Anyone
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
            <Link 
              href="/programme"
              className="relative rounded-2xl overflow-hidden cursor-pointer group transition-all hover:shadow-2xl hover:-translate-y-1"
              style={{ border: '2px solid #EAEDE6' }}
            >
              <div 
                className="h-64"
                style={{ 
                  backgroundImage: 'url(https://www.edgbarrowschool.co.uk/wp-content/uploads/2023/09/Edgbarrow-School-July-2023-45-1024x683.jpg)',
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

            {/* AceStars Tennis - Selected */}
            <div 
              className="relative rounded-2xl overflow-hidden"
              style={{ border: '3px solid #dfd300', boxShadow: '0 0 20px rgba(223, 211, 0, 0.3)' }}
            >
              <div 
                className="h-64"
                style={{ 
                  backgroundImage: 'url(/images/uploads/2019/02/9.jpg)',
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
                <h4 className="text-2xl font-bold text-white mb-1">AceStars Tennis</h4>
                <p className="text-sm text-white/80 mb-3">Everyone welcome • Term time & Holiday camps</p>
                <div className="flex items-center gap-2" style={{ color: '#dfd300' }}>
                  <span className="font-bold">Selected</span>
                  <CheckCircle size={18} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon Banner */}
      <section className="py-6" style={{ backgroundColor: '#2E354E' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-4">
            <Star size={24} style={{ color: '#dfd300' }} />
            <p className="text-white text-center">
              <strong style={{ color: '#dfd300' }}>AceStars Community Tennis Club</strong> - Opening Soon...
            </p>
            <Star size={24} style={{ color: '#dfd300' }} />
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section id="programmes" className="bg-white border-b" style={{ borderColor: '#EAEDE6' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center flex-wrap">
            <button
              onClick={() => setActiveTab('private')}
              className={`px-6 py-5 font-bold text-sm transition-all border-b-4 ${
                activeTab === 'private' ? 'border-accent' : 'border-transparent'
              }`}
              style={{ color: activeTab === 'private' ? '#dfd300' : '#1E2333' }}
            >
              <Users className="inline-block mr-2" size={18} />
              Private 1-2-1 Lessons
            </button>
            <button
              onClick={() => setActiveTab('term')}
              className={`px-6 py-5 font-bold text-sm transition-all border-b-4 ${
                activeTab === 'term' ? 'border-accent' : 'border-transparent'
              }`}
              style={{ color: activeTab === 'term' ? '#dfd300' : '#1E2333' }}
            >
              <Calendar className="inline-block mr-2" size={18} />
              Term Time Programme
            </button>
            <button
              onClick={() => setActiveTab('camps')}
              className={`px-6 py-5 font-bold text-sm transition-all border-b-4 ${
                activeTab === 'camps' ? 'border-accent' : 'border-transparent'
              }`}
              style={{ color: activeTab === 'camps' ? '#dfd300' : '#1E2333' }}
            >
              <Star className="inline-block mr-2" size={18} />
              Holiday Camps
            </button>
          </div>
        </div>
      </section>

      {/* Private 1-2-1 Lessons */}
      {activeTab === 'private' && (
        <section className="py-16" style={{ backgroundColor: '#F7F9FA' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div 
              className="rounded-xl p-12 text-center"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #EAEDE6' }}
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#65B86320' }}>
                <Users size={40} style={{ color: '#65B863' }} />
              </div>
              <h2 className="text-3xl font-bold mb-4" style={{ color: '#1E2333' }}>Private 1-2-1 Lessons</h2>
              <p className="text-lg mb-8" style={{ color: '#676D82' }}>
                Personalised one-to-one tennis coaching tailored to your individual needs and goals. 
                Available for all ages and abilities.
              </p>
              
              <h3 className="text-xl font-bold mb-6" style={{ color: '#1E2333' }}>Contact Us to Book</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                {/* Peter Collier */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-bold text-lg mb-2" style={{ color: '#1E2333' }}>Peter Collier</h4>
                  <p className="text-sm mb-4" style={{ color: '#676D82' }}>Senior Coach</p>
                  <a 
                    href="https://wa.me/447915269562"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all hover:opacity-90"
                    style={{ backgroundColor: '#25D366', color: '#FFFFFF' }}
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp: 07915 269562
                  </a>
                </div>
                
                {/* Wojtek Specylak */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-bold text-lg mb-2" style={{ color: '#1E2333' }}>Wojtek Specylak</h4>
                  <p className="text-sm mb-4" style={{ color: '#676D82' }}>Head Coach</p>
                  <a 
                    href="https://wa.me/447915269562"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all hover:opacity-90"
                    style={{ backgroundColor: '#25D366', color: '#FFFFFF' }}
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp: 07915 269562
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Term Time Programme */}
      {activeTab === 'term' && (
        <section className="py-16" style={{ backgroundColor: '#F7F9FA' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Term Dates */}
            <div 
              className="rounded-xl p-6 mb-8"
              style={{ backgroundColor: '#2E354E' }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <h3 className="text-xl font-bold text-white">Summer Term 2026</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="bg-white/10 rounded-lg px-4 py-2">
                    <p className="text-xs font-bold" style={{ color: '#dfd300' }}>Start</p>
                    <p className="text-sm text-white">Monday 13th April</p>
                  </div>
                  <div className="bg-white/10 rounded-lg px-4 py-2">
                    <p className="text-xs font-bold" style={{ color: '#dfd300' }}>Half Term</p>
                    <p className="text-sm text-white">25th - 29th May</p>
                  </div>
                  <div className="bg-white/10 rounded-lg px-4 py-2">
                    <p className="text-xs font-bold" style={{ color: '#dfd300' }}>End</p>
                    <p className="text-sm text-white">Friday 17th July</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2" style={{ color: '#1E2333' }}>Term Time Classes</h2>
              <p style={{ color: '#676D82' }}>12 weeks (excluding half term) • £8.99 per session • £107.88 per term</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Orange/Green Ball */}
              <div className="bg-white rounded-xl p-6" style={{ border: '1px solid #EAEDE6' }}>
                <div className="h-2 rounded-t-xl -mt-6 -mx-6 mb-4" style={{ backgroundColor: '#F87D4D' }}></div>
                <h3 className="text-xl font-bold mb-2" style={{ color: '#1E2333' }}>Orange/Green Ball</h3>
                <p className="text-sm mb-4" style={{ color: '#676D82' }}>Beginner/Intermediate</p>
                <div className="space-y-2 mb-4">
                  <p className="flex items-center gap-2"><Calendar size={16} style={{ color: '#AFB0B3' }} /> Tuesday</p>
                  <p className="flex items-center gap-2"><Clock size={16} style={{ color: '#AFB0B3' }} /> 6:30pm - 7:30pm</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm" style={{ color: '#676D82' }}>12 sessions × £8.99</p>
                  <p className="text-xl font-bold" style={{ color: '#F87D4D' }}>£107.88 per term</p>
                </div>
                <Link 
                  href="/booking?venue=acestars&programme=ace-orange"
                  className="block w-full py-3 rounded-full font-bold text-sm text-center transition-all hover:shadow-lg hover:scale-[1.02]" 
                  style={{ backgroundColor: '#F87D4D', color: '#FFFFFF' }}
                >
                  Book Now <ChevronRight size={16} className="inline ml-1" />
                </Link>
              </div>

              {/* Yellow Ball */}
              <div className="bg-white rounded-xl p-6" style={{ border: '1px solid #EAEDE6' }}>
                <div className="h-2 rounded-t-xl -mt-6 -mx-6 mb-4" style={{ backgroundColor: '#dfd300' }}></div>
                <h3 className="text-xl font-bold mb-2" style={{ color: '#1E2333' }}>Yellow Ball</h3>
                <p className="text-sm mb-4" style={{ color: '#676D82' }}>Beginner/Intermediate</p>
                <div className="space-y-2 mb-4">
                  <p className="flex items-center gap-2"><Calendar size={16} style={{ color: '#AFB0B3' }} /> Tuesday</p>
                  <p className="flex items-center gap-2"><Clock size={16} style={{ color: '#AFB0B3' }} /> 5:30pm - 6:30pm</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm" style={{ color: '#676D82' }}>12 sessions × £8.99</p>
                  <p className="text-xl font-bold" style={{ color: '#dfd300' }}>£107.88 per term</p>
                </div>
                <Link 
                  href="/booking?venue=acestars&programme=ace-yellow"
                  className="block w-full py-3 rounded-full font-bold text-sm text-center transition-all hover:shadow-lg hover:scale-[1.02]" 
                  style={{ backgroundColor: '#dfd300', color: '#1E2333' }}
                >
                  Book Now <ChevronRight size={16} className="inline ml-1" />
                </Link>
              </div>

              {/* Mini Red */}
              <div className="bg-white rounded-xl p-6" style={{ border: '1px solid #EAEDE6' }}>
                <div className="h-2 rounded-t-xl -mt-6 -mx-6 mb-4" style={{ backgroundColor: '#E53935' }}></div>
                <h3 className="text-xl font-bold mb-2" style={{ color: '#1E2333' }}>Mini Red</h3>
                <p className="text-sm mb-4" style={{ color: '#676D82' }}>Beginner/Intermediate</p>
                <div className="space-y-2 mb-4">
                  <p className="flex items-center gap-2"><Calendar size={16} style={{ color: '#AFB0B3' }} /> Sunday</p>
                  <p className="flex items-center gap-2"><Clock size={16} style={{ color: '#AFB0B3' }} /> 10:15am - 11:15am</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm" style={{ color: '#676D82' }}>12 sessions × £8.99</p>
                  <p className="text-xl font-bold" style={{ color: '#E53935' }}>£107.88 per term</p>
                </div>
                <Link 
                  href="/booking?venue=acestars&programme=ace-red"
                  className="block w-full py-3 rounded-full font-bold text-sm text-center transition-all hover:shadow-lg hover:scale-[1.02]" 
                  style={{ backgroundColor: '#E53935', color: '#FFFFFF' }}
                >
                  Book Now <ChevronRight size={16} className="inline ml-1" />
                </Link>
              </div>
            </div>

            {/* Trial Session */}
            <div className="bg-white rounded-xl p-6 text-center" style={{ border: '2px solid #65B863' }}>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#1E2333' }}>Try Before You Commit!</h3>
              <p className="mb-4" style={{ color: '#676D82' }}>A single trial session is available before committing to the term.</p>
              <p className="text-2xl font-bold mb-4" style={{ color: '#65B863' }}>£8.99 Trial Session</p>
              <Link 
                href="/booking?venue=acestars&programme=ace-trial"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all hover:shadow-lg hover:scale-[1.02]" 
                style={{ backgroundColor: '#65B863', color: '#FFFFFF' }}
              >
                Book Trial <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Holiday Camps */}
      {activeTab === 'camps' && (
        <section className="py-16" style={{ backgroundColor: '#F7F9FA' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Easter Camps */}
            <div className="mb-16">
              <div 
                className="rounded-xl p-8 mb-8 relative overflow-hidden"
                style={{ 
                  backgroundImage: 'url(/images/uploads/2019/02/10.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0" style={{ backgroundColor: 'rgba(101, 184, 99, 0.9)' }}></div>
                <div className="relative z-10 text-center">
                  <h2 className="text-4xl font-bold text-white mb-4">Easter Holiday Tennis Camps</h2>
                  <p className="text-xl text-white/90 mb-2">Ages 6-16 • All Abilities Welcome</p>
                  <p className="text-lg text-white/80">Monday - Friday • 9am - 1pm</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {easterCamps.map((camp) => {
                  const selection = getCampSelection(camp.id)
                  const pricing = calculateCampPrice(selection)
                  const allMonThu = selection.mon && selection.tue && selection.wed && selection.thu
                  
                  return (
                    <div 
                      key={camp.id}
                      className="bg-white rounded-xl p-6"
                      style={{ border: '1px solid #EAEDE6' }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span 
                          className="px-4 py-2 rounded-full font-bold"
                          style={{ backgroundColor: '#65B863', color: '#FFFFFF' }}
                        >
                          {camp.week}
                        </span>
                        <div className="text-right">
                          <p className="text-2xl font-bold" style={{ color: pricing.daysCount > 0 ? '#65B863' : '#AFB0B3' }}>
                            £{pricing.price}
                          </p>
                          {pricing.friIsFree && <p className="text-xs font-bold" style={{ color: '#65B863' }}>Fri FREE!</p>}
                        </div>
                      </div>
                      <h4 className="text-lg font-bold mb-1" style={{ color: '#1E2333' }}>{camp.dates}</h4>
                      <p className="text-sm mb-4" style={{ color: '#676D82' }}>{camp.time}</p>
                      
                      {/* Day Selection */}
                      <div className="mb-4">
                        <p className="text-xs font-bold mb-2" style={{ color: '#676D82' }}>Select Days:</p>
                        <div className="grid grid-cols-5 gap-2">
                          {(['mon', 'tue', 'wed', 'thu', 'fri'] as const).map((day, i) => {
                            const isSelected = selection[day]
                            const isFriAndFree = day === 'fri' && allMonThu
                            return (
                              <button
                                key={day}
                                onClick={(e) => { e.stopPropagation(); toggleDay(camp.id, day) }}
                                className={`py-2 px-1 rounded-lg text-xs font-bold transition-all ${isSelected ? 'ring-2 ring-offset-1' : ''}`}
                                style={{ 
                                  backgroundColor: isSelected ? (isFriAndFree ? '#65B863' : '#dfd300') : '#F7F9FA',
                                  color: isSelected ? (isFriAndFree ? '#FFFFFF' : '#1E2333') : '#676D82'
                                }}
                              >
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][i]}
                                {isFriAndFree && isSelected && <span className="block text-[10px]">FREE</span>}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                      
                      {/* Quick Actions */}
                      <div className="flex gap-2 mb-4">
                        <button
                          onClick={(e) => { e.stopPropagation(); selectFullWeek(camp.id) }}
                          className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                          style={{ backgroundColor: '#65B86320', color: '#65B863' }}
                        >
                          Full Week (£120)
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); clearWeek(camp.id) }}
                          className="py-2 px-3 rounded-lg text-xs font-bold transition-all"
                          style={{ backgroundColor: '#F7F9FA', color: '#676D82' }}
                        >
                          Clear
                        </button>
                      </div>
                      
                      {pricing.daysCount > 0 ? (
                        <Link 
                          href={`/booking?venue=acestars&programme=${camp.id === 'easter-1' ? 'ace-easter1' : 'ace-easter2'}`}
                          className="block w-full py-3 rounded-full font-bold text-sm text-center transition-all hover:shadow-lg hover:scale-[1.02]"
                          style={{ backgroundColor: '#dfd300', color: '#1E2333' }}
                        >
                          Book {pricing.daysCount} Day{pricing.daysCount > 1 ? 's' : ''} - £{pricing.price} <ChevronRight size={16} className="inline ml-1" />
                        </Link>
                      ) : (
                        <div 
                          className="w-full py-3 rounded-full font-bold text-sm text-center"
                          style={{ backgroundColor: '#EAEDE6', color: '#AFB0B3', cursor: 'not-allowed' }}
                        >
                          Select Days
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Summer Camps */}
            <div>
              <div 
                className="rounded-xl p-8 mb-8 relative overflow-hidden"
                style={{ 
                  backgroundImage: 'url(/images/uploads/2019/02/9.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0" style={{ backgroundColor: 'rgba(248, 125, 77, 0.9)' }}></div>
                <div className="relative z-10 text-center">
                  <h2 className="text-4xl font-bold text-white mb-4">Summer Holiday Tennis Camps</h2>
                  <p className="text-xl text-white/90 mb-2">Ages 6-16 • All Abilities Welcome</p>
                  <p className="text-lg text-white/80">Monday - Friday • 9am - 1pm</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {summerCamps.map((camp) => {
                  const selection = getCampSelection(camp.id)
                  const pricing = calculateCampPrice(selection)
                  const allMonThu = selection.mon && selection.tue && selection.wed && selection.thu
                  
                  return (
                    <div 
                      key={camp.id}
                      className="bg-white rounded-xl p-6"
                      style={{ border: '1px solid #EAEDE6' }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span 
                          className="px-4 py-2 rounded-full font-bold"
                          style={{ backgroundColor: '#F87D4D', color: '#FFFFFF' }}
                        >
                          {camp.week}
                        </span>
                        <div className="text-right">
                          <p className="text-2xl font-bold" style={{ color: pricing.daysCount > 0 ? '#F87D4D' : '#AFB0B3' }}>
                            £{pricing.price}
                          </p>
                          {pricing.friIsFree && <p className="text-xs font-bold" style={{ color: '#65B863' }}>Fri FREE!</p>}
                        </div>
                      </div>
                      <h4 className="text-lg font-bold mb-1" style={{ color: '#1E2333' }}>{camp.dates}</h4>
                      <p className="text-sm mb-4" style={{ color: '#676D82' }}>{camp.time}</p>
                      
                      {/* Day Selection */}
                      <div className="mb-4">
                        <p className="text-xs font-bold mb-2" style={{ color: '#676D82' }}>Select Days:</p>
                        <div className="grid grid-cols-5 gap-1">
                          {(['mon', 'tue', 'wed', 'thu', 'fri'] as const).map((day, i) => {
                            const isSelected = selection[day]
                            const isFriAndFree = day === 'fri' && allMonThu
                            return (
                              <button
                                key={day}
                                onClick={(e) => { e.stopPropagation(); toggleDay(camp.id, day) }}
                                className={`py-2 px-1 rounded-lg text-xs font-bold transition-all ${isSelected ? 'ring-2 ring-offset-1' : ''}`}
                                style={{ 
                                  backgroundColor: isSelected ? (isFriAndFree ? '#65B863' : '#dfd300') : '#F7F9FA',
                                  color: isSelected ? (isFriAndFree ? '#FFFFFF' : '#1E2333') : '#676D82'
                                }}
                              >
                                {['M', 'T', 'W', 'T', 'F'][i]}
                                {isFriAndFree && isSelected && <span className="block text-[9px]">FREE</span>}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                      
                      {/* Quick Actions */}
                      <div className="flex gap-2 mb-4">
                        <button
                          onClick={(e) => { e.stopPropagation(); selectFullWeek(camp.id) }}
                          className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                          style={{ backgroundColor: '#F87D4D20', color: '#F87D4D' }}
                        >
                          Full Week
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); clearWeek(camp.id) }}
                          className="py-2 px-3 rounded-lg text-xs font-bold transition-all"
                          style={{ backgroundColor: '#F7F9FA', color: '#676D82' }}
                        >
                          Clear
                        </button>
                      </div>
                      
                      {pricing.daysCount > 0 ? (
                        <Link 
                          href="/booking?venue=acestars&programme=ace-summer"
                          className="block w-full py-3 rounded-full font-bold text-sm text-center transition-all hover:shadow-lg hover:scale-[1.02]"
                          style={{ backgroundColor: '#dfd300', color: '#1E2333' }}
                        >
                          Book {pricing.daysCount} Day{pricing.daysCount > 1 ? 's' : ''} - £{pricing.price} <ChevronRight size={16} className="inline ml-1" />
                        </Link>
                      ) : (
                        <div 
                          className="w-full py-3 rounded-full font-bold text-sm text-center"
                          style={{ backgroundColor: '#EAEDE6', color: '#AFB0B3', cursor: 'not-allowed' }}
                        >
                          Select Days
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Camp Details */}
            <div className="mt-12 bg-white rounded-xl p-8" style={{ border: '1px solid #EAEDE6' }}>
              <h3 className="text-2xl font-bold mb-6" style={{ color: '#1E2333' }}>Camp Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold mb-3" style={{ color: '#1E2333' }}>What to Expect</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="flex-shrink-0 mt-1" style={{ color: '#65B863' }} />
                      <span style={{ color: '#676D82' }}>Professional coaching from qualified instructors</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="flex-shrink-0 mt-1" style={{ color: '#65B863' }} />
                      <span style={{ color: '#676D82' }}>Fun games and activities for all skill levels</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="flex-shrink-0 mt-1" style={{ color: '#65B863' }} />
                      <span style={{ color: '#676D82' }}>Small group sizes for personalized attention</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="flex-shrink-0 mt-1" style={{ color: '#65B863' }} />
                      <span style={{ color: '#676D82' }}>Suitable for beginners to advanced players</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-3" style={{ color: '#1E2333' }}>What to Bring</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <ChevronRight size={16} className="flex-shrink-0 mt-1" style={{ color: '#dfd300' }} />
                      <span style={{ color: '#676D82' }}>Tennis racket (can be provided if needed)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight size={16} className="flex-shrink-0 mt-1" style={{ color: '#dfd300' }} />
                      <span style={{ color: '#676D82' }}>Appropriate sports clothing and trainers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight size={16} className="flex-shrink-0 mt-1" style={{ color: '#dfd300' }} />
                      <span style={{ color: '#676D82' }}>Water bottle and snacks</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight size={16} className="flex-shrink-0 mt-1" style={{ color: '#dfd300' }} />
                      <span style={{ color: '#676D82' }}>Sun cream and hat (weather dependent)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Booking Modal */}
      {selectedCamp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={closeModal}></div>
          <div 
            className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
          >
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={24} style={{ color: '#676D82' }} />
            </button>

            {bookingSubmitted ? (
              <div className="p-12 text-center">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ backgroundColor: '#65B863' }}
                >
                  <CheckCircle className="text-white" size={48} />
                </div>
                <h2 className="text-3xl font-bold mb-4" style={{ color: '#1E2333' }}>Booking Request Sent!</h2>
                <p className="mb-8" style={{ color: '#676D82' }}>
                  Thank you for your booking request for {selectedCamp.week}. We will confirm your place via email shortly.
                </p>
                <button 
                  onClick={closeModal}
                  className="px-8 py-3 rounded-full font-bold"
                  style={{ backgroundColor: '#dfd300', color: '#1E2333' }}
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="p-8">
                <div 
                  className="h-2 rounded-t-2xl -mt-8 -mx-8 mb-6"
                  style={{ backgroundColor: '#65B863' }}
                ></div>
                
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#1E2333' }}>
                  Book: {selectedCamp.week} - {selectedCamp.dates}
                </h2>
                <p className="mb-4" style={{ color: '#676D82' }}>
                  {selectedCamp.time}
                </p>
                
                {/* Camp Total */}
                {(() => {
                  const selection = getCampSelection(selectedCamp.id)
                  const pricing = calculateCampPrice(selection)
                  const selectedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].filter((_, i) => 
                    [selection.mon, selection.tue, selection.wed, selection.thu, selection.fri][i]
                  )
                  return (
                    <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: '#2E354E' }}>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-white/70">
                            {pricing.daysCount} day{pricing.daysCount !== 1 ? 's' : ''} selected: {selectedDays.join(', ')}
                          </p>
                          <p className="text-xs text-white/50 mt-1">
                            {pricing.friIsFree ? 'Mon-Thu = £120 + Fri FREE!' : `${pricing.daysCount} × £30/day`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-white/70">Total</p>
                          <p className="text-2xl font-bold" style={{ color: '#dfd300' }}>
                            £{pricing.price}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })()}

                <form onSubmit={handleBookingSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: '#1E2333' }}>
                        Parent/Guardian Name *
                      </label>
                      <input
                        type="text"
                        name="parentName"
                        value={formData.parentName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                        style={{ borderColor: '#EAEDE6', backgroundColor: '#F7F9FA' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: '#1E2333' }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="parentEmail"
                        value={formData.parentEmail}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                        style={{ borderColor: '#EAEDE6', backgroundColor: '#F7F9FA' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: '#1E2333' }}>
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="parentPhone"
                        value={formData.parentPhone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                        style={{ borderColor: '#EAEDE6', backgroundColor: '#F7F9FA' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: '#1E2333' }}>
                        Child&apos;s Name *
                      </label>
                      <input
                        type="text"
                        name="childName"
                        value={formData.childName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                        style={{ borderColor: '#EAEDE6', backgroundColor: '#F7F9FA' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: '#1E2333' }}>
                        Child&apos;s Age *
                      </label>
                      <input
                        type="text"
                        name="childAge"
                        value={formData.childAge}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. 10"
                        className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                        style={{ borderColor: '#EAEDE6', backgroundColor: '#F7F9FA' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: '#1E2333' }}>
                        Emergency Contact *
                      </label>
                      <input
                        type="text"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                        style={{ borderColor: '#EAEDE6', backgroundColor: '#F7F9FA' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: '#1E2333' }}>
                        Emergency Phone *
                      </label>
                      <input
                        type="tel"
                        name="emergencyPhone"
                        value={formData.emergencyPhone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                        style={{ borderColor: '#EAEDE6', backgroundColor: '#F7F9FA' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: '#1E2333' }}>
                      Medical Information / Allergies
                    </label>
                    <textarea
                      name="medicalInfo"
                      value={formData.medicalInfo}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Please list any medical conditions, allergies, or special requirements"
                      className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                      style={{ borderColor: '#EAEDE6', backgroundColor: '#F7F9FA' }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-full font-bold text-lg transition-all hover:opacity-90"
                    style={{ backgroundColor: '#dfd300', color: '#1E2333' }}
                  >
                    Submit Booking Request
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

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
            Contact us for more information about our tennis programmes
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

      {/* Term Class Booking Modal */}
      {selectedTermClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => { setSelectedTermClass(null); setBookingSubmitted(false); setTermFormData({ parentName: '', parentEmail: '', parentPhone: '', childName: '', childAge: '', medicalInfo: '' }) }}></div>
          <div 
            className="relative bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
          >
            <button 
              onClick={() => { setSelectedTermClass(null); setBookingSubmitted(false); setTermFormData({ parentName: '', parentEmail: '', parentPhone: '', childName: '', childAge: '', medicalInfo: '' }) }}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={24} style={{ color: '#676D82' }} />
            </button>

            {bookingSubmitted ? (
              <div className="p-12 text-center">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ backgroundColor: '#65B863' }}
                >
                  <CheckCircle className="text-white" size={48} />
                </div>
                <h2 className="text-3xl font-bold mb-4" style={{ color: '#1E2333' }}>Booking Request Sent!</h2>
                <p className="mb-8" style={{ color: '#676D82' }}>
                  Thank you for your booking request. We will confirm your place via email shortly.
                </p>
                <button 
                  onClick={() => { setSelectedTermClass(null); setBookingSubmitted(false); setTermFormData({ parentName: '', parentEmail: '', parentPhone: '', childName: '', childAge: '', medicalInfo: '' }) }}
                  className="px-8 py-3 rounded-full font-bold"
                  style={{ backgroundColor: '#dfd300', color: '#1E2333' }}
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="p-8">
                <div 
                  className="h-2 rounded-t-2xl -mt-8 -mx-8 mb-6"
                  style={{ backgroundColor: selectedTermClass.color }}
                ></div>
                
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#1E2333' }}>
                  Book: {selectedTermClass.name}
                </h2>
                <p className="mb-4" style={{ color: '#676D82' }}>
                  {selectedTermClass.day} • {selectedTermClass.time}
                </p>
                
                {/* Term Total */}
                <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: '#2E354E' }}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-white/70">
                        {selectedTermClass.name === 'Trial Session' ? '1 session × £8.99' : '12 sessions × £8.99'}
                      </p>
                      <p className="text-xs text-white/50 mt-1">Summer Term 2026</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/70">Total</p>
                      <p className="text-2xl font-bold" style={{ color: '#dfd300' }}>
                        {selectedTermClass.name === 'Trial Session' ? '£8.99' : '£107.88'}
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault()
                  const subject = encodeURIComponent(`Term Time Booking - ${selectedTermClass.name}`)
                  const body = encodeURIComponent(
                    `Class: ${selectedTermClass.name}\n` +
                    `Day: ${selectedTermClass.day}\n` +
                    `Time: ${selectedTermClass.time}\n` +
                    `Price: ${selectedTermClass.name === 'Trial Session' ? '£8.99' : '£107.88 (12 sessions)'}\n\n` +
                    `Parent/Guardian: ${termFormData.parentName}\n` +
                    `Email: ${termFormData.parentEmail}\n` +
                    `Phone: ${termFormData.parentPhone}\n\n` +
                    `Child Name: ${termFormData.childName}\n` +
                    `Child Age: ${termFormData.childAge}\n` +
                    `Medical Info: ${termFormData.medicalInfo || 'None'}`
                  )
                  window.location.href = `mailto:acestarsbookings@gmail.com?subject=${subject}&body=${body}`
                  setBookingSubmitted(true)
                }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-1" style={{ color: '#1E2333' }}>Parent/Guardian Name *</label>
                      <input
                        type="text"
                        required
                        value={termFormData.parentName}
                        onChange={(e) => setTermFormData({ ...termFormData, parentName: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                        style={{ borderColor: '#EAEDE6' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1" style={{ color: '#1E2333' }}>Email *</label>
                      <input
                        type="email"
                        required
                        value={termFormData.parentEmail}
                        onChange={(e) => setTermFormData({ ...termFormData, parentEmail: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                        style={{ borderColor: '#EAEDE6' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1" style={{ color: '#1E2333' }}>Phone *</label>
                    <input
                      type="tel"
                      required
                      value={termFormData.parentPhone}
                      onChange={(e) => setTermFormData({ ...termFormData, parentPhone: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                      style={{ borderColor: '#EAEDE6' }}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-1" style={{ color: '#1E2333' }}>Child Name *</label>
                      <input
                        type="text"
                        required
                        value={termFormData.childName}
                        onChange={(e) => setTermFormData({ ...termFormData, childName: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                        style={{ borderColor: '#EAEDE6' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1" style={{ color: '#1E2333' }}>Child Age *</label>
                      <input
                        type="text"
                        required
                        value={termFormData.childAge}
                        onChange={(e) => setTermFormData({ ...termFormData, childAge: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                        style={{ borderColor: '#EAEDE6' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1" style={{ color: '#1E2333' }}>Medical/Allergy Info</label>
                    <textarea
                      value={termFormData.medicalInfo}
                      onChange={(e) => setTermFormData({ ...termFormData, medicalInfo: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                      style={{ borderColor: '#EAEDE6' }}
                      placeholder="Any medical conditions or allergies we should know about"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-3 rounded-full font-bold text-sm transition-all"
                    style={{ backgroundColor: selectedTermClass.color, color: selectedTermClass.color === '#dfd300' ? '#1E2333' : '#FFFFFF' }}
                  >
                    Submit Booking Request
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AceStarsProgrammePage() {
  return (
    <Suspense fallback={<div className="pt-20 min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#dfd300] border-t-transparent rounded-full" /></div>}>
      <AceStarsProgrammeContent />
    </Suspense>
  )
}
