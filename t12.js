/* Тренажёр 12 «Сумматор»: полусумматор, полный сумматор (таблица, формулы, живая схема ГОСТ),
   многоразрядный сумматор — сложение столбиком с переносами и переполнением. */
(()=>{
const store=AL.store.scoped('t12');
const L=AL.logic;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- полу- и полный сумматор ---------- */
const ADD={
  half:{vars:['A','B'],out:{S:(a,b)=>a^b,P:(a,b)=>a&b},ref:{S:'A ⊕ B',P:'A ∧ B'},title:'Полусумматор',
    sub:'Сложи два однобитных числа A и B. S — младший бит суммы, P — перенос в следующий разряд.'},
  full:{vars:['A','B','C'],out:{S:(a,b,c)=>a^b^c,P:(a,b,c)=>(a&b)|(c&(a^b))},ref:{S:'A ⊕ B ⊕ C',P:'A ∧ B ∨ C ∧ (A ⊕ B)'},title:'Полный сумматор',
    sub:'Сложи три бита: A, B и C — перенос, пришедший из младшего разряда. S — бит суммы, P — перенос в старший разряд.'}
};
const rowsOf=k=>{const n=ADD[k].vars.length;return [...Array(1<<n).keys()].map(m=>ADD[k].vars.map((v,i)=>(m>>(n-1-i))&1))};

/* ---------- схемы в обозначениях ГОСТ ---------- */
function gate(x,y,w,h,label,inv){return `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="g"/><text x="${x+w/2}" y="${y+18}" class="gl">${label}</text>${inv?`<circle cx="${x+w+5}" cy="${y+h/2}" r="5" class="gi"/>`:''}`}
const wire=(pts,on)=>`<polyline points="${pts.map(p=>p.join(',')).join(' ')}" class="w${on?' on':''}"/>`;
const dot=(x,y,on)=>`<circle cx="${x}" cy="${y}" r="3.6" class="jd${on?' on':''}"/>`;
function halfSVG(a,b){
  const x=a^b,p=a&b;
  return `<svg viewBox="0 0 470 230" class="circ12" role="img" aria-label="Схема полусумматора">
    ${wire([[60,60],[180,60]],a)}${wire([[100,60],[100,165],[180,165]],a)}${dot(100,60,a)}
    ${wire([[60,110],[180,110]],b)}${wire([[130,110],[130,200],[180,200]],b)}${dot(130,110,b)}
    ${gate(180,40,60,90,'=1')}${gate(180,145,60,75,'&amp;')}
    ${wire([[240,85],[400,85]],x)}${wire([[240,182],[400,182]],p)}
    ${inBtn(30,60,'A',a)}${inBtn(30,110,'B',b)}${outLbl(400,85,'S',x)}${outLbl(400,182,'P',p)}</svg>`;
}
function fullSVG(a,b,c){
  const x=a^b,y=a&b,s=x^c,z=x&c,p=y|z;
  return `<svg viewBox="0 0 600 300" class="circ12" role="img" aria-label="Схема полного сумматора из двух полусумматоров">
    ${wire([[60,50],[120,50],[120,60],[160,60]],a)}${wire([[95,50],[95,165],[160,165]],a)}${dot(95,50,a)}
    ${wire([[60,100],[160,100]],b)}${wire([[130,100],[130,195],[160,195]],b)}${dot(130,100,b)}
    ${gate(160,40,55,80,'=1')}${gate(160,150,55,60,'&amp;')}
    ${wire([[215,80],[320,80]],x)}${wire([[270,80],[270,185],[320,185]],x)}${dot(270,80,x)}
    ${wire([[60,262],[295,262],[295,120],[320,120]],c)}${wire([[295,215],[320,215]],c)}${dot(295,215,c)}
    ${gate(320,60,55,80,'=1')}${gate(320,170,55,60,'&amp;')}
    ${wire([[215,180],[250,180],[250,248],[440,248],[440,222],[455,222]],y)}
    ${wire([[375,200],[415,200],[415,192],[455,192]],z)}
    ${gate(455,175,55,62,'1')}
    ${wire([[375,100],[560,100]],s)}${wire([[510,206],[560,206]],p)}
    <text x="187" y="34" class="gn">полусумматор 1</text><text x="347" y="54" class="gn">полусумматор 2</text>
    ${inBtn(30,50,'A',a)}${inBtn(30,100,'B',b)}${inBtn(30,262,'C',c)}${outLbl(560,100,'S',s)}${outLbl(560,206,'P',p)}</svg>`;
}
const inBtn=(x,y,n,v)=>`<g class="inb${v?' on':''}" data-in="${n}" tabindex="0" role="button" aria-label="Вход ${n} = ${v}"><rect x="${x-24}" y="${y-14}" width="44" height="28" rx="6"/><text x="${x-2}" y="${y+5}">${n}=${v}</text></g>`;
const outLbl=(x,y,n,v)=>`<g class="outl${v?' on':''}"><circle cx="${x}" cy="${y}" r="4"/><text x="${x+10}" y="${y+5}">${n} = ${v}</text></g>`;
/* цепочка из четырёх полных сумматоров */
function chainSVG(A,B,carry,sum){
  const W=600,H=170,bw=90,gap=46,x0=W-40-bw;
  let s='';
  for(let k=0;k<4;k++){const x=x0-k*(bw+gap);
    s+=`<rect x="${x}" y="50" width="${bw}" height="70" class="g"/><text x="${x+bw/2}" y="80" class="gl">SM</text><text x="${x+bw/2}" y="100" class="gn">разряд ${k}</text>`;
    s+=`<text x="${x+22}" y="30" class="bit${(A>>k)&1?' on':''}">a${k}=${(A>>k)&1}</text><text x="${x+bw-22}" y="30" class="bit${(B>>k)&1?' on':''}">b${k}=${(B>>k)&1}</text>`;
    s+=wire([[x+22,36],[x+22,50]],(A>>k)&1)+wire([[x+bw-22,36],[x+bw-22,50]],(B>>k)&1);
    s+=wire([[x+bw/2,120],[x+bw/2,140]],sum[k])+`<text x="${x+bw/2}" y="160" class="bit${sum[k]?' on':''}">s${k}=${sum[k]}</text>`;
    const cin=k===0?0:carry[k];
    s+=wire([[x+bw,85],[x+bw+(k===0?24:gap),85]],cin)+(k===0?`<text x="${x+bw+28}" y="89" class="gn" style="text-anchor:start">0</text>`:'');
  }
  const xl=x0-3*(bw+gap);s+=wire([[xl,85],[xl-26,85]],carry[4])+`<text x="${xl-30}" y="89" class="bit${carry[4]?' on':''}" style="text-anchor:end">P=${carry[4]}</text>`;
  return `<svg viewBox="0 0 ${W} ${H}" class="circ12 chain" role="img" aria-label="Четырёхразрядный сумматор">${s}</svg>`;
}
function addBits(A,B){const c=[0,0,0,0,0],s=[0,0,0,0];for(let k=0;k<4;k++){const t=((A>>k)&1)+((B>>k)&1)+c[k];s[k]=t&1;c[k+1]=t>>1}return {c,s}}
const b4=v=>v.toString(2).padStart(4,'0');

const MARKUP=`<div class="app t12">
  <header class="top">
    <div class="brand">
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><rect x="9" y="6" width="22" height="28" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2.4"/><text x="20" y="25" text-anchor="middle" font-family="JetBrains Mono,monospace" font-weight="700" font-size="11" fill="var(--accent)">SM</text><path d="M2 14h7M2 26h7M31 20h7" stroke="var(--live)" stroke-width="2.4" stroke-linecap="round"/></svg>
      <div><a class="back" href="#map">← Карта навыков</a><h1>Сумматор</h1><p>Как компьютер складывает двоичные числа на логических элементах</p></div>
    </div>
    <div class="controls">
      <div class="field"><label for="x12Student">Ученик</label><input type="text" id="x12Student" placeholder="Фамилия Имя" autocomplete="off"></div>
      <button class="btn" id="x12Log">Журнал</button>
    </div>
  </header>
  <div class="exam-bar" id="x12ExamBar" hidden></div>
  <div class="seg" role="tablist" aria-label="Режим">
    <button role="tab" id="x12TabHalf" aria-selected="true">Полусумматор <span class="pill ok" id="x12HalfCnt">—</span></button>
    <button role="tab" id="x12TabFull" aria-selected="false">Полный сумматор <span class="pill ok" id="x12FullCnt">—</span></button>
    <button role="tab" id="x12TabMul" aria-selected="false">4 разряда <span class="pill ok" id="x12MulCnt">0/4</span></button>
  </div>

  <section id="x12Add">
    <div class="t12-grid">
      <div class="card">
        <div class="card-h"><span class="step">1</span><h2 id="x12AddT">Таблица</h2><p id="x12AddS"></p></div>
        <div class="body"><div class="tt-wrap"><table class="tt t12tt" id="x12Tab"></table></div>
          <div class="actions"><button class="btn primary" id="x12CheckT">Проверить таблицу</button><span class="tries" id="x12TTries"></span></div>
          <div class="msg" id="x12TMsg"></div></div>
      </div>
      <div class="card" id="x12FCard">
        <div class="card-h"><span class="step">2</span><h2>Формулы</h2><p>Запиши S и P через переменные таблицы. Посмотри на столбцы: какую знакомую операцию они напоминают?</p></div>
        <div class="body">
          <div class="exprline"><span class="pre">S =</span><input type="text" id="x12FS" spellcheck="false" autocomplete="off" aria-label="Формула S"></div>
          <div class="exprline"><span class="pre">P =</span><input type="text" id="x12FP" spellcheck="false" autocomplete="off" aria-label="Формула P"></div>
          <div class="preview" id="x12FPrev">&nbsp;</div>
          <div class="actions"><button class="btn primary" id="x12CheckF">Проверить формулы</button><span class="tries" id="x12FTries"></span></div>
          <div class="msg" id="x12FMsg"></div>
        </div>
      </div>
    </div>
    <div class="card" id="x12SCard">
      <div class="card-h"><span class="step">3</span><h2>Схема</h2><p id="x12SchS">Нажимай на входы слева: по проводам, где идёт 1, бежит сигнал.</p></div>
      <div class="body"><div class="tt-wrap" id="x12Sch"></div></div>
    </div>
  </section>

  <section id="x12Mul" hidden>
    <div class="card">
      <div class="card-h"><span class="step">+</span><h2>Сложи столбиком</h2><p>Складывай справа налево. В каждом разряде: бит A + бит B + перенос. Сумма по модулю 2 — бит результата, целая часть от деления на 2 — перенос дальше.</p></div>
      <div class="body">
        <div class="tt-wrap"><table class="colsum" id="x12Col"></table></div>
        <div class="ovf"><span>Есть переполнение (результат не помещается в 4 бита)?</span><button class="btn vo" data-v="1">Да</button><button class="btn vo" data-v="0">Нет</button></div>
        <div class="actions"><button class="btn primary" id="x12CheckM">Проверить</button><span class="tries" id="x12MTries"></span></div>
        <div class="msg" id="x12MMsg"></div>
      </div>
    </div>
    <div class="card">
      <div class="card-h"><span class="step">⛓</span><h2>Четырёхразрядный сумматор</h2><p>Четыре полных сумматора соединены цепочкой: перенос из каждого разряда идёт на вход C следующего. Схема покажет сигналы после проверки.</p></div>
      <div class="body"><div class="tt-wrap" id="x12Chain"></div></div>
    </div>
  </section>
</div>
<div class="toast" id="x12Toast"></div>`;

/* ---------- прогресс ---------- */
function summarize(){
  const st=store.get('st',{}),mul=store.get('mul',{});
  if(!Object.keys(st).length&&!Object.keys(mul).length&&!AL.node('n12').touched)return;
  const n=Object.keys(mul).length,ov=Object.values(mul).filter(x=>x==='o').length;
  const mastered=!!st.half&&!!st.full&&n>=4&&ov>=1;
  AL.report('n12',{done:(st.half?1:0)+(st.full?1:0)+Math.min(n,4),total:6,note:`Полусумматор ${st.half?'✓':'—'} · полный ${st.full?'✓':'—'} · сложений ${Math.min(n,4)} из 4`+(n>=4&&!ov?' · нужно хотя бы одно с переполнением':''),mastered,via:mastered?'practice':undefined});
}
const exportData=()=>({s:store.get('st',{}),m:store.get('mul',{})});
function importData(d){if(!d)return;store.set('st',Object.assign({},d.s||{},store.get('st',{})));store.set('mul',Object.assign({},d.m||{},store.get('mul',{})));summarize();if(api)api.refresh()}

let api=null;
function mount(){if(api)return api;document.getElementById('view-t12').innerHTML=MARKUP;api=init();return api}

function init(){
const $=s=>document.querySelector(s);
let log=store.get('log',[]),mode=store.get('mode','half'),st=store.get('st',{}),mul=store.get('mul',{});
let K=null,M=null,EX=null,sim={A:0,B:0,C:0};
function addLog(stage,input,note,id){log.push({t:new Date().toISOString(),seed:id||'—',student:AL.student.get(),stage,input,note});if(log.length>3000)log=log.slice(-3000);store.set('log',log)}
function toast(t){const el=$('#x12Toast');el.textContent=t;el.classList.add('show');clearTimeout(toast.h);toast.h=setTimeout(()=>el.classList.remove('show'),1800)}
function showMsg(sel,cls,html){const el=$(sel);el.className='msg show '+cls;el.innerHTML=html}
function hideMsg(sel){$(sel).className='msg'}
function setHash(h){if(location.hash.slice(1)!==h){try{history.replaceState(null,'','#'+h)}catch(e){location.hash=h}}}
const app=()=>document.querySelector('.app.t12');
const nextBtn=(id,t)=>EX?`<button class="btn primary" id="x12ExNext">${EX.i<EX.tasks.length-1?'Дальше →':'Итог зачёта'}</button>`:id?`<button class="btn primary" id="${id}">${t}</button>`:'';

function setMode(m,push=true){
  mode=m;if(!EX)store.set('mode',m);
  ['Half','Full','Mul'].forEach(x=>$('#x12Tab'+x).setAttribute('aria-selected',m===x.toLowerCase()));
  $('#x12Add').hidden=m==='mul';$('#x12Mul').hidden=m!=='mul';
  if(m==='mul'){if(!M)nextMul()}else if(!K||K.k!==m)loadAdd(m);
  if(push&&!EX)setHash('t12-'+m);renderCounts();
}
function renderCounts(){$('#x12HalfCnt').textContent=st.half?'✓':'—';$('#x12FullCnt').textContent=st.full?'✓':'—';$('#x12MulCnt').textContent=Math.min(Object.keys(mul).length,4)+'/4'}

/* ---------- таблица и формулы ---------- */
function loadAdd(k){
  const done=!!st[k]&&!EX;
  K={k,cells:{S:[],P:[]},marks:null,tOk:done,fOk:done,tDone:false,fDone:false,errors:0};
  const R=rowsOf(k);['S','P'].forEach(o=>K.cells[o]=R.map(r=>done?String(ADD[k].out[o](...r)):''));
  $('#x12FS').value=done?ADD[k].ref.S:'';$('#x12FP').value=done?ADD[k].ref.P:'';
  hideMsg('#x12TMsg');hideMsg('#x12FMsg');sim={A:0,B:0,C:0};
  if(done)showMsg('#x12FMsg','ok',`<b>Сделано.</b> S = ${esc(ADD[k].ref.S)}, P = ${esc(ADD[k].ref.P)}. Поиграй со схемой ниже.`);
  renderAdd();
}
function renderAdd(){
  const D=ADD[K.k],R=rowsOf(K.k);
  $('#x12AddT').textContent=D.title+': таблица';$('#x12AddS').textContent=D.sub;
  const lockT=K.tOk||(EX&&K.tDone);
  $('#x12Tab').innerHTML=`<thead><tr>${D.vars.map(v=>`<th>${v}</th>`).join('')}<th class="sum">сумма</th><th class="f">P</th><th class="f">S</th></tr></thead><tbody>${R.map((r,m)=>`<tr>${r.map(x=>`<td>${x}</td>`).join('')}<td class="sum">${r.reduce((a,b)=>a+b,0)}</td>${['P','S'].map(o=>{const v=K.cells[o][m],mk=K.marks?K.marks[o][m]:'';
    return `<td class="fc"><button class="fbtn${v!==''?' filled':''}${mk?' '+mk:''}" data-o="${o}" data-m="${m}" ${lockT?'disabled':''} aria-label="${o} в строке ${m+1}">${v}</button></td>`}).join('')}</tr>`).join('')}</tbody>`;
  $('#x12CheckT').disabled=lockT;$('#x12TTries').textContent=EX?'Зачёт: одна попытка':K.errors?`Ошибок: ${K.errors}`:'';
  const fReady=K.tOk||(EX&&K.tDone);$('#x12FCard').classList.toggle('locked',!fReady);
  const lockF=K.fOk||(EX&&K.fDone)||!fReady;$('#x12FS').disabled=$('#x12FP').disabled=lockF;$('#x12CheckF').disabled=lockF;
  $('#x12FTries').textContent=EX&&fReady?'Зачёт: одна попытка':'';
  const showSch=K.fOk||(EX&&K.fDone);$('#x12SCard').hidden=!showSch;
  if(showSch)$('#x12Sch').innerHTML=K.k==='half'?halfSVG(sim.A,sim.B):fullSVG(sim.A,sim.B,sim.C);
}
function setCell(o,m,v){if(K.tOk||(EX&&K.tDone))return;K.cells[o][m]=v;K.marks=null;renderAdd()}
function focusCell(o,m){const b=$(`#x12Tab .fbtn[data-o="${o}"][data-m="${m}"]`);b&&b.focus()}
function checkT(){
  const R=rowsOf(K.k);if(['S','P'].some(o=>K.cells[o].some(v=>v===''))){showMsg('#x12TMsg','info','Заполни столбцы P и S целиком.');return}
  K.marks={S:[],P:[]};let bad=null,cnt=0;
  R.forEach((r,m)=>['P','S'].forEach(o=>{const ok=+K.cells[o][m]===ADD[K.k].out[o](...r);K.marks[o][m]=ok?'ok':'bad';if(!ok){cnt++;if(!bad)bad={m,r}}}));
  if(EX){K.tDone=true;EX.cur.t=!cnt;if(cnt)['S','P'].forEach(o=>K.cells[o]=R.map(r=>String(ADD[K.k].out[o](...r))))}
  addLog(EX?'Зачёт':cnt?'Сумматор':'Верно',`${K.k}: P=${K.cells.P.join('')} S=${K.cells.S.join('')}`,cnt?`ошибок ${cnt}`:'таблица верно',K.k);
  if(!cnt){if(!EX)K.tOk=true;showMsg('#x12TMsg','ok','<b>Верно!</b> Столбец «сумма» — это и есть двузначное двоичное число PS. Теперь запиши формулы.')}
  else{if(!EX)K.errors++;const sum=bad.r.reduce((a,b)=>a+b,0);
    showMsg('#x12TMsg','bad',`<b>Ошибка.</b> Неверных клеток: ${cnt}${EX?', правильные значения выставлены':''}. Например, строка ${bad.m+1}: ${bad.r.join(' + ')} = ${sum} = ${(sum).toString(2).padStart(2,'0')}₂, значит P = ${sum>>1}, S = ${sum&1}.`)}
  renderAdd();
}
function updFPrev(){
  const out=[];for(const [id,o] of [['#x12FS','S'],['#x12FP','P']]){const src=$(id).value;if(!src.trim())continue;
    try{out.push(`${o} = ${L.pretty(L.parse(src))}`)}catch(e){if(!(e instanceof L.Err))throw e;out.push(`${o}: ${e.msg}`)}}
  $('#x12FPrev').textContent=out.length?'Читается как: '+out.join(' · '):' ';
}
function checkF(){
  const D=ADD[K.k],R=rowsOf(K.k);const res={};
  for(const [id,o] of [['#x12FS','S'],['#x12FP','P']]){let ast;try{ast=L.parse($(id).value)}catch(e){if(!(e instanceof L.Err))throw e;showMsg('#x12FMsg','info',`Формула ${o} не разобрана: ${esc(e.msg)}. Это не попытка.`);return}
    const extra=[...L.vars(ast)].filter(v=>!D.vars.includes(v));if(extra.length){showMsg('#x12FMsg','info',`Используй только ${D.vars.join(', ')}. Это не попытка.`);return}
    const badRow=R.findIndex(r=>{const e={};D.vars.forEach((v,i)=>e[v]=r[i]);return L.evaluate(ast,e)!==D.out[o](...r)});res[o]={ast,badRow}}
  const ok=res.S.badRow<0&&res.P.badRow<0;
  addLog(EX?'Зачёт':ok?'Верно':'Формулы',`S = ${L.pretty(res.S.ast)}; P = ${L.pretty(res.P.ast)}`,ok?'формулы верно':'ошибка',K.k);
  const nb=EX?nextBtn():'';
  if(EX){K.fDone=true;EX.cur.f=ok;EX.cur.ok=!!(EX.cur.t&&ok);renderExamBar()}
  if(ok){if(!EX){K.fOk=true;st[K.k]=true;store.set('st',st);summarize();renderCounts()}
    showMsg('#x12FMsg','ok',`<b>Верно!</b> ${K.k==='half'?'S — это исключающее ИЛИ, P — конъюнкция: перенос возникает, только когда оба бита равны 1.':'S = A ⊕ B ⊕ C: сумма нечётна. P = 1, когда единиц хотя бы две; схема ниже получает его из двух полусумматоров и элемента ИЛИ.'} Нажимай на входы схемы и следи за сигналами.${nb?`<div class="actions">${nb}</div>`:''}`)}
  else{const o=res.S.badRow>=0?'S':'P',r=R[res[o].badRow];
    showMsg('#x12FMsg','bad',`<b>Не совпадает.</b> Формула ${o} ошибается при ${D.vars.map((v,i)=>v+' = '+r[i]).join(', ')}: нужно ${o} = ${D.out[o](...r)}.${EX?' Эталон: S = '+esc(D.ref.S)+', P = '+esc(D.ref.P)+'.':''}${nb?`<div class="actions">${nb}</div>`:''}`)}
  renderAdd();
}

/* ---------- многоразрядное сложение ---------- */
function nextMul(forceOvf){
  if(forceOvf===undefined)forceOvf=Math.random()<.5;
  let A,B,r;for(let g=0;g<200;g++){A=1+Math.floor(Math.random()*15);B=1+Math.floor(Math.random()*15);r=addBits(A,B);const nc=r.c.filter(Boolean).length;
    if(nc<2)continue;if(forceOvf===true&&!r.c[4])continue;if(forceOvf===false&&r.c[4])continue;break}
  M={A,B,r,c:['','','','',''],s:['','','',''],ovf:null,marks:null,done:false,errors:0};hideMsg('#x12MMsg');renderMul();
}
function renderMul(){
  const lock=M.done;
  const cell=(arr,i,cls,lab)=>`<td><input class="ci ${cls}${M.marks&&M.marks[cls+i]?' '+M.marks[cls+i]:''}" data-a="${cls}" data-i="${i}" value="${esc(arr[i])}" maxlength="1" inputmode="numeric" ${lock?'disabled':''} aria-label="${lab}"></td>`;
  $('#x12Col').innerHTML=`<tbody>
    <tr class="cr"><th>перенос</th>${[4,3,2,1].map(i=>cell(M.c,i,'c',`перенос в разряд ${i}`)).join('')}<td class="z">0</td></tr>
    <tr><th>A = ${M.A}</th><td></td>${[3,2,1,0].map(k=>`<td class="d">${(M.A>>k)&1}</td>`).join('')}</tr>
    <tr class="pl"><th>B = ${M.B}</th><td class="op">+</td>${[3,2,1,0].map(k=>`<td class="d">${(M.B>>k)&1}</td>`).join('')}</tr>
    <tr class="res"><th>сумма</th><td class="d c4">${M.c[4]===''?'':M.c[4]}</td>${[3,2,1,0].map(k=>cell(M.s,k,'s',`бит суммы ${k}`)).join('')}</tr>
    <tr class="idx"><th></th><td>4</td><td>3</td><td>2</td><td>1</td><td>0</td></tr></tbody>`;
  document.querySelectorAll('#x12Mul .vo').forEach(b=>{b.classList.toggle('sel',M.ovf===b.dataset.v);b.disabled=lock});
  $('#x12CheckM').disabled=lock;$('#x12MTries').textContent=EX?'Зачёт: одна попытка':M.errors?`Ошибок: ${M.errors}`:'';
  $('#x12Chain').innerHTML=chainSVG(M.A,M.B,M.done?M.r.c:[0,0,0,0,0],M.done?M.r.s:[0,0,0,0]);
}
function checkMul(){
  if(M.c.slice(1).some(v=>v==='')||M.s.some(v=>v==='')){showMsg('#x12MMsg','info','Заполни все переносы и биты суммы. Где переноса нет, пиши 0.');return}
  if(M.ovf===null){showMsg('#x12MMsg','info','Ответь, есть ли переполнение.');return}
  M.marks={};let first=null;
  for(let k=0;k<4;k++){const okS=+M.s[k]===M.r.s[k],okC=+M.c[k+1]===M.r.c[k+1];M.marks['s'+k]=okS?'ok':'bad';M.marks['c'+(k+1)]=okC?'ok':'bad';if((!okS||!okC)&&first==null)first=k}
  const ovOk=(M.ovf==='1')===!!M.r.c[4];const ok=first==null&&ovOk;
  const total=M.A+M.B,res=`${M.A} + ${M.B} = ${total} = ${total.toString(2)}₂`;
  addLog(EX?'Зачёт':ok?'Верно':'Сложение',`${b4(M.A)} + ${b4(M.B)}: c=${M.c.slice(1).reverse().join('')} s=${M.s.slice().reverse().join('')} переполнение=${M.ovf}`,ok?'верно':`ошибка${first!=null?' в разряде '+first:' в переполнении'}`,'сложение');
  let why='';
  if(first!=null){const k=first,t=((M.A>>k)&1)+((M.B>>k)&1)+M.r.c[k];why=`Разряд ${k}: ${(M.A>>k)&1} + ${(M.B>>k)&1} + перенос ${M.r.c[k]} = ${t} = ${t.toString(2).padStart(2,'0')}₂, значит бит суммы ${t&1}, перенос дальше ${t>>1}.`}
  else if(!ovOk)why=`Перенос из старшего разряда равен ${M.r.c[4]}: ${M.r.c[4]?'результат пятибитный, в 4 бита не помещается — это переполнение':'результат помещается в 4 бита'}.`;
  if(EX){M.done=true;EX.cur.ok=ok;renderExamBar();showMsg('#x12MMsg',ok?'ok':'bad',`<b>${ok?'Верно.':'Ошибка.'}</b> ${esc(res)}. ${esc(why)}<div class="actions">${nextBtn()}</div>`)}
  else if(ok){M.done=true;mul[`${M.A}+${M.B}`]=M.r.c[4]?'o':'n';store.set('mul',mul);summarize();renderCounts();
    showMsg('#x12MMsg','ok',`<b>Верно!</b> ${esc(res)}.${M.r.c[4]?' Пятый бит — перенос из старшего разряда: 4-битный сумматор его теряет, это переполнение.':''}<div class="actions"><button class="btn primary" id="x12MNext">Следующий пример →</button></div>`)}
  else{M.errors++;showMsg('#x12MMsg','bad',`<b>Ошибка.</b> ${esc(why)}`)}
  renderMul();
}

/* ---------- зачёт: полный сумматор (таблица + формулы) и два сложения ---------- */
function startExam(){EX={tasks:['full','mul','mul'],i:0,res:[],cur:{},done:false};addLog('Зачёт','—','Начат зачёт','зачёт');app().classList.add('exam');showTask()}
function showTask(){const t=EX.tasks[EX.i];EX.cur={};setMode(t,false);if(t==='full')loadAdd('full');else nextMul(EX.i===1?true:false);renderExamBar();window.scrollTo(0,0)}
function renderExamBar(){
  const bar=$('#x12ExamBar');if(!EX){bar.hidden=true;app().classList.remove('exam');return}
  bar.hidden=false;
  bar.innerHTML=`<div class="ex-t"><b>Зачёт по теме 12</b><span>${EX.done?'Зачёт завершён':`Задание ${EX.i+1} из ${EX.tasks.length}`} · одна попытка на каждый шаг</span></div>
    <div class="ex-dots">${EX.tasks.map((t,i)=>`<span class="ex-dot ${i<EX.res.length?(EX.res[i]?'ok':'bad'):i===EX.i?'now':''}"></span>`).join('')}</div>
    <button class="btn ghost" id="x12ExQuit">${EX.done?'Закрыть зачёт':'Прервать зачёт'}</button>`;
}
function examNext(){
  EX.res.push(EX.cur.ok===true);
  if(EX.i<EX.tasks.length-1){EX.i++;showTask();return}
  EX.done=true;const k=EX.res.filter(Boolean).length,n=EX.tasks.length;renderExamBar();
  const sel=mode==='mul'?'#x12MMsg':'#x12FMsg';
  if(k===n){AL.report('n12',{mastered:true,via:'exam'});addLog('Верно','зачёт',`Зачёт сдан: ${k} из ${n}`,'зачёт');
    showMsg(sel,'ok',`<b>Зачёт сдан: ${k} из ${n}.</b> Тема 12 засчитана, открылась тема 13 «Триггер».<div class="actions"><a class="btn primary" href="#map">На карту навыков</a><button class="btn" id="x12ExStay">Остаться в тренажёре</button></div>`)}
  else{addLog('Зачёт','—',`Не сдан: ${k} из ${n}`,'зачёт');
    showMsg(sel,'bad',`<b>Зачёт не сдан: верно ${k} из ${n}.</b> Потренируйся и попробуй снова.<div class="actions"><button class="btn primary" id="x12ExRetry">Сдать ещё раз</button><button class="btn" id="x12ExStay">Тренироваться</button></div>`)}
}
function stopExam(){if(EX&&!EX.done)addLog('Зачёт','—',`Прерван на задании ${EX.i+1}`,'зачёт');EX=null;renderExamBar();K=null;M=null;setMode(store.get('mode','half'))}

/* ---------- события ---------- */
['Half','Full','Mul'].forEach(x=>$('#x12Tab'+x).onclick=()=>{if(EX)return toast('Сначала закончи или прерви зачёт');setMode(x.toLowerCase())});
$('#x12Tab').addEventListener('click',e=>{const f=e.target.closest('.fbtn');if(!f||f.disabled)return;const o=f.dataset.o,m=+f.dataset.m,v=K.cells[o][m];setCell(o,m,v===''?'1':v==='1'?'0':'1');focusCell(o,m)});
$('#x12Tab').addEventListener('keydown',e=>{const f=e.target.closest('.fbtn');if(!f||f.disabled)return;const o=f.dataset.o,m=+f.dataset.m,N=rowsOf(K.k).length;
  if(e.key==='0'||e.key==='1'){e.preventDefault();setCell(o,m,e.key);if(m<N-1)focusCell(o,m+1);else if(o==='P')focusCell('S',0);else focusCell(o,m)}
  else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();focusCell(o,Math.max(0,Math.min(N-1,m+(e.key==='ArrowDown'?1:-1))))}
  else if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();focusCell(e.key==='ArrowRight'?'S':'P',m)}
  else if(e.key==='Enter'){e.preventDefault();checkT()}});
$('#x12CheckT').onclick=checkT;$('#x12CheckF').onclick=checkF;
['#x12FS','#x12FP'].forEach(id=>{$(id).addEventListener('input',updFPrev);$(id).addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();checkF()}})});
$('#x12Sch').addEventListener('click',e=>{const g=e.target.closest('.inb');if(!g)return;sim[g.dataset.in]^=1;renderAdd();const ng=$(`#x12Sch .inb[data-in="${g.dataset.in}"]`);ng&&ng.focus()});
$('#x12Sch').addEventListener('keydown',e=>{const g=e.target.closest('.inb');if(g&&(e.key==='Enter'||e.key===' ')){e.preventDefault();sim[g.dataset.in]^=1;renderAdd();const ng=$(`#x12Sch .inb[data-in="${g.dataset.in}"]`);ng&&ng.focus()}});
$('#x12Col').addEventListener('input',e=>{const i=e.target.closest('.ci');if(!i)return;const v=i.value.replace(/[^01]/g,'').slice(-1);i.value=v;(i.dataset.a==='c'?M.c:M.s)[+i.dataset.i]=v;M.marks=null;
  if(i.dataset.a==='c'&&+i.dataset.i===4){const c4=$('#x12Col .c4');if(c4)c4.textContent=v}
  i.classList.remove('bad','ok');
  // переход: из бита суммы k — к переносу k+1, из переноса — к биту суммы того же разряда
  if(v!==''){const k=+i.dataset.i;const nx=i.dataset.a==='s'?$(`#x12Col .ci[data-a="c"][data-i="${k+1}"]`):$(`#x12Col .ci[data-a="s"][data-i="${k}"]`);if(nx&&nx.value==='')nx.focus()}});
document.querySelectorAll('#x12Mul .vo').forEach(b=>b.onclick=()=>{if(M.done)return;M.ovf=b.dataset.v;renderMul()});
$('#x12CheckM').onclick=checkMul;
const onMsg=e=>{if(e.target.id==='x12MNext')nextMul();if(e.target.id==='x12ExNext')examNext();if(e.target.id==='x12ExRetry')startExam();if(e.target.id==='x12ExStay')stopExam()};
['#x12TMsg','#x12FMsg','#x12MMsg'].forEach(s=>$(s).addEventListener('click',onMsg));
$('#x12ExamBar').addEventListener('click',e=>{if(e.target.id==='x12ExQuit')stopExam()});
$('#x12Student').value=AL.student.get();
$('#x12Student').addEventListener('input',()=>AL.student.set($('#x12Student').value));
AL.on('student',v=>{if(document.activeElement!==$('#x12Student'))$('#x12Student').value=v});
$('#x12Log').onclick=()=>AL.openLog&&AL.openLog();

function enter(arg){
  if(arg==='exam'){startExam();return}
  if(EX&&EX.done&&!arg){stopExam();return}
  if(EX)return;
  setMode(['half','full','mul'].includes(arg)?arg:mode,true);
}
function refresh(){st=store.get('st',{});mul=store.get('mul',{});renderCounts()}
return {enter,refresh};
}

AL.register('t12',{title:'Сумматор',logRows:()=>store.get('log',[]),exportData,importData,enter:arg=>mount().enter(arg)});
summarize();
})();
