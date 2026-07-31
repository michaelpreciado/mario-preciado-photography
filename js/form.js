/**
 * form.js — Formspree submission.
 *
 * Endpoint, honeypot and the async-fetch flow are carried over unchanged from
 * the previous build; only the presentation is new.
 */

export function initForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const ok = document.getElementById('form-ok');
  const err = document.getElementById('form-err');
  const button = form.querySelector('button[type="submit"]');
  const label = form.querySelector('.form__label');
  const original = label?.textContent ?? 'Send';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Honeypot: a real person never fills this in, so bail silently rather
    // than telling a bot which check it failed.
    if (form.querySelector('[name="_gotcha"]')?.value) return;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    ok.hidden = true;
    err.hidden = true;
    button.disabled = true;
    if (label) label.textContent = 'Sending…';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) throw new Error(`Formspree responded ${res.status}`);

      form.reset();
      ok.hidden = false;
      ok.focus?.();
    } catch {
      err.hidden = false;
    } finally {
      button.disabled = false;
      if (label) label.textContent = original;
    }
  });
}
