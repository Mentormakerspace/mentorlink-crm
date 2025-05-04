import React, { useState, useEffect } from 'react';
import { createDeal, fetchClients, fetchUsers } from '@/lib/apiClient';
import { Client, User } from '@/types/crm';

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDealCreated: (newDeal: any) => void; // Callback to update parent state
}

const CreateDealModal: React.FC<CreateDealModalProps> = ({ isOpen, onClose, onDealCreated }) => {
  const [clientId, setClientId] = useState<number | string>('');
  const [salesRepId, setSalesRepId] = useState<number | string>('');
  const [stage, setStage] = useState('Lead'); // Default stage
  const [estimatedValue, setEstimatedValue] = useState('');
  const [probability, setProbability] = useState('');
  const [expectedClose, setExpectedClose] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch clients and users for dropdowns
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const [fetchedClients, fetchedUsers] = await Promise.all([
            fetchClients(),
            fetchUsers(), // Assuming fetchUsers returns all users or relevant SalesReps
          ]);
          setClients(fetchedClients || []);
          // Filter for SalesReps if needed, or adjust fetchUsers API
          setUsers(fetchedUsers?.filter((u: User) => u.role === 'SalesRep') || []);
        } catch (err) {
          console.error("Failed to fetch clients/users:", err);
          setError('Failed to load necessary data for the form.');
        }
      };
      fetchData();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!clientId || !salesRepId || !stage || !estimatedValue || !probability || !expectedClose) {
        setError('Please fill in all required fields.');
        setLoading(false);
        return;
    }

    const dealData = {
      client_id: Number(clientId),
      sales_rep_id: Number(salesRepId),
      stage,
      estimated_value: estimatedValue,
      probability: parseFloat(probability) / 100, // Assuming input is percentage
      expected_close: expectedClose, // Ensure YYYY-MM-DD format
    };

    try {
      const result = await createDeal(dealData);
      onDealCreated(result.deal); // Pass the newly created deal back
      handleClose(); // Close modal on success
    } catch (err: any) {
      console.error('Failed to create deal:', err);
      setError(err.response?.data?.message || 'Failed to create deal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form state
    setClientId('');
    setSalesRepId('');
    setStage('Lead');
    setEstimatedValue('');
    setProbability('');
    setExpectedClose('');
    setError(null);
    onClose(); // Call the parent's close handler
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">Create New Deal</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="client" className="block text-sm font-medium text-gray-700">Client</label>
            <select
              id="client"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="" disabled>Select a client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.company}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="salesRep" className="block text-sm font-medium text-gray-700">Sales Rep</label>
            <select
              id="salesRep"
              value={salesRepId}
              onChange={(e) => setSalesRepId(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="" disabled>Select a sales rep</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="stage" className="block text-sm font-medium text-gray-700">Stage</label>
            {/* Consider fetching stages dynamically if configurable */}
            <select
              id="stage"
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              {['Lead', 'Prospect', 'Proposal', 'Contract', 'Deposit', 'Staged Payments', 'Project Delivery', 'Final Payment'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="estimatedValue" className="block text-sm font-medium text-gray-700">Estimated Value ($)</label>
            <input
              type="number"
              id="estimatedValue"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              step="0.01"
            />
          </div>

          <div>
            <label htmlFor="probability" className="block text-sm font-medium text-gray-700">Probability (%)</label>
            <input
              type="number"
              id="probability"
              value={probability}
              onChange={(e) => setProbability(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              min="0"
              max="100"
            />
          </div>

          <div>
            <label htmlFor="expectedClose" className="block text-sm font-medium text-gray-700">Expected Close Date</label>
            <input
              type="date"
              id="expectedClose"
              value={expectedClose}
              onChange={(e) => setExpectedClose(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDealModal;

