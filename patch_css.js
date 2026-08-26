const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'css', 'style.css');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Remove old body-silhouette blocks entirely
css = css.replace(/\.body-silhouette\s*\{[^}]+\}/, '');
css = css.replace(/\.body-silhouette::before\s*\{[^}]+\}/, '');
css = css.replace(/\.body-silhouette::after\s*\{[^}]+\}/, '');

// 2. Add new Vitruvian Man and Media Queries at the bottom
const newCSS = `

/* --- VITRUVIAN MAN SILHOUETTE --- */
.body-silhouette {
    width: 280px;
    height: 280px;
    position: relative;
    margin: 20px auto;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect x='20' y='10' width='160' height='160' fill='none' stroke='%23D4AF37' stroke-width='1' stroke-dasharray='4' stroke-opacity='0.25'/%3E%3Ccircle cx='100' cy='100' r='90' fill='none' stroke='%23D4AF37' stroke-width='1' stroke-opacity='0.25'/%3E%3Cg fill='none' stroke='%23D4AF37' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' opacity='0.8'%3E%3Ccircle cx='100' cy='40' r='10'/%3E%3Cline x1='100' y1='50' x2='100' y2='110'/%3E%3Cline x1='85' y1='58' x2='115' y2='58'/%3E%3Cline x1='115' y1='58' x2='180' y2='58'/%3E%3Cline x1='85' y1='58' x2='20' y2='58'/%3E%3Cline x1='115' y1='58' x2='175' y2='25'/%3E%3Cline x1='85' y1='58' x2='25' y2='25'/%3E%3Cline x1='100' y1='110' x2='85' y2='175'/%3E%3Cline x1='100' y1='110' x2='115' y2='175'/%3E%3Cline x1='100' y1='110' x2='45' y2='160'/%3E%3Cline x1='100' y1='110' x2='155' y2='160'/%3E%3C/g%3E%3C/svg%3E") no-repeat center center;
    background-size: contain;
    border: none;
    box-shadow: none;
    border-radius: 0;
}

/* Adjust Point Positions to Match Vitruvian SVG */
.point-head { top: 20%; left: 50%; }
.point-heart { top: 38%; left: 50%; }
.point-hand-l { top: 30%; left: 15%; }
.point-hand-r { top: 30%; left: 85%; }
.point-soul { top: 60%; left: 50%; }
.point-shadow { top: 85%; left: 50%; }

/* Point Lines Fix */
.point-hand-l::before { left: 100%; width: 45px; }
.point-hand-r::before { right: 100%; width: 45px; }

/* --- MOBILE RESPONSIVENESS (V3 GRID) --- */
@media (max-width: 950px) {
    .divination-layout-grid-v3 {
        flex-direction: column !important;
        overflow-y: auto !important;
    }
    .div-sidebar {
        flex: 0 0 auto !important;
        width: 100% !important;
        border-right: none !important;
        border-bottom: 1px solid var(--gold-dim) !important;
        height: auto !important;
    }
    .div-col-body {
        min-height: 350px !important;
    }
    .div-col-main {
        overflow-y: visible !important;
        height: auto !important;
    }
}
`;

fs.writeFileSync(cssPath, css + newCSS);
console.log('Vitruvian & Mobile CSS Patched!');
