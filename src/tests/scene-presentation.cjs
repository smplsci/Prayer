// UI and WebGL checks using local files and a disabled cloud fixture.
const {chromium}=require('C:/Users/Drfah/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
(async()=>{const b=await chromium.launch({headless:true,channel:'msedge'});try{
const c=await b.newContext(),root=path.resolve(__dirname,'../../docs');
await c.route('http://localhost:9123/**',r=>{const name=path.basename(new URL(r.request().url()).pathname)||'index.html';return r.fulfill({contentType:name.endsWith('.js')?'text/javascript':'text/html',body:name==='cloud-config.js'?"window.MADAR_CLOUD={url:'',publishableKey:''}":fs.readFileSync(path.join(root,name))})});
const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
for(const name of ['index.html','display.html','display-teacher.html']){
 await p.goto('http://localhost:9123/'+name);if(name==='index.html')await p.locator('#welcomeSkip').click();
 for(const id of ['city-search-fold','scene-view-fold'])assert.equal(await p.locator('#'+id).evaluate(n=>n.open),false);
 assert.equal(await p.locator('.upcoming-prayers').evaluate(n=>n.open),false);
 await p.locator('#city-search-fold > summary').click();assert.ok(await p.locator('#city').isVisible());
 await p.locator('#scene-view-fold > summary').click();await p.locator('#show-shadow-hints').check();
 for(const [time,count]of [['09:00:00',0],['13:00:00',3],['15:45:00',3],['17:00:00',3],['20:00:00',0],['09:00:00',0]]){
  await p.locator('#time').fill(time);await p.locator('#time').dispatchEvent('change');
  assert.equal(await p.locator('.scene-rings span').evaluateAll(ns=>ns.filter(n=>!n.hidden).length),count,name+' '+time);
  const shader=await p.locator('#scene').evaluate(canvas=>{const gl=canvas.getContext('webgl'),program=gl?.getParameter(gl.CURRENT_PROGRAM);return program?{value:gl.getUniform(program,gl.getUniformLocation(program,'guides')),error:gl.getError()}:null});
  assert.ok(shader,'WebGL renderer active');assert.equal(shader.error,0);assert.equal(shader.value,count);
 }
 for(const [key,count]of [['rise',0],['noon',0],['dhuhr',3],['asr',3],['double',3],['maghrib',0]]){await p.locator('[data-key="'+key+'"]').click();assert.equal(await p.locator('.scene-rings span').evaluateAll(ns=>ns.filter(n=>!n.hidden).length),count,name+' stop '+key)}
 await p.locator('.upcoming-prayers summary').click();assert.ok(await p.locator('#upcoming-prayer-list').isVisible());
 for(const width of [390,768,1440]){await p.setViewportSize({width,height:900});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),name+' overflow '+width)}
 await p.setViewportSize({width:1440,height:900});console.log('PASS '+name+': folds, WebGL stages, reverse time, prayer list, responsive widths');
}
for(const name of ['education.html','teacher.html','exercises.html','admin.html']){await p.goto('http://localhost:9123/'+name);if(name==='index.html')await p.locator('#welcomeSkip').click();assert.ok(await p.locator('main').count());}
assert.deepEqual(errors,[]);console.log('PASS all seven entry screens load without JavaScript errors');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
