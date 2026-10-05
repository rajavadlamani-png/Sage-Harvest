const CHANNEL_URL='https://www.youtube.com/@rajavadlamani';
const RSS_URL='https://www.youtube.com/feeds/videos.xml?channel_id=UC0Q6j9k5m7w4nq8r3s2t1uA';

async function loadYouTubeFeed(){
  const container=document.querySelector('[data-youtube-feed]');
  if(!container)return;
  try{
    const response=await fetch(RSS_URL,{cache:'no-store'});
    if(!response.ok)throw new Error('Feed unavailable');
    const xml=await response.text();
    const doc=new DOMParser().parseFromString(xml,'application/xml');
    const entries=[...doc.querySelectorAll('entry')].slice(0,4);
    if(!entries.length)throw new Error('No videos found');
    container.innerHTML=entries.map(entry=>{
      const title=entry.querySelector('title')?.textContent||'Supply Chain With Raja';
      const videoId=entry.querySelector('videoId')?.textContent||'';
      const published=entry.querySelector('published')?.textContent||'';
      const date=published?new Date(published).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'}):'';
      return `<article class="feed-card"><span class="category">SUPPLY CHAIN WITH RAJA</span><h3>${escapeHtml(title)}</h3><p>${date}</p><a href="https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}" target="_blank" rel="noopener">Watch video →</a></article>`;
    }).join('');
  }catch(error){
    container.innerHTML='<div class="feed-fallback"><p>New videos will appear here as the media library develops.</p><a href="'+CHANNEL_URL+'" target="_blank" rel="noopener">Visit Supply Chain With Raja on YouTube →</a></div>';
  }
}
function escapeHtml(value){return value.replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));}
document.addEventListener('DOMContentLoaded',loadYouTubeFeed);