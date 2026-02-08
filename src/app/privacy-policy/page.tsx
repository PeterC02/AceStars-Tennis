import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy',
  description: 'Acestars Limited privacy policy. How we collect, process, and protect your personal data.',
}

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">

            <h2 className="text-2xl font-bold mb-4" style={{ color: '#1E2333' }}>Introduction</h2>
            <p className="mb-4" style={{ color: '#676D82' }}>
              Acestars Limited is registered at Companies House with registered number 04414619.
            </p>
            <p className="mb-4" style={{ color: '#676D82' }}>
              Our purpose is to empower parents, schools and the wider community to raise healthy, happy kids.
            </p>
            <p className="mb-4" style={{ color: '#676D82' }}>
              Acestars Limited is a data controller for the purposes of data protection legislation as we process personal data. This notice is designed to give you information about how we process that data. Our duties in respect of personal data are very important to us and we are committed to using the personal data we hold in accordance with the law. Any queries should be directed to: <a href="mailto:acestarsbookings@gmail.com" style={{ color: '#F87D4D' }}>acestarsbookings@gmail.com</a> or by post to Acestars Limited, 15 Camperdown House, Windsor, Berkshire SL4 3HQ.
            </p>
            <p className="mb-4" style={{ color: '#676D82' }}>
              This notice applies alongside any other information Acestars Limited may provide about a particular use of personal data, for example when collecting data via an online or paper form. The notice should be read in conjunction with our other policies and contracts which apply to you and which make reference to personal data. This includes any agreement or contract you have entered into with Acestars Limited, our safeguarding, pastoral, health &amp; safety policies and IT policies.
            </p>
            <p className="mb-6" style={{ color: '#676D82' }}>
              Acestars Limited expects parents, schools, customers and other individuals using the digital services and facilities provided by its business partners to respect the personal data and privacy of all stakeholders.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-10" style={{ color: '#1E2333' }}>What Type Of Personal Data Does Acestars Limited Process?</h2>
            <p className="mb-4" style={{ color: '#676D82' }}>
              We process personal data about prospective, current and past: kids and their parents (which includes guardians and carers as well as anyone with parental responsibility for that child) that are involved with any aspect of Acestars Limited services, and volunteers, schools, suppliers, contractors and others connected with us that are helping develop and support Acestars Limited to raise healthy, happy kids.
            </p>
            <p className="mb-4" style={{ color: '#676D82' }}>
              The personal data we process takes different forms (it may be factual information, opinion, images or other recorded information) and the type of data processed will depend on your relationship with Acestars Limited. Examples of the personal data we process include:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6" style={{ color: '#676D82' }}>
              <li>Names</li>
              <li>Addresses, telephone numbers, email addresses and other contact details</li>
              <li>Biometric information</li>
              <li>Education information</li>
              <li>In respect of those who access the services provided by any of Acestars Limited&apos;s businesses, images and video footage</li>
              <li>Financial information</li>
              <li>Courses, activities, meetings or events attended</li>
              <li>Correspondence with and concerning individuals</li>
            </ul>
            <p className="mb-6" style={{ color: '#676D82' }}>
              We may also need to process special category personal data (for example, regarding physical or mental health, ethnicity, religion or biometric data) and criminal records information about some individuals (particularly suppliers). Where we process this type of data, we will either rely on rights or duties imposed on us by law (for example, in respect of safeguarding, health and safety or employment) or on explicit consent.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-10" style={{ color: '#1E2333' }}>Who Has Access To Personal Data?</h2>
            <p className="mb-4" style={{ color: '#676D82' }}>
              Personal data held by Acestars Limited will remain within Acestars Limited and will be processed by appropriate members of staff for the purpose for which the data was collected. As an organisation, we have taken appropriate technical steps to protect your personal data and have implemented policies addressing use of technology.
            </p>
            <p className="mb-6" style={{ color: '#676D82' }}>
              In certain circumstances, we share personal data (including, where necessary, special category personal data) with third parties in order to further support the wider community on helping kids fulfil their mental and physical potential and to further support the objectives and interests of Acestars Limited. Examples of the third parties with whom we share personal data are organisations such as schools, local authorities, county sport partnerships, and those supplying goods and services to Acestars Limited.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-10" style={{ color: '#1E2333' }}>Why Do We Process Personal Data?</h2>
            <p className="mb-4" style={{ color: '#676D82' }}>
              We process personal data to support Acestars Limited&apos;s operations, objectives and interests. This broad purpose encompasses the following:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4" style={{ color: '#676D82' }}>
              <li>Supporting schools, parents and the wider community raise healthy, happy kids</li>
              <li>The safeguarding of children&apos;s welfare and provision of pastoral and medical care</li>
              <li>Compliance with legislation and regulation, including that relating to safeguarding, health and safety, employment and companies</li>
              <li>Operational management including the compilation of records relating to members, customers and other users, the administration of invoices, fees and accounts, management planning and forecasting, research and statistical analysis and other operational purposes</li>
              <li>Staff administration, including the recruitment of staff, directors and other volunteers and engagement of contractors (including compliance with DBS procedures), administration of payroll, pensions, sick leave and other benefits, review and appraisal of performance, conduct of any grievance, capability or disciplinary procedures, the maintenance of appropriate human resources records for current and former staff and providing references</li>
              <li>The promotion of Acestars Limited and its businesses including through its own websites, apps, publications and communications, including social media channels</li>
              <li>Obtaining appropriate professional advice and insurance for Acestars Limited</li>
              <li>Where specifically requested by the individuals concerned</li>
            </ul>
            <p className="mb-6" style={{ color: '#676D82' }}>
              In some situations, we have to carry out these processes in order to meet our legal obligations, whether they are imposed on us by law. In other situations, we have obtained the consent of the relevant individual to the particular processing of the data. Acestars Limited has determined that it has a legitimate interest in all of the remaining processes we conduct.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-10" style={{ color: '#1E2333' }}>For How Long Do We Keep Personal Data?</h2>
            <p className="mb-6" style={{ color: '#676D82' }}>
              Personal data will be kept securely and for no longer than is necessary or required by law. This period will vary depending on the piece of personal data and the purpose for which it was collected. If you have any specific questions in respect of retention, please direct them to <a href="mailto:acestarsbookings@gmail.com" style={{ color: '#F87D4D' }}>acestarsbookings@gmail.com</a>.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-10" style={{ color: '#1E2333' }}>What Rights Do You Have In Respect Of Your Personal Data?</h2>
            <p className="mb-4" style={{ color: '#676D82' }}>
              If we process personal data about you, you have a number of rights in respect of that data. Subject to certain exemptions and limitations specified by law, you can:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4" style={{ color: '#676D82' }}>
              <li>Require Acestars Limited to change incorrect or incomplete data</li>
              <li>Require Acestars Limited to delete your data</li>
              <li>Withdraw your consent to Acestars Limited processing certain personal data where Acestars Limited is relying on your consent to do so</li>
              <li>Object to Acestars Limited processing your data where we are relying on our legitimate interests to do so</li>
              <li>Require Acestars Limited to transfer your personal data to another organisation</li>
              <li>Access and obtain a copy of your data on request</li>
            </ul>
            <p className="mb-6" style={{ color: '#676D82' }}>
              If you would like to exercise any of these rights, please contact us by email at <a href="mailto:acestarsbookings@gmail.com" style={{ color: '#F87D4D' }}>acestarsbookings@gmail.com</a> or by post at Acestars Limited, 15 Camperdown House, Windsor, Berkshire SL4 3HQ. We will respond to such written requests as soon as is reasonably practicable and in any event within the time limits permitted by law. Acestars Limited will be better able to respond quickly to smaller, targeted requests for information.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-10" style={{ color: '#1E2333' }}>Children&apos;s Data</h2>
            <p className="mb-4" style={{ color: '#676D82' }}>
              If we process personal data about your child, you have a number of rights in respect of that data. Subject to certain exemptions and limitations specified by law, you can:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4" style={{ color: '#676D82' }}>
              <li>Require Acestars Limited to change incorrect or incomplete data</li>
              <li>Require Acestars Limited to delete your data</li>
              <li>Withdraw your consent to Acestars Limited processing certain personal data where Acestars Limited is relying on your consent to do so</li>
              <li>Object to Acestars Limited processing your data where we are relying on our legitimate interests to do so</li>
              <li>Require Acestars Limited to transfer your personal data to another organisation</li>
              <li>Access and obtain a copy of your data on request</li>
            </ul>
            <p className="mb-6" style={{ color: '#676D82' }}>
              If you would like to exercise any of these rights, please contact us by email at <a href="mailto:acestarsbookings@gmail.com" style={{ color: '#F87D4D' }}>acestarsbookings@gmail.com</a> or by post at Acestars Limited, 15 Camperdown House, Windsor, Berkshire SL4 3HQ. We will respond to such written requests as soon as is reasonably practicable and in any event within the time limits permitted by law. Acestars Limited will be better able to respond quickly to smaller, targeted requests for information.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-10" style={{ color: '#1E2333' }}>This Notice</h2>
            <p className="mb-4" style={{ color: '#676D82' }}>
              Acestars Limited will update this notice from time to time. Any substantial changes that affect your rights will be notified on our website and, as far as reasonably practicable, notified to you.
            </p>
            <p className="mb-6" style={{ color: '#676D82' }}>
              If you believe that Acestars Limited has not complied with this notice or acted other than in accordance with data protection laws, you should notify Acestars Limited immediately. You can also make a referral to or lodge a complaint with the Information Commissioner&apos;s Office (ICO), although the ICO recommends that steps are taken to resolve the matter with Acestars Limited before involving the regulator.
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
            Are you ready to take your tennis to the next level with us?
          </h5>
          <Link href="/booking" className="inline-flex items-center gap-2 hover:gap-3 px-10 py-4 rounded-full font-bold text-lg transition-all duration-300" style={{ backgroundColor: '#dfd300', color: '#1E2333' }}>
            Become Ace Now! <ChevronRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  )
}
