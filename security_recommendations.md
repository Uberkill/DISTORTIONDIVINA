# Security Recommendations: Distortion Divina

## 1. Context & Threat Model
Your current site is **Static** (Index.html + JS). This means everything is delivered to the user's browser.
*   **The Reality**: You cannot hide secrets (like passwords or high-res image URLs) on a purely static site. A determined user can always "Inspect Element" to find them.
*   **The Goal**: We should focus on **Deterrence** (stopping casual snooping), **Asset Protection** (preventing hotlinking), and **Immersion** (making the "security" feel real).

## 2. Immediate Recommendations (Static Site)

### 2.1 "Password" Obfuscation
Currently, the login code is visible in plain text in `script.js`:
```javascript
const code = "DISTORTIONDIVINA"; // Easily readable
```
**Recommendation**:
*   **Hash the Password**: Store a SHA-256 hash of the password in the code, not the password itself. When the user types input, hash it and compare the hashes.
*   **Minification**: Minify your `script.js` to make it harder to read casual logic.
*   *Note*: This doesn't stop a hacker, but it stops a random user from just reading the variable name.

### 2.2 Content Security Policy (CSP)
To prevent malicious scripts (XSS) from running if you ever add dynamic inputs or if a user finds a way to inject code via the URL.
**Recommendation**: Add this `<meta>` tag to your `<head>`:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' https://placehold.co; script-src 'self' https://unpkg.com; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com;">
```
*   This tells the browser: "Only load scripts/images from MY domain and these specific trusted sources."

### 2.3 Asset Protection (Hotlink Protection)
Since you are likely hosting on Vercel (based on `vercel.json`), people might try to link your images directly on their own sites, stealing your bandwidth.
**Recommendation**: Configure `vercel.json` to block hotlinking.
```json
{
  "headers": [
    {
      "source": "/images/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```
*   *Advanced*: You can check the `Referer` header in Vercel Edge Middleware to block requests coming from other domains.

## 3. "Theatrical" Security (Immersion)
Since this is a simulated OS, we can add features that *feel* secure, enhancing the vibe.

### 3.1 Intrusion Countermeasures
*   **Lockout logic**: If a user enters the wrong password 3 times:
    *   Play a loud "Access Denied" alarm sound.
    *   Lock the input for 60 seconds with a countdown.
    *   Flash a red "IP LOGGED" warning (fake, of course).
*   **Console Warning**: Add a script that detects if the DevTools console is open and prints a spooky warning:
    ```javascript
    console.log("%c STOP! %c This is a restricted government terminal.", "color: red; font-size: 40px", "color: white; font-size: 20px");
    ```

## 4. Future Backend Security (If you add a Store/Accounts)

### 4.1 Authentication
If you move to a backend (Node.js/Python), **never** roll your own crypto.
*   **Use Auth Providers**: Clerk, Auth0, or Firebase Auth.
*   **Session Management**: Use `HttpOnly` cookies, never `localStorage` for session tokens (vulnerable to XSS).

### 4.2 Rate Limiting
Prevent users from spamming your "Contact" or "Interest Check" forms.
*   **Implementation**: Use a service like Cloudflare to automatically block bots spamming requests.

## 5. Implementation Plan
1.  **Phase 1 (Easy)**: Add CSP Meta tag and Console Warning.
2.  **Phase 2 (Medium)**: Implement Client-Side Hashing for the login code.
3.  **Phase 3 (Fun)**: Build the "Wrong Password" lockout system for immersion.
