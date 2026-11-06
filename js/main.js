(function () {
  var cv = document.getElementById("g"),
    cx = cv.getContext("2d"),
    sign = document.getElementById("sign"),
    P = 3,
    W = 600,
    H = 334,
    G = 247,
    S = 2,
    K = 1,
    sat = 0,
    sy0 = 0;
  var PAL = {
    K: "#2b1b4d",
    Y: "#ffd36b",
    L: "#b9a4ff",
    D: "#1b1240",
    P: "#7c5cff",
    O: "#ff8a3d",
    R: "#ff4d6d",
    M: "#f4efff",
  };
  var base = [
    "......KK......",
    ".....KYYK.....",
    "......KK......",
    "..KKKKKKKKKK..",
    ".KLLLLLLLLLLK.",
    ".KLDDDDDDDDLK.",
    ".KLDDDDDDDDLK.",
    ".KLDDDDDDDDLK.",
    ".KLLLLLLLLLLK.",
    ".KPPPPPPPPPPK.",
    ".KPPPPPPPPPPK.",
    "..KKKKKKKKKK..",
  ];
  var duckB = [
    "..KKKKKKKKKK..",
    ".KLLLLLLLLLLK.",
    ".KLDDDDDDDDLK.",
    ".KLDDDDDDDDLK.",
    ".KLLLLLLLLLLK.",
    ".KPPPPPPPPPPK.",
    "..KKKKKKKKKK..",
  ];
  var legA = ["..KOOK..KOOK..", "..KKKK..KKKK.."],
    legB = ["...KOOK.KOOK..", "...KKKK.KKKK.."];
  var BUG = [
    "..K...K..",
    "...K.K...",
    "..KKKKK..",
    ".KRRRRRK.",
    ".KRKRKRK.",
    ".KRRRRRK.",
    ".KRKRKRK.",
    "..KRRRK..",
    "...KKK...",
  ];
  var SUN = [
    "...YYYY...",
    ".YYYYYYYY.",
    "YYYYYYYYYY",
    "YYYYYYYYYY",
    "YYYYYYYYYY",
    "YYYYYYYYYY",
    ".YYYYYYYY.",
    "...YYYY...",
  ];
  var MOON = [
    "..MMMM..",
    ".MMM....",
    "MMM.....",
    "MMM.....",
    "MMM.....",
    "MMM.....",
    ".MMM....",
    "..MMMM..",
  ];
  function spr(rows) {
    var c = document.createElement("canvas"),
      x = c.getContext("2d");
    c.width = rows[0].length;
    c.height = rows.length;
    rows.forEach(function (r, j) {
      for (var i = 0; i < r.length; i++) {
        if (r[i] !== ".") {
          x.fillStyle = PAL[r[i]];
          x.fillRect(i, j, 1, 1);
        }
      }
    });
    return c;
  }
  function dark(c) {
    var d = document.createElement("canvas"),
      x = d.getContext("2d");
    d.width = c.width;
    d.height = c.height;
    x.drawImage(c, 0, 0);
    x.globalCompositeOperation = "source-in";
    x.fillStyle = "#4a2f8f";
    x.fillRect(0, 0, d.width, d.height);
    return d;
  }
  var S0 = [spr(base.concat(legA)), spr(base.concat(legB))],
    S1 = [spr(duckB.concat(legA)), spr(duckB.concat(legB))],
    D0 = S0.map(dark),
    D1 = S1.map(dark),
    bgs = spr(BUG),
    sun = spr(SUN),
    moon = spr(MOON),
    PLAY = [
      "X.....",
      "XXX...",
      "XXXXX.",
      "XXXXXX",
      "XXXXX.",
      "XXX...",
      "X.....",
    ];
  var DAY = {
      bg: [235, 229, 246],
      fg: [43, 27, 77],
      far: [221, 210, 242],
      mid: [203, 188, 236],
    },
    NI = {
      bg: [27, 18, 64],
      fg: [235, 229, 246],
      far: [44, 30, 94],
      mid: [66, 48, 138],
    },
    C = {};
  function mixc(a, b, t) {
    return (
      "rgb(" +
      a
        .map(function (v, i) {
          return Math.round(v + (b[i] - v) * t);
        })
        .join(",") +
      ")"
    );
  }
  function rnd(a, b) {
    return a + Math.random() * (b - a);
  }
  /* estado */
  var st = "idle",
    speed = 330,
    dist = 0,
    score = 0,
    hi = 0,
    t = 0,
    T = 0,
    theme = 0,
    tgt = 0,
    flash = 0,
    lastH = 0,
    deadAt = 0,
    dk = false,
    blink = 0,
    nb = 2,
    gap = 0,
    ac = null,
    Y = { x: 44, j: 0, vy: 0, f: 0, h: 42, w: 42 },
    obs = [],
    bld = [],
    bw = 0,
    cld = [],
    cw = 0,
    tex = [],
    tw = 0,
    rows = [],
    stars = [];
  try {
    hi = +localStorage.getItem("yumi-hi") || 0;
  } catch (e) {}
  /* tela cheia: o mundo se adapta ao tamanho da janela */
  function gen() {
    var x = 0,
      i,
      k;
    bld = [];
    cld = [];
    tex = [];
    rows = [];
    stars = [];
    while (x < W + 80) {
      var w = Math.round(rnd(24, 44)),
        h = Math.round(rnd(30, 76)),
        d = [];
      for (i = 0; i < 40; i++) d.push(Math.random() < 0.4);
      bld.push({ x: x, w: w, h: h, d: d });
      x += w + Math.round(rnd(2, 10));
    }
    bw = x;
    var nc = Math.ceil(W / 220) + 2;
    cw = nc * 220;
    for (i = 0; i < nc; i++)
      cld.push({ x: i * 220 + rnd(0, 80), y: rnd(G * 0.06, G * 0.42) });
    var nt = Math.ceil(W / 24) + 4;
    tw = nt * 24;
    for (i = 0; i < nt; i++)
      tex.push({
        x: i * 24 + rnd(0, 12),
        y: G + 5 + rnd(0, 10),
        w: Math.round(rnd(2, 8)),
      });
    var nr = Math.max(1, Math.floor((H - G - 32) / 22) + 1),
      n = Math.ceil(W / 30) + 3;
    for (k = 0; k < nr; k++) {
      var it = [];
      for (i = 0; i < n; i++)
        it.push({ x: i * 30 + rnd(0, 10), s: Math.random() < 0.5 ? "0" : "1" });
      rows.push({ k: 1 - k * 0.18, y: G + 28 + k * 22, it: it, span: n * 30 });
    }
    for (i = 0; i < Math.round(W / 20); i++)
      stars.push({ x: rnd(0, W), y: rnd(6, G * 0.65), p: rnd(0, 6) });
  }
  function layout() {
    var iw = innerWidth,
      ih = innerHeight;
    S = Math.max(1, Math.min(ih / 330, iw / 600, 3.6));
    W = Math.ceil(iw / S);
    H = Math.ceil(ih / S);
    cv.width = W;
    cv.height = H;
    cx.imageSmoothingEnabled = false;
    G = Math.round(H * 0.74);
    K = Math.max(0.72, Math.min(1.3, W / 640));
    Y.x = Math.max(44, Math.min(90, Math.round(W * 0.1)));
    sat =
      (parseFloat(getComputedStyle(document.documentElement).paddingTop) || 0) /
      S;
    gen();
    obs.forEach(function (o) {
      o.y = o.t === "fly" ? G - o.lv - 22 : G - o.h;
    });
  }
  /* som (sempre ligado) */
  function snd(f, d, ty, v) {
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === "suspended") ac.resume();
      var o = ac.createOscillator(),
        g = ac.createGain();
      o.type = ty || "square";
      o.frequency.value = f;
      g.gain.value = v || 0.04;
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + d);
      o.connect(g);
      g.connect(ac.destination);
      o.start();
      o.stop(ac.currentTime + d);
    } catch (e) {}
  }
  /* ações */
  function jump() {
    Y.vy = 560;
    Y.j = 0.01;
    snd(520, 0.1);
    setTimeout(function () {
      snd(780, 0.1);
    }, 60);
  }
  function reset() {
    obs = [];
    speed = 330 * K;
    dist = 0;
    score = 0;
    t = 0;
    lastH = 0;
    flash = 0;
    Y.j = 0;
    Y.vy = 0;
    tgt = 0;
  }
  function start() {
    reset();
    st = "run";
    jump();
  }
  function act() {
    if (st === "idle") start();
    else if (st === "dead") {
      if (T - deadAt > 0.4) start();
    } else if (Y.j === 0) jump();
  }
  function die() {
    st = "dead";
    deadAt = T;
    if (score > hi) {
      hi = score;
      try {
        localStorage.setItem("yumi-hi", hi);
      } catch (e) {}
    }
    sign.classList.remove("hit");
    void sign.offsetWidth;
    sign.classList.add("hit");
    snd(180, 0.3, "sawtooth", 0.06);
    setTimeout(function () {
      snd(110, 0.35, "sawtooth", 0.06);
    }, 120);
  }
  function spawn() {
    var r = Math.random(),
      o;
    if (score > 150 && r < 0.28) {
      var lv = [8, 28, 58][Math.floor(Math.random() * 3)];
      o = { t: "fly", w: 34, h: 22, x: W + 10, y: G - lv - 22, lv: lv };
    } else if (r < 0.62) {
      o = { t: "err", w: 36, h: 42, x: W + 10, y: G - 42 };
    } else {
      var n = 1 + Math.floor(Math.random() * (score > 60 ? 3 : 2));
      o = {
        t: "bug",
        n: n,
        w: n * 27 + (n - 1) * 4,
        h: 27,
        x: W + 10,
        y: G - 27,
      };
    }
    obs.push(o);
    gap = o.w + speed * (0.78 + Math.random() * 0.55);
  }
  function hit() {
    var yy = G - Y.h - Y.j,
      a = { x: Y.x + 7, y: yy + 4, w: Y.w - 14, h: Y.h - 6 };
    for (var i = 0; i < obs.length; i++) {
      var o = obs[i];
      if (
        a.x < o.x + o.w - 3 &&
        a.x + a.w > o.x + 3 &&
        a.y < o.y + o.h - 3 &&
        a.y + a.h > o.y + 3
      )
        return true;
    }
    return false;
  }
  /* entrada: teclado, mouse e toque */
  addEventListener("keydown", function (e) {
    var k = e.key;
    if (k === " " || k === "ArrowUp" || k === "w" || k === "W") {
      e.preventDefault();
      if (!e.repeat) act();
    } else if (k === "ArrowDown" || k === "s" || k === "S") {
      e.preventDefault();
      dk = true;
    }
  });
  addEventListener("keyup", function (e) {
    if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") dk = false;
  });
  cv.addEventListener("pointerdown", function (e) {
    e.preventDefault();
    sy0 = e.clientY;
    act();
  });
  cv.addEventListener("pointermove", function (e) {
    if (e.buttons && e.clientY - sy0 > 40) dk = true;
  });
  ["pointerup", "pointercancel", "pointerleave"].forEach(function (n) {
    cv.addEventListener(n, function () {
      dk = false;
    });
  });
  /* loop */
  function mv(arr, k, dt, span) {
    arr.forEach(function (o) {
      o.x -= speed * k * dt;
      if (o.x < -60) o.x += span;
    });
  }
  function update(dt) {
    theme += (tgt - theme) * (1 - Math.exp(-1.5 * dt));
    for (var k in DAY) C[k] = mixc(DAY[k], NI[k], theme);
    if (flash > 0) flash -= dt;
    if (st === "idle") {
      nb -= dt;
      if (nb <= 0) {
        blink = 0.14;
        nb = 2 + Math.random() * 2.5;
      }
      blink -= dt;
    }
    if (st !== "run") return;
    t += dt;
    speed = Math.min(780, 330 + t * 7) * K;
    dist += (speed / K) * dt;
    score = Math.floor(dist * 0.025);
    var h = Math.floor(score / 100);
    if (h > lastH) {
      lastH = h;
      flash = 1;
      tgt = Math.floor(score / 700) % 2;
      snd(900, 0.07);
      setTimeout(function () {
        snd(1200, 0.09);
      }, 80);
    }
    if (Y.j > 0 || Y.vy > 0) {
      Y.vy -= 1900 * (dk ? 3.2 : 1) * dt;
      Y.j += Y.vy * dt;
      if (Y.j <= 0) {
        Y.j = 0;
        Y.vy = 0;
      }
    }
    Y.h = dk && Y.j === 0 ? 27 : 42;
    Y.f += (dt * speed) / K / 45;
    mv(bld, 0.12, dt, bw);
    mv(cld, 0.3, dt, cw);
    mv(tex, 1, dt, tw);
    rows.forEach(function (r) {
      mv(r.it, r.k, dt, r.span);
    });
    obs.forEach(function (o) {
      o.x -= (speed + (o.t === "fly" ? 50 : 0)) * dt;
    });
    while (obs.length && obs[0].x + obs[0].w < -10) obs.shift();
    var L = obs[obs.length - 1];
    if (t > 1.3 && (!L || L.x + L.w < W - gap)) spawn();
    if (hit()) die();
  }
  function txt(s, x, y, sz, al) {
    cx.font = sz + 'px "Press Start 2P",monospace';
    cx.textAlign = al || "left";
    cx.fillText(s, x, y);
  }
  function icon(rowsA, x, y, sc) {
    for (var j = 0; j < rowsA.length; j++)
      for (var i = 0; i < rowsA[j].length; i++)
        if (rowsA[j][i] === "X") cx.fillRect(x + i * sc, y + j * sc, sc, sc);
  }
  function draw() {
    cx.fillStyle = C.bg;
    cx.fillRect(0, 0, W, H);
    /* céu */
    cx.fillStyle = C.fg;
    stars.forEach(function (s) {
      cx.globalAlpha = theme * (0.35 + 0.45 * Math.sin(T * 2 + s.p));
      cx.fillRect(Math.round(s.x), Math.round(s.y), 2, 2);
    });
    var sx = Math.round(W * 0.74),
      sy = Math.round(G * 0.28);
    cx.globalAlpha = 1 - theme;
    cx.drawImage(sun, sx, sy, 30, 24);
    cx.globalAlpha = theme;
    cx.drawImage(moon, sx + 4, sy, 24, 24);
    cx.globalAlpha = 1;
    /* prédios de servidor */
    bld.forEach(function (b, i) {
      var by = G - b.h,
        bx = Math.round(b.x);
      cx.fillStyle = C.far;
      cx.fillRect(bx, by, b.w, b.h);
      cx.fillStyle = C.mid;
      for (var j = 0; j < b.d.length; j++) {
        if (!b.d[j]) continue;
        var wx = 4 + (j % 5) * 7,
          wy = 5 + Math.floor(j / 5) * 8;
        if (wx + 2 < b.w && wy + 2 < b.h) cx.fillRect(bx + wx, by + wy, 2, 2);
      }
      cx.fillStyle = Math.floor(T * 2 + i) % 2 ? "#7dffb2" : "#ff6fa8";
      cx.fillRect(bx + 3, by - 3, 3, 3);
    });
    /* nuvens */
    cx.fillStyle = C.mid;
    cld.forEach(function (c) {
      var x = Math.round(c.x),
        y = Math.round(c.y);
      cx.fillRect(x + 12, y, 16, 4);
      cx.fillRect(x + 4, y + 4, 32, 4);
      cx.fillRect(x, y + 8, 48, 4);
      cx.fillRect(x + 4, y + 12, 40, 4);
    });
    /* chão */
    cx.fillStyle = C.far;
    cx.fillRect(0, G + 2, W, H - G - 2);
    cx.fillStyle = C.fg;
    cx.fillRect(0, G, W, 2);
    cx.globalAlpha = 0.5;
    tex.forEach(function (d) {
      cx.fillRect(Math.round(d.x), Math.round(d.y), d.w, 2);
    });
    cx.fillStyle = C.mid;
    rows.forEach(function (r, ri) {
      cx.globalAlpha = Math.max(0.25, 0.65 - ri * 0.1);
      r.it.forEach(function (b) {
        txt(b.s, Math.round(b.x), r.y, 8);
      });
    });
    cx.globalAlpha = 1;
    /* obstáculos */
    obs.forEach(function (o) {
      if (o.t === "bug") {
        for (var i = 0; i < o.n; i++) {
          var bx = Math.round(o.x) + i * 31;
          cx.save();
          if (Math.floor(T * 6 + i) % 2) {
            cx.translate(bx + 27, o.y);
            cx.scale(-1, 1);
            cx.drawImage(bgs, 0, 0, 27, 27);
          } else cx.drawImage(bgs, bx, o.y, 27, 27);
          cx.restore();
        }
      } else if (o.t === "err") {
        var x = Math.round(o.x);
        cx.fillStyle = C.fg;
        cx.fillRect(x + 3, o.y + 3, 36, 42);
        cx.fillStyle = "#ff6fa8";
        cx.fillRect(x, o.y, 36, 42);
        cx.fillStyle = "#e0508a";
        cx.fillRect(x + 2, o.y + 2, 32, 8);
        cx.strokeStyle = C.fg;
        cx.lineWidth = 2;
        cx.strokeRect(x + 1, o.y + 1, 34, 40);
        cx.fillStyle = "#fff";
        txt("404", x + 18, o.y + 31, 8, "center");
      } else {
        var fx = Math.round(o.x),
          fy = o.y + (Math.floor(T * 8) % 2) * 2;
        cx.fillStyle = C.fg;
        cx.fillRect(fx + 3, fy + 3, 34, 22);
        cx.fillStyle = "#fff";
        cx.fillRect(fx, fy, 34, 22);
        cx.fillStyle = "#ff8a3d";
        cx.fillRect(fx, fy, 34, 7);
        cx.fillStyle = "#fff";
        cx.fillRect(fx + 28, fy + 2, 4, 3);
        cx.strokeStyle = C.fg;
        cx.lineWidth = 2;
        cx.strokeRect(fx + 1, fy + 1, 32, 20);
        cx.fillStyle = "#ff4d6d";
        txt("!", fx + 17, fy + 19, 8, "center");
      }
    });
    /* Yumi */
    var duck = dk && Y.j === 0 && st === "run",
      fr = st === "run" && Y.j === 0 ? Math.floor(Y.f) % 2 : Y.j > 0 ? 1 : 0,
      A = duck ? S1 : S0,
      Dk = duck ? D1 : D0,
      hh = duck ? 27 : 42,
      yy = G - hh - Y.j,
      x = Y.x;
    cx.fillStyle = C.fg;
    cx.globalAlpha = 0.16 * (1 - Math.min(1, Y.j / 90));
    cx.beginPath();
    cx.ellipse(x + 21, G + 3, 18 * (1 - Y.j / 300), 3, 0, 0, 6.283);
    cx.fill();
    cx.globalAlpha = 1;
    for (var i = 2; i >= 1; i--) cx.drawImage(Dk[fr], x + i, yy + i, 42, hh);
    cx.drawImage(A[fr], x, yy, 42, hh);
    var ey = yy + (duck ? 2 : 5) * P;
    if (st === "dead") {
      cx.strokeStyle = "#ff6fa8";
      cx.lineWidth = 2;
      [4, 8].forEach(function (c) {
        var ex = x + c * P;
        cx.beginPath();
        cx.moveTo(ex, ey);
        cx.lineTo(ex + 2 * P, ey + 2 * P);
        cx.moveTo(ex + 2 * P, ey);
        cx.lineTo(ex, ey + 2 * P);
        cx.stroke();
      });
    } else {
      var cl = st === "idle" && blink > 0;
      cx.fillStyle = "#7dffb2";
      cx.shadowColor = "#7dffb2";
      cx.shadowBlur = 6;
      [4, 8].forEach(function (c) {
        cx.fillRect(x + c * P, ey + (cl ? P : 0), 2 * P, cl ? P : 2 * P);
      });
      cx.shadowBlur = 0;
    }
    /* placar */
    var hy = 16 + sat;
    cx.fillStyle = C.fg;
    cx.globalAlpha = 0.55;
    txt("HI " + ("00000" + hi).slice(-5), W - 108, hy, 8, "right");
    cx.globalAlpha = 1;
    if (!(flash > 0 && Math.floor(flash * 10) % 2 === 0))
      txt(("00000" + score).slice(-5), W - 10, hy, 8, "right");
    /* início e fim: só ícone, sem texto de ajuda */
    var cy = Math.round(G * 0.42);
    if (st === "dead") txt("GAME OVER", W / 2, cy, 14, "center");
    if (st !== "run" && Math.floor(T * 2) % 2) {
      cx.fillStyle = C.fg;
      icon(PLAY, Math.round(W / 2 - 9), cy + (st === "dead" ? 16 : -10), 3);
    }
  }
  var last = performance.now();
  function frame(now) {
    var dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    T += dt;
    update(dt);
    draw();
    requestAnimationFrame(frame);
  }
  addEventListener("resize", layout);
  layout();
  if (document.fonts && document.fonts.load)
    document.fonts.load('8px "Press Start 2P"');
  update(0);
  requestAnimationFrame(frame);
})();
