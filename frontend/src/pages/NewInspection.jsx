import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, ArrowLeft } from 'lucide-react';
import { api } from '../api/client';
import { ChecklistColumn, splitFieldsIntoColumns } from '../components/ChecklistColumn';
import SignaturePad from '../components/SignaturePad';

const FOOTER_OPTS = ['Warranty', 'Contract', 'Invoice', 'Rental', 'F.O.C'];

export default function NewInspection() {
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState({});
  const [form, setForm] = useState({
    customer: '', contact_person: '', inspection_date: new Date().toISOString().split('T')[0],
    machine_type: '', serial_no: '', machine_status: '', action_taken: '', remarks: '',
    engineer_name: '', customer_name: '', time_in: '', time_out: '',
  });
  const [footerOptions, setFooterOptions] = useState({});

  const engineerSigRef = useRef(null);
  const customerSigRef = useRef(null);

  useEffect(() => {
    api.getTemplate().then(setTemplate).finally(() => setLoading(false));
  }, []);

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const handleAnswer = (fieldId, value) => setAnswers((a) => ({ ...a, [fieldId]: value }));

  const toggleFooter = (opt) => {
    setFooterOptions((prev) => ({ ...prev, [opt]: !prev[opt] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        engineer_signature: engineerSigRef.current?.isEmpty?.() === false
          ? engineerSigRef.current.toDataURL('image/png') : null,
        customer_signature: customerSigRef.current?.isEmpty?.() === false
          ? customerSigRef.current.toDataURL('image/png') : null,
        footer_options: footerOptions,
        answers,
      };
      const result = await api.submitForm(payload);
      navigate(`/form/view/${result.id}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  const split = template?.style_config?.column_split || [6, 14, 20];
  const [col1, col2, col3] = splitFieldsIntoColumns(template?.fields || [], split);
  const title = template?.style_config?.form_title || 'Preventive Care Visit';

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/dashboard" className="mb-2 inline-flex items-center gap-1 text-sm text-surface-500 hover:text-brand-600">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <h1 className="font-display text-3xl font-bold text-surface-900">{title}</h1>
          <p className="text-surface-500">Complete all sections and sign digitally</p>
        </div>
        <button type="submit" disabled={submitting} className="btn-primary">
          <Save className="h-4 w-4" />
          {submitting ? 'Submitting...' : 'Submit Inspection'}
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card mb-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { key: 'customer', label: 'Customer', ph: 'Customer name' },
            { key: 'contact_person', label: 'Contact Person', ph: 'Contact person' },
            { key: 'inspection_date', label: 'Date', type: 'date' },
          ].map((f) => (
            <div key={f.key}>
              <label className="label">{f.label}</label>
              <input
                type={f.type || 'text'}
                className="input"
                placeholder={f.ph}
                value={form[f.key]}
                onChange={(e) => handleChange(f.key, e.target.value)}
              />
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            { key: 'machine_type', label: 'Machine Type', ph: 'e.g. UN140EPIII PET' },
            { key: 'serial_no', label: 'Sr. No', ph: 'Serial number' },
          ].map((f) => (
            <div key={f.key}>
              <label className="label">{f.label}</label>
              <input className="input" placeholder={f.ph} value={form[f.key]} onChange={(e) => handleChange(f.key, e.target.value)} />
            </div>
          ))}
        </div>
      </motion.div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <ChecklistColumn fields={col1} answers={answers} onChange={handleAnswer} />
        <ChecklistColumn fields={col2} answers={answers} onChange={handleAnswer} />
        <ChecklistColumn fields={col3} answers={answers} onChange={handleAnswer} />
      </div>

      {['machine_status', 'action_taken', 'remarks'].map((key, i) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * i }}
          className="card mb-4"
        >
          <label className="label capitalize">{key.replace(/_/g, ' ')}</label>
          <textarea
            className="input min-h-[80px] resize-y"
            rows={3}
            value={form[key]}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder={`Enter ${key.replace(/_/g, ' ')}...`}
          />
        </motion.div>
      ))}

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <SignaturePad
          label="Engineer Signature / Name"
          nameValue={form.engineer_name}
          onNameChange={(v) => handleChange('engineer_name', v)}
          sigRef={engineerSigRef}
        />
        <SignaturePad
          label="Customer Signature / Name"
          nameValue={form.customer_name}
          onNameChange={(v) => handleChange('customer_name', v)}
          sigRef={customerSigRef}
        />
      </div>

      <div className="card mb-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Time In</label>
            <input type="time" className="input" value={form.time_in} onChange={(e) => handleChange('time_in', e.target.value)} />
          </div>
          <div>
            <label className="label">Time Out</label>
            <input type="time" className="input" value={form.time_out} onChange={(e) => handleChange('time_out', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <label className="label mb-3">Service Type</label>
        <div className="flex flex-wrap gap-4">
          {FOOTER_OPTS.map((opt) => (
            <label key={opt} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!footerOptions[opt]}
                onChange={() => toggleFooter(opt)}
                className="h-4 w-4 rounded border-surface-300 text-brand-600"
              />
              {opt}
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Link to="/dashboard" className="btn-secondary">Cancel</Link>
        <button type="submit" disabled={submitting} className="btn-primary">
          <Save className="h-4 w-4" />
          {submitting ? 'Submitting...' : 'Submit Inspection'}
        </button>
      </div>
    </form>
  );
}
