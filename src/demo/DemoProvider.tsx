import { createContext, useContext, useMemo, useReducer, useState, useCallback, type Dispatch, type SetStateAction, type ReactNode } from 'react';
import { initialMessages, type Message } from './messages';
import { type Appointment, type AppointmentDay } from './appointments';
import { createDemoRecords, saveProfile, synchronizeAppointments, type DemoRecords, type ProfileKind, type ProfileInput } from './profiles';

type Action = { type: 'appointments'; update: SetStateAction<Appointment[]> } | { type: 'profile'; kind: ProfileKind; input: ProfileInput; id: string };
function reducer(state: DemoRecords, action: Action): DemoRecords {
  return action.type === 'appointments' ? synchronizeAppointments(state, typeof action.update === 'function' ? action.update(state.appointments) : action.update) : saveProfile(state, action.kind, action.input, action.id).state;
}
type DemoState = DemoRecords & { messages: Message[]; setMessages: Dispatch<SetStateAction<Message[]>>; setAppointments: Dispatch<SetStateAction<Appointment[]>>; updateProfile: (kind: ProfileKind, input: ProfileInput) => void };
const Context = createContext<DemoState | null>(null);
// Entirely local, synthetic and reset on reload. This context never calls business APIs.
export function DemoProvider({ days, children }: { days: AppointmentDay[]; children: ReactNode }) {
  const [records, dispatch] = useReducer(reducer, days, createDemoRecords);
  const [messages, setMessages] = useState(initialMessages);
  const setAppointments = useCallback<Dispatch<SetStateAction<Appointment[]>>>(update => dispatch({ type: 'appointments', update }), []);
  const updateProfile = useCallback((kind: ProfileKind, input: ProfileInput) => dispatch({ type: 'profile', kind, input, id: `demo-${crypto.randomUUID()}` }), []);
  const value = useMemo(() => ({ ...records, messages, setMessages, setAppointments, updateProfile }), [records, messages, setAppointments, updateProfile]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useDemo() { const state = useContext(Context); if (!state) throw new Error('Demo screens must be inside DemoProvider'); return state; }
