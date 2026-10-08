import test from 'node:test';
import assert from 'node:assert/strict';
import {plan} from '../scripts/plan.mjs';
import {buildPlan,checklist,validateState,validDate,addDays,distance} from '../docs/planner.js';
test('Personal plans start on any weekday, run without gaps, and finish on the selected race',()=>{
  for(const length of [1,2,6,7,13,14,27,28,49,56,100,144,147,148,210,366,731]){
    const start='2026-10-08',race=addDays(start,length-1),days=buildPlan(start,race,plan);
    assert.equal(days.length,length);assert.equal(days[0].date,start);assert.equal(days.at(-1).date,race);assert.equal(days.at(-1).kind,'Race');
    assert.equal(new Set(days.map(d=>d.date)).size,length);
    for(let i=1;i<days.length;i++)assert.equal(distance(days[i-1].date,days[i].date),1);
    if(length>1)assert.equal(days.at(-2).kind,'Rest');
    if(length>14)assert.equal(days[0].title,'Strength foundations');
  }
});
test('Short plans do not skip ahead into intense peak training; long plans retain recovery cycles',()=>{
  for(const length of [10,28,49,56,84]){
    const days=buildPlan('2026-10-08',addDays('2026-10-08',length-1),plan);
    assert.ok(days.every(d=>!['Peak','Race specific'].includes(d.phase)));
  }
  const long=buildPlan('2026-10-08','2027-10-08',plan);
  assert.ok(long.filter(d=>d.phase==='Recovery week').length>=28);
  const full=buildPlan('2026-10-05','2027-02-28',plan);
  assert.deepEqual(full.map(d=>d.title),plan.flatMap(w=>w.days).map(d=>d.title));
});
test('Dates validate leap years and reject malformed or excessive timelines',()=>{
  assert.equal(validDate('2028-02-29'),true);assert.equal(validDate('2027-02-29'),false);assert.equal(validDate('2027-13-01'),false);
  assert.equal(distance('2026-10-31','2026-11-02'),2);assert.equal(addDays('2028-02-28',1),'2028-02-29');
  assert.throws(()=>buildPlan('2026-10-08','2026-10-07',plan));assert.throws(()=>buildPlan('2026-10-08','2030-10-08',plan));
});
test('Progress backups validate day and exercise indexes before any state changes',()=>{
  const state={schemaVersion:2,start:'2026-10-08',race:'2027-02-28',completed:['2026-10-08'],tasks:{'2026-10-08':[0,1]}};
  assert.deepEqual(validateState(state,plan),{...state,weights:{}});
  const weights={'2026-10-08':{1:{value:22.5,unit:'kg'}}};
  assert.deepEqual(validateState({...state,weights},plan).weights,weights);
  for(const entry of [{value:-1,unit:'kg'},{value:20,unit:'bad'},{value:'20',unit:'kg'}])assert.throws(()=>validateState({...state,weights:{'2026-10-08':{1:entry}}},plan));
  assert.throws(()=>validateState({...state,completed:['1900-01-01']},plan));
  assert.throws(()=>validateState({...state,tasks:{'2026-10-08':[500]}},plan));
  assert.throws(()=>validateState({...state,tasks:null},plan));
  const first=buildPlan(state.start,state.race,plan)[0],list=checklist(first);
  assert.ok(list.tasks.length>=8);assert.ok(list.tasks.some(s=>s.includes('Goblet squat')));assert.ok(list.tips.some(s=>s.includes('Choose a load')));
});
