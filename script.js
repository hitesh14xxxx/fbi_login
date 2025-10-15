// Script for animated login page (mock behavior)
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const submitBtn = document.getElementById('submitBtn');
  const togglePass = document.getElementById('togglePass');
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const successToast = document.getElementById('successToast');

  function validate() {
    let ok = true;
    emailError.textContent = '';
    passwordError.textContent = '';

    if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      emailError.textContent = 'Please enter a valid email';
      ok = false;
    }
    if (!password.value || password.value.length < 6) {
      passwordError.textContent = 'Password must be at least 6 characters';
      ok = false;
    }
    return ok;
  }

  togglePass.addEventListener('click', () => {
    const type = password.type === 'password' ? 'text' : 'password';
    password.type = type;
    togglePass.textContent = type === 'password' ? 'Show' : 'Hide';
    togglePass.setAttribute('aria-label', type === 'password' ? 'Show password' : 'Hide password');
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate()) return;

    // show loading state
    submitBtn.classList.add('loading');
    submitBtn.setAttribute('aria-busy', 'true');
    const btnText = submitBtn.querySelector('.btn-text');
    btnText.textContent = 'Signing in...';

    // Try server authentication first, then fallback to localStorage
    const attemptServerLogin = async () => {
      try {
        const resp = await fetch('http://localhost:3000/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email: email.value.trim(), password: password.value }) });
        if (resp.ok) return { ok: true, server: true, body: await resp.json() };
        const err = await resp.json().catch(() => ({}));
        return { ok: false, server: true, error: err };
      } catch (err) {
        return { ok: false, server: false, error: err };
      }
    };

    attemptServerLogin().then(result => {
      // remove loading state regardless
      submitBtn.classList.remove('loading');
      submitBtn.removeAttribute('aria-busy');
      btnText.textContent = 'Sign in';

      if (result.ok) {
        // success
        successToast.classList.add('show');
        setTimeout(() => successToast.classList.remove('show'), 2400);
        // animate card out
        const shell = document.querySelector('.login-shell');
        shell.animate([
          { transform: 'translateY(0) scale(1)', opacity: 1 },
          { transform: 'translateY(-10px) scale(.98)', opacity: 0 }
        ], { duration: 500, easing: 'cubic-bezier(.16,.8,.34,1)', fill: 'forwards' });
      } else {
        // server returned error or server not available — fallback to localStorage check
        let ok = false;
        try {
          const stored = localStorage.getItem('fbi_account');
          if (stored) {
            const acct = JSON.parse(stored);
            if (acct && acct.email === email.value.trim() && acct.password === password.value) ok = true;
          }
        } catch (err) { /* ignore */ }

        if (ok) {
          successToast.classList.add('show');
          setTimeout(() => successToast.classList.remove('show'), 2400);
        } else {
          // show invalid credentials messages
          passwordError.textContent = 'Invalid email or password';
        }
      }
    });
  });

  // small UX: press Enter on password to submit
  password.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') form.requestSubmit();
  });

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
      email.value = 'demo@google.com';
      // focus email so guide points there
      email.focus();
      closeGoogleModal();

      // small delay and then auto-submit the form (mimic OAuth redirect)
      setTimeout(() => form.requestSubmit(), 700);
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

      // Try to persist to server; if server not available, fallback to localStorage
      (async () => {
        let persisted = false;
        try {
          const resp = await fetch('http://localhost:3000/signup', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name: nameInput.value.trim(), email: signupEmail.value.trim(), password: signupPassword.value }) });
          if (resp.ok) persisted = true;
        } catch (err) {
          // server not reachable, fallback
        }

        if (!persisted) {
          try {
            const account = { name: nameInput.value.trim(), email: signupEmail.value.trim(), password: signupPassword.value };
            localStorage.setItem('fbi_account', JSON.stringify(account));
            persisted = true;
          } catch (err) { persisted = false; }
        }

        if (persisted) {
          // set a flag so the login page shows the thanks/loading overlay
          try { sessionStorage.setItem('signup_thanks', '1'); } catch (e) {}
          // animate the signup button before redirecting
          if (signupBtn) {
            signupBtn.classList.add('fade-redirect', 'anim');
            setTimeout(() => signupBtn.classList.remove('anim'), 520);
          }

          // show success toast
          if (signupToast) {
            setTimeout(() => {
              signupToast.classList.add('show');
              setTimeout(() => signupToast.classList.remove('show'), 1600);
            }, 320);
          }

          // redirect to sign in after a short delay
          setTimeout(() => { window.location.href = 'index.html'; }, 1000);
        } else {
          // couldn't persist
          signupEmailError.textContent = 'Could not save account (server/storage error)';
        }
      })();
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
      setTimeout(() => { overlay.classList.remove('show'); overlay.setAttribute('aria-hidden', 'true'); }, 1000);
    }
  } catch (e) {}
});
