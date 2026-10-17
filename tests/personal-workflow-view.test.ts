import test from 'node:test';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { PERSONAL_HTML } from '../server/personal-app-ui.js';
const root='40ca3bbd-c905-4ec5-b202-bfb49fcd6605';
const child='e6840c97-41ba-4978-880d-86573c2fbc9c';
const script=PERSONAL_HTML.match(/<script nonce="%%NONCE%%">([\s\S]*?)<\/script>/)![1];
function boot(delayChild=false) {
  let resolveChild: (()=>void)|undefined;
  const nodes=new Map<string,any>();
  const element=()=>({value:'',textContent:'',hidden:false,disabled:false,checked:false,
    children:[] as any[],classList:{add(){},remove(){},toggle(){}},setAttribute(){},
    append(...items:any[]){this.children.push(...items);},replaceChildren(){this.children=[];},addEventListener(){}});
  const get=(id:string)=>{if(!nodes.has(id))nodes.set(id,element());return nodes.get(id);};
  const calls:{url:string;method:string}[]=[];const history:string[]=[];let fail=false;
  const context={URL,Date,Map,Set,sessionStorage:{getItem:()=>null},crypto:{randomUUID:()=>''},
    navigator:{},location:{origin:'https://example.test',pathname:'/api/personal',href:'https://example.test/api/personal'},
    history:{replaceState(_a:unknown,_b:unknown,url:unknown){history.push(String(url));}},
    document:{getElementById:get,querySelectorAll:()=>[],createElement:element,createElementNS:element},
    fetch:async(url:string,init?:{method?:string})=>{
      calls.push({url,method:init?.method??'GET'});
      if(fail)return {ok:false,status:503,json:async()=>({error:'native_unavailable'})};
      const cid=new URL(url).searchParams.get('cycle_id')??root;
      if(cid===child&&delayChild)await new Promise<void>(resolve=>{resolveChild=resolve;});
      return {ok:true,status:200,json:async()=>({observed_at:'2026-10-16T20:00:00Z',commission:{},workflow:{
        cycle:{id:cid,version:cid===root?8:15,edition:'fixture/1',outcome:cid===root?'Containing outcome':'Governor child'},
        phase:'metabolize',debt:[{id:'required',stage_name:'metabolize',requirement:'Receiving effect'}],
        open_children:cid===root?[{id:child,outcome:'Governor child',phase:'metabolize'}]:[],
        scope_decisions:[{id:'pending',disposition:null}],zero_balance:false,
        obligations:[{id:'required',paid:false,latest_result:{status:'UNKNOWN'}}],
        events:[{actor:'fixture',action:'result'}],monitor:{health:'UNKNOWN'},next_action:{action:'fulfill'},
      }})};
    }};
  runInNewContext(script,context);
  return {get,calls,history,fail:()=>{fail=true;},resolveChild:()=>resolveChild?.()};
}
const settle=()=>new Promise<void>(resolve=>setImmediate(resolve));
test('actual UI discloses native proof and navigates child/root using only live reads',async()=>{
  const app=boot();await settle();
  assert.equal(app.get('cycle-heading').textContent,'Containing outcome');
  assert.match(app.get('native-status').textContent,/Observer: UNKNOWN.*Zero balance: false/);
  const proof=JSON.parse(app.get('native-proof').textContent);
  assert.equal(proof.scope_decisions[0].disposition,null);
  assert.equal(proof.obligations[0].latest_result.status,'UNKNOWN');
  assert.equal(proof.events[0].actor,'fixture');
  const button=app.get('child-work').children[0];assert.match(button.textContent,/Governor child/);
  await button.onclick();
  assert.equal(app.get('cycle-heading').textContent,'Governor child');
  assert.equal(new URL(app.calls.at(-1)!.url).searchParams.get('cycle_id'),child);
  assert.equal(new URL(app.history.at(-1)!).searchParams.get('cycle_id'),child);
  assert.match(app.get('child-work').children[0].textContent,/No open child work/);
  await app.get('view-root').onclick();
  assert.equal(app.get('cycle-heading').textContent,'Containing outcome');
  assert(app.calls.every(x=>x.method==='GET'));
});
test('unavailable refresh marks retained work as an earlier snapshot, not current zero debt',async()=>{
  const app=boot();await settle();app.fail();await app.get('refresh').onclick();
  assert.equal(app.get('connection').textContent,'Read unavailable');
  assert.match(app.get('native-status').textContent,/earlier snapshot.*not a fresh current-state/);
  assert.equal(app.get('metric-debt').textContent,'1');
  assert(app.calls.every(x=>x.method==='GET'));
});

test('late child response cannot replace a newer containing-work selection',async()=>{
  const app=boot(true);await settle();
  const pending=app.get('child-work').children[0].onclick();
  await app.get('view-root').onclick();
  app.resolveChild();await pending;
  assert.equal(app.get('cycle-heading').textContent,'Containing outcome');
  assert.equal(new URL(app.history.at(-1)!).searchParams.get('cycle_id'),root);
});
