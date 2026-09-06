/* ==========================================================================
   Q-Readiness | Cross-fade stage — five "Q" diamond fields (WebGL2)
   One fullscreen canvas draws five Q marks (one per section). Scroll scrubs
   a cross-fade between them. Each Q crystallizes on arrival, gives way under
   the cursor while it's inside (tension), and click sends a splash.
   ========================================================================== */
(function () {
  'use strict';

  // Section order drives both the shader marks and the DOM cross-fade.
  // Hero is a big centered Q (tagline sits inside its counter).
  var SECTIONS = [
    { color: [0xD4, 0xA0, 0x43], x: 0.00, y: 0.00, scale: 1.00 },  // Hero — gold, big
    { color: [0xC2, 0x5A, 0x33], x: 0.78, y: 0.30, scale: 0.22 },  // Stakes — copper, top-right
    { color: [0xA0, 0xA6, 0x4A], x: 0.78, y: -0.30, scale: 0.22 }, // BOM — sage, bottom-right
    { color: [0x5C, 0xB8, 0x7A], x: -0.72, y: 0.23, scale: 0.22 }, // How we think — green, top-left
    { color: [0x6C, 0x8E, 0xBF], x: -0.72, y: -0.25, scale: 0.22 } // Contact — steel-blue, bottom-left
  ];
  var N = SECTIONS.length;

  function init() {
    var canvas = document.getElementById('qbg');
    if (!canvas) return;

    var gl = canvas.getContext('webgl2', { antialias: true, alpha: false });
    if (!gl) return; // graceful fallback: no WebGL2

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var sectionEls = Array.prototype.slice.call(document.querySelectorAll('.stage-section'));

    var VERT = '#version 300 es\n' +
      'in vec2 aPosition;\n' +
      'void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }\n';

    var FRAG = [
      '#version 300 es',
      'precision highp float;',
      'uniform vec2  uResolution;',
      'uniform float uTime;',
      'uniform float uPixelSize;',
      'uniform vec3  uColor[5];',
      'uniform vec3  uShape[5];',
      'uniform float uReveal[5];',
      'uniform vec2  uMouse;',
      'uniform vec4  uRipples[8];',
      'out vec4 fragColor;',
      '',
      'float Bayer2(vec2 a){ a=floor(a); return fract(a.x/2. + a.y*a.y*.75); }',
      '#define Bayer4(a) (Bayer2(.5*(a))*0.25 + Bayer2(a))',
      '#define Bayer8(a) (Bayer4(.5*(a))*0.25 + Bayer2(a))',
      '',
      '#define FBM_OCTAVES 5',
      '#define FBM_LACUNARITY 1.25',
      '#define FBM_GAIN 1.0',
      '#define FBM_SCALE 4.0',
      'float hash11(float n){ return fract(sin(n)*43758.5453); }',
      'float vnoise(vec3 p){',
      '  vec3 ip=floor(p); vec3 fp=fract(p);',
      '  float n000=hash11(dot(ip+vec3(0.,0.,0.), vec3(1.,57.,113.)));',
      '  float n100=hash11(dot(ip+vec3(1.,0.,0.), vec3(1.,57.,113.)));',
      '  float n010=hash11(dot(ip+vec3(0.,1.,0.), vec3(1.,57.,113.)));',
      '  float n110=hash11(dot(ip+vec3(1.,1.,0.), vec3(1.,57.,113.)));',
      '  float n001=hash11(dot(ip+vec3(0.,0.,1.), vec3(1.,57.,113.)));',
      '  float n101=hash11(dot(ip+vec3(1.,0.,1.), vec3(1.,57.,113.)));',
      '  float n011=hash11(dot(ip+vec3(0.,1.,1.), vec3(1.,57.,113.)));',
      '  float n111=hash11(dot(ip+vec3(1.,1.,1.), vec3(1.,57.,113.)));',
      '  vec3 w=fp*fp*fp*(fp*(fp*6.-15.)+10.);',
      '  float x00=mix(n000,n100,w.x); float x10=mix(n010,n110,w.x);',
      '  float x01=mix(n001,n101,w.x); float x11=mix(n011,n111,w.x);',
      '  float y0=mix(x00,x10,w.y);    float y1=mix(x01,x11,w.y);',
      '  return mix(y0,y1,w.z)*2.-1.;',
      '}',
      'float fbm2(vec2 uv, float t){',
      '  vec3 p=vec3(uv*FBM_SCALE, t);',
      '  float amp=1., freq=1., sum=1.;',
      '  for(int i=0;i<FBM_OCTAVES;i++){ sum+=amp*vnoise(p*freq); freq*=FBM_LACUNARITY; amp*=FBM_GAIN; }',
      '  return sum*0.5+0.5;',
      '}',
      '',
      'float maskDiamond(vec2 p, float cov){ float r=sqrt(cov)*0.564; return step(abs(p.x-0.49)+abs(p.y-0.49), r); }',
      '',
      'float sdSegment(vec2 p, vec2 a, vec2 b){ vec2 pa=p-a, ba=b-a; float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.); return length(pa-ba*h); }',
      'float sdQ(vec2 p){',
      '  float R=0.44;',
      '  float t=0.10;',
      '  float ring = abs(length(p)-R) - t;',
      '  vec2 ta = vec2(R*0.55, -R*0.55);',
      '  vec2 tb = vec2(R*1.05, -R*1.05);',
      '  float tail = sdSegment(p, ta, tb) - t*0.5;',
      '  return min(ring, tail);',
      '}',
      '',
      'void main(){',
      '  float pixelSize = max(uPixelSize, 1.0);',
      '  vec2 fragCoord = gl_FragCoord.xy - uResolution*0.5;',
      '  float aspect = uResolution.x / uResolution.y;',
      '  vec2 qBase = fragCoord / uResolution.y;',
      '',
      '  vec2 pixelId = floor(fragCoord/pixelSize);',
      '  vec2 pixelUV = fract(fragCoord/pixelSize);',
      '  float cellPixelSize = 8.0*pixelSize;',
      '  vec2 cellId = floor(fragCoord/cellPixelSize);',
      '  vec2 cellCoord = cellId*cellPixelSize;',
      '  vec2 uv = cellCoord/uResolution*vec2(aspect, 1.0);',
      '',
      '  float noise = fbm2(uv, uTime*0.08);',
      '  float bayer = Bayer8(fragCoord/pixelSize) - 0.5;',
      '',
      '  // click splash: bright expanding rings of diamonds',
      '  float boost = 0.0;',
      '  for (int i=0; i<8; i++){',
      '    vec4 rp = uRipples[i];',
      '    if (rp.z < 0.0) continue;',
      '    float age = uTime - rp.z;',
      '    if (age < 0.0 || age > 2.0) continue;',
      '    vec2 dq = qBase - rp.xy;',
      '    float dist = length(dq);',
      '    float waveR = 0.6 * age;',
      '    float ring = exp(-pow((dist - waveR) / 0.06, 2.0));',
      '    float atten = exp(-1.8 * age);',
      '    boost = max(boost, ring * atten * rp.w);',
      '  }',
      '',
      '  float sig = clamp(noise*0.5 + 0.10 + boost*1.5, 0.0, 1.0);',
      '',
      '  vec3 col = vec3(0.039, 0.055, 0.043);',
      '  for (int i=0; i<5; i++){',
      '    vec2 qLocal = (qBase - uShape[i].xy) / uShape[i].z;',
      '    vec2 mouseLocal = (uMouse - uShape[i].xy) / uShape[i].z;',
      '',
      '    // radial reveal: crystallize outward from the center',
      '    float rN = length(qLocal) / 0.75;',
      '    float radial = 1.0 - smoothstep(uReveal[i] - 0.08, uReveal[i], rN);',
      '',
      '    float bw = step(0.5, sig * radial + bayer);',
      '    float M = maskDiamond(pixelUV, bw);',
      '',
      '    // tension: this Q gives way while the cursor is inside it',
      '    float mD = sdQ(mouseLocal);',
      '    float inside = 1.0 - smoothstep(0.0, 0.03, mD);',
      '    vec2 toM = qLocal - mouseLocal;',
      '    float dm = length(toM);',
      '    float stir = exp(-(dm * dm) / (2.0 * 0.06 * 0.06)) * inside;',
      '',
      '    float qd = sdQ(qLocal) - stir * 0.08;',
      '    float qMask = 1.0 - smoothstep(0.0, fwidth(qd)*1.5, qd);',
      '',
      '    col += uColor[i] * (M * qMask);',
      '  }',
      '  fragColor = vec4(col, 1.0);',
      '}'
    ].join('\n');

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('stage shader compile failed:', gl.getShaderInfoLog(s));
        throw new Error('shader compile failed');
      }
      return s;
    }

    var prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('stage link failed:', gl.getProgramInfoLog(prog));
      throw new Error('link failed');
    }
    gl.useProgram(prog);

    var vao = gl.createVertexArray(); gl.bindVertexArray(vao);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var aPos = gl.getAttribLocation(prog, 'aPosition');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    var U = {
      res: gl.getUniformLocation(prog, 'uResolution'),
      time: gl.getUniformLocation(prog, 'uTime'),
      px: gl.getUniformLocation(prog, 'uPixelSize'),
      color: gl.getUniformLocation(prog, 'uColor'),
      shape: gl.getUniformLocation(prog, 'uShape'),
      reveal: gl.getUniformLocation(prog, 'uReveal'),
      mouse: gl.getUniformLocation(prog, 'uMouse'),
      ripples: gl.getUniformLocation(prog, 'uRipples')
    };

    var colorData = [], shapeData = [];
    for (var i = 0; i < N; i++) {
      colorData.push(SECTIONS[i].color[0] / 255, SECTIONS[i].color[1] / 255, SECTIONS[i].color[2] / 255);
      shapeData.push(SECTIONS[i].x, SECTIONS[i].y, SECTIONS[i].scale);
    }
    gl.uniform3fv(U.color, colorData);
    gl.uniform3fv(U.shape, shapeData);

    function resize() {
      var w = canvas.clientWidth || window.innerWidth;
      var h = canvas.clientHeight || window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    window.addEventListener('resize', resize);
    resize();

    function cubicBezier(x1, y1, x2, y2) {
      var cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
      var cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
      function sampleX(t) { return ((ax * t + bx) * t + cx) * t; }
      function sampleY(t) { return ((ay * t + by) * t + cy) * t; }
      function sampleDX(t) { return (3 * ax * t + 2 * bx) * t + cx; }
      function solveX(x) {
        var t = x, i, e, d, lo, hi;
        for (i = 0; i < 8; i++) {
          e = sampleX(t) - x;
          if (Math.abs(e) < 1e-6) return t;
          d = sampleDX(t);
          if (Math.abs(d) < 1e-6) break;
          t -= e / d;
        }
        lo = 0; hi = 1; t = x;
        while (lo < hi) {
          e = sampleX(t);
          if (Math.abs(e - x) < 1e-6) return t;
          if (x > e) lo = t; else hi = t;
          t = (hi - lo) * 0.5 + lo;
        }
        return t;
      }
      return function (x) { return x <= 0 ? 0 : x >= 1 ? 1 : sampleY(solveX(x)); };
    }
    var luxury = cubicBezier(0.65, 0, 0.35, 1);

    var loadStart = performance.now();
    var mouseQ = { x: 0, y: -5 };
    var ripples = [];

    function maxScroll() {
      return Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    }

    function sectionReveal(t, i) {
      var c = i / (N - 1);
      var half = 1 / (N - 1);
      var lo = c - half * 0.5;
      var hi = c + half * 0.5;
      var w = half * 0.15;  // short fade at each edge

      if (t < lo || t > hi) return 0;
      if (t < lo + w) return luxury((t - lo) / w);                 // fade in
      if (t > hi - w) return 1 - luxury((t - (hi - w)) / w);       // fade out
      return 1;  // hold at 100%
    }

    function toQ(clientX, clientY) {
      var r = canvas.getBoundingClientRect();
      return {
        x: (clientX - r.left - r.width / 2) / r.height,
        y: (r.height / 2 - (clientY - r.top)) / r.height
      };
    }

    canvas.addEventListener('pointermove', function (e) {
      var p = toQ(e.clientX, e.clientY);
      mouseQ.x = p.x; mouseQ.y = p.y;
    });
    canvas.addEventListener('pointerdown', function (e) {
      var p = toQ(e.clientX, e.clientY);
      ripples.push({ x: p.x, y: p.y, t: (performance.now() - loadStart) / 1000, s: 1.0 });
      if (ripples.length > 8) ripples.shift();
    });

    var reveals = [0, 0, 0, 0, 0];

    function draw(now) {
      gl.clearColor(0.039, 0.055, 0.043, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(prog);

      var t = window.scrollY / maxScroll();
      var loadEase = reducedMotion ? 1 : luxury(Math.min(1, (now - loadStart) / 2200));

      for (var i = 0; i < N; i++) {
        var r = sectionReveal(t, i);
        if (i === 0) r *= loadEase;
        reveals[i] = r;
        if (sectionEls[i]) {
          sectionEls[i].style.opacity = String(r);
          sectionEls[i].style.visibility = r > 0.01 ? 'visible' : 'hidden';
        }
      }

      var rippleData = new Float32Array(8 * 4);
      for (var j = 0; j < 8; j++) {
        var rp = ripples[j];
        if (rp) { rippleData[j * 4] = rp.x; rippleData[j * 4 + 1] = rp.y; rippleData[j * 4 + 2] = rp.t; rippleData[j * 4 + 3] = rp.s; }
        else { rippleData[j * 4 + 2] = -1; }
      }

      gl.uniform2f(U.res, canvas.width, canvas.height);
      gl.uniform1f(U.time, reducedMotion ? 0 : (now - loadStart) / 1000);
      gl.uniform1f(U.px, 1);
      gl.uniform1fv(U.reveal, reveals);
      gl.uniform2f(U.mouse, mouseQ.x, mouseQ.y);
      gl.uniform4fv(U.ripples, rippleData);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function frame(now) { draw(now); requestAnimationFrame(frame); }
    requestAnimationFrame(frame);
  }

  function initLogo() {
    var canvas = document.getElementById('logo-q');
    if (!canvas) return;
    var gl = canvas.getContext('webgl2', { antialias: true, alpha: true });
    if (!gl) return;

    var VERT = '#version 300 es\nin vec2 aPosition;\nvoid main() { gl_Position = vec4(aPosition, 0.0, 1.0); }\n';

    var FRAG = [
      '#version 300 es',
      'precision highp float;',
      'uniform vec2 uResolution;',
      'uniform float uTime;',
      'out vec4 fragColor;',
      'float Bayer2(vec2 a){ a=floor(a); return fract(a.x/2. + a.y*a.y*.75); }',
      '#define Bayer4(a) (Bayer2(.5*(a))*0.25 + Bayer2(a))',
      '#define Bayer8(a) (Bayer4(.5*(a))*0.25 + Bayer2(a))',
      'float hash11(float n){ return fract(sin(n)*43758.5453); }',
      'float vnoise(vec3 p){',
      '  vec3 ip=floor(p); vec3 fp=fract(p);',
      '  float n000=hash11(dot(ip+vec3(0.,0.,0.), vec3(1.,57.,113.)));',
      '  float n100=hash11(dot(ip+vec3(1.,0.,0.), vec3(1.,57.,113.)));',
      '  float n010=hash11(dot(ip+vec3(0.,1.,0.), vec3(1.,57.,113.)));',
      '  float n110=hash11(dot(ip+vec3(1.,1.,0.), vec3(1.,57.,113.)));',
      '  float n001=hash11(dot(ip+vec3(0.,0.,1.), vec3(1.,57.,113.)));',
      '  float n101=hash11(dot(ip+vec3(1.,0.,1.), vec3(1.,57.,113.)));',
      '  float n011=hash11(dot(ip+vec3(0.,1.,1.), vec3(1.,57.,113.)));',
      '  float n111=hash11(dot(ip+vec3(1.,1.,1.), vec3(1.,57.,113.)));',
      '  vec3 w=fp*fp*fp*(fp*(fp*6.-15.)+10.);',
      '  float x00=mix(n000,n100,w.x); float x10=mix(n010,n110,w.x);',
      '  float x01=mix(n001,n101,w.x); float x11=mix(n011,n111,w.x);',
      '  float y0=mix(x00,x10,w.y);    float y1=mix(x01,x11,w.y);',
      '  return mix(y0,y1,w.z)*2.-1.;',
      '}',
      'float fbm2(vec2 uv, float t){',
      '  vec3 p=vec3(uv*4.0, t);',
      '  float amp=1., freq=1., sum=1.;',
      '  for(int i=0;i<5;i++){ sum+=amp*vnoise(p*freq); freq*=1.25; }',
      '  return sum*0.5+0.5;',
      '}',
      'float maskDiamond(vec2 p, float cov){ float r=sqrt(cov)*0.564; return step(abs(p.x-0.49)+abs(p.y-0.49), r); }',
      'float sdSegment(vec2 p, vec2 a, vec2 b){ vec2 pa=p-a, ba=b-a; float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.); return length(pa-ba*h); }',
      'float sdQ(vec2 p){',
      '  float R=0.33;',
      '  float t=0.075;',
      '  float ring = abs(length(p)-R) - t;',
      '  vec2 ta = vec2(R*0.55, -R*0.55);',
      '  vec2 tb = vec2(R*1.05, -R*1.05);',
      '  float tail = sdSegment(p, ta, tb) - t*0.5;',
      '  return min(ring, tail);',
      '}',
      'void main(){',
      '  vec2 fragCoord = gl_FragCoord.xy - uResolution*0.5;',
      '  vec2 q = fragCoord / uResolution.y;',
      '  float qd = sdQ(q);',
      '  float qMask = 1.0 - smoothstep(0.0, fwidth(qd)*1.5, qd);',
      '  fragColor = vec4(vec3(0.827, 0.627, 0.263) * qMask, qMask);',
      '}'
    ].join('\n');

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error('logo shader:', gl.getShaderInfoLog(s)); return null; }
      return s;
    }
    var vs = compile(gl.VERTEX_SHADER, VERT);
    var fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.error(gl.getProgramInfoLog(prog)); return; }
    gl.useProgram(prog);

    var vao = gl.createVertexArray(); gl.bindVertexArray(vao);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var aPos = gl.getAttribLocation(prog, 'aPosition');
    gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    var uRes = gl.getUniformLocation(prog, 'uResolution');
    var uTime = gl.getUniformLocation(prog, 'uTime');
    var SIZE = 160;
    canvas.width = SIZE; canvas.height = SIZE;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(prog);
    gl.uniform2f(uRes, SIZE, SIZE);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function initLockQ() {
    var canvas = document.getElementById('lock-qbg');
    if (!canvas) return;
    var gl = canvas.getContext('webgl2', { antialias: true, alpha: false });
    if (!gl) return;

    var VERT = '#version 300 es\nin vec2 aPosition;\nvoid main() { gl_Position = vec4(aPosition, 0.0, 1.0); }\n';

    var FRAG = [
      '#version 300 es',
      'precision highp float;',
      'uniform vec2 uResolution;',
      'uniform float uTime;',
      'out vec4 fragColor;',
      'float Bayer2(vec2 a){ a=floor(a); return fract(a.x/2. + a.y*a.y*.75); }',
      '#define Bayer4(a) (Bayer2(.5*(a))*0.25 + Bayer2(a))',
      '#define Bayer8(a) (Bayer4(.5*(a))*0.25 + Bayer2(a))',
      'float hash11(float n){ return fract(sin(n)*43758.5453); }',
      'float vnoise(vec3 p){',
      '  vec3 ip=floor(p); vec3 fp=fract(p);',
      '  float n000=hash11(dot(ip+vec3(0.,0.,0.), vec3(1.,57.,113.)));',
      '  float n100=hash11(dot(ip+vec3(1.,0.,0.), vec3(1.,57.,113.)));',
      '  float n010=hash11(dot(ip+vec3(0.,1.,0.), vec3(1.,57.,113.)));',
      '  float n110=hash11(dot(ip+vec3(1.,1.,0.), vec3(1.,57.,113.)));',
      '  float n001=hash11(dot(ip+vec3(0.,0.,1.), vec3(1.,57.,113.)));',
      '  float n101=hash11(dot(ip+vec3(1.,0.,1.), vec3(1.,57.,113.)));',
      '  float n011=hash11(dot(ip+vec3(0.,1.,1.), vec3(1.,57.,113.)));',
      '  float n111=hash11(dot(ip+vec3(1.,1.,1.), vec3(1.,57.,113.)));',
      '  vec3 w=fp*fp*fp*(fp*(fp*6.-15.)+10.);',
      '  float x00=mix(n000,n100,w.x); float x10=mix(n010,n110,w.x);',
      '  float x01=mix(n001,n101,w.x); float x11=mix(n011,n111,w.x);',
      '  float y0=mix(x00,x10,w.y);    float y1=mix(x01,x11,w.y);',
      '  return mix(y0,y1,w.z)*2.-1.;',
      '}',
      'float fbm2(vec2 uv, float t){',
      '  vec3 p=vec3(uv*4.0, t);',
      '  float amp=1., freq=1., sum=1.;',
      '  for(int i=0;i<5;i++){ sum+=amp*vnoise(p*freq); freq*=1.25; }',
      '  return sum*0.5+0.5;',
      '}',
      'float maskDiamond(vec2 p, float cov){ float r=sqrt(cov)*0.564; return step(abs(p.x-0.49)+abs(p.y-0.49), r); }',
      'float sdSegment(vec2 p, vec2 a, vec2 b){ vec2 pa=p-a, ba=b-a; float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.); return length(pa-ba*h); }',
      'float sdQ(vec2 p){',
      '  float R=0.44;',
      '  float t=0.10;',
      '  float ring = abs(length(p)-R) - t;',
      '  vec2 ta = vec2(R*0.55, -R*0.55);',
      '  vec2 tb = vec2(R*1.05, -R*1.05);',
      '  float tail = sdSegment(p, ta, tb) - t*0.5;',
      '  return min(ring, tail);',
      '}',
      'void main(){',
      '  vec2 fragCoord = gl_FragCoord.xy - uResolution*0.5;',
      '  vec2 q = fragCoord / uResolution.y;',
      '  vec2 pixelUV = fract(fragCoord);',
      '  float cellPixelSize = 8.0;',
      '  vec2 cellId = floor(fragCoord/cellPixelSize);',
      '  vec2 cellCoord = cellId*cellPixelSize;',
      '  vec2 uv = cellCoord/uResolution;',
      '  float noise = fbm2(uv, uTime*0.08);',
      '  float bayer = Bayer8(fragCoord) - 0.5;',
      '  float sig = clamp(noise*0.5 + 0.10, 0.0, 1.0);',
      '  float bw = step(0.5, sig + bayer);',
      '  float M = maskDiamond(pixelUV, bw);',
      '  float qd = sdQ(q);',
      '  float qMask = 1.0 - smoothstep(0.0, fwidth(qd)*1.5, qd);',
      '  vec3 col = vec3(0.039, 0.055, 0.043);',
      '  col += vec3(0.827, 0.627, 0.263) * (M * qMask);',
      '  fragColor = vec4(col, 1.0);',
      '}'
    ].join('\n');

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error('lock shader:', gl.getShaderInfoLog(s)); return null; }
      return s;
    }
    var vs = compile(gl.VERTEX_SHADER, VERT);
    var fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.error(gl.getProgramInfoLog(prog)); return; }
    gl.useProgram(prog);

    var vao = gl.createVertexArray(); gl.bindVertexArray(vao);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var aPos = gl.getAttribLocation(prog, 'aPosition');
    gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    var uRes = gl.getUniformLocation(prog, 'uResolution');
    var uTime = gl.getUniformLocation(prog, 'uTime');

    function resize() {
      var w = canvas.clientWidth || window.innerWidth;
      var h = canvas.clientHeight || window.innerHeight;
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    window.addEventListener('resize', resize); resize();

    var start = performance.now();
    function frame(now) {
      gl.clearColor(0.039, 0.055, 0.043, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(prog);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(); initLogo(); initLockQ(); });
  } else {
    init();
    initLogo();
    initLockQ();
  }
})();
