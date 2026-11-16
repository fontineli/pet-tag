// Funções puras: sem DOM, testadas por check.js.

export function parseCSV(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows.filter(r => r.some(f => f.trim() !== ''));
}

export function toObjects(rows) {
  const [head = [], ...body] = rows;
  const keys = head.map(k => k.trim());
  return body.map(r => Object.fromEntries(keys.map((k, i) => [k, r[i] ?? ''])));
}

export function parseDateBR(s) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})/.exec((s ?? '').trim());
  if (!m) return null;
  const [d, mo, y] = [+m[1], +m[2], +m[3]];
  const date = new Date(y, mo - 1, d);
  return date.getDate() === d && date.getMonth() === mo - 1 ? date : null;
}

const DAY = 86400000;
const midnight = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export function daysUntil(next, today) {
  return Math.round((midnight(next) - midnight(today)) / DAY);
}

export function vaccineStatus(next, today) {
  if (!next) return 'none';
  const n = daysUntil(next, today);
  if (n < 0) return 'overdue';
  return n <= 30 ? 'soon' : 'ok';
}

const norm = s => (s ?? '').trim().toLowerCase();

export function latestByVaccine(records) {
  const best = new Map();
  for (const r of records) {
    const key = norm(r.Vacina);
    const t = parseDateBR(r['Data de aplicação'])?.getTime() ?? -Infinity;
    if (!best.has(key) || t > best.get(key).t) best.set(key, { r, t });
  }
  return [...best.values()].map(v => v.r);
}

export function findPet(pets, id) {
  if (!id || !id.trim()) return null;
  return pets.find(p => norm(p.id) === norm(id)) ?? null;
}

export const isTrue = v => ['true', 'verdadeiro', 'sim', '1'].includes(norm(v));

export const digits = s => (s ?? '').replace(/\D/g, '');

export function firstUrl(s) {
  return (s ?? '').split(/[\s,]+/).find(p => p.startsWith('http')) ?? null;
}
