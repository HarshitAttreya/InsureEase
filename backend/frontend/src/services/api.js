let rawBase = (import.meta.env.VITE_API_URL || '/api').trim();
if (rawBase.endsWith('/')) {
  rawBase = rawBase.slice(0, -1);
}
const API_BASE = (rawBase.startsWith('http') && !rawBase.endsWith('/api')) ? `${rawBase}/api` : rawBase;

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errText = await res.text();
      let errMsg = `Request failed: ${res.status} ${res.statusText}`;
      try {
        const jsonErr = JSON.parse(errText);
        errMsg = jsonErr.message || errMsg;
      } catch {
        if (errText) errMsg = errText;
      }
      throw new Error(errMsg);
    }
    if (res.status === 204) return null;
    return await res.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  // Dashboard
  getDashboardSummary: () => request('/dashboard/summary'),

  // Organizations
  getOrganizations: (search) => request(`/organizations${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  createOrganization: (data) => request('/organizations', { method: 'POST', body: JSON.stringify(data) }),

  // Policies
  getPolicies: (status, productType) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (productType) params.append('productType', productType);
    const qs = params.toString();
    return request(`/policies${qs ? `?${qs}` : ''}`);
  },
  getPolicyById: (id) => request(`/policies/${id}`),
  createPolicy: (data) => request('/policies', { method: 'POST', body: JSON.stringify(data) }),
  updatePolicy: (id, data) => request(`/policies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getCensusMembers: (policyId) => request(`/policies/${policyId}/census`),
  addCensusMember: (policyId, data) => request(`/policies/${policyId}/census`, { method: 'POST', body: JSON.stringify(data) }),

  // Underwriting
  getUnderwritingAssessments: () => request('/underwriting'),
  getUnderwritingByPolicy: (policyId) => request(`/underwriting/policy/${policyId}`),
  evaluateRisk: (policyId) => request(`/underwriting/policy/${policyId}/evaluate`, { method: 'POST' }),
  submitUnderwritingDecision: (data) => request('/underwriting/decision', { method: 'POST', body: JSON.stringify(data) }),

  // Renewals
  getRenewals: () => request('/renewals'),
  getEligibleRenewals: () => request('/renewals/eligible-policies'),
  getRenewalByPolicy: (policyId) => request(`/renewals/policy/${policyId}`),
  generateRenewalQuote: (policyId, data) => request(`/renewals/policy/${policyId}/generate`, { method: 'POST', body: JSON.stringify(data || {}) }),
  updateRenewalQuote: (quoteId, data) => request(`/renewals/${quoteId}`, { method: 'PUT', body: JSON.stringify(data) }),
  bindRenewal: (quoteId) => request(`/renewals/${quoteId}/bind`, { method: 'POST' }),

  // Claims
  getClaims: (status) => request(`/claims${status ? `?status=${status}` : ''}`),
  getClaimById: (id) => request(`/claims/${id}`),
  getClaimsByPolicy: (policyId) => request(`/claims/policy/${policyId}`),
  intakeClaim: (data) => request('/claims/intake', { method: 'POST', body: JSON.stringify(data) }),
  adjudicateClaim: (id, data) => request(`/claims/${id}/adjudicate`, { method: 'POST', body: JSON.stringify(data) }),

  // Billing
  getInvoices: (status) => request(`/billing/invoices${status ? `?status=${status}` : ''}`),
  getInvoicesByPolicy: (policyId) => request(`/billing/policy/${policyId}`),
  createInvoice: (data) => request('/billing/invoices', { method: 'POST', body: JSON.stringify(data) }),
  recordPayment: (id, data) => request(`/billing/invoices/${id}/payment`, { method: 'POST', body: JSON.stringify(data) }),

  // Seed / Reset
  resetDemoData: () => request('/seed/reset', { method: 'POST' }),
};
