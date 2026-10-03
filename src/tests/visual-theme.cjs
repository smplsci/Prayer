const {chromium}=require('C:/Users/Drfah/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const ctx=await browser.newContext(),root=path.resolve(__dirname,'../../docs'),out=path.join(process.env.TEMP,'madar-visual-review');fs.mkdirSync(out,{recursive:true});
 await ctx.route('http://localhost:9123/**',r=>{const name=path.basename(new URL(r.request().url()).pathname)||'index.html';return r.fulfill({contentType:name.endsWith('.js')?'text/javascript':'text/html',body:name==='cloud-config.js'?"window.MADAR_CLOUD={url:'',publishableKey:''}":fs.readFileSync(path.join(root,name))})});
 const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 for(const width of [390,768,1440]){await p.setViewportSize({width,height:900});
  for(const name of ['index','education','display','display-teacher','exercises','teacher','admin','live-teacher','live-student','reset-password']){
   await p.goto('http://localhost:9123/'+name+'.html');if(name==='index'&&await p.locator('#welcomeSkip').isVisible())await p.locator('#welcomeSkip').click();
   assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),name+' overflow at '+width);
   assert.equal(await p.locator('#madar-visual-theme').count(),1,name+' shared theme');
   if(name==='index'){await p.locator('#time').fill('15:00:00');await p.locator('#time').dispatchEvent('change');}
   if(['index','education','admin','live-teacher'].includes(name))await p.screenshot({path:path.join(out,name+'-'+width+'.png'),fullPage:true});
   if(name==='index'){await p.locator('#city-search-fold > summary').click();await p.locator('#scene-view-fold > summary').click();assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'open controls overflow '+width);await p.screenshot({path:path.join(out,'controls-'+width+'.png'),fullPage:true});}
  }
 }
 assert.deepEqual(errors,[]);console.log('PASS ten screens at phone, tablet and desktop widths; open controls fit; no JavaScript errors. Screenshots: '+out);
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
