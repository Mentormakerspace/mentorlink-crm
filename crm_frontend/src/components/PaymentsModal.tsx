import React, { useState } from 'react';
import { createPaymentSchedule } from '../lib/apiClient';

interface PaymentsModalProps {
  dealId: number;
  payments: any[];
  onClose: () => void;
  onPaymentAdded: () => void;
}

const PaymentsModal: React.FC<PaymentsModalProps> = ({ dealId, payments, onClose, onPaymentAdded }) => {
  const [milestoneName, setMilestoneName] = useState('');
  const [amountDue, setAmountDue] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<'pending' | 'paid'>('pending');
  const [paidOn, setPaidOn] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createPaymentSchedule(dealId, {
        milestone_name: milestoneName,
        amount_due: amountDue,
        due_date: dueDate,
        status,
        paid_on: status === 'paid' ? paidOn : null,
      });
      setMilestoneName('');
      setAmountDue('');
      setDueDate('');
      setStatus('pending');
      setPaidOn('');
      onPaymentAdded();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">&times;</button>
        <h2 className="text-xl font-semibold mb-4">Payments for Deal #{dealId}</h2>
        <div className="mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Milestone</th>
                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Paid On</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-2 text-gray-400">No payments yet.</td></tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-2 py-1">{p.milestone_name}</td>
                    <td className="px-2 py-1">${parseFloat(p.amount_due).toLocaleString()}</td>
                    <td className="px-2 py-1">{p.due_date}</td>
                    <td className="px-2 py-1">{p.status}</td>
                    <td className="px-2 py-1">{p.paid_on || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <form onSubmit={handleAddPayment} className="space-y-3">
          <h3 className="text-lg font-semibold">Add Payment</h3>
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Milestone Name"
              value={milestoneName}
              onChange={e => setMilestoneName(e.target.value)}
              required
              className="border px-2 py-1 rounded w-40"
            />
            <input
              type="number"
              placeholder="Amount Due"
              value={amountDue}
              onChange={e => setAmountDue(e.target.value)}
              required
              className="border px-2 py-1 rounded w-32"
            />
            <input
              type="date"
              placeholder="Due Date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              required
              className="border px-2 py-1 rounded w-40"
            />
            <select
              value={status}
              onChange={e => setStatus(e.target.value as 'pending' | 'paid')}
              className="border px-2 py-1 rounded w-32"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
            {status === 'paid' && (
              <input
                type="date"
                placeholder="Paid On"
                value={paidOn}
                onChange={e => setPaidOn(e.target.value)}
                className="border px-2 py-1 rounded w-40"
              />
            )}
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Payment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentsModal; 