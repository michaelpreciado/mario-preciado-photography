/**
 * main.js — bootstrap.
 *
 * Loaded as a module, so it's deferred by default and runs after the document
 * is parsed. Nothing here is required for the page to be readable: the gallery
 * is real markup in index.html, so with JS disabled or broken the site still
 * shows every photograph, the copy, and a working contact form.
 *
 * No libraries. With no build step every dependency would be another CDN
 * round-trip in front of a page whose entire pitch is a fast, clean first
 * impression — and everything here is a few lines of IntersectionObserver and
 * one rAF loop.
 *
 * Debug: append ?debug to the URL.
 */

import { initDebug } from './debug.js';
import { initBoot, initNav, initProgress, initCursor, initParallax } from './chrome.js';
import { initReveals, initImages, initCount } from './work.js';
import { initForm } from './form.js';

function boot() {
  initDebug();

  // Everything below is independent — one failure must not take the rest of
  // the page with it, so each is isolated.
  const steps = [initNav, initProgress, initCursor, initParallax, initReveals, initImages, initCount, initForm];

  for (const step of steps) {
    try {
      step();
    } catch (err) {
      console.error(`[mp] ${step.name} failed:`, err);
    }
  }

  // Boot overlay runs last and awaits the hero, so it never delays wiring.
  initBoot().catch((err) => {
    console.error('[mp] boot failed:', err);
    document.getElementById('boot')?.remove();
    document.body.style.overflow = '';
  });

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
