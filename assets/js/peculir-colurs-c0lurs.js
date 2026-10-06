(function(){
  const root=document.documentElement;
  let ticking=false;
  function updateDarkness(){
    const distance=Math.max(window.innerHeight*1.15,1);
    const progress=Math.max(0,Math.min(1,window.scrollY/distance));
    root.style.setProperty("--pec-dark",progress.toFixed(3));
    ticking=false;
  }
  window.addEventListener("scroll",function(){
    if(!ticking){ticking=true;window.requestAnimationFrame(updateDarkness);}
  },{passive:true});
  window.addEventListener("resize",updateDarkness);
  updateDarkness();
})();