(function () {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = [
    'position:fixed', 'inset:0', 'width:100%', 'height:100%',
    'z-index:0', 'pointer-events:none'
  ].join(';');
  document.body.insertBefore(canvas, document.body.firstChild);

  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /* ── Bird ─────────────────────────────────────────── */
  function Bird() { this.reset(true); }

  Bird.prototype.reset = function (scatter) {
    const W = canvas.width, H = canvas.height;
    this.x      = scatter ? Math.random() * W : -70;
    this.y      = 60 + Math.random() * H * 0.65;
    this.speed  = 0.45 + Math.random() * 0.85;
    this.scale  = 0.35 + Math.random() * 0.75;
    this.wing   = Math.random() * Math.PI * 2;        // current wing phase
    this.wSpd   = 0.038 + Math.random() * 0.028;      // flap speed
    this.dip    = Math.random() * Math.PI * 2;         // vertical drift phase
    this.dipSpd = 0.006 + Math.random() * 0.006;
    this.dipAmp = 0.25 + Math.random() * 0.45;
  };

  Bird.prototype.update = function () {
    this.x    += this.speed;
    this.wing += this.wSpd;
    this.dip  += this.dipSpd;
    this.y    += Math.sin(this.dip) * this.dipAmp * 0.25;
    if (this.x > canvas.width + 80) this.reset(false);
  };

  Bird.prototype.draw = function (c) {
    const wp = Math.sin(this.wing);   // -1 to 1, wing position
    const wy = wp * -15;              // wing-tip Y offset

    c.save();
    c.translate(this.x, this.y);
    c.scale(this.scale, this.scale);
    c.fillStyle = 'rgba(31,13,30,0.30)';

    // Body
    c.beginPath();
    c.ellipse(0, 0, 7, 2.5, 0, 0, Math.PI * 2);
    c.fill();

    // Left wing
    c.beginPath();
    c.moveTo(-3, 0);
    c.bezierCurveTo(-10, wy * 0.6, -20, wy, -24, wy * 0.35);
    c.bezierCurveTo(-20, wy * 0.55, -10, wy * 0.15, -3, 2.5);
    c.closePath();
    c.fill();

    // Right wing
    c.beginPath();
    c.moveTo(3, 0);
    c.bezierCurveTo(10, wy * 0.6, 20, wy, 24, wy * 0.35);
    c.bezierCurveTo(20, wy * 0.55, 10, wy * 0.15, 3, 2.5);
    c.closePath();
    c.fill();

    // Tail
    c.beginPath();
    c.moveTo(-5, 0.5);
    c.bezierCurveTo(-10, 2, -14, 5, -11, 7);
    c.bezierCurveTo(-9, 5, -7, 3, -5, 2);
    c.closePath();
    c.fill();

    c.restore();
  };

  /* ── Flock ────────────────────────────────────────── */
  const flock = Array.from({ length: 8 }, function () { return new Bird(); });

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    flock.forEach(function (b) { b.update(); b.draw(ctx); });
    requestAnimationFrame(animate);
  }

  animate();
})();
