import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  ShieldAlert, 
  Sliders, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Activity, 
  Zap, 
  Building2, 
  Users,
  ChevronRight
} from 'lucide-react';

export default function UnderwritingView({ 
  policies, 
  assessments, 
  onEvaluateRisk, 
  onSubmitDecision, 
  onRefresh, 
  showToast 
}) {
  const [selectedPolicyId, setSelectedPolicyId] = useState(null);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Decision Form State
  const [decisionData, setDecisionData] = useState({
    underwriterName: 'Lead Group Underwriter',
    decision: 'APPROVED',
    recommendedLoadingPct: 0,
    decisionNotes: '',
    specialConditions: 'Standard policy terms apply.',
  });

  // Filter policies in underwriting status or any policy
  const pendingPolicies = policies.filter(
    (p) => p.underwritingStatus === 'PENDING' || p.status === 'UNDERWRITING'
  );

  useEffect(() => {
    if (pendingPolicies.length > 0 && !selectedPolicyId) {
      setSelectedPolicyId(pendingPolicies[0].id);
    } else if (policies.length > 0 && !selectedPolicyId) {
      setSelectedPolicyId(policies[0].id);
    }
  }, [policies, pendingPolicies]);

  useEffect(() => {
    if (selectedPolicyId) {
      const match = assessments.find((a) => a.policy?.id === selectedPolicyId);
      if (match) {
        setCurrentAssessment(match);
        setDecisionData({
          underwriterName: match.underwriterName || 'Lead Group Underwriter',
          decision: match.decision || 'APPROVED',
          recommendedLoadingPct: match.recommendedLoadingPct || 0,
          decisionNotes: match.decisionNotes || '',
          specialConditions: match.specialConditions || 'Standard policy terms apply.',
        });
      } else {
        setCurrentAssessment(null);
        setDecisionData((prev) => ({
          ...prev,
          recommendedLoadingPct: 0,
          decisionNotes: '',
          specialConditions: 'Standard terms apply.',
        }));
      }
    }
  }, [selectedPolicyId, assessments]);

  const selectedPolicy = policies.find((p) => p.id === selectedPolicyId);

  const handleRunEvaluation = async () => {
    if (!selectedPolicyId) return;
    setIsEvaluating(true);
    try {
      const res = await onEvaluateRisk(selectedPolicyId);
      setCurrentAssessment(res);
      setDecisionData((prev) => ({
        ...prev,
        decision: res.decision || 'APPROVED',
        recommendedLoadingPct: res.recommendedLoadingPct || 0,
        decisionNotes: res.decisionNotes || '',
        specialConditions: res.specialConditions || '',
      }));
      showToast('Automated underwriting risk evaluation completed!', 'success');
      onRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPolicyId) return;
    setIsSubmitting(true);
    try {
      await onSubmitDecision({
        policyId: selectedPolicyId,
        ...decisionData,
        recommendedLoadingPct: Number(decisionData.recommendedLoadingPct),
      });
      showToast(`Underwriting decision submitted! Policy status updated to ${decisionData.decision}`, 'success');
      onRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScoreColor = (score) => {
    if (score == null) return 'text-slate-400 bg-slate-100';
    if (score < 50) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score < 75) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Group Underwriting & Risk Assessment Desk</h2>
        <p className="text-xs text-slate-500">
          Automated census risk profiling, industry hazard scoring, and underwriter binding decisioning.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Underwriting Queue */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Underwriting Cases</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                {pendingPolicies.length} Pending
              </span>
            </div>

            <div className="mt-3 space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {policies.map((p) => {
                const isSelected = p.id === selectedPolicyId;
                const isPending = p.underwritingStatus === 'PENDING';
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPolicyId(p.id)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-500/50 shadow-sm ring-1 ring-indigo-500/20'
                        : 'bg-white border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-indigo-700">{p.policyNumber}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isPending ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {p.underwritingStatus}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 mt-1">{p.organization?.name}</h4>
                    <p className="text-[11px] text-slate-500">{p.productType?.replace('GROUP_', '')} - {p.planTier} Tier</p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                      <span>Lives: {p.enrolledMembersCount || 0}</span>
                      <span>Hazard: {p.organization?.industryRiskFactor || 1.0}x</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Underwriting Workbench */}
        <div className="lg:col-span-8 space-y-6">
          {selectedPolicy ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-slate-900">{selectedPolicy.policyNumber}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {selectedPolicy.productType?.replace('GROUP_', '')} Insurance
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Client: <strong className="text-slate-800">{selectedPolicy.organization?.name}</strong> ({selectedPolicy.organization?.industry})
                  </p>
                </div>

                <button
                  onClick={handleRunEvaluation}
                  disabled={isEvaluating}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
                >
                  <Zap className={`w-3.5 h-3.5 ${isEvaluating ? 'animate-spin' : ''}`} />
                  <span>{isEvaluating ? 'Evaluating...' : 'Run Automated Risk Evaluation'}</span>
                </button>
              </div>

              {/* Risk Analytics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Overall Risk Score */}
                <div className="p-4 rounded-xl border bg-slate-50/50 border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Composite Risk Score
                  </span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">
                      {currentAssessment?.overallRiskScore != null ? currentAssessment.overallRiskScore.toFixed(1) : '--'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">/ 100</span>
                  </div>
                  <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded border ${getScoreColor(currentAssessment?.overallRiskScore)}`}>
                    {currentAssessment?.overallRiskScore < 50 ? 'Low Hazard' : currentAssessment?.overallRiskScore < 75 ? 'Moderate Hazard' : 'Elevated Risk'}
                  </span>
                </div>

                {/* Demographic & Age Index */}
                <div className="p-4 rounded-xl border bg-slate-50/50 border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Demographic Index
                  </span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">
                      {currentAssessment?.demographicRiskScore != null ? currentAssessment.demographicRiskScore.toFixed(1) : '--'}
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500">Based on census age & conditions</p>
                </div>

                {/* Industry Hazard Factor */}
                <div className="p-4 rounded-xl border bg-slate-50/50 border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Industry Hazard Index
                  </span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">
                      {selectedPolicy.organization?.industryRiskFactor != null ? `${selectedPolicy.organization.industryRiskFactor}x` : '1.0x'}
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500">Hazard multiplier for industry line</p>
                </div>
              </div>

              {/* Assessment Engine Output */}
              {currentAssessment && (
                <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-indigo-900">
                    <Activity className="w-4 h-4 text-indigo-600" />
                    <span>Engine Findings & Recommendation</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{currentAssessment.decisionNotes}</p>
                  <div className="flex items-center gap-4 pt-1 font-semibold text-slate-800">
                    <span>
                      Recommended Premium Loading: 
                      <strong className="text-indigo-600 ml-1">
                        {currentAssessment.recommendedLoadingPct > 0 ? `+${currentAssessment.recommendedLoadingPct}%` : `${currentAssessment.recommendedLoadingPct}%`}
                      </strong>
                    </span>
                  </div>
                </div>
              )}

              {/* Underwriter Adjudication Decision Form */}
              <form onSubmit={handleSubmit} className="pt-4 border-t border-slate-100 space-y-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-indigo-600" />
                  <span>Underwriter Formal Decisioning</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Underwriter Name</label>
                    <input
                      type="text"
                      value={decisionData.underwriterName}
                      onChange={(e) => setDecisionData({ ...decisionData, underwriterName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Underwriting Decision</label>
                    <select
                      value={decisionData.decision}
                      onChange={(e) => setDecisionData({ ...decisionData, decision: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold"
                    >
                      <option value="APPROVED">APPROVED (Active Terms)</option>
                      <option value="CONDITIONALLY_APPROVED">CONDITIONALLY APPROVED (With Loading/Warranties)</option>
                      <option value="DECLINED">DECLINED (Reject Submission)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Premium Adjustment Rate (% Loading / Discount)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={decisionData.recommendedLoadingPct}
                      onChange={(e) => setDecisionData({ ...decisionData, recommendedLoadingPct: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                    />
                    <span className="text-[11px] text-slate-400">e.g. +10% loading for high loss ratio or -3% discount</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Special Warranties & Exclusions</label>
                    <input
                      type="text"
                      value={decisionData.specialConditions}
                      onChange={(e) => setDecisionData({ ...decisionData, specialConditions: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Underwriter Review Commentary</label>
                  <textarea
                    rows="2"
                    value={decisionData.decisionNotes}
                    onChange={(e) => setDecisionData({ ...decisionData, decisionNotes: e.target.value })}
                    placeholder="Enter formal justification for underwriter file..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  ></textarea>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSubmitting ? 'Submitting...' : 'Commit Underwriting Decision'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 text-sm">
              Select a policy from the underwriting queue to begin risk assessment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
