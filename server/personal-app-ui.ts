export const PERSONAL_HTML = String.raw`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="color-scheme" content="light">
  <title>ECOS — Personal work</title>
  <style nonce="%%NONCE%%">
    :root { color-scheme:light; --ink:#122c29; --quiet:#5c706b; --line:#d8e3dd; --paper:#f6f8f5; --panel:#fff; --strong:#145c49; --pale:#e7f1ea; --gold:#a66e28; --red:#9c3f31; font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
    * { box-sizing:border-box; }
    html,body { min-height:100%; margin:0; background:var(--paper); color:var(--ink); }
    body { font-size:16px; line-height:1.5; }
    button,input,textarea { font:inherit; }
    button { cursor:pointer; }
    button:disabled { opacity:.48; cursor:not-allowed; }
    button:focus-visible,a:focus-visible,input:focus-visible,textarea:focus-visible { outline:3px solid #72b6a1; outline-offset:2px; }
    .shell { max-width:1080px; padding:clamp(14px,3vw,36px); margin:auto; }
    .mast { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:22px; }
    .wordmark { font-size:15px; font-weight:850; letter-spacing:.16em; }
    .eyebrow { font-size:11px; text-transform:uppercase; font-weight:800; letter-spacing:.12em; color:var(--quiet); }
    .status { display:inline-flex; align-items:center; gap:7px; padding:6px 10px; border:1px solid var(--line); border-radius:100px; font-size:12px; background:var(--panel); white-space:nowrap; }
    .dot { width:7px; height:7px; border-radius:50%; background:var(--gold); display:inline-block; }
    .dot.live { background:#27866a; }
    h1 { font-size:clamp(26px,5vw,48px); line-height:1.1; letter-spacing:-.045em; margin:0 0 10px; font-weight:750; }
    h2 { margin:0 0 12px; font-size:22px; letter-spacing:-.03em; }
    h3 { margin:0 0 7px; font-size:16px; }
    p { margin:0 0 12px; }
    .lead { max-width:65ch; color:var(--quiet); font-size:15px; }
    .tabs { display:flex; overflow:auto; white-space:nowrap; gap:7px; margin:22px 0 18px; padding-bottom:3px; scrollbar-width:thin; }
    .tabs button { border:1px solid var(--line); background:white; padding:11px 17px; border-radius:12px; font-weight:650; color:var(--quiet); }
    .tabs button.active { background:var(--ink); color:white; border-color:var(--ink); }
    .panel[hidden] { display:none!important; }
    .stack { display:grid; grid-template-columns:minmax(0,1.1fr) minmax(270px,.9fr); gap:14px; }
    .card { background:var(--panel); border:1px solid var(--line); border-radius:19px; padding:clamp(16px,2.5vw,24px); box-shadow:0 2px 12px #193f2a05; min-width:0; }
    .card + .card { margin-top:0; }
    .row { display:flex; align-items:center; justify-content:space-between; gap:12px; }
    .columns { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; margin-top:14px; }
    .metric { background:var(--pale); border-radius:12px; padding:13px; min-width:0; }
    .metric b { display:block; font-size:26px; letter-spacing:-.04em; line-height:1.2; }
    .metric small { font-size:11px; color:var(--quiet); }
    .subtitle { color:var(--quiet); font-size:13px; }
    .current { background:var(--ink); color:white; padding:22px; border-radius:17px; min-height:200px; }
    .current .eyebrow, .current .subtitle { color:#aac7ba; }
    .current p { font-size:17px; font-weight:550; }
    .debt { display:grid; gap:8px; }
    .obligation { width:100%; text-align:left; border:1px solid var(--line); background:white; border-radius:11px; padding:12px; display:flex; align-items:start; gap:10px; }
    .obligation:hover { border-color:#92bbaa; background:#f9fcf9; }
    .number { min-width:24px; border-radius:7px; color:var(--strong); background:var(--pale); text-align:center; font-size:11px; padding:3px 4px; font-weight:750; }
    .obligation b { font-size:13px; display:block; line-height:1.3; }
    .obligation small { font-size:11px; color:var(--quiet); display:block; margin-top:4px; }
    .note { font-size:12px; color:var(--quiet); margin-top:9px; }
    .hint { border-left:3px solid #8bb7a5; padding:3px 0 3px 11px; font-size:13px; color:var(--quiet); margin:15px 0; }
    .actions { display:flex; align-items:center; flex-wrap:wrap; gap:9px; margin-top:15px; }
    .btn { background:var(--strong); color:white; border:1px solid var(--strong); border-radius:11px; padding:11px 16px; font-size:14px; font-weight:700; }
    .btn.secondary { background:white; color:var(--ink); border-color:var(--line); }
    .btn.warn { background:#fff4eb; color:#763e1a; border-color:#efcda9; }
    .field { display:block; color:var(--quiet); font-size:13px; font-weight:700; margin-bottom:8px; }
    textarea,input[type=search] { width:100%; background:white; border:1px solid #b8c9c0; border-radius:12px; padding:13px; color:var(--ink); }
    textarea { min-height:174px; resize:vertical; }
    .review { border:1px solid #d1e2d3; background:#f1f8f2; border-radius:14px; padding:17px; margin-top:16px; }
    .review blockquote { white-space:pre-wrap; overflow-wrap:anywhere; border-left:3px solid #4f987a; padding-left:13px; margin:12px 0; }
    .check { display:flex; align-items:flex-start; gap:10px; font-size:13px; margin-top:12px; }
    .check input { margin-top:5px; }
    .receipt { overflow-wrap:anywhere; background:var(--pale); padding:14px; border-radius:12px; margin-top:18px; }
    .smallcode { font-family:ui-monospace,monospace; font-size:11px; overflow-wrap:anywhere; }
    .graph-layout { display:grid; grid-template-columns:minmax(0,1fr) 270px; gap:12px; }
    .canvas { position:relative; border-radius:17px; border:1px solid var(--line); background:radial-gradient(ellipse at 40% 35%, #fbfdfb, #eaf3ed); overflow:hidden; }
    .canvas svg { display:block; width:100%; height:520px; max-height:66vh; touch-action:none; user-select:none; }
    .graph-control { position:absolute; left:11px; top:11px; display:flex; gap:5px; flex-wrap:wrap; z-index:2; }
    .graph-control button { background:#fffdfc; color:var(--ink); border:1px solid var(--line); font-weight:750; padding:6px 10px; border-radius:9px; }
    .node { cursor:pointer; }
    .node circle { transition:stroke-width .15s,fill .15s; }
    .node text { pointer-events:none; font:12px system-ui,sans-serif; fill:var(--ink); text-anchor:middle; }
    .node.main text { fill:white; font-weight:750; font-size:16px; }
    .node.stage text { font-size:14px; font-weight:750; }
    .node.leaf text { font-size:10px; }
    .side-note { border:1px solid var(--line); border-radius:15px; padding:15px; background:white; min-height:230px; }
    .side-note p { font-size:13px; color:var(--quiet); }
    .chips { display:flex; gap:6px; flex-wrap:wrap; }
    .chip { border:1px solid var(--line); padding:4px 8px; background:#f2f6f3; border-radius:100px; font-size:11px; }
    .search-results { display:grid; gap:9px; padding-top:15px; }
    .result { border:1px solid var(--line); border-radius:12px; padding:13px; overflow-wrap:anywhere; }
    pre { white-space:pre-wrap; overflow-wrap:anywhere; font-size:12px; }
    .muted { color:var(--quiet); }
    .error { color:var(--red); font-weight:600; }
    footer { padding:28px 4px; font-size:11px; color:var(--quiet); }
    [aria-live] { min-height:1.1em; }
    @media(max-width:760px) { .stack,.graph-layout {grid-template-columns:1fr;} .canvas svg {height:380px;} .side-note { min-height:0; } }
    @media(max-width:380px) { .columns {gap:6px;} .metric {padding:9px;} .metric b {font-size:21px;} .tabs button {padding:9px 12px;} .graph-control button {padding:6px 8px;} }
    @media(prefers-reduced-motion:reduce) { * {scroll-behavior:auto!important;transition:none!important;} }
  </style>
</head>
<body>
<div class="shell">
  <header class="mast">
    <div class="wordmark">ECOS <span class="eyebrow">/ private</span></div>
    <span class="status"><i id="connection-dot" class="dot"></i><span id="connection">Checking live source</span></span>
  </header>
  <h1>Your work, in context.</h1>
  <p class="lead">Recover the current commission, navigate native obligations, compose a situated work view, and make a verified capture through the same Greenfield system your connected workers use.</p>
  <nav class="tabs" aria-label="Work surface sections" role="tablist">
    <button class="active" type="button" data-tab="work" aria-selected="true">Work</button>
    <button type="button" data-tab="map" aria-selected="false">Navigate</button>
    <button type="button" data-tab="capture" aria-selected="false">Capture</button>
    <button type="button" data-tab="recover" aria-selected="false">Recover</button>
  </nav>
  <p id="global-status" class="subtitle" role="status" aria-live="polite"></p>

  <section id="panel-work" class="panel" aria-label="Current work">
    <div class="stack">
      <article class="card">
        <div class="row"><span class="eyebrow">Governing commission</span><span class="status">BRAIN current head</span></div>
        <h2 id="commission-heading" style="margin-top:15px">Recovering current edition…</h2>
        <p id="commission-summary" class="muted"></p>
        <div class="current">
          <div class="eyebrow">Next commissioned outcome</div>
          <p id="commission-next" style="margin-top:10px">Reading current source…</p>
          <div class="subtitle" id="commission-standing"></div>
        </div>
        <p class="note" id="commission-limit"></p>
      </article>
      <article class="card">
        <div class="row"><span class="eyebrow">Native workflow • live</span><button class="btn secondary" type="button" id="refresh">Refresh</button></div>
        <h2 id="cycle-heading" style="margin-top:15px">Reading controller…</h2>
        <p id="cycle-phase" class="subtitle"></p>
        <div class="columns">
          <div class="metric"><b id="metric-debt">—</b><small>Unpaid obligations</small></div>
          <div class="metric"><b id="metric-version">—</b><small>Cycle version</small></div>
          <div class="metric"><b id="metric-selected">0</b><small>Selected for view</small></div>
        </div>
        <p class="hint">This is the native workflow controller, not a replicated Linear task list. The product commission and older native cycle retain their distinct editions.</p>
        <h3>Open obligation neighborhood</h3>
        <div id="debt-list" class="debt"><p class="muted">Loading from Greenfield…</p></div>
        <div class="actions"><button class="btn secondary" type="button" id="see-map">Explore the work graph →</button></div>
      </article>
    </div>
  </section>

  <section id="panel-map" class="panel" hidden aria-label="Structural navigation">
    <div class="row" style="margin-bottom:13px"><div><h2>Unfold the work</h2><p class="subtitle">Live controller topology: containing cycle → stage → obligation. Not yet a universal URG map.</p></div></div>
    <div class="graph-layout">
      <div class="canvas">
        <div class="graph-control">
          <button type="button" id="zoom-in" aria-label="Zoom in">+</button>
          <button type="button" id="zoom-out" aria-label="Zoom out">−</button>
          <button type="button" id="rotate" aria-label="Rotate view">↻</button>
          <button type="button" id="unfold">Unfold</button>
          <button type="button" id="enfold">Enfold</button>
          <button type="button" id="reset-graph">Reset</button>
        </div>
        <svg id="work-map" viewBox="-560 -370 1120 740" role="img" aria-label="Interactive expandable workflow structure">
          <g id="map-camera"></g>
        </svg>
      </div>
      <div class="side-note">
        <div class="eyebrow">Situated selection</div>
        <h3 id="selected-title" style="margin-top:7px">Select a structure</h3>
        <p id="selected-detail">Select a stage to unfold its obligations, or select an obligation to inspect its source criterion.</p>
        <button class="btn secondary" type="button" id="add-selection" disabled>Add to composition</button>
        <div class="eyebrow" style="margin:18px 0 8px">On-the-spot composition</div>
        <div id="selection-chips" class="chips"><span class="subtitle">No obligations selected</span></div>
        <div class="actions">
          <button class="btn" type="button" id="compose-view" disabled>Use composed work view</button>
          <button class="btn secondary" type="button" id="clear-selection">Clear</button>
        </div>
        <p class="note">Composition changes only this view. It does not change BRAIN, admission, or workflow authority.</p>
      </div>
    </div>
  </section>

  <section id="panel-capture" class="panel" hidden aria-label="Capture">
    <div class="stack">
      <article class="card">
        <div class="eyebrow">Real service action</div>
        <h2>Capture a thought</h2>
        <p class="subtitle">The action preserves source bytes under a stable operation identity. It does not claim semantic enrichment, task completion, or circulation.</p>
        <label class="field" for="thought-content" style="margin-top:18px">What do you want to remember?</label>
        <textarea id="thought-content" placeholder="Capture the actual statement, observation, or work material…"></textarea>
        <div class="actions"><button class="btn" type="button" id="review-capture">Review intended action</button></div>
        <div id="capture-review" class="review" hidden>
          <div class="eyebrow">Explicit authorization</div>
          <blockquote id="capture-review-text"></blockquote>
          <p class="note">Destination: Greenfield v2 BRAIN. Mode: raw-only capture. Operation identity persists across retries on this page.</p>
          <label class="check"><input type="checkbox" id="capture-consent"><span>I authorize preserving exactly this content in the connected personal BRAIN.</span></label>
          <div class="actions"><button class="btn" type="button" id="confirm-capture">Authorize and capture</button></div>
        </div>
        <div id="capture-receipt" class="receipt" hidden role="status" aria-live="polite"></div>
      </article>
      <article class="card">
        <div class="eyebrow">Action qualification</div>
        <h2>Claim only what happened</h2>
        <p>**</p>
        <p class="subtitle">Capture, custody verification, semantic qualification, and real-world completion are separate. Success requires returning to the exact stored thought and comparing its content and source.</p>
        <div class="debt">
          <div class="obligation"><span class="number">1</span><div><b>Review and authorize</b><small>You choose whether to make the consequential write.</small></div></div>
          <div class="obligation"><span class="number">2</span><div><b>Execute with a stable identity</b><small>Retries reuse the original operation ID.</small></div></div>
          <div class="obligation"><span class="number">3</span><div><b>Read back and resume</b><small>The persisted thought is fetched and a resumable link is returned.</small></div></div>
        </div>
      </article>
    </div>
  </section>

  <section id="panel-recover" class="panel" hidden aria-label="Context recovery">
    <div class="stack">
      <article class="card">
        <div class="eyebrow">Connected BRAIN • live search</div>
        <h2>Recover source-qualified context</h2>
        <label class="field" for="query">Search your BRAIN</label>
        <input type="search" id="query" placeholder="Relevant referent, question or earlier work">
        <div class="actions"><button class="btn" type="button" id="search">Search live</button></div>
        <div id="search-results" class="search-results"></div>
      </article>
      <article class="card">
        <div class="eyebrow">Exact reentry</div>
        <h2>Resume by thought ID</h2>
        <label class="field" for="thought-id">Persisted thought UUID</label>
        <input type="search" id="thought-id" placeholder="00000000-0000-0000-0000-000000000000">
        <div class="actions"><button class="btn secondary" type="button" id="load-thought">Fetch exact thought</button></div>
        <div id="thought-result" class="search-results"></div>
      </article>
    </div>
  </section>
  <footer>
    Private first-party account enrollment required · Live data from Greenfield v2 · No simulated work records ·
    Read-only navigation and composition · Capture is the sole new write exposed by this surface.
  </footer>
</div>
<script nonce="%%NONCE%%">
(function(){
'use strict';
const $ = id => document.getElementById(id);
const ns = 'http://www.w3.org/2000/svg';
let live = null;
let selectedNode = null;
let selected = new Map();
let composedFilter = null;
let stageOpen = new Set();
let zoom = 1;
let rotation = 0;
let pan = {x:0,y:0};
let operationId = null;
let capturedContent = null;
let actionComplete = false;
function say(message, failed) { $('global-status').textContent=message; $('global-status').className=failed?'error':'subtitle'; }
function txt(id,value){ $(id).textContent=String(value===undefined||value===null?'—':value); }
function tab(name){
  for(const b of document.querySelectorAll('[data-tab]')){const active=b.dataset.tab===name;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));}
  for(const p of document.querySelectorAll('.panel'))p.hidden=p.id!=='panel-'+name;
  if(name==='map')renderMap();
}
for(const b of document.querySelectorAll('[data-tab]'))b.addEventListener('click',()=>tab(b.dataset.tab));
async function get(action,params){
  const u=new URL(location.origin+location.pathname);u.searchParams.set('action',action);
  for(const [key,value] of Object.entries(params||{}))u.searchParams.set(key,value);
  const response=await fetch(u.toString(),{cache:'no-store'});
  const data=await response.json();
  if(!response.ok)throw Error(data.error||'Connected operation unavailable');
  return data;
}
function stageOf(item){return String(item.stage_name||item.stage||'unspecified');}
function obligationTitle(item){return String(item.requirement||item.criterion||item.id||'Unspecified obligation');}
function visibleDebts(){
  const all=Array.isArray(live?.workflow?.debt)?live.workflow.debt:[];
  return composedFilter ? all.filter(x=>composedFilter.has(String(x.id))) : all;
}
function renderWork(){
  if(!live)return;
  const c=live.commission||{}, w=live.workflow||{}, cycle=w.cycle||{};
  txt('commission-heading',c.source?.edition||'Current commission');
  txt('commission-summary',c.summary||'No current source summary');
  txt('commission-next',c.next_action||'No current next action recovered');
  txt('commission-standing',String(c.standing||'standing unknown')+' · '+String(c.qualification||'qualified source read'));
  txt('commission-limit',c.limitations||'Current source governs only the qualified scope.');
  txt('cycle-heading',cycle.outcome||'Native workflow cycle');
  txt('cycle-phase',String(w.phase||'phase unknown')+' · '+String(cycle.edition||'unresolved edition'));
  txt('metric-debt',Array.isArray(w.debt)?w.debt.length:'—');
  txt('metric-version',cycle.version);
  txt('metric-selected',selected.size);
  const box=$('debt-list');box.replaceChildren();
  const debts=visibleDebts();
  if(!debts.length){const p=document.createElement('p');p.className='subtitle';p.textContent=composedFilter?'No obligations are in the composed selection.':'No obligations returned by this read.';box.append(p);}
  for(const item of debts.slice(0,9)){
    const b=document.createElement('button');b.type='button';b.className='obligation';
    const n=document.createElement('span');n.className='number';n.textContent=stageOf(item).slice(0,3).toUpperCase();
    const body=document.createElement('span');const title=document.createElement('b');title.textContent=obligationTitle(item);
    const sub=document.createElement('small');sub.textContent=String(item.owner_route||'Current owner unspecified');
    body.append(title,sub);b.append(n,body);b.onclick=()=>{tab('map');stageOpen.add(stageOf(item));selectedNode={type:'leaf',item};renderMap();renderInspect();};
    box.append(b);
  }
  if(debts.length>9){const p=document.createElement('p');p.className='note';p.textContent='Showing 9 of '+debts.length+'; unfold the native work graph for the full current set.';box.append(p);}
}
async function refresh(){
  say('Revalidating current Greenfield source…');
  try{
    live=await get('load');
    $('connection-dot').classList.add('live');txt('connection','Live read');
    renderWork();renderMap();
    say('Live native source read at '+new Date(live.observed_at).toLocaleTimeString()+'. No changes made.');
  }catch(e){$('connection-dot').classList.remove('live');txt('connection','Read unavailable');say(e.message,true);}
}
$('refresh').onclick=refresh;
$('see-map').onclick=()=>tab('map');

function svg(tag,attrs,text){
  const el=document.createElementNS(ns,tag);
  for(const [key,value] of Object.entries(attrs||{}))el.setAttribute(key,String(value));
  if(text!==undefined)el.textContent=String(text);
  return el;
}
function clip(text,max){const str=String(text||'');return str.length>max?str.slice(0,max-1)+'…':str;}
function nodePositions(){
  if(!live)return [];
  const debts=Array.isArray(live.workflow?.debt)?live.workflow.debt:[];
  const stages=Array.from(new Set(debts.map(stageOf))).sort();
  const nodes=[{key:'cycle',type:'cycle',x:0,y:0,title:'Viable system',item:live.workflow?.cycle}];
  stages.forEach((stage,i)=>{
    const angle=(i/stages.length)*Math.PI*2-Math.PI/2+rotation;
    const x=210*Math.cos(angle), y=210*Math.sin(angle);
    const matching=debts.filter(item=>stageOf(item)===stage);
    nodes.push({key:'stage:'+stage,type:'stage',title:stage+' ('+matching.length+')',x,y,stage,item:matching});
    if(stageOpen.has(stage)){
      matching.forEach((item,j)=>{
        const a=angle+(j-(matching.length-1)/2)*Math.min(.52,2.7/Math.max(1,matching.length));
        const distance=85+17*Math.floor(j/8);
        nodes.push({key:'leaf:'+item.id,type:'leaf',title:obligationTitle(item),x:x+distance*Math.cos(a),y:y+distance*Math.sin(a),stage,item,parent:'stage:'+stage});
      });
    }
  });
  return nodes;
}
function camera(){
  $('map-camera').setAttribute('transform','translate('+pan.x+' '+pan.y+') scale('+zoom+')');
}
function renderMap(){
  const root=$('map-camera');root.replaceChildren();
  if(!live)return;
  const nodes=nodePositions();
  const byKey=new Map(nodes.map(n=>[n.key,n]));
  for(const n of nodes){
    const parent=n.type==='stage'?byKey.get('cycle'):n.parent?byKey.get(n.parent):null;
    if(parent)root.append(svg('line',{x1:parent.x,y1:parent.y,x2:n.x,y2:n.y,stroke:'#8db09f','stroke-width':n.type==='stage'?2.3:1.2,'stroke-opacity':.7}));
  }
  for(const n of nodes){
    const g=svg('g',{class:'node '+(n.type==='cycle'?'main':n.type),transform:'translate('+n.x+' '+n.y+')',role:'button',tabindex:'0','aria-label':n.title});
    const active=selectedNode?.type===n.type&&((n.type==='leaf'&&selectedNode.item.id===n.item?.id)||(n.type==='stage'&&selectedNode.stage===n.stage));
    const radius=n.type==='cycle'?64:n.type==='stage'?42:18;
    const fill=n.type==='cycle'?'#123f34':n.type==='stage'?'#d9e8db':'#fcfefd';
    g.append(svg('circle',{r:radius,fill,stroke:active?'#cc8e42':'#6c9b83','stroke-width':active?5:1.7}));
    if(n.type==='cycle'){
      g.append(svg('text',{y:-4},'ECOS'));g.append(svg('text',{y:16},'WORK'));
    }else if(n.type==='stage'){
      g.append(svg('text',{y:-2},clip(n.stage,12)));
      g.append(svg('text',{y:15},String(n.item.length)));
      if(!stageOpen.has(n.stage))g.append(svg('text',{y:-53,'font-size':11},'+ unfold'));
    }else{g.append(svg('text',{y:4},String(n.item.stage||'•').slice(0,2).toUpperCase()));}
    g.append(svg('title',{},n.title));
    const select=()=>{
      if(n.type==='stage')stageOpen.has(n.stage)?stageOpen.delete(n.stage):stageOpen.add(n.stage);
      selectedNode=n;
      renderMap();renderInspect();
    };
    g.addEventListener('click',select);
    g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select();}});
    root.append(g);
  }
  camera();
}
function renderInspect(){
  const n=selectedNode;
  if(!n){txt('selected-title','Select a structure');txt('selected-detail','Select a stage to unfold its obligations, or select an obligation to inspect its source criterion.');$('add-selection').disabled=true;return;}
  if(n.type==='leaf'){
    txt('selected-title',obligationTitle(n.item));
    txt('selected-detail',String(n.item.criterion||'No validation criterion recorded')+'\nOwner: '+String(n.item.owner_route||'unknown'));
    $('add-selection').disabled=false;
  } else if(n.type==='stage'){
    txt('selected-title','Stage: '+n.stage);
    txt('selected-detail',String(n.item.length)+' actual obligations. Select an obligation to add it to a composed work view.');
    $('add-selection').disabled=true;
  } else {
    txt('selected-title',n.item?.outcome||'Containing cycle');
    txt('selected-detail','Expand neighboring stages, then inspect situated obligations. These are currently controller-backed relations.');
    $('add-selection').disabled=true;
  }
}
function updateComposition(){
  $('selection-chips').replaceChildren();
  for(const item of selected.values()){
    const chip=document.createElement('span');chip.className='chip';chip.textContent=clip(obligationTitle(item),33);
    $('selection-chips').append(chip);
  }
  if(!selected.size){const t=document.createElement('span');t.className='subtitle';t.textContent='No obligations selected';$('selection-chips').append(t);}
  txt('metric-selected',selected.size);
  $('compose-view').disabled=selected.size===0;
}
$('add-selection').onclick=()=>{if(selectedNode?.type!=='leaf')return;selected.set(String(selectedNode.item.id),selectedNode.item);updateComposition();};
$('clear-selection').onclick=()=>{selected.clear();composedFilter=null;updateComposition();renderWork();};
$('compose-view').onclick=()=>{composedFilter=new Set(selected.keys());renderWork();tab('work');say('Composed a current work view from '+selected.size+' native obligations. No project record was changed.');};
$('unfold').onclick=()=>{stageOpen=new Set((Array.isArray(live?.workflow?.debt)?live.workflow.debt:[]).map(stageOf));renderMap();};
$('enfold').onclick=()=>{stageOpen.clear();renderMap();};
$('zoom-in').onclick=()=>{zoom=Math.min(2.8,zoom*1.2);camera();};
$('zoom-out').onclick=()=>{zoom=Math.max(.48,zoom/1.2);camera();};
$('rotate').onclick=()=>{rotation+=Math.PI/8;renderMap();};
$('reset-graph').onclick=()=>{zoom=1;rotation=0;pan={x:0,y:0};stageOpen.clear();selectedNode=null;renderMap();renderInspect();};
$('work-map').addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.48,Math.min(2.8,zoom*(e.deltaY>0?.9:1.1)));camera();},{passive:false});
const pointers=new Map();let pinch=null;
$('work-map').addEventListener('pointerdown',e=>{$('work-map').setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});pinch=null;});
$('work-map').addEventListener('pointermove',e=>{
  if(!pointers.has(e.pointerId))return;
  const old=pointers.get(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  const rect=$('work-map').getBoundingClientRect();
  if(pointers.size===1){pan.x+=(e.clientX-old.x)*1120/rect.width;pan.y+=(e.clientY-old.y)*740/rect.height;}
  else if(pointers.size===2){
    const p=Array.from(pointers.values());const d=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);
    if(pinch!==null&&pinch>0)zoom=Math.max(.48,Math.min(2.8,zoom*d/pinch));
    pinch=d;
  }
  camera();
});
for(const event of ['pointerup','pointercancel','lostpointercapture'])$('work-map').addEventListener(event,e=>{pointers.delete(e.pointerId);pinch=null;});
function resultLine(box,heading,body){
  const item=document.createElement('div');item.className='result';const title=document.createElement('h3');title.textContent=heading;
  const content=document.createElement('pre');content.textContent=body;item.append(title,content);box.append(item);
}
$('review-capture').onclick=()=>{
  const content=$('thought-content').value;
  if(!content.trim()){say('Enter content to review.',true);return;}
  if(content.length>12000){say('The input exceeds the 12,000-character bounded capture.',true);return;}
  if(capturedContent!==content){operationId=null;actionComplete=false;}
  capturedContent=content;$('capture-review-text').textContent=content;$('capture-review').hidden=false;$('capture-consent').checked=false;
  $('capture-receipt').hidden=true; say('Review the exact content and grant specific capture authorization.');
};
$('thought-content').addEventListener('input',()=>{$('capture-review').hidden=true;$('capture-consent').checked=false;});
$('confirm-capture').onclick=async()=>{
  const content=$('thought-content').value;
  if(content!==capturedContent){say('Content changed after review. Review again before authorizing.',true);return;}
  if(!$('capture-consent').checked){say('Explicit authorization is required.',true);return;}
  if(actionComplete){say('This occurrence was already verified. Start a new draft for another capture.');return;}
  operationId=operationId||crypto.randomUUID();
  $('confirm-capture').disabled=true;say('Executing and verifying live BRAIN custody…');
  try{
    const response=await fetch(location.pathname+'?action=capture',{
      method:'POST',headers:{'content-type':'application/json','x-ecos-action':'capture'},
      body:JSON.stringify({authorized:true,operation_id:operationId,content})
    });
    const receipt=await response.json();
    $('capture-receipt').hidden=false;
    $('capture-receipt').replaceChildren();
    resultLine($('capture-receipt'),receipt.state||receipt.error||'Unresolved capture',JSON.stringify(receipt,null,2));
    if(response.ok&&receipt.state==='RAW_CUSTODY_VERIFIED'){
      actionComplete=true;const next=new URL(location.href);next.searchParams.set('thought',receipt.thought_id);history.replaceState(null,'',next);
      $('thought-id').value=receipt.thought_id;
      $('capture-review').hidden=true;
      say('Exact raw custody verified in Greenfield. Semantic and circulation qualification remain separate.');
    }else{say('Capture is not verified complete. Retry with the same stable operation identity.',true);}
  }catch(e){say('Network response unavailable; retain this operation identity before any retry.',true);}
  finally{$('confirm-capture').disabled=false;}
};
$('search').onclick=async()=>{
  const query=$('query').value.trim();if(!query){say('Enter a query.',true);return;}
  const box=$('search-results');box.replaceChildren();say('Searching live BRAIN…');
  try{
    const data=await get('search',{q:query});
    const result=data.result||{};
    const matches=Array.isArray(result.results)?result.results:(Array.isArray(result)?result:[]);
    if(!matches.length){resultLine(box,'Search returned',JSON.stringify(result,null,2).slice(0,8000));}
    for(const m of matches.slice(0,8)){
      const label=String(m.content||m.title||m.id||'Recovered result');
      resultLine(box,clip(label,90),JSON.stringify(m,null,2).slice(0,4000));
    }
    say('Search returned a live result. Interpret standing and evidence separately.');
  }catch(e){say(e.message,true);}
};
async function loadThought(id){
  const box=$('thought-result');box.replaceChildren();say('Fetching exact persisted thought…');
  try{const value=await get('thought',{id});const thought=value.thought||{};resultLine(box,'Stored source · '+String(thought.id||id),JSON.stringify(thought,null,2).slice(0,10000));say('Exact BRAIN fetch completed; source provenance and semantic standing remain distinct.');}
  catch(e){say(e.message,true);}
}
$('load-thought').onclick=()=>loadThought($('thought-id').value.trim());
$('query').addEventListener('keydown',e=>{if(e.key==='Enter')$('search').click();});
const linked=new URL(location.href).searchParams.get('thought');
refresh().then(()=>{if(linked){$('thought-id').value=linked;tab('recover');loadThought(linked);}});
})();
</script>
</body>
</html>`;
