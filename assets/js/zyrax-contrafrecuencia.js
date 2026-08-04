(()=>{"use strict";
const body=document.body,bg=document.getElementById("zyraxBackgroundMusic"),toggle=document.getElementById("zyraxAudioToggle"),gate=document.getElementById("zyraxAutoplayGate"),gateButton=document.getElementById("zyraxAutoplayButton"),timeLabel=document.getElementById("zyraxTime"),statusLabel=document.getElementById("zyraxEffectStatus"),metricLabel=document.getElementById("zyraxMetric");
if(!bg||!toggle||!gate||!gateButton)return;
body.classList.add("zyrax-experience-ready");bg.volume=.62;const MUSIC=Object.freeze({bpm:170,beatsPerBar:4,beat:60/170,eighth:(60/170)/2,sixteenth:(60/170)/4,bar:(60/170)*4,key:"Fa menor"});
const T=Object.freeze({colorStart:11.30,disorderStart:34.35,disorderEnd:35.30,riseStart:50.15,riseEnd:51.10,darkStart:80.50,presageStart:83.32,restoreStart:104.37,restoreEnd:106.30,normalizeStart:151,colorEnd:160});
const effectClasses=["zyrax-color-cycle","zyrax-color-fade","zyrax-disorder","zyrax-rise-glitch","zyrax-darkening","zyrax-presage","zyrax-restoring"];
let raf=0,manualPaused=false,interruptedByForeground=false,corruptionTimer=0,corruptionActive=false,lastBeat=-1,beatPulseTimer=0;
const corruptionTargets=[...document.querySelectorAll("h1,h2,h3,.eyebrow,.badge,.nav a,.facts dt,.facts dd,.chip,.quote,.audio-meta,figcaption")].filter(el=>el&&!el.querySelector("img,svg,audio,video,input"));
const originals=new Map(corruptionTargets.map(el=>[el,el.textContent]));
const zyraxNames=["ZYRAX.Z","ZYRA_X","Z.YRAX","PRESAGIO.Z","ERROR_08","1PRESAGIO","ZYR∆X.?","NO_CERRAR","CONTRAFRECUENCIA"],alphabet="ZYRAXPRESAGIO01234∆.?_";
function corruptText(text){if(text.toUpperCase().includes("ZYRAX"))return zyraxNames[Math.floor(Math.random()*zyraxNames.length)];return[...text].map(char=>{if(/\s/.test(char))return char;if(/[.,:;!¡?¿()\-—/]/.test(char)&&Math.random()>.32)return char;return alphabet[Math.floor(Math.random()*alphabet.length)]}).join("")}
function startCorruption(){if(corruptionActive)return;corruptionActive=true;corruptionTimer=setInterval(()=>{originals.forEach((text,element)=>{element.textContent=corruptText(text)})},68)}
function stopCorruption(){if(!corruptionActive)return;corruptionActive=false;clearInterval(corruptionTimer);corruptionTimer=0;originals.forEach((text,element)=>{element.textContent=text})}
function syncBeatPulse(t){const beatIndex=Math.floor((t+.0001)/MUSIC.beat);if(beatIndex===lastBeat)return;lastBeat=beatIndex;body.classList.remove("zyrax-beat-pulse");void body.offsetWidth;body.classList.add("zyrax-beat-pulse");clearTimeout(beatPulseTimer);beatPulseTimer=setTimeout(()=>body.classList.remove("zyrax-beat-pulse"),MUSIC.sixteenth*1000);if(metricLabel){const bar=Math.floor(beatIndex/MUSIC.beatsPerBar)+1;const beat=(beatIndex%MUSIC.beatsPerBar)+1;metricLabel.textContent=`170 BPM · 4/4 · FA MENOR · COMPÁS ${bar} · ${beat}/4`;}}function formatTime(seconds){const safe=Number.isFinite(seconds)?Math.max(0,seconds):0,minutes=Math.floor(safe/60),secs=Math.floor(safe%60);return`${minutes}:${String(secs).padStart(2,"0")} / 2:45`}
function setClass(name,enabled){body.classList.toggle(name,Boolean(enabled))}
function resetEffects(){effectClasses.forEach(name=>body.classList.remove(name));body.classList.remove("zyrax-beat-pulse");lastBeat=-1;clearTimeout(beatPulseTimer);stopCorruption();if(statusLabel)statusLabel.textContent="SEÑAL ESTABLE"}
function syncEffects(){const t=bg.currentTime||0;syncBeatPulse(t);if(timeLabel)timeLabel.textContent=formatTime(t);
const color=t>=T.colorStart&&t<T.colorEnd,colorFade=t>=T.normalizeStart&&t<T.colorEnd,disorder=t>=T.disorderStart&&t<T.disorderEnd,rise=t>=T.riseStart&&t<T.riseEnd,darkening=t>=T.darkStart&&t<T.presageStart,presage=t>=T.presageStart&&t<T.restoreStart,restoring=t>=T.restoreStart&&t<T.restoreEnd;
setClass("zyrax-color-cycle",color);setClass("zyrax-color-fade",colorFade);setClass("zyrax-disorder",disorder);setClass("zyrax-rise-glitch",rise);setClass("zyrax-darkening",darkening);setClass("zyrax-presage",presage);setClass("zyrax-restoring",restoring);
if(rise)startCorruption();else stopCorruption();
if(statusLabel){if(rise)statusLabel.textContent="NOMBRE CORRUPTO";else if(disorder)statusLabel.textContent="INTERFAZ DESACOMODADA";else if(darkening)statusLabel.textContent="PRESAGIO ENTRANTE";else if(presage)statusLabel.textContent="FRÍO // CÁLIDO";else if(restoring)statusLabel.textContent="RESTAURANDO REALIDAD";else if(colorFade)statusLabel.textContent="CONTRAFRECUENCIA DISMINUYENDO";else if(color)statusLabel.textContent="COLOR DE SEÑAL ALTERADO";else statusLabel.textContent="SEÑAL ESTABLE"}}
function animationLoop(){syncEffects();if(!bg.paused&&!bg.ended)raf=requestAnimationFrame(animationLoop)}
function startLoop(){cancelAnimationFrame(raf);raf=requestAnimationFrame(animationLoop)}
function updateToggle(){toggle.textContent=bg.paused?"▶ Contrafrecuencia":"⏸ Contrafrecuencia";toggle.setAttribute("aria-pressed",String(!bg.paused))}
async function playBackground({userInitiated=false}={}){if(userInitiated)manualPaused=false;try{await bg.play();gate.hidden=true;updateToggle();startLoop()}catch{gate.hidden=false;updateToggle()}}
function pauseBackgroundManually(){manualPaused=true;bg.pause();updateToggle();cancelAnimationFrame(raf);syncEffects()}
toggle.addEventListener("click",()=>{bg.paused?playBackground({userInitiated:true}):pauseBackgroundManually()});
gateButton.addEventListener("click",()=>playBackground({userInitiated:true}));
bg.addEventListener("play",()=>{gate.hidden=true;updateToggle();startLoop()});
bg.addEventListener("pause",()=>{updateToggle();cancelAnimationFrame(raf);syncEffects()});
bg.addEventListener("seeked",syncEffects);bg.addEventListener("timeupdate",syncEffects);bg.addEventListener("loadedmetadata",syncEffects);
bg.addEventListener("ended",()=>{cancelAnimationFrame(raf);resetEffects();updateToggle();if(timeLabel)timeLabel.textContent="2:45 / 2:45"});
const foregroundMedia=[...document.querySelectorAll("audio,video")].filter(media=>media!==bg);
function anyForegroundPlaying(){return foregroundMedia.some(media=>!media.paused&&!media.ended)}
foregroundMedia.forEach(media=>{media.addEventListener("play",()=>{foregroundMedia.forEach(other=>{if(other!==media&&!other.paused)other.pause()});if(!bg.paused&&!bg.ended){interruptedByForeground=true;bg.pause()}});
const resumeBackground=()=>setTimeout(()=>{if(interruptedByForeground&&!manualPaused&&!bg.ended&&!anyForegroundPlaying()){interruptedByForeground=false;playBackground()}},40);
media.addEventListener("pause",resumeBackground);media.addEventListener("ended",resumeBackground)});
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&!bg.paused)startLoop()});
syncEffects();updateToggle();playBackground();
})();
