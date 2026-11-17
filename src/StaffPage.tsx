import ProfileDirectory from './demo/ProfileDirectory';
import type { ReactNode } from 'react';
import type { AppointmentDay } from './demo/appointments';
export default function StaffPage({language,rangeStart,rangeEnd,dateControl,onViewActivity}:{language:'en'|'fr';appointmentDays:AppointmentDay[];rangeStart:string;rangeEnd:string;dateControl:ReactNode;onViewActivity:()=>void}) { return <ProfileDirectory kind="staff" language={language} rangeStart={rangeStart} rangeEnd={rangeEnd} dateControl={dateControl} onViewActivity={onViewActivity}/>; }
