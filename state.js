// ── FIREBASE ───────────────────────────────────────────────────────────────
const _fbApp=firebase.initializeApp({
  apiKey:"AIzaSyBgZs-iX1_4Sn8Gm2NXfUoy8ihQAMAfyt0",
  authDomain:"budget-app-b2b7c.firebaseapp.com",
  projectId:"budget-app-b2b7c",
  storageBucket:"budget-app-b2b7c.firebasestorage.app",
  messagingSenderId:"2944772052",
  appId:"1:2944772052:web:e6f53ff2c988177fe75841"
});
const _db=firebase.firestore();
const DEVICE_ID=(()=>{let id=localStorage.getItem('budget_dev_id');if(!id){id='d'+Math.random().toString(36).slice(2,10);localStorage.setItem('budget_dev_id',id);}return id;})();
const _roomListeners={};

// ── CONSTANTS ──────────────────────────────────────────────────────────────
const ACC_COLORS=['#F0924A','#4A78C4','#5A9068','#C45555','#8B6CC8','#C49830','#4AA8A8','#A86870'];
const DEFAULT_ACC_TYPES=[
  {id:'cash',name:'現金',icon:'💵'},
  {id:'bank',name:'銀行帳戶',icon:'🏦'},
  {id:'stored',name:'儲值帳戶',icon:'🪙'},
  {id:'invest',name:'投資帳戶',icon:'📈'},
  {id:'credit',name:'信用卡',icon:'💳'},
  {id:'loan',name:'借貸帳戶',icon:'🤝'},
  {id:'other',name:'其他',icon:'💰'},
];
const DEFAULT_ACCOUNTS=[
  {id:'cash',name:'現金',type:'cash',icon:'💵',color:'#F0924A',init:0},
  {id:'bank1',name:'銀行帳戶',type:'bank',icon:'🏦',color:'#4A78C4',init:0},
];
const DEFAULT_EXP_CATS=[
  {id:'food',name:'餐飲',icon:'🍜',budget:0,subcats:[
    {id:'sc_breakfast',name:'早餐',icon:'🌅'},{id:'sc_lunch',name:'午餐',icon:'🍱'},
    {id:'sc_dinner',name:'晚餐',icon:'🍽️'},{id:'sc_drink',name:'飲料',icon:'🧋'},
  ]},
  {id:'transport',name:'交通',icon:'🚌',budget:0,subcats:[]},
  {id:'shopping',name:'購物',icon:'🛍️',budget:0,subcats:[]},
  {id:'entertain',name:'娛樂',icon:'🎮',budget:0,subcats:[]},
  {id:'health',name:'醫療',icon:'💊',budget:0,subcats:[]},
  {id:'housing',name:'住宅',icon:'🏠',budget:0,subcats:[]},
  {id:'education',name:'教育',icon:'📚',budget:0,subcats:[]},
  {id:'other_e',name:'其他',icon:'📦',budget:0,subcats:[]},
];
const DEFAULT_INC_CATS=[
  {id:'salary',name:'薪資',icon:'💰',budget:0,subcats:[]},
  {id:'parttime',name:'兼職',icon:'💼',budget:0,subcats:[]},
  {id:'invest_i',name:'投資',icon:'📈',budget:0,subcats:[]},
  {id:'gift',name:'禮金',icon:'🎁',budget:0,subcats:[]},
  {id:'other_i',name:'其他',icon:'➕',budget:0,subcats:[]},
];
const MONTHS=['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
const EMOJI_QUICK=['🍜','🍱','🍽️','🍔','🍕','🧋','☕','🥗','🍰','🎂','🥩','🍣','🥘','🌮',
  '🚌','🚗','🚆','✈️','🛵','🚲','⛽','🚕',
  '🛍️','👗','👟','💄','🧴','👜','💍','🎁','🧸',
  '🎮','🎬','🎵','🎨','🎲','📱','🎭','🎯',
  '💊','🏥','🩺','🏃','💪','🧘','🌿',
  '🏠','🔑','🪴','🛋️','💡','🔧',
  '📚','📖','···','🎓','💻','🖊️',
  '💰','💳','📦','⭐','🌟','❤️','🌈','🐱','🐶','🌸','🌺','🎀'];

const INS_TYPES=['壽險','醫療險','意外險','車險','產險','其他'];
const INS_TCOLORS={'壽險':'#5A9068','醫療險':'#4A78C4','意外險':'#C49830','車險':'#C45555','產險':'#8B6CC8','其他':'#888888'};
const INS_TICONS={'壽險':'🛡️','醫療險':'🏥','意外險':'⚡','車險':'🚗','產險':'🏠','其他':'📋'};
const INS_FREQS=[{id:'yearly',label:'每年'},{id:'semi',label:'每半年'},{id:'quarterly',label:'每季'},{id:'monthly',label:'每月'}];

// ── INDEXEDDB (PDF storage) ────────────────────────────────────────────────
let _idb=null;
function openIDB(){
  if(_idb)return Promise.resolve(_idb);
  return new Promise((res,rej)=>{
    const r=indexedDB.open('budget_ins_db',1);
    r.onupgradeneeded=e=>{if(!e.target.result.objectStoreNames.contains('pdfs'))e.target.result.createObjectStore('pdfs',{keyPath:'id'});};
    r.onsuccess=e=>{_idb=e.target.result;res(_idb);};
    r.onerror=()=>rej(r.error);
  });
}
function idbPut(id,data,name){return openIDB().then(db=>new Promise((res,rej)=>{const tx=db.transaction('pdfs','readwrite');tx.objectStore('pdfs').put({id,data,name});tx.oncomplete=res;tx.onerror=()=>rej(tx.error);}));}
function idbGet(id){return openIDB().then(db=>new Promise((res,rej)=>{const r=db.transaction('pdfs','readonly').objectStore('pdfs').get(id);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);}));}
function idbDel(id){return openIDB().then(db=>new Promise((res,rej)=>{const tx=db.transaction('pdfs','readwrite');tx.objectStore('pdfs').delete(id);tx.oncomplete=res;tx.onerror=()=>rej(tx.error);}));}
function idbAll(){return openIDB().then(db=>new Promise((res,rej)=>{const r=db.transaction('pdfs','readonly').objectStore('pdfs').getAll();r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);}));}
function idbClear(){return openIDB().then(db=>new Promise((res,rej)=>{const tx=db.transaction('pdfs','readwrite');tx.objectStore('pdfs').clear();tx.oncomplete=res;tx.onerror=()=>rej(tx.error);}));}

// ── STORAGE ────────────────────────────────────────────────────────────────
function load(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}}
function save(k,v){localStorage.setItem(k,JSON.stringify(v))}

// ── PURE UTILS (needed for state init) ────────────────────────────────────
function todayStr(){return new Date().toISOString().split('T')[0]}

// ── STATE ──────────────────────────────────────────────────────────────────
const _now=new Date();
let state={
  view:'add',
  txs:load('budget_txs',[]),
  accounts:load('budget_accounts',DEFAULT_ACCOUNTS),
  cats:{expense:load('budget_cats_exp',DEFAULT_EXP_CATS),income:load('budget_cats_inc',DEFAULT_INC_CATS)},
  emergencyFund:load('budget_ef',{accountId:null}),
  form:null,
  calMonth:{y:_now.getFullYear(),m:_now.getMonth()},
  statsMonth:{y:_now.getFullYear(),m:_now.getMonth()},
  histFilter:'all',
  histAccFilter:'',
  histPeriod:'month',
  histFrom:'',
  histTo:'',
  settingsTab:'main',
  catTypeTab:'expense',
  nickname:load('budget_nickname',''),
  homeDayOffset:0,
  dreamFund:load('budget_df',{accountId:null,target:0,wish:''}),
  accHideBalance:load('budget_hide_bal',false),
  loans:load('budget_loans',[]),
  fixedExpenses:load('budget_fixed',[]),
  insurances:load('budget_insurances',[]),
  insMembers:load('budget_ins_members',[]),
  insFilter:'all',
  insPersonFilter:'all',
  insCompanyFilter:'all',
  insOpenCov:new Set(),
  assetsTab:'accounts',
  statsView:'month',
  statsYear:{y:_now.getFullYear()},
  modal:null,
  editForm:{},

  books:load('budget_books',null),
  activeBook:load('budget_active_book','all'),
  booksTab:'active',
  accTypes:load('budget_acc_types',null),
  budgetMode:load('budget_mode','month'),
  homeBudgetPeriod:load('budget_mode','month'),
  theme:load('budget_theme','pink'),
  fontStyle:load('budget_font','huninn'),
  hiddenFonts:load('budget_hidden_fonts',[]),
};
// 帳本初始化：若第一次執行則建立預設帳本並將舊資料歸入
if(!state.books){
  state.books=[{id:'default',name:'個人帳本',icon:'📒',type:'personal',currency:'TWD',isDefault:true,isArchived:false,createdAt:todayStr()}];
  state.txs=state.txs.map(t=>({...t,bookId:t.bookId||'default'}));
  save('budget_books',state.books);
  save('budget_txs',state.txs);
}
if(!state.accTypes){
  state.accTypes=DEFAULT_ACC_TYPES;
  save('budget_acc_types',state.accTypes);
}

// ── THEMES & FONTS ─────────────────────────────────────────────────────────
const THEMES={
  pink:{name:'莫蘭迪粉',swatches:['#C59390','#C8A5A3','#D0B0B1'],
    vars:{'--p':'#C8A5A3','--p2':'#D0B0B1','--p3':'#C59390','--latte':'#C59390','--latte2':'#D0B0B1',
          '--bg':'#FFFFFF','--surface':'#F9F3F2','--text':'#3A2828','--text2':'#907878','--border':'#EDE0DC',
          '--shadow':'rgba(180,130,130,.06)','--hdr-grad':'linear-gradient(135deg,#C59390 0%,#C8A5A3 50%,#D0B0B1 100%)'}},
  blue:{name:'莫蘭迪藍',swatches:['#8B9FBA','#9BAFC2','#ACCBD8'],
    vars:{'--p':'#9BAFC2','--p2':'#ACCBD8','--p3':'#8B9FBA','--latte':'#8B9FBA','--latte2':'#ACCBD8',
          '--bg':'#FFFFFF','--surface':'#F3F5F9','--text':'#28303A','--text2':'#6878A0','--border':'#DCE0EA',
          '--shadow':'rgba(100,120,160,.06)','--hdr-grad':'linear-gradient(135deg,#8B9FBA 0%,#9BAFC2 50%,#ACCBD8 100%)'}},
  white:{name:'純白極簡',swatches:['#A0A0A0','#B8B8B8','#CCCCCC'],
    vars:{'--p':'#888888','--p2':'#AAAAAA','--p3':'#666666','--latte':'#666666','--latte2':'#AAAAAA',
          '--bg':'#FFFFFF','--surface':'#F5F5F5','--text':'#1A1A1A','--text2':'#888888','--border':'#E0E0E0',
          '--shadow':'rgba(0,0,0,.05)','--hdr-grad':'linear-gradient(135deg,#8C8C8C 0%,#A8A8A8 50%,#C0C0C0 100%)'}},
  dark:{name:'暗黑極簡',swatches:['#333333','#555555','#777777'],
    vars:{'--p':'#888888','--p2':'#AAAAAA','--p3':'#666666','--latte':'#666666','--latte2':'#AAAAAA',
          '--bg':'#181818','--surface':'#242424','--text':'#E8E8E8','--text2':'#909090','--border':'#383838',
          '--shadow':'rgba(0,0,0,.3)','--hdr-grad':'linear-gradient(135deg,#1A1A1A 0%,#2A2A2A 50%,#383838 100%)'}},
};
const FONTS={
  huninn:{name:'粉圓體',family:"'JFOpenHuninn','Nunito',-apple-system,'PingFang TC','Microsoft JhengHei UI',sans-serif"},
  huakangmid:{name:'華康中圓體',family:"'HuaKangMidRound',-apple-system,'PingFang TC','Microsoft JhengHei UI',sans-serif"},
  huakangsup:{name:'華康超圓體',family:"'HuaKangSuperRound',-apple-system,'PingFang TC','Microsoft JhengHei UI',sans-serif"},
  lixian:{name:'粒線體',family:"'LiXian',-apple-system,'PingFang TC','Microsoft JhengHei UI',sans-serif"},
  cuxian:{name:'粗線體',family:"'CuXian',-apple-system,'PingFang TC','Microsoft JhengHei UI',sans-serif"},
  dandan:{name:'蛋蛋自由體',family:"'DanDanFree',-apple-system,'PingFang TC','Microsoft JhengHei UI',sans-serif"},
  zenmaru:{name:'Zen 圓體',family:"'ZenMaruGothic',-apple-system,'PingFang TC','Microsoft JhengHei UI',sans-serif"},
  mgen1c:{name:'Rounded Mgen+體',family:"'MgenPlus1c',-apple-system,'PingFang TC','Microsoft JhengHei UI',sans-serif"},
  kanaka:{name:'鹿仲茉菜手寫',family:"'KanakaFont',-apple-system,'PingFang TC','Microsoft JhengHei UI',sans-serif"},
  maruko:{name:'馬路口圓體',family:"'MarukoGothic',-apple-system,'PingFang TC','Microsoft JhengHei UI',sans-serif"},
  system:{name:'系統預設字型',family:"-apple-system,'PingFang TC','Microsoft JhengHei UI','Helvetica Neue',sans-serif"},
};
function applyAppTheme(){
  const root=document.documentElement.style;
  const t=THEMES[state.theme||'pink'];
  if(t)Object.entries(t.vars).forEach(([k,v])=>root.setProperty(k,v));
  const f=FONTS[state.fontStyle||'huninn'];
  if(f)document.body.style.fontFamily=f.family;
  document.body.dataset.font=state.fontStyle||'huninn';
}

// ── STARTUP INIT ───────────────────────────────────────────────────────────
state.form=defaultForm();
// 啟動時自動處理到期固定費用
setTimeout(()=>{const n=processFixedExpenses();if(n>0)showToast(`已自動記入 ${n} 筆固定費用 ✓`);},300);
// 啟動時重連所有共同帳本
setTimeout(()=>{(state.books||[]).filter(b=>b.type==='shared'&&b.roomCode).forEach(b=>_startBookListener(b.roomCode,b.id));},800);

// ── CORE FUNCTIONS ─────────────────────────────────────────────────────────
function defaultForm(){
  const accs=state?state.accounts:DEFAULT_ACCOUNTS;
  const fromId=accs[0]?.id||'cash';
  const toId=accs[1]?.id||fromId;
  const defBookId=(state?.books||[]).find(b=>b.isDefault)?.id||'default';
  return{type:'expense',category:'food',subCategory:'',amount:'',
    date:todayStr(),note:'',accountId:fromId,installment:0,
    fromAccountId:fromId,toAccountId:toId,bookId:defBookId};
}
function activeTxs(){
  const books=state.books||[];
  if(state.activeBook==='all'){
    const archivedIds=new Set(books.filter(b=>b.isArchived).map(b=>b.id));
    return state.txs.filter(t=>!archivedIds.has(t.bookId));
  }
  return state.txs.filter(t=>t.bookId===state.activeBook);
}
function activeBookName(){
  if(state.activeBook==='all')return'總帳本';
  return(state.books||[]).find(b=>b.id===state.activeBook)?.name||'帳本';
}
function activeBookIcon(){
  if(state.activeBook==='all')return'📚';
  return(state.books||[]).find(b=>b.id===state.activeBook)?.icon||'📒';
}
function saveAll(){
  save('budget_txs',state.txs);
  save('budget_accounts',state.accounts);
  save('budget_cats_exp',state.cats.expense);
  save('budget_cats_inc',state.cats.income);
  save('budget_ef',state.emergencyFund);
  save('budget_nickname',state.nickname);
  save('budget_books',state.books);
  save('budget_active_book',state.activeBook);
  save('budget_df',state.dreamFund);
  save('budget_hide_bal',state.accHideBalance);
  save('budget_loans',state.loans);
  save('budget_fixed',state.fixedExpenses);
  save('budget_insurances',state.insurances);
  save('budget_ins_members',state.insMembers);
  save('budget_acc_types',state.accTypes);
  save('budget_mode',state.budgetMode);
  (state.books||[]).filter(b=>b.type==='shared'&&b.roomCode).forEach(book=>{
    const txs=state.txs.filter(t=>t.bookId===book.id).map(({bookId:_bd,...t})=>t);
    _db.collection('rooms').doc(book.roomCode).set({
      bookName:book.name,txs,updatedBy:DEVICE_ID,updatedAt:firebase.firestore.FieldValue.serverTimestamp()
    }).catch(()=>{});
  });
}
