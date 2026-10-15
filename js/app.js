/**
 * SUNSHELL POWER - INTERACTIVE APPLICATION CORE
 * Canvas Simulations, Dynamic Solar Calculator, Video Showcase & UI Controllers
 */

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initAmbientCanvas();
  initHeroCurveCanvas();
  initSunSimulator();
  initSolarCalculator();
  initVideoShowcase();
  initProjectFilters();
  initFaqAccordion();
  initModals();
  initCaseStudyModal();
  initAudioAmbience();
  initStatsCounter();
  initMobileDrawer();
  initScrollTop();
});

/* ==========================================================================
   1. STICKY HEADER & SCROLL EFFECTS
   ========================================================================== */
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* ==========================================================================
   2. HERO AMBIENT SOLAR PARTICLE CANVAS
   ========================================================================== */
function initAmbientCanvas() {
  const canvas = document.getElementById('solar-ambient-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  const particleCount = 45;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class Photon {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * -height * 0.5;
      this.vx = (Math.random() - 0.5) * 0.8;
      this.vy = Math.random() * 1.5 + 0.8;
      this.radius = Math.random() * 2.5 + 1;
      this.alpha = Math.random() * 0.6 + 0.2;
      this.color = Math.random() > 0.4 ? 'rgba(255, 184, 0, ' : 'rgba(52, 211, 153, ';
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.y > height || this.x < 0 || this.x > width) {
        this.reset();
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color + this.alpha + ')';
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#ffb800';
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Photon());
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(loop);
  }
  loop();
}

/* ==========================================================================
   3. HERO LIVE POWER CURVE CANVAS
   ========================================================================== */
function initHeroCurveCanvas() {
  const canvas = document.getElementById('hero-curve-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let offset = 0;

  function drawCurve() {
    const w = canvas.width = canvas.parentElement.offsetWidth;
    const h = canvas.height = canvas.parentElement.offsetHeight;
    ctx.clearRect(0, 0, w, h);

    // Draw baseline grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.85);
    ctx.lineTo(w, h * 0.85);
    ctx.stroke();

    // Solar bell curve
    ctx.beginPath();
    ctx.moveTo(0, h * 0.85);

    for (let x = 0; x <= w; x += 4) {
      // Gaussian shaped solar generation curve peak at 50% width
      const normalizedX = (x / w - 0.5) * 4;
      const bell = Math.exp(-0.5 * normalizedX * normalizedX);
      const wave = Math.sin((x * 0.05) + offset) * 2;
      const y = (h * 0.85) - (bell * (h * 0.65)) + wave;
      ctx.lineTo(x, y);
    }

    // Gradient fill under curve
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, 'rgba(255, 158, 21, 0.35)');
    gradient.addColorStop(1, 'rgba(255, 158, 21, 0.0)');
    ctx.fillStyle = gradient;
    ctx.lineTo(w, h * 0.85);
    ctx.closePath();
    ctx.fill();

    // Curve line stroke
    ctx.strokeStyle = '#ff9e15';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Live Pulsing Dot at current time (approx 1:30 PM = 60% mark)
    const dotX = w * 0.58;
    const normDotX = (dotX / w - 0.5) * 4;
    const dotY = (h * 0.85) - (Math.exp(-0.5 * normDotX * normDotX) * (h * 0.65));

    ctx.beginPath();
    ctx.arc(dotX, dotY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#34d399';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#34d399';
    ctx.fill();
    ctx.shadowBlur = 0;

    offset += 0.04;
    requestAnimationFrame(drawCurve);
  }
  drawCurve();
}

/* ==========================================================================
   4. INTERACTIVE SUN-TRACK 3D SIMULATOR CANVAS
   ========================================================================== */
function initSunSimulator() {
  const canvas = document.getElementById('sun-simulation-canvas');
  const slider = document.getElementById('sun-time-slider');
  const timeDisplay = document.getElementById('sim-time-text');
  const genDisplay = document.getElementById('sim-gen-kw');
  const effDisplay = document.getElementById('sim-eff-pct');
  const co2Display = document.getElementById('sim-co2-saved');
  const flowBar = document.getElementById('sim-flow-bar');

  if (!canvas || !slider) return;
  const ctx = canvas.getContext('2d');
  let width, height;

  function resize() {
    width = canvas.width = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // Photons from sun to panel
  let simPhotons = [];
  for (let i = 0; i < 30; i++) {
    simPhotons.push({
      progress: Math.random(),
      speed: Math.random() * 0.015 + 0.01,
      offset: (Math.random() - 0.5) * 40
    });
  }

  function renderSim() {
    resize();
    const timeVal = parseFloat(slider.value); // 6.0 to 18.0 (6 AM to 6 PM)
    
    // Format Time Display (e.g. 12:30 PM)
    const hours = Math.floor(timeVal);
    const minutes = Math.floor((timeVal - hours) * 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    const timeFormatted = `${displayHours}:${minutes < 10 ? '0' : ''}${minutes} ${period}`;
    if (timeDisplay) timeDisplay.textContent = timeFormatted;

    // Calculate solar efficiency factor (0 at 6am & 6pm, peak 1.0 at 12:30pm)
    const normalizedTime = (timeVal - 6) / 12; // 0 to 1
    const solarFactor = Math.max(0, Math.sin(normalizedTime * Math.PI));
    
    // Update live indicators
    const currentKW = (solarFactor * 10.8).toFixed(1);
    const currentEff = Math.round(solarFactor * 22.4); // max 22.4% module eff
    const currentCO2 = (solarFactor * 8.6).toFixed(1);

    if (genDisplay) genDisplay.textContent = currentKW;
    if (effDisplay) effDisplay.textContent = currentEff + '%';
    if (co2Display) co2Display.textContent = currentCO2 + ' kg';
    if (flowBar) flowBar.style.width = (solarFactor * 100) + '%';

    // Sky Background Dynamic Color
    ctx.clearRect(0, 0, width, height);

    // Sky gradient based on time
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
    if (timeVal < 8 || timeVal > 16.5) {
      // Dawn / Dusk Golden Sunset
      skyGradient.addColorStop(0, '#120a1c');
      skyGradient.addColorStop(0.5, '#4a2515');
      skyGradient.addColorStop(1, '#050b14');
    } else {
      // Crisp Bright Daytime Sky
      skyGradient.addColorStop(0, '#0a1d38');
      skyGradient.addColorStop(0.6, '#0f3259');
      skyGradient.addColorStop(1, '#050b14');
    }
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);

    // Sun Orbit Trajectory Arc
    const cx = width / 2;
    const cy = height * 0.85;
    const radiusX = width * 0.42;
    const radiusY = height * 0.65;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.ellipse(cx, cy, radiusX, radiusY, 0, Math.PI, 0, false);
    ctx.stroke();
    ctx.setLineDash([]);

    // Calculate Sun position along the elliptical arc
    const angle = Math.PI - (normalizedTime * Math.PI);
    const sunX = cx + Math.cos(angle) * radiusX;
    const sunY = cy - Math.sin(angle) * radiusY;

    // Solar Panel Center Position on Roof / Ground
    const panelX = width / 2;
    const panelY = height * 0.72;

    // Draw Sun Flares & Glowing Body
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, 65);
    sunGlow.addColorStop(0, '#fff5cc');
    sunGlow.addColorStop(0.3, '#ffaa00');
    sunGlow.addColorStop(0.8, 'rgba(255, 120, 0, 0.4)');
    sunGlow.addColorStop(1, 'rgba(255, 120, 0, 0)');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 65, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffec99';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 18, 0, Math.PI * 2);
    ctx.fill();

    // Stream Photon Particles from Sun to Solar Panels
    if (solarFactor > 0.05) {
      simPhotons.forEach(pt => {
        pt.progress += pt.speed;
        if (pt.progress > 1) pt.progress = 0;

        const curX = sunX + (panelX - sunX) * pt.progress + pt.offset * (1 - pt.progress);
        const curY = sunY + (panelY - sunY) * pt.progress;

        ctx.beginPath();
        ctx.arc(curX, curY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 220, 80, 0.8)';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ffaa00';
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    }

    // Draw Modern 3D Solar Panel Array (Isometric Perspective)
    draw3DSolarPanel(ctx, panelX, panelY, solarFactor);

    // Dynamic ground horizon line
    ctx.fillStyle = '#07101e';
    ctx.fillRect(0, height * 0.82, width, height * 0.18);
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.82);
    ctx.lineTo(width, height * 0.82);
    ctx.stroke();

    requestAnimationFrame(renderSim);
  }

  function draw3DSolarPanel(c, x, y, eff) {
    const pWidth = 240;
    const pHeight = 110;
    const tilt = 35; // perspective shift

    c.save();
    c.translate(x, y);

    // Stand mounting structure
    c.strokeStyle = '#475569';
    c.lineWidth = 4;
    c.beginPath();
    c.moveTo(-pWidth * 0.35, 20);
    c.lineTo(-pWidth * 0.35, 70);
    c.moveTo(pWidth * 0.35, 20);
    c.lineTo(pWidth * 0.35, 70);
    c.moveTo(-pWidth * 0.45, 70);
    c.lineTo(pWidth * 0.45, 70);
    c.stroke();

    // Panel Outer Frame
    c.beginPath();
    c.moveTo(-pWidth / 2, 0);
    c.lineTo(pWidth / 2, 0);
    c.lineTo(pWidth / 2 - tilt, -pHeight);
    c.lineTo(-pWidth / 2 - tilt, -pHeight);
    c.closePath();

    // Dark Monocrystalline Blue/Black Gradient
    const panelGrad = c.createLinearGradient(0, -pHeight, 0, 0);
    panelGrad.addColorStop(0, '#0a192f');
    panelGrad.addColorStop(0.5, '#0d2847');
    panelGrad.addColorStop(1, '#071628');
    c.fillStyle = panelGrad;
    c.fill();
    c.strokeStyle = '#94a3b8';
    c.lineWidth = 2.5;
    c.stroke();

    // Photovoltaic Cell Grid Lines
    c.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    c.lineWidth = 1;

    // Vertical busbars
    for (let i = 1; i < 4; i++) {
      const frac = i / 4;
      const bX1 = -pWidth / 2 + pWidth * frac;
      const bX2 = (-pWidth / 2 - tilt) + pWidth * frac;
      c.beginPath();
      c.moveTo(bX1, 0);
      c.lineTo(bX2, -pHeight);
      c.stroke();
    }

    // Horizontal finger grid
    for (let j = 1; j < 5; j++) {
      const frac = j / 5;
      const curY = -pHeight * frac;
      const shift = -tilt * frac;
      c.beginPath();
      c.moveTo(-pWidth / 2 + shift, curY);
      c.lineTo(pWidth / 2 + shift, curY);
      c.stroke();
    }

    // Energy Luminescence Pulse on Panel Surface when generating
    if (eff > 0.1) {
      c.fillStyle = `rgba(16, 185, 129, ${eff * 0.28})`;
      c.fill();
    }

    c.restore();
  }

  slider.addEventListener('input', () => {
    // Immediate responsive update
  });

  renderSim();
}

/* ==========================================================================
   5. SOLAR SAVINGS & PM SURYA GHAR CALCULATOR
   ========================================================================== */
function initSolarCalculator() {
  const billSlider = document.getElementById('calc-bill-slider');
  const billDisplay = document.getElementById('calc-bill-display');
  const categoryBtns = document.querySelectorAll('.category-btn');
  const stateSelect = document.getElementById('calc-state-select');

  // Outputs
  const kwOutput = document.getElementById('calc-out-kw');
  const monthlySavingsOutput = document.getElementById('calc-out-monthly');
  const lifetimeSavingsOutput = document.getElementById('calc-out-lifetime');
  const subsidyOutput = document.getElementById('calc-out-subsidy');
  const areaOutput = document.getElementById('calc-out-area');
  const treesOutput = document.getElementById('calc-out-trees');
  const co2Output = document.getElementById('calc-out-co2');
  const paybackOutput = document.getElementById('calc-out-payback');

  if (!billSlider) return;

  let currentCategory = 'residential';

  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category;
      calculateSavings();
    });
  });

  billSlider.addEventListener('input', () => {
    calculateSavings();
  });

  if (stateSelect) {
    stateSelect.addEventListener('change', calculateSavings);
  }

  function formatIndianCurrency(num) {
    if (num >= 10000000) {
      return '₹' + (num / 10000000).toFixed(2) + ' Cr';
    } else if (num >= 100000) {
      return '₹' + (num / 100000).toFixed(2) + ' Lakhs';
    } else {
      return '₹' + Math.round(num).toLocaleString('en-IN');
    }
  }

  function calculateSavings() {
    const bill = parseInt(billSlider.value, 10);
    billDisplay.textContent = '₹' + bill.toLocaleString('en-IN');

    // Average electricity tariff per unit based on category
    let unitTariff = 8.5; // Average Indian state slab
    if (currentCategory === 'commercial') unitTariff = 10.5;
    if (currentCategory === 'industrial') unitTariff = 9.2;
    if (currentCategory === 'agriculture') unitTariff = 5.5;

    // Monthly consumption in kWh (units)
    const monthlyUnits = bill / unitTariff;
    // 1 kWp solar system produces approx 120 units per month in India
    let recommendedKW = monthlyUnits / 120;
    if (recommendedKW < 1) recommendedKW = 1;
    // Round to 1 decimal
    recommendedKW = Math.round(recommendedKW * 10) / 10;

    // Required rooftop space: approx 80-100 sq ft per kW
    const roofAreaSqFt = Math.round(recommendedKW * 90);

    // Monthly Solar Energy generated (kWh)
    const monthlyGenUnits = recommendedKW * 120;
    // Monthly savings in Rupees (capped at current bill)
    const monthlySavings = Math.min(bill * 0.92, monthlyGenUnits * unitTariff);

    // 25-Year Cumulative Savings (accounting for 4% average annual electricity tariff hike)
    let cumulativeSavings = 0;
    let annualSavings = monthlySavings * 12;
    for (let yr = 0; yr < 25; yr++) {
      cumulativeSavings += annualSavings;
      annualSavings *= 1.04; // 4% inflation in grid tariffs
    }

    // PM Surya Ghar: Muft Bijli Yojana Central Govt Subsidy Rules (2024-2026):
    // 1 kW = ₹30,000 to ₹33,000
    // 2 kW = ₹60,000 to ₹66,000
    // 3 kW and above = Flat ₹78,000 max central subsidy for residential
    let govtSubsidy = 0;
    if (currentCategory === 'residential') {
      if (recommendedKW < 1.5) {
        govtSubsidy = 33000;
      } else if (recommendedKW < 2.5) {
        govtSubsidy = 66000;
      } else {
        govtSubsidy = 78000;
      }
    } else if (currentCategory === 'commercial' || currentCategory === 'industrial') {
      // 40% Accelerated Depreciation tax benefit simulation
      govtSubsidy = Math.round(recommendedKW * 55000 * 0.25);
    } else {
      // PM KUSUM Solar Pump subsidy (up to 60%)
      govtSubsidy = Math.round(recommendedKW * 45000 * 0.5);
    }

    // Estimated System Cost before subsidy (approx ₹52,000/kW)
    const grossCost = recommendedKW * 52000;
    const netCost = Math.max(10000, grossCost - govtSubsidy);
    const paybackYears = (netCost / (monthlySavings * 12)).toFixed(1);

    // Environmental Impact (1 kW solar offsets ~1.3 tons CO2/year and equals ~55 trees)
    const co2Tons = (recommendedKW * 1.3 * 25).toFixed(0);
    const trees = Math.round(recommendedKW * 35);

    // Update UI elements
    if (kwOutput) kwOutput.textContent = recommendedKW + ' kW';
    if (monthlySavingsOutput) monthlySavingsOutput.textContent = formatIndianCurrency(monthlySavings) + '/mo';
    if (lifetimeSavingsOutput) lifetimeSavingsOutput.textContent = formatIndianCurrency(cumulativeSavings);
    if (subsidyOutput) subsidyOutput.textContent = formatIndianCurrency(govtSubsidy);
    if (areaOutput) areaOutput.textContent = roofAreaSqFt.toLocaleString() + ' sq.ft';
    if (treesOutput) treesOutput.textContent = trees.toLocaleString() + ' Trees';
    if (co2Output) co2Output.textContent = co2Tons + ' Tons';
    if (paybackOutput) paybackOutput.textContent = paybackYears + ' Years';
  }

  // Run initial calculation
  calculateSavings();
}

/* ==========================================================================
   6. VIDEO CINEVISION SHOWCASE CONTROLLER
   ========================================================================== */
function initVideoShowcase() {
  const thumbCards = document.querySelectorAll('.video-thumb-card');
  const mainVideo = document.getElementById('cinevision-main-video');
  const cineIframe = document.getElementById('cinevision-iframe');
  const posterLayer = document.getElementById('theater-poster');
  const centerPlayBtn = document.getElementById('theater-play-btn');
  const videoTitle = document.getElementById('theater-video-title');
  const videoSub = document.getElementById('theater-video-desc');
  const videoBadge = document.getElementById('theater-badge');

  const videoLibrary = [
    {
      id: 'video-1',
      title: 'Power Grid Corporation (Assam Substation)',
      desc: '90 kWp High-Voltage Grid-Connected Solar Rooftop Installation reducing transmission carbon emissions.',
      src: 'assets/video/video-substation.mp4',
      poster: 'assets/images/cs-pgcil.jpg',
      badge: '⚡ 90 kWp Utility Grid'
    },
    {
      id: 'video-2',
      title: 'Garden Reach Shipbuilders & Engineers (GRSE)',
      desc: '250 kWp Industrial Rooftop Solar Power Plant powering warship manufacturing facilities in Kolkata.',
      src: 'assets/video/solar-industrial.mp4',
      poster: 'assets/images/cs-grse.jpg',
      badge: '🏭 250 kWp Warship Plant'
    },
    {
      id: 'video-3',
      title: '7.5 HP Dual-Axis Tracking Sprinkler System',
      desc: '7.5 HP Solar DC/AC High-Head Submersible Deep-Borewell Agricultural Irrigation Pump in Action (PM Kusum Yojana Demonstration).',
      src: '',
      youtubeId: 'LWikHgaTms0',
      poster: 'assets/images/cs-pump75.jpg',
      badge: '🌾 7.5 HP Solar Pump'
    },
    {
      id: 'video-4',
      title: 'Modern Residential Smart Solar Net-Metering',
      desc: 'How luxury high-rise societies achieve zero common-area electricity bills and clean solar independence.',
      src: 'assets/video/video-residential.mp4',
      poster: 'assets/images/cs-alcove.jpg',
      badge: '🏙️ 189 kWp Luxury High-Rise'
    }
  ];

  let currentActiveIdx = 0;

  function playItem(idx) {
    const data = videoLibrary[idx];
    if (!data) return;

    currentActiveIdx = idx;

    if (videoTitle) videoTitle.textContent = data.title;
    if (videoSub) videoSub.textContent = data.desc;
    if (videoBadge) videoBadge.textContent = data.badge;

    if (data.youtubeId) {
      // Switch to YouTube player
      if (mainVideo) {
        mainVideo.pause();
        mainVideo.style.display = 'none';
      }
      if (cineIframe) {
        cineIframe.style.display = 'block';
        cineIframe.src = `https://www.youtube-nocookie.com/embed/${data.youtubeId}?autoplay=1&rel=0`;
      }
      if (posterLayer) posterLayer.classList.add('hidden');
    } else {
      // Switch to HTML5 MP4 player
      if (cineIframe) {
        cineIframe.src = '';
        cineIframe.style.display = 'none';
      }
      if (mainVideo) {
        mainVideo.style.display = 'block';
        mainVideo.pause();
        mainVideo.src = data.src;
        mainVideo.poster = data.poster;
        mainVideo.load();
        if (posterLayer) {
          posterLayer.style.backgroundImage = `url(${data.poster})`;
          posterLayer.classList.add('hidden');
        }
        mainVideo.play().catch(e => {
          console.log('Auto-play policy note:', e);
          if (posterLayer) posterLayer.classList.remove('hidden');
        });
      }
    }
  }

  function playCurrentVideo() {
    playItem(currentActiveIdx);
  }

  // Click on play button or entire poster overlay starts video
  if (centerPlayBtn) {
    centerPlayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      playCurrentVideo();
    });
  }

  if (posterLayer) {
    posterLayer.addEventListener('click', () => {
      playCurrentVideo();
    });
  }

  // If main video ends, show poster layer
  if (mainVideo) {
    mainVideo.addEventListener('ended', () => {
      if (posterLayer) posterLayer.classList.remove('hidden');
    });
  }

  // Tab switching with instant video swap and immediate playback
  thumbCards.forEach((card, idx) => {
    card.addEventListener('click', () => {
      thumbCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      playItem(idx);
    });
  });
}

/* ==========================================================================
   7. PROJECT PORTFOLIO FILTERS
   ========================================================================== */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      projectCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.4s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   8. FAQ ACCORDION
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    questionBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      // Close all other items
      faqItems.forEach(other => {
        other.classList.remove('active');
        const otherAnswer = other.querySelector('.faq-answer');
        if (otherAnswer) otherAnswer.style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

/* ==========================================================================
   9. MODALS & SURVEY BOOKING
   ========================================================================== */
function initModals() {
  const quoteModal = document.getElementById('quote-modal');
  const videoModal = document.getElementById('hero-video-modal');
  const openQuoteBtns = document.querySelectorAll('[data-open-quote]');
  const openVideoBtns = document.querySelectorAll('[data-open-video]');
  const closeBtns = document.querySelectorAll('.modal-close-btn');
  const overlays = document.querySelectorAll('.modal-overlay');
  const quoteForm = document.getElementById('consultation-form');
  const toast = document.getElementById('toast-notice');

  openQuoteBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (quoteModal) quoteModal.classList.add('open');
    });
  });

  openVideoBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (videoModal) {
        const v = videoModal.querySelector('video');
        const iframe = document.getElementById('modal-video-iframe');
        const modalTitle = document.getElementById('modal-video-title');
        const videoType = btn.getAttribute('data-open-video');

        if (videoType === 'agri') {
          if (v) {
            v.pause();
            v.style.display = 'none';
          }
          if (iframe) {
            iframe.style.display = 'block';
            iframe.src = 'https://www.youtube-nocookie.com/embed/LWikHgaTms0?autoplay=1&rel=0';
          }
          if (modalTitle) {
            modalTitle.innerHTML = '<span style="color: var(--primary);">🌾</span> 7.5 HP Dual-Axis Tracking Sprinkler System (Live Demo)';
          }
        } else {
          if (iframe) {
            iframe.src = '';
            iframe.style.display = 'none';
          }
          if (v) {
            v.style.display = 'block';
            v.src = 'assets/video/video-ivanpah.mp4';
            v.poster = 'assets/images/hero-solar.jpg';
            v.load();
            v.play().catch(() => {});
          }
          if (modalTitle) {
            modalTitle.innerHTML = '<span style="color: var(--primary);">⚡</span> SunShell Power Landmark Solar Installation Tour';
          }
        }

        videoModal.classList.add('open');
      }
    });
  });

  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      overlays.forEach(modal => {
        modal.classList.remove('open');
        const v = modal.querySelector('video');
        if (v) v.pause();
        const iframe = modal.querySelector('iframe');
        if (iframe) iframe.src = '';
      });
    });
  });

  overlays.forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('open');
        const v = overlay.querySelector('video');
        if (v) v.pause();
        const iframe = overlay.querySelector('iframe');
        if (iframe) iframe.src = '';
      }
    });
  });

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      overlays.forEach(modal => {
        modal.classList.remove('open');
        const v = modal.querySelector('video');
        if (v) v.pause();
        const iframe = modal.querySelector('iframe');
        if (iframe) iframe.src = '';
      });
    }
  });

  // Handle Form Submission
  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = quoteForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Verifying & Generating Proposal...';

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        if (quoteModal) quoteModal.classList.remove('open');

        // Show Toast Notification
        const refId = 'SS-' + Math.floor(100000 + Math.random() * 900000);
        if (toast) {
          toast.textContent = `✅ Site Survey Request Confirmed! Ref: ${refId}. Our Solar Engineer will contact you shortly.`;
          toast.classList.add('show');
          setTimeout(() => {
            toast.classList.remove('show');
          }, 6000);
        }
        quoteForm.reset();
      }, 1200);
    });
  }
}

/* ==========================================================================
   9.1 LANDMARK CASE STUDIES TECHNICAL DATABASE & MODAL
   ========================================================================== */
const caseStudiesDatabase = {
  'cs-grse': {
    title: 'Garden Reach Shipbuilders & Engineers (GRSE)',
    client: 'Defense PSU • Ministry of Defence',
    location: 'Kolkata Warship Drydock, West Bengal',
    tag: '250 kWp Industrial Rooftop',
    image: 'assets/images/cs-grse.jpg',
    capacity: '250 kWp',
    annualGen: '3,65,000 kWh',
    savings: '₹31.5 Lakhs / yr',
    co2: '300 Metric Tons / yr',
    desc: 'Turnkey engineering, procurement, and commissioning of a high-yield grid-connected rooftop solar power plant across warship fabrication and assembly hangars. Designed and executed under stringent Indian Navy defense industrial security standards.',
    specs: [
      'Solar Modules: Tier-1 Mono PERC 545Wp Bifacial (Half-Cut Cells)',
      'Inverters: Dual 100 kW + 50 kW High-Efficiency Grid-Tied Inverters',
      'Mounting Structure: Anodized Aluminium Non-Penetrative Standing Seam Clamps',
      'Grid Interconnection: 11 kV HT Dedicated Substation Step-Up with Net-Metering',
      'Monitoring: SCADA System with Weather Station, Pyranometer & String Monitoring',
      'Safety Compliance: Class-1 Fire Resistance & Marine Corrosive-Grade C5 Coating'
    ],
    highlights: 'Executed within 75 days on active drydock buildings without interrupting naval warship production schedules. Features marine-grade anti-corrosive structural coating to withstand Kolkata port saline humidity.'
  },
  'cs-pgcil': {
    title: 'Power Grid Corporation (PGCIL) 400 kV Substation',
    client: 'Central Transmission Utility PSU',
    location: 'Assam Grid Substation, North East India',
    tag: '90 kWp Critical Substation',
    image: 'assets/images/cs-pgcil.jpg',
    capacity: '90 kWp',
    annualGen: '1,31,400 kWh',
    savings: '₹11.8 Lakhs / yr',
    co2: '108 Metric Tons / yr',
    desc: 'Commissioned inside an active 400 kV extra-high-voltage transmission substation compound to supply clean, harmonic-free auxiliary power for critical transformer cooling systems, battery banks, and central telemetry control rooms.',
    specs: [
      'Solar Modules: High-Efficiency 540Wp Tier-1 Monocrystalline Modules',
      'Inverters: Industrial 80 kW Multi-MPPT String Inverter with Type 1+2 SPD',
      'Mounting Structure: Hot-Dip Galvanized Iron (HDGI) 80-Micron Elevated Structure',
      'Auxiliary Integration: 415V 3-Phase 50Hz Auto-Synchronizing Switchgear Panel',
      'Surge Protection: Class II Type 1+2 Lightning Arrestor & Dedicated Earth Pits',
      'Telemetry: Industrial RS485 / Modbus Integration with Substation Central RTU'
    ],
    highlights: 'Flawless zero-accident execution inside high-voltage electromagnetic fields adhering to CEA technical standards. Safeguards auxiliary cooling during grid frequency fluctuations.'
  },
  'cs-nbu': {
    title: 'North Bengal University Green Campus',
    client: 'State University & Higher Education',
    location: 'Raja Rammohunpur, Siliguri, WB',
    tag: '225 kWp Academic Campus',
    image: 'assets/images/cs-nbu.jpg',
    capacity: '225 kWp',
    annualGen: '3,28,500 kWh',
    savings: '₹28.2 Lakhs / yr',
    co2: '270 Metric Tons / yr',
    desc: 'Multi-building decentralized solar installation across the Administrative Block, Central Science Laboratories, University Library, and Student Hostels creating an educational green energy model campus.',
    specs: [
      'Solar Modules: 535Wp High-Yield Tier-1 Mono PERC Panels',
      'Inverters: Smart Decentralized Multi-MPPT Inverters (5x 40 kW + 25 kW)',
      'Mounting Structure: Elevated Ballasted RCC Roof Structure (Zero roof puncture)',
      'Net-Metering: Synchronized with WBSEDCL 11 kV Campus Incomer Line',
      'Public Dashboard: Campus Foyer Kiosk showing real-time carbon reduction to students',
      'Maintenance: Automated Water Sprinkler Manifold for rapid module washing'
    ],
    highlights: 'Generates over 3.28 lakh units per year, saving the university over ₹28 Lakhs in power tariff bills annually while providing hands-on renewable energy telemetry data for engineering and physics research students.'
  },
  'cs-alcove': {
    title: 'Alcove New Kolkata High-Rise Society',
    client: 'Alcove Realty Premium Residential',
    location: 'Serampore, Hooghly Riverfront, WB',
    tag: '189 kWp High-Rise Residential',
    image: 'assets/images/cs-alcove.jpg',
    capacity: '189 kWp',
    annualGen: '2,75,900 kWh',
    savings: '₹24.8 Lakhs / yr',
    co2: '226 Metric Tons / yr',
    desc: 'High-altitude 28-storey rooftop installation across luxury residential towers along the Hooghly riverbank. Designed to offset common electricity bills including high-capacity elevators, clubhouse air conditioning, and water treatment plants.',
    specs: [
      'Solar Modules: 545Wp Bifacial Half-Cut Framed Solar Panels',
      'Inverters: 3x 50 kW + 1x 25 kW Smart Grid-Tied Inverters with Cloud Telemetry',
      'Mounting Structure: High-Wind Resistance HDG Superstructure (tested up to 180 km/h gusts)',
      'Connection: Dual LT Net-Metering with Common Utility Distribution Board',
      'Safety: Aviation Obstacle Warning Lights & Edge Fall Arrestor Lifelines',
      'Resident App: Integrated Society Dashboard for real-time solar tracking'
    ],
    highlights: 'Engineered to withstand intense high-altitude river corridor cyclone winds (Amphan & Remal verified) while reducing resident maintenance fees by ₹350 per apartment every month.'
  },
  'cs-brws': {
    title: 'BRWS Hospital 1st Net-Metering Project',
    client: 'Bharat Rural Welfare Society Healthcare',
    location: 'Patuli, South Kolkata, WB',
    tag: '50 kWp Net-Metered Hospital',
    image: 'assets/images/cs-brws.jpg',
    capacity: '50 kWp',
    annualGen: '73,000 kWh',
    savings: '₹6.5 Lakhs / yr',
    co2: '60 Metric Tons / yr',
    desc: 'Historic milestone: West Bengal’s very first grid-interactive net-metered healthcare institution. Supplies harmonic-free green electricity to life-support ICU equipment, diagnostic MRI/CT scanners, and emergency wings.',
    specs: [
      'Solar Modules: 450Wp High-Purity Monocrystalline Panels',
      'Inverters: 50 kW Ultra-Low THD (<2%) Healthcare Grade Solar Inverter',
      'Net-Metering: CESC Bi-Directional High-Precision Digital Energy Meter',
      'Power Quality: Zero Harmonic Distortion to prevent sensitive medical machine errors',
      'Backup Integration: Fast Automatic Transfer Switch synchronizing with Hospital DG Sets',
      'Remote Telemetry: 24/7 Mobile app monitoring with instant automated fault alerts'
    ],
    highlights: 'Set the benchmark in West Bengal for healthcare clean energy. Successfully proved that solar power can power precision medical machinery with zero electrical noise or voltage dips.'
  },
  'cs-pump75': {
    title: '7.5 HP Dual-Axis Tracking Sprinkler System',
    client: 'Commercial Horticulture & Agro Enterprise',
    location: 'Nadia / Bardhaman Agricultural Belt, WB',
    tag: '7.5 HP Tracking Solar Pump',
    image: 'assets/images/cs-pump75.jpg',
    capacity: '7.5 HP (7.5 kWp Solar PV)',
    annualGen: '1,20,000 L/day Water Yield',
    savings: '₹2.4 Lakhs Diesel Saved / yr',
    co2: '18 Metric Tons / yr',
    desc: 'High-discharge agricultural irrigation system equipped with motorized astronomical dual-axis tracking, generating 30% more water discharge compared to fixed solar pumps for drip and sprinkler farming.',
    specs: [
      'Pump Type: 7.5 HP High-Head Stainless Steel 304 Submersible Pump',
      'Solar Array: 7,500 Wp MNRE-Approved Solar Photovoltaic Array',
      'Tracking Mechanism: Dual-Axis Solar Tracker with Optical Sun Sensor & GPS Time Auto-Align',
      'Controller: IP65 VFD Solar Pump Controller with MPPT efficiency > 98.5%',
      'Protections: Dry-Run Sensor, Over-Current, Low-Voltage, Lightning Arrester',
      'Water Delivery: Up to 1,20,000 Litres/Day across 250 feet dynamic head'
    ],
    highlights: 'Eliminated the use of expensive diesel generators, saving over 2,200 litres of diesel every year. The dual-axis tracking starts pumping 1.5 hours earlier in the morning and continues 1.5 hours later in the evening.'
  },
  'cs-rice-mill': {
    title: 'Shab-Shib Rice Mill Agro-Industrial Plant',
    client: 'Shab-Shib Food Products Agro-Industry',
    location: 'Burdwan, Rice Bowl of Bengal',
    tag: '202 kWp Agro-Industry',
    image: 'assets/images/cs-rice-mill.jpg',
    capacity: '202 kWp',
    annualGen: '2,95,000 kWh',
    savings: '₹26.5 Lakhs / yr',
    co2: '242 Metric Tons / yr',
    desc: 'Heavy-duty industrial rooftop installation powering continuous paddy processing mills, color sorters, and de-husking plants. Engineered to handle large inductive motor start-up surges without tripping.',
    specs: [
      'Solar Modules: 540Wp Mono PERC High Temperature Resistant Modules',
      'Inverters: 2x 100 kW Heavy-Duty Industrial Inverters with Active Cooling',
      'Structure: Elevated Tin-Shed Clamp & Truss Reinforced Mounting',
      'Dust Defense: Hydrophobic Anti-Soiling Panel Coating for dusty agro environment',
      'Grid Connectivity: 11 kV Industrial Feeder Net-Metering with WBSEDCL',
      'Tax Benefit: Full 40% Accelerated Depreciation Claimed in Year 1'
    ],
    highlights: 'Reduced mill manufacturing energy cost per quintal by 38%. The anti-soiling hydrophobic coating prevents rice husk dust from degrading module performance, minimizing manual washing requirements.'
  },
  'cs-school-pump': {
    title: 'Rural School Drinking Water 1 HP Solar System',
    client: 'Public School Infrastructure & Rural Mission',
    location: 'Bankura & Purulia Remote Schools, WB',
    tag: '1 HP Solar Water Plant',
    image: 'assets/images/cs-school-pump.jpg',
    capacity: '1 HP (1,200 Wp Solar PV)',
    annualGen: '5,000 Litres Clean Water Daily',
    savings: '100% Free Pure Water',
    co2: '4 Metric Tons / yr',
    desc: 'Off-grid rural drinking water station installed across primary and secondary schools in grid-deficient villages. Supplies continuous potable water to 800+ students and teachers daily with zero running cost.',
    specs: [
      'Pump Type: 1 HP DC Brushless High-Efficiency Borewell Submersible Pump',
      'Solar Array: 4x 335Wp Polycrystalline High-Durability Panels',
      'Storage Tank: 5,000 Liters High-Grade Anti-Bacterial Food-Safe Overhead Tank',
      'Filtration: Integrated Multi-Stage Sand & UV Drinking Water Purification Unit',
      'Automation: Automatic Float Switch shuts pump off when tank is full',
      'Structure: Heavy-Duty Vandal-Resistant 3-Meter Elevated Steel Pole'
    ],
    highlights: 'Brought safe drinking water and functional sanitation to school children who previously had to walk 2 km to fetch water. Built with tamper-proof structure to ensure decades of trouble-free operation.'
  }
};

function initCaseStudyModal() {
  const caseStudyModal = document.getElementById('case-study-modal');
  if (!caseStudyModal) return;

  const quoteModal = document.getElementById('quote-modal');
  const quoteModalBtn = document.getElementById('cs-modal-quote-btn');
  const buttons = document.querySelectorAll('[data-case-study]');

  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const caseId = btn.getAttribute('data-case-study');
      const data = caseStudiesDatabase[caseId];
      if (!data) return;

      const img = document.getElementById('cs-modal-img');
      const client = document.getElementById('cs-modal-client');
      const title = document.getElementById('cs-modal-title');
      const tag = document.getElementById('cs-modal-tag');
      const loc = document.getElementById('cs-modal-loc-text');
      const cap = document.getElementById('cs-modal-cap');
      const gen = document.getElementById('cs-modal-gen');
      const savings = document.getElementById('cs-modal-savings');
      const co2 = document.getElementById('cs-modal-co2');
      const desc = document.getElementById('cs-modal-desc');
      const highlights = document.getElementById('cs-modal-highlights');
      const specsList = document.getElementById('cs-modal-specs-list');

      if (img) {
        img.src = data.image;
        img.alt = data.title;
      }
      if (client) client.textContent = data.client;
      if (title) title.textContent = data.title;
      if (tag) tag.textContent = data.tag;
      if (loc) loc.textContent = data.location;
      if (cap) cap.textContent = data.capacity;
      if (gen) gen.textContent = data.annualGen;
      if (savings) savings.textContent = data.savings;
      if (co2) co2.textContent = data.co2;
      if (desc) desc.textContent = data.desc;
      if (highlights) highlights.textContent = data.highlights;

      if (specsList) {
        specsList.innerHTML = '';
        data.specs.forEach(spec => {
          const li = document.createElement('li');
          li.className = 'cs-bullet-item';
          li.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>${spec}</span>
          `;
          specsList.appendChild(li);
        });
      }

      caseStudyModal.classList.add('open');
      const dialog = caseStudyModal.querySelector('.case-study-modal-dialog');
      if (dialog) dialog.scrollTop = 0;
    });
  });

  if (quoteModalBtn && quoteModal) {
    quoteModalBtn.addEventListener('click', () => {
      caseStudyModal.classList.remove('open');
      quoteModal.classList.add('open');
    });
  }
}

/* ==========================================================================
   10. AMBIENT AUDIO SYNTHESIZER (WEB AUDIO API)
   ========================================================================== */
function initAudioAmbience() {
  const toggleBtn = document.getElementById('audio-ambience-toggle');
  if (!toggleBtn) return;

  let audioCtx = null;
  let isPlaying = false;
  let oscillator = null;
  let gainNode = null;

  toggleBtn.addEventListener('click', () => {
    if (!isPlaying) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();

        oscillator = audioCtx.createOscillator();
        gainNode = audioCtx.createGain();

        // Harmonious 432Hz ambient clean energy drone
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(432, audioCtx.currentTime);

        // Soft gentle volume
        gainNode.gain.setValueAtTime(0.015, audioCtx.currentTime);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();

        isPlaying = true;
        toggleBtn.classList.add('playing');
        toggleBtn.title = 'Mute Solar Ambience';
      } catch (e) {
        console.log('Audio init blocked:', e);
      }
    } else {
      if (oscillator) {
        oscillator.stop();
        oscillator.disconnect();
      }
      isPlaying = false;
      toggleBtn.classList.remove('playing');
      toggleBtn.title = 'Play Solar Ambience';
    }
  });
}

/* ==========================================================================
   11. STATS NUMBER COUNTER (INTERSECTION OBSERVER & SMOOTH EASING)
   ========================================================================== */
function initStatsCounter() {
  const statItems = document.querySelectorAll('.stat-item');
  const statNumbers = document.querySelectorAll('.stat-number');
  if (!statNumbers.length) return;

  function animateNumber(target) {
    const finalVal = parseInt(target.dataset.target, 10);
    const countSpan = target.querySelector('.count-val');
    if (isNaN(finalVal) || !countSpan) return;

    target.classList.remove('is-animated');
    const duration = 1600;
    const startTime = performance.now();

    function step(now) {
      const linearProgress = Math.min((now - startTime) / duration, 1);
      // easeOutExpo easing formula
      const easeProgress = linearProgress === 1 ? 1 : 1 - Math.pow(2, -10 * linearProgress);
      const current = Math.round(easeProgress * finalVal);
      countSpan.textContent = current;

      if (linearProgress < 1) {
        requestAnimationFrame(step);
      } else {
        countSpan.textContent = finalVal;
        target.classList.add('is-animated');
      }
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateNumber(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    statNumbers.forEach(stat => observer.observe(stat));
  } else {
    // Fallback if IntersectionObserver not available
    statNumbers.forEach(stat => animateNumber(stat));
  }

  // Interactive hover replay on stat card items
  statItems.forEach(item => {
    let debounceTimer;
    item.addEventListener('mouseenter', () => {
      clearTimeout(debounceTimer);
      const numElem = item.querySelector('.stat-number');
      if (numElem) {
        numElem.classList.remove('is-animated');
        void numElem.offsetWidth; // Trigger reflow
        numElem.classList.add('is-animated');
      }
    });
  });
}

/* ==========================================================================
   12. MOBILE OFFCANVAS DRAWER
   ========================================================================== */
function initMobileDrawer() {
  const menuToggle = document.querySelector('.menu-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const drawerClose = document.querySelector('.drawer-close-btn');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  if (menuToggle && drawer) {
    menuToggle.addEventListener('click', () => {
      drawer.classList.add('open');
    });
  }

  if (drawerClose && drawer) {
    drawerClose.addEventListener('click', () => {
      drawer.classList.remove('open');
    });
  }

  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (drawer) drawer.classList.remove('open');
    });
  });
}

/* ==========================================================================
   13. SCROLL-TO-TOP INDICATOR
   ========================================================================== */
function initScrollTop() {
  const scrollBtn = document.getElementById('scroll-top-btn');
  if (!scrollBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      scrollBtn.classList.add('visible');
    } else {
      scrollBtn.classList.remove('visible');
    }
  }, { passive: true });

  scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
