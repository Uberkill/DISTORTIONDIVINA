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
            tr.innerHTML = `<td data-label="${I18n.get('th_id')}">${emp.id}</td><td data-label="${I18n.get('th_name')}">${emp.charName[lang] || emp.charName.en}</td><td data-label="${I18n.get('th_dept')}">${emp.department[lang] || emp.department.en}</td><td data-label="${I18n.get('th_rank')}">${emp.rank}</td><td data-label="${I18n.get('th_status')}">${emp.status[lang] || emp.status.en}</td><td><span class="role-badge">${I18n.get('role_agent')}</span></td>`;
            tbody.appendChild(tr);
        });
    }
};
