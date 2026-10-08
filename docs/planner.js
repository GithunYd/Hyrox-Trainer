export const DAY = 86400000;
export function validDate(date) {
  return typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(date+'T12:00:00Z')) && new Date(date+'T12:00:00Z').toISOString().slice(0,10) === date;
}
export function addDays(date, count) { return new Date(Date.parse(date+'T12:00:00Z')+count*DAY).toISOString().slice(0,10); }
export function distance(from, to) { return Math.round((Date.parse(to+'T12:00:00Z')-Date.parse(from+'T12:00:00Z'))/DAY); }
export function localDate(now = new Date()) { return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`; }

// Short timelines keep foundation work and an easy finish; they never fast-forward
// beginners into peak sessions. Longer timelines repeat stable build/recovery blocks.
export function buildPlan(start, race, templates) {
  if (!validDate(start) || !validDate(race)) throw new Error('Choose a valid race date.');
  const length = distance(start, race)+1;
  if (length < 1 || length > 731) throw new Error('Choose a race between your first day and two years from it.');
  const taperDays = length >= 28 ? 14 : 7;
  const trainingWeeks = Math.ceil(Math.max(0,length-taperDays)/7);
  const days = [];
  for (let i=0;i<length;i++) {
    const left = length-i-1;
    const week = Math.floor(i/7);
    let templateIndex, dayIndex=i%7;
    if (left < 7) { templateIndex=20; dayIndex=6-left; }
    else if (length>=28 && left<14) { templateIndex=19; dayIndex=13-left; }
    else if (trainingWeeks<=19 || week<12) templateIndex=Math.min(week,18);
    else if (week >= trainingWeeks-7) templateIndex=12+(week-(trainingWeeks-7));
    else templateIndex=8+(week-12)%4;
    const template=templates[templateIndex];
    const source=template.days[dayIndex];
    const date=addDays(start,i);
    days.push({...source,steps:[...source.steps],id:date,date,number:i+1,phase:template.phase,week:week+1});
  }
  return days;
}

export function checklist(day) {
  const tasks=[],tips=[];
  day.steps.forEach(step=>{
    if (/^(Choose a load|Use light technique|No equipment\?|Keep the whole session|Start conservatively)/.test(step)) { tips.push(step); return; }
    // Split strength exercises into tangible, independent wins. Circuits keep their
    // prescribed sequence/rest as one task so the number of rounds is unambiguous.
    if (step.includes(';') && !/round|sequence|station|Run 1 km/i.test(step)) {
      step.split(';').forEach(s=>{const text=s.trim();tasks.push(text.charAt(0).toUpperCase()+text.slice(1));});
    } else tasks.push(step);
  });
  return {tasks,tips};
}

export function validateState(state, templates) {
  if (!state || state.schemaVersion!==2 || !validDate(state.start) || !validDate(state.race)) throw new Error('Invalid backup.');
  const days=buildPlan(state.start,state.race,templates);
  const byDate=new Map(days.map(d=>[d.date,d]));
  if(!Array.isArray(state.completed)||state.completed.some(d=>!byDate.has(d)))throw new Error('Invalid checkoffs.');
  if(!state.tasks || typeof state.tasks!=='object' || Array.isArray(state.tasks))throw new Error('Invalid checklist.');
  for(const [date,values] of Object.entries(state.tasks)) {
    if(!byDate.has(date)||!Array.isArray(values)||values.some(v=>!Number.isInteger(v)||v<0||v>=checklist(byDate.get(date)).tasks.length))throw new Error('Invalid checklist.');
  }
  return {schemaVersion:2,start:state.start,race:state.race,completed:[...new Set(state.completed)],tasks:Object.fromEntries(Object.entries(state.tasks).map(([date,v])=>[date,[...new Set(v)]]))};
}
