const SCRIPT_URL='https://script.google.com/macros/s/AKfycbzCbq8mkGohHkx5C_TOlaagU__cWIPEbJizA8ZtXRHE4Q02K3Ck56qeqzaqIF561ha5/exec';

// ── THEME ───────────────────────────────────────
let _dark = localStorage.getItem('theme') === 'dark';
function applyTheme() {
  document.documentElement.setAttribute('data-theme', _dark ? 'dark' : 'light');
  document.querySelectorAll('.theme-btn').forEach(b => b.innerHTML = _dark ? '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>' : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>');
}
function toggleTheme() {
  _dark = !_dark;
  localStorage.setItem('theme', _dark ? 'dark' : 'light');
  applyTheme();
}
applyTheme();

// ── DEEP LINK ─────────────────────────────────────────────────────
// When HR taps the Telegram link (?req=REQ-XXXXXXXX), auto-open HR view
let _deepReq = new URLSearchParams(window.location.search).get('req') || '';
if(_deepReq){
  document.addEventListener('DOMContentLoaded', function(){
    // Navigate to HR section — login gate will show by default
    document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));
    const hv=document.getElementById('v-hr');if(hv)hv.classList.add('active');
    // Show a subtle hint so HR knows why they're here
    const lerr=document.getElementById('hr-lerr');
    if(lerr)lerr.textContent='Log in to review request '+_deepReq;
  });
}

// ── SESSION RESTORE ──────────────────────────────────────────────
(function restoreSession(){
  try{
    const raw=sessionStorage.getItem('hr_sess');
    if(!raw)return;
    const s=JSON.parse(raw);
    if(s.token&&s.user&&s.hmacKey){
      hrUser=s.user;hrToken=s.token;
      setHmacKey(s.hmacKey);
    }else{
      sessionStorage.removeItem('hr_sess');
    }
  }catch(e){sessionStorage.removeItem('hr_sess');}
})();
// Begin silent background fetch immediately after session restore
setTimeout(hrPreload, 100);

// ── NAV ─────────────────────────────────────────
function goTo(v) {
  document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));
  document.getElementById('v-'+v).classList.add('active');
  window.scrollTo(0,0);
  if(v==='request')rReset();
  if(v==='status')stReset();
  if(v==='notice')ntReset();
  if(v==='hr'&&hrUser){
    document.getElementById('hr-login').style.display='none';
    document.getElementById('hr-dash').style.display='block';
    document.getElementById('hr-greet').textContent=tx('hrGreet')+hrUser;
    document.getElementById('hr-gsub').textContent=tx('hrGsub')+' — '+todayFmt();
    hrLoadData();
  }
}

// ── LANG ────────────────────────────────────────
let LANG=localStorage.getItem('lang')||'en';
const T={
  en:{hEy:'Late / Leave Early / Annual Leave Request',hSub:'Insurance Brokers (Cambodia) Co., Ltd.',hC1t:'Request Leave',hC1d:'Submit a new annual or special leave request',hC2t:'My Leave Status',hC2d:'Check remaining days, history and print past requests',hC3t:'HR Dashboard',hC3d:'Approve, manage requests and staff records',back:'Back',rTitle:'Request Leave',stTitle:'My Leave Status',hrTitle:'HR Dashboard',rgTitle:'Enter Your Employee ID',rgSub:'Your identity will be verified before proceeding',rgBtn:'Verify & Continue',stgTitle:'Enter Your Employee ID',stgSub:'View your leave balance and history',stgBtn:'View My Leave',rsl1:'Verify ID',rsl2:'Fill Form',rsl3:'Review',rsl4:'Confirm',rsh1:'Staff Information',rsh2:'Leave Details',rsh3:'Submission Info',rlEid:'Employee ID',rlName:'Full Name',rlGen:'Gender',rlPos:'Position',rlType:'Leave Type',rlFrom:'From Date',rlTo:'To Date',rlRsn:'Reason',rlSdate:'Submission Date',rlSloc:'Location',lt1:'Annual Leave',lt2:'Sick Leave',lt3:'Emergency Leave',lt4:'Special Leave',lt5:'Unpaid Leave',lt6:'Other',lt7:'Training / Mission',dinfo:'Working days requested',dsub:'Excluding weekends',balUsed:'Used this year',rpBtn:'Preview & Continue →',rprTitle:'Review Your Request',pnHd:'',pnBd:'Your request has been sent to the HR team.<br><br><strong>Please print the form, sign it yourself, and bring it to management for approval.</strong><br><br>HR will notify you when your request is approved.',editBtn:'Edit',conTxt:'Confirm & Print',stTotLbl:'Total Days',stUsedLbl:'Used',stRemLbl:'Remaining',stBalTitle:'Annual Leave Balance',stHistTitle:'Leave History',stTh1:'ID',stTh2:'Type',stTh3:'From',stTh4:'To',stTh5:'Days',stTh6:'Status',stTh7:'Print',stNoData:'No leave history found.',hrLt:'HR Access',hrLs:'Authorised personnel only',hrLu:'Username',hrLp:'Password',hrLbtn:'Login',hrLerr:'Invalid credentials.',hrGreet:'Welcome back, ',hrGsub:'Lockton IBS HR Portal',hrLo:'Logout',hrNt1:'Requests',hrNt2:'Staff Records',hrStLbl:'Total',hrSpLbl:'Pending',hrSaLbl:'Approved',hrSrLbl:'Rejected',hftAll:'All',hftPend:'Pending',hftAppr:'Approved',hftRej:'Rejected',hrTh1:'Req ID',hrTh2:'Staff',hrTh3:'Type',hrTh4:'From',hrTh5:'Days',hrTh6:'Status',hrTh7:'Action',hrApprove:'Approve',hrReject:'Reject',hrSh:'Staff Registry',hrSth1:'ID',hrSth2:'Name',hrSth3:'Position',hrSth4:'Total',hrSth5:'Used',hrSth6:'Remaining',approveQ:'Approve this request?',rejectQ:'Reject this request?',notFound:'Employee ID not found.',daysRem:'days remaining',errFields:'Please fill in all required fields.',errDate:'End date must be after start date.',errType:'Please select a leave type.',sending:'Submitting...',success:'Submitted! Preparing print...',errSubmit:'Submission failed. Try again.',male:'Male',female:'Female',ptEid:'Employee ID',ptName:'Full Name',ptGen:'Gender',ptPos:'Position',ptType:'Leave Type',ptFrom:'From',ptTo:'To',ptDays:'Working Days',ptRsn:'Reason',ptSub:'Submitted'},
  kh:{hEy:'ស្នើសុំឈប់សម្រាកប្រចាំឆ្នាំ/ មកយឺត / សុំចេញមុន',hSub:'ការស្នើសុំច្បាប់ឈប់សម្រាក',hC1t:'ស្នើសុំច្បាប់',hC1d:'ដាក់ពាក្យស្នើសុំច្បាប់ឈប់សម្រាកថ្មី',hC2t:'ការឈប់សម្រាករបស់ខ្ញុំ',hC2d:'ពិនិត្យថ្ងៃដែលនៅសល់ ប្រវត្តិច្បាប់ដែលបានសុំ និងព្រីន FORM ដែលបានស្នើរួច',hC3t:'HR Dashboard',hC3d:'អនុម័ត គ្រប់គ្រងការស្នើ និងព័ត៌មានបុគ្គលិក',back:'ត្រឡប់ក្រោយ',rTitle:'ស្នើសុំច្បាប់',stTitle:'ស្ថានភាពច្បាប់',hrTitle:'ផ្ទាំងបញ្ជា HR',rgTitle:'បញ្ចូលលេខអត្តសញ្ញាណ',rgSub:'អត្តសញ្ញាណរបស់អ្នកនឹងត្រូវបានផ្ទៀងផ្ទាត់',rgBtn:'ផ្ទៀងផ្ទាត់ & បន្ត',stgTitle:'បញ្ចូលលេខអត្តសញ្ញាណ',stgSub:'មើលថ្ងៃដែលនៅសល់ និងប្រវត្តិ',stgBtn:'មើលច្បាប់របស់ខ្ញុំ',rsl1:'ផ្ទៀងអត្តសញ្ញាណ',rsl2:'បំពេញទម្រង់',rsl3:'មើលជាមុន',rsl4:'បញ្ជាក់',rsh1:'ព័ត៌មានបុគ្គលិក',rsh2:'ព័ត៌មានការស្នើ',rsh3:'ព័ត៌មានការដាក់ពាក្យ',rlEid:'លេខអត្តសញ្ញាណ',rlName:'ឈ្មោះពេញ',rlGen:'ភេទ',rlPos:'មុខតំណែង',rlType:'ប្រភេទច្បាប់',rlFrom:'ចាប់ពីថ្ងៃ',rlTo:'ដល់ថ្ងៃ',rlRsn:'មូលហេតុ',rlSdate:'ថ្ងៃដាក់ពាក្យ',rlSloc:'ទីតាំង',lt1:'ច្បាប់ប្រចាំឆ្នាំ',lt2:'ច្បាប់ឈឺ',lt3:'ច្បាប់បន្ទាន់',lt4:'ច្បាប់ពិសេស',lt5:'ច្បាប់គ្មានប្រាក់',lt6:'ផ្សេងៗ',lt7:'បេសកកម្ម / វគ្គបណ្ត',dinfo:'ចំនួនថ្ងៃការងារ',dsub:'មិនរាប់ថ្ងៃចុងសប្តាហ៍',balUsed:'បានប្រើឆ្នាំនេះ',rpBtn:'មើលជាមុន & បន្ត →',rprTitle:'ពិនិត្យការស្នើ',pnHd:'សំខាន់:',pnBd:' បន្ទាប់ពីបញ្ជាក់ សូមព្រីនទម្រង់នេះ ចុះហត្ថលេខា ហើយដាក់ជូន HR។',editBtn:'កែប្រែ',conTxt:'បញ្ជាក់ & ព្រីន',stTotLbl:'ថ្ងៃសរុប',stUsedLbl:'បានប្រើ',stRemLbl:'នៅសល់',stBalTitle:'ថ្ងៃច្បាប់ប្រចាំឆ្នាំ',stHistTitle:'ប្រវត្តិការស្នើ',stTh1:'លេខ',stTh2:'ប្រភេទ',stTh3:'ចាប់ពី',stTh4:'ដល់',stTh5:'ថ្ងៃ',stTh6:'ស្ថានភាព',stTh7:'ព្រីន',stNoData:'មិនមានប្រវត្តិ។',hrLt:'ចូលប្រព័ន្ធ HR',hrLs:'សម្រាប់បុគ្គលិក HR ដែលមានការអនុញ្ញាត',hrLu:'ឈ្មោះអ្នកប្រើ',hrLp:'ពាក្យសម្ងាត់',hrLbtn:'ចូល',hrLerr:'ឈ្មោះ ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ។',hrGreet:'សូមស្វាគមន៍, ',hrGsub:'វិបផតែ HR ឡក តន អាយប៊ីស៊ី',hrLo:'ចាកចេញ',hrNt1:'ការស្នើ',hrNt2:'ទិន្នន័យបុគ្គលិក',hrStLbl:'សរុប',hrSpLbl:'រង់ចាំ',hrSaLbl:'អនុម័ត',hrSrLbl:'បដិសេធ',hftAll:'ទាំងអស់',hftPend:'រង់ចាំ',hftAppr:'អនុម័ត',hftRej:'បដិសេធ',hrTh1:'លេខ',hrTh2:'បុគ្គលិក',hrTh3:'ប្រភេទ',hrTh4:'ចាប់ពី',hrTh5:'ថ្ងៃ',hrTh6:'ស្ថានភាព',hrTh7:'សកម្មភាព',hrApprove:'អនុម័ត',hrReject:'បដិសេធ',hrSh:'ទំព័របុគ្គលិក',hrSth1:'អត្តសញ្ញាណ',hrSth2:'ឈ្មោះ',hrSth3:'មុខតំណែង',hrSth4:'សរុប',hrSth5:'បានប្រើ',hrSth6:'នៅសល់',approveQ:'អនុម័តការស្នើនេះ?',rejectQ:'បដិសេធការស្នើនេះ?',notFound:'រកមិនឃើញ។',daysRem:'ថ្ងៃនៅសល់',errFields:'សូមបំពេញព័ត៌មានទាំងអស់។',errDate:'ថ្ងៃបញ្ចប់ត្រូវក្រោយថ្ងៃចាប់ផ្តើម។',errType:'សូមជ្រើសប្រភេទច្បាប់។',sending:'កំពុងដាក់...',success:'ការស្នើបានជោគជ័យ!',errSubmit:'ការដាក់ពាក្យបរាជ័យ។',male:'ប្រុស',female:'ស្រី',ptEid:'លេខអត្តសញ្ញាណ',ptName:'ឈ្មោះ',ptGen:'ភេទ',ptPos:'មុខតំណែង',ptType:'ប្រភេទ',ptFrom:'ចាប់ពី',ptTo:'ដល់',ptDays:'ចំនួនថ្ងៃ',ptRsn:'មូលហេតុ',ptSub:'ថ្ងៃដាក់'}
};
function tx(k){return(T[LANG]||T.en)[k]||T.en[k]||k;}
function setLang(l){LANG=l;localStorage.setItem('lang',l);document.querySelectorAll('.lb').forEach(b=>b.classList.remove('on'));document.querySelectorAll('.lb[data-lang="'+l+'"]').forEach(b=>b.classList.add('on'));applyLang();}
function applyLang(){
  const s=(id,k)=>{const e=document.getElementById(id);if(e)e.textContent=tx(k);};
  s('h-ey','hEy');s('h-sub','hSub');s('h-c1t','hC1t');s('h-c1d','hC1d');s('h-c2t','hC2t');s('h-c2d','hC2d');s('h-c3t','hC3t');s('h-c3d','hC3d');
  s('r-back','back');s('r-title','rTitle');s('rg-title','rgTitle');s('rg-sub','rgSub');s('r-gate-txt','rgBtn');
  s('rsl1','rsl1');s('rsl2','rsl2');s('rsl3','rsl3');s('rsl4','rsl4');
  s('rsh1','rsh1');s('rsh2','rsh2');s('rsh3','rsh3');
  s('rl-eid','rlEid');s('rl-name','rlName');s('rl-gen','rlGen');s('rl-pos','rlPos');
  s('rl-type','rlType');s('rl-from','rlFrom');s('rl-to','rlTo');s('rl-rsn','rlRsn');
  s('rl-sdate','rlSdate');s('rl-sloc','rlSloc');
  s('lt1','lt1');s('lt2','lt2');s('lt3','lt3');s('lt4','lt4');s('lt5','lt5');s('lt6','lt6');s('lt7','lt7');
  s('r-dinfo','dinfo');s('r-dsub','dsub');s('r-bal-used-lbl','balUsed');s('r-prev-btn','rpBtn');
  s('rpr-title','rprTitle');s('r-edit-btn','editBtn');s('r-con-txt','conTxt');
  const _pnBd=document.getElementById('pn-bd');if(_pnBd)_pnBd.innerHTML=tx('pnBd');
  s('st-back','back');s('st-title','stTitle');s('stg-title','stgTitle');s('stg-sub','stgSub');s('st-gate-txt','stgBtn');
  s('st-tot-lbl','stTotLbl');s('st-used-lbl','stUsedLbl');s('st-rem-lbl','stRemLbl');
  s('st-bal-title','stBalTitle');s('st-hist-title','stHistTitle');
  s('st-th1','stTh1');s('st-th2','stTh2');s('st-th3','stTh3');s('st-th4','stTh4');s('st-th5','stTh5');s('st-th6','stTh6');s('st-th7','stTh7');
  s('hr-back','back');s('hr-pg-title','hrTitle');s('hr-lt','hrLt');s('hr-ls','hrLs');s('hr-lu','hrLu');s('hr-lp','hrLp');s('hr-lbtxt','hrLbtn');
  s('hr-lo','hrLo');s('hr-nt1','hrNt1');s('hr-nt2','hrNt2');
  s('hr-st-lbl','hrStLbl');s('hr-sp-lbl','hrSpLbl');s('hr-sa-lbl','hrSaLbl');s('hr-sr-lbl','hrSrLbl');
  s('hft-all','hftAll');s('hft-pend','hftPend');s('hft-appr','hftAppr');s('hft-rej','hftRej');
  s('hr-th1','hrTh1');s('hr-th2','hrTh2');s('hr-th3','hrTh3');s('hr-th4','hrTh4');s('hr-th5','hrTh5');s('hr-th6','hrTh6');s('hr-th7','hrTh7');
  s('hr-sh','hrSh');s('hr-sth1','hrSth1');s('hr-sth2','hrSth2');s('hr-sth3','hrSth3');s('hr-sth4','hrSth4');s('hr-sth5','hrSth5');s('hr-sth6','hrSth6');
  if(rStaff){
    const s=rStaff,name=(LANG==='kh'&&s.nameKh)?s.nameKh:s.name,pos=(LANG==='kh'&&s.positionKh)?s.positionKh:s.position,gen=s.gender==='Male'?tx('male'):tx('female');
    const nd=document.getElementById('rf-name-disp'),gd=document.getElementById('rf-gen-disp');
    if(nd)nd.textContent=name;if(gd)gd.textContent=gen;
    document.getElementById('rf-name').value=name;document.getElementById('rf-gen').value=gen;document.getElementById('rf-pos').value=pos;
    // Update mobile chip
    const _sd=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
    _sd('r-chip-name',name);_sd('r-chip-pos',pos);_sd('r-chip-gen',gen);
    updateRBal();
  }if(stStaff)renderStDash();if(hrUser){hrRenderReqs();hrRenderStaff();}
}
document.querySelectorAll('.lb').forEach(b=>b.addEventListener('click',()=>setLang(b.dataset.lang),{passive:true}));
document.querySelectorAll('.lb[data-lang="'+LANG+'"]').forEach(b=>b.classList.add('on'));

// ── LEAVE TYPE HIGHLIGHT ─────────────────────────
function highlightType(input){
  document.querySelectorAll('.topt').forEach(l=>l.classList.remove('sel'));
  if(input.checked) input.closest('.topt').classList.add('sel');
}

// ── SYNC ────────────────────────────────────────
async function syncAll(){
  const btn=document.getElementById('sync-btn');
  if(!btn)return;
  btn.classList.add('spinning');
  btn.disabled=true;
  try{
    // Ping server to verify connectivity
    await apiGet('ping');
    // Refresh HR data if logged in
    if(hrUser)await hrLoadData();
    // Refresh status if viewing
    if(stStaff){
      const res=await apiPost('getHistory',{empId:stStaff.empId,fullName:stStaff.name});
      if(res.result==='success'){stHistory=res.history||[];renderStDash();}
    }
    toast('Synced','ok2');
  }catch(e){toast('Sync failed','bad');}
  finally{btn.classList.remove('spinning');btn.disabled=false;}
}

// ── TOAST ────────────────────────────────────────
let _tt;
function toast(msg,type=''){const el=document.getElementById('toast');requestAnimationFrame(()=>{el.textContent=msg;el.className='show '+type;});clearTimeout(_tt);_tt=setTimeout(()=>requestAnimationFrame(()=>{el.className='';}),3400);}
function clearFieldErr(){document.querySelectorAll('.field-err').forEach(el=>el.classList.remove('field-err'));const g=document.getElementById('ltype-grid');if(g)g.classList.remove('tgrid-err');}

// ── UTILS ────────────────────────────────────────
function autoSetTo(){
  const f=document.getElementById('rf-from').value;
  if(!f)return;
  const toEl=document.getElementById('rf-to');
  toEl.min=f;
  if(!toEl.value||toEl.value<f)toEl.value=f;
  // Show half-day if from===to (single day)
  const hd=document.getElementById('halfday-row');
  calcDays();
}
function validateToDate(){
  const f=document.getElementById('rf-from').value,toEl=document.getElementById('rf-to');
  if(f&&toEl.value&&toEl.value<f){toEl.value=f;}
  calcDays();
}
function hdGetFirst(){const s=document.querySelector('input[name=halfday-first]:checked');return s?s.value:'full';}
function hdGetLast(){const s=document.querySelector('input[name=halfday-last]:checked');return s?s.value:'full';}
function hdLabel(v){return v==='morning'?'Morning':v==='afternoon'?'Evening':'';}
function getActualDays(from,to){
  const ltype=document.querySelector('input[name=ltype]:checked');
  const wd=workDays(from,to);
  const single=from===to;
  const fv=hdGetFirst(),lv=single?fv:hdGetLast();
  let d=wd;
  if(fv!=='full')d-=0.5;
  if(!single&&lv!=='full')d-=0.5;
  return Math.max(0.5,d);
}
function getHalfNote(from,to){
  const single=from===to;
  const fv=hdGetFirst(),lv=single?fv:hdGetLast();
  const fl=hdLabel(fv),ll=hdLabel(lv);
  if(single)return fl?' ('+fl+')':'';
  if(fl&&ll&&fl===ll)return' ('+fl+' Only)';
  const parts=[];
  if(fl)parts.push('First: '+fl);
  if(ll)parts.push('Last: '+ll);
  return parts.length?' ('+parts.join(', ')+')':'';
}
function workDays(f,t){let n=0,c=new Date(f+'T00:00:00'),e=new Date(t+'T00:00:00');while(c<=e){const d=c.getDay();if(d&&d!==6)n++;c.setDate(c.getDate()+1);}return n;}
function fmtDate(iso){if(!iso)return'—';const d=iso.includes('T')||iso.includes('Z')?new Date(iso):new Date(iso+'T00:00:00');return isNaN(d.getTime())?iso:d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});}
function todayISO(){return new Date().toISOString().split('T')[0];}
function todayFmt(){return new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'});}
function parseDate(iso){
  if(!iso)return{};
  const d=iso.includes('T')||iso.includes('Z')?new Date(iso):new Date(iso+'T00:00:00');
  const mEN=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const mKH=['មករា','កុម្ភៈ','មីនា','មេសា','ឧសភា','មិថុនា','កក្កដា','សីហា','កញ្ញា','តុលា','វិច្ឆិកា','ធ្នូ'];
  return{day:d.getDate(),month:(LANG==='kh'?mKH:mEN)[d.getMonth()],year:d.getFullYear()};
}
function normalizeId(val){
  return String(val||'').trim();
}
function isMock(){return !SCRIPT_URL.startsWith('https://script.google.com');}
function setReqBar(step){
  const bar=document.getElementById('req-action-bar');
  const bForm=document.getElementById('req-bar-form');
  const bPrev=document.getElementById('req-bar-preview');
  if(!bar)return;
  if(step===2){bar.style.display='flex';bForm.style.display='flex';bPrev.style.display='none';}
  else if(step===3){bar.style.display='flex';bForm.style.display='none';bPrev.style.display='flex';}
  else{bar.style.display='none';}
}


// ── DEVICE FINGERPRINT ──────────────────────────────────────
function getFingerprint(){const nav=window.navigator,scr=window.screen;const raw=[nav.userAgent,nav.language,scr.width+'x'+scr.height,scr.colorDepth,nav.hardwareConcurrency,nav.platform].join('|');let h=0;for(let i=0;i<raw.length;i++){h=Math.imul(31,h)+raw.charCodeAt(i)|0;}return Math.abs(h).toString(36);}

// ── HMAC SIGNING ────────────────────────────────────────────
let _hmacKey=null;
function setHmacKey(k){_hmacKey=k;}
async function signRequest(action){
  const ts=Date.now().toString();
  const nonce=Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2);
  if(!_hmacKey)return{ts,nonce,sig:'unsigned'};
  try{
    const enc=new TextEncoder();
    const key=await crypto.subtle.importKey('raw',enc.encode(_hmacKey),{name:'HMAC',hash:'SHA-256'},false,['sign']);
    const sig=await crypto.subtle.sign('HMAC',key,enc.encode(action+'|'+ts+'|'+nonce));
    return{ts,nonce,sig:Array.from(new Uint8Array(sig)).map(b=>b.toString(16).padStart(2,'0')).join('')};
  }catch(e){
    let h=0,s=action+'|'+ts+'|'+nonce+'|'+_hmacKey;
    for(let i=0;i<s.length;i++){h=Math.imul(31,h)+s.charCodeAt(i)|0;}
    return{ts,nonce,sig:Math.abs(h).toString(16)};
  }
}

// ── SECURE API ──────────────────────────────────────────────
async function apiGet(action,params={}){
  if(isMock())return{result:'mock'};
  const signed=await signRequest(action);
  const fp=getFingerprint();
  const qs=new URLSearchParams({action,...params,...signed,fp}).toString();
  const res=await fetch(SCRIPT_URL+'?'+qs);
  const data=await res.json();
  if(data.newToken){hrToken=data.newToken;try{const _s=JSON.parse(sessionStorage.getItem('hr_sess')||'{}');_s.token=data.newToken;sessionStorage.setItem('hr_sess',JSON.stringify(_s));}catch(e){}}
  return data;
}
async function apiPost(action,payload={}){
  if(isMock())return{result:'success'};
  const signed=await signRequest(action);
  const fp=getFingerprint();
  const body=JSON.stringify({action,...payload,...signed,fp});
  const res=await fetch(SCRIPT_URL,{method:'POST',headers:{'Content-Type':'text/plain'},body});
  const data=await res.json();
  if(data.newToken){hrToken=data.newToken;try{const _s=JSON.parse(sessionStorage.getItem('hr_sess')||'{}');_s.token=data.newToken;sessionStorage.setItem('hr_sess',JSON.stringify(_s));}catch(e){}}
  return data;
}

// Authenticated HR helper — auto-attaches token
async function apiHR(action, data={}){
  return apiPost(action, {...data, token:hrToken||''});
}

// ── MOCK (sample data removed — uses real sheet) ─────────────────────────
function mockStaff(id){return{result:'notfound'};}
function mockHist(id){return{result:'notfound'};}

// ══════════════════ REQUEST ══════════════════════
let rStaff=null;
function rReset(){rStaff=null;document.getElementById('r-gate').style.display='flex';document.getElementById('req-form').style.display='none';const _rs=document.getElementById('r-success');if(_rs)_rs.style.display='none';document.querySelectorAll('input[name=halfday-first][value="full"],input[name=halfday-last][value="full"]').forEach(r=>r.checked=true);document.getElementById('r-id-input').value='';const _rni=document.getElementById('r-name-input');if(_rni)_rni.value='';document.getElementById('r-idfb').textContent='';setRStep(1);setReqBar(0);closeReviewModal();_isSubmitting=false;_pendingPayload=null;clearFieldErr();}
function rIDClear(){document.getElementById('r-idfb').textContent='';}
function setRStep(n){for(let i=1;i<=4;i++){const dot=document.getElementById('rsd'+i),si=document.getElementById('rsi'+i);dot.classList.remove('act','dn');si.classList.remove('active');if(i<n){dot.classList.add('dn');dot.innerHTML='<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';}else if(i===n){dot.classList.add('act');dot.innerHTML=i;si.classList.add('active');}else{dot.innerHTML=i;}}}
async function rVerify(){
  const val=normalizeId(document.getElementById('r-id-input').value.trim());
  const nameInput=document.getElementById('r-name-input').value.trim();
  const fb=document.getElementById('r-idfb');
  if(!val){fb.textContent='Please enter your Employee ID.';fb.className='idfb err';gateSetError('r-gate');return;}
  if(!nameInput){fb.textContent='Please enter your Full Name.';fb.className='idfb err';gateSetError('r-gate');return;}
  const btn=document.getElementById('r-gate-btn'),sp=document.getElementById('r-gate-sp');
  gateSetLoading('r-gate','r-gate-btn',true);sp.style.display='block';
  const _gmo=_gmoStart('r-gate');
  try{
    const res=isMock()?mockStaff(val):await apiPost('getStaff',{empId:val,fullName:nameInput});
    if(res.result==='success'){
      const staffName=(res.staff.name||'').trim().toLowerCase();
      const staffNameKh=(res.staff.nameKh||'').trim().toLowerCase();
      const enteredName=nameInput.toLowerCase();
      if(enteredName!==staffName&&enteredName!==staffNameKh){
        _gmo.cancel(false);
        fb.textContent='Name does not match our records.';fb.className='idfb err';
        setTimeout(()=>gateSetError('r-gate'),210);
        gateSetLoading('r-gate','r-gate-btn',false);sp.style.display='none';return;
      }
      rStaff=res.staff;rStaff.empId=val;
      const hist=await apiPost('getHistory',{empId:val,fullName:nameInput});
      _gmo.cancel(true);
      rStaff._usedDates=[];
      if(hist.result==='success'&&hist.history){
        hist.history.forEach(r=>{if(r.status!=='Rejected'&&r.from&&r.to)rStaff._usedDates.push({from:r.from,to:r.to,status:r.status});});
      }
      document.getElementById('r-gate').style.display='none';
      document.getElementById('req-form').style.display='grid';
      setReqBar(2);rLoadForm();setRStep(2);
    }
    else{_gmo.cancel(false);fb.textContent=tx('notFound');fb.className='idfb err';setTimeout(()=>gateSetError('r-gate'),210);}
  }catch(e){_gmo.cancel(false);toast(tx('errSubmit'),'bad');}finally{gateSetLoading('r-gate','r-gate-btn',false);sp.style.display='none';}
}
function rLoadForm(){
  const s=rStaff;
  const name=LANG==='kh'?(s.nameKh||s.name):s.name;
  const gen=LANG==='kh'?(s.gender==='Male'?tx('male'):tx('female')):s.gender;
  const pos=LANG==='kh'?(s.positionKh||s.position):s.position;
  const today=todayFmt();
  document.getElementById('rf-eid').value=s.empId;
  document.getElementById('rf-name').value=name;
  document.getElementById('rf-gen').value=gen;
  document.getElementById('rf-pos').value=pos;
  document.getElementById('rf-sdate').value=today;
  // Pre-fill dates with today so date picker is never blank on mobile
  const fromEl=document.getElementById('rf-from'),toEl=document.getElementById('rf-to');
  if(fromEl&&!fromEl.value){fromEl.value=today;}
  if(toEl&&!toEl.value){toEl.value=document.getElementById('rf-from').value||today;}
  calcDays();
  const d=document;
  function sd(id,v){const e=d.getElementById(id);if(e)e.textContent=v;}
  const loc=s.location||'Phnom Penh';
  document.getElementById('rf-sloc').value=loc;
  sd('rf-eid-disp',s.empId);sd('rf-name-disp',name);sd('rf-gen-disp',gen);sd('rf-sdate-disp',today);sd('rf-sloc-disp',loc);
  // Compact mobile chip
  sd('r-chip-name',name);sd('r-chip-id',s.empId);sd('r-chip-pos',pos);sd('r-chip-gen',gen);
  updateRBal();
}
function updateRBal(){
  if(!rStaff)return;
  const s=rStaff,rem=s.annualDays-s.usedDays,pct=Math.round(Math.max(0,rem/s.annualDays*100));
  document.getElementById('r-bal-name').textContent=(LANG==='kh'?(s.nameKh||s.name):s.name)+' — '+(LANG==='kh'?(s.positionKh||s.position):s.position);
  const remDisplay=Number(rem)%1===0?rem:rem.toFixed(1);
  const usedDisplay=Number(s.usedDays)%1===0?s.usedDays:(+s.usedDays).toFixed(1);
  const dayWord=Number(remDisplay)===1?'day':'days';
  document.getElementById('r-bal-rem').textContent=remDisplay+' '+dayWord+' remaining';
  document.getElementById('r-bal-fill').style.width=pct+'%';
  document.getElementById('r-bal-detail').textContent=usedDisplay+' / '+s.annualDays+' days';
}
document.querySelectorAll('.topt input[type=radio]').forEach(r=>{r.addEventListener('change',()=>{document.querySelectorAll('.topt').forEach(o=>o.classList.remove('sel'));r.closest('.topt').classList.add('sel');},{passive:true});});
let _cdT;
function calcDays(now){if(!now){clearTimeout(_cdT);_cdT=setTimeout(()=>calcDays(1),30);return;}
  const from=document.getElementById('rf-from').value,to=document.getElementById('rf-to').value;
  const pill=document.getElementById('r-dpill'),row=document.getElementById('halfday-row');
  if(!from||!to||from>to){pill.style.display='none';if(row)row.style.display='none';return;}
  const single=from===to;
  const singleDiv=document.getElementById('hd-single'),multiDiv=document.getElementById('hd-multi');
  if(row){
    row.style.display='block';
    if(singleDiv)singleDiv.style.display=single?'grid':'none';
    if(multiDiv)multiDiv.style.display=single?'none':'block';
  }
  // Update date labels in multi picker
  if(!single){
    const fd=document.getElementById('hd-first-date'),ld=document.getElementById('hd-last-date');
    if(fd)fd.textContent=fmtDate(from);
    if(ld)ld.textContent=fmtDate(to);
    // Reset last-day selector if same-day range just changed to multi
  }
  const d=getActualDays(from,to);
  document.getElementById('r-dnum').textContent=d;
  const ltype=document.querySelector('input[name=ltype]:checked');
  const typeTxt=ltype?ltype.value:'Leave';
  const halfNote=getHalfNote(from,to);
  const anyHalf=hdGetFirst()!=='full'||((!single)&&hdGetLast()!=='full');
  let mainTxt,subTxt;
  if(single&&anyHalf){mainTxt='Half day '+hdLabel(hdGetFirst())+' · '+fmtDate(from);subTxt=typeTxt;}
  else if(!single&&halfNote){mainTxt=typeTxt+halfNote;subTxt=fmtDate(from)+' → '+fmtDate(to);}
  else if(single){mainTxt=typeTxt;subTxt=fmtDate(from);}
  else{mainTxt=typeTxt;subTxt=fmtDate(from)+' → '+fmtDate(to);}
  const di=document.getElementById('r-dinfo');if(di)di.textContent=mainTxt;
  const ds=document.getElementById('r-dsub');if(ds)ds.textContent=subTxt;
  pill.style.display='flex';
  const hdRow=document.getElementById('halfday-row');
  const hdLbl=document.getElementById('hd-section-label');
  if(hdRow){hdRow.style.borderColor=anyHalf?'var(--ok)':null;hdRow.style.background=anyHalf?'var(--ok-soft)':null;hdRow.style.boxShadow=anyHalf?'0 0 0 3px rgba(30,122,74,.15)':null;}
  if(hdLbl){hdLbl.style.color=anyHalf?'var(--ok)':null;hdLbl.style.background=anyHalf?'var(--ok-soft)':null;}
}
function rShowPreview(){
  const from=document.getElementById('rf-from').value,to=document.getElementById('rf-to').value,rsn=document.getElementById('rf-rsn').value.trim(),ltype=document.querySelector('input[name=ltype]:checked');
  clearFieldErr();
  const _missing=[];
  if(!from){_missing.push('From Date');const f=document.getElementById('rf-from');if(f)f.closest('.field').classList.add('field-err');}
  if(!to){_missing.push('To Date');const t=document.getElementById('rf-to');if(t)t.closest('.field').classList.add('field-err');}
  if(!ltype){_missing.push('Leave Type');const g=document.getElementById('ltype-grid');if(g)g.classList.add('tgrid-err');}
  if(!rsn){_missing.push('Reason');const r=document.getElementById('rf-rsn');if(r)r.closest('.field').classList.add('field-err');}
  if(_missing.length){toast('Please fill in: '+_missing.join(', '),'bad');return;}
  if(from>to){toast(tx('errDate'),'bad');return;}
  // Overlap check against existing Pending/Approved requests
  if(rStaff._usedDates&&rStaff._usedDates.length){
    const conflict=rStaff._usedDates.find(r=>from<=r.to&&to>=r.from);
    if(conflict){
      toast('You already have a '+conflict.status+' request on overlapping dates ('+fmtDate(conflict.from)+(conflict.from!==conflict.to?' – '+fmtDate(conflict.to):'')+').','bad');
      return;
    }
  }
  const days=getActualDays(from,to),halfNote=getHalfNote(from,to),s=rStaff;
  const name=LANG==='kh'?(s.nameKh||s.name):s.name,pos=LANG==='kh'?(s.positionKh||s.position):s.position,gen=LANG==='kh'?(s.gender==='Male'?tx('male'):tx('female')):s.gender;
  const daysLabel=days+' day'+(days===1?'':(days===0.5?'':'s'))+halfNote;
  const _rows=[[tx('ptEid'),s.empId,false],[tx('ptName'),name,false],[tx('ptGen'),gen,false],[tx('ptPos'),document.getElementById('rf-pos').value||pos,false],[tx('ptType'),ltype.value+halfNote,true],[tx('ptFrom'),fmtDate(from),true],[tx('ptTo'),fmtDate(to),true],[tx('ptDays'),daysLabel,true],[tx('ptRsn'),rsn,false],[tx('ptSub'),todayFmt(),false]];
  document.getElementById('rpr-table').innerHTML=_rows.map(([k,v,h])=>`<tr class="${h?'rv-hl-row':''}"><td>${k}</td><td class="${h?'rv-hl':''}">${v}</td></tr>`).join('');
  const rm=document.getElementById('review-modal');rm.style.display='flex';setRStep(3);}
// ── Close review modal (back to form) ──
function closeReviewModal(){
  const rm=document.getElementById('review-modal');if(rm)rm.style.display='none';setRStep(2);

}
function rBackForm(){closeReviewModal();}
async function rConfirm(){
  if(_isSubmitting)return;
  _isSubmitting=true;
  closeReviewModal();
  const btn=document.getElementById('r-confirm-btn'),sp=document.getElementById('r-con-sp'),txt=document.getElementById('r-con-txt');
  btn.disabled=true;sp.style.display='block';txt.textContent='...';
  const from=document.getElementById('rf-from').value,to=document.getElementById('rf-to').value;
  const ltype=document.querySelector('input[name=ltype]:checked');
  const isTraining=ltype&&(ltype.value==='Training / Mission');
  const days=getActualDays(from,to);
  const halfNote=getHalfNote(from,to);
  const payload={employeeId:rStaff.empId,name:rStaff.name,gender:rStaff.gender,position:document.getElementById('rf-pos').value||rStaff.position,leaveType:(ltype.value==='Other'?(document.getElementById('rf-other-type').value.trim()||'Other'):ltype.value)+(halfNote),dateFrom:from,dateTo:to,workingDays:days,halfFirstDay:hdGetFirst(),halfLastDay:hdGetLast(),reason:document.getElementById('rf-rsn').value,submissionDate:todayFmt(),submittedFrom:document.getElementById('rf-sloc').value||'Phnom Penh',status:'Pending',language:LANG.toUpperCase(),timestamp:new Date().toISOString()};
  if(isTraining){
    // Training/Mission: submit to sheets (noLeave handled server-side), no print required
    if(!isMock()) apiPost('submitRequest',payload).catch(()=>{});
    setRStep(4);setReqBar(0);
    document.getElementById('req-form').style.display='none';
    document.getElementById('r-success').style.display='flex';
    btn.disabled=false;sp.style.display='none';txt.textContent=tx('conTxt');
    toast('Submitted to HR','ok2');
    _isSubmitting=false;
    return;
  }
  // Store payload — actual submit happens in doConfirm() only
  _pendingPayload={payload,from,to,days:String(days)};
  btn.disabled=false;sp.style.display='none';txt.textContent=tx('conTxt');
  // Show yellow warning modal — submit only if user clicks Confirm, not Cancel
  const m=document.getElementById('confirm-modal');
  m.classList.add('open');m.style.display='flex';
}
let _lastSubmit=null;
let _isSubmitting=false;
let _pendingPayload=null;
function closeModal(){
  const m=document.getElementById('confirm-modal');
  m.classList.remove('open');m.style.display='none';
}
function cancelConfirmModal(){
  closeModal();
  _isSubmitting=false;
  _pendingPayload=null;
  // Return user to review modal (where they came from)
  const rm=document.getElementById('review-modal');
  if(rm)rm.style.display='flex';
  setRStep(3);
}
function doConfirm(){
  closeModal();
  if(_pendingPayload){
    const{payload,from,to,days}=_pendingPayload;
    _lastSubmit={...payload,from,to,days,requestId:''};
    if(!isMock()){
      // Fire-and-forget — update requestId in background when server responds
      apiPost('submitRequest',payload).then(function(res){
        if(res&&res.requestId&&_lastSubmit){_lastSubmit.requestId=res.requestId;}
      }).catch(function(){});
    }
  }
  _isSubmitting=false;
  _pendingPayload=null;
  setRStep(4);
  document.getElementById('req-form').style.display='none';
  const suc=document.getElementById('r-success');
  suc.style.display='flex';
  setReqBar(0);
  if(_lastSubmit){fillPrint(_lastSubmit,_lastSubmit.from,_lastSubmit.to,_lastSubmit.days);}
  // Populate rich success page
  rPopulateSuccess();
  // Reset form fields
  document.getElementById('rf-from').value='';
  document.getElementById('rf-to').value='';
  document.getElementById('rf-rsn').value='';
  document.querySelectorAll('input[name=ltype]').forEach(r=>{r.checked=false;r.closest('.topt').classList.remove('sel');});
  document.querySelectorAll('.topt').forEach(t=>t.classList.remove('sel'));
  document.querySelectorAll('input[name=halfday-first][value="full"],input[name=halfday-last][value="full"]').forEach(r=>r.checked=true);
  document.getElementById('r-dpill').style.display='none';
  document.getElementById('halfday-row').style.display='none';
}
function rReprintLast(){if(_lastSubmit)fillPrint(_lastSubmit,_lastSubmit.from,_lastSubmit.to,_lastSubmit.days);}
function rPopulateSuccess(){
  const s=rStaff,d=_lastSubmit;
  if(!s||!d)return;
  // Submitted summary
  const sumEl=document.getElementById('rsuc-summary');
  if(sumEl){
    sumEl.innerHTML=[
      ['Type',d.leaveType||'—'],
      ['From',fmtDate(d.from||d.dateFrom)],
      ['To',fmtDate(d.to||d.dateTo)],
      ['Days',d.days+' day'+(d.days==1?'':'s')],
      ['Reason',d.reason||'—']
    ].map(([k,v])=>`<div class="rsuc-row"><span class="rsuc-key">${k}</span><span class="rsuc-val">${v}</span></div>`).join('');
  }
  // Balance — calculate post-submission
  const balEl=document.getElementById('rsuc-balance');
  if(balEl){
    const total=s.annualDays||0;
    const usedBefore=s.usedDays||0;
    const justUsed=Number(d.days)||0;
    const newUsed=usedBefore+justUsed;
    const rem=total-newUsed;
    const pct=total>0?Math.min(100,Math.round(newUsed/total*100)):0;
    const remColor=rem>5?'var(--ok)':rem>0?'var(--warn)':'var(--red)';
    balEl.innerHTML=`<div class="rsuc-bal-stat"><div class="rsuc-bal-num">${total}</div><div class="rsuc-bal-lbl">Total</div></div>`+
      `<div class="rsuc-bal-stat"><div class="rsuc-bal-num" style="color:var(--warn)">${newUsed}</div><div class="rsuc-bal-lbl">Used</div></div>`+
      `<div class="rsuc-bal-stat"><div class="rsuc-bal-num" style="color:${remColor}">${rem}</div><div class="rsuc-bal-lbl">Remaining</div></div>`+
      `<div style="grid-column:1/-1"><div class="balbar" style="margin-top:6px"><div class="balfill" style="width:${pct}%"></div></div></div>`;
  }
  // Fetch fresh history in background
  const histEl=document.getElementById('rsuc-history');
  if(!histEl)return;
  histEl.innerHTML=`<div class="rsuc-loading"><svg style="animation:spin .7s linear infinite" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> Loading…</div>`;
  (isMock()?Promise.resolve({result:'notfound'}):apiPost('getHistory',{empId:s.empId,fullName:s.name})).then(res=>{
    if(res.result==='success'&&res.history&&res.history.length){
      histEl.innerHTML=`<div class="rsuc-hist-wrap"><table class="rsuc-hist-tbl"><thead><tr><th>Type</th><th>From</th><th>Days</th><th>Status</th></tr></thead><tbody>`+
        res.history.slice(0,8).map(r=>`<tr><td>${r.type||'—'}</td><td style="white-space:nowrap">${fmtDate(r.from)}</td><td style="text-align:center">${r.days}</td><td><span class="badge b-${(r.status||'').toLowerCase()}" style="font-size:10px">${r.status}</span></td></tr>`).join('')+
        `</tbody></table></div>`;
    } else {
      histEl.innerHTML=`<div style="font-size:13px;color:var(--txt3);padding:8px 0">No previous requests found.</div>`;
    }
  }).catch(()=>{histEl.innerHTML=`<div style="font-size:13px;color:var(--txt3)">Could not load history.</div>`;});
}

// ── PRINT FILL ───────────────────────────────────
function openPrint(data){
  localStorage.setItem('lbs_print_data', JSON.stringify(data));
  window.open('print/index.html','_blank');
}
function fillPrint(d,from,to,days){
  const s=rStaff,name=LANG==='kh'?(s.nameKh||s.name):s.name,pos=LANG==='kh'?(s.positionKh||s.position):s.position,gen=LANG==='kh'?(s.gender==='Male'?tx('male'):tx('female')):s.gender;
  openPrint({name,gender:gen,position:pos,empId:s.empId,leaveType:d.leaveType,days:String(days),reason:d.reason||'',dateFrom:from,dateTo:to,lang:LANG,requestId:d.requestId||''});
}
function fillPrintRecord(r,staff){
  const name=LANG==='kh'?(staff.nameKh||staff.name):staff.name,pos=LANG==='kh'?(staff.positionKh||staff.position):staff.position,gen=LANG==='kh'?(staff.gender==='Male'?tx('male'):tx('female')):staff.gender;
  openPrint({name,gender:gen,position:pos,empId:staff.empId||'',leaveType:LANG==='kh'?(r.typeKh||r.type):r.type,days:String(r.days),reason:r.reason||'',dateFrom:r.from,dateTo:r.to,lang:LANG,requestId:r.id||''});
}


// ══════════════════ STATUS ══════════════════════
let stStaff=null,stHistory=[],stNotices=[],stHistYear=new Date().getFullYear();
function stSetHistYear(val){stHistYear=val==='all'?'all':parseInt(val,10);renderStDash();}
function stRefreshAll(){
  const btn=document.getElementById('st-refresh-btn');
  const icon=document.getElementById('st-refresh-icon');
  if(btn){btn.disabled=true;btn.style.color='#ca8a04';}
  if(icon)icon.style.animation='spin .7s linear infinite';
  Promise.all([
    isMock()?Promise.resolve({result:'notfound'}):apiPost('getHistory',{empId:stStaff.empId,fullName:stStaff.name}),
    isMock()?Promise.resolve({result:'notfound'}):apiPost('getStaffNotices',{empId:stStaff.empId,fullName:stStaff.name})
  ]).then(([hRes,nRes])=>{
    if(hRes.result==='success'){stHistory=hRes.history||[];}
    if(nRes.result==='success'){stNotices=nRes.notices||[];}
    renderStDash();
    toast('Up to date','ok2');
  }).catch(()=>toast('Refresh failed','bad'))
  .finally(()=>{
    if(icon)icon.style.animation='';
    if(btn){btn.disabled=false;btn.style.color='';}
  });
}
function stPopulateYearFilter(){
  const sel=document.getElementById('st-hist-yr');
  if(!sel)return;
  const cur=new Date().getFullYear();
  const years=new Set([cur]);
  stHistory.forEach(r=>{
    const d=r.from?new Date(r.from.includes('T')||r.from.includes('/')?r.from:r.from+'T00:00:00'):null;
    if(d&&!isNaN(d))years.add(d.getFullYear());
  });
  const sorted=[...years].sort((a,b)=>b-a);
  sel.innerHTML='<option value="all">All Years</option>'+sorted.map(y=>`<option value="${y}"${y===stHistYear||y==stHistYear?'selected':''}>${y}</option>`).join('');
}
function stReset(){stStaff=null;stHistory=[];stNotices=[];stHistYear=new Date().getFullYear();document.getElementById('st-gate').style.display='block';document.getElementById('st-dash').style.display='none';document.getElementById('st-id-input').value='';const _sni=document.getElementById('st-name-input');if(_sni)_sni.value='';document.getElementById('st-idfb').textContent='';}
// ── VERIFY MESSAGE OVERLAY ───────────────────────────────────────
// Shows sequential status messages while API call is in-flight.
// If API resolves before messages finish, cancel() skips immediately.
const GMO_MSGS=['Verifying Name','Verifying ID','Almost done, hang tight'];
const GMO_DUR=[2600,2600,2800]; // ms per message
function _gmoStart(gateId,msgs,durs){
  msgs=msgs||GMO_MSGS; durs=durs||GMO_DUR;
  const gate=document.getElementById(gateId);
  if(!gate)return{cancel:()=>{}};
  // Remove stale overlay
  const old=document.getElementById('gmo-'+gateId);if(old)old.remove();
  // Build overlay
  const ov=document.createElement('div');
  ov.className='gmo-overlay';ov.id='gmo-'+gateId;
  ov.innerHTML=`<div class="gmo-inner"><div class="gmo-ring"></div><div class="gmo-msg-row"><span class="gmo-msg-text" id="gmo-t-${gateId}"></span><span class="gmo-dots" id="gmo-d-${gateId}"></span></div><div class="gmo-prog-track"><div class="gmo-prog-fill" id="gmo-b-${gateId}"></div></div></div>`;
  document.body.appendChild(ov);
  const tEl=document.getElementById('gmo-t-'+gateId);
  const dEl=document.getElementById('gmo-d-'+gateId);
  const bEl=document.getElementById('gmo-b-'+gateId);
  // Dots ticker
  let dn=0;
  const dtick=setInterval(()=>{dn=(dn+1)%4;if(dEl)dEl.textContent='.'.repeat(dn);},380);
  // Progress bar
  const total=durs.reduce((a,b)=>a+b,0);
  if(bEl){bEl.style.transition=`width ${total}ms linear`;requestAnimationFrame(()=>requestAnimationFrame(()=>{bEl.style.width='91%';}))}
  // Cancellable sleep via shared resolve
  let _cancelResolve;
  const _cancelSig=new Promise(r=>{_cancelResolve=r;});
  function _csleep(ms){return Promise.race([new Promise(r=>setTimeout(r,ms)),_cancelSig]);}
  // Message loop (runs in background, independent of API)
  (async()=>{
    for(let i=0;i<msgs.length;i++){
      if(tEl){
        if(i>0){tEl.style.opacity='0';await _csleep(240);}
        tEl.textContent=msgs[i];tEl.style.opacity='1';
      }
      await _csleep(durs[i]);
    }
  })();
  // cancel(success) — call when API resolves
  function cancel(ok){
    clearInterval(dtick);
    _cancelResolve(); // abort message loop immediately
    if(bEl){bEl.style.transition='width 0.22s ease';bEl.style.width=ok?'100%':'30%';}
    ov.style.transition='opacity 0.2s ease';ov.style.opacity='0';
    setTimeout(()=>{if(ov.parentNode)ov.remove();},220);
  }
  return{cancel};
}
// ── GATE LOADING ANIMATION ───────────────────────────────────────
function gateSetLoading(gateId,btnId,on){
  const gate=document.getElementById(gateId);
  const btn=document.getElementById(btnId);
  if(gate)gate.classList.toggle('gate-verifying',on);
  if(btn){btn.disabled=on;if(on)btn.classList.add('btn-verifying');else btn.classList.remove('btn-verifying');}
}
function gateSetError(gateId){
  const gate=document.getElementById(gateId);
  if(!gate)return;
  gate.classList.remove('gate-verifying');
  gate.classList.add('gate-error');
  setTimeout(()=>gate.classList.remove('gate-error'),600);
}
async function stVerify(){
  const val=normalizeId(document.getElementById('st-id-input').value.trim());
  const nameInput=(document.getElementById('st-name-input')?document.getElementById('st-name-input').value||'':'').trim();
  const fb=document.getElementById('st-idfb');
  if(!nameInput){fb.textContent='Please enter your Full Name.';fb.className='idfb err';gateSetError('st-gate');return;}
  if(!val){fb.textContent='Please enter your Staff ID.';fb.className='idfb err';gateSetError('st-gate');return;}
  const btn=document.getElementById('st-gate-btn'),sp=document.getElementById('st-gate-sp');
  gateSetLoading('st-gate','st-gate-btn',true);sp.style.display='block';
  const _gmo=_gmoStart('st-gate');
  try{
    const res=isMock()?mockHist(val):await apiPost('getHistory',{empId:val,fullName:nameInput});
    if(res.result==='success'){
      const staffName=(res.staff.name||'').trim().toLowerCase();
      const staffNameKh=(res.staff.nameKh||'').trim().toLowerCase();
      const entered=nameInput.toLowerCase();
      if(entered!==staffName&&entered!==staffNameKh){
        _gmo.cancel(false);
        fb.textContent='Name does not match our records.';fb.className='idfb err';
        setTimeout(()=>gateSetError('st-gate'),210);
        gateSetLoading('st-gate','st-gate-btn',false);sp.style.display='none';return;
      }
      stStaff=res.staff;stStaff.empId=val;stHistory=res.history||[];
      if(!isMock()){try{const nr=await apiPost('getStaffNotices',{empId:val,fullName:nameInput});if(nr.result==='success')stNotices=nr.notices||[];}catch(e){}}
      _gmo.cancel(true);
      document.getElementById('st-gate').style.display='none';
      document.getElementById('st-dash').style.display='block';
      renderStDash();
    }
    else{_gmo.cancel(false);fb.textContent=tx('notFound');fb.className='idfb err';setTimeout(()=>gateSetError('st-gate'),210);}
  }catch(e){_gmo.cancel(false);toast('Error','bad');}finally{gateSetLoading('st-gate','st-gate-btn',false);sp.style.display='none';}
}
function renderStDash(){
  const s=stStaff,name=LANG==='kh'?(s.nameKh||s.name):s.name,pos=LANG==='kh'?(s.positionKh||s.position):s.position,rem=s.annualDays-s.usedDays,pct=Math.round(Math.max(0,rem/s.annualDays*100));
  document.getElementById('st-avatar').textContent=name.charAt(0).toUpperCase();
  document.getElementById('st-name').textContent=name;document.getElementById('st-pos').textContent=pos;document.getElementById('st-eid').textContent=s.empId;
  document.getElementById('st-tot').textContent=s.annualDays;document.getElementById('st-used').textContent=s.usedDays;const remDisp=Number(rem)%1===0?rem:rem.toFixed(1);document.getElementById('st-rem').textContent=remDisp;
  document.getElementById('st-bal-fill').style.width=pct+'%';document.getElementById('st-bal-pct').textContent=pct+'%';
  document.getElementById('st-nodata').textContent=tx('stNoData');
  stPopulateYearFilter();
  const tbody=document.getElementById('st-tbody');tbody.innerHTML='';
  const filtered=stHistYear==='all'?stHistory:stHistory.filter(r=>{
    const d=r.from?new Date(r.from.includes('T')||r.from.includes('/')?r.from:r.from+'T00:00:00'):null;
    return d&&!isNaN(d)&&d.getFullYear()===stHistYear;
  });
  if(!filtered.length){document.getElementById('st-nodata').style.display='block';return;}
  document.getElementById('st-nodata').style.display='none';
  tbody.innerHTML=filtered.map((r,i)=>{
    const typeD=LANG==='kh'?(r.typeKh||r.type):r.type;
    const origIdx=stHistory.indexOf(r);
    return`<tr><td style="font-size:10px;color:var(--txt3);font-family:monospace">${r.id}</td><td style="font-weight:500">${typeD}</td><td>${fmtDate(r.from)}</td><td>${fmtDate(r.to)}</td><td style="text-align:center;font-weight:600">${r.days}</td><td><span class="badge b-${(r.status||'').toLowerCase()}">${r.status}</span></td><td><button class="pbtn" onclick="stPrint(${origIdx})"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg></button></td></tr>`;
  }).join('');
  renderStNotices();
}
function renderStNotices(){
  const tbody=document.getElementById('st-notice-tbody');
  const nodata=document.getElementById('st-notice-nodata');
  if(!tbody||!nodata)return;
  tbody.innerHTML='';
  if(!stNotices.length){nodata.style.display='block';return;}
  nodata.style.display='none';
  tbody.innerHTML=stNotices.map(n=>{
    const isLate=n.type==='Late Arrival';
    const badge=isLate?'b-pending':'b-rejected';
    return`<tr><td><span class="badge ${badge}" style="font-size:11px">${n.type}</span></td><td style="white-space:nowrap">${n.date}</td><td style="white-space:nowrap">${n.time}</td><td style="color:var(--txt2)">${n.reason||'—'}</td></tr>`;
  }).join('');
}
function stPrint(i){fillPrintRecord(stHistory[i],stStaff);}

// ══════════════════ HR ══════════════════════════
let hrUser=null,hrToken=null,allReqs=[],hrFilter_='All';
async function hrLogin(){
  const user=document.getElementById('hr-user').value.trim(),pass=document.getElementById('hr-pass').value;
  if(!user||!pass){document.getElementById('hr-lerr').textContent=tx('hrLerr');gateSetError('hr-login');return;}
  const btn=document.getElementById('hr-lbtn'),sp=document.getElementById('hr-lsp');
  gateSetLoading('hr-login','hr-lbtn',true);sp.style.display='block';
  const _gmo=_gmoStart('hr-login',['Verifying Username','Checking Credentials','Almost done, hang tight'],[2600,2600,2800]);
  try{
    let res;
    if(isMock()){res=(user==='admin'&&pass==='Admin2026')||(user==='hrmanager'&&pass==='HRPass2026')?{result:'success',displayName:user}:{result:'fail'};}
    else{res=await apiPost('hrLogin',{username:user,password:pass,fp:getFingerprint()});}
    if(res.result==='success'){_gmo.cancel(true);hrUser=res.displayName||user;hrToken=res.token||null;if(res.hmacKey)setHmacKey(res.hmacKey);sessionStorage.setItem('hr_sess',JSON.stringify({user:hrUser,token:hrToken,hmacKey:res.hmacKey||''}));document.getElementById('hr-login').style.display='none';document.getElementById('hr-dash').style.display='block';document.getElementById('hr-greet').textContent=tx('hrGreet')+hrUser;document.getElementById('hr-gsub').textContent=tx('hrGsub')+' — '+todayFmt();hrLoadData();}
    else{_gmo.cancel(false);document.getElementById('hr-lerr').textContent=res.result==='locked'?(res.error||tx('hrLerr')):tx('hrLerr');setTimeout(()=>gateSetError('hr-login'),210);}
  }catch(e){_gmo.cancel(false);document.getElementById('hr-lerr').textContent='Connection error. Please try again.';console.error('hrLogin error:',e);}finally{gateSetLoading('hr-login','hr-lbtn',false);sp.style.display='none';}
}
function hrLogout(){hrUser=null;hrToken=null;_hmacKey=null;allReqs=[];cacheClear();sessionStorage.removeItem('hr_sess');document.getElementById('hr-dash').style.display='none';document.getElementById('hr-login').style.display='block';document.getElementById('hr-user').value='';document.getElementById('hr-pass').value='';document.getElementById('hr-lerr').textContent='';}
// ── DATA CACHE ────────────────────────────────────────────────────
const CACHE_TTL = 3600000; // 1 hour
function cacheSet(key, val){try{sessionStorage.setItem(key,JSON.stringify({v:val,t:Date.now()}));}catch(e){}}
function cacheGet(key){try{const r=JSON.parse(sessionStorage.getItem(key)||'null');if(r&&Date.now()-r.t<CACHE_TTL)return r.v;}catch(e){}return null;}
function cacheClear(){['hr_reqs','hr_staff','hr_notices','hr_noticestats'].forEach(k=>sessionStorage.removeItem(k));}

async function hrLoadData(silent){
  const ld=document.getElementById('hr-loading');
  if(!silent&&ld)ld.style.display='flex';
  try{
    if(isMock()){
      allReqs=[];allStaffList=[];noticesList=[];noticeStats=[];
      await new Promise(r=>setTimeout(r,400));
    } else {
      // Restore from cache first for instant render
      const cReqs=cacheGet('hr_reqs'),cStaff=cacheGet('hr_staff'),
            cNl=cacheGet('hr_notices'),cNs=cacheGet('hr_noticestats');
      if(cReqs){allReqs=cReqs;}
      if(cStaff){allStaffList=cStaff;}
      if(cNl){noticesList=cNl;}
      if(cNs){noticeStats=cNs;}
      if(cReqs&&cStaff){
        hrRenderSummary();hrRenderReqs();hrRenderStaff();
        if(ld)ld.style.display='none';
      }
      // Single authenticated call — avoids token rotation conflict
      const res=await apiPost('getAllData',{token:hrToken||''});
      if(res.result==='unauthorized'){
        if(!silent){toast('Session expired — please log in again','bad');hrLogout();}
        return;
      }
      if(res.result==='success'){
        allReqs=res.requests||[];
        allStaffList=res.staff||[];
        noticesList=res.notices||[];
        noticeStats=res.stats||[];
        cacheSet('hr_reqs',allReqs);
        cacheSet('hr_staff',allStaffList);
        cacheSet('hr_notices',noticesList);
        cacheSet('hr_noticestats',noticeStats);
      }
    }
    hrRenderSummary();hrRenderReqs();hrRenderStaff();
    anApplyFilters();
  }catch(e){if(!silent)toast('Error loading data','bad');}
  finally{if(ld)ld.style.display='none';}
}

// Background preload — called right after session restore, silently
function hrPreload(){
  if(hrToken&&hrUser)hrLoadData(true);
}
function hrRenderSummary(){const tot=allReqs.length,pend=allReqs.filter(r=>r.status==='Pending').length,appr=allReqs.filter(r=>r.status==='Approved').length,rej=allReqs.filter(r=>r.status==='Rejected').length;document.getElementById('hr-st').textContent=tot;document.getElementById('hr-sp').textContent=pend;document.getElementById('hr-sa').textContent=appr;document.getElementById('hr-sr').textContent=rej;}
function hrFilter(f){hrFilter_=f;document.querySelectorAll('.ftab').forEach(t=>t.classList.remove('on'));const map={'All':'hft-all','Pending':'hft-pend','Approved':'hft-appr','Rejected':'hft-rej'};document.getElementById(map[f]).classList.add('on');hrRenderReqs();}
const _hrSaving=new Set();
const _hrDeleting=new Set();
function hrRenderReqs(){
  const filtered=hrFilter_==='All'?allReqs:allReqs.filter(r=>r.status===hrFilter_);
  const tbody=document.getElementById('hr-tbody');
  document.getElementById('hr-nodata').style.display=filtered.length?'none':'block';
  tbody.innerHTML=filtered.map(r=>{
    const saving=_hrSaving.has(r.id);
    const deleting=_hrDeleting.has(r.id);
    const busy=saving||deleting;
    const canActMain=r.status==='Pending'&&!busy;
    const spin=`<svg style="animation:spin .7s linear infinite" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`;
    const delBtn=!busy?`<button class="abtn abtn-del" onclick="hrDeleteRequest('${r.id}','${(r.empName||r.empId).replace(/'/g,"\\'")}','${r.from}')">Delete</button>`:'';
    const actionCell=deleting
      ?`<span style="font-size:11px;color:var(--red);display:flex;align-items:center;gap:5px">${spin}Deleting…</span>`
      :saving
        ?`<span style="font-size:11px;color:var(--txt3);display:flex;align-items:center;gap:5px">${spin}Saving…</span>`
        :canActMain
          ?`<button class="abtn abtn-ok" onclick="hrUpdateStatus('${r.id}','Approved')">${tx('hrApprove')}</button><button class="abtn abtn-bad" onclick="hrUpdateStatus('${r.id}','Rejected')">${tx('hrReject')}</button>${delBtn}`
          :delBtn||'<span style="font-size:11px;color:var(--txt3)">—</span>';
    return`<tr id="hr-row-${r.id}" style="transition:background .2s,opacity .2s${busy?';opacity:.55':''}"><td style="font-size:10px;color:var(--txt3);font-family:monospace">${r.id||'—'}</td><td><div style="font-weight:500">${r.empName||r.empId}</div><div style="font-size:11px;color:var(--txt3)">${r.empId}</div></td><td>${r.type}</td><td>${fmtDate(r.from)}</td><td style="text-align:center;font-weight:600">${r.days}</td><td><span class="badge b-${(r.status||'').toLowerCase()}">${r.status}</span></td><td><div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap">${actionCell}</div></td></tr>`;
  }).join('');
  // ── Deep link: scroll to and highlight the linked request ────────
  if(_deepReq){
    const target=document.getElementById('hr-row-'+_deepReq);
    if(target){
      target.style.background='rgba(192,39,45,.10)';
      target.style.outline='2px solid rgba(192,39,45,.4)';
      target.style.borderRadius='6px';
      setTimeout(()=>target.scrollIntoView({behavior:'smooth',block:'center'}),200);
      setTimeout(()=>{target.style.background='';target.style.outline='';},4000);
      _deepReq=''; // clear after use
    }
  }
}
async function hrUpdateStatus(reqId,ns){
  const reauth=await requireReauth('Enter your password to '+(ns==='Approved'?'approve':'reject')+' this request.');
  if(!reauth)return;
  const i=allReqs.findIndex(r=>r.id===reqId);
  if(i<0)return;
  const prevStatus=allReqs[i].status;
  // ── Optimistic update ─────────────────────────────────────────────
  allReqs[i].status=ns;
  _hrSaving.add(reqId);
  hrRenderSummary();hrRenderReqs();
  toast(ns==='Approved'?'Approved ✓':'Rejected ✕','ok2');
  // ── Background save ───────────────────────────────────────────────
  try{
    if(!isMock()){
      const res=await apiPost('updateStatus',{requestId:reqId,status:ns,hrUser,token:hrToken||'',reauth});
      if(!res||res.result!=='success'){
        // Revert on failure
        allReqs[i].status=prevStatus;
        toast(res&&res.error?res.error:'Save failed — reverted.','bad');
      }
    }
  }catch(e){
    allReqs[i].status=prevStatus;
    toast('Connection error — reverted.','bad');
  }finally{
    _hrSaving.delete(reqId);
    hrRenderSummary();hrRenderReqs();
  }
}
// ── DELETE REQUEST ────────────────────────────────────────────────
let _hrDelTarget=null,_hrDelReauth=null;
function hrDeleteRequest(reqId,name,date){
  _hrDelTarget={reqId,name,date};
  document.getElementById('del-req-label').textContent=(name||reqId)+' · '+fmtDate(date);
  document.getElementById('hr-del-modal').style.display='flex';
  resetDelSlider();
}
function closeDelModal(){
  document.getElementById('hr-del-modal').style.display='none';
  _hrDelTarget=null;_hrDelReauth=null;
  resetDelSlider();
}
// Slide-to-confirm logic
let _delSliding=false,_delStartX=0,_delCurX=0;
function delSliderStart(e){
  _delSliding=true;
  _delStartX=e.touches?e.touches[0].clientX:e.clientX;
  document.addEventListener('mousemove',delSliderMove);
  document.addEventListener('mouseup',delSliderEnd);
  document.addEventListener('touchmove',delSliderMove,{passive:true});
  document.addEventListener('touchend',delSliderEnd);
}
function delSliderMove(e){
  if(!_delSliding)return;
  const track=document.getElementById('del-slider-track');
  const thumb=document.getElementById('del-slider-thumb');
  const fill=document.getElementById('del-slider-fill');
  const hint=document.getElementById('del-slider-hint');
  if(!track||!thumb)return;
  const trackW=track.offsetWidth;
  const thumbW=thumb.offsetWidth;
  const maxX=trackW-thumbW-8;
  const cx=e.touches?e.touches[0].clientX:e.clientX;
  const dx=Math.max(0,Math.min(maxX,cx-_delStartX));
  thumb.style.left=(4+dx)+'px';
  const pct=dx/maxX;
  fill.style.width=(dx+thumbW/2)+'px';
  fill.style.background=`rgba(192,39,45,${0.15+pct*0.7})`;
  if(hint)hint.style.opacity=1-pct;
  if(pct>=0.92)delSliderConfirm();
}
function delSliderEnd(){
  _delSliding=false;
  document.removeEventListener('mousemove',delSliderMove);
  document.removeEventListener('mouseup',delSliderEnd);
  document.removeEventListener('touchmove',delSliderMove);
  document.removeEventListener('touchend',delSliderEnd);
  // Snap back if not confirmed
  resetDelSlider();
}
function resetDelSlider(){
  const thumb=document.getElementById('del-slider-thumb');
  const fill=document.getElementById('del-slider-fill');
  const hint=document.getElementById('del-slider-hint');
  if(thumb)thumb.style.left='4px';
  if(fill){fill.style.width='0';fill.style.background='';}
  if(hint)hint.style.opacity='1';
  _delSliding=false;
}
async function delSliderConfirm(){
  _delSliding=false;
  document.removeEventListener('mousemove',delSliderMove);
  document.removeEventListener('mouseup',delSliderEnd);
  document.removeEventListener('touchmove',delSliderMove);
  document.removeEventListener('touchend',delSliderEnd);
  if(!_hrDelTarget)return;
  const{reqId}=_hrDelTarget;
  closeDelModal();
  // Reauth
  const reauth=await requireReauth('Enter your password to confirm deletion.');
  if(!reauth){return;}
  const i=allReqs.findIndex(r=>r.id===reqId);
  if(i<0)return;
  const removed=allReqs.splice(i,1)[0];
  _hrDeleting.add(reqId);
  hrRenderSummary();hrRenderReqs();
  toast('Request deleted','ok2');
  try{
    if(!isMock()){
      const res=await apiPost('deleteRequest',{requestId:reqId,token:hrToken||'',reauth});
      if(!res||res.result!=='success'){
        allReqs.splice(i,0,removed);
        toast(res&&res.error?res.error:'Delete failed — restored.','bad');
      }
    }
  }catch(e){
    allReqs.splice(i,0,removed);
    toast('Connection error — restored.','bad');
  }finally{
    _hrDeleting.delete(reqId);
    hrRenderSummary();hrRenderReqs();
  }
}

function hrRenderAnalytics(){
  const reqs=anFilterReqs();
  const noData=!allReqs.length&&!noticeStats.length;
  // ── Summary stats ────────────────────────────────────────────
  const totalDays=reqs.reduce((s,r)=>s+(Number(r.days)||0),0);
  const uniqueStaff=[...new Set(reqs.map(r=>r.empId))].length;
  const lateCount=noticesList.filter(n=>n.type==='Late Arrival').length;
  const earlyCount=noticesList.filter(n=>n.type==='Leave Early').length;
  document.getElementById('an-statrow').innerHTML=noData
    ?'<div style="padding:20px;color:var(--txt3)">No data yet.</div>'
    :`<div class="smbox"><div class="smnum">${totalDays}</div><div class="smlbl">Days Requested</div></div>`+
     `<div class="smbox sa"><div class="smnum">${uniqueStaff}</div><div class="smlbl">Staff</div></div>`+
     `<div class="smbox sp"><div class="smnum">${lateCount}</div><div class="smlbl">Late Arrivals</div></div>`+
     `<div class="smbox sr"><div class="smnum">${earlyCount}</div><div class="smlbl">Early Departures</div></div>`;

  // ── Leave by type ────────────────────────────────────────────
  const byType={};
  reqs.forEach(r=>{byType[r.type]=(byType[r.type]||0)+(Number(r.days)||0);});
  const typeEntries=Object.entries(byType).sort((a,b)=>b[1]-a[1]);
  const maxType=typeEntries.length?typeEntries[0][1]:1;
  document.getElementById('an-bytype').innerHTML=typeEntries.length?typeEntries.map(([t,d])=>
    `<div style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px"><span>${t}</span><span style="font-weight:600">${d}d</span></div>`+
    `<div style="height:6px;background:var(--border);border-radius:3px"><div style="height:6px;background:var(--red);border-radius:3px;width:${Math.round(d/maxType*100)}%"></div></div></div>`
  ).join(''):'<div style="color:var(--txt3);font-size:13px">No requests for this period.</div>';

  // ── Leave by month ───────────────────────────────────────────
  const byMonth={};
  reqs.forEach(r=>{
    if(r.from){
      const d=new Date(r.from);if(isNaN(d))return;
      const k=d.getFullYear()+'-'+(String(d.getMonth()+1).padStart(2,'0'));
      byMonth[k]=(byMonth[k]||0)+(Number(r.days)||0);
    }
  });
  const monthEntries=Object.entries(byMonth).sort((a,b)=>a[0]<b[0]?-1:1).slice(-12);
  const maxMonth=monthEntries.length?Math.max(...monthEntries.map(e=>e[1])):1;
  const _mNames=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  document.getElementById('an-bymonth').innerHTML=monthEntries.length?
    `<div style="display:flex;align-items:flex-end;gap:4px;height:80px">`+
    monthEntries.map(([m,d])=>{
      const mName=_mNames[parseInt(m.slice(5))-1]||m.slice(5);
      return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px" title="${d} days total leave in ${mName}">`+
        `<div style="font-size:9px;color:var(--txt3)">${d}d</div>`+
        `<div style="width:100%;background:var(--red);border-radius:2px 2px 0 0;height:${Math.round(d/maxMonth*60)}px"></div>`+
        `<div style="font-size:8px;color:var(--txt3);writing-mode:vertical-rl;transform:rotate(180deg)">${mName}</div>`+
      `</div>`;
    }).join('')+`</div>`
  :'<div style="color:var(--txt3);font-size:13px">No data for this period.</div>';

  // ── Staff leave table ────────────────────────────────────────
  const staffMap={};
  allStaffList.forEach(s=>{staffMap[normalizeId(s.empId)]={name:s.name,position:s.position,annual:s.annualDays,used:s.usedDays,requests:0};});
  reqs.forEach(r=>{const k=normalizeId(r.empId);if(staffMap[k])staffMap[k].requests++;});
  let staffRows=Object.entries(staffMap).sort((a,b)=>anStaffSort==='name'?a[1].name.localeCompare(b[1].name):b[1].used-a[1].used);
  if(anFilter.staff)staffRows=staffRows.filter(([,s])=>s.name===anFilter.staff);
  document.getElementById('an-staffbody').innerHTML=staffRows.map(([id,s])=>{
    const rem=(s.annual||0)-(s.used||0);
    return `<tr><td style="font-weight:500">${s.name}</td><td style="color:var(--txt2)">${s.position}</td>`+
      `<td style="text-align:center">${s.annual}</td><td style="text-align:center;color:var(--warn)">${s.used}</td>`+
      `<td style="text-align:center;color:${rem>5?'var(--ok)':rem>0?'var(--warn)':'var(--red)'};font-weight:600">${rem}</td>`+
      `<td style="text-align:center">${s.requests}</td></tr>`;
  }).join('');

  // ── Notice stats table ───────────────────────────────────────
  const tbody=document.getElementById('an-noticebody');
  const empty=document.getElementById('an-noticeempty');
  if(!noticeStats.length){tbody.innerHTML='';empty.style.display='block';return;}
  empty.style.display='none';
  tbody.innerHTML=noticeStats.map(s=>{
    var canConvert,extraCol;
    if(_timedMode){
      const totalMins=s.totalMinutes||0;
      const days=Math.floor(totalMins/WORK_DAY_MINS);
      canConvert=days>=1;
      extraCol=`<td style="text-align:center;color:var(--txt2);font-size:11px">${_fmtMins(totalMins)}</td>`+
        `<td style="text-align:center">${canConvert?`<button onclick="convertLatePage('${s.empId}','${s.name}',${JSON.stringify(s).replace(/'/g,"\\'")})" style="font-size:11px;padding:3px 10px;border:none;border-radius:6px;background:var(--red);color:#fff;cursor:pointer">Convert (${days}d)</button>`:'—'}</td>`;
    }else{
      canConvert=s.late>=_lateThreshold;
      extraCol=`<td style="text-align:center">${canConvert?`<button onclick="convertLatePage('${s.empId}','${s.name}',${JSON.stringify(s).replace(/'/g,"\\'")})" style="font-size:11px;padding:3px 10px;border:none;border-radius:6px;background:var(--red);color:#fff;cursor:pointer">Convert</button>`:'—'}</td>`;
    }
    return`<tr><td style="font-weight:500">${s.name}</td>`+
    `<td style="text-align:center;color:var(--warn)">${s.late}</td>`+
    `<td style="text-align:center;color:var(--red)">${s.early}</td>`+
    `<td style="text-align:center;font-weight:600">${s.total}</td>`+
    extraCol+`</tr>`;
  }).join('');
}

let _lateThreshold=2;
let _timedMode=false; // OFF by default — turn ON in Analytics tab
const WORK_DAY_MINS=480; // 8h work day (08:30–17:30 minus 1h lunch)

function _fmtMins(m){const h=Math.floor(m/60),mn=m%60;return h?`${h}h ${mn}m`:`${mn}m`;}

async function loadLateThreshold(){
  const el=document.getElementById('an-late-threshold');
  try{
    const [tRes,mRes]=await Promise.all([apiHR('getLateThreshold',{}),apiHR('getTimedMode',{})]);
    if(tRes&&tRes.threshold){_lateThreshold=tRes.threshold;if(el)el.value=tRes.threshold;}
    if(mRes){_timedMode=!!mRes.enabled;_applyTimedModeUI();}
  }catch(e){}
}
function _applyTimedModeUI(){
  const tog=document.getElementById('an-timed-toggle');
  const timeTh=document.getElementById('an-th-time');
  if(tog){tog.textContent=_timedMode?'ON':'OFF';tog.style.background=_timedMode?'var(--ok)':'var(--txt3)';}
  if(timeTh)timeTh.style.display=_timedMode?'':'none';
  hrRenderAnalytics();
}
async function toggleTimedMode(){
  _timedMode=!_timedMode;
  try{await apiHR('setTimedMode',{enabled:_timedMode});}catch(e){}
  _applyTimedModeUI();
  toast(_timedMode?'Time-based mode ON':'Count-based mode ON','ok2');
}
async function saveLateThreshold(){
  const el=document.getElementById('an-late-threshold');if(!el)return;
  const n=parseInt(el.value,10);if(isNaN(n)||n<1){toast('Enter a valid number','bad');return;}
  try{
    await apiHR('setLateThreshold',{threshold:n});
    _lateThreshold=n;toast('Threshold saved','ok2');hrRenderAnalytics();
  }catch(e){toast('Failed to save','bad');}
}
async function convertLatePage(empId,empName,stat){
  const staffInfo=allStaffList.find(s=>String(s.empId)===String(empId))||{};
  var days,confirmMsg;
  if(_timedMode){
    const totalMins=stat.totalMinutes||0;
    days=Math.floor(totalMins/WORK_DAY_MINS);
    confirmMsg=`Convert accumulated time for ${empName}?\n\nLate: ${_fmtMins(stat.lateMinutes||0)}\nEarly: ${_fmtMins(stat.earlyMinutes||0)}\nTotal: ${_fmtMins(totalMins)} → ${days} day(s) deducted`;
  }else{
    const lateCount=stat.late||0;
    days=Math.floor(lateCount/_lateThreshold);
    confirmMsg=`Convert ${lateCount} late arrivals → ${days} day(s) deducted from ${empName}?`;
  }
  if(days<=0){toast('Not enough accumulated time/count yet','bad');return;}
  if(!confirm(confirmMsg))return;
  try{
    const res=await apiHR('convertLateToLeave',{
      empId,empName,
      lateCount:stat.late||0,
      totalMinutes:stat.totalMinutes||0,
      lateMinutes:stat.lateMinutes||0,
      earlyMinutes:stat.earlyMinutes||0,
      gender:staffInfo.gender||'',position:staffInfo.position||'',location:staffInfo.location||'Phnom Penh'
    });
    if(res&&res.result==='success'){toast(`${days} day(s) deducted — Req ${res.requestId}`,'ok2');hrLoadData();}
    else{toast(res&&res.error||'Convert failed','bad');}
  }catch(e){toast('Error: '+e,'bad');}
}

let allStaffList=[];
let noticeStats=[],noticesList=[];
// ── ANALYTICS FILTER STATE ─────────────────────────────────────
let anFilter={period:'year',year:new Date().getFullYear(),month:'',staff:''};
let anStaffSort='used'; // 'used' = most leave on top, 'name' = alphabetical
function anSaveFilters(){cacheSet('hr_anfilter',anFilter);}
function anRestoreFilters(){const f=cacheGet('hr_anfilter');if(f)anFilter={...anFilter,...f};}
function anApplyFilters(){
  if(!document.getElementById('hr-tab-analytics'))return;
  anRestoreFilters();
  // Update UI to match state
  const pSel=document.getElementById('an-period');
  const ySel=document.getElementById('an-year');
  const mSel=document.getElementById('an-month');
  const sSel=document.getElementById('an-staff');
  if(pSel)pSel.value=anFilter.period;
  // Populate year dropdown
  if(ySel){
    const years=[...new Set(allReqs.map(r=>{const d=new Date(r.from);return isNaN(d)?null:d.getFullYear();}).filter(Boolean))].sort((a,b)=>b-a);
    const curY=new Date().getFullYear();
    if(!years.includes(curY))years.unshift(curY);
    ySel.innerHTML=years.map(y=>`<option value="${y}">${y}</option>`).join('');
    if(anFilter.year)ySel.value=anFilter.year;
  }
  // Populate month
  if(mSel&&anFilter.month)mSel.value=anFilter.month;
  // Populate staff
  if(sSel){
    const names=[...new Set(allReqs.map(r=>r.empName||r.empId).filter(Boolean))].sort();
    sSel.innerHTML='<option value="">All Staff</option>'+names.map(n=>`<option value="${n}">${n}</option>`).join('');
    if(anFilter.staff)sSel.value=anFilter.staff;
  }
  anShowHideControls();
  hrRenderAnalytics();
}
function anShowHideControls(){
  const p=anFilter.period;
  const yRow=document.getElementById('an-year-row');
  const mRow=document.getElementById('an-month-row');
  if(yRow)yRow.style.display=(p==='year'||p==='month')?'flex':'none';
  if(mRow)mRow.style.display=(p==='month')?'flex':'none';
}
function anChangePeriod(v){anFilter.period=v;anFilter.month='';anSaveFilters();anShowHideControls();hrRenderAnalytics();}
function anChangeYear(v){anFilter.year=parseInt(v);anSaveFilters();hrRenderAnalytics();}
function anChangeMonth(v){anFilter.month=v;anSaveFilters();hrRenderAnalytics();}
function anChangeStaff(v){anFilter.staff=v;anSaveFilters();hrRenderAnalytics();}
function anFilterReqs(){
  let reqs=allReqs;
  const p=anFilter.period;
  if(p==='year'||p==='month'){
    reqs=reqs.filter(r=>{
      if(!r.from)return false;
      const d=new Date(r.from);
      if(isNaN(d))return false;
      if(d.getFullYear()!==parseInt(anFilter.year))return false;
      if(p==='month'&&anFilter.month&&(d.getMonth()+1)!==parseInt(anFilter.month))return false;
      return true;
    });
  }
  if(anFilter.staff)reqs=reqs.filter(r=>(r.empName||r.empId)===anFilter.staff);
  return reqs;
}
async function hrLoadNotices(){
  // Data already loaded by hrLoadData — just render
  hrRenderAnalytics();
}
function hrRenderStaff(){
  const tbody=document.getElementById('hr-stbody');
  if(!tbody)return;
  if(!allStaffList.length){
    tbody.innerHTML='<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--txt3)">No staff data found.</td></tr>';
    return;
  }
  tbody.innerHTML=allStaffList.map(s=>{
    const rem=(s.annualDays||0)-(s.usedDays||0);
    return`<tr><td style="font-size:10px;color:var(--txt3);font-family:monospace">${s.empId}</td><td style="font-weight:500">${s.name}</td><td style="color:var(--txt2)">${s.position}</td><td style="text-align:center">${s.annualDays}</td><td style="text-align:center;color:var(--warn)">${s.usedDays}</td><td style="text-align:center;color:${rem>5?'var(--ok)':rem>0?'var(--warn)':'var(--red)'};font-weight:600">${rem}</td></tr>`;
  }).join('');
}
function hrTab(tab){sessionStorage.setItem('hr_tab',tab);
  ['req','staff','attendance','analytics','export','manual'].forEach(t=>{
    const el=document.getElementById('hr-tab-'+t);if(el)el.style.display=tab===t?'block':'none';
    const btn=document.getElementById('nt-'+t);if(btn)btn.classList.toggle('on',tab===t);
  });
  if(tab==='export')expInit();
  if(tab==='analytics'){hrLoadNotices();anApplyFilters();loadLateThreshold();}
  if(tab==='staff')hrRenderStaff();
  if(tab==='manual')hrManualInit();
}
// ══════════════════ EXPORT ══════════════════════
function expInit(){
  // Populate year dropdown from allReqs
  const years=[...new Set(allReqs.map(r=>{
    const d=r.from||r.dateFrom||'';
    return d?new Date(d).getFullYear():null;
  }).filter(Boolean))].sort((a,b)=>b-a);
  const yrSel=document.getElementById('exp-year');
  const curYr=yrSel.value;
  yrSel.innerHTML='<option value="">All Years</option>'+years.map(y=>`<option value="${y}"${y==curYr?'selected':''}>${y}</option>`).join('');
  // Populate staff dropdown
  const staffMap={};
  allReqs.forEach(r=>{if(r.empId)staffMap[r.empId]=r.empName||r.empId;});
  const stSel=document.getElementById('exp-staff');
  const curSt=stSel.value;
  stSel.innerHTML='<option value="">All Staff</option>'+Object.entries(staffMap).map(([id,name])=>`<option value="${id}"${id===curSt?'selected':''}>${name} (${id})</option>`).join('');
  expPreview();
}

function expFiltered(){
  const yr=document.getElementById('exp-year').value;
  const mo=document.getElementById('exp-month').value;
  const st=document.getElementById('exp-staff').value;
  return allReqs.filter(r=>{
    const d=new Date(r.from||r.dateFrom||'');
    if(yr&&d.getFullYear()!=yr)return false;
    if(mo&&(d.getMonth()+1)!=mo)return false;
    if(st&&r.empId!==st)return false;
    return true;
  });
}

function expPreview(){
  const data=expFiltered();
  const tbody=document.getElementById('exp-tbody');
  const nodata=document.getElementById('exp-nodata');
  tbody.innerHTML='';
  nodata.style.display=data.length?'none':'block';
  data.forEach(r=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td style="font-size:10px;color:var(--txt3);font-family:monospace">${r.id||'—'}</td>
      <td style="font-weight:500">${r.empName||r.empId||'—'}</td>
      <td style="color:var(--txt2)">${r.position||'—'}</td>
      <td>${r.type||r.leaveType||'—'}</td>
      <td>${fmtDate(r.from||r.dateFrom)}</td>
      <td>${fmtDate(r.to||r.dateTo)}</td>
      <td style="text-align:center;font-weight:600">${r.days||r.workingDays||'—'}</td>
      <td style="color:var(--txt2);max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.reason||'—'}</td>
      <td><span class="badge b-${(r.status||'').toLowerCase()}">${r.status||'—'}</span></td>
      <td style="color:var(--txt3)">${r.submitted||r.submissionDate||'—'}</td>`;
    tbody.appendChild(tr);
  });
  const total=data.reduce((s,r)=>s+(Number(r.days||r.workingDays)||0),0);
  document.getElementById('exp-summary').textContent=
    data.length+' record'+(data.length===1?'':'s')+' · '+total+' day'+(total===1?'':'s')+' total';
}

function expNoticesFiltered(){
  const yr=document.getElementById('exp-year').value;
  const st=document.getElementById('exp-staff').value;
  return noticesList.filter(n=>{
    if(yr){const d=new Date(n.date);if(isNaN(d)||d.getFullYear()!=yr)return false;}
    if(st&&n.empId!==st)return false;
    return true;
  });
}
function expDownload(){
  const leaveData=expFiltered();
  const noticeData=expNoticesFiltered();
  if(!leaveData.length&&!noticeData.length){toast('No data to export','bad');return;}
  const yr=document.getElementById('exp-year').value||'All';
  const mo=document.getElementById('exp-month').value;
  const moName=mo?['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][mo-1]:'All';
  const st=document.getElementById('exp-staff').value||'All';
  const wb=XLSX.utils.book_new();
  // Sheet 1 — Leave Requests
  const leaveHeaders=['Req ID','Employee ID','Full Name','Position','Leave Type','From','To','Working Days','Reason','Status','Submitted','Location'];
  const leaveRows=leaveData.map(r=>[
    r.id||'',r.empId||'',r.empName||'',r.position||'',
    r.type||r.leaveType||'',
    fmtDate(r.from||r.dateFrom),fmtDate(r.to||r.dateTo),
    r.days||r.workingDays||'',r.reason||'',r.status||'',
    r.submitted||r.submissionDate||'',r.submittedFrom||'Phnom Penh'
  ]);
  const ws1=XLSX.utils.aoa_to_sheet([leaveHeaders,...leaveRows]);
  XLSX.utils.book_append_sheet(wb,ws1,'Leave Requests');
  // Sheet 2 — Late & Early Notices
  const noticeHeaders=['Employee ID','Full Name','Type','Date','Time','Return Time','Reason'];
  const noticeRows=noticeData.map(n=>[
    n.empId||'',n.name||'',n.type||'',n.date||'',n.time||'',n.returnTime||'',n.reason||''
  ]);
  const ws2=XLSX.utils.aoa_to_sheet([noticeHeaders,...noticeRows]);
  XLSX.utils.book_append_sheet(wb,ws2,'Late & Early Notices');
  XLSX.writeFile(wb,`LocktonIBS_Leave_${yr}_${moName}_${st}.xlsx`,{bookType:'xlsx',compression:true});
  toast('XLSX downloaded','ok2');
}

// ══════════════════ RE-AUTH ══════════════════════════════════
let _reauthResolve=null;
function requireReauth(msg){
  return new Promise(resolve=>{
    _reauthResolve=resolve;
    document.getElementById('reauth-msg').textContent=msg||'Re-enter your password to continue.';
    document.getElementById('reauth-pass').value='';
    document.getElementById('reauth-err').textContent='';
    const m=document.getElementById('reauth-modal');
    m.style.display='flex';
    setTimeout(()=>document.getElementById('reauth-pass').focus(),50);
  });
}
function cancelReauth(){
  document.getElementById('reauth-modal').style.display='none';
  if(_reauthResolve){_reauthResolve(null);_reauthResolve=null;}
}
function submitReauth(){
  const pass=document.getElementById('reauth-pass').value.trim();
  if(!pass){document.getElementById('reauth-err').textContent='Please enter your password.';return;}
  document.getElementById('reauth-modal').style.display='none';
  if(_reauthResolve){_reauthResolve(pass);_reauthResolve=null;}
}

// ══════════════════ SYNC / REFRESH ══════════════════════════════
function toggleAnStaffSort(){
  anStaffSort=anStaffSort==='used'?'name':'used';
  const btn=document.getElementById('an-sort-btn');
  if(btn)btn.textContent=anStaffSort==='used'?'Sort: Most Leave ↓':'Sort: Name A–Z ↑';
  hrRenderSummary();
}
function syncNow(){
  const btn=document.getElementById('sync-btn');
  if(btn)btn.classList.add('spinning');
  toast('Syncing...','');
  if(hrUser){hrLoadData();}
  if(stStaff){stRefreshAll();}
  setTimeout(()=>{if(btn)btn.classList.remove('spinning');toast('Up to date','ok2');},1500);
}
async function stRefreshHistory(){
  try{
    const res=isMock()?mockHist(stStaff.empId):await apiPost('getHistory',{empId:stStaff.empId,fullName:stStaff.name});
    if(res.result==='success'){stHistory=res.history||[];renderStDash();}
  }catch(e){}
}

// ══════════════════ LATE / EARLY NOTICE ════════════════════════
document.querySelectorAll('input[name=noticetype]').forEach(r=>{
  r.addEventListener('click',()=>{
    const lbl=document.getElementById('nt-time-lbl');
    if(lbl)lbl.textContent=r.value==='late'?'Arrival Time':'Departure Time';
  });
});

async function submitNotice(){
  const name=document.getElementById('nt-name').value.trim();
  const empid=document.getElementById('nt-empid').value.trim();
  const time=ntGetTime('nt-time');
  const returnTime=ntGetTime('nt-return');
  const reason=document.getElementById('nt-reason').value.trim();
  const type=document.querySelector('input[name=noticetype]:checked').value;
  const fb=document.getElementById('nt-fb');
  const missing=[];
  if(!name)missing.push('Full Name');
  if(!empid)missing.push('Employee ID');
  if(!time)missing.push(type==='late'?'Arrival Time':'Departure Time');
  if(!reason)missing.push('Reason');
  if(missing.length){fb.textContent='Please fill in: '+missing.join(', ');fb.className='idfb err';return;}
  fb.textContent='';
  const btn=document.getElementById('nt-btn'),sp=document.getElementById('nt-sp');
  btn.disabled=true;sp.style.display='block';
  try{
    const payload={
      noticeType:type,name,empId:empid,time,returnTime:returnTime||'—',reason,
      noticeDate:new Date().toLocaleDateString('en-GB')
    };
    const res=await apiPost('sendNotice',payload);
    if(res.result==='success'||isMock()){
      toast('Notice sent!','ok2');
      document.getElementById('nt-name').value='';
      document.getElementById('nt-empid').value='';
      ['nt-time-hh','nt-time-mm','nt-return-hh','nt-return-mm'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
      ['nt-time-am','nt-return-am'].forEach(id=>{const e=document.getElementById(id);if(e)e.classList.add('on');});
      ['nt-time-pm','nt-return-pm'].forEach(id=>{const e=document.getElementById(id);if(e)e.classList.remove('on');});
      document.getElementById('nt-reason').value='';
      setTimeout(()=>goTo('home'),1200);
    } else {
      fb.textContent='Failed to send. Please try again.';fb.className='idfb err';
    }
  }catch(e){fb.textContent='Error sending notice.';fb.className='idfb err';}
  finally{btn.disabled=false;sp.style.display='none';}
}

// ══════════════════ NOTICE (LATE/EARLY) ══════════════════════
let ntStaff=null;
let _ntCurrentType=null; // 'late' | 'early'

// ── iOS Drum Picker ───────────────────────────────────────────
const DRUM_IH=42; // item height px
const DRUM_PAD=DRUM_IH*2; // 2-item padding spacer at top/bottom

function _ntBuildDrumCol(col,items){
  const pad=`<div style="height:${DRUM_PAD}px"></div>`;
  col.innerHTML=pad+items.map((it,i)=>`<div class="drum-item" data-v="${it.v}" data-i="${i}">${it.label}</div>`).join('')+pad;
  col.addEventListener('scroll',()=>_ntDrumHighlight(col),{passive:true});
  _ntDrumHighlight(col);
}
function _ntDrumHighlight(col){
  const idx=Math.round(col.scrollTop/DRUM_IH);
  col.querySelectorAll('.drum-item').forEach((el,i)=>el.classList.toggle('drum-sel',i===idx));
  // Sync manual inputs on HH/MM columns
  if(col.id==='drum-hh'||col.id==='drum-mm'||col.id==='drum-ap'){
    const v=_ntDrumGet(col);
    if(col.id==='drum-hh'){const e=document.getElementById('nt-m-hh');if(e)e.value=v;}
    if(col.id==='drum-mm'){const e=document.getElementById('nt-m-mm');if(e)e.value=v;}
    if(col.id==='drum-ap'){
      document.getElementById('nt-m-am')?.classList.toggle('on',v==='AM');
      document.getElementById('nt-m-pm')?.classList.toggle('on',v==='PM');
    }
  }
}
function _ntDrumGet(col){
  const idx=Math.round(col.scrollTop/DRUM_IH);
  return col.querySelectorAll('.drum-item')[idx]?.dataset.v||'';
}
function _ntDrumSet(col,val){
  const items=col.querySelectorAll('.drum-item');
  const idx=Array.from(items).findIndex(x=>x.dataset.v===val);
  if(idx>=0){col.scrollTop=idx*DRUM_IH;}
}
function ntInitDrum(){
  const hhCol=document.getElementById('drum-hh');
  const mmCol=document.getElementById('drum-mm');
  const apCol=document.getElementById('drum-ap');
  _ntBuildDrumCol(hhCol,Array.from({length:12},(_,i)=>{const v=String(i+1).padStart(2,'0');return{v,label:v};}));
  _ntBuildDrumCol(mmCol,Array.from({length:60},(_,i)=>{const v=String(i).padStart(2,'0');return{v,label:v};}));
  _ntBuildDrumCol(apCol,[{v:'AM',label:'AM'},{v:'PM',label:'PM'}]);
  // Auto-set to current time with auto AM/PM
  const now=new Date();
  const h=now.getHours(),m=now.getMinutes();
  const isAM=h<12;
  const dispH=h%12||12;
  setTimeout(()=>{
    _ntDrumSet(hhCol,String(dispH).padStart(2,'0'));
    _ntDrumSet(mmCol,String(m).padStart(2,'0'));
    _ntDrumSet(apCol,isAM?'AM':'PM');
    _ntDrumHighlight(hhCol);_ntDrumHighlight(mmCol);_ntDrumHighlight(apCol);
    // Sync manual fields
    const mhh=document.getElementById('nt-m-hh');
    const mmm=document.getElementById('nt-m-mm');
    if(mhh)mhh.value=String(dispH).padStart(2,'0');
    if(mmm)mmm.value=String(m).padStart(2,'0');
    document.getElementById('nt-m-am')?.classList.toggle('on',isAM);
    document.getElementById('nt-m-pm')?.classList.toggle('on',!isAM);
  },50);
}
function ntGetDrumTime(){
  const hhCol=document.getElementById('drum-hh');
  const mmCol=document.getElementById('drum-mm');
  const apCol=document.getElementById('drum-ap');
  const hh=_ntDrumGet(hhCol)||document.getElementById('nt-m-hh')?.value.trim()||'';
  const mm=_ntDrumGet(mmCol)||document.getElementById('nt-m-mm')?.value.trim()||'';
  const ap=_ntDrumGet(apCol)||(document.getElementById('nt-m-am')?.classList.contains('on')?'AM':'PM');
  if(!hh||!mm)return '';
  return String(parseInt(hh,10)).padStart(2,'0')+':'+String(parseInt(mm,10)).padStart(2,'0')+' '+ap;
}
function ntManualToScroll(){
  const hhCol=document.getElementById('drum-hh');
  const mmCol=document.getElementById('drum-mm');
  const hh=(document.getElementById('nt-m-hh')?.value||'').trim().padStart(2,'0');
  const mm=(document.getElementById('nt-m-mm')?.value||'').trim().padStart(2,'0');
  const hv=parseInt(hh,10),mv=parseInt(mm,10);
  if(!isNaN(hv)&&hv>=1&&hv<=12)_ntDrumSet(hhCol,String(hv).padStart(2,'0'));
  if(!isNaN(mv)&&mv>=0&&mv<=59)_ntDrumSet(mmCol,String(mv).padStart(2,'0'));
}
function ntManualAmPm(val){
  const apCol=document.getElementById('drum-ap');
  _ntDrumSet(apCol,val);
  document.getElementById('nt-m-am')?.classList.toggle('on',val==='AM');
  document.getElementById('nt-m-pm')?.classList.toggle('on',val==='PM');
}
function ntOpenPicker(type){
  _ntCurrentType=type;
  // Set time label based on type
  const lbl=document.getElementById('nt-fs-time-lbl');
  if(lbl)lbl.textContent=type==='late'?'Arrives at':'Leaving at';
  // Populate staff info in form
  const fsName=document.getElementById('nt-fs-name');
  const fsId=document.getElementById('nt-fs-id');
  if(fsName&&ntStaff)fsName.textContent=ntStaff.name;
  if(fsId&&ntStaff)fsId.textContent=ntStaff.empId;
  // Pre-set current time
  const now=new Date();
  const h=now.getHours(),m=now.getMinutes();
  const isAM=h<12;
  const dispH=h%12||12;
  const hhEl=document.getElementById('nt-fs-hh');
  const mmEl=document.getElementById('nt-fs-mm');
  if(hhEl)hhEl.textContent=String(dispH).padStart(2,'0');
  if(mmEl)mmEl.textContent=String(m).padStart(2,'0');
  ntFsAmPm(isAM?'AM':'PM');
  // Clear reason
  const reason=document.getElementById('nt-fs-reason');
  if(reason)reason.value='';
  // Transition to form screen
  document.getElementById('nt-type-select').style.display='none';
  document.getElementById('nt-form-screen').style.display='block';
}
function ntClosePicker(){
  // kept for compatibility; new flow uses ntBackToTypeSelect()
  document.getElementById('nt-form-screen').style.display='none';
  document.getElementById('nt-type-select').style.display='none';
  document.getElementById('nt-card-late')?.classList.remove('nt-card-active');
  document.getElementById('nt-card-early')?.classList.remove('nt-card-active');
}
function ntTBInput(el,min,max,nextId){
  el.value=el.value.replace(/\D/g,'');
  if(el.value.length===2){
    let v=parseInt(el.value,10);
    if(v<min)el.value=String(min).padStart(2,'0');
    else if(v>max)el.value=String(max).padStart(2,'0');
    if(nextId){const n=document.getElementById(nextId);if(n){n.focus();n.select();}}
  }
}
function ntTBKey(e,prevId,nextId){
  if(e.key==='ArrowUp'||e.key==='ArrowDown'){
    e.preventDefault();
    const el=e.target;
    const isHH=el.id.endsWith('-hh');
    const min=isHH?1:0,max=isHH?12:59;
    let v=parseInt(el.value||'0',10);
    v=e.key==='ArrowUp'?Math.min(max,v+1):Math.max(min,v-1);
    el.value=String(v).padStart(2,'0');
  }
  if(e.key==='Backspace'&&e.target.value===''&&prevId){
    const p=document.getElementById(prevId);if(p){p.focus();p.select();}
  }
}
function ntSetAmPm(prefix,val){
  const am=document.getElementById(prefix+'-am');
  const pm=document.getElementById(prefix+'-pm');
  if(am&&pm){am.classList.toggle('on',val==='AM');pm.classList.toggle('on',val==='PM');}
}
function ntGetTime(prefix){
  const hh=document.getElementById(prefix+'-hh');
  const mm=document.getElementById(prefix+'-mm');
  const amBtn=document.getElementById(prefix+'-am');
  if(!hh||!mm)return '';
  const h=hh.value.trim(),m=mm.value.trim();
  if(!h||!m)return '';
  const hNum=parseInt(h,10),mNum=parseInt(m,10);
  if(isNaN(hNum)||isNaN(mNum))return '';
  const ampm=amBtn&&amBtn.classList.contains('on')?'AM':'PM';
  return String(hNum).padStart(2,'0')+':'+String(mNum).padStart(2,'0')+' '+ampm;
}
function ntReset(){
  ntStaff=null;_ntCurrentType=null;
  document.getElementById('nt-gate').style.display='block';
  document.getElementById('nt-type-select').style.display='none';
  document.getElementById('nt-form-screen').style.display='none';
  document.getElementById('nt-success').style.display='none';
  document.getElementById('nt-name-input').value='';
  document.getElementById('nt-id-input').value='';
  document.getElementById('nt-idfb').textContent='';
  document.getElementById('nt-card-late')?.classList.remove('nt-card-active');
  document.getElementById('nt-card-early')?.classList.remove('nt-card-active');
}
function ntBackToGate(){
  document.getElementById('nt-type-select').style.display='none';
  document.getElementById('nt-form-screen').style.display='none';
  document.getElementById('nt-gate').style.display='block';
}
function ntBackToTypeSelect(){
  _ntCurrentType=null;
  document.getElementById('nt-form-screen').style.display='none';
  document.getElementById('nt-type-select').style.display='block';
  document.getElementById('nt-card-late')?.classList.remove('nt-card-active');
  document.getElementById('nt-card-early')?.classList.remove('nt-card-active');
}
function ntFsAmPm(val){
  document.getElementById('nt-fs-am')?.classList.toggle('on',val==='AM');
  document.getElementById('nt-fs-pm')?.classList.toggle('on',val==='PM');
}
// ── Numpad ────────────────────────────────────────────────────
let _ntNumpadField=null;
let _ntNumpadValue='';
function ntNumpadOpen(field){
  _ntNumpadField=field;
  _ntNumpadValue='';
  const lbl=document.getElementById('nt-numpad-label');
  if(lbl)lbl.textContent=field==='hh'?'Hour':'Minute';
  const disp=document.getElementById('nt-numpad-display');
  if(disp)disp.textContent='--';
  const overlay=document.getElementById('nt-numpad-overlay');
  if(overlay){overlay.style.display='flex';overlay.style.alignItems='flex-end';overlay.style.justifyContent='center';}
}
function ntNumpadKey(digit){
  if(_ntNumpadValue.length>=2)return;
  _ntNumpadValue+=digit;
  const disp=document.getElementById('nt-numpad-display');
  if(disp)disp.textContent=_ntNumpadValue.length===1?'0'+_ntNumpadValue:_ntNumpadValue;
}
function ntNumpadBackspace(){
  _ntNumpadValue=_ntNumpadValue.slice(0,-1);
  const disp=document.getElementById('nt-numpad-display');
  if(disp)disp.textContent=_ntNumpadValue?(_ntNumpadValue.length===1?'0'+_ntNumpadValue:_ntNumpadValue):'--';
}
function ntNumpadClear(){
  _ntNumpadValue='';
  const disp=document.getElementById('nt-numpad-display');
  if(disp)disp.textContent='--';
}
function ntNumpadConfirm(){
  if(!_ntNumpadValue){ntNumpadClose();return;}
  const v=parseInt(_ntNumpadValue,10);
  if(_ntNumpadField==='hh'){
    if(v<1||v>12){toast('Hour must be 1–12','bad');return;}
    const el=document.getElementById('nt-fs-hh');
    if(el)el.textContent=String(v).padStart(2,'0');
  } else {
    if(v<0||v>59){toast('Minute must be 0–59','bad');return;}
    const el=document.getElementById('nt-fs-mm');
    if(el)el.textContent=String(v).padStart(2,'0');
  }
  ntNumpadClose();
}
function ntNumpadClose(){
  const overlay=document.getElementById('nt-numpad-overlay');
  if(overlay)overlay.style.display='none';
  _ntNumpadField=null;_ntNumpadValue='';
}
async function ntVerify(){
  const name=document.getElementById('nt-name-input').value.trim();
  const id=document.getElementById('nt-id-input').value.trim().toUpperCase();
  const fb=document.getElementById('nt-idfb');
  if(!name){fb.textContent='Please enter your Full Name.';fb.className='idfb err';gateSetError('nt-gate');return;}
  if(!id){fb.textContent='Please enter your Staff ID.';fb.className='idfb err';gateSetError('nt-gate');return;}
  const btn=document.getElementById('nt-gate-btn'),sp=document.getElementById('nt-gate-sp');
  gateSetLoading('nt-gate','nt-gate-btn',true);sp.style.display='block';
  const _gmo=_gmoStart('nt-gate');
  try{
    const res=await apiPost('getStaff',{empId:id,fullName:name});
    if(res.result==='success'){
      _gmo.cancel(true);
      ntStaff=res.staff;ntStaff.empId=id;
      document.getElementById('nt-gate').style.display='none';
      document.getElementById('nt-type-select').style.display='block';
    } else {_gmo.cancel(false);fb.textContent='Name or ID not found.';fb.className='idfb err';setTimeout(()=>gateSetError('nt-gate'),210);}
  }catch(e){_gmo.cancel(false);toast('Error','bad');}finally{gateSetLoading('nt-gate','nt-gate-btn',false);sp.style.display='none';}
}
async function ntSubmit(){
  const hhEl=document.getElementById('nt-fs-hh');
  const mmEl=document.getElementById('nt-fs-mm');
  const hh=hhEl?.textContent?.trim();
  const mm=mmEl?.textContent?.trim();
  const isAM=document.getElementById('nt-fs-am')?.classList.contains('on');
  const ap=isAM?'AM':'PM';
  const time=(hh&&mm&&hh!=='--'&&mm!=='--')?`${hh}:${mm} ${ap}`:'';
  const reason=document.getElementById('nt-fs-reason').value.trim();
  if(!time){toast('Please select a time','bad');return;}
  if(!reason){toast('Please enter a reason','bad');return;}
  const btn=document.getElementById('nt-submit-btn'),sp=document.getElementById('nt-submit-sp');
  btn.disabled=true;sp.style.display='block';
  try{
    if(!isMock()){
      const res=await apiPost('sendNotice',{
        noticeType:_ntCurrentType,
        name:ntStaff.name,empId:ntStaff.empId,
        time,returnTime:'—',reason,
        noticeDate:new Date().toLocaleDateString('en-GB')
      });
      if(res.result!=='success')throw new Error('failed');
    }
    document.getElementById('nt-form-screen').style.display='none';
    document.getElementById('nt-success').style.display='flex';
  }catch(e){toast('Failed to send. Try again.','bad');}finally{btn.disabled=false;sp.style.display='none';}
}

// ══════════════════ SYNC/REFRESH ══════════════════════════════
function syncRefresh(){
  const icon=document.getElementById('sync-icon');
  if(icon)icon.style.animation='spin .7s linear infinite';
  setTimeout(()=>{
    if(icon)icon.style.animation='';
    toast('Synced','ok2');
  },1200);
  // Force reload data if HR is logged in
  if(hrUser&&hrToken){hrLoadData();}
}

// ══════════════════ ATTENDANCE ══════════════════════════════════
const WORK_START_MINS  = 8*60+30;  // 08:30
const EARLY_THRESH_MINS= 8*60+20;  // 08:20 — 10 min early threshold
const WORK_END_MINS    = 17*60+30; // 17:30

function _attnToMins(t){
  if(!t)return null;
  const p=String(t).trim().split(':');
  if(p.length<2)return null;
  const h=parseInt(p[0]),m=parseInt(p[1]);
  return(isNaN(h)||isNaN(m))?null:h*60+m;
}
function attnArrivalStatus(checkIn){
  const m=_attnToMins(checkIn);
  if(m===null)return'Absent';
  if(m<EARLY_THRESH_MINS)return'Early';
  if(m<=WORK_START_MINS)return'On Time';
  return'Late';
}
function attnDepartureStatus(checkOut){
  const m=_attnToMins(checkOut);
  if(m===null)return'No Record';
  return m<WORK_END_MINS?'Leave Early':'Normal';
}

// ── Template download ────────────────────────────────────────────
function attnDownloadTemplate(){
  const wb=XLSX.utils.book_new();
  const headers=['Employee ID','Full Name','Date','Check In','Check Out','Note'];
  const ws=XLSX.utils.aoa_to_sheet([headers]);
  ws['!cols']=[{wch:14},{wch:22},{wch:14},{wch:14},{wch:14},{wch:28}];
  XLSX.utils.book_append_sheet(wb,ws,'Attendance');
  XLSX.writeFile(wb,'Attendance_Template.xlsx',{bookType:'xlsx',compression:true});
  toast('Template downloaded','ok2');
}

// ── Upload & parse ───────────────────────────────────────────────
let _attnRecords=[];
function attnHandleUpload(input){
  const file=input.files[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=function(e){
    try{
      const wb=XLSX.read(e.target.result,{type:'array'});
      const ws=wb.Sheets[wb.SheetNames[0]];
      const rows=XLSX.utils.sheet_to_json(ws,{header:1,defval:''});
      if(rows.length<2){toast('File is empty or invalid','bad');return;}
      const hdr=rows[0].map(h=>String(h).trim().toLowerCase());
      const iId  =hdr.findIndex(h=>h.includes('employee')||h==='id');
      const iName=hdr.findIndex(h=>h.includes('name'));
      const iDate=hdr.findIndex(h=>h.includes('date'));
      const iIn  =hdr.findIndex(h=>h.includes('check in'));
      const iOut =hdr.findIndex(h=>h.includes('check out'));
      const iNote=hdr.findIndex(h=>h.includes('note'));
      if(iId<0||iDate<0){toast('Invalid file — missing Employee ID or Date column','bad');return;}
      const records=[];
      for(let i=1;i<rows.length;i++){
        const r=rows[i];
        const empId=String(r[iId]||'').trim();
        let date=String(r[iDate]||'').trim();
        if(!empId||empId.startsWith('[')||!date||date.startsWith('['))continue;
        // Normalise: if YYYY-MM-DD convert to DD-MM-YYYY for display
        if(/^\d{4}-\d{2}-\d{2}$/.test(date)){const p=date.split('-');date=p[2]+'-'+p[1]+'-'+p[0];}
        // Also handle Excel serial date numbers
        if(/^\d{5}$/.test(date)){const d=new Date(Math.round((Number(date)-25569)*86400*1000));date=String(d.getDate()).padStart(2,'0')+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+d.getFullYear();}
        const checkIn =String(iIn >=0?r[iIn] ||'':'').trim();
        const checkOut=String(iOut>=0?r[iOut]||'':'').trim();
        records.push({
          empId,
          name:String(iName>=0?r[iName]||'':'').trim(),
          date,
          checkIn,
          checkOut,
          arrivalStatus  :attnArrivalStatus(checkIn),
          departureStatus:attnDepartureStatus(checkOut),
          note:String(iNote>=0?r[iNote]||'':'').trim()
        });
      }
      if(!records.length){toast('No valid data rows found','bad');return;}
      _attnRecords=records;
      attnRenderTable();
      document.getElementById('attn-preview-section').style.display='block';
      toast(records.length+' records loaded — review then click Import','ok2');
    }catch(ex){toast('Failed to read file: '+ex.message,'bad');}
  };
  reader.readAsArrayBuffer(file);
  input.value='';
}

// ── Render preview table ─────────────────────────────────────────
const _ATTN_ARR_BADGE={
  'Early'      :'<span class="attn-badge attn-early">Early</span>',
  'On Time'    :'<span class="attn-badge attn-ontime">On Time</span>',
  'Late'       :'<span class="attn-badge attn-late">Late</span>',
  'Absent'     :'<span class="attn-badge attn-absent">Absent</span>'
};
const _ATTN_DEP_BADGE={
  'Normal'     :'<span class="attn-badge attn-normal">Normal</span>',
  'Leave Early':'<span class="attn-badge attn-leavearly">Leave Early</span>',
  'No Record'  :'<span class="attn-badge attn-norecord">No Record</span>'
};
function attnRenderTable(){
  const tbody =document.getElementById('attn-tbody');
  const nodata=document.getElementById('attn-nodata');
  if(!_attnRecords.length){tbody.innerHTML='';nodata.style.display='block';return;}
  nodata.style.display='none';
  tbody.innerHTML=_attnRecords.map(r=>`<tr>
    <td style="white-space:nowrap">${r.date}</td>
    <td><div style="font-weight:500">${r.name||'—'}</div><div style="font-size:11px;color:var(--txt3)">${r.empId}</div></td>
    <td style="text-align:center">${r.checkIn||'—'}</td>
    <td>${_ATTN_ARR_BADGE[r.arrivalStatus]||r.arrivalStatus}</td>
    <td style="text-align:center">${r.checkOut||'—'}</td>
    <td>${_ATTN_DEP_BADGE[r.departureStatus]||r.departureStatus}</td>
    <td style="font-size:12px;color:var(--txt3)">${r.note||'—'}</td>
  </tr>`).join('');
}

// ── Import to Google Sheets ──────────────────────────────────────
async function attnImport(){
  if(!_attnRecords.length){toast('No records to import','bad');return;}
  const btn=document.getElementById('attn-import-btn');
  btn.disabled=true;btn.innerHTML='Importing…';
  try{
    const res=await apiPost('importAttendance',{records:_attnRecords,token:hrToken||''});
    if(res.result==='success'){
      toast(res.imported+' records saved to Google Sheets','ok2');
      _attnRecords=[];
      attnRenderTable();
      document.getElementById('attn-preview-section').style.display='none';
    }else{
      toast('Import failed: '+(res.error||'Unknown error'),'bad');
    }
  }catch(e){toast('Connection error','bad');}
  finally{
    btn.disabled=false;
    btn.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Import to Google Sheets';
  }
}

// ── MANUAL ENTRY ─────────────────────────────────────────────────
let _manualStaff=null;
function hrManualInit(){
  _manualStaff=null;
  ['me-result','me-type-sel','me-form-leave','me-form-notice'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display='none';});
  const eid=document.getElementById('me-empid');if(eid)eid.value='';
}
function meShowSection(section){
  document.getElementById('me-form-leave').style.display=section==='leave'?'block':'none';
  document.getElementById('me-form-notice').style.display=section==='notice'?'block':'none';
  // highlight active button
  const bl=document.getElementById('me-btn-leave'),bn=document.getElementById('me-btn-notice');
  if(bl){bl.style.background=section==='leave'?'var(--red)':'var(--surface2)';bl.style.color=section==='leave'?'#fff':'var(--txt2)';bl.style.borderColor=section==='leave'?'var(--red)':'var(--border)';}
  if(bn){bn.style.background=section==='notice'?'var(--red)':'var(--surface2)';bn.style.color=section==='notice'?'#fff':'var(--txt2)';bn.style.borderColor=section==='notice'?'var(--red)':'var(--border)';}
}
function meToggleReturn(){
  const type=document.getElementById('me-ntype').value;
  const lbl=document.getElementById('me-ntime-lbl');
  const retRow=document.getElementById('me-return-row');
  if(lbl)lbl.textContent=type==='late'?'Arrival Time':'Departure Time';
  if(retRow)retRow.style.display=type==='late'?'block':'none';
}
async function hrManualLookup(){
  const eid=document.getElementById('me-empid').value.trim();
  if(!eid){toast('Enter Employee ID','bad');return;}
  const res=await apiHR('getStaffList',{});
  if(!res||!res.staff){toast('Failed to load staff','bad');return;}
  const s=res.staff.find(x=>String(x.empId).trim()===eid);
  if(!s){toast('Employee not found','bad');return;}
  _manualStaff=s;
  document.getElementById('me-name').textContent=s.name;
  document.getElementById('me-pos').textContent=s.position;
  document.getElementById('me-result').style.display='block';
  document.getElementById('me-type-sel').style.display='block';
  // reset forms
  document.getElementById('me-form-leave').style.display='none';
  document.getElementById('me-form-notice').style.display='none';
  // reset leave form fields
  ['me-from','me-to','me-reason'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('me-days').value='1';
  // reset notice form fields
  document.getElementById('me-ndate').value=todayFmt();
  document.getElementById('me-ntime').value='';
  document.getElementById('me-nreturn').value='';
  document.getElementById('me-nreason').value='';
  meToggleReturn();
  meShowSection('leave'); // default to leave tab
}
function meCalcDays(){
  const f=document.getElementById('me-from').value,t=document.getElementById('me-to').value;
  if(f&&t&&t>=f){
    let n=0,c=new Date(f+'T00:00:00'),e=new Date(t+'T00:00:00');
    while(c<=e){const d=c.getDay();if(d&&d!==6)n++;c.setDate(c.getDate()+1);}
    document.getElementById('me-days').value=n||1;
  }
}
async function hrManualSubmit(){
  if(!_manualStaff){toast('Lookup staff first','bad');return;}
  const ltype=document.getElementById('me-ltype').value;
  const from=document.getElementById('me-from').value;
  const to=document.getElementById('me-to').value||from;
  const days=parseFloat(document.getElementById('me-days').value)||1;
  const reason=document.getElementById('me-reason').value.trim()||'Manual entry by HR';
  if(!ltype||!from){toast('Fill all required fields','bad');return;}
  const btn=document.getElementById('me-submit-btn');
  btn.disabled=true;btn.textContent='Saving…';
  try{
    const res=await apiHR('manualEntry',{
      employeeId:_manualStaff.empId,name:_manualStaff.name,
      gender:_manualStaff.gender||'',position:_manualStaff.position||'',
      location:_manualStaff.location||'Phnom Penh',
      leaveType:ltype,dateFrom:from,dateTo:to,workingDays:days,
      submissionDate:todayFmt(),reason
    });
    if(res&&res.result==='success'){
      toast('Saved — '+res.requestId,'ok2');
      hrManualInit();hrLoadData();
    }else{toast(res&&res.error||'Failed to save','bad');}
  }catch(e){toast('Error: '+e,'bad');}
  finally{btn.disabled=false;btn.textContent='Save Leave (Silent)';}
}
async function hrManualNoticeSubmit(){
  if(!_manualStaff){toast('Lookup staff first','bad');return;}
  const ntype=document.getElementById('me-ntype').value;
  const ndate=document.getElementById('me-ndate').value;
  const ntime=document.getElementById('me-ntime').value;
  const nreturn=document.getElementById('me-nreturn').value;
  const nreason=document.getElementById('me-nreason').value.trim();
  if(!ndate||!ntime){toast('Date and time are required','bad');return;}
  const btn=document.getElementById('me-notice-btn');
  btn.disabled=true;btn.textContent='Saving…';
  try{
    const res=await apiHR('manualNotice',{
      empId:_manualStaff.empId,name:_manualStaff.name,
      noticeType:ntype,noticeDate:ndate,time:ntime,
      returnTime:nreturn||'',reason:nreason||'Manual entry by HR'
    });
    if(res&&res.result==='success'){
      toast('Notice saved','ok2');
      // reset notice fields but keep staff selected
      document.getElementById('me-ntime').value='';
      document.getElementById('me-nreturn').value='';
      document.getElementById('me-nreason').value='';
      hrLoadData();
    }else{toast(res&&res.error||'Failed to save','bad');}
  }catch(e){toast('Error: '+e,'bad');}
  finally{btn.disabled=false;btn.textContent='Save Notice (Silent)';}
}

async function wipeTestUser(){
  if(!confirm('Wipe ALL data for test user johnwich / KMEOW007?\n\nThis deletes all their requests, notices, and attendance records, and resets their leave balance to 0.\n\nThis cannot be undone.'))return;
  const btn=document.getElementById('wipe-test-btn');
  if(btn){btn.disabled=true;btn.textContent='Wiping...';}
  try{
    const res=await apiHR('wipeTestUser');
    if(res&&res.result==='success'){
      const d=res.deleted||{};
      toast(`Wiped: ${d.requests||0} requests · ${d.notices||0} notices · ${d.attendance||0} attendance`,'ok2');
      hrLoadData();
    }else{toast('Wipe failed','bad');}
  }catch(e){toast('Error: '+e,'bad');}
  finally{if(btn){btn.disabled=false;btn.textContent='Wipe All Test Data';}}
}
