#!/usr/bin/env node
const assert=require('node:assert/strict')
const fs=require('node:fs/promises')
const {chromium,webkit}=require('playwright')
const base='http://127.0.0.1:3138',out='/tmp/anchor-growth/tables'
async function main(){
 const results=[]
 for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
  const browser=await engine.launch({headless:true});const context=await browser.newContext({viewport:{width:390,height:844}})
  await context.route('**/*',r=>{
   const url=new URL(r.request().url());if(url.origin===base)return r.continue()
   if(url.hostname==='challenges.cloudflare.com'&&url.pathname.includes('/api.js'))return r.fulfill({contentType:'application/javascript',body:`const callbacks={};window.turnstile={render:(e,o)=>{const id='test-'+Object.keys(callbacks).length;callbacks[id]=o.callback;setTimeout(()=>o.callback('isolated-test-token'),0);return id},remove:()=>{},reset:id=>{setTimeout(()=>callbacks[id]?.('isolated-test-token'),0)},getResponse:()=> 'isolated-test-token',isExpired:()=>false,ready:f=>f(),execute:()=>{}};const cb=new URL(document.currentScript.src).searchParams.get('onload');if(cb&&window[cb])window[cb]();`})
   return r.abort()
  })
  const page=await context.newPage();page.setDefaultTimeout(20000);const row={browser:name,flow:process.env.BOOKING_GROWTH_TWO_SCREEN==='true'?'two-screen':'legacy'}
  try{
   await page.goto(base+'/book-table?date=2026-10-08&time=13:00&party_size=4&purpose=drinks',{waitUntil:'domcontentloaded',timeout:120000})
   await page.getByRole('button',{name:/^Reject( All| all cookies)?$/i}).click()
   await page.getByRole('button',{name:'Find a table',exact:true}).click()
   if (process.env.BOOKING_GROWTH_TWO_SCREEN === 'true') assert.equal(await page.getByRole('checkbox',{name:/^Just drinks/}).isChecked(),true)
   await page.getByRole('button',{name:/^1pm,/}).click()
   await page.getByRole('button',{name:/^Continue( with.*)?$/}).click()
   await page.getByLabel('Mobile Number',{exact:true}).fill('07700900000')
   await page.getByRole('button',{name:'Continue',exact:true}).click()
   await page.getByLabel('First Name',{exact:true}).fill('Synthetic')
   await page.getByLabel('Email address',{exact:true}).fill('synthetic@example.invalid')
   const review = page.getByRole('button',{name:'Continue to review',exact:true})
   if (await review.count()) await review.click()
   await page.clock.install();await page.clock.fastForward(15000)
   await page.getByRole('checkbox',{name:/I understand The Anchor.s booking and no-show policy/}).check()
   await page.getByRole('button',{name:'Confirm booking',exact:true}).click()
   await page.getByText("You're all booked in, see you soon!",{exact:true}).waitFor()
   const evidence=await (await fetch(base+'/__booking_growth_test')).json()
   const request=evidence.tableRequests.at(-1).payload
   assert.equal(request.purpose,'drinks');assert.equal(request.party_size,4);assert.equal(request.date,'2026-10-08');assert.equal(request.time,'13:00')
   row.passed=true;row.forwarded={purpose:request.purpose,party_size:request.party_size,date:request.date,time:request.time}
   await page.screenshot({path:`${out}/${name}-full-table-confirmed.png`})
  }catch(e){row.error=e.message;await page.screenshot({path:`${out}/${name}-full-table-failure.png`})}
  results.push(row);await fs.writeFile(out+(process.env.BOOKING_GROWTH_TWO_SCREEN==='true'?'/full-table-two-screen-evidence.json':'/full-table-evidence.json'),JSON.stringify(results,null,2));await context.close();await browser.close()
 }
 console.log(JSON.stringify(results,null,2));assert.ok(results.every(r=>r.passed))
}
main().catch(e=>{console.error(e);process.exitCode=1})
