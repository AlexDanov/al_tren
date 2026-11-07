/* Общее ядро серии «Алгебра логики»: хранилище, ученик, состояние тем, журнал хаба,
   коды переноса прогресса и коды учителя. Каждый тренажёр регистрируется через AL.register. */
window.AL=(()=>{
const NS='al.';
const store={
  get(k,d){try{const v=localStorage.getItem(NS+k);return v==null?d:JSON.parse(v)}catch(e){return d}},
  set(k,v){try{localStorage.setItem(NS+k,JSON.stringify(v))}catch(e){}},
  scoped(p){return{get:(k,d)=>store.get(p+'.'+k,d),set:(k,v)=>store.set(p+'.'+k,v)}}
};
/* честное перемешивание (Фишер — Йетс); sort со случайным сравнением даёт перекос к исходному порядку */
function shuffle(a,rnd=Math.random){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const bus=new EventTarget();
const emit=(type,detail)=>bus.dispatchEvent(new CustomEvent(type,{detail}));
const on=(type,fn)=>bus.addEventListener(type,e=>fn(e.detail));

/* ---------- карта тем (по ФРП) ---------- */
const LANES=[
  {id:'base',title:'Основы'},
  {id:'trans',title:'Преобразования'},
  {id:'sets',title:'Множества'},
  {id:'func',title:'Функции'},
  {id:'circ',title:'Схемы'},
  {id:'ege',title:'ЕГЭ'}
];
const NODES=[
  {id:'n1',num:'1',lane:'base',title:'Высказывания',req:[],trainer:'t1',
   frp:'Понятие высказывания',
   does:'Решить, высказывание ли перед тобой и истинно ли оно. Перевести составную фразу в формулу: «если… то», «либо… либо», «только если», «необходимо», «ни… ни».',
   goal:'Дай 10 верных ответов подряд в разделе «Высказывание?» и переведи в формулы 8 разных фраз.',
   exam:'5 предложений и 3 фразы для перевода, по одной попытке на каждое. Все 8 верно — тема засчитана.'},
  {id:'n2',num:'2',lane:'base',title:'Предикаты и кванторы',req:['n1'],trainer:'t2',
   frp:'Высказывательные формы (предикаты). Кванторы существования и всеобщности',
   does:'Отметить множество истинности предиката, решить, истинны ли ∀x P(x) и ∃x P(x). Для двух переменных — понять, почему ∀x ∃y и ∃y ∀x не одно и то же. Построить отрицание высказывания с квантором.',
   goal:'Реши 5 заданий (множество и оба вопроса про кванторы), из них хотя бы 2 уровня 2 или 3, и построй 6 отрицаний.',
   exam:'Задание уровня 2, задание уровня 3 и два отрицания, по одной попытке на каждый шаг. Все четыре верно — тема засчитана.'},
  {id:'n3',num:'3',lane:'base',title:'Операции и таблицы',req:['n1'],trainer:'t3',
   frp:'Логические операции. Таблицы истинности. Логические выражения',
   does:'Разминка: таблицы для ¬, ∧, ∨, →, ≡, ⊕ и узнавание операции по столбцу. Затем выражения: расставить порядок действий и заполнить таблицу истинности по шагам.',
   goal:'Выучи все 6 операций в разминке и реши 4 выражения, из них хотя бы 2 уровня 2 или 3.',
   exam:'3 выражения (уровни 2, 2, 3). На каждое одна попытка на порядок действий и одна на итоговый столбец F. Все три верно — тема засчитана.'},
  {id:'n4',num:'4',lane:'trans',title:'Тождества',req:['n3'],trainer:'t4',
   frp:'Логические тождества. Доказательство тождеств с помощью таблиц истинности',
   does:'Построить таблицы двух выражений и решить, тождественны ли они; если нет — указать строку-контрпример. Отличить тавтологию, противоречие и выполнимое выражение. Пары подобраны из законов логики и частых ошибок.',
   goal:'Реши 6 заданий «Тождество?», из них хотя бы 2 уровня 2 или 3, и 3 задания «Тавтология?».',
   exam:'Тождество уровня 2, тавтология уровня 2 и тождество уровня 3. По одной попытке на таблицу и на вывод. Все три верно — тема засчитана.'},
  {id:'n5',num:'5',lane:'trans',title:'Законы алгебры логики',req:['n4'],trainer:'t5',
   frp:'Законы алгебры логики. Эквивалентные преобразования логических выражений',
   does:'Узнавать закон по одному шагу преобразования. Упрощать выражение по шагам: записать следующее выражение и выбрать закон — тренажёр проверит и равносильность, и сам закон.',
   goal:'Узнай закон в 8 шагах и упрости 4 выражения до цели, из них хотя бы 2 уровня 2 или 3.',
   exam:'3 задания «узнай закон» с одной попыткой и упрощение уровня 2, в котором можно ошибиться не больше одного раза, без подсказок.'},
  {id:'n6',num:'6',lane:'trans',title:'Уравнения и системы',req:['n5'],trainer:'t6',
   frp:'Логические уравнения и системы уравнений',
   does:'Решать систему, отсекая наборы по одному уравнению, и считать оставшиеся решения. Для цепочек из 5–8 переменных — считать решения без перебора: таблица переходов и подсчёт по столбцам.',
   goal:'Реши 4 системы, из них хотя бы 2 уровня 2 или 3, и посчитай 2 цепочки.',
   exam:'Система уровня 2, система уровня 3 и цепочка, по одной попытке на каждый шаг. Все три верно — тема засчитана.'},
  {id:'n7',num:'7',lane:'sets',title:'Логика и множества',req:['n3'],trainer:'t7',
   frp:'Логические операции и операции над множествами',
   does:'Закрасить на кругах Эйлера область выражения и записать выражение по закрашенной области: ∧ — пересечение, ∨ — объединение, ¬ — дополнение. Увидеть, что каждая область — строка таблицы истинности. Решать задачи о поисковых запросах с «|» и «&».',
   goal:'Закрась 4 области (хотя бы 2 — для трёх множеств), запиши 3 выражения по рисунку и реши 2 задачи о запросах.',
   exam:'Закраска для трёх множеств, запись выражения для трёх множеств и задача о запросах, по одной попытке. Все три верно — тема засчитана.'},
  {id:'n8',num:'8',lane:'func',title:'Логические функции',req:['n3'],trainer:'t8',
   frp:'Логические функции. Зависимость количества возможных логических функций от количества аргументов',
   does:'Понять, что функция — это столбец таблицы, и откуда 2^(2ⁿ). Собрать коллекцию всех 16 функций двух переменных, записывая формулу для каждого столбца. Заполнять столбец по словесному описанию.',
   goal:'Ответь на 5 вопросов «сколько?», открой 12 из 16 карточек коллекции и заполни 3 функции по описанию.',
   exam:'Два вопроса на подсчёт, формула для столбца и функция по описанию, по одной попытке. Все четыре верно — тема засчитана.'},
  {id:'n9',num:'9',lane:'func',title:'СДНФ и СКНФ',req:['n8'],trainer:'t9',
   frp:'Канонические формы логических выражений. СДНФ и СКНФ, алгоритмы их построения по таблице истинности',
   does:'Выбрать строки таблицы (F = 1 для СДНФ, F = 0 для СКНФ) и собрать из каждой конъюнкцию или дизъюнкцию, расставив отрицания. И обратно: по готовой форме заполнить таблицу.',
   goal:'Построй 3 СДНФ и 3 СКНФ (среди них хотя бы по одной для трёх и более переменных) и 2 раза заполни таблицу по готовой форме.',
   exam:'СДНФ, СКНФ и «форма → таблица» для трёх переменных, по одной попытке на шаг. Все три верно — тема засчитана.'},
  {id:'n10',num:'10',lane:'func',title:'Полные системы',req:['n9'],trainer:'t10',
   frp:'Полные системы логических функций',
   does:'Выражать ¬, ∧, ∨, → и другие функции только через операции базиса: штрих Шеффера, стрелку Пирса, {¬, ∧}, {→, 0}, базис Жегалкина. Решать, полна ли система функций, и называть свойство (класс Поста), которое мешает полноте.',
   goal:'Вырази 6 функций через разные базисы (из них хотя бы 2 — через ↑ или ↓) и правильно реши 5 вопросов о полноте.',
   exam:'Две функции через базисы (одна через ↑ или ↓) и два вопроса о полноте, по одной попытке. Все четыре верно — тема засчитана.'},
  {id:'n11',num:'11',lane:'circ',title:'Схемы',req:['n3'],trainer:'t11',
   frp:'Запись логического выражения по схеме. Построение схем по заданному выражению',
   does:'Исследовать схему из батарейки, кнопок и лампы, заполнить таблицу истинности и записать выражение. Схемы на логических элементах появятся здесь же.',
   goal:'Реши 5 схем без подсказки ответа, из них хотя бы 2 уровня 2 или 3.',
   exam:'3 схемы (уровни 2, 2, 3), по одной попытке на каждую, таблица не нужна. Все три верно — тема засчитана.'},
  {id:'n12',num:'12',lane:'circ',title:'Сумматор',req:['n11'],trainer:'t12',
   frp:'Логические элементы в составе компьютера. Сумматор. Многоразрядный сумматор',
   does:'Заполнить таблицу сложения битов и вывести формулы суммы и переноса для полусумматора и полного сумматора, исследовать их живые схемы на элементах «=1», «&», «1». Складывать 4-битные числа столбиком, как это делает цепочка из четырёх сумматоров, и замечать переполнение.',
   goal:'Разбери полусумматор и полный сумматор (таблица и формулы) и выполни 4 сложения на 4-разрядном сумматоре, хотя бы одно — с переполнением.',
   exam:'Полный сумматор (таблица и формулы) и два сложения — одно с переполнением, одно без. По одной попытке на шаг.'},
  {id:'n13',num:'13',lane:'circ',title:'Триггер',req:['n12'],trainer:'t13',
   frp:'Триггер',
   does:'Подавать сигналы S и R на RS-триггер из двух элементов ИЛИ-НЕ и увидеть, как обратная связь запоминает бит. Заполнить таблицу переходов с запрещённой комбинацией и предсказывать Q по временной диаграмме.',
   goal:'Выполни 4 задания на живой схеме, заполни таблицу переходов и 3 временные диаграммы.',
   exam:'Таблица переходов и две временные диаграммы, по одной попытке. Все три верно — тема засчитана.'},
  {id:'e2',num:'№2',lane:'ege',title:'Фрагмент таблицы',req:['n3'],trainer:'t20',
   frp:'Вне ФРП: задание ЕГЭ №2',
   does:'По фрагменту таблицы истинности с перепутанными столбцами и пустыми клетками определить, какой столбец какой переменной соответствует. Ответ в каждом задании единственный — генератор проверяет это перебором.',
   goal:'Реши 4 задания, из них хотя бы 2 уровня 2 или 3 и хотя бы 2 — без проверки строк на лету.',
   exam:'Три задания (уровни 2, 3, 2) без проверки на лету, по одной попытке. Все три верно — задание засчитано.'},
  {id:'e15',num:'№15',lane:'ege',title:'Отрезки и делимость',req:['n7','n5'],trainer:'t15',
   frp:'Вне ФРП: задание ЕГЭ №15',
   does:'Подобрать отрезок или число A, при котором формула тождественно истинна: отрезки на числовой прямой, делимость ДЕЛ(x, A), неравенства с целыми x и y. В обучении тренажёр подсвечивает x (или точки (x, y)), на которых формула ложна при текущем A.',
   goal:'Реши по 2 задания каждого вида, из них хотя бы 3 — с выключенной подсветкой.',
   exam:'По одному заданию на отрезки, делимость и неравенства, без подсветки, одна попытка. Все три верно — задание засчитано.'},
  /* добавлена позже: стоит в конце списка, чтобы не сбить старые коды учителя (они — битовая маска по порядку тем) */
  {id:'n1a',num:'1а',lane:'base',title:'Логические следствия',req:['n1'],trainer:'t16',
   frp:'Понятие высказывания. Законы алгебры логики (в рассуждениях на естественном языке)',
   does:'По условию со словами-бессмыслицами выбрать единственное утверждение, которое из него следует, и назвать закон: де Моргана, контрапозиция, раскрытие импликации, склеивание, отрицание кванторов и другие. В разборе — формулы и контрпример для каждого неверного варианта; условие можно записать формулой.',
   goal:'Реши верно с первого раза 12 разных пунктов (следствие и закон, без подсказки), из них хотя бы 3 с кванторами, и запиши формулой условия 5 пунктов.',
   exam:'6 пунктов (4 с высказываниями, 2 с кванторами), в каждом одна попытка на следствие и на закон. Нужно 5 из 6. Пересдача — после двух верных пунктов практики подряд.'}
];
const byId=Object.fromEntries(NODES.map(n=>[n.id,n]));
const trainers={};
function register(id,api){trainers[id]=api}


/* ---------- разбор формул ученика: общий для тренажёров ----------
   И: ∧ & * · и and, ИЛИ: ∨ | + или or, НЕ: ¬ ! ~ не not, →: → -> => ⇒, ≡: ≡ <-> <=> ↔ == =, ⊕: ⊕ ^ xor.
   «AB» читается как A ∧ B. Русские А, В, С, Д понимаются как латинские. Старшинство: ¬, ∧, ∨ и ⊕, →, ≡. */
const logic=(()=>{
  const CYR={'А':'A','В':'B','С':'C','Д':'D','Е':'E'};
  const WORDS={'и':'AND','and':'AND','или':'OR','or':'OR','не':'NOT','not':'NOT','xor':'XOR'};
  function Err(msg,pos){this.msg=msg;this.pos=pos}
  function tokenize(src){
    const t=[];let i=0;const s=String(src);
    const sym=[['<->','EQ'],['<=>','EQ'],['==','EQ'],['->','IMP'],['=>','IMP'],['¬','NOT'],['!','NOT'],['~','NOT'],['∧','AND'],['&','AND'],['*','AND'],['·','AND'],
      ['∨','OR'],['|','OR'],['+','OR'],['→','IMP'],['⇒','IMP'],['≡','EQ'],['↔','EQ'],['⇔','EQ'],['=','EQ'],['⊕','XOR'],['^','XOR'],['(','LP'],[')','RP']];
    while(i<s.length){
      const c=s[i];if(/\s/.test(c)){i++;continue}
      const m=sym.find(([k])=>s.startsWith(k,i));if(m){t.push({k:m[1],pos:i});i+=m[0].length;continue}
      const w=s.slice(i).match(/^[A-Za-zА-Яа-яЁё]+/);
      if(w){const word=w[0],low=word.toLowerCase();
        if(WORDS[low]){t.push({k:WORDS[low],pos:i});i+=word.length;continue}
        for(let j=0;j<word.length;j++){let ch=word[j].toUpperCase();ch=CYR[ch]||ch;
          if(!/^[A-E]$/.test(ch))throw new Err(`Непонятный символ «${word[j]}»`,i+j);
          t.push({k:'VAR',v:ch,pos:i+j})}
        i+=word.length;continue}
      if(c==='0'||c==='1'){t.push({k:'CONST',v:+c,pos:i});i++;continue}
      throw new Err(`Непонятный символ «${c}»`,i);
    }
    // неявное И: «AB», «A(B)», «)(»
    const out=[];t.forEach((x,j)=>{const p=out[out.length-1];
      if(p&&['VAR','CONST','RP'].includes(p.k)&&['VAR','CONST','LP','NOT'].includes(x.k))out.push({k:'AND',pos:x.pos,implicit:true});out.push(x)});
    return out;
  }
  const BIN={EQ:[1,'eq'],IMP:[2,'imp'],OR:[3,'or'],XOR:[3,'xor'],AND:[4,'and']};
  function parse(src){
    const t=tokenize(src);let i=0;
    if(!t.length)throw new Err('Пустое выражение',0);
    const prim=()=>{const x=t[i];
      if(!x)throw new Err('Выражение оборвалось: не хватает операнда',String(src).length);
      if(x.k==='NOT'){i++;return {op:'not',a:prim()}}
      if(x.k==='VAR'){i++;return {op:'var',v:x.v}}
      if(x.k==='CONST'){i++;return {op:'const',v:x.v}}
      if(x.k==='LP'){i++;const e=bin(0);if(!t[i]||t[i].k!=='RP')throw new Err('Не закрыта скобка',x.pos);i++;return e}
      throw new Err(x.k==='RP'?'Лишняя закрывающая скобка':'Операция без левого операнда',x.pos)};
    const bin=minP=>{let a=prim();
      while(t[i]&&BIN[t[i].k]&&BIN[t[i].k][0]>=minP){const [p,op]=BIN[t[i].k];i++;const b=bin(p+1);a={op,a,b}}
      return a};
    const e=bin(0);if(i<t.length)throw new Err(t[i].k==='RP'?'Лишняя закрывающая скобка':'Не хватает операции между частями',t[i].pos);
    return e;
  }
  const F={and:(a,b)=>a&b,or:(a,b)=>a|b,xor:(a,b)=>a^b,imp:(a,b)=>(1-a)|b,eq:(a,b)=>+(a===b)};
  function evaluate(n,e){return n.op==='var'?(e[n.v]|0):n.op==='const'?n.v:n.op==='not'?1-evaluate(n.a,e):F[n.op](evaluate(n.a,e),evaluate(n.b,e))}
  function vars(n,s=new Set()){if(n.op==='var')s.add(n.v);if(n.a)vars(n.a,s);if(n.b)vars(n.b,s);return s}
  const PR={eq:1,imp:2,or:3,xor:3,and:4,not:5,var:6,const:6},SY={eq:' ≡ ',imp:' → ',or:' ∨ ',xor:' ⊕ ',and:' ∧ '};
  function pretty(n,pp=0,right=false,pop=null){
    if(n.op==='var')return n.v;if(n.op==='const')return String(n.v);
    if(n.op==='not'){const inner=pretty(n.a,5);return '¬'+inner}
    const p=PR[n.op];const s=pretty(n.a,p,false,n.op)+SY[n.op]+pretty(n.b,p,true,n.op);
    // скобки, если старшинство ниже, а при равном — справа, между разными операциями (∨ и ⊕) и для ⊕, →, ≡
    return p<pp||(p===pp&&(right||n.op!==pop||n.op==='xor'||n.op==='imp'||n.op==='eq'))?'('+s+')':s;
  }
  /* первое расхождение двух формул на наборах переменных vs */
  function diff(a,b,vs){const n=vs.length;for(let m=0;m<1<<n;m++){const e={};vs.forEach((v,i)=>e[v]=(m>>(n-1-i))&1);
    const x=evaluate(a,e),y=evaluate(b,e);if(x!==y)return {env:e,a:x,b:y}}return null}
  return {parse,evaluate,vars,pretty,diff,Err};
})();

/* ---------- ученик ---------- */
const student={get:()=>store.get('student',''),set(v){store.set('student',v);emit('student',v)}};

/* ---------- состояние тем ---------- */
const EMPTY={done:0,total:0,note:'',mastered:false,via:null,at:null,touched:false};
function node(id){return Object.assign({},EMPTY,store.get('node.'+id,{}))}
function report(id,patch){
  const clean=Object.fromEntries(Object.entries(patch).filter(([,v])=>v!==undefined));
  const prev=node(id),next=Object.assign({},prev,clean,{touched:true});
  if(prev.mastered) next.mastered=true;            // освоенная тема не «закрывается» обратно
  if(next.mastered&&!prev.mastered){next.at=new Date().toISOString();next.via=patch.via||'practice';
    hubLog(id,'Тема освоена',next.via==='exam'?'через зачёт':'практикой','')}
  store.set('node.'+id,next);emit('progress',{id});
}
const isBuilt=n=>!!(n.trainer&&trainers[n.trainer]);
const unlocks=()=>new Set(store.get('unlocks',[]));
const preview=()=>store.get('preview',false);
/* что мешает открыть тему: готовые, но не освоенные предшественники; через неготовую тему — её собственные блокеры */
function blockers(n,seen=new Set()){
  const out=new Map();
  for(const r of n.req.map(id=>byId[id])){
    if(seen.has(r.id))continue;seen.add(r.id);
    if(node(r.id).mastered||unlocks().has(r.id))continue;
    if(isBuilt(r))out.set(r.id,r);
    else blockers(r,seen).forEach(b=>out.set(b.id,b));
  }
  return [...out.values()];
}
function status(id){
  const n=byId[id],st=node(id);
  if(st.mastered) return 'mastered';
  // начатая тема не закрывается, даже если позже появился тренажёр-предшественник
  if(blockers(n).length&&!unlocks().has(id)&&!preview()&&!(st.touched&&st.done>0)) return 'locked';
  return st.touched&&st.done>0?'progress':'open';
}

/* ---------- журнал хаба (зачёты, коды) ---------- */
function hubLog(node,stage,input,note){
  const l=store.get('hub.log',[]);
  l.push({t:new Date().toISOString(),seed:node,student:student.get(),stage,input,note});
  store.set('hub.log',l.slice(-1000));
}
function allLogs(){
  const out=store.get('hub.log',[]).map(r=>Object.assign({src:'Карта'},r));
  for(const [tid,api] of Object.entries(trainers)) if(api.logRows) api.logRows().forEach(r=>out.push(Object.assign({src:api.title||tid},r)));
  return out.sort((a,b)=>a.t<b.t?-1:a.t>b.t?1:0);
}

/* ---------- код переноса прогресса ---------- */
const b64e=s=>btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const b64d=s=>decodeURIComponent(escape(atob(s.replace(/-/g,'+').replace(/_/g,'/'))));
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(36).toUpperCase().slice(-4).padStart(4,'0')}
function exportCode(){
  const d={v:1,s:student.get(),n:{},u:[...unlocks()],t:{}};
  NODES.forEach(n=>{const st=store.get('node.'+n.id,null);if(st)d.n[n.id]=st});
  for(const [tid,api] of Object.entries(trainers)) if(api.exportData) d.t[tid]=api.exportData();
  const body=b64e(JSON.stringify(d));return 'AL1.'+body+'.'+hash(body);
}
function importCode(code){
  const m=String(code).replace(/\s+/g,'').match(/^AL1\.([A-Za-z0-9_-]+)\.([0-9A-Z]{4})$/);
  if(!m) return {ok:false,msg:'Это не похоже на код прогресса. Он начинается с AL1. Скопируй его целиком.'};
  if(hash(m[1])!==m[2]) return {ok:false,msg:'Код повреждён: при копировании потерялась часть символов. Скопируй его заново.'};
  let d;try{d=JSON.parse(b64d(m[1]))}catch(e){return {ok:false,msg:'Код не читается. Скопируй его заново целиком.'}}
  if(d.s&&!student.get()) student.set(d.s);
  for(const [id,st] of Object.entries(d.n||{})){
    if(!byId[id]) continue;const cur=store.get('node.'+id,null);
    const merged=Object.assign({},EMPTY,cur||{},st);
    if(cur&&cur.mastered) Object.assign(merged,{mastered:true,via:cur.via,at:cur.at});
    if(cur) merged.done=Math.max(cur.done||0,st.done||0);
    store.set('node.'+id,merged);
  }
  store.set('unlocks',[...new Set([...unlocks(),...(d.u||[])])]);
  for(const [tid,data] of Object.entries(d.t||{})) if(trainers[tid]&&trainers[tid].importData) trainers[tid].importData(data);
  hubLog('—','Прогресс восстановлен','код переноса','');
  emit('progress',{});
  return {ok:true,msg:'Прогресс восстановлен.'+(d.s?' Ученик: '+d.s+'.':'')};
}

/* ---------- код учителя: какие темы открыть ---------- */
const ABC='0123456789ABCDEFGHJKMNPQRSTUVWXYZ'; // без I, L, O
function teacherCode(ids){
  let mask=0;NODES.forEach((n,i)=>{if(ids.includes(n.id))mask+=2**i});
  let s='';let x=mask;do{s=ABC[x%33]+s;x=Math.floor(x/33)}while(x>0);
  const chk=ABC[[...s].reduce((a,c,i)=>a+(i+1)*ABC.indexOf(c),7)%33];
  return s+'-'+chk;
}
function applyTeacherCode(code){
  const c=String(code).toUpperCase().replace(/[^0-9A-Z-]/g,'').replace(/^OPEN-/,'');
  const m=c.match(/^([0-9A-Z]+)-([0-9A-Z])$/);
  if(!m||[...m[1]].some(ch=>!ABC.includes(ch))) return {ok:false,msg:'Код учителя выглядит так: 7K-Q. Проверь буквы и дефис.'};
  const chk=ABC[[...m[1]].reduce((a,ch,i)=>a+(i+1)*ABC.indexOf(ch),7)%33];
  if(chk!==m[2]) return {ok:false,msg:'В коде опечатка: последняя буква не сходится. Сверь код с доской.'};
  let mask=[...m[1]].reduce((a,ch)=>a*33+ABC.indexOf(ch),0);
  const ids=NODES.filter((n,i)=>Math.floor(mask/2**i)%2===1).map(n=>n.id);
  if(!ids.length) return {ok:false,msg:'В этом коде нет ни одной темы.'};
  store.set('unlocks',[...new Set([...unlocks(),...ids])]);
  hubLog('—','Код учителя',c,'Открыто: '+ids.map(id=>byId[id].num).join(', '));
  emit('progress',{});
  return {ok:true,ids,msg:'Учитель открыл темы: '+ids.map(id=>byId[id].num+' '+byId[id].title).join(', ')+'.'};
}

return {shuffle,logic,store,on,emit,LANES,NODES,byId,register,trainers,student,node,report,status,blockers,isBuilt,
  unlocks,preview,setPreview:v=>{store.set('preview',!!v);emit('progress',{})},
  hubLog,allLogs,exportCode,importCode,teacherCode,applyTeacherCode};
})();
