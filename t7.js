/* Тренажёр 7 «Логика и множества»: круги Эйлера (закрасить область, записать выражение),
   связь областей со строками таблицы истинности, задачи о поисковых запросах с | и &. */
(()=>{
const store=AL.store.scoped('t7');
const L=AL.logic;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function xmur3(str){let h=1779033703^str.length;for(let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353);h=h<<13|h>>>19}
  return()=>{h=Math.imul(h^(h>>>16),2246822507);h=Math.imul(h^(h>>>13),3266489909);return(h^=h>>>16)>>>0}}
function mulberry32(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
/* «S2-…» — закрасить, «W2-…» — записать, «Q-…» — запросы */
const MODES={S:'sh',W:'wr',Q:'qu'},PFX={sh:'S',wr:'W',qu:'Q'};
function normSeed(raw,lvl,mode){let s=String(raw||'').toUpperCase().replace(/[^A-Z0-9-]/g,'').replace(/^-+|-+$/g,'');if(!s)return null;
  if(/^[SW][123]-./.test(s)||/^Q-./.test(s))return s.slice(0,24);return PFX[mode]+(mode==='qu'?'':lvl)+'-'+s.slice(0,20)}
function randomSeed(lvl,mode){const A='ABCDEFGHJKMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<5;i++)s+=A[Math.floor(Math.random()*A.length)];return PFX[mode]+(mode==='qu'?'':lvl)+'-'+s}
const seedMode=s=>MODES[s[0]]||'sh';

/* ---------- геометрия кругов Эйлера ---------- */
const GEO={2:{w:360,h:240,c:[[140,122,78],[220,122,78]],lab:[[78,52],[282,52]]},
           3:{w:360,h:300,c:[[140,118,76],[220,118,76],[180,188,76]],lab:[[66,52],[294,52],[180,288]]}};
const NAMES=['A','B','C'];
/* номер области = номер строки таблицы: A — старший бит */
function regionAt(n,x,y){const g=GEO[n];let m=0;g.c.forEach(([cx,cy,r],i)=>{if((x-cx)**2+(y-cy)**2<=r*r)m|=1<<(n-1-i)});return m}
function centroid(n,m){const g=GEO[n];let sx=0,sy=0,k=0;for(let x=14;x<g.w-14;x+=4)for(let y=14;y<g.h-14;y+=4)if(regionAt(n,x,y)===m){sx+=x;sy+=y;k++}return k?[sx/k,sy/k]:[g.w/2,g.h/2]}
const CENT={};[2,3].forEach(n=>{CENT[n]=[...Array(1<<n).keys()].map(m=>centroid(n,m))});
/* для внешней области — точка в углу, а не центр масс */
CENT[2][0]=[36,224];CENT[3][0]=[36,284];
function regionName(n,m){return NAMES.slice(0,n).map((v,i)=>((m>>(n-1-i))&1)?v:'¬'+v).join(' ∧ ')}
function vennSVG(id,n,shade,opt={}){
  const g=GEO[n];const P=id;
  let defs=`<defs>`;
  g.c.forEach(([cx,cy,r],i)=>{defs+=`<clipPath id="${P}c${i}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath>`});
  [...Array(1<<n).keys()].forEach(m=>{defs+=`<mask id="${P}m${m}"><rect x="0" y="0" width="${g.w}" height="${g.h}" fill="#fff"/>${g.c.map(([cx,cy,r],i)=>((m>>(n-1-i))&1)?'':`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#000"/>`).join('')}</mask>`});
  defs+=`<pattern id="${P}hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="var(--glow)"/><line x1="0" y1="0" x2="0" y2="8" stroke="var(--live)" stroke-width="2" stroke-opacity=".45"/></pattern></defs>`;
  const regs=[...Array(1<<n).keys()].map(m=>{
    let el=`<rect x="12" y="12" width="${g.w-24}" height="${g.h-24}" rx="14" mask="url(#${P}m${m})" class="vr${shade[m]?' on':''}${opt.marks&&opt.marks[m]?' '+opt.marks[m]:''}" data-m="${m}" fill="${shade[m]?`url(#${P}hatch)`:'transparent'}"/>`;
    g.c.forEach((c,i)=>{if((m>>(n-1-i))&1)el=`<g clip-path="url(#${P}c${i})">${el}</g>`});return el}).join('');
  const outline=`<rect x="12" y="12" width="${g.w-24}" height="${g.h-24}" rx="14" class="vu"/>`+g.c.map(([cx,cy,r])=>`<circle cx="${cx}" cy="${cy}" r="${r}" class="vc"/>`).join('');
  const labels=g.lab.map(([x,y],i)=>`<text x="${x}" y="${y}" class="vl">${NAMES[i]}</text>`).join('');
  const nums=opt.nums?opt.nums.map((v,m)=>v==null?'':`<text x="${CENT[n][m][0]}" y="${CENT[n][m][1]+5}" class="vn">${esc(v)}</text>`).join(''):'';
  const hl=opt.hl!=null?`<g class="vhl">${(()=>{let el=`<rect x="12" y="12" width="${g.w-24}" height="${g.h-24}" rx="14" mask="url(#${P}m${opt.hl})"/>`;g.c.forEach((c,i)=>{if((opt.hl>>(n-1-i))&1)el=`<g clip-path="url(#${P}c${i})">${el}</g>`});return el})()}</g>`:'';
  return `<svg viewBox="0 0 ${g.w} ${g.h}" class="venn${opt.click?' click':''}" data-n="${n}" role="img" aria-label="Круги Эйлера для ${NAMES.slice(0,n).join(', ')}">${defs}<text x="${g.w-20}" y="34" class="vU">U</text>${regs}${hl}${outline}${labels}${nums}</svg>`;
}

/* ---------- выражения ---------- */
const V=v=>({op:'var',v}),Nn=a=>a.op==='not'?a.a:{op:'not',a};
function randExpr(r,vars,k,ops){
  const pick=a=>a[Math.floor(r()*a.length)];
  const pool=[...vars];const leaves=[];while(leaves.length<k+1){if(!pool.length)pool.push(...vars);leaves.push(pool.splice(Math.floor(r()*pool.length),1)[0])}
  let li=0;const b=c=>{let n=c===0?V(leaves[li++]):(()=>{const l=Math.floor(r()*c);return {op:pick(ops),a:b(l),b:b(c-1-l)}})();if(r()<.3)n=Nn(n);return n};return b(k);
}
function clean(t){let ok=true;const w=n=>{if(n.op==='not'&&n.a.op==='not')ok=false;if(n.b){const pa=L.pretty(n.a),pb=L.pretty(n.b);if(pa===pb||pa==='¬'+pb||pb==='¬'+pa)ok=false;
  [n.a,n.b].forEach(c=>{if(c.op===n.op&&c.b){const x=L.pretty(c.a),y=L.pretty(c.b),o=c===n.a?pb:pa;if(x===o||y===o)ok=false}})}if(n.a)w(n.a);if(n.b)w(n.b)};w(t);return ok}
const envOf=(vs,m)=>{const e={};vs.forEach((v,i)=>e[v]=(m>>(vs.length-1-i))&1);return e};
function regionsOf(t,n){const vs=NAMES.slice(0,n);return [...Array(1<<n).keys()].map(m=>L.evaluate(t,envOf(vs,m))===1)}
function genSet(seed){
  const mode=seedMode(seed),lvl=+seed[1]||1;const n=lvl===1?2:3;
  const want=1+Math.floor(mulberry32(xmur3(seed+'#want')())()*((1<<n)-1));   // сколько областей хотим закрасить
  for(let a=0;a<400;a++){
    const r=mulberry32(xmur3(seed+'#'+a)());
    const ops=lvl===3?['and','or','or','and','imp','eq']:lvl===2?['and','or','or','and','xor']:['and','or','and','or','xor'];
    const t=randExpr(r,NAMES.slice(0,n),lvl===1?1+Math.floor(r()*2):2+Math.floor(r()*2),ops);
    if(!clean(t))continue;
    const reg=regionsOf(t,n),cnt=reg.filter(Boolean).length;
    if(cnt===0||cnt===reg.length)continue;
    if(a<300&&Math.abs(cnt-want)>(n===2?0:1))continue;
    if(L.vars(t).size<n)continue;
    const txt=L.pretty(t);if(txt.length>28)continue;
    // несущественная переменная не нужна
    let ok=true;NAMES.slice(0,n).forEach((v,i)=>{const bit=1<<(n-1-i);if(reg.every((x,m)=>x===reg[m^bit]))ok=false});if(!ok)continue;
    return {seed,mode,level:lvl,n,t,txt,reg};
  }
}
/* ---------- запросы ---------- */
const WORDS=[['Крейсер','Линкор'],['Пушкин','Лермонтов'],['Python','Pascal'],['Волга','Дон'],['Моцарт','Бах'],['Нептун','Уран'],['Байкал','Ладога'],['Сыр','Масло'],['Кошки','Собаки'],['Шахматы','Шашки']];
function genQuery(seed){
  const r=mulberry32(xmur3(seed)());const pick=a=>a[Math.floor(r()*a.length)];
  const [w1,w2]=pick(WORDS);const k=r()<.5?1:10;
  const a=(5+Math.floor(r()*60))*10*k,b=(5+Math.floor(r()*60))*10*k,ab=(1+Math.floor(r()*30))*10*k;
  const Q=[{q:`${w1} | ${w2}`,v:a+b+ab,kind:'or'},{q:w1,v:a+ab,kind:'A'},{q:w2,v:b+ab,kind:'B'},{q:`${w1} & ${w2}`,v:ab,kind:'and'}];
  const ask=Math.floor(r()*4);
  const order=AL.shuffle([0,1,2,3],r);
  return {seed,mode:'qu',level:2,w1,w2,regions:{a,b,ab},Q,ask,order,unit:k===1?'тыс.':''};
}
function qWhy(T){
  const [or,A,B,and]=T.Q.map(x=>x.v),q=T.Q[T.ask].kind;
  const f={or:`|${T.w1} ∪ ${T.w2}| = |${T.w1}| + |${T.w2}| − |${T.w1} ∩ ${T.w2}| = ${A} + ${B} − ${and} = ${or}`,
    A:`|${T.w1}| = |${T.w1} ∪ ${T.w2}| − |${T.w2}| + |${T.w1} ∩ ${T.w2}| = ${or} − ${B} + ${and} = ${A}`,
    B:`|${T.w2}| = |${T.w1} ∪ ${T.w2}| − |${T.w1}| + |${T.w1} ∩ ${T.w2}| = ${or} − ${A} + ${and} = ${B}`,
    and:`|${T.w1} ∩ ${T.w2}| = |${T.w1}| + |${T.w2}| − |${T.w1} ∪ ${T.w2}| = ${A} + ${B} − ${or} = ${and}`}[q];
  return f;
}

const MARKUP=`<div class="app t7">
  <header class="top">
    <div class="brand">
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><rect x="3" y="5" width="34" height="30" rx="5" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2"/><circle cx="15" cy="20" r="9" fill="none" stroke="var(--ink)" stroke-width="2.2"/><circle cx="25" cy="20" r="9" fill="none" stroke="var(--ink)" stroke-width="2.2"/><path d="M20 12.5a9 9 0 0 1 0 15a9 9 0 0 1 0-15z" fill="var(--glow)" stroke="var(--live)" stroke-width="1.5"/></svg>
      <div><a class="back" href="#map">← Карта навыков</a><h1>Логика и множества</h1><p>Круги Эйлера, области и строки таблицы, поисковые запросы</p></div>
    </div>
    <div class="controls">
      <div class="field"><label for="x7Student">Ученик</label><input type="text" id="x7Student" placeholder="Фамилия Имя" autocomplete="off"></div>
      <div class="field x7-pr"><label for="x7Seed">Задание №</label><div class="row"><input type="text" id="x7Seed" class="seedin" spellcheck="false" autocomplete="off"><button class="btn" id="x7Open">Открыть</button></div></div>
      <div class="field x7-pr x7-lv"><label for="x7Level">Уровень</label><div class="row"><select id="x7Level"><option value="1">1 · два множества</option><option value="2">2 · три множества</option><option value="3">3 · три множества и →</option></select></div></div>
      <button class="btn primary x7-pr" id="x7New">Новое задание</button>
      <button class="btn" id="x7Log">Журнал</button>
    </div>
  </header>
  <div class="exam-bar" id="x7ExamBar" hidden></div>
  <div class="seg" role="tablist" aria-label="Режим">
    <button role="tab" id="x7TabSh" aria-selected="true">Закрась <span class="pill ok" id="x7ShCnt">0/4</span></button>
    <button role="tab" id="x7TabWr" aria-selected="false">Запиши выражение <span class="pill ok" id="x7WrCnt">0/3</span></button>
    <button role="tab" id="x7TabQu" aria-selected="false">Запросы <span class="pill ok" id="x7QuCnt">0/2</span></button>
  </div>

  <section id="x7Set" class="t7-grid">
    <div class="card">
      <div class="card-h"><span class="step" id="x7Step">◐</span><h2 id="x7Title">Закрась область</h2><p id="x7Sub"></p></div>
      <div class="body">
        <div class="task-e" id="x7Task"></div>
        <div class="venn-wrap" id="x7Venn"></div>
        <p class="vhover" id="x7Hover">&nbsp;</p>
        <div id="x7WrBox" hidden>
          <div class="exprline"><span class="pre">F =</span><input type="text" id="x7Expr" placeholder="например: A ∧ ¬B" spellcheck="false" autocomplete="off" aria-label="Выражение"></div>
          <div class="preview" id="x7Prev">&nbsp;</div>
          <div class="pad" id="x7Pad"></div>
        </div>
        <div class="actions"><button class="btn primary" id="x7Check">Проверить</button><button class="btn ghost" id="x7Clear">Очистить</button><span class="tries" id="x7Tries"></span></div>
        <div class="msg" id="x7Msg"></div>
      </div>
    </div>
    <aside class="card">
      <div class="card-h"><span class="step">⇄</span><h2>Области и строки таблицы</h2><p>Каждая область — это набор значений: внутри круга переменная равна 1, снаружи 0. Закрашенные области — строки, где выражение истинно.</p></div>
      <div class="body"><div class="tt-wrap"><table class="tt t7tt" id="x7Map"></table></div>
        <p class="tries">∧ — пересечение ∩, ∨ — объединение ∪, ¬ — дополнение до всего множества U.</p></div>
    </aside>
  </section>

  <section id="x7Qu" class="t7-grid" hidden>
    <div class="card">
      <div class="card-h"><span class="step">?</span><h2>Поисковые запросы</h2><p>В языке запросов «|» означает ИЛИ, «&amp;» — И. Считай, что за время выполнения запросов набор страниц не менялся.</p></div>
      <div class="body">
        <table class="qtab" id="x7QTab"></table>
        <div class="row qans"><label for="x7QAns" id="x7QLbl">Сколько страниц найдётся?</label><input type="number" id="x7QAns" min="0" inputmode="numeric"><button class="btn primary" id="x7QCheck">Проверить</button></div>
        <div class="msg" id="x7QMsg"></div>
      </div>
    </div>
    <aside class="card">
      <div class="card-h"><span class="step">◐</span><h2>Как считать</h2><p>Раздели всё на три части: только первое слово, только второе и оба сразу. Каждый запрос — сумма нескольких частей.</p></div>
      <div class="body"><div class="venn-wrap" id="x7QVenn"></div><p class="tries" id="x7QNote">После ответа здесь появятся числа в каждой части.</p></div>
    </aside>
  </section>
</div>
<div class="toast" id="x7Toast"></div>`;

/* ---------- прогресс ---------- */
function summarize(){
  const prog=store.get('progress',{});
  if(!Object.keys(prog).length&&!AL.node('n7').touched)return;
  const sol=Object.entries(prog).filter(([k,p])=>p.ok);
  const sh=sol.filter(([k])=>k[0]==='S'),wr=sol.filter(([k])=>k[0]==='W'),qu=sol.filter(([k])=>k[0]==='Q'),three=sh.filter(([k])=>+k[1]>=2).length;
  const a=Math.min(sh.length,4),b=Math.min(wr.length,3),c=Math.min(qu.length,2);
  const mastered=sh.length>=4&&three>=2&&wr.length>=3&&qu.length>=2;
  AL.report('n7',{done:a+b+c,total:9,note:`Закрашено ${a} из 4 · записано ${b} из 3 · запросы ${c} из 2`,mastered,via:mastered?'practice':undefined});
}
function exportData(){const prog=store.get('progress',{}),o={};Object.entries(prog).slice(-300).forEach(([k,p])=>o[k]=[p.ok?1:0,p.tries||0,p.first||'']);return {p:o}}
function importData(d){if(!d)return;const prog=store.get('progress',{});
  for(const [k,a] of Object.entries(d.p||{})){const c=prog[k]||(prog[k]={ok:false,tries:0,first:a[2]||new Date().toISOString()});c.ok=c.ok||!!a[0];c.tries=Math.max(c.tries,a[1]||0)}
  store.set('progress',prog);summarize();if(api)api.refresh()}

let api=null;
function mount(){if(api)return api;document.getElementById('view-t7').innerHTML=MARKUP;api=init();return api}

function init(){
const $=s=>document.querySelector(s);
let progress=store.get('progress',{}),log=store.get('log',[]),level=store.get('level',1),mode=store.get('mode','sh');
let T=null,Q=null,EX=null,hover=null;
const saveP=()=>store.set('progress',progress);
const P=seed=>progress[seed]||(progress[seed]={ok:false,tries:0,first:new Date().toISOString()});
function addLog(stage,input,note){log.push({t:new Date().toISOString(),seed:mode==='qu'?(Q?Q.seed:'—'):(T?T.seed:'—'),student:AL.student.get(),stage,input,note});if(log.length>3000)log=log.slice(-3000);store.set('log',log)}
function toast(t){const el=$('#x7Toast');el.textContent=t;el.classList.add('show');clearTimeout(toast.h);toast.h=setTimeout(()=>el.classList.remove('show'),1800)}
function showMsg(sel,cls,html){const el=$(sel);el.className='msg show '+cls;el.innerHTML=html}
function hideMsg(sel){$(sel).className='msg'}
function setHash(h){if(location.hash.slice(1)!==h){try{history.replaceState(null,'','#'+h)}catch(e){location.hash=h}}}
const app=()=>document.querySelector('.app.t7');

function setMode(m,push=true){
  mode=m;if(!EX)store.set('mode',m);
  ['Sh','Wr','Qu'].forEach(x=>$('#x7Tab'+x).setAttribute('aria-selected',m===x.toLowerCase()));
  $('#x7Set').hidden=m==='qu';$('#x7Qu').hidden=m!=='qu';app().classList.toggle('mode-qu',m==='qu');
  const cur=m==='qu'?Q:T;
  if(!cur||cur.mode!==m)loadSeed(store.get('last-'+m,null)||randomSeed(level,m),push);
  else{$('#x7Seed').value=cur.seed;if(push&&!EX)setHash('t7-'+cur.seed)}
  renderCounts();
}
function renderCounts(){
  const sol=Object.entries(progress).filter(([k,p])=>p.ok);
  $('#x7ShCnt').textContent=Math.min(sol.filter(([k])=>k[0]==='S').length,4)+'/4';
  $('#x7WrCnt').textContent=Math.min(sol.filter(([k])=>k[0]==='W').length,3)+'/3';
  $('#x7QuCnt').textContent=Math.min(sol.filter(([k])=>k[0]==='Q').length,2)+'/2';
}
function loadSeed(seed,push=true){
  const m=seedMode(seed);
  if(m==='qu')loadQuery(seed);else loadSet(seed);
  $('#x7Seed').value=seed;if(!EX)store.set('last-'+m,seed);if(push&&!EX)setHash('t7-'+seed);
}

/* ---------- закрасить / записать ---------- */
function loadSet(seed){
  T=Object.assign(genSet(seed),{shade:null,marks:null,done:false,answered:false});
  T.shade=T.mode==='sh'?Array(1<<T.n).fill(false):T.reg.slice();
  level=T.level;$('#x7Level').value=String(level);
  $('#x7Expr').value='';updPrev();hideMsg('#x7Msg');
  const p=P(T.seed);if(p.ok&&!EX){T.done=true;if(T.mode==='sh')T.shade=T.reg.slice();
    showMsg('#x7Msg','ok',`<b>Решено.</b> Это задание уже сдано.<div class="actions"><button class="btn primary" id="x7NextSeed">Новое задание →</button></div>`)}
  renderSet();
}
function renderSet(){
  const sh=T.mode==='sh';
  $('#x7Title').textContent=sh?'Закрась область':'Запиши выражение';$('#x7Step').textContent=sh?'◐':'✎';
  $('#x7Sub').textContent=sh?'Нажимай на части рисунка, чтобы закрасить область, которая соответствует выражению. Внешняя часть прямоугольника — тоже область.':'Закрашена область. Запиши выражение для неё. Подойдёт любое равносильное выражение.';
  $('#x7Task').innerHTML=sh?`<span class="en">F</span> = ${esc(T.txt)}`:`<span class="en">F</span> = ?`;
  $('#x7Venn').innerHTML=vennSVG('x7v',T.n,T.shade,{click:sh&&!T.done&&!T.answered,marks:T.marks,hl:hover});
  $('#x7WrBox').hidden=sh;$('#x7Clear').hidden=!sh;
  if(!sh){const keys=[...NAMES.slice(0,T.n).map(v=>[v,v,'']),['¬','¬','op'],['∧',' ∧ ','op'],['∨',' ∨ ','op'],['→',' → ','op'],['(','(',''],[')',')',''],['⌫','BS',''],['Сброс','CLR','']];
    $('#x7Pad').innerHTML=keys.map(([l,ins,c])=>`<button class="${c}" data-ins="${esc(ins)}">${l}</button>`).join('')}
  const vs=NAMES.slice(0,T.n);
  $('#x7Map').innerHTML=`<thead><tr>${vs.map(v=>`<th>${v}</th>`).join('')}<th>область</th><th class="f">${sh?'закрашена':'F'}</th></tr></thead><tbody>${[...Array(1<<T.n).keys()].map(m=>{const e=envOf(vs,m);
    return `<tr data-m="${m}" class="${hover===m?'now':''}">${vs.map(v=>`<td>${e[v]}</td>`).join('')}<td class="rn">${esc(regionName(T.n,m))}</td><td class="fc"><button class="fbtn${T.shade[m]?' filled on':''}${T.marks&&T.marks[m]?' '+T.marks[m]:''}" data-m="${m}" ${!sh||T.done||T.answered?'disabled':''} aria-label="Область ${esc(regionName(T.n,m))}">${T.shade[m]?1:0}</button></td></tr>`}).join('')}</tbody>`;
  const p=P(T.seed);$('#x7Tries').textContent=EX?'Зачёт: одна попытка':`Попыток: ${p.tries}${p.ok?' · сдано':''}`;
  $('#x7Check').disabled=T.done||T.answered;$('#x7Clear').disabled=T.done||T.answered;
}
function toggleRegion(m){if(T.mode!=='sh'||T.done||T.answered)return;T.shade[m]=!T.shade[m];T.marks=null;hideMsg('#x7Msg');renderSet()}
function updPrev(){
  const src=$('#x7Expr').value,el=$('#x7Prev');
  if(!src.trim()){el.className='preview';el.innerHTML='&nbsp;';return null}
  try{const a=L.parse(src);el.className='preview';el.textContent='Читается как: F = '+L.pretty(a);return a}
  catch(e){if(!(e instanceof L.Err))throw e;el.className='preview err';el.textContent=`${e.msg} (позиция ${e.pos+1})`;return null}
}
function checkSet(){
  if(T.done||T.answered)return;
  let ok,note,html;
  if(T.mode==='sh'){
    const bad=T.reg.map((x,m)=>x!==T.shade[m]?m:-1).filter(m=>m>=0);
    ok=!bad.length;note=ok?'закрашено верно':`ошибок в областях: ${bad.length}`;
    if(!ok){T.marks={};bad.forEach(m=>T.marks[m]='bad');const m=bad[0],e=envOf(NAMES.slice(0,T.n),m);
      html=`<b>Ошибка.</b> Неверных областей: ${bad.length}, они отмечены красным в таблице. Например, область ${esc(regionName(T.n,m))} (${Object.entries(e).map(([k,v])=>k+' = '+v).join(', ')}): F = ${L.evaluate(T.t,e)}, поэтому её ${T.reg[m]?'нужно закрасить':'закрашивать не нужно'}.`}
  }else{
    let ast;try{ast=L.parse($('#x7Expr').value)}catch(e){if(!(e instanceof L.Err))throw e;showMsg('#x7Msg','info',`Выражение не разобрано: ${esc(e.msg)}. Это не считается попыткой.`);return}
    const extra=[...L.vars(ast)].filter(v=>!NAMES.slice(0,T.n).includes(v));
    if(extra.length){showMsg('#x7Msg','info',`На рисунке нет множества ${extra.join(', ')}. Попытка не засчитана.`);return}
    const got=regionsOf(ast,T.n);const bad=T.reg.map((x,m)=>x!==got[m]?m:-1).filter(m=>m>=0);
    ok=!bad.length;note=(ok?'верно: ':'ошибка: ')+L.pretty(ast);
    if(!ok){const m=bad[0];html=`<b>Не совпадает.</b> Область ${esc(regionName(T.n,m))} ${T.reg[m]?'закрашена, а твоё выражение её не включает':'не закрашена, а твоё выражение её включает'}. Подсказка: можно собрать выражение из закрашенных областей через ∨, например ${esc(regionName(T.n,T.reg.indexOf(true)))} ∨ …`}
    else html=`<b>Верно!</b> F = ${esc(L.pretty(ast))}${L.pretty(ast)!==T.txt?` — то же, что ${esc(T.txt)}`:''}.`;
  }
  const p=P(T.seed);if(!EX)p.tries++;
  addLog(EX?'Зачёт':ok?'Верно':(T.mode==='sh'?'Закраска':'Запись'),T.mode==='sh'?T.txt:$('#x7Expr').value,note);
  if(EX){T.answered=true;EX.cur.ok=ok;if(T.mode==='sh'&&!ok){T.shade=T.reg.slice()}
    showMsg('#x7Msg',ok?'ok':'bad',`${ok?(html||'<b>Верно.</b>'):html}${!ok&&T.mode==='sh'?' Правильная закраска показана.':''}<div class="actions"><button class="btn primary" id="x7ExNext">${EX.i<EX.tasks.length-1?'Дальше →':'Итог зачёта'}</button></div>`);renderExamBar()}
  else if(ok){p.ok=true;T.done=true;showMsg('#x7Msg','ok',`${html||'<b>Верно!</b> Область закрашена правильно.'}<div class="actions"><button class="btn primary" id="x7NextSeed">Новое задание →</button></div>`)}
  else showMsg('#x7Msg','bad',html);
  saveP();renderSet();summarize();renderCounts();
}

/* ---------- запросы ---------- */
function loadQuery(seed){
  Q=Object.assign(genQuery(seed),{done:false,answered:false});
  hideMsg('#x7QMsg');$('#x7QAns').value='';
  const p=P(Q.seed);if(p.ok&&!EX){Q.done=true;$('#x7QAns').value=String(Q.Q[Q.ask].v)}
  renderQuery();
}
function renderQuery(){
  const u=Q.unit?' '+Q.unit:'';
  $('#x7QTab').innerHTML=`<thead><tr><th>Запрос</th><th>Найдено страниц${Q.unit?' (в тысячах)':''}</th></tr></thead><tbody>${Q.order.map(i=>{const x=Q.Q[i];
    return `<tr class="${i===Q.ask?'ask':''}"><td class="qq">${esc(x.q)}</td><td class="qv">${i===Q.ask?'?':x.v}</td></tr>`}).join('')}</tbody>`;
  $('#x7QLbl').textContent=`Сколько страниц${Q.unit?' (в тысячах)':''} найдётся по запросу «${Q.Q[Q.ask].q}»?`;
  const show=Q.done||Q.answered;
  $('#x7QVenn').innerHTML=vennSVG('x7q',2,[false,false,false,false],{nums:show?[null,Q.regions.b,Q.regions.a,Q.regions.ab]:[null,'?','?','?']}).replace(/>A</,`>${esc(Q.w1)}<`).replace(/>B</,`>${esc(Q.w2)}<`);
  $('#x7QNote').textContent=show?`Только «${Q.w1}»: ${Q.regions.a}, только «${Q.w2}»: ${Q.regions.b}, оба слова: ${Q.regions.ab}.`:'После ответа здесь появятся числа в каждой части.';
  $('#x7QCheck').disabled=Q.done||Q.answered;$('#x7QAns').disabled=Q.done||Q.answered;
}
function checkQuery(){
  if(Q.done||Q.answered)return;const v=$('#x7QAns').value.trim();if(v===''){showMsg('#x7QMsg','info','Впиши число.');return}
  const right=Q.Q[Q.ask].v,ok=+v===right;const p=P(Q.seed);if(!EX)p.tries++;
  addLog(EX?'Зачёт':ok?'Верно':'Запросы',`${Q.Q[Q.ask].q} = ${v}`,ok?'верно':'верно '+right);
  const why=esc(qWhy(Q));
  if(EX){Q.answered=true;EX.cur.ok=ok;showMsg('#x7QMsg',ok?'ok':'bad',`<b>${ok?'Верно.':'Неверно.'}</b> ${why}.<div class="actions"><button class="btn primary" id="x7ExNext">${EX.i<EX.tasks.length-1?'Дальше →':'Итог зачёта'}</button></div>`);renderExamBar()}
  else if(ok){p.ok=true;Q.done=true;showMsg('#x7QMsg','ok',`<b>Верно!</b> ${why}.<div class="actions"><button class="btn primary" id="x7NextSeed">Новое задание →</button></div>`)}
  else showMsg('#x7QMsg','bad',`<b>Неверно.</b> ${p.tries>=2?'Формула: |A ∪ B| = |A| + |B| − |A ∩ B|. Подставь известные числа.':'Подумай, из каких частей рисунка складывается каждый запрос. Пересечение входит и в «'+esc(Q.w1)+'», и в «'+esc(Q.w2)+'».'}`);
  saveP();renderQuery();summarize();renderCounts();
}

/* ---------- зачёт: закраска (3 множества), запись (3 множества), запрос ---------- */
function startExam(){EX={tasks:[randomSeed(2,'sh'),randomSeed(2,'wr'),randomSeed(2,'qu')],i:0,res:[],cur:{},done:false};addLog('Зачёт','—','Начат зачёт: '+EX.tasks.join(', '));app().classList.add('exam');showTask()}
function showTask(){const s=EX.tasks[EX.i];EX.cur={};mode=seedMode(s);setMode(mode,false);loadSeed(s,false);renderExamBar();window.scrollTo(0,0)}
function renderExamBar(){
  const bar=$('#x7ExamBar');if(!EX){bar.hidden=true;app().classList.remove('exam');return}
  bar.hidden=false;
  bar.innerHTML=`<div class="ex-t"><b>Зачёт по теме 7</b><span>${EX.done?'Зачёт завершён':`Задание ${EX.i+1} из ${EX.tasks.length}`} · одна попытка на каждое</span></div>
    <div class="ex-dots">${EX.tasks.map((t,i)=>`<span class="ex-dot ${i<EX.res.length?(EX.res[i]?'ok':'bad'):i===EX.i?'now':''}"></span>`).join('')}</div>
    <button class="btn ghost" id="x7ExQuit">${EX.done?'Закрыть зачёт':'Прервать зачёт'}</button>`;
}
function examNext(){
  EX.res.push(EX.cur.ok===true);
  if(EX.i<EX.tasks.length-1){EX.i++;showTask();return}
  EX.done=true;const k=EX.res.filter(Boolean).length,n=EX.tasks.length;renderExamBar();
  const sel=mode==='qu'?'#x7QMsg':'#x7Msg';
  if(k===n){AL.report('n7',{mastered:true,via:'exam'});addLog('Верно','зачёт',`Зачёт сдан: ${k} из ${n}`);
    showMsg(sel,'ok',`<b>Зачёт сдан: ${k} из ${n}.</b> Тема 7 засчитана.<div class="actions"><a class="btn primary" href="#map">На карту навыков</a><button class="btn" id="x7ExStay">Остаться в тренажёре</button></div>`)}
  else{addLog('Зачёт','—',`Не сдан: ${k} из ${n}`);
    showMsg(sel,'bad',`<b>Зачёт не сдан: верно ${k} из ${n}.</b> Потренируйся и попробуй снова.<div class="actions"><button class="btn primary" id="x7ExRetry">Сдать ещё раз</button><button class="btn" id="x7ExStay">Тренироваться</button></div>`)}
}
function stopExam(){if(EX&&!EX.done)addLog('Зачёт','—',`Прерван на задании ${EX.i+1}`);EX=null;renderExamBar();T=null;Q=null;setMode(store.get('mode','sh'))}

/* ---------- события ---------- */
['Sh','Wr','Qu'].forEach(x=>$('#x7Tab'+x).onclick=()=>{if(EX)return toast('Сначала закончи или прерви зачёт');setMode(x.toLowerCase())});
const svgPoint=(svg,e)=>{const r=svg.getBoundingClientRect(),vb=svg.viewBox.baseVal;return [(e.clientX-r.left)/r.width*vb.width,(e.clientY-r.top)/r.height*vb.height]};
$('#x7Venn').addEventListener('click',e=>{const svg=e.target.closest('svg.venn');if(!svg||!svg.classList.contains('click'))return;
  const [x,y]=svgPoint(svg,e);const g=GEO[T.n];if(x<12||y<12||x>g.w-12||y>g.h-12)return;toggleRegion(regionAt(T.n,x,y))});
$('#x7Venn').addEventListener('pointermove',e=>{const svg=e.target.closest('svg.venn');if(!svg)return;const [x,y]=svgPoint(svg,e);const g=GEO[T.n];
  const m=x<12||y<12||x>g.w-12||y>g.h-12?null:regionAt(T.n,x,y);if(m===hover)return;hover=m;
  $('#x7Hover').textContent=m==null?' ':`Под курсором: ${regionName(T.n,m)} — строка ${m+1} таблицы`;renderSet()});
$('#x7Venn').addEventListener('pointerleave',()=>{if(hover==null)return;hover=null;$('#x7Hover').innerHTML='&nbsp;';renderSet()});
$('#x7Map').addEventListener('click',e=>{const b=e.target.closest('.fbtn');if(b&&!b.disabled)toggleRegion(+b.dataset.m)});
$('#x7Map').addEventListener('pointerover',e=>{const tr=e.target.closest('tr[data-m]');const m=tr?+tr.dataset.m:null;if(m===hover)return;hover=m;$('#x7Venn').innerHTML=vennSVG('x7v',T.n,T.shade,{click:T.mode==='sh'&&!T.done&&!T.answered,marks:T.marks,hl:hover});
  $('#x7Hover').textContent=m==null?' ':`Строка ${m+1}: область ${regionName(T.n,m)}`});
$('#x7Check').onclick=checkSet;
$('#x7Clear').onclick=()=>{if(T.done||T.answered)return;T.shade=Array(1<<T.n).fill(false);T.marks=null;hideMsg('#x7Msg');renderSet()};
$('#x7Expr').addEventListener('input',updPrev);$('#x7Expr').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();checkSet()}});
$('#x7Pad').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;const inp=$('#x7Expr'),ins=b.dataset.ins;
  let s=inp.selectionStart??inp.value.length,en=inp.selectionEnd??inp.value.length;
  if(ins==='CLR'){inp.value='';s=0}else if(ins==='BS'){if(s===en&&s>0){inp.value=inp.value.slice(0,s-1)+inp.value.slice(en);s--}else inp.value=inp.value.slice(0,s)+inp.value.slice(en)}
  else{inp.value=inp.value.slice(0,s)+ins+inp.value.slice(en);s+=ins.length}
  inp.focus();try{inp.setSelectionRange(s,s)}catch(err){}updPrev();
});
$('#x7QCheck').onclick=checkQuery;$('#x7QAns').addEventListener('keydown',e=>{if(e.key==='Enter')checkQuery()});
const onMsg=e=>{
  if(e.target.id==='x7NextSeed')loadSeed(randomSeed(level,mode));
  if(e.target.id==='x7ExNext')examNext();
  if(e.target.id==='x7ExRetry')startExam();
  if(e.target.id==='x7ExStay')stopExam();
};
$('#x7Msg').addEventListener('click',onMsg);$('#x7QMsg').addEventListener('click',onMsg);
$('#x7ExamBar').addEventListener('click',e=>{if(e.target.id==='x7ExQuit')stopExam()});
$('#x7New').onclick=()=>loadSeed(randomSeed(+$('#x7Level').value,mode));
$('#x7Level').onchange=()=>{level=+$('#x7Level').value;store.set('level',level)};
const openSeed=()=>{const s=normSeed($('#x7Seed').value,+$('#x7Level').value,mode);if(!s){toast('Введи номер задания');return}mode=seedMode(s);setMode(mode,false);loadSeed(s)};
$('#x7Open').onclick=openSeed;$('#x7Seed').addEventListener('keydown',e=>{if(e.key==='Enter')openSeed()});
$('#x7Student').value=AL.student.get();
$('#x7Student').addEventListener('input',()=>AL.student.set($('#x7Student').value));
AL.on('student',v=>{if(document.activeElement!==$('#x7Student'))$('#x7Student').value=v});
$('#x7Log').onclick=()=>AL.openLog&&AL.openLog();

function enter(arg){
  if(arg==='exam'){startExam();return}
  if(EX&&EX.done&&!arg){stopExam();return}
  if(EX)return;
  const s=arg?normSeed(arg,level,mode):null;
  if(s){mode=seedMode(s);store.set('mode',mode);store.set('last-'+mode,s);if(mode==='qu')Q=null;else T=null;setMode(mode,false);return}
  setMode(mode,true);
}
function refresh(){progress=store.get('progress',{});renderCounts()}
$('#x7Level').value=String(level);
return {enter,refresh};
}

AL.register('t7',{title:'Множества',logRows:()=>store.get('log',[]),exportData,importData,enter:arg=>mount().enter(arg)});
summarize();
})();
