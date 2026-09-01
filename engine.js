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
    std, hot, recommended: recommended ? recommended.size : null,
  };
}

// ---- module export (Node) / window (browser) ----
if (typeof module !== 'undefined') module.exports = { SIZE_DATA, calcAll, calcSize, flowToLmin, presToBar, viscToCP };
if (typeof window !== 'undefined') window.RLPEngine = { SIZE_DATA, calcAll, calcSize };
