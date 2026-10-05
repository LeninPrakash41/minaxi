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

  /* ---------- smart form: offline check, native validation, try/catch send ---------- */
  function attachSmartForm(form, buildMailto, opts) {
    opts = opts || {};
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if ('onLine' in navigator && !navigator.onLine) {
        window.showToast("You're offline — check your connection and try again.", 'error');
        return;
      }
      if (!form.checkValidity()) {
        form.reportValidity();
        window.showToast('Please fill in the required fields — they\'re marked on the form.', 'error');
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
        const lines = [
          'Name: ' + (fd.get('name') || ''),
          'Company: ' + (fd.get('company') || ''),
          'Email: ' + (fd.get('email') || ''),
          'Phone: ' + (fd.get('phone') || ''),
          'Site location: ' + (fd.get('emirate') || ''),
          'What can we help with: ' + (fd.get('need') || ''),
          'Equipment make and rating: ' + (fd.get('equipment') || '(not provided)'),
          '',
          'Message:',
          fd.get('message') || '(none)',
        ].join('\n');
        const subject = 'Website Enquiry — ' + (fd.get('name') || 'New enquiry');
        if (window.dataLayer) {
          window.dataLayer.push({ event: 'generate_lead', form_name: 'contact_enquiry' });
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
})();
