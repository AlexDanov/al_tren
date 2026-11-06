/* Тренажёр 3 «Операции и таблицы»: разминка по шести операциям, порядок действий, таблица истинности по шагам, зачёт. */
(()=>{
const store=AL.store.scoped('t3');
const OPS={
  not:{sym:'¬',name:'Отрицание',read:'«НЕ A»',hint:'Отрицание меняет значение на противоположное: ¬1 = 0, ¬0 = 1.',f:a=>1-a},
  and:{sym:'∧',name:'Конъюнкция',read:'«A И B»',hint:'Конъюнкция равна 1, только когда оба операнда равны 1.',f:(a,b)=>a&b},
  or:{sym:'∨',name:'Дизъюнкция',read:'«A ИЛИ B»',hint:'Дизъюнкция равна 0, только когда оба операнда равны 0.',f:(a,b)=>a|b},
  imp:{sym:'→',name:'Импликация',read:'«если A, то B»',hint:'Импликация равна 0 в единственном случае: из 1 следует 0 (левый операнд 1, правый 0).',f:(a,b)=>(1-a)|b},
  eq:{sym:'≡',name:'Эквивалентность',read:'«A тогда и только тогда, когда B»',hint:'Эквивалентность равна 1, когда значения операндов совпадают.',f:(a,b)=>a===b?1:0},
  xor:{sym:'⊕',name:'Исключающее ИЛИ',read:'«либо A, либо B»',hint:'Исключающее ИЛИ равно 1, когда значения операндов различаются.',f:(a,b)=>a^b}
};
const OP_ORDER=['not','and','or','imp','eq','xor'];
const CIRC='①②③④⑤⑥⑦⑧⑨⑩';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- SEED и генератор выражений ---------- */
function xmur3(str){let h=1779033703^str.length;for(let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353);h=h<<13|h>>>19}
  return()=>{h=Math.imul(h^(h>>>16),2246822507);h=Math.imul(h^(h>>>13),3266489909);return(h^=h>>>16)>>>0}}
function mulberry32(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const LEVELS={1:{vars:'AB',bin:[2,2],pool:['and','or'],pNot:.22},2:{vars:'ABC',bin:[3,3],pool:['and','or','imp','eq'],pNot:.3},3:{vars:'ABCD',nv:[3,4],bin:[3,4],pool:['and','or','imp','eq','xor'],pNot:.3}};
function normSeed(raw,lvl){
  let s=String(raw||'').toUpperCase().replace(/[^A-Z0-9-]/g,'').replace(/^-+|-+$/g,'');
  if(!s)return null;if(!/^[123]-./.test(s))s=lvl+'-'+s;return s.slice(0,24);
}
function randomSeed(lvl){const A='ABCDEFGHJKMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<5;i++)s+=A[Math.floor(Math.random()*A.length)];return lvl+'-'+s}
const PREC={eq:1,imp:2,or:3,xor:3,and:4,not:5,var:6};
function evalN(n,e){return n.op==='var'?e[n.v]:n.op==='not'?1-evalN(n.a,e):OPS[n.op].f(evalN(n.a,e),evalN(n.b,e))}
function opsPost(n,a=[]){if(n.op==='var')return a;opsPost(n.a,a);if(n.b)opsPost(n.b,a);a.push(n);return a}
function envOf(vars,m){const e={};vars.forEach((v,i)=>e[v]=(m>>(vars.length-1-i))&1);return e}
function generate(seed){
  const lvl=+seed[0]||1,L=LEVELS[lvl];
  for(let attempt=0;attempt<400;attempt++){
    const r=mulberry32(xmur3(seed+'#'+attempt)());
    const pick=a=>a[Math.floor(r()*a.length)];
    let vars=L.vars.split('');if(L.nv)vars=vars.slice(0,L.nv[0]+Math.floor(r()*(L.nv[1]-L.nv[0]+1)));
    const k=L.bin[0]+Math.floor(r()*(L.bin[1]-L.bin[0]+1));
    if(k+1<vars.length)continue;
    const leaves=[...vars];while(leaves.length<k+1)leaves.push(pick(vars));
    for(let i=leaves.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[leaves[i],leaves[j]]=[leaves[j],leaves[i]]}
    let li=0,id=0;
    const build=cnt=>{
      let n;
      if(cnt===0)n={op:'var',v:leaves[li++]};
      else{const left=Math.floor(r()*cnt);n={op:pick(L.pool),a:build(left),b:build(cnt-1-left)}}
      if(r()<L.pNot&&!(n.op==='var'&&r()<.3))n={op:'not',a:n};
      return n;
    };
    const tree=build(k);
    const ops=opsPost(tree);
    if(ops.length>7||ops.length<3)continue;
    const N=1<<vars.length;let ones=0;const essential=new Set();
    for(let m=0;m<N;m++){const e=envOf(vars,m),v=evalN(tree,e);ones+=v;
      vars.forEach(x=>{const e2={...e,[x]:1-e[x]};if(evalN(tree,e2)!==v)essential.add(x)})}
    if(ones===0||ones===N||essential.size<vars.length)continue;
    if(new Set(ops.map(o=>o.op)).size<2)continue;
    // без «A ∨ A», «A ∧ ¬A» и двойных отрицаний: такие куски ничего не тренируют
    const leafVar=c=>c.op==='var'?c.v:c.op==='not'&&c.a.op==='var'?c.a.v:null;
    if(ops.some(o=>o.b&&leafVar(o.a)&&leafVar(o.a)===leafVar(o.b)))continue;
    if(ops.some(o=>o.op==='not'&&o.a.op==='not'))continue;
    ops.forEach(o=>o.id='o'+(id++));
    return {seed,level:lvl,vars,tree,ops};
  }
  return null;
}
function needParen(child,parent,isRight){
  if(child.op==='var'||child.op==='not')return false;
  if(parent.op==='not')return true;
  const pc=PREC[child.op],pp=PREC[parent.op];
  if(pc<pp)return true;if(pc>pp)return child.op==='xor'||parent.op==='xor'?true:false;
  return !(child.op===parent.op&&(child.op==='and'||child.op==='or')&&!isRight);
}
/* токены для отрисовки: скобки, переменные, операции (кликабельные) */
function tokens(n,parent,isRight,out=[]){
  const p=parent&&needParen(n,parent,isRight);
  if(p)out.push({t:'('});
  if(n.op==='var')out.push({t:'v',v:n.v});
  else if(n.op==='not'){out.push({t:'op',n});tokens(n.a,n,false,out)}
  else{tokens(n.a,n,false,out);out.push({t:'op',n});tokens(n.b,n,true,out)}
  if(p)out.push({t:')'});
  return out;
}
const plain=(n,parent,isRight)=>tokens(n,parent,isRight).map(t=>t.t==='op'?(t.n.op==='not'?'¬':' '+OPS[t.n.op].sym+' '):t.t==='v'?t.v:t.t).join('');
/* заголовок столбца: операнды-операции заменены номерами шагов */
function header(n,stepOf){
  const part=(c,isRight)=>{if(c.op==='var')return c.v;const s=stepOf[c.id];return s!=null?CIRC[s]:plain(c,n,isRight)};
  return n.op==='not'?'¬'+part(n.a,false):part(n.a,false)+' '+OPS[n.op].sym+' '+part(n.b,true);
}

const MARKUP=`<div class="app t3">
  <header class="top">
    <div class="brand">
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><rect x="5" y="5" width="30" height="30" rx="3" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2.4"/><path d="M20 5v30M5 15h30M5 25h30" stroke="var(--ink)" stroke-width="2"/><path d="M24 10h7M24 20h7" stroke="var(--live)" stroke-width="3" stroke-linecap="round"/><path d="M24 30h7" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/></svg>
      <div><a class="back" href="#map">← Карта навыков</a><h1>Операции и таблицы</h1><p>Шесть операций, порядок действий, таблица истинности по шагам</p></div>
    </div>
    <div class="controls">
      <div class="field"><label for="x3Student">Ученик</label><input type="text" id="x3Student" placeholder="Фамилия Имя" autocomplete="off"></div>
      <div class="field x3-exonly"><label for="x3Seed">Задание №</label>
        <div class="row"><input type="text" id="x3Seed" class="seedin" spellcheck="false" autocomplete="off"><button class="btn" id="x3Open">Открыть</button></div></div>
      <div class="field x3-exonly"><label for="x3Level">Уровень</label>
        <div class="row"><select id="x3Level"><option value="1">1 · A, B</option><option value="2">2 · A, B, C и →, ≡</option><option value="3">3 · до четырёх и ⊕</option></select><button class="btn primary" id="x3New">Новое выражение</button></div></div>
      <button class="btn" id="x3Log">Журнал</button>
    </div>
  </header>
  <div class="exam-bar" id="x3ExamBar" hidden></div>
  <div class="seg" role="tablist" aria-label="Режим">
    <button role="tab" id="x3TabOps" aria-selected="true">Разминка: операции <span class="pill ok" id="x3OpsCnt">0/6</span></button>
    <button role="tab" id="x3TabExpr" aria-selected="false">Выражения <span class="pill ok" id="x3ExprCnt">0/4</span></button>
  </div>

  <section id="x3Ops" class="ops-wrap">
    <div class="card">
      <div class="card-h"><span class="step">⚡</span><h2 id="x3WuTitle">Операция</h2><p id="x3WuSub"></p></div>
      <div class="body" id="x3WuBody"></div>
    </div>
    <aside class="card ops-side">
      <div class="card-h"><span class="step">6</span><h2>Выученные операции</h2><p>Операция выучена, когда ты верно заполнил её таблицу. Выучи все шесть.</p></div>
      <div class="body"><div class="op-grid" id="x3OpGrid"></div></div>
    </aside>
  </section>

  <section id="x3Expr" hidden>
    <div class="status" id="x3Status"></div>
    <div class="card">
      <div class="card-h"><span class="step">1</span><h2>Порядок действий</h2>
        <p>Нажимай на операции в том порядке, в каком их выполняют. Сначала скобки, потом ¬, ∧, ∨, затем →, ≡. Одинаковые операции без скобок выполняются слева направо.</p></div>
      <div class="body">
        <div class="bigexpr" id="x3Expr1" aria-label="Выражение"></div>
        <div class="actions">
          <button class="btn primary" id="x3CheckOrder">Проверить порядок</button>
          <button class="btn ghost" id="x3Undo">Отменить последнее</button>
          <button class="btn ghost" id="x3ResetOrder">Сбросить</button>
          <span class="tries" id="x3OrderTries"></span>
        </div>
        <div class="msg" id="x3OrderMsg"></div>
      </div>
    </div>
    <div class="card" id="x3TableCard">
      <div class="card-h"><span class="step">2</span><h2>Таблица истинности</h2>
        <p>Столбцы идут в порядке действий. Заполняй сверху вниз: цифры 0 и 1 на клавиатуре сами переводят на следующую клетку, стрелки двигают по таблице.</p></div>
      <div class="body">
        <div class="tt-wrap"><table class="tt t3tt" id="x3Table"></table></div>
        <div class="actions">
          <button class="btn primary" id="x3CheckTable">Проверить таблицу</button>
          <button class="btn ghost" id="x3ClearTable">Очистить</button>
          <span class="tries" id="x3TableTries"></span>
        </div>
        <div class="msg" id="x3TableMsg"></div>
      </div>
    </div>
  </section>
</div>
<div class="toast" id="x3Toast"></div>`;

/* ---------- прогресс для карты ---------- */
function summarize(){
  const ops=store.get('ops',{}),prog=store.get('progress',{});
  if(!Object.keys(ops).length&&!Object.keys(prog).length&&!AL.node('n3').touched)return;
  const nOps=OP_ORDER.filter(o=>ops[o]).length;
  const solved=Object.values(prog).filter(p=>p.orderOk&&p.tableOk);
  const hi=solved.filter(p=>(+p.level||1)>=2).length,nEx=Math.min(solved.length,4);
  const mastered=nOps===6&&solved.length>=4&&hi>=2;
  AL.report('n3',{done:nOps+nEx,total:10,note:`Операции ${nOps} из 6 · выражения ${nEx} из 4`+(nEx>=2&&hi<2?` · уровня 2–3: ${hi} из 2`:''),mastered,via:mastered?'practice':undefined});
}
function exportData(){
  const prog=store.get('progress',{}),out={};
  Object.entries(prog).sort((a,b)=>(a[1].first||'').localeCompare(b[1].first||'')).slice(-300)
    .forEach(([k,p])=>out[k]=[+p.level||1,p.orderOk?1:0,p.tableOk?1:0,p.orderTries||0,p.tableTries||0,p.first||'']);
  return {o:store.get('ops',{}),p:out};
}
function importData(d){
  if(!d)return;
  store.set('ops',Object.assign({},d.o||{},store.get('ops',{})));
  const prog=store.get('progress',{});
  for(const [k,a] of Object.entries(d.p||{})){
    const c=prog[k]||(prog[k]={level:a[0],orderTries:0,tableTries:0,orderOk:false,tableOk:false,first:a[5]||new Date().toISOString()});
    c.orderOk=c.orderOk||!!a[1];c.tableOk=c.tableOk||!!a[2];c.orderTries=Math.max(c.orderTries,a[3]||0);c.tableTries=Math.max(c.tableTries,a[4]||0);
  }
  store.set('progress',prog);summarize();if(api)api.refresh();
}

let api=null;
function mount(){if(api)return api;document.getElementById('view-t3').innerHTML=MARKUP;api=init();return api}

function init(){
const $=s=>document.querySelector(s);
let ops=store.get('ops',{});
let progress=store.get('progress',{});
let log=store.get('log',[]);
let level=store.get('level',1);
let mode=store.get('mode','ops');
let S=null,EX=null,WU=null;
const saveP=()=>store.set('progress',progress);
const saveL=()=>store.set('log',log);
function addLog(stage,input,note){log.push({t:new Date().toISOString(),seed:S&&mode==='expr'?S.seed:'разминка',student:AL.student.get(),stage,input,note});if(log.length>3000)log=log.slice(-3000);saveL()}
function toast(t){const el=$('#x3Toast');el.textContent=t;el.classList.add('show');clearTimeout(toast.h);toast.h=setTimeout(()=>el.classList.remove('show'),1800)}
function showMsg(sel,cls,html){const el=$(sel);el.className='msg show '+cls;el.innerHTML=html}
function hideMsg(sel){$(sel).className='msg'}
const fmtEnv=e=>Object.entries(e).map(([k,v])=>`${k}=${v}`).join(', ');

/* ---------- режимы ---------- */
function setMode(m,push=true){
  mode=m;store.set('mode',m);
  $('#x3TabOps').setAttribute('aria-selected',m==='ops');$('#x3TabExpr').setAttribute('aria-selected',m==='expr');
  $('#x3Ops').hidden=m!=='ops';$('#x3Expr').hidden=m!=='expr';
  document.querySelector('.app.t3').classList.toggle('mode-ops',m==='ops');
  if(m==='ops'){if(!WU)nextWarmup();renderOpGrid();if(push)setHash('t3-ops')}
  else{if(!S)loadSeed(store.get('last',null)||randomSeed(level),push);else if(push)setHash('t3-'+S.seed)}
  renderCounts();
}
function setHash(h){if(location.hash.slice(1)!==h){try{history.replaceState(null,'','#'+h)}catch(e){location.hash=h}}}
function renderCounts(){
  $('#x3OpsCnt').textContent=OP_ORDER.filter(o=>ops[o]).length+'/6';
  const solved=Object.values(progress).filter(p=>p.orderOk&&p.tableOk).length;
  $('#x3ExprCnt').textContent=Math.min(solved,4)+'/4';
}

/* ---------- разминка ---------- */
function nextWarmup(prefer){
  const unknown=OP_ORDER.filter(o=>!ops[o]);
  const fillOnly=unknown.length>0&&Math.random()<.7;
  let op=prefer||(fillOnly?unknown[Math.floor(Math.random()*unknown.length)]:OP_ORDER[Math.floor(Math.random()*6)]);
  if(WU&&WU.op===op&&!prefer)op=OP_ORDER[(OP_ORDER.indexOf(op)+1+Math.floor(Math.random()*5))%6];
  const kind=prefer||fillOnly||op==='not'?'fill':(Math.random()<.5?'fill':'name');
  const n=op==='not'?1:2;
  WU={op,kind,n,cells:Array(1<<n).fill(''),marks:null,tries:0,done:false};
  renderWarmup();
}
function wuRows(){return [...Array(1<<WU.n).keys()].map(m=>({A:WU.n===1?m:(m>>1)&1,B:m&1}))}
function wuF(r){return WU.op==='not'?OPS.not.f(r.A):OPS[WU.op].f(r.A,r.B)}
function renderWarmup(){
  const o=OPS[WU.op],rows=wuRows(),expr=WU.op==='not'?'¬A':'A '+o.sym+' B';
  if(WU.kind==='fill'){
    $('#x3WuTitle').innerHTML=`<span class="opsym">${o.sym}</span> ${o.name}`;
    $('#x3WuSub').textContent=`Читается ${o.read}. Заполни столбец F = ${expr}.`;
    $('#x3WuBody').innerHTML=`<div class="tt-wrap"><table class="tt wu"><thead><tr>${WU.n===2?'<th>A</th><th>B</th>':'<th>A</th>'}<th class="f">F = ${esc(expr)}</th></tr></thead><tbody>${rows.map((r,m)=>
      `<tr>${WU.n===2?`<td>${r.A}</td><td>${r.B}</td>`:`<td>${r.A}</td>`}<td class="fc"><button class="fbtn${WU.cells[m]!==''?' filled':''}${WU.marks?' '+WU.marks[m]:''}" data-wm="${m}" aria-label="F в строке ${m+1}">${WU.cells[m]}</button></td></tr>`).join('')}</tbody></table></div>
      <div class="actions"><button class="btn primary" id="x3WuCheck">Проверить</button><button class="btn ghost" id="x3WuSkip">Другая операция</button><span class="tries">${WU.tries?'Попыток: '+WU.tries:''}</span></div>
      <div class="msg" id="x3WuMsg"></div>`;
  }else{
    $('#x3WuTitle').textContent='Узнай операцию';
    $('#x3WuSub').textContent='Перед тобой готовая таблица. Какая операция её даёт?';
    $('#x3WuBody').innerHTML=`<div class="tt-wrap"><table class="tt wu"><thead><tr><th>A</th><th>B</th><th class="f">F = A ? B</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r.A}</td><td>${r.B}</td><td class="fc"><span class="fval">${wuF(r)}</span></td></tr>`).join('')}</tbody></table></div>
      <div class="choices">${OP_ORDER.filter(x=>x!=='not').map(x=>`<button class="btn choice" data-op="${x}"><span class="opsym">${OPS[x].sym}</span>${OPS[x].name}</button>`).join('')}</div>
      <div class="msg" id="x3WuMsg"></div>`;
  }
}
function renderOpGrid(){
  $('#x3OpGrid').innerHTML=OP_ORDER.map(o=>`<button class="opcard${ops[o]?' on':''}" data-train="${o}" title="Потренировать: ${OPS[o].name}"><span class="opsym">${OPS[o].sym}</span><span class="opn">${OPS[o].name}</span><span class="opst">${ops[o]?'выучена':'нажми, чтобы потренировать'}</span></button>`).join('');
  renderCounts();
}
function wuCheck(){
  if(WU.done){nextWarmup();return}
  const empty=WU.cells.map((v,i)=>v===''?i+1:0).filter(Boolean);
  if(empty.length){showMsg('#x3WuMsg','info','Заполни все строки. Пустые: '+empty.join(', ')+'.');return}
  WU.tries++;const rows=wuRows();WU.marks=rows.map((r,m)=>+WU.cells[m]===wuF(r)?'ok':'bad');
  const wrong=WU.marks.filter(x=>x==='bad').length;
  renderWarmup();
  if(!wrong){
    const first=!ops[WU.op];ops[WU.op]=true;store.set('ops',ops);WU.done=true;
    addLog('Верно',OPS[WU.op].name,`таблица операции с ${WU.tries}-й попытки`);
    showMsg('#x3WuMsg','ok',`<b>Верно!</b> ${first?`Операция «${OPS[WU.op].name}» выучена.`:'Таблица заполнена правильно.'}${OP_ORDER.every(o=>ops[o])&&first?' Все шесть операций выучены — переходи к выражениям.':''}
      <div class="actions"><button class="btn primary" id="x3WuNext">Дальше →</button>${OP_ORDER.every(o=>ops[o])?'<button class="btn" id="x3GoExpr">К выражениям</button>':''}</div>`);
    renderOpGrid();summarize();
  }else{
    addLog('Операция',OPS[WU.op].name+': F = '+WU.cells.join(''),`неверных строк ${wrong}`);
    showMsg('#x3WuMsg','bad',`<b>Ошибка.</b> Неверных строк: ${wrong}, они отмечены красным. ${OPS[WU.op].hint}`);
  }
}
function wuChoose(op){
  if(WU.done)return;
  WU.tries++;
  document.querySelectorAll('#x3WuBody .choice').forEach(b=>b.disabled=true);
  const btn=document.querySelector(`#x3WuBody .choice[data-op="${op}"]`);
  if(op===WU.op){btn.classList.add('ok');WU.done=true;addLog('Верно','узнать операцию',OPS[op].name);
    showMsg('#x3WuMsg','ok',`<b>Верно!</b> Это ${OPS[op].name.toLowerCase()}. ${OPS[op].hint}<div class="actions"><button class="btn primary" id="x3WuNext">Дальше →</button></div>`)}
  else{btn.classList.add('bad');document.querySelector(`#x3WuBody .choice[data-op="${WU.op}"]`).classList.add('ok');
    addLog('Операция','узнать: выбрано '+OPS[op].name,'правильно: '+OPS[WU.op].name);
    showMsg('#x3WuMsg','bad',`<b>Нет.</b> Это ${OPS[WU.op].name.toLowerCase()} ${OPS[WU.op].sym}. ${OPS[WU.op].hint}<div class="actions"><button class="btn primary" id="x3WuNext">Дальше →</button></div>`)}
}

/* ---------- выражение ---------- */
function P(){return progress[S.seed]||(progress[S.seed]={level:S.level,orderTries:0,tableTries:0,orderOk:false,tableOk:false,first:new Date().toISOString()})}
function loadSeed(seed,push=true){
  const g=generate(seed);if(!g){toast('По этому номеру выражение не строится. Возьми другой.');return}
  S=Object.assign(g,{order:[],cells:null,marks:null,answered:{order:false,table:false}});
  const p=P();
  if(Array.isArray(p.order)&&p.order.every(id=>S.ops.some(o=>o.id===id)))S.order=p.order.slice();
  if(p.orderOk&&!EX)S.order=correctOrderIfInvalid(S.order);
  const N=1<<S.vars.length;
  S.cells=Array.isArray(p.cells)&&p.cells.length===S.ops.length&&p.cells.every(c=>c.length===N)&&!EX?p.cells.map(c=>c.slice()):S.ops.map(()=>Array(N).fill(''));
  if(EX){S.order=[];}
  level=S.level;$('#x3Level').value=String(level);$('#x3Seed').value=seed;
  if(!EX)store.set('last',seed);
  if(push)setHash('t3-'+seed);
  hideMsg('#x3OrderMsg');hideMsg('#x3TableMsg');
  if(p.orderOk&&p.tableOk&&!EX)showMsg('#x3TableMsg','ok','<b>Решено.</b> Это выражение уже сдано. Можно взять новое.');
  if(EX)renderExamBar();
  renderExpr();renderTable();renderStatus();
}
function validOrder(order){const done=new Set();for(const id of order){const n=S.ops.find(o=>o.id===id);for(const c of [n.a,n.b])if(c&&c.op!=='var'&&!done.has(c.id))return false;done.add(id)}return order.length===S.ops.length}
function correctOrderIfInvalid(o){return validOrder(o)?o:S.ops.map(x=>x.id)}
function stepOf(){const m={};S.order.forEach((id,i)=>m[id]=i);return m}
function orderLocked(){const p=P();return EX?S.answered.order:p.orderOk}
function renderExpr(){
  const st=stepOf(),locked=orderLocked();
  $('#x3Expr1').innerHTML=tokens(S.tree).map(t=>{
    if(t.t==='op'){const s=st[t.n.id];return `<button class="opk${s!=null?' set':''}" data-op="${t.n.id}" ${locked?'disabled':''} aria-label="Операция ${OPS[t.n.op].sym}${s!=null?', шаг '+(s+1):''}">${OPS[t.n.op].sym}${s!=null?`<span class="ord">${s+1}</span>`:''}</button>`}
    if(t.t==='v')return `<span class="vv">${t.v}</span>`;
    return `<span class="par">${t.t}</span>`;
  }).join('');
  const p=P();$('#x3OrderTries').textContent=EX?'Зачёт: одна попытка':`Попыток: ${p.orderTries}${p.orderOk?' · сдано':''}`;
  $('#x3CheckOrder').disabled=$('#x3Undo').disabled=$('#x3ResetOrder').disabled=locked;
}
function tableReady(){return EX?S.answered.order:P().orderOk}
function renderTable(){
  const card=$('#x3TableCard');const ready=tableReady();card.classList.toggle('locked',!ready);
  if(!ready){$('#x3Table').innerHTML=`<tbody><tr><td class="wait">Сначала расставь порядок действий: столбцы таблицы появятся в этом порядке.</td></tr></tbody>`;
    $('#x3CheckTable').disabled=$('#x3ClearTable').disabled=true;$('#x3TableTries').textContent='';return}
  const N=1<<S.vars.length,st=stepOf(),last=S.order.length-1;
  const cols=S.order.map(id=>S.ops.find(o=>o.id===id));
  const fullF=plain(S.tree);
  let h=`<thead><tr><th></th>${S.vars.map(v=>`<th>${v}</th>`).join('')}${cols.map((n,k)=>`<th class="${k===last?'f':'sub'}" title="${esc(plain(n))}"><span class="cn">${CIRC[k]}</span><span class="ch">${esc(header(n,st))}</span>${k===last?'<span class="cf">= F</span>':''}${EX&&k!==last?'<span class="cf opt">не проверяется</span>':''}</th>`).join('')}</tr></thead><tbody>`;
  for(let m=0;m<N;m++){const e=envOf(S.vars,m);
    h+=`<tr><td class="n">${m+1}</td>${S.vars.map(v=>`<td>${e[v]}</td>`).join('')}${cols.map((n,k)=>{const ci=S.ops.indexOf(n),v=S.cells[ci][m],mk=S.marks?S.marks[ci][m]:'';
      return `<td class="fc${k===last?' last':''}"><button class="fbtn${v!==''?' filled':''}${mk?' '+mk:''}" data-c="${k}" data-m="${m}" aria-label="Шаг ${k+1}, строка ${m+1}">${v}</button></td>`}).join('')}</tr>`}
  $('#x3Table').innerHTML=h+'</tbody>';
  $('#x3Table').setAttribute('aria-label','Таблица истинности для F = '+fullF);
  const p=P(),locked=EX?S.answered.table:false;
  $('#x3CheckTable').disabled=locked;$('#x3ClearTable').disabled=locked;
  $('#x3TableTries').textContent=EX?'Зачёт: одна попытка, проверяется столбец F':`Попыток: ${p.tableTries}${p.tableOk?' · сдано':''}`;
}
function renderStatus(){
  const p=P(),chip=(cls,txt)=>`<span class="chip ${cls}"><span class="dot"></span>${txt}</span>`;
  const solved=Object.values(progress).filter(x=>x.orderOk&&x.tableOk).length;
  $('#x3Status').innerHTML=chip(p.orderOk?'ok':p.orderTries?'bad':'',`Порядок: <b>${p.orderOk?'верно':p.orderTries?'есть ошибки':'не проверен'}</b>`)+
    chip(p.tableOk?'ok':p.tableTries?'bad':'',`Таблица: <b>${p.tableOk?'верно':p.tableTries?'есть ошибки':'не проверена'}</b>`)+
    `<span class="spacer"></span>`+chip('',`Уровень <b>${S.level}</b> · действий <b>${S.ops.length}</b> · строк <b>${1<<S.vars.length}</b>`)+
    (EX?'':chip('',`Решено выражений: <b>${solved}</b>`));
  renderCounts();
}
function clickOp(id){
  if(orderLocked())return;
  const i=S.order.indexOf(id);
  if(i>=0)S.order=S.order.slice(0,i);else S.order.push(id);
  if(!EX){P().order=S.order.slice();saveP()}
  hideMsg('#x3OrderMsg');renderExpr();
}
function checkOrder(){
  if(orderLocked())return;
  if(S.order.length<S.ops.length){showMsg('#x3OrderMsg','info',`Отмечено ${S.order.length} из ${S.ops.length} действий. Нажми на все операции.`);return}
  const p=P();if(!EX)p.orderTries++;
  const done=new Set();let bad=null;
  for(let k=0;k<S.order.length;k++){const n=S.ops.find(o=>o.id===S.order[k]);
    const need=[n.a,n.b].find(c=>c&&c.op!=='var'&&!done.has(c.id));if(need){bad={k,n,need};break}done.add(n.id)}
  const txt=S.order.map(id=>OPS[S.ops.find(o=>o.id===id).op].sym).join(' → ');
  if(!bad){
    if(EX)S.answered.order=true;else p.orderOk=true;
    addLog(EX?'Зачёт':'Верно','порядок: '+txt,EX?'порядок верно':`порядок с ${p.orderTries}-й попытки`);
    showMsg('#x3OrderMsg','ok',`<b>Верно!</b> Порядок действий правильный. Теперь заполни таблицу.`);
    if(EX)EX.cur.order=true;
  }else{
    const why=bad.need.op==='not'?'отрицание выполняется раньше всех остальных операций':
      PREC[bad.need.op]>PREC[bad.n.op]?`${OPS[bad.need.op].sym} старше, чем ${OPS[bad.n.op].sym}`:'сначала выполняется то, что стоит в скобках';
    addLog(EX?'Зачёт':'Порядок','порядок: '+txt,`шаг ${bad.k+1} (${OPS[bad.n.op].sym}) раньше, чем ${OPS[bad.need.op].sym} внутри него`);
    if(EX){
      S.answered.order=true;EX.cur.order=false;
      S.order=S.ops.map(o=>o.id);
      showMsg('#x3OrderMsg','bad',`<b>Ошибка.</b> Действие ${bad.k+1} (${OPS[bad.n.op].sym}) нельзя выполнить раньше, чем ${OPS[bad.need.op].sym} внутри него: ${why}. Правильный порядок выставлен, переходи к таблице.`);
    }else{
      S.order=S.order.slice(0,bad.k);p.order=S.order.slice();
      showMsg('#x3OrderMsg','bad',`<b>Ошибка в действии ${bad.k+1}.</b> Операцию ${OPS[bad.n.op].sym} нельзя выполнить раньше, чем ${OPS[bad.need.op].sym} внутри неё: ${why}. Шаги с ${bad.k+1}-го сброшены, продолжи с этого места.`);
    }
  }
  saveP();renderExpr();renderTable();renderStatus();
}
function setCell(k,m,v){
  const n=S.ops.find(o=>o.id===S.order[k]),ci=S.ops.indexOf(n);
  S.cells[ci][m]=v;S.marks=null;if(!EX){P().cells=S.cells.map(c=>c.slice());saveP()}
  renderTable();
}
function focusCell(k,m){const b=document.querySelector(`#x3Table .fbtn[data-c="${k}"][data-m="${m}"]`);b&&b.focus()}
function checkTable(){
  if(EX&&S.answered.table)return;
  const N=1<<S.vars.length,last=S.order.length-1;
  const cols=S.order.map(id=>S.ops.find(o=>o.id===id));
  const need=EX?[last]:cols.map((_,k)=>k);
  const empty=need.filter(k=>S.cells[S.ops.indexOf(cols[k])].some(v=>v===''));
  if(empty.length){showMsg('#x3TableMsg','info',EX?'Заполни столбец F целиком.':`Заполни все клетки. Пустые есть в столбцах ${empty.map(k=>CIRC[k]).join(', ')}.`);return}
  const p=P();if(!EX)p.tableTries++;
  S.marks=S.ops.map(()=>Array(N).fill(''));
  let firstBad=null,badCnt=0;
  need.forEach(k=>{const n=cols[k],ci=S.ops.indexOf(n);
    for(let m=0;m<N;m++){const ok=+S.cells[ci][m]===evalN(n,envOf(S.vars,m));S.marks[ci][m]=ok?'ok':'bad';
      if(!ok){badCnt++;if(!firstBad)firstBad={k,n,rows:[]};if(firstBad.k===k)firstBad.rows.push(m+1)}}});
  if(EX){S.answered.table=true;EX.cur.table=!badCnt}
  if(!badCnt){
    if(!EX)p.tableOk=true;
    addLog(EX?'Зачёт':'Верно','таблица',EX?'столбец F верно':`таблица с ${p.tableTries}-й попытки`);
    showMsg('#x3TableMsg','ok',`<b>Верно!</b> ${EX?'Столбец F заполнен правильно.':`Таблица заполнена правильно с ${p.tableTries}-й попытки.`}
      <div class="actions">${EX?`<button class="btn primary" id="x3ExNext">${EX.i<EX.seeds.length-1?'Следующее выражение →':'Итог зачёта'}</button>`:'<button class="btn primary" id="x3NextSeed">Новое выражение →</button>'}</div>`);
  }else{
    const n=firstBad.n,hint=OPS[n.op].hint;
    const dep=[n.a,n.b].filter(c=>c&&c.op!=='var').map(c=>CIRC[S.order.indexOf(c.id)]);
    addLog(EX?'Зачёт':'Таблица',`столбец ${CIRC[firstBad.k]} ${header(n,stepOf())}`,`неверных клеток ${badCnt}; в этом столбце строки ${firstBad.rows.join(', ')}`);
    showMsg('#x3TableMsg','bad',`<b>Ошибка.</b> Неверных клеток: ${badCnt}. Первая ошибка в столбце ${CIRC[firstBad.k]} (${esc(header(n,stepOf()))}), строки ${firstBad.rows.join(', ')}. ${hint}${dep.length?` Значения операндов бери из столбцов ${dep.join(' и ')}.`:''}
      ${EX?`<div class="actions"><button class="btn primary" id="x3ExNext">${EX.i<EX.seeds.length-1?'Следующее выражение →':'Итог зачёта'}</button></div>`:''}`);
  }
  saveP();renderTable();renderStatus();summarize();
}

/* ---------- зачёт ---------- */
function renderExamBar(){
  const bar=$('#x3ExamBar'),app=document.querySelector('.app.t3');
  if(!EX){bar.hidden=true;app.classList.remove('exam');return}
  app.classList.add('exam');bar.hidden=false;
  const dots=EX.seeds.map((s,i)=>`<span class="ex-dot ${i<EX.res.length?(EX.res[i]?'ok':'bad'):i===EX.i?'now':''}"></span>`).join('');
  bar.innerHTML=`<div class="ex-t"><b>Зачёт по теме 3</b><span>${EX.done?'Зачёт завершён':`Выражение ${EX.i+1} из ${EX.seeds.length}`} · одна попытка на порядок и одна на столбец F</span></div>
    <div class="ex-dots">${dots}</div><button class="btn ghost" id="x3ExQuit">${EX.done?'Закрыть зачёт':'Прервать зачёт'}</button>`;
}
function startExam(){
  EX={seeds:[randomSeed(2),randomSeed(2),randomSeed(3)],i:0,res:[],cur:{},done:false};
  addLog('Зачёт','—','Начат зачёт: '+EX.seeds.join(', '));
  setMode('expr',false);S=null;loadSeed(EX.seeds[0]);
}
function examNext(){
  EX.res.push(!!(EX.cur.order&&EX.cur.table));EX.cur={};
  if(EX.i<EX.seeds.length-1){EX.i++;loadSeed(EX.seeds[EX.i]);window.scrollTo(0,0);return}
  EX.done=true;const k=EX.res.filter(Boolean).length,n=EX.seeds.length;
  renderExamBar();
  if(k===n){AL.report('n3',{mastered:true,via:'exam'});addLog('Верно','зачёт',`Зачёт сдан: ${k} из ${n}`);
    showMsg('#x3TableMsg','ok',`<b>Зачёт сдан: ${k} из ${n}.</b> Тема 3 засчитана, на карте открылись следующие ветки.
      <div class="actions"><a class="btn primary" href="#map">На карту навыков</a><button class="btn" id="x3ExStay">Остаться в тренажёре</button></div>`)}
  else{addLog('Зачёт','—',`Не сдан: ${k} из ${n}`);
    showMsg('#x3TableMsg','bad',`<b>Зачёт не сдан: верно ${k} из ${n}.</b> Выражение засчитывается, если верны и порядок, и столбец F. Потренируйся и попробуй снова.
      <div class="actions"><button class="btn primary" id="x3ExRetry">Сдать ещё раз</button><button class="btn" id="x3ExStay">Тренироваться</button></div>`)}
}
function stopExam(){
  if(EX&&!EX.done)addLog('Зачёт','—',`Прерван на выражении ${EX.i+1}`);
  EX=null;renderExamBar();S=null;loadSeed(randomSeed(level));
}

/* ---------- события ---------- */
$('#x3TabOps').onclick=()=>{if(EX)return toast('Сначала закончи или прерви зачёт');setMode('ops')};
$('#x3TabExpr').onclick=()=>setMode('expr');
$('#x3WuBody').addEventListener('click',e=>{
  const f=e.target.closest('.fbtn');if(f&&!WU.done){const m=+f.dataset.wm,v=WU.cells[m];WU.cells[m]=v===''?'1':v==='1'?'0':'1';WU.marks=null;renderWarmup();focusW(m);return}
  if(e.target.id==='x3WuCheck')wuCheck();
  if(e.target.id==='x3WuSkip'||e.target.id==='x3WuNext')nextWarmup();
  if(e.target.id==='x3GoExpr')setMode('expr');
  const c=e.target.closest('.choice');if(c)wuChoose(c.dataset.op);
});
function focusW(m){const b=document.querySelector(`#x3WuBody .fbtn[data-wm="${m}"]`);b&&b.focus()}
$('#x3WuBody').addEventListener('keydown',e=>{
  const f=e.target.closest('.fbtn');if(!f||WU.done)return;const m=+f.dataset.wm,N=WU.cells.length;
  if(e.key==='0'||e.key==='1'){e.preventDefault();WU.cells[m]=e.key;WU.marks=null;renderWarmup();focusW(m<N-1?m+1:m);if(m===N-1)setTimeout(()=>$('#x3WuCheck')&&$('#x3WuCheck').focus(),0)}
  else if(e.key==='Backspace'||e.key==='Delete'){e.preventDefault();WU.cells[m]='';renderWarmup();focusW(m)}
  else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();focusW(Math.max(0,Math.min(N-1,m+(e.key==='ArrowDown'?1:-1))))}
  else if(e.key==='Enter'){e.preventDefault();wuCheck()}
});
$('#x3OpGrid').addEventListener('click',e=>{const b=e.target.closest('[data-train]');if(!b)return;const op=b.dataset.train,n=op==='not'?1:2;
  WU={op,kind:'fill',n,cells:Array(1<<n).fill(''),marks:null,tries:0,done:false};renderWarmup();
  if(window.matchMedia('(max-width:900px)').matches)try{$('#x3WuTitle').scrollIntoView({block:'start',behavior:'smooth'})}catch(err){}});
$('#x3Expr1').addEventListener('click',e=>{const b=e.target.closest('.opk');if(b)clickOp(b.dataset.op)});
$('#x3CheckOrder').onclick=checkOrder;
$('#x3Undo').onclick=()=>{if(orderLocked()||!S.order.length)return;S.order.pop();if(!EX){P().order=S.order.slice();saveP()}renderExpr()};
$('#x3ResetOrder').onclick=()=>{if(orderLocked())return;S.order=[];if(!EX){P().order=[];saveP()}hideMsg('#x3OrderMsg');renderExpr()};
$('#x3Table').addEventListener('click',e=>{const f=e.target.closest('.fbtn');if(!f||(EX&&S.answered.table))return;const k=+f.dataset.c,m=+f.dataset.m;
  const n=S.ops.find(o=>o.id===S.order[k]),v=S.cells[S.ops.indexOf(n)][m];setCell(k,m,v===''?'1':v==='1'?'0':'1');focusCell(k,m)});
$('#x3Table').addEventListener('keydown',e=>{
  const f=e.target.closest('.fbtn');if(!f||(EX&&S.answered.table))return;const k=+f.dataset.c,m=+f.dataset.m,N=1<<S.vars.length,K=S.order.length;
  if(e.key==='0'||e.key==='1'){e.preventDefault();setCell(k,m,e.key);if(m<N-1)focusCell(k,m+1);else if(k<K-1)focusCell(k+1,0);else{focusCell(k,m);}}
  else if(e.key==='Backspace'||e.key==='Delete'){e.preventDefault();setCell(k,m,'');focusCell(k,m)}
  else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();focusCell(k,Math.max(0,Math.min(N-1,m+(e.key==='ArrowDown'?1:-1))))}
  else if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();focusCell(Math.max(0,Math.min(K-1,k+(e.key==='ArrowRight'?1:-1))),m)}
  else if(e.key==='Enter'){e.preventDefault();checkTable()}
});
$('#x3CheckTable').onclick=checkTable;
$('#x3ClearTable').onclick=()=>{S.cells=S.ops.map(()=>Array(1<<S.vars.length).fill(''));S.marks=null;if(!EX){P().cells=null;saveP()}hideMsg('#x3TableMsg');renderTable()};
$('#x3TableMsg').addEventListener('click',e=>{
  if(e.target.id==='x3NextSeed')loadSeed(randomSeed(level));
  if(e.target.id==='x3ExNext')examNext();
  if(e.target.id==='x3ExRetry')startExam();
  if(e.target.id==='x3ExStay')stopExam();
});
$('#x3ExamBar').addEventListener('click',e=>{if(e.target.id==='x3ExQuit')stopExam()});
$('#x3New').onclick=()=>loadSeed(randomSeed(+$('#x3Level').value));
$('#x3Level').onchange=()=>{level=+$('#x3Level').value;store.set('level',level)};
const openSeed=()=>{const s=normSeed($('#x3Seed').value,+$('#x3Level').value);if(!s){toast('Введи номер задания');return}setMode('expr',false);loadSeed(s)};
$('#x3Open').onclick=openSeed;
$('#x3Seed').addEventListener('keydown',e=>{if(e.key==='Enter')openSeed()});
$('#x3Student').value=AL.student.get();
$('#x3Student').addEventListener('input',()=>AL.student.set($('#x3Student').value));
AL.on('student',v=>{if(document.activeElement!==$('#x3Student'))$('#x3Student').value=v});
$('#x3Log').onclick=()=>AL.openLog&&AL.openLog();

function enter(arg){
  if(arg==='exam'){startExam();return}
  if(EX&&EX.done&&!arg){stopExam();return}
  if(EX&&!arg){setHash('t3-'+S.seed);return}
  if(arg==='ops'){setMode('ops',false);return}
  const s=arg?normSeed(arg,level):null;
  if(s){if(EX&&!EX.seeds.includes(s)){EX=null;renderExamBar()}setMode('expr',false);if(!S||S.seed!==s)loadSeed(s,false);return}
  setMode(mode,true);
}
function refresh(){ops=store.get('ops',{});progress=store.get('progress',{});log=store.get('log',[]);renderOpGrid();if(S)renderStatus()}
$('#x3Level').value=String(level);
return {enter,refresh};
}

AL.register('t3',{title:'Операции',logRows:()=>store.get('log',[]),exportData,importData,enter:arg=>mount().enter(arg)});
summarize();
})();
