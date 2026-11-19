import type {Lead} from './types.js';
export function spreadsheetCsv(rows: unknown[][]): string {
 const escape=(value:unknown)=>{
  let text=String(value??'');
  // Treat spreadsheet formulas and control-prefixed cells as literal text.
  if(/^(?:\s*[=+@-]|[\t\r\n])/.test(text))text="'"+text;
  return `"${text.replaceAll('"','""')}"`;
 };
 return '\uFEFF'+rows.map(row=>row.map(escape).join(',')).join('\r\n');
}

export function leadsCsv(leads:Lead[]):string {
 return spreadsheetCsv([['Center','Contact','Phone','Email','City','Stage','Source','Submitted'],...leads.map(l=>[l.company_name,l.contact_name,l.phone,l.email,l.city,l.admin_stage,l.utm_source,l.submitted_at])]);
}
