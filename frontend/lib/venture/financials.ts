// Business-plan model: pure functions over editable assumptions. Every default
// here is a team estimate, not sourced data. The sizing page reads the year-3
// paid users from this model so SOM and the projection always agree.

export const YEARS = 5;

export interface Assumptions {
  users: number[];
  conversion: number[];
  proArpu: number;
  colleges: number[];
  collegeFee: number;
  b2bClients: number[];
  b2bFee: number;
  activeShare: number;
  costPerActiveUser: number;
  cac: number;
  annualChurn: number;
  paymentFeePct: number;
  teamCost: number[];
  fixedCost: number[];
  complianceCost: number[];
  dataLicensing: number[];
}

export const DEFAULT_ASSUMPTIONS: Assumptions = {
  users: [20_000, 120_000, 400_000, 900_000, 1_800_000],
  conversion: [0.03, 0.04, 0.05, 0.055, 0.06],
  proArpu: 2_200,
  colleges: [5, 30, 80, 150, 250],
  collegeFee: 150_000,
  b2bClients: [0, 3, 10, 25, 45],
  b2bFee: 300_000,
  activeShare: 0.4,
  costPerActiveUser: 60,
  cac: 600,
  annualChurn: 0.35,
  paymentFeePct: 0.02,
  teamCost: [3_600_000, 9_600_000, 22_000_000, 36_000_000, 54_000_000],
  fixedCost: [1_400_000, 4_000_000, 7_500_000, 12_000_000, 18_000_000],
  complianceCost: [100_000, 800_000, 1_000_000, 1_500_000, 2_000_000],
  dataLicensing: [0, 600_000, 1_800_000, 3_000_000, 4_500_000],
};

export const ASSUMPTION_NOTES: Record<keyof Assumptions, string> = {
  users: 'Registered users at year end (free + paid). Estimate.',
  conversion: 'Share of registered users on Pro. Freemium apps typically convert 2–5%. Estimate.',
  proArpu: 'Blended Pro revenue per paid user per year after discounts (list ₹2,499/yr). Estimate.',
  colleges: 'Colleges / finance clubs on the Campus plan. Estimate.',
  collegeFee: 'Annual Campus contract per college (≈255 students at ₹49/month). Estimate.',
  b2bClients: 'Brokers, fintechs and edtechs on the API plan. Estimate.',
  b2bFee: 'API plan from ₹25,000/month. Estimate.',
  activeShare: 'Share of registered users active in a month. Estimate.',
  costPerActiveUser: 'LLM + cloud cost per active user per year. One LLM call per fund run keeps this low. Estimate.',
  cac: 'Blended acquisition cost per new paid user (campus-led, content-led). Estimate.',
  annualChurn: 'Share of paid users lost each year. Estimate.',
  paymentFeePct: 'Payment gateway fee on consumer payments (≈2% for Indian gateways).',
  teamCost: 'Salaries and stipends. Estimate.',
  fixedCost: 'Cloud base, tools, legal, office and brand marketing. Estimate.',
  complianceCost: 'Incorporation, NISM certifications, SEBI RA application, registration and deposit (Year 2+), audits. Estimate.',
  dataLicensing: 'Year 1 runs on free end-of-day data; licensed exchange data from Year 2. Estimate.',
};

export interface YearRow {
  year: number;
  users: number;
  paidUsers: number;
  newPaidUsers: number;
  revenuePro: number;
  revenueCampus: number;
  revenueB2B: number;
  revenue: number;
  variableCost: number;
  paymentFees: number;
  acquisitionCost: number;
  teamCost: number;
  fixedCost: number;
  complianceCost: number;
  dataLicensing: number;
  totalCost: number;
  ebitda: number;
  ebitdaMargin: number | null;
  cumulativeCash: number;
}

export function project(a: Assumptions): YearRow[] {
  const rows: YearRow[] = [];
  let prevPaid = 0;
  let cumulative = 0;
  for (let i = 0; i < YEARS; i++) {
    const users = a.users[i];
    const paidUsers = Math.round(users * a.conversion[i]);
    const newPaidUsers = Math.max(0, Math.round(paidUsers - prevPaid * (1 - a.annualChurn)));
    const revenuePro = paidUsers * a.proArpu;
    const revenueCampus = a.colleges[i] * a.collegeFee;
    const revenueB2B = a.b2bClients[i] * a.b2bFee;
    const revenue = revenuePro + revenueCampus + revenueB2B;
    const variableCost = users * a.activeShare * a.costPerActiveUser;
    const paymentFees = revenuePro * a.paymentFeePct;
    const acquisitionCost = newPaidUsers * a.cac;
    const totalCost =
      variableCost + paymentFees + acquisitionCost + a.teamCost[i] + a.fixedCost[i] + a.complianceCost[i] + a.dataLicensing[i];
    const ebitda = revenue - totalCost;
    cumulative += ebitda;
    rows.push({
      year: i + 1,
      users,
      paidUsers,
      newPaidUsers,
      revenuePro,
      revenueCampus,
      revenueB2B,
      revenue,
      variableCost,
      paymentFees,
      acquisitionCost,
      teamCost: a.teamCost[i],
      fixedCost: a.fixedCost[i],
      complianceCost: a.complianceCost[i],
      dataLicensing: a.dataLicensing[i],
      totalCost,
      ebitda,
      ebitdaMargin: revenue > 0 ? ebitda / revenue : null,
      cumulativeCash: cumulative,
    });
    prevPaid = paidUsers;
  }
  return rows;
}

export interface BreakEven {
  monthlyFixed: number;
  monthlyContributionPerPaid: number;
  paidUsersNeeded: number | null;
  totalUsersNeeded: number | null;
  conversion: number;
}

/**
 * Consumer break-even for one year's cost base. Each paid user also carries the
 * serving cost of the free users behind them ((1 − c) / c of them at conversion c),
 * so that cost is netted out of the contribution.
 */
export function breakEven(a: Assumptions, yearIndex: number): BreakEven {
  const c = a.conversion[yearIndex];
  const monthlyFixed =
    (a.teamCost[yearIndex] + a.fixedCost[yearIndex] + a.complianceCost[yearIndex] + a.dataLicensing[yearIndex]) / 12;
  const freeCarry = c > 0 ? ((1 - c) / c) * a.activeShare * a.costPerActiveUser : Infinity;
  const yearly = a.proArpu * (1 - a.paymentFeePct) - a.costPerActiveUser - freeCarry;
  const monthlyContributionPerPaid = yearly / 12;
  const paidUsersNeeded = monthlyContributionPerPaid > 0 ? Math.ceil(monthlyFixed / monthlyContributionPerPaid) : null;
  return {
    monthlyFixed,
    monthlyContributionPerPaid,
    paidUsersNeeded,
    totalUsersNeeded: paidUsersNeeded != null && c > 0 ? Math.ceil(paidUsersNeeded / c) : null,
    conversion: c,
  };
}

export interface UnitEconomics {
  contributionPerYear: number;
  lifetimeYears: number;
  ltv: number;
  cac: number;
  ltvToCac: number | null;
  paybackMonths: number | null;
}

export function unitEconomics(a: Assumptions): UnitEconomics {
  const contributionPerYear = a.proArpu * (1 - a.paymentFeePct) - a.costPerActiveUser;
  const lifetimeYears = a.annualChurn > 0 ? 1 / a.annualChurn : Infinity;
  const ltv = contributionPerYear * lifetimeYears;
  return {
    contributionPerYear,
    lifetimeYears,
    ltv,
    cac: a.cac,
    ltvToCac: a.cac > 0 ? ltv / a.cac : null,
    paybackMonths: contributionPerYear > 0 ? (a.cac / contributionPerYear) * 12 : null,
  };
}

export const CSV_COLUMNS: { key: keyof YearRow; label: string }[] = [
  { key: 'year', label: 'Year' },
  { key: 'users', label: 'Registered users' },
  { key: 'paidUsers', label: 'Paid users' },
  { key: 'revenuePro', label: 'Revenue - Pro' },
  { key: 'revenueCampus', label: 'Revenue - Campus' },
  { key: 'revenueB2B', label: 'Revenue - API/B2B' },
  { key: 'revenue', label: 'Total revenue' },
  { key: 'variableCost', label: 'LLM + infra' },
  { key: 'paymentFees', label: 'Payment fees' },
  { key: 'acquisitionCost', label: 'Acquisition (CAC)' },
  { key: 'teamCost', label: 'Team' },
  { key: 'fixedCost', label: 'Fixed + marketing' },
  { key: 'complianceCost', label: 'Compliance' },
  { key: 'dataLicensing', label: 'Data licensing' },
  { key: 'totalCost', label: 'Total cost' },
  { key: 'ebitda', label: 'EBITDA' },
  { key: 'cumulativeCash', label: 'Cumulative cash (pre-funding)' },
];

export function toCsv(rows: YearRow[]): string {
  const header = CSV_COLUMNS.map((c) => c.label).join(',');
  const body = rows.map((r) => CSV_COLUMNS.map((c) => Math.round(Number(r[c.key]))).join(','));
  return [header, ...body].join('\n');
}

export const DEFAULT_PROJECTION = project(DEFAULT_ASSUMPTIONS);
export const YEAR3_PAID_USERS = DEFAULT_PROJECTION[2].paidUsers;

/** ₹ in lakh/crore, e.g. ₹4.40 Cr, ₹38.2 L, ₹600. */
export function inr(v: number, dp = 2): string {
  const sign = v < 0 ? '−' : '';
  const a = Math.abs(v);
  if (a >= 1e7) return `${sign}₹${(a / 1e7).toFixed(dp)} Cr`;
  if (a >= 1e5) return `${sign}₹${(a / 1e5).toFixed(dp > 1 ? 1 : dp)} L`;
  return `${sign}₹${Math.round(a).toLocaleString('en-IN')}`;
}

export function count(v: number): string {
  if (v >= 1e7) return `${(v / 1e7).toFixed(2)} Cr`;
  if (v >= 1e5) return `${(v / 1e5).toFixed(1)} L`;
  return Math.round(v).toLocaleString('en-IN');
}
