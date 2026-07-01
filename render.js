// ── RENDER: FRAMEWORK ──────────────────────────────────────────────────────
function renderModalOnly(){
  if(!state.modal){renderApp();return;}
  const ov=document.getElementById('modal-overlay');
  if(!ov){
    document.getElementById('app').insertAdjacentHTML('beforeend',renderModal());
    bindOverlay();attachInputs();return;
  }
  const tmp=document.createElement('div');
  tmp.innerHTML=renderModal();
  const nM=tmp.querySelector('.modal'),cM=ov.querySelector('.modal');
  if(nM&&cM){cM.innerHTML=nM.innerHTML;}
  else{ov.outerHTML=renderModal();}
  bindOverlay();attachInputs();
}
// 直接更新 class，完全不碰 DOM 結構
function dmActive(sel,v){document.querySelectorAll(sel).forEach(b=>b.classList.toggle('active',b.dataset.v===v));}
function dmSel(sel,v,cls='sel'){document.querySelectorAll(sel).forEach(b=>b.classList.toggle(cls,b.dataset.v===v));}
function renderApp(){
  document.getElementById('app').innerHTML=
    renderTopBar()+renderView()+(state.modal?renderModal():'')+renderBottomNav();
  attachInputs();bindOverlay();
  if(state.view==='stats'&&state.statsView==='month'){setTimeout(()=>drawDonut(),50);setTimeout(()=>drawCatPie(),50);}
  if(state.view==='calendar')setTimeout(()=>drawDonut('cal-donut',state.calMonth.y,state.calMonth.m),50);
}
function renderSidebar(){
  const tabs=[{id:'add',img:'home',lbl:'首頁'},{id:'calendar',img:'calendar',lbl:'行事曆'},
    {id:'assets',img:'assets',lbl:'資產'},{id:'stats',img:'stats',lbl:'統計'},
    {id:'settings',img:'settings',lbl:'設定'}];
  const activeView=(['history'].includes(state.view)?'stats':['insurance'].includes(state.view)?'assets':state.view);
  return`<aside class="sidebar">
    <nav class="snb">${tabs.map(t=>
      `<button class="snb-btn${activeView===t.id?' active':''}" data-nav="${t.id}">
        <span class="snb-ico"><img src="icons/${t.img}.png" width="22" height="22"></span>
        <span class="snb-lbl">${t.lbl}</span>
      </button>`
    ).join('')}</nav>
  </aside>`;
}
function renderTopBar(){
  const tabs=[{id:'add',img:'home',lbl:'首頁'},{id:'calendar',img:'calendar',lbl:'行事曆'},
    {id:'assets',img:'assets',lbl:'資產'},{id:'stats',img:'stats',lbl:'統計'},
    {id:'settings',img:'settings',lbl:'設定'}];
  return`<div class="top-bar"><div class="tbi"><div class="top-logo">🏡 記帳本</div>
    <nav class="top-nav">${tabs.map(t=>
      `<button class="tnb${state.view===t.id?' active':''}" data-nav="${t.id}" style="opacity:${state.view===t.id?'1':'0.55'}">
        <img src="icons/${t.img}.png" width="22" height="22" style="vertical-align:middle;margin-right:4px">${t.lbl}
      </button>`
    ).join('')}</nav></div></div>`;
}
function renderBottomNav(){
  const tabs=[{id:'add',img:'home',lbl:'首頁'},{id:'calendar',img:'calendar',lbl:'行事曆'},
    {id:'assets',img:'assets',lbl:'資產'},{id:'stats',img:'stats',lbl:'統計'},
    {id:'settings',img:'settings',lbl:'設定'}];
  const activeView=(['history'].includes(state.view)?'stats':['insurance'].includes(state.view)?'assets':state.view);
  return`<nav class="bottom-nav">${tabs.map(t=>
    `<button class="nav-btn${activeView===t.id?' active':''}" data-nav="${t.id}">
      <span class="nav-ico"><img src="icons/${t.img}.png" width="22" height="22"></span>
      <span class="nav-lbl">${t.lbl}</span></button>`
  ).join('')}</nav>`;
}
function renderModal(){
  const{type}=state.modal;
  if(type==='addTx')return renderAddModal();
  if(type==='day')return renderDayModal(state.modal.data);
  if(type==='sum')return renderSumModal(state.modal.data);
  if(type==='editAcc')return renderEditAccModal();
  if(type==='editCat')return renderEditCatModal();
  if(type==='editTx')return renderEditTxModal();
  if(type==='editEF')return renderEditEFModal();
  if(type==='editDF')return renderEditDFModal();
  if(type==='nickModal')return renderNickModal();
  if(type==='editLoan')return renderEditLoanModal();
  if(type==='editFixed')return renderEditFixedModal();
  if(type==='editMember')return renderEditMemberModal();
  if(type==='editIns')return renderEditInsModal();
  if(type==='viewPDF')return renderViewPdfModal();
  if(type==='bookPicker')return renderBookPickerModal();
  if(type==='editBook')return renderEditBookModal();
  if(type==='editAccType')return renderEditAccTypeModal();
  if(type==='bookMenu')return renderBookMenuModal();
  if(type==='joinRoom')return renderJoinRoomModal();
  return'';
}
function renderView(){
  switch(state.view){
    case'add':return renderHomeView();
    case'calendar':return renderCalView();
    case'assets':return renderAssetsView();
    case'accounts':return renderAssetsView();
    case'stats':return renderStatsView();
    case'history':state.view='stats';state.statsView='history';return renderStatsView();
    case'insurance':state.view='assets';state.assetsTab='insurance';return renderAssetsView();
    case'settings':return renderSettingsView();
  }return'';
}

function creditCardReminders(){
  const now=new Date();now.setHours(0,0,0,0);
  const res=[];
  state.accounts.filter(a=>a.type==='credit'&&a.paymentDay).forEach(a=>{
    const day=parseInt(a.paymentDay);
    let d=new Date(now.getFullYear(),now.getMonth(),day);
    if(d<now)d=new Date(now.getFullYear(),now.getMonth()+1,day);
    const days=Math.round((d-now)/86400000);
    if(days<=7)res.push({acc:a,date:d,days});
  });
  return res.sort((a,b)=>a.days-b.days);
}
function fixedExpenseReminders(){
  const now=new Date();now.setHours(0,0,0,0);
  const todayS=now.toISOString().split('T')[0];
  const limit=new Date(now);limit.setDate(now.getDate()+7);
  const limitS=limit.toISOString().split('T')[0];
  return state.fixedExpenses
    .filter(f=>f.active!==false&&f.nextDate&&f.nextDate>=todayS&&f.nextDate<=limitS)
    .sort((a,b)=>a.nextDate.localeCompare(b.nextDate));
}
function budgetAlertReminders(){
  const n=new Date();
  const bm=state.budgetMode||'month';
  const txs=activeTxs().filter(t=>{
    const d=new Date(t.date);
    if(bm==='week'){
      const now=new Date();const dow=now.getDay();
      const ws=new Date(now);ws.setDate(now.getDate()-dow);ws.setHours(0,0,0,0);
      return t.date>=ws.toISOString().split('T')[0]&&t.date<=todayStr();
    }
    return d.getFullYear()===n.getFullYear()&&d.getMonth()===n.getMonth();
  });
  return state.cats.expense.filter(c=>c.budget>0).map(c=>{
    const spent=txs.filter(t=>t.type==='expense'&&t.category===c.id).reduce((s,t)=>s+t.amount,0);
    const pct=Math.round((spent/c.budget)*100);
    return{cat:c,spent,pct};
  }).filter(x=>x.pct>=80).sort((a,b)=>b.pct-a.pct);
}

// ── RENDER: HOME ───────────────────────────────────────────────────────────
function renderHomeView(){
  const n=new Date();
  const txs=activeTxs();
  const sum=calcSum(txs.filter(t=>{const d=new Date(t.date);return d.getFullYear()===n.getFullYear()&&d.getMonth()===n.getMonth();}));

  // Emergency fund
  const ef=state.emergencyFund;
  const efAcc=ef.accountId?getAcc(ef.accountId):null;
  const efBal=efAcc?accBalance(ef.accountId):null;
  const efTarget=ef.targetAmount>0?ef.targetAmount:calcEFTarget();
  const efPct=efTarget>0&&efBal!==null?Math.min(Math.round((efBal/efTarget)*100),100):null;

  // Dream fund
  const df=state.dreamFund;
  const dfAcc=df.accountId?getAcc(df.accountId):null;
  const dfBal=dfAcc?accBalance(df.accountId):null;
  const dfPct=df.target>0&&dfBal!==null?Math.min(Math.round((dfBal/df.target)*100),100):null;

  // Day navigation
  const dayStr=offsetDate(state.homeDayOffset);
  const dayD=new Date(dayStr+'T00:00:00');
  const dayTxs=txs.filter(t=>t.date===dayStr);
  const dayLabel=state.homeDayOffset===0?'今天':state.homeDayOffset===-1?'昨天':`${dayD.getMonth()+1}/${dayD.getDate()}`;

  const efCard=`<div class="card ef-card">
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
      <div style="font-size:clamp(16px,4.5vw,22px);font-weight:900;color:#7A4848;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">緊急預備金</div>
      <button class="icon-btn edit" data-a="editEF" style="flex-shrink:0">···</button>
    </div>
    <div class="ef-bal" style="color:${(efBal||0)>=0?'var(--income)':'var(--expense)'}">$${fmt(efBal||0)}</div>
    <div class="ef-bar-wrap">
      <div class="bar-bg" style="height:6px">
        <div class="bar-fill ${(efPct||0)<50?'over':(efPct||0)<80?'warn':'ok'}" style="width:${efPct||0}%"></div>
      </div>
      <div style="font-size:11px;color:var(--text2);margin-top:3px">
        ${efTarget>0?`${efPct||0}% · 目標 $${fmt(efTarget)}`:'尚未設定目標'}
      </div>
    </div>
    <div class="ef-hint" style="margin-top:4px">${efAcc?`${efAcc.icon} ${escHtml(efAcc.name)}`:'尚未連結帳戶'}</div>
  </div>`;

  const dfCard=`<div class="card" style="background:var(--surface);border-color:var(--border)">
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;flex:1;min-width:0">
        <div style="font-size:clamp(16px,4.5vw,22px);font-weight:900;color:#7A4848;white-space:nowrap">夢想基金</div>
        ${df.wish?`<span style="font-size:clamp(14px,4vw,22px);font-weight:700;color:#8B1A1A;background:rgba(139,26,26,0.1);padding:2px 12px;border-radius:8px;white-space:nowrap">${escHtml(df.wish)}</span>`:''}
      </div>
      <button class="icon-btn edit" data-a="editDF" style="flex-shrink:0">···</button>
    </div>
    <div class="ef-bal" style="color:${(dfBal||0)>=0?'var(--income)':'var(--expense)'}">$${fmt(dfBal||0)}</div>
    <div class="ef-bar-wrap">
      <div class="bar-bg" style="height:6px">
        <div class="bar-fill ok" style="width:${dfPct||0}%"></div>
      </div>
      <div style="font-size:11px;color:var(--text2);margin-top:3px">
        ${df.target>0?`${dfPct||0}% · 目標 $${fmt(df.target)}`:'尚未設定目標'}
      </div>
    </div>
    <div class="ef-hint" style="margin-top:4px">${dfAcc?`${dfAcc.icon} ${escHtml(dfAcc.name)}`:'尚未連結帳戶'}</div>
  </div>`;

  const dayE=dayTxs.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
  const dayI=dayTxs.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);

  return`<div class="hdr"><div class="hdr-in">
    <div style="display:flex;align-items:center;position:relative;height:36px">
      <button class="book-switcher" data-a="openBookPicker">${activeBookIcon()} ${activeBookName()} ▾</button>
      <h1 style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;letter-spacing:-.3px;pointer-events:none;margin:0">${n.getFullYear()}年${n.getMonth()+1}月</h1>
    </div>
    <div class="sum-bar">
      <div class="sum-item"><div class="lbl">本月收入</div><div class="val">$${fmt(sum.income)}</div></div>
      <div class="sum-item"><div class="lbl">本月支出</div><div class="val">$${fmt(sum.expense)}</div></div>
      <div class="sum-item"><div class="lbl">結餘</div>
        <div class="val" style="color:${sum.balance>=0?'#1A7A50':'#B02828'}">$${fmt(sum.balance)}</div>
      </div>
    </div>
  </div></div>
  <div class="content">
    ${(()=>{
      const cc=creditCardReminders();
      const fe=fixedExpenseReminders();
      const ba=budgetAlertReminders();
      const ia=insAlerts();
      if(!cc.length&&!fe.length&&!ba.length&&!ia.length)return'';
      const bm=state.budgetMode||'month';
      const mkRow=(ico,name,sub,tag,tagColor)=>
        `<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--border)">
          <span style="font-size:20px;flex-shrink:0">${ico}</span>
          <span style="flex:1;font-size:15px;font-weight:700;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${name}</span>
          ${sub?`<span style="font-size:12px;color:var(--text2);flex-shrink:0;margin-right:2px">${sub}</span>`:''}
          <span style="font-size:13px;font-weight:700;color:${tagColor};flex-shrink:0;white-space:nowrap">${tag}</span>
        </div>`;
      const mkTitle=(t)=>`<div style="font-size:12px;font-weight:700;color:var(--text2);letter-spacing:.3px;padding:8px 0 2px">${t}</div>`;
      let html='';
      if(cc.length){
        html+=mkTitle('💳 信用卡繳款');
        html+=cc.map(r=>{
          const tag=`${r.date.getMonth()+1}/${r.date.getDate()}${r.days===0?' · 今天':r.days===1?' · 明天':` · ${r.days}天後`}`;
          return mkRow(r.acc.icon,escHtml(r.acc.name),'',tag,r.days<=2?'var(--expense)':'var(--text2)');
        }).join('');
      }
      if(fe.length){
        html+=mkTitle('📋 固定費用');
        html+=fe.map(f=>{
          const d=new Date(f.nextDate+'T00:00:00');
          const now2=new Date();now2.setHours(0,0,0,0);
          const diff=Math.round((d-now2)/86400000);
          const tag=`${d.getMonth()+1}/${d.getDate()}${diff===0?' · 今天':diff===1?' · 明天':` · ${diff}天後`}`;
          return mkRow(f.icon,escHtml(f.name),'$'+fmt(f.amount),tag,diff<=2?'var(--expense)':'var(--text2)');
        }).join('');
      }
      if(ba.length){
        html+=mkTitle(`⚠️ 預算警示（${bm==='week'?'本週':'本月'}）`);
        html+=ba.map(x=>{
          const sub='$'+fmt(x.spent)+' / $'+fmt(x.cat.budget);
          const tag=x.pct+'%'+(x.pct>=100?' 超標':'');
          return mkRow(x.cat.icon,escHtml(x.cat.name),sub,tag,x.pct>=100?'var(--expense)':'#B89830');
        }).join('');
      }
      if(ia.length){
        html+=mkTitle('🛡️ 保險到期');
        html+=ia.map(i=>{const st=insStatus(i);return mkRow('🛡️',escHtml(i.name||i.company||'保單'),'',st.label,'#B89830');}).join('');
      }
      return`<div class="card" style="background:var(--surface);border-color:var(--border);margin-bottom:12px">
        <div style="font-size:16px;font-weight:800;color:#7A4848">📢 提醒事項</div>
        ${html}
      </div>`;
    })()}
    <div class="add-layout" style="margin-bottom:12px">${efCard}${dfCard}</div>
    <button class="save-btn" data-a="openAdd" style="margin-bottom:12px">📝 記一筆</button>
    ${(()=>{
      const bm=state.budgetMode||'month';
      const bp=state.homeBudgetPeriod||bm;
      // 計算本週日期範圍
      const todayD=new Date();const dow=todayD.getDay();
      const weekStart=new Date(todayD);weekStart.setDate(todayD.getDate()-dow);weekStart.setHours(0,0,0,0);
      const weekStartStr=weekStart.toISOString().split('T')[0];
      // 計算週/月期間的交易
      const weekTxs=txs.filter(t=>t.date>=weekStartStr&&t.date<=todayStr());
      const monthTxsList=txs.filter(t=>{const d=new Date(t.date);return d.getFullYear()===n.getFullYear()&&d.getMonth()===n.getMonth();});
      const periodTxs=bp==='week'?weekTxs:monthTxsList;
      const expCats=state.cats.expense.filter(c=>c.budget>0);
      // 判斷當前瀏覽週期是否與預算週期相同 (才能做進度比較)
      const sameMode=bp===bm;
      const catRows=expCats.map(cat=>{
        const spent=periodTxs.filter(t=>t.type==='expense'&&t.category===cat.id).reduce((s,t)=>s+t.amount,0);
        if(sameMode){
          const remain=cat.budget-spent;
          const pct=Math.min(Math.round((spent/cat.budget)*100),100);
          return`<div style="margin-bottom:14px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
              <div style="display:flex;align-items:center;gap:7px;min-width:0">
                <span style="font-size:18px">${cat.icon}</span>
                <span style="font-size:14px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(cat.name)}</span>
                <span style="font-size:11px;color:var(--text2);white-space:nowrap">${bm==='week'?'週':'月'}預算 $${fmt(cat.budget)}</span>
              </div>
              <div style="text-align:right;flex-shrink:0;margin-left:8px">
                <span style="font-size:13px;color:var(--expense);font-weight:700">已用 $${fmt(spent)}</span>
                <span style="font-size:13px;color:${remain>=0?'var(--income)':'var(--expense)'};font-weight:700;margin-left:6px">剩 $${fmt(Math.abs(remain))}${remain<0?' ⚠️':''}</span>
              </div>
            </div>
            <div class="bar-bg"><div class="bar-fill ${pct>=100?'over':pct>=80?'warn':'ok'}" style="width:${pct}%"></div></div>
          </div>`;
        }else{
          // 不同週期：只顯示花費，標注預算為參考
          return`<div style="margin-bottom:12px;display:flex;align-items:center;gap:7px;justify-content:space-between">
            <div style="display:flex;align-items:center;gap:7px;min-width:0">
              <span style="font-size:18px">${cat.icon}</span>
              <span style="font-size:14px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(cat.name)}</span>
            </div>
            <div style="text-align:right;flex-shrink:0">
              <span style="font-size:14px;font-weight:800;color:var(--expense)">$${fmt(spent)}</span>
              <span style="font-size:11px;color:var(--text2);margin-left:5px">(${bm==='week'?'週':'月'}預算 $${fmt(cat.budget)} 參考)</span>
            </div>
          </div>`;
        }
      }).join('');
      return`<div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
          <span style="font-size:13px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.5px">預算進度</span>
          <div style="display:flex;gap:4px">
            <button class="stab${bp==='week'?' active':''}" style="padding:5px 12px;font-size:12px" data-a="homeBudgetPeriod" data-v="week">本週</button>
            <button class="stab${bp==='month'?' active':''}" style="padding:5px 12px;font-size:12px" data-a="homeBudgetPeriod" data-v="month">本月</button>
          </div>
        </div>
        ${!sameMode?`<div style="font-size:11px;color:var(--text2);margin-bottom:10px;padding:6px 10px;background:var(--bg);border-radius:8px;border:1px solid var(--border)">
          ℹ️ 你設定的是「${bm==='week'?'週':'月'}預算」，切回「${bm==='week'?'本週':'本月'}」可看完整進度條</div>`:''}
        ${expCats.length>0?catRows:`<div class="empty" style="padding:20px 0"><div class="ei" style="font-size:32px">📋</div><p style="font-size:13px">尚未設定類別預算<br><span style="color:var(--p)">可至「設定 → 類別管理」設定</span></p></div>`}
      </div>`;
    })()}
    <div class="card" style="margin-top:12px">
      <div class="day-nav">
        <button class="day-nb" data-a="homeDayPrev">‹</button>
        <span style="font-size:18px;font-weight:700;color:var(--text2)">
          ${dayD.getMonth()+1}月${dayD.getDate()}日
        </span>
        <button class="day-nb" data-a="homeDayNext"${state.homeDayOffset>=0?' disabled':''}>›</button>
      </div>
      ${dayTxs.length>0?dayTxs.map(t=>txItem(t,true,false)).join(''):`<div class="empty" style="padding:24px 0"><div class="ei" style="font-size:36px">📭</div><p>這天沒有記錄</p></div>`}
    </div>
  </div>`;
}

function renderAddModal(){
  const f=state.form;
  const typeToggle=`<div class="type-toggle">
      <button class="type-btn${f.type==='income'?' ai':''}" data-a="type" data-v="income">＋ 收入</button>
      <button class="type-btn${f.type==='expense'?' ae':''}" data-a="type" data-v="expense">－ 支出</button>
      <button class="type-btn${f.type==='transfer'?' at':''}" data-a="type" data-v="transfer">🔄 轉帳</button>
    </div>`;
  if(f.type==='transfer'){
    return`<div class="overlay" id="modal-overlay"><div class="modal" style="max-height:80vh">
      <div style="display:flex;align-items:center;justify-content:center;position:relative;margin-bottom:14px">
        <div style="width:36px;height:4px;background:var(--border);border-radius:2px"></div>
        <button data-a="closeModal" style="position:absolute;right:0;border:none;background:transparent;font-size:22px;cursor:pointer;color:var(--text2);line-height:1;padding:0 4px">✕</button>
      </div>
      ${typeToggle}
      <div class="amt-wrap">
        <span class="amt-pre">$</span>
        <input class="amt-input" id="amt" type="number" inputmode="decimal" placeholder="0" value="${f.amount}" autofocus>
      </div>
      <div class="slabel">從哪個帳戶</div>
      <div class="acc-row" style="margin-bottom:14px;flex-wrap:wrap">${state.accounts.map(acc=>
        `<button class="acc-pill${f.fromAccountId===acc.id?' active':''}"
          style="--acc-c:${acc.color}" data-a="setFromAcc" data-v="${acc.id}">${acc.icon} ${escHtml(acc.name)}</button>`
      ).join('')}</div>
      <div class="slabel">轉到哪個帳戶</div>
      <div class="acc-row" style="margin-bottom:14px;flex-wrap:wrap">${state.accounts.map(acc=>
        `<button class="acc-pill${f.toAccountId===acc.id?' active':''}"
          style="--acc-c:${acc.color};${acc.id===f.fromAccountId?'opacity:.4;pointer-events:none':''}"
          data-a="setToAcc" data-v="${acc.id}">${acc.icon} ${escHtml(acc.name)}</button>`
      ).join('')}</div>
      <div class="form-field" style="margin-bottom:10px"><label>日期</label>
        <input class="form-input" id="fdate" type="date" value="${f.date}"></div>
      <div class="form-field" style="margin-bottom:14px"><label>備註</label>
        <input class="form-input" id="fnote" type="text" placeholder="選填" value="${escHtml(f.note)}"></div>
      <button class="save-btn" data-a="save">儲存轉帳</button>
    </div></div>`;
  }
  const cats=f.type==='income'?state.cats.income:state.cats.expense;
  const selCatExists=cats.some(c=>c.id===f.category);
  if(!selCatExists){state.form.category=cats[0]?.id||'';state.form.subCategory='';}
  const selCat=cats.find(c=>c.id===f.category);
  const subcats=selCat?.subcats||[];
  const selAcc=state.accounts.find(a=>a.id===f.accountId);
  const isCredit=selAcc?.type==='credit';
  return`<div class="overlay" id="modal-overlay"><div class="modal" style="max-height:80vh">
    <div style="display:flex;align-items:center;justify-content:center;position:relative;margin-bottom:14px">
      <div style="width:36px;height:4px;background:var(--border);border-radius:2px"></div>
      <button data-a="closeModal" style="position:absolute;right:0;border:none;background:transparent;font-size:22px;cursor:pointer;color:var(--text2);line-height:1;padding:0 4px">✕</button>
    </div>
    ${typeToggle}
    <div class="amt-wrap">
      <span class="amt-pre">$</span>
      <input class="amt-input" id="amt" type="number" inputmode="decimal" placeholder="0" value="${f.amount}" autofocus>
    </div>
    <div class="slabel">類別</div>
    <div class="cat-grid">${cats.map(c=>
      `<button class="cat-btn${f.category===c.id?' ac':''}" data-a="cat" data-v="${c.id}">
        <span class="ci">${c.icon}</span><span>${escHtml(c.name)}</span></button>`
    ).join('')}</div>
    ${subcats.length>0?`
    <div class="slabel">細分類別</div>
    <div class="subcat-row">
      <button class="subcat-btn${!f.subCategory?' as':''}" data-a="subcat" data-v="">不細分</button>
      ${subcats.map(s=>
        `<button class="subcat-btn${f.subCategory===s.id?' as':''}" data-a="subcat" data-v="${s.id}">${s.icon||''} ${escHtml(s.name)}</button>`
      ).join('')}
    </div>`:''}
    ${state.accounts.length>0?`
    <div class="slabel">帳戶</div>
    <div class="acc-row">${state.accounts.map(acc=>
      `<button class="acc-pill${f.accountId===acc.id?' active':''}"
        style="--acc-c:${acc.color}" data-a="setAcc" data-v="${acc.id}">${acc.icon} ${escHtml(acc.name)}</button>`
    ).join('')}</div>`:''}
    ${isCredit&&f.type==='expense'?`
    <div class="slabel">信用卡分期</div>
    <div class="acc-row" style="margin-bottom:${(f.installment||0)>=2?'8px':'14px'}">
      <button class="acc-pill${(f.installment||0)===0?' active':''}" style="--acc-c:var(--latte)" data-a="setInstall" data-v="0">不分期</button>
      <button class="acc-pill${(f.installment||0)===3?' active':''}" style="--acc-c:var(--latte)" data-a="setInstall" data-v="3">3 期</button>
      <button class="acc-pill${(f.installment||0)===6?' active':''}" style="--acc-c:var(--latte)" data-a="setInstall" data-v="6">6 期</button>
      <button class="acc-pill${(f.installment||0)===9?' active':''}" style="--acc-c:var(--latte)" data-a="setInstall" data-v="9">9 期</button>
    </div>
    ${(f.installment||0)>=2&&f.amount?`<div style="font-size:12px;color:var(--text2);background:var(--bg);padding:8px 12px;border-radius:8px;margin-bottom:14px;line-height:1.7">
      共 ${f.installment} 筆 · 首期 <b>$${(parseFloat(f.amount)-Math.floor(parseFloat(f.amount)/f.installment)*(f.installment-1)).toLocaleString('zh-TW')}</b> · 之後每月 <b>$${Math.floor(parseFloat(f.amount)/f.installment).toLocaleString('zh-TW')}</b>
    </div>`:''}`:''}
    <div class="form-field" style="margin-bottom:10px"><label>日期</label>
      <input class="form-input" id="fdate" type="date" value="${f.date}"></div>
    <div class="form-field" style="margin-bottom:14px"><label>備註</label>
      <input class="form-input" id="fnote" type="text" placeholder="選填" value="${escHtml(f.note)}"></div>
    ${(state.books||[]).filter(b=>!b.isArchived).length>1?`
    <div class="slabel">帳本</div>
    <div class="acc-row" style="margin-bottom:14px">${(state.books||[]).filter(b=>!b.isArchived).map(b=>
      `<button class="acc-pill${f.bookId===b.id?' active':''}" style="--acc-c:var(--latte)" data-a="setFormBook" data-v="${b.id}">${b.icon} ${escHtml(b.name)}</button>`
    ).join('')}</div>`:''}
    <button class="save-btn" data-a="save">儲存記錄</button>
  </div></div>`;
}

// ── RENDER: ACCOUNTS ───────────────────────────────────────────────────────
function renderAccountsView(){
  const hide=state.accHideBalance;
  const total=state.accounts.reduce((s,acc)=>s+accBalance(acc.id),0);
  const rows=state.accounts.map(acc=>{
    const bal=accBalance(acc.id);
    const type=(state.accTypes||DEFAULT_ACC_TYPES).find(t=>t.id===acc.type);
    const isCredit=acc.type==='credit';
    const balColor=hide?'var(--text2)':isCredit?(bal<0?'var(--expense)':'var(--income)'):(bal>=0?'var(--income)':'var(--expense)');
    const balText=hide?'••••':isCredit?`待繳 $${fmt(Math.abs(bal))}`:`$${fmt(bal)}`;
    return`<div class="setting-row">
      <div class="setting-ico" style="background:var(--bg);border:1px solid var(--border)">${acc.icon}</div>
      <div class="setting-info">
        <div class="setting-name">${escHtml(acc.name)}</div>
        <div class="setting-sub">${type?.name||acc.type}${acc.creditLimit>0?` · 額度 $${fmt(acc.creditLimit)}`:''}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:17px;font-weight:800;color:${balColor}">${balText}</span>
        <div style="display:flex;gap:4px">
          <button class="icon-btn edit" data-a="editAcc" data-v="${acc.id}">···</button>
          <button class="icon-btn del" data-a="delAcc" data-v="${acc.id}">🗑️</button>
        </div>
      </div>
    </div>`;
  }).join('');
  return`<div class="hdr"><div class="hdr-in">
    <h1>帳戶總覽</h1>
    <div style="display:flex;align-items:center;gap:12px;margin-top:14px">
      <div>
        <div style="font-size:13px;opacity:.85">淨資產</div>
        <div style="font-size:34px;font-weight:800">${hide?'••••••':'$'+fmt(total)}</div>
      </div>
      <button class="eye-btn${hide?' off':''}" data-a="toggleHideBal">👁</button>
    </div>
  </div></div>
  <div class="content"><div class="card">
    ${rows}
    <button class="add-fab" data-a="newAcc">＋ 新增帳戶</button>
  </div></div>`;
}

// ── RENDER: ASSETS ─────────────────────────────────────────────────────────
function renderAssetsView(){
  const hide=state.accHideBalance;
  const acsBal=state.accounts.map(a=>({id:a.id,b:accBalance(a.id)}));
  const totalAssets=acsBal.filter(x=>x.b>0).reduce((s,x)=>s+x.b,0);
  const ccDebt=acsBal.filter(x=>x.b<0).reduce((s,x)=>s+Math.abs(x.b),0);
  const loanDebt=state.loans.reduce((s,l)=>s+(l.remainingAmount||0),0);
  const netWorth=totalAssets-ccDebt-loanDebt;
  const tab=(state.assetsTab==='fixed'?'accounts':state.assetsTab)||'accounts';
  const subTabs=[{id:'accounts',lbl:'帳戶'},{id:'loans',lbl:'貸款'},{id:'insurance',lbl:'保險'}];
  let content='';
  if(tab==='accounts'){
    const types=state.accTypes||DEFAULT_ACC_TYPES;
    const typeGroups=types.map(tp=>{
      const accs=state.accounts.filter(a=>a.type===tp.id);
      if(!accs.length)return'';
      const rows=accs.map(acc=>{
        const bal=accBalance(acc.id);const isCredit=acc.type==='credit';
        const balColor=hide?'var(--text2)':isCredit?(bal<0?'var(--expense)':'var(--income)'):(bal>=0?'var(--income)':'var(--expense)');
        const balText=hide?'* * * *':isCredit?`待繳 $${fmt(Math.abs(bal))}`:`$${fmt(bal)}`;
        return`<div class="setting-row" style="padding:8px 0">
          <div class="setting-ico" style="width:36px;height:36px;border-radius:10px;font-size:18px;background:var(--bg);border:1px solid var(--border)">${acc.icon}</div>
          <div class="setting-info"><div class="setting-name">${escHtml(acc.name)}</div>
            ${acc.creditLimit>0?`<div class="setting-sub">額度 $${fmt(acc.creditLimit)}</div>`:''}</div>
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:19px;font-weight:800;color:${balColor}">${balText}</span>
            <div style="display:flex;gap:4px">
              <button class="icon-btn edit" data-a="editAcc" data-v="${acc.id}">···</button>
              <button class="icon-btn del" data-a="delAcc" data-v="${acc.id}">🗑️</button>
            </div>
          </div>
        </div>`;}).join('');
      return`<div style="font-size:17px;font-weight:900;color:var(--text);padding:0 2px;margin-bottom:6px;margin-top:4px">${escHtml(tp.name)}</div>
      <div class="card" style="margin-bottom:16px">${rows}</div>`;
    }).join('');
    const uncategorized=state.accounts.filter(a=>!types.find(tp=>tp.id===a.type));
    const uncatRows=uncategorized.map(acc=>{
      const bal=accBalance(acc.id);const isCredit=acc.type==='credit';
      const balColor=hide?'var(--text2)':(bal>=0?'var(--income)':'var(--expense)');
      const balText=hide?'* * * *':`$${fmt(bal)}`;
      return`<div class="setting-row" style="padding:8px 0">
        <div class="setting-ico" style="width:36px;height:36px;border-radius:10px;font-size:18px;background:var(--bg);border:1px solid var(--border)">${acc.icon}</div>
        <div class="setting-info"><div class="setting-name">${escHtml(acc.name)}</div></div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:19px;font-weight:800;color:${balColor}">${balText}</span>
          <div style="display:flex;gap:4px">
            <button class="icon-btn edit" data-a="editAcc" data-v="${acc.id}">···</button>
            <button class="icon-btn del" data-a="delAcc" data-v="${acc.id}">🗑️</button>
          </div>
        </div>
      </div>`;}).join('');
    content=`<button class="add-fab" data-a="newAcc" style="margin-bottom:12px">＋ 新增帳戶</button>
    ${typeGroups}${uncatRows?`<div class="card" style="margin-bottom:12px">${uncatRows}</div>`:''}`;

  } else if(tab==='loans'){
    const totalDebt=state.loans.reduce((s,l)=>s+(l.remainingAmount||0),0);
    const totalMonthly=state.loans.reduce((s,l)=>s+(l.monthlyPayment||0),0);
    const loanCards=state.loans.map(l=>`<div class="card" style="margin-bottom:12px">
      <div style="display:flex;align-items:center;gap:12px">
        <div class="setting-ico" style="background:var(--bg);border:1px solid var(--border)">${l.icon}</div>
        <div class="setting-info"><div class="setting-name">${escHtml(l.name)}</div>
          <div class="setting-sub">每月 $${fmt(l.monthlyPayment)} · 利率 ${l.rate}%${l.years?` · ${l.years}年`:''}</div></div>
        <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
          <span style="font-size:18px;font-weight:800;color:var(--expense)">$${fmt(l.remainingAmount)}</span>
          <div style="display:flex;gap:4px">
            <button class="icon-btn edit" data-a="editLoan" data-v="${l.id}">···</button>
            <button class="icon-btn del" data-a="delLoan" data-v="${l.id}">🗑️</button>
          </div>
        </div>
      </div>
    </div>`).join('');
    content=`<button class="add-fab" data-a="newLoan" style="margin-bottom:12px">＋ 新增貸款</button>
    ${totalDebt>0?`<div class="card" style="background:var(--surface);border-color:var(--border);margin-bottom:12px;display:flex;gap:24px">
      <div><div style="font-size:11px;color:var(--text2);font-weight:700">總負債</div><div style="font-size:22px;font-weight:800;color:var(--expense)">$${fmt(totalDebt)}</div></div>
      <div><div style="font-size:11px;color:var(--text2);font-weight:700">每月還款</div><div style="font-size:22px;font-weight:800">$${fmt(totalMonthly)}</div></div>
    </div>`:''}
    ${loanCards||`<div class="empty" style="padding:40px 20px"><div class="ei" style="font-size:36px">🏦</div><p>尚無貸款記錄</p></div>`}`;
  } else if(tab==='insurance'){
    const total=state.insurances.reduce((s,ins)=>s+insYearlyPremium(ins),0);
    const active=state.insurances.filter(ins=>insStatus(ins).cls==='active').length;
    content=`<button class="add-fab" data-a="newIns" style="margin-bottom:12px">＋ 新增保單</button>
    <div class="card" style="background:linear-gradient(135deg,#E8EEF8,#EEF4FF);border-color:#C8D8F0;margin-bottom:12px;display:flex;gap:24px;align-items:center">
      <div><div style="font-size:11px;color:var(--text2);font-weight:700">保單數量</div><div style="font-size:20px;font-weight:800">${state.insurances.length} 張<span style="font-size:12px;color:var(--text2);font-weight:600;margin-left:4px">${active} 張生效中</span></div></div>
      <div style="margin-left:auto;display:flex;gap:8px">
        <button class="outline-btn" style="font-size:12px;padding:6px 10px" data-a="importIns">📥 匯入</button>
      </div>
    </div>`+renderInsBodyHtml();
  }
  return`<div class="hdr"><div class="hdr-in">
    <h1>家庭淨資產</h1>
    <div style="margin-top:6px">
      <div style="display:flex;align-items:center;gap:8px">
        <div style="font-size:30px;font-weight:800;color:${!hide?(netWorth>=0?'rgba(255,255,255,.95)':'rgba(255,180,180,.95)'):'rgba(255,255,255,.6)'}">${hide?'* * * *':(netWorth<0?'-':'')+'$'+fmt(Math.abs(netWorth))}</div>
        <button class="eye-btn${hide?' off':''}" data-a="toggleHideBal">👁</button>
      </div>
      ${!hide?`<div style="font-size:12px;opacity:.8;margin-top:2px">資產 $${fmt(totalAssets)} · 負債 $${fmt(ccDebt+loanDebt)}</div>`:''}
    </div>
  </div></div>
  <div class="content">
    <div class="stabs" style="margin-bottom:16px">
      ${subTabs.map(t=>`<button class="stab${tab===t.id?' active':''}" data-a="assetsTab" data-v="${t.id}">${t.lbl}</button>`).join('')}
    </div>
    ${content}
  </div>`;
}

// ── RENDER: CALENDAR ───────────────────────────────────────────────────────
function renderCalView(){
  const{y,m}=state.calMonth;
  const first=new Date(y,m,1).getDay();
  const days=new Date(y,m+1,0).getDate();
  const today=todayStr();
  const txs=monthTxs(y,m);
  const sum=calcSum(txs);
  const dayMap={};
  txs.filter(t=>t.type==='expense').forEach(t=>{
    const d=parseInt(t.date.split('-')[2]);dayMap[d]=(dayMap[d]||0)+t.amount;
  });
  let cells=Array.from({length:first},()=>'<div class="cal-day empty"></div>').join('');
  for(let d=1;d<=days;d++){
    const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dow=new Date(ds+'T00:00:00').getDay();
    const isToday=ds===today;const amt=dayMap[d];
    const amtStr=amt?fmt(amt):'';
    cells+=`<div class="cal-day${isToday?' today':''}${amt?' has-exp':''}${dow===0?' sun':dow===6?' sat':''}"
      data-a="openDay" data-v="${ds}">
      <span class="cdn">${d}</span>
      <span class="cda">${amtStr}</span>
    </div>`;
  }
  return`<div class="hdr"><div class="hdr-in">
    <div class="cal-nav">
      <button class="cal-nb" data-a="cprev">‹</button>
      <span class="cal-title-text" style="flex:1;text-align:center">${y}年${MONTHS[m]}</span>
      <button class="cal-nb" data-a="cnext">›</button>
    </div>
    <div class="sum-bar">
      <div class="sum-item"><div class="lbl">收入</div><div class="val">$${fmt(sum.income)}</div></div>
      <div class="sum-item"><div class="lbl">支出</div><div class="val">$${fmt(sum.expense)}</div></div>
      <div class="sum-item"><div class="lbl">結餘</div>
        <div class="val" style="color:${sum.balance>=0?'#1A7A50':'#B02828'}">$${fmt(sum.balance)}</div>
      </div>
    </div>
  </div></div>
  <div class="content">
    <div class="card">
      <div class="weekdays">${['日','一','二','三','四','五','六'].map(d=>`<div class="wday">${d}</div>`).join('')}</div>
      <div class="cal-grid">${cells}</div>
    </div>
    ${sum.expense>0?`<div class="card" style="margin-top:12px">
      <div class="card-title">本月必要 vs 想要</div>
      <div class="donut-wrap">
        <canvas id="cal-donut" width="120" height="120" style="flex-shrink:0"></canvas>
        <div class="donut-legend">
          <div class="leg-item"><div class="leg-dot" style="background:var(--nec)"></div>
            <span class="leg-lbl">必要</span><span class="leg-val" style="color:var(--nec)">$${fmt(sum.nec)}</span></div>
          <div class="leg-item"><div class="leg-dot" style="background:var(--want)"></div>
            <span class="leg-lbl">想要</span><span class="leg-val" style="color:var(--want)">$${fmt(sum.want)}</span></div>
          <div style="font-size:13px;color:var(--text2)">想要佔 ${Math.round((sum.want/(sum.expense||1))*100)}%</div>
        </div>
      </div>
    </div>`:''}
  </div>`;
}

function renderDayModal(date){
  const txs=state.txs.filter(t=>t.date===date);
  const d=new Date(date+'T00:00:00');
  const expTotal=txs.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
  const incTotal=txs.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
  const rows=txs.map(t=>{
    const cat=getCat(t.type,t.category);
    const sub=t.subCategory?getSubCat(cat,t.subCategory):null;
    const acc=getAcc(t.accountId);
    const catLabel=sub?`${escHtml(cat.name)} · ${escHtml(sub.name)}`:escHtml(cat.name);
    const necRow=t.type==='expense'?`
    <div class="nec-mini">
      <button class="nec-mbtn${t.necessity==='必要'?' an':''}" data-a="setNec" data-id="${t.id}" data-v="必要">必要</button>
      <button class="nec-mbtn${t.necessity==='想要'?' aw':''}" data-a="setNec" data-id="${t.id}" data-v="想要">想要</button>
      <button class="nec-mbtn${!t.necessity?' au':''}" data-a="setNec" data-id="${t.id}" data-v="">未設定</button>
    </div>`:'';
    return`<div class="tx-item">
      <div class="tx-ico ${t.type}">${cat.icon}</div>
      <div class="tx-info">
        <div class="tx-cat">${catLabel}${t.note?' · '+escHtml(t.note):''}</div>
        <div class="tx-meta">
          <span>${acc.icon} ${escHtml(acc.name)}</span>
          ${t.necessity?`<span class="nec-tag ${t.necessity==='必要'?'n':'w'}">${t.necessity}</span>`:''}
        </div>
      </div>
      <div class="tx-right">
        <div class="tx-amt ${t.type}">$${fmt(t.amount)}</div>
        <div class="tx-actions">
          <button class="icon-btn edit" data-a="openEditTx" data-v="${t.id}">···</button>
          <button class="icon-btn del" data-a="del" data-id="${t.id}">🗑️</button>
        </div>
      </div>
    </div>${necRow}`;
  }).join('');
  return`<div class="overlay" id="modal-overlay"><div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title">${d.getMonth()+1}月${d.getDate()}日</div>
    ${txs.length===0?`<div class="empty"><div class="ei">📭</div><p>這天沒有記錄</p></div>`:rows}
  </div></div>`;
}

// ── RENDER: EDIT TX MODAL ──────────────────────────────────────────────────
function renderEditTxModal(){
  const f=state.editForm;
  const cats=f.type==='income'?state.cats.income:state.cats.expense;
  const selCat=cats.find(c=>c.id===f.category);
  const subcats=selCat?.subcats||[];
  const isInstallment=/分\d+期第\d+期/.test(f.note||'');
  return`<div class="overlay" id="modal-overlay"><div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title">編輯記錄</div>
    <div class="type-toggle" style="margin-bottom:12px">
      <button class="type-btn${f.type==='income'?' ai':''}" data-a="ef-type" data-v="income">＋ 收入</button>
      <button class="type-btn${f.type==='expense'?' ae':''}" data-a="ef-type" data-v="expense">－ 支出</button>
    </div>
    <div class="amt-wrap" style="margin-bottom:${isInstallment?'4px':'12px'}">
      <span class="amt-pre">$</span>
      <input class="amt-input" id="ef-amt" type="number" inputmode="decimal" placeholder="0" value="${f.amount||''}"${isInstallment?' readonly style="opacity:.5;cursor:not-allowed"':''}>
    </div>
    ${isInstallment?`<div style="font-size:12px;color:var(--text2);margin-bottom:12px;padding:0 2px">⚠️ 分期消費金額不可修改</div>`:''}
    ${f.type==='expense'?`
    <div class="slabel">必要 / 想要</div>
    <div class="nec-row" style="margin-bottom:12px">
      <button class="nec-btn${f.necessity==='必要'?' an':''}" data-a="ef-nec" data-v="必要">✅ 必要支出</button>
      <button class="nec-btn${f.necessity==='想要'?' aw':''}" data-a="ef-nec" data-v="想要">🛒 想要購買</button>
      <button class="nec-btn${!f.necessity?' au':''}" data-a="ef-nec" data-v="">未設定</button>
    </div>`:''}
    <div class="slabel">類別</div>
    <div class="cat-grid" style="margin-bottom:12px">${cats.map(c=>
      `<button class="cat-btn${f.category===c.id?' ac':''}" data-a="ef-cat" data-v="${c.id}">
        <span class="ci">${c.icon}</span><span>${escHtml(c.name)}</span></button>`
    ).join('')}</div>
    ${subcats.length>0?`
    <div class="slabel">細分類別</div>
    <div class="subcat-row" style="margin-bottom:12px">
      <button class="subcat-btn${!f.subCategory?' as':''}" data-a="ef-subcat" data-v="">不細分</button>
      ${subcats.map(s=>
        `<button class="subcat-btn${f.subCategory===s.id?' as':''}" data-a="ef-subcat" data-v="${s.id}">${s.icon||''} ${escHtml(s.name)}</button>`
      ).join('')}
    </div>`:''}
    ${state.accounts.length>0?`
    <div class="slabel">帳戶</div>
    <div class="acc-row" style="margin-bottom:12px">${state.accounts.map(acc=>
      `<button class="acc-pill${f.accountId===acc.id?' active':''}"
        style="--acc-c:${acc.color}" data-a="ef-acc" data-v="${acc.id}">${acc.icon} ${escHtml(acc.name)}</button>`
    ).join('')}</div>`:''}
    <div class="form-row">
      <div class="form-field"><label>日期</label>
        <input class="form-input" id="ef-date" type="date" value="${f.date||''}"></div>
      <div class="form-field"><label>備註</label>
        <input class="form-input" id="ef-note" type="text" placeholder="選填" value="${escHtml(f.note||'')}"></div>
    </div>
    <div class="modal-btns">
      <button class="save-btn" data-a="updateTx">儲存變更</button>
      <button class="outline-btn" data-a="closeModal">取消</button>
    </div>
  </div></div>`;
}

// ── RENDER: STATS ──────────────────────────────────────────────────────────
function renderStatsView(){
  if(state.statsView==='year')return renderYearStatsView();
  if(state.statsView==='history')return renderHistView();

  const{y,m}=state.statsMonth;
  const txs=monthTxs(y,m);const sum=calcSum(txs);
  const catMap={};
  txs.filter(t=>t.type==='expense').forEach(t=>{catMap[t.category]=(catMap[t.category]||0)+t.amount;});
  const catArr=Object.entries(catMap).sort((a,b)=>b[1]-a[1]);
  const catCard=catArr.length>0?`<div class="card">
    <div class="card-title">支出類別</div>
    ${catArr.map(([id,amt])=>{
      const cat=getCat('expense',id);const budget=cat.budget||0;
      const pct=budget>0?Math.min(Math.round((amt/budget)*100),150):null;
      const cls=pct===null?'ok':pct<70?'ok':pct<100?'warn':'over';
      return`<div class="bar-wrap">
        <div class="bar-lbl"><span>${cat.icon} ${escHtml(cat.name)}</span><span style="font-weight:800">$${fmt(amt)}</span></div>
        <div class="bar-bg"><div class="bar-fill ${cls}" style="width:${budget>0?Math.min(pct,100):Math.round((amt/(catArr[0][1]||1))*100)}%"></div></div>
        ${budget>0?`<div class="budget-note">預算 $${fmt(budget)} · 已用 ${pct}%${pct>=100?' ⚠️':''}</div>`:''}
      </div>`;
    }).join('')}
  </div>`:'';
  const allMonths=[];
  {const ms=new Set(state.txs.map(t=>{const d=new Date(t.date);return`${d.getFullYear()}-${d.getMonth()}`}));
  const now=new Date();ms.add(`${now.getFullYear()}-${now.getMonth()}`);
  Array.from(ms).sort().reverse().forEach(k=>{const[ky,km]=k.split('-').map(Number);allMonths.push({y:ky,m:km});});}

  const PIE_COLORS=['#C8A5A3','#8090A8','#8DAD93','#C49830','#8B6CC8','#C45555','#4AA8A8','#C87840','#6080C8','#A8C460','#C870A8','#50A870','#C85050','#5090C8','#C8A050','#9050C8'];
  const secTitle=(t)=>`<div style="font-size:17px;font-weight:900;color:var(--text);padding:0 2px;margin-bottom:6px;margin-top:4px">${t}</div>`;
  return`<div class="hdr"><div class="hdr-in">
    <div class="hdr-row">
      <h1>統計</h1>
      <select id="stats-month-sel" class="stats-sel">
        ${allMonths.map(({y:my,m:mm})=>`<option value="${my}-${mm}" ${state.statsMonth.y===my&&state.statsMonth.m===mm?'selected':''} style="color:#2D1A0E;background:white">${my}年 ${MONTHS[mm]}</option>`).join('')}
      </select>
    </div>
    <div class="sum-bar">
      <div class="sum-item"><div class="lbl">收入</div><div class="val">$${fmt(sum.income)}</div></div>
      <div class="sum-item"><div class="lbl">支出</div><div class="val">$${fmt(sum.expense)}</div></div>
      <div class="sum-item"><div class="lbl">結餘</div>
        <div class="val" style="color:${sum.balance>=0?'#1A7A50':'#B02828'}">$${fmt(sum.balance)}</div>
      </div>
    </div>
  </div></div>
  <div class="content">
    <div class="stabs" style="margin-bottom:16px">
      <button class="stab active" data-a="statsView" data-v="month">月統計</button>
      <button class="stab" data-a="statsView" data-v="year">年統計</button>
      <button class="stab" data-a="statsView" data-v="history">明細</button>
    </div>
    ${txs.length===0?`<div class="empty" style="padding:60px 20px">
      <div style="width:64px;height:64px;border-radius:18px;background:var(--surface);border:2px solid var(--border);margin:0 auto 16px;display:flex;align-items:center;justify-content:center">
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="20" width="7" height="11" rx="2.5" style="fill:var(--p)"/>
          <rect x="13" y="12" width="7" height="19" rx="2.5" style="fill:var(--p2)"/>
          <rect x="23" y="5" width="7" height="26" rx="2.5" style="fill:var(--p3)"/>
        </svg>
      </div>
      <p>本月還沒有記錄</p>
    </div>`:`
    ${catArr.length>0?`
    <div style="display:flex;gap:10px;margin-bottom:6px;margin-top:4px">
      <div style="flex:1;font-size:17px;font-weight:900;color:var(--text)">支出分布</div>
      <div style="flex:1;font-size:17px;font-weight:900;color:var(--text)">支出類別</div>
    </div>
    <div style="display:flex;gap:10px;align-items:stretch;margin-bottom:16px">
      <div class="card" style="flex:1;min-width:0">
        <canvas id="cat-pie" width="160" height="160" style="display:block;margin:0 auto 10px;width:160px;height:160px"></canvas>
        <div style="display:flex;flex-wrap:wrap;justify-content:flex-start;gap:6px 0;row-gap:6px">
          ${catArr.map(([id,amt],i)=>{
            const cat=getCat('expense',id);
            const pct=Math.round((amt/sum.expense)*100);
            return`<div style="display:flex;align-items:center;gap:4px;width:33%;justify-content:center">
              <div style="width:8px;height:8px;border-radius:50%;background:${PIE_COLORS[i%6]};flex-shrink:0"></div>
              <span style="font-size:12px;font-weight:600;white-space:nowrap">${cat.icon} ${escHtml(cat.name)} <b>${pct}%</b></span>
            </div>`;
          }).join('')}
        </div>
      </div>
      <div class="card" style="flex:1;min-width:0">
        ${catArr.map(([id,amt])=>{
          const cat=getCat('expense',id);const budget=cat.budget||0;
          const pct=budget>0?Math.min(Math.round((amt/budget)*100),150):null;
          const cls=pct===null?'ok':pct<70?'ok':pct<100?'warn':'over';
          return`<div class="bar-wrap">
            <div class="bar-lbl"><span>${cat.icon} ${escHtml(cat.name)}</span><span style="font-weight:800">$${fmt(amt)}</span></div>
            <div class="bar-bg"><div class="bar-fill ${cls}" style="width:${budget>0?Math.min(pct,100):Math.round((amt/(catArr[0][1]||1))*100)}%"></div></div>
            ${budget>0?`<div class="budget-note">預算 $${fmt(budget)} · 已用 ${pct}%${pct>=100?' ⚠️':''}</div>`:''}
          </div>`;
        }).join('')}
      </div>
    </div>`:''}
    ${secTitle('月底總結')}
    ${renderSumContent({y,m})}`}
  </div>`;
}

function renderSumContent({y,m}){
  const txs=monthTxs(y,m);const sum=calcSum(txs);
  const sr=sum.income>0?Math.round((sum.balance/sum.income)*100):0;
  const wr=sum.expense>0?Math.round((sum.want/sum.expense)*100):0;
  const catMap={};txs.filter(t=>t.type==='expense').forEach(t=>{catMap[t.category]=(catMap[t.category]||0)+t.amount;});
  const top=Object.entries(catMap).sort((a,b)=>b[1]-a[1])[0];
  const insights=[];
  if(!txs.length)insights.push('本月還沒有記錄，快去新增第一筆吧！');
  else{
    if(sum.income===0)insights.push('本月尚未記錄收入，記得把薪資也加進來。');
    else if(sr>=30)insights.push(`太棒了！本月儲蓄率高達 ${sr}%，財務管理非常優秀！`);
    else if(sr>=20)insights.push(`不錯！儲蓄率 ${sr}%，已達 20% 目標。`);
    else if(sr>=0)insights.push(`儲蓄率 ${sr}%，建議目標設在 20% 以上。`);
    else insights.push(`⚠️ 本月超支 $${fmt(-sum.balance)}，要注意控制花費。`);
    if(sum.expense>0){
      if(wr>50)insights.push(`「想要」支出佔 ${wr}%，超過半數為非必要消費，可試著減少衝動購物。`);
      else if(wr>0)insights.push(`「想要」支出佔比 ${wr}%，消費自律做得不錯！`);
    }
    if(top){const cat=getCat('expense',top[0]);insights.push(`最大支出是「${escHtml(cat.name)}」，共 $${fmt(top[1])}，佔總支出 ${Math.round((top[1]/(sum.expense||1))*100)}%。`);}
  }
  return`<div class="card" style="margin-top:0">
    <div class="sum-grid">
      <div class="sum-metric"><div class="ml">總收入</div><div class="mv i">$${fmt(sum.income)}</div></div>
      <div class="sum-metric"><div class="ml">總支出</div><div class="mv e">$${fmt(sum.expense)}</div></div>
      <div class="sum-metric"><div class="ml">結餘</div><div class="mv ${sum.balance>=0?'i':'e'}">$${fmt(sum.balance)}</div></div>
      <div class="sum-metric"><div class="ml">儲蓄率</div><div class="mv p">${sr}%</div></div>
      <div class="sum-metric"><div class="ml">必要支出</div><div class="mv n">$${fmt(sum.nec)}</div></div>
      <div class="sum-metric"><div class="ml">想要購買</div><div class="mv w">$${fmt(sum.want)}</div></div>
    </div>
    ${insights.map(i=>`<div class="insight"><div class="it">💡 分析</div><p>${i}</p></div>`).join('')}
  </div>`;
}

function renderSumModal({y,m}){
  return`<div class="overlay" id="modal-overlay"><div class="modal" style="max-height:82vh">
    <div class="modal-handle"></div>
    <div class="modal-title">${y}年 ${MONTHS[m]} 月底總結</div>
    ${renderSumContent({y,m}).replace('<div class="card" style="margin-top:12px">','<div>').replace('<div class="card-title">月底總結</div>','')}
  </div></div>`;
}

// ── RENDER: HISTORY ────────────────────────────────────────────────────────
function renderHistView(){
  const now=new Date();
  const period=state.histPeriod||'month';
  const periods=[{id:'month',lbl:'本月'},{id:'prev',lbl:'上月'},{id:'3m',lbl:'近三月'},{id:'all',lbl:'全部'},{id:'custom',lbl:'自訂'}];
  const filters=[{id:'all',lbl:'全部'},{id:'expense',lbl:'支出'},{id:'income',lbl:'收入'},
    {id:'transfer',lbl:'轉帳'},{id:'必要',lbl:'必要'},{id:'想要',lbl:'想要'}];
  let list=[...activeTxs()];
  if(period==='month'){list=list.filter(t=>{const d=new Date(t.date);return d.getFullYear()===now.getFullYear()&&d.getMonth()===now.getMonth();});}
  else if(period==='prev'){let pm=now.getMonth()-1,py=now.getFullYear();if(pm<0){pm=11;py--;}list=list.filter(t=>{const d=new Date(t.date);return d.getFullYear()===py&&d.getMonth()===pm;});}
  else if(period==='3m'){const cut=new Date();cut.setMonth(cut.getMonth()-3);list=list.filter(t=>new Date(t.date+'T00:00:00')>=cut);}
  else if(period==='custom'){
    if(state.histFrom)list=list.filter(t=>t.date>=state.histFrom);
    if(state.histTo)list=list.filter(t=>t.date<=state.histTo);
  }
  if(state.histFilter==='income')list=list.filter(t=>t.type==='income');
  else if(state.histFilter==='expense')list=list.filter(t=>t.type==='expense');
  else if(state.histFilter==='transfer')list=list.filter(t=>t.type==='transfer');
  else if(state.histFilter==='必要')list=list.filter(t=>t.necessity==='必要');
  else if(state.histFilter==='想要')list=list.filter(t=>t.necessity==='想要');
  if(state.histAccFilter){const aid=state.histAccFilter;list=list.filter(t=>t.accountId===aid||t.fromAccountId===aid||t.toAccountId===aid);}
  const groups={};list.forEach(t=>{(groups[t.date]=groups[t.date]||[]).push(t);});
  const dates=Object.keys(groups).sort((a,b)=>b.localeCompare(a));
  return`<div class="hdr"><div class="hdr-in">
    <div class="hdr-row">
      <h1>統計</h1>
      <div class="sub">共 ${list.length} 筆</div>
    </div>
  </div></div>
  <div class="content">
    <div class="stabs" style="margin-bottom:16px">
      <button class="stab" data-a="statsView" data-v="month">月統計</button>
      <button class="stab" data-a="statsView" data-v="year">年統計</button>
      <button class="stab active" data-a="statsView" data-v="history">明細</button>
    </div>
    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:8px">
      ${periods.map(p=>`<div class="chip${period===p.id?' ac':''}" data-a="histPeriod" data-v="${p.id}">${p.lbl}</div>`).join('')}
      ${period==='custom'?`
      <input type="date" id="hist-from" style="width:130px;padding:5px 8px;border:2px solid var(--border);border-radius:20px;font-size:13px;font-family:inherit;outline:none;background:white;color:var(--text)" value="${state.histFrom}">
      <span style="font-size:13px;color:var(--text2);flex-shrink:0">～</span>
      <input type="date" id="hist-to" style="width:130px;padding:5px 8px;border:2px solid var(--border);border-radius:20px;font-size:13px;font-family:inherit;outline:none;background:white;color:var(--text)" value="${state.histTo}">
      <button data-a="histSearch" style="padding:5px 14px;border:2px solid var(--p);border-radius:20px;background:var(--p);color:white;font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;white-space:nowrap">搜尋</button>`:''}
    </div>
    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:8px">
      ${filters.map(f=>`<div class="chip${state.histFilter===f.id?' ac':''}" data-a="filt" data-v="${f.id}">${f.lbl}</div>`).join('')}
      ${state.accounts.length>0?`<select id="hist-acc-sel" style="margin-left:auto;padding:5px 14px;border:2px solid ${state.histAccFilter?'var(--p)':'var(--border)'};border-radius:20px;background:${state.histAccFilter?'var(--p)':'white'};color:${state.histAccFilter?'white':'var(--text)'};font-size:13px;font-weight:700;font-family:inherit;outline:none;cursor:pointer;-webkit-appearance:none;appearance:none">
        <option value="">所有帳戶</option>
        ${state.accounts.map(a=>`<option value="${a.id}"${state.histAccFilter===a.id?' selected':''}>${escHtml(a.name)}</option>`).join('')}
      </select>`:''}
    </div>

    ${list.length===0?`<div class="empty"><div class="ei">📭</div><p>沒有符合的記錄</p></div>`:
      dates.map(date=>{
        const dt=groups[date];
        const de=dt.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
        const di=dt.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
        const dd=new Date(date+'T00:00:00');
        const rel=relDate(date);
        return`<div class="day-hdr">
          <span>${dd.getMonth()+1}/${dd.getDate()}</span>
          <span>${di>0?`<span style="color:var(--income)">+$${fmt(di)} </span>`:''}${de>0?`<span style="color:var(--expense)">-$${fmt(de)}</span>`:''}</span>
        </div>
        <div class="card" style="margin-bottom:14px">${dt.map(t=>txItem(t,true,false)).join('')}</div>`;
      }).join('')
    }
  </div>`;
}

// ── RENDER: SETTINGS ───────────────────────────────────────────────────────
function renderSettingsView(){
  const nick=state.nickname||'';

  if(state.settingsTab==='categories'){
    const showType=state.catTypeTab;
    const rows=state.cats[showType].map(cat=>`
    <div class="setting-row">
      <div class="setting-ico" style="background:var(--bg);border:1px solid var(--border)">${cat.icon}</div>
      <div class="setting-info">
        <div class="setting-name">${escHtml(cat.name)}${cat.subcats?.length>0?` <span style="font-size:12px;color:var(--text2)">(${cat.subcats.length}子類)</span>`:''}</div>
        <div class="setting-sub">${cat.budget>0?`${state.budgetMode==='week'?'週':'月'}預算 $${fmt(cat.budget)}`:'不設預算'}</div>
      </div>
      <div class="setting-actions">
        <button class="icon-btn edit" data-a="editCat" data-v="${showType}:${cat.id}">···</button>
        <button class="icon-btn del" data-a="delCat" data-v="${showType}:${cat.id}">🗑️</button>
      </div>
    </div>`).join('');
    return`<div class="hdr"><div class="hdr-in">
      <div class="hdr-row">
        <div><h1>類別管理</h1></div>
        <button class="back-btn" data-a="stab" data-v="main">返回</button>
      </div>
    </div></div>
    <div class="content">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
        <div class="stabs" style="flex:1;margin-bottom:0">
          <button class="stab${showType==='expense'?' active':''}" data-a="setCatType" data-v="expense">支出類別</button>
          <button class="stab${showType==='income'?' active':''}" data-a="setCatType" data-v="income">收入類別</button>
        </div>
        ${showType==='expense'?`<div style="display:flex;gap:4px;flex-shrink:0">
          <button class="stab${(state.budgetMode||'month')==='month'?' active':''}" style="padding:6px 12px;font-size:13px" data-a="setBudgetMode" data-v="month">月</button>
          <button class="stab${(state.budgetMode||'month')==='week'?' active':''}" style="padding:6px 12px;font-size:13px" data-a="setBudgetMode" data-v="week">週</button>
        </div>`:''}
      </div>
      <button class="add-fab" data-a="newCat" data-v="${showType}" style="margin-bottom:12px">＋ 新增類別</button>
      <div class="card">${rows}</div>
    </div>`;
  }

  if(state.settingsTab==='fixed'){
    const freqLabel={monthly:'每月',quarterly:'每季',yearly:'每年'};
    const monthlyEq=state.fixedExpenses.reduce((s,f)=>{
      if(f.frequency==='monthly')return s+f.amount;
      if(f.frequency==='quarterly')return s+f.amount/3;
      if(f.frequency==='yearly')return s+f.amount/12;return s;},0);
    const activeBooks=(state.books||[]).filter(b=>!b.isArchived);
    const multiBook=activeBooks.length>1;
    function fixedRow(f){
      const acc=getAcc(f.accountId);
      return`<div class="setting-row" style="${f.active===false?'opacity:.5':''}">
        <div class="setting-ico" style="background:var(--bg);border:1px solid var(--border)">${f.icon}</div>
        <div class="setting-info"><div class="setting-name">${escHtml(f.name)}${f.active===false?` <span style="font-size:11px;color:var(--text2);font-weight:600">暫停中</span>`:''}</div>
          <div class="setting-sub">${freqLabel[f.frequency]||'每月'} · $${fmt(f.amount)}${f.nextDate?' · 下次 '+f.nextDate.slice(5):''}${f.accountId&&acc.name?' · '+escHtml(acc.icon)+escHtml(acc.name):''}</div></div>
        <div style="display:flex;align-items:center;gap:6px">
          <button class="sw ${f.active===false?'off':'on'}" data-a="toggleFixed" data-v="${f.id}"></button>
          <button class="icon-btn edit" data-a="editFixed" data-v="${f.id}">···</button>
          <button class="icon-btn del" data-a="delFixed" data-v="${f.id}">🗑️</button>
        </div>
      </div>`;
    }
    let fixedContent;
    if(multiBook){
      const bookCards=activeBooks.map(book=>{
        const items=state.fixedExpenses.filter(f=>f.bookId===book.id);
        if(!items.length)return'';
        return`<div style="margin-bottom:12px">
          <div class="ins-group-hdr">${book.icon} ${escHtml(book.name)}</div>
          <div class="card">${items.map(fixedRow).join('')}</div>
        </div>`;
      }).join('');
      const unassigned=state.fixedExpenses.filter(f=>!f.bookId||!activeBooks.find(b=>b.id===f.bookId));
      const unassignedCard=unassigned.length?`<div style="margin-bottom:12px">
        <div class="ins-group-hdr">📋 未指定帳本</div>
        <div class="card">${unassigned.map(fixedRow).join('')}</div>
      </div>`:'';
      fixedContent=(bookCards+unassignedCard)||`<div class="empty" style="padding:24px 0"><div class="ei" style="font-size:36px">📋</div><p>尚無固定費用</p></div>`;
    }else{
      const rows=state.fixedExpenses.map(fixedRow).join('');
      fixedContent=`<div class="card">${rows||`<div class="empty" style="padding:24px 0"><div class="ei" style="font-size:36px">📋</div><p>尚無固定費用</p></div>`}</div>`;
    }
    return`<div class="hdr"><div class="hdr-in">
      <div class="hdr-row">
        <div><h1>固定費用</h1>
          ${monthlyEq>0?`<div style="font-size:13px;opacity:.85;margin-top:2px">每月約 $${fmt(Math.round(monthlyEq))}</div>`:''}
        </div>
        <button class="back-btn" data-a="stab" data-v="main">返回</button>
      </div>
    </div></div>
    <div class="content">
      <button class="add-fab" data-a="newFixed" style="margin-bottom:12px">＋ 新增固定費用</button>
      ${fixedContent}
    </div>`;
  }

  if(state.settingsTab==='books')return renderBooksView();
  if(state.settingsTab==='acctypes')return renderAccTypesView();
  if(state.settingsTab==='theme')return renderThemeView();

  if(state.settingsTab==='reset'){
    return`<div class="hdr"><div class="hdr-in">
      <div class="hdr-row">
        <div><h1>重設記帳</h1></div>
        <button class="back-btn" data-a="stab" data-v="main">返回</button>
      </div>
    </div></div>
    <div class="content">
      <div class="card" style="margin-bottom:12px">
        <div class="card-title">刪除範圍</div>
        <div class="setting-row" style="padding:10px 0">
          <div class="setting-ico" style="background:#FFF0F0;border:1px solid #FADADA">💸</div>
          <div class="setting-info"><div class="setting-name">所有交易記錄與貸款</div><div class="setting-sub">全部收入、支出、轉帳、貸款記錄</div></div>
        </div>
        <div class="setting-row" style="padding:10px 0;border-bottom:none">
          <div class="setting-ico" style="background:#FFF0F0;border:1px solid #FADADA">📚</div>
          <div class="setting-info"><div class="setting-name">預設帳本以外的帳本</div><div class="setting-sub">共同帳本、個人副帳本全部刪除</div></div>
        </div>
      </div>
      <div class="card" style="background:#FFF8F8;border-color:#FADADA;margin-bottom:16px">
        <div style="font-size:13px;color:var(--expense);font-weight:700;margin-bottom:6px">⚠️ 注意</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.7">無法復原。預設帳本保留但資料清空，帳戶設定、類別設定、外觀設定不受影響。</div>
      </div>
      <button class="save-btn" style="background:linear-gradient(135deg,#C45555,#D46868)" data-a="confirmReset">🗑️ 刪除所有記帳資料</button>
    </div>`;
  }
  if(state.settingsTab==='export'){
    const now=new Date();
    const firstDay=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`;
    const lastDay=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(new Date(now.getFullYear(),now.getMonth()+1,0).getDate()).padStart(2,'0')}`;
    const ef=state.exportForm||{start:firstDay,end:lastDay,bookId:'all'};
    const books=[{id:'all',name:'全部帳本'},...(state.books||[]).filter(b=>!b.isArchived).map(b=>({id:b.id,name:b.name}))];
    return`<div class="hdr"><div class="hdr-in">
      <div class="hdr-row">
        <div><h1>匯出資料</h1></div>
        <button class="back-btn" data-a="stab" data-v="main">返回</button>
      </div>
    </div></div>
    <div class="content">
      <div class="card" style="margin-bottom:12px">
        <div class="card-title">匯出交易記錄（CSV）</div>
        <div class="form-row" style="margin-bottom:14px">
          <div class="form-field"><label>開始日期</label>
            <input class="form-input" type="date" id="export-start" value="${ef.start}"></div>
          <div class="form-field"><label>結束日期</label>
            <input class="form-input" type="date" id="export-end" value="${ef.end}"></div>
        </div>
        <div class="slabel">帳本</div>
        <div class="acc-row" style="flex-wrap:wrap;margin-bottom:0">
          ${books.map(b=>`<button class="acc-pill${(ef.bookId||'all')===b.id?' active':''}" style="--acc-c:var(--p)" data-a="exportBook" data-v="${b.id}">${escHtml(b.name)}</button>`).join('')}
        </div>
      </div>
      <div class="card" style="background:var(--surface);margin-bottom:16px">
        <div style="font-size:13px;color:var(--text2);line-height:1.8">
          格式：CSV（可用 Excel、Numbers 開啟）<br>
          欄位：日期、類型、類別、金額、帳戶、必要/想要、備註、帳本
        </div>
      </div>
      <button class="save-btn green" data-a="doExport">📤 匯出 CSV</button>
    </div>`;
  }
  if(state.settingsTab==='backup'){
    return`<div class="hdr"><div class="hdr-in">
      <div class="hdr-row">
        <div><h1>手動備份</h1></div>
        <button class="back-btn" data-a="stab" data-v="main">返回</button>
      </div>
    </div></div>
    <div class="content">
      <div class="card" style="margin-bottom:12px">
        <div style="font-size:13px;color:var(--text2);line-height:1.8;margin-bottom:12px">包含所有帳戶、交易、類別、帳本、固定費用、貸款、保險及保單附件。建議每次大改前先匯出一份。</div>
        <button class="save-btn" data-a="doFullExport" style="margin-bottom:8px">📦 匯出完整備份</button>
        <button class="outline-btn" data-a="doFullImport">📥 還原備份</button>
        <input type="file" id="backup-import-input" accept=".json" style="display:none">
      </div>
    </div>`;
  }
  const sectionLabels={currency:'幣別管理',guide:'使用說明'};
  if(sectionLabels[state.settingsTab]){
    return`<div class="hdr"><div class="hdr-in">
      <div class="hdr-row">
        <div><h1>${sectionLabels[state.settingsTab]}</h1></div>
        <button class="back-btn" data-a="stab" data-v="main">返回</button>
      </div>
    </div></div>
    <div class="content"><div class="card" style="text-align:center;padding:40px 20px">
      <div style="font-size:48px;margin-bottom:12px">🚧</div>
      <div style="font-size:16px;font-weight:700;margin-bottom:6px">此功能開發中</div>
      <div style="font-size:14px;color:var(--text2)">敬請期待！</div>
    </div></div>`;
  }

  // Main menu
  const menuGroups=[
    [
      {id:'books',ico:'📚',name:'帳本管理'},
      {id:'acctypes',ico:'🏷️',name:'帳戶類型'},
      {id:'categories',ico:'📂',name:'類別管理'},
      {id:'fixed',ico:'📋',name:'固定費用'},
      {id:'currency',ico:'💱',name:'幣別管理'},
    ],
    [
      {id:'theme',ico:'🎨',name:'主題風格'},
    ],
    [
      {id:'export',ico:'📤',name:'匯出資料'},
      {id:'backup',ico:'📦',name:'手動備份'},
      {id:'reset',ico:'🗑️',name:'重設記帳'},
    ],
    [
      {id:'guide',ico:'📖',name:'使用說明'},
    ],
  ];
  function menuRow(item){return`
    <div class="setting-row" style="cursor:pointer;padding:9px 0" data-a="stab" data-v="${item.id}">
      <div class="setting-ico" style="width:38px;height:38px;border-radius:11px;background:var(--bg);border:1px solid var(--border)">${item.ico}</div>
      <div class="setting-info"><div class="setting-name">${item.name}</div></div>
      <span style="color:var(--text2);font-size:20px;padding-right:2px">›</span>
    </div>`;}
  return`<div class="content" style="padding-top:20px">
    <div class="nick-block">
      <div class="nick-avatar">🐱</div>
      <div style="flex:1;display:flex;align-items:center;gap:10px">
        <span style="font-size:16px;font-weight:700">${escHtml(nick)||'使用者暱稱'}</span>
        <button class="icon-btn edit" data-a="openNickModal" style="background:transparent;border:none;flex-shrink:0;color:rgba(255,255,255,.85)">···</button>
      </div>
    </div>
    ${menuGroups.map(group=>`<div class="card" style="margin-bottom:12px">${group.map(menuRow).join('')}</div>`).join('')}
  </div>`;
}

// ── RENDER: THEME ──────────────────────────────────────────────────────────
function renderThemeView(){
  const cur=state.theme||'pink';
  const curF=state.fontStyle||'huninn';
  const themeCards=Object.entries(THEMES).map(([id,t])=>{
    const sel=cur===id;
    return`<div data-a="setTheme" data-v="${id}" style="cursor:pointer;border-radius:14px;border:2.5px solid ${sel?'var(--text)':'var(--border)'};overflow:hidden;transition:all .2s${sel?';box-shadow:0 3px 14px var(--shadow)':''}">
      <div style="height:38px;background:${t.vars['--hdr-grad']}"></div>
      <div style="padding:10px 12px;background:${sel?'var(--surface)':'var(--bg)'}">
        <div style="display:flex;gap:5px;margin-bottom:7px">
          ${t.swatches.map(c=>`<div style="width:13px;height:13px;border-radius:50%;background:${c}"></div>`).join('')}
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between">
          <span style="font-size:14px;font-weight:700;color:var(--text)">${t.name}</span>
          ${sel?`<span style="font-size:12px;font-weight:700;color:var(--text2)">✓ 使用中</span>`:''}
        </div>
      </div>
    </div>`;
  }).join('');
  const hidden=state.hiddenFonts||[];
  const fontCards=Object.entries(FONTS).filter(([id])=>!hidden.includes(id)).map(([id,f])=>{
    const sel=curF===id;
    return`<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
      <div data-a="setFont" data-v="${id}" style="cursor:pointer;padding:14px 16px;border-radius:14px;border:2.5px solid ${sel?'var(--text)':'var(--border)'};background:${sel?'var(--surface)':'var(--bg)'};transition:all .2s;flex:1;display:flex;align-items:center;justify-content:space-between">
        <div style="flex:1;min-width:0">
          <div style="font-size:17px;font-weight:700;color:var(--text);font-family:${f.family}">${f.name}</div>
          <div style="font-size:13px;color:var(--text2);font-family:${f.family};margin-top:4px">記帳本・支出・收入 Aa 123</div>
        </div>
        <div style="font-size:22px;color:${sel?'var(--text)':'var(--border)'};flex-shrink:0;margin-left:10px">${sel?'✓':'○'}</div>
      </div>
      ${id!=='system'?`<button data-a="deleteFont" data-v="${id}" style="flex-shrink:0;width:36px;height:36px;border:1.5px solid var(--border);border-radius:10px;background:var(--bg);cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center">🗑️</button>`:''}
    </div>`;
  }).join('');
  return`<div class="hdr"><div class="hdr-in">
    <div class="hdr-row">
      <div><h1>主題風格</h1></div>
      <button class="back-btn" data-a="stab" data-v="main">返回</button>
    </div>
  </div></div>
  <div class="content">
    <div class="card" style="margin-bottom:12px">
      <div class="card-title" style="margin-bottom:14px">主題色調</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${themeCards}</div>
    </div>
    <div class="card">
      <div class="card-title" style="margin-bottom:14px">字型</div>
      ${fontCards}
    </div>
  </div>`;
}

// ── RENDER: BOOKS ──────────────────────────────────────────────────────────
function renderBooksView(){
  const books=state.books||[];
  const active=books.filter(b=>!b.isArchived);
  const archived=books.filter(b=>b.isArchived);
  const curTab=state.booksTab||'active';
  function bookCard(b){
    const typeLbl=b.type==='shared'?'共同':'個人';
    const typeClass=b.type==='shared'?'shared':'personal';
    const dateStr=b.createdAt?(()=>{const d=new Date(b.createdAt+'T00:00:00');return`建立於 ${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;})():'';
    const syncStatus=b.roomCode?`<span style="font-size:11px;color:#4A78C4;font-weight:700;margin-left:4px"><span class="sync-dot" style="background:#4A78C4"></span>已連線</span>`:'';
    return`<div class="card" style="margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:12px">
        <div style="font-size:32px;background:var(--bg);border:1px solid var(--border);border-radius:12px;width:52px;height:52px;display:flex;align-items:center;justify-content:center;flex-shrink:0">${b.icon}</div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            <span style="font-size:16px;font-weight:700">${escHtml(b.name)}</span>
            ${b.isDefault?'<span class="book-badge personal">預設</span>':''}
            <span class="book-badge ${typeClass}">${typeLbl}</span>
            ${syncStatus}
          </div>
          <div style="font-size:12px;color:var(--text2);margin-top:3px">${b.currency||'TWD'}${dateStr?' · '+dateStr:''}</div>
        </div>
        <div style="flex-shrink:0">
          <button class="icon-btn" data-a="openBookMenu" data-v="${b.id}" style="background:var(--bg);border:1.5px solid var(--border);font-size:16px;font-weight:900;letter-spacing:1px;color:var(--text2)">···</button>
        </div>
      </div>
    </div>`;
  }
  const list=curTab==='active'?active:archived;
  return`<div class="hdr"><div class="hdr-in">
    <div class="hdr-row">
      <div><h1>帳本管理</h1></div>
      <button class="back-btn" data-a="stab" data-v="main">返回</button>
    </div>
  </div></div>
  <div class="content">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
      <div class="stabs" style="flex:1;margin-bottom:0">
        <button class="stab${curTab==='active'?' active':''}" data-a="booksTab" data-v="active">使用中 (${active.length})</button>
        <button class="stab${curTab==='archived'?' active':''}" data-a="booksTab" data-v="archived">封存 (${archived.length})</button>
      </div>
    </div>
    <button class="add-fab" data-a="newBook" style="margin-bottom:12px">＋ 新增帳本</button>
    ${list.length>0?list.map(bookCard).join(''):
      `<div class="empty" style="padding:40px 20px"><div class="ei" style="font-size:40px">${curTab==='active'?'📒':'📦'}</div><p>${curTab==='active'?'尚無使用中的帳本':'沒有封存的帳本'}</p></div>`
    }
  </div>`;
}
// ── RENDER: ACC TYPES ──────────────────────────────────────────────────────
function renderAccTypesView(){
  const types=state.accTypes||DEFAULT_ACC_TYPES;
  const rows=types.map((tp,i)=>`<div class="setting-row">
    <div class="setting-ico" style="background:var(--bg);border:1px solid var(--border);font-size:22px">${tp.icon}</div>
    <div class="setting-info"><div class="setting-name">${escHtml(tp.name)}</div></div>
    <div class="setting-actions">
      <button class="icon-btn edit" data-a="editAccType" data-v="${i}">···</button>
      <button class="icon-btn del" data-a="delAccType" data-v="${i}">🗑️</button>
    </div>
  </div>`).join('');
  return`<div class="hdr"><div class="hdr-in">
    <div class="hdr-row">
      <div><h1>帳戶類型</h1></div>
      <button class="back-btn" data-a="stab" data-v="main">返回</button>
    </div>
  </div></div>
  <div class="content">
    <button class="add-fab" data-a="newAccType" style="margin-bottom:12px">＋ 新增帳戶類型</button>
    <div class="card">${rows}</div>
  </div>`;
}
function renderEditAccTypeModal(){
  const f=state.editForm;
  return`<div class="overlay" id="modal-overlay"><div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title">${f._isNew?'新增帳戶類型':'編輯帳戶類型'}</div>
    <div class="form-row" style="margin-bottom:14px">
      <div class="form-field" style="max-width:76px"><label>圖示</label>
        <button class="icon-field" id="emoji-field-btn" data-a="toggleEmojiPicker" data-field="icon">${f.icon||'💰'}</button>
        <input id="ef-icon" type="hidden" value="${f.icon||''}">
      </div>
      <div class="form-field"><label>類型名稱</label>
        <input class="form-input" id="at-name" type="text" placeholder="例：儲值帳戶" value="${escHtml(f.name||'')}">
      </div>
    </div>
    <div id="emoji-picker-grid" class="emoji-grid" style="display:none;margin-bottom:14px">
      ${EMOJI_QUICK.map(e=>`<button class="emoji-btn${(f.icon||'')===e?' active':''}" data-a="pickEmoji" data-v="${e}">${e}</button>`).join('')}
    </div>
    <div class="modal-btns">
      <button class="save-btn" data-a="saveAccType">儲存</button>
      <button class="outline-btn" data-a="closeModal">取消</button>
    </div>
  </div></div>`;
}
function renderBookPickerModal(){
  const books=(state.books||[]).filter(b=>!b.isArchived);
  const cur=state.activeBook;
  function countTxs(bookId){
    const n=new Date();
    return state.txs.filter(t=>{
      if(bookId!=='all'&&t.bookId!==bookId)return false;
      const d=new Date(t.date);return d.getFullYear()===n.getFullYear()&&d.getMonth()===n.getMonth();
    }).length;
  }
  const allItem=`<div class="book-picker-item${cur==='all'?' active':''}" data-a="switchBook" data-v="all">
    <div class="book-picker-icon">📚</div>
    <div class="book-picker-info">
      <div class="book-picker-name">總帳本</div>
      <div class="book-picker-sub">顯示所有帳本的記錄・本月 ${countTxs('all')} 筆</div>
    </div>
    ${cur==='all'?'<span style="color:var(--p);font-size:20px">✓</span>':''}
  </div>`;
  const bookItems=books.map(b=>`<div class="book-picker-item${cur===b.id?' active':''}" data-a="switchBook" data-v="${b.id}">
    <div class="book-picker-icon">${b.icon}</div>
    <div class="book-picker-info">
      <div class="book-picker-name">${escHtml(b.name)}</div>
      <div class="book-picker-sub">${b.type==='shared'?'共同帳本':'個人帳本'} · ${b.currency||'TWD'} · 本月 ${countTxs(b.id)} 筆</div>
    </div>
    ${cur===b.id?'<span style="color:var(--p);font-size:20px">✓</span>':''}
  </div>`).join('');
  const joinSection=`<div id="join-room-section" style="display:none;margin-top:8px;padding:14px;background:var(--surface);border-radius:12px;border:1.5px solid var(--border)">
    <div style="font-size:13px;font-weight:700;color:var(--text2);margin-bottom:8px">輸入對方給你的 6 位房間碼</div>
    <input class="room-input" id="picker-join-code" maxlength="6" placeholder="房間碼" style="font-size:20px;padding:10px;margin-bottom:8px">
    <button class="save-btn green" data-a="joinRoomFromPicker">加入</button>
  </div>`;
  return`<div class="overlay" id="modal-overlay"><div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title">選擇帳本</div>
    <div class="book-picker-list">${allItem}${bookItems}
      <div class="book-picker-item" data-a="toggleJoinSection" style="border-style:dashed;background:transparent">
        <div class="book-picker-icon">📥</div>
        <div class="book-picker-info">
          <div class="book-picker-name">加入共同帳本</div>
          <div class="book-picker-sub">輸入房間碼加入對方的共同帳本</div>
        </div>
      </div>
      ${joinSection}
    </div>
    <button class="outline-btn" style="width:100%" data-a="closeModal">取消</button>
  </div></div>`;
}
function renderEditBookModal(){
  const f=state.editForm;
  const BOOK_ICONS=['📒','📓','📔','📕','📗','📘','📙','💼','🏠','✈️','🍱','💑','🎯','💰','🏋️'];
  const curType=f.type||'personal';
  const isExistingShared=f.id&&curType==='shared';
  let roomSection='';
  if(isExistingShared){
    if(f.roomCode){
      roomSection=`<div style="background:linear-gradient(135deg,#4A78C4,#5A9068);border-radius:14px;padding:16px;color:white;margin-bottom:14px">
        <div style="font-size:12px;opacity:.85;margin-bottom:4px">房間碼（傳給對方一起記帳）</div>
        <div class="room-code" style="font-size:28px;letter-spacing:5px;text-align:center;margin:8px 0;font-weight:800">${f.roomCode}</div>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button class="save-btn" style="flex:1;padding:10px;background:rgba(255,255,255,.22);box-shadow:none" data-a="copyBookRoomCode">複製</button>
          ${f.createdBy===DEVICE_ID
            ?`<button class="outline-btn" style="flex:1;padding:10px;border-color:rgba(255,100,100,.7);color:rgba(255,160,160,.95);background:transparent" data-a="disbandBookRoom" data-v="${f.id}">解散帳本</button>`
            :`<button class="outline-btn" style="flex:1;padding:10px;border-color:rgba(255,255,255,.4);color:rgba(255,255,255,.85);background:transparent" data-a="leaveBookRoom" data-v="${f.id}">退出房間</button>`
          }
        </div>
      </div>`;
    }else{
      roomSection=`<div style="margin-bottom:14px">
        <div class="slabel">房間碼</div>
        <p style="font-size:13px;color:var(--text2);margin-bottom:10px;line-height:1.6">建立後可把 6 位房間碼傳給對方，對方輸入後即可一起記帳，資料即時同步。</p>
        <button class="save-btn green" data-a="createBookRoom" data-v="${f.id}">建立房間碼</button>
      </div>`;
    }
  }
  return`<div class="overlay" id="modal-overlay"><div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title">${f.id?'帳本設定':'新增帳本'}</div>
    <div class="form-field" style="margin-bottom:14px"><label>帳本名稱</label>
      <input class="form-input" id="bk-name" type="text" placeholder="例：家用帳本" value="${escHtml(f.name||'')}"></div>
    <div class="slabel">圖示</div>
    <div class="acc-row" style="flex-wrap:wrap;margin-bottom:14px">${BOOK_ICONS.map(ic=>
      `<button class="acc-pill${(f.icon||'📒')===ic?' active':''}" style="--acc-c:var(--latte);font-size:20px;padding:8px 10px" data-a="pickBookIcon" data-v="${ic}">${ic}</button>`
    ).join('')}</div>
    <div class="slabel">帳本類型</div>
    <div class="type-chips" style="margin-bottom:14px">
      ${f.roomCode
        ?`<button class="type-chip active" style="opacity:.6;cursor:default">${curType==='shared'?'👥 共同帳本':'👤 個人帳本'}</button><span style="font-size:12px;color:var(--text2);margin-left:8px">退出或解散後才能變更</span>`
        :`<button class="type-chip${curType==='personal'?' active':''}" data-a="setBookType" data-v="personal">👤 個人帳本</button>
      <button class="type-chip${curType==='shared'?' active':''}" data-a="setBookType" data-v="shared">👥 共同帳本</button>`
      }
    </div>
    <div class="slabel">幣別</div>
    <div class="acc-row" style="margin-bottom:14px">
      ${['TWD','USD','JPY','EUR','HKD'].map(c=>
        `<button class="acc-pill${(f.currency||'TWD')===c?' active':''}" style="--acc-c:var(--latte)" data-a="setBookCurrency" data-v="${c}">${c}</button>`
      ).join('')}
    </div>
    ${roomSection}
    <button class="save-btn" data-a="saveBook" style="margin-bottom:8px">儲存</button>
    ${f.id&&!f.isDefault?`<div style="display:flex;gap:8px;margin-bottom:8px">
      ${!f.isArchived
        ?`<button class="outline-btn" style="flex:1;color:#B89360;border-color:#B89360" data-a="archiveBook" data-v="${f.id}">封存帳本</button>`
        :`<button class="outline-btn" style="flex:1;color:var(--income);border-color:var(--income)" data-a="unarchiveBook" data-v="${f.id}">取消封存</button>`
      }
      ${!(curType==='shared'&&f.roomCode)?`<button class="outline-btn" style="flex:1;color:var(--expense);border-color:var(--expense)" data-a="delBook" data-v="${f.id}">刪除帳本</button>`:''}
    </div>`:''}
    <button class="outline-btn" style="width:100%" data-a="closeModal">取消</button>
  </div></div>`;
}

function renderBookMenuModal(){
  const bk=(state.books||[]).find(b=>b.id===state.modal?.bookId);
  if(!bk)return'';
  const isArchived=bk.isArchived;
  return`<div class="overlay" id="modal-overlay"><div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title">${bk.icon} ${escHtml(bk.name)}</div>
    <button class="save-btn latte" style="margin-bottom:8px" data-a="editBook" data-v="${bk.id}">帳本設定</button>
    ${!isArchived
      ?`<button class="save-btn" style="margin-bottom:8px;background:linear-gradient(135deg,#B89360,#C9A87C)" data-a="archiveBook" data-v="${bk.id}">封存帳本</button>`
      :`<button class="save-btn" style="margin-bottom:8px;background:linear-gradient(135deg,#5A9068,#7AB888)" data-a="unarchiveBook" data-v="${bk.id}">取消封存</button>`
    }
    ${!bk.isDefault?(bk.type==='shared'&&bk.roomCode
      ?(bk.createdBy===DEVICE_ID
        ?`<button class="save-btn" style="margin-bottom:8px;background:linear-gradient(135deg,#C45555,#D46868)" data-a="disbandBookRoom" data-v="${bk.id}">解散帳本</button>`
        :`<button class="save-btn" style="margin-bottom:8px;background:linear-gradient(135deg,#B87878,#C89090)" data-a="leaveBookRoom" data-v="${bk.id}">退出帳本</button>`)
      :`<button class="save-btn" style="margin-bottom:8px;background:linear-gradient(135deg,#C45555,#D46868)" data-a="delBook" data-v="${bk.id}">刪除帳本</button>`):''}
    <button class="outline-btn" style="width:100%;margin-top:4px" data-a="closeModal">取消</button>
  </div></div>`;
}
function renderJoinRoomModal(){
  return`<div class="overlay" id="modal-overlay"><div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title">加入共同帳本</div>
    <p style="font-size:14px;color:var(--text2);margin-bottom:14px;line-height:1.6">輸入對方給你的 6 位房間碼，加入後只會顯示該共同帳本的記錄，你的其他帳本不受影響。</p>
    <input class="room-input" id="join-code-input" maxlength="6" placeholder="輸入房間碼" style="margin-bottom:14px">
    <button class="save-btn green" data-a="joinRoom">加入</button>
    <button class="outline-btn" style="margin-top:8px;width:100%" data-a="closeModal">取消</button>
  </div></div>`;
}
// ── RENDER: SETTINGS MODALS ────────────────────────────────────────────────
function renderEditAccModal(){
  const f=state.editForm;
  return`<div class="overlay" id="modal-overlay"><div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title">${f.id?'編輯帳戶':'新增帳戶'}</div>
    <div class="form-field" style="margin-bottom:14px"><label>帳戶名稱</label>
      <input class="form-input" id="ef-name" type="text" placeholder="例：台新銀行" value="${escHtml(f.name||'')}"></div>
    <div class="slabel">帳戶類型</div>
    <div class="type-chips" style="margin-bottom:14px">
      ${(state.accTypes||DEFAULT_ACC_TYPES).map(t=>`<button class="type-chip${(f.type||'bank')===t.id?' active':''}" data-a="efAccType" data-v="${t.id}">${t.icon} ${t.name}</button>`).join('')}
    </div>
    <div class="form-row">
      <div class="form-field" style="max-width:80px"><label>圖示</label>
        <button class="icon-field" id="emoji-field-btn" data-a="toggleEmojiPicker" data-field="icon">${f.icon||'🏦'}</button>
        <input id="ef-icon" type="hidden" value="${f.icon||''}"></div>
      <div class="form-field"><label>${(f.type||'bank')==='credit'?'初始欠款':'初始餘額'}</label>
        <input class="form-input" id="ef-init" type="number" inputmode="decimal" placeholder="0" value="${f.init||''}"></div>
    </div>
    <div id="emoji-picker-grid" class="emoji-grid" style="display:none;margin-bottom:14px">
      ${EMOJI_QUICK.map(e=>`<button class="emoji-btn${(f.icon||'')===e?' active':''}" data-a="pickEmoji" data-v="${e}">${e}</button>`).join('')}
    </div>
    ${(f.type||'bank')==='credit'?`
    <div class="form-field" style="margin-bottom:14px"><label>信用額度 (0 = 不設定)</label>
      <input class="form-input" id="ef-creditlimit" type="number" inputmode="decimal" placeholder="0" value="${f.creditLimit||''}"></div>
    <div class="form-row">
      <div class="form-field"><label>結帳日（每月幾號）</label>
        <input class="form-input" id="ef-billingday" type="number" inputmode="numeric" placeholder="例：25" value="${f.billingDay||''}"></div>
      <div class="form-field"><label>繳款截止日（每月幾號）</label>
        <input class="form-input" id="ef-paymentday" type="number" inputmode="numeric" placeholder="例：15" value="${f.paymentDay||''}"></div>
    </div>`:''}
    <div class="slabel">帳戶顏色</div>
    <div class="color-swatches" style="margin-bottom:14px">
      ${ACC_COLORS.map(c=>`<div class="swatch${(f.color||ACC_COLORS[0])===c?' sel':''}" style="background:${c}" data-a="efColor" data-v="${c}"></div>`).join('')}
    </div>
    <div class="modal-btns">
      <button class="save-btn" data-a="saveAcc">儲存</button>
      <button class="outline-btn" data-a="closeModal">取消</button>
    </div>
  </div></div>`;
}

function renderEditCatModal(){
  const f=state.editForm;
  const subcats=f.subcats||[];
  const editIdx=f.editingSubIdx??-1;
  const subcatRows=subcats.map((s,i)=>{
    if(editIdx===i){
      return`<div class="subcat-inline-form">
        <input class="icon-inp" id="ef-editsubicon" type="text" maxlength="4" placeholder="🏷️" value="${f.editSubIcon||s.icon||''}">
        <input id="ef-editsubname" type="text" placeholder="子類別名稱" value="${escHtml(f.editSubName||s.name||'')}">
        <button class="sm-btn" data-a="saveEditSub" data-v="${i}">✓</button>
        <button class="sm-btn cancel" data-a="cancelEditSub">✕</button>
      </div>`;
    }
    return`<div class="subcat-row-item">
      <span style="font-size:18px">${s.icon||'🏷️'}</span>
      <span class="sn">${escHtml(s.name)}</span>
      <button class="icon-btn edit" style="width:28px;height:28px;font-size:14px" data-a="startEditSub" data-v="${i}">···</button>
      <button class="icon-btn del" style="width:28px;height:28px;font-size:14px" data-a="delSub" data-v="${i}">🗑️</button>
    </div>`;
  }).join('');
  return`<div class="overlay" id="modal-overlay"><div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title">${f.id?'編輯類別':'新增類別'}</div>
    <div class="form-row">
      <div class="form-field"><label>類別名稱</label>
        <input class="form-input" id="ef-name" type="text" placeholder="例：娛樂" value="${escHtml(f.name||'')}"></div>
      <div class="form-field" style="max-width:80px"><label>圖示</label>
        <button class="icon-field" id="emoji-field-btn" data-a="toggleEmojiPicker" data-field="icon">${f.icon||'🏷️'}</button>
        <input id="ef-icon" type="hidden" value="${f.icon||''}">
      </div>
    </div>
    <div id="emoji-picker-grid" class="emoji-grid" style="display:none;margin-bottom:14px">
      ${EMOJI_QUICK.map(e=>`<button class="emoji-btn${f.icon===e?' active':''}" data-a="pickEmoji" data-v="${e}">${e}</button>`).join('')}
    </div>
    ${!f.id?`<div class="slabel">類型</div><div class="type-chips" style="margin-bottom:14px">
      <button class="type-chip${(f.catType||'expense')==='expense'?' active':''}" data-a="efCatType" data-v="expense">支出</button>
      <button class="type-chip${(f.catType||'expense')==='income'?' active':''}" data-a="efCatType" data-v="income">收入</button>
    </div>`:''}
    ${(f.catType||'expense')==='expense'?`
    <div class="form-field" style="margin-bottom:14px"><label>${state.budgetMode==='week'?'週':'月'}預算 (0=不限制)</label>
      <input class="form-input" id="ef-budget" type="number" inputmode="decimal" placeholder="0" value="${f.budget||''}"></div>`:''}
    <div class="slabel">子類別</div>
    <div class="subcat-list">${subcatRows||'<div style="font-size:13px;color:var(--text2);padding:6px 0">尚無子類別</div>'}</div>
    <div class="subcat-inline-form" style="border-bottom:none;padding-bottom:0">
      <input class="icon-inp" id="ef-subicon" type="text" maxlength="4" placeholder="🏷️" value="${f.newSubIcon||''}">
      <input id="ef-subname" type="text" placeholder="新增子類別名稱" value="${f.newSubName||''}">
      <button class="sm-btn" data-a="addSubcat">＋</button>
    </div>
    <div class="modal-btns">
      <button class="save-btn" data-a="saveCat">儲存類別</button>
      <button class="outline-btn" data-a="closeModal">取消</button>
    </div>
  </div></div>`;
}

function renderEditEFModal(){
  const f=state.editForm;
  const autoTarget=calcEFTarget();
  const autoHint=autoTarget>0?Math.round(autoTarget).toLocaleString('zh-TW')+'元（以過去3個月推估）':'0';
  return`<div class="overlay" id="modal-overlay"><div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title">設定緊急預備金</div>
    <div class="slabel">連結帳戶</div>
    <div class="acc-row" style="margin-bottom:14px;flex-wrap:wrap">
      <button class="acc-pill${!f.accountId?' active':''}" style="--acc-c:#8C6A50" data-a="ef-efacc" data-v="">不連結</button>
      ${state.accounts.map(acc=>
        `<button class="acc-pill${f.accountId===acc.id?' active':''}"
          style="--acc-c:${acc.color}" data-a="ef-efacc" data-v="${acc.id}">${acc.icon} ${escHtml(acc.name)}</button>`
      ).join('')}
    </div>
    <div class="form-field" style="margin-bottom:14px">
      <label>目標金額（留空 = 使用推算值）</label>
      <input class="form-input" id="ef-target" type="text" inputmode="decimal"
        placeholder="${autoHint}" value="${f.targetAmount||''}"></div>
    <div class="insight"><div class="it">💡 說明</div>
      <p>緊急預備金金額建議為 6 個月生活開銷。連結帳戶的餘額即為緊急預備金金額；目標未填則自動以過去 3 個月平均支出推算。</p>
    </div>
    <div class="modal-btns">
      <button class="save-btn" data-a="saveEF">儲存</button>
      <button class="outline-btn" data-a="closeModal">取消</button>
    </div>
  </div></div>`;
}

function renderEditDFModal(){
  const f=state.editForm;
  return`<div class="overlay" id="modal-overlay"><div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title">🌟 設定夢想基金</div>
    <div class="form-field" style="margin-bottom:14px"><label>願望名稱</label>
      <input class="form-input" id="df-wish" type="text" placeholder="例：買新電腦、旅遊日本" value="${escHtml(f.wish||'')}"></div>
    <div class="form-field" style="margin-bottom:14px"><label>目標金額</label>
      <input class="form-input" id="df-target" type="number" inputmode="decimal" placeholder="0" value="${f.target||''}"></div>
    <div class="slabel">連結帳戶（錢存在此帳戶）</div>
    <div class="acc-row" style="margin-bottom:14px;flex-wrap:wrap">
      <button class="acc-pill${!f.accountId?' active':''}" style="--acc-c:#8C6A50" data-a="df-acc" data-v="">不連結</button>
      ${state.accounts.map(acc=>
        `<button class="acc-pill${f.accountId===acc.id?' active':''}"
          style="--acc-c:${acc.color}" data-a="df-acc" data-v="${acc.id}">${acc.icon} ${escHtml(acc.name)}</button>`
      ).join('')}
    </div>
    <div class="modal-btns">
      <button class="save-btn green" data-a="saveDF">儲存</button>
      <button class="outline-btn" data-a="closeModal">取消</button>
    </div>
  </div></div>`;
}

function renderNickModal(){
  return`<div class="overlay" id="modal-overlay"><div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title">編輯暱稱</div>
    <div class="form-field" style="margin-bottom:16px"><label>使用者暱稱</label>
      <input class="form-input" id="nick-modal-input" type="text" placeholder="輸入暱稱" value="${state.nickname||''}"></div>
    <div class="modal-btns">
      <button class="save-btn" data-a="saveNickModal">✓ 儲存</button>
      <button class="outline-btn" data-a="closeModal">取消</button>
    </div>
  </div></div>`;
}

function renderEditLoanModal(){
  const f=state.editForm;
  return`<div class="overlay" id="modal-overlay"><div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title">${f.loanId?'編輯貸款':'新增貸款'}</div>
    <div class="form-row">
      <div class="form-field"><label>貸款名稱</label>
        <input class="form-input" id="ef-loanname" type="text" placeholder="例：房貸" value="${escHtml(f.loanName||'')}"></div>
      <div class="form-field" style="max-width:80px"><label>圖示</label>
        <button class="icon-field" id="emoji-field-btn" data-a="toggleEmojiPicker" data-field="loanIcon">${f.loanIcon||'🏠'}</button>
        <input id="ef-loanicon" type="hidden" value="${f.loanIcon||''}"></div>
    </div>
    <div id="emoji-picker-grid" class="emoji-grid" style="display:none;margin-bottom:14px">
      ${EMOJI_QUICK.map(e=>`<button class="emoji-btn${(f.loanIcon||'')===e?' active':''}" data-a="pickEmoji" data-v="${e}">${e}</button>`).join('')}
    </div>
    <div class="form-row">
      <div class="form-field"><label>貸款總額</label>
        <input class="form-input" id="ef-loantotal" type="number" inputmode="decimal" placeholder="0" value="${f.loanTotal||''}"></div>
      <div class="form-field"><label>剩餘還款金額</label>
        <input class="form-input" id="ef-loanremaining" type="number" inputmode="decimal" placeholder="0" value="${f.loanRemaining||''}"></div>
    </div>
    <div class="form-row">
      <div class="form-field"><label>每月還款</label>
        <input class="form-input" id="ef-loanmonthly" type="number" inputmode="decimal" placeholder="0" value="${f.loanMonthly||''}"></div>
      <div class="form-field"><label>年利率 (%)</label>
        <input class="form-input" id="ef-loanrate" type="number" inputmode="decimal" placeholder="0" value="${f.loanRate||''}"></div>
    </div>
    <div class="form-row">
      <div class="form-field"><label>貸款年限（年）</label>
        <input class="form-input" id="ef-loanyears" type="number" inputmode="numeric" placeholder="例：20" min="1" max="50" value="${f.loanYears||''}"></div>
      <div class="form-field"><label>開始日期</label>
        <input class="form-input" id="ef-loanstart" type="date" value="${f.loanStart||todayStr()}"></div>
    </div>
    <div class="slabel">顏色</div>
    <div class="color-swatches" style="margin-bottom:14px">
      ${ACC_COLORS.map(c=>`<div class="swatch${(f.loanColor||ACC_COLORS[0])===c?' sel':''}" style="background:${c}" data-a="loanColor" data-v="${c}"></div>`).join('')}
    </div>
    <div class="modal-btns">
      <button class="save-btn" data-a="saveLoanBtn">儲存</button>
      <button class="outline-btn" data-a="closeModal">取消</button>
    </div>
  </div></div>`;
}
function renderEditFixedModal(){
  const f=state.editForm;
  const freqs=[{id:'monthly',lbl:'每月'},{id:'quarterly',lbl:'每季'},{id:'yearly',lbl:'每年'}];
  return`<div class="overlay" id="modal-overlay"><div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title">${f.fixedId?'編輯固定費用':'新增固定費用'}</div>
    <div class="form-row">
      <div class="form-field"><label>名稱</label>
        <input class="form-input" id="ef-fixedname" type="text" placeholder="例：Netflix、房租" value="${escHtml(f.fixedName||'')}"></div>
      <div class="form-field" style="max-width:80px"><label>圖示</label>
        <button class="icon-field" id="emoji-field-btn" data-a="toggleEmojiPicker" data-field="fixedIcon">${f.fixedIcon||'📋'}</button>
        <input id="ef-fixedicon" type="hidden" value="${f.fixedIcon||''}"></div>
    </div>
    <div id="emoji-picker-grid" class="emoji-grid" style="display:none;margin-bottom:14px">
      ${EMOJI_QUICK.map(e=>`<button class="emoji-btn${(f.fixedIcon||'')===e?' active':''}" data-a="pickEmoji" data-v="${e}">${e}</button>`).join('')}
    </div>
    <div class="form-row">
      <div class="form-field"><label>金額</label>
        <input class="form-input" id="ef-fixedamt" type="number" inputmode="decimal" placeholder="0" value="${f.fixedAmount||''}"></div>
      <div class="form-field"><label>下次繳費日</label>
        <input class="form-input" id="ef-fixednext" type="date" value="${f.fixedNext||todayStr()}"></div>
    </div>
    <div class="slabel">頻率</div>
    <div class="type-chips" style="margin-bottom:14px">
      ${freqs.map(fr=>`<button class="type-chip${(f.fixedFreq||'monthly')===fr.id?' active':''}" data-a="fixedFreq" data-v="${fr.id}">${fr.lbl}</button>`).join('')}
    </div>
    <div class="slabel">費用類別（自動記帳時套用）</div>
    <div class="acc-row" style="margin-bottom:14px;flex-wrap:wrap">
      ${state.cats.expense.map(c=>`<button class="acc-pill${(f.fixedCatId||'other_e')===c.id?' active':''}" style="--acc-c:var(--p)" data-a="fixedCatId" data-v="${c.id}">${c.icon} ${escHtml(c.name)}</button>`).join('')}
    </div>
    ${state.accounts.length>0?`<div class="slabel">扣款帳戶</div>
    <div class="acc-row" style="margin-bottom:14px;flex-wrap:wrap">
      <button class="acc-pill${!f.fixedAccountId?' active':''}" style="--acc-c:#9A8E85" data-a="fixedAcc" data-v="">不指定</button>
      ${state.accounts.map(acc=>`<button class="acc-pill${f.fixedAccountId===acc.id?' active':''}" style="--acc-c:${acc.color}" data-a="fixedAcc" data-v="${acc.id}">${acc.icon} ${escHtml(acc.name)}</button>`).join('')}
    </div>`:''}
    <div class="slabel">記入帳本</div>
    <div class="acc-row" style="margin-bottom:14px;flex-wrap:wrap">
      ${(state.books||[]).filter(b=>!b.isArchived).map(b=>`<button class="acc-pill${(f.fixedBookId||'')=== b.id?' active':''}" style="--acc-c:var(--p)" data-a="fixedBook" data-v="${b.id}">${escHtml(b.name)}</button>`).join('')}
    </div>
    <div class="slabel">顏色</div>
    <div class="color-swatches" style="margin-bottom:14px">
      ${ACC_COLORS.map(c=>`<div class="swatch${(f.fixedColor||ACC_COLORS[2])===c?' sel':''}" style="background:${c}" data-a="fixedColor" data-v="${c}"></div>`).join('')}
    </div>
    <div class="modal-btns">
      <button class="save-btn" data-a="saveFixedBtn">儲存</button>
      <button class="outline-btn" data-a="closeModal">取消</button>
    </div>
  </div></div>`;
}
function renderYearStatsView(){
  const y=state.statsYear?.y||new Date().getFullYear();
  const yearTxs=state.txs.filter(t=>new Date(t.date).getFullYear()===y&&t.type!=='transfer');
  const yearSum=calcSum(yearTxs);
  const monthlyData=Array.from({length:12},(_,i)=>{
    const mTxs=yearTxs.filter(t=>new Date(t.date).getMonth()===i);
    return{m:i,
      income:mTxs.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0),
      expense:mTxs.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0)};
  });
  const maxVal=Math.max(...monthlyData.map(d=>Math.max(d.income,d.expense)),1);
  const bars=monthlyData.map(d=>`
    <div style="display:flex;flex-direction:column;align-items:center;gap:3px;flex:1">
      <div style="width:100%;display:flex;align-items:flex-end;justify-content:center;gap:1px;height:70px">
        ${d.income>0?`<div style="width:46%;background:var(--income);border-radius:3px 3px 0 0;height:${Math.round((d.income/maxVal)*70)}px"></div>`:'<div style="width:46%"></div>'}
        ${d.expense>0?`<div style="width:46%;background:var(--expense);border-radius:3px 3px 0 0;height:${Math.round((d.expense/maxVal)*70)}px"></div>`:'<div style="width:46%"></div>'}
      </div>
      <div style="font-size:10px;color:var(--text2);font-weight:700">${d.m+1}</div>
    </div>`).join('');
  const allYears=[...new Set([...state.txs.map(t=>new Date(t.date).getFullYear()),new Date().getFullYear()])].sort().reverse();
  return`<div class="hdr"><div class="hdr-in">
    <div class="hdr-row">
      <h1>統計</h1>
      <select id="stats-year-sel" class="stats-sel">
        ${allYears.map(yr=>`<option value="${yr}" ${y===yr?'selected':''} style="color:#3A2828;background:white">${yr}年</option>`).join('')}
      </select>
    </div>
    <div class="sum-bar">
      <div class="sum-item"><div class="lbl">年收入</div><div class="val">$${fmt(yearSum.income)}</div></div>
      <div class="sum-item"><div class="lbl">年支出</div><div class="val">$${fmt(yearSum.expense)}</div></div>
      <div class="sum-item"><div class="lbl">結餘</div>
        <div class="val" style="color:${yearSum.balance>=0?'#1A7A50':'#B02828'}">$${fmt(yearSum.balance)}</div>
      </div>
    </div>
  </div></div>
  <div class="content">
    <div class="stabs" style="margin-bottom:16px">
      <button class="stab" data-a="statsView" data-v="month">月統計</button>
      <button class="stab active" data-a="statsView" data-v="year">年統計</button>
      <button class="stab" data-a="statsView" data-v="history">明細</button>
    </div>
    <div class="card">
      <div class="card-title" style="display:flex;align-items:center;gap:12px">收支走勢
        <span style="display:flex;align-items:center;gap:4px;font-size:12px;font-weight:600;color:var(--income)"><span style="width:10px;height:10px;background:var(--income);border-radius:2px;display:inline-block"></span>收入</span>
        <span style="display:flex;align-items:center;gap:4px;font-size:12px;font-weight:600;color:var(--expense)"><span style="width:10px;height:10px;background:var(--expense);border-radius:2px;display:inline-block"></span>支出</span>
      </div>
      <div style="display:flex;gap:2px;align-items:flex-end;padding-top:4px">${bars}</div>
    </div>
    <div class="card">
      <div class="card-title">年度摘要</div>
      <div class="sum-grid">
        <div class="sum-metric"><div class="ml">總收入</div><div class="mv i">$${fmt(yearSum.income)}</div></div>
        <div class="sum-metric"><div class="ml">總支出</div><div class="mv e">$${fmt(yearSum.expense)}</div></div>
        <div class="sum-metric"><div class="ml">年結餘</div><div class="mv ${yearSum.balance>=0?'i':'e'}">$${fmt(yearSum.balance)}</div></div>
        <div class="sum-metric"><div class="ml">儲蓄率</div><div class="mv p">${yearSum.income>0?Math.round((yearSum.balance/yearSum.income)*100):0}%</div></div>
      </div>
    </div>
  </div>`;
}

// ── RENDER: INSURANCE ──────────────────────────────────────────────────────
function renderInsCardSm(ins){
  const st=insStatus(ins);
  const color=INS_TCOLORS[ins.type]||'#888';
  const isRider=/附約/.test(ins.riderType||'');
  const freqLabel=(INS_FREQS.find(f=>f.id===ins.premFreq)||{label:'年'}).label;
  const isOpen=state.insOpenCov.has(ins.id);

  // 理賠項目：優先用結構化陣列，否則切割文字
  let covItems=[];
  if(ins.coverageItems&&ins.coverageItems.length){
    covItems=ins.coverageItems.map(i=>({label:i.label,val:i.amount||''}));
  }else{
    if(ins.coverageAmt)covItems.push({label:'保障金額',val:`$${fmt(Number(ins.coverageAmt))}`});
    if(ins.coverage)ins.coverage.split(/[、，・,;；\n]+/).map(s=>s.trim()).filter(Boolean).forEach(s=>covItems.push({label:s,val:''}));
  }

  const covHtml=covItems.length?`
    <div class="ins-cov-toggle" data-a="insToggle" data-v="${ins.id}">
      <span>📋 理賠項目（${covItems.length}）</span>
      <span style="display:inline-block;transform:rotate(${isOpen?180:0}deg);transition:transform .2s">▾</span>
    </div>
    ${isOpen?`<div class="ins-cov-body">${covItems.map(item=>`
      <div class="ins-cov-row">
        <div class="ins-cov-dot"></div>
        <span style="flex:1;color:var(--text)">${escHtml(item.label)}</span>
        ${item.val?`<span style="font-weight:800;color:var(--text);white-space:nowrap">${escHtml(item.val)}</span>`:''}
      </div>`).join('')}</div>`:''}`:''  ;

  return`<div class="ins-card-sm" data-ins-id="${ins.id}" style="--ic:${color}">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
      <div style="display:flex;align-items:center;gap:6px">
        ${isRider?'<span style="font-size:13px;background:#EEEEF5;color:#666;padding:2px 7px;border-radius:4px;font-weight:700">附約</span>':'<span style="font-size:13px;background:#E8F5EA;color:#3A6840;padding:2px 7px;border-radius:4px;font-weight:700">主約</span>'}
        ${ins.company?`<span style="font-size:13px;color:var(--text2);font-weight:600">${escHtml(ins.company)}</span>`:''}
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <span class="ins-badge" style="background:${color}22;color:${color};font-size:13px;padding:3px 8px;margin-bottom:0">${ins.type}</span>
        <span class="ins-drag-handle">⠿</span>
      </div>
    </div>
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:6px;margin-bottom:8px">
      <div style="font-size:17px;font-weight:800;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${escHtml(ins.name||'未命名')}</div>
      <div style="display:flex;gap:4px;flex-shrink:0">
        <button class="ins-detail-btn" style="color:var(--expense);border-color:var(--expense)" data-a="delIns" data-v="${ins.id}">🗑️</button>
        <button class="ins-detail-btn" data-a="editIns" data-v="${ins.id}">··· 詳細</button>
      </div>
    </div>
    ${ins.premium?`<div style="font-size:16px;font-weight:700;color:var(--text);margin-bottom:6px">$${fmt(ins.premium)}<span style="font-size:13px;color:var(--text2)">/${freqLabel}</span></div>`:''}
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:4px">
      <span class="ins-st ${st.cls}" style="font-size:14px;padding:3px 8px">${st.label}</span>
      ${ins.insured?`<span style="font-size:14px;color:var(--text2);font-weight:600">👤 ${escHtml(extractPersonName(ins.insured)||ins.insured)}</span>`:''}
    </div>
    ${covHtml}
  </div>`;
}
function renderInsBodyHtml(){
  const alerts=insAlerts();
  const persons=insAllPersons();
  let filtered=state.insurances;
  if(state.insPersonFilter!=='all')filtered=filtered.filter(i=>extractPersonName(i.insured)===state.insPersonFilter);
  if(state.insFilter!=='all')filtered=filtered.filter(i=>i.type===state.insFilter);
  if(state.insCompanyFilter!=='all')filtered=filtered.filter(i=>i.company===state.insCompanyFilter);

  const alertHtml=alerts.length?`<div style="margin-bottom:8px">${alerts.map(ins=>`
    <div class="ins-alert">
      <span style="font-size:20px">${INS_TICONS[ins.type]||'📋'}</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:700">${escHtml(ins.name||ins.company)}</div>
        <div style="font-size:12px;color:#8B5E00">${insStatus(ins).label}</div>
      </div>
    </div>`).join('')}</div>`:'';

  const savedNames=new Set(state.insMembers.map(m=>m.name));
  const detectedExtra=persons.filter(n=>!savedNames.has(n));
  const allMembers=[
    ...state.insMembers.map(m=>({name:m.name,icon:m.icon,id:m.id})),
    ...detectedExtra.map(n=>({name:n,icon:'👤',id:null})),
  ];
  const personChips=`<div class="chips" style="margin-bottom:6px;flex-wrap:wrap">
    <button class="chip${state.insPersonFilter==='all'?' ac':''}" data-a="insPersonFilt" data-v="all">👨‍👩‍👧 全家</button>
    ${allMembers.map(m=>`<button class="chip${state.insPersonFilter===m.name?' ac':''}" data-a="insPersonFilt" data-v="${m.name}">${m.icon} ${escHtml(m.name)}${m.id?`<span data-a="editMember" data-v="${m.id}" style="margin-left:4px;opacity:.6;font-size:10px"> ···</span>`:`<span data-a="addDetectedMember" data-v="${m.name}" style="margin-left:4px;opacity:.6;font-size:10px"> ···</span>`}</button>`).join('')}
    <button class="chip" data-a="newMember" style="border-style:dashed;color:var(--text2)">＋ 新增成員</button>
  </div>`;
  const chips=`<div class="chips">${['all',...INS_TYPES].map(t=>
    `<button class="chip${state.insFilter===t?' ac':''}" data-a="insFilt" data-v="${t}">${t==='all'?'全部':t}</button>`
  ).join('')}</div>`;
  const companies=[...new Set(state.insurances.map(i=>i.company).filter(Boolean))];
  const companyChips=companies.length>1?`<div class="chips" style="margin-bottom:4px">
    <button class="chip${state.insCompanyFilter==='all'?' ac':''}" data-a="insCompanyFilt" data-v="all">全公司</button>
    ${companies.map(c=>`<button class="chip${state.insCompanyFilter===c?' ac':''}" data-a="insCompanyFilt" data-v="${c}">${escHtml(c)}</button>`).join('')}
  </div>`:'';

  const groups={},ungrouped=[];
  filtered.forEach(ins=>{
    const key=(ins.policyNo||'').trim();
    if(key){
      if(!groups[key])groups[key]={policyNo:key,company:ins.company||'',items:[]};
      groups[key].items.push(ins);
    }else ungrouped.push(ins);
  });
  Object.values(groups).forEach(g=>{
    g.items.sort((a,b)=>(/主約/.test(a.riderType||'')?0:1)-(/主約/.test(b.riderType||'')?0:1));
  });
  const renderGroup=(items,label)=>
    (label?`<div class="ins-group-hdr">📋 ${label}</div>`:'')
    +`<div class="ins-grid">${items.map(ins=>renderInsCardSm(ins)).join('')}</div>`;
  let cards='';
  Object.values(groups).forEach(g=>{
    cards+=`<div class="ins-group">${renderGroup(g.items,`${g.policyNo}${g.company?' · '+g.company:''}`)}</div>`;
  });
  if(ungrouped.length)cards+=`<div class="ins-group">${renderGroup(ungrouped,'')}</div>`;
  if(!filtered.length)cards=`<div class="empty"><div class="ei">🛡️</div><p>尚未新增保單<br><span style="font-size:13px">點 ＋ 新增</span></p></div>`;

  return alertHtml+personChips+chips+companyChips+cards+
    `<input type="file" id="ins-import-input" accept=".xlsx,.xls" style="display:none">`;
}
function renderInsView(){
  const total=state.insurances.reduce((s,ins)=>s+insYearlyPremium(ins),0);
  const active=state.insurances.filter(ins=>insStatus(ins).cls==='active').length;
  const hdr=`<div class="hdr ins-hdr">
    <div class="hdr-in">
      <div class="hdr-row">
        <div><h1>🛡️ 保險管理</h1>
        <div class="sub">共 ${state.insurances.length} 張保單・${active} 張生效中</div></div>
        <button class="outline-btn" style="background:rgba(255,255,255,.18);border-color:rgba(255,255,255,.5);color:white;font-size:13px;flex-shrink:0" data-a="importIns">📥 匯入 Excel</button>
      </div>
      <div class="ins-total">
        <div class="ins-total-item"><div class="il">年繳總保費</div><div class="iv">$${fmt(total)}</div></div>
        <div class="ins-total-item"><div class="il">月均保費</div><div class="iv">$${fmt(Math.round(total/12))}</div></div>
      </div>
    </div>
  </div>`;
  return hdr+`<div class="content" style="padding-top:12px">${renderInsBodyHtml()}</div>`;
}

function renderEditMemberModal(){
  const f=state.editForm;
  return`<div class="overlay" id="modal-overlay"><div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title">${f.memId?'編輯成員':'新增家庭成員'}</div>
    <div class="slabel">圖示</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
      ${MEM_ICONS.map(ico=>`<button style="font-size:26px;background:${(f.memIcon||'👤')===ico?'var(--border)':'transparent'};border:2px solid ${(f.memIcon||'👤')===ico?'var(--p)':'var(--border)'};border-radius:10px;padding:5px 9px;cursor:pointer" data-a="memIcon" data-v="${ico}">${ico}</button>`).join('')}
    </div>
    <div class="form-row">
      <div class="form-field"><label>姓名</label>
        <input class="form-input" id="mem-name" value="${escHtml(f.memName||'')}" placeholder="例：王小明" autofocus>
      </div>
    </div>
    <div class="modal-btns">
      ${f.memId
        ?`<button class="outline-btn" style="color:var(--expense);border-color:var(--expense)" data-a="delMember" data-v="${f.memId}">刪除</button>`
        :f.detectedName
          ?`<button class="outline-btn" style="color:var(--expense);border-color:var(--expense)" data-a="delDetectedMember" data-v="${f.detectedName}">刪除</button>`
          :''}
      <button class="outline-btn" data-a="closeModal" style="flex:1">取消</button>
      <button class="save-btn" data-a="saveMember" style="flex:2">儲存</button>
    </div>
  </div></div>`;
}
function renderEditInsModal(){
  const f=state.editForm;
  return`<div class="overlay" id="modal-overlay"><div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title">${f.id?'編輯保單':'新增保單'}</div>
    <div class="slabel">險種</div>
    <div class="type-chips" style="margin-bottom:14px">${INS_TYPES.map(t=>
      `<button class="type-chip${(f.insType||'壽險')===t?' active':''}" data-a="insType" data-v="${t}">${INS_TICONS[t]} ${t}</button>`
    ).join('')}</div>
    <div class="form-row">
      <div class="form-field"><label>保險公司</label>
        <input class="form-input" id="ins-company" value="${escHtml(f.insCompany||'')}" placeholder="例：國泰人壽"></div>
      <div class="form-field"><label>保單名稱</label>
        <input class="form-input" id="ins-name" value="${escHtml(f.insName||'')}" placeholder="例：終身壽險"></div>
    </div>
    <div class="form-row">
      <div class="form-field"><label>保單號碼</label>
        <input class="form-input" id="ins-policyno" value="${escHtml(f.insPolicyNo||'')}" placeholder="選填"></div>
      <div class="form-field"><label>被保人</label>
        <input class="form-input" id="ins-insured" value="${escHtml(f.insInsured||'')}" placeholder="選填"></div>
    </div>
    <div class="form-row">
      <div class="form-field"><label>保費金額</label>
        <input class="form-input" id="ins-premium" type="number" value="${f.insPremium||''}" placeholder="0"></div>
      <div class="form-field"><label>繳費頻率</label>
        <div style="display:flex;gap:5px;flex-wrap:wrap">${INS_FREQS.map(fr=>
          `<button class="type-chip${(f.premFreq||'yearly')===fr.id?' active':''}" style="font-size:12px;padding:5px 10px" data-a="insFreq" data-v="${fr.id}">${fr.label}</button>`
        ).join('')}</div></div>
    </div>
    <div class="form-row">
      <div class="form-field"><label>生效日期</label>
        <input class="form-input" id="ins-start" type="date" value="${f.insStart||''}"></div>
      <div class="form-field"><label>到期日期（終身可不填）</label>
        <input class="form-input" id="ins-end" type="date" value="${f.insEnd||''}"></div>
    </div>
    <div class="form-row">
      <div class="form-field"><label>下次繳費日</label>
        <input class="form-input" id="ins-renewal" type="date" value="${f.insRenewal||''}"></div>
    </div>
    <div class="slabel" style="margin-bottom:8px">理賠 / 給付項目</div>
    ${(f.insCoverageItems||[]).map((item,i)=>`
      <div style="display:flex;gap:6px;align-items:center;margin-bottom:7px">
        <input class="form-input" id="cov-label-${i}" value="${item.label||''}" placeholder="項目名稱" style="flex:2;font-size:12px;padding:8px 10px">
        <input class="form-input" id="cov-amount-${i}" value="${item.amount||''}" placeholder="金額" style="flex:1;font-size:12px;padding:8px 10px">
        <button style="background:transparent;border:none;font-size:18px;cursor:pointer;color:var(--text2);padding:2px 4px;flex-shrink:0" data-a="delCovItem" data-v="${i}">✕</button>
      </div>`).join('')}
    <button class="outline-btn" style="width:100%;margin-bottom:14px;font-size:13px" data-a="addCovItem">＋ 新增理賠項目</button>
    <div class="slabel" style="margin-bottom:7px">保單 PDF</div>
    ${f._pdfName?
      `<div style="display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--surface);border-radius:10px;border:1.5px solid var(--income);margin-bottom:14px">
        <span style="font-size:18px">📄</span>
        <span style="font-size:13px;font-weight:600;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${f._pdfName}</span>
        <button class="sm-btn cancel" data-a="insClearPdf">✕</button>
      </div>`:
      `<button class="outline-btn" style="width:100%;display:flex;align-items:center;justify-content:center;gap:7px;margin-bottom:14px" data-a="insUploadPdf">
        📎 上傳保單附件（xlsx・自動辨識資料）
      </button>`
    }
    ${f.pdfName&&!f._pdfName?`<div style="font-size:12px;color:var(--text2);margin-bottom:14px">現有附件：${f.pdfName}</div>`:''}
    <input type="file" id="ins-pdf-input" accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" style="display:none">
    <div class="modal-btns">
      <button class="outline-btn" data-a="closeModal" style="flex:1">取消</button>
      <button class="save-btn" data-a="saveIns" style="flex:2">儲存保單</button>
    </div>
  </div></div>`;
}

function renderViewPdfModal(){
  const ins=state.insurances.find(i=>i.id===state.modal.data);
  return`<div style="position:fixed;inset:0;background:white;z-index:250;display:flex;flex-direction:column">
    <div class="pdf-bar">
      <button class="outline-btn" data-a="closeModal" style="padding:7px 14px;flex-shrink:0">← 返回</button>
      <div style="font-size:14px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${ins?.pdfName||'保單附件'}</div>
    </div>
    <div id="pdf-viewer-area" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:30px">
      <div style="font-size:48px">📊</div>
      <div style="font-size:16px;font-weight:700">${ins?.pdfName||''}</div>
      <div style="font-size:13px;color:var(--text2);text-align:center">點下方按鈕下載並在 Excel 開啟</div>
      <button id="xlsx-dl-btn" class="save-btn" style="width:200px">⬇️ 下載附件</button>
    </div>
  </div>`;
}

// ── TX ITEM ────────────────────────────────────────────────────────────────
function txItem(t,showDel,showSign=true){
  if(t.type==='transfer'){
    const fromAcc=getAcc(t.fromAccountId);
    const toAcc=getAcc(t.toAccountId);
    return`<div class="tx-item">
      <div class="tx-ico transfer">🔄</div>
      <div class="tx-info">
        <div class="tx-cat">轉帳${t.note?' · '+escHtml(t.note):''}</div>
        <div class="tx-meta">
          <span>${fromAcc.icon} ${escHtml(fromAcc.name)} → ${toAcc.icon} ${escHtml(toAcc.name)}</span>
          <span>${relDate(t.date)}</span>
        </div>
      </div>
      <div class="tx-right">
        <div class="tx-amt" style="color:var(--text2)">$${fmt(t.amount)}</div>
        ${showDel?`<div class="tx-actions"><button class="del-btn" data-a="del" data-id="${t.id}">刪除</button></div>`:''}
      </div>
    </div>`;
  }
  const cat=getCat(t.type,t.category);
  const sub=t.subCategory?getSubCat(cat,t.subCategory):null;
  const acc=getAcc(t.accountId);
  const catLabel=sub?`${escHtml(cat.name)} · ${escHtml(sub.name)}`:escHtml(cat.name);
  const necTag=t.necessity?`<span class="nec-tag ${t.necessity==='必要'?'n':'w'}">${t.necessity}</span>`:'';
  const accTag=acc.name?`<span class="acc-tag">${acc.icon} ${escHtml(acc.name)}</span>`:'';
  return`<div class="tx-item">
    <div class="tx-ico ${t.type}">${cat.icon}</div>
    <div class="tx-info">
      <div class="tx-cat">${catLabel}${t.note?' · '+escHtml(t.note):''}</div>
      <div class="tx-meta">${necTag}${accTag}</div>
    </div>
    <div class="tx-right">
      <div class="tx-amt ${t.type}">${showSign?(t.type==='income'?'+':'-'):''}$${fmt(t.amount)}</div>
      ${showDel?`<div class="tx-actions">
        <button class="icon-btn edit" data-a="openEditTx" data-v="${t.id}">···</button>
        <button class="del-btn" data-a="del" data-id="${t.id}">刪除</button>
      </div>`:''}
    </div>
  </div>`;
}

// ── DONUT CHART ─────────────────────────────────────────────────────────────
function drawCatPie(){
  const canvas=document.getElementById('cat-pie');if(!canvas)return;
  const{y,m}=state.statsMonth;
  const txs=monthTxs(y,m);
  const catMap={};txs.filter(t=>t.type==='expense').forEach(t=>{catMap[t.category]=(catMap[t.category]||0)+t.amount;});
  const catArr=Object.entries(catMap).sort((a,b)=>b[1]-a[1]);
  const total=catArr.reduce((s,[,v])=>s+v,0);
  const colors=['#C8A5A3','#8090A8','#8DAD93','#C49830','#8B6CC8','#C45555','#4AA8A8','#C87840','#6080C8','#A8C460','#C870A8','#50A870','#C85050','#5090C8','#C8A050','#9050C8'];
  const ctx=canvas.getContext('2d');const cx=80,cy=80,r=62,lw=24;
  ctx.clearRect(0,0,160,160);
  if(!total){ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.strokeStyle='#E8D8D4';ctx.lineWidth=lw;ctx.stroke();return;}
  let start=0;
  catArr.forEach(([,amt],i)=>{
    const angle=(amt/total)*Math.PI*2;
    ctx.beginPath();ctx.arc(cx,cy,r,start-Math.PI/2,start+angle-Math.PI/2);
    ctx.strokeStyle=colors[i%colors.length];ctx.lineWidth=lw;ctx.lineCap='butt';ctx.stroke();
    start+=angle;
  });
  ctx.fillStyle='#3A2828';ctx.font='bold 15px Nunito,sans-serif';
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('$'+fmt(total),cx,cy-8);
  ctx.font='12px Nunito,sans-serif';ctx.fillStyle='#907878';ctx.fillText('總支出',cx,cy+11);
}
function drawDonut(canvasId='donut',y,m){
  const canvas=document.getElementById(canvasId);if(!canvas)return;
  const _y=y??state.statsMonth.y,_m=m??state.statsMonth.m;
  const sum=calcSum(monthTxs(_y,_m));
  const ctx=canvas.getContext('2d');const cx=60,cy=60,r=44,lw=14;
  ctx.clearRect(0,0,120,120);
  const draw=(start,angle,color)=>{
    if(angle<=0.01)return;
    ctx.beginPath();ctx.arc(cx,cy,r,start-Math.PI/2,start+angle-Math.PI/2);
    ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.lineCap='butt';ctx.stroke();
  };
  if(!sum.expense){ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.strokeStyle='#E8D8D4';ctx.lineWidth=lw;ctx.stroke();}
  else{
    const na=(sum.nec/sum.expense)*Math.PI*2,wa=(sum.want/sum.expense)*Math.PI*2,ua=Math.PI*2-na-wa;
    draw(0,na,'#8090A8');draw(na,wa,'#B89860');if(ua>0.01)draw(na+wa,ua,'#E8D8D4');
  }
  const wp=sum.expense?Math.round((sum.want/sum.expense)*100):0;
  ctx.fillStyle='#3A2828';ctx.font='bold 18px Nunito,sans-serif';
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(wp+'%',cx,cy-8);
  ctx.font='11px Nunito,sans-serif';ctx.fillStyle='#907878';ctx.fillText('想要',cx,cy+10);
}

