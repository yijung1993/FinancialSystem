// ── SHARED ROOM ────────────────────────────────────────────────────────────
function genRoomCode(){
  const c='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({length:6},()=>c[Math.floor(Math.random()*c.length)]).join('');
}
function _startBookListener(code,bookId){
  if(_roomListeners[code]){_roomListeners[code]();delete _roomListeners[code];}
  _roomListeners[code]=_db.collection('rooms').doc(code).onSnapshot(snap=>{
    if(!snap.exists){
      if(_roomListeners[code]){_roomListeners[code]();delete _roomListeners[code];}
      state.txs=state.txs.filter(t=>t.bookId!==bookId);
      state.books=(state.books||[]).filter(b=>b.id!==bookId);
      if(state.activeBook===bookId)state.activeBook='all';
      save('budget_txs',state.txs);save('budget_books',state.books);save('budget_active_book',state.activeBook);
      showToast('此共同帳本已被解散');renderApp();
      return;
    }
    const d=snap.data();
    if(d.updatedBy===DEVICE_ID)return;
    const incoming=(d.txs||[]).map(t=>({...t,bookId}));
    state.txs=[...state.txs.filter(t=>t.bookId!==bookId),...incoming];
    save('budget_txs',state.txs);
    showToast('✓ 已同步對方的最新資料');
    renderApp();
  },()=>{});
}
async function createBookRoom(bookId){
  try{
    let code=genRoomCode();
    let snap=await _db.collection('rooms').doc(code).get();
    let t=0;while(snap.exists&&t<5){code=genRoomCode();snap=await _db.collection('rooms').doc(code).get();t++;}
    const book=(state.books||[]).find(b=>b.id===bookId);
    if(!book)return;
    const txs=state.txs.filter(t=>t.bookId===bookId).map(({bookId:_bd,...t})=>t);
    await _db.collection('rooms').doc(code).set({
      bookName:book.name,txs,createdBy:DEVICE_ID,updatedBy:DEVICE_ID,updatedAt:firebase.firestore.FieldValue.serverTimestamp()
    });
    const idx=(state.books||[]).findIndex(b=>b.id===bookId);
    if(idx>=0)state.books[idx]={...state.books[idx],roomCode:code,createdBy:DEVICE_ID};
    saveAll();state.editForm={...state.editForm,roomCode:code,createdBy:DEVICE_ID};
    _startBookListener(code,bookId);
    showToast('房間碼已建立 ✓');renderApp();
  }catch(e){showToast('建立失敗，請確認網路連線');}
}
async function joinBookRoom(code){
  code=(code||'').toUpperCase().replace(/\s/g,'');
  if(code.length!==6){showToast('請輸入 6 位房間碼');return;}
  try{
    const snap=await _db.collection('rooms').doc(code).get();
    if(!snap.exists){showToast('找不到此房間，請確認房間碼');return;}
    const d=snap.data();
    const existing=(state.books||[]).find(b=>b.roomCode===code);
    const bookId=existing?existing.id:('bk_'+code);
    if(!existing){
      const newBook={id:bookId,name:d.bookName||'共同帳本',icon:'👥',
        type:'shared',currency:'TWD',isDefault:false,isArchived:false,
        createdAt:todayStr(),roomCode:code,createdBy:d.createdBy||null};
      state.books=[...(state.books||[]),newBook];
    }
    const incoming=(d.txs||[]).map(t=>({...t,bookId}));
    state.txs=[...state.txs.filter(t=>t.bookId!==bookId),...incoming];
    state.activeBook=bookId;
    saveAll();
    _startBookListener(code,bookId);
    state.modal=null;showToast('已加入共同帳本 ✓');renderApp();
  }catch(e){showToast('加入失敗，請確認網路連線');}
}
async function disbandBookRoom(bookId){
  const book=(state.books||[]).find(b=>b.id===bookId);
  if(!book||!book.roomCode)return;
  if(!confirm('確定解散共同帳本？對方會立即失去連線，你的帳本資料仍保留。'))return;
  const code=book.roomCode;
  try{
    if(_roomListeners[code]){_roomListeners[code]();delete _roomListeners[code];}
    await _db.collection('rooms').doc(code).delete();
    const idx=(state.books||[]).findIndex(b=>b.id===bookId);
    if(idx>=0){delete state.books[idx].roomCode;delete state.books[idx].createdBy;state.books[idx].type='personal';}
    saveAll();state.modal=null;showToast('已解除共同帳本，資料保留在本機 ✓');renderApp();
  }catch(e){showToast('解散失敗，請確認網路連線');}
}
function leaveBookRoom(bookId){
  const book=(state.books||[]).find(b=>b.id===bookId);
  if(!book||!book.roomCode)return;
  if(!confirm('確定退出共同帳本？退出後本機的帳本與記錄將一併刪除。'))return;
  const code=book.roomCode;
  if(_roomListeners[code]){_roomListeners[code]();delete _roomListeners[code];}
  state.txs=state.txs.filter(t=>t.bookId!==bookId);
  state.books=(state.books||[]).filter(b=>b.id!==bookId);
  if(state.activeBook===bookId)state.activeBook='all';
  saveAll();state.modal=null;showToast('已退出共同帳本');renderApp();
}
