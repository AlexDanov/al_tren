/* Тренажёр 4 «Тождества»: доказательство тождеств таблицей истинности, контрпример, тавтологии и противоречия. */
(()=>{
const store=AL.store.scoped('t4');
const L=AL.logic;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- банк пар: [E1, E2, пояснение]. Равны ли — вычисляется по таблице ---------- */
const PAIRS1=[
  ['¬(A∧B)','¬A∨¬B','Закон де Моргана: отрицание конъюнкции — дизъюнкция отрицаний.'],
  ['¬(A∧B)','¬A∧¬B','Частая ошибка: при отрицании конъюнкции знак меняется на ∨.'],
  ['¬(A∨B)','¬A∧¬B','Закон де Моргана: отрицание дизъюнкции — конъюнкция отрицаний.'],
  ['¬(A∨B)','¬A∨¬B','Частая ошибка: при отрицании дизъюнкции знак меняется на ∧.'],
  ['A→B','¬A∨B','Раскрытие импликации: A → B = ¬A ∨ B.'],
  ['A→B','B→A','Обратная импликация не равна прямой: «если дождь, то мокро» не значит «если мокро, то дождь».'],
  ['A→B','¬B→¬A','Закон контрапозиции: импликацию можно «перевернуть», отрицая обе части.'],
  ['A→B','¬A→¬B','Частая ошибка: отрицать обе части без перестановки нельзя.'],
  ['A→B','A∨¬B','Отрицание ставится перед левой частью импликации, а не перед правой.'],
  ['A≡B','(A→B)∧(B→A)','Эквивалентность — это импликация в обе стороны.'],
  ['A≡B','A∧B∨¬A∧¬B','Эквивалентность истинна, когда оба 1 или оба 0.'],
  ['A⊕B','¬(A≡B)','Исключающее ИЛИ — отрицание эквивалентности.'],
  ['A⊕B','A∨B','Отличаются в строке A = B = 1: там ⊕ даёт 0, а ∨ даёт 1.'],
  ['A⊕B','A∧¬B∨¬A∧B','Исключающее ИЛИ: ровно одна из переменных равна 1.'],
  ['A∨A∧B','A','Закон поглощения.'],
  ['A∧(A∨B)','A','Закон поглощения.'],
  ['A∨¬A∧B','A∨B','Закон склеивания с отрицанием: ¬A в этой дизъюнкции можно убрать.'],
  ['A∧(¬A∨B)','A∧B','¬A в скобке можно убрать: при A = 1 оно равно 0.'],
  ['A∧(A∨B)','A∨B','Поглощение даёт A, а не A ∨ B.'],
  ['¬(A→B)','A∧¬B','Отрицание импликации: она ложна только при A = 1, B = 0.'],
  ['¬(A→B)','¬A→¬B','Частая ошибка: отрицание импликации — не импликация отрицаний.'],
  ['¬(A≡B)','¬A≡¬B','¬A ≡ ¬B равно A ≡ B, а не его отрицанию.'],
  ['¬A≡B','A⊕B','Эквивалентность с отрицанием одной части — это исключающее ИЛИ.']
];
const PAIRS2=[
  ['A∧(B∨C)','A∧B∨A∧C','Распределительный закон для ∧ относительно ∨.'],
  ['A∨B∧C','(A∨B)∧(A∨C)','Распределительный закон для ∨ относительно ∧ — в обычной алгебре такого нет.'],
  ['A∨B∧C','(A∨B)∧C','Скобки переставлять нельзя: ∧ выполняется раньше ∨.'],
  ['A∧(B∨C)','A∧B∨C','Скобки переставлять нельзя: в левой части A относится и к B, и к C.'],
  ['A→(B→C)','A∧B→C','Две посылки можно объединить конъюнкцией.'],
  ['A→(B→C)','(A→B)→C','Импликация не ассоциативна: скобки меняют смысл.'],
  ['(A→B)∧(A→C)','A→B∧C','Если из A следует и B, и C, то из A следует B ∧ C.'],
  ['(A→C)∧(B→C)','A∨B→C','Разбор случаев: если C следует и из A, и из B, то C следует из A ∨ B.'],
  ['(A→C)∧(B→C)','A∧B→C','Из A ∧ B → C не следует, что C вытекает из каждого по отдельности.'],
  ['(A→B)∨(A→C)','A→B∨C','Импликация распределяется по ∨ в правой части.'],
  ['¬(A∧B∧C)','¬A∨¬B∨¬C','Закон де Моргана для трёх переменных.'],
  ['¬(A∨B∨C)','¬A∨¬B∨¬C','Частая ошибка: отрицание дизъюнкции — конъюнкция отрицаний.'],
  ['A∧B∨A∧¬B','A','Склеивание: A ∧ B ∨ A ∧ ¬B = A ∧ (B ∨ ¬B) = A.'],
  ['(A∨B)∧(A∨¬B)','A','Склеивание в конъюнктивной форме.'],
  ['A→B∨C','(A→B)∧(A→C)','A → B ∨ C слабее: достаточно одного из B, C.']
];
const TAUT1=['A∨¬A','A∧¬A','(A→B)∧A→B','(A→B)∧¬B→¬A','A→A∨B','A∧B→A','(A→B)→(B→A)','A∧¬(A∨B)','(A→B)∧A∧¬B','A→(B→A)','(A⊕B)∧(A≡B)','A∨B→A','A→B∧¬B','(A≡B)∨(A⊕B)','¬(A∧¬A)','(A∨B)∧¬A'];
const TAUT2=['(A→B)∧(B→C)→(A→C)','(A→B)∧(B→C)∧A∧¬C','(A∨B)∧¬A→B','A∧(B∨C)→A∧B','(A→C)∧(B→C)→(A∨B→C)','(A∨B)∧(¬A∨C)→B∨C','A→B∨C','(A→B)∧(A→¬B)∧A','A∧B→C','(A∨B)∧(¬A∨¬B)∧(A≡B)'];
const NOTES={'A∨¬A':'Закон исключённого третьего.','A∧¬A':'Закон противоречия.','(A→B)∧A→B':'Правило вывода modus ponens: из A → B и A следует B.','(A→B)∧¬B→¬A':'Правило modus tollens.','(A→B)∧(B→C)→(A→C)':'Транзитивность импликации: цепочка выводов.','(A∨B)∧(¬A∨C)→B∨C':'Правило резолюции — на нём работают программы автоматического доказательства.'};

/* ---------- SEED ---------- */
function xmur3(str){let h=1779033703^str.length;for(let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353);h=h<<13|h>>>19}
  return()=>{h=Math.imul(h^(h>>>16),2246822507);h=Math.imul(h^(h>>>13),3266489909);return(h^=h>>>16)>>>0}}
function mulberry32(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
/* «2-ABCDE» — тождество, «T2-ABCDE» — тавтология */
function normSeed(raw,lvl,mode){
  let s=String(raw||'').toUpperCase().replace(/[^A-Z0-9-]/g,'').replace(/^-+|-+$/g,'');if(!s)return null;
  if(/^T[123]-./.test(s)||/^[123]-./.test(s))return s.slice(0,24);
  return (mode==='ta'?'T':'')+lvl+'-'+s.slice(0,20);
}
function randomSeed(lvl,mode){const A='ABCDEFGHJKMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<5;i++)s+=A[Math.floor(Math.random()*A.length)];return (mode==='ta'?'T':'')+lvl+'-'+s}
const seedMode=s=>s[0]==='T'?'ta':'id';
const seedLvl=s=>+(s[0]==='T'?s[1]:s[0])||1;

const V=n=>({op:'var',v:n}),N=a=>a.op==='not'?a.a:{op:'not',a},B2=(op,a,b)=>({op,a,b});
/* без «C ≡ C», «A ∨ ¬A» и двойных отрицаний внутри */
function clean(t){let ok=true;const w=n=>{if(n.op==='not'&&n.a.op==='not')ok=false;if(n.b){const pa=L.pretty(n.a),pb=L.pretty(n.b);if(pa===pb||pa==='¬'+pb||pb==='¬'+pa||pa==='¬('+pb+')'||pb==='¬('+pa+')')ok=false}if(n.a)w(n.a);if(n.b)w(n.b)};w(t);return ok}
const clone=n=>JSON.parse(JSON.stringify(n));
const varsOf=(...ts)=>{const s=new Set();ts.forEach(t=>L.vars(t,s));return [...s].sort()};
const table=(t,vs)=>[...Array(1<<vs.length).keys()].map(m=>{const e={};vs.forEach((v,i)=>e[v]=(m>>(vs.length-1-i))&1);return L.evaluate(t,e)});
/* равносильные переписывания узла */
function eqRewrites(n){
  const out=[];
  if(n.op==='imp'){out.push(B2('or',N(n.a),n.b));out.push(B2('imp',N(n.b),N(n.a)))}
  if(n.op==='not'&&n.a.op==='and')out.push(B2('or',N(n.a.a),N(n.a.b)));
  if(n.op==='not'&&n.a.op==='or')out.push(B2('and',N(n.a.a),N(n.a.b)));
  if(n.op==='not'&&n.a.op==='imp')out.push(B2('and',n.a.a,N(n.a.b)));
  if(n.op==='eq'){out.push(B2('and',B2('imp',n.a,n.b),B2('imp',n.b,n.a)));out.push(B2('eq',N(n.a),N(n.b)))}
  if(n.op==='xor')out.push(N(B2('eq',n.a,n.b)));
  if(n.op==='and'||n.op==='or'){out.push(B2(n.op,n.b,n.a));
    const o=n.op==='and'?'or':'and';if(n.b.op===o)out.push(B2(o,B2(n.op,n.a,n.b.a),B2(n.op,n.a,n.b.b)))}
  return out;
}
/* правдоподобные, но обычно неравносильные искажения */
function mutations(n){
  const out=[];
  if(n.op==='imp'){out.push(B2('imp',n.b,n.a));out.push(B2('imp',N(n.a),N(n.b)))}
  if(n.op==='not'&&(n.a.op==='and'||n.a.op==='or'))out.push(B2(n.a.op,N(n.a.a),N(n.a.b)));
  if(n.op==='and')out.push(B2('or',n.a,n.b));
  if(n.op==='or')out.push(B2('and',n.a,n.b));
  if(n.op==='xor')out.push(B2('or',n.a,n.b));
  if(n.op==='eq')out.push(B2('imp',n.a,n.b));
  if(n.op==='not')out.push(n.a);
  return out;
}
function nodes(t,acc=[],path=[]){acc.push(path);if(t.a)nodes(t.a,acc,path.concat('a'));if(t.b)nodes(t.b,acc,path.concat('b'));return acc}
const at=(t,p)=>p.reduce((n,k)=>n[k],t);
function replaceAt(t,p,v){if(!p.length)return v;const c=clone(t);let n=c;for(let i=0;i<p.length-1;i++)n=n[p[i]];n[p[p.length-1]]=v;return c}
function applyRandom(t,fn,r){
  const cands=nodes(t).map(p=>({p,opts:fn(at(t,p))})).filter(x=>x.opts.length);
  if(!cands.length)return null;const c=cands[Math.floor(r()*cands.length)];return replaceAt(t,c.p,c.opts[Math.floor(r()*c.opts.length)]);
}
function randExpr(r,vars,k){
  const pick=a=>a[Math.floor(r()*a.length)];
  const leaves=[...vars];while(leaves.length<k+1)leaves.push(pick(vars));
  for(let i=leaves.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[leaves[i],leaves[j]]=[leaves[j],leaves[i]]}
  let li=0;const b=c=>{let n=c===0?V(leaves[li++]):(()=>{const l=Math.floor(r()*c);return B2(pick(['and','or','imp','or','and','eq','xor']),b(l),b(c-1-l))})();if(r()<.25)n=N(n);return n};
  return b(k);
}
function generate(seed){
  const mode=seedMode(seed),lvl=seedLvl(seed);
  const r=mulberry32(xmur3(seed)());const pick=a=>a[Math.floor(r()*a.length)];
  const doSwap=r()<.5;const swap=t=>{if(!doSwap)return t;const m={A:'B',B:'A'};const f=n=>n.op==='var'?V(m[n.v]||n.v):Object.assign({},n,n.a?{a:f(n.a)}:{},n.b?{b:f(n.b)}:{});return f(t)};
  if(mode==='id'){
    if(lvl<3){const [a,b,why]=pick(lvl===1?PAIRS1:PAIRS2);let e1=L.parse(a),e2=L.parse(b);if(lvl===1){e1=swap(e1);e2=swap(e2)}if(r()<.5)[e1,e2]=[e2,e1];
      return {seed,mode,level:lvl,e1,e2,why,vars:varsOf(e1,e2)}}
    for(let a=0;a<200;a++){
      const rr=mulberry32(xmur3(seed+'#'+a)());
      const e1=randExpr(rr,['A','B','C'],2+Math.floor(rr()*2));
      const vs=varsOf(e1);if(vs.length<3||!clean(e1))continue;
      const t1=table(e1,vs);if(t1.every(x=>x)||t1.every(x=>!x))continue;
      const wantEq=rr()<.5;let e2=e1;
      if(!wantEq){e2=applyRandom(e2,mutations,rr);if(!e2)continue}
      for(let k=0;k<2;k++){const x=applyRandom(e2,eqRewrites,rr);if(x)e2=x}
      if(L.pretty(e2)===L.pretty(e1)||!clean(e2))continue;
      const same=table(e2,vs).every((v,i)=>v===t1[i]);if(same!==wantEq)continue;
      if(L.pretty(e2).length>40)continue;
      return {seed,mode,level:3,e1,e2,why:same?'Правую часть можно получить из левой равносильными преобразованиями.':'При переписывании одна операция была искажена.',vars:vs};
    }
  }else{
    if(lvl<3){const f=L.parse(pick(lvl===1?TAUT1:TAUT2));const src=L.pretty(f);return {seed,mode,level:lvl,f,why:NOTES[Object.keys(NOTES).find(k=>L.pretty(L.parse(k))===src)]||'',vars:varsOf(f)}}
    for(let a=0;a<200;a++){
      const rr=mulberry32(xmur3(seed+'#'+a)());
      const kind=rr();
      const e1=randExpr(rr,['A','B','C'],2);let e2=e1;for(let k=0;k<2;k++){const x=applyRandom(e2,eqRewrites,rr);if(x)e2=x}
      let f;
      if(kind<.34)f=B2('eq',e1,e2);else if(kind<.67)f=B2('xor',e1,e2);else f=randExpr(rr,['A','B','C'],3);
      if(kind<.67&&L.pretty(e1)===L.pretty(e2))continue;
      const vs=varsOf(f);if(vs.length<3||L.pretty(f).length>40||!clean(kind<.67?e1:f)||!clean(e2))continue;
      return {seed,mode,level:3,f,why:kind<.34?'Это эквивалентность двух равносильных выражений, поэтому она всегда истинна.':kind<.67?'Это ⊕ двух равносильных выражений: они всегда совпадают, поэтому ⊕ всегда даёт 0.':'',vars:vs};
    }
  }
  return generate((mode==='ta'?'T':'')+lvl+'-FALLBACK');
}
function postSteps(t){const out=[];const w=n=>{if(n.op==='var'||n.op==='const')return;if(n.a)w(n.a);if(n.b)w(n.b);out.push(n)};w(t);out.pop();return out}

const MARKUP=`<div class="app t4">
  <header class="top">
    <div class="brand">
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><rect x="4" y="6" width="32" height="28" rx="3" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2.4"/><path d="M15 6v28M25 6v28" stroke="var(--ink)" stroke-width="1.6"/><path d="M18 14h4M18 20h4M18 26h4" stroke="var(--live)" stroke-width="2.6" stroke-linecap="round"/><path d="M28 14h4M28 20h4M28 26h4" stroke="var(--live)" stroke-width="2.6" stroke-linecap="round"/></svg>
      <div><a class="back" href="#map">← Карта навыков</a><h1>Тождества</h1><p>Доказательство и опровержение тождеств таблицей истинности</p></div>
    </div>
    <div class="controls">
      <div class="field"><label for="x4Student">Ученик</label><input type="text" id="x4Student" placeholder="Фамилия Имя" autocomplete="off"></div>
      <div class="field x4-pr"><label for="x4Seed">Задание №</label><div class="row"><input type="text" id="x4Seed" class="seedin" spellcheck="false" autocomplete="off"><button class="btn" id="x4Open">Открыть</button></div></div>
      <div class="field x4-pr"><label for="x4Level">Уровень</label><div class="row"><select id="x4Level"><option value="1">1 · законы для A, B</option><option value="2">2 · законы для A, B, C</option><option value="3">3 · произвольные выражения</option></select><button class="btn primary" id="x4New">Новое задание</button></div></div>
      <button class="btn" id="x4Log">Журнал</button>
    </div>
  </header>
  <div class="exam-bar" id="x4ExamBar" hidden></div>
  <div class="seg" role="tablist" aria-label="Режим">
    <button role="tab" id="x4TabId" aria-selected="true">Тождество? <span class="pill ok" id="x4IdCnt">0/6</span></button>
    <button role="tab" id="x4TabTa" aria-selected="false">Тавтология? <span class="pill ok" id="x4TaCnt">0/3</span></button>
  </div>
  <div class="status" id="x4Status"></div>
  <div class="card">
    <div class="card-h"><span class="step">1</span><h2>Таблица истинности</h2><p id="x4Sub"></p></div>
    <div class="body">
      <div class="exprs" id="x4Exprs"></div>
      <label class="steps-t"><input type="checkbox" id="x4Steps"> Показать столбцы для промежуточных шагов (черновик, не проверяется)</label>
      <div class="tt-wrap"><table class="tt t4tt" id="x4Table"></table></div>
      <div class="actions"><button class="btn primary" id="x4CheckT">Проверить таблицу</button><button class="btn ghost" id="x4ClearT">Очистить</button><span class="tries" id="x4TTries"></span></div>
      <div class="msg" id="x4TMsg"></div>
    </div>
  </div>
  <div class="card" id="x4VCard">
    <div class="card-h"><span class="step">2</span><h2>Вывод</h2><p id="x4VSub"></p></div>
    <div class="body">
      <div class="verdict" id="x4Verdict"></div>
      <div class="actions"><button class="btn primary" id="x4CheckV">Проверить вывод</button><span class="tries" id="x4VTries"></span></div>
      <div class="msg" id="x4VMsg"></div>
    </div>
  </div>
</div>
<div class="toast" id="x4Toast"></div>`;

/* ---------- прогресс ---------- */
function summarize(){
  const prog=store.get('progress',{});
  if(!Object.keys(prog).length&&!AL.node('n4').touched)return;
  const sol=Object.entries(prog).filter(([k,p])=>p.tOk&&p.vOk);
  const id=sol.filter(([k])=>seedMode(k)==='id'),ta=sol.filter(([k])=>seedMode(k)==='ta'),hi=id.filter(([k])=>seedLvl(k)>=2).length;
  const nI=Math.min(id.length,6),nT=Math.min(ta.length,3),mastered=id.length>=6&&hi>=2&&ta.length>=3;
  AL.report('n4',{done:nI+nT,total:9,note:`Тождества ${nI} из 6 · тавтологии ${nT} из 3`+(nI>=4&&hi<2?` · уровня 2–3: ${hi} из 2`:''),mastered,via:mastered?'practice':undefined});
}
function exportData(){const prog=store.get('progress',{}),o={};Object.entries(prog).slice(-300).forEach(([k,p])=>o[k]=[p.tOk?1:0,p.vOk?1:0,p.tTries||0,p.vTries||0,p.first||'']);return {p:o}}
function importData(d){if(!d)return;const prog=store.get('progress',{});
  for(const [k,a] of Object.entries(d.p||{})){const c=prog[k]||(prog[k]={tTries:0,vTries:0,tOk:false,vOk:false,first:a[4]||new Date().toISOString()});
    c.tOk=c.tOk||!!a[0];c.vOk=c.vOk||!!a[1];c.tTries=Math.max(c.tTries,a[2]||0);c.vTries=Math.max(c.vTries,a[3]||0)}
  store.set('progress',prog);summarize();if(api)api.refresh()}

let api=null;
function mount(){if(api)return api;document.getElementById('view-t4').innerHTML=MARKUP;api=init();return api}

function init(){
const $=s=>document.querySelector(s);
let progress=store.get('progress',{}),log=store.get('log',[]),level=store.get('level',1),mode=store.get('mode','id'),showSteps=store.get('steps',false);
let S=null,EX=null;
const saveP=()=>store.set('progress',progress);
function addLog(stage,input,note){log.push({t:new Date().toISOString(),seed:S?S.seed:'—',student:AL.student.get(),stage,input,note});if(log.length>3000)log=log.slice(-3000);store.set('log',log)}
function toast(t){const el=$('#x4Toast');el.textContent=t;el.classList.add('show');clearTimeout(toast.h);toast.h=setTimeout(()=>el.classList.remove('show'),1800)}
function showMsg(sel,cls,html){const el=$(sel);el.className='msg show '+cls;el.innerHTML=html}
function hideMsg(sel){$(sel).className='msg'}
function setHash(h){if(location.hash.slice(1)!==h){try{history.replaceState(null,'','#'+h)}catch(e){location.hash=h}}}
const app=()=>document.querySelector('.app.t4');

function setMode(m,push=true){
  mode=m;if(!EX)store.set('mode',m);
  $('#x4TabId').setAttribute('aria-selected',m==='id');$('#x4TabTa').setAttribute('aria-selected',m==='ta');
  if(!S||seedMode(S.seed)!==m){const last=store.get('last-'+m,null);loadSeed(last||randomSeed(level,m),push)}
  else if(push&&!EX)setHash('t4-'+S.seed);
  renderCounts();
}
function renderCounts(){
  const sol=Object.entries(progress).filter(([k,p])=>p.tOk&&p.vOk);
  $('#x4IdCnt').textContent=Math.min(sol.filter(([k])=>seedMode(k)==='id').length,6)+'/6';
  $('#x4TaCnt').textContent=Math.min(sol.filter(([k])=>seedMode(k)==='ta').length,3)+'/3';
}
function P(){return progress[S.seed]||(progress[S.seed]={tTries:0,vTries:0,tOk:false,vOk:false,first:new Date().toISOString()})}
function finals(){return S.mode==='id'?[{key:'e1',t:S.e1,label:'E₁'},{key:'e2',t:S.e2,label:'E₂'}]:[{key:'f',t:S.f,label:'F'}]}
function columns(){
  const out=[];finals().forEach(f=>{if(showSteps)postSteps(f.t).forEach((n,i)=>out.push({key:f.key+'s'+i,t:n,label:L.pretty(n),step:true}));out.push({key:f.key,t:f.t,label:f.label,final:true})});
  return out;
}
function loadSeed(seed,push=true){
  const g=generate(seed);S=Object.assign(g,{cells:{},marks:null,verdict:null,cex:null,done:{t:false,v:false}});
  S.N=1<<S.vars.length;S.truth={};finals().forEach(f=>S.truth[f.key]=table(f.t,S.vars));
  const p=P();
  if(!EX&&p.cells&&typeof p.cells==='object')Object.entries(p.cells).forEach(([k,v])=>{if(Array.isArray(v)&&v.length===S.N)S.cells[k]=v.slice()});
  level=S.level;$('#x4Level').value=String(level);$('#x4Seed').value=seed;
  if(!EX)store.set('last-'+S.mode,seed);if(push&&!EX)setHash('t4-'+seed);
  hideMsg('#x4TMsg');hideMsg('#x4VMsg');
  if(p.tOk&&p.vOk&&!EX)showMsg('#x4VMsg','ok','<b>Решено.</b> Это задание уже сдано. Можно взять новое.');
  render();
}
const cell=(k,m)=>(S.cells[k]||[])[m]??'';
const tReady=()=>EX?S.done.t:P().tOk;
function render(){
  $('#x4TabId').setAttribute('aria-selected',S.mode==='id');$('#x4TabTa').setAttribute('aria-selected',S.mode==='ta');
  if(S.mode==='id'){
    $('#x4Sub').textContent='Заполни столбцы E₁ и E₂. Если они совпадут во всех строках — тождество доказано.';
    $('#x4Exprs').innerHTML=`<div class="ex"><span class="en">E₁</span> = ${esc(L.pretty(S.e1))}</div><div class="ex"><span class="en">E₂</span> = ${esc(L.pretty(S.e2))}</div><div class="qq">Верно ли, что E₁ = E₂ при любых значениях ${S.vars.join(', ')}?</div>`;
  }else{
    $('#x4Sub').textContent='Заполни столбец F и посмотри, какие значения он принимает.';
    $('#x4Exprs').innerHTML=`<div class="ex"><span class="en">F</span> = ${esc(L.pretty(S.f))}</div><div class="qq">Всегда ли F истинно? Всегда ли ложно?</div>`;
  }
  $('#x4Steps').checked=showSteps;
  renderTable();renderVerdict();renderStatus();
}
function renderTable(){
  const cols=columns(),locked=tReady(),pickRow=S.verdict==='no'&&!(EX?S.done.v:P().vOk);
  let h=`<thead><tr><th></th>${S.vars.map(v=>`<th>${v}</th>`).join('')}${cols.map(c=>`<th class="${c.final?'f':'st'}" title="${esc(L.pretty(c.t))}">${esc(c.label)}</th>`).join('')}</tr></thead><tbody>`;
  for(let m=0;m<S.N;m++){
    const e={};S.vars.forEach((v,i)=>e[v]=(m>>(S.vars.length-1-i))&1);
    const differ=S.mode==='id'&&locked&&S.truth.e1[m]!==S.truth.e2[m];
    h+=`<tr class="${S.cex===m?'cex':''}${pickRow?' pick':''}" data-m="${m}"><td class="n">${pickRow?`<button class="rowpick" data-row="${m}" aria-label="Строка ${m+1} — контрпример">${m+1}</button>`:m+1}</td>${S.vars.map(v=>`<td>${e[v]}</td>`).join('')}${cols.map((c,ci)=>{
      const v=c.final&&locked?String(S.truth[c.key][m]):cell(c.key,m),mk=S.marks&&c.final?S.marks[c.key][m]:'';
      return `<td class="fc${c.final?' fin':''}${differ&&c.final?' diff':''}"><button class="fbtn${v!==''?' filled':''}${mk?' '+mk:''}${c.step?' draft':''}" data-c="${ci}" data-m="${m}" ${c.final&&locked?'disabled':''} aria-label="${esc(c.label)}, строка ${m+1}">${v}</button></td>`}).join('')}</tr>`;
  }
  $('#x4Table').innerHTML=h+'</tbody>';
  const p=P();$('#x4TTries').textContent=EX?'Зачёт: одна попытка':`Попыток: ${p.tTries}${p.tOk?' · сдано':''}`;
  $('#x4CheckT').disabled=$('#x4ClearT').disabled=locked;
}
function renderVerdict(){
  const ready=tReady(),vlocked=EX?S.done.v:P().vOk;$('#x4VCard').classList.toggle('locked',!ready);
  if(!ready){$('#x4VSub').textContent='';$('#x4Verdict').innerHTML='<p class="wait">Сначала верно заполни таблицу: вывод делают по ней.</p>';$('#x4CheckV').disabled=true;$('#x4VTries').textContent='';return}
  const opts=S.mode==='id'?[['yes','E₁ = E₂ — это тождество'],['no','Не тождество: есть набор, где значения различаются']]:[['T','Тождественно истинно (тавтология)'],['F','Тождественно ложно (противоречие)'],['S','Выполнимо, но не всегда истинно']];
  $('#x4VSub').textContent=S.mode==='id'?'Сделай вывод по таблице. Если не тождество, отметь в таблице строку-контрпример: нажми на её номер.':'Сделай вывод по столбцу F.';
  $('#x4Verdict').innerHTML=opts.map(([v,t])=>`<button class="btn vopt${S.verdict===v?' sel':''}" data-v="${v}" ${vlocked?'disabled':''}>${t}</button>`).join('')+
    (S.mode==='id'&&S.verdict==='no'?`<p class="cexl">${S.cex!=null?`Контрпример: строка ${S.cex+1}.`:'Нажми на номер строки в таблице, где E₁ и E₂ различаются.'}</p>`:'');
  $('#x4CheckV').disabled=vlocked;
  const p=P();$('#x4VTries').textContent=EX?'Зачёт: одна попытка':`Попыток: ${p.vTries}${p.vOk?' · сдано':''}`;
}
function renderStatus(){
  const p=P(),chip=(c,t)=>`<span class="chip ${c}"><span class="dot"></span>${t}</span>`;
  $('#x4Status').innerHTML=chip(p.tOk?'ok':p.tTries?'bad':'',`Таблица: <b>${p.tOk?'верно':p.tTries?'есть ошибки':'не проверена'}</b>`)+
    chip(p.vOk?'ok':p.vTries?'bad':'',`Вывод: <b>${p.vOk?'верно':p.vTries?'есть ошибки':'не сделан'}</b>`)+'<span class="spacer"></span>'+
    chip('',`${S.mode==='id'?'Тождество':'Тавтология'} · уровень <b>${S.level}</b> · строк <b>${S.N}</b>`);
  renderCounts();
}
function setCell(ci,m,v){const c=columns()[ci];if(c.final&&tReady())return;(S.cells[c.key]||(S.cells[c.key]=Array(S.N).fill('')))[m]=v;S.marks=null;if(!EX){P().cells=S.cells;saveP()}renderTable()}
function focusCell(ci,m){const b=$(`#x4Table .fbtn[data-c="${ci}"][data-m="${m}"]`);b&&b.focus()}
function checkT(){
  if(tReady())return;
  const fs=finals(),empty=fs.filter(f=>[...Array(S.N).keys()].some(m=>cell(f.key,m)===''));
  if(empty.length){showMsg('#x4TMsg','info',`Заполни столбец${empty.length>1?'цы':''} ${empty.map(f=>f.label).join(' и ')} целиком.`);return}
  const p=P();if(!EX)p.tTries++;
  S.marks={};let bad=[];
  fs.forEach(f=>{S.marks[f.key]=[...Array(S.N).keys()].map(m=>{const ok=+cell(f.key,m)===S.truth[f.key][m];if(!ok)bad.push(`${f.label}: строка ${m+1}`);return ok?'ok':'bad'})});
  if(!bad.length){
    if(EX){S.done.t=true;EX.cur.t=true}else p.tOk=true;
    addLog(EX?'Зачёт':'Верно','таблица',EX?'таблица верно':`таблица с ${p.tTries}-й попытки`);
    showMsg('#x4TMsg','ok','<b>Верно!</b> Таблица заполнена правильно. Теперь сделай вывод.');
  }else{
    addLog(EX?'Зачёт':'Таблица','ошибки в '+bad.slice(0,6).join('; '),`неверных клеток ${bad.length}`);
    if(EX){S.done.t=true;EX.cur.t=false;showMsg('#x4TMsg','bad',`<b>Ошибка.</b> Неверных клеток: ${bad.length}. Правильные значения выставлены, сделай вывод по ним.`)}
    else showMsg('#x4TMsg','bad',`<b>Ошибка.</b> Неверных клеток: ${bad.length}, они отмечены красным. Включи столбцы для промежуточных шагов, если считать в уме трудно.`);
  }
  saveP();renderTable();renderVerdict();renderStatus();summarize();
}
function checkV(){
  if(EX?S.done.v:P().vOk)return;
  if(!S.verdict){showMsg('#x4VMsg','info','Выбери вывод.');return}
  let right,ok,why;
  if(S.mode==='id'){
    const diffRows=[...Array(S.N).keys()].filter(m=>S.truth.e1[m]!==S.truth.e2[m]);right=diffRows.length?'no':'yes';
    if(S.verdict==='no'&&S.cex==null&&right==='no'){showMsg('#x4VMsg','info','Отметь строку-контрпример: нажми на её номер в таблице.');return}
    ok=S.verdict===right&&(right==='yes'||diffRows.includes(S.cex));
    if(right==='yes')why=`Столбцы E₁ и E₂ совпали во всех ${S.N} строках — тождество доказано. ${S.why||''}`;
    else{const m=S.verdict==='no'&&S.cex!=null&&!diffRows.includes(S.cex)?S.cex:null;
      why=(m!=null?`В строке ${m+1} значения совпадают, это не контрпример. `:'')+`Значения различаются в строк${diffRows.length>1?'ах':'е'} ${diffRows.map(x=>x+1).join(', ')}: одного такого набора достаточно, чтобы опровергнуть тождество. ${S.why||''}`}
  }else{
    const t=S.truth.f;right=t.every(x=>x)?'T':t.every(x=>!x)?'F':'S';ok=S.verdict===right;
    why=right==='T'?`F = 1 во всех ${S.N} строках: это тавтология.`:right==='F'?`F = 0 во всех ${S.N} строках: это противоречие.`:`F принимает и 0, и 1: например, строка ${t.indexOf(1)+1} даёт 1, строка ${t.indexOf(0)+1} даёт 0.`;
    if(S.why)why+=' '+S.why;
  }
  const p=P();if(!EX)p.vTries++;
  addLog(EX?'Зачёт':ok?'Верно':'Вывод',S.verdict+(S.cex!=null?` (строка ${S.cex+1})`:''),ok?'вывод верно':'верно: '+right);
  if(EX){S.done.v=true;EX.cur.v=ok;
    showMsg('#x4VMsg',ok?'ok':'bad',`<b>${ok?'Верно.':'Неверно.'}</b> ${esc(why)}<div class="actions"><button class="btn primary" id="x4ExNext">${EX.i<EX.tasks.length-1?'Дальше →':'Итог зачёта'}</button></div>`);renderExamBar()}
  else if(ok){p.vOk=true;showMsg('#x4VMsg','ok',`<b>Верно!</b> ${esc(why)}<div class="actions"><button class="btn primary" id="x4NextSeed">Новое задание →</button></div>`)}
  else showMsg('#x4VMsg','bad',`<b>Неверно.</b> Посмотри на таблицу ещё раз${S.mode==='id'?': сравни столбцы E₁ и E₂ построчно':': какие значения принимает F'}.`);
  saveP();renderTable();renderVerdict();renderStatus();summarize();
}

/* ---------- зачёт: тождество уровня 2, тавтология уровня 2, тождество уровня 3 ---------- */
function startExam(){
  EX={tasks:[randomSeed(2,'id'),randomSeed(2,'ta'),randomSeed(3,'id')],i:0,res:[],cur:{},done:false};
  addLog('Зачёт','—','Начат зачёт: '+EX.tasks.join(', '));app().classList.add('exam');showTask();
}
function showTask(){EX.cur={};loadSeed(EX.tasks[EX.i],false);renderExamBar();window.scrollTo(0,0)}
function renderExamBar(){
  const bar=$('#x4ExamBar');if(!EX){bar.hidden=true;app().classList.remove('exam');return}
  bar.hidden=false;
  bar.innerHTML=`<div class="ex-t"><b>Зачёт по теме 4</b><span>${EX.done?'Зачёт завершён':`Задание ${EX.i+1} из ${EX.tasks.length}`} · одна попытка на таблицу и одна на вывод, проверяются только итоговые столбцы</span></div>
    <div class="ex-dots">${EX.tasks.map((t,i)=>`<span class="ex-dot ${i<EX.res.length?(EX.res[i]?'ok':'bad'):i===EX.i?'now':''}"></span>`).join('')}</div>
    <button class="btn ghost" id="x4ExQuit">${EX.done?'Закрыть зачёт':'Прервать зачёт'}</button>`;
}
function examNext(){
  EX.res.push(!!(EX.cur.t&&EX.cur.v));
  if(EX.i<EX.tasks.length-1){EX.i++;showTask();return}
  EX.done=true;const k=EX.res.filter(Boolean).length,n=EX.tasks.length;renderExamBar();
  if(k===n){AL.report('n4',{mastered:true,via:'exam'});addLog('Верно','зачёт',`Зачёт сдан: ${k} из ${n}`);
    showMsg('#x4VMsg','ok',`<b>Зачёт сдан: ${k} из ${n}.</b> Тема 4 засчитана, открылась тема 5 «Законы».<div class="actions"><a class="btn primary" href="#map">На карту навыков</a><button class="btn" id="x4ExStay">Остаться в тренажёре</button></div>`)}
  else{addLog('Зачёт','—',`Не сдан: ${k} из ${n}`);
    showMsg('#x4VMsg','bad',`<b>Зачёт не сдан: верно ${k} из ${n}.</b> Задание засчитывается, если верны и таблица, и вывод. Потренируйся и попробуй снова.<div class="actions"><button class="btn primary" id="x4ExRetry">Сдать ещё раз</button><button class="btn" id="x4ExStay">Тренироваться</button></div>`)}
}
function stopExam(){
  if(EX&&!EX.done)addLog('Зачёт','—',`Прерван на задании ${EX.i+1}`);
  EX=null;renderExamBar();S=null;setMode(store.get('mode','id'));
}

/* ---------- события ---------- */
$('#x4TabId').onclick=()=>{if(EX)return toast('Сначала закончи или прерви зачёт');setMode('id')};
$('#x4TabTa').onclick=()=>{if(EX)return toast('Сначала закончи или прерви зачёт');setMode('ta')};
$('#x4Steps').onchange=()=>{showSteps=$('#x4Steps').checked;store.set('steps',showSteps);renderTable()};
$('#x4Table').addEventListener('click',e=>{
  const r=e.target.closest('.rowpick');if(r){S.cex=+r.dataset.row;hideMsg('#x4VMsg');renderTable();renderVerdict();return}
  const f=e.target.closest('.fbtn');if(!f||f.disabled)return;const ci=+f.dataset.c,m=+f.dataset.m,c=columns()[ci],v=cell(c.key,m);
  setCell(ci,m,v===''?'1':v==='1'?'0':'1');focusCell(ci,m);
});
$('#x4Table').addEventListener('keydown',e=>{
  const f=e.target.closest('.fbtn');if(!f)return;const ci=+f.dataset.c,m=+f.dataset.m,K=columns().length;
  if(e.key==='0'||e.key==='1'){e.preventDefault();if(f.disabled)return;setCell(ci,m,e.key);if(m<S.N-1)focusCell(ci,m+1);else if(ci<K-1)focusCell(ci+1,0);else focusCell(ci,m)}
  else if(e.key==='Backspace'||e.key==='Delete'){e.preventDefault();if(!f.disabled){setCell(ci,m,'');focusCell(ci,m)}}
  else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();focusCell(ci,Math.max(0,Math.min(S.N-1,m+(e.key==='ArrowDown'?1:-1))))}
  else if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();focusCell(Math.max(0,Math.min(K-1,ci+(e.key==='ArrowRight'?1:-1))),m)}
  else if(e.key==='Enter'){e.preventDefault();checkT()}
});
$('#x4CheckT').onclick=checkT;
$('#x4ClearT').onclick=()=>{if(tReady())return;S.cells={};S.marks=null;if(!EX){P().cells=null;saveP()}hideMsg('#x4TMsg');renderTable()};
$('#x4Verdict').addEventListener('click',e=>{const b=e.target.closest('.vopt');if(!b||b.disabled)return;S.verdict=b.dataset.v;if(S.verdict!=='no')S.cex=null;hideMsg('#x4VMsg');renderVerdict();renderTable()});
$('#x4CheckV').onclick=checkV;
const onMsg=e=>{
  if(e.target.id==='x4NextSeed')loadSeed(randomSeed(level,S.mode));
  if(e.target.id==='x4ExNext')examNext();
  if(e.target.id==='x4ExRetry')startExam();
  if(e.target.id==='x4ExStay')stopExam();
};
$('#x4VMsg').addEventListener('click',onMsg);
$('#x4ExamBar').addEventListener('click',e=>{if(e.target.id==='x4ExQuit')stopExam()});
$('#x4New').onclick=()=>loadSeed(randomSeed(+$('#x4Level').value,mode));
$('#x4Level').onchange=()=>{level=+$('#x4Level').value;store.set('level',level)};
const openSeed=()=>{const s=normSeed($('#x4Seed').value,+$('#x4Level').value,mode);if(!s){toast('Введи номер задания');return}mode=seedMode(s);store.set('mode',mode);loadSeed(s)};
$('#x4Open').onclick=openSeed;$('#x4Seed').addEventListener('keydown',e=>{if(e.key==='Enter')openSeed()});
$('#x4Student').value=AL.student.get();
$('#x4Student').addEventListener('input',()=>AL.student.set($('#x4Student').value));
AL.on('student',v=>{if(document.activeElement!==$('#x4Student'))$('#x4Student').value=v});
$('#x4Log').onclick=()=>AL.openLog&&AL.openLog();

function enter(arg){
  if(arg==='exam'){startExam();return}
  if(EX&&EX.done&&!arg){stopExam();return}
  if(EX)return;
  const s=arg?normSeed(arg,level,mode):null;
  if(s){mode=seedMode(s);store.set('mode',mode);if(!S||S.seed!==s)loadSeed(s,false);renderCounts();return}
  setMode(mode,true);
}
function refresh(){progress=store.get('progress',{});renderCounts();if(S&&!EX)renderStatus()}
$('#x4Level').value=String(level);
return {enter,refresh};
}

AL.register('t4',{title:'Тождества',logRows:()=>store.get('log',[]),exportData,importData,enter:arg=>mount().enter(arg)});
summarize();
})();
