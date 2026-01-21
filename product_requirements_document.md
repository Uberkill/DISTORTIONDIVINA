# Product Requirements Document: Distortion Divina (Distortion Corp Secure Terminal)

## 1. Executive Summary
**Distortion Divina** is a web-based interactive experience serving as the digital hub for an unofficial fan project inspired by *Project Moon* and *Mili*. The primary goal is to showcase and distribute a physical Tarot card game titled "First Light".

The website is designed as an immersive "Secure Terminal" (Distortion OS), simulating a desktop operating system environment. It features a diegetic UI with windows, file systems, and audio-visual effects that mirror the aesthetic of the source material.

## 2. Product Objectives
-   **Immersion**: Provide a highly thematic, "in-universe" experience for fans.
-   **Showcase**: Display high-quality card illustrations and artist credits.
-   **Information**: Inform users about upcoming offline events and acquisition methods.
-   **Localization**: Support a global fanbase with English, Korean, and Japanese translations.

## 3. User Experience (UX) & Interface Strategy

### 3.1 The "Distortion OS" Theme
-   **Visual Language**: High-contrast dark mode (`#050505` bg), Gold (`#D4AF37`) primary accents, Terminal Green (`#33ff00`) for success/system states.
-   **Atmosphere**: CRT scanlines, vignette, localized glitch effects, and "holographic" UI elements.
-   **Audio**: Generative Web Audio API sound effects for clicks, hovers, logins, and system alerts.

### 3.2 Navigation Structure
-   **Login Screen**:
    -   Thematic entry point.
    -   "Typing" auto-fill animation for immersion.
    -   Language selection (EN / KR / JP).
-   **Desktop Environment**:
    -   **Taskbar**: System menu, window toggles, signal/latency widgets.
    -   **Desktop Icons**: Draggable, clickable shortcuts to "apps" (Windows).
    -   **Window Management**: Windows can be opened, closed, minimized, maximized, and dragged. Z-index handling simulates depth.

### 3.3 Key Applications (Windows)
| Window ID | Name | Purpose |
| :--- | :--- | :--- |
| `win-overview` | **Project Brief** | General intro, mission statement, "First Light" pack info. |
| `win-archive` | **Archive DB** | The core gallery. Displays cards in a grid. Supports sorting by Tarot number or Name. |
| `win-viewer` | **Artifact Viewer** | A detail view for cards. unique **3D Card Viewer** that allows users to rotate cards in 3D space using mouse/touch drag. |
| `win-selector` | **Variant Selector** | Handles cases where one card ID has multiple variants (e.g., different artists). |
| `win-employees`| **Employee DB** | Credits list for artists and contributors, mapped to specific cards/roles. |
| `win-shop` | **Event Log** | Lists offline events (e.g., Lunatic Moonlight, One Million Moon) and online store status. |
| `win-comm` | **Communication** | Social links (Twitter, Discord, Email). |
| `win-settings` | **System Settings**| Language toggles, UI scaling (Normal/Large). |
| `win-interest` | **Interest Check** | Link to external form for print run estimation. |

### 3.4 Assistant (OOBOT)
-   **Character**: A cat-themed AI assistant ("OOBOT").
-   **Function**: Guided tour for first-time users (Onboarding).
-   **Behavior**: Idle chatter (random "meow" lines), drag-able avatar.

## 4. Technical Architecture

### 4.1 Stack
-   **Core**: Vanilla HTML5, CSS3, JavaScript (ES6+).
-   **Dependencies**:
    -   `lucide` (via CDN) for icons.
    -   Google Fonts (`Cinzel`, `Share Tech Mono`, `Noto Sans`).
-   **Build System**: None apparent (raw file structure). Hosted likely on Vercel (`vercel.json` present).

### 4.2 Data Management
-   **Static Data (`data.js`)**:
    -   `DB.TRANSLATIONS`: Key-value pairs for i18n.
    -   `DB.CARDS`: Master list of Tarot cards (Major Arcana 0-21).
    -   `DB.EMPLOYEES`: Master list of specific card implementation (variants) and artist credits.
-   **Runtime Logic (`script.js`)**:
    -   `System` object orchestrates initialization and state.
    -   `WindowManager` handles DOM manipulation for UI windows.
    -   `Viewer3D` manages CSS3D transforms for the card viewer.
    -   `AudioManager` synthesizes sound on the fly (no external audio files).

## 5. Mobile vs Desktop
-   **Desktop**: Full window management, draggable windows, 3D hover effects.
-   **Mobile**:
    -   Windows force-maximize or adapt to full width.
    -   Simplified "Touch to Enter" flow.
    -   Specific "Mobile View" toggle available.
    -   Viewer adapts zoom/control layout.

## 6. Questions & Clarifications

1.  **Online Store Logic**: The "Online Store" event currently says "Coming Soon". Is there a plan to integrate a real cart/checkout system, or will this link to an external provider (like Shopify/BigCartel)?
2.  **Interest Check Form**: The current button connects to `#`. Do you have the external Google Form/Typeform URL ready to insert?
3.  **Backend Requirements**: Currently, the site is 100% static. Are there any features (like dynamic stock counters or user accounts) that would require a backend later?
4.  **Asset Hosting**: Images are local (`./images/`). As the gallery grows, do we need to consider a CDN or lazy-loading strategy beyond the current basic IntersectionObserver?
5.  **Employee Data**: `DB.EMPLOYEES` links to Twitter/Instagram. Are there plans to add more robust profiles for the artists?

## 7. Future Roadmap (Inferred)
-   **Phase 1**: "First Light" (Current) - Proof of concept, offline sales.
-   **Phase 2**: Online Store opening.
-   **Phase 3**: Full deck release? (Currently only Major Arcana seem populated/planned).
