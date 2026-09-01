// ============================================================
// Revolution RLP — calculation engine (ported 1:1 from the WFT
// "Revolution RLP" selector sheet, Issue C.10/13)
// ============================================================

// Per-size data: columns E..S of the selector sheet (15 sizes).
// 0035X / 0065X have no data columns in the workbook -> not offered.
const SIZE_DATA = [
  {size:'0150X', disp:0.061,    portIn:1.5, portMm:38,  s4a:-0.0037,  s4b:0.1317,  s4c:1.7611,  s4d:14.9755,                  s2a:-0.1607, s2b:7.015,  s2c:13.9425, minBarSlip:8,   maxBarSlip:15,  portDia:35,  maxTorque:90.4,  maxSpeed:1000, maxPres:15,  rollTorque:4,  viscExp:0.16, viscPowF:82,  rotorDia:66,  margin:1},
  {size:'0160L', disp:0.081,    portIn:1.5, portMm:38,  s4a:-0.0064,  s4b:0.1737,  s4c:1.88,    s4d:14.0575,                  s2a:-0.1339, s2b:6.09,   s2c:13.8975, minBarSlip:9,   maxBarSlip:17,  portDia:35,  maxTorque:90.4,  maxSpeed:1000, maxPres:10,  rollTorque:4,  viscExp:0.16, viscPowF:64,  rotorDia:66,  margin:1},
  {size:'0180L', disp:0.1096,   portIn:1.5, portMm:38,  s4a:-0.0549,  s4b:0.9508,  s4c:6.0057,  s4d:21.721,                   s2a:-0.5,    s2b:10.5,   s2c:3,       minBarSlip:10,  maxBarSlip:18,  portDia:35,  maxTorque:90.4,  maxSpeed:1000, maxPres:7,   rollTorque:4,  viscExp:0.22, viscPowF:49,  rotorDia:88,  margin:1},
  {size:'0200X', disp:0.18,     portIn:1.5, portMm:38,  s4a:-0.0052,  s4b:0.1888,  s4c:2.7607,  s4d:24.9335,                  s2a:-0.4107, s2b:13.25,  s2c:20.0175, minBarSlip:9,   maxBarSlip:30,  portDia:35,  maxTorque:342,   maxSpeed:1000, maxPres:14,  rollTorque:7,  viscExp:0.22, viscPowF:41,  rotorDia:88,  margin:1},
  {size:'0300X', disp:0.25,     portIn:1.5, portMm:38,  s4a:-0.0295,  s4b:0.6636,  s4c:5.7638,  s4d:31.7165,                  s2a:-0.5,    s2b:14.3,   s2c:20,      minBarSlip:12,  maxBarSlip:36,  portDia:35,  maxTorque:342,   maxSpeed:1000, maxPres:9,   rollTorque:7,  viscExp:0.22, viscPowF:35,  rotorDia:132, margin:1},
  {size:'0400X', disp:0.33,     portIn:2,   portMm:51,  s4a:-0.0682,  s4b:1.2424,  s4c:8.7576,  s4d:39.253,                   s2a:-1,      s2b:21,     s2c:10,      minBarSlip:15,  maxBarSlip:42,  portDia:47.6, maxTorque:342,   maxSpeed:1000, maxPres:7,   rollTorque:7,  viscExp:0.22, viscPowF:30,  rotorDia:132, margin:1},
  {size:'0450X', disp:0.45,     portIn:2,   portMm:51,  s4a:-0.007,   s4b:0.2511,  s4c:3.4556,  s4d:34.6755,                  s2a:-0.4286, s2b:21,     s2c:19.715,  minBarSlip:17,  maxBarSlip:45,  portDia:47.6, maxTorque:570,   maxSpeed:800,  maxPres:15,  rollTorque:14, viscExp:0.33, viscPowF:30,  rotorDia:178, margin:1},
  {size:'0800X', disp:0.82,     portIn:2.5, portMm:64,  s4a:-0.0335,  s4b:0.7652,  s4c:6.6093,  s4d:43.104,                   s2a:-0.4286, s2b:22.26,  s2c:24.415,  minBarSlip:20,  maxBarSlip:50,  portDia:60.5, maxTorque:570,   maxSpeed:800,  maxPres:9,   rollTorque:14, viscExp:0.33, viscPowF:20,  rotorDia:224, margin:1},
  {size:'1300X', disp:1.07,     portIn:3,   portMm:76,  s4a:-0.0814,  s4b:1.4482,  s4c:10.108,  s4d:52.817,                   s2a:-1,      s2b:29,     s2c:22,      minBarSlip:30,  maxBarSlip:65,  portDia:72,  maxTorque:570,   maxSpeed:800,  maxPres:7,   rollTorque:14, viscExp:0.33, viscPowF:20,  rotorDia:224, margin:1},
  {size:'1800X', disp:1.55,     portIn:3,   portMm:76,  s4a:-0.2083,  s4b:2.8426,  s4c:15.846,  s4d:68.6025,                  s2a:-0.4286, s2b:27.3,   s2c:46.215,  minBarSlip:30,  maxBarSlip:110, portDia:72,  maxTorque:1073,  maxSpeed:600,  maxPres:15,  rollTorque:35, viscExp:0.18, viscPowF:22,  rotorDia:225, margin:1},
  {size:'2200X', disp:2.1,      portIn:4,   portMm:102, s4a:-0.4583,  s4b:5.9537,  s4c:30.319,  s4d:120.63,                   s2a:-1.5,    s2b:58.4,   s2c:48.45,   minBarSlip:35,  maxBarSlip:120, portDia:97,  maxTorque:1073,  maxSpeed:600,  maxPres:8,   rollTorque:35, viscExp:0.18, viscPowF:20,  rotorDia:226, margin:1},
  {size:'3000L', disp:2.9,      portIn:4,   portMm:102, s4a:-0.375,   s4b:4.8981,  s4c:24.986,  s4d:99.1525,                  s2a:-0.7679, s2b:42.6,   s2c:55.1975, minBarSlip:40,  maxBarSlip:130, portDia:97,  maxTorque:1073,  maxSpeed:500,  maxPres:15,  rollTorque:55, viscExp:0.24, viscPowF:20,  rotorDia:227, margin:1},
  {size:'3800L', disp:3.8,      portIn:6,   portMm:152, s4a:-0.625,   s4b:8.25,    s4c:42.4,    s4d:170.475,                   s2a:-2,      s2b:81.4,   s2c:76,      minBarSlip:50,  maxBarSlip:150, portDia:145, maxTorque:1785,  maxSpeed:500,  maxPres:8,   rollTorque:55, viscExp:0.24, viscPowF:19,  rotorDia:228, margin:1},
  {size:'4000L', disp:5.2,      portIn:6,   portMm:152, s4a:-0.5833,  s4b:7.537,   s4c:38.194,  s4d:152.0575,                 s2a:-1.1964, s2b:65.7,   s2c:84.41,   minBarSlip:70,  maxBarSlip:180, portDia:145, maxTorque:2965,  maxSpeed:400,  maxPres:15,  rollTorque:80, viscExp:0.24, viscPowF:17,  rotorDia:229, margin:1},
  {size:'5000L', disp:7.2,      portIn:8,   portMm:203, s4a:-0.875,   s4b:11.935,  s4c:63.764,  s4d:267.22,                   s2a:-2.75,   s2b:125.2,  s2c:129.75,  minBarSlip:90,  maxBarSlip:300, portDia:190, maxTorque:2965,  maxSpeed:400,  maxPres:8,   rollTorque:80, viscExp:0.24, viscPowF:14,  rotorDia:230, margin:1},
];

// unit conversions (selector columns X1..X6 / X8..X11 / X13..X16)
const FLOW_TO_LMIN = {'l/m':1, 'm³/hr':16.66666666, 'usgpm':3.785412, 'gpm':4.546092, 'l/s':60, 'l/hr':0.016667};
const PRES_TO_BAR  = {'Bar':1, 'psi':0.06894757, 'kPa':0.01, 'MPa':10};
const VISC_TO_CP   = {'cP':1, 'Pas':1000, 'mPas':1}; // SSU handled separately

function flowToLmin(v, unit){ return v * FLOW_TO_LMIN[unit]; }
function presToBar(v, unit){ return v * PRES_TO_BAR[unit]; }
function viscToCP(v, unit){
  if (unit === 'SSU'){ return Math.round(v < 100 ? 0.226*v - 155/v - 1 : 0.21606*v - 195/v); }
  return v * (VISC_TO_CP[unit] ?? 1);
}

// E46 — viscosity multiplier for slip / flow
function viscMultFlow(cP){
  if (cP >= 400) return 0;
  if (cP > 90)   return (-0.01275*cP + 5.0968) / 100;
  if (cP >= 1)   return -0.42 * Math.pow(Math.log(cP), 0.55) + 1;
  return NaN; // "N/A"
}
// E125 — viscosity multiplier for torque power
function viscMultTorque(cP, f){ return Math.pow(cP, f.viscExp); }

function slipStd(f, barISF, vm){           // E60
  let s;
  if (barISF < 5) s = f.s4a*Math.pow(barISF,4) + f.s4b*Math.pow(barISF,3) - f.s4c*Math.pow(barISF,2) + f.s4d*barISF;
  else            s = f.s2a*barISF*barISF + f.s2b*barISF + f.s2c;
  return s * f.margin * vm;
}
function slipHot(f, bar, barISF, vm){      // E61 = E60 + E66*vm
  const add = ((f.maxBarSlip - f.minBarSlip) * bar / f.maxPres) + f.minBarSlip; // E66 (raw bar, not ISF)
  return slipStd(f, barISF, vm) + add * vm;
}

// E133/E134 — raw rpm required (per class)
function rpmRaw(f, flow, slip){ return (flow + slip) / f.disp; }

// E95/E96 — NPSHr
function npshr(f, rpm, cP){
  return ( (f.disp / (f.portDia*f.portDia)) * Math.pow(rpm + 300, 2) * ( Math.pow(cP, 0.8) * (Math.pow(f.portDia, -1.2) * 0.0047) + 0.01 ) ) + 1.3;
}

// E123 — corner cutoff rpm at duty pressure
function cornerRpm(f, bar){
  const atMaxSpeed = 0.7 * f.maxPres;      // E120
  const atMaxPres  = f.maxSpeed * 0.75;    // E119
  if (bar < atMaxSpeed) return f.maxSpeed;
  return f.maxSpeed - (f.maxSpeed - atMaxPres) * (bar - atMaxSpeed) / (f.maxPres - atMaxSpeed);
}

// E131 — torque required (Nm, pressure & viscosity dependent, rpm independent)
function torqueReq(f, bar, cP){
  const vmT = viscMultTorque(cP, f);
  const roll = 0.01 / f.maxSpeed * f.rollTorque;          // E127
  const visc = f.viscPowF * f.disp * vmT;                 // E129
  return roll + visc + bar * (16.5 * f.disp);             // E126 = 16.5*disp
}

// power = torque * rpm / 9550  (HP: *1.34)
function powerKw(torque, rpm){ return torque * rpm / 9550; }

// tip speed m/s — E151 (uses display rpm)
function tipSpeed(f, rpm){ return Math.PI * f.rotorDia / 1000 * rpm / 60; }

// flow / speed variation (r154/r155 = 0 for every RLP size -> always 0)
function flowVariationLmin(){ return 0; }
function speedVariation(){ return 0; }

/**
 * Full calculation for one size + one rotor class.
 * returns { size, ok, rpm, power, torque, npshr, tip, rpmMax, ... } or {size, ok:false, reason}
 */
function calcSize(f, env, cls){
  const { flow, bar, barISF, cP, hpUnits } = env;
  if (bar > f.maxPres)         return { size: f.size, ok:false, reason:'pressure exceeds max' };

  const vm  = viscMultFlow(cP);
  const slip = cls === 'hot' ? slipHot(f, bar, barISF, vm) : slipStd(f, barISF, vm);
  const rpm = rpmRaw(f, flow, slip);
  if (!(rpm < f.maxSpeed))     return { size: f.size, ok:false, reason:'rpm exceeds max' };

  const np  = npshr(f, rpm, cP);
  const cor = cornerRpm(f, bar);
  if (!(np < 15))              return { size: f.size, ok:false, reason:'NPSHr > 15 m' };
  if (!(rpm <= cor))           return { size: f.size, ok:false, reason:'outside corner curve' };
  if (!(rpm > 0))              return { size: f.size, ok:false, reason:'rpm <= 0' };

  const tq  = torqueReq(f, bar, cP);
  if (!(tq < f.maxTorque))     return { size: f.size, ok:false, reason:'torque exceeds max' };

  const power = powerKw(tq, rpm);
  return {
    size: f.size, ok: true, cls,
    rpm, power: hpUnits ? power * 1.34 : power,
    torque: hpUnits ? tq * 0.737561 : tq,
    npshr: hpUnits ? np * 3.28083 : np,
    tip: null, // filled in calcAll (workbook uses Std rpm for tip speed)
    flowVar: flowVariationLmin(), speedVar: speedVariation(),
    disp: f.disp, portIn: f.portIn, portMm: f.portMm, rotorDia: f.rotorDia,
    maxSpeed: f.maxSpeed, maxPres: f.maxPres, maxTorque: f.maxTorque,
    slip, torqueNm: tq,
  };
}

/**
 * env: { flowLmin, bar, barISF, cP, hpUnits }
 */
function calcAll(inputs){
  const flow = flowToLmin(inputs.flow, inputs.flowUnit);
  const bar  = presToBar(inputs.pres, inputs.presUnit);
  const barISF = inputs.isf ? (bar > 1 ? bar + 1 : bar * 2) : bar;   // X18
  const cP   = viscToCP(inputs.visc, inputs.viscUnit);
  const hpUnits = (inputs.flowUnit === 'gpm' || inputs.flowUnit === 'usgpm');
  const env = { flow, bar, barISF, cP, hpUnits };
  const std = SIZE_DATA.map(f => calcSize(f, env, 'std'));
  const hot = SIZE_DATA.map(f => calcSize(f, env, 'hot'));
  // workbook quirk: tip speed (r151) always uses the Std-class display rpm
  std.forEach((s, i) => { if (s.ok) s.tip = tipSpeed(SIZE_DATA[i], s.rpm); });
  hot.forEach((s, i) => { if (s.ok && std[i].ok) s.tip = tipSpeed(SIZE_DATA[i], std[i].rpm); });
  const recommended = std.find(r => r.ok);
  return {
    env: { flow, bar, barISF, cP, hpUnits, flowUnit: inputs.flowUnit, presUnit: inputs.presUnit },
    slipAtP: (f, cls, P) => { const v = viscMultFlow(cP); return cls === 'hot' ? slipHot(f, P, P, v) : slipStd(f, P, v); },
    std, hot, recommended: recommended ? recommended.size : null,
  };
}

// ---- module export (Node) / window (browser) ----
if (typeof module !== 'undefined') module.exports = { SIZE_DATA, calcAll, calcSize, flowToLmin, presToBar, viscToCP };
if (typeof window !== 'undefined') window.RLPEngine = { SIZE_DATA, calcAll, calcSize };
// ============================================================
// Series 2-6: Revolution CPP / MP-CP / Sterilobe / RTP / Acculobe
// (ported 1:1 from the WFT workbook — incl. source quirks)
// ============================================================
const Z = v => (v === null || v === undefined) ? 0 : v;   // empty cell -> 0
const L = Math.log;
function envFrom(inputs){
  const flow = flowToLmin(inputs.flow, inputs.flowUnit);
  const bar  = presToBar(inputs.pres, inputs.presUnit);
  const barISF = inputs.isf ? (bar > 1 ? bar + 1 : bar * 2) : bar;
  const cP   = viscToCP(inputs.visc, inputs.viscUnit);
  const hpUnits = (inputs.flowUnit === 'gpm' || inputs.flowUnit === 'usgpm');
  return { flow, bar, barISF, cP, hpUnits };
}

// ------------------------------------------------------------
// 2) REVOLUTION CPP — 4 rotor classes (Std / FF / Hot / Choc)
// ------------------------------------------------------------
const CPP_SIZES = [
  {size:'0150X',disp:0.0548,portIn:1.5,portMm:38,   ffMin:2,ffMax:10.4,htMin:3,htMax:13.5,chMin:7,chMax:25.9, off:1.32, ramp:0.686, c107:5.217279205241151, maxTorque:90.4,maxSpeed:800,maxPres:21,rollTorque:4,viscPowF:82,margin:1,slip:{thr:5,lo:{3:0.1942,2:-2.11,1:10.916},hi:{4:3e-05,3:-0.0008,2:-0.0358,1:3.8167,0:7.99775}}},
  {size:'0180P',disp:0.1096,portIn:1.5,portMm:38,           ffMin:4,ffMax:12.4,htMin:5.5,htMax:18.1,chMin:9,chMax:30, off:2.01, ramp:0.5370775092870214, c107:4.803340305542831, maxTorque:90.4,maxSpeed:800,maxPres:14,rollTorque:4,viscPowF:55,margin:1,slip:{thr:5,lo:{3:0.17,2:-2.1,1:13.5},hi:{4:3e-05,3:-0.0002,2:-0.04,1:4.8,0:13.48125}}},
  {size:'0200X',disp:0.1592,portIn:1.5,portMm:38,          ffMin:4,ffMax:20.8,htMin:7,htMax:34.3,chMin:12,chMax:54, off:2.3,  ramp:0.4719333370015336, c107:4.6182958343114695, maxTorque:342,maxSpeed:800,maxPres:21,rollTorque:7,viscPowF:49,margin:1,slip:{thr:5,lo:{3:0.17,2:-2.18,1:14.9},hi:{4:3e-05,3:-0.0002,2:-0.04,1:5.3,0:15.98125}}},
  {size:'0300X',disp:0.2256,portIn:1.5,portMm:38,           ffMin:6,ffMax:21.3,htMin:10,htMax:37.2,chMin:15,chMax:52.4, off:2.98, ramp:0.415475054354111, c107:4.858227236882833, maxTorque:342,maxSpeed:800,maxPres:17,rollTorque:7,viscPowF:41,margin:1,slip:{thr:5,lo:{3:0.16,2:-2.25,1:16.3},hi:{4:3e-05,3:-0.0002,2:-0.04,1:5.7,0:17.9812}}},
  {size:'0400X',disp:0.2919,portIn:2,  portMm:51,             ffMin:8,ffMax:22,htMin:14,htMax:37.8,chMin:19,chMax:54, off:2.51, ramp:0.3807314958018507, c107:4.181695188572837, maxTorque:342,maxSpeed:800,maxPres:14,rollTorque:7,viscPowF:35,margin:1,slip:{thr:5,lo:{3:0.15,2:-2.3,1:18.0},hi:{4:3e-05,3:-0.0003,2:-0.04,1:6.5,0:20.10625}}},
  {size:'0450X',disp:0.4239,portIn:2,  portMm:51,                  ffMin:14,ffMax:51.2,htMin:18,htMax:80,chMin:26,chMax:119, off:2.71, ramp:0.33295910279249313, c107:4.036888102171194, maxTorque:570,maxSpeed:600,maxPres:31,rollTorque:14,viscPowF:40,margin:1,slip:{thr:3,lo:{3:0.4,2:-8.0,1:51.0},hi:{4:0.0001,3:-0.006,2:-0.09,1:13.4,0:52.6}}},
  {size:'0600P',disp:0.581, portIn:2.5,portMm:64,                      ffMin:17,ffMax:48.5,htMin:21,htMax:67.2,chMin:29,chMax:102.5, off:2.58, ramp:0.29821554424023267, c107:3.676408710375955, maxTorque:570,maxSpeed:600,maxPres:21,rollTorque:14,viscPowF:30,margin:1,slip:{thr:3,lo:{3:0.6,2:-10.0,1:59.0},hi:{2:-0.3,1:17.3,0:53.9}}},
  {size:'0800X',disp:0.7694,portIn:2.5,portMm:64,                       ffMin:19,ffMax:51.3,htMin:24,htMax:66.5,chMin:32,chMax:100, off:3.18, ramp:0.26926257878001614, c107:4.035258482534153, maxTorque:570,maxSpeed:600,maxPres:17,rollTorque:14,viscPowF:25,margin:1,slip:{thr:3,lo:{3:0.7,2:-11.0,1:65.0},hi:{2:-0.41,1:20.5,0:57.0}}},
  {size:'1300X',disp:1.0049,portIn:3,  portMm:76,                    ffMin:21,ffMax:53.2,htMin:27,htMax:66.2,chMin:36,chMax:99, off:3.14, ramp:0.2456659119299397, c107:3.8347989487306684, maxTorque:570,maxSpeed:600,maxPres:14,rollTorque:14,viscPowF:25,margin:1,slip:{thr:3,lo:{3:0.75,2:-13.0,1:81.0},hi:{2:-0.6,1:25.5,0:75.15}}},
  {size:'1800X',disp:1.4602,portIn:3,  portMm:76,                     ffMin:24,ffMax:104.6,htMin:32,htMax:131.2,chMin:44,chMax:214.5, off:3.51, ramp:0.2152652981967118, c107:3.972220692126699, maxTorque:1073,maxSpeed:600,maxPres:31,rollTorque:35,viscPowF:27,margin:1,slip:{thr:3,lo:{3:0.8,2:-14.0,1:98.0},hi:{2:-0.52,1:36.0,0:86.28}}},
  {size:'1830X',disp:1.4602,portIn:3,  portMm:76,                     ffMin:24,ffMax:104.6,htMin:32,htMax:131.2,chMin:44,chMax:214.5, off:3.51, ramp:0.2152652981967118, c107:3.972220692126699, maxTorque:1073,maxSpeed:600,maxPres:31,rollTorque:35,viscPowF:27,margin:1,slip:{thr:3,lo:{3:0.8,2:-14.0,1:98.0},hi:{2:-0.52,1:36.0,0:86.28}}},
  {size:'2200X',disp:1.9756,portIn:4,  portMm:102,                   ffMin:30,ffMax:93,htMin:38,htMax:117.8,chMin:52,chMax:192.7, off:3.06, ramp:0.19340580927424839, c107:3.39895855909929, maxTorque:1073,maxSpeed:600,maxPres:21,rollTorque:35,viscPowF:21,margin:1,slip:{thr:3,lo:{3:0.8,2:-14.0,1:102.0},hi:{2:-0.52,1:38.0,0:92.28}}},
  {size:'2230X',disp:1.9756,portIn:4,  portMm:102,                   ffMin:30,ffMax:93,htMin:38,htMax:117.8,chMin:52,chMax:192.7, off:3.06, ramp:0.19340580927424839, c107:3.39895855909929, maxTorque:1073,maxSpeed:600,maxPres:21,rollTorque:35,viscPowF:21,margin:1,slip:{thr:3,lo:{3:0.8,2:-14.0,1:102.0},hi:{2:-0.52,1:38.0,0:92.28}}},
  {size:'2600P',disp:2.5196,portIn:4,  portMm:102,                   ffMin:36,ffMax:85,htMin:47,htMax:117,chMin:60,chMax:200, off:3.66, ramp:0.17733691344382824, c107:3.851607889842236, maxTorque:1073,maxSpeed:600,maxPres:14,rollTorque:35,viscPowF:22,margin:1,slip:{thr:3,lo:{3:0.8,2:-14.0,1:105.0},hi:{2:-0.52,1:40.0,0:95.28}}},
  {size:'2630P',disp:2.5196,portIn:4,  portMm:102,                   ffMin:36,ffMax:85,htMin:47,htMax:117,chMin:60,chMax:200, off:3.66, ramp:0.17733691344382824, c107:3.851607889842236, maxTorque:1073,maxSpeed:600,maxPres:14,rollTorque:35,viscPowF:22,margin:1,slip:{thr:3,lo:{3:0.8,2:-14.0,1:105.0},hi:{2:-0.52,1:40.0,0:95.28}}},
  {size:'3200X',disp:3,     portIn:6,  portMm:152,                   ffMin:41,ffMax:125,htMin:58,htMax:173.5,chMin:88,chMax:266.5, off:2.35, ramp:0.1667690810508485, c107:2.5562366141184634, maxTorque:1073,maxSpeed:600,maxPres:21,rollTorque:55,viscPowF:24,margin:1,slip:{thr:3,lo:{3:0.8,2:-18.0,1:118.0},hi:{2:-0.52,1:40.0,0:98.28}}},
];

function cppCalc(inputs){
  const env = envFrom(inputs);
  const { flow, bar, barISF, cP, hpUnits } = env;
  const vm = cP >= 400 ? 0 : cP > 90 ? (-0.01275*cP + 5.0968)/100 : cP >= 1 ? -0.42*Math.pow(L(cP), 0.55) + 1 : NaN;
  const evalPoly = (coeffs, x) => { let t = 0; for (const e in coeffs) t += coeffs[e] * Math.pow(x, +e); return t; };
  const slipStd = (f, p) => evalPoly(p < f.slip.thr ? f.slip.lo : f.slip.hi, p) * vm;
  const addSlip = (f, lo, hi, p) => ((hi - lo) * p / f.maxPres) + lo;
  const CLS_PFX = { ff:'ff', hot:'ht', choc:'ch' };
  const slipOf = (f, cls, p) => cls === 'std' ? slipStd(f, p) : slipStd(f, p) + addSlip(f, f[CLS_PFX[cls]+'Min'], f[CLS_PFX[cls]+'Max'], p) * vm;
  const npMult = f => {
    const off = f.off, c107 = f.c107, ramp = f.ramp;
    const r108 = ramp * L(cP) + off;
    const r109 = (3e-15*off**0.2)*cP**3 + (-2.8e-9*off**0.2)*cP**2 + (0.0008*off**0.2)*cP + c107;
    return cP < 1000 ? r108 : r109;
  };
  const viscPow = () => {
    // source E125 uses ABSOLUTE $E$139/$E$144 (0150X values) for every column
    const e139 = 0.23 * L(cP) + 1;
    const e144 = (cP ** 0.35) * 0.3 + 0.5556;
    return cP < 100 ? e139 : e144;
  };
  function calc(f, cls){
    const base = { size:f.size, cls, disp:f.disp, portIn:f.portIn, portMm:f.portMm, rotorDia:null,
      maxSpeed:f.maxSpeed, maxPres:f.maxPres, maxTorque:f.maxTorque };
    if (bar > f.maxPres) return { ...base, ok:false, reason:'pressure exceeds max' };
    const slip = slipOf(f, cls, barISF);
    const rpm = (flow + slip)/f.disp;
    if (!(rpm < f.maxSpeed)) return { ...base, ok:false, reason:'rpm exceeds max' };
    const np = npMult(f) * rpm / f.maxSpeed;                 // E111..114 (proportional to rpm)
    const rpmOk = (np < 15) && (rpm <= f.maxSpeed) && (rpm > 0);
    if (!rpmOk) return { ...base, ok:false, reason: np >= 15 ? 'NPSHr > 15 m' : 'rpm <= 0' };
    // torque uses STD-class rpm for every class (source E131 uses E133)
    const rpmStd = (flow + slipStd(f, barISF))/f.disp;
    const roll = (f.maxSpeed - rpmStd)/f.maxSpeed * f.rollTorque;
    const vp   = f.viscPowF * f.disp * rpmStd/f.maxSpeed * viscPow();
    const tq   = roll + vp + bar * (16.5 * f.disp);
    const power = tq*rpm/9550;
    return { ...base, ok:true, rpm,
      power: hpUnits ? power*1.34 : power,
      torque: tq < f.maxTorque ? (hpUnits ? tq*0.737561 : tq) : null,
      npshr: np < 15 ? (hpUnits ? np*3.28083 : np) : null,
      tip:null, flowVar:0, speedVar:0, slip };
  }
  const res = {};
  for (const cls of ['std','ff','hot','choc']) res[cls] = CPP_SIZES.map(f => calc(f, cls));
  const rec = res.std.find(r => r.ok);
  return { env, slipAtP: (f, cls, P) => slipOf(f, cls, P), ...res, recommended: rec ? rec.size : null };
}

// ------------------------------------------------------------
// 3) MP-CP — 3 rotor classes (A / B / C)
// ------------------------------------------------------------
const MPCP_SIZES = [
  {size:'10/0005',disp:0.046,portIn:1,portMm:25,   bMin:3,bMax:8,cMin:5,cMax:13, np1:0.05,portDia:22.2,maxTorque:39,maxSpeedAtMaxP:1000,maxPresAtMaxS:8.5,maxSpeed:1400,maxPres:12,p110:8.46,rotorDia:66,flowVar1:4,flowVarMax:10,rvVar0:3,rvVarMax:13,logK:0.37,margin:1,slip:{thr:2,lo:{6:-0.0002,5:0.0067,4:-0.1079,3:0.8952,2:-4.2591,1:13.3},hi:{3:0.0027,2:-0.15,1:4.1,0:7.5788},rv:true}},
  {size:'10/0008',disp:0.083,portIn:1.5,portMm:38,   bMin:3,bMax:11,cMin:6,cMax:18, np1:0.08,portDia:35.1,maxTorque:39,maxSpeedAtMaxP:1000,maxPresAtMaxS:5.5,maxSpeed:1400,maxPres:8,p110:5.47,rotorDia:66,flowVar1:6,flowVarMax:12,rvVar0:3,rvVarMax:10,logK:0.37,margin:1,slip:{thr:2,lo:{6:-0.0071,5:0.1776,4:-1.7173,3:8.2,2:-21.3,1:36.1},hi:{3:0.004,2:-0.4,1:8.2,0:15.52},rv:true}},
  {size:'10/0011',disp:0.111,portIn:1.5,portMm:38,   bMin:3,bMax:8,cMin:6,cMax:15, np1:0.11,portDia:35.1,maxTorque:39,maxSpeedAtMaxP:1000,maxPresAtMaxS:3.5,maxSpeed:1400,maxPres:5,p110:4.67,rotorDia:66,flowVar1:10,flowVarMax:17,rvVar0:4,rvVarMax:8,logK:0.37,margin:1,slip:{thr:2,lo:{5:-3.3773555013406624,4:20.569468338220588,3:-41.00240221089235,2:17.92996371938601,1:42.631622720483286},hi:{3:0.03,2:-1.15,1:13.9,0:26.560000000000013},rv:true}},
  {size:'20/0020',disp:0.202,portIn:1.5,portMm:38,   bMin:6,bMax:12,cMin:9,cMax:30, np1:0.2,portDia:35.1,maxTorque:102,maxSpeedAtMaxP:750,maxPresAtMaxS:8.5,maxSpeed:1000,maxPres:12,p110:3.11,rotorDia:88,flowVar1:12,flowVarMax:20,rvVar0:4,rvVarMax:18,logK:0.15,margin:1,slip:{thr:2,lo:{6:-0.005,5:0.35,4:-1.0,3:5.199499999999997,2:-27.5,1:67.762},hi:{3:0.0001,2:-0.35,1:11.7,0:39.99919999999997},rv:true}},
  {size:'20/0031',disp:0.313,portIn:2,portMm:50,   bMin:9,bMax:20,cMin:15,cMax:42, np1:0.31,portDia:47.6,maxTorque:102,maxSpeedAtMaxP:750,maxPresAtMaxS:5,maxSpeed:1000,maxPres:7,p110:2.26,rotorDia:88,flowVar1:15,flowVarMax:25,rvVar0:6,rvVarMax:13,logK:0.15,margin:1,slip:{thr:2,lo:{6:0.3,5:0.01,4:-3.4,3:16.3,2:-61.9418,1:125.0},hi:{3:0.015,2:-1.1,1:20.1,0:61.83280000000001},rv:true}},
  {size:'30/0069',disp:0.694,portIn:2,portMm:50,   bMin:11,bMax:42,cMin:20,cMax:50, np1:0.69,portDia:47.6,maxTorque:448,maxSpeedAtMaxP:550,maxPresAtMaxS:8.5,maxSpeed:750,maxPres:12,p110:1.58,rotorDia:132,flowVar1:25,flowVarMax:40,rvVar0:6,rvVarMax:27,logK:0.1,margin:1,slip:{thr:2,lo:{6:-0.11,5:0.75,4:-0.8,3:1.4,2:-32.84,1:121.0},hi:{3:0.0001,2:-0.57,1:25.8,0:76.6792},rv:true}},
  {size:'30/0113',disp:1.125,portIn:3,portMm:76,   bMin:10,bMax:24,cMin:37,cMax:65, np1:1.13,portDia:72.3,maxTorque:448,maxSpeedAtMaxP:550,maxPresAtMaxS:5,maxSpeed:750,maxPres:7,p110:1.15,rotorDia:132,flowVar1:33,flowVarMax:60,rvVar0:10,rvVarMax:19,logK:0.1,margin:1,slip:{thr:2,lo:{6:-12.204677946364088,5:56.148211583445715,4:-60.43884030949726,3:-36.37034065049568,2:8.939238788135835,1:217.29191645020848},hi:{2:-2.7,1:60.0,0:118.79999999999998},rv:true}},
  {size:'40/0180',disp:1.8,portIn:3,portMm:76,   bMin:15,bMax:70,cMin:30,cMax:110, np1:1.8,portDia:72.3,maxTorque:936,maxSpeedAtMaxP:520,maxPresAtMaxS:8.5,maxSpeed:700,maxPres:12,p110:3.6,rotorDia:178,flowVar1:32,flowVarMax:48,rvVar0:10,rvVarMax:41,logK:0.095,margin:1,slip:{thr:2,lo:{6:0.0,5:0.8,4:-1.3,3:0.25,2:-48.0,1:207.0},hi:{2:-1.6,1:51.0,0:133.2},rv:true}},
  {size:'40/0250',disp:2.5,portIn:4,portMm:101,   bMin:20,bMax:90,cMin:40,cMax:130, np1:2.5,portDia:97.5,maxTorque:936,maxSpeedAtMaxP:520,maxPresAtMaxS:5,maxSpeed:700,maxPres:7,p110:2.9,rotorDia:178,flowVar1:40,flowVarMax:58,rvVar0:12,rvVarMax:28,logK:0.095,margin:1,slip:{thr:2,lo:{6:-2.5,5:9.432825,4:-3.0,3:0.25,2:-125.0,1:380.0},hi:{3:0.03,2:-3.8,1:84.0,0:202.81039999999996},rv:true}},
  {size:'50/0351',disp:3.514,portIn:4,portMm:101,   bMin:30,bMax:90,cMin:0,cMax:0, np1:3.51,portDia:97.5,maxTorque:2078,maxSpeedAtMaxP:420,maxPresAtMaxS:8.5,maxSpeed:650,maxPres:12,p110:3.15,rotorDia:224,flowVar1:40,flowVarMax:65,rvVar0:0,rvVarMax:0,logK:0.08,margin:1,slip:{thr:2,lo:{6:-28.84950972324557,5:123.36143391665482,4:-117.31188037256503,3:-91.59092534522348,2:31.730306215525133,1:397.2995004077452},hi:{2:-2.35,1:82.6,0:257.2},rv:false}},
  {size:'50/0525',disp:5.25,portIn:6,portMm:152,   bMin:50,bMax:180,cMin:0,cMax:0, np1:5.25,portDia:140,maxTorque:2078,maxSpeedAtMaxP:420,maxPresAtMaxS:5.5,maxSpeed:650,maxPres:8,p110:2.39,rotorDia:224,flowVar1:55,flowVarMax:100,rvVar0:0,rvVarMax:0,logK:0.08,margin:1,slip:{thr:2,lo:{6:-2.9,5:13.5,4:-3.0,3:0.25,2:-260.0,1:734.0},hi:{3:0.5,2:-11.8,1:152.0,0:367.6},rv:false}},
  {size:'50/0525/12',disp:5.25,portIn:6,portMm:152,   bMin:0,bMax:0,cMin:0,cMax:0, np1:5.25,portDia:140,maxTorque:2078,maxSpeedAtMaxP:150,maxPresAtMaxS:5.5,maxSpeed:650,maxPres:12,p110:2.39,rotorDia:224,flowVar1:65,flowVarMax:115,rvVar0:0,rvVarMax:0,logK:0.08,margin:1,slip:{thr:2,lo:{6:-2.9,5:13.5,4:-3.0,3:0.25,2:-322.6788,1:1000.0},hi:{3:0.8,2:-16.0,1:210.0,0:547.2848},rv:false}},
];

function mpcpCalc(inputs){
  const env = envFrom(inputs);
  const { flow, bar, barISF, cP, hpUnits } = env;
  const rv = inputs.rv || false;
  const vm = cP < 1 ? NaN : cP >= 500 ? 0 : (-0.4 * Math.pow(L(cP), 0.5015)) + 1;
  const rvFlowVar = f => {
    if (!f.rvVar0 && !f.rvVarMax) return 0;                  // N/A in source
    const v = bar > f.maxPres ? NaN : ((f.rvVarMax - f.rvVar0) * bar / f.maxPres) + f.rvVar0;
    return v * vm;
  };
  const evalPoly = (coeffs, x) => { let t = 0; for (const e in coeffs) t += coeffs[e] * Math.pow(x, +e); return t; };
  const slipA = (f, p) => {
    const s = evalPoly(p < f.slip.thr ? f.slip.lo : f.slip.hi, p) * f.margin * vm;
    return (f.slip.rv && rv) ? s + rvFlowVar(f) : s;
  };
  const slipB = (f, p) => slipA(f, p) + (((f.bMax - f.bMin) * p / f.maxPres) + f.bMin) * vm;
  const slipC = (f, p) => slipA(f, p) + (((f.cMax - f.cMin) * p / f.maxPres) + f.cMin) * vm;
  const npA = (f, rpm) => ((f.np1/(f.portDia*f.portDia)) * (rpm+300)**2 * (cP**0.8 * (f.portDia**-1.2*0.0047) + 0.01)) + 1.3;
  const corner = f => bar < f.maxPresAtMaxS ? f.maxSpeed : f.maxSpeed - (f.maxSpeed - f.maxSpeedAtMaxP)*(bar - f.maxPresAtMaxS)/(f.maxPres - f.maxPresAtMaxS);
  const powerKw = (f, rpm) => ((1.9*bar + f.p110) * rpm * f.disp/1000) + ((Math.pow(Math.log10(cP), 3) * f.logK) * rpm * f.disp/1000);
  const flowVar = f => bar > f.maxPres ? NaN : (((f.flowVarMax - f.flowVar1) * bar / f.maxPres) + f.flowVar1) * vm;
  const tqAt = f => powerKw(f, 1) * 9550;                    // torque = power*9550/rpm (rpm cancels)

  function calc(f, cls){
    const base = { size:f.size, cls, disp:f.disp, portIn:f.portIn, portMm:f.portMm, rotorDia:f.rotorDia,
      maxSpeed:f.maxSpeed, maxPres:f.maxPres, maxTorque:f.maxTorque };
    if ((cls === 'b' && !f.bMin && !f.bMax) || (cls === 'c' && !f.cMin && !f.cMax))
      return { ...base, ok:false, reason:'rotor class not offered' };
    if (bar > f.maxPres) return { ...base, ok:false, reason:'pressure exceeds max' };
    const slip = cls === 'a' ? slipA(f, barISF) : cls === 'b' ? slipB(f, barISF) : slipC(f, barISF);
    if (Number.isNaN(slip)) return { ...base, ok:false, reason:'slip N/A' };
    const rpm = (flow + slip)/f.disp;
    if (!(rpm < f.maxSpeed)) return { ...base, ok:false, reason:'rpm exceeds max' };
    const np = npA(f, rpm), cor = corner(f);
    // class A gates NPSHr; classes B/C gate only corner + rpm>0 (source r37/r46)
    const rpmOk = cls === 'a' ? (np < 15) && (rpm <= cor) && (rpm > 0)
                             : (rpm <= cor) && (rpm > 0);
    if (!rpmOk) return { ...base, ok:false, reason: np >= 15 ? 'NPSHr > 15 m' : (rpm > cor ? 'outside corner curve' : 'rpm <= 0') };
    const pk = powerKw(f, rpm);
    const tq = pk * 9550 / rpm;
    const fv = flowVar(f);
    return { ...base, ok:true, rpm,
      power: hpUnits ? pk*1.34 : pk,
      torque: tq < f.maxTorque ? (hpUnits ? tq*0.737561 : tq) : null,
      npshr: np < 15 ? (hpUnits ? np*3.28083 : np) : null,
      tip:null, flowVar: fv, speedVar: fv / f.disp, slip };
  }
  const a = MPCP_SIZES.map(f => calc(f,'a'));
  const b = MPCP_SIZES.map(f => calc(f,'b'));
  const c = MPCP_SIZES.map(f => calc(f,'c'));
  // source quirk: class B/C torque display reuses class A's torque cell (r39=F27, r48=F27)
  b.forEach((s,i)=>{ if(!a[i].ok) s.torque = null; });
  c.forEach((s,i)=>{ if(!a[i].ok) s.torque = null; });
  a.forEach((s,i)=>{ if(s.ok) s.tip = Math.PI*MPCP_SIZES[i].rotorDia/1000*s.rpm/60; });
  b.forEach((s,i)=>{ if(s.ok && a[i].ok) s.tip = Math.PI*MPCP_SIZES[i].rotorDia/1000*a[i].rpm/60; });
  c.forEach((s,i)=>{ if(s.ok && a[i].ok) s.tip = Math.PI*MPCP_SIZES[i].rotorDia/1000*a[i].rpm/60; });
  const rec = a.find(r => r.ok);
  return { env, slipAtP: (f, cls, P) => cls === 'a' ? slipA(f, P) : cls === 'b' ? slipB(f, P) : slipC(f, P), std:a, b, c, recommended: rec ? rec.size : null };
}

// ------------------------------------------------------------
// 4) STERILOBE — 2 rotor forms (BiWing / Multilobe)
//     slip polynomials are per-size (source has differing
//     thresholds/orders; some columns double-apply margin*vm)
// ------------------------------------------------------------
const STERILOBE_SIZES = [
  {size:'SLAS',vp1:[0.00981,2.65,0.62,2.03,-1],vp2:[5e-10,6.1e-6,0.002057,0.658678653,0.62],vp3:[1.0132,0.1358,0.62,0.946412588077472,-1],disp:0.0375,portIn:'3/4',portMm:19, margin:1.03, np:[0.0045,1.55,0.973,0.15647254434413738,-1e-12,6.2e-07,0.00026,7e-11,-7e-07,0.006,1.8], maxTorque:26,maxSpeed:1400,maxPres:15,pc:[1.28e-06,0.00185245,0.122,0.6276,2.06], portDia:16,rotorDia:68,flowVar1:4,flowVarMax:8,rv0:3,rvMax:13,bw:{thr:5,lo:{6:0.0002,5:0.0,4:-0.015,3:0.2,2:-1.7,1:10.0},hi:{3:0.0027,2:-0.13,1:4.2,0:8.1625},loD:false},ml:{thr:5,lo:{6:0.0002,5:0.0,4:-0.015,3:0.2,2:-1.7,1:10.7},hi:{3:0.0027,2:-0.13,1:4.85,0:8.4125},loD:false}},
  {size:'SLAL',vp1:[0.00981,2.65,0.62,2.03,-1],vp2:[5e-10,6.1e-6,0.002057,0.658678653,0.62],vp3:[1.0132,0.1358,0.62,0.946412588077472,-1],disp:0.055833333,portIn:1,portMm:25, margin:1.03, np:[0.0013,1.62,0.98,0.1259705077915137,-1e-12,6.2e-07,5.2e-05,7e-11,-7e-07,0.006,1.8], maxTorque:26,maxSpeed:1400,maxPres:10,pc:[1.28e-06,0.00185245,0.1466,0.871,2.1], portDia:22.2,rotorDia:68,flowVar1:4,flowVarMax:9,rv0:3,rvMax:10,bw:{thr:5,lo:{6:-0.00025,5:0.0018,4:-0.005,3:0.2,2:-1.98,1:10.8},hi:{5:2e-06,4:-0.0088,3:0.2407,2:-2.5529,1:15.77,0:-11.5275},loD:false},ml:{thr:3,lo:{6:-1e-06,5:0.045,4:-0.15,3:0.4,2:-3.6,1:16.6},hi:{5:2e-06,4:-0.0088,3:0.2407,2:-2.5529,1:16.1,0:-4.12621499999999},loD:false}},
  {size:'SLBS',vp1:[0.0036,6.15,0.71,5.44,-1],vp2:[0,2.9e-7,0.0025,0.735950234,0.71],vp3:[0.162,0.1585,0.71,0.566070053,-1],disp:0.07785714285714286,portIn:1,portMm:25, margin:1.03, np:[0.00093,1.8,0.98,0.14296143549316986,-1e-12,6.2e-07,0.0002,7e-11,-7e-07,0.006,1.66], maxTorque:76,maxSpeed:1200,maxPres:15,pc:[8.8e-06,0.00672,0.047,1.267,4.65], portDia:22.2,rotorDia:84,flowVar1:5,flowVarMax:10,rv0:4,rvMax:18,bw:{thr:3,lo:{6:-0.006,5:0.04,4:-0.08,3:0.55,2:-3.8,1:15.822757000000001},hi:{3:0.001,2:-0.15,1:6.7,0:8.207271000000002},loD:false},ml:{thr:3,lo:{6:-0.006,5:0.03,4:-0.08,3:0.55,2:-3.7,1:17.5105},hi:{3:0.0025,2:-0.16,1:7.23,0:10.2},loD:false}},
  {size:'SLBL',vp1:[0.0036,6.15,1.24,5.44,-1],vp2:[0,2.9e-7,0.0025,0.735950234,1.24],vp3:[0.162,0.1585,1.24,0.566070053,-1],disp:0.11530612244897959,portIn:1.5,portMm:38, margin:1.03, np:[0.00428703,0.85,0.58,0.174,-1e-09,2.8e-06,0.00055,4e-12,-1e-07,0.0012,2.04], maxTorque:76,maxSpeed:1200,maxPres:10,pc:[8.8e-06,0.00672,0.104,1.675,4.7], portDia:35,rotorDia:84,flowVar1:6,flowVarMax:12,rv0:4,rvMax:14,bw:{thr:3,lo:{6:0.0009,5:0.04,4:-0.16,3:0.55,2:-4.6,1:22.5},hi:{3:-0.011,2:-0.01,1:7.65,0:15.803100000000015},loD:false},ml:{thr:3,lo:{6:0.0009,5:0.03,4:-0.16,3:0.55,2:-4.6,1:25.25},hi:{3:-0.015,2:-0.013,1:9.4,0:16.5081},loD:false}},
  {size:'SLCS',vp1:[0.00981,3.992,1.68,2.312,-1],vp2:[5e-10,-1e-5,0.00671,1.704072232,1.68],vp3:[0.97,0.19532,1.68,0.168174756,-1],disp:0.16375,portIn:1.5,portMm:38, margin:1.03, np:[0.0017,1.2,0.6775,0.153,-1e-09,3.3e-06,1e-07,7e-11,-7e-07,0.006,6.5], maxTorque:133,maxSpeed:1200,maxPres:15,pc:[1.28e-06,0.00185245,0.41317,2.865,4.07], portDia:35,rotorDia:106,flowVar1:7,flowVarMax:15,rv0:6,rvMax:27,bw:{thr:3,lo:{6:-0.006,5:0.04,4:-0.08,3:0.55,2:-6.0,1:30.29},hi:{3:0.001,2:-0.15,1:9.47,0:23.499000000000002},loD:false},ml:{thr:3,lo:{6:-0.006,5:0.04,4:-0.08,3:0.55,2:-6.0,1:30.8},hi:{3:0.001,2:-0.15,1:10.246333333333338,0:22.7},loD:false}},
  {size:'SLCL',vp1:[0.00981,6.65,2.1,4.55,-1],vp2:[5e-10,-1e-5,0.007,2.181212092,2.1],vp3:[0.7,0.213532,2.1,0.304361484,1],disp:0.24125,portIn:2,portMm:50, margin:1.03, np:[0.0017,1.3,0.7266367098706477,0.153,-1e-09,3.3e-06,1e-07,7e-11,-7e-07,0.006,6], maxTorque:133,maxSpeed:1200,maxPres:10,pc:[1.28e-06,0.00185245,0.516460328468769,4.286,4.15], portDia:47.6,rotorDia:106,flowVar1:8,flowVarMax:18,rv0:6,rvMax:20,bw:{thr:3,lo:{6:0.005,5:0.06,4:-0.6,3:1.8,2:-7.5,1:39.7},hi:{3:-0.015,2:-0.09,1:12.4,0:33.84},loD:false},ml:{thr:3,lo:{6:-0.0007,5:0.02,4:-0.25,3:2.5,2:-14.1,1:49.4},hi:{3:-0.02,2:-0.01,1:12.58,0:35.7897},loD:false}},
  {size:'SLDS',vp1:[0.0218,3,2.44,0.56,-1],vp2:[5e-9,1e-6,0.006,2.530484065,2.44],vp3:[1.98679,0.213,2.44,0.058699154,1],disp:0.335,portIn:1.5,portMm:38, margin:1.03, np:[0.0017,1.45,0.8007833129186743,0.153,-1e-09,3.3e-06,1e-07,7e-11,-7e-07,0.006,4.3], maxTorque:615,maxSpeed:1000,maxPres:15,pc:[1.28e-06,0.00185245,0.78,5.63,5.3], portDia:35,rotorDia:142,flowVar1:9,flowVarMax:20,rv0:10,rvMax:41,bw:{thr:5,lo:{6:-0.0046,5:0.15,4:-1.7,3:9.3,2:-27.3,1:55.0},hi:{3:0.001,2:-0.15,1:12.8,0:29.0},loD:false},ml:{thr:5,lo:{6:-0.003,5:0.15,4:-1.82,3:9.65,2:-26.3,1:55.0},hi:{3:0.001,2:-0.28,1:17.45,0:27.749999999999993},loD:false}},
  {size:'SLDL',vp1:[0.014,11.75,4.111,7.639,-1],vp2:[0,9e-8,0.00764,4.413366248,4.111],vp3:[0.12,0.32,4.111,2.80443001,1],disp:0.5116666666666667,portIn:2,portMm:50, margin:1.03, np:[0.004287030000000004,0.9,0.58,0.18,-1e-09,4.9e-06,0.00055,4e-12,1e-07,0.0012,2.04], maxTorque:615,maxSpeed:1000,maxPres:10,pc:[1.28e-06,0.00232,0.92,9.21,3], portDia:47.6,rotorDia:142,flowVar1:11,flowVarMax:24,rv0:10,rvMax:31,bw:{thr:5,lo:{6:-0.0001,5:0.0103,4:-0.2403,3:2.5779,2:-14.6,1:58.7},hi:{3:-0.011,2:-0.03,1:16.7,0:49.8},loD:false},ml:{thr:5,lo:{6:-0.0001,5:0.0103,4:-0.2403,3:2.5779,2:-14.6,1:60.7},hi:{3:-0.011,2:-0.03,1:17.7,0:54.8},loD:false}},
  {size:'SLES',vp1:[0.980005,0.155,5.205,5.05,1],vp2:[8e-8,-1.8e-5,0.0122,5.43448446,5.205],vp3:[0.145,0.3732,5.205,3.841654716,1],disp:0.71,portIn:2,portMm:50, margin:1.03, np:[0.0017,1.2,0.5980266901690274,0.18,-1e-09,5.5e-06,1e-07,7e-11,-7e-07,0.006,4.3], maxTorque:1060,maxSpeed:800,maxPres:15,pc:[3.4e-06,0.00185245,0.99193,10.97,15.61], portDia:47.6,rotorDia:176,flowVar1:16,flowVarMax:35,rv0:12,rvMax:47,bw:{thr:5,lo:{6:-0.0002,5:0.01,4:-0.22,3:2.65,2:-16.4,1:66.0},hi:{2:-0.19,1:20.5,0:44.125},loD:false},ml:{thr:5,lo:{6:-0.0002,5:0.0115,4:-0.2366,3:2.4778,2:-14.2,1:63.502},hi:{2:-0.1733,1:20.7,0:58.0},loD:false}},
  {size:'SLEL',vp1:[0.980005,0.174,6.22,6.046,1],vp2:[8e-8,-1.8e-5,0.01622,6.452158813,6.22],vp3:[3.995,0.3012,7.22,3.18074950406143,1],disp:1.0633333333333332,portIn:3,portMm:76, margin:1.03, np:[0.0012,1.35,0.7035862357142781,0.16,-1e-09,5.8e-06,6e-08,5e-12,-7e-08,0.006,28], maxTorque:1060,maxSpeed:800,maxPres:10,pc:[3.4e-06,0.00185245,1.184,16.26,19.4], portDia:72.3,rotorDia:176,flowVar1:19,flowVarMax:42,rv0:12,rvMax:36,bw:{thr:5,lo:{6:-0.0039,5:0.116,4:-1.3748,3:8.5,2:-31.0,1:91.2},hi:{2:-0.45,1:25.6,0:69.06249999999999},loD:false},ml:{thr:5,lo:{6:-0.0039,5:0.116,4:-1.3748,3:8.5,2:-30.2,1:88.0},hi:{2:-0.45,1:28.0,0:61.0625},loD:false}},
  {size:'SLFS',vp1:[3.1105,0.155,11.5,11.345,1],vp2:[5e-8,-0.000168,0.04473,12.17958959,11.5],vp3:[985,0.184,11.5,6.72805034,1],disp:1.478,portIn:3,portMm:76, margin:1.03, np:[0.0008,1.6,0.8040985551020325,0.16,-3e-11,1e-05,4e-05,1e-11,-7e-08,0.014,40], maxTorque:1200,maxSpeed:600,maxPres:15,pc:[8.4e-06,0.00185245,1.757,17.9,25], portDia:72.3,rotorDia:205,flowVar1:22,flowVarMax:48,rv0:15,rvMax:61,bw:{thr:3,lo:{6:-0.002,5:0.105,4:-0.2,3:0.3,2:-13.5,1:92.0},hi:{2:-0.45,1:32.7,0:76.40700000000002},loD:false},ml:null},
  {size:'SLFL',vp1:[3.1105,0.14,13.185,13.045,1],vp2:[5e-8,-0.000168,0.0479,13.72545673,13.185],vp3:[96000050,0.121,13.185,0.7472659,1],disp:2.24,portIn:4,portMm:101, margin:1.03, np:[0.002,1.85,1.0758552935120336,0.14,-3e-11,8e-06,0.0001,5e-11,-7e-07,0.01,50], maxTorque:1200,maxSpeed:600,maxPres:10,pc:[8.4e-06,0.00185245,2.043,26.4,32], portDia:97.6,rotorDia:205,flowVar1:24,flowVarMax:55,rv0:15,rvMax:46,bw:{thr:3,lo:{6:0.0002,5:0.28,4:-2.1,3:11.4,2:-52.0,1:170.0},hi:{4:-0.02,3:0.6,2:-7.5,1:73.0,0:81.8058},loD:true},ml:null},
  {size:'SLGS',vp1:[3.1105,0.155,11.5,11.345,1],vp2:[5e-8,-0.000168,0.04473,12.17958959,11.5],vp3:[985,0.184,11.5,6.72805034,1],disp:3.0416666666666665,portIn:4,portMm:101, margin:1.03, np:[0.002,1.6,0.9446534284495905,0.14,-3e-11,8e-06,0.0001,3e-11,-1e-08,0.01,60], maxTorque:2050,maxSpeed:600,maxPres:15,pc:[8.4e-06,0.00185245,3.3,56.9,58.5], portDia:97.6,rotorDia:240,flowVar1:26,flowVarMax:60,rv0:0,rvMax:0,bw:{thr:3,lo:{6:0.0002,5:0.28,4:-2.1,3:11.4,2:-66.5,1:282.5},hi:{2:-1.7,1:83.0,0:221.18580000000003},loD:false},ml:null},
  {size:'SLGL',vp1:[0.980005,0.174,6.22,6.046,1],vp2:[8e-8,-1.8e-5,0.01622,6.452158813,6.22],vp3:[4.3995,0.2412,6.22,3.633167855,1],disp:4.566666666666666,portIn:6,portMm:152, margin:1.03, np:[0.002,1.4,1.0758552935120336,0.08620416566974516,-3e-11,6.7e-06,5e-05,2e-11,-7e-08,0.03,30], maxTorque:2050,maxSpeed:600,maxPres:10,pc:[8.4e-06,0.00185245,3.95,80.9,77], portDia:148,rotorDia:240,flowVar1:30,flowVarMax:80,rv0:0,rvMax:0,bw:{thr:3,lo:{6:-0.0006,5:0.029,4:-0.5714,3:9.0,2:-80.0,1:382.0},hi:{2:-4.8,1:130.4,0:281.3261999999999},loD:false},ml:null},
];

function sterilobeCalc(inputs){
  const env = envFrom(inputs);
  const { flow, bar, barISF, cP, hpUnits } = env;
  const rv = inputs.rv || false;
  const vm = cP < 1 ? NaN : cP >= 400 ? 0 : 1 - (213.9*(Math.pow(L(cP),2)*L(400)) - 213.9)/(213.9*213.9);
  const rvFlowVar = f => {
    if (!f.rv0 && !f.rvMax) return 0;
    const v = bar > f.maxPres ? NaN : ((f.rvMax - f.rv0) * bar / f.maxPres) + f.rv0;
    return v * vm / 1.004675;
  };
  const evalPoly = (coeffs, x) => {
    let s = 0;
    for (const e in coeffs) s += coeffs[e] * Math.pow(x, +e);
    return s;
  };
  const slipForm = (f, form, p) => {
    const cfg = f[form === 'b' ? 'bw' : 'ml'];
    const x = p;
    const lo = x < cfg.thr;
    const base = evalPoly(lo ? cfg.lo : cfg.hi, x) * f.margin * vm;
    const slip = lo && cfg.loD ? base * f.margin * vm : base;   // source quirk: lo branch x2
    return rv ? slip + rvFlowVar(f) : slip;
  };
  const npshBase = f => cP < 100 ? f.np[0]*cP + f.np[1] : f.np[2]*cP**f.np[3];
  const npshAt = (f, rpm) => f.np[4]*rpm**3 + f.np[5]*rpm**2 + f.np[6]*rpm + npshBase(f);
  const npshFac = f => (f.np[7]*cP**3 + f.np[8]*cP**2 + f.np[9]*cP + f.np[10]) / f.np[10];
  const npshr = (f, rpm) => (npshAt(f, rpm) - npshBase(f)) * npshFac(f) + npshBase(f);
  const vmP = f => {
    if (cP >= 100) { const v = f.vp3; return ((v[0]*cP)**v[1] + v[3]*v[4]) / v[2]; }
    if (cP >= 10)  { const v = f.vp2; return (v[0]*cP**3 + v[1]*cP**2 + v[2]*cP + v[3]) / v[4]; }
    if (cP >= 1)   { const v = f.vp1; return ((((v[0]*L(cP))+1)*v[1]) + v[3]*v[4]) / v[2]; }
    return 1;
  };
  function calc(f, form){
    const base = { size:f.size, form, disp:f.disp, portIn:f.portIn, portMm:f.portMm, rotorDia:f.rotorDia,
      maxSpeed:f.maxSpeed, maxPres:f.maxPres, maxTorque:f.maxTorque };
    if (form === 'm' && !f.ml) return { ...base, ok:false, reason:'rotor form not offered' };
    if (bar > f.maxPres) return { ...base, ok:false, reason:'pressure exceeds max' };
    // source quirk: multilobe validity checks BiWing slip, result uses Multilobe slip
    const chk = slipForm(f, 'b', barISF);
    const rpmChk = (flow + chk)/f.disp;
    const slip = slipForm(f, form, barISF);
    const rpm = (flow + slip)/f.disp;
    if (!(rpmChk < f.maxSpeed)) return { ...base, ok:false, reason:'rpm exceeds max' };
    const np = npshr(f, rpm);
    const rpmOk = np < 15 && rpm > 0;
    if (!rpmOk) return { ...base, ok:false, reason: np >= 15 ? 'NPSHr > 15 m' : 'rpm <= 0' };
    const tq = ((f.pc[0]*rpm**2 + f.pc[1]*rpm) * f.pc[2] * 9550/rpm) * vmP(f) + ((f.maxSpeed - rpm)/f.maxSpeed * f.pc[4]) + ((bar - 1) * f.pc[3]);
    const power = tq*rpm/9550;
    const fv = ((f.flowVarMax - f.flowVar1) * bar / f.maxPres + f.flowVar1) * vm / 1.004675;
    return { ...base, ok:true, rpm,
      power: hpUnits ? power*1.34 : power,
      torque: tq < f.maxTorque ? (hpUnits ? tq*0.737561 : tq) : null,
      npshr: np < 15 ? (hpUnits ? np*3.28083 : np) : null,
      tip:null, flowVar: fv, speedVar: fv / f.disp, slip };
  }
  const biwing = STERILOBE_SIZES.map(f => calc(f, 'b'));
  const multilobe = STERILOBE_SIZES.map(f => calc(f, 'm'));
  biwing.forEach((s,i)=>{ if(s.ok) s.tip = Math.PI*STERILOBE_SIZES[i].rotorDia/1000*s.rpm/60; });
  const rec = biwing.find(r => r.ok);
  return { env, slipAtP: (f, form, P) => slipForm(f, form, P), biwing, multilobe, recommended: rec ? rec.size : null };
}

// ------------------------------------------------------------
// 5) RTP — single rotor class
// ------------------------------------------------------------
const RTP_SIZES = [
  {size:'RTP20',  disp:1,    portIn:3, portMm:76, p6:[0.3,-0.15,1.5,0.05,40.5,199], p2:[-1.78,56.8,120.32], margin:1, np:[0.002,1.7,1.4412974,0.06,-3e-11,4e-06,5e-05,2e-11,-7e-08,0.03,115], maxTorque:500,maxSpeed:1000,maxPres:10, pc:[8.4e-06,0.00185245,0.92,17,16], portDia:72.3,rotorDia:142,flowVar1:22,flowVarMax:60},
  {size:'RTP20HE',disp:1,    portIn:3, portMm:76, p6:[0.6,-0.5,0.4,0.2,38,144.2], p2:[-2.6,51.9,60.6],  margin:1, np:[0.002,1.7,1.4412974,0.06,-3e-11,4e-06,5e-05,2e-11,-7e-08,0.03,115], maxTorque:500,maxSpeed:1000,maxPres:5,  pc:[8.4e-06,0.00185245,0.92,17,16], portDia:72.3,rotorDia:142,flowVar1:12,flowVarMax:30},
  {size:'RTP30',  disp:1.28, portIn:3, portMm:76, p6:[0.8,-0.5,0.5,0.15,91,323.5], p2:[-2.5,70,181.4],  margin:1, np:[0.002,2,1.4791573,0.08620416566974516,-3e-11,5e-06,5e-05,2e-11,-7e-08,0.03,90],  maxTorque:600,maxSpeed:1000,maxPres:12, pc:[8.4e-06,0.00185245,1.09,19.1,17], portDia:72.3,rotorDia:151,flowVar1:25,flowVarMax:65},
  {size:'RTP30HE',disp:1.28, portIn:3, portMm:76, p6:[0.8,-0.5,0.5,0.15,58.85,200],p2:[-3,53,99],     margin:1, np:[0.002,2,1.4791573,0.08620416566974516,-3e-11,5e-06,5e-05,2e-11,-7e-08,0.03,90],  maxTorque:600,maxSpeed:1000,maxPres:5,  pc:[8.4e-06,0.00185245,1.09,19.1,17], portDia:72.3,rotorDia:151,flowVar1:18,flowVarMax:40},
];

function rtpCalc(inputs){
  const env = envFrom(inputs);
  const { flow, bar, barISF, cP, hpUnits } = env;   // RTP has no ISF input -> barISF unused
  const vm = cP < 1 ? NaN : cP >= 500 ? 0 : (1 - (239*(Math.pow(L(cP),2)*L(500)) - 239)/(239*239)) / 1.035342;
  const slipF = (f, p) => {
    const [a6,a5,a4,a3,a2,a1] = f.p6, [b2,b1,c0] = f.p2;
    const s = p < 2
      ? ((a6*p**6 + a5*p**5 - a4*p**4 + a3*p**3 - a2*p**2 + a1*p) * f.margin * vm)
      : ((((b2*p*p + b1*p) + c0)) * f.margin * vm);
    return s;
  };
  const npshBase = f => cP < 100 ? f.np[0]*cP + f.np[1] : f.np[2]*cP**f.np[3];
  const npshAt = (f, rpm) => f.np[4]*rpm**3 + f.np[5]*rpm**2 + f.np[6]*rpm + npshBase(f);
  const npshFac = f => (f.np[7]*cP**3 + f.np[8]*cP**2 + f.np[9]*cP + f.np[10]) / f.np[10];
  const npshr = (f, rpm) => (npshAt(f, rpm) - npshBase(f)) * npshFac(f) + npshBase(f);
  const vmP = cP >= 100 ? (((3.995*cP)**0.245) + 3.18074950406143)/5.86544
            : cP >= 10  ? ((8e-08*cP**3 - 1.8e-05*cP**2 + 0.01622*cP + 6.452158813)/6.22)
            : cP >= 1   ? ((((0.980005*L(cP))+1)*0.174) + 6.046)/6.22 : 1;
  function calc(f){
    const base = { size:f.size, cls:'std', disp:f.disp, portIn:f.portIn, portMm:f.portMm, rotorDia:f.rotorDia,
      maxSpeed:f.maxSpeed, maxPres:f.maxPres, maxTorque:f.maxTorque };
    if (bar > f.maxPres) return { ...base, ok:false, reason:'pressure exceeds max' };
    const slip = slipF(f, bar);
    const rpm = (flow + slip)/f.disp;
    if (!(rpm < f.maxSpeed)) return { ...base, ok:false, reason:'rpm exceeds max' };
    const np = npshr(f, rpm);
    if (!(np < 15 && rpm > 0)) return { ...base, ok:false, reason: np >= 15 ? 'NPSHr > 15 m' : 'rpm <= 0' };
    const tq = ((f.pc[0]*rpm**2 + f.pc[1]*rpm) * f.pc[2] * 9550/rpm) * vmP + ((f.maxSpeed - rpm)/f.maxSpeed * f.pc[4]) + ((bar - 1) * f.pc[3]);
    const power = tq*rpm/9550;
    const fv = (((f.flowVarMax - f.flowVar1) * bar / f.maxPres) + f.flowVar1) * vm;
    return { ...base, ok:true, rpm,
      power: hpUnits ? power*1.34 : power,
      torque: tq < f.maxTorque ? (hpUnits ? tq*0.737561 : tq) : null,
      npshr: np < 15 ? (hpUnits ? np*3.28083 : np) : null,
      tip:null, flowVar: fv, speedVar: fv / f.disp, slip };
  }
  const std = RTP_SIZES.map(f => calc(f));
  std.forEach((s,i)=>{ if(s.ok) s.tip = Math.PI*RTP_SIZES[i].rotorDia/1000*s.rpm/60; });
  const rec = std.find(r => r.ok);
  return { env, slipAtP: (f, cls, P) => slipF(f, P), std, recommended: rec ? rec.size : null };
}
// ------------------------------------------------------------
// 6) ACCULOBE — Lobe / Wing rotors, dual-port NPSHr
// ------------------------------------------------------------
const ACCULOBE_SIZES = [
  {size:'Lobe',disp:0.02,  portIn:'0.5 or 0.75', portMm:'13 or 19', p5:[0.0005,0.0227,0.381,3.0604,14.167], margin:1, np12:[0.0075,1.75,0.8668421261313293,0.23,-1e-12,6.2e-07,1e-06,7e-11,-7e-07,0.01,1.9034219879531455], np34:[0.006,1.7,0.973,0.1868060393602774,-1e-12,6.2e-07,1e-06,7e-11,-7e-07,0.01,1.8], maxTorque:26,maxSpeed:1750,maxPres:12, pc:[1.28e-06,0.00185245,0.0645,0.306,0.65], portDia:16,rotorDia:52,flowVar1:3,flowVarMax:7},
  {size:'Wing',disp:0.0194,portIn:'0.5 or 0.75', portMm:'13 or 19', p5:[0.98,4.4,9.7,0,0],            margin:1, np12:[0.0075,1.75,0.8668421261313293,0.23,-1e-12,6.2e-07,1e-06,7e-11,-7e-07,0.01,1.9034219879531455], np34:[0.006,1.7,0.973,0.1868060393602774,-1e-12,6.2e-07,1e-06,7e-11,-7e-07,0.01,1.8], maxTorque:26,maxSpeed:1750,maxPres:12, pc:[1.28e-06,0.00185245,0.0645,0.306,0.65], portDia:16,rotorDia:52,flowVar1:2,flowVarMax:5},
];

function acculobeCalc(inputs){
  const env = envFrom(inputs);
  const flow = flowToLmin(inputs.flow, inputs.flowUnit);
  const bar  = presToBar(inputs.pres, inputs.presUnit);       // X19 (raw)
  const barISF = inputs.isf ? (bar > 1 ? bar + 1 : bar * 2) : bar;  // Y19
  const cP   = viscToCP(inputs.visc, inputs.viscUnit);        // Y20
  const hpUnits = (inputs.flowUnit === 'gpm' || inputs.flowUnit === 'usgpm');
  const flushed = inputs.flushed !== 'No';                    // D12 default Yes? (source: 'No' -> 1750 rpm)
  const maxSpeed = inputs.flushed === 'No' ? 1750 : 800;
  const vm = cP < 1 ? NaN : cP >= 170 ? 0 : ((-23.7*(L(cP)/5.136)) + 23.7) / 23.7;
  const slipF = (f, p) => {
    const [a5,a4,a3,a2,a1] = f.p5;
    // source quirk: margin multiplies only the linear term, and there is no whole-expression margin
    return ((a5*p**5 - a4*p**4 + a3*p**3 - a2*p**2 + a1*p) * f.margin) * vm;
  };
  const npshBase = (np, x) => cP < 100 ? np[0]*cP + np[1] : np[2]*cP**np[3];
  const npshAt = (np, rpm) => np[4]*rpm**3 + np[5]*rpm**2 + np[6]*rpm + npshBase(np, rpm);
  const npshFac = np => (np[7]*cP**3 + np[8]*cP**2 + np[9]*cP + np[10]) / np[10];
  const npshr = (np, rpm) => (npshAt(np, rpm) - npshBase(np, rpm)) * npshFac(np) + npshBase(np, rpm);
  const vmP = cP >= 100 ? (0.6986*L(cP)) - 1.236
            : cP >= 10  ? (3e-08*cP*cP + 0.010121*cP + 0.968786)
            : cP >= 1   ? (0.0304*L(cP)) + 1 : 1;
  function calc(f){
    const base = { size:f.size, cls:'std', disp:f.disp, portIn:f.portIn, portMm:f.portMm, rotorDia:f.rotorDia,
      maxSpeed, maxPres:f.maxPres, maxTorque:f.maxTorque };
    if (bar > f.maxPres) return { ...base, ok:false, reason:'pressure exceeds max' };
    const slip = slipF(f, bar);
    const rpm = (flow + slip)/f.disp;
    if (!(rpm < maxSpeed)) return { ...base, ok:false, reason:'rpm exceeds max' };
    const np12 = npshr(f.np12, rpm), np34 = npshr(f.np34, rpm);
    if (!(np12 < 15 && np34 < 15 && rpm > 0)) return { ...base, ok:false, reason: (np12 >= 15 || np34 >= 15) ? 'NPSHr > 15 m' : 'rpm <= 0' };
    const tq = ((f.pc[0]*rpm**2 + f.pc[1]*rpm) * f.pc[2] * 9550/rpm) * vmP + ((maxSpeed - rpm)/maxSpeed * f.pc[4]) + ((bar - 1) * f.pc[3]);
    const power = tq*rpm/9550;
    const fv = (((f.flowVarMax - f.flowVar1) * bar / f.maxPres) + f.flowVar1) * vm;
    return { ...base, ok:true, rpm,
      power: hpUnits ? power*1.34 : power,
      torque: tq < f.maxTorque ? (hpUnits ? tq*0.737561 : tq) : null,
      npshr12: np12 < 15 ? (hpUnits ? np12*3.28083 : np12) : null,
      npshr34: np34 < 15 ? (hpUnits ? np34*3.28083 : np34) : null,
      tip:null, flowVar: fv, speedVar: fv / f.disp, slip };
  }
  const std = ACCULOBE_SIZES.map(f => calc(f));
  std.forEach((s,i)=>{ if(s.ok) s.tip = Math.PI*ACCULOBE_SIZES[i].rotorDia/1000*s.rpm/60; });
  const rec = std.find(r => r.ok);
  return { env, slipAtP: (f, cls, P) => slipF(f, P), std, recommended: rec ? rec.size : null };
}
// ------------------------------------------------------------
// registry + dispatcher
// ------------------------------------------------------------
const ENGINES = {
  'Revolution RLP':  { calc: inputs => calcAll(inputs), sizes: SIZE_DATA, classes: [{key:'std',label:'Standard / 70°C'},{key:'hot',label:'Hot / 150°C'}] },
  'Revolution CPP':  { calc: cppCalc,       sizes: CPP_SIZES, classes: [{key:'std',label:'Std / 93°C'},{key:'ff',label:'FF / 105°C'},{key:'hot',label:'Hot / 150°C'},{key:'choc',label:'Choc / refer WFT'}] },
  'MP-CP':           { calc: mpcpCalc,      sizes: MPCP_SIZES, classes: [{key:'a',label:'Class A / 70°C'},{key:'b',label:'Class B / 100°C'},{key:'c',label:'Class C / 150°C'}], rowKeys:{a:'std'} },
  'Sterilobe':       { calc: sterilobeCalc, sizes: STERILOBE_SIZES, classes: [{key:'b',label:'BiWing / 150°C'},{key:'m',label:'Multilobe / 150°C'}], rowKeys:{b:'biwing',m:'multilobe'} },
  'RTP':             { calc: rtpCalc,       sizes: RTP_SIZES, classes: [{key:'std',label:'Standard'}] },
  'Acculobe':        { calc: acculobeCalc,  sizes: ACCULOBE_SIZES, classes: [{key:'std',label:'Standard'}] },
};

// Performance-curve points: flow vs pressure at the DUTY rpm (Q = rpm*disp - slip(P)).
function curveData(seriesKey, sizeKey, clsKey, inputs){
  const eng = ENGINES[seriesKey];
  if (!eng) return null;
  const res = eng.calc(inputs);
  if (!res.slipAtP) return null;
  const size = eng.sizes.find(s => s.size === sizeKey);
  if (!size) return null;
  const rk = (eng.rowKeys && eng.rowKeys[clsKey]) || clsKey;
  const row = (res[rk] || []).find(r => r && r.size === sizeKey);
  if (!row || !row.ok || row.rpm == null || isNaN(row.rpm)) return null;
  const maxP = row.maxPres != null ? row.maxPres : 0;
  const step = maxP <= 8 ? 0.25 : 0.5;
  const pts = [];
  for (let P = 0; P <= maxP + 1e-9; P += step){
    let slip = null;
    try { slip = res.slipAtP(size, clsKey, P); } catch (e) { slip = null; }
    if (slip == null || isNaN(slip)) continue;
    pts.push({ P: Math.round(P*1000)/1000, q: Math.max(0, row.rpm * row.disp - slip) });
  }
  return { pts, dutyP: res.env ? res.env.bar : 0, dutyQ: res.env ? res.env.flow : 0, maxP, rpm: row.rpm };
}

// Q-N curve: flow vs pump speed (0..max speed) at several pressures.
// Lines: q(rpm) = rpm*disp - slip(P)  — the duty-pressure line passes through the duty point.
function speedCurve(seriesKey, sizeKey, clsKey, inputs){
  const eng = ENGINES[seriesKey];
  if (!eng) return null;
  const res = eng.calc(inputs);
  if (!res.slipAtP) return null;
  const size = eng.sizes.find(s => s.size === sizeKey);
  if (!size) return null;
  const rk = (eng.rowKeys && eng.rowKeys[clsKey]) || clsKey;
  const row = (res[rk] || []).find(r => r && r.size === sizeKey);
  if (!row || !row.ok || row.rpm == null || isNaN(row.rpm)) return null;
  const maxSpeed = row.maxSpeed != null ? row.maxSpeed : (size.maxSpeed || 0);
  const disp = row.disp != null ? row.disp : size.disp;
  const dutyP = res.env ? res.env.bar : 0;
  const maxP = row.maxPres != null ? row.maxPres : (size.maxPres || 0);
  const Ps = [0, dutyP, maxP].filter((v, i, a) => v != null && !isNaN(v) && a.indexOf(v) === i).sort((a, b) => a - b);
  const N = 25;
  const lines = Ps.map(P => {
    let slip = 0;
    try { slip = res.slipAtP(size, clsKey, P); } catch (e) { slip = 0; }
    if (slip == null || isNaN(slip)) slip = 0;
    const pts = [];
    for (let i = 0; i <= N; i++) {
      const rpm = maxSpeed * i / N;
      pts.push({ rpm: Math.round(rpm * 100) / 100, q: Math.max(0, rpm * disp - slip) });
    }
    return { P: Math.round(P * 1000) / 1000, slip: Math.round(slip * 1000) / 1000, pts };
  });
  return { maxSpeed, disp, lines, dutyP, dutyQ: res.env ? res.env.flow : 0, dutyRpm: Math.round(row.rpm * 100) / 100 };
}

function calcSeries(seriesKey, inputs){
  const eng = ENGINES[seriesKey];
  if (!eng) return null;
  const r = eng.calc(inputs);
  const rows = {};
  for (const c of eng.classes) rows[c.key] = r[c.key] || r[eng.rowKeys && eng.rowKeys[c.key]] || [];
  return { env: r.env, rows, recommended: r.recommended, classes: eng.classes };
}

if (typeof module !== 'undefined') module.exports = { ...module.exports, calcSeries, curveData, speedCurve, ENGINES, CPP_SIZES, MPCP_SIZES, STERILOBE_SIZES, RTP_SIZES, ACCULOBE_SIZES };
if (typeof window !== 'undefined') window.RLPEngine = { ...window.RLPEngine, calcSeries, curveData, speedCurve, ENGINES };
