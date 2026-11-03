// Customer discovery content: segments, personas, hypotheses, interview script, VPC.

export const SEGMENTS = [
  { name: 'Students and first-jobbers', age: '18–25', size: 'Primary (beachhead)', need: 'Learn investing safely and impress peers', pays: 'Free → Pro at student pricing, or via Campus' },
  { name: 'DIY investors', age: '25–40', size: '₹1–25 lakh portfolios', need: 'A second opinion they can check before acting', pays: 'Pro ₹2,499/yr' },
  { name: 'Colleges and finance clubs', age: 'Institutions', size: 'Pilot: BML Munjal University', need: 'Hands-on, explainable market practice for students', pays: 'Campus ₹49/student/month' },
  { name: 'Brokers and edtech (B2B)', age: 'Businesses', size: 'Later stage', need: 'Engaging, compliant research content for users', pays: 'API from ₹25,000/month' },
];

export const PERSONAS = [
  {
    name: 'Rohan, 20',
    tagline: 'Engineering student, Gurugram',
    bio: 'Opened a Groww account in second year. Lost ₹18,000 of ₹25,000 savings on options after following a Telegram group.',
    goals: ['Grow savings without gambling', 'Understand what professionals look at', 'Have something to show in placement interviews'],
    frustrations: ['Cannot tell good advice from a scam', 'Screeners show numbers, not reasons', 'Paid courses are expensive and generic'],
    quote: '“I just want someone to tell me why, not just what.” (illustrative)',
  },
  {
    name: 'Priya, 31',
    tagline: 'Product manager, Bengaluru, ₹8 lakh portfolio',
    bio: 'Invests monthly in index funds and a handful of stocks. Reads Tickertape and Twitter threads but has no time for deep research.',
    goals: ['A disciplined process, not hunches', 'Check her ideas against a neutral view', 'Spend under 30 minutes a week'],
    frustrations: ['Advisory calls give no rationale', 'PMS needs ₹50 lakh', 'Too many tabs and conflicting opinions'],
    quote: '“If ten good investors disagreed about a stock, I would want to see that argument.” (illustrative)',
  },
];

export type HypothesisStatus = 'Untested' | 'Validated' | 'Invalidated';

export const HYPOTHESES: { area: string; hypothesis: string; test: string; status: HypothesisStatus }[] = [
  { area: 'Customer', hypothesis: 'Students aged 18–25 who already hold a demat account are our earliest adopters.', test: 'Interview 10 students at BMU; count how many have an account and actively trade.', status: 'Untested' },
  { area: 'Problem', hypothesis: 'Young investors act on tips they cannot evaluate and want to understand the reasoning.', test: 'Ask about the last trade they made and where the idea came from (Mom-Test, past behaviour).', status: 'Untested' },
  { area: 'Solution', hypothesis: 'Seeing a committee of investor personas debate a stock builds more trust than a single score.', test: 'Show the Decision Room vs a plain score to 10 users; compare which they would act on.', status: 'Untested' },
  { area: 'Channel', hypothesis: 'Inter-college paper-trading leagues acquire users at under ₹100 each.', test: 'Run one league with the BMU finance club; measure sign-ups per rupee spent.', status: 'Untested' },
  { area: 'Revenue', hypothesis: '3–5% of active free users will pay ₹2,499/yr for Pro.', test: 'Pro waitlist with price shown; ask for a ₹99 pre-order from interested users.', status: 'Untested' },
  { area: 'Revenue', hypothesis: 'Colleges will pay ₹1–2 lakh/yr for a classroom league and faculty dashboard.', test: 'Pitch to 3 finance-club faculty advisers; ask for a signed letter of intent.', status: 'Untested' },
];

export const INTERVIEW_SCRIPT = [
  'Tell me about the last time you bought or sold a stock. How did you decide?',
  'Where did that idea come from? Who or what did you check before acting?',
  'What happened afterwards? How did you feel about the outcome?',
  'What is the hardest part of deciding what to invest in?',
  'Which apps, channels or people do you use for investing ideas today? What do you like and dislike about each?',
  'Have you ever paid for tips, a course or an advisory service? What made you pay, and was it worth it?',
  'When an app or person tells you to buy something, what would make you trust it?',
  'Tell me about a time you lost money on a trade. What would you do differently?',
  'How much time do you spend on investing in a typical week?',
  'If you could ask a professional investor one question about your portfolio, what would it be?',
  'Have you ever practised with paper trading or a simulator? Why or why not?',
  'Who else should I talk to about this?',
];

export const MOM_TEST_RULES = [
  'Ask about their life and past behaviour, not our idea.',
  'Ask for specifics from the past, not opinions about the future.',
  'Talk less, listen more; note exact quotes.',
  'Do not pitch until the end, if at all.',
];

export interface VPC {
  segment: string;
  jobs: string[];
  pains: string[];
  gains: string[];
  products: string[];
  relievers: string[];
  creators: string[];
}

export const VPCS: VPC[] = [
  {
    segment: 'Students and first-jobbers',
    jobs: ['Learn how to invest', 'Grow small savings', 'Build a portfolio to talk about in interviews'],
    pains: ['Losing savings to tips and F&O', 'Cannot judge if advice is credible', 'Jargon and information overload'],
    gains: ['Confidence before using real money', 'Bragging rights in a league', 'A clear reason behind each decision'],
    products: ['Free ₹10 lakh paper fund', 'Decision Room', 'Learn Hub', 'Campus leagues'],
    relievers: ['Paper money: zero risk while learning', 'Every trade shows who argued what and why', 'Plain-English memo after each run'],
    creators: ['League rankings and shareable theses', 'Lessons tied to real decisions', 'Investor personas make strategy concrete'],
  },
  {
    segment: 'DIY investors (25–40)',
    jobs: ['Decide what to buy or sell', 'Check an idea before acting', 'Monitor holdings with little time'],
    pains: ['Black-box calls without rationale', 'Professional products need ₹50 lakh', 'Too many sources, no process'],
    gains: ['A neutral second opinion', 'A repeatable process', 'Alerts when the view changes'],
    products: ['Stratton Score', 'Ask the Fund chat', 'Portfolio Health Check', 'Watchlist alerts'],
    relievers: ['Score with the reasons of 18 agents', 'Backtests show how the approach behaved', 'One place instead of ten tabs'],
    creators: ['Consensus-flip alerts on Telegram', 'Model portfolios to compare against', 'Weekly AI memo in under five minutes'],
  },
];
