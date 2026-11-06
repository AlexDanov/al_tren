/* Тренажёр 13 «Триггер»: RS-триггер на двух элементах ИЛИ-НЕ — живая схема с памятью, таблица переходов, временные диаграммы. */
(()=>{
const store=AL.store.scoped('t13');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- модель: Q = ¬(R ∨ ¬Q), ¬Q = ¬(S ∨ Q) — устойчивое состояние ---------- */
function settle(S,R,Q,nQ){
  for(let i=0;i<6;i++){const q=1-(R|nQ),nq=1-(S|q);if(q===Q&&nq===nQ)break;Q=q;nQ=nq}
  return [Q,nQ];
}
function next(S,R,Q){return S&&!R?1:R&&!S?0:S&&R?null:Q}   // null — запрещённая комбинация
const ACT={set:'установка (запись 1)',reset:'сброс (запись 0)',hold:'хранение',bad:'запрещённая комбинация'};
const actOf=(S,R)=>S&&R?'bad':S?'set':R?'reset':'hold';

/* ---------- схема ---------- */
const wire=(pts,on)=>`<polyline points="${pts.map(p=>p.join(',')).join(' ')}" class="w${on?' on':''}"/>`;
const dot=(x,y,on)=>`<circle cx="${x}" cy="${y}" r="3.6" class="jd${on?' on':''}"/>`;
function latchSVG(S,R,Q,nQ){
  return `<svg viewBox="0 0 560 300" class="circ13" role="img" aria-label="RS-триггер на двух элементах ИЛИ-НЕ">
    ${wire([[78,60],[210,60]],R)}${wire([[78,240],[210,240]],S)}
    ${wire([[275,80],[500,80]],Q)}${dot(340,80,Q)}${wire([[340,80],[340,150],[170,175],[170,200],[210,200]],Q)}
    ${wire([[275,220],[500,220]],nQ)}${dot(370,220,nQ)}${wire([[370,220],[370,150],[150,125],[150,100],[210,100]],nQ)}
    <rect x="210" y="40" width="58" height="80" class="g"/><text x="239" y="62" class="gl">1</text><circle cx="273" cy="80" r="5" class="gi"/>
    <rect x="210" y="180" width="58" height="80" class="g"/><text x="239" y="202" class="gl">1</text><circle cx="273" cy="220" r="5" class="gi"/>
    <g class="inb${R?' on':''}" data-in="R" tabindex="0" role="button" aria-label="Вход R = ${R}, сброс"><rect x="20" y="44" width="58" height="32" rx="6"/><text x="49" y="65">R = ${R}</text></g>
    <g class="inb${S?' on':''}" data-in="S" tabindex="0" role="button" aria-label="Вход S = ${S}, установка"><rect x="20" y="224" width="58" height="32" rx="6"/><text x="49" y="245">S = ${S}</text></g>
    <text x="49" y="96" class="gn">сброс</text><text x="49" y="276" class="gn">установка</text>
    <g class="outl${Q?' on':''}"><circle cx="500" cy="80" r="5"/><text x="512" y="85">Q = ${Q}</text></g>
    <g class="outl${nQ?' on':''}"><circle cx="500" cy="220" r="5"/><text x="512" y="225">¬Q = ${nQ}</text></g>
    <text x="239" y="32" class="gn">ИЛИ-НЕ</text><text x="239" y="174" class="gn">ИЛИ-НЕ</text></svg>`;
}

/* ---------- диаграммы ---------- */
function genTimeline(){
  const n=10,S=[],R=[];let q=Math.random()<.5?1:0;const q0=q;const Q=[];
  for(let t=0;t<n;t++){const r=Math.random();let s=0,rr=0;if(r<.28)s=1;else if(r<.56)rr=1;
    // хотя бы пара «хранений» подряд после установки или сброса
    S.push(s);R.push(rr);q=next(s,rr,q);Q.push(q)}
  const acts=S.map((s,t)=>actOf(s,R[t]));
  if(!acts.includes('set')||!acts.includes('reset')||acts.filter(a=>a==='hold').length<3)return genTimeline();
  return {n,S,R,Q,q0};
}

const QUEST=[
  {id:'set',t:'Запиши в триггер 1',d:'Подай сигнал на вход «установка», чтобы на выходе стало Q = 1.'},
  {id:'hold1',t:'Убедись, что 1 хранится',d:'Сними сигнал: S = 0 и R = 0. Выход Q всё равно остался 1 — триггер помнит бит.'},
  {id:'reset',t:'Сотри бит',d:'Подай сигнал на вход «сброс», чтобы стало Q = 0, а затем сними его — 0 тоже хранится.'},
  {id:'bad',t:'Попробуй запрещённую комбинацию',d:'Подай S = 1 и R = 1 одновременно. Посмотри на оба выхода.'}
];

const MARKUP=`<div class="app t13">
  <header class="top">
    <div class="brand">
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><path d="M3 28h6V12h10v16h6V12h12" fill="none" stroke="var(--live)" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/><path d="M3 34h34" stroke="var(--ink)" stroke-width="2" stroke-linecap="round"/></svg>
      <div><a class="back" href="#map">← Карта навыков</a><h1>Триггер</h1><p>Элемент, который помнит один бит</p></div>
    </div>
    <div class="controls">
      <div class="field"><label for="x13Student">Ученик</label><input type="text" id="x13Student" placeholder="Фамилия Имя" autocomplete="off"></div>
      <button class="btn" id="x13Log">Журнал</button>
    </div>
  </header>
  <div class="exam-bar" id="x13ExamBar" hidden></div>
  <div class="seg" role="tablist" aria-label="Режим">
    <button role="tab" id="x13TabSim" aria-selected="true">Исследуй <span class="pill ok" id="x13SimCnt">0/4</span></button>
    <button role="tab" id="x13TabTab" aria-selected="false">Таблица переходов <span class="pill ok" id="x13TabCnt">—</span></button>
    <button role="tab" id="x13TabDia" aria-selected="false">Временная диаграмма <span class="pill ok" id="x13DiaCnt">0/3</span></button>
  </div>

  <section id="x13Sim" class="t13-grid">
    <div class="card">
      <div class="card-h"><span class="step">⇄</span><h2>RS-триггер на элементах ИЛИ-НЕ</h2><p>Выход каждого элемента идёт на вход другого — это обратная связь. Нажимай на S и R слева.</p></div>
      <div class="body"><div class="tt-wrap" id="x13Sch"></div>
        <div class="actions"><button class="btn" id="x13Both">Снять оба сигнала сразу</button><button class="btn ghost" id="x13Rst">Начать заново</button></div>
        <p class="state" id="x13State"></p><div class="hist" id="x13Hist"></div></div>
    </div>
    <aside class="card">
      <div class="card-h"><span class="step">★</span><h2>Задания</h2></div>
      <div class="body"><ol class="quest" id="x13Quest"></ol><div class="msg" id="x13QMsg"></div></div>
    </aside>
  </section>

  <section id="x13Tab" class="t13-grid" hidden>
    <div class="card">
      <div class="card-h"><span class="step">#</span><h2>Таблица переходов</h2><p>Q(t) — что хранилось до подачи сигналов, Q(t+1) — что станет после. Для запрещённой комбинации поставь «×».</p></div>
      <div class="body"><div class="tt-wrap"><table class="tt t13tt" id="x13TT"></table></div>
        <div class="actions"><button class="btn primary" id="x13CheckT">Проверить</button><button class="btn ghost" id="x13ClearT">Очистить</button><span class="tries" id="x13TTries"></span></div>
        <div class="msg" id="x13TMsg"></div></div>
    </div>
    <aside class="card">
      <div class="card-h"><span class="step">i</span><h2>Как работает</h2></div>
      <div class="body">
        <p><b>S = 1, R = 0</b> — установка: Q становится 1.</p>
        <p><b>S = 0, R = 1</b> — сброс: Q становится 0.</p>
        <p><b>S = 0, R = 0</b> — хранение: Q не меняется. Это и есть память.</p>
        <p><b>S = 1, R = 1</b> — запрещено: оба выхода становятся 0, и после снятия сигналов неизвестно, в какое состояние перейдёт триггер.</p>
      </div>
    </aside>
  </section>

  <section id="x13Dia" hidden>
    <div class="card">
      <div class="card-h"><span class="step">⏱</span><h2>Временная диаграмма</h2><p>В каждый момент времени на входы подаются сигналы S и R. Заполни строку Q — состояние триггера после этого момента. Нажимай на клетки строки Q.</p></div>
      <div class="body"><div class="tt-wrap"><table class="dia" id="x13D"></table></div>
        <div class="actions"><button class="btn primary" id="x13CheckD">Проверить</button><span class="tries" id="x13DTries"></span></div>
        <div class="msg" id="x13DMsg"></div></div>
    </div>
  </section>
</div>
<div class="toast" id="x13Toast"></div>`;

/* ---------- прогресс ---------- */
function summarize(){
  const q=store.get('quest',{}),t=store.get('table',false),d=store.get('dia',0);
  if(!Object.keys(q).length&&!t&&!d&&!AL.node('n13').touched)return;
  const nq=Object.keys(q).length,mastered=nq>=4&&t&&d>=3;
  AL.report('n13',{done:nq+(t?1:0)+Math.min(d,3),total:8,note:`Задания ${nq} из 4 · таблица ${t?'✓':'—'} · диаграммы ${Math.min(d,3)} из 3`,mastered,via:mastered?'practice':undefined});
}
const exportData=()=>({q:store.get('quest',{}),t:store.get('table',false),d:store.get('dia',0)});
function importData(x){if(!x)return;store.set('quest',Object.assign({},x.q||{},store.get('quest',{})));store.set('table',store.get('table',false)||!!x.t);store.set('dia',Math.max(store.get('dia',0),x.d||0));summarize();if(api)api.refresh()}

let api=null;
function mount(){if(api)return api;document.getElementById('view-t13').innerHTML=MARKUP;api=init();return api}

function init(){
const $=s=>document.querySelector(s);
let log=store.get('log',[]),mode=store.get('mode','sim'),quest=store.get('quest',{}),tableOk=store.get('table',false),dia=store.get('dia',0);
let sim={S:0,R:0,Q:0,nQ:1,race:false,hist:[]},T=null,D=null,EX=null;
function addLog(stage,input,note,id){log.push({t:new Date().toISOString(),seed:id||'—',student:AL.student.get(),stage,input,note});if(log.length>3000)log=log.slice(-3000);store.set('log',log)}
function toast(t){const el=$('#x13Toast');el.textContent=t;el.classList.add('show');clearTimeout(toast.h);toast.h=setTimeout(()=>el.classList.remove('show'),1800)}
function showMsg(sel,cls,html){const el=$(sel);el.className='msg show '+cls;el.innerHTML=html}
function hideMsg(sel){$(sel).className='msg'}
function setHash(h){if(location.hash.slice(1)!==h){try{history.replaceState(null,'','#'+h)}catch(e){location.hash=h}}}
const app=()=>document.querySelector('.app.t13');
const nextBtn=()=>EX?`<button class="btn primary" id="x13ExNext">${EX.i<EX.tasks.length-1?'Дальше →':'Итог зачёта'}</button>`:'';

function setMode(m,push=true){
  mode=m;if(!EX)store.set('mode',m);
  ['Sim','Tab','Dia'].forEach(x=>$('#x13Tab'+x).setAttribute('aria-selected',m===x.toLowerCase()));
  $('#x13Sim').hidden=m!=='sim';$('#x13Tab').hidden=m!=='tab';$('#x13Dia').hidden=m!=='dia';
  if(m==='sim')renderSim();if(m==='tab'&&!T)newTable();if(m==='dia'&&!D)newDia();
  if(push&&!EX)setHash('t13-'+m);renderCounts();
}
function renderCounts(){$('#x13SimCnt').textContent=Object.keys(quest).length+'/4';$('#x13TabCnt').textContent=tableOk?'✓':'—';$('#x13DiaCnt').textContent=Math.min(dia,3)+'/3'}

/* ---------- исследование ---------- */
function toggle(n){
  if(n==='both'){if(!sim.S&&!sim.R)return;sim.S=0;sim.R=0}else sim[n]^=1;
  if(sim.race&&!(sim.S&&sim.R)){
    // выход из запрещённого состояния: если оба сигнала сняты — гонка
    if(!sim.S&&!sim.R){sim.Q=Math.random()<.5?1:0;sim.nQ=1-sim.Q;sim.race=false;sim.hist.push({S:0,R:0,Q:sim.Q,note:'гонка'});renderSim();showMsg('#x13QMsg','info','<b>Гонка.</b> Оба сигнала сняты почти одновременно: какой элемент «успеет» первым — неизвестно. В этот раз получилось Q = '+sim.Q+'. Поэтому комбинацию S = R = 1 и запрещают.');return}
    sim.race=false;
  }
  const [q,nq]=settle(sim.S,sim.R,sim.Q,sim.nQ);sim.Q=q;sim.nQ=nq;
  if(sim.S&&sim.R)sim.race=true;
  sim.hist.push({S:sim.S,R:sim.R,Q:sim.Q});if(sim.hist.length>12)sim.hist.shift();
  // квест
  const done=id=>{if(!quest[id]){quest[id]=true;store.set('quest',quest);addLog('Верно','исследование',QUEST.find(x=>x.id===id).t,'схема');summarize();renderCounts();toast('Задание выполнено: '+QUEST.find(x=>x.id===id).t)}};
  if(sim.Q===1&&sim.S===1&&!sim.R)done('set');
  if(quest.set&&sim.Q===1&&!sim.S&&!sim.R)done('hold1');
  if(quest.hold1&&sim.Q===0&&!sim.S&&!sim.R&&sim.hist.slice(-3).some(h=>h.R&&!h.S))done('reset');
  if(sim.S&&sim.R)done('bad');
  renderSim();
  if(sim.S&&sim.R)showMsg('#x13QMsg','bad','<b>Запрещённая комбинация.</b> Q = 0 и ¬Q = 0 — выходы перестали быть противоположными. Нажми «Снять оба сигнала сразу» и посмотри, что будет.');
  else hideMsg('#x13QMsg');
}
function renderSim(){
  $('#x13Sch').innerHTML=latchSVG(sim.S,sim.R,sim.Q,sim.nQ);
  const a=actOf(sim.S,sim.R);
  $('#x13State').innerHTML=`Сейчас: <b>${ACT[a]}</b>. Хранится бит <b class="qb${sim.Q?' on':''}">${sim.S&&sim.R?'?':sim.Q}</b>.`;
  $('#x13Hist').innerHTML=sim.hist.length?`<span class="lbl">История</span>${sim.hist.map(h=>`<span class="hs${h.Q?' on':''}" title="S = ${h.S}, R = ${h.R}">${h.note?'⚡':h.S&&h.R?'×':h.S?'S':h.R?'R':'·'}<b>${h.Q}</b></span>`).join('')}`:'';
  $('#x13Quest').innerHTML=QUEST.map(q=>`<li class="${quest[q.id]?'done':''}"><b>${esc(q.t)}</b><span>${esc(q.d)}</span></li>`).join('');
}

/* ---------- таблица переходов ---------- */
const TROWS=[...Array(8).keys()].map(m=>({S:(m>>2)&1,R:(m>>1)&1,Q:m&1}));
const tAns=r=>{const n=next(r.S,r.R,r.Q);return n===null?'×':String(n)};
function newTable(){T={cells:Array(8).fill(''),marks:null,done:EX?false:tableOk,errors:0};if(T.done)T.cells=TROWS.map(tAns);hideMsg('#x13TMsg');renderTable()}
function renderTable(){
  $('#x13TT').innerHTML=`<thead><tr><th>S</th><th>R</th><th>Q(t)</th><th class="f">Q(t+1)</th><th class="act">что происходит</th></tr></thead><tbody>${TROWS.map((r,m)=>{const v=T.cells[m],mk=T.marks?T.marks[m]:'';
    return `<tr><td>${r.S}</td><td>${r.R}</td><td>${r.Q}</td><td class="fc"><button class="fbtn${v!==''?' filled':''}${mk?' '+mk:''}" data-m="${m}" ${T.done?'disabled':''} aria-label="Q(t+1) в строке ${m+1}">${v}</button></td><td class="act">${T.done||T.marks?ACT[actOf(r.S,r.R)]:''}</td></tr>`}).join('')}</tbody>`;
  $('#x13CheckT').disabled=$('#x13ClearT').disabled=T.done;$('#x13TTries').textContent=EX?'Зачёт: одна попытка':T.errors?`Ошибок: ${T.errors}`:'';
}
function checkTable(){
  if(T.done)return;if(T.cells.some(v=>v==='')){showMsg('#x13TMsg','info','Заполни все строки. Нажатие меняет значение по кругу: 1 → 0 → × → пусто.');return}
  T.marks=T.cells.map((v,m)=>v===tAns(TROWS[m])?'ok':'bad');const bad=T.marks.map((x,m)=>x==='bad'?m:-1).filter(m=>m>=0);
  addLog(EX?'Зачёт':bad.length?'Триггер':'Верно','Q(t+1) = '+T.cells.join(''),bad.length?`ошибок ${bad.length}`:'таблица верно','таблица');
  if(EX){T.done=true;EX.cur.ok=!bad.length;renderExamBar();showMsg('#x13TMsg',bad.length?'bad':'ok',`<b>${bad.length?'Есть ошибки.':'Верно.'}</b> Правильно: ${TROWS.map(tAns).join(' ')}.<div class="actions">${nextBtn()}</div>`)}
  else if(!bad.length){T.done=true;tableOk=true;store.set('table',true);summarize();renderCounts();showMsg('#x13TMsg','ok','<b>Верно!</b> При S = R = 0 столбец Q(t+1) повторяет Q(t) — это хранение.')}
  else{T.errors++;const r=TROWS[bad[0]];showMsg('#x13TMsg','bad',`<b>Ошибка.</b> Неверных строк: ${bad.length}. Например, S = ${r.S}, R = ${r.R}, Q(t) = ${r.Q}: это ${ACT[actOf(r.S,r.R)]}, поэтому Q(t+1) = ${tAns(r)}.`)}
  renderTable();
}

/* ---------- диаграмма ---------- */
function newDia(){D=Object.assign(genTimeline(),{cells:null,marks:null,done:false,errors:0});D.cells=Array(D.n).fill('');hideMsg('#x13DMsg');renderDia()}
function renderDia(){
  const row=(name,arr,cls)=>`<tr class="${cls}"><th>${name}</th>${arr.map(v=>`<td><span class="pv${v?' hi':''}">${v}</span></td>`).join('')}</tr>`;
  $('#x13D').innerHTML=`<thead><tr><th>t</th><th class="t0">до</th>${[...Array(D.n).keys()].map(t=>`<th>${t+1}</th>`).join('')}</tr></thead><tbody>
    <tr class="sr"><th>S</th><td class="t0"></td>${D.S.map(v=>`<td><span class="pv${v?' hi':''}">${v}</span></td>`).join('')}</tr>
    <tr class="sr"><th>R</th><td class="t0"></td>${D.R.map(v=>`<td><span class="pv${v?' hi r':''}">${v}</span></td>`).join('')}</tr>
    <tr class="qr"><th>Q</th><td class="t0"><span class="pv q${D.q0?' hi':''}">${D.q0}</span></td>${D.cells.map((v,t)=>{const shown=D.done?String(D.Q[t]):v,mk=D.marks?D.marks[t]:'';
      return `<td><button class="qc${shown==='1'?' hi':''}${mk?' '+mk:''}" data-t="${t}" ${D.done?'disabled':''} aria-label="Q в момент ${t+1}">${shown===''?'?':shown}</button></td>`}).join('')}</tr></tbody>`;
  $('#x13CheckD').disabled=D.done;$('#x13DTries').textContent=EX?'Зачёт: одна попытка':D.errors?`Ошибок: ${D.errors}`:'';
}
function checkDia(){
  if(D.done)return;if(D.cells.some(v=>v==='')){showMsg('#x13DMsg','info','Заполни Q во всех моментах времени.');return}
  D.marks=D.cells.map((v,t)=>+v===D.Q[t]?'ok':'bad');const bad=D.marks.findIndex(x=>x==='bad');
  addLog(EX?'Зачёт':bad>=0?'Диаграмма':'Верно',`S=${D.S.join('')} R=${D.R.join('')} Q=${D.cells.join('')}`,bad>=0?`первая ошибка t=${bad+1}`:'диаграмма верно','диаграмма');
  const why=bad>=0?(()=>{const t=bad,prev=t?D.Q[t-1]:D.q0,a=actOf(D.S[t],D.R[t]);return `Момент ${t+1}: S = ${D.S[t]}, R = ${D.R[t]} — ${ACT[a]}, поэтому Q = ${a==='hold'?`${prev} (как было)`:D.Q[t]}.`})():'';
  if(EX){D.done=true;EX.cur.ok=bad<0;renderExamBar();showMsg('#x13DMsg',bad<0?'ok':'bad',`<b>${bad<0?'Верно.':'Ошибка.'}</b> ${esc(why)}<div class="actions">${nextBtn()}</div>`)}
  else if(bad<0){D.done=true;dia++;store.set('dia',dia);summarize();renderCounts();showMsg('#x13DMsg','ok','<b>Верно!</b> Заметь: в моменты хранения Q просто повторяет предыдущее значение.<div class="actions"><button class="btn primary" id="x13DNext">Новая диаграмма →</button></div>')}
  else{D.errors++;showMsg('#x13DMsg','bad',`<b>Ошибка.</b> ${esc(why)}`)}
  renderDia();
}

/* ---------- зачёт: таблица + две диаграммы ---------- */
function startExam(){EX={tasks:['tab','dia','dia'],i:0,res:[],cur:{},done:false};addLog('Зачёт','—','Начат зачёт','зачёт');app().classList.add('exam');showTask()}
function showTask(){const t=EX.tasks[EX.i];EX.cur={};setMode(t,false);if(t==='tab')newTable();else newDia();renderExamBar();window.scrollTo(0,0)}
function renderExamBar(){
  const bar=$('#x13ExamBar');if(!EX){bar.hidden=true;app().classList.remove('exam');return}
  bar.hidden=false;
  bar.innerHTML=`<div class="ex-t"><b>Зачёт по теме 13</b><span>${EX.done?'Зачёт завершён':`Задание ${EX.i+1} из ${EX.tasks.length}`} · одна попытка на каждое</span></div>
    <div class="ex-dots">${EX.tasks.map((t,i)=>`<span class="ex-dot ${i<EX.res.length?(EX.res[i]?'ok':'bad'):i===EX.i?'now':''}"></span>`).join('')}</div>
    <button class="btn ghost" id="x13ExQuit">${EX.done?'Закрыть зачёт':'Прервать зачёт'}</button>`;
}
function examNext(){
  EX.res.push(EX.cur.ok===true);
  if(EX.i<EX.tasks.length-1){EX.i++;showTask();return}
  EX.done=true;const k=EX.res.filter(Boolean).length,n=EX.tasks.length;renderExamBar();
  const sel=mode==='tab'?'#x13TMsg':'#x13DMsg';
  if(k===n){AL.report('n13',{mastered:true,via:'exam'});addLog('Верно','зачёт',`Зачёт сдан: ${k} из ${n}`,'зачёт');
    showMsg(sel,'ok',`<b>Зачёт сдан: ${k} из ${n}.</b> Тема 13 засчитана — ветка схем пройдена.<div class="actions"><a class="btn primary" href="#map">На карту навыков</a><button class="btn" id="x13ExStay">Остаться в тренажёре</button></div>`)}
  else{addLog('Зачёт','—',`Не сдан: ${k} из ${n}`,'зачёт');
    showMsg(sel,'bad',`<b>Зачёт не сдан: верно ${k} из ${n}.</b> Потренируйся и попробуй снова.<div class="actions"><button class="btn primary" id="x13ExRetry">Сдать ещё раз</button><button class="btn" id="x13ExStay">Тренироваться</button></div>`)}
}
function stopExam(){if(EX&&!EX.done)addLog('Зачёт','—',`Прерван на задании ${EX.i+1}`,'зачёт');EX=null;renderExamBar();T=null;D=null;setMode(store.get('mode','sim'))}

/* ---------- события ---------- */
['Sim','Tab','Dia'].forEach(x=>$('#x13Tab'+x).onclick=()=>{if(EX)return toast('Сначала закончи или прерви зачёт');setMode(x.toLowerCase())});
$('#x13Both').onclick=()=>toggle('both');
$('#x13Rst').onclick=()=>{sim={S:0,R:0,Q:0,nQ:1,race:false,hist:[]};hideMsg('#x13QMsg');renderSim()};
$('#x13Sch').addEventListener('click',e=>{const g=e.target.closest('.inb');if(!g)return;toggle(g.dataset.in);const ng=$(`#x13Sch .inb[data-in="${g.dataset.in}"]`);ng&&ng.focus()});
$('#x13Sch').addEventListener('keydown',e=>{const g=e.target.closest('.inb');if(g&&(e.key==='Enter'||e.key===' ')){e.preventDefault();toggle(g.dataset.in);const ng=$(`#x13Sch .inb[data-in="${g.dataset.in}"]`);ng&&ng.focus()}});
const cyc={'':'1','1':'0','0':'×','×':''};
$('#x13TT').addEventListener('click',e=>{const b=e.target.closest('.fbtn');if(!b||b.disabled)return;const m=+b.dataset.m;T.cells[m]=cyc[T.cells[m]];T.marks=null;renderTable();const nb=$(`#x13TT .fbtn[data-m="${m}"]`);nb&&nb.focus()});
$('#x13TT').addEventListener('keydown',e=>{const b=e.target.closest('.fbtn');if(!b||b.disabled)return;const m=+b.dataset.m;
  const k=e.key==='x'||e.key==='X'||e.key==='х'||e.key==='*'?'×':e.key;if(['0','1','×'].includes(k)){e.preventDefault();T.cells[m]=k;T.marks=null;renderTable();const nb=$(`#x13TT .fbtn[data-m="${Math.min(7,m+1)}"]`);nb&&nb.focus()}
  else if(e.key==='Enter'){e.preventDefault();checkTable()}});
$('#x13CheckT').onclick=checkTable;$('#x13ClearT').onclick=()=>{if(T.done)return;T.cells=Array(8).fill('');T.marks=null;hideMsg('#x13TMsg');renderTable()};
$('#x13D').addEventListener('click',e=>{const b=e.target.closest('.qc');if(!b||b.disabled)return;const t=+b.dataset.t;D.cells[t]=D.cells[t]==='1'?'0':'1';D.marks=null;renderDia();const nb=$(`#x13D .qc[data-t="${t}"]`);nb&&nb.focus()});
$('#x13D').addEventListener('keydown',e=>{const b=e.target.closest('.qc');if(!b||b.disabled)return;const t=+b.dataset.t;
  if(e.key==='0'||e.key==='1'){e.preventDefault();D.cells[t]=e.key;D.marks=null;renderDia();const nb=$(`#x13D .qc[data-t="${Math.min(D.n-1,t+1)}"]`);nb&&nb.focus()}
  else if(e.key==='Enter'){e.preventDefault();checkDia()}});
$('#x13CheckD').onclick=checkDia;
const onMsg=e=>{if(e.target.id==='x13DNext')newDia();if(e.target.id==='x13ExNext')examNext();if(e.target.id==='x13ExRetry')startExam();if(e.target.id==='x13ExStay')stopExam()};
['#x13TMsg','#x13DMsg','#x13QMsg'].forEach(s=>$(s).addEventListener('click',onMsg));
$('#x13ExamBar').addEventListener('click',e=>{if(e.target.id==='x13ExQuit')stopExam()});
$('#x13Student').value=AL.student.get();
$('#x13Student').addEventListener('input',()=>AL.student.set($('#x13Student').value));
AL.on('student',v=>{if(document.activeElement!==$('#x13Student'))$('#x13Student').value=v});
$('#x13Log').onclick=()=>AL.openLog&&AL.openLog();

function enter(arg){
  if(arg==='exam'){startExam();return}
  if(EX&&EX.done&&!arg){stopExam();return}
  if(EX)return;
  setMode(['sim','tab','dia'].includes(arg)?arg:mode,true);
}
function refresh(){quest=store.get('quest',{});tableOk=store.get('table',false);dia=store.get('dia',0);renderCounts()}
return {enter,refresh};
}

AL.register('t13',{title:'Триггер',logRows:()=>store.get('log',[]),exportData,importData,enter:arg=>mount().enter(arg)});
summarize();
})();
