// Calendar arithmetic is UTC so build output is independent of host timezone.
export const START = '2026-10-05';
export const RACE = '2027-02-28';
export const weeks = [
  ['Find your rhythm', 'Foundation', 20, 25, 6, 2, 8, 2],
  ['Build consistency', 'Foundation', 22, 28, 7, 2, 10, 2],
  ['A little more time', 'Foundation', 25, 30, 8, 3, 10, 2],
  ['Absorb the work', 'Recovery week', 18, 22, 5, 2, 8, 2],
  ['Steady foundations', 'Foundation', 28, 33, 8, 3, 12, 2],
  ['Stronger legs', 'Build', 30, 35, 5, 3, 12, 3],
  ['Comfortable running', 'Build', 32, 38, 6, 3, 15, 3],
  ['Recover & reset', 'Recovery week', 24, 28, 4, 2, 10, 2],
  ['Build your engine', 'Build', 35, 40, 6, 3, 15, 3],
  ['Hold your rhythm', 'Build', 36, 43, 7, 3, 18, 3],
  ['Stronger transitions', 'Build', 38, 45, 8, 3, 20, 3],
  ['Make room for recovery', 'Recovery week', 28, 32, 5, 2, 12, 2],
  ['Run into the station', 'Race specific', 40, 48, 4, 3, 20, 3],
  ['Find your race effort', 'Race specific', 42, 50, 5, 3, 22, 3],
  ['Practice the sequence', 'Race specific', 42, 52, 5, 3, 25, 3],
  ['Freshen up', 'Recovery week', 30, 35, 3, 2, 15, 2],
  ['Longer combinations', 'Race specific', 43, 55, 6, 3, 25, 3],
  ['Dress rehearsal', 'Peak', 40, 45, 5, 3, 25, 3],
  ['Confidence, not exhaustion', 'Peak', 35, 40, 4, 2, 20, 3],
  ['Let the work settle', 'Taper', 25, 30, 3, 2, 12, 2],
  ['Arrive fresh', 'Race week', 15, 0, 3, 1, 8, 1],
];
const warm = 'Warm up: 5 min brisk walk or easy bike, then 10 bodyweight squats, 10 alternating reverse lunges and 10 arm circles each way.';
const cool = 'Cool down: 5 min easy walk, then 30 sec each calf, hip-flexor and chest stretch per side.';
const effort = 'Easy = RPE 3–4/10, able to speak full sentences. Walk breaks are welcome. Steady = RPE 5–6, short sentences. Never sprint these sessions.';
const lifting = 'Choose a load that leaves 2–3 good reps in reserve (RPE 6–7). Rest 90 sec between sets. Increase by the smallest available increment only when all reps are controlled; keep loads lighter during recovery and taper weeks.';
const dateAt = n => new Date(Date.parse(START+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);
const session = (title, kind, duration, steps) => ({title, kind, duration, steps});
const train = (title, kind, duration, steps) => session(title,kind,duration,[warm,...steps,cool]);
function station(w, rounds, balls) {
  const metres = w < 5 ? 200 : w < 12 ? 300 : 400;
  const lane = w < 5 ? 12.5 : 25;
  const carry = w < 5 ? 40 : w < 12 ? 60 : 80;
  const lunge = w < 5 ? 10 : w < 12 ? 15 : 20;
  return train('Station skills', 'Stations', `${rounds*13+10}–${rounds*15+10} min`, [
    `${rounds} rounds, in this order: SkiErg ${metres} m; sled push ${lane} m; sled pull ${lane} m; burpee broad jumps ${w<5?10:15} m; row ${metres} m; farmers carry ${carry} m; sandbag lunges ${lunge} m; ${balls} wall balls. Rest 60 sec between stations and 2 min between rounds.`,
    'Use light technique loads at RPE 5–6. Start lunges with bodyweight and wall balls with a light ball. Use a measured lane. For sleds, choose a load you can move smoothly; surface friction matters more than a fixed gym weight.',
    'No equipment? Replace each SkiErg/row with 2 min brisk incline walk; each sled push with 45 sec incline walk; each sled pull with 12 cable or resistance-band rows; carry with two dumbbells; sandbag lunges with bodyweight; wall balls with squat-to-press. These build fitness, but practice actual equipment before racing.',
  ]);
}
function hybrid(rounds, distance, items, description) {
  return train('Run + station practice','HYROX',`${rounds*12+10}–${rounds*16+10} min`,[
    `${description} Complete ${rounds} rounds. Each round starts with ${distance} m easy run/walk, then the next station in this sequence: ${items}. Each listed station is used once. Rest 90 sec after each round.`,
    'Keep the whole session at RPE 5–6. Use light to moderate loads with good form. Walk the first 100 m after stations if needed. This is practice, not a time trial.',
  ]);
}
export const plan = weeks.map((spec, i)=>{
  const [name,phase,easy,long,n,sets,balls,rounds] = spec;
  const w=i+1;
  const recovery=phase==='Recovery week';
  const strength=train('Strength foundations','Strength','40–50 min',[
    `Goblet squat ${sets} × 8; dumbbell Romanian deadlift ${sets} × 8; incline push-up ${sets} × 8; one-arm dumbbell row ${sets} × 10 per side; standing calf raise 2 × 12; plank 2 × 25 sec (rest 45 sec).`,lifting,
  ]);
  const run = w<=5
    ? train('Easy run / walk','Run',`${easy+10} min`,[`${easy} min total, repeating 2 min easy jog / 1 min walk; stop at ${easy} min even if part-way through a repeat. ${effort}`])
    : train('Easy aerobic run','Run',`${easy+10} min`,[`${easy} min easy run. If needed, repeat 4 min jog / 1 min walk until time is complete. ${effort}`]);
  let quality = w<=5
    ? train('Short run + strength','Run + strength','35–45 min',[`${n} × (1 min easy jog + 1 min walk).`, `Dumbbell step-up ${sets} × 8 per leg; glute bridge ${sets} × 10; dumbbell overhead press ${sets} × 8; dead bug 2 × 8 per side. ${lifting}`])
    : w<=12
      ? train('Controlled intervals + strength','Run + strength','40–55 min',[`${n} × (2 min steady run + 90 sec walk). ${effort}`,`Dumbbell step-up ${sets} × 8 per leg; glute bridge ${sets} × 10; dumbbell overhead press ${sets} × 8; dead bug 2 × 8 per side. ${lifting}`])
      : train('Race rhythm + strength','Run + strength','40–55 min',[`${n} × (3 min steady run + 2 min walk/jog). ${effort}`,`Dumbbell step-up ${sets} × 8 per leg; glute bridge ${sets} × 10; dumbbell overhead press ${sets} × 8; dead bug 2 × 8 per side. ${lifting}`]);
  if(recovery) quality=train('Easy movement + light strength','Run + strength','30–40 min',[`${n*3} min easy run/walk at RPE 3.`, `Step-up 2 × 6 per leg; glute bridge 2 × 8; overhead press 2 × 6; dead bug 2 × 6 per side. Rest 90 sec. Use lighter loads than last week.`]);
  let saturday=train('Long easy run / walk','Run',`${long+10} min`,[`${long} min easy run/walk at RPE 3–4. Repeat 4 min jog / 1 min walk, or 2 min / 1 min if needed. Keep the final 5 min as easy as the first. No pace target.`]);
  if([7,10,13,14,15,17,19].includes(w)){
    const count=w<13?3:w===19?4:w===17?6:w===15?5:4;
    const items=['SkiErg 500 m','sled push 25 m','sled pull 25 m','burpee broad jumps 20 m','row 500 m','farmers carry 100 m'].slice(0,count).join('; ');
    saturday=hybrid(count,w<13?500:750,items,'Replace the long run with this combination session.');
  }
  if(w===18) saturday=hybrid(8,750,'SkiErg 750 m; sled push 37.5 m; sled pull 37.5 m; burpee broad jumps 60 m; row 750 m; farmers carry 150 m; sandbag lunges 75 m; wall balls 75 reps','Reduced-distance rehearsal (6 km total running). Use a comfortable load up to your division’s race load only if already practiced. Allow 90–120 min; shorten or stop if form deteriorates.');
  if(w>=13 && !recovery) {
    // Avoid a full station circuit immediately before the large Saturday rehearsal.
    if(w===18) quality=train('Easy run + mobility','Run','30 min',['20 min easy run/walk at RPE 3, then 5 min gentle ankle/hip mobility. No extra lifting.']);
  }
  if(w===20){
    quality=train('Short rhythm reminder','Run','25 min',['4 × (2 min steady run + 2 min walk). Finish feeling you could repeat it.']);
    saturday=train('Short easy run','Run','30 min',['20 min easy run/walk at RPE 3. Skip any additional station work.']);
  }
  let days=[strength,run,station(w,rounds,balls),session('Full rest','Rest','0 min',['No planned exercise. Prioritize sleep, regular meals and normal hydration. If sore, use gentle movement only.']),quality,saturday,session('Recovery walk + mobility','Recovery','25 min',['20 min comfortable walk at RPE 2. Then 5 min gentle ankle, hip and upper-back mobility. This is optional; full rest is equally valid.'])];
  if(w===21) days=[
    train('Light full-body tune-up','Strength','25 min',['Goblet squat 1 × 8; dumbbell Romanian deadlift 1 × 8; incline push-up 1 × 8; dumbbell row 1 × 8 per side; wall balls 2 × 8 with a light ball. Rest 90 sec; RPE 4. No new loads.']),
    train('Easy run + strides','Run','25 min',['15 min easy run/walk. Then 3 × (20 sec relaxed quicker running at RPE 6 + 100 sec walking).']),
    train('Station touchpoints','Stations','20 min',['1 round: SkiErg 200 m; row 200 m; farmers carry 40 m; bodyweight lunges 10 m; 8 light wall balls. Rest 60 sec between stations. RPE 3–4.']),
    session('Rest + race logistics','Rest','0 min',['Confirm your actual division date and wave time, course instructions, ID, ticket and travel. This plan targets Sunday, Feb 28; move the taper if your ticket is for another day.']),
    train('Optional shakeout','Run','15 min',['5 min easy jog/walk, then 3 × (15 sec relaxed strides + 45 sec walk). Skip if tired.']),
    session('Rest + prepare','Rest','0 min',['Pack tested shoes, comfortable kit, ID and ticket. Eat familiar meals, hydrate normally, and avoid new equipment or workouts. Set your alarm around your confirmed start time.']),
    session('Phoenix race day','Race','Your wave time',['Arrive according to the organizer’s instructions. Warm up for 10 min with walking, easy jogging and familiar mobility.','Run 1 km before each station: SkiErg 1,000 m → sled push 50 m → sled pull 50 m → burpee broad jumps 80 m → row 1,000 m → farmers carry 200 m → sandbag lunges 100 m → wall balls 100 reps. Total running: 8 km.','Start conservatively. Use your registered division’s loads, follow judges and confirm completion before leaving each station. Walking is a valid pacing strategy. After finishing, walk gently, drink and eat as comfortable.']),
  ];
  return {number:w,name,phase,start:dateAt(i*7),end:dateAt(i*7+6),days:days.map((d,j)=>({...d,date:dateAt(i*7+j),id:dateAt(i*7+j)}))};
});
