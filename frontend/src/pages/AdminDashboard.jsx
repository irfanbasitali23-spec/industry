import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardList, Users, Settings, FileText, Eye, ArrowRight } from 'lucide-react';
import { api } from '../api/client';
import StatCard from '../components/StatCard';

const quickLinks = [
  { to: '/admin/submissions', icon: ClipboardList, title: 'Submissions', desc: 'Review all inspection forms', color: 'from-brand-500 to-brand-700' },
  { to: '/admin/form-editor', icon: Settings, title: 'Form Editor', desc: 'Customize style & questions', color: 'from-violet-500 to-violet-700' },
  { to: '/admin/users', icon: Users, title: 'Users', desc: 'Manage accounts & roles', color: 'from-emerald-500 to-emerald-700' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({ submissions: 0, users: 0, fields: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.adminSubmissions(), api.getUsers(), api.adminTemplate()])
      .then(([subs, users, template]) => {
        setStats({ submissions: subs.length, users: users.filter((u) => u.is_active).length, fields: template.fields.length });
        setRecent(subs.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-surface-900">Admin Overview</h1>
        <p className="mt-1 text-surface-500">Manage inspections, forms, and users</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard icon={FileText} label="Total Submissions" value={stats.submissions} />
        <StatCard icon={Users} label="Active Users" value={stats.users} color="emerald" delay={0.1} />
        <StatCard icon={Settings} label="Form Questions" value={stats.fields} color="violet" delay={0.2} />
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {quickLinks.map((link, i) => {
          const Icon = link.icon;
          return (
            <motion.div key={link.to} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Link to={link.to} className="card group flex items-start gap-4 transition-all hover:shadow-card-hover">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${link.color} text-white shadow-lg`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-surface-900 group-hover:text-brand-600">{link.title}</h3>
                  <p className="mt-1 text-sm text-surface-500">{link.desc}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-surface-300 transition-transform group-hover:translate-x-1 group-hover:text-brand-500" />
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="card overflow-hidden !p-0">
        <div className="flex items-center justify-between border-b border-surface-200 px-6 py-4">
          <h2 className="font-display text-lg font-semibold">Recent Submissions</h2>
          <Link to="/admin/submissions" className="text-sm font-medium text-brand-600 hover:text-brand-700">View All</Link>
        </div>
        {recent.length === 0 ? (
          <p className="py-12 text-center text-surface-400">No submissions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-100 bg-surface-50/50">
                  {['ID', 'Submitted By', 'Customer', 'Machine', 'Date', ''].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {recent.map((s) => (
                  <tr key={s.id} className="hover:bg-brand-50/30">
                    <td className="px-6 py-4 font-medium text-brand-600">#{s.id}</td>
                    <td className="px-6 py-4">{s.full_name || s.username}</td>
                    <td className="px-6 py-4">{s.customer || '—'}</td>
                    <td className="px-6 py-4">{s.machine_type || '—'}</td>
                    <td className="px-6 py-4">{new Date(s.submitted_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <Link to={`/form/view/${s.id}`} className="btn-secondary btn-sm"><Eye className="h-3.5 w-3.5" /> View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
