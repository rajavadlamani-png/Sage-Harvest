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
/* Accessible interactive SVG modules for the Sage Harvest site.
   This enhancement is independent of the Puja voice guide. */
document.addEventListener('DOMContentLoaded',()=>{
  const stages={
    field:{n:'01',title:'Field intelligence',text:'Combine production history, geography, weather and satellite-derived signals to understand field-level variation and emerging risk.'},
    planning:{n:'02',title:'Planning & forecasting',text:'Translate field signals and historical performance into practical production plans, scenarios and early-warning indicators.'},
    processing:{n:'03',title:'Processing & quality',text:'Connect harvest, processing capacity, quality controls and traceability so that operational decisions reflect the full system.'},
    inventory:{n:'04',title:'Inventory & resilience',text:'Balance availability, storage, ageing, service levels and working capital with a clearer view of supply and demand.'},
    market:{n:'05',title:'Market outcomes',text:'Close the loop with service, sell-through and performance feedback—then use those signals to improve the next planning cycle.'}
  };
  document.querySelectorAll('[data-flow-experience]').forEach(panel=>{
    const detail=panel.querySelector('[data-flow-detail]');
    const controls=[...panel.querySelectorAll('[data-flow-step]')];
    const nodes=[...panel.querySelectorAll('[data-flow-node]')];
    function select(key){
      const stage=stages[key];if(!stage||!detail)return;
      controls.forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.flowStep===key)));
      nodes.forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.flowNode===key)));
      detail.innerHTML='<span class="flow-index">STAGE '+stage.n+'</span><div><h3>'+stage.title+'</h3><p>'+stage.text+'</p></div>';
    }
    controls.forEach(el=>el.addEventListener('click',()=>select(el.dataset.flowStep)));
    nodes.forEach(el=>{
      el.addEventListener('click',()=>select(el.dataset.flowNode));
      el.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();select(el.dataset.flowNode);}});
    });
    select('field');
  });
});
