// SafeShift Master Application Controller

class SafeShiftApp {
  constructor() {
    this.activeTab = 'rescue';
    this.missionStartTime = Date.now() - (14 * 3600 + 38 * 60 + 22) * 1000; // T+ 14h 38m 22s ago
    this.notificationTimeout = null;
  }

  init() {
    this.setupTabs();
    this.setupClock();
    this.setupKeyboardShortcuts();
    this.setupModals();

    // Initialize sub-engines
    if (window.telemetryEngine) window.telemetryEngine.init();
    if (window.disasterMap) window.disasterMap.init();
    if (window.debrisEngine) window.debrisEngine.init();
    if (window.weightEngine) window.weightEngine.init();

    // Render Lucide Icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        this.switchTab(targetTab);
      });
    });
  }

  switchTab(tabId) {
    if (this.activeTab === tabId) return;
    this.activeTab = tabId;

    if (window.soundFx) window.soundFx.playClick();

    // Update Tab Buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active');
        btn.classList.remove('text-slate-400');
      } else {
        btn.classList.remove('active');
        btn.classList.add('text-slate-400');
      }
    });

    // Update Tab Views
    document.querySelectorAll('.tab-view').forEach(view => {
      if (view.id === `view-${tabId}`) {
        view.classList.remove('hidden');
      } else {
        view.classList.add('hidden');
      }
    });

    // Resize canvas if switching to map or debris
    if (tabId === 'rescue' && window.disasterMap) {
      setTimeout(() => {
        window.disasterMap.resizeCanvas();
        if (window.telemetryEngine) window.telemetryEngine.resizeCanvas();
      }, 50);
    }

    if (window.lucide) window.lucide.createIcons();
  }

  setupClock() {
    const updateTime = () => {
      const now = new Date();
      const utcString = now.toUTCString().split(' ')[4] + ' UTC';
      const clockEl = document.getElementById('live-utc-clock');
      if (clockEl) clockEl.textContent = utcString;

      // Mission Elapsed Time
      const elapsedMs = Date.now() - this.missionStartTime;
      const totalSec = Math.floor(elapsedMs / 1000);
      const hours = String(Math.floor(totalSec / 3600)).padStart(2, '0');
      const mins = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
      const secs = String(totalSec % 60).padStart(2, '0');

      const missionEl = document.getElementById('mission-elapsed-time');
      if (missionEl) missionEl.textContent = `T+ ${hours}:${mins}:${secs}`;
    };

    updateTime();
    setInterval(updateTime, 1000);
  }

  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === '1') this.switchTab('rescue');
      if (e.key === '2') this.switchTab('debris');
      if (e.key === '3') this.switchTab('weight');
      if (e.key === '4') this.switchTab('logs');
      if (e.key === 'm' || e.key === 'M') this.toggleAudio();
      if (e.key === 'Escape') this.closeAllModals();
    });
  }

  toggleAudio() {
    if (!window.soundFx) return;
    const isEnabled = window.soundFx.toggle();
    const soundBtn = document.getElementById('sound-toggle-btn');
    const soundText = document.getElementById('sound-toggle-text');

    if (soundBtn) {
      soundBtn.className = isEnabled 
        ? 'px-3 py-1.5 rounded-lg flex items-center space-x-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 border border-cyan-500/30 transition text-xs font-mono'
        : 'px-3 py-1.5 rounded-lg flex items-center space-x-1.5 bg-slate-800/50 hover:bg-slate-700/50 text-slate-500 border border-slate-700 transition text-xs font-mono';
    }
    if (soundText) soundText.textContent = isEnabled ? 'AUDIO: ON' : 'AUDIO: MUTED';

    this.showNotification(isEnabled ? 'Sound Feedback: ENABLED' : 'Sound Feedback: MUTED', 'cyan');
  }

  showNotification(msg, type = 'cyan') {
    const toast = document.getElementById('toast-notification');
    const toastMsg = document.getElementById('toast-message');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = msg;
    toast.className = `fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg border backdrop-blur-md shadow-2xl transition-all duration-300 flex items-center space-x-3 text-xs font-mono ${
      type === 'amber' 
        ? 'bg-amber-950/90 border-amber-500 text-amber-200 shadow-amber-950/40' 
        : type === 'emerald'
        ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200 shadow-emerald-950/40'
        : 'bg-cyan-950/90 border-cyan-500 text-cyan-200 shadow-cyan-950/40'
    }`;

    toast.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
    toast.classList.add('opacity-100', 'translate-y-0');

    if (this.notificationTimeout) clearTimeout(this.notificationTimeout);
    this.notificationTimeout = setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
      toast.classList.remove('opacity-100', 'translate-y-0');
    }, 3800);
  }

  setupModals() {
    // Backdrop click handlers to dismiss modals
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.add('hidden');
          if (window.soundFx) window.soundFx.playClick();
        }
      });
    });
  }

  closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.classList.add('hidden');
    });
    if (window.soundFx) window.soundFx.playClick();
  }

  openDispatchModal() {
    if (window.soundFx) window.soundFx.playClick();
    const modal = document.getElementById('dispatch-modal');
    if (modal) modal.classList.remove('hidden');
  }

  openDispatchModalForSector(sectorName) {
    this.openDispatchModal();
    const select = document.getElementById('dispatch-target-sector');
    if (select) {
      for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].text.includes(sectorName.split(':')[0])) {
          select.selectedIndex = i;
          break;
        }
      }
    }
  }

  submitDispatchForm(e) {
    if (e) e.preventDefault();
    const sector = document.getElementById('dispatch-target-sector')?.value || 'Sector B: Bio-Dome Collapse';
    const triage = document.getElementById('dispatch-triage-code')?.value || 'CODE RED (SPINAL)';
    const damping = document.getElementById('dispatch-damping-preset')?.value || 'Spinal Rigid Active';

    if (window.telemetryEngine) {
      window.telemetryEngine.dispatchNewStretcher(sector, triage, damping);
    }
  }
}

window.app = new SafeShiftApp();
window.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
