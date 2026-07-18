/**
 * API client for the consultprompts Go API Gateway.
 * Replaces the old Firebase integration (auth + Firestore).
 *
 * All requests go through the Gateway (VITE_API_URL), never directly
 * to individual microservices.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UserRole = 'student' | 'b2b_client' | 'admin' | 'instructor';

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  roles: UserRole[];
  emailVerified: boolean;
  createdAt: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

// ---------------------------------------------------------------------------
// Token storage
// ---------------------------------------------------------------------------
// TODO(security): move refresh token to an httpOnly cookie once the backend
// supports cookie-based auth. localStorage is vulnerable to XSS — acceptable
// for v1, must be revisited before handling payments.

const ACCESS_TOKEN_KEY = 'cp_access_token';
const REFRESH_TOKEN_KEY = 'cp_refresh_token';
const USER_EMAIL_KEY = 'cp_user_email';

export const tokenStore = {
  getAccess: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  getEmail: () => localStorage.getItem(USER_EMAIL_KEY),
  set: (tokens: TokenPair, email?: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
    if (email) localStorage.setItem(USER_EMAIL_KEY, email);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_EMAIL_KEY);
  },
};

// ---------------------------------------------------------------------------
// Core fetch wrapper with automatic token refresh
// ---------------------------------------------------------------------------

export class APIError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retryOnAuthFail = true,
): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>),
  };

  const accessToken = tokenStore.getAccess();
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const body: APIResponse<T> = await res.json().catch(() => ({
    success: false,
    error: { code: 'PARSE_ERROR', message: 'Invalid server response' },
  }));

  // Access token expired — try one refresh, then retry the original request
  if (res.status === 401 && retryOnAuthFail && tokenStore.getRefresh()) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return request<T>(path, options, false);
    }
    tokenStore.clear();
  }

  if (!body.success) {
    throw new APIError(
      body.error?.code ?? 'UNKNOWN',
      body.error?.message ?? 'Something went wrong',
      res.status,
    );
  }

  return body.data as T;
}

// Refresh tokens are single-use/rotated server-side, so concurrent 401s must
// share one in-flight refresh instead of each firing their own — otherwise
// every caller but the first presents an already-rotated token, which trips
// the backend's reuse detection and revokes the whole session (see the
// "logged out every 15 minutes" incident: several parallel requests expiring
// together each triggered their own /auth/refresh call).
let refreshPromise: Promise<boolean> | null = null;

function tryRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

async function doRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: tokenStore.getRefresh() }),
    });
    const body: APIResponse<TokenPair> = await res.json();
    if (body.success && body.data) {
      tokenStore.set(body.data);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function register(email: string, password: string) {
  return request<{ id: string; email: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function login(email: string, password: string): Promise<UserProfile> {
  const tokens = await request<TokenPair>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  tokenStore.set(tokens, email);
  return getMe();
}

export async function logout() {
  const refreshToken = tokenStore.getRefresh();
  tokenStore.clear();
  if (refreshToken) {
    // Fire and forget — local state is already cleared
    request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    }).catch(() => {});
  }
}

export async function getMe(): Promise<UserProfile> {
  const me = await request<{
    id: string;
    roles: UserRole[];
    email: string;
    email_verified: boolean;
    created_at: string;
  }>('/auth/me');
  const email = me.email || tokenStore.getEmail() || '';
  return {
    id: me.id,
    email,
    displayName: email ? email.split('@')[0] : undefined,
    roles: me.roles ?? [],
    emailVerified: me.email_verified,
    createdAt: me.created_at,
  };
}

export async function verifyEmail(token: string) {
  return request<{ message: string }>('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

export async function resendVerification(email: string) {
  return request<{ message: string }>('/auth/verify-email/resend', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function requestPasswordReset(email: string) {
  return request<{ message: string }>('/auth/password/reset-request', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, newPassword: string) {
  return request<{ message: string }>('/auth/password/reset', {
    method: 'POST',
    body: JSON.stringify({ token, new_password: newPassword }),
  });
}

export function isAdmin(user: UserProfile | null): boolean {
  return !!user?.roles.includes('admin');
}

/** Entry point for the Google OAuth flow — a full-page navigation, not fetch. */
export function googleLoginUrl(): string {
  return `${API_URL}/auth/google/login`;
}

// ---------------------------------------------------------------------------
// Leads (agency-service)
// ---------------------------------------------------------------------------
// NOTE: these endpoints belong to the agency-service, which is not built yet.
// The Gateway will route /agency/* once it exists. Until then these calls
// will return 502 from the Gateway — the UI handles the error gracefully.

export interface Lead {
  id: string;
  /** null while an admin-invited lead is waiting to be redeemed. */
  user_id: string | null;
  name: string;
  email: string;
  business: string;
  message?: string;
  existing_website?: boolean;
  existing_website_url?: string;
  location?: string;
  site_goal?: string;
  pages_needed?: string[];
  style_direction?: string;
  has_logo?: boolean;
  logo_url?: string;
  has_brand_colors?: boolean;
  primary_color?: string;
  secondary_color?: string;
  inspiration_urls?: string[];
  phone_number?: string;
  contact_method?: string;
  timeline?: string;
  package?: string;
  wants_call: boolean;
  meeting_skipped: boolean;
  status: 'pending' | 'accepted' | 'completed' | 'launched' | 'revision' | 'suspended';
  milestone_index: number;
  mockup_url?: string;
  revision_feedback?: string;
  revision_count: number;
  wants_maintenance: boolean;
  is_paid: boolean;
  paid_at?: string;
  payment_amount?: number;
  site_url?: string;
  domain_renewal_date?: string;
  created_at: string;
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  event_type: string;
  detail?: string;
  created_at: string;
}

export interface LeadInput {
  name: string;
  email: string;
  business: string;
  message?: string;
  existing_website?: boolean;
  existing_website_url?: string;
  location?: string;
  site_goal?: string;
  pages_needed?: string[];
  style_direction?: string;
  has_logo?: boolean;
  logo_file?: File;
  has_brand_colors?: boolean;
  primary_color?: string;
  secondary_color?: string;
  inspiration_urls?: string[];
  phone_number: string;
  contact_method?: string;
  timeline?: string;
  package?: string;
  wants_call: boolean;
}

// Lead payloads go as multipart when a logo file is attached, JSON otherwise.
function buildLeadBody(lead: LeadInput): BodyInit {
  const { logo_file, pages_needed, inspiration_urls, ...scalar } = lead;

  if (logo_file) {
    const fd = new FormData();
    for (const [k, v] of Object.entries(scalar)) {
      if (v !== undefined && v !== null) fd.append(k, String(v));
    }
    pages_needed?.forEach(p => fd.append('pages_needed[]', p));
    inspiration_urls?.forEach(u => fd.append('inspiration_urls[]', u));
    fd.append('logo_file', logo_file);
    return fd;
  }

  return JSON.stringify({ ...scalar, pages_needed, inspiration_urls });
}

export async function submitLead(lead: LeadInput) {
  return request<{ id: string }>('/agency/leads', { method: 'POST', body: buildLeadBody(lead) });
}

export async function updateLeadSubmit(id: string, lead: LeadInput) {
  return request<{ ok: boolean }>(`/agency/leads/${id}`, { method: 'PATCH', body: buildLeadBody(lead) });
}

/**
 * Admin only: create an unattached lead on a client's behalf. The lead's
 * email field is the client's address — the invite (with redeem link) is
 * sent there.
 */
export async function inviteLead(lead: LeadInput) {
  return request<{ id: string; redeem_url: string }>('/agency/leads/invite', {
    method: 'POST',
    body: buildLeadBody(lead),
  });
}

/**
 * Attach an admin-invited lead to the logged-in user. Shared by the email
 * redeem link (/redeem?leadId=…) and the manual "Redeem Project" form.
 * Errors: INVALID_ID (404), ALREADY_REDEEMED (409).
 */
export async function redeemLead(leadId: string): Promise<Lead> {
  return request<Lead>('/agency/leads/redeem', {
    method: 'POST',
    body: JSON.stringify({ lead_id: leadId }),
  });
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface LeadsPage {
  leads: Lead[];
  pagination: Pagination;
}

export async function getMyLeads(): Promise<Lead[]> {
  const data = await request<Lead[]>('/agency/leads/mine');
  return data ?? [];
}

export async function getLeads(page = 1, limit = 20): Promise<LeadsPage> {
  return request<LeadsPage>(`/agency/leads?page=${page}&limit=${limit}`);
}

export async function updateLeadMilestone(leadId: string, milestoneIndex: number) {
  return request<{ message: string }>(`/agency/leads/${leadId}/milestone`, {
    method: 'PATCH',
    body: JSON.stringify({ milestone_index: milestoneIndex }),
  });
}

export async function setMockupURL(leadId: string, mockupUrl: string) {
  return request<{ message: string }>(`/agency/leads/${leadId}/mockup`, {
    method: 'PATCH',
    body: JSON.stringify({ mockup_url: mockupUrl }),
  });
}

export async function submitReview(leadId: string, decision: 'accept' | 'request_changes', feedback?: string) {
  return request<{ message: string }>(`/agency/leads/${leadId}/review`, {
    method: 'POST',
    body: JSON.stringify({ decision, feedback: feedback ?? '' }),
  });
}

export async function completeSite(leadId: string) {
  return request<{ message: string }>(`/agency/leads/${leadId}/complete`, {
    method: 'PATCH',
  });
}

export async function setWantsMaintenance(leadId: string, wantsMaintenance: boolean) {
  return request<{ message: string }>(`/agency/leads/${leadId}/maintenance`, {
    method: 'PATCH',
    body: JSON.stringify({ wants_maintenance: wantsMaintenance }),
  });
}

export async function markPaid(leadId: string) {
  return request<{ message: string }>(`/agency/leads/${leadId}/pay`, { method: 'POST' });
}

export async function launchSite(leadId: string, siteUrl: string) {
  return request<{ message: string }>(`/agency/leads/${leadId}/launch`, {
    method: 'PATCH',
    body: JSON.stringify({ site_url: siteUrl }),
  });
}

export async function requestMeeting(leadId: string) {
  return request<{ message: string }>(`/agency/leads/${leadId}/request-meeting`, { method: 'POST' });
}

export async function getLeadActivity(leadId: string): Promise<LeadActivity[]> {
  const data = await request<LeadActivity[]>(`/agency/leads/${leadId}/activity`);
  return data ?? [];
}

export async function setLeadSuspended(leadId: string, suspended: boolean) {
  return request<{ message: string; status: Lead['status'] }>(`/agency/leads/${leadId}/suspend`, {
    method: 'PATCH',
    body: JSON.stringify({ suspended }),
  });
}

// ---------------------------------------------------------------------------
// Ebooks waitlist (products-service)
// ---------------------------------------------------------------------------
// NOTE: belongs to the future digital-products service. Same 502 caveat.

export async function joinWaitlist() {
  return request<{ message: string }>('/products/waitlist', { method: 'POST' });
}

export async function checkWaitlistStatus(): Promise<boolean> {
  try {
    const res = await request<{ joined: boolean }>('/products/waitlist/status');
    return res.joined;
  } catch {
    return false;
  }
}

export async function getEnrollmentCount(): Promise<number | null> {
  try {
    const res = await request<{ count: number }>('/products/waitlist/count');
    return res.count;
  } catch {
    return null;
  }
}
