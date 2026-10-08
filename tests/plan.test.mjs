import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {plan,START,RACE} from '../scripts/plan.mjs';
test('21 full contiguous weeks ending on the requested Sunday',()=>{
  assert.equal(plan.length,21);
  const days=plan.flatMap(w=>w.days);
  assert.equal(days.length,147);
  assert.equal(new Set(days.map(d=>d.id)).size,147);
  assert.equal(days[0].date,START);
  assert.equal(days.at(-1).date,RACE);
  for(let i=1;i<days.length;i++) assert.equal(Date.parse(days[i].date)-Date.parse(days[i-1].date),86400000);
  for(const w of plan){assert.equal(w.days.length,7);assert.equal(new Date(w.start+'T12:00:00Z').getUTCDay(),1);assert.equal(new Date(w.end+'T12:00:00Z').getUTCDay(),0);}
});
test('Every dated day contains a specific session; weekly recovery and final taper are preserved',()=>{
  for(const w of plan){
    for(const d of w.days){assert.ok(d.title);assert.ok(d.duration);assert.ok(d.steps.length);assert.ok(d.steps.every(s=>s.length>15));assert.equal(d.id,d.date);}
    assert.equal(w.days[3].kind,'Rest');
  }
  assert.deepEqual(plan.filter(w=>w.phase==='Recovery week').map(w=>w.number),[4,8,12,16]);
  assert.equal(plan[19].phase,'Taper');assert.equal(plan[20].phase,'Race week');
  assert.equal(plan[20].days[5].kind,'Rest');assert.equal(plan[20].days[6].kind,'Race');
});
test('Static fallback contains every workout, accessible checkbox, real station table and valid local assets',()=>{
  const html=fs.readFileSync('docs/index.html','utf8');
  assert.equal((html.match(/<article class="day"/g)||[]).length,147);
  assert.equal((html.match(/data-day=/g)||[]).length,147);
  assert.equal((html.match(/<details class="week"/g)||[]).length,21);
  for(const d of plan.flatMap(w=>w.days)){assert.ok(html.includes(`id="day-${d.id}"`));assert.ok(html.includes(d.title));}
  assert.ok(html.includes('<noscript>'));assert.ok(html.includes('<table>'));assert.ok(html.includes('102 kg'));
  for(const match of html.matchAll(/(?:src|href)="\.\/([^"#]+)"/g)) assert.ok(fs.existsSync('docs/'+match[1]),match[1]);
  const manifest=JSON.parse(fs.readFileSync('docs/manifest.webmanifest','utf8'));
  assert.equal(manifest.start_url,'./');assert.equal(manifest.scope,'./');assert.equal(manifest.display,'standalone');
  for(const icon of manifest.icons) assert.ok(fs.existsSync('docs/'+icon.src));
});
