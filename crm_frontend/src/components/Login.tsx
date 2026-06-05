import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { createUser } from '../lib/apiClient';

const Login: React.FC = () => {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSignUp, setShowSignUp] = useState(false);

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
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
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);
    setSignupSuccess(null);
    if (!signupName || !signupEmail || !signupPassword) {
      setSignupError('Please fill in all fields.');
      return;
    }
    setSignupLoading(true);
    try {
      await createUser({
        name: signupName,
        email: signupEmail,
        password: signupPassword,
        role: 'SalesRep',
      });
      setSignupSuccess('Account created. You can now sign in.');
      setSignupName('');
      setSignupEmail('');
      setSignupPassword('');
      setShowSignUp(false);
    } catch (err: any) {
      setSignupError(err.response?.data?.message || 'Failed to create account.');
    } finally {
      setSignupLoading(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent transition bg-white';

  const toggleMode = () => {
    setShowSignUp(v => !v);
    setError(null);
    setSignupError(null);
    setSignupSuccess(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm px-4">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="MentorLink" className="h-12 w-12 mb-3 object-contain" />
          <span className="text-xl font-bold text-gray-900 tracking-tight">MentorLink CRM</span>
          <span className="text-sm text-gray-500 mt-1">
            {showSignUp ? 'Create your account' : 'Sign in to your account'}
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {!showSignUp ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className={inputClass}
                  placeholder="you@mentorlink.ai"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>
              )}
              {signupSuccess && (
                <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-md">{signupSuccess}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 rounded-md text-sm font-semibold text-white bg-[#6C63FF] hover:bg-[#5A52E0] disabled:opacity-50 transition-colors"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label htmlFor="signupName" className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                <input
                  id="signupName"
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  required
                  className={inputClass}
                  placeholder="Jane Smith"
                />
              </div>
              <div>
                <label htmlFor="signupEmail" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  id="signupEmail"
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                  className={inputClass}
                  placeholder="you@mentorlink.ai"
                />
              </div>
              <div>
                <label htmlFor="signupPassword" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  id="signupPassword"
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>
              {signupError && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{signupError}</p>
              )}
              <button
                type="submit"
                disabled={signupLoading}
                className="w-full py-2 px-4 rounded-md text-sm font-semibold text-white bg-[#6C63FF] hover:bg-[#5A52E0] disabled:opacity-50 transition-colors"
              >
                {signupLoading ? 'Creating account…' : 'Create account'}
              </button>
            </form>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <button
              onClick={toggleMode}
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              {showSignUp ? '← Back to sign in' : 'Need an account? Sign up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
