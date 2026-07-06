import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Save, Palette } from 'lucide-react';
import { api } from '../api/client';
import Modal from '../components/Modal';

const emptyField = { field_number: '', section: '', label: '', options: '', sort_order: 0 };

export default function AdminFormEditor() {
  const [template, setTemplate] = useState(null);
  const [style, setStyle] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [fieldForm, setFieldForm] = useState(emptyField);
  const [saving, setSaving] = useState(false);

  const load = () => api.adminTemplate().then((t) => {
    setTemplate(t);
    setStyle(t.style_config || {});
  }).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const saveStyle = async () => {
    setSaving(true);
    try {
      await api.updateStyle(style);
      alert('Style saved!');
    } catch (e) { alert(e.message); }
    finally { setSaving(false); }
  };

  const openAdd = () => {
    setEditing(null);
    setFieldForm(emptyField);
    setModalOpen(true);
  };

  const openEdit = (field) => {
    setEditing(field);
    setFieldForm({
      field_number: field.field_number || '',
      section: field.section || '',
      label: field.label,
      options: (field.options || []).join(', '),
      sort_order: field.sort_order,
    });
    setModalOpen(true);
  };

  const saveField = async (e) => {
    e.preventDefault();
    const payload = {
      field_number: parseInt(fieldForm.field_number) || null,
      section: fieldForm.section,
      label: fieldForm.label,
      field_type: 'radio',
      options: fieldForm.options.split(',').map((s) => s.trim()).filter(Boolean),
      sort_order: parseInt(fieldForm.sort_order) || 0,
    };
    try {
      if (editing) await api.updateField(editing.id, payload);
      else await api.addField(payload);
      setModalOpen(false);
      load();
    } catch (e) { alert(e.message); }
  };

  const deleteField = async (id) => {
    if (!confirm('Delete this question?')) return;
    await api.deleteField(id);
    load();
  };

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
        <h1 className="font-display text-3xl font-bold text-surface-900">Form Editor</h1>
        <p className="mt-1 text-surface-500">Customize appearance and manage checklist questions</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Style panel */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card lg:col-span-2">
          <div className="mb-5 flex items-center gap-2">
            <Palette className="h-5 w-5 text-brand-600" />
            <h2 className="font-display text-lg font-semibold">Form Style</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">Form Title</label>
              <input className="input" value={style.form_title || ''} onChange={(e) => setStyle({ ...style, form_title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Primary Color</label>
                <input type="color" className="h-10 w-full cursor-pointer rounded-xl" value={style.primary_color || '#1e3a5f'} onChange={(e) => setStyle({ ...style, primary_color: e.target.value })} />
              </div>
              <div>
                <label className="label">Accent Color</label>
                <input type="color" className="h-10 w-full cursor-pointer rounded-xl" value={style.accent_color || '#2563eb'} onChange={(e) => setStyle({ ...style, accent_color: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Header Background</label>
              <input type="color" className="h-10 w-full cursor-pointer rounded-xl" value={style.header_bg || '#f8fafc'} onChange={(e) => setStyle({ ...style, header_bg: e.target.value })} />
            </div>
            <div>
              <label className="label">Font Family</label>
              <select className="input" value={style.font_family || 'Segoe UI, system-ui, sans-serif'} onChange={(e) => setStyle({ ...style, font_family: e.target.value })}>
                <option value="Inter, system-ui, sans-serif">Inter</option>
                <option value="Segoe UI, system-ui, sans-serif">Segoe UI</option>
                <option value="Arial, sans-serif">Arial</option>
                <option value="Georgia, serif">Georgia</option>
              </select>
            </div>
            <button onClick={saveStyle} disabled={saving} className="btn-primary w-full">
              <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Style'}
            </button>
          </div>

          {/* Preview */}
          <div className="mt-6 overflow-hidden rounded-xl border border-surface-200">
            <div className="px-4 py-3 font-semibold" style={{ background: style.header_bg, color: style.primary_color }}>
              {style.form_title || 'Preview'}
            </div>
            <div className="border-t-4 px-4 py-3" style={{ borderColor: style.accent_color }}>
              <p className="text-sm text-surface-600">Sample checklist item</p>
              <div className="mt-2 flex gap-2">
                <span className="rounded-lg px-2 py-1 text-xs text-white" style={{ background: style.accent_color }}>Working</span>
                <span className="rounded-lg bg-surface-100 px-2 py-1 text-xs text-surface-600">Not Working</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Fields list */}
        <div className="card lg:col-span-3">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Checklist Questions ({template?.fields?.length})</h2>
            <button onClick={openAdd} className="btn-primary btn-sm"><Plus className="h-4 w-4" /> Add Question</button>
          </div>

          <div className="max-h-[600px] space-y-2 overflow-y-auto">
            {template?.fields?.map((field) => (
              <div key={field.id} className="flex items-center gap-3 rounded-xl border border-surface-100 bg-surface-50/50 p-4 transition-colors hover:border-brand-200">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  {field.field_number || '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-surface-800">{field.section} — {field.label}</p>
                  <p className="mt-0.5 text-xs text-surface-400">{(field.options || []).join(' · ')}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button onClick={() => openEdit(field)} className="btn-ghost btn-sm"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => deleteField(field.id)} className="btn-ghost btn-sm text-red-500 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Question' : 'Add Question'}>
        <form onSubmit={saveField} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Item Number</label>
              <input type="number" className="input" value={fieldForm.field_number} onChange={(e) => setFieldForm({ ...fieldForm, field_number: e.target.value })} />
            </div>
            <div>
              <label className="label">Sort Order</label>
              <input type="number" className="input" value={fieldForm.sort_order} onChange={(e) => setFieldForm({ ...fieldForm, sort_order: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Section Name</label>
            <input className="input" placeholder="e.g. Machine PLC" value={fieldForm.section} onChange={(e) => setFieldForm({ ...fieldForm, section: e.target.value })} />
          </div>
          <div>
            <label className="label">Question Label</label>
            <input className="input" required placeholder="e.g. PLC Buttons" value={fieldForm.label} onChange={(e) => setFieldForm({ ...fieldForm, label: e.target.value })} />
          </div>
          <div>
            <label className="label">Options (comma-separated)</label>
            <input className="input" placeholder="Working, Not Working" value={fieldForm.options} onChange={(e) => setFieldForm({ ...fieldForm, options: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Question</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
