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
  {size:'0150X',disp:0.0548,portIn:1.5,portMm:38, a3:0.1942,a2:2.11,a1:10.916,c:0, b4:3e-05,b3:0.0008,b2:0.0358,b1:3.8167,b0:7.99775, ffMin:2,ffMax:10.4,htMin:3,htMax:13.5,chMin:7,chMax:25.9, off:1.32, ramp:0.686, c107:5.217279205241151, maxTorque:90.4,maxSpeed:800,maxPres:21,rollTorque:4,viscPowF:82,e138:0.23,e141:0.3,e142:0.35,e143:0.5556, margin:1},
  {size:'0180P',disp:0.1096,portIn:1.5,portMm:38, a3:0.17,  a2:2.1, a1:13.5, c:0, b4:3e-05,b3:0.0002,b2:0.04,  b1:4.8,  b0:13.48125, ffMin:4,ffMax:12.4,htMin:5.5,htMax:18.1,chMin:9,chMax:30, off:2.01, ramp:0.5370775092870214, c107:4.803340305542831, maxTorque:90.4,maxSpeed:800,maxPres:14,rollTorque:4,viscPowF:55,e138:0,e141:0,e142:0,e143:0, margin:1},
  {size:'0200X',disp:0.1592,portIn:1.5,portMm:38, a3:0.17,  a2:2.18,a1:14.9, c:0, b4:3e-05,b3:0.0002,b2:0.04,  b1:5.3,  b0:15.98125, ffMin:4,ffMax:20.8,htMin:7,htMax:34.3,chMin:12,chMax:54, off:2.3,  ramp:0.4719333370015336, c107:4.6182958343114695, maxTorque:342,maxSpeed:800,maxPres:21,rollTorque:7,viscPowF:49,e138:0,e141:0,e142:0,e143:0, margin:1},
  {size:'0300X',disp:0.2256,portIn:1.5,portMm:38, a3:0.16,  a2:2.25,a1:16.3, c:0, b4:3e-05,b3:0.0002,b2:0.04,  b1:5.7,  b0:17.9812,  ffMin:6,ffMax:21.3,htMin:10,htMax:37.2,chMin:15,chMax:52.4, off:2.98, ramp:0.415475054354111, c107:4.858227236882833, maxTorque:342,maxSpeed:800,maxPres:17,rollTorque:7,viscPowF:41,e138:0,e141:0,e142:0,e143:0, margin:1},
  {size:'0400X',disp:0.2919,portIn:2,  portMm:51, a3:0.15,  a2:2.3, a1:18,   c:0, b4:3e-05,b3:0.0003,b2:0.04,  b1:6.5,  b0:20.10625, ffMin:8,ffMax:22,htMin:14,htMax:37.8,chMin:19,chMax:54, off:2.51, ramp:0.3807314958018507, c107:4.181695188572837, maxTorque:342,maxSpeed:800,maxPres:14,rollTorque:7,viscPowF:35,e138:0,e141:0,e142:0,e143:0, margin:1},
  {size:'0450X',disp:0.4239,portIn:2,  portMm:51, a3:0.4,   a2:8,  a1:51,   c:0, b4:0.0001,b3:0.006,b2:0.09,  b1:13.4, b0:52.6,     ffMin:14,ffMax:51.2,htMin:18,htMax:80,chMin:26,chMax:119, off:2.71, ramp:0.33295910279249313, c107:4.036888102171194, maxTorque:570,maxSpeed:600,maxPres:31,rollTorque:14,viscPowF:40,e138:0,e141:0,e142:0,e143:0, margin:1},
  {size:'0600P',disp:0.581, portIn:2.5,portMm:64, a3:0.6,   a2:10, a1:59,   c:0, b4:-0.3, b3:17.3,b2:53.9, b1:0,   b0:0,        ffMin:17,ffMax:48.5,htMin:21,htMax:67.2,chMin:29,chMax:102.5, off:2.58, ramp:0.29821554424023267, c107:3.676408710375955, maxTorque:570,maxSpeed:600,maxPres:21,rollTorque:14,viscPowF:30,e138:0,e141:0,e142:0,e143:0, margin:1},
  {size:'0800X',disp:0.7694,portIn:2.5,portMm:64, a3:0.7,   a2:11, a1:65,   c:0, b4:-0.41,b3:20.5,b2:57,   b1:0,   b0:0,        ffMin:19,ffMax:51.3,htMin:24,htMax:66.5,chMin:32,chMax:100, off:3.18, ramp:0.26926257878001614, c107:4.035258482534153, maxTorque:570,maxSpeed:600,maxPres:17,rollTorque:14,viscPowF:25,e138:0,e141:0,e142:0,e143:0, margin:1},
  {size:'1300X',disp:1.0049,portIn:3,  portMm:76, a3:0.75,  a2:13, a1:81,   c:0, b4:-0.6, b3:25.5,b2:75.15,b1:0,   b0:0,        ffMin:21,ffMax:53.2,htMin:27,htMax:66.2,chMin:36,chMax:99, off:3.14, ramp:0.2456659119299397, c107:3.8347989487306684, maxTorque:570,maxSpeed:600,maxPres:14,rollTorque:14,viscPowF:25,e138:0,e141:0,e142:0,e143:0, margin:1},
  {size:'1800X',disp:1.4602,portIn:3,  portMm:76, a3:0.8,   a2:14, a1:98,   c:0, b4:-0.52,b3:36, b2:86.28,b1:0,   b0:0,        ffMin:24,ffMax:104.6,htMin:32,htMax:131.2,chMin:44,chMax:214.5, off:3.51, ramp:0.2152652981967118, c107:3.972220692126699, maxTorque:1073,maxSpeed:600,maxPres:31,rollTorque:35,viscPowF:27,e138:0,e141:0,e142:0,e143:0, margin:1},
  {size:'1830X',disp:1.4602,portIn:3,  portMm:76, a3:0.8,   a2:14, a1:98,   c:0, b4:-0.52,b3:36, b2:86.28,b1:0,   b0:0,        ffMin:24,ffMax:104.6,htMin:32,htMax:131.2,chMin:44,chMax:214.5, off:3.51, ramp:0.2152652981967118, c107:3.972220692126699, maxTorque:1073,maxSpeed:600,maxPres:31,rollTorque:35,viscPowF:27,e138:0,e141:0,e142:0,e143:0, margin:1},
  {size:'2200X',disp:1.9756,portIn:4,  portMm:102,a3:0.8,   a2:14, a1:102,  c:0, b4:-0.52,b3:38, b2:92.28,b1:0,   b0:0,        ffMin:30,ffMax:93,htMin:38,htMax:117.8,chMin:52,chMax:192.7, off:3.06, ramp:0.19340580927424839, c107:3.39895855909929, maxTorque:1073,maxSpeed:600,maxPres:21,rollTorque:35,viscPowF:21,e138:0,e141:0,e142:0,e143:0, margin:1},
  {size:'2230X',disp:1.9756,portIn:4,  portMm:102,a3:0.8,   a2:14, a1:102,  c:0, b4:-0.52,b3:38, b2:92.28,b1:0,   b0:0,        ffMin:30,ffMax:93,htMin:38,htMax:117.8,chMin:52,chMax:192.7, off:3.06, ramp:0.19340580927424839, c107:3.39895855909929, maxTorque:1073,maxSpeed:600,maxPres:21,rollTorque:35,viscPowF:21,e138:0,e141:0,e142:0,e143:0, margin:1},
  {size:'2600P',disp:2.5196,portIn:4,  portMm:102,a3:0.8,   a2:14, a1:105,  c:0, b4:-0.52,b3:40, b2:95.28,b1:0,   b0:0,        ffMin:36,ffMax:85,htMin:47,htMax:117,chMin:60,chMax:200, off:3.66, ramp:0.17733691344382824, c107:3.851607889842236, maxTorque:1073,maxSpeed:600,maxPres:14,rollTorque:35,viscPowF:22,e138:0,e141:0,e142:0,e143:0, margin:1},
  {size:'2630P',disp:2.5196,portIn:4,  portMm:102,a3:0.8,   a2:14, a1:105,  c:0, b4:-0.52,b3:40, b2:95.28,b1:0,   b0:0,        ffMin:36,ffMax:85,htMin:47,htMax:117,chMin:60,chMax:200, off:3.66, ramp:0.17733691344382824, c107:3.851607889842236, maxTorque:1073,maxSpeed:600,maxPres:14,rollTorque:35,viscPowF:22,e138:0,e141:0,e142:0,e143:0, margin:1},
  {size:'3200X',disp:3,     portIn:6,  portMm:152,a3:0.8,   a2:18, a1:118,  c:0, b4:-0.52,b3:40, b2:98.28,b1:0,   b0:0,        ffMin:41,ffMax:125,htMin:58,htMax:173.5,chMin:88,chMax:266.5, off:2.35, ramp:0.1667690810508485, c107:2.5562366141184634, maxTorque:1073,maxSpeed:600,maxPres:21,rollTorque:55,viscPowF:24,e138:0,e141:0,e142:0,e143:0, margin:1},
];

function cppCalc(inputs){
  const env = envFrom(inputs);
  const { flow, bar, barISF, cP, hpUnits } = env;
  const vm = cP >= 400 ? 0 : cP > 90 ? (-0.01275*cP + 5.0968)/100 : cP >= 1 ? -0.42*Math.pow(L(cP), 0.55) + 1 : NaN;
  const slipStd = f => (barISF < 5
    ? (f.a3*barISF**3 - f.a2*barISF**2 + f.a1*barISF + f.c)
    : (f.b4*barISF**4 - f.b3*barISF**3 - f.b2*barISF**2 + f.b1*barISF + f.b0)) * f.margin * vm;
  const addSlip = (f, lo, hi) => ((hi - lo) * barISF / f.maxPres) + lo;
  const CLS_PFX = { ff:'ff', hot:'ht', choc:'ch' };
  const slipOf = (f, cls) => cls === 'std' ? slipStd(f) : slipStd(f) + addSlip(f, f[CLS_PFX[cls]+'Min'], f[CLS_PFX[cls]+'Max']) * vm;
  const npMult = f => {
    const off = f.off, c107 = f.c107, ramp = f.ramp;
    const r108 = ramp * L(cP) + off;
    const r109 = (3e-15*off**0.2)*cP**3 + (-2.8e-9*off**0.2)*cP**2 + (0.0008*off**0.2)*cP + c107;
    return cP < 1000 ? r108 : r109;
  };
  const viscPow = f => {
    const e139 = Z(f.e138) * L(cP) + 1;
    const e144 = (cP ** Z(f.e142)) * Z(f.e141) + Z(f.e143);
    return cP < 100 ? e139 : e144;
  };
  function calc(f, cls){
    const base = { size:f.size, cls, disp:f.disp, portIn:f.portIn, portMm:f.portMm, rotorDia:null,
      maxSpeed:f.maxSpeed, maxPres:f.maxPres, maxTorque:f.maxTorque };
    if (bar > f.maxPres) return { ...base, ok:false, reason:'pressure exceeds max' };
    const slip = slipOf(f, cls);
    const rpm = (flow + slip)/f.disp;
    if (!(rpm < f.maxSpeed)) return { ...base, ok:false, reason:'rpm exceeds max' };
    const np = npMult(f) * rpm / f.maxSpeed;                 // E111..114 (proportional to rpm)
    const rpmOk = (np < 15) && (rpm <= f.maxSpeed) && (rpm > 0);
    if (!rpmOk) return { ...base, ok:false, reason: np >= 15 ? 'NPSHr > 15 m' : 'rpm <= 0' };
    // torque uses STD-class rpm for every class (source E131 uses E133)
    const rpmStd = (flow + slipStd(f))/f.disp;
    const roll = (f.maxSpeed - rpmStd)/f.maxSpeed * f.rollTorque;
    const vp   = f.viscPowF * f.disp * rpmStd/f.maxSpeed * viscPow(f);
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
  return { env, ...res, recommended: rec ? rec.size : null };
}

// ------------------------------------------------------------
// 3) MP-CP — 3 rotor classes (A / B / C)
// ------------------------------------------------------------
const MPCP_SIZES = [
  {size:'10/0005',disp:0.046,portIn:1,portMm:25, p6:[0.0002,0.0067,0.1079,0.8952,4.2591,13.3], p3:[0.0027,0.15,4.1,7.5788], bMin:3,bMax:8,cMin:5,cMax:13, np1:0.05,portDia:22.2,maxTorque:39,maxSpeedAtMaxP:1000,maxPresAtMaxS:8.5,maxSpeed:1400,maxPres:12,p110:8.46,rotorDia:66,flowVar1:4,flowVarMax:10,rvVar0:3,rvVarMax:13, margin:1},
  {size:'10/0008',disp:0.083,portIn:1.5,portMm:38, p6:[0.0071,0.1776,1.7173,8.2,21.3,36.1], p3:[0.004,0.4,8.2,15.52], bMin:3,bMax:11,cMin:6,cMax:18, np1:0.08,portDia:35.1,maxTorque:39,maxSpeedAtMaxP:1000,maxPresAtMaxS:5.5,maxSpeed:1400,maxPres:8,p110:5.47,rotorDia:66,flowVar1:6,flowVarMax:12,rvVar0:3,rvVarMax:10, margin:1},
  {size:'10/0011',disp:0.111,portIn:1.5,portMm:38, p6:[-3.3773555013406624,-20.569468338220588,-41.00240221089235,-17.92996371938601,42.631622720483286,0], p3:[0.03,1.15,13.9,26.56], bMin:3,bMax:8,cMin:6,cMax:15, np1:0.11,portDia:35.1,maxTorque:39,maxSpeedAtMaxP:1000,maxPresAtMaxS:3.5,maxSpeed:1400,maxPres:5,p110:4.67,rotorDia:66,flowVar1:10,flowVarMax:17,rvVar0:4,rvVarMax:8, margin:1},
  {size:'20/0020',disp:0.202,portIn:1.5,portMm:38, p6:[0.005,0.35,1,5.1995,27.5,67.762], p3:[0.0001,0.35,11.7,39.9992], bMin:6,bMax:12,cMin:9,cMax:30, np1:0.2,portDia:35.1,maxTorque:102,maxSpeedAtMaxP:750,maxPresAtMaxS:8.5,maxSpeed:1000,maxPres:12,p110:3.11,rotorDia:88,flowVar1:12,flowVarMax:20,rvVar0:4,rvVarMax:18, margin:1},
  {size:'20/0031',disp:0.313,portIn:2,portMm:50, p6:[0.3,0.01,3.4,16.3,61.9418,125], p3:[0.015,1.1,20.1,61.8328], bMin:9,bMax:20,cMin:15,cMax:42, np1:0.31,portDia:47.6,maxTorque:102,maxSpeedAtMaxP:750,maxPresAtMaxS:5,maxSpeed:1000,maxPres:7,p110:2.26,rotorDia:88,flowVar1:15,flowVarMax:25,rvVar0:6,rvVarMax:13, margin:1},
  {size:'30/0069',disp:0.694,portIn:2,portMm:50, p6:[0.11,0.75,0.8,1.4,32.84,121], p3:[0.0001,0.57,25.8,76.6792], bMin:11,bMax:42,cMin:20,cMax:50, np1:0.69,portDia:47.6,maxTorque:448,maxSpeedAtMaxP:550,maxPresAtMaxS:8.5,maxSpeed:750,maxPres:12,p110:1.58,rotorDia:132,flowVar1:25,flowVarMax:40,rvVar0:6,rvVarMax:27, margin:1},
  {size:'30/0113',disp:1.125,portIn:3,portMm:76, p6:[-12.204677946364088,56.148211583445715,60.43884030949726,-36.37034065049568,-8.939238788135835,217.29191645020848], p3:[2.7,60,118.8,0], bMin:10,bMax:24,cMin:37,cMax:65, np1:1.13,portDia:72.3,maxTorque:448,maxSpeedAtMaxP:550,maxPresAtMaxS:5,maxSpeed:750,maxPres:7,p110:1.15,rotorDia:132,flowVar1:33,flowVarMax:60,rvVar0:10,rvVarMax:19, margin:1},
  {size:'40/0180',disp:1.8,portIn:3,portMm:76, p6:[0,0.8,1.3,0.25,48,207], p3:[1.6,51,133.2,0], bMin:15,bMax:70,cMin:30,cMax:110, np1:1.8,portDia:72.3,maxTorque:936,maxSpeedAtMaxP:520,maxPresAtMaxS:8.5,maxSpeed:700,maxPres:12,p110:3.6,rotorDia:178,flowVar1:32,flowVarMax:48,rvVar0:10,rvVarMax:41, margin:1},
  {size:'40/0250',disp:2.5,portIn:4,portMm:101, p6:[2.5,9.432825,3,0.25,125,380], p3:[0.03,3.8,84,202.8104], bMin:20,bMax:90,cMin:40,cMax:130, np1:2.5,portDia:97.5,maxTorque:936,maxSpeedAtMaxP:520,maxPresAtMaxS:5,maxSpeed:700,maxPres:7,p110:2.9,rotorDia:178,flowVar1:40,flowVarMax:58,rvVar0:12,rvVarMax:28, margin:1},
  {size:'50/0351',disp:3.514,portIn:4,portMm:101, p6:[28.84950972324557,123.36143391665482,117.31188037256503,-91.59092534522348,-31.730306215525133,397.2995004077452], p3:[2.35,82.6,257.2,0], bMin:30,bMax:90,cMin:0,cMax:0, np1:3.51,portDia:97.5,maxTorque:2078,maxSpeedAtMaxP:420,maxPresAtMaxS:8.5,maxSpeed:650,maxPres:12,p110:3.15,rotorDia:224,flowVar1:40,flowVarMax:65,rvVar0:0,rvVarMax:0, margin:1},
  {size:'50/0525',disp:5.25,portIn:6,portMm:152, p6:[2.9,13.5,3,0.25,260,734], p3:[0.5,11.8,152,367.6], bMin:50,bMax:180,cMin:0,cMax:0, np1:5.25,portDia:140,maxTorque:2078,maxSpeedAtMaxP:420,maxPresAtMaxS:5.5,maxSpeed:650,maxPres:8,p110:2.39,rotorDia:224,flowVar1:55,flowVarMax:100,rvVar0:0,rvVarMax:0, margin:1},
  {size:'50/0525/12',disp:5.25,portIn:6,portMm:152, p6:[2.9,13.5,3,0.25,322.6788,1000], p3:[0.8,16,210,547.2848], bMin:0,bMax:0,cMin:0,cMax:0, np1:5.25,portDia:140,maxTorque:2078,maxSpeedAtMaxP:150,maxPresAtMaxS:5.5,maxSpeed:650,maxPres:12,p110:2.39,rotorDia:224,flowVar1:65,flowVarMax:115,rvVar0:0,rvVarMax:0, margin:1},
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
  const slipA = f => {
    const [a6,a5,a4,a3,a2,a1] = f.p6, [b3,b2,b1,c0] = f.p3;
    const s = barISF < 2
      ? (-(a6*barISF**6) + a5*barISF**5 - a4*barISF**4 + a3*barISF**3 - a2*barISF**2 + a1*barISF) * f.margin * vm
      : ((b3*barISF**3 - b2*barISF**2 + b1*barISF) + c0) * f.margin * vm;
    return rv ? s + rvFlowVar(f) : s;
  };
  const slipB = f => slipA(f) + (((f.bMax - f.bMin) * barISF / f.maxPres) + f.bMin) * vm;
  const slipC = f => slipA(f) + (((f.cMax - f.cMin) * barISF / f.maxPres) + f.cMin) * vm;
  const npA = (f, rpm) => ((f.np1/(f.portDia*f.portDia)) * (rpm+300)**2 * (cP**0.8 * (f.portDia**-1.2*0.0047) + 0.01)) + 1.3;
  const corner = f => bar < f.maxPresAtMaxS ? f.maxSpeed : f.maxSpeed - (f.maxSpeed - f.maxSpeedAtMaxP)*(bar - f.maxPresAtMaxS)/(f.maxPres - f.maxPresAtMaxS);
  const powerKw = (f, rpm) => ((1.9*bar + f.p110) * rpm * f.disp/1000) + ((Math.pow(Math.log10(cP), 3) * 0.37) * rpm * f.disp/1000);
  const flowVar = f => bar > f.maxPres ? NaN : (((f.flowVarMax - f.flowVar1) * bar / f.maxPres) + f.flowVar1) * vm;
  const tqAt = f => powerKw(f, 1) * 9550;                    // torque = power*9550/rpm (rpm cancels)

  function calc(f, cls){
    const base = { size:f.size, cls, disp:f.disp, portIn:f.portIn, portMm:f.portMm, rotorDia:f.rotorDia,
      maxSpeed:f.maxSpeed, maxPres:f.maxPres, maxTorque:f.maxTorque };
    if (bar > f.maxPres) return { ...base, ok:false, reason:'pressure exceeds max' };
    const slip = cls === 'a' ? slipA(f) : cls === 'b' ? slipB(f) : slipC(f);
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
  a.forEach((s,i)=>{ if(s.ok) s.tip = Math.PI*MPCP_SIZES[i].rotorDia/1000*s.rpm/60; });
  b.forEach((s,i)=>{ if(s.ok && a[i].ok) s.tip = Math.PI*MPCP_SIZES[i].rotorDia/1000*a[i].rpm/60; });
  c.forEach((s,i)=>{ if(s.ok && a[i].ok) s.tip = Math.PI*MPCP_SIZES[i].rotorDia/1000*a[i].rpm/60; });
  const rec = a.find(r => r.ok);
  return { env, std:a, b, c, recommended: rec ? rec.size : null };
}

// ------------------------------------------------------------
// 4) STERILOBE — 2 rotor forms (BiWing / Multilobe)
//     slip polynomials are per-size (source has differing
//     thresholds/orders; some columns double-apply margin*vm)
// ------------------------------------------------------------
const STERILOBE_SIZES = [
  {size:'SLAS',disp:0.0375,portIn:'3/4',portMm:19, margin:1.03, np:[0.0045,1.55,0.973,0.15647254434413738,-1e-12,6.2e-07,0.00026,7e-11,-7e-07,0.006,1.8], maxTorque:26,maxSpeed:1400,maxPres:15,pc:[1.28e-06,0.00185245,0.122,0.6276,2.06], portDia:16,rotorDia:68,flowVar1:4,flowVarMax:8,rv0:3,rvMax:13,bw:{thr:5,lo:{6:0.0002,5:0.0,4:-0.015,3:0.2,2:-1.7,1:10.0},hi:{3:0.0027,2:-0.13,1:4.2,0:8.1625},loD:false},ml:{thr:5,lo:{6:0.0002,5:0.0,4:-0.015,3:0.2,2:-1.7,1:10.7},hi:{3:0.0027,2:-0.13,1:4.85,0:8.4125},loD:false}},
  {size:'SLAL',disp:0.055833333,portIn:1,portMm:25, margin:1.03, np:[0.0013,1.62,0.98,0.1259705077915137,-1e-12,6.2e-07,5.2e-05,7e-11,-7e-07,0.006,1.8], maxTorque:26,maxSpeed:1400,maxPres:10,pc:[1.28e-06,0.00185245,0.1466,0.871,2.1], portDia:22.2,rotorDia:68,flowVar1:4,flowVarMax:9,rv0:3,rvMax:10,bw:{thr:5,lo:{6:-0.00025,5:0.0018,4:-0.005,3:0.2,2:-1.98,1:10.8},hi:{5:2e-06,4:-0.0088,3:0.2407,2:-2.5529,1:15.77,0:-11.5275},loD:false},ml:{thr:3,lo:{6:-1e-06,5:0.045,4:-0.15,3:0.4,2:-3.6,1:16.6},hi:{5:2e-06,4:-0.0088,3:0.2407,2:-2.5529,1:16.1,0:-4.12621499999999},loD:false}},
  {size:'SLBS',disp:0.07785714285714286,portIn:1,portMm:25, margin:1.03, np:[0.00093,1.8,0.98,0.14296143549316986,-1e-12,6.2e-07,0.0002,7e-11,-7e-07,0.006,1.66], maxTorque:76,maxSpeed:1200,maxPres:15,pc:[8.8e-06,0.00672,0.047,1.267,4.65], portDia:22.2,rotorDia:84,flowVar1:5,flowVarMax:10,rv0:4,rvMax:18,bw:{thr:3,lo:{6:-0.006,5:0.04,4:-0.08,3:0.55,2:-3.8,1:15.822757000000001},hi:{3:0.001,2:-0.15,1:6.7,0:8.207271000000002},loD:false},ml:{thr:3,lo:{6:-0.006,5:0.03,4:-0.08,3:0.55,2:-3.7,1:17.5105},hi:{3:0.0025,2:-0.16,1:7.23,0:10.2},loD:false}},
  {size:'SLBL',disp:0.11530612244897959,portIn:1.5,portMm:38, margin:1.03, np:[0.00428703,0.85,0.58,0.174,-1e-09,2.8e-06,0.00055,4e-12,-1e-07,0.0012,2.04], maxTorque:76,maxSpeed:1200,maxPres:10,pc:[8.8e-06,0.00672,0.104,1.675,4.7], portDia:35,rotorDia:84,flowVar1:6,flowVarMax:12,rv0:4,rvMax:14,bw:{thr:3,lo:{6:0.0009,5:0.04,4:-0.16,3:0.55,2:-4.6,1:22.5},hi:{3:-0.011,2:-0.01,1:7.65,0:15.803100000000015},loD:false},ml:{thr:3,lo:{6:0.0009,5:0.03,4:-0.16,3:0.55,2:-4.6,1:25.25},hi:{3:-0.015,2:-0.013,1:9.4,0:16.5081},loD:false}},
  {size:'SLCS',disp:0.16375,portIn:1.5,portMm:38, margin:1.03, np:[0.0017,1.2,0.6775,0.153,-1e-09,3.3e-06,1e-07,7e-11,-7e-07,0.006,6.5], maxTorque:133,maxSpeed:1200,maxPres:15,pc:[1.28e-06,0.00185245,0.41317,2.865,4.07], portDia:35,rotorDia:106,flowVar1:7,flowVarMax:15,rv0:6,rvMax:27,bw:{thr:3,lo:{6:-0.006,5:0.04,4:-0.08,3:0.55,2:-6.0,1:30.29},hi:{3:0.001,2:-0.15,1:9.47,0:23.499000000000002},loD:false},ml:{thr:3,lo:{6:-0.006,5:0.04,4:-0.08,3:0.55,2:-6.0,1:30.8},hi:{3:0.001,2:-0.15,1:10.246333333333338,0:22.7},loD:false}},
  {size:'SLCL',disp:0.24125,portIn:2,portMm:50, margin:1.03, np:[0.0017,1.3,0.7266367098706477,0.153,-1e-09,3.3e-06,1e-07,7e-11,-7e-07,0.006,6], maxTorque:133,maxSpeed:1200,maxPres:10,pc:[1.28e-06,0.00185245,0.516460328468769,4.286,4.15], portDia:47.6,rotorDia:106,flowVar1:8,flowVarMax:18,rv0:6,rvMax:20,bw:{thr:3,lo:{6:0.005,5:0.06,4:-0.6,3:1.8,2:-7.5,1:39.7},hi:{3:-0.015,2:-0.09,1:12.4,0:33.84},loD:false},ml:{thr:3,lo:{6:-0.0007,5:0.02,4:-0.25,3:2.5,2:-14.1,1:49.4},hi:{3:-0.02,2:-0.01,1:12.58,0:35.7897},loD:false}},
  {size:'SLDS',disp:0.335,portIn:1.5,portMm:38, margin:1.03, np:[0.0017,1.45,0.8007833129186743,0.153,-1e-09,3.3e-06,1e-07,7e-11,-7e-07,0.006,4.3], maxTorque:615,maxSpeed:1000,maxPres:15,pc:[1.28e-06,0.00185245,0.78,5.63,5.3], portDia:35,rotorDia:142,flowVar1:9,flowVarMax:20,rv0:10,rvMax:41,bw:{thr:5,lo:{6:-0.0046,5:0.15,4:-1.7,3:9.3,2:-27.3,1:55.0},hi:{3:0.001,2:-0.15,1:12.8,0:29.0},loD:false},ml:{thr:5,lo:{6:-0.003,5:0.15,4:-1.82,3:9.65,2:-26.3,1:55.0},hi:{3:0.001,2:-0.28,1:17.45,0:27.749999999999993},loD:false}},
  {size:'SLDL',disp:0.5116666666666667,portIn:2,portMm:50, margin:1.03, np:[0.004287030000000004,0.9,0.58,0.18,-1e-09,4.9e-06,0.00055,4e-12,1e-07,0.0012,2.04], maxTorque:615,maxSpeed:1000,maxPres:10,pc:[1.28e-06,0.00232,0.92,9.21,3], portDia:47.6,rotorDia:142,flowVar1:11,flowVarMax:24,rv0:10,rvMax:31,bw:{thr:5,lo:{6:-0.0001,5:0.0103,4:-0.2403,3:2.5779,2:-14.6,1:58.7},hi:{3:-0.011,2:-0.03,1:16.7,0:49.8},loD:false},ml:{thr:5,lo:{6:-0.0001,5:0.0103,4:-0.2403,3:2.5779,2:-14.6,1:60.7},hi:{3:-0.011,2:-0.03,1:17.7,0:54.8},loD:false}},
  {size:'SLES',disp:0.71,portIn:2,portMm:50, margin:1.03, np:[0.0017,1.2,0.5980266901690274,0.18,-1e-09,5.5e-06,1e-07,7e-11,-7e-07,0.006,4.3], maxTorque:1060,maxSpeed:800,maxPres:15,pc:[3.4e-06,0.00185245,0.99193,10.97,15.61], portDia:47.6,rotorDia:176,flowVar1:16,flowVarMax:35,rv0:12,rvMax:47,bw:{thr:5,lo:{6:-0.0002,5:0.01,4:-0.22,3:2.65,2:-16.4,1:66.0},hi:{2:-0.19,1:20.5,0:44.125},loD:false},ml:{thr:5,lo:{6:-0.0002,5:0.0115,4:-0.2366,3:2.4778,2:-14.2,1:63.502},hi:{2:-0.1733,1:20.7,0:58.0},loD:false}},
  {size:'SLEL',disp:1.0633333333333332,portIn:3,portMm:76, margin:1.03, np:[0.0012,1.35,0.7035862357142781,0.16,-1e-09,5.8e-06,6e-08,5e-12,-7e-08,0.006,28], maxTorque:1060,maxSpeed:800,maxPres:10,pc:[3.4e-06,0.00185245,1.184,16.26,19.4], portDia:72.3,rotorDia:176,flowVar1:19,flowVarMax:42,rv0:12,rvMax:36,bw:{thr:5,lo:{6:-0.0039,5:0.116,4:-1.3748,3:8.5,2:-31.0,1:91.2},hi:{2:-0.45,1:25.6,0:69.06249999999999},loD:false},ml:{thr:5,lo:{6:-0.0039,5:0.116,4:-1.3748,3:8.5,2:-30.2,1:88.0},hi:{2:-0.45,1:28.0,0:61.0625},loD:false}},
  {size:'SLFS',disp:1.478,portIn:3,portMm:76, margin:1.03, np:[0.0008,1.6,0.8040985551020325,0.16,-3e-11,1e-05,4e-05,1e-11,-7e-08,0.014,40], maxTorque:1200,maxSpeed:600,maxPres:15,pc:[8.4e-06,0.00185245,1.757,17.9,25], portDia:72.3,rotorDia:205,flowVar1:22,flowVarMax:48,rv0:15,rvMax:61,bw:{thr:3,lo:{6:-0.002,5:0.105,4:-0.2,3:0.3,2:-13.5,1:92.0},hi:{2:-0.45,1:32.7,0:76.40700000000002},loD:false},ml:null},
  {size:'SLFL',disp:2.24,portIn:4,portMm:101, margin:1.03, np:[0.002,1.85,1.0758552935120336,0.14,-3e-11,8e-06,0.0001,5e-11,-7e-07,0.01,50], maxTorque:1200,maxSpeed:600,maxPres:10,pc:[8.4e-06,0.00185245,2.043,26.4,32], portDia:97.6,rotorDia:205,flowVar1:24,flowVarMax:55,rv0:15,rvMax:46,bw:{thr:3,lo:{6:0.0002,5:0.28,4:-2.1,3:11.4,2:-52.0,1:170.0},hi:{4:-0.02,3:0.6,2:-7.5,1:73.0},loD:true},ml:null},
  {size:'SLGS',disp:3.0416666666666665,portIn:4,portMm:101, margin:1.03, np:[0.002,1.6,0.9446534284495905,0.14,-3e-11,8e-06,0.0001,3e-11,-1e-08,0.01,60], maxTorque:2050,maxSpeed:600,maxPres:15,pc:[8.4e-06,0.00185245,3.3,56.9,58.5], portDia:97.6,rotorDia:240,flowVar1:26,flowVarMax:60,rv0:0,rvMax:0,bw:{thr:3,lo:{6:0.0002,5:0.28,4:-2.1,3:11.4,2:-66.5,1:282.5},hi:{2:-1.7,1:83.0,0:221.18580000000003},loD:false},ml:null},
  {size:'SLGL',disp:4.566666666666666,portIn:6,portMm:152, margin:1.03, np:[0.002,1.4,1.0758552935120336,0.08620416566974516,-3e-11,6.7e-06,5e-05,2e-11,-7e-08,0.03,30], maxTorque:2050,maxSpeed:600,maxPres:10,pc:[8.4e-06,0.00185245,3.95,80.9,77], portDia:148,rotorDia:240,flowVar1:30,flowVarMax:80,rv0:0,rvMax:0,bw:{thr:3,lo:{6:-0.0006,5:0.029,4:-0.5714,3:9.0,2:-80.0,1:382.0},hi:{2:-4.8,1:130.4,0:281.3261999999999},loD:false},ml:null},
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
  const slipForm = (f, form) => {
    const cfg = f[form];
    const x = barISF;
    const lo = x < cfg.thr;
    const base = evalPoly(lo ? cfg.lo : cfg.hi, x) * f.margin * vm;
    const slip = lo && cfg.loD ? base * f.margin * vm : base;   // source quirk: lo branch x2
    return rv ? slip + rvFlowVar(f) : slip;
  };
  const npshBase = f => cP < 100 ? f.np[0]*cP + f.np[1] : f.np[2]*cP**f.np[3];
  const npshAt = (f, rpm) => f.np[4]*rpm**3 + f.np[5]*rpm**2 + f.np[6]*rpm + npshBase(f);
  const npshFac = f => (f.np[7]*cP**3 + f.np[8]*cP**2 + f.np[9]*cP + f.np[10]) / f.np[10];
  const npshr = (f, rpm) => (npshAt(f, rpm) - npshBase(f)) * npshFac(f) + npshBase(f);
  const vmP = cP >= 100 ? ((((1.0132*cP)**0.1358) - 0.946412588077472)/0.62)
            : cP >= 10  ? ((5e-10*cP**3 + 6.1e-6*cP**2 + 0.002057*cP + 0.658678653)/0.62)
            : cP >= 1   ? ((((0.00981*L(cP))+1)*2.65 - 2.03)/0.62) : 1;
  function calc(f, form){
    const base = { size:f.size, form, disp:f.disp, portIn:f.portIn, portMm:f.portMm, rotorDia:f.rotorDia,
      maxSpeed:f.maxSpeed, maxPres:f.maxPres, maxTorque:f.maxTorque };
    if (form === 'm' && !f.ml) return { ...base, ok:false, reason:'rotor form not offered' };
    if (bar > f.maxPres) return { ...base, ok:false, reason:'pressure exceeds max' };
    // source quirk: multilobe validity checks BiWing slip, result uses Multilobe slip
    const chk = slipForm(f, 'b');
    const rpmChk = (flow + chk)/f.disp;
    const slip = slipForm(f, form);
    const rpm = (flow + slip)/f.disp;
    if (!(rpmChk < f.maxSpeed)) return { ...base, ok:false, reason:'rpm exceeds max' };
    const np = npshr(f, rpm);
    const rpmOk = np < 15 && rpm > 0;
    if (!rpmOk) return { ...base, ok:false, reason: np >= 15 ? 'NPSHr > 15 m' : 'rpm <= 0' };
    const tq = ((f.pc[0]*rpm**2 + f.pc[1]*rpm) * f.pc[2] * 9550/rpm) * vmP + ((f.maxSpeed - rpm)/f.maxSpeed * f.pc[4]) + ((bar - 1) * f.pc[3]);
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
  return { env, biwing, multilobe, recommended: rec ? rec.size : null };
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
  const slipF = f => {
    const [a6,a5,a4,a3,a2,a1] = f.p6, [b2,b1,c0] = f.p2;
    const s = bar < 2
      ? ((a6*bar**6 + a5*bar**5 - a4*bar**4 + a3*bar**3 - a2*bar**2 + a1*bar) * f.margin * vm)
      : ((((b2*bar*bar + b1*bar) + c0)) * f.margin * vm);
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
    const slip = slipF(f);
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
  return { env, std, recommended: rec ? rec.size : null };
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
  const slipF = f => {
    const [a5,a4,a3,a2,a1] = f.p5;
    // source quirk: margin multiplies only the linear term, and there is no whole-expression margin
    return ((a5*barISF**5 - a4*barISF**4 + a3*barISF**3 - a2*barISF**2 + a1*barISF) * f.margin) * vm;
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
    const slip = slipF(f);
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
  return { env, std, recommended: rec ? rec.size : null };
}

// ------------------------------------------------------------
// registry + dispatcher
// ------------------------------------------------------------
const ENGINES = {
  'Revolution RLP':  { calc: rlpCalc,       classes: [{key:'std',label:'Standard / 70°C'},{key:'hot',label:'Hot / 150°C'}] },
  'Revolution CPP':  { calc: cppCalc,       classes: [{key:'std',label:'Std / 93°C'},{key:'ff',label:'FF / 105°C'},{key:'hot',label:'Hot / 150°C'},{key:'choc',label:'Choc / refer WFT'}] },
  'MP-CP':           { calc: mpcpCalc,      classes: [{key:'a',label:'Class A / 70°C'},{key:'b',label:'Class B / 100°C'},{key:'c',label:'Class C / 150°C'}] },
  'Sterilobe':       { calc: sterilobeCalc, classes: [{key:'b',label:'BiWing / 150°C'},{key:'m',label:'Multilobe / 150°C'}], rowKeys:{b:'biwing',m:'multilobe'} },
  'RTP':             { calc: rtpCalc,       classes: [{key:'std',label:'Standard'}] },
  'Acculobe':        { calc: acculobeCalc,  classes: [{key:'std',label:'Standard'}] },
};

function calcSeries(seriesKey, inputs){
  const eng = ENGINES[seriesKey];
  if (!eng) return null;
  const r = eng.calc(inputs);
  const rows = {};
  for (const c of eng.classes) rows[c.key] = r[c.key] || r[eng.rowKeys && eng.rowKeys[c.key]] || [];
  return { env: r.env, rows, recommended: r.recommended, classes: eng.classes };
}

if (typeof module !== 'undefined') module.exports = { ...module.exports, calcSeries, ENGINES, CPP_SIZES, MPCP_SIZES, STERILOBE_SIZES, RTP_SIZES, ACCULOBE_SIZES };
if (typeof window !== 'undefined') window.RLPEngine = { ...window.RLPEngine, calcSeries, ENGINES };
