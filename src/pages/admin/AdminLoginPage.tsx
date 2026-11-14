import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowLeft, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';

export const AdminLoginPage: React.FC = () => {
  const { admin, login } = useAuth();
  const { settings } = useStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState('rangerosh.official@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gradient-to-br from-[#280A2E] via-[#3A1042] to-[#161F33]">
      <div className="w-full max-w-md bg-[#FAF6F0] border-2 border-[#B8862D] rounded-xs shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <img
            src={
              !settings?.logo_url || settings.logo_url === '/assets/logo/website-logo.jpg'
                ? '/uploads/1794056903993-429854-rang-e-rosh-logo.jpg'
                : settings.logo_url
            }
            alt="Rang e Rosh"
            className="w-20 h-20 rounded-full object-contain bg-[#FAF6F0] p-1 mx-auto border-2 border-[#B8862D] shadow-md"
          />
          <h1 className="font-serif-editorial text-3xl font-bold text-[#161F33] pt-1">
            RANG <span className="italic font-normal text-[#8C2D56]">e</span> ROSH
          </h1>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B8862D]">
            Store Owner Admin Portal
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="rangerosh.official@gmail.com"
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#E5D9C5] rounded-xs text-sm focus:outline-none focus:border-[#3A1042]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#161F33] mb-1.5">
              Password
            </label>
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

        <div className="p-3 bg-[#F3ECE0] border border-[#E5D9C5] rounded-xs text-[11px] text-[#161F33]/80 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-[#3A1042]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2E6F73]" />
            <span>Default Local Admin Credentials (from .env)</span>
          </div>
          <p>
            Email: <code className="font-mono text-[#3A1042]">rangerosh.official@gmail.com</code>
          </p>
          <p>
            Password: <code className="font-mono text-[#3A1042]">RangeRosh@Admin2026</code>
          </p>
        </div>

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
