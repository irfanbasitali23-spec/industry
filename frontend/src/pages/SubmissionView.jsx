import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import FormPrintTemplate from '../components/FormPrintTemplate';

export default function SubmissionView() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const backLink = isAdmin ? '/admin/submissions' : '/dashboard';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSubmission(id).then(setData).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!data) return <p className="text-center text-surface-500">Submission not found</p>;

  const { submission, fields, answers, style_config } = data;

  return (
    <div>
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link to={backLink} className="inline-flex items-center gap-1 text-sm text-surface-500 hover:text-brand-600">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <button onClick={() => window.print()} className="btn-primary">
          <Printer className="h-4 w-4" /> Print Form
        </button>
      </div>

      <FormPrintTemplate
        submission={submission}
        fields={fields}
        answers={answers}
        styleConfig={style_config}
      />
    </div>
  );
}
