import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FilePlus, ClipboardList, Calendar, Eye } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';

export default function UserDashboard() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.mySubmissions().then(setSubmissions).finally(() => setLoading(false));
  }, []);

  const thisMonth = submissions.filter((s) => {
    const d = new Date(s.submitted_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl font-bold text-surface-900"
          >
            Welcome, {user?.full_name || user?.username}
          </motion.h1>
          <p className="mt-1 text-surface-500">Manage your machine inspection reports</p>
        </div>
        <Link to="/form/new" className="btn-primary">
          <FilePlus className="h-4 w-4" /> New Inspection
        </Link>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={ClipboardList} label="Total Submissions" value={submissions.length} delay={0} />
        <StatCard icon={Calendar} label="This Month" value={thisMonth} color="emerald" delay={0.1} />
        <StatCard icon={FilePlus} label="Checklist Items" value="26" color="violet" delay={0.2} />
      </div>

      <div className="card overflow-hidden !p-0">
        <div className="border-b border-surface-200 px-6 py-4">
          <h2 className="font-display text-lg font-semibold">Recent Submissions</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <ClipboardList className="mb-4 h-12 w-12 text-surface-300" />
            <p className="font-medium text-surface-600">No inspections yet</p>
            <p className="mt-1 text-sm text-surface-400">Create your first machine inspection report</p>
            <Link to="/form/new" className="btn-primary mt-6">
              <FilePlus className="h-4 w-4" /> Start Inspection
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-100 bg-surface-50/50">
                  {['ID', 'Customer', 'Machine', 'Serial No', 'Date', 'Submitted', ''].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {submissions.map((s, i) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="transition-colors hover:bg-brand-50/30"
                  >
                    <td className="px-6 py-4 font-medium text-brand-600">#{s.id}</td>
                    <td className="px-6 py-4">{s.customer || '—'}</td>
                    <td className="px-6 py-4">{s.machine_type || '—'}</td>
                    <td className="px-6 py-4 font-mono text-xs">{s.serial_no || '—'}</td>
                    <td className="px-6 py-4">{s.inspection_date || '—'}</td>
                    <td className="px-6 py-4 text-surface-500">{new Date(s.submitted_at).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <Link to={`/form/view/${s.id}`} className="btn-secondary btn-sm">
                        <Eye className="h-3.5 w-3.5" /> View
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
