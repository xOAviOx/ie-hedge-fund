// Learn Hub content. Persona rules mirror backend/app/engine/personas/configs/*.yaml;
// keep them in sync when a persona's thresholds change.

export type TrackId = 'start' | 'personas' | 'metrics' | 'india';

export interface Track {
  id: TrackId;
  title: string;
  description: string;
}

export interface LearnSection {
  heading: string;
  body: string[];
  formula?: string;
  bullets?: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface RuleBranch {
  when: string;
  vote: 'bull' | 'bear';
  points: number;
}

/** One YAML rule: branches are checked in order and only the first match counts. */
export interface RuleGroup {
  metric: string;
  branches: RuleBranch[];
}

export interface LearnModule {
  slug: string;
  track: TrackId;
  title: string;
  summary: string;
  minutes: number;
  sections: LearnSection[];
  rules?: RuleGroup[];
  takeaways: string[];
  quiz: QuizQuestion[];
  related?: { href: string; label: string };
}

export const TRACKS: Track[] = [
  { id: 'start', title: 'Start here', description: 'How the fund works, and how to read what it shows you.' },
  {
    id: 'personas',
    title: 'The 12 personas',
    description: 'Each investor persona, its philosophy, and the exact rules it votes with.',
  },
  { id: 'metrics', title: 'Metrics glossary', description: 'The numbers behind every signal and every risk report.' },
  {
    id: 'india',
    title: 'Risk and regulation in India',
    description: 'What SEBI data says about retail trading, and the rules that shape products like PortAI.',
  },
];

const START: LearnModule[] = [
  {
    slug: 'what-is-paper-trading',
    track: 'start',
    title: 'What is paper trading',
    summary: 'Trading with simulated money against real prices, so you can learn without losing savings.',
    minutes: 4,
    sections: [
      {
        heading: 'Real prices, pretend money',
        body: [
          'A paper trade is a trade recorded in a ledger instead of sent to a broker. The price is real, the quantity is real, and the profit or loss is calculated exactly as it would be with real money. Only the money is simulated.',
          'The Stratton Fund starts with ₹10 lakh of paper capital. Every buy and sell the AI committee makes is filled against that ledger at the day’s closing price.',
        ],
      },
      {
        heading: 'Why it is worth doing',
        body: [
          'Most beginners learn by losing money. Paper trading lets you see how a strategy behaves through good and bad weeks before any rupee is at stake.',
        ],
        bullets: [
          'You learn what a 10% drawdown feels like without paying for it.',
          'You can compare a strategy to a benchmark such as the NIFTY 50.',
          'You build the habit of asking why a trade was made.',
        ],
      },
      {
        heading: 'What paper trading does not capture',
        body: [
          'Paper fills ignore some real-world friction: slippage on large orders, the emotional pressure of real losses, and, depending on the simulator, brokerage and taxes. Treat paper results as an upper bound on what you would have earned, not a promise.',
        ],
      },
      {
        heading: 'How PortAI uses it',
        body: [
          'PortAI only ever paper-trades, using end-of-day data. It never places orders with a broker and never touches your money. That keeps the product on the education side of SEBI’s rules and lets you audit every decision without risk.',
        ],
      },
    ],
    takeaways: [
      'Paper trading uses real prices and simulated money.',
      'The Stratton Fund paper-trades a ₹10 lakh fund at end-of-day prices.',
      'Paper results ignore some costs and emotions, so read them as a best case.',
    ],
    quiz: [
      {
        question: 'In a paper trade, which part is simulated?',
        options: ['The price', 'The money', 'The stock exchange'],
        answer: 1,
        explanation: 'Prices are real market prices; only the capital is simulated.',
      },
      {
        question: 'Why might real results be worse than paper results?',
        options: [
          'Real markets use different prices',
          'Slippage, costs and emotional decisions are missing from paper fills',
          'Paper trading always adds a bonus',
        ],
        answer: 1,
        explanation: 'Friction such as slippage and the pressure of real losses do not show up in a paper ledger.',
      },
    ],
    related: { href: '/console', label: 'Open the Fund Console' },
  },
  {
    slug: 'how-the-committee-works',
    track: 'start',
    title: 'How the AI committee works',
    summary: 'Eighteen agents vote, a risk manager sizes, a portfolio manager trades, and one LLM call writes the memo.',
    minutes: 6,
    sections: [
      {
        heading: 'Eighteen voters',
        body: [
          'Every run, 18 agents look at each stock in the universe. Six are analyst models covering fundamentals, technicals, sentiment, valuation, growth and the macro regime. Twelve are investor personas modelled on people like Warren Buffett, Rakesh Jhunjhunwala and Michael Burry.',
          'Each agent returns a direction (bullish, bearish or neutral), a confidence from 0 to 100, and the factors behind it.',
        ],
      },
      {
        heading: 'Rules, not guesses',
        body: [
          'The agents are deterministic: they apply written rules to real financial data. Run the same data twice and you get the same votes. The persona modules in this hub list every rule each persona uses.',
        ],
      },
      {
        heading: 'Risk manager',
        body: [
          'The risk manager counts the votes for each stock. It only calls a stock bullish when bullish agents outnumber bearish ones by at least two, and the reverse for bearish. It also sets a maximum position size, which is larger for a bullish consensus and smaller for a bearish one.',
        ],
      },
      {
        heading: 'Portfolio manager',
        body: [
          'The portfolio manager turns the consensus into orders. It buys on a bullish consensus with confidence of at least 50, putting in at most 30% of remaining cash and never more than the risk manager’s cap. It sells a holding on a bearish consensus with confidence of at least 60. Everything else is a hold.',
        ],
      },
      {
        heading: 'Ledger, memo and audit trail',
        body: [
          'Orders fill against the paper ledger and a NAV snapshot is taken. One LLM call then writes a plain-English memo explaining the run. Every signal, order and memo is stored, which is what the Decision Room shows you. The fund runs on its own every weekday at 15:45 IST, after the NSE close.',
        ],
      },
    ],
    takeaways: [
      '6 analyst models and 12 personas vote on every stock.',
      'A stock needs a lead of two or more votes to be called bullish or bearish.',
      'The LLM only writes the memo; the trading decisions are rule-based.',
    ],
    quiz: [
      {
        question: 'What does the LLM do in each run?',
        options: ['Picks the stocks to buy', 'Writes the plain-English memo', 'Sets the position sizes'],
        answer: 1,
        explanation: 'Decisions come from deterministic rules. The single LLM call writes the memo.',
      },
      {
        question: 'Eight agents are bullish, seven bearish, three neutral. What does the risk manager conclude?',
        options: ['Bullish', 'Bearish', 'Neutral'],
        answer: 2,
        explanation: 'A one-vote lead is not enough. Bulls must exceed bears by at least two.',
      },
      {
        question: 'When does the scheduled run happen?',
        options: ['Every hour', 'Weekdays at 15:45 IST', 'Once a month'],
        answer: 1,
        explanation: 'The fund runs after the NSE close, on weekdays at 15:45 IST.',
      },
    ],
    related: { href: '/decisions', label: 'See a run in the Decision Room' },
  },
  {
    slug: 'reading-a-stratton-score',
    track: 'start',
    title: 'Reading a Stratton Score',
    summary: 'One number from 1 to 10 that summarises how convinced the whole committee is.',
    minutes: 5,
    sections: [
      {
        heading: 'The net vote',
        body: [
          'Each agent’s vote counts +1 for bullish, −1 for bearish and 0 for neutral, multiplied by its confidence (so a 70-confidence bullish vote counts +0.7). Add them up and divide by the number of agents that voted. The result, the net vote, sits between −1 and +1.',
        ],
      },
      {
        heading: 'From net vote to 1–10',
        body: [
          'The net vote is mapped onto a 1–10 scale: −1 becomes 1, 0 becomes 5.5, and +1 becomes 10. The formula is 1 + (net + 1) × 4.5, rounded to one decimal.',
        ],
      },
      {
        heading: 'The labels',
        body: ['Each score gets a label so you can read it at a glance:'],
        bullets: [
          'Strong Buy: 8 or above',
          'Buy: 6.5 to below 8',
          'Hold: above 4.5 and below 6.5',
          'Sell: 3 to 4.5',
          'Strong Sell: below 3',
        ],
      },
      {
        heading: 'Why neutral votes matter',
        body: [
          'Neutral agents stay in the denominator on purpose. If two agents are very bullish and sixteen abstain, the score stays near 5.5. A stock only scores high when a broad share of the committee is convinced, not when a couple of voices are loud.',
        ],
      },
      {
        heading: 'What a score is not',
        body: [
          'A Stratton Score is a summary of rule-based signals on end-of-day data. It is not a price target and not investment advice. Always open the breakdown to see which agents drove it.',
        ],
      },
    ],
    takeaways: [
      'Score = 1 + (net vote + 1) × 4.5, where the net vote is the confidence-weighted average direction.',
      'Strong Buy ≥ 8, Buy ≥ 6.5, Hold > 4.5, Sell ≥ 3, otherwise Strong Sell.',
      'Neutral votes pull the score toward 5.5, so high scores require broad agreement.',
    ],
    quiz: [
      {
        question: 'Every agent is neutral. What is the score?',
        options: ['1', '5.5', '10'],
        answer: 1,
        explanation: 'A net vote of 0 maps to 1 + 1 × 4.5 = 5.5.',
      },
      {
        question: 'A stock scores 6.8. What is its label?',
        options: ['Hold', 'Buy', 'Strong Buy'],
        answer: 1,
        explanation: 'Buy covers 6.5 up to (but not including) 8.',
      },
      {
        question: 'Why can two very confident bullish agents not push a score to 9 on their own?',
        options: [
          'Their votes are capped at zero',
          'Neutral agents still count in the average',
          'Only personas count',
        ],
        answer: 1,
        explanation: 'The net vote divides by every agent, including neutral ones.',
      },
    ],
    related: { href: '/score', label: 'Check a Stratton Score' },
  },
  {
    slug: 'reading-the-decision-room',
    track: 'start',
    title: 'Reading the Decision Room',
    summary: 'The audit trail for every run: who voted what, why, and what the fund did about it.',
    minutes: 4,
    sections: [
      {
        heading: 'One row per run',
        body: [
          'The Decision Room lists every run of the fund, scheduled or manual. Open a run to see its full record. Nothing is summarised away: what you see is what the engine stored at the time.',
        ],
      },
      {
        heading: 'The memo',
        body: [
          'At the top is the memo, a short letter written by one LLM call that explains the run in plain English. It is a summary of the stored signals and orders, not an extra decision-maker.',
        ],
      },
      {
        heading: 'The debate',
        body: [
          'For each stock you see every agent’s direction, confidence bar and factors. Personas and analyst models are shown side by side so you can spot disagreements, for example Burry calling a falling stock oversold while Druckenmiller flags weak momentum.',
        ],
      },
      {
        heading: 'The verdict',
        body: [
          'Below the debate is the portfolio manager’s order (buy, sell or hold), the quantity and its reasoning. If you disagree with a trade, you can trace it back to the exact votes that caused it.',
        ],
      },
    ],
    takeaways: [
      'Every run is stored with its signals, orders and memo.',
      'Factors tell you which rule fired for each agent.',
      'You can trace any order back to the votes behind it.',
    ],
    quiz: [
      {
        question: 'What does the memo represent?',
        options: [
          'A separate AI decision that overrides the votes',
          'A plain-English summary of the stored signals and orders',
          'A broker confirmation',
        ],
        answer: 1,
        explanation: 'The memo explains the run; it does not change any decision.',
      },
      {
        question: 'Where do you look to see why one persona was bearish?',
        options: ['Its factors in the debate', 'The NAV chart', 'The settings page'],
        answer: 0,
        explanation: 'Each agent’s factors list the rules that fired.',
      },
    ],
    related: { href: '/decisions', label: 'Open the Decision Room' },
  },
];

interface PersonaSpec {
  key: string;
  name: string;
  philosophy: string;
  about: string[];
  inPractice: string;
  rules: RuleGroup[];
  takeaways: string[];
  quiz: QuizQuestion[];
}

const PERSONA_SPECS: PersonaSpec[] = [
  {
    key: 'buffett',
    name: 'Warren Buffett',
    philosophy: 'Value investing with an economic-moat focus.',
    about: [
      'Buffett looks for businesses with a durable advantage, a “moat”, that lets them earn high returns on capital year after year, and buys them at a sensible price.',
      'High return on equity with little debt is his signature: it means the business earns well on shareholders’ money without borrowing to do it.',
    ],
    inPractice:
      'The persona rewards high ROE, a conservative balance sheet, positive free cash flow and a reasonable P/E. Heavy debt is penalised more than a modest ROE.',
    rules: [
      {
        metric: 'Return on equity',
        branches: [
          { when: 'ROE above 15%', vote: 'bull', points: 2 },
          { when: 'ROE below 8%', vote: 'bear', points: 1 },
        ],
      },
      {
        metric: 'Debt-to-equity',
        branches: [
          { when: 'Below 0.5', vote: 'bull', points: 1 },
          { when: 'Above 2', vote: 'bear', points: 2 },
        ],
      },
      { metric: 'Free cash flow', branches: [{ when: 'Positive', vote: 'bull', points: 1 }] },
      {
        metric: 'P/E ratio',
        branches: [
          { when: 'Below 20 (margin of safety)', vote: 'bull', points: 1 },
          { when: 'Above 35 (expensive entry)', vote: 'bear', points: 1 },
        ],
      },
    ],
    takeaways: [
      'Quality first: ROE above 15% earns the most points.',
      'Debt above 2× equity is a strong negative.',
      'Price still matters: P/E under 20 adds a point.',
    ],
    quiz: [
      {
        question: 'Which single rule gives the Buffett persona the most bullish points?',
        options: ['P/E below 20', 'ROE above 15%', 'Positive free cash flow'],
        answer: 1,
        explanation: 'ROE above 15% is worth 2 points; the others are worth 1.',
      },
      {
        question: 'A company has debt-to-equity of 2.4. What happens?',
        options: ['+1 bullish', 'No effect', '+2 bearish'],
        answer: 2,
        explanation: 'Debt-to-equity above 2 adds 2 bearish points.',
      },
    ],
  },
  {
    key: 'munger',
    name: 'Charlie Munger',
    philosophy: 'Quality businesses at a fair price.',
    about: [
      'Munger pushed Buffett from buying cheap, mediocre companies toward paying a fair price for excellent ones. He thought in “mental models” and was famously patient.',
      'His bar for quality is high: very strong returns, wide margins that suggest pricing power, and very little debt.',
    ],
    inPractice:
      'The persona is stricter than Buffett on quality (ROE above 20%) and on debt, and it ignores valuation entirely. A great business with thin margins or heavy borrowing will not pass.',
    rules: [
      { metric: 'Return on equity', branches: [{ when: 'ROE above 20%', vote: 'bull', points: 2 }] },
      {
        metric: 'Net profit margin',
        branches: [
          { when: 'Above 15% (pricing power)', vote: 'bull', points: 1 },
          { when: 'Below 5% (thin margins)', vote: 'bear', points: 1 },
        ],
      },
      {
        metric: 'Debt-to-equity',
        branches: [
          { when: 'Below 0.5', vote: 'bull', points: 1 },
          { when: 'Above 1.5', vote: 'bear', points: 1 },
        ],
      },
    ],
    takeaways: [
      'Munger needs ROE above 20%, higher than Buffett’s 15%.',
      'Margins above 15% are read as pricing power.',
      'The persona has no valuation rule; it judges quality only.',
    ],
    quiz: [
      {
        question: 'Which metric does the Munger persona not look at?',
        options: ['Net profit margin', 'P/E ratio', 'Debt-to-equity'],
        answer: 1,
        explanation: 'Munger’s rules cover ROE, margins and leverage, not valuation.',
      },
      {
        question: 'ROE 25%, margin 18%, debt-to-equity 0.3. What is the vote?',
        options: ['Bullish', 'Neutral', 'Bearish'],
        answer: 0,
        explanation: '2 + 1 + 1 = 4 bullish points against 0 bearish, a clear bullish lead.',
      },
    ],
  },
  {
    key: 'graham',
    name: 'Benjamin Graham',
    philosophy: 'Deep value with a strict margin of safety.',
    about: [
      'Graham, Buffett’s teacher, wrote The Intelligent Investor and Security Analysis. He insisted on buying well below a conservative estimate of value so that mistakes would not be fatal.',
      'His “Graham number”, the square root of 22.5 × earnings per share × book value per share, is a rough ceiling on what a defensive investor should pay.',
    ],
    inPractice:
      'The persona compares the price with the Graham number, checks short-term liquidity through the current ratio, and prefers a low P/E.',
    rules: [
      {
        metric: 'Price vs Graham number',
        branches: [
          { when: 'Price below 80% of the Graham number', vote: 'bull', points: 3 },
          { when: 'Price above 120% of the Graham number', vote: 'bear', points: 2 },
        ],
      },
      {
        metric: 'Current ratio',
        branches: [
          { when: 'Above 2', vote: 'bull', points: 1 },
          { when: 'Below 1', vote: 'bear', points: 1 },
        ],
      },
      {
        metric: 'P/E ratio',
        branches: [
          { when: 'Below 15', vote: 'bull', points: 2 },
          { when: 'Above 30', vote: 'bear', points: 1 },
        ],
      },
    ],
    takeaways: [
      'Graham number = √(22.5 × EPS × book value per share).',
      'Trading 20% or more below it is the strongest bullish signal.',
      'A current ratio above 2 shows the company can pay its near-term bills.',
    ],
    quiz: [
      {
        question: 'The Graham number is ₹500 and the price is ₹380. What happens?',
        options: ['+3 bullish', '+2 bearish', 'No effect'],
        answer: 0,
        explanation: '₹380 is below 80% of ₹500 (₹400), so the rule adds 3 bullish points.',
      },
      {
        question: 'What does a current ratio below 1 suggest?',
        options: [
          'Short-term liabilities exceed short-term assets',
          'The stock is cheap',
          'Revenue is growing',
        ],
        answer: 0,
        explanation: 'Current ratio is current assets divided by current liabilities.',
      },
    ],
  },
  {
    key: 'pabrai',
    name: 'Mohnish Pabrai',
    philosophy: 'Concentrated dhandho value with heads-I-win asymmetry.',
    about: [
      'Pabrai describes his approach as “dhandho”: low risk, high uncertainty bets where the downside is small and the upside is large. He openly clones ideas from investors he admires.',
      'He favours very cheap, cash-generating businesses with almost no debt, and is happy to own just a few of them.',
    ],
    inPractice:
      'The persona gives its biggest reward to a P/E below 12, then adds points for positive free cash flow and minimal debt.',
    rules: [
      {
        metric: 'P/E ratio',
        branches: [
          { when: 'Below 12 (deep value)', vote: 'bull', points: 3 },
          { when: 'Above 35', vote: 'bear', points: 1 },
        ],
      },
      { metric: 'Free cash flow', branches: [{ when: 'Positive', vote: 'bull', points: 1 }] },
      { metric: 'Debt-to-equity', branches: [{ when: 'Below 0.3', vote: 'bull', points: 1 }] },
    ],
    takeaways: [
      'A P/E under 12 is worth 3 points on its own.',
      'Debt-to-equity must be below 0.3 to earn the debt point, stricter than Buffett.',
      'Asymmetry means a small, known downside against a large possible upside.',
    ],
    quiz: [
      {
        question: 'What does “heads I win, tails I don’t lose much” describe?',
        options: ['High leverage', 'Asymmetric risk and reward', 'Momentum trading'],
        answer: 1,
        explanation: 'Pabrai looks for bets where the downside is limited and the upside is large.',
      },
      {
        question: 'P/E 10, positive FCF, debt-to-equity 0.2. How many bullish points?',
        options: ['3', '4', '5'],
        answer: 2,
        explanation: '3 for P/E, 1 for FCF and 1 for minimal debt.',
      },
    ],
  },
  {
    key: 'lynch',
    name: 'Peter Lynch',
    philosophy: 'Growth at a reasonable price (GARP).',
    about: [
      'Lynch ran Fidelity’s Magellan Fund from 1977 to 1990 and told ordinary investors to “buy what you know”. He wanted growing companies, but not at any price.',
      'His favourite tool is the PEG ratio: the P/E divided by the earnings growth rate. A PEG below 1 means you pay less than one unit of P/E for each percentage point of growth.',
    ],
    inPractice:
      'The persona computes PEG from the latest two periods of earnings per share (only when earnings are growing) and adds a point for revenue growth above 10%.',
    rules: [
      {
        metric: 'PEG ratio',
        branches: [
          { when: 'Below 1 (classic Lynch buy)', vote: 'bull', points: 3 },
          { when: 'Below 2', vote: 'bull', points: 1 },
          { when: 'Above 3', vote: 'bear', points: 1 },
        ],
      },
      { metric: 'Revenue growth', branches: [{ when: 'Above 10% year over year', vote: 'bull', points: 1 }] },
    ],
    takeaways: [
      'PEG = P/E ÷ EPS growth rate (in percent).',
      'PEG under 1 earns 3 points; under 2 earns 1.',
      'The rule is skipped when earnings are not growing.',
    ],
    quiz: [
      {
        question: 'P/E is 30 and EPS grew 40%. What is the PEG?',
        options: ['0.75', '1.33', '12'],
        answer: 0,
        explanation: '30 ÷ 40 = 0.75, which is below 1 and earns 3 bullish points.',
      },
      {
        question: 'Why is a high P/E acceptable to Lynch in some cases?',
        options: [
          'He ignores valuation',
          'Fast earnings growth can justify it',
          'High P/E always means quality',
        ],
        answer: 1,
        explanation: 'PEG adjusts the P/E for growth.',
      },
    ],
  },
  {
    key: 'fisher',
    name: 'Philip Fisher',
    philosophy: 'Scuttlebutt growth investing.',
    about: [
      'Fisher’s Common Stocks and Uncommon Profits (1958) argued for holding outstanding growth companies for a very long time. He researched them through “scuttlebutt”: talking to customers, suppliers and competitors.',
      'He wanted sustained sales growth, healthy margins and capable management.',
    ],
    inPractice:
      'The persona looks for strong revenue growth and healthy margins, and treats a workforce above 1,000 people as a rough proxy for an established team.',
    rules: [
      {
        metric: 'Revenue growth',
        branches: [
          { when: 'Above 15% year over year', vote: 'bull', points: 2 },
          { when: 'Declining (below 0%)', vote: 'bear', points: 1 },
        ],
      },
      { metric: 'Net profit margin', branches: [{ when: 'Above 10%', vote: 'bull', points: 1 }] },
      { metric: 'Employees', branches: [{ when: 'More than 1,000', vote: 'bull', points: 1 }] },
    ],
    takeaways: [
      'Revenue growth above 15% is the main bullish signal.',
      'Margins above 10% show the growth is profitable.',
      'Employee count stands in for an established organisation.',
    ],
    quiz: [
      {
        question: 'What is “scuttlebutt” research?',
        options: [
          'Reading only annual reports',
          'Gathering information from customers, suppliers and competitors',
          'Following price charts',
        ],
        answer: 1,
        explanation: 'Fisher talked to people around a business to judge its quality.',
      },
      {
        question: 'Revenue fell 3%. What does the revenue rule add?',
        options: ['+2 bullish', '+1 bearish', 'Nothing'],
        answer: 1,
        explanation: 'Declining revenue adds 1 bearish point.',
      },
    ],
  },
  {
    key: 'wood',
    name: 'Cathie Wood',
    philosophy: 'Disruptive-innovation growth.',
    about: [
      'Wood founded ARK Invest to back companies she believes will be transformed by disruptive technology: AI, robotics, genomics, energy storage and blockchain.',
      'She accepts high volatility and high valuations in exchange for exposure to very fast growth.',
    ],
    inPractice:
      'The persona cares about two things: how fast revenue is growing, and whether the company describes itself in terms of disruptive technologies.',
    rules: [
      {
        metric: 'Revenue growth',
        branches: [
          { when: 'Above 25% (hyper-growth)', vote: 'bull', points: 3 },
          { when: 'Above 10%', vote: 'bull', points: 1 },
          { when: 'Below 0% (contraction)', vote: 'bear', points: 2 },
        ],
      },
      {
        metric: 'Innovation exposure',
        branches: [
          {
            when: 'Company description mentions at least two of: AI, autonomous, genomics, blockchain, electric, cloud, robotics, fintech',
            vote: 'bull',
            points: 2,
          },
        ],
      },
    ],
    takeaways: [
      'Revenue growth above 25% is worth 3 points.',
      'Shrinking revenue is a strong negative (2 bearish points).',
      'The persona ignores valuation, so it can be bullish on expensive stocks.',
    ],
    quiz: [
      {
        question: 'What makes the Wood persona most bullish?',
        options: [
          'Low P/E and low debt',
          'Revenue growth above 25% plus innovation keywords',
          'A falling share price',
        ],
        answer: 1,
        explanation: 'Hyper-growth (3 points) and innovation exposure (2 points).',
      },
      {
        question: 'Which risk is typical of this style?',
        options: ['High volatility', 'Too much cash', 'No growth'],
        answer: 0,
        explanation: 'Fast-growth, often unprofitable companies tend to swing sharply in price.',
      },
    ],
  },
  {
    key: 'damodaran',
    name: 'Aswath Damodaran',
    philosophy: 'Intrinsic valuation and cash-flow discipline.',
    about: [
      'Damodaran teaches valuation at NYU Stern and is known as the “Dean of Valuation”. He argues that every price should connect a company’s story to its numbers: cash flows, growth and risk.',
      'His view: a company is worth the cash it will generate, discounted for risk.',
    ],
    inPractice:
      'The persona uses free cash flow yield as a quick read on value, then checks capital structure and profitability.',
    rules: [
      {
        metric: 'Free cash flow yield (FCF ÷ market cap)',
        branches: [
          { when: 'Above 6% (undervalued)', vote: 'bull', points: 2 },
          { when: 'Below 1%', vote: 'bear', points: 1 },
        ],
      },
      { metric: 'Debt-to-equity', branches: [{ when: 'Below 0.8', vote: 'bull', points: 1 }] },
      {
        metric: 'Net margin (net income ÷ revenue)',
        branches: [
          { when: 'Above 20%', vote: 'bull', points: 1 },
          { when: 'Below 0% (unprofitable)', vote: 'bear', points: 2 },
        ],
      },
    ],
    takeaways: [
      'FCF yield is the cash a business produces relative to its market value.',
      'A yield above 6% is read as undervalued.',
      'Losses (negative margin) are a strong negative.',
    ],
    quiz: [
      {
        question: 'FCF is ₹800 Cr and market cap is ₹10,000 Cr. What is the FCF yield?',
        options: ['0.8%', '8%', '80%'],
        answer: 1,
        explanation: '800 ÷ 10,000 = 8%, above the 6% threshold, so +2 bullish.',
      },
      {
        question: 'What links a company’s “story” to its value, in Damodaran’s view?',
        options: ['Social media buzz', 'Its cash flows, growth and risk', 'The share price trend'],
        answer: 1,
        explanation: 'Valuation translates the narrative into numbers.',
      },
    ],
  },
  {
    key: 'druckenmiller',
    name: 'Stanley Druckenmiller',
    philosophy: 'Macro-driven momentum with relative strength.',
    about: [
      'Druckenmiller managed money for George Soros and ran Duquesne Capital for three decades without a losing year. He follows liquidity and the big macro picture, and lets trends run.',
      'He prefers stocks that are rising in a rising market, and that are beating the market while they do it.',
    ],
    inPractice:
      'The persona looks only at prices: the stock’s 30-day return, whether the broad market (the S&P 500 ETF, SPY) is also rising, and how much the stock beats or lags it.',
    rules: [
      {
        metric: '30-day price return',
        branches: [
          { when: 'Above +10% while SPY is also up over 30 days', vote: 'bull', points: 2 },
          { when: 'Above +5%', vote: 'bull', points: 1 },
          { when: 'Below −10%', vote: 'bear', points: 2 },
        ],
      },
      {
        metric: 'Relative strength vs SPY (30 days)',
        branches: [
          { when: 'Beating SPY by more than 5 percentage points', vote: 'bull', points: 1 },
          { when: 'Lagging SPY by more than 5 percentage points', vote: 'bear', points: 1 },
        ],
      },
    ],
    takeaways: [
      'This persona uses price data only, no fundamentals.',
      'Strong momentum counts more when the broad market is also rising.',
      'Relative strength compares the stock’s return with SPY’s over the same 30 days.',
    ],
    quiz: [
      {
        question: 'A stock rose 12% in 30 days but SPY fell. What does the momentum rule give?',
        options: ['+2 bullish', '+1 bullish', 'Nothing'],
        answer: 1,
        explanation: 'The +2 branch needs SPY to be rising, so it falls through to “above +5%” for +1.',
      },
      {
        question: 'Which data does this persona ignore?',
        options: ['Prices', 'Market index returns', 'Company financials'],
        answer: 2,
        explanation: 'Both rules are built purely from prices.',
      },
    ],
  },
  {
    key: 'burry',
    name: 'Michael Burry',
    philosophy: 'Contrarian deep value.',
    about: [
      'Burry became famous for betting against US subprime mortgages before 2008, a story told in The Big Short. He hunts for value where others are panicking and is sceptical of crowded rallies.',
      'Contrarian investing means buying what has recently fallen hard, but only if the business itself still generates cash.',
    ],
    inPractice:
      'The persona treats a sharp 20-day fall as an opportunity and a sharp rally as a warning, then checks cash generation and leverage.',
    rules: [
      {
        metric: '20-day price return',
        branches: [
          { when: 'Below −15% (oversold)', vote: 'bull', points: 2 },
          { when: 'Above +20% (overextended)', vote: 'bear', points: 1 },
        ],
      },
      { metric: 'Free cash flow', branches: [{ when: 'Positive', vote: 'bull', points: 1 }] },
      { metric: 'Debt-to-equity', branches: [{ when: 'Above 2 (dangerous leverage)', vote: 'bear', points: 2 }] },
    ],
    takeaways: [
      'Burry reads momentum the opposite way to Druckenmiller.',
      'A crash only becomes an opportunity if the company still generates cash.',
      'High debt can cancel out a contrarian buy signal.',
    ],
    quiz: [
      {
        question: 'A stock fell 18% in 20 days and has positive FCF. What does Burry do?',
        options: ['Bullish lead of 3 points', 'Bearish', 'No effect'],
        answer: 0,
        explanation: '+2 for oversold and +1 for cash generation, with no bearish points.',
      },
      {
        question: 'How does this compare with the Druckenmiller persona on the same stock?',
        options: [
          'Both are bullish',
          'Druckenmiller is likely bearish on the same fall',
          'They use identical rules',
        ],
        answer: 1,
        explanation: 'Momentum and contrarian rules often disagree, which is the point of a committee.',
      },
    ],
  },
  {
    key: 'jhunjhunwala',
    name: 'Rakesh Jhunjhunwala',
    philosophy: 'India-style growth-plus-value hybrid.',
    about: [
      'Jhunjhunwala, often called India’s Big Bull, built his fortune on long-term conviction in Indian growth companies such as Titan. He combined a value investor’s patience with a trader’s feel for momentum.',
      'He looked for fast-rising earnings, good returns on equity and a market that was starting to notice.',
    ],
    inPractice:
      'The persona rewards a surge in net profit, high ROE and positive 20-day price momentum.',
    rules: [
      {
        metric: 'Net income growth',
        branches: [
          { when: 'Above 20% (earnings surge)', vote: 'bull', points: 2 },
          { when: 'Below −10%', vote: 'bear', points: 1 },
        ],
      },
      { metric: 'Return on equity', branches: [{ when: 'Above 15%', vote: 'bull', points: 1 }] },
      {
        metric: '20-day price return',
        branches: [
          { when: 'Above +8%', vote: 'bull', points: 1 },
          { when: 'Below −10% (weak price action)', vote: 'bear', points: 1 },
        ],
      },
    ],
    takeaways: [
      'Earnings growth above 20% is the main signal.',
      'Quality (ROE above 15%) and momentum each add a point.',
      'The style mixes fundamentals and price action.',
    ],
    quiz: [
      {
        question: 'Which combination makes this persona most bullish?',
        options: [
          'Falling earnings, low ROE',
          'Earnings up 25%, ROE 18%, price up 10% in 20 days',
          'Flat earnings, high debt',
        ],
        answer: 1,
        explanation: '2 + 1 + 1 = 4 bullish points.',
      },
      {
        question: 'What does this persona use that a pure value persona like Graham does not?',
        options: ['P/E ratio', 'Price momentum', 'Current ratio'],
        answer: 1,
        explanation: 'It adds a 20-day momentum rule to its fundamentals.',
      },
    ],
  },
  {
    key: 'ackman',
    name: 'Bill Ackman',
    philosophy: 'Activist value with hard catalysts.',
    about: [
      'Ackman runs Pershing Square, which takes large, concentrated stakes in big companies and pushes management for change. He looks for a clear catalyst that will unlock value.',
      'A classic activist target is a large, high-quality business whose profit margins are below what they could be.',
    ],
    inPractice:
      'The persona rewards strong free cash flow margins, flags under-earning but high-quality companies as activist opportunities, penalises excessive debt and prefers large companies.',
    rules: [
      {
        metric: 'FCF margin (FCF ÷ revenue, positive FCF only)',
        branches: [{ when: 'Above 15%', vote: 'bull', points: 2 }],
      },
      {
        metric: 'Margin expansion opportunity',
        branches: [{ when: 'Net margin below 10% and ROE above 10%', vote: 'bull', points: 1 }],
      },
      { metric: 'Debt-to-equity', branches: [{ when: 'Above 2.5 (restructuring risk)', vote: 'bear', points: 2 }] },
      {
        metric: 'Market cap',
        branches: [{ when: 'Above 5 billion in the reporting currency', vote: 'bull', points: 1 }],
      },
    ],
    takeaways: [
      'Strong cash margins are worth 2 points.',
      'Low margins with decent ROE signal room for an activist to improve results.',
      'Debt above 2.5× equity is a strong negative.',
    ],
    quiz: [
      {
        question: 'Why might low margins be bullish for an activist?',
        options: [
          'They never are',
          'A quality business with low margins has room to improve',
          'Low margins mean low taxes',
        ],
        answer: 1,
        explanation: 'If ROE is still above 10%, fixing costs could lift profits sharply.',
      },
      {
        question: 'What is a “catalyst” in activist investing?',
        options: [
          'An event or change expected to unlock value',
          'A type of bond',
          'A momentum indicator',
        ],
        answer: 0,
        explanation: 'Examples include a new CEO, a spin-off or a cost programme.',
      },
    ],
  },
];

const PERSONAS: LearnModule[] = PERSONA_SPECS.map((p) => ({
  slug: `persona-${p.key}`,
  track: 'personas',
  title: p.name,
  summary: p.philosophy,
  minutes: 4,
  sections: [
    { heading: 'Philosophy', body: p.about },
    { heading: 'How the persona applies it', body: [p.inPractice] },
  ],
  rules: p.rules,
  takeaways: p.takeaways,
  quiz: p.quiz,
  related: { href: `/portfolios/${p.key}`, label: `See the ${p.name} model portfolio` },
}));

interface MetricSpec {
  slug: string;
  title: string;
  summary: string;
  what: string[];
  formula?: string;
  reading: string[];
  watchOut: string[];
  takeaways: string[];
  quiz: QuizQuestion[];
  related: { href: string; label: string };
}

const RESEARCH = { href: '/research', label: 'Look it up in the Research Terminal' };
const RISK = { href: '/risk', label: 'See it on the Risk Desk' };

const METRIC_SPECS: MetricSpec[] = [
  {
    slug: 'pe-ratio',
    title: 'P/E ratio',
    summary: 'How many rupees you pay for each rupee of annual earnings.',
    what: ['The price-to-earnings ratio compares a share’s price with the company’s earnings per share (EPS).'],
    formula: 'P/E = share price ÷ earnings per share',
    reading: [
      'A P/E of 20 means you pay ₹20 for every ₹1 the company earned in a year. Lower can mean cheaper; higher usually means the market expects growth.',
      'Compare P/E within an industry. Banks, IT services and consumer brands trade at very different typical multiples.',
    ],
    watchOut: [
      'Meaningless when earnings are negative; the personas skip the rule in that case.',
      'One-off gains or losses can distort a single year’s EPS.',
    ],
    takeaways: ['P/E = price ÷ EPS.', 'Compare within a sector, not across the market.', 'Graham wants below 15, Pabrai below 12.'],
    quiz: [
      {
        question: 'Price ₹600, EPS ₹30. What is the P/E?',
        options: ['20', '18', '0.05'],
        answer: 0,
        explanation: '600 ÷ 30 = 20.',
      },
      {
        question: 'A very high P/E usually means…',
        options: ['The market expects strong growth', 'The company has no debt', 'The stock is guaranteed to fall'],
        answer: 0,
        explanation: 'Investors pay more per rupee of earnings when they expect earnings to grow.',
      },
    ],
    related: RESEARCH,
  },
  {
    slug: 'roe',
    title: 'Return on equity (ROE)',
    summary: 'How much profit a company earns on its shareholders’ money.',
    what: ['ROE measures profit as a share of shareholders’ equity, the money owners have put in plus retained profits.'],
    formula: 'ROE = net income ÷ shareholders’ equity',
    reading: [
      'An ROE of 20% means the company earns ₹20 a year for every ₹100 of equity. Sustained high ROE often points to a competitive advantage.',
      'Several personas use it: Buffett wants above 15%, Munger above 20%, Jhunjhunwala above 15%.',
    ],
    watchOut: ['Heavy borrowing can inflate ROE by shrinking equity. Always read it next to debt-to-equity.'],
    takeaways: ['ROE = net income ÷ equity.', 'Above 15% is generally strong.', 'Check leverage before trusting a high ROE.'],
    quiz: [
      {
        question: 'Net income ₹150 Cr, equity ₹1,000 Cr. What is ROE?',
        options: ['1.5%', '15%', '150%'],
        answer: 1,
        explanation: '150 ÷ 1,000 = 15%.',
      },
      {
        question: 'How can debt make ROE look better than it is?',
        options: ['Debt raises revenue', 'Borrowing reduces the equity base', 'Debt is counted as profit'],
        answer: 1,
        explanation: 'Less equity in the denominator means a higher ratio for the same profit.',
      },
    ],
    related: RESEARCH,
  },
  {
    slug: 'debt-to-equity',
    title: 'Debt-to-equity',
    summary: 'How much a company has borrowed relative to what its owners have invested.',
    what: ['Debt-to-equity compares total debt with shareholders’ equity.'],
    formula: 'Debt-to-equity = total debt ÷ shareholders’ equity',
    reading: [
      'A ratio of 0.5 means ₹50 of debt for every ₹100 of equity. Lower is safer: interest must be paid in good years and bad.',
      'Buffett and Munger reward below 0.5; Pabrai below 0.3. Above 2 (Buffett, Burry) or 2.5 (Ackman) is penalised.',
    ],
    watchOut: ['Banks and financial companies naturally run high leverage, so the ratio is less useful for them.'],
    takeaways: ['Lower debt means more resilience.', 'Below 0.5 is conservative.', 'Read it differently for banks and NBFCs.'],
    quiz: [
      {
        question: 'Debt ₹300 Cr, equity ₹200 Cr. What is debt-to-equity?',
        options: ['0.67', '1.5', '3'],
        answer: 1,
        explanation: '300 ÷ 200 = 1.5.',
      },
      {
        question: 'Why is high leverage risky?',
        options: ['Interest is due whether or not profits come in', 'It lowers the share count', 'It raises the P/E'],
        answer: 0,
        explanation: 'Fixed interest payments can strain a company in a bad year.',
      },
    ],
    related: RESEARCH,
  },
  {
    slug: 'free-cash-flow',
    title: 'Free cash flow',
    summary: 'The cash a business has left after paying to run and maintain itself.',
    what: ['Free cash flow (FCF) is operating cash flow minus capital expenditure. It is cash that could be returned to owners, used to pay debt, or reinvested.'],
    formula: 'FCF = cash from operations − capital expenditure',
    reading: [
      'Profits are an accounting figure; cash is harder to fake. A company with steady positive FCF can fund itself.',
      'Damodaran uses FCF yield (FCF ÷ market cap) and Ackman uses FCF margin (FCF ÷ revenue).',
    ],
    watchOut: ['Fast-growing companies may have negative FCF because they are investing heavily, which is not always bad.'],
    takeaways: ['FCF is real cash after capex.', 'Positive FCF earns a point from Buffett, Pabrai and Burry.', 'Read negative FCF in the context of growth spending.'],
    quiz: [
      {
        question: 'Operating cash flow ₹500 Cr, capex ₹200 Cr. What is FCF?',
        options: ['₹700 Cr', '₹300 Cr', '₹2.5 Cr'],
        answer: 1,
        explanation: '500 − 200 = ₹300 Cr.',
      },
      {
        question: 'Why do investors value FCF?',
        options: ['It is cash the business actually generated', 'It includes borrowed money', 'It ignores costs'],
        answer: 0,
        explanation: 'FCF is cash after the costs of running and maintaining the business.',
      },
    ],
    related: RESEARCH,
  },
  {
    slug: 'revenue-and-earnings-growth',
    title: 'Revenue and earnings growth',
    summary: 'How fast sales and profits are rising compared with the previous period.',
    what: ['Growth compares the latest reported figure with the previous one, as a percentage change.'],
    formula: 'Growth % = (latest − previous) ÷ previous × 100',
    reading: [
      'Revenue growth shows demand for the product. Earnings growth shows whether that demand turns into profit.',
      'Fisher wants revenue growth above 15%, Wood above 25%, and Jhunjhunwala wants net income growth above 20%.',
    ],
    watchOut: ['Growth from a tiny base can look huge. Check whether margins hold up as the company grows.'],
    takeaways: ['Growth is a percentage change between periods.', 'Revenue growth without profit growth is a warning sign.', 'Growth personas weigh it heavily.'],
    quiz: [
      {
        question: 'Revenue went from ₹400 Cr to ₹500 Cr. What is the growth?',
        options: ['20%', '25%', '100%'],
        answer: 1,
        explanation: '(500 − 400) ÷ 400 = 25%.',
      },
      {
        question: 'Revenue up 30%, profit down 10%. What should you check first?',
        options: ['Margins and costs', 'The share count only', 'Nothing, growth is good'],
        answer: 0,
        explanation: 'Falling profit on rising sales means costs are growing faster than revenue.',
      },
    ],
    related: RESEARCH,
  },
  {
    slug: 'momentum',
    title: 'Momentum',
    summary: 'How much the price has moved over a recent window.',
    what: ['Momentum is the percentage price change over a fixed number of trading days.'],
    formula: 'Momentum % = (today’s close ÷ close N days ago − 1) × 100',
    reading: [
      'Trend followers such as Druckenmiller (30 days) and Jhunjhunwala (20 days) treat positive momentum as bullish.',
      'Contrarians such as Burry read the same number the other way: a 15% fall in 20 days is a possible bargain.',
    ],
    watchOut: ['Momentum can reverse sharply, and it says nothing about whether the business is any good.'],
    takeaways: ['Momentum is recent price change.', 'Trend and contrarian personas interpret it in opposite ways.', 'Pair it with fundamentals.'],
    quiz: [
      {
        question: 'A stock went from ₹200 to ₹220 in 20 days. What is its 20-day momentum?',
        options: ['10%', '20%', '1.1%'],
        answer: 0,
        explanation: '220 ÷ 200 − 1 = 10%.',
      },
      {
        question: 'Which persona treats a sharp fall as a buying signal?',
        options: ['Druckenmiller', 'Burry', 'Lynch'],
        answer: 1,
        explanation: 'Burry is contrarian; a fall below −15% in 20 days earns 2 bullish points.',
      },
    ],
    related: RESEARCH,
  },
  {
    slug: 'volatility',
    title: 'Volatility',
    summary: 'How much returns swing around their average.',
    what: ['Volatility is the standard deviation of daily returns. The Risk Desk annualises it assuming about 252 trading days a year.'],
    formula: 'Annualised volatility = daily standard deviation × √252',
    reading: [
      'A portfolio with 20% annual volatility can easily move 20% above or below its average return in a year.',
      'Higher volatility means a bumpier ride and a wider range of outcomes.',
    ],
    watchOut: ['Volatility treats big up-moves and big down-moves the same; it is not the same as risk of permanent loss.'],
    takeaways: ['Volatility measures the size of price swings.', 'It is annualised with √252.', 'Lower volatility usually means steadier returns.'],
    quiz: [
      {
        question: 'What does volatility measure?',
        options: ['Average return', 'How widely returns spread around their average', 'Total profit'],
        answer: 1,
        explanation: 'It is the standard deviation of returns.',
      },
      {
        question: 'Why multiply daily volatility by √252?',
        options: ['To convert it to an annual figure', 'To remove weekends', 'To add interest'],
        answer: 0,
        explanation: 'There are about 252 trading days in a year.',
      },
    ],
    related: RISK,
  },
  {
    slug: 'var-95',
    title: 'Value at Risk (VaR 95%)',
    summary: 'A one-day loss that the portfolio should exceed only on its worst 5% of days.',
    what: ['Historical VaR at 95% looks at past daily returns and finds the loss at the 5th percentile.'],
    reading: [
      'A one-day VaR of 2% means that, based on history, the fund lost more than 2% on only about 1 day in 20.',
      'It turns a spread of outcomes into a single number you can compare over time.',
    ],
    watchOut: [
      'VaR says nothing about how bad the worst 5% of days can get.',
      'It assumes the past is a fair guide; markets can produce losses never seen in the sample.',
    ],
    takeaways: ['VaR 95% is the loss exceeded on about 1 day in 20.', 'It is based on historical returns.', 'It does not describe the size of extreme losses.'],
    quiz: [
      {
        question: 'One-day VaR 95% is 3%. What does that mean?',
        options: [
          'The fund can never lose more than 3%',
          'On about 1 day in 20, losses were worse than 3%',
          'The fund gains 3% a day',
        ],
        answer: 1,
        explanation: 'VaR marks the threshold for the worst 5% of days, not a maximum.',
      },
      {
        question: 'What is VaR’s main blind spot?',
        options: ['It ignores gains', 'It does not show how large tail losses can be', 'It only works for bonds'],
        answer: 1,
        explanation: 'Beyond the threshold, VaR is silent about how bad things get.',
      },
    ],
    related: RISK,
  },
  {
    slug: 'sharpe-ratio',
    title: 'Sharpe ratio',
    summary: 'Return earned per unit of volatility.',
    what: ['The Sharpe ratio divides average return by volatility. PortAI’s Risk Desk annualises it and uses a risk-free rate of zero for simplicity.'],
    formula: 'Sharpe = annualised return ÷ annualised volatility',
    reading: [
      'Two funds both returned 12%, but one did it with half the volatility. That fund has twice the Sharpe ratio and gave a smoother ride for the same result.',
      'Above 1 is generally good; above 2 is rare over long periods.',
    ],
    watchOut: [
      'With a zero risk-free rate the figure is higher than a version that subtracts Indian T-bill yields.',
      'Short histories produce unstable Sharpe ratios.',
    ],
    takeaways: ['Sharpe measures return per unit of risk.', 'Higher is better.', 'PortAI uses a zero risk-free rate.'],
    quiz: [
      {
        question: 'Fund A: 15% return, 10% volatility. Fund B: 15% return, 20% volatility. Which has the higher Sharpe?',
        options: ['A', 'B', 'They are equal'],
        answer: 0,
        explanation: 'A: 1.5. B: 0.75.',
      },
      {
        question: 'What does a higher Sharpe ratio tell you?',
        options: ['More return for each unit of volatility', 'Higher absolute return', 'Lower fees'],
        answer: 0,
        explanation: 'It is a risk-adjusted measure.',
      },
    ],
    related: RISK,
  },
  {
    slug: 'beta',
    title: 'Beta',
    summary: 'How strongly a portfolio moves with the market.',
    what: ['Beta compares a portfolio’s returns with the benchmark’s. It is the covariance of the two divided by the benchmark’s variance.'],
    formula: 'Beta = covariance(portfolio, market) ÷ variance(market)',
    reading: [
      'Beta of 1 means the portfolio tends to move with the market. 1.3 means it tends to move 30% more; 0.7 means 30% less.',
      'Low-beta portfolios fall less in sell-offs but often rise less in rallies.',
    ],
    watchOut: ['Beta is estimated from history and changes over time. A low beta does not mean low risk of a stock-specific crash.'],
    takeaways: ['Beta measures sensitivity to the market.', '1 means in line with the market.', 'It is estimated from past returns.'],
    quiz: [
      {
        question: 'The market falls 10%. Roughly how much does a portfolio with beta 1.5 fall?',
        options: ['5%', '10%', '15%'],
        answer: 2,
        explanation: '1.5 × 10% = 15%, on average.',
      },
      {
        question: 'Beta below 1 means…',
        options: ['Less sensitive to market moves', 'Always profitable', 'No risk'],
        answer: 0,
        explanation: 'It moves less than the market, on average.',
      },
    ],
    related: RISK,
  },
  {
    slug: 'max-drawdown',
    title: 'Max drawdown',
    summary: 'The largest fall from a peak to a later low.',
    what: ['Max drawdown is the biggest percentage drop in portfolio value from any high point to the lowest point that followed it.'],
    formula: 'Drawdown = (trough − prior peak) ÷ prior peak',
    reading: [
      'A −20% max drawdown means at some point the fund was worth 20% less than its previous high. It is the number that tests an investor’s nerve.',
      'Recovery is harder than the fall: a 20% loss needs a 25% gain to get back to even, and a 50% loss needs 100%.',
    ],
    watchOut: ['Max drawdown depends on the period you measure. A short backtest may simply not include a bad market.'],
    takeaways: ['Max drawdown is the worst peak-to-trough fall.', 'Losses need larger gains to recover.', 'Compare it with the benchmark over the same window.'],
    quiz: [
      {
        question: 'A fund falls from ₹12 lakh to ₹9 lakh. What is the drawdown?',
        options: ['−25%', '−33%', '−3%'],
        answer: 0,
        explanation: '(9 − 12) ÷ 12 = −25%.',
      },
      {
        question: 'After a 50% loss, what gain is needed to break even?',
        options: ['50%', '75%', '100%'],
        answer: 2,
        explanation: 'Half the money must double to get back to the start.',
      },
    ],
    related: { href: '/backtest', label: 'Run a backtest and check its drawdown' },
  },
  {
    slug: 'correlation',
    title: 'Correlation',
    summary: 'How closely two holdings move together.',
    what: ['Correlation ranges from −1 to +1. +1 means two assets move in lockstep, 0 means no relationship, −1 means they move in opposite directions.'],
    reading: [
      'The Risk Desk shows a correlation heatmap of the fund’s holdings. A high value between two stocks means they tend to rise and fall together.',
      'Diversification works best when holdings have low correlation, so one bad day does not hit everything.',
    ],
    watchOut: ['Correlations tend to rise in crises, exactly when diversification is needed most.'],
    takeaways: ['Correlation runs from −1 to +1.', 'Low correlation improves diversification.', 'Correlations often jump in sell-offs.'],
    quiz: [
      {
        question: 'Two IT stocks have a correlation of 0.9. What does that suggest?',
        options: ['They usually move together', 'They move in opposite directions', 'There is no relationship'],
        answer: 0,
        explanation: '0.9 is close to +1.',
      },
      {
        question: 'Why does low correlation help a portfolio?',
        options: ['Holdings are less likely to fall at the same time', 'It increases returns automatically', 'It removes all risk'],
        answer: 0,
        explanation: 'Losses in one holding are less likely to coincide with losses in others.',
      },
    ],
    related: RISK,
  },
  {
    slug: 'nav',
    title: 'NAV (net asset value)',
    summary: 'What the whole fund is worth today.',
    what: ['NAV is the value of all holdings at current prices plus cash, minus any liabilities.'],
    formula: 'NAV = cash + Σ (shares held × latest price)',
    reading: [
      'The Stratton Fund starts at a NAV of ₹10 lakh. After each run a NAV snapshot is stored, which draws the fund’s performance line on the Fund Console.',
      'NAV return is the percentage change from the starting value.',
    ],
    watchOut: ['NAV moves every day with prices even when the fund makes no trades.'],
    takeaways: ['NAV = cash + market value of holdings.', 'The fund started at ₹10 lakh.', 'A snapshot is stored after every run.'],
    quiz: [
      {
        question: 'Cash ₹4 lakh, holdings worth ₹7 lakh. What is NAV?',
        options: ['₹3 lakh', '₹7 lakh', '₹11 lakh'],
        answer: 2,
        explanation: 'NAV is cash plus holdings: ₹11 lakh.',
      },
      {
        question: 'Can NAV change on a day with no trades?',
        options: ['No', 'Yes, because prices move', 'Only on weekends'],
        answer: 1,
        explanation: 'Holdings are valued at the latest prices.',
      },
    ],
    related: { href: '/console', label: 'See the fund’s NAV on the Console' },
  },
  {
    slug: 'benchmark',
    title: 'Benchmark',
    summary: 'The index a fund should beat to justify its effort.',
    what: ['A benchmark is a market index used as a yardstick. The Fund Console compares NAV with the NIFTY 50 for Indian stocks and the S&P 500 for US stocks.'],
    reading: [
      'If the fund made 8% while the NIFTY 50 made 12%, it underperformed: a simple index fund would have done better.',
      'Comparing with a benchmark over the same period is the honest way to judge any strategy, human or AI.',
    ],
    watchOut: ['Pick a benchmark that matches what the fund holds. A US tech portfolio should not be judged against the NIFTY 50.'],
    takeaways: ['Always compare returns with a benchmark.', 'PortAI uses the NIFTY 50 and S&P 500.', 'Beating the benchmark consistently is hard.'],
    quiz: [
      {
        question: 'The fund returned 10%, the NIFTY 50 returned 14%. How did the fund do?',
        options: ['Outperformed', 'Underperformed by 4 points', 'Matched'],
        answer: 1,
        explanation: '10% − 14% = −4 percentage points relative to the benchmark.',
      },
      {
        question: 'Why use a benchmark at all?',
        options: ['To know whether the strategy beat a simple alternative', 'Regulators require all apps to', 'It sets the fund’s fees'],
        answer: 0,
        explanation: 'An index fund is the easy alternative any strategy must beat.',
      },
    ],
    related: { href: '/console', label: 'Compare NAV with the benchmark' },
  },
];

const METRICS: LearnModule[] = METRIC_SPECS.map((m) => ({
  slug: m.slug,
  track: 'metrics',
  title: m.title,
  summary: m.summary,
  minutes: 3,
  sections: [
    { heading: 'What it is', body: m.what, formula: m.formula },
    { heading: 'How to read it', body: m.reading },
    { heading: 'Watch out for', body: [], bullets: m.watchOut },
  ],
  takeaways: m.takeaways,
  quiz: m.quiz,
  related: m.related,
}));

const INDIA: LearnModule[] = [
  {
    slug: 'why-fo-traders-lose',
    track: 'india',
    title: 'Why most F&O traders lose',
    summary: 'What SEBI’s 2024 study found, and why derivatives are so hard for individuals.',
    minutes: 5,
    sections: [
      {
        heading: 'The numbers',
        body: [
          'In September 2024 SEBI published a study of individual traders in equity futures and options (F&O). Over FY22 to FY24, 93% of them lost money, and their combined losses exceeded ₹1.8 lakh crore. The average loss was about ₹2 lakh per trader, including transaction costs.',
        ],
      },
      {
        heading: 'Why it happens',
        body: ['Derivatives are built to make small moves matter, and that works against inexperienced traders.'],
        bullets: [
          'Leverage: a small price move can wipe out the premium or margin.',
          'Time decay: bought options lose value every day the expected move does not come.',
          'Costs: brokerage, exchange fees and taxes add up across frequent trades.',
          'The other side: many counterparties are professional firms with better data and faster systems.',
        ],
      },
      {
        heading: 'SEBI’s response',
        body: [
          'From late 2024 SEBI tightened index derivative rules, including a higher minimum contract size, one weekly expiry per exchange, and upfront collection of option premiums. The aim is to slow down speculative retail trading.',
        ],
      },
      {
        heading: 'What to do instead',
        body: [
          'Learn how investing decisions are made before risking money. Paper-trade, read the reasoning behind each trade, and understand your own risk tolerance. PortAI is built for exactly that, and never trades derivatives.',
        ],
      },
    ],
    takeaways: [
      '93% of individual F&O traders lost money over FY22–FY24 (SEBI, 2024).',
      'Leverage, time decay and costs work against retail traders.',
      'Learning with paper money first is the cheaper way to gain experience.',
    ],
    quiz: [
      {
        question: 'What share of individual F&O traders lost money over FY22–FY24, according to SEBI?',
        options: ['About half', '75%', '93%'],
        answer: 2,
        explanation: 'SEBI’s September 2024 study found 93% made losses.',
      },
      {
        question: 'Why do bought options lose value when the price does not move?',
        options: ['Time decay', 'Dividends', 'Stock splits'],
        answer: 0,
        explanation: 'An option’s time value shrinks as expiry approaches.',
      },
    ],
    related: { href: '/onboarding', label: 'Take the 2-minute risk quiz' },
  },
  {
    slug: 'research-analyst-vs-investment-adviser',
    track: 'india',
    title: 'Research Analyst vs Investment Adviser',
    summary: 'The two SEBI registrations for anyone who tells the public what to buy.',
    minutes: 5,
    sections: [
      {
        heading: 'Research Analyst (RA)',
        body: [
          'A SEBI-registered Research Analyst publishes research and recommendations on securities, such as buy, sell or hold calls and price targets. RAs must meet qualification and certification requirements, register with SEBI and follow disclosure rules, including declaring conflicts of interest.',
        ],
      },
      {
        heading: 'Investment Adviser (IA)',
        body: [
          'A SEBI-registered Investment Adviser gives personalised advice for a fee. Before advising, an IA must profile the client’s risk and make sure recommendations suit that client.',
        ],
      },
      {
        heading: 'The key difference',
        bullets: [
          'RA: research and recommendations on securities, typically the same for every subscriber.',
          'IA: advice tailored to one client’s goals, finances and risk profile.',
          'Both: registration with SEBI, qualification requirements, and rules on fees and disclosures.',
        ],
        body: [],
      },
      {
        heading: 'Where PortAI stands',
        body: [
          'PortAI today is an education and paper-trading product: it does not recommend securities to users and does not handle money. If PortAI ever publishes its Stratton Scores as recommendations to the public, it would need to register as a Research Analyst first. That registration is on the roadmap.',
        ],
      },
    ],
    takeaways: [
      'RAs publish research and recommendations; IAs give personalised advice.',
      'Both must be registered with SEBI.',
      'PortAI is not registered today and does not give investment advice.',
    ],
    quiz: [
      {
        question: 'Which registration covers personalised advice tailored to one client?',
        options: ['Research Analyst', 'Investment Adviser', 'Neither'],
        answer: 1,
        explanation: 'IAs must profile each client and give suitable, personalised advice.',
      },
      {
        question: 'Publishing buy and sell calls on stocks to the public requires…',
        options: ['Nothing', 'SEBI Research Analyst registration', 'A demat account'],
        answer: 1,
        explanation: 'Recommendations on securities fall under the RA regulations.',
      },
    ],
  },
  {
    slug: 'sebi-real-time-data-rule',
    track: 'india',
    title: 'SEBI’s real-time data rule for paper-trading apps',
    summary: 'Why PortAI uses end-of-day prices instead of live ticks.',
    minutes: 3,
    sections: [
      {
        heading: 'The rule',
        body: [
          'In May 2024 SEBI told regulated entities, including exchanges and brokers, not to share real-time price data with third parties except where it is needed to run actual trading. Price data may be shared for other uses only with a lag of at least one day.',
        ],
      },
      {
        heading: 'Why SEBI did it',
        body: [
          'A wave of apps offered virtual trading games and fantasy leagues built on live stock prices. SEBI saw these as a route to gamified speculation and wanted to stop live market data being used that way.',
        ],
      },
      {
        heading: 'What it means for PortAI',
        body: [
          'PortAI’s fund runs once a day after the NSE close, on end-of-day prices. The paper ledger, the Stratton Score and the backtests all use that data. This keeps the product an education tool rather than a live trading game.',
        ],
      },
    ],
    takeaways: [
      'Real-time price data cannot be used for virtual trading products.',
      'End-of-day (one-day-lagged) data is allowed.',
      'PortAI runs once a day on end-of-day prices.',
    ],
    quiz: [
      {
        question: 'Which data can a paper-trading app use under SEBI’s 2024 rule?',
        options: ['Live tick-by-tick prices', 'Prices with at least a one-day lag', 'No price data at all'],
        answer: 1,
        explanation: 'Data may be shared for non-trading uses with a lag of at least one day.',
      },
      {
        question: 'When does PortAI’s fund run?',
        options: ['Continuously during market hours', 'Once a day after the NSE close', 'Weekly'],
        answer: 1,
        explanation: 'Weekdays at 15:45 IST, on end-of-day data.',
      },
    ],
  },
  {
    slug: 'finfluencer-rules',
    track: 'india',
    title: 'Finfluencer rules',
    summary: 'How SEBI separated regulated firms from unregistered market influencers.',
    minutes: 4,
    sections: [
      {
        heading: 'The problem',
        body: [
          'Social media is full of financial influencers sharing tips, “sure-shot” calls and screenshots of profits. Many are not registered with SEBI and are paid through referral links or promotions by brokers and platforms.',
        ],
      },
      {
        heading: 'The rule',
        body: [
          'In August 2024 SEBI barred registered entities such as brokers, advisers and their agents from associating with unregistered people who give investment advice or make claims about returns. That includes paying them, sharing referrals or running promotions with them.',
        ],
      },
      {
        heading: 'The education carve-out',
        body: [
          'Pure investor education is allowed, as long as it does not give advice or recommendations and does not make claims about returns. SEBI later clarified that education content should not use recent market price data.',
        ],
      },
      {
        heading: 'How to protect yourself',
        bullets: [
          'Check SEBI registration on the SEBI website before following anyone’s calls.',
          'Be wary of guaranteed returns or urgency to act now.',
          'Ask why a trade makes sense, not just what to buy.',
        ],
        body: [],
      },
    ],
    takeaways: [
      'Registered firms cannot partner with unregistered people who give advice or claim returns.',
      'Education without recommendations is allowed.',
      'Always check SEBI registration before acting on a tip.',
    ],
    quiz: [
      {
        question: 'Under SEBI’s 2024 rules, can a broker pay an unregistered influencer to promote stock tips?',
        options: ['Yes', 'No', 'Only on YouTube'],
        answer: 1,
        explanation: 'Registered entities may not associate with unregistered people giving advice or return claims.',
      },
      {
        question: 'What is still allowed for unregistered creators?',
        options: ['Buy and sell calls', 'Investor education without advice or return claims', 'Guaranteed-return schemes'],
        answer: 1,
        explanation: 'Education is carved out as long as it does not advise or promise returns.',
      },
    ],
  },
];

export const MODULES: LearnModule[] = [...START, ...PERSONAS, ...METRICS, ...INDIA];

export function getModule(slug: string): LearnModule | undefined {
  return MODULES.find((m) => m.slug === slug);
}

export function modulesInTrack(track: TrackId): LearnModule[] {
  return MODULES.filter((m) => m.track === track);
}

export function neighbours(slug: string): { prev?: LearnModule; next?: LearnModule } {
  const i = MODULES.findIndex((m) => m.slug === slug);
  if (i < 0) return {};
  return { prev: MODULES[i - 1], next: MODULES[i + 1] };
}
