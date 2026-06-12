// ============================================
// SHARED THEME TOGGLE — dark by default
// ============================================

(function () {
  'use strict';

  var STORAGE_KEY = 'portfolio-theme';
  var DARK = 'dark';
  var LIGHT = 'light';

  function getStoredTheme() {
    try {
      var value = localStorage.getItem(STORAGE_KEY);
      return value === LIGHT || value === DARK ? value : null;
    } catch (error) {
      return null;
    }
  }

  function storeTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      // Ignore storage failures in restricted environments.
    }
  }

  function applyTheme(theme) {
    var body = document.body;
    if (!body) return;

    body.classList.toggle('theme-light', theme === LIGHT);
    body.setAttribute('data-theme', theme);

    var toggleButtons = document.querySelectorAll('[data-theme-toggle]');
    toggleButtons.forEach(function (button) {
      button.setAttribute('aria-pressed', String(theme === LIGHT));
      button.textContent = theme === LIGHT ? 'Switch To Dark' : 'Switch To Light';
    });
  }

  function initThemeToggle() {
    var initialTheme = getStoredTheme() || DARK;
    applyTheme(initialTheme);

    var toggleButtons = document.querySelectorAll('[data-theme-toggle]');
    toggleButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var nextTheme = document.body.classList.contains('theme-light') ? DARK : LIGHT;
        applyTheme(nextTheme);
        storeTheme(nextTheme);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeToggle);
  } else {
    initThemeToggle();
  }
})();