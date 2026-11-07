/* Тренажёр 1а «Логические следствия»: из условия со словами-бессмыслицами выбрать единственное следствие,
   назвать закон, который его обосновывает, и записать условие формулой. Пункты — собственный пересказ
   идеи теста М. Войнаровского, переведённый на язык алгебры логики. Узел n1a, префикс x16. */
(()=>{
const store=AL.store.scoped('t16');
const L=AL.logic;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const NODE='n1a';
const NEED={items:12,quant:3,forms:5};

/* ---------- законы и правила вывода ---------- */
const LAWS={
  simp:{g:'p',n:'Упрощение конъюнкции',f:'A ∧ B ⇒ A'},
  imp:{g:'p',n:'Раскрытие импликации',f:'A → B = ¬A ∨ B'},
  dm:{g:'p',n:'Закон де Моргана',f:'¬(A ∧ B) = ¬A ∨ ¬B;  ¬(A ∨ B) = ¬A ∧ ¬B'},
  dn:{g:'p',n:'Двойное отрицание',f:'¬¬A = A'},
  mp:{g:'p',n:'Modus ponens',f:'A ∧ (A → B) ⇒ B'},
  mt:{g:'p',n:'Modus tollens',f:'¬B ∧ (A → B) ⇒ ¬A'},
  contr:{g:'p',n:'Контрапозиция',f:'A → B = ¬B → ¬A'},
  nimp:{g:'p',n:'Отрицание импликации',f:'¬(A → B) = A ∧ ¬B'},
  eq:{g:'p',n:'Эквивалентность через импликации',f:'A ≡ B = (A → B) ∧ (B → A)'},
  xor:{g:'p',n:'Исключающее ИЛИ',f:'A ⊕ B = ¬(A ≡ B) = (A ∨ B) ∧ ¬(A ∧ B)'},
  absn:{g:'p',n:'Поглощение отрицания',f:'¬A ∧ (A ∨ B) = ¬A ∧ B'},
  trans:{g:'p',n:'Транзитивность импликации',f:'(A → B) ∧ (B → C) ⇒ A → C'},
  dist:{g:'p',n:'Распределительный закон',f:'A ∧ (B ∨ C) = (A ∧ B) ∨ (A ∧ C);  A ∨ (B ∧ C) = (A ∨ B) ∧ (A ∨ C)'},
  abs:{g:'p',n:'Поглощение',f:'A ∧ (A ∨ B) = A;  A ∨ (A ∧ B) = A'},
  glue:{g:'p',n:'Склеивание',f:'(A ∧ B) ∨ (A ∧ ¬B) = A;  (A ∨ B) ∧ (A ∨ ¬B) = A'},
  qna:{g:'q',n:'Отрицание квантора ∀',f:'¬∀x P(x) = ∃x ¬P(x)'},
  qne:{g:'q',n:'Отрицание квантора ∃',f:'¬∃x P(x) = ∀x ¬P(x)'},
  qae:{g:'q',n:'Из ∀ следует ∃',f:'∀x P(x) ⇒ ∃x P(x)  (если множество не пусто)'},
  qin:{g:'q',n:'Частный случай ∀',f:'∀x P(x) ⇒ P(a) для любого a'}
};
/* для пунктов с кванторами в варианты закона берутся законы кванторов и самые частые общие */
const QPOOL=['qna','qne','qae','qin','imp','trans','dn','dm'];

/* ---------- банк ----------
   d — обозначения; t — условие; P — формула условия; o — три следствия [текст, формула, контрпример(для кванторов)];
   c — номер верного; law — закон; ex — законы, которые тоже можно разумно назвать (не идут в варианты); why — разбор. */
const S=(id,d,t,P,o,c,law,why,ex=[])=>({id,q:false,d,t,P,o,c,law,why,ex});
const Q=(id,u,d,t,P,o,c,law,why,ex=[])=>({id,q:true,u,d,t,P,o,c,law,why,ex});
const ITEMS=[
  S('s1',{A:'хрумзик любит малину',B:'хрумзик любит чернику',C:'малину хрумзик любит сильнее черники'},
    'Хрумзик любит и малину, и чернику.','A∧B',
    [['Хрумзик любит малину.','A'],['Малину хрумзик любит сильнее, чем чернику.','C'],['Хрумзик не любит чернику.','¬B']],0,'simp',
    'Из конъюнкции следует каждая её часть. Про «сильнее» в условии нет ни слова — это новое высказывание C, условие его не определяет.'),
  S('s2',{A:'глоккель пушистый',B:'глоккель полосатый'},
    'Глоккель пушистый или полосатый, а может быть, и то и другое.','A∨B',
    [['Если глоккель не пушистый, то он полосатый.','¬A→B'],['Глоккель не бывает пушистым и полосатым одновременно.','¬(A∧B)'],['Если глоккель пушистый, то он не полосатый.','A→¬B']],0,'imp',
    'Включающее «или»: A ∨ B = ¬A → B. Если одна часть ложна, другая обязана быть истинной. А оба свойства сразу условие разрешает.'),
  S('s3',{A:'шуршалка тяжёлая',B:'шуршалка шумная'},
    'Неправда, что наша шуршалка тяжёлая и шумная.','¬(A∧B)',
    [['Шуршалка не тяжёлая и не шумная.','¬A∧¬B'],['Шуршалка не тяжёлая или не шумная, а может быть, и то и другое.','¬A∨¬B'],['Шуршалка тяжёлая, но тихая.','A∧¬B']],1,'dm',
    'Отрицание «и» превращается в «или» отрицаний: ¬(A ∧ B) = ¬A ∨ ¬B. «Не тяжёлая и не шумная» — лишь один из трёх возможных случаев.'),
  S('s4',{A:'зюзя умеет летать',B:'зюзя умеет плавать'},
    'Неверно, что зюзя умеет летать или плавать.','¬(A∨B)',
    [['Зюзя не умеет ни летать, ни плавать.','¬A∧¬B'],['Зюзя умеет что-то одно: летать или плавать.','A⊕B'],['Зюзя умеет плавать, но не умеет летать.','¬A∧B']],0,'dm',
    'Отрицание «или» — это «ни…, ни…»: ¬(A ∨ B) = ¬A ∧ ¬B.'),
  S('s5',{A:'бубука умеет свистеть',B:'бубука умеет петь'},
    'Неверно, что бубука не умеет свистеть.','¬¬A',
    [['Бубука умеет свистеть.','A'],['Бубука не умеет свистеть.','¬A'],['Бубука умеет и свистеть, и петь.','A∧B']],0,'dn',
    'Два отрицания взаимно уничтожаются: ¬¬A = A. Про пение условие ничего не говорит.'),
  S('s6',{A:'крякля проголодалась',B:'крякля поёт',C:'крякля танцует'},
    'Если крякля проголодалась, она поёт. Сейчас крякля проголодалась.','(A→B)∧A',
    [['Крякля поёт.','B'],['Крякля поёт и танцует.','B∧C'],['Крякля не поёт.','¬B']],0,'mp',
    'Импликация истинна и её условие выполнено — значит, выполнено и следствие: A ∧ (A → B) = A ∧ B. Про танцы условие молчит.'),
  S('s7',{A:'фрумзель спит',B:'фрумзель храпит'},
    'Если фрумзель спит, он храпит. Сейчас фрумзель не храпит.','(A→B)∧¬B',
    [['Фрумзель не спит.','¬A'],['Фрумзель спит или храпит.','A∨B'],['Фрумзель спит и не храпит.','A∧¬B']],0,'mt',
    'Если бы фрумзель спал, он бы храпел. Он не храпит — значит, не спит: ¬B ∧ (A → B) = ¬A ∧ ¬B.',['contr']),
  S('s8',{A:'тракля голодна',B:'тракля грызёт ножку стола'},
    'Если тракля голодна, она грызёт ножку стола. Сейчас тракля грызёт ножку стола.','(A→B)∧B',
    [['Тракля голодна.','A'],['Тракля не голодна.','¬A'],['Тракля не голодна или грызёт ножку стола.','¬A∨B']],2,'imp',
    'Частая ловушка — «обратный ход»: из A → B и B нельзя вывести A, тракля может грызть ножку и от скуки. А ¬A ∨ B — просто другая запись A → B.',['contr']),
  S('s9',{A:'идёт мурзопад',B:'дорожки скользкие'},
    'Чтобы дорожки стали скользкими, достаточно мурзопада.','A→B',
    [['Не бывает так, чтобы шёл мурзопад, а дорожки не были скользкими.','¬(A∧¬B)'],['Если дорожки скользкие, значит, идёт мурзопад.','B→A'],['Если мурзопада нет, дорожки не скользкие.','¬A→¬B']],0,'nimp',
    'Импликация ложна только в одном случае: A истинно, B ложно. Поэтому A → B = ¬(A ∧ ¬B). «Достаточно» не значит «необходимо»: скользко бывает и без мурзопада.',['imp','dm','contr']),
  S('s10',{A:'фырчик рыжий',B:'фырчик кусается'},
    'Неверно, что если фырчик рыжий, то он кусается.','¬(A→B)',
    [['Фырчик рыжий и не кусается.','A∧¬B'],['Фырчик не рыжий и кусается.','¬A∧B'],['Фырчик не рыжий.','¬A']],0,'nimp',
    'Импликация ложна ровно тогда, когда условие истинно, а следствие ложно: ¬(A → B) = A ∧ ¬B. Отрицание импликации — не импликация с отрицанием.',['dm','imp']),
  S('s11',{A:'пуфик светится',B:'пуфик мурлычет'},
    'Пуфик светится тогда и только тогда, когда мурлычет.','A≡B',
    [['Если пуфик не светится, он не мурлычет.','¬A→¬B'],['Пуфик светится и мурлычет.','A∧B'],['Пуфик светится или мурлычет.','A∨B']],0,'eq',
    'A ≡ B = (A → B) ∧ (B → A). Вторая импликация, записанная как ¬A → ¬B, и есть ответ. Пуфик может не светиться и не мурлыкать — A ≡ B при этом истинно.',['contr','imp']),
  S('s12',{A:'шмыга в норе',B:'шмыга на дереве'},
    'Сейчас шмыга либо в норе, либо на дереве, но не там и там сразу.','A⊕B',
    [['Если шмыга не в норе, то она на дереве.','¬A→B'],['Шмыга в норе.','A'],['Если шмыга в норе, то она и на дереве.','A→B']],0,'xor',
    'A ⊕ B = (A ∨ B) ∧ ¬(A ∧ B): ровно одно из двух. В частности, A ∨ B, то есть ¬A → B. Где именно шмыга — неизвестно.',['imp','eq']),
  S('s13',{A:'пирожок съел Брямс',B:'пирожок съела Тюфка'},
    'Пирожок съел Брямс или Тюфка, а может быть, оба. Брямс пирожок не ел.','(A∨B)∧¬A',
    [['Пирожок съела Тюфка.','B'],['Пирожок съели оба.','A∧B'],['Пирожок никто не ел.','¬A∧¬B']],0,'absn',
    '¬A ∧ (A ∨ B) = ¬A ∧ B: первый вариант отпал, остаётся второй.',['dist','imp']),
  S('s14',{A:'гнумик выспался',B:'гнумик весел',C:'гнумик танцует'},
    'Если гнумик выспался, он весел. Если гнумик весел, он танцует.','(A→B)∧(B→C)',
    [['Если гнумик выспался, он танцует.','A→C'],['Если гнумик танцует, значит, он выспался.','C→A'],['Гнумик танцует.','C']],0,'trans',
    'Цепочка: A → B и B → C дают A → C. Танцует ли гнумик сейчас, неизвестно: условие говорит только «если».'),
  S('s15',{A:'хвостан полосатый',B:'хвостан рыжий',C:'хвостан пятнистый'},
    'Хвостан полосатый, а ещё он рыжий или пятнистый (может быть, и то и другое).','A∧(B∨C)',
    [['Хвостан полосатый и рыжий или полосатый и пятнистый.','(A∧B)∨(A∧C)'],['Хвостан полосатый и рыжий.','A∧B'],['Хвостан рыжий и пятнистый.','B∧C']],0,'dist',
    'A ∧ (B ∨ C) = (A ∧ B) ∨ (A ∧ C). Какой из двух случаев на самом деле — неизвестно.'),
  S('s16',{A:'бульбик читает',B:'бульбик поёт',C:'бульбик пляшет'},
    'Сегодня вечером бульбик читает, или же он и поёт, и пляшет.','A∨(B∧C)',
    [['Бульбик читает или поёт, и при этом читает или пляшет.','(A∨B)∧(A∨C)'],['Бульбик поёт.','B'],['Бульбик читает или поёт, но не пляшет.','(A∨B)∧¬C']],0,'dist',
    'Второй распределительный закон: A ∨ (B ∧ C) = (A ∨ B) ∧ (A ∨ C). В алгебре логики ∨ раскрывается относительно ∧ так же, как ∧ относительно ∨.'),
  S('s17',{A:'тюлька умная',B:'тюлька красивая'},
    'Про тюльку известно две вещи: она умная; она умная или красивая.','A∧(A∨B)',
    [['Тюлька умная.','A'],['Тюлька красивая.','B'],['Тюлька умная и красивая.','A∧B']],0,'abs',
    'Поглощение: A ∧ (A ∨ B) = A. Второе сведение ничего не добавляет — про красоту неизвестно.',['simp']),
  S('s18',{A:'бырчик зелёный',B:'бырчик съедобный'},
    'Если бырчик зелёный, он съедобный. Если бырчик не зелёный, он тоже съедобный.','(A→B)∧(¬A→B)',
    [['Бырчик съедобный.','B'],['Бырчик зелёный.','A'],['Бырчик зелёный и съедобный.','A∧B']],0,'glue',
    '(¬A ∨ B) ∧ (A ∨ B) = B — склеивание: какого бы цвета ни был бырчик, он съедобен. Цвет условие не определяет.',['imp','dist','mp']),
  S('s19',{A:'трещотка громкая',B:'трещотка красная'},
    'Трещотка громкая и красная или громкая и не красная.','(A∧B)∨(A∧¬B)',
    [['Трещотка громкая.','A'],['Трещотка красная.','B'],['Трещотка громкая, но не красная.','A∧¬B']],0,'glue',
    '(A ∧ B) ∨ (A ∧ ¬B) = A ∧ (B ∨ ¬B) = A. Слагаемые отличаются только B — оно «склеивается».',['dist','simp']),
  S('s20',{A:'шушик заснул',B:'стало темно'},
    'Чтобы шушик заснул, необходимо, чтобы стало темно.','A→B',
    [['Если не стемнело, шушик не спит.','¬B→¬A'],['Если стемнело, шушик спит.','B→A'],['Шушик спит тогда и только тогда, когда темно.','A≡B']],0,'contr',
    '«Необходимо» — это следствие: A → B, а A → B = ¬B → ¬A. Темнота необходима, но не достаточна: в темноте шушик может и не спать.',['mt','imp']),
  S('s21',{A:'кукумбер гуляет',B:'светит солнце'},
    'Кукумбер гуляет, только если светит солнце.','A→B',
    [['Кукумбер не гуляет или светит солнце.','¬A∨B'],['Если светит солнце, кукумбер обязательно гуляет.','B→A'],['Кукумбер гуляет или солнце не светит.','A∨¬B']],0,'imp',
    '«A, только если B» — это A → B, а A → B = ¬A ∨ B. Два других варианта — записи обратной импликации B → A.',['contr']),
  S('s22',{A:'у клюквеца есть рога',B:'у клюквеца есть копыта',C:'у клюквеца есть хвост'},
    'Неверно, что у клюквеца есть и рога, и копыта, и хвост.','¬(A∧B∧C)',
    [['Если у клюквеца есть рога и копыта, то хвоста у него нет.','(A∧B)→¬C'],['У клюквеца нет хвоста.','¬C'],['У клюквеца нет ни рогов, ни копыт, ни хвоста.','¬A∧¬B∧¬C']],0,'dm',
    '¬(A ∧ B ∧ C) = ¬A ∨ ¬B ∨ ¬C: чего-то (хотя бы одного) нет. Если рога и копыта есть, не хватает именно хвоста.',['imp','nimp']),
  S('s23',{A:'жмурик рычит',B:'жмурик злится'},
    'Неверно, что жмурик рычит тогда и только тогда, когда злится.','¬(A≡B)',
    [['Жмурик рычит или злится, но не то и другое сразу.','A⊕B'],['Жмурик не рычит и не злится.','¬A∧¬B'],['Жмурик рычит и злится.','A∧B']],0,'xor',
    '¬(A ≡ B) = A ⊕ B: значения A и B разные, истинно ровно одно из двух.',['dm','eq']),

  Q('q1','кварбузы',{A:'кварбуз x рыжий'},
    'Кварбузы существуют, и все они рыжие.','∀(A)',
    [['Некоторые кварбузы рыжие.','∃(A)'],
     ['Некоторые кварбузы не рыжие.','∃(¬A)','Пусть на свете три кварбуза, и все рыжие. Условие выполнено, а нерыжих нет.'],
     ['Не все кварбузы рыжие.','¬∀(A)','Это прямое отрицание условия: при истинном условии оно всегда ложно.']],0,'qae',
    'В логике «некоторые» значит «хотя бы один», а не «некоторые, но не все». Кварбузы есть и все рыжие — значит, хотя бы один рыжий найдётся.',['qin']),
  Q('q2','жмыхи',{A:'жмых x кусается'},
    'Неверно, что все жмыхи кусаются.','¬∀(A)',
    [['Ни один жмых не кусается.','∀(¬A)','Пусть жмыхов два: один кусается, другой нет. «Не все кусаются» — верно, но один всё же кусается.'],
     ['Хотя бы один жмых не кусается.','∃(¬A)'],
     ['Некоторые жмыхи кусаются.','∃(A)','Пусть ни один жмых не кусается. «Не все кусаются» верно, а «некоторые кусаются» — нет.']],1,'qna',
    '¬∀x A(x) = ∃x ¬A(x): чтобы опровергнуть «все», хватает одного контрпримера. Отрицание «все кусаются» — не «никто не кусается».',['dn']),
  Q('q3','фырши',{A:'фырш x умеет считать'},
    'Ни один фырш не умеет считать.','∀(¬A)',
    [['Неверно, что найдётся фырш, который умеет считать.','¬∃(A)'],
     ['Хотя бы один фырш умеет считать.','∃(A)','Это отрицание условия: если не умеет ни один, то «хотя бы один умеет» ложно.'],
     ['Одни фырши умеют считать, а другие нет.','∃(A)∧∃(¬A)','По условию умеющих нет совсем, так что первая часть ложна.']],0,'qne',
    '¬∃x A(x) = ∀x ¬A(x): «не существует умеющего» и «все не умеют» — одно и то же.',['dn','qna']),
  Q('q4','мурзики',{A:'мурзик x синий',D:'мурзик x найден учёными'},
    'Учёные нашли больше десятка мурзиков, и все найденные мурзики синие.','∃(D)∧∀(D→A)',
    [['Хотя бы один мурзик синий.','∃(A)'],
     ['Все мурзики на свете синие.','∀(A)','Пусть в лесу живёт ещё не найденный зелёный мурзик. Про найденных условие выполнено, а «все на свете синие» — нет.'],
     ['Существуют мурзики, которые не синие.','∃(¬A)','Пусть все мурзики, и найденные, и ненайденные, синие. Условие выполнено, а не синих нет.']],0,'qin',
    'Возьмём любого найденного мурзика: условие про всех найденных говорит, что он синий, — это частный случай. Про ненайденных условие не говорит ничего: из наблюдений не следует закон «все мурзики синие».',['qae','simp']),
  Q('q5','существа',{A:'x — глун',B:'x пушистое',C:'x тёплое'},
    'Все глуны пушистые, а все пушистые существа тёплые.','∀(A→B)∧∀(B→C)',
    [['Все глуны тёплые.','∀(A→C)'],
     ['Все тёплые существа — глуны.','∀(C→A)','Пусть есть пушистый тёплый фуфлик, который не глун. Условие выполнено, а это — нет.'],
     ['Все пушистые существа — глуны.','∀(B→A)','Тот же пушистый фуфлик: он пушистый, но не глун.']],0,'trans',
    'Для каждого x из A(x) → B(x) и B(x) → C(x) следует A(x) → C(x). Обратные включения не следуют.',['qin']),
  Q('q6','шнырки',{A:'у шнырка x синий хвост'},
    'Существуют шнырки с синим хвостом.','∃(A)',
    [['Все шнырки с синим хвостом.','∀(A)','Пусть шнырков двое: у одного хвост синий, у другого красный.'],
     ['Неверно, что у всех шнырков хвост не синий.','¬∀(¬A)'],
     ['Некоторые шнырки — без синего хвоста.','∃(¬A)','Пусть у всех шнырков хвосты синие. «Существуют синехвостые» верно, а шнырков без синего хвоста нет.']],1,'qna',
    '¬∀x ¬A(x) = ∃x ¬¬A(x) = ∃x A(x). Ловушка — «некоторые, значит, не все»: в логике «некоторые» не исключает «все».',['dn','qne']),
  Q('q7','клямзики',{A:'клямзик x храпит',B:'клямзик x ворочается'},
    'Каждый клямзик во сне храпит или ворочается, а может быть, и то и другое.','∀(A∨B)',
    [['Каждый клямзик, который не храпит, ворочается.','∀(¬A→B)'],
     ['Все клямзики храпят, или все клямзики ворочаются.','∀(A)∨∀(B)','Пусть клямзиков двое: один только храпит, другой только ворочается. Каждый делает одно из двух — условие выполнено, но ни «все храпят», ни «все ворочаются» не верно.'],
     ['Некоторые клямзики храпят.','∃(A)','Пусть все клямзики только ворочаются и никто не храпит. Условие выполнено.']],0,'imp',
    'Внутри квантора работают те же законы: A ∨ B = ¬A → B для каждого клямзика. А вот ∀ по ∨ «разнести» нельзя: ∀x (A ∨ B) не равно ∀x A ∨ ∀x B.',['qin','dist'])
];
const BY=Object.fromEntries(ITEMS.map(x=>[x.id,x]));
ITEMS.filter(x=>!x.q).forEach(x=>{x.ast=L.parse(x.P);x.oast=x.o.map(o=>L.parse(o[1]))});

/* ---------- кванторы: вычисление на «мире» (непустом наборе видов объектов) ---------- */
function qeval(s,world){
  let out='',i=0;
  while(i<s.length){
    const ch=s[i];
    if((ch==='∀'||ch==='∃')&&s[i+1]==='('){
      let dep=0,j=i+1;for(;j<s.length;j++){if(s[j]==='(')dep++;else if(s[j]===')'){dep--;if(!dep)break}}
      const a=L.parse(s.slice(i+2,j));
      const v=ch==='∀'?world.every(e=>L.evaluate(a,e)):world.some(e=>L.evaluate(a,e));
      out+=v?'1':'0';i=j+1;
    }else{out+=ch;i++}
  }
  return L.evaluate(L.parse(out),{});
}
/* запись формулы для показа: A → A(x), ∀( → ∀x ( */
function qshow(s){
  return s.replace(/([∀∃])\(/g,'$1x (').replace(/([A-E])/g,'$1(x)').replace(/\s*([∧∨→≡⊕])\s*/g,' $1 ')
    .replace(/([∀∃]x )\((¬?[A-E]\(x\))\)/g,'$1$2');
}
function pshow(f){return L.pretty(L.parse(f))}

/* контрпример для высказываний: набор, где условие истинно, а следствие ложно */
function counter(item,k){
  const vs=Object.keys(item.d),n=vs.length;
  for(let m=0;m<1<<n;m++){const e={};vs.forEach((v,i)=>e[v]=(m>>(n-1-i))&1);
    if(L.evaluate(item.ast,e)&&!L.evaluate(item.oast[k],e))return e}
  return null;
}

const MARKUP=`<div class="app t16">
  <header class="top">
    <div class="brand">
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><rect x="5" y="6" width="30" height="11" rx="3" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2.4"/><path d="M20 17v8" stroke="var(--ink)" stroke-width="2.4"/><path d="M15 21l5 5 5-5" fill="none" stroke="var(--live)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><rect x="9" y="28" width="22" height="7" rx="2.5" fill="var(--glow)" stroke="var(--live)" stroke-width="2"/></svg>
      <div><a class="back" href="#map">← Карта навыков</a><h1>Логические следствия</h1><p>Что действительно следует из условия, и по какому закону</p></div>
    </div>
    <div class="controls">
      <div class="field"><label for="x16Student">Ученик</label><input type="text" id="x16Student" placeholder="Фамилия Имя" autocomplete="off"></div>
      <button class="btn" id="x16Log">Журнал</button>
    </div>
  </header>
  <div class="exam-bar" id="x16ExamBar" hidden></div>
  <div class="status" id="x16Status"></div>

  <section class="t16-wrap">
   <div class="maincol">
    <div class="card">
      <div class="card-h"><span class="step">1</span><h2>Что следует из условия?</h2><p>Условие считается истинным. Ровно одно из трёх утверждений обязательно истинно вместе с ним. Слова-бессмыслицы нужны, чтобы рассуждать по форме, а не по знанию о мире.</p></div>
      <div class="body">
        <div class="kind" id="x16Kind"></div>
        <blockquote class="sent" id="x16Sent"></blockquote>
        <ul class="defs" id="x16Defs" hidden></ul>
        <div class="opts" id="x16Opts"></div>
        <div class="actions" id="x16HintRow"><button class="btn ghost" id="x16Hint">Подсказка: показать формулы</button><span class="tries">Клавиши 1, 2, 3 — выбор следствия</span></div>
        <div class="msg" id="x16Msg1"></div>
      </div>
    </div>
    <div class="card" id="x16LawCard" hidden>
      <div class="card-h"><span class="step">2</span><h2>По какому закону?</h2><p>Какой закон или правило вывода обосновывает переход от условия к выбранному следствию?</p></div>
      <div class="body">
        <div class="lawopts" id="x16LawOpts"></div>
        <div class="msg" id="x16Msg2"></div>
      </div>
    </div>

    <div class="card" id="x16Rev" hidden>
      <div class="card-h"><span class="step">3</span><h2>Разбор на языке алгебры логики</h2><p>Обозначения, формула условия и проверка каждого следствия.</p></div>
      <div class="body">
        <div id="x16RevBody"></div>
        <div id="x16FormBox" hidden>
          <h3 class="sub">Закрепление: запиши условие формулой</h3>
          <div class="exprline"><span class="pre">F =</span><input type="text" id="x16Expr" placeholder="например: ¬(A ∧ B)" spellcheck="false" autocomplete="off" aria-label="Формула условия"></div>
          <div class="preview" id="x16Prev">&nbsp;</div>
          <div class="pad" id="x16Pad"></div>
          <div class="actions"><button class="btn" id="x16FCheck">Проверить формулу</button><span class="tries" id="x16FTries"></span></div>
          <div class="msg" id="x16Msg3"></div>
        </div>
        <div class="actions"><button class="btn primary" id="x16Next">Следующий пункт →</button></div>
      </div>
    </div>
   </div>
    <aside class="card side">
      <div class="card-h"><span class="step">≡</span><h2>Законы и правила вывода</h2><p>«=» — равносильность, «⇒» — следование.</p></div>
      <div class="body"><table class="laws" id="x16Laws"></table></div>
    </aside>

  </section>
</div>
<div class="toast" id="x16Toast"></div>`;

/* ---------- прогресс для карты ---------- */
function counts(){
  const done=store.get('done',{}),forms=store.get('forms',{});
  const ids=Object.keys(done).filter(id=>BY[id]);
  const q=ids.filter(id=>BY[id].q).length,n=ids.length,f=Object.keys(forms).filter(id=>BY[id]).length;
  return {n,q,f};
}
function summarize(){
  const {n,q,f}=counts();
  if(!n&&!f&&!AL.node(NODE).touched)return;
  const items=Math.min(NEED.items,Math.min(n,NEED.items-NEED.quant+Math.min(q,NEED.quant)));
  const mastered=n>=NEED.items&&q>=NEED.quant&&f>=NEED.forms;
  AL.report(NODE,{done:items+Math.min(f,NEED.forms),total:NEED.items+NEED.forms,
    note:`Пунктов ${Math.min(n,NEED.items)} из ${NEED.items} (кванторы ${Math.min(q,NEED.quant)} из ${NEED.quant}) · формул ${Math.min(f,NEED.forms)} из ${NEED.forms}`,
    mastered,via:mastered?'practice':undefined});
}
const exportData=()=>({d:store.get('done',{}),f:store.get('forms',{})});
function importData(d){if(!d)return;
  store.set('done',Object.assign({},d.d||{},store.get('done',{})));
  store.set('forms',Object.assign({},d.f||{},store.get('forms',{})));
  summarize();if(api)api.refresh()}

let api=null;
function mount(){if(api)return api;document.getElementById('view-t16').innerHTML=MARKUP;api=init();return api}

function init(){
const $=s=>document.querySelector(s);
let log=store.get('log',[]);
let IT=null,order=[],st=null,EX=null;
const recent=[];
function addLog(stage,input,note,id){log.push({t:new Date().toISOString(),seed:id||'—',student:AL.student.get(),stage,input,note});if(log.length>3000)log=log.slice(-3000);store.set('log',log)}
function toast(t){const el=$('#x16Toast');el.textContent=t;el.classList.add('show');clearTimeout(toast.h);toast.h=setTimeout(()=>el.classList.remove('show'),1800)}
function showMsg(sel,cls,html){const el=$(sel);el.className='msg show '+cls;el.innerHTML=html}
function hideMsg(sel){$(sel).className='msg'}
function setHash(h){if(location.hash.slice(1)!==h){try{history.replaceState(null,'','#'+h)}catch(e){location.hash=h}}}
const shown=f=>IT.q?qshow(f):pshow(f);
const varsOf=()=>Object.keys(IT.d);

/* выбор пункта: сначала нерешённые, без недавних повторов */
function pick(){
  const done=store.get('done',{});
  let pool=ITEMS.filter(x=>!recent.includes(x.id));
  const fresh=pool.filter(x=>!done[x.id]);
  const {q}=counts();
  if(q<NEED.quant){const fq=fresh.filter(x=>x.q);if(fq.length&&Math.random()<.4)pool=fq;else if(fresh.length)pool=fresh}
  else if(fresh.length)pool=fresh;
  const x=pool[Math.floor(Math.random()*pool.length)];
  recent.push(x.id);if(recent.length>10)recent.shift();return x;
}

function renderLaws(){
  $('#x16Laws').innerHTML='<tbody>'+Object.values(LAWS).map(l=>`<tr><td>${esc(l.n)}</td><td>${esc(l.f)}</td></tr>`).join('')+'</tbody>';
}
function renderStatus(){
  if(EX){$('#x16Status').innerHTML='';return}
  const {n,q,f}=counts(),lock=store.get('examLock',0);
  const chip=(ok,t)=>`<span class="chip ${ok?'ok':''}"><span class="dot"></span>${t}</span>`;
  $('#x16Status').innerHTML=chip(n>=NEED.items,`Пунктов <b>${Math.min(n,NEED.items)}/${NEED.items}</b>`)+
    chip(q>=NEED.quant,`с кванторами <b>${Math.min(q,NEED.quant)}/${NEED.quant}</b>`)+
    chip(f>=NEED.forms,`формул <b>${Math.min(f,NEED.forms)}/${NEED.forms}</b>`)+
    `<span class="spacer"></span>`+
    (AL.node(NODE).mastered?'<span class="tries">Тема освоена</span>':
      lock>0?`<span class="tries">Пересдача зачёта — после ${lock} ${lock===1?'верного пункта':'верных пунктов'} подряд</span>`:
      '<a class="btn" href="#t16-exam">Сдать зачёт «знаю тему»</a>');
}

/* ---------- пункт ---------- */
function show(item){
  IT=item||pick();
  order=AL.shuffle([0,1,2]);
  st={choice:null,law:null,lawOpts:null,helped:false,formOk:false,ftries:0};
  $('#x16Kind').innerHTML=IT.q?`<span class="tag e">кванторы · ${esc(IT.u)}</span>`:'<span class="tag t">высказывания</span>';
  $('#x16Sent').textContent=IT.t;
  $('#x16Defs').hidden=true;$('#x16Defs').innerHTML='';
  $('#x16Opts').innerHTML=order.map((k,i)=>`<button class="btn ans" data-k="${k}"><span class="k">${i+1}</span><span class="tx">${esc(IT.o[k][0])}</span><span class="fx" hidden></span></button>`).join('');
  $('#x16HintRow').hidden=!!EX;$('#x16Hint').disabled=false;
  hideMsg('#x16Msg1');hideMsg('#x16Msg2');hideMsg('#x16Msg3');
  $('#x16LawCard').hidden=true;$('#x16Rev').hidden=true;
  renderStatus();if(EX)renderExamBar();
}
function defsHtml(){return Object.entries(IT.d).map(([v,s])=>`<li><b>${v}${IT.q?'(x)':''}</b> — «${esc(s)}»</li>`).join('')}
function hint(){
  if(st.choice!==null||EX)return;
  st.helped=true;$('#x16Hint').disabled=true;
  $('#x16Defs').innerHTML=defsHtml()+`<li class="pf">Условие: <b>${esc(shown(IT.P))}</b></li>`;$('#x16Defs').hidden=false;
  document.querySelectorAll('#x16Opts .ans').forEach(b=>{const f=b.querySelector('.fx');f.textContent=shown(IT.o[+b.dataset.k][1]);f.hidden=false});
  addLog('Подсказка','формулы',IT.t,IT.id);
  toast('С подсказкой пункт не идёт в счёт освоения');
}
function choose(k){
  if(st.choice!==null)return;st.choice=k;
  const ok=k===IT.c;
  document.querySelectorAll('#x16Opts .ans').forEach(b=>{b.disabled=true;const kk=+b.dataset.k;if(kk===IT.c)b.classList.add('ok');else if(kk===k)b.classList.add('bad')});
  $('#x16Hint').disabled=true;
  if(EX){
    if(!ok){EX.res.push(false);addLog('Зачёт',IT.o[k][0],`${IT.t} — ошибка в следствии`,IT.id);
      showMsg('#x16Msg1','bad',`<b>Не следует.</b> ${esc(IT.why)}<div class="actions">${exNextBtn()}</div>`);renderExamBar();return}
    showMsg('#x16Msg1','ok','<b>Следствие выбрано.</b> Теперь назови закон.');askLaw();return;
  }
  if(ok){showMsg('#x16Msg1','ok','<b>Верно, это следует.</b> Теперь назови закон, который это обосновывает.');askLaw()}
  else{
    addLog('Следствие',IT.o[k][0],`${IT.t} — не следует`,IT.id);
    const lock=store.get('examLock',0);if(lock)store.set('examLock',2);
    showMsg('#x16Msg1','bad',`<b>Не следует.</b> Верный ответ отмечен зелёным. Ниже — почему выбранное утверждение может быть ложным при истинном условии.`);
    reveal();
  }
}
function askLaw(){
  const pool=(IT.q?QPOOL:Object.keys(LAWS).filter(id=>LAWS[id].g==='p')).filter(id=>id!==IT.law&&!IT.ex.includes(id));
  st.lawOpts=AL.shuffle([IT.law,...AL.shuffle(pool).slice(0,3)]);
  $('#x16LawOpts').innerHTML=st.lawOpts.map(id=>`<button class="btn lawbtn" data-l="${id}"><b>${esc(LAWS[id].n)}</b><span>${esc(LAWS[id].f)}</span></button>`).join('');
  $('#x16LawCard').hidden=false;hideMsg('#x16Msg2');
  setTimeout(()=>{const b=$('#x16LawOpts .lawbtn');b&&b.focus()},0);
}
function chooseLaw(id){
  if(st.law!==null)return;st.law=id;
  const ok=id===IT.law;
  document.querySelectorAll('#x16LawOpts .lawbtn').forEach(b=>{b.disabled=true;if(b.dataset.l===IT.law)b.classList.add('ok');else if(b.dataset.l===id)b.classList.add('bad')});
  const right=LAWS[IT.law];
  if(EX){
    EX.res.push(ok);addLog('Зачёт',LAWS[id].n,`${IT.t} — ${ok?'верно':'ошибка в законе'}`,IT.id);
    showMsg('#x16Msg2',ok?'ok':'bad',`<b>${ok?'Верно.':'Не тот закон.'}</b> ${esc(IT.why)}<div class="actions">${exNextBtn()}</div>`);
    renderExamBar();return;
  }
  if(ok){
    const counted=!st.helped,done=store.get('done',{}),first=!done[IT.id];
    if(counted){done[IT.id]=true;store.set('done',done);
      const lock=store.get('examLock',0);if(lock)store.set('examLock',lock-1)}
    addLog(counted?'Верно':'Подсказка',right.n,`${IT.t}${counted?'':' — с подсказкой, не в счёт'}`,IT.id);
    showMsg('#x16Msg2','ok',`<b>Верно: ${esc(right.n)}.</b> ${counted?(first?'Пункт засчитан.':'Этот пункт уже был засчитан раньше.'):'Пункт решён с подсказкой и в счёт не идёт — попробуй его ещё раз позже.'}`);
    summarize();
  }else{
    addLog('Закон',LAWS[id].n,`${IT.t} — нужен закон «${right.n}»`,IT.id);
    const lock=store.get('examLock',0);if(lock)store.set('examLock',2);
    showMsg('#x16Msg2','bad',`<b>Не тот закон.</b> Здесь работает «${esc(right.n)}»: ${esc(right.f)}. Пункт пока не засчитан — он ещё вернётся.`);
  }
  reveal();
}
/* разбор: обозначения, формулы, вердикт по каждому следствию */
function reveal(){
  const law=LAWS[IT.law];
  const rows=order.map(k=>{
    const [tx,f,ce]=IT.o[k],good=k===IT.c;
    let why='';
    if(good)why=`<span class="ok">следует</span> — ${esc(law.n)}`;
    else if(IT.q)why=`<span class="no">не следует.</span> ${esc(ce||'')}`;
    else{const e=counter(IT,k);
      why=`<span class="no">не следует.</span> Контрпример: ${Object.entries(e).map(([v,x])=>`${v} = ${x}`).join(', ')} — условие истинно, а это утверждение ложно (${Object.entries(e).map(([v,x])=>`${esc(IT.d[v])} — ${x?'да':'нет'}`).join('; ')}).`}
    return `<tr class="${good?'good':''}"><td class="tx">${esc(tx)}</td><td class="f">${esc(shown(f))}</td><td>${why}</td></tr>`;
  }).join('');
  $('#x16RevBody').innerHTML=`<ul class="defs">${defsHtml()}</ul>
    <p class="pline">Условие: <b class="mono">${esc(shown(IT.P))}</b>${IT.q?` <span class="tries">· рассуждаем о непустом множестве: ${esc(IT.u)}</span>`:''}</p>
    <div class="tt-wrap"><table class="rev"><thead><tr><th>Утверждение</th><th>Формула</th><th>Следует ли</th></tr></thead><tbody>${rows}</tbody></table></div>
    <p class="lawline"><b>${esc(law.n)}:</b> <span class="mono">${esc(law.f)}</span></p>
    <p class="whyline">${esc(IT.why)}</p>`;
  $('#x16Rev').hidden=false;
  const fb=!IT.q&&!EX;$('#x16FormBox').hidden=!fb;
  if(fb){
    const forms=store.get('forms',{});
    $('#x16Expr').value='';$('#x16Expr').disabled=false;$('#x16FCheck').disabled=false;updPrev();hideMsg('#x16Msg3');
    $('#x16FTries').textContent=forms[IT.id]?'Для этого пункта формула уже записана':'Буквы — из обозначений выше';
    const keys=[...varsOf().map(v=>[v,v,'']),['¬','¬','op'],['∧',' ∧ ','op'],['∨',' ∨ ','op'],['→',' → ','op'],['≡',' ≡ ','op'],['⊕',' ⊕ ','op'],['(','(',''],[')',')',''],['⌫','BS',''],['Сброс','CLR','']];
    $('#x16Pad').innerHTML=keys.map(([l,ins,c])=>`<button class="${c}" data-ins="${esc(ins)}">${l}</button>`).join('');
  }
  $('#x16Next').hidden=!!EX;
  renderStatus();
  setTimeout(()=>$('#x16Rev').scrollIntoView({behavior:'smooth',block:'nearest'}),30);
}
/* закрепление: условие формулой */
function updPrev(){
  const src=$('#x16Expr').value,el=$('#x16Prev');
  if(!src.trim()){el.className='preview';el.innerHTML='&nbsp;';return}
  try{const a=L.parse(src);el.className='preview';el.textContent='Читается как: F = '+L.pretty(a)}
  catch(e){if(!(e instanceof L.Err))throw e;el.className='preview err';el.textContent=`${e.msg} (позиция ${e.pos+1})`}
}
function checkForm(){
  if(st.formOk)return;
  let a;try{a=L.parse($('#x16Expr').value)}catch(e){if(!(e instanceof L.Err))throw e;showMsg('#x16Msg3','info',`Формула не разобрана: ${esc(e.msg)}. Это не считается попыткой.`);return}
  const vs=varsOf(),extra=[...L.vars(a)].filter(v=>!vs.includes(v));
  if(extra.length){showMsg('#x16Msg3','info',`В этом пункте нет высказывания ${extra.join(', ')}. Используй ${vs.join(', ')}.`);return}
  st.ftries++;
  const d=L.diff(IT.ast,a,vs),pr=L.pretty(a);
  if(!d){
    st.formOk=true;const forms=store.get('forms',{}),first=!forms[IT.id];forms[IT.id]=true;store.set('forms',forms);
    addLog('Верно',pr,`Формула условия: ${IT.t}`,IT.id);summarize();renderStatus();
    $('#x16Expr').disabled=true;$('#x16FCheck').disabled=true;
    showMsg('#x16Msg3','ok',`<b>Верно.</b> F = ${esc(pr)}${pr!==L.pretty(IT.ast)?` — равносильно ${esc(L.pretty(IT.ast))}`:''}.${first?'':' Для этого пункта формула уже была засчитана.'}`);
  }else{
    addLog('Формула',pr,`${IT.t} — расходится при ${Object.entries(d.env).map(([k,v])=>k+'='+v).join(', ')}`,IT.id);
    showMsg('#x16Msg3','bad',`<b>Не совпадает.</b> При ${Object.entries(d.env).map(([v,x])=>`${v} = ${x}`).join(', ')} условие по смыслу ${d.a?'истинно':'ложно'}, а твоя формула даёт ${d.b}.${st.ftries>=2?` Ответ: F = ${esc(L.pretty(IT.ast))}.`:''}`);
  }
}

/* ---------- зачёт: 6 пунктов (4 с высказываниями, 2 с кванторами), разные законы; одна ошибка допускается ---------- */
const EXN=6,EXOK=5;
function startExam(){
  if(store.get('examLock',0)>0&&!AL.node(NODE).mastered){toast('Сначала реши верно пункты практики подряд');setHash('t16');show();return}
  const used=new Set(),tasks=[];
  const take=(arr,n)=>{for(const x of AL.shuffle(arr)){if(tasks.filter(t=>t.q===arr[0].q).length>=n)break;if(!used.has(x.law)){used.add(x.law);tasks.push(x)}}};
  take(ITEMS.filter(x=>x.q),2);take(ITEMS.filter(x=>!x.q),4);
  EX={tasks:AL.shuffle(tasks),i:0,res:[],done:false};
  addLog('Зачёт','—','Начат зачёт: '+EX.tasks.map(t=>t.id).join(', '));
  document.querySelector('.app.t16').classList.add('exam');
  show(EX.tasks[0]);
}
function exNextBtn(){return `<button class="btn primary" id="x16ExNext">${EX.i<EX.tasks.length-1?'Дальше →':'Итог зачёта'}</button>`}
function renderExamBar(){
  const bar=$('#x16ExamBar');if(!EX){bar.hidden=true;document.querySelector('.app.t16').classList.remove('exam');return}
  bar.hidden=false;
  bar.innerHTML=`<div class="ex-t"><b>Зачёт по теме 1а</b><span>${EX.done?'Зачёт завершён':`Пункт ${EX.i+1} из ${EX.tasks.length}`} · одна попытка на следствие и на закон · можно ошибиться один раз</span></div>
    <div class="ex-dots">${EX.tasks.map((t,i)=>`<span class="ex-dot ${i<EX.res.length?(EX.res[i]?'ok':'bad'):i===EX.i?'now':''}"></span>`).join('')}</div>
    <button class="btn ghost" id="x16ExQuit">${EX.done?'Закрыть зачёт':'Прервать зачёт'}</button>`;
}
function examNext(){
  if(EX.res.length<=EX.i)return;
  if(EX.i<EX.tasks.length-1){EX.i++;show(EX.tasks[EX.i]);return}
  EX.done=true;const k=EX.res.filter(Boolean).length,n=EX.tasks.length;renderExamBar();
  const sel=$('#x16Msg2').classList.contains('show')?'#x16Msg2':'#x16Msg1';
  if(k>=EXOK){AL.report(NODE,{mastered:true,via:'exam'});addLog('Верно','зачёт',`Зачёт сдан: ${k} из ${n}`);store.set('examLock',0);
    showMsg(sel,'ok',`<b>Зачёт сдан: ${k} из ${n}.</b> Тема 1а засчитана.<div class="actions"><a class="btn primary" href="#map">На карту навыков</a><button class="btn" id="x16ExStay">Остаться в тренажёре</button></div>`)}
  else{addLog('Зачёт','—',`Не сдан: ${k} из ${n}`);store.set('examLock',2);
    showMsg(sel,'bad',`<b>Зачёт не сдан: верно ${k} из ${n}.</b> Нужно хотя бы ${EXOK}. Пересдать можно после двух верных пунктов практики подряд — без подсказки, со следствием и законом.<div class="actions"><button class="btn primary" id="x16ExStay">Тренироваться</button></div>`)}
}
function stopExam(){
  if(EX&&!EX.done)addLog('Зачёт','—',`Прерван на пункте ${EX.i+1}`);
  EX=null;renderExamBar();setHash('t16');show();
}

/* ---------- события ---------- */
$('#x16Opts').addEventListener('click',e=>{const b=e.target.closest('.ans');if(b)choose(+b.dataset.k)});
$('#x16LawOpts').addEventListener('click',e=>{const b=e.target.closest('.lawbtn');if(b)chooseLaw(b.dataset.l)});
$('#x16Hint').onclick=hint;
$('#x16Next').onclick=()=>{show();window.scrollTo({top:0,behavior:'smooth'})};
const onMsg=e=>{
  if(e.target.id==='x16ExNext'){examNext();if(EX&&!EX.done)window.scrollTo({top:0,behavior:'smooth'})}
  if(e.target.id==='x16ExStay')stopExam();
};
['#x16Msg1','#x16Msg2'].forEach(s=>$(s).addEventListener('click',onMsg));
$('#x16ExamBar').addEventListener('click',e=>{if(e.target.id==='x16ExQuit')stopExam()});
document.addEventListener('keydown',e=>{
  if($('#view-t16').hidden)return;
  const tag=(e.target.tagName||'').toLowerCase();if(tag==='input'||tag==='textarea'||e.ctrlKey||e.metaKey||e.altKey)return;
  if(st&&st.choice===null&&['1','2','3'].includes(e.key)){e.preventDefault();choose(order[+e.key-1])}
});
$('#x16Expr').addEventListener('input',updPrev);
$('#x16Expr').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();checkForm()}});
$('#x16Pad').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b||$('#x16Expr').disabled)return;const inp=$('#x16Expr'),ins=b.dataset.ins;
  let s=inp.selectionStart??inp.value.length,en=inp.selectionEnd??inp.value.length;
  if(ins==='CLR'){inp.value='';s=0}
  else if(ins==='BS'){if(s===en&&s>0){inp.value=inp.value.slice(0,s-1)+inp.value.slice(en);s--}else inp.value=inp.value.slice(0,s)+inp.value.slice(en)}
  else{inp.value=inp.value.slice(0,s)+ins+inp.value.slice(en);s+=ins.length}
  inp.focus();try{inp.setSelectionRange(s,s)}catch(err){}updPrev();
});
$('#x16FCheck').onclick=checkForm;
$('#x16Student').value=AL.student.get();
$('#x16Student').addEventListener('input',()=>AL.student.set($('#x16Student').value));
AL.on('student',v=>{if(document.activeElement!==$('#x16Student'))$('#x16Student').value=v});
$('#x16Log').onclick=()=>AL.openLog&&AL.openLog();
renderLaws();

function enter(arg){
  if(arg==='exam'){if(!EX||EX.done)startExam();return}
  if(EX&&EX.done){stopExam();return}
  if(EX)return;
  if(arg&&BY[arg]){show(BY[arg]);return}
  if(!IT)show();else renderStatus();
}
function refresh(){renderStatus()}
return {enter,refresh};
}

AL.register('t16',{title:'Логические следствия',logRows:()=>store.get('log',[]),exportData,importData,enter:arg=>mount().enter(arg),
  _bank:{ITEMS,LAWS,qeval}});
summarize();
})();
