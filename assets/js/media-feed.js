const CHANNEL_URL='https://www.youtube.com/@rajavadlamani';

async function loadYouTubeFeed(){
  const container=document.querySelector('[data-youtube-feed]');
  if(!container)return;
  try{
    const response=await fetch('data/youtube.json',{cache:'no-store'});
    if(!response.ok)throw new Error('Feed unavailable');
    const items=await response.json();
    if(!Array.isArray(items)||!items.length)throw new Error('No videos found');
    container.innerHTML=items.slice(0,4).map(item=>`<article class="feed-card"><span class="category">SUPPLY CHAIN WITH RAJA</span><h3>${escapeHtml(item.title||'Supply Chain With Raja')}</h3><p>${escapeHtml(item.published||'')}</p><a href="${safeUrl(item.url)}" target="_blank" rel="noopener">Watch video →</a></article>`).join('');
  }catch(error){
    container.innerHTML='<div class="feed-fallback"><p>New videos will appear here as the media library develops.</p><a href="'+CHANNEL_URL+'" target="_blank" rel="noopener">Visit Supply Chain With Raja on YouTube →</a></div>';
  }
}
function escapeHtml(value){return String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));}
function safeUrl(value){try{const url=new URL(value);return url.protocol==='https:'&&url.hostname==='www.youtube.com'?url.href:CHANNEL_URL;}catch{return CHANNEL_URL;}}
document.addEventListener('DOMContentLoaded',loadYouTubeFeed);