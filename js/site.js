(function () {
  /* ---------- toast notifications ---------- */
  function ensureToastStack() {
    let stack = document.getElementById('toastStack');
    if (!stack) {
      stack = document.createElement('div');
      stack.id = 'toastStack';
      stack.className = 'toast-stack';
      document.body.appendChild(stack);
    }
    return stack;
  }
  window.showToast = function (message, type) {
    type = type === 'error' ? 'error' : 'success';
    const stack = ensureToastStack();
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.setAttribute('role', type === 'error' ? 'alert' : 'status');
    const iconName = type === 'success' ? 'check' : 'close';
    const msg = document.createElement('span');
    msg.className = 'msg';
    msg.textContent = message;
    const icon = document.createElement('i');
    icon.className = 'icon';
    icon.setAttribute('data-icon', iconName);
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-toast';
    closeBtn.setAttribute('aria-label', 'Dismiss');
    closeBtn.innerHTML = '&times;';
    el.appendChild(icon);
    el.appendChild(msg);
    el.appendChild(closeBtn);
    stack.appendChild(el);
    window.renderIcons && window.renderIcons(el);
    let removed = false;
    const remove = () => {
      if (removed) return;
      removed = true;
      el.classList.add('out');
      setTimeout(() => el.remove(), 250);
    };
    closeBtn.addEventListener('click', remove);
    setTimeout(remove, 6000);
  };

  /* ---------- smart form: offline check, inline validation, try/catch send ---------- */
  function attachSmartForm(form, buildMailto, opts) {
    opts = opts || {};

    const getFieldMsg = (input) => {
      const field = input.closest('.field');
      const label = field && field.querySelector('label')
        ? field.querySelector('label').textContent.replace(/\*/g, '').trim()
        : 'This field';

      if (input.hasAttribute('required') && (!input.value || !input.value.trim())) {
        return label + ' is required.';
      }
      if (input.validity.typeMismatch && input.type === 'email') {
        return 'Please enter a valid email address.';
      }
      if (input.validity.patternMismatch || input.validity.tooShort) {
        return 'Please enter a valid value.';
      }
      return label + ' is required.';
    };

    const clearError = (input) => {
      input.classList.remove('is-invalid');
      const field = input.closest('.field');
      if (field) {
        field.classList.remove('has-error');
        const customTrigger = field.querySelector('.custom-select-trigger');
        if (customTrigger) customTrigger.classList.remove('is-invalid');
        const err = field.querySelector('.error-text');
        if (err) err.remove();
      }
    };

    const setError = (input, msg) => {
      input.classList.add('is-invalid');
      const field = input.closest('.field');
      if (field) {
        field.classList.add('has-error');
        const customTrigger = field.querySelector('.custom-select-trigger');
        if (customTrigger) customTrigger.classList.add('is-invalid');
        let err = field.querySelector('.error-text');
        if (!err) {
          err = document.createElement('span');
          err.className = 'error-text';
          field.appendChild(err);
        }
        err.textContent = msg;
      }
    };

    // Real-time clearance of errors when user types or changes input
    form.querySelectorAll('input, select, textarea').forEach((input) => {
      input.addEventListener('input', () => {
        if (input.checkValidity() && (!input.hasAttribute('required') || input.value.trim() !== '')) {
          clearError(input);
        }
      });
      input.addEventListener('change', () => {
        if (input.checkValidity() && (!input.hasAttribute('required') || input.value.trim() !== '')) {
          clearError(input);
        }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if ('onLine' in navigator && !navigator.onLine) {
        window.showToast("You're offline — check your connection and try again.", 'error');
        return;
      }

      let firstInvalid = null;
      const controls = Array.from(form.elements).filter((el) => {
        return ['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName) && el.type !== 'submit' && el.type !== 'button';
      });

      controls.forEach((input) => {
        const isMissing = input.hasAttribute('required') && (!input.value || !input.value.trim());
        const isInvalid = isMissing || !input.checkValidity();
        const customTrigger = input.closest('.field')?.querySelector('.custom-select-trigger');

        if (isInvalid) {
          const msg = getFieldMsg(input);
          setError(input, msg);
          if (!firstInvalid) firstInvalid = customTrigger || input;
        } else {
          clearError(input);
        }
      });

      if (firstInvalid) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        window.showToast('Please fill in all marked required fields to proceed.', 'error');
        return;
      }

      try {
        const mailto = buildMailto(new FormData(form), form);
        if (!mailto) throw new Error('No mailto link produced');
        // TODO: replace this mailto hand-off with a real API call to push
        // straight into your CRM once that integration is ready.
        window.location.href = mailto;
        window.showToast(opts.successMessage || "Thanks — your email app should open with everything pre-filled. Just hit send.", 'success');
        form.reset();
        controls.forEach(clearError);
        form.querySelectorAll('.custom-select-box').forEach((box) => {
          const select = box.previousElementSibling;
          if (select && select.tagName === 'SELECT') {
            const label = box.querySelector('.custom-select-label');
            if (label) label.textContent = select.options[select.selectedIndex]?.text || '';
            box.querySelectorAll('.custom-select-option').forEach((o, i) => {
              o.classList.toggle('selected', i === select.selectedIndex);
              o.setAttribute('aria-selected', i === select.selectedIndex ? 'true' : 'false');
            });
          }
        });
        opts.onSuccess && opts.onSuccess();
      } catch (err) {
        window.showToast("Something went wrong sending that. Please call us directly on +971 50 739 9015.", 'error');
      }
    });
  }
  window.attachSmartForm = attachSmartForm;

  /* ---------- site survey modal ---------- */
  const surveyModal = document.getElementById('surveyModal');
  if (surveyModal) {
    const openTriggers = document.querySelectorAll('[data-open-survey]');
    const closeBtn = document.getElementById('surveyModalClose');
    let lastFocused = null;
    const openModal = (e) => {
      if (e) e.preventDefault();
      lastFocused = document.activeElement;
      surveyModal.classList.add('open');
      surveyModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      const first = surveyModal.querySelector('input, select, textarea');
      first && first.focus();
    };
    const closeModal = () => {
      surveyModal.classList.remove('open');
      surveyModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      lastFocused && lastFocused.focus && lastFocused.focus();
    };
    openTriggers.forEach((b) => b.addEventListener('click', openModal));
    closeBtn && closeBtn.addEventListener('click', closeModal);
    surveyModal.addEventListener('mousedown', (e) => {
      if (e.target === surveyModal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && surveyModal.classList.contains('open')) closeModal();
    });

    const surveyForm = document.getElementById('surveyForm');
    if (surveyForm) {
      attachSmartForm(
        surveyForm,
        (fd) => {
          const lines = [
            'Name: ' + (fd.get('name') || ''),
            'Company: ' + (fd.get('company') || ''),
            'Phone: ' + (fd.get('phone') || ''),
            'Email: ' + (fd.get('email') || ''),
            'Site location: ' + (fd.get('emirate') || ''),
            'Preferred date: ' + (fd.get('date') || '(no preference)'),
            '',
            'What needs surveying:',
            fd.get('details') || '(not provided)',
          ].join('\n');
          const subject = 'Site Survey Request — ' + (fd.get('name') || 'New enquiry');
          return 'mailto:service@minaxielectrical.ae?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines);
        },
        {
          successMessage: 'Thanks — your email app should open with the survey request ready to send.',
          onSuccess: () => setTimeout(closeModal, 900),
        }
      );
    }
  }

  /* ---------- mobile nav ---------- */
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('mainNav');
  const headerEl = document.querySelector('header.site');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      if (headerEl) nav.style.top = headerEl.getBoundingClientRect().bottom + 'px';
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.innerHTML = '';
      const i = document.createElement('i');
      i.className = 'icon';
      i.setAttribute('data-icon', open ? 'close' : 'menu');
      toggle.appendChild(i);
      window.renderIcons && window.renderIcons(toggle);
    });
    nav.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      })
    );
  }

  /* ---------- footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  /* ---------- project track-record filter ---------- */
  const filterBar = document.getElementById('filters');
  const rows = document.querySelectorAll('#projRows tr');
  const countEl = document.getElementById('rowCount');
  if (filterBar && rows.length) {
    const setCount = (n) => {
      if (countEl) countEl.textContent = n + (n === 1 ? ' project' : ' projects');
    };
    filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-f]');
      if (!btn) return;
      filterBar.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      const f = btn.getAttribute('data-f');
      let shown = 0;
      rows.forEach((r) => {
        const match = f === 'all' || r.getAttribute('data-s') === f;
        r.style.display = match ? '' : 'none';
        if (match) shown++;
      });
      setCount(shown);
    });
    setCount(rows.length);
  }

  /* ---------- count-up stat numbers ---------- */
  const countTargets = document.querySelectorAll('.hf-tile b, .stats-strip .stat b');
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (countTargets.length && !reduceMotion) {
    const parseNum = (text) => {
      const m = text.trim().match(/^([\d][\d,]*)(.*)$/);
      if (!m) return null;
      const target = parseInt(m[1].replace(/,/g, ''), 10);
      if (isNaN(target)) return null;
      return { target, prefix: '', suffix: m[2] };
    };
    const animate = (el) => {
      const parsed = parseNum(el.textContent);
      if (!parsed) return;
      const { target, suffix } = parsed;
      const start = target > 100 ? target - 40 : 0;
      const duration = 1100;
      const t0 = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - t0) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = Math.round(start + (target - start) * eased);
        el.textContent = val + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target + suffix;
      };
      requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window) {
      const cio = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animate(entry.target);
              cio.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      countTargets.forEach((el) => cio.observe(el));
    }
  }

  /* ---------- contact form ---------- */
  const form = document.getElementById('enquiry');
  if (form && window.attachSmartForm) {
    window.attachSmartForm(
      form,
      (fd) => {
        const need = (fd.get('need') || '').trim();
        const name = (fd.get('name') || '').trim();
        const company = (fd.get('company') || '').trim();
        const lines = [
          'Name: ' + name,
          'Company: ' + company,
          'Email: ' + (fd.get('email') || ''),
          'Phone: ' + (fd.get('phone') || ''),
          'Site location: ' + (fd.get('emirate') || ''),
          'What can we help with: ' + (need || '(not selected)'),
          'Equipment make and rating: ' + (fd.get('equipment') || '(not provided)'),
          '',
          'Message:',
          fd.get('message') || '(none)',
        ].join('\n');
        const client = name && company ? (name + ' [' + company + ']') : (name || company || 'Client');
        const subject = (need || 'Website Enquiry') + ' — ' + client;
        if (window.dataLayer) {
          window.dataLayer.push({ event: 'generate_lead', form_name: 'contact_enquiry', service_type: need });
        }
        return 'mailto:service@minaxielectrical.ae?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines);
      },
      { successMessage: 'Thanks — your email app should open with your enquiry ready to send.' }
    );
  }

  /* ---------- quote form ---------- */
  const quoteForm = document.getElementById('quoteForm');
  if (quoteForm && window.attachSmartForm) {
    window.attachSmartForm(
      quoteForm,
      (fd) => {
        const lines = [
          'Name: ' + (fd.get('name') || ''),
          'Company: ' + (fd.get('company') || ''),
          'Phone: ' + (fd.get('phone') || ''),
          'Email: ' + (fd.get('email') || ''),
          'Site location: ' + (fd.get('emirate') || ''),
          'Service required: ' + (fd.get('service_type') || ''),
          'Equipment capacity / kVA: ' + (fd.get('kva_capacity') || 'Not sure / Need advice'),
          'Brand / Make: ' + (fd.get('brand') || '(any/unknown)'),
          'Number of units: ' + (fd.get('quantity') || '1'),
          'Urgency / Timeline: ' + (fd.get('timeline') || 'Normal'),
          '',
          'Project / Equipment Scope Notes:',
          fd.get('details') || '(none)',
        ].join('\n');
        const subject = 'Quotation Request [' + (fd.get('service_type') || 'Critical Power') + '] — ' + (fd.get('company') || fd.get('name') || 'Client');
        if (window.dataLayer) {
          window.dataLayer.push({ event: 'generate_lead', form_name: 'quote_request', value: fd.get('kva_capacity') });
        }
        return 'mailto:service@minaxielectrical.ae?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines);
      },
      { successMessage: 'Thanks — your email client will open with your customized quote details ready to send.' }
    );
  }

  /* ---------- careers application form ---------- */
  const careersForm = document.getElementById('careersForm');
  if (careersForm && window.attachSmartForm) {
    window.attachSmartForm(
      careersForm,
      (fd) => {
        const lines = [
          'Applicant Name: ' + (fd.get('name') || ''),
          'Phone: ' + (fd.get('phone') || ''),
          'Email: ' + (fd.get('email') || ''),
          'Position applied for: ' + (fd.get('role') || 'General Application'),
          'Years of UPS / DC experience in UAE: ' + (fd.get('experience') || ''),
          'UAE Driving Licence: ' + (fd.get('license') || 'No'),
          'Current visa status / availability: ' + (fd.get('visa') || ''),
          '',
          'Experience Summary & Qualifications:',
          fd.get('summary') || '(none provided)',
        ].join('\n');
        const subject = 'Job Application: ' + (fd.get('role') || 'Field Technician') + ' — ' + (fd.get('name') || 'Applicant');
        return 'mailto:service@minaxielectrical.ae?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines);
      },
      { successMessage: 'Thank you for your application. Your email client is opening with your candidate details pre-filled.' }
    );
  }

  /* ---------- track phone & whatsapp clicks for analytics ---------- */
  document.querySelectorAll('a[href^="tel:"]').forEach((el) => {
    el.addEventListener('click', () => {
      if (window.dataLayer) window.dataLayer.push({ event: 'contact_call', phone: el.getAttribute('href') });
    });
  });
  document.querySelectorAll('a[href*="wa.me"]').forEach((el) => {
    el.addEventListener('click', () => {
      if (window.dataLayer) window.dataLayer.push({ event: 'contact_whatsapp' });
    });
  });

  /* ---------- custom selects across all 3 forms ---------- */
  function initCustomSelects() {
    const selects = document.querySelectorAll('.field select');
    if (!selects.length) return;

    selects.forEach((select) => {
      if (select.dataset.customized) return;
      select.dataset.customized = 'true';

      const box = document.createElement('div');
      box.className = 'custom-select-box';

      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'custom-select-trigger';
      trigger.setAttribute('aria-haspopup', 'listbox');
      trigger.setAttribute('aria-expanded', 'false');

      const label = document.createElement('span');
      label.className = 'custom-select-label';
      label.textContent = select.options[select.selectedIndex]?.text || '';

      const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      arrow.setAttribute('class', 'custom-select-arrow');
      arrow.setAttribute('viewBox', '0 0 24 24');
      arrow.setAttribute('width', '16');
      arrow.setAttribute('height', '16');
      arrow.setAttribute('fill', 'none');
      arrow.setAttribute('stroke', 'currentColor');
      arrow.setAttribute('stroke-width', '2');
      arrow.setAttribute('stroke-linecap', 'round');
      arrow.setAttribute('stroke-linejoin', 'round');
      arrow.innerHTML = '<path d="m6 9 6 6 6-6"/>';

      trigger.appendChild(label);
      trigger.appendChild(arrow);

      const menu = document.createElement('div');
      menu.className = 'custom-select-menu';
      menu.setAttribute('role', 'listbox');

      const updateMenuOptions = () => {
        menu.innerHTML = '';
        Array.from(select.options).forEach((opt, idx) => {
          const item = document.createElement('div');
          item.className = 'custom-select-option' + (idx === select.selectedIndex ? ' selected' : '');
          item.setAttribute('role', 'option');
          item.setAttribute('data-value', opt.value);
          item.setAttribute('aria-selected', idx === select.selectedIndex ? 'true' : 'false');
          item.textContent = opt.text;

          item.addEventListener('click', (e) => {
            e.stopPropagation();
            select.selectedIndex = idx;
            select.value = opt.value;
            label.textContent = opt.text;
            menu.querySelectorAll('.custom-select-option').forEach((o, i) => {
              o.classList.toggle('selected', i === idx);
              o.setAttribute('aria-selected', i === idx ? 'true' : 'false');
            });
            box.classList.remove('open');
            trigger.setAttribute('aria-expanded', 'false');
            trigger.classList.remove('is-invalid');
            trigger.focus();
            select.dispatchEvent(new Event('change', { bubbles: true }));
            select.dispatchEvent(new Event('input', { bubbles: true }));
          });

          menu.appendChild(item);
        });
      };

      updateMenuOptions();

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = box.classList.contains('open');
        document.querySelectorAll('.custom-select-box.open').forEach((b) => {
          if (b !== box) {
            b.classList.remove('open');
            b.querySelector('.custom-select-trigger')?.setAttribute('aria-expanded', 'false');
          }
        });
        box.classList.toggle('open', !isOpen);
        trigger.setAttribute('aria-expanded', String(!isOpen));
      });

      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          box.classList.remove('open');
          trigger.setAttribute('aria-expanded', 'false');
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          if (!box.classList.contains('open')) {
            box.classList.add('open');
            trigger.setAttribute('aria-expanded', 'true');
          }
          const options = Array.from(select.options);
          let newIdx = select.selectedIndex + (e.key === 'ArrowDown' ? 1 : -1);
          if (newIdx >= 0 && newIdx < options.length) {
            select.selectedIndex = newIdx;
            select.value = options[newIdx].value;
            label.textContent = options[newIdx].text;
            menu.querySelectorAll('.custom-select-option').forEach((o, i) => {
              o.classList.toggle('selected', i === newIdx);
              o.setAttribute('aria-selected', i === newIdx ? 'true' : 'false');
            });
            select.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      });

      // Synchronize when native select changes programmatically
      select.addEventListener('change', () => {
        label.textContent = select.options[select.selectedIndex]?.text || '';
        menu.querySelectorAll('.custom-select-option').forEach((o, i) => {
          o.classList.toggle('selected', i === select.selectedIndex);
          o.setAttribute('aria-selected', i === select.selectedIndex ? 'true' : 'false');
        });
      });

      // Hide native select visually but keep it in DOM for FormData
      select.style.position = 'absolute';
      select.style.opacity = '0';
      select.style.pointerEvents = 'none';
      select.style.width = '1px';
      select.style.height = '1px';
      select.tabIndex = -1;

      select.parentNode.insertBefore(box, select.nextSibling);
      box.appendChild(trigger);
      box.appendChild(menu);
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.custom-select-box')) {
        document.querySelectorAll('.custom-select-box.open').forEach((b) => {
          b.classList.remove('open');
          b.querySelector('.custom-select-trigger')?.setAttribute('aria-expanded', 'false');
        });
      }
    });
  }

  // Initialize custom selects across all forms
  initCustomSelects();
})();
