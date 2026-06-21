import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const PAGES: Record<string, { title: string; sections: { heading?: string; body: string }[] }> = {
  settings: {
    title: 'Settings',
    sections: [
      {
        heading: 'Notifications',
        body: 'Push alerts for new rewards and campaign updates will appear here once enabled.',
      },
      {
        heading: 'Language',
        body: 'English (India) is the only supported language for now.',
      },
    ],
  },
  help: {
    title: 'Help',
    sections: [
      {
        body: 'Need help with a reward or campaign? Email us at help@loyalgenie.com and include your phone number.',
      },
      {
        heading: 'Common questions',
        body: 'PIN codes are shown by staff at the counter. Each play uses one attempt per day unless your vendor says otherwise.',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    sections: [
      {
        body: 'We store your phone number, display name, and reward history to run loyalty campaigns for participating businesses.',
      },
      {
        body: 'We do not sell personal data. Vendors only see activity tied to their own campaigns.',
      },
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    sections: [
      {
        body: 'Rewards are subject to vendor availability and campaign rules shown at play time.',
      },
      {
        body: 'Abuse of PIN entry or automated play may result in account suspension.',
      },
    ],
  },
  delete: {
    title: 'Delete Account',
    sections: [
      {
        body: 'To permanently delete your customer account, email delete@loyalgenie.com from the phone number linked to your profile.',
      },
      {
        body: 'Deletion removes wallet history and cannot be undone.',
      },
    ],
  },
}

export function CustomerProfileInfoPage() {
  const { section } = useParams()
  const navigate = useNavigate()
  const page = section ? PAGES[section] : null

  if (!page) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-5 bg-white">
        <p className="text-[#6b6461] mb-4">Page not found</p>
        <button
          type="button"
          onClick={() => navigate('/customer/profile')}
          className="text-[#5b0e81] font-semibold text-sm bg-transparent border-0 cursor-pointer"
        >
          Back to profile
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-white pb-8">
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-[#f3f4f6] px-5 pt-14 pb-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[#5b0e81] text-sm font-semibold mb-3 bg-transparent border-0 cursor-pointer p-0"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <h1 className="text-xl font-extrabold text-[#2b2827]">{page.title}</h1>
      </div>

      <div className="px-5 pt-6 space-y-6">
        {page.sections.map((block, i) => (
          <div key={i}>
            {block.heading && (
              <h2 className="text-sm font-bold text-[#5b0e81] mb-2">{block.heading}</h2>
            )}
            <p className="text-sm text-[#6b6461] leading-relaxed">{block.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
