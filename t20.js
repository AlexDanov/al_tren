/* Тренажёр ЕГЭ №2: фрагмент таблицы истинности с перепутанными столбцами — определить, какой столбец какой переменной соответствует.
   Генератор проверяет перебором, что ответ единственный. */
(()=>{
const store=AL.store.scoped('t20');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function xmur3(str){let h=1779033703^str.length;for(let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353);h=h<<13|h>>>19}
  return()=>{h=Math.imul(h^(h>>>16),2246822507);h=Math.imul(h^(h>>>13),3266489909);return(h^=h>>>16)>>>0}}
function mulberry32(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function normSeed(raw,lvl){let s=String(raw||'').toUpperCase().replace(/[^A-Z0-9-]/g,'').replace(/^-+|-+$/g,'');if(!s)return null;if(!/^[123]-./.test(s))s=lvl+'-'+s;return s.slice(0,24)}
function randomSeed(lvl){const A='ABCDEFGHJKMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<5;i++)s+=A[Math.floor(Math.random()*A.length)];return lvl+'-'+s}

/* ---------- формулы над w, x, y, z ---------- */
const SY={and:'∧',or:'∨',imp:'→',eq:'≡',xor:'⊕'};
const FN={and:(a,b)=>a&b,or:(a,b)=>a|b,imp:(a,b)=>(1-a)|b,eq:(a,b)=>+(a===b),xor:(a,b)=>a^b};
const ev=(n,e)=>n.op==='v'?e[n.n]:n.op==='not'?1-ev(n.a,e):FN[n.op](ev(n.a,e),ev(n.b,e));
const show=(n,top)=>n.op==='v'?n.n:n.op==='not'?'¬'+show(n.a):(top?'':'(')+show(n.a)+' '+SY[n.op]+' '+show(n.b)+(top?'':')');
function showF(F){return F.terms.map(t=>show(t)).join(' '+SY[F.top]+' ')}
const evF=(F,e)=>F.terms.map(t=>ev(t,e)).reduce((a,b)=>FN[F.top](a,b));
function perms(a){if(a.length<2)return [a];const out=[];a.forEach((x,i)=>perms(a.filter((_,j)=>j!==i)).forEach(p=>out.push([x,...p])));return out}

/* существует ли заполнение пропусков: каждая строка даёт своё F, все строки различны */
function consistent(F,vars,perm,rows,fv){
  const opts=rows.map((r,i)=>{const blanks=r.map((v,j)=>v==null?j:-1).filter(j=>j>=0);const out=[];
    for(let m=0;m<1<<blanks.length;m++){const full=r.slice();blanks.forEach((j,k)=>full[j]=(m>>k)&1);const e={};perm.forEach((v,j)=>e[v]=full[j]);if(evF(F,e)===fv[i])out.push(full.join(''))}return out});
  const pick=(i,used)=>{if(i===opts.length)return [];for(const o of opts[i]){if(used.has(o))continue;used.add(o);const r=pick(i+1,used);if(r)return [o,...r];used.delete(o)}return null};
  return pick(0,new Set());
}
function rowOk(F,perm,r,f){const blanks=r.map((v,j)=>v==null?j:-1).filter(j=>j>=0);for(let m=0;m<1<<blanks.length;m++){const full=r.slice();blanks.forEach((j,k)=>full[j]=(m>>k)&1);const e={};perm.forEach((v,j)=>e[v]=full[j]);if(evF(F,e)===f)return true}return false}

function generate(seed){
  const lvl=+seed[0]||1;
  for(let att=0;att<2000;att++){
    const r=mulberry32(xmur3(seed+'#'+att)());const pick=a=>a[Math.floor(r()*a.length)];
    const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
    const vars=lvl===1?['x','y','z']:['w','x','y','z'];
    const top=r()<.6?'or':'and';
    const nT=lvl===1?2+Math.floor(r()*2):3+Math.floor(r()*2);
    const lit=v=>r()<.35?{op:'not',a:{op:'v',n:v}}:{op:'v',n:v};
    const terms=[];const pool=shuf(vars);
    for(let i=0;i<nT;i++){
      if(r()<.3){terms.push(lit(pool[i%pool.length]))}
      else{const a=pool[i%pool.length];let b=pick(vars);while(b===a)b=pick(vars);
        let t={op:pick(['and','imp','eq','or','xor','imp']),a:lit(a),b:lit(b)};
        // внутри дизъюнкции ∨ не нужен, внутри конъюнкции — ∧
        if(t.op===top)t.op=top==='or'?'and':'or';if(r()<.15)t={op:'not',a:t};terms.push(t)}
    }
    const F={top,terms};
    const used=new Set();const walk=n=>{if(n.op==='v')used.add(n.n);if(n.a)walk(n.a);if(n.b)walk(n.b)};terms.forEach(walk);if(used.size<vars.length)continue;
    const all=[...Array(1<<vars.length).keys()].map(m=>vars.map((v,i)=>(m>>(vars.length-1-i))&1));
    const fval=top==='or'?0:1;
    let cand=all.filter(a=>{const e={};vars.forEach((v,i)=>e[v]=a[i]);return evF(F,e)===fval});
    const nRows=3;
    if(cand.length<nRows||cand.length>(lvl===1?4:7))continue;
    let fv=Array(nRows).fill(fval);
    let rows=shuf(cand).slice(0,nRows);
    if(lvl===3&&r()<.4){const other=all.filter(a=>{const e={};vars.forEach((v,i)=>e[v]=a[i]);return evF(F,e)!==fval});if(other.length){rows[2]=pick(other);fv[2]=1-fval}}
    const perm=shuf(vars);   // perm[j] — переменная в столбце j
    let frag=rows.map(a=>perm.map(v=>a[vars.indexOf(v)]));
    const nb=lvl===1?Math.floor(r()*2):lvl===2?2+Math.floor(r()*2):4+Math.floor(r()*3);
    const cells=[];frag.forEach((rw,i)=>rw.forEach((_,j)=>cells.push([i,j])));const cs=shuf(cells);cells.length=0;cells.push(...cs);
    cells.slice(0,nb).forEach(([i,j])=>frag[i][j]=null);
    if(frag.some(rw=>rw.every(v=>v==null)))continue;
    const ok=perms(vars).filter(p=>consistent(F,vars,p,frag,fv));
    if(ok.length!==1)continue;
    if(ok[0].join('')!==perm.join(''))continue;
    // строки в порядке, как в задании ЕГЭ: без сортировки
    return {seed,level:lvl,vars,F,frag,fv,perm,fill:consistent(F,vars,perm,frag,fv).map(s=>[...s].map(Number))};
  }
  return null;
}

const MARKUP=`<div class="app t20">
  <header class="top">
    <div class="brand">
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><rect x="4" y="8" width="32" height="24" rx="3" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2.2"/><path d="M12 8v24M20 8v24M28 8v24M4 16h32" stroke="var(--ink)" stroke-width="1.4"/><text x="8" y="14.5" text-anchor="middle" font-family="JetBrains Mono,monospace" font-weight="700" font-size="7" fill="var(--accent)">?</text><text x="16" y="14.5" text-anchor="middle" font-family="JetBrains Mono,monospace" font-weight="700" font-size="7" fill="var(--accent)">?</text><text x="24" y="14.5" text-anchor="middle" font-family="JetBrains Mono,monospace" font-weight="700" font-size="7" fill="var(--accent)">?</text></svg>
      <div><a class="back" href="#map">← Карта навыков</a><h1>ЕГЭ №2</h1><p>Фрагмент таблицы истинности с перепутанными столбцами</p></div>
    </div>
    <div class="controls">
      <div class="field"><label for="x20Student">Ученик</label><input type="text" id="x20Student" placeholder="Фамилия Имя" autocomplete="off"></div>
      <div class="field x20-pr"><label for="x20Seed">Задание №</label><div class="row"><input type="text" id="x20Seed" class="seedin" spellcheck="false" autocomplete="off"><button class="btn" id="x20Open">Открыть</button></div></div>
      <div class="field x20-pr"><label for="x20Level">Уровень</label><div class="row"><select id="x20Level"><option value="1">1 · x, y, z без пропусков</option><option value="2">2 · w, x, y, z, есть пропуски</option><option value="3">3 · много пропусков</option></select><button class="btn primary" id="x20New">Новое задание</button></div></div>
      <button class="btn" id="x20Log">Журнал</button>
    </div>
  </header>
  <div class="exam-bar" id="x20ExamBar" hidden></div>
  <div class="status" id="x20Status"></div>
  <div class="t20-grid">
    <div class="card">
      <div class="card-h"><span class="step">1</span><h2>Условие</h2></div>
      <div class="body"><p class="cond" id="x20Cond"></p><div class="f20" id="x20F"></div>
        <p class="tries">Какому столбцу соответствует каждая переменная? В ответе напишите буквы в том порядке, в котором идут столбцы.</p></div>
    </div>
    <aside class="card">
      <div class="card-h"><span class="step">i</span><h2>Как рассуждать</h2></div>
      <div class="body">
        <p>Если F — дизъюнкция (∨) и в таблице F = 0, то <b>каждая скобка равна 0</b>. Если F — конъюнкция (∧) и F = 1, то <b>каждая скобка равна 1</b>. Это сразу задаёт значения или связи переменных.</p>
        <p>Ищи переменную, значение которой определено однозначно (например, ¬w = 0 → w = 1), и столбец, где это значение стоит во всех строках.</p>
        <p>Пустые клетки можно заполнить как угодно, но строки должны остаться различными.</p>
      </div>
    </aside>
  </div>
  <div class="card">
    <div class="card-h"><span class="step">2</span><h2>Подпиши столбцы</h2><p>Выбери над каждым столбцом переменную. Каждая переменная — ровно в одном столбце.</p></div>
    <div class="body">
      <label class="hl-t x20-pr"><input type="checkbox" id="x20Live" checked> Проверять строки на лету (без проверки задание засчитывается «чисто»)</label>
      <div class="tt-wrap"><table class="tt t20tt" id="x20T"></table></div>
      <p class="ansline" id="x20Ans"></p>
      <div class="actions"><button class="btn primary" id="x20Check">Проверить ответ</button><span class="tries" id="x20Tries"></span></div>
      <div class="msg" id="x20Msg"></div>
      <div class="tt-wrap" id="x20Expl"></div>
    </div>
  </div>
</div>
<div class="toast" id="x20Toast"></div>`;

/* ---------- прогресс ---------- */
function summarize(){
  const prog=store.get('progress',{});
  if(!Object.keys(prog).length&&!AL.node('e2').touched)return;
  const sol=Object.entries(prog).filter(([k,p])=>p.ok),hi=sol.filter(([k])=>+k[0]>=2).length,clean=sol.filter(([k,p])=>p.clean).length,n=Math.min(sol.length,4);
  const mastered=sol.length>=4&&hi>=2&&clean>=2;
  AL.report('e2',{done:n,total:4,note:`Решено ${n} из 4`+(n>=2&&hi<2?` · уровня 2–3: ${hi} из 2`:'')+(n>=4&&clean<2?` · без проверки на лету: ${clean} из 2`:''),mastered,via:mastered?'practice':undefined});
}
function exportData(){const prog=store.get('progress',{}),o={};Object.entries(prog).slice(-300).forEach(([k,p])=>o[k]=[p.ok?1:0,p.clean?1:0,p.tries||0,p.first||'']);return {p:o}}
function importData(d){if(!d)return;const prog=store.get('progress',{});
  for(const [k,a] of Object.entries(d.p||{})){const c=prog[k]||(prog[k]={ok:false,clean:false,tries:0,first:a[3]||new Date().toISOString()});c.ok=c.ok||!!a[0];c.clean=c.clean||!!a[1];c.tries=Math.max(c.tries,a[2]||0)}
  store.set('progress',prog);summarize();if(api)api.refresh()}

let api=null;
function mount(){if(api)return api;document.getElementById('view-t20').innerHTML=MARKUP;api=init();return api}

function init(){
const $=s=>document.querySelector(s);
let progress=store.get('progress',{}),log=store.get('log',[]),level=store.get('level',2),live=store.get('live',true);
let T=null,EX=null;
const saveP=()=>store.set('progress',progress);
const P=seed=>progress[seed]||(progress[seed]={ok:false,clean:false,tries:0,first:new Date().toISOString()});
function addLog(stage,input,note){log.push({t:new Date().toISOString(),seed:T?T.seed:'—',student:AL.student.get(),stage,input,note});if(log.length>3000)log=log.slice(-3000);store.set('log',log)}
function toast(t){const el=$('#x20Toast');el.textContent=t;el.classList.add('show');clearTimeout(toast.h);toast.h=setTimeout(()=>el.classList.remove('show'),1800)}
function showMsg(sel,cls,html){const el=$(sel);el.className='msg show '+cls;el.innerHTML=html}
function hideMsg(sel){$(sel).className='msg'}
function setHash(h){if(location.hash.slice(1)!==h){try{history.replaceState(null,'','#'+h)}catch(e){location.hash=h}}}
const app=()=>document.querySelector('.app.t20');
const liveOn=()=>live&&!EX&&!(T&&T.done);

function loadSeed(seed,push=true){
  const g=generate(seed);if(!g){toast('По этому номеру задание не строится');return}
  T=Object.assign(g,{sel:g.vars.map(()=>''),done:false,answered:false,usedLive:false});
  level=T.level;$('#x20Level').value=String(level);$('#x20Seed').value=seed;
  if(!EX)store.set('last',seed);if(push&&!EX)setHash('t20-'+seed);
  hideMsg('#x20Msg');$('#x20Expl').innerHTML='';$('#x20Live').checked=live;
  const p=P(T.seed);if(p.ok&&!EX){T.done=true;T.sel=T.perm.slice();showMsg('#x20Msg','ok',`<b>Решено.</b> Ответ: ${T.perm.join('')}.<div class="actions"><button class="btn primary" id="x20NextSeed">Новое задание →</button></div>`);renderExpl()}
  render();
}
function render(){
  const n=T.vars.length,names=T.vars.join(', ');
  $('#x20Cond').textContent=`Миша заполнял таблицу истинности логической функции F, но успел заполнить лишь фрагмент из трёх различных её строк${T.frag.some(r=>r.some(v=>v==null))?', причём часть клеток осталась пустой':''}, даже не указав, какому столбцу таблицы соответствует каждая из переменных ${names}.`;
  $('#x20F').innerHTML=`<span class="en">F</span> = ${esc(showF(T.F))}`;
  const lock=T.done||T.answered,lv=liveOn();if(lv)T.usedLive=true;
  const dup=new Set(T.sel.filter((v,i)=>v&&T.sel.indexOf(v)!==i));
  const full=T.sel.every(Boolean)&&!dup.size;
  let h=`<thead><tr>${T.sel.map((v,j)=>`<th><select class="vs${dup.has(v)?' dup':''}" data-j="${j}" ${lock?'disabled':''} aria-label="Переменная столбца ${j+1}"><option value="">?</option>${T.vars.map(x=>`<option value="${x}" ${v===x?'selected':''}>${x}</option>`).join('')}</select></th>`).join('')}<th class="f">F</th>${lv?'<th class="lv">строка</th>':''}</tr></thead><tbody>`;
  T.frag.forEach((r,i)=>{const st=lv&&full?(rowOk(T.F,T.sel,r,T.fv[i])?'ok':'bad'):'';
    h+=`<tr class="${st}">${r.map(v=>`<td class="${v==null?'blank':''}">${v==null?'':v}</td>`).join('')}<td class="fv">${T.fv[i]}</td>${lv?`<td class="lv">${!full?'':st==='ok'?'✓ возможно':'✗ не подходит'}</td>`:''}</tr>`});
  $('#x20T').innerHTML=h+'</tbody>';
  $('#x20Ans').innerHTML=`Ответ: <b>${T.sel.map(v=>v||'?').join('')}</b>${dup.size?` <span class="no">— переменная ${[...dup].join(', ')} выбрана дважды</span>`:''}`;
  $('#x20Check').disabled=lock;
  const p=P(T.seed),chip=(c,t)=>`<span class="chip ${c}"><span class="dot"></span>${t}</span>`;
  $('#x20Tries').textContent=EX?'Зачёт: одна попытка, без проверки на лету':`Попыток: ${p.tries}${p.ok?(p.clean?' · сдано чисто':' · сдано'):''}`;
  $('#x20Status').innerHTML=chip(p.ok?'ok':'',p.ok?'Решено':'Не решено')+'<span class="spacer"></span>'+chip('',`Уровень <b>${T.level}</b> · переменных <b>${n}</b> · пустых клеток <b>${T.frag.flat().filter(v=>v==null).length}</b>`);
}
function renderExpl(){
  // развёрнутая таблица: столбцы в порядке ответа, пропуски заполнены, значения скобок
  const terms=T.F.terms;
  $('#x20Expl').innerHTML=`<table class="tt t20x"><thead><tr>${T.perm.map(v=>`<th>${v}</th>`).join('')}${terms.map(t=>`<th class="st">${esc(show(t,true))}</th>`).join('')}<th class="f">F</th></tr></thead><tbody>${T.fill.map((r,i)=>{const e={};T.perm.forEach((v,j)=>e[v]=r[j]);
    return `<tr>${r.map((v,j)=>`<td class="${T.frag[i][j]==null?'filled':''}">${v}</td>`).join('')}${terms.map(t=>`<td class="stv">${ev(t,e)}</td>`).join('')}<td class="fv">${T.fv[i]}</td></tr>`}).join('')}</tbody></table>
    <p class="tries">Подчёркнуты значения, которыми можно заполнить пустые клетки. Для ${T.F.top==='or'?'дизъюнкции F = 0 все скобки равны 0':'конъюнкции F = 1 все скобки равны 1'}${T.fv.some(f=>f!==T.fv[0])?' (кроме строки с другим значением F)':''}.</p>`;
}
function check(){
  if(T.done||T.answered)return;
  if(!T.sel.every(Boolean)){showMsg('#x20Msg','info','Подпиши все столбцы.');return}
  if(new Set(T.sel).size<T.sel.length){showMsg('#x20Msg','info','Каждая переменная должна стоять ровно в одном столбце.');return}
  const ans=T.sel.join(''),right=T.perm.join(''),ok=ans===right;const p=P(T.seed);if(!EX)p.tries++;
  const clean=!T.usedLive;
  addLog(EX?'Зачёт':ok?'Верно':'ЕГЭ 2',ans,ok?(clean?'верно без проверки на лету':'верно'):'верно '+right);
  let why='';
  if(!ok){const bad=T.frag.findIndex((r,i)=>!rowOk(T.F,T.sel,r,T.fv[i]));
    why=bad>=0?`При такой подписи строка ${bad+1} не может дать F = ${T.fv[bad]}: как ни заполняй пустые клетки, значение будет другим.`:'Каждая строка по отдельности подходит, но тогда две строки совпадут — а в условии они различны.'}
  if(EX){T.answered=true;EX.cur.ok=ok;renderExamBar();renderExpl();showMsg('#x20Msg',ok?'ok':'bad',`<b>${ok?'Верно.':'Неверно.'}</b> Ответ: ${right}. ${esc(why)}<div class="actions"><button class="btn primary" id="x20ExNext">${EX.i<EX.tasks.length-1?'Дальше →':'Итог зачёта'}</button></div>`)}
  else if(ok){p.ok=true;if(clean)p.clean=true;T.done=true;renderExpl();showMsg('#x20Msg','ok',`<b>Верно!</b> Ответ: ${right}.${clean?' Решено без проверки на лету.':''}<div class="actions"><button class="btn primary" id="x20NextSeed">Новое задание →</button></div>`)}
  else showMsg('#x20Msg','bad',`<b>Неверно.</b> ${esc(why)}${p.tries>=2?` Подсказка: ${T.F.top==='or'?'при F = 0 каждая скобка дизъюнкции равна 0':'при F = 1 каждая скобка конъюнкции равна 1'} — начни с той, что сразу задаёт значение переменной.`:''}`);
  saveP();render();summarize();
}

/* ---------- зачёт: уровень 2 и уровень 3, без проверки на лету ---------- */
function startExam(){EX={tasks:[randomSeed(2),randomSeed(3),randomSeed(2)],i:0,res:[],cur:{},done:false};addLog('Зачёт','—','Начат зачёт: '+EX.tasks.join(', '));app().classList.add('exam');showTask()}
function showTask(){EX.cur={};loadSeed(EX.tasks[EX.i],false);renderExamBar();window.scrollTo(0,0)}
function renderExamBar(){
  const bar=$('#x20ExamBar');if(!EX){bar.hidden=true;app().classList.remove('exam');return}
  bar.hidden=false;
  bar.innerHTML=`<div class="ex-t"><b>Зачёт по ЕГЭ №2</b><span>${EX.done?'Зачёт завершён':`Задание ${EX.i+1} из ${EX.tasks.length}`} · без проверки на лету, одна попытка</span></div>
    <div class="ex-dots">${EX.tasks.map((t,i)=>`<span class="ex-dot ${i<EX.res.length?(EX.res[i]?'ok':'bad'):i===EX.i?'now':''}"></span>`).join('')}</div>
    <button class="btn ghost" id="x20ExQuit">${EX.done?'Закрыть зачёт':'Прервать зачёт'}</button>`;
}
function examNext(){
  EX.res.push(EX.cur.ok===true);
  if(EX.i<EX.tasks.length-1){EX.i++;showTask();return}
  EX.done=true;const k=EX.res.filter(Boolean).length,n=EX.tasks.length;renderExamBar();
  if(k===n){AL.report('e2',{mastered:true,via:'exam'});addLog('Верно','зачёт',`Зачёт сдан: ${k} из ${n}`);
    showMsg('#x20Msg','ok',`<b>Зачёт сдан: ${k} из ${n}.</b> Задание №2 засчитано.<div class="actions"><a class="btn primary" href="#map">На карту навыков</a><button class="btn" id="x20ExStay">Остаться в тренажёре</button></div>`)}
  else{addLog('Зачёт','—',`Не сдан: ${k} из ${n}`);
    showMsg('#x20Msg','bad',`<b>Зачёт не сдан: верно ${k} из ${n}.</b> Потренируйся и попробуй снова.<div class="actions"><button class="btn primary" id="x20ExRetry">Сдать ещё раз</button><button class="btn" id="x20ExStay">Тренироваться</button></div>`)}
}
function stopExam(){if(EX&&!EX.done)addLog('Зачёт','—',`Прерван на задании ${EX.i+1}`);EX=null;renderExamBar();T=null;loadSeed(store.get('last',null)||randomSeed(level))}

/* ---------- события ---------- */
$('#x20T').addEventListener('change',e=>{const s=e.target.closest('.vs');if(!s)return;T.sel[+s.dataset.j]=s.value;hideMsg('#x20Msg');render();const ns=$(`#x20T .vs[data-j="${s.dataset.j}"]`);ns&&ns.focus()});
$('#x20Live').onchange=()=>{live=$('#x20Live').checked;store.set('live',live);render()};
$('#x20Check').onclick=check;
$('#x20Msg').addEventListener('click',e=>{if(e.target.id==='x20NextSeed')loadSeed(randomSeed(level));if(e.target.id==='x20ExNext')examNext();if(e.target.id==='x20ExRetry')startExam();if(e.target.id==='x20ExStay')stopExam()});
$('#x20ExamBar').addEventListener('click',e=>{if(e.target.id==='x20ExQuit')stopExam()});
$('#x20New').onclick=()=>loadSeed(randomSeed(+$('#x20Level').value));
$('#x20Level').onchange=()=>{level=+$('#x20Level').value;store.set('level',level)};
const openSeed=()=>{const s=normSeed($('#x20Seed').value,+$('#x20Level').value);if(!s){toast('Введи номер задания');return}loadSeed(s)};
$('#x20Open').onclick=openSeed;$('#x20Seed').addEventListener('keydown',e=>{if(e.key==='Enter')openSeed()});
$('#x20Student').value=AL.student.get();
$('#x20Student').addEventListener('input',()=>AL.student.set($('#x20Student').value));
AL.on('student',v=>{if(document.activeElement!==$('#x20Student'))$('#x20Student').value=v});
$('#x20Log').onclick=()=>AL.openLog&&AL.openLog();

function enter(arg){
  if(arg==='exam'){startExam();return}
  if(EX&&EX.done&&!arg){stopExam();return}
  if(EX)return;
  const s=arg?normSeed(arg,level):null;
  if(s){if(!T||T.seed!==s)loadSeed(s,false);return}
  if(!T)loadSeed(store.get('last',null)||randomSeed(level));else setHash('t20-'+T.seed);
}
function refresh(){progress=store.get('progress',{});if(T&&!EX)render()}
$('#x20Level').value=String(level);
return {enter,refresh};
}

AL.register('t20',{title:'ЕГЭ №2',logRows:()=>store.get('log',[]),exportData,importData,enter:arg=>mount().enter(arg)});
summarize();
})();
