# Hero Usage Inventory

## HeroWrapper Instances

| Route | Variant | Overrides | CTA Slots |
| --- | --- | --- | --- |
| /ashford-pub | default | — | primary slot, secondary slot |
| /bedfont-pub | default | — | primary slot, secondary slot |
| /beer-garden | default | tags=[ { label: '🛬 Every 90 Seconds', variant: 'success' }, { label: '📸 Photo Opportunities', variant: 'primary' }, { label: '🐕 Dog Friendly', variant: 'default' }, { label: '🍺 Full Bar Service', variant: 'default' } ] | primary slot, secondary slot |
| `/blog/${params.slug}` | feature | tags=post.tags.map(tag => ({ label: tag, variant: 'default' as const, href: `/blog/tag/${tag}` })) | secondary slot |
| /blog | feature | — | info slot |
| `/blog/tag/${params.tag}` | feature | breadcrumbs=[ { name: 'Blog', href: '/blog' }, { name: displayName } ] | info slot |
| /blog/tags | feature | breadcrumbs=[ { name: 'Blog', href: '/blog' }, { name: 'All Topics' } ] | secondary slot |
| /book-event | promo | — | primary slot |
| /book-table | default | breadcrumbs=[ { name: 'Home', href: '/' }, { name: 'Booking' } ]<br/>tags=[ { label: 'Easy Online Booking', icon: '📅', size: 'small' }, { label: 'Instant Confirmation', icon: '✅', size: 'small' }, { label: 'Sunday Roasts', icon: '🍽️', size: 'small' } ] | — |
| /book-table | default | statusBarPosition=above | primary slot, secondary slot |
| /cash-bingo | promo | tags=[ { label: '💷 £10 cash-only books', variant: 'default' }, { label: '🎯 Snowball grows every month', variant: 'primary' }, { label: '🍽️ Full menu 6 pm–9 pm', variant: 'default' } ] | primary slot, secondary slot |
| /corporate-events | promo | tags=[ { label: "✈️ 7 mins from Heathrow", variant: "success" }, { label: "🚗 Free Parking", variant: "default" }, { label: "📊 AV Equipment", variant: "default" }, { label: "🚫 Outside ULEZ", variant: "success" } ] | primary slot, secondary slot |
| /demo-header | default (implicit) | — | — |
| /drinks/baby-guinness | default (implicit) | overlay=gradient<br/>className=min-h-[40vh]<br/>breadcrumbs=[ { name: 'Drinks', href: '/drinks' }, { name: 'Baby Guinness' } ] | — |
| /drinks/managers-special | promo | tags=heroTags<br/>breadcrumbs=[ { name: 'Drinks', href: '/drinks' }, { name: "Manager's Special" } ] | primary slot, secondary slot |
| /drinks | default | tags=[ { label: '🍺 Real Ales', variant: 'default' }, { label: '🥃 Premium Spirits', variant: 'default' }, { label: '🍷 Wine Selection', variant: 'default' }, { label: '🍹 Cocktails', variant: 'primary' } ] | primary slot, secondary slot |
| /egham-pub | default | — | primary slot, secondary slot |
| /feltham-pub | default | — | primary slot, secondary slot |
| /find-us | default | tags=[ { label: "🏡 Independent village pub minutes from Heathrow", variant: "default" }, { label: "✈️ Horton Road plane-spotting area", variant: "primary" }, { label: "🚗 Free Parking", variant: "success" } ] | primary slot, secondary slot |
| /food-menu | default | breadcrumbs=[{ name: 'Food & Drink' }]<br/>tags=[ { label: '🍖 Roast pre-orders', variant: 'default' }, { label: '🍕 2-for-1 Pizza Tuesday', variant: 'default' }, { label: '🍺 Pub classics', variant: 'default' }, { label: '🌱 Veggie friendly', variant: 'default' } ] | primary slot, secondary slot, info slot |
| /food/fish-and-chips | default | tags=[ { label: "🐟 Fresh Cod Daily", variant: "success" }, { label: "👴 50% Off Fridays for Over 65s", variant: "warning" }, { label: "🍟 Triple-Cooked Chips", variant: "default" }, { label: "⏱️ Cooked Fresh in 15 mins", variant: "primary" } ] | primary slot, secondary slot, info slot |
| /function-room-hire | promo | tags=[ { label: "🏢 Multiple Spaces", variant: "default" }, { label: "💷 Flexible Pricing", variant: "success" }, { label: "🚗 Free Parking", variant: "default" }, { label: "📍 Near Heathrow", variant: "success" } ] | primary slot, secondary slot |
| /heathrow-hotels-pub | default | — | primary slot, secondary slot |
| /heathrow-layover-dining | default | breadcrumbs=[ { name: 'Near Heathrow', href: '/near-heathrow' }, { name: 'Layover Dining' } ]<br/>tags=[ { label: '✈️ 7 mins from T5', variant: 'success' }, { label: '⏱️ 90-min itineraries', variant: 'default' }, { label: '🍽️ Full menu served fast', variant: 'default' }, { label: '🚗 Free parking', variant: 'default' } ] | primary slot, secondary slot |
| /heathrow-parking | default | tags=[ { label: '💳 PayPal checkout', variant: 'primary' }, { label: '🕗 24/7 access', variant: 'success' }, { label: '🚘 CCTV monitored', variant: 'default' }, { label: '📍 Stanwell Moor', variant: 'warning' } ] | primary slot, secondary slot, info slot |
| /m25-junction-14-pub | default | — | primary slot, secondary slot |
| /near-heathrow | default | breadcrumbs=[ { name: 'Near Heathrow' } ]<br/>tags=[ { label: '✈️ 7 mins from T5', variant: 'success' }, { label: '🚗 Free Parking', variant: 'default' }, { label: '🍽️ Full Menu', variant: 'default' }, { label: '⏰ Late Opening', variant: 'default' }, { label: '📶 Free WiFi', variant: 'default' } ] | primary slot, secondary slot |
| /near-heathrow/terminal-2 | default | breadcrumbs=[ { name: 'Near Heathrow', href: '/near-heathrow' }, { name: 'Terminal 2' } ]<br/>tags=[ { label: "Just 11 minutes away", variant: "warning" } ] | primary slot, secondary slot |
| /near-heathrow/terminal-3 | default | tags=[ { label: "Just 11 minutes away", variant: "warning" } ] | primary slot, secondary slot |
| /near-heathrow/terminal-4 | default | tags=[ { label: "Just 12 minutes away", variant: "warning" } ] | primary slot, secondary slot |
| /near-heathrow/terminal-5 | default | tags=[ { label: '✈️ Just 7 minutes away', variant: 'success' }, { label: '🇬🇧 British Airways Terminal', variant: 'primary' } ] | primary slot, secondary slot |
| / | dark | className=hero-focal<br/>style={ '--hero-ox': `${focal.x}%`, '--hero-oy-mobile': `${focal.yMobile}%`, '--hero-oy-desktop': `${focal.yDesktop}%` } as CSSProperties<br/>tags=[ { label: 'Free Parking', icon: '🚗', size: 'small', className: 'bg-white/15 text-white backdrop-blur-sm border border-white/10' }, { label: 'Dog Friendly', icon: '🐕', size: 'small', className: 'bg-white/15 text-white backdrop-blur-sm border border-white/10' }, { label: 'Family Welcome', icon: '👨‍👩‍👧‍👦', size: 'small', className: 'bg-white/15 text-white backdrop-blur-sm border border-white/10' }, { label: 'Step-Free Access', icon: '♿', size: 'small', className: 'bg-white/15 text-white backdrop-blur-sm border border-white/10' }, { label: '7 mins from Heathrow', icon: '✈️', size: 'small', className: 'bg-white/15 text-white backdrop-blur-sm border border-white/10' } ]<br/>showStatusBar=false<br/>showBreadcrumbs=false | primary slot, secondary slot |
| /pizza-tuesday | promo | tags=[ { label: "🔥 BOGOF 6pm–9pm", variant: "success" }, { label: "From £7.49 per pizza", variant: "warning" }, { label: "7 mins from Heathrow", variant: "default" } ] | primary slot, secondary slot |
| /plane-spotting-heathrow | default | tags=[ { label: '✈️ A380 & Dreamliner Views', variant: 'primary' }, { label: '🍺 Full Bar Service', variant: 'default' }, { label: '🆓 Free Parking', variant: 'success' }, { label: '📶 Free WiFi', variant: 'default' } ] | primary slot, secondary slot |
| /privacy-policy | default (implicit) | — | — |
| /private-party-venue | promo | tags=[ { label: "🎉 10-200 Guests", variant: "success" }, { label: "🎂 All Occasions", variant: "default" }, { label: "🚗 Free Parking", variant: "default" }, { label: "🍽️ Custom Menus", variant: "success" } ] | primary slot, secondary slot, info slot |
| /pubs-in-stanwell | default | tags=[ { label: "🍺 Traditional Local", variant: "success" }, { label: "👨‍👩‍👧‍👦 Family Friendly", variant: "default" }, { label: "🌳 Beer Garden", variant: "primary" }, { label: "🚗 Free Parking", variant: "warning" } ] | primary slot, secondary slot, info slot |
| /quiz-night | promo | tags=[ { label: '📍 7 mins from Heathrow', variant: 'default' }, { label: '🧠 Fresh themes monthly', variant: 'primary' }, { label: '💷 £3 per player · teams up to 6', variant: 'default' } ] | primary slot, secondary slot |
| /restaurants-near-heathrow | default | tags=[ { label: "✅ Free Parking Saves £20-40", variant: "success" }, { label: "⏱️ 7 mins from Terminal 5", variant: "warning" }, { label: "💷 50% Less Than Airport Prices", variant: "primary" }, { label: "🍽️ Cooked Fresh to Order", variant: "default" } ] | primary slot, secondary slot |
| /sitemap-page | feature | — | primary slot, secondary slot |
| /staines-pub | default | tags=[ { label: "📍 Just 8 Minutes from Staines", variant: "warning" } ] | primary slot, secondary slot |
| /stanwell-pub | default | — | primary slot, secondary slot |
| /sunday-lunch | default | tags=[ { label: "Served Sundays 12pm–5pm", variant: "warning" }, { label: "£5 Deposit Secures Table", variant: "default" }, { label: "Free Parking • Family Friendly", variant: "default" } ] | primary slot, secondary slot, info slot |
| /whats-on/drag-shows | promo | tags=[ { label: '👑 7PM Start', variant: 'default' }, { label: '🎭 Live Performance', variant: 'default' }, { label: '🏳️‍🌈 Everyone Welcome', variant: 'default' }, { label: '🍹 Themed Cocktails', variant: 'default' } ] | primary slot, secondary slot |
| /whats-on | promo | tags=[ { label: '👑 Drag Shows', variant: 'primary' }, { label: '🧠 Quiz Night £3', variant: 'warning' }, { label: '🎱 Pool & Darts FREE', variant: 'default' }, { label: '🍺 Great Atmosphere', variant: 'success' } ] | primary slot, secondary slot |
| /windsor-pub | default | — | primary slot, secondary slot |

## Direct HeroSection Usage

- app/christmas-parties/client-components.tsx
