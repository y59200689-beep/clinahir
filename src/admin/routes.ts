const adminPaths = {
  Overview: '/admin/overview',
  Leads: '/admin/leads',
  Maps: '/admin/maps',
  Prospects: '/admin/prospects',
  Website: '/admin/website',
  Analytics: '/admin/analytics',
  Deliveries: '/admin/deliveries',
  Activity: '/admin/activity',
  Settings: '/admin/settings',
} as const;

export type AdminPage = keyof typeof adminPaths;

export function adminHref(page: AdminPage) {
  return adminPaths[page];
}

export function adminPageAt(pathname: string): AdminPage {
  const path = pathname.replace(/\/$/, '');
  return (Object.keys(adminPaths) as AdminPage[]).find(page => adminPaths[page] === path) ?? 'Overview';
}
