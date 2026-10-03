const {chromium}=require('C:/Users/Drfah/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
for(const choice of ['skip','allow','deny']){
 const context=await browser.newContext({geolocation:{latitude:24.7136,longitude:46.6753},permissions:['geolocation']}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await context.addInitScript(deny=>{window.geoCalls=0;const original=navigator.geolocation.getCurrentPosition.bind(navigator.geolocation);navigator.geolocation.getCurrentPosition=(ok,fail,options)=>{window.geoCalls++;if(deny)fail({code:1,message:'test denied'});else original(ok,fail,options)}},choice==='deny');
 await context.route('http://localhost:9123/**',r=>{const name=path.basename(new URL(r.request().url()).pathname)||'index.html';return r.fulfill({contentType:name.endsWith('.js')?'text/javascript':'text/html',body:name==='cloud-config.js'?"window.MADAR_CLOUD={url:'',publishableKey:''}":fs.readFileSync(path.resolve(__dirname,'../../docs',name))})});
 await page.goto('http://localhost:9123/index.html');await page.locator('#gpsWelcome').waitFor();assert.equal(await page.evaluate(()=>geoCalls),0);
 if(choice==='skip'){await page.locator('#welcomeSkip').click();assert.equal(await page.evaluate(()=>geoCalls),0)}
 else{await page.locator('#welcomeLocate').click();if(choice==='allow'){await page.waitForFunction(()=>!document.getElementById('gpsWelcome').open);assert.equal(await page.locator('#city').inputValue(),'gps')}else{await page.waitForFunction(()=>document.getElementById('welcomeGpsStatus').textContent.includes('يدويًا'));assert.equal(await page.locator('#city-search-fold').evaluate(n=>n.open),true);await page.locator('#welcomeSkip').click()}}
 await page.reload();assert.equal(await page.locator('#gpsWelcome').count(),0);assert.equal(await page.locator('#fajr-ban').isVisible(),false);assert.deepEqual(errors,[]);await context.close();console.log('PASS GPS welcome '+choice+': consent, result/fallback, same-tab dismissal, hidden morning rule');
}
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
