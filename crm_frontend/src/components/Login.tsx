import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';

const Login: React.FC = () => {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSignUp, setShowSignUp] = useState(false);
  // Sign up state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState('SalesRep');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);
    setSignupSuccess(null);
    // Frontend validation
    if (!signupName || !signupEmail || !signupPassword || !signupRole) {
      setSignupError('Please fill in all required fields.');
      return;
    }
    setSignupLoading(true);
    try {
      await apiClient.post('/users', {
        name: signupName,
        email: signupEmail,
        password: signupPassword,
        role: signupRole,
      });
      setSignupSuccess('Account created! You can now log in.');
      setSignupName('');
      setSignupEmail('');
      setSignupPassword('');
      setSignupRole('SalesRep');
    } catch (err: any) {
      setSignupError(err.response?.data?.message || 'Failed to sign up.');
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowSignUp((v) => !v)}
            className="text-blue-600 hover:underline text-sm"
          >
            {showSignUp ? 'Back to Login' : 'Sign Up'}
          </button>
        </div>
        {showSignUp && (
          <form onSubmit={handleSignUp} className="space-y-4 mt-6">
            <h3 className="text-lg font-semibold text-center">Sign Up</h3>
            <div>
              <label htmlFor="signupName" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="signupName"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="signupEmail" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="signupEmail"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="signupPassword" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="signupPassword"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="signupRole" className="block text-sm font-medium text-gray-700">Role</label>
              <select
                id="signupRole"
                value={signupRole}
                onChange={(e) => setSignupRole(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                disabled
              >
                <option value="SalesRep">SalesRep</option>
              </select>
            </div>
            {signupError && <p className="text-sm text-red-600">{signupError}</p>}
            {signupSuccess && <p className="text-sm text-green-600">{signupSuccess}</p>}
            <button
              type="submit"
              disabled={signupLoading}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {signupLoading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;

