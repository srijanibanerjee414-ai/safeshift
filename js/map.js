// SafeShift Interactive Tactical Disaster Zone Map

class DisasterZoneMap {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.width = 800;
    this.height = 500;
    this.radarAngle = 0;
    this.showRadar = true;
    this.showContours = true;
    this.showHazards = true;
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.hoveredItem = null;
    this.selectedItem = null;

    // Tactical Sectors
    this.sectors = [
      { id: 'SEC-A', name: 'Sector A: Sub-Level Core', x: 220, y: 160, radius: 90, color: 'rgba(255, 42, 109, 0.15)', stroke: '#ff2a6d', hazard: 'Structural Failure 92%', victims: 3 },
      { id: 'SEC-B', name: 'Sector B: Bio-Dome Ruins', x: 520, y: 150, radius: 110, color: 'rgba(255, 170, 0, 0.15)', stroke: '#ffaa00', hazard: 'Pressurized Gas Vent', victims: 5 },
      { id: 'SEC-C', name: 'Sector C: Reactor Ridge', x: 340, y: 340, radius: 95, color: 'rgba(255, 42, 109, 0.15)', stroke: '#ff2a6d', hazard: 'Severe Rubble Piles', victims: 2 },
      { id: 'SEC-D', name: 'Sector D: North Bridge', x: 620, y: 350, radius: 80, color: 'rgba(0, 240, 255, 0.12)', stroke: '#00f0ff', hazard: 'Suspension Creep', victims: 1 },
      { id: 'SEC-E', name: 'Base Depot & Triage Alpha', x: 100, y: 390, radius: 60, color: 'rgba(0, 255, 157, 0.15)', stroke: '#00ff9d', hazard: 'SAFE ZONE / TRIAGE', victims: 0 }
    ];

    // Survivor Beacons
    this.beacons = [
      { id: 'BEACON-04', sector: 'SEC-B', x: 540, y: 130, pulse: 0, triage: 'Critical (Spinal)' },
      { id: 'BEACON-09', sector: 'SEC-A', x: 240, y: 180, pulse: 0.3, triage: 'Severe Trauma' },
      { id: 'BEACON-12', sector: 'SEC-C', x: 360, y: 320, pulse: 0.6, triage: 'Inhalation' },
      { id: 'BEACON-15', sector: 'SEC-D', x: 610, y: 360, pulse: 0.8, triage: 'Mild / Shock' },
      { id: 'BEACON-18', sector: 'SEC-B', x: 480, y: 170, pulse: 0.2, triage: 'Entrapped / Stable' }
    ];

    // Real-time Units on Map
    this.mapUnits = [
      { id: 'AGS-101', x: 380, y: 155, targetX: 540, targetY: 130, startX: 100, startY: 390, progress: 0.55, speed: 0.0012, status: 'EN ROUTE' },
      { id: 'AGS-102', x: 170, y: 285, targetX: 100, targetY: 390, startX: 240, startY: 180, progress: 0.65, speed: 0.0016, status: 'EVACUATING' },
      { id: 'AGS-103', x: 110, y: 380, targetX: 110, targetY: 380, startX: 110, startY: 380, progress: 0, speed: 0, status: 'STANDBY' },
      { id: 'AGS-104', x: 90, y: 405, targetX: 90, targetY: 405, startX: 90, startY: 405, progress: 0, speed: 0, status: 'STANDBY' },
      { id: 'AGS-105', x: 230, y: 365, targetX: 100, targetY: 390, startX: 360, startY: 320, progress: 0.40, speed: 0.0014, status: 'EVACUATING' },
      { id: 'AGS-106', x: 450, y: 260, targetX: 610, targetY: 360, startX: 100, startY: 390, progress: 0.70, speed: 0.0015, status: 'EN ROUTE' }
    ];
  }

  init() {
    this.canvas = document.getElementById('disaster-map-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.setupInteractions();
    this.animate();
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const container = this.canvas.parentElement;
    const rect = container.getBoundingClientRect();
    this.width = rect.width;
    this.height = Math.max(480, Math.min(600, window.innerHeight * 0.55));
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  setupInteractions() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Update coordinate HUD text
      const coordEl = document.getElementById('map-mouse-coords');
      if (coordEl) {
        const lat = (34.0520 + (mouseY / this.height) * 0.0080).toFixed(4);
        const lng = (-118.2480 + (mouseX / this.width) * 0.0120).toFixed(4);
        const elev = Math.round(15 + Math.sin(mouseX * 0.02) * 8 + Math.cos(mouseY * 0.02) * 12);
        coordEl.textContent = `LAT: ${lat}°N | LON: ${lng}°W | ELEV: +${elev}m`;
      }

      // Check hover on units or sectors
      let found = null;
      for (const u of this.mapUnits) {
        const dist = Math.hypot(u.x - mouseX, u.y - mouseY);
        if (dist < 18) {
          found = { type: 'unit', data: u };
          break;
        }
      }
      if (!found) {
        for (const s of this.sectors) {
          const dist = Math.hypot(s.x - mouseX, s.y - mouseY);
          if (dist < s.radius * 0.8) {
            found = { type: 'sector', data: s };
            break;
          }
        }
      }

      this.hoveredItem = found;
      this.canvas.style.cursor = found ? 'pointer' : 'crosshair';
    });

    this.canvas.addEventListener('click', (e) => {
      if (this.hoveredItem) {
        if (this.hoveredItem.type === 'unit') {
          if (window.telemetryEngine) {
            window.telemetryEngine.selectUnit(this.hoveredItem.data.id);
          }
        } else if (this.hoveredItem.type === 'sector') {
          this.showSectorInspectModal(this.hoveredItem.data);
        }
      }
    });
  }

  highlightUnit(unitId) {
    this.selectedItem = unitId;
  }

  toggleRadar() {
    this.showRadar = !this.showRadar;
    if (window.soundFx) window.soundFx.playClick();
  }

  toggleContours() {
    this.showContours = !this.showContours;
    if (window.soundFx) window.soundFx.playClick();
  }

  toggleHazards() {
    this.showHazards = !this.showHazards;
    if (window.soundFx) window.soundFx.playClick();
  }

  resetView() {
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    if (window.soundFx) window.soundFx.playClick();
  }

  animate() {
    this.draw();
    this.updateUnits();
    requestAnimationFrame(() => this.animate());
  }

  updateUnits() {
    for (const u of this.mapUnits) {
      if (u.status !== 'STANDBY') {
        u.progress += u.speed;
        if (u.progress > 1) {
          u.progress = 0; // Loop or reverse
        }
        // Smooth linear interpolation along waypoints
        u.x = u.startX + (u.targetX - u.startX) * u.progress;
        u.y = u.startY + (u.targetY - u.startY) * u.progress;
      }
    }

    // Beacons pulse
    for (const b of this.beacons) {
      b.pulse = (b.pulse + 0.02) % 1;
    }

    // Radar rotation
    this.radarAngle = (this.radarAngle + 0.015) % (Math.PI * 2);
  }

  draw() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Clear Canvas
    ctx.fillStyle = '#080c14';
    ctx.fillRect(0, 0, w, h);

    // Draw Tactical Grid
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Draw Topographic Contours if enabled
    if (this.showContours) {
      this.drawTopography(ctx, w, h);
    }

    // Draw Sectors
    if (this.showHazards) {
      for (const s of this.sectors) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.fill();
        ctx.strokeStyle = s.stroke;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Sector Label
        ctx.fillStyle = s.stroke;
        ctx.font = '10px Orbitron, monospace';
        ctx.fillText(s.id, s.x - s.radius + 10, s.y - s.radius + 15);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '9px Inter, sans-serif';
        ctx.fillText(s.hazard, s.x - s.radius + 10, s.y - s.radius + 28);
        ctx.restore();
      }
    }

    // Draw Flight Corridors / Vector Paths
    for (const u of this.mapUnits) {
      if (u.status !== 'STANDBY') {
        ctx.beginPath();
        ctx.moveTo(u.startX, u.startY);
        ctx.lineTo(u.targetX, u.targetY);
        ctx.strokeStyle = u.status === 'EN ROUTE' ? 'rgba(0, 240, 255, 0.25)' : 'rgba(255, 170, 0, 0.25)';
        ctx.setLineDash([6, 6]);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Draw Survivor Beacons
    for (const b of this.beacons) {
      ctx.save();
      // Outer expanding pulse
      const radius = 6 + b.pulse * 20;
      ctx.beginPath();
      ctx.arc(b.x, b.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 42, 109, ${1 - b.pulse})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Core point
      ctx.beginPath();
      ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ff2a6d';
      ctx.shadowColor = '#ff2a6d';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Label
      ctx.fillStyle = '#fda4af';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.fillText(b.id, b.x + 8, b.y - 4);
      ctx.restore();
    }

    // Draw Radar Sweep
    if (this.showRadar) {
      const centerX = w / 2;
      const centerY = h / 2;
      const maxRadius = Math.hypot(w, h) / 2;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, maxRadius, this.radarAngle - 0.25, this.radarAngle);
      ctx.closePath();

      const grad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, maxRadius);
      grad.addColorStop(0, 'rgba(0, 240, 255, 0.25)');
      grad.addColorStop(1, 'rgba(0, 240, 255, 0.01)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Lead line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(this.radarAngle) * maxRadius, centerY + Math.sin(this.radarAngle) * maxRadius);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.restore();
    }

    // Draw Antigravity Stretchers
    for (const u of this.mapUnits) {
      const isSelected = window.telemetryEngine && window.telemetryEngine.currentUnitId === u.id;
      this.drawStretcherUnit(ctx, u, isSelected);
    }

    // Draw HUD Corner Elements & Compass
    this.drawHudOverlay(ctx, w, h);
  }

  drawTopography(ctx, w, h) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
    ctx.lineWidth = 1;
    // Concentric elevation contours around rubble mounds
    [
      { x: 230, y: 170, radii: [30, 60, 90, 120] },
      { x: 530, y: 150, radii: [40, 80, 120, 160] },
      { x: 350, y: 350, radii: [35, 70, 105] }
    ].forEach(hill => {
      hill.radii.forEach(r => {
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2; a += 0.2) {
          const wobble = Math.sin(a * 4 + hill.x) * 4 + Math.cos(a * 3) * 3;
          const px = hill.x + Math.cos(a) * (r + wobble);
          const py = hill.y + Math.sin(a) * (r * 0.7 + wobble);
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      });
    });
    ctx.restore();
  }

  drawStretcherUnit(ctx, u, isSelected) {
    ctx.save();
    const x = u.x;
    const y = u.y;
    const isEnRoute = u.status === 'EN ROUTE';
    const isEvac = u.status === 'EVACUATING';
    const color = isEnRoute ? '#00f0ff' : isEvac ? '#ffaa00' : '#00ff9d';

    // Quantum Levitation Aura / Ring
    ctx.beginPath();
    ctx.arc(x, y, isSelected ? 16 : 12, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = isSelected ? 2.5 : 1.5;
    ctx.shadowColor = color;
    ctx.shadowBlur = isSelected ? 15 : 8;
    ctx.stroke();

    // Secondary pulse ring for active transport
    if (u.status !== 'STANDBY') {
      const pulseR = 12 + (Date.now() % 1500) / 1500 * 8;
      ctx.beginPath();
      ctx.arc(x, y, pulseR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${isEnRoute ? '0,240,255' : '255,170,0'}, ${1 - (pulseR - 12)/8})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Stretcher Core Capsule Icon
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(x - 6, y - 4, 12, 8, 3);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Red Cross / Medical symbol inside
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 1, y - 2.5, 2, 5);
    ctx.fillRect(x - 2.5, y - 1, 5, 2);

    // Unit Tag
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.fillStyle = isSelected ? '#ffffff' : color;
    ctx.fillText(u.id, x - 15, y - 16);

    ctx.restore();
  }

  drawHudOverlay(ctx, w, h) {
    ctx.save();
    // North Indicator
    ctx.fillStyle = '#00f0ff';
    ctx.font = '11px Orbitron, monospace';
    ctx.fillText('▲ N 000°', w - 75, 30);

    // Scale Bar
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(30, h - 25);
    ctx.lineTo(130, h - 25);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.fillText('0', 30, h - 30);
    ctx.fillText('200 METERS', 65, h - 30);
    ctx.fillText('400m', 115, h - 30);
    ctx.restore();
  }

  showSectorInspectModal(sector) {
    const modal = document.getElementById('sector-modal');
    const title = document.getElementById('sector-modal-title');
    const content = document.getElementById('sector-modal-content');
    if (!modal || !title || !content) return;

    if (window.soundFx) window.soundFx.playClick();
    title.textContent = `${sector.id} — ${sector.name}`;
    content.innerHTML = `
      <div class="space-y-3">
        <div class="p-3 bg-slate-950/70 border border-slate-800 rounded">
          <div class="text-xs text-slate-400 font-mono mb-1">Structural Assessment:</div>
          <div class="text-sm font-semibold text-rose-400">${sector.hazard}</div>
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs font-mono">
          <div class="p-2.5 bg-slate-900/60 rounded border border-slate-800">
            <span class="text-slate-500 block">Identified Casualties:</span>
            <span class="text-amber-400 font-bold text-sm">${sector.victims} Survivors</span>
          </div>
          <div class="p-2.5 bg-slate-900/60 rounded border border-slate-800">
            <span class="text-slate-500 block">Antigravity Grid Lock:</span>
            <span class="text-cyan-400 font-bold text-sm">Synchronized</span>
          </div>
        </div>
        <button onclick="window.app.openDispatchModalForSector('${sector.name}')" 
                class="w-full mt-3 py-2.5 px-4 rounded font-display font-semibold text-xs tracking-wider uppercase bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition">
          Dispatch Stretcher To This Sector
        </button>
      </div>
    `;
    modal.classList.remove('hidden');
  }
}

window.disasterMap = new DisasterZoneMap();
