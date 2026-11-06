/* Тренажёр 6 «Уравнения и системы»: решение системы отсечением наборов по одному уравнению
   и подсчёт решений цепочки без перебора — по столбцам «сколько цепочек кончается на 0 и на 1». */
(()=>{
const store=AL.store.scoped('t6');
const L=AL.logic;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function xmur3(str){let h=1779033703^str.length;for(let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353);h=h<<13|h>>>19}
  return()=>{h=Math.imul(h^(h>>>16),2246822507);h=Math.imul(h^(h>>>13),3266489909);return(h^=h>>>16)>>>0}}
function mulberry32(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
/* «1-…», «2-…», «3-…» — системы; «C-…» — цепочки */
function normSeed(raw,lvl,mode){let s=String(raw||'').toUpperCase().replace(/[^A-Z0-9-]/g,'').replace(/^-+|-+$/g,'');if(!s)return null;
  if(/^[123C]-./.test(s))return s.slice(0,24);return (mode==='ch'?'C':lvl)+'-'+s.slice(0,20)}
function randomSeed(lvl,mode){const A='ABCDEFGHJKMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<5;i++)s+=A[Math.floor(Math.random()*A.length)];return (mode==='ch'?'C':lvl)+'-'+s}
const seedMode=s=>s[0]==='C'?'ch':'sy';

/* ---------- системы ---------- */
const V=v=>({op:'var',v}),N=a=>a.op==='not'?a.a:{op:'not',a};
function clean(t){let ok=true;const w=n=>{if(n.b){const pa=L.pretty(n.a),pb=L.pretty(n.b);if(pa===pb||pa==='¬'+pb||pb==='¬'+pa)ok=false}if(n.a)w(n.a);if(n.b)w(n.b)};w(t);return ok}
function randEq(r,vars,k){
  const pick=a=>a[Math.floor(r()*a.length)];
  const leaves=[];const pool=[...vars];while(leaves.length<k+1){if(!pool.length)pool.push(...vars);leaves.push(pool.splice(Math.floor(r()*pool.length),1)[0])}
  let li=0;const b=c=>{let n=c===0?V(leaves[li++]):(()=>{const l=Math.floor(r()*c);return {op:pick(['and','or','imp','imp','or','eq','xor']),a:b(l),b:b(c-1-l)}})();if(r()<.25)n=N(n);return n};
  return b(k);
}
const envOf=(vs,m)=>{const e={};vs.forEach((v,i)=>e[v]=(m>>(vs.length-1-i))&1);return e};
function genSystem(seed){
  const lvl=+seed[0]||1;
  for(let att=0;att<300;att++){
    const r=mulberry32(xmur3(seed+'#'+att)());
    const vars=lvl===3?['A','B','C','D']:['A','B','C'];const ne=lvl===1?1:lvl===2?2:3;const N2=1<<vars.length;
    const eqs=[];let alive=[...Array(N2).keys()];let ok=true;
    for(let i=0;i<ne;i++){
      const sub=AL.shuffle(vars,r).slice(0,lvl===1?3:2+Math.floor(r()*2));
      const t=randEq(r,sub,1+Math.floor(r()*(lvl===1?2:2)));
      if(!clean(t)){ok=false;break}
      const rhs=r()<.25?0:1;
      const sat=m=>L.evaluate(t,envOf(vars,m))===rhs;
      const left=alive.filter(sat);
      if(left.length===alive.length||(left.length===0&&i<ne-1)){ok=false;break}
      eqs.push({t,rhs,txt:L.pretty(t)+' = '+rhs});alive=left;
    }
    if(!ok)continue;
    if(alive.length===0&&r()>.12)continue;
    if(lvl===1&&(alive.length<2||alive.length>6))continue;
    if(alive.length>N2/2+1)continue;
    return {seed,mode:'sy',level:lvl,vars,eqs,N:N2,answer:alive.length};
  }
}
function satisfies(S,eqi,m){const q=S.eqs[eqi];return L.evaluate(q.t,envOf(S.vars,m))===q.rhs}

/* ---------- цепочки ---------- */
const REL=[
  {id:'imp',txt:(a,b)=>`${a} → ${b}`,f:(a,b)=>(1-a)|b},
  {id:'rimp',txt:(a,b)=>`${b} → ${a}`,f:(a,b)=>a|(1-b)},
  {id:'or',txt:(a,b)=>`${a} ∨ ${b}`,f:(a,b)=>a|b},
  {id:'nand',txt:(a,b)=>`¬(${a} ∧ ${b})`,f:(a,b)=>1-(a&b)},
  {id:'nor',txt:(a,b)=>`¬${a} ∨ ¬${b}`,f:(a,b)=>1-(a&b)},
  {id:'eq',txt:(a,b)=>`${a} ≡ ${b}`,f:(a,b)=>+(a===b)},
  {id:'xor',txt:(a,b)=>`${a} ⊕ ${b}`,f:(a,b)=>a^b}
];
function genChain(seed){
  const r=mulberry32(xmur3(seed)());const pick=a=>a[Math.floor(r()*a.length)];
  const rel=r()<.85?pick(REL.slice(0,5)):pick(REL.slice(5));
  const n=5+Math.floor(r()*4);
  const cond=r()<.5?null:{at:r()<.5?1:n,v:r()<.5?0:1};
  const allowed=[0,1].map(a=>[0,1].map(b=>rel.f(a,b)));
  const cols=[];let c=[1,1];if(cond&&cond.at===1)c=[cond.v===0?1:0,cond.v===1?1:0];cols.push(c);
  for(let k=1;k<n;k++){const p=cols[k-1];c=[0,1].map(b=>p[0]*allowed[0][b]+p[1]*allowed[1][b]);
    if(cond&&cond.at===n&&k===n-1)c=c.map((x,v)=>v===cond.v?x:0);cols.push(c)}
  const answer=cols[n-1][0]+cols[n-1][1];
  return {seed,mode:'ch',level:3,rel,n,cond,allowed,cols,answer};
}
const chainText=C=>{const xs=k=>`x${k}`;const show=[1,2,'…',C.n-1];
  return [...[1,2].map(k=>`(${C.rel.txt(xs(k),xs(k+1))}) = 1`),'…',`(${C.rel.txt(xs(C.n-1),xs(C.n))}) = 1`,...(C.cond?[`x${C.cond.at} = ${C.cond.v}`]:[])]};

const MARKUP=`<div class="app t6">
  <header class="top">
    <div class="brand">
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><rect x="5" y="5" width="30" height="30" rx="4" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2.4"/><path d="M11 14h18M11 20h18M11 26h10" stroke="var(--ink-soft)" stroke-width="2.2" stroke-linecap="round"/><path d="M10 13l20 15" stroke="var(--bad)" stroke-width="2.4" stroke-linecap="round"/><text x="29" y="30" text-anchor="middle" font-family="JetBrains Mono,monospace" font-weight="700" font-size="10" fill="var(--live)">=1</text></svg>
      <div><a class="back" href="#map">← Карта навыков</a><h1>Уравнения и системы</h1><p>Решение отсечением наборов и подсчёт решений без перебора</p></div>
    </div>
    <div class="controls">
      <div class="field"><label for="x6Student">Ученик</label><input type="text" id="x6Student" placeholder="Фамилия Имя" autocomplete="off"></div>
      <div class="field x6-pr"><label for="x6Seed">Задание №</label><div class="row"><input type="text" id="x6Seed" class="seedin" spellcheck="false" autocomplete="off"><button class="btn" id="x6Open">Открыть</button></div></div>
      <div class="field x6-pr x6-sy"><label for="x6Level">Уровень</label><div class="row"><select id="x6Level"><option value="1">1 · одно уравнение</option><option value="2">2 · система из двух</option><option value="3">3 · три уравнения, 4 переменные</option></select></div></div>
      <button class="btn primary x6-pr" id="x6New">Новое задание</button>
      <button class="btn" id="x6Log">Журнал</button>
    </div>
  </header>
  <div class="exam-bar" id="x6ExamBar" hidden></div>
  <div class="seg" role="tablist" aria-label="Режим">
    <button role="tab" id="x6TabSy" aria-selected="true">Системы <span class="pill ok" id="x6SyCnt">0/4</span></button>
    <button role="tab" id="x6TabCh" aria-selected="false">Цепочки без перебора <span class="pill ok" id="x6ChCnt">0/2</span></button>
  </div>

  <section id="x6Sy" class="t6-col">
    <div class="status" id="x6Status"></div>
    <div class="t6-grid">
      <div class="card">
        <div class="card-h"><span class="step">1</span><h2 id="x6SyTitle">Система</h2><p>Решай по одному уравнению. Вычеркни наборы, на которых текущее уравнение не выполняется. Уже вычеркнутые наборы больше не проверяй.</p></div>
        <div class="body"><ol class="eqs" id="x6Eqs"></ol>
          <div class="actions"><button class="btn primary" id="x6CheckStep">Проверить шаг</button><button class="btn ghost" id="x6Reset">Начать заново</button><span class="tries" id="x6SyTries"></span></div>
          <div class="msg" id="x6StepMsg"></div>
          <div class="countbox" id="x6CountBox" hidden>
            <label for="x6Count">Сколько решений?</label>
            <div class="row"><input type="number" id="x6Count" min="0" max="16" inputmode="numeric"><button class="btn primary" id="x6CheckCount">Проверить ответ</button></div>
            <div class="msg" id="x6CountMsg"></div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-h"><span class="step">2</span><h2>Все наборы</h2><p>Нажми на строку, чтобы вычеркнуть её для текущего уравнения.</p></div>
        <div class="body"><div class="tt-wrap"><table class="tt t6tt" id="x6Table"></table></div></div>
      </div>
    </div>
  </section>

  <section id="x6Ch" class="t6-col" hidden>
    <div class="card">
      <div class="card-h"><span class="step">⛓</span><h2>Сколько решений у системы?</h2><p id="x6ChSub"></p></div>
      <div class="body"><div class="chain-sys" id="x6ChSys"></div></div>
    </div>
    <div class="t6-grid">
      <div class="card">
        <div class="card-h"><span class="step">1</span><h2>Какие переходы разрешены</h2><p>Отметь, какое значение x<sub>k+1</sub> может идти после x<sub>k</sub>, чтобы уравнение выполнялось.</p></div>
        <div class="body"><div class="trans" id="x6Trans"></div>
          <div class="actions"><button class="btn primary" id="x6CheckTr">Проверить</button><span class="tries" id="x6TrTries"></span></div>
          <div class="msg" id="x6TrMsg"></div></div>
      </div>
      <div class="card" id="x6DpCard">
        <div class="card-h"><span class="step">2</span><h2>Считаем по столбцам</h2><p>В клетке — сколько подходящих цепочек x<sub>1</sub>…x<sub>k</sub> заканчивается этим значением. Число для следующего столбца — сумма чисел, из которых в это значение есть переход.</p></div>
        <div class="body"><div class="tt-wrap"><table class="dp" id="x6Dp"></table></div>
          <div class="row total"><label for="x6Total">Всего решений:</label><input type="number" id="x6Total" min="0" inputmode="numeric"></div>
          <div class="actions"><button class="btn primary" id="x6CheckDp">Проверить</button><span class="tries" id="x6DpTries"></span></div>
          <div class="msg" id="x6DpMsg"></div></div>
      </div>
    </div>
  </section>
</div>
<div class="toast" id="x6Toast"></div>`;

/* ---------- прогресс ---------- */
function summarize(){
  const prog=store.get('progress',{});
  if(!Object.keys(prog).length&&!AL.node('n6').touched)return;
  const sol=Object.entries(prog).filter(([k,p])=>p.ok);
  const sy=sol.filter(([k])=>seedMode(k)==='sy'),ch=sol.filter(([k])=>seedMode(k)==='ch'),hi=sy.filter(([k])=>+k[0]>=2).length;
  const nS=Math.min(sy.length,4),nC=Math.min(ch.length,2),mastered=sy.length>=4&&hi>=2&&ch.length>=2;
  AL.report('n6',{done:nS+nC,total:6,note:`Системы ${nS} из 4 · цепочки ${nC} из 2`+(nS>=2&&hi<2?` · уровня 2–3: ${hi} из 2`:''),mastered,via:mastered?'practice':undefined});
}
function exportData(){const prog=store.get('progress',{}),o={};Object.entries(prog).slice(-300).forEach(([k,p])=>o[k]=[p.ok?1:0,p.errors||0,p.first||'']);return {p:o}}
function importData(d){if(!d)return;const prog=store.get('progress',{});
  for(const [k,a] of Object.entries(d.p||{})){const c=prog[k]||(prog[k]={ok:false,errors:0,first:a[2]||new Date().toISOString()});c.ok=c.ok||!!a[0];c.errors=Math.max(c.errors,a[1]||0)}
  store.set('progress',prog);summarize();if(api)api.refresh()}

let api=null;
function mount(){if(api)return api;document.getElementById('view-t6').innerHTML=MARKUP;api=init();return api}

function init(){
const $=s=>document.querySelector(s);
let progress=store.get('progress',{}),log=store.get('log',[]),level=store.get('level',1),mode=store.get('mode','sy');
let S=null,C=null,EX=null;
const saveP=()=>store.set('progress',progress);
function addLog(stage,input,note,id){log.push({t:new Date().toISOString(),seed:id||(mode==='ch'&&C?C.seed:S?S.seed:'—'),student:AL.student.get(),stage,input,note});if(log.length>3000)log=log.slice(-3000);store.set('log',log)}
function toast(t){const el=$('#x6Toast');el.textContent=t;el.classList.add('show');clearTimeout(toast.h);toast.h=setTimeout(()=>el.classList.remove('show'),1800)}
function showMsg(sel,cls,html){const el=$(sel);el.className='msg show '+cls;el.innerHTML=html}
function hideMsg(sel){$(sel).className='msg'}
function setHash(h){if(location.hash.slice(1)!==h){try{history.replaceState(null,'','#'+h)}catch(e){location.hash=h}}}
const app=()=>document.querySelector('.app.t6');
const P=seed=>progress[seed]||(progress[seed]={ok:false,errors:0,first:new Date().toISOString()});

function setMode(m,push=true){
  mode=m;if(!EX)store.set('mode',m);
  $('#x6TabSy').setAttribute('aria-selected',m==='sy');$('#x6TabCh').setAttribute('aria-selected',m==='ch');
  $('#x6Sy').hidden=m!=='sy';$('#x6Ch').hidden=m!=='ch';app().classList.toggle('mode-ch',m==='ch');
  if(m==='sy'){if(!S)loadSeed(store.get('last-sy',null)||randomSeed(level,'sy'),push);else{$('#x6Seed').value=S.seed;if(push&&!EX)setHash('t6-'+S.seed)}}
  else{if(!C)loadSeed(store.get('last-ch',null)||randomSeed(level,'ch'),push);else{$('#x6Seed').value=C.seed;if(push&&!EX)setHash('t6-'+C.seed)}}
  renderCounts();
}
function renderCounts(){
  const sol=Object.entries(progress).filter(([k,p])=>p.ok);
  $('#x6SyCnt').textContent=Math.min(sol.filter(([k])=>seedMode(k)==='sy').length,4)+'/4';
  $('#x6ChCnt').textContent=Math.min(sol.filter(([k])=>seedMode(k)==='ch').length,2)+'/2';
}
function loadSeed(seed,push=true){
  if(seedMode(seed)==='ch')loadChain(seed,push);else loadSystem(seed,push);
  $('#x6Seed').value=seed;if(!EX)store.set('last-'+seedMode(seed),seed);if(push&&!EX)setHash('t6-'+seed);
}

/* ---------- система ---------- */
function loadSystem(seed){
  S=Object.assign(genSystem(seed),{step:0,gone:{},sel:new Set(),errors:0,done:false,countOk:false,marks:null});
  level=S.level;$('#x6Level').value=String(level);
  hideMsg('#x6StepMsg');hideMsg('#x6CountMsg');$('#x6Count').value='';
  const p=P(S.seed);if(p.ok&&!EX){S.step=S.eqs.length;S.eqs.forEach((q,i)=>{for(let m=0;m<S.N;m++)if(S.gone[m]==null&&!satisfies(S,i,m))S.gone[m]=i});S.done=true;S.countOk=true;
    showMsg('#x6CountMsg','ok',`<b>Решено.</b> У системы ${S.answer} ${plural(S.answer)}. Можно взять новое задание.<div class="actions"><button class="btn primary" id="x6NextSeed">Новое задание →</button></div>`)}
  renderSystem();
}
const plural=n=>{const a=n%10,b=n%100;return a===1&&b!==11?'решение':a>=2&&a<=4&&(b<12||b>14)?'решения':'решений'};
function renderSystem(){
  $('#x6SyTitle').textContent=S.eqs.length===1?'Уравнение':'Система уравнений';
  $('#x6Eqs').innerHTML=S.eqs.map((q,i)=>`<li class="${i<S.step?'done':i===S.step?'cur':''}"><span class="eqt">${esc(q.txt)}</span><span class="eqs-s">${i<S.step?'наборы отсечены':i===S.step?'текущее':''}</span></li>`).join('');
  const vs=S.vars;
  let h=`<thead><tr><th>№</th>${vs.map(v=>`<th>${v}</th>`).join('')}<th class="st">итог</th></tr></thead><tbody>`;
  for(let m=0;m<S.N;m++){const e=envOf(vs,m),g=S.gone[m],sel=S.sel.has(m),mk=S.marks?S.marks[m]:'';
    h+=`<tr class="${g!=null?'gone':''}${sel?' sel':''}${mk?' '+mk:''}" data-m="${m}" ${g==null&&!S.done?'tabindex="0" role="button" aria-pressed="'+sel+'"':''}><td class="n">${m+1}</td>${vs.map(v=>`<td>${e[v]}</td>`).join('')}<td class="st">${g!=null?`<span class="tag a">ур. ${g+1}</span>`:sel?'<span class="tag a">вычеркнуть</span>':S.step>=S.eqs.length?'<span class="tag ok">решение</span>':''}</td></tr>`}
  $('#x6Table').innerHTML=h+'</tbody>';
  $('#x6CheckStep').disabled=S.step>=S.eqs.length||S.done;$('#x6Reset').disabled=!!EX||S.done;
  $('#x6CountBox').hidden=S.step<S.eqs.length;
  $('#x6CheckCount').disabled=S.countOk||(EX&&S.countDone);
  $('#x6SyTries').textContent=EX?'Зачёт: одна попытка на каждый шаг':`Ошибок: ${S.errors}`;
  const p=P(S.seed),chip=(c,t)=>`<span class="chip ${c}"><span class="dot"></span>${t}</span>`;
  const alive=[...Array(S.N).keys()].filter(m=>S.gone[m]==null).length;
  $('#x6Status').innerHTML=chip(p.ok?'ok':'',`Шаг <b>${Math.min(S.step+1,S.eqs.length)} из ${S.eqs.length}</b>`)+chip('',`Осталось наборов: <b>${alive}</b> из ${S.N}`)+'<span class="spacer"></span>'+chip('',`Уровень <b>${S.level}</b>`);
}
function toggleRow(m){if(S.done||S.step>=S.eqs.length||S.gone[m]!=null)return;if(S.sel.has(m))S.sel.delete(m);else S.sel.add(m);S.marks=null;hideMsg('#x6StepMsg');renderSystem();
  const tr=$(`#x6Table tr[data-m="${m}"]`);tr&&tr.focus()}
function checkStep(){
  if(S.step>=S.eqs.length)return;
  const i=S.step,alive=[...Array(S.N).keys()].filter(m=>S.gone[m]==null);
  const must=alive.filter(m=>!satisfies(S,i,m));
  const extra=[...S.sel].filter(m=>!must.includes(m)),miss=must.filter(m=>!S.sel.has(m));
  const q=S.eqs[i];
  if(!extra.length&&!miss.length){
    must.forEach(m=>S.gone[m]=i);S.sel.clear();S.marks=null;S.step++;
    addLog(EX?'Зачёт':'Верно',`уравнение ${i+1}`,`отсечено ${must.length}`);
    showMsg('#x6StepMsg','ok',S.step<S.eqs.length?`<b>Верно.</b> Уравнение ${i+1} отсекло ${must.length} ${must.length===1?'набор':must.length<5?'набора':'наборов'}. Переходи к уравнению ${i+2}.`:`<b>Верно.</b> Все уравнения учтены. Посчитай, сколько наборов осталось.`);
  }else{
    S.errors++;if(!EX){const p=P(S.seed);p.errors=Math.max(p.errors,S.errors);saveP()}
    S.marks={};extra.forEach(m=>S.marks[m]='bad');miss.forEach(m=>S.marks[m]='miss');
    const ex=extra[0]!=null?extra[0]:miss[0],e=envOf(S.vars,ex),val=L.evaluate(q.t,e);
    const setTxt=Object.entries(e).map(([k,v])=>k+' = '+v).join(', ');
    const why=val===q.rhs?`Например, набор ${ex+1} (${setTxt}): левая часть равна ${val}, как и нужно, — этот набор остаётся.`:`Например, набор ${ex+1} (${setTxt}): левая часть равна ${val}, а нужно ${q.rhs}, — этот набор вычёркивается.`;
    addLog(EX?'Зачёт':'Система',`уравнение ${i+1}`,`лишних ${extra.length}, пропущено ${miss.length}`);
    if(EX){EX.cur.ok=false;must.forEach(m=>S.gone[m]=i);S.sel.clear();S.marks=null;S.step++;
      showMsg('#x6StepMsg','bad',`<b>Ошибка.</b> ${why} Правильные наборы отсечены, продолжай.`)}
    else showMsg('#x6StepMsg','bad',`<b>Ошибка.</b> ${extra.length?`Лишних вычеркнутых: ${extra.length} (красные). `:''}${miss.length?`Не вычеркнуто: ${miss.length} (обведены). `:''}${why}`);
  }
  renderSystem();if(S.step>=S.eqs.length)setTimeout(()=>$('#x6Count').focus(),0);
}
function checkCount(){
  if(S.countOk)return;const v=$('#x6Count').value.trim();if(v===''){showMsg('#x6CountMsg','info','Впиши число.');return}
  const ok=+v===S.answer;
  if(EX){S.countDone=true;if(!ok)EX.cur.ok=false;if(EX.cur.ok!==false)EX.cur.ok=true;addLog('Зачёт','решений '+v,ok?'верно':'верно '+S.answer);
    showMsg('#x6CountMsg',ok?'ok':'bad',`<b>${ok?'Верно.':'Неверно.'}</b> Осталось ${S.answer} ${plural(S.answer)}.<div class="actions"><button class="btn primary" id="x6ExNext">${EX.i<EX.tasks.length-1?'Дальше →':'Итог зачёта'}</button></div>`);renderExamBar();renderSystem();return}
  if(ok){S.countOk=true;S.done=true;const p=P(S.seed);p.ok=true;saveP();addLog('Верно','решений '+v,`система решена, ошибок ${S.errors}`);
    showMsg('#x6CountMsg','ok',`<b>Верно!</b> У ${S.eqs.length===1?'уравнения':'системы'} ${S.answer} ${plural(S.answer)}.${S.answer===0?' Система несовместна: ни один набор не подошёл.':''}<div class="actions"><button class="btn primary" id="x6NextSeed">Новое задание →</button></div>`);summarize();renderCounts()}
  else{S.errors++;addLog('Система','решений '+v,'неверный подсчёт');showMsg('#x6CountMsg','bad','<b>Неверно.</b> Пересчитай строки без пометки «ур.» — у них в столбце «итог» стоит «решение».')}
  renderSystem();
}

/* ---------- цепочка ---------- */
function loadChain(seed){
  C=Object.assign(genChain(seed),{tr:[[null,null],[null,null]],trOk:false,trDone:false,dp:null,dpDone:false,errors:0,done:false});
  C.dp=[...Array(C.n)].map(()=>['','']);
  const p=P(C.seed);if(p.ok&&!EX){C.trOk=true;C.tr=C.allowed.map(r=>r.map(Boolean));C.dp=C.cols.map(c=>c.map(String));C.done=true}
  hideMsg('#x6TrMsg');hideMsg('#x6DpMsg');$('#x6Total').value=p.ok&&!EX?String(C.answer):'';
  if(p.ok&&!EX)showMsg('#x6DpMsg','ok',`<b>Решено.</b> У системы ${C.answer} ${plural(C.answer)}.<div class="actions"><button class="btn primary" id="x6NextSeed">Новое задание →</button></div>`);
  renderChain();
}
function renderChain(){
  $('#x6ChSub').textContent=`Переменные x1, x2, …, x${C.n}. Перебирать ${1<<C.n} наборов долго — посчитаем по столбцам.`;
  $('#x6ChSys').innerHTML=chainText(C).map(t=>`<div class="${t==='…'?'dots':'ce'}">${esc(t)}</div>`).join('');
  const lockT=C.trOk||(EX&&C.trDone);
  $('#x6Trans').innerHTML=`<table class="trt"><thead><tr><th>x<sub>k</sub> \\ x<sub>k+1</sub></th><th>0</th><th>1</th></tr></thead><tbody>${[0,1].map(a=>`<tr><th>${a}</th>${[0,1].map(b=>{const v=C.tr[a][b];
    return `<td><button class="trb ${v===true?'yes':v===false?'no':''}" data-a="${a}" data-b="${b}" ${lockT?'disabled':''} aria-label="из ${a} в ${b}">${v===true?'можно':v===false?'нельзя':'?'}</button></td>`}).join('')}</tr>`).join('')}</tbody></table>
    <p class="trf">Уравнение для соседей: <b>${esc(C.rel.txt('x_k','x_{k+1}').replace(/_k\+1|_\{k\+1\}/g,'ₖ₊₁').replace(/_k/g,'ₖ'))} = 1</b></p>`;
  $('#x6CheckTr').disabled=lockT;$('#x6TrTries').textContent=EX?'Зачёт: одна попытка':'';
  const ready=C.trOk||(EX&&C.trDone);$('#x6DpCard').classList.toggle('locked',!ready);
  const lockD=C.done||(EX&&C.dpDone);
  if(!ready){$('#x6Dp').innerHTML='<tbody><tr><td class="wait">Сначала разберись с переходами.</td></tr></tbody>';$('#x6CheckDp').disabled=true;$('#x6Total').disabled=true;return}
  $('#x6Dp').innerHTML=`<thead><tr><th></th>${[...Array(C.n).keys()].map(k=>`<th>x<sub>${k+1}</sub></th>`).join('')}</tr></thead><tbody>${[0,1].map(v=>`<tr><th>= ${v}</th>${C.dp.map((c,k)=>{const mk=C.dpMarks?C.dpMarks[k][v]:'';
    return `<td><input type="number" min="0" inputmode="numeric" class="dpi${mk?' '+mk:''}" data-k="${k}" data-v="${v}" value="${esc(c[v])}" ${lockD?'disabled':''} aria-label="x${k+1} = ${v}"></td>`}).join('')}</tr>`).join('')}</tbody>`;
  $('#x6CheckDp').disabled=lockD;$('#x6Total').disabled=lockD;
  $('#x6DpTries').textContent=EX?'Зачёт: одна попытка':`Ошибок: ${C.errors}`;
}
function checkTr(){
  if(C.tr.flat().some(v=>v===null)){showMsg('#x6TrMsg','info','Отметь все четыре перехода.');return}
  const bad=[];[0,1].forEach(a=>[0,1].forEach(b=>{if(C.tr[a][b]!==!!C.allowed[a][b])bad.push([a,b])}));
  const relt=C.rel.txt('a','b');
  if(EX)C.trDone=true;
  if(!bad.length){C.trOk=true;addLog(EX?'Зачёт':'Верно','переходы','верно');showMsg('#x6TrMsg','ok',`<b>Верно.</b> Теперь заполни таблицу по столбцам.`)}
  else{C.errors++;const [a,b]=bad[0];const val=C.rel.f(a,b);
    const why=`При x<sub>k</sub> = ${a}, x<sub>k+1</sub> = ${b}: ${esc(C.rel.txt(String(a),String(b)))} = ${val}, поэтому переход ${val?'можно':'нельзя'}.`;
    addLog(EX?'Зачёт':'Цепочка','переходы',`ошибок ${bad.length}`);
    if(EX){EX.cur.ok=false;C.tr=C.allowed.map(r=>r.map(Boolean));showMsg('#x6TrMsg','bad',`<b>Ошибка.</b> ${why} Правильные переходы выставлены.`)}
    else showMsg('#x6TrMsg','bad',`<b>Ошибка.</b> ${why}`)}
  renderChain();
}
function checkDp(){
  const vals=C.dp.map(c=>c.map(x=>x===''?null:+x));
  if(vals.some(c=>c.some(x=>x===null))){showMsg('#x6DpMsg','info','Заполни все клетки таблицы. Если цепочек нет, пиши 0.');return}
  const tot=$('#x6Total').value.trim();if(tot===''){showMsg('#x6DpMsg','info','Впиши, сколько всего решений.');return}
  C.dpMarks=C.cols.map((c,k)=>c.map((x,v)=>vals[k][v]===x?'':'bad'));
  const firstBad=C.cols.findIndex((c,k)=>c.some((x,v)=>vals[k][v]!==x));const totOk=+tot===C.answer;
  if(EX)C.dpDone=true;
  if(firstBad<0&&totOk){
    if(EX){if(EX.cur.ok!==false)EX.cur.ok=true;showMsg('#x6DpMsg','ok',`<b>Верно.</b> ${C.answer} ${plural(C.answer)}.<div class="actions"><button class="btn primary" id="x6ExNext">${EX.i<EX.tasks.length-1?'Дальше →':'Итог зачёта'}</button></div>`);renderExamBar()}
    else{C.done=true;const p=P(C.seed);p.ok=true;saveP();addLog('Верно','всего '+tot,`цепочка из ${C.n} переменных`);
      showMsg('#x6DpMsg','ok',`<b>Верно!</b> ${C.answer} ${plural(C.answer)} — без перебора ${1<<C.n} наборов.<div class="actions"><button class="btn primary" id="x6NextSeed">Новое задание →</button></div>`);summarize();renderCounts()}
  }else{
    C.errors++;let why;
    if(firstBad===0)why=`Первый столбец: ${C.cond&&C.cond.at===1?`условие x1 = ${C.cond.v} оставляет только одно значение`:'x1 может быть и 0, и 1 — по одной цепочке длины 1'}.`;
    else if(firstBad>0){const k=firstBad,pr=C.cols[k-1];const v=[0,1].find(v=>vals[k][v]!==C.cols[k][v]);
      const from=[0,1].filter(a=>C.allowed[a][v]);
      const sum=from.reduce((s,a)=>s+pr[a],0);
      why=`Столбец x${k+1}, значение ${v}: `+(!from.length?'в него нельзя прийти ни из 0, ни из 1, поэтому там 0':from.length===1?`в него можно прийти только из x${k} = ${from[0]}, поэтому число то же, что там: ${sum}`:`в него можно прийти и из 0, и из 1, поэтому складываем: ${pr[0]} + ${pr[1]} = ${sum}`)+
        (C.cond&&C.cond.at===C.n&&k===C.n-1&&v!==C.cond.v?`, но условие x${C.n} = ${C.cond.v} оставляет только его, поэтому 0.`:'.')}
    else why=`Столбцы верные. Ответ — сумма последнего столбца: ${C.cols[C.n-1].join(' + ')} = ${C.answer}.`;
    addLog(EX?'Зачёт':'Цепочка',`всего ${tot}`,firstBad>=0?`ошибка в столбце x${firstBad+1}`:'ошибка в сумме');
    if(EX){EX.cur.ok=false;C.dp=C.cols.map(c=>c.map(String));showMsg('#x6DpMsg','bad',`<b>Ошибка.</b> ${why} Верный ответ: ${C.answer}.<div class="actions"><button class="btn primary" id="x6ExNext">${EX.i<EX.tasks.length-1?'Дальше →':'Итог зачёта'}</button></div>`);renderExamBar()}
    else showMsg('#x6DpMsg','bad',`<b>Ошибка.</b> ${why}`);
  }
  renderChain();
}

/* ---------- зачёт: система уровня 2, система уровня 3, цепочка ---------- */
function startExam(){EX={tasks:[randomSeed(2,'sy'),randomSeed(3,'sy'),randomSeed(1,'ch')],i:0,res:[],cur:{},done:false};addLog('Зачёт','—','Начат зачёт: '+EX.tasks.join(', '),'зачёт');app().classList.add('exam');showTask()}
function showTask(){const s=EX.tasks[EX.i];EX.cur={};setMode(seedMode(s),false);loadSeed(s,false);renderExamBar();window.scrollTo(0,0)}
function renderExamBar(){
  const bar=$('#x6ExamBar');if(!EX){bar.hidden=true;app().classList.remove('exam');return}
  bar.hidden=false;
  bar.innerHTML=`<div class="ex-t"><b>Зачёт по теме 6</b><span>${EX.done?'Зачёт завершён':`Задание ${EX.i+1} из ${EX.tasks.length}`} · одна попытка на каждый шаг</span></div>
    <div class="ex-dots">${EX.tasks.map((t,i)=>`<span class="ex-dot ${i<EX.res.length?(EX.res[i]?'ok':'bad'):i===EX.i?'now':''}"></span>`).join('')}</div>
    <button class="btn ghost" id="x6ExQuit">${EX.done?'Закрыть зачёт':'Прервать зачёт'}</button>`;
}
function examNext(){
  EX.res.push(EX.cur.ok===true);
  if(EX.i<EX.tasks.length-1){EX.i++;showTask();return}
  EX.done=true;const k=EX.res.filter(Boolean).length,n=EX.tasks.length;renderExamBar();
  const sel=mode==='ch'?'#x6DpMsg':'#x6CountMsg';
  if(k===n){AL.report('n6',{mastered:true,via:'exam'});addLog('Верно','зачёт',`Зачёт сдан: ${k} из ${n}`,'зачёт');
    showMsg(sel,'ok',`<b>Зачёт сдан: ${k} из ${n}.</b> Тема 6 засчитана, ветка преобразований пройдена.<div class="actions"><a class="btn primary" href="#map">На карту навыков</a><button class="btn" id="x6ExStay">Остаться в тренажёре</button></div>`)}
  else{addLog('Зачёт','—',`Не сдан: ${k} из ${n}`,'зачёт');
    showMsg(sel,'bad',`<b>Зачёт не сдан: верно ${k} из ${n}.</b> Потренируйся и попробуй снова.<div class="actions"><button class="btn primary" id="x6ExRetry">Сдать ещё раз</button><button class="btn" id="x6ExStay">Тренироваться</button></div>`)}
}
function stopExam(){if(EX&&!EX.done)addLog('Зачёт','—',`Прерван на задании ${EX.i+1}`,'зачёт');EX=null;renderExamBar();S=null;C=null;setMode(store.get('mode','sy'))}

/* ---------- события ---------- */
$('#x6TabSy').onclick=()=>{if(EX)return toast('Сначала закончи или прерви зачёт');setMode('sy')};
$('#x6TabCh').onclick=()=>{if(EX)return toast('Сначала закончи или прерви зачёт');setMode('ch')};
$('#x6Table').addEventListener('click',e=>{const tr=e.target.closest('tr[data-m]');if(tr)toggleRow(+tr.dataset.m)});
$('#x6Table').addEventListener('keydown',e=>{const tr=e.target.closest('tr[data-m]');if(!tr)return;
  if(e.key===' '||e.key==='Enter'){e.preventDefault();toggleRow(+tr.dataset.m)}
  else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();const rows=[...document.querySelectorAll('#x6Table tr[tabindex]')];const i=rows.indexOf(tr);const nx=rows[i+(e.key==='ArrowDown'?1:-1)];nx&&nx.focus()}});
$('#x6CheckStep').onclick=checkStep;
$('#x6Reset').onclick=()=>{if(EX)return;loadSystem(S.seed)};
$('#x6CheckCount').onclick=checkCount;$('#x6Count').addEventListener('keydown',e=>{if(e.key==='Enter')checkCount()});
$('#x6Trans').addEventListener('click',e=>{const b=e.target.closest('.trb');if(!b||b.disabled)return;const a=+b.dataset.a,c=+b.dataset.b,v=C.tr[a][c];C.tr[a][c]=v===null?true:v===true?false:true;hideMsg('#x6TrMsg');renderChain()});
$('#x6CheckTr').onclick=checkTr;
$('#x6Dp').addEventListener('input',e=>{const i=e.target.closest('.dpi');if(!i)return;C.dp[+i.dataset.k][+i.dataset.v]=i.value.trim();i.classList.remove('bad')});
$('#x6Dp').addEventListener('keydown',e=>{const i=e.target.closest('.dpi');if(!i)return;if(e.key==='Enter'){e.preventDefault();const k=+i.dataset.k,v=+i.dataset.v;
  const nx=v===0?$(`#x6Dp .dpi[data-k="${k}"][data-v="1"]`):$(`#x6Dp .dpi[data-k="${k+1}"][data-v="0"]`);(nx||$('#x6Total')).focus()}});
$('#x6CheckDp').onclick=checkDp;$('#x6Total').addEventListener('keydown',e=>{if(e.key==='Enter')checkDp()});
const onMsg=e=>{
  if(e.target.id==='x6NextSeed')loadSeed(randomSeed(level,mode));
  if(e.target.id==='x6ExNext')examNext();
  if(e.target.id==='x6ExRetry')startExam();
  if(e.target.id==='x6ExStay')stopExam();
};
['#x6StepMsg','#x6CountMsg','#x6TrMsg','#x6DpMsg'].forEach(s=>$(s).addEventListener('click',onMsg));
$('#x6ExamBar').addEventListener('click',e=>{if(e.target.id==='x6ExQuit')stopExam()});
$('#x6New').onclick=()=>loadSeed(randomSeed(+$('#x6Level').value,mode));
$('#x6Level').onchange=()=>{level=+$('#x6Level').value;store.set('level',level)};
const openSeed=()=>{const s=normSeed($('#x6Seed').value,+$('#x6Level').value,mode);if(!s){toast('Введи номер задания');return}setMode(seedMode(s),false);loadSeed(s)};
$('#x6Open').onclick=openSeed;$('#x6Seed').addEventListener('keydown',e=>{if(e.key==='Enter')openSeed()});
$('#x6Student').value=AL.student.get();
$('#x6Student').addEventListener('input',()=>AL.student.set($('#x6Student').value));
AL.on('student',v=>{if(document.activeElement!==$('#x6Student'))$('#x6Student').value=v});
$('#x6Log').onclick=()=>AL.openLog&&AL.openLog();

function enter(arg){
  if(arg==='exam'){startExam();return}
  if(EX&&EX.done&&!arg){stopExam();return}
  if(EX)return;
  const s=arg?normSeed(arg,level,mode):null;
  if(s){const m=seedMode(s);if(m==='sy'){S=null}else{C=null}setMode(m,false);loadSeed(s,false);return}
  setMode(mode,true);
}
function refresh(){progress=store.get('progress',{});renderCounts()}
$('#x6Level').value=String(level);
return {enter,refresh};
}

AL.register('t6',{title:'Уравнения',logRows:()=>store.get('log',[]),exportData,importData,enter:arg=>mount().enter(arg)});
summarize();
})();
