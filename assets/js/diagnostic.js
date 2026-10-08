
(function(){
  var dimensions=[
    {key:'demand',name:'Demand & Market Planning',short:'Demand & Market',weight:.10},
    {key:'production',name:'Seed Production Planning',short:'Seed Production',weight:.15},
    {key:'procurement',name:'Procurement & Parent Seed',short:'Procurement & Parent Seed',weight:.08},
    {key:'quality',name:'Quality Management',short:'Quality Management',weight:.12},
    {key:'processing',name:'Processing & Capacity',short:'Processing & Capacity',weight:.08},
    {key:'inventory',name:'Inventory & Working Capital',short:'Inventory & Working Capital',weight:.10},
    {key:'data',name:'Traceability & Data',short:'Traceability & Data',weight:.10},
    {key:'intelligence',name:'Decision Intelligence',short:'Decision Intelligence',weight:.12},
    {key:'resilience',name:'Resilience & Risk',short:'Resilience & Risk',weight:.10},
    {key:'sustainability',name:'Sustainability & Carbon',short:'Sustainability & Carbon',weight:.05}
  ];
  var levelNames=['Reactive','Structured','Integrated','Intelligent','Adaptive'];
  var questions=[
    ['demand','How reliably can your organisation translate market demand into hybrid/SKU-level seed requirements?','Mainly based on judgement and previous-year sales','Formal forecasts exist but are largely manual','Demand planning integrates sales and supply information','Forecasts incorporate multiple demand signals and scenarios','Demand sensing continuously updates production and supply decisions'],
    ['demand','How effectively do market changes feed back into production planning?','Changes are usually addressed after they become apparent','Changes are communicated but manually adjusted','Sales and production teams regularly reconcile changes','Scenario analysis supports production reallocation','Production plans dynamically adapt to changing market signals'],
    ['demand','How confident are you in identifying demand risk before the production cycle is committed?','Very little visibility','Risk is identified mainly through management experience','Key demand risks are formally reviewed','Data-driven scenarios quantify major risks','Predictive models continuously identify emerging demand risk'],
    ['production','How systematically do you allocate production across geography, hybrid and production partner?','Primarily experience-driven','Historical performance is considered','Structured allocation criteria are used','Multiple variables and risk scenarios are analysed','Allocation is dynamically optimised using predictive intelligence'],
    ['production','How effectively do you account for G×E and environmental variability in production planning?','Very limited consideration','Geography is considered mainly from historical experience','Historical geographic performance is incorporated','Weather/environmental signals influence planning','Predictive G×E/environmental models actively guide allocation'],
    ['production','How early can you identify likely production shortfalls?','Usually after harvest or quality results','Some early warning exists through field monitoring','Production progress is periodically assessed','Predictive indicators identify emerging shortfalls','Risk is continuously forecast and corrective action begins early'],
    ['procurement','How reliably can you align parent-seed availability with the production plan?','Shortages frequently emerge late','Planning exists but relies heavily on manual follow-up','Parent requirements are systematically reconciled','Requirements are forecast using production scenarios','Parent availability is dynamically linked to the entire production plan'],
    ['procurement','How well do you understand supplier/production-partner concentration risk?','Little formal visibility','Concentration is known but not quantified','Key dependencies are documented','Risk is measured and scenario-tested','The network is continuously optimised for resilience and performance'],
    ['procurement','How effectively does supplier/production-partner performance feed into future allocation decisions?','Mostly based on individual experience','Historical performance is reviewed periodically','Structured scorecards influence decisions','Performance data drives allocation and risk decisions','Predictive partner-performance models influence future allocation'],
    ['quality','How early can your organisation detect emerging seed-quality risk?','Mainly after final testing','Some intermediate checks exist','Quality is monitored at multiple stages','Early indicators are analysed to predict final quality','Predictive quality intelligence enables proactive intervention'],
    ['quality','How effectively can you trace a quality problem back to its likely root cause?','Investigation is largely manual','Basic lot records exist','Lot and process information can be connected','Data analytics support root-cause analysis','The system learns from historical failures and identifies recurring patterns'],
    ['quality','How effectively do quality outcomes influence future production and processing decisions?','Quality reports mainly serve compliance purposes','Lessons are discussed after the season','Quality results feed subsequent planning','Quality patterns influence allocation and process decisions','Quality intelligence continuously improves the next production cycle'],
    ['processing','How accurately do you understand processing capacity versus planned seed volumes?','Capacity problems become visible during execution','Capacity is estimated annually','Capacity is planned against production volumes','Capacity scenarios are modelled before execution','Capacity is dynamically optimised against changing supply conditions'],
    ['processing','How well can you identify processing bottlenecks before they affect service?','Usually discovered during operations','Experienced managers identify likely bottlenecks','Capacity reviews identify major constraints','Data is used to forecast bottlenecks','Bottlenecks are predicted and proactively rebalanced'],
    ['processing','How effectively do processing losses and recovery rates feed into planning?','Mainly reported after the event','Historical losses are reviewed','Loss rates are incorporated into planning assumptions','Loss patterns are analysed by lot/process','Predictive loss models influence production and processing decisions'],
    ['inventory','How accurately can you see inventory by hybrid, lot, location, quality status and age?','Significant manual reconciliation is required','Information exists across multiple systems/files','Most inventory information is integrated','Near-real-time visibility supports decisions','Inventory intelligence provides predictive visibility and alerts'],
    ['inventory','How systematically do you manage seed ageing and obsolescence risk?','Mainly managed when ageing becomes a problem','Periodic reviews are conducted','Ageing is tracked against defined thresholds','Demand and ageing are jointly analysed','Predictive ageing/obsolescence models guide inventory decisions'],
    ['inventory','How effectively do you balance service-level protection against inventory and working capital?','Availability generally takes priority','Buffer levels are experience-driven','Formal inventory policies exist','Scenario analysis balances service and capital','Inventory is continuously optimised against demand, risk and cash'],
    ['data','How confidently can you trace a seed lot across production, processing, testing, inventory and distribution?','Traceability requires manual investigation','Records exist but are fragmented','End-to-end traceability is generally available','Digital traceability provides rapid visibility','Lot-level data provides real-time decision intelligence'],
    ['data','How reliable is the underlying data used for supply-chain decisions?','Significant manual correction is common','Data quality varies by process/location','Defined data controls exist','Data quality is monitored systematically','Automated validation and exception detection continuously improve data integrity'],
    ['data','How effectively are operational systems connected?','Excel/manual processes dominate','Several systems exist but remain disconnected','Core systems exchange information','Integrated data supports cross-functional analytics','A connected data architecture enables predictive and prescriptive decisions'],
    ['intelligence','How often do supply-chain decisions use predictive analytics rather than historical reporting alone?','Almost never','Some analysis is performed periodically','Analytics support selected decisions','Predictive models support important planning decisions','Predictive intelligence is embedded in routine decision-making'],
    ['intelligence','Can management test what-if scenarios before making major supply decisions?','Mainly through judgement','Manual spreadsheets are used','Structured scenarios are periodically evaluated','Digital models support scenario planning','A decision simulator continuously evaluates alternative strategies'],
    ['intelligence','How effectively does the organisation learn from previous production cycles?','Learning remains largely individual','Post-season reviews are conducted','Lessons are documented and incorporated','Historical data is systematically analysed','The supply chain continuously learns and adapts from each cycle'],
    ['resilience','How systematically do you identify supply-chain risks before the season begins?','Mainly based on management experience','Major risks are discussed periodically','Formal risk registers/plans exist','Quantitative scenarios support risk planning','Risk is continuously monitored using predictive indicators'],
    ['resilience','How prepared are you for a major production failure in a geography, hybrid or supplier?','Limited contingency planning','Some alternative sources are known','Formal contingency plans exist','Alternatives are scenario-tested','The network is designed for rapid reconfiguration'],
    ['resilience','How quickly can management respond when actual conditions diverge from the plan?','Response is largely reactive','Escalation happens through manual communication','Formal exception-management processes exist','Early-warning indicators trigger intervention','Real-time intelligence automatically highlights and prioritises exceptions'],
    ['sustainability','How visible are the environmental impacts of your seed supply chain?','Little or no visibility','Some sustainability information exists','Major environmental impacts are measured','Environmental data influences supply decisions','Environmental impact is embedded in supply-chain optimisation'],
    ['sustainability','How effectively do you connect resource efficiency with supply-chain economics?','Sustainability and cost are largely separate','Selected efficiency initiatives exist','Major resource drivers are tracked','Cost and environmental scenarios are evaluated together','Decisions optimise cost, resilience and environmental impact simultaneously'],
    ['sustainability','How prepared is your organisation to make climate-related supply-chain decisions?','Mainly reactive','Climate risks are recognised but difficult to quantify','Climate risk is included in planning','Climate/weather information supports scenarios','Climate intelligence is integrated into predictive production and supply decisions']
  ];
  var why={
    demand:'Demand decisions determine what the seed supply chain should produce—and how much risk it should carry.',
    production:'Production allocation is a critical driver of seed availability, quality, cost and supply risk.',
    procurement:'Parent seed and partner reliability determine whether the production plan can actually be executed.',
    quality:'Quality intelligence can turn late-stage failure detection into earlier intervention and learning.',
    processing:'Processing capacity and recovery directly affect usable seed, timing and service.',
    inventory:'Seed inventory must balance availability protection with ageing, obsolescence and working capital.',
    data:'Trusted lot-level information is the foundation for traceability, analysis and better decisions.',
    intelligence:'The next step beyond reporting is using data to anticipate outcomes and test decisions before acting.',
    resilience:'Seed supply chains face biological, climatic, geographic and timing risks that require deliberate preparation.',
    sustainability:'Environmental performance increasingly intersects with cost, resilience, resource efficiency and market expectations.'
  };
  var rec={
    demand:['Strengthen demand sensing and scenario-based market planning.','Connect market signals to production commitments before acreage is locked.'],
    production:['Build predictive production-risk visibility across geography, hybrid and partner.','Use historical, environmental and G×E signals to improve production allocation.'],
    procurement:['Build a parent-seed and partner risk view linked to the production plan.','Use partner performance and concentration indicators in future allocation decisions.'],
    quality:['Move from quality reporting toward predictive quality-risk management.','Connect early field and processing signals to lot-level root-cause intelligence.'],
    processing:['Model processing capacity and bottlenecks before they affect service.','Link recovery rates and losses to future production and capacity planning.'],
    inventory:['Connect inventory, demand, ageing and service-level decisions.','Move from stock visibility toward dynamic inventory and working-capital optimisation.'],
    data:['Create a trusted lot-level data foundation across the seed lifecycle.','Prioritise data integrity and system connectivity before adding more analytics.'],
    intelligence:['Establish a decision-intelligence layer for forward-looking supply decisions.','Introduce scenario modelling, predictive indicators and exception-based management.'],
    resilience:['Build a quantified resilience and contingency framework.','Stress-test the supply network against production, supplier, climate and timing shocks.'],
    sustainability:['Connect sustainability metrics with operational and economic decisions.','Build measurable resource and carbon intelligence into supply-chain planning.']
  };
  var state={i:0,answers:new Array(30).fill(null)};
  function $(id){return document.getElementById(id);}
  function level(score){
    if(score<2)return score<1.5?'Critical Gap':'Immediate Attention';
    if(score<2.5)return 'Developing';
    if(score<3)return 'Emerging Capability';
    if(score<3.6)return 'Integrated Capability';
    if(score<4.4)return 'Intelligent Capability';
    return 'Adaptive Capability';
  }
  function maturity(score){
    if(score<2)return 'Reactive';
    if(score<3)return 'Structured';
    if(score<3.6)return 'Integrated';
    if(score<4.4)return 'Intelligent';
    return 'Adaptive';
  }
  function dimScores(){
    return dimensions.map(function(d){
      var vals=[],i;
      for(i=0;i<questions.length;i++) if(questions[i][0]===d.key&&state.answers[i]!=null) vals.push(state.answers[i]);
      var s=vals.reduce(function(a,b){return a+b;},0)/vals.length;
      return {key:d.key,name:d.name,short:d.short,weight:d.weight,score:s};
    });
  }
  function renderQuestion(){
    var q=questions[state.i], d=dimensions.filter(function(x){return x.key===q[0];})[0];
    $('qNumber').textContent='Question '+(state.i+1)+' of 30';
    $('progressText').textContent=Math.round(state.i/30*100)+'%';
    $('progressFill').style.width=(state.i/30*100)+'%';
    $('dimensionNo').textContent=String(dimensions.indexOf(d)+1).padStart(2,'0');
    $('dimensionName').textContent=d.name;
    $('questionText').textContent=q[1];
    $('whyText').textContent=why[q[0]];
    var box=$('options');box.innerHTML='';
    for(var n=1;n<=5;n++){
      var label=document.createElement('label');label.className='diag-option'+(state.answers[state.i]===n?' selected':'');
      label.innerHTML='<input type="radio" name="answer" value="'+n+'"><span class="option-number">'+n+'</span><span><strong>'+levelNames[n-1]+'</strong><small>'+q[n+1]+'</small></span>';
      label.querySelector('input').checked=state.answers[state.i]===n;
      label.querySelector('input').addEventListener('change',(function(value,el){return function(){state.answers[state.i]=value;box.querySelectorAll('.diag-option').forEach(function(x){x.classList.remove('selected');});el.classList.add('selected');$('answerHint').classList.remove('visible');};})(n,label));
      box.appendChild(label);
    }
    $('backBtn').disabled=state.i===0;
    $('nextBtn').textContent=state.i===29?'View My Results →':'Next Question →';
  }
  function start(){ $('intro').hidden=true;$('diagnostic').hidden=false;renderQuestion();window.scrollTo({top:0,behavior:'smooth'}); }
  function next(){
    if(state.answers[state.i]==null){$('answerHint').classList.add('visible');return;}
    if(state.i<29){state.i++;renderQuestion();}else results();
  }
  function back(){if(state.i>0){state.i--;renderQuestion();}}
  function radar(ds){
    var cx=180,cy=180,r=122,n=ds.length,points=function(vals,scale){return vals.map(function(v,i){var a=-Math.PI/2+i*2*Math.PI/n,rr=r*(v/scale);return (cx+Math.cos(a)*rr).toFixed(1)+','+(cy+Math.sin(a)*rr).toFixed(1);}).join(' ');};
    var out='<svg viewBox="0 0 360 360" aria-label="Supply chain maturity radar chart" role="img"><polygon points="'+points(new Array(n).fill(5),5)+'" fill="none" stroke="rgba(23,59,44,.16)"/>';
    [1,2,3,4].forEach(function(v){out+='<polygon points="'+points(new Array(n).fill(v),5)+'" fill="none" stroke="rgba(23,59,44,.10)"/>';});
    ds.forEach(function(d,i){var a=-Math.PI/2+i*2*Math.PI/n,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;out+='<line x1="'+cx+'" y1="'+cy+'" x2="'+x+'" y2="'+y+'" stroke="rgba(23,59,44,.10)"/>';});
    out+='<polygon points="'+points(ds.map(function(d){return d.score;}),5)+'" fill="rgba(47,121,80,.16)" stroke="#2f7950" stroke-width="2.5"/>';
    ds.forEach(function(d,i){var a=-Math.PI/2+i*2*Math.PI/n,x=cx+Math.cos(a)*(r+20),y=cy+Math.sin(a)*(r+20);out+='<text x="'+x+'" y="'+y+'" text-anchor="'+(x<cx-8?'end':x>cx+8?'start':'middle')+'" dominant-baseline="middle">'+d.short+'</text>';});
    return out+'</svg>';
  }
  function insight(ds){
    var data=ds.filter(function(d){return d.key==='data';})[0], intel=ds.filter(function(d){return d.key==='intelligence';})[0], res=ds.filter(function(d){return d.key==='resilience';})[0], prod=ds.filter(function(d){return d.key==='production';})[0], proc=ds.filter(function(d){return d.key==='procurement';})[0];
    var sorted=ds.slice().sort(function(a,b){return b.score-a.score;});
    if(data.score-intel.score>=.7)return 'Your data foundation is ahead of your decision intelligence. The next opportunity is to convert operational information into forward-looking decisions.';
    if(((prod.score+proc.score)/2)-res.score>=.8)return 'Operational capability appears stronger than resilience. The next step is to stress-test how the supply network performs when conditions change.';
    if(sorted[0].score-sorted[sorted.length-1].score>=1.4)return 'Your capability profile is uneven: strong performance in '+sorted[0].name.toLowerCase()+' sits alongside a significant maturity gap in '+sorted[sorted.length-1].name.toLowerCase()+'.';
    return 'Your capability profile is relatively balanced. The next opportunity is to strengthen the lowest-scoring dimensions while building on your existing operating foundation.';
  }
  function results(){
    var ds=dimScores(), overall=ds.reduce(function(s,d){return s+d.score*d.weight;},0), m=maturity(overall), ranked=ds.slice().sort(function(a,b){return b.score-a.score;});
    $('diagnostic').hidden=true;$('results').hidden=false;
    $('overallLabel').textContent=m;$('overallScore').textContent=overall.toFixed(2);$('overallCopy').textContent={Reactive:'Decisions mainly happen after problems emerge.',Structured:'Processes exist, but information and decision-making remain fragmented.',Integrated:'Functions and information are increasingly connected.',Intelligent:'Data actively supports forward-looking decisions.',Adaptive:'The supply chain continuously learns and adapts.'}[m];
    document.querySelectorAll('.maturity-track span').forEach(function(x){x.classList.toggle('active',x.textContent===m);});
    $('profileInsight').textContent=insight(ds);$('radar').innerHTML=radar(ds);
    $('dimensionList').innerHTML=ds.map(function(d){return '<div class="result-row"><span>'+d.name+'</span><strong>'+d.score.toFixed(1)+'</strong><em>'+level(d.score)+'</em></div>';}).join('');
    $('strongList').innerHTML=ranked.slice(0,3).map(function(d,i){return '<article><b>'+(i+1)+'</b><div><strong>'+d.name+'</strong><span>'+d.score.toFixed(1)+' · '+maturity(d.score)+'</span></div></article>';}).join('');
    var gaps=ranked.slice(-3).reverse();
    $('gapList').innerHTML=gaps.map(function(d,i){return '<article><b>'+(i+1)+'</b><div><strong>'+d.name+'</strong><span>'+d.score.toFixed(1)+' · '+level(d.score)+'</span><p>'+rec[d.key][0]+'</p></div></article>';}).join('');
    $('moveList').innerHTML=gaps.map(function(d,i){return '<article class="move-card"><b>0'+(i+1)+'</b><div><strong>'+rec[d.key][0]+'</strong><p>'+rec[d.key][1]+'</p></div></article>';}).join('');
    var data=ds.filter(function(d){return d.key==='data';})[0],intel=ds.filter(function(d){return d.key==='intelligence';})[0],res=ds.filter(function(d){return d.key==='resilience';})[0],prod=ds.filter(function(d){return d.key==='production';})[0],proc=ds.filter(function(d){return d.key==='procurement';})[0],derived=[];
    if(data.score-intel.score>=.7)derived.push(['Decision Gap','Data & traceability capability is '+(data.score-intel.score).toFixed(1)+' points ahead of decision intelligence.']);
    if(((prod.score+proc.score)/2)-res.score>=.8)derived.push(['Resilience Gap','Operational capability is '+(((prod.score+proc.score)/2)-res.score).toFixed(1)+' points ahead of resilience readiness.']);
    var operational=(ds.filter(function(d){return ['demand','production','inventory'].indexOf(d.key)>=0;}).reduce(function(s,d){return s+d.score;},0)/3);
    if(operational-intel.score>=.8)derived.push(['Intelligence Gap','Planning capability has advanced faster than predictive decision support.']);
    if(!derived.length)derived.push(['Balanced Profile','Your profile does not show a dominant structural gap; focus on lifting the lowest dimensions while protecting your strongest capabilities.']);
    $('derivedList').innerHTML=derived.map(function(x){return '<article><span>◆</span><div><strong>'+x[0]+'</strong><p>'+x[1]+'</p></div></article>';}).join('');
    localStorage.setItem('sageHarvestDiagnosticLast',JSON.stringify({overall:overall,level:m,scores:ds,answers:state.answers,completedAt:new Date().toISOString()}));
    window.scrollTo({top:0,behavior:'smooth'});
  }
  function restart(){state.i=0;state.answers=new Array(30).fill(null);$('results').hidden=true;$('intro').hidden=false;window.scrollTo({top:0,behavior:'smooth'});}
  function printReport(){window.print();}
  function saveResults(){var raw=localStorage.getItem('sageHarvestDiagnosticLast');if(!raw)return;var o=JSON.parse(raw),lines=['SAGE HARVEST — SEED SUPPLY CHAIN DIAGNOSTIC','','Overall maturity: '+o.level+' — '+o.overall.toFixed(2)+'/5',''].concat(o.scores.map(function(d){return d.name+': '+d.score.toFixed(1)+' — '+level(d.score);}));var blob=new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='sage-harvest-seed-supply-chain-diagnostic.txt';a.click();setTimeout(function(){URL.revokeObjectURL(a.href);},1000);}
  document.addEventListener('DOMContentLoaded',function(){
    $('startBtn').addEventListener('click',start);$('nextBtn').addEventListener('click',next);$('backBtn').addEventListener('click',back);$('restartBtn').addEventListener('click',restart);$('printBtn').addEventListener('click',printReport);$('saveBtn').addEventListener('click',saveResults);
  });
})();