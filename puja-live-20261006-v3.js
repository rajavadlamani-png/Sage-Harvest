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

  async function ensureSocket(){
    await ensureKnowledge();
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
            pendingVoiceTranscript=t;
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
    suppressPlayback=false;
    socket.send(JSON.stringify({clientContent:{turns:[{role:"user",parts:[{text:"Answer the visitor using ONLY the authoritative published Sage Harvest website knowledge supplied below. This is the grounded voice-answer turn. Do not use outside knowledge, assumptions or general Gemini knowledge. Preserve the existing Puja persona and guardrails. If the supplied website entries do not clearly answer the question, say so and direct the visitor to contact.html. Do not invent vacancies, clients, results, fees, offices, commitments or dates.\n\n"+qctx.context+"\n\nVisitor question: "+value}]}],turnComplete:true}}));
    setState(null,"Puja is thinking…");
  }

  async function sendTextTurn(text){
    const value=String(text||"").trim();if(!value)return;
    addMessage(value,"user");
    try{
      const qctx=await getQuestionContext(value);
      if(!qctx.smallTalk&&!qctx.matches.length){addMessage(noKnowledgeAnswer(),"bot");setState(null,"Puja · ready");return;}
      await ensureSocket();await resumeOutput();inputRow=null;
      socket.send(JSON.stringify({clientContent:{turns:[{role:"user",parts:[{text:"Answer the visitor using the authoritative Sage Harvest website knowledge already supplied in the live session. For factual content, use only the current matched published-site entries below. Preserve the existing Puja persona and guardrails. If the supplied entries do not clearly answer the question, say so and direct the visitor to contact.html. Do not invent vacancies, clients, results, fees or commitments.\n\n"+qctx.context+"\n\nVisitor question: "+value}]}],turnComplete:true}}));
      setState(null,"Puja is thinking…");
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
    if(listening)return;
    try{
      if(!navigator.mediaDevices?.getUserMedia){
        throw new Error("Microphone access is not supported by this browser.");
      }

      // Ask for the browser microphone permission first, then make sure
      // Gemini Live is fully ready before any audio frames are produced.
      microphoneStream=await navigator.mediaDevices.getUserMedia({
        audio:{
          channelCount:1,
          echoCancellation:true,
          noiseSuppression:true,
          autoGainControl:true
        }
      });

      await ensureSocket();

      const AudioContextClass=window.AudioContext||window.webkitAudioContext;
      if(!AudioContextClass)throw new Error("Microphone audio is not supported by this browser.");

      microphoneContext=new AudioContextClass();
      if(microphoneContext.state==="suspended")await microphoneContext.resume();

      microphoneSource=microphoneContext.createMediaStreamSource(microphoneStream);
      microphoneProcessor=microphoneContext.createScriptProcessor(4096,1,1);
      const silentGain=microphoneContext.createGain();
      silentGain.gain.value=0;

      microphoneProcessor.onaudioprocess=event=>{
        if(!listening||!socket||socket.readyState!==WebSocket.OPEN||!setupReady)return;

        const inputBuffer=event.inputBuffer.getChannelData(0);
        const pcm16k=downsampleTo16k(inputBuffer,microphoneContext.sampleRate);
        const data=floatTo16BitBase64(pcm16k);
        if(!data)return;

        try{
          socket.send(JSON.stringify({
            realtimeInput:{
              audio:{
                mimeType:"audio/pcm;rate=16000",
                data
              }
            }
          }));
        }catch(e){
          console.warn("Puja microphone audio could not be sent",e);
        }
      };

      microphoneSource.connect(microphoneProcessor);
      microphoneProcessor.connect(silentGain);
      silentGain.connect(microphoneContext.destination);

      listening=true;
      groundVoiceTurn=false;
      voiceGroundingSent=false;
      pendingVoiceTranscript="";
      // Use the single Live turn for natural low-latency conversation.
      mic?.classList.add("active");
      mic?.setAttribute("aria-pressed","true");
      setState("listening","Listening…");
    }catch(e){
      console.warn("Puja microphone could not start",e);
      stopMicrophone();
      setState(null,"Microphone unavailable");
      addMessage(e?.message||"Microphone access is unavailable. Please check browser microphone permission.","bot");
    }
  }

  function stopMicrophone(){
    const wasListening=listening;
    listening=false;
    // Keep groundVoiceTurn and pendingVoiceTranscript alive until Gemini
    // emits turnComplete; that is when the final transcript is grounded
    // against the published Sage Harvest knowledge.
    

    // Explicitly close the current realtime audio turn so Gemini can finalize
    // the user's speech even when server-side VAD has not fired yet.
    if(wasListening&&socket&&socket.readyState===WebSocket.OPEN&&setupReady){
      try{
        socket.send(JSON.stringify({realtimeInput:{audioStreamEnd:true}}));
      }catch(_){}
    }

    mic?.classList.remove("active");
    mic?.setAttribute("aria-pressed","false");
    try{microphoneProcessor?.disconnect();}catch(_){}
    try{microphoneSource?.disconnect();}catch(_){}
    try{microphoneStream?.getTracks().forEach(track=>track.stop());}catch(_){}
    if(microphoneContext){
      try{microphoneContext.close();}catch(_){}
    }
    microphoneProcessor=null;
    microphoneSource=null;
    microphoneStream=null;
    microphoneContext=null;
    setState(null,socket&&socket.readyState===WebSocket.OPEN?"Gemini Live · ready":"Puja · ready");
  }

  function stopTalking(){
    stopPlayback();
    voiceMuted=true;
    try{sessionStorage.setItem("pujaVoiceMuted","true");}catch(_){}
    if(stopBtn)stopBtn.textContent="Resume voice";
    setState(null,listening?"Listening…":"Voice muted · ready");
  }

  function toggleMicrophone(){primeAudio();if(listening)stopMicrophone();else startMicrophone();}
  function openPanel(){
    primeAudio();
    voiceMuted=false;
    try{sessionStorage.removeItem("pujaVoiceMuted");}catch(_){}
    if(stopBtn)stopBtn.textContent="Stop voice";
    panel.inert=false;panel.classList.add("open");suppressPlayback=false;panel.setAttribute("aria-hidden","false");launcher.setAttribute("aria-expanded","true");closedByUser=false;
    ensureSocket().catch(e=>{console.warn("Puja Live connection unavailable",e);setState(null,"Compatible voice mode available");});
  }
  function closePanel(){stopMicrophone();stopPlayback();panel.classList.remove("open");panel.setAttribute("aria-hidden","true");panel.inert=true;launcher.setAttribute("aria-expanded","false");closedByUser=true;launcher.focus();if(socket)try{socket.close();}catch(_){}socket=null;setupReady=false;connecting=false;suppressPlayback=false;}
  launcher.addEventListener("click",openPanel);close?.addEventListener("click",closePanel);mic?.addEventListener("click",toggleMicrophone);
  stopBtn?.addEventListener("click",()=>{if(voiceMuted){voiceMuted=false;try{sessionStorage.removeItem("pujaVoiceMuted");}catch(_){}stopBtn.textContent="Stop voice";setState(null,"Voice enabled · ready");}else stopTalking();});
  form.addEventListener("submit",e=>{e.preventDefault();const t=input.value.trim();input.value="";if(t)sendTextTurn(t);});
  document.querySelectorAll("[data-puja-question]").forEach(b=>b.addEventListener("click",()=>sendTextTurn(b.getAttribute("data-puja-question")||"")));
  setState(null,"Gemini Live · ready");
})();