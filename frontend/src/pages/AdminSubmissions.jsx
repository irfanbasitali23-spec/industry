import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye } from 'lucide-react';
import { api } from '../api/client';

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminSubmissions().then((data) => {
      setSubmissions(data);
      setFiltered(data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(submissions.filter((s) =>
      (s.customer || '').toLowerCase().includes(q) ||
      (s.machine_type || '').toLowerCase().includes(q) ||
      (s.serial_no || '').toLowerCase().includes(q) ||
      (s.full_name || '').toLowerCase().includes(q) ||
      (s.username || '').toLowerCase().includes(q)
    ));
  }, [search, submissions]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-surface-900">All Submissions</h1>
        <p className="mt-1 text-surface-500">{submissions.length} total inspection reports</p>
      </div>

      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          <input
            className="input pl-11"
            placeholder="Search by customer, machine, serial no, user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card overflow-hidden !p-0">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-16 text-center text-surface-400">No submissions found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-100 bg-surface-50/50">
                  {['ID', 'User', 'Customer', 'Contact', 'Machine', 'Serial', 'Date', 'Submitted', ''].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filtered.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-brand-50/30">
                    <td className="px-5 py-3.5 font-medium text-brand-600">#{s.id}</td>
                    <td className="px-5 py-3.5">{s.full_name || s.username}</td>
                    <td className="px-5 py-3.5">{s.customer || '—'}</td>
                    <td className="px-5 py-3.5">{s.contact_person || '—'}</td>
                    <td className="px-5 py-3.5">{s.machine_type || '—'}</td>
                    <td className="px-5 py-3.5 font-mono text-xs">{s.serial_no || '—'}</td>
                    <td className="px-5 py-3.5">{s.inspection_date || '—'}</td>
                    <td className="px-5 py-3.5 text-surface-500">{new Date(s.submitted_at).toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <Link to={`/form/view/${s.id}`} className="btn-secondary btn-sm">
                        <Eye className="h-3.5 w-3.5" /> View
                      </Link>
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
