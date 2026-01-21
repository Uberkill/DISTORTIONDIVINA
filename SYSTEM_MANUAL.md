# DISTORTION DIVINA // SYSTEM MANUAL (v1.0)
*For Authorized Personnel Only*

## 1. System Architecture overview
The "Distortion Divina" site is a **Static Web Application** explicitly designed to mimic a high-security OS terminal.
*   **Hosting**: Vercel (Edge Network).
*   **Core Logic**: Vanilla JavaScript (`js/script.js`). No frameworks.
*   **State Management**: `js/data.js` acts as the read-only database (Translations, Cards, Employees).

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

## 3. Optimization & Offline Mode (Service Worker)
The site operates as a **Progressive Web App (PWA)** using a custom Service Worker.

### 3.1 The Architecture
*   **File**: `/sw.js` (Located at Root for full scope control).
*   **Strategy**: **Cache-First**. The site loads instantly from the user's device on return visits.
*   **Network Usage**: Zero requests to Vercel for core files (`index.html`, `style.css`, `script.js`) once cached.

### 3.2 Key Configurations
*   **`index.html`**: Cached on Edge for 24h (`stale-while-revalidate`).
*   **`sw.js`**: **NEVER CACHED**. Must be checked by the browser on every visit to detect updates.

## 4. CRITICAL: Maintenance & Updates
**How to Deploy Changes Correctly**

Because the site is cached on users' devices, **they will not see your updates** unless you tell the Service Worker to update.

### The Application Update Workflow:
1.  **Make Code Changes**: Edit your HTML, CSS, or JS as usual.
2.  **Versioning**: Open `/sw.js`.
3.  **Increment Version**: Change `const CACHE_NAME = 'distortion-os-v1';` to `v2`, `v3`, etc.
    *   *If you forget this step, users will stay on the old version forever.*
4.  **Deploy**: Push to GitHub.

### User Experience during Update:
1.  User visits site -> Service Worker detects new `sw.js` (byte difference).
2.  New Worker installs in background.
3.  `js/script.js` detects the new worker and shows the **"SYSTEM UPDATE AVAILABLE"** toast.
4.  User clicks toast -> Page reloads -> New version active.

## 5. Troubleshooting
*   **Local Testing**: Service Workers fail on `file://`. Use `python -m http.server 8080`.
*   **Force Reset**: If you break the cache loop locally, use `Ctrl+Shift+R` to force a hard reload or "Unregister" the SW in DevTools > Application.
