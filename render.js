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
// ── WORKSPACE MODULES ────────────────────────────────────────────────────
const MODULES=[
  {id:'home',lbl:'首頁',module:'home'},
  {id:'finance',lbl:'財務',module:'finance',view:'add'},
  {id:'insurance',lbl:'保險',module:'insurance'},
  {id:'project',lbl:'專案排程',module:'project'},
  {id:'course',lbl:'課程學習',module:'course'},
  {id:'goals',lbl:'目標設定',module:'goals'},
  {id:'habit',lbl:'習慣養成',module:'habit'},
  {id:'gratitude',lbl:'感恩日記',module:'gratitude'},
  {id:'cycle',lbl:'月經週期',module:'cycle'},
  {id:'settings',lbl:'設定',module:'settings'},
];
function isModuleActive(item){
  if(item.module!=='finance')return state.module===item.module;
  return state.module==='finance'&&state.view!=='settings';
}
// 依使用者自訂順序排列 MODULES（找不到的新項目排在最後，失效的舊 id 自動忽略）
function getOrderedModules(){
  const ord=state.moduleOrder;
  if(!ord||!Array.isArray(ord))return MODULES;
  const map=new Map(MODULES.map(m=>[m.id,m]));
  const result=ord.map(id=>map.get(id)).filter(Boolean);
  MODULES.forEach(m=>{if(!ord.includes(m.id))result.push(m);});
  return result;
}
function renderApp(){
  document.getElementById('app').innerHTML=
    renderSidebar()+renderMobileHubBar()+renderModuleBody()+(state.modal?renderModal():'');
  attachInputs();bindOverlay();
  if(state.module==='finance'&&state.view==='stats'&&state.statsView==='month'){setTimeout(()=>drawDonut(),50);setTimeout(()=>drawCatPie(),50);}
  if((state.module==='finance'&&state.view==='calendar')||state.module==='home')setTimeout(()=>drawDonut('cal-donut',state.calMonth.y,state.calMonth.m),50);
}
function renderModuleBody(){
  if(state.module==='finance')return`<div class="finance-module">${renderTopBar()+renderView()+renderBottomNav()}</div>`;
  if(state.module==='insurance')return`<div class="feature-module">${renderInsView()}</div>`;
  if(state.module==='home')return renderHomeModule();
  if(state.module==='project')return`<div class="feature-module">${renderProjectModule()}</div>`;
  if(state.module==='course')return`<div class="feature-module">${renderPlaceholderModule('📚','課程學習')}</div>`;
  if(state.module==='goals')return`<div class="feature-module">${renderGoalsModule()}</div>`;
  if(state.module==='habit')return`<div class="feature-module">${renderHabitModule()}</div>`;
  if(state.module==='gratitude')return`<div class="feature-module">${renderGratitudeModule()}</div>`;
  if(state.module==='cycle')return`<div class="feature-module">${renderCycleModule()}</div>`;
  if(state.module==='settings')return`<div class="feature-module">${renderWorkspaceSettingsModule()}</div>`;
  return'';
}
function renderDreamFundCard(){
  const df=state.dreamFund;
  const dfAcc=df.accountId?getAcc(df.accountId):null;
  const dfBal=dfAcc?accBalance(df.accountId):null;
  const dfPct=df.target>0&&dfBal!==null?Math.min(Math.round((dfBal/df.target)*100),100):null;
  const linkedGoal=df.linkedGoalId?(state.goals||[]).find(g=>g.id===df.linkedGoalId):null;
  const gp=linkedGoal?goalProgress(linkedGoal):null;
  return`<div class="card" style="background:var(--surface);border-color:var(--border)">
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
    ${linkedGoal?`<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:8px">
      <div style="font-size:12px;color:var(--text2);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">🌟 連結夢想：${escHtml(linkedGoal.name)}</div>
      ${linkedGoal.achieved?`<span class="goal-achieved-badge">✓ 已達成</span>`:gp?`<span style="font-size:12px;font-weight:700;color:var(--text2);flex-shrink:0">任務 ${gp.done}/${gp.total}</span>`:''}
    </div>`:''}
  </div>`;
}
function greetingText(){
  const h=new Date().getHours();
  const g=h<5?'夜深了':h<11?'早安':h<13?'午安':h<18?'下午好':'晚安';
  return state.nickname?`${g}，${escHtml(state.nickname)}`:g;
}
function renderRemindersCard(){
  const cc=creditCardReminders();
  const fx=fixedExpenseReminders();
  if(!cc.length&&!fx.length){
    return`<div class="card home-feature-card"><div class="hf-title">七天內提醒</div>
      <div class="empty" style="padding:20px 10px"><p>最近沒有待繳款或固定費用</p></div>
    </div>`;
  }
  const ccItems=cc.map(r=>`<div class="reminder-row">
    <span class="rd-badge">${r.days<=0?'今天':`${r.days}天後`}</span>
    <span class="rd-lbl">${escHtml(r.acc.name)} 信用卡繳款</span>
  </div>`).join('');
  const todayS=todayStr();
  const fxItems=fx.map(f=>{
    const days=Math.round((new Date(f.nextDate+'T00:00:00')-new Date(todayS+'T00:00:00'))/86400000);
    return`<div class="reminder-row">
      <span class="rd-badge">${days<=0?'今天':`${days}天後`}</span>
      <span class="rd-lbl">${escHtml(f.name)}</span>
    </div>`;
  }).join('');
  return`<div class="card home-feature-card"><div class="hf-title">七天內提醒</div><div class="hf-scroll">${ccItems}${fxItems}</div></div>`;
}
function renderCourseTeaserCard(){
  return`<div class="card home-feature-card hf-clickable" data-module="course"><div class="hf-title">課程學習</div>
    <div class="hf-hint">規劃中，敬請期待</div>
  </div>`;
}
function renderGoalListBody(list){
  if(!list.length)return`<div class="hf-hint">尚未新增項目，點擊開始規劃</div>`;
  return`<div class="hf-scroll">${list.map(g=>`<div class="reminder-row">
    <span class="rd-lbl">${g.achieved?'✓ ':''}${escHtml(g.name)}</span>
  </div>`).join('')}</div>`;
}
function renderDreamTeaserCard(){
  const dreams=(state.goals||[]).filter(g=>g.type==='dream');
  return`<div class="card home-feature-card hf-clickable" data-module="goals"><div class="hf-title">夢想清單</div>
    ${renderGoalListBody(dreams)}
  </div>`;
}
function renderGoalsTeaserCard(){
  const goals=(state.goals||[]).filter(g=>g.type==='goal');
  return`<div class="card home-feature-card hf-clickable" data-module="goals"><div class="hf-title">目標設定</div>
    ${renderGoalListBody(goals)}
  </div>`;
}
function renderProjectTeaserCard(){
  const ps=state.projects||[];
  const ico={todo:'○ ',doing:'◐ ',done:'✓ '};
  return`<div class="card home-feature-card hf-clickable" data-module="project"><div class="hf-title">專案排程</div>
    ${ps.length?`<div class="hf-scroll">${ps.slice(0,6).map(p=>`<div class="reminder-row">
      <span class="rd-lbl">${ico[p.status||'todo']}${escHtml(p.name)}</span></div>`).join('')}</div>`
      :`<div class="hf-hint">尚未新增專案，點擊開始規劃</div>`}
  </div>`;
}
// ── RENDER: PROJECT SCHEDULING ─────────────────────────────────────────────
const PROJ_STATUS={todo:'未開始',doing:'進行中',done:'已完成'};
function renderProjectModule(){
  const all=state.projects||[];
  const filter=state.projectFilter||'all';
  const list=filter==='all'?all:all.filter(p=>(p.status||'todo')===filter);
  const tabs=[{id:'all',lbl:'全部'},{id:'todo',lbl:'未開始'},{id:'doing',lbl:'進行中'},{id:'done',lbl:'已完成'}];
  let sel=state.projectSelected&&all.find(p=>p.id===state.projectSelected);
  if(!sel)sel=list[0]||all[0]||null;
  state.projectSelected=sel?sel.id:null;
  return`<div class="hdr"><div class="hdr-in">
    <h1>專案排程</h1>
    <div class="sub">把專案拆成階段與任務，用時間軸掌握進度</div>
  </div></div>
  <div class="content" style="padding-top:12px">
    <button class="save-btn" data-a="newProject" style="margin-bottom:14px">＋ 新增專案</button>
    ${all.length?`<div class="proj-layout">
      <div class="proj-gantt-col">
        <div class="card" style="padding:14px">${renderProjectGantt(all,state.projectSelected)}</div>
      </div>
      <div class="proj-list-col">
        <div class="chips">${tabs.map(t=>`<button class="chip${filter===t.id?' ac':''}" data-a="projectFilt" data-v="${t.id}">${t.lbl}</button>`).join('')}</div>
        ${list.length?list.map(p=>renderProjectCard(p,sel&&sel.id===p.id,state.projectExpanded===p.id)).join(''):`
          <div class="empty" style="padding:30px 20px"><p>這個分類沒有專案</p></div>`}
      </div>
    </div>`:`<div class="empty"><div class="ei">📋</div><p>還沒有任何專案，點上面按鈕新增一個吧</p></div>`}
  </div>`;
}
function renderProjectGantt(projects,selId){
  const head=`<div class="proj-gantt-title">專案時間軸</div>`;
  const dated=projects.map(p=>({p,r:projectRange(p)})).filter(x=>x.r);
  if(!dated.length)return head+`<div class="empty" style="padding:24px 10px"><div class="ei">📅</div><p>幫專案（或階段）填入起訖日，就會出現在時間軸上</p></div>`;
  const allD=[];dated.forEach(x=>{allD.push(x.r.start,x.r.end);});
  allD.sort();
  const rngStart=allD[0],rngEnd=allD[allD.length-1];
  const start=addDays(rngStart,-3),end=addDays(rngEnd,3);
  const sY=ymd(start),eY=ymd(end);
  const total=Math.max(1,daysBetween(sY,eY));
  const pctFor=ds=>Math.max(0,Math.min(100,daysBetween(sY,ds)/total*100));
  const grids=[];
  let cur=new Date(start.getFullYear(),start.getMonth()+1,1);
  while(ymd(cur)<eY){grids.push({ds:ymd(cur),lbl:`${cur.getMonth()+1}月`});cur=new Date(cur.getFullYear(),cur.getMonth()+1,1);}
  const today=todayStr();
  const todayIn=today>=sY&&today<=eY;
  const overlay=grids.map(g=>`<div class="gantt-grid" style="left:${pctFor(g.ds)}%"></div>`).join('')
    +(todayIn?`<div class="gantt-today" style="left:${pctFor(today)}%"></div>`:'');
  const stCol={todo:'#9AA0A6',doing:'var(--p)',done:'#7A9878'};
  const rows=[];
  dated.forEach(({p,r})=>{
    const isSel=p.id===selId;
    const L=pctFor(r.start),R=pctFor(r.end),w=Math.max(2,R-L);
    rows.push(`<div class="gantt-row proj-row${isSel?' sel':''}" data-a="projectSelect" data-v="${p.id}">
      <div class="gantt-label" title="${escHtml(p.name)}">${escHtml(p.name)}</div>
      <div class="gantt-track">${overlay}
        <div class="gantt-bar big" style="left:${L}%;width:${w}%;background:${stCol[p.status||'todo']}"></div>
      </div>
    </div>`);
    if(isSel){
      (p.phases||[]).slice().sort((a,b)=>a.start<b.start?-1:1).forEach(ph=>{
        const pl=pctFor(ph.start),pr=pctFor(ph.end),pw=Math.max(2,pr-pl);
        const ts=ph.tasks||[];const tp=ts.length?`${ts.filter(t=>t.done).length}/${ts.length}`:'';
        rows.push(`<div class="gantt-row phase-row" data-a="editPhase" data-pid="${p.id}" data-v="${ph.id}">
          <div class="gantt-label sub" title="${escHtml(ph.name)}">└ ${escHtml(ph.name)}</div>
          <div class="gantt-track">${overlay}
            <div class="gantt-bar" data-a="editPhase" data-pid="${p.id}" data-v="${ph.id}" style="left:${pl}%;width:${pw}%;background:${ph.color||'var(--p)'}">${tp?`<span class="gantt-bar-lbl">${tp}</span>`:''}</div>
          </div>
        </div>`);
      });
    }
  });
  return head+`
    <div class="gantt-axis"><div class="gantt-label"></div><div class="gantt-track">${grids.map(g=>`<span class="gantt-axis-lbl" style="left:${pctFor(g.ds)}%">${g.lbl}</span>`).join('')}</div></div>
    <div class="gantt-body">${rows.join('')}</div>
    <div class="gantt-scale"><span>${rngStart.slice(0,7).replace('-','/')}</span><span>${rngEnd.slice(0,7).replace('-','/')}</span></div>
    <div class="gantt-hint">點專案名稱可選取並展開階段${todayIn?'・紅線＝今天':''}</div>`;
}
function renderProjectCard(p,selected,expanded){
  const prog=projectProgress(p);
  const pEnd=projectEnd(p);
  const st=p.status||'todo';
  let countdown='';
  if(pEnd&&st!=='done'){
    const d=daysBetween(todayStr(),pEnd);
    countdown=d>0?`距結束 ${d} 天`:d===0?'今天結束':`已超過 ${-d} 天`;
  }
  const spanTxt=(p.start||p.end)?`${(p.start||'?').slice(5).replace('-','/')} – ${(p.end||'?').slice(5).replace('-','/')}`:'';
  const phases=(p.phases||[]).slice().sort((a,b)=>a.start<b.start?-1:1);
  return`<div class="proj-card${selected?' sel':''}${expanded?' expanded':''}">
    <div class="proj-card-top" data-a="projToggle" data-v="${p.id}">
      <div class="proj-card-head">
        <span class="proj-caret">${expanded?'▾':'▸'}</span>
        <div style="min-width:0;flex:1">
          <span class="proj-status ${st}">${PROJ_STATUS[st]}</span>
          <div class="proj-name">${escHtml(p.name)}</div>
        </div>
        <button class="icon-btn edit" data-a="editProject" data-v="${p.id}">···</button>
      </div>
      ${expanded&&p.note?`<div class="proj-note">${escHtml(p.note)}</div>`:''}
      ${spanTxt?`<div class="proj-span">📅 ${spanTxt}</div>`:''}
      ${prog?`<div class="proj-bar"><div class="bar-bg"><div class="bar-fill ok" style="width:${prog.pct}%"></div></div>
        <span class="proj-bar-lbl">任務 ${prog.done}/${prog.total}（${prog.pct}%）${countdown?'・'+countdown:''}</span></div>`
        :`<div class="proj-bar-lbl" style="margin:6px 0 0">${countdown||(spanTxt?'':'尚未安排起訖或階段')}</div>`}
      ${!expanded&&phases.length?`<div class="proj-collapsed-hint">${phases.length} 個階段・點展開</div>`:''}
    </div>
    ${expanded?`
    <div class="proj-status-pills">
      ${['todo','doing','done'].map(s=>`<button class="mini-pill${st===s?' on':''}" data-a="projStatus" data-pid="${p.id}" data-v="${s}">${PROJ_STATUS[s]}</button>`).join('')}
    </div>
    <div class="proj-phases">${phases.map(ph=>renderProjectPhase(p,ph)).join('')}</div>
    <button class="outline-btn" style="width:100%;margin-top:8px;padding:8px" data-a="newPhase" data-v="${p.id}">＋ 新增階段</button>`:''}
  </div>`;
}
function renderProjectPhase(p,ph){
  const ts=ph.tasks||[];
  const done=ts.filter(t=>t.done).length;
  return`<div class="proj-phase">
    <div class="proj-phase-head" data-a="editPhase" data-pid="${p.id}" data-v="${ph.id}">
      <span class="proj-phase-dot" style="background:${ph.color||'var(--p)'}"></span>
      <span class="proj-phase-name">${escHtml(ph.name)}</span>
      <span class="proj-phase-date">${ph.start.slice(5).replace('-','/')}–${ph.end.slice(5).replace('-','/')}${ts.length?` ・${done}/${ts.length}`:''}</span>
    </div>
    <div class="proj-tasks">
      ${ts.map(t=>`<div class="proj-task-row">
        <span class="goal-check${t.done?' done':''}" data-a="toggleProjTask" data-pid="${p.id}" data-phid="${ph.id}" data-v="${t.id}">${t.done?'✓':''}</span>
        <span class="proj-task-text${t.done?' done':''}" data-a="editTask" data-pid="${p.id}" data-phid="${ph.id}" data-v="${t.id}">${escHtml(t.text)}${t.due?`<span class="proj-task-due">${t.due.slice(5).replace('-','/')}</span>`:''}</span>
      </div>`).join('')}
    </div>
    <div class="goal-add-task">
      <input type="text" id="newptask-${ph.id}" placeholder="新增任務…">
      <button data-a="addProjTask" data-pid="${p.id}" data-v="${ph.id}">＋</button>
    </div>
  </div>`;
}
function renderEditProjectModal(){
  const f=state.editForm;
  return`<div class="overlay" id="modal-overlay"><div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title">${f.projId?'編輯專案':'新增專案'}</div>
    <div class="form-field" style="margin-bottom:12px"><label>專案名稱</label>
      <input class="form-input" id="ef-projname" type="text" placeholder="例：網站改版、搬家計畫" value="${escHtml(f.projName||'')}"></div>
    <div class="form-row">
      <div class="form-field"><label>專案開始日</label>
        <input class="form-input" id="ef-projstart" type="date" value="${f.projStart||''}"></div>
      <div class="form-field"><label>專案結束日</label>
        <input class="form-input" id="ef-projend" type="date" value="${f.projEnd||''}"></div>
    </div>
    <div class="form-field" style="margin-bottom:12px"><label>備註</label>
      <textarea class="form-input" id="ef-projnote" rows="2" placeholder="選填">${escHtml(f.projNote||'')}</textarea></div>
    <div class="slabel">狀態</div>
    <div class="acc-row" style="margin-bottom:14px">
      ${['todo','doing','done'].map(s=>`<button class="acc-pill${(f.projStatus||'todo')===s?' active':''}" data-a="projStatusForm" data-v="${s}">${PROJ_STATUS[s]}</button>`).join('')}
    </div>
    <div class="modal-btns">
      <button class="save-btn" data-a="saveProjBtn">儲存</button>
      <button class="outline-btn" data-a="closeModal">取消</button>
    </div>
    ${f.projId?`<button class="outline-btn" style="width:100%;margin-top:8px;color:var(--expense);border-color:var(--expense)" data-a="delProject" data-v="${f.projId}">🗑 刪除專案</button>`:''}
  </div></div>`;
}
function renderEditPhaseModal(){
  const f=state.editForm;
  return`<div class="overlay" id="modal-overlay"><div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title">${f.phaseId?'編輯階段':'新增階段'}</div>
    <div class="form-field" style="margin-bottom:12px"><label>階段名稱</label>
      <input class="form-input" id="ef-phasename" type="text" placeholder="例：設計、開發、測試" value="${escHtml(f.phaseName||'')}"></div>
    <div class="form-row">
      <div class="form-field"><label>開始日</label>
        <input class="form-input" id="ef-phasestart" type="date" value="${f.phaseStart||todayStr()}"></div>
      <div class="form-field"><label>結束日</label>
        <input class="form-input" id="ef-phaseend" type="date" value="${f.phaseEnd||''}"></div>
    </div>
    <div class="slabel">顏色</div>
    <div class="color-swatches" style="margin-bottom:14px">
      ${ACC_COLORS.map(c=>`<div class="swatch${(f.phaseColor||ACC_COLORS[0])===c?' sel':''}" style="background:${c}" data-a="phaseColor" data-v="${c}"></div>`).join('')}
    </div>
    <div class="modal-btns">
      <button class="save-btn" data-a="savePhaseBtn">儲存</button>
      <button class="outline-btn" data-a="closeModal">取消</button>
    </div>
    ${f.phaseId?`<button class="outline-btn" style="width:100%;margin-top:8px;color:var(--expense);border-color:var(--expense)" data-a="delPhase" data-pid="${f.phaseProjId}" data-v="${f.phaseId}">🗑 刪除階段</button>`:''}
  </div></div>`;
}
function renderEditTaskModal(){
  const f=state.editForm;
  return`<div class="overlay" id="modal-overlay"><div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title">編輯任務</div>
    <div class="form-field" style="margin-bottom:12px"><label>任務內容</label>
      <input class="form-input" id="ef-tasktext" type="text" value="${escHtml(f.taskText||'')}"></div>
    <div class="form-field" style="margin-bottom:14px"><label>截止日（選填）</label>
      <input class="form-input" id="ef-taskdue" type="date" value="${f.taskDue||''}"></div>
    <div class="modal-btns">
      <button class="save-btn" data-a="saveTaskBtn">儲存</button>
      <button class="outline-btn" data-a="closeModal">取消</button>
    </div>
    <button class="outline-btn" style="width:100%;margin-top:8px;color:var(--expense);border-color:var(--expense)" data-a="delProjTask" data-pid="${f.taskProjId}" data-phid="${f.taskPhaseId}" data-v="${f.taskId}">🗑 刪除任務</button>
  </div></div>`;
}
function renderHomeModule(){
  const n=new Date();
  const wd=['日','一','二','三','四','五','六'][n.getDay()];
  const hidden=state.homeHiddenCards||[];
  const tabDefs=[
    {id:'reminders',lbl:'七天內提醒',render:renderRemindersCard},
    {id:'dream',lbl:'夢想清單',render:renderDreamTeaserCard},
    {id:'goals',lbl:'目標設定',render:renderGoalsTeaserCard},
    {id:'project',lbl:'專案排程',render:renderProjectTeaserCard},
    {id:'course',lbl:'課程學習',render:renderCourseTeaserCard},
  ].filter(t=>!hidden.includes(t.id));
  let active=state.homeCardTab||'reminders';
  if(!tabDefs.find(t=>t.id===active))active=tabDefs.length?tabDefs[0].id:'reminders';
  state.homeCardTab=active;
  const activeDef=tabDefs.find(t=>t.id===active);
  // 電腦版（寬螢幕）：原本並排兩欄，四張卡片同時顯示
  const leftHtml=(hidden.includes('reminders')?'':renderRemindersCard())+renderCalView({compact:true});
  const rightHtml=tabDefs.filter(t=>t.id!=='reminders').map(t=>t.render()).join('');
  // 手機版（窄螢幕）：合併成頁籤，一次只顯示選中的卡片內容
  const tabBar=tabDefs.length?`<div class="chips home-tab-chips">${tabDefs.map(t=>
    `<button class="chip${t.id===active?' ac':''}" data-a="homeCardTab" data-v="${t.id}">${t.lbl}</button>`
  ).join('')}</div>`:'';
  const mobileHtml=`${tabBar}${activeDef?activeDef.render():''}${renderCalView({compact:true})}`;
  return`<div class="content content-fluid">
    <div class="dash-greet">
      <h1>${greetingText()} 👋</h1>
      <div class="dash-date">${n.getFullYear()} 年 ${n.getMonth()+1} 月 ${n.getDate()} 日・星期${wd}</div>
    </div>
    <div class="home-2col">
      <div class="home-col-left">${leftHtml}</div>
      <div class="home-col-right">${rightHtml}</div>
    </div>
    <div class="home-tabs-mobile">${mobileHtml}</div>
  </div>`;
}
function renderPlaceholderModule(emoji,lbl){
  return`<div class="hdr"><div class="hdr-in">
    <h1>${lbl}</h1>
    <div class="sub">這個模組正在規劃中</div>
  </div></div>
  <div class="content" style="padding-top:12px">
    <div class="empty">
      <div class="ei">${emoji}</div>
      <p>${lbl}功能即將推出，敬請期待</p>
    </div>
  </div>`;
}
// ── RENDER: GOALS / DREAMS ──────────────────────────────────────────────────
function renderGoalsModule(){
  const goals=state.goals||[];
  const filter=state.goalTypeFilter||'all';
  const filtered=filter==='all'?goals:goals.filter(g=>g.type===filter);
  const tabs=[{id:'all',lbl:'全部'},{id:'goal',lbl:'🎯 目標'},{id:'dream',lbl:'🌟 夢想'}];
  return`<div class="hdr"><div class="hdr-in">
    <h1>目標設定</h1>
    <div class="sub">寫下你的目標或夢想，拆解成小任務一步步達成</div>
  </div></div>
  <div class="content" style="padding-top:12px">
    <button class="save-btn" data-a="newGoal" style="margin-bottom:14px">＋ 新增目標／夢想</button>
    <div class="chips">${tabs.map(t=>
      `<button class="chip${filter===t.id?' ac':''}" data-a="goalTypeFilt" data-v="${t.id}">${t.lbl}</button>`
    ).join('')}</div>
    ${filtered.length?filtered.map(g=>renderGoalCard(g)).join(''):`
      <div class="empty"><div class="ei">🎯</div><p>還沒有任何項目，點上面按鈕新增一個吧</p></div>`}
  </div>`;
}
function renderGoalCard(g){
  const tasks=g.tasks||[];
  const gp=goalProgress(g);
  const typeLbl=g.type==='dream'?'🌟 夢想':'🎯 目標';
  const typeCls=g.type==='dream'?'dream':'goal';
  return`<div class="goal-card${g.achieved?' achieved':''}">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:6px">
      <div style="min-width:0;flex:1">
        <span class="goal-type-badge ${typeCls}">${typeLbl}</span>
        <div style="font-size:17px;font-weight:800;margin-top:4px;${g.achieved?'text-decoration:line-through;color:var(--text2)':''}">${escHtml(g.name)}</div>
      </div>
      <button class="icon-btn edit" data-a="editGoal" data-v="${g.id}" style="flex-shrink:0">···</button>
    </div>
    ${gp?`<div style="margin-bottom:8px">
      <div class="bar-bg"><div class="bar-fill ok" style="width:${gp.pct}%"></div></div>
      <div style="font-size:11px;color:var(--text2);margin-top:3px">已完成 ${gp.done}/${gp.total}（${gp.pct}%）</div>
    </div>`:''}
    <div class="goal-tasks">
      ${tasks.map(t=>`<div class="goal-task-row">
        <span class="goal-check${t.done?' done':''}" data-a="toggleGoalTask" data-id="${g.id}" data-v="${t.id}">${t.done?'✓':''}</span>
        <span class="goal-task-text${t.done?' done':''}">${escHtml(t.text)}</span>
        <span class="goal-task-del" data-a="delGoalTask" data-id="${g.id}" data-v="${t.id}">✕</span>
      </div>`).join('')}
    </div>
    <div class="goal-add-task">
      <input type="text" id="newtask-${g.id}" placeholder="新增小任務…">
      <button data-a="addGoalTask" data-v="${g.id}">＋</button>
    </div>
    <div style="margin-top:10px;display:flex;justify-content:flex-end">
      ${g.achieved?`<button class="outline-btn" style="padding:6px 14px;font-size:13px" data-a="toggleGoalAchieved" data-v="${g.id}">↺ 取消達成</button>`
        :`<button class="save-btn green" style="padding:6px 14px;font-size:13px;width:auto" data-a="toggleGoalAchieved" data-v="${g.id}">✓ 標記已達成</button>`}
    </div>
  </div>`;
}
function renderEditGoalModal(){
  const f=state.editForm;
  return`<div class="overlay" id="modal-overlay"><div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title">${f.goalId?'編輯項目':'新增目標／夢想'}</div>
    <div class="slabel">類型</div>
    <div class="acc-row" style="margin-bottom:14px">
      <button class="acc-pill${f.goalType!=='dream'?' active':''}" data-a="goalType" data-v="goal">🎯 目標</button>
      <button class="acc-pill${f.goalType==='dream'?' active':''}" data-a="goalType" data-v="dream">🌟 夢想</button>
    </div>
    <div class="form-field" style="margin-bottom:14px"><label>名稱</label>
      <input class="form-input" id="ef-goalname" type="text" placeholder="例：學會游泳、去日本旅遊" value="${escHtml(f.goalName||'')}"></div>
    <div class="modal-btns">
      <button class="save-btn" data-a="saveGoalBtn">儲存</button>
      <button class="outline-btn" data-a="closeModal">取消</button>
    </div>
    ${f.goalId?`<button class="outline-btn" style="width:100%;margin-top:8px;color:var(--expense);border-color:var(--expense)" data-a="delGoal" data-v="${f.goalId}">🗑 刪除</button>`:''}
  </div></div>`;
}
// ── RENDER: GRATITUDE JOURNAL ────────────────────────────────────────────────
function renderGratitudeModule(){
  const{y,m}=state.gratMonth;
  const monthEntries=state.gratitude
    .filter(g=>{const d=parseD(g.date);return d.getFullYear()===y&&d.getMonth()===m;})
    .sort((a,b)=>a.date<b.date?-1:1);
  const total=state.gratitude.length;
  return`<div class="hdr"><div class="hdr-in">
    <h1>感恩日記</h1>
    <div class="sub">寫下每天值得感恩的小事</div>
  </div></div>
  <div class="content" style="padding-top:12px">
    <button class="save-btn" data-a="newGrat" style="margin-bottom:14px">＋ 新增感恩</button>
    <div class="grat-layout">
      <div class="grat-cal-col">
        <div class="card" style="padding:14px">
          <div class="cal-nav">
            <button class="cal-nb" data-a="gprev">‹</button>
            <span class="cal-title-text" style="flex:1;text-align:center">${y}年${MONTHS[m]}</span>
            <button class="cal-nb" data-a="gnext">›</button>
          </div>
          <div class="cmini-cal" style="margin-top:8px">
            <div class="weekdays">${['日','一','二','三','四','五','六'].map(d=>`<div class="wday">${d}</div>`).join('')}</div>
            <div class="cmini-grid">${renderGratCalCells(y,m)}</div>
          </div>
          <div style="font-size:12px;color:var(--text2);margin-top:8px">點日期可新增或編輯當天的感恩日記</div>
        </div>
      </div>
      <div class="grat-list-col">
        <div class="card" style="padding:14px">
          <div class="card-title" style="margin-bottom:6px">本月紀錄</div>
          <div class="grat-count"><b>${monthEntries.length}</b> 篇<span class="grat-count-total">・累積 ${total} 篇</span></div>
          <div class="grat-entry-list">
            ${monthEntries.length?monthEntries.map(g=>{
              const d=parseD(g.date);
              return`<div class="grat-entry" data-a="editGrat" data-v="${g.id}">
                <div class="grat-entry-date">${d.getMonth()+1}/${d.getDate()}</div>
                <div class="grat-entry-text">${escHtml(g.text)}</div>
              </div>`;
            }).join(''):`<div class="empty" style="padding:24px 10px"><div class="ei">🙏</div><p>這個月還沒有感恩紀錄</p></div>`}
          </div>
        </div>
      </div>
    </div>
  </div>`;
}
function renderGratCalCells(y,m){
  const first=new Date(y,m,1).getDay();
  const days=new Date(y,m+1,0).getDate();
  const today=todayStr();
  const byDate={};
  state.gratitude.forEach(g=>{byDate[g.date]=g;});
  let cells=Array.from({length:first},()=>'<div class="cmini-day empty"></div>').join('');
  for(let d=1;d<=days;d++){
    const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const has=byDate[ds];
    cells+=`<div class="cmini-day${has?' grat-on':''}${ds===today?' today':''}" data-a="gratDay" data-v="${ds}"${has?` title="${escHtml(has.text)}"`:''}>${d}</div>`;
  }
  return cells;
}
function renderEditGratModal(){
  const f=state.editForm;
  return`<div class="overlay" id="modal-overlay"><div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title">${f.gratId?'編輯感恩日記':'新增感恩日記'}</div>
    <div class="form-field" style="margin-bottom:14px"><label>日期</label>
      <input class="form-input" id="ef-gratdate" type="date" value="${f.gratDate||todayStr()}"></div>
    <div class="form-field" style="margin-bottom:14px"><label>今天要感恩的事</label>
      <textarea class="form-input" id="ef-grattext" rows="4" placeholder="寫下今天值得感謝的人事物…">${escHtml(f.gratText||'')}</textarea></div>
    <div class="modal-btns">
      <button class="save-btn" data-a="saveGratBtn">儲存</button>
      <button class="outline-btn" data-a="closeModal">取消</button>
    </div>
    ${f.gratId?`<button class="outline-btn" style="width:100%;margin-top:8px;color:var(--expense);border-color:var(--expense)" data-a="delGrat" data-v="${f.gratId}">🗑 刪除</button>`:''}
  </div></div>`;
}
// ── RENDER: HABITS ─────────────────────────────────────────────────────────
function renderHabitModule(){
  const all=state.habits||[];
  const active=all.filter(h=>!h.archived);
  const archived=all.filter(h=>h.archived);
  const view=state.habitView||'active';
  const filter=state.habitFilter||'all';
  let list;
  if(view==='archived')list=archived;
  else if(filter==='all')list=active;
  else list=active.filter(h=>(h.freqType||'daily')===filter);
  const tabs=[{id:'all',lbl:'全部'},{id:'daily',lbl:'每日'},{id:'weekly',lbl:'每週'}];
  const today=todayStr();
  const doneToday=active.filter(h=>habitDoneOn(h,today)).length;
  // 左側月曆顯示的習慣（封存的也可回顧）
  let sel=state.habitSelected&&all.find(h=>h.id===state.habitSelected);
  if(view==='archived'&&(!sel||!sel.archived))sel=archived[0]||sel||null;
  if(!sel)sel=active[0]||archived[0]||null;
  state.habitSelected=sel?sel.id:null;
  return`<div class="hdr"><div class="hdr-in">
    <h1>習慣養成</h1>
    <div class="sub">每天完成一點，累積成長的軌跡</div>
  </div></div>
  <div class="content" style="padding-top:12px">
    <button class="save-btn" data-a="newHabit" style="margin-bottom:14px">＋ 新增習慣</button>
    ${all.length?`<div class="habit-layout">
      <div class="habit-cal-col">${sel?renderHabitCalCard(sel):''}</div>
      <div class="habit-list-col">
        <div class="stabs" style="margin-bottom:12px">
          <button class="stab${view==='active'?' active':''}" data-a="habitView" data-v="active">建立中 (${active.length})</button>
          <button class="stab${view==='archived'?' active':''}" data-a="habitView" data-v="archived">封存 (${archived.length})</button>
        </div>
        ${view==='active'?`<div class="chips">${tabs.map(t=>
          `<button class="chip${filter===t.id?' ac':''}" data-a="habitFilt" data-v="${t.id}">${t.lbl}</button>`
        ).join('')}</div>`:''}
        ${view==='active'&&active.length?`<div class="habit-summary">今天已完成 <b>${doneToday}</b> / ${active.length} 個習慣</div>`:''}
        ${list.length?list.map(h=>renderHabitCard(h,today,sel&&sel.id===h.id)).join(''):`
          <div class="empty" style="padding:30px 20px"><p>${view==='archived'?'沒有封存的習慣':'這個分類沒有習慣'}</p></div>`}
      </div>
    </div>`:`<div class="empty"><div class="ei">🌱</div><p>還沒有任何習慣，點上面按鈕新增一個吧</p></div>`}
  </div>`;
}
function renderHabitCalCard(h){
  const ym=state.habitMonthYM||{y:new Date().getFullYear(),m:new Date().getMonth()};
  const{y,m}=ym;
  const first=new Date(y,m,1).getDay();
  const days=new Date(y,m+1,0).getDate();
  const col=h.color||'#7A9878';
  const today=todayStr();
  let cells=Array.from({length:first},()=>'<div class="cmini-day empty"></div>').join('');
  let doneCnt=0;
  for(let d=1;d<=days;d++){
    const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const on=habitDoneOn(h,ds);if(on)doneCnt++;
    const future=ds>today;
    cells+=`<div class="cmini-day${on?' on':''}${ds===today?' today':''}" ${future?'':`data-a="toggleHabitDay" data-v="${ds}"`} style="${on?`background:${col};border-color:${col};color:#fff`:''}${future?';opacity:.35':''}">${d}</div>`;
  }
  return`<div class="card" style="padding:14px">
    <div class="habit-cal-title">${escHtml(h.icon||'✅')} ${escHtml(h.name)}${h.archived?'<span class="habit-arch-tag">已封存</span>':''}</div>
    <div class="cal-nav" style="margin-top:10px">
      <button class="cal-nb" data-a="habitMonthPrev">‹</button>
      <span class="cal-title-text" style="flex:1;text-align:center">${y}年${MONTHS[m]}・完成 ${doneCnt} 天</span>
      <button class="cal-nb" data-a="habitMonthNext">›</button>
    </div>
    <div class="cmini-cal" style="margin-top:8px">
      <div class="weekdays">${['日','一','二','三','四','五','六'].map(d=>`<div class="wday">${d}</div>`).join('')}</div>
      <div class="cmini-grid">${cells}</div>
    </div>
    <div style="font-size:12px;color:var(--text2);margin-top:8px">點格子可補打卡／取消（未來日期不可點）</div>
  </div>`;
}
function renderHabitCard(h,today,selected){
  const weekly=(h.freqType||'daily')==='weekly';
  const col=h.color||'#7A9878';
  if(h.archived){
    return`<div class="habit-card${selected?' sel':''}" data-a="habitSelect" data-v="${h.id}">
      <div class="habit-top">
        <div class="habit-info">
          <div class="habit-name" style="color:var(--text2)">${escHtml(h.icon||'✅')} ${escHtml(h.name)}</div>
          <div class="habit-meta"><span>共完成 ${(h.dates||[]).length} 天</span></div>
        </div>
        <button class="icon-btn edit" data-a="editHabit" data-v="${h.id}">···</button>
      </div>
      <button class="outline-btn" style="width:100%;margin-top:6px;padding:7px" data-a="unarchiveHabit" data-v="${h.id}">↩ 取消封存</button>
    </div>`;
  }
  const done=habitDoneOn(h,today);
  const streak=habitStreak(h);
  const wk=habitWeekCount(h);
  const target=weekly?(h.freqTimes||3):7;
  const pct=Math.min(Math.round((wk/target)*100),100);
  const rate=habitRate(h,30);
  return`<div class="habit-card${selected?' sel':''}" data-a="habitSelect" data-v="${h.id}">
    <div class="habit-top">
      <button class="habit-check${done?' done':''}" data-a="toggleHabit" data-v="${h.id}" style="${done?`background:${col};border-color:${col}`:`border-color:${col}`}">${done?'✓':''}</button>
      <div class="habit-info">
        <div class="habit-name">${escHtml(h.icon||'✅')} ${escHtml(h.name)}</div>
        <div class="habit-meta">
          <span>🔥 連續 ${streak} ${weekly?'週':'天'}</span><span class="dot">·</span>
          <span>${weekly?`本週 ${wk}/${target}`:`近 30 天 ${rate}%`}</span>
        </div>
      </div>
      <button class="icon-btn edit" data-a="editHabit" data-v="${h.id}">···</button>
    </div>
    <div class="habit-bar"><div class="bar-bg"><div class="bar-fill" style="width:${pct}%;background:${col}"></div></div>
      <span class="habit-bar-lbl">${weekly?'本週進度':'本週完成 '+wk+'/7'}</span></div>
    <div class="habit-strip">${habitRecentStrip(h,14,col)}</div>
  </div>`;
}
function habitRecentStrip(h,n,col){
  let out='';
  for(let i=n-1;i>=0;i--){
    const ds=ymd(addDays(todayStr(),-i));
    const on=habitDoneOn(h,ds);
    out+=`<span class="hs-cell${on?' on':''}"${on?` style="background:${col}"`:''}></span>`;
  }
  return out;
}
function renderEditHabitModal(){
  const f=state.editForm;
  const weekly=f.habitFreqType==='weekly';
  return`<div class="overlay" id="modal-overlay"><div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title">${f.habitId?'編輯習慣':'新增習慣'}</div>
    <div class="form-field" style="margin-bottom:12px"><label>名稱</label>
      <input class="form-input" id="ef-habitname" type="text" placeholder="例：喝 2000cc 水、閱讀 20 分鐘" value="${escHtml(f.habitName||'')}"></div>
    <div class="form-field" style="max-width:90px;margin-bottom:12px"><label>圖示</label>
      <button class="icon-field" id="emoji-field-btn" data-a="toggleEmojiPicker" data-field="icon">${escHtml(f.icon||'✅')}</button>
      <input id="ef-icon" type="hidden" value="${escHtml(f.icon||'✅')}">
    </div>
    <div id="emoji-picker-grid" class="emoji-grid" style="display:none;margin-bottom:14px">
      ${EMOJI_QUICK.map(e=>`<button class="emoji-btn${(f.icon||'')===e?' active':''}" data-a="pickEmoji" data-v="${e}">${e}</button>`).join('')}
    </div>
    <div class="slabel">顏色</div>
    <div class="color-swatches" style="margin-bottom:14px">
      ${ACC_COLORS.map(c=>`<div class="swatch${(f.habitColor||ACC_COLORS[2])===c?' sel':''}" style="background:${c}" data-a="habitColor" data-v="${c}"></div>`).join('')}
    </div>
    <div class="slabel">頻率</div>
    <div class="acc-row" style="margin-bottom:12px">
      <button class="acc-pill${!weekly?' active':''}" data-a="habitFreqType" data-v="daily">每天</button>
      <button class="acc-pill${weekly?' active':''}" data-a="habitFreqType" data-v="weekly">每週 N 次</button>
    </div>
    ${weekly?`<div class="form-field" style="margin-bottom:14px"><label>每週目標次數</label>
      <input class="form-input" id="ef-habittimes" type="number" inputmode="numeric" min="1" max="7" value="${f.habitFreqTimes||3}"></div>`:''}
    <div class="modal-btns">
      <button class="save-btn" data-a="saveHabitBtn">儲存</button>
      <button class="outline-btn" data-a="closeModal">取消</button>
    </div>
    ${f.habitId?`<button class="outline-btn" style="width:100%;margin-top:8px" data-a="${f.habitArchived?'unarchiveHabit':'archiveHabit'}" data-v="${f.habitId}">${f.habitArchived?'↩ 取消封存':'📦 封存習慣'}</button>`:''}
    ${f.habitId?`<button class="outline-btn" style="width:100%;margin-top:8px;color:var(--expense);border-color:var(--expense)" data-a="delHabit" data-v="${f.habitId}">🗑 刪除</button>`:''}
  </div></div>`;
}
// ── RENDER: MENSTRUAL CYCLE ────────────────────────────────────────────────
function renderCycleModule(){
  const s=cycleStats();
  const{y,m}=state.cycleMonth;
  return`<div class="hdr"><div class="hdr-in">
    <h1>月經週期</h1>
    <div class="sub">記錄經期，預測下次來潮與易孕期</div>
  </div></div>
  <div class="content" style="padding-top:12px">
    <div style="display:flex;gap:8px;margin-bottom:14px">
      <button class="save-btn" data-a="newCycle" style="flex:1">＋ 記錄經期</button>
      <button class="outline-btn" data-a="openCycleSettings" style="flex-shrink:0">⚙ 設定</button>
    </div>
    <div class="cycle-layout">
      <div class="cycle-cal-col">
        <div class="card" style="padding:14px">
          <div class="cycle-legend">
            <span><i class="lg period"></i>經期</span>
            <span><i class="lg predict"></i>預測經期</span>
            <span><i class="lg fertile"></i>易孕期</span>
            <span><i class="lg ovu"></i>排卵日</span>
            <span><i class="lg sex">♥</i>性行為</span>
          </div>
          <div class="cal-nav" style="margin-top:12px">
            <button class="cal-nb" data-a="cyprev">‹</button>
            <span class="cal-title-text" style="flex:1;text-align:center">${y}年${MONTHS[m]}</span>
            <button class="cal-nb" data-a="cynext">›</button>
          </div>
          <div class="cmini-cal">
            <div class="weekdays">${['日','一','二','三','四','五','六'].map(d=>`<div class="wday">${d}</div>`).join('')}</div>
            <div class="cmini-grid">${renderCycleCalCells(y,m,s)}</div>
          </div>
        </div>
      </div>
      <div class="cycle-side-col">
        ${renderCycleStatusCard(s)}
        ${renderCycleStatsSection(s)}
      </div>
    </div>
  </div>`;
}
function renderCycleStatusCard(s){
  if(!s.last)return`<div class="card cycle-status"><div class="empty" style="padding:24px 10px"><div class="ei">🌸</div><p>還沒有經期紀錄，點上方按鈕記錄第一次</p></div></div>`;
  const phaseColor={'月經期':'#B87878','濾泡期':'#7A9878','易孕期':'#8B6CC8','排卵日':'#8B6CC8','黃體期':'#B89860'}[s.phase]||'var(--p)';
  const du=s.daysUntil;
  const duText=du>0?`預計 ${du} 天後來潮`:du===0?'預計今天來潮':`已延遲 ${-du} 天`;
  const pms=s.showPredict&&du<=3&&du>=0;
  return`<div class="card cycle-status">
    <div class="cs-row">
      <div class="cs-big">週期第 <b>${s.cycleDay}</b> 天</div>
      <span class="cs-phase" style="background:${phaseColor}">${s.phase}</span>
    </div>
    <div class="cs-next">${duText}${s.predictNextStart?`（${parseD(s.predictNextStart).getMonth()+1}/${parseD(s.predictNextStart).getDate()}）`:''}</div>
    ${s.showPredict&&s.ovulation?`<div class="cs-sub">預估排卵日 ${parseD(s.ovulation).getMonth()+1}/${parseD(s.ovulation).getDate()}・易孕期 ${parseD(s.fertileStart).getMonth()+1}/${parseD(s.fertileStart).getDate()}–${parseD(s.fertileEnd).getMonth()+1}/${parseD(s.fertileEnd).getDate()}</div>`:''}
    ${pms?`<div class="cs-pms">🌙 接近經期，可能出現經前症候群，記得多休息</div>`:''}
  </div>`;
}
function renderCycleCalCells(y,m,s){
  const first=new Date(y,m,1).getDay();
  const days=new Date(y,m+1,0).getDate();
  const today=todayStr();
  let cells=Array.from({length:first},()=>'<div class="cmini-day empty"></div>').join('');
  for(let d=1;d<=days;d++){
    const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    let cls='cmini-day cyc';
    if(s.periodDays.has(ds))cls+=' period';
    else if(s.predictedDays.has(ds))cls+=' predict';
    else if(s.fertileDays.has(ds))cls+=' fertile';
    if(s.ovulationDays.has(ds))cls+=' ovu';
    if(ds===today)cls+=' today';
    const log=(state.cycleLogs||[]).find(l=>l.date===ds);
    const hasNote=log&&(log.flow||(log.symptoms||[]).length||(log.moods||[]).length||log.note);
    const mark=hasNote?'<span class="cyc-dot"></span>':'';
    const sexMark=log&&log.sex?`<span class="cyc-sex">♥</span>`:'';
    cells+=`<div class="${cls}" data-a="openCycleDay" data-v="${ds}">${d}${mark}${sexMark}</div>`;
  }
  return cells;
}
function renderCycleStatsSection(s){
  const hist=s.cycles.slice().reverse().slice(0,8);
  const gapMax=Math.max(35,...s.gaps);
  return`<div class="card" style="padding:14px">
    <div class="card-title" style="margin-bottom:10px">週期統計</div>
    <div class="cyc-stat-row">
      <div class="cyc-stat"><div class="v">${s.avgCycle}</div><div class="l">平均週期</div></div>
      <div class="cyc-stat"><div class="v">${s.avgPeriod}</div><div class="l">平均經期</div></div>
      <div class="cyc-stat"><div class="v">${s.cycles.length}</div><div class="l">紀錄次數</div></div>
    </div>
    ${s.recentGaps.length?`<div class="cyc-bars">${s.recentGaps.map((g,i)=>`
      <div class="cyc-bar-col"><div class="cyc-bar" style="height:${Math.round(g/gapMax*70)}px"></div><span>${g}</span></div>`).join('')}</div>
      <div style="font-size:11px;color:var(--text2);text-align:center">近幾次週期長度</div>`:''}
    <div class="cyc-hist">${hist.length?hist.map(c=>{
      const len=c.end?daysBetween(c.start,c.end)+1:null;
      return`<div class="cyc-hist-row" data-a="editCycleRec" data-v="${c.id}">
        <span>${parseD(c.start).getFullYear()}/${parseD(c.start).getMonth()+1}/${parseD(c.start).getDate()}${c.end?` – ${parseD(c.end).getMonth()+1}/${parseD(c.end).getDate()}`:'（進行中）'}</span>
        <span class="cyc-hist-len">${len?len+' 天':''}</span>
      </div>`;}).join(''):'<div style="font-size:13px;color:var(--text2)">尚無紀錄</div>'}</div>
  </div>`;
}
function renderEditCycleModal(){
  const f=state.editForm;
  return`<div class="overlay" id="modal-overlay"><div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title">${f.cycleId?'編輯經期紀錄':'記錄經期'}</div>
    <div class="form-field" style="margin-bottom:14px"><label>經期開始日</label>
      <input class="form-input" id="ef-cyclestart" type="date" value="${f.cycleStart||todayStr()}"></div>
    <div class="form-field" style="margin-bottom:14px"><label>經期結束日（可留空，之後補填）</label>
      <input class="form-input" id="ef-cycleend" type="date" value="${f.cycleEnd||''}"></div>
    <div class="modal-btns">
      <button class="save-btn" data-a="saveCycleBtn">儲存</button>
      <button class="outline-btn" data-a="closeModal">取消</button>
    </div>
    ${f.cycleId?`<button class="outline-btn" style="width:100%;margin-top:8px;color:var(--expense);border-color:var(--expense)" data-a="delCycleRec" data-v="${f.cycleId}">🗑 刪除</button>`:''}
  </div></div>`;
}
function renderCycleDayModal(){
  const f=state.editForm;
  const ds=f.cycleDayDate;
  const d=parseD(ds);
  const flows=[{id:'light',lbl:'少'},{id:'medium',lbl:'中'},{id:'heavy',lbl:'多'}];
  const moods=['開心','平靜','煩躁','低落','焦慮','易怒'];
  const symptoms=['腹痛','頭痛','腰痠','乳房脹痛','疲倦','食慾增加','長痘','水腫','失眠','噁心'];
  const selMoods=f.dayMoods||[],selSym=f.daySymptoms||[];
  const isStart=(state.cycles||[]).some(c=>c.start===ds);
  return`<div class="overlay" id="modal-overlay"><div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title">${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()} 紀錄</div>
    <div class="acc-row" style="margin-bottom:14px">
      <button class="acc-pill${isStart?' active':''}" data-a="cycleMarkStart" data-v="${ds}">${isStart?'✓ 已設為經期開始':'設為經期開始'}</button>
      <button class="acc-pill" data-a="cycleMarkEnd" data-v="${ds}">設為經期結束</button>
    </div>
    <div class="slabel">性行為</div>
    <div class="acc-row" style="margin-bottom:14px">
      <button class="acc-pill${f.daySex==='protected'?' active':''}" data-a="daySex" data-v="protected">有・保護</button>
      <button class="acc-pill${f.daySex==='unprotected'?' active':''}" data-a="daySex" data-v="unprotected">有・無保護</button>
    </div>
    <div class="slabel">經血量</div>
    <div class="acc-row" style="margin-bottom:14px">
      ${flows.map(x=>`<button class="acc-pill${f.dayFlow===x.id?' active':''}" data-a="dayFlow" data-v="${x.id}">${x.lbl}</button>`).join('')}
    </div>
    <div class="slabel">心情</div>
    <div class="tag-wrap" style="margin-bottom:14px">
      ${moods.map(x=>`<button class="tag-btn${selMoods.includes(x)?' on':''}" data-a="dayMood" data-v="${x}">${x}</button>`).join('')}
    </div>
    <div class="slabel">症狀</div>
    <div class="tag-wrap" style="margin-bottom:14px">
      ${symptoms.map(x=>`<button class="tag-btn${selSym.includes(x)?' on':''}" data-a="daySymptom" data-v="${x}">${x}</button>`).join('')}
    </div>
    <div class="form-field" style="margin-bottom:14px"><label>備註</label>
      <textarea class="form-input" id="ef-daynote" rows="2" placeholder="想記下的其他事…">${escHtml(f.dayNote||'')}</textarea></div>
    <div class="modal-btns">
      <button class="save-btn" data-a="saveCycleDayBtn">儲存</button>
      <button class="outline-btn" data-a="closeModal">取消</button>
    </div>
  </div></div>`;
}
function renderCycleSettingsModal(){
  const st=state.cycleSettings||{};
  return`<div class="overlay" id="modal-overlay"><div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title">週期設定</div>
    <div class="form-field" style="margin-bottom:14px"><label>平均週期長度（天）— 有足夠紀錄時會自動計算</label>
      <input class="form-input" id="ef-setavgcycle" type="number" inputmode="numeric" value="${st.avgCycle||28}"></div>
    <div class="form-field" style="margin-bottom:14px"><label>平均經期長度（天）</label>
      <input class="form-input" id="ef-setavgperiod" type="number" inputmode="numeric" value="${st.avgPeriod||5}"></div>
    <div class="form-field" style="margin-bottom:14px"><label>黃體期長度（天，一般 12–16）</label>
      <input class="form-input" id="ef-setluteal" type="number" inputmode="numeric" value="${st.luteal||14}"></div>
    <div class="setting-row" style="border:none;padding:4px 0">
      <span style="flex:1;font-weight:600">顯示排卵／易孕期／經期預測</span>
      <button class="sw ${st.showPredict!==false?'on':'off'}" data-a="toggleCyclePredict"></button>
    </div>
    <div class="modal-btns">
      <button class="save-btn" data-a="saveCycleSettingsBtn">儲存</button>
      <button class="outline-btn" data-a="closeModal">取消</button>
    </div>
  </div></div>`;
}
function renderMobileHubBar(){
  const cur=MODULES.find(t=>isModuleActive(t));
  return`<div class="hub-bar">
    <button class="hub-btn-inline" data-a="moduleMenu">☰</button>
    <span class="hub-bar-title">${cur?cur.lbl:''}</span>
  </div>`;
}
function renderModuleMenuModal(){
  return`<div class="overlay" id="modal-overlay"><div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title">切換功能</div>
    <div class="book-picker-list">${getOrderedModules().map(t=>
      `<div class="book-picker-item${isModuleActive(t)?' active':''}" data-mod-id="${t.id}" data-module="${t.module}"${t.view?` data-view="${t.view}"`:''}${t.settingsTab?` data-settings-tab="${t.settingsTab}"`:''}>
        <div class="book-picker-info"><div class="book-picker-name">${t.lbl}</div></div>
        ${isModuleActive(t)?'<span style="color:var(--p);font-size:20px">✓</span>':''}
        <span class="drag-handle" title="拖曳排序">⠿</span>
      </div>`
    ).join('')}</div>
    <button class="outline-btn" style="width:100%;margin-top:10px" data-a="closeModal">關閉</button>
  </div></div>`;
}
function renderSidebar(){
  return`<aside class="sidebar">
    <div class="sb-title-row">
      <div class="sb-title">我的工作台</div>
    </div>
    <nav class="snb">${getOrderedModules().map(t=>
      `<button class="snb-btn${isModuleActive(t)?' active':''}" data-mod-id="${t.id}" data-module="${t.module}"${t.view?` data-view="${t.view}"`:''}${t.settingsTab?` data-settings-tab="${t.settingsTab}"`:''}>
        <span class="snb-lbl">${t.lbl}</span>
        <span class="drag-handle" title="拖曳排序">⠿</span>
      </button>`
    ).join('')}</nav>
  </aside>`;
}
function renderTopBar(){
  const tabs=[{id:'add',img:'home',lbl:'首頁'},{id:'calendar',img:'calendar',lbl:'行事曆'},
    {id:'assets',img:'assets',lbl:'資產'},{id:'stats',img:'stats',lbl:'統計'},
    {id:'settings',img:'settings',lbl:'設定'}];
  return`<div class="top-bar"><div class="tbi"><div class="top-logo">🏡 工作台</div>
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
  const activeView=(['history'].includes(state.view)?'stats':state.view);
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
  if(type==='moduleMenu')return renderModuleMenuModal();
  if(type==='editGoal')return renderEditGoalModal();
  if(type==='editGrat')return renderEditGratModal();
  if(type==='editHabit')return renderEditHabitModal();
  if(type==='editProject')return renderEditProjectModal();
  if(type==='editPhase')return renderEditPhaseModal();
  if(type==='editTask')return renderEditTaskModal();
  if(type==='editCycle')return renderEditCycleModal();
  if(type==='cycleDay')return renderCycleDayModal();
  if(type==='cycleSettings')return renderCycleSettingsModal();
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

  const dfCard=renderDreamFundCard();

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
      const inBook=f=>state.activeBook==='all'||f.bookId===state.activeBook||!f.bookId;
      const fxs=state.fixedExpenses.filter(inBook);
      const income=state.budgetIncome||0;
      const monthlyTotal=fxs.filter(f=>f.active!==false).reduce((s,f)=>s+fixedMonthlyEq(f),0);
      const remain=income-monthlyTotal;
      const freqLabel={monthly:'每月',quarterly:'每季',yearly:'每年'};
      const rows=fxs.map(f=>{
        const eq=fixedMonthlyEq(f);
        const paused=f.active===false;
        const planOnly=f.autoLog===false;
        const isConv=f.frequency&&f.frequency!=='monthly';
        return`<div class="plan-row${paused?' paused':''}" data-a="editFixed" data-v="${f.id}">
          <span class="plan-ico">${f.icon||'📋'}</span>
          <span class="plan-name">${escHtml(f.name)}</span>
          <span class="plan-tags">
            <span class="plan-tag">${freqLabel[f.frequency]||'每月'}</span>
            ${planOnly?'<span class="plan-tag plan-tag-plan">只列預算</span>':''}
            ${paused?'<span class="plan-tag">暫停</span>':''}
          </span>
          <span class="plan-amt">
            <span class="plan-eq">$${fmt(eq)}<span class="plan-eq-unit">/月</span></span>
            ${isConv?`<span class="plan-orig">${freqLabel[f.frequency]} $${fmt(f.amount)}</span>`:''}
          </span>
        </div>`;
      }).join('');
      return`<div class="card plan-card" style="margin-bottom:12px">
        <div class="plan-hd"><span class="plan-title">🧮 本月預算規劃</span></div>
        <div class="plan-income">
          <label>本月收入</label>
          <div class="plan-income-in"><span>$</span><input id="plan-income" type="number" inputmode="decimal" placeholder="0" value="${income||''}"></div>
        </div>
        <div class="plan-list">
          ${rows||`<div class="empty" style="padding:14px 0"><p style="font-size:13px">尚未新增固定花費，點下方新增</p></div>`}
        </div>
        <button class="add-fab" data-a="newFixed" style="margin:4px 0 12px">＋ 新增固定花費</button>
        <div class="plan-sum">
          <div class="plan-sum-row"><span>每月固定支出合計</span><b class="plan-neg">-$${fmt(monthlyTotal)}</b></div>
          <div class="plan-sum-row plan-sum-total"><span>剩餘可支配</span><b id="plan-remain" class="${remain>=0?'plan-pos':'plan-neg'}">${remain<0?'-':''}$${fmt(remain)}</b></div>
          <div class="plan-hint">💡 每年費用已自動 ÷12 進位到百位換算成每月；「只列預算」的項目算進合計但不會自動記帳。</div>
        </div>
      </div>`;
    })()}
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
  const tab=(['fixed','insurance'].includes(state.assetsTab)?'accounts':state.assetsTab)||'accounts';
  const subTabs=[{id:'accounts',lbl:'帳戶'},{id:'loans',lbl:'貸款'}];
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
function renderCalView(opts){
  const compact=opts&&opts.compact;
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
  const navBlock=`<div class="cal-nav">
      <button class="cal-nb" data-a="cprev">‹</button>
      <span class="cal-title-text" style="flex:1;text-align:center">${y}年${MONTHS[m]}</span>
      <button class="cal-nb" data-a="cnext">›</button>
    </div>`;
  const gridBlock=`<div class="weekdays">${['日','一','二','三','四','五','六'].map(d=>`<div class="wday">${d}</div>`).join('')}</div>
    <div class="cal-grid">${cells}</div>`;
  if(compact){
    return`<div class="card cal-compact-grid">
      <div class="cal-nav">
        <button class="cal-nb" data-a="cprev">‹</button>
        <span class="cal-title-text" style="flex:1;text-align:center">${y}年${MONTHS[m]}</span>
        <button class="cal-nb" data-a="cnext">›</button>
      </div>
      <div style="margin-top:10px">${gridBlock}</div>
    </div>`;
  }
  return`<div class="hdr"><div class="hdr-in">
    ${navBlock}
    <div class="sum-bar">
      <div class="sum-item"><div class="lbl">收入</div><div class="val">$${fmt(sum.income)}</div></div>
      <div class="sum-item"><div class="lbl">支出</div><div class="val">$${fmt(sum.expense)}</div></div>
      <div class="sum-item"><div class="lbl">結餘</div>
        <div class="val" style="color:${sum.balance>=0?'#1A7A50':'#B02828'}">$${fmt(sum.balance)}</div>
      </div>
    </div>
  </div></div>
  <div class="content">
    <div class="card">${gridBlock}</div>
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
        ${allMonths.map(({y:my,m:mm})=>`<option value="${my}-${mm}" ${state.statsMonth.y===my&&state.statsMonth.m===mm?'selected':''} style="color:var(--text);background:var(--bg)">${my}年 ${MONTHS[mm]}</option>`).join('')}
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
      <input type="date" id="hist-from" style="width:130px;padding:5px 8px;border:2px solid var(--border);border-radius:20px;font-size:13px;font-family:inherit;outline:none;background:var(--bg);color:var(--text)" value="${state.histFrom}">
      <span style="font-size:13px;color:var(--text2);flex-shrink:0">～</span>
      <input type="date" id="hist-to" style="width:130px;padding:5px 8px;border:2px solid var(--border);border-radius:20px;font-size:13px;font-family:inherit;outline:none;background:var(--bg);color:var(--text)" value="${state.histTo}">
      <button data-a="histSearch" style="padding:5px 14px;border:2px solid var(--p);border-radius:20px;background:var(--p);color:white;font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;white-space:nowrap">搜尋</button>`:''}
    </div>
    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:8px">
      ${filters.map(f=>`<div class="chip${state.histFilter===f.id?' ac':''}" data-a="filt" data-v="${f.id}">${f.lbl}</div>`).join('')}
      ${state.accounts.length>0?`<select id="hist-acc-sel" style="margin-left:auto;padding:5px 14px;border:2px solid ${state.histAccFilter?'var(--p)':'var(--border)'};border-radius:20px;background:${state.histAccFilter?'var(--p)':'var(--bg)'};color:${state.histAccFilter?'white':'var(--text)'};font-size:13px;font-weight:700;font-family:inherit;outline:none;cursor:pointer;-webkit-appearance:none;appearance:none">
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
    const monthlyEq=state.fixedExpenses.filter(f=>f.active!==false).reduce((s,f)=>s+fixedMonthlyEq(f),0);
    const activeBooks=(state.books||[]).filter(b=>!b.isArchived);
    const multiBook=activeBooks.length>1;
    function fixedRow(f){
      const acc=getAcc(f.accountId);
      return`<div class="setting-row" style="${f.active===false?'opacity:.5':''}">
        <div class="setting-ico" style="background:var(--bg);border:1px solid var(--border)">${f.icon}</div>
        <div class="setting-info"><div class="setting-name">${escHtml(f.name)}${f.active===false?` <span style="font-size:11px;color:var(--text2);font-weight:600">暫停中</span>`:''}</div>
          <div class="setting-sub">${freqLabel[f.frequency]||'每月'} · $${fmt(f.amount)}${f.frequency&&f.frequency!=='monthly'?' (≈$'+fmt(fixedMonthlyEq(f))+'/月)':''}${f.autoLog===false?' · 📊只列預算':''}${f.nextDate&&f.autoLog!==false?' · 下次 '+f.nextDate.slice(5):''}${f.accountId&&acc.name?' · '+escHtml(acc.icon)+escHtml(acc.name):''}</div></div>
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

// ── RENDER: WORKSPACE SETTINGS ───────────────────────────────────────────────
function renderWorkspaceSettingsModule(){
  const tab=state.wsSettingsTab||'main';
  if(tab==='cards')return renderWsCardsTab();
  if(tab==='theme')return renderWsThemeTab();
  const menu=[
    {id:'cards',ico:'🗂️',name:'卡片顯示'},
    {id:'theme',ico:'🎨',name:'風格主題'},
  ];
  return`<div class="content">
    <div class="dash-greet">
      <h1>設定</h1>
      <div class="dash-date">管理首頁顯示內容與主題風格</div>
    </div>
    <div class="card">
      ${menu.map(item=>`<div class="setting-row" style="cursor:pointer;padding:9px 0" data-a="wsTab" data-v="${item.id}">
        <div class="setting-ico" style="width:38px;height:38px;border-radius:11px;background:var(--bg);border:1px solid var(--border)">${item.ico}</div>
        <div class="setting-info"><div class="setting-name">${item.name}</div></div>
        <span style="color:var(--text2);font-size:20px;padding-right:2px">›</span>
      </div>`).join('')}
    </div>
  </div>`;
}
function renderWsCardsTab(){
  const hidden=state.homeHiddenCards||[];
  const homeCards=[
    {id:'reminders',lbl:'七天內提醒'},
    {id:'dream',lbl:'夢想清單'},
    {id:'goals',lbl:'目標設定'},
    {id:'project',lbl:'專案排程'},
    {id:'course',lbl:'課程學習'},
  ];
  return`<div class="hdr"><div class="hdr-in">
    <div class="hdr-row">
      <div><h1>卡片顯示</h1></div>
      <button class="back-btn" data-a="wsTab" data-v="main">返回</button>
    </div>
  </div></div>
  <div class="content" style="padding-top:12px">
    <div class="card">
      <div class="card-title" style="margin-bottom:6px">首頁顯示項目</div>
      ${homeCards.map(c=>{
        const shown=!hidden.includes(c.id);
        return`<div class="setting-row">
          <div class="setting-info"><div class="setting-name">${c.lbl}</div></div>
          <button class="chip${shown?' ac':''}" data-a="toggleHomeCard" data-v="${c.id}">${shown?'✓ 顯示中':'已隱藏'}</button>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}
function renderWsThemeTab(){
  return`<div class="hdr"><div class="hdr-in">
    <div class="hdr-row">
      <div><h1>風格主題</h1></div>
      <button class="back-btn" data-a="wsTab" data-v="main">返回</button>
    </div>
  </div></div>
  <div class="content" style="padding-top:12px">
    ${renderThemePickerCards()}
  </div>`;
}
// ── RENDER: THEME ──────────────────────────────────────────────────────────
function renderThemePickerCards(){
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
          <div style="font-size:13px;color:var(--text2);font-family:${f.family};margin-top:4px">工作台・支出・收入 Aa 123</div>
        </div>
        <div style="font-size:22px;color:${sel?'var(--text)':'var(--border)'};flex-shrink:0;margin-left:10px">${sel?'✓':'○'}</div>
      </div>
      ${id!=='system'?`<button data-a="deleteFont" data-v="${id}" style="flex-shrink:0;width:36px;height:36px;border:1.5px solid var(--border);border-radius:10px;background:var(--bg);cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center">🗑️</button>`:''}
    </div>`;
  }).join('');
  return`<div class="card" style="margin-bottom:12px">
      <div class="card-title" style="margin-bottom:14px">主題色調</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${themeCards}</div>
    </div>
    <div class="card">
      <div class="card-title" style="margin-bottom:14px">字型</div>
      ${fontCards}
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
  const dreamGoals=(state.goals||[]).filter(g=>g.type==='dream');
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
    <div class="slabel">連結夢想任務（目標設定裡的夢想項目）</div>
    <div class="acc-row" style="margin-bottom:8px;flex-wrap:wrap">
      <button class="acc-pill${!f.linkedGoalId?' active':''}" data-a="df-goal" data-v="">不連結</button>
      ${dreamGoals.map(g=>
        `<button class="acc-pill${f.linkedGoalId===g.id?' active':''}" data-a="df-goal" data-v="${g.id}">🌟 ${escHtml(g.name)}</button>`
      ).join('')}
    </div>
    ${!dreamGoals.length?`<div style="font-size:12px;color:var(--text2);margin-bottom:14px">尚無夢想項目，可到「目標設定」新增一個夢想後再回來連結</div>`:''}
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
    <div class="slabel">到期自動記帳</div>
    <div class="type-chips" style="margin-bottom:14px">
      <button class="type-chip${f.fixedAutoLog!==false?' active':''}" data-a="fixedAutoLog" data-v="1">✅ 自動記一筆</button>
      <button class="type-chip${f.fixedAutoLog===false?' active':''}" data-a="fixedAutoLog" data-v="0">📊 只列預算</button>
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
        ${allYears.map(yr=>`<option value="${yr}" ${y===yr?'selected':''} style="color:var(--text);background:var(--bg)">${yr}年</option>`).join('')}
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
        <div><h1>保險管理</h1>
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
