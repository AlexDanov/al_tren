/* Тренажёр ЕГЭ №15: при каком A формула тождественно истинна. Отрезки, делимость, алгебраические неравенства с x и y.
   В обучении ложные x подсвечиваются при текущем A; в зачёте подсветка выключена. */
(()=>{
const store=AL.store.scoped('t15');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function xmur3(str){let h=1779033703^str.length;for(let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353);h=h<<13|h>>>19}
  return()=>{h=Math.imul(h^(h>>>16),2246822507);h=Math.imul(h^(h>>>13),3266489909);return(h^=h>>>16)>>>0}}
function mulberry32(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
/* «G-…» отрезки, «D-…» делимость, «N-…» неравенства */
const TYPES={G:'seg',D:'div',N:'alg'},PFX={seg:'G',div:'D',alg:'N'};
function normSeed(raw,type){let s=String(raw||'').toUpperCase().replace(/[^A-Z0-9-]/g,'').replace(/^-+|-+$/g,'');if(!s)return null;if(/^[GDN]-./.test(s))return s.slice(0,24);return PFX[type]+'-'+s.slice(0,20)}
function randomSeed(type){const A='ABCDEFGHJKMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<5;i++)s+=A[Math.floor(Math.random()*A.length)];return PFX[type]+'-'+s}
const seedType=s=>TYPES[s[0]]||'seg';
const gcd=(a,b)=>{while(b){[a,b]=[b,a%b]}return a};
const lcm=(a,b)=>a/gcd(a,b)*b;
const imp=(a,b)=>!a||b;

/* общие «формы» с одним вхождением A:
   pos — формула равна G ∨ [A]: A должно покрыть все x, где G ложно;
   neg — формула равна ¬[A] ∨ G: A должно лежать там, где G истинно. */
const FORMS={
  pos:[(a,g)=>`(${g}) ∨ ${a}`,(a,g,na)=>`${na} → (${g})`,(a,g)=>`¬(${g}) → ${a}`],
  neg:[(a,g)=>`${a} → (${g})`,(a,g,na)=>`${na} ∨ (${g})`]
};

/* ---------- отрезки ---------- */
const SEG_G=[
  {t:'(x ∈ P) → (x ∈ Q)',f:(p,q)=>imp(p,q)},{t:'(x ∈ P) ∨ (x ∈ Q)',f:(p,q)=>p||q},{t:'¬(x ∈ P) ∨ ¬(x ∈ Q)',f:(p,q)=>!p||!q},
  {t:'(x ∈ P) ≡ (x ∈ Q)',f:(p,q)=>p===q},{t:'(x ∈ Q) → (x ∈ P)',f:(p,q)=>imp(q,p)},{t:'¬(x ∈ P) → (x ∈ Q)',f:(p,q)=>p||q},
  {t:'(x ∈ P) ∧ ¬(x ∈ Q)',f:(p,q)=>p&&!q},{t:'(x ∈ P) ∧ (x ∈ Q)',f:(p,q)=>p&&q}
];
function comps(lo,hi,pred){ // компоненты {x: pred} на сетке шага 0.5; концы — с признаком включения
  const out=[];let cur=null;
  for(let x=lo;x<=hi+1e-9;x+=0.5){const v=pred(x);
    if(v&&!cur)cur={a:x,incA:Number.isInteger(x)};
    if(!v&&cur){const b=x-0.5;cur.b=Number.isInteger(b)?b:x;cur.incB=Number.isInteger(b);if(!cur.incA)cur.a-=0.5;out.push(cur);cur=null}}
  if(cur){cur.b=hi;cur.incB=true;cur.open=true;if(!cur.incA)cur.a-=0.5;out.push(cur)}
  if(out.length&&out[0].a<=lo)out[0].openL=true;
  return out;
}
const fmtI=c=>`${c.incA?'[':'('}${c.a}; ${c.b}${c.incB?']':')'}`;
function genSeg(seed){
  for(let att=0;att<300;att++){
    const r=mulberry32(xmur3(seed+'#'+att)());const pick=a=>a[Math.floor(r()*a.length)];
    const p1=5+Math.floor(r()*40),p2=p1+8+Math.floor(r()*30),q1=5+Math.floor(r()*45),q2=q1+8+Math.floor(r()*30);
    const G=pick(SEG_G),sense=r()<.55?'pos':'neg';
    const inP=x=>x>=p1&&x<=p2,inQ=x=>x>=q1&&x<=q2,g=x=>G.f(inP(x),inQ(x));
    const lo=Math.min(p1,q1)-15,hi=Math.max(p2,q2)+15;
    let ans,cs;
    if(sense==='pos'){cs=comps(lo,hi,x=>!g(x));if(!cs.length||cs.some(c=>c.open||c.openL))continue;ans=cs[cs.length-1].b-cs[0].a}
    else{cs=comps(lo,hi,g);if(!cs.length||cs.some(c=>c.open||c.openL))continue;ans=Math.max(...cs.map(c=>c.b-c.a));
      // наибольшая длина должна достигаться: самый длинный кусок — с обоими концами
      if(cs.filter(c=>c.b-c.a===ans).every(c=>!(c.incA&&c.incB)))continue}
    if(ans<=0)continue;
    const fi=Math.floor(r()*FORMS[sense].length);
    const txt=FORMS[sense][fi]('(x ∈ A)',G.t,'¬(x ∈ A)');
    const F=(x,a1,a2)=>{const a=x>=a1&&x<=a2;return sense==='pos'?(g(x)||a):(!a||g(x))};
    return {seed,type:'seg',P:[p1,p2],Q:[q1,q2],G,g,sense,txt,ans,cs,lo,hi,F,
      q:`Укажите ${sense==='pos'?'наименьшую':'наибольшую'} возможную длину отрезка A, для которого формула тождественно истинна, то есть принимает значение 1 при любом значении переменной x.`};
  }
}

/* ---------- делимость ---------- */
const CONST=[2,3,4,5,6,7,8,9,10,12,14,15,16,18,20,21,24,25,28,30,35,36,40,45];
const DEL=m=>`ДЕЛ(x, ${m})`;
const DIV_G=[
  {t:(a,b)=>`${DEL(a)} → ${DEL(b)}`,f:(x,a,b)=>imp(x%a===0,x%b===0)},
  {t:(a,b)=>`${DEL(a)} ∨ ${DEL(b)}`,f:(x,a,b)=>x%a===0||x%b===0},
  {t:(a,b)=>`¬${DEL(a)} ∨ ¬${DEL(b)}`,f:(x,a,b)=>x%a!==0||x%b!==0},
  {t:(a,b)=>`${DEL(a)} → ¬${DEL(b)}`,f:(x,a,b)=>imp(x%a===0,x%b!==0)},
  {t:(a,b)=>`¬${DEL(a)} → ${DEL(b)}`,f:(x,a,b)=>x%a===0||x%b===0}
];
const NX=4000;
function genDiv(seed){
  for(let att=0;att<300;att++){
    const r=mulberry32(xmur3(seed+'#'+att)());const pick=a=>a[Math.floor(r()*a.length)];
    const m1=pick(CONST);let m2=pick(CONST);if(m2===m1)continue;
    const G=pick(DIV_G),sense=r()<.5?'pos':'neg';const g=x=>G.f(x,m1,m2);
    let ans;
    // G зависит только от остатков по m1 и m2: период M = НОК(m1, m2)
    const M=lcm(m1,m2);
    if(sense==='pos'){let d=0;for(let x=1;x<=2*M;x++)if(!g(x))d=gcd(d,x);if(d<2||d>500)continue;ans=d}
    else{let one=true;for(let x=1;x<=M;x++)if(!g(x)){one=false;break}if(one)continue;
      // кратные A повторяются по модулю M с периодом НОК(A, M): дальше проверять не нужно
      let found=null;for(let A=2;A<=600&&found==null;A++){let ok=true;const Lp=lcm(A,M);for(let x=A;x<=Lp;x+=A)if(!g(x)){ok=false;break}if(ok)found=A}
      if(found==null)continue;ans=found}
    const fi=Math.floor(r()*FORMS[sense].length);
    const txt=FORMS[sense][fi]('ДЕЛ(x, A)',G.t(m1,m2),'¬ДЕЛ(x, A)');
    const F=(x,A)=>{const a=A>0&&x%A===0;return sense==='pos'?(g(x)||a):(!a||g(x))};
    return {seed,type:'div',m:[m1,m2],G,g,sense,txt,ans,F,
      q:`Для какого ${sense==='pos'?'наибольшего':'наименьшего'} натурального числа A формула тождественно истинна, то есть принимает значение 1 при любом натуральном x? ДЕЛ(n, m) означает «натуральное n делится без остатка на m».`};
  }
}

/* ---------- алгебраические неравенства: x, y — целые неотрицательные ---------- */
const RX=160;   // перебор x, y ∈ [0; RX]
const ALG=[
  /* (c ≠ p·x + q·y) ∨ (A < x) ∨ (A < y): все точки прямой должны иметь max(x, y) > A */
  r=>{const p=1+Math.floor(r()*4),q=1+Math.floor(r()*4);const c=(12+Math.floor(r()*40))*Math.max(p,q);
    return {txt:`(${c} ≠ ${p===1?'':p}${p===1?'':'·'}x + ${q===1?'':q}${q===1?'':'·'}y) ∨ (A < x) ∨ (A < y)`.replace('(x','(x'),
      F:(x,y,A)=>c!==p*x+q*y||A<x||A<y,sense:'max',g:(x,y)=>c!==p*x+q*y,hint:`G ложно только в точках прямой ${p}x + ${q}y = ${c}`}},
  /* (p·x + q·y < A) ∨ (x > c1) ∨ (y > c2) */
  r=>{const p=1+Math.floor(r()*3),q=1+Math.floor(r()*3),c1=5+Math.floor(r()*40),c2=5+Math.floor(r()*40);
    return {txt:`(${p===1?'':p+'·'}x + ${q===1?'':q+'·'}y < A) ∨ (x > ${c1}) ∨ (y > ${c2})`,F:(x,y,A)=>p*x+q*y<A||x>c1||y>c2,sense:'min',g:(x,y)=>x>c1||y>c2,hint:`G ложно при x ≤ ${c1} и y ≤ ${c2}`}},
  /* (x·y < A) ∨ (x > c1) ∨ (y > c2) */
  r=>{const c1=3+Math.floor(r()*15),c2=3+Math.floor(r()*15);
    return {txt:`(x·y < A) ∨ (x > ${c1}) ∨ (y > ${c2})`,F:(x,y,A)=>x*y<A||x>c1||y>c2,sense:'min',g:(x,y)=>x>c1||y>c2,hint:`G ложно при x ≤ ${c1} и y ≤ ${c2}`}},
  /* (x ≥ A) ∨ (y ≥ A) ∨ (x·y < c) */
  r=>{const c=20+Math.floor(r()*180);
    return {txt:`(x ≥ A) ∨ (y ≥ A) ∨ (x·y < ${c})`,F:(x,y,A)=>x>=A||y>=A||x*y<c,sense:'max',g:(x,y)=>x*y<c,hint:`G ложно при x·y ≥ ${c}`}},
  /* (x + y > A) ∨ (x < c1) ∨ (y < c2) */
  r=>{const c1=3+Math.floor(r()*40),c2=3+Math.floor(r()*40);
    return {txt:`(x + y > A) ∨ (x < ${c1}) ∨ (y < ${c2})`,F:(x,y,A)=>x+y>A||x<c1||y<c2,sense:'max',g:(x,y)=>x<c1||y<c2,hint:`G ложно при x ≥ ${c1} и y ≥ ${c2}`}},
  /* (y + p·x ≠ c) ∨ (A > x) ∨ (A > y)? — классика с ≠ и «A > …» */
  r=>{const p=2+Math.floor(r()*3);const c=(10+Math.floor(r()*30))*p;
    return {txt:`(y + ${p}·x ≠ ${c}) ∨ (A > x) ∨ (A > y)`,F:(x,y,A)=>y+p*x!==c||A>x||A>y,sense:'min',g:(x,y)=>y+p*x!==c,hint:`G ложно только в точках прямой y + ${p}x = ${c}`}}
];
/* всё ли верно при данном A; если нет — первая точка-контрпример */
function counter(T,A){for(let s=0;s<=2*RX;s++)for(let x=0;x<=Math.min(s,RX);x++){const y=s-x;if(y>RX)continue;if(!T.F(x,y,A))return [x,y]}return null}
function genAlg(seed){
  for(let att=0;att<200;att++){
    const r=mulberry32(xmur3(seed+'#'+att)());const t=ALG[Math.floor(r()*ALG.length)](r);
    const T={F:t.F,g:t.g};
    // монотонность по A: для min — верно при больших A, для max — при малых
    const ok=A=>counter(T,A)==null;
    let lo=-1,hi=1200,ans;
    if(t.sense==='min'){if(!ok(hi)||ok(0))continue;while(hi-lo>1){const m=(lo+hi)>>1;if(ok(m))hi=m;else lo=m}ans=hi}
    else{lo=0;hi=1200;if(!ok(0)||ok(hi))continue;while(hi-lo>1){const m=(lo+hi)>>1;if(ok(m))lo=m;else hi=m}ans=lo}
    if(ans<2||ans>600)continue;
    const crit=counter(T,t.sense==='min'?ans-1:ans+1);
    return {seed,type:'alg',txt:t.txt,F:t.F,g:t.g,sense:t.sense,ans,crit,hint:t.hint,
      q:`Для какого ${t.sense==='min'?'наименьшего':'наибольшего'} целого неотрицательного числа A формула тождественно истинна, то есть принимает значение 1 при любых целых неотрицательных x и y?`};
  }
}
const gen=seed=>({seg:genSeg,div:genDiv,alg:genAlg})[seedType(seed)](seed);

/* разбор метода после ответа */
function why(T){
  if(T.type==='seg'){
    if(T.sense==='pos')return `Формула вида «G ∨ (x ∈ A)»: где G истинно, она верна при любом A, а где G ложно, x обязан лежать в A. G ложно на ${T.cs.map(fmtI).join(' ∪ ')}. Отрезок A должен покрыть всё это, поэтому A ⊇ [${T.cs[0].a}; ${T.cs[T.cs.length-1].b}], и наименьшая длина ${T.cs[T.cs.length-1].b} − ${T.cs[0].a} = ${T.ans}.`;
    const best=T.cs.reduce((a,c)=>c.b-c.a>a.b-a.a?c:a);
    return `Формула вида «(x ∈ A) → G»: при x вне A она верна, а внутри A должно выполняться G. G истинно на ${T.cs.map(fmtI).join(' ∪ ')}. Отрезок A должен целиком лежать в одном из этих кусков; самый длинный — ${fmtI(best)}, его длина ${best.b} − ${best.a} = ${T.ans}.`;
  }
  if(T.type==='div'){
    if(T.sense==='pos'){const xs=[];for(let x=1;x<=NX&&xs.length<5;x++)if(!T.g(x))xs.push(x);
      return `Формула вида «G ∨ ДЕЛ(x, A)»: для каждого x, где G ложно, x обязано делиться на A. G ложно при x = ${xs.join(', ')}, … Число A должно делить их все, поэтому наибольшее A — их НОД, ${T.ans}.`}
    return `Формула вида «ДЕЛ(x, A) → G»: каждое кратное A должно удовлетворять G. Перебираем A по возрастанию: меньшие числа не подходят — у каждого есть кратное, на котором G ложно. Первое подходящее A = ${T.ans}.`;
  }
  const [cx,cy]=T.crit;
  return T.sense==='min'?`Где условие без A истинно, формула верна при любом A; ${T.hint}, и там должно выполняться неравенство с A. Самая «трудная» точка — x = ${cx}, y = ${cy}: при A = ${T.ans-1} формула в ней ложна, а при A = ${T.ans} истинна везде. Поэтому наименьшее A = ${T.ans}.`
    :`Где условие без A истинно, формула верна при любом A; ${T.hint}, и там должно выполняться неравенство с A. При A = ${T.ans+1} формула ложна в точке x = ${cx}, y = ${cy}, а при A = ${T.ans} истинна везде. Поэтому наибольшее A = ${T.ans}.`;
}

const MARKUP=`<div class="app t15">
  <header class="top">
    <div class="brand">
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><path d="M3 24h34" stroke="var(--ink)" stroke-width="2.4" stroke-linecap="round"/><path d="M11 18v12M27 18v12" stroke="var(--ink)" stroke-width="2.2"/><path d="M11 24h16" stroke="var(--live)" stroke-width="5" stroke-linecap="round"/><text x="19" y="13" text-anchor="middle" font-family="JetBrains Mono,monospace" font-weight="700" font-size="10" fill="var(--accent)">A</text></svg>
      <div><a class="back" href="#map">← Карта навыков</a><h1>ЕГЭ №15</h1><p>При каком A формула тождественно истинна</p></div>
    </div>
    <div class="controls">
      <div class="field"><label for="x15Student">Ученик</label><input type="text" id="x15Student" placeholder="Фамилия Имя" autocomplete="off"></div>
      <div class="field x15-pr"><label for="x15Seed">Задание №</label><div class="row"><input type="text" id="x15Seed" class="seedin" spellcheck="false" autocomplete="off"><button class="btn" id="x15Open">Открыть</button></div></div>
      <button class="btn primary x15-pr" id="x15New">Новое задание</button>
      <button class="btn" id="x15Log">Журнал</button>
    </div>
  </header>
  <div class="exam-bar" id="x15ExamBar" hidden></div>
  <div class="seg" role="tablist" aria-label="Вид задания">
    <button role="tab" id="x15TabSeg" aria-selected="true">Отрезки <span class="pill ok" id="x15SegCnt">0/2</span></button>
    <button role="tab" id="x15TabDiv" aria-selected="false">Делимость <span class="pill ok" id="x15DivCnt">0/2</span></button>
    <button role="tab" id="x15TabAlg" aria-selected="false">Неравенства <span class="pill ok" id="x15AlgCnt">0/2</span></button>
  </div>
  <div class="card">
    <div class="card-h"><span class="step">1</span><h2>Условие</h2><p id="x15Given"></p></div>
    <div class="body"><div class="f15" id="x15F"></div><p class="q15" id="x15Q"></p></div>
  </div>
  <div class="card">
    <div class="card-h"><span class="step">2</span><h2>Исследуй</h2><p id="x15ExpSub"></p></div>
    <div class="body">
      <label class="hl-t x15-pr"><input type="checkbox" id="x15Hl" checked> Подсвечивать x, на которых формула ложна (без подсветки задание засчитывается «чисто»)</label>
      <div id="x15Viz"></div>
      <div class="actrl" id="x15Ctrl"></div>
      <p class="vstat" id="x15Stat">&nbsp;</p>
    </div>
  </div>
  <div class="card">
    <div class="card-h"><span class="step">3</span><h2>Ответ</h2></div>
    <div class="body">
      <div class="row ans15"><label for="x15Ans" id="x15AnsLbl">Ответ:</label><input type="number" id="x15Ans" inputmode="numeric"><button class="btn primary" id="x15Check">Проверить</button><span class="tries" id="x15Tries"></span></div>
      <div class="msg" id="x15Msg"></div>
    </div>
  </div>
</div>
<div class="toast" id="x15Toast"></div>`;

/* ---------- прогресс ---------- */
function summarize(){
  const prog=store.get('progress',{});
  if(!Object.keys(prog).length&&!AL.node('e15').touched)return;
  const sol=Object.entries(prog).filter(([k,p])=>p.ok);
  const by=t=>sol.filter(([k])=>seedType(k)===t).length,clean=sol.filter(([k,p])=>p.clean).length;
  const n=Math.min(by('seg'),2)+Math.min(by('div'),2)+Math.min(by('alg'),2);
  const mastered=by('seg')>=2&&by('div')>=2&&by('alg')>=2&&clean>=3;
  AL.report('e15',{done:n,total:6,note:`Отрезки ${Math.min(by('seg'),2)}/2 · делимость ${Math.min(by('div'),2)}/2 · неравенства ${Math.min(by('alg'),2)}/2`+(n>=6&&clean<3?` · без подсветки: ${clean} из 3`:''),mastered,via:mastered?'practice':undefined});
}
function exportData(){const prog=store.get('progress',{}),o={};Object.entries(prog).slice(-300).forEach(([k,p])=>o[k]=[p.ok?1:0,p.clean?1:0,p.tries||0,p.first||'']);return {p:o}}
function importData(d){if(!d)return;const prog=store.get('progress',{});
  for(const [k,a] of Object.entries(d.p||{})){const c=prog[k]||(prog[k]={ok:false,clean:false,tries:0,first:a[3]||new Date().toISOString()});c.ok=c.ok||!!a[0];c.clean=c.clean||!!a[1];c.tries=Math.max(c.tries,a[2]||0)}
  store.set('progress',prog);summarize();if(api)api.refresh()}

let api=null;
function mount(){if(api)return api;document.getElementById('view-t15').innerHTML=MARKUP;api=init();return api}

function init(){
const $=s=>document.querySelector(s);
let progress=store.get('progress',{}),log=store.get('log',[]),type=store.get('type','seg'),hlOn=store.get('hl',true);
let T=null,EX=null,A=null,usedHl=false;
const saveP=()=>store.set('progress',progress);
const P=seed=>progress[seed]||(progress[seed]={ok:false,clean:false,tries:0,first:new Date().toISOString()});
function addLog(stage,input,note){log.push({t:new Date().toISOString(),seed:T?T.seed:'—',student:AL.student.get(),stage,input,note});if(log.length>3000)log=log.slice(-3000);store.set('log',log)}
function toast(t){const el=$('#x15Toast');el.textContent=t;el.classList.add('show');clearTimeout(toast.h);toast.h=setTimeout(()=>el.classList.remove('show'),1800)}
function showMsg(sel,cls,html){const el=$(sel);el.className='msg show '+cls;el.innerHTML=html}
function hideMsg(sel){$(sel).className='msg'}
function setHash(h){if(location.hash.slice(1)!==h){try{history.replaceState(null,'','#'+h)}catch(e){location.hash=h}}}
const app=()=>document.querySelector('.app.t15');
const showHl=()=>hlOn&&!EX&&!(T&&T.done);

function setType(t,push=true){
  type=t;if(!EX)store.set('type',t);
  ['Seg','Div','Alg'].forEach(x=>$('#x15Tab'+x).setAttribute('aria-selected',t===x.toLowerCase()));
  if(!T||T.type!==t)loadSeed(store.get('last-'+t,null)||randomSeed(t),push);else if(push&&!EX)setHash('t15-'+T.seed);
  renderCounts();
}
function renderCounts(){const sol=Object.entries(progress).filter(([k,p])=>p.ok);['seg','div','alg'].forEach(t=>{$('#x15'+t[0].toUpperCase()+t.slice(1)+'Cnt').textContent=Math.min(sol.filter(([k])=>seedType(k)===t).length,2)+'/2'})}
function loadSeed(seed,push=true){
  T=Object.assign(gen(seed),{done:false,answered:false});usedHl=false;
  if(T.type==='seg'){const mid=Math.round((T.lo+T.hi)/2);A=[mid-3,mid+3]}else if(T.type==='div')A=1;else A=T.sense==='min'?0:Math.min(600,T.ans*2+5);
  $('#x15Seed').value=seed;if(!EX)store.set('last-'+T.type,seed);if(push&&!EX)setHash('t15-'+seed);
  hideMsg('#x15Msg');$('#x15Ans').value='';$('#x15Hl').checked=hlOn;
  const p=P(T.seed);if(p.ok&&!EX){T.done=true;$('#x15Ans').value=String(T.ans);showMsg('#x15Msg','ok',`<b>Решено.</b> Ответ: ${T.ans}. ${esc(why(T))}<div class="actions"><button class="btn primary" id="x15NextSeed">Новое задание →</button></div>`)}
  render();
}
function render(){
  $('#x15F').textContent=T.txt;$('#x15Q').textContent=T.q;
  $('#x15Given').textContent=T.type==='seg'?`На числовой прямой даны отрезки P = [${T.P[0]}; ${T.P[1]}] и Q = [${T.Q[0]}; ${T.Q[1]}].`:T.type==='div'?'Обозначим через ДЕЛ(n, m) утверждение «натуральное число n делится без остатка на натуральное число m».':'Переменные x и y принимают любые целые неотрицательные значения.';
  $('#x15AnsLbl').textContent=T.type==='seg'?`${T.sense==='pos'?'Наименьшая':'Наибольшая'} длина отрезка A:`:T.type==='div'?`${T.sense==='pos'?'Наибольшее':'Наименьшее'} A:`:`${T.sense==='min'?'Наименьшее':'Наибольшее'} A:`;
  renderViz();
  const p=P(T.seed);$('#x15Tries').textContent=EX?'Зачёт: одна попытка':`Попыток: ${p.tries}${p.ok?(p.clean?' · сдано без подсветки':' · сдано'):''}`;
  $('#x15Check').disabled=$('#x15Ans').disabled=T.done||T.answered;
}
function renderViz(){
  const hl=showHl();
  if(hl)usedHl=true;
  if(T.type==='seg'){
    $('#x15ExpSub').textContent='Двигай концы отрезка A: перетаскивай кружки или меняй числа.';
    const W=720,H=150,pad=26,sx=x=>pad+(x-T.lo)/(T.hi-T.lo)*(W-2*pad);
    let bad=[];if(hl)bad=comps(T.lo,T.hi,x=>!T.F(x,A[0],A[1]));
    const ticks=[];for(let x=Math.ceil(T.lo/5)*5;x<=T.hi;x+=5)ticks.push(x);
    const bar=(y,a,b,cls,lab)=>`<line x1="${sx(a)}" y1="${y}" x2="${sx(b)}" y2="${y}" class="sb ${cls}"/><circle cx="${sx(a)}" cy="${y}" r="4" class="se ${cls}"/><circle cx="${sx(b)}" cy="${y}" r="4" class="se ${cls}"/><text x="${sx(a)-8}" y="${y+4}" class="sl ${cls}">${lab}</text>`;
    $('#x15Viz').innerHTML=`<div class="tt-wrap"><svg viewBox="0 0 ${W} ${H}" class="nl" id="x15Nl" role="img" aria-label="Числовая прямая">
      ${bad.map(c=>`<rect x="${sx(c.a)}" y="104" width="${Math.max(2,sx(c.b)-sx(c.a))}" height="16" class="bad"/>`).join('')}
      <line x1="${pad}" y1="112" x2="${W-pad}" y2="112" class="ax"/>
      ${ticks.map(x=>`<line x1="${sx(x)}" y1="107" x2="${sx(x)}" y2="117" class="tk"/><text x="${sx(x)}" y="134" class="tl">${x}</text>`).join('')}
      ${bar(26,T.P[0],T.P[1],'p','P')}${bar(52,T.Q[0],T.Q[1],'q','Q')}
      <line x1="${sx(A[0])}" y1="80" x2="${sx(A[1])}" y2="80" class="sb a"/><text x="${sx(A[0])-8}" y="84" class="sl a">A</text>
      <circle cx="${sx(A[0])}" cy="80" r="9" class="hd" data-h="0" tabindex="0" aria-label="Левый конец A"/><circle cx="${sx(A[1])}" cy="80" r="9" class="hd" data-h="1" tabindex="0" aria-label="Правый конец A"/>
    </svg></div>`;
    $('#x15Ctrl').innerHTML=`<label>A = [<input type="number" id="x15A0" value="${A[0]}" step="1">; <input type="number" id="x15A1" value="${A[1]}" step="1">]</label><span class="tries">длина ${A[1]-A[0]}</span>`;
    $('#x15Stat').innerHTML=hl?(bad.length?`<span class="no">Формула ложна на ${bad.map(fmtI).join(' ∪ ')}</span>`:'<span class="yes">При этом A формула истинна при любом x</span>'):'Подсветка выключена.';
  }else if(T.type==='div'){
    $('#x15ExpSub').textContent='Меняй A и смотри, при каких x от 1 до 120 формула ложна. Обведены кратные A.';
    const bad=[];
    $('#x15Viz').innerHTML=`<div class="grid15">${[...Array(120).keys()].map(i=>{const x=i+1,f=T.F(x,A);if(!f)bad.push(x);return `<span class="gx${hl&&!f?' bad':''}${A>0&&x%A===0?' mul':''}" title="x = ${x}">${x}</span>`}).join('')}</div>`;
    $('#x15Ctrl').innerHTML=`<button class="btn" data-d="-1" aria-label="Уменьшить A">−</button><label>A = <input type="number" id="x15Av" min="1" value="${A}"></label><button class="btn" data-d="1" aria-label="Увеличить A">+</button>`;
    let all=bad.length;if(hl&&!all){for(let x=121;x<=NX;x++)if(!T.F(x,A)){all=-x;break}}
    $('#x15Stat').innerHTML=hl?(bad.length?`<span class="no">Ложна при x = ${bad.slice(0,10).join(', ')}${bad.length>10?', …':''}</span>`:all<0?`<span class="no">На 1…120 всё верно, но формула ложна при x = ${-all}</span>`:'<span class="yes">При этом A формула истинна при любом x</span>'):'Подсветка выключена.';
  }else{
    const V=Math.min(RX,Math.max(20,Math.ceil(viewMax(T)*1.15)));
    $('#x15ExpSub').textContent=`Меняй A и смотри на плоскость: точка (x, y) красная, если при текущем A формула в ней ложна. Показаны x, y от 0 до ${V}.`;
    $('#x15Viz').innerHTML=`<div class="plane-w"><canvas id="x15Cv" width="440" height="440" aria-label="Плоскость x, y"></canvas></div>`;
    $('#x15Ctrl').innerHTML=`<button class="btn" data-d="-10" aria-label="Уменьшить A на 10">−10</button><button class="btn" data-d="-1" aria-label="Уменьшить A">−</button><label>A = <input type="number" id="x15Av" min="0" value="${A}"></label><button class="btn" data-d="1" aria-label="Увеличить A">+</button><button class="btn" data-d="10" aria-label="Увеличить A на 10">+10</button>`;
    drawPlane(V,hl);
    const c=hl?counter(T,A):null;
    $('#x15Stat').innerHTML=hl?(c?`<span class="no">Ложна, например, при x = ${c[0]}, y = ${c[1]}</span>`:'<span class="yes">При этом A формула истинна при любых x и y</span>'):'Подсветка выключена.';
  }
}
function viewMax(T){let m=10;const add=t=>{(t.match(/\d+/g)||[]).forEach(v=>{v=+v;if(v>m&&v<RX)m=v})};add(T.txt);if(T.crit)m=Math.max(m,T.crit[0],T.crit[1]);return m}
function drawPlane(V,hl){
  const cv=$('#x15Cv');if(!cv||!cv.getContext)return;const ctx=cv.getContext('2d');if(!ctx)return;
  const cs=getComputedStyle(document.documentElement),col=n=>cs.getPropertyValue(n).trim()||'#888';
  const W=cv.width,pad=34,S=(W-pad-10)/(V+1);
  ctx.clearRect(0,0,W,W);ctx.fillStyle=col('--sheet');ctx.fillRect(0,0,W,W);
  const px=x=>pad+x*S,py=y=>W-pad-(y+1)*S;
  // где условие без A ложно — бледная заливка: тут работает неравенство с A
  for(let x=0;x<=V;x++)for(let y=0;y<=V;y++){
    if(!T.g(x,y)){ctx.fillStyle=col('--accent-soft');ctx.fillRect(px(x),py(y),S,S)}
    if(hl&&!T.F(x,y,A)){ctx.fillStyle=col('--bad');ctx.fillRect(px(x)+.5,py(y)+.5,Math.max(1,S-1),Math.max(1,S-1))}
  }
  ctx.strokeStyle=col('--ink');ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(pad,W-pad);ctx.lineTo(W-6,W-pad);ctx.moveTo(pad,W-pad);ctx.lineTo(pad,6);ctx.stroke();
  ctx.fillStyle=col('--ink-soft');ctx.font='11px ui-monospace, monospace';ctx.textAlign='center';
  const step=V>100?20:V>50?10:5;
  for(let v=0;v<=V;v+=step){ctx.fillText(String(v),px(v)+S/2,W-pad+14);ctx.textAlign='right';ctx.fillText(String(v),pad-4,py(v)+S/2+4);ctx.textAlign='center'}
  ctx.fillStyle=col('--ink');ctx.font='bold 13px ui-monospace, monospace';ctx.fillText('x',W-10,W-pad-6);ctx.fillText('y',pad+10,14);
}
function check(){
  if(T.done||T.answered)return;const v=$('#x15Ans').value.trim();if(v===''){showMsg('#x15Msg','info','Впиши число.');return}
  const ok=+v===T.ans;const p=P(T.seed);if(!EX)p.tries++;
  const clean=!usedHl;
  addLog(EX?'Зачёт':ok?'Верно':'ЕГЭ 15',`ответ ${v}`,ok?(clean?'верно без подсветки':'верно с подсветкой'):'верно '+T.ans);
  if(EX){T.answered=true;EX.cur.ok=ok;showMsg('#x15Msg',ok?'ok':'bad',`<b>${ok?'Верно.':'Неверно, ответ '+T.ans+'.'}</b> ${esc(why(T))}<div class="actions"><button class="btn primary" id="x15ExNext">${EX.i<EX.tasks.length-1?'Дальше →':'Итог зачёта'}</button></div>`);renderExamBar()}
  else if(ok){p.ok=true;if(clean)p.clean=true;T.done=true;showMsg('#x15Msg','ok',`<b>Верно!</b>${clean?' Решено без подсветки.':''} ${esc(why(T))}<div class="actions"><button class="btn primary" id="x15NextSeed">Новое задание →</button></div>`)}
  else showMsg('#x15Msg','bad',`<b>Неверно.</b> ${p.tries>=2?esc(why(T).split(':')[0])+'. ':''}${hlOn?'Подбери A так, чтобы красного не осталось, и проверь, можно ли '+(T.type==='seg'?(T.sense==='pos'?'укоротить':'удлинить')+' отрезок':(T.ans>+v?'увеличить':'уменьшить')+' A')+'.':'Включи подсветку и исследуй, при каких A формула истинна.'}`);
  saveP();render();summarize();renderCounts();
}

/* ---------- зачёт: по одному заданию каждого вида, без подсветки ---------- */
function startExam(){EX={tasks:[randomSeed('seg'),randomSeed('div'),randomSeed('alg')],i:0,res:[],cur:{},done:false};addLog('Зачёт','—','Начат зачёт: '+EX.tasks.join(', '));app().classList.add('exam');showTask()}
function showTask(){const s=EX.tasks[EX.i];EX.cur={};type=seedType(s);['Seg','Div','Alg'].forEach(x=>$('#x15Tab'+x).setAttribute('aria-selected',type===x.toLowerCase()));loadSeed(s,false);renderExamBar();window.scrollTo(0,0)}
function renderExamBar(){
  const bar=$('#x15ExamBar');if(!EX){bar.hidden=true;app().classList.remove('exam');return}
  bar.hidden=false;
  bar.innerHTML=`<div class="ex-t"><b>Зачёт по ЕГЭ №15</b><span>${EX.done?'Зачёт завершён':`Задание ${EX.i+1} из ${EX.tasks.length}`} · подсветка выключена, одна попытка</span></div>
    <div class="ex-dots">${EX.tasks.map((t,i)=>`<span class="ex-dot ${i<EX.res.length?(EX.res[i]?'ok':'bad'):i===EX.i?'now':''}"></span>`).join('')}</div>
    <button class="btn ghost" id="x15ExQuit">${EX.done?'Закрыть зачёт':'Прервать зачёт'}</button>`;
}
function examNext(){
  EX.res.push(EX.cur.ok===true);
  if(EX.i<EX.tasks.length-1){EX.i++;showTask();return}
  EX.done=true;const k=EX.res.filter(Boolean).length,n=EX.tasks.length;renderExamBar();
  if(k===n){AL.report('e15',{mastered:true,via:'exam'});addLog('Верно','зачёт',`Зачёт сдан: ${k} из ${n}`);
    showMsg('#x15Msg','ok',`<b>Зачёт сдан: ${k} из ${n}.</b> Задание №15 засчитано.<div class="actions"><a class="btn primary" href="#map">На карту навыков</a><button class="btn" id="x15ExStay">Остаться в тренажёре</button></div>`)}
  else{addLog('Зачёт','—',`Не сдан: ${k} из ${n}`);
    showMsg('#x15Msg','bad',`<b>Зачёт не сдан: верно ${k} из ${n}.</b> Потренируйся и попробуй снова.<div class="actions"><button class="btn primary" id="x15ExRetry">Сдать ещё раз</button><button class="btn" id="x15ExStay">Тренироваться</button></div>`)}
}
function stopExam(){if(EX&&!EX.done)addLog('Зачёт','—',`Прерван на задании ${EX.i+1}`);EX=null;renderExamBar();T=null;setType(store.get('type','seg'))}

/* ---------- события ---------- */
['Seg','Div','Alg'].forEach(x=>$('#x15Tab'+x).onclick=()=>{if(EX)return toast('Сначала закончи или прерви зачёт');setType(x.toLowerCase())});
$('#x15Hl').onchange=()=>{hlOn=$('#x15Hl').checked;store.set('hl',hlOn);renderViz()};
const setSeg=(i,v)=>{v=Math.round(v);if(i===0)A[0]=Math.min(v,A[1]);else A[1]=Math.max(v,A[0]);renderViz()};
$('#x15Ctrl').addEventListener('change',e=>{
  if(e.target.id==='x15A0')setSeg(0,+e.target.value);if(e.target.id==='x15A1')setSeg(1,+e.target.value);
  if(e.target.id==='x15Av'){A=Math.max(T.type==='div'?1:0,Math.round(+e.target.value)||0);renderViz()}});
$('#x15Ctrl').addEventListener('click',e=>{
  const d=e.target.closest('[data-d]');if(d){A=Math.max(T.type==='div'?1:0,A+ +d.dataset.d);renderViz();return}
});
let drag=null;
$('#x15Viz').addEventListener('pointerdown',e=>{const h=e.target.closest('.hd');if(!h)return;drag=+h.dataset.h;try{h.setPointerCapture(e.pointerId)}catch(err){}e.preventDefault()});
$('#x15Viz').addEventListener('pointermove',e=>{if(drag==null)return;const svg=$('#x15Nl');const r=svg.getBoundingClientRect();const x=(e.clientX-r.left)/r.width*720;
  const v=T.lo+(x-26)/(720-52)*(T.hi-T.lo);const nv=Math.round(Math.max(T.lo,Math.min(T.hi,v)));if(nv!==A[drag]){setSeg(drag,nv)}});
document.addEventListener('pointerup',()=>{drag=null});
$('#x15Viz').addEventListener('keydown',e=>{const h=e.target.closest('.hd');if(!h)return;const i=+h.dataset.h;
  if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();setSeg(i,A[i]+(e.key==='ArrowRight'?1:-1));const nh=$(`#x15Viz .hd[data-h="${i}"]`);nh&&nh.focus()}});
$('#x15Check').onclick=check;$('#x15Ans').addEventListener('keydown',e=>{if(e.key==='Enter')check()});
$('#x15Msg').addEventListener('click',e=>{
  if(e.target.id==='x15NextSeed')loadSeed(randomSeed(type));
  if(e.target.id==='x15ExNext')examNext();
  if(e.target.id==='x15ExRetry')startExam();
  if(e.target.id==='x15ExStay')stopExam();
});
$('#x15ExamBar').addEventListener('click',e=>{if(e.target.id==='x15ExQuit')stopExam()});
$('#x15New').onclick=()=>loadSeed(randomSeed(type));
const openSeed=()=>{const s=normSeed($('#x15Seed').value,type);if(!s){toast('Введи номер задания');return}type=seedType(s);setType(type,false);loadSeed(s)};
$('#x15Open').onclick=openSeed;$('#x15Seed').addEventListener('keydown',e=>{if(e.key==='Enter')openSeed()});
$('#x15Student').value=AL.student.get();
$('#x15Student').addEventListener('input',()=>AL.student.set($('#x15Student').value));
AL.on('student',v=>{if(document.activeElement!==$('#x15Student'))$('#x15Student').value=v});
$('#x15Log').onclick=()=>AL.openLog&&AL.openLog();

function enter(arg){
  if(arg==='exam'){startExam();return}
  if(EX&&EX.done&&!arg){stopExam();return}
  if(EX)return;
  const s=arg?normSeed(arg,type):null;
  if(s){type=seedType(s);store.set('type',type);store.set('last-'+type,s);T=null;setType(type,false);return}
  setType(type,true);
}
function refresh(){progress=store.get('progress',{});renderCounts()}
return {enter,refresh};
}

AL.register('t15',{title:'ЕГЭ №15',logRows:()=>store.get('log',[]),exportData,importData,enter:arg=>mount().enter(arg)});
summarize();
})();
