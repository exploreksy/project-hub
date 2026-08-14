(() => {
  const canvas = document.getElementById("particles");
  const ctx = canvas.getContext("2d");

  let width, height, particles;
  let shootingStars = [];
  const PURPLE_RATIO = 0.35;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createParticles() {
    const count = Math.floor((width * height) / 9000);
    particles = Array.from({ length: count }, () => {
      const isPurple = Math.random() < PURPLE_RATIO;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.4 + 0.35,
        baseAlpha: Math.random() * 0.55 + 0.35,
        twinkleSpeed: Math.random() * 0.03 + 0.012,
        twinklePhase: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * 0.05,
        vy: (Math.random() - 0.5) * 0.05,
        color: isPurple ? "139, 92, 246" : "245, 245, 247",
      };
    });
  }

  function spawnShootingStar() {
    const angle = ((Math.random() * 20 + 25) * Math.PI) / 180; // 25~45도 하강
    const speed = Math.random() * 7 + 9;

    shootingStars.push({
      x: Math.random() * width * 0.7 + width * 0.15,
      y: Math.random() * height * 0.25,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      length: Math.random() * 90 + 70,
      life: 1,
      decay: Math.random() * 0.012 + 0.014,
      color: Math.random() < 0.5 ? "245, 245, 247" : "196, 132, 252",
    });

    scheduleShootingStar();
  }

  function scheduleShootingStar() {
    const delay = Math.random() * 4000 + 2500;
    setTimeout(spawnShootingStar, delay);
  }

  function drawStars(time) {
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      const twinkle = Math.sin(time * p.twinkleSpeed + p.twinklePhase) * 0.3 + 0.7;
      const alpha = p.baseAlpha * twinkle;
      const r = p.radius * (0.9 + twinkle * 0.2);

      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
      ctx.fill();

      if (r > 1.15 || twinkle > 0.92) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 4, 0, Math.PI * 2);
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4);
        glow.addColorStop(0, `rgba(${p.color}, ${alpha * 0.35})`);
        glow.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = glow;
        ctx.fill();
      }
    }
  }

  function drawShootingStars() {
    shootingStars = shootingStars.filter((s) => s.life > 0 && s.x < width + 100 && s.y < height + 100);

    for (const s of shootingStars) {
      s.x += s.vx;
      s.y += s.vy;
      s.life -= s.decay;

      const speedMag = Math.hypot(s.vx, s.vy);
      const ux = s.vx / speedMag;
      const uy = s.vy / speedMag;
      const tailX = s.x - ux * s.length;
      const tailY = s.y - uy * s.length;

      const trail = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
      trail.addColorStop(0, `rgba(${s.color}, ${s.life})`);
      trail.addColorStop(1, `rgba(${s.color}, 0)`);

      ctx.strokeStyle = trail;
      ctx.lineWidth = 1.8;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(s.x, s.y, 1.6, 0, Math.PI * 2);
      const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 10);
      glow.addColorStop(0, `rgba(${s.color}, ${s.life})`);
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glow;
      ctx.fill();
    }
  }

  function step(time) {
    ctx.clearRect(0, 0, width, height);
    drawStars(time);
    drawShootingStars();
    requestAnimationFrame(step);
  }

  function init() {
    resize();
    createParticles();
    spawnShootingStar();
    requestAnimationFrame(step);
  }

  window.addEventListener("resize", () => {
    resize();
    createParticles();
  });

  init();
})();
