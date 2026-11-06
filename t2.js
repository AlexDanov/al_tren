/* Тренажёр 2 «Предикаты и кванторы»: множество истинности, ∀ и ∃, порядок кванторов, отрицание высказываний с кванторами. */
(()=>{
const store=AL.store.scoped('t2');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=x=>x<0?'−'+(-x):String(x);

/* ---------- предикаты одной переменной ---------- */
const isPrime=x=>{if(x<2)return false;for(let d=2;d*d<=x;d++)if(x%d===0)return false;return true};
const U={
  gt:{t:k=>`x > ${fmt(k)}`,f:(x,k)=>x>k,neg:'le',trap:'lt'},
  ge:{t:k=>`x ≥ ${fmt(k)}`,f:(x,k)=>x>=k,neg:'lt',trap:'le'},
  lt:{t:k=>`x < ${fmt(k)}`,f:(x,k)=>x<k,neg:'ge',trap:'gt'},
  le:{t:k=>`x ≤ ${fmt(k)}`,f:(x,k)=>x<=k,neg:'gt',trap:'ge'},
  even:{t:()=>'x чётное',f:x=>x%2===0,neg:'odd'},
  odd:{t:()=>'x нечётное',f:x=>x%2!==0,neg:'even'},
  div:{t:k=>`x делится на ${k}`,f:(x,k)=>x%k===0,neg:'ndiv'},
  ndiv:{t:k=>`x не делится на ${k}`,f:(x,k)=>x%k!==0,neg:'div'},
  prime:{t:()=>'x простое',f:x=>isPrime(x),neg:'nprime',pos:1},
  nprime:{t:()=>'x не простое',f:x=>!isPrime(x),neg:'prime',pos:1},
  sqlt:{t:k=>`x² < ${k}`,f:(x,k)=>x*x<k,neg:'sqge',trap:'sqgt'},
  sqge:{t:k=>`x² ≥ ${k}`,f:(x,k)=>x*x>=k,neg:'sqlt',trap:'sqle'},
  sqgt:{t:k=>`x² > ${k}`,f:(x,k)=>x*x>k},
  sqle:{t:k=>`x² ≤ ${k}`,f:(x,k)=>x*x<=k},
  absle:{t:k=>`|x| ≤ ${k}`,f:(x,k)=>Math.abs(x)<=k,neg:'absgt',trap:'absge'},
  absgt:{t:k=>`|x| > ${k}`,f:(x,k)=>Math.abs(x)>k,neg:'absle',trap:'absle2'},
  absge:{t:k=>`|x| ≥ ${k}`,f:(x,k)=>Math.abs(x)>=k},
  absle2:{t:k=>`|x| < ${k}`,f:(x,k)=>Math.abs(x)<k}
};
const MAIN=['gt','ge','lt','le','even','odd','div','ndiv','prime','sqlt','sqge','absle','absgt'];
const OPS={and:['∧',(a,b)=>a&&b],or:['∨',(a,b)=>a||b],imp:['→',(a,b)=>!a||b]};
const ptext=p=>p.op?`(${U[p.a.k].t(p.a.n)}) ${OPS[p.op][0]} (${U[p.b.k].t(p.b.n)})`:U[p.k].t(p.n);
const pval=(p,x)=>p.op?OPS[p.op][1](pval(p.a,x),pval(p.b,x)):U[p.k].f(x,p.n);

/* ---------- предикаты двух переменных ---------- */
const BI=[
  {t:()=>'x < y',f:(x,y)=>x<y},{t:()=>'x ≤ y',f:(x,y)=>x<=y},{t:()=>'x ≠ y',f:(x,y)=>x!==y},
  {t:()=>'x + y чётное',f:(x,y)=>(x+y)%2===0},{t:()=>'y делится на x',f:(x,y)=>y%x===0},
  {t:k=>`x + y ≥ ${k}`,f:(x,y,k)=>x+y>=k,k:[5,6,7]},{t:k=>`x · y > ${k}`,f:(x,y,k)=>x*y>k,k:[3,4,6]},
  {t:()=>'x · y чётное',f:(x,y)=>(x*y)%2===0},{t:k=>`x + y = ${k}`,f:(x,y,k)=>x+y===k,k:[5,6]}
];
const QF2={
  AE:{t:'∀x ∃y',ev:(m,X,Y)=>X.every((x,i)=>Y.some((y,j)=>m[i][j]))},
  EA:{t:'∃y ∀x',ev:(m,X,Y)=>Y.some((y,j)=>X.every((x,i)=>m[i][j]))},
  EAx:{t:'∃x ∀y',ev:(m,X,Y)=>X.some((x,i)=>Y.every((y,j)=>m[i][j]))},
  AEy:{t:'∀y ∃x',ev:(m,X,Y)=>Y.every((y,j)=>X.some((x,i)=>m[i][j]))},
  AA:{t:'∀x ∀y',ev:m=>m.every(r=>r.every(Boolean))},
  EE:{t:'∃x ∃y',ev:m=>m.some(r=>r.some(Boolean))}
};

/* ---------- SEED ---------- */
function xmur3(str){let h=1779033703^str.length;for(let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353);h=h<<13|h>>>19}
  return()=>{h=Math.imul(h^(h>>>16),2246822507);h=Math.imul(h^(h>>>13),3266489909);return(h^=h>>>16)>>>0}}
function mulberry32(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function normSeed(raw,lvl){let s=String(raw||'').toUpperCase().replace(/[^A-Z0-9-]/g,'').replace(/^-+|-+$/g,'');if(!s)return null;if(!/^[123]-./.test(s))s=lvl+'-'+s;return s.slice(0,24)}
function randomSeed(lvl){const A='ABCDEFGHJKMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<5;i++)s+=A[Math.floor(Math.random()*A.length)];return lvl+'-'+s}
const range=(a,b)=>{const r=[];for(let i=a;i<=b;i++)r.push(i);return r};
const domText=D=>D.length>6?`{${fmt(D[0])}, ${fmt(D[1])}, …, ${fmt(D[D.length-1])}}`:`{${D.map(fmt).join(', ')}}`;

function randPred(r,D,kinds){
  const pick=a=>a[Math.floor(r()*a.length)];
  const k=pick(kinds.filter(x=>!(U[x].pos&&D[0]<0)));
  let n=0;
  if(['gt','ge','lt','le'].includes(k))n=D[0]-1+Math.floor(r()*(D.length+2));
  else if(k==='div'||k==='ndiv')n=pick([3,4,5]);
  else if(k==='sqlt'||k==='sqge')n=pick([5,10,17,26]);
  else if(k==='absle'||k==='absgt')n=pick([1,2,3,4]);
  return {k,n};
}
function generate(seed){
  const lvl=+seed[0]||1,r0=mulberry32(xmur3(seed)());
  const pick=(a,r=r0)=>a[Math.floor(r()*a.length)];
  if(lvl<3){
    const D=lvl===1?pick([range(1,10),range(0,9),range(1,12)]):pick([range(-5,5),range(1,12),range(-4,6)]);
    const want=r0();const bucket=want<.25?'all':want<.45?'none':'mixed';
    const cands={all:[],none:[],mixed:[]};
    for(let a=0;a<80;a++){
      const r=mulberry32(xmur3(seed+'#'+a)());
      let p=randPred(r,D,MAIN);
      if(lvl===2){const q=randPred(r,D,MAIN.filter(x=>x!==p.k&&U[x].neg!==p.k));const op=pick(['and','or','imp'],r);
        p={op,a:p,b:q};if(op==='imp'&&r()<.5)p={op,a:q,b:p.a}}
      const c=D.filter(x=>pval(p,x)).length;
      const b=c===D.length?'all':c===0?'none':'mixed';
      if(lvl===2&&p.op){const ca=D.filter(x=>pval(p.a,x)).length,cb=D.filter(x=>pval(p.b,x)).length;if(!ca||!cb||ca===D.length||cb===D.length)continue}
      cands[b].push(p);
    }
    const pool=cands[bucket].length?cands[bucket]:cands.mixed;
    const P=pick(pool);
    const forms=['A','E','An','En'];const f1=pick(forms);const f2=pick(forms.filter(x=>x!==f1));
    return {seed,level:lvl,kind:1,D,P,qs:[f1,f2]};
  }
  const X=pick([range(1,4),range(1,5)]),Y=X;
  let best=null;
  for(let a=0;a<30;a++){
    const r=mulberry32(xmur3(seed+'#'+a)());
    const b=pick(BI,r),k=b.k?pick(b.k,r):0;
    const m=X.map(x=>Y.map(y=>b.f(x,y,k)));
    const ae=QF2.AE.ev(m,X,Y),ea=QF2.EA.ev(m,X,Y);
    const cand={b,k,m};
    if(ae!==ea){best=cand;break}
    if(!best)best=cand;
  }
  const qs=r0()<.65?['AE','EA']:[pick(['EAx','AEy']),pick(['AA','EE','AE','EA'])];
  return {seed,level:3,kind:2,X,Y,B:best.b,k:best.k,m:best.m,qs};
}
const QF1={A:'∀x P(x)',E:'∃x P(x)',An:'∀x ¬P(x)',En:'∃x ¬P(x)'};
function qTruth(T,q){
  if(T.kind===2)return QF2[q].ev(T.m,T.X,T.Y);
  const v=T.D.map(x=>pval(T.P,x));
  return q==='A'?v.every(Boolean):q==='E'?v.some(Boolean):q==='An'?v.every(x=>!x):v.some(x=>!x);
}
function qWhy(T,q){
  if(T.kind===1){
    const tr=T.D.filter(x=>pval(T.P,x)),fl=T.D.filter(x=>!pval(T.P,x));
    if(q==='A')return tr.length===T.D.length?'P(x) истинно для каждого x: отмечены все числа.':`Контрпример: x = ${fmt(fl[0])}, P(${fmt(fl[0])}) ложно.`;
    if(q==='E')return tr.length?`Пример: x = ${fmt(tr[0])}.`:'Ни одно число не отмечено, примера нет.';
    if(q==='An')return tr.length?`Не годится x = ${fmt(tr[0])}: P(${fmt(tr[0])}) истинно.`:'Не отмечено ни одно число, то есть P ложно для всех x.';
    return fl.length?`Пример: x = ${fmt(fl[0])}, на нём P ложно.`:'Отмечены все числа: x, на котором P ложно, нет.';
  }
  const {m,X,Y}=T,rows=X.map((x,i)=>Y.filter((y,j)=>m[i][j])),cols=Y.map((y,j)=>X.filter((x,i)=>m[i][j]));
  switch(q){
    case 'AE':{const bad=X.find((x,i)=>!rows[i].length);return bad==null?'В каждой строке x есть отмеченная клетка: для каждого x нашёлся свой y.':`В строке x = ${bad} нет ни одной отмеченной клетки: для этого x подходящего y нет.`}
    case 'EA':{const g=Y.find((y,j)=>cols[j].length===X.length);return g!=null?`Столбец y = ${g} заполнен целиком: один y подходит сразу для всех x.`:'Нет столбца, заполненного целиком: ни один y не подходит сразу для всех x.'}
    case 'EAx':{const g=X.find((x,i)=>rows[i].length===Y.length);return g!=null?`Строка x = ${g} заполнена целиком.`:'Нет строки, заполненной целиком.'}
    case 'AEy':{const bad=Y.find((y,j)=>!cols[j].length);return bad==null?'В каждом столбце y есть отмеченная клетка.':`В столбце y = ${bad} нет ни одной отмеченной клетки.`}
    case 'AA':{for(const [i,x] of X.entries())for(const [j,y] of Y.entries())if(!m[i][j])return `Клетка x = ${x}, y = ${y} не отмечена.`;return 'Отмечены все клетки.'}
    case 'EE':{for(const [i,x] of X.entries())for(const [j,y] of Y.entries())if(m[i][j])return `Отмечена, например, клетка x = ${x}, y = ${y}.`;return 'Ни одна клетка не отмечена.'}
  }
}

/* ---------- отрицание высказывания с квантором ---------- */
function negTask(){
  const r=Math.random,pick=a=>a[Math.floor(r()*a.length)];
  const Q=pick(['∀','∃']),NQ=Q==='∀'?'∃':'∀';
  const kinds=['gt','ge','lt','le','even','div','prime','sqlt','absle'];
  const mk=()=>{const k=pick(kinds);const n=['gt','ge','lt','le'].includes(k)?pick([0,1,2,3,5,7,10]):k==='div'?pick([3,4,5]):k==='sqlt'?pick([10,16,25]):pick([2,3,4]);return {k,n}};
  const neg=p=>({k:U[p.k].neg,n:p.n}),txt=p=>U[p.k].t(p.n);
  const trap=p=>U[p.k].trap?{k:U[p.k].trap,n:p.n}:null;
  let stmt,right,wrongs;
  if(r()<.45){
    const a=mk();let b=mk();while(b.k===a.k)b=mk();
    const op=pick(['∧','∨']),nop=op==='∧'?'∨':'∧';
    stmt=`${Q}x (${txt(a)} ${op} ${txt(b)})`;
    right=`${NQ}x (${txt(neg(a))} ${nop} ${txt(neg(b))})`;
    wrongs=[`${NQ}x (${txt(neg(a))} ${op} ${txt(neg(b))})`,`${Q}x (${txt(neg(a))} ${nop} ${txt(neg(b))})`,`${NQ}x (${txt(a)} ${op} ${txt(b)})`];
    return {stmt,right,wrongs,why:`Квантор меняется на противоположный (${Q} → ${NQ}), а отрицание внутри скобки по закону де Моргана меняет ${op} на ${nop}.`};
  }
  const p=mk();
  stmt=`${Q}x (${txt(p)})`;right=`${NQ}x (${txt(neg(p))})`;
  wrongs=[`${Q}x (${txt(neg(p))})`,`${NQ}x (${txt(p)})`];
  const t=trap(p);if(t)wrongs.push(`${NQ}x (${txt(t)})`);
  return {stmt,right,wrongs,why:`Отрицание «${Q==='∀'?'для всех':'существует'}» — «${NQ==='∃'?'существует':'для всех'}», а условие внутри заменяется на противоположное: ${txt(p)} → ${txt(neg(p))}.${t?' Следи за строгостью неравенства: отрицание «>» — это «≤», а не «<».':''}`};
}

const MARKUP=`<div class="app t2">
  <header class="top">
    <div class="brand">
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><rect x="4" y="8" width="32" height="24" rx="4" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2.4"/><text x="20" y="25.5" text-anchor="middle" font-family="JetBrains Mono,monospace" font-weight="700" font-size="14" fill="var(--accent)">∀∃</text></svg>
      <div><a class="back" href="#map">← Карта навыков</a><h1>Предикаты и кванторы</h1><p>Множество истинности, кванторы ∀ и ∃, их порядок и отрицание</p></div>
    </div>
    <div class="controls">
      <div class="field"><label for="x2Student">Ученик</label><input type="text" id="x2Student" placeholder="Фамилия Имя" autocomplete="off"></div>
      <div class="field x2-pr"><label for="x2Seed">Задание №</label><div class="row"><input type="text" id="x2Seed" class="seedin" spellcheck="false" autocomplete="off"><button class="btn" id="x2Open">Открыть</button></div></div>
      <div class="field x2-pr"><label for="x2Level">Уровень</label><div class="row"><select id="x2Level"><option value="1">1 · один предикат</option><option value="2">2 · составной предикат</option><option value="3">3 · две переменные</option></select><button class="btn primary" id="x2New">Новое задание</button></div></div>
      <button class="btn" id="x2Log">Журнал</button>
    </div>
  </header>
  <div class="exam-bar" id="x2ExamBar" hidden></div>
  <div class="seg" role="tablist" aria-label="Режим">
    <button role="tab" id="x2TabPr" aria-selected="true">Предикаты и кванторы <span class="pill ok" id="x2PrCnt">0/5</span></button>
    <button role="tab" id="x2TabNg" aria-selected="false">Отрицание <span class="pill ok" id="x2NgCnt">0/6</span></button>
  </div>

  <section id="x2Pr" class="t2-col">
    <div class="status" id="x2Status"></div>
    <div class="card">
      <div class="card-h"><span class="step">1</span><h2>Множество истинности</h2><p id="x2Sub"></p></div>
      <div class="body">
        <div class="pdef" id="x2Def"></div>
        <div id="x2Board"></div>
        <div class="actions"><button class="btn primary" id="x2CheckSet">Проверить</button><button class="btn ghost" id="x2ClearSet">Очистить</button><span class="tries" id="x2SetTries"></span></div>
        <div class="msg" id="x2SetMsg"></div>
      </div>
    </div>
    <div class="card" id="x2QCard">
      <div class="card-h"><span class="step">2</span><h2>Кванторы</h2><p>Истинно или ложно? Смотри на отмеченные клетки.</p></div>
      <div class="body">
        <div class="qs" id="x2Qs"></div>
        <div class="actions"><button class="btn primary" id="x2CheckQ">Проверить</button><span class="tries" id="x2QTries"></span></div>
        <div class="msg" id="x2QMsg"></div>
      </div>
    </div>
  </section>

  <section id="x2Ng" class="t2-col" hidden>
    <div class="card">
      <div class="card-h"><span class="step">¬</span><h2>Построй отрицание</h2><p>x — целое число. Выбери высказывание, которое ложно ровно тогда, когда данное истинно.</p></div>
      <div class="body">
        <div class="neg-st"><span class="lbl">Высказывание</span><div class="neg-q" id="x2NgSt"></div></div>
        <div class="neg-opts" id="x2NgOpts"></div>
        <div class="msg" id="x2NgMsg"></div>
        <p class="help">Правило: ¬∀x P(x) = ∃x ¬P(x), ¬∃x P(x) = ∀x ¬P(x).</p>
      </div>
    </div>
  </section>
</div>
<div class="toast" id="x2Toast"></div>`;

/* ---------- прогресс ---------- */
function summarize(){
  const prog=store.get('progress',{}),ng=store.get('neg',0);
  if(!Object.keys(prog).length&&!ng&&!AL.node('n2').touched)return;
  const solved=Object.values(prog).filter(p=>p.setOk&&p.qOk),hi=solved.filter(p=>(+p.level||1)>=2).length,nP=Math.min(solved.length,5),nN=Math.min(ng,6);
  const mastered=solved.length>=5&&hi>=2&&ng>=6;
  AL.report('n2',{done:nP+nN,total:11,note:`Задания ${nP} из 5 · отрицания ${nN} из 6`+(nP>=3&&hi<2?` · уровня 2–3: ${hi} из 2`:''),mastered,via:mastered?'practice':undefined});
}
function exportData(){const prog=store.get('progress',{}),o={};Object.entries(prog).slice(-300).forEach(([k,p])=>o[k]=[+p.level||1,p.setOk?1:0,p.qOk?1:0,p.setTries||0,p.qTries||0,p.first||'']);return {p:o,n:store.get('neg',0)}}
function importData(d){if(!d)return;const prog=store.get('progress',{});
  for(const [k,a] of Object.entries(d.p||{})){const c=prog[k]||(prog[k]={level:a[0],setTries:0,qTries:0,setOk:false,qOk:false,first:a[5]||new Date().toISOString()});
    c.setOk=c.setOk||!!a[1];c.qOk=c.qOk||!!a[2];c.setTries=Math.max(c.setTries,a[3]||0);c.qTries=Math.max(c.qTries,a[4]||0)}
  store.set('progress',prog);store.set('neg',Math.max(store.get('neg',0),d.n||0));summarize();if(api)api.refresh()}

let api=null;
function mount(){if(api)return api;document.getElementById('view-t2').innerHTML=MARKUP;api=init();return api}

function init(){
const $=s=>document.querySelector(s);
let progress=store.get('progress',{}),log=store.get('log',[]),level=store.get('level',1),mode=store.get('mode','pr'),neg=store.get('neg',0);
let T=null,EX=null,NG=null;
const saveP=()=>store.set('progress',progress);
function addLog(stage,input,note,id){log.push({t:new Date().toISOString(),seed:id||(T?T.seed:'—'),student:AL.student.get(),stage,input,note});if(log.length>3000)log=log.slice(-3000);store.set('log',log)}
function toast(t){const el=$('#x2Toast');el.textContent=t;el.classList.add('show');clearTimeout(toast.h);toast.h=setTimeout(()=>el.classList.remove('show'),1800)}
function showMsg(sel,cls,html){const el=$(sel);el.className='msg show '+cls;el.innerHTML=html}
function hideMsg(sel){$(sel).className='msg'}
function setHash(h){if(location.hash.slice(1)!==h){try{history.replaceState(null,'','#'+h)}catch(e){location.hash=h}}}
const app=()=>document.querySelector('.app.t2');

function setMode(m,push=true){
  mode=m;if(!EX)store.set('mode',m);
  $('#x2TabPr').setAttribute('aria-selected',m==='pr');$('#x2TabNg').setAttribute('aria-selected',m==='ng');
  $('#x2Pr').hidden=m!=='pr';$('#x2Ng').hidden=m!=='ng';app().classList.toggle('mode-ng',m==='ng');
  if(m==='pr'&&!T)loadSeed(store.get('last',null)||randomSeed(level),push);
  else if(m==='pr'&&push&&!EX)setHash('t2-'+T.seed);
  if(m==='ng'){if(!NG)nextNeg();if(push&&!EX)setHash('t2-ng')}
  renderCounts();
}
function renderCounts(){const solved=Object.values(progress).filter(p=>p.setOk&&p.qOk).length;$('#x2PrCnt').textContent=Math.min(solved,5)+'/5';$('#x2NgCnt').textContent=Math.min(neg,6)+'/6'}

/* ---------- задание с предикатом ---------- */
function P(){return progress[T.seed]||(progress[T.seed]={level:T.level,setTries:0,qTries:0,setOk:false,qOk:false,first:new Date().toISOString()})}
function truthGrid(){return T.kind===1?T.D.map(x=>pval(T.P,x)):T.m}
function loadSeed(seed,push=true){
  T=generate(seed);T.ans={};T.done={set:false,q:false};
  const p=P();
  T.marks=T.kind===1?T.D.map(()=>false):T.X.map(()=>T.Y.map(()=>false));
  const same=(d,m)=>Array.isArray(d)&&d.length===m.length&&d.every((r,i)=>Array.isArray(m[i])?Array.isArray(r)&&r.length===m[i].length&&r.every(v=>typeof v==='boolean'):typeof r==='boolean');
  if(!EX&&same(p.draft,T.marks))T.marks=p.draft.map(r=>Array.isArray(r)?r.slice():r);
  T.check=null;
  level=T.level;$('#x2Level').value=String(level);$('#x2Seed').value=seed;
  if(!EX)store.set('last',seed);if(push&&!EX)setHash('t2-'+seed);
  hideMsg('#x2SetMsg');hideMsg('#x2QMsg');
  if(p.setOk&&p.qOk&&!EX)showMsg('#x2QMsg','ok','<b>Решено.</b> Это задание уже сдано. Можно взять новое.');
  renderTask();
}
function setReady(){return EX?T.done.set:P().setOk}
function renderTask(){
  if(T.kind===1){
    $('#x2Sub').textContent='Отметь все x, для которых P(x) истинно.';
    $('#x2Def').innerHTML=`<span class="pn">P(x)</span> = ${esc(ptext(T.P))}<span class="dom">x ∈ ${esc(domText(T.D))}</span>`;
    $('#x2Board').innerHTML=`<div class="tiles">${T.D.map((x,i)=>`<button class="tile${T.marks[i]?' on':''}${T.check?' '+T.check[i]:''}" data-i="${i}" aria-pressed="${T.marks[i]}" ${setReady()?'disabled':''}>${fmt(x)}</button>`).join('')}</div>`;
  }else{
    $('#x2Sub').textContent='Отметь все пары (x, y), для которых P(x, y) истинно. Строка — значение x, столбец — значение y.';
    $('#x2Def').innerHTML=`<span class="pn">P(x, y)</span> = ${esc(T.B.t(T.k))}<span class="dom">x, y ∈ ${esc(domText(T.X))}</span>`;
    $('#x2Board').innerHTML=`<div class="tt-wrap"><table class="grid2"><thead><tr><th class="corner">x \\ y</th>${T.Y.map(y=>`<th>${y}</th>`).join('')}</tr></thead><tbody>${T.X.map((x,i)=>`<tr><th>${x}</th>${T.Y.map((y,j)=>`<td><button class="cell${T.marks[i][j]?' on':''}${T.check?' '+T.check[i][j]:''}" data-i="${i}" data-j="${j}" aria-pressed="${T.marks[i][j]}" aria-label="x = ${x}, y = ${y}" ${setReady()?'disabled':''}>${T.marks[i][j]?'1':''}</button></td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  const p=P();
  $('#x2SetTries').textContent=EX?'Зачёт: одна попытка':`Попыток: ${p.setTries}${p.setOk?' · сдано':''}`;
  $('#x2CheckSet').disabled=$('#x2ClearSet').disabled=setReady();
  renderQs();renderStatus();
}
function renderQs(){
  const ready=setReady();$('#x2QCard').classList.toggle('locked',!ready);
  if(!ready){$('#x2Qs').innerHTML='<p class="wait">Сначала отметь множество истинности: по нему проще всего ответить про кванторы.</p>';$('#x2CheckQ').disabled=true;$('#x2QTries').textContent='';return}
  const locked=EX?T.done.q:P().qOk;
  $('#x2Qs').innerHTML=T.qs.map((q,i)=>{const label=T.kind===1?QF1[q]:QF2[q].t+' P(x, y)';const a=T.ans[i];
    return `<div class="qrow" data-q="${i}"><span class="qf">${esc(label)}</span><span class="qb"><button class="btn tf${a===true?' sel':''}" data-v="1" ${locked?'disabled':''}>Истинно</button><button class="btn tf${a===false?' sel':''}" data-v="0" ${locked?'disabled':''}>Ложно</button></span><span class="qwhy" id="x2Why${i}"></span></div>`}).join('');
  $('#x2CheckQ').disabled=locked;
  const p=P();$('#x2QTries').textContent=EX?'Зачёт: одна попытка':`Попыток: ${p.qTries}${p.qOk?' · сдано':''}`;
}
function renderStatus(){
  const p=P(),chip=(c,t)=>`<span class="chip ${c}"><span class="dot"></span>${t}</span>`;
  $('#x2Status').innerHTML=chip(p.setOk?'ok':p.setTries?'bad':'',`Множество: <b>${p.setOk?'верно':p.setTries?'есть ошибки':'не проверено'}</b>`)+
    chip(p.qOk?'ok':p.qTries?'bad':'',`Кванторы: <b>${p.qOk?'верно':p.qTries?'есть ошибки':'не проверены'}</b>`)+'<span class="spacer"></span>'+
    chip('',`Уровень <b>${T.level}</b> · ${T.kind===1?'чисел <b>'+T.D.length+'</b>':'клеток <b>'+T.X.length*T.Y.length+'</b>'}`);
  renderCounts();
}
function toggle(i,j){
  if(setReady())return;
  if(T.kind===1)T.marks[i]=!T.marks[i];else T.marks[i][j]=!T.marks[i][j];
  T.check=null;if(!EX){P().draft=T.marks;saveP()}renderTask();
  const b=T.kind===1?$(`#x2Board .tile[data-i="${i}"]`):$(`#x2Board .cell[data-i="${i}"][data-j="${j}"]`);b&&b.focus();
}
function checkSet(){
  if(setReady())return;
  const g=truthGrid(),p=P();
  if(!EX)p.setTries++;
  let bad=[];
  if(T.kind===1){T.check=T.D.map((x,i)=>T.marks[i]===g[i]?'':'bad');T.D.forEach((x,i)=>{if(T.marks[i]!==g[i])bad.push(x)})}
  else{T.check=T.X.map((x,i)=>T.Y.map((y,j)=>T.marks[i][j]===g[i][j]?'':'bad'));T.X.forEach((x,i)=>T.Y.forEach((y,j)=>{if(T.marks[i][j]!==g[i][j])bad.push(`(${x}, ${y})`)}))}
  const desc=T.kind===1?ptext(T.P):T.B.t(T.k);
  if(!bad.length){
    if(EX){T.done.set=true;EX.cur.set=true}else p.setOk=true;
    addLog(EX?'Зачёт':'Верно','множество',EX?'множество верно':`множество с ${p.setTries}-й попытки`);
    showMsg('#x2SetMsg','ok','<b>Верно!</b> Множество истинности отмечено правильно. Теперь ответь про кванторы.');
  }else{
    const ex=bad[0];
    let hint='';
    if(T.kind===1){const x=+String(ex).replace('−','-'),v=pval(T.P,x);
      hint=T.P.op?` Проверь x = ${fmt(x)}: ${esc(ptext(T.P.a).replace(/x/g,fmt(x)))} — ${pval(T.P.a,x)?'да':'нет'}, ${esc(ptext(T.P.b).replace(/x/g,fmt(x)))} — ${pval(T.P.b,x)?'да':'нет'}, значит P(${fmt(x)}) ${v?'истинно':'ложно'}.`:` При x = ${fmt(x)} условие «${esc(desc)}» ${v?'выполняется':'не выполняется'}.`}
    addLog(EX?'Зачёт':'Множество',`отмечено с ошибками: ${bad.slice(0,8).join(', ')}`,desc);
    if(EX){T.done.set=true;EX.cur.set=false;T.marks=truthGrid().map(r=>Array.isArray(r)?r.slice():r);T.check=null;
      showMsg('#x2SetMsg','bad',`<b>Ошибка.</b> Неверно: ${bad.slice(0,6).join(', ')}.${hint} Правильное множество выставлено, ответь про кванторы.`)}
    else showMsg('#x2SetMsg','bad',`<b>Ошибка.</b> Неверных: ${bad.length}, они отмечены красным.${hint}`);
  }
  saveP();renderTask();summarize();
}
function checkQ(){
  if(EX?T.done.q:P().qOk)return;
  if(T.qs.some((q,i)=>T.ans[i]==null)){showMsg('#x2QMsg','info','Ответь на оба вопроса.');return}
  const p=P();if(!EX)p.qTries++;
  const res=T.qs.map((q,i)=>qTruth(T,q)===T.ans[i]);
  T.qs.forEach((q,i)=>{const row=$(`#x2Qs .qrow[data-q="${i}"]`);row.classList.add(res[i]?'ok':'bad');$('#x2Why'+i).textContent=(res[i]?'Верно. ':'Неверно. ')+qWhy(T,q)});
  const all=res.every(Boolean);
  const labels=T.qs.map(q=>T.kind===1?QF1[q]:QF2[q].t);
  addLog(EX?'Зачёт':all?'Верно':'Кванторы',labels.map((l,i)=>`${l}: ${T.ans[i]?'И':'Л'}`).join('; '),all?'кванторы верно':'ошибка в '+labels.filter((l,i)=>!res[i]).join(', '));
  if(EX){T.done.q=true;EX.cur.q=all;
    showMsg('#x2QMsg',all?'ok':'bad',`<b>${all?'Верно.':'Есть ошибка.'}</b><div class="actions"><button class="btn primary" id="x2ExNext">${EX.i<EX.tasks.length-1?'Дальше →':'Итог зачёта'}</button></div>`);
    $('#x2CheckQ').disabled=true;document.querySelectorAll('#x2Qs .tf').forEach(b=>b.disabled=true);renderExamBar();
  }else if(all){p.qOk=true;
    const pair=T.kind===2&&T.qs.join()==='AE,EA'&&qTruth(T,'AE')!==qTruth(T,'EA');
    showMsg('#x2QMsg','ok',`<b>Верно!</b>${pair?' Заметь: ∀x ∃y и ∃y ∀x дали разные ответы. Порядок кванторов важен.':''}<div class="actions"><button class="btn primary" id="x2NextSeed">Новое задание →</button></div>`);
    $('#x2CheckQ').disabled=true;document.querySelectorAll('#x2Qs .tf').forEach(b=>b.disabled=true);
  }else showMsg('#x2QMsg','bad','<b>Есть ошибка.</b> Пояснения у каждого вопроса. Поменяй ответ и проверь ещё раз.');
  saveP();renderStatus();summarize();
}

/* ---------- отрицание ---------- */
function nextNeg(task){
  NG=task||negTask();NG.opts=AL.shuffle([NG.right,...NG.wrongs]);NG.done=false;
  $('#x2NgSt').textContent=NG.stmt;
  $('#x2NgOpts').innerHTML=NG.opts.map((o,i)=>`<button class="btn nopt" data-i="${i}"><span class="k">${i+1}</span>${esc(o)}</button>`).join('');
  hideMsg('#x2NgMsg');
}
function answerNeg(i){
  if(NG.done)return;NG.done=true;const ok=NG.opts[i]===NG.right;
  document.querySelectorAll('#x2NgOpts .nopt').forEach((b,j)=>{b.disabled=true;if(NG.opts[j]===NG.right)b.classList.add('ok');else if(j===i)b.classList.add('bad')});
  if(EX){EX.cur.ng=ok;addLog('Зачёт',NG.opts[i],`${NG.stmt} — ${ok?'верно':'ошибка'}`,'отрицание')}
  else if(ok){neg++;store.set('neg',neg);addLog('Верно',NG.opts[i],NG.stmt,'отрицание')}
  else addLog('Отрицание',NG.opts[i],`${NG.stmt}; верно: ${NG.right}`,'отрицание');
  const nxt=EX?`<button class="btn primary" id="x2ExNext">${EX.i<EX.tasks.length-1?'Дальше →':'Итог зачёта'}</button>`:'<button class="btn primary" id="x2NgNext">Дальше →</button>';
  showMsg('#x2NgMsg',ok?'ok':'bad',`<b>${ok?'Верно.':'Нет.'}</b> ${esc(NG.why)}<div class="actions">${nxt}</div>`);
  summarize();renderCounts();if(EX)renderExamBar();
  setTimeout(()=>{const b=$('#x2ExNext')||$('#x2NgNext');b&&b.focus()},0);
}

/* ---------- зачёт: задание уровня 2, задание уровня 3, два отрицания ---------- */
function startExam(){
  EX={tasks:[{k:'pr',seed:randomSeed(2)},{k:'ng'},{k:'pr',seed:randomSeed(3)},{k:'ng'}],i:0,res:[],cur:{},done:false};
  addLog('Зачёт','—','Начат зачёт','зачёт');app().classList.add('exam');showTask();
}
function showTask(){
  const t=EX.tasks[EX.i];EX.cur={};
  setMode(t.k,false);
  if(t.k==='pr')loadSeed(t.seed,false);else nextNeg();
  renderExamBar();window.scrollTo(0,0);
}
function renderExamBar(){
  const bar=$('#x2ExamBar');if(!EX){bar.hidden=true;app().classList.remove('exam');return}
  bar.hidden=false;
  bar.innerHTML=`<div class="ex-t"><b>Зачёт по теме 2</b><span>${EX.done?'Зачёт завершён':`Задание ${EX.i+1} из ${EX.tasks.length}`} · одна попытка на каждый шаг</span></div>
    <div class="ex-dots">${EX.tasks.map((t,i)=>`<span class="ex-dot ${i<EX.res.length?(EX.res[i]?'ok':'bad'):i===EX.i?'now':''}"></span>`).join('')}</div>
    <button class="btn ghost" id="x2ExQuit">${EX.done?'Закрыть зачёт':'Прервать зачёт'}</button>`;
}
function examNext(){
  const t=EX.tasks[EX.i];
  EX.res.push(t.k==='pr'?!!(EX.cur.set&&EX.cur.q):!!EX.cur.ng);
  if(EX.i<EX.tasks.length-1){EX.i++;showTask();return}
  EX.done=true;const k=EX.res.filter(Boolean).length,n=EX.tasks.length;renderExamBar();
  const sel=mode==='ng'?'#x2NgMsg':'#x2QMsg';
  if(k===n){AL.report('n2',{mastered:true,via:'exam'});addLog('Верно','зачёт',`Зачёт сдан: ${k} из ${n}`,'зачёт');
    showMsg(sel,'ok',`<b>Зачёт сдан: ${k} из ${n}.</b> Тема 2 засчитана.<div class="actions"><a class="btn primary" href="#map">На карту навыков</a><button class="btn" id="x2ExStay">Остаться в тренажёре</button></div>`)}
  else{addLog('Зачёт','—',`Не сдан: ${k} из ${n}`,'зачёт');
    showMsg(sel,'bad',`<b>Зачёт не сдан: верно ${k} из ${n}.</b> Задание засчитывается, если верны и множество, и оба ответа про кванторы. Потренируйся и попробуй снова.<div class="actions"><button class="btn primary" id="x2ExRetry">Сдать ещё раз</button><button class="btn" id="x2ExStay">Тренироваться</button></div>`)}
}
function stopExam(){
  if(EX&&!EX.done)addLog('Зачёт','—',`Прерван на задании ${EX.i+1}`,'зачёт');
  EX=null;renderExamBar();T=null;NG=null;setMode(store.get('mode','pr'));
}

/* ---------- события ---------- */
$('#x2TabPr').onclick=()=>{if(EX)return toast('Сначала закончи или прерви зачёт');setMode('pr')};
$('#x2TabNg').onclick=()=>{if(EX)return toast('Сначала закончи или прерви зачёт');setMode('ng')};
$('#x2Board').addEventListener('click',e=>{const b=e.target.closest('.tile,.cell');if(b)toggle(+b.dataset.i,b.dataset.j!=null?+b.dataset.j:0)});
$('#x2CheckSet').onclick=checkSet;
$('#x2ClearSet').onclick=()=>{if(setReady())return;T.marks=T.kind===1?T.D.map(()=>false):T.X.map(()=>T.Y.map(()=>false));T.check=null;if(!EX){P().draft=null;saveP()}hideMsg('#x2SetMsg');renderTask()};
$('#x2Qs').addEventListener('click',e=>{const b=e.target.closest('.tf');if(!b||b.disabled)return;const i=+b.closest('.qrow').dataset.q;T.ans[i]=b.dataset.v==='1';hideMsg('#x2QMsg');renderQs()});
$('#x2CheckQ').onclick=checkQ;
$('#x2NgOpts').addEventListener('click',e=>{const b=e.target.closest('.nopt');if(b)answerNeg(+b.dataset.i)});
const onMsg=e=>{
  if(e.target.id==='x2NextSeed')loadSeed(randomSeed(level));
  if(e.target.id==='x2NgNext')nextNeg();
  if(e.target.id==='x2ExNext')examNext();
  if(e.target.id==='x2ExRetry')startExam();
  if(e.target.id==='x2ExStay')stopExam();
};
['#x2QMsg','#x2NgMsg','#x2SetMsg'].forEach(s=>$(s).addEventListener('click',onMsg));
$('#x2ExamBar').addEventListener('click',e=>{if(e.target.id==='x2ExQuit')stopExam()});
document.addEventListener('keydown',e=>{
  if($('#view-t2').hidden||mode!=='ng'||!NG||NG.done)return;
  const tag=(e.target.tagName||'').toLowerCase();if(tag==='input'||tag==='select'||e.ctrlKey||e.metaKey||e.altKey)return;
  const i=+e.key-1;if(i>=0&&i<NG.opts.length){e.preventDefault();answerNeg(i)}
});
$('#x2New').onclick=()=>loadSeed(randomSeed(+$('#x2Level').value));
$('#x2Level').onchange=()=>{level=+$('#x2Level').value;store.set('level',level)};
const openSeed=()=>{const s=normSeed($('#x2Seed').value,+$('#x2Level').value);if(!s){toast('Введи номер задания');return}loadSeed(s)};
$('#x2Open').onclick=openSeed;$('#x2Seed').addEventListener('keydown',e=>{if(e.key==='Enter')openSeed()});
$('#x2Student').value=AL.student.get();
$('#x2Student').addEventListener('input',()=>AL.student.set($('#x2Student').value));
AL.on('student',v=>{if(document.activeElement!==$('#x2Student'))$('#x2Student').value=v});
$('#x2Log').onclick=()=>AL.openLog&&AL.openLog();

function enter(arg){
  if(arg==='exam'){startExam();return}
  if(EX&&EX.done&&!arg){stopExam();return}
  if(EX)return;
  if(arg==='ng'){setMode('ng',false);return}
  const s=arg?normSeed(arg,level):null;
  if(s){setMode('pr',false);if(!T||T.seed!==s)loadSeed(s,false);return}
  setMode(mode,true);
}
function refresh(){progress=store.get('progress',{});neg=store.get('neg',0);renderCounts();if(T&&!EX)renderStatus()}
$('#x2Level').value=String(level);
return {enter,refresh};
}

AL.register('t2',{title:'Предикаты',logRows:()=>store.get('log',[]),exportData,importData,enter:arg=>mount().enter(arg)});
summarize();
})();
