// ── EVENTS ────────────────────────────────────────────────────────────────
function attachInputs(){
  const bind=(id,fn)=>{const el=document.getElementById(id);if(el)el.addEventListener('input',e=>fn(e.target.value));};
  bind('amt',v=>{state.form.amount=v});
  bind('fdate',v=>{state.form.date=v});
  bind('fnote',v=>{state.form.note=v});
  bind('ef-amt',v=>{state.editForm.amount=v});
  bind('ef-date',v=>{state.editForm.date=v});
  bind('ef-note',v=>{state.editForm.note=v});
  bind('ef-name',v=>{state.editForm.name=v});
  bind('ef-icon',v=>{state.editForm.icon=v});
  bind('ef-init',v=>{state.editForm.init=v});
  bind('ef-budget',v=>{state.editForm.budget=v});
  bind('ef-target',v=>{state.editForm.targetAmount=v});
  bind('ef-creditlimit',v=>{state.editForm.creditLimit=v});
  bind('df-wish',v=>{state.editForm.wish=v});
  bind('df-target',v=>{state.editForm.target=v});
  bind('ef-subname',v=>{state.editForm.newSubName=v});
  const statsSel=document.getElementById('stats-month-sel');
  if(statsSel)statsSel.addEventListener('change',e=>{
    const[sy,sm]=e.target.value.split('-').map(Number);state.statsMonth={y:sy,m:sm};renderApp();});
  const statsYearSel=document.getElementById('stats-year-sel');
  if(statsYearSel)statsYearSel.addEventListener('change',e=>{state.statsYear={y:parseInt(e.target.value)};renderApp();});
  const nickInline=document.getElementById('nick-inline');
  if(nickInline)nickInline.addEventListener('blur',e=>{
    const v=(e.target.value||'').trim();if(v!==state.nickname){state.nickname=v;save('budget_nickname',v);}});
  bind('ef-subicon',v=>{state.editForm.newSubIcon=v});
  bind('ef-editsubname',v=>{state.editForm.editSubName=v});
  bind('ef-editsubicon',v=>{state.editForm.editSubIcon=v});
  const insImportInput=document.getElementById('ins-import-input');
  if(insImportInput){
    insImportInput.addEventListener('change',async e=>{
      const file=e.target.files[0];if(!file)return;
      showToast('正在解析 Excel...');
      const buf=await file.arrayBuffer();
      await importInsFromXlsx(buf);
      insImportInput.value='';
    });
  }
  const insPdfInput=document.getElementById('ins-pdf-input');
  if(insPdfInput){
    insPdfInput.addEventListener('change',async e=>{
      const file=e.target.files[0];if(!file)return;
      showToast('正在解析 PDF...');
      const buf=await file.arrayBuffer();
      state.editForm._pdfData=buf;
      state.editForm._pdfName=file.name;
      try{
        const text=await extractXlsxText(buf.slice(0));
        const parsed=parseInsText(text);
        if(parsed.policyNo&&!state.editForm.insPolicyNo)state.editForm.insPolicyNo=parsed.policyNo;
        if(parsed.company&&!state.editForm.insCompany)state.editForm.insCompany=parsed.company;
        if(parsed.premium&&!state.editForm.insPremium)state.editForm.insPremium=String(parsed.premium);
        if(parsed.startDate&&!state.editForm.insStart)state.editForm.insStart=parsed.startDate;
        if(parsed.endDate&&!state.editForm.insEnd)state.editForm.insEnd=parsed.endDate;
        renderModalOnly();showToast('Excel 解析完成，請確認資料 ✓');
      }catch{renderModalOnly();showToast('檔案已上傳（無法自動解析）');}
    });
  }
  const backupInput=document.getElementById('backup-import-input');
  if(backupInput){
    backupInput.addEventListener('change',async e=>{
      const file=e.target.files[0];if(!file)return;
      await importFullBackup(file);
      backupInput.value='';
    });
  }
  if(state.view==='insurance')initInsDragSort();
}
function initInsDragSort(){
  const cards=document.querySelectorAll('.ins-card-sm[data-ins-id]:not([data-drag-init])');
  if(!cards.length)return;
  let dragId=null,ghost=null;
  const moveItem=(fromId,toId)=>{
    const fi=state.insurances.findIndex(i=>i.id===fromId);
    const ti=state.insurances.findIndex(i=>i.id===toId);
    if(fi<0||ti<0||fi===ti)return;
    const[item]=state.insurances.splice(fi,1);
    state.insurances.splice(ti,0,item);
    save('budget_insurances',state.insurances);
    renderApp();
  };
  const clearOver=()=>document.querySelectorAll('.ins-card-sm').forEach(c=>c.classList.remove('ins-drag-over'));
  cards.forEach(card=>{
    card.dataset.dragInit='1';
    // 桌面拖曳
    card.setAttribute('draggable','true');
    card.addEventListener('dragstart',e=>{
      dragId=card.dataset.insId;e.dataTransfer.effectAllowed='move';
      requestAnimationFrame(()=>card.classList.add('ins-dragging'));
    });
    card.addEventListener('dragend',()=>{dragId=null;clearOver();card.classList.remove('ins-dragging');});
    card.addEventListener('dragover',e=>e.preventDefault());
    card.addEventListener('dragenter',e=>{e.preventDefault();clearOver();if(card.dataset.insId!==dragId)card.classList.add('ins-drag-over');});
    card.addEventListener('drop',e=>{e.preventDefault();const to=card.dataset.insId;clearOver();if(dragId&&dragId!==to)moveItem(dragId,to);});
    // 觸控拖曳（手機）
    const handle=card.querySelector('.ins-drag-handle');
    if(!handle)return;
    handle.addEventListener('touchstart',e=>{
      e.preventDefault();
      dragId=card.dataset.insId;
      const r=card.getBoundingClientRect();
      ghost=card.cloneNode(true);
      Object.assign(ghost.style,{position:'fixed',left:r.left+'px',top:r.top+'px',width:r.width+'px',
        zIndex:'9999',opacity:'0.88',pointerEvents:'none',boxShadow:'0 8px 28px rgba(0,0,0,.22)',transform:'scale(1.03)'});
      document.body.appendChild(ghost);card.style.opacity='0.3';
    },{passive:false});
    handle.addEventListener('touchmove',e=>{
      e.preventDefault();if(!ghost)return;
      const t=e.touches[0],gh=ghost.getBoundingClientRect();
      ghost.style.top=(t.clientY-gh.height/2)+'px';ghost.style.left=(t.clientX-gh.width/2)+'px';
      clearOver();ghost.style.visibility='hidden';
      const el=document.elementFromPoint(t.clientX,t.clientY);ghost.style.visibility='';
      const tc=el?.closest('.ins-card-sm[data-ins-id]');
      if(tc&&tc.dataset.insId!==dragId)tc.classList.add('ins-drag-over');
    },{passive:false});
    handle.addEventListener('touchend',e=>{
      if(!ghost){dragId=null;return;}
      const t=e.changedTouches[0];ghost.style.visibility='hidden';
      const el=document.elementFromPoint(t.clientX,t.clientY);
      ghost.remove();ghost=null;
      clearOver();document.querySelectorAll('.ins-card-sm').forEach(c=>c.style.opacity='');
      const tc=el?.closest('.ins-card-sm[data-ins-id]');
      const fid=dragId;dragId=null;
      if(tc&&tc.dataset.insId!==fid)moveItem(fid,tc.dataset.insId);
    });
  });
}
function bindOverlay(){
  const ov=document.getElementById('modal-overlay');
  if(ov)ov.addEventListener('click',e=>{if(e.target===ov){state.modal=null;renderApp();}});
}

document.addEventListener('click',e=>{
  const navEl=e.target.closest('[data-nav]');
  if(navEl){const nv=navEl.dataset.nav;if(nv==='settings')state.settingsTab='main';state.view=nv;state.modal=null;renderApp();return;}
  const el=e.target.closest('[data-a]');if(!el)return;
  const a=el.dataset.a,v=el.dataset.v;
  switch(a){
    case'type':
      if(v==='transfer'){
        state.form={...state.form,type:'transfer',
          fromAccountId:state.form.accountId||state.accounts[0]?.id||'',
          toAccountId:state.accounts.find(a=>a.id!==(state.form.accountId||state.accounts[0]?.id))?.id||state.accounts[0]?.id||''
        };
      }else{
        state.form.type=v;state.form.category=(v==='income'?state.cats.income:state.cats.expense)[0]?.id||'';
        state.form.subCategory='';if(v==='income')state.form.installment=0;
      }
      renderModalOnly();break;
    case'setFromAcc':state.form.fromAccountId=v;dmActive('[data-a="setFromAcc"]',v);break;
    case'setToAcc':state.form.toAccountId=v;dmActive('[data-a="setToAcc"]',v);break;
    case'cat':state.form.category=v;state.form.subCategory='';renderModalOnly();break;
    case'subcat':state.form.subCategory=v;dmSel('[data-a="subcat"]',v,'as');break;
    case'setAcc':{const na=state.accounts.find(a=>a.id===v);
      const wasCredit=state.accounts.find(a=>a.id===state.form.accountId)?.type==='credit';
      state.form.accountId=v;if(na?.type!=='credit')state.form.installment=0;
      if(wasCredit||na?.type==='credit'){renderModalOnly();}
      else{dmActive('[data-a="setAcc"]',v);}break;}
    case'save':{
      ['amt','fdate','fnote'].forEach(id=>{const el=document.getElementById(id);if(el){
        if(id==='amt')state.form.amount=el.value;
        else if(id==='fdate')state.form.date=el.value;
        else state.form.note=el.value;
      }});if(state.form.type==='transfer')addTransfer();else addTx();break;}
    case'del':deleteTx(el.dataset.id);break;
    case'setNec':setNecessity(el.dataset.id,v);break;
    case'openEditTx':{
      const tx=state.txs.find(t=>t.id===v);
      if(tx)state.editForm={...tx,amount:String(tx.amount),subCategory:tx.subCategory||''};
      state.modal={type:'editTx'};renderApp();break;}
    case'ef-type':state.editForm={...state.editForm,type:v,subCategory:''};renderModalOnly();break;
    case'ef-nec':
      state.editForm.necessity=v||null;
      document.querySelectorAll('[data-a="ef-nec"]').forEach(b=>{
        b.classList.toggle('an',b.dataset.v==='必要'&&v==='必要');
        b.classList.toggle('aw',b.dataset.v==='想要'&&v==='想要');
        b.classList.toggle('au',!b.dataset.v&&!v);
      });break;
    case'ef-cat':state.editForm={...state.editForm,category:v,subCategory:''};renderModalOnly();break;
    case'ef-subcat':state.editForm.subCategory=v;dmSel('[data-a="ef-subcat"]',v,'as');break;
    case'ef-acc':state.editForm.accountId=v;dmActive('[data-a="ef-acc"]',v);break;
    case'updateTx':{
      ['ef-amt','ef-date','ef-note'].forEach(id=>{const el=document.getElementById(id);if(el){
        if(id==='ef-amt')state.editForm.amount=el.value;
        else if(id==='ef-date')state.editForm.date=el.value;
        else state.editForm.note=el.value;
      }});updateTx();break;}
    case'closeModal':state.modal=null;renderApp();break;
    case'cprev':
      if(state.calMonth.m===0){state.calMonth.y--;state.calMonth.m=11;}else state.calMonth.m--;
      renderApp();break;
    case'cnext':
      if(state.calMonth.m===11){state.calMonth.y++;state.calMonth.m=0;}else state.calMonth.m++;
      renderApp();break;
    case'sprev':
      if(state.statsMonth.m===0){state.statsMonth.y--;state.statsMonth.m=11;}else state.statsMonth.m--;
      renderApp();break;
    case'snext':
      if(state.statsMonth.m===11){state.statsMonth.y++;state.statsMonth.m=0;}else state.statsMonth.m++;
      renderApp();break;
    case'openDay':state.modal={type:'day',data:v};renderApp();break;
    case'openSum':state.modal={type:'sum',data:{...state.statsMonth}};renderApp();break;
    case'filt':state.histFilter=v;renderApp();break;
    case'histPeriod':state.histPeriod=v;renderApp();break;
    case'toggleEmojiPicker':{
      const g=document.getElementById('emoji-picker-grid');
      if(g){if(g.style.display==='none'){g.style.display='flex';g.dataset.field=el.dataset.field||'icon';}
        else g.style.display='none';}
      break;}
    case'pickEmoji':{
      const g=document.getElementById('emoji-picker-grid');
      const field=g?.dataset.field||'icon';
      const inputMap={icon:'ef-icon',loanIcon:'ef-loanicon',fixedIcon:'ef-fixedicon'};
      state.editForm[field]=v;
      const inp=document.getElementById(inputMap[field]||'ef-icon');if(inp)inp.value=v;
      const btn=document.getElementById('emoji-field-btn');if(btn)btn.textContent=v;
      document.querySelectorAll('#emoji-picker-grid .emoji-btn').forEach(b=>b.classList.toggle('active',b.dataset.v===v));
      if(g)g.style.display='none';
      break;}
    case'stab':state.settingsTab=v;renderApp();break;
    case'doFullExport':exportFullBackup();break;
    case'doFullImport':document.getElementById('backup-import-input')?.click();break;
    case'exportBook':{
      const s=document.getElementById('export-start');const e=document.getElementById('export-end');
      state.exportForm={start:s?.value||'',end:e?.value||'',bookId:v};
      renderApp();break;}
    case'doExport':{
      const s=document.getElementById('export-start');const e=document.getElementById('export-end');
      const ef=state.exportForm||{};
      const start=s?.value||ef.start||'';const end=e?.value||ef.end||'';const bookId=ef.bookId||'all';
      let txs=[...state.txs];
      if(start)txs=txs.filter(t=>t.date>=start);
      if(end)txs=txs.filter(t=>t.date<=end);
      if(bookId!=='all')txs=txs.filter(t=>t.bookId===bookId);
      txs.sort((a,b)=>a.date.localeCompare(b.date));
      const getAccName=id=>{const a=state.accounts.find(x=>x.id===id);return a?a.name:id||'';};
      const getBookName=id=>{const b=(state.books||[]).find(x=>x.id===id);return b?b.name:'預設帳本';};
      const getCatName=(type,id)=>{const c=getCat(type,id);return c?c.name:id||'';};
      const esc=v=>`"${String(v||'').replace(/"/g,'""')}"`;
      const header='日期,類型,類別,金額,帳戶,必要想要,備註,帳本';
      const rows=txs.map(t=>{
        const type=t.type==='expense'?'支出':t.type==='income'?'收入':'轉帳';
        const cat=t.type==='transfer'?'轉帳':getCatName(t.type,t.category);
        const acc=t.type==='transfer'?`${getAccName(t.fromAccountId)}→${getAccName(t.toAccountId)}`:getAccName(t.accountId);
        return[t.date,type,esc(cat),t.amount,esc(acc),t.necessity||'',esc(t.note),esc(getBookName(t.bookId))].join(',');
      });
      const csv='﻿'+header+'\n'+rows.join('\n');
      const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=url;a.download=`記帳本_${start||'all'}_${end||'all'}.csv`;
      a.click();URL.revokeObjectURL(url);
      showToast(`已匯出 ${txs.length} 筆記錄 ✓`);break;}
    case'confirmReset':{
      if(!confirm('確定要重設記帳？此操作無法復原。'))break;
      if(!confirm('再次確認：所有交易記錄與非預設帳本將永久刪除，確定繼續？'))break;
      Object.values(_roomListeners).forEach(unsub=>unsub());
      for(const k in _roomListeners)delete _roomListeners[k];
      state.txs=[];
      state.loans=[];
      state.books=(state.books||[]).filter(b=>b.isDefault).map(b=>{
        const{roomCode:_r,createdBy:_c,...rest}=b;return rest;});
      state.activeBook='all';
      save('budget_txs',state.txs);
      save('budget_loans',state.loans);
      save('budget_books',state.books);
      save('budget_active_book',state.activeBook);
      state.settingsTab='main';
      showToast('已重設完成 ✓');renderApp();break;}
    case'openBookPicker':state.modal={type:'bookPicker'};renderApp();break;
    case'switchBook':state.activeBook=v;save('budget_active_book',v);state.modal=null;renderApp();break;
    case'setFormBook':state.form.bookId=v;dmActive('[data-a="setFormBook"]',v);break;
    case'newBook':
      state.editForm={icon:'📒',type:'personal',currency:'TWD',name:''};
      state.modal={type:'editBook'};renderApp();break;
    case'editBook':{
      const bk=(state.books||[]).find(b=>b.id===v);
      if(bk)state.editForm={...bk};
      state.modal={type:'editBook'};renderApp();break;}
    case'saveBook':{
      const nEl=document.getElementById('bk-name');
      if(nEl)state.editForm.name=nEl.value.trim();
      if(!state.editForm.name){showToast('請輸入帳本名稱');break;}
      if(state.editForm.id){
        const idx=(state.books||[]).findIndex(b=>b.id===state.editForm.id);
        if(idx>=0)state.books[idx]={...state.books[idx],...state.editForm};
      }else{
        const newBook={
          id:'bk'+Date.now(),name:state.editForm.name,icon:state.editForm.icon||'📒',
          type:state.editForm.type||'personal',currency:state.editForm.currency||'TWD',
          isDefault:false,isArchived:false,createdAt:todayStr()
        };
        state.books=[...(state.books||[]),newBook];
      }
      saveAll();state.modal=null;showToast('帳本已儲存 ✓');renderApp();break;}
    case'delBook':{
      const bk=(state.books||[]).find(b=>b.id===v);
      if(!bk||bk.isDefault){showToast('預設帳本無法刪除');break;}
      if(!confirm(`確定刪除「${bk.name}」？此帳本的記錄也會一併刪除。`))break;
      if(bk.roomCode&&_roomListeners[bk.roomCode]){_roomListeners[bk.roomCode]();delete _roomListeners[bk.roomCode];}
      state.txs=state.txs.filter(t=>t.bookId!==v);
      state.books=(state.books||[]).filter(b=>b.id!==v);
      if(state.activeBook===v)state.activeBook='all';
      saveAll();state.modal=null;showToast('帳本已刪除');renderApp();break;}
    case'archiveBook':{
      const idx=(state.books||[]).findIndex(b=>b.id===v);
      if(idx>=0){state.books[idx].isArchived=true;}
      if(state.activeBook===v)state.activeBook='all';
      saveAll();state.modal=null;showToast('帳本已封存');renderApp();break;}
    case'unarchiveBook':{
      const idx=(state.books||[]).findIndex(b=>b.id===v);
      if(idx>=0){state.books[idx].isArchived=false;}
      saveAll();state.modal=null;showToast('已取消封存');renderApp();break;}
    case'pickBookIcon':state.editForm.icon=v;dmActive('[data-a="pickBookIcon"]',v);
      (()=>{const b=document.getElementById('bk-name');if(b)b.focus();})();break;
    case'setBookType':state.editForm.type=v;renderModalOnly();break;
    case'setBookCurrency':state.editForm.currency=v;dmActive('[data-a="setBookCurrency"]',v);break;
    case'setCatType':state.catTypeTab=v;renderApp();break;
    case'booksTab':state.booksTab=v;renderApp();break;
    case'homeBudgetPeriod':state.homeBudgetPeriod=v;renderApp();break;
    case'setBudgetMode':state.budgetMode=v;state.homeBudgetPeriod=v;save('budget_mode',v);renderApp();break;
    case'setTheme':state.theme=v;save('budget_theme',v);applyAppTheme();renderApp();break;
    case'setFont':state.fontStyle=v;save('budget_font',v);applyAppTheme();renderApp();break;
    case'deleteFont':{
      const h=[...(state.hiddenFonts||[]),v];
      state.hiddenFonts=h;save('budget_hidden_fonts',h);
      if(state.fontStyle===v){state.fontStyle='system';save('budget_font','system');applyAppTheme();}
      showToast('已移除字體');renderApp();break;
    }
    case'newAccType':
      state.editForm={icon:'💰',name:'',_isNew:true};
      state.modal={type:'editAccType'};renderApp();break;
    case'editAccType':{
      const idx=parseInt(v);const types=state.accTypes||DEFAULT_ACC_TYPES;
      if(types[idx])state.editForm={...types[idx],_idx:idx,_isNew:false};
      state.modal={type:'editAccType'};renderApp();break;}
    case'delAccType':{
      const idx=parseInt(v);
      if(!confirm('確定刪除這個帳戶類型？'))break;
      state.accTypes=(state.accTypes||DEFAULT_ACC_TYPES).filter((_,i)=>i!==idx);
      saveAll();renderApp();break;}
    case'saveAccType':{
      const nEl=document.getElementById('at-name');
      const nm=nEl?nEl.value.trim():'';
      if(!nm){showToast('請輸入類型名稱');break;}
      const ic=state.editForm.icon||'💰';
      if(state.editForm._isNew){
        state.accTypes=[...(state.accTypes||DEFAULT_ACC_TYPES),{id:'at'+Date.now(),name:nm,icon:ic}];
      }else{
        const idx=state.editForm._idx;
        state.accTypes=(state.accTypes||DEFAULT_ACC_TYPES).map((tp,i)=>i===idx?{...tp,name:nm,icon:ic}:tp);
      }
      saveAll();state.modal=null;showToast('帳戶類型已儲存 ✓');renderApp();break;}
    case'newAcc':
      state.editForm={type:(state.accTypes||DEFAULT_ACC_TYPES)[0]?.id||'cash',icon:'🏦',color:ACC_COLORS[1],init:0,name:''};
      state.modal={type:'editAcc'};renderApp();break;
    case'editAcc':{
      const acc=state.accounts.find(a=>a.id===v);if(acc)state.editForm={...acc};
      state.modal={type:'editAcc'};renderApp();break;}
    case'delAcc':deleteAccount(v);break;
    case'saveAcc':{
      const nEl=document.getElementById('ef-name'),iEl=document.getElementById('ef-icon'),
        initEl=document.getElementById('ef-init'),clEl=document.getElementById('ef-creditlimit'),
        bdEl=document.getElementById('ef-billingday'),pdEl=document.getElementById('ef-paymentday');
      if(nEl)state.editForm.name=nEl.value;if(iEl&&iEl.value)state.editForm.icon=iEl.value;
      if(initEl)state.editForm.init=initEl.value;
      if(clEl)state.editForm.creditLimit=clEl.value;
      if(bdEl)state.editForm.billingDay=bdEl.value;
      if(pdEl)state.editForm.paymentDay=pdEl.value;
      saveAccount();break;}
    case'efAccType':state.editForm={...state.editForm,type:v};renderModalOnly();break;
    case'efColor':state.editForm.color=v;dmSel('[data-a="efColor"]',v);break;
    case'newCat':
      state.editForm={catType:v||state.catTypeTab,icon:'🏷️',budget:0,name:'',subcats:[],editingSubIdx:-1,newSubName:'',newSubIcon:''};
      state.modal={type:'editCat'};renderApp();break;
    case'editCat':{
      const[catType,catId]=v.split(':');
      const cat=state.cats[catType]?.find(c=>c.id===catId);
      if(cat)state.editForm={...cat,catType,subcats:[...(cat.subcats||[])],editingSubIdx:-1,newSubName:'',newSubIcon:''};
      state.modal={type:'editCat'};renderApp();break;}
    case'delCat':{const[t2,id2]=v.split(':');deleteCat(t2,id2);break;}
    case'saveCat':{
      const nEl=document.getElementById('ef-name'),iEl=document.getElementById('ef-icon'),bEl=document.getElementById('ef-budget');
      if(nEl)state.editForm.name=nEl.value;if(iEl&&iEl.value)state.editForm.icon=iEl.value;
      if(bEl)state.editForm.budget=bEl.value;saveCat();break;}
    case'efCatType':state.editForm={...state.editForm,catType:v};renderModalOnly();break;
    case'addSubcat':{
      const nEl=document.getElementById('ef-subname'),iEl=document.getElementById('ef-subicon');
      const name=(nEl?.value||'').trim();if(!name){showToast('請輸入子類別名稱');break;}
      const icon=iEl?.value||'🏷️';
      state.editForm.subcats=[...(state.editForm.subcats||[]),{id:'sc_'+Date.now(),name,icon}];
      state.editForm.newSubName='';state.editForm.newSubIcon='';renderModalOnly();break;}
    case'startEditSub':{
      const idx=parseInt(v);const sub=state.editForm.subcats[idx];
      state.editForm={...state.editForm,editingSubIdx:idx,editSubName:sub.name,editSubIcon:sub.icon||''};
      renderModalOnly();break;}
    case'saveEditSub':{
      const idx=parseInt(v);
      const nEl=document.getElementById('ef-editsubname'),iEl=document.getElementById('ef-editsubicon');
      const name=(nEl?.value||state.editForm.editSubName||'').trim();
      if(!name){showToast('請輸入名稱');break;}
      const icon=iEl?.value||state.editForm.editSubIcon||'🏷️';
      state.editForm.subcats[idx]={...state.editForm.subcats[idx],name,icon};
      state.editForm.editingSubIdx=-1;renderModalOnly();break;}
    case'cancelEditSub':state.editForm={...state.editForm,editingSubIdx:-1};renderModalOnly();break;
    case'delSub':{
      const idx=parseInt(v);state.editForm.subcats=state.editForm.subcats.filter((_,i)=>i!==idx);
      renderModalOnly();break;}
    case'editEF':
      state.editForm={accountId:state.emergencyFund.accountId||'',targetAmount:state.emergencyFund.targetAmount||0};
      state.modal={type:'editEF'};renderApp();break;
    case'ef-efacc':state.editForm.accountId=v;dmActive('[data-a="ef-efacc"]',v);break;
    case'saveEF':{
      const tEl=document.getElementById('ef-target');
      if(tEl)state.editForm.targetAmount=tEl.value;
      state.emergencyFund={accountId:state.editForm.accountId||null,targetAmount:parseFloat(state.editForm.targetAmount)||0};
      saveAll();state.modal=null;showToast('緊急預備金已設定 ✓');renderApp();break;}
    case'saveNick':{
      const el=document.getElementById('nick-input');
      if(el){state.nickname=(el.value||'').trim();saveAll();}
      showToast('暱稱已儲存 ✓');renderApp();break;}
    case'statsView':state.statsView=v;renderApp();break;
    case'assetsTab':state.assetsTab=v;renderApp();break;
    case'newLoan':state.editForm={loanColor:ACC_COLORS[0]};state.modal={type:'editLoan'};renderApp();break;
    case'editLoan':{const l=state.loans.find(x=>x.id===v);
      if(l)state.editForm={loanId:l.id,loanName:l.name,loanIcon:l.icon,loanTotal:String(l.totalAmount),loanRemaining:String(l.remainingAmount),loanMonthly:String(l.monthlyPayment),loanRate:String(l.rate),loanYears:String(l.years||''),loanStart:l.startDate,loanColor:l.color};
      state.modal={type:'editLoan'};renderApp();break;}
    case'delLoan':deleteLoan(v);break;
    case'saveLoanBtn':{
      ['ef-loanname','ef-loanicon','ef-loantotal','ef-loanremaining','ef-loanmonthly','ef-loanrate','ef-loanyears','ef-loanstart'].forEach((id,i)=>{
        const keys=['loanName','loanIcon','loanTotal','loanRemaining','loanMonthly','loanRate','loanYears','loanStart'];
        const el=document.getElementById(id);if(el)state.editForm[keys[i]]=el.value;});
      saveLoan();break;}
    case'loanColor':state.editForm.loanColor=v;dmSel('[data-a="loanColor"]',v);break;
    case'newFixed':{const defBook=(state.books||[]).find(b=>b.isDefault);state.editForm={fixedFreq:'monthly',fixedColor:ACC_COLORS[2],fixedCatId:'other_e',fixedActive:true,fixedBookId:defBook?.id||state.activeBook||''};state.modal={type:'editFixed'};renderApp();break;}
    case'editFixed':{const x=state.fixedExpenses.find(f=>f.id===v);
      if(x)state.editForm={fixedId:x.id,fixedName:x.name,fixedIcon:x.icon,fixedAmount:String(x.amount),fixedFreq:x.frequency,fixedAccountId:x.accountId||'',fixedNext:x.nextDate,fixedColor:x.color,fixedCatId:x.catId||'other_e',fixedActive:x.active!==false,fixedBookId:x.bookId||''};
      state.modal={type:'editFixed'};renderApp();break;}
    case'delFixed':deleteFixed(v);break;
    case'saveFixedBtn':{
      ['ef-fixedname','ef-fixedicon','ef-fixedamt','ef-fixednext'].forEach((id,i)=>{
        const keys=['fixedName','fixedIcon','fixedAmount','fixedNext'];
        const el=document.getElementById(id);if(el)state.editForm[keys[i]]=el.value;});
      saveFixed();break;}
    case'fixedFreq':state.editForm.fixedFreq=v;dmActive('[data-a="fixedFreq"]',v);break;
    case'fixedAcc':state.editForm.fixedAccountId=v;dmActive('[data-a="fixedAcc"]',v);break;
    case'fixedColor':state.editForm.fixedColor=v;dmSel('[data-a="fixedColor"]',v);break;
    case'fixedCatId':state.editForm.fixedCatId=v;dmActive('[data-a="fixedCatId"]',v);break;
    case'fixedBook':state.editForm.fixedBookId=v;dmActive('[data-a="fixedBook"]',v);break;
    case'toggleFixed':{const fx=state.fixedExpenses.find(f=>f.id===v);
      if(fx){fx.active=fx.active===false;saveAll();
        el.classList.toggle('on',fx.active);el.classList.toggle('off',!fx.active);
        const row=el.closest('.setting-row');
        if(row){row.style.opacity=fx.active?'':'0.5';
          const badge=row.querySelector('.setting-name span');
          if(fx.active){if(badge)badge.remove();}
          else if(!badge){row.querySelector('.setting-name')?.insertAdjacentHTML('beforeend',`<span style="font-size:11px;color:var(--text2);font-weight:600">暫停中</span>`);}
        }
      }break;}
    case'importIns':document.getElementById('ins-import-input')?.click();break;
    case'newIns':
      state.editForm={insType:'壽險',premFreq:'yearly'};
      state.modal={type:'editIns'};renderApp();break;
    case'editIns':{
      const ins=state.insurances.find(i=>i.id===v);
      if(ins)state.editForm={id:ins.id,insType:ins.type,insCompany:ins.company,insName:ins.name,
        insPolicyNo:ins.policyNo,insInsured:ins.insured,insPremium:String(ins.premium||''),
        premFreq:ins.premFreq||'yearly',insStart:ins.startDate,insEnd:ins.endDate,
        insRenewal:ins.renewalDate,insCoverageItems:[...(ins.coverageItems||[])],
        pdfId:ins.pdfId,pdfName:ins.pdfName};
      state.modal={type:'editIns'};renderApp();break;}
    case'delIns':deleteIns(v);break;
    case'insFilt':state.insFilter=v;renderApp();break;
    case'insPersonFilt':state.insPersonFilter=v;renderApp();break;
    case'insCompanyFilt':state.insCompanyFilter=v;renderApp();break;
    case'insToggle':state.insOpenCov.has(v)?state.insOpenCov.delete(v):state.insOpenCov.add(v);renderApp();break;
    case'addDetectedMember':state.editForm={memIcon:'👤',memName:v,detectedName:v};state.modal={type:'editMember'};renderApp();break;
    case'newMember':state.editForm={memIcon:'👤'};state.modal={type:'editMember'};renderApp();break;
    case'editMember':{const mem=state.insMembers.find(m=>m.id===v);
      if(mem)state.editForm={memId:mem.id,memName:mem.name,memIcon:mem.icon};
      state.modal={type:'editMember'};renderApp();break;}
    case'delMember':deleteMember(v);break;
    case'delDetectedMember':{
      const cnt=state.insurances.filter(i=>extractPersonName(i.insured)===v).length;
      if(!confirm(`確定刪除「${v}」${cnt>0?`及其 ${cnt} 筆保單資料`:''}？`))return;
      state.insurances.filter(i=>extractPersonName(i.insured)===v).forEach(i=>{if(i.pdfId)idbDel(i.pdfId).catch(()=>{});});
      state.insurances=state.insurances.filter(i=>extractPersonName(i.insured)!==v);
      save('budget_insurances',state.insurances);
      state.modal=null;renderApp();break;}
    case'memIcon':state.editForm.memIcon=v;renderModalOnly();break;
    case'saveMember':{const nEl=document.getElementById('mem-name');if(nEl)state.editForm.memName=nEl.value;saveMember();break;}
    case'insType':state.editForm.insType=v;renderModalOnly();break;
    case'insFreq':state.editForm.premFreq=v;renderModalOnly();break;
    case'insClearPdf':state.editForm._pdfData=null;state.editForm._pdfName=null;renderModalOnly();break;
    case'insUploadPdf':document.getElementById('ins-pdf-input')?.click();break;
    case'saveIns':{
      ['ins-company','ins-name','ins-policyno','ins-insured','ins-premium',
       'ins-start','ins-end','ins-renewal'].forEach((id,i)=>{
        const keys=['insCompany','insName','insPolicyNo','insInsured','insPremium',
                    'insStart','insEnd','insRenewal'];
        const el2=document.getElementById(id);if(el2)state.editForm[keys[i]]=el2.value;
      });
      state.editForm.insCoverageItems=collectCovItems();
      saveIns();break;}
    case'addCovItem':{state.editForm.insCoverageItems=collectCovItems();state.editForm.insCoverageItems.push({label:'',amount:''});renderModalOnly();break;}
    case'delCovItem':{const ci2=collectCovItems();ci2.splice(Number(v),1);state.editForm.insCoverageItems=ci2;renderModalOnly();break;}
    case'viewPDF':{
      state.modal={type:'viewPDF',data:v};renderApp();
      const vinsp=state.insurances.find(i=>i.id===v);
      if(vinsp?.pdfId){
        idbGet(vinsp.pdfId).then(rec=>{
          if(!rec)return;
          const dlBtn=document.getElementById('xlsx-dl-btn');
          if(!dlBtn)return;
          const mime='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          const blob=new Blob([rec.data],{type:mime});
          const url=URL.createObjectURL(blob);
          dlBtn.onclick=()=>{const a=document.createElement('a');a.href=url;a.download=rec.name||vinsp.pdfName||'保單.xlsx';a.click();};
        }).catch(()=>showToast('附件載入失敗'));
      }
      break;}
    case'joinRoom':{const el=document.getElementById('join-code-input');joinBookRoom(el?.value||'');break;}
    case'openBookMenu':{const bk=(state.books||[]).find(b=>b.id===v);if(bk)state.editForm={...bk};state.modal={type:'editBook'};renderApp();break;}
    case'openJoinRoom':state.modal={type:'joinRoom'};renderApp();break;
    case'toggleJoinSection':{const s=document.getElementById('join-room-section');if(s){const show=s.style.display==='none';s.style.display=show?'block':'none';if(show)document.getElementById('picker-join-code')?.focus();}break;}
    case'joinRoomFromPicker':{const el=document.getElementById('picker-join-code');joinBookRoom(el?.value||'');break;}
    case'createBookRoom':createBookRoom(v);break;
    case'joinBookRoomFromModal':{const el=document.getElementById('bk-join-code');joinBookRoom(el?.value||'');break;}
    case'leaveBookRoom':leaveBookRoom(v);break;
    case'disbandBookRoom':disbandBookRoom(v);break;
    case'copyBookRoomCode':{
      const bk=(state.books||[]).find(b=>b.id===state.editForm?.id);
      const code=bk?.roomCode||state.editForm?.roomCode;
      if(code)navigator.clipboard?.writeText(code).then(()=>showToast('已複製房間碼 ✓')).catch(()=>showToast('房間碼：'+code));
      break;}
    case'openNickModal':state.modal={type:'nickModal'};renderApp();break;
    case'saveNickModal':{
      const el=document.getElementById('nick-modal-input');
      if(el){state.nickname=(el.value||'').trim();saveAll();}
      state.modal=null;showToast('暱稱已儲存 ✓');renderApp();break;}
    case'setInstall':state.form={...state.form,installment:parseInt(v)||0};renderModalOnly();break;
    case'openAdd':state.form=defaultForm();state.modal={type:'addTx'};renderApp();break;
    case'homeDayPrev':state.homeDayOffset--;renderApp();break;
    case'homeDayNext':if(state.homeDayOffset<0){state.homeDayOffset++;renderApp();}break;
    case'toggleHideBal':state.accHideBalance=!state.accHideBalance;save('budget_hide_bal',state.accHideBalance);renderApp();break;
    case'editDF':state.editForm={...state.dreamFund};state.modal={type:'editDF'};renderApp();break;
    case'df-acc':state.editForm.accountId=v;dmActive('[data-a="df-acc"]',v);break;
    case'saveDF':{
      const wEl=document.getElementById('df-wish'),tEl=document.getElementById('df-target');
      if(wEl)state.editForm.wish=wEl.value;if(tEl)state.editForm.target=tEl.value;
      state.dreamFund={accountId:state.editForm.accountId||null,target:parseFloat(state.editForm.target)||0,wish:(state.editForm.wish||'').trim()};
      saveAll();state.modal=null;showToast('夢想基金已設定 ✓');renderApp();break;}
  }
});

