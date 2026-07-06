import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Factory, Eye, EyeOff, ArrowRight, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(username, password);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') { setUsername('admin'); setPassword('admin123'); }
    else { setUsername('user'); setPassword('user123'); }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="relative hidden w-1/2 overflow-hidden bg-surface-950 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="absolute -right-10 bottom-20 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />

        <div className="relative z-10 p-12">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 shadow-glow">
              <Factory className="h-6 w-6 text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-white">InspectPro</span>
          </div>
        </div>

        <div className="relative z-10 px-12 pb-16">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-5xl font-bold leading-tight text-white"
          >
            Machine Inspection
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-violet-400 bg-clip-text text-transparent">
              Made Simple
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 max-w-md text-lg text-surface-400"
          >
            Digital checklists, real-time signatures, and complete inspection history — all in one platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-10 grid grid-cols-3 gap-4"
          >
            {[
              { num: '26+', label: 'Check Points' },
              { num: '100%', label: 'Digital' },
              { num: '24/7', label: 'Access' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="font-display text-2xl font-bold text-brand-400">{s.num}</p>
                <p className="text-xs text-surface-400">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex flex-1 items-center justify-center bg-surface-50 p-6">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600">
                <Factory className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold">InspectPro</span>
            </div>
          </div>

          <h2 className="font-display text-3xl font-bold text-surface-900">Welcome back</h2>
          <p className="mt-2 text-surface-500">Sign in to your inspection dashboard</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="label">Username</label>
              <input
                type="text"
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                >
                  {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                {error}
              </motion.div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <div className="mt-8 rounded-2xl border border-surface-200 bg-white p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-surface-400">Demo Accounts</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => fillDemo('admin')}
                className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm transition-colors hover:bg-amber-100"
              >
                <Shield className="h-4 w-4 text-amber-600" />
                <div>
                  <p className="font-semibold text-amber-900">Admin</p>
                  <p className="text-xs text-amber-600">admin / admin123</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('user')}
                className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-left text-sm transition-colors hover:bg-brand-100"
              >
                <User className="h-4 w-4 text-brand-600" />
                <div>
                  <p className="font-semibold text-brand-900">User</p>
                  <p className="text-xs text-brand-600">user / user123</p>
                </div>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
