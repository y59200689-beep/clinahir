export type Message = { id: number; sender: string; receivedAt: string; subject: string; preview: string; body: string; category: 'reminder' | 'availability' | 'question'; read: boolean };


const messageSubjects = [
  ['Appointment reminder', 'Please confirm the time for my examination.', 'Hello, I would like to confirm the time of my upcoming examination. Please let me know if I need to bring any documents.'],
  ['Morning availability', 'I am available in the morning.', 'Hello, I am available in the morning for my appointment. Could you let me know which time slots are still open?'],
  ['Examination documents', 'Which documents should I bring?', 'Hello, could you tell me which documents I need to bring for my imaging appointment? Thank you.'],
  ['Change of appointment', 'I need another time for my appointment.', 'Hello, I am unable to attend at the scheduled time. Could you help me choose another available time?'],
  ['Report collection', 'When can I collect my report?', 'Hello, I would like to know when my examination report will be ready for collection.'],
  ['Preparation question', 'Is any preparation needed beforehand?', 'Hello, please let me know whether I need to prepare for my examination before arriving at the center.'],
] as const;

export const initialMessages: Message[] = Array.from({ length: 21 }, (_, index) => {
  const content = messageSubjects[index % messageSubjects.length];
  const day = 29 - Math.floor(index / 4);
  const hour = 9 + (index % 8);
  return {
    id: index + 1,
    sender: ['Youssef', 'Salma', 'Amine', 'Lina', 'Nadia', 'Karim'][index % 6],
    receivedAt: `2026-09-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${index % 2 ? '45' : '15'}:00`,
    subject: content[0],
    preview: content[1],
    body: content[2],
    category: index % 6 === 0 ? 'reminder' : index % 6 === 1 ? 'availability' : 'question',
    read: index >= 18,
  };
});

