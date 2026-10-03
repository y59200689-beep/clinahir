export type FormType = 'demo' | 'contact' | 'consultation' | 'booking';
export interface Attribution { landingPage: string; utmSource?: string; utmMedium?: string; utmCampaign?: string }
export interface LeadInput extends Attribution {
  submissionId: string; companyName: string; email: string; city: string;
  phone?: string; contactName?: string; message?: string; role: string; priority: string; formType: FormType;
}
export interface LeadPayload extends Attribution {
  externalId: string; companyName: string; email: string; city: string; phone?: string;
  contactName?: string; message?: string; formType: FormType; submittedAt: string;
}
