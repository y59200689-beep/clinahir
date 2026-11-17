import test from 'node:test';
import assert from 'node:assert/strict';
import { appointmentSchema, hasConflict } from '../.integration-build/src/demo/scheduling.js';
import { doctors } from '../.integration-build/src/demo/appointments.js';

const input = { patient: 'Demo Patient', phone: '0000000000', date: '2026-09-29', time: '09:00', service: 'MRI', doctor: doctors[0], status: 'pending' };
test('scheduling rejects impossible dates, unknown doctors and invalid hours', () => {
  assert.equal(appointmentSchema.safeParse(input).success, true);
  for (const patch of [{ date: '2026-02-30' }, { time: '25:00' }, { time: '07:30' }, { doctor: 'unknown' }, { patient: ' ' }, { service: 'unknown' }]) assert.equal(appointmentSchema.safeParse({ ...input, ...patch }).success, false);
});
test('conflict checks protect overlapping doctor slots, allow adjacent slots and self edits', () => {
  const records = [{ ...input, id: 1 }];
  assert.equal(hasConflict(records, input), true);
  assert.equal(hasConflict(records, { ...input, time: '09:15' }), true);
  assert.equal(hasConflict(records, { ...input, time: '09:30' }), false);
  assert.equal(hasConflict(records, { ...input, doctor: doctors[1] }), false);
  assert.equal(hasConflict(records, input, 1), false);
  assert.equal(hasConflict([{ ...records[0], status: 'cancelled' }], input), false);
  assert.equal(hasConflict(records, { ...input, status: 'cancelled' }), false);
});
