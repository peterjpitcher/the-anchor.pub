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
  const page=await context.newPage();page.setDefaultTimeout(20000);const row={browser:name}
  try{
   await page.goto(base+'/events/fixture-open',{waitUntil:'domcontentloaded',timeout:120000})
   await page.getByRole('button',{name:/^Reject( All| all cookies)?$/i}).click()
   const form=page.locator('#event-booking')
   await form.getByLabel('First name',{exact:true}).fill('Synthetic')
   await form.getByLabel('Last name',{exact:true}).fill('Guest')
   await form.getByLabel('Email address',{exact:true}).fill('synthetic@example.invalid')
   await form.getByLabel('Mobile number',{exact:true}).fill('07700900000')
   await form.getByLabel('Would you like to discuss food?').selectOption('before_event')
   await form.getByLabel('I would like to discuss arriving early').check()
   await page.clock.install();await page.clock.fastForward(15000)
   await form.getByRole('button',{name:'Reserve my seats',exact:true}).click()
   await form.getByText('Event booking confirmed',{exact:true}).waitFor()
   await form.getByText(/request has been recorded for the team/).waitFor()
   const evidence=await (await fetch(base+'/__booking_growth_test')).json()
   const request=evidence.eventRequests.at(-1)
   assert.equal(request.dining_request,'before_event');assert.equal(request.early_arrival_request,true)
   row.passed=true;row.forwarded={dining_request:request.dining_request,early_arrival_request:request.early_arrival_request};
   await page.screenshot({path:`${out}/${name}-event-request-confirmed.png`})
  }catch(e){row.error=e.message;await page.screenshot({path:`${out}/${name}-event-request-failure.png`})}
  results.push(row);await fs.writeFile(out+'/event-request-evidence.json',JSON.stringify(results,null,2));await context.close();await browser.close()
 }
 console.log(JSON.stringify(results,null,2));assert.ok(results.every(r=>r.passed))
}
main().catch(e=>{console.error(e);process.exitCode=1})
