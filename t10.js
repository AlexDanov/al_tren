/* Тренажёр 10 «Полные системы»: выразить функции через базис (↑, ↓, {¬, ∧}, …) и решить, полна ли система (классы Поста). */
(()=>{
const store=AL.store.scoped('t10');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- свой разбор: ¬, ∧, ∨, →, ≡, ⊕, ↑ (Шеффер), ↓ (Пирс), 0, 1, A, B ---------- */
function Err(msg,pos){this.msg=msg;this.pos=pos}
const OPS={not:'¬',and:'∧',or:'∨',imp:'→',eq:'≡',xor:'⊕',nand:'↑',nor:'↓'};
const FN={and:(a,b)=>a&b,or:(a,b)=>a|b,imp:(a,b)=>(1-a)|b,eq:(a,b)=>+(a===b),xor:(a,b)=>a^b,nand:(a,b)=>1-(a&b),nor:(a,b)=>1-(a|b)};
const PREC={eq:1,imp:2,or:3,xor:3,nor:3,and:4,nand:4};
function tokenize(s){
  const sym=[['->','imp'],['<->','eq'],['¬','not'],['!','not'],['~','not'],['∧','and'],['&','and'],['*','and'],['∨','or'],['+','or'],['→','imp'],['≡','eq'],['=','eq'],['⊕','xor'],['^','xor'],['↑','nand'],['|','nand'],['↓','nor'],['(','('],[')',')']];
  const t=[];let i=0;
  while(i<s.length){const c=s[i];if(/\s/.test(c)){i++;continue}
    const m=sym.find(([k])=>s.startsWith(k,i));if(m){t.push({k:m[1],pos:i});i+=m[0].length;continue}
    const u=c.toUpperCase(),v={'А':'A','В':'B'}[u]||u;
    if(v==='A'||v==='B'){t.push({k:'var',v,pos:i});i++;continue}
    if(c==='0'||c==='1'){t.push({k:'const',v:+c,pos:i});i++;continue}
    throw new Err(`Непонятный символ «${c}»`,i)}
  return t;
}
function parse(src){
  const t=tokenize(src);let i=0;if(!t.length)throw new Err('Пустое выражение',0);
  const prim=()=>{const x=t[i];if(!x)throw new Err('Выражение оборвалось',src.length);
    if(x.k==='not'){i++;return {op:'not',a:prim()}}
    if(x.k==='var'){i++;return {op:'var',v:x.v}}if(x.k==='const'){i++;return {op:'const',v:x.v}}
    if(x.k==='('){i++;const e=bin(0);if(!t[i]||t[i].k!==')')throw new Err('Не закрыта скобка',x.pos);i++;return e}
    throw new Err(x.k===')'?'Лишняя закрывающая скобка':'Операция без левого операнда',x.pos)};
  const bin=minP=>{let a=prim();while(t[i]&&PREC[t[i].k]!=null&&PREC[t[i].k]>=minP){const op=t[i].k;i++;const b=bin(PREC[op]+1);a={op,a,b}}return a};
  const e=bin(0);if(i<t.length)throw new Err(t[i].k===')'?'Лишняя закрывающая скобка':'Не хватает операции между частями',t[i].pos);return e;
}
const ev=(n,A,B)=>n.op==='var'?(n.v==='A'?A:B):n.op==='const'?n.v:n.op==='not'?1-ev(n.a,A,B):FN[n.op](ev(n.a,A,B),ev(n.b,A,B));
const vec=n=>[0,1,2,3].map(m=>ev(n,(m>>1)&1,m&1)).join('');
function used(n,s=new Set()){if(n.op==='const')s.add('c'+n.v);else if(n.op!=='var')s.add(n.op);if(n.a)used(n.a,s);if(n.b)used(n.b,s);return s}
function pretty(n,pp=0){if(n.op==='var')return n.v;if(n.op==='const')return String(n.v);if(n.op==='not')return '¬'+pretty(n.a,9);
  const p=PREC[n.op],s=pretty(n.a,p)+' '+OPS[n.op]+' '+pretty(n.b,p+1);return p<pp||(['nand','nor','xor','imp','eq'].includes(n.op)&&pp>0)?'('+s+')':s}
const size=n=>n.op==='var'||n.op==='const'?0:1+size(n.a)+(n.b?size(n.b):0);

/* ---------- банк «базис → цель» ---------- */
const BASES={
  nand:{name:'штрих Шеффера',ops:['nand'],desc:'A ↑ B = ¬(A ∧ B), «И-НЕ»'},
  nor:{name:'стрелка Пирса',ops:['nor'],desc:'A ↓ B = ¬(A ∨ B), «ИЛИ-НЕ»'},
  notand:{name:'{¬, ∧}',ops:['not','and'],desc:'только отрицание и конъюнкция'},
  notor:{name:'{¬, ∨}',ops:['not','or'],desc:'только отрицание и дизъюнкция'},
  impnot:{name:'{→, ¬}',ops:['imp','not'],desc:'только импликация и отрицание'},
  imp0:{name:'{→, 0}',ops:['imp','c0'],desc:'импликация и константа 0'},
  zheg:{name:'{⊕, ∧, 1}',ops:['xor','and','c1'],desc:'базис Жегалкина'}
};
const TARGETS={not:{t:'¬A',v:'1100'},and:{t:'A ∧ B',v:'0001'},or:{t:'A ∨ B',v:'0111'},imp:{t:'A → B',v:'1101'},eq:{t:'A ≡ B',v:'1001'},xor:{t:'A ⊕ B',v:'0110'}};
const TASKS=[
  ['nand','not','A ↑ A'],['nand','and','(A ↑ B) ↑ (A ↑ B)'],['nand','or','(A ↑ A) ↑ (B ↑ B)'],['nand','imp','A ↑ (B ↑ B)'],
  ['nor','not','A ↓ A'],['nor','or','(A ↓ B) ↓ (A ↓ B)'],['nor','and','(A ↓ A) ↓ (B ↓ B)'],['nor','imp','((A ↓ A) ↓ B) ↓ ((A ↓ A) ↓ B)'],
  ['notand','or','¬(¬A ∧ ¬B)'],['notand','imp','¬(A ∧ ¬B)'],['notand','eq','¬(A ∧ ¬B) ∧ ¬(¬A ∧ B)'],
  ['notor','and','¬(¬A ∨ ¬B)'],['notor','imp','¬A ∨ B'],['notor','xor','¬(¬A ∨ B) ∨ ¬(A ∨ ¬B)'],
  ['impnot','or','¬A → B'],['impnot','and','¬(A → ¬B)'],
  ['imp0','not','A → 0'],['imp0','or','(A → 0) → B'],['imp0','and','(A → (B → 0)) → 0'],
  ['zheg','not','A ⊕ 1'],['zheg','or','A ⊕ B ⊕ A ∧ B'],['zheg','imp','1 ⊕ A ⊕ A ∧ B']
].map(([b,t,ref])=>({id:b+'-'+t,b,t,ref}));
const HINT={nand:'Сначала получи ¬A = A ↑ A. Дальше: A ∧ B = ¬(A ↑ B), A ∨ B = ¬A ↑ ¬B.',nor:'Сначала получи ¬A = A ↓ A. Дальше: A ∨ B = ¬(A ↓ B), A ∧ B = ¬A ↓ ¬B.',
  notand:'Помогут законы де Моргана и A → B = ¬A ∨ B.',notor:'Помогут законы де Моргана и A → B = ¬A ∨ B.',impnot:'A → B = ¬A ∨ B, значит ¬A → B = A ∨ B.',imp0:'A → 0 = ¬A: импликация ложна, только когда из 1 следует 0.',zheg:'¬A = A ⊕ 1; A ∨ B = A ⊕ B ⊕ AB (сумма по модулю 2).'};

/* ---------- полнота: классы Поста для функций двух переменных ---------- */
const F16=[['0000','0'],['0001','∧'],['0010','A ∧ ¬B'],['0011','A'],['0100','¬A ∧ B'],['0101','B'],['0110','⊕'],['0111','∨'],['1000','↓'],['1001','≡'],['1010','¬B'],['1011','B → A'],['1100','¬A'],['1101','→'],['1110','↑'],['1111','1']].map(([v,n])=>({v,n}));
const CLS={T0:{pl:'сохраняют 0',name:'сохраняет 0',desc:'f(0, 0) = 0',f:v=>v[0]==='0'},T1:{pl:'сохраняют 1',name:'сохраняет 1',desc:'f(1, 1) = 1',f:v=>v[3]==='1'},
  S:{pl:'самодвойственны',name:'самодвойственна',desc:'на противоположных наборах — противоположные значения',f:v=>v[0]!==v[3]&&v[1]!==v[2]},
  M:{pl:'монотонны',name:'монотонна',desc:'при замене 0 на 1 в наборе значение не уменьшается',f:v=>[[0,1],[0,2],[1,3],[2,3],[0,3]].every(([a,b])=>v[a]<=v[b])},
  L:{pl:'линейны',name:'линейна',desc:'записывается как a ⊕ bA ⊕ cB, без произведения AB',f:v=>((+v[0])^(+v[1])^(+v[2])^(+v[3]))===0}};
const CK=Object.keys(CLS);
function genSystem(){
  for(let g=0;g<100;g++){
    const k=1+Math.floor(Math.random()*3);const pool=F16.filter(f=>f.v!=='0011'&&f.v!=='0101');
    const sys=[];while(sys.length<k){const f=pool[Math.floor(Math.random()*pool.length)];if(!sys.includes(f))sys.push(f)}
    if(sys.length===1&&(sys[0].v==='0000'||sys[0].v==='1111'))continue;
    const keep=CK.filter(c=>sys.every(f=>CLS[c].f(f.v)));
    const complete=!keep.length;
    if(complete&&Math.random()<.4)continue;   // полных систем случайно получается много — уравниваем
    return {sys,keep,complete};
  }
  return {sys:[F16[14]],keep:[],complete:true};
}

const MARKUP=`<div class="app t10">
  <header class="top">
    <div class="brand">
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><path d="M6 10h11a10 10 0 0 1 0 20H6z" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2.4"/><circle cx="31" cy="20" r="3.4" fill="var(--glow)" stroke="var(--live)" stroke-width="2"/><path d="M1 15h5M1 25h5M34.5 20H39" stroke="var(--ink)" stroke-width="2.2"/></svg>
      <div><a class="back" href="#map">← Карта навыков</a><h1>Полные системы</h1><p>Всё через штрих Шеффера, стрелку Пирса и другие базисы</p></div>
    </div>
    <div class="controls">
      <div class="field"><label for="x10Student">Ученик</label><input type="text" id="x10Student" placeholder="Фамилия Имя" autocomplete="off"></div>
      <button class="btn" id="x10Log">Журнал</button>
    </div>
  </header>
  <div class="exam-bar" id="x10ExamBar" hidden></div>
  <div class="seg" role="tablist" aria-label="Режим">
    <button role="tab" id="x10TabEx" aria-selected="true">Выразить <span class="pill ok" id="x10ExCnt">0/6</span></button>
    <button role="tab" id="x10TabCo" aria-selected="false">Полна ли система? <span class="pill ok" id="x10CoCnt">0/5</span></button>
  </div>

  <section id="x10Ex" class="t10-grid">
    <div class="card">
      <div class="card-h"><span class="step">↑</span><h2>Вырази через базис</h2><p id="x10ExSub"></p></div>
      <div class="body">
        <div class="basis" id="x10Basis"></div>
        <div class="goal" id="x10Goal"></div>
        <div class="exprline"><span class="pre">=</span><input type="text" id="x10Expr" placeholder="используй только разрешённые операции" spellcheck="false" autocomplete="off" aria-label="Выражение"></div>
        <div class="preview" id="x10Prev">&nbsp;</div>
        <div class="pad" id="x10Pad"></div>
        <div class="actions"><button class="btn primary" id="x10Check">Проверить</button><button class="btn ghost" id="x10Skip">Другое задание</button><span class="tries" id="x10Tries"></span></div>
        <div class="msg" id="x10Msg"></div>
        <p class="help">Шеффера можно набирать как <code>|</code> или <code>↑</code>, Пирса — <code>↓</code>. У ↑ старшинство как у ∧, у ↓ — как у ∨; надёжнее ставить скобки.</p>
      </div>
    </div>
    <aside class="card">
      <div class="card-h"><span class="step">i</span><h2>Что такое полная система</h2></div>
      <div class="body">
        <p>Система функций полна, если через неё можно выразить любую логическую функцию.</p>
        <p>{¬, ∧, ∨} полна: любую функцию можно записать в СДНФ. Значит, система полна, если через неё выражаются ¬ и ∧ (или ¬ и ∨).</p>
        <p>Одна функция ↑ или ↓ уже полна — поэтому компьютеры можно строить из одних элементов И-НЕ.</p>
      </div>
    </aside>
  </section>

  <section id="x10Co" class="t10-grid" hidden>
    <div class="card">
      <div class="card-h"><span class="step">?</span><h2>Полна ли система?</h2><p>Если система не полна, укажи свойство, которое есть у всех её функций: тогда через них не получить функцию без этого свойства.</p></div>
      <div class="body">
        <div class="sys" id="x10Sys"></div>
        <div class="verdict" id="x10Ver"></div>
        <div class="why" id="x10Why" hidden></div>
        <div class="actions"><button class="btn primary" id="x10CoCheck">Проверить</button></div>
        <div class="msg" id="x10CoMsg"></div>
        <div class="tt-wrap"><table class="post" id="x10Post"></table></div>
      </div>
    </div>
    <aside class="card">
      <div class="card-h"><span class="step">§</span><h2>Пять свойств (классы Поста)</h2></div>
      <div class="body"><dl class="cls" id="x10Cls"></dl>
        <p class="tries">Теорема Поста: система полна тогда и только тогда, когда для каждого из пяти свойств в ней есть функция, у которой этого свойства нет.</p></div>
    </aside>
  </section>
</div>
<div class="toast" id="x10Toast"></div>`;

/* ---------- прогресс ---------- */
function summarize(){
  const ex=store.get('ex',{}),co=store.get('co',0);
  if(!Object.keys(ex).length&&!co&&!AL.node('n10').touched)return;
  const n=Object.keys(ex).length,nn=Object.keys(ex).filter(k=>k.startsWith('nand')||k.startsWith('nor')).length;
  const mastered=n>=6&&nn>=2&&co>=5;
  AL.report('n10',{done:Math.min(n,6)+Math.min(co,5),total:11,note:`Выражено ${Math.min(n,6)} из 6 (через ↑ или ↓: ${Math.min(nn,2)} из 2) · полнота ${Math.min(co,5)} из 5`,mastered,via:mastered?'practice':undefined});
}
const exportData=()=>({e:store.get('ex',{}),c:store.get('co',0)});
function importData(d){if(!d)return;store.set('ex',Object.assign({},d.e||{},store.get('ex',{})));store.set('co',Math.max(store.get('co',0),d.c||0));summarize();if(api)api.refresh()}

let api=null;
function mount(){if(api)return api;document.getElementById('view-t10').innerHTML=MARKUP;api=init();return api}

function init(){
const $=s=>document.querySelector(s);
let log=store.get('log',[]),mode=store.get('mode','ex'),exDone=store.get('ex',{}),co=store.get('co',0);
let X=null,C=null,EX=null;
function addLog(stage,input,note,id){log.push({t:new Date().toISOString(),seed:id||'—',student:AL.student.get(),stage,input,note});if(log.length>3000)log=log.slice(-3000);store.set('log',log)}
function toast(t){const el=$('#x10Toast');el.textContent=t;el.classList.add('show');clearTimeout(toast.h);toast.h=setTimeout(()=>el.classList.remove('show'),1800)}
function showMsg(sel,cls,html){const el=$(sel);el.className='msg show '+cls;el.innerHTML=html}
function hideMsg(sel){$(sel).className='msg'}
function setHash(h){if(location.hash.slice(1)!==h){try{history.replaceState(null,'','#'+h)}catch(e){location.hash=h}}}
const app=()=>document.querySelector('.app.t10');
const nextBtn=(id,t)=>EX?`<button class="btn primary" id="x10ExNext">${EX.i<EX.tasks.length-1?'Дальше →':'Итог зачёта'}</button>`:`<button class="btn primary" id="${id}">${t}</button>`;
$('#x10Cls').innerHTML=CK.map(c=>`<div><dt>${c} — ${esc(CLS[c].name)}</dt><dd>${esc(CLS[c].desc)}</dd></div>`).join('');

function setMode(m,push=true){
  mode=m;if(!EX)store.set('mode',m);
  $('#x10TabEx').setAttribute('aria-selected',m==='ex');$('#x10TabCo').setAttribute('aria-selected',m==='co');
  $('#x10Ex').hidden=m!=='ex';$('#x10Co').hidden=m!=='co';
  if(m==='ex'&&!X)nextEx();if(m==='co'&&!C)nextCo();
  if(push&&!EX)setHash('t10-'+m);renderCounts();
}
function renderCounts(){$('#x10ExCnt').textContent=Math.min(Object.keys(exDone).length,6)+'/6';$('#x10CoCnt').textContent=Math.min(co,5)+'/5'}

/* ---------- выразить ---------- */
function nextEx(task){
  // идём «лесенкой»: сначала ¬, потом остальное в том же базисе
  let pool=TASKS.filter(t=>!exDone[t.id]);if(!pool.length)pool=TASKS;
  const notFirst=pool.filter(t=>t.t==='not'||exDone[t.b+'-not']||!TASKS.some(x=>x.b===t.b&&x.t==='not'));
  const p=notFirst.length?notFirst:pool;
  X={task:task||p[Math.floor(Math.random()*p.length)],tries:0,done:false};
  $('#x10Expr').value='';updPrev();hideMsg('#x10Msg');renderEx();setTimeout(()=>$('#x10Expr').focus({preventScroll:true}),0);
}
function renderEx(){
  const B=BASES[X.task.b],T=TARGETS[X.task.t];
  $('#x10ExSub').textContent='Запиши функцию, пользуясь только операциями базиса. Переменные — A и B.';
  $('#x10Basis').innerHTML=`<span class="lbl">Базис</span><b>${esc(B.name)}</b><span class="bd">${esc(B.desc)}</span>`;
  $('#x10Goal').innerHTML=`<span class="lbl">Вырази</span><b>${esc(T.t)}</b>`;
  const keyOf={nand:['↑',' ↑ '],nor:['↓',' ↓ '],not:['¬','¬'],and:['∧',' ∧ '],or:['∨',' ∨ '],imp:['→',' → '],xor:['⊕',' ⊕ '],c0:['0','0'],c1:['1','1']};
  const keys=[['A','A',''],['B','B',''],...B.ops.map(o=>[...keyOf[o],'op']),['(','(',''],[')',')',''],['⌫','BS',''],['Сброс','CLR','']];
  $('#x10Pad').innerHTML=keys.map(([l,ins,c])=>`<button class="${c}" data-ins="${esc(ins)}">${l}</button>`).join('');
  $('#x10Check').disabled=$('#x10Expr').disabled=X.done;$('#x10Skip').hidden=!!EX;
  $('#x10Tries').textContent=EX?'Зачёт: одна попытка':X.tries?`Попыток: ${X.tries}`:exDone[X.task.id]?'Уже решено':'';
}
function updPrev(){
  const src=$('#x10Expr').value,el=$('#x10Prev');
  if(!src.trim()){el.className='preview';el.innerHTML='&nbsp;';return null}
  try{const a=parse(src);el.className='preview';el.textContent=`Читается как: ${pretty(a)} · столбец ${vec(a)}`;return a}
  catch(e){if(!(e instanceof Err))throw e;el.className='preview err';el.textContent=`${e.msg} (позиция ${e.pos+1})`;return null}
}
function checkEx(){
  if(X.done)return;let ast;try{ast=parse($('#x10Expr').value)}catch(e){if(!(e instanceof Err))throw e;showMsg('#x10Msg','info',`Выражение не разобрано: ${esc(e.msg)}. Это не попытка.`);return}
  const B=BASES[X.task.b],T=TARGETS[X.task.t];
  const bad=[...used(ast)].filter(o=>!B.ops.includes(o));
  if(bad.length){showMsg('#x10Msg','info',`В базисе «${esc(B.name)}» нет ${bad.map(o=>o==='c0'?'константы 0':o==='c1'?'константы 1':'«'+OPS[o]+'»').join(', ')}. Используй только разрешённое. Это не попытка.`);return}
  const v=vec(ast),ok=v===T.v;X.tries++;
  if(EX){X.done=true;EX.cur.ok=ok;addLog('Зачёт',pretty(ast),`${T.t} через ${B.name}: ${ok?'верно':'столбец '+v}`,X.task.id);
    showMsg('#x10Msg',ok?'ok':'bad',`<b>${ok?'Верно.':'Не совпадает.'}</b> Одно из решений: ${esc(X.task.ref)}.<div class="actions">${nextBtn()}</div>`);renderExamBar();renderEx();return}
  if(ok){X.done=true;exDone[X.task.id]=true;store.set('ex',exDone);addLog('Верно',pretty(ast),`${T.t} через ${B.name}`,X.task.id);
    showMsg('#x10Msg','ok',`<b>Верно!</b> ${esc(T.t)} = ${esc(pretty(ast))}, операций: ${size(ast)}.${pretty(parse(X.task.ref))!==pretty(ast)?` Ещё вариант: ${esc(X.task.ref)}.`:''}<div class="actions"><button class="btn primary" id="x10Next">Дальше →</button></div>`);summarize();renderCounts()}
  else{addLog('Выразить',pretty(ast),`${T.t} через ${B.name}: столбец ${v}`,X.task.id);
    const i=[...v].findIndex((b,k)=>b!==T.v[k]);
    showMsg('#x10Msg','bad',`<b>Не совпадает.</b> У твоего выражения столбец ${v}, а у ${esc(T.t)} — ${T.v}. Расходится при A = ${(i>>1)&1}, B = ${i&1}.${X.tries>=2?' Подсказка: '+esc(HINT[X.task.b]):''}`)}
  renderEx();
}

/* ---------- полнота ---------- */
function nextCo(){C=Object.assign(genSystem(),{ans:null,why:new Set(),done:false});hideMsg('#x10CoMsg');renderCo()}
function renderCo(){
  $('#x10Sys').innerHTML=`<span class="lbl">Система</span>{ ${C.sys.map(f=>`<span class="fnc"><b>${esc(f.n)}</b><small>${f.v}</small></span>`).join('<span class="cm">,</span>')} }`;
  $('#x10Ver').innerHTML=['yes','no'].map(v=>`<button class="btn vopt${C.ans===v?' sel':''}" data-v="${v}" ${C.done?'disabled':''}>${v==='yes'?'Полна':'Не полна'}</button>`).join('');
  $('#x10Why').hidden=C.ans!=='no';
  $('#x10Why').innerHTML=`<span class="lbl">Все функции системы…</span>${CK.map(c=>`<button class="chipb${C.why.has(c)?' on':''}" data-c="${c}" ${C.done?'disabled':''} aria-pressed="${C.why.has(c)}">${c}: ${esc(CLS[c].name)}</button>`).join('')}`;
  $('#x10CoCheck').disabled=C.done;
  $('#x10Post').innerHTML=C.done?`<thead><tr><th>функция</th><th>столбец</th>${CK.map(c=>`<th title="${esc(CLS[c].name)}">${c}</th>`).join('')}</tr></thead><tbody>${C.sys.map(f=>`<tr><td class="fn">${esc(f.n)}</td><td class="m">${f.v}</td>${CK.map(c=>`<td class="${CLS[c].f(f.v)?'in':'out'}">${CLS[c].f(f.v)?'да':'нет'}</td>`).join('')}</tr>`).join('')}
    <tr class="sum"><td colspan="2">все функции?</td>${CK.map(c=>`<td class="${C.keep.includes(c)?'in':'out'}">${C.keep.includes(c)?'все':'не все'}</td>`).join('')}</tr></tbody>`:'';
}
function checkCo(){
  if(C.done)return;if(!C.ans){showMsg('#x10CoMsg','info','Выбери: полна или не полна.');return}
  if(C.ans==='no'&&!C.why.size&&!C.complete){showMsg('#x10CoMsg','info','Укажи хотя бы одно свойство, которое есть у всех функций системы.');return}
  let ok;
  if(C.complete)ok=C.ans==='yes';
  else ok=C.ans==='no'&&[...C.why].every(c=>C.keep.includes(c))&&C.why.size>0;
  C.done=true;
  const names=C.sys.map(f=>f.n).join(', ');
  const why=C.complete?`Для каждого из пяти свойств в системе есть функция без него — по теореме Поста система полна.`:`${C.sys.length>1?'Все функции системы':'Функция системы'} ${C.keep.map(c=>C.sys.length>1?CLS[c].pl:CLS[c].name).join(', ')}. ${C.sys.length>1?'Любая их комбинация':'Любое выражение из неё'} ${C.keep.length>1?'сохраняет эти свойства':'сохраняет это свойство'}, поэтому, например, ${C.keep.includes('T0')||C.keep.includes('T1')||C.keep.includes('M')?'¬A':'A ∧ B'} не выразить.`;
  if(EX){EX.cur.ok=ok;renderExamBar()}else if(ok){co++;store.set('co',co)}
  addLog(EX?'Зачёт':ok?'Верно':'Полнота',`{${names}}: ${C.ans==='yes'?'полна':'не полна ('+[...C.why].join(', ')+')'}`,ok?'верно':(C.complete?'полна':'не полна: '+C.keep.join(', ')),'полнота');
  const wrongWhy=!C.complete&&C.ans==='no'&&!ok?` Неверно отмечено: ${[...C.why].filter(c=>!C.keep.includes(c)).map(c=>c).join(', ')} — не у всех функций есть это свойство.`:'';
  showMsg('#x10CoMsg',ok?'ok':'bad',`<b>${ok?'Верно.':'Неверно.'}</b> ${esc(why)}${wrongWhy}<div class="actions">${nextBtn('x10CoNext','Следующая система →')}</div>`);
  renderCo();summarize();renderCounts();
}

/* ---------- зачёт ---------- */
function startExam(){EX={tasks:['exn','co','ex','co'],i:0,res:[],cur:{},done:false};addLog('Зачёт','—','Начат зачёт','зачёт');app().classList.add('exam');showTask()}
function showTask(){const t=EX.tasks[EX.i];EX.cur={};setMode(t==='co'?'co':'ex',false);
  if(t==='co')nextCo();else{const pool=TASKS.filter(x=>t==='exn'?(x.b==='nand'||x.b==='nor')&&x.t!=='not':x.b!=='nand'&&x.b!=='nor');nextEx(pool[Math.floor(Math.random()*pool.length)])}
  renderExamBar();window.scrollTo(0,0)}
function renderExamBar(){
  const bar=$('#x10ExamBar');if(!EX){bar.hidden=true;app().classList.remove('exam');return}
  bar.hidden=false;
  bar.innerHTML=`<div class="ex-t"><b>Зачёт по теме 10</b><span>${EX.done?'Зачёт завершён':`Задание ${EX.i+1} из ${EX.tasks.length}`} · одна попытка на каждое, подсказок нет</span></div>
    <div class="ex-dots">${EX.tasks.map((t,i)=>`<span class="ex-dot ${i<EX.res.length?(EX.res[i]?'ok':'bad'):i===EX.i?'now':''}"></span>`).join('')}</div>
    <button class="btn ghost" id="x10ExQuit">${EX.done?'Закрыть зачёт':'Прервать зачёт'}</button>`;
}
function examNext(){
  EX.res.push(EX.cur.ok===true);
  if(EX.i<EX.tasks.length-1){EX.i++;showTask();return}
  EX.done=true;const k=EX.res.filter(Boolean).length,n=EX.tasks.length;renderExamBar();
  const sel=mode==='co'?'#x10CoMsg':'#x10Msg';
  if(k===n){AL.report('n10',{mastered:true,via:'exam'});addLog('Верно','зачёт',`Зачёт сдан: ${k} из ${n}`,'зачёт');
    showMsg(sel,'ok',`<b>Зачёт сдан: ${k} из ${n}.</b> Тема 10 засчитана — ветка функций пройдена.<div class="actions"><a class="btn primary" href="#map">На карту навыков</a><button class="btn" id="x10ExStay">Остаться в тренажёре</button></div>`)}
  else{addLog('Зачёт','—',`Не сдан: ${k} из ${n}`,'зачёт');
    showMsg(sel,'bad',`<b>Зачёт не сдан: верно ${k} из ${n}.</b> Потренируйся и попробуй снова.<div class="actions"><button class="btn primary" id="x10ExRetry">Сдать ещё раз</button><button class="btn" id="x10ExStay">Тренироваться</button></div>`)}
}
function stopExam(){if(EX&&!EX.done)addLog('Зачёт','—',`Прерван на задании ${EX.i+1}`,'зачёт');EX=null;renderExamBar();X=null;C=null;setMode(store.get('mode','ex'))}

/* ---------- события ---------- */
$('#x10TabEx').onclick=()=>{if(EX)return toast('Сначала закончи или прерви зачёт');setMode('ex')};
$('#x10TabCo').onclick=()=>{if(EX)return toast('Сначала закончи или прерви зачёт');setMode('co')};
$('#x10Expr').addEventListener('input',updPrev);$('#x10Expr').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();checkEx()}});
$('#x10Pad').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b||X.done)return;const inp=$('#x10Expr'),ins=b.dataset.ins;
  let s=inp.selectionStart??inp.value.length,en=inp.selectionEnd??inp.value.length;
  if(ins==='CLR'){inp.value='';s=0}else if(ins==='BS'){if(s===en&&s>0){inp.value=inp.value.slice(0,s-1)+inp.value.slice(en);s--}else inp.value=inp.value.slice(0,s)+inp.value.slice(en)}
  else{inp.value=inp.value.slice(0,s)+ins+inp.value.slice(en);s+=ins.length}
  inp.focus();try{inp.setSelectionRange(s,s)}catch(err){}updPrev();
});
$('#x10Check').onclick=checkEx;$('#x10Skip').onclick=()=>nextEx();
$('#x10Ver').addEventListener('click',e=>{const b=e.target.closest('.vopt');if(!b||C.done)return;C.ans=b.dataset.v;if(C.ans==='yes')C.why.clear();hideMsg('#x10CoMsg');renderCo()});
$('#x10Why').addEventListener('click',e=>{const b=e.target.closest('.chipb');if(!b||C.done)return;const c=b.dataset.c;if(C.why.has(c))C.why.delete(c);else C.why.add(c);renderCo()});
$('#x10CoCheck').onclick=checkCo;
const onMsg=e=>{if(e.target.id==='x10Next')nextEx();if(e.target.id==='x10CoNext')nextCo();if(e.target.id==='x10ExNext')examNext();if(e.target.id==='x10ExRetry')startExam();if(e.target.id==='x10ExStay')stopExam()};
$('#x10Msg').addEventListener('click',onMsg);$('#x10CoMsg').addEventListener('click',onMsg);
$('#x10ExamBar').addEventListener('click',e=>{if(e.target.id==='x10ExQuit')stopExam()});
$('#x10Student').value=AL.student.get();
$('#x10Student').addEventListener('input',()=>AL.student.set($('#x10Student').value));
AL.on('student',v=>{if(document.activeElement!==$('#x10Student'))$('#x10Student').value=v});
$('#x10Log').onclick=()=>AL.openLog&&AL.openLog();

function enter(arg){
  if(arg==='exam'){startExam();return}
  if(EX&&EX.done&&!arg){stopExam();return}
  if(EX)return;
  setMode(['ex','co'].includes(arg)?arg:mode,true);
}
function refresh(){exDone=store.get('ex',{});co=store.get('co',0);renderCounts()}
return {enter,refresh};
}

AL.register('t10',{title:'Полные системы',logRows:()=>store.get('log',[]),exportData,importData,enter:arg=>mount().enter(arg)});
summarize();
})();
