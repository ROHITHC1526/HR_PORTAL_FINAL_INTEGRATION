import React, { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import type { OfficeExpense } from './types';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<OfficeExpense, 'id'>) => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, onSave }) => {
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [vendor, setVendor] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [description, setDescription] = useState('');
  const [amountBeforeGst, setAmountBeforeGst] = useState('');
  const [gst, setGst] = useState('');
  const [total, setTotal] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [approvedBy, setApprovedBy] = useState('');
  const [fileName, setFileName] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const baseAmt = parseFloat(amountBeforeGst) || 0;
    const gstAmt = parseFloat(gst) || 0;
    if (amountBeforeGst !== '' || gst !== '') {
      setTotal(String(baseAmt + gstAmt));
    } else {
      setTotal('');
    }
  }, [amountBeforeGst, gst]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !category || !description || !amountBeforeGst || !status) {
      alert('Please fill out all required fields marked with *');
      return;
    }

    const baseAmt = parseFloat(amountBeforeGst) || 0;
    const gstAmt = parseFloat(gst) || 0;
    const tot = baseAmt + gstAmt;

    onSave({
      date,
      category,
      vendor: vendor || 'Direct Vendor',
      invoice_no: invoiceNo,
      description,
      amount_before_gst: baseAmt,
      gst: gstAmt,
      total: tot,
      payment_mode: paymentMode,
      paid_by: paidBy,
      approved_by: approvedBy,
      bill_receipt: fileName,
      status: (status as 'Pending' | 'Approved' | 'Paid') || 'Pending',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-[#10192A] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header matching Image 4 */}
        <div className="p-6 pb-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Add office expense</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Fields marked * are required.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-3 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Row 1: Date & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm outline-none focus:border-blue-500"
              >
                <option value="">Select...</option>
                <option value="Rent">Rent</option>
                <option value="Utilities">Utilities</option>
                <option value="Supplies">Supplies</option>
                <option value="Services">Services</option>
                <option value="Software">Software</option>
                <option value="Travel">Travel</option>
                <option value="Hardware">Hardware</option>
              </select>
            </div>
          </div>

          {/* Row 2: Vendor & Invoice no. */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Vendor
              </label>
              <select
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm outline-none focus:border-blue-500"
              >
                <option value="">Nothing to choose yet</option>
                <option value="WeWork Cyber City">WeWork Cyber City</option>
                <option value="Airtel Business Enterprise">Airtel Business Enterprise</option>
                <option value="Amazon Business">Amazon Business</option>
                <option value="Dell Technologies">Dell Technologies</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Invoice no.
              </label>
              <input
                type="text"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                placeholder=""
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Row 3: Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* Row 4: Amount before GST & GST */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Amount before GST (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={amountBeforeGst}
                onChange={(e) => setAmountBeforeGst(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                GST (₹)
              </label>
              <input
                type="number"
                step="any"
                value={gst}
                onChange={(e) => setGst(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Row 5: Total & Payment mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Total (₹)
              </label>
              <input
                type="text"
                readOnly
                value={total ? `₹${Number(total).toLocaleString('en-IN')}` : ''}
                placeholder="Worked out automatically"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Payment mode
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm outline-none focus:border-blue-500"
              >
                <option value="">Select...</option>
                <option value="Corporate Card">Corporate Card</option>
                <option value="Bank Transfer / NEFT">Bank Transfer / NEFT</option>
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
          </div>

          {/* Row 6: Paid by & Approved by */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Paid by
              </label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm outline-none focus:border-blue-500"
              >
                <option value="">Select...</option>
                <option value="Company Account">Company Account</option>
                <option value="Ananya Rao (HR Admin)">Ananya Rao (HR Admin)</option>
                <option value="Rahul Varma">Rahul Varma</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Approved by
              </label>
              <select
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm outline-none focus:border-blue-500"
              >
                <option value="">Select...</option>
                <option value="Ananya Rao (HR Admin)">Ananya Rao (HR Admin)</option>
                <option value="Finance Director">Finance Director</option>
                <option value="Managing Partner">Managing Partner</option>
              </select>
            </div>
          </div>

          {/* Row 7: Bill / receipt & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Bill / receipt
              </label>
              <input
                type="file"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFileName(e.target.files[0].name);
                  }
                }}
                className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border file:border-slate-300 dark:file:border-slate-700 file:text-xs file:font-semibold file:bg-white dark:file:bg-slate-800 file:text-slate-800 dark:file:text-slate-200 hover:file:bg-slate-50 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm outline-none focus:border-blue-500"
              >
                <option value="">Select...</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>

          {/* Footer buttons matching Image 4 */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md transition-all cursor-pointer"
            >
              Add office expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddExpenseModal;
