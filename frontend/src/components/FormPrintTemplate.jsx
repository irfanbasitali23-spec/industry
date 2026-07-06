import './FormPrintTemplate.css';

function CheckBox({ checked, label }) {
  return (
    <span className="pf-check-row">
      <span className={`pf-checkbox ${checked ? 'checked' : ''}`} />
      <span>{label}</span>
    </span>
  );
}

function RadioOption({ selected, label }) {
  return (
    <span className="pf-radio-item">
      <span className={`pf-checkbox ${selected ? 'checked' : ''}`} />
      <span>{label}</span>
    </span>
  );
}

function groupBySection(fields) {
  const groups = [];
  const seen = new Map();
  fields.forEach((f) => {
    const key = `${f.field_number}-${f.section}`;
    if (!seen.has(key)) {
      seen.set(key, { number: f.field_number, section: f.section, items: [] });
      groups.push(seen.get(key));
    }
    seen.get(key).items.push(f);
  });
  return groups.sort((a, b) => a.number - b.number);
}

function SectionBlock({ group, answers }) {
  return (
    <div className="pf-section">
      <div className="pf-section-title">
        {group.number}. {group.section}
      </div>
      <div className="pf-section-body">
        {group.items.map((field) => {
          const answer = answers[field.id];
          const opts = field.options || [];

          if (field.field_type === 'checkbox' && opts.length === 1 && opts[0] === 'Check') {
            return (
              <CheckBox key={field.id} checked={answer === 'Check'} label={field.label} />
            );
          }

          if (opts.length <= 1) {
            return (
              <CheckBox key={field.id} checked={!!answer} label={field.label} />
            );
          }

          return (
            <div key={field.id}>
              {group.items.length > 1 && field.label !== group.section && (
                <div className="pf-check-row" style={{ fontWeight: 600 }}>{field.label}</div>
              )}
              <div className="pf-radio-group">
                {opts.map((opt) => (
                  <RadioOption key={opt} selected={answer === opt} label={opt} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function splitColumns(fields, split = [6, 14, 20]) {
  return [
    fields.filter((f) => f.field_number <= split[0]),
    fields.filter((f) => f.field_number > split[0] && f.field_number <= split[1]),
    fields.filter((f) => f.field_number > split[1]),
  ];
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const FOOTER_OPTS = ['Warranty', 'Contract', 'Invoice', 'Rental', 'F.O.C'];

const OFFICES = [
  {
    title: 'Head Office',
    lines: ['Office # 1, 1st Floor, Al-Hafeez Tower,', 'MM Alam Road Gulberg III, Lahore, Pakistan', 'Tel: +92-42-35757891-4', 'Email: info@dgtechmachinery.com'],
  },
  {
    title: 'Karachi Office',
    lines: ['Office # 303, 3rd Floor, Saima Jinnah Icon,', 'Main Shahrah-e-Faisal Karachi, Pakistan', 'Tel: +92-21-34302051-2', 'Email: info@dgtechmachinery.com'],
  },
  {
    title: 'Islamabad Office',
    lines: ['Office # 4, 2nd Floor, Al-Rehman Trade Center,', 'G-11 Markaz Islamabad, Pakistan', 'Tel: +92-51-4860061-2', 'Email: info@dgtechmachinery.com'],
  },
  {
    title: 'China Office',
    lines: ['Room 401, Building 1, No. 88 Jinshan Road,', 'Yuyao City, Zhejiang Province, China', 'Tel: +86-574-62631999', 'Email: info@dgtechmachinery.com'],
  },
];

export default function FormPrintTemplate({ submission, fields, answers, styleConfig = {} }) {
  const split = styleConfig.column_split || [6, 14, 20];
  const [col1, col2, col3] = splitColumns(fields, split);
  const title = styleConfig.form_title || 'Preventive Care Visit';
  const company = styleConfig.company_name || 'DG TECH MACHINERY';
  const footerOpts = submission.footer_options || {};

  const renderCol = (colFields) => (
    <div className="pf-col">
      {groupBySection(colFields).map((group) => (
        <SectionBlock key={`${group.number}-${group.section}`} group={group} answers={answers} />
      ))}
    </div>
  );

  return (
    <div className="paper-form">
      {/* Header */}
      <div className="pf-header">
        <div className="pf-logo-dg">
          <div className="dg-main">{company.split(' ').slice(0, 2).join(' ')}</div>
          <div className="dg-main">{company.split(' ').slice(2).join(' ') || 'MACHINERY'}</div>
          <div className="dg-sub">Injection Molding Machines & Auxiliary Equipment</div>
        </div>
        <div className="pf-title-box">{title}</div>
        <div className="pf-header-right">
          <div className="pf-partner-logos">
            <div className="sound">SOUND</div>
            <div className="since">Since 1955</div>
            <div className="sml" style={{ marginTop: 4 }}>SML</div>
            <div className="since">Since 1994</div>
          </div>
          <div className="pf-qr">QR<br />Code</div>
        </div>
      </div>

      {/* Customer info */}
      <div className="pf-meta">
        <div className="pf-field">
          <label>Customer:</label>
          <span className="pf-value">{submission.customer || ''}</span>
        </div>
        <div className="pf-field">
          <label>Contact Person:</label>
          <span className="pf-value">{submission.contact_person || ''}</span>
        </div>
        <div className="pf-field">
          <label>Date:</label>
          <span className="pf-value">{formatDate(submission.inspection_date)}</span>
        </div>
      </div>
      <div className="pf-meta-row2">
        <div className="pf-field">
          <label>Machine Type:</label>
          <span className="pf-value">{submission.machine_type || ''}</span>
        </div>
        <div className="pf-field">
          <label>Sr. No:</label>
          <span className="pf-value">{submission.serial_no || ''}</span>
        </div>
      </div>

      {/* Checklist */}
      <div className="pf-checklist">
        {renderCol(col1)}
        {renderCol(col2)}
        {renderCol(col3)}
      </div>

      {/* Machine Status / Action / Remarks */}
      <div className="pf-text-section">
        <label>Machine Status:</label>
        <div className="pf-text-content">{submission.machine_status || ''}</div>
      </div>
      <div className="pf-text-section">
        <label>Action Taken:</label>
        <div className="pf-text-content">{submission.action_taken || ''}</div>
      </div>
      <div className="pf-text-section">
        <label>Remarks:</label>
        <div className="pf-text-content">{submission.remarks || ''}</div>
      </div>

      {/* Signatures */}
      <div className="pf-signatures">
        <div className="pf-sig-block">
          <label>Engr. Signature/ Name</label>
          <div className="pf-sig-name">{submission.engineer_name || ''}</div>
          {submission.engineer_signature && (
            <img src={submission.engineer_signature} alt="Engineer signature" />
          )}
        </div>
        <div className="pf-time-field">
          <label>Time In</label>
          <span className="pf-value">{submission.time_in || ''}</span>
        </div>
        <div className="pf-time-field">
          <label>Time Out</label>
          <span className="pf-value">{submission.time_out || ''}</span>
        </div>
        <div className="pf-sig-block">
          <label>Customer sign/Name</label>
          <div className="pf-sig-name">{submission.customer_name || ''}</div>
          {submission.customer_signature && (
            <img src={submission.customer_signature} alt="Customer signature" />
          )}
        </div>
      </div>

      {/* Footer checkboxes */}
      <div className="pf-footer-options">
        {FOOTER_OPTS.map((opt) => (
          <span key={opt} className="pf-footer-opt">
            <span className={`pf-checkbox ${footerOpts[opt] ? 'checked' : ''}`} />
            {opt}
          </span>
        ))}
      </div>

      {/* Office addresses */}
      <div className="pf-offices">
        {OFFICES.map((office) => (
          <div key={office.title} className="pf-office">
            <strong>{office.title}</strong>
            {office.lines.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
        ))}
      </div>
      <div className="pf-contact-bar">
        <span>www.dgtechmachinery.com</span>
        <span>info@dgtechmachinery.com</span>
      </div>
    </div>
  );
}

export { splitColumns, groupBySection };
