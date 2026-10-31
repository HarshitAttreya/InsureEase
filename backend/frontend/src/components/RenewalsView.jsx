import React, { useState } from 'react';
import { 
  RefreshCw, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  DollarSign, 
  Building2, 
  Percent,
  X
} from 'lucide-react';

export default function RenewalsView({ 
  policies, 
  renewals, 
  onGenerateQuote, 
  onBindRenewal, 
  onRefresh, 
  showToast 
}) {
  const [selectedPolicyForQuote, setSelectedPolicyForQuote] = useState(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [rateAdjustment, setRateAdjustment] = useState(5.0);
  const [quoteNotes, setQuoteNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBinding, setIsBinding] = useState(false);

  // Expiring policies within 90 days or renewal due
  const today = new Date();
  const ninetyDaysFromNow = new Date();
  ninetyDaysFromNow.setDate(today.getDate() + 90);

  const eligiblePolicies = policies.filter((p) => {
    if (p.status === 'RENEWAL_DUE') return true;
    if (!p.endDate) return false;
    const end = new Date(p.endDate);
    return end <= ninetyDaysFromNow;
  });

  const handleOpenQuoteModal = (policy) => {
    setSelectedPolicyForQuote(policy);
    // Suggest rate adjustment based on loss ratio
    const lr = policy.lossRatio || 0;
    let suggested = 2.5;
    if (lr > 80) suggested = 15.0;
    else if (lr > 65) suggested = 8.0;
    else if (lr < 35) suggested = -3.0;

    setRateAdjustment(suggested);
    setQuoteNotes(`Renewal quote based on historical loss ratio experience of ${lr.toFixed(1)}%.`);
    setIsQuoteModalOpen(true);
  };

  const handleGenerateQuoteSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPolicyForQuote) return;
    setIsGenerating(true);
    try {
      await onGenerateQuote(selectedPolicyForQuote.id, {
        rateAdjustmentPct: Number(rateAdjustment),
        notes: quoteNotes,
      });
      showToast(`Renewal quote generated for policy ${selectedPolicyForQuote.policyNumber}!`, 'success');
      setIsQuoteModalOpen(false);
      onRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBind = async (quoteId, policyNum) => {
    if (!window.confirm(`Are you sure you want to bind this renewal quote for ${policyNum}? This will extend the policy by 1 year and apply the renewed premium schedule.`)) {
      return;
    }
    setIsBinding(true);
    try {
      await onBindRenewal(quoteId);
      showToast(`Renewal bound successfully! Policy ${policyNum} renewed for the upcoming policy term.`, 'success');
      onRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsBinding(false);
    }
  };

  const formatCurrency = (val) => {
    if (val == null) return '$0';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Policy Renewals & Retention Desk</h2>
        <p className="text-xs text-slate-500">
          Monitor upcoming policy expirations, calculate experience-rated adjustments, and bind renewal quotes.
        </p>
      </div>

      {/* Eligible Expiring Policies Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Policies Due for Renewal</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700">
              {eligiblePolicies.length} Expiring Soon
            </span>
          </div>
          <span className="text-xs text-slate-400">Within 90-day expiration window</span>
        </div>

        {eligiblePolicies.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            No group policies currently within the 90-day renewal expiration window.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eligiblePolicies.map((p) => {
              const activeQuote = renewals.find((r) => r.policy?.id === p.id && r.status !== 'DECLINED');
              const daysLeft = Math.ceil((new Date(p.endDate) - new Date()) / (1000 * 60 * 60 * 24));

              return (
                <div 
                  key={p.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 transition-all shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-indigo-700">{p.policyNumber}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        daysLeft < 30 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mt-2">{p.organization?.name}</h4>
                    <p className="text-xs text-slate-500">{p.productType?.replace('GROUP_', '')} - {p.planTier}</p>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/60">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Current Premium</span>
                        <span className="font-bold text-slate-800">{formatCurrency(p.baseAnnualPremium)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Claims Loss Ratio</span>
                        <span className={`font-black ${p.lossRatio > 70 ? 'text-rose-600' : 'text-slate-800'}`}>
                          {p.lossRatio != null ? `${p.lossRatio.toFixed(1)}%` : '0.0%'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                    {activeQuote ? (
                      <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Quote Ready ({activeQuote.rateAdjustmentPct > 0 ? `+${activeQuote.rateAdjustmentPct}%` : `${activeQuote.rateAdjustmentPct}%`})</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">No active quote</span>
                    )}

                    <button
                      onClick={() => handleOpenQuoteModal(p)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
                    >
                      {activeQuote ? 'Revise Quote' : 'Generate Quote'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Renewal Quotes Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Renewal Quotes Ledger</h3>
        <p className="text-xs text-slate-500">Track negotiated renewal offers and execute binding into next policy term</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3">Policy Number</th>
                <th className="py-2.5 px-3">Organization</th>
                <th className="py-2.5 px-3">Exp. Loss Ratio</th>
                <th className="py-2.5 px-3">Previous Premium</th>
                <th className="py-2.5 px-3">Proposed Premium</th>
                <th className="py-2.5 px-3">Rate Change</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {renewals.map((r) => {
                const isBound = r.status === 'BOUND';
                return (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{r.policy?.policyNumber}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{r.policy?.organization?.name}</td>
                    <td className="py-2.5 px-3">
                      <span className={`font-bold ${r.lossRatioExperience > 70 ? 'text-rose-600' : 'text-slate-700'}`}>
                        {r.lossRatioExperience != null ? `${r.lossRatioExperience.toFixed(1)}%` : '--'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{formatCurrency(r.previousAnnualPremium)}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{formatCurrency(r.proposedAnnualPremium)}</td>
                    <td className="py-2.5 px-3">
                      <span className={`font-bold ${r.rateAdjustmentPct > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                        {r.rateAdjustmentPct > 0 ? `+${r.rateAdjustmentPct}%` : `${r.rateAdjustmentPct}%`}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isBound ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {!isBound ? (
                        <button
                          onClick={() => handleBind(r.id, r.policy?.policyNumber)}
                          disabled={isBinding}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50"
                        >
                          Bind Renewal
                        </button>
                      ) : (
                        <span className="text-slate-400 font-medium">Bound</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* GENERATE RENEWAL QUOTE MODAL */}
      {isQuoteModalOpen && selectedPolicyForQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Generate Renewal Terms</h3>
                <p className="text-xs text-slate-500">{selectedPolicyForQuote.policyNumber} - {selectedPolicyForQuote.organization?.name}</p>
              </div>
              <button 
                onClick={() => setIsQuoteModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateQuoteSubmit} className="mt-4 space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block font-medium">Previous Annual Premium</span>
                  <span className="text-sm font-bold text-slate-900">
                    {formatCurrency(selectedPolicyForQuote.baseAnnualPremium)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Claims Loss Ratio</span>
                  <span className="text-sm font-black text-rose-600">
                    {selectedPolicyForQuote.lossRatio != null ? `${selectedPolicyForQuote.lossRatio.toFixed(1)}%` : '0.0%'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Proposed Rate Adjustment (% Loading or Discount)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={rateAdjustment}
                  onChange={(e) => setRateAdjustment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <span className="text-[11px] text-slate-400">
                  New estimated premium: <strong>{formatCurrency((selectedPolicyForQuote.baseAnnualPremium || 0) * (1 + (rateAdjustment / 100)))}</strong>
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Renewal Justification & Notes</label>
                <textarea
                  rows="3"
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  placeholder="Notes explaining rate revisions to corporate broker..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsQuoteModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md shadow-indigo-600/30 disabled:opacity-50"
                >
                  {isGenerating ? 'Generating...' : 'Issue Renewal Quote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
