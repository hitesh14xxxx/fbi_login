// Script for animated login page (mock behavior)
const DEBUG = false; // set to true to enable verbose console logging
function dlog(...args) { if (DEBUG) console.log(...args); }

dlog('script.js loaded');
document.addEventListener('DOMContentLoaded', () => {
  try {
    dlog('script.js: DOMContentLoaded start');
    const form = document.getElementById('loginForm');
    dlog('script.js: got form:', !!form);
    const email = document.getElementById('email');
    dlog('script.js: got email element:', !!email);
    const password = document.getElementById('password');
    dlog('script.js: got password element:', !!password);
    const submitBtn = document.getElementById('submitBtn');
    dlog('script.js: got submitBtn:', !!submitBtn);
    const togglePass = document.getElementById('togglePass');
    dlog('script.js: got togglePass:', !!togglePass);
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const successToast = document.getElementById('successToast');
    dlog('script.js: elements initialized');

  function validate() {
    let ok = true;
    if (emailError) emailError.textContent = '';
    if (passwordError) passwordError.textContent = '';

    const emailVal = email ? email.value : '';
    const passVal = password ? password.value : '';

    if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      if (emailError) emailError.textContent = 'Please enter a valid email';
      ok = false;
    }
    if (!passVal || passVal.length < 6) {
      if (passwordError) passwordError.textContent = 'Password must be at least 6 characters';
      ok = false;
    }
    return ok;
  }

  if (togglePass) {
    togglePass.addEventListener('click', () => {
      if (!password) return;
      const type = password.type === 'password' ? 'text' : 'password';
      password.type = type;
      togglePass.textContent = type === 'password' ? 'Show' : 'Hide';
      togglePass.setAttribute('aria-label', type === 'password' ? 'Show password' : 'Hide password');
    });
  }

  if (form) {
  dlog('script.js: attaching login submit handler');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validate()) return;

      // show loading state
      if (submitBtn) submitBtn.classList.add('loading');
      if (submitBtn) submitBtn.setAttribute('aria-busy', 'true');
      const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
      if (btnText) btnText.textContent = 'Signing in...';

      // Try server authentication first, then fallback to localStorage
      const attemptServerLogin = async () => {
        try {
          const resp = await fetch('http://localhost:3000/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email: email ? email.value.trim() : '', password: password ? password.value : '' }) });
          if (resp.ok) return { ok: true, server: true, body: await resp.json() };
          const err = await resp.json().catch(() => ({}));
          return { ok: false, server: true, error: err };
        } catch (err) {
          return { ok: false, server: false, error: err };
        }
      };

      attemptServerLogin().then(result => {
        // remove loading state regardless
        if (submitBtn) submitBtn.classList.remove('loading');
        if (submitBtn) submitBtn.removeAttribute('aria-busy');
        if (btnText) btnText.textContent = 'Sign in';

        if (result.ok) {
          // success
          if (successToast) successToast.classList.add('show');
          if (successToast) setTimeout(() => successToast.classList.remove('show'), 2400);
          // animate card out
          const shell = document.querySelector('.login-shell');
          if (shell && shell.animate) {
            shell.animate([
              { transform: 'translateY(0) scale(1)', opacity: 1 },
              { transform: 'translateY(-10px) scale(.98)', opacity: 0 }
            ], { duration: 500, easing: 'cubic-bezier(.16,.8,.34,1)', fill: 'forwards' });
          }
        } else {
          // server returned error or server not available — fallback to localStorage check
          let ok = false;
          try {
            const stored = localStorage.getItem('fbi_account');
            if (stored && email && password) {
              const acct = JSON.parse(stored);
              if (acct && acct.email === email.value.trim() && acct.password === password.value) ok = true;
            }
          } catch (err) { /* ignore */ }

          if (ok) {
            if (successToast) successToast.classList.add('show');
            if (successToast) setTimeout(() => successToast.classList.remove('show'), 2400);
          } else {
            // show invalid credentials messages
            if (passwordError) passwordError.textContent = 'Invalid email or password';
          }
        }
      });
    });
  }
  dlog('script.js: after login handler');

  // small UX: press Enter on password to submit
  if (password && form) {
    password.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') form.requestSubmit();
    });
  }

  // Accessibility: show focus ring on keyboard navigation only
  function handleFirstTab(e) {
    if (e.key === 'Tab') document.body.classList.add('user-is-tabbing');
  }
  window.addEventListener('keydown', handleFirstTab, { once: true });

  // (Guide character removed)

  // --- Google login simulation ---
  const googleBtn = document.getElementById('googleBtn');
  const googleModal = document.getElementById('googleModal');
  const googleConfirm = document.getElementById('googleConfirm');
  const googleCancel = document.getElementById('googleCancel');

  if (googleBtn && googleModal && googleConfirm && googleCancel) {
    googleBtn.addEventListener('click', () => {
      googleModal.setAttribute('aria-hidden', 'false');
    });

    function closeGoogleModal() {
      googleModal.setAttribute('aria-hidden', 'true');
    }

    googleCancel.addEventListener('click', closeGoogleModal);

    googleConfirm.addEventListener('click', () => {
      // simulate selecting a Google account
      if (email) {
        email.value = 'demo@google.com';
        // focus email
        email.focus();
      }
      closeGoogleModal();

      // small delay and then auto-submit the form (mimic OAuth redirect)
      if (form) setTimeout(() => form.requestSubmit(), 700);
    });
  }

  // --- Signup form handling (if present) ---
  const signupForm = document.getElementById('signupForm');
  const signupToast = document.getElementById('signupToast');
  if (signupForm) {
    const nameInput = document.getElementById('fullName');
    const signupEmail = document.getElementById('signupEmail');
    const signupPassword = document.getElementById('signupPassword');
    const signupPassword2 = document.getElementById('signupPassword2');
    const nameError = document.getElementById('nameError');
    const signupEmailError = document.getElementById('signupEmailError');
    const signupPasswordError = document.getElementById('signupPasswordError');
    const signupPassword2Error = document.getElementById('signupPassword2Error');

    const signupBtn = document.getElementById('signupBtn');

    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;
      nameError.textContent = '';
      signupEmailError.textContent = '';
      signupPasswordError.textContent = '';
      signupPassword2Error.textContent = '';

      if (!nameInput.value.trim()) { nameError.textContent = 'Please enter your name'; ok = false; }
      if (!signupEmail.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail.value)) { signupEmailError.textContent = 'Enter a valid email'; ok = false; }
      if (!signupPassword.value || signupPassword.value.length < 6) { signupPasswordError.textContent = 'Password must be 6+ characters'; ok = false; }
      if (signupPassword2.value !== signupPassword.value) { signupPassword2Error.textContent = 'Passwords do not match'; ok = false; }
      if (!ok) return;

      // Immediately persist to localStorage so signup is saved in the browser
      let persisted = false;
      try {
        const account = { name: nameInput.value.trim(), email: signupEmail.value.trim(), password: signupPassword.value };
        localStorage.setItem('fbi_account', JSON.stringify(account));
        persisted = true;
      } catch (err) {
        persisted = false;
      }

      // Fire-and-forget server POST to persist remotely if available
      (async () => {
        try {
          await fetch('http://localhost:3000/signup', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name: nameInput.value.trim(), email: signupEmail.value.trim(), password: signupPassword.value }) });
        } catch (e) {
          // ignore server errors; localStorage already saved the account
        }
      })();

      if (persisted) {
        // set a flag so the login page shows the thanks/loading overlay
        try { sessionStorage.setItem('signup_thanks', '1'); } catch (e) {}
        // animate the signup button before redirecting
        if (signupBtn) {
          signupBtn.classList.add('fade-redirect', 'anim');
          setTimeout(() => { if (signupBtn) signupBtn.classList.remove('anim'); }, 520);
        }

        // show success toast
        if (signupToast) {
          setTimeout(() => {
            if (signupToast) signupToast.classList.add('show');
            setTimeout(() => { if (signupToast) signupToast.classList.remove('show'); }, 1600);
          }, 320);
        }

        // redirect to sign in after a short delay
        setTimeout(() => { window.location.href = 'index.html'; }, 1000);
      } else {
        signupEmailError.textContent = 'Could not save account to local storage.';
      }
    });
  }

  // Autofill sign-in email if account exists in localStorage
  (async () => {
    // try server first
    try {
      const resp = await fetch('http://localhost:3000/account');
      if (resp.ok) {
        const body = await resp.json();
        if (body && body.email && email) email.value = body.email;
        return;
      }
    } catch (e) {
      // server not available
    }

    // fallback to localStorage
    try {
      const stored = localStorage.getItem('fbi_account');
      if (stored) {
        const acct = JSON.parse(stored);
        if (acct && acct.email && email) email.value = acct.email;
      }
    } catch (err) { /* ignore */ }
  })();

  // show signup thanks overlay if redirected from signup
  try {
    const overlay = document.getElementById('signupOverlay');
    if (sessionStorage.getItem('signup_thanks') === '1' && overlay) {
      overlay.setAttribute('aria-hidden', 'false');
      // reset progress
      const fill = document.getElementById('overlayProgress');
      if (fill) { fill.style.width = '0%'; /* force reflow */ void fill.offsetWidth; }
      overlay.classList.add('show');
      // clear flag so it doesn't show again
      sessionStorage.removeItem('signup_thanks');
      // hide after 1s (progress completes)
      setTimeout(() => { if (overlay) { overlay.classList.remove('show'); overlay.setAttribute('aria-hidden', 'true'); } }, 1000);
    }
  } catch (e) {
    console.error('Error inside DOMContentLoaded handler:', e && e.stack ? e.stack : e);
    // don't rethrow to avoid uncaught exceptions breaking the page
  }
  } catch (err) {
    console.error('Unhandled error in DOMContentLoaded wrapper:', err && err.stack ? err.stack : err);
  }
});

// global error listener to capture any uncaught errors and log them with context
window.addEventListener('error', (ev) => {
  try {
    console.error('Global error captured:', ev.message, ev.filename + ':' + ev.lineno + ':' + ev.colno, ev.error && ev.error.stack ? ev.error.stack : ev.error);
  } catch (e) {
    console.error('Error while logging global error', e);
  }
});

// capture unhandled promise rejections
window.addEventListener('unhandledrejection', (ev) => {
  try {
    console.error('Unhandled promise rejection:', ev.reason);
  } catch (e) {
    console.error('Error while logging unhandled rejection', e);
  }
});
