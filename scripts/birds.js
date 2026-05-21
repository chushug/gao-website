(function () {
  var path = window.location.pathname;
  if (!/(\/|(\/index\.html))$/.test(path) && !path.endsWith('/gao-website/')) return;

  var canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;';
  document.body.insertBefore(canvas, document.body.firstChild);
  var ctx = canvas.getContext('2d');

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  /* ── Vec2 ─────────────────────────────────────── */
  function Vec(x, y) { this.x = x; this.y = y; }
  Vec.prototype.add   = function(v) { return new Vec(this.x+v.x, this.y+v.y); };
  Vec.prototype.sub   = function(v) { return new Vec(this.x-v.x, this.y-v.y); };
  Vec.prototype.mul   = function(s) { return new Vec(this.x*s,   this.y*s); };
  Vec.prototype.mag   = function()  { return Math.sqrt(this.x*this.x+this.y*this.y)||0.001; };
  Vec.prototype.norm  = function()  { var m=this.mag(); return new Vec(this.x/m, this.y/m); };
  Vec.prototype.limit = function(max) { return this.mag()>max ? this.norm().mul(max) : this; };

  /* ── Boid ─────────────────────────────────────── */
  var N         = 45;
  var MAX_SPD   = 2.0;
  var MAX_F     = 0.032;
  var R_SEP     = 30;
  var R_ALI     = 65;
  var R_COH     = 80;

  function Boid() {
    var W = canvas.width, H = canvas.height;
    // Start clustered near center so they flock quickly
    this.pos = new Vec(W*0.3 + Math.random()*W*0.4, H*0.2 + Math.random()*H*0.6);
    var a = Math.random() * Math.PI * 2;
    this.vel = new Vec(Math.cos(a)*MAX_SPD, Math.sin(a)*MAX_SPD);
    this.acc = new Vec(0,0);
  }

  Boid.prototype.edges = function() {
    var W = canvas.width, H = canvas.height;
    if (this.pos.x < -20)  this.pos.x = W+20;
    if (this.pos.x > W+20) this.pos.x = -20;
    if (this.pos.y < -20)  this.pos.y = H+20;
    if (this.pos.y > H+20) this.pos.y = -20;
  };

  Boid.prototype.flock = function(boids) {
    var sepSum=new Vec(0,0), aliSum=new Vec(0,0), cohSum=new Vec(0,0);
    var sc=0, ac=0, cc=0;
    for (var i=0; i<boids.length; i++) {
      var b = boids[i];
      if (b===this) continue;
      var d = this.pos.sub(b.pos).mag();
      if (d < R_SEP) { sepSum = sepSum.add(this.pos.sub(b.pos).norm().mul(1/d)); sc++; }
      if (d < R_ALI) { aliSum = aliSum.add(b.vel); ac++; }
      if (d < R_COH) { cohSum = cohSum.add(b.pos); cc++; }
    }
    var f = new Vec(0,0);
    if (sc) f = f.add(this._steer(sepSum.mul(1/sc)).mul(1.7));
    if (ac) f = f.add(this._steer(aliSum.mul(1/ac)).mul(1.1));
    if (cc) f = f.add(this._steer(cohSum.mul(1/cc).sub(this.pos)).mul(1.0));
    this.acc = f;
  };

  Boid.prototype._steer = function(target) {
    return target.norm().mul(MAX_SPD).sub(this.vel).limit(MAX_F);
  };

  Boid.prototype.update = function(boids) {
    this.flock(boids);
    this.vel = this.vel.add(this.acc).limit(MAX_SPD);
    this.pos = this.pos.add(this.vel);
    this.acc = new Vec(0,0);
    this.edges();
  };

  /* ── Draw chevron arrow ───────────────────────── */
  function drawArrow(x, y, angle, alpha, sz) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.strokeStyle = 'rgba(75,65,88,' + alpha.toFixed(3) + ')';
    ctx.lineWidth = 1.1;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo( sz,   0);       // tip
    ctx.lineTo(-sz*0.7, -sz*0.55); // left arm
    ctx.moveTo( sz,   0);
    ctx.lineTo(-sz*0.7,  sz*0.55); // right arm
    ctx.stroke();
    ctx.restore();
  }

  /* ── Snapshot-based ghost trail ───────────────── */
  var SNAP_INTERVAL = 6;   // save snapshot every N frames
  var SNAP_COUNT    = 5;   // how many ghosts to keep
  var snapshots     = [];
  var frame         = 0;

  var flock = Array.from({ length: N }, function() { return new Boid(); });

  function animate() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update physics
    for (var i=0; i<flock.length; i++) flock[i].update(flock);

    // Save snapshot
    if (frame % SNAP_INTERVAL === 0) {
      var snap = flock.map(function(b) {
        return { x: b.pos.x, y: b.pos.y, a: Math.atan2(b.vel.y, b.vel.x) };
      });
      snapshots.push(snap);
      if (snapshots.length > SNAP_COUNT) snapshots.shift();
    }

    // Draw ghost snapshots (oldest = most faded)
    for (var s=0; s<snapshots.length; s++) {
      var t = (s+1) / (snapshots.length+1); // 0→1, older=lower
      var alpha = t * t * 0.18;             // sparse: max ~0.18 for newest ghost
      var sz = 4.5 + t * 1.5;
      for (var j=0; j<snapshots[s].length; j++) {
        var g = snapshots[s][j];
        drawArrow(g.x, g.y, g.a, alpha, sz);
      }
    }

    // Draw current flock
    for (var i=0; i<flock.length; i++) {
      var b = flock[i];
      var angle = Math.atan2(b.vel.y, b.vel.x);
      drawArrow(b.pos.x, b.pos.y, angle, 0.55, 6);
    }

    requestAnimationFrame(animate);
  }

  animate();
})();
