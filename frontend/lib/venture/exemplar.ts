// Exemplar startup journey: smallcase, mapped on the course's eight points.

export const EXEMPLAR = {
  name: 'smallcase',
  summary:
    'smallcase lets Indian investors buy ready-made, directly-owned baskets of stocks and ETFs built around an idea or strategy, executed through their own broker. It has grown from a consumer research tool into investment infrastructure embedded inside India’s largest brokers.',
};

export const JOURNEY: { point: string; title: string; body: string }[] = [
  { point: 'Beginning', title: 'IIT Kharagpur alumni, 2015', body: 'Founded in July 2015 by Anugrah Shrivastava, Vasanth Kamath and Rohan Gupta, who saw that investing in stocks was either opaque (mutual funds) or overwhelming (picking stocks alone).' },
  { point: 'Pivoting', title: 'From app to infrastructure', body: 'Started as a consumer research and investing tool, then became embedded B2B infrastructure (smallcase Gateway) inside brokers. Spun off Tickertape in 2021 and added mutual-fund and US baskets.' },
  { point: 'Innovation', title: 'Architectural', body: 'Existing components — stocks, broker APIs and research — recombined so investors own the underlying shares in themed baskets.' },
  { point: 'Opportunity', title: 'Between MFs and DIY', body: 'The gap between opaque mutual funds and risky DIY stock picking, timed with the discount-broker boom that brought millions of new investors.' },
  { point: 'Value', title: 'Transparency and convenience', body: 'See every stock and weight, rebalance in one click, and follow SEBI-registered managers.' },
  { point: 'Business model', title: 'Transactions + subscriptions + B2B', body: '₹100 + GST per transaction, ₹10 per SIP instalment, creator subscriptions shared with managers, and Gateway fees from partners. FY25 revenue ₹106 Cr.' },
  { point: 'Funding', title: 'Blume to Elev8', body: 'Early backing from Blume Ventures and Sequoia (now Peak XV); Series C of $40M in 2021 (Faering, Amazon, Premji Invest); Series D of $50M in March 2025 led by Elev8 with State Street.' },
  { point: 'Presenting', title: 'Investment infrastructure', body: 'Positions itself as infrastructure for the industry rather than another app; studied in the IIMB/HBR case “smallcase: a disruptive business model in India”.' },
];

export const TIMELINE: { year: string; event: string; approx?: boolean }[] = [
  { year: '2015', event: 'Founded by three IIT Kharagpur alumni' },
  { year: '2016–17', event: 'Launch with broker partners; first themed baskets', approx: true },
  { year: '2019–20', event: 'smallcase Gateway opens to brokers and fintechs', approx: true },
  { year: '2021', event: '$40M Series C; Tickertape spun off' },
  { year: '2022–24', event: 'Mutual-fund and US baskets; creator platform grows', approx: true },
  { year: '2025', event: '$50M Series D (Elev8); FY25 revenue ₹106 Cr' },
];

export const LESSONS = [
  { lesson: 'Partner with brokers, do not become one.', apply: 'Distribute PortAI model portfolios through smallcase Gateway and Kite Connect instead of building broking.' },
  { lesson: 'Regulation is the product’s credibility.', apply: 'smallcase managers are SEBI-registered; our Phase 2 RA registration is the trust milestone.' },
  { lesson: 'Transparency is the wedge.', apply: 'smallcase shows every stock; we go further and show every argument behind every trade.' },
  { lesson: 'Infrastructure scales better than an app.', apply: 'Our API tier (Stratton Score, Decision Room widgets) is the long-term B2B play.' },
  { lesson: 'Spin off what does not fit.', apply: 'Keep the core committee focused; Learn Hub content could become its own brand later.' },
  { lesson: 'Small per-transaction fees add up.', apply: 'Keep Pro cheap enough for students; revenue comes from scale and institutions.' },
];

export const COMPARISON: { dimension: string; smallcase: string; portai: string }[] = [
  { dimension: 'What the user gets', smallcase: 'Ready-made stock baskets', portai: 'An AI committee’s research, trades and reasoning' },
  { dimension: 'Money at risk', smallcase: 'Real money via broker', portai: 'Paper money (Phase 1)' },
  { dimension: 'Explainability', smallcase: 'Basket rationale by the manager', portai: 'Per-agent signals, confidence and memo for every run' },
  { dimension: 'Innovation type', smallcase: 'Architectural', portai: 'Architectural' },
  { dimension: 'Revenue', smallcase: 'Per transaction + subscriptions + B2B', portai: 'Freemium Pro + Campus + API' },
  { dimension: 'Regulation', smallcase: 'SEBI-registered managers', portai: 'Educational now; SEBI RA in Phase 2' },
  { dimension: 'Stage', smallcase: 'Series D, ₹106 Cr revenue', portai: 'Working product, pre-revenue' },
];

export const EXEMPLAR_QUESTIONS = [
  'What did the first version look like, and what made you move to the Gateway model?',
  'How did you convince the first broker to partner with you?',
  'How do you decide which managers and creators can publish on the platform?',
  'What did SEBI registration change for the product and the team?',
  'How do users react when a smallcase underperforms? What do you show them?',
  'If you were starting an AI-driven research product today, what would you avoid?',
];
