import { demoConfirmer, makeInitialAppointments, type Appointment, type AppointmentDay } from './AppointmentsPage';

export const TEAM_MEMBERS = ['Member 01', 'Member 02', 'Member 03', 'Member 04'] as const;

const legacyDemoMembers = new Set(['reception01', 'reception02', 'babdoukkalaradiolo', 'center-admin']);

export function memberFor(item: Appointment, member: string | undefined, historicalCount: number) {
  if (item.id <= historicalCount && (!member || legacyDemoMembers.has(member))) return demoConfirmer(item.id - 1);
  return member === 'center-admin' ? 'Member 04' : member;
}

export function readDemoAppointments(days: AppointmentDay[]): Appointment[] {
  const initial = makeInitialAppointments(days);
  try {
    const saved = window.sessionStorage.getItem('kelo-demo-appointments-v2');
    const parsed: unknown = saved ? JSON.parse(saved) : null;
    if (!Array.isArray(parsed)) return initial;
    const initialById = new Map(initial.map((item) => [item.id, item]));
    return (parsed as Appointment[]).map((item) => ({ ...initialById.get(item.id), ...item }));
  } catch { return initial; }
}

export type TeamStat = { name: string; actions: number; confirmed: number; share: number; averageMinutes: number | null; lastActivityAt: string | null };

export function buildTeamStats(selected: Appointment[], historicalCount: number): TeamStat[] {
  const confirmedTotal = selected.filter((item) => item.status === 'confirmed').length;
  const byMember = new Map<string, { actions: number; confirmed: number; responseTotal: number; responseCount: number; lastActivityAt: string | null }>(
    TEAM_MEMBERS.map((name) => [name, { actions: 0, confirmed: 0, responseTotal: 0, responseCount: 0, lastActivityAt: null }] as const),
  );
  const getMember = (name: string) => {
    if (!byMember.has(name)) byMember.set(name, { actions: 0, confirmed: 0, responseTotal: 0, responseCount: 0, lastActivityAt: null });
    return byMember.get(name)!;
  };
  for (const item of selected) {
    const isDemoRecord = item.id <= historicalCount;
    const acted = Boolean(item.firstActionAt) || (isDemoRecord && item.status !== 'pending' && item.status !== 'expired');
    if (acted) {
      const handler = memberFor(item, item.handledBy, historicalCount);
      if (handler) {
        const stats = getMember(handler);
        stats.actions += 1;
        const measured = item.receivedAt && item.firstActionAt ? (Date.parse(item.firstActionAt) - Date.parse(item.receivedAt)) / 60_000 : NaN;
        const minutes = Number.isFinite(measured) && measured >= 0 ? measured : isDemoRecord ? [170, 200, 230, 260, 290][(item.id - 1) % 5] : NaN;
        if (Number.isFinite(minutes)) { stats.responseTotal += minutes; stats.responseCount += 1; }
        const activityAt = item.firstActionAt ?? `${item.date}T12:00:00`;
        if (!stats.lastActivityAt || activityAt > stats.lastActivityAt) stats.lastActivityAt = activityAt;
      }
    }
    if (item.status === 'confirmed') {
      const confirmer = memberFor(item, item.confirmedBy, historicalCount);
      if (confirmer) getMember(confirmer).confirmed += 1;
    }
  }
  return [...byMember.entries()].map(([name, stats]) => ({
    name,
    actions: stats.actions,
    confirmed: stats.confirmed,
    share: confirmedTotal ? Math.round(stats.confirmed / confirmedTotal * 100) : 0,
    averageMinutes: stats.responseCount ? Math.round(stats.responseTotal / stats.responseCount) : null,
    lastActivityAt: stats.lastActivityAt,
  })).sort((a, b) => b.confirmed - a.confirmed || b.actions - a.actions || a.name.localeCompare(b.name));
}

export function formatDuration(minutes: number | null) {
  return minutes === null ? '—' : `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
}
