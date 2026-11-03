// Business model, go-to-market, operations, risks, funding and roadmap content.
import type { PricingTier } from '@/lib/company';

export interface CanvasBlock {
  id: string;
  title: string;
  items: string[];
}

export const BMC: Record<
  'partners' | 'activities' | 'resources' | 'value' | 'relationships' | 'channels' | 'segments' | 'costs' | 'revenue',
  CanvasBlock
> = {
  partners: { id: 'partners', title: 'Key partners', items: ['Market-data providers (EOD now, licensed later)', 'LLM providers (Groq, OpenAI, Anthropic)', 'Brokers via smallcase Gateway / Kite Connect (later)', 'Colleges and finance clubs', 'Fintech investors such as Rainmatter'] },
  activities: { id: 'activities', title: 'Key activities', items: ['Building and tuning the agent engine', 'Running the paper fund every trading day', 'Content and Learn Hub lessons', 'Campus leagues', 'SEBI compliance'] },
  resources: { id: 'resources', title: 'Key resources', items: ['18-agent engine and persona rules', 'Audit-trail database of every decision', 'Track record of the paper fund', 'Founding team', 'Future SEBI RA registration'] },
  value: { id: 'value', title: 'Value propositions', items: ['An AI investment committee you can audit', 'Learn with paper money before risking your own', 'See why — every signal, order and memo', 'Professional-style process without a ₹50 lakh minimum'] },
  relationships: { id: 'relationships', title: 'Customer relationships', items: ['Self-serve product', 'Community leagues and leaderboards', 'Weekly AI memo', 'Dedicated support for Campus and API'] },
  channels: { id: 'channels', title: 'Channels', items: ['Campus leagues and finance clubs', 'Learn Hub content and SEO', 'Shareable theses on X and LinkedIn', 'Telegram alerts', 'Broker partnerships (later)'] },
  segments: { id: 'segments', title: 'Customer segments', items: ['Students and first-jobbers 18–25', 'DIY investors 25–40', 'Colleges and finance clubs', 'Brokers, fintechs, edtech'] },
  costs: { id: 'costs', title: 'Cost structure', items: ['Team (largest)', 'LLM + cloud per active user', 'Data licensing from Year 2', 'Marketing and campus events', 'Compliance: NISM, SEBI RA, audits', 'Payment gateway ≈2%'] },
  revenue: { id: 'revenue', title: 'Revenue streams', items: ['Pro subscriptions ₹299/mo or ₹2,499/yr', 'Campus ₹49/student/month', 'API from ₹25,000/month', 'Free tier drives the funnel'] },
};

export const REVENUE_EXPLAINERS: { id: PricingTier['id']; tier: string; role: string }[] = [
  { id: 'free', tier: 'Paper (free)', role: 'Acquisition and learning. Cheap to serve because the engine is deterministic and the LLM runs once per fund run.' },
  { id: 'pro', tier: 'Pro', role: 'Main revenue. DIY investors pay for unlimited scores, chat, model portfolios and alerts. Modelled at ₹2,200 blended per paid user per year (estimate).' },
  { id: 'campus', tier: 'Campus', role: 'Sold to colleges; one contract brings hundreds of students. Modelled at ₹1.5 lakh per college per year (estimate).' },
  { id: 'b2b', tier: 'API', role: 'Brokers and edtechs embed the Stratton Score and Decision Room widgets. Modelled at ₹3 lakh per client per year (estimate).' },
];

export const GO_TO_MARKET = [
  { phase: 'Campus beachhead', detail: 'Launch an inter-section paper-trading league at BML Munjal University; recruit finance-club leads as ambassadors.' },
  { phase: 'Content flywheel', detail: 'Publish each week’s committee debate as a shareable thesis on X and LinkedIn; Learn Hub lessons for search traffic.' },
  { phase: 'Inter-college leagues', detail: 'Expand to Delhi NCR colleges, then national leagues with sponsor prizes.' },
  { phase: 'Partnerships', detail: 'After SEBI RA registration, distribute model portfolios through smallcase Gateway and broker APIs.' },
];

export const OPERATIONS = [
  'Backend: FastAPI, SQLite/Postgres, APScheduler running the fund after NSE close (15:45 IST on weekdays).',
  'Frontend: Next.js web app; Telegram for memos and alerts.',
  'Data: end-of-day prices, fundamentals and news through a cached read-through layer.',
  'AI: deterministic analysts and personas; one LLM call per run for the memo, with a provider factory (Groq default).',
  'Quality: backend test suite, offline benchmarks, and architecture decision records.',
];

export const REGULATORY = [
  { rule: 'SEBI Research Analyst / Investment Adviser regulations', impact: 'Publishing buy/sell research or advice to the public needs registration. Phase 1 stays educational with paper money only.' },
  { rule: 'AI-use disclosure (December 2024)', impact: 'Registered advisers and analysts are solely responsible for AI-assisted advice and must disclose AI use. Our audit trail is built for this.' },
  { rule: 'Real-time price data norms (May 2024)', impact: 'Third parties cannot get real-time prices except for trading; educational use is lagged. We run on end-of-day data. SEBI has since moved to a longer lag for educational use, which we must track.' },
  { rule: 'Retail algo framework (February 2025)', impact: 'Algo providers must be empanelled with exchanges, and “black-box” algos need Research Analyst registration. Our strategies stay white-box and explainable.' },
];

export const RISKS = [
  { risk: 'Regulatory reclassification as advice', mitigation: 'Paper money only, clear disclaimers, and a planned SEBI RA registration before any real-money product.' },
  { risk: 'Weak paper-fund performance hurts trust', mitigation: 'We sell the process and transparency, show losses openly, and benchmark against NIFTY 50.' },
  { risk: 'Low free-to-paid conversion', mitigation: 'Campus contracts and API revenue reduce dependence on consumer conversion; test pricing with a waitlist first.' },
  { risk: 'Competitor copies the committee format', mitigation: 'Audit-trail data, persona research and campus community compound over time.' },
  { risk: 'Data licensing costs rise', mitigation: 'End-of-day data is enough for the product; costs are budgeted from Year 2.' },
  { risk: 'Founder time while studying', mitigation: 'Clear ownership per co-founder and a scoped roadmap; full-time decision tied to the pre-seed round.' },
];

export const FUNDING_SOURCES = [
  { name: 'Bootstrapping and university incubation', detail: 'Founder time, free tiers, BMU incubation support.', pros: 'Full control; forces frugality.', cons: 'Slow; limited runway.' },
  { name: 'Startup India Seed Fund Scheme', detail: 'Via approved incubators: up to ₹20 lakh grant for proof of concept, prototype or trials; up to ₹50 lakh via convertible debentures or debt for market entry.', pros: 'Non-dilutive grant; government credibility.', cons: 'Needs DPIIT recognition and an incubator; milestone-based disbursal.' },
  { name: 'Competitions and grants', detail: 'University, state and corporate innovation challenges.', pros: 'Prize money plus visibility and feedback.', cons: 'Small and uncertain amounts.' },
  { name: 'Angel investors', detail: 'Networks such as Indian Angel Network and LetsVenture.', pros: 'Mentorship and fast decisions.', cons: 'Dilution; quality of angels varies.' },
  { name: 'Fintech-focused funds', detail: 'For example Rainmatter (Zerodha’s fintech fund).', pros: 'Domain expertise and broker access.', cons: 'Selective; may expect strategic alignment.' },
  { name: 'Accelerators', detail: 'Y Combinator, Antler India, 100X.VC.', pros: 'Network, structure and a standard cheque.', cons: 'Competitive entry; equity for programme.' },
];

export const ASK = {
  amount: 15_000_000,
  label: '₹1.5 Cr pre-seed',
  runwayMonths: 18,
  useOfFunds: [
    { item: 'Product and engineering', pct: 45 },
    { item: 'Growth: campus leagues and content', pct: 25 },
    { item: 'Compliance: SEBI RA registration, legal', pct: 10 },
    { item: 'Data licensing and infrastructure', pct: 12 },
    { item: 'Buffer', pct: 8 },
  ],
};

export const ROADMAP = [
  { phase: 'Phase 1', title: 'Educational simulator', when: 'Now – Month 12', detail: 'Free paper fund on end-of-day data, Pro waitlist, campus leagues. No real money, no advice.' },
  { phase: 'Phase 2', title: 'SEBI Research Analyst', when: 'Month 12 – 24', detail: 'Register as an RA (NISM certification, deposit) and publish model portfolios via smallcase Gateway and broker partners.' },
  { phase: 'Phase 3', title: 'RIA / PMS', when: 'Year 3+', detail: 'Investment Adviser registration or a quant PMS, similar to Wright Research’s path.' },
];
