/**
 * main.js - CrashPath page-level JS
 *
 * Handles accessible client-side form validation and state updates.
 * Plain vanilla JS. Works on file://.
 */

(function () {
  'use strict';

  function initContactForm() {
    var form = document.getElementById('contact-page-form');
    if (!form) return;

    var successBanner = document.getElementById('contact-success-banner');

    var fields = [
      { id: 'contact-fname', required: true, type: 'text' },
      { id: 'contact-lname', required: true, type: 'text' },
      { id: 'contact-email', required: true, type: 'email' },
      { id: 'contact-phone', required: false, type: 'phone' },
      { id: 'contact-company', required: true, type: 'text' },
      { id: 'contact-service', required: true, type: 'select' },
      { id: 'contact-message', required: true, type: 'text' }
    ];

    function validateField(f) {
      var el = document.getElementById(f.id);
      if (!el) return true;

      var val = el.value.trim();
      var isValid = true;

      if (f.required) {
        if (!val) {
          isValid = false;
        } else if (f.type === 'select' && val === '') {
          isValid = false;
        }
      }

      if (val && f.type === 'email') {
        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(val)) {
          isValid = false;
        }
      }

      if (!isValid) {
        el.setAttribute('aria-invalid', 'true');
      } else {
        el.removeAttribute('aria-invalid');
      }

      return isValid;
    }

    fields.forEach(function (f) {
      var el = document.getElementById(f.id);
      if (!el) return;

      el.addEventListener('blur', function () {
        validateField(f);
      });

      el.addEventListener('input', function () {
        if (el.getAttribute('aria-invalid') === 'true') {
          validateField(f);
        }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var firstInvalidEl = null;
      var allValid = true;

      fields.forEach(function (f) {
        var valid = validateField(f);
        if (!valid) {
          allValid = false;
          if (!firstInvalidEl) {
            firstInvalidEl = document.getElementById(f.id);
          }
        }
      });

      if (!allValid && firstInvalidEl) {
        firstInvalidEl.focus();
        return;
      }

      // TODO: Connect this submission to Formspree, Netlify Forms, or backend endpoint before live launch.
      form.reset();
      fields.forEach(function (f) {
        var el = document.getElementById(f.id);
        if (el) el.removeAttribute('aria-invalid');
      });

      if (successBanner) {
        successBanner.classList.add('is-active');
        successBanner.focus();
      }
    });
  }

  function initHomeContactTeaser() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var nameEl = document.getElementById('cf-name');
      var emailEl = document.getElementById('cf-email');
      var firmEl = document.getElementById('cf-firm');
      var valid = true;

      [nameEl, emailEl, firmEl].forEach(function (input) {
        if (!input) return;
        if (!input.value.trim()) {
          input.setAttribute('aria-invalid', 'true');
          valid = false;
        } else {
          input.removeAttribute('aria-invalid');
        }
      });

      if (emailEl && emailEl.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
        emailEl.setAttribute('aria-invalid', 'true');
        valid = false;
      }

      if (!valid) return;

      // TODO: Wire to production form service
      form.reset();
      alert('Thank you for contacting CrashPath. This demo form is ready for backend integration.');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initContactForm();
      initHomeContactTeaser();
    });
  } else {
    initContactForm();
    initHomeContactTeaser();
  }

})();
