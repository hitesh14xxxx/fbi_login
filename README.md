Animated Login Page

A small, accessible, animated login page implemented with plain HTML, CSS, and JavaScript.

Files
- index.html — the page markup
- styles.css — styles and animations
- script.js — client-side form validation and mock submit flow

Run
Open `index.html` in any modern browser (double-click or use a local server).

Notes
- This is a static demo with mock submit (no backend). The form validates email and password length, shows a loading state, and a success toast.
- Accessibility: labels, aria-live for errors, and reduced-motion support are included.

Customizing
- Change colors in `:root` in `styles.css`.
- Hook the form submit to your backend by replacing the fake timeout in `script.js` with a fetch/XHR call.
