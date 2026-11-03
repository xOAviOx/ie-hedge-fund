import { YEAR3_PAID_USERS } from './financials';

export interface SizingInputs {
  tamUsers: number;
  samUsers: number;
  somUsers: number;
  price: number;
}

export const DEFAULT_SIZING: SizingInputs = {
  tamUsers: 110_000_000,
  samUsers: 15_000_000,
  somUsers: YEAR3_PAID_USERS,
  price: 2_499,
};

export const SIZING_SOURCES = {
  tam: {
    label: 'India’s unique registered investors on NSE crossed 11 crore on 20 January 2025.',
    source: 'NSE press release, January 2025',
    url: 'https://www.nseindia.com/mediacoverage/nse-registered-investor-base-crosses-11-crore-110-million-unique-investors-unique-pans-and-over-21-crore-210-million-total-accounts',
  },
  sam: {
    label: 'Digitally active DIY equity investors aged 18–40 who use investing apps. Team estimate (≈14% of unique investors).',
    source: 'Team estimate',
  },
  som: {
    label: 'Paid Pro users by year 3, taken directly from the financial model.',
    source: 'Financial model, Year 3 (estimate)',
  },
  price: { label: 'PortAI Pro list price, billed yearly.', source: 'PortAI pricing' },
};

export function sizing(i: SizingInputs) {
  return {
    tam: i.tamUsers * i.price,
    sam: i.samUsers * i.price,
    som: i.somUsers * i.price,
    samShare: i.tamUsers > 0 ? i.samUsers / i.tamUsers : 0,
    somShare: i.samUsers > 0 ? i.somUsers / i.samUsers : 0,
  };
}
