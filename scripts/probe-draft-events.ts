
import fs from 'fs'
import path from 'path'
import { AnchorAPI } from '../lib/api'

// Load env vars from .env.local
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/)
        if (match) {
            process.env[match[1]] = match[2].replace(/^"|"$/g, '')
        }
    })
}

const api = new AnchorAPI(process.env.ANCHOR_API_KEY)

async function probe() {
    console.log('Probing API for draft events...')
    const now = new Date()
    const future = new Date()
    future.setDate(future.getDate() + 365) // 1 year out

    const baseParams = {
        from_date: now.toISOString().split('T')[0],
        to_date: future.toISOString().split('T')[0],
        limit: 5
    }

    const variations = [
        { name: 'Standard', params: {} },
        { name: 'status=all', params: { status: 'all' } },
        { name: 'status=draft', params: { status: 'draft' } },
        { name: 'include_drafts=true', params: { include_drafts: 'true' } },
        { name: 'draft=true', params: { draft: 'true' } },
        { name: 'state=draft', params: { state: 'draft' } },
        { name: 'show_drafts=true', params: { show_drafts: 'true' } }
    ]

    for (const v of variations) {
        console.log(`\nTesting variation: ${v.name}`)
        try {
            // @ts-ignore
            const res = await api.getEvents({ ...baseParams, ...v.params })
            const events = res.events || []
            console.log(`Found ${events.length} events`)
            const drafts = events.filter(e => e.eventStatus?.toLowerCase().includes('draft'))
            const others = events.filter(e => !e.eventStatus?.toLowerCase().includes('scheduled'))
            if (drafts.length > 0) {
                console.log('SUCCESS: Found draft events!')
                console.log(drafts.map(e => `${e.name} (${e.eventStatus})`))
            }
            if (others.length > 0) {
                console.log('Found non-scheduled events:', others.map(e => `${e.name} (${e.eventStatus})`))
            }
        } catch (e: any) {
            console.log('Error:', e.message)
        }
    }
}

probe()
