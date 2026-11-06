/* Тренажёр 8 «Логические функции»: функция — это столбец таблицы; подсчёт числа функций,
   коллекция всех 16 функций двух переменных, функции трёх переменных по словесному описанию. */
(()=>{
const store=AL.store.scoped('t8');
const L=AL.logic;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmtN=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,' ');
const binom=(n,k)=>{let r=1;for(let i=1;i<=k;i++)r=r*(n-k+i)/i;return Math.round(r)};
const pow2=e=>2**e;
const lcFirst=t=>/^[A-Z](\s|$|[ =,])/.test(t)?t:t[0].toLowerCase()+t.slice(1);
const znach=n=>n%10===1&&n%100!==11?'значение':[2,3,4].includes(n%10)&&![12,13,14].includes(n%100)?'значения':'значений';

/* ---------- все 16 функций двух переменных: столбец для строк AB = 00, 01, 10, 11 ---------- */
const F16=[
  ['0000','Константа 0','0'],['0001','Конъюнкция','A ∧ B'],['0010','Запрет по B','A ∧ ¬B'],['0011','Повторение A','A'],
  ['0100','Запрет по A','¬A ∧ B'],['0101','Повторение B','B'],['0110','Исключающее ИЛИ','A ⊕ B'],['0111','Дизъюнкция','A ∨ B'],
  ['1000','Стрелка Пирса','¬(A ∨ B)'],['1001','Эквивалентность','A ≡ B'],['1010','Отрицание B','¬B'],['1011','Обратная импликация','B → A'],
  ['1100','Отрицание A','¬A'],['1101','Импликация','A → B'],['1110','Штрих Шеффера','¬(A ∧ B)'],['1111','Константа 1','1']
].map(([v,name,f])=>({v,name,f}));
const NOTE16={'1000':'A ↓ B, «ИЛИ-НЕ»','1110':'A | B, «И-НЕ»','0010':'A ∧ ¬B: «A, но не B»','0100':'¬A ∧ B: «B, но не A»'};
const PICKABLE=['0001','0111','1101','1011','1001','0110','1110','1000','1100','0000','1111'];

/* ---------- функции по описанию: переменные A, B, C, строка = двоичное число ABC ---------- */
const isPrime=n=>n===2||n===3||n===5||n===7;
const DESC=[
  ['Большинство переменных равны 1',(a,b,c)=>a+b+c>=2,'Это «функция голосования»: F = 1, когда единиц две или три.'],
  ['Ровно одна переменная равна 1',(a,b,c)=>a+b+c===1],
  ['Число единиц в наборе чётное',(a,b,c)=>(a+b+c)%2===0,'Ноль единиц — тоже чётное число.'],
  ['Все три переменные равны',(a,b,c)=>a===b&&b===c],
  ['Двоичное число ABC больше 4',(a,b,c)=>4*a+2*b+c>4,'Строка таблицы — это само число: 000 = 0, …, 111 = 7.'],
  ['Двоичное число ABC делится на 3',(a,b,c)=>(4*a+2*b+c)%3===0,'0 делится на 3, поэтому F(0, 0, 0) = 1.'],
  ['Двоичное число ABC — простое',(a,b,c)=>isPrime(4*a+2*b+c),'Простые числа от 0 до 7: 2, 3, 5, 7.'],
  ['Хотя бы две переменные равны 0',(a,b,c)=>a+b+c<=1],
  ['A = 1, а из B и C ровно одна равна 1',(a,b,c)=>a===1&&b+c===1],
  ['Двоичное число AB больше числа C',(a,b,c)=>2*a+b>c,'AB — двузначное двоичное число от 0 до 3, C — 0 или 1.'],
  ['!При A = 1 функция совпадает с B, а при A = 0 — с C',(a,b,c)=>a?b:c,'Это «переключатель»: A выбирает, какой вход пропустить.'],
  ['Значения A и C различаются',(a,b,c)=>a!==c,'От B функция не зависит: B — фиктивная переменная.']
].map(([t,f,note])=>({t,f,note,col:[...Array(8).keys()].map(m=>f((m>>2)&1,(m>>1)&1,m&1)?1:0)}));

/* ---------- вопросы «сколько?» ---------- */
function countQ(){
  const r=Math.random,pick=a=>a[Math.floor(r()*a.length)];
  const k=pick(['rows','funcs','funcs','fixed','exact','notdep','one']);
  if(k==='rows'){const n=2+Math.floor(r()*5);return {q:`Сколько строк в таблице истинности функции от ${n} переменных?`,a:pow2(n),why:`Каждая переменная принимает 2 значения, наборов 2 · 2 · … · 2 = 2^${n} = ${pow2(n)}.`}}
  if(k==='funcs'){const n=1+Math.floor(r()*4);return {q:`Сколько существует различных логических функций от ${n} переменн${n===1?'ой':'ых'}?`,a:pow2(pow2(n)),why:`В таблице 2^${n} = ${pow2(n)} строк. Функция — это столбец значений, в каждой строке 0 или 1, поэтому столбцов 2^${pow2(n)} = ${fmtN(pow2(pow2(n)))}.`}}
  if(k==='fixed'){const n=2+Math.floor(r()*2),m=1+Math.floor(r()*Math.min(4,pow2(n)-1));return {q:`Сколько функций от ${n} переменных, у которых значения на ${m} заданн${m===1?'ом наборе':'ых наборах'} уже известны?`,a:pow2(pow2(n)-m),why:`Из ${pow2(n)} строк свободными остаются ${pow2(n)-m}, в каждой 0 или 1: 2^${pow2(n)-m} = ${fmtN(pow2(pow2(n)-m))}.`}}
  if(k==='exact'){const n=2+Math.floor(r()*2),N=pow2(n),c=1+Math.floor(r()*Math.min(3,N-1));return {q:`Сколько функций от ${n} переменных принимают значение 1 ровно на ${c} набор${c===1?'е':'ах'}?`,a:binom(N,c),why:`Нужно выбрать, в каких ${c} из ${N} строк стоит 1: это число сочетаний C(${N}, ${c}) = ${binom(N,c)}.`}}
  if(k==='notdep'){const n=2+Math.floor(r()*2);return {q:`Сколько функций от ${n} переменных не зависят от последней переменной (она фиктивная)?`,a:pow2(pow2(n-1)),why:`Такая функция — по сути функция от ${n-1} переменн${n-1===1?'ой':'ых'}: её столбец задают ${pow2(n-1)} ${znach(pow2(n-1))}, поэтому 2^${pow2(n-1)} = ${pow2(pow2(n-1))}.`}}
  const n=2+Math.floor(r()*2),N=pow2(n);return {q:`Сколько функций от ${n} переменных хотя бы на одном наборе равны 1?`,a:pow2(N)-1,why:`Всего функций 2^${N} = ${pow2(N)}, из них только одна — константа 0 — нигде не равна 1: ${pow2(N)} − 1 = ${pow2(N)-1}.`};
}

const MARKUP=`<div class="app t8">
  <header class="top">
    <div class="brand">
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><rect x="6" y="4" width="28" height="32" rx="3" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2.4"/><text x="20" y="25" text-anchor="middle" font-family="JetBrains Mono,monospace" font-style="italic" font-weight="700" font-size="17" fill="var(--accent)">f</text><path d="M10 31h20" stroke="var(--live)" stroke-width="2.4" stroke-linecap="round"/></svg>
      <div><a class="back" href="#map">← Карта навыков</a><h1>Логические функции</h1><p>Функция — это столбец таблицы. Сколько их и как они называются</p></div>
    </div>
    <div class="controls">
      <div class="field"><label for="x8Student">Ученик</label><input type="text" id="x8Student" placeholder="Фамилия Имя" autocomplete="off"></div>
      <button class="btn" id="x8Log">Журнал</button>
    </div>
  </header>
  <div class="exam-bar" id="x8ExamBar" hidden></div>
  <div class="seg" role="tablist" aria-label="Режим">
    <button role="tab" id="x8TabCn" aria-selected="true">Сколько функций? <span class="pill ok" id="x8CnCnt">0/5</span></button>
    <button role="tab" id="x8TabCo" aria-selected="false">Коллекция 16 <span class="pill ok" id="x8CoCnt">0/12</span></button>
    <button role="tab" id="x8TabDe" aria-selected="false">По описанию <span class="pill ok" id="x8DeCnt">0/3</span></button>
  </div>

  <section id="x8Cn" class="t8-grid">
    <div class="card">
      <div class="card-h"><span class="step">#</span><h2>Посчитай</h2></div>
      <div class="body"><p class="cq" id="x8CQ"></p>
        <div class="row cans"><input type="number" id="x8CA" min="0" inputmode="numeric" aria-label="Ответ"><button class="btn primary" id="x8CCheck">Проверить</button></div>
        <div class="msg" id="x8CMsg"></div></div>
    </div>
    <aside class="card">
      <div class="card-h"><span class="step">i</span><h2>Почему 2^(2ⁿ)</h2></div>
      <div class="body">
        <p>У функции от n переменных 2ⁿ наборов — строк таблицы. Сама функция — это столбец: в каждой строке стоит 0 или 1.</p>
        <table class="pw"><thead><tr><th>n</th><th>строк 2ⁿ</th><th>функций 2^(2ⁿ)</th></tr></thead><tbody>
          <tr><td>1</td><td>2</td><td>4</td></tr><tr><td>2</td><td>4</td><td>16</td></tr><tr><td>3</td><td>8</td><td>256</td></tr><tr><td>4</td><td>16</td><td>65 536</td></tr><tr><td>5</td><td>32</td><td>4 294 967 296</td></tr></tbody></table>
      </div>
    </aside>
  </section>

  <section id="x8Co" hidden>
    <div class="card">
      <div class="card-h"><span class="step">16</span><h2 id="x8CoTitle">Коллекция</h2><p id="x8CoSub"></p></div>
      <div class="body">
        <div class="co-task" id="x8CoTask"></div>
        <div id="x8CoInput">
          <div class="exprline"><span class="pre">F =</span><input type="text" id="x8Expr" placeholder="например: ¬A ∨ B" spellcheck="false" autocomplete="off" aria-label="Формула"></div>
          <div class="preview" id="x8Prev">&nbsp;</div>
          <div class="pad" id="x8Pad"></div>
          <div class="actions"><button class="btn primary" id="x8CoCheck">Проверить</button><button class="btn ghost" id="x8CoSkip">Другая функция</button></div>
        </div>
        <div class="msg" id="x8CoMsg"></div>
        <div class="cards" id="x8Cards"></div>
        <p class="tries">Открытая карточка показывает имя функции. Порядок строк в столбце: AB = 00, 01, 10, 11.</p>
      </div>
    </div>
  </section>

  <section id="x8De" hidden>
    <div class="t8-grid">
      <div class="card">
        <div class="card-h"><span class="step">≡</span><h2>Функция по описанию</h2><p>Заполни столбец F. Строка — набор ABC, его можно читать как двоичное число.</p></div>
        <div class="body"><p class="dq" id="x8DQ"></p>
          <div class="tt-wrap"><table class="tt t8tt" id="x8DT"></table></div>
          <div class="actions"><button class="btn primary" id="x8DCheck">Проверить</button><button class="btn ghost" id="x8DClear">Очистить</button><span class="tries" id="x8DTries"></span></div>
          <div class="msg" id="x8DMsg"></div></div>
      </div>
      <aside class="card">
        <div class="card-h"><span class="step">→</span><h2>Зачем это</h2></div>
        <div class="body"><p>Словесное правило задаёт функцию полностью: достаточно знать её значение на каждом наборе. Как записать такой столбец формулой, покажет тема 9 — СДНФ и СКНФ.</p></div>
      </aside>
    </div>
  </section>
</div>
<div class="toast" id="x8Toast"></div>`;

/* ---------- прогресс ---------- */
function summarize(){
  const cn=store.get('cn',0),co=Object.keys(store.get('coll',{})).length,de=Object.keys(store.get('desc',{})).length;
  if(!cn&&!co&&!de&&!AL.node('n8').touched)return;
  const a=Math.min(cn,5),b=Math.min(co,12),c=Math.min(de,3),mastered=cn>=5&&co>=12&&de>=3;
  AL.report('n8',{done:a+b+c,total:20,note:`Подсчёт ${a} из 5 · коллекция ${co} из 16 · описания ${c} из 3`,mastered,via:mastered?'practice':undefined});
}
const exportData=()=>({n:store.get('cn',0),c:store.get('coll',{}),d:store.get('desc',{})});
function importData(d){if(!d)return;store.set('cn',Math.max(store.get('cn',0),d.n||0));store.set('coll',Object.assign({},d.c||{},store.get('coll',{})));store.set('desc',Object.assign({},d.d||{},store.get('desc',{})));summarize();if(api)api.refresh()}

let api=null;
function mount(){if(api)return api;document.getElementById('view-t8').innerHTML=MARKUP;api=init();return api}

function init(){
const $=s=>document.querySelector(s);
let log=store.get('log',[]),mode=store.get('mode','cn'),cn=store.get('cn',0),coll=store.get('coll',{}),desc=store.get('desc',{});
let CQ=null,CO=null,DE=null,EX=null;
function addLog(stage,input,note,id){log.push({t:new Date().toISOString(),seed:id||'—',student:AL.student.get(),stage,input,note});if(log.length>3000)log=log.slice(-3000);store.set('log',log)}
function toast(t){const el=$('#x8Toast');el.textContent=t;el.classList.add('show');clearTimeout(toast.h);toast.h=setTimeout(()=>el.classList.remove('show'),1800)}
function showMsg(sel,cls,html){const el=$(sel);el.className='msg show '+cls;el.innerHTML=html}
function hideMsg(sel){$(sel).className='msg'}
function setHash(h){if(location.hash.slice(1)!==h){try{history.replaceState(null,'','#'+h)}catch(e){location.hash=h}}}
const app=()=>document.querySelector('.app.t8');
const nextBtn=(id,t)=>EX?`<button class="btn primary" id="x8ExNext">${EX.i<EX.tasks.length-1?'Дальше →':'Итог зачёта'}</button>`:`<button class="btn primary" id="${id}">${t}</button>`;

function setMode(m,push=true){
  mode=m;if(!EX)store.set('mode',m);
  ['Cn','Co','De'].forEach(x=>$('#x8Tab'+x).setAttribute('aria-selected',m===x.toLowerCase()));
  $('#x8Cn').hidden=m!=='cn';$('#x8Co').hidden=m!=='co';$('#x8De').hidden=m!=='de';
  if(m==='cn'&&!CQ)nextCount();if(m==='co'&&!CO)nextColl();if(m==='de'&&!DE)nextDesc();
  if(push&&!EX)setHash('t8-'+m);renderCounts();
}
function renderCounts(){$('#x8CnCnt').textContent=Math.min(cn,5)+'/5';$('#x8CoCnt').textContent=Math.min(Object.keys(coll).length,12)+'/12';$('#x8DeCnt').textContent=Math.min(Object.keys(desc).length,3)+'/3'}

/* ---------- сколько ---------- */
function nextCount(){CQ=Object.assign(countQ(),{done:false});$('#x8CQ').textContent=CQ.q;$('#x8CA').value='';$('#x8CA').disabled=false;$('#x8CCheck').disabled=false;hideMsg('#x8CMsg');setTimeout(()=>$('#x8CA').focus(),0)}
function checkCount(){
  if(CQ.done)return;const v=$('#x8CA').value.trim();if(v===''){showMsg('#x8CMsg','info','Впиши число.');return}
  const ok=+v===CQ.a;CQ.done=true;$('#x8CA').disabled=true;$('#x8CCheck').disabled=true;
  if(EX){EX.cur.ok=ok;addLog('Зачёт',v,`${CQ.q} — ${ok?'верно':'верно '+CQ.a}`,'подсчёт');renderExamBar()}
  else if(ok){cn++;store.set('cn',cn);addLog('Верно',v,CQ.q,'подсчёт')}else addLog('Подсчёт',v,`${CQ.q}; верно ${CQ.a}`,'подсчёт');
  showMsg('#x8CMsg',ok?'ok':'bad',`<b>${ok?'Верно.':`Неверно, ответ ${fmtN(CQ.a)}.`}</b> ${esc(CQ.why)}<div class="actions">${nextBtn('x8CNext','Следующий вопрос →')}</div>`);
  summarize();renderCounts();
}

/* ---------- коллекция ---------- */
function nextColl(force){
  const left=F16.filter(f=>!coll[f.v]);
  let kind=force||(left.length&&Math.random()<.7?'write':'pick');
  if(kind==='write'){const pool=left.length?left:F16;CO={kind,f:pool[Math.floor(Math.random()*pool.length)],done:false}}
  else{const v=PICKABLE[Math.floor(Math.random()*PICKABLE.length)];CO={kind,f:F16.find(f=>f.v===v),done:false}}
  $('#x8Expr').value='';updPrev();hideMsg('#x8CoMsg');renderColl();
}
function colHTML(v){return `<span class="colv">${[...v].map((b,i)=>`<i><small>${['00','01','10','11'][i]}</small>${b}</i>`).join('')}</span>`}
function renderColl(){
  const n=Object.keys(coll).length;
  $('#x8CoTitle').textContent=`Коллекция: ${n} из 16`;
  $('#x8CoSub').textContent=CO.kind==='write'?'Запиши формулу для этого столбца. Подходит любая равносильная формула, константы пиши как 0 и 1.':`Найди среди 16 карточек функцию «${CO.f.name}» и нажми на неё.`;
  $('#x8CoTask').innerHTML=CO.kind==='write'?`<div class="target"><span class="lbl">Столбец F</span>${colHTML(CO.f.v)}</div>`:`<div class="target name"><span class="lbl">Найди</span><b>${esc(CO.f.name)}</b></div>`;
  $('#x8CoInput').hidden=CO.kind!=='write';$('#x8CoSkip').hidden=!!EX;
  $('#x8Cards').innerHTML=F16.map(f=>{const open=coll[f.v];const cur=CO.kind==='write'&&CO.f.v===f.v;
    return `<button class="fcard${open?' open':''}${cur?' cur':''}${CO.marked===f.v?' '+CO.mark:''}" data-v="${f.v}" ${CO.kind==='pick'&&!CO.done?'':'tabindex="-1"'} aria-label="Функция со столбцом ${f.v}${open?': '+f.name:''}">${colHTML(f.v)}<span class="fn">${open?esc(f.name):'?'}</span>${open?`<span class="ff">${esc(f.f)}</span>`:''}</button>`}).join('');
  $('#x8Cards').classList.toggle('pickable',CO.kind==='pick'&&!CO.done);
  if(CO.kind==='write'){const keys=[['A','A',''],['B','B',''],['¬','¬','op'],['∧',' ∧ ','op'],['∨',' ∨ ','op'],['→',' → ','op'],['≡',' ≡ ','op'],['⊕',' ⊕ ','op'],['(','(',''],[')',')',''],['0','0',''],['1','1',''],['⌫','BS',''],['Сброс','CLR','']];
    $('#x8Pad').innerHTML=keys.map(([l,ins,c])=>`<button class="${c}" data-ins="${esc(ins)}">${l}</button>`).join('')}
  $('#x8CoCheck').disabled=CO.done;$('#x8Expr').disabled=CO.done;
}
function updPrev(){
  const src=$('#x8Expr').value,el=$('#x8Prev');
  if(!src.trim()){el.className='preview';el.innerHTML='&nbsp;';return null}
  try{const a=L.parse(src);el.className='preview';el.textContent='Читается как: F = '+L.pretty(a);return a}
  catch(e){if(!(e instanceof L.Err))throw e;el.className='preview err';el.textContent=`${e.msg} (позиция ${e.pos+1})`;return null}
}
const vecOf=ast=>[0,1,2,3].map(m=>L.evaluate(ast,{A:(m>>1)&1,B:m&1})).join('');
function checkColl(){
  if(CO.done)return;let ast;try{ast=L.parse($('#x8Expr').value)}catch(e){if(!(e instanceof L.Err))throw e;showMsg('#x8CoMsg','info',`Формула не разобрана: ${esc(e.msg)}. Это не попытка.`);return}
  const extra=[...L.vars(ast)].filter(v=>v!=='A'&&v!=='B');if(extra.length){showMsg('#x8CoMsg','info',`Функция двух переменных: используй только A и B.`);return}
  const got=vecOf(ast),ok=got===CO.f.v;
  const note=NOTE16[CO.f.v]?` (${NOTE16[CO.f.v]})`:'';
  if(EX){CO.done=true;EX.cur.ok=ok;addLog('Зачёт',L.pretty(ast),`столбец ${CO.f.v}: ${ok?'верно':'получилось '+got}`,'коллекция');
    showMsg('#x8CoMsg',ok?'ok':'bad',`<b>${ok?'Верно.':'Не совпадает.'}</b> Это ${esc(CO.f.name.toLowerCase())}${note}, например ${esc(CO.f.f)}.<div class="actions">${nextBtn()}</div>`);renderExamBar();renderColl();return}
  if(ok){CO.done=true;const first=!coll[CO.f.v];coll[CO.f.v]=true;store.set('coll',coll);addLog('Верно',L.pretty(ast),'столбец '+CO.f.v,'коллекция');
    showMsg('#x8CoMsg','ok',`<b>${first?'Новая карточка!':'Верно.'}</b> Это ${esc(CO.f.name.toLowerCase())}${note}.${Object.keys(coll).length===16?' Коллекция собрана целиком!':''}<div class="actions"><button class="btn primary" id="x8CoNext">Дальше →</button></div>`);summarize();renderCounts()}
  else{addLog('Коллекция',L.pretty(ast),`столбец ${CO.f.v}, получилось ${got}`,'коллекция');
    const i=[...got].findIndex((b,k)=>b!==CO.f.v[k]);
    showMsg('#x8CoMsg','bad',`<b>Не совпадает.</b> У твоей формулы столбец ${got}. Первое расхождение в строке AB = ${['00','01','10','11'][i]}: нужно ${CO.f.v[i]}, а получается ${got[i]}.`)}
  renderColl();
}
function pickCard(v){
  if(CO.kind!=='pick'||CO.done)return;const ok=v===CO.f.v;CO.done=true;CO.marked=v;CO.mark=ok?'ok':'bad';
  if(EX){EX.cur.ok=ok;renderExamBar()}
  addLog(EX?'Зачёт':ok?'Верно':'Коллекция',`выбран столбец ${v}`,`найти: ${CO.f.name}`,'коллекция');
  showMsg('#x8CoMsg',ok?'ok':'bad',`<b>${ok?'Верно.':'Нет.'}</b> ${esc(CO.f.name)} — столбец ${CO.f.v}, формула ${esc(CO.f.f)}${NOTE16[CO.f.v]?' ('+esc(NOTE16[CO.f.v])+')':''}.${!ok?' Подсвечена нужная карточка.':''}<div class="actions">${nextBtn('x8CoNext','Дальше →')}</div>`);
  renderColl();if(!ok){const c=$(`#x8Cards .fcard[data-v="${CO.f.v}"]`);c&&c.classList.add('ok')}
}

/* ---------- по описанию ---------- */
function nextDesc(item){
  const pool=DESC.filter(d=>!desc[d.t]);DE={d:item||(pool.length?pool:DESC)[Math.floor(Math.random()*(pool.length?pool:DESC).length)],cells:Array(8).fill(''),marks:null,tries:0,done:false};
  hideMsg('#x8DMsg');renderDesc();
}
function renderDesc(){
  $('#x8DQ').innerHTML=DE.d.t[0]==='!'?`Правило для F(A, B, C): <b>${esc(DE.d.t.slice(1))}</b>.`:`F(A, B, C) = 1, если <b>${esc(lcFirst(DE.d.t))}</b>.`;
  $('#x8DT').innerHTML=`<thead><tr><th>№</th><th>A</th><th>B</th><th>C</th><th class="num">число</th><th class="f">F</th></tr></thead><tbody>${[...Array(8).keys()].map(m=>{const v=DE.done?String(DE.d.col[m]):DE.cells[m],mk=DE.marks?DE.marks[m]:'';
    return `<tr><td class="n">${m+1}</td><td>${(m>>2)&1}</td><td>${(m>>1)&1}</td><td>${m&1}</td><td class="num">${m}</td><td class="fc"><button class="fbtn${v!==''?' filled':''}${mk?' '+mk:''}" data-m="${m}" ${DE.done?'disabled':''} aria-label="F в строке ${m+1}">${v}</button></td></tr>`}).join('')}</tbody>`;
  $('#x8DCheck').disabled=$('#x8DClear').disabled=DE.done;
  $('#x8DTries').textContent=EX?'Зачёт: одна попытка':DE.tries?`Попыток: ${DE.tries}`:'';
}
function setD(m,v){if(DE.done)return;DE.cells[m]=v;DE.marks=null;renderDesc()}
function focusD(m){const b=$(`#x8DT .fbtn[data-m="${m}"]`);b&&b.focus()}
function checkDesc(){
  if(DE.done)return;const empty=DE.cells.map((v,i)=>v===''?i+1:0).filter(Boolean);
  if(empty.length){showMsg('#x8DMsg','info','Заполни все строки. Пустые: '+empty.join(', ')+'.');return}
  DE.tries++;DE.marks=DE.cells.map((v,m)=>+v===DE.d.col[m]?'ok':'bad');const bad=DE.marks.map((x,m)=>x==='bad'?m:-1).filter(m=>m>=0);
  if(EX){DE.done=true;EX.cur.ok=!bad.length;addLog('Зачёт','F = '+DE.cells.join(''),`${DE.d.t} — ${bad.length?'ошибка':'верно'}`,'описание');
    showMsg('#x8DMsg',bad.length?'bad':'ok',`<b>${bad.length?'Есть ошибки.':'Верно.'}</b> Правильный столбец: ${DE.d.col.join('')}.${DE.d.note?' '+esc(DE.d.note):''}<div class="actions">${nextBtn()}</div>`);renderExamBar();renderDesc();return}
  if(!bad.length){DE.done=true;desc[DE.d.t]=true;store.set('desc',desc);addLog('Верно','F = '+DE.cells.join(''),DE.d.t,'описание');
    showMsg('#x8DMsg','ok',`<b>Верно!</b>${DE.d.note?' '+esc(DE.d.note):''}<div class="actions"><button class="btn primary" id="x8DNext">Следующее описание →</button></div>`);summarize();renderCounts()}
  else{addLog('Описание','F = '+DE.cells.join(''),`${DE.d.t}; ошибок ${bad.length}`,'описание');const m=bad[0];
    showMsg('#x8DMsg','bad',`<b>Ошибка.</b> Неверных строк: ${bad.length}. Например, строка ${m+1}: A = ${(m>>2)&1}, B = ${(m>>1)&1}, C = ${m&1}${DE.d.t.includes('число')?` (число ${m})`:''} — условие ${DE.d.col[m]?'выполняется, F = 1':'не выполняется, F = 0'}.`)}
  renderDesc();
}

/* ---------- зачёт: 2 подсчёта, формула для столбца, описание ---------- */
function startExam(){EX={tasks:['cn','co','cn','de'],i:0,res:[],cur:{},done:false};addLog('Зачёт','—','Начат зачёт','зачёт');app().classList.add('exam');showTask()}
function showTask(){const t=EX.tasks[EX.i];EX.cur={};setMode(t,false);
  if(t==='cn')nextCount();else if(t==='co'){const pool=F16.filter(f=>!['0000','1111','0011','0101'].includes(f.v));CO={kind:'write',f:pool[Math.floor(Math.random()*pool.length)],done:false};$('#x8Expr').value='';updPrev();hideMsg('#x8CoMsg');renderColl()}
  else nextDesc(DESC[Math.floor(Math.random()*DESC.length)]);
  renderExamBar();window.scrollTo(0,0)}
function renderExamBar(){
  const bar=$('#x8ExamBar');if(!EX){bar.hidden=true;app().classList.remove('exam');return}
  bar.hidden=false;
  bar.innerHTML=`<div class="ex-t"><b>Зачёт по теме 8</b><span>${EX.done?'Зачёт завершён':`Задание ${EX.i+1} из ${EX.tasks.length}`} · одна попытка на каждое</span></div>
    <div class="ex-dots">${EX.tasks.map((t,i)=>`<span class="ex-dot ${i<EX.res.length?(EX.res[i]?'ok':'bad'):i===EX.i?'now':''}"></span>`).join('')}</div>
    <button class="btn ghost" id="x8ExQuit">${EX.done?'Закрыть зачёт':'Прервать зачёт'}</button>`;
}
function examNext(){
  EX.res.push(EX.cur.ok===true);
  if(EX.i<EX.tasks.length-1){EX.i++;showTask();return}
  EX.done=true;const k=EX.res.filter(Boolean).length,n=EX.tasks.length;renderExamBar();
  const sel={cn:'#x8CMsg',co:'#x8CoMsg',de:'#x8DMsg'}[mode];
  if(k===n){AL.report('n8',{mastered:true,via:'exam'});addLog('Верно','зачёт',`Зачёт сдан: ${k} из ${n}`,'зачёт');
    showMsg(sel,'ok',`<b>Зачёт сдан: ${k} из ${n}.</b> Тема 8 засчитана, открылась тема 9 «СДНФ и СКНФ».<div class="actions"><a class="btn primary" href="#map">На карту навыков</a><button class="btn" id="x8ExStay">Остаться в тренажёре</button></div>`)}
  else{addLog('Зачёт','—',`Не сдан: ${k} из ${n}`,'зачёт');
    showMsg(sel,'bad',`<b>Зачёт не сдан: верно ${k} из ${n}.</b> Потренируйся и попробуй снова.<div class="actions"><button class="btn primary" id="x8ExRetry">Сдать ещё раз</button><button class="btn" id="x8ExStay">Тренироваться</button></div>`)}
}
function stopExam(){if(EX&&!EX.done)addLog('Зачёт','—',`Прерван на задании ${EX.i+1}`,'зачёт');EX=null;renderExamBar();CQ=null;CO=null;DE=null;setMode(store.get('mode','cn'))}

/* ---------- события ---------- */
['Cn','Co','De'].forEach(x=>$('#x8Tab'+x).onclick=()=>{if(EX)return toast('Сначала закончи или прерви зачёт');setMode(x.toLowerCase())});
$('#x8CCheck').onclick=checkCount;$('#x8CA').addEventListener('keydown',e=>{if(e.key==='Enter')checkCount()});
$('#x8Expr').addEventListener('input',updPrev);$('#x8Expr').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();checkColl()}});
$('#x8Pad').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b||CO.done)return;const inp=$('#x8Expr'),ins=b.dataset.ins;
  let s=inp.selectionStart??inp.value.length,en=inp.selectionEnd??inp.value.length;
  if(ins==='CLR'){inp.value='';s=0}else if(ins==='BS'){if(s===en&&s>0){inp.value=inp.value.slice(0,s-1)+inp.value.slice(en);s--}else inp.value=inp.value.slice(0,s)+inp.value.slice(en)}
  else{inp.value=inp.value.slice(0,s)+ins+inp.value.slice(en);s+=ins.length}
  inp.focus();try{inp.setSelectionRange(s,s)}catch(err){}updPrev();
});
$('#x8CoCheck').onclick=checkColl;$('#x8CoSkip').onclick=()=>nextColl();
$('#x8Cards').addEventListener('click',e=>{const c=e.target.closest('.fcard');if(c)pickCard(c.dataset.v)});
$('#x8DT').addEventListener('click',e=>{const f=e.target.closest('.fbtn');if(!f||f.disabled)return;const m=+f.dataset.m,v=DE.cells[m];setD(m,v===''?'1':v==='1'?'0':'1');focusD(m)});
$('#x8DT').addEventListener('keydown',e=>{const f=e.target.closest('.fbtn');if(!f||DE.done)return;const m=+f.dataset.m;
  if(e.key==='0'||e.key==='1'){e.preventDefault();setD(m,e.key);focusD(Math.min(7,m+1))}
  else if(e.key==='Backspace'||e.key==='Delete'){e.preventDefault();setD(m,'');focusD(m)}
  else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();focusD(Math.max(0,Math.min(7,m+(e.key==='ArrowDown'?1:-1))))}
  else if(e.key==='Enter'){e.preventDefault();checkDesc()}});
$('#x8DCheck').onclick=checkDesc;$('#x8DClear').onclick=()=>{if(DE.done)return;DE.cells=Array(8).fill('');DE.marks=null;hideMsg('#x8DMsg');renderDesc()};
const onMsg=e=>{
  if(e.target.id==='x8CNext')nextCount();if(e.target.id==='x8CoNext')nextColl();if(e.target.id==='x8DNext')nextDesc();
  if(e.target.id==='x8ExNext')examNext();if(e.target.id==='x8ExRetry')startExam();if(e.target.id==='x8ExStay')stopExam();
};
['#x8CMsg','#x8CoMsg','#x8DMsg'].forEach(s=>$(s).addEventListener('click',onMsg));
$('#x8ExamBar').addEventListener('click',e=>{if(e.target.id==='x8ExQuit')stopExam()});
$('#x8Student').value=AL.student.get();
$('#x8Student').addEventListener('input',()=>AL.student.set($('#x8Student').value));
AL.on('student',v=>{if(document.activeElement!==$('#x8Student'))$('#x8Student').value=v});
$('#x8Log').onclick=()=>AL.openLog&&AL.openLog();

function enter(arg){
  if(arg==='exam'){startExam();return}
  if(EX&&EX.done&&!arg){stopExam();return}
  if(EX)return;
  setMode(['cn','co','de'].includes(arg)?arg:mode,true);
}
function refresh(){cn=store.get('cn',0);coll=store.get('coll',{});desc=store.get('desc',{});renderCounts();if(CO)renderColl()}
return {enter,refresh};
}

AL.register('t8',{title:'Функции',logRows:()=>store.get('log',[]),exportData,importData,enter:arg=>mount().enter(arg)});
summarize();
})();
