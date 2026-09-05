#!/usr/bin/env node
// Only the isolated local server is accepted. Its upstream fetch/socket guard prevents live writes.
const assert=require('node:assert/strict')
const fs=require('node:fs/promises')
const {chromium,webkit}=require('playwright')
const base='http://127.0.0.1:3138'
const out='/tmp/anchor-growth/tables'
async function main(){
 await fs.mkdir(out,{recursive:true});const evidence=[]
 for(const [name,engine] of [['chromium',chromium],['webkit',webkit]].filter(([name])=>!process.env.SMOKE_BROWSER||name===process.env.SMOKE_BROWSER)) {
  const browser=await engine.launch({headless:true})
  for(const consent of ['Reject','Accept'].filter(value=>!process.env.SMOKE_CONSENT||value===process.env.SMOKE_CONSENT)){
   await fetch(`${base}/__booking_growth_test?mode=normal`)
   const context=await browser.newContext({viewport:{width:390,height:844},extraHTTPHeaders:{'x-forwarded-for':`192.0.2.${Math.floor(Math.random()*250)+1}`}})
   await context.route('**/*',r=> {
    const url=new URL(r.request().url())
    if(url.origin===base)return r.continue()
    if(url.hostname==='challenges.cloudflare.com'&&url.pathname.includes('/api.js'))return r.fulfill({contentType:'application/javascript',body:`const callbacks={};window.turnstile={render:(e,o)=>{const id='test-'+Object.keys(callbacks).length;callbacks[id]=o.callback;setTimeout(()=>o.callback('isolated-test-token'),0);return id},remove:()=>{},reset:id=>{setTimeout(()=>callbacks[id]?.('isolated-test-token'),0)},getResponse:()=> 'isolated-test-token',isExpired:()=>false,ready:f=>f(),execute:()=>{}};const cb=new URL(document.currentScript.src).searchParams.get('onload');if(cb&&window[cb])window[cb]();`})
    return r.abort()
   })
   const page=await context.newPage();page.setDefaultTimeout(25000)
   const row={browser:name,consent,checks:[],pageErrors:[]};page.on('pageerror',e=>row.pageErrors.push(e.message))
   try {
    await page.goto(`${base}/private-hire`,{waitUntil:'domcontentloaded',timeout:120000})
    await page.getByRole('form',{name:'Short private hire enquiry'}).waitFor()
    const cookie=page.getByRole('button',{name:new RegExp(`^${consent}( All| all cookies)?$`,'i')});await cookie.click()
    // Use a food page where the persistent action opens the quick sheet.
    await page.goto(`${base}/food-menu`,{waitUntil:'domcontentloaded',timeout:120000})
    await page.evaluate(()=>scrollTo(0,1500))
    const sticky=page.locator('div.fixed[aria-hidden="false"]').getByRole('button',{name:'Book a table',exact:true})
    await sticky.click()
    const sheet=page.getByRole('dialog').filter({has:page.getByText('Eating or drinks',{exact:true})})
    await sheet.waitFor()
    await Promise.all([page.waitForResponse(r=>r.url().includes('/api/table-bookings/availability?')&&r.url().includes('date=2026-10-11')),sheet.getByLabel('Another date').fill('2026-10-11')])
    await sheet.getByText('Checking times…',{exact:true}).waitFor({state:'hidden'})
    assert.equal(await sheet.getByRole('button',{name:/^12:00/}).count(),0)
    assert.ok(await sheet.getByRole('button',{name:/^13:00/}).count()>0)
    row.checks.push('Sunday food starts at 13:00; no noon food slot')
    await Promise.all([page.waitForResponse(r=>r.url().includes('/api/table-bookings/availability?')&&r.url().includes('party_size=4')),sheet.getByRole('button',{name:'4 people',exact:true}).click()])
    await sheet.getByText('Checking times…',{exact:true}).waitFor({state:'hidden'})
    const full=sheet.getByRole('link',{name:'Use the full form',exact:true});
    const href=await full.getAttribute('href');assert.ok(href.includes('2026-10-11'));assert.ok(href.includes('party_size=4'))
    row.checks.push('Full form link preserves Sunday and four guests')
    await fetch(`${base}/__booking_growth_test?mode=closed-monday`)
    await Promise.all([page.waitForResponse(r=>r.url().includes('/api/table-bookings/availability?')&&r.url().includes('date=2026-10-05')),sheet.getByLabel('Another date').fill('2026-10-05')])
    await sheet.getByText('Checking times…',{exact:true}).waitFor({state:'hidden'})
    assert.equal(await sheet.getByRole('button',{name:/^\d{2}:\d{2}/}).count(),0)
    await Promise.all([page.waitForResponse(r=>r.url().includes('/api/table-bookings/availability?')&&r.url().includes('purpose=drinks')),sheet.getByRole('button',{name:'Just drinks',exact:true}).click()])
    await sheet.getByText('Checking times…',{exact:true}).waitFor({state:'hidden'})
    assert.ok(await sheet.getByRole('button',{name:/^12:00/}).count()>0)
    row.checks.push('Closed Monday has no eating slots; explicitly choosing drinks shows bar slots')
    await fetch(`${base}/__booking_growth_test?mode=unavailable`)
    await Promise.all([page.waitForResponse(r=>r.url().includes('/api/table-bookings/availability?')&&r.url().includes('date=2026-10-06')),sheet.getByLabel('Another date').fill('2026-10-06')])
    await sheet.getByText('Checking times…',{exact:true}).waitFor({state:'hidden'})
    assert.equal(await sheet.getByRole('button',{name:/^\d{2}:\d{2}/}).count(),0)
    row.checks.push('Availability outage clears loading and never invents slots')
    await page.screenshot({path:`${out}/${name}-${consent}-outage.png`})
    await fetch(`${base}/__booking_growth_test?mode=sold-out`)
    await Promise.all([page.waitForResponse(r=>r.url().includes('/api/table-bookings/availability?')&&r.url().includes('date=2026-10-07')),sheet.getByLabel('Another date').fill('2026-10-07')])
    await sheet.getByText('Checking times…',{exact:true}).waitFor({state:'hidden'})
    assert.equal(await sheet.getByRole('button',{name:/^\d{2}:\d{2}/}).count(),0)
    row.checks.push('Sold-out date offers no slots')
    await fetch(`${base}/__booking_growth_test?mode=normal`)
    await Promise.all([page.waitForResponse(r=>r.url().includes('/api/table-bookings/availability?')&&r.url().includes('date=2026-10-08')),sheet.getByLabel('Another date').fill('2026-10-08')])
    await sheet.getByRole('button',{name:/^13:00/}).click()
    const chosenHref=await sheet.getByRole('link',{name:'Use the full form',exact:true}).getAttribute('href')
    assert.ok(chosenHref.includes('time=13%3A00')); assert.ok(chosenHref.includes('party_size=4'));assert.ok(chosenHref.includes('2026-10-08'))
    row.checks.push('Retry after outage/sold-out restores usable times; selected time/date/party reach full link')
    await sheet.getByRole('link',{name:'Use the full form',exact:true}).click()
    await page.getByLabel(/^Party size$/i).waitFor()
    assert.equal(await page.getByLabel(/^Party size$/i).inputValue(),'4')
    assert.equal(await page.getByLabel('Date',{exact:true}).inputValue(),'2026-10-08')
    assert.equal(await page.getByRole('checkbox',{name:/^Just drinks/}).isChecked(),true)
    row.checks.push('Full form renders four guests, retained date/time and selected drinks purpose')
    await page.screenshot({path:`${out}/${name}-${consent}-full.png`})
   }catch(e){row.error=e.message;await page.screenshot({path:`${out}/${name}-${consent}-failure.png`})}
   evidence.push(row);await fs.writeFile(`${out}/evidence.json`,JSON.stringify(evidence,null,2));await context.close()
  }
  await browser.close()
 }
 await fs.writeFile(`${out}/evidence.json`,JSON.stringify(evidence,null,2));console.log(JSON.stringify(evidence,null,2));assert.ok(evidence.every(e=>!e.error),'All browser scenarios must pass')
}
main().catch(e=>{console.error(e);process.exitCode=1})
