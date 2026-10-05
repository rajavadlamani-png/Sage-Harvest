const toggle=document.querySelector('.nav-toggle');const nav=document.querySelector('.nav');if(toggle&&nav){toggle.addEventListener('click',()=>nav.classList.toggle('open'));}

document.addEventListener('DOMContentLoaded',()=>{
  const section=document.querySelector('.media-section, .youtube-section');
  if(!section)return;
  const feed=document.createElement('div');
  feed.className='dynamic-media-feed section';
  feed.innerHTML='<div class="dynamic-feed-head"><p class="eyebrow">LATEST FROM SUPPLY CHAIN WITH RAJA</p><h2>Recent <em>videos.</em></h2></div><div class="dynamic-feed-grid" data-youtube-feed><div class="feed-fallback">Loading recent videos…</div></div>';
  section.insertAdjacentElement('afterend',feed);
  const script=document.createElement('script');
  script.src='assets/js/media-feed.js';
  script.defer=true;
  document.body.appendChild(script);
});