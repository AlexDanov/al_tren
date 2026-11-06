/* Тренажёр 1 «Высказывания»: распознать высказывание и его истинность, перевести фразу в формулу, зачёт. */
(()=>{
const store=AL.store.scoped('t1');
const L=AL.logic;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- банк: высказывание или нет ----------
   T — истинное высказывание, F — ложное, N — не высказывание */
const CL=[
  ['c1','Число 7 — простое.','T','Это утверждение, и оно верно: у 7 нет делителей, кроме 1 и самого числа.'],
  ['c2','В одном байте 8 бит.','T','Утверждение, и оно верно: байт состоит из 8 бит.'],
  ['c3','2 + 2 · 2 = 6.','T','Верно: сначала умножение, 2 · 2 = 4, затем 2 + 4 = 6.'],
  ['c4','Двоичное число 1011 равно десятичному числу 11.','T','Верно: 8 + 0 + 2 + 1 = 11.'],
  ['c5','Волга впадает в Каспийское море.','T','Утверждение о факте, и факт верный.'],
  ['c6','Сумма углов треугольника равна 180°.','T','Верно для треугольника на плоскости, его изучают в школьной геометрии.'],
  ['c7','Число 2 — единственное чётное простое число.','T','Верно: любое другое чётное число делится на 2 и поэтому составное.'],
  ['c8','Тремя битами можно закодировать 8 разных значений.','T','Верно: 2³ = 8 вариантов, от 000 до 111.'],
  ['c9','Число 9 — простое.','F','Это высказывание, но ложное: 9 = 3 · 3.'],
  ['c10','Все простые числа нечётные.','F','Ложно: 2 — простое и чётное. Чтобы опровергнуть утверждение про «все», хватает одного контрпримера.'],
  ['c11','Наибольшее число, которое можно записать четырьмя битами, равно 16.','F','Ложно: наибольшее четырёхбитное число 1111₂ = 15.'],
  ['c12','Любое чётное число делится на 4.','F','Ложно: например, 6 чётное, но на 4 не делится.'],
  ['c13','Париж — столица Германии.','F','Ложно: столица Германии — Берлин. Ложное утверждение — тоже высказывание.'],
  ['c14','Дробь 1/2 больше дроби 2/3.','F','Ложно: 1/2 = 3/6, а 2/3 = 4/6.'],
  ['c15','Солнце обращается вокруг Земли.','F','Ложно: это Земля обращается вокруг Солнца.'],
  ['c16','Двоичное число 100 равно десятичному числу 100.','F','Ложно: 100₂ = 4.'],
  ['c17','Который час?','N','Вопрос ничего не утверждает, поэтому он не может быть ни истинным, ни ложным.'],
  ['c18','Закрой окно!','N','Это побуждение к действию, а не утверждение.'],
  ['c19','x + 3 > 7','N','Истинность зависит от x: при x = 5 верно, при x = 1 нет. Это высказывательная форма (предикат) — о них тема 2.'],
  ['c20','Какой красивый закат!','N','Восклицание выражает чувство, а не утверждение.'],
  ['c21','Реши задачу номер пять.','N','Это просьба или команда, а не утверждение.'],
  ['c22','Число x делится на 3.','N','Пока x не задан, нельзя сказать, истинно это или ложно. Это предикат: при x = 6 он истинен, при x = 7 ложен.'],
  ['c23','Сколько бит в байте?','N','Это вопрос. А вот «В байте 8 бит» — уже высказывание.'],
  ['c24','Давайте пойдём в парк.','N','Это предложение что-то сделать, а не утверждение.'],
  ['c25','Эта задача очень интересная.','N','Это оценка: одному интересно, другому нет. Однозначно назвать её истинной или ложной нельзя.'],
  ['c26','Найдите значение выражения 2 + 3.','N','Это задание, то есть команда. Само выражение «2 + 3 = 5» было бы высказыванием.']
].map(([id,text,k,why])=>({id,text,k,why}));
const KIND={T:'истинное высказывание',F:'ложное высказывание',N:'не высказывание'};

/* ---------- банк: перевод фразы в формулу ---------- */
const TR=[
  {id:'p1',d:{A:'пойдёт дождь',B:'мы останемся дома'},t:'Если пойдёт дождь, то мы останемся дома.',f:'A→B',h:'«Если X, то Y» — это импликация X → Y.'},
  {id:'p2',d:{A:'Петя сдал зачёт',B:'Вася сдал зачёт'},t:'Неверно, что и Петя, и Вася сдали зачёт.',f:'¬(A∧B)',h:'«Неверно, что…» отрицает всё утверждение целиком, поэтому ¬ стоит перед скобкой.'},
  {id:'p3',d:{A:'Петя сдал зачёт',B:'Вася сдал зачёт'},t:'Ни Петя, ни Вася не сдали зачёт.',f:'¬A∧¬B',h:'«Ни… ни…» значит: оба не сдали, ¬A ∧ ¬B. Это не то же самое, что ¬(A ∧ B).'},
  {id:'p4',d:{A:'Оля поедет на экскурсию',B:'Оля заболеет'},t:'Оля поедет на экскурсию, если не заболеет.',f:'¬B→A',h:'Условие — то, что стоит после «если»: «если не заболеет, то поедет», то есть ¬B → A.'},
  {id:'p5',hard:1,d:{A:'мы пойдём в кино',B:'мы купим билеты'},t:'Мы пойдём в кино, только если купим билеты.',f:'A→B',h:'«X, только если Y» значит: без Y не будет X. Это X → Y. Купить билеты ещё не значит пойти, поэтому не B → A.'},
  {id:'p6',d:{A:'Петя поедет в лагерь',B:'Вася поедет в лагерь'},t:'Либо Петя, либо Вася поедет в лагерь, но не оба вместе.',f:'A⊕B',h:'«Либо…либо, но не оба» — ровно один из двух. Это исключающее ИЛИ.'},
  {id:'p7',d:{A:'Петя пойдёт на концерт',B:'Вася пойдёт на концерт'},t:'Петя пойдёт на концерт тогда и только тогда, когда пойдёт Вася.',f:'A≡B',h:'«Тогда и только тогда» — эквивалентность: оба идут или оба не идут.'},
  {id:'p8',d:{A:'Аня права',B:'Боря прав'},t:'Хотя бы один из двоих, Аня или Боря, прав.',f:'A∨B',h:'«Хотя бы один» — обычное ИЛИ: может быть прав и один, и оба.'},
  {id:'p9',d:{A:'сегодня понедельник',B:'идёт дождь',C:'физкультура будет на улице'},t:'Если сегодня понедельник и нет дождя, то физкультура будет на улице.',f:'(A∧¬B)→C',h:'Условие из двух частей берётся в скобки: (A ∧ ¬B) → C.'},
  {id:'p10',hard:1,d:{A:'ученик сдал проект',B:'ученик получит зачёт'},t:'Чтобы получить зачёт, достаточно сдать проект.',f:'A→B',h:'Достаточное условие стоит слева от стрелки: сдал проект → получит зачёт.'},
  {id:'p11',hard:1,d:{A:'ученик решит задачу',B:'ученик выучил теорию'},t:'Чтобы решить задачу, необходимо выучить теорию.',f:'A→B',h:'Необходимое условие стоит справа от стрелки: решил задачу → значит, теорию выучил. Запись ¬B → ¬A тоже верна, она равносильна.'},
  {id:'p12',d:{A:'идёт дождь',B:'дует ветер'},t:'Неверно, что если идёт дождь, то дует ветер.',f:'¬(A→B)',h:'Отрицание относится ко всей импликации. Это равносильно A ∧ ¬B: дождь идёт, а ветра нет.'},
  {id:'p13',d:{A:'число делится на 6',B:'число делится на 2',C:'число делится на 3'},t:'Число делится на 6 тогда и только тогда, когда оно делится на 2 и на 3.',f:'A≡(B∧C)',h:'Справа от «тогда и только тогда» стоит условие из двух частей, его берут в скобки.'},
  {id:'p14',d:{A:'Маша знает английский',B:'Маша знает немецкий'},t:'Маша знает не только английский, но и немецкий.',f:'A∧B',h:'«Не только…, но и…» — верны оба утверждения, это конъюнкция.'},
  {id:'p15',hard:1,d:{A:'Коля подготовился',B:'Коля напишет контрольную'},t:'Без подготовки Коля контрольную не напишет.',f:'¬A→¬B',h:'«Без X не будет Y»: если не X, то не Y. Это равносильно B → A.'},
  {id:'p16',d:{A:'включён свет',B:'включён компьютер',C:'сработает сигнализация'},t:'Сигнализация сработает, если включён свет или включён компьютер.',f:'(A∨B)→C',h:'Условие стоит после «если», и оно состоит из двух частей через ИЛИ.'},
  {id:'p17',d:{A:'Дима дежурит',B:'Таня дежурит'},t:'Дежурит Дима, а Таня не дежурит.',f:'A∧¬B',h:'Союзы «а» и «но» в таком предложении означают «и».'}
];
TR.forEach(x=>x.ast=L.parse(x.f));

const MARKUP=`<div class="app t1">
  <header class="top">
    <div class="brand">
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><path d="M5 7h30v19H17l-8 7v-7H5z" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2.4" stroke-linejoin="round"/><path d="M13 16.5l4 4 9-9" fill="none" stroke="var(--live)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <div><a class="back" href="#map">← Карта навыков</a><h1>Высказывания</h1><p>Что считается высказыванием и как фраза превращается в формулу</p></div>
    </div>
    <div class="controls">
      <div class="field"><label for="x1Student">Ученик</label><input type="text" id="x1Student" placeholder="Фамилия Имя" autocomplete="off"></div>
      <button class="btn" id="x1Log">Журнал</button>
    </div>
  </header>
  <div class="exam-bar" id="x1ExamBar" hidden></div>
  <div class="seg" role="tablist" aria-label="Режим">
    <button role="tab" id="x1TabCl" aria-selected="true">Высказывание? <span class="pill ok" id="x1ClCnt">0/10</span></button>
    <button role="tab" id="x1TabTr" aria-selected="false">Перевод в формулу <span class="pill ok" id="x1TrCnt">0/8</span></button>
  </div>

  <section class="t1-wrap" id="x1Cl">
    <div class="card">
      <div class="card-h"><span class="step">?</span><h2>Высказывание или нет</h2><p>Реши, высказывание ли это. Если да — истинное оно или ложное.</p></div>
      <div class="body">
        <blockquote class="sent" id="x1Sent"></blockquote>
        <div class="answers" id="x1Ans">
          <button class="btn ans" data-k="T"><span class="k">1</span>Истинное высказывание</button>
          <button class="btn ans" data-k="F"><span class="k">2</span>Ложное высказывание</button>
          <button class="btn ans" data-k="N"><span class="k">3</span>Не высказывание</button>
        </div>
        <div class="msg" id="x1ClMsg"></div>
        <div class="streak" id="x1Streak" aria-label="Серия верных ответов"></div>
      </div>
    </div>
    <aside class="card side">
      <div class="card-h"><span class="step">i</span><h2>Что такое высказывание</h2></div>
      <div class="body">
        <p><b>Высказывание</b> — повествовательное предложение, про которое можно однозначно сказать, истинно оно или ложно.</p>
        <p>Не высказывания: вопросы, команды и просьбы, восклицания, оценки «нравится — не нравится» и предложения с неизвестной переменной вроде «x > 5».</p>
        <p class="tries">Клавиши 1, 2, 3 выбирают ответ, Enter — следующее предложение.</p>
      </div>
    </aside>
  </section>

  <section class="t1-wrap" id="x1Tr" hidden>
    <div class="card">
      <div class="card-h"><span class="step">→</span><h2>Переведи фразу в формулу</h2><p>Обозначь простые высказывания буквами и запиши всю фразу формулой.</p></div>
      <div class="body">
        <ul class="defs" id="x1Defs"></ul>
        <blockquote class="sent" id="x1Phrase"></blockquote>
        <div class="exprline"><span class="pre">F =</span><input type="text" id="x1Expr" placeholder="например: ¬A → B" spellcheck="false" autocomplete="off" aria-label="Формула"></div>
        <div class="preview" id="x1Prev">&nbsp;</div>
        <div class="pad" id="x1Pad"></div>
        <div class="actions"><button class="btn primary" id="x1Check">Проверить</button><button class="btn ghost" id="x1Skip">Другая фраза</button><span class="tries" id="x1TrTries"></span></div>
        <div class="msg" id="x1TrMsg"></div>
        <p class="help">Можно писать: ¬ ! не, ∧ & и, ∨ | или, → -&gt;, ≡ =, ⊕ ^. Засчитывается любая равносильная формула.</p>
      </div>
    </div>
    <aside class="card side">
      <div class="card-h"><span class="step">≈</span><h2>Слова и операции</h2></div>
      <div class="body"><table class="glos"><tbody>
        <tr><td>и, а, но, не только…, но и…</td><td>∧</td></tr>
        <tr><td>или, хотя бы один</td><td>∨</td></tr>
        <tr><td>либо…, либо… (ровно один)</td><td>⊕</td></tr>
        <tr><td>неверно, что…; не</td><td>¬</td></tr>
        <tr><td>если X, то Y; X достаточно для Y</td><td>X → Y</td></tr>
        <tr><td>X, только если Y; Y необходимо для X</td><td>X → Y</td></tr>
        <tr><td>тогда и только тогда</td><td>≡</td></tr>
      </tbody></table></div>
    </aside>
  </section>
</div>
<div class="toast" id="x1Toast"></div>`;

/* ---------- прогресс для карты ---------- */
function summarize(){
  const best=store.get('best',0),done=store.get('tr',{});
  if(!best&&!Object.keys(done).length&&!AL.node('n1').touched)return;
  const nTr=Math.min(Object.keys(done).length,8),nCl=Math.min(best,10);
  const mastered=best>=10&&Object.keys(done).length>=8;
  AL.report('n1',{done:nCl+nTr,total:18,note:`Серия ${nCl} из 10 · фраз ${nTr} из 8`,mastered,via:mastered?'practice':undefined});
}
const exportData=()=>({b:store.get('best',0),r:store.get('tr',{})});
function importData(d){if(!d)return;store.set('best',Math.max(store.get('best',0),d.b||0));store.set('tr',Object.assign({},d.r||{},store.get('tr',{})));summarize();if(api)api.refresh()}

let api=null;
function mount(){if(api)return api;document.getElementById('view-t1').innerHTML=MARKUP;api=init();return api}

function init(){
const $=s=>document.querySelector(s);
let log=store.get('log',[]),best=store.get('best',0),trDone=store.get('tr',{});
let streak=store.get('streak',0),mode=store.get('mode','cl');
let CI=null,TI=null,EX=null,answered=false,trTries=0;
const recent=[];
function addLog(stage,input,note,id){log.push({t:new Date().toISOString(),seed:id||'—',student:AL.student.get(),stage,input,note});if(log.length>3000)log=log.slice(-3000);store.set('log',log)}
function toast(t){const el=$('#x1Toast');el.textContent=t;el.classList.add('show');clearTimeout(toast.h);toast.h=setTimeout(()=>el.classList.remove('show'),1800)}
function showMsg(sel,cls,html){const el=$(sel);el.className='msg show '+cls;el.innerHTML=html}
function hideMsg(sel){$(sel).className='msg'}
function pick(arr){const pool=arr.filter(x=>!recent.includes(x.id));const x=(pool.length?pool:arr)[Math.floor(Math.random()*(pool.length?pool:arr).length)];recent.push(x.id);if(recent.length>Math.min(8,arr.length-1))recent.shift();return x}
function setHash(h){if(location.hash.slice(1)!==h){try{history.replaceState(null,'','#'+h)}catch(e){location.hash=h}}}

function setMode(m,push=true){
  mode=m;if(!EX)store.set('mode',m);
  $('#x1TabCl').setAttribute('aria-selected',m==='cl');$('#x1TabTr').setAttribute('aria-selected',m==='tr');
  $('#x1Cl').hidden=m!=='cl';$('#x1Tr').hidden=m!=='tr';
  if(m==='cl'&&!CI)nextCl();if(m==='tr'&&!TI)nextTr();
  if(push&&!EX)setHash(m==='cl'?'t1':'t1-tr');
  renderCounts();
}
function renderCounts(){$('#x1ClCnt').textContent=Math.min(best,10)+'/10';$('#x1TrCnt').textContent=Math.min(Object.keys(trDone).length,8)+'/8'}

/* ---------- высказывание или нет ---------- */
function nextCl(item){
  CI=item||pick(CL);answered=false;
  $('#x1Sent').textContent=CI.text;
  document.querySelectorAll('#x1Ans .ans').forEach(b=>{b.disabled=false;b.classList.remove('ok','bad')});
  hideMsg('#x1ClMsg');renderStreak();
}
function renderStreak(){
  if(EX){$('#x1Streak').innerHTML='';return}
  const n=Math.min(streak,10);
  $('#x1Streak').innerHTML=`<span class="lbl">Серия</span>${[...Array(10).keys()].map(i=>`<i class="${i<n?'on':''}"></i>`).join('')}<span class="tries">${streak>10?'серия '+streak:''}${best?` лучшая: ${best}`:''}</span>`;
}
function answerCl(k){
  if(answered)return;answered=true;
  const ok=k===CI.k;
  document.querySelectorAll('#x1Ans .ans').forEach(b=>{b.disabled=true;if(b.dataset.k===CI.k)b.classList.add('ok');else if(b.dataset.k===k)b.classList.add('bad')});
  if(EX){EX.res.push(ok);addLog('Зачёт',KIND[k],`${CI.text} — ${ok?'верно':'ошибка, это '+KIND[CI.k]}`,CI.id)}
  else{
    if(ok){streak++;if(streak>best){best=streak;store.set('best',best)}addLog('Верно',KIND[k],CI.text,CI.id)}
    else{addLog('Высказывание',KIND[k],`${CI.text} — это ${KIND[CI.k]}${streak?'; серия '+streak+' прервана':''}`,CI.id);streak=0}
    store.set('streak',streak);summarize();
  }
  const nxt=EX?`<button class="btn primary" id="x1ExNext">${EX.i<EX.tasks.length-1?'Дальше →':'Итог зачёта'}</button>`:'<button class="btn primary" id="x1ClNext">Дальше →</button>';
  showMsg('#x1ClMsg',ok?'ok':'bad',`<b>${ok?'Верно.':'Нет, это '+KIND[CI.k]+'.'}</b> ${esc(CI.why)}<div class="actions">${nxt}</div>`);
  renderStreak();renderCounts();if(EX)renderExamBar();
  setTimeout(()=>{const b=$('#x1ExNext')||$('#x1ClNext');b&&b.focus()},0);
}

/* ---------- перевод в формулу ---------- */
function nextTr(item){
  TI=item||pick(TR);trTries=0;
  $('#x1Defs').innerHTML=Object.entries(TI.d).map(([v,s])=>`<li><b>${v}</b> — «${esc(s)}»</li>`).join('');
  $('#x1Phrase').innerHTML=esc(TI.t)+(TI.hard&&!EX?' <span class="hard" title="Частая ловушка">ловушка</span>':'');
  $('#x1Expr').value='';$('#x1Expr').disabled=false;$('#x1Check').disabled=false;$('#x1Skip').hidden=!!EX;
  updPrev();hideMsg('#x1TrMsg');
  const keys=[...Object.keys(TI.d).map(v=>[v,v,'']),['¬','¬','op'],['∧',' ∧ ','op'],['∨',' ∨ ','op'],['→',' → ','op'],['≡',' ≡ ','op'],['⊕',' ⊕ ','op'],['(','(',''],[')',')',''],['⌫','BS',''],['Сброс','CLR','']];
  $('#x1Pad').innerHTML=keys.map(([l,ins,c])=>`<button class="${c}" data-ins="${esc(ins)}">${l}</button>`).join('');
  $('#x1TrTries').textContent=EX?'Зачёт: одна попытка':trDone[TI.id]?'Эта фраза уже переведена':'';
}
function updPrev(){
  const src=$('#x1Expr').value,el=$('#x1Prev');
  if(!src.trim()){el.className='preview';el.innerHTML='&nbsp;';return null}
  try{const a=L.parse(src);el.className='preview';el.textContent='Читается как: F = '+L.pretty(a);return a}
  catch(e){if(!(e instanceof L.Err))throw e;el.className='preview err';el.textContent=`${e.msg} (позиция ${e.pos+1})`;return null}
}
function meaning(env){return Object.entries(env).map(([v,x])=>`${v} = ${x} («${esc(TI.d[v])}» — ${x?'да':'нет'})`).join(', ')}
function checkTr(){
  if(EX&&EX.answered)return;
  let ast;try{ast=L.parse($('#x1Expr').value)}catch(e){if(!(e instanceof L.Err))throw e;showMsg('#x1TrMsg','info',`Формула не разобрана: ${esc(e.msg)}. Это не считается попыткой.`);return}
  const vs=Object.keys(TI.d),extra=[...L.vars(ast)].filter(v=>!vs.includes(v));
  if(extra.length){showMsg('#x1TrMsg','info',`В этой фразе нет высказывания ${extra.join(', ')}. Используй только ${vs.join(', ')}. Попытка не засчитана.`);return}
  trTries++;
  const d=L.diff(TI.ast,ast,vs),pr=L.pretty(ast);
  if(EX){EX.answered=true;EX.res.push(!d);$('#x1Expr').disabled=true;$('#x1Check').disabled=true;addLog('Зачёт',pr,`${TI.t} — ${d?'ошибка':'верно'}`,TI.id)}
  const nxt=EX?`<button class="btn primary" id="x1ExNext">${EX.i<EX.tasks.length-1?'Дальше →':'Итог зачёта'}</button>`:'<button class="btn primary" id="x1TrNext">Следующая фраза →</button>';
  if(!d){
    if(!EX){const first=!trDone[TI.id];trDone[TI.id]=true;store.set('tr',trDone);addLog('Верно',pr,`${TI.t} — с ${trTries}-й попытки`,TI.id);summarize();
      showMsg('#x1TrMsg','ok',`<b>Верно!</b> F = ${esc(pr)}${L.pretty(TI.ast)!==pr?` — то же, что ${esc(L.pretty(TI.ast))}`:''}.${first?'':' Эта фраза уже была засчитана раньше.'}<div class="actions">${nxt}</div>`)}
    else showMsg('#x1TrMsg','ok',`<b>Верно.</b> F = ${esc(pr)}.<div class="actions">${nxt}</div>`);
  }else{
    if(!EX)addLog('Перевод',pr,`${TI.t} — расходится при ${Object.entries(d.env).map(([k,v])=>k+'='+v).join(', ')}`,TI.id);
    showMsg('#x1TrMsg','bad',`<b>Не совпадает.</b> Возьмём ${meaning(d.env)}. По смыслу фраза при этом ${d.a?'истинна':'ложна'}, а твоя формула даёт ${d.b}.${trTries>=2||EX?' '+esc(TI.h):''}${EX?`<div class="actions">${nxt}</div>`:''}`);
  }
  renderCounts();if(EX)renderExamBar();
}

/* ---------- зачёт ---------- */
function startExam(){
  const sh=a=>AL.shuffle(a);
  const cl=[...['T','F','N'].map(k=>sh(CL.filter(x=>x.k===k))[0])];
  sh(CL).forEach(x=>{if(cl.length<5&&!cl.includes(x))cl.push(x)});
  const tr=[sh(TR.filter(x=>x.hard))[0]];sh(TR.filter(x=>!x.hard)).slice(0,2).forEach(x=>tr.push(x));
  EX={tasks:[...sh(cl).map(x=>({k:'cl',x})),...sh(tr).map(x=>({k:'tr',x}))],i:0,res:[],answered:false,done:false};
  addLog('Зачёт','—','Начат зачёт: '+EX.tasks.map(t=>t.x.id).join(', '));
  document.querySelector('.app.t1').classList.add('exam');
  showTask();
}
function showTask(){
  const t=EX.tasks[EX.i];EX.answered=false;
  setMode(t.k,false);
  if(t.k==='cl')nextCl(t.x);else nextTr(t.x);
  renderExamBar();
}
function renderExamBar(){
  const bar=$('#x1ExamBar');if(!EX){bar.hidden=true;document.querySelector('.app.t1').classList.remove('exam');return}
  bar.hidden=false;
  bar.innerHTML=`<div class="ex-t"><b>Зачёт по теме 1</b><span>${EX.done?'Зачёт завершён':`Задание ${EX.i+1} из ${EX.tasks.length}`} · одна попытка на каждое</span></div>
    <div class="ex-dots">${EX.tasks.map((t,i)=>`<span class="ex-dot ${i<EX.res.length?(EX.res[i]?'ok':'bad'):i===EX.i?'now':''}"></span>`).join('')}</div>
    <button class="btn ghost" id="x1ExQuit">${EX.done?'Закрыть зачёт':'Прервать зачёт'}</button>`;
}
function examNext(){
  if(EX.res.length<=EX.i)return;
  if(EX.i<EX.tasks.length-1){EX.i++;showTask();return}
  EX.done=true;const k=EX.res.filter(Boolean).length,n=EX.tasks.length;renderExamBar();
  const sel=mode==='cl'?'#x1ClMsg':'#x1TrMsg';
  if(k===n){AL.report('n1',{mastered:true,via:'exam'});addLog('Верно','зачёт',`Зачёт сдан: ${k} из ${n}`);
    showMsg(sel,'ok',`<b>Зачёт сдан: ${k} из ${n}.</b> Тема 1 засчитана, на карте открылись темы 2 и 3.<div class="actions"><a class="btn primary" href="#map">На карту навыков</a><button class="btn" id="x1ExStay">Остаться в тренажёре</button></div>`)}
  else{addLog('Зачёт','—',`Не сдан: ${k} из ${n}`);
    showMsg(sel,'bad',`<b>Зачёт не сдан: верно ${k} из ${n}.</b> Нужны все восемь. Потренируйся и попробуй снова.<div class="actions"><button class="btn primary" id="x1ExRetry">Сдать ещё раз</button><button class="btn" id="x1ExStay">Тренироваться</button></div>`)}
}
function stopExam(){
  if(EX&&!EX.done)addLog('Зачёт','—',`Прерван на задании ${EX.i+1}`);
  EX=null;renderExamBar();CI=null;TI=null;setMode(store.get('mode','cl'));
}

/* ---------- события ---------- */
$('#x1TabCl').onclick=()=>{if(EX)return toast('Сначала закончи или прерви зачёт');setMode('cl')};
$('#x1TabTr').onclick=()=>{if(EX)return toast('Сначала закончи или прерви зачёт');setMode('tr')};
$('#x1Ans').addEventListener('click',e=>{const b=e.target.closest('.ans');if(b)answerCl(b.dataset.k)});
const onMsg=e=>{
  if(e.target.id==='x1ClNext')nextCl();
  if(e.target.id==='x1TrNext')nextTr();
  if(e.target.id==='x1ExNext')examNext();
  if(e.target.id==='x1ExRetry')startExam();
  if(e.target.id==='x1ExStay')stopExam();
};
$('#x1ClMsg').addEventListener('click',onMsg);$('#x1TrMsg').addEventListener('click',onMsg);
$('#x1ExamBar').addEventListener('click',e=>{if(e.target.id==='x1ExQuit')stopExam()});
document.addEventListener('keydown',e=>{
  if($('#view-t1').hidden||mode!=='cl'||$('#x1Cl').hidden)return;
  const tag=(e.target.tagName||'').toLowerCase();if(tag==='input'||tag==='textarea'||e.ctrlKey||e.metaKey||e.altKey)return;
  if(!answered&&['1','2','3'].includes(e.key)){e.preventDefault();answerCl(['T','F','N'][+e.key-1])}
});
$('#x1Expr').addEventListener('input',updPrev);
$('#x1Expr').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();checkTr()}});
$('#x1Pad').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b||$('#x1Expr').disabled)return;const inp=$('#x1Expr'),ins=b.dataset.ins;
  let s=inp.selectionStart??inp.value.length,en=inp.selectionEnd??inp.value.length;
  if(ins==='CLR'){inp.value='';s=0}
  else if(ins==='BS'){if(s===en&&s>0){inp.value=inp.value.slice(0,s-1)+inp.value.slice(en);s--}else inp.value=inp.value.slice(0,s)+inp.value.slice(en)}
  else{inp.value=inp.value.slice(0,s)+ins+inp.value.slice(en);s+=ins.length}
  inp.focus();try{inp.setSelectionRange(s,s)}catch(err){}updPrev();
});
$('#x1Check').onclick=checkTr;
$('#x1Skip').onclick=()=>nextTr();
$('#x1Student').value=AL.student.get();
$('#x1Student').addEventListener('input',()=>AL.student.set($('#x1Student').value));
AL.on('student',v=>{if(document.activeElement!==$('#x1Student'))$('#x1Student').value=v});
$('#x1Log').onclick=()=>AL.openLog&&AL.openLog();

function enter(arg){
  if(arg==='exam'){startExam();return}
  if(EX&&EX.done&&!arg){stopExam();return}
  if(EX)return;
  setMode(arg==='tr'?'tr':arg==='cl'?'cl':mode,true);
}
function refresh(){best=store.get('best',0);trDone=store.get('tr',{});renderCounts();renderStreak()}
return {enter,refresh};
}

AL.register('t1',{title:'Высказывания',logRows:()=>store.get('log',[]),exportData,importData,enter:arg=>mount().enter(arg)});
summarize();
})();
