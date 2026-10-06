(function(){
  const dialog=document.querySelector(".selverria-lightbox");
  const dialogImg=dialog?.querySelector("img");
  const dialogText=dialog?.querySelector("[data-lightbox-caption]");
  const close=dialog?.querySelector(".selverria-lightbox-close");

  document.querySelectorAll(".selverria-leak").forEach(function(figure){
    figure.addEventListener("click",function(){
      const img=figure.querySelector("img");
      const caption=figure.querySelector("figcaption");
      if(!dialog||!img)return;
      dialogImg.src=img.src;
      dialogImg.alt=img.alt;
      if(dialogText)dialogText.textContent=caption?caption.textContent:"Leak";
      dialog.showModal();
    });
  });

  close?.addEventListener("click",function(){dialog.close();});
  dialog?.addEventListener("click",function(event){
    if(event.target===dialog)dialog.close();
  });
})();