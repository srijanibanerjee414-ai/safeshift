// SafeShift Debris Clearing Logistics & Antigravity Beam Control

class DebrisLogisticsEngine {
  constructor() {
    this.totalTonnage = 1842.5;
    this.dieselEmissionFactor = 0.27; // 0.27 MT CO2e saved per tonne lifted vs heavy diesel machinery
    this.sectors = [
      {
        id: 'SEC-ALPHA-1',
        name: 'Collapsed Highway Span #4',
        type: 'High-Tensile Steel & Reinforced Concrete',
        rawMassTons: 420.0,
        priority: 'CRITICAL',
        priorityClass: 'rose',
        beamActive: true,
        beamIntensity: 94,
        frequencyKhz: 512.4,
        rigCallsign: 'TITAN-NULL-01',
        elevationMeters: 4.8,
        driftTolerance: 0.02
      },
      {
        id: 'SEC-BETA-3',
        name: 'Bio-Research Enclosure Slab',
        type: 'Blast-Resistant Composite Matrix',
        rawMassTons: 280.0,
        priority: 'CRITICAL',
        priorityClass: 'rose',
        beamActive: true,
        beamIntensity: 88,
        frequencyKhz: 480.0,
        rigCallsign: 'TITAN-NULL-02',
        elevationMeters: 6.2,
        driftTolerance: 0.01
      },
      {
        id: 'SEC-GAMMA-2',
        name: 'Gantry Crane Frame & Counterweights',
        type: 'Structural Cast Iron & Cables',
        rawMassTons: 115.0,
        priority: 'MODERATE',
        priorityClass: 'amber',
        beamActive: true,
        beamIntensity: 65,
        frequencyKhz: 432.0,
        rigCallsign: 'ATLAS-HOVER-03',
        elevationMeters: 3.5,
        driftTolerance: 0.04
      },
      {
        id: 'SEC-DELTA-5',
        name: 'Shipping Freight Containers (x4 Stacked)',
        type: 'Corrugated Steel & Cargo',
        rawMassTons: 72.0,
        priority: 'MODERATE',
        priorityClass: 'amber',
        beamActive: true,
        beamIntensity: 52,
        frequencyKhz: 390.5,
        rigCallsign: 'ATLAS-HOVER-04',
        elevationMeters: 2.1,
        driftTolerance: 0.03
      },
      {
        id: 'SEC-EPSILON-4',
        name: 'Perimeter Masonry & Retaining Stones',
        type: 'Crushed Granular Rubble',
        rawMassTons: 24.5,
        priority: 'CLEAR',
        priorityClass: 'emerald',
        beamActive: false,
        beamIntensity: 10,
        frequencyKhz: 320.0,
        rigCallsign: 'MICRO-NULL-05',
        elevationMeters: 0.2,
        driftTolerance: 0.08
      }
    ];

    this.simInterval = null;
    this.liftCanvas = null;
    this.liftCtx = null;
    this.particles = [];
  }

  init() {
    this.liftCanvas = document.getElementById('debris-beam-canvas');
    if (this.liftCanvas) {
      this.liftCtx = this.liftCanvas.getContext('2d');
      this.initParticles();
      this.animateLiftSimulation();
    }

    this.renderMetrics();
    this.renderSectorsList();
    this.startLiveIncrementTicker();
  }

  initParticles() {
    this.particles = [];
    const count = 45;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * 400,
        y: Math.random() * 260,
        size: 1.5 + Math.random() * 3,
        speedY: 0.8 + Math.random() * 1.6,
        alpha: 0.2 + Math.random() * 0.7,
        oscillation: Math.random() * Math.PI * 2
      });
    }
  }

  animateLiftSimulation() {
    if (!this.liftCanvas || !this.liftCtx) return;
    const ctx = this.liftCtx;
    const w = this.liftCanvas.width = this.liftCanvas.parentElement.clientWidth;
    const h = this.liftCanvas.height = 260;

    ctx.fillStyle = '#0a0e17';
    ctx.fillRect(0, 0, w, h);

    // Draw Nullification Beam Columns (Cyan / Amber energy emitter cones)
    const activeCount = this.sectors.filter(s => s.beamActive).length;
    const beamOpacity = Math.min(0.65, 0.2 + activeCount * 0.08);

    // Emitter Base on ground
    ctx.save();
    const beamWidth = w * 0.55;
    const beamLeft = (w - beamWidth) / 2;

    const beamGrad = ctx.createLinearGradient(0, h, 0, 20);
    beamGrad.addColorStop(0, `rgba(0, 240, 255, ${beamOpacity})`);
    beamGrad.addColorStop(0.5, `rgba(0, 240, 255, ${beamOpacity * 0.5})`);
    beamGrad.addColorStop(1, 'rgba(0, 240, 255, 0.02)');

    ctx.beginPath();
    ctx.moveTo(beamLeft + 20, h);
    ctx.lineTo(beamLeft + beamWidth - 20, h);
    ctx.lineTo(beamLeft + beamWidth + 25, 20);
    ctx.lineTo(beamLeft - 25, 20);
    ctx.closePath();
    ctx.fillStyle = beamGrad;
    ctx.fill();

    // Harmonic ring waves ascending
    const time = Date.now() * 0.002;
    for (let i = 0; i < 4; i++) {
      const ringY = (h - ((time * 60 + i * 65) % (h - 40)));
      const progress = (h - ringY) / h;
      const ringW = (beamWidth + progress * 50) * 0.85;

      ctx.beginPath();
      ctx.ellipse(w / 2, ringY, ringW / 2, 8, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 240, 255, ${(1 - progress) * 0.6})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Levitating Debris Chunk in center
    const floatY = h / 2 - 15 + Math.sin(time * 1.5) * 8;
    ctx.save();
    ctx.translate(w / 2, floatY);
    ctx.rotate(Math.sin(time * 0.8) * 0.04);

    // Shadow on ground
    const shadowScale = 1 - (floatY / h) * 0.4;
    ctx.restore();
    ctx.beginPath();
    ctx.ellipse(w / 2, h - 15, 60 * shadowScale, 10 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();

    // Floating Slab
    ctx.save();
    ctx.translate(w / 2, floatY);
    ctx.rotate(Math.sin(time * 0.8) * 0.04);

    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 12;

    // Draw 3D-ish polygon concrete slab
    ctx.beginPath();
    ctx.moveTo(-70, -20);
    ctx.lineTo(70, -25);
    ctx.lineTo(85, 20);
    ctx.lineTo(-55, 25);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Rebar metal wires poking out
    ctx.strokeStyle = '#ffaa00';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(85, -5); ctx.lineTo(105, -12);
    ctx.moveTo(80, 10); ctx.lineTo(110, 16);
    ctx.moveTo(-70, -10); ctx.lineTo(-95, -18);
    ctx.stroke();

    // Nullification vector arrows
    ctx.fillStyle = '#00ff9d';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillText('MASS NULLIFIED: 99.99%', -55, 3);
    ctx.restore();

    // Upward Floating Glow Particles
    for (const p of this.particles) {
      p.y -= p.speedY;
      p.oscillation += 0.05;
      const px = p.x + Math.sin(p.oscillation) * 1.5;

      if (p.y < 10) {
        p.y = h - 10;
        p.x = beamLeft + Math.random() * beamWidth;
      }

      ctx.beginPath();
      ctx.arc(px, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 240, 255, ${p.alpha})`;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 6;
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.restore();

    requestAnimationFrame(() => this.animateLiftSimulation());
  }

  startLiveIncrementTicker() {
    this.simInterval = setInterval(() => {
      // Calculate active tonnage rate
      const activeSectors = this.sectors.filter(s => s.beamActive);
      if (activeSectors.length > 0) {
        // Ticking up cleared debris continuously
        const increment = (activeSectors.length * 0.04);
        this.totalTonnage += increment;
        this.renderMetrics();
      }
    }, 2000);
  }

  renderMetrics() {
    const tonnageEl = document.getElementById('metric-tonnage-cleared');
    const carbonEl = document.getElementById('metric-carbon-saved');
    const activeFieldsEl = document.getElementById('metric-active-fields');
    const powerDrawEl = document.getElementById('metric-power-draw');

    const carbonSaved = (this.totalTonnage * this.dieselEmissionFactor).toFixed(1);
    const activeCount = this.sectors.filter(s => s.beamActive).length;

    if (tonnageEl) tonnageEl.textContent = `${this.totalTonnage.toFixed(1)} T`;
    if (carbonEl) carbonEl.textContent = `${carbonSaved} MT`;
    if (activeFieldsEl) activeFieldsEl.textContent = `${activeCount} / ${this.sectors.length}`;
    if (powerDrawEl) {
      const mw = (activeCount * 12.8 + 14.2).toFixed(1);
      powerDrawEl.textContent = `${mw} MW`;
    }
  }

  renderSectorsList() {
    const container = document.getElementById('debris-sectors-container');
    if (!container) return;

    container.innerHTML = this.sectors.map(s => {
      const effectiveMassKg = (s.rawMassTons * 1000 * Math.pow(0.1, s.beamIntensity / 15)).toFixed(3);
      
      const badgeClass = 
        s.priority === 'CRITICAL' ? 'bg-rose-950/80 text-rose-300 border-rose-500/50 glow-rose' :
        s.priority === 'MODERATE' ? 'bg-amber-950/80 text-amber-300 border-amber-500/50 glow-amber' :
        'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 glow-emerald';

      return `
        <div class="p-4 rounded-lg border transition-all ${
          s.beamActive 
            ? 'bg-slate-900/80 border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.1)]' 
            : 'bg-slate-900/40 border-slate-800 opacity-75'
        }">
          <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div class="flex items-center space-x-3">
              <span class="w-3 h-3 rounded-full ${s.beamActive ? 'bg-cyan-400 animate-ping' : 'bg-slate-600'}"></span>
              <div>
                <h4 class="font-display font-bold text-sm tracking-wide text-slate-100">${s.id}</h4>
                <p class="text-xs text-slate-400">${s.name} <span class="text-slate-500 font-mono">(${s.type})</span></p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <span class="px-2.5 py-1 rounded text-xs font-mono font-bold border ${badgeClass}">
                ${s.priority}
              </span>
              <button onclick="window.debrisEngine.toggleSectorBeam('${s.id}')"
                      class="px-3 py-1.5 rounded text-xs font-mono font-bold tracking-wider uppercase transition ${
                        s.beamActive
                          ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700'
                      }">
                ${s.beamActive ? '⚡ BEAM ONLINE' : 'BEAM STANDBY'}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-950/70 rounded border border-slate-800/80 text-xs font-mono mb-3">
            <div>
              <span class="text-slate-500 block">Raw Tonnage:</span>
              <span class="text-slate-200 font-bold">${s.rawMassTons} T</span>
            </div>
            <div>
              <span class="text-slate-500 block">Apparent Effective:</span>
              <span class="text-cyan-400 font-bold">${effectiveMassKg} kg</span>
            </div>
            <div>
              <span class="text-slate-500 block">Levitation Altitude:</span>
              <span class="text-amber-400 font-bold">+${s.elevationMeters}m</span>
            </div>
            <div>
              <span class="text-slate-500 block">Harmonic Freq:</span>
              <span class="text-emerald-400 font-bold">${s.frequencyKhz} kHz</span>
            </div>
          </div>

          <!-- Beam Intensity Slider Control -->
          <div class="space-y-1.5">
            <div class="flex justify-between text-xs font-mono">
              <span class="text-slate-400">Nullification Flux Intensity:</span>
              <span class="text-cyan-300 font-bold">${s.beamIntensity}% (${(100 - Math.pow(0.1, s.beamIntensity/20)*100).toFixed(4)}% Load Cancellation)</span>
            </div>
            <div class="flex items-center gap-3">
              <input type="range" min="0" max="100" value="${s.beamIntensity}" 
                     oninput="window.debrisEngine.updateBeamIntensity('${s.id}', this.value)"
                     class="w-full accent-cyan-400 cursor-pointer">
              <button onclick="window.debrisEngine.openCalibrateModal('${s.id}')"
                      class="px-2.5 py-1 text-[11px] font-mono text-slate-400 hover:text-cyan-300 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 whitespace-nowrap">
                Tune Harmonics
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  toggleSectorBeam(sectorId) {
    const s = this.sectors.find(sec => sec.id === sectorId);
    if (!s) return;

    s.beamActive = !s.beamActive;
    if (s.beamActive) {
      if (window.soundFx) window.soundFx.playBeam();
      window.app.showNotification(`Nullification Beam ENGAGED for ${s.id}`, 'cyan');
    } else {
      if (window.soundFx) window.soundFx.playClick();
      window.app.showNotification(`Nullification Beam powered down for ${s.id}`, 'amber');
    }

    this.renderMetrics();
    this.renderSectorsList();
  }

  updateBeamIntensity(sectorId, value) {
    const s = this.sectors.find(sec => sec.id === sectorId);
    if (!s) return;

    s.beamIntensity = parseInt(value, 10);
    // Adjust elevation based on intensity
    s.elevationMeters = +( (s.beamIntensity / 100) * 6.5 ).toFixed(1);
    this.renderSectorsList();
    this.renderMetrics();
  }

  openCalibrateModal(sectorId) {
    const s = this.sectors.find(sec => sec.id === sectorId);
    if (!s) return;
    if (window.soundFx) window.soundFx.playClick();

    const modal = document.getElementById('beam-calibrate-modal');
    const content = document.getElementById('beam-calibrate-modal-body');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="space-y-4 text-xs font-mono">
        <div class="flex justify-between items-center pb-2 border-b border-slate-800">
          <div>
            <h4 class="font-display font-bold text-base text-cyan-400">${s.id} Harmonic Tuning</h4>
            <span class="text-slate-400">${s.name}</span>
          </div>
          <span class="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300 border border-slate-700">Rig: ${s.rigCallsign}</span>
        </div>

        <div class="p-3 bg-slate-950/80 rounded border border-slate-800 space-y-2">
          <div class="flex justify-between">
            <span class="text-slate-500">Resonant Structural Limit:</span>
            <span class="text-emerald-400 font-bold">580.0 kHz (Safe Margin)</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Current Phase Modulation:</span>
            <span class="text-cyan-400 font-bold">${s.frequencyKhz} kHz</span>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-slate-400 block">Adjust Carrier Frequency (kHz)</label>
          <div class="grid grid-cols-3 gap-2">
            <button onclick="window.debrisEngine.setCarrierFreq('${s.id}', 432.0)" class="p-2 rounded border border-slate-800 hover:border-cyan-400 bg-slate-900 text-center">
              432 kHz (Low Damp)
            </button>
            <button onclick="window.debrisEngine.setCarrierFreq('${s.id}', 480.0)" class="p-2 rounded border border-slate-800 hover:border-cyan-400 bg-slate-900 text-center">
              480 kHz (Standard)
            </button>
            <button onclick="window.debrisEngine.setCarrierFreq('${s.id}', 512.4)" class="p-2 rounded border border-slate-800 hover:border-cyan-400 bg-slate-900 text-center">
              512 kHz (High Flux)
            </button>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-800 flex justify-end">
          <button onclick="document.getElementById('beam-calibrate-modal').classList.add('hidden')"
                  class="px-4 py-2 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 transition">
            Close & Save Parameters
          </button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
  }

  setCarrierFreq(sectorId, freq) {
    const s = this.sectors.find(sec => sec.id === sectorId);
    if (!s) return;

    s.frequencyKhz = freq;
    if (window.soundFx) window.soundFx.playDeploy();
    this.openCalibrateModal(sectorId);
    this.renderSectorsList();
    window.app.showNotification(`Harmonic frequency updated to ${freq} kHz for ${sectorId}`, 'cyan');
  }
}

window.debrisEngine = new DebrisLogisticsEngine();
