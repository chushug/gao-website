(function () {
  // Home page only
  var path = window.location.pathname;
  if (!/(\/|(\/index\.html))$/.test(path) && !path.endsWith('/gao-website/')) return;

  var canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;';
  document.body.insertBefore(canvas, document.body.firstChild);
  var ctx = canvas.getContext('2d');

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  /* ── Boid ────────────────────────────────────── */
  var TRAIL     = 55;    // trail length (frames)
  var N_BOIDS   = 28;
  var MAX_SPEED = 1.8;
  var MAX_FORCE = 0.028;
  var SEP_RADIUS = 38;
  var ALI_RADIUS = 70;
  var COH_RADIUS = 80;

  function Vec(x, y) { this.x = x; this.y = y; }
  Vec.prototype.add  = function(v) { return new Vec(this.x+v.x, this.y+v.y); };
  Vec.prototype.sub  = function(v) { return new Vec(this.x-v.x, this.y-v.y); };
  Vec.prototype.mul  = function(s) { return new Vec(this.x*s,   this.y*s); };
  Vec.prototype.mag  = function()  { return Math.sqrt(this.x*this.x + this.y*this.y); };
  Vec.prototype.norm = function()  { var m = this.mag()||1; return new Vec(this.x/m, this.y/m); };
  Vec.prototype.limit = function(max) {
    var m = this.mag();
    return m > max ? this.norm().mul(max) : this;
  };

  function Boid() {
    var W = canvas.width, H = canvas.height;
    this.pos = new Vec(Math.random()*W, Math.random()*H);
    var a = Math.random() * Math.PI * 2;
    this.vel = new Vec(Math.cos(a)*MAX_SPEED*0.8, Math.sin(a)*MAX_SPEED*0.8);
    this.acc = new Vec(0, 0);
    this.trail = [];
  }

  Boid.prototype.steer = function (target) {
    return target.norm().mul(MAX_SPEED).sub(this.vel).limit(MAX_FORCE);
  };

  Boid.prototype.separate = function (boids) {
    var sum = new Vec(0,0), count = 0;
    for (var i=0; i<boids.length; i++) {
      var d = this.pos.sub(boids[i].pos).mag();
      if (d > 0 && d < SEP_RADIUS) {
        sum = sum.add(this.pos.sub(boids[i].pos).norm().mul(1/d));
        count++;
      }
    }
    return count ? this.steer(sum.mul(1/count)) : new Vec(0,0);
  };

  Boid.prototype.align = function (boids) {
    var sum = new Vec(0,0), count = 0;
    for (var i=0; i<boids.length; i++) {
      var d = this.pos.sub(boids[i].pos).mag();
      if (d > 0 && d < ALI_RADIUS) { sum = sum.add(boids[i].vel); count++; }
    }
    return count ? this.steer(sum.mul(1/count)) : new Vec(0,0);
  };

  Boid.prototype.cohere = function (boids) {
    var sum = new Vec(0,0), count = 0;
    for (var i=0; i<boids.length; i++) {
      var d = this.pos.sub(boids[i].pos).mag();
      if (d > 0 && d < COH_RADIUS) { sum = sum.add(boids[i].pos); count++; }
    }
    if (!count) return new Vec(0,0);
    var target = sum.mul(1/count).sub(this.pos);
    return this.steer(target);
  };

  Boid.prototype.update = function (boids) {
    var sep = this.separate(boids).mul(1.6);
    var ali = this.align(boids).mul(1.0);
    var coh = this.cohere(boids).mul(0.9);
    this.acc = sep.add(ali).add(coh);

    this.vel = this.vel.add(this.acc).limit(MAX_SPEED);
    this.pos = this.pos.add(this.vel);
    this.acc = new Vec(0,0);

    // Wrap edges
    var W = canvas.width, H = canvas.height;
    if (this.pos.x < -10)  this.pos.x = W + 10;
    if (this.pos.x > W+10) this.pos.x = -10;
    if (this.pos.y < -10)  this.pos.y = H + 10;
    if (this.pos.y > H+10) this.pos.y = -10;

    // Record trail
    this.trail.push({ x: this.pos.x, y: this.pos.y });
    if (this.trail.length > TRAIL) this.trail.shift();
  };

  Boid.prototype.drawTrail = function (c) {
    var t = this.trail;
    if (t.length < 2) return;
    c.setLineDash([3, 7]);
    c.lineCap = 'round';
    for (var i = 1; i < t.length; i++) {
      // Fade older segments: alpha increases toward the head
      var alpha = (i / t.length) * 0.38;
      c.strokeStyle = 'rgba(80,70,90,' + alpha.toFixed(3) + ')';
      c.lineWidth = 0.9;
      c.beginPath();
      c.moveTo(t[i-1].x, t[i-1].y);
      c.lineTo(t[i].x,   t[i].y);
      c.stroke();
    }
    c.setLineDash([]);
  };

  var flock = Array.from({ length: N_BOIDS }, function () { return new Boid(); });

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < flock.length; i++) flock[i].update(flock);
    for (var i = 0; i < flock.length; i++) flock[i].drawTrail(ctx);
    requestAnimationFrame(animate);
  }

  animate();
})();
