import { DB } from './data.js';
import { EventBus } from './event_bus.js';
import { I18n } from './i18n.js';

export const EmployeeSystem = {
    init() {
        // Re-render when language changes
        EventBus.subscribe('language-changed', () => {
            this.renderEmployees();
        });
    },

    renderEmployees() {
        const tbody = document.getElementById('employee-list-body');
        if (!tbody) return;
        tbody.innerHTML = '';
        
        const lang = I18n.getCurrentLang();
        
        if (DB.EMPLOYEES.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--gold-dim); font-family:monospace;">NO EMPLOYEES FOUND</td></tr>`;
            return;
        }

        DB.EMPLOYEES.forEach(emp => {
            const tr = document.createElement('tr'); 
            tr.innerHTML = `
                <td data-label="${I18n.get('th_no')}">${emp.no}</td>
                <td data-label="${I18n.get('th_card')}" class="text-truncate" style="max-width:120px;">${emp.card}</td>
                <td data-label="${I18n.get('th_char')}" class="text-truncate" style="max-width:150px;">${emp.char[lang] || emp.char.en}</td>
                <td data-label="${I18n.get('th_emp')}" class="text-truncate" style="max-width:120px;">${emp.artist}</td>
                <td data-label="${I18n.get('th_pen')}">${emp.pen}</td>
                <td><span class="role-badge text-truncate" style="display:inline-block; max-width:100px; vertical-align:bottom;">${emp.role[lang] || emp.role.en}</span></td>
            `;
            tbody.appendChild(tr);
        });
    }
};
