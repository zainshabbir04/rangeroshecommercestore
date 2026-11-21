import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowLeft, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { api } from '../../services/api';

export const AdminLoginPage: React.FC = () => {
  const { admin, login } = useAuth();
  const { settings } = useStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Change Password modal / drawer state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [cpEmail, setCpEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [cpLoading, setCpLoading] = useState(false);
  const [cpFeedback, setCpFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  if (admin) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setCpFeedback(null);

    if (newPassword.trim().length < 6) {
      setCpFeedback({
        type: 'error',
        text: 'New password must be at least 6 characters long.',
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setCpFeedback({
        type: 'error',
        text: 'New password and confirm password do not match.',
      });
      return;
    }

    setCpLoading(true);
    try {
      const res = await api.changeAdminPassword({
        email: cpEmail.trim() || undefined,
        current_password: currentPassword,
        new_password: newPassword.trim(),
      });
      setCpFeedback({
        type: 'success',
        text: res.message || 'Password changed successfully! You can now sign in with your new password.',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setCpFeedback({
        type: 'error',
        text: err.message || 'Failed to change password.',
      });
    } finally {
      setCpLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-10 bg-gradient-to-br from-[#280A2E] via-[#3A1042] to-[#161F33]">
      <div className="w-full max-w-md bg-[#FAF6F0] border-2 border-[#B8862D] rounded-xs shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <img
            src={settings?.logo_url || '/assets/logo/rang-e-rosh-logo-v2.jpg'}
            alt={settings?.store_name || 'Rang e Rosh'}
            className="w-20 h-20 rounded-full object-contain bg-[#FAF6F0] p-1 mx-auto border-2 border-[#B8862D] shadow-md"
          />
          <h1 className="font-serif-editorial text-3xl font-bold text-[#161F33] pt-1">
            RANG <span className="italic font-normal text-[#8C2D56]">e</span> ROSH
          </h1>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B8862D]">
            Store Owner Admin Portal
          </p>
        </div>

        {!showChangePassword ? (
          <>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#161F33] mb-1.5">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter admin email"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#E5D9C5] rounded-xs text-sm focus:outline-none focus:border-[#3A1042]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#161F33]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowChangePassword(true);
                      setCpFeedback(null);
                    }}
                    className="text-[11px] font-semibold text-[#8C2D56] hover:text-[#3A1042] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <KeyRound className="w-3 h-3" />
                    <span>Change Password</span>
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#E5D9C5] rounded-xs text-sm focus:outline-none focus:border-[#3A1042]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 bg-[#3A1042] hover:bg-[#8C2D56] text-white text-xs font-semibold tracking-[0.16em] uppercase rounded-xs transition-colors cursor-pointer shadow-md"
              >
                {submitting ? 'Signing In...' : 'Sign In to Dashboard'}
              </button>
            </form>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5D9C5] pb-2">
              <h2 className="font-serif-editorial text-xl font-bold text-[#161F33] flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-[#B8862D]" />
                <span>Change Admin Password</span>
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowChangePassword(false);
                  setCpFeedback(null);
                }}
                className="text-xs font-semibold text-[#8C2D56] hover:underline cursor-pointer"
              >
                Back to Login
              </button>
            </div>

            {cpFeedback && (
              <div
                className={`p-3 rounded-xs text-xs font-medium flex items-center gap-2 ${
                  cpFeedback.type === 'success'
                    ? 'bg-[#2E6F73]/15 border border-[#2E6F73]/30 text-[#1D4E52]'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
              >
                {cpFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2E6F73]" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{cpFeedback.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3.5" autoComplete="off">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#161F33] mb-1">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={cpEmail}
                    onChange={(e) => setCpEmail(e.target.value)}
                    placeholder="Enter admin email"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5D9C5] rounded-xs text-sm focus:outline-none focus:border-[#3A1042]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#161F33] mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5D9C5] rounded-xs text-sm focus:outline-none focus:border-[#3A1042]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#161F33] mb-1">
                  New Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 chars)"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5D9C5] rounded-xs text-sm focus:outline-none focus:border-[#3A1042]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#161F33] mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5D9C5] rounded-xs text-sm focus:outline-none focus:border-[#3A1042]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={cpLoading}
                className="w-full py-3 px-6 bg-[#2E6F73] hover:bg-[#23585B] text-white text-xs font-semibold tracking-[0.16em] uppercase rounded-xs transition-colors cursor-pointer shadow-md"
              >
                {cpLoading ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}

        <div className="text-center pt-2 border-t border-[#E5D9C5]">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#3A1042] hover:text-[#8C2D56]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Storefront</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
