# MenuQRCode

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)

## 📖 Overview

**MenuQRCode** is a simple web app that allows restaurants (or any food service) to host their digital menu online and provide a QR code for customers to scan and access the menu. It helps minimize contact, paper printing, and enables quick updates.

## 🧩 Features

- Web‑based menu display (food items, images, descriptions, prices)  
- QR code generation / redirect to menu page  
- Easy to set up (static hosting friendly)  
- Minimal dependencies (HTML, CSS, JavaScript)  
- Customizable styling  

## 📂 Repository Structure

```
MenuQRCode/
├── config/  
├── images/  
├── netlify/functions/  
├── pdf/  
├── index.html  
├── menu.html  
├── netlify.toml  
├── package.json  
├── package-lock.json  
├── script.js  
├── style.css  
├── _redirects  
└── README.md
```

- `config/` — configuration files (e.g. menu data)  
- `images/` — image assets for menu items  
- `netlify/functions/` — serverless functions (if any backend logic)  
- `pdf/` — optional PDF menu generation  
- `index.html` — landing / home page  
- `menu.html` — the actual menu display page  
- `netlify.toml` / `_redirects` — settings for Netlify deployment  
- `script.js` / `style.css` — front-end logic and styling  
- `package.json` / `package-lock.json` — dependencies & scripts  

## 🚀 Getting Started

### Prerequisites

- Node.js (for local server, builds, or functions)  
- (Optional) Netlify CLI or account (if deploying via Netlify)
- Github Personal Authentication Token is also required
- The Admin Id and Password is set using the Encrypted version of Sha 256, to Decrypt just use the online decrypter

### Local Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/The-Oterra/MenuQRCode.git
   cd MenuQRCode
   ```

2. Install dependencies (if any):

   ```bash
   npm install
   ```

3. Run a local server (if scripts provided or using a static‑server):

   ```bash
   npm start
   ```

4. Open `index.html` or `menu.html` in browser (or via the local server) to preview.

### Deploying

You can deploy to any static hosting provider (Netlify, Vercel, GitHub Pages, etc.). If using Netlify:

- Make sure `netlify.toml` and `_redirects` are configured correctly  
- Push the repo  
- Link site in Netlify dashboard  
- The deployed URL will serve your menu & QR code  

## 🔧 Customization

- **Menu content**: Edit JSON or config files in `config/`  
- **Images**: Add or replace images in `images/`  
- **Styling**: Modify `style.css`  
- **Scripts / behavior**: Modify `script.js`  
- **PDF menu** (if used): Adjust the logic in `netlify/functions/` or elsewhere  

## 🛡️ License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

## 🙋 Contributions & Issues

Contributions, bug reports, and feature requests are welcome. Please open an issue or pull request.

---

> Developed by The-Oterra
> Abhishek B, IT Department (15th Jun 2025 to 30th Sep 2025)
> Contact: +91 8526502006 for the Code hosting
