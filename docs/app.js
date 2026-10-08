import {buildPlan,checklist,validateState,validDate,localDate,addDays,distance} from './planner.js';
const KEY='hyrox-trainer-v2',FIRST='hyrox-trainer-first-open';
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=d=>new Date(d+'T12:00:00Z').toLocaleDateString(undefined,{month:'short',day:'numeric',timeZone:'UTC'});
const full=d=>new Date(d+'T12:00:00Z').toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric',timeZone:'UTC'});
let state=null,templates,days=[],storageOK=true,firstOpen=localDate(),view='today',toastTimer;
try{const previous=localStorage.getItem(FIRST);if(validDate(previous)&&previous<=localDate())firstOpen=previous;else localStorage.setItem(FIRST,firstOpen);}catch{storageOK=false;}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));storageOK=true;}catch{storageOK=false;}}
function readLatest(){if(!storageOK)return;try{const raw=localStorage.getItem(KEY);if(raw)state=validateState(JSON.parse(raw),templates);}catch{storageOK=false;}}
function currentDay(){return days.find(d=>d.date===localDate())||(localDate()<state.start?days[0]:days.at(-1));}
function taskChecked(day,i){return state.completed.includes(day.date)||(state.tasks[day.date]||[]).includes(i);}
function sessionMarkup(day,compact=false){
  const {tasks,tips}=checklist(day),done=state.completed.includes(day.date);
  return `<article class="workout ${done?'done':''}" data-workout="${day.date}"><div class="workout-top"><span class="tag">${esc(day.kind)}</span><span>${esc(day.duration)}</span></div><h2>${esc(day.title)}</h2>${compact?`<p class="fine">${esc(full(day.date))} · Day ${day.number}</p>`:''}<label class="finish-control"><input type="checkbox" data-complete="${day.date}" ${done?'checked':''}><span class="finish-icon" aria-hidden="true">✓</span><span>${done?'Session complete. Nice work.':day.kind==='Rest'?'Check off your recovery':day.kind==='Race'?'I crossed the finish line':'Mark session complete'}</span></label><ul class="checklist">${tasks.map((task,i)=>`<li class="task-item"><label class="task"><input type="checkbox" data-task="${i}" data-date="${day.date}" ${taskChecked(day,i)?'checked':''}><span class="task-icon" aria-hidden="true">✓</span><span>${esc(task)}</span></label><label class="weight-log"><span>Weight used (optional)</span><input type="number" min="0" max="10000" step="0.1" inputmode="decimal" data-weight="${i}" data-date="${day.date}" aria-label="Weight used for ${esc(task)}" value="${esc(state.weights?.[day.date]?.[i]?.value ?? '')}" placeholder="—"><select data-unit="${i}" data-date="${day.date}" aria-label="Weight unit for ${esc(task)}"><option value="kg">kg</option><option value="lb" ${state.weights?.[day.date]?.[i]?.unit==='lb'?'selected':''}>lb</option></select></label></li>`).join('')}</ul><p class="fine" data-weight-status role="status">Weights save with your workout on this device. For paired weights, enter the weight of each.</p>${tips.length?`<details class="workout-tips"><summary>Technique & substitutions</summary>${tips.map(t=>`<p>${esc(t)}</p>`).join('')}</details>`:''}</article>`;
}
function showView(next){view=next;$('today-view').hidden=view!=='today';$('plan-view').hidden=view!=='plan';for(const n of ['today','plan']){$('view-'+n).classList.toggle('active',view===n);$('view-'+n).setAttribute('aria-pressed',String(view===n));}}
function progress(){
  const count=state.completed.length;$('wins-count').textContent=count;
  let date=localDate(),rhythm=0;if(!state.completed.includes(date))date=addDays(date,-1);
  while(date>=state.start&&state.completed.includes(date)){rhythm++;date=addDays(date,-1);}
  $('rhythm-count').textContent=rhythm;
  const current=currentDay(),week=days.filter(d=>d.week===current.week),training=week.filter(d=>!['Rest','Recovery','Race'].includes(d.kind));
  $('week-count').textContent=training.filter(d=>state.completed.includes(d.date)).length+'/'+training.length;
  $('week-dots').innerHTML=week.map(d=>`<span class="week-dot ${state.completed.includes(d.date)?'checked':''} ${d.date===localDate()?'is-today':''}" aria-label="${esc(full(d.date))}: ${state.completed.includes(d.date)?'completed':'not checked'}"><span aria-hidden="true">${state.completed.includes(d.date)?'✓':d.number}</span><small>${new Date(d.date+'T12:00:00Z').toLocaleDateString(undefined,{weekday:'short',timeZone:'UTC'})}</small></span>`).join('');
  const next=[1,3,7,14,30,60,100,200,365].find(n=>n>count);
  $('reward-note').textContent=count===0?'Your first checkmark is waiting. Small steps count.':state.completed.includes(current.date)?(current.kind==='Rest'?'Recovery counts. You’re doing the work.':'Today’s win is in the bank. Enjoy your recovery.'):`${count} day${count===1?'':'s'} completed.${next?' Next milestone: '+next+'.':' Keep going at your pace.'}`;
  for(const el of document.querySelectorAll('[data-week-progress]')){const group=days.filter(d=>d.week===Number(el.dataset.weekProgress));el.textContent=group.filter(d=>state.completed.includes(d.date)).length+'/'+group.length;}
}
function render(preserve=false){
  if(!state){$('setup').hidden=false;$('trainer').hidden=true;$('change-form').hidden=true;return;}
  const openWeeks=preserve?new Set([...document.querySelectorAll('#personal-plan details[open]')].map(d=>d.dataset.week)):null;
  const openDays=preserve?new Set([...document.querySelectorAll('#personal-plan .plan-day[open]')].map(d=>d.dataset.date)):null;
  const tipViews=preserve?new Set([...document.querySelectorAll('.workout-tips[open]')].map(d=>d.closest('[data-workout]').dataset.workout)):new Set();
  days=buildPlan(state.start,state.race,templates);
  $('setup').hidden=true;$('trainer').hidden=false;$('change-form').hidden=false;
  $('change-date').value=state.race;$('change-date').min=localDate();$('change-date').max=addDays(state.start,730);
  const current=currentDay(),left=distance(localDate(),state.race);
  $('race-summary').textContent='Race day · '+fmt(state.race);$('countdown').textContent=left>0?left:left===0?'Today':'Race date passed';$('countdown-label').textContent=left>0?(left===1?'day to go':'days to go'):'';
  $('today-date').textContent=localDate()>state.race?'YOUR RACE RECAP':full(current.date);
  $('today-title').textContent=state.completed.includes(current.date)?'Win collected.':current.kind==='Rest'?'Recovery is progress.':current.kind==='Race'?'Your finish line.':'Your next win.';
  $('day-number').textContent='DAY '+current.number;$('today-workout').innerHTML=sessionMarkup(current);
  const groups=days.reduce((m,d)=>{m.set(d.week,[...(m.get(d.week)||[]),d]);return m;},new Map());
  $('personal-plan').innerHTML=[...groups].map(([week,group])=>`<details class="week" data-week="${week}" ${(openWeeks?openWeeks.has(String(week)):week===current.week)?'open':''}><summary><span class="week-no">${String(week).padStart(2,'0')}</span><span class="week-info"><strong>Week ${week}</strong><span class="phase">${esc(group[0].phase)}</span><span class="fine">${fmt(group[0].date)} – ${fmt(group.at(-1).date)}</span></span><span data-week-progress="${week}" class="week-completion"></span><span aria-hidden="true">+</span></summary><div class="week-body">${group.map(d=>`<details class="plan-day" data-date="${d.date}" ${(openDays?openDays.has(d.date):d.date===localDate())?'open':''}><summary><span>${state.completed.includes(d.date)?'✓':'○'} ${esc(full(d.date))}</span><strong>${esc(d.title)}</strong></summary>${sessionMarkup(d,true)}</details>`).join('')}</div></details>`).join('');
  for(const tips of document.querySelectorAll('.workout-tips'))tips.open=tipViews.has(tips.closest('[data-workout]').dataset.workout);
  $('plan-length').textContent=`${days.length} days · ${fmt(state.start)} to ${fmt(state.race)}`;
  $('timeline-note').hidden=days.length>=56;$('timeline-note').textContent=days.length<14?'Your race is close. This is a light preparation schedule, not a shortcut to race readiness. Don’t add intense or unfamiliar work.':'A shorter build: start with foundations and keep race week light. This plan won’t squeeze 21 weeks of training into your timeline.';
  $('storage-status').textContent=storageOK?'Saved on this device · Your progress is private.':'Checkoffs work for this visit. Browser storage is unavailable; back up your plan below.';
  progress();showView(view);
}
function celebrate(day){
  const count=state.completed.length,week=days.filter(d=>d.week===day.week);
  let message=day.kind==='Rest'?'Recovery checked. That counts.':day.kind==='Race'?'Finish line crossed. You did it.':count===1?'First win collected. You’re on your way.':[3,7,14,30,60,100,200,365].includes(count)?`${count} days completed. Look how far you’ve come.`:'Session complete. One more win.';
  if(week.length===7&&week.every(d=>state.completed.includes(d.date)))message='Week complete. Seven days of showing up.';
  $('celebration').innerHTML=`<span class="celebration-check" aria-hidden="true">✓</span><span>${esc(message)}</span><span class="sparkles" aria-hidden="true">✦</span>`;
  $('celebration').hidden=false;$('celebration').classList.remove('pop');void $('celebration').offsetWidth;$('celebration').classList.add('pop');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('celebration').hidden=true,4000);
}
document.addEventListener('change',event=>{
  const input=event.target;if(!state||!input.matches('[data-weight],[data-unit]'))return;
  const date=input.dataset.date,index=input.dataset.weight??input.dataset.unit,row=input.closest('.weight-log'),number=row.querySelector('[data-weight]'),unit=row.querySelector('[data-unit]').value;
  if(!number.validity.valid){number.reportValidity();return;}
  const value=number.value;readLatest();state.weights??={};state.weights[date]??={};
  if(value==='')delete state.weights[date][index];else state.weights[date][index]={value:Number(value),unit};
  persist();
  for(const el of document.querySelectorAll('[data-weight][data-date="'+date+'"]'))if(el.dataset.weight===index&&el!==number)el.value=value;
  for(const el of document.querySelectorAll('[data-unit][data-date="'+date+'"]'))if(el.dataset.unit===index)el.value=unit;
  for(const el of document.querySelectorAll('[data-weight-status]'))el.textContent=storageOK?'Weight saved on this device.':'Weight kept for this visit. Back up your plan to keep it.';
});
document.addEventListener('change',event=>{
  const input=event.target;if(!input.matches('[data-complete],[data-task]')||!state)return;
  const date=input.dataset.complete||input.dataset.date,checked=input.checked,focusedTask=input.dataset.task;
  readLatest();days=buildPlan(state.start,state.race,templates);const day=days.find(d=>d.date===date);if(!day){render(true);return;}
  const wasDone=state.completed.includes(date),all=checklist(day).tasks.map((_,i)=>i);
  if(input.dataset.complete){state.tasks[date]=checked?all:[];state.completed=state.completed.filter(d=>d!==date);if(checked)state.completed.push(date);}
  else{const tasks=new Set(wasDone?all:state.tasks[date]||[]),i=Number(input.dataset.task);if(checked)tasks.add(i);else tasks.delete(i);state.tasks[date]=[...tasks];state.completed=state.completed.filter(d=>d!==date);if(tasks.size===all.length)state.completed.push(date);}
  state.completed.sort();persist();render(true);
  const scope=view==='today'?$('today-view'):$('plan-view');scope.querySelector(focusedTask!==undefined?`[data-date="${date}"][data-task="${focusedTask}"]`:`[data-complete="${date}"]`)?.focus({preventScroll:true});
  if(!wasDone&&state.completed.includes(date))celebrate(day);
});
$('view-today').addEventListener('click',()=>showView('today'));$('view-plan').addEventListener('click',()=>showView('plan'));
$('setup-form').addEventListener('submit',event=>{event.preventDefault();try{const race=$('race-date').value;if(!validDate(race)||race<localDate())throw new Error('Choose today or a future race date.');buildPlan(firstOpen,race,templates);state={schemaVersion:2,start:firstOpen,race,completed:[],tasks:{}};persist();render();window.scrollTo(0,0);}catch(e){$('setup-error').textContent=e.message;}});
$('change-form').addEventListener('submit',event=>{
  event.preventDefault();try{
    readLatest();const race=$('change-date').value;if(race<localDate())throw new Error('Choose today or a future date.');
    const oldDays=buildPlan(state.start,state.race,templates),newDays=buildPlan(state.start,race,templates),oldByDate=new Map(oldDays.map(d=>[d.date,d]));
    const unchanged=new Set(newDays.filter(d=>JSON.stringify(checklist(d))===JSON.stringify(checklist(oldByDate.get(d.date)||{steps:[]}))).map(d=>d.date)),valid=new Set(newDays.map(d=>d.date));
    state.completed=state.completed.filter(d=>valid.has(d)&&(d<localDate()||unchanged.has(d)));state.tasks=Object.fromEntries(Object.entries(state.tasks).filter(([date])=>unchanged.has(date)));
    state.weights=Object.fromEntries(Object.entries(state.weights||{}).filter(([date])=>valid.has(date)&&unchanged.has(date)));state.race=race;persist();render(true);$('change-status').textContent='Race date updated. Past completed days kept; changed upcoming workouts have fresh checklists.';
  }catch(e){$('change-status').textContent=e.message;}
});
function download(value,name){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('export').addEventListener('click',()=>{if(state){readLatest();download({...state,exportedAt:new Date().toISOString()},'hyrox-trainer-'+localDate()+'.json');$('backup-status').textContent='Plan backed up. Your race date, checkoffs and logged weights are included.';}});
$('legacy-export').addEventListener('click',()=>{try{download(JSON.parse(localStorage.getItem('phoenix-training-v1')),'previous-training-progress.json');}catch{$('backup-status').textContent='The previous backup could not be read.';}});
$('import').addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;try{if(file.size>500000)throw new Error('Too large');const restored=validateState(JSON.parse(await file.text()),templates);if(state&&!confirm('Restore this plan and its race date? This replaces the plan on this device. Back it up first if needed.'))return;state=restored;firstOpen=state.start;try{localStorage.setItem(FIRST,firstOpen);}catch{}persist();render();$('backup-status').textContent='Plan restored. Your first day, race date and checkoffs are back.';}catch{$('backup-status').textContent='Choose a valid HYROX Trainer plan backup. Nothing was changed.';}finally{event.target.value='';}});
$('reset').addEventListener('click',()=>{if(!confirm('Start over from today? Back up your current plan first if you want to keep it.'))return;state=null;firstOpen=localDate();try{localStorage.removeItem(KEY);localStorage.setItem(FIRST,firstOpen);}catch{storageOK=false;}$('settings').open=false;$('race-date').value='';$('race-date').max=addDays(firstOpen,730);render();});
window.addEventListener('storage',event=>{if((event.key===KEY||event.key===null)&&templates){try{const raw=localStorage.getItem(KEY);state=raw?validateState(JSON.parse(raw),templates):null;render(true);}catch{$('storage-status').textContent='Another tab changed the plan, but it could not be read.';}}});
async function boot(){
  try{const response=await fetch('./plan.json',{signal:AbortSignal.timeout(10000)});if(!response.ok)throw new Error('Unavailable');templates=(await response.json()).weeks;if(!Array.isArray(templates)||templates.length!==21)throw new Error('Invalid templates');
    try{const raw=localStorage.getItem(KEY);if(raw)state=validateState(JSON.parse(raw),templates);}catch{storageOK=false;}
    $('fallback').hidden=true;$('backup-controls').hidden=false;try{$('legacy-export').hidden=!localStorage.getItem('phoenix-training-v1');}catch{}
    $('race-date').min=localDate();$('race-date').max=addDays(firstOpen,730);render();
  }catch{$('fallback').querySelector('.notice').textContent='Personal setup is unavailable. Your starter workouts and station guide still work below. Reopen online to try again.';}
}
boot();let lastToday=localDate();setInterval(()=>{if(state&&localDate()!==lastToday){lastToday=localDate();render(true);}},60000);
let installPrompt;window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;$('install-button').hidden=false;});
$('install-button').addEventListener('click',async()=>{if(installPrompt){await installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$('install-button').hidden=true;}});
window.addEventListener('appinstalled',()=>$('install-button').hidden=true);$('update-button').addEventListener('click',()=>location.reload());
if('serviceWorker' in navigator&&window.isSecureContext){navigator.serviceWorker.register('./sw.js',{scope:'./'}).then(async registration=>{await navigator.serviceWorker.ready;$('offline-status').textContent='Offline ready. Your plan is here whenever you need it.';registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller){$('offline-status').textContent='An update is ready. Refresh to use it; your plan stays saved.';$('update-button').hidden=false;}});});}).catch(()=>$('offline-status').textContent='Offline setup is unavailable. Your plan still works online.');}else $('offline-status').textContent='Offline installation is unavailable in this browser. Your plan works online.';
