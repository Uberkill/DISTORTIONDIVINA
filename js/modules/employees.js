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
            tr.innerHTML = \<td data-label="\">\</td><td data-label="\">\</td><td data-label="\">\</td><td data-label="\">\</td><td data-label="\">\</td><td><span class="role-badge">\</span></td>\;
            tbody.appendChild(tr);
        });
    }
};
