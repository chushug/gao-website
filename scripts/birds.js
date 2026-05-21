(function () {
  // Only run on the home page
  var path = window.location.pathname;
  var isHome = /\/(index\.html)?$/.test(path) || path.endsWith('/gao-website/');
  if (!isHome) return;

  var canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;';
  document.body.insertBefore(canvas, document.body.firstChild);
  var ctx = canvas.getContext('2d');

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  /* ── Draw one bird silhouette ────────────────────
   * Bird faces RIGHT. Wings extend along ±Y axis.
   * delta = -sin(phase)*amp: both tips shift same direction
   * (upstroke = negative delta = tips go toward -Y = screen top)
   * ─────────────────────────────────────────────── */
  function drawBird(c, phase, size) {
    var s = Math.sin(phase);
    var d = -s * 17;          // vertical tip offset (both wings)
    var S = 20;               // base half-span
    var color = 'rgba(31,13,30,0.50)';

    // Wing tip positions
    var t1y = -S + d;         // top wing tip Y
    var t2y =  S + d;         // bottom wing tip Y
    var tx  = -13;            // wing tip X (behind body)

    c.fillStyle = color;

    // ── Top wing ──────────────────────────────────
    // Leading edge sweeps forward then out to tip;
    // trailing edge angles directly back.
    c.beginPath();
    c.moveTo(5, -2);                                      // root
    c.bezierCurveTo(2, d*0.15-8,  tx+5, t1y+6,  tx, t1y); // leading edge
    c.bezierCurveTo(tx-4, t1y+2,  tx-5, t1y+5,  tx-3, t1y+7); // tip rounding
    c.bezierCurveTo(tx+2, t1y+9,  -1, d*0.1+1,  5, 3);   // trailing edge
    c.closePath();
    c.fill();

    // ── Bottom wing (Y-mirror of top) ─────────────
    c.beginPath();
    c.moveTo(5, 2);
    c.bezierCurveTo(2, d*0.15+8,  tx+5, t2y-6,  tx, t2y);
    c.bezierCurveTo(tx-4, t2y-2,  tx-5, t2y-5,  tx-3, t2y-7);
    c.bezierCurveTo(tx+2, t2y-9,  -1, d*0.1-1,  5, -3);
    c.closePath();
    c.fill();

    // ── Body ──────────────────────────────────────
    c.beginPath();
    c.moveTo(13, 0);                          // beak tip
    c.bezierCurveTo(10, -3, 2, -3, -6, -2);  // top of body
    c.bezierCurveTo(-11, -1, -11, 1, -6, 2); // tail curve
    c.bezierCurveTo(2, 3, 10, 3, 13, 0);     // bottom of body
    c.closePath();
    c.fill();

    // ── Tail fan ──────────────────────────────────
    c.beginPath();
    c.moveTo(-6, 0);
    c.bezierCurveTo(-9, -3, -16, -2, -15, 0.5);
    c.bezierCurveTo(-16,  3, -9,  3, -6,  1);
    c.closePath();
    c.fill();
  }

  /* ── Bird instance ───────────────────────────── */
  function Bird() { this.reset(true); }

  Bird.prototype.reset = function (scatter) {
    var H = canvas.height;
    this.x     = scatter ? Math.random() * canvas.width : -80;
    this.y     = 70 + Math.random() * H * 0.60;
    this.speed = 0.5 + Math.random() * 0.9;
    this.size  = 0.38 + Math.random() * 0.70;
    this.phase = Math.random() * Math.PI * 2;
    this.flapSpd = 0.036 + Math.random() * 0.030;
    this.dip   = Math.random() * Math.PI * 2;
    this.dipSpd = 0.006 + Math.random() * 0.005;
    this.dipAmp = 0.20 + Math.random() * 0.40;
  };

  Bird.prototype.update = function () {
    this.x     += this.speed;
    this.phase += this.flapSpd;
    this.dip   += this.dipSpd;
    this.y     += Math.sin(this.dip) * this.dipAmp * 0.3;
    if (this.x > canvas.width + 90) this.reset(false);
  };

  Bird.prototype.draw = function (c) {
    c.save();
    c.translate(this.x, this.y);
    c.scale(this.size, this.size);
    drawBird(c, this.phase, this.size);
    c.restore();
  };

  var flock = Array.from({ length: 8 }, function () { return new Bird(); });

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    flock.forEach(function (b) { b.update(); b.draw(ctx); });
    requestAnimationFrame(animate);
  }

  animate();
})();
