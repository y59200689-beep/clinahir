import test from 'node:test';
import assert from 'node:assert/strict';
import { parseProspectCsv } from '../.integration-build/server/prospects.js';

const header = 'center_name,city,phone,email,listing_url,rating,review_count,website_url,online_booking_available,main_gap,gap_evidence,source_name,source_url,notes';
const csv = (data) => `${header}\n${data}`;

test('prospect CSV normalizes fields and keeps unknown facts empty', () => {
  const [row] = parseProspectCsv(csv('Centre Atlas,Casablanca,+212600000000, INFO@ATLAS.MA,https://maps.example/atlas,4.7,83,Missing,unknown,No booking link,Checked public website,Approved directory,https://directory.example/atlas,'), true);
  assert.equal(row.email, 'info@atlas.ma');
  assert.equal(row.website_url, null);
  assert.equal(row.online_booking_available, null);
  assert.equal(row.rating, 4.7);
  assert.equal(row.review_count, 83);
  assert.equal(row.source_use_confirmed, true);
  assert.equal(row.notes, '');
});

test('prospect CSV supports commas, escaped quotes, and newlines inside quoted values', () => {
  const [row] = parseProspectCsv(csv('"Centre Atlas, SARL",Rabat,,,,,,,No,"No booking page","Observed on site: ""Contact us""\nwith no booking option",Directory,https://directory.example/atlas,"Reviewed\nby operator"'), true);
  assert.equal(row.center_name, 'Centre Atlas, SARL');
  assert.equal(row.gap_evidence, 'Observed on site: "Contact us"\nwith no booking option');
  assert.equal(row.notes, 'Reviewed\nby operator');
});

test('prospect import requires a source-use attestation and source details', () => {
  assert.throws(() => parseProspectCsv(csv('Centre Atlas,Casablanca,,,,,,,,,,,,Directory,https://directory.example'), false), /Confirm that your source/);
  assert.throws(() => parseProspectCsv('center_name,city\nCentre Atlas,Casablanca', true), /source_name column/);
  assert.throws(() => parseProspectCsv('center_name,city,source_name,source_url\nCentre Atlas,Casablanca,Directory,javascript:alert(1)', true), /source_url must be a public http or https URL/);
});

test('prospect import rejects duplicate or unknown headers, invalid metrics, and malformed CSV', () => {
  assert.throws(() => parseProspectCsv('center_name,city,source_name,source_url,city\nA,B,C,https://x.test,B', true), /headers must be unique/);
  assert.throws(() => parseProspectCsv(`${header},patient_name\nA,B,,,,,,,,,,,,C,https://x.test,`, true), /Unsupported CSV column/);
  assert.throws(() => parseProspectCsv('center_name,city,rating,source_name,source_url\nCentre Atlas,Casablanca,5.1,Directory,https://directory.example', true), /rating must be between 0 and 5/);
  assert.throws(() => parseProspectCsv(csv('"Centre Atlas,Casablanca,,,,,,,,,,,,Directory,https://directory.example'), true), /unclosed quoted field/);
});
