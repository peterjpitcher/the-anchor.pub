#!/usr/bin/env node
const assert=require('node:assert/strict')
const fs=require('node:fs/promises')
const {chromium,webkit}=require('playwright')
const base='http://127.0.0.1:3138'
const out='/tmp/anchor-growth/tables'
async function main(){
 const results=[]
 for(const [engineName,engine] of [['chromium',chromium],['webkit',webkit]]){
  const browser=await engine.launch({headless:true})
  const context=await browser.newContext({viewport:{width:390,height:844}})
  await context.route('**/*',r=>new URL(r.request().url()).origin===base?r.continue():r.abort())
  const page=await context.newPage();page.setDefaultTimeout(15000)
  for(const [path,label,href] of [
   ['/private-hire','Enquire about your date','#enquiry'],
   ['/quiz-night','View upcoming dates','#book'],
   ['/cash-bingo','View upcoming dates','#book'],
   ['/music-bingo','View upcoming dates','#book'],
   ['/events/fixture-open','Reserve seats','#event-booking'],
   ['/events/fixture-past','View upcoming dates','/whats-on'],
   ['/events/fixture-cancelled','View upcoming dates','/whats-on'],
   ['/events/fixture-sold-out','View upcoming dates','/whats-on'],
   ['/live-sport/nations-championship','Choose a game','#fixtures']
  ]){
   const row={browser:engineName,path}
   try{
    const response=await page.goto(base+path,{waitUntil:'domcontentloaded',timeout:120000});assert.equal(response.status(),200)
    const cookie=page.getByRole('button',{name:/^Reject( All| all cookies)?$/i});if(await cookie.count())await cookie.click()
    await page.evaluate(()=>scrollTo(0,1500))
    const sticky=page.getByTestId('sticky-ctas');await page.waitForFunction(()=>document.querySelector('[data-testid="sticky-ctas"]')?.getAttribute('aria-hidden')==='false')
    const link=sticky.getByRole('link',{name:label,exact:true});await link.waitFor();assert.equal(await link.getAttribute('href'),href)
    assert.equal(await sticky.getByRole('button',{name:'Book a table',exact:true}).count(),0)
    if(href.startsWith('#')){await link.click();await page.waitForURL(url=>url.hash===href);await page.locator(href).waitFor();assert.equal(new URL(page.url()).hash,href)}
    await page.screenshot({path:`${out}/${engineName}-cta-${path.replaceAll('/','-')}.png`})
    row.passed=true
   }catch(e){row.error=e.message;await page.screenshot({path:`${out}/${engineName}-cta-failure-${path.replaceAll('/','-')}.png`})}
   results.push(row);await fs.writeFile(out+'/cta-evidence.json',JSON.stringify(results,null,2))
  }
  await context.close();await browser.close()
 }
 console.log(JSON.stringify(results,null,2));assert.ok(results.every(r=>r.passed),'Every scoped CTA must pass')
}
main().catch(error=>{console.error(error);process.exitCode=1})
