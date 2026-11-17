import { doctors as seededDoctors, makeInitialAppointments, type Appointment, type AppointmentDay } from './appointments.js';
export type ProfileKind = 'patient' | 'doctor' | 'staff';
export type Profile = { id: string; name: string; phone: string; specialty: string; role: 'administrator' | 'staff'; active: boolean };
export type ProfileInput = Omit<Profile, 'id'> & { id?: string };
export type DemoRecords = { appointments: Appointment[]; patients: Profile[]; doctors: Profile[]; staff: Profile[] };
export type ProfileError = 'name' | 'phone' | 'specialty' | 'role' | 'duplicate' | 'linked' | 'missing';
const empty = { phone: '', specialty: '', role: 'staff' as const, active: true };
export const reportDate = '2026-09-29';
export const activeAppointment = (record: Appointment) => ['pending', 'confirmed'].includes(record.status);
const canonical = (name: string) => name.replace(/^Dr\.\s*/i, '').trim().toLocaleLowerCase();
const listKey = (kind: ProfileKind) => kind === 'patient' ? 'patients' : kind === 'doctor' ? 'doctors' : 'staff';

export function createDemoRecords(days: AppointmentDay[]): DemoRecords {
  const appointments = makeInitialAppointments(days);
  const historical = appointments.filter(item => item.date <= reportDate);
  const target = historical.length ? Math.round(historical.length * .92) : appointments.length;
  const patients = (historical.length ? historical : appointments).slice(0, target).map((item, i): Profile => ({ ...empty, id: `patient-${i + 1}`, name: item.patient, phone: item.phone }));
  const doctors = seededDoctors.map((name, i): Profile => ({ ...empty, id: `doctor-${i + 1}`, name: name.replace(/^Dr\.\s*/i, ''), specialty: ['Radiology', 'Medical imaging', 'Diagnostic imaging', 'Radiology'][i] }));
  const staff = Array.from({ length: 4 }, (_, i): Profile => ({ ...empty, id: `Member ${String(i + 1).padStart(2, '0')}`, name: `Member ${String(i + 1).padStart(2, '0')}`, role: i === 0 ? 'administrator' : 'staff' }));
  const mapped = appointments.map((item, i) => {
    const patient = patients.length ? patients[i % patients.length] : undefined;
    return { ...item, patientId: patient?.id, patient: patient?.name ?? item.patient, phone: patient?.phone ?? item.phone, doctorId: doctors.find(doctor => canonical(doctor.name) === canonical(item.doctor))?.id };
  });
  return { appointments: mapped, patients, doctors, staff };
}

export function saveProfile(state: DemoRecords, kind: ProfileKind, input: ProfileInput, newId: string): { state: DemoRecords; error?: ProfileError } {
  const key = listKey(kind), profiles = state[key];
  const current = input.id ? profiles.find(profile => profile.id === input.id) : undefined;
  if (input.id && !current) return { state, error: 'missing' };
  const next: Profile = { ...input, id: current?.id ?? newId, name: input.name.trim(), phone: input.phone.trim(), specialty: input.specialty.trim() };
  if (kind === 'doctor') next.name = next.name.replace(/^Dr\.\s*/i, '');
  if (next.name.length < 2 || next.name.length > 120 || /[\u0000-\u001f]/.test(next.name)) return { state, error: 'name' };
  if (kind === 'patient' && (!/^[+()\d .-]+$/.test(next.phone) || next.phone.length > 40 || next.phone.replace(/\D/g, '').length < 8 || next.phone.replace(/\D/g, '').length > 15)) return { state, error: 'phone' };
  if (kind === 'doctor' && (!next.specialty || next.specialty.length > 120)) return { state, error: 'specialty' };
  if (!['staff', 'administrator'].includes(next.role)) return { state, error: 'role' };
  if (kind === 'patient' && (!current || next.name !== current.name || next.phone !== current.phone) && profiles.some(profile => profile.id !== next.id && canonical(profile.name) === canonical(next.name) && profile.phone === next.phone)) return { state, error: 'duplicate' };
  if (kind !== 'patient' && profiles.some(profile => profile.id !== next.id && canonical(profile.name) === canonical(next.name))) return { state, error: 'duplicate' };
  if (!next.active && current?.active && state.appointments.some(record => activeAppointment(record) && record.date >= reportDate && (kind === 'doctor' ? record.doctorId === current.id : kind === 'patient' ? record.patientId === current.id : false))) return { state, error: 'linked' };
  const needsAppointmentUpdate = kind === 'patient' ? current && (current.name !== next.name || current.phone !== next.phone) : kind === 'doctor' ? current && current.name !== next.name : false;
  const appointments = !needsAppointmentUpdate ? state.appointments : state.appointments.map(record => kind === 'patient' && record.patientId === next.id ? { ...record, patient: next.name, phone: next.phone } : kind === 'doctor' && record.doctorId === next.id ? { ...record, doctor: `Dr. ${next.name}` } : record);
  return { state: { ...state, [key]: current ? profiles.map(profile => profile.id === next.id ? next : profile) : [...profiles, next], appointments } };
}

export function synchronizeAppointments(state: DemoRecords, records: Appointment[]): DemoRecords {
  const patients = [...state.patients];
  const appointments = records.map(record => {
    let patient = patients.find(profile => profile.id === record.patientId);
    if (!patient) patient = patients.find(profile => profile.active && canonical(profile.name) === canonical(record.patient) && profile.phone === record.phone);
    if (!patient) { patient = { ...empty, id: `patient-appointment-${record.id}`, name: record.patient, phone: record.phone }; patients.push(patient); }
    const doctor = state.doctors.find(profile => profile.id === record.doctorId) ?? state.doctors.find(profile => canonical(profile.name) === canonical(record.doctor));
    return { ...record, patientId: patient.id, doctorId: doctor?.id, patient: patient.name, phone: patient.phone, doctor: doctor ? `Dr. ${doctor.name}` : record.doctor };
  });
  return { ...state, appointments, patients };
}

export function profileAppointments(state: DemoRecords, kind: ProfileKind, id: string) {
  return state.appointments.filter(record => kind === 'patient' ? record.patientId === id : kind === 'doctor' ? record.doctorId === id : record.handledBy === id || record.confirmedBy === id);
}

export function actingMember(staff: Profile[]) { return staff.find(profile => profile.id === 'Member 04' && profile.active)?.id ?? staff.find(profile => profile.active && profile.role === 'administrator')?.id ?? staff.find(profile => profile.active)?.id; }
