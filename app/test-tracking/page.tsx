'use client'

import { useState, useEffect } from 'react'

// Note: Since this is a client component, we can't export metadata directly
// The page title is set in the component itself
import Link from 'next/link'
import { 
  trackPhoneCall, 
  trackTableBookingClick, 
  trackWhatsAppClick,
  trackNavigationClick,
  trackDirectionsClick,
  trackMenuView,
  trackScrollDepth,
  trackEventView,
  trackEventBookingStart,
  trackReviewClick,
  trackOpeningHoursCheck,
  trackFlightStatusCheck,
  trackFormStart,
  trackFormComplete,
  pushToDataLayer
} from '@/lib/gtm-events'
import { Button, Card, CardBody, CardHeader, CardTitle, Alert, Section } from '@/components/ui'
import { Info, Phone, MessageCircle, Navigation, Calendar, Menu, Scroll, Star, Clock, Plane, FileText } from 'lucide-react'
import { WhatsAppLink } from '@/components/WhatsAppLink'
import { BookTableButton } from '@/components/BookTableButton'

export default function TestTrackingPage() {
  const [events, setEvents] = useState<any[]>([])
  const [dataLayer, setDataLayer] = useState<any[]>([])
  const [scrollDepth, setScrollDepth] = useState(0)
  const debugEnabled = process.env.NEXT_PUBLIC_STATUSBAR_DEBUG === 'true'
  const logDebug = (...args: any[]) => {
    if (debugEnabled) {
      console.debug(...args)
    }
  }

  // Set page title
  useEffect(() => {
    document.title = 'GTM Tracking Test Page | The Anchor'
  }, [])

  // Listen to dataLayer pushes
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Initialize dataLayer if it doesn't exist
    window.dataLayer = window.dataLayer || []
    const dataLayer = window.dataLayer

    // Store original push method
    const originalPush = dataLayer.push.bind(dataLayer)

    // Override push method to capture events
    dataLayer.push = function (...args: any[]) {
      const result = originalPush(...args)

      if (debugEnabled) {
        console.debug('🎯 GTM Event', args[0])
      }

      setEvents(prev => [...prev, { ...args[0], timestamp: new Date().toISOString() }])
      setDataLayer(Array.from(dataLayer))

      return result
    }

    // Set initial dataLayer state
    setDataLayer([...dataLayer])

    return () => {
      if (dataLayer) {
        dataLayer.push = originalPush
      }
    }
  }, [debugEnabled])

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100)
      setScrollDepth(scrollPercent)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const clearEvents = () => {
    setEvents([])
  }

  const testPhoneCall = (context: string) => {
    logDebug(`📞 Testing phone call from: ${context}`)
    trackPhoneCall(context)
  }

  const testTableBooking = (source: string) => {
    logDebug(`🍽️ Testing table booking from: ${source}`)
    trackTableBookingClick(source)
  }

  const testWhatsApp = (context: string) => {
    logDebug(`💬 Testing WhatsApp click from: ${context}`)
    trackWhatsAppClick(context)
  }

  const testNavigation = (label: string, url: string, level: 'main' | 'dropdown' = 'main') => {
    logDebug(`🧭 Testing navigation click: ${label}`)
    trackNavigationClick({
      label,
      url,
      level,
      deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop',
      isExternal: url.startsWith('http'),
      location: 'header'
    })
  }

  const testDirections = (from: string) => {
    logDebug(`🗺️ Testing directions click from: ${from}`)
    trackDirectionsClick(from)
  }

  const testMenuView = (type: 'food' | 'drinks' | 'sunday') => {
    logDebug(`📋 Testing menu view: ${type}`)
    trackMenuView(type)
  }

  const testScrollDepthMilestone = (milestone: number) => {
    logDebug(`📜 Testing scroll depth: ${milestone}%`)
    trackScrollDepth(milestone)
  }

  const testEventTracking = () => {
    logDebug('🎉 Testing event tracking')
    trackEventView({
      eventId: 'test-event-123',
      eventName: 'Test Music Night',
      eventDate: '2024-03-15',
      eventCategory: 'live-music',
      eventPrice: 15
    })
  }

  const testEventBooking = () => {
    logDebug('🎫 Testing event booking')
    trackEventBookingStart({
      eventId: 'test-event-123',
      eventName: 'Test Music Night',
      eventPrice: 15
    })
  }

  const testReview = (platform: string) => {
    logDebug(`⭐ Testing review click: ${platform}`)
    trackReviewClick(platform)
  }

  const testBusinessFeatures = () => {
    logDebug('🕐 Testing opening hours check')
    trackOpeningHoursCheck()
    
    logDebug('✈️ Testing flight status check')
    trackFlightStatusCheck('Terminal 5')
  }

  const testFormTracking = () => {
    logDebug('📝 Testing form tracking')
    trackFormStart('test-contact-form')
    setTimeout(() => {
      trackFormComplete('test-contact-form')
    }, 1000)
  }

  const testCustomEvent = () => {
    logDebug('🔧 Testing custom event')
    pushToDataLayer({
      event: 'custom_test_event',
      event_category: 'Test',
      event_label: 'Manual Test',
      custom_parameter: 'test_value',
      timestamp: new Date().toISOString()
    })
  }

  return (
    <Section spacing="lg" container containerSize="xl" className="bg-background min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold">GTM Tracking Test Page</h1>

        {/* Instructions */}
        <Alert variant="info" icon={<Info className="h-4 w-4" />} title="Testing Instructions">
          <div className="space-y-2">
            <p>1. Open Google Tag Manager in Preview Mode</p>
            <p>2. Connect to this page using the preview URL</p>
            <p>3. Click the test buttons below to trigger events</p>
            <p>4. Check GTM Debug panel to see events firing</p>
            <p>5. Events will also appear in the console and the event log below</p>
          </div>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Controls */}
          <div className="space-y-6">
            {/* Contact Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Tracking
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">Test phone, WhatsApp, and email tracking</p>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Phone Calls:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => testPhoneCall('header')}>
                      Header Phone
                    </Button>
                    <Button size="sm" onClick={() => testPhoneCall('footer')}>
                      Footer Phone
                    </Button>
                    <Button size="sm" onClick={() => testPhoneCall('contact-page')}>
                      Contact Page
                    </Button>
                    <Button size="sm" onClick={() => testPhoneCall('mobile-sticky')}>
                      Mobile Sticky
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">WhatsApp:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => testWhatsApp('header')}>
                      Header WhatsApp
                    </Button>
                    <Button size="sm" onClick={() => testWhatsApp('footer')}>
                      Footer WhatsApp
                    </Button>
                    <Button size="sm" onClick={() => testWhatsApp('mobile-menu')}>
                      Mobile Menu
                    </Button>
                  </div>
                  <div className="mt-2">
                    <WhatsAppLink phone="01753 863970" source="test-page" className="text-sm">
                      Test WhatsApp Component
                    </WhatsAppLink>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Email:</p>
                  <a 
                    href="mailto:manager@the-anchor.pub" 
                    onClick={() => logDebug('📧 Email link clicked')}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    manager@the-anchor.pub
                  </a>
                </div>
              </CardBody>
            </Card>

            {/* Table Booking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Table Booking
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">Test table booking from different contexts</p>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => testTableBooking('hero-section')}>
                    Hero Section
                  </Button>
                  <Button size="sm" onClick={() => testTableBooking('header')}>
                    Header
                  </Button>
                  <Button size="sm" onClick={() => testTableBooking('cta-section')}>
                    CTA Section
                  </Button>
                  <Button size="sm" onClick={() => testTableBooking('mobile-sticky')}>
                    Mobile Sticky
                  </Button>
                </div>
                <div className="mt-2">
                  <BookTableButton source="test-page" context="test-page" />
                </div>
              </CardBody>
            </Card>

            {/* Navigation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Navigation & Directions
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">Test navigation clicks and directions</p>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Navigation Clicks:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => testNavigation('Home', '/')}>
                      Home
                    </Button>
                    <Button size="sm" onClick={() => testNavigation('Food Menu', '/food-menu')}>
                      Food Menu
                    </Button>
                    <Button size="sm" onClick={() => testNavigation('Drinks', '/drinks', 'dropdown')}>
                      Drinks (Dropdown)
                    </Button>
                    <Button size="sm" onClick={() => testNavigation('Facebook', 'https://facebook.com', 'main')}>
                      External Link
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Get Directions:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => testDirections('home-page')}>
                      Home Page
                    </Button>
                    <Button size="sm" onClick={() => testDirections('terminal-5-page')}>
                      Terminal 5 Page
                    </Button>
                    <Button size="sm" onClick={() => testDirections('find-us-page')}>
                      Find Us Page
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Menu & Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Menu className="h-5 w-5" />
                  Menu & Content Tracking
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">Test menu views and content engagement</p>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Menu Views:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => testMenuView('food')}>
                      Food Menu
                    </Button>
                    <Button size="sm" onClick={() => testMenuView('drinks')}>
                      Drinks Menu
                    </Button>
                    <Button size="sm" onClick={() => testMenuView('sunday')}>
                      Sunday Menu
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Scroll Depth:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => testScrollDepthMilestone(25)}>
                      25%
                    </Button>
                    <Button size="sm" onClick={() => testScrollDepthMilestone(50)}>
                      50%
                    </Button>
                    <Button size="sm" onClick={() => testScrollDepthMilestone(75)}>
                      75%
                    </Button>
                    <Button size="sm" onClick={() => testScrollDepthMilestone(100)}>
                      100%
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Current scroll: {scrollDepth}%</p>
                </div>
              </CardBody>
            </Card>

            {/* Events & Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Events & Reviews
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">Test event tracking and review interactions</p>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Event Tracking:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={testEventTracking}>
                      View Event
                    </Button>
                    <Button size="sm" onClick={testEventBooking}>
                      Start Booking
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Review Clicks:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => testReview('google')}>
                      Google
                    </Button>
                    <Button size="sm" onClick={() => testReview('tripadvisor')}>
                      TripAdvisor
                    </Button>
                    <Button size="sm" onClick={() => testReview('facebook')}>
                      Facebook
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Business Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Business Features
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">Test business-specific tracking</p>
              </CardHeader>
              <CardBody className="space-y-3">
                <Button size="sm" onClick={testBusinessFeatures}>
                  Test All Business Features
                </Button>
                <div className="text-xs text-muted-foreground">
                  Tests: Opening Hours & Flight Status
                </div>
              </CardBody>
            </Card>

            {/* Forms & Custom */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Forms & Custom Events
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">Test form tracking and custom events</p>
              </CardHeader>
              <CardBody className="space-y-3">
                <Button size="sm" onClick={testFormTracking}>
                  Test Form Tracking
                </Button>
                <Button size="sm" onClick={testCustomEvent}>
                  Fire Custom Event
                </Button>
              </CardBody>
            </Card>

            {/* Social Media Links */}
            <Card>
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Test social media click tracking</p>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <a 
                    href="https://facebook.com/theanchorpub" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={() => logDebug('📘 Facebook clicked')}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Facebook
                  </a>
                  <a 
                    href="https://instagram.com/theanchorpub" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={() => logDebug('📷 Instagram clicked')}
                    className="text-sm text-pink-600 hover:underline"
                  >
                    Instagram
                  </a>
                  <a 
                    href="https://twitter.com/theanchorpub" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={() => logDebug('🐦 Twitter clicked')}
                    className="text-sm text-blue-400 hover:underline"
                  >
                    Twitter
                  </a>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Event Log & DataLayer */}
          <div className="space-y-6">
            {/* Event Log */}
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle>Event Log</CardTitle>
              </CardHeader>
              <div className="px-6 py-2">
                <p className="text-sm text-gray-600">
                  Recent GTM events (newest first)
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={clearEvents}
                    className="ml-4"
                  >
                    Clear
                  </Button>
                </p>
              </div>
              <CardBody className="h-[500px] overflow-y-auto pt-0">
                <div className="space-y-2">
                  {events.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No events yet. Click buttons to trigger events.</p>
                  ) : (
                    events.reverse().map((event, index) => (
                      <div key={index} className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold">{event.event}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <pre className="text-xs overflow-x-auto">
                          {JSON.stringify(event, null, 2)}
                        </pre>
                      </div>
                    ))
                  )}
                </div>
              </CardBody>
            </Card>

            {/* DataLayer Contents */}
            <Card>
              <CardHeader>
                <CardTitle>Current DataLayer</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Full contents of window.dataLayer</p>
              </CardHeader>
              <CardBody className="max-h-[400px] overflow-y-auto">
                <pre className="text-xs">
                  {JSON.stringify(dataLayer, null, 2)}
                </pre>
              </CardBody>
            </Card>

            {/* Console Instructions */}
            <Alert variant="info" icon={<Info className="h-4 w-4" />} title="Console Debugging">
              <div className="space-y-2 text-sm">
                <p>Open browser console to see detailed event logs:</p>
                <code className="block bg-muted p-2 rounded text-xs">
                  window.dataLayer
                </code>
                <p>To manually push an event:</p>
                <code className="block bg-muted p-2 rounded text-xs">
                  {`window.dataLayer.push({ event: 'test_event', category: 'Test' })`}
                </code>
              </div>
            </Alert>
          </div>
        </div>

        {/* Extra content for scroll testing */}
        <div className="mt-16 space-y-8">
          <h2 className="text-2xl font-bold">Scroll Down to Test Scroll Tracking</h2>
          <p className="text-muted-foreground">This extra content allows you to test scroll depth tracking.</p>
          {[...Array(10)].map((_, i) => (
            <div key={i} className="p-8 bg-muted rounded-lg">
              <h3 className="text-lg font-semibold">Section {i + 1}</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}
