import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

function groupBySection(fields) {
  const groups = {};
  fields.forEach((f) => {
    const key = f.section || 'General';
    if (!groups[key]) groups[key] = [];
    groups[key].push(f);
  });
  return groups;
}

export function ChecklistColumn({ fields, answers, onChange, readOnly = false }) {
  const groups = groupBySection(fields);

  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([section, sectionFields], gi) => (
        <motion.div
          key={section}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: gi * 0.05 }}
          className="overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-card"
        >
          <div className="bg-gradient-to-r from-brand-700 to-brand-600 px-4 py-2.5">
            <h4 className="text-sm font-semibold text-white">
              {sectionFields[0].field_number}. {section}
            </h4>
          </div>
          <div className="divide-y divide-surface-100">
            {sectionFields.map((field) => {
              const isCheckbox = field.field_type === 'checkbox' && (field.options || []).length === 1;
              const hideLabel = isCheckbox || field.label === section;

              return (
              <div key={field.id} className="px-4 py-3">
                {!hideLabel && !readOnly && (
                  <p className="mb-2 text-sm font-medium text-surface-700">{field.label}</p>
                )}
                {readOnly ? (
                  <span className="badge-blue">{answers[field.id] || '—'}</span>
                ) : isCheckbox ? (
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={answers[field.id] === 'Check'}
                      onChange={(e) => onChange(field.id, e.target.checked ? 'Check' : '')}
                      className="h-4 w-4 rounded border-surface-300 text-brand-600"
                    />
                    {field.label}
                  </label>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(field.options || []).map((opt) => {
                      const selected = answers[field.id] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => onChange(field.id, opt)}
                          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                            selected
                              ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm'
                              : 'border-surface-200 bg-surface-50 text-surface-600 hover:border-brand-300'
                          }`}
                        >
                          {selected && <CheckCircle2 className="h-3.5 w-3.5" />}
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );})}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function splitFieldsIntoColumns(fields, split = [6, 14, 20]) {
  const col1 = fields.filter((f) => f.field_number <= split[0]);
  const col2 = fields.filter((f) => f.field_number > split[0] && f.field_number <= split[1]);
  const col3 = fields.filter((f) => f.field_number > split[1]);
  return [col1, col2, col3];
}
