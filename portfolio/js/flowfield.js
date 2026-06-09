/**
 * Generative Flow Field
 * Perlin/Simplex noise-driven particle system rendered on a fixed canvas.
 * Particles follow a vector field that evolves over time.
 * Mouse interaction bends nearby flow vectors.
 */

(function () {
  'use strict';

  const CONFIG = {
    particleCount: 900,
    noiseScale: 0.003,
    noiseSpeed: 0.0003,
    particleSpeed: 1.2,
    particleMaxSpeed: 3,
    trailAlpha: 0.04,
    lineWidth: 0.8,
    mouseRadius: 200,
    mouseStrength: 0.6,
    colorHueBase: 175,
    colorHueRange: 30,
    colorSaturation: 55,
    colorLightnessMin: 35,
    colorLightnessMax: 55,
    colorAlphaMin: 0.15,
    colorAlphaMax: 0.5,
    respawnMargin: 20,
  };

  let canvas, ctx;
  let width, height;
  let particles = [];
  let simplex;
  let zOffset = 0;
  let mouse = { x: -1000, y: -1000, active: false };
  let animId;
  let dpr;

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = 0;
      this.vy = 0;
      this.life = Math.random() * 300 + 200;
      this.maxLife = this.life;

      const hue = CONFIG.colorHueBase + (Math.random() - 0.5) * CONFIG.colorHueRange;
      const lightness = CONFIG.colorLightnessMin + Math.random() * (CONFIG.colorLightnessMax - CONFIG.colorLightnessMin);
      const alpha = CONFIG.colorAlphaMin + Math.random() * (CONFIG.colorAlphaMax - CONFIG.colorAlphaMin);
      this.color = `hsla(${hue}, ${CONFIG.colorSaturation}%, ${lightness}%, ${alpha})`;
      this.lineWidth = CONFIG.lineWidth + Math.random() * 0.6;
    }

    update() {
      const angle = simplex.noise3D(
        this.x * CONFIG.noiseScale,
        this.y * CONFIG.noiseScale,
        zOffset
      ) * Math.PI * 2;

      let ax = Math.cos(angle) * CONFIG.particleSpeed;
      let ay = Math.sin(angle) * CONFIG.particleSpeed;

      // Mouse interaction
      if (mouse.active) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.mouseRadius && dist > 0) {
          const force = (1 - dist / CONFIG.mouseRadius) * CONFIG.mouseStrength;
          ax += (dx / dist) * force * 2;
          ay += (dy / dist) * force * 2;
        }
      }

      this.vx += ax * 0.1;
      this.vy += ay * 0.1;

      // Limit speed
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > CONFIG.particleMaxSpeed) {
        this.vx = (this.vx / speed) * CONFIG.particleMaxSpeed;
        this.vy = (this.vy / speed) * CONFIG.particleMaxSpeed;
      }

      this.prevX = this.x;
      this.prevY = this.y;
      this.x += this.vx;
      this.y += this.vy;
      this.life--;

      // Wrap or respawn
      const m = CONFIG.respawnMargin;
      if (this.x < -m || this.x > width + m || this.y < -m || this.y > height + m || this.life <= 0) {
        this.reset();
        this.prevX = this.x;
        this.prevY = this.y;
      }
    }

    draw() {
      ctx.beginPath();
      ctx.moveTo(this.prevX, this.prevY);
      ctx.lineTo(this.x, this.y);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.lineWidth;
      ctx.stroke();
    }
  }

  function init() {
    canvas = document.getElementById('flowfield-canvas');
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    simplex = new SimplexNoise(42);
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    resize();
    createParticles();

    canvas.addEventListener('mousemove', onMouseMove, { passive: true });
    canvas.addEventListener('mouseleave', onMouseLeave, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas.addEventListener('touchend', onMouseLeave, { passive: true });
    window.addEventListener('resize', debounce(resize, 200));

    animate();
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < CONFIG.particleCount; i++) {
      particles.push(new Particle());
    }
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    // Clear and reset
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);
  }

  function onMouseMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  }

  function onTouchMove(e) {
    if (e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
      mouse.active = true;
    }
  }

  function onMouseLeave() {
    mouse.active = false;
  }

  function animate() {
    // Fade previous frame
    ctx.fillStyle = `rgba(10, 10, 15, ${CONFIG.trailAlpha})`;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    zOffset += CONFIG.noiseSpeed;
    animId = requestAnimationFrame(animate);
  }

  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // Pause when tab is not visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      animate();
    }
  });

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
