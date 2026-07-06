let formTemplate = null;

function applyFormStyle(style) {
    if (!style) return;
    const root = document.documentElement;
    if (style.primary_color) root.style.setProperty('--primary', style.primary_color);
    if (style.accent_color) {
        root.style.setProperty('--accent', style.accent_color);
        root.style.setProperty('--accent-hover', style.accent_color);
    }
    if (style.font_family) document.body.style.fontFamily = style.font_family;
    if (style.form_title) {
        const title = document.getElementById('formTitle');
        if (title) title.textContent = style.form_title;
    }
}

function renderChecklist(fields) {
    const col1 = [], col2 = [], col3 = [];
    fields.forEach(f => {
        if (f.field_number <= 9) col1.push(f);
        else if (f.field_number <= 18) col2.push(f);
        else col3.push(f);
    });

    function renderColumn(items) {
        const grouped = {};
        items.forEach(item => {
            if (!grouped[item.section]) grouped[item.section] = [];
            grouped[item.section].push(item);
        });

        const sections = Object.entries(grouped).map(([section, sectionFields]) => {
            const num = sectionFields[0].field_number;
            const fieldsHtml = sectionFields.map(f => `
                <div class="checklist-item">
                    <span class="item-label">${f.label}</span>
                    <div class="radio-group">
                        ${(f.options || []).map(opt => `
                            <label class="radio-option">
                                <input type="radio" name="field_${f.id}" value="${opt}">
                                ${opt}
                            </label>
                        `).join('')}
                    </div>
                </div>
            `).join('');

            return `
                <div class="checklist-section">
                    <div class="section-header">${num}. ${section}</div>
                    ${fieldsHtml}
                </div>
            `;
        }).join('');

        return `<div class="checklist-column">${sections}</div>`;
    }

    return renderColumn(col1) + renderColumn(col2) + renderColumn(col3);
}

async function initInspectionForm() {
    const res = await apiFetch('/api/forms/template');
    if (!res) return;
    formTemplate = await res.json();

    applyFormStyle(formTemplate.style_config);
    document.getElementById('checklistColumns').innerHTML = renderChecklist(formTemplate.fields);

    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.querySelector('[name="inspection_date"]');
    if (dateInput) dateInput.value = today;

    initSignaturePads();

    document.getElementById('inspectionForm').addEventListener('submit', handleSubmit);
}

async function handleSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.textContent = 'Submitting...';

    const form = e.target;
    const formData = new FormData(form);

    const answers = {};
    formTemplate.fields.forEach(f => {
        const selected = form.querySelector(`input[name="field_${f.id}"]:checked`);
        if (selected) answers[f.id] = selected.value;
    });

    const payload = {
        customer: formData.get('customer'),
        contact_person: formData.get('contact_person'),
        inspection_date: formData.get('inspection_date'),
        machine_type: formData.get('machine_type'),
        serial_no: formData.get('serial_no'),
        machine_status: formData.get('machine_status'),
        action_taken: formData.get('action_taken'),
        remarks: formData.get('remarks'),
        engineer_name: formData.get('engineer_name'),
        customer_name: formData.get('customer_name'),
        engineer_signature: signaturePads.engineerSig?.toDataURL(),
        customer_signature: signaturePads.customerSig?.toDataURL(),
        answers,
    };

    try {
        const res = await apiFetch('/api/forms/submit', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        if (!res) return;
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Submission failed');
        }
        const data = await res.json();
        showToast('Inspection submitted successfully!', 'success');
        setTimeout(() => window.location.href = `/form/view/${data.id}`, 1000);
    } catch (err) {
        showToast(err.message, 'error');
        btn.disabled = false;
        btn.textContent = 'Submit Inspection';
    }
}
