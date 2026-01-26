# Security Recommendations: Distortion Divina

## 1. Context & Threat Model
Your current site is **Static** (Index.html + JS). This means everything is delivered to the user's browser.
*   **The Reality**: You cannot hide secrets (like passwords or high-res image URLs) on a purely static site. A determined user can always "Inspect Element" to find them.
*   **The Goal**: We should focus on **Deterrence** (stopping casual snooping), **Asset Protection** (preventing hotlinking), and **Immersion** (making the "security" feel real).

## 2. Immediate Recommendations (Static Site)

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

### 4.2 Rate Limiting
Prevent users from spamming your "Contact" or "Interest Check" forms.
*   **Implementation**: Use a service like Cloudflare to automatically block bots spamming requests.

