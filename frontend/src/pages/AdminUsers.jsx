import { useEffect, useState } from 'react';
import { Plus, Pencil, UserX } from 'lucide-react';
import { api } from '../api/client';
import Modal from '../components/Modal';

const emptyUser = { username: '', email: '', full_name: '', password: '', role: 'user' };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyUser);

  const load = () => api.getUsers().then(setUsers).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyUser); setModalOpen(true); };

  const openEdit = (user) => {
    setEditing(user);
    setForm({ username: user.username, email: user.email, full_name: user.full_name || '', password: '', role: user.role, is_active: user.is_active });
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        const payload = { email: form.email, full_name: form.full_name, role: form.role, is_active: form.is_active };
        if (form.password) payload.password = form.password;
        await api.updateUser(editing.id, payload);
      } else {
        await api.createUser(form);
      }
      setModalOpen(false);
      load();
    } catch (e) { alert(e.message); }
  };

  const deactivate = async (id) => {
    if (!confirm('Deactivate this user?')) return;
    await api.deactivateUser(id);
    load();
  };

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-900">User Management</h1>
          <p className="mt-1 text-surface-500">{users.length} registered accounts</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus className="h-4 w-4" /> Add User</button>
      </div>

      <div className="card overflow-hidden !p-0">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-100 bg-surface-50/50">
                  {['ID', 'Username', 'Email', 'Name', 'Role', 'Status', 'Created', ''].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {users.map((u) => (
                  <tr key={u.id} className={`transition-colors hover:bg-brand-50/30 ${!u.is_active ? 'opacity-50' : ''}`}>
                    <td className="px-5 py-3.5">{u.id}</td>
                    <td className="px-5 py-3.5 font-medium">{u.username}</td>
                    <td className="px-5 py-3.5">{u.email}</td>
                    <td className="px-5 py-3.5">{u.full_name || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={u.role === 'admin' ? 'badge-amber' : 'badge-blue'}>{u.role}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={u.is_active ? 'badge-green' : 'badge-red'}>{u.is_active ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="px-5 py-3.5 text-surface-500">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(u)} className="btn-ghost btn-sm"><Pencil className="h-3.5 w-3.5" /></button>
                        {u.is_active && (
                          <button onClick={() => deactivate(u.id)} className="btn-ghost btn-sm text-red-500 hover:bg-red-50">
                            <UserX className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit User' : 'Add User'}>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="label">Username</label>
            <input className="input" required disabled={!!editing} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Full Name</label>
            <input className="input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div>
            <label className="label">Password {editing && <span className="text-surface-400">(leave blank to keep)</span>}</label>
            <input type="password" className="input" required={!editing} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {editing && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              Active account
            </label>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save User</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
