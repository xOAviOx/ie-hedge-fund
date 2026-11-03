// Course ENT 3005 sessions mapped to the Venture section's deliverables.

export interface VentureTab {
  href: string;
  label: string;
}

export const VENTURE_TABS: VentureTab[] = [
  { href: '/venture', label: 'Overview' },
  { href: '/venture/problem', label: 'Problem' },
  { href: '/venture/innovation', label: 'Innovation' },
  { href: '/venture/market', label: 'Market' },
  { href: '/venture/sizing', label: 'Sizing' },
  { href: '/venture/customers', label: 'Customers' },
  { href: '/venture/business-model', label: 'Business model' },
  { href: '/venture/financials', label: 'Financials' },
  { href: '/venture/funding', label: 'Funding' },
  { href: '/venture/exemplar', label: 'Exemplar' },
  { href: '/venture/team', label: 'Team' },
  { href: '/venture/business-plan', label: 'Business plan' },
];

/** How a row's status is decided: fixed, or live from the interview counts. */
export type CourseStatusRule =
  | { kind: 'done' }
  | { kind: 'team'; reason: string }
  | { kind: 'interviews'; interviewKind: 'customer' | 'exemplar'; min: number };

export interface CourseRow {
  session: string;
  topic: string;
  deliverable: string;
  href: string;
  status: CourseStatusRule;
}

export const COURSE_MAP: CourseRow[] = [
  { session: '1', topic: 'Entrepreneurial mindset', deliverable: 'Why this team, why now', href: '/venture/problem#mindset', status: { kind: 'done' } },
  { session: '2', topic: 'Innovation types and sources (Henderson-Clark, jugaad)', deliverable: 'Henderson-Clark grid, Drucker sources, frugal design', href: '/venture/innovation', status: { kind: 'done' } },
  { session: '3', topic: 'Project brief (RideOn discovery hypotheses)', deliverable: 'Problem brief and hypotheses table', href: '/venture/customers#hypotheses', status: { kind: 'done' } },
  { session: '4', topic: 'Opportunity, drivers, PESTEL, Porter, competition', deliverable: 'Market analysis and positioning map', href: '/venture/market', status: { kind: 'done' } },
  { session: '4', topic: 'Talk to 2–3 potential customers', deliverable: 'Customer interview log', href: '/venture/customers#interviews', status: { kind: 'interviews', interviewKind: 'customer', min: 3 } },
  { session: '5', topic: 'TAM / SAM / SOM', deliverable: 'Interactive sizing calculator', href: '/venture/sizing', status: { kind: 'done' } },
  { session: '6', topic: 'Customer discovery and value proposition canvas', deliverable: 'Segments, personas, script, VPC', href: '/venture/customers', status: { kind: 'done' } },
  { session: '7', topic: 'Business model canvas (SoccerGrlProbs)', deliverable: 'Nine-block canvas', href: '/venture/business-model', status: { kind: 'done' } },
  { session: '8', topic: 'Presentation of VPC + BMC', deliverable: 'Pitch slides 8–9', href: '/venture/pitch', status: { kind: 'team', reason: 'Rehearse and present in class' } },
  { session: '9', topic: 'Business plan, break-even, cost assumptions', deliverable: 'Business plan spreadsheet', href: '/venture/financials', status: { kind: 'done' } },
  { session: '10–11', topic: 'Exemplar startup journey (smallcase)', deliverable: 'Journey map, lessons, 2–3 page report', href: '/venture/exemplar', status: { kind: 'done' } },
  { session: '10–11', topic: 'At least 2 interactions with the startup', deliverable: 'Exemplar interaction log', href: '/venture/exemplar#interactions', status: { kind: 'interviews', interviewKind: 'exemplar', min: 2 } },
  { session: '12', topic: 'Sources of money and pitching', deliverable: 'Funding ladder, ask, use of funds', href: '/venture/funding', status: { kind: 'done' } },
  { session: '13–14', topic: 'Written business plan', deliverable: 'Printable business plan', href: '/venture/business-plan', status: { kind: 'done' } },
  { session: '13–14', topic: 'Pitch presentation', deliverable: '13-slide pitch deck', href: '/venture/pitch', status: { kind: 'done' } },
  { session: '13–14', topic: 'A2 printed poster', deliverable: 'A2 poster', href: '/venture/poster', status: { kind: 'team', reason: 'Print at A2 and bring to class' } },
];

export const EVALUATION = [
  { component: 'Class participation', weight: 20 },
  { component: 'Project progress (sessions 3 and 8)', weight: 20 },
  { component: 'Exemplar startup journey', weight: 20 },
  { component: 'End-term pitch', weight: 30 },
  { component: 'Poster', weight: 10 },
];
