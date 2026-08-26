const fs = require('fs');
const cssPath = 'css/style.css';
let css = fs.readFileSync(cssPath, 'utf8');

// Remove old Vitruvian Man CSS completely to start fresh
css = css.replace(/\/\* --- VITRUVIAN MAN SILHOUETTE --- \*\/[\s\S]*?(?=\/\* --- MOBILE RESPONSIVENESS \(V3 GRID\) --- \*\/)/, '');

// A much higher quality Constellation/Sacred Geometry Vitruvian Man
// and vastly improved UI spacing.
const newCSS = `/* --- VITRUVIAN MAN SILHOUETTE --- */
/* --- HIERARCHY & SPACING FIXES --- */
.divination-layout-grid-v3 {
    height: 100% !important;
    gap: 30px; /* Add breathing room between sidebar and main */
    padding: 20px; /* Outer padding */
    box-sizing: border-box;
}

.div-sidebar {
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid var(--gold-dim) !important; /* Encase the sidebar elegantly */
    border-radius: 8px;
}

.div-col-body {
    padding: 30px 20px; /* More room */
}

.div-col-text {
    padding: 30px 25px;
    border-top: 1px solid rgba(212, 175, 55, 0.2);
}

.div-col-main {
    padding: 10px 20px 50px 20px;
}

.divination-top-panel {
    gap: 15px; /* Space out the card slots */
}

.ego-meter-container {
    margin: 40px 0; /* Huge breathing room for the EGO meter */
}

/* --- THE VITRUVIAN CONSTELLATION --- */
.body-silhouette {
    width: 260px;
    height: 260px;
    position: relative;
    margin: 0 auto;
    /* A mystical, sacred-geometry inspired Vitruvian blueprint */
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3C!-- Outer Geometry --%3E%3Ccircle cx='100' cy='100' r='95' fill='none' stroke='%23D4AF37' stroke-width='0.5' stroke-dasharray='2 4' stroke-opacity='0.4'/%3E%3Crect x='15' y='15' width='170' height='170' fill='none' stroke='%23D4AF37' stroke-width='0.5' stroke-opacity='0.3' transform='rotate(45 100 100)'/%3E%3Crect x='15' y='15' width='170' height='170' fill='none' stroke='%23D4AF37' stroke-width='0.5' stroke-opacity='0.3'/%3E%3C!-- The Body Constellation Paths --%3E%3Cg fill='none' stroke='%23D4AF37' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' opacity='0.7'%3E%3C!-- Head Diamond --%3E%3Cpolygon points='100,10 110,25 100,40 90,25'/%3E%3C!-- Spine/Core --%3E%3Cline x1='100' y1='40' x2='100' y2='150'/%3E%3C!-- Shoulders/Heart Triangle --%3E%3Cpolygon points='100,80 60,60 140,60'/%3E%3C!-- Arms Outstretched (Square) --%3E%3Cline x1='60' y1='60' x2='20' y2='60'/%3E%3Cline x1='140' y1='60' x2='180' y2='60'/%3E%3C!-- Arms Raised (Circle) --%3E%3Cline x1='60' y1='60' x2='30' y2='25'/%3E%3Cline x1='140' y1='60' x2='170' y2='25'/%3E%3C!-- Pelvis Diamond --%3E%3Cpolygon points='100,110 115,130 100,150 85,130'/%3E%3C!-- Legs Straight (Square) --%3E%3Cline x1='85' y1='130' x2='85' y2='190'/%3E%3Cline x1='115' y1='130' x2='115' y2='190'/%3E%3C!-- Legs Spread (Circle) --%3E%3Cline x1='85' y1='130' x2='30' y2='180'/%3E%3Cline x1='115' y1='130' x2='170' y2='180'/%3E%3C/g%3E%3C/svg%3E") no-repeat center center;
    background-size: contain;
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
}

/* EXACT ALIGNMENT TO THE NEW SVG */
.point-head { top: 12.5%; left: 50%; }
.point-heart { top: 40%; left: 50%; }
.point-hand-l { top: 30%; left: 10%; }
.point-hand-r { top: 30%; left: 90%; }
.point-soul { top: 60%; left: 50%; }
.point-shadow { top: 95%; left: 50%; }

/* Hand connecting lines disabled as the SVG constellation handles the connective tissue elegantly */
.point-hand-l::before, .point-hand-r::before { display: none !important; }

`;

fs.writeFileSync(cssPath, css.replace(/\/\* --- MOBILE RESPONSIVENESS \(V3 GRID\) --- \*\//, newCSS + '\n/* --- MOBILE RESPONSIVENESS (V3 GRID) --- */'));
console.log('Design Patched!');
