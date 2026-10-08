(() => {
  'use strict';
  const KEY = 'phoenix-training-v1';
  const boxes = Array.from(document.querySelectorAll('[data-day]'));
  const ids = new Set(boxes.map(b => b.dataset.day));
  const status = document.getElementById('storage-status');
  let completed = new Set();
  let storageOK = true;
  let deferredInstall;
  function read(raw) {
    if (raw === null) return new Set();
    const value = JSON.parse(raw);
    if (!value || value.schemaVersion !== 1 || !Array.isArray(value.completed) || value.completed.some(id => typeof id !== 'string' || !ids.has(id))) throw new Error('Invalid progress format');
    return new Set(value.completed);
  }
  function snapshot() { return { schemaVersion: 1, completed: [...completed].sort() }; }
  try {
    completed = read(localStorage.getItem(KEY));
    // Test storage so users see a useful message even before the first checkoff.
    localStorage.setItem('phoenix-storage-test', '1');
    localStorage.removeItem('phoenix-storage-test');
    status.textContent = 'Saved on this device · Your progress is private.';
  } catch (error) {
    storageOK = false;
    status.textContent = 'Saved progress is unavailable or unreadable. Checkoffs work for this visit; back them up below.';
  }
  function render() {
    for (const box of boxes) {
      box.checked = completed.has(box.dataset.day);
      box.closest('.day').classList.toggle('completed', box.checked);
    }
    const count = completed.size;
    document.getElementById('done-count').textContent = count;
    document.getElementById('progress-pct').textContent = Math.round(count / boxes.length * 100) + '%';
    document.getElementById('progress').value = count;
    for (const week of document.querySelectorAll('.week')) {
      const done = [...week.querySelectorAll('[data-day]')].filter(b => completed.has(b.dataset.day)).length;
      week.querySelector('.week-count').textContent = `${done}/7`;
    }
  }
  function save() {
    try {
      if (!storageOK) throw new Error('Storage unavailable');
      localStorage.setItem(KEY, JSON.stringify(snapshot()));
      status.textContent = 'Saved on this device · Your progress is private.';
    } catch {
      storageOK = false;
      status.textContent = 'Your browser could not save this change. Checkoffs work for this visit; use Back up progress below.';
    }
    render();
  }
  for (const box of boxes) box.addEventListener('change', () => {
    // Merge the latest saved state to avoid losing another tab’s recent changes.
    if (storageOK) {
      try { completed = read(localStorage.getItem(KEY)); } catch { storageOK = false; }
    }
    if (box.checked) completed.add(box.dataset.day); else completed.delete(box.dataset.day);
    save();
  });
  window.addEventListener('storage', event => {
    if (event.key === KEY || event.key === null) {
      try { completed = read(localStorage.getItem(KEY)); render(); } catch { status.textContent = 'Progress changed in another tab but could not be read.'; }
    }
  });
  render();
  // Calendar dates follow this device’s timezone; counting days uses UTC date values,
  // avoiding DST changes and avoiding interpreting midnight as the previous day.
  function localDate() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
  function updateCountdown() {
    const today = localDate();
    const days = Math.round((Date.parse('2027-02-28T00:00:00Z') - Date.parse(today + 'T00:00:00Z')) / 86400000);
    document.getElementById('countdown').textContent = days > 0 ? days : days === 0 ? 'TODAY' : 'FINISH';
    document.getElementById('countdown-label').textContent = days > 0 ? (days === 1 ? 'day to go' : 'days to go') : days === 0 ? 'race day' : 'line crossed';
    const todayDay = document.getElementById('day-' + today);
    document.querySelectorAll('.today').forEach(el => el.classList.remove('today'));
    if (todayDay) todayDay.classList.add('today');
    const link = document.getElementById('today-link');
    link.href = '#day-' + (todayDay ? today : today < '2026-10-05' ? '2026-10-05' : '2027-02-28');
    link.firstChild.textContent = todayDay ? 'Go to today ' : today < '2026-10-05' ? 'First workout ' : 'Race day ';
    const focusDay = todayDay || document.getElementById(today < '2026-10-05' ? 'day-2026-10-05' : 'day-2027-02-28');
    document.getElementById('daily-date').textContent = (todayDay ? 'TODAY · ' : today < '2026-10-05' ? 'START HERE · ' : 'RACE DAY · ') + focusDay.querySelector('.day-date').textContent;
    document.getElementById('daily-title').textContent = focusDay.querySelector('h3').textContent;
    document.getElementById('daily-meta').textContent = Array.from(focusDay.querySelector('.session-meta').children, el => el.textContent).join(' · ');
    document.getElementById('daily-link').href = '#' + focusDay.id;
  }
  updateCountdown();
  window.setInterval(updateCountdown, 60000);
  function openHash(scroll = false) {
    const target = document.getElementById(location.hash.slice(1));
    if (!target) return;
    const week = target.matches('.week') ? target : target.closest('.week');
    if (week) week.open = true;
    if (scroll) target.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  window.addEventListener('hashchange', () => openHash(true));
  document.getElementById('today-link').addEventListener('click', () => {
    const target = document.getElementById(document.getElementById('today-link').hash.slice(1));
    if (target) target.closest('.week').open = true;
  });
  document.getElementById('daily-link').addEventListener('click', () => {
    document.getElementById(document.getElementById('daily-link').hash.slice(1)).closest('.week').open = true;
  });
  if (location.hash) openHash(); else {
    const todayDay = document.querySelector('.today');
    if (todayDay) {
      document.querySelectorAll('.week').forEach(w => { w.open = w === todayDay.closest('.week'); });
    }
  }
  const backupStatus = document.getElementById('backup-status');
  document.getElementById('backup-controls').hidden = false;
  document.getElementById('export').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ ...snapshot(), exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'phoenix-progress-' + localDate() + '.json';
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    backupStatus.textContent = 'Progress backup downloaded. Keep it to restore your checkoffs on another device.';
  });
  document.getElementById('import').addEventListener('change', async event => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      if (file.size > 100000) throw new Error('Backup too large');
      const restored = read(await file.text());
      for (const id of restored) completed.add(id);
      save();
      backupStatus.textContent = `Restored backup; ${completed.size} total days checked. Existing checkoffs were kept.`;
    } catch { backupStatus.textContent = 'This backup could not be read. Choose a Phoenix progress JSON backup.'; }
    event.target.value = '';
  });
  document.getElementById('reset').addEventListener('click', () => {
    if (!window.confirm('Clear all checkoffs on this device? Back up your progress first if you want to keep it.')) return;
    completed.clear(); save(); backupStatus.textContent = 'Checkoffs reset.';
  });
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault(); deferredInstall = event;
    document.getElementById('install-button').hidden = false;
  });
  document.getElementById('install-button').addEventListener('click', async () => {
    if (!deferredInstall) return;
    await deferredInstall.prompt(); await deferredInstall.userChoice; deferredInstall = null;
    document.getElementById('install-button').hidden = true;
  });
  window.addEventListener('appinstalled', () => { document.getElementById('install-button').hidden = true; });
  const offlineStatus = document.getElementById('offline-status');
  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('./sw.js', { scope: './' }).then(async registration => {
      await navigator.serviceWorker.ready;
      offlineStatus.textContent = 'Offline ready · Your workouts and station guide are saved for this device.';
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) offlineStatus.textContent = 'A new version is ready. Close all Phoenix tabs and reopen to update. Your checkoffs stay saved.';
        });
      });
    }).catch(() => { offlineStatus.textContent = 'Offline setup was unavailable. The full plan still works online; reopen online to try again.'; });
  } else offlineStatus.textContent = 'This browser does not support offline installation here. Your full plan is available online.';
  let printState;
  window.addEventListener('beforeprint', () => { printState=[...document.querySelectorAll('.week')].map(w=>w.open); document.querySelectorAll('.week').forEach(w=>w.open=true); });
  window.addEventListener('afterprint', () => { document.querySelectorAll('.week').forEach((w,i)=>w.open=printState?.[i]??w.open); });
})();
