// SafeShift Industrial Weight-Nullification Tracker & Safety Compliance

class WeightNullifierEngine {
  constructor() {
    this.rawMassKg = 5000; // 5 Tons
    this.fieldStrengthPercent = 99.999;
    this.cargoName = '5-Ton Structural Steel I-Beam';
    this.cargoType = 'Structural Steel';

    this.workers = [
      { id: 'W-401', name: 'Marcus Vance', role: 'Lead Rigging Specialist', rig: 'RIG #04', loadTons: 5.2, effKg: 0.052, heartRate: 74, fatigueIndex: 12, status: 'OPTIMAL' },
      { id: 'W-402', name: 'Elena Rostova', role: 'Heavy Cargo Handler', rig: 'RIG #07', loadTons: 18.5, effKg: 0.185, heartRate: 80, fatigueIndex: 18, status: 'OPTIMAL' },
      { id: 'W-403', name: 'Kenji Sato', role: 'Demolition Field Tech', rig: 'RIG #02', loadTons: 7.1, effKg: 0.071, heartRate: 92, fatigueIndex: 42, status: 'PINCH WARNING' },
      { id: 'W-404', name: 'Sarah Chen', role: 'Quantum Safety Officer', rig: 'RIG #09', loadTons: 0.0, effKg: 0.000, heartRate: 68, fatigueIndex: 8, status: 'OPTIMAL' },
      { id: 'W-405', name: 'Tariq Mansoor', role: 'Exoskeleton Mechanic', rig: 'RIG #03', loadTons: 12.0, effKg: 0.120, heartRate: 77, fatigueIndex: 22, status: 'OPTIMAL' }
    ];

    this.alerts = [
      {
        id: 'ALT-904',
        severity: 'WARNING',
        severityClass: 'amber',
        time: '2 mins ago',
        title: 'Rig #02: Proximity Pinch Zone Detected',
        message: 'Worker Kenji Sato is within 1.1m of retaining column. Micro-thruster auto-braking engaged to arrest swing momentum.',
        resolved: false
      },
      {
        id: 'ALT-903',
        severity: 'INFO',
        severityClass: 'cyan',
        time: '14 mins ago',
        title: 'Rig #07: Lateral Wind Shear Counteracted',
        message: 'Gust of 42 km/h compensated by quantum inertia dampener. Zero lateral tilt recorded.',
        resolved: false
      },
      {
        id: 'ALT-902',
        severity: 'SAFE',
        severityClass: 'emerald',
        time: '45 mins ago',
        title: 'Rig #04: Safe Drop Interlock Verified',
        message: 'Deceleration cushion tested at 1.8m elevation. Descent rate clamped at 0.015 m/s.',
        resolved: true
      }
    ];

    this.complianceLogs = [
      { timestamp: '14:35:10', cert: 'ISO-9001-Q', operator: 'M. Vance (W-401)', load: '5,200 kg', effLoad: '0.052 kg', spineStrain: '0.01%', status: 'PASSED' },
      { timestamp: '14:22:04', cert: 'OSHA-1926-AG', operator: 'E. Rostova (W-402)', load: '18,500 kg', effLoad: '0.185 kg', spineStrain: '0.03%', status: 'PASSED' },
      { timestamp: '14:10:48', cert: 'OSHA-1926-AG', operator: 'K. Sato (W-403)', load: '7,100 kg', effLoad: '0.071 kg', spineStrain: '0.02%', status: 'PASSED (INTERLOCK)' },
      { timestamp: '13:58:33', cert: 'ISO-9001-Q', operator: 'T. Mansoor (W-405)', load: '12,000 kg', effLoad: '0.120 kg', spineStrain: '0.02%', status: 'PASSED' },
      { timestamp: '13:42:15', cert: 'SAFETY-DRILL', operator: 'S. Chen (W-404)', load: '30,000 kg', effLoad: '0.300 kg', spineStrain: '0.04%', status: 'SIMULATED' }
    ];
  }

  init() {
    this.renderCalculator();
    this.renderWorkerRoster();
    this.renderAlerts();
    this.renderComplianceLogs();
  }

  selectCargoPreset(name, type, massKg) {
    this.cargoName = name;
    this.cargoType = type;
    this.rawMassKg = massKg;
    if (window.soundFx) window.soundFx.playClick();
    this.renderCalculator();
  }

  setRawMass(val) {
    this.rawMassKg = parseInt(val, 10);
    this.renderCalculator();
  }

  setFieldStrength(val) {
    this.fieldStrengthPercent = parseFloat(val);
    if (this.fieldStrengthPercent < 90) {
      if (window.soundFx) window.soundFx.playAlert();
    }
    this.renderCalculator();
  }

  calculateEffectiveWeight() {
    // Effective apparent weight calculation
    const reductionRatio = (100 - this.fieldStrengthPercent) / 100;
    const effKg = this.rawMassKg * reductionRatio;
    return effKg;
  }

  renderCalculator() {
    const effKg = this.calculateEffectiveWeight();
    const rawNewtons = (this.rawMassKg * 9.81).toLocaleString();
    const effNewtons = (effKg * 9.81).toFixed(2);
    const spineStrainPercent = ((effKg / 50) * 1.5).toFixed(3); // human strain vs 50kg limit

    // Update UI elements
    const rawMassEl = document.getElementById('calc-raw-mass');
    const rawMassTonsEl = document.getElementById('calc-raw-tons');
    const rawNewtonsEl = document.getElementById('calc-raw-newtons');
    const effKgEl = document.getElementById('calc-eff-kg');
    const effGramsEl = document.getElementById('calc-eff-grams');
    const effNewtonsEl = document.getElementById('calc-eff-newtons');
    const fieldPctEl = document.getElementById('calc-field-pct');
    const spineStrainEl = document.getElementById('calc-spine-strain');
    const cargoTitleEl = document.getElementById('calc-cargo-title');
    const humanComparisonEl = document.getElementById('calc-human-comparison');

    if (rawMassEl) rawMassEl.textContent = `${this.rawMassKg.toLocaleString()} kg`;
    if (rawMassTonsEl) rawMassTonsEl.textContent = `${(this.rawMassKg / 1000).toFixed(2)} Tons`;
    if (rawNewtonsEl) rawNewtonsEl.textContent = `${rawNewtons} N`;
    if (effKgEl) effKgEl.textContent = `${effKg < 1 ? effKg.toFixed(4) : effKg.toFixed(2)} kg`;
    if (effGramsEl) effGramsEl.textContent = `(${Math.round(effKg * 1000)} grams)`;
    if (effNewtonsEl) effNewtonsEl.textContent = `${effNewtons} N`;
    if (fieldPctEl) fieldPctEl.textContent = `${this.fieldStrengthPercent.toFixed(3)}%`;
    if (spineStrainEl) spineStrainEl.textContent = `${spineStrainPercent}% of standard safe limit`;
    if (cargoTitleEl) cargoTitleEl.textContent = this.cargoName;

    if (humanComparisonEl) {
      let comparisonText = '';
      if (effKg <= 0.05) {
        comparisonText = '🪶 Equivalent to holding a single feather or paperclip. Completely weightless!';
      } else if (effKg <= 0.25) {
        comparisonText = '☕ Equivalent to holding a small ceramic coffee cup. Zero muscular exertion.';
      } else if (effKg <= 1.0) {
        comparisonText = '📦 Equivalent to lifting a 1-liter bottle of water. Effortlessly maneuverable.';
      } else {
        comparisonText = '⚠️ Higher load sensed. Ensure dual-operator exoskeleton synchronization.';
      }
      humanComparisonEl.textContent = comparisonText;
    }

    // Update mass slider if present
    const slider = document.getElementById('raw-mass-slider');
    if (slider && slider.value != this.rawMassKg) {
      slider.value = this.rawMassKg;
    }
  }

  renderWorkerRoster() {
    const container = document.getElementById('worker-roster-container');
    if (!container) return;

    container.innerHTML = this.workers.map(w => {
      const isWarn = w.status.includes('WARNING');
      return `
        <div class="p-3 rounded-lg border transition ${
          isWarn 
            ? 'bg-amber-950/30 border-amber-500/50 shadow-[0_0_12px_rgba(255,170,0,0.15)]' 
            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
        }">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center space-x-2">
              <span class="w-2.5 h-2.5 rounded-full ${isWarn ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}"></span>
              <span class="font-bold text-sm text-slate-100">${w.name}</span>
              <span class="text-xs text-slate-400 font-mono">(${w.id})</span>
            </div>
            <span class="px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
              isWarn ? 'bg-amber-950 text-amber-300 border border-amber-500/40' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
            }">
              ${w.status}
            </span>
          </div>

          <div class="text-xs text-slate-400 mb-2">
            <span>Rig: <strong class="text-slate-200 font-mono">${w.rig}</strong></span> · 
            <span>Role: <strong class="text-slate-300">${w.role}</strong></span>
          </div>

          <div class="grid grid-cols-3 gap-1.5 p-2 bg-slate-950/70 rounded border border-slate-800 text-[11px] font-mono">
            <div>
              <span class="text-slate-500 block">Carried Mass</span>
              <span class="text-slate-200 font-bold">${w.loadTons}T</span>
            </div>
            <div>
              <span class="text-slate-500 block">Eff. Weight</span>
              <span class="text-cyan-400 font-bold">${w.effKg} kg</span>
            </div>
            <div>
              <span class="text-slate-500 block">Worker Pulse</span>
              <span class="text-emerald-400 font-bold">${w.heartRate} bpm</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  renderAlerts() {
    const container = document.getElementById('crushing-hazard-alerts-container');
    if (!container) return;

    container.innerHTML = this.alerts.map(a => {
      const isWarn = a.severity === 'WARNING';
      const isInfo = a.severity === 'INFO';

      return `
        <div class="p-3.5 rounded-lg border transition ${
          a.resolved 
            ? 'bg-slate-900/30 border-slate-800 opacity-60' 
            : isWarn 
              ? 'bg-amber-950/40 border-amber-500/60 shadow-[0_0_15px_rgba(255,170,0,0.15)]' 
              : 'bg-cyan-950/30 border-cyan-500/40'
        }">
          <div class="flex items-center justify-between mb-1.5">
            <div class="flex items-center space-x-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                isWarn ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              }">
                ${a.severity}
              </span>
              <span class="font-bold text-xs text-slate-100">${a.title}</span>
            </div>
            <span class="text-[11px] font-mono text-slate-400">${a.time}</span>
          </div>

          <p class="text-xs text-slate-300 mb-2.5 leading-relaxed">${a.message}</p>

          <div class="flex items-center justify-between pt-2 border-t border-slate-800/60">
            <span class="text-[11px] font-mono text-slate-400">ID: ${a.id}</span>
            ${
              a.resolved 
                ? '<span class="text-xs font-mono text-emerald-400">✓ Resolved & Logged</span>'
                : `<button onclick="window.weightEngine.resolveAlert('${a.id}')"
                           class="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition">
                     Acknowledge & Clear
                   </button>`
            }
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  resolveAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return;

    alert.resolved = true;
    if (window.soundFx) window.soundFx.playClick();
    this.renderAlerts();
    window.app.showNotification(`Hazard Alert ${alertId} marked as resolved.`, 'emerald');
  }

  triggerHazardDrill() {
    if (window.soundFx) window.soundFx.playAlert();

    const drillAlert = {
      id: `ALT-${Math.floor(100 + Math.random() * 900)}`,
      severity: 'WARNING',
      severityClass: 'amber',
      time: 'Just now',
      title: 'SIMULATED DRILL: Sudden Inertial Decoupling on Rig #04',
      message: 'Emergency auto-catch magnetic floor coils deployed. Deceleration cushion prevented simulated impact. Exoskeleton locks held.',
      resolved: false
    };

    this.alerts.unshift(drillAlert);
    this.renderAlerts();

    // Also add to compliance log
    this.complianceLogs.unshift({
      timestamp: new Date().toTimeString().split(' ')[0],
      cert: 'SAFETY-DRILL',
      operator: 'M. Vance (W-401)',
      load: '5,000 kg',
      effLoad: '0.050 kg',
      spineStrain: '0.01%',
      status: 'DRILL PASSED'
    });
    this.renderComplianceLogs();

    window.app.showNotification('SAFETY DRILL EXECUTED: Emergency Catch Mechanism Verified 100% Operational', 'amber');
  }

  renderComplianceLogs() {
    const container = document.getElementById('compliance-logs-container');
    if (!container) return;

    container.innerHTML = this.complianceLogs.map(l => `
      <tr class="border-b border-slate-800/80 hover:bg-slate-800/30 font-mono text-xs">
        <td class="py-2.5 px-3 text-slate-400">${l.timestamp}</td>
        <td class="py-2.5 px-3 font-semibold text-cyan-400">${l.cert}</td>
        <td class="py-2.5 px-3 text-slate-200">${l.operator}</td>
        <td class="py-2.5 px-3 text-slate-300">${l.load}</td>
        <td class="py-2.5 px-3 text-emerald-400 font-bold">${l.effLoad}</td>
        <td class="py-2.5 px-3 text-slate-400">${l.spineStrain}</td>
        <td class="py-2.5 px-3">
          <span class="px-2 py-0.5 rounded text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
            ${l.status}
          </span>
        </td>
      </tr>
    `).join('');
  }

  exportComplianceReport() {
    if (window.soundFx) window.soundFx.playSuccess();
    const modal = document.getElementById('report-export-modal');
    if (!modal) return;

    modal.classList.remove('hidden');
  }
}

window.weightEngine = new WeightNullifierEngine();
