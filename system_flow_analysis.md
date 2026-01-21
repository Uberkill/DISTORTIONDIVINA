# System Flow & Architecture Analysis: Distortion Divina

## 1. Core Concept & "Lore"
The application is a **Simulated Secure Terminal** ("Distortion OS"). It breaks the fourth wall, treating the user as an "Agent" accessing a classified database.
-   **Context**: Unofficial fan project for *Project Moon* (Lobotomy Corp, Library of Ruina, Limbus Company).
-   **Goal**: Distribute/Showcase "First Light" (a physical Tarot deck).
-   **Vibe**: Cyberpunk, occult, restricted access.

## 2. Detailed User Journey Flow

### Phase 1: Initialization (The Boot Sequence)
1.  **Page Load**:
    -   `System.init()` fires on DOMContentLoaded.
    -   `#system-loader` overlay covers the screen (Spinner + "INITIALIZING SYSTEM...").
    -   `AudioManager` initializes (blocked until user interaction, handled gracefully).
    -   `Viewer3D` initializes listeners.
    -   **Result**: After 1.5 seconds, loader fades out, revealing the **Login Screen**.

### Phase 2: Authentication (The "Gate")
1.  **State**: User is at `#login-screen`.
2.  **Auto-Fill Sequence**:
    -   `startAutoLoginTimer()` begins a 10s countdown.
    -   `#auto-login-bar` animates filling capture bar.
    -   If no user interaction occurs: The system types "DISTORTIONDIVINA" into `#login-input` char-by-char, then triggers login automatically.
3.  **Manual Interaction**:
    -   User can click the "Press to Enter" button.
    -   User can type in the input box (Enter key supported).
    -   **Language Selection**: User can toggle EN/KR/JP immediately here.
4.  **Login Transition**:
    -   `System.login()` checks credentials (actually accepts anything or empty).
    -   **Audio**: Plays 'login' oscillator sound (ramp up).
    -   **Visuals**:
        -   Text changes to "ACCESS GRANTED" (Green).
        -   `#login-screen` scales up and fades out (`zoom-out` class).
        -   `#desktop-screen` fades in.
        -   **Action**: `WindowManager.open('win-overview')` is queued to open automatically.
        -   **Assistant**: `System.initAssistant()` queued (2s delay).

### Phase 3: The Desktop Experience
The user is now in the "OS". The background is a dark radial gradient with a grid.
-   **OOBOT (Assistant)**:
    -   Appears after 2s.
    -   Guide Mode: Walks user through icons step-by-step (Overview -> Employees -> Archive -> etc.).
    -   Idle Mode: Randomly "meows" or "glitches" every 20s.
    -   **Interaction**: Can be dragged around the screen.

### Phase 4: Application Usage (Windows)

#### A. Project Brief (`win-overview`)
-   **Purpose**: The "About Us" page.
-   **Key Interaction**: Image Carousel.
    -   User clicks the `brief-frame`.
    -   `System.changeBriefImage()` cycles through concept art (`JtNx9pE.jpeg`, etc.).
    -   Captions update from `data.js`.

#### B. The Archive (`win-archive`)
-   **Purpose**: The Card Gallery (Main Feature).
-   **Logic**:
    -   `System.renderGrid(sortType)`:
        -   **Default**: Shows 22 Major Arcana cards (`DB.CARDS`).
        -   **Sorting**:
            -   `[SORT: TAROT]`: By ID (0-21).
            -   `[SORT: A-Z]`: Alphabetical by localized title.
            -   `[VIEW: ALL]`: Shows all *variants* (`DB.EMPLOYEES`).
    -   **Loading Simulation**:
        -   A fake progress meter (`#archive-loader-bar`) increments as `img.onload` events fire for each card thumb.
        -   Gives a "downloading data" feel.
    -   **Card Interaction**:
        -   Clicking a Card -> Calls `openSelector(card)` or `openViewer(card)`.
        -   If multiple artists did the same card (e.g., "The Empress"), `win-selector` opens first to choose the variant.

#### C. Artifact Viewer (`win-viewer`)
-   **Visuals**: A full-screen overlay with a 3D card centered.
-   **3D Logic (`Viewer3D`)**:
    -   Listens to `mousemove` / `touchmove`.
    -   Calculates rotation based on cursor position relative to center.
    -   Applies `transform: rotateX(...) rotateY(...)` to the card container.
    -   **Zoom**: Mouse wheel or buttons adjust scale (0.5x to 3.0x).
-   **Data Display**:
    -   Shows Card Title, Illustrator, Role, and Social Links (Twitter/Insta).
    -   Loads high-res images.

#### D. Event Log (`win-shop`)
-   **Live Data**:
    -   `System.updateCountdowns()` runs every second.
    -   Calculates time remaining to `2026-02-15` (Lunatic Moonlight) and `2026-02-21` (One Million Moon).
    -   Formats as `DD D HH H MM M SS S`.

### Phase 5: System Mechanics
-   **Window Manager**:
    -   `open(id)`: Resets position if off-screen (desktop), brings to front (z-index++).
    -   `close(id)`: Hides window.
    -   `minimize(id)`: Hides but keeps "active" state logic (simulated).
    -   `toggleMaximize(id)`: Expands to full desktop area (minus taskbar).
    -   **Draggability**: Windows have header event listeners for dragging.
-   **Responsiveness**:
    -   `checkMobile()`: Toggles `.is-mobile` class on body.
    -   **Mobile Changes**: Windows are full-screen fixed. Dragging disabled/simplified. Viewer controls are larger.

## 3. Data Structure Analysis (`data.js`)
-   **Translation Architecture**:
    -   `DB.TRANSLATIONS[lang][key]` pattern.
    -   Efficient, instant switching via `System.setLanguage()`.
    -   Covers *all* UI text, including image captions and cat meows.
-   **Card Database**:
    -   Two arrays: `CARDS` (Abstract Concepts) vs `EMPLOYEES` (Concrete Implementations).
    -   Check: `EMPLOYEES` contains `cardId` to relational link back to `CARDS`.
    -   This allows one Tarot card (e.g., The Empress) to have multiple artwork interpretations (Carmen, Ryoshu) by different artists.

## 4. Key Considerations for Development
-   **State Persistence**: Currently, there is **no** persistence. Refreshing resets language to EN and the tutorial.
-   **Performance**: The "Lazy Loader" implementation is manual.
-   **Audio Context**: Browser autoplay policies might block the initial "Login" sound if the user doesn't interact first (Auto-fill login might be silent).

## 5. Conclusion
The site is a sophisticated "Static Site acting as an App". It relies heavily on DOM manipulation (no framework like React/Vue) to achieve its specific retro-terminal feel. ## 6. Low-Level System Logic

### 6.1 State Management (`System` Object)
The application state is singleton-based, managed entirely within the `System` object in `script.js`.
-   **`lang`**: Current language code (String: 'en'|'ko'|'ja'). Default 'en'.
-   **`isTutorialComplete`**: Boolean. Prevents re-triggering the OOBOT tour.
-   **`activeWindow`**: Implicitly managed via DOM (z-index sorting in `WindowManager`).
-   **`briefImgIdx`**: Integer. Tracks current slide in the Project Brief carousel.
-   **`assistantIdx`**: Integer. Tracks progress in the onboarding step array.

### 6.2 The Event Loop
The application relies on `requestAnimationFrame` for UI smoothing and standard `setInterval` for "live" features.
1.  **Clock/Signal Loop (1000ms interval)**:
    -   Updates Top Bar Clock (`#clock`).
    -   Randomizes "Ping" latency (`#sig-latency`) between 24-55ms.
    -   Generates random Hex Hash (`#enc-hash-display`) for "security" theater.
    -   Recalculates Event Countdowns (`updateCountdowns`).
2.  **Assistant Chatter Loop (20000ms interval)**:
    -   Only active if tutorial is finished.
    -   50% RNG check to trigger a passive message (`showBubble` + `meow` sound).
3.  **3D Rendering Loop**:
    -   Passive. The `Viewer3D` logic only calculates transforms on `mousemove`/`touchmove` events to conserve resources, rather than running a constant render loop.

### 6.3 Audio Synthesis Strategy
To avoid large asset downloads, all UI sounds are generated programmatically via `AudioContext` oscillators.
-   **Click**: High-pitch sine ramp (800Hz -> 300Hz).
-   **Hover**: Triangle wave blip (200Hz).
-   **Login**: Square wave ascension (200Hz -> 800Hz).
-   **Meow/Hiss**: modulated triangle/sawtooth waves.
*Constraint*: Requires user interaction (click/key) to unlock the AudioContext on modern browsers.

