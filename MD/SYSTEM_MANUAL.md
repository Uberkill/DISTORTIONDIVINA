# DISTORTION DIVINA // SYSTEM MANUAL (v1.0)
*For Authorized Personnel Only*

## 1. System Architecture overview
The "Distortion Divina" site is a **Static Web Application** explicitly designed to mimic a high-security OS terminal.
*   **Hosting**: Vercel (Edge Network).
*   **Core Logic**: Vanilla JavaScript (`js/script.js`). No frameworks.
*   **State Management**: `js/data.js` acts as the read-only database (Translations, Cards, Employees).

## 1.1 Architecture Upgrade: ES Modules
Version 3 uses modern **ES Modules** (`<script type="module">`).
*   **The Constraint (CORS)**: You cannot open `index.html` directly from your hard drive (`file://` protocol). Modern browsers block modules in this mode for security. You **MUST** use a local server (like the provided `RUN_SITE.bat` or `npx http-server`).
*   **The Benefit**: Logic is definitively split into `system.js`, `audio.js`, and `windows.js`. This prevents "spaghetti code," improves maintainability, and allows for cleaner, safer variable scoping (no global variable collisions).

## 2. Security Protocols
We employ a "Defense in Depth" strategy, mixing real web security with theatrical immersion.

### 2.1 Hardened Headers (`vercel.json`)
These headers enforce strict rules on modern browsers:
*   **Content Security Policy (CSP)**: Whitelists specific sources (Google Fonts, Lucide Icons). Blocks unauthorized script injection.
*   **Permissions Policy**: Explicitly denies access to Camera, Microphone, and Location.
*   **HSTS**: Enforces HTTPS.

### 2.2 Theatrical Security (`js/script.js`)
Client-side scripts designed to maintain the "Secure Terminal" illusion:
*   **Input Lockdown**: Disables Right-Click (`contextmenu`) and DevTools shortcuts (F12, Ctrl+Shift+I).
*   **Violation Feedback**: Triggers a "Security Toast" and plays a hiss sound if users attempt to inspect the code.
*   **Console Warnings**: Displays a stylized government warning in the browser console.

### 2.3 Visual Immersion
To reinforce the "Physical Terminal" metaphor, we utilize specific CSS techniques:
*   **Window Animations**: `@keyframes windowOpen` creates a CRT-style "turn on" effect (scale + opacity) for every popup.
*   **Custom Scrollbars**: `::-webkit-scrollbar` is styled to match the terminal's golden/dark theme, replacing the default browser OS scrollbars to maintain immersion.

### 3.1 The Architecture
*   **File**: `/sw.js` (Located at Root for full scope control).
*   **Strategy**: **Cache-First**. The site loads instantly from the user's device on return visits.
*   **Network Usage**: Zero requests to Vercel for core files (`index.html`, `style.css`, `script.js`) once cached.

## 4. CRITICAL: Maintenance & Updates
**How to Deploy Changes Correctly**

## 5. Troubleshooting
*   **Local Testing**: Service Workers fail on `file://`. Use `python -m http.server 8080`.
*   **Force Reset**: If you break the cache loop locally, use `Ctrl+Shift+R` to force a hard reload or "Unregister" the SW in DevTools > Application.
