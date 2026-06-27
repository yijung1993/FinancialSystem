// ── ACTIONS ────────────────────────────────────────────────────────────────
function addTransfer(){
  const amt=parseFloat(state.form.amount);
  if(!amt||amt<=0){showToast('請輸入正確金額');return;}
  if(!state.form.fromAccountId||!state.form.toAccountId){showToast('請選擇帳戶');return;}
  if(state.form.fromAccountId===state.form.toAccountId){showToast('請選擇不同的帳戶');return;}
  state.txs.unshift({
    id:Date.now()+Math.random().toString(36).slice(2),
    date:state.form.date,type:'transfer',
    fromAccountId:state.form.fromAccountId,
    toAccountId:state.form.toAccountId,
    accountId:state.form.fromAccountId,
    amount:amt,note:state.form.note.trim(),
    necessity:null,category:'transfer',subCategory:null,
    bookId:state.form.bookId||(state.books||[]).find(b=>b.isDefault)?.id||'default',
  });
  saveAll();state.form=defaultForm();state.modal=null;showToast('轉帳已記錄 ✓');renderApp();
}
function addTx(){
  const amt=parseFloat(state.form.amount);
  if(!amt||amt<=0){showToast('請輸入正確金額');return;}
  const acc=getAcc(state.form.accountId);
  const n=acc.type==='credit'&&state.form.type==='expense'?(parseInt(state.form.installment)||0):0;
  if(n>=2){
    const per=Math.floor(amt/n);
    const baseDate=new Date(state.form.date+'T00:00:00');
    const baseNote=state.form.note.trim();
    for(let i=0;i<n;i++){
      const tm=baseDate.getMonth()+i;
      const yn=baseDate.getFullYear()+Math.floor(tm/12),mn=((tm%12)+12)%12;
      const maxD=new Date(yn,mn+1,0).getDate();
      const dd=Math.min(baseDate.getDate(),maxD);
      const ds=`${yn}-${String(mn+1).padStart(2,'0')}-${String(dd).padStart(2,'0')}`;
      const monthAmt=i===0?amt-per*(n-1):per;
      state.txs.unshift({
        id:`${Date.now()}-${i}-${Math.random().toString(36).slice(2)}`,
        date:ds,type:state.form.type,necessity:null,
        category:state.form.category,subCategory:state.form.subCategory||null,
        amount:monthAmt,
        note:baseNote?`${baseNote} · 分${n}期第${i+1}期`:`分${n}期第${i+1}期`,
        accountId:state.form.accountId,
        bookId:state.form.bookId||(state.books||[]).find(b=>b.isDefault)?.id||'default',
      });
    }
    saveAll();state.form=defaultForm();state.modal=null;showToast(`已拆為 ${n} 筆分期記錄 ✓`);renderApp();
  } else {
    state.txs.unshift({
      id:Date.now()+Math.random().toString(36).slice(2),
      date:state.form.date,type:state.form.type,necessity:null,
      category:state.form.category,subCategory:state.form.subCategory||null,
      amount:amt,note:state.form.note.trim(),accountId:state.form.accountId,
      bookId:state.form.bookId||(state.books||[]).find(b=>b.isDefault)?.id||'default',
    });
    saveAll();state.form=defaultForm();state.modal=null;showToast('已儲存 ✓');renderApp();
  }
}
function updateTx(){
  const f=state.editForm;
  const amt=parseFloat(f.amount);
  if(!amt||amt<=0){showToast('請輸入正確金額');return;}
  const idx=state.txs.findIndex(t=>t.id===f.id);
  if(idx<0)return;
  state.txs[idx]={...state.txs[idx],
    date:f.date,type:f.type,category:f.category,
    subCategory:f.subCategory||null,amount:amt,
    note:(f.note||'').trim(),accountId:f.accountId,
    necessity:f.necessity||null,
  };
  saveAll();state.modal=null;showToast('已更新 ✓');renderApp();
}
function getInstallmentInfo(tx){
  const m=(tx.note||'').match(/^(.*?)(?:\s*·\s*)?分(\d+)期第\d+期$/);
  if(!m)return null;
  return{baseNote:m[1].trim(),total:parseInt(m[2])};
}
function findRelatedInstallments(tx){
  const info=getInstallmentInfo(tx);if(!info)return null;
  const related=state.txs.filter(t=>{
    const ti=getInstallmentInfo(t);if(!ti)return false;
    return ti.baseNote===info.baseNote&&ti.total===info.total&&t.accountId===tx.accountId&&t.category===tx.category&&t.type===tx.type;
  });
  return related.length>1?related:null;
}
function deleteTx(id){
  const tx=state.txs.find(t=>t.id===id);if(!tx)return;
  const related=findRelatedInstallments(tx);
  if(related){
    if(!confirm(`此筆為分期消費，刪除後將一併刪除全部 ${related.length} 期記錄，確定刪除？`))return;
    const ids=new Set(related.map(t=>t.id));
    state.txs=state.txs.filter(t=>!ids.has(t.id));
  }else{
    if(!confirm('確定刪除這筆記錄？'))return;
    state.txs=state.txs.filter(t=>t.id!==id);
  }
  saveAll();state.modal=null;renderApp();
}
function setNecessity(txId,val){
  const tx=state.txs.find(t=>t.id===txId);
  if(!tx)return;
  tx.necessity=val||null;
  saveAll();
  // 更新 nec-mini 按鈕 class
  document.querySelectorAll(`[data-a="setNec"][data-id="${txId}"]`).forEach(b=>{
    b.classList.remove('an','aw','au');
    if(b.dataset.v==='必要'&&val==='必要')b.classList.add('an');
    else if(b.dataset.v==='想要'&&val==='想要')b.classList.add('aw');
    else if(!b.dataset.v&&!val)b.classList.add('au');
  });
  // 更新 tx-item 裡的 nec-tag
  const mini=document.querySelector(`[data-a="setNec"][data-id="${txId}"]`)?.closest('.nec-mini');
  const txMeta=mini?.previousElementSibling?.querySelector('.tx-meta');
  if(txMeta){
    const old=txMeta.querySelector('.nec-tag');
    if(val){
      const html=`<span class="nec-tag ${val==='必要'?'n':'w'}">${val}</span>`;
      old?old.outerHTML=html:txMeta.insertAdjacentHTML('beforeend',html);
    }else{old?.remove();}
  }
}
function saveAccount(){
  const f=state.editForm;
  if(!f.name?.trim()){showToast('請輸入帳戶名稱');return;}
  const obj={...f,init:parseFloat(f.init)||0,creditLimit:parseFloat(f.creditLimit)||0,
    billingDay:parseInt(f.billingDay)||0,paymentDay:parseInt(f.paymentDay)||0};
  if(f.id){const i=state.accounts.findIndex(a=>a.id===f.id);if(i>=0)state.accounts[i]=obj;}
  else state.accounts.push({...obj,id:'acc_'+Date.now()});
  saveAll();state.modal=null;renderApp();
}
function deleteAccount(id){
  if(state.txs.some(t=>t.accountId===id||t.fromAccountId===id||t.toAccountId===id)){showToast('此帳戶有記錄，無法刪除');return;}
  if(!confirm('確定刪除此帳戶？'))return;
  state.accounts=state.accounts.filter(a=>a.id!==id);
  saveAll();renderApp();
}
function saveCat(){
  const f=state.editForm;
  if(!f.name?.trim()){showToast('請輸入類別名稱');return;}
  const type=f.catType||'expense';
  const obj={id:f.id||'cat_'+Date.now(),name:f.name,icon:f.icon||'🏷️',
    budget:parseFloat(f.budget)||0,subcats:f.subcats||[]};
  if(f.id){const i=state.cats[type].findIndex(c=>c.id===f.id);if(i>=0)state.cats[type][i]=obj;}
  else state.cats[type].push(obj);
  saveAll();state.modal=null;renderApp();
}
function deleteCat(type,id){
  if(state.txs.some(t=>t.category===id)){showToast('此類別有記錄，無法刪除');return;}
  if(!confirm('確定刪除此類別？'))return;
  state.cats[type]=state.cats[type].filter(c=>c.id!==id);
  saveAll();renderApp();
}

function saveLoan(){
  const f=state.editForm;
  if(!f.loanName?.trim()){showToast('請輸入貸款名稱');return;}
  const yrs=parseFloat(f.loanYears)||0;
  if(f.loanYears&&yrs<=0){showToast('貸款年限需大於 0');return;}
  const obj={id:f.loanId||'loan_'+Date.now(),name:f.loanName,icon:f.loanIcon||'🏠',
    totalAmount:parseFloat(f.loanTotal)||0,remainingAmount:parseFloat(f.loanRemaining)||0,
    monthlyPayment:parseFloat(f.loanMonthly)||0,rate:parseFloat(f.loanRate)||0,
    years:yrs,startDate:f.loanStart||todayStr(),color:f.loanColor||ACC_COLORS[0]};
  if(f.loanId){const i=state.loans.findIndex(l=>l.id===f.loanId);if(i>=0)state.loans[i]=obj;}
  else state.loans.push(obj);
  saveAll();state.modal=null;showToast('已儲存 ✓');renderApp();
}
function deleteLoan(id){
  if(!confirm('確定刪除此貸款記錄？'))return;
  state.loans=state.loans.filter(l=>l.id!==id);
  saveAll();renderApp();
}
function saveFixed(){
  const f=state.editForm;
  if(!f.fixedName?.trim()){showToast('請輸入名稱');return;}
  const obj={id:f.fixedId||'fixed_'+Date.now(),name:f.fixedName,icon:f.fixedIcon||'📋',
    amount:parseFloat(f.fixedAmount)||0,frequency:f.fixedFreq||'monthly',
    accountId:f.fixedAccountId||'',nextDate:f.fixedNext||todayStr(),
    color:f.fixedColor||ACC_COLORS[2],catId:f.fixedCatId||'other_e',
    active:f.fixedActive!==false,
    bookId:f.fixedBookId||''};
  if(f.fixedId){const i=state.fixedExpenses.findIndex(x=>x.id===f.fixedId);if(i>=0)state.fixedExpenses[i]=obj;}
  else state.fixedExpenses.push(obj);
  saveAll();state.modal=null;showToast('已儲存 ✓');renderApp();
}
// ── BACKUP / RESTORE ───────────────────────────────────────────────────────
const BACKUP_KEYS=['budget_txs','budget_accounts','budget_cats_exp','budget_cats_inc',
  'budget_ef','budget_nickname','budget_books','budget_active_book','budget_df',
  'budget_hide_bal','budget_loans','budget_fixed','budget_insurances',
  'budget_ins_members','budget_acc_types','budget_mode'];
function bufToB64(buf){
  const u8=new Uint8Array(buf);let s='';
  for(let i=0;i<u8.length;i+=8192)s+=String.fromCharCode(...u8.subarray(i,i+8192));
  return btoa(s);
}
function b64ToBuf(b64){
  const s=atob(b64);const u8=new Uint8Array(s.length);
  for(let i=0;i<s.length;i++)u8[i]=s.charCodeAt(i);
  return u8;
}
async function exportFullBackup(){
  try{
    const ls={};
    BACKUP_KEYS.forEach(k=>{const v=localStorage.getItem(k);if(v!=null)try{ls[k]=JSON.parse(v);}catch{ls[k]=v;}});
    const recs=await idbAll();
    const attachments=recs.map(r=>({id:r.id,name:r.name,data:r.data?bufToB64(r.data):''}));
    const json=JSON.stringify({version:1,exportedAt:new Date().toISOString(),localStorage:ls,attachments});
    const blob=new Blob([json],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=`記帳本備份_${todayStr()}.json`;
    document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
    showToast('備份已匯出 ✓');
  }catch(e){showToast('匯出失敗：'+e.message);}
}
async function importFullBackup(file){
  if(!file)return;
  if(!confirm('還原備份將覆蓋目前所有資料，確定繼續？'))return;
  try{
    const text=await file.text();
    const data=JSON.parse(text);
    if(!data.localStorage)throw new Error('不是有效的備份檔');
    Object.entries(data.localStorage).forEach(([k,v])=>localStorage.setItem(k,JSON.stringify(v)));
    await idbClear();
    if(data.attachments?.length){
      const db=await openIDB();
      await new Promise((res,rej)=>{
        const tx=db.transaction('pdfs','readwrite');const store=tx.objectStore('pdfs');
        data.attachments.forEach(a=>{if(a.data)store.put({id:a.id,data:b64ToBuf(a.data),name:a.name});});
        tx.oncomplete=res;tx.onerror=()=>rej(tx.error);
      });
    }
    showToast('備份已還原，重新載入中...');
    setTimeout(()=>location.reload(),1200);
  }catch(e){showToast('還原失敗：'+e.message);}
}
function processFixedExpenses(){
  const today=todayStr();let created=0;
  state.fixedExpenses.forEach(f=>{
    if(f.active===false||!f.nextDate)return;
    let iter=0;
    while(f.nextDate<=today&&iter<36){
      iter++;
      if(!state.txs.some(t=>t.fixedId===f.id&&t.date===f.nextDate)){
        state.txs.unshift({
          id:'fx_'+f.id+'_'+f.nextDate.replace(/-/g,''),
          date:f.nextDate,type:'expense',necessity:null,
          category:f.catId||'other_e',subCategory:null,
          amount:f.amount,note:f.name,
          accountId:f.accountId||state.accounts[0]?.id||'',
          fixedId:f.id,
          bookId:f.bookId||(state.books||[]).find(b=>b.isDefault)?.id||'default',
        });
        created++;
      }
      const d=new Date(f.nextDate+'T00:00:00');
      if(f.frequency==='monthly')d.setMonth(d.getMonth()+1);
      else if(f.frequency==='quarterly')d.setMonth(d.getMonth()+3);
      else d.setFullYear(d.getFullYear()+1);
      f.nextDate=d.toISOString().split('T')[0];
    }
  });
  if(created>0){saveAll();}
  return created;
}
function deleteFixed(id){
  if(!confirm('確定刪除此固定費用？'))return;
  state.fixedExpenses=state.fixedExpenses.filter(x=>x.id!==id);
  saveAll();renderApp();
}

// ── INSURANCE HELPERS ─────────────────────────────────────────────────────
function insStatus(ins){
  if(ins.suspended)return{label:'已停效',cls:'expired'};
  const now=new Date();now.setHours(0,0,0,0);
  if(ins.endDate){const e=new Date(ins.endDate+'T00:00:00');if(e<now)return{label:'已到期',cls:'expired'};const d=Math.round((e-now)/86400000);if(d<=30)return{label:`${d}天後到期`,cls:'expiring'};}
  if(ins.renewalDate){const r=new Date(ins.renewalDate+'T00:00:00');const d=Math.round((r-now)/86400000);if(d>=0&&d<=30)return{label:`${d}天後繳費`,cls:'expiring'};}
  if(ins.startDate&&new Date(ins.startDate+'T00:00:00')>now)return{label:'未生效',cls:'expiring'};
  return{label:'生效中',cls:'active'};
}
function insYearlyPremium(ins){
  const m={yearly:1,semi:2,quarterly:4,monthly:12};
  return(ins.premium||0)*(m[ins.premFreq||'yearly']||1);
}
function extractPersonName(s){
  if(!s)return null;
  return s.replace(/[（(][^）)]*[）)]/g,'').trim().split(/[\/\、,，]/)[0].trim()||null;
}
function insAllPersons(){
  const seen=new Set();
  state.insurances.forEach(ins=>{
    const n=extractPersonName(ins.insured);
    if(n)seen.add(n);
  });
  return[...seen];
}
function insAlerts(){
  return state.insurances.filter(ins=>insStatus(ins).cls==='expiring');
}

// ── XLSX HELPERS ──────────────────────────────────────────────────────────
async function extractXlsxText(buf){
  const XL=await loadSheetJs();
  const wb=XL.read(new Uint8Array(buf),{type:'array',cellDates:true});
  const parts=[];
  wb.SheetNames.forEach(name=>{
    const ws=wb.Sheets[name];
    const rows=XL.utils.sheet_to_json(ws,{header:1,defval:''});
    rows.forEach(row=>row.forEach(cell=>{if(cell!==''&&cell!==null&&cell!==undefined)parts.push(String(cell));}));
  });
  return parts.join('\n');
}
function loadSheetJs(){
  return new Promise(res=>{
    if(window.XLSX){res(window.XLSX);return;}
    const s=document.createElement('script');
    s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    s.onload=()=>res(window.XLSX);
    document.head.appendChild(s);
  });
}
function xlsxColMap(h){
  h=String(h).trim();
  if(/公司名稱|公司|承保/.test(h))return'company';
  if(/商品名稱/.test(h))return'name';
  if(/保單號碼|保單號|編號|契約號/.test(h))return'policyNo';
  if(/主.附約/.test(h))return'riderType';
  if(/險種分類|險種類別/.test(h))return'type';
  if(/險種名稱/.test(h))return'insTypeName';
  if(/電子.紙本/.test(h))return null;
  if(/關係人|被保|要保/.test(h))return'insured';
  if(/保險金額/.test(h))return'coverageAmt';
  if(/契約生效|生效日|起保|起始/.test(h))return'startDate';
  if(/繳費年期|繳費期/.test(h))return'premYears';
  if(/保費繳別|繳別|繳費方式/.test(h))return'premFreq';
  if(/狀態/.test(h))return'policyStatus';
  if(/到期|終止|屆滿|期滿/.test(h))return'endDate';
  if(/繳費日|下次|續期/.test(h))return'renewalDate';
  if(/保障|保額|說明|備註|摘要/.test(h))return'coverage';
  return null;
}
function xlsxTypeMap(v){
  v=String(v);
  if(/壽/.test(v))return'壽險';
  if(/醫療|健康|住院/.test(v))return'醫療險';
  if(/意外|傷害/.test(v))return'意外險';
  if(/車/.test(v))return'車險';
  if(/產/.test(v))return'產險';
  if(/投資|儲蓄|年金|利率/.test(v))return'壽險';
  return'其他';
}
function xlsxFreqMap(v){
  v=String(v);
  if(/半年/.test(v))return'semi';
  if(/季/.test(v))return'quarterly';
  if(/月/.test(v))return'monthly';
  return'yearly';
}
function xlsxNum(v){if(typeof v==='number')return v;return parseFloat(String(v).replace(/[,，$NT\s元]/g,''))||0;}
function xlsxDate(v){
  if(!v&&v!==0)return'';
  if(v instanceof Date)return v.toISOString().split('T')[0];
  const s=String(v).trim();
  const roc=s.match(/^(\d{2,3})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if(roc){const yr=parseInt(roc[1])<500?parseInt(roc[1])+1911:parseInt(roc[1]);return`${yr}-${roc[2].padStart(2,'0')}-${roc[3].padStart(2,'0')}`;}
  const iso=s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if(iso)return`${iso[1]}-${iso[2].padStart(2,'0')}-${iso[3].padStart(2,'0')}`;
  return'';
}
function importInsDetailFormat(rows,headers){
  const ci=name=>headers.findIndex(h=>new RegExp(name).test(h));
  const iCo=ci('公司'),iRi=ci('主.附'),iNa=ci('商品名稱'),iSt=ci('狀態');
  const iIn=ci('被保|要保'),iDt=ci('契約生效'),iLb=ci('理賠.給付項目'),iAm=ci('理賠金額');
  let curCo='',curIns=null;
  const policies=[];
  for(let i=1;i<rows.length;i++){
    const r=rows[i];
    if(iCo>=0&&r[iCo])curCo=String(r[iCo]).trim();
    const name=iNa>=0&&r[iNa]?String(r[iNa]).trim():'';
    if(name){
      if(curIns)policies.push(curIns);
      const status=iSt>=0?String(r[iSt]||'').trim():'';
      curIns={
        id:'ins_'+(Date.now()+i)+'_'+Math.random().toString(36).slice(2,6),
        company:curCo,
        riderType:iRi>=0?String(r[iRi]||'').trim():'',
        name,policyStatus:status,
        insured:iIn>=0?String(r[iIn]||'').trim():'',
        startDate:iDt>=0?xlsxDate(r[iDt]):'',
        type:xlsxTypeMap(name),premFreq:'yearly',premium:0,
        policyNo:'',endDate:'',renewalDate:'',coverage:'',pdfId:null,pdfName:'',
        coverageItems:[],suspended:status&&!/生效|有效/.test(status)
      };
    }
    const label=iLb>=0&&r[iLb]?String(r[iLb]).trim():'';
    if(label&&curIns){
      curIns.coverageItems.push({
        label,
        amount:iAm>=0&&r[iAm]?String(r[iAm]).trim():'',
      });
    }
  }
  if(curIns)policies.push(curIns);
  const count=policies.length;
  if(count>0){state.insurances.push(...policies);save('budget_insurances',state.insurances);showToast(`成功匯入 ${count} 筆保單 ✓`);renderApp();}
  else showToast('未找到有效的保單資料');
  return count;
}
async function importInsFromXlsx(buf){
  const XL=await loadSheetJs();
  const wb=XL.read(new Uint8Array(buf),{type:'array',cellDates:true});
  const ws=wb.Sheets[wb.SheetNames[0]];
  const rows=XL.utils.sheet_to_json(ws,{header:1,defval:''});
  if(rows.length<2){showToast('檔案中沒有找到資料');return 0;}
  const headers=rows[0].map(h=>String(h).trim());
  if(headers.some(h=>/理賠.給付項目/.test(h)))return importInsDetailFormat(rows,headers);
  const colMap=headers.map(h=>xlsxColMap(h));
  let count=0;
  for(let i=1;i<rows.length;i++){
    const row=rows[i];
    if(row.every(v=>!v&&v!==0))continue;
    const ins={id:'ins_'+Date.now()+'_'+i,type:'其他',premFreq:'yearly',premium:0,
      name:'',company:'',policyNo:'',insured:'',startDate:'',endDate:'',renewalDate:'',coverage:'',pdfId:null,pdfName:''};
    colMap.forEach((field,j)=>{
      if(!field||j>=row.length)return;
      const val=row[j];
      if(val===''||val===null||val===undefined)return;
      if(field==='type')ins.type=xlsxTypeMap(val);
      else if(field==='premFreq')ins.premFreq=xlsxFreqMap(val);
      else if(field==='premium')ins.premium=xlsxNum(val);
      else if(field==='startDate'||field==='endDate'||field==='renewalDate')ins[field]=xlsxDate(val);
      else ins[field]=String(val).trim();
    });
    // 組合保障摘要
    const coverageParts=[];
    if(ins.coverageAmt)coverageParts.push(`保額 $${Number(ins.coverageAmt).toLocaleString('zh-TW')}`);
    if(ins.insTypeName)coverageParts.push(ins.insTypeName);
    if(ins.riderType)coverageParts.push(ins.riderType);
    if(ins.premYears)coverageParts.push(`繳費期 ${ins.premYears}`);
    if(coverageParts.length&&!ins.coverage)ins.coverage=coverageParts.join('・');
    // 停效狀態
    if(ins.policyStatus&&!/生效|有效/.test(String(ins.policyStatus)))ins.suspended=true;
    if(!ins.name)ins.name=(ins.company?ins.company+' ':'')+ins.type;
    state.insurances.push(ins);count++;
  }
  if(count>0){save('budget_insurances',state.insurances);showToast(`成功匯入 ${count} 筆保單 ✓`);renderApp();}
  else showToast('未找到有效的保單資料，請確認欄位名稱');
  return count;
}
function parseInsText(text){
  const r={};
  const pno=text.match(/保單號碼[：:﹕]\s*([A-Z0-9\-]{4,20})/)||text.match(/契約編號[：:﹕]\s*([A-Z0-9\-]{4,20})/)||text.match(/保單號[：:]\s*([A-Z0-9\-]{4,20})/);
  if(pno)r.policyNo=pno[1].trim();
  const cos=['國泰人壽','富邦人壽','南山人壽','新光人壽','台灣人壽','中國人壽','遠雄人壽','第一金人壽','三商美邦','全球人壽','安聯人壽','保誠人壽','宏泰人壽','元大人壽','台銀人壽','凱基人壽','富邦產險','國泰產險','新光產險','明台產險'];
  for(const c of cos){if(text.includes(c)){r.company=c;break;}}
  if(!r.company){const m=text.match(/([^\s]{2,6}(?:人壽|產險|保險))/);if(m)r.company=m[1];}
  const prem=text.match(/年繳保費[：:\s]*[NT$]*\s*([\d,，]+)/)||text.match(/每年保費[：:\s]*[NT$]*\s*([\d,，]+)/)||text.match(/保費[：:\s]*[NT$]*\s*([\d,，]+)/);
  if(prem){const v=parseInt(prem[1].replace(/[,，]/g,''));if(v>100)r.premium=v;}
  const dates=[];
  [...text.matchAll(/(\d{2,3})年\s*(\d{1,2})月\s*(\d{1,2})日/g)].slice(0,8).forEach(m=>{
    const roc=parseInt(m[1]),mo=String(m[2]).padStart(2,'0'),dd=String(m[3]).padStart(2,'0');
    const yr=roc<500?roc+1911:roc;
    if(yr>=2000&&yr<=2060)dates.push(`${yr}-${mo}-${dd}`);
  });
  if(dates.length>=1)r.startDate=dates[0];
  if(dates.length>=2)r.endDate=dates[dates.length-1];
  return r;
}

const MEM_ICONS=['👤','👨','👩','👦','👧','👴','👵','👶','🧑','👱'];
function saveMember(){
  const f=state.editForm;
  const name=(f.memName||'').trim();
  if(!name){showToast('請輸入姓名');return;}
  const obj={id:f.memId||'mem_'+Date.now(),name,icon:f.memIcon||'👤'};
  if(f.memId){const i=state.insMembers.findIndex(m=>m.id===f.memId);if(i>=0)state.insMembers[i]=obj;}
  else state.insMembers.push(obj);
  save('budget_ins_members',state.insMembers);
  state.modal=null;showToast('已儲存 ✓');renderApp();
}
function deleteMember(id){
  const mem=state.insMembers.find(m=>m.id===id);if(!mem)return;
  const related=state.insurances.filter(i=>extractPersonName(i.insured)===mem.name);
  if(related.length){
    if(!confirm(`「${mem.name}」名下有 ${related.length} 筆保單資料。\n刪除成員將連同保單資料一併刪除，確定嗎？`))return;
    related.forEach(i=>{if(i.pdfId)idbDel(i.pdfId).catch(()=>{});});
    state.insurances=state.insurances.filter(i=>extractPersonName(i.insured)!==mem.name);
    save('budget_insurances',state.insurances);
  }else{
    if(!confirm('確定刪除此成員？'))return;
  }
  state.insMembers=state.insMembers.filter(m=>m.id!==id);
  save('budget_ins_members',state.insMembers);
  state.modal=null;renderApp();
}
function saveIns(){
  const f=state.editForm;
  const obj={
    id:f.id||'ins_'+Date.now(),
    name:(f.insName||'').trim()||(f.insCompany||'保單'),
    company:(f.insCompany||'').trim(),type:f.insType||'壽險',
    policyNo:(f.insPolicyNo||'').trim(),insured:(f.insInsured||'').trim(),
    premium:parseFloat(f.insPremium)||0,premFreq:f.premFreq||'yearly',
    startDate:f.insStart||'',endDate:f.insEnd||'',renewalDate:f.insRenewal||'',
    coverage:'',coverageItems:(f.insCoverageItems||[]).filter(i=>i.label),
    pdfId:f.pdfId||null,pdfName:f.pdfName||'',
  };
  const finish=(pdfId,pdfName)=>{
    if(pdfId)obj.pdfId=pdfId;if(pdfName)obj.pdfName=pdfName;
    if(f.id){const i=state.insurances.findIndex(x=>x.id===f.id);if(i>=0)state.insurances[i]=obj;}
    else state.insurances.push(obj);
    save('budget_insurances',state.insurances);
    state.modal=null;showToast('保單已儲存 ✓');renderApp();
  };
  if(f._pdfData){
    const pid=f.pdfId||'pdf_'+Date.now();
    idbPut(pid,f._pdfData,f._pdfName||'保單.pdf').then(()=>finish(pid,f._pdfName||'保單.pdf')).catch(()=>finish(null,null));
  }else{finish(null,null);}
}
function collectCovItems(){
  const items=[];let j=0;
  while(document.getElementById('cov-label-'+j)){
    items.push({label:(document.getElementById('cov-label-'+j).value||'').trim(),amount:(document.getElementById('cov-amount-'+j).value||'').trim()});
    j++;
  }
  return items;
}
function deleteIns(id){
  if(!confirm('確定刪除此保單記錄？'))return;
  const ins=state.insurances.find(i=>i.id===id);
  if(ins?.pdfId)idbDel(ins.pdfId).catch(()=>{});
  state.insurances=state.insurances.filter(i=>i.id!==id);
  save('budget_insurances',state.insurances);renderApp();
}
