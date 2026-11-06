/* Тренажёр 9 «СДНФ и СКНФ»: построение совершенных нормальных форм по таблице истинности и обратный перевод. */
(()=>{
const store=AL.store.scoped('t9');
const L=AL.logic;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function xmur3(str){let h=1779033703^str.length;for(let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353);h=h<<13|h>>>19}
  return()=>{h=Math.imul(h^(h>>>16),2246822507);h=Math.imul(h^(h>>>13),3266489909);return(h^=h>>>16)>>>0}}
function mulberry32(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
/* «D2-…» — СДНФ, «K2-…» — СКНФ, «R2-…» — по форме заполнить таблицу */
const MODES={D:'dnf',K:'cnf',R:'rev'},PFX={dnf:'D',cnf:'K',rev:'R'};
function normSeed(raw,lvl,mode){let s=String(raw||'').toUpperCase().replace(/[^A-Z0-9-]/g,'').replace(/^-+|-+$/g,'');if(!s)return null;
  if(/^[DKR][123]-./.test(s))return s.slice(0,24);return PFX[mode]+lvl+'-'+s.slice(0,20)}
function randomSeed(lvl,mode){const A='ABCDEFGHJKMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<5;i++)s+=A[Math.floor(Math.random()*A.length)];return PFX[mode]+lvl+'-'+s}
const seedMode=s=>MODES[s[0]]||'dnf';
const VARS='ABCD';
const pl=(n,a,b,c)=>{const x=n%10,y=n%100;return x===1&&y!==11?a:x>=2&&x<=4&&(y<12||y>14)?b:c};
const bitsOf=(n,m)=>[...Array(n).keys()].map(i=>(m>>(n-1-i))&1);

function generate(seed){
  const mode=seedMode(seed),lvl=+seed[1]||1,n=lvl+1,N=1<<n;
  const r=mulberry32(xmur3(seed)());
  // для СДНФ — мало единиц, для СКНФ — мало нулей; в обратном режиме — любая из форм
  const form=mode==='rev'?(r()<.5?'dnf':'cnf'):mode;
  const k=lvl===1?1+Math.floor(r()*2):lvl===2?2+Math.floor(r()*2):3+Math.floor(r()*2);
  const rows=AL.shuffle([...Array(N).keys()],r).slice(0,k).sort((a,b)=>a-b);
  const col=[...Array(N).keys()].map(m=>form==='dnf'?(rows.includes(m)?1:0):(rows.includes(m)?0:1));
  return {seed,mode,form,level:lvl,n,N,vars:VARS.slice(0,n).split(''),col,rows};
}
/* литерал строки: в СДНФ переменная = 1 → X, 0 → ¬X; в СКНФ наоборот */
const litNeg=(form,bit)=>form==='dnf'?bit===0:bit===1;
function termText(T,m,neg){const b=bitsOf(T.n,m);return '('+T.vars.map((v,i)=>((neg?neg[i]:litNeg(T.form,b[i]))?'¬':'')+v).join(T.form==='dnf'?' ∧ ':' ∨ ')+')'}
const formText=T=>T.rows.map(m=>termText(T,m)).join(T.form==='dnf'?' ∨ ':' ∧ ');

const MARKUP=`<div class="app t9">
  <header class="top">
    <div class="brand">
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><rect x="4" y="4" width="32" height="32" rx="3" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2.4"/><path d="M4 14h32M4 24h32" stroke="var(--ink)" stroke-width="1.6"/><rect x="6" y="15.5" width="28" height="7" fill="var(--glow)" stroke="var(--live)" stroke-width="1.4"/><text x="20" y="21.5" text-anchor="middle" font-family="JetBrains Mono,monospace" font-weight="700" font-size="7" fill="#3a2a00">A∧¬B</text></svg>
      <div><a class="back" href="#map">← Карта навыков</a><h1>СДНФ и СКНФ</h1><p>Формула по таблице истинности и таблица по формуле</p></div>
    </div>
    <div class="controls">
      <div class="field"><label for="x9Student">Ученик</label><input type="text" id="x9Student" placeholder="Фамилия Имя" autocomplete="off"></div>
      <div class="field x9-pr"><label for="x9Seed">Задание №</label><div class="row"><input type="text" id="x9Seed" class="seedin" spellcheck="false" autocomplete="off"><button class="btn" id="x9Open">Открыть</button></div></div>
      <div class="field x9-pr"><label for="x9Level">Уровень</label><div class="row"><select id="x9Level"><option value="1">1 · A, B</option><option value="2">2 · A, B, C</option><option value="3">3 · A, B, C, D</option></select><button class="btn primary" id="x9New">Новое задание</button></div></div>
      <button class="btn" id="x9Log">Журнал</button>
    </div>
  </header>
  <div class="exam-bar" id="x9ExamBar" hidden></div>
  <div class="seg" role="tablist" aria-label="Режим">
    <button role="tab" id="x9TabDnf" aria-selected="true">СДНФ <span class="pill ok" id="x9DnfCnt">0/3</span></button>
    <button role="tab" id="x9TabCnf" aria-selected="false">СКНФ <span class="pill ok" id="x9CnfCnt">0/3</span></button>
    <button role="tab" id="x9TabRev" aria-selected="false">Форма → таблица <span class="pill ok" id="x9RevCnt">0/2</span></button>
  </div>
  <div class="status" id="x9Status"></div>
  <div class="t9-grid">
    <div class="card">
      <div class="card-h"><span class="step">1</span><h2 id="x9T1">Выбери строки</h2><p id="x9S1"></p></div>
      <div class="body">
        <div class="revf" id="x9RevF" hidden></div>
        <div class="tt-wrap"><table class="tt t9tt" id="x9Table"></table></div>
        <div class="actions"><button class="btn primary" id="x9Check1">Проверить</button><span class="tries" id="x9Tries1"></span></div>
        <div class="msg" id="x9Msg1"></div>
      </div>
    </div>
    <aside class="card rule">
      <div class="card-h"><span class="step">§</span><h2 id="x9RuleT">Правило</h2></div>
      <div class="body" id="x9Rule"></div>
    </aside>
  </div>
  <div class="card" id="x9Card2">
    <div class="card-h"><span class="step">2</span><h2 id="x9T2">Собери слагаемые</h2><p id="x9S2"></p></div>
    <div class="body">
      <div class="terms" id="x9Terms"></div>
      <div class="actions"><button class="btn primary" id="x9Check2">Проверить</button><span class="tries" id="x9Tries2"></span></div>
      <div class="msg" id="x9Msg2"></div>
    </div>
  </div>
</div>
<div class="toast" id="x9Toast"></div>`;

const RULES={
  dnf:`<p><b>СДНФ</b> — совершенная дизъюнктивная нормальная форма: дизъюнкция (∨) конъюнкций, по одной на каждую строку, где <b>F = 1</b>.</p>
    <p>В конъюнкцию входят все переменные: равная 1 — как есть, равная 0 — с отрицанием. Так конъюнкция истинна ровно на своей строке.</p>
    <p class="ex">Строка A = 1, B = 0, C = 1 → <b>A ∧ ¬B ∧ C</b></p>`,
  cnf:`<p><b>СКНФ</b> — совершенная конъюнктивная нормальная форма: конъюнкция (∧) дизъюнкций, по одной на каждую строку, где <b>F = 0</b>.</p>
    <p>В дизъюнкцию входят все переменные: равная 0 — как есть, равная 1 — с отрицанием. Так дизъюнкция ложна ровно на своей строке.</p>
    <p class="ex">Строка A = 1, B = 0, C = 1 → <b>¬A ∨ B ∨ ¬C</b></p>`,
  rev:`<p>Каждое слагаемое СДНФ даёт 1 ровно в одной строке: там, где переменные без отрицания равны 1, а с отрицанием — 0. В остальных строках F = 0.</p>
    <p>В СКНФ наоборот: каждый множитель даёт 0 ровно в одной строке — где переменные без отрицания равны 0, а с отрицанием — 1. В остальных строках F = 1.</p>`
};

/* ---------- прогресс ---------- */
function summarize(){
  const prog=store.get('progress',{});
  if(!Object.keys(prog).length&&!AL.node('n9').touched)return;
  const sol=Object.entries(prog).filter(([k,p])=>p.ok);
  const by=m=>sol.filter(([k])=>seedMode(k)===m),hi=m=>by(m).filter(([k])=>+k[1]>=2).length;
  const d=Math.min(by('dnf').length,3),c=Math.min(by('cnf').length,3),r=Math.min(by('rev').length,2);
  const mastered=by('dnf').length>=3&&hi('dnf')>=1&&by('cnf').length>=3&&hi('cnf')>=1&&by('rev').length>=2;
  AL.report('n9',{done:d+c+r,total:8,note:`СДНФ ${d} из 3 · СКНФ ${c} из 3 · обратно ${r} из 2`,mastered,via:mastered?'practice':undefined});
}
function exportData(){const prog=store.get('progress',{}),o={};Object.entries(prog).slice(-300).forEach(([k,p])=>o[k]=[p.ok?1:0,p.errors||0,p.first||'']);return {p:o}}
function importData(d){if(!d)return;const prog=store.get('progress',{});
  for(const [k,a] of Object.entries(d.p||{})){const c=prog[k]||(prog[k]={ok:false,errors:0,first:a[2]||new Date().toISOString()});c.ok=c.ok||!!a[0];c.errors=Math.max(c.errors,a[1]||0)}
  store.set('progress',prog);summarize();if(api)api.refresh()}

let api=null;
function mount(){if(api)return api;document.getElementById('view-t9').innerHTML=MARKUP;api=init();return api}

function init(){
const $=s=>document.querySelector(s);
let progress=store.get('progress',{}),log=store.get('log',[]),level=store.get('level',2),mode=store.get('mode','dnf');
let T=null,EX=null;
const saveP=()=>store.set('progress',progress);
const P=seed=>progress[seed]||(progress[seed]={ok:false,errors:0,first:new Date().toISOString()});
function addLog(stage,input,note){log.push({t:new Date().toISOString(),seed:T?T.seed:'—',student:AL.student.get(),stage,input,note});if(log.length>3000)log=log.slice(-3000);store.set('log',log)}
function toast(t){const el=$('#x9Toast');el.textContent=t;el.classList.add('show');clearTimeout(toast.h);toast.h=setTimeout(()=>el.classList.remove('show'),1800)}
function showMsg(sel,cls,html){const el=$(sel);el.className='msg show '+cls;el.innerHTML=html}
function hideMsg(sel){$(sel).className='msg'}
function setHash(h){if(location.hash.slice(1)!==h){try{history.replaceState(null,'','#'+h)}catch(e){location.hash=h}}}
const app=()=>document.querySelector('.app.t9');
const nextBtn=()=>EX?`<button class="btn primary" id="x9ExNext">${EX.i<EX.tasks.length-1?'Дальше →':'Итог зачёта'}</button>`:'<button class="btn primary" id="x9NextSeed">Новое задание →</button>';

function setMode(m,push=true){
  mode=m;if(!EX)store.set('mode',m);
  ['Dnf','Cnf','Rev'].forEach(x=>$('#x9Tab'+x).setAttribute('aria-selected',m===x.toLowerCase()));
  if(!T||T.mode!==m)loadSeed(store.get('last-'+m,null)||randomSeed(level,m),push);else if(push&&!EX)setHash('t9-'+T.seed);
  renderCounts();
}
function renderCounts(){const sol=Object.entries(progress).filter(([k,p])=>p.ok);
  $('#x9DnfCnt').textContent=Math.min(sol.filter(([k])=>k[0]==='D').length,3)+'/3';$('#x9CnfCnt').textContent=Math.min(sol.filter(([k])=>k[0]==='K').length,3)+'/3';$('#x9RevCnt').textContent=Math.min(sol.filter(([k])=>k[0]==='R').length,2)+'/2'}
function loadSeed(seed,push=true){
  T=Object.assign(generate(seed),{sel:new Set(),marks:null,step:1,lits:{},litMarks:null,cells:null,errors:0,done:false,answered1:false,answered2:false});
  if(T.mode==='rev')T.cells=Array(T.N).fill('');
  level=T.level;$('#x9Level').value=String(level);$('#x9Seed').value=seed;
  if(!EX)store.set('last-'+T.mode,seed);if(push&&!EX)setHash('t9-'+seed);
  hideMsg('#x9Msg1');hideMsg('#x9Msg2');
  const p=P(T.seed);if(p.ok&&!EX){T.done=true;T.step=3;T.sel=new Set(T.rows);if(T.mode==='rev')T.cells=T.col.map(String);
    showMsg(T.mode==='rev'?'#x9Msg1':'#x9Msg2','ok',`<b>Решено.</b> ${T.mode==='rev'?'Таблица заполнена.':'F = '+esc(formText(T))}<div class="actions"><button class="btn primary" id="x9NextSeed">Новое задание →</button></div>`)}
  render();
}
function render(){
  const f=T.form,rev=T.mode==='rev';
  $('#x9RuleT').textContent=rev?'Как читать форму':f==='dnf'?'Как строится СДНФ':'Как строится СКНФ';
  $('#x9Rule').innerHTML=RULES[rev?'rev':f];
  $('#x9T1').textContent=rev?'Заполни таблицу':'Выбери строки';
  $('#x9S1').textContent=rev?`Дана ${f==='dnf'?'СДНФ':'СКНФ'} функции. Заполни столбец F.`:f==='dnf'?'Отметь строки, где F = 1: каждая даст одну конъюнкцию.':'Отметь строки, где F = 0: каждая даст одну дизъюнкцию.';
  $('#x9RevF').hidden=!rev;if(rev)$('#x9RevF').innerHTML=`<span class="en">F</span> = ${esc(formText(T))}`;
  const lock1=T.step>1||T.done||T.answered1;
  let h=`<thead><tr><th>№</th>${T.vars.map(v=>`<th>${v}</th>`).join('')}<th class="f">F</th>${rev?'':'<th class="pk">строка в форму</th>'}</tr></thead><tbody>`;
  for(let m=0;m<T.N;m++){const b=bitsOf(T.n,m),sel=T.sel.has(m),mk=T.marks?T.marks[m]:'';
    const fcell=rev?`<td class="fc"><button class="fbtn${T.cells[m]!==''?' filled':''}${mk?' '+mk:''}" data-m="${m}" ${lock1?'disabled':''} aria-label="F в строке ${m+1}">${T.cells[m]}</button></td>`:`<td class="fv">${T.col[m]}</td>`;
    h+=`<tr class="${sel&&!rev?'sel':''}${mk&&!rev?' '+mk:''}" data-m="${m}"><td class="n">${m+1}</td>${b.map(x=>`<td>${x}</td>`).join('')}${fcell}${rev?'':`<td class="pk"><button class="pkb${sel?' on':''}" data-m="${m}" ${lock1?'disabled':''} aria-pressed="${sel}" aria-label="Взять строку ${m+1}">${sel?'✓':''}</button></td>`}</tr>`}
  $('#x9Table').innerHTML=h+'</tbody>';
  $('#x9Check1').disabled=lock1;
  $('#x9Tries1').textContent=EX?'Зачёт: одна попытка':`Ошибок: ${T.errors}`;
  $('#x9Card2').hidden=rev;
  if(!rev)renderTerms();
  const chip=(c,t)=>`<span class="chip ${c}"><span class="dot"></span>${t}</span>`,p=P(T.seed);
  $('#x9Status').innerHTML=chip(p.ok?'ok':'',rev?`Форма → таблица`:`Шаг <b>${Math.min(T.step,2)} из 2</b>`)+'<span class="spacer"></span>'+chip('',`${rev?(f==='dnf'?'СДНФ':'СКНФ'):(f==='dnf'?'СДНФ':'СКНФ')} · уровень <b>${T.level}</b> · переменных <b>${T.n}</b>`);
}
function renderTerms(){
  const f=T.form,ready=T.step>=2;
  $('#x9T2').textContent=f==='dnf'?'Собери конъюнкции':'Собери дизъюнкции';
  $('#x9S2').textContent=ready?`Для каждой выбранной строки нажимай на переменные, чтобы поставить или убрать отрицание. Знак внутри — ${f==='dnf'?'∧':'∨'}, между скобками — ${f==='dnf'?'∨':'∧'}.`:'';
  $('#x9Card2').classList.toggle('locked',!ready);
  if(!ready){$('#x9Terms').innerHTML='<p class="wait">Сначала выбери строки.</p>';$('#x9Check2').disabled=true;$('#x9Tries2').textContent='';return}
  const lock=T.done||T.answered2;
  $('#x9Terms').innerHTML=T.rows.map((m,ti)=>{const b=bitsOf(T.n,m);const L0=T.lits[m]||(T.lits[m]=T.vars.map(()=>null));
    return `${ti?`<span class="join">${f==='dnf'?'∨':'∧'}</span>`:''}<div class="term" data-m="${m}"><span class="trow">строка ${m+1}: ${T.vars.map((v,i)=>`${v}=${b[i]}`).join(' ')}</span><span class="tbody">(${T.vars.map((v,i)=>{const s=L0[i],mk=T.litMarks&&T.litMarks[m]?T.litMarks[m][i]:'';
      return `${i?`<span class="op">${f==='dnf'?'∧':'∨'}</span>`:''}<button class="lit${s===null?' unset':''}${mk?' '+mk:''}" data-m="${m}" data-i="${i}" ${lock?'disabled':''} aria-label="Литерал ${v}">${s===null?'?'+v:(s?'¬':'')+v}</button>`}).join('')})</span></div>`}).join('');
  $('#x9Check2').disabled=lock;$('#x9Tries2').textContent=EX?'Зачёт: одна попытка':'';
}
function check1(){
  if(T.step>1||T.done||T.answered1)return;
  if(T.mode==='rev'){
    const empty=T.cells.map((v,i)=>v===''?i+1:0).filter(Boolean);if(empty.length){showMsg('#x9Msg1','info','Заполни все строки. Пустые: '+empty.join(', ')+'.');return}
    T.marks=T.cells.map((v,m)=>+v===T.col[m]?'ok':'bad');const bad=T.marks.map((x,m)=>x==='bad'?m:-1).filter(m=>m>=0);
    addLog(EX?'Зачёт':bad.length?'Форма → таблица':'Верно','F = '+T.cells.join(''),bad.length?`ошибок ${bad.length}`:'таблица верно');
    if(EX){T.answered1=true;EX.cur.ok=!bad.length;showMsg('#x9Msg1',bad.length?'bad':'ok',`<b>${bad.length?'Есть ошибки.':'Верно.'}</b> Правильный столбец: ${T.col.join('')}.<div class="actions">${nextBtn()}</div>`);renderExamBar()}
    else if(!bad.length){T.done=true;P(T.seed).ok=true;saveP();showMsg('#x9Msg1','ok',`<b>Верно!</b> ${T.form==='dnf'?`${T.rows.length} ${pl(T.rows.length,'слагаемое','слагаемых','слагаемых')} — ${T.rows.length} ${pl(T.rows.length,'единица','единицы','единиц')} в столбце.`:`${T.rows.length} ${pl(T.rows.length,'множитель','множителя','множителей')} — ${T.rows.length} ${pl(T.rows.length,'ноль','нуля','нулей')} в столбце.`}<div class="actions">${nextBtn()}</div>`)}
    else{T.errors++;const m=bad[0],b=bitsOf(T.n,m);
      const term=T.rows.includes(m)?termText(T,m):null;
      showMsg('#x9Msg1','bad',`<b>Ошибка.</b> Неверных строк: ${bad.length}. Строка ${m+1} (${T.vars.map((v,i)=>v+' = '+b[i]).join(', ')}): ${term?`её даёт ${T.form==='dnf'?'слагаемое':'множитель'} ${esc(term)}, поэтому F = ${T.col[m]}`:`ни ${T.form==='dnf'?'одно слагаемое не равно здесь 1, поэтому F = 0':'один множитель не равен здесь 0, поэтому F = 1'}`}.`)}
    saveP();render();summarize();renderCounts();return;
  }
  const want=T.form==='dnf'?1:0,right=new Set(T.rows);
  const extra=[...T.sel].filter(m=>!right.has(m)),miss=[...right].filter(m=>!T.sel.has(m));
  if(!extra.length&&!miss.length){T.step=2;T.marks=null;addLog(EX?'Зачёт':'Верно','строки '+[...T.sel].map(m=>m+1).join(','),'строки верно');
    showMsg('#x9Msg1','ok',`<b>Верно.</b> ${T.rows.length} ${T.rows.length===1?'строка':T.rows.length<5?'строки':'строк'} с F = ${want}. Теперь собери ${T.form==='dnf'?'конъюнкции':'дизъюнкции'}.`);if(EX)EX.cur.s1=true}
  else{T.errors++;T.marks={};extra.forEach(m=>T.marks[m]='bad');miss.forEach(m=>T.marks[m]='miss');
    addLog(EX?'Зачёт':'Строки','выбрано '+[...T.sel].map(m=>m+1).join(','),`лишних ${extra.length}, пропущено ${miss.length}`);
    const why=`Для ${T.form==='dnf'?'СДНФ':'СКНФ'} берутся строки, где F = ${want}.`;
    if(EX){EX.cur.s1=false;T.sel=new Set(T.rows);T.step=2;T.marks=null;showMsg('#x9Msg1','bad',`<b>Ошибка.</b> ${why} Правильные строки отмечены, собери ${T.form==='dnf'?'конъюнкции':'дизъюнкции'}.`)}
    else showMsg('#x9Msg1','bad',`<b>Ошибка.</b> ${why}${extra.length?` Лишние: ${extra.map(m=>m+1).join(', ')}.`:''}${miss.length?` Пропущены: ${miss.map(m=>m+1).join(', ')}.`:''}`)}
  render();
}
function check2(){
  if(T.done||T.answered2||T.step<2)return;
  if(T.rows.some(m=>T.lits[m].some(x=>x===null))){showMsg('#x9Msg2','info','Расставь все литералы: в каждой скобке должны быть все переменные.');return}
  T.litMarks={};let first=null,cnt=0;
  T.rows.forEach(m=>{const b=bitsOf(T.n,m);T.litMarks[m]=T.vars.map((v,i)=>{const ok=T.lits[m][i]===litNeg(T.form,b[i]);if(!ok){cnt++;if(!first)first={m,i,b:b[i]}}return ok?'ok':'bad'})});
  const built=T.rows.map(m=>termText(T,m,T.lits[m])).join(T.form==='dnf'?' ∨ ':' ∧ ');
  // проверка собранной формулы по таблице
  const ast=L.parse(built.replace(/[()]/g,s=>s));const same=[...Array(T.N).keys()].every(m=>{const b=bitsOf(T.n,m),e={};T.vars.forEach((v,i)=>e[v]=b[i]);return L.evaluate(ast,e)===T.col[m]});
  addLog(EX?'Зачёт':cnt?'Слагаемые':'Верно',built,cnt?`неверных литералов ${cnt}`:'форма собрана');
  if(EX){T.answered2=true;EX.cur.ok=EX.cur.s1!==false&&!cnt;
    showMsg('#x9Msg2',cnt?'bad':'ok',`<b>${cnt?'Есть ошибки.':'Верно.'}</b> F = ${esc(formText(T))}<div class="actions">${nextBtn()}</div>`);renderExamBar();renderTerms();return}
  if(!cnt){T.done=true;P(T.seed).ok=true;saveP();
    showMsg('#x9Msg2','ok',`<b>Готово!</b> F = ${esc(built)}<br>Проверка: ${same?'формула даёт тот же столбец, что и в таблице':'—'}. ${(()=>{const k=T.rows.length,o=T.N-k;if(k===o)return `Единиц и нулей поровну, по ${k}: СДНФ и СКНФ одинаковой длины.`;return T.form==='dnf'?`Единиц здесь ${k}, нулей ${o}: СДНФ из ${k} ${pl(k,'скобки','скобок','скобок')} короче, чем СКНФ из ${o}.`:`Нулей здесь ${k}, единиц ${o}: СКНФ из ${k} ${pl(k,'скобки','скобок','скобок')} короче, чем СДНФ из ${o}.`})()}<div class="actions">${nextBtn()}</div>`);summarize();renderCounts()}
  else{T.errors++;const v=T.vars[first.i];
    showMsg('#x9Msg2','bad',`<b>Ошибка.</b> Неверных литералов: ${cnt}. Например, строка ${first.m+1}: ${v} = ${first.b}. В ${T.form==='dnf'?'конъюнкции СДНФ переменная, равная '+first.b+', входит '+(first.b?'без отрицания':'с отрицанием'):'дизъюнкции СКНФ переменная, равная '+first.b+', входит '+(first.b?'с отрицанием':'без отрицания')}, чтобы скобка ${T.form==='dnf'?'была равна 1':'была равна 0'} именно на этой строке.`)}
  saveP();renderTerms();
}

/* ---------- зачёт ---------- */
function startExam(){EX={tasks:[randomSeed(2,'dnf'),randomSeed(2,'cnf'),randomSeed(2,'rev')],i:0,res:[],cur:{},done:false};addLog('Зачёт','—','Начат зачёт: '+EX.tasks.join(', '));app().classList.add('exam');showTask()}
function showTask(){const s=EX.tasks[EX.i];EX.cur={};mode=seedMode(s);['Dnf','Cnf','Rev'].forEach(x=>$('#x9Tab'+x).setAttribute('aria-selected',mode===x.toLowerCase()));loadSeed(s,false);renderExamBar();window.scrollTo(0,0)}
function renderExamBar(){
  const bar=$('#x9ExamBar');if(!EX){bar.hidden=true;app().classList.remove('exam');return}
  bar.hidden=false;
  bar.innerHTML=`<div class="ex-t"><b>Зачёт по теме 9</b><span>${EX.done?'Зачёт завершён':`Задание ${EX.i+1} из ${EX.tasks.length}`} · одна попытка на каждый шаг</span></div>
    <div class="ex-dots">${EX.tasks.map((t,i)=>`<span class="ex-dot ${i<EX.res.length?(EX.res[i]?'ok':'bad'):i===EX.i?'now':''}"></span>`).join('')}</div>
    <button class="btn ghost" id="x9ExQuit">${EX.done?'Закрыть зачёт':'Прервать зачёт'}</button>`;
}
function examNext(){
  EX.res.push(EX.cur.ok===true);
  if(EX.i<EX.tasks.length-1){EX.i++;showTask();return}
  EX.done=true;const k=EX.res.filter(Boolean).length,n=EX.tasks.length;renderExamBar();
  const sel=T.mode==='rev'?'#x9Msg1':'#x9Msg2';
  if(k===n){AL.report('n9',{mastered:true,via:'exam'});addLog('Верно','зачёт',`Зачёт сдан: ${k} из ${n}`);
    showMsg(sel,'ok',`<b>Зачёт сдан: ${k} из ${n}.</b> Тема 9 засчитана, открылась тема 10 «Полные системы».<div class="actions"><a class="btn primary" href="#map">На карту навыков</a><button class="btn" id="x9ExStay">Остаться в тренажёре</button></div>`)}
  else{addLog('Зачёт','—',`Не сдан: ${k} из ${n}`);
    showMsg(sel,'bad',`<b>Зачёт не сдан: верно ${k} из ${n}.</b> Потренируйся и попробуй снова.<div class="actions"><button class="btn primary" id="x9ExRetry">Сдать ещё раз</button><button class="btn" id="x9ExStay">Тренироваться</button></div>`)}
}
function stopExam(){if(EX&&!EX.done)addLog('Зачёт','—',`Прерван на задании ${EX.i+1}`);EX=null;renderExamBar();T=null;setMode(store.get('mode','dnf'))}

/* ---------- события ---------- */
['Dnf','Cnf','Rev'].forEach(x=>$('#x9Tab'+x).onclick=()=>{if(EX)return toast('Сначала закончи или прерви зачёт');setMode(x.toLowerCase())});
$('#x9Table').addEventListener('click',e=>{
  const pk=e.target.closest('.pkb');if(pk&&!pk.disabled){const m=+pk.dataset.m;if(T.sel.has(m))T.sel.delete(m);else T.sel.add(m);T.marks=null;hideMsg('#x9Msg1');render();return}
  const f=e.target.closest('.fbtn');if(f&&!f.disabled){const m=+f.dataset.m,v=T.cells[m];T.cells[m]=v===''?'1':v==='1'?'0':'1';T.marks=null;render();const b=$(`#x9Table .fbtn[data-m="${m}"]`);b&&b.focus()}
});
$('#x9Table').addEventListener('keydown',e=>{const f=e.target.closest('.fbtn');if(!f||f.disabled)return;const m=+f.dataset.m;
  if(e.key==='0'||e.key==='1'){e.preventDefault();T.cells[m]=e.key;T.marks=null;render();const b=$(`#x9Table .fbtn[data-m="${Math.min(T.N-1,m+1)}"]`);b&&b.focus()}
  else if(e.key==='Enter'){e.preventDefault();check1()}});
$('#x9Terms').addEventListener('click',e=>{const b=e.target.closest('.lit');if(!b||b.disabled)return;const m=+b.dataset.m,i=+b.dataset.i;const v=T.lits[m][i];T.lits[m][i]=v===null?false:!v;T.litMarks=null;hideMsg('#x9Msg2');renderTerms();
  const nb=$(`#x9Terms .lit[data-m="${m}"][data-i="${i}"]`);nb&&nb.focus()});
$('#x9Check1').onclick=check1;$('#x9Check2').onclick=check2;
const onMsg=e=>{if(e.target.id==='x9NextSeed')loadSeed(randomSeed(level,mode));if(e.target.id==='x9ExNext')examNext();if(e.target.id==='x9ExRetry')startExam();if(e.target.id==='x9ExStay')stopExam()};
$('#x9Msg1').addEventListener('click',onMsg);$('#x9Msg2').addEventListener('click',onMsg);
$('#x9ExamBar').addEventListener('click',e=>{if(e.target.id==='x9ExQuit')stopExam()});
$('#x9New').onclick=()=>loadSeed(randomSeed(+$('#x9Level').value,mode));
$('#x9Level').onchange=()=>{level=+$('#x9Level').value;store.set('level',level)};
const openSeed=()=>{const s=normSeed($('#x9Seed').value,+$('#x9Level').value,mode);if(!s){toast('Введи номер задания');return}mode=seedMode(s);setMode(mode,false);loadSeed(s)};
$('#x9Open').onclick=openSeed;$('#x9Seed').addEventListener('keydown',e=>{if(e.key==='Enter')openSeed()});
$('#x9Student').value=AL.student.get();
$('#x9Student').addEventListener('input',()=>AL.student.set($('#x9Student').value));
AL.on('student',v=>{if(document.activeElement!==$('#x9Student'))$('#x9Student').value=v});
$('#x9Log').onclick=()=>AL.openLog&&AL.openLog();

function enter(arg){
  if(arg==='exam'){startExam();return}
  if(EX&&EX.done&&!arg){stopExam();return}
  if(EX)return;
  const s=arg?normSeed(arg,level,mode):null;
  if(s){mode=seedMode(s);store.set('mode',mode);store.set('last-'+mode,s);T=null;setMode(mode,false);return}
  setMode(mode,true);
}
function refresh(){progress=store.get('progress',{});renderCounts()}
$('#x9Level').value=String(level);
return {enter,refresh};
}

AL.register('t9',{title:'СДНФ',logRows:()=>store.get('log',[]),exportData,importData,enter:arg=>mount().enter(arg)});
summarize();
})();
