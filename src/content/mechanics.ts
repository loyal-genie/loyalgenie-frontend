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
        {
          label: 'WHAT IS IT?',
          text: 'Customers earn a digital stamp with every visit or purchase. After reaching a target (say 8 stamps), they unlock a reward you define — a free service, a discount, or a surprise gift. No physical cards, no lost stamps, no cheating.',
        },
        {
          label: 'WHY IT WORKS',
          text: 'The "endowed progress effect" — once a customer has 6 of 10 stamps, they feel compelled to complete it. This drives repeat visits even without a promotion. It also gives you a predictable baseline of returning customers every single week.',
        },
      ],
      proof: {
        text: '"Café Coffee Day\'s digital stamp program saw a 34% increase in repeat visits within 3 months. Local salons in Bengaluru using stamp-based loyalty reported 60% of reward redeemers returning within 2 weeks of redemption."',
        source: 'LoyalGenie merchant data + industry reports',
      },
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
        {
          label: 'WHAT IS IT?',
          text: 'After each visit, customers spin a virtual wheel for a chance to win from prizes you define — discounts, free items, bonus points, or "try again." You control the prize pool and probabilities.',
        },
        {
          label: 'WHY IT WORKS',
          text: 'Variable rewards — not knowing exactly what you\'ll win — trigger the same dopamine response as a slot machine, but in a fun, brand-positive way. The uncertainty keeps customers checking back. Businesses using spin mechanics see higher repeat visit rates because customers return "just to see what they\'ll win today."',
        },
      ],
      proof: {
        text: '"Domino\'s India ran a spin-the-wheel campaign that increased repeat orders by 22% during the campaign period. Customers who spun once were significantly more likely to order again within 7 days."',
        source: 'Domino\'s India campaign data',
      },
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
        {
          label: 'WHAT IS IT?',
          text: 'Every visit earns customers an entry into a periodic prize draw. You announce winners weekly or monthly. Prizes can be meaningful — a free month of service, a large discount, or a hamper. More visits = more entries = more chances.',
        },
        {
          label: 'WHY IT WORKS',
          text: 'Lottery mechanics drive consistent visit frequency — customers visit regularly to maximise their odds. The periodic winner announcement creates community buzz and social sharing. Grand prizes also attract word-of-mouth that no discount can buy.',
        },
      ],
      proof: {
        text: '"McDonald\'s Monopoly is the world\'s most successful loyalty promotion, running for decades and driving measurable traffic spikes every season it launches. Big Bazaar\'s lottery-based "Sabse Saste Din" consistently produces their highest footfall days of the year."',
        source: 'McDonald\'s Corp reports + Big Bazaar retail data',
      },
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
        {
          label: 'WHAT IS IT?',
          text: 'Customers receive a mystery reward after their visit — revealed only when they open it in the app. They don\'t know if they\'ve won a 10% discount, a free product, or something bigger. The suspense is built in.',
        },
        {
          label: 'WHY IT WORKS',
          text: 'Uncertainty and anticipation boost emotional engagement far beyond a flat discount. The mystery reward is more memorable, more shareable, and more likely to be talked about. Customers who receive a surprise reward feel genuinely delighted — not just transacted with.',
        },
      ],
      proof: {
        text: '"Nykaa\'s Mystery Box kits are consistently their fastest-selling products. Zomato\'s mystery discount campaigns showed 35% higher redemption rates vs. standard offers. The surprise factor makes customers feel lucky, not just rewarded."',
        source: 'Nykaa investor reports + Zomato campaign analytics',
      },
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
        {
          label: 'WHAT IS IT?',
          text: 'After scanning your QR, customers physically shake their phone. An animation plays, confetti bursts, and a reward is dramatically revealed — a discount, free item, or bonus points. This is LoyalGenie\'s signature mechanic, designed to be unforgettable.',
        },
        {
          label: 'WHY IT WORKS',
          text: 'Physical interaction creates embodied memory — customers remember the experience, not just the reward. The act of shaking feels playful and personal. Customers pull out their phones and show friends at the table, creating organic word-of-mouth you can\'t buy with a discount. Every shake is a brand moment.',
        },
      ],
      proof: {
        text: '"Swiggy\'s \'Shake to Win\' campaign during IPL 2023 saw 3× higher engagement vs. static offers. PhonePe\'s gamified reward moments drove 28% more transactions in the reward window. Physical interaction changes how customers feel about the brand — not just the deal."',
        source: 'Swiggy & PhonePe campaign reports',
      },
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
        {
          label: 'WHAT IS IT?',
          text: 'A digital scratch card — customers tap or swipe to reveal what they\'ve won. Familiar, tactile, and deeply satisfying. The digital version delivers every bit of the physical thrill without printing costs or fraud risk.',
        },
        {
          label: 'WHY IT WORKS',
          text: 'India is a scratch-card nation. Decades of FMCG promotions (Coke, Pepsi, Britannia) have made scratch cards deeply familiar and trusted. Digital scratch cards outperform static coupon codes because the act of revealing creates a sense of earned ownership — it feels like the customer won something, not just received a discount.',
        },
      ],
      proof: {
        text: '"Britannia\'s \'Khao aur Jeeto\' scratch card campaign sold billions of packs and is studied as one of India\'s most successful FMCG promotions. Digital scratch cards show 67% higher redemption rates than standard email coupon codes."',
        source: 'Britannia Industries + marketing research data',
      },
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
        {
          label: 'WHAT IS IT?',
          text: 'Customers collect digital items — stickers, stamps, themed cards — one per visit. Complete the full set to unlock a grand reward. Like Pokémon, but for your salon or café. The more visits, the closer they get to completing it.',
        },
        {
          label: 'WHY IT WORKS',
          text: 'Incomplete collections create a powerful psychological itch. The "Zeigarnik effect" — humans remember incomplete tasks more than completed ones — means customers actively think about your business between visits. Collection mechanics naturally drive 4–6 visits before a reward is triggered, creating deeply habitual customers.',
        },
      ],
      proof: {
        text: '"7-Eleven\'s Hello Kitty collection campaign in Japan tripled visit frequency during the campaign period. Flipkart\'s collection-based Big Billion Day game drove 40% more app opens per user. McDonald\'s Happy Meal toys created multi-generational brand loyalty."',
        source: '7-Eleven Japan data + Flipkart BBD analytics',
      },
    },
  },
  {
    Icon: Crown,
    name: 'Paid Membership',
    desc: 'Offer exclusive tiers — Silver, Gold, Platinum. Members pay to belong and spend more to stay there.',
    gradient: 'linear-gradient(135deg, #7c4a00, #f0c040)',
    tag: 'Premium',
    modal: {
      icon: '👑',
      title: 'Paid Membership',
      sections: [
        {
          label: 'WHAT IS IT?',
          text: 'Customers pay a recurring fee — monthly or yearly — for exclusive member benefits: special discounts, priority bookings, member-only offers, or premium rewards. You set the tiers (Silver, Gold, Platinum) and the perks. Members self-identify as your most committed customers.',
        },
        {
          label: 'WHY IT WORKS',
          text: 'Paid members are fundamentally different from loyalty point collectors. They\'ve invested money, so they\'re invested in getting value from it — they visit more to justify the cost. This creates a floor of guaranteed repeat visits every month and significantly higher average spend per visit.',
        },
      ],
      proof: {
        text: '"Amazon Prime members spend 2× more than non-Prime members. Urban Company\'s subscription plans saw 3× higher repeat bookings from subscribers vs one-time users. Even local gyms with annual membership plans see 80% better retention than drop-in customers."',
        source: 'Amazon annual report + Urban Company data + fitness industry benchmarks',
      },
    },
  },
]
