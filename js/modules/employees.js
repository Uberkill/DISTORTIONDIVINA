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
        
        DB.EMPLOYEES.forEach(emp => {
            const tr = document.createElement('tr'); 
            tr.innerHTML = `<td data-label="${I18n.get('th_no')}">${emp.no}</td><td data-label="${I18n.get('th_card')}">${emp.card}</td><td data-label="${I18n.get('th_char')}">${emp.char[lang] || emp.char.en}</td><td data-label="${I18n.get('th_emp')}">${emp.artist}</td><td data-label="${I18n.get('th_pen')}">${emp.pen}</td><td><span class="role-badge">${emp.role[lang] || emp.role.en}</span></td>`;
            tbody.appendChild(tr);
        });
    }
};
