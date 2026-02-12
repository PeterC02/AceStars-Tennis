import Link from 'next/link'
import { ChevronRight, Shield, Users, Phone } from 'lucide-react'
import { coaches } from '@/lib/coaches'

export const metadata = {
  title: 'Safeguarding',
  description: 'Acestars Tennis Coaching safeguarding policy. All our coaches hold safeguarding certificates issued by the LTA.',
}

const safeguardedCoaches = coaches.map(c => ({ name: c.name, role: c.title }))

export default function SafeguardingPage() {
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
            Safeguarding
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Acestars is committed to safeguarding and promoting the welfare of all children and young people in our care.
          </p>
        </div>
      </section>

      {/* Safeguarding Certificates */}
      <section className="py-24" style={{ backgroundColor: '#F7F9FA' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="section-number" style={{ color: '#F87D4D' }}>01</span>
              <span className="section-line"></span>
              <span className="font-semibold uppercase tracking-wider text-sm" style={{ color: '#1E2333' }}>Safeguarding</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading" style={{ color: '#1E2333' }}>
              All our coaches hold safeguarding certificates issued by LTA.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {safeguardedCoaches.map((coach) => (
              <div key={coach.name} className="rounded-2xl p-6 text-center transition-all hover:shadow-xl hover:-translate-y-1" style={{ backgroundColor: '#FFF', border: '1px solid #EAEDE6' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(101,184,99,0.1)' }}>
                  <Shield size={28} style={{ color: '#65B863' }} />
                </div>
                <h3 className="font-bold text-lg mb-1" style={{ color: '#1E2333' }}>{coach.name}</h3>
                <p className="text-sm mb-3" style={{ color: '#676D82' }}>{coach.role}</p>
                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: 'rgba(101,184,99,0.1)', color: '#65B863' }}>
                  Safeguard ✓
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safeguarding Policy */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-10">
            <span className="section-number" style={{ color: '#F87D4D' }}>02</span>
            <span className="section-line"></span>
            <span className="font-semibold uppercase tracking-wider text-sm" style={{ color: '#1E2333' }}>Our Policy</span>
          </div>

          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#1E2333' }}>Safeguarding Policy</h2>
            <p className="mb-4" style={{ color: '#676D82' }}>
              ABC Tennis Ltd (AceStars Tennis) is committed to safeguarding and promoting the welfare of all children and young people who participate in our tennis coaching programmes. We recognise that the welfare of children is paramount and that all children, regardless of age, disability, gender, racial heritage, religious belief, sexual orientation or identity, have the right to equal protection from harm.
            </p>
            <p className="mb-6" style={{ color: '#676D82' }}>
              This policy applies to all staff, coaches, volunteers, and anyone working on behalf of AceStars Tennis, whether in a paid or voluntary capacity.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-10" style={{ color: '#1E2333' }}>Our Commitment</h2>
            <p className="mb-4" style={{ color: '#676D82' }}>We are committed to:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6" style={{ color: '#676D82' }}>
              <li>The welfare of all children and young people in our care</li>
              <li>Taking all reasonable steps to protect children from harm, discrimination and degrading treatment</li>
              <li>Respecting the rights, wishes and feelings of children</li>
              <li>Taking all suspicions and allegations of abuse seriously and responding swiftly and appropriately</li>
              <li>Recruiting, training, supervising and supporting staff and volunteers to adopt best practice in safeguarding children</li>
              <li>Requiring all staff and volunteers to adopt and abide by this safeguarding policy and associated procedures</li>
              <li>Sharing information about safeguarding and good practice with children, parents, staff and volunteers</li>
              <li>Sharing concerns with agencies who need to know, and involving parents and children appropriately</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 mt-10" style={{ color: '#1E2333' }}>Safer Recruitment</h2>
            <p className="mb-4" style={{ color: '#676D82' }}>All coaches and staff who work with children are subject to the following checks:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6" style={{ color: '#676D82' }}>
              <li>Enhanced DBS (Disclosure and Barring Service) checks, renewed regularly</li>
              <li>LTA-accredited safeguarding training, refreshed every three years</li>
              <li>First aid certification</li>
              <li>Identity and qualification verification</li>
              <li>References from previous employers or organisations</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 mt-10" style={{ color: '#1E2333' }}>Code of Conduct</h2>
            <p className="mb-4" style={{ color: '#676D82' }}>All coaches and staff must:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6" style={{ color: '#676D82' }}>
              <li>Treat all children with respect and dignity</li>
              <li>Always work in an open environment, avoiding private or unobserved situations</li>
              <li>Maintain appropriate boundaries at all times, both in person and online</li>
              <li>Ensure that physical contact is appropriate and only used when necessary for coaching technique or safety</li>
              <li>Never use inappropriate or abusive language</li>
              <li>Not engage in any form of favouritism or give personal gifts to children</li>
              <li>Ensure that any photography or video recording is authorised and appropriate</li>
              <li>Report any concerns about a child&apos;s welfare immediately to the Designated Safeguarding Lead</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 mt-10" style={{ color: '#1E2333' }}>Recognising Abuse</h2>
            <p className="mb-4" style={{ color: '#676D82' }}>
              All staff and coaches are trained to recognise the signs and indicators of abuse, which may include:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6" style={{ color: '#676D82' }}>
              <li><strong>Physical abuse:</strong> Unexplained injuries, bruises, burns, or reluctance to participate in physical activity</li>
              <li><strong>Emotional abuse:</strong> Changes in behaviour, withdrawal, fearfulness, low self-esteem, or excessive need for approval</li>
              <li><strong>Neglect:</strong> Consistently poor hygiene, inappropriate clothing, hunger, or frequent absences</li>
              <li><strong>Sexual abuse:</strong> Age-inappropriate sexual behaviour, withdrawal, or reluctance to be with certain individuals</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 mt-10" style={{ color: '#1E2333' }}>Reporting Concerns</h2>
            <p className="mb-4" style={{ color: '#676D82' }}>
              If you have any concerns about the welfare of a child, or if a child makes a disclosure to you, you should:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6" style={{ color: '#676D82' }}>
              <li>Stay calm and listen carefully to the child</li>
              <li>Reassure the child that they have done the right thing in telling you</li>
              <li>Do not promise to keep it a secret</li>
              <li>Record what the child has said as soon as possible, using their own words</li>
              <li>Report the concern immediately to our Designated Safeguarding Lead</li>
              <li>Do not attempt to investigate the matter yourself</li>
            </ul>

            <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: '#F7F9FA', border: '1px solid #EAEDE6' }}>
              <h3 className="font-bold text-lg mb-4" style={{ color: '#1E2333' }}>Designated Safeguarding Lead</h3>
              <p className="mb-2" style={{ color: '#676D82' }}>
                <strong style={{ color: '#1E2333' }}>Wojtek Specylak</strong> — Head Coach
              </p>
              <p className="mb-1" style={{ color: '#676D82' }}>
                Email: <a href="mailto:acestarsbookings@gmail.com" style={{ color: '#F87D4D' }}>acestarsbookings@gmail.com</a>
              </p>
              <p style={{ color: '#676D82' }}>
                Phone: 07915 269562
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-4 mt-10" style={{ color: '#1E2333' }}>Confidentiality &amp; Information Sharing</h2>
            <p className="mb-6" style={{ color: '#676D82' }}>
              All safeguarding concerns will be treated with the utmost confidentiality. Information will only be shared on a need-to-know basis with relevant authorities, such as the local authority children&apos;s services or the police, in accordance with our legal obligations. The welfare of the child will always take precedence over confidentiality.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-10" style={{ color: '#1E2333' }}>Photography &amp; Social Media</h2>
            <p className="mb-6" style={{ color: '#676D82' }}>
              Written parental consent is obtained before any photographs or videos of children are taken for promotional or coaching purposes. Images will only be used in accordance with the consent given and will be stored securely. Children will never be identified by full name alongside their photograph without explicit parental permission. Parents and spectators are asked not to photograph or film other children without the permission of those children&apos;s parents.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-10" style={{ color: '#1E2333' }}>Anti-Bullying</h2>
            <p className="mb-6" style={{ color: '#676D82' }}>
              AceStars Tennis has a zero-tolerance approach to bullying of any kind, whether physical, verbal, emotional, or online. All children are encouraged to speak up if they experience or witness bullying. Coaches will address any incidents promptly and sensitively, working with parents and children to resolve the situation. Persistent bullying may result in exclusion from coaching sessions.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-10" style={{ color: '#1E2333' }}>External Resources</h2>
            <p className="mb-4" style={{ color: '#676D82' }}>For more information on safeguarding in tennis and child protection, please visit:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6" style={{ color: '#676D82' }}>
              <li>LTA Safeguarding: <a href="https://www.lta.org.uk/about-us/safeguarding/" target="_blank" rel="noopener noreferrer" style={{ color: '#F87D4D' }}>www.lta.org.uk/safeguarding</a></li>
              <li>NSPCC Helpline: 0808 800 5000 — <a href="https://www.nspcc.org.uk" target="_blank" rel="noopener noreferrer" style={{ color: '#F87D4D' }}>www.nspcc.org.uk</a></li>
              <li>Childline: 0800 1111 — <a href="https://www.childline.org.uk" target="_blank" rel="noopener noreferrer" style={{ color: '#F87D4D' }}>www.childline.org.uk</a></li>
              <li>Local Authority Designated Officer (LADO) — contact your local council</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 mt-10" style={{ color: '#1E2333' }}>Policy Review</h2>
            <p className="mb-6" style={{ color: '#676D82' }}>
              This safeguarding policy is reviewed annually and updated as necessary to reflect changes in legislation, LTA guidance, or organisational practice. All staff and coaches are made aware of any changes and receive updated training as required.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="relative py-32 text-white"
        style={{ 
          backgroundImage: 'url(/images/uploads/2019/02/9.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(46, 53, 78, 0.85)' }}></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-heading">Join Us Now!</h2>
          <h5 className="text-xl mb-8" style={{ color: '#AFB0B3' }}>
            Are you ready to take your tennis to the next level with us? Click below to find our booking form.
          </h5>
          <Link href="/booking" className="inline-flex items-center gap-2 hover:gap-3 px-10 py-4 rounded-full font-bold text-lg transition-all duration-300" style={{ backgroundColor: '#dfd300', color: '#1E2333' }}>
            Become Ace Now! <ChevronRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  )
}
