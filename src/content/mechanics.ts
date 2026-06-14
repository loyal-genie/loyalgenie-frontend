import type { LucideIcon } from 'lucide-react'
import { Award, RotateCw, Ticket, Package, Smartphone, CreditCard, LayoutGrid, Crown } from 'lucide-react'
import type { ModalContent } from '@/components/ui/info-modal'

export interface MechanicItem {
  Icon: LucideIcon
  name: string
  desc: string
  gradient: string
  tag: string | null
  modal: ModalContent
}

export const mechanics: MechanicItem[] = [
  {
    Icon: Award,
    name: 'Stamp Card',
    desc: 'Classic loyalty — collect stamps, unlock rewards. Digital, clean, trackable.',
    gradient: 'linear-gradient(135deg, #3d1f8a, #6b3fd4)',
    tag: 'Most Popular',
    modal: {
      icon: '🏆',
      title: 'Stamp Card',
      sections: [
        { label: 'WHAT IS IT?', text: 'Customers earn a digital stamp with every visit or purchase. After reaching a target (say 8 stamps), they unlock a reward you define — a free service, a discount, or a surprise gift. No physical cards, no lost stamps, no cheating.' },
        { label: 'WHY IT WORKS', text: 'The "endowed progress effect" — once a customer has 6 of 10 stamps, they feel compelled to complete it. This drives repeat visits even without a promotion.' },
      ],
      proof: { text: '"Café Coffee Day\'s digital stamp program saw a 34% increase in repeat visits within 3 months."', source: 'LoyalGenie merchant data + industry reports' },
    },
  },
  {
    Icon: RotateCw,
    name: 'Spin a Wheel',
    desc: 'Customers spin to win prizes. Every spin builds anticipation and brings them back.',
    gradient: 'linear-gradient(135deg, #1a5276, #2980b9)',
    tag: null,
    modal: {
      icon: '🎡',
      title: 'Spin a Wheel',
      sections: [
        { label: 'WHAT IS IT?', text: 'After each visit, customers spin a virtual wheel for a chance to win from prizes you define — discounts, free items, bonus points, or "try again."' },
        { label: 'WHY IT WORKS', text: 'Variable rewards trigger the same dopamine response as a slot machine, but in a fun, brand-positive way.' },
      ],
      proof: { text: '"Domino\'s India ran a spin-the-wheel campaign that increased repeat orders by 22% during the campaign period."', source: "Domino's India campaign data" },
    },
  },
  {
    Icon: Ticket,
    name: 'Lottery',
    desc: 'Enter a draw with each visit. Creates excitement and community buzz around your brand.',
    gradient: 'linear-gradient(135deg, #6e2f0e, #e67e22)',
    tag: null,
    modal: {
      icon: '🎟️',
      title: 'Lottery',
      sections: [
        { label: 'WHAT IS IT?', text: 'Every visit earns customers an entry into a periodic prize draw. You announce winners weekly or monthly.' },
        { label: 'WHY IT WORKS', text: 'Lottery mechanics drive consistent visit frequency — customers visit regularly to maximise their odds.' },
      ],
      proof: { text: '"McDonald\'s Monopoly is the world\'s most successful loyalty promotion, running for decades."', source: "McDonald's Corp reports" },
    },
  },
  {
    Icon: Package,
    name: 'Mystery Box',
    desc: "Surprise rewards that customers can't resist. The unknown is the most powerful motivator.",
    gradient: 'linear-gradient(135deg, #1a3a4a, #16a085)',
    tag: 'High Engagement',
    modal: {
      icon: '📦',
      title: 'Mystery Box',
      sections: [
        { label: 'WHAT IS IT?', text: "Customers receive a mystery reward after their visit — revealed only when they open it in the app." },
        { label: 'WHY IT WORKS', text: 'Uncertainty and anticipation boost emotional engagement far beyond a flat discount.' },
      ],
      proof: { text: '"Zomato\'s mystery discount campaigns showed 35% higher redemption rates vs. standard offers."', source: 'Zomato campaign analytics' },
    },
  },
  {
    Icon: Smartphone,
    name: 'Shake & Win',
    desc: 'Customers shake their phone. A coupon or gift is revealed. Pure dopamine. Our flagship mechanic.',
    gradient: 'linear-gradient(135deg, #4a1a6b, #9b59b6)',
    tag: '⭐ Flagship',
    modal: {
      icon: '📱',
      title: 'Shake & Win',
      sections: [
        { label: 'WHAT IS IT?', text: 'After scanning your QR, customers physically shake their phone. An animation plays, confetti bursts, and a reward is dramatically revealed.' },
        { label: 'WHY IT WORKS', text: 'Physical interaction creates embodied memory — customers remember the experience, not just the reward.' },
      ],
      proof: { text: '"Swiggy\'s Shake to Win campaign during IPL 2023 saw 3× higher engagement vs. static offers."', source: 'Swiggy campaign reports' },
    },
  },
  {
    Icon: CreditCard,
    name: 'Scratch Card',
    desc: 'Digital scratch cards replicate the thrill of the physical. Tap, scratch, win.',
    gradient: 'linear-gradient(135deg, #7b341e, #c0392b)',
    tag: null,
    modal: {
      icon: '🎴',
      title: 'Scratch Card',
      sections: [
        { label: 'WHAT IS IT?', text: 'A digital scratch card — customers tap or swipe to reveal what they\'ve won.' },
        { label: 'WHY IT WORKS', text: 'India is a scratch-card nation. Digital scratch cards outperform static coupon codes because revealing creates earned ownership.' },
      ],
      proof: { text: '"Digital scratch cards show 67% higher redemption rates than standard email coupon codes."', source: 'Marketing research data' },
    },
  },
  {
    Icon: LayoutGrid,
    name: 'Collection Set',
    desc: 'Collect all items in a set to unlock a grand reward. Drives multiple repeat visits.',
    gradient: 'linear-gradient(135deg, #0d3b27, #27ae60)',
    tag: 'High Retention',
    modal: {
      icon: '🃏',
      title: 'Collection Set',
      sections: [
        { label: 'WHAT IS IT?', text: 'Customers collect digital items — one per visit. Complete the full set to unlock a grand reward.' },
        { label: 'WHY IT WORKS', text: 'Incomplete collections create a powerful psychological itch that drives 4–6 visits before a reward is triggered.' },
      ],
      proof: { text: '"7-Eleven\'s Hello Kitty collection campaign in Japan tripled visit frequency during the campaign period."', source: '7-Eleven Japan data' },
    },
  },
  {
    Icon: Crown,
    name: 'Paid Membership',
    desc: 'Offer exclusive tiers — Silver, Gold, Platinum. Members pay to belong and spend more.',
    gradient: 'linear-gradient(135deg, #7c4a00, #f0c040)',
    tag: 'Premium',
    modal: {
      icon: '👑',
      title: 'Paid Membership',
      sections: [
        { label: 'WHAT IS IT?', text: 'Customers pay a recurring fee for exclusive member benefits: special discounts, priority bookings, or premium rewards.' },
        { label: 'WHY IT WORKS', text: "Paid members are fundamentally different — they've invested money, so they visit more to justify the cost." },
      ],
      proof: { text: '"Amazon Prime members spend 2× more than non-Prime members."', source: 'Amazon annual report' },
    },
  },
]
