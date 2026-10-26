export interface Lead {
    external_id: string;
    company_name: string;
    contact_name: string | null;
    email: string | null;
    phone: string | null;
    city: string;
    message: string;
    role: string;
    priority: string;
    form_type: string;
    landing_page: string;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    submitted_at: string;
    daily_command_status: string;
    daily_command_attempts: number;
    daily_command_last_error: string | null;
    admin_stage: string;
    admin_notes: string;
}
export interface Snapshot {
    leads: Lead[];
    total: number;
    summary: {
        total: number;
        new: number;
        qualified: number;
        won: number;
        attention: number;
    };
    analytics: {
        day: string;
        page_views: number;
        demo_cta_clicks: number;
        demo_submissions: number;
    }[];
    sources: {
        source: string;
        count: number;
    }[];
    health: {
        channel: string;
        status: string;
        count: number;
    }[];
    heartbeat: string | null;
    whatsapp: {
        external_id: string;
        status: string;
        attempts: number;
        last_error: string | null;
        provider_message_id: string | null;
        updated_at: string;
    }[];
    audit: {
        id: number;
        action: string;
        target: string;
        created_at: string;
    }[];
    integrations: {
        dailyCommand: boolean;
        whatsappEnabled: boolean;
        whatsappConfigured: boolean;
        cron: boolean;
    };
}
export interface Prospect {
    id: string;
    center_name: string;
    city: string;
    address: string | null;
    category: string | null;
    phone: string | null;
    email: string | null;
    listing_url: string | null;
    website_url: string | null;
    rating: number | null;
    review_count: number | null;
    instagram_url: string | null;
    facebook_url: string | null;
    tiktok_url: string | null;
    online_booking_available: boolean | null;
    main_gap: string | null;
    gap_evidence: string | null;
    source_name: string;
    source_url: string;
    qualification_stage: 'review' | 'qualified' | 'not_a_fit' | 'do_not_contact';
    whatsapp_opt_in_at: string | null;
    whatsapp_opt_in_evidence: string | null;
    notes: string;
    created_at: string;
    updated_at: string;
}
export interface ProspectSnapshot {
    prospects: Prospect[];
    total: number;
    cities: string[];
    counts: { total: number; review: number; qualified: number; opted_in: number; no_website: number };
}
export const emptySnapshot: Snapshot = { leads: [], total: 0, summary: { total: 0, new: 0, qualified: 0, won: 0, attention: 0 }, analytics: [], sources: [], health: [], heartbeat: null, whatsapp: [], audit: [], integrations: { dailyCommand: false, whatsappEnabled: false, whatsappConfigured: false, cron: false } };
export async function adminApi<T>(action: string, body?: object, query = ''): Promise<T> { const response = await fetch(`/api/admin?action=${action}${query}`, { method: body ? 'POST' : 'GET', headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined, credentials: 'same-origin', cache: 'no-store' }); const result = await response.json(); if (!response.ok) {
    const error = new Error(result.error ?? 'Please try again.') as Error & {
        status: number;
    };
    error.status = response.status;
    throw error;
} return result as T; }
