// SafeShift Telemetry & Patient Vitals Monitoring System

class TelemetryEngine {
  constructor() {
    this.currentUnitId = 'AGS-101';
    this.units = {
      'AGS-101': {
        id: 'AGS-101',
        callsign: 'AERO-ANGEL 1',
        status: 'EN ROUTE',
        statusClass: 'cyan',
        patient: 'Survivor #04 (Trauma / Spinal)',
        targetSector: 'Sector B: Bio-Dome Collapse',
        coordinates: '34.0522° N, 118.2437° W',
        elevation: 1.45,
        elevationTarget: 1.45,
        jostleIndex: 0.0021,
        dampingMode: 'Spinal Rigid Active',
        dampingEfficiency: 99.88,
        heartRate: 78,
        hrHistory: [],
        bpSystolic: 122,
        bpDiastolic: 78,
        spo2: 99,
        coreTemp: 36.9,
        batteryFlux: 86.4,
        etaMinutes: 3.2,
        speedKmh: 28.4,
        rollAngle: 0.04,
        pitchAngle: -0.02
      },
      'AGS-102': {
        id: 'AGS-102',
        callsign: 'AERO-ANGEL 2',
        status: 'EVACUATING',
        statusClass: 'amber',
        patient: 'Survivor #09 (Compound Fracture)',
        targetSector: 'Sector A: Sub-level Ruins',
        coordinates: '34.0538° N, 118.2411° W',
        elevation: 1.60,
        elevationTarget: 1.60,
        jostleIndex: 0.0028,
        dampingMode: 'Dynamic Incline Compensation',
        dampingEfficiency: 99.75,
        heartRate: 88,
        hrHistory: [],
        bpSystolic: 130,
        bpDiastolic: 84,
        spo2: 97,
        coreTemp: 37.2,
        batteryFlux: 72.1,
        etaMinutes: 1.5,
        speedKmh: 34.0,
        rollAngle: 0.08,
        pitchAngle: 0.03
      },
      'AGS-103': {
        id: 'AGS-103',
        callsign: 'AERO-ANGEL 3',
        status: 'STANDBY',
        statusClass: 'emerald',
        patient: 'None (Available)',
        targetSector: 'Forward Staging Alpha',
        coordinates: '34.0510° N, 118.2460° W',
        elevation: 0.85,
        elevationTarget: 0.85,
        jostleIndex: 0.0004,
        dampingMode: 'Standby Low-Idle',
        dampingEfficiency: 99.99,
        heartRate: 0,
        hrHistory: [],
        bpSystolic: 0,
        bpDiastolic: 0,
        spo2: 0,
        coreTemp: 0,
        batteryFlux: 100.0,
        etaMinutes: 0,
        speedKmh: 0,
        rollAngle: 0.00,
        pitchAngle: 0.00
      },
      'AGS-104': {
        id: 'AGS-104',
        callsign: 'AERO-ANGEL 4',
        status: 'STANDBY',
        statusClass: 'emerald',
        patient: 'None (Available)',
        targetSector: 'Base Depot',
        coordinates: '34.0505° N, 118.2475° W',
        elevation: 0.85,
        elevationTarget: 0.85,
        jostleIndex: 0.0003,
        dampingMode: 'Standby Low-Idle',
        dampingEfficiency: 99.99,
        heartRate: 0,
        hrHistory: [],
        bpSystolic: 0,
        bpDiastolic: 0,
        spo2: 0,
        coreTemp: 0,
        batteryFlux: 98.5,
        etaMinutes: 0,
        speedKmh: 0,
        rollAngle: 0.00,
        pitchAngle: 0.00
      },
      'AGS-105': {
        id: 'AGS-105',
        callsign: 'AERO-ANGEL 5',
        status: 'EVACUATING',
        statusClass: 'amber',
        patient: 'Survivor #12 (Inhalation Injury)',
        targetSector: 'Sector C: Reactor Ridge',
        coordinates: '34.0560° N, 118.2395° W',
        elevation: 1.50,
        elevationTarget: 1.50,
        jostleIndex: 0.0019,
        dampingMode: 'Hyper-Baric Smooth Glide',
        dampingEfficiency: 99.91,
        heartRate: 94,
        hrHistory: [],
        bpSystolic: 126,
        bpDiastolic: 82,
        spo2: 95,
        coreTemp: 37.4,
        batteryFlux: 64.8,
        etaMinutes: 4.8,
        speedKmh: 22.5,
        rollAngle: -0.05,
        pitchAngle: 0.02
      },
      'AGS-106': {
        id: 'AGS-106',
        callsign: 'AERO-ANGEL 6',
        status: 'EN ROUTE',
        statusClass: 'cyan',
        patient: 'Survivor #15 (Trauma / Shock)',
        targetSector: 'Sector D: North Bridge Collapse',
        coordinates: '34.0575° N, 118.2480° W',
        elevation: 1.40,
        elevationTarget: 1.40,
        jostleIndex: 0.0025,
        dampingMode: 'Spinal Rigid Active',
        dampingEfficiency: 99.85,
        heartRate: 82,
        hrHistory: [],
        bpSystolic: 118,
        bpDiastolic: 76,
        spo2: 98,
        coreTemp: 36.7,
        batteryFlux: 81.2,
        etaMinutes: 2.1,
        speedKmh: 31.2,
        rollAngle: 0.02,
        pitchAngle: 0.05
      }
    };

    this.ecgCanvas = null;
    this.ecgCtx = null;
    this.ecgPoints = [];
    this.ecgPhase = 0;
    this.isRunning = false;
  }

  init() {
    this.ecgCanvas = document.getElementById('ecg-canvas');
    if (this.ecgCanvas) {
      this.ecgCtx = this.ecgCanvas.getContext('2d');
      this.resizeCanvas();
      window.addEventListener('resize', () => this.resizeCanvas());
    }

    this.startSimulation();
    this.renderSelectedUnit();
    this.renderStretcherList();
  }

  resizeCanvas() {
    if (!this.ecgCanvas) return;
    const rect = this.ecgCanvas.parentElement.getBoundingClientRect();
    this.ecgCanvas.width = rect.width;
    this.ecgCanvas.height = 80;
  }

  selectUnit(unitId) {
    if (this.units[unitId]) {
      this.currentUnitId = unitId;
      if (window.soundFx) window.soundFx.playClick();
      this.renderSelectedUnit();
      this.renderStretcherList();
      if (window.disasterMap) {
        window.disasterMap.highlightUnit(unitId);
      }
    }
  }

  startSimulation() {
    if (this.isRunning) return;
    this.isRunning = true;

    // Fast tick for smooth ECG (60 FPS)
    const animateEcg = () => {
      this.renderEcgFrame();
      requestAnimationFrame(animateEcg);
    };
    requestAnimationFrame(animateEcg);

    // Telemetry micro-fluctuation timer (every 1s)
    setInterval(() => {
      this.tickTelemetry();
    }, 1000);
  }

  tickTelemetry() {
    Object.keys(this.units).forEach(key => {
      const u = this.units[key];
      if (u.status !== 'STANDBY') {
        // Micro-jitter in elevation within ±0.004m
        u.elevation = +(u.elevationTarget + (Math.random() - 0.5) * 0.008).toFixed(3);
        // Jostle index fluctuates around ultra-low G
        u.jostleIndex = +(0.0020 + (Math.random() - 0.5) * 0.0006).toFixed(4);
        // Micro vitals flutter
        if (u.heartRate > 0) {
          u.heartRate = Math.min(120, Math.max(65, Math.round(u.heartRate + (Math.random() - 0.5) * 2)));
        }
        // Micro battery consumption
        u.batteryFlux = +(Math.max(10, u.batteryFlux - 0.01)).toFixed(1);
        // Tilt micro-variations
        u.rollAngle = +( (Math.random() - 0.5) * 0.08 ).toFixed(2);
        u.pitchAngle = +( (Math.random() - 0.5) * 0.06 ).toFixed(2);
      }
    });

    this.renderSelectedUnit();
  }

  renderEcgFrame() {
    if (!this.ecgCanvas || !this.ecgCtx) return;
    const ctx = this.ecgCtx;
    const w = this.ecgCanvas.width;
    const h = this.ecgCanvas.height;
    const u = this.units[this.currentUnitId];

    // Fade trail
    ctx.fillStyle = 'rgba(10, 15, 26, 0.25)';
    ctx.fillRect(0, 0, w, h);

    // Draw subtle grid lines
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    if (!u || u.status === 'STANDBY' || u.heartRate === 0) {
      // Flatline or Standby pulse
      ctx.strokeStyle = 'rgba(0, 255, 157, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();
      return;
    }

    // Advance phase based on heart rate
    const speed = (u.heartRate / 60) * 3.5;
    this.ecgPhase = (this.ecgPhase + speed) % w;

    // Calculate ECG height based on P-Q-R-S-T wave model
    const getEcgValue = (x) => {
      const cycle = ((x + this.ecgPhase) % 90);
      const mid = h / 2;
      if (cycle < 10) return mid;
      if (cycle < 20) return mid - Math.sin((cycle - 10) / 10 * Math.PI) * 6; // P wave
      if (cycle < 25) return mid;
      if (cycle < 28) return mid + 4; // Q wave
      if (cycle < 33) return mid - (h * 0.42); // R wave peak
      if (cycle < 37) return mid + 12; // S wave drop
      if (cycle < 45) return mid;
      if (cycle < 62) return mid - Math.sin((cycle - 45) / 17 * Math.PI) * 10; // T wave
      return mid;
    };

    // Draw the ECG stroke
    ctx.beginPath();
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2.2;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;

    for (let x = 0; x < w; x += 2) {
      const y = getEcgValue(x);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0; // reset
  }

  renderSelectedUnit() {
    const u = this.units[this.currentUnitId];
    if (!u) return;

    // Update Telemetry Header
    const unitTitleEl = document.getElementById('telemetry-unit-id');
    const unitCallsignEl = document.getElementById('telemetry-callsign');
    const unitStatusEl = document.getElementById('telemetry-status-badge');
    const patientNameEl = document.getElementById('telemetry-patient-name');
    const sectorDestEl = document.getElementById('telemetry-sector');
    
    if (unitTitleEl) unitTitleEl.textContent = u.id;
    if (unitCallsignEl) unitCallsignEl.textContent = u.callsign;
    if (patientNameEl) patientNameEl.textContent = u.patient;
    if (sectorDestEl) sectorDestEl.textContent = u.targetSector;

    if (unitStatusEl) {
      unitStatusEl.textContent = u.status;
      unitStatusEl.className = `px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold tracking-wider ${
        u.status === 'EN ROUTE' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 glow-cyan' :
        u.status === 'EVACUATING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 glow-amber' :
        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 glow-emerald'
      }`;
    }

    // Dynamic metrics
    const jostleEl = document.getElementById('metric-jostle');
    const elevEl = document.getElementById('metric-elevation');
    const dampEfficiencyEl = document.getElementById('metric-damping');
    const hrEl = document.getElementById('metric-hr');
    const bpEl = document.getElementById('metric-bp');
    const spo2El = document.getElementById('metric-spo2');
    const tempEl = document.getElementById('metric-temp');
    const batteryEl = document.getElementById('metric-battery');
    const tiltEl = document.getElementById('metric-tilt');
    const etaEl = document.getElementById('metric-eta');

    if (jostleEl) jostleEl.textContent = `${u.jostleIndex.toFixed(4)} G`;
    if (elevEl) elevEl.textContent = `${u.elevation.toFixed(2)} m`;
    if (dampEfficiencyEl) dampEfficiencyEl.textContent = `${u.dampingEfficiency}%`;
    if (hrEl) hrEl.textContent = u.heartRate > 0 ? `${u.heartRate} BPM` : 'STANDBY';
    if (bpEl) bpEl.textContent = u.bpSystolic > 0 ? `${u.bpSystolic}/${u.bpDiastolic}` : '-- / --';
    if (spo2El) spo2El.textContent = u.spo2 > 0 ? `${u.spo2}%` : '--';
    if (tempEl) tempEl.textContent = u.coreTemp > 0 ? `${u.coreTemp}°C` : '--';
    if (batteryEl) {
      batteryEl.textContent = `${u.batteryFlux.toFixed(1)}%`;
      const batteryBar = document.getElementById('metric-battery-bar');
      if (batteryBar) batteryBar.style.width = `${u.batteryFlux}%`;
    }
    if (tiltEl) tiltEl.textContent = `R:${u.rollAngle}° P:${u.pitchAngle}°`;
    if (etaEl) etaEl.textContent = u.etaMinutes > 0 ? `${u.etaMinutes.toFixed(1)} min` : 'At Base';
  }

  renderStretcherList(filter = 'ALL') {
    const container = document.getElementById('stretcher-list-container');
    if (!container) return;

    const filtered = Object.values(this.units).filter(u => {
      if (filter === 'ALL') return true;
      return u.status === filter;
    });

    container.innerHTML = filtered.map(u => {
      const isSelected = u.id === this.currentUnitId;
      const statusBadge = 
        u.status === 'EN ROUTE' ? '<span class="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">EN ROUTE</span>' :
        u.status === 'EVACUATING' ? '<span class="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-950/80 text-amber-300 border border-amber-500/40">EVACUATING</span>' :
        '<span class="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">STANDBY</span>';

      return `
        <div onclick="window.telemetryEngine.selectUnit('${u.id}')"
             class="group cursor-pointer p-3.5 rounded-lg border transition-all duration-200 ${
               isSelected 
                 ? 'bg-slate-900/90 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.25)]' 
                 : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
             }">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center space-x-2">
              <span class="w-2 h-2 rounded-full ${
                u.status === 'EN ROUTE' ? 'bg-cyan-400 animate-pulse' :
                u.status === 'EVACUATING' ? 'bg-amber-400 animate-ping' :
                'bg-emerald-400'
              }"></span>
              <span class="font-display font-bold text-sm tracking-wide ${isSelected ? 'text-cyan-300' : 'text-slate-200'}">${u.id}</span>
              <span class="text-xs text-slate-400 font-mono hidden sm:inline">(${u.callsign})</span>
            </div>
            ${statusBadge}
          </div>
          
          <div class="text-xs text-slate-300 font-medium truncate mb-2">
            <span class="text-slate-500">Dest:</span> ${u.targetSector}
          </div>

          <div class="grid grid-cols-3 gap-1.5 text-[11px] font-mono bg-slate-950/60 p-2 rounded border border-slate-800/80">
            <div>
              <span class="text-slate-500 block">Jostle</span>
              <span class="text-cyan-400 font-semibold">${u.jostleIndex.toFixed(4)}G</span>
            </div>
            <div>
              <span class="text-slate-500 block">Stability</span>
              <span class="text-emerald-400 font-semibold">${u.dampingEfficiency}%</span>
            </div>
            <div>
              <span class="text-slate-500 block">Flux</span>
              <span class="text-amber-400 font-semibold">${u.batteryFlux.toFixed(0)}%</span>
            </div>
          </div>

          <div class="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/60">
            <span class="text-[11px] text-slate-400">
              ${u.status === 'STANDBY' ? 'Ready for mission' : `ETA: <strong class="text-slate-200">${u.etaMinutes}m</strong>`}
            </span>
            <button onclick="event.stopPropagation(); window.telemetryEngine.openQuickActionModal('${u.id}')"
                    class="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-900/40 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/50 transition">
              Quick Action
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Re-render icons if needed
    if (window.lucide) window.lucide.createIcons();
  }

  openQuickActionModal(unitId) {
    const u = this.units[unitId];
    if (!u) return;
    if (window.soundFx) window.soundFx.playClick();

    const modal = document.getElementById('quick-action-modal');
    const modalContent = document.getElementById('quick-action-modal-body');
    if (!modal || !modalContent) return;

    modalContent.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h4 class="font-display font-bold text-lg text-cyan-400">${u.id} — ${u.callsign}</h4>
            <p class="text-xs text-slate-400 font-mono">Location: ${u.coordinates}</p>
          </div>
          <span class="px-3 py-1 rounded text-xs font-mono font-bold bg-slate-800 border border-slate-700 text-slate-200">
            ${u.status}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-3 text-xs">
          <div class="bg-slate-950/70 p-3 rounded border border-slate-800">
            <span class="text-slate-500 block mb-1">Assigned Patient:</span>
            <span class="text-slate-200 font-medium">${u.patient}</span>
          </div>
          <div class="bg-slate-950/70 p-3 rounded border border-slate-800">
            <span class="text-slate-500 block mb-1">Target Zone:</span>
            <span class="text-slate-200 font-medium">${u.targetSector}</span>
          </div>
        </div>

        <div class="space-y-2 pt-2">
          <label class="text-xs font-mono text-slate-400 uppercase tracking-wider block">Levitation Preset Adjustment</label>
          <div class="grid grid-cols-3 gap-2">
            <button onclick="window.telemetryEngine.setDampingPreset('${u.id}', 'Spinal Rigid Active')" 
                    class="p-2 rounded text-xs text-center border ${u.dampingMode.includes('Spinal') ? 'border-cyan-400 bg-cyan-950/50 text-cyan-300 font-bold' : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:border-slate-700'}">
              Spinal Alignment
            </button>
            <button onclick="window.telemetryEngine.setDampingPreset('${u.id}', 'Shock Absorption Glide')" 
                    class="p-2 rounded text-xs text-center border ${u.dampingMode.includes('Shock') ? 'border-cyan-400 bg-cyan-950/50 text-cyan-300 font-bold' : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:border-slate-700'}">
              High-Speed Glide
            </button>
            <button onclick="window.telemetryEngine.setDampingPreset('${u.id}', 'Zero-G Isolation Pod')" 
                    class="p-2 rounded text-xs text-center border ${u.dampingMode.includes('Zero-G') ? 'border-cyan-400 bg-cyan-950/50 text-cyan-300 font-bold' : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:border-slate-700'}">
              Extreme Trauma
            </button>
          </div>
        </div>

        <div class="flex gap-2 pt-4 border-t border-slate-800">
          <button onclick="window.telemetryEngine.recallUnit('${u.id}')"
                  class="flex-1 py-2 px-3 rounded text-xs font-mono uppercase tracking-wider bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 transition">
            Emergency Recall
          </button>
          <button onclick="window.telemetryEngine.boostSpeed('${u.id}')"
                  class="flex-1 py-2 px-3 rounded text-xs font-mono uppercase tracking-wider bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 transition">
            Boost Thrusters (+30%)
          </button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
  }

  setDampingPreset(unitId, preset) {
    if (this.units[unitId]) {
      this.units[unitId].dampingMode = preset;
      if (window.soundFx) window.soundFx.playDeploy();
      this.openQuickActionModal(unitId);
      this.renderSelectedUnit();
      this.renderStretcherList();
      window.app.showNotification(`Telemetry: ${unitId} updated to preset [${preset}]`, 'cyan');
    }
  }

  recallUnit(unitId) {
    if (this.units[unitId]) {
      this.units[unitId].status = 'STANDBY';
      this.units[unitId].patient = 'None (Recalled)';
      this.units[unitId].targetSector = 'Base Depot';
      if (window.soundFx) window.soundFx.playAlert();
      this.closeModal('quick-action-modal');
      this.renderSelectedUnit();
      this.renderStretcherList();
      window.app.showNotification(`ALERT: ${unitId} recalled to Base Depot`, 'amber');
    }
  }

  boostSpeed(unitId) {
    if (this.units[unitId]) {
      this.units[unitId].speedKmh = +(this.units[unitId].speedKmh * 1.3).toFixed(1);
      this.units[unitId].etaMinutes = +(this.units[unitId].etaMinutes * 0.75).toFixed(1);
      if (window.soundFx) window.soundFx.playDeploy();
      this.closeModal('quick-action-modal');
      this.renderSelectedUnit();
      this.renderStretcherList();
      window.app.showNotification(`THRUST BOOST: ${unitId} speed increased to ${this.units[unitId].speedKmh} km/h`, 'cyan');
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
    if (window.soundFx) window.soundFx.playClick();
  }

  dispatchNewStretcher(targetSector, triageCode, dampingPreset) {
    // Find an available standby unit
    const standbyUnit = Object.values(this.units).find(u => u.status === 'STANDBY');
    if (!standbyUnit) {
      if (window.soundFx) window.soundFx.playAlert();
      window.app.showNotification('All Antigravity Stretchers deployed! Reassigning queued unit...', 'amber');
      return;
    }

    standbyUnit.status = 'EN ROUTE';
    standbyUnit.targetSector = targetSector;
    standbyUnit.patient = `Emergency Case [${triageCode}]`;
    standbyUnit.dampingMode = dampingPreset;
    standbyUnit.etaMinutes = +(1.8 + Math.random() * 2.5).toFixed(1);
    standbyUnit.speedKmh = +(26.0 + Math.random() * 8.0).toFixed(1);
    standbyUnit.heartRate = 86;
    standbyUnit.bpSystolic = 124;
    standbyUnit.bpDiastolic = 80;
    standbyUnit.spo2 = 98;
    standbyUnit.coreTemp = 36.8;

    this.selectUnit(standbyUnit.id);
    if (window.soundFx) window.soundFx.playDeploy();
    window.app.showNotification(`SUCCESS: ${standbyUnit.id} dispatched to ${targetSector} with ${dampingPreset}`, 'cyan');
    this.closeModal('dispatch-modal');
  }
}

window.telemetryEngine = new TelemetryEngine();
