(() => {
  "use strict";
  const PUJA_DEBUG = new URLSearchParams(window.location.search).get("pujadebug") === "1";
  let pujaDebugSession = null;
  let pujaDebugTurn = null;

  function pujaDebug(event, data = {}) {
    if (!PUJA_DEBUG) return;
    const payload = { ts:new Date().toISOString(), perfMs:Math.round(performance.now()), event, ...data };
    console.debug("[Puja Debug]", payload);
    window.__pujaDebugSession = pujaDebugSession;
    window.__pujaDebugTurns = window.__pujaDebugTurns || [];
    if (pujaDebugTurn && !window.__pujaDebugTurns.includes(pujaDebugTurn)) window.__pujaDebugTurns.push(pujaDebugTurn);
  }
  function pujaDebugNewTurn(source) {
    pujaDebugTurn = {id:"turn-"+Date.now()+"-"+Math.random().toString(36).slice(2,7),source,startedAt:new Date().toISOString(),speechEndPerfMs:null,transcriptParts:[],transcript:"",route:"none",knowledgeEntries:0,knowledgeChars:0,knowledgeApproxTokens:0,matches:[],notFoundTriggered:false,notFoundReason:null,firstAudioPerfMs:null,playbackStartPerfMs:null,turnCompletePerfMs:null,generationCount:0,rawGenerationCount:0,groundedGenerationCount:0,serverContentCount:0,outboundGenerations:0};
    if (PUJA_DEBUG) { window.__pujaDebugTurns=window.__pujaDebugTurns||[]; window.__pujaDebugTurns.push(pujaDebugTurn); }
    pujaDebug("turn_start",{turnId:pujaDebugTurn.id,source}); return pujaDebugTurn;
  }
  function pujaDebugKnowledge(entries,chars,route,matches=[]) {
    if(!pujaDebugTurn)return;
    pujaDebugTurn.knowledgeEntries=entries;pujaDebugTurn.knowledgeChars=chars;pujaDebugTurn.knowledgeApproxTokens=Math.round(chars/4);pujaDebugTurn.route=route;
    pujaDebugTurn.matches=matches.map(e=>({id:e.id||null,page:e.page_title||null,url:e.url||null,score:typeof e._score==="number"?e._score:null}));
    pujaDebug("knowledge_context",{turnId:pujaDebugTurn.id,route,entries,chars,approximateTokens:Math.round(chars/4),matches:pujaDebugTurn.matches});
  }
  function pujaDebugFinishTurn() {
    if(!pujaDebugTurn)return;
    const t=pujaDebugTurn;
    pujaDebug("turn_summary",{turnId:t.id,transcript:t.transcript,route:t.route,knowledgeEntries:t.knowledgeEntries,knowledgeChars:t.knowledgeChars,approximateTokens:t.knowledgeApproxTokens,matches:t.matches,notFoundTriggered:t.notFoundTriggered,notFoundReason:t.notFoundReason,generationCount:t.generationCount,rawGenerationCount:t.rawGenerationCount,groundedGenerationCount:t.groundedGenerationCount,outboundGenerations:t.outboundGenerations,speechEndToFirstAudioMs:t.speechEndPerfMs!=null&&t.firstAudioPerfMs!=null?Math.round(t.firstAudioPerfMs-t.speechEndPerfMs):null,firstAudioToPlaybackStartMs:t.firstAudioPerfMs!=null&&t.playbackStartPerfMs!=null?Math.round(t.playbackStartPerfMs-t.firstAudioPerfMs):null,speechEndToTurnCompleteMs:t.speechEndPerfMs!=null&&t.turnCompletePerfMs!=null?Math.round(t.turnCompletePerfMs-t.speechEndPerfMs):null});
  }
  function pujaDebugRenderVoiceState(){
    if(!PUJA_DEBUG||!pujaDebugTurn)return;
    let box=document.getElementById("pujaDebugPanel");
    if(!box){
      box=document.createElement("div");
      box.id="pujaDebugPanel";
      box.style.cssText="margin:8px 0;padding:8px;border:1px dashed currentColor;border-radius:8px;font:12px/1.35 monospace;white-space:pre-wrap;max-height:180px;overflow:auto;opacity:.85";
      const target=messages||panel;
      target?.parentNode?.insertBefore(box,target);
    }
    const t=pujaDebugTurn;
    const matchText=t.matches?.length?t.matches.map(m=>m.id||m.page||"match").join(", "):"NONE";
    box.textContent="PUJA DEBUG (only with ?pujadebug=1)\nTranscript: "+(t.transcript||"(none yet)")+"\nRoute: "+(t.route||"none")+"\nKnowledge matches: "+matchText+"\nKnowledge entries: "+t.knowledgeEntries+" | chars: "+t.knowledgeChars+"\nSpeech→first audio: "+(t.speechEndPerfMs!=null&&t.firstAudioPerfMs!=null?Math.round(t.firstAudioPerfMs-t.speechEndPerfMs)+" ms":"not measured yet");
  }
  const LIVE_TOKEN_URL = "https://sageharvest-puja.raja-vadlamani.workers.dev/live-token";
  const MODEL = "models/gemini-3.8-live";
  const VOICE = "Kore";
  const SITE_KNOWLEDGE = `You are Puja, the AI guide for Sage Harvest Agro Pvt. Limited.

WEBSITE GROUNDING:
- The published Sage Harvest website knowledge is loaded locally in the browser.
- For factual Sage Harvest answers, use only the published knowledge supplied with the current turn. Do not use outside knowledge, assumptions, guesses or invented facts, figures, clients, prices, dates, credentials, vacancies, offices, results or commitments.
- Answer directly and concisely from relevant published entries.
- If the published knowledge supplied for the current turn does not clearly answer the question, say: "I’m sorry, that information is not available in the published Sage Harvest website content. Please use the Contact page for further information."
- Clearly distinguish stated facts from proposed plans and illustrative/anonymised perspectives.
- Do not ask visitors to disclose confidential, commercially sensitive, personal, privileged or restricted information.
- Puja is an AI-assisted website guide, not professional or regulated advice.
- Be warm, professional and conversational.

VOICE TRANSCRIPTION CLARIFICATION:
- Browser speech recognition can occasionally produce near-sounding words.
- When a transcript contains an unclear or misspelled term, use the published Sage Harvest vocabulary, page titles, keywords and synonyms supplied with the turn to infer the closest supported meaning.
- Do not invent a person, company, service, career, collaboration or other fact merely to repair a transcript.

ANSWERING PRIORITY:
- For factual questions about Sage Harvest, answer ONLY from the published Sage Harvest grounding context supplied with that turn.
- Do not answer factual website questions from model knowledge, general Gemini knowledge, assumptions or remembered facts.
- The grounding context supplied with the turn is authoritative for that turn.
- If the grounding context says the published site does not clearly answer the question, speak exactly the existing not-found response.
- Greetings and simple courtesy may be answered naturally.

The locally loaded published Sage Harvest knowledge is the factual source used to prepare each grounded turn.`;

  const KNOWLEDGE_URL = "assets/data/puja-knowledge.json";
  let knowledgeEntries = [];
  let knowledgePromise = null;
  function normalizeKnowledgeText(value){
    return String(value||"").toLowerCase()
      .replace(/[’‘]/g,"'")
      .replace(/&/g," and ")
      .replace(/[^a-z0-9\s-]/g," ")
      .replace(/\s+/g," ").trim();
  }
  function tokenForms(token){
    const t=String(token||"").toLowerCase();
    if(!t)return [];
    const forms=new Set([t]);
    if(t.length>4){
      if(t.endsWith("ies"))forms.add(t.slice(0,-3)+"y");
      if(t.endsWith("s"))forms.add(t.slice(0,-1));
      else forms.add(t+"s");
    }
    return [...forms];
  }
  function phraseInQuery(phrase,q){
    const p=normalizeKnowledgeText(phrase);
    return p.length>1&&q.includes(p);
  }
  async function ensureKnowledge(){
    if(knowledgeEntries.length)return knowledgeEntries;
    if(knowledgePromise)return knowledgePromise;
    knowledgePromise=fetch(new URL(KNOWLEDGE_URL,document.baseURI).href,{cache:"no-store"})
      .then(r=>{if(!r.ok)throw new Error("Puja website knowledge could not be loaded.");return r.json();})
      .then(d=>{if(!d||!Array.isArray(d.entries)||!d.entries.length)throw new Error("Puja website knowledge is empty.");knowledgeEntries=d.entries;return knowledgeEntries;})
      .catch(e=>{knowledgePromise=null;throw e;});
    return knowledgePromise;
  }
  function isGreetingOrCourtesy(value){
    const q=normalizeKnowledgeText(value);
    return /^(hi|hello|hey|good morning|good afternoon|good evening|thanks|thank you|thank you puja|who are you|what is your name|how are you|nice to meet you)[!?.,\s]*$/i.test(q);
  }
  const PUJA_TOPIC_ROUTES = [
    {keys:["raja vadlamani","who is raja","about raja","founder","principal advisor"],pages:["founder.html","about.html"]},
    {keys:["careers","career","collaboration","work with sage harvest","join sage harvest","associate consultant","subject matter expert","strategic partner"],pages:["careers.html"]},
    {keys:["when do consulting engagements","when will consulting engagements","engagements commence","consulting start date","start date","launch date"],pages:["services.html","index.html"]},
    {keys:["services","what services","service offerings","what does sage harvest do"],pages:["services.html"]},
    {keys:["digital and ai","digital ai","artificial intelligence","ai services","digital services"],pages:["digital-ai.html"]},
    {keys:["sustainability","climate","carbon","mrv"],pages:["sustainability.html"]},
    {keys:["international expansion","international trade","export","cross border","global expansion","india africa"],pages:["international-expansion.html"]},
    {keys:["m and a","m&a","due diligence","acquisition","transaction"],pages:["ma-due-diligence.html"]},
    {keys:["labs","sage harvest labs","rice seed climate ledger","carbon reduction calculator"],pages:["labs.html"]},
    {keys:["case studies","case perspectives","examples","perspectives"],pages:["case-studies.html"]},
    {keys:["insights","articles","published perspectives"],pages:["insights.html"]},
    {keys:["fees","fee","pricing","price","commercial terms","rate card"],pages:["services.html"]},
    {keys:["contact","talk to us","how do i contact","get in touch"],pages:["contact.html"]},
    {keys:["confidentiality","confidential","privacy"],pages:["confidentiality.html","privacy.html"]},
    {keys:["professional standards","independence","conflicts"],pages:["professional-standards.html"]}
  ];

  function routedKnowledge(value){
    const q=normalizeKnowledgeText(value);
    if(!q)return [];
    const route=PUJA_TOPIC_ROUTES.find(r=>r.keys.some(k=>phraseInQuery(k,q)));
    if(!route)return [];
    const wanted=new Set(route.pages);
    return knowledgeEntries
      .filter(e=>wanted.has(String(e.url||"").split("/").pop()) || route.pages.some(p=>String(e.url||"").endsWith("/"+p)))
      .map(e=>({...e,_score:100}));
  }

  function levenshteinDistance(a,b){
    const aa=String(a||""),bb=String(b||"");
    if(aa===bb)return 0;
    if(!aa.length)return bb.length;
    if(!bb.length)return aa.length;
    let prev=Array.from({length:bb.length+1},(_,i)=>i);
    for(let i=1;i<=aa.length;i++){
      const cur=[i];
      for(let j=1;j<=bb.length;j++)cur[j]=Math.min(cur[j-1]+1,prev[j]+1,prev[j-1]+(aa[i-1]===bb[j-1]?0:1));
      prev=cur;
    }
    return prev[bb.length];
  }
  function fuzzySimilarity(a,b){
    const aa=normalizeKnowledgeText(a),bb=normalizeKnowledgeText(b);
    if(!aa||!bb)return 0;
    return 1-(levenshteinDistance(aa,bb)/Math.max(aa.length,bb.length));
  }
  function repairSpeechQuery(value){
    const original=String(value||"").trim();
    if(!original)return {query:"",changes:[]};
    const tokens=normalizeKnowledgeText(original).split(/\s+/).filter(Boolean);
    const vocabulary=[...new Set(knowledgeEntries.flatMap(e=>[e.page_title||"",e.section_heading||"",...(e.keywords||[]),...(e.synonyms||[])]).flatMap(v=>normalizeKnowledgeText(v).split(/\s+/)).filter(t=>t.length>=4))];
    const changes=[];
    const repaired=tokens.map(token=>{
      if(token.length<4)return token;
      let best=null;
      for(const candidate of vocabulary){const sim=fuzzySimilarity(token,candidate);if(sim>=0.84&&(!best||sim>best.sim))best={candidate,sim};}
      if(best&&best.candidate!==token){changes.push({from:token,to:best.candidate,similarity:Number(best.sim.toFixed(2))});return best.candidate;}
      return token;
    }).join(" ");
    return {query:repaired||original,changes};
  }
  function fuzzyKnowledgeMatches(value){
    const q=normalizeKnowledgeText(value);if(!q)return [];
    const qTokens=q.split(/\s+/).filter(t=>t.length>2);
    return knowledgeEntries.map(entry=>{
      const fields=[
        normalizeKnowledgeText(entry.page_title||""),
        normalizeKnowledgeText(entry.section_heading||""),
        ...(entry.keywords||[]).map(normalizeKnowledgeText),
        ...(entry.synonyms||[]).map(normalizeKnowledgeText)
      ].filter(Boolean);
      let best=0;
      for(const field of fields){
        const words=field.split(/\s+/).filter(w=>w.length>2);
        for(const qt of qTokens)for(const w of words){
          const sim=fuzzySimilarity(qt,w);
          if(sim>=0.72)best=Math.max(best,sim);
        }
      }
      return {...entry,_score:best*8};
    }).filter(e=>e._score>=5.75).sort((a,b)=>b._score-a._score).slice(0,6);
  }

  function matchKnowledge(value){
    const q=normalizeKnowledgeText(value);if(!q)return [];
    const rawTokens=q.split(/\s+/).filter(t=>t.length>2);
    const qTokens=new Set(rawTokens.flatMap(tokenForms));
    return knowledgeEntries.map(entry=>{
      const heading=normalizeKnowledgeText(entry.section_heading||"");
      const page=normalizeKnowledgeText(entry.page_title||"");
      const keywords=(entry.keywords||[]).map(normalizeKnowledgeText).filter(Boolean);
      const synonyms=(entry.synonyms||[]).map(normalizeKnowledgeText).filter(Boolean);
      let score=0;
      for(const phrase of synonyms){
        if(phraseInQuery(phrase,q))score+=14;
      }
      if(heading&&phraseInQuery(heading,q))score+=16;
      else{
        const headingTokens=heading.split(/\s+/).filter(t=>t.length>2);
        const headingHits=headingTokens.filter(t=>qTokens.has(t)||tokenForms(t).some(f=>qTokens.has(f))).length;
        score+=Math.min(headingHits*3,9);
      }
      if(page&&phraseInQuery(page,q))score+=12;
      for(const phrase of keywords){
        if(phrase.length>2&&phraseInQuery(phrase,q))score+=6;
      }
      const contentTokens=normalizeKnowledgeText(entry.text||"").split(/\s+/).filter(t=>t.length>3);
      const uniqueContent=[...new Set(contentTokens)];
      let tokenHits=0;
      for(const token of uniqueContent){
        const forms=tokenForms(token);
        if(forms.some(f=>qTokens.has(f)))tokenHits++;
      }
      score+=Math.min(tokenHits*1.5,12);
      const fuzzyFields=[...heading.split(/\s+/),...page.split(/\s+/),...keywords.flatMap(x=>x.split(/\s+/)),...synonyms.flatMap(x=>x.split(/\s+/))].filter(w=>w.length>2);
      for(const qt of rawTokens)if(fuzzyFields.some(w=>fuzzySimilarity(qt,w)>=0.78))score+=3.5;
      return {...entry,_score:score};
    }).filter(e=>e._score>=5).sort((a,b)=>b._score-a._score).slice(0,6);
  }
  function formatMatchedKnowledge(matches){
    return matches.map((e,i)=>"SOURCE "+(i+1)+"\nPAGE TITLE: "+e.page_title+"\nSECTION: "+e.section_heading+"\nSOURCE URL: "+e.url+"\nPUBLISHED TEXT: "+e.text).join("\n\n");
  }
  function formatAllKnowledge(){
    return knowledgeEntries.map(e=>"PAGE TITLE: "+e.page_title+"\nSECTION: "+e.section_heading+"\nSOURCE URL: "+e.url+"\nPUBLISHED TEXT: "+e.text).join("\n\n");
  }  function noKnowledgeAnswer(){return "I’m sorry, that information is not available in the published Sage Harvest website content. Please use the Contact page for further information.";}
  function addKnowledgeLinks(matches){
    const seen=new Set();
    for(const e of matches.slice(0,2)){
      if(!e.url||seen.has(e.url))continue;
      seen.add(e.url);
      const wrap=document.createElement("div");wrap.className="puja-navigation-link";
      const a=document.createElement("a");a.className="puja-inline-link";a.href=e.url;a.target="_blank";a.rel="noopener";a.textContent="Learn more: "+e.page_title+" →";
      wrap.appendChild(a);messages.appendChild(wrap);
    }
    messages.scrollTop=messages.scrollHeight;
  }
  async function getCurrentKnowledgeInstruction(){
    await ensureKnowledge();
    const corpus=formatAllKnowledge();
    pujaDebug("local_knowledge_loaded",{entries:knowledgeEntries.length,chars:corpus.length,approximateTokens:Math.round(corpus.length/4),truncated:false});
    if(pujaDebugSession)pujaDebugSession.localKnowledge={entries:knowledgeEntries.length,chars:corpus.length,approximateTokens:Math.round(corpus.length/4),truncated:false};
    return SITE_KNOWLEDGE+"\n\nLIVE VOICE GROUNDING POLICY — The published Sage Harvest knowledge is loaded locally in the browser and is used to prepare turn-specific grounding context. Use only that grounding context for factual content. Do not use outside knowledge, assumptions or invented facts. If the locally selected published entries do not clearly answer the question, speak exactly this response: \"I’m sorry, that information is not available in the published Sage Harvest website content. Please use the Contact page for further information.\" Do not invent vacancies, clients, results, fees, offices, commitments or dates. For greetings and simple courtesy, respond naturally without using any external website-search tool.";
  }
  async function getQuestionContext(value){
    await ensureKnowledge();
    if(isGreetingOrCourtesy(value))return {matches:[],context:SITE_KNOWLEDGE,smallTalk:true,rephrasedQuery:String(value||"")};
    const repaired=repairSpeechQuery(value);
    const candidates=[String(value||""),repaired.query].filter((v,i,a)=>v&&a.indexOf(v)===i);
    let matches=[];let usedQuery=String(value||"");
    for(const candidate of candidates){
      const routed=routedKnowledge(candidate);
      const found=routed.length?routed:matchKnowledge(candidate);
      if(found.length){matches=found;usedQuery=candidate;break;}
    }
    if(!matches.length){
      matches=fuzzyKnowledgeMatches(repaired.query);
      if(matches.length)usedQuery=repaired.query;
    }
    if(!matches.length)return {matches,context:"",smallTalk:false,rephrasedQuery:usedQuery,repairChanges:repaired.changes};
    return {matches,context:SITE_KNOWLEDGE+"\n\nCURRENT MATCHED PUBLISHED SITE ENTRIES — USE ONLY THESE ENTRIES FOR FACTUAL CONTENT IN THIS ANSWER. Do not use outside knowledge or any factual detail not supported by these entries. If these entries do not clearly answer the question, say so and direct the visitor to contact.html.\n\n"+formatMatchedKnowledge(matches),smallTalk:false,rephrasedQuery:usedQuery,repairChanges:repaired.changes};
  }

  const INPUT_RATE = 16000, OUTPUT_RATE = 24000;
  const $ = id => document.getElementById(id);
  const panel=$("pujaPanel"), launcher=$("pujaLauncher"), close=$("pujaClose"), form=$("pujaForm"),
        input=$("pujaInput"), messages=$("pujaMessages"), mic=$("pujaMic"),
        avatar=$("pujaAvatar"), mini=$("pujaMiniAvatar"), status=$("pujaStatus"), stopBtn=$("pujaStopSpeaking");
  if(!panel||!launcher||!form||!input||!messages)return;

  let socket=null, setupReady=false, connecting=false, suppressPlayback=false, activeVoiceTurnId=null, sessionResumptionHandle=null;
  let voiceMuted=false;
  let voiceRecognition=null, voiceRecognitionWanted=false, voiceRecognitionStarting=false;
  try{voiceMuted=sessionStorage.getItem("pujaVoiceMuted")==="true";}catch(_){}
  let outputContext=null, playbackSources=new Set(), nextPlayTime=0, playbackQueue=Promise.resolve(), playbackGeneration=0;
  let responsePending=false, responseSerial=0, lastVoiceTranscript="", lastVoiceTranscriptPerfMs=0;
  let microphoneContext=null, microphoneStream=null, microphoneSource=null, microphoneProcessor=null;
  let listening=false, outputRow=null, outputText="", inputRow=null, closedByUser=false;
  let audioChunksThisTurn=0, groundVoiceTurn=false, pendingVoiceTranscript="", voiceSpeechEnded=false, voiceGroundingTimer=null, groundingInterruptExpected=false;

  function setState(state,label){
    avatar?.classList.remove("speaking","listening"); mini?.classList.remove("speaking","listening");
    if(state){avatar?.classList.add(state);mini?.classList.add(state);}
    if(status&&label)status.textContent=label;
  }
  function addMessage(text,sender="bot"){
    const row=document.createElement("div"); row.className="puja-message puja-message-"+sender;
    if(sender==="bot"){const a=document.createElement("div");a.className="puja-message-avatar";a.textContent="P";row.appendChild(a);}
    const body=document.createElement("div");body.className="puja-message-content";body.textContent=text;row.appendChild(body);
    messages.appendChild(row);messages.scrollTop=messages.scrollHeight;return body;
  }
  function addLink(text){ return; }

  function b64bytes(b64){const bin=atob(b64),bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);return bytes;}
  async function resumeOutput(){
    const AudioContextClass=window.AudioContext||window.webkitAudioContext;
    if(!AudioContextClass)throw new Error("Audio playback is not supported by this browser.");
    if(!outputContext||outputContext.state==="closed")outputContext=new AudioContextClass();
    if(outputContext.state==="suspended")await outputContext.resume();
  }
  function primeAudio(){
    try{
      const AudioContextClass=window.AudioContext||window.webkitAudioContext;
      if(!AudioContextClass)return;
      if(!outputContext||outputContext.state==="closed")outputContext=new AudioContextClass();
      if(outputContext.state==="suspended")outputContext.resume().catch(()=>{});
    }catch(e){console.warn("Puja audio could not be primed",e);}
  }
  function speakFallback(text){
    if(!("speechSynthesis" in window)||!("SpeechSynthesisUtterance" in window))return;
    try{
      window.speechSynthesis.cancel();
      const utterance=new SpeechSynthesisUtterance(text);
      utterance.rate=1;utterance.pitch=1;utterance.volume=1;
      utterance.onstart=()=>setState("speaking","Puja is speaking");
      utterance.onend=()=>setState(null,"Text voice mode · ready");
      utterance.onerror=()=>setState(null,"Text mode · ready");
      window.speechSynthesis.speak(utterance);
    }catch(e){console.warn("Puja browser speech fallback failed",e);}
  }
  async function sendFallbackText(value){
    const qctx=await getQuestionContext(value);
    if(!qctx.smallTalk&&!qctx.matches.length){addMessage(noKnowledgeAnswer(),"bot");setState(null,"Text voice mode · ready");return;}
    const response=await fetch("https://sageharvest-puja.raja-vadlamani.workers.dev/",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({message:"Answer the visitor using the following authoritative Sage Harvest website knowledge. Preserve the existing Puja persona and guardrails. For factual content, use only the current matched published-site entries supplied for this turn. If they do not clearly answer the question, say so and direct the visitor to contact.html. Do not invent vacancies, clients, outcomes, fees or commitments.\n\n"+qctx.context+"\n\nVisitor question: "+value})
    });
    const data=await response.json();
    if(!response.ok||!data.answer)throw new Error(data.error||"Puja could not answer right now. Please try again.");
    addMessage(data.answer,"bot");addKnowledgeLinks(qctx.matches);addLink(data.answer);speakFallback(data.answer);
    setState(null,"Text voice mode · ready");
  }
  async function playPcm(b64,generation){
    if(!b64)return;
    await resumeOutput();
    // Stop may have happened while resumeOutput() was awaiting the audio context.
    // Re-check the generation before creating or starting any new audio source.
    if(generation!==playbackGeneration)return false;
    const bytes=b64bytes(b64),pcm=new Int16Array(bytes.buffer,bytes.byteOffset,Math.floor(bytes.byteLength/2));
    const buffer=outputContext.createBuffer(1,pcm.length,OUTPUT_RATE),channel=buffer.getChannelData(0);
    for(let i=0;i<pcm.length;i++)channel[i]=pcm[i]/32768;
    if(generation!==playbackGeneration)return false;
    const source=outputContext.createBufferSource();source.buffer=buffer;source.connect(outputContext.destination);
    nextPlayTime=Math.max(nextPlayTime,outputContext.currentTime+0.02);
    if(pujaDebugTurn&&pujaDebugTurn.playbackStartPerfMs==null){pujaDebugTurn.playbackStartPerfMs=performance.now();pujaDebug("playback_start",{turnId:pujaDebugTurn.id});}
    source.start(nextPlayTime);nextPlayTime+=buffer.duration;
    playbackSources.add(source);
    source.onended=()=>{playbackSources.delete(source);if(playbackSources.size===0&&!suppressPlayback)setState(null,listening?"Listening…":"Gemini Live · ready");};
    setState("speaking","Puja is speaking · Gemini Live");
    return true;
  }
  function queuePcm(b64,turnId){
    if(!b64)return;
    const generation=playbackGeneration;
    playbackQueue=playbackQueue.catch(()=>{}).then(async()=>{
      if(generation!==playbackGeneration)return;
      try{
        const played=await playPcm(b64,generation);
        if(played)pujaDebug("audio_chunk_playback",{turnId:turnId||null});
      }
      catch(e){console.warn("Puja audio playback failed",e);setState(null,"Puja audio unavailable");}
    });
  }

  function stopPlayback(){
    playbackGeneration++;
    playbackQueue=Promise.resolve();
    for(const source of playbackSources){try{source.stop();}catch(_){}try{source.disconnect();}catch(_){}}
    playbackSources.clear();
    nextPlayTime=0;
    // Suspend immediately so already-scheduled Web Audio cannot continue audibly.
    try{if(outputContext&&outputContext.state==="running")outputContext.suspend();}catch(_){}
    setState(null,listening?"Listening…":"Gemini Live · ready");
  }
  async function getLiveToken(){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),10000);

    try{
      const r=await fetch(LIVE_TOKEN_URL,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        signal:controller.signal
      });

      let d={};
      try{d=await r.json();}catch(_){}

      if(!r.ok||!d.token){
        const detail = d?.googleError?.message ? ` ${d.googleError.message}` : "";
        throw new Error(
          (d.error||`Puja Live token request failed (HTTP ${r.status}).`) + detail
        );
      }

      return d;
    }catch(e){
      if(e?.name==="AbortError"){
        throw new Error("Puja Live token request timed out.");
      }
      throw e;
    }finally{
      clearTimeout(timer);
    }
  }

  async function ensureSocket(){
    await ensureKnowledge();
    if(PUJA_DEBUG&&!pujaDebugSession){pujaDebugSession={startedAt:new Date().toISOString(),model:MODEL,voice:VOICE,route:"voice Live deterministic local grounding"};window.__pujaDebugSession=pujaDebugSession;pujaDebug("session_start",{model:MODEL,voice:VOICE});}
    if(socket&&socket.readyState===WebSocket.OPEN&&setupReady){
      return Promise.resolve();
    }

    if(connecting){
      return new Promise((resolve,reject)=>{
        const start=Date.now();

        const wait=()=>{
          if(socket&&socket.readyState===WebSocket.OPEN&&setupReady){
            return resolve();
          }

          if(!connecting&&(!socket||socket.readyState===WebSocket.CLOSED)){
            return reject(new Error("Puja Live connection failed."));
          }

          if(Date.now()-start>15000){
            return reject(new Error("Puja Live connection timed out."));
          }

          setTimeout(wait,50);
        };

        wait();
      });
    }

    connecting=true;
    setupReady=false;
    suppressPlayback=false;

    setState(null,"Connecting Puja to Gemini Live…");

    return getLiveToken().then(td=>new Promise((resolve,reject)=>{
      const wsUrl=
        "wss://generativelanguage.googleapis.com/ws/" +
        "google.ai.generativelanguage.v1beta." +
        "GenerativeService.BidiGenerateContentConstrained" +
        "?access_token="+encodeURIComponent(td.token);

      const ws=new WebSocket(wsUrl);
      socket=ws;

      let settled=false;

      const fail=(error)=>{
        clearTimeout(timeout);
        if(!settled){
          settled=true;
          reject(error instanceof Error?error:new Error(String(error)));
        }
      };

      const timeout=setTimeout(()=>{
        try{ws.close();}catch(_){}
        if(socket===ws){
          connecting=false;
          setupReady=false;
        }
        fail(new Error("Puja Live setup timed out after 15 seconds. The WebSocket opened but Gemini did not complete setup."));
      },15000);

      ws.onopen=async()=>{
        if(socket!==ws)return;
        pujaDebug("websocket_open");
        pujaDebug("outbound_setup");

        ws.send(JSON.stringify({
          setup:{
            model:MODEL,
            systemInstruction:{parts:[{text:await getCurrentKnowledgeInstruction()}]},
            generationConfig:{
              responseModalities:["AUDIO"],
              speechConfig:{
                voiceConfig:{
                  prebuiltVoiceConfig:{
                    voiceName:VOICE
                  }
                }
              }
            },
            outputAudioTranscription:{},
            sessionResumption:{handle:sessionResumptionHandle}
          }
        }));
      };

      ws.onmessage=async event=>{
        if(socket!==ws)return;

        let m;
        try{
          let raw=event.data;

          if(raw instanceof Blob){
            raw=await raw.text();
          }else if(raw instanceof ArrayBuffer){
            raw=new TextDecoder().decode(raw);
          }

          m=JSON.parse(raw);
        }catch(e){
          console.warn("Puja Live: unparsable WebSocket frame",e);
          return;
        }

        console.debug("Puja Live message",m);

        if(m.setupComplete){
          clearTimeout(timeout);
          window.PujaLiveReady=true;
          console.debug("[Puja] session ready");
          setupReady=true;
          connecting=false;
          settled=true;
          setState(null,"Gemini Live · ready");
          resolve();
          return;
        }

        if(m.setupError){
          clearTimeout(timeout);
          connecting=false;
          setupReady=false;

          const detail=
            m.setupError?.message||
            m.setupError?.status||
            "Gemini rejected the Puja Live setup.";

          try{ws.close();}catch(_){}

          fail(new Error(detail));
          return;
        }

        if(m.sessionResumptionUpdate){
          const u=m.sessionResumptionUpdate;
          if(u.resumable&&u.newHandle)sessionResumptionHandle=u.newHandle;
        }
        if(m.goAway)pujaDebug("go_away",{timeLeft:m.goAway?.timeLeft??null});
        const s=m.serverContent;
        if(!s)return;

        // A Gemini Live turn is single-owner: after turnComplete, late server frames
        // from that completed generation must never start a second spoken answer.
        if(!responsePending && (s.modelTurn?.parts?.length || s.outputTranscription?.text)){
          pujaDebug("late_generation_ignored",{responseSerial});
          return;
        }

        if(s.interrupted){
          stopPlayback();
          if(activeVoiceTurnId&&pujaDebugTurn?.id===activeVoiceTurnId)pujaDebug("grounded_turn_interrupted",{turnId:activeVoiceTurnId});
          else pujaDebug("late_interruption_ignored",{turnId:activeVoiceTurnId||null});
          return;
        }

        if(s.outputTranscription?.text){
          if(!pujaDebugTurn)pujaDebugNewTurn("voice");
          pujaDebug("output_transcription",{turnId:pujaDebugTurn.id,text:s.outputTranscription.text});
          const lowerOutput=String(s.outputTranscription.text).toLowerCase();
          if(lowerOutput.includes("not available in the published sage harvest website content")||lowerOutput.includes("please use the contact page")){pujaDebugTurn.notFoundTriggered=true;pujaDebugTurn.notFoundReason="model_output_contains_not_found_or_contact_phrase";}
          if(!outputRow){
            outputRow=addMessage("","bot");
          }

          outputText+=s.outputTranscription.text;
          outputRow.textContent=outputText;
          messages.scrollTop=messages.scrollHeight;
        }

        if(s.modelTurn?.parts?.length){
          if(!pujaDebugTurn)pujaDebugNewTurn("voice");
          pujaDebugTurn.serverContentCount++;pujaDebugTurn.generationCount++;
          if(activeVoiceTurnId&&pujaDebugTurn.id===activeVoiceTurnId)pujaDebugTurn.groundedGenerationCount++;
          pujaDebug("model_generation",{turnId:pujaDebugTurn.id,generationCount:pujaDebugTurn.generationCount,partCount:s.modelTurn.parts.length});
          for(const part of(s.modelTurn.parts||[])){
            const inline=part?.inlineData||part?.inline_data;
            if(inline?.data){
              if(pujaDebugTurn.firstAudioPerfMs==null){pujaDebugTurn.firstAudioPerfMs=performance.now();pujaDebug("first_audio_chunk",{turnId:activeVoiceTurnId||pujaDebugTurn.id});}
              queuePcm(inline.data,activeVoiceTurnId||pujaDebugTurn.id);
            }
          }
        }

        if(s.turnComplete){
          window.clearTimeout(window.__pujaLiveResponseWatch);
          responsePending=false;
          if(activeVoiceTurnId){
            if(!pujaDebugTurn||pujaDebugTurn.id!==activeVoiceTurnId){
              pujaDebug("late_turn_complete_ignored",{turnId:activeVoiceTurnId||null});
              return;
            }
            pujaDebugTurn.turnCompletePerfMs=performance.now();
            pujaDebug("turn_complete",{turnId:activeVoiceTurnId,generationCount:pujaDebugTurn.generationCount});
            if(outputText)addLink(outputText);
            outputRow=null;outputText="";inputRow=null;activeVoiceTurnId=null;
            setState(null,listening?"Listening…":"Gemini Live · ready");
            pujaDebugFinishTurn();pujaDebugTurn=null;
            if(voiceRecognitionWanted)startSpeechRecognitionCycle();
          }else{
            if(outputText)addLink(outputText);
            outputRow=null;outputText="";inputRow=null;
            setState(null,listening?"Listening…":"Gemini Live · ready");
          }
        }
      };

      ws.onerror=(event)=>{
        if(socket!==ws)return;

        clearTimeout(timeout);
        setupReady=false;
        connecting=false;

        console.error("Puja Live WebSocket error",event);

        setState(null,"Puja Live WebSocket error");

        fail(new Error("Puja Live WebSocket error. Check the browser console for the underlying connection error."));
      };

      ws.onclose=event=>{
        if(socket!==ws)return;

        const wasReady=setupReady;

        clearTimeout(timeout);
        connecting=false;
        setupReady=false;
        socket=null;

        if(!wasReady&&!settled){
          fail(
            new Error(
              `Gemini Live closed before setup completed (code ${event.code}${event.reason?`: ${event.reason}`:""}).`
            )
          );
        }

        if(!closedByUser&&reconnectRequested){
          reconnectRequested=false;
          clearTimeout(reconnectTimer);
          reconnectTimer=setTimeout(()=>{
            reconnectTimer=null;
            ensureSocket().catch(e=>{console.warn("Puja Live session resumption reconnect failed",e);setState(null,"Gemini Live · disconnected");});
          },100);
        }else if(!closedByUser){
          setState(null,"Gemini Live · disconnected");
        }
      };
    })).catch(e=>{
      connecting=false;
      setupReady=false;
      if(socket&&socket.readyState!==WebSocket.OPEN){
        socket=null;
      }
      throw e;
    });
  }

  function scheduleVoiceGrounding(reason){
    if(!voiceSpeechEnded)return;
    if(voiceGroundingTimer)clearTimeout(voiceGroundingTimer);
    const delay=pendingVoiceTranscript?80:450;
    pujaDebug("grounding_wait",{reason,delayMs:delay,transcript:pujaDebugTurn?.transcript||pendingVoiceTranscript});
    voiceGroundingTimer=setTimeout(()=>{
      voiceGroundingTimer=null;
      const transcript=pujaDebugTurn?.transcript||pendingVoiceTranscript;
      if(transcript)groundVoiceTurnFromTranscript(transcript);
    },delay);
  }

  async function groundVoiceTurnFromTranscript(value){
    const q=String(value||"").trim();
    if(!q)return;
    // Recognition is independent of Gemini Live. If the browser captured the
    // question before Live is ready, establish the Live session now rather
    // than silently dropping the transcript.
    // Use the reliable HTTP response path while Gemini 3.8 Live is unstable.
    if(!voiceRecognitionWanted)return;
    const now=performance.now();
    if(q===lastVoiceTranscript&&now-lastVoiceTranscriptPerfMs<2500){
      pujaDebug("duplicate_voice_transcript_ignored",{transcript:q});
      return;
    }
    if(responsePending){
      pujaDebug("voice_turn_ignored_while_response_pending",{transcript:q,responseSerial});
      return;
    }
    lastVoiceTranscript=q;lastVoiceTranscriptPerfMs=now;
    responsePending=true;responseSerial++;
    const turn=pujaDebugNewTurn("voice");
    activeVoiceTurnId=turn.id;
    turn.speechEndPerfMs=turn.speechEndPerfMs??performance.now();
    turn.transcript=q;
    turn.transcriptParts=[q];
    turn.outboundGenerations=1;
    try{
      const qctx=await getQuestionContext(q);
      pujaDebug("voice_fallback_send",{turnId:turn.id,transcript:q,matchCount:qctx.matches.length,smallTalk:!!qctx.smallTalk});
      await sendFallbackText(q);
      responsePending=false;
      activeVoiceTurnId=null;
      pujaDebugFinishTurn();pujaDebugTurn=null;
      setState(null,"Listening…");
    }catch(e){
      responsePending=false;
      activeVoiceTurnId=null;
      console.warn("Puja voice response failed",e);
      addMessage(e.message||"Puja is temporarily unavailable. Please try again.","bot");
      setState(null,"Puja · unavailable");
    }
  }

  async function sendGroundedVoiceTurn(value){
    const qctx=await getQuestionContext(value);
    if(!qctx.smallTalk&&!qctx.matches.length){
      suppressPlayback=false;
      addMessage(noKnowledgeAnswer(),"bot");
      setState(null,"Puja · ready");
      return;
    }

    await ensureSocket();
    await resumeOutput();
    if(responsePending)return;
    responsePending=true;responseSerial++;
    suppressPlayback=false;
    socket.send(JSON.stringify({clientContent:{turns:[{role:"user",parts:[{text:"Answer the visitor using ONLY the authoritative published Sage Harvest website knowledge supplied below. This is the grounded voice-answer turn. Do not use outside knowledge, assumptions or general Gemini knowledge. Preserve the existing Puja persona and guardrails. If the supplied website entries do not clearly answer the question, say so and direct the visitor to contact.html. Do not invent vacancies, clients, results, fees, offices, commitments or dates.\n\n"+qctx.context+"\n\nVisitor question: "+value}]}],turnComplete:true}}));
    setState(null,"Puja is thinking…");
  }

  function scheduleLiveResponseWatch(serial, value, qctx){
    window.clearTimeout(window.__pujaLiveResponseWatch);
    window.__pujaLiveResponseWatch=window.setTimeout(async()=>{
      if(!responsePending||responseSerial!==serial)return;
      console.warn("Puja Live response timeout",{serial,value});
      responsePending=false;
      activeVoiceTurnId=null;
      outputRow=null;
      outputText="";
      setState(null,"Puja · switching to backup response…");
      try{
        await sendFallbackText(value);
      }catch(e){
        console.warn("Puja backup response failed",e);
        addMessage("Puja is temporarily unavailable. Please try again in a moment.","bot");
        setState(null,"Puja · unavailable");
      }
    },7000);
  }

  async function sendTextTurn(text){
    const value=String(text||"").trim();if(!value)return;
    addMessage(value,"user");
    try{
      const qctx=await getQuestionContext(value);
      if(!qctx.smallTalk&&!qctx.matches.length){addMessage(noKnowledgeAnswer(),"bot");setState(null,"Puja · ready");return;}
      inputRow=null;
      if(responsePending)return;
      responsePending=true;responseSerial++;
      await sendFallbackText(value);
      responsePending=false;
      setState(null,"Puja · ready");
    }catch(e){
      console.warn("Puja Live unavailable; trying compatible text mode",e);
      setState(null,"Switching to compatible voice mode…");
      try{await sendFallbackText(value);}
      catch(fallbackError){addMessage(fallbackError.message||"Puja is temporarily unavailable. Please try again.", "bot");setState(null,"Puja · unavailable");}
    }
  }

  function floatTo16BitBase64(float32){
    const pcm=new Int16Array(float32.length);
    for(let i=0;i<float32.length;i++){
      const sample=Math.max(-1,Math.min(1,float32[i]));
      pcm[i]=sample<0?sample*0x8000:sample*0x7fff;
    }
    const bytes=new Uint8Array(pcm.buffer);
    let binary="";
    const chunkSize=0x8000;
    for(let i=0;i<bytes.length;i+=chunkSize){
      binary+=String.fromCharCode(...bytes.subarray(i,i+chunkSize));
    }
    return btoa(binary);
  }

  function downsampleTo16k(buffer,inputRate){
    if(inputRate===INPUT_RATE)return buffer;
    const ratio=inputRate/INPUT_RATE;
    const newLength=Math.round(buffer.length/ratio);
    const result=new Float32Array(newLength);
    let offset=0;
    for(let i=0;i<newLength;i++){
      const nextOffset=Math.min(buffer.length,Math.round((i+1)*ratio));
      let sum=0,count=0;
      for(let j=offset;j<nextOffset;j++){sum+=buffer[j];count++;}
      result[i]=count?sum/count:0;
      offset=nextOffset;
    }
    return result;
  }

  async function startMicrophone(){
    if(voiceRecognitionWanted||listening||voiceRecognitionStarting)return;
    const SpeechRecognitionClass=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SpeechRecognitionClass){addMessage("Voice input isn't supported in this browser. Please use the text box below.","bot");setState(null,"Puja · text input ready");return;}
    // Activate the control immediately on the user's click. Do not make the
    // visual/button state depend on the asynchronous Gemini Live connection.
    voiceRecognitionWanted=true;
    mic?.setAttribute("data-voice-enabled","true");
    mic?.classList.add("active");
    mic?.setAttribute("aria-pressed","true");
    try{
      // Start browser recognition without waiting for Gemini Live.
      if(!voiceRecognition){
        voiceRecognition=new SpeechRecognitionClass();
        voiceRecognition.continuous=true;voiceRecognition.interimResults=true;voiceRecognition.lang="en-US";voiceRecognition.maxAlternatives=1;
        voiceRecognition.onstart=()=>{listening=true;voiceRecognitionStarting=false;mic?.classList.add("active");mic?.setAttribute("aria-pressed","true");setState("listening","Listening…");};
        voiceRecognition.onresult=event=>{
          let interim="",finalText="";
          for(let i=event.resultIndex;i<event.results.length;i++){
            const result=event.results[i],text=result?.[0]?.transcript?.trim()||"";
            if(result.isFinal)finalText+=(finalText?" ":"")+text;else interim+=(interim?" ":"")+text;
          }
          const liveSpeech=(finalText+" "+interim).trim();
          if(responsePending&&liveSpeech){
            const normalized=liveSpeech.toLowerCase().replace(/[^a-z\s']/g," ").replace(/\s+/g," ").trim();
            if(/\b(stop|stop talking|stop speaking|stop now|stop it|be quiet|quiet|that's enough|thats enough|enough)\b/.test(normalized)){
              pujaDebug("voice_stop_command",{command:liveSpeech,final:!!event.results[event.results.length-1]?.isFinal});
              stopTalking();
              return;
            }
            // Ignore Puja's own speech/ambient speech while she is answering.
            return;
          }
          if(finalText)voiceRecognition.__finalTranscript=(voiceRecognition.__finalTranscript+" "+finalText).trim();
          const display=((voiceRecognition.__finalTranscript||"")+" "+interim).trim();
          if(display){if(!inputRow)inputRow=addMessage(display,"user");else inputRow.textContent=display;}
        };
        voiceRecognition.onerror=event=>{
          listening=false;voiceRecognitionStarting=false;
          // Keep the mic control visibly active while the user has enabled voice.
          // SpeechRecognition can end/restart underneath the control during Gemini playback.
          if(voiceRecognitionWanted){
            mic?.classList.add("active");
            mic?.setAttribute("aria-pressed","true");
          }
          if(event?.error!=="aborted"&&voiceRecognitionWanted){
            console.warn("Puja speech recognition error",event?.error);
            setTimeout(()=>{
              if(!voiceRecognitionWanted||!voiceRecognition||listening||voiceRecognitionStarting)return;
              if(responsePending){
                try{
                  voiceRecognitionStarting=true;
                  voiceRecognition.__finalTranscript="";
                  voiceRecognition.start();
                }catch(e){
                  voiceRecognitionStarting=false;
                  console.warn("Puja speech recognition restart after error failed",e);
                }
              }else startSpeechRecognitionCycle();
            },350);
          }
        };
        voiceRecognition.onend=async()=>{
          listening=false;voiceRecognitionStarting=false;
          // Do not make the mic appear inactive merely because one recognition
          // segment ended; voice remains enabled until the user toggles it off.
          if(voiceRecognitionWanted){
            mic?.classList.add("active");
            mic?.setAttribute("aria-pressed","true");
          }else{
            mic?.classList.remove("active");
            mic?.setAttribute("aria-pressed","false");
          }
          const transcript=(voiceRecognition.__finalTranscript||"").trim();
          voiceRecognition.__finalTranscript="";
          if(!voiceRecognitionWanted)return;
          if(responsePending){
            // Keep the user-activated recognition session alive while Puja speaks.
            // Do not use startSpeechRecognitionCycle() here because that helper
            // intentionally blocks while responsePending is true.
            setTimeout(()=>{
              if(!voiceRecognitionWanted||!responsePending||listening||voiceRecognitionStarting||!voiceRecognition)return;
              try{
                voiceRecognitionStarting=true;
                voiceRecognition.__finalTranscript="";
                voiceRecognition.start();
              }catch(e){
                voiceRecognitionStarting=false;
                console.warn("Puja speech recognition restart during response failed",e);
              }
            },80);
            return;
          }
          if(transcript){
            try{await groundVoiceTurnFromTranscript(transcript);}
            catch(e){console.warn("Puja voice turn failed",e);addMessage("Puja is temporarily unavailable. Please try again.","bot");}
          }else{
            addMessage("I didn't quite catch that. Could you rephrase?","bot");
          }
          if(voiceRecognitionWanted)startSpeechRecognitionCycle();
        };
      }
      startSpeechRecognitionCycle();
    }catch(e){
      voiceRecognitionWanted=false;listening=false;voiceRecognitionStarting=false;
      mic?.removeAttribute("data-voice-enabled");mic?.classList.remove("active");mic?.setAttribute("aria-pressed","false");
      console.warn("Puja microphone start failed",e);
      addMessage("Voice input could not start in this browser. Please use the text box below.","bot");
    }
  }

  function startSpeechRecognitionCycle(){
    if(!voiceRecognitionWanted||listening||voiceRecognitionStarting||responsePending||!voiceRecognition)return;
    try{
      voiceRecognitionStarting=true;voiceRecognition.__finalTranscript="";voiceRecognition.start();
    }catch(e){
      voiceRecognitionStarting=false;
      setTimeout(()=>{if(voiceRecognitionWanted&&!responsePending&&!listening)startSpeechRecognitionCycle();},400);
    }
  }

  function stopMicrophone(){
    voiceRecognitionWanted=false;listening=false;voiceRecognitionStarting=false;
    mic?.removeAttribute("data-voice-enabled");
    const recognition=voiceRecognition;
    try{recognition?.stop();}catch(_){try{recognition?.abort();}catch(__){}}
    voiceRecognition=null;window.__pujaSpeechRecognition=null;
    mic?.classList.remove("active");mic?.setAttribute("aria-pressed","false");
    setState(null,socket&&socket.readyState===WebSocket.OPEN?"Gemini Live · ready":"Puja · ready");
  }

  function stopTalking(){
    stopMicrophone();
    stopPlayback();
    voiceMuted=true;
    try{sessionStorage.setItem("pujaVoiceMuted","true");}catch(_){}
    if(stopBtn)stopBtn.textContent="Resume voice";
    setState(null,listening?"Listening…":"Voice muted · ready");
  }

  function toggleMicrophone(){primeAudio();if(voiceRecognitionWanted)stopMicrophone();else startMicrophone();}
  async function openPanel(){
    try{
      primeAudio();
      voiceMuted=false;
      try{sessionStorage.removeItem("pujaVoiceMuted");}catch(_){}
      if(stopBtn)stopBtn.textContent="Stop voice";
      closedByUser=false;

      // The Ask Puja button itself is a direct user gesture. Start browser
      // speech recognition immediately, before any async Live connection work,
      // so the browser can associate microphone permission with that gesture.
      startMicrophone();

      setState(null,"Starting Puja…");
      await ensureSocket();
    }catch(e){
      console.error("Puja session start failed",e);
      addMessage("Puja is temporarily unavailable. Please try again in a moment.","bot");
      setState(null,"Puja · unavailable");
    }
  }
  function closePanel(){
    try{
      stopMicrophone();
      stopPlayback();
      closedByUser=true;
      if(socket)try{socket.close();}catch(_){}
      socket=null;
      setupReady=false;
      connecting=false;
      suppressPlayback=false;
    }catch(e){
      console.error("Puja session close failed",e);
    }
  }
  window.addEventListener("puja:open",openPanel);
  if(PUJA_DEBUG){
    setTimeout(()=>pujaDebugRenderVoiceState(),0);
  }
  pujaDebug("diagnostics_loaded",{enabled:PUJA_DEBUG,debugUrl:PUJA_DEBUG?window.location.href:null});
  window.addEventListener("puja:close",closePanel);
  mic?.addEventListener("click",toggleMicrophone);
  stopBtn?.addEventListener("click",()=>{if(voiceMuted){voiceMuted=false;try{sessionStorage.removeItem("pujaVoiceMuted");}catch(_){}stopBtn.textContent="Stop voice";setState(null,"Voice enabled · ready");}else stopTalking();});
  form.addEventListener("submit",e=>{e.preventDefault();const t=input.value.trim();input.value="";if(t)sendTextTurn(t);});
  document.querySelectorAll("[data-puja-question]").forEach(b=>b.addEventListener("click",()=>sendTextTurn(b.getAttribute("data-puja-question")||"")));
  setState(null,"Gemini Live · ready");
})();