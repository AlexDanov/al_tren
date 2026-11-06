/* Тренажёр 5 «Законы алгебры логики»: узнать закон по шагу преобразования и упростить выражение по шагам,
   называя закон каждого шага. Переместительный и сочетательный законы применяются свободно. */
(()=>{
const store=AL.store.scoped('t5');
const L=AL.logic;
const lc=s=>s[0].toLowerCase()+s.slice(1);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- n-арные деревья: ∧ и ∨ со списком операндов ---------- */
const DUAL={and:'or',or:'and'};
const C0={op:'const',v:0},C1={op:'const',v:1};
const KC=new WeakMap();
function key(n){let k=KC.get(n);if(k===undefined){k=key0(n);KC.set(n,k)}return k}
function key0(n){
  switch(n.op){case 'var':return n.v;case 'const':return String(n.v);case 'not':return '¬'+key(n.a);
    case 'and':case 'or':return (n.op==='and'?'&':'|')+'('+n.args.map(key).sort().join(',')+')';
    default:return n.op+'('+key(n.a)+','+key(n.b)+')'}
}
function norm(n){
  if(n.op==='var'||n.op==='const')return n;
  if(n.op==='not')return {op:'not',a:norm(n.a)};
  if(n.op==='and'||n.op==='or'){
    let args=[];n.args.map(norm).forEach(x=>{if(x.op===n.op)args.push(...x.args);else args.push(x)});
    if(!args.length)return n.op==='and'?C1:C0;if(args.length===1)return args[0];
    const ks=args.map(x=>[key(x),x]).sort((x,y)=>x[0]<y[0]?-1:x[0]>y[0]?1:0);return {op:n.op,args:ks.map(x=>x[1])};
  }
  return {op:n.op,a:norm(n.a),b:norm(n.b)};
}
function toN(t){if(t.op==='var'||t.op==='const')return t;if(t.op==='not')return {op:'not',a:toN(t.a)};
  if(t.op==='and'||t.op==='or')return norm({op:t.op,args:[toN(t.a),toN(t.b)]});return {op:t.op,a:toN(t.a),b:toN(t.b)}}
function fromN(n){if(n.op==='var'||n.op==='const')return n;if(n.op==='not')return {op:'not',a:fromN(n.a)};
  if(n.args)return n.args.map(fromN).reduce((a,b)=>({op:n.op,a,b}));return {op:n.op,a:fromN(n.a),b:fromN(n.b)}}
const show=n=>L.pretty(fromN(n));
const neg=x=>({op:'not',a:x});
const negS=x=>x.op==='not'?x.a:neg(x);              // отрицание без двойного ¬ (для генератора)
const mk=(op,args)=>norm({op,args});
function size(n){if(n.op==='var'||n.op==='const')return 0;if(n.op==='not')return 1+size(n.a);if(n.args)return n.args.length-1+n.args.reduce((s,x)=>s+size(x),0);return 1+size(n.a)+size(n.b)}
function stripD(n){if(n.op==='not'&&n.a.op==='not')return stripD(n.a.a);if(n.op==='not')return {op:'not',a:stripD(n.a)};
  if(n.args)return norm({op:n.op,args:n.args.map(stripD)});if(n.a)return {op:n.op,a:stripD(n.a),b:stripD(n.b)};return n}
function varsN(n,s=new Set()){if(n.op==='var')s.add(n.v);if(n.a)varsN(n.a,s);if(n.b)varsN(n.b,s);if(n.args)n.args.forEach(x=>varsN(x,s));return s}
function truth(n,vs){const t=fromN(n);return [...Array(1<<vs.length).keys()].map(m=>{const e={};vs.forEach((v,i)=>e[v]=(m>>(vs.length-1-i))&1);return L.evaluate(t,e)})}

/* ---------- законы: локальное применение к узлу ---------- */
const without=(arr,i)=>arr.filter((_,j)=>j!==i);
const has=(n,k)=>n.args&&n.args.some(x=>key(x)===k);
const removeK=(n,k)=>{const i=n.args.findIndex(x=>key(x)===k);return mk(n.op,without(n.args,i))};
const LAWS=[
  {id:'dneg',name:'Двойное отрицание',f:'¬¬X = X',ap:x=>x.op==='not'&&x.a.op==='not'?[x.a.a]:[]},
  {id:'dm',name:'Законы де Моргана',f:'¬(X ∧ Y) = ¬X ∨ ¬Y,  ¬(X ∨ Y) = ¬X ∧ ¬Y',ap:x=>{
    const o=[];if(x.op==='not'&&DUAL[x.a.op])o.push(mk(DUAL[x.a.op],x.a.args.map(neg)));
    if(DUAL[x.op]&&x.args.every(a=>a.op==='not'))o.push(neg(mk(DUAL[x.op],x.args.map(a=>a.a))));return o}},
  {id:'imp',name:'Раскрытие импликации',f:'X → Y = ¬X ∨ Y',ap:(x,opt)=>{
    const o=[];if(x.op==='imp')o.push(mk('or',[neg(x.a),x.b]));
    if(!(opt&&opt.search)&&x.op==='or'&&x.args.length===2)x.args.forEach((a,i)=>{if(a.op==='not')o.push({op:'imp',a:a.a,b:x.args[1-i]})});return o}},
  {id:'eq',name:'Раскрытие эквивалентности',f:'X ≡ Y = X ∧ Y ∨ ¬X ∧ ¬Y',ap:x=>x.op==='eq'?[mk('or',[mk('and',[x.a,x.b]),mk('and',[neg(x.a),neg(x.b)])]),mk('and',[{op:'imp',a:x.a,b:x.b},{op:'imp',a:x.b,b:x.a}])]:[]},
  {id:'xor',name:'Раскрытие ⊕',f:'X ⊕ Y = X ∧ ¬Y ∨ ¬X ∧ Y',ap:x=>x.op==='xor'?[mk('or',[mk('and',[x.a,neg(x.b)]),mk('and',[neg(x.a),x.b])]),neg({op:'eq',a:x.a,b:x.b})]:[]},
  {id:'dist',name:'Распределительный закон',f:'X ∧ (Y ∨ Z) = X ∧ Y ∨ X ∧ Z,  X ∨ Y ∧ Z = (X ∨ Y) ∧ (X ∨ Z)',ap:(x,opt)=>{
    const o=[];if(!DUAL[x.op])return o;const d=DUAL[x.op];
    // раскрыть скобки (при поиске упрощения не нужно: только выносим за скобки)
    if(!(opt&&opt.search))x.args.forEach((a,i)=>{if(a.op===d){const rest=without(x.args,i);o.push(mk(d,a.args.map(y=>mk(x.op,[...rest,y]))))}});
    // вынести общий множитель
    const ds=x.args.map((a,i)=>({a,i})).filter(z=>z.a.op===d);
    const common=new Map();ds.forEach(z=>z.a.args.forEach(y=>{const k=key(y);if(!common.has(k))common.set(k,{y,s:new Set()});common.get(k).s.add(z.i)}));
    common.forEach(({y,s})=>{if(s.size<2)return;const idx=[...s];
      const inner=mk(x.op,idx.map(i=>removeK(x.args[i],key(y))));
      o.push(mk(x.op,[...x.args.filter((_,j)=>!s.has(j)),mk(d,[y,inner])]))});
    return o}},
  {id:'abs',name:'Поглощение',f:'X ∨ X ∧ Y = X,  X ∧ (X ∨ Y) = X',ap:x=>{
    const o=[];if(!DUAL[x.op])return o;
    x.args.forEach((X,i)=>x.args.forEach((D,j)=>{if(i!==j&&D.op===DUAL[x.op]&&has(D,key(X)))o.push(mk(x.op,without(x.args,j)))}));return o}},
  {id:'glue',name:'Склеивание',f:'X ∧ Y ∨ X ∧ ¬Y = X,  (X ∨ Y) ∧ (X ∨ ¬Y) = X',ap:x=>{
    const o=[];if(!DUAL[x.op])return o;const d=DUAL[x.op];
    const asD=a=>a.op===d?a.args:[a];
    for(let i=0;i<x.args.length;i++)for(let j=i+1;j<x.args.length;j++){
      const A=asD(x.args[i]),Bv=asD(x.args[j]);if(A.length!==Bv.length||A.length<2)continue;
      const ka=A.map(key),kb=Bv.map(key);const onlyA=ka.filter(k=>!kb.includes(k)),onlyB=kb.filter(k=>!ka.includes(k));
      if(onlyA.length===1&&onlyB.length===1&&(onlyA[0]==='¬'+onlyB[0]||onlyB[0]==='¬'+onlyA[0])){
        const common=A.filter(a=>key(a)!==onlyA[0]);o.push(mk(x.op,[...x.args.filter((_,k)=>k!==i&&k!==j),mk(d,common)]))}}
    return o}},
  {id:'nabs',name:'Поглощение отрицания',f:'X ∨ ¬X ∧ Y = X ∨ Y,  X ∧ (¬X ∨ Y) = X ∧ Y',ap:x=>{
    const o=[];if(!DUAL[x.op])return o;
    x.args.forEach((X,i)=>{const nk=X.op==='not'?key(X.a):'¬'+key(X);
      x.args.forEach((D,j)=>{if(i!==j&&D.op===DUAL[x.op]&&has(D,nk)){const args=x.args.slice();args[j]=removeK(D,nk);o.push(mk(x.op,args))}})});return o}},
  {id:'compl',name:'Исключённое третье и противоречие',f:'X ∨ ¬X = 1,  X ∧ ¬X = 0',ap:x=>{
    if(!DUAL[x.op])return [];const ks=x.args.map(key);
    return ks.some(k=>ks.includes('¬'+k))?[x.op==='or'?C1:C0]:[]}},
  {id:'const',name:'Операции с константами',f:'X ∨ 1 = 1,  X ∨ 0 = X,  X ∧ 1 = X,  X ∧ 0 = 0,  ¬0 = 1,  ¬1 = 0',ap:x=>{
    if(x.op==='not'&&x.a.op==='const')return [{op:'const',v:1-x.a.v}];
    if(!DUAL[x.op])return [];const z=x.op==='or'?1:0;const ks=x.args.map(key);
    if(ks.includes(String(z)))return [{op:'const',v:z}];
    if(ks.includes(String(1-z)))return [mk(x.op,x.args.filter(a=>key(a)!==String(1-z)))];return []}},
  {id:'idem',name:'Идемпотентность',f:'X ∨ X = X,  X ∧ X = X',ap:x=>{
    if(!DUAL[x.op])return [];const ks=x.args.map(key);const i=ks.findIndex((k,j)=>ks.indexOf(k)!==j);return i>=0?[mk(x.op,without(x.args,i))]:[]}}
];
const LAW=Object.fromEntries(LAWS.map(l=>[l.id,l]));
/* все результаты одного применения закона в любом месте дерева */
function succ(law,n,opt){
  const out=[];
  const walk=(node,rebuild)=>{
    law.ap(node,opt).forEach(r=>out.push(norm(rebuild(r))));
    if(node.op==='not')walk(node.a,c=>rebuild({op:'not',a:c}));
    else if(node.args)node.args.forEach((ch,i)=>walk(ch,c=>{const a=node.args.slice();a[i]=c;return rebuild({op:node.op,args:a})}));
    else if(node.a){walk(node.a,c=>rebuild({op:node.op,a:c,b:node.b}));walk(node.b,c=>rebuild({op:node.op,a:node.a,b:c}))}
  };
  walk(n,x=>x);return out;
}
/* шаг ученика подходит под закон: одно или два применения, двойное отрицание убирается свободно */
function matchLaw(law,prev,next){
  const target=key(stripD(next));const s1=succ(law,prev);
  if(s1.some(x=>key(stripD(x))===target))return true;
  if(s1.length>40)return false;
  return s1.some(x=>succ(law,x).some(y=>key(stripD(y))===target));
}
/* лучший-первый поиск кратчайшего упрощения; возвращает минимальный размер и первый закон пути */
function search(start,limit=1500){
  // очередь по размеру выражения: сначала раскрываем самые короткие
  const B=[],seen=new Set([key(start)]);let lo=size(start);
  const push=(n,path)=>{const z=size(n);(B[z]||(B[z]=[])).push({n,path});if(z<lo)lo=z};
  push(start,[]);
  let best={n:start,path:[],size:size(start)},steps=0;const cap=size(start)+2;
  while(steps<limit){
    while(lo<B.length&&!(B[lo]&&B[lo].length))lo++;if(lo>=B.length)break;
    const cur=B[lo].shift();steps++;const sz=lo;
    if(sz<best.size||(sz===best.size&&cur.path.length&&cur.path.length<best.path.length))best={n:cur.n,path:cur.path,size:sz};
    if(cur.path.length>=9)continue;
    for(const law of LAWS)for(const r of succ(law,cur.n,{search:true})){const s=stripD(r);if(size(s)>cap)continue;const k=key(s);if(seen.has(k))continue;seen.add(k);push(s,cur.path.concat(law.id))}
  }
  return best;
}
function dupFree(n){if(n.args){const ks=n.args.map(key);if(new Set(ks).size<ks.length)return false;return n.args.every(dupFree)}if(n.op==='not')return dupFree(n.a);if(n.a)return dupFree(n.a)&&dupFree(n.b);return true}

/* ---------- генератор: от простого ответа к сложному выражению обратными шагами ---------- */
function xmur3(str){let h=1779033703^str.length;for(let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353);h=h<<13|h>>>19}
  return()=>{h=Math.imul(h^(h>>>16),2246822507);h=Math.imul(h^(h>>>13),3266489909);return(h^=h>>>16)>>>0}}
function mulberry32(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function normSeed(raw,lvl){let s=String(raw||'').toUpperCase().replace(/[^A-Z0-9-]/g,'').replace(/^-+|-+$/g,'');if(!s)return null;if(!/^[123]-./.test(s))s=lvl+'-'+s;return s.slice(0,24)}
function randomSeed(lvl){const A='ABCDEFGHJKMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<5;i++)s+=A[Math.floor(Math.random()*A.length)];return lvl+'-'+s}
const V=v=>({op:'var',v});
function positions(n,acc=[],path=[]){acc.push(path);if(n.op==='not')positions(n.a,acc,path.concat('a'));else if(n.args)n.args.forEach((c,i)=>positions(c,acc,path.concat(i)));else if(n.a){positions(n.a,acc,path.concat('a'));positions(n.b,acc,path.concat('b'))}return acc}
const getAt=(n,p)=>p.reduce((x,k)=>typeof k==='number'?x.args[k]:x[k],n);
function setAt(n,p,v){if(!p.length)return v;const c=JSON.parse(JSON.stringify(n));let x=c;for(let i=0;i<p.length-1;i++)x=typeof p[i]==='number'?x.args[p[i]]:x[p[i]];const l=p[p.length-1];if(typeof l==='number')x.args[l]=v;else x[l]=v;return norm(c)}
function generate(seed){
  const lvl=+seed[0]||1;
  for(let att=0;att<120;att++){
    const r=mulberry32(xmur3(seed+'#'+att)());const pick=a=>a[Math.floor(r()*a.length)];
    const vars=lvl===1?['A','B']:['A','B','C'];
    const lit=()=>{const v=V(pick(vars));return r()<.35?neg(v):v};
    let t=lit();if(r()<(lvl===1?.5:.75)){let u=lit();while(key(u)===key(t)||key(u)==='¬'+key(t)||key(t)==='¬'+key(u))u=lit();t=mk(pick(['and','or']),[t,u])}
    const target=t;
    const moves=lvl===1?['abs','glue','nabs','dm','imp']:lvl===2?['abs','glue','nabs','dm','imp','dist']:['abs','glue','nabs','dm','imp','dist','dist'];
    let n=target;const k=lvl===1?2:lvl===2?3:5;
    for(let i=0;i<k;i++){
      const ps=positions(n);const p=pick(ps);const x=getAt(n,p);const mv=pick(moves);let y=null;
      const otherLit=()=>{let l=lit();let g=0;while(key(l)===key(x)&&g++<5)l=lit();return l};
      if(mv==='abs'&&x.op!=='const')y=r()<.5?mk('or',[x,mk('and',[x,otherLit()])]):mk('and',[x,mk('or',[x,otherLit()])]);
      if(mv==='glue'){const v=V(pick(vars));if(!varsN(x).has(v.v))y=r()<.5?mk('or',[mk('and',[x,v]),mk('and',[x,neg(v)])]):mk('and',[mk('or',[x,v]),mk('or',[x,neg(v)])])}
      if(mv==='nabs'&&DUAL[x.op]&&x.args.length===2){const [X,Y]=r()<.5?x.args:[x.args[1],x.args[0]];y=mk(x.op,[X,mk(DUAL[x.op],[negS(X),Y])])}
      if(mv==='dm'&&DUAL[x.op])y=neg(mk(DUAL[x.op],x.args.map(negS)));
      if(mv==='imp'&&x.op==='or'&&x.args.length===2){const [X,Y]=r()<.5?x.args:[x.args[1],x.args[0]];y={op:'imp',a:negS(X),b:Y}}
      if(mv==='dist'&&DUAL[x.op]){const outs=LAW.dist.ap(x).filter(z=>size(z)>size(x));if(outs.length)y=pick(outs)}
      if(y)n=setAt(n,p,y);
    }
    const txt=show(n);
    if(size(n)-size(target)<3||txt.length>(lvl===3?44:36)||varsN(n).size<2||!dupFree(n))continue;
    const vs=[...varsN(n)].sort();
    const best=search(n,lvl===3?1800:1200);
    if(best.size>size(target))continue;
    if(best.path.length<(lvl===1?2:lvl===2?3:4))continue;
    return {seed,level:lvl,start:n,goal:best.size,answer:best.n,vars:vs};
  }
  return generate(lvl+'-AAAAA');
}

const MARKUP=`<div class="app t5">
  <header class="top">
    <div class="brand">
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 6v26M12 34h16M7 11h26" stroke="var(--ink)" stroke-width="2.4" stroke-linecap="round" fill="none"/><path d="M7 11l-4 8h8zM33 11l-4 8h8z" fill="var(--glow)" stroke="var(--live)" stroke-width="2" stroke-linejoin="round"/></svg>
      <div><a class="back" href="#map">← Карта навыков</a><h1>Законы алгебры логики</h1><p>Узнать закон по шагу и упростить выражение, называя каждый шаг</p></div>
    </div>
    <div class="controls">
      <div class="field"><label for="x5Student">Ученик</label><input type="text" id="x5Student" placeholder="Фамилия Имя" autocomplete="off"></div>
      <div class="field x5-sp"><label for="x5Seed">Задание №</label><div class="row"><input type="text" id="x5Seed" class="seedin" spellcheck="false" autocomplete="off"><button class="btn" id="x5Open">Открыть</button></div></div>
      <div class="field x5-sp"><label for="x5Level">Уровень</label><div class="row"><select id="x5Level"><option value="1">1 · A, B, 2–3 шага</option><option value="2">2 · A, B, C, скобки</option><option value="3">3 · длинные цепочки</option></select><button class="btn primary" id="x5New">Новое выражение</button></div></div>
      <button class="btn" id="x5Log">Журнал</button>
    </div>
  </header>
  <div class="exam-bar" id="x5ExamBar" hidden></div>
  <div class="seg" role="tablist" aria-label="Режим">
    <button role="tab" id="x5TabRc" aria-selected="true">Узнай закон <span class="pill ok" id="x5RcCnt">0/8</span></button>
    <button role="tab" id="x5TabSp" aria-selected="false">Упрости по шагам <span class="pill ok" id="x5SpCnt">0/4</span></button>
  </div>
  <div class="t5-wrap">
    <div class="t5-main">
      <section class="card" id="x5Rc">
        <div class="card-h"><span class="step">?</span><h2>Какой закон применили?</h2><p>Выражение слева превратилось в выражение справа за один шаг. Перестановка операндов местами законом не считается.</p></div>
        <div class="body">
          <div class="rc-step"><div class="rc-e" id="x5RcA"></div><div class="rc-arr">=</div><div class="rc-e" id="x5RcB"></div></div>
          <div class="rc-opts" id="x5RcOpts"></div>
          <div class="msg" id="x5RcMsg"></div>
        </div>
      </section>
      <section class="card" id="x5Sp" hidden>
        <div class="card-h"><span class="step">↓</span><h2>Упрости выражение</h2><p id="x5SpSub"></p></div>
        <div class="body">
          <ol class="chain" id="x5Chain"></ol>
          <div class="next-step" id="x5NextBox">
            <div class="exprline"><span class="pre">=</span><input type="text" id="x5Expr" placeholder="следующий шаг" spellcheck="false" autocomplete="off" aria-label="Следующий шаг"></div>
            <div class="preview" id="x5Prev">&nbsp;</div>
            <div class="pad" id="x5Pad"></div>
            <div class="lawpick"><label for="x5Law" class="lbl">Закон этого шага</label><select id="x5Law"><option value="">— выбери закон —</option></select></div>
            <div class="actions"><button class="btn primary" id="x5Add">Добавить шаг</button><button class="btn ghost" id="x5Undo">Отменить последний шаг</button><button class="btn ghost" id="x5Hint">Подсказка</button><span class="tries" id="x5SpTries"></span></div>
          </div>
          <div class="msg" id="x5SpMsg"></div>
        </div>
      </section>
    </div>
    <aside class="card laws">
      <div class="card-h"><span class="step">§</span><h2>Законы</h2></div>
      <div class="body"><dl class="lawlist" id="x5Laws"></dl><p class="tries">Переместительный и сочетательный законы можно применять без отдельного шага. Двойное отрицание можно убирать попутно.</p></div>
    </aside>
  </div>
</div>
<div class="toast" id="x5Toast"></div>`;

/* ---------- прогресс ---------- */
function summarize(){
  const prog=store.get('progress',{}),rc=store.get('rc',0);
  if(!Object.keys(prog).length&&!rc&&!AL.node('n5').touched)return;
  const sol=Object.entries(prog).filter(([k,p])=>p.ok),hi=sol.filter(([k])=>+k[0]>=2).length,nS=Math.min(sol.length,4),nR=Math.min(rc,8);
  const mastered=rc>=8&&sol.length>=4&&hi>=2;
  AL.report('n5',{done:nS+nR,total:12,note:`Законы ${nR} из 8 · упрощения ${nS} из 4`+(nS>=2&&hi<2?` · уровня 2–3: ${hi} из 2`:''),mastered,via:mastered?'practice':undefined});
}
function exportData(){const prog=store.get('progress',{}),o={};Object.entries(prog).slice(-300).forEach(([k,p])=>o[k]=[p.ok?1:0,p.errors||0,p.hints||0,p.first||'']);return {p:o,r:store.get('rc',0)}}
function importData(d){if(!d)return;const prog=store.get('progress',{});
  for(const [k,a] of Object.entries(d.p||{})){const c=prog[k]||(prog[k]={ok:false,errors:0,hints:0,first:a[3]||new Date().toISOString()});c.ok=c.ok||!!a[0];c.errors=Math.max(c.errors,a[1]||0);c.hints=Math.max(c.hints,a[2]||0)}
  store.set('progress',prog);store.set('rc',Math.max(store.get('rc',0),d.r||0));summarize();if(api)api.refresh()}

let api=null;
function mount(){if(api)return api;document.getElementById('view-t5').innerHTML=MARKUP;api=init();return api}

function init(){
const $=s=>document.querySelector(s);
let progress=store.get('progress',{}),log=store.get('log',[]),level=store.get('level',1),mode=store.get('mode','rc'),rc=store.get('rc',0);
let S=null,RC=null,EX=null;
const saveP=()=>store.set('progress',progress);
function addLog(stage,input,note,id){log.push({t:new Date().toISOString(),seed:id||(S?S.seed:'—'),student:AL.student.get(),stage,input,note});if(log.length>3000)log=log.slice(-3000);store.set('log',log)}
function toast(t){const el=$('#x5Toast');el.textContent=t;el.classList.add('show');clearTimeout(toast.h);toast.h=setTimeout(()=>el.classList.remove('show'),1800)}
function showMsg(sel,cls,html){const el=$(sel);el.className='msg show '+cls;el.innerHTML=html}
function hideMsg(sel){$(sel).className='msg'}
function setHash(h){if(location.hash.slice(1)!==h){try{history.replaceState(null,'','#'+h)}catch(e){location.hash=h}}}
const app=()=>document.querySelector('.app.t5');
$('#x5Laws').innerHTML=LAWS.map(l=>`<div><dt>${esc(l.name)}</dt><dd>${esc(l.f)}</dd></div>`).join('');
$('#x5Law').innerHTML='<option value="">— выбери закон —</option>'+LAWS.map(l=>`<option value="${l.id}">${esc(l.name)}</option>`).join('');

function setMode(m,push=true){
  mode=m;if(!EX)store.set('mode',m);
  $('#x5TabRc').setAttribute('aria-selected',m==='rc');$('#x5TabSp').setAttribute('aria-selected',m==='sp');
  $('#x5Rc').hidden=m!=='rc';$('#x5Sp').hidden=m!=='sp';app().classList.toggle('mode-rc',m==='rc');
  if(m==='rc'&&!RC)nextRc();
  if(m==='sp'){if(!S)loadSeed(store.get('last',null)||randomSeed(level),push);else if(push&&!EX)setHash('t5-'+S.seed)}
  else if(push&&!EX)setHash('t5-rc');
  renderCounts();
}
function renderCounts(){$('#x5RcCnt').textContent=Math.min(rc,8)+'/8';$('#x5SpCnt').textContent=Math.min(Object.values(progress).filter(p=>p.ok).length,4)+'/4'}

/* ---------- узнай закон ---------- */
function nextRc(){
  for(let g=0;g<60;g++){
    const lvl=1+Math.floor(Math.random()*3);const T=generate(randomSeed(lvl));
    const law=LAWS[Math.floor(Math.random()*LAWS.length)];
    // шаг берём из середины пути упрощения или прямо из выражения
    let from=T.start;const path=search(T.start,600).path;let cur=T.start;
    for(let i=0;i<Math.floor(Math.random()*Math.min(path.length,3));i++){const s=succ(LAW[path[i]],cur);if(!s.length)break;cur=stripD(s[0])}
    from=cur;
    const outs=succ(law,from).filter(x=>key(x)!==key(from));if(!outs.length)continue;
    const to=outs[Math.floor(Math.random()*outs.length)];
    if(show(from).length>38||show(to).length>40)continue;
    const also=LAWS.filter(l=>l.id!==law.id&&succ(l,from).some(x=>key(x)===key(to)));
    const wrong=AL.shuffle(LAWS.filter(l=>l.id!==law.id&&!also.includes(l))).slice(0,3);
    RC={from,to,law,opts:AL.shuffle([law,...wrong]),done:false};
    $('#x5RcA').textContent=show(from);$('#x5RcB').textContent=show(to);
    $('#x5RcOpts').innerHTML=RC.opts.map((l,i)=>`<button class="btn ropt" data-id="${l.id}"><span class="k">${i+1}</span><span><b>${esc(l.name)}</b><small>${esc(l.f)}</small></span></button>`).join('');
    hideMsg('#x5RcMsg');return;
  }
}
function answerRc(id){
  if(RC.done)return;RC.done=true;const ok=id===RC.law.id;
  document.querySelectorAll('#x5RcOpts .ropt').forEach(b=>{b.disabled=true;if(b.dataset.id===RC.law.id)b.classList.add('ok');else if(b.dataset.id===id)b.classList.add('bad')});
  const step=`${show(RC.from)} = ${show(RC.to)}`;
  if(EX){EX.cur.ok=ok;addLog('Зачёт',LAW[id].name,`${step} — ${ok?'верно':'это '+RC.law.name}`,'закон')}
  else if(ok){rc++;store.set('rc',rc);addLog('Верно',LAW[id].name,step,'закон')}
  else addLog('Закон',LAW[id].name,`${step}; верно: ${RC.law.name}`,'закон');
  const nxt=EX?`<button class="btn primary" id="x5ExNext">${EX.i<EX.tasks.length-1?'Дальше →':'Итог зачёта'}</button>`:'<button class="btn primary" id="x5RcNext">Дальше →</button>';
  showMsg('#x5RcMsg',ok?'ok':'bad',`<b>${ok?'Верно.':'Нет.'}</b> Это ${esc(lc(RC.law.name))}: ${esc(RC.law.f)}.<div class="actions">${nxt}</div>`);
  summarize();renderCounts();if(EX)renderExamBar();
  setTimeout(()=>{const b=$('#x5ExNext')||$('#x5RcNext');b&&b.focus()},0);
}

/* ---------- упрощение по шагам ---------- */
function P(){return progress[S.seed]||(progress[S.seed]={ok:false,errors:0,hints:0,first:new Date().toISOString()})}
function loadSeed(seed,push=true){
  const g=generate(seed);
  S=Object.assign(g,{chain:[{n:g.start,law:null,txt:show(g.start)}],errors:0,hints:0,done:false});
  const p=P();
  if(!EX&&Array.isArray(p.chain)&&p.chain.length>1&&!p.ok){try{S.chain=[S.chain[0],...p.chain.slice(1).map(c=>({n:toN(L.parse(c.txt)),law:c.law,txt:c.txt}))]}catch(e){}}
  level=S.level;$('#x5Level').value=String(level);$('#x5Seed').value=seed;
  if(!EX)store.set('last',seed);if(push&&!EX)setHash('t5-'+seed);
  hideMsg('#x5SpMsg');
  if(p.ok&&!EX){S.done=true;showMsg('#x5SpMsg','ok',`<b>Решено.</b> Это выражение уже упрощено до ${esc(show(S.answer))}. Можно взять новое.<div class="actions"><button class="btn primary" id="x5NextSeed">Новое выражение →</button></div>`)}
  renderSp();
}
const curN=()=>S.chain[S.chain.length-1].n;
function renderSp(){
  $('#x5SpSub').textContent=`Цель: равносильное выражение, в котором не больше ${S.goal} ${S.goal===1?'операции':'операций'}. Сейчас операций: ${size(curN())}.`;
  $('#x5Chain').innerHTML=S.chain.map((c,i)=>`<li class="${i?'':'first'}"><span class="ce">${i?'= ':''}${esc(c.txt)}</span>${c.law?`<span class="cl">${esc(LAW[c.law].name)}</span>`:'<span class="cl muted">исходное выражение</span>'}<span class="cs">${size(c.n)} оп.</span></li>`).join('');
  $('#x5NextBox').hidden=S.done;
  const vs=S.vars;
  const keys=[...vs.map(v=>[v,v,'']),['¬','¬','op'],['∧',' ∧ ','op'],['∨',' ∨ ','op'],['→',' → ','op'],['(','(',''],[')',')',''],['0','0',''],['1','1',''],['⌫','BS',''],['Сброс','CLR',''],['⇣','COPY','']];
  $('#x5Pad').innerHTML=keys.map(([l,ins,c])=>`<button class="${c}" data-ins="${esc(ins)}" ${ins==='COPY'?'title="Вставить предыдущее выражение"':''}>${l==='⇣'?'⇣ взять предыдущее':l}</button>`).join('');
  const p=P();$('#x5SpTries').textContent=EX?`Зачёт: можно ошибиться один раз, подсказки выключены · ошибок ${S.errors}`:`Ошибок: ${S.errors} · подсказок: ${S.hints}`;
  $('#x5Hint').hidden=!!EX;$('#x5Undo').disabled=S.chain.length<2;
}
function updPrev(){
  const src=$('#x5Expr').value,el=$('#x5Prev');
  if(!src.trim()){el.className='preview';el.innerHTML='&nbsp;';return null}
  try{const a=L.parse(src);el.className='preview';el.textContent='Читается как: '+L.pretty(a)+` · операций: ${size(toN(a))}`;return a}
  catch(e){if(!(e instanceof L.Err))throw e;el.className='preview err';el.textContent=`${e.msg} (позиция ${e.pos+1})`;return null}
}
function saveChain(){if(!EX){P().chain=S.chain.map(c=>({txt:c.txt,law:c.law}));saveP()}}
function addStep(){
  if(S.done)return;
  let ast;try{ast=L.parse($('#x5Expr').value)}catch(e){if(!(e instanceof L.Err))throw e;showMsg('#x5SpMsg','info',`Выражение не разобрано: ${esc(e.msg)}. Это не ошибка.`);return}
  const lawId=$('#x5Law').value;if(!lawId){showMsg('#x5SpMsg','info','Выбери закон, по которому сделан шаг.');return}
  const extra=[...L.vars(ast)].filter(v=>!S.vars.includes(v));
  if(extra.length){showMsg('#x5SpMsg','info',`В выражении нет переменной ${extra.join(', ')}. Это не ошибка.`);return}
  const prev=curN(),next=norm(toN(ast));
  if(key(stripD(next))===key(stripD(prev))){showMsg('#x5SpMsg','info','Это то же самое выражение, только с переставленными операндами. Примени какой-нибудь закон.');return}
  const vs=S.vars,tp=truth(prev,vs),tn=truth(next,vs);
  const d=tp.findIndex((v,i)=>v!==tn[i]);
  const fail=(note,html)=>{S.errors++;if(!EX){P().errors=Math.max(P().errors,S.errors);saveP()}addLog(EX?'Зачёт':'Шаг',`${L.pretty(ast)} [${LAW[lawId].name}]`,note);showMsg('#x5SpMsg','bad',html);renderSp();examCheckFail()};
  if(d>=0){const e={};vs.forEach((v,i)=>e[v]=(d>>(vs.length-1-i))&1);
    fail('не равносильно',`<b>Шаг не равносилен.</b> При ${Object.entries(e).map(([k,v])=>k+' = '+v).join(', ')} предыдущее выражение равно ${tp[d]}, а новое — ${tn[d]}. Проверь, как применён закон.`);return}
  if(!matchLaw(LAW[lawId],prev,next)){
    const real=LAWS.find(l=>matchLaw(l,prev,next));
    if(real)fail('закон назван неверно',`<b>Шаг верный, но закон другой.</b> Это ${esc(lc(real.name))}: ${esc(real.f)}.`);
    else{showMsg('#x5SpMsg','info','<b>Шаг равносилен, но слишком большой:</b> одним законом так не получится. Разбей его на несколько шагов. Ошибкой это не считается.');addLog(EX?'Зачёт':'Шаг',L.pretty(ast),'шаг слишком большой')}
    return;
  }
  S.chain.push({n:next,law:lawId,txt:L.pretty(ast)});saveChain();
  $('#x5Expr').value='';$('#x5Law').value='';updPrev();
  addLog(EX?'Зачёт':'Шаг',`${L.pretty(ast)} [${LAW[lawId].name}]`,'шаг верный');
  if(size(next)<=S.goal){
    S.done=true;
    if(EX){EX.cur.ok=S.errors<=1;renderExamBar();
      showMsg('#x5SpMsg',EX.cur.ok?'ok':'bad',`<b>Упрощено.</b> Ошибок: ${S.errors}.<div class="actions"><button class="btn primary" id="x5ExNext">${EX.i<EX.tasks.length-1?'Дальше →':'Итог зачёта'}</button></div>`)}
    else{const p=P();p.ok=true;saveP();addLog('Верно',L.pretty(ast),`упрощено за ${S.chain.length-1} шаг., ошибок ${S.errors}`);
      showMsg('#x5SpMsg','ok',`<b>Готово!</b> Выражение упрощено до ${esc(L.pretty(ast))} за ${S.chain.length-1} ${S.chain.length-1<5?'шага':'шагов'}.<div class="actions"><button class="btn primary" id="x5NextSeed">Новое выражение →</button></div>`)}
    summarize();renderCounts();
  }else showMsg('#x5SpMsg','ok',`<b>Верно.</b> ${esc(LAW[lawId].name)}. Операций: ${size(next)}, цель — не больше ${S.goal}.`);
  renderSp();
  if(!S.done)setTimeout(()=>$('#x5Expr').focus(),0);
}
function examCheckFail(){if(EX&&S.errors>1&&!S.done){S.done=true;EX.cur.ok=false;renderExamBar();
  showMsg('#x5SpMsg','bad',`<b>Вторая ошибка.</b> В зачёте на упрощение можно ошибиться только один раз. Одно из решений: ${esc(show(S.answer))}.<div class="actions"><button class="btn primary" id="x5ExNext">${EX.i<EX.tasks.length-1?'Дальше →':'Итог зачёта'}</button></div>`);renderSp()}}
function hint(){
  if(S.done||EX)return;
  const r=search(curN(),900);
  if(!r.path.length){showMsg('#x5SpMsg','info','Отсюда короче уже не получается. Проверь цель: возможно, ты уже у неё.');return}
  S.hints++;P().hints=Math.max(P().hints||0,S.hints);saveP();
  const l=LAW[r.path[0]];addLog('Подсказка','—',l.name);
  showMsg('#x5SpMsg','info',`<b>Подсказка:</b> попробуй закон «${esc(l.name)}»: ${esc(l.f)}.`);renderSp();
}

/* ---------- зачёт: 3 закона и одно упрощение уровня 2 ---------- */
function startExam(){
  EX={tasks:['rc','rc','sp','rc'],i:0,res:[],cur:{},done:false,seed:randomSeed(2)};
  addLog('Зачёт','—','Начат зачёт','зачёт');app().classList.add('exam');showTask();
}
function showTask(){
  const t=EX.tasks[EX.i];EX.cur={};setMode(t,false);
  if(t==='rc')nextRc();else loadSeed(EX.seed,false);
  renderExamBar();window.scrollTo(0,0);
}
function renderExamBar(){
  const bar=$('#x5ExamBar');if(!EX){bar.hidden=true;app().classList.remove('exam');return}
  bar.hidden=false;
  bar.innerHTML=`<div class="ex-t"><b>Зачёт по теме 5</b><span>${EX.done?'Зачёт завершён':`Задание ${EX.i+1} из ${EX.tasks.length}`} · закон — одна попытка, в упрощении — не больше одной ошибки, без подсказок</span></div>
    <div class="ex-dots">${EX.tasks.map((t,i)=>`<span class="ex-dot ${i<EX.res.length?(EX.res[i]?'ok':'bad'):i===EX.i?'now':''}"></span>`).join('')}</div>
    <button class="btn ghost" id="x5ExQuit">${EX.done?'Закрыть зачёт':'Прервать зачёт'}</button>`;
}
function examNext(){
  EX.res.push(!!EX.cur.ok);
  if(EX.i<EX.tasks.length-1){EX.i++;showTask();return}
  EX.done=true;const k=EX.res.filter(Boolean).length,n=EX.tasks.length;renderExamBar();
  const sel=mode==='rc'?'#x5RcMsg':'#x5SpMsg';
  if(k===n){AL.report('n5',{mastered:true,via:'exam'});addLog('Верно','зачёт',`Зачёт сдан: ${k} из ${n}`,'зачёт');
    showMsg(sel,'ok',`<b>Зачёт сдан: ${k} из ${n}.</b> Тема 5 засчитана, открылась тема 6 «Уравнения».<div class="actions"><a class="btn primary" href="#map">На карту навыков</a><button class="btn" id="x5ExStay">Остаться в тренажёре</button></div>`)}
  else{addLog('Зачёт','—',`Не сдан: ${k} из ${n}`,'зачёт');
    showMsg(sel,'bad',`<b>Зачёт не сдан: верно ${k} из ${n}.</b> Потренируйся и попробуй снова.<div class="actions"><button class="btn primary" id="x5ExRetry">Сдать ещё раз</button><button class="btn" id="x5ExStay">Тренироваться</button></div>`)}
}
function stopExam(){
  if(EX&&!EX.done)addLog('Зачёт','—',`Прерван на задании ${EX.i+1}`,'зачёт');
  EX=null;renderExamBar();S=null;RC=null;setMode(store.get('mode','rc'));
}

/* ---------- события ---------- */
$('#x5TabRc').onclick=()=>{if(EX)return toast('Сначала закончи или прерви зачёт');setMode('rc')};
$('#x5TabSp').onclick=()=>{if(EX)return toast('Сначала закончи или прерви зачёт');setMode('sp')};
$('#x5RcOpts').addEventListener('click',e=>{const b=e.target.closest('.ropt');if(b)answerRc(b.dataset.id)});
document.addEventListener('keydown',e=>{
  if($('#view-t5').hidden||mode!=='rc'||!RC||RC.done)return;
  const tag=(e.target.tagName||'').toLowerCase();if(tag==='input'||tag==='select'||e.ctrlKey||e.metaKey||e.altKey)return;
  const i=+e.key-1;if(i>=0&&i<RC.opts.length){e.preventDefault();answerRc(RC.opts[i].id)}
});
$('#x5Expr').addEventListener('input',updPrev);
$('#x5Expr').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();addStep()}});
$('#x5Pad').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;const inp=$('#x5Expr'),ins=b.dataset.ins;
  let s=inp.selectionStart??inp.value.length,en=inp.selectionEnd??inp.value.length;
  if(ins==='COPY'){inp.value=S.chain[S.chain.length-1].txt;s=inp.value.length}
  else if(ins==='CLR'){inp.value='';s=0}
  else if(ins==='BS'){if(s===en&&s>0){inp.value=inp.value.slice(0,s-1)+inp.value.slice(en);s--}else inp.value=inp.value.slice(0,s)+inp.value.slice(en)}
  else{inp.value=inp.value.slice(0,s)+ins+inp.value.slice(en);s+=ins.length}
  inp.focus();try{inp.setSelectionRange(s,s)}catch(err){}updPrev();
});
$('#x5Add').onclick=addStep;
$('#x5Undo').onclick=()=>{if(S.done||S.chain.length<2)return;S.chain.pop();saveChain();hideMsg('#x5SpMsg');renderSp()};
$('#x5Hint').onclick=hint;
const onMsg=e=>{
  if(e.target.id==='x5RcNext')nextRc();
  if(e.target.id==='x5NextSeed')loadSeed(randomSeed(level));
  if(e.target.id==='x5ExNext')examNext();
  if(e.target.id==='x5ExRetry')startExam();
  if(e.target.id==='x5ExStay')stopExam();
};
$('#x5RcMsg').addEventListener('click',onMsg);$('#x5SpMsg').addEventListener('click',onMsg);
$('#x5ExamBar').addEventListener('click',e=>{if(e.target.id==='x5ExQuit')stopExam()});
$('#x5New').onclick=()=>loadSeed(randomSeed(+$('#x5Level').value));
$('#x5Level').onchange=()=>{level=+$('#x5Level').value;store.set('level',level)};
const openSeed=()=>{const s=normSeed($('#x5Seed').value,+$('#x5Level').value);if(!s){toast('Введи номер задания');return}loadSeed(s)};
$('#x5Open').onclick=openSeed;$('#x5Seed').addEventListener('keydown',e=>{if(e.key==='Enter')openSeed()});
$('#x5Student').value=AL.student.get();
$('#x5Student').addEventListener('input',()=>AL.student.set($('#x5Student').value));
AL.on('student',v=>{if(document.activeElement!==$('#x5Student'))$('#x5Student').value=v});
$('#x5Log').onclick=()=>AL.openLog&&AL.openLog();

function enter(arg){
  if(arg==='exam'){startExam();return}
  if(EX&&EX.done&&!arg){stopExam();return}
  if(EX)return;
  if(arg==='rc'){setMode('rc',false);return}
  const s=arg?normSeed(arg,level):null;
  if(s){setMode('sp',false);if(!S||S.seed!==s)loadSeed(s,false);return}
  setMode(mode,true);
}
function refresh(){progress=store.get('progress',{});rc=store.get('rc',0);renderCounts()}
$('#x5Level').value=String(level);
return {enter,refresh};
}

AL.register('t5',{title:'Законы',logRows:()=>store.get('log',[]),exportData,importData,enter:arg=>mount().enter(arg)});
summarize();
})();
