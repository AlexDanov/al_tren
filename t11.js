/* Тренажёр 11 «Схемы»: ключи, лампа, таблица истинности, выражение. Подключается к карте навыков через AL. */
(()=>{
const store=AL.store.scoped('t11');
const MARKUP=`<div class="app">
  <header class="top">
    <div class="brand">
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="18" r="11" fill="var(--glow)" stroke="var(--live)" stroke-width="2.4"/><path d="M12.5 10.5l15 15M27.5 10.5l-15 15" stroke="var(--live)" stroke-width="2"/><path d="M4 34h32" stroke="var(--ink)" stroke-width="2.4" stroke-linecap="round"/></svg>
      <div><a class="back" href="#map">← Карта навыков</a><h1>Тренажёр логических схем</h1><p>Ключи, лампа, таблица истинности и логическое выражение</p></div>
    </div>
    <div class="controls">
      <div class="field"><label for="student">Ученик</label><input type="text" id="student" placeholder="Фамилия Имя" autocomplete="off"></div>
      <div class="field"><label for="seed">Схема №</label>
        <div class="row"><input type="text" id="seed" spellcheck="false" autocomplete="off"><button class="btn" id="openSeed">Открыть</button><button class="btn ghost" id="copySeed" title="Скопировать номер схемы" aria-label="Скопировать номер схемы">⧉</button></div></div>
      <div class="field"><label for="level">Уровень</label>
        <div class="row"><select id="level"><option value="1">1 · две переменные</option><option value="2">2 · три переменные</option><option value="3">3 · до четырёх</option></select><button class="btn primary" id="newBtn">Новая схема</button></div></div>
      <button class="btn" id="logBtn">Журнал ошибок <span class="pill" id="logCount">0</span></button>
    </div>
  </header>

  <div class="exam-bar" id="examBar" hidden></div>
  <div class="status" id="status"></div>

  <main class="grid">
    <section class="card circ">
      <div class="card-h"><span class="step">1</span><h2>Исследуй схему</h2>
        <p>Кнопка нажата — переменная равна 1, отпущена — 0. Все контакты одной кнопки стоят на её вертикали и переключаются вместе. Нажимай на колонку кнопки, на кнопки переменных или клавиши <span class="kbd">A</span>–<span class="kbd">D</span>.</p></div>
      <div class="body">
        <div class="board"><svg id="circuit" role="img" aria-label="Электрическая схема"></svg></div>
        <div class="panel" id="varPanel"></div>
        <div class="legend">
          <span><svg width="60" height="46" viewBox="0 0 60 46"><path class="cap" d="M20 8V3H40V8"/><line class="rod" x1="30" y1="3" x2="30" y2="23"/><line x1="2" y1="32" x2="10" y2="32" class="w"/><line x1="50" y1="32" x2="58" y2="32" class="w"/><line class="lever" x1="14" y1="32" x2="50" y2="21"/><circle cx="14" cy="32" r="3.4" class="contact"/><circle cx="46" cy="32" r="3.4" class="contact"/></svg><span><b>Замыкающий контакт.</b> Кнопка отпущена — цепь разомкнута. Нажата — рычаг опускается на контакт, цепь замкнута.</span></span>
          <span><svg width="60" height="46" viewBox="0 0 60 46"><path class="cap" d="M20 8V3H40V8"/><line class="rod" x1="30" y1="3" x2="30" y2="33"/><line x1="2" y1="32" x2="10" y2="32" class="w"/><line x1="50" y1="32" x2="58" y2="32" class="w"/><line class="lever" x1="14" y1="32" x2="50" y2="36"/><circle cx="14" cy="32" r="3.4" class="contact"/><circle cx="46" cy="32" r="3.4" class="contact"/></svg><span><b>Размыкающий контакт.</b> Кнопка отпущена — рычаг прижат к контакту снизу, цепь замкнута. Нажата — рычаг уходит вниз, цепь разомкнута.</span></span>
        </div>
      </div>
    </section>

    <section class="card tablecard">
      <div class="card-h"><span class="step">2</span><h2>Таблица истинности</h2>
        <p>Заполни столбец F: 1, если лампа горит, 0, если нет. Нажми на набор переменных, чтобы выставить его на схеме. В ячейке F можно печатать 0 и 1, стрелки двигают по строкам.</p></div>
      <div class="body">
        <div class="tt-wrap"><table class="tt" id="tt"></table></div>
        <div class="actions">
          <button class="btn primary" id="checkTable">Проверить таблицу</button>
          <button class="btn ghost" id="clearTable">Очистить</button>
          <span class="tries" id="tableTries"></span>
        </div>
        <div class="msg" id="tableMsg"></div>
      </div>
    </section>

    <section class="card expr">
      <div class="card-h"><span class="step">3</span><h2>Логическое выражение</h2>
        <p>Запиши функцию F для этой схемы. Последовательное соединение — конъюнкция, параллельное — дизъюнкция. Какой контакт даёт переменную, а какой её отрицание, определи по схеме.</p></div>
      <div class="body">
        <div class="exprline"><span class="pre">F =</span><input type="text" id="expr" placeholder="например: A ∧ (¬B ∨ C)" spellcheck="false" autocomplete="off" aria-label="Логическое выражение"></div>
        <div class="preview" id="preview">&nbsp;</div>
        <div class="pad" id="pad"></div>
        <div class="actions">
          <button class="btn primary" id="checkExpr">Проверить выражение</button>
          <button class="btn ghost" id="showAnswer">Показать ответ</button>
          <span class="tries" id="exprTries"></span>
        </div>
        <div class="msg" id="exprMsg"></div>
        <p class="help">Можно писать по-разному: И — <code>∧ & * ·</code> или <code>и</code>, ИЛИ — <code>∨ | +</code> или <code>или</code>, НЕ — <code>¬ ! ~</code> или <code>не</code>. Запись <code>AB</code> читается как A ∧ B. Регистр и русские буквы А, В, С тоже понимаются. Синтаксические ошибки не считаются попыткой.</p>
      </div>
    </section>
  </main>
</div>

<div class="overlay" id="overlay" hidden>
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="logTitle">
    <div class="modal-h"><h2 id="logTitle">Журнал</h2>
      <label class="row" style="font-size:13px"><input type="checkbox" id="onlyCur"> только текущая схема</label>
      <button class="btn ghost" id="closeLog" aria-label="Закрыть">✕</button></div>
    <div class="tabs" role="tablist">
      <button role="tab" id="tabErr" aria-selected="true">Ошибки</button>
      <button role="tab" id="tabSch" aria-selected="false">Схемы и попытки</button>
    </div>
    <div class="logwrap" id="logBody"></div>
    <textarea id="copyArea" hidden readonly></textarea>
    <div class="modal-f"><span class="sum" id="logSum"></span>
      <button class="btn" id="copyLog">Скопировать журнал</button>
      <button class="btn danger" id="clearLog">Очистить журнал</button></div>
  </div>
</div>
<div class="toast" id="toast"></div>

`;

/* --- то, что карте нужно знать без открытия тренажёра --- */
function summarize(){
  const prog=store.get('progress',{});
  const ok=Object.values(prog).filter(p=>p.exprOk&&!p.answerShown);
  if(!Object.keys(prog).length&&!AL.node('n11').touched)return;
  const hi=ok.filter(p=>(+p.level||1)>=2).length,done=Math.min(ok.length,5);
  const mastered=ok.length>=5&&hi>=2;
  AL.report('n11',{done,total:5,note:`Решено ${done} из 5`+(hi<2?` · уровня 2–3: ${hi} из 2`:''),mastered,via:mastered?'practice':undefined});
}
function exportData(){
  const prog=store.get('progress',{}),out={};
  Object.entries(prog).sort((a,b)=>(a[1].first||'').localeCompare(b[1].first||'')).slice(-300)
    .forEach(([k,p])=>out[k]=[+p.level||1,p.exprOk?1:0,p.answerShown?1:0,p.tableOk?1:0,p.exprTries||0,p.tableTries||0,p.first||'']);
  return {p:out};
}
function importData(d){
  const prog=store.get('progress',{});
  for(const [k,a] of Object.entries((d&&d.p)||{})){
    const c=prog[k]||(prog[k]={level:a[0],tableTries:0,exprTries:0,tableOk:false,exprOk:false,answerShown:false,draft:null,first:a[6]||new Date().toISOString()});
    c.exprOk=c.exprOk||!!a[1];c.answerShown=c.answerShown||!!a[2];c.tableOk=c.tableOk||!!a[3];
    c.exprTries=Math.max(c.exprTries,a[4]||0);c.tableTries=Math.max(c.tableTries,a[5]||0);
  }
  store.set('progress',prog);summarize();if(api)api.refresh();
}

let api=null;
function mount(){if(api)return api;document.getElementById('view-t11').innerHTML=MARKUP;api=init();return api}
function init(){
const $=s=>document.querySelector(s);
const VARS='ABCD';
const store=AL.store.scoped('t11');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- PRNG по SEED ---------- */
function xmur3(str){let h=1779033703^str.length;for(let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353);h=h<<13|h>>>19}
  return()=>{h=Math.imul(h^(h>>>16),2246822507);h=Math.imul(h^(h>>>13),3266489909);return(h^=h>>>16)>>>0}}
function mulberry32(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

const LEVELS={1:{nv:[2,2],leaves:[2,3],depth:2,pInv:.35},2:{nv:[3,3],leaves:[3,5],depth:3,pInv:.4},3:{nv:[3,4],leaves:[5,7],depth:4,pInv:.4}};

function normSeed(raw,lvl){
  let s=String(raw||'').toUpperCase().replace(/[^A-Z0-9-]/g,'').replace(/^-+|-+$/g,'');
  if(!s) return null;
  if(!/^[123]-./.test(s)) s=lvl+'-'+s;
  return s.slice(0,24);
}
function randomSeed(lvl){const A='ABCDEFGHJKMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<5;i++)s+=A[Math.floor(Math.random()*A.length)];return lvl+'-'+s}

/* ---------- схема: дерево последовательных (s) и параллельных (p) соединений.
   Каждая переменная — своя колонка (кнопка), все её контакты стоят на одной вертикали.
   inv = размыкающий контакт (замкнут, пока кнопка не нажата). ---------- */
function evalNode(n,env){
  if(n.t==='k') return n.inv? !env[n.v] : !!env[n.v];
  return n.t==='s'? n.c.every(c=>evalNode(c,env)) : n.c.some(c=>evalNode(c,env));
}
function leavesOf(n,a=[]){if(n.t==='k')a.push(n);else n.c.forEach(c=>leavesOf(c,a));return a}
function envOf(vars,mask){const e={};vars.forEach((v,i)=>e[v]=(mask>>(vars.length-1-i))&1);return e}

function generate(seed){
  const level=+seed[0];const L=LEVELS[level];
  const rng=mulberry32(xmur3(seed)());
  const ri=(a,b)=>a+Math.floor(rng()*(b-a+1));
  const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
  function gen(lo,hi,depth,parent){
    const span=hi-lo+1;
    const leafP=depth>=L.depth?1:depth===0?0:.35;
    if(rng()<leafP||(parent==='p'&&span<2)||(depth===0&&span<2&&false)){const col=ri(lo,hi);return {t:'k',col,lo:col,hi:col,inv:rng()<L.pInv}}
    const t=parent==='s'?'p':parent==='p'?'s':(span>=2&&rng()<.5?'s':'p');
    if(t==='s'){
      const k=Math.min(span,rng()<.3?3:2);
      const cuts=shuffle([...Array(span-1).keys()].map(i=>lo+i+1)).slice(0,k-1).sort((a,b)=>a-b);
      const b=[lo,...cuts,hi+1];
      return {t,c:b.slice(0,-1).map((s,i)=>gen(s,b[i+1]-1,depth+1,'s'))};
    }
    const k=rng()<.25?3:2,c=[];
    for(let i=0;i<k;i++){let a=lo,bb=hi;if(span>1&&rng()<.45){a=ri(lo,hi);bb=ri(a,hi)}c.push(gen(a,bb,depth+1,'p'))}
    return {t,c};
  }
  const tighten=n=>{if(n.t==='k')return;n.c.forEach(tighten);n.lo=Math.min(...n.c.map(c=>c.lo));n.hi=Math.max(...n.c.map(c=>c.hi))};
  let last;
  for(let attempt=0;attempt<3000;attempt++){
    const nv=ri(L.nv[0],L.nv[1]);const vars=VARS.slice(0,nv).split('');
    const tree=gen(0,nv-1,0,null);tighten(tree);
    const lv=leavesOf(tree);lv.forEach(l=>l.v=vars[l.col]);
    last={seed,level,vars,tree};
    if(lv.length>=L.leaves[0]&&lv.length<=L.leaves[1]&&valid(last,level)) return last;
  }
  return last;
}
function valid(c,level){
  const {vars,tree}=c;const lv=leavesOf(tree);const N=1<<vars.length;
  const f=[];for(let m=0;m<N;m++)f.push(evalNode(tree,envOf(vars,m)));
  if(f.every(x=>x)||f.every(x=>!x)) return false;
  for(let i=0;i<vars.length;i++){const bit=1<<(vars.length-1-i);let dep=false;
    for(let m=0;m<N;m++) if(f[m]!==f[m^bit]){dep=true;break}
    if(!dep) return false;}
  if(level>=2){const inv=lv.filter(l=>l.inv).length;if(inv===0||inv===lv.length)return false}
  const bad=n=>{if(n.t==='k')return false;const ex=n.c.map(ch=>treeToExpr(ch,n.t));
    return new Set(ex).size<ex.length||n.c.some((a,i)=>a.t==='k'&&n.c.some((b,j)=>j>i&&b.t==='k'&&a.v===b.v))||n.c.some(bad)};
  return !bad(tree);
}
function treeToExpr(n,parent){
  if(n.t==='k') return (n.inv?'¬':'')+n.v;
  const s=n.c.map(c=>treeToExpr(c,n.t)).join(n.t==='s'?' ∧ ':' ∨ ');
  return (n.t==='p'&&parent==='s')?'('+s+')':s;
}

/* ---------- раскладка: колонки кнопок, между ними «желоба» для шин параллельных блоков ---------- */
const CW=84,KUP=22,KDN=20,GAPY=8,PAD=7,LW=10,MID=8,GMIN=26,PT=6,PH=46;
function layoutY(n){
  if(n.t==='k'){n.up=KUP;n.dn=KDN;return}
  n.c.forEach(layoutY);
  if(n.t==='s'){n.up=Math.max(...n.c.map(c=>c.up));n.dn=Math.max(...n.c.map(c=>c.dn))}
  else{let y=0;n.anch=[];n.c.forEach((c,i)=>{n.anch.push(y+c.up);y+=c.up+c.dn+(i<n.c.length-1?GAPY:0)});
    n.up=(n.anch[0]+n.anch[n.anch.length-1])/2;n.dn=y-n.up}
}
function lanes(n,anc,acc){
  if(n.t==='k')return;
  if(n.t==='p'){n.ll=anc.filter(a=>a.lo===n.lo).length;n.rl=anc.filter(a=>a.hi===n.hi).length;acc.push(n);anc=[...anc,n]}
  n.c.forEach(c=>lanes(c,anc,acc));
}
function drawCircuit(c,env){
  const t=c.tree,nv=c.vars.length;
  layoutY(t);const ps=[];lanes(t,[],ps);
  const nL=Array(nv+1).fill(0),nR=Array(nv+1).fill(0);
  ps.forEach(p=>{nL[p.lo]=Math.max(nL[p.lo],p.ll+1);nR[p.hi+1]=Math.max(nR[p.hi+1],p.rl+1)});
  const gw=nL.map((l,g)=>Math.max(GMIN,2*PAD+(l+nR[g])*LW+(l&&nR[g]?MID:0)));
  const x0=56,colX=[],gS=[];let x=x0;
  for(let g=0;g<=nv;g++){gS[g]=x;x+=gw[g];if(g<nv){colX[g]=x;x+=CW}}
  const blockR=x;
  const lb=p=>gS[p.lo]+PAD+nR[p.lo]*LW+(nR[p.lo]?MID:0)+p.ll*LW+LW/2;
  const rb=p=>gS[p.hi+1]+PAD+(nR[p.hi+1]-1-p.rl)*LW+LW/2;
  const Lx=n=>n.t==='k'?colX[n.col]:n.t==='p'?lb(n):Lx(n.c[0]);
  const Rx=n=>n.t==='k'?colX[n.col]+CW:n.t==='p'?rb(n):Rx(n.c[n.c.length-1]);
  const segs=[],fg=[],dots=[],keys=[];
  const seg=(x1,y1,x2,y2,live)=>{if(x1!==x2||y1!==y2)segs.push([x1,y1,x2,y2,live])};
  function draw(n,ay,live){
    if(n.t==='k'){
      const xx=colX[n.col],c1=xx+16,c2=xx+CW-16,xm=xx+CW/2,pressed=!!env[n.v];
      seg(xx,ay,c1-4,ay,live);seg(c2+4,ay,xx+CW,ay,live);
      const ex=c2+6,ey=n.inv?(pressed?ay+15:ay+5.5):(pressed?ay-5.5:ay-15);
      const ym=ay+(ey-ay)*(xm-c1)/(ex-c1);
      fg.push(`<line class="lever${live?' live':''}" x1="${c1}" y1="${ay}" x2="${ex}" y2="${ey.toFixed(1)}"/>`);
      fg.push(`<circle class="contact" cx="${c1}" cy="${ay}" r="4.2"/><circle class="contact" cx="${c2}" cy="${ay}" r="4.2"/>`);
      keys.push({col:n.col,ym,ay});return;
    }
    if(n.t==='s'){n.c.forEach((ch,i)=>{draw(ch,ay,live);if(i<n.c.length-1)seg(Rx(ch),ay,Lx(n.c[i+1]),ay,live)});return}
    const top=ay-n.up,ys=n.anch.map(a=>top+a),cl=n.c.map(ch=>live&&evalNode(ch,env)),xL=lb(n),xR=rb(n);
    n.c.forEach((ch,i)=>{const yi=ys[i];seg(xL,yi,Lx(ch),yi,cl[i]);draw(ch,yi,cl[i]);seg(Rx(ch),yi,xR,yi,cl[i])});
    const pts=[...new Set([...ys,ay])].sort((a,b)=>a-b);
    for(let i=0;i<pts.length-1;i++){
      const p=pts[i],q=pts[i+1];
      const lv=q<=ay? cl.some((l,j)=>l&&ys[j]<=p) : cl.some((l,j)=>l&&ys[j]>=q);
      if(q<=ay){seg(xL,q,xL,p,lv);seg(xR,p,xR,q,lv)}else{seg(xL,p,xL,q,lv);seg(xR,q,xR,p,lv)}
    }
    dots.push([xL,ay,live],[xR,ay,live]);
    ys.forEach((y,i)=>{if(i>0&&i<ys.length-1)dots.push([xL,y,cl[i]],[xR,y,cl[i]])});
  }
  const T=PT+PH+14,ay=T+t.up,LR=28,W=Math.max(blockR,320),R=W+24,yb=T+t.up+t.dn+56;
  const on=evalNode(t,env);
  draw(t,ay,on);
  seg(LR,ay,Lx(t),ay,on);seg(Rx(t),ay,R,ay,on);seg(R,ay,R,yb,on);
  const bX=LR+(R-LR)*.3,lX=LR+(R-LR)*.68;
  seg(R,yb,lX+17,yb,on);seg(lX-17,yb,bX+6,yb,on);seg(bX-6,yb,LR,yb,on);seg(LR,yb,LR,ay,on);
  // кнопки: полоса-колонка, толкатель ⊓ и пунктирная тяга через все контакты
  const bands=[],push=[];
  c.vars.forEach((v,ci)=>{
    const ks=keys.filter(k=>k.col===ci);if(!ks.length)return;
    const xx=colX[ci],xm=xx+CW/2,pressed=!!env[v],capY=PT+28+(pressed?6:0);
    const bottom=Math.max(...ks.map(k=>k.ay))+KDN;
    const st=pressed?'нажата':'отпущена',n=ks.length;
    bands.push(`<rect class="band${pressed?' on':''}" x="${xx+4}" y="${PT}" width="${CW-8}" height="${bottom-PT}" rx="10" data-var="${v}" tabindex="0" role="button" aria-label="Кнопка ${v}, ${st}, контактов: ${n}"><title>Кнопка ${v}: ${st}. Нажми, чтобы ${pressed?'отпустить':'нажать'}</title></rect>`);
    push.push(`<text class="blabel" x="${xm}" y="${PT+19}">${v}</text><text class="bval${pressed?' on':''}" x="${xm+13}" y="${PT+19}">=${env[v]}</text>`);
    push.push(`<line class="rod${pressed?' on':''}" x1="${xm}" y1="${capY}" x2="${xm}" y2="${Math.max(...ks.map(k=>k.ym)).toFixed(1)}"/>`);
    push.push(`<path class="cap${pressed?' on':''}" d="M${xm-11} ${capY+6}V${capY}H${xm+11}V${capY+6}"/>`);
  });
  const line=s=>`<line class="w${s[4]?' live':''}" x1="${s[0]}" y1="${s[1]}" x2="${s[2]}" y2="${s[3]}"/>`;
  const flow=s=>`<line class="flow" x1="${s[0]}" y1="${s[1]}" x2="${s[2]}" y2="${s[3]}"/>`;
  const H=yb+40,VW=R+30;
  return {on,svg:`<defs><radialGradient id="halo"><stop offset="0" class="halo-stop" stop-opacity=".85"/><stop offset="1" class="halo-stop" stop-opacity="0"/></radialGradient></defs>
  ${bands.join('')}<g>${segs.map(line).join('')}</g><g>${segs.filter(s=>s[4]).map(flow).join('')}</g>
  ${dots.map(d=>`<circle class="jn${d[2]?' live':''}" cx="${d[0]}" cy="${d[1]}" r="3.6"/>`).join('')}
  ${fg.join('')}${push.join('')}
  <line x1="${bX-6}" y1="${yb-17}" x2="${bX-6}" y2="${yb+17}" stroke="var(--ink)" stroke-width="2.4"/>
  <line x1="${bX+6}" y1="${yb-8}" x2="${bX+6}" y2="${yb+8}" stroke="var(--ink)" stroke-width="5"/>
  <text class="term" x="${bX-17}" y="${yb-16}">+</text><text class="term" x="${bX+17}" y="${yb-16}">−</text>
  <text class="cap-t" x="${bX}" y="${yb+33}">батарея</text>
  <circle class="halo${on?' on':''}" cx="${lX}" cy="${yb}" r="40"/>
  <circle class="bulb${on?' on':''}" cx="${lX}" cy="${yb}" r="16"/>
  <path d="M${lX-11} ${yb-11}L${lX+11} ${yb+11}M${lX+11} ${yb-11}L${lX-11} ${yb+11}" stroke="${on?'var(--live)':'var(--ink)'}" stroke-width="2"/>
  <text class="cap-t" x="${lX}" y="${yb+33}">лампа F = ${on?1:0}</text>`,vb:`0 0 ${VW} ${H}`};
}

/* ---------- разбор выражения ---------- */
const CYR={'А':'A','В':'B','С':'C','Д':'D','а':'A','в':'B','с':'C','д':'D'};
const WORDS={and:'AND','и':'AND',or:'OR','или':'OR',not:'NOT','не':'NOT',xor:'XOR'};
function PErr(msg,pos){this.msg=msg;this.pos=pos}
function tokenize(s){
  const T=[];let i=0;const push=(type,pos,v)=>T.push({type,pos,v});
  const rx=[[/^(<->|<=>)/,'EQ'],[/^(->|=>)/,'IMP'],[/^(==|=|≡|⇔|↔)/,'EQ'],[/^(→|⇒)/,'IMP'],[/^(&&|[∧&*·⋅])/,'AND'],[/^(\|\||[∨|+])/,'OR'],[/^[⊕^]/,'XOR'],[/^[¬!~]/,'NOT'],[/^[(\[]/,'LP'],[/^[)\]]/,'RP'],[/^[01]/,'CONST']];
  outer: while(i<s.length){
    const ch=s[i];if(/\s/.test(ch)){i++;continue}
    const rest=s.slice(i);
    for(const [r,t] of rx){const m=r.exec(rest);if(m){push(t,i,t==='CONST'?+m[0]:undefined);i+=m[0].length;continue outer}}
    const m=/^[A-Za-zА-Яа-яЁё]+/.exec(rest);
    if(m){
      const w=m[0],lw=w.toLowerCase();
      if(WORDS[lw]){push(WORDS[lw],i);i+=w.length;continue}
      for(let k=0;k<w.length;k++){
        const c=w[k];let v=CYR[c]||(/[A-Za-z]/.test(c)?c.toUpperCase():null);
        if(!v) throw new PErr(`Непонятная буква «${c}». Переменные пишутся латиницей: A, B, C, D`,i+k);
        const over=/[̄̅]/.test(s[i+k+1]||'');
        if(over) push('NOT',i+k);
        push('VAR',i+k,v);
        if(over&&k===w.length-1){i+=1}
      }
      i+=w.length;continue;
    }
    if(/[̄̅]/.test(ch)){i++;continue}
    throw new PErr(`Непонятный символ «${ch}»`,i);
  }
  return T;
}
const NAMES={AND:'∧',OR:'∨',XOR:'⊕',IMP:'→',EQ:'≡',NOT:'¬',RP:')',LP:'('};
function parse(src){
  const T=tokenize(src);let p=0;
  if(!T.length) throw new PErr('Введите выражение',0);
  const peek=()=>T[p],next=()=>T[p++];
  const startsOperand=t=>t&&(t.type==='VAR'||t.type==='CONST'||t.type==='LP'||t.type==='NOT');
  function eq(){let l=imp();while(peek()&&peek().type==='EQ'){next();l={op:'eq',a:l,b:imp()}}return l}
  function imp(){const l=or();if(peek()&&peek().type==='IMP'){next();return{op:'imp',a:l,b:imp()}}return l}
  function or(){let l=and();while(peek()&&(peek().type==='OR'||peek().type==='XOR')){const t=next().type;l={op:t==='OR'?'or':'xor',a:l,b:and()}}return l}
  function and(){let l=not();for(;;){const t=peek();if(t&&t.type==='AND'){next();l={op:'and',a:l,b:not()}}else if(startsOperand(t)){l={op:'and',a:l,b:not()}}else break}return l}
  function not(){if(peek()&&peek().type==='NOT'){next();return{op:'not',a:not()}}return atom()}
  function atom(){
    const t=next();
    if(!t) throw new PErr('Выражение не закончено: после знака нужна переменная или «(»',src.length);
    if(t.type==='VAR') return {op:'var',v:t.v};
    if(t.type==='CONST') return {op:'const',v:t.v};
    if(t.type==='LP'){const e=eq();const r=next();if(!r||r.type!=='RP') throw new PErr('Не хватает закрывающей скобки «)»',r?r.pos:src.length);return e}
    throw new PErr(`Здесь ожидалась переменная, а стоит «${NAMES[t.type]||t.type}»`,t.pos);
  }
  const e=eq();
  if(p<T.length){const t=T[p];throw new PErr(t.type==='RP'?'Лишняя закрывающая скобка «)»':`Лишний знак «${NAMES[t.type]||t.v}»`,t.pos)}
  return e;
}
function evalAst(n,env){switch(n.op){
  case'var':return !!env[n.v];case'const':return !!n.v;case'not':return !evalAst(n.a,env);
  case'and':return evalAst(n.a,env)&&evalAst(n.b,env);case'or':return evalAst(n.a,env)||evalAst(n.b,env);
  case'xor':return evalAst(n.a,env)!==evalAst(n.b,env);case'imp':return !evalAst(n.a,env)||evalAst(n.b,env);
  case'eq':return evalAst(n.a,env)===evalAst(n.b,env)}}
function astVars(n,s=new Set()){if(n.op==='var')s.add(n.v);if(n.a)astVars(n.a,s);if(n.b)astVars(n.b,s);return s}
const PREC={eq:1,imp:2,or:3,xor:3,and:4,not:5,var:6,const:6},SYM={eq:' ≡ ',imp:' → ',or:' ∨ ',xor:' ⊕ ',and:' ∧ '};
function pretty(n,pp=0){
  let s;
  if(n.op==='var')s=n.v;else if(n.op==='const')s=String(n.v);
  else if(n.op==='not')s='¬'+pretty(n.a,5);
  else s=pretty(n.a,PREC[n.op])+SYM[n.op]+pretty(n.b,PREC[n.op]+(n.op==='imp'?0:.5));
  return PREC[n.op]<pp?'('+s+')':s;
}

/* ---------- состояние ---------- */
let S=null;
let progress=store.get('progress',{});
let log=store.get('log',[]);
let level=store.get('level',2);
let showLinks=store.get('links',true);
const saveP=()=>store.set('progress',progress);
const saveL=()=>store.set('log',log);
function P(){return progress[S.seed]||(progress[S.seed]={level:S.level,tableTries:0,exprTries:0,tableOk:false,exprOk:false,answerShown:false,draft:null,first:new Date().toISOString()})}
function addLog(stage,input,note){
  log.push({t:new Date().toISOString(),seed:S.seed,student:$('#student').value.trim(),stage,input,note});
  if(log.length>3000)log=log.slice(-3000);saveL();updateLogCount();
}

function loadSeed(seed,push=true){
  const c=generate(seed);
  S={...c,env:Object.fromEntries(c.vars.map(v=>[v,0])),marks:null};
  const p=P();S.table=Array.isArray(p.draft)&&p.draft.length===1<<c.vars.length?p.draft.slice():Array(1<<c.vars.length).fill('');
  level=c.level;$('#level').value=String(level);$('#seed').value=seed;
  store.set('last',seed);
  if(push&&location.hash.slice(1)!=='t11-'+seed){try{history.replaceState(null,'','#t11-'+seed)}catch(e){location.hash='t11-'+seed}}
  $('#expr').value='';updPreview();
  hideMsg('#tableMsg');hideMsg('#exprMsg');
  if(p.exprOk&&!EX) showMsg('#exprMsg','ok','<b>Решено.</b> Эта схема уже сдана. Можно потренироваться ещё или взять новую.');
  if(EX){EX.answered=false;renderExamBar();setTimeout(()=>$('#expr').focus({preventScroll:true}),0)}
  renderAll();
}
function renderAll(){renderCircuit();renderVars();renderTable();renderPad();renderStatus()}

function renderCircuit(){
  const r=drawCircuit(S,S.env);const svg=$('#circuit');
  svg.setAttribute('viewBox',r.vb);svg.innerHTML=r.svg;S.on=r.on;
  const [,,w]=r.vb.split(' ').map(Number);svg.style.maxWidth=Math.max(w*1.35,420)+'px';svg.style.margin='0 auto';
}
function toggleVar(v){if(!(v in S.env))return;S.env[v]^=1;renderCircuit();renderVars();markNowRow()}
function renderVars(){
  $('#varPanel').innerHTML=S.vars.map(v=>`<button class="vbtn" data-var="${v}" aria-pressed="${!!S.env[v]}">${v}<span class="v">${S.env[v]}</span></button>`).join('')+
   `<button class="btn ghost" id="resetVars">Все в 0</button><span class="lampstate${S.on?' on':''}">Лампа ${S.on?'горит':'не горит'} <span class="v">F = ${S.on?1:0}</span></span>`;
}
function curMask(){return S.vars.reduce((m,v)=>(m<<1)|S.env[v],0)}
function renderTable(){
  const n=S.vars.length,N=1<<n,cm=curMask();
  let h=`<thead><tr><th></th>${S.vars.map(v=>`<th>${v}</th>`).join('')}<th class="f">F</th></tr></thead><tbody>`;
  for(let m=0;m<N;m++){
    const e=envOf(S.vars,m),val=S.table[m],mk=S.marks?S.marks[m]:'';
    h+=`<tr data-m="${m}" class="${m===cm?'now':''}"><td class="n">${m+1}</td>${S.vars.map(v=>`<td class="set" data-m="${m}" title="Выставить этот набор на схеме">${e[v]}</td>`).join('')}
    <td class="fc"><button class="fbtn${val!==''?' filled':''}${mk?' '+mk:''}" data-m="${m}" aria-label="F в строке ${m+1}">${val}</button></td></tr>`;
  }
  $('#tt').innerHTML=h+'</tbody>';
  const p=P();$('#tableTries').textContent=`Попыток: ${p.tableTries}${p.tableOk?' · сдано':''}`;
}
function markNowRow(){const cm=curMask();document.querySelectorAll('#tt tbody tr').forEach(tr=>tr.classList.toggle('now',+tr.dataset.m===cm))}
function setCell(m,v){S.table[m]=v;S.marks=null;const p=P();p.draft=S.table.slice();saveP();renderTable();const b=document.querySelector(`.fbtn[data-m="${m}"]`);b&&b.focus()}
function renderPad(){
  const keys=[...S.vars.map(v=>[v,v,'']),['¬','¬','op'],['∧',' ∧ ','op'],['∨',' ∨ ','op'],['(','(',''],[')',')',''],['⌫','BS',''],['Сброс','CLR','']];
  $('#pad').innerHTML=keys.map(([l,ins,c])=>`<button class="${c}" data-ins="${esc(ins)}" title="${l==='⌫'?'Удалить символ':l==='Сброс'?'Очистить поле':l}">${l}</button>`).join('');
  const p=P();$('#exprTries').textContent=`Попыток: ${p.exprTries}${p.exprOk?' · сдано':''}`;
}
function renderStatus(){
  const p=P(),solved=Object.values(progress).filter(x=>x.exprOk).length;
  const tries=Object.values(progress).reduce((a,x)=>a+x.tableTries+x.exprTries,0);
  const chip=(cls,txt)=>`<span class="chip ${cls}"><span class="dot"></span>${txt}</span>`;
  const tErr=log.filter(l=>l.seed===S.seed&&l.stage==='Таблица').length,eErr=log.filter(l=>l.seed===S.seed&&l.stage==='Выражение').length;
  $('#status').innerHTML=
    chip(p.tableOk?'ok':tErr?'bad':'',`Таблица: <b>${p.tableOk?'верно':p.tableTries?'ошибок '+tErr:'не проверена'}</b>`)+
    chip(p.exprOk?'ok':eErr?'bad':'',`Выражение: <b>${p.exprOk?'верно':p.exprTries?'ошибок '+eErr:'не проверено'}</b>`)+
    (p.answerShown?chip('bad','Ответ был показан'):'')+
    `<span class="spacer"></span>`+chip('',`Уровень <b>${S.level}</b> · ключей <b>${leavesOf(S.tree).length}</b>`)+
    chip('',`Решено схем: <b>${solved}</b> · всего попыток: <b>${tries}</b>`);
  updateLogCount();
}
function updateLogCount(){$('#logCount').textContent=log.filter(l=>l.stage!=='Верно').length}

function showMsg(sel,cls,html){const el=$(sel);el.className='msg show '+cls;el.innerHTML=html}
function hideMsg(sel){$(sel).className='msg'}
const fmtEnv=e=>Object.entries(e).map(([k,v])=>`${k}=${v}`).join(', ');

/* ---------- проверки ---------- */
function checkTable(){
  const N=1<<S.vars.length,empty=S.table.map((v,i)=>v===''?i+1:0).filter(Boolean);
  if(empty.length){showMsg('#tableMsg','info',`Заполни все строки. Пустые: ${empty.join(', ')}.`);return}
  const p=P();p.tableTries++;
  const wrong=[];S.marks=[];
  for(let m=0;m<N;m++){const f=evalNode(S.tree,envOf(S.vars,m))?1:0;const ok=+S.table[m]===f;S.marks.push(ok?'ok':'bad');if(!ok)wrong.push(m)}
  if(!wrong.length){
    p.tableOk=true;showMsg('#tableMsg','ok',`<b>Верно!</b> Таблица заполнена правильно с ${p.tableTries}-й попытки. Теперь запиши выражение.`);
    addLog('Верно','таблица',`с ${p.tableTries}-й попытки`);
  }else{
    showMsg('#tableMsg','bad',`<b>Ошибка.</b> Неверных строк: ${wrong.length} из ${N}. Они отмечены красным. Выставь эти наборы на схеме и посмотри на лампу.`);
    addLog('Таблица','F = '+S.table.join(''),'Неверные строки: '+wrong.map(m=>`№${m+1} (${fmtEnv(envOf(S.vars,m))}: ввод ${S.table[m]})`).join('; '));
  }
  saveP();renderTable();renderStatus();
}
function updPreview(){
  const src=$('#expr').value,el=$('#preview');
  if(!src.trim()){el.className='preview';el.innerHTML='&nbsp;';return null}
  try{const a=parse(src);el.className='preview';el.textContent='Читается как: F = '+pretty(a);return a}
  catch(e){if(!(e instanceof PErr))throw e;el.className='preview err';el.textContent=`${e.msg} (позиция ${e.pos+1})`;return null}
}
function checkExpr(){
  if(EX&&(EX.answered||EX.done))return;
  const src=$('#expr').value;let ast;
  try{ast=parse(src)}catch(e){if(!(e instanceof PErr))throw e;showMsg('#exprMsg','info',`Выражение не разобрано: ${esc(e.msg)}. Это не считается попыткой.`);return}
  const extra=[...astVars(ast)].filter(v=>!S.vars.includes(v));
  if(extra.length){showMsg('#exprMsg','info',`В этой схеме нет переменн${extra.length>1?'ых':'ой'} ${extra.join(', ')}. Используй только ${S.vars.join(', ')}. Попытка не засчитана.`);return}
  const p=P();p.exprTries++;
  const N=1<<S.vars.length;let diff=null,cnt=0;
  for(let m=0;m<N;m++){const e=envOf(S.vars,m);const a=evalNode(S.tree,e),b=evalAst(ast,e);if(a!==b){cnt++;if(!diff)diff={e,a,b,m}}}
  const pr=pretty(ast);
  if(!diff){
    p.exprOk=true;
    showMsg('#exprMsg','ok',`<b>Верно!</b> F = ${esc(pr)} совпадает со схемой на всех ${N} наборах. Попытка ${p.exprTries}.
      <div class="actions"><button class="btn primary" id="nextSeed">Следующая схема →</button></div>`);
    addLog('Верно',pr,`выражение с ${p.exprTries}-й попытки`);
  }else{
    showMsg('#exprMsg','bad',`<b>Ошибка.</b> Не совпадает при ${fmtEnv(diff.e)}: лампа ${diff.a?'горит (F = 1)':'не горит (F = 0)'}, а выражение даёт ${diff.b?1:0}. Всего расхождений: ${cnt} из ${N}.
      <div class="actions"><button class="btn" id="showDiff" data-m="${diff.m}">Выставить этот набор на схеме</button></div>`);
    addLog('Выражение',pr,`Расхождений ${cnt}/${N}; напр. ${fmtEnv(diff.e)}: схема ${diff.a?1:0}, выражение ${diff.b?1:0}`);
  }
  if(EX){examAnswer(!diff,pr,diff,cnt,N)}
  saveP();renderPad();renderStatus();summarize();
}
let answerArmed=false;
function showAnswer(){
  const btn=$('#showAnswer');
  if(EX)return;
  if(!answerArmed){answerArmed=true;btn.textContent='Точно показать? Это попадёт в журнал';btn.classList.add('danger');setTimeout(()=>{answerArmed=false;btn.textContent='Показать ответ';btn.classList.remove('danger')},4000);return}
  answerArmed=false;btn.textContent='Показать ответ';btn.classList.remove('danger');
  const p=P();p.answerShown=true;saveP();
  showMsg('#exprMsg','info',`Одно из правильных выражений:<div class="answer">F = ${esc(treeToExpr(S.tree))}</div>`);
  addLog('Ответ','—','Ученик открыл эталонный ответ');renderStatus();summarize();
}

/* ---------- журнал ---------- */
let logTab='err';
const fmtTime=t=>{const d=new Date(t);return d.toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit'})+' '+d.toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit',second:'2-digit'})};
function renderLog(){
  const only=$('#onlyCur').checked;
  $('#tabErr').setAttribute('aria-selected',logTab==='err');$('#tabSch').setAttribute('aria-selected',logTab==='sch');
  if(logTab==='err'){
    const rows=log.filter(l=>!only||l.seed===S.seed).slice().reverse();
    $('#logBody').innerHTML=rows.length?`<table class="log"><thead><tr><th>Время</th><th>Схема</th><th>Ученик</th><th>Этап</th><th>Ввод</th><th>Комментарий</th></tr></thead><tbody>${rows.map(l=>{
      const tg=l.stage==='Таблица'?'t':l.stage==='Выражение'?'e':l.stage==='Верно'?'ok':'a';
      return `<tr><td class="m">${fmtTime(l.t)}</td><td class="m"><a href="#t11-${esc(l.seed)}">${esc(l.seed)}</a></td><td>${esc(l.student||'—')}</td><td><span class="tag ${tg}">${esc(l.stage)}</span></td><td class="code">${esc(l.input)}</td><td>${esc(l.note)}</td></tr>`}).join('')}</tbody></table>`
      :`<div class="empty">${only?'По этой схеме записей нет.':'Журнал пуст. Сюда попадают ошибки, правильные ответы и просмотры ответа.'}</div>`;
    const errs=rows.filter(l=>l.stage==='Таблица'||l.stage==='Выражение').length;
    $('#logSum').textContent=`Записей: ${rows.length} · ошибок: ${errs}`;
  }else{
    const ent=Object.entries(progress).filter(([k])=>!only||k===S.seed).sort((a,b)=>(b[1].first||'').localeCompare(a[1].first||''));
    $('#logBody').innerHTML=ent.length?`<table class="log"><thead><tr><th>Схема</th><th>Уровень</th><th>Таблица</th><th>Выражение</th><th>Итог</th></tr></thead><tbody>${ent.map(([k,p])=>
      `<tr><td class="m"><a href="#t11-${esc(k)}">${esc(k)}</a></td><td class="m">${p.level||k[0]}</td><td class="m">${p.tableTries} попыт. ${p.tableOk?'<span class="tag ok">верно</span>':''}</td><td class="m">${p.exprTries} попыт. ${p.exprOk?'<span class="tag ok">верно</span>':''}</td><td>${p.answerShown?'<span class="tag a">ответ показан</span>':p.exprOk?'<span class="tag ok">решено</span>':'в работе'}</td></tr>`).join('')}</tbody></table>`
      :'<div class="empty">Пока нет открытых схем.</div>';
    $('#logSum').textContent=`Схем: ${ent.length} · решено: ${ent.filter(e=>e[1].exprOk).length}`;
  }
}
function logText(){
  const st=$('#student').value.trim()||'—';
  const lines=[`Журнал тренажёра логических схем. Ученик: ${st}. Выгружено: ${fmtTime(new Date())}`,'','Время\tСхема\tУченик\tЭтап\tВвод\tКомментарий'];
  log.forEach(l=>lines.push([fmtTime(l.t),l.seed,l.student||'—',l.stage,l.input,l.note].join('\t')));
  lines.push('','Схема\tТаблица (попыток/итог)\tВыражение (попыток/итог)\tОтвет показан');
  Object.entries(progress).forEach(([k,p])=>lines.push([k,`${p.tableTries}/${p.tableOk?'верно':'нет'}`,`${p.exprTries}/${p.exprOk?'верно':'нет'}`,p.answerShown?'да':'нет'].join('\t')));
  return lines.join('\n');
}
let clearArmed=false;
function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(toast.h);toast.h=setTimeout(()=>el.classList.remove('show'),1800)}
function copyText(t,okMsg){
  const fallback=()=>{const ta=$('#copyArea');ta.hidden=false;ta.value=t;ta.focus();ta.select();toast('Выделено: нажми Ctrl+C')};
  try{navigator.clipboard.writeText(t).then(()=>toast(okMsg),fallback)}catch(e){fallback()}
}

/* ---------- события ---------- */
const hl=v=>{const c=$('#circuit');if(v)c.dataset.hl=v;else delete c.dataset.hl};
$('#circuit').addEventListener('mouseover',e=>{const k=e.target.closest('[data-var]');hl(k&&k.dataset.var)});
$('#circuit').addEventListener('mouseleave',()=>hl(null));
$('#circuit').addEventListener('focusin',e=>{const k=e.target.closest('[data-var]');hl(k&&k.dataset.var)});
$('#varPanel').addEventListener('mouseover',e=>{const k=e.target.closest('[data-var]');hl(k&&k.dataset.var)});
$('#varPanel').addEventListener('mouseleave',()=>hl(null));
$('#circuit').addEventListener('click',e=>{const k=e.target.closest('[data-var]');if(k)toggleVar(k.dataset.var)});
$('#circuit').addEventListener('keydown',e=>{const k=e.target.closest('[data-var]');if(k&&(e.key==='Enter'||e.key===' ')){e.preventDefault();const v=k.dataset.var;toggleVar(v);const nk=document.querySelector(`#circuit [data-var="${v}"]`);nk&&nk.focus()}});
$('#varPanel').addEventListener('click',e=>{const b=e.target.closest('[data-var]');if(b)return toggleVar(b.dataset.var);
  if(e.target.id==='resetVars'){S.vars.forEach(v=>S.env[v]=0);renderCircuit();renderVars();markNowRow()}});
$('#tt').addEventListener('click',e=>{
  const f=e.target.closest('.fbtn');if(f){const m=+f.dataset.m,v=S.table[m];setCell(m,v===''?'1':v==='1'?'0':'1');return}
  const s=e.target.closest('td.set');if(s){const m=+s.dataset.m;Object.assign(S.env,envOf(S.vars,m));renderCircuit();renderVars();markNowRow()}
});
$('#tt').addEventListener('keydown',e=>{
  const f=e.target.closest('.fbtn');if(!f)return;const m=+f.dataset.m,N=S.table.length;
  if(e.key==='0'||e.key==='1'){e.preventDefault();setCell(m,e.key);const nb=document.querySelector(`.fbtn[data-m="${Math.min(m+1,N-1)}"]`);nb&&nb.focus()}
  else if(e.key==='Backspace'||e.key==='Delete'){e.preventDefault();setCell(m,'')}
  else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();const nb=document.querySelector(`.fbtn[data-m="${Math.max(0,Math.min(N-1,m+(e.key==='ArrowDown'?1:-1)))}"]`);nb&&nb.focus()}
});
$('#checkTable').onclick=checkTable;
$('#clearTable').onclick=()=>{S.table=S.table.map(()=>'');S.marks=null;P().draft=null;saveP();hideMsg('#tableMsg');renderTable()};
$('#expr').addEventListener('input',updPreview);
$('#expr').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();checkExpr()}});
$('#pad').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;const inp=$('#expr'),ins=b.dataset.ins;
  let s=inp.selectionStart??inp.value.length,en=inp.selectionEnd??inp.value.length;
  if(ins==='CLR'){inp.value='';s=0}
  else if(ins==='BS'){if(s===en&&s>0){inp.value=inp.value.slice(0,s-1)+inp.value.slice(en);s--}else{inp.value=inp.value.slice(0,s)+inp.value.slice(en)}}
  else{inp.value=inp.value.slice(0,s)+ins+inp.value.slice(en);s+=ins.length}
  inp.focus();inp.setSelectionRange(s,s);updPreview();
});
$('#checkExpr').onclick=checkExpr;
$('#showAnswer').onclick=showAnswer;
$('#exprMsg').addEventListener('click',e=>{
  if(e.target.id==='nextSeed') loadSeed(randomSeed(level));
  if(e.target.id==='examNext') examNext();
  if(e.target.id==='examRetry') startExam();
  if(e.target.id==='examStay') stopExam();
  if(e.target.id==='showDiff'){Object.assign(S.env,envOf(S.vars,+e.target.dataset.m));renderCircuit();renderVars();markNowRow();$('#circuit').scrollIntoView({behavior:'smooth',block:'center'})}
});
$('#newBtn').onclick=()=>loadSeed(randomSeed(+$('#level').value));
$('#level').onchange=()=>{level=+$('#level').value;store.set('level',level)};
const openSeed=()=>{const s=normSeed($('#seed').value,+$('#level').value);if(!s){toast('Введите номер схемы');return}loadSeed(s)};
$('#openSeed').onclick=openSeed;
$('#seed').addEventListener('keydown',e=>{if(e.key==='Enter')openSeed()});
$('#copySeed').onclick=()=>copyText(S.seed,'Номер схемы скопирован: '+S.seed);
$('#student').value=AL.student.get();
$('#student').addEventListener('input',()=>AL.student.set($('#student').value));
AL.on('student',v=>{if(document.activeElement!==$('#student'))$('#student').value=v});
$('#logBtn').onclick=()=>{$('#overlay').hidden=false;$('#copyArea').hidden=true;renderLog();$('#closeLog').focus()};
$('#closeLog').onclick=()=>{$('#overlay').hidden=true};
$('#overlay').addEventListener('click',e=>{if(e.target.id==='overlay')$('#overlay').hidden=true;if(e.target.closest('a[href^="#"]'))$('#overlay').hidden=true});
$('#tabErr').onclick=()=>{logTab='err';renderLog()};$('#tabSch').onclick=()=>{logTab='sch';renderLog()};
$('#onlyCur').onchange=renderLog;
$('#copyLog').onclick=()=>copyText(logText(),'Журнал скопирован');
$('#clearLog').onclick=()=>{
  const b=$('#clearLog');
  if(!clearArmed){clearArmed=true;b.textContent='Нажми ещё раз: удалить всё';setTimeout(()=>{clearArmed=false;b.textContent='Очистить журнал'},4000);return}
  clearArmed=false;b.textContent='Очистить журнал';log=[];progress={};saveL();saveP();renderLog();renderAll();summarize();toast('Журнал очищен');
};
document.addEventListener('keydown',e=>{
  if($('#view-t11').hidden)return;
  if(e.key==='Escape'&&!$('#overlay').hidden){$('#overlay').hidden=true;return}
  const tag=(e.target.tagName||'').toLowerCase();if(tag==='input'||tag==='textarea'||tag==='select'||e.ctrlKey||e.metaKey||e.altKey)return;
  const k=e.key.toUpperCase();if(S&&S.vars.includes(k)){e.preventDefault();toggleVar(k)}
});

/* ---------- зачёт: 3 схемы, одна попытка на каждую ---------- */
let EX=null;
function renderExamBar(){
  const bar=$('#examBar');
  if(!EX){bar.hidden=true;$('#view-t11').classList.remove('exam');return}
  $('#view-t11').classList.add('exam');bar.hidden=false;
  const dots=EX.seeds.map((s,i)=>`<span class="ex-dot ${i<EX.res.length?(EX.res[i]?'ok':'bad'):i===EX.i?'now':''}" title="Схема ${i+1}"></span>`).join('');
  bar.innerHTML=`<div class="ex-t"><b>Зачёт по теме 11</b><span>${EX.done?'Зачёт завершён':`Схема ${EX.i+1} из ${EX.seeds.length}`} · одна попытка на схему · таблица и подсказка ответа выключены</span></div>
    <div class="ex-dots" aria-label="Результаты">${dots}</div>
    <button class="btn ghost" id="examQuit">${EX.done?'Закрыть зачёт':'Прервать зачёт'}</button>`;
}
function startExam(){
  EX={seeds:[randomSeed(2),randomSeed(2),randomSeed(3)],i:0,res:[],answered:false,done:false};
  addLog('Зачёт','—','Начат зачёт: '+EX.seeds.join(', '));
  loadSeed(EX.seeds[0]);
  $('#view-t11').scrollIntoView({block:'start'});
}
function stopExam(){
  if(EX&&!EX.done)addLog('Зачёт','—',`Прерван на схеме ${EX.i+1}, верно ${EX.res.filter(Boolean).length}`);
  EX=null;renderExamBar();hideMsg('#exprMsg');loadSeed(randomSeed(level));
}
function examAnswer(ok,pr,diff,cnt,N){
  EX.answered=true;EX.res.push(ok);
  const last=EX.i===EX.seeds.length-1;
  addLog('Зачёт',pr,`Схема ${EX.i+1} из ${EX.seeds.length}: ${ok?'верно':'ошибка'}`);
  const btn=`<div class="actions"><button class="btn primary" id="examNext">${last?'Итог зачёта':'Следующая схема →'}</button></div>`;
  if(ok) showMsg('#exprMsg','ok',`<b>Верно.</b> F = ${esc(pr)} совпадает со схемой на всех ${N} наборах.${btn}`);
  else showMsg('#exprMsg','bad',`<b>Ошибка.</b> Не совпадает при ${fmtEnv(diff.e)}: лампа ${diff.a?'горит':'не горит'}, а выражение даёт ${diff.b?1:0}. Вторая попытка в зачёте не даётся.${btn}`);
  renderExamBar();
}
function examNext(){
  if(EX.i<EX.seeds.length-1){EX.i++;loadSeed(EX.seeds[EX.i]);return}
  EX.done=true;const k=EX.res.filter(Boolean).length,n=EX.seeds.length;
  if(k===n){
    AL.report('n11',{mastered:true,via:'exam'});
    addLog('Верно','зачёт',`Зачёт сдан: ${k} из ${n}`);
    showMsg('#exprMsg','ok',`<b>Зачёт сдан: ${k} из ${n}.</b> Тема 11 засчитана, на карте открылась следующая тема.
      <div class="actions"><a class="btn primary" href="#map">На карту навыков</a><button class="btn" id="examStay">Остаться в тренажёре</button></div>`);
  }else{
    addLog('Зачёт','—',`Не сдан: ${k} из ${n}`);
    showMsg('#exprMsg','bad',`<b>Зачёт не сдан: верно ${k} из ${n}.</b> Нужны все три. Потренируйся на обычных схемах, особенно уровня 3, и попробуй снова.
      <div class="actions"><button class="btn primary" id="examRetry">Сдать ещё раз</button><button class="btn" id="examStay">Тренироваться</button></div>`);
  }
  renderExamBar();
}
$('#examBar').addEventListener('click',e=>{if(e.target.id==='examQuit')stopExam()});

/* ---------- вход из карты навыков ---------- */
function enter(arg){
  if(arg==='exam'){startExam();return}
  if(EX&&!arg){if(EX.done){EX=null;renderExamBar();hideMsg('#exprMsg');loadSeed(randomSeed(level))}else try{history.replaceState(null,'','#t11-'+S.seed)}catch(e){}return}
  const s=arg?normSeed(arg,level):null;
  if(s){if(EX&&!EX.seeds.includes(s)){EX=null;renderExamBar()}if(!S||s!==S.seed)loadSeed(s,false);return}
  if(!S)loadSeed(store.get('last',null)||randomSeed(level));
  else try{history.replaceState(null,'','#t11-'+S.seed)}catch(e){}
}
function refresh(){progress=store.get('progress',{});log=store.get('log',[]);if(S)renderAll()}
$('#level').value=String(level);
return {enter,refresh};

}

AL.register('t11',{title:'Схемы',logRows:()=>store.get('log',[]),exportData,importData,enter:arg=>mount().enter(arg)});
summarize();
})();
