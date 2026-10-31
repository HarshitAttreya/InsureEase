import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Users, 
  FileText, 
  Building2, 
  Calendar, 
  DollarSign, 
  Percent, 
  X, 
  Check, 
  AlertCircle,
  UserPlus
} from 'lucide-react';

export default function PoliciesView({ 
  policies, 
  organizations, 
  onRefresh, 
  onCreatePolicy, 
  onAddMember, 
  onFetchCensus,
  showToast 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProduct, setFilterProduct] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCensusModalOpen, setIsCensusModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  
  // Selected policy for census
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [censusMembers, setCensusMembers] = useState([]);
  const [isLoadingCensus, setIsLoadingCensus] = useState(false);

  // New Policy Form State
  const [newPolicyData, setNewPolicyData] = useState({
    organizationId: '',
    productType: 'GROUP_HEALTH',
    planTier: 'SILVER',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    coveragePerMember: 300000,
    deductibleAmount: 500,
    copayPercentage: 10,
    baseAnnualPremium: 120000,
    billingFrequency: 'QUARTERLY',
    underwritingNotes: '',
  });

  // New Member Form State
  const [newMemberData, setNewMemberData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '1990-05-15',
    gender: 'M',
    relationship: 'EMPLOYEE',
    coverageTier: 'INDIVIDUAL',
    salary: 85000,
    preExistingCondition: false,
  });

  // Filtered policies
  const filteredPolicies = policies.filter((p) => {
    const matchesSearch = 
      p.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.organization?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProduct = filterProduct === 'ALL' || p.productType === filterProduct;
    const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;
    return matchesSearch && matchesProduct && matchesStatus;
  });

  const handleOpenCensus = async (policy) => {
    setSelectedPolicy(policy);
    setIsCensusModalOpen(true);
    setIsLoadingCensus(true);
    try {
      const members = await onFetchCensus(policy.id);
      setCensusMembers(members || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsLoadingCensus(false);
    }
  };

  const handleOpenAddMember = (policy) => {
    setSelectedPolicy(policy);
    setIsAddMemberModalOpen(true);
  };

  const handleSubmitPolicy = async (e) => {
    e.preventDefault();
    if (!newPolicyData.organizationId) {
      showToast('Please select a client organization', 'error');
      return;
    }
    try {
      await onCreatePolicy({
        ...newPolicyData,
        organizationId: Number(newPolicyData.organizationId),
      });
      setIsCreateModalOpen(false);
      showToast('Group policy created and queued for underwriting!', 'success');
      onRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSubmitMember = async (e) => {
    e.preventDefault();
    if (!newMemberData.firstName || !newMemberData.lastName) {
      showToast('First and last name are required', 'error');
      return;
    }
    try {
      await onAddMember(selectedPolicy.id, newMemberData);
      showToast(`Member enrolled to policy ${selectedPolicy.policyNumber}!`, 'success');
      setIsAddMemberModalOpen(false);
      // Refresh census if modal is open
      if (isCensusModalOpen) {
        const updated = await onFetchCensus(selectedPolicy.id);
        setCensusMembers(updated);
      }
      onRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const formatCurrency = (val) => {
    if (val == null) return '$0';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Group Policies & Census Administration</h2>
          <p className="text-xs text-slate-500">
            Manage corporate insurance lines, benefit tiers, premium schedules, and covered member rosters.
          </p>
        </div>
        <button
          onClick={() => {
            if (organizations.length > 0) {
              setNewPolicyData((prev) => ({ ...prev, organizationId: organizations[0].id }));
            }
            setIsCreateModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Group Policy</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by policy number or client organization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterProduct}
            onChange={(e) => setFilterProduct(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Products</option>
            <option value="GROUP_HEALTH">Group Health</option>
            <option value="GROUP_LIFE">Group Term Life</option>
            <option value="GROUP_ACCIDENT">Group Accident</option>
            <option value="GROUP_DENTAL">Group Dental</option>
            <option value="GROUP_DISABILITY">Group Disability</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="UNDERWRITING">Underwriting</option>
            <option value="RENEWAL_DUE">Renewal Due</option>
            <option value="TERMINATED">Terminated</option>
          </select>
        </div>
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredPolicies.map((p) => {
          const statusColors = {
            ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            UNDERWRITING: 'bg-amber-50 text-amber-700 border-amber-200',
            RENEWAL_DUE: 'bg-rose-50 text-rose-700 border-rose-200',
            TERMINATED: 'bg-slate-100 text-slate-600 border-slate-200',
          };

          const tierColors = {
            PLATINUM: 'bg-purple-100 text-purple-700 border-purple-300',
            GOLD: 'bg-amber-100 text-amber-800 border-amber-300',
            SILVER: 'bg-slate-100 text-slate-700 border-slate-300',
            BASIC: 'bg-blue-100 text-blue-700 border-blue-300',
          };

          return (
            <div 
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-indigo-700 tracking-tight">{p.policyNumber}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tierColors[p.planTier] || 'bg-slate-100 text-slate-700'}`}>
                        {p.planTier}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span>{p.organization?.name}</span>
                    </h3>
                    <p className="text-xs text-slate-500">{p.organization?.industry}</p>
                  </div>

                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusColors[p.status] || 'bg-slate-100 text-slate-700'}`}>
                    {p.status?.replace('_', ' ')}
                  </span>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Product Line</span>
                    <span className="font-semibold text-slate-800 capitalize">
                      {p.productType?.replace('GROUP_', '').toLowerCase()} Insurance
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">Policy Term</span>
                    <span className="font-semibold text-slate-800">
                      {p.startDate} to {p.endDate}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">Coverage Per Member</span>
                    <span className="font-bold text-slate-900">{formatCurrency(p.coveragePerMember)}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">Deductible / Copay</span>
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(p.deductibleAmount)} ({p.copayPercentage}%)
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">Contracted Premium</span>
                    <span className="font-bold text-emerald-600">{formatCurrency(p.baseAnnualPremium)} / {p.billingFrequency?.toLowerCase()}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">Loss Ratio Experience</span>
                    <span className={`font-black ${p.lossRatio > 70 ? 'text-rose-600' : 'text-slate-800'}`}>
                      {p.lossRatio != null ? `${p.lossRatio.toFixed(1)}%` : '0.0%'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Census Bar & Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span><strong>{p.enrolledMembersCount || 0}</strong> Lives Covered</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenAddMember(p)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Enroll Member</span>
                  </button>

                  <button
                    onClick={() => handleOpenCensus(p)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                  >
                    <span>View Census</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE NEW POLICY MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Originate New Group Policy</h3>
                <p className="text-xs text-slate-500">Configure corporate underwriting terms and benefit plan structure</p>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPolicy} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Client Organization *</label>
                <select
                  value={newPolicyData.organizationId}
                  onChange={(e) => setNewPolicyData({ ...newPolicyData, organizationId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select Organization...</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name} ({org.industry}) - Risk Factor: {org.industryRiskFactor}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Product Type</label>
                  <select
                    value={newPolicyData.productType}
                    onChange={(e) => setNewPolicyData({ ...newPolicyData, productType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="GROUP_HEALTH">Group Health Insurance</option>
                    <option value="GROUP_LIFE">Group Term Life</option>
                    <option value="GROUP_ACCIDENT">Group Personal Accident</option>
                    <option value="GROUP_DENTAL">Group Dental & Optical</option>
                    <option value="GROUP_DISABILITY">Group Disability Income</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Plan Tier</label>
                  <select
                    value={newPolicyData.planTier}
                    onChange={(e) => setNewPolicyData({ ...newPolicyData, planTier: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="BASIC">Basic</option>
                    <option value="SILVER">Silver</option>
                    <option value="GOLD">Gold</option>
                    <option value="PLATINUM">Platinum</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Effective Date</label>
                  <input
                    type="date"
                    value={newPolicyData.startDate}
                    onChange={(e) => setNewPolicyData({ ...newPolicyData, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={newPolicyData.endDate}
                    onChange={(e) => setNewPolicyData({ ...newPolicyData, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Benefit Limit ($)</label>
                  <input
                    type="number"
                    value={newPolicyData.coveragePerMember}
                    onChange={(e) => setNewPolicyData({ ...newPolicyData, coveragePerMember: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Deductible ($)</label>
                  <input
                    type="number"
                    value={newPolicyData.deductibleAmount}
                    onChange={(e) => setNewPolicyData({ ...newPolicyData, deductibleAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Co-Pay (%)</label>
                  <input
                    type="number"
                    value={newPolicyData.copayPercentage}
                    onChange={(e) => setNewPolicyData({ ...newPolicyData, copayPercentage: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Contract Premium ($)</label>
                  <input
                    type="number"
                    value={newPolicyData.baseAnnualPremium}
                    onChange={(e) => setNewPolicyData({ ...newPolicyData, baseAnnualPremium: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Frequency</label>
                  <select
                    value={newPolicyData.billingFrequency}
                    onChange={(e) => setNewPolicyData({ ...newPolicyData, billingFrequency: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="ANNUAL">Annual</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Underwriting Brief Notes</label>
                <textarea
                  rows="2"
                  value={newPolicyData.underwritingNotes}
                  onChange={(e) => setNewPolicyData({ ...newPolicyData, underwritingNotes: e.target.value })}
                  placeholder="Notes on employee group demographics, riders, or risk considerations..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md shadow-indigo-600/30"
                >
                  Create Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CENSUS MEMBERS MODAL */}
      {isCensusModalOpen && selectedPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>Enrolled Census Members:</span>
                  <span className="text-indigo-600">{selectedPolicy.policyNumber}</span>
                </h3>
                <p className="text-xs text-slate-500">{selectedPolicy.organization?.name} - {censusMembers.length} active lives enrolled</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsCensusModalOpen(false);
                    handleOpenAddMember(selectedPolicy);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Enroll New Member</span>
                </button>
                <button 
                  onClick={() => setIsCensusModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto mt-4">
              {isLoadingCensus ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : censusMembers.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  No census members currently registered for this policy.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                      <th className="py-2.5 px-3">Member Code</th>
                      <th className="py-2.5 px-3">Full Name</th>
                      <th className="py-2.5 px-3">Relationship</th>
                      <th className="py-2.5 px-3">Coverage Tier</th>
                      <th className="py-2.5 px-3">DOB / Age</th>
                      <th className="py-2.5 px-3">Pre-Existing?</th>
                      <th className="py-2.5 px-3">Effective</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {censusMembers.map((m) => {
                      const age = m.dateOfBirth ? Math.floor((new Date() - new Date(m.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : '-';
                      return (
                        <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{m.memberCode}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">
                            <div>{m.firstName} {m.lastName}</div>
                            <div className="text-[11px] text-slate-400 font-normal">{m.email}</div>
                          </td>
                          <td className="py-2.5 px-3 font-medium capitalize">{m.relationship?.toLowerCase()}</td>
                          <td className="py-2.5 px-3 font-medium capitalize">{m.coverageTier?.toLowerCase()}</td>
                          <td className="py-2.5 px-3 text-slate-600">{m.dateOfBirth} ({age} yrs)</td>
                          <td className="py-2.5 px-3">
                            {m.preExistingCondition ? (
                              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px]">Yes</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold text-[10px]">No</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{m.effectiveDate}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                              {m.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD MEMBER MODAL */}
      {isAddMemberModalOpen && selectedPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Enroll Employee to Census</h3>
                <p className="text-xs text-slate-500">Attach life/member to {selectedPolicy.policyNumber}</p>
              </div>
              <button 
                onClick={() => setIsAddMemberModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitMember} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={newMemberData.firstName}
                    onChange={(e) => setNewMemberData({ ...newMemberData, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={newMemberData.lastName}
                    onChange={(e) => setNewMemberData({ ...newMemberData, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Email</label>
                <input
                  type="email"
                  value={newMemberData.email}
                  onChange={(e) => setNewMemberData({ ...newMemberData, email: e.target.value })}
                  placeholder="employee@company.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    value={newMemberData.dateOfBirth}
                    onChange={(e) => setNewMemberData({ ...newMemberData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={newMemberData.gender}
                    onChange={(e) => setNewMemberData({ ...newMemberData, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship</label>
                  <select
                    value={newMemberData.relationship}
                    onChange={(e) => setNewMemberData({ ...newMemberData, relationship: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="EMPLOYEE">Employee (Primary)</option>
                    <option value="SPOUSE">Spouse</option>
                    <option value="CHILD">Child / Dependent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Coverage Tier</label>
                  <select
                    value={newMemberData.coverageTier}
                    onChange={(e) => setNewMemberData({ ...newMemberData, coverageTier: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="INDIVIDUAL">Individual</option>
                    <option value="COUPLE">Couple</option>
                    <option value="FAMILY">Family</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Salary ($ / yr)</label>
                  <input
                    type="number"
                    value={newMemberData.salary}
                    onChange={(e) => setNewMemberData({ ...newMemberData, salary: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newMemberData.preExistingCondition}
                      onChange={(e) => setNewMemberData({ ...newMemberData, preExistingCondition: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-semibold text-slate-700">Pre-existing Medical Condition</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md shadow-indigo-600/30"
                >
                  Enroll Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
