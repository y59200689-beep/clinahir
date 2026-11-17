export type Status = 'pending' | 'confirmed' | 'cancelled' | 'expired' | 'no-answer';
export type Appointment = { id: number; patientId?: string; doctorId?: string; patient: string; phone: string; date: string; time: string; service: string; doctor: string; status: Status; receivedAt?: string; firstActionAt?: string; handledBy?: string; confirmedBy?: string };

const today = '2026-09-29';
const firstNames = ['Luciano', 'Yasmine', 'Salma', 'Amine', 'Nadia', 'Karim', 'Meryem', 'Rachid', 'Sara', 'Omar', 'Imane', 'Youssef', 'Leila', 'Hassan', 'Fatima', 'Adam'];
const lastNames = ['Verutti', 'Bennani', 'El Idrissi', 'Alaoui', 'Mansouri', 'Tazi', 'Fassi', 'Chraibi', 'Berrada', 'Amrani', 'Lahlou', 'Khalil', 'Saidi'];
export const services = ['Ultrasound', 'MRI', 'Radiography', 'CT scan', 'Mammography'];
const frenchServices: Record<string, string> = { Ultrasound: 'Échographie', MRI: 'IRM', Radiography: 'Radiographie', 'CT scan': 'Scanner', Mammography: 'Mammographie' };
export const doctors = ['Dr. Meryem El Ghaidi', 'Dr. Karim Bennani', 'Dr. Salma Tazi', 'Dr. Amine Fassi'];
export type AppointmentDay = { date: string; count: number };

export function demoConfirmer(index: number): string {
  const slot = index % 10;
  return slot < 4 ? 'Member 01' : slot < 7 ? 'Member 02' : slot < 9 ? 'Member 03' : 'Member 04';
}

function makeAppointment(index: number, date: string, status: Status): Appointment {
  const receivedAt = `${date}T08:00:00.000Z`;
  const responseMinutes = [170, 200, 230, 260, 290][index % 5];
  return {
    id: index + 1,
    patient: `${firstNames[index % firstNames.length]} ${lastNames[Math.floor(index / firstNames.length) % lastNames.length]}`,
    phone: '0000000000',
    date,
    time: `${String(9 + index % 9).padStart(2, '0')}:00`,
    service: services[index % services.length],
    doctor: doctors[index % doctors.length],
    status,
    receivedAt,
    firstActionAt: status === 'pending' || status === 'expired' ? undefined : new Date(Date.parse(receivedAt) + responseMinutes * 60_000).toISOString(),
    handledBy: status === 'pending' || status === 'expired' ? undefined : demoConfirmer(index),
    confirmedBy: status === 'confirmed' ? demoConfirmer(index) : undefined,
  };
}

export function makeInitialAppointments(days: AppointmentDay[]): Appointment[] {
  let index = 0;
  const historical = days.flatMap(({ date, count }) => Array.from({ length: count }, () => {
    const current = index++;
    const bucket = (current * 37) % 208;
    const status: Status = bucket < 172 ? 'confirmed' : bucket === 172 ? 'pending' : bucket < 176 ? 'cancelled' : bucket < 202 ? 'expired' : 'no-answer';
    return makeAppointment(current, date, status);
  }));
  // The dashboard shows 23 upcoming appointments separately from historical activity.
  const upcoming = Array.from({ length: 23 }, (_, offset) => makeAppointment(index + offset, `2026-10-${String(offset + 1).padStart(2, '0')}`, 'confirmed'));
  return [...historical, ...upcoming];
}

