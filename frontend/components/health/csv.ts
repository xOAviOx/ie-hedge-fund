export interface HoldingRow {
  ticker: string;
  quantity: string;
  avg_cost: string;
}

const FIELD_ALIASES: Record<keyof HoldingRow, string[]> = {
  ticker: ['ticker', 'symbol', 'instrument', 'tradingsymbol', 'stock', 'scrip', 'name'],
  quantity: ['quantity', 'qty', 'shares', 'units', 'quantityavailable'],
  avg_cost: ['avgcost', 'averagecost', 'avgprice', 'averageprice', 'avg', 'buyprice', 'buyavg', 'cost'],
};

const norm = (h: string) => h.toLowerCase().replace(/[^a-z]/g, '');

// Minimal RFC-4180-ish line split: handles quoted fields containing commas ("1,234.50").
function splitLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (quoted && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else quoted = !quoted;
    } else if ((c === ',' || c === '\t' || c === ';') && !quoted) {
      out.push(cur.trim());
      cur = '';
    } else cur += c;
  }
  out.push(cur.trim());
  return out;
}

export const cleanNumber = (s: string) => s.replace(/[^0-9.\-]/g, '');

export function parseHoldingsCsv(text: string): HoldingRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return [];

  const header = splitLine(lines[0]).map(norm);
  const index: Record<keyof HoldingRow, number> = { ticker: -1, quantity: -1, avg_cost: -1 };
  (Object.keys(FIELD_ALIASES) as (keyof HoldingRow)[]).forEach((field) => {
    index[field] = header.findIndex((h) => FIELD_ALIASES[field].includes(h));
  });
  const hasHeader = index.ticker >= 0 && index.quantity >= 0;
  // Headerless input is read positionally as ticker,quantity,avg_cost.
  const cols = hasHeader ? index : { ticker: 0, quantity: 1, avg_cost: 2 };
  const body = hasHeader ? lines.slice(1) : lines;

  return body
    .map((line) => {
      const cells = splitLine(line);
      return {
        ticker: (cells[cols.ticker] ?? '').toUpperCase(),
        quantity: cleanNumber(cells[cols.quantity] ?? ''),
        avg_cost: cols.avg_cost >= 0 ? cleanNumber(cells[cols.avg_cost] ?? '') : '',
      };
    })
    .filter((r) => r.ticker);
}
