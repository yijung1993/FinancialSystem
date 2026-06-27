// ── HELPERS ────────────────────────────────────────────────────────────────
function escHtml(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function fmt(n){return Math.abs(n).toLocaleString('zh-TW')}
function fmtS(n){return(n>=0?'+':'-')+'$'+fmt(n)}
function getCat(type,id){
  return(type==='income'?state.cats.income:state.cats.expense).find(c=>c.id===id)||{name:id,icon:'📌',budget:0,subcats:[]};
}
function getSubCat(cat,subId){return cat.subcats?.find(s=>s.id===subId)||null}
function getAcc(id){return state.accounts.find(a=>a.id===id)||{name:'',icon:'💰',color:'#F0924A',init:0}}
function monthTxs(y,m){
  return state.txs.filter(t=>{const d=new Date(t.date);return d.getFullYear()===y&&d.getMonth()===m;});
}
function calcSum(txs){
  const ops=txs.filter(t=>t.type!=='transfer');
  const income=ops.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
  const expense=ops.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
  const nec=ops.filter(t=>t.necessity==='必要').reduce((s,t)=>s+t.amount,0);
  const want=ops.filter(t=>t.necessity==='想要').reduce((s,t)=>s+t.amount,0);
  return{income,expense,nec,want,balance:income-expense};
}
function accBalance(id){
  const acc=getAcc(id);
  return(acc.init||0)+state.txs.reduce((s,t)=>{
    if(t.type==='transfer'){
      if(t.fromAccountId===id)return s-t.amount;
      if(t.toAccountId===id)return s+t.amount;
      return s;
    }
    if(t.accountId!==id)return s;
    return t.type==='income'?s+t.amount:s-t.amount;
  },0);
}
function calcEFTarget(){
  const n=new Date();let total=0,cnt=0;
  for(let i=1;i<=3;i++){
    let y=n.getFullYear(),m=n.getMonth()-i;
    if(m<0){m+=12;y--;}
    const exp=monthTxs(y,m).filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
    if(exp>0){total+=exp;cnt++;}
  }
  return cnt>0?(total/cnt)*6:0;
}
function relDate(ds){
  const d=new Date(ds+'T00:00:00'),t=new Date();t.setHours(0,0,0,0);
  const diff=Math.round((t-d)/86400000);
  if(diff===0)return'今天';if(diff===1)return'昨天';
  const dd=new Date(ds+'T00:00:00');return`${dd.getMonth()+1}/${dd.getDate()}`;
}
function offsetDate(off){const d=new Date();d.setDate(d.getDate()+off);return d.toISOString().split('T')[0]}
function showToast(msg){
  const old=document.querySelector('.toast');if(old)old.remove();
  const el=document.createElement('div');el.className='toast';el.textContent=msg;
  document.body.appendChild(el);setTimeout(()=>el.remove(),2500);
}
