import React, { useState } from 'react';
import { 
  Stethoscope, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Plus, 
  DollarSign, 
  Building2, 
  User, 
  Calendar,
  X,
  FileText
} from 'lucide-react';

export default function ClaimsView({ 
  claims, 
  policies, 
  onIntakeClaim, 
  onAdjudicateClaim, 
  onFetchCensus, 
  onRefresh, 
  showToast 
}) {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [isAdjudicateModalOpen, setIsAdjudicateModalOpen] = useState(false);
  
  // Selected Claim for Adjudication
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [adjudicationData, setAdjudicationData] = useState({
    status: 'APPROVED',
    approvedAmount: 0,
    deductibleApplied: 0,
    copayApplied: 0,
    adjudicationNotes: '',
    rejectionReason: '',
    paymentReference: '',
  });

  // Intake Form State
  const [intakeData, setIntakeData] = useState({
    policyId: '',
    memberId: '',
    claimType: 'HOSPITALIZATION',
    incidentDate: new Date().toISOString().split('T')[0],
    claimedAmount: 5000,
    healthcareProvider: '',
    diagnosis: '',
  });
  const [policyMembers, setPolicyMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered claims
  const filteredClaims = claims.filter((c) => {
    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
    const matchesSearch = 
      c.claimNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.member?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.member?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.healthcareProvider?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleOpenIntake = () => {
    if (policies.length > 0) {
      const firstPolicy = policies[0];
      setIntakeData((prev) => ({ ...prev, policyId: firstPolicy.id }));
      loadMembersForPolicy(firstPolicy.id);
    }
    setIsIntakeModalOpen(true);
  };

  const handlePolicyChange = (policyId) => {
    setIntakeData((prev) => ({ ...prev, policyId, memberId: '' }));
    loadMembersForPolicy(policyId);
  };

  const loadMembersForPolicy = async (policyId) => {
    setIsLoadingMembers(true);
    try {
      const members = await onFetchCensus(policyId);
      setPolicyMembers(members || []);
      if (members && members.length > 0) {
        setIntakeData((prev) => ({ ...prev, memberId: members[0].id }));
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleOpenAdjudicate = (claim) => {
    setSelectedClaim(claim);
    setAdjudicationData({
      status: claim.status === 'SUBMITTED' || claim.status === 'UNDER_REVIEW' ? 'APPROVED' : claim.status,
      approvedAmount: claim.approvedAmount != null ? claim.approvedAmount : claim.claimedAmount,
      deductibleApplied: claim.deductibleApplied || 0,
      copayApplied: claim.copayApplied || 0,
      adjudicationNotes: claim.adjudicationNotes || 'Claim audited against group policy terms and approved for settlement.',
      rejectionReason: claim.rejectionReason || '',
      paymentReference: claim.paymentReference || `PAY-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    });
    setIsAdjudicateModalOpen(true);
  };

  const handleSubmitIntake = async (e) => {
    e.preventDefault();
    if (!intakeData.policyId || !intakeData.memberId) {
      showToast('Please select policy and enrolled member', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await onIntakeClaim({
        ...intakeData,
        policyId: Number(intakeData.policyId),
        memberId: Number(intakeData.memberId),
        claimedAmount: Number(intakeData.claimedAmount),
      });
      showToast('Insurance claim successfully registered for adjudication!', 'success');
      setIsIntakeModalOpen(false);
      onRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAdjudication = async (e) => {
    e.preventDefault();
    if (!selectedClaim) return;
    setIsSubmitting(true);
    try {
      await onAdjudicateClaim(selectedClaim.id, {
        ...adjudicationData,
        approvedAmount: Number(adjudicationData.approvedAmount),
        deductibleApplied: Number(adjudicationData.deductibleApplied),
        copayApplied: Number(adjudicationData.copayApplied),
      });
      showToast(`Claim ${selectedClaim.claimNumber} adjudicated as ${adjudicationData.status}!`, 'success');
      setIsAdjudicateModalOpen(false);
      onRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (val) => {
    if (val == null) return '$0';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Group Claims Intake & Adjudication</h2>
          <p className="text-xs text-slate-500">
            Process healthcare provider claims, verify census member eligibility, and calculate settlement benefits.
          </p>
        </div>
        <button
          onClick={handleOpenIntake}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Intake New Claim</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by claim #, covered member, diagnosis, or hospital provider..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
        >
          <option value="ALL">All Claim Statuses</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="APPROVED">Approved</option>
          <option value="SETTLED">Settled</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Claims Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3">Claim ID</th>
                <th className="py-2.5 px-3">Covered Member</th>
                <th className="py-2.5 px-3">Group Policy</th>
                <th className="py-2.5 px-3">Claim Type</th>
                <th className="py-2.5 px-3">Incident Date</th>
                <th className="py-2.5 px-3">Provider / Hospital</th>
                <th className="py-2.5 px-3">Claimed</th>
                <th className="py-2.5 px-3">Approved</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClaims.map((c) => {
                const statusColors = {
                  SUBMITTED: 'bg-blue-50 text-blue-700 border-blue-200',
                  UNDER_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
                  APPROVED: 'bg-teal-50 text-teal-700 border-teal-200',
                  SETTLED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
                };

                return (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-indigo-700">{c.claimNumber}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800">{c.member?.firstName} {c.member?.lastName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{c.member?.memberCode}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{c.policy?.policyNumber}</div>
                      <div className="text-[10px] text-slate-500">{c.policy?.organization?.name}</div>
                    </td>
                    <td className="py-3 px-3 font-medium capitalize">{c.claimType?.toLowerCase()}</td>
                    <td className="py-3 px-3 text-slate-600">{c.incidentDate}</td>
                    <td className="py-3 px-3 text-slate-700 max-w-[180px] truncate" title={c.healthcareProvider}>
                      {c.healthcareProvider || 'Hospital / Clinic'}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">{formatCurrency(c.claimedAmount)}</td>
                    <td className="py-3 px-3 font-black text-emerald-600">
                      {c.status === 'REJECTED' ? '$0' : formatCurrency(c.approvedAmount)}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[c.status] || 'bg-slate-100'}`}>
                        {c.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleOpenAdjudicate(c)}
                        className="px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                      >
                        Adjudicate
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* INTAKE NEW CLAIM MODAL */}
      {isIntakeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Intake Insurance Claim</h3>
                <p className="text-xs text-slate-500">Submit employee hospitalization or medical claim against group policy</p>
              </div>
              <button 
                onClick={() => setIsIntakeModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitIntake} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Group Policy *</label>
                <select
                  value={intakeData.policyId}
                  onChange={(e) => handlePolicyChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  required
                >
                  {policies.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.policyNumber} - {p.organization?.name} ({p.productType?.replace('GROUP_', '')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Covered Census Member *</label>
                {isLoadingMembers ? (
                  <div className="text-xs text-slate-400 py-2">Loading enrolled members...</div>
                ) : (
                  <select
                    value={intakeData.memberId}
                    onChange={(e) => setIntakeData({ ...intakeData, memberId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                    required
                  >
                    <option value="">Select Member...</option>
                    {policyMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.firstName} {m.lastName} ({m.memberCode} - {m.relationship})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Claim Type</label>
                  <select
                    value={intakeData.claimType}
                    onChange={(e) => setIntakeData({ ...intakeData, claimType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="HOSPITALIZATION">Hospitalization</option>
                    <option value="SURGERY">Inpatient Surgery</option>
                    <option value="ACCIDENT">Accident & Emergency</option>
                    <option value="OUTPATIENT">Outpatient Care</option>
                    <option value="DENTAL">Dental Treatment</option>
                    <option value="DEATH">Life / Death Claim</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Incident Date *</label>
                  <input
                    type="date"
                    value={intakeData.incidentDate}
                    onChange={(e) => setIntakeData({ ...intakeData, incidentDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Claimed Amount ($) *</label>
                  <input
                    type="number"
                    value={intakeData.claimedAmount}
                    onChange={(e) => setIntakeData({ ...intakeData, claimedAmount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Healthcare Provider / Hospital</label>
                  <input
                    type="text"
                    value={intakeData.healthcareProvider}
                    onChange={(e) => setIntakeData({ ...intakeData, healthcareProvider: e.target.value })}
                    placeholder="e.g. Memorial Medical Center"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Diagnosis / Incident Details</label>
                <textarea
                  rows="2"
                  value={intakeData.diagnosis}
                  onChange={(e) => setIntakeData({ ...intakeData, diagnosis: e.target.value })}
                  placeholder="Clinical diagnosis description..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  required
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsIntakeModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md shadow-emerald-600/30 disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : 'Register Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADJUDICATE CLAIM WORKBENCH MODAL */}
      {isAdjudicateModalOpen && selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Claim Adjudication Workbench</h3>
                <p className="text-xs text-slate-500">{selectedClaim.claimNumber} - {selectedClaim.member?.firstName} {selectedClaim.member?.lastName}</p>
              </div>
              <button 
                onClick={() => setIsAdjudicateModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAdjudication} className="mt-4 space-y-4">
              {/* Summary box */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Healthcare Facility:</span>
                  <span className="font-semibold text-slate-800">{selectedClaim.healthcareProvider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Diagnosis:</span>
                  <span className="font-semibold text-slate-800">{selectedClaim.diagnosis}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Billed Claim:</span>
                  <span className="font-black text-slate-900">{formatCurrency(selectedClaim.claimedAmount)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Adjudication Decision</label>
                  <select
                    value={adjudicationData.status}
                    onChange={(e) => setAdjudicationData({ ...adjudicationData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold"
                  >
                    <option value="APPROVED">APPROVED</option>
                    <option value="SETTLED">SETTLED (Paid Out)</option>
                    <option value="UNDER_REVIEW">UNDER REVIEW</option>
                    <option value="REJECTED">REJECTED (Declined)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Net Settlement Amount ($)</label>
                  <input
                    type="number"
                    value={adjudicationData.approvedAmount}
                    onChange={(e) => setAdjudicationData({ ...adjudicationData, approvedAmount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-black text-emerald-600"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Deductible Applied ($)</label>
                  <input
                    type="number"
                    value={adjudicationData.deductibleApplied}
                    onChange={(e) => setAdjudicationData({ ...adjudicationData, deductibleApplied: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Co-Pay Applied ($)</label>
                  <input
                    type="number"
                    value={adjudicationData.copayApplied}
                    onChange={(e) => setAdjudicationData({ ...adjudicationData, copayApplied: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Adjudicator Clinical Notes</label>
                <textarea
                  rows="2"
                  value={adjudicationData.adjudicationNotes}
                  onChange={(e) => setAdjudicationData({ ...adjudicationData, adjudicationNotes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                ></textarea>
              </div>

              {adjudicationData.status === 'REJECTED' && (
                <div>
                  <label className="block text-xs font-semibold text-rose-700 mb-1">Formal Rejection Reason</label>
                  <input
                    type="text"
                    value={adjudicationData.rejectionReason}
                    onChange={(e) => setAdjudicationData({ ...adjudicationData, rejectionReason: e.target.value })}
                    placeholder="e.g. Service not covered under policy rider or prior auth missing"
                    className="w-full px-3 py-2 bg-rose-50 border border-rose-300 rounded-lg text-sm"
                    required
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdjudicateModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md shadow-indigo-600/30 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Finalize Adjudication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
