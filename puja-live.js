(() => {
  "use strict";
  const LIVE_TOKEN_URL = "https://sageharvest-puja.raja-vadlamani.workers.dev/live-token";
  const MODEL = "models/gemini-3.8-live";
  const VOICE = "Kore";
  const INPUT_RATE = 16000, OUTPUT_RATE = 24000;
  const $ = id => document.getElementById(id);
  const panel=$("pujaPanel"), launcher=$("pujaLauncher"), close=$("pujaClose"), form=$("pujaForm"),
        input=$("pujaInput"), messages=$("pujaMessages"), mic=$("pujaMic"),
        avatar=$("pujaAvatar"), mini=$("pujaMiniAvatar"), status=$("pujaStatus"), stopBtn=$("pujaStopSpeaking");
  if(!panel||!launcher||!form||!input||!messages)return;

  let socket=null, tokenPromise=null, setupReady=false, connecting=false;
  let outputContext=null, playbackSources=new Set(), nextPlayTime=0;
  let microphoneContext=null, microphoneStream=null, microphoneSource=null, microphoneProcessor=null;
  let listening=false, outputRow=null, outputText="", inputRow=null, closedByUser=false;

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
  function addLink(text){
    const n=String(text||"").toLowerCase();
    const links=[
      ["services","services.html","Explore Services →"],["digital","digital-ai.html","Explore Digital & AI →"],
      ["sustainability","sustainability.html","Explore Sustainability & Climate →"],
      ["due","ma-due-diligence.html","Explore Due Diligence →"],["international","international-expansion.html","Explore International Expansion →"],
      ["insights","insights.html","Explore Insights →"],["labs","labs.html","Explore Sage Harvest Labs →"],
      ["founder","founder.html","Meet the Founder →"],["contact","contact.html","Talk to Sage Harvest →"]
    ];
    const hit=links.find(([key])=>n.includes(key)); if(!hit)return;
    const wrap=document.createElement("div");wrap.className="puja-navigation-link";
    const a=document.createElement("a");a.className="puja-inline-link";a.href=hit[1];a.textContent=hit[2];
    wrap.appendChild(a);messages.appendChild(wrap);messages.scrollTop=messages.scrollHeight;
  }
  function b64bytes(b64){const bin=atob(b64),bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);return bytes;}
  async function resumeOutput(){
    if(!outputContext||outputContext.state==="closed")outputContext=new(window.AudioContext||window.webkitAudioContext)({sampleRate:OUTPUT_RATE});
    if(outputContext.state==="suspended")await outputContext.resume();
  }
  async function playPcm(b64){
    if(!b64)return;await resumeOutput();
    const bytes=b64bytes(b64),pcm=new Int16Array(bytes.buffer,bytes.byteOffset,Math.floor(bytes.byteLength/2));
    const buffer=outputContext.createBuffer(1,pcm.length,OUTPUT_RATE),channel=buffer.getChannelData(0);
    for(let i=0;i<pcm.length;i++)channel[i]=pcm[i]/32768;
    const source=outputContext.createBufferSource();source.buffer=buffer;source.connect(outputContext.destination);
    nextPlayTime=Math.max(nextPlayTime,outputContext.currentTime+0.02);source.start(nextPlayTime);nextPlayTime+=buffer.duration;
    playbackSources.add(source);source.onended=()=>playbackSources.delete(source);setState("speaking","Puja is speaking · Gemini Live");
  }
  function stopPlayback(){
    for(const source of playbackSources){try{source.stop();}catch(_){}try{source.disconnect();}catch(_){}}
    playbackSources.clear();nextPlayTime=0;setState(null,listening?"Listening…":"Gemini Live · ready");
  }
  async function getLiveToken(){
    if(!tokenPromise)tokenPromise=fetch(LIVE_TOKEN_URL,{method:"POST",headers:{"Content-Type":"application/json"}})
      .then(async r=>{const d=await r.json();if(!r.ok||!d.token)throw new Error(d.error||"Could not obtain Puja Live token.");return d;})
      .catch(e=>{tokenPromise=null;throw e;});
    return tokenPromise;
  }
  function ensureSocket(){
    if(socket&&socket.readyState===WebSocket.OPEN&&setupReady)return Promise.resolve();
    if(connecting)return new Promise((resolve,reject)=>{const start=Date.now();const wait=()=>{if(socket&&socket.readyState===WebSocket.OPEN&&setupReady)return resolve();if(!connecting&&(!socket||socket.readyState===WebSocket.CLOSED))return reject(new Error("Puja Live connection failed."));if(Date.now()-start>15000)return reject(new Error("Puja Live connection timed out."));setTimeout(wait,50);};wait();});
    connecting=true;setupReady=false;setState(null,"Connecting Puja to Gemini Live…");
    return getLiveToken().then(td=>new Promise((resolve,reject)=>{
      const wsUrl="wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained?access_token="+encodeURIComponent(td.token);
      socket=new WebSocket(wsUrl);
      const timeout=setTimeout(()=>{try{socket.close();}catch(_){}connecting=false;reject(new Error("Puja Live connection timed out."));},15000);
      socket.onopen=()=>socket.send(JSON.stringify({setup:{model:MODEL,generationConfig:{responseModalities:["AUDIO"],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:VOICE}}}},inputAudioTranscription:{},outputAudioTranscription:{}}}));
      socket.onmessage=async event=>{
        let m;try{m=JSON.parse(event.data);}catch(_){return;}
        if(m.setupComplete){clearTimeout(timeout);setupReady=true;connecting=false;setState(null,"Gemini Live · ready");resolve();return;}
        const s=m.serverContent;if(!s)return;
        if(s.interrupted){stopPlayback();return;}
        if(s.interimInputTranscription?.text)setState("listening","Listening…");
        if(s.inputTranscription?.text){const t=s.inputTranscription.text.trim();if(t){if(!inputRow)inputRow=addMessage(t,"user");else inputRow.textContent=t;inputRow=null;}}
        if(s.outputTranscription?.text){if(!outputRow)outputRow=addMessage("","bot");outputText+=s.outputTranscription.text;outputRow.textContent=outputText;messages.scrollTop=messages.scrollHeight;}
        for(const part of(s.modelTurn?.parts||[])){const inline=part?.inlineData||part?.inline_data;if(inline?.data)await playPcm(inline.data);}
        if(s.turnComplete){if(outputText)addLink(outputText);outputRow=null;outputText="";setState(null,listening?"Listening…":"Gemini Live · ready");}
      };
      socket.onerror=()=>{clearTimeout(timeout);connecting=false;setupReady=false;setState(null,"Puja Live connection error");reject(new Error("Puja could not connect to Gemini Live."));};
      socket.onclose=()=>{clearTimeout(timeout);connecting=false;setupReady=false;if(!closedByUser)setState(null,"Gemini Live · disconnected");};
    }));
  }
  async function sendTextTurn(text){
    const value=String(text||"").trim();if(!value)return;
    try{await ensureSocket();await resumeOutput();inputRow=addMessage(value,"user");socket.send(JSON.stringify({clientContent:{turns:[{role:"user",parts:[{text:value}]}],turnComplete:true}}));setState(null,"Puja is thinking…");}
    catch(e){addMessage(e.message||"Puja is temporarily unavailable. Please try again.","bot");setState(null,"Gemini Live · unavailable");}
  }
  function stopTalking(){
    stopPlayback();
    if(socket&&socket.readyState===WebSocket.OPEN)try{socket.send(JSON.stringify({clientContent:{turnComplete:true}}));}catch(_){}
    setState(null,listening?"Listening…":"Gemini Live · ready");
  }
  function downsample(data,inputRate){
    if(inputRate===INPUT_RATE)return data;const ratio=inputRate/INPUT_RATE,newLength=Math.round(data.length/ratio),out=new Float32Array(newLength);let offset=0;
    for(let i=0;i<newLength;i++){const next=Math.min(data.length,Math.round((i+1)*ratio));let sum=0,count=0;for(let j=offset;j<next;j++){sum+=data[j];count++;}out[i]=count?sum/count:0;offset=next;}return out;
  }
  function pcm16(data){const p=new Int16Array(data.length);for(let i=0;i<data.length;i++){const s=Math.max(-1,Math.min(1,data[i]));p[i]=s<0?s*32768:s*32767;}return p;}
  function b64(bytes){let bin="";for(let i=0;i<bytes.length;i+=0x8000)bin+=String.fromCharCode(...bytes.subarray(i,Math.min(i+0x8000,bytes.length)));return btoa(bin);}
  async function startMicrophone(){
    try{
      await ensureSocket();if(!navigator.mediaDevices?.getUserMedia)throw new Error("Microphone access is not available in this browser.");
      await resumeOutput();microphoneStream=await navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
      microphoneContext=new(window.AudioContext||window.webkitAudioContext)();await microphoneContext.resume();
      microphoneSource=microphoneContext.createMediaStreamSource(microphoneStream);microphoneProcessor=microphoneContext.createScriptProcessor(4096,1,1);
      microphoneProcessor.onaudioprocess=e=>{if(!listening||!socket||socket.readyState!==WebSocket.OPEN)return;const d=downsample(e.inputBuffer.getChannelData(0),microphoneContext.sampleRate),p=pcm16(d);socket.send(JSON.stringify({realtimeInput:{audio:{data:b64(new Uint8Array(p.buffer)),mimeType:"audio/pcm;rate=16000"}}}));};
      microphoneSource.connect(microphoneProcessor);microphoneProcessor.connect(microphoneContext.destination);listening=true;mic?.classList.add("active");mic?.setAttribute("aria-pressed","true");setState("listening","Listening…");
    }catch(e){stopMicrophone();addMessage(e.message||"Microphone access could not be started.","bot");setState(null,"Gemini Live · ready");}
  }
  function stopMicrophone(){
    listening=false;mic?.classList.remove("active");mic?.setAttribute("aria-pressed","false");
    try{if(socket&&socket.readyState===WebSocket.OPEN)socket.send(JSON.stringify({realtimeInput:{audioStreamEnd:true}}));}catch(_){}
    try{microphoneProcessor?.disconnect();}catch(_){}try{microphoneSource?.disconnect();}catch(_){}try{microphoneContext?.close();}catch(_){}
    microphoneProcessor=null;microphoneSource=null;microphoneContext=null;
    if(microphoneStream){for(const t of microphoneStream.getTracks())t.stop();microphoneStream=null;}
    setState(null,"Gemini Live · ready");
  }
  function toggleMicrophone(){if(listening)stopMicrophone();else startMicrophone();}
  function openPanel(){panel.classList.add("open");panel.setAttribute("aria-hidden","false");launcher.setAttribute("aria-expanded","true");closedByUser=false;ensureSocket().catch(e=>addMessage(e.message||"Puja is temporarily unavailable.","bot"));}
  function closePanel(){stopMicrophone();stopPlayback();panel.classList.remove("open");panel.setAttribute("aria-hidden","true");launcher.setAttribute("aria-expanded","false");closedByUser=true;if(socket)try{socket.close();}catch(_){}socket=null;setupReady=false;}
  launcher.addEventListener("click",openPanel);close?.addEventListener("click",closePanel);mic?.addEventListener("click",toggleMicrophone);stopBtn?.addEventListener("click",stopTalking);
  form.addEventListener("submit",e=>{e.preventDefault();const t=input.value.trim();input.value="";if(t)sendTextTurn(t);});
  document.querySelectorAll("[data-puja-question]").forEach(b=>b.addEventListener("click",()=>sendTextTurn(b.getAttribute("data-puja-question")||"")));
  setState(null,"Gemini Live · ready");
})();