(() => {
  "use strict";
  const LIVE_TOKEN_URL = "https://sageharvest-puja.raja-vadlamani.workers.dev/live-token";
  const MODEL = "models/gemini-3.8-live";
  const VOICE = "Kore";
  const SITE_KNOWLEDGE = "You are Puja, the AI guide for Sage Harvest Agro Pvt. Limited. Answer helpfully, professionally and concisely using this authoritative website knowledge. Never claim a role is vacant unless the website explicitly lists a live vacancy. Distinguish illustrative/anonymised case perspectives from named client engagements. Do not invent client names, results, fees, guarantees, credentials, legal advice or commitments. If the site does not provide an answer, say so and invite the visitor to contact Sage Harvest.\n\nIDENTITY, PURPOSE, VISION AND MISSION: Sage Harvest Agro Pvt. Limited is an independent, practitioner-led advisory practice focused on seed and agri-business supply chains, transformation and practical decision support. Purpose: Make complexity actionable. Vision: A stronger, more resilient seed ecosystem. Mission: Bring strategy closer to execution. Goals: resilience, performance, intelligence and responsible growth. About page: about.html.\n\nFOUNDER: Raja Vadlamani is Founder & Principal Advisor with nearly four decades of experience across the seed and agri-business ecosystem, including supply-chain leadership, seed production, processing, quality, warehousing, inventory, transformation and strategic initiatives. Career experience includes Corteva, Advanta, Shriram Bioseed and SeedWorks International. Founder page: founder.html.\n\nSERVICES: (1) Seed Supply Chain Strategy: production planning, processing, quality, inventory, distribution, operating models and performance. (2) Digital & AI: analytics, forecasting, satellite imagery, weather intelligence, traceability and decision support. (3) Sustainability & Climate: climate resilience, resource efficiency, carbon/MRV readiness. (4) International Expansion & Trade: market opportunity, export readiness, partners and cross-border supply chains. (5) M&A Supply Chain Due Diligence: operating model, capacity, infrastructure, inventory/working capital, quality, traceability, sustainability exposure, operational risks and improvement potential. Pages: services.html, digital-ai.html, sustainability.html, international-expansion.html, ma-due-diligence.html.\n\nCAREERS & COLLABORATION: careers.html invites experienced professionals, specialist advisors and strategic partners to express interest in collaborating with Sage Harvest. This is a developing specialist advisory practice; collaboration may be project-based, assignment-specific or strategic depending on client needs and mutual fit. Associate consultants may contribute in seed production/supply chain, processing/quality/operations, procurement/warehousing/logistics and performance improvement. Subject-matter experts may cover AI/analytics/digital agriculture, sustainability/climate/carbon MRV, seed quality/traceability/assurance and M&A due diligence/risk. Strategic partners may include consulting firms, research/academic institutions, agritech providers and international trade/market partners. Process: share expertise and interests; explore fit, scope and availability if relevant; agree engagement terms. This is not a promise of a current job opening or guaranteed assignment. Direct interested visitors to careers.html and contact.html.\n\nCASE PERSPECTIVES: case-studies.html contains selected anonymised or illustrative perspectives, not necessarily disclosed client engagements. Example: Cotton Hybrid Quality Risk uses lot-level data, Chi-square and two-proportion tests to examine whether quality failures are concentrated in a production/genetic segment and help target root-cause investigation. Other themes include greenfield seed infrastructure/operating models and demand forecasting. Never present illustrative examples as verified client case studies or promise results.\n\nPROFESSIONAL STANDARDS: professional-standards.html describes independence, evidence-led recommendations, professional judgement, acknowledging uncertainty, identifying/addressing conflicts and the client's responsibility for decisions. No guaranteed outcomes are promised. Engagement scope, deliverables, confidentiality and fees are agreed in engagement documentation. Website information is general and not a substitute for engagement-specific professional, legal, financial, tax or regulated advice. Confidentiality: confidentiality.html.\n\nCONTACT: contact.html offers a starting point for supply-chain transformation, Digital & AI, Sustainability & Climate, M&A due diligence, international expansion/trade and strategic/leadership advisory for CXOs, boards, investors and leadership teams. Usual process: share challenge, understand context and desired outcomes, then define scope/deliverables/timeline. Do not invent email addresses, phone numbers, response times or prices; direct visitors to contact.html.\n\nSAGE HARVEST LABS: labs.html covers forecasting/decision intelligence, satellite/geospatial intelligence, climate assessment and MRV tools, digital supply-chain architecture and decision systems, the developing Rice Seed Climate Ledger concept and the Seed Industry Carbon Reduction Calculator.\n\nINSIGHTS: insights.html curates articles and perspectives by Raja Vadlamani on seed supply chains, AI, climate resilience, digital traceability, satellite intelligence and global opportunity; originals may be hosted on LinkedIn.\n\nUse exact official page names. For career questions, explain collaboration pathways and that no current vacancy is promised. For case-study questions, clarify illustrative/anonymised status. For engagement enquiries, suggest the relevant service page and contact.html. Do not recite the whole knowledge base.";
  const INPUT_RATE = 16000, OUTPUT_RATE = 24000;
  const $ = id => document.getElementById(id);
  const panel=$("pujaPanel"), launcher=$("pujaLauncher"), close=$("pujaClose"), form=$("pujaForm"),
        input=$("pujaInput"), messages=$("pujaMessages"), mic=$("pujaMic"),
        avatar=$("pujaAvatar"), mini=$("pujaMiniAvatar"), status=$("pujaStatus"), stopBtn=$("pujaStopSpeaking");
  if(!panel||!launcher||!form||!input||!messages)return;

  let socket=null, setupReady=false, connecting=false, suppressPlayback=false;
  let voiceMuted=false;
  try{voiceMuted=sessionStorage.getItem("pujaVoiceMuted")==="true";}catch(_){}
  let outputContext=null, playbackSources=new Set(), nextPlayTime=0;
  let microphoneContext=null, microphoneStream=null, microphoneSource=null, microphoneProcessor=null;
  let listening=false, outputRow=null, outputText="", inputRow=null, closedByUser=false;
  let audioChunksThisTurn=0;

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
      ["careers","careers.html","Explore Careers & Collaboration →"],["case","case-studies.html","Explore Case Perspectives →"],["standards","professional-standards.html","Explore Professional Standards →"],["purpose","about.html","Explore Purpose, Vision & Mission →"],["services","services.html","Explore Services →"],["digital","digital-ai.html","Explore Digital & AI →"],
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
    const response=await fetch("https://sageharvest-puja.raja-vadlamani.workers.dev/",{
      method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:"Answer the visitor using this official Sage Harvest website knowledge. Treat it as the source of truth; do not invent vacancies, clients, outcomes or terms.\n\n"+SITE_KNOWLEDGE+"\n\nVisitor question: "+value})
    });
    const data=await response.json();
    if(!response.ok||!data.answer)throw new Error(data.error||"Puja could not answer right now. Please try again.");
    addMessage(data.answer,"bot");addLink(data.answer);speakFallback(data.answer);
    setState(null,"Text voice mode · ready");
  }
  async function playPcm(b64){
    if(!b64)return;await resumeOutput();
    const bytes=b64bytes(b64),pcm=new Int16Array(bytes.buffer,bytes.byteOffset,Math.floor(bytes.byteLength/2));
    const buffer=outputContext.createBuffer(1,pcm.length,OUTPUT_RATE),channel=buffer.getChannelData(0);
    for(let i=0;i<pcm.length;i++)channel[i]=pcm[i]/32768;
    const source=outputContext.createBufferSource();source.buffer=buffer;source.connect(outputContext.destination);
    nextPlayTime=Math.max(nextPlayTime,outputContext.currentTime+0.02);source.start(nextPlayTime);nextPlayTime+=buffer.duration;
    playbackSources.add(source);source.onended=()=>{playbackSources.delete(source);if(playbackSources.size===0&&!suppressPlayback){setState(null,listening?"Listening…":"Gemini Live · ready");}};setState("speaking","Puja is speaking · Gemini Live");
  }
  function stopPlayback(){
    for(const source of playbackSources){try{source.stop();}catch(_){}try{source.disconnect();}catch(_){}}
    playbackSources.clear();nextPlayTime=0;setState(null,listening?"Listening…":"Gemini Live · ready");
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

  function ensureSocket(){
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

      ws.onopen=()=>{
        if(socket!==ws)return;

        ws.send(JSON.stringify({
          setup:{
            model:MODEL,
            systemInstruction:{parts:[{text:SITE_KNOWLEDGE}]},
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
            inputAudioTranscription:{},
            outputAudioTranscription:{},
            sessionResumption:{}
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

        const s=m.serverContent;
        if(!s)return;

        if(s.interrupted){
          audioChunksThisTurn=0;
          stopPlayback();
          suppressPlayback=true;
          outputRow=null;
          outputText="";
          return;
        }

        if(s.interimInputTranscription?.text){
          setState("listening","Listening…");
        }

        if(s.inputTranscription?.text){
          const t=s.inputTranscription.text.trim();

          if(t){
            if(!inputRow){
              inputRow=addMessage(t,"user");
            }else{
              inputRow.textContent=t;
            }
          }
        }

        if(s.outputTranscription?.text){
          if(!outputRow){
            outputRow=addMessage("","bot");
          }

          outputText+=s.outputTranscription.text;
          outputRow.textContent=outputText;
          messages.scrollTop=messages.scrollHeight;
        }

        if(!suppressPlayback){
          for(const part of(s.modelTurn?.parts||[])){
            const inline=part?.inlineData||part?.inline_data;

            if(inline?.data){
              audioChunksThisTurn++;
              await playPcm(inline.data);
            }
          }
        }

        if(s.turnComplete){
          if(outputText && audioChunksThisTurn===0){
            console.warn("Puja Live: turn completed with transcription but no audio chunks received.");
          }
          if(outputText)addLink(outputText);

          outputRow=null;
          outputText="";
          inputRow=null;
          suppressPlayback=false;
          audioChunksThisTurn=0;

          setState(
            null,
            listening?"Listening…":"Gemini Live · ready"
          );
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

        if(!closedByUser){
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

  async function sendTextTurn(text){
    const value=String(text||"").trim();if(!value)return;
    addMessage(value,"user");
    try{
      await ensureSocket();await resumeOutput();inputRow=null;
      socket.send(JSON.stringify({clientContent:{turns:[{role:"user",parts:[{text:value}]}],turnComplete:true}}));
      setState(null,"Puja is thinking…");
    }catch(e){
      console.warn("Puja Live unavailable; trying compatible text mode",e);
      setState(null,"Switching to compatible voice mode…");
      try{await sendFallbackText(value);}
      catch(fallbackError){addMessage(fallbackError.message||"Puja is temporarily unavailable. Please try again.","bot");setState(null,"Puja · unavailable");}
    }
  }
  function stopTalking(){
    voiceMuted=true;
    try{sessionStorage.setItem("pujaVoiceMuted","true");}catch(_){}
    suppressPlayback=true;
    stopPlayback();
    if("speechSynthesis" in window)try{window.speechSynthesis.cancel();}catch(_){}
    if(stopBtn)stopBtn.textContent="Enable voice";
    if(socket&&socket.readyState===WebSocket.OPEN)try{socket.send(JSON.stringify({clientContent:{turnComplete:true}}));}catch(_){}
    setState(null,"Voice off · text still available");
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
  function toggleMicrophone(){primeAudio();if(listening)stopMicrophone();else startMicrophone();}
  function openPanel(){
    primeAudio();
    voiceMuted=false;
    try{sessionStorage.removeItem("pujaVoiceMuted");}catch(_){}
    if(stopBtn)stopBtn.textContent="Stop voice";
    panel.classList.add("open");suppressPlayback=false;panel.setAttribute("aria-hidden","false");launcher.setAttribute("aria-expanded","true");closedByUser=false;
    ensureSocket().catch(e=>{console.warn("Puja Live connection unavailable",e);setState(null,"Compatible voice mode available");});
  }
  function closePanel(){stopMicrophone();stopPlayback();panel.classList.remove("open");panel.setAttribute("aria-hidden","true");launcher.setAttribute("aria-expanded","false");closedByUser=true;if(socket)try{socket.close();}catch(_){}socket=null;setupReady=false;connecting=false;suppressPlayback=false;}
  launcher.addEventListener("click",openPanel);close?.addEventListener("click",closePanel);mic?.addEventListener("click",toggleMicrophone);
  stopBtn?.addEventListener("click",()=>{if(voiceMuted){voiceMuted=false;try{sessionStorage.removeItem("pujaVoiceMuted");}catch(_){}stopBtn.textContent="Stop voice";setState(null,"Voice enabled · ready");}else stopTalking();});
  form.addEventListener("submit",e=>{e.preventDefault();const t=input.value.trim();input.value="";if(t)sendTextTurn(t);});
  document.querySelectorAll("[data-puja-question]").forEach(b=>b.addEventListener("click",()=>sendTextTurn(b.getAttribute("data-puja-question")||"")));
  setState(null,"Gemini Live · ready");
})();