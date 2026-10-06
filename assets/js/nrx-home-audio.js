(function(){
  const audio=document.getElementById("nrx-home-audio");
  const unlock=document.getElementById("nrx-audio-unlock");
  if(!audio)return;

  audio.loop=true;
  audio.volume=0.62;

  let started=false;

  async function startAudio(){
    if(started && !audio.paused)return true;
    try{
      await audio.play();
      started=true;
      if(unlock)unlock.classList.remove("show");
      return true;
    }catch(err){
      if(unlock)unlock.classList.add("show");
      return false;
    }
  }

  window.addEventListener("load",startAudio,{once:true});

  ["pointerdown","touchstart","keydown"].forEach(function(evt){
    document.addEventListener(evt,function(){
      startAudio();
    },{once:true,capture:true});
  });

  if(unlock){
    unlock.addEventListener("click",function(){
      startAudio();
    });
  }

  document.addEventListener("visibilitychange",function(){
    if(!document.hidden && audio.paused){
      startAudio();
    }
  });
})();