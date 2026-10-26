export interface ProspectImportRow {
  center_name: string;
  city: string;
  address: string | null;
  category: string | null;
  phone: string | null;
  email: string | null;
  listing_url: string | null;
  website_url: string | null;
  rating: number | null;
  review_count: number | null;
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  online_booking_available: boolean | null;
  main_gap: string | null;
  gap_evidence: string | null;
  source_name: string;
  source_url: string;
  source_use_confirmed: true;
  notes: string;
}

const columns = new Set([
  'center_name','city','address','category','phone','email','listing_url','website_url','rating','review_count',
  'instagram_url','facebook_url','tiktok_url','online_booking_available','main_gap',
  'gap_evidence','source_name','source_url','notes'
]);
const text = (value: string | undefined, max: number, field: string, required = false): string | null => {
  const clean = (value ?? '').trim();
  if (!clean && required) throw new Error(`${field} is required`);
  if (clean.length > max) throw new Error(`${field} is too long`);
  return clean || null;
};
function url(value: string | undefined, field: string, required = false): string | null {
  const clean = text(value, 1000, field, required);
  if (!clean) return null;
  try {
    const parsed = new URL(clean);
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error();
  } catch { throw new Error(`${field} must be a public http or https URL`); }
  return clean;
}
function nullableBoolean(value: string | undefined, field: string): boolean | null {
  const clean = (value ?? '').trim().toLowerCase();
  if (!clean || ['unknown','n/a','na'].includes(clean)) return null;
  if (['true','yes','y','1','available'].includes(clean)) return true;
  if (['false','no','n','0','unavailable'].includes(clean)) return false;
  throw new Error(`${field} must be yes, no, or unknown`);
}
function csvRows(source: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = '', quoted = false;
  for (let i = 0; i < source.length; i++) {
    const c = source[i];
    if (quoted) {
      if (c === '"' && source[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"' && cell.length === 0) quoted = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && source[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some(value => value.trim())) rows.push(row);
      row = [];
    } else cell += c;
  }
  if (quoted) throw new Error('CSV contains an unclosed quoted field');
  row.push(cell);
  if (row.some(value => value.trim())) rows.push(row);
  return rows;
}
export function parseProspectCsv(source: string, sourceUseConfirmed: boolean): ProspectImportRow[] {
  if (!sourceUseConfirmed) throw new Error('Confirm that your source permits business-data collection and commercial prospecting.');
  if (!source.trim() || source.length > 180_000) throw new Error('Choose a non-empty CSV under 180 KB.');
  const rows = csvRows(source);
  if (rows.length < 2) throw new Error('CSV needs a header and at least one prospect.');
  if (rows.length > 501) throw new Error('Import up to 500 prospects at a time.');
  const rawHeaders = rows[0].map(h => h.trim().replace(/^\uFEFF/, '').toLowerCase().replace(/[ -]+/g, '_'));
  const mapsExport = rawHeaders.includes('title') && rawHeaders.includes('review_rating') && rawHeaders.includes('website') && rawHeaders.includes('city');
  const aliases: Record<string,string> = { title:'center_name', emails:'email', website:'website_url', review_rating:'rating' };
  const headers = rawHeaders.map(header => aliases[header] ?? header);
  if (new Set(headers).size !== headers.length) throw new Error('CSV headers must be unique.');
  const unknown = headers.filter(h => !columns.has(h));
  if (unknown.length) throw new Error(`Unsupported CSV column: ${unknown[0]}`);
  for (const required of ['center_name','city']) if (!headers.includes(required)) throw new Error(`CSV needs a ${required} column.`);
  if (!mapsExport) for (const required of ['source_name','source_url']) if (!headers.includes(required)) throw new Error(`CSV needs a ${required} column.`);
  return rows.slice(1).map((values, index) => {
    const raw = Object.fromEntries(headers.map((header, i) => [header, values[i] ?? ''])) as Record<string,string>;
    const field = (key: string) => raw[key] ?? '';
    const websiteText = field('website_url').trim();
    const ratingText = field('rating').trim();
    const countText = field('review_count').trim();
    const rating = ratingText ? Number(ratingText) : null;
    const reviewCount = countText ? Number(countText) : null;
    if (rating !== null && (!Number.isFinite(rating) || rating < 0 || rating > 5)) throw new Error(`Row ${index + 2}: rating must be between 0 and 5.`);
    if (reviewCount !== null && (!Number.isInteger(reviewCount) || reviewCount < 0)) throw new Error(`Row ${index + 2}: review_count must be a non-negative integer.`);
    try {
      return {
        center_name: text(field('center_name'),200,'center_name',true)!,
        city: text(field('city'),120,'city',true)!,
        address: text(field('address'),500,'address'),
        category: text(field('category'),120,'category'),
        phone: text(field('phone'),40,'phone'),
        email: text(field('email'),254,'email')?.toLowerCase() ?? null,
        listing_url: url(field('listing_url'),'listing_url'),
        website_url: !websiteText || /^(missing|none|n\/a)$/i.test(websiteText) ? null : url(websiteText,'website_url'),
        rating,
        review_count: reviewCount,
        instagram_url: url(field('instagram_url'),'instagram_url'),
        facebook_url: url(field('facebook_url'),'facebook_url'),
        tiktok_url: url(field('tiktok_url'),'tiktok_url'),
        online_booking_available: nullableBoolean(field('online_booking_available'),'online_booking_available'),
        main_gap: text(field('main_gap'),500,'main_gap'),
        gap_evidence: text(field('gap_evidence'),1000,'gap_evidence'),
        source_name: text(field('source_name') || (mapsExport ? 'Google Maps' : ''),120,'source_name',true)!,
        source_url: url(field('source_url') || (mapsExport ? 'https://www.google.com/maps' : ''),'source_url',true)!,
        source_use_confirmed: true as const,
        notes: text(field('notes'),3000,'notes') ?? ''
      };
    } catch (error) {
      throw new Error(`Row ${index + 2}: ${(error as Error).message}`);
    }
  });
}
