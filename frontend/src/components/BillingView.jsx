import React, { useState } from 'react';
import { 
  CreditCard, 
  Search, 
  Plus, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Building2, 
  X,
  FileText
} from 'lucide-react';

export default function BillingView({ 
  invoices, 
  policies, 
  onCreateInvoice, 
  onRecordPayment, 
  onRefresh, 
  showToast 
}) {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Invoice Form State
  const [invoiceData, setInvoiceData] = useState({
    policyId: '',
    billingPeriod: 'Q2 2025 Premium',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
    baseAmount: '',
    taxesAndFees: '',
  });

  // Payment Form State
  const [paymentData, setPaymentData] = useState({
    amountPaid: '',
    paymentMethod: 'WIRE_TRANSFER',
    paymentReference: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Financial Aggregates
  const totalBilled = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
  const totalDue = invoices.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus = filterStatus === 'ALL' || inv.status === filterStatus;
    const matchesSearch = 
      inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.policy?.organization?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.billingPeriod?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleOpenCreateInvoice = () => {
    if (policies.length > 0) {
      const p = policies[0];
      const annual = p.baseAnnualPremium || 50000;
      const base = p.billingFrequency === 'MONTHLY' ? Math.round(annual / 12) : p.billingFrequency === 'QUARTERLY' ? Math.round(annual / 4) : annual;
      setInvoiceData({
        policyId: p.id,
        billingPeriod: `Period ${p.billingFrequency} Premium`,
        dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
        baseAmount: base,
        taxesAndFees: Math.round(base * 0.045),
      });
    }
    setIsInvoiceModalOpen(true);
  };

  const handlePolicySelectChange = (policyId) => {
    const p = policies.find((item) => item.id === Number(policyId));
    if (p) {
      const annual = p.baseAnnualPremium || 50000;
      const base = p.billingFrequency === 'MONTHLY' ? Math.round(annual / 12) : p.billingFrequency === 'QUARTERLY' ? Math.round(annual / 4) : annual;
      setInvoiceData((prev) => ({
        ...prev,
        policyId,
        baseAmount: base,
        taxesAndFees: Math.round(base * 0.045),
      }));
    }
  };

  const handleOpenPayment = (inv) => {
    setSelectedInvoice(inv);
    setPaymentData({
      amountPaid: inv.balanceDue || inv.totalAmount,
      paymentMethod: 'WIRE_TRANSFER',
      paymentReference: `WIRE-TX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    });
    setIsPaymentModalOpen(true);
  };

  const handleSubmitInvoice = async (e) => {
    e.preventDefault();
    if (!invoiceData.policyId) {
      showToast('Please select policy', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await onCreateInvoice({
        policyId: Number(invoiceData.policyId),
        billingPeriod: invoiceData.billingPeriod,
        dueDate: invoiceData.dueDate,
        baseAmount: Number(invoiceData.baseAmount),
        taxesAndFees: Number(invoiceData.taxesAndFees),
      });
      showToast('Premium billing invoice issued successfully!', 'success');
      setIsInvoiceModalOpen(false);
      onRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setIsSubmitting(true);
    try {
      await onRecordPayment(selectedInvoice.id, {
        amountPaid: Number(paymentData.amountPaid),
        paymentMethod: paymentData.paymentMethod,
        paymentReference: paymentData.paymentReference,
      });
      showToast(`Payment of $${paymentData.amountPaid} credited to ${selectedInvoice.invoiceNumber}!`, 'success');
      setIsPaymentModalOpen(false);
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Group Premium Billing & Reconciliation</h2>
          <p className="text-xs text-slate-500">
            Automate monthly/quarterly census invoicing, reconcile bank wire collections, and track receivables aging.
          </p>
        </div>
        <button
          onClick={handleOpenCreateInvoice}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Premium Invoice</span>
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Invoiced Premium</span>
          <div className="mt-2 text-2xl font-black text-slate-900">{formatCurrency(totalBilled)}</div>
          <span className="text-xs text-slate-400 mt-1 block">Contracted installments</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Collected Payments</span>
          <div className="mt-2 text-2xl font-black text-emerald-600">{formatCurrency(totalPaid)}</div>
          <span className="text-xs text-emerald-600 font-medium mt-1 block">Verified settlements</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Outstanding Receivables</span>
          <div className="mt-2 text-2xl font-black text-rose-600">{formatCurrency(totalDue)}</div>
          <span className="text-xs text-rose-500 font-medium mt-1 block">Issued & overdue balances</span>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by invoice #, organization, or period..."
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
          <option value="ALL">All Invoices</option>
          <option value="ISSUED">Issued / Open</option>
          <option value="PAID">Paid in Full</option>
          <option value="PARTIALLY_PAID">Partially Paid</option>
          <option value="OVERDUE">Overdue</option>
        </select>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3">Invoice Number</th>
                <th className="py-2.5 px-3">Corporate Client</th>
                <th className="py-2.5 px-3">Policy ID</th>
                <th className="py-2.5 px-3">Billing Period</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3">Total Amount</th>
                <th className="py-2.5 px-3">Amount Paid</th>
                <th className="py-2.5 px-3">Balance Due</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => {
                const statusColors = {
                  PAID: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                  ISSUED: 'bg-blue-100 text-blue-800 border-blue-300',
                  PARTIALLY_PAID: 'bg-amber-100 text-amber-800 border-amber-300',
                  OVERDUE: 'bg-rose-100 text-rose-800 border-rose-300',
                };

                const isPaid = inv.status === 'PAID';

                return (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-indigo-700">{inv.invoiceNumber}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{inv.policy?.organization?.name}</td>
                    <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">{inv.policy?.policyNumber}</td>
                    <td className="py-3 px-3 font-medium text-slate-700">{inv.billingPeriod}</td>
                    <td className="py-3 px-3 text-slate-600">{inv.dueDate}</td>
                    <td className="py-3 px-3 font-black text-slate-900">{formatCurrency(inv.totalAmount)}</td>
                    <td className="py-3 px-3 font-bold text-emerald-600">{formatCurrency(inv.amountPaid)}</td>
                    <td className="py-3 px-3 font-black text-rose-600">{formatCurrency(inv.balanceDue)}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[inv.status] || 'bg-slate-100'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {!isPaid ? (
                        <button
                          onClick={() => handleOpenPayment(inv)}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-colors"
                        >
                          Record Payment
                        </button>
                      ) : (
                        <div className="text-[11px] text-slate-400 font-mono">{inv.paymentReference || 'Settled'}</div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE INVOICE MODAL */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Issue Group Premium Invoice</h3>
                <p className="text-xs text-slate-500">Generate contracted premium statement for corporate employer</p>
              </div>
              <button 
                onClick={() => setIsInvoiceModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitInvoice} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Policy *</label>
                <select
                  value={invoiceData.policyId}
                  onChange={(e) => handlePolicySelectChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  required
                >
                  {policies.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.policyNumber} - {p.organization?.name} ({p.billingFrequency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Period Description</label>
                <input
                  type="text"
                  value={invoiceData.billingPeriod}
                  onChange={(e) => setInvoiceData({ ...invoiceData, billingPeriod: e.target.value })}
                  placeholder="e.g. Q3 2025 Group Premium"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Base Installment ($)</label>
                  <input
                    type="number"
                    value={invoiceData.baseAmount}
                    onChange={(e) => setInvoiceData({ ...invoiceData, baseAmount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Taxes & Admin Fees ($)</label>
                  <input
                    type="number"
                    value={invoiceData.taxesAndFees}
                    onChange={(e) => setInvoiceData({ ...invoiceData, taxesAndFees: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Payment Due Date</label>
                <input
                  type="date"
                  value={invoiceData.dueDate}
                  onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md shadow-indigo-600/30 disabled:opacity-50"
                >
                  {isSubmitting ? 'Issuing...' : 'Issue Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {isPaymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Record Premium Collection</h3>
                <p className="text-xs text-slate-500">{selectedInvoice.invoiceNumber} - {selectedInvoice.policy?.organization?.name}</p>
              </div>
              <button 
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="mt-4 space-y-3.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between">
                <span className="text-slate-500 font-medium">Outstanding Balance:</span>
                <span className="font-black text-rose-600">{formatCurrency(selectedInvoice.balanceDue)}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Amount to Credit ($) *</label>
                <input
                  type="number"
                  value={paymentData.amountPaid}
                  onChange={(e) => setPaymentData({ ...paymentData, amountPaid: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-black text-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentData.paymentMethod}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold"
                >
                  <option value="WIRE_TRANSFER">Wire Transfer (Fedwire / SWIFT)</option>
                  <option value="ACH">ACH Direct Debit</option>
                  <option value="CREDIT_CARD">Corporate Credit Card</option>
                  <option value="CHECK">Certified Bank Check</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Reference / Trace Number</label>
                <input
                  type="text"
                  value={paymentData.paymentReference}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentReference: e.target.value })}
                  placeholder="e.g. WIRE-CHASE-0921"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md shadow-emerald-600/30 disabled:opacity-50"
                >
                  {isSubmitting ? 'Recording...' : 'Confirm Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
