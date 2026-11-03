// Problem, innovation and market analysis content.

export interface Sourced {
  title: string;
  body: string;
  source?: string;
  url?: string;
}

export const PROBLEM_STATEMENT =
  'Indian retail investors have cheap access to markets but no affordable, trustworthy way to understand why a stock should be bought or sold. Advice is either an opaque tip, an unregulated influencer, or a professional product priced for the wealthy — so first-time investors learn with real money and usually lose it.';

export const WHO_SUFFERS = [
  { who: 'Students and first-jobbers (18–25)', pain: 'Open a demat account on a tip, trade F&O they do not understand, and learn by losing savings.' },
  { who: 'DIY investors (25–40, ₹1–25 lakh portfolios)', pain: 'Juggle screeners, YouTube and Telegram calls with no way to check the reasoning or the track record.' },
  { who: 'Colleges and finance clubs', pain: 'Teach markets from textbooks; no safe, realistic, explainable environment for students to practise in.' },
  { who: 'Brokers and fintechs', pain: 'Need engaging, compliant research content for new users without becoming an adviser themselves.' },
];

export const WHY_NOW: Sourced[] = [
  {
    title: '19 crore+ demat accounts',
    body: 'Most were opened after 2020 by young, first-time investors on mobile apps — a huge new audience that has access but little guidance.',
    source: 'NSDL + CDSL data, FY25',
    url: 'https://indiadatamap.com/2025/07/27/map-indian-states-my-number-of-demat-accounts-2025/',
  },
  {
    title: 'LLMs got cheap',
    body: 'A plain-English explanation of a whole fund run now costs a fraction of a rupee, so explainability can be offered free at scale.',
  },
  {
    title: 'SEBI wants AI to be disclosed',
    body: 'In December 2024 SEBI made investment advisers and research analysts solely responsible for AI-assisted advice and required them to disclose how they use AI tools. Auditable AI becomes a requirement, not a feature.',
    source: 'SEBI amendments, 16–17 December 2024 (Moneycontrol)',
    url: 'https://www.moneycontrol.com/news/business/new-rules-tighten-use-of-ai-models-by-investment-advisers-for-stock-picking-12893745.html',
  },
  {
    title: 'Real-time data is restricted',
    body: 'SEBI’s May 2024 circular stopped exchanges and brokers sharing real-time prices with third parties except for trading; educational use gets lagged data. That favours end-of-day simulators like ours over “live tips” apps.',
    source: 'SEBI circular, 24 May 2024',
    url: 'https://www.sebi.gov.in/legal/circulars/may-2024/norms-for-sharing-of-real-time-price-data-to-third-parties_83572.html',
  },
];

export const MINDSET = {
  title: 'Why this team',
  points: [
    'We are the target user: students who opened demat accounts, followed tips, and saw friends lose money in F&O.',
    'We built before we pitched — a working product with real market data, 18 agents and an audit trail exists today.',
    'Effectuation over prediction: we start with what we have (code, a campus, ₹0 data cost) and let customer conversations shape the next step.',
    'Affordable loss: paper trading means no customer money is ever at risk while we learn.',
    'We treat regulation as the moat, not the obstacle — the roadmap is built around SEBI registration milestones.',
  ],
};

// Henderson-Clark: x = core component knowledge (reinforced → overturned),
// y = architectural knowledge (unchanged → changed).
export type HCQuadrant = 'incremental' | 'modular' | 'architectural' | 'radical';

export const HC_QUADRANTS: Record<HCQuadrant, { title: string; rule: string }> = {
  incremental: { title: 'Incremental', rule: 'Same components, same architecture — refine and make cheaper' },
  modular: { title: 'Modular', rule: 'New core component in an unchanged architecture' },
  architectural: { title: 'Architectural', rule: 'Existing components linked together in a new way' },
  radical: { title: 'Radical', rule: 'New components and a new architecture' },
};

export interface HCPlacement {
  name: string;
  quadrant: HCQuadrant;
  why: string;
  us?: boolean;
}

export const HC_PLACEMENTS: HCPlacement[] = [
  { name: 'PortAI', quadrant: 'architectural', us: true, why: 'Market data, investor heuristics, LLMs and paper trading all exist. We reconfigure them into an auditable multi-agent committee that debates, trades and explains.' },
  { name: 'Groww / Zerodha', quadrant: 'incremental', why: 'Cheaper, simpler broking on the same exchange-broker-investor architecture.' },
  { name: 'Tickertape', quadrant: 'incremental', why: 'A better screener and data terminal for the same research workflow.' },
  { name: 'Danelfin', quadrant: 'modular', why: 'Swaps the human analyst rating for an AI score inside a familiar research tool.' },
  { name: 'Jarvis Invest', quadrant: 'modular', why: 'Replaces the human adviser with an AI engine; the advisory relationship is unchanged.' },
  { name: 'smallcase', quadrant: 'architectural', why: 'Stocks, broker APIs and research recombined into directly-owned baskets.' },
  { name: 'Composer', quadrant: 'architectural', why: 'Strategy logic, AI prompting and execution joined into one no-code product.' },
];

export const DRUCKER_SOURCES = [
  { source: 'The unexpected', how: 'The post-2020 rush of young first-time investors into F&O surprised even brokers — and so did the scale of the losses that followed.' },
  { source: 'Incongruity', how: 'Investing has never been cheaper to access, yet 93% of individual F&O traders lost money. Access went up; understanding did not.' },
  { source: 'Process need', how: 'Learning to invest has no safe practice step between reading and risking real money. A paper fund with explanations fills that gap.' },
  { source: 'Industry and market change', how: 'Discount brokers, broker APIs and SEBI’s AI and data rules are reshaping who can give research and how.' },
  { source: 'Demographics', how: 'India’s new investors are young and mobile-first; a large share of accounts opened since 2020 belong to people in their twenties.' },
  { source: 'Change in perception', how: 'Young investors distrust paid tips after high-profile finfluencer crackdowns and want to see the reasoning.' },
  { source: 'New knowledge', how: 'Cheap LLMs make plain-language explanation of quantitative signals possible at near-zero marginal cost.' },
];

export const JUGAAD = {
  title: 'Jugaad: frugal by design',
  points: [
    'Runs on free end-of-day data instead of costly real-time feeds — also what SEBI’s data rules favour for education.',
    'A deterministic rule engine does the analysis; the LLM is used once per run only to write the memo.',
    'One LLM call per run costs a fraction of a rupee, and the whole pipeline works with no LLM key at all.',
    'A read-through cache collapses a warm full-universe analysis to zero data-provider calls.',
    'Built and hosted by students on open-source tools; the first distribution channel is our own campus.',
  ],
};

export const OPPORTUNITY_DRIVERS = [
  { title: 'Investor boom', body: '11 crore+ unique investors on NSE (Jan 2025) and 19 crore+ demat accounts.' },
  { title: 'Trust gap', body: 'SEBI action against unregistered finfluencers and tip groups leaves young investors without a credible guide.' },
  { title: 'Regulation pushes transparency', body: 'AI-use disclosure for advisers (Dec 2024) and the retail algo framework (Feb 2025) reward explainable systems.' },
  { title: 'Cost collapse', body: 'LLM and cloud costs make per-user explanation affordable on a freemium model.' },
  { title: 'Embedded distribution', body: 'Broker APIs and gateways (Kite Connect, smallcase Gateway) let research products reach users inside existing apps.' },
];

export const PESTEL = [
  { factor: 'Political', body: 'Government push for financial inclusion and Startup India support (Seed Fund Scheme, DPIIT recognition).', source: 'Startup India' },
  { factor: 'Economic', body: 'Rising household savings moving into equities via SIPs and direct stocks; price-sensitive users expect freemium.', source: 'Team analysis' },
  { factor: 'Social', body: 'Young, mobile-first investors who learn from social media; growing distrust of paid tip groups.', source: 'Team analysis' },
  { factor: 'Technological', body: 'Cheap LLMs, broker APIs and UPI-based payments lower build and distribution cost.', source: 'Team analysis' },
  { factor: 'Environmental', body: 'Low direct impact; growing interest in ESG screens could become a persona or filter.', source: 'Team analysis' },
  { factor: 'Legal', body: 'SEBI RA/IA regulations, Dec 2024 AI-disclosure duty, May 2024 real-time data norms and the Feb 2025 retail algo framework.', source: 'SEBI circulars' },
];

export type Rating = 'Low' | 'Medium' | 'High';

export const PORTER: { force: string; rating: Rating; why: string }[] = [
  { force: 'Rivalry among competitors', rating: 'High', why: 'Many funded research apps and brokers compete for the same young investors, mostly on price and features.' },
  { force: 'Threat of new entrants', rating: 'Medium', why: 'Building an app is easy; becoming a trusted, SEBI-registered source with an audit trail is slow and costly.' },
  { force: 'Threat of substitutes', rating: 'High', why: 'Free YouTube, Telegram tips, mutual funds and generic chatbots all compete for the same attention.' },
  { force: 'Buyer power', rating: 'High', why: 'Retail users pay little and switch freely; colleges and brokers negotiate on price.' },
  { force: 'Supplier power', rating: 'Low', why: 'End-of-day data and LLMs are commoditised with many interchangeable providers.' },
];

export interface Competitor {
  name: string;
  what: string;
  pricing: string;
  fact: string;
  explainability: number;
  automation: number;
  us?: boolean;
}

export const COMPETITORS: Competitor[] = [
  { name: 'smallcase', what: 'Model-portfolio baskets via brokers', pricing: '₹100 + GST per buy', fact: 'FY25 revenue ₹106 Cr; Series D $50M (Mar 2025, Elev8)', explainability: 68, automation: 45 },
  { name: 'Zerodha Streak', what: 'No-code algo strategy builder', pricing: 'Free for Zerodha users since Jan 2024', fact: 'Zerodha is bootstrapped; FY25 revenue ₹8,847 Cr', explainability: 78, automation: 68 },
  { name: 'Groww', what: 'Broking and mutual-fund platform', pricing: 'Brokerage per order', fact: 'IPO Nov 2025 (~$750M raised); FY25 revenue ₹3,844 Cr', explainability: 22, automation: 14 },
  { name: 'Tickertape', what: 'Screeners and stock data', pricing: 'Pro ₹2,399/yr', fact: 'Spun off from smallcase in 2021', explainability: 62, automation: 22 },
  { name: 'Univest', what: 'SEBI RA + IA advisory calls', pricing: 'From ~₹6/day', fact: 'SEBI RA and IA registered', explainability: 34, automation: 40 },
  { name: 'Jarvis Invest', what: 'AI-driven advisory', pricing: 'Subscription', fact: 'AI recommendations with limited visibility into reasoning', explainability: 26, automation: 76 },
  { name: 'Wright Research', what: 'Quant advisory and PMS', pricing: 'PMS min ₹50 lakh', fact: '$1M seed (Orios, 2022)', explainability: 48, automation: 82 },
  { name: 'Composer', what: '“Trade with AI” no-code strategies (US)', pricing: 'Subscription', fact: 'Acquired by SoFi, Jun 2026', explainability: 58, automation: 88 },
  { name: 'Danelfin', what: 'AI Score 1–10 with explainable signals', pricing: 'Plus ~$79/mo', fact: 'US/EU focus, no India coverage', explainability: 72, automation: 58 },
  { name: 'Finfluencer Telegram groups', what: 'Paid tips and “sure-shot” calls', pricing: '₹500–5,000/mo (est.)', fact: 'Mostly unregistered; under SEBI scrutiny', explainability: 6, automation: 10 },
  { name: 'PortAI', what: 'Auditable AI investment committee + paper fund', pricing: 'Free; Pro ₹2,499/yr', fact: 'Every signal and order stored and explained', explainability: 92, automation: 88, us: true },
];
