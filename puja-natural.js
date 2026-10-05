(() => {
  "use strict";

  // This layer sits above the browser-native Puja engine. It intercepts
  // questions before the older keyword handler and provides more natural,
  // contextual responses without requiring an API key or backend.
  const TOPICS = [
    {id:"about",title:"Sage Harvest",route:"about.html",keys:["sage harvest","sage harvest agro","website","firm","company","advisory"],phrases:["what is sage harvest","what does sage harvest do","tell me about sage harvest","what is this website"],answer:"Sage Harvest Agro is an independent, practitioner-led advisory firm focused on seed and agri-business supply chains. In simple terms, Sage Harvest helps organizations understand how their operations work, identify the real constraints and design better systems for transformation, growth and resilience.",more:"The website brings that perspective together across supply-chain transformation, Digital & AI, sustainability and climate, due diligence, and international expansion."},
    {id:"services",title:"Services",route:"services.html",keys:["services","service","consulting","advisory","help","offer"],phrases:["what services do you provide","what services do you offer","what can sage harvest help with","how can you help a company"],answer:"Sage Harvest works across supply-chain transformation, Digital & AI, sustainability and climate, supply-chain due diligence and operational risk, and international expansion and cross-border trade.",more:"The common thread is practical execution: understand the operating problem first, then choose the right combination of process, data, technology and management action."},
    {id:"supply",title:"Supply Chain Transformation",route:"services.html",keys:["supply chain","seed supply chain","production","planning","processing","quality","warehouse","inventory","distribution","traceability","operations"],phrases:["how do you improve supply chains","tell me about supply chain transformation","what is seed supply chain","how does sage harvest approach supply chains"],answer:"Sage Harvest looks at the seed supply chain as one connected system rather than isolated functions. That means looking across production planning, processing, quality, warehousing, inventory, distribution and traceability.",more:"The objective is not simply to optimise one function. It is to understand how a decision in one part of the network affects cost, service, quality, risk and outcomes elsewhere."},
    {id:"ai",title:"Digital & AI",route:"digital-ai.html",keys:["digital","ai","artificial intelligence","machine learning","regression","forecast","forecasting","analytics","satellite","weather","data","traceability"],phrases:["tell me about digital and ai","how can ai help","how do you use ai","what is your ai work","tell me about machine learning","what about satellite data","what about forecasting"],answer:"Sage Harvest treats Digital & AI as a decision-support capability rather than technology for its own sake. The website covers AI and analytics, forecasting, satellite and weather intelligence, traceability and data-driven decision support for agricultural supply chains.",more:"The broader idea is to connect field and operational data with better planning and management decisions. That can include forecasting demand or supply, identifying patterns, and using satellite or weather information where it adds decision value."},
    {id:"sustainability",title:"Sustainability & Climate",route:"sustainability.html",keys:["sustainability","climate","carbon","mrv","emissions","resource efficiency","climate smart","resilience"],phrases:["tell me about sustainability","how do you address climate","tell me about carbon","what is mrv","how can supply chains become sustainable"],answer:"Sage Harvest connects sustainability with the way the supply chain actually operates. The website covers climate-smart supply chains, resource efficiency, carbon and MRV-oriented approaches, and sustainability assurance.",more:"The practical perspective is to connect sustainability goals with operational decisions, rather than treating climate and supply-chain performance as separate subjects."},
    {id:"ma",title:"M&A Due Diligence",route:"ma-due-diligence.html",keys:["m&a","m and a","merger","acquisition","due diligence","operational risk","investor","transaction"],phrases:["tell me about m&a","tell me about due diligence","how do you assess an acquisition","what is operational risk assessment","can you help investors"],answer:"Sage Harvest's due-diligence perspective is about understanding the operational reality behind the numbers. That can include production, infrastructure, inventory, quality, capacity and operating risks.",more:"The purpose is to help management teams, investors and transaction teams see operational strengths, constraints and risks that may not be obvious from financial information alone."},
    {id:"international",title:"International Expansion & Trade",route:"international-expansion.html",keys:["international","global","export","cross border","cross-border","india africa","africa","trade","market entry","partner","expansion"],phrases:["tell me about international expansion","how can you help with exports","what about india africa","do you help companies enter new markets","tell me about global expansion"],answer:"Sage Harvest supports organizations exploring international markets, export opportunities, strategic partnerships and cross-border supply chains.",more:"The international focus connects market intelligence, commercial strategy, partner identification and facilitation with disciplined execution."},
    {id:"founder",title:"Founder",route:"founder.html",keys:["founder","raja","raja vadlamani","principal advisor","corteva","advanta","shriram bioseed","seedworks"],phrases:["who is raja vadlamani","tell me about raja","who founded sage harvest","who is the founder"],answer:"Raja Vadlamani is the Founder and Principal Advisor of Sage Harvest. The website describes nearly four decades across the seed and agri-business ecosystem, with experience across Corteva, Advanta, Shriram Bioseed and SeedWorks International.",more:"His Sage Harvest role brings that operating experience into independent advisory work across supply chains, transformation, technology, sustainability and international opportunity."},
    {id:"insights",title:"Insights",route:"insights.html",keys:["insights","articles","article","writing","publication","linkedin","read"],phrases:["where are your articles","show me your articles","tell me about your insights","what have you written","where can i read your articles"],answer:"The Insights section is Sage Harvest's space for practical perspectives on seed supply chains, AI, sustainability and industry transformation.",more:"You can use Insights in the main navigation to explore the published material."},
    {id:"youtube",title:"Supply Chain With Raja",route:"https://www.youtube.com/@rajavadlamani",keys:["youtube","video","videos","channel","watch","supply chain with raja"],phrases:["where is your youtube","tell me about supply chain with raja","where can i watch your videos","do you have videos"],answer:"Supply Chain With Raja is the video knowledge platform associated with Sage Harvest. It extends the website's ideas through practical conversations and explainers around seed supply chains, AI, sustainability and industry transformation.",more:"You can open the YouTube channel from here whenever you want to explore the video content."},
    {id:"labs",title:"Labs",route:"labs.html",keys:["labs","lab","experiment","experiments","tools","innovation","prototype"],phrases:["what are the labs","tell me about labs","what do you experiment with","what tools have you built"],answer:"Labs is the practical experimentation space of Sage Harvest. It is intended for tools, experiments and emerging ideas that can make supply-chain decisions more useful and practical.",more:"It is where concepts can be explored in a more hands-on way rather than remaining only as written advisory ideas."},
    {id:"cases",title:"Case Perspectives",route:"case-studies.html",keys:["case","cases","case studies","case perspectives","projects","experience","greenfield"],phrases:["show me your case studies","tell me about your case perspectives","what experience do you have","what projects have you worked on","tell me about greenfield projects"],answer:"Case Perspectives brings practical experience into the website, including supply-chain transformation, planning, technology, sustainability and operational challenges.",more:"The intention is to show how the ideas translate into real operating situations and decisions."},
    {id:"contact",title:"Contact",route:"contact.html",keys:["contact","email","phone","engage","conversation","talk","work together"],phrases:["how do i contact you","how can i get in touch","can we work together","how can i engage you","talk to someone"],answer:"Certainly. The Talk to Us and Contact sections are the best place to start a conversation with Sage Harvest. If you tell me what you are looking for, I can also guide you to the most relevant area of the site.",more:"For example, I can help you decide whether your question is more relevant to supply-chain transformation, Digital & AI, sustainability, due diligence or international expansion."}
  ];

  const stopPhrases = ["stop","stop talking","stop speaking","stop voice","be quiet","quiet please","please stop","thats enough","that's enough"];
  const followPhrases = ["tell me more","more","go on","explain more","say more","continue","what do you mean","can you explain","give me an example","example","why","how so","what about it","and what about that"];
  const stopWords = new Set(["a","an","the","is","are","do","does","did","can","could","would","you","your","i","me","my","we","us","to","for","of","and","or","in","on","about","tell","please","what","how","who","where","why","with","this","that","it","from"]);
  const norm = s => String(s||"").toLowerCase().replace(/[’']/g,"").replace(/[^a-z0-9&\s-]/g," ").replace(/\s+/g," ").trim();
  const words = s => norm(s).split(" ").filter(w=>w&&!stopWords.has(w));
  const isStop = s => { const n=norm(s); return stopPhrases.some(p=>n===p||n.startsWith(p+" ")); };
  const isFollow = s => { const n=norm(s); return followPhrases.some(p=>n===p||n.startsWith(p+" ")) || (n.length<25 && /^(more|why|how|example|explain|continue)\b/.test(n)); };

  const $ = id => document.getElementById(id);
  const panel=$("pujaPanel"), form=$("pujaForm"), input=$("pujaInput"), messages=$("pujaMessages"), mic=$("pujaMic"), avatar=$("pujaAvatar"), mini=$("pujaMiniAvatar"), status=$("pujaStatus"), stopButton=$("pujaStopSpeaking");
  if(!panel||!form||!input||!messages) return;

  let currentTopic=null, recognition=null, listening=false, voice=null;
  const synth="speechSynthesis" in window ? window.speechSynthesis : null;

  function stopVoice(){
    if(synth){ synth.cancel(); synth.resume(); }
    avatar?.classList.remove("speaking","listening"); mini?.classList.remove("speaking","listening");
    if(status) status.textContent="Sage Harvest Guide";
  }

  function addMessage(text,sender="bot"){
    const row=document.createElement("div"); row.className=`puja-message puja-message-${sender}`;
    if(sender==="bot"){const a=document.createElement("div");a.className="puja-message-avatar";a.textContent="P";row.appendChild(a);}
    const body=document.createElement("div");body.className="puja-message-content";body.textContent=text;row.appendChild(body);messages.appendChild(row);messages.scrollTop=messages.scrollHeight;
  }

  function addLink(topic){
    if(!topic?.route)return;
    const wrap=document.createElement("div");wrap.className="puja-navigation-link";
    const a=document.createElement("a");a.className="puja-inline-link";a.href=topic.route;a.textContent=topic.id==="youtube"?"Open Supply Chain With Raja →":`Explore ${topic.title} →`;
    if(/^https?:/.test(topic.route)){a.target="_blank";a.rel="noopener";} wrap.appendChild(a);messages.appendChild(wrap);messages.scrollTop=messages.scrollHeight;
  }

  function loadVoice(){
    if(!synth)return; const vs=synth.getVoices();
    for(const lang of ["en-IN","en-US","en-GB"]){const m=vs.filter(v=>v.lang.toLowerCase().startsWith(lang.toLowerCase()));if(m.length){voice=m.find(v=>/female|zira|samantha|susan|heera|aria|google/i.test(v.name))||m[0];break;}}
    voice ||= vs.find(v=>/^en/i.test(v.lang))||vs[0]||null;
  }
  loadVoice(); synth?.addEventListener("voiceschanged",loadVoice);

  function speak(text){
    if(!synth)return; stopVoice(); const u=new SpeechSynthesisUtterance(text);u.lang="en-IN";u.rate=.94;u.pitch=1.04;if(voice)u.voice=voice;
    u.onstart=()=>{avatar?.classList.add("speaking");mini?.classList.add("speaking");if(status)status.textContent="Puja is speaking";};
    u.onend=()=>{avatar?.classList.remove("speaking");mini?.classList.remove("speaking");if(status)status.textContent="Sage Harvest Guide";};
    u.onerror=()=>stopVoice(); synth.speak(u);
  }

  function score(q,t){
    const n=norm(q), set=new Set(words(q)); let s=0;
    t.phrases.forEach(p=>{const x=norm(p);if(n===x)s+=20;else if(n.includes(x))s+=11;});
    t.keys.forEach(k=>{const x=norm(k);if(n.includes(x))s+=x.includes(" ")?5:2;});
    const hits=[...set].filter(w=>t.keys.some(k=>norm(k).split(" ").includes(w))).length; if(hits>=2)s+=hits*2; return s;
  }
  function find(q){let best=null,bs=0;TOPICS.forEach(t=>{const s=score(q,t);if(s>bs){bs=s;best=t;}});return bs>=3?best:null;}

  function makeAnswer(topic,q){
    const n=norm(q);
    if(isFollow(q)&&currentTopic?.id===topic.id)return `Of course. ${topic.more}`;
    if(/\bwhy\b|\bbenefit\b|\bimportant\b|\bvalue\b/.test(n))return `The important point is this: ${topic.more}`;
    if(/\bhow\b|\bapproach\b|\bprocess\b|\bwork\b/.test(n))return `In practical terms, ${topic.answer} ${topic.more}`;
    if(/\bwhere\b|\blink\b|\bfind\b|\bpage\b|\bwatch\b|\bread\b/.test(n))return `${topic.answer} I can take you to the relevant section.`;
    if(/\bexample\b/.test(n))return `${topic.answer} A useful way to think about it is: first understand the operating problem, then identify the constraint, and only then decide what process, data or technology is needed.`;
    return topic.answer;
  }

  function respond(q){
    const n=norm(q);
    if(isStop(q))return {stop:true};
    if(/^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(n))return {text:"Hello. I’m Puja, the virtual agent for Sage Harvest. It’s nice to have you here. What would you like to explore?"};
    if(isFollow(q)&&currentTopic)return {text:makeAnswer(currentTopic,q),topic:currentTopic};
    if(/\b(thank you|thanks|thankyou)\b/.test(n))return {text:"You’re very welcome. If there is anything else you would like to explore on Sage Harvest, I’m happy to help."};
    const t=find(q); if(t)return {text:makeAnswer(t,q),topic:t};
    if(/\b(what can i ask|what can you help|menu|sections|pages)\b/.test(n))return {text:"You can ask me about Sage Harvest, our services, supply-chain transformation, Digital & AI, sustainability, M&A due diligence, international expansion, Raja Vadlamani, Insights, Labs, Case Perspectives or Supply Chain With Raja."};
    return {text:"I’m not completely sure what you mean, and I don’t want to guess. If you tell me the area you are interested in—such as supply chains, Digital & AI, sustainability, due diligence, international expansion or the Founder—I can explain it in plain language."};
  }

  function process(q){
    q=String(q||"").trim();if(!q)return;
    if(isStop(q)){stopVoice();return;}
    stopVoice();addMessage(q,"user");const r=respond(q);if(r.stop)return;if(r.topic)currentTopic=r.topic;addMessage(r.text,"bot");if(r.topic&&/\b(where|link|page|watch|read|find)\b/.test(norm(q)))addLink(r.topic);speak(r.text);
  }

  // Capture phase runs before the original Puja handler, so this layer becomes
  // the active conversational router without requiring changes to the older file.
  document.addEventListener("submit",e=>{if(e.target!==form)return;e.preventDefault();e.stopImmediatePropagation();const q=input.value;input.value="";process(q);},true);
  document.addEventListener("click",e=>{if(e.target===stopButton){e.preventDefault();e.stopImmediatePropagation();stopVoice();return;}if(e.target===mic){e.preventDefault();e.stopImmediatePropagation();toggleListening();return;}const b=e.target.closest?.("[data-puja-question]");if(b){e.preventDefault();e.stopImmediatePropagation();const q=b.dataset.pujaQuestion||"";const p=panel.classList.contains("open");if(!p){panel.classList.add("open");panel.setAttribute("aria-hidden","false");}process(q);}},true);

  function toggleListening(){
    if(!recognition){addMessage("Voice input is not supported by this browser. You can still type your question.","bot");return;}
    if(listening){recognition.stop();return;}
    stopVoice();try{recognition.start();}catch(_){ }
  }

  if(window.SpeechRecognition||window.webkitSpeechRecognition){
    const R=window.SpeechRecognition||window.webkitSpeechRecognition;recognition=new R();recognition.lang="en-IN";recognition.continuous=false;recognition.interimResults=false;recognition.maxAlternatives=1;
    recognition.onstart=()=>{listening=true;mic?.classList.add("active");avatar?.classList.add("listening");mini?.classList.add("listening");if(status)status.textContent="Listening...";};
    recognition.onresult=e=>{const text=e.results[0][0].transcript;if(isStop(text)){stopVoice();return;}process(text);};
    recognition.onerror=e=>{if(e.error!=="aborted")addMessage(e.error==="not-allowed"?"Please allow microphone access if you want to speak with me.":"I didn’t catch that. Please try again or type your question.","bot");};
    recognition.onend=()=>{listening=false;mic?.classList.remove("active");avatar?.classList.remove("listening");mini?.classList.remove("listening");if(status)status.textContent="Sage Harvest Guide";};
  }else if(mic){mic.disabled=true;mic.title="Speech recognition is not supported in this browser.";}

  // If the visitor says "stop talking" while recognition is active, the
  // transcript is handled immediately by the stop branch above.
  window.PujaNatural={process,stopVoice,topics:TOPICS};
})();