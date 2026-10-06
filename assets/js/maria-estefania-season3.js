(function(){
  const audio=document.getElementById("s3-bg-audio");
  const status=document.querySelector(".s3-audio-status");
  const gate=document.querySelector(".s3-audio-gate");
  const gateButton=gate?gate.querySelector("button"):null;
  if(!audio)return;

  audio.loop=true;
  audio.volume=0.42;

  function sync(){
    if(status){
      status.dataset.muted=String(audio.muted);
      status.textContent=audio.muted?"AUDIO: MUTED":"AUDIO: LOOP ON";
    }
  }

  function play(){
    const p=audio.play();
    if(p&&typeof p.then==="function"){
      p.then(function(){if(gate)gate.classList.remove("show");sync();})
       .catch(function(){if(gate)gate.classList.add("show");});
    }
  }

  window.addEventListener("pageshow",play);
  document.addEventListener("DOMContentLoaded",play);

  if(gateButton)gateButton.addEventListener("click",function(){
    audio.muted=false;
    play();
  });

  if(status)status.addEventListener("click",function(){
    audio.muted=!audio.muted;
    if(audio.paused)play();
    sync();
  });

  ["pointerdown","touchstart","keydown"].forEach(function(evt){
    document.addEventListener(evt,function(){if(audio.paused)play();},{once:true});
  });

  sync();
})();