// Single source of truth for company facts shown across the landing page,
// pricing, Venture section, pitch deck and poster. Figures marked `estimate: true`
// are team assumptions, not sourced data.

export const COMPANY = {
  name: 'PortAI',
  product: 'Stratton Fund',
  tagline: 'An AI investment committee you can audit.',
  oneLiner:
    'PortAI gives Indian retail investors a committee of 18 AI analysts — modelled on legendary investors — that research, debate and paper-trade a real portfolio, with every decision explained.',
  university: 'BML Munjal University',
  course: 'ENT 3005 — Innovation and Entrepreneurship',
  founded: '2025',
  city: 'Gurugram, India',
};

export interface TeamMember {
  name: string;
  role: string;
  focus: string;
}

export const TEAM: TeamMember[] = [
  { name: 'Avi Shukla', role: 'Co-founder & CEO', focus: 'Product vision, engineering and the agent engine' },
  { name: 'Chittransh Sharma', role: 'Co-founder, Quant Research', focus: 'Persona rules, scoring models and backtesting' },
  { name: 'Nachiket Singh', role: 'Co-founder, Growth', focus: 'Campus leagues, community and partnerships' },
  { name: 'Nishant Raj', role: 'Co-founder, Finance & Strategy', focus: 'Business model, pricing and the financial plan' },
  { name: 'Vinayak Shukla', role: 'Co-founder, Research & Compliance', focus: 'Customer discovery and the SEBI roadmap' },
];

export interface SourcedStat {
  value: string;
  label: string;
  source: string;
  url?: string;
  estimate?: boolean;
}

export const PROBLEM_STATS: SourcedStat[] = [
  {
    value: '93%',
    label: 'of individual F&O traders lost money between FY22 and FY24',
    source: 'SEBI study, September 2024',
    url: 'https://www.sebi.gov.in/media-and-notifications/press-releases/sep-2024/updated-sebi-study-reveals-93-of-individual-traders-incurred-losses-in-equity-fando-between-fy22-and-fy24-aggregate-losses-exceed-1-8-lakh-crores-over-three-years_86906.html',
  },
  {
    value: '₹1.8 lakh Cr',
    label: 'in aggregate losses by individual F&O traders over those three years',
    source: 'SEBI study, September 2024',
    url: 'https://www.sebi.gov.in/media-and-notifications/press-releases/sep-2024/updated-sebi-study-reveals-93-of-individual-traders-incurred-losses-in-equity-fando-between-fy22-and-fy24-aggregate-losses-exceed-1-8-lakh-crores-over-three-years_86906.html',
  },
  {
    value: '19 Cr+',
    label: 'demat accounts in India, most opened since 2020',
    source: 'NSDL + CDSL data, 2025',
    url: 'https://indiadatamap.com/2025/07/27/map-indian-states-my-number-of-demat-accounts-2025/',
  },
  {
    value: '₹50 lakh',
    label: 'minimum ticket for a quant PMS — professional, explainable strategies are out of reach for most',
    source: 'Wright Research PMS launch, Financial Express',
    url: 'https://www.financialexpress.com/money/wright-research-launches-quant-based-pms-with-a-minimum-ticket-size-of-rs-50-lakh-3187131/',
  },
];

export const PROBLEM_STORY = {
  title: 'Meet Rohan',
  paragraphs: [
    'Rohan is a 20-year-old engineering student in Gurugram. In his second year he opened a demat account after a friend doubled his money on a tip. Within a month his feed was full of finfluencers with "sure-shot" calls, Telegram groups selling paid tips, and screenshots of overnight profits.',
    'He put ₹25,000 — two semesters of savings — into stocks and then options he did not really understand. Three months later ₹18,000 was gone. Nobody had told him why the trades were made, what the risks were, or what a real investor would have looked at first.',
    'Rohan is not unusual. SEBI found that 93% of individual F&O traders lost money over three years. Retail India has the access, but not the reasoning: advice is either an opaque tip, an unregulated influencer, or a professional product with a ₹50 lakh minimum.',
    'We built PortAI so that the next Rohan can watch a committee of AI analysts — modelled on Buffett, Jhunjhunwala, Burry and others — argue about a stock, see exactly why they bought or sold, and learn with paper money before risking his own.',
  ],
};

export interface PricingTier {
  id: 'free' | 'pro' | 'campus' | 'b2b';
  name: string;
  price: string;
  cadence: string;
  annualNote?: string;
  audience: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

export const PRICING: PricingTier[] = [
  {
    id: 'free',
    name: 'Paper',
    price: '₹0',
    cadence: 'forever',
    audience: 'Students and first-time investors',
    features: [
      'One ₹10 lakh paper fund run by the AI committee',
      'Stratton Score on up to 10 stocks a day',
      'Decision Room audit trail',
      'Weekly AI memo',
      'Full Learn Hub',
    ],
    cta: 'Start free',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹299',
    cadence: 'per month',
    annualNote: '₹2,499 billed yearly (save 30%)',
    audience: 'DIY investors who want a second opinion',
    features: [
      'Everything in Paper',
      'Unlimited Stratton Scores',
      'Ask the Fund AI chat',
      'All 16 model portfolios',
      'Portfolio Health Check',
      'Watchlist alerts on Telegram',
      'Unlimited backtests',
    ],
    cta: 'Join the Pro waitlist',
    highlighted: true,
  },
  {
    id: 'campus',
    name: 'Campus',
    price: '₹49',
    cadence: 'per student / month',
    annualNote: 'Billed to the college or finance club',
    audience: 'Universities, finance clubs and educators',
    features: [
      'Pro for every enrolled student',
      'Inter-college paper-trading leagues',
      'Classroom dashboard for faculty',
      'Course-aligned Learn Hub modules',
    ],
    cta: 'Bring PortAI to your campus',
  },
  {
    id: 'b2b',
    name: 'API',
    price: '₹25,000',
    cadence: 'per month, from',
    audience: 'Brokers, fintechs and edtech platforms',
    features: [
      'Stratton Score and persona signals via REST API',
      'White-label Decision Room widgets',
      'Custom universes and personas',
      'SLA and dedicated support',
    ],
    cta: 'Talk to us',
  },
];
