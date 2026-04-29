# Review Pack: seo-implementation

**Generated:** 2026-04-21
**Mode:** B (A=Adversarial / B=Code / C=Spec Compliance)
**Project root:** `/Users/peterpitcher/Cursor/OJ-The-Anchor.pub`
**Base ref:** `HEAD`
**HEAD:** `f4d7a89`
**Diff range:** `HEAD`
**Stats:**  48 files changed, 544 insertions(+), 2103 deletions(-)

> This pack is the sole input for reviewers. Do NOT read files outside it unless a specific finding requires verification. If a file not in the pack is needed, mark the finding `Needs verification` and describe what would resolve it.

## Changed Files

```
.claude/fix-function/brief.md
.claude/fix-function/final-report.md
.claude/fix-function/phase-1/qa-specialist/test-matrix.md
.gitignore
.superpowers/brainstorm/62983-1773235742/.server-info
.superpowers/brainstorm/62983-1773235742/.server.pid
.superpowers/brainstorm/62983-1773235742/approaches.html
.superpowers/brainstorm/62983-1773235742/architecture.html
.superpowers/brainstorm/62983-1773235742/confirmation-page.html
.superpowers/brainstorm/62983-1773235742/confirmation-v2.html
.superpowers/brainstorm/62983-1773235742/flow.html
.superpowers/brainstorm/62983-1773235742/waiting.html
app/blog/[slug]/page.tsx
app/book-table/page.tsx
app/components/head.tsx
app/components/page.tsx
app/debug-hours/head.tsx
app/debug-hours/page.tsx
app/demo-header/head.tsx
app/demo-header/page.tsx
app/food-menu/gluten-free/page.tsx
app/food-menu/page.tsx
app/food-menu/vegan/page.tsx
app/food-menu/vegetarian/page.tsx
app/gtm-debug/head.tsx
app/gtm-debug/page.tsx
app/karaoke/page.tsx
app/layout.tsx
app/live-music/page.tsx
app/live-sport/page.tsx
app/music-bingo/page.tsx
app/near-heathrow/page.tsx
app/private-hire/christenings/page.tsx
app/private-hire/page.tsx
app/private-hire/wakes/page.tsx
app/quiz-night/page.tsx
app/robots.ts
app/sitemap.ts
app/stanwell-pub/page.tsx
app/sunday-lunch/page.tsx
app/test-gtm/head.tsx
app/test-gtm/page.tsx
app/test-hours/head.tsx
app/test-hours/page.tsx
app/test-navigation-tracking/head.tsx
app/test-navigation-tracking/page.tsx
app/test-reviews/head.tsx
app/test-reviews/page.tsx
app/test-simple/head.tsx
app/test-simple/page.tsx
app/test-tracking/head.tsx
app/test-tracking/page.tsx
app/whats-on/page.tsx
components/FilteredUpcomingEventsClient.tsx
config/redirects/blog-redirects.json
config/redirects/wix-redirects.json
docs/SSOT-Review-The-Anchor.docx
docs/architecture/README.md
docs/architecture/data-model.md
docs/architecture/env-vars.md
docs/architecture/overview.md
docs/architecture/relationships.md
docs/architecture/routes.md
docs/architecture/server-actions.md
docs/extract-docx-v2.mjs
docs/extract-docx.mjs
docs/generate-ssot-docx.mjs
docs/gsc-coverage-fix-spec.md
docs/qa-reviews/2026-04-04-seo-revenue-bug-hunter-report.md
docs/qa-reviews/2026-04-04-seo-revenue-security-auditor-report.md
docs/seo-audit-2026-04-04.md
docs/seo-powerhouse/phase-1-strategy/competitor-landscape.md
docs/seo-powerhouse/phase-1-strategy/keyword-framework.md
docs/seo-powerhouse/phase-1-strategy/opportunity-map.md
docs/seo-powerhouse/phase-1-strategy/strategy-document.md
docs/seo-powerhouse/phase-3-deep-dive/copywriter/page-recommendations.md
docs/seo-powerhouse/phase-3-deep-dive/ux-cro/report.md
docs/ssot-review-spec.json
lib/local-seo-data.ts
lib/schema-with-reviews.ts
lib/schema.ts
tasks/implement-plan/wave-1/blog-template-cta/handoff.md
tasks/implement-plan/wave-1/brand-local-pages/handoff.md
tasks/implement-plan/wave-1/events-pages/handoff.md
tasks/implement-plan/wave-1/food-booking-pages/handoff.md
tasks/implement-plan/wave-1/private-hire/handoff.md
tasks/implement-plan/wave-1/technical-foundation/handoff.md
tasks/review-book-table/phase-1/business-rules-auditor/report.md
tasks/review-book-table/phase-1/consolidated-defect-log.md
tasks/review-book-table/phase-1/qa-specialist/report.md
tasks/review-book-table/phase-1/qa-specialist/test-matrix.md
tasks/review-book-table/phase-1/remediation-plan.md
tasks/review-book-table/phase-1/structural-mapper/report.md
tasks/review-book-table/phase-1/technical-architect/report.md
tasks/review-book-table/phase-2/implementation/changes-log.md
```

## User Concerns

Verify SEO metadata, schema JSON-LD, blog CTA conditional logic, booking date prefill, no broken imports.

## Diff (`HEAD`)

```diff
diff --git a/.gitignore b/.gitignore
index e4fc838..51f62a7 100644
--- a/.gitignore
+++ b/.gitignore
@@ -85,3 +85,4 @@ temp/
 
 # Prevent accidental website folder creation
 website/
+.claude/session-context.md
diff --git a/app/blog/[slug]/page.tsx b/app/blog/[slug]/page.tsx
index 6e5c9fe..94d3163 100644
--- a/app/blog/[slug]/page.tsx
+++ b/app/blog/[slug]/page.tsx
@@ -10,6 +10,7 @@ import { HeroWrapper } from '@/components/hero/HeroWrapper'
 import { getBlogHeroUrl } from '@/lib/blog-image'
 import { jsonLdSafeStringify } from '@/lib/jsonld'
 import { getTwitterMetadata } from '@/lib/twitter-metadata'
+import { BookTableButton } from '@/components/BookTableButton'
 
 export const revalidate = 3600
 
@@ -85,6 +86,24 @@ function extractFaqEntries(markdown: string): Array<{ question: string; answer:
   return entries
 }
 
+/**
+ * Tags that indicate a Heathrow/plane-spotting/travel post where a booking CTA is relevant.
+ * Also catches posts by slug pattern (e.g. "plane-spotting-heathrow-guide" which uses generic tags).
+ */
+const HEATHROW_CTA_TAGS = new Set([
+  'heathrow',
+  'plane-spotting',
+  'parking',
+  'travel',
+])
+
+const HEATHROW_SLUG_KEYWORDS = ['heathrow', 'plane', 'parking', 'aviation', 'airport', 'layover']
+
+function shouldShowHeathrowBookingCta(slug: string, tags: string[]): boolean {
+  if (tags.some((tag) => HEATHROW_CTA_TAGS.has(tag))) return true
+  return HEATHROW_SLUG_KEYWORDS.some((kw) => slug.includes(kw))
+}
+
 export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
   const post = await getBlogPost(params.slug)
   
@@ -160,6 +179,8 @@ export default async function BlogPostPage({ params }: { params: { slug: string
 
   const faqEntries = extractFaqEntries(post.content)
 
+  const showHeathrowCta = shouldShowHeathrowBookingCta(post.slug, post.tags)
+
   // BlogPosting structured data for better SEO
   const blogPostingSchema = {
     "@context": "https://schema.org",
@@ -365,6 +386,32 @@ export default async function BlogPostPage({ params }: { params: { slug: string
         </div>
       </Section>
 
+      {/* Heathrow / Plane-Spotting Booking CTA — only shown for relevant posts */}
+      {showHeathrowCta && (
+        <Section spacing="md" container containerSize="md" className="bg-anchor-bg-card border-y border-anchor-gold/20">
+          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
+            <div className="flex-1">
+              <h2 className="text-xl font-bold text-anchor-gold-vivid mb-2">
+                Visiting Heathrow? The Anchor is 5 minutes away
+              </h2>
+              <p className="text-anchor-cream-text/70">
+                Book a table for lunch in our beer garden — great food, cold drinks, and a proper base for a day of spotting.
+              </p>
+            </div>
+            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
+              <BookTableButton source="blog_heathrow_cta" context="heathrow_visitor" size="md">
+                Book a Table
+              </BookTableButton>
+              <Link href="/food-menu">
+                <Button variant="secondary" size="md">
+                  View Food Menu
+                </Button>
+              </Link>
+            </div>
+          </div>
+        </Section>
+      )}
+
       {/* Share Section */}
       <Section background="gray" spacing="sm" container containerSize="md" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
         <div className="text-center">
@@ -414,16 +461,41 @@ export default async function BlogPostPage({ params }: { params: { slug: string
           Experience everything we write about firsthand. Join us for great food, drinks, and atmosphere!
         </p>
         <div className="flex flex-col sm:flex-row gap-4 justify-center">
-          <Link href="/find-us">
-            <Button variant="outline" size="lg" className="!text-white !border-white hover:!bg-white hover:!text-anchor-green">
-              Get Directions
-            </Button>
-          </Link>
-          <Link href="/blog">
-            <Button variant="outline" size="lg" className="!text-white !border-white hover:!bg-white hover:!text-anchor-green">
-              More Stories
-            </Button>
-          </Link>
+          {showHeathrowCta ? (
+            <>
+              <BookTableButton
+                source="blog_footer_cta"
+                context="heathrow_visitor"
+                size="lg"
+                className="!bg-anchor-gold !text-anchor-dark hover:!bg-anchor-gold-light"
+              >
+                Book a Table
+              </BookTableButton>
+              <Link href="/food-menu">
+                <Button variant="outline" size="lg" className="!text-white !border-white hover:!bg-white hover:!text-anchor-green">
+                  View Food Menu
+                </Button>
+              </Link>
+              <Link href="/find-us">
+                <Button variant="outline" size="lg" className="!text-white !border-white hover:!bg-white hover:!text-anchor-green">
+                  Get Directions
+                </Button>
+              </Link>
+            </>
+          ) : (
+            <>
+              <Link href="/find-us">
+                <Button variant="outline" size="lg" className="!text-white !border-white hover:!bg-white hover:!text-anchor-green">
+                  Get Directions
+                </Button>
+              </Link>
+              <Link href="/blog">
+                <Button variant="outline" size="lg" className="!text-white !border-white hover:!bg-white hover:!text-anchor-green">
+                  More Stories
+                </Button>
+              </Link>
+            </>
+          )}
         </div>
       </Section>
     </>
diff --git a/app/book-table/page.tsx b/app/book-table/page.tsx
index 228ffb4..cb00717 100644
--- a/app/book-table/page.tsx
+++ b/app/book-table/page.tsx
@@ -13,16 +13,16 @@ import { RegretReduction, ValueProofStrip } from '@/components/psychology'
 import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
 
 export const metadata: Metadata = {
-  title: 'Book a Table at The Anchor | Near Heathrow | Free Parking',
-  description: 'Book a table at The Anchor near Heathrow with instant confirmation. Pub classics from £8.95, Sunday roasts from £19. Free parking, dog-friendly, 7 mins from T5. Walk-ins welcome.',
+  title: 'Book a Table Near Heathrow | Sunday Roast | The Anchor',
+  description: 'Reserve your table at The Anchor, Stanwell Moor — instant confirmation. Pub food from £8.95, Sunday roast from £19. Dog-friendly, free parking, 7 mins from T5.',
   openGraph: {
-    title: 'Book a Table at The Anchor | Near Heathrow | Free Parking',
-    description: 'Book a table at The Anchor near Heathrow with instant confirmation. Pub classics from £8.95, Sunday roasts from £19. Free parking, dog-friendly, 7 mins from T5. Walk-ins welcome.',
+    title: 'Book a Table Near Heathrow | Sunday Roast | The Anchor',
+    description: 'Reserve your table at The Anchor, Stanwell Moor — instant confirmation. Pub food from £8.95, Sunday roast from £19. Dog-friendly, free parking, 7 mins from T5.',
     images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }]
   },
   twitter: getTwitterMetadata({
-    title: 'Book a Table at The Anchor | Near Heathrow | Free Parking',
-    description: 'Book a table at The Anchor near Heathrow with instant confirmation. Pub classics from £8.95, Sunday roasts from £19. Free parking, dog-friendly, 7 mins from T5. Walk-ins welcome.',
+    title: 'Book a Table Near Heathrow | Sunday Roast | The Anchor',
+    description: 'Reserve your table at The Anchor, Stanwell Moor — instant confirmation. Pub food from £8.95, Sunday roast from £19. Dog-friendly, free parking, 7 mins from T5.',
     images: [DEFAULT_PAGE_HEADER_IMAGE]
   }),
   alternates: {
@@ -111,27 +111,27 @@ export default function BookPage({ searchParams }: BookTablePageProps) {
         variant="default"
         statusBarPosition="above"
         primaryCta={
+          <Link href="#booking-form">
+            <Button
+              variant="primary"
+              size="lg"
+              className="w-full sm:w-auto"
+            >
+              Book Online
+            </Button>
+          </Link>
+        }
+        secondaryCta={
           <PhoneButton
             phone="01753 682707"
             source="book_table_hero"
-            variant="primary"
+            variant="outline"
             size="lg"
-            className="w-full sm:w-auto"
+            className="w-full sm:w-auto !bg-white/10 !text-white !border-white/30 hover:!bg-white/20"
           >
             Prefer to call? 01753 682707
           </PhoneButton>
         }
-        secondaryCta={
-          <Link href="/find-us">
-            <Button
-              variant="outline"
-              size="lg"
-              className="w-full sm:w-auto !bg-white/10 !text-white !border-white/30 hover:!bg-white/20"
-            >
-              Find Us
-            </Button>
-          </Link>
-        }
         image={{
           src: DEFAULT_PAGE_HEADER_IMAGE,
           alt: 'The Anchor pub - book a table',
@@ -166,7 +166,7 @@ export default function BookPage({ searchParams }: BookTablePageProps) {
         </p>
       </Section>
 
-      <Section background="gray" spacing="sm" container containerSize="lg" className="bg-anchor-bg-raised">
+      <Section id="booking-form" background="gray" spacing="sm" container containerSize="lg" className="bg-anchor-bg-raised">
         <div className="grid items-start gap-5 lg:gap-8 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
           <div className="order-1">
             <div className="mb-4">
diff --git a/app/components/head.tsx b/app/components/head.tsx
deleted file mode 100644
index 65fb7ac..0000000
--- a/app/components/head.tsx
+++ /dev/null
@@ -1,8 +0,0 @@
-export default function Head() {
-  return (
-    <>
-      <meta name="robots" content="noindex,nofollow" />
-    </>
-  )
-}
-
diff --git a/app/components/page.tsx b/app/components/page.tsx
deleted file mode 100644
index 0f3d5c0..0000000
--- a/app/components/page.tsx
+++ /dev/null
@@ -1,415 +0,0 @@
-'use client'
-
-import { useState } from 'react'
-import {
-  Button,
-  Card,
-  CardHeader,
-  CardTitle,
-  CardBody,
-  CardFooter,
-  Input,
-  Alert,
-  Badge,
-  Container,
-  Section,
-  Grid,
-  GridItem,
-  Tabs,
-  TabsList,
-  TabsTrigger,
-  TabsContent,
-  Breadcrumb,
-  NavBar,
-  Form,
-  FormField,
-  FormSection,
-  Select,
-  Checkbox,
-  CheckboxGroup,
-  Radio,
-  RadioGroup,
-  DatePicker,
-  Switch,
-  Modal,
-  ModalHeader,
-  ModalTitle,
-  ModalBody,
-  ModalFooter,
-  Tooltip,
-  Popover,
-  PopoverBody,
-  Spinner,
-  Skeleton,
-  LoadingOverlay,
-  useToast,
-  ToastProvider
-} from '@/components/ui'
-
-function ComponentsPageContent() {
-  const [modalOpen, setModalOpen] = useState(false)
-  const [loading, setLoading] = useState(false)
-  const { toast } = useToast()
-
-  return (
-    <div>
-      <NavBar
-        logo={{ src: '/logo.png', alt: 'The Anchor' }}
-        items={[
-          { label: 'Home', href: '/' },
-          { label: 'Components', href: '/components' },
-          { label: 'Documentation', href: '/docs' }
-        ]}
-      />
-
-      <Section spacing="lg">
-        <Container size="xl">
-          <div className="mb-8">
-            <h1 className="text-4xl font-bold text-gray-900 mb-4">
-              Component Library Showcase
-            </h1>
-            <p className="text-lg text-gray-700">
-              Explore all the standardized React components available in The Anchor website.
-            </p>
-          </div>
-
-          <Tabs defaultValue="buttons" className="space-y-8">
-            <TabsList>
-              <TabsTrigger value="buttons">Buttons</TabsTrigger>
-              <TabsTrigger value="cards">Cards</TabsTrigger>
-              <TabsTrigger value="forms">Forms</TabsTrigger>
-              <TabsTrigger value="feedback">Feedback</TabsTrigger>
-              <TabsTrigger value="overlays">Overlays</TabsTrigger>
-              <TabsTrigger value="loading">Loading</TabsTrigger>
-            </TabsList>
-
-            <TabsContent value="buttons" className="space-y-6">
-              <Card>
-                <CardHeader>
-                  <CardTitle>Button Variants</CardTitle>
-                </CardHeader>
-                <CardBody>
-                  <div className="flex flex-wrap gap-4">
-                    <Button variant="primary">Primary</Button>
-                    <Button variant="secondary">Secondary</Button>
-                    <Button variant="ghost">Ghost</Button>
-                    <Button variant="outline">Outline</Button>
-                    <Button variant="danger">Danger</Button>
-                  </div>
-                </CardBody>
-              </Card>
-
-              <Card>
-                <CardHeader>
-                  <CardTitle>Button Sizes</CardTitle>
-                </CardHeader>
-                <CardBody>
-                  <div className="flex items-center gap-4">
-                    <Button size="sm">Small</Button>
-                    <Button size="md">Medium</Button>
-                    <Button size="lg">Large</Button>
-                  </div>
-                </CardBody>
-              </Card>
-
-              <Card>
-                <CardHeader>
-                  <CardTitle>Button States</CardTitle>
-                </CardHeader>
-                <CardBody>
-                  <div className="flex flex-wrap gap-4">
-                    <Button loading>Loading</Button>
-                    <Button disabled>Disabled</Button>
-                    <Button fullWidth>Full Width</Button>
-                  </div>
-                </CardBody>
-              </Card>
-            </TabsContent>
-
-            <TabsContent value="cards" className="space-y-6">
-              <Grid cols={3} gap="md">
-                <Card>
-                  <CardHeader>
-                    <CardTitle>Default Card</CardTitle>
-                  </CardHeader>
-                  <CardBody>
-                    This is a default card with standard styling.
-                  </CardBody>
-                  <CardFooter>
-                    <Button size="sm">Action</Button>
-                  </CardFooter>
-                </Card>
-
-                <Card variant="outlined">
-                  <CardHeader>
-                    <CardTitle>Outlined Card</CardTitle>
-                  </CardHeader>
-                  <CardBody>
-                    This card has a more prominent border.
-                  </CardBody>
-                </Card>
-
-                <Card variant="elevated">
-                  <CardHeader>
-                    <CardTitle>Elevated Card</CardTitle>
-                  </CardHeader>
-                  <CardBody>
-                    This card has a shadow for elevation.
-                  </CardBody>
-                </Card>
-              </Grid>
-            </TabsContent>
-
-            <TabsContent value="forms" className="space-y-6">
-              <Card>
-                <CardHeader>
-                  <CardTitle>Form Components</CardTitle>
-                </CardHeader>
-                <CardBody>
-                  <Form onSubmit={async (formData) => {
-                    const name = formData.get('name')?.toString() || 'Guest'
-                    toast({
-                      variant: 'success',
-                      title: 'Form submitted',
-                      description: `Thanks, ${name}! We received your details.`
-                    })
-                  }}>
-                    <FormSection title="Text Inputs">
-                      <Grid cols={2} gap="md">
-                        <FormField>
-                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
-                          <Input id="name" name="name" placeholder="Enter your name" required />
-                        </FormField>
-                        <FormField>
-                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
-                          <Input id="email" name="email" type="email" placeholder="email@example.com" required />
-                        </FormField>
-                      </Grid>
-                    </FormSection>
-
-                    <FormSection title="Selection Controls">
-                      <Grid cols={2} gap="md">
-                        <FormField>
-                          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
-                          <Select
-                            id="country"
-                            name="country"
-                            defaultValue=""
-                          >
-                            <option value="">Choose a country</option>
-                            <option value="uk">United Kingdom</option>
-                            <option value="us">United States</option>
-                            <option value="ca">Canada</option>
-                          </Select>
-                        </FormField>
-                        <FormField>
-                          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
-                          <DatePicker id="date" name="date" />
-                        </FormField>
-                      </Grid>
-
-                      <CheckboxGroup
-                        label="Interests"
-                        options={[
-                          { value: 'entertainment', label: 'Entertainment' },
-                          { value: 'food', label: 'Food & Drink' },
-                          { value: 'events', label: 'Special Events' }
-                        ]}
-                      />
-
-                      <RadioGroup
-                        name="newsletter"
-                        label="Newsletter Frequency"
-                        options={[
-                          { value: 'daily', label: 'Daily' },
-                          { value: 'weekly', label: 'Weekly' },
-                          { value: 'monthly', label: 'Monthly' }
-                        ]}
-                      />
-
-                      <Switch name="notifications" label="Enable notifications" />
-                    </FormSection>
-
-                    <div className="flex justify-end gap-4 mt-6">
-                      <Button type="button" variant="ghost">Cancel</Button>
-                      <Button type="submit" variant="primary">Submit</Button>
-                    </div>
-                  </Form>
-                </CardBody>
-              </Card>
-            </TabsContent>
-
-            <TabsContent value="feedback" className="space-y-6">
-              <Card>
-                <CardHeader>
-                  <CardTitle>Alerts</CardTitle>
-                </CardHeader>
-                <CardBody className="space-y-4">
-                  <Alert variant="info">
-                    This is an informational alert message.
-                  </Alert>
-                  <Alert variant="success" title="Success!">
-                    Your action has been completed successfully.
-                  </Alert>
-                  <Alert variant="warning" title="Warning">
-                    Please review this important information.
-                  </Alert>
-                  <Alert variant="error" title="Error" onClose={() => {}}>
-                    Something went wrong. Please try again.
-                  </Alert>
-                </CardBody>
-              </Card>
-
-              <Card>
-                <CardHeader>
-                  <CardTitle>Badges</CardTitle>
-                </CardHeader>
-                <CardBody>
-                  <div className="flex flex-wrap gap-2">
-                    <Badge>Default</Badge>
-                    <Badge variant="primary">Primary</Badge>
-                    <Badge variant="secondary">Secondary</Badge>
-                    <Badge variant="success">Success</Badge>
-                    <Badge variant="warning">Warning</Badge>
-                    <Badge variant="error">Error</Badge>
-                    <Badge variant="success" dot>Active</Badge>
-                  </div>
-                </CardBody>
-              </Card>
-            </TabsContent>
-
-            <TabsContent value="overlays" className="space-y-6">
-              <Card>
-                <CardHeader>
-                  <CardTitle>Modal & Overlays</CardTitle>
-                </CardHeader>
-                <CardBody>
-                  <div className="flex flex-wrap gap-4">
-                    <Button onClick={() => setModalOpen(true)}>
-                      Open Modal
-                    </Button>
-
-                    <Tooltip content="This is a helpful tooltip">
-                      <Button variant="secondary">Hover for Tooltip</Button>
-                    </Tooltip>
-
-                    <Popover
-                      trigger="click"
-                      content={
-                        <PopoverBody>
-                          <p className="font-semibold mb-2">Popover Content</p>
-                          <p className="text-sm text-gray-700">
-                            This is a popover with rich content support.
-                          </p>
-                        </PopoverBody>
-                      }
-                    >
-                      <Button variant="outline">Click for Popover</Button>
-                    </Popover>
-
-                    <Button
-                      variant="ghost"
-                      onClick={() => {
-                        toast({
-                          variant: 'success',
-                          title: 'Toast notification',
-                          description: 'This is a toast message!'
-                        })
-                      }}
-                    >
-                      Show Toast
-                    </Button>
-                  </div>
-                </CardBody>
-              </Card>
-            </TabsContent>
-
-            <TabsContent value="loading" className="space-y-6">
-              <Card>
-                <CardHeader>
-                  <CardTitle>Loading States</CardTitle>
-                </CardHeader>
-                <CardBody>
-                  <div className="space-y-6">
-                    <div>
-                      <h4 className="font-semibold mb-4">Spinners</h4>
-                      <div className="flex items-center gap-4">
-                        <Spinner size="sm" />
-                        <Spinner size="md" />
-                        <Spinner size="lg" />
-                        <Spinner size="xl" color="secondary" />
-                      </div>
-                    </div>
-
-                    <div>
-                      <h4 className="font-semibold mb-4">Skeletons</h4>
-                      <div className="space-y-4">
-                        <Skeleton variant="text" count={3} />
-                        <div className="flex gap-4">
-                          <Skeleton variant="circular" className="h-12 w-12" />
-                          <div className="flex-1">
-                            <Skeleton variant="text" width="md" />
-                            <Skeleton variant="text" width="sm" className="mt-2" />
-                          </div>
-                        </div>
-                      </div>
-                    </div>
-
-                    <div>
-                      <h4 className="font-semibold mb-4">Loading Overlay</h4>
-                      <Button
-                        onClick={() => {
-                          setLoading(true)
-                          setTimeout(() => setLoading(false), 3000)
-                        }}
-                      >
-                        Show Loading Overlay
-                      </Button>
-                    </div>
-                  </div>
-                </CardBody>
-              </Card>
-            </TabsContent>
-          </Tabs>
-        </Container>
-      </Section>
-
-      <Modal open={modalOpen} onClose={() => setModalOpen(false)} size="md">
-        <ModalHeader>
-          <ModalTitle>Example Modal</ModalTitle>
-        </ModalHeader>
-        <ModalBody>
-          <p>This is an example modal dialog with focus management and keyboard navigation.</p>
-          <p className="mt-2 text-sm text-gray-700">
-            Press ESC to close or click the close button.
-          </p>
-        </ModalBody>
-        <ModalFooter>
-          <Button variant="ghost" onClick={() => setModalOpen(false)}>
-            Cancel
-          </Button>
-          <Button variant="primary" onClick={() => {
-            setModalOpen(false)
-            toast({
-              variant: 'success',
-              title: 'Action confirmed',
-              description: 'Modal action was successful!'
-            })
-          }}>
-            Confirm
-          </Button>
-        </ModalFooter>
-      </Modal>
-
-      <LoadingOverlay visible={loading} message="Loading content..." />
-    </div>
-  )
-}
-
-export default function ComponentsPage() {
-  return (
-    <ToastProvider>
-      <ComponentsPageContent />
-    </ToastProvider>
-  )
-}
diff --git a/app/debug-hours/head.tsx b/app/debug-hours/head.tsx
deleted file mode 100644
index 65fb7ac..0000000
--- a/app/debug-hours/head.tsx
+++ /dev/null
@@ -1,8 +0,0 @@
-export default function Head() {
-  return (
-    <>
-      <meta name="robots" content="noindex,nofollow" />
-    </>
-  )
-}
-
diff --git a/app/debug-hours/page.tsx b/app/debug-hours/page.tsx
deleted file mode 100644
index 93696b1..0000000
--- a/app/debug-hours/page.tsx
+++ /dev/null
@@ -1,85 +0,0 @@
-'use client'
-
-import { useState, useEffect } from 'react'
-import { StatusBar } from '@/components/layout/StatusBar'
-import { HeaderStatusSectionDirect } from '@/components/layout/HeaderStatusSectionDirect'
-import { useBusinessHours } from '@/hooks/useBusinessHours'
-import { Section } from '@/components/ui'
-
-export default function DebugHoursPage() {
-  const [apiData, setApiData] = useState<any>(null)
-  const [error, setError] = useState<string | null>(null)
-  const { hours, loading, error: hookError } = useBusinessHours()
-  const debugEnabled = process.env.NEXT_PUBLIC_STATUSBAR_DEBUG === 'true'
-
-  useEffect(() => {
-    // Direct API call
-    fetch('/api/business-hours')
-      .then(res => res.json())
-      .then(data => {
-        if (debugEnabled) {
-          console.debug('[DebugHours] API Response', data)
-        }
-        setApiData(data)
-      })
-      .catch(err => {
-        if (debugEnabled) {
-          console.error('[DebugHours] API Error', err)
-        }
-        setError(err.message)
-      })
-  }, [debugEnabled])
-
-  return (
-    <>
-      <Section spacing="sm" container>
-        <div className="space-y-2">
-          <h1 className="text-2xl font-bold text-anchor-green">Business Hours Debug</h1>
-          <p className="text-sm text-gray-600">
-            Use this internal page to verify the status bar, business hour hooks, and API payloads.
-            Enable `NEXT_PUBLIC_STATUSBAR_DEBUG` for verbose console logs.
-          </p>
-        </div>
-      </Section>
-
-      <Section spacing="md" container containerSize="md" className="space-y-8">
-        <div>
-          <h2 className="text-xl font-semibold mb-2">StatusBar Component (navigation variant)</h2>
-          <StatusBar variant="navigation" />
-        </div>
-
-        <div>
-          <h2 className="text-xl font-semibold mb-2">StatusBar Component (default variant)</h2>
-          <StatusBar />
-        </div>
-
-        <div>
-          <h2 className="text-xl font-semibold mb-2">StatusBar Component (hero variant)</h2>
-          <StatusBar variant="hero" />
-        </div>
-
-        <div>
-          <h2 className="text-xl font-semibold mb-2">HeaderStatusSectionDirect Component</h2>
-          <HeaderStatusSectionDirect />
-        </div>
-
-        <div>
-          <h2 className="text-xl font-semibold mb-2">useBusinessHours Hook</h2>
-          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
-            {JSON.stringify({ hours, loading, error: hookError }, null, 2)}
-          </pre>
-        </div>
-
-        <div>
-          <h2 className="text-xl font-semibold mb-2">Direct API Response</h2>
-          {error && <p className="text-red-600">Error: {error}</p>}
-          {apiData && (
-            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
-              {JSON.stringify(apiData, null, 2)}
-            </pre>
-          )}
-        </div>
-      </Section>
-    </>
-  )
-}
diff --git a/app/demo-header/head.tsx b/app/demo-header/head.tsx
deleted file mode 100644
index 65fb7ac..0000000
--- a/app/demo-header/head.tsx
+++ /dev/null
@@ -1,8 +0,0 @@
-export default function Head() {
-  return (
-    <>
-      <meta name="robots" content="noindex,nofollow" />
-    </>
-  )
-}
-
diff --git a/app/demo-header/page.tsx b/app/demo-header/page.tsx
deleted file mode 100644
index 53235c5..0000000
--- a/app/demo-header/page.tsx
+++ /dev/null
@@ -1,42 +0,0 @@
-import { HeroWrapper } from '@/components/hero'
-import { Section } from '@/components/ui'
-
-export default function DemoHeaderPage() {
-  return (
-    <>
-      <HeroWrapper
-        route="/demo-header"
-        title="Demo Header Page"
-        description="This page demonstrates the new header image system"
-        size="small"
-        showStatusBar={true}
-      />
-      
-      <Section spacing="lg" container className="bg-white">
-        <h2 className="text-3xl font-bold mb-4">How to Use Page Headers</h2>
-        <ol className="list-decimal list-inside space-y-2 max-w-3xl">
-          <li>Place any image file in the corresponding folder in <code className="bg-gray-100 px-2 py-1 rounded">/public/images/page-headers/[folder-name]/</code></li>
-          <li>The folder name matches the route (e.g., <code className="bg-gray-100 px-2 py-1 rounded">whats-on</code> for <code className="bg-gray-100 px-2 py-1 rounded">/whats-on</code>)</li>
-          <li>The image can have any name - the system will find the first image in the folder</li>
-          <li>Supported formats: .jpg, .jpeg, .png, .webp</li>
-          <li>If no image is found, a default image will be used</li>
-        </ol>
-        
-        <h3 className="text-2xl font-bold mt-8 mb-4">Available Folders:</h3>
-        <ul className="list-disc list-inside space-y-1 max-w-3xl">
-          <li><code className="bg-gray-100 px-2 py-1 rounded">home/</code> - Homepage</li>
-          <li><code className="bg-gray-100 px-2 py-1 rounded">whats-on/</code> - What's On page</li>
-          <li><code className="bg-gray-100 px-2 py-1 rounded">food-menu/</code> - Food Menu page</li>
-          <li><code className="bg-gray-100 px-2 py-1 rounded">drinks/</code> - Drinks page</li>
-          <li><code className="bg-gray-100 px-2 py-1 rounded">sunday-lunch/</code> - Sunday Lunch page</li>
-          <li><code className="bg-gray-100 px-2 py-1 rounded">find-us/</code> - Find Us page</li>
-          <li><code className="bg-gray-100 px-2 py-1 rounded">private-hire/</code> - Private Hire page</li>
-          <li><code className="bg-gray-100 px-2 py-1 rounded">near-heathrow-terminal-[1-5]/</code> - Terminal pages</li>
-          <li><code className="bg-gray-100 px-2 py-1 rounded">hotel-near-heathrow/</code> - Hotels page</li>
-          <li><code className="bg-gray-100 px-2 py-1 rounded">taxi-from-heathrow/</code> - Taxi page</li>
-          <li><code className="bg-gray-100 px-2 py-1 rounded">parking-near-heathrow/</code> - Parking page</li>
-        </ul>
-      </Section>
-    </>
-  )
-}
diff --git a/app/food-menu/gluten-free/page.tsx b/app/food-menu/gluten-free/page.tsx
index f56aa88..52f607d 100644
--- a/app/food-menu/gluten-free/page.tsx
+++ b/app/food-menu/gluten-free/page.tsx
@@ -469,6 +469,11 @@ export default async function GlutenFreeMenuPage() {
           title="Hungry? Book Your Table Now"
           description="Reserve online or call ahead — we will have your table ready."
           buttons={[
+            {
+              text: 'Book a Table',
+              href: '/book-table',
+              variant: 'white',
+            },
             {
               text: 'Call: 01753 682707',
               href: 'tel:+441753682707',
@@ -494,18 +499,57 @@ export default async function GlutenFreeMenuPage() {
       <script
         type="application/ld+json"
         dangerouslySetInnerHTML={{
-          __html: jsonLdSafeStringify({
-            '@context': 'https://schema.org',
-            '@type': 'FAQPage',
-            mainEntity: faqItems.map((faq) => ({
-              '@type': 'Question',
-              name: faq.question,
-              acceptedAnswer: {
-                '@type': 'Answer',
-                text: faq.answer,
+          __html: jsonLdSafeStringify([
+            {
+              '@context': 'https://schema.org',
+              '@type': 'FAQPage',
+              mainEntity: faqItems.map((faq) => ({
+                '@type': 'Question',
+                name: faq.question,
+                acceptedAnswer: {
+                  '@type': 'Answer',
+                  text: faq.answer,
+                },
+              })),
+            },
+            {
+              '@context': 'https://schema.org',
+              '@type': 'Restaurant',
+              '@id': 'https://www.the-anchor.pub/#business',
+              name: 'The Anchor',
+              description: 'Traditional British pub near Heathrow Airport with gluten-free pub food options including GF pizza bases, naturally gluten-free puddings and sides.',
+              servesCuisine: ['British', 'Pizza', 'Pub Food'],
+              hasMenu: {
+                '@type': 'Menu',
+                name: 'Gluten-Free Menu',
+                url: 'https://www.the-anchor.pub/food-menu/gluten-free',
+                description: 'Gluten-free pub food options at The Anchor near Heathrow — GF pizza bases, naturally gluten-free puddings and sides, no surcharge.',
+              },
+              address: {
+                '@type': 'PostalAddress',
+                streetAddress: 'Horton Road',
+                addressLocality: 'Stanwell Moor',
+                addressRegion: 'Surrey',
+                postalCode: 'TW19 6AQ',
+                addressCountry: 'GB',
               },
-            })),
-          }),
+              telephone: '+441753682707',
+              url: 'https://www.the-anchor.pub',
+              priceRange: '££',
+              potentialAction: {
+                '@type': 'ReserveAction',
+                target: {
+                  '@type': 'EntryPoint',
+                  urlTemplate: 'https://www.the-anchor.pub/book-table',
+                  actionPlatform: [
+                    'https://schema.org/DesktopWebPlatform',
+                    'https://schema.org/MobileWebPlatform',
+                  ],
+                },
+                result: { '@type': 'FoodEstablishmentReservation' },
+              },
+            },
+          ]),
         }}
       />
     </>
diff --git a/app/food-menu/page.tsx b/app/food-menu/page.tsx
index 4af0a42..5de45eb 100644
--- a/app/food-menu/page.tsx
+++ b/app/food-menu/page.tsx
@@ -144,7 +144,7 @@ function deriveKitchenStatusData(hours: BusinessHours | null): KitchenStatusData
 
 export const metadata: Metadata = {
   title: 'Where to Eat Near Heathrow Airport | Pub Food Menu | The Anchor',
-  description: 'Where to eat near Heathrow Airport? The Anchor serves fish & chips from £15, stone-baked pizza from £12, burgers from £11 and Sunday roasts from £19. Free parking, 7 mins from T5. Book a table.',
+  description: 'Where to eat near Heathrow Airport? The Anchor serves fish & chips from £15, stone-baked pizza from £12, burgers from £11 and Sunday roasts from £19. Free parking, 7 mins from T5. Book a table online.',
   openGraph: {
     title: 'Where to Eat Near Heathrow Airport | Pub Food Menu | The Anchor',
     description: 'Looking for restaurants near Heathrow? The Anchor serves proper pub food — fish & chips, pizza, pies and Sunday roasts. Free parking, 7 mins from T5. View our menu.',
@@ -657,6 +657,11 @@ export default async function FoodMenuPage() {
           title="Hungry? Book Your Table Now"
           description="Weekends and roast services fill quickly. Book today and we will have your table ready."
           buttons={[
+            {
+              text: 'Book a Table',
+              href: '/book-table',
+              variant: 'white'
+            },
             {
               text: 'Call: 01753 682707',
               href: 'tel:+441753682707',
diff --git a/app/food-menu/vegan/page.tsx b/app/food-menu/vegan/page.tsx
index ee6c775..5a6254b 100644
--- a/app/food-menu/vegan/page.tsx
+++ b/app/food-menu/vegan/page.tsx
@@ -8,6 +8,7 @@ import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
 import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
 import { FoodStickyCtaBar } from '@/components/food/FoodStickyCtaBar'
 import { getTwitterMetadata } from '@/lib/twitter-metadata'
+import { jsonLdSafeStringify } from '@/lib/jsonld'
 import { parseMenuMarkdown, type MenuCategory } from '@/lib/menu-parser'
 import { DietaryMenuNav } from '@/components/food/DietaryMenuNav'
 import { PageTitle } from '@/components/ui/typography/PageTitle'
@@ -549,6 +550,63 @@ export default async function VeganMenuPage() {
         label="Book a Table"
       />
 
+      <script
+        type="application/ld+json"
+        dangerouslySetInnerHTML={{
+          __html: jsonLdSafeStringify([
+            {
+              '@context': 'https://schema.org',
+              '@type': 'FAQPage',
+              mainEntity: faqItems.map((faq) => ({
+                '@type': 'Question',
+                name: faq.question,
+                acceptedAnswer: {
+                  '@type': 'Answer',
+                  text: faq.answer,
+                },
+              })),
+            },
+            {
+              '@context': 'https://schema.org',
+              '@type': 'Restaurant',
+              '@id': 'https://www.the-anchor.pub/#business',
+              name: 'The Anchor',
+              description: 'Traditional British pub near Heathrow Airport with vegan pub food options including stone-baked garlic bread, chips and pizzas made vegan on request.',
+              servesCuisine: ['British', 'Pizza', 'Pub Food'],
+              hasMenu: {
+                '@type': 'Menu',
+                name: 'Vegan Menu',
+                url: 'https://www.the-anchor.pub/food-menu/vegan',
+                description: 'Vegan pub food at The Anchor near Heathrow — garlic bread, chips, sweet potato fries, onion rings and stone-baked pizzas made vegan on request.',
+              },
+              address: {
+                '@type': 'PostalAddress',
+                streetAddress: 'Horton Road',
+                addressLocality: 'Stanwell Moor',
+                addressRegion: 'Surrey',
+                postalCode: 'TW19 6AQ',
+                addressCountry: 'GB',
+              },
+              telephone: '+441753682707',
+              url: 'https://www.the-anchor.pub',
+              priceRange: '££',
+              potentialAction: {
+                '@type': 'ReserveAction',
+                target: {
+                  '@type': 'EntryPoint',
+                  urlTemplate: 'https://www.the-anchor.pub/book-table',
+                  actionPlatform: [
+                    'https://schema.org/DesktopWebPlatform',
+                    'https://schema.org/MobileWebPlatform',
+                  ],
+                },
+                result: { '@type': 'FoodEstablishmentReservation' },
+              },
+            },
+          ]),
+        }}
+      />
+
     </>
   )
 }
diff --git a/app/food-menu/vegetarian/page.tsx b/app/food-menu/vegetarian/page.tsx
index 7e765f1..bb4cacb 100644
--- a/app/food-menu/vegetarian/page.tsx
+++ b/app/food-menu/vegetarian/page.tsx
@@ -10,6 +10,7 @@ import { parseMenuMarkdown, type MenuData, type MenuCategory } from '@/lib/menu-
 import { getBusinessHours, isKitchenOpen } from '@/lib/api'
 import { formatTime12Hour } from '@/lib/time-utils'
 import { getTwitterMetadata } from '@/lib/twitter-metadata'
+import { jsonLdSafeStringify } from '@/lib/jsonld'
 import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
 import { MenuRenderer } from '@/components/MenuRenderer'
 import { DietaryMenuNav } from '@/components/food/DietaryMenuNav'
@@ -518,6 +519,63 @@ export default async function VegetarianMenuPage() {
       {/* FAQ Section */}
       <FAQAccordionWithSchema faqs={faqItems} className="bg-anchor-bg-card" />
 
+      <script
+        type="application/ld+json"
+        dangerouslySetInnerHTML={{
+          __html: jsonLdSafeStringify([
+            {
+              '@context': 'https://schema.org',
+              '@type': 'FAQPage',
+              mainEntity: faqItems.map((faq) => ({
+                '@type': 'Question',
+                name: faq.question,
+                acceptedAnswer: {
+                  '@type': 'Answer',
+                  text: faq.answer,
+                },
+              })),
+            },
+            {
+              '@context': 'https://schema.org',
+              '@type': 'Restaurant',
+              '@id': 'https://www.the-anchor.pub/#business',
+              name: 'The Anchor',
+              description: 'Traditional British pub near Heathrow Airport with a vegetarian menu including pies, pizzas, pasta, burgers and puddings.',
+              servesCuisine: ['British', 'Pizza', 'Pub Food', 'Vegetarian'],
+              hasMenu: {
+                '@type': 'Menu',
+                name: 'Vegetarian Menu',
+                url: 'https://www.the-anchor.pub/food-menu/vegetarian',
+                description: 'Vegetarian pub food at The Anchor near Heathrow — butternut squash pie, stone-baked pizzas, mac and cheese, garden veg burger and more.',
+              },
+              address: {
+                '@type': 'PostalAddress',
+                streetAddress: 'Horton Road',
+                addressLocality: 'Stanwell Moor',
+                addressRegion: 'Surrey',
+                postalCode: 'TW19 6AQ',
+                addressCountry: 'GB',
+              },
+              telephone: '+441753682707',
+              url: 'https://www.the-anchor.pub',
+              priceRange: '££',
+              potentialAction: {
+                '@type': 'ReserveAction',
+                target: {
+                  '@type': 'EntryPoint',
+                  urlTemplate: 'https://www.the-anchor.pub/book-table',
+                  actionPlatform: [
+                    'https://schema.org/DesktopWebPlatform',
+                    'https://schema.org/MobileWebPlatform',
+                  ],
+                },
+                result: { '@type': 'FoodEstablishmentReservation' },
+              },
+            },
+          ]),
+        }}
+      />
+
       {/* Internal links */}
       <Section background="white" spacing="md" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
         <Container>
diff --git a/app/gtm-debug/head.tsx b/app/gtm-debug/head.tsx
deleted file mode 100644
index 65fb7ac..0000000
--- a/app/gtm-debug/head.tsx
+++ /dev/null
@@ -1,8 +0,0 @@
-export default function Head() {
-  return (
-    <>
-      <meta name="robots" content="noindex,nofollow" />
-    </>
-  )
-}
-
diff --git a/app/gtm-debug/page.tsx b/app/gtm-debug/page.tsx
deleted file mode 100644
index d484e19..0000000
--- a/app/gtm-debug/page.tsx
+++ /dev/null
@@ -1,183 +0,0 @@
-'use client'
-
-import { useEffect, useState } from 'react'
-import { Section, Button } from '@/components/ui'
-
-export default function GTMDebugPage() {
-  const [gtmStatus, setGtmStatus] = useState<{
-    loaded: boolean
-    containerId: string | null
-    dataLayerExists: boolean
-    dataLayerEvents: any[]
-    error: string | null
-  }>({
-    loaded: false,
-    containerId: null,
-    dataLayerExists: false,
-    dataLayerEvents: [],
-    error: null
-  })
-  const debugEnabled = process.env.NEXT_PUBLIC_STATUSBAR_DEBUG === 'true'
-
-  useEffect(() => {
-    const checkGTM = () => {
-      try {
-        // Check if dataLayer exists
-        const dataLayerExists = typeof window !== 'undefined' && 'dataLayer' in window
-        
-        // Get dataLayer events
-        const dataLayerEvents = dataLayerExists ? (window as any).dataLayer : []
-        
-        // Check if GTM script is loaded
-        const gtmScripts = Array.from(document.querySelectorAll('script')).filter(
-          script => script.src.includes('googletagmanager.com')
-        )
-        
-        // Extract container ID from script
-        let containerId = null
-        if (gtmScripts.length > 0) {
-          const match = gtmScripts[0].src.match(/id=(GTM-[A-Z0-9]+)/)
-          containerId = match ? match[1] : null
-        }
-        
-        // Check environment variable
-        const envContainerId = process.env.NEXT_PUBLIC_GTM_ID
-        
-        // Log for debugging
-        if (debugEnabled) {
-          console.debug('[GTMDebug] status', {
-            dataLayerExists,
-            dataLayerLength: dataLayerEvents.length,
-            scriptsFound: gtmScripts.length,
-            containerId,
-            envContainerId
-          })
-        }
-        
-        setGtmStatus({
-          loaded: gtmScripts.length > 0,
-          containerId: containerId || envContainerId || null,
-          dataLayerExists,
-          dataLayerEvents,
-          error: null
-        })
-      } catch (error) {
-        setGtmStatus(prev => ({
-          ...prev,
-          error: error instanceof Error ? error.message : 'Unknown error'
-        }))
-      }
-    }
-
-    // Initial check
-    checkGTM()
-
-    // Check again after a delay
-    const timer = setTimeout(checkGTM, 2000)
-    
-    // Check periodically
-    const interval = setInterval(checkGTM, 5000)
-
-    return () => {
-      clearTimeout(timer)
-      clearInterval(interval)
-    }
-  }, [debugEnabled])
-
-  const testDataLayerPush = () => {
-    if (typeof window !== 'undefined' && 'dataLayer' in window) {
-      (window as any).dataLayer.push({
-        event: 'test_event',
-        event_category: 'GTM Debug',
-        event_label: 'Manual Test',
-        timestamp: new Date().toISOString()
-      })
-      
-      // Refresh status after push
-      setTimeout(() => {
-        setGtmStatus(prev => ({
-          ...prev,
-          dataLayerEvents: (window as any).dataLayer
-        }))
-      }, 100)
-    }
-  }
-
-  return (
-    <>
-      <Section spacing="sm" container>
-        <div className="space-y-2">
-          <h1 className="text-3xl font-bold text-anchor-green">GTM Debug Page</h1>
-          <p className="text-sm text-gray-600">
-            Inspect Google Tag Manager loading status, dataLayer pushes, and environment configuration. Enable
-            `NEXT_PUBLIC_STATUSBAR_DEBUG` to stream console output while testing.
-          </p>
-        </div>
-      </Section>
-
-      <Section spacing="md" container containerSize="md" className="space-y-6">
-        <div className="bg-white rounded-lg shadow p-6">
-          <h2 className="text-xl font-semibold mb-4">GTM Status</h2>
-          
-          <div className="space-y-3">
-            <div className="flex items-center gap-2">
-              <span className={`inline-block w-3 h-3 rounded-full ${gtmStatus.loaded ? 'bg-green-500' : 'bg-red-500'}`} />
-              <span className="font-medium">GTM Script Loaded:</span>
-              <span>{gtmStatus.loaded ? 'Yes' : 'No'}</span>
-            </div>
-            
-            <div className="flex items-center gap-2">
-              <span className={`inline-block w-3 h-3 rounded-full ${gtmStatus.dataLayerExists ? 'bg-green-500' : 'bg-red-500'}`} />
-              <span className="font-medium">DataLayer Exists:</span>
-              <span>{gtmStatus.dataLayerExists ? 'Yes' : 'No'}</span>
-            </div>
-            
-            <div>
-              <span className="font-medium">Container ID:</span>
-              <span className="ml-2 font-mono">{gtmStatus.containerId || 'Not found'}</span>
-            </div>
-            
-            <div>
-              <span className="font-medium">Environment Variable (NEXT_PUBLIC_GTM_ID):</span>
-              <span className="ml-2 font-mono">{process.env.NEXT_PUBLIC_GTM_ID || 'Not set'}</span>
-            </div>
-            
-            {gtmStatus.error && (
-              <div className="p-3 bg-red-100 text-red-700 rounded">
-                Error: {gtmStatus.error}
-              </div>
-            )}
-          </div>
-        </div>
-
-        <div className="bg-white rounded-lg shadow p-6">
-          <h2 className="text-xl font-semibold mb-4">DataLayer Events</h2>
-          
-          <Button onClick={testDataLayerPush} className="mb-4">
-            Push Test Event
-          </Button>
-          
-          <div className="max-h-96 overflow-y-auto">
-            <pre className="text-xs bg-gray-100 p-4 rounded">
-              {JSON.stringify(gtmStatus.dataLayerEvents, null, 2)}
-            </pre>
-          </div>
-        </div>
-
-        <div className="bg-white rounded-lg shadow p-6">
-          <h2 className="text-xl font-semibold mb-4">Troubleshooting Steps</h2>
-          
-          <ol className="list-decimal list-inside space-y-2 text-gray-700">
-            <li>Check if NEXT_PUBLIC_GTM_ID is set in your .env.local file</li>
-            <li>Verify the GTM container ID is correct (GTM-WWFQTQS)</li>
-            <li>Check the browser console for any JavaScript errors</li>
-            <li>Use GTM Preview mode to debug tag firing</li>
-            <li>Check network tab to ensure GTM script is loading (should see gtm.js)</li>
-            <li>Verify no ad blockers are preventing GTM from loading</li>
-            <li>Check if the GTM container is published (not just saved)</li>
-          </ol>
-        </div>
-      </Section>
-    </>
-  )
-}
diff --git a/app/karaoke/page.tsx b/app/karaoke/page.tsx
index a5b361c..f6006d5 100644
--- a/app/karaoke/page.tsx
+++ b/app/karaoke/page.tsx
@@ -39,9 +39,9 @@ import { getBusinessStats } from '@/lib/schema-with-reviews'
 import { jsonLdSafeStringify } from '@/lib/jsonld'
 
 export const metadata: Metadata = {
-    title: 'Karaoke Pub Near Heathrow | Friday Nights at The Anchor',
+    title: 'Karaoke Fridays Near Heathrow | Free Entry | The Anchor',
     description:
-        'Looking for a karaoke pub near me? The Anchor hosts karaoke every Friday 8-11pm. 50,000+ songs, hosted by Nikki Manfadge. Free entry, free parking, Stanwell Moor.',
+        'Karaoke every Friday 8–11pm at The Anchor, Stanwell Moor. 50,000+ songs, hosted nights, free entry & free parking. 7 mins from Heathrow T5. Grab the mic tonight.',
     openGraph: {
         title: 'Karaoke Pub Near Heathrow | The Anchor',
         description: '50,000+ songs, hosted by Nikki Manfadge, Fridays 8-11pm. Free entry. Sing your heart out in Stanwell Moor.',
diff --git a/app/layout.tsx b/app/layout.tsx
index 22117da..349a85a 100644
--- a/app/layout.tsx
+++ b/app/layout.tsx
@@ -52,10 +52,10 @@ const merriweather = Merriweather({
 export const metadata: Metadata = {
   metadataBase: new URL('https://www.the-anchor.pub'),
   title: {
-    default: 'The Anchor | Pub Near Heathrow | Stanwell Moor',
+    default: 'The Anchor Pub | Stanwell Moor | Near Heathrow',
     template: '%s | The Anchor Stanwell Moor'
   },
-  description: 'The Anchor in Stanwell Moor — traditional pub near Heathrow Airport. Sunday roasts, quiz nights, Music Bingo, dog-friendly beer garden under the flight path. Free parking, 7 mins from T5.',
+  description: 'The Anchor, Stanwell Moor — rated 4.6/5 on Google. Traditional pub 7 mins from Heathrow T5. Sunday roasts, quiz nights, karaoke Fridays, beer garden & free parking.',
   authors: [{ name: 'The Anchor' }],
   creator: 'The Anchor',
   publisher: 'The Anchor',
diff --git a/app/live-music/page.tsx b/app/live-music/page.tsx
index 464e58d..42e9f4f 100644
--- a/app/live-music/page.tsx
+++ b/app/live-music/page.tsx
@@ -34,6 +34,8 @@ import { cn } from '@/lib/utils'
 import { BookTableButton } from '@/components/BookTableButton'
 import { DEFAULT_EVENT_IMAGE } from '@/lib/image-fallbacks'
 import { getTwitterMetadata } from '@/lib/twitter-metadata'
+import { liveMusicEventSeries } from '@/lib/schema'
+import { jsonLdSafeStringify } from '@/lib/jsonld'
 
 export const metadata: Metadata = {
     title: 'Live Music Pub Near Heathrow | Bands & Open Mic | The Anchor',
@@ -275,6 +277,11 @@ export default async function LiveMusicPage() {
 
     return (
         <>
+            {/* EventSeries JSON-LD Schema */}
+            <script
+                type="application/ld+json"
+                dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify(liveMusicEventSeries) }}
+            />
             <HeroWrapper
                 route="/live-music"
                 title="Live Music at The Anchor"
diff --git a/app/live-sport/page.tsx b/app/live-sport/page.tsx
index 477dd97..3790c7c 100644
--- a/app/live-sport/page.tsx
+++ b/app/live-sport/page.tsx
@@ -15,8 +15,8 @@ import { getBusinessStats } from '@/lib/schema-with-reviews'
 import { jsonLdSafeStringify } from '@/lib/jsonld'
 
 export const metadata: Metadata = {
-    title: 'Watch Live Sport Near Heathrow | Major Tournaments & Events | The Anchor',
-    description: `Watch major sporting events near Heathrow — Six Nations, World Cup, Euros & F1 on big screens at ${BRAND.name}. Free parking, great food, 7 mins from T5.`,
+    title: 'Watch Live Sport Near Heathrow | Big Screens | The Anchor',
+    description: `Watch Six Nations, Euros, F1 & World Cup on big screens at The Anchor, Stanwell Moor. Terrestrial sport, great atmosphere, free parking, 7 mins from Heathrow T5.`,
     openGraph: {
         title: 'Watch Live Sport Near Heathrow — Major Tournaments on Big Screens',
         description: 'Six Nations, World Cup, Euros and F1 on big screens with a cold pint and free parking. 7 mins from Heathrow T5.',
diff --git a/app/music-bingo/page.tsx b/app/music-bingo/page.tsx
index 8efca8e..f28ae1e 100644
--- a/app/music-bingo/page.tsx
+++ b/app/music-bingo/page.tsx
@@ -40,9 +40,9 @@ import { getBusinessStats } from '@/lib/schema-with-reviews'
 import { jsonLdSafeStringify } from '@/lib/jsonld'
 
 export const metadata: Metadata = {
-  title: 'Music Bingo Near Heathrow | Singalong Bingo Night | The Anchor',
+  title: 'Music Bingo Near Heathrow | Win Every Round | The Anchor',
   description:
-    'Play Music Bingo near Heathrow at The Anchor. Song snippets replace numbers, prizes land every round, and booking is recommended for this singalong bingo night in Stanwell Moor.',
+    'Singalong Music Bingo at The Anchor, Stanwell Moor — song snippets replace numbers, prizes every round. Book early, it sells out. 7 mins from Heathrow T5.',
   openGraph: {
     title: 'Music Bingo Near Heathrow | The Anchor',
     description: 'Song snippets replace numbers, prizes every round. Book for this singalong bingo night in Stanwell Moor.',
diff --git a/app/near-heathrow/page.tsx b/app/near-heathrow/page.tsx
index aca8e06..ffdae84 100644
--- a/app/near-heathrow/page.tsx
+++ b/app/near-heathrow/page.tsx
@@ -17,8 +17,8 @@ import { localBusinessSchema } from '@/lib/schema'
 import { FoodStickyCtaBar } from '@/components/food/FoodStickyCtaBar'
 
 export const metadata: Metadata = {
-  title: 'Pubs Near Heathrow Airport | 7 Mins from T5 | Free Parking | The Anchor',
-  description: 'The Anchor — rated 4.6/5 on Google — is the closest traditional pub to Heathrow Airport. 7 mins from T5, free parking, dog-friendly beer garden, Sunday roasts from £19 and food served daily (except Mon).',
+  title: 'Pub Near Heathrow Airport | 7 Mins from T5 | The Anchor',
+  description: 'Rated 4.6/5 on Google. Traditional pub 7 mins from Heathrow T5 — free parking, dog-friendly beer garden, Sunday roasts from £19, quiz nights & live events.',
   openGraph: {
     title: 'Pubs Near Heathrow Airport | 7 Mins from T5 | Free Parking | The Anchor',
     description: 'Rated 4.6/5 on Google. The closest traditional pub to Heathrow — 7 mins from T5, free parking, dog-friendly beer garden and food served daily.',
diff --git a/app/private-hire/christenings/page.tsx b/app/private-hire/christenings/page.tsx
index 6fc656f..be19387 100644
--- a/app/private-hire/christenings/page.tsx
+++ b/app/private-hire/christenings/page.tsx
@@ -17,8 +17,8 @@ import { getCateringData } from '@/lib/api/catering-packages'
 import { CateringPackagesTable } from '@/components/features/CateringPackagesTable'
 
 export const metadata: Metadata = {
-    title: 'Christening Venue Near Staines & Stanwell | The Anchor',
-    description: 'The perfect venue for christening parties and baptism receptions in Stanwell Moor. Family-friendly, buffet options, and free parking for all guests.',
+    title: 'Christening Venue Near Heathrow & Staines | The Anchor',
+    description: 'Private room for christening parties & baptism receptions at The Anchor, Stanwell Moor. Up to 50 guests, buffet options, family-friendly, free parking. Near Heathrow.',
     openGraph: {
         title: 'Christening Party Venue | The Anchor Stanwell Moor',
         description: 'Celebrate your little one\'s special day. Family-friendly venue with private rooms.',
diff --git a/app/private-hire/page.tsx b/app/private-hire/page.tsx
index 579f386..a745c3e 100644
--- a/app/private-hire/page.tsx
+++ b/app/private-hire/page.tsx
@@ -13,6 +13,8 @@ import { InternalLinkingSection } from '@/components/seo/InternalLinkingSection'
 import { getCateringData, getLowestFoodPrice } from '@/lib/api/catering-packages'
 import { CateringPackagesTable } from '@/components/features/CateringPackagesTable'
 import { VenueSpacesTable } from '@/components/features/VenueSpacesTable'
+import { CONTACT, BRAND } from '@/lib/constants'
+import { jsonLdSafeStringify } from '@/lib/jsonld'
 
 export async function generateMetadata(): Promise<Metadata> {
     const { foodPackages } = await getCateringData()
@@ -20,15 +22,15 @@ export async function generateMetadata(): Promise<Metadata> {
     const desc = `Book a function room or party venue near Heathrow for 10-50 guests. Buffets from ${fromPrice}pp, free parking, and a dedicated events team.`
 
     return {
-        title: 'Function Room & Party Venue Near Heathrow | Private Hire | The Anchor',
+        title: 'Private Hire Venue Near Heathrow | Wakes, Parties & Events | The Anchor',
         description: `${desc} The Anchor, Stanwell Moor.`,
         openGraph: {
-            title: 'Function Room & Party Venue Near Heathrow | Private Hire | The Anchor',
+            title: 'Private Hire Venue Near Heathrow | Wakes, Parties & Events | The Anchor',
             description: desc,
             images: [{ url: DEFAULT_CORPORATE_IMAGE, width: 1200, height: 630, alt: 'Private hire venue at The Anchor near Heathrow Airport' }],
         },
         twitter: getTwitterMetadata({
-            title: 'Function Room & Party Venue Near Heathrow | Private Hire | The Anchor',
+            title: 'Private Hire Venue Near Heathrow | Wakes, Parties & Events | The Anchor',
             description: desc,
             images: [DEFAULT_CORPORATE_IMAGE]
         }),
@@ -41,8 +43,52 @@ export async function generateMetadata(): Promise<Metadata> {
 export default async function PrivateHirePage() {
     const { foodPackages, drinkPackages, addonPackages, spaces } = await getCateringData()
     const fromPrice = getLowestFoodPrice(foodPackages) || '£11' // fallback only if API returns no per-head food packages
+
+    const eventVenueSchema = {
+        "@context": "https://schema.org",
+        "@type": "EventVenue",
+        "@id": "https://www.the-anchor.pub/private-hire#venue",
+        "name": `${BRAND.name} Private Hire Venue`,
+        "address": {
+            "@type": "PostalAddress",
+            "streetAddress": CONTACT.address.street,
+            "addressLocality": CONTACT.address.town,
+            "addressRegion": "Surrey",
+            "postalCode": CONTACT.address.postcode,
+            "addressCountry": "GB"
+        },
+        "telephone": CONTACT.phoneIntl,
+        "url": "https://www.the-anchor.pub/private-hire",
+        "description": "Private hire venue near Heathrow for wakes, parties, christenings, corporate events and celebrations. Up to 50 guests, buffet packages available, free parking.",
+        "maximumAttendeeCapacity": 50,
+        "amenityFeature": [
+            { "@type": "LocationFeatureSpecification", "name": "Free Parking", "value": true },
+            { "@type": "LocationFeatureSpecification", "name": "Wheelchair Accessible", "value": true },
+            { "@type": "LocationFeatureSpecification", "name": "Catering", "value": true },
+            { "@type": "LocationFeatureSpecification", "name": "Private Dining Room", "value": true },
+            { "@type": "LocationFeatureSpecification", "name": "AV Equipment", "value": true },
+            { "@type": "LocationFeatureSpecification", "name": "WiFi", "value": true },
+            { "@type": "LocationFeatureSpecification", "name": "Private Bar", "value": true }
+        ],
+        "potentialAction": {
+            "@type": "ReserveAction",
+            "target": {
+                "@type": "EntryPoint",
+                "urlTemplate": "https://www.the-anchor.pub/private-hire#enquiry",
+                "actionPlatform": [
+                    "https://schema.org/DesktopWebPlatform",
+                    "https://schema.org/MobileWebPlatform"
+                ]
+            }
+        }
+    }
+
     return (
         <>
+            <script
+                type="application/ld+json"
+                dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify(eventVenueSchema) }}
+            />
             <BreadcrumbJsonLd
                 items={[
                     { name: 'Home', url: '/' },
diff --git a/app/private-hire/wakes/page.tsx b/app/private-hire/wakes/page.tsx
index 3bf5b5f..424f86e 100644
--- a/app/private-hire/wakes/page.tsx
+++ b/app/private-hire/wakes/page.tsx
@@ -23,8 +23,8 @@ export async function generateMetadata(): Promise<Metadata> {
     const fromPrice = getLowestFoodPrice(wakePackages) || '£12' // fallback only if API returns no wake packages
 
     return {
-        title: 'Wake Venue & Celebration of Life | Near SW Middlesex Crematorium | The Anchor',
-        description: `A peaceful venue for wakes, funeral receptions and celebrations of life near South West Middlesex Crematorium and Staines Cemetery. Private rooms, funeral tea packages from ${fromPrice}pp, free parking and compassionate staff.`,
+        title: 'Wake & Funeral Reception Venue | Near Heathrow | The Anchor',
+        description: `Private room for wakes, funeral teas & celebrations of life near Staines & Heathrow. Up to 50 guests, buffet packages from ${fromPrice}pp, free parking. Compassionate staff.`,

[diff truncated at line 1500 — total was 3440 lines. Consider scoping the review to fewer files.]
```

## Changed File Contents

### `.claude/fix-function/brief.md`

```
# Fix-Function Brief: FAQ Component Background Issue

## Target
- `components/FAQAccordion.tsx` (base component, ~85 lines)
- `components/FAQAccordionWithSchema.tsx` (schema-enhanced variant, ~126 lines)
- ~75 page files that consume FAQAccordionWithSchema
- `app/globals.css` (section-spacing class)
- `components/ui/layout/Section.tsx` (reference for theming pattern)

## Known Problem
The FAQ section on /quiz-night (and other pages) renders with a white (#fff) background, breaking the site's dark pub theme. The root cause: the FAQ components have no default background and rely on callers to pass it via `className`. Four pages pass `className="bg-white"` which is literal Tailwind white.

## Theming Pattern (Source of Truth)
The `Section` component uses CVA variants:
- `background="white"` maps to `bg-anchor-bg-card` (dark themed card bg)
- `background="gray"` maps to `bg-anchor-bg` (dark themed base bg)

The FAQ components bypass this entirely — they use raw `<section className={`section-spacing ${className}`}>`.

## Caller Background Classes Found
- `className="bg-white"` — 4 pages: quiz-night, live-music, karaoke, cash-bingo **[BUG]**
- `className="bg-anchor-bg"` — 9 pages: seasonal event pages **[correct]**
- `className="bg-anchor-bg-card"` — 1 page: food-menu/vegetarian **[correct]**
- No className — ~61 pages **[inherits parent, usually correct]**

## Business Rules
- Site uses a dark pub theme throughout — no literal white backgrounds anywhere
- FAQ sections should visually blend with surrounding content
- The `card-dark` class is used on individual FAQ items inside both components
- Schema markup (JSON-LD FAQPage) must be preserved in FAQAccordionWithSchema

## Priority
Visual consistency across all 75+ pages. The fix must be at the component level so future pages get the correct background by default.
```

### `.claude/fix-function/final-report.md`

```
# Final Report: FAQ Component Background Fix

## What changed

### Root cause
The `FAQAccordionWithSchema` component had no default background and used raw string interpolation for className merging. Four pages passed `className="bg-white"` (literal Tailwind white #fff), making cream-coloured text invisible (~1.1:1 contrast ratio, WCAG 1.4.3 failure).

### Component fix (`components/FAQAccordionWithSchema.tsx`)
1. **Added `cn()` import** from `@/lib/utils` — enables proper Tailwind class merging
2. **Changed section className** from `` `section-spacing ${className}` `` to `cn('section-spacing bg-anchor-bg-card', className)` — provides safe dark default, allows callers to override via `cn()` merge
3. **Added `aria-hidden`** to collapsed answer panels — accessibility improvement
4. **Removed redundant `max-h-0`** class — inline style already controls maxHeight

### Caller fixes (4 files)
Removed `className="bg-white"` from:
- `app/quiz-night/page.tsx:623`
- `app/karaoke/page.tsx:548`
- `app/live-music/page.tsx:556`
- `app/cash-bingo/page.tsx:547`

### Cleanup
- **Deleted `components/FAQAccordion.tsx`** — dead code, zero imports across entire codebase

## Verification
- TypeScript: clean (pre-existing test file errors only, unrelated)
- Build: passes cleanly across all 100+ pages
- Tests: 3/3 pass
- No stale imports of deleted component

## What remains out of scope
- Accordion animation overhaul (hardcoded 500px maxHeight — works for current content)
- Test expansion for schema rendering, accessibility, background safety
- Optional cleanup: remove redundant `className="bg-anchor-bg"` from 11 seasonal pages (now matches default)
```

### `.claude/fix-function/phase-1/qa-specialist/test-matrix.md`

```
# FAQ Accordion Test Matrix

## Component Under Test
- `components/FAQAccordionWithSchema.tsx` (primary -- used by all 70+ pages)
- `components/FAQAccordion.tsx` (base -- unused, zero imports from pages)

## Test Data Reference
- Body background: `#0c1d11` (anchor-bg, set on html/body in globals.css)
- Card background: `#172d1e` (card-dark class in globals.css)
- Cream text: `#f0e6c6` (anchor-cream-text token, body default colour)
- Gold vivid: `#c9a020` (anchor-gold-vivid token)
- Section default className: `""` (empty string) -- inherits body bg `#0c1d11`

---

## TC-01: Default background (no className prop)

| Field | Value |
|---|---|
| **Priority** | P0 -- Critical |
| **Precondition** | Render `<FAQAccordionWithSchema faqs={data} />` with no className |
| **Code path** | `className=""` default -> `section` gets class `section-spacing ` (trailing space) |
| **Expected** | Section inherits body bg `#0c1d11`; cream text `#f0e6c6` visible (contrast ~10:1) |
| **Actual** | PASS -- no background override, body bg shows through |
| **Pages using this** | ~60 pages (majority) |

## TC-02: Passing className="bg-anchor-bg"

| Field | Value |
|---|---|
| **Priority** | P1 -- High |
| **Precondition** | Render with `className="bg-anchor-bg"` |
| **Code path** | Section class becomes `section-spacing bg-anchor-bg` -> `#0c1d11` |
| **Expected** | Explicit bg matches body bg; cream text visible; no visual difference from TC-01 |
| **Actual** | PASS -- redundant but harmless. 9 pages use this pattern. |
| **Pages** | bank-holiday-weekends, st-patricks-day, fathers-day, easter, bonfire-night, halloween, new-years-eve, boxing-day, valentines-day, mothers-day, music-bingo |

## TC-03: Passing className="bg-white" -- THE BUG

| Field | Value |
|---|---|
| **Priority** | P0 -- Critical |
| **Precondition** | Render with `className="bg-white"` |
| **Code path** | Section class becomes `section-spacing bg-white` -> `#ffffff` background |
| **Expected** | Should NOT produce literal white bg, or component should reject/override it |
| **Actual** | **FAIL** -- `bg-white` applies `#ffffff`. Cream text `#f0e6c6` on white = ~1.1:1 contrast ratio. Nearly invisible. WCAG AAA requires 7:1, AA requires 4.5:1. |
| **Defect** | DEF-01 (Critical) |
| **Pages** | `karaoke/page.tsx:548`, `live-music/page.tsx:556`, `cash-bingo/page.tsx:547`, `quiz-night/page.tsx:623` |

## TC-04: FAQ schema JSON-LD renders correctly

| Field | Value |
|---|---|
| **Priority** | P1 |
| **Precondition** | Render with `renderSchema=true` (default) and 2 FAQ items |
| **Code path** | `faqSchema` built at L39-50 -> `jsonLdSafeStringify()` -> `<script type="application/ld+json">` |
| **Expected** | Script tag contains valid FAQPage schema with @context, @type, mainEntity array. Each entry has @type Question, name, acceptedAnswer with @type Answer and text. `<` chars escaped as `\u003c`. |
| **Actual** | PASS -- code path is correct. `jsonLdSafeStringify` escapes `<` to prevent XSS. |
| **Test coverage** | NOT TESTED in existing test file (all 3 tests use `renderSchema={false}`) |
| **Defect** | DEF-02 (Medium) -- No test coverage for the schema rendering path |

## TC-05: FAQ schema disabled with renderSchema={false}

| Field | Value |
|---|---|
| **Priority** | P2 |
| **Precondition** | Render with `renderSchema={false}` |
| **Code path** | `faqSchema` is `null` (L39 ternary). Guard at L55 `renderSchema && faqSchema &&` prevents script render. |
| **Expected** | No `<script type="application/ld+json">` in DOM |
| **Actual** | PASS -- double guard ensures no render |
| **Test coverage** | Implicitly tested (existing tests use `renderSchema={false}`) but no explicit assertion that script tag is absent |
| **Defect** | DEF-03 (Low) -- Should have explicit assertion |

## TC-06: Accordion expand/collapse

| Field | Value |
|---|---|
| **Priority** | P1 |
| **Precondition** | Render with 2+ FAQ items |
| **Code path** | Click button -> `toggleQuestion(index)` -> `setOpenIndex(isOpening ? index : null)` -> re-render with `maxHeight: '500px'` or `'0'` |
| **Expected** | Click opens item (maxHeight 500px, pb-4). Click again closes (maxHeight 0, max-h-0). Only one item open at a time. |
| **Actual** | PASS -- single-open accordion pattern works correctly |
| **Test coverage** | Partially tested (open/close verified via GTM mock assertions, not via DOM state) |
| **Defect** | DEF-04 (Low) -- No direct assertion on expanded/collapsed DOM state |

## TC-07: GTM tracking fires on expand

| Field | Value |
|---|---|
| **Priority** | P2 |
| **Precondition** | Render and click a question |
| **Code path** | `toggleQuestion()` L28-35 -> if `isOpening` -> `trackFaqItemOpened({ questionText, faqPagePath })` |
| **Expected** | Fires once on open with question text and window.location.pathname. Does NOT fire on collapse. |
| **Actual** | PASS |
| **Test coverage** | GOOD -- 3 existing tests cover: fires on open, does not fire on close, fires for different question when switching |
| **Note** | `faqPagePath` uses `window.location.pathname` with SSR guard (`typeof window !== 'undefined'`). In tests, will be empty string in jsdom. |

## TC-08: Text visibility -- cream text on background

| Field | Value |
|---|---|
| **Priority** | P0 -- Critical |
| **Precondition** | All rendering contexts |
| **Code path** | H2 title: `text-anchor-cream-text` (#f0e6c6). Answer text: `text-anchor-cream-text/70` (70% opacity). |
| **Expected** | Text clearly readable against any valid FAQ section background |
| **Actual** | **FAIL on bg-white pages.** Cream `#f0e6c6` on white `#ffffff`: contrast ~1.1:1. With 70% opacity answer text is even worse. On dark backgrounds: PASS (~10:1 contrast). |
| **Defect** | DEF-01 (same root cause as TC-03) |

## TC-09: Question text colour inconsistency between components

| Field | Value |
|---|---|
| **Priority** | P2 -- Medium |
| **Precondition** | Compare FAQAccordion.tsx vs FAQAccordionWithSchema.tsx |
| **Code path** | Base: `h3` uses `text-anchor-gold-vivid` (#c9a020). WithSchema: `h3` uses `text-anchor-cream-text` (#f0e6c6). |
| **Expected** | Consistent question heading colour across both components |
| **Actual** | **FAIL** -- Different colours. Base uses gold, WithSchema uses cream. Also: base has `rounded-none`, WithSchema has no rounding override. Base has `space-y-4`, WithSchema has `space-y-3`. |
| **Defect** | DEF-05 (Medium) -- Inconsistent question text colour. Base component is unused so low practical impact, but creates confusion if ever re-enabled. |
| **Additional** | SVG chevron colours also differ: base uses `text-anchor-gold`, WithSchema uses `text-anchor-gold-vivid` |

## TC-10: Accessibility -- aria-expanded, aria-controls, focus styles

| Field | Value |
|---|---|
| **Priority** | P1 |
| **Precondition** | Render and interact with FAQ items |
| **Code path** | Button: `aria-expanded={openIndex === index}`, `aria-controls={`faq-answer-${index}`}`. Answer div: `id={`faq-answer-${index}`}`. SVG: `aria-hidden="true"`. |
| **Expected** | aria-expanded true/false toggles correctly. aria-controls matches answer div id. Focus styles visible. |
| **Actual -- WithSchema** | PASS -- has focus styles: `focus:outline-none focus:bg-anchor-bg-raised focus:ring-2 focus:ring-anchor-gold focus:ring-inset` |
| **Actual -- Base** | **FAIL** -- NO focus styles on button. Only has `hover:bg-anchor-bg-raised`. Missing focus ring entirely. |
| **Defect** | DEF-06 (Medium) -- Base component lacks focus styles (mitigated by non-use) |
| **Test coverage** | NOT TESTED -- no aria-expanded assertions in existing tests |
| **Defect** | DEF-07 (Medium) -- No accessibility assertions in test suite |

---

## Summary

| TC | Status | Severity |
|---|---|---|
| TC-01 | PASS | -- |
| TC-02 | PASS | -- |
| TC-03 | **FAIL** | Critical |
| TC-04 | PASS (untested) | Medium gap |
| TC-05 | PASS (weak test) | Low gap |
| TC-06 | PASS (partial) | Low gap |
| TC-07 | PASS | -- |
| TC-08 | **FAIL** | Critical |
| TC-09 | **FAIL** | Medium |
| TC-10 | **PARTIAL FAIL** | Medium |
```

### `.gitignore`

```
# Dependencies
node_modules/
/.pnp
.pnp.js
.yarn/install-state.gz

# Testing
coverage/
.nyc_output

# Next.js
/.next/
/.next.bak*/
/out/

# Production
build/
dist/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# OS
.DS_Store
Thumbs.db
*.pem

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Logs
logs/
*.log

# Playwright
playwright-report/
playwright/.cache/
test-results/

# Misc
.cache/
temp/
*.bak
*.backup
*.old

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
env.bak/
venv.bak/

# Output directories
output/

# Local analysis exports
temp/

# Prevent accidental website folder creation
website/
.claude/session-context.md
```

### `.superpowers/brainstorm/62983-1773235742/.server-info`

```
{"type":"server-started","port":65431,"host":"127.0.0.1","url_host":"localhost","url":"http://localhost:65431","screen_dir":"/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/.superpowers/brainstorm/62983-1773235742"}
```

### `.superpowers/brainstorm/62983-1773235742/.server.pid`

```
62989
```

### `.superpowers/brainstorm/62983-1773235742/approaches.html`

```
<h2>Three approaches to inline PayPal checkout</h2>
<p class="subtitle">All three keep the customer on the-anchor.pub. Pick the one that feels right.</p>

<div class="options">

  <div class="option" data-choice="a" onclick="toggleSelect(this)">
    <div class="letter">A</div>
    <div class="content">
      <h3>PayPal Smart Buttons — inline, no redirect</h3>
      <p>The wizard gains a step 4 "Review & Pay". When the customer clicks the PayPal button, a mini PayPal overlay opens <em>on the page</em> — they pay (PayPal account or card), close the overlay, and land on a branded confirmation page on the-anchor.pub. They never leave the site.</p>
      <div class="pros-cons">
        <div class="pros">
          <h4>Pros</h4>
          <ul>
            <li>Customer never leaves the-anchor.pub</li>
            <li>Supports PayPal account <em>and</em> card — no PayPal account needed</li>
            <li>Booking + payment happen in one atomic flow</li>
            <li>Reuses existing PayPal backend in management tools</li>
            <li>Highest conversion — no escape routes</li>
          </ul>
        </div>
        <div class="cons">
          <h4>Cons</h4>
          <ul>
            <li>Requires PayPal JS SDK integration on the website</li>
            <li>Need a new <code>/api/parking/payment/capture</code> route on the website</li>
            <li>Need a new confirmation page on the-anchor.pub</li>
          </ul>
        </div>
      </div>
      <p><strong>My recommendation.</strong> Most work but solves the problem completely.</p>
    </div>
  </div>

  <div class="option" data-choice="b" onclick="toggleSelect(this)">
    <div class="letter">B</div>
    <div class="content">
      <h3>PayPal redirect — but return to the-anchor.pub</h3>
      <p>Keep the current redirect-to-PayPal flow, but change the <code>return_url</code> so PayPal sends the customer back to a confirmation page on the-anchor.pub instead of management.orangejelly.co.uk. Minimal backend change.</p>
      <div class="pros-cons">
        <div class="pros">
          <h4>Pros</h4>
          <ul>
            <li>Very little backend change — just swap return URLs</li>
            <li>Familiar PayPal flow customers know</li>
          </ul>
        </div>
        <div class="cons">
          <h4>Cons</h4>
          <ul>
            <li>Customer still leaves the-anchor.pub to pay</li>
            <li>Same drop-off risk — people close the PayPal tab</li>
            <li>Doesn't fully solve the problem</li>
          </ul>
        </div>
      </div>
      <p>Quick win but doesn't address the root cause.</p>
    </div>
  </div>

  <div class="option" data-choice="c" onclick="toggleSelect(this)">
    <div class="letter">C</div>
    <div class="content">
      <h3>Require payment before booking is submitted</h3>
      <p>Flip the flow: collect card/PayPal details in the wizard <em>before</em> creating a booking. The booking is only created once payment is authorised. Customer sees booking confirmation immediately after.</p>
      <div class="pros-cons">
        <div class="pros">
          <h4>Pros</h4>
          <ul>
            <li>Zero pending-unpaid bookings — every booking is pre-paid</li>
            <li>No capacity held by abandoned checkouts</li>
          </ul>
        </div>
        <div class="cons">
          <h4>Cons</h4>
          <ul>
            <li>Biggest backend change — requires PayPal "authorise then capture" pattern</li>
            <li>More complex error handling if booking creation fails after payment</li>
            <li>Staff manual bookings would need a different code path</li>
          </ul>
        </div>
      </div>
      <p>Cleanest data model but highest complexity.</p>
    </div>
  </div>

</div>
```

### `.superpowers/brainstorm/62983-1773235742/architecture.html`

```
<h2>Architecture — what changes where</h2>
<p class="subtitle">Two codebases, minimal changes. Green = new. Amber = modified. Grey = unchanged.</p>

<div style="display: flex; gap: 24px; align-items: flex-start; flex-wrap: wrap;">

  <!-- Website -->
  <div style="flex: 1; min-width: 300px;">
    <div style="background: #1a2a1a; border: 2px solid #2d6a45; border-radius: 12px; padding: 20px;">
      <div style="color: #6ee7a0; font-size: 13px; font-weight: 700; margin-bottom: 4px;">the-anchor.pub</div>
      <div style="color: #5a8a65; font-size: 11px; margin-bottom: 16px;">OJ-The-Anchor.pub codebase</div>

      <!-- New files -->
      <div style="margin-bottom: 14px;">
        <div style="color: #6ee7a0; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">New files</div>

        <div style="background: #0d2b1a; border-left: 3px solid #6ee7a0; border-radius: 6px; padding: 10px 12px; margin-bottom: 8px;">
          <div style="color: #e0f0e0; font-size: 12px; font-weight: 600;">app/api/parking/payment/create-order/route.ts</div>
          <div style="color: #7ab07a; font-size: 11px; margin-top: 3px;">Receives booking data from wizard → calls management API (with <code>source:'website'</code>) → returns <code>paypal_order_id</code> to PayPal SDK</div>
        </div>

        <div style="background: #0d2b1a; border-left: 3px solid #6ee7a0; border-radius: 6px; padding: 10px 12px; margin-bottom: 8px;">
          <div style="color: #e0f0e0; font-size: 12px; font-weight: 600;">app/api/parking/payment/capture/route.ts</div>
          <div style="color: #7ab07a; font-size: 11px; margin-top: 3px;">Receives <code>order_id + booking_id</code> from PayPal <code>onApprove</code> → calls management capture API → returns <code>booking_id</code> for redirect</div>
        </div>

        <div style="background: #0d2b1a; border-left: 3px solid #6ee7a0; border-radius: 6px; padding: 10px 12px; margin-bottom: 8px;">
          <div style="color: #e0f0e0; font-size: 12px; font-weight: 600;">app/heathrow-parking/confirmation/[bookingId]/page.tsx</div>
          <div style="color: #7ab07a; font-size: 11px; margin-top: 3px;">Branded confirmation page. Fetches booking details. Shows reference, dates, vehicle reg, amount, "SMS sent" notice, parking tips.</div>
        </div>
      </div>

      <!-- Modified files -->
      <div style="margin-bottom: 14px;">
        <div style="color: #c9a020; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Modified files</div>

        <div style="background: #2a1f00; border-left: 3px solid #c9a020; border-radius: 6px; padding: 10px 12px; margin-bottom: 8px;">
          <div style="color: #e0d0a0; font-size: 12px; font-weight: 600;">components/features/ParkingBookingWizard/index.tsx</div>
          <div style="color: #a08040; font-size: 11px; margin-top: 3px;">Step 4 swapped from "here's your PayPal link" to PayPal Smart Buttons rendered inline via PayPal JS SDK. Handles <code>onApprove</code>, <code>onCancel</code>, <code>onError</code>.</div>
        </div>

        <div style="background: #2a1f00; border-left: 3px solid #c9a020; border-radius: 6px; padding: 10px 12px; margin-bottom: 8px;">
          <div style="color: #e0d0a0; font-size: 12px; font-weight: 600;">lib/api.ts</div>
          <div style="color: #a08040; font-size: 11px; margin-top: 3px;">Add <code>createParkingPaymentOrder()</code> and <code>captureParkingPayment()</code> methods. Update <code>getBookingById()</code> return type for confirmation page.</div>
        </div>
      </div>

      <!-- Unchanged -->
      <div>
        <div style="color: #666; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Unchanged</div>
        <div style="color: #555; font-size: 11px; line-height: 1.8;">
          app/api/parking/rates/ · app/api/parking/availability/ · app/api/parking/bookings/ · app/heathrow-parking/page.tsx · All other pages
        </div>
      </div>
    </div>
  </div>

  <!-- Management Tools -->
  <div style="flex: 1; min-width: 300px;">
    <div style="background: #1a1a2a; border: 2px solid #4a4a8a; border-radius: 12px; padding: 20px;">
      <div style="color: #a0a0e8; font-size: 13px; font-weight: 700; margin-bottom: 4px;">management.orangejelly.co.uk</div>
      <div style="color: #5a5a8a; font-size: 11px; margin-bottom: 16px;">OJ-AnchorManagementTools codebase</div>

      <!-- New files -->
      <div style="margin-bottom: 14px;">
        <div style="color: #a0a0e8; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">New files</div>

        <div style="background: #0d0d2b; border-left: 3px solid #a0a0e8; border-radius: 6px; padding: 10px 12px; margin-bottom: 8px;">
          <div style="color: #d0d0f0; font-size: 12px; font-weight: 600;">app/api/parking/payment/capture/route.ts</div>
          <div style="color: #7070a0; font-size: 11px; margin-top: 3px;">New POST endpoint. Accepts <code>{ order_id, booking_id }</code>. Captures PayPal payment, confirms booking, sends confirmation SMS. Idempotent.</div>
        </div>
      </div>

      <!-- Modified files -->
      <div style="margin-bottom: 14px;">
        <div style="color: #c9a020; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Modified files</div>

        <div style="background: #2a1f00; border-left: 3px solid #c9a020; border-radius: 6px; padding: 10px 12px; margin-bottom: 8px;">
          <div style="color: #e0d0a0; font-size: 12px; font-weight: 600;">app/api/parking/bookings/route.ts</div>
          <div style="color: #a08040; font-size: 11px; margin-top: 3px;">Add optional <code>source: 'website'</code> field to POST body. When present: create booking + PayPal order as normal, but <strong>skip the payment request SMS</strong>. Return includes <code>paypal_order_id</code>.</div>
        </div>

        <div style="background: #2a1f00; border-left: 3px solid #c9a020; border-radius: 6px; padding: 10px 12px; margin-bottom: 8px;">
          <div style="color: #e0d0a0; font-size: 12px; font-weight: 600;">lib/parking/payments.ts</div>
          <div style="color: #a08040; font-size: 11px; margin-top: 3px;">Extract capture + confirm logic into a shared <code>captureParkingPaymentAndConfirm()</code> function. Reused by both the new capture endpoint and the existing <code>/api/parking/payment/return</code> redirect handler.</div>
        </div>
      </div>

      <!-- Unchanged -->
      <div>
        <div style="color: #666; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Unchanged</div>
        <div style="color: #555; font-size: 11px; line-height: 1.8;">
          api/parking/payment/return/ (SMS flow still uses this) · api/webhooks/paypal/parking/ · All cron jobs · Staff UI · SMS reminder flow
        </div>
      </div>
    </div>
  </div>

</div>

<!-- Summary bar -->
<div style="margin-top: 20px; background: #1a1a1a; border-radius: 10px; padding: 14px 20px; display: flex; gap: 24px; flex-wrap: wrap;">
  <div>
    <span style="color: #6ee7a0; font-weight: 700;">3</span>
    <span style="color: #888; font-size: 12px; margin-left: 6px;">new files (website)</span>
  </div>
  <div>
    <span style="color: #a0a0e8; font-weight: 700;">1</span>
    <span style="color: #888; font-size: 12px; margin-left: 6px;">new file (management)</span>
  </div>
  <div>
    <span style="color: #c9a020; font-weight: 700;">4</span>
    <span style="color: #888; font-size: 12px; margin-left: 6px;">modified files total</span>
  </div>
  <div>
    <span style="color: #888; font-weight: 700;">0</span>
    <span style="color: #888; font-size: 12px; margin-left: 6px;">deleted files</span>
  </div>
</div>
```

### `.superpowers/brainstorm/62983-1773235742/confirmation-page.html`

```
<h2>Confirmation page — the-anchor.pub/heathrow-parking/confirmation/[id]</h2>
<p class="subtitle">What the customer sees immediately after paying. Click to select if you're happy with this layout.</p>

<div class="cards">
  <div class="card" data-choice="this-layout" onclick="toggleSelect(this)" style="max-width: 520px; margin: 0 auto;">
    <div class="card-image" style="background: #0c1d11; padding: 0; overflow: hidden; border-radius: 8px 8px 0 0;">

      <!-- Mock nav -->
      <div style="background: #005131; padding: 10px 20px; display: flex; justify-content: space-between; align-items: center;">
        <div style="color: white; font-weight: 700; font-size: 14px;">🍺 The Anchor</div>
        <div style="color: #a0c8a8; font-size: 11px;">Heathrow Parking</div>
      </div>

      <!-- Hero confirmation banner -->
      <div style="background: linear-gradient(135deg, #005131, #0a3a20); padding: 28px 24px; text-align: center;">
        <div style="width: 52px; height: 52px; background: #6ee7a0; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; font-size: 24px;">✓</div>
        <div style="color: #f0e6c6; font-size: 20px; font-weight: 700; margin-bottom: 4px;">Parking confirmed</div>
        <div style="color: #9ab89f; font-size: 13px;">Booking reference: <strong style="color: #c9a020;">PAR-20260311-0042</strong></div>
      </div>

      <!-- SMS notice -->
      <div style="background: #132318; border-top: 2px solid #c9a020; padding: 10px 20px; display: flex; align-items: center; gap: 10px;">
        <div style="font-size: 18px;">📱</div>
        <div style="color: #c9a020; font-size: 12px;">Confirmation SMS sent to your mobile</div>
      </div>

      <!-- Booking details card -->
      <div style="background: #172d1e; margin: 16px; border-radius: 10px; overflow: hidden;">
        <div style="background: #1f3d28; padding: 10px 16px; color: #6ee7a0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Your booking</div>
        <div style="padding: 14px 16px; display: flex; flex-direction: column; gap: 10px;">

          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="color: #7ab07a; font-size: 11px;">Drop off</div>
            <div style="color: #f0e6c6; font-size: 13px; font-weight: 600; text-align: right;">Mon 16 Mar 2026<br><span style="color: #9ab89f; font-weight: 400;">08:30</span></div>
          </div>

          <div style="height: 1px; background: #1f3d28;"></div>

          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="color: #7ab07a; font-size: 11px;">Pick up</div>
            <div style="color: #f0e6c6; font-size: 13px; font-weight: 600; text-align: right;">Mon 23 Mar 2026<br><span style="color: #9ab89f; font-weight: 400;">18:00</span></div>
          </div>

          <div style="height: 1px; background: #1f3d28;"></div>

          <div style="display: flex; justify-content: space-between;">
            <div style="color: #7ab07a; font-size: 11px;">Vehicle</div>
            <div style="color: #f0e6c6; font-size: 13px; font-weight: 600;">AB12 CDE · Ford Focus</div>
          </div>

          <div style="height: 1px; background: #1f3d28;"></div>

          <div style="display: flex; justify-content: space-between;">
            <div style="color: #7ab07a; font-size: 11px;">Amount paid</div>
            <div style="color: #6ee7a0; font-size: 15px; font-weight: 700;">£105.00</div>
          </div>

        </div>
      </div>

      <!-- Getting here -->
      <div style="background: #172d1e; margin: 0 16px 16px; border-radius: 10px; overflow: hidden;">
        <div style="background: #1f3d28; padding: 10px 16px; color: #6ee7a0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Getting here</div>
        <div style="padding: 12px 16px; display: flex; flex-direction: column; gap: 8px;">
          <div style="color: #9ab89f; font-size: 12px;">📍 The Anchor, Horton Road, Stanwell Moor, TW19 6AQ</div>
          <div style="color: #9ab89f; font-size: 12px;">🚕 7 minutes to Terminal 5 by taxi or rideshare</div>
          <div style="color: #9ab89f; font-size: 12px;">🚌 Bus 442 stops outside — direct to T2, T3, T4, T5</div>
          <div style="color: #9ab89f; font-size: 12px;">🔑 Keep your keys with you at all times</div>
        </div>
      </div>

      <!-- CTA -->
      <div style="padding: 0 16px 20px;">
        <div style="background: #005131; color: white; text-align: center; padding: 12px; border-radius: 8px; font-size: 13px; font-weight: 600;">While you're here — visit the pub</div>
        <div style="color: #5a8a65; font-size: 11px; text-align: center; margin-top: 6px;">Full menu · Real ales · Family friendly</div>
      </div>

    </div>
    <div class="card-body">
      <h3>Confirmation page layout</h3>
      <p>Branded in The Anchor's green. Shows all booking details, the SMS notice, getting-here info, and a pub CTA. Customer stays entirely on the-anchor.pub.</p>
    </div>
  </div>
</div>
```

### `.superpowers/brainstorm/62983-1773235742/confirmation-v2.html`

```
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Confirmation Page Mockup</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #111; color: #f0e6c6; }

  .page-chrome { max-width: 480px; margin: 0 auto; background: #0c1d11; min-height: 100vh; }

  /* Nav */
  .nav { background: #005131; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; }
  .nav-logo { color: white; font-weight: 700; font-size: 15px; }
  .nav-sub { color: #a8c8a8; font-size: 12px; }

  /* Hero */
  .hero { background: #005131; padding: 36px 24px 28px; text-align: center; }
  .success-circle { width: 56px; height: 56px; background: #22c55e; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
  .success-circle svg { width: 28px; height: 28px; stroke: white; stroke-width: 3; fill: none; }
  .hero h1 { color: white; font-size: 22px; font-weight: 700; margin-bottom: 6px; }
  .hero .ref { color: #86efac; font-size: 13px; }
  .hero .ref strong { color: #fbbf24; }

  /* SMS banner */
  .sms-banner { background: #1a3a1a; border-top: 3px solid #fbbf24; padding: 11px 20px; display: flex; align-items: center; gap: 10px; }
  .sms-banner span { font-size: 20px; }
  .sms-banner p { color: #fbbf24; font-size: 13px; font-weight: 500; }

  /* Section card */
  .card { background: #132318; margin: 16px; border-radius: 12px; overflow: hidden; }
  .card-header { background: #1e3a25; padding: 10px 16px; }
  .card-header h3 { color: #86efac; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
  .card-body { padding: 16px; }

  /* Detail rows */
  .detail-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 9px 0; border-bottom: 1px solid #1e3a25; }
  .detail-row:last-child { border-bottom: none; }
  .detail-label { color: #6a9a6a; font-size: 12px; padding-top: 1px; }
  .detail-value { color: #f0e6c6; font-size: 13px; font-weight: 600; text-align: right; }
  .detail-value.price { color: #86efac; font-size: 16px; }
  .detail-value small { display: block; color: #8aaa8a; font-weight: 400; font-size: 12px; }

  /* Info rows */
  .info-row { display: flex; align-items: flex-start; gap: 10px; padding: 7px 0; border-bottom: 1px solid #1e3a25; }
  .info-row:last-child { border-bottom: none; }
  .info-icon { font-size: 15px; padding-top: 1px; flex-shrink: 0; }
  .info-text { color: #9ab89f; font-size: 13px; line-height: 1.4; }

  /* CTA */
  .cta-wrap { margin: 0 16px 24px; }
  .cta-btn { display: block; background: #005131; color: white; text-align: center; padding: 14px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; text-decoration: none; border: 2px solid #2d7a50; }
  .cta-sub { color: #4a7a54; font-size: 12px; text-align: center; margin-top: 7px; }

  /* Page label */
  .page-label { text-align: center; padding: 10px; color: #333; font-size: 11px; }

  /* Outer wrapper */
  .outer { background: #1a1a1a; min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 20px; gap: 12px; }
  .caption { color: #888; font-size: 13px; text-align: center; max-width: 480px; line-height: 1.6; }
  .select-btn { background: #005131; color: white; border: none; border-radius: 8px; padding: 12px 28px; font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 4px; }
  .select-btn:hover { background: #006a40; }
</style>
</head>
<body>
<div class="outer">
  <p class="caption"><strong style="color:#f0e6c6;">Confirmation page</strong> — customer lands here after PayPal payment completes, stays entirely on the-anchor.pub</p>

  <div class="page-chrome">
    <nav class="nav">
      <span class="nav-logo">The Anchor</span>
      <span class="nav-sub">Heathrow Parking</span>
    </nav>

    <div class="hero">
      <div class="success-circle">
        <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h1>Parking confirmed</h1>
      <p class="ref">Booking reference: <strong>PAR-20260311-0042</strong></p>
    </div>

    <div class="sms-banner">
      <span>📱</span>
      <p>Confirmation text sent to your mobile</p>
    </div>

    <div class="card">
      <div class="card-header"><h3>Your booking</h3></div>
      <div class="card-body">
        <div class="detail-row">
          <span class="detail-label">Drop off</span>
          <span class="detail-value">Mon 16 Mar 2026 <small>08:30</small></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Pick up</span>
          <span class="detail-value">Mon 23 Mar 2026 <small>18:00</small></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Vehicle</span>
          <span class="detail-value">AB12 CDE<small>Ford Focus · Silver</small></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Amount paid</span>
          <span class="detail-value price">£105.00</span>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><h3>Getting here</h3></div>
      <div class="card-body">
        <div class="info-row">
          <span class="info-icon">📍</span>
          <span class="info-text">Horton Road, Stanwell Moor, TW19 6AQ</span>
        </div>
        <div class="info-row">
          <span class="info-icon">🚕</span>
          <span class="info-text">7 minutes to Terminal 5 by taxi or rideshare</span>
        </div>
        <div class="info-row">
          <span class="info-icon">🚌</span>
          <span class="info-text">Bus 442 from outside — direct to T2, T3, T4 &amp; T5</span>
        </div>
        <div class="info-row">
          <span class="info-icon">🔑</span>
          <span class="info-text">Keep your keys with you at all times</span>
        </div>
      </div>
    </div>

    <div class="cta-wrap">
      <a class="cta-btn" href="#">While you're here — visit the pub</a>
      <p class="cta-sub">Full menu · Real ales · Family friendly</p>
    </div>
  </div>

  <button class="select-btn" onclick="window.__sendEvent && window.__sendEvent('click', 'layout-approved', 'Confirmation page layout approved')">
    ✓ Looks good
  </button>
</div>
</body>
</html>
```

### `.superpowers/brainstorm/62983-1773235742/flow.html`

```
<h2>New booking & payment flow</h2>
<p class="subtitle">Everything from first click to confirmation — customer never leaves the-anchor.pub</p>

<div style="display: flex; gap: 32px; align-items: flex-start; flex-wrap: wrap;">

  <!-- LEFT: New website flow -->
  <div style="flex: 1; min-width: 280px;">
    <div style="background: #1a3a2a; border: 2px solid #2d6a45; border-radius: 12px; padding: 20px;">
      <div style="color: #6ee7a0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">New: website booking flow</div>

      <div style="display: flex; flex-direction: column; gap: 6px;">

        <div style="background: #132318; border-radius: 8px; padding: 10px 14px; border-left: 3px solid #6ee7a0;">
          <div style="color: #f0e6c6; font-size: 13px; font-weight: 600;">Step 1 — Choose dates</div>
          <div style="color: #9ab89f; font-size: 12px;">Availability check → price preview</div>
        </div>

        <div style="text-align: center; color: #6ee7a0; font-size: 18px;">↓</div>

        <div style="background: #132318; border-radius: 8px; padding: 10px 14px; border-left: 3px solid #6ee7a0;">
          <div style="color: #f0e6c6; font-size: 13px; font-weight: 600;">Step 2 — Your details</div>
          <div style="color: #9ab89f; font-size: 12px;">Name, mobile, email</div>
        </div>

        <div style="text-align: center; color: #6ee7a0; font-size: 18px;">↓</div>

        <div style="background: #132318; border-radius: 8px; padding: 10px 14px; border-left: 3px solid #6ee7a0;">
          <div style="color: #f0e6c6; font-size: 13px; font-weight: 600;">Step 3 — Vehicle details</div>
          <div style="color: #9ab89f; font-size: 12px;">Reg, make, model, colour</div>
        </div>

        <div style="text-align: center; color: #6ee7a0; font-size: 18px;">↓</div>

        <div style="background: #132318; border-radius: 8px; padding: 10px 14px; border-left: 3px solid #c9a020; border-width: 2px;">
          <div style="color: #f0e6c6; font-size: 13px; font-weight: 600;">Step 4 — Review & Pay <span style="color: #c9a020;">★ new</span></div>
          <div style="color: #9ab89f; font-size: 12px;">Booking summary + PayPal Smart Buttons inline</div>
          <div style="margin-top: 8px; background: #1e3d2e; border-radius: 6px; padding: 8px; display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <div style="background: #003087; color: white; border-radius: 4px; padding: 4px 10px; font-size: 11px; font-weight: 700;">Pay<span style="color: #009cde;">Pal</span></div>
            <div style="background: #555; color: white; border-radius: 4px; padding: 4px 10px; font-size: 11px;">💳 Debit / Credit Card</div>
          </div>
        </div>

        <div style="text-align: center; color: #6ee7a0; font-size: 18px;">↓</div>

        <div style="background: #132318; border-radius: 8px; padding: 10px 14px; border-left: 3px solid #c9a020;">
          <div style="color: #f0e6c6; font-size: 13px; font-weight: 600;">PayPal overlay opens <em>on the page</em></div>
          <div style="color: #9ab89f; font-size: 12px;">Customer pays — never leaves the-anchor.pub</div>
        </div>

        <div style="text-align: center; color: #6ee7a0; font-size: 18px;">↓</div>

        <div style="background: #0d2b1a; border-radius: 8px; padding: 10px 14px; border: 2px solid #6ee7a0;">
          <div style="color: #6ee7a0; font-size: 13px; font-weight: 700;">✓ Confirmation page on the-anchor.pub</div>
          <div style="color: #9ab89f; font-size: 12px;">Reference, dates, vehicle reg, amount paid</div>
          <div style="color: #9ab89f; font-size: 12px; margin-top: 4px;">📱 Confirmation SMS sent to customer</div>
        </div>

      </div>
    </div>
  </div>

  <!-- RIGHT: What happens behind the scenes -->
  <div style="flex: 1; min-width: 280px;">
    <div style="background: #1a1a2e; border: 2px solid #4a4a7a; border-radius: 12px; padding: 20px;">
      <div style="color: #a0a0e0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">Behind the scenes</div>

      <div style="display: flex; flex-direction: column; gap: 10px;">

        <div style="background: #12122a; border-radius: 8px; padding: 10px 14px;">
          <div style="color: #e0e0f0; font-size: 12px; font-weight: 600; margin-bottom: 4px;">On PayPal button click</div>
          <div style="color: #8080b0; font-size: 11px;">Website calls management API: create booking (pending) + PayPal order atomically. Returns <code>paypal_order_id</code>. <strong>No SMS sent yet.</strong></div>
        </div>

        <div style="background: #12122a; border-radius: 8px; padding: 10px 14px;">
          <div style="color: #e0e0f0; font-size: 12px; font-weight: 600; margin-bottom: 4px;">On payment approved</div>
          <div style="color: #8080b0; font-size: 11px;">PayPal SDK fires <code>onApprove</code>. Website calls management API: capture payment, confirm booking, send confirmation SMS.</div>
        </div>

        <div style="background: #12122a; border-radius: 8px; padding: 10px 14px;">
          <div style="color: #e0e0f0; font-size: 12px; font-weight: 600; margin-bottom: 4px;">PayPal webhook (belt & braces)</div>
          <div style="color: #8080b0; font-size: 11px;">Management tools still receive <code>PAYMENT.CAPTURE.COMPLETED</code> webhook — idempotent so it won't double-confirm. Safety net if <code>onApprove</code> fails mid-network.</div>
        </div>

        <div style="background: #12122a; border-radius: 8px; padding: 10px 14px;">
          <div style="color: #e0e0f0; font-size: 12px; font-weight: 600; margin-bottom: 4px;">Staff bookings — unchanged</div>
          <div style="color: #8080b0; font-size: 11px;">Management tools flow stays exactly as-is. Staff create booking → payment request SMS sent as today.</div>
        </div>

        <div style="background: #12122a; border-radius: 8px; padding: 10px 14px; border: 1px solid #4a4a7a;">
          <div style="color: #e0e0f0; font-size: 12px; font-weight: 600; margin-bottom: 6px;">Edge cases handled</div>
          <div style="color: #8080b0; font-size: 11px; line-height: 1.7;">
            ❌ <strong>User cancels PayPal overlay</strong> → returns to step 4, can try again. Booking expires in 30 mins (not 7 days).<br>
            ❌ <strong>Capture fails</strong> → show error, offer retry or phone number.<br>
            ❌ <strong>Network drops after approval</strong> → webhook catches it, SMS still sent.<br>
            ❌ <strong>Slot fills up</strong> → capacity re-checked on order creation, not just step 1.
          </div>
        </div>

      </div>
    </div>
  </div>

</div>
```

### `.superpowers/brainstorm/62983-1773235742/waiting.html`

```
<div style="display:flex;align-items:center;justify-content:center;min-height:60vh">
  <p class="subtitle">Writing spec document — continuing in terminal...</p>
</div>
```

### `app/blog/[slug]/page.tsx`

```
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBlogPost, getAllBlogPosts, distributeImages } from '@/lib/markdown'
import { Button, Section } from '@/components/ui'
import { Metadata } from 'next'
import ScrollDepthTracker from '@/components/tracking/ScrollDepthTracker'
import { BlogShareButtons } from '@/components/BlogShareButtons'
import { InternalLinkingSection, commonLinkGroups } from '@/components/seo/InternalLinkingSection'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { getBlogHeroUrl } from '@/lib/blog-image'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { BookTableButton } from '@/components/BookTableButton'

export const revalidate = 3600

export async function generateStaticParams() {
  const posts = await getAllBlogPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

function stripMarkdownFormatting(value: string): string {
  return value
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractFaqEntries(markdown: string): Array<{ question: string; answer: string }> {
  const lines = markdown.split(/\r?\n/)
  const entries: Array<{ question: string; answer: string }> = []

  let inFaqSection = false
  let activeQuestion: string | null = null
  let answerBuffer: string[] = []

  const flushEntry = () => {
    if (!activeQuestion) return
    const answer = stripMarkdownFormatting(answerBuffer.join(' ').trim())
    if (answer) {
      entries.push({
        question: stripMarkdownFormatting(activeQuestion),
        answer
      })
    }
    activeQuestion = null
    answerBuffer = []
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (!inFaqSection) {
      if (/^##\s+FAQs\s*$/i.test(line)) {
        inFaqSection = true
      }
      continue
    }

    if (/^##\s+/.test(line) && !/^##\s+FAQs\s*$/i.test(line)) {
      flushEntry()
      break
    }

    const questionMatch = line.match(/^###\s+(.+)$/)
    if (questionMatch) {
      flushEntry()
      activeQuestion = questionMatch[1]
      continue
    }

    if (!activeQuestion || !line || line === '---') {
      continue
    }

    answerBuffer.push(line)
  }

  flushEntry()

  return entries
}

/**
 * Tags that indicate a Heathrow/plane-spotting/travel post where a booking CTA is relevant.
 * Also catches posts by slug pattern (e.g. "plane-spotting-heathrow-guide" which uses generic tags).
 */
const HEATHROW_CTA_TAGS = new Set([
  'heathrow',
  'plane-spotting',
  'parking',
  'travel',
])

const HEATHROW_SLUG_KEYWORDS = ['heathrow', 'plane', 'parking', 'aviation', 'airport', 'layover']

function shouldShowHeathrowBookingCta(slug: string, tags: string[]): boolean {
  if (tags.some((tag) => HEATHROW_CTA_TAGS.has(tag))) return true
  return HEATHROW_SLUG_KEYWORDS.some((kw) => slug.includes(kw))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getBlogPost(params.slug)
  
  if (!post) {
    return {
      title: 'Post Not Found | The Anchor Blog',
    }
  }

  const ogImageUrl = getBlogHeroUrl(post.slug, post.ogImage || post.hero)
  const ogImageAlt = post.ogImageAlt || post.title

  return {
    title: `${post.title} | The Anchor Blog`,
    description: post.description,
    alternates: {
      canonical: `/blog/${params.slug}`
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `/blog/${params.slug}`,
      images: [
        {
          url: ogImageUrl,
          alt: ogImageAlt
        }
      ],
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags
    },
    ...(post.noindex ? { robots: { index: false, follow: true } } : {}),
    twitter: getTwitterMetadata({
      title: post.title,
      description: post.description,
      images: [ogImageUrl]
    }),
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug)

  if (!post) {
    notFound()
  }

  // Block direct access to future-dated (unpublished) posts
  if (post?.publishDate && new Date(post.publishDate) > new Date()) {
    notFound()
  }

  // Get all posts for navigation
  const allPosts = await getAllBlogPosts()
  const currentIndex = allPosts.findIndex(p => p.slug === post.slug)
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null

  // Distribute images throughout content only if images array has items
  const contentWithImages = post.images && post.images.length > 0 
    ? distributeImages(post.htmlContent || '', post.images, post.slug, post.imageAlts)
    : post.htmlContent || ''

  const heroUrl = getBlogHeroUrl(post.slug, post.hero)
  const heroAlt = post.heroAlt || post.title
  const ogImageUrl = getBlogHeroUrl(post.slug, post.ogImage || post.hero)
  const ogImageAlt = post.ogImageAlt || post.title
  const ogAbsoluteUrl = ogImageUrl.startsWith('http')
    ? ogImageUrl
    : `https://www.the-anchor.pub${ogImageUrl}`

  const faqEntries = extractFaqEntries(post.content)

  const showHeathrowCta = shouldShowHeathrowBookingCta(post.slug, post.tags)

  // BlogPosting structured data for better SEO
  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "alternativeHeadline": post.description,
    "description": post.description,
    "author": {
      "@type": "Person",
      "name": post.author,
      "url": "https://www.the-anchor.pub/blog"
    },
    "datePublished": post.date,
    "dateModified": post.date,
    "publisher": {
      "@type": "Organization",
      "name": "The Anchor",

[truncated at line 200 — original has 503 lines]
```

### `app/book-table/page.tsx`

```
import type { Metadata } from 'next'
import Link from 'next/link'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { PhoneButton } from '@/components/PhoneButton'
import { ManagementTableBookingForm } from '@/components/features/TableBooking/ManagementTableBookingForm'
import { BookTableUpcomingEventsPanel } from '@/components/features/TableBooking/BookTableUpcomingEventsPanel'
import { Section, Button, Grid, Card, CardBody, SectionHeader } from '@/components/ui'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { SUNDAY_LUNCH_DEPOSIT_POLICY_COPY } from '@/lib/constants'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { RegretReduction, ValueProofStrip } from '@/components/psychology'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'

export const metadata: Metadata = {
  title: 'Book a Table Near Heathrow | Sunday Roast | The Anchor',
  description: 'Reserve your table at The Anchor, Stanwell Moor — instant confirmation. Pub food from £8.95, Sunday roast from £19. Dog-friendly, free parking, 7 mins from T5.',
  openGraph: {
    title: 'Book a Table Near Heathrow | Sunday Roast | The Anchor',
    description: 'Reserve your table at The Anchor, Stanwell Moor — instant confirmation. Pub food from £8.95, Sunday roast from £19. Dog-friendly, free parking, 7 mins from T5.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }]
  },
  twitter: getTwitterMetadata({
    title: 'Book a Table Near Heathrow | Sunday Roast | The Anchor',
    description: 'Reserve your table at The Anchor, Stanwell Moor — instant confirmation. Pub food from £8.95, Sunday roast from £19. Dog-friendly, free parking, 7 mins from T5.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/book-table'
  }
}

type BookTablePageProps = {
  searchParams?: {
    date?: string
    time?: string
    party_size?: string
    purpose?: string
    sunday_lunch?: string
    mothers_day?: string
  }
}

function parsePartySize(value?: string): number | undefined {
  if (!value) return undefined
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed)) return undefined
  return Math.min(Math.max(parsed, 1), 20)
}

function parsePurpose(value?: string): 'food' | 'drinks' | undefined {
  if (value === 'food' || value === 'drinks') return value
  return undefined
}

function parseBoolean(value?: string): boolean | undefined {
  if (!value) return undefined
  const normalized = value.trim().toLowerCase()
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false
  return undefined
}

export default function BookPage({ searchParams }: BookTablePageProps) {
  const prefill = {
    date: searchParams?.date,
    time: searchParams?.time,
    partySize: parsePartySize(searchParams?.party_size),
    purpose: parsePurpose(searchParams?.purpose),
    sundayLunch: parseBoolean(searchParams?.sunday_lunch),
    mothersDay: parseBoolean(searchParams?.mothers_day)
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FoodEstablishmentReservation',
            reservationFor: {
              '@type': 'FoodEstablishment',
              name: 'The Anchor',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Horton Road',
                addressLocality: 'Stanwell Moor',
                postalCode: 'TW19 6AQ'
              }
            },
            url: 'https://www.the-anchor.pub/book-table',
            potentialAction: {
              '@type': 'ReserveAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://www.the-anchor.pub/book-table'
              },
              result: {
                '@type': 'FoodEstablishmentReservation'
              }
            }
          })
        }}
      />

      <HeroWrapper
        route="/book-table"
        title="Book a Table at The Anchor"
        description="Reserve your table online with mobile confirmation."
        variant="default"
        statusBarPosition="above"
        primaryCta={
          <Link href="#booking-form">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
            >
              Book Online
            </Button>
          </Link>
        }
        secondaryCta={
          <PhoneButton
            phone="01753 682707"
            source="book_table_hero"
            variant="outline"
            size="lg"
            className="w-full sm:w-auto !bg-white/10 !text-white !border-white/30 hover:!bg-white/20"
          >
            Prefer to call? 01753 682707
          </PhoneButton>
        }
        image={{
          src: DEFAULT_PAGE_HEADER_IMAGE,
          alt: 'The Anchor pub - book a table',
          priority: true
        }}
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: 'Book a Table' }
        ]}
        tags={[
          { label: 'Direct booking', icon: '', size: 'small' },
          { label: 'Fast confirmation', icon: '', size: 'small' },
          { label: 'Need help? Call us', icon: '', size: 'small' }
        ]}
        secondaryInfo={
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 mt-2">
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Free parking · 20 spaces</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">7 min from Heathrow T5</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Dog & family friendly</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Super-fast fibre broadband</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Rated 4.6/5 on Google</span>
          </div>
        }
      />

      <Section spacing="xs" container containerSize="md" className="text-center bg-anchor-bg border-b border-anchor-gold/15">
        <PageTitle className="text-anchor-cream-text" seo={{ structured: true, speakable: true }}>
          Reserve Your Table Online
        </PageTitle>
        <p className="mt-3 text-base text-anchor-cream-text/70 md:text-lg">
          Choose your date, time, and party size to reserve your table. Loved by locals and Heathrow travellers every week.
        </p>
      </Section>

      <Section id="booking-form" background="gray" spacing="sm" container containerSize="lg" className="bg-anchor-bg-raised">
        <div className="grid items-start gap-5 lg:gap-8 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
          <div className="order-1">
            <div className="mb-4">
              <RegretReduction variant="booking" />
            </div>
            <ManagementTableBookingForm prefill={prefill} />
          </div>

          <aside className="order-2 space-y-4 lg:space-y-6">
            <div className="card-dark p-4 lg:hidden">
              <h2 className="text-lg font-semibold text-anchor-gold-vivid">Need help with your booking?</h2>
              <p className="mt-2 text-sm text-anchor-cream-text/70">
                If you need a larger table, can't find your preferred time, or want a quick answer, call us directly.
              </p>
              <div className="mt-4 space-y-2">
                <PhoneButton
                  phone="01753 682707"
                  source="book_table_mobile_help"
                  variant="secondary"
                  className="w-full"
                >
                  Call 01753 682707
                </PhoneButton>
                <Link href="/whats-on" className="block">
                  <Button variant="outline" className="w-full">
                    See upcoming events
                  </Button>
                </Link>
              </div>
            </div>


[truncated at line 200 — original has 431 lines]
```

### `app/components/head.tsx`

_(deleted or missing from working tree)_

### `app/components/page.tsx`

_(deleted or missing from working tree)_

### `app/debug-hours/head.tsx`

_(deleted or missing from working tree)_

### `app/debug-hours/page.tsx`

_(deleted or missing from working tree)_

### `app/demo-header/head.tsx`

_(deleted or missing from working tree)_

### `app/demo-header/page.tsx`

_(deleted or missing from working tree)_

### `app/food-menu/gluten-free/page.tsx`

```
import Link from 'next/link'
import { Metadata } from 'next'
import { Container, Section, Card, CardBody, Alert } from '@/components/ui'
import { CTASection, SectionHeader } from '@/components/ui'
import { BookTableButton } from '@/components/BookTableButton'
import { HeroWrapper } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { FoodStickyCtaBar } from '@/components/food/FoodStickyCtaBar'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { parseMenuMarkdown, type MenuCategory } from '@/lib/menu-parser'
import { DietaryMenuNav } from '@/components/food/DietaryMenuNav'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Gluten-Free Pub Food Near Heathrow | GF Menu | The Anchor',
  description: 'Proper gluten-free pub food near Heathrow Airport. GF pizza bases, sticky toffee pudding, chocolate brownie and sides — no surcharge. Free parking, 7 mins from T5.',
  openGraph: {
    title: 'Gluten-Free Pub Food | The Anchor, Stanwell Moor',
    description: 'Proper gluten-free pub food near Heathrow. GF pizza bases, naturally gluten-free puddings and sides — no surcharge.',
    images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg'],
  },
  twitter: getTwitterMetadata({
    title: 'Gluten-Free Pub Food | The Anchor, Stanwell Moor',
    description: 'Proper gluten-free pub food near Heathrow. GF pizza bases, naturally gluten-free puddings and sides — no surcharge.',
    images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg'],
  }),
  alternates: {
    canonical: '/food-menu/gluten-free',
  },
}

interface DietaryMenuItem {
  name: string
  price: string
  description: string
  category: string
  note?: string
}

function extractGlutenFreeItems(categories: MenuCategory[]): {
  naturallyGf: DietaryMenuItem[]
  gfoPizzas: DietaryMenuItem[]
  gfoOther: DietaryMenuItem[]
} {
  const naturallyGf: DietaryMenuItem[] = []
  const gfoPizzas: DietaryMenuItem[] = []
  const gfoOther: DietaryMenuItem[] = []
  const seenGf = new Set<string>()

  for (const category of categories) {
    for (const section of category.sections) {
      for (const item of section.items) {
        if (item.glutenFree && !seenGf.has(item.name)) {
          seenGf.add(item.name)
          naturallyGf.push({
            name: item.name,
            price: item.price,
            description: item.description,
            category: category.title,
          })
        }
      }
    }
  }

  for (const category of categories) {
    for (const section of category.sections) {
      for (const item of section.items) {
        if (item.glutenFreeAvailable && !item.glutenFree && !seenGf.has(item.name)) {
          seenGf.add(item.name)
          const isPizza = category.id === 'pizza'
          const note = isPizza
            ? 'Available on a gluten-free base — ask at the bar'
            : 'Gluten-free option available — ask at the bar'
          const entry: DietaryMenuItem = {
            name: item.name,
            price: item.price,
            description: item.description,
            category: category.title,
            note,
          }
          if (isPizza) {
            gfoPizzas.push(entry)
          } else {
            gfoOther.push(entry)
          }
        }
      }
    }
  }

  return { naturallyGf, gfoPizzas, gfoOther }
}

function MenuItemCard({ item, badge }: { item: DietaryMenuItem; badge: string }) {
  return (
    <div className="flex justify-between items-start gap-4 py-4 border-b border-anchor-gold/10 last:border-b-0">
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-anchor-cream-text">{item.name}</h3>
          <span className="inline-flex items-center rounded-full bg-blue-900/40 border border-blue-500/30 px-2 py-0.5 text-xs font-medium text-blue-300">
            {badge}
          </span>
        </div>
        {item.description && (
          <p className="text-sm text-anchor-cream-text/60 mt-1">{item.description}</p>
        )}
        {item.note && (
          <p className="text-sm text-amber-400/80 mt-1 italic">{item.note}</p>
        )}
        <p className="text-xs text-anchor-cream-text/40 mt-1">{item.category}</p>
      </div>
      {item.price && (
        <span className="text-anchor-gold-vivid font-semibold whitespace-nowrap">&pound;{item.price}</span>
      )}
    </div>
  )
}

export default async function GlutenFreeMenuPage() {
  const menuData = await parseMenuMarkdown('food')

  if (!menuData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-anchor-bg">
        <p className="text-xl text-anchor-cream-text/70">Menu temporarily unavailable. Please call us on 01753 682707.</p>
      </div>
    )
  }

  const { naturallyGf, gfoPizzas, gfoOther } = extractGlutenFreeItems(menuData.categories)

  const faqItems = [
    {
      question: 'Does The Anchor have gluten-free options?',
      answer: 'Yes, several dishes are naturally gluten-free and all our stone-baked pizzas can be made on a gluten-free base. Our sticky toffee pudding and chocolate fudge brownie are also naturally gluten-free. Both garlic bread options are available on a GF base too.',
    },
    {
      question: 'Is there a gluten-free pizza base?',
      answer: 'Yes, all our stone-baked pizzas are available on a 12-inch gluten-free base at no extra charge. Just ask at the bar when ordering.',
    },
    {
      question: 'Is the garlic bread available gluten-free?',
      answer: 'Yes, both our Garlic Bread and Garlic Bread with Mozzarella are available on a gluten-free base at no extra charge. Just ask at the bar when ordering.',
    },
    {
      question: 'Are the puddings gluten-free?',
      answer: 'Our sticky toffee pudding and chocolate fudge brownie are both naturally gluten-free. The ice cream sundae is also available as a gluten-free option.',
    },
    {
      question: 'Is there a risk of cross-contamination?',
      answer: 'Our dishes are prepared in one kitchen, so we cannot guarantee no cross-contamination. Please inform us of any allergies when ordering and we will do our best to accommodate you.',
    },
    {
      question: 'Do you charge extra for gluten-free?',
      answer: 'No, gluten-free pizza bases and garlic bread bases are the same price as our standard bases. There is no surcharge for any gluten-free option.',
    },
  ]

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Food Menu', url: '/food-menu' },
          { name: 'Gluten-Free Menu', url: '/food-menu/gluten-free' },
        ]}
      />

      <HeroWrapper
        route="/food-menu/gluten-free"
        title="Gluten-Free Pub Food"
        description="Proper gluten-free pub food near Heathrow — GF pizza bases, naturally gluten-free puddings and sides."
        variant="default"
        breadcrumbs={[
          { name: 'Food & Drink', href: '/food-menu' },
          { name: 'Gluten-Free' },
        ]}
        tags={[
          { label: 'GF pizza bases', variant: 'default' },
          { label: 'GF puddings', variant: 'default' },
          { label: 'No surcharge', variant: 'default' },
        ]}
        ctaContainerClassName="gap-4 sm:items-center"
        ctaContainerProps={{ 'data-sticky-cta-guard': 'true' }}
        primaryCta={
          <BookTableButton
            source="gluten_free_menu_hero"
            context="food"
            variant="primary"
            size="lg"
            className="sm:w-auto"
            trackingLabel="Hero Book a Table"
          >
            Reserve Your Table
          </BookTableButton>
        }

[truncated at line 200 — original has 557 lines]
```

### `app/food-menu/page.tsx`

```
import Link from 'next/link'
import { Metadata } from 'next'
import { Container, Section, Card, CardBody, Alert } from '@/components/ui'
import { CTASection, SectionHeader, FeatureGrid } from '@/components/ui'
import { BookTableButton } from '@/components/BookTableButton'
import { HeroWrapper } from '@/components/hero'
import { MenuSectionCta } from '@/components/food/MenuSectionCta'
import { FilteredMenuRenderer } from '@/components/FilteredMenuRenderer'
import { MenuPageTracker } from '@/components/tracking/MenuPageTracker'
import ScrollDepthTracker from '@/components/tracking/ScrollDepthTracker'
import { SpeakableSchema } from '@/components/seo/SpeakableSchema'
import { SpeakableContent } from '@/components/voice/SpeakableContent'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { parseMenuMarkdown } from '@/lib/menu-parser'
import { getBusinessHours, isKitchenOpen, type BusinessHours } from '@/lib/api'
import { formatTime12Hour } from '@/lib/time-utils'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { generateKitchenHoursSpecification, generateNutritionInfo, generateSuitableForDiet } from '@/lib/schema-utils'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { FoodStickyCtaBar } from '@/components/food/FoodStickyCtaBar'
import { DietaryMenuNav } from '@/components/food/DietaryMenuNav'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import type { KitchenStatusData } from '@/components/psychology'

export const revalidate = 3600 // Revalidate every hour

const MENU_SECTION_LIST = [
  {
    position: 1,
    name: 'British Pub Classics',
    url: 'https://www.the-anchor.pub/food-menu#pub-classics'
  },
  {
    position: 2,
    name: 'Traditional British Pies',
    url: 'https://www.the-anchor.pub/food-menu#pies'
  },
  {
    position: 3,
    name: 'Stone-Baked Pizza',
    url: 'https://www.the-anchor.pub/food-menu#pizza'
  },
  {
    position: 4,
    name: 'Comfort Favourites',
    url: 'https://www.the-anchor.pub/food-menu#comfort-favourites'
  },
  {
    position: 5,
    name: 'Near Heathrow',
    url: 'https://www.the-anchor.pub/food-menu#near-heathrow'
  }
]

function buildKitchenHoursMap(hours: BusinessHours): Record<string, string> | null {
  const schedule: Record<string, string> = {}

  const weekdays: Array<keyof BusinessHours['regularHours']> = ['tuesday', 'wednesday', 'thursday', 'friday']
  const weekdayHours = weekdays
    .map(day => {
      const dayHours = hours.regularHours[day]
      if (!dayHours?.kitchen || !isKitchenOpen(dayHours.kitchen)) return null
      return {
        day,
        opens: formatTime12Hour(dayHours.kitchen.opens),
        closes: formatTime12Hour(dayHours.kitchen.closes)
      }
    })
    .filter(Boolean) as Array<{ day: string; opens: string; closes: string }>

  if (
    weekdayHours.length === weekdays.length &&
    weekdayHours.every(h => h.opens === weekdayHours[0].opens && h.closes === weekdayHours[0].closes)
  ) {
    schedule['Tuesday to Friday'] = `${weekdayHours[0].opens}-${weekdayHours[0].closes}`
  } else {
    weekdayHours.forEach(h => {
      schedule[h.day.charAt(0).toUpperCase() + h.day.slice(1)] = `${h.opens}-${h.closes}`
    })
  }

  const saturdayHours = hours.regularHours.saturday?.kitchen
  if (saturdayHours && isKitchenOpen(saturdayHours)) {
    schedule.Saturday = `${formatTime12Hour(saturdayHours.opens)}-${formatTime12Hour(saturdayHours.closes)}`
  }

  const sundayHours = hours.regularHours.sunday?.kitchen
  if (sundayHours && isKitchenOpen(sundayHours)) {
    schedule.Sunday = `${formatTime12Hour(sundayHours.opens)}-${formatTime12Hour(sundayHours.closes)}`
  }

  return Object.keys(schedule).length ? schedule : null
}

function buildKitchenSchedule(hours: BusinessHours): string {
  const schedule = buildKitchenHoursMap(hours)
  if (!schedule) return ''
  return Object.entries(schedule)
    .map(([day, time]) => `${day} ${time}`)
    .join(', ')
}

function deriveKitchenStatusData(hours: BusinessHours | null): KitchenStatusData {
  if (!hours) return null

  const londonNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/London' }))
  const day = londonNow.getDay() // 0=Sun, 1=Mon, 2=Tue...6=Sat

  // Monday - kitchen always closed
  if (day === 1) return { type: 'closed-today' }

  const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const
  const dayKey = dayKeys[day] as keyof typeof hours.regularHours

  const dayHours = hours.regularHours[dayKey]
  if (!dayHours || (dayHours as any).is_closed) return { type: 'closed-today' }

  const kitchen = (dayHours as any).kitchen
  if (!kitchen || (kitchen as any).is_closed) return { type: 'closed-today' }

  if (!kitchen.opens || !kitchen.closes) return null

  const nowMinutes = londonNow.getHours() * 60 + londonNow.getMinutes()
  const [openH, openM] = kitchen.opens.split(':').map(Number)
  const [closeH, closeM] = kitchen.closes.split(':').map(Number)
  const openMinutes = openH * 60 + openM
  const closeMinutes = closeH * 60 + closeM

  const closesAtFormatted = formatTime12Hour(kitchen.closes)
  const opensAtFormatted = formatTime12Hour(kitchen.opens)

  if (nowMinutes < openMinutes) {
    return { type: 'opens-later', opensAt: opensAtFormatted }
  }
  if (nowMinutes >= closeMinutes) {
    return { type: 'closed-today' }
  }
  // Within 2 hours of closing
  if (closeMinutes - nowMinutes <= 120) {
    return { type: 'closing-soon', closesAt: closesAtFormatted }
  }
  return { type: 'open', closesAt: closesAtFormatted }
}

export const metadata: Metadata = {
  title: 'Where to Eat Near Heathrow Airport | Pub Food Menu | The Anchor',
  description: 'Where to eat near Heathrow Airport? The Anchor serves fish & chips from £15, stone-baked pizza from £12, burgers from £11 and Sunday roasts from £19. Free parking, 7 mins from T5. Book a table online.',
  openGraph: {
    title: 'Where to Eat Near Heathrow Airport | Pub Food Menu | The Anchor',
    description: 'Looking for restaurants near Heathrow? The Anchor serves proper pub food — fish & chips, pizza, pies and Sunday roasts. Free parking, 7 mins from T5. View our menu.',
    images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg'],
  },
  twitter: getTwitterMetadata({
    title: 'Where to Eat Near Heathrow Airport | Pub Food Menu | The Anchor',
    description: 'Looking for restaurants near Heathrow? The Anchor serves proper pub food — fish & chips, pizza, pies and Sunday roasts. Free parking, 7 mins from T5. View our menu.',
    images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg']
  }),
  alternates: {
    canonical: '/food-menu'
  }
}


export default async function FoodMenuPage() {
  const [menuData, businessHours] = await Promise.all([
    parseMenuMarkdown('food'),
    getBusinessHours()
  ])
  const kitchenHoursSpecification = generateKitchenHoursSpecification(businessHours)

  if (!menuData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-anchor-bg">
        <p className="text-xl text-anchor-cream-text/70">Menu temporarily unavailable. Please call us on 01753 682707.</p>
      </div>
    )
  }

  const kitchenHoursMap = businessHours ? buildKitchenHoursMap(businessHours) : null
  const kitchenSchedule = businessHours ? buildKitchenSchedule(businessHours) : null
  const kitchenStatusData = deriveKitchenStatusData(businessHours)
  const sundayKitchen = businessHours?.regularHours?.sunday?.kitchen
  const sundayKitchenHours = sundayKitchen && isKitchenOpen(sundayKitchen)
    ? `${formatTime12Hour(sundayKitchen.opens)}-${formatTime12Hour(sundayKitchen.closes)}`
    : null
  const menuDataWithKitchenHours = {
    ...menuData,
    ...(kitchenHoursMap ? { kitchenHours: kitchenHoursMap } : {})
  }

  const faqItems = [
    {
      question: 'What time is the kitchen open at The Anchor?',
      answer: kitchenSchedule
        ? `Our kitchen is open ${kitchenSchedule}.`
        : 'Our kitchen hours are updated live on this page.'
    },
    {
      question: 'Where can I view your food menu or pub menu online?',
      answer: 'You can view the full food menu and pub menu on this page. Use the filters for vegetarian menu and gluten free menu options, then book a table when you are ready.'

[truncated at line 200 — original has 791 lines]
```

### `app/food-menu/vegan/page.tsx`

```
import Link from 'next/link'
import { Metadata } from 'next'
import { Container, Section, Card, CardBody, Alert } from '@/components/ui'
import { CTASection, SectionHeader } from '@/components/ui'
import { BookTableButton } from '@/components/BookTableButton'
import { HeroWrapper } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { FoodStickyCtaBar } from '@/components/food/FoodStickyCtaBar'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { parseMenuMarkdown, type MenuCategory } from '@/lib/menu-parser'
import { DietaryMenuNav } from '@/components/food/DietaryMenuNav'
import { PageTitle } from '@/components/ui/typography/PageTitle'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Vegan Pub Food Near Me | Menu & Prices | The Anchor',
  description: 'Vegan pub food near Heathrow Airport. Stone-baked garlic bread, chips, sweet potato fries, onion rings and pizzas that can be made vegan. Free parking, 7 mins from T5.',
  openGraph: {
    title: 'Vegan Pub Food | The Anchor Near Heathrow',
    description: 'Vegan pub food near Heathrow Airport. Stone-baked garlic bread, chips, sweet potato fries, onion rings and pizzas that can be made vegan on request.',
    images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg'],
  },
  twitter: getTwitterMetadata({
    title: 'Vegan Pub Food | The Anchor Near Heathrow',
    description: 'Vegan pub food near Heathrow. Stone-baked garlic bread, chips, sweet potato fries, onion rings and pizzas that can be made vegan on request.',
    images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg'],
  }),
  alternates: {
    canonical: '/food-menu/vegan',
  },
}

interface DietaryMenuItem {
  name: string
  price: string
  description: string
  category: string
  note?: string
}

function extractVeganItems(categories: MenuCategory[]): {
  fullyVegan: DietaryMenuItem[]
  veganOption: DietaryMenuItem[]
} {
  const fullyVegan: DietaryMenuItem[] = []
  const veganOption: DietaryMenuItem[] = []
  const seenVegan = new Set<string>()

  for (const category of categories) {
    for (const section of category.sections) {
      for (const item of section.items) {
        if (item.vegan && !seenVegan.has(item.name)) {
          seenVegan.add(item.name)
          fullyVegan.push({
            name: item.name,
            price: item.price,
            description: item.description,
            category: category.title,
          })
        }
      }
    }
  }

  for (const category of categories) {
    for (const section of category.sections) {
      for (const item of section.items) {
        if (item.veganOptionAvailable && !item.vegan && !seenVegan.has(item.name)) {
          seenVegan.add(item.name)
          const note = item.name.includes('pizza') || item.name === 'Rustic Classic' || item.name === 'The Garden Club'
            ? 'Ask for no mozzarella'
            : 'Ask at the bar for vegan preparation'
          veganOption.push({
            name: item.name,
            price: item.price,
            description: item.description,
            category: category.title,
            note,
          })
        }
      }
    }
  }

  return { fullyVegan, veganOption }
}

function MenuItemCard({ item, badge }: { item: DietaryMenuItem; badge: string }) {
  return (
    <div className="flex justify-between items-start gap-4 py-4 border-b border-anchor-gold/10 last:border-b-0">
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-anchor-cream-text">{item.name}</h3>
          <span className="inline-flex items-center rounded-full bg-green-900/40 border border-green-500/30 px-2 py-0.5 text-xs font-medium text-green-300">
            {badge}
          </span>
        </div>
        {item.description && (
          <p className="text-sm text-anchor-cream-text/60 mt-1">{item.description}</p>
        )}
        {item.note && (
          <p className="text-sm text-amber-400/80 mt-1 italic">{item.note}</p>
        )}
        <p className="text-xs text-anchor-cream-text/40 mt-1">{item.category}</p>
      </div>
      {item.price && (
        <span className="text-anchor-gold-vivid font-semibold whitespace-nowrap">&pound;{item.price}</span>
      )}
    </div>
  )
}

export default async function VeganMenuPage() {
  const menuData = await parseMenuMarkdown('food')

  if (!menuData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-anchor-bg">
        <p className="text-xl text-anchor-cream-text/70">Menu temporarily unavailable. Please call us on 01753 682707.</p>
      </div>
    )
  }

  const { fullyVegan, veganOption } = extractVeganItems(menuData.categories)

  const faqItems = [
    {
      question: 'Does The Anchor have vegan food?',
      answer: 'Yes. Our garlic bread, chips, chunky chips, sweet potato fries and onion rings are all fully vegan. Two of our stone-baked pizzas can also be made vegan by removing the mozzarella.',
    },
    {
      question: 'Can pizzas be made vegan?',
      answer: 'Yes, our Rustic Classic and Garden Club pizzas can be made vegan by removing the mozzarella. The stone-baked bases and tomato sauce are already vegan.',
    },
    {
      question: 'Are the chips vegan?',
      answer: 'Yes, our chips, chunky chips, sweet potato fries and onion rings are all vegan.',
    },
    {
      question: 'Is the garlic bread vegan?',
      answer: "Yes, our stone-baked garlic bread is vegan \u2014 we don\u2019t use butter. It\u2019s been accidentally vegan since day one.",
    },
    {
      question: 'Is there a vegan Sunday roast?',
      answer: 'Currently our Sunday roast options include a vegetarian butternut squash wellington but it contains dairy. Ask about seasonal vegan options when you visit.',
    },
    {
      question: 'Are the burgers vegan?',
      answer: 'No. Our Garden Veg Burger and Garden Stack are vegetarian but not vegan. If you\u2019re looking for a vegan main, the stone-baked pizzas without mozzarella are your best option.',
    },
    {
      question: 'Can I build a full vegan meal at The Anchor?',
      answer: 'Yes. A vegan pizza (ask for no mozzarella) with chips, sweet potato fries and garlic bread makes a proper full meal. Everything on that list is fully plant-based as standard.',
    },
    {
      question: 'Is The Anchor good for vegan travellers near Heathrow?',
      answer: 'Yes. We are 7 minutes from Heathrow Terminal 5 with free parking. We have vegan options available and can accommodate dietary requirements \u2014 far better than the limited options inside the terminal.',
    },
    {
      question: 'Do you label vegan items on your menu?',
      answer: 'Yes. Fully vegan dishes are labelled VE on our menu. Dishes that can be made vegan on request are labelled VEO. Just ask at the bar if you are unsure.',
    },
    {
      question: 'Are your vegan options gluten-free too?',
      answer: 'Some vegan items overlap with gluten-free options. Our chips and sweet potato fries are naturally gluten-free and vegan. Stone-baked pizzas are available with a gluten-free base and can be made vegan. Ask at the bar for full allergen details.',
    },
    {
      question: 'What is the best vegan main course at The Anchor?',
      answer: 'Our stone-baked Rustic Classic or Garden Club pizza without mozzarella is our most popular vegan main. The bases and tomato sauce are naturally dairy-free, and the toppings work brilliantly without cheese.',
    },
  ]

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Food Menu', url: '/food-menu' },
          { name: 'Vegan Menu', url: '/food-menu/vegan' },
        ]}
      />

      <HeroWrapper
        route="/food-menu/vegan"
        title="Vegan Menu"
        description="Genuine vegan options at a traditional pub near Heathrow — garlic bread, chips, sides and stone-baked pizzas made vegan on request."
        variant="default"
        breadcrumbs={[
          { name: 'Food & Drink', href: '/food-menu' },
          { name: 'Vegan' },
        ]}
        tags={[
          { label: 'Stone-baked garlic bread', variant: 'default' },
          { label: 'Vegan sides', variant: 'default' },
          { label: 'Pizzas (VEO)', variant: 'default' },
        ]}
        ctaContainerClassName="gap-4 sm:items-center"

[truncated at line 200 — original has 612 lines]
```

### `app/food-menu/vegetarian/page.tsx`

```
import Link from 'next/link'
import { Metadata } from 'next'
import { Container, Section, Card, CardBody, Alert } from '@/components/ui'
import { CTASection, SectionHeader } from '@/components/ui'
import { BookTableButton } from '@/components/BookTableButton'
import { HeroWrapper } from '@/components/hero'
import { MenuSectionCta } from '@/components/food/MenuSectionCta'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { parseMenuMarkdown, type MenuData, type MenuCategory } from '@/lib/menu-parser'
import { getBusinessHours, isKitchenOpen } from '@/lib/api'
import { formatTime12Hour } from '@/lib/time-utils'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { MenuRenderer } from '@/components/MenuRenderer'
import { DietaryMenuNav } from '@/components/food/DietaryMenuNav'
import { PageTitle } from '@/components/ui/typography/PageTitle'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Vegetarian Menu | Pub Food Near Heathrow',
  description: 'Vegetarian pub food near Heathrow Airport. From butternut squash pie to stone-baked pizzas and mac & cheese. Proper meat-free meals, not afterthoughts. Free parking.',
  openGraph: {
    title: 'Vegetarian Menu | Pub Food Near Heathrow',
    description: 'Vegetarian pub food near Heathrow Airport. From butternut squash pie to stone-baked pizzas and mac & cheese. Proper meat-free meals, not afterthoughts.',
  },
  twitter: getTwitterMetadata({
    title: 'Vegetarian Menu | Pub Food Near Heathrow',
    description: 'Vegetarian pub food near Heathrow Airport. From butternut squash pie to stone-baked pizzas and mac & cheese. Proper meat-free meals, not afterthoughts.',
  }),
  alternates: {
    canonical: '/food-menu/vegetarian',
  },
}

/** Filter menu data to only include vegetarian and vegan items */
function filterVegetarianMenu(menuData: MenuData): MenuData {
  return {
    ...menuData,
    categories: menuData.categories
      .map((category): MenuCategory => ({
        ...category,
        sections: category.sections
          .map((section) => ({
            ...section,
            items: section.items.filter(
              (item) => item.vegetarian === true || item.vegan === true
            ),
          }))
          .filter((section) => section.items.length > 0),
      }))
      .filter((category) => category.sections.length > 0),
  }
}

/** Editorial copy to insert between specific menu categories */
const EDITORIAL_COPY: Record<string, string> = {
  pies: 'Our butternut squash, mixed bean and mature cheddar pie is the vegetarian star of the classics \u2014 same golden pastry and rich filling as our meat pies, just without the meat. It\u2019s the dish vegetarian regulars keep coming back for.',
  burgers: 'The Garden Veg Burger is a proper burger, not a token afterthought. Served with onion ring, salad and chips for \u00A311 \u2014 or go for the Garden Stack at \u00A314 if you\u2019re properly hungry. Upgrade to sweet potato fries or cheesy chips for a couple of quid more.',
  'comfort-favourites': 'Mac and cheese with crispy onions and garlic bread is the kind of comfort food that makes you forget you\u2019re eating vegetarian. Our spinach and ricotta cannelloni is another favourite \u2014 baked in tomato sauce and served with salad.',
  pizza: 'Every pizza on our menu can be ordered vegetarian. The Rustic Classic and Garden Club are vegetarian as standard \u2014 and both can be made vegan by removing the mozzarella. Gluten-free bases available on all pizzas too.',
  desserts: 'Four of our five puddings are vegetarian, and two \u2014 sticky toffee pudding and chocolate fudge brownie \u2014 are naturally gluten-free as well. Save room.',
}

export default async function VegetarianMenuPage() {
  const [menuData, businessHours] = await Promise.all([
    parseMenuMarkdown('food'),
    getBusinessHours(),
  ])

  if (!menuData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-anchor-bg">
        <p className="text-xl text-anchor-cream-text/70">
          Menu temporarily unavailable. Please call us on 01753 682707.
        </p>
      </div>
    )
  }

  const vegetarianMenu = filterVegetarianMenu(menuData)

  // Count total vegetarian items
  const totalVegetarianItems = vegetarianMenu.categories.reduce(
    (total, category) =>
      total +
      category.sections.reduce((s, section) => s + section.items.length, 0),
    0
  )

  // Kitchen hours
  const kitchenScheduleParts: string[] = []
  if (businessHours) {
    const weekdays = [
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
    ] as const
    const weekdayHours = weekdays
      .map((day) => {
        const dayHours = businessHours.regularHours[day]
        if (!dayHours?.kitchen || !isKitchenOpen(dayHours.kitchen)) return null
        return {
          opens: formatTime12Hour(dayHours.kitchen.opens),
          closes: formatTime12Hour(dayHours.kitchen.closes),
        }
      })
      .filter(Boolean) as Array<{ opens: string; closes: string }>

    if (
      weekdayHours.length === weekdays.length &&
      weekdayHours.every(
        (h) =>
          h.opens === weekdayHours[0].opens &&
          h.closes === weekdayHours[0].closes
      )
    ) {
      kitchenScheduleParts.push(
        `Tuesday to Friday ${weekdayHours[0].opens}\u2013${weekdayHours[0].closes}`
      )
    } else {
      weekdayHours.forEach((h, i) => {
        const dayName =
          weekdays[i].charAt(0).toUpperCase() + weekdays[i].slice(1)
        kitchenScheduleParts.push(`${dayName} ${h.opens}\u2013${h.closes}`)
      })
    }

    const satKitchen = businessHours.regularHours.saturday?.kitchen
    if (satKitchen && isKitchenOpen(satKitchen)) {
      kitchenScheduleParts.push(
        `Saturday ${formatTime12Hour(satKitchen.opens)}\u2013${formatTime12Hour(satKitchen.closes)}`
      )
    }

    const sunKitchen = businessHours.regularHours.sunday?.kitchen
    if (sunKitchen && isKitchenOpen(sunKitchen)) {
      kitchenScheduleParts.push(
        `Sunday ${formatTime12Hour(sunKitchen.opens)}\u2013${formatTime12Hour(sunKitchen.closes)}`
      )
    }
  }

  const kitchenSchedule = kitchenScheduleParts.length > 0
    ? kitchenScheduleParts.join(', ')
    : null

  const faqItems = [
    {
      question: 'Does The Anchor have a vegetarian menu?',
      answer: `Yes, we serve over ${totalVegetarianItems} vegetarian dishes including pies, pizzas, pasta, burgers, sides and puddings.`,
    },
    {
      question: 'Is the vegetarian food cooked separately?',
      answer: 'Our dishes are prepared in one kitchen, so we cannot guarantee no cross-contamination. Ask at the bar for allergen info.',
    },
    {
      question: 'Can I get a vegetarian Sunday roast?',
      answer: 'Yes, butternut squash wellington is our vegetarian Sunday roast option (from \u00A319, pre-order by Saturday 1pm).',
    },
    {
      question: 'Are the vegetarian pizzas stone-baked?',
      answer: 'Yes, all pizzas including the Rustic Classic and Garden Club are stone-baked to order. Gluten-free bases available.',
    },
    {
      question: 'Is there a vegan menu too?',
      answer: 'Yes, see our vegan menu. Several items are vegan or can be made vegan on request.',
    },
    {
      question: 'Can I book a table for a vegetarian meal near Heathrow?',
      answer: 'Absolutely. Reserve online or call 01753 682707 \u2014 we\u2019re 7 minutes from Heathrow with free parking.',
    },
    {
      question: 'What vegetarian mains do you serve?',
      answer: 'Our vegetarian mains include butternut squash, mixed bean and mature cheddar pie; Garden Veg Burger; Garden Stack; spinach and ricotta cannelloni; mac and cheese; and stone-baked pizzas. All are cooked fresh to order.',
    },
    {
      question: 'Is the mac and cheese vegetarian?',
      answer: 'Yes, our mac and cheese with crispy onions and garlic bread is fully vegetarian. It is one of our most popular comfort dishes.',
    },
    {
      question: 'Are your vegetarian options suitable for Heathrow travellers?',
      answer: 'Yes. We are just 7 minutes from Heathrow Terminal 5 with free parking. Many vegetarian travellers stop in before or after a flight for a proper sit-down meal rather than airport food.',
    },
    {
      question: 'Can vegetarian dishes be made gluten-free?',
      answer: 'Several of our vegetarian dishes are naturally gluten-free or can be adapted. Our stone-baked pizzas are available with a gluten-free base. Ask at the bar for full allergen and gluten-free information.',
    },
  ]

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Food Menu', url: '/food-menu' },
          { name: 'Vegetarian Menu', url: '/food-menu/vegetarian' },
        ]}

[truncated at line 200 — original has 622 lines]
```

### `app/gtm-debug/head.tsx`

_(deleted or missing from working tree)_

### `app/gtm-debug/page.tsx`

_(deleted or missing from working tree)_

### `app/karaoke/page.tsx`

```

import Image from 'next/image'
import { Metadata } from 'next'
import {
    Button,
    Section,
    Container,
    Card,
    CardBody,
    Grid,
    GridItem,
} from '@/components/ui'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { PhoneButton } from '@/components/PhoneButton'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { EventSchema } from '@/components/seo/EventSchema'
import { EventBookingButton } from '@/components/EventBookingButton'
import {
    getEventCategories,
    getUpcomingEventsByCategory,
    formatEventDate,
    formatEventTime,
    formatDoorTime,
    type Event,
    type EventCategory
} from '@/lib/api'
import { getEventWebsiteUrl } from '@/lib/event-url'
import { staticEvents } from '@/lib/static-events'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { BookTableButton } from '@/components/BookTableButton'
import { RegretReduction } from '@/components/psychology'
import { DEFAULT_EVENT_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { getBusinessStats } from '@/lib/schema-with-reviews'
import { jsonLdSafeStringify } from '@/lib/jsonld'

export const metadata: Metadata = {
    title: 'Karaoke Fridays Near Heathrow | Free Entry | The Anchor',
    description:
        'Karaoke every Friday 8–11pm at The Anchor, Stanwell Moor. 50,000+ songs, hosted nights, free entry & free parking. 7 mins from Heathrow T5. Grab the mic tonight.',
    openGraph: {
        title: 'Karaoke Pub Near Heathrow | The Anchor',
        description: '50,000+ songs, hosted by Nikki Manfadge, Fridays 8-11pm. Free entry. Sing your heart out in Stanwell Moor.',
        images: [{ url: DEFAULT_EVENT_IMAGE, width: 1200, height: 630, alt: 'Events at The Anchor pub near Heathrow' }]
    },
    twitter: getTwitterMetadata({
        title: 'Karaoke Pub Near Heathrow | The Anchor',
        description: '50,000+ songs, hosted by Nikki Manfadge, Fridays 8-11pm. Free entry. Sing your heart out in Stanwell Moor.',
        images: [DEFAULT_EVENT_IMAGE]
    }),
    alternates: {
        canonical: '/karaoke'
    }
}

const KARAOKE_CATEGORIES = [
    {
        name: 'Karaoke',
        slug: 'karaoke-night'
    },
    {
        name: "Nikki's Karaoke Night",
        slug: 'nikkis-karaoke-night'
    }
]

const normalizeCategoryValue = (value?: string | null) =>
    value?.toLowerCase().replace(/\s+/g, ' ').trim() ?? ''

function getCategoryIdsByLabels(categories: EventCategory[], labels: typeof KARAOKE_CATEGORIES) {
    return labels
        .map(label => {
            const targetName = normalizeCategoryValue(label.name)
            const targetSlug = normalizeCategoryValue(label.slug)

            return categories.find(category => {
                const categoryName = normalizeCategoryValue(category.name)
                const categorySlug = normalizeCategoryValue(category.slug)
                return categoryName === targetName || categorySlug === targetSlug
            })?.id
        })
        .filter((id): id is string => Boolean(id))
}

async function getKaraokeEvents() {
    const categories = await getEventCategories()
    const categoryIds = getCategoryIdsByLabels(categories, KARAOKE_CATEGORIES)
    if (!categoryIds.length) return []

    const eventSets = await Promise.all(
        categoryIds.map(categoryId => getUpcomingEventsByCategory(categoryId, 60, 365))
    )
    const events = eventSets.flat()
    const uniqueEvents = Array.from(new Map(events.map(event => [event.id, event])).values())

    return uniqueEvents.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
}

const WHY_LOVE_IT = [
    {
        icon: '',
        title: '50,000+ Songs',
        body: 'From 80s power ballads to today\'s chart-toppers, our library of over 50,000 tracks means if you can hum it, you can probably sing it.'
    },
    {
        icon: '',
        title: 'Free to Sing',
        body: 'No entry fee, no cost to sing. Just grab a drink, pick your track, and claim the spotlight. It\'s all about having fun.'
    },
    {
        icon: '',
        title: 'Liquid Courage',
        body: 'Need a confidence boost? Our bar is fully stocked with craft beers, cocktails, and shots to help you hit those high notes.'
    },
    {
        icon: '',
        title: 'Hosted by Nikki Manfadge',
        body: 'Nikki keeps the energy high, the queue moving, and the crowd singing along. Duets with Nikki, lip sync battles, props and costumes provided.'
    },
    {
        icon: '',
        title: 'Supportive Crowd',
        body: 'Whether you\'re a pro vocalist or just having a laugh, the Stanwell Moor crowd is always behind you. Good vibes only!'
    }
]

const FAQS = [
    {
        question: 'When is karaoke night?',
        answer:
            'Karaoke is on Fridays from 8pm to 11pm, hosted by Nikki Manfadge. Check the upcoming dates below or our What\'s On page to confirm the next session.'
    },
    {
        question: 'Do I have to pay to sing?',
        answer:
            'Not a penny! Entry is free and singing is free. Just buy a drink and enjoy the night.'
    },
    {
        question: 'Do I need to book a table?',
        answer:
            'It\'s first come, first served for tables, but there\'s plenty of room. If you\'re bringing a big group, give us a call on 01753 682707 and we\'ll try to save you a spot.'
    },
    {
        question: 'Can I request a specific song?',
        answer:
            'Absolutely! Our karaoke host has a huge digital library. Just ask them on the night and they\'ll get you queued up.'
    },
    {
        question: 'Is it suitable for children?',
        answer:
            'Karaoke is great fun for families in the early evening. However, after 9pm, it\'s strictly 18+ as the pub gets busier.'
    }
]

function KaraokeEventCards({ events }: { events: Event[] }) {
    if (!events.length) {
        return (
            <div className="bg-anchor-bg-card border border-anchor-gold/15 rounded-xl p-6 text-center">
                <p className="text-lg font-semibold text-anchor-gold-vivid mb-2">Next karaoke dates coming soon</p>
                <p className="text-anchor-cream-text/70">
                    We're tuning the mics and scheduling the next night. Call 01753 682707 or check back shortly.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {events.map((event, index) => {
                const doorTime = formatDoorTime(event.doorTime)
                const startTime = formatEventTime(event.startDate)
                const isTentative = new Date(event.startDate).getTime() > new Date().getTime() + 30 * 24 * 60 * 60 * 1000 || (event.eventStatus || '').toLowerCase().includes('draft')
                const eventUrl = getEventWebsiteUrl(event)
                const imageSrc = event.heroImageUrl || event.image?.[0] || null

                return (
                    <Card key={event.id} className="overflow-hidden border border-anchor-sand shadow-lg">
                        <div className="bg-anchor-green text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-xs uppercase tracking-wide text-white/70">Karaoke Night</p>
                                    {isTentative && (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500 text-white border border-blue-400">
                                            TENTATIVE
                                        </span>
                                    )}
                                </div>
                                <Link href={eventUrl} className="block text-xl font-bold text-white hover:text-anchor-gold transition">
                                    {event.name}
                                </Link>
                                <p className="text-sm text-white/80 line-clamp-1">{formatEventDate(event.startDate)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-semibold text-white">{startTime}</p>
                                <p className="text-xs text-white/70">Free Entry</p>
                            </div>

[truncated at line 200 — original has 619 lines]
```

### `app/layout.tsx`

```
import type { Metadata } from 'next'
import { Outfit, Merriweather } from 'next/font/google'
import dynamic from 'next/dynamic'
import Script from 'next/script'
import './globals.css'
import { WebVitals } from './web-vitals'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { HeaderStatusSectionDirect } from '@/components/layout/HeaderStatusSectionDirect'
import { FloatingActions } from '@/components/layout/FloatingActions'
import { AnalyticsProvider } from '@/components/tracking/AnalyticsProvider'
import { GTMProvider } from '@/components/tracking/GTMProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import CookieBanner from '@/components/CookieBanner'
import { DynamicSchema } from '@/components/seo/DynamicSchema'
import { BusinessHoursProvider } from '@/components/providers/BusinessHoursProvider'
import { DeferredRender } from '@/components/DeferredRender'
import { DEFAULT_OG_IMAGE } from '@/lib/image-fallbacks'
import {
  PRIVATE_HIRE_2026_PROMO_ENABLED,
  PRIVATE_HIRE_2026_PROMO_ENDS_AT_MS
} from '@/lib/promos/privateHire2026'
import { Suspense } from 'react'


const EventCountdownBanner = dynamic(() => import('@/components/EventCountdownBanner').then(mod => mod.EventCountdownBanner), {
  ssr: false
})

const ChristmasLightbox = dynamic(() => import('@/components/features/christmas/ChristmasLightbox').then(mod => mod.ChristmasLightbox), {
  ssr: false
})

const PrivateHire2026PromoGate = dynamic(
  () => import('@/components/promos/PrivateHire2026PromoGate').then(mod => mod.PrivateHire2026PromoGate),
  { ssr: false }
)

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const merriweather = Merriweather({
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-merriweather',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.the-anchor.pub'),
  title: {
    default: 'The Anchor Pub | Stanwell Moor | Near Heathrow',
    template: '%s | The Anchor Stanwell Moor'
  },
  description: 'The Anchor, Stanwell Moor — rated 4.6/5 on Google. Traditional pub 7 mins from Heathrow T5. Sunday roasts, quiz nights, karaoke Fridays, beer garden & free parking.',
  authors: [{ name: 'The Anchor' }],
  creator: 'The Anchor',
  publisher: 'The Anchor',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'The Anchor | Pub Near Heathrow Airport | Stanwell Moor',
    description: 'Traditional British venue near Heathrow with hosted events, live entertainment & great food. Dog-friendly beer garden.',
    url: 'https://www.the-anchor.pub',
    siteName: 'The Anchor',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'The Anchor in Stanwell Moor',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Anchor - Near Heathrow Airport',
    description: 'Traditional venue with modern entertainment. Quiz nights, hosted events, great food & more.',
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-WWFQTQS'
  const now = new Date()
  const privateHirePromoActive =
    PRIVATE_HIRE_2026_PROMO_ENABLED && now.getTime() < PRIVATE_HIRE_2026_PROMO_ENDS_AT_MS
  const promoCtaButtons = [
    {
      label: "Valentine's Day",
      href: '/valentines-day',
      external: false,
      variant: 'secondary' as const,
      startsOn: '2026-02-14',
      endsOn: '2026-02-14'
    },
    {
      label: "Mother's Day",
      href: '/mothers-day',
      external: false,
      variant: 'secondary' as const,
      startsOn: '2026-03-15',
      endsOn: '2026-03-15'
    },
    {
      label: 'World Cup 2026',
      href: '/live-sport/world-cup',
      external: false,
      variant: 'secondary' as const,
      startsOn: '2026-06-11',
      endsOn: '2026-07-19'
    }
  ]

  const tertiaryCtaButton = (() => {
    // Six Nations ends March 15th 2026
    if (now < new Date('2026-03-16')) { // Using 16th to include the full day of 15th
      return {
        label: 'Six Nations 2026',
        href: '/live-sport/six-nations',
        external: false,
        variant: 'secondary' as const
      }
    }
    // Show Christmas from August 1st 2026
    if (now >= new Date('2026-08-01')) {
      return {
        label: 'Christmas 2026',
        href: '/christmas-parties',
        external: false,
        variant: 'secondary' as const
      }
    }
    return null
  })()

  return (
    <html lang="en">
      <head>
        {/* Resource hints for performance */}
        <link rel="preconnect" href="https://management.orangejelly.co.uk" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />

        {/* Favicons and manifest */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#005131" />
        <meta name="format-detection" content="telephone=no" />

        {/* Next.js handles font and image prioritisation automatically */}
        <DynamicSchema />
      </head>
      <body className={`font-sans antialiased ${outfit.variable} ${merriweather.variable}`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=

[truncated at line 200 — original has 255 lines]
```

### `app/live-music/page.tsx`

```

import Image from 'next/image'
import { Metadata } from 'next'
import {
    Button,
    Section,
    Container,
    Card,
    CardBody,
    Grid,
    GridItem,
    SectionHeader,
} from '@/components/ui'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { PhoneButton } from '@/components/PhoneButton'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { EventSchema } from '@/components/seo/EventSchema'
import { EventBookingButton } from '@/components/EventBookingButton'
import {
    getEventCategories,
    getUpcomingEventsByCategory,
    formatEventDate,
    formatEventTime,
    formatDoorTime,
    type Event,
    type EventCategory
} from '@/lib/api'
import { getEventWebsiteUrl } from '@/lib/event-url'
import { staticEvents } from '@/lib/static-events'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { BookTableButton } from '@/components/BookTableButton'
import { DEFAULT_EVENT_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { liveMusicEventSeries } from '@/lib/schema'
import { jsonLdSafeStringify } from '@/lib/jsonld'

export const metadata: Metadata = {
    title: 'Live Music Pub Near Heathrow | Bands & Open Mic | The Anchor',
    description:
        'The best live music pub near Heathrow — bands, acoustic sessions & open mic nights monthly in Stanwell Moor. Free entry, free parking, 7 mins from T5. See upcoming gigs.',
    openGraph: {
        title: 'Live Music Pub Near Heathrow | The Anchor, Stanwell Moor',
        description: 'The best live music pub near Heathrow — bands, acoustic sessions & open mic nights monthly. Free entry, free parking, 7 mins from T5.',
        images: [{ url: DEFAULT_EVENT_IMAGE, width: 1200, height: 630, alt: 'Events at The Anchor pub near Heathrow' }]
    },
    twitter: getTwitterMetadata({
        title: 'Live Music Pub Near Heathrow | The Anchor, Stanwell Moor',
        description: 'The best live music pub near Heathrow — bands, acoustic sessions & open mic nights monthly. Free entry, free parking, 7 mins from T5.',
        images: [DEFAULT_EVENT_IMAGE]
    }),
    alternates: {
        canonical: '/live-music'
    }
}

const LIVE_MUSIC_CATEGORY = {
    name: 'Live Music',
    slug: 'live-music'
}

const OPEN_MIC_CATEGORY = {
    name: 'Open Mic Night',
    slug: 'open-mic-night'
}

const normalizeCategoryValue = (value?: string | null) =>
    value?.toLowerCase().replace(/\s+/g, ' ').trim() ?? ''

function getCategoryIdByLabel(categories: EventCategory[], label: typeof LIVE_MUSIC_CATEGORY) {
    const targetName = normalizeCategoryValue(label.name)
    const targetSlug = normalizeCategoryValue(label.slug)

    return categories.find(category => {
        const categoryName = normalizeCategoryValue(category.name)
        const categorySlug = normalizeCategoryValue(category.slug)
        return categoryName === targetName || categorySlug === targetSlug
    })?.id
}

function isOpenMicEvent(event: Event) {
    const targetName = normalizeCategoryValue(OPEN_MIC_CATEGORY.name)
    const targetSlug = normalizeCategoryValue(OPEN_MIC_CATEGORY.slug)
    const categoryName = normalizeCategoryValue(event.category?.name)
    const categorySlug = normalizeCategoryValue(event.category?.slug)

    return categoryName === targetName || categorySlug === targetSlug
}

async function getLiveMusicEvents() {
    const categories = await getEventCategories()
    const liveMusicCategoryId = getCategoryIdByLabel(categories, LIVE_MUSIC_CATEGORY)
    const openMicCategoryId = getCategoryIdByLabel(categories, OPEN_MIC_CATEGORY)

    const categoryIds = [liveMusicCategoryId, openMicCategoryId].filter(Boolean) as string[]
    if (categoryIds.length === 0) return []

    const results = await Promise.all(
        categoryIds.map((categoryId) => getUpcomingEventsByCategory(categoryId, 60, 365))
    )

    const merged = results.flat()
    const deduped = Array.from(new Map(merged.map(event => [event.id, event])).values())

    return deduped.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
}

const WHY_LOVE_IT = [
    {
        icon: '',
        title: 'Top Local Talent',
        body: 'From high-energy party bands to soulful acoustic soloists, we hand-pick the best local performers to get the pub jumping.'
    },
    {
        icon: '',
        title: 'Always Free Entry',
        body: 'No tickets, no cover charge. Just turn up, grab a pint, and enjoy the show. We believe live music should be accessible to everyone.'
    },
    {
        icon: '',
        title: 'Proper Pub Atmosphere',
        body: "Great acoustics, friendly crowds, and plenty of space to dance or chill. It's exactly how a pub gig should feel."
    },
    {
        icon: '',
        title: 'Fuel for the Show',
        body: 'Kitchen open until midnight for burgers, pizzas and sharers. Perfect for lining the stomach before the band starts.'
    }
]

const FAQS = [
    {
        question: 'When is live music on?',
        answer:
            "We host live music regularly, typically on weekends or special events. Check our upcoming dates list below or the What's On page for the latest schedule."
    },
    {
        question: 'Is there an entry fee?',
        answer:
            'Nope! Live music at The Anchor is always free entry. Just bring money for drinks and food.'
    },
    {
        question: 'What kind of music do you have?',
        answer:
            "We offer a mix of genres, from classic rock and pop covers to acoustic sessions and tribute acts. There's something for everyone."
    },
    {
        question: 'Do I need to book a table?',
        answer:
            "Booking is recommended if you want to guarantee a seat, especially for popular bands. However, there's usually plenty of standing room at the bar."
    },
    {
        question: 'Can kids come to live music?',
        answer:
            "Yes, until 9pm. After that, due to licensing, it's 18+ only."
    },
    {
        question: 'Is there live music near Heathrow Airport?',
        answer:
            'Yes — Live at The Anchor hosts bands and open mic nights monthly, just 7 minutes from Heathrow Terminal 5. Free entry, free parking.'
    },
    {
        question: 'How can I perform at The Anchor?',
        answer:
            'Sign up for our open mic nights or contact us about performing as part of the Live at The Anchor programme. See our open mic page for details.'
    },
    {
        question: 'Do you charge for live music events?',
        answer:
            'No — all Live at The Anchor gigs are free entry. Just turn up, grab a drink, and enjoy the music.'
    }
]

function MusicEventCards({ events }: { events: Event[] }) {
    if (!events.length) {
        return (
            <div className="bg-anchor-bg-card border border-anchor-gold/15 rounded-xl p-6 text-center">
                <p className="text-lg font-semibold text-anchor-gold-vivid mb-2">New gigs announced soon</p>
                <p className="text-anchor-cream-text/70">
                    We’re booking our next acts right now. Call 01753 682707 or check back soon for the latest lineup.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {events.map((event, index) => {
                const doorTime = formatDoorTime(event.doorTime)
                const startTime = formatEventTime(event.startDate)
                const isDraft = (event.eventStatus || '').toLowerCase().includes('draft')
                const isScheduled = (event.eventStatus || '').toLowerCase().includes('scheduled')
                const isTentative = isDraft || (!isScheduled && new Date(event.startDate).getTime() > new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
                const openMic = isOpenMicEvent(event)
                const eventUrl = getEventWebsiteUrl(event)
                const imageSrc = event.heroImageUrl || event.image?.[0] || null

                return (

[truncated at line 200 — original has 604 lines]
```

### `app/live-sport/page.tsx`

```
import Link from 'next/link'
import { Button, CTASection, SectionHeader, FeatureGrid, FeatureCard, InfoBoxGrid, AlertBox, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { generateBreadcrumbSchema } from '@/lib/enhanced-schemas'
import { Metadata } from 'next'
import { CONTACT, BRAND } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { getBusinessStats } from '@/lib/schema-with-reviews'
import { jsonLdSafeStringify } from '@/lib/jsonld'

export const metadata: Metadata = {
    title: 'Watch Live Sport Near Heathrow | Big Screens | The Anchor',
    description: `Watch Six Nations, Euros, F1 & World Cup on big screens at The Anchor, Stanwell Moor. Terrestrial sport, great atmosphere, free parking, 7 mins from Heathrow T5.`,
    openGraph: {
        title: 'Watch Live Sport Near Heathrow — Major Tournaments on Big Screens',
        description: 'Six Nations, World Cup, Euros and F1 on big screens with a cold pint and free parking. 7 mins from Heathrow T5.',
        images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
        type: 'website',
    },
    twitter: getTwitterMetadata({
        title: 'Watch Live Sport Near Heathrow — Major Tournaments on Big Screens',
        description: 'Six Nations, World Cup, Euros and F1 on big screens with free parking and great food. 7 mins from Heathrow T5.',
        images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
        canonical: '/live-sport'
    }
}

export default async function LiveSportPage() {
    const { rating, reviewCount } = await getBusinessStats()

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Live Sport', url: '/live-sport' }
    ])

    // Using SportsActivityLocation schema if possible, or generic LocalBusiness with specific description
    const sportsSchema = {
        "@context": "https://schema.org",
        "@type": "SportsActivityLocation",
        "name": `${BRAND.name} - Live Sport`,
        "description": "Watch major sporting events on big screens — Six Nations, World Cup, Euros, F1 and more. Free parking and great food near Heathrow.",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": CONTACT.address.street,
            "addressLocality": CONTACT.address.town,
            "postalCode": CONTACT.address.postcode,
            "addressCountry": CONTACT.address.country
        },
        "telephone": CONTACT.phoneIntl,
        "image": DEFAULT_PAGE_HEADER_IMAGE,
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": rating,
            "reviewCount": reviewCount,
            "bestRating": "5",
            "worstRating": "1"
        }
    }

    const screeningEventSchema = {
        "@context": "https://schema.org",
        "@type": "ScreeningEvent",
        "name": "Live Sport Screenings at The Anchor",
        "description": "Watch Six Nations, World Cup 2026, Euros and F1 on big screens at The Anchor. Terrestrial channels only (BBC, ITV, Channel 4).",
        "location": {
            "@type": "Place",
            "name": "The Anchor",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": CONTACT.address.street,
                "addressLocality": CONTACT.address.town,
                "addressRegion": "Surrey",
                "postalCode": CONTACT.address.postcode,
                "addressCountry": "GB"
            }
        },
        "organizer": {
            "@id": "https://www.the-anchor.pub/#organization"
        },
        "isAccessibleForFree": true,
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "GBP",
            "availability": "https://schema.org/InStock",
            "description": "Free entry — just turn up and enjoy"
        }
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify([sportsSchema, breadcrumbSchema, screeningEventSchema]) }}
            />

            <HeroWrapper
                route="/live-sport"
                title="Live Sport at The Anchor"
                description="Terrestrial Channels Only (BBC/ITV/Channel 4). Multiple Screens. Great Food. The best atmosphere outside the stadium."
                variant="default"
                primaryCta={
                    <BookTableButton
                        source="sport_hero"
                        context="dining_sport"
                        variant="primary"
                        size="lg"
                        className="w-full sm:w-auto"
                    >
                        Book Best Seat
                    </BookTableButton>
                }
                secondaryCta={
                    <Link href="#schedule">
                        <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                            See What's On
                        </Button>
                    </Link>
                }
                secondaryInfo={
                    <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 mt-2">
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Free parking · 20 spaces</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">7 min from Heathrow T5</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Dog &amp; family friendly</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Super-fast fibre broadband</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Free entry</span>
                    </div>
                }
            />

            <Container className="py-8">
                <PageTitle as="h1" className="text-center mb-6" seo={{ structured: true }}>
                    Live Sport Pub Near Heathrow — Big Screens &amp; Great Atmosphere
                </PageTitle>
            </Container>

            <section className="bg-anchor-bg py-6">
                <Container>
                    <p className="text-center text-sm text-anchor-cream-text/55"><strong>Rated 4.6/5 on Google</strong> · Highest-rated non-airport pub near Heathrow</p>
                </Container>
            </section>

            <section className="py-8 bg-anchor-bg">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <PageTitle className="text-anchor-gold-vivid mb-4">
                            Never Miss a Moment
                        </PageTitle>
                        <p className="text-lg text-anchor-cream-text/70">
                            Whether it's the Six Nations crunch match, the F1 season finale, or major tournaments, we show it all. With multiple HD screens positioned throughout the pub, you won't have to crane your neck to see the action.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg-raised">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <SectionHeader
                            title="The Viewing Experience"
                            subtitle="We take sport seriously."
                        />

                        <FeatureGrid
                            columns={3}
                            features={[
                                {
                                    icon: "",
                                    title: "Terrestrial Sport Only",
                                    description: "We show major events on free-to-air channels (BBC, ITV, Channel 4). Please note we do NOT have Sky Sports or TNT Sports.",
                                    variant: "colored",
                                    color: "bg-anchor-bg-raised",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "Full Match Audio",
                                    description: "For big games, we turn the commentary up so you get the full stadium atmosphere.",
                                    variant: "colored",
                                    color: "bg-anchor-bg-raised",
                                    className: "rounded-xl p-6 text-center"
                                },
                                {
                                    icon: "",
                                    title: "Great Atmosphere",
                                    description: "Enjoy a cold pint and great food in a proper pub atmosphere. No booking required, just turn up and enjoy.",
                                    variant: "colored",
                                    color: "bg-anchor-bg-raised",
                                    className: "rounded-xl p-6 text-center"
                                }
                            ]}

[truncated at line 200 — original has 331 lines]
```

### `app/music-bingo/page.tsx`

```
import Image from 'next/image'
import { Metadata } from 'next'
import {
  Button,
  Section,
  Container,
  Card,
  CardBody,
  Grid,
  GridItem
} from '@/components/ui'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { PhoneButton } from '@/components/PhoneButton'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { EventSchema } from '@/components/seo/EventSchema'
import { EventBookingButton } from '@/components/EventBookingButton'
import { BookTableButton } from '@/components/BookTableButton'
import { RegretReduction } from '@/components/psychology'
import {
  getEventCategories,
  getUpcomingEventsByCategory,
  formatEventDate,
  formatEventTime,
  formatDoorTime,
  type Event,
  type EventCategory
} from '@/lib/api'
import { getEventWebsiteUrl } from '@/lib/event-url'
import { staticEvents } from '@/lib/static-events'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { DEFAULT_EVENT_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { JsonLd } from '@/components/JsonLd'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { bingoEventSeries } from '@/lib/schema'
import { getBusinessStats } from '@/lib/schema-with-reviews'
import { jsonLdSafeStringify } from '@/lib/jsonld'

export const metadata: Metadata = {
  title: 'Music Bingo Near Heathrow | Win Every Round | The Anchor',
  description:
    'Singalong Music Bingo at The Anchor, Stanwell Moor — song snippets replace numbers, prizes every round. Book early, it sells out. 7 mins from Heathrow T5.',
  openGraph: {
    title: 'Music Bingo Near Heathrow | The Anchor',
    description: 'Song snippets replace numbers, prizes every round. Book for this singalong bingo night in Stanwell Moor.',
    images: [{ url: DEFAULT_EVENT_IMAGE, width: 1200, height: 630, alt: 'Events at The Anchor pub near Heathrow' }]
  },
  twitter: getTwitterMetadata({
    title: 'Music Bingo Near Heathrow | The Anchor',
    description: 'Song snippets replace numbers, prizes every round. Book for this singalong bingo night in Stanwell Moor.',
    images: [DEFAULT_EVENT_IMAGE]
  }),
  alternates: {
    canonical: '/music-bingo'
  }
}

const MUSIC_BINGO_CATEGORY = {
  name: 'Music Bingo',
  slug: 'music-bingo'
}

const normalizeCategoryValue = (value?: string | null) =>
  value?.toLowerCase().replace(/\s+/g, ' ').trim() ?? ''

function getCategoryIdByLabel(categories: EventCategory[], label: typeof MUSIC_BINGO_CATEGORY) {
  const targetName = normalizeCategoryValue(label.name)
  const targetSlug = normalizeCategoryValue(label.slug)

  return categories.find(category => {
    const categoryName = normalizeCategoryValue(category.name)
    const categorySlug = normalizeCategoryValue(category.slug)
    return categoryName === targetName || categorySlug === targetSlug
  })?.id
}

async function getMusicBingoEvents() {
  const categories = await getEventCategories()
  const categoryId = getCategoryIdByLabel(categories, MUSIC_BINGO_CATEGORY)
  if (!categoryId) return []

  const events = await getUpcomingEventsByCategory(categoryId, 60, 365)
  return events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
}

const WHY_LOVE_IT = [
  {
    icon: '',
    title: 'Songs replace numbers',
    body: 'We play short clips from chart hits, throwbacks, and guilty pleasures. Mark the track on your card and you are closer to a line.'
  },
  {
    icon: '',
    title: 'Hosted by Nikki Manfadge',
    body: 'Expect big singalong energy, cheeky shout-outs, and bonus moments that keep the room buzzing between rounds.'
  },
  {
    icon: '',
    title: 'Prizes every round',
    body: 'Line wins, full house prizes, and surprise treats mean there is always something to play for.'
  },
  {
    icon: '',
    title: 'Food and cocktails ready',
    body: 'Order from the full menu before the first round or during breaks. The kitchen keeps your table fuelled.'
  },
  {
    icon: '',
    title: 'Friendly, all-ages vibe',
    body: 'Bring mates, family, or coworkers. We keep it welcoming, inclusive, and easy for first timers.'
  }
]

const FAQS = [
  {
    question: 'When does Music Bingo start and finish?',
    answer:
      'It typically starts at 7pm, but with Nikki hosting the show can run a little late. We play two games, so it finishes after those rounds.'
  },
  {
    question: 'How much is entry?',
    answer:
      'Entry is £3 per person.'
  },
  {
    question: 'Do we need to book in advance?',
    answer:
      'Booking is strongly recommended if you want a great seat, but walk-ins are welcome.'
  },
  {
    question: 'What is the format?',
    answer:
      'We play two games where you listen to the songs, then guess the song and artist on your card. It is a great excuse to sing along and dance between tracks.'
  },
  {
    question: 'Is Music Bingo suitable for families?',
    answer:
      'Absolutely. We play music from the 1950s to today, so bring a mix of ages to cover all the songs and artists.'
  },
  {
    question: 'Can we eat and drink during the games?',
    answer:
      'Absolutely. Our kitchen is normally open from 4pm to 9pm, so you can order throughout and enjoy it while you play.'
  },
  {
    question: 'Can you run a private Music Bingo night?',
    answer:
      'Yes, we can host private Music Bingo nights by request.'
  },
  {
    question: 'Where can I see the latest dates?',
    answer:
      'All of our dates for all upcoming events are available at https://www.the-anchor.pub/whats-on.'
  }
]

function getEntryLabel(event: Event) {
  const rawPrice = event.offers?.price
  const parsedPrice = rawPrice ? Number.parseFloat(rawPrice) : Number.NaN

  if (event.isAccessibleForFree || parsedPrice === 0) {
    return 'Free entry'
  }

  if (Number.isFinite(parsedPrice)) {
    return `£${parsedPrice} entry`
  }

  if (typeof rawPrice === 'string' && rawPrice.trim().length > 0) {
    return rawPrice.trim()
  }

  return 'Entry details announced'
}

function MusicBingoEventCards({ events }: { events: Event[] }) {
  if (!events.length) {
    return (
      <div className="rounded-xl border border-anchor-gold/15 bg-anchor-bg-card p-6 text-center">
        <p className="mb-2 text-lg font-semibold text-anchor-gold-vivid">New Music Bingo dates are loading soon</p>
        <p className="text-anchor-cream-text/70">
          We are lining up the next singalong sessions. Call 01753 682707 and we will share the next date as soon as booking opens.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {events.map((event, index) => {
        const doorTime = formatDoorTime(event.doorTime)
        const startTime = formatEventTime(event.startDate)
        const isDraft = (event.eventStatus || '').toLowerCase().includes('draft')
        const isScheduled = (event.eventStatus || '').toLowerCase().includes('scheduled')
        const isTentative = isDraft || (!isScheduled && new Date(event.startDate).getTime() > new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
        const eventUrl = getEventWebsiteUrl(event)
        const imageSrc = event.heroImageUrl || event.image?.[0] || null

[truncated at line 200 — original has 726 lines]
```

### `app/near-heathrow/page.tsx`

```
import Link from 'next/link'
import { Button, Container } from '@/components/ui'
import { HeroWrapper } from '@/components/hero'
import { Metadata } from 'next'
import { CTASection, SectionHeader, FeatureGrid } from '@/components/ui'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { BookTableButton } from '@/components/BookTableButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { SpeakableSchema } from '@/components/seo/SpeakableSchema'
import { SpeakableContent } from '@/components/voice/SpeakableContent'
import { parkingFacilitySchema } from '@/lib/schemas/parking'
import { DEFAULT_NEAR_HEATHROW_IMAGE } from '@/lib/image-fallbacks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { PhoneButton } from '@/components/PhoneButton'
import { localBusinessSchema } from '@/lib/schema'
import { FoodStickyCtaBar } from '@/components/food/FoodStickyCtaBar'

export const metadata: Metadata = {
  title: 'Pub Near Heathrow Airport | 7 Mins from T5 | The Anchor',
  description: 'Rated 4.6/5 on Google. Traditional pub 7 mins from Heathrow T5 — free parking, dog-friendly beer garden, Sunday roasts from £19, quiz nights & live events.',
  openGraph: {
    title: 'Pubs Near Heathrow Airport | 7 Mins from T5 | Free Parking | The Anchor',
    description: 'Rated 4.6/5 on Google. The closest traditional pub to Heathrow — 7 mins from T5, free parking, dog-friendly beer garden and food served daily.',
    images: [{ url: DEFAULT_NEAR_HEATHROW_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub near Heathrow Airport' }],
  },
  twitter: getTwitterMetadata({
    title: 'Pubs Near Heathrow Airport | 7 Mins from T5 | Free Parking | The Anchor',
    description: 'Rated 4.6/5. The closest traditional pub to Heathrow — 7 mins from T5, free parking, dog-friendly beer garden, Sunday roasts and pub food.',
    images: [DEFAULT_NEAR_HEATHROW_IMAGE]
  }),
  alternates: {
    canonical: '/near-heathrow'
  }
}

export default function NearHeathrowPage() {
  return (
    <>
      <FoodStickyCtaBar
        ctaContext="heathrow_layover"
        label="Book a Table"
      />
      <SpeakableSchema />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([localBusinessSchema, parkingFacilitySchema]) }}
      />
      {/* Hero Section */}
      <HeroWrapper
        route="/near-heathrow"
        title="Pubs Near Heathrow Airport — The Anchor"
        description="The best pub near Heathrow Airport — just 7 minutes from Terminal 5 with free parking, proper food and a beer garden under the flight path."
        variant="default"
        breadcrumbs={[
          { name: 'Near Heathrow' }
        ]}
        tags={[
          { label: '7 mins from T5', variant: 'success' },
          { label: 'Free Parking', variant: 'default' },
          { label: 'Full Menu', variant: 'default' },
          { label: 'Late Opening', variant: 'default' },
          { label: 'Free WiFi', variant: 'default' }
        ]}
        primaryCta={
          <BookTableButton
            source="near_heathrow_hero"
            context="heathrow_traveler"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
          />
        }
        secondaryCta={
          <>
            <Link href="#terminals" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                className="sm:w-auto"
              >
                View Terminal Directions
              </Button>
            </Link>
            <PhoneButton
              phone="01753 682707"
              source="near_heathrow_hero"
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              Call Us
            </PhoneButton>
          </>
        }
        secondaryInfo={
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 mt-2">
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Free parking · 20 spaces</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">7 min from Heathrow T5</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Dog & family friendly</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Super-fast fibre broadband</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Rated 4.6/5 on Google</span>
          </div>
        }
      />

      {/* Definitive answer for featured snippets */}
      <section className="bg-anchor-bg-raised border-b border-anchor-gold/15 py-6">
        <Container>
          <p className="text-center text-lg md:text-xl text-anchor-cream-text/80 max-w-4xl mx-auto leading-relaxed">
            Searching for pubs near Heathrow Airport or restaurants near Heathrow Airport? The Anchor is one of the best places to eat near Heathrow — a proper country pub in Stanwell Moor, just 7 minutes from Terminal 5. We serve freshly prepared British pub food with free parking, a dog-friendly beer garden under the flight path, and a warm welcome for travellers and locals alike.
          </p>
        </Container>
      </section>

      {/* Page Title for SEO */}
      <section className="bg-anchor-bg border-b border-anchor-gold/15 py-8">
        <Container>
          <PageTitle
            className="text-center text-anchor-cream-text"
            seo={{ structured: true, speakable: true }}
          >
            The Best Pub Near Heathrow Airport
          </PageTitle>
          <p className="mt-4 text-center text-lg text-anchor-cream-text/70 max-w-4xl mx-auto">
            The Anchor is the closest traditional pub to Heathrow Airport &mdash; just 7 minutes by car from Terminal 5, 11 minutes from Terminals 2 and 3, and 12 minutes from Terminal 4. Free parking for 20 cars is available with no time limit while dining.
          </p>
        </Container>
      </section>

      {/* Food CTA for Travellers */}
      <section className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeader
              title="Eat Before You Fly"
              subtitle="Swap airport fast food for proper pub dining minutes from your terminal."
            />
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-anchor-bg-card rounded-none border border-anchor-gold/15 p-6">
                <h3 className="text-xl font-semibold text-anchor-gold-vivid mb-2">Sunday Roast</h3>
                <p className="text-sm text-anchor-cream-text/70 mb-4">
                  Book by 1pm Saturday and enjoy Yorkshire puddings, crispy potatoes and homemade gravy before your flight.
                </p>
                <div className="flex flex-col gap-2">
                  <BookTableButton
                    source="near_heathrow_roast_cta"
                    variant="primary"
                    size="sm"
                    className="w-full"
                  >
                    Book Roast Table
                  </BookTableButton>
                  <Link href="/sunday-lunch" className="text-sm text-anchor-gold font-semibold hover:text-anchor-gold-light transition">
                    View roast menu →
                  </Link>
                </div>
              </div>
              <div className="bg-anchor-bg-card rounded-none border border-anchor-gold/15 p-6">
                <h3 className="text-xl font-semibold text-anchor-gold-vivid mb-2">Stone-Baked Pizzas</h3>
                <p className="text-sm text-anchor-cream-text/70 mb-4">
                  Hand-stretched bases and generous toppings — ideal for crew nights or family send-offs.
                </p>
                <div className="flex flex-col gap-2">
                  <BookTableButton
                    source="near_heathrow_pizza_cta"
                    context="pizza_menu"
                    variant="primary"
                    size="sm"
                    className="w-full"
                  >
                    Book a Table
                  </BookTableButton>
                  <Link href="/food-menu#pizza" className="text-sm text-anchor-gold font-semibold hover:text-anchor-gold-light transition">
                    View pizza menu →
                  </Link>
                </div>
              </div>
              <div className="bg-anchor-bg-card rounded-none border border-anchor-gold/15 p-6">
                <h3 className="text-xl font-semibold text-anchor-gold-vivid mb-2">All-Day Menu</h3>
                <p className="text-sm text-anchor-cream-text/70 mb-4">
                  Burgers, fish & chips, veggie options and sharers served fast — great for pre-flight meals or meeting arrivals.
                </p>
                <div className="flex flex-col gap-2">
                  <BookTableButton
                    source="near_heathrow_food_menu_cta"
                    variant="primary"
                    size="sm"
                    className="w-full"
                  >
                    Book a Table
                  </BookTableButton>
                  <Link href="/food-menu" className="text-sm text-anchor-gold font-semibold hover:text-anchor-gold-light transition">
                    Browse full menu →
                  </Link>
                </div>
              </div>
            </div>
          </div>

[truncated at line 200 — original has 891 lines]
```

### `app/private-hire/christenings/page.tsx`

```
import Link from 'next/link'
import { Metadata } from 'next'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { Container, SectionHeader, FeatureGrid, InfoBoxGrid } from '@/components/ui'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_CORPORATE_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { landmarks } from '@/lib/local-seo-data'
import { PrivateBookingSection } from '@/components/PrivateBookingSection'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { CONTACT, BRAND } from '@/lib/constants'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { getCateringData } from '@/lib/api/catering-packages'
import { CateringPackagesTable } from '@/components/features/CateringPackagesTable'

export const metadata: Metadata = {
    title: 'Christening Venue Near Heathrow & Staines | The Anchor',
    description: 'Private room for christening parties & baptism receptions at The Anchor, Stanwell Moor. Up to 50 guests, buffet options, family-friendly, free parking. Near Heathrow.',
    openGraph: {
        title: 'Christening Party Venue | The Anchor Stanwell Moor',
        description: 'Celebrate your little one\'s special day. Family-friendly venue with private rooms.',
        images: [{ url: DEFAULT_CORPORATE_IMAGE, width: 1200, height: 630, alt: 'Private hire venue at The Anchor near Heathrow Airport' }],
    },
    twitter: getTwitterMetadata({
        title: 'Christening Party Venue | The Anchor Stanwell Moor',
        description: 'Celebrate your little one\'s special day. Family-friendly venue with private rooms.',
        images: [DEFAULT_CORPORATE_IMAGE]
    }),
    alternates: {
        canonical: '/private-hire/christenings'
    }
}

const nearbyChurches = landmarks.filter(l => l.type === 'church');

export default async function ChristeningsPage() {
    const { foodPackages } = await getCateringData()

    const eventVenueSchema = {
        "@context": "https://schema.org",
        "@type": "EventVenue",
        "@id": "https://www.the-anchor.pub/private-hire/christenings#venue",
        "name": `${BRAND.name} Christening Venue`,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": CONTACT.address.street,
            "addressLocality": CONTACT.address.town,
            "addressRegion": "Surrey",
            "postalCode": CONTACT.address.postcode,
            "addressCountry": "GB"
        },
        "telephone": CONTACT.phoneIntl,
        "url": "https://www.the-anchor.pub/private-hire/christenings",
        "image": `https://www.the-anchor.pub${DEFAULT_CORPORATE_IMAGE}`,
        "description": "Family-friendly venue for christening parties and baptism receptions near local churches in Stanwell Moor.",
        "maximumAttendeeCapacity": 50,
        "amenityFeature": [
            { "@type": "LocationFeatureSpecification", "name": "Free Parking", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Wheelchair Accessible", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Catering", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "High Chairs", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Baby Changing Facilities", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Enclosed Beer Garden", "value": true }
        ],
        "potentialAction": {
            "@type": "CommunicateAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://www.the-anchor.pub/private-hire#enquiry",
                "actionPlatform": [
                    "https://schema.org/DesktopWebPlatform",
                    "https://schema.org/MobileWebPlatform"
                ]
            }
        }
    }

    return (
        <>
            <BreadcrumbJsonLd items={[
                { name: 'Home', url: '/' },
                { name: 'Private Hire', url: '/private-hire' },
                { name: 'Christenings', url: '/private-hire/christenings' }
            ]} />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify(eventVenueSchema) }}
            />

            <HeroWrapper
                route="/private-hire/christenings"
                variant="feature"
                title="Christenings & Naming Ceremonies"
                description="Celebrate with family and friends in a relaxed, child-friendly setting"

                tags={[
                    { label: "Family Friendly", variant: "success" },
                    { label: "Buffet & Roast Options", variant: "default" },
                    { label: "Near Local Churches", variant: "success" },
                    { label: "Easy Parking", variant: "default" }
                ]}
                primaryCta={
                    <BookTableButton
                        source="christening_hero"
                        variant="primary"
                        size="lg"
                        context="christening"
                    >
                        Check Availability
                    </BookTableButton>
                }
                secondaryCta={
                    <PhoneButton
                        phone="01753 682707"
                        source="christening_hero"
                        variant="secondary"
                        size="lg"
                    >
                        Call 01753 682707
                    </PhoneButton>
                }
                secondaryInfo={
                    <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 mt-2">
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Free parking · 20 spaces</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">7 min from Heathrow T5</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Dog &amp; family friendly</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Super-fast fibre broadband</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">10–200 guests</span>
                    </div>
                }
            />

            <section className="py-12 bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <PageTitle className="text-center mb-6" as="h1" seo={{ structured: true, speakable: true }}>
                        Christening & Naming Ceremony Venue Near Heathrow
                    </PageTitle>
                    <div className="max-w-3xl mx-auto text-center">
                        <p className="text-lg text-anchor-cream-text/70 mb-8">
                            After the service, gather everyone together for a relaxed celebration at The Anchor. We offer flexible spaces where the adults can relax and the children have room to be themselves.
                        </p>
                        <div className="bg-anchor-bg-raised p-6 rounded-xl inline-block text-left w-full border border-anchor-gold/15">
                            <h3 className="font-bold text-anchor-gold-vivid mb-3 text-center">Nearby Churches</h3>
                            <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
                                {nearbyChurches.map(l => (
                                    <li key={l.slug} className="flex items-center gap-2">
                                        <Link href={`/private-hire/near/${l.slug}`} className="hover:underline text-anchor-cream-text/70 font-medium">
                                            {l.name} ({l.distance})
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
                <Container>
                    <SectionHeader
                        title="Menu Options"
                        subtitle="From Sunday Roasts to Finger Buffets"
                    />
                    <InfoBoxGrid
                        columns={2}
                        boxes={[
                            {
                                title: "Relaxed Buffet",
                                content: "Our most popular option for christenings. A spread of hot and cold favourites that allows guests to mingle and eat at their own pace. Catering packages available upon request.",
                                variant: "default"
                            },
                            {
                                title: "Sunday Roast",
                                content: "If your christening is on a Sunday, why not book a large area for our famous Sunday Roast? Pre-orders available for large groups to ensure smooth service.",
                                variant: "default"
                            }
                        ]}
                    />
                </Container>
            </section>

            <section className="section-spacing bg-anchor-bg-card border-t border-anchor-gold/15 border-b border-anchor-gold/15">
                <Container>
                    <SectionHeader
                        title="Children's Facilities"
                        subtitle="We make every child feel welcome"
                    />
                    <FeatureGrid
                        columns={4}
                        features={[
                            {
                                icon: "",
                                title: "High Chairs",
                                description: "High chairs are available for babies and toddlers — just let us know when you book how many you need.",
                                className: "text-center"
                            },
                            {

[truncated at line 200 — original has 430 lines]
```

### `app/private-hire/page.tsx`

```
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { Container, SectionHeader, FeatureGrid, Button } from '@/components/ui'
import { PhoneButton } from '@/components/PhoneButton'
import { DEFAULT_CORPORATE_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { PrivateBookingSection } from '@/components/PrivateBookingSection'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { InternalLinkingSection } from '@/components/seo/InternalLinkingSection'
import { getCateringData, getLowestFoodPrice } from '@/lib/api/catering-packages'
import { CateringPackagesTable } from '@/components/features/CateringPackagesTable'
import { VenueSpacesTable } from '@/components/features/VenueSpacesTable'
import { CONTACT, BRAND } from '@/lib/constants'
import { jsonLdSafeStringify } from '@/lib/jsonld'

export async function generateMetadata(): Promise<Metadata> {
    const { foodPackages } = await getCateringData()
    const fromPrice = getLowestFoodPrice(foodPackages) || '£11' // fallback only if API returns no per-head food packages
    const desc = `Book a function room or party venue near Heathrow for 10-50 guests. Buffets from ${fromPrice}pp, free parking, and a dedicated events team.`

    return {
        title: 'Private Hire Venue Near Heathrow | Wakes, Parties & Events | The Anchor',
        description: `${desc} The Anchor, Stanwell Moor.`,
        openGraph: {
            title: 'Private Hire Venue Near Heathrow | Wakes, Parties & Events | The Anchor',
            description: desc,
            images: [{ url: DEFAULT_CORPORATE_IMAGE, width: 1200, height: 630, alt: 'Private hire venue at The Anchor near Heathrow Airport' }],
        },
        twitter: getTwitterMetadata({
            title: 'Private Hire Venue Near Heathrow | Wakes, Parties & Events | The Anchor',
            description: desc,
            images: [DEFAULT_CORPORATE_IMAGE]
        }),
        alternates: {
            canonical: '/private-hire'
        }
    }
}

export default async function PrivateHirePage() {
    const { foodPackages, drinkPackages, addonPackages, spaces } = await getCateringData()
    const fromPrice = getLowestFoodPrice(foodPackages) || '£11' // fallback only if API returns no per-head food packages

    const eventVenueSchema = {
        "@context": "https://schema.org",
        "@type": "EventVenue",
        "@id": "https://www.the-anchor.pub/private-hire#venue",
        "name": `${BRAND.name} Private Hire Venue`,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": CONTACT.address.street,
            "addressLocality": CONTACT.address.town,
            "addressRegion": "Surrey",
            "postalCode": CONTACT.address.postcode,
            "addressCountry": "GB"
        },
        "telephone": CONTACT.phoneIntl,
        "url": "https://www.the-anchor.pub/private-hire",
        "description": "Private hire venue near Heathrow for wakes, parties, christenings, corporate events and celebrations. Up to 50 guests, buffet packages available, free parking.",
        "maximumAttendeeCapacity": 50,
        "amenityFeature": [
            { "@type": "LocationFeatureSpecification", "name": "Free Parking", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Wheelchair Accessible", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Catering", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Private Dining Room", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "AV Equipment", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "WiFi", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Private Bar", "value": true }
        ],
        "potentialAction": {
            "@type": "ReserveAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://www.the-anchor.pub/private-hire#enquiry",
                "actionPlatform": [
                    "https://schema.org/DesktopWebPlatform",
                    "https://schema.org/MobileWebPlatform"
                ]
            }
        }
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify(eventVenueSchema) }}
            />
            <BreadcrumbJsonLd
                items={[
                    { name: 'Home', url: '/' },
                    { name: 'Private Hire', url: '/private-hire' }
                ]}
            />
            <HeroWrapper
                route="/private-hire"
                title="Function Room & Party Venue"
                description={`Function rooms for 10–50 guests · Free parking for all · Buffet packages from ${fromPrice}pp · 7 mins from Heathrow`}

                tags={[
                    { label: "7 Mins from Heathrow", variant: "success" },
                    { label: "Free Parking", variant: "default" },
                    { label: "10-50 Guests", variant: "default" },
                    { label: `From ${fromPrice}pp`, variant: "success" }
                ]}
                primaryCta={
                    <PhoneButton
                        phone="01753 682707"
                        source="private_hire_hero_primary"
                        variant="primary"
                        size="lg"
                        className="w-full sm:w-auto"
                    >
                        Call to Discuss Your Event
                    </PhoneButton>
                }
                secondaryCta={
                    <Link href="/private-hire#enquiry" className="w-full sm:w-auto">
                        <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                            Enquire Online
                        </Button>
                    </Link>
                }
                secondaryInfo={
                    <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 mt-2">
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Free parking · 20 spaces</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">7 min from Heathrow T5</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Dog &amp; family friendly</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Super-fast fibre broadband</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">10–50 guests</span>
                    </div>
                }
            />

            <section className="py-12 bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <PageTitle className="text-center mb-8" seo={{ structured: true, speakable: true }}>
                        Function Room &amp; Party Venue Near Heathrow — Private Hire
                    </PageTitle>

                    <p className="text-center text-lg text-anchor-cream-text/70 mb-8 max-w-4xl mx-auto">
                        The Anchor is an independent function room and party venue in Stanwell Moor, 7 minutes from Heathrow Terminal 5. Whether you need a function room for a christening or a party venue for a milestone birthday, we host gatherings from 10 to 50 guests with {`buffet packages from ${fromPrice} per person`}, free parking for all, and a personal touch you won&apos;t get from a hotel. Looking for venue hire near Staines? We&apos;re just a short drive away.
                    </p>

                    <div className="flex justify-center mb-10">
                        <p className="text-sm text-anchor-cream-text/70">⭐⭐⭐⭐⭐ <strong>Rated 4.6/5 on Google</strong> · Trusted for private events near Heathrow</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                        {/* Wakes */}
                        <Link href="/private-hire/wakes" className="group block h-full">
                            <div className="card-dark rounded-none overflow-hidden hover:shadow-md transition-all h-full">
                                <div className="aspect-video bg-gray-200 relative">
                                    <Image
                                        src="/images/private-hire/wakes.png"
                                        alt="Wake venue at The Anchor near Heathrow"
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-anchor-gold-vivid mb-2 group-hover:text-anchor-gold transition-colors">Wakes & Memorials</h3>
                                    <p className="text-anchor-cream-text/70 mb-4">Respectful, private reception spaces near local crematoriums. Fully catered with compassionate service.</p>
                                    <span className="text-anchor-gold font-semibold text-sm flex items-center gap-1">
                                        View Wake Packages <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </span>
                                </div>
                            </div>
                        </Link>

                        {/* Christenings */}
                        <Link href="/private-hire/christenings" className="group block h-full">
                            <div className="card-dark rounded-none overflow-hidden hover:shadow-md transition-all h-full">
                                <div className="aspect-video bg-gray-200 relative">
                                    <Image
                                        src="/images/private-hire/christenings.png"
                                        alt="Christening venue at The Anchor near Heathrow"
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-anchor-gold-vivid mb-2 group-hover:text-anchor-gold transition-colors">Christenings</h3>
                                    <p className="text-anchor-cream-text/70 mb-4">Celebrate your little one's special day with family. Relaxed buffet options and space for the kids.</p>
                                    <span className="text-anchor-gold font-semibold text-sm flex items-center gap-1">
                                        View Christening Details <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </span>
                                </div>
                            </div>
                        </Link>


                        {/* Parties */}
                        <Link href="/private-party-venue" className="group block h-full">
                            <div className="card-dark rounded-none overflow-hidden hover:shadow-md transition-all h-full">

[truncated at line 200 — original has 621 lines]
```

### `app/private-hire/wakes/page.tsx`

```
import Link from 'next/link'
import { Metadata } from 'next'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { Container, Section, SectionHeader, FeatureGrid, InfoBoxGrid, Button, AlertBox } from '@/components/ui'
import { PhoneButton } from '@/components/PhoneButton'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_CORPORATE_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { landmarks } from '@/lib/local-seo-data'
import { PrivateBookingSection } from '@/components/PrivateBookingSection'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { CONTACT, BRAND } from '@/lib/constants'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { getCateringData, getLowestFoodPrice } from '@/lib/api/catering-packages'
import { CateringPackagesTable } from '@/components/features/CateringPackagesTable'

const WAKE_PACKAGE_NAMES = ['Sandwich Buffet', 'Finger Buffet', 'Premium Buffet', 'Afternoon Tea']

export async function generateMetadata(): Promise<Metadata> {
    const { foodPackages } = await getCateringData()
    const wakePackages = foodPackages.filter((p) => WAKE_PACKAGE_NAMES.includes(p.name))
    const fromPrice = getLowestFoodPrice(wakePackages) || '£12' // fallback only if API returns no wake packages

    return {
        title: 'Wake & Funeral Reception Venue | Near Heathrow | The Anchor',
        description: `Private room for wakes, funeral teas & celebrations of life near Staines & Heathrow. Up to 50 guests, buffet packages from ${fromPrice}pp, free parking. Compassionate staff.`,
        openGraph: {
            title: 'Wake Venue & Celebration of Life | The Anchor Stanwell Moor',
            description: `Respectful, private spaces for wakes, funeral teas and celebrations of life. Buffet packages from ${fromPrice}pp. Minutes from local crematoriums.`,
            images: [{ url: DEFAULT_CORPORATE_IMAGE, width: 1200, height: 630, alt: 'Private hire venue at The Anchor near Heathrow Airport' }],
        },
        twitter: getTwitterMetadata({
            title: 'Wake Venue & Celebration of Life | The Anchor Stanwell Moor',
            description: `Wakes, funeral teas and celebrations of life. Buffet packages from ${fromPrice}pp, free parking, minutes from local crematoriums.`,
            images: [DEFAULT_CORPORATE_IMAGE]
        }),
        alternates: {
            canonical: '/private-hire/wakes'
        }
    }
}

const nearbyCrematoriums = landmarks.filter(l => l.type === 'crematorium');

export default async function WakesPage() {
    const { foodPackages } = await getCateringData()
    const wakePackages = foodPackages.filter((p) => WAKE_PACKAGE_NAMES.includes(p.name))
    const fromPrice = getLowestFoodPrice(wakePackages) || '£12' // fallback only if API returns no wake packages

    const eventVenueSchema = {
        "@context": "https://schema.org",
        "@type": "EventVenue",
        "@id": "https://www.the-anchor.pub/private-hire/wakes#venue",
        "name": `${BRAND.name} Private Dining Room`,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": CONTACT.address.street,
            "addressLocality": CONTACT.address.town,
            "addressRegion": "Surrey",
            "postalCode": CONTACT.address.postcode,
            "addressCountry": "GB"
        },
        "telephone": CONTACT.phoneIntl,
        "url": "https://www.the-anchor.pub/private-hire/wakes",
        "image": `https://www.the-anchor.pub${DEFAULT_CORPORATE_IMAGE}`,
        "description": "A peaceful, private venue for wakes, funeral receptions and celebrations of life near South West Middlesex Crematorium.",
        "maximumAttendeeCapacity": 50,
        "amenityFeature": [
            { "@type": "LocationFeatureSpecification", "name": "Free Parking", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Wheelchair Accessible", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Catering", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Private Dining Room", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Ground Floor Access", "value": true }
        ],
        "potentialAction": {
            "@type": "CommunicateAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://www.the-anchor.pub/private-hire#enquiry",
                "actionPlatform": [
                    "https://schema.org/DesktopWebPlatform",
                    "https://schema.org/MobileWebPlatform"
                ]
            }
        }
    }

    return (
        <>
            <BreadcrumbJsonLd items={[
                { name: 'Home', url: '/' },
                { name: 'Private Hire', url: '/private-hire' },
                { name: 'Wakes', url: '/private-hire/wakes' }
            ]} />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify(eventVenueSchema) }}
            />

            <HeroWrapper
                route="/private-hire/wakes"
                variant="feature"
                title="Wakes, Funeral Receptions & Celebrations of Life"
                description="A peaceful, respectful venue for gathering with family and friends"

                tags={[
                    { label: "Near SW Middlesex Crematorium", variant: "default" },
                    { label: "Compassionate Team", variant: "success" },
                    { label: `Funeral Tea from ${fromPrice}pp`, variant: "default" },
                    { label: "Free Parking", variant: "success" }
                ]}
                primaryCta={
                    <PhoneButton
                        phone="01753 682707"
                        source="wakes_hero_primary"
                        variant="primary"
                        size="lg"
                        className="w-full sm:w-auto"
                    >
                        Call to Discuss Arrangements
                    </PhoneButton>
                }
                secondaryCta={
                    <Link href="#enquiry" className="w-full sm:w-auto">
                        <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                            Enquire Online
                        </Button>
                    </Link>
                }
                secondaryInfo={
                    <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 mt-2">
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Free parking · 20 spaces</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">7 min from Heathrow T5</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Dog &amp; family friendly</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Super-fast fibre broadband</span>
                        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Up to 50 guests</span>
                    </div>
                }
            />

            <section className="py-12 bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container size="md">
                    <PageTitle className="text-center mb-6" as="h1" seo={{ structured: true, speakable: true }}>
                        Wake Venue & Funeral Receptions Near Heathrow
                    </PageTitle>
                    <p className="text-lg text-anchor-cream-text/70 text-center mb-8">
                        We understand that organising a wake can be a difficult time. Our experienced team is here to handle the arrangements with sensitivity and care, ensuring a peaceful environment for you to remember your loved one.
                    </p>

                    <AlertBox
                        variant="info"
                        title="Convenient Location"
                        content={
                            <ul className="grid sm:grid-cols-2 gap-2 mt-2">
                                {nearbyCrematoriums.map(l => (
                                    <li key={l.slug} className="flex items-center gap-2">
                                        <span className="text-anchor-gold"></span>
                                        <Link href={`/private-hire/near/${l.slug}`} className="hover:underline text-anchor-gold font-medium">
                                            {l.name} ({l.distance})
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        }
                    />
                </Container>
            </section>

            <PrivateBookingSection id="enquiry" eventType="Wake / Memorial" />

            <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
                <Container>
                    <SectionHeader
                        title="Private Spaces"
                        subtitle="Choose the right space for your gathering"
                    />
                    <FeatureGrid
                        columns={1}
                        features={[
                            {
                                icon: "",
                                title: "The Dining Room",
                                description: "A private, enclosed space suitable for 20-60 guests. Quiet and self-contained with direct access to facilities.",
                                className: "text-center"
                            }
                        ]}
                    />
                </Container>
            </section>

            <Section className="bg-anchor-bg border-b border-anchor-gold/15">
                <Container>
                    <SectionHeader
                        title="Wake Reception Packages"
                        subtitle="Flexible catering for any gathering size"
                    />
                    <div className="prose prose-invert max-w-3xl mx-auto mb-8">
                        <p>We offer a range of buffet and tea &amp; coffee packages to suit your needs and budget. Use our calculator below to get an instant indication of costs for your gathering, or call us to discuss your requirements.</p>
                        <p>All packages include use of our private dining room, dedicated staff, free parking, and setup and cleardown. We can also arrange flowers, photos, and order of service display.</p>

[truncated at line 200 — original has 478 lines]
```

### `app/quiz-night/page.tsx`

```
import Image from 'next/image'
import { Metadata } from 'next'
import {
  Button,
  Section,
  Container,
  Card,
  CardBody,
  Grid,
  GridItem,
  SectionHeader
} from '@/components/ui'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { PhoneButton } from '@/components/PhoneButton'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { EventSchema } from '@/components/seo/EventSchema'
import { EventBookingButton } from '@/components/EventBookingButton'
import { BookTableButton } from '@/components/BookTableButton'
import { RegretReduction } from '@/components/psychology'
import {
  getEventCategories,
  getUpcomingEventsByCategory,
  formatEventDate,
  formatEventTime,
  formatDoorTime,
  type Event,
  type EventCategory
} from '@/lib/api'
import { getEventWebsiteUrl } from '@/lib/event-url'
import { staticEvents } from '@/lib/static-events'
import { DEFAULT_EVENT_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { JsonLd } from '@/components/JsonLd'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { quizNightEventSeries } from '@/lib/schema'
import { getBusinessStats } from '@/lib/schema-with-reviews'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { CONTACT } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Pub Quiz Near Heathrow | £3 Entry, Cash Prizes | The Anchor',
  description:
    "Monthly quiz night at The Anchor, Stanwell Moor. £3 entry, £25 bar tab for the winners. Teams of up to 6. Free parking, 7 mins from Heathrow T5. Book your spot.",
  openGraph: {
    title: 'Pub Quiz Near Heathrow | £3 Entry, Cash Prizes | The Anchor',
    description: 'Monthly quiz night at The Anchor, Stanwell Moor. £3 entry, £25 bar tab for the winners. Teams of up to 6. Free parking, 7 mins from Heathrow T5. Book your spot.',
    images: [{ url: DEFAULT_EVENT_IMAGE, width: 1200, height: 630, alt: 'Events at The Anchor pub near Heathrow' }]
  },
  twitter: getTwitterMetadata({
    title: 'Pub Quiz Near Heathrow | £3 Entry, Cash Prizes | The Anchor',
    description: 'Monthly quiz night at The Anchor, Stanwell Moor. £3 entry, £25 bar tab for the winners. Teams of up to 6. Free parking, 7 mins from Heathrow T5. Book your spot.',
    images: [DEFAULT_EVENT_IMAGE]
  }),
  alternates: {
    canonical: '/quiz-night'
  }
}

const QUIZ_CATEGORY = {
  name: 'Pub Quiz Night',
  slug: 'quiz-night-stanwell-moor'
}

const normalizeCategoryValue = (value?: string | null) =>
  value?.toLowerCase().replace(/\s+/g, ' ').trim() ?? ''

function getCategoryIdByLabel(categories: EventCategory[], label: typeof QUIZ_CATEGORY) {
  const targetName = normalizeCategoryValue(label.name)
  const targetSlug = normalizeCategoryValue(label.slug)

  return categories.find(category => {
    const categoryName = normalizeCategoryValue(category.name)
    const categorySlug = normalizeCategoryValue(category.slug)
    return categoryName === targetName || categorySlug === targetSlug
  })?.id
}

async function getQuizEvents() {
  const categories = await getEventCategories()
  const categoryId = getCategoryIdByLabel(categories, QUIZ_CATEGORY)
  if (!categoryId) return []

  const events = await getUpcomingEventsByCategory(categoryId, 60, 365)
  return events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
}

const WHY_LOVE_IT = [
  {
    icon: '',
    title: 'Four Curated Rounds',
    body: 'Every quiz night quiz features four curated rounds mixing legends, cult film clues, riddles and general trivia. Expect 50% easy wins, 35% brain-teasers and a tasty 15% "ooh, good one".'
  },
  {
    icon: '',
    title: 'Phone-Free, Pen & Paper Fun',
    body: 'Proper pub quiz energy with PG-13 questions so crews, families and Heathrow stopovers feel right at home. Solo players get paired on arrival.'
  },
  {
    icon: '',
    title: 'Prizes & Bragging Rights',
    body: '£25 bar tab for the champions, bottle of house wine for the second-from-last team, and seasonal props for the best team name. Bonus trivia prompts scoop extra bragging points.'
  },
  {
    icon: '',
    title: 'Atmosphere from 6:30 pm',
    body: 'Tables set from 6:30pm with themed playlists, seasonal décor and limited-edition cocktails behind the bar. Order dinner before the first round lands.'
  },
  {
    icon: '',
    title: 'Community Night Out',
    body: 'Friendly quizmasters, a welcoming Stanwell Moor crowd and plenty of laughs whether you’re local or flying in from Heathrow.'
  }
]

const FAQS = [
  {
    question: 'When does the quiz start and how long does it run?',
    answer:
      'Doors open at 6:30 pm for food and team set-up. Questions start at 7:00 pm sharp and we wrap with prizes around 9:45 pm including a comfort break halfway through.'
  },
  {
    question: 'How much is entry and do we need to book?',
    answer:
      'It’s £3 per player. If booking is open you’ll see a Book Now button above. If not, booking options are available closer to the event — check back nearer the date or call 01753 682707 and we’ll help.'
  },
  {
    question: 'How many players can we bring?',
    answer:
      'Teams are capped at six players to keep things fair. Smaller groups and solo quizzers are welcome—we happily pair you with other legends on the night.'
  },
  {
    question: 'Can kids or dogs come to quiz night?',
    answer:
      'Yes. Families are welcome all evening and well-behaved dogs can curl up under the table. Just remember it’s a phone-free quiz during rounds (there’s a –5 point penalty for sneaky scrolling).'
  },
  {
    question: 'What food and drink is available?',
    answer:
      'Order from the full food menu before the quiz starts or during the break. Sharing platters, pizzas and seasonal specials run until 9pm, with themed cocktails, mocktails and local ales on tap all night.'
  },
  {
    question: 'What if we want to celebrate a win or host a private quiz?',
    answer:
      'Talk to us about post-quiz celebrations or booking the function room for a bespoke trivia night. Email manager@the-anchor.pub or call 01753 682707 and we’ll build the perfect package.'
  },
  {
    question: 'Do you host private trivia parties or corporate quiz nights?',
    answer:
      'Absolutely. We run custom trivia nights for corporate teams, birthdays and fundraisers with tailored rounds and prizes. Drop us a line at manager@the-anchor.pub or call 01753 682707 and we’ll plan a private pub trivia party around your group.'
  },
  {
    question: 'Is this the closest pub quiz near Heathrow hotels?',
    answer:
      'Yes—we\'re just seven minutes from Heathrow Terminal 5 and 8 minutes from Staines. We\'re the go-to “pub quiz near me” for airport crews, local hotels and Stanwell Moor neighbours looking for a proper quiz night without London prices.'
  },
  {
    question: 'Do you run quiz nights on weekends?',
    answer:
      'Dates move around with our events calendar, so keep an eye on the What’s On page or call 01753 682707. We often stick to midweek slots but add bonus Saturday or Sunday quiz specials when demand is high.'
  }
]

function PrizeCard({ title, reward, copy }: { title: string; reward: string; copy: string }) {
  return (
    <Card className="h-full card-dark rounded-none border border-anchor-gold/15">
      <CardBody>
        <h3 className="text-lg font-semibold text-anchor-cream-text mb-2">{title}</h3>
        <p className="text-2xl font-bold text-anchor-gold mb-3">{reward}</p>
        <p className="text-sm text-anchor-cream-text/70">{copy}</p>
      </CardBody>
    </Card>
  )
}

function QuizNightEvents({ events }: { events: Event[] }) {
  if (!events.length) {
    return (
      <div className="bg-anchor-bg-card border border-anchor-gold/15 rounded-xl p-6 text-center">
        <p className="text-lg font-semibold text-anchor-gold-vivid mb-2">New quiz dates are loading soon</p>
        <p className="text-anchor-cream-text/55">
          Our next quiz night is being finalised right now. Call 01753 682707 and we’ll let you know as soon as booking opens.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {events.map((event, index) => {
        const doorTime = formatDoorTime(event.doorTime)
        const startTime = formatEventTime(event.startDate)
        const isDraft = (event.eventStatus || '').toLowerCase().includes('draft')
        const isScheduled = (event.eventStatus || '').toLowerCase().includes('scheduled')
        const isTentative = isDraft || (!isScheduled && new Date(event.startDate).getTime() > new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
        const eventUrl = getEventWebsiteUrl(event)
        const imageSrc = event.heroImageUrl || event.image?.[0] || null


[truncated at line 200 — original has 667 lines]
```

### `app/robots.ts`

```
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/_next/static/'],
        disallow: [
          '/api/',
          // Allow static assets so crawlers can render pages correctly.
          '/_next/data/',
          '/_next/static/media/',
          '/*?dpl=*',
          '/_serverless/',
          '/_partials/',
          '/_api/',
          '/_scripts/',
          '/cdn-cgi/',
          '/subscribe',
          '/leave-a-review',
          '/subscribe-for-digital-flyers',
          '/p5-demo'
        ]
      }
    ],
    sitemap: ['https://www.the-anchor.pub/sitemap.xml'],
  }
}
```

### `app/sitemap.ts`

```
import { MetadataRoute } from 'next'
import { getAllBlogPosts } from '@/lib/markdown'
import { landmarks } from '@/lib/local-seo-data'
import { anchorAPI, type Event } from '@/lib/api'
import { getEventWebsitePath } from '@/lib/event-url'
import tagRedirects from '@/config/redirects/tag-redirects.json'
import { PAST_EVENT_REDIRECT_DAYS, CANCELLED_INDEX_DAYS } from '@/lib/event-seo-strategy'

export const revalidate = 60 * 60 // 1 hour
export const dynamic = 'force-dynamic'

const EVENT_PAGE_SIZE = 100
const EVENT_MAX_PAGES = 20
const EVENT_SITEMAP_STATUS_FILTER = 'scheduled,rescheduled,postponed,sold_out,cancelled'
const EVENT_SITEMAP_FROM_DATE = '2000-01-01'

function getSafeDate(value?: string): Date {
  if (!value) {
    return new Date()
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

function isDraftEvent(event: Event): boolean {
  const rawStatus =
    typeof event.event_status === 'string'
      ? event.event_status.trim().toLowerCase()
      : ''
  if (rawStatus) return rawStatus === 'draft'

  const schemaStatus =
    typeof event.eventStatus === 'string'
      ? event.eventStatus.trim().toLowerCase()
      : ''
  return schemaStatus.includes('draft')
}

async function getSitemapEvents(): Promise<Event[]> {
  const uniqueEvents = new Map<string, Event>()

  try {
    for (let page = 0; page < EVENT_MAX_PAGES; page += 1) {
      const offset = page * EVENT_PAGE_SIZE
      const response = await anchorAPI.getEvents({
        from_date: EVENT_SITEMAP_FROM_DATE,
        status: EVENT_SITEMAP_STATUS_FILTER,
        limit: EVENT_PAGE_SIZE,
        offset
      })

      const batch = Array.isArray(response.events) ? response.events : []
      if (batch.length === 0) break

      for (const event of batch) {
        if (isDraftEvent(event)) continue
        const key = `${event.id || event.slug || ''}`.trim()
        if (!key) continue
        uniqueEvents.set(key, event)
      }

      if (batch.length < EVENT_PAGE_SIZE) break
    }
  } catch {
    return []
  }

  return Array.from(uniqueEvents.values())
}

const STATIC_LAST_MODIFIED = new Date('2026-04-21')

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.the-anchor.pub'

  // Define all static routes
  const staticRoutes = [
    '',
    '/about',
    '/blog',
    '/blog/tags',
    '/food-menu',
    '/food-menu/vegetarian',
    '/food-menu/vegan',
    '/food-menu/gluten-free',
    '/mothers-day',
    '/valentines-day',
    '/st-patricks-day',
    '/new-years-eve',
    '/easter',
    '/fathers-day',
    '/halloween',
    '/boxing-day',
    '/bonfire-night',
    '/bank-holiday-weekends',
    '/sunday-lunch',
    '/pizza-menu',
    '/burger-menu',
    '/fish-and-chips-heathrow',
    '/drinks',
    '/drinks/managers-special',
    '/drinks/baby-guinness',
    '/whats-on',
    '/quiz-night',
    '/cash-bingo',
    '/music-bingo',
    '/karaoke',
    '/live-music',
    '/open-mic',
    '/live-sport',

    '/live-sport/six-nations',
    '/live-sport/f1',
    '/live-sport/boxing',
    '/live-sport/world-cup',
    '/pool-darts-pub',
    '/summer-garden-parties',
    '/book-table',
    '/private-hire',
    '/private-party-venue',
    '/function-room-hire',
    '/corporate-events',
    '/corporate-christmas-parties',
    '/christmas-parties',
    '/private-hire/wakes',
    '/private-hire/christenings',
    '/private-hire/baby-showers',
    '/private-hire/engagement-parties',
    '/private-hire/gender-reveal',
    '/private-hire/milestone-birthdays',
    '/private-hire/retirement-parties',
    '/near-heathrow',
    '/near-heathrow/terminal-2',
    '/near-heathrow/terminal-3',
    '/near-heathrow/terminal-4',
    '/near-heathrow/terminal-5',
    '/find-us',
    '/heathrow-layover-dining',
    '/pre-flight-meal',
    '/heathrow-family-dining',
    '/luggage-storage-heathrow',
    '/heathrow-parking',
    '/heathrow-parking/terminal-2',
    '/heathrow-parking/terminal-3',
    '/heathrow-parking/terminal-4',
    '/heathrow-parking/terminal-5',
    '/coach-parking-heathrow',
    '/restaurants-near-heathrow',
    '/heathrow-hotels-pub',
    '/pub-near-sofitel-heathrow',
    '/pub-near-premier-inn-heathrow',
    '/pub-near-hilton-heathrow',
    '/pub-near-marriott-heathrow',
    '/pub-near-crowne-plaza-heathrow',
    '/pub-near-ibis-heathrow',
    '/pub-near-travelodge-heathrow',
    '/pub-near-renaissance-heathrow',
    '/m25-junction-14-pub',
    '/beer-garden',
    '/plane-spotting-heathrow',
    '/dog-friendly-pub-heathrow',
    '/family-friendly-pub-heathrow',
    '/ashford-pub',
    '/colnbrook-pub',
    '/feltham-pub',
    '/staines-pub',
    '/stanwell-pub',
    '/sitemap-page',
    '/privacy-policy',
    '/accessibility',
    '/safety-and-respect',
    '/sustainability',
    '/reviews',
  ]

  // Get all blog posts
  const blogPosts = await getAllBlogPosts()
  const excludedBlogSlugs = new Set([
    'euro-2024-viewing',
    'autumn-internationals-2024-full-fixtures-highlight'
  ])
  const indexableBlogPosts = blogPosts.filter((post) => !excludedBlogSlugs.has(post.slug) && !post.noindex)

  // Get all unique tags
  const allTags = new Set<string>()
  indexableBlogPosts.forEach(post => {
    post.tags.forEach(tag => allTags.add(tag))
  })

  // Map static routes
  const staticSitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: STATIC_LAST_MODIFIED,
    changeFrequency: (route === '' ? 'daily' : route === '/blog' ? 'daily' : route === '/book-table' ? 'daily' : route === '/safety-and-respect' ? 'yearly' : route === '/accessibility' || route === '/sustainability' ? 'monthly' : 'weekly') as 'daily' | 'weekly' | 'monthly' | 'yearly',
    priority: route === '' ? 1.0 : route === '/book-table' ? 0.95 : route.includes('near-heathrow') ? 0.9 : route === '/blog' ? 0.9 : route.includes('-pub') ? 0.85 : route === '/accessibility' || route === '/sustainability' ? 0.7 : route === '/safety-and-respect' ? 0.6 : 0.8,
  }))

  // Map blog post routes
  const blogSitemap = indexableBlogPosts.map((post) => {
    const lastModified = getSafeDate(post.date)

[truncated at line 200 — original has 265 lines]
```

### `app/stanwell-pub/page.tsx`

```
import Link from 'next/link'
import { Button, CTASection, SectionHeader, FeatureGrid, InfoBoxGrid, DirectionsCard, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { DirectionsButton } from '@/components/DirectionsButton'
import { generateBreadcrumbSchema, generateHowToDirectionsSchema } from '@/lib/enhanced-schemas'
import { Metadata } from 'next'
import { CONTACT, BRAND, PARKING } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { getBusinessStats } from '@/lib/schema-with-reviews'
import { BookTableButton } from '@/components/BookTableButton'

export const metadata: Metadata = {
  title: 'The Anchor | Stanwell Moor Pub | Rated 4.6★ on Google',
  description: 'Your local in Stanwell Moor — rated 4.6/5 on Google. Sunday roasts from £19, stone-baked pizzas, dog-friendly beer garden, quiz nights & free parking.',
  openGraph: {
    title: 'Stanwell Village Pub — Beer Garden, Food & Free Parking',
    description: 'Rated 4.6/5 on Google. Sunday roasts, stone-baked pizzas and a dog-friendly beer garden at The Anchor, Stanwell Moor.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'Stanwell Village Pub — Beer Garden, Food & Free Parking',
    description: 'Rated 4.6/5 on Google. Sunday roasts, stone-baked pizzas and a dog-friendly beer garden at The Anchor, Stanwell Moor.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/stanwell-pub'
  }
}

export default async function StanwellPubPage() {
  const { rating, reviewCount } = await getBusinessStats()

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": ["Restaurant", "BarOrPub"],
    "@id": "https://www.the-anchor.pub/stanwell-pub#business",
    "name": `${BRAND.name} - Stanwell Village Pub`,
    "image": `https://www.the-anchor.pub${DEFAULT_PAGE_HEADER_IMAGE}`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": CONTACT.address.street,
      "addressLocality": "Stanwell Moor, Stanwell",
      "addressRegion": "Surrey",
      "postalCode": CONTACT.address.postcode,
      "addressCountry": "GB"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": CONTACT.coordinates.lat,
      "longitude": CONTACT.coordinates.lng
    },
    "areaServed": [
      {
        "@type": "City",
        "name": "Stanwell"
      },
      {
        "@type": "Place",
        "name": "Stanwell Moor"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": rating,
      "reviewCount": reviewCount,
      "bestRating": "5",
      "worstRating": "1"
    },
	    "priceRange": "££",
    "servesCuisine": ["British", "Traditional English", "Sunday Roast"],
    "telephone": CONTACT.phoneIntl,
    "url": "https://www.the-anchor.pub/stanwell-pub"
  }
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Locations', url: '/locations' },
    { name: 'Stanwell Pub', url: '/stanwell-pub' }
  ])

  const directionsSchema = generateHowToDirectionsSchema(
    'Stanwell Village',
    'The Anchor - Heathrow Pub & Dining',
    [
      'From Stanwell Village, head north on Oaks Road',
      'Turn left onto Stanwell Moor Road',
      'Continue for about 0.5 miles',
      'Turn right onto Horton Road',
      'The Anchor will be on your right with free parking'
    ]
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([localBusinessSchema, breadcrumbSchema, directionsSchema]) }}
      />

      {/* Hero Section */}
      <HeroWrapper
        route="/stanwell-pub"
        title="Stanwell's Traditional Village Pub"
        description="The heart of the Stanwell community since generations"
        variant="default"
        primaryCta={
          <BookTableButton
            source="stanwell_pub_hero"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
            context="stanwell_local"
          >
            Book a Table
          </BookTableButton>
        }
        secondaryCta={
          <Link href="/food-menu" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              View Menu
            </Button>
          </Link>
        }
        secondaryInfo={
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 mt-2">
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Free parking · 20 spaces</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">7 min from Heathrow T5</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Dog & family friendly</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Super-fast fibre broadband</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Rated 4.6/5 on Google</span>
          </div>
        }
      />

      <section className="bg-anchor-bg-card py-6 border-b border-anchor-gold/15">
        <Container>
          <p className="text-center text-sm text-anchor-cream-text/70">⭐⭐⭐⭐⭐ <strong className="text-anchor-cream-text">Rated 4.6/5 on Google</strong> · Highest-rated non-airport pub near Heathrow</p>
        </Container>
      </section>

      {/* Page Title */}
      <section className="py-8 bg-anchor-bg-card border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <PageTitle
              seo={{
                structured: true,
                speakable: true
              }}
              className="text-anchor-cream-text mb-4"
            >
              Your Local Pub in Stanwell Moor
            </PageTitle>
            <p className="text-lg text-anchor-cream-text/70">
              Your local village pub serving the Stanwell community for generations
            </p>
          </div>
        </Container>
      </section>

      {/* Welcome Section */}
      <section className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <SectionHeader
              title="Welcome to Your Local Stanwell Pub"
              subtitle="Located in the heart of Stanwell Moor, The Anchor has been serving the Stanwell community for generations. We're more than just a pub - we're where neighbours become friends and visitors become regulars."
            />

            <FeatureGrid
              columns={3}
              features={[
                {
                  icon: "",
                  title: "Village Heart",
                  description: "The social hub of Stanwell Moor, where locals gather daily",
                  variant: "colored",
                  color: "bg-anchor-bg-card",
                  className: "rounded-none p-6 text-center border border-anchor-gold/15"
                },
                {
                  icon: "",
                  title: "Traditional Values",
                  description: "Proper British pub with draught beers and honest food",
                  variant: "colored",
                  color: "bg-anchor-bg-card",
                  className: "rounded-none p-6 text-center border border-anchor-gold/15"
                },
                {
                  icon: "‍‍‍",
                  title: "Family Friendly",
                  description: "Children and dogs always welcome in our community pub",
                  variant: "colored",
                  color: "bg-anchor-bg-card",
                  className: "rounded-none p-6 text-center border border-anchor-gold/15"
                }

[truncated at line 200 — original has 552 lines]
```

### `app/sunday-lunch/page.tsx`

```
import Link from 'next/link'
import { AlertBox, Button, Container, SectionHeader } from '@/components/ui'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { HeroWrapper } from '@/components/hero'
import { Metadata } from 'next'
import { Icon } from '@/components/ui/Icon'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { MenuPageTracker } from '@/components/tracking/MenuPageTracker'
import { generateNutritionInfo } from '@/lib/schema-utils'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { BookTableButton } from '@/components/BookTableButton'
import { FoodStickyCtaBar } from '@/components/food/FoodStickyCtaBar'
import { anchorAPI, formatPrice, getBusinessHours, isKitchenOpen } from '@/lib/api'
import { formatTime12Hour } from '@/lib/time-utils'
import { jsonLdSafeStringify } from '@/lib/jsonld'

const SUNDAY_LUNCH_BOOKING_URL = '/book-table?sunday_lunch=true&purpose=food'

export const metadata: Metadata = {
  title: 'Sunday Roast Near Heathrow | From £19 | Book by Saturday',
  description: 'Traditional Sunday roast from £19 at The Anchor, Stanwell Moor. Chicken, pork belly & veggie options. Must book by Saturday 1pm. Free parking, 7 mins from T5.',
  openGraph: {
    title: 'Sunday Roast Near Heathrow | From £19 | Book by Saturday',
    description: 'Traditional Sunday roast from £19 at The Anchor, Stanwell Moor. Chicken, pork belly & veggie options. Must book by Saturday 1pm. Free parking, 7 mins from T5.',
    images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg'],
  },
  twitter: getTwitterMetadata({
    title: 'Sunday Roast Near Heathrow | From £19 | Book by Saturday',
    description: 'Traditional Sunday roast from £19 at The Anchor, Stanwell Moor. Chicken, pork belly & veggie options. Must book by Saturday 1pm. Free parking, 7 mins from T5.',
    images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg']
  }),
  alternates: {
    canonical: '/sunday-lunch'
  }
}

export const revalidate = 120

type NormalizedMenuItem = {
  id?: string
  name: string
  description?: string | null
  price?: number
  dietary_info?: string[]
  allergens?: string[]
  included?: boolean
  is_available?: boolean
}

type NormalizedMenu = {
  menuDate?: string
  cutoffTime?: string
  mains: NormalizedMenuItem[]
  sides: NormalizedMenuItem[]
}

const FALLBACK_MENU: NormalizedMenu = {
  mains: [
    {
      name: 'Roasted Chicken',
      description: 'Oven-roasted chicken breast with sage & onion stuffing balls, herb and garlic-crusted roast potatoes, seasonal vegetables, Yorkshire pudding, and red wine gravy',
      price: 19
    },
    {
      name: 'Crispy Pork Belly',
      description: 'Crispy crackling and tender slow-roasted pork belly with Bramley apple sauce, herb and garlic-crusted roast potatoes, seasonal vegetables, Yorkshire pudding, and red wine gravy',
      price: 22
    },
    {
      name: 'Beetroot & Butternut Squash Wellington (V)',
      description: 'Golden puff pastry filled with beetroot & butternut squash, served with herb and garlic-crusted roast potatoes, seasonal vegetables, and vegetarian gravy',
      price: 19,
      dietary_info: ['vegetarian']
    },
    {
      name: 'Kids Roasted Chicken',
      description: 'A smaller portion of our roasted chicken with herb and garlic-crusted roast potatoes, seasonal vegetables, Yorkshire pudding, and red wine gravy',
      price: 13
    }
  ],
  sides: [
    {
      name: 'Roast Potatoes',
      description: 'Herb and garlic-crusted roast potatoes.',
      price: 0,
      included: true
    },
    {
      name: 'Yorkshire Pudding',
      description: 'Traditional Yorkshire pudding.',
      price: 0,
      included: true
    },
    {
      name: 'Seasonal Vegetables',
      description: 'Fresh seasonal vegetables.',
      price: 0,
      included: true
    },
    {
      name: 'Red Wine Gravy',
      description: 'Red wine gravy (vegetarian gravy available on request).',
      price: 0,
      included: true
    },
    {
      name: 'Cauliflower Cheese',
      description: 'Creamy cauliflower cheese — the perfect add-on to your roast.',
      price: 4,
      included: false
    }
  ],
  menuDate: undefined,
  cutoffTime: undefined
}

function normalizeMenu(raw: any): NormalizedMenu {
  const payload = raw?.data ?? raw ?? {}
  const mainsSource = payload.mains || payload.menu?.mains || []
  const sidesSource = payload.sides || payload.menu?.sides || []

  const mapItem = (item: any): NormalizedMenuItem => {
    const price = Number(item?.price ?? item?.selling_price ?? item?.price_at_booking ?? NaN)
    const defaultIncluded = (Number.isFinite(price) ? price <= 0 : false) || item?.is_default_side || false
    return {
      id: item?.id || item?.dish_id,
      name: item?.name || 'Sunday Lunch',
      description: item?.description,
      price: Number.isFinite(price) ? price : undefined,
      dietary_info: item?.dietary_info || item?.dietary_flags || [],
      allergens: item?.allergens || item?.allergen_flags || [],
      included: item?.included ?? defaultIncluded,
      is_available: item?.is_available ?? item?.is_active ?? true
    }
  }

  return {
    menuDate: payload.menu_date || payload.date || payload.menu?.menu_date,
    cutoffTime: payload.cutoff_time || payload.menu?.cutoff_time,
    mains: Array.isArray(mainsSource) ? mainsSource.map(mapItem) : [],
    sides: Array.isArray(sidesSource) ? sidesSource.map(mapItem) : []
  }
}

async function loadSundayMenu(): Promise<{ menu: NormalizedMenu; fromFallback: boolean; error?: string }> {
  try {
    const data = await anchorAPI.getSundayLunchMenu()
    const menu = normalizeMenu(data)

    if (menu.mains.length || menu.sides.length) {
      return { menu, fromFallback: false }
    }
  } catch (error: any) {
    console.error('Sunday lunch menu fetch failed', error)
    return {
      menu: FALLBACK_MENU,
      fromFallback: true,
      error: error?.message || 'Unable to load Sunday lunch menu'
    }
  }

  return { menu: FALLBACK_MENU, fromFallback: true }
}

function formatCutoff(cutoff?: string) {
  if (!cutoff) return 'Saturday 1pm'
  const date = new Date(cutoff)
  if (isNaN(date.getTime())) return 'Saturday 1pm'
  return date.toLocaleString('en-GB', {
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit'
  })
}

export default async function SundayLunchPage() {
  const [{ menu, fromFallback, error: menuError }, businessHours] = await Promise.all([
    loadSundayMenu(),
    getBusinessHours()
  ])
  const sundayKitchen = businessHours?.regularHours?.sunday?.kitchen
  const sundayKitchenHours = sundayKitchen && isKitchenOpen(sundayKitchen)
    ? `${formatTime12Hour(sundayKitchen.opens)}–${formatTime12Hour(sundayKitchen.closes)}`
    : null
  const openingHoursSpecification = sundayKitchen && isKitchenOpen(sundayKitchen)
    ? [{
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Sunday',
        opens: sundayKitchen.opens,
        closes: sundayKitchen.closes,
        description: 'Sunday lunch service hours'
      }]
    : []
  const sundayServiceLabel = sundayKitchenHours ? `Sundays ${sundayKitchenHours}` : 'Sunday kitchen hours'
  const sundayServiceSentence = sundayKitchenHours
    ? `Served Sundays ${sundayKitchenHours}`
    : 'Served during Sunday kitchen hours'

  const menuItemsForSchema = menu.mains.length ? menu.mains : FALLBACK_MENU.mains
  const priceValues = menuItemsForSchema.map(item => item.price).filter((p): p is number => typeof p === 'number')

[truncated at line 200 — original has 841 lines]
```

### `app/test-gtm/head.tsx`

_(deleted or missing from working tree)_

### `app/test-gtm/page.tsx`

_(deleted or missing from working tree)_

### `app/test-hours/head.tsx`

_(deleted or missing from working tree)_

### `app/test-hours/page.tsx`

_(deleted or missing from working tree)_

### `app/test-navigation-tracking/head.tsx`

_(deleted or missing from working tree)_

### `app/test-navigation-tracking/page.tsx`

_(deleted or missing from working tree)_

### `app/test-reviews/head.tsx`

_(deleted or missing from working tree)_

### `app/test-reviews/page.tsx`

_(deleted or missing from working tree)_

### `app/test-simple/head.tsx`

_(deleted or missing from working tree)_

### `app/test-simple/page.tsx`

_(deleted or missing from working tree)_

### `app/test-tracking/head.tsx`

_(deleted or missing from working tree)_

### `app/test-tracking/page.tsx`

_(deleted or missing from working tree)_

### `app/whats-on/page.tsx`

```
import Link from 'next/link'
import { Button, Container, Section, Card, CardBody, Grid } from '@/components/ui'
import { StatusBar } from '@/components/layout/StatusBar'
import { FilteredUpcomingEvents } from '@/components/FilteredUpcomingEvents'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { Suspense } from 'react'
import { CTASection, SectionHeader, FeatureGrid, InfoBoxGrid } from '@/components/ui'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import ScrollDepthTracker from '@/components/tracking/ScrollDepthTracker'
import { SocialLink } from '@/components/SocialLink'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { SpeakableSchema } from '@/components/seo/SpeakableSchema'
import { SpeakableContent } from '@/components/voice/SpeakableContent'
import { InternalLinkingSection, commonLinkGroups } from '@/components/seo/InternalLinkingSection'
import { BookTableButton } from '@/components/BookTableButton'
import { TrustBar } from '@/components/psychology'
import { quizNightEventSeries, bingoEventSeries } from '@/lib/schema'
import { getBusinessHours, getUpcomingEvents, type Event } from '@/lib/api'
import { buildOpeningHoursSchema } from '@/lib/opening-hours-schema'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { getBusinessStats } from '@/lib/schema-with-reviews'

export const metadata: Metadata = {
  title: "Quiz, Karaoke & Bingo Every Week | The Anchor Pub",
  description: "Pub quiz, karaoke Fridays, Music Bingo, cash bingo & live music at The Anchor, Stanwell Moor. Entry from £3. Free parking, 7 mins from Heathrow T5. See all dates.",
  openGraph: {
    title: "What's On Near Heathrow — Quiz, Bingo & Live Music Every Week",
    description: "Weekly pub events: Music Bingo, cash bingo, pub quiz, open mic and more at The Anchor, Stanwell Moor. From £3, free parking.",
    images: ["/images/events/quiz-night/the-anchor-quiz-night-stanwell-moor.jpg"],
  },
  twitter: getTwitterMetadata({
    title: "What's On Near Heathrow — Quiz, Bingo & Live Music Every Week",
    description: "Weekly pub events: Music Bingo, cash bingo, pub quiz, open mic and more at The Anchor, Stanwell Moor. From £3, free parking.",
    images: ["/images/events/quiz-night/the-anchor-quiz-night-stanwell-moor.jpg"]
  }),
  alternates: {
    canonical: '/whats-on'
  }
}

async function getOpeningHoursSpecification() {
  try {
    // Avoid blocking the page if the API is slow or unreachable
    const hours = await Promise.race([
      getBusinessHours(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000))
    ])

    return buildOpeningHoursSchema(hours?.regularHours)
  } catch (error) {
    console.warn('Failed to load opening hours for /whats-on schema, omitting hours', error)
    return []
  }
}

export default async function WhatsOnPage() {
  const [openingHoursSpecification, { rating, reviewCount }, upcomingEvents] = await Promise.all([
    getOpeningHoursSpecification(),
    getBusinessStats(),
    getUpcomingEvents(24).catch(() => [] as Event[]),
  ])

  // Resolve next upcoming event for each Monthly Highlights category.
  // The /events list endpoint does not include category objects, so match
  // on event name and slug instead.
  const nextMusicBingo = upcomingEvents.find(e => {
    const slug = (e.slug ?? '').toLowerCase()
    const name = (e.name ?? '').toLowerCase()
    return slug.startsWith('music-bingo') || name.includes('music bingo')
  })
  const nextQuizNight = upcomingEvents.find(e => {
    const slug = (e.slug ?? '').toLowerCase()
    const name = (e.name ?? '').toLowerCase()
    return slug.startsWith('quiz-night') || name === 'quiz night'
  })
  const nextCashBingo = upcomingEvents.find(e => {
    const slug = (e.slug ?? '').toLowerCase()
    const name = (e.name ?? '').toLowerCase()
    // Match "Bingo" but not "Music Bingo"
    return slug.startsWith('bingo') || (name.includes('bingo') && !name.includes('music'))
  })

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Events', url: '/whats-on' }
        ]}
      />
      <SpeakableSchema />
      <ScrollDepthTracker />
      {/* JSON-LD Event Series Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdSafeStringify([
            quizNightEventSeries,
            bingoEventSeries,
            {
              "@context": "https://schema.org",
              "@type": "EventVenue",
              "@id": "https://www.the-anchor.pub/#event-venue",
              "name": "The Anchor Event Space",
              "description": "Versatile event space hosting quiz nights, hosted events, bingo, and live entertainment",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Horton Road",
                "addressLocality": "Stanwell Moor",
                "addressRegion": "Surrey",
                "postalCode": "TW19 6AQ",
                "addressCountry": "GB"
              },
              "maximumAttendeeCapacity": 100,
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": rating,
                "reviewCount": reviewCount,
                "bestRating": "5",
                "worstRating": "1"
              },
              "amenityFeature": [
                {
                  "@type": "LocationFeatureSpecification",
                  "name": "Stage Area",
                  "value": true
                },
                {
                  "@type": "LocationFeatureSpecification",
                  "name": "Sound System",
                  "value": true
                },
                {
                  "@type": "LocationFeatureSpecification",
                  "name": "Lighting",
                  "value": true
                },
                {
                  "@type": "LocationFeatureSpecification",
                  "name": "Bar Service",
                  "value": true
                }
              ],
              "publicAccess": true,
              "isAccessibleForFree": false,
              "currenciesAccepted": "GBP",
              "paymentAccepted": ["Cash", "Credit Card", "Debit Card"],
              "openingHoursSpecification": openingHoursSpecification
            }
          ])
        }}
      />
      {/* Hero Section */}
      <HeroWrapper
        route="/whats-on"
        title="Pub Events at The Anchor"
        description="From Music Bingo hosted by Nikki Manfadge to quiz nights and one-off events — check the listings for the latest."
       
	        tags={[
	          { label: 'Music Bingo (Nikki)', variant: 'primary' },
	          { label: 'Quiz Night £3', variant: 'warning' },
	          { label: 'Pool & Darts FREE', variant: 'default' },
	          { label: 'Great Atmosphere', variant: 'success' }
	        ]}
        primaryCta={
          <BookTableButton
            source="whats_on_hero"
            variant="primary"
            size="lg"
            fullWidth
            className="w-full sm:w-auto"
          >
            Reserve a Table
          </BookTableButton>
        }
        secondaryCta={
          <>
            <Link href="#upcoming-events" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                className="sm:w-auto"
              >
                View All Events
              </Button>
            </Link>
            <Link href="/food-menu#pizza" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                className="sm:w-auto"
              >
                Pizza Menu
              </Button>
            </Link>

[truncated at line 200 — original has 690 lines]
```

### `components/FilteredUpcomingEventsClient.tsx`

```
'use client'

import { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useInView } from 'react-intersection-observer'
import { formatEventDate, formatEventTime, getEventShortDescription, formatDoorTime } from '@/lib/api'
import { getEventDateRangeUtc } from '@/lib/event-calendar'
import { EventBookingButton } from '@/components/EventBookingButton'
import { DEFAULT_EVENT_IMAGE } from '@/lib/image-fallbacks'
import { getEventPriceLabel } from '@/lib/event-pricing'
import { EventSecondaryActions } from '@/components/events/EventSecondaryActions'
import type { DisplayEvent } from '@/types/display-event'

const MAX_URGENCY_DAYS = 3
const LONDON_TIME_ZONE = 'Europe/London'

function getLondonDateKey(value: Date): string {
  return value.toLocaleDateString('en-GB', {
    timeZone: LONDON_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

type EventUrgency = {
  label: string
  message: string
  badgeClassName: string
  panelClassName: string
}

interface EventTimingInfo {
  relativeLabel: string
  urgency: EventUrgency | null
}

function getEventTimingInfo(event: DisplayEvent): EventTimingInfo | null {
  const eventStart = getEventDateRangeUtc(event).start
  if (Number.isNaN(eventStart.getTime())) {
    return null
  }

  const now = new Date()
  const diffMs = eventStart.getTime() - now.getTime()
  const todayKey = getLondonDateKey(now)
  const tomorrowKey = getLondonDateKey(new Date(now.getTime() + 86400000))
  const eventKey = getLondonDateKey(eventStart)
  const isToday = todayKey === eventKey
  const isTomorrow = tomorrowKey === eventKey
  const relativeLabel =
    diffMs <= 0
      ? 'Happening now'
      : isToday
      ? 'Today'
      : isTomorrow
      ? 'Tomorrow'
      : eventStart.toLocaleDateString('en-GB', { weekday: 'long', timeZone: LONDON_TIME_ZONE })

  let urgency: EventUrgency | null = null

  if (diffMs > 0) {
    const hoursUntil = diffMs / (1000 * 60 * 60)
    const totalDaysUntil = diffMs / (1000 * 60 * 60 * 24)
    const daysUntil = Math.floor(totalDaysUntil)

    if (totalDaysUntil <= MAX_URGENCY_DAYS) {
      if (hoursUntil <= 24) {
        urgency = {
          label: hoursUntil <= 12 ? 'Starts tonight' : 'Starts tomorrow',
          message: `We kick off at ${formatEventTime(event.startDate)}.`,
          badgeClassName: 'bg-red-600 text-white',
          panelClassName: 'bg-red-900/20 border border-red-500/30 text-red-400'
        }
      } else if (daysUntil <= 2) {
        urgency = {
          label: 'Almost here',
          message: `Join us this ${eventStart.toLocaleDateString('en-GB', { weekday: 'long', timeZone: LONDON_TIME_ZONE })}.`,
          badgeClassName: 'bg-anchor-gold text-anchor-charcoal',
          panelClassName: 'bg-anchor-gold/20 border border-anchor-gold/40 text-anchor-gold-vivid'
        }
      } else {
        const urgencyDayCount = Math.max(1, Math.round(totalDaysUntil))
        urgency = {
          label: `Only ${urgencyDayCount} day${urgencyDayCount === 1 ? '' : 's'} to go`,
          message: 'Book early to get your preferred time.',
          badgeClassName: 'bg-anchor-green text-white',
          panelClassName: 'bg-anchor-green/10 border border-anchor-green/30 text-anchor-gold-vivid'
        }
      }
    }
  }

  return {
    relativeLabel,
    urgency
  }
}

function formatTimeChangeDate(startDate?: string | null, endDate?: string | null): string {
  if (!startDate) return 'Date TBC'
  const start = new Date(`${startDate}T00:00:00Z`)
  if (!endDate || endDate === startDate) {
    return start.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  }

  const end = new Date(`${endDate}T00:00:00Z`)
  const sameMonthYear =
    start.getUTCFullYear() === end.getUTCFullYear() &&
    start.getUTCMonth() === end.getUTCMonth()

  const startLabel = start.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })

  const endLabel = end.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: sameMonthYear ? 'short' : 'short',
    year: sameMonthYear ? undefined : 'numeric'
  })

  return `${startLabel} – ${endLabel}`
}

function formatSimpleTime(time?: string | null): string | null {
  if (!time) return null
  const [rawHours, rawMinutes] = time.split(':')
  const hours = Number(rawHours)
  if (Number.isNaN(hours)) return null
  const minutes = Number(rawMinutes ?? '0')
  const period = hours >= 12 ? 'pm' : 'am'
  const displayHour = hours % 12 || 12
  const minutePart = minutes === 0 ? '' : `:${minutes.toString().padStart(2, '0')}`
  return `${displayHour}${minutePart}${period}`
}

/** Build a /book-table link pre-filled with the event date (YYYY-MM-DD). */
function getTableBookingHref(event: DisplayEvent): string | null {
  if (!event.startDate) return null
  const start = getEventDateRangeUtc(event).start
  if (Number.isNaN(start.getTime())) return null
  // Only offer table booking for future events
  if (start.getTime() < Date.now()) return null
  const yyyy = start.getUTCFullYear()
  const mm = String(start.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(start.getUTCDate()).padStart(2, '0')
  return `/book-table?date=${yyyy}-${mm}-${dd}`
}

interface EventCardProps {
  event: DisplayEvent
  index: number
}

const EventCard = memo(function EventCard({ event, index }: EventCardProps) {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
    rootMargin: '100px'
  })

  const isTimeChange = !!event.isTimeChange
  const eventImage = event.image?.[0] || event.heroImageUrl || DEFAULT_EVENT_IMAGE
  const timingInfo = isTimeChange ? null : getEventTimingInfo(event)
  const priceLabel = isTimeChange ? null : getEventPriceLabel(event)

  const startTime = isTimeChange
    ? event.timeChangeStatus === 'closed'
      ? 'Closed'
      : formatSimpleTime(event.timeChangeOpens) || 'TBC'
    : formatEventTime(event.startDate)

  const endTime = isTimeChange
    ? event.timeChangeStatus === 'closed'
      ? null
      : formatSimpleTime(event.timeChangeCloses)
    : null

  const eventDate = isTimeChange
    ? formatTimeChangeDate(event.timeChangeDate, event.timeChangeRangeEnd)
    : formatEventDate(event.startDate)

  const timeChangeSchedule =
    event.timeChangeStatus === 'closed'
      ? 'Closed'
      : `Open ${event.timeChangeOpens || 'TBC'} - ${event.timeChangeCloses || 'TBC'}`

  const timeChangeMessage =
    event.timeChangeNote ||
    (event.timeChangeStatus === 'closed'
      ? 'The venue is closed on this date.'
      : 'Opening hours have been adjusted for this date.')

[truncated at line 200 — original has 665 lines]
```

### `config/redirects/blog-redirects.json`

```
[
  {
    "source": "/blog/5-star-tequila-tasting-night-at-the-anchor-an-unfo",
    "destination": "/blog/tequila-tasting-events",
    "permanent": true
  },
  {
    "source": "/blog/a-night-to-remember-the-anchor-s-gameshow-house-pa",
    "destination": "/blog/gameshow-house-party",
    "permanent": true
  },
  {
    "source": "/blog/a-toast-to-the-dead-tequila-s-role-in-d-a-de-los-m",
    "destination": "/blog/tequila-day-of-dead",
    "permanent": true
  },
  {
    "source": "/blog/anchor-sports-update-the-future-of-sport-at-the-an",
    "destination": "/blog/sports-update",
    "permanent": true
  },
  {
    "source": "/blog/arjun-r-s-piano-performance-at-the-anchor-s-christ",
    "destination": "/blog/piano-christmas-performance",
    "permanent": true
  },
  {
    "source": "/blog/cash-bingo-at-the-anchor-win-50-at-our-monthly-bin",
    "destination": "/blog/monthly-cash-bingo",
    "permanent": true
  },
  {
    "source": "/blog/celebrate-british-pie-week-heathrow-2024-stanwell-",
    "destination": "/blog/british-pie-week-2024",
    "permanent": true
  },
  {
    "source": "/blog/celebrate-christmas-2023-at-the-anchor-events-and-",
    "destination": "/blog/christmas-events",
    "permanent": true
  },
  {
    "source": "/blog/celebrate-day-of-the-dead-at-the-anchor-with-fun-a",
    "destination": "/blog/day-of-the-dead-party",
    "permanent": true
  },
  {
    "source": "/blog/celebrate-father-s-day-at-the-anchor-unforgettable",
    "destination": "/blog/fathers-day-celebration",
    "permanent": true
  },
  {
    "source": "/blog/celebrating-life-and-spirits-the-day-of-the-dead-t",
    "destination": "/blog/day-of-dead-traditions",
    "permanent": true
  },
  {
    "source": "/blog/celebrating-national-burger-day-a-half-price-burge",
    "destination": "/blog/national-burger-day",
    "permanent": true
  },
  {
    "source": "/blog/charity-walk-for-holly-near-heathrow-stanwell-moor",
    "destination": "/blog/charity-walk-holly",
    "permanent": true
  },
  {
    "source": "/blog/children-s-mental-health-week-supporting-young-min",
    "destination": "/blog/childrens-mental-health-week",
    "permanent": true
  },
  {
    "source": "/blog/creations-by-lee-jewellery-event-at-the-anchor-exc",
    "destination": "/blog/jewellery-event",
    "permanent": true
  },
  {
    "source": "/blog/december-at-the-anchor-celebrating-community-chris",
    "destination": "/blog/december-celebrations",
    "permanent": true
  },
  {
    "source": "/blog/dive-into-the-anchor-s-autumn-winter-menu-cozy-del",
    "destination": "/blog/autumn-winter-menu",
    "permanent": true
  },
  {
    "source": "/blog/diwali-2023-a-grand-celebration-in-stanwell-moor",
    "destination": "/blog/diwali-celebration",
    "permanent": true
  },
  {
    "source": "/blog/drag-cabaret-at-the-anchor-a-night-of-fun-with-nik",
    "destination": "/blog/drag-cabaret-nikki",
    "permanent": true
  },
  {
    "source": "/blog/earth-day-2024-at-the-anchor-join-the-cleanup-thea",
    "destination": "/blog/earth-day-cleanup",
    "permanent": true
  },
  {
    "source": "/blog/enjoy-pravha-at-the-anchor-the-light-and-refreshin",
    "destination": "/blog/pravha-beer",
    "permanent": true
  },
  {
    "source": "/blog/essential-tips-for-travelling-with-your-dog-safety",
    "destination": "/blog/dog-travel-tips",
    "permanent": true
  },
  {
    "source": "/blog/exciting-arrival-welcome-inches-apple-cider-to-our",
    "destination": "/blog/inches-apple-cider",
    "permanent": true
  },
  {
    "source": "/blog/exciting-new-events-offers-at-the-anchor-for-2025-",
    "destination": "/blog/events-offers-2025",
    "permanent": true
  },
  {
    "source": "/blog/exciting-news-extended-opening-hours-on-fridays-th",
    "destination": "/blog/friday-extended-hours",
    "permanent": true
  },
  {
    "source": "/blog/experience-the-magic-at-the-anchor-s-christmas-mar",
    "destination": "/blog/christmas-market",
    "permanent": true
  },
  {
    "source": "/blog/explore-the-anchor-s-unique-events-and-gatherings",
    "destination": "/blog/unique-events",
    "permanent": true
  },
  {
    "source": "/blog/host-your-company-celebrations-at-the-anchor-pub-i",
    "destination": "/blog/company-celebrations",
    "permanent": true
  },
  {
    "source": "/blog/international-day-of-peace-stanwell-moor-village-s",
    "destination": "/blog/peace-day-stanwell",
    "permanent": true
  },
  {
    "source": "/blog/international-women-s-day-2024-celebration-stanwel",
    "destination": "/blog/womens-day-2024",
    "permanent": true
  },
  {
    "source": "/blog/international-women-s-day-celebrating-the-achievem",
    "destination": "/blog/womens-day-celebration",
    "permanent": true
  },
  {
    "source": "/blog/introducing-stanwell-moor-brew-at-the-anchor-thean",
    "destination": "/blog/stanwell-moor-brew",
    "permanent": true
  },
  {
    "source": "/blog/monthly-music-bingo-nights-great-food-prizes-and-f",
    "destination": "/blog/music-bingo-nights",
    "permanent": true
  },
  {
    "source": "/blog/new-year-vibes-stanwell-moor-village-staines-the-a",
    "destination": "/blog/new-year-celebration",
    "permanent": true
  },
  {
    "source": "/blog/pancake-day-fun-stanwell-moor-village-staines-the-",
    "destination": "/blog/pancake-day-celebration",
    "permanent": true
  },
  {
    "source": "/blog/paws-and-profits-tips-for-starting-a-pet-friendly-",
    "destination": "/blog/pet-friendly-business-tips",
    "permanent": true
  },
  {
    "source": "/blog/pub-etiquette-101-top-tips-for-a-great-night-out",
    "destination": "/blog/pub-etiquette-tips",
    "permanent": true
  },
  {
    "source": "/blog/pub-jobs-near-heathrow-bar-staff-and-sunday-runner",
    "destination": "/blog/pub-jobs-heathrow",
    "permanent": true
  },
  {
    "source": "/blog/random-acts-of-kindness-day-join-our-village-celeb",
    "destination": "/blog/kindness-day",
    "permanent": true
  },
  {
    "source": "/blog/rum-tasting-night-stanwell-moor-explore-caribbean-",
    "destination": "/blog/rum-tasting-caribbean",
    "permanent": true

[truncated at line 200 — original has 797 lines]
```

### `config/redirects/wix-redirects.json`

```
[
  {
    "source": "/food",
    "destination": "/food-menu",
    "permanent": true
  },
  {
    "source": "/drink",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/our-events",
    "destination": "/whats-on",
    "permanent": true
  },
  {
    "source": "/sport",
    "destination": "/live-sport",
    "permanent": true
  },
  {
    "source": "/review-the-anchor",
    "destination": "/",
    "permanent": true
  },
  {
    "source": "/join-the-team",
    "destination": "/",
    "permanent": true
  },
  {
    "source": "/honey-bee-mine",
    "destination": "/",
    "permanent": true
  },
  {
    "source": "/honey-bee-mine-terms-and-conditions",
    "destination": "/privacy-policy",
    "permanent": true
  },
  {
    "source": "/subscribe",
    "destination": "/",
    "permanent": true
  },
  {
    "source": "/celebrating-sport-at-the-anchor",
    "destination": "/whats-on",
    "permanent": true
  },
  {
    "source": "/heel-of-fortune",
    "destination": "/whats-on",
    "permanent": true
  },
  {
    "source": "/heel-of-fortune-admin",
    "destination": "/",
    "permanent": true
  },
  {
    "source": "/digital-flyer-survey",
    "destination": "/",
    "permanent": true
  },
  {
    "source": "/privacy-and-cookie-policy",
    "destination": "/privacy-policy",
    "permanent": true
  },
  {
    "source": "/product-page/:product*",
    "destination": "/",
    "permanent": true
  },
  {
    "source": "/category/:category*",
    "destination": "/",
    "permanent": true
  },
  {
    "source": "/event-details/:event*",
    "destination": "/whats-on",
    "permanent": true
  },
  {
    "source": "/blog/categories/:category*",
    "destination": "/blog",
    "permanent": true
  },
  {
    "source": "/blog/page/:page",
    "destination": "/blog",
    "permanent": true
  },
  {
    "source": "/post/autumn-internationals-2024-fixtures-key-matches",
    "destination": "/live-sport",
    "permanent": true
  },
  {
    "source": "/post/charity-walk-for-holly-fathers-mission",
    "destination": "/blog/charity-walk-holly",
    "permanent": true
  },
  {
    "source": "/post/tequila-and-tradition-role-of-agave",
    "destination": "/blog/tequila-and-tradition-how-agave-shapes-mexican-cul",
    "permanent": true
  },
  {
    "source": "/post/quiz-night-at-the-anchor",
    "destination": "/blog/quiz-night-at-the-anchor",
    "permanent": true
  },
  {
    "source": "/post/the-importance-of-being-dog-friendly",
    "destination": "/blog/dog-friendly-pub",
    "permanent": true
  },
  {
    "source": "/post/british-chip-shop-guide",
    "destination": "/blog/fish-chips-guide",
    "permanent": true
  },
  {
    "source": "/post/euro-2024-stanwell-moor-staines",
    "destination": "/live-sport",
    "permanent": true
  },
  {
    "source": "/post/celebrate-fathers-day-at-the-anchor",
    "destination": "/blog/fathers-day-celebration",
    "permanent": true
  },
  {
    "source": "/post/introducing-inches-apple-cider",
    "destination": "/blog/inches-apple-cider",
    "permanent": true
  },
  {
    "source": "/post/mothers-day",
    "destination": "/blog/mothers-day-at-the-anchor-march-19th",
    "permanent": true
  },
  {
    "source": "/post/hop-into-the-easter-weekend-at-the-anchor-pub-fun-food-and-festivities",
    "destination": "/blog/easter-weekend-fun-at-the-anchor-pub",
    "permanent": true
  },
  {
    "source": "/post/celebrating-life-and-spirits-day-of-the-dead-traditions",
    "destination": "/blog/day-of-the-dead-party",
    "permanent": true
  },
  {
    "source": "/post/tequila-cultural-significance-during-dia-de-los-muertos",
    "destination": "/blog/day-of-the-dead-party",
    "permanent": true
  },
  {
    "source": "/post/ve-day-at-the-anchor",
    "destination": "/blog/ve-day-celebration",
    "permanent": true
  },
  {
    "source": "/post/sunday-lunch-at-the-anchor",
    "destination": "/sunday-lunch",
    "permanent": true
  },
  {
    "source": "/post/welcoming-back-sunday-lunches",
    "destination": "/sunday-lunch",
    "permanent": true
  },
  {
    "source": "/post/introducing-new-dining-room-the-anchor",
    "destination": "/blog/new-dining-room",
    "permanent": true
  },
  {
    "source": "/post/st-patricks-day-2024-celebration-the-anchor",
    "destination": "/blog/st-patricks-day-2024",
    "permanent": true
  },
  {
    "source": "/post/remembrance-day-anchor-staines",
    "destination": "/blog/reflecting-on-sacrifice-remembrance-day-observance",
    "permanent": true
  },
  {
    "source": "/post/exciting-new-events-offers-the-anchor-2025",
    "destination": "/blog/events-offers-2025",
    "permanent": true
  },
  {
    "source": "/post/easter-weekend-at-the-anchor",
    "destination": "/blog/easter-weekend-fun-at-the-anchor-pub",
    "permanent": true

[truncated at line 200 — original has 792 lines]
```

### `docs/SSOT-Review-The-Anchor.docx`

_(binary or >200KB —    55450 bytes — not embedded)_

### `docs/architecture/README.md`

```
---
generated: true
last_updated: 2026-04-21T00:00:00Z
source: session-setup
project: the-anchor-pub
---

# Architecture Docs — The Anchor Pub Website

> Auto-generated by session-setup. Manual edits will be overwritten on next refresh.
> To add persistent notes, use `docs/architecture/NOTES.md` — that file is never overwritten.

## Index

| File | Contents | Status |
|------|----------|--------|
| [overview.md](./overview.md) | Tech stack, scale metrics, auth model, data flow | Generated |
| [routes.md](./routes.md) | All 117 page routes + 40 API routes with methods | Generated |
| [server-actions.md](./server-actions.md) | No server actions — mutation pattern via API routes | Generated |
| [data-model.md](./data-model.md) | No local DB — Management API client docs + critical null-safety rule | Generated |
| [env-vars.md](./env-vars.md) | All env vars: declared vs used, public vs server | Generated |
| [relationships.md](./relationships.md) | Routes × integrations cross-reference map | Generated |
| [NOTES.md](./NOTES.md) | Persistent human notes (never overwritten) | Manual |

## Quick Facts

- **117** page routes, **40** API routes
- **0** server actions (`'use server'`) — all mutations via API proxy routes
- **No local database** — data owned by `OJ-AnchorManagementTools`
- **7** external integrations: Management API, PayPal, Turnstile, AviationStack, GTM, Clarity, Microsoft Graph
- **No auth** — fully public site; `ANCHOR_API_KEY` is server-only
```

### `docs/architecture/data-model.md`

```
---
generated: true
last_updated: 2026-04-21T00:00:00Z
source: session-setup
project: the-anchor-pub
---

# Data Model

> Auto-generated by session-setup. Manual edits will be overwritten on next refresh.

## No Local Database

This project has no local database. It is a marketing and booking website only.

All data is owned by the Management API at `management.orangejelly.co.uk`. See `lib/api/client.ts` for the API client (`AnchorAPI` class, exported as `anchorAPI`).

## API Client

**File:** `/lib/api/client.ts`

The `AnchorAPI` class wraps all Management API calls. Instantiated at module level:

```typescript
export const anchorAPI = new AnchorAPI(process.env.ANCHOR_API_KEY)
```

Key methods (consumed by API proxy routes and server components):

| Method | Management API endpoint | Used by |
|--------|------------------------|---------|
| `getBusinessHours()` | `GET /business/hours` | `/api/business/hours/route.ts`, `lib/booking-helpers.ts` |
| `getTableAvailability()` | `GET /table-bookings/availability` | `/api/table-bookings/availability/route.ts` |
| `createTableBooking()` | `POST /table-bookings` | `/api/table-bookings/route.ts` |
| `getEvents()` | `GET /events` | `/api/events/route.ts` |
| `getEvent()` | `GET /events/[id]` | `/api/events/[id]/route.ts` |
| `getMenus()` | `GET /menus` | Food menu pages |

## Supporting Libraries

| File | Purpose |
|------|---------|
| `lib/api/client.ts` | Main API client — `AnchorAPI` class |
| `lib/management-api-base.ts` | Base URL resolution (`ANCHOR_API_BASE_URL` env var) |
| `lib/hours-utils.ts` | `getEffectiveDayHours()`, `isKitchenClosed()` — uses `??` not `\|\|` for null safety |
| `lib/table-booking-service-windows.ts` | `resolveServiceRanges()` — converts hours into bookable slots |
| `lib/booking-helpers.ts` | Shared booking logic, build-time guard for external API calls |

## Special Hours Override — Critical Rule

`kitchen: null` from the API means the kitchen is **deliberately closed** for that date. Never use `||` to fall back from null — always use `??`. Using `||` causes null to fall through to regular hours (this caused a production bug in March 2026).
```

### `docs/architecture/env-vars.md`

```
---
generated: true
last_updated: 2026-04-21T00:00:00Z
source: session-setup
project: the-anchor-pub
---

# Environment Variables

> Auto-generated by session-setup. Manual edits will be overwritten on next refresh.

## Declared in `.env.example`

| Variable | Public/Server | Purpose |
|----------|--------------|---------|
| `ANCHOR_API_KEY` | Server | Auth key for Management API calls |
| `ANCHOR_API_BASE_URL` | Server | Override Management API base URL (optional, defaults to production) |
| `NEXT_PUBLIC_AVIATIONSTACK_API_KEY` | Public | AviationStack flight data for Heathrow parking feature |
| `OPENWEATHER_API_KEY` | Server | OpenWeatherMap (declared but usage not confirmed in scan) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Public | Google Analytics 4 Measurement ID |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | Public | Microsoft Clarity session recording |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | Public | PayPal SDK client ID (parking + table booking deposits) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Public | Cloudflare Turnstile site key (anti-spam on forms) |
| `TURNSTILE_SECRET_KEY` | Server | Cloudflare Turnstile server-side verification |

## Additional Variables (used in code, not in `.env.example`)

| Variable | Public/Server | Used In | Purpose |
|----------|--------------|---------|---------|
| `NEXT_PUBLIC_GTM_ID` | Public | `app/layout.tsx` | Google Tag Manager container ID (fallback: `GTM-WWFQTQS`) |
| `NEXT_PUBLIC_SITE_URL` | Public | `lib/api/client.ts` | Canonical site URL for internal API calls |
| `NEXT_PUBLIC_TWITTER_HANDLE` / `NEXT_PUBLIC_X_HANDLE` | Public | `lib/twitter-metadata.ts` | Social metadata |
| `NEXT_PUBLIC_BOOKING_DEBUG` | Public | `components/features/BookingWizard/index.tsx` | Booking debug logging |
| `NEXT_PUBLIC_STATUSBAR_DEBUG` | Public | `hooks/useBusinessHours.ts` | Status bar debug logging |
| `NEXT_PUBLIC_ANALYTICS_DEBUG` | Public | `lib/analytics.ts` | Analytics debug mode |
| `NEXT_PUBLIC_FORCE_SEASON` | Public | `lib/seasonal-utils.ts` | Force a specific seasonal hero image |
| `NEXT_PUBLIC_PRIVATE_HIRE_2026_PROMO_ENABLED` | Public | `lib/promos/privateHire2026.ts` | Feature flag for promo popup |
| `MS_PREVIEW_TOKEN` | Server | `app/drinks/managers-special/page.tsx` | Preview token for manager's special |
| `SEASONAL_IMAGE_LOGS` | Server | `lib/seasonal-utils.ts` | Debug logging for seasonal images |
| `API_DEBUG_LOGS` | Server | `lib/seasonal-utils.ts`, `app/api/analytics/route.ts` | Verbose API debug logging |
| `ENABLE_BUILD_TIME_EXTERNAL_API` | Server | `lib/api/client.ts`, `lib/booking-helpers.ts` | Allow external API calls at build time |
| `NEXT_PHASE` | Server | `lib/api/client.ts` | Next.js build phase detection |
| `VERCEL_URL` | Server | `lib/api/client.ts` | Vercel deployment URL (auto-set by Vercel) |
| `MICROSOFT_TENANT_ID` | Server | `app/api/enquiry/christmas/route.ts` | Microsoft Graph OAuth |
| `MICROSOFT_CLIENT_ID` | Server | `app/api/enquiry/christmas/route.ts` | Microsoft Graph OAuth |
| `MICROSOFT_CLIENT_SECRET` | Server | `app/api/enquiry/christmas/route.ts` | Microsoft Graph OAuth |
| `MICROSOFT_USER_EMAIL` | Server | `app/api/enquiry/christmas/route.ts` | Sender mailbox for Christmas enquiries |
| `CHRISTMAS_ENQUIRY_TO` | Server | `app/api/enquiry/christmas/route.ts` | Recipient for Christmas enquiry emails |
```

### `docs/architecture/overview.md`

```
---
generated: true
last_updated: 2026-04-21T00:00:00Z
source: session-setup
project: the-anchor-pub
---

# Project Overview — The Anchor Pub Website

> Auto-generated by session-setup. Manual edits will be overwritten on next refresh.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + CVA |
| Hosting | Vercel |
| DNS / CDN | Cloudflare |
| Analytics | Google Tag Manager (GTM) |
| Database | None — marketing site only |
| Auth | None — public site |

## Scale

| Metric | Count |
|--------|-------|
| Page routes (`page.tsx`) | 117 |
| API routes (`route.ts`) | ~40 |
| Server actions (`'use server'`) | 0 (no Supabase; mutations go via API routes) |
| Layouts | 2 (root + private-hire) |
| Integrations | 7 (see below) |

## Key Integrations

| Integration | Purpose |
|------------|---------|
| Management API (`management.orangejelly.co.uk`) | All data — hours, bookings, events, menus |
| PayPal | Parking bookings + table booking deposits |
| Cloudflare Turnstile | Anti-spam on booking/enquiry forms |
| AviationStack | Real-time flight data for Heathrow parking feature |
| Google Tag Manager (GTM) | Analytics event tracking |
| Microsoft Clarity | Session recording / heatmaps |
| Microsoft Graph (OAuth) | Christmas enquiry email via Office 365 |

## Auth Model

No authentication for end users. All pages are public.

API routes that call the Management API authenticate server-side using `ANCHOR_API_KEY` (never exposed to the browser). No Supabase, no sessions, no cookies for auth.

Middleware (`middleware.ts`) handles:
- apex → www redirect (301)
- HTTP → HTTPS enforcement
- Trailing slash normalisation
- Blog `?page=1` cleanup
- Security headers on all responses
- Cache-Control headers (API routes: `s-maxage=60, stale-while-revalidate=300`; `/api/business/hours`: `no-store`)

## Data Flow

```
Customer browser
      │
      │  Next.js pages (SSR / ISR)
      ▼
  API proxy routes (app/api/**/route.ts)
      │   ANCHOR_API_KEY in Authorization header
      │
      ▼
  Management API
  management.orangejelly.co.uk
  (Supabase DB lives here — not in this repo)
```

## Related Repo

`OJ-AnchorManagementTools` at `/Users/peterpitcher/Cursor/OJ-AnchorManagementTools` — the backend that owns all data.
```

### `docs/architecture/relationships.md`

```
---
generated: true
last_updated: 2026-04-21T00:00:00Z
source: session-setup
project: the-anchor-pub
---

# Relationships — Routes × Integrations

> Auto-generated by session-setup. Manual edits will be overwritten on next refresh.

## Integration Map

### Management API (`management.orangejelly.co.uk`)

Every data-driven page or form ultimately calls the Management API through a proxy route.

| Page / Route | Proxy Route | Data Fetched |
|-------------|-------------|-------------|
| `/book-table` | `/api/table-bookings/availability` | Available slots |
| `/book-table` | `/api/table-bookings` (POST) | Create booking |
| `/book-event` | `/api/events/[id]/availability` | Event slots |
| `/book-event` | `/api/event-bookings` (POST) | Create event booking |
| `/whats-on` | `/api/events` | Events list |
| `/events/[id]` | `/api/events/[id]` | Event detail |
| `/heathrow-parking` | `/api/parking/availability` | Parking slots |
| `/heathrow-parking` | `/api/parking/rates` | Pricing |
| `/heathrow-parking` | `/api/parking/bookings` (POST) | Create booking |
| `/food-menu`, `/burger-menu`, etc. | `anchorAPI.getMenus()` | Menu data |
| `/drinks/managers-special` | `/api/managers-special` | Current special |
| `/reviews` | `/api/reviews` | Review data |
| All pages (StatusBar) | `/api/business/hours` | Opening hours |

### PayPal

| Route | Purpose |
|-------|---------|
| `/api/table-bookings/paypal/create-order` | Deposit order for table bookings |
| `/api/table-bookings/paypal/capture-order` | Capture table booking deposit |
| `/api/parking/payment/create-order` | Parking payment order |
| `/api/parking/payment/capture` | Capture parking payment |
| `components/features/TableBooking/PayPalDepositSection.tsx` | Client-side PayPal buttons |
| `components/features/ParkingBookingWizard/index.tsx` | Client-side PayPal SDK loader |

### Cloudflare Turnstile (anti-spam)

| Component | Form |
|-----------|------|
| `components/PrivateBookingInquiryForm.tsx` | Private hire enquiry |
| `components/features/TableBooking/ManagementTableBookingForm.tsx` | Table booking |
| `components/features/EventBooking/ManagementEventBookingForm.tsx` | Event booking |
| `lib/turnstile.ts` | Server-side token verification (`TURNSTILE_SECRET_KEY`) |

### AviationStack (flight data)

| File | Purpose |
|------|---------|
| `lib/flights.ts` | Fetches live flight data for Heathrow parking feature |
| `app/heathrow-parking/[terminal]/page.tsx` | Displays flight info per terminal |
| `components/features/ParkingBookingWizard/index.tsx` | Flight lookup in wizard |

### Google Tag Manager (GTM)

GTM is loaded globally in `app/layout.tsx` via `GTMProvider`. Events are fired throughout the app via `lib/gtm-events.ts` and its sub-modules.

| Module | Events tracked |
|--------|---------------|
| `lib/gtm-events.ts` | CTA clicks, phone calls, email clicks, directions |
| `lib/gtm-events/menu-events.ts` | Menu filter interactions |
| `components/tracking/EventPageTracker.tsx` | Event page views |
| `components/tracking/MenuPageTracker.tsx` | Menu page views |
| `components/tracking/ScrollDepthTracker.tsx` | Scroll depth milestones |
| `app/web-vitals.tsx` | Core Web Vitals → GTM |

### Microsoft Clarity

| File | Purpose |
|------|---------|
| `lib/use-clarity.ts` | Initialises Clarity session recording (`NEXT_PUBLIC_CLARITY_PROJECT_ID`) |
| `components/tracking/AnalyticsProvider.tsx` | Mounts `useClarity` hook |

### Microsoft Graph (Office 365 email)

| File | Purpose |
|------|---------|
| `app/api/enquiry/christmas/route.ts` | Sends Christmas enquiry email via Graph API |

Requires: `MICROSOFT_TENANT_ID`, `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_USER_EMAIL`, `CHRISTMAS_ENQUIRY_TO`.

---

## Middleware Behaviour

`middleware.ts` runs on all routes (except `_next/static`, `_next/image`, `favicon.ico`):

1. apex (`the-anchor.pub`) → `www.the-anchor.pub` (301)
2. HTTP → HTTPS (301)
3. Trailing slash removal (301)
4. `?page=1` on `/blog` stripped (301)
5. Security headers added to all responses
6. Cache headers: API routes `s-maxage=60`; `/api/business/hours` `no-store`
```

### `docs/architecture/routes.md`

```
---
generated: true
last_updated: 2026-04-21T00:00:00Z
source: session-setup
project: the-anchor-pub
---

# Routes

> Auto-generated by session-setup. Manual edits will be overwritten on next refresh.

## Page Routes (117 total)

All pages are public (no auth). Server Components by default unless marked `'use client'`.

### Core / Utility
| URL | File |
|-----|------|
| `/` | `app/page.tsx` (root) |
| `/about` | `app/about/page.tsx` |
| `/find-us` | `app/find-us/page.tsx` |
| `/privacy-policy` | `app/privacy-policy/page.tsx` |
| `/accessibility` | `app/accessibility/page.tsx` |
| `/safety-and-respect` | `app/safety-and-respect/page.tsx` |
| `/sustainability` | `app/sustainability/page.tsx` |
| `/sitemap-page` | `app/sitemap-page/page.tsx` |
| `/reviews` | `app/reviews/page.tsx` |
| `/leave-review` | `app/leave-review/page.tsx` |
| `/[...unmatched]` | `app/[...unmatched]/page.tsx` (404 catch-all) |

### Food & Drink
| URL | File |
|-----|------|
| `/food-menu` | `app/food-menu/page.tsx` |
| `/food-menu/gluten-free` | `app/food-menu/gluten-free/page.tsx` |
| `/food-menu/vegan` | `app/food-menu/vegan/page.tsx` |
| `/food-menu/vegetarian` | `app/food-menu/vegetarian/page.tsx` |
| `/burger-menu` | `app/burger-menu/page.tsx` |
| `/pizza-menu` | `app/pizza-menu/page.tsx` |
| `/sunday-lunch` | `app/sunday-lunch/page.tsx` |
| `/fish-and-chips-heathrow` | `app/fish-and-chips-heathrow/page.tsx` |
| `/drinks` | `app/drinks/page.tsx` |
| `/drinks/[slug]` | `app/drinks/[slug]/page.tsx` |
| `/drinks/baby-guinness` | `app/drinks/baby-guinness/page.tsx` |
| `/drinks/managers-special` | `app/drinks/managers-special/page.tsx` |

### Bookings & Events
| URL | File |
|-----|------|
| `/book-table` | `app/book-table/page.tsx` |
| `/book-event` | `app/book-event/page.tsx` |
| `/booking-confirmation` | `app/booking-confirmation/page.tsx` |
| `/events/[id]` | `app/events/[id]/page.tsx` |
| `/whats-on` | `app/whats-on/page.tsx` |
| `/whats-on/drag-shows` | `app/whats-on/drag-shows/page.tsx` |

### Entertainment
| URL | File |
|-----|------|
| `/live-music` | `app/live-music/page.tsx` |
| `/live-sport` | `app/live-sport/page.tsx` |
| `/live-sport/boxing` | `app/live-sport/boxing/page.tsx` |
| `/live-sport/f1` | `app/live-sport/f1/page.tsx` |
| `/live-sport/six-nations` | `app/live-sport/six-nations/page.tsx` |
| `/live-sport/world-cup` | `app/live-sport/world-cup/page.tsx` |
| `/quiz-night` | `app/quiz-night/page.tsx` |
| `/music-bingo` | `app/music-bingo/page.tsx` |
| `/cash-bingo` | `app/cash-bingo/page.tsx` |
| `/karaoke` | `app/karaoke/page.tsx` |
| `/open-mic` | `app/open-mic/page.tsx` |
| `/pool-darts-pub` | `app/pool-darts-pub/page.tsx` |

### Private Hire
| URL | File |
|-----|------|
| `/private-hire` | `app/private-hire/page.tsx` |
| `/private-hire/baby-showers` | `app/private-hire/baby-showers/page.tsx` |
| `/private-hire/christenings` | `app/private-hire/christenings/page.tsx` |
| `/private-hire/engagement-parties` | `app/private-hire/engagement-parties/page.tsx` |
| `/private-hire/gender-reveal` | `app/private-hire/gender-reveal/page.tsx` |
| `/private-hire/milestone-birthdays` | `app/private-hire/milestone-birthdays/page.tsx` |
| `/private-hire/retirement-parties` | `app/private-hire/retirement-parties/page.tsx` |
| `/private-hire/wakes` | `app/private-hire/wakes/page.tsx` |
| `/private-hire/near/[slug]` | `app/private-hire/near/[slug]/page.tsx` |
| `/private-party-venue` | `app/private-party-venue/page.tsx` |
| `/function-room-hire` | `app/function-room-hire/page.tsx` |
| `/corporate-events` | `app/corporate-events/page.tsx` |
| `/christmas-parties` | `app/christmas-parties/page.tsx` |
| `/corporate-christmas-parties` | `app/corporate-christmas-parties/page.tsx` |
| `/summer-garden-parties` | `app/summer-garden-parties/page.tsx` |

### Seasonal / Occasions
| URL | File |
|-----|------|
| `/new-years-eve` | `app/new-years-eve/page.tsx` |
| `/valentines-day` | `app/valentines-day/page.tsx` |
| `/st-patricks-day` | `app/st-patricks-day/page.tsx` |
| `/easter` | `app/easter/page.tsx` |
| `/mothers-day` | `app/mothers-day/page.tsx` |
| `/fathers-day` | `app/fathers-day/page.tsx` |
| `/bank-holiday-weekends` | `app/bank-holiday-weekends/page.tsx` |
| `/bonfire-night` | `app/bonfire-night/page.tsx` |
| `/halloween` | `app/halloween/page.tsx` |
| `/boxing-day` | `app/boxing-day/page.tsx` |

### Heathrow / Location SEO
| URL | File |
|-----|------|
| `/near-heathrow` | `app/near-heathrow/page.tsx` |
| `/near-heathrow/terminal-2` | `app/near-heathrow/terminal-2/page.tsx` |
| `/near-heathrow/terminal-3` | `app/near-heathrow/terminal-3/page.tsx` |
| `/near-heathrow/terminal-4` | `app/near-heathrow/terminal-4/page.tsx` |
| `/near-heathrow/terminal-5` | `app/near-heathrow/terminal-5/page.tsx` |
| `/heathrow-parking` | `app/heathrow-parking/page.tsx` |
| `/heathrow-parking/[terminal]` | `app/heathrow-parking/[terminal]/page.tsx` |
| `/heathrow-parking/confirmation/[bookingId]` | `app/heathrow-parking/confirmation/[bookingId]/page.tsx` |
| `/parking/bookings/[id]` | `app/parking/bookings/[id]/page.tsx` |
| `/free-parking` | `app/free-parking/page.tsx` |
| `/coach-parking-heathrow` | `app/coach-parking-heathrow/page.tsx` |
| `/heathrow-layover-dining` | `app/heathrow-layover-dining/page.tsx` |
| `/heathrow-family-dining` | `app/heathrow-family-dining/page.tsx` |
| `/heathrow-hotels-pub` | `app/heathrow-hotels-pub/page.tsx` |
| `/restaurants-near-heathrow` | `app/restaurants-near-heathrow/page.tsx` |
| `/luggage-storage-heathrow` | `app/luggage-storage-heathrow/page.tsx` |
| `/pre-flight-meal` | `app/pre-flight-meal/page.tsx` |
| `/plane-spotting-heathrow` | `app/plane-spotting-heathrow/page.tsx` |
| `/pub-garden-heathrow` | `app/pub-garden-heathrow/page.tsx` |
| `/dog-friendly-pub-heathrow` | `app/dog-friendly-pub-heathrow/page.tsx` |
| `/family-friendly-pub-heathrow` | `app/family-friendly-pub-heathrow/page.tsx` |
| `/m25-junction-14-pub` | `app/m25-junction-14-pub/page.tsx` |

### Nearby Hotel SEO
| URL | File |
|-----|------|
| `/pub-near-ibis-heathrow` | `app/pub-near-ibis-heathrow/page.tsx` |
| `/pub-near-novotel-heathrow` | `app/pub-near-novotel-heathrow/page.tsx` |
| `/pub-near-travelodge-heathrow` | `app/pub-near-travelodge-heathrow/page.tsx` |
| `/pub-near-hilton-heathrow` | `app/pub-near-hilton-heathrow/page.tsx` |
| `/pub-near-marriott-heathrow` | `app/pub-near-marriott-heathrow/page.tsx` |
| `/pub-near-crowne-plaza-heathrow` | `app/pub-near-crowne-plaza-heathrow/page.tsx` |
| `/pub-near-radisson-blu-heathrow` | `app/pub-near-radisson-blu-heathrow/page.tsx` |
| `/pub-near-premier-inn-heathrow` | `app/pub-near-premier-inn-heathrow/page.tsx` |
| `/pub-near-sofitel-heathrow` | `app/pub-near-sofitel-heathrow/page.tsx` |
| `/pub-near-renaissance-heathrow` | `app/pub-near-renaissance-heathrow/page.tsx` |
| `/pub-near-holiday-inn-heathrow` | `app/pub-near-holiday-inn-heathrow/page.tsx` |

### Nearby Town SEO
| URL | File |
|-----|------|
| `/stanwell-pub` | `app/stanwell-pub/page.tsx` |
| `/pubs-in-stanwell` | `app/pubs-in-stanwell/page.tsx` |
| `/staines-pub` | `app/staines-pub/page.tsx` |
| `/windsor-pub` | `app/windsor-pub/page.tsx` |
| `/wraysbury-pub` | `app/wraysbury-pub/page.tsx` |
| `/egham-pub` | `app/egham-pub/page.tsx` |
| `/ashford-pub` | `app/ashford-pub/page.tsx` |
| `/sunbury-pub` | `app/sunbury-pub/page.tsx` |
| `/feltham-pub` | `app/feltham-pub/page.tsx` |
| `/bedfont-pub` | `app/bedfont-pub/page.tsx` |
| `/colnbrook-pub` | `app/colnbrook-pub/page.tsx` |
| `/longford-pub` | `app/longford-pub/page.tsx` |
| `/horton-pub` | `app/horton-pub/page.tsx` |

### Venue Features
| URL | File |
|-----|------|
| `/beer-garden` | `app/beer-garden/page.tsx` |

### Blog
| URL | File |
|-----|------|
| `/blog` | `app/blog/page.tsx` |
| `/blog/[slug]` | `app/blog/[slug]/page.tsx` |
| `/blog/tags` | `app/blog/tags/page.tsx` |
| `/blog/tag/[tag]` | `app/blog/tag/[tag]/page.tsx` |

---

## API Routes (40 total)

All API routes are server-side only. `ANCHOR_API_KEY` is never exposed to the browser.

### Business Data (proxy to Management API)
| Path | Methods | Purpose |
|------|---------|---------|
| `/api/business/hours` | GET | Opening hours + special overrides |
| `/api/events` | GET | Upcoming events list |
| `/api/events/[id]` | GET | Single event detail |
| `/api/events/[id]/availability` | POST | Event booking availability |
| `/api/event-categories` | GET | Event category list |
| `/api/calendar/upcoming` | GET | Calendar events feed |
| `/api/calendar/event/[id]` | GET | Single calendar event |
| `/api/managers-special` | GET | Manager's special drink |
| `/api/managers-special-image` | GET | Manager's special image |
| `/api/reviews` | GET | Customer reviews |
| `/api/reviews/status` | GET | Reviews feature status |

### Table Bookings
| Path | Methods | Purpose |
|------|---------|---------|

[truncated at line 200 — original has 243 lines]
```

### `docs/architecture/server-actions.md`

```
---
generated: true
last_updated: 2026-04-21T00:00:00Z
source: session-setup
project: the-anchor-pub
---

# Server Actions

> Auto-generated by session-setup. Manual edits will be overwritten on next refresh.

## Summary

This project has **no `'use server'` server actions**. There is no Supabase database and no direct mutation layer in this repo.

All mutations are performed via **API route handlers** (`app/api/**/route.ts`) which proxy requests to the Management API at `management.orangejelly.co.uk` using `ANCHOR_API_KEY`.

## Mutation Pattern

```
Client Component
      │  fetch('/api/table-bookings', { method: 'POST', body })
      ▼
app/api/table-bookings/route.ts   ← server-side, holds ANCHOR_API_KEY
      │  fetch('https://management.orangejelly.co.uk/api/...', { headers: { 'X-API-Key': API_KEY } })
      ▼
Management API (OJ-AnchorManagementTools)
```

## Key Mutation Routes

| Route | Method | What it does |
|-------|--------|-------------|
| `/api/table-bookings` | POST | Create table booking |
| `/api/table-bookings/[reference]` | DELETE | Cancel booking |
| `/api/table-bookings/paypal/create-order` | POST | Create PayPal deposit order |
| `/api/table-bookings/paypal/capture-order` | POST | Capture PayPal payment |
| `/api/parking/bookings` | POST | Create parking booking |
| `/api/parking/payment/create-order` | POST | Create parking PayPal order |
| `/api/parking/payment/capture` | POST | Capture parking payment |
| `/api/event-bookings` | POST | Create event booking |
| `/api/event-waitlist` | POST | Join event waitlist |
| `/api/public/private-booking` | POST | Submit private hire enquiry |
| `/api/enquiry/christmas` | POST | Submit Christmas party enquiry |
| `/api/enquiry/open-mic` | POST | Submit open mic interest |
| `/api/booking/submit` | POST | Generic booking submission |
```

### `docs/extract-docx-v2.mjs`

```
import JSZip from 'jszip';
import fs from 'fs';

const docxBuffer = fs.readFileSync('docs/SSOT-Review-The-Anchor.docx');
const zip = await JSZip.loadAsync(docxBuffer);
const xml = await zip.file('word/document.xml').async('string');

// Parse all text runs within table cells properly
// We need to track: tables > rows > cells > paragraphs > runs
function extractTables(xml) {
  const tables = [];

  // Split by table boundaries
  const tableMatches = xml.match(/<w:tbl\b[^>]*>[\s\S]*?<\/w:tbl>/g) || [];

  for (const tableXml of tableMatches) {
    const table = [];
    const rowMatches = tableXml.match(/<w:tr\b[^>]*>[\s\S]*?<\/w:tr>/g) || [];

    for (const rowXml of rowMatches) {
      const row = [];
      const cellMatches = rowXml.match(/<w:tc\b[^>]*>[\s\S]*?<\/w:tc>/g) || [];

      for (const cellXml of cellMatches) {
        // Extract ALL text from within this cell, joining paragraph text
        const paragraphs = [];
        const paraMatches = cellXml.match(/<w:p\b[^>]*>[\s\S]*?<\/w:p>/g) || [];

        for (const paraXml of paraMatches) {
          const texts = [];
          const textMatches = paraXml.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];

          for (const textMatch of textMatches) {
            const content = textMatch.replace(/<w:t[^>]*>/, '').replace(/<\/w:t>/, '');
            texts.push(content);
          }
          if (texts.length > 0) {
            paragraphs.push(texts.join(''));
          }
        }
        row.push(paragraphs.join(' ').trim());
      }
      if (row.length > 0) {
        table.push(row);
      }
    }
    tables.push(table);
  }
  return tables;
}

// Also extract headings (non-table paragraphs)
function extractHeadings(xml) {
  const headings = [];
  // Find paragraphs with heading styles outside tables
  const stripped = xml.replace(/<w:tbl\b[^>]*>[\s\S]*?<\/w:tbl>/g, '___TABLE___');
  const paraMatches = stripped.match(/<w:p\b[^>]*>[\s\S]*?<\/w:p>/g) || [];

  for (const paraXml of paraMatches) {
    if (paraXml.includes('___TABLE___')) continue;
    const texts = [];
    const textMatches = paraXml.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
    for (const tm of textMatches) {
      texts.push(tm.replace(/<w:t[^>]*>/, '').replace(/<\/w:t>/, ''));
    }
    const fullText = texts.join('').trim();
    if (fullText.length > 0) {
      headings.push(fullText);
    }
  }
  return headings;
}

const tables = extractTables(xml);

console.log(`Found ${tables.length} tables\n`);

let commentCount = 0;
let sectionIndex = 0;

for (const table of tables) {
  if (table.length === 0) continue;
  sectionIndex++;

  // First row is header
  const header = table[0];
  const commentColIndex = header.findIndex(h =>
    h.toLowerCase().includes('comment') || h.toLowerCase().includes('your')
  );

  if (commentColIndex === -1) continue;

  let sectionPrinted = false;

  for (let r = 1; r < table.length; r++) {
    const row = table[r];
    if (row.length <= commentColIndex) continue;

    const comment = row[commentColIndex]?.trim();
    if (comment && comment.length > 0) {
      if (!sectionPrinted) {
        console.log(`\n--- Table ${sectionIndex} (header: ${header.slice(0, 2).join(' | ')}) ---`);
        sectionPrinted = true;
      }
      commentCount++;
      const item = row[0]?.trim() || '(no item)';
      const value = row.length > 1 ? row[1]?.trim() : '';
      console.log(`  ITEM: ${item}`);
      if (value) console.log(`  VALUE: ${value}`);
      console.log(`  COMMENT: ${comment}`);
      console.log('');
    }
  }
}

if (commentCount === 0) {
  console.log('\n=== NO COMMENTS FOUND IN ANY TABLE CELLS ===');
  console.log('\nDumping all non-empty cells from all tables for debugging:\n');

  for (let t = 0; t < tables.length; t++) {
    const table = tables[t];
    for (let r = 0; r < table.length; r++) {
      const row = table[r];
      const nonEmpty = row.filter(c => c.trim().length > 0);
      if (nonEmpty.length > 0) {
        console.log(`Table ${t+1}, Row ${r+1}: [${row.map(c => c.substring(0, 60)).join(' | ')}]`);
      }
    }
  }
} else {
  console.log(`\n=== TOTAL: ${commentCount} comments found ===`);
}

// Also check for Word comments (stored in comments.xml)
const commentsFile = zip.file('word/comments.xml');
if (commentsFile) {
  console.log('\n=== WORD MARGIN COMMENTS FOUND ===\n');
  const commentsXml = await commentsFile.async('string');
  const commentMatches = commentsXml.match(/<w:comment\b[^>]*>[\s\S]*?<\/w:comment>/g) || [];
  for (const c of commentMatches) {
    const author = c.match(/w:author="([^"]*)"/)?.[1] || 'unknown';
    const texts = [];
    const tms = c.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
    for (const tm of tms) texts.push(tm.replace(/<w:t[^>]*>/, '').replace(/<\/w:t>/, ''));
    console.log(`[${author}]: ${texts.join('')}`);
  }
}
```

### `docs/extract-docx.mjs`

```
import JSZip from 'jszip';
import fs from 'fs';

const docxBuffer = fs.readFileSync('docs/SSOT-Review-The-Anchor.docx');
const zip = await JSZip.loadAsync(docxBuffer);
const xml = await zip.file('word/document.xml').async('string');

// Extract text from XML, preserving table structure
const rows = [];
let currentRow = [];
let currentCell = '';
let inRow = false;
let inCell = false;

// Simple XML parser for table content
const tagRegex = /<(\/?)w:(tr|tc|t|p|br)[^>]*>|<w:t[^>]*>([^<]*)<\/w:t>/g;
let match;

while ((match = tagRegex.exec(xml)) !== null) {
  const [full, closing, tag, text] = match;

  if (tag === 'tr' && !closing) { inRow = true; currentRow = []; }
  if (tag === 'tr' && closing) { inRow = false; if (currentRow.length > 0) rows.push(currentRow); }
  if (tag === 'tc' && !closing) { inCell = true; currentCell = ''; }
  if (tag === 'tc' && closing) { inCell = false; currentRow.push(currentCell.trim()); }
  if (tag === 'p' && closing && inCell) { currentCell += ' | '; }

  if (text !== undefined && text.length > 0) {
    if (inCell) {
      currentCell += text;
    } else {
      // Non-table text (headings, paragraphs)
      rows.push(['__TEXT__', text]);
    }
  }
}

// Output as structured text
let currentSection = '';
for (const row of rows) {
  if (row[0] === '__TEXT__') {
    const text = row[1].trim();
    if (text.length > 0) {
      console.log(`\n=== ${text} ===`);
      currentSection = text;
    }
    continue;
  }

  // Only show rows where the 3rd column (comments) has content
  if (row.length >= 3) {
    const item = (row[0] || '').trim().replace(/ \| $/g, '');
    const value = (row[1] || '').trim().replace(/ \| $/g, '');
    const comment = (row[2] || '').trim().replace(/ \| $/g, '');

    if (comment && comment !== '' && item !== 'Item' && item !== '#' && item !== 'Prohibited Item' && item !== 'Issue') {
      console.log(`[${item}] ${value} → COMMENT: ${comment}`);
    }
  }
}

// Also dump ALL rows with comments for completeness
console.log('\n\n========== FULL TABLE DUMP (rows with comments only) ==========\n');
for (const row of rows) {
  if (row[0] === '__TEXT__') continue;
  if (row.length >= 3) {
    const comment = (row[2] || '').trim().replace(/ \| $/g, '');
    if (comment && comment !== '' && !['Your Comments', 'Item', '#', 'Prohibited Item', 'Issue'].includes((row[0]||'').trim().replace(/ \| $/g, ''))) {
      console.log(`ITEM: ${(row[0]||'').trim().replace(/ \| $/g, '')}`);
      console.log(`VALUE: ${(row[1]||'').trim().replace(/ \| $/g, '')}`);
      console.log(`COMMENT: ${comment}`);
      console.log('---');
    }
  }
}
```

### `docs/generate-ssot-docx.mjs`

```
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType, HeadingLevel, BorderStyle, ShadingType, PageBreak } from 'docx';
import fs from 'fs';

const ssot = JSON.parse(fs.readFileSync('SSOT.json', 'utf8'));

const GREY = { type: ShadingType.SOLID, color: "DDDDDD" };
const WHITE = { type: ShadingType.SOLID, color: "FFFFFF" };
const LIGHT_RED = { type: ShadingType.SOLID, color: "FFE0E0" };
const LIGHT_GREEN = { type: ShadingType.SOLID, color: "E0FFE0" };

function makeHeaderCell(text) {
  return new TableCell({
    shading: GREY,
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 20 })] })],
  });
}

function makeCell(text, shading = WHITE) {
  return new TableCell({
    shading,
    children: [new Paragraph({ children: [new TextRun({ text: String(text || ''), size: 20 })] })],
  });
}

function makeTable(headers, rows) {
  const headerRow = new TableRow({
    children: headers.map(h => makeHeaderCell(h)),
    tableHeader: true,
  });
  const dataRows = rows.map(cells => new TableRow({
    children: cells.map((c, i) => {
      const shading = typeof c === 'object' && c.shading ? c.shading : WHITE;
      const text = typeof c === 'object' && c.text !== undefined ? c.text : String(c || '');
      return makeCell(text, shading);
    }),
  }));
  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({ heading: level, children: [new TextRun({ text })] });
}

function para(text) {
  return new Paragraph({ children: [new TextRun({ text, size: 20 })] });
}

function flattenObject(obj, prefix = '') {
  const rows = [];
  for (const [key, val] of Object.entries(obj)) {
    const label = prefix ? `${prefix}: ${key}` : key;
    if (val === null || val === undefined) {
      rows.push([label, '(null)', '']);
    } else if (typeof val === 'object' && !Array.isArray(val)) {
      rows.push(...flattenObject(val, label));
    } else if (Array.isArray(val)) {
      if (val.length > 0 && typeof val[0] === 'object') {
        val.forEach((item, i) => {
          rows.push(...flattenObject(item, `${label} [${i + 1}]`));
        });
      } else {
        rows.push([label, val.join(', '), '']);
      }
    } else {
      rows.push([label, String(val), '']);
    }
  }
  return rows;
}

// Build document sections
const children = [];

// Title page
children.push(new Paragraph({ spacing: { before: 4000 } }));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: 'The Anchor', bold: true, size: 56, color: '005131' })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: 'Single Source of Truth', size: 40, color: '005131' })],
}));
children.push(new Paragraph({ spacing: { before: 400 } }));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: 'Brand Review Document — 2026-03-22', size: 24, italic: true })],
}));
children.push(new Paragraph({ spacing: { before: 600 } }));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: 'HOW TO REVIEW:', bold: true, size: 22 })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: 'Add your comments, corrections, or approvals in the "Your Comments" column.', size: 20 })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: 'If a value is correct, write "OK". If it needs changing, write the correct value.', size: 20 })],
}));

// Sections to render
const sections = [
  { key: 'identity', title: 'Brand Identity' },
  { key: 'contact', title: 'Contact Details' },
  { key: 'location', title: 'Location & Address' },
  { key: 'heathrow_proximity', title: 'Heathrow Proximity' },
  { key: 'digital', title: 'Digital Presence' },
  { key: 'brand_guidelines', title: 'Brand Guidelines' },
  { key: 'venue', title: 'Venue Details' },
  { key: 'beer_garden', title: 'Beer Garden' },
  { key: 'food', title: 'Food & Menu' },
  { key: 'sunday_roast', title: 'Sunday Roast' },
  { key: 'drinks', title: 'Drinks' },
  { key: 'offers', title: 'Current Offers' },
  { key: 'discontinued_offers', title: 'Discontinued Offers (TO REMOVE)' },
  { key: 'events', title: 'Events & Entertainment' },
  { key: 'private_hire', title: 'Private Hire' },
  { key: 'heathrow_parking', title: 'Heathrow Parking' },
  { key: 'sustainability', title: 'Sustainability' },
  { key: 'food_hygiene', title: 'Food Hygiene' },
  { key: 'ratings', title: 'Ratings & Reviews' },
  { key: 'target_audiences', title: 'Target Audiences' },
  { key: 'psychographic_segments', title: 'Psychographic Segments' },
  { key: 'competitive_landscape', title: 'Competitive Landscape' },
  { key: 'community_context', title: 'Community Context' },
  { key: 'seo_keywords', title: 'SEO Keywords' },
  { key: 'areas_served', title: 'Areas Served' },
  { key: 'nearby_hotels', title: 'Nearby Hotels' },
];

for (const section of sections) {
  const data = ssot[section.key];
  if (!data) continue;

  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(heading(section.title));
  children.push(para(''));

  if (Array.isArray(data)) {
    if (typeof data[0] === 'string') {
      const rows = data.map((item, i) => [`${i + 1}`, item, '']);
      children.push(makeTable(['#', 'Value', 'Your Comments'], rows));
    } else {
      const rows = [];
      data.forEach((item, i) => {
        rows.push(...flattenObject(item, `[${i + 1}]`));
      });
      children.push(makeTable(['Item', 'Current Value', 'Your Comments'], rows));
    }
  } else if (typeof data === 'object') {
    const rows = flattenObject(data);
    children.push(makeTable(['Item', 'Current Value', 'Your Comments'], rows));
  }
}

// Do Not Use section
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(heading('DO NOT USE — Prohibited Claims', HeadingLevel.HEADING_1));
children.push(para('These items must NOT appear in any new copy, page, or marketing material.'));
children.push(para(''));
if (ssot.do_not_use) {
  const rows = Object.entries(ssot.do_not_use).map(([item, reason]) => [
    item.replace(/_/g, ' '),
    String(reason),
    '',
  ]);
  children.push(makeTable(['Prohibited Item', 'Reason', 'Your Comments'], rows));
}

// Resolved Inconsistencies
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(heading('Resolved Inconsistencies', HeadingLevel.HEADING_1));
children.push(para('These were identified during the audit and resolved on 2026-03-22. Review the resolutions below.'));
children.push(para(''));
if (ssot.resolved_inconsistencies) {
  const rows = ssot.resolved_inconsistencies.map(item => [
    item.issue,
    item.resolution,
    '',
  ]);
  children.push(makeTable(['Issue', 'Resolution', 'Your Comments'], rows));
}

// Generate
const doc = new Document({
  creator: 'The Anchor SSOT Generator',
  title: 'The Anchor — Single Source of Truth Review',
  description: 'Line-by-line brand review document',
  sections: [{ children }],
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync('docs/SSOT-Review-The-Anchor.docx', buffer);
console.log('Generated: docs/SSOT-Review-The-Anchor.docx');
console.log('Size:', (buffer.length / 1024).toFixed(1), 'KB');
```

### `docs/gsc-coverage-fix-spec.md`

```
# GSC Coverage Issues Fix Spec

**Date:** 2026-04-12
**Source:** 6 Google Search Console Coverage Drilldown exports (all known pages)
**Scope:** the-anchor.pub — code changes only (no content rewrites)

---

## Executive Summary

GSC reports 6 issue categories across ~483 URLs. After cross-referencing with the codebase and adversarial review by 5 Codex specialist agents, most are expected behaviour (legacy Wix redirects, correct canonical handling, deliberate noindex). **1 critical rendering issue**, **2 high-priority fixes**, and **several items requiring manual review** need attention.

---

## Issue 1 — CRITICAL: CSS Files Blocked by robots.txt

**GSC Category:** Blocked by robots.txt (133 URLs)
**Impact:** Google cannot render pages properly — may degrade indexing quality, mobile-friendliness scores, and rich result eligibility.

### Root Cause

`app/robots.ts` includes the rule:

```
Disallow: /*?dpl=*
```

Vercel injects `?dpl=dpl_XXXXX` deployment parameters onto `/_next/static/css/*.css` URLs in page source. Google discovers these parameterised CSS URLs and robots.txt blocks them. This means **Googlebot cannot fetch CSS to render any page**.

~99 of the 133 blocked URLs are CSS files with `?dpl=` suffixes.

### Fix

Update `app/robots.ts` to allow static assets even with `?dpl=` parameters. The `allow` field must be changed from a single string to an array:

```typescript
// Change allow from string to array:
allow: ['/', '/_next/static/'],

// Keep existing disallow array unchanged:
disallow: [
  '/api/',
  '/_next/data/',
  '/_next/static/media/',
  '/*?dpl=*',
  // ... rest unchanged
]
```

**Why this works:** Google resolves robots.txt conflicts by **path specificity** (longest matching path wins), not by line order. `Allow: /_next/static/` is more specific than `Disallow: /*?dpl=*` for CSS URLs like `/_next/static/css/abc.css?dpl=...`, so the allow rule wins. The `/_next/static/media/` disallow is even more specific and continues to block media assets as intended.

**Note:** `MetadataRoute.Robots` in Next.js serialises all Allow lines first, then all Disallow lines. This is cosmetic — Google uses specificity, not position.

### Verification
- Deploy, then verify live `/robots.txt` output includes `Allow: /_next/static/`
- Use GSC's **robots.txt report** "Request a recrawl" action (not URL Inspection re-indexing — that is for page URLs, not robots.txt refresh)
- After recrawl, use URL Inspection "Test Live URL" on homepage — check "Page resources" tab
- Monitor GSC "Blocked by robots.txt" count over 2-4 weeks (expect drop from ~133 to ~12)

---

## Issue 2 — HIGH: Test/Debug Pages in Production

**GSC Category:** Blocked by robots.txt (10 URLs)
**Impact:** Crawl budget waste, unprofessional if discovered, potential information leakage.

### Current State

10 test/debug page directories exist in production (20 files total — each contains `page.tsx` + `head.tsx`). They are blocked only by robots.txt:

| Directory | Files |
|-----------|-------|
| `app/test-simple/` | page.tsx, head.tsx |
| `app/test-tracking/` | page.tsx, head.tsx |
| `app/test-reviews/` | page.tsx, head.tsx |
| `app/test-gtm/` | page.tsx, head.tsx |
| `app/test-navigation-tracking/` | page.tsx, head.tsx |
| `app/test-hours/` | page.tsx, head.tsx |
| `app/gtm-debug/` | page.tsx, head.tsx |
| `app/debug-hours/` | page.tsx, head.tsx |
| `app/demo-header/` | page.tsx, head.tsx |
| `app/components/` | page.tsx, head.tsx |

No production code imports these routes (confirmed by Codex codebase search). However, two files reference them:
- `app/sitemap-page/page.tsx` — links to test pages (must update)
- `scripts/audit-hero.js` — references test pages (must update)

### Fix

Delete all 10 directories (20 files). In the same changeset:
1. Update `app/sitemap-page/page.tsx` to remove links to deleted pages
2. Update `scripts/audit-hero.js` to remove references to deleted pages
3. Optionally remove the 10 corresponding disallow entries in `app/robots.ts` (cosmetic cleanup)

### Verification
- `npm run build` succeeds after deletion
- Visit each URL on production — should return 404
- `app/sitemap-page/` renders without broken links

---

## ~~Issue 3 — REMOVED after adversarial review~~

> **Original proposal:** Add `*/opengraph-image` to robots.txt disallow to save crawl budget.
>
> **Why removed:** Codex adversarial review confirmed that Twitter/X (`Twitterbot`), Facebook (`FacebookExternalHit`), and LinkedIn crawlers **all respect robots.txt**. Blocking opengraph-image routes would break social media preview images for all event pages. The existing `X-Robots-Tag: noindex, nofollow, noimageindex` header on the OG route is the correct approach and is already working. The original claim that social crawlers "typically ignore robots.txt" was false.
>
> Additionally, `*/opengraph-image` is syntactically invalid — robots.txt paths must start with `/`.

---

## ~~Issue 4 — REMOVED after adversarial review~~

> **Original proposal:** Fix broken image path `/images/page-headers/drinks/optimized/drinks-1920w`.
>
> **Why removed:** Codex codebase-wide search confirmed `drinks-1920w` does not exist anywhere in the codebase. The `/public/images/page-headers/drinks/optimized/` directory doesn't exist either. This is an external or legacy Wix reference that cannot be fixed with a code change. It will naturally drop from GSC as Google stops re-crawling it.

---

## Issue 5 — HIGH: Cloudflare Email Protection 404

**GSC Category:** Not found (404)
**URL:** `/cdn-cgi/l/email-protection`
**Last crawled:** 2025-10-19

### Fix

Add robots.txt disallow for Cloudflare internal paths:

```typescript
// In app/robots.ts:
{ disallow: '/cdn-cgi/' },
```

### Verification
- Check robots.txt includes the rule

---

## Issue 6 — MEDIUM: Booking Wizard State Leaking as URLs

**GSC Category:** Alternative page with proper canonical tag (7 URLs)
**Impact:** Minor crawl budget waste. Canonical tags are working correctly (Google respects them), but wizard state parameters create unnecessary URL variants.

### URLs Affected

- `/book-table?purpose=drinks`
- `/book-table?purpose=food`
- `/book-table?purpose=sunday_lunch`
- `/book-table?tab=sunday`
- `/book-table?step=1&type=regular`
- `/book-table?date=2026-03-15&purpose=food&sunday_lunch=true&mothers_day=true`

### Current State

Canonical tag is correctly set to `/book-table` (confirmed in codebase). Google respects this. The parameters are used for prefilling form state and are legitimately useful for social media campaign links.

### Fix — Do Not Implement

> **Original proposal:** Add `Disallow: /book-table?*` to robots.txt.
>
> **Why rejected (adversarial review):** GSC already reports these as "Alternative page with proper canonical tag" — meaning canonical resolution is working correctly. Adding a robots.txt block would **prevent Google from recrawling the variants**, meaning it can no longer verify the canonical. Google explicitly warns against using robots.txt for canonicalisation.
>
> The deeper issue is that the site itself generates parameterised URLs from campaign pages (`app/halloween/page.tsx`, `app/sunday-lunch/page.tsx`, `app/fathers-day/page.tsx`) and the booking wizard. The correct long-term fix is normalising these internal links, not blocking the symptom.
>
> **Note:** `?purpose=sunday_lunch` is not even a valid parameter — `parsePurpose()` only accepts `food` or `drinks`.

---

## Issue 7 — MEDIUM: Future Event URLs Returning 404

**GSC Category:** Not found (404) — 6 URLs
**URLs:** `/events/bingo-2026-07-29`, `/events/bingo-2026-11-18`, `/events/bingo-2026-05-20`, etc.

### Root Cause

These event URLs were previously in the sitemap (before commit `eaa92a7` excluded stale/cancelled events). The events either don't exist yet in the management API or were removed. Google remembers the URLs and keeps re-crawling.

### Fix

No code change needed — the sitemap fix is already deployed. These will naturally drop from GSC as Google re-crawls and consistently gets 404s.

**Optional acceleration:** Return 410 (Gone) instead of 404 for event URLs where the event ID doesn't match any known event. This tells Google to remove the URL faster.

In `app/events/[id]/page.tsx`, when the API returns no event for a slug that looks like a valid event ID pattern (e.g., matches `slug-YYYY-MM-DD`):

```typescript
// Instead of notFound() which returns 404:
// Return 410 Gone for events that look like valid slugs but don't exist
```

This requires a custom 410 response, which Next.js doesn't natively support via `notFound()`. Could be handled via `redirect()` to a 410 API route or by returning a Response object.

### Verification
- Monitor 404 count in GSC — should decline over 4-8 weeks

---

## Issue 8 — MEDIUM: Blog Tag Pages — Thin Content Risk


[truncated at line 200 — original has 325 lines]
```

### `docs/qa-reviews/2026-04-04-seo-revenue-bug-hunter-report.md`

```
- `BUG-001` `[High]` Scheduled posts are only gated by `publishDate`; every public date still comes from `date`. The new filter in [lib/markdown.ts:80](\/Users\/peterpitcher\/Cursor\/OJ-The-Anchor.pub\/lib\/markdown.ts#L80) lets a post appear on its scheduled day, but ordering still uses [lib/markdown.ts:86](\/Users\/peterpitcher\/Cursor\/OJ-The-Anchor.pub\/lib\/markdown.ts#L86), list UIs still render [app/blog/page.tsx:286](\/Users\/peterpitcher\/Cursor\/OJ-The-Anchor.pub\/app\/blog\/page.tsx#L286) and [app/blog/tag/[tag]/page.tsx:154](\/Users\/peterpitcher\/Cursor\/OJ-The-Anchor.pub\/app\/blog\/tag\/[tag]\/page.tsx#L154), and article metadata/schema still use [app/blog/[slug]/page.tsx:117](\/Users\/peterpitcher\/Cursor\/OJ-The-Anchor.pub\/app\/blog\/[slug]\/page.tsx#L117), [app/blog/[slug]/page.tsx:175](\/Users\/peterpitcher\/Cursor\/OJ-The-Anchor.pub\/app\/blog\/[slug]\/page.tsx#L175), and [app/blog/[slug]/page.tsx:297](\/Users\/peterpitcher\/Cursor\/OJ-The-Anchor.pub\/app\/blog\/[slug]\/page.tsx#L297). With the branch’s scheduled posts carrying `date: "2026-04-04"` and later `publishDate`s, they will go live on the right day but look like April 4 posts to users and crawlers.

- `BUG-002` `[Medium]` The new `publishDate` checks are timezone-dependent because they parse date-only strings as UTC midnight. Both [lib/markdown.ts:80](\/Users\/peterpitcher\/Cursor\/OJ-The-Anchor.pub\/lib\/markdown.ts#L80) and [app/blog/[slug]/page.tsx:138](\/Users\/peterpitcher\/Cursor\/OJ-The-Anchor.pub\/app\/blog\/[slug]\/page.tsx#L138) do `new Date('YYYY-MM-DD')`. For example, `publishDate: "2026-04-11"` becomes `2026-04-11T00:00:00.000Z`, which is 01:00 BST on April 11, 2026, so UK posts publish an hour late through summer and behavior varies by server timezone.

- `BUG-003` `[High]` The new 1-hour ISR on the post page can keep a scheduled post 404ing after it should be live. [app/blog/[slug]/page.tsx:14](\/Users\/peterpitcher\/Cursor\/OJ-The-Anchor.pub\/app\/blog\/[slug]\/page.tsx#L14) adds `revalidate = 3600`, and [app/blog/[slug]/page.tsx:138](\/Users\/peterpitcher\/Cursor\/OJ-The-Anchor.pub\/app\/blog\/[slug]\/page.tsx#L138) returns `notFound()` for future posts. By ISR semantics, a request that hits the slug before publish time can cache that 404 until the next revalidation window, so a post can stay unavailable for up to an extra hour after go-live. This one is an inference from Next’s cached-route revalidation behavior and `notFound()` semantics: https://nextjs.org/docs/app/guides/incremental-static-regeneration and https://nextjs.org/docs/app/api-reference/functions/not-found

- `BUG-004` `[Medium]` The new H1 fixes actually add duplicate H1s. `HeroWrapper` already renders the hero title as an `<h1>` in [components/hero/HeroSectionServer.tsx:141](\/Users\/peterpitcher\/Cursor\/OJ-The-Anchor.pub\/components\/hero\/HeroSectionServer.tsx#L141), so the new [app/sunday-lunch/page.tsx:459](\/Users\/peterpitcher\/Cursor\/OJ-The-Anchor.pub\/app\/sunday-lunch\/page.tsx#L459) and [app/heathrow-family-dining/page.tsx:127](\/Users\/peterpitcher\/Cursor\/OJ-The-Anchor.pub\/app\/heathrow-family-dining\/page.tsx#L127) `PageTitle as="h1"` additions create two page-level H1s. The repo’s `audit:hero` script flags both pages.

`npm run build` completed successfully, so I did not find a compile-time import/type error in these files. I also didn’t find a structural JSON-LD syntax issue in [app/heathrow-family-dining/page.tsx](\/Users\/peterpitcher\/Cursor\/OJ-The-Anchor.pub\/app\/heathrow-family-dining\/page.tsx); the main regressions are in publish-date behavior and heading structure.```

### `docs/qa-reviews/2026-04-04-seo-revenue-security-auditor-report.md`

```
**Findings**
- `SEC-001 [Low]` Malformed `publishDate` values can bypass the unpublished-post guard and expose a scheduled post by direct slug. In [lib/markdown.ts:80](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/markdown.ts:80), an invalid date is treated as unpublished because `Invalid Date <= now` is `false`, so it drops out of listings. In [app/blog/[slug]/page.tsx:138](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/blog/[slug]/page.tsx:138), the same invalid date passes the direct-route check because `Invalid Date > now` is also `false`. Result: a typoed `publishDate` can hide a post from indexes/sitemaps while still serving it at `/blog/<slug>` if the slug is guessed. Treat invalid dates as unpublished or fail content load/build, and reuse one shared predicate.

**Notes**
- I did not find an exploitable XSS issue in [app/heathrow-family-dining/page.tsx:47](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/heathrow-family-dining/page.tsx:47). The new JSON-LD is hardcoded and uses `jsonLdSafeStringify`, which escapes `<` and prevents `</script>` breakout.
- I verified a future-dated post returned `404` and did not leak the unpublished title/description in the rendered response, so the new guard in [app/blog/[slug]/page.tsx:130](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/blog/[slug]/page.tsx:130) is effective for well-formed dates.
- No security findings in the new content sections in [app/book-table/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/book-table/page.tsx).```

### `docs/seo-audit-2026-04-04.md`

```
# SEO Audit Report — The Anchor Pub Website
**Date:** 4 April 2026
**Period analysed:** 23 Mar – 2 Apr 2026 (vs 9–19 Mar 2026)
**Data source:** Google Search Console export

---

## Executive Summary

The site has a **strong technical SEO foundation (9.2/10)** — comprehensive structured data, dynamic sitemap, intelligent redirects, and proper canonicals. Traffic is growing (+98% clicks, +3.4 position improvement) but this growth is driven almost entirely by **plane spotting content**, not the three revenue priorities.

### The problem at a glance

| Priority | Key Pages | Clicks (11 days) | Avg Position | Verdict |
|----------|-----------|-------------------|--------------|---------|
| 1. Food bookings | /food-menu, /sunday-lunch, /book-table | 24 | 5.2–10.8 | Visible but low CTR; booking page invisible |
| 2. Private hire | /private-hire, /function-room-hire, /private-hire/wakes | 3 | 14–22 | Buried; massive untapped demand |
| 3. Hosted events | /whats-on, /quiz-night, /music-bingo | 7 | 3.4–13.3 | Good positions but zero clicks on most |

### Top 5 opportunities (by estimated impact)

1. **Fix H1 tags across 10+ pages** — Many pages use creative copy ("She Said Yes!") instead of keyword-rich H1s. Quick fix, high impact.
2. **Create dedicated "Sunday Roast Near Heathrow" content** — 200+ monthly impressions for roast queries, currently position 8–22. Page exists but targets wrong keywords.
3. **Private hire pages are too thin** — Wakes, christenings, baby showers, gender reveal all ~1,200 words vs 3,000+ on corporate events. Expand content + add pricing.
4. **Missing BreadcrumbJsonLd on karaoke & open mic pages** — Lost navigation signals for crawlers.
5. **No AggregateRating schema on most pages** — 4.6/5 Google rating mentioned in copy but not in structured data on 80% of pages.

---

## GSC Performance Overview

### Sitewide Metrics

| Metric | Current (23 Mar–2 Apr) | Previous (9–19 Mar) | Change |
|--------|------------------------|----------------------|--------|
| Total clicks | 487 | 246 | **+98%** |
| Total impressions | 16,692 | 14,343 | +16% |
| Average CTR | 2.92% | 1.72% | +70% |
| Average position | 11.7 | 15.1 | +3.4 better |

### Device Split

| Device | Clicks | Impressions | CTR | Avg Position |
|--------|--------|-------------|-----|--------------|
| Mobile | 351 (72%) | 10,030 | 3.5% | 8.9 |
| Desktop | 126 (26%) | 6,437 | 2.0% | 15.6 |
| Tablet | 10 (2%) | 225 | 4.4% | 6.5 |

**Insight:** Mobile dominates. Desktop CTR is notably lower (2.0% vs 3.5%) and positions are worse (15.6 vs 8.9). Desktop SERP snippets may need improvement.

### Geography

| Country | Clicks | Impressions | CTR |
|---------|--------|-------------|-----|
| United Kingdom | 408 (84%) | 13,048 | 3.13% |
| United States | 25 (5%) | 1,637 | 1.53% |
| Germany | 8 | 135 | 5.93% |
| Rest of world | 46 | 1,872 | 2.46% |

**Insight:** UK is primary market (as expected for a local pub). US traffic likely from "heathrow layover" queries — opportunity to capture more international traveller intent.

---

## Top Performing Pages

| Page | Clicks | Impressions | CTR | Position |
|------|--------|-------------|-----|----------|
| / (homepage) | 122 | 2,722 | 4.5% | 11.7 |
| /blog/heathrow-plane-spotting-locations | 69 | 2,768 | 2.5% | 4.7 |
| /beer-garden | 54 | 1,190 | 4.5% | 7.4 |
| /plane-spotting-heathrow | 48 | 836 | 5.7% | 5.7 |
| /blog/plane-spotting-heathrow-guide | 29 | 1,268 | 2.3% | 3.4 |
| /food-menu | 21 | 724 | 2.9% | 5.2 |
| /blog/heathrow-layover-guide | 17 | 977 | 1.7% | 8.6 |

**Insight:** 4 of top 7 pages are plane spotting content. Food menu is the only revenue page in the top 7. Private hire and events pages are nowhere near the top.

---

## PRIORITY 1: Food Bookings

### Current State

| Page | Clicks | Impressions | CTR | Position |
|------|--------|-------------|-----|----------|
| /food-menu | 21 | 724 | 2.9% | 5.2 |
| /blog/fish-chips-guide | 7 | 415 | 1.7% | 6.4 |
| /blog/best-sunday-roast-near-heathrow | 5 | 151 | 3.3% | 7.1 |
| /sunday-lunch | 3 | 170 | 1.8% | 8.7 |
| /fish-and-chips-heathrow | 0 | 19 | 0% | 4.7 |
| /book-table | 0 | 33 | 0% | 10.8 |
| /burger-menu | 1 | 32 | 3.1% | 20.8 |
| /heathrow-layover-dining | 2 | 49 | 4.1% | 6.5 |
| /heathrow-family-dining | 0 | 37 | 0% | 11.6 |

### High-Value Queries Not Converting

These queries have high impressions but ZERO clicks — massive opportunity:

| Query | Impressions | Position | Target Page |
|-------|-------------|----------|-------------|
| sunday roasts heathrow airport | 54 | 22.4 | /sunday-lunch |
| sunday roasts heathrow | 49 | 22.9 | /sunday-lunch |
| best sunday roast in heathrow | 47 | 16.3 | /sunday-lunch |
| british pub food menu heathrow | 46 | 27.0 | /food-menu |
| pub food heathrow | 40 | 30.0 | /food-menu |
| restaurants near heathrow | 40 | 19.5 | /restaurants-near-heathrow |
| restaurants near heathrow airport | 40 | 23.5 | /restaurants-near-heathrow |
| restaurant near heathrow | 33 | 18.7 | /restaurants-near-heathrow |
| vegetarian pub food | 72 | 43.5 | /food-menu/vegetarian |
| fish and chips heathrow | 14 | 7.3 | /fish-and-chips-heathrow |
| roast dinner near me | 11 | 21.1 | /sunday-lunch |
| family friendly restaurants heathrow | 5 | 19.2 | /heathrow-family-dining |

### Issues Found

#### 1. Sunday Lunch page — wrong keyword targeting
- **Title:** "Sunday Roast Near Heathrow from £19.99 | Book by Sat 1pm" — good but doesn't target "sunday roast heathrow" explicitly
- **H1:** "Sunday Lunch at The Anchor" — uses "lunch" not "roast" (GSC shows "roast" has 3x more search volume)
- **Position 8.7** but should be top 3 for these queries
- **Fix:** Change H1 to include "Sunday Roast", add "sunday roast heathrow" to title, expand content around the roast experience

#### 2. Book Table page — invisible and thin
- **0 clicks, 0% CTR, position 10.8**
- Only ~800 words of content — mostly a booking form
- **Title:** "Book a Table at The Anchor | Near Heathrow | Free Parking" — fine but generic
- **Fix:** Add pre-booking content (menu previews, reviews, gallery), target "book pub table near Heathrow" and "restaurant reservation Heathrow"

#### 3. Food Menu page — low CTR despite decent position
- **Position 5.2 but only 2.9% CTR** — meta description isn't compelling enough
- **Fix:** Rewrite meta description to emphasise unique selling points more strongly. Add price anchors ("from £X.XX") and urgency cues.

#### 4. Fish & Chips page — position 4.7 but zero clicks (only 19 impressions)
- The page ranks well but isn't appearing for enough queries
- **Fix:** Target more long-tail queries: "best fish and chips near heathrow airport", "traditional fish and chips heathrow", "pub fish and chips near me"

#### 5. Burger menu — buried at position 20.8
- Only 32 impressions
- Content is thinnest of the menu pages (~1,000 words vs ~2,000 for pizza)
- **Fix:** Expand content, add sourcing story, target "gourmet burger heathrow", "pub burger near me"

#### 6. Family dining — zero clicks, position 11.6
- Only 37 impressions — the page isn't surfacing for family-intent queries
- **Schema is weakest of all food pages** — only breadcrumbs, no LocalBusiness, no ChildCare, no AggregateRating
- **Fix:** Add comprehensive schema, target "family restaurant near heathrow", "kids menu heathrow", expand content

#### 7. Vegetarian/vegan content gap
- "vegetarian pub food" has 72 impressions but position 43.5
- /food-menu/vegetarian and /food-menu/vegan exist but have zero clicks and minimal impressions
- **Fix:** Expand these pages significantly, create a blog post "vegetarian dining near Heathrow", target "vegan pub food heathrow"

### Food Bookings — Action Plan

| # | Action | Impact | Effort | Priority |
|---|--------|--------|--------|----------|
| F1 | Rewrite /sunday-lunch H1, title, and meta to target "sunday roast heathrow" | High | Low | Do first |
| F2 | Expand /book-table with menu previews, reviews, gallery (target 1,500+ words) | High | Medium | |
| F3 | Rewrite /food-menu meta description with price anchors and urgency | Medium | Low | |
| F4 | Expand /burger-menu content to match pizza page depth (~2,000 words) | Medium | Medium | |
| F5 | Add comprehensive schema to /heathrow-family-dining (LocalBusiness, ChildCare, AggregateRating) | Medium | Low | |
| F6 | Expand /fish-and-chips-heathrow with more long-tail keyword targeting | Medium | Medium | |
| F7 | Expand /food-menu/vegetarian and /food-menu/vegan pages significantly | Medium | Medium | |
| F8 | Create blog post: "Where to Eat Near Heathrow: A Local's Guide" targeting restaurant queries | High | High | |

---

## PRIORITY 2: Private Event Hire

### Current State

| Page | Clicks | Impressions | CTR | Position |
|------|--------|-------------|-----|----------|
| /private-hire/near/slough-crematorium | 4 | 37 | 10.8% | 9.9 |
| /staines-pub | 4 | 355 | 1.1% | 8.8 |
| /private-hire/wakes | 2 | 204 | 1.0% | 21.8 |
| /private-hire/gender-reveal | 1 | 17 | 5.9% | 7.2 |
| /private-hire | 0 | 38 | 0% | 14.1 |
| /function-room-hire | 1 | 84 | 1.2% | 22.1 |
| /private-party-venue | 1 | 64 | 1.6% | 15.3 |
| /corporate-events | 0 | 65 | 0% | 22.4 |
| /christmas-parties | 0 | 321 | 0% | 43.8 |
| /private-hire/weddings | 0 | 18 | 0% | 10.3 |
| /private-hire/milestone-birthdays | 0 | 11 | 0% | 7.9 |
| /private-hire/christenings | 1 | 10 | 10% | 21.4 |
| /private-hire/engagement-parties | 0 | 8 | 0% | 37.5 |
| /private-hire/retirement-parties | 0 | 3 | 0% | 19.3 |
| /private-hire/baby-showers | — | — | — | — |

### High-Value Queries Not Converting

| Query | Impressions | Position | Opportunity |
|-------|-------------|----------|-------------|
| pubs for wedding receptions in heathrow airport | 55 | 17.1 | /private-hire/weddings |
| pubs with private rooms in staines | 47 | 7.7 | /private-hire |
| wake venue | 40 | 14.7 | /private-hire/wakes |
| pubs with private rooms in heathrow airport | 39 | 27.7 | /private-hire |
| pubs for wedding receptions in heathrow | 23 | 11.8 | /private-hire/weddings |
| pubs for wedding receptions in staines | 22 | 4.0 | /private-hire/weddings |
| christmas party venues heathrow | 15 | 14.3 | /christmas-parties |
| christmas party pub staines | 17 | 6.1 | /christmas-parties |

[truncated at line 200 — original has 480 lines]
```

### `docs/seo-powerhouse/phase-1-strategy/competitor-landscape.md`

```
# Competitor Landscape — The Anchor, Stanwell Moor

**Date:** 21 April 2026 | **Author:** SEO Strategy Lead

---

## Geographic Context

The Anchor sits in Stanwell Moor (TW19), a village between Staines-upon-Thames and Heathrow Airport. The competitive radius is ~5 miles for food/drink, ~10 miles for private hire/functions. The near-Heathrow positioning is the primary differentiator — most direct competitors are hotel bars or chain pubs, not independent village pubs.

---

## Competitor Set

### Tier 1 — Direct Local Competitors (same audience, overlapping queries)

**The Swan, Staines-upon-Thames**
- Traditional pub, riverside location, ~3 miles
- Targets: Sunday roast, family dining, beer garden
- Likely dominates "pub in Staines" and "Sunday roast Staines"
- Weaknesses: no dedicated Heathrow positioning, no function room focus

**The Bells, Staines**
- Greene King managed house (The Anchor is Greene King tenanted — different model)
- Targets: generic local pub queries
- Stronger brand recognition in Staines town centre
- Weaknesses: chain feel, less differentiated

**The King's Head, Colnbrook**
- Village pub, ~2 miles from The Anchor, overlapping postcode catchment
- Targets "Colnbrook pub", "pub near M4/M25"
- Weaknesses: small digital footprint, minimal SEO investment

### Tier 2 — Functional Competitors (compete for specific intents)

**Heathrow Hotel Bars (Crowne Plaza, Sofitel, Renaissance, Marriott, Hilton)**
- Dominate "bar near Heathrow Terminal X" on brand queries
- Have massive domain authority (hotel chains)
- Weaknesses: no local pub feel, expensive, poor for private hire under 50 pax
- The Anchor has dedicated hotel-name pages (`/pub-near-crowne-plaza-heathrow` etc.) — this is the right counter-strategy

**The Wheatsheaf, Bedfont** (~2 miles)
- Competes for "pub near Heathrow", "family pub Feltham/Bedfont"
- Limited digital presence

**The Anchor, Hampton** / **The Anchor, Shepperton**
- Different pubs with same name — cannibalise branded queries
- "The anchor pub" at position 7.5 losing to these; "the anchor staines" and "the anchor heathrow" are winning variants

### Tier 3 — Aggregator Competition (often outranks direct sites)

**Yelp, TripAdvisor, Google Business Profile listings**
- Dominate "restaurants near Heathrow", "Sunday roast near Heathrow"
- The Anchor must rank for its own branded pages while these hold aggregator spots 1–3

**OpenTable / ResDiary**
- Capture booking intent; The Anchor's direct booking is a competitive advantage if the UX is better

---

## Competitive Advantage Matrix

| Factor | The Anchor | Hotel Bars | Chain Pubs | Other Village Pubs |
|--------|-----------|------------|------------|-------------------|
| Heathrow proximity | ✅ Closest traditional pub | ✅ On-site | ❌ | ❌ |
| Free parking | ✅ | ❌ usually paid | ❌ limited | ✅ |
| Beer garden | ✅ Under flight path (USP) | ❌ | varies | ✅ |
| Function room (~50 pax) | ✅ | ✅ large | ✅ chain | ❌ usually |
| Sunday roast | ✅ advance booking | ❌ | varies | ✅ |
| Independent feel | ✅ | ❌ | ❌ | ✅ |
| Domain Authority | ⚠️ Low (local pub) | 🔴 Very High | 🟡 Medium | 🔴 Very Low |
| SEO investment | 🟡 Growing | 🔴 Minimal (brand does it) | 🟡 Central team | 🔴 None |

**Key insight:** The Anchor cannot out-rank hotel chains on DA alone. It wins through hyper-local specificity, long-tail intent match, and content depth on niche topics (plane spotting already proves this model works).

---

## Where The Anchor Is Already Winning vs Competitors

- Plane spotting content (~430 clicks/28d): **no competitor has this**
- Hotel proximity pages (8 hotel-specific pages): **unique strategic asset**
- Wakes/funeral reception content: underperforming but structurally differentiated

---

## Strategic Implication

The Anchor's SEO moat is **specificity**. A hotel bar can't rank for "pub under the Heathrow flight path with a beer garden." A Staines chain pub can't rank for "function room near Slough Crematorium." Every page should push into hyper-specific territory where DA doesn't determine the winner — relevance does.
```

### `docs/seo-powerhouse/phase-1-strategy/keyword-framework.md`

```
# Keyword & Intent Framework — The Anchor, Stanwell Moor

**Date:** 21 April 2026 | **Author:** SEO Strategy Lead

---

## Reachable vs Aspirational

**Reachable (win within 6 months):** Long-tail, hyper-local, low competition. The Anchor can rank with content depth and schema.
**Aspirational (12+ months or dependent on DA growth):** Head terms dominated by aggregators and hotel chains.

---

## Cluster 1 — Food Table Bookings (P1)

**Business value:** Highest — direct revenue driver. Currently weakest SEO cluster.

| Keyword | Volume | Intent | Current Page | Status |
|---------|--------|--------|-------------|--------|
| sunday roast near heathrow | M | Transactional | /sunday-lunch | Position ~10, needs CTR fix |
| book a table near heathrow | L | Transactional | /book-table | Missing — no transactional copy |
| pub food near heathrow airport | M | Commercial | /food-menu | Pos 6.83, good |
| fish and chips heathrow | S | Transactional | /fish-and-chips-heathrow | Dedicated page ✅ |
| burger near heathrow | S | Transactional | /burger-menu | Dedicated page ✅ |
| pizza near heathrow | S | Transactional | /pizza-menu | Dedicated page ✅ |
| family restaurant heathrow | M | Informational | /heathrow-family-dining | Dedicated page ✅ |
| pre-flight meal heathrow | S | Transactional | /pre-flight-meal | Dedicated page ✅ |
| restaurants near heathrow airport | L | Commercial | /restaurants-near-heathrow | Aggregator dominated |
| gluten free pub near heathrow | S | Transactional | /food-menu/gluten-free | Exists, weak CTA |
| vegan pub near heathrow | S | Transactional | /food-menu/vegan | Exists |

**Reachable wins:** sunday roast near heathrow (position ~10 → top 5), fish and chips heathrow (already specific), gluten-free/vegan dietary pages (long-tail, low competition).
**Aspirational:** "restaurants near heathrow" — TripAdvisor/Yelp will hold top 3 spots.

**Missing pages:**
- No dedicated "book a table heathrow" landing page with booking widget as primary CTA
- No "Sunday lunch Stanwell Moor" or "Sunday lunch Staines" page

---

## Cluster 2 — Private Event Bookings (P2)

**Business value:** High (function room hire, 50 pax capacity). Currently near-zero traffic.

| Keyword | Volume | Intent | Current Page | Status |
|---------|--------|--------|-------------|--------|
| function room hire heathrow | M | Transactional | /function-room-hire | Needs content depth |
| private party venue near heathrow | M | Transactional | /private-party-venue | Exists |
| wake venue near heathrow | S | Transactional | /private-hire/wakes | Pos 25+, thin content |
| wake venue near staines crematorium | XS | Transactional | /private-hire/near/[slug] | 7 clicks, 5.98% CTR — best performer |
| birthday party venue heathrow | S | Transactional | /private-hire/milestone-birthdays | Exists |
| christening venue near heathrow | XS | Transactional | /private-hire/christenings | Exists |
| corporate event venue heathrow | M | Transactional | /corporate-events | Exists |
| christmas party venue heathrow | M | Seasonal | /christmas-parties | Seasonal page ✅ |
| pubs with private rooms staines | S | Transactional | /private-hire | Pos 11.8, 0 clicks |
| retirement party venue heathrow | XS | Transactional | /private-hire/retirement-parties | Exists |

**Key insight:** The /private-hire/near/[slug] pattern with "slough-crematorium" is the top performer in the entire P2 cluster with 7 clicks and 5.98% CTR. This signals that hyper-specific geo+occasion pages work. More crematorium/funeral-home proximity slugs should be created.

**Missing pages:**
- /private-hire/near/staines — "private hire near Staines"
- /private-hire/near/ashford-cemetery, /private-hire/near/brookwood-crematorium
- No "baby shower venue heathrow" standalone page (baby-showers exists but may be thin)

---

## Cluster 3 — Hosted Events (P3)

**Business value:** Medium (drives footfall, builds regulars, upsells food/drinks).

| Keyword | Volume | Intent | Current Page | Status |
|---------|--------|--------|-------------|--------|
| quiz night near heathrow | S | Navigational | /quiz-night | Pos 8.93, 1.69% CTR |
| pub quiz staines | S | Navigational | /quiz-night | Missing explicit targeting |
| karaoke night heathrow | XS | Navigational | /karaoke | Pos 9.31, 0% CTR — title/meta broken |
| music bingo heathrow | XS | Navigational | /music-bingo | Pos 10.8, 1.45% CTR |
| live music pub heathrow | S | Navigational | /live-music | Exists |
| open mic night heathrow | XS | Navigational | /open-mic | Exists |
| what's on in stanwell moor | XS | Informational | /whats-on | Pos 4.45, 0.73% CTR — terrible CTR |
| cash bingo heathrow | XS | Navigational | /cash-bingo | Exists |

**Quick win:** /whats-on at position 4.45 with 0.73% CTR is a pure meta-title/description failure. Fixing this should unlock ~30-40 clicks/month from current impressions alone.

---

## Cluster 4 — Heathrow Proximity (Traffic Engine)

**Business value:** Medium-indirect (top of funnel, converts via cross-links to food/booking).

| Keyword | Volume | Intent | Current Page | Status |
|---------|--------|--------|-------------|--------|
| plane spotting heathrow | H | Informational | /plane-spotting-heathrow + blog | 23 clicks, pos 7.65 |
| heathrow viewing area | M | Informational | blog posts | 14 clicks |
| pub near heathrow | M | Commercial | /near-heathrow | Competes vs hotels |
| pub near heathrow terminal 5 | S | Navigational | /near-heathrow/terminal-5 | Terminal pages ✅ |
| parking near heathrow | M | Transactional | /heathrow-parking | Dedicated section ✅ |
| luggage storage heathrow | S | Transactional | /luggage-storage-heathrow | Exists |

---

## Cluster 5 — Local Village & Brand

| Keyword | Volume | Intent | Current Page | Status |
|---------|--------|--------|-------------|--------|
| the anchor stanwell moor | S | Branded | / | 45 clicks, pos 1.16 — dominant |
| the anchor staines | S | Branded | / | 16 clicks |
| the anchor heathrow | S | Branded | / | 16 clicks |
| the anchor pub | M | Branded | / | pos 7.5 — losing to other Anchors |
| stanwell moor pub | XS | Local | /stanwell-pub | Needs meta fix |
| pub near m25 junction 14 | XS | Local | /m25-junction-14-pub | Exists |
| staines pub | S | Local | /staines-pub | Exists |

---

## Intent Classification Summary

| Intent Type | Clusters | Priority |
|-------------|----------|----------|
| Transactional (book now) | Food booking, Private hire | P1, P2 |
| Commercial (compare options) | Heathrow proximity, Function rooms | P2, P4 |
| Navigational (find specific event) | Hosted events | P3 |
| Informational (learn/plan) | Plane spotting, Heathrow tips | P4 (converts to P1) |
| Branded | All The Anchor variants | Protect |

---

## Volume Legend
- XS: <50 searches/month UK
- S: 50–200/month
- M: 200–1,000/month
- H: 1,000+/month
- L: 500–2,000/month (broad match, aggregator-dominated)
```

### `docs/seo-powerhouse/phase-1-strategy/opportunity-map.md`

```
# Opportunity Map — The Anchor, Stanwell Moor

**Date:** 21 April 2026 | **Author:** SEO Strategy Lead

---

## Opportunity Tier Classification

- **🔥 Quick Win:** High confidence, low effort, immediate CTR or ranking improvement
- **📈 Growth:** Medium effort, significant traffic upside within 3 months
- **🏗️ Structural:** Architecture or content gaps requiring new pages or major rewrites
- **🛡️ Defensive:** Protect existing rankings from decay or cannibalisation

---

## 1. Underperforming Pages (Existing Pages Leaving Traffic on the Table)

### /whats-on — 🔥 Quick Win
- **Data:** 827 impressions, 0.73% CTR, position 4.45 (6 clicks)
- **Problem:** Meta title/description not matching user intent. At position 4.45 this should be getting ~60–80 clicks/month, not 6.
- **Fix:** Rewrite title to "What's On at The Anchor | Quiz Nights, Bingo & Live Music" — include event types in the title so searchers see relevance. Current title is almost certainly just "What's On | The Anchor."
- **Expected uplift:** +40–50 clicks/month at current impressions

### /book-table — 🔥 Quick Win
- **Data:** 174 impressions, 0.57% CTR, position 10.56
- **Problem:** Title not triggering transactional intent. No "book a table" or "reserve" language.
- **Fix:** Title "Book a Table | The Anchor Pub Near Heathrow" + meta describing Sunday lunch, groups, same-day availability.
- **Note:** Position 10.56 is borderline page 1/2. A title/description fix + 1–2 internal links from high-traffic pages (plane spotting blog posts) should push to top 10.

### /karaoke — 🔥 Quick Win
- **Data:** 141 impressions, 0% CTR, position 9.31
- **Problem:** 0% CTR at position 9 means the meta title/description is actively repelling clicks. Likely shows a generic or cut-off title.
- **Fix:** Rewrite title and description immediately. "Karaoke Nights | The Anchor, Stanwell Moor" — include day/frequency of event.

### /private-hire/wakes — 📈 Growth
- **Data:** 530 impressions, 0.57% CTR, position 25.58
- **Problem:** Position 25 means page 2–3. Content is thin relative to the emotional weight/specificity required for a wake venue search.
- **Fix:** Full content expansion — include capacity (up to 50), catering options, private room access, dedicated staff, proximity to Slough Crematorium, Staines Cemetery, Woking Crematorium. Searchers for this intent are high-intent and convert at high rates.

### /sunday-lunch — 📈 Growth
- **Data:** 381 impressions, 1.31% CTR, position 9.78
- **Problem:** Position 9.78 is borderline. CTR of 1.31% is low for position 9–10 (expected ~2%).
- **Fix:** Meta rewrite + add structured data with menu/price/booking. Target "sunday roast near heathrow" explicitly in title.

### /quiz-night — 📈 Growth
- **Data:** 237 impressions, 1.69% CTR, position 8.93 (4 clicks)
- **Fix:** Title needs location + day. "Quiz Night Every Thursday | The Anchor Near Heathrow." Add Event schema with recurring schedule.

---

## 2. Missing Pages (Structural Gaps)

### 🏗️ No dedicated "book a table near Heathrow" intent page
- The booking page (/book-table) is a wizard, not a landing page. It lacks the content needed to rank.
- **Recommendation:** Create a pre-booking landing page at /book-a-table or add a substantial content section to /book-table above the wizard. Target "book a table near Heathrow", "reserve a table Stanwell Moor."

### 🏗️ /private-hire/near/ — only one slug exists (slough-crematorium)
- This is the best-performing private hire page (7 clicks, 5.98% CTR, position 12.3)
- **Recommendation:** Create additional slugs:
  - `/private-hire/near/staines` — "private hire near Staines"
  - `/private-hire/near/ashford` — "private hire near Ashford"
  - `/private-hire/near/windsor` — "private hire near Windsor"
  - `/private-hire/near/bedfont-crematorium` or `/near/ashford-cemetery`
  - `/private-hire/near/woking-crematorium` (Woking Crematorium serves TW19 area)
- Each page should map to the geo + occasion

### 🏗️ No "Sunday lunch Staines" / "Sunday roast Staines" page
- "sunday roast staines" is a distinct local query. /sunday-lunch targets Heathrow. A /sunday-lunch/staines or dedicated Staines variant could capture this.

### 🏗️ No corporate/team events content cluster
- /corporate-events exists but there's no content cluster around it. Blog content about "corporate team outing near Heathrow" or "team lunch near M25 junction 14" would build topical authority.

---

## 3. Cannibalisation Risks

### /private-hire vs /function-room-hire vs /private-party-venue
- Three pages with overlapping intent: "function room hire heathrow", "private party venue heathrow", "private hire heathrow."
- **Risk:** Google can't choose a canonical and splits equity between them.
- **Fix:** Clarify each page's primary keyword target. /private-hire = hub (all occasion types), /function-room-hire = commercial intent (explicit hire/cost), /private-party-venue = social occasions. Cross-link clearly with descriptive anchor text.

### /near-heathrow vs /restaurants-near-heathrow vs /heathrow-hotels-pub
- Multiple "near Heathrow" pages create overlapping signals.
- **Fix:** Ensure each has a distinct angle. /near-heathrow = "local pub", /restaurants-near-heathrow = "dining options", /heathrow-hotels-pub = "for hotel guests."

### Brand cannibalisation: "the anchor pub" vs homepage
- Other "The Anchor" pubs outrank the homepage for "the anchor pub" at position 7.5.
- **Fix:** Strengthen homepage LocalBusiness schema with `sameAs` pointing to Google Business Profile, Facebook, etc. Add "Stanwell Moor" to homepage H1 and title tag.

---

## 4. Traffic-to-Conversion Gap (Plane Spotting → Booking)

**This is the single biggest structural opportunity.**
- Plane spotting pages drive ~430 clicks/month — the largest traffic source
- Zero commercial intent in the content cluster; no links to /book-table or /sunday-lunch
- These visitors are people visiting the Heathrow area — exactly the audience for a pre-flight meal or beer garden visit
- **Fix:** Add contextual CTAs on all plane spotting blog posts: "Visiting Heathrow? The Anchor is 5 minutes away — book a table or just drop in."
- **Expected uplift:** Even a 2% conversion of 430 monthly visitors = 8–9 incremental table enquiries/month

---

## 5. Rich Result Opportunities

| Page | Schema Type | Current State | Opportunity |
|------|------------|---------------|-------------|
| /quiz-night | Event (recurring) | Basic | Add recurring Event schema → event rich results |
| /music-bingo | Event | Basic | Same as above |
| /karaoke | Event | Basic | Same as above |
| /sunday-lunch | Restaurant + Menu | Unknown | MenuSection, servesCuisine, priceRange |
| /private-hire | EventVenue | Missing | Adds to "venues" knowledge graph |
| /food-menu/* | Menu | Partial | NutritionInformation where available |
| Homepage | LocalBusiness | Present | Add openingHours, aggregateRating, sameAs |

---

## 6. Technical Opportunities

### CSS blocked by robots.txt — CRITICAL (already specced)
- ~99 CSS files with `?dpl=` params are blocked — Google cannot render pages properly
- This is a foundational rendering issue affecting all rich result eligibility
- **Fix is already specced in docs/gsc-coverage-fix-spec.md — must ship first**

### STATIC_LAST_MODIFIED in sitemap.ts
- Currently hardcoded to 2026-03-20. Stale dates signal to Google that content hasn't changed.
- **Fix:** Update to current date or make dynamic per-page.

### 13 URLs blocked by robots.txt (stale test page entries)
- Test pages have been deleted from codebase but robots.txt still lists them
- **Fix:** Clean up robots.ts disallow list (part of git status deleted files commit)

---

## Priority Order for Specialists

1. **Technical:** Fix CSS robots.txt blocking (unblocks all rendering-dependent improvements)
2. **Technical:** Commit deleted test pages + clean robots.ts
3. **Copywriter:** Rewrite /whats-on, /karaoke, /book-table, /sunday-lunch meta titles/descriptions
4. **Content:** Expand /private-hire/wakes with full venue + proximity content
5. **Content:** Add booking CTAs to all plane spotting blog posts
6. **Structural:** Create additional /private-hire/near/ slugs (minimum 3)
7. **Schema:** Add recurring Event schema to quiz-night, karaoke, music-bingo
8. **Schema:** Add EventVenue to /private-hire
9. **Content:** Create /book-a-table landing page with content + embedded wizard
10. **Brand:** Homepage meta + schema strengthening for "the anchor pub" query
```

### `docs/seo-powerhouse/phase-1-strategy/strategy-document.md`

```
# SEO Strategy Document — The Anchor, Stanwell Moor

**Date:** 21 April 2026 | **Author:** SEO Strategy Lead
**Version:** 1.0 — Foundation strategy for SEO Powerhouse engagement

---

## Strategic Position

The Anchor is a low-DA, high-relevance local site that has demonstrated it can win on content depth for niche queries. The plane spotting cluster (~430 clicks/month) proves the model: go deep on a specific topic, rank against low-competition queries, convert through internal linking.

The site is growing fast (+60% daily clicks, +24% impressions in 28 days) but the growth is in the wrong channel. Plane spotting is a hobby interest, not a buyer signal. The commercial priorities — food bookings, private hire, hosted events — are barely visible in search.

**The strategic challenge is not traffic volume. It is traffic quality and intent alignment.**

---

## Where We Can Realistically Win

### High-confidence wins (achievable <3 months)

**Thin-margin ranking improvements via CTR fixes:**
The site has pages at positions 4–11 with terrible CTRs. These are ranking failures caused by bad meta titles and descriptions, not content failures. Fixing them costs near-zero effort and unlocks existing impression inventory.

- /whats-on: pos 4.45, 0.73% CTR → should be 6–8% at that position. Fix title = ~40 extra clicks/month.
- /karaoke: pos 9.31, 0% CTR → broken title. Fix = recover ~5–10 clicks/month.
- /book-table: pos 10.56, 0.57% CTR → fix title + internal links = push to top 10.

**Hyper-local private hire pages:**
The /private-hire/near/slough-crematorium page has a 5.98% CTR at position 12.3 — the highest CTR in the P2 cluster. This is the proof that hyper-specific geo+occasion pages work. Three more slugs (Staines, Ashford, Windsor) could double P2 traffic within 90 days.

**Plane spotting → booking conversion:**
No new SEO work needed. Just add contextual CTAs to 3 existing blog posts. These visitors are already in the Heathrow area — the pub is 5 minutes away. This is the fastest path to incremental table bookings.

### Achievable wins (3–6 months)

**Sunday roast near Heathrow — position 5 or better:**
Currently at ~position 10. Deserves a top-5 position. Requires: meta rewrite, structured data (Restaurant + Menu schema), and 2–3 internal links from Heathrow-context pages. No new content required.

**Wakes — position 10 or better:**
Currently at position 25. Requires a full content expansion of /private-hire/wakes. This is a high-intent, low-competition query in a geography underserved by specialist funeral reception venues. A well-written page covering capacity, catering, private access, and crematorium proximity should rank top-10.

**Quiz night / hosted events — position 5 or better:**
Event schema + meta fixes. Currently at positions 8–11 with no Event rich result exposure.

### Aspirational (6–12 months, DA-dependent)

**"Pub near Heathrow" — top 5:**
Dominated by hotel bars and aggregators. The terminal-specific pages (/near-heathrow/terminal-5 etc.) are the better angle — less competition, more specific intent.

**"Restaurants near Heathrow" — top 5:**
TripAdvisor, Yelp, Google Local will hold top 3. Position 4–6 is realistic with aggregateRating schema and content depth, but requires GBP review growth.

**"Function room hire Heathrow" — top 3:**
Achievable but requires sustained content investment and potentially backlink acquisition from local event directories.

---

## Critique of Existing Plan

The plan at `docs/superpowers/plans/2026-04-21-gsc-performance-enhancement-plan.md` is technically correct but has five weaknesses:

**1. It buries the most critical issue.**
The CSS files blocked by robots.txt (specced in `docs/gsc-coverage-fix-spec.md`) is not in the existing plan at all. Googlebot cannot render pages properly. This affects rich result eligibility for every schema enhancement in Phase 3. This must be phase 0, not an afterthought.

**2. The content strategy is defensive, not growth-oriented.**
Phase 4 is mainly "cross-linking" fixes. There is no plan to create new pages to capture unaddressed intent. The /private-hire/near/[slug] pattern is the highest-CTR page in P2 — the plan doesn't mention expanding it.

**3. The plane spotting → booking conversion opportunity is undersold.**
Listed as item 7 in priority ranking with "High" impact. It should be item 1 or 2. It requires zero new content, touches existing high-traffic pages, and directly serves the P1 business priority. The effort/impact ratio is the best on the list.

**4. Brand query fix (5.1) is too shallow.**
"The anchor pub" at position 7.5 losing to other Anchors is a significant commercial problem. The fix requires more than adding "Stanwell Moor" to the title — it needs GBP optimisation, `sameAs` schema, and potentially disambiguation content on the homepage.

**5. No mention of the conversion funnel from search to booking.**
The plan measures success in "clicks" and "impressions." A click to /book-table that doesn't convert is worth nothing. The plan needs a CRO element: are the landing pages optimised to convert the search traffic the SEO work will generate? This is particularly critical for /private-hire/wakes and /book-table.

---

## Strategic Framework

### The Three-Layer Model

```
Layer 1 — Technical Foundation (unblock rendering, fix indexing)
    ↓
Layer 2 — Intent Alignment (CTR fixes, meta rewrites, schema)
    ↓
Layer 3 — Traffic Conversion (CTAs, booking UX, new page creation)
```

The existing plan focuses mainly on Layer 2. Layer 1 is partially addressed. Layer 3 is missing almost entirely.

### The Specificity Principle

Every page should answer a question no other page on the internet answers as well. Generic pages lose to aggregators. Specific pages — "wake venue 5 minutes from Slough Crematorium" — win because no TripAdvisor category exists for that.

### The Intent-Revenue Bridge

The site needs an explicit policy: every informational page must link to a transactional one. Plane spotting → book a table. Beer garden → summer garden parties. Live sport → book for the match. This is not just internal linking — it is demand capture.

---

## Direction for Each Specialist

### Technical SEO
**Priority 1:** Fix CSS robots.txt blocking (docs/gsc-coverage-fix-spec.md is the spec — implement it).
**Priority 2:** Commit deleted test pages + clean robots.ts disallow list.
**Priority 3:** Update STATIC_LAST_MODIFIED in sitemap.ts to 2026-04-21.
**Priority 4:** Audit 4 redirect chains on Euro 2024 blog posts — fix or remove.
**Avoid:** Chasing the 9 "crawled but not indexed" URLs without first understanding whether Google is making a quality judgement vs a technical block.

### Content Strategy
**Priority 1:** Plane spotting blog posts — add 3 booking CTAs (no new content needed).
**Priority 2:** Expand /private-hire/wakes to 800+ words covering capacity, catering, crematorium proximity, booking process.
**Priority 3:** Create 3 new /private-hire/near/ slugs (Staines, Ashford, Windsor or nearest cemetery/crematorium).
**Priority 4:** Build a content brief for a "book a table near Heathrow" landing page.
**Avoid:** Creating thin seasonal content (Easter, Halloween etc.) unless The Anchor is confirmed to be running specific events.

### Analytics
**Priority 1:** Set up conversion tracking: what % of /book-table visitors complete a booking? Without this, all SEO work is unmeasured.
**Priority 2:** Track assisted conversions — plane spotting → food pages → book-table paths in GA4.
**Priority 3:** Create a GSC dashboard segmented by business priority (P1/P2/P3 query groups).
**Avoid:** Optimising for impressions or rankings without tying to booking completions.

### Authority / Link Building
**Priority 1:** Local directories: Staines, Spelthorne, Surrey pub/restaurant directories.
**Priority 2:** Plane spotting community links — the existing blog content merits links from aviation enthusiast sites. Active outreach could move plane spotting pages from position 7–8 to 3–5.
**Priority 3:** Crematorium / funeral director proximity mentions — local funeral services often list nearby reception venues.
**Avoid:** Generic link-building services — they won't deliver geo-relevant authority.

### UX / CRO
**Priority 1:** /book-table wizard — is the completion rate tracked? The page has 174 impressions and a poor CTR, but even fixing CTR is wasted if the wizard has high abandonment.
**Priority 2:** /private-hire/wakes — ensure the page has a clear, empathetic CTA ("Call us to discuss your requirements") not just a generic booking form.
**Priority 3:** Plane spotting pages — what does the content-to-CTA conversion funnel look like? Add heatmap tracking.

### Copywriter
**Priority 1 (immediate):** Rewrite meta titles and descriptions for: /whats-on, /karaoke, /book-table, /sunday-lunch, /private-hire/wakes, /stanwell-pub.
**Priority 2:** Expand /private-hire/wakes body copy with empathy-led, factual content.
**Priority 3:** Write booking CTA copy blocks for plane spotting blog posts.
**Rules:** All copy must reference SSOT.json for verified facts. No seasonal content unless confirmed. "The Anchor Pub" for SEO contexts; "The Anchor" for conversational mentions.

---

## 90-Day Success Metrics

| Metric | Current | 90-Day Target |
|--------|---------|---------------|
| Daily clicks | 44.3 | 65+ |
| P1 food booking clicks | ~67/28d | 130+/28d |
| P2 private hire clicks | ~1/28d | 15+/28d |
| P3 hosted events clicks | ~12/28d | 25+/28d |
| /whats-on CTR | 0.73% | 5%+ |
| /private-hire/wakes position | 25.58 | <12 |
| /book-table position | 10.56 | <8 |
| CSS blocked by robots.txt | ~99 URLs | 0 |
```

### `docs/seo-powerhouse/phase-3-deep-dive/copywriter/page-recommendations.md`

```
# SEO Meta Copy Recommendations — Phase 3 Deep Dive
*Generated: 2026-04-21 | Copywriter pass*

---

### /whats-on
**Target keyword**: pub events near Heathrow / what's on Stanwell Moor
**Current title**: "What's On Near Heathrow | Quiz, Bingo & Live Music Every Week | The Anchor"
**Current description**: "Weekly pub events near Heathrow: Music Bingo, cash bingo, pub quiz, open mic nights and more at The Anchor, Stanwell Moor. Entry from £3, free parking, 7 mins from T5."

**Recommended title** (55 chars): "Quiz, Karaoke & Bingo Every Week | The Anchor Pub"
**Recommended description** (157 chars): "Pub quiz, karaoke Fridays, Music Bingo, cash bingo & live music at The Anchor, Stanwell Moor. Entry from £3. Free parking, 7 mins from Heathrow T5. See all dates."
**H1 change needed?**: No
**Why**: Current title is 73 chars (truncates in SERPs) and buries "karaoke" which is a high-intent specific term. Moving the four event types to the front is the fastest CTR lever at position 4.45. "Pub" added for disambiguation. Title trimmed to fit 50–60 chars. Description adds "karaoke Fridays" and "live music" for specificity and retains price/parking hooks.

---

### /karaoke
**Target keyword**: karaoke pub near Heathrow / karaoke Stanwell Moor
**Current title**: "Karaoke Pub Near Heathrow | Friday Nights at The Anchor"
**Current description**: "Looking for a karaoke pub near me? The Anchor hosts karaoke every Friday 8–11pm. 50,000+ songs, hosted by Nikki Manfadge. Free entry, free parking, Stanwell Moor."

**Recommended title** (54 chars): "Karaoke Fridays Near Heathrow | Free Entry | The Anchor"
**Recommended description** (158 chars): "Karaoke every Friday 8–11pm at The Anchor, Stanwell Moor. 50,000+ songs, hosted nights, free entry & free parking. 7 mins from Heathrow T5. Grab the mic tonight."
**H1 change needed?**: No
**Why**: 0% CTR despite 141 impressions almost certainly means the snippet reads like every other karaoke page. Adding "Free Entry" to the title directly addresses the biggest purchase-barrier question and differentiates instantly. Description keeps the specifics (time, song count) and adds a direct call-to-action closer.

---

### /book-table
**Target keyword**: book a table near Heathrow / pub table booking Stanwell Moor
**Current title**: "Book a Table at The Anchor | Near Heathrow | Free Parking"
**Current description**: "Book a table at The Anchor near Heathrow with instant confirmation. Pub classics from £8.95, Sunday roasts from £19. Free parking, dog-friendly, 7 mins from T5. Walk-ins welcome."

**Recommended title** (57 chars): "Book a Table Near Heathrow | Sunday Roast | The Anchor"
**Recommended description** (159 chars): "Reserve your table at The Anchor, Stanwell Moor — instant confirmation. Pub food from £8.95, Sunday roast from £19. Dog-friendly, free parking, 7 mins from T5."
**H1 change needed?**: No
**Why**: Current title is already well-structured but "Free Parking" in the title consumes space better spent on "Sunday Roast" (a high-intent food signal). "Reserve" added to description for semantic variety. Description trimmed by one phrase to fit cleanly within 160 chars.

---

### /sunday-lunch
**Target keyword**: Sunday roast near Heathrow / Sunday lunch Stanwell Moor
**Current title**: "Sunday Roast & Lunch Near Heathrow | From £19 | Book a Table | The Anchor"
**Current description**: "Traditional Sunday roast and Sunday lunch near Heathrow from £19. Chicken, pork belly & vegetarian options. Just 8 minutes from Staines-upon-Thames. Free parking. Book by Saturday 1pm."

**Recommended title** (58 chars): "Sunday Roast Near Heathrow | From £19 | Book by Saturday"
**Recommended description** (156 chars): "Traditional Sunday roast from £19 at The Anchor, Stanwell Moor. Chicken, pork belly & veggie options. Must book by Saturday 1pm. Free parking, 7 mins from T5."
**H1 change needed?**: No
**Why**: Current title is 73 chars — truncates. Removing "& Lunch" tightens it; "Book by Saturday" adds genuine urgency (real deadline) which is a stronger CTR driver than repeating location. Description mirrors the urgency signal and adds "7 mins from T5" proximity hook.

---

### /stanwell-pub
**Target keyword**: Stanwell Moor pub / pub in Stanwell
**Current title**: "Stanwell Village Pub | Beer Garden, Sunday Roasts & Free Parking | The Anchor"
**Current description**: "The Anchor is Stanwell Moor's village pub — rated 4.6/5 on Google. Sunday roasts from £19, stone-baked pizzas, dog-friendly beer garden and free parking. 7 mins from Heathrow T5."

**Recommended title** (55 chars): "The Anchor | Stanwell Moor Pub | Rated 4.6★ on Google"
**Recommended description** (158 chars): "Your local in Stanwell Moor — rated 4.6/5 on Google. Sunday roasts from £19, stone-baked pizzas, dog-friendly beer garden, quiz nights & free parking."
**H1 change needed?**: Yes — recommended H1: "Your Local Pub in Stanwell Moor"
**Why**: 0.17% CTR at position 4 is the worst gap on the site — the page looks identical to generic pub listings. Leading with the brand name + star rating in the title creates instant social proof and differentiation. Current title "Stanwell Village Pub" is the right keyword but the rest wastes space on features that should live in the description. Description adds events (quiz nights) to signal there's more than just food.

---

### /private-hire/wakes
**Target keyword**: wake venue near Heathrow / funeral reception venue Staines
**Current title**: "Wake Venue & Celebration of Life | Near SW Middlesex Crematorium | The Anchor"
**Current description**: "A peaceful venue for wakes, funeral receptions and celebrations of life near South West Middlesex Crematorium and Staines Cemetery. Private rooms, funeral tea packages from [dynamic price]pp, free parking and compassionate staff."

**Recommended title** (60 chars): "Wake & Funeral Reception Venue | Near Heathrow | The Anchor"
**Recommended description** (155 chars): "Private room for wakes, funeral teas & celebrations of life near Staines & Heathrow. Up to 50 guests, buffet packages from £12pp, free parking. Compassionate staff."
**H1 change needed?**: No
**Why**: "SW Middlesex Crematorium" in the current title is hyper-local to the point of being cryptic in search. "Near Heathrow" has 15× more search volume and covers the catchment. Adding "Private Room" and capacity (up to 50) answers the two questions grieving families ask first. Description keeps the compassionate tone while leading with the practical signals.

---

### /live-sport
**Target keyword**: watch live sport near Heathrow / sports pub Stanwell Moor
**Current title**: "Watch Live Sport Near Heathrow | Major Tournaments & Events | The Anchor"
**Current description**: "Watch major sporting events near Heathrow — Six Nations, World Cup, Euros & F1 on big screens at The Anchor. Free parking, great food, 7 mins from T5."

**Recommended title** (58 chars): "Watch Live Sport Near Heathrow | Big Screens | The Anchor"
**Recommended description** (157 chars): "Watch Six Nations, Euros, F1 & World Cup on big screens at The Anchor, Stanwell Moor. Terrestrial sport, great atmosphere, free parking, 7 mins from Heathrow T5."
**H1 change needed?**: No
**Why**: "Major Tournaments & Events" is vague filler. "Big Screens" is a search term people actually use. Description reordered to lead with specific sports (trust signal) and "Terrestrial sport" quietly signals reliable free-to-air coverage without mentioning Sky. Current description is already close to good — this is a marginal improvement.

---

### /quiz-night
**Target keyword**: pub quiz near Heathrow / quiz night Stanwell Moor
**Current title**: "Pub Quiz Night Near Heathrow | Cash Prizes | The Anchor"
**Current description**: "Monthly pub quiz at The Anchor near Heathrow. £3 entry, £25 bar tab prize for the winners. Teams of up to 6 welcome. Free parking, draught beers. Check dates below."

**Recommended title** (55 chars): "Pub Quiz Near Heathrow | £3 Entry, Cash Prizes | The Anchor"
**Recommended description** (156 chars): "Monthly quiz night at The Anchor, Stanwell Moor. £3 entry, £25 bar tab for the winners. Teams of up to 6. Free parking, 7 mins from Heathrow T5. Book your spot."
**H1 change needed?**: No
**Why**: Moving "£3 Entry" to the title adds the price signal at the click decision point — low-cost events convert better when the price is visible before the click. Description adds "Book your spot" CTA and T5 proximity hook. Solid existing copy; minimal change needed.

---

### /music-bingo
**Target keyword**: music bingo near Heathrow / bingo night Stanwell Moor
**Current title**: "Music Bingo Near Heathrow | Singalong Bingo Night | The Anchor"
**Current description**: "Play Music Bingo near Heathrow at The Anchor. Song snippets replace numbers, prizes land every round, and booking is recommended for this singalong bingo night in Stanwell Moor."

**Recommended title** (60 chars): "Music Bingo Near Heathrow | Win Every Round | The Anchor"
**Recommended description** (158 chars): "Singalong Music Bingo at The Anchor, Stanwell Moor — song snippets replace numbers, prizes every round. Book early, it sells out. 7 mins from Heathrow T5."
**H1 change needed?**: No
**Why**: "Singalong Bingo Night" in the title is a strong differentiator but "Win Every Round" (a true claim — prizes every round) is a more compelling hook at position 10.8. Description adds urgency ("sells out") which is both accurate and a CTR lever.

---

### /near-heathrow
**Target keyword**: pub near Heathrow Airport / pubs near Heathrow Terminal 5
**Current title**: "Pubs Near Heathrow Airport | 7 Mins from T5 | Free Parking | The Anchor"
**Current description**: "The Anchor — rated 4.6/5 on Google — is the closest traditional pub to Heathrow Airport. 7 mins from T5, free parking, dog-friendly beer garden, Sunday roasts from £19 and food served daily (except Mon)."

**Recommended title** (57 chars): "Pub Near Heathrow Airport | 7 Mins from T5 | The Anchor"
**Recommended description** (158 chars): "Rated 4.6/5 on Google. Traditional pub 7 mins from Heathrow T5 — free parking, dog-friendly beer garden, Sunday roasts from £19, quiz nights & live events."
**H1 change needed?**: No
**Why**: "Pubs" (plural) in the title suggests a directory page. "Pub" (singular) claims ownership of the query. Removing "Free Parking" from the title saves space and lets it move to the description alongside more differentiators. Description adds events to signal this is a destination, not just a transit stop. At position 12.76 the page needs to jump pages — clearer single-entity positioning helps.

---

### /private-hire/christenings
**Target keyword**: christening venue near Heathrow / christening party venue Staines
**Current title**: "Christening Venue Near Staines & Stanwell | The Anchor"
**Current description**: "The perfect venue for christening parties and baptism receptions in Stanwell Moor. Family-friendly, buffet options, and free parking for all guests."

**Recommended title** (60 chars): "Christening Venue Near Heathrow & Staines | The Anchor"
**Recommended description** (157 chars): "Private room for christening parties & baptism receptions at The Anchor, Stanwell Moor. Up to 50 guests, buffet options, family-friendly, free parking. Near Heathrow."
**H1 change needed?**: No
**Why**: "Heathrow" is missing from the current title — this is the noted GSC gap. Swapping "Stanwell" for "Heathrow & Staines" captures both geographic catchments. Description adds capacity (up to 50) and "Near Heathrow" to close the geographic loop.

---

### / (Homepage)
**Target keyword**: the anchor pub Stanwell Moor / pub near Heathrow
**Current title (default)**: "The Anchor | Pub Near Heathrow | Stanwell Moor"
**Current description**: "The Anchor in Stanwell Moor — traditional pub near Heathrow Airport. Sunday roasts, quiz nights, Music Bingo, dog-friendly beer garden under the flight path. Free parking, 7 mins from T5."

**Recommended title** (52 chars): "The Anchor Pub | Stanwell Moor | Near Heathrow"
**Recommended description** (159 chars): "The Anchor, Stanwell Moor — rated 4.6/5 on Google. Traditional pub 7 mins from Heathrow T5. Sunday roasts, quiz nights, karaoke Fridays, beer garden & free parking."
**H1 change needed?**: No — the brand name heads the H1 already
**Why**: At position 7.5 with 0.46% CTR the page is losing to other "The Anchor" pubs. The fix is disambiguation signals. "Pub" added to brand name in title (common search pattern) and "Stanwell Moor" retained. Star rating moved into description (current description omits it — a wasted trust signal). Adding "karaoke Fridays" to description gives a unique identifier no other Anchor pub can claim.

**Note on implementation**: The homepage title is set via `app/layout.tsx` `title.default`. Update that value. The description is also in `layout.tsx`. Do not add `alternates.canonical` to the root layout (documented historical bug).
```

### `docs/seo-powerhouse/phase-3-deep-dive/ux-cro/report.md`

```
# UX & Conversion Analysis
_The Anchor pub website — assessed 21 April 2026_

---

## Summary

The site has strong bones: phone numbers are prominent, booking forms exist, and most pages have at least one CTA. However several high-traffic pages have conversion leaks that are costing real bookings. The single biggest issue is the blog traffic engine (~430 clicks/month from plane spotting content) that dumps users into a dead-end with no food or booking path. Secondary issues are: /food-menu's footer CTA missing a "Book a Table" button, /whats-on offering no per-event booking, and /book-table burying the form below the hero with a confused CTA hierarchy (phone is primary in the hero but the form is the actual conversion goal).

---

## Landing Page Assessments

| Page | Intent Match | Above-the-Fold CTA | Mobile UX | Trust Signals | Conversion Path | Score |
|------|-------------|--------------------|-----------|--------------|-----------------| ------|
| /book-table | Strong | Phone button is primary hero CTA — form is below fold | Form present; mobile help card visible | 1 Google review below form; ValueProofStrip present | Direct — 1 click | 7/10 |
| /sunday-lunch | Strong | FoodStickyCtaBar floats on mobile; "Book Sunday Lunch" button mid-page | Price in meta (£19) but not dominant in hero | None visible on page | Direct via BookTableButton; phone backup | 7/10 |
| /food-menu | Medium — browsing intent, not booking intent | FoodStickyCtaBar exists | Sticky bar is good | None visible | Footer CTA missing "Book a Table" — only phone + drinks menu | 5/10 |
| /private-hire/wakes | Strong | "Call to Discuss Arrangements" primary; "Enquire Online" secondary | Phone prominent on mobile | None (planned per existing audit) | Enquiry links to /private-hire#enquiry — navigates away from wakes page | 7/10 |
| /whats-on | Medium | No CTA above fold | No per-event booking | None | No per-event booking path; FAQ says "booking not required" | 4/10 |
| /quiz-night | Good | "Book Your Team Table" at bottom; upcoming dates mid-page | Responsive CTAs | None | BookTableButton present but does NOT pre-fill a specific quiz date | 6/10 |
| /blog/[slug] (plane spotting) | Low — informational | "Visit The Anchor Today" at very end; CTAs are "Get Directions" and "More Stories" | Generic template | None | No food/booking link anywhere in blog template | 2/10 |

---

## Conversion Flow Issues

### 1. /book-table — Wrong primary CTA in the hero
**Issue:** The hero's `primaryCta` is a `PhoneButton` ("Prefer to call? 01753 682707"). The `ManagementTableBookingForm` is the actual conversion goal and sits below the fold after the hero and a RegretReduction component.

**Impact:** On mobile (77% of traffic), users land on /book-table and see a hero with a phone button — they do not immediately see the booking form.

**Fix:** Swap hero primary/secondary CTAs. Primary = "Book Online Now" (anchor to `#booking-form`); secondary = phone. Or move a compact form above the hero fold.

---

### 2. /food-menu — Footer CTA missing "Book a Table"
**Issue:** The `CTASection` at the bottom of /food-menu has only two buttons: "Call: 01753 682707" and "View Drinks Menu". There is no "Book a Table" button. The `FoodStickyCtaBar` with `label="Book a Table"` exists but relies on the user having scrolled the entire page.

**Impact:** The highest-traffic food page (41 clicks/28d) ends with a CTA that sends users to drinks, not bookings.

**Fix:** Add a `BookTableButton` as a third button in the `CTASection`. The note in the existing GSC plan (item 4.4) references the /food-menu/gluten-free variant — the same fix is needed on the main /food-menu page.

---

### 3. /blog — Zero conversion path for ~430 clicks/month
**Issue:** The blog template's CTA section has only "Get Directions" and "More Stories". There is no link to /food-menu, /book-table, or any commercial content. The plane spotting posts are the site's largest traffic driver but convert nothing.

**Impact:** ~430 monthly visitors leave with no commercial touchpoint.

**Fix:** Add a contextual mid-content CTA block ("Hungry after plane spotting? The Anchor is 5 minutes away — food from £8.95") with `BookTableButton` and `/food-menu` link. Replace the template footer CTAs with "View Food Menu / Book a Table / Get Directions".

---

### 4. /private-hire/wakes — Enquiry form is on a different page
**Issue:** "Enquire Online" links to `/private-hire#enquiry` — a different page. A bereaved family clicks it and is navigated away from the wakes page to the generic private hire page, then must scroll to find the form.

**Impact:** Friction at the worst possible moment for an emotionally sensitive audience.

**Fix:** Either embed a lightweight enquiry form directly on /private-hire/wakes, or at minimum change the anchor to `/private-hire/wakes#enquiry` with a matching section on the page.

---

### 5. /quiz-night — Booking does not pre-fill a specific date
**Issue:** `BookTableButton` on /quiz-night sends users to the generic booking form without date pre-fill. The `QuizNightEvents` component renders upcoming dates but they are not passed to the booking URL.

**Impact:** Users who want to "reserve for next quiz" land on a blank form with no date context.

**Fix:** Read the next event date from the `events` array and pass as `/book-table?date=YYYY-MM-DD&purpose=quiz_night`. The `ManagementTableBookingForm` already accepts a `date` prefill param.

---

### 6. /whats-on — No per-event booking path
**Issue:** The FAQ explicitly says "booking isn't required" for most events. Event cards have no individual reservation CTA. Users interested in a specific event have no way to commit.

**Fix:** Add "Reserve a Table for This Night" on individual event cards linking to `/book-table?date=YYYY-MM-DD`. At minimum add a sticky "Coming to Quiz Night? Book Your Table" banner when a quiz is in the upcoming list.

---

### 7. /sunday-lunch — Price not in the hero
**Issue:** "From £19" is in the metadata and menu section but not visible in the hero. Users who clicked from Google (where they saw £19 in the snippet) do not see immediate price confirmation.

**Fix:** Add "From £19pp" as a hero badge.

---

## User Journey Gaps

| Gap | Pages Affected | Impact |
|-----|---------------|--------|
| Blog traffic engine has no commercial exit | /blog/[slug] all posts | HIGH — ~430 clicks/month dead-end |
| /food-menu bottom CTA directs to drinks, not booking | /food-menu | HIGH — highest-traffic food page |
| Quiz night booking does not select the event date | /quiz-night | MEDIUM |
| Wakes enquiry navigates away from wakes page | /private-hire/wakes | MEDIUM — emotionally sensitive |
| /whats-on: no path from event listing to booking that event | /whats-on | MEDIUM |
| /book-table hero promotes phone over the form | /book-table | LOW-MEDIUM |

---

## Quick UX Wins

Ordered by impact vs. effort:

| # | Fix | Effort | Impact |
|---|-----|--------|--------|
| 1 | Add "Book a Table" BookTableButton to /food-menu footer CTASection | XS | HIGH |
| 2 | Add food/booking CTAs to blog post template (all posts) | S | HIGH |
| 3 | Swap /book-table hero primary CTA from phone to form anchor | XS | MEDIUM |
| 4 | Embed enquiry form directly on /private-hire/wakes | S | MEDIUM |
| 5 | Pre-fill next quiz date in BookTableButton on /quiz-night | S | MEDIUM |
| 6 | Add "From £19pp" badge to /sunday-lunch hero | XS | LOW-MEDIUM |
| 7 | Add per-event "Reserve a Table" links on /whats-on event cards | S | MEDIUM |

---

_Report generated: 21 April 2026_
```

### `docs/ssot-review-spec.json`

```
{
  "elements": [
    { "text": "The Anchor — Single Source of Truth", "heading": 1 },
    { "text": "Brand Review Document — 2026-03-22", "heading": 2 },
    { "text": "" },
    { "runs": [{ "text": "Please add your comments in the 'Your Comments' column.", "bold": true }] },
    { "text": "This document contains every verified fact from the Single Source of Truth (SSOT) file. Please review each item carefully and note any corrections, updates, or queries in the 'Your Comments' column." },
    { "pageBreak": true },

    { "text": "Identity", "heading": 1 },
    {
      "rows": [
        { "cells": [{ "content": [{ "text": "Item" }], "shading": "DDDDDD" }, { "content": [{ "text": "Current Value" }], "shading": "DDDDDD" }, { "content": [{ "text": "Your Comments" }], "shading": "DDDDDD" }], "isHeader": true },
        { "cells": [{ "content": [{ "text": "Name" }] }, { "content": [{ "text": "The Anchor" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Name with location" }] }, { "content": [{ "text": "The Anchor, Stanwell Moor" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Naming rule" }] }, { "content": [{ "text": "NEVER use 'The Anchor Pub' in customer-facing copy. Always 'The Anchor'." }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Motto" }] }, { "content": [{ "text": "Eat, Drink, Enjoy" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Tagline" }] }, { "content": [{ "text": "Where Everyone's Welcome" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Type" }] }, { "content": [{ "text": "Independent British village pub and restaurant" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Pub group" }] }, { "content": [{ "text": "Greene King Tenants network" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Heritage statement" }] }, { "content": [{ "text": "Part of the community since the 1800s" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Detailed heritage" }] }, { "content": [{ "text": "A village pub since 1751 — nearly 275 years old. Stood before Heathrow existed; Heathrow grew from a grass airstrip in the 1940s." }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Founding year" }] }, { "content": [{ "text": "1751" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Founding year note" }] }, { "content": [{ "text": "RESOLVED: Canonical year is 1751. Claims.json (1866), blog posts (1869), and footer ('since the 1800s') are all incorrect and should be updated." }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Description: default SEO" }] }, { "content": [{ "text": "Traditional British pub near Heathrow Airport" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Description: schema.org" }] }, { "content": [{ "text": "Traditional British pub near Heathrow with quiz nights, hosted events, and famous Sunday roasts" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Description: marketing" }] }, { "content": [{ "text": "The closest traditional British pub to Heathrow Airport. Famous Sunday roasts, beer garden under the flight path, and FREE parking for all guests." }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Description: footer" }] }, { "content": [{ "text": "Your local pub in Stanwell Moor, serving the community with great food, drinks, and entertainment since the 19th century." }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Description: PWA" }] }, { "content": [{ "text": "Traditional British pub near Heathrow with quiz nights, hosted events & great food" }] }, { "content": [{ "text": "" }] }] }
      ],
      "width": 100,
      "borders": true
    },
    { "pageBreak": true },

    { "text": "Contact", "heading": 1 },
    {
      "rows": [
        { "cells": [{ "content": [{ "text": "Item" }], "shading": "DDDDDD" }, { "content": [{ "text": "Current Value" }], "shading": "DDDDDD" }, { "content": [{ "text": "Your Comments" }], "shading": "DDDDDD" }], "isHeader": true },
        { "cells": [{ "content": [{ "text": "Phone: display" }] }, { "content": [{ "text": "01753 682707" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Phone: international" }] }, { "content": [{ "text": "+44 1753 682707" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Email: primary" }] }, { "content": [{ "text": "manager@the-anchor.pub" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Email: resolved note" }] }, { "content": [{ "text": "manager@the-anchor.pub is canonical. info@theanchorpub.co.uk is legacy and should be removed." }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "WhatsApp number" }] }, { "content": [{ "text": "441753682707" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "WhatsApp URL" }] }, { "content": [{ "text": "https://wa.me/441753682707" }] }, { "content": [{ "text": "" }] }] }
      ],
      "width": 100,
      "borders": true
    },
    { "pageBreak": true },

    { "text": "Location", "heading": 1 },
    {
      "rows": [
        { "cells": [{ "content": [{ "text": "Item" }], "shading": "DDDDDD" }, { "content": [{ "text": "Current Value" }], "shading": "DDDDDD" }, { "content": [{ "text": "Your Comments" }], "shading": "DDDDDD" }], "isHeader": true },
        { "cells": [{ "content": [{ "text": "Address: street" }] }, { "content": [{ "text": "Horton Road" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Address: town" }] }, { "content": [{ "text": "Stanwell Moor" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Address: county" }] }, { "content": [{ "text": "Surrey" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Address: postcode" }] }, { "content": [{ "text": "TW19 6AQ" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Address: country" }] }, { "content": [{ "text": "GB" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Coordinates" }] }, { "content": [{ "text": "51.462509, -0.502067" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Coordinates: resolved" }] }, { "content": [{ "text": "51.462509, -0.502067 is the only correct coordinate. Beer garden page schema (51.4764, -0.4735) must be fixed." }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Google Maps URL" }] }, { "content": [{ "text": "https://maps.google.com/maps?q=The+Anchor+Stanwell+Moor+TW19+6AQ" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Access: near M25" }] }, { "content": [{ "text": "2 minutes from M25 Junction 14" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Access: bus routes" }] }, { "content": [{ "text": "441, 442, 555" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Access: bus station" }] }, { "content": [{ "text": "Heathrow Central Bus Station" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Access: outside ULEZ" }] }, { "content": [{ "text": "Yes" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Access: ULEZ saving" }] }, { "content": [{ "text": "£12.50/day" }] }, { "content": [{ "text": "" }] }] }
      ],
      "width": 100,
      "borders": true
    },
    { "pageBreak": true },

    { "text": "Heathrow Proximity", "heading": 1 },
    {
      "rows": [
        { "cells": [{ "content": [{ "text": "Item" }], "shading": "DDDDDD" }, { "content": [{ "text": "Current Value" }], "shading": "DDDDDD" }, { "content": [{ "text": "Your Comments" }], "shading": "DDDDDD" }], "isHeader": true },
        { "cells": [{ "content": [{ "text": "Positioning claim" }] }, { "content": [{ "text": "Closest traditional British pub to Heathrow Airport" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Terminal 2: drive time" }] }, { "content": [{ "text": "11 minutes (traffic dependent)" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Terminal 3: drive time" }] }, { "content": [{ "text": "11 minutes (traffic dependent)" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Terminal 4: drive time" }] }, { "content": [{ "text": "12 minutes (traffic dependent)" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Terminal 5: drive time" }] }, { "content": [{ "text": "7 minutes (traffic dependent)" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "General range" }] }, { "content": [{ "text": "7-12 minutes" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Distance: Terminal 5" }] }, { "content": [{ "text": "3.8 miles" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Distance: Terminal 3" }] }, { "content": [{ "text": "5.3 miles" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Nearby from" }] }, { "content": [{ "text": "8 minutes from Staines" }] }, { "content": [{ "text": "" }] }] }
      ],
      "width": 100,
      "borders": true
    },
    { "pageBreak": true },

    { "text": "Digital", "heading": 1 },
    {
      "rows": [
        { "cells": [{ "content": [{ "text": "Item" }], "shading": "DDDDDD" }, { "content": [{ "text": "Current Value" }], "shading": "DDDDDD" }, { "content": [{ "text": "Your Comments" }], "shading": "DDDDDD" }], "isHeader": true },
        { "cells": [{ "content": [{ "text": "Domain: canonical" }] }, { "content": [{ "text": "https://www.the-anchor.pub" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Domain: note" }] }, { "content": [{ "text": "Always with www — Cloudflare + Vercel" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Domain: TLS" }] }, { "content": [{ "text": "Full or Full (strict) — never Flexible" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "SEO: default title" }] }, { "content": [{ "text": "The Anchor | Pub Near Heathrow | Stanwell Moor" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "SEO: title template" }] }, { "content": [{ "text": "%s | The Anchor Stanwell Moor" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "SEO: locale" }] }, { "content": [{ "text": "en_GB" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "SEO: canonical pattern" }] }, { "content": [{ "text": "Set alternates.canonical: './' on individual pages. NEVER hardcode canonical in root layout." }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Social: Facebook" }] }, { "content": [{ "text": "https://www.facebook.com/theanchorpubsm/" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Social: Instagram" }] }, { "content": [{ "text": "https://www.instagram.com/theanchor.pub/" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Social: WhatPub" }] }, { "content": [{ "text": "https://whatpub.com/pubs/SRY/14044/anchor-stanwell-moor" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Social: Twitter" }] }, { "content": [{ "text": "https://twitter.com/TheAnchor_Pub" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Social: LinkedIn" }] }, { "content": [{ "text": "https://linkedin.com/company/102814641" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Schema.org: types" }] }, { "content": [{ "text": "Restaurant, BarOrPub" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Schema.org: organization ID" }] }, { "content": [{ "text": "https://www.the-anchor.pub/#organization" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Schema.org: business ID" }] }, { "content": [{ "text": "https://www.the-anchor.pub/#business" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Logo: white transparent" }] }, { "content": [{ "text": "/images/branding/the-anchor-pub-logo-white-transparent.png" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Logo: black transparent" }] }, { "content": [{ "text": "/images/the-anchor-pub-logo-black-transparent.png" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Analytics: GTM ID" }] }, { "content": [{ "text": "GTM-WWFQTQS" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Analytics: Microsoft Clarity" }] }, { "content": [{ "text": "Yes" }] }, { "content": [{ "text": "" }] }] }
      ],
      "width": 100,
      "borders": true
    },
    { "pageBreak": true },

    { "text": "Brand Guidelines", "heading": 1 },
    {
      "rows": [
        { "cells": [{ "content": [{ "text": "Item" }], "shading": "DDDDDD" }, { "content": [{ "text": "Current Value" }], "shading": "DDDDDD" }, { "content": [{ "text": "Your Comments" }], "shading": "DDDDDD" }], "isHeader": true },
        { "cells": [{ "content": [{ "text": "Colour: primary" }] }, { "content": [{ "text": "Deep Green (#005131)" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Colour: secondary — Warm Gold" }] }, { "content": [{ "text": "#a57626" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Colour: secondary — Cream" }] }, { "content": [{ "text": "#f5e6d3" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Colour: secondary — Navy" }] }, { "content": [{ "text": "#2c3e50" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Colour: neutral — Off-White" }] }, { "content": [{ "text": "#f9f7f3" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Colour: neutral — Charcoal Grey" }] }, { "content": [{ "text": "#3a3a3a" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Typography: brand primary" }] }, { "content": [{ "text": "Century Gothic" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Typography: brand secondary" }] }, { "content": [{ "text": "The Absolute" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Typography: web primary" }] }, { "content": [{ "text": "Outfit (--font-outfit)" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Typography: web serif" }] }, { "content": [{ "text": "Merriweather (--font-merriweather, weights: 300/400/700/900)" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Voice: tone" }] }, { "content": [{ "text": "Friendly, Cheeky, Inclusive" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Voice: perspective" }] }, { "content": [{ "text": "Use 'we' language" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Voice: language" }] }, { "content": [{ "text": "British English" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Voice: notes" }] }, { "content": [{ "text": "Responds to local demographic change including growing Indian community" }] }, { "content": [{ "text": "" }] }] }
      ],
      "width": 100,
      "borders": true
    },
    { "pageBreak": true },

    { "text": "Venue", "heading": 1 },
    {
      "rows": [
        { "cells": [{ "content": [{ "text": "Item" }], "shading": "DDDDDD" }, { "content": [{ "text": "Current Value" }], "shading": "DDDDDD" }, { "content": [{ "text": "Your Comments" }], "shading": "DDDDDD" }], "isHeader": true },
        { "cells": [{ "content": [{ "text": "Capacity: maximum" }] }, { "content": [{ "text": "250" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Capacity: private hire" }] }, { "content": [{ "text": "10-200 guests" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Capacity: Christmas seated" }] }, { "content": [{ "text": "60" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Capacity: Christmas standing" }] }, { "content": [{ "text": "200" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Capacity: beer garden seats" }] }, { "content": [{ "text": "64" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Parking: free spaces" }] }, { "content": [{ "text": "20" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Parking: resolved" }] }, { "content": [{ "text": "20 is correct. lib/schema.ts ParkingFacility (50) must be updated." }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Parking: description" }] }, { "content": [{ "text": "Free on-site parking for pub guests. No fees, no time limit while visiting. Level surface, close to entrance. CCTV and floodlit." }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Parking: extended" }] }, { "content": [{ "text": "Additional parking available nearby" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Amenity: Free parking" }] }, { "content": [{ "text": "~20 spaces" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Amenity: Free WiFi" }] }, { "content": [{ "text": "Throughout pub and beer garden" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Amenity: Beer garden" }] }, { "content": [{ "text": "Under Heathrow flight path" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Amenity: Pool table" }] }, { "content": [{ "text": "Yes" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Amenity: Darts" }] }, { "content": [{ "text": "Yes" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Amenity: Jukebox" }] }, { "content": [{ "text": "Yes" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Amenity: Live sports on TV" }] }, { "content": [{ "text": "Terrestrial only: BBC/ITV/Channel 4" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Amenity: Luggage storage" }] }, { "content": [{ "text": "Yes" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Amenity: Private event space" }] }, { "content": [{ "text": "Function room" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Amenity: Dog friendly" }] }, { "content": [{ "text": "Water bowls and treats provided" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Amenity: Book exchange corner" }] }, { "content": [{ "text": "Yes" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Amenity: Board games" }] }, { "content": [{ "text": "Yes" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Amenity: Community notice board" }] }, { "content": [{ "text": "Yes" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Does NOT have: Sky Sports" }] }, { "content": [{ "text": "Confirmed — not available" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Does NOT have: TNT Sports" }] }, { "content": [{ "text": "Confirmed — not available" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Does NOT have: Breakfast service" }] }, { "content": [{ "text": "Confirmed — not available" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Does NOT have: Delivery service" }] }, { "content": [{ "text": "Confirmed — not available" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Does NOT have: Guest ales" }] }, { "content": [{ "text": "Confirmed — not available" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Does NOT have: Accessible toilet" }] }, { "content": [{ "text": "Confirmed — not available" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Does NOT have: EV charging" }] }, { "content": [{ "text": "Noted as 'coming soon' in blog content" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Smoking" }] }, { "content": [{ "text": "Outside only" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Payment accepted" }] }, { "content": [{ "text": "Cash, Credit Card, Debit Card, American Express, Contactless" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Currency" }] }, { "content": [{ "text": "GBP" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Price range" }] }, { "content": [{ "text": "££" }] }, { "content": [{ "text": "" }] }] }
      ],
      "width": 100,
      "borders": true
    },

    { "text": "Venue — Accessibility", "heading": 2 },
    {
      "rows": [
        { "cells": [{ "content": [{ "text": "Item" }], "shading": "DDDDDD" }, { "content": [{ "text": "Current Value" }], "shading": "DDDDDD" }, { "content": [{ "text": "Your Comments" }], "shading": "DDDDDD" }], "isHeader": true },
        { "cells": [{ "content": [{ "text": "Step-free: bar" }] }, { "content": [{ "text": "Yes" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Step-free: dining area" }] }, { "content": [{ "text": "Yes" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Step-free: beer garden" }] }, { "content": [{ "text": "Yes" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Step-free: car park" }] }, { "content": [{ "text": "Yes" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Accessible toilet" }] }, { "content": [{ "text": "No" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Assistance dogs" }] }, { "content": [{ "text": "Always welcome" }] }, { "content": [{ "text": "" }] }] },
        { "cells": [{ "content": [{ "text": "Note" }] }, { "content": [{ "text": "Guests are encouraged to call ahead if they would like to plan their visit." }] }, { "content": [{ "text": "" }] }] }
      ],

[truncated at line 200 — original has 902 lines]
```

### `lib/local-seo-data.ts`

```
export type LandmarkType = 'crematorium' | 'church' | 'registry_office' | 'hospital' | 'business_park' | 'sports_venue' | 'other';

export interface Landmark {
    slug: string;
    name: string;
    type: LandmarkType;
    address: string;
    distance: string; // e.g., "7 mins drive"
    googleMapsUrl?: string; // Optional direct link
    description: string; // Specific copy about the connection (e.g., "Easily accessible via A30")
}

export const landmarks: Landmark[] = [
    // Crematoriums & Cemeteries
    {
        slug: 'south-west-middlesex-crematorium',
        name: 'South West Middlesex Crematorium',
        type: 'crematorium',
        address: 'Hounslow Road, Feltham TW13 5JH',
        distance: '10 mins drive',
        description: 'Located just a short drive away, The Anchor provides a peaceful and respectful setting for post-service gatherings. We are easily accessible via the A30 and perimeter roads.'
    },
    {
        slug: 'staines-cemetery',
        name: 'Staines Cemetery',
        type: 'crematorium',
        address: 'London Road, Staines-upon-Thames TW18 4AJ',
        distance: '8 mins drive',
        description: 'A convenient and quiet location for families gathering after services at Staines Cemetery. Our private rooms offer a secluded space for reflection.'
    },
    {
        slug: 'slough-crematorium',
        name: 'Slough Cemetery and Crematorium',
        type: 'crematorium',
        address: 'Stoke Road, Slough SL2 5AX',
        distance: '15 mins drive',
        description: 'We welcome families from Slough Crematorium looking for a quality venue with ample free parking and flexible catering options.'
    },

    // Churches
    {
        slug: 'st-mary-the-virgin-stanwell',
        name: 'St Mary the Virgin, Stanwell',
        type: 'church',
        address: 'Church Road, Stanwell TW19 7HF',
        distance: '4 mins drive',
        description: 'We are the perfect neighbour for St Mary\'s, located just minutes away in Stanwell Moor. Ideal for christening receptions and post-service meals.'
    },
    {
        slug: 'our-lady-of-the-rosary-staines',
        name: 'Our Lady of the Rosary RC Church',
        type: 'church',
        address: '59 Gresham Road, Staines TW18 2BD',
        distance: '8 mins drive',
        description: 'After your ceremony at Our Lady of the Rosary, gather your friends and family at The Anchor for a celebratory meal or buffet.'
    },
    {
        slug: 'st-johns-church-egham',
        name: 'St John\'s Church, Egham',
        type: 'church',
        address: 'Manor Farm Lane, Egham TW20 9HL',
        distance: '10 mins drive',
        description: 'A short drive from Egham, offering a relaxed and welcoming atmosphere for church events and family celebrations.'
    },

    // Registry Offices & Wedding Venues
    {
        slug: 'staines-registration-office',
        name: 'Staines Registration Office',
        type: 'registry_office',
        address: 'The Library, Friends Walk, Staines TW18 4PG',
        distance: '9 mins drive',
        description: 'Avoid the town centre parking hassle. Come to The Anchor after your registry office ceremony for a relaxed wedding lunch or dinner with free parking for all guests.'
    },
    {
        slug: 'great-fosters-egham',
        name: 'Great Fosters',
        type: 'registry_office', // Using generic type for wedding venue ecosystem
        address: 'Stroude Road, Egham TW20 9UR',
        distance: '12 mins drive',
        description: 'Planning a wedding at Great Fosters? We are the ideal location for your rehearsal dinner, pre-wedding family meal, or day-after brunch.'
    },

    // Hospitals
    {
        slug: 'ashford-hospital',
        name: 'Ashford Hospital',
        type: 'hospital',
        address: 'London Road, Ashford TW15 3AA',
        distance: '8 mins drive',
        description: 'Conveniently located for medical teams and hospital staff looking for a venue for leaving dos, baby showers, or team lunches.'
    },

    // Business Parks
    {
        slug: 'bedfont-lakes',
        name: 'Bedfont Lakes Business Park',
        type: 'business_park',
        address: 'Bedfont Lakes, Feltham TW14 8HA',
        distance: '8 mins drive',
        description: 'Escape the office park canteen. We offer a professional yet relaxed environment for team meetings, client lunches, and corporate dinners.'
    },
    {
        slug: 'stockley-park',
        name: 'Stockley Park',
        type: 'business_park',
        address: 'Uxbridge UB11 1AQ',
        distance: '12 mins drive',
        description: 'Accessible via the M25 and local roads, we provide a great off-site location for Stockley Park businesses.'
    },

    // Additional Crematoriums
    {
        slug: 'kempton-park-crematorium',
        name: 'Kempton Park Crematorium',
        type: 'crematorium',
        address: 'Feltham Road, Hanworth TW13 4LY',
        distance: '12 mins drive',
        description: 'The Anchor offers a private, peaceful setting for families gathering after services at Kempton Park Crematorium — a straightforward 12-minute drive via the A316.'
    },

    // Additional Registry Offices
    {
        slug: 'windsor-register-office',
        name: 'Windsor Register Office',
        type: 'registry_office',
        address: 'King Edward Court, Windsor SL4 1DT',
        distance: '20 mins drive',
        description: 'After your ceremony at Windsor Register Office, The Anchor provides a relaxed venue for a celebratory meal or drinks reception, with free parking for all guests.'
    },
    {
        slug: 'spelthorne-registration-office',
        name: 'Spelthorne Registration Office',
        type: 'registry_office',
        address: 'Knowle Green, Staines TW18 1XB',
        distance: '9 mins drive',
        description: 'Just 9 minutes from Spelthorne Registration Office, The Anchor is perfectly placed for wedding breakfasts, naming ceremonies, and post-registration celebrations.'
    },

    // Airports
    {
        slug: 'heathrow-airport',
        name: 'Heathrow Airport',
        type: 'other',
        address: 'Heathrow Airport TW6',
        distance: '7 mins drive',
        description: 'The Anchor is 7 minutes from Heathrow Terminal 5 — ideal for airport staff events, farewell dinners, and gatherings for those travelling or arriving at Heathrow.'
    },

    // Sports Venues
    {
        slug: 'staines-rugby-club',
        name: 'Staines Rugby Football Club',
        type: 'sports_venue',
        address: 'Snakey Lane, Feltham TW13 7NB',
        distance: '10 mins drive',
        description: 'The perfect spot for end-of-season dinners, committee meetings, or team socials near Staines RFC.'
    },
    {
        slug: 'ashford-town-fc',
        name: 'Ashford Town (Middx) FC',
        type: 'sports_venue',
        address: 'Short Lane, Stanwell TW19 7BH',
        distance: '6 mins drive',
        description: 'Just down the road from the club, we host team presentations, supporter meet-ups, and committee dinners.'
    }
];

export function getLandmarkBySlug(slug: string): Landmark | undefined {
    return landmarks.find(l => l.slug === slug);
}

export function getLandmarksByType(type: LandmarkType): Landmark[] {
    return landmarks.filter(l => l.type === type);
}
```

### `lib/schema-with-reviews.ts`

```
import { unstable_cache } from 'next/cache'
import { organizationSchema, webSiteSchema } from './schema'
import { DEFAULT_PAGE_HEADER_IMAGE, DEFAULT_FOOD_IMAGE } from './image-fallbacks'
import { anchorAPI } from './api'
import { buildOpeningHoursSchema } from './opening-hours-schema'
import { DEFAULT_REVIEW_STATS } from './google/review-utils'

const getBusinessStatsCached = unstable_cache(
  async () => {
    let rating = DEFAULT_REVIEW_STATS.rating
    let reviewCount = DEFAULT_REVIEW_STATS.totalReviews
    let openingHours: ReturnType<typeof buildOpeningHoursSchema> = []

    try {
      const hours = await anchorAPI.getBusinessHours()
      openingHours = buildOpeningHoursSchema(hours?.regularHours)
    } catch (error) {
      console.warn('Failed to fetch opening hours for schema, omitting hours:', error)
    }

    return { rating, reviewCount, openingHours }
  },
  ['business-stats'],
  { revalidate: 300 }
)

export async function getBusinessStats() {
  return getBusinessStatsCached()
}

const getEnhancedSchemasCached = unstable_cache(
  async () => {
    const stats = await getBusinessStatsCached()
    const { rating, reviewCount, openingHours } = stats

    const defaultImages = [
      `https://www.the-anchor.pub${DEFAULT_PAGE_HEADER_IMAGE}`,
      'https://www.the-anchor.pub/images/garden/beer-garden/the-anchor-beer-garden-heathrow-flight-path.jpg',
      `https://www.the-anchor.pub${DEFAULT_FOOD_IMAGE}`
    ]

    const localBusinessSchemaWithReviews = {
      "@context": "https://schema.org",
      "@type": ["Restaurant", "BarOrPub"],
      "@id": "https://www.the-anchor.pub/#business",
      "name": "The Anchor",
      "description": "The closest traditional British pub to Heathrow Airport. Famous Sunday roasts, beer garden under the flight path, and FREE parking for all guests.",
      "image": defaultImages,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Horton Road",
        "addressLocality": "Stanwell Moor",
        "addressRegion": "Surrey",
        "postalCode": "TW19 6AQ",
        "addressCountry": "GB"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 51.462509,
        "longitude": -0.502067
      },
      "url": "https://www.the-anchor.pub",
      "telephone": "+441753682707",
      "sameAs": [
        "https://www.facebook.com/theanchorpubsm/",
        "https://www.instagram.com/theanchor.pub/",
        "https://whatpub.com/pubs/SRY/14044/anchor-stanwell-moor"
      ],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": rating,
        "reviewCount": reviewCount,
        "bestRating": "5",
        "worstRating": "1"
      },
      "priceRange": "££",
      "servesCuisine": ["British", "Pizza", "Pub Food", "Sunday Roast"],
      ...(openingHours.length ? { "openingHoursSpecification": openingHours } : {}),
      "hasMenu": "https://www.the-anchor.pub/food-menu",
      "acceptsReservations": true,
      "amenityFeature": [
        { "@type": "LocationFeatureSpecification", "name": "Free Parking", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Dog Friendly", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Family Friendly", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Wheelchair Accessible", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Free WiFi", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Beer Garden", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Live Entertainment", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Plane Spotting", "value": true }
      ],
      "paymentAccepted": ["Cash", "Credit Card", "Debit Card", "Contactless"],
      "currenciesAccepted": "GBP",
      "menu": "https://www.the-anchor.pub/food-menu",
      "smokingAllowed": false,
      "containedInPlace": {
        "@type": "AdministrativeArea",
        "name": "Stanwell Moor",
        "containedInPlace": {
          "@type": "AdministrativeArea",
          "name": "Surrey",
          "containedInPlace": {
            "@type": "Country",
            "name": "United Kingdom"
          }
        }
      },
      "potentialAction": {
        "@type": "ReserveAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://www.the-anchor.pub/book-table",
          "actionPlatform": [
            "https://schema.org/DesktopWebPlatform",
            "https://schema.org/MobileWebPlatform"
          ]
        },
        "result": {
          "@type": "FoodEstablishmentReservation"
        }
      }
    }

    return {
      organizationSchema,
      localBusinessSchema: localBusinessSchemaWithReviews,
      webSiteSchema
    }
  },
  ['enhanced-schemas'],
  { revalidate: 300 }
)

export async function getEnhancedSchemas() {
  return getEnhancedSchemasCached()
}
```

### `lib/schema.ts`

```
import { DEFAULT_PAGE_HEADER_IMAGE, DEFAULT_FOOD_IMAGE } from './image-fallbacks'

const DEFAULT_SCHEMA_IMAGES = [
  `https://www.the-anchor.pub${DEFAULT_PAGE_HEADER_IMAGE}`,
  'https://www.the-anchor.pub/images/garden/beer-garden/the-anchor-beer-garden-heathrow-flight-path.jpg',
  `https://www.the-anchor.pub${DEFAULT_FOOD_IMAGE}`
]

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://www.the-anchor.pub/#organization",
  "name": "The Anchor",
  "url": "https://www.the-anchor.pub",
  "logo": "https://www.the-anchor.pub/images/the-anchor-pub-logo-black-transparent.png",
  "sameAs": [
    "https://www.facebook.com/theanchorpubsm/",
    "https://www.instagram.com/theanchor.pub/",
    "https://whatpub.com/pubs/SRY/14044/anchor-stanwell-moor"
  ],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Horton Road",
    "addressLocality": "Stanwell Moor",
    "addressRegion": "Surrey",
    "postalCode": "TW19 6AQ",
    "addressCountry": "GB"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 51.462509,
    "longitude": -0.502067
  },
  "telephone": "+441753682707",
  "email": "manager@the-anchor.pub"
}

export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["Restaurant", "BarOrPub"],
  "@id": "https://www.the-anchor.pub/#business",
  "name": "The Anchor",
  "image": DEFAULT_SCHEMA_IMAGES,
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Horton Road",
    "addressLocality": "Stanwell Moor",
    "addressRegion": "Surrey",
    "postalCode": "TW19 6AQ",
    "addressCountry": "GB"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 51.462509,
    "longitude": -0.502067
  },
  "url": "https://www.the-anchor.pub",
  "telephone": "+441753682707",
  "priceRange": "££",
  "servesCuisine": ["British", "Pizza", "Pub Food"],
  "acceptsReservations": "true",
  "menu": "https://www.the-anchor.pub/food-menu",
  "hasMenu": {
    "@type": "Menu",
    "name": "The Anchor Menu",
    "url": "https://www.the-anchor.pub/food-menu"
  },
  "amenityFeature": [
    {
      "@type": "LocationFeatureSpecification",
      "name": "Free Parking",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification", 
      "name": "Wheelchair Accessible",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification",
      "name": "Beer Garden",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification",
      "name": "Dog Friendly",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification",
      "name": "Free WiFi",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification",
      "name": "Pool Table",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification",
      "name": "Darts",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification",
      "name": "Outside ULEZ Zone",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification",
      "name": "Luggage Storage",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification",
      "name": "Live Sports on TV",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification",
      "name": "Private Event Space",
      "value": true
    }
  ],
  "paymentAccepted": ["Cash", "Credit Card", "Debit Card", "American Express"],
  "currenciesAccepted": "GBP",
  "publicAccess": true,
  "isAccessibleForFree": true,
  "maximumAttendeeCapacity": 250,
  "smokingAllowed": false,
  "keywords": "pub near Heathrow, restaurant Stanwell Moor, British food Surrey, beer garden, dog friendly pub",
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "telephone": "+441753682707",
      "contactType": "customer service",
      "areaServed": "GB",
      "availableLanguage": ["English"]
    },
    {
      "@type": "ContactPoint",
      "telephone": "+441753682707",
      "contactType": "reservations",
      "areaServed": "GB",
      "availableLanguage": ["English"]
    }
  ],
  "areaServed": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": 51.462509,
      "longitude": -0.502067
    },
    "geoRadius": "16000"
  }
}

export const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://www.the-anchor.pub/#website",
  "url": "https://www.the-anchor.pub",
  "name": "The Anchor Stanwell Moor",
  "description": "Traditional British pub near Heathrow with quiz nights, hosted events, and famous Sunday roasts",
  "publisher": {
    "@id": "https://www.the-anchor.pub/#organization"
  }
}

export const restaurantSchema = localBusinessSchema

// Event Series Schemas for Regular Events
export const quizNightEventSeries = {
  "@context": "https://schema.org",
  "@type": "EventSeries",
  "@id": "https://www.the-anchor.pub/#quiz-night-series",
  "name": "Monthly Quiz Night at The Anchor",
  "description": "Test your knowledge at our popular monthly quiz night. 3 entry, teams up to 6, great prizes including a 25 bar voucher for winners.",
  "startDate": "2024-01-01",
  "endDate": "2026-12-31",
  "eventSchedule": {
    "@type": "Schedule",
    "repeatFrequency": "P1M",
    "startTime": "19:00:00",
    "endTime": "22:00:00",
    "scheduleTimezone": "Europe/London"
  },
  "location": {
    "@type": "Place",
    "name": "The Anchor",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Horton Road",
      "addressLocality": "Stanwell Moor",
      "addressRegion": "Surrey",
      "postalCode": "TW19 6AQ",
      "addressCountry": "GB"
    }
  },

[truncated at line 200 — original has 524 lines]
```

### `tasks/implement-plan/wave-1/blog-template-cta/handoff.md`

```
# Blog Template Heathrow Booking CTA — Handoff

## Files Modified

- `app/blog/[slug]/page.tsx` — sole modified file

## What Changed

### 1. Import added
`BookTableButton` imported from `@/components/BookTableButton`.

### 2. Condition logic (lines ~88–103 in final file)

```ts
const HEATHROW_CTA_TAGS = new Set([
  'heathrow', 'plane-spotting', 'parking', 'travel',
])
const HEATHROW_SLUG_KEYWORDS = ['heathrow', 'plane', 'parking', 'aviation', 'airport', 'layover']

function shouldShowHeathrowBookingCta(slug: string, tags: string[]): boolean {
  if (tags.some((tag) => HEATHROW_CTA_TAGS.has(tag))) return true
  return HEATHROW_SLUG_KEYWORDS.some((kw) => slug.includes(kw))
}
```

**Why dual check?** Several Heathrow posts (e.g. `plane-spotting-heathrow-guide`) use only generic tags (`community`, `guides`) but their slug clearly identifies them. A slug-only check would be too broad; a tag-only check would miss those posts.

`showHeathrowCta` is derived from this function and used in two JSX locations.

### 3. Mid-content booking CTA block (inserted between article and share section)
- Only renders when `showHeathrowCta === true`
- Two-column layout: headline + description on left, CTA buttons on right
- `BookTableButton` with `source="blog_heathrow_cta"`, `context="heathrow_visitor"`
- Link to `/food-menu`

### 4. Footer CTA section updated
- When `showHeathrowCta === true`: shows **Book a Table** (BookTableButton), **View Food Menu** (link), **Get Directions** (link)
- When `showHeathrowCta === false`: original **Get Directions** + **More Stories** unchanged

## Tags That Trigger the CTA

| Trigger type | Values |
|---|---|
| Tags | `heathrow`, `plane-spotting`, `parking`, `travel` |
| Slug keywords | `heathrow`, `plane`, `parking`, `aviation`, `airport`, `layover` |

## Posts where CTA WILL appear (sample)
- `heathrow-plane-spotting-locations` — tag `heathrow` + `plane-spotting`
- `plane-spotting-heathrow-guide` — slug contains `plane` + `heathrow`
- `cheap-heathrow-parking-alternatives` — tag `heathrow` + `parking`
- `heathrow-layover-guide` — tag `travel`, slug contains `heathrow` + `layover`
- `best-places-to-eat-near-heathrow` — slug contains `heathrow`
- `things-to-do-near-heathrow-between-flights` — tag `heathrow`

## Posts where CTA WILL NOT appear (sample)
- `tequila-and-tradition-...` — tags: `news`, `food-and-drink`; slug: no keywords
- `pet-ownership-benefits` — tags: `community`, `news`; slug: no keywords
- `30th-birthday-party-ideas-venues` — tags: none matching; slug: no keywords

## No prices hardcoded
No prices referenced. CTA copy is entirely text-based.
```

### `tasks/implement-plan/wave-1/brand-local-pages/handoff.md`

```
# Handoff: Brand & Local Pages + Homepage Schema

**Status:** Complete  
**Date:** 2026-04-21

## Changes Made

### Task 1: Homepage Meta Update (`app/layout.tsx`)
- `title.default` updated to: "The Anchor Pub | Stanwell Moor | Near Heathrow" (52ch)
- `description` updated to include 4.6/5 rating, 7 mins from T5, Sunday roasts, quiz nights, karaoke Fridays, beer garden & free parking
- No `alternates.canonical` added to root layout (documented historical bug avoided)

### Task 2: /stanwell-pub (`app/stanwell-pub/page.tsx`)
- Title updated to: "The Anchor | Stanwell Moor Pub | Rated 4.6★ on Google" (55ch)
- Description updated to: local-first copy with rating, Sunday roasts from £19, stone-baked pizzas, dog-friendly beer garden, quiz nights & free parking
- H1 (`PageTitle`) changed from "Stanwell Pub - Traditional British Pub in Stanwell Moor" to "Your Local Pub in Stanwell Moor"

### Task 3: /near-heathrow (`app/near-heathrow/page.tsx`)
- Title updated to: "Pub Near Heathrow Airport | 7 Mins from T5 | The Anchor" (57ch) — singular "Pub" (not "Pubs")
- Description updated to include rating, 7 mins from T5, free parking, beer garden, Sunday roasts, quiz nights & live events

### Task 4: Homepage LocalBusiness Schema (`lib/schema-with-reviews.ts`)
- `sameAs` array added to `localBusinessSchemaWithReviews` with Facebook, Instagram, and WhatPub profile URLs
- `aggregateRating` and `openingHoursSpecification` were already present in the existing schema
- Schema is rendered globally via `DynamicSchema` component in `app/layout.tsx` `<head>`

## Key Findings
- The homepage LocalBusiness schema is rendered via `components/seo/DynamicSchema.tsx` (in `<head>` of root layout), which calls `getEnhancedSchemas()` from `lib/schema-with-reviews.ts` — not from `app/page.tsx`
- `aggregateRating` and `openingHoursSpecification` were already present; only `sameAs` was missing
- Social profile URLs sourced from `lib/schema.ts` `organizationSchema.sameAs` (canonical source)

## Files Modified
- `app/layout.tsx`
- `app/stanwell-pub/page.tsx`
- `app/near-heathrow/page.tsx`
- `lib/schema-with-reviews.ts`
```

### `tasks/implement-plan/wave-1/events-pages/handoff.md`

```
# Events Pages — Wave 1 Handoff

## Status: Complete

## Task 1: Meta Rewrites — DONE

All 5 event pages updated with exact recommended titles and descriptions:

| Page | Title | Description |
|------|-------|-------------|
| `/whats-on` | "Quiz, Karaoke & Bingo Every Week \| The Anchor Pub" | Updated |
| `/karaoke` | "Karaoke Fridays Near Heathrow \| Free Entry \| The Anchor" | Updated |
| `/quiz-night` | "Pub Quiz Near Heathrow \| £3 Entry, Cash Prizes \| The Anchor" | Updated |
| `/music-bingo` | "Music Bingo Near Heathrow \| Win Every Round \| The Anchor" | Updated |
| `/live-sport` | "Watch Live Sport Near Heathrow \| Big Screens \| The Anchor" | Updated |

Note: `/live-music` was not in the meta rewrite spec — metadata left unchanged.

OpenGraph and Twitter card titles/descriptions on quiz-night were also updated to match.

## Task 2: Quiz Night Date Prefill — DONE

The booking page (`app/book-table/page.tsx`) **does** support `date` via searchParams (confirmed: `searchParams.date` is read and passed to the booking form).

Implementation: Added `bookingHref` variable in `QuizNightPage` that extracts `YYYY-MM-DD` from `nextEvent.startDate.slice(0, 10)` and passes it as `customHref` to the hero `BookTableButton`. Falls back to `/book-table` if no upcoming event exists.

File modified: `app/quiz-night/page.tsx`

## Task 3: /whats-on Per-Event Booking Links — BLOCKED (by design)

The `/whats-on` page renders upcoming events via the `FilteredUpcomingEvents` / `FilteredUpcomingEventsClient` shared component. Adding per-event booking links (`/book-table?date=YYYY-MM-DD`) to these cards would require modifying the shared client component, which is out of scope for this agent's ownership.

The monthly highlights cards already link to event detail pages (`/events/{slug}`) or category pages (e.g., `/music-bingo`), which contain their own booking CTAs.

**Recommendation for follow-up:** Modify `FilteredUpcomingEventsClient` to add a "Reserve a Table" link on future-dated event cards, linking to `/book-table?date={ISO_DATE}`.

## Task 4: EventSeries Schema on /live-music — DONE

Added `liveMusicEventSeries` export to `lib/schema.ts` (following the same pattern as `quizNightEventSeries` and `bingoEventSeries`).

Injected the schema as a `<script type="application/ld+json">` block at the top of the `LiveMusicPage` return statement in `app/live-music/page.tsx`.

Files modified:
- `lib/schema.ts` — new `liveMusicEventSeries` export
- `app/live-music/page.tsx` — added imports (`liveMusicEventSeries`, `jsonLdSafeStringify`) and schema injection

## Files Modified

- `app/whats-on/page.tsx`
- `app/karaoke/page.tsx`
- `app/quiz-night/page.tsx`
- `app/music-bingo/page.tsx`
- `app/live-sport/page.tsx`
- `app/live-music/page.tsx`
- `lib/schema.ts`

## Self-Check

- [x] All 5 event page meta titles updated to exact recommended text
- [x] All 5 event page meta descriptions updated
- [x] Quiz-night booking date prefill implemented (hero BookTableButton uses `customHref=/book-table?date=YYYY-MM-DD`)
- [x] /whats-on booking links documented as blocked (shared component scope)
- [x] EventSeries schema added to /live-music
- [x] TypeScript: no new type errors in modified files
```

### `tasks/implement-plan/wave-1/food-booking-pages/handoff.md`

```
# Handoff: Food & Booking Pages — Meta, CTAs, Schema

**Status:** Complete  
**Date:** 2026-04-21

## Changes Made

### Task 1: Meta Rewrites

**`/book-table`** (`app/book-table/page.tsx`)
- Title: "Book a Table Near Heathrow | Sunday Roast | The Anchor" (57ch) ✓
- Description: "Reserve your table at The Anchor, Stanwell Moor — instant confirmation. Pub food from £8.95, Sunday roast from £19. Dog-friendly, free parking, 7 mins from T5." ✓
- Updated across `metadata`, `openGraph`, and `twitter` blocks.

**`/sunday-lunch`** (`app/sunday-lunch/page.tsx`)
- Title: "Sunday Roast Near Heathrow | From £19 | Book by Saturday" (58ch) ✓
- Description: "Traditional Sunday roast from £19 at The Anchor, Stanwell Moor. Chicken, pork belly & veggie options. Must book by Saturday 1pm. Free parking, 7 mins from T5." ✓
- Updated across `metadata`, `openGraph`, and `twitter` blocks.

**`/food-menu`** (`app/food-menu/page.tsx`)
- Description already contained "Book a table" — updated to "Book a table online." for stronger action signal. ✓

### Task 2: /book-table Hero CTA Swap

- Primary CTA is now a "Book Online" button anchored to `#booking-form` (scroll to form).
- Secondary CTA is now the `PhoneButton` ("Prefer to call? 01753 682707") with `variant="outline"`.
- The booking form `<Section>` now has `id="booking-form"` so the anchor resolves correctly.
- "Find Us" link was removed from the secondary CTA position as part of this swap.

### Task 3: /food-menu and /food-menu/gluten-free — BookTableButton Added to Footer CTA

Both pages now have a "Book a Table" button as the **first** button in the footer `CTASection`:
- `/food-menu` footer CTA: Book a Table → Call → View Drinks Menu
- `/food-menu/gluten-free` footer CTA: Book a Table → Call → View Full Menu

The button uses `/book-table` as its href and renders as a standard CTA link (the CTASection component detects booking buttons via `ordertab.menu` href — since this links to the internal wizard at `/book-table`, it renders as a styled link button, which is correct).

### Task 4: /sunday-lunch — Price Badge Added to Hero

Added `{ label: 'From £19pp', variant: 'success' }` as the first tag in the HeroWrapper `tags` array. This renders as a green badge in the hero tag strip, clearly communicating entry price before booking.

Note: Price is not hardcoded in a constant — it matches the `FALLBACK_MENU` mains data and existing copy throughout the page. No SSOT constant for this price was found in the codebase.

### Task 5: Restaurant/Menu Schema on Dietary Pages

All three dietary pages now have Restaurant + Menu + FAQPage schema:

**`/food-menu/gluten-free`**
- Previously: FAQPage schema only
- Now: FAQPage + Restaurant (with `hasMenu` pointing to gluten-free menu URL) ✓

**`/food-menu/vegan`**
- Previously: No schema at all
- Now: FAQPage + Restaurant (with `hasMenu` pointing to vegan menu URL) ✓
- Added `import { jsonLdSafeStringify } from '@/lib/jsonld'`

**`/food-menu/vegetarian`**
- Previously: No schema at all
- Now: FAQPage + Restaurant (with `hasMenu` pointing to vegetarian menu URL) ✓
- Added `import { jsonLdSafeStringify } from '@/lib/jsonld'`

The Restaurant schema on all dietary pages uses `@id: 'https://www.the-anchor.pub/#business'` to match the main food-menu page's entity identity.

## Files Modified

- `app/book-table/page.tsx`
- `app/sunday-lunch/page.tsx`
- `app/food-menu/page.tsx`
- `app/food-menu/gluten-free/page.tsx`
- `app/food-menu/vegan/page.tsx`
- `app/food-menu/vegetarian/page.tsx`

## Verification

- `npx tsc --noEmit` — zero errors in modified files (pre-existing test file errors unrelated to these changes)
- All imports follow existing patterns in the codebase

## Self-Check

- [x] /book-table meta title and description updated
- [x] /sunday-lunch meta title and description updated
- [x] /food-menu description updated (includes "Book a table online")
- [x] /book-table hero CTA priority swapped (booking over phone)
- [x] /food-menu and /food-menu/gluten-free have BookTableButton in footer CTA
- [x] /sunday-lunch has price badge in hero (From £19pp tag)
- [x] Dietary pages have Restaurant/Menu schema
```

### `tasks/implement-plan/wave-1/private-hire/handoff.md`

```
# Private Hire — Meta, Content, New Pages, Schema — Handoff

## Status: Complete

All tasks from the agent brief have been implemented.

---

## Changes Made

### Task 1: Meta Rewrites

**`/private-hire/wakes`** (`app/private-hire/wakes/page.tsx`)
- Title: "Wake & Funeral Reception Venue | Near Heathrow | The Anchor" (55ch)
- Description: "Private room for wakes, funeral teas & celebrations of life near Staines & Heathrow. Up to 50 guests, buffet packages from £12pp, free parking. Compassionate staff."
- Description is dynamic — price is pulled from the API; £12 is fallback only.

**`/private-hire/christenings`** (`app/private-hire/christenings/page.tsx`)
- Title: "Christening Venue Near Heathrow & Staines | The Anchor" (56ch)
- Description: "Private room for christening parties & baptism receptions at The Anchor, Stanwell Moor. Up to 50 guests, buffet options, family-friendly, free parking. Near Heathrow."

**`/private-hire` hub** (`app/private-hire/page.tsx`)
- Title: "Private Hire Venue Near Heathrow | Wakes, Parties & Events | The Anchor"
- Updated in `generateMetadata()`, openGraph title, and twitter title.
- "Function Room" wording removed from title to resolve cannibalisation with `/function-room-hire`.

---

### Task 2: Wakes Content Expansion (`app/private-hire/wakes/page.tsx`)

Two new H2 sections added before the FAQ accordion:

1. **"Near Slough Crematorium"** — ~130 words. Covers 12-minute drive time, M25 J14 approach, free parking, flexible timing for cremation overruns. Empathetic, practical, not sales-y.
2. **"Near Staines Cemetery"** — ~130 words. Covers 8-minute drive, B378 route, public transport option, serves Staines/Ashford/Laleham/Shepperton catchment.

Both sections include a direct phone link (`tel:+441753682707`).

---

### Task 2 (food-menu link): Catering Packages Section

Added internal link to `/food-menu` in the "Wake Reception Packages" prose block:
> "Guests who choose to stay on after the reception are welcome to order from our full food menu at their leisure."

---

### Task 3: Wakes Enquiry Form

The wakes page already had `<PrivateBookingSection eventType="Wake / Memorial" />` mounted on it — the enquiry form is already present. Two fixes applied:

1. Added `id="enquiry"` to the `PrivateBookingSection` call so the anchor `#enquiry` works correctly on the wakes page itself.
2. Changed the hero "Enquire Online" button link from `/private-hire#enquiry` to `#enquiry` so it scrolls to the form on the same page rather than navigating away.

No new API routes were created. The form uses the existing management API proxy pattern via `PrivateBookingSection` / `PrivateBookingCalculator`.

**No action needed** — reusable component was already in place.

---

### Task 4: New Landmarks (`lib/local-seo-data.ts`)

Four entries added matching the exact `Landmark` interface:

| Slug | Name | Type | Distance |
|------|------|------|----------|
| `kempton-park-crematorium` | Kempton Park Crematorium | `crematorium` | 12 mins drive |
| `windsor-register-office` | Windsor Register Office | `registry_office` | 20 mins drive |
| `spelthorne-registration-office` | Spelthorne Registration Office | `registry_office` | 9 mins drive |
| `heathrow-airport` | Heathrow Airport | `other` | 7 mins drive |

`'other'` was already in the `LandmarkType` union so no type changes were required.

Note: `spelthorne-registration-office` uses postcode TW18 1XB (Knowle Green, Staines). The brief listed TW18 without a full postcode; TW18 1XB is the known postcode for Knowle Green.

---

### Task 5: EventVenue Schema on /private-hire Hub (`app/private-hire/page.tsx`)

JSON-LD `EventVenue` schema added to the hub page using the same pattern as wakes and christenings pages:
- Venue name, full postal address, telephone from `CONTACT` constants
- `maximumAttendeeCapacity: 50`
- `amenityFeature` array: Free Parking, Wheelchair Accessible, Catering, Private Dining Room, AV Equipment, WiFi, Private Bar
- `potentialAction` as `ReserveAction` pointing to `https://www.the-anchor.pub/private-hire#enquiry`
- Required imports added: `CONTACT`, `BRAND` from `@/lib/constants` and `jsonLdSafeStringify` from `@/lib/jsonld`

---

## Files Modified

- `app/private-hire/page.tsx`
- `app/private-hire/wakes/page.tsx`
- `app/private-hire/christenings/page.tsx`
- `lib/local-seo-data.ts`

---

## Self-Check

- [x] /private-hire/wakes meta updated
- [x] /private-hire/christenings meta updated with "Heathrow" added
- [x] /private-hire hub title changed to remove "Function Room" overlap
- [x] Wakes page has 2 new crematorium proximity sections (Slough + Staines)
- [x] Wakes page has food-menu internal link
- [x] Wakes enquiry resolved — PrivateBookingSection already present, fixed anchor link and added id prop
- [x] 4 new landmarks added to local-seo-data.ts with correct data structure
- [x] EventVenue schema added to /private-hire hub

---

## TypeScript

No new type errors introduced. Pre-existing errors in test files (unrelated to these changes) remain unchanged.
```

### `tasks/implement-plan/wave-1/technical-foundation/handoff.md`

```
# Technical Foundation — Wave 1 Handoff

**Completed:** 2026-04-21

## Files Modified

| File | Change |
|------|--------|
| `app/robots.ts` | No change needed — already had `allow: ['/', '/_next/static/']` and `/cdn-cgi/` in disallow |
| `app/sitemap.ts` | Updated `STATIC_LAST_MODIFIED` from `2026-03-20` to `2026-04-21` |
| `config/redirects/wix-redirects.json` | Fixed 2 redirect chains: `/post/euro-2024-stanwell-moor-staines` and `/post/autumn-internationals-2024-fixtures-key-matches` now point directly to `/live-sport` instead of intermediate blog posts |
| `config/redirects/blog-redirects.json` | Removed 39 duplicate source entries that also existed in `wix-redirects.json` (159 entries remain, down from 198) |

## Directories Deleted

All 10 test/debug route directories were already deleted from the filesystem prior to this session (showing as `D` in git status):

- `app/test-simple/`
- `app/test-tracking/`
- `app/test-reviews/`
- `app/test-gtm/`
- `app/test-navigation-tracking/`
- `app/test-hours/`
- `app/gtm-debug/`
- `app/debug-hours/`
- `app/demo-header/`
- `app/components/` (confirmed NOT the shared components dir — does not exist as a filesystem directory)

These deletions need to be staged: `git add -A app/test-simple app/test-tracking app/test-reviews app/test-gtm app/test-navigation-tracking app/test-hours app/gtm-debug app/debug-hours app/demo-header app/components`

## Verification

- `app/sitemap-page/page.tsx` — no links to deleted test pages (confirmed clean)
- `scripts/audit-hero.js` — no references to deleted test pages (confirmed clean)
- Redirect chains eliminated: both sport blog posts now resolve in 1 hop to `/live-sport`
- Duplicate redirect sources removed: wix-redirects loads first and wins, blog-redirects no longer has conflicts

## Issues / Notes

- Task 1 (robots.ts) was already correctly configured — no code change required.
- The `app/components/` directory listed in git status refers to a route page (`page.tsx` + `head.tsx`), not the shared components directory at `components/` (project root level). The route version was already deleted.
```

### `tasks/review-book-table/phase-1/business-rules-auditor/report.md`

```
# Business Rules Auditor Report — Book Table Form

**Date**: 2026-03-21
**Target**: `/book-table` page, `ManagementTableBookingForm`, submission APIs
**Verdict summary**: 2 incorrect, 3 partially correct, 1 contradicted, multiple policy drift items

---

## 1. Rules Inventory

### R1: Deposit — groups of 7+
- **Rule**: £10 deposit per person for groups of 7 or more
- **Source**: CLAUDE.md domain rules, `lib/constants.ts` line 54
- **Code location**: `ManagementTableBookingForm.tsx` line 600 (`requiresGroupDeposit = !requiresSundayLunchDeposit && partySize >= 7`)
- **Verdict**: **Correct** — threshold is 7, rate is £10/person, deposit text is accurate

### R2: Deposit — all Sunday lunch bookings
- **Rule**: £10 deposit per person for ALL Sunday lunch bookings regardless of party size
- **Source**: CLAUDE.md domain rules, `lib/constants.ts` line 62-63
- **Code location**: `ManagementTableBookingForm.tsx` line 599 (`requiresSundayLunchDeposit = mothersDayMode || (selectedDateIsSunday && sundayLunch)`)
- **Verdict**: **Correct** — applies to all Sunday lunch regardless of size

### R3: Deposits deducted from final bill
- **Rule**: Deposits are deducted from the final bill
- **Source**: CLAUDE.md domain rules
- **Code locations**:
  - `page.tsx` line 210: "This is deducted from your final bill" (sidebar, groups)
  - `page.tsx` line 211: Sunday lunch constant includes "deducted from your final bill"
  - Form line 2223: "This deposit is deducted from your final bill" (Sunday lunch review)
  - Form line 2227: "This is deducted from your final bill" (group deposit review)
  - `PayPalDepositSection.tsx` line 54: shows "(£10 per person)" but does NOT say deducted
- **Verdict**: **Partially correct** — PayPalDepositSection (the actual payment screen) omits "deducted from your final bill" messaging, which is the most critical place to reassure the customer

### R4: No "credit card hold" / "card hold" language
- **Rule**: Legacy "credit card hold" language anywhere is ALWAYS a bug
- **Source**: CLAUDE.md domain rules
- **Code location**: `app/api/booking/agent/route.ts` line 154
- **Verdict**: **INCORRECT — BUG FOUND**
  - Line 154: `'Sunday lunch roasts must be pre-ordered by 1pm Saturday. Bookings of 7+ require a card hold to secure the booking (no charge).'`
  - This says "card hold" and "(no charge)" — both are factually wrong. It IS a deposit. It IS a charge (£10/person). This text is returned to AI agents who relay it to customers.

### R5: Party size limits — frontend max 50, backend max 20
- **Rule**: Frontend allows 1-50, backend API rejects >20
- **Source**: Brief, `lib/booking-config.ts` line 17, `app/api/table-bookings/route.ts` line 269
- **Code locations**:
  - Form line 529: `Math.min(Math.max(..., 1), 50)` — frontend cap is 50
  - Form line 1643-1644: `min={1} max={50}` — HTML input allows 1-50
  - API route line 269: `payload.party_size > 20` — backend rejects >20
  - `booking-config.ts` line 17: `maxOnlinePartySize: 20`
- **Verdict**: **INCORRECT — SILENT FAILURE**
  - Customer can select party size 21-50 in the form. They go through all 4 steps, enter personal details, agree to policy, hit confirm — then get a generic error. The form never warns them that online booking maxes at 20.
  - The `too_large_party` blocked reason copy (line 123) says "For larger groups, please call us" but this requires the backend to return `too_large_party` as blocked_reason — the 400 validation error may not use this code path.

### R6: Kitchen hours enforcement
- **Rule**: Tue-Fri 6pm-9pm, Sat 1pm-7pm, Sun 1pm-6pm, Mon CLOSED
- **Source**: CLAUDE.md, `page-old.tsx` lines 207-215
- **Code location**: `lib/table-booking-service-windows.ts` — dynamically resolved from `businessHours` API data, not hardcoded
- **Verdict**: **Correct approach** — hours come from a live API (`anchorAPI.getBusinessHours()`), validated server-side in both submission routes. The form checks availability before showing slots, so out-of-hours bookings are prevented at the slot selection stage.

### R7: Sunday lunch pre-order cutoff — 1pm Saturday (London time)
- **Rule**: Sunday lunch pre-orders close at 1pm Saturday
- **Source**: CLAUDE.md domain rules
- **Code location**: `lib/sunday-lunch-cutoff.ts` lines 3-5 (`SUNDAY_LUNCH_CUTOFF_HOUR = 13`), line 35 (`addDaysIsoDate(isoSundayDate, -1)` = Saturday)
- **Verdict**: **Correct** — cutoff is 13:00 London time on the Saturday before. The form disables Sunday lunch selection after cutoff, shows clear messaging.

### R8: Phone lookup — returning customers skip name/email
- **Rule**: Known customer: pre-fill first name, last name, email. New customer: must provide first name, last name, mobile. Email optional for new customers.
- **Code location**: Form lines 1247-1266 (lookup handler), lines 1947-1975 (conditional fields)
- **Verdict**: **Correct** — known customers get name/email pre-filled and the name fields are hidden. Unknown customers see first name, last name (required) and email (labeled "optional"). Email is not required in validation (line 1354 checks only firstName and lastName).

### R9: SMS confirmation after booking
- **Rule**: SMS confirmation sent after booking
- **Code location**: Not visible in frontend code — handled server-side by the management API
- **Verdict**: **Cannot verify from frontend** — the confirmation screen (line 1561) says "We've sent confirmation details by SMS", which is correct customer-facing language. Actual SMS sending is backend responsibility.

### R10: PayPal for deposit payments
- **Rule**: PayPal for deposit payments
- **Code location**: `PayPalDepositSection.tsx`, form line 2257-2271
- **Verdict**: **Correct** — PayPal integration used for all deposit payments

### R11: Payment hold with expiry
- **Rule**: Payment creates a hold with expiry. Customer must complete within window.
- **Code location**: Form lines 2247-2250 (hold expiry display), `formatHoldExpiry()` function
- **Verdict**: **Correct** — hold expiry is shown during payment. If payment link is unavailable, error with phone fallback is shown (submit/route.ts lines 188-196).

### R12: Mother's Day date
- **Rule**: Fixed date March 15, 2026
- **Source**: `lib/mothers-day-booking.ts` line 3
- **Verdict**: **Partially correct / Potentially stale** — `MOTHERS_DAY_SERVICE_DATE = '2026-03-15'`. Mother's Day 2026 is indeed March 15, 2026 (Mothering Sunday in UK). However, today is 2026-03-21 — this date has already passed. The form still accepts `mothers_day=true` prefill but the cutoff logic would block it since the cutoff has passed. No harm, but the hardcoded date needs updating for 2027 eventually.

### R13: Booking duration 120 minutes
- **Rule**: Default booking duration is 120 minutes
- **Code location**: `submit/route.ts` line 157 (`duration_minutes: 120`), `agent/route.ts` line 124 (`duration_minutes: body.duration || 120`)
- **Verdict**: **Correct** — both routes default to 120 minutes. Agent route allows override.

### R14: Walk-ins always welcome
- **Rule**: Walk-ins always welcome
- **Code location**: `page-old.tsx` line 83-86 (old page has explicit walk-in messaging)
- **Verdict**: **Missing from new page** — the new `page.tsx` does not mention walk-ins anywhere. The old page had a prominent "Walk-ins always welcome!" alert.

### R15: Tables held for 15 minutes
- **Rule**: Tables held for 15 minutes
- **Code location**: `page-old.tsx` line 146: "Tables are held for 15 minutes"
- **Verdict**: **Missing from new page** — present in old page but not in the new `page.tsx` sidebar copy

### R16: AI agent email requirement
- **Rule**: Email should be optional for new customers
- **Code location**: `agent/route.ts` line 39: email is required (`!body.customer.email`)
- **Verdict**: **Contradicted** — the AI agent endpoint requires email, but the business rule says email is optional. This means AI agents will reject bookings where the customer doesn't provide an email.

---

## 2. Value Audit

| Value | In Code | Should Be | Status |
|-------|---------|-----------|--------|
| Deposit per person | £10 | £10 | Correct |
| Group deposit threshold | 7+ guests | 7+ guests | Correct |
| Frontend max party size | 50 | 20 (to match backend) | **WRONG** |
| Backend max party size | 20 | 20 | Correct |
| Sunday cutoff hour | 13 (1pm) | 13 (1pm) | Correct |
| Sunday cutoff day | Saturday (Sunday - 1) | Saturday | Correct |
| Mother's Day date | 2026-03-15 | 2026-03-15 (past) | Stale |
| Default booking duration | 120 min | 120 min | Correct |
| Default party size | 2 (regular), 4 (Mother's Day) | Reasonable | OK |
| Phone number | 01753 682707 | 01753 682707 | Correct |

---

## 3. Customer-Facing Language Audit

### Sidebar copy (page.tsx)

| Location | Text | Issue |
|----------|------|-------|
| Line 209 | "For larger groups, please call us." | **Vague** — doesn't say what size threshold. Should say "groups of 20+" to match backend limit. |
| Line 210 | "A £10 per person deposit is required for groups of 7 or more. This is deducted from your final bill." | **Correct** |
| Line 211 | SUNDAY_LUNCH_DEPOSIT_POLICY_COPY constant | **Correct** — "A £10 per person deposit is required for every Sunday lunch booking and is deducted from your final bill." |
| Line 220 | "Our team can help with tables of 8+" | **Inconsistent** — suggests call for 8+, but online booking works up to 20. Should align with actual limit. |

### Blocked reason copy (form)

| Key | Text | Issue |
|-----|------|-------|
| too_large_party | "For larger groups, please call us so we can arrange your booking." | **Vague** — doesn't say max is 20 |
| outside_hours | Correct | OK |
| cut_off | Correct | OK |
| no_table | Correct, includes phone number | OK |

### PayPal payment screen

| Location | Text | Issue |
|----------|------|-------|
| PayPalDepositSection line 53-55 | "Deposit: £{amount} (£10 per person)" | **Missing** "deducted from your final bill" reassurance |
| PayPalDepositSection line 69 | "Your card details are never shared with us. Powered by PayPal." | Correct |

### Booking confirmation screen

| Location | Text | Issue |
|----------|------|-------|
| Form line 1556 | "You're all booked in — see you soon!" | OK |
| Form line 1561 | "We've sent confirmation details by SMS." | OK |
| Form line 1566-1568 | Arrival instructions (free parking, no check-in needed) | OK |

### Mother's Day copy

| Location | Text | Issue |
|----------|------|-------|
| Form line 1635 | "Mother's Day Sunday Lunch is fixed to Sunday, 15 March 2026" | Date has passed — stale but harmless since cutoff blocks it |
| Form line 1659 | "Date: Sunday, 15 March 2026" | Same |

---

## 4. Admin/Staff-Facing Language Audit

Not applicable — this is a public customer-facing form. No admin UI reviewed.

---

## 5. Policy Drift Findings

### CRITICAL

1. **AI Agent "card hold" language** (`agent/route.ts` line 154)
   - Says: "require a card hold to secure the booking (no charge)"
   - Should say: "require a £10 per person deposit, deducted from your final bill"
   - Impact: AI agents (GPT, etc.) give customers wrong information about the payment policy. Customers may be surprised by an actual charge.

2. **Frontend/backend party size mismatch** (form max=50, API max=20)
   - Customer selects 25 guests, fills out entire form, hits confirm, gets cryptic error
   - Impact: Poor UX, potential lost bookings, wasted customer time

### HIGH

3. **Sidebar copy inconsistency** — "tables of 8+" (line 220) vs actual limit of 20 online
   - "Our team can help with tables of 8+" suggests you need to call for 8 people, but online booking handles up to 20. This discourages online bookings unnecessarily.

4. **PayPal deposit screen missing "deducted from bill"** reassurance
   - At the moment of payment, customer doesn't see that the deposit counts toward their bill. This is the highest-anxiety moment and the most important place for this message.


[truncated at line 200 — original has 235 lines]
```

### `tasks/review-book-table/phase-1/consolidated-defect-log.md`

```
# Consolidated Defect Log — Book Table Form

**Date**: 2026-03-21
**Section**: /book-table (ManagementTableBookingForm + APIs)
**Sources**: Structural Mapper, Business Rules Auditor, Technical Architect, QA Specialist
**Test Coverage**: 57 test cases — 46 PASS, 5 FAIL, 6 WARN

---

## DEFECT-001: Mobile party size input cannot be cleared to retype
- **Severity**: CRITICAL
- **Business Impact**: Mobile users (majority of public traffic) cannot change party size once entered without refreshing the page. Blocks the primary booking flow — this is the user's reported issue.
- **Root Cause Area**: `ManagementTableBookingForm.tsx` lines 1647-1654
- **Source**: All 4 agents, user report
- **Affected Files**: `components/features/TableBooking/ManagementTableBookingForm.tsx`
- **Test Case IDs**: T-MOBILE-01, T-MOBILE-02, T-MOBILE-03
- **Acceptance Criteria**: User can select-all-delete on mobile, field shows empty, then type new number. Value clamped 1-20 on blur.
- **Root Cause**: `if (raw === '') return` rejects empty string in controlled input onChange, snapping back to previous value.

## DEFECT-002: AI agent endpoint uses banned "card hold" language
- **Severity**: HIGH
- **Business Impact**: AI agents (GPT-5 etc.) relay incorrect policy to customers — says "card hold (no charge)" when it's actually a £10/person deposit that IS charged.
- **Root Cause Area**: `app/api/booking/agent/route.ts` line 154-155
- **Source**: Business Rules Auditor, QA Specialist, Structural Mapper
- **Affected Files**: `app/api/booking/agent/route.ts`
- **Test Case IDs**: T-AGENT-01
- **Acceptance Criteria**: No "card hold" or "(no charge)" language. Must say "£10 per person deposit, deducted from your final bill".

## DEFECT-003: Frontend party size max (50) mismatches backend max (20)
- **Severity**: HIGH
- **Business Impact**: Customers can enter 21-50 guests, complete all 4 steps including personal details and policy acceptance, then get a cryptic rejection. Wasted time, lost bookings.
- **Root Cause Area**: `ManagementTableBookingForm.tsx` lines 1643-1644, 529, 1652; `app/book-table/page.tsx` line 48
- **Source**: Business Rules Auditor, Technical Architect, QA Specialist, Structural Mapper
- **Affected Files**: `ManagementTableBookingForm.tsx`, `app/book-table/page.tsx`
- **Test Case IDs**: T-BOUND-08
- **Acceptance Criteria**: Frontend max capped to 20. Input max={20}, clamp to 20, parsePartySize caps at 20. Sidebar copy updated to match.

## DEFECT-004: PayPal deposit screen missing "deducted from bill" reassurance
- **Severity**: HIGH
- **Business Impact**: At the highest-anxiety payment moment, customer doesn't know the deposit counts toward their bill. May abandon payment or feel misled.
- **Root Cause Area**: `PayPalDepositSection.tsx` line 53-55
- **Source**: Business Rules Auditor
- **Affected Files**: `components/features/TableBooking/PayPalDepositSection.tsx`
- **Test Case IDs**: T-DEP-05
- **Acceptance Criteria**: PayPal section shows "This deposit is deducted from your final bill" near the amount.

## DEFECT-005: Legacy BFF idempotency key generated per-request
- **Severity**: MEDIUM
- **Business Impact**: Double-click or network retry on legacy form path creates duplicate bookings. Low traffic path but data integrity risk.
- **Root Cause Area**: `app/api/booking/submit/route.ts` line 171
- **Source**: QA Specialist, Technical Architect
- **Affected Files**: `app/api/booking/submit/route.ts`
- **Test Case IDs**: T-BFF-03
- **Acceptance Criteria**: Use client-provided `Idempotency-Key` header if present; fall back to server-generated UUID only for non-JS form submissions.

## DEFECT-006: Sidebar copy inconsistencies
- **Severity**: MEDIUM
- **Business Impact**: "Tables of 8+" suggests calling for 8+ people, discouraging online bookings that work up to 20. "For larger groups" doesn't specify the threshold.
- **Root Cause Area**: `app/book-table/page.tsx` lines 209, 220
- **Source**: Business Rules Auditor
- **Affected Files**: `app/book-table/page.tsx`
- **Test Case IDs**: N/A
- **Acceptance Criteria**: Sidebar says "For groups of 20+, please call us" and "Our team can help with tables of 20+".

## DEFECT-007: Date change doesn't clear stale availability state
- **Severity**: LOW
- **Business Impact**: Minor — mitigated by "Find a table" button which resets all state. But if user goes back from step 2, changes date, old slots could briefly appear.
- **Root Cause Area**: `ManagementTableBookingForm.tsx` lines 1092-1107
- **Source**: QA Specialist
- **Affected Files**: `components/features/TableBooking/ManagementTableBookingForm.tsx`
- **Test Case IDs**: T-STATE-01
- **Acceptance Criteria**: `handleDateChange` clears availability, alternativeSlots, selectedTime.

## DEFECT-008: AI agent requires email (contradicts optional email rule)
- **Severity**: LOW
- **Business Impact**: AI agents reject bookings without email. Low traffic path.
- **Root Cause Area**: `app/api/booking/agent/route.ts` line 39
- **Source**: Business Rules Auditor
- **Affected Files**: `app/api/booking/agent/route.ts`
- **Test Case IDs**: T-AGENT-02
- **Acceptance Criteria**: Email validation removed from required fields; email sent as optional.

## DEFECT-009: AI agent hardcodes sms_opt_in: true
- **Severity**: LOW
- **Business Impact**: Opts customers into SMS marketing without consent when booked via AI agent.
- **Root Cause Area**: `app/api/booking/agent/route.ts` line 123
- **Source**: Business Rules Auditor
- **Affected Files**: `app/api/booking/agent/route.ts`
- **Test Case IDs**: N/A
- **Acceptance Criteria**: Default `sms_opt_in` to false unless explicitly provided by the agent.

---

## OUT OF SCOPE — Backend/Infrastructure Items

These were identified by the Technical Architect as critical but require changes in OJ-AnchorManagementTools or infrastructure, not this codebase:

- **C1**: Orphaned `pending_payment` bookings — needs server-side cron to expire after `hold_expires_at`
- **C2**: No PayPal create-order retry — needs "Retry payment" button (minor frontend change possible)
- **C3**: PayPal capture failure reconciliation — needs backend webhook/reconciliation
- **C4**: Payment confirmation is client-only state — needs post-capture server state refresh

## OUT OF SCOPE — Enhancement Items

- Walk-in messaging removed from new page (was on old page)
- "Tables held for 15 minutes" messaging removed from new page
- Mother's Day date hardcoded as 2026-03-15 (already passed, needs yearly update mechanism)
- Component decomposition (2319 lines → step components + custom hooks)
- Test coverage (4 tests for 2319 lines of business logic)
```

### `tasks/review-book-table/phase-1/qa-specialist/report.md`

```
# QA Specialist Report: Book Table Form

**Date**: 2026-03-21
**Scope**: Full end-to-end review of `/book-table` form
**Files reviewed**:
- `components/features/TableBooking/ManagementTableBookingForm.tsx` (2319 lines)
- `app/book-table/page.tsx`
- `app/api/booking/submit/route.ts`
- `app/api/booking/agent/route.ts`
- `components/features/TableBooking/PayPalDepositSection.tsx`
- `lib/constants.ts`
- `lib/sunday-lunch-cutoff.ts`
- `lib/mothers-day-booking.ts`
- `tests/unit/ManagementTableBookingForm.test.tsx`

---

## Executive Summary

57 test cases traced through code. **5 FAIL, 6 WARN, 46 PASS**.

The primary user-reported issue (mobile party size editing) is confirmed and root-caused. Three additional defects found: legacy "card hold" language in the AI agent endpoint, and an idempotency key design flaw in the legacy BFF. The core booking flow, deposit logic, Sunday lunch cutoff, customer lookup, and PayPal payment paths are all correctly implemented.

---

## Defect Log

### DEF-001: Mobile party size input cannot be cleared (CONFIRMED)

| Field | Value |
|-------|-------|
| **Severity** | P0 -- Critical |
| **Summary** | Party size `onChange` handler rejects empty string, making mobile editing impossible |
| **Expected** | User can select-all-and-delete the party size field on mobile, then type a new number |
| **Actual** | `if (raw === '') return` on line 1649 causes the controlled input to snap back to the previous value. On mobile, the standard edit gesture (tap-select-all, delete, type new value) fails because the field never reaches an empty state. |
| **Business Impact** | Users on mobile (majority of public traffic) cannot change party size once entered without refreshing the page. This blocks the primary booking flow. |
| **Root Cause** | The `onChange` handler at lines 1647-1654 guards against empty string to prevent `NaN` from `parseInt`, but this guard also prevents the legitimate "clearing the field to retype" interaction. |
| **Affected Files** | `components/features/TableBooking/ManagementTableBookingForm.tsx` lines 1647-1654 |
| **Test Case IDs** | T-MOBILE-01, T-MOBILE-02, T-MOBILE-03 |
| **Fix Pattern** | Separate display value (string state for the input) from logical value (number state for business logic). Allow empty string as a transient display state. Clamp to valid range only on blur or submission. Example: `const [partySizeInput, setPartySizeInput] = useState(String(defaultPartySize))` with `onBlur` parsing. |

---

### DEF-002: AI agent endpoint uses legacy "card hold" language

| Field | Value |
|-------|-------|
| **Severity** | P1 -- High |
| **Summary** | AI agent response contains banned "card hold" terminology |
| **Expected** | All customer-facing language uses "deposit" per current policy |
| **Actual** | Line 155 in `app/api/booking/agent/route.ts`: `"Bookings of 7+ require a card hold to secure the booking (no charge)."` -- Uses "card hold" and claims "no charge", both of which contradict the current deposit policy (10/person, actual charge). |
| **Business Impact** | AI agents (GPT-5, etc.) will communicate incorrect policy to customers. Creates confusion about whether a real charge is taken. |
| **Root Cause** | This string was written before the deposit policy replaced the credit card hold system and was never updated. |
| **Affected Files** | `app/api/booking/agent/route.ts` line 155 |
| **Test Case IDs** | T-AGENT-01 |
| **Fix** | Replace with: `"Bookings of 7+ require a £10 per person deposit to secure the booking. This is deducted from your final bill."` |

---

### DEF-003: Legacy BFF idempotency key is per-request, not per-submission

| Field | Value |
|-------|-------|
| **Severity** | P1 -- High |
| **Summary** | Idempotency key generated fresh each request, defeating duplicate protection |
| **Expected** | Same idempotency key for retries of the same booking attempt |
| **Actual** | Line 171 in `app/api/booking/submit/route.ts`: `const idempotencyKey = crypto.randomUUID()` generates a new UUID per POST request. If a user double-submits (network retry, browser back button), two different keys are sent, creating duplicate bookings. |
| **Business Impact** | Duplicate bookings possible on slow networks or impatient users. Note: the main form (`ManagementTableBookingForm.tsx`) generates its own client-side idempotency key at line 1409 and sends it via header, which is the correct pattern. This defect is only in the legacy BFF path. |
| **Root Cause** | The BFF generates the key server-side instead of using a client-provided key. |
| **Affected Files** | `app/api/booking/submit/route.ts` line 171 |
| **Test Case IDs** | T-BFF-03 |
| **Fix** | Use the client-provided `Idempotency-Key` header if present, falling back to the server-generated UUID only for non-JS form submissions. |

---

### DEF-004: Frontend/backend party size max mismatch (warning)

| Field | Value |
|-------|-------|
| **Severity** | P2 -- Medium |
| **Summary** | Frontend allows party size up to 50; backend rejects above 20 |
| **Expected** | Consistent limits, or early client-side feedback |
| **Actual** | Frontend `max={50}` and clamp to 50 on line 1652. Backend API returns `too_large_party` for sizes above its own limit (typically 20). Users can enter 21-50, go through the full flow, and get rejected only at submission. |
| **Business Impact** | Poor UX for groups of 21-50 -- they complete the full form only to be told to call. Sidebar already says "For larger groups, please call us" but the form accepts up to 50. |
| **Root Cause** | Frontend and backend limits were set independently. |
| **Affected Files** | `components/features/TableBooking/ManagementTableBookingForm.tsx` line 1644, 1652; `app/book-table/page.tsx` line 48 |
| **Test Case IDs** | T-BOUND-08 |
| **Fix** | Either: (a) lower frontend max to match backend (20), or (b) show a "please call for groups this size" message at >20 instead of letting them continue to a rejection. |

---

### DEF-005: Stale availability data after date change without re-search

| Field | Value |
|-------|-------|
| **Severity** | P2 -- Medium |
| **Summary** | Changing date in step 1 does not clear previous availability data |
| **Expected** | Previous availability results cleared when date changes |
| **Actual** | `handleDateChange` (line 1092-1107) only updates the date and checks for past dates. It does not clear `availability`, `alternativeSlots`, or `selectedTime`. If user previously searched and then changes the date, the old results remain visible until they click "Find a table" again. |
| **Business Impact** | Low -- the user must click "Find a table" to proceed, which does reset everything. But if they go back from step 2 to step 1, change the date, and somehow bypass the search, stale data could appear. Currently mitigated by the step flow. |
| **Root Cause** | `handleDateChange` was designed to be lightweight (no API calls) but doesn't clear dependent state. |
| **Affected Files** | `components/features/TableBooking/ManagementTableBookingForm.tsx` lines 1092-1107 |
| **Test Case IDs** | T-STATE-01 |
| **Fix** | Add `setAvailability(null); setAlternativeSlots([]); setSelectedTime('')` to `handleDateChange`, or reset these when stepping back to 'find'. |

---

## Coverage Assessment

### What is well-covered

1. **Deposit logic**: Correctly implements mutual exclusivity between Sunday lunch and group deposits. Correct 10/person rate. Correct boundary at 7.
2. **Sunday lunch cutoff**: Saturday 1pm London time enforcement is solid with proper timezone handling via `Intl.DateTimeFormat`.
3. **Mother's Day flow**: Date/purpose/sundayLunch locking works correctly. Cutoff messaging is accurate.
4. **Customer lookup**: Known/unknown/degraded paths all handled with appropriate UI states.
5. **PayPal payment flow**: Order creation, capture, error handling, and retry all correctly wired.
6. **Validation chain**: `validateDetailsStep()` is called both at "Continue to review" and "Confirm booking", preventing bypasses.
7. **Blocked booking handling**: All blocked reasons have user-friendly copy and redirect to choose step.
8. **Event suggestions**: Mother's Day events correctly filtered out. Events sorted by time. Dismiss functionality works.
9. **Accessibility**: Progress bar has proper ARIA attributes. Form inputs use labels. Steps indicated visually and semantically.

### What is NOT covered by existing tests

The existing test file (`tests/unit/ManagementTableBookingForm.test.tsx`) has only 4 tests:
1. Mother's Day event filtering
2. Mother's Day context display
3. Mother's Day pre-order + submission
4. Pending payment without payment link

**Missing test coverage** (prioritized by risk):
- Party size input behavior (the confirmed bug)
- Group deposit (non-Sunday-lunch) flow
- Drinks-only booking flow
- Customer lookup (known vs unknown)
- Policy checkbox validation
- Past date rejection
- Sunday lunch cutoff after 1pm Saturday
- Date change state reset behavior
- Alternative slots display and selection
- Blocked booking handling (each reason)

### Recommendations for Implementation Engineer

1. **DEF-001 (P0)**: Fix the party size input immediately. Use a separate string state for the input display value, with numeric parsing on blur. This is the user's primary complaint.

2. **DEF-002 (P1)**: One-line fix in `app/api/booking/agent/route.ts`. Replace "card hold" with "deposit" language and remove the "(no charge)" claim.

3. **DEF-003 (P1)**: Check for `Idempotency-Key` header in the legacy BFF before generating a new one. Low risk, but important for data integrity.

4. **DEF-004 (P2)**: Consider lowering the frontend max to 20 or adding a soft warning at >20 directing users to call.

5. **DEF-005 (P2)**: Add state cleanup to `handleDateChange` to prevent any possibility of stale data.

6. **Test debt**: The form has 2319 lines of business logic with only 4 unit tests. Priority test additions: party size input, group deposit flow, drinks booking, customer lookup, policy validation.
```

### `tasks/review-book-table/phase-1/qa-specialist/test-matrix.md`

```
# Test Matrix: Book Table Form

## Legend
- **Status**: PASS / FAIL / BLOCKED / WARN
- **Priority**: P0 (Critical) / P1 (High) / P2 (Medium) / P3 (Low)

---

## Category 1: Mobile Input (Party Size)

| ID | Scenario | Expected Result | Actual Result | Status | Priority |
|----|----------|----------------|---------------|--------|----------|
| T-MOBILE-01 | Clear party size field completely on mobile (select all + delete), then type new number | Field clears to empty, user types new value, state updates | `onChange` handler at line 1647-1654 returns early when `raw === ''` -- the controlled input snaps the value back to the previous `partySize` state, preventing the field from ever being empty | **FAIL** | P0 |
| T-MOBILE-02 | Use backspace to delete party size digits one by one (e.g. "12" -> "1" -> "") | Each intermediate value accepted; when field empties, user can continue typing | Deleting down to single digit works (e.g. "12" to "1"), but deleting the final digit triggers the `raw === ''` guard and snaps back | **FAIL** | P0 |
| T-MOBILE-03 | Party size field shows correct value after editing from 8 to 3 | Field shows "3", partySize state = 3 | Only works if user types "3" without first clearing -- if they select-all-and-type on mobile, the field fights them | **FAIL** | P0 |
| T-MOBILE-04 | Party size of 0 entered | Rejected, clamped to 1 | `Math.max(parsed, 1)` on line 1652 clamps to 1 | PASS | P1 |
| T-MOBILE-05 | Negative party size entered (e.g. "-5") | Rejected, clamped to 1 | `Math.max(parsed, 1)` clamps negatives to 1 | PASS | P1 |
| T-MOBILE-06 | Non-numeric input in party size (e.g. "abc") | Rejected | `Number.isNaN(parsed)` guard on line 1651 returns early | PASS | P2 |

---

## Category 2: Boundary Tests (Party Size & Deposits)

| ID | Scenario | Expected Result | Actual Result | Status | Priority |
|----|----------|----------------|---------------|--------|----------|
| T-BOUND-01 | Party size exactly 7 (non-Sunday-lunch, food) | Triggers group deposit of 70 (7 x 10) | `requiresGroupDeposit` = `!requiresSundayLunchDeposit && partySize >= 7` (line 600). Deposit = `7 * 10 = 70`. Review step shows "Deposit due now" and deduction note. | PASS | P1 |
| T-BOUND-02 | Party size exactly 6 (non-Sunday-lunch, food) | No deposit required | `partySize >= 7` is false; `requiresGroupDeposit` = false. No deposit UI shown. | PASS | P1 |
| T-BOUND-03 | Party size 50 (frontend max) | Accepted, clamped to 50 | `Math.min(Math.max(parsed, 1), 50)` on line 1652 accepts 50 | PASS | P2 |
| T-BOUND-04 | Party size 51 (should be rejected) | Clamped to 50 | `Math.min(..., 50)` clamps to 50; input `max={50}` attribute provides browser hint | PASS | P2 |
| T-BOUND-05 | Party size 1 (minimum) | Accepted | `Math.max(parsed, 1)` accepts 1 | PASS | P2 |
| T-BOUND-06 | Sunday lunch with 1 guest | Requires deposit of 10 | `requiresSundayLunchDeposit` = true when `sundayLunch` is true on a Sunday. Deposit = `getSundayLunchDepositAmount(1)` = 10. | PASS | P1 |
| T-BOUND-07 | Sunday lunch with 7 guests | Sunday lunch deposit (70), NOT group deposit | `requiresSundayLunchDeposit` = true (takes precedence). `requiresGroupDeposit` = `!requiresSundayLunchDeposit && ...` = false. Deposit = 70. Mutually exclusive logic correct. | PASS | P1 |
| T-BOUND-08 | Frontend max 50 vs backend max 20 | Frontend accepts up to 50; backend may reject >20 | Frontend clamps to 50 on line 1652. The backend API (management tools) enforces max 20. The `book-table/submit` route does not enforce a max. Mismatch exists but is handled by blocked_reason `too_large_party` from API. | **WARN** | P2 |

---

## Category 3: Deposit Logic

| ID | Scenario | Expected Result | Actual Result | Status | Priority |
|----|----------|----------------|---------------|--------|----------|
| T-DEP-01 | Sunday lunch + 4 guests: deposit shown | Deposit = 40, label "Deposit due now" | `requiresSundayLunchDeposit` = true, `sundayLunchDepositAmount` = 40. Review shows dt "Deposit due now" dd "40.00". | PASS | P1 |
| T-DEP-02 | Sunday lunch deposit is mutually exclusive with group deposit | Only one deposit line shown | `requiresGroupDeposit = !requiresSundayLunchDeposit && partySize >= 7` -- Sunday lunch deposit suppresses group deposit. Code correct. | PASS | P1 |
| T-DEP-03 | Group of 8, weekday food (no Sunday lunch) | Group deposit = 80 | `requiresGroupDeposit` = true, `groupDepositAmount` = 80. Correct. | PASS | P1 |
| T-DEP-04 | Group of 8, drinks only | Group deposit = 80 | `requiresGroupDeposit` applies regardless of purpose (line 600 only checks `!requiresSundayLunchDeposit && partySize >= 7`). Deposit shown. | PASS | P2 |
| T-DEP-05 | Deposit deducted from final bill messaging | Clear messaging shown | "This deposit is deducted from your final bill." shown for both Sunday lunch (line 2222) and group deposits (line 2227). | PASS | P2 |
| T-DEP-06 | Confirm button text changes when deposit required | "Confirm and pay deposit" | Line 2308: ternary checks `requiresSundayLunchDeposit || requiresGroupDeposit` and shows correct label. | PASS | P2 |

---

## Category 4: Sunday Lunch Flow

| ID | Scenario | Expected Result | Actual Result | Status | Priority |
|----|----------|----------------|---------------|--------|----------|
| T-SUN-01 | Selecting a Sunday date with food purpose | Sunday lunch toggle auto-enabled | Effect on lines 686-724: if `selectedDateIsSunday && !sundayLunchCutoffPassed && !sundayPlanManuallySelected`, sets `sundayLunch` to true. | PASS | P1 |
| T-SUN-02 | Sunday lunch cutoff: 1pm Saturday London time | After cutoff, Sunday lunch option disabled | `hasSundayLunchCutoffPassed` uses Saturday (day - 1) at 13:00:00 London time. Button disabled via `sundayLunchCutoffPassed`. | PASS | P1 |
| T-SUN-03 | Pre-order requires main for each guest | Validation blocks submission without selections | `buildSundayMenuSelections()` checks `guestOrders.find(o => !o.menuItemId)` and returns error "Please select a Sunday lunch main for each guest." | PASS | P1 |
| T-SUN-04 | Sunday lunch menu loaded from API | Menu items populate selects | Effect at lines 726-768 fetches `/api/table-bookings/menu/sunday-lunch?date=...` when `sundayLunch && selectedDateIsSunday && detailsUnlocked && step === 'details'`. | PASS | P1 |
| T-SUN-05 | Sunday lunch menu unavailable | Error shown, submission blocked | If `menuData.length === 0` or `!response.ok`, error thrown and `sundayMenuError` set. `buildSundayMenuSelections` returns `{ ok: false }`. | PASS | P1 |
| T-SUN-06 | Switching to drinks clears Sunday lunch | Sunday lunch state reset | Effect at line 855-859: `if (purpose === 'drinks' && sundayLunch) setSundayLunch(false)`. Also `handlePurposeSelection` at line 1126. | PASS | P2 |
| T-SUN-07 | Guest orders array resizes with party size | Array matches party size, preserving existing selections | Effect at lines 620-627: `Array.from({ length: partySize }, ...)` preserves previous entries by index. | PASS | P2 |
| T-SUN-08 | Sunday lunch on non-Sunday date | Sunday lunch option not shown | Guard at line 2005: `selectedDateIsSunday && purpose !== 'drinks' && availability?.sunday_lunch_available !== false`. | PASS | P2 |

---

## Category 5: Customer Lookup

| ID | Scenario | Expected Result | Actual Result | Status | Priority |
|----|----------|----------------|---------------|--------|----------|
| T-CUST-01 | Known customer phone lookup | Name/email populated, personal details skipped | `setLookupState('known')`, sets firstName/lastName/email from response. UI at line 1932 shows welcome back message. Details form hidden at line 1947 (`!isKnownCustomer`). | PASS | P1 |
| T-CUST-02 | Unknown customer phone lookup | Name fields shown, must enter first + last name | `setLookupState('unknown')`. Guard at line 1354: `!isKnownCustomer && (!firstName.trim() || !lastName.trim())` blocks submission. | PASS | P1 |
| T-CUST-03 | Degraded lookup | Treated as unknown with different message | `lookupDegraded` set to true. Message at line 1940-1941 differs: "We could not verify this number right now." | PASS | P1 |
| T-CUST-04 | Empty phone number lookup | Error shown | Line 1229: `if (!phone.trim())` shows "Please enter your mobile number first." | PASS | P2 |
| T-CUST-05 | Reset phone lookup allows re-entry | Phone field re-enabled, all fields cleared | `resetPhoneLookup()` at line 1274 resets all lookup and name state. Button "Use Different Number" at line 1922 triggers it. | PASS | P2 |
| T-CUST-06 | Phone lookup API error | Graceful fallback, error message shown | Catch at line 1267: sets `lookupState('idle')`, shows error message. | PASS | P2 |

---

## Category 6: Booking Submission

| ID | Scenario | Expected Result | Actual Result | Status | Priority |
|----|----------|----------------|---------------|--------|----------|
| T-SUB-01 | Policy checkbox required | Submission blocked without acceptance | Line 1391: `if (!policyAccepted)` returns error. | PASS | P1 |
| T-SUB-02 | Known customer uses stored details | Submission uses known customer email | Line 1405: `resolvedEmail = isKnownCustomer ? knownCustomer?.email : email.trim()`. But firstName/lastName come from local state which was populated from lookup. | PASS | P1 |
| T-SUB-03 | Idempotency key generated per submission | Unique key sent in header | Line 1409: `createClientIdempotencyKey('tbl_web')` generates UUID. Sent as `Idempotency-Key` header. | PASS | P1 |
| T-SUB-04 | Blocked booking returns to choose step | Error shown, step changes to 'choose' | Line 1463-1467: if `state === 'blocked'`, sets error from `BLOCKED_REASON_COPY` and calls `setStep('choose')`. | PASS | P1 |
| T-SUB-05 | Pending payment without PayPal order | Error shown to user | Result sets `state: 'pending_payment'`. Effect at line 657 creates PayPal order. If order creation fails, `paymentState` = 'error' and error alert shown at line 2241-2244. | PASS | P1 |
| T-SUB-06 | Submission sends `sunday_lunch: true` flag for Sunday lunch | Flag included in payload | Line 1431: `...(effectiveSundayLunch ? { sunday_lunch: true } : {})`. | PASS | P2 |
| T-SUB-07 | Submission sends `menu_selections` for Sunday lunch | Selections array included | Line 1432: `...(sundaySelections.selections ? { menu_selections: sundaySelections.selections } : {})`. | PASS | P2 |
| T-SUB-08 | API error during submission | Error displayed, not silently swallowed | Catch at line 1468: `setError(submitError?.message || ...)`. | PASS | P2 |

---

## Category 7: Payment Flow

| ID | Scenario | Expected Result | Actual Result | Status | Priority |
|----|----------|----------------|---------------|--------|----------|
| T-PAY-01 | Pending payment triggers PayPal order creation | PayPal order ID fetched, buttons shown | Effect at line 657-684 calls `/api/table-bookings/paypal/create-order`. On success, `paypalOrderId` set, `PayPalDepositSection` rendered. | PASS | P1 |
| T-PAY-02 | PayPal approval triggers capture | Capture endpoint called, success updates state | `PayPalDepositSection.handleApprove` calls `/api/table-bookings/paypal/capture-order`. On success, `onSuccess()` -> `setPaymentState('confirmed')`. | PASS | P1 |
| T-PAY-03 | PayPal order creation fails | Error shown, user can start new booking | Catch at line 680: sets `paymentError` and `paymentState('error')`. Alert at line 2241-2244 shows error. "Start a new booking" button at line 2278. | PASS | P1 |
| T-PAY-04 | PayPal capture fails | Error shown but PayPal buttons remain | `onError` callback sets `paymentError` and `paymentState('error')`. Error alert at line 2252-2256 rendered alongside PayPal buttons. User can retry. | PASS | P2 |
| T-PAY-05 | Hold expiry displayed to user | Formatted London time shown | `holdExpiry` computed at line 588 via `formatHoldExpiry`. Displayed at line 2248-2250. | PASS | P2 |
| T-PAY-06 | `NEXT_PUBLIC_PAYPAL_CLIENT_ID` missing | PayPal script fails to load | `PayPalDepositSection` uses `process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!` with non-null assertion at line 48. If undefined, PayPal SDK will fail. No graceful fallback. | **WARN** | P2 |

---

## Category 8: Flow Tests (Happy Paths)

| ID | Scenario | Expected Result | Actual Result | Status | Priority |
|----|----------|----------------|---------------|--------|----------|
| T-FLOW-01 | Happy path: food booking, 2 guests, weekday | find -> choose -> details -> review -> confirmed | Steps flow correctly. No deposit required. Confirm button says "Confirm booking". | PASS | P1 |
| T-FLOW-02 | Happy path: drinks booking | find -> choose -> details -> review -> confirmed | Purpose set to 'drinks'. Sunday lunch auto-disabled. No deposit (unless >= 7). | PASS | P1 |
| T-FLOW-03 | Sunday lunch with pre-order | find -> choose -> details (menu selection) -> review -> pending_payment -> PayPal -> confirmed | Sunday lunch enabled, menu loaded at details step, deposit shown at review, PayPal flow triggered on pending_payment. | PASS | P1 |
| T-FLOW-04 | Group of 8 with deposit | find -> choose -> details -> review (deposit shown) -> pending_payment -> PayPal | Group deposit = 80. Button says "Confirm and pay deposit". | PASS | P1 |
| T-FLOW-05 | Known customer shortcut | Phone lookup returns known=true, skips name/email fields | Name fields hidden, "Welcome back" shown, continues to review. | PASS | P1 |
| T-FLOW-06 | No availability -> alternatives shown | "Nearest alternatives" panel with up to 6 slots from next 3 days | `loadNearestAlternatives` fetches +1/+2/+3 days, up to 6 slots shown. Waitlist CTA present. | PASS | P1 |
| T-FLOW-07 | Mother's Day booking (before cutoff) | Date locked to 2026-03-15, purpose locked to food, Sunday lunch auto-enabled | Effects at lines 629-643 enforce date/purpose/sundayLunch. Date input replaced with static display. | PASS | P1 |
| T-FLOW-08 | Mother's Day after cutoff | Warning shown, user can still book weekday menu | Alert at lines 1616-1627 shows cutoff message. Form still functions for regular Sunday booking. | PASS | P1 |
| T-FLOW-09 | Event suggestion -> event booking switch | Event booking form replaces table booking form | `selectedSuggestedEvent` set, `ManagementEventBookingForm` rendered at line 1539. "Back to table booking" button available. | PASS | P2 |

---

## Category 9: Error / Edge Cases

| ID | Scenario | Expected Result | Actual Result | Status | Priority |
|----|----------|----------------|---------------|--------|----------|
| T-ERR-01 | No availability at all (no alternatives found) | "No nearby online alternatives were found." + waitlist CTA | Lines 1833-1834: fallback message shown. Waitlist block at lines 1837-1845. | PASS | P1 |
| T-ERR-02 | API error during availability check | Error alert shown | Catch at line 1022: `setAvailabilityError(...)`. Alert at line 1717-1720. | PASS | P1 |
| T-ERR-03 | Phone lookup fails | Error shown, lookup state reset to idle | Catch at line 1267: `setLookupState('idle')`, error shown. | PASS | P1 |
| T-ERR-04 | Booking submission fails | Error alert with phone number | Catch at line 1468. Error displayed with "Call 01753 682707 if you need help." | PASS | P1 |
| T-ERR-05 | PayPal order creation fails | Error alert shown, new booking option | See T-PAY-03 above. | PASS | P1 |
| T-ERR-06 | PayPal capture fails | Error shown, retry possible | See T-PAY-04 above. | PASS | P2 |
| T-ERR-07 | Sunday lunch menu unavailable | Error alert, submission blocked | See T-SUN-05 above. | PASS | P1 |
| T-ERR-08 | Missing required fields at review step | Validation catches, error shown | `validateDetailsStep()` checks selectedTime, phone, detailsUnlocked, name fields, and Sunday menu selections. | PASS | P1 |
| T-ERR-09 | Past date selected | Error shown before API call | `handleFindTable` at line 991-998 compares to today. Also `handleDateChange` at lines 1092-1107 sets `dateError`. | PASS | P1 |
| T-ERR-10 | User closes browser during PayPal flow | Booking stays in pending_payment state | No client-side handling for this. Booking remains "pending_payment" on the server. Hold expiry should eventually release the table. This is acceptable behavior -- not a defect. | PASS | P3 |

---

## Category 10: State Management

| ID | Scenario | Expected Result | Actual Result | Status | Priority |
|----|----------|----------------|---------------|--------|----------|
| T-STATE-01 | Changing date resets availability and alternatives | Previous availability cleared | `handleDateChange` does NOT reset availability or alternatives. Only `handleFindTable` resets them (lines 1006-1011). The date change alone doesn't clear stale availability data. | **WARN** | P2 |
| T-STATE-02 | Switching purpose (food -> drinks) clears Sunday lunch | Sunday lunch disabled, availability/alternatives reset | `handlePurposeSelection` (line 1118-1134): clears sundayLunch, selectedTime, availability, alternatives. Correct. | PASS | P2 |
| T-STATE-03 | Going back to step 1 preserves party size | Party size retained | `handleBackToFind` only sets `step` and clears `error`. Party size preserved. | PASS | P2 |
| T-STATE-04 | Phone lookup reset allows re-entering phone | All customer state cleared | `resetPhoneLookup` clears lookupState, knownCustomer, firstName, lastName, email. Phone field re-enabled. | PASS | P2 |
| T-STATE-05 | "Book another table" resets all state | Full reset to initial state | `resetJourney` (line 1475-1509) resets all state variables comprehensively. | PASS | P2 |
| T-STATE-06 | Changing party size updates guest orders array | Guest orders resized, existing selections preserved | Effect at lines 620-627 preserves previous entries by index. If partySize shrinks, excess entries dropped. If grows, new entries added with empty menuItemId. | PASS | P2 |

---

## Category 11: AI Agent Endpoint

| ID | Scenario | Expected Result | Actual Result | Status | Priority |
|----|----------|----------------|---------------|--------|----------|
| T-AGENT-01 | Legacy language: "card hold" in specialInstructions | No legacy "credit card hold" language | Line 155 in agent route: "Bookings of 7+ require a card hold to secure the booking (no charge)." -- This uses LEGACY language "card hold" which is explicitly called out as always a bug in CLAUDE.md. Should say "deposit". | **FAIL** | P1 |
| T-AGENT-02 | Agent email required vs public form optional | Agent requires email; public form makes it optional | Agent validation at line 39 requires `customer.email`. Public form allows empty email. Different contract is intentional but undocumented. | **WARN** | P3 |
| T-AGENT-03 | Agent Sunday auto-detection | Sunday dates auto-resolve to sunday_lunch type | Line 67: `bookingType = requestedType || (isSunday ? 'sunday_lunch' : 'regular')`. Could over-aggressively default to sunday_lunch for drinks bookings on Sundays. | **WARN** | P2 |

---

## Category 12: Legacy BFF Endpoint (booking/submit)

| ID | Scenario | Expected Result | Actual Result | Status | Priority |
|----|----------|----------------|---------------|--------|----------|
| T-BFF-01 | Party size not validated for max | Backend should enforce max 20 | `bookingData.partySize` passed directly from client with no max clamp. The downstream API handles this via `too_large_party` blocked reason. | **WARN** | P2 |
| T-BFF-02 | Service window enforcement | Times outside service windows rejected | Lines 100-139: service window check with proper error codes. Defense-in-depth guard working. | PASS | P1 |
| T-BFF-03 | Idempotency key generation | Unique UUID per request | Line 171: `crypto.randomUUID()` -- but this is per-request, not per-user-session. If user double-clicks, two different UUIDs are generated, defeating the purpose. | **FAIL** | P1 |

---

## Summary

| Status | Count |
|--------|-------|
| PASS   | 46    |
| FAIL   | 5     |
| WARN   | 6     |
| BLOCKED| 0     |
| **Total** | **57** |
```

### `tasks/review-book-table/phase-1/remediation-plan.md`

```
# Remediation Plan — Book Table Form

## Priority Order (dependency-aware)

### Batch 1: Critical + High (sequential — DEFECT-001 must go first)

**DEFECT-001**: Fix mobile party size input
- Add `partySizeDisplay` string state for the raw input value
- Keep `partySize` number state for business logic
- Allow empty string as transient display state
- Parse and clamp (1-20) on blur and on "Find a table" click
- Cap max to 20 (combines with DEFECT-003)
- Files: `ManagementTableBookingForm.tsx`

**DEFECT-003**: Cap frontend party size to 20 (merged into DEFECT-001 fix)
- Change `max={50}` to `max={20}` on Input
- Change clamp from 50 to 20 in onChange
- Change `parsePartySize` in `page.tsx` from 50 to 20
- Files: `ManagementTableBookingForm.tsx`, `app/book-table/page.tsx`

### Batch 2: Independent fixes (can run in parallel)

**DEFECT-002**: Fix AI agent "card hold" language
- Replace line 154-155 specialInstructions text
- Remove "(no charge)" claim
- Files: `app/api/booking/agent/route.ts`

**DEFECT-004**: Add deposit reassurance to PayPal section
- Add "This deposit is deducted from your final bill." line near deposit amount
- Files: `components/features/TableBooking/PayPalDepositSection.tsx`

**DEFECT-005**: Fix legacy BFF idempotency key
- Check for `Idempotency-Key` header before generating
- Files: `app/api/booking/submit/route.ts`

**DEFECT-006**: Fix sidebar copy
- "tables of 8+" → "tables of 20+"
- "For larger groups" → "For groups of 20+"
- Files: `app/book-table/page.tsx`

**DEFECT-007**: Clear stale state on date change
- Add `setAvailability(null); setAlternativeSlots([]); setSelectedTime('')` to handleDateChange
- Files: `ManagementTableBookingForm.tsx`

**DEFECT-008**: Make email optional in AI agent
- Remove email from required validation
- Files: `app/api/booking/agent/route.ts`

**DEFECT-009**: Default sms_opt_in to false in AI agent
- Change `sms_opt_in: true` to `sms_opt_in: body.customer.smsOptIn ?? false`
- Files: `app/api/booking/agent/route.ts`

## Estimated Scope

- **Files modified**: 5
- **Approximate lines changed**: ~60
- **Breaking changes**: None
- **Complexity score**: S (2)
```

### `tasks/review-book-table/phase-1/structural-mapper/report.md`

```
# Structural Map: Book Table Form

## 1. File Inventory

### Tier 1 — Critical Path

| File | Concern | Key exports / entry points |
|------|---------|---------------------------|
| `components/features/TableBooking/ManagementTableBookingForm.tsx` | UI + business logic | `ManagementTableBookingForm` — 2319-line client component, 4-step wizard (find/choose/details/review) |
| `app/book-table/page.tsx` | Routing / server component | Default export `BookPage` — parses search params into prefill, renders hero + form + sidebar |
| `app/api/table-bookings/route.ts` | BFF proxy — booking creation | `POST` — normalises payload, validates, enforces service windows + cutoffs, proxies to management API |
| `app/api/table-bookings/availability/route.ts` | BFF proxy — availability | `GET` — builds fallback availability from business hours + service windows, returns time slots |
| `app/api/table-bookings/menu/sunday-lunch/route.ts` | BFF proxy — Sunday menu | `GET` — fetches Sunday lunch menu via `anchorAPI`, 1-minute in-memory cache |
| `app/api/table-bookings/paypal/create-order/route.ts` | BFF proxy — PayPal create | `POST` — validates UUID bookingId, proxies to management API PayPal endpoint |
| `app/api/table-bookings/paypal/capture-order/route.ts` | BFF proxy — PayPal capture | `POST` — validates bookingId + orderId, proxies to management API capture endpoint |
| `app/api/customers/lookup/route.ts` | BFF proxy — phone lookup | `GET` — proxies phone lookup to management API, degrades gracefully on 5xx/auth errors |
| `app/api/events/route.ts` | BFF proxy — event listing | `GET` — fetches events, filters past events, used for date-based event suggestions |
| `components/features/TableBooking/PayPalDepositSection.tsx` | UI — PayPal buttons | `PayPalDepositSection` — renders PayPal buttons, captures order on approval |
| `lib/api/client.ts` | API client | `AnchorAPI` class + `anchorAPI` singleton — all management API calls |
| `lib/api/bookings.ts` | Types | `TableBookingRequest`, `TableBookingResponse`, `TableAvailabilityResponse` |
| `lib/table-booking-service-windows.ts` | Business logic | `resolveServiceRanges`, `buildSlotsFromRanges`, `isTimeWithinRanges` — service window enforcement |
| `lib/sunday-lunch-cutoff.ts` | Business logic | `hasSundayLunchCutoffPassed`, `getSundayLunchCutoffDate` — Saturday 1pm cutoff |
| `lib/mothers-day-booking.ts` | Business logic | `isMothersDayEvent`, `buildMothersDayBookingUrl` — Mother's Day mode |
| `lib/constants.ts` | Config | `CONTACT`, `SUNDAY_LUNCH_DEPOSIT_PER_PERSON_GBP` (10), `getSundayLunchDepositAmount` |
| `lib/management-api-base.ts` | Config | `getManagementApiBaseUrl` — resolves `ANCHOR_API_BASE_URL` env var |
| `components/ui/primitives/Input.tsx` | UI primitive | `Input`, `Textarea` — shared form controls |

### Tier 2 — Supporting

| File | Concern | Notes |
|------|---------|-------|
| `components/features/TableBooking/BookTableUpcomingEventsPanel.tsx` | UI — sidebar | Server component, fetches upcoming events, renders links |
| `components/features/EventBooking/ManagementEventBookingForm.tsx` | UI — event booking | Embedded when user selects a suggested event from table booking flow |
| `lib/gtm-events.ts` | Analytics | `trackTableBookingClick` — GTM event dispatch with PII redaction |
| `lib/api/index.ts` | Barrel export | Re-exports from `shared`, `private-bookings`, `events`, `menu`, `hours`, `bookings`, `parking`, `client` |
| `app/api/booking/submit/route.ts` | Legacy BFF — booking | Legacy wizard submission path — maps camelCase to snake_case, enforces service windows, proxies to `anchorAPI.createTableBooking` |
| `app/api/booking/agent/route.ts` | AI agent API | POST creates booking, GET checks availability — natural language date parsing, structured JSON responses |
| `app/api/booking/payment-return/route.ts` | Redirect handler | GET — checks PayerID query param, redirects to /book-table |
| `app/api/table-bookings/[reference]/route.ts` | BFF — booking lookup/cancel | GET retrieves booking by reference+email, DELETE cancels booking |
| `app/api/table-bookings/create/route.ts` | Alias | Re-exports POST from `../route.ts` |
| `app/booking-confirmation/page.tsx` | Redirect | Redirects to `/book-table` |

### Tier 3 — Legacy/Peripheral

| File | Concern | Notes |
|------|---------|-------|
| `components/features/TableBooking/TableBookingForm.tsx` | Old form | Used by `page-old.tsx`, not active |
| `components/features/TableBooking/SundayLunchBookingForm.tsx` | Old form | Legacy Sunday lunch form |
| `app/book-table/page-old.tsx` | Old page | Not active, uses old form |

### Flags

- **God component**: `ManagementTableBookingForm.tsx` at 2319 lines handles UI rendering, state management, API calls, validation, and payment flow — does too many things.
- **Duplicated concern**: `app/api/booking/submit/route.ts` (legacy) and `app/api/table-bookings/route.ts` (new) both create bookings. The form uses the new route; the legacy route is used by the old form path.
- **Duplicated types**: `ManagementTableBookingResult` is defined in both `ManagementTableBookingForm.tsx` and `lib/api/client.ts` with slightly different shapes.
- **Orphaned route**: `app/api/table-bookings/create/route.ts` simply re-exports from `../route.ts` — exists solely as an alias.

---

## 2. Flow Map

### Flow 1: Complete Booking (Happy Path — Regular)

```
Step 1: FIND TABLE
  1. User enters party size, date, time, purpose (food/drinks)
  2. On date change → handleDateChange() validates not-past, clears drinks alternative
  3. On date change → useEffect fetches events for that date via GET /api/events
  4. User clicks "Find a table" → handleFindTable()
     4a. Validates date not in past (client-side)
     4b. Aborts any in-flight availability request
     4c. Calls runAvailabilitySearch()
        4c-i.   Fires GTM tracking event
        4c-ii.  Calls fetchAvailabilityForDate() → GET /api/table-bookings/availability?date=X&party_size=X&time=X&purpose=X
        4c-iii. API route: resolves service windows from businessHours, builds fallback slots, returns time_slots[]
        4c-iv.  Response normalized via normalizeAvailabilityResponse()
        4c-v.   pickClosestSlot() pre-selects closest available slot
        4c-vi.  Sets step → 'choose'
     4d. If no slots: loads alternatives for next 3 days + checks drinks availability

Step 2: CHOOSE TIME
  5. Available slots rendered as clickable grid
  6. User taps a slot → handleSlotSelect() updates selectedTime
  7. If no slots: shows alternatives (next 3 days), drinks fallback, event suggestions, waitlist CTA
  8. User clicks "Continue" → step → 'details'

Step 3: GUEST DETAILS
  9. User enters mobile number
  10. User clicks "Continue" → handlePhoneLookup()
      10a. GET /api/customers/lookup?phone=X&default_country_code=44
      10b. API route proxies to management API: GET {BASE}/customers/lookup?phone=X
      10c. If known customer → pre-fills first_name, last_name, email, skips name fields
      10d. If unknown → shows name/email inputs
      10e. If API fails → degrades to unknown (user enters details manually)
  11. If Sunday + food + not drinks → shows "Sunday plans" toggle
      11a. If Sunday lunch selected → useEffect loads menu via GET /api/table-bookings/menu/sunday-lunch?date=X
      11b. User selects main course for each guest from dropdown
  12. User enters optional notes
  13. User clicks "Continue to review" → handleContinueToReview()
      13a. validateDetailsStep() checks: selectedTime, phone, detailsUnlocked, name fields, Sunday menu selections
      13b. Step → 'review'

Step 4: REVIEW & CONFIRM
  14. Summary displayed (party size, date, time, purpose, mobile, name, deposit amount)
  15. User accepts policy checkbox
  16. User clicks "Confirm booking" → handleConfirmBooking()
      16a. Re-validates details step
      16b. Re-validates policy accepted
      16c. Builds Sunday menu selections if applicable
      16d. Generates client-side idempotency key
      16e. POST /api/table-bookings with payload:
           { phone, first_name, last_name, email, date, time, party_size, purpose, notes, sunday_lunch, menu_selections }
           Headers: Content-Type: application/json, Idempotency-Key: tbl_web_<uuid>
      16f. API route:
           - Normalises payload (new shape vs legacy shape)
           - Validates (date format, time format, party_size 1-20, phone 7+ digits)
           - Enforces Sunday-only rule for sunday_lunch
           - Enforces Saturday 1pm cutoff
           - Resolves service windows from business hours
           - Checks time within service ranges
           - Proxies to management API: POST {BASE}/table-bookings with X-API-Key header
           - Passes through Idempotency-Key header
      16g. Response states:
           - 'confirmed' → shows success card with reference + "When you arrive" instructions
           - 'pending_payment' → triggers PayPal flow (see Flow 5)
           - 'blocked' → shows blocked_reason copy, returns to 'choose' step
```

### Flow 2: Customer Phone Lookup

```
1. User enters phone in step 3
2. Clicks "Continue" → handlePhoneLookup()
3. Sets lookupState → 'loading'
4. GET /api/customers/lookup?phone=X&default_country_code=44
5. BFF proxies to management API with X-API-Key header
6. Decision tree:
   - 200 + known=true → lookupState='known', pre-fill name/email from customer record
   - 200 + known=false → lookupState='unknown', show manual entry fields
   - 5xx/401/403/404/429 → degrades gracefully: lookupState='unknown' + lookupDegraded=true
   - Network error → degrades gracefully
   - 400 (short phone) → returns error message
7. "Use Different Number" button → resetPhoneLookup() clears all lookup state
```

### Flow 3: Availability Check + Alternatives

```
1. handleFindTable() → runAvailabilitySearch()
2. GET /api/table-bookings/availability?date=X&party_size=X&time=X&purpose=X
3. BFF route:
   a. Fetches business hours via anchorAPI.getBusinessHours()
   b. Calls resolveServiceRanges(hours, date, { bookingType, purpose })
      - Checks special hours overrides first
      - Then regular hours for day of week
      - For sunday_lunch: looks for sunday_lunch schedule_config entries
      - For food: looks for food entries, falls back to kitchen hours
      - For drinks: looks for drinks/regular entries, falls back to venue hours
   c. Calls buildSlotsFromRanges() → generates 30-min slots within service ranges
   d. On Sundays with food purpose: also checks sunday_lunch availability → sunday_lunch_available flag
4. Client receives time_slots[], picks closest slot
5. If no available slots:
   a. loadNearestAlternatives() → checks next 3 days, collects up to 6 alternative slots
   b. If original purpose was food → auto-checks drinks availability for same date
6. Client displays: available slots grid, drinks fallback, alternatives, waitlist CTA
```

### Flow 4: Sunday Lunch Pre-Order

```
1. Selected date is Sunday + purpose is food
2. useEffect auto-sets sundayLunch=true (unless manually overridden or cutoff passed)
3. On step='details' + sundayLunch=true + detailsUnlocked:
   a. useEffect loads menu → GET /api/table-bookings/menu/sunday-lunch?date=X
   b. BFF calls anchorAPI.getSundayLunchMenu(), caches 1 minute
   c. Response normalized via normalizeSundayLunchMenu() → filters unavailable items, extracts id/name/price
4. Guest orders array sized to partySize via useEffect
5. User selects main for each guest from dropdown
6. On submit: buildSundayMenuSelections() validates all guests have selections
7. Selections sent as menu_selections[] in booking payload
8. Cutoff enforcement:
   a. Client: hasSundayLunchCutoffPassed() checked every 30 seconds (timer useEffect)
   b. BFF: hasSundayLunchCutoffPassed() server-side check on POST
   c. Both use Saturday 1pm London time cutoff
```

### Flow 5: PayPal Deposit Payment

```
Trigger: handleConfirmBooking() response has state='pending_payment'
1. useEffect detects result.state='pending_payment' + result.booking_id
2. Stores bookingIdForPayment, depositAmountForPayment
3. POST /api/table-bookings/paypal/create-order { bookingId: <uuid> }
   a. BFF validates bookingId is UUID (Zod)
   b. Proxies to management API: POST {BASE}/external/table-bookings/{id}/paypal/create-order
   c. Uses Bearer token auth (not X-API-Key)
4. On success: sets paypalOrderId
5. Renders PayPalDepositSection component:
   a. PayPalScriptProvider wraps PayPalButtons
   b. createOrder callback returns orderId (no server call — order already created)

[truncated at line 200 — original has 419 lines]
```

### `tasks/review-book-table/phase-1/technical-architect/report.md`

```
# Technical Architect Report: Book Table Form

**Reviewer**: Technical Architect Agent
**Date**: 2026-03-21
**Scope**: `/components/features/TableBooking/ManagementTableBookingForm.tsx` (2319 lines), supporting API routes, and PayPal payment integration
**Verdict**: Several **Critical** partial-failure scenarios in the payment flow; significant maintainability debt from monolithic component design

---

## 1. Failure-at-Step-N Analysis

### FLOW 1: Complete Booking Submission (handleConfirmBooking)

**Steps in order:**
1. `validateDetailsStep()` -- client-side validation
2. `buildSundayMenuSelections()` -- client-side data assembly
3. `createClientIdempotencyKey('tbl_web')` -- generate idempotency key
4. POST `/api/table-bookings` with payload + `Idempotency-Key` header
5. Parse response, check `state` field
6. If `state === 'pending_payment'`: store result, trigger PayPal useEffect
7. useEffect fires: POST `/api/table-bookings/paypal/create-order`
8. PayPal SDK renders buttons; user clicks "Pay"
9. `handleApprove()`: POST `/api/table-bookings/paypal/capture-order`
10. On success: `setPaymentState('confirmed')` (client-only state change)

#### CRITICAL: Booking created but user abandons before payment (Steps 4-6)

- **Scenario**: Step 4 succeeds and the upstream management API creates a booking in `pending_payment` state. The user then closes their browser, loses internet, or navigates away before completing PayPal payment.
- **Consequence**: An orphaned booking exists in `pending_payment` state with no mechanism visible in this codebase to expire or cancel it. The `hold_expires_at` field is displayed to the user but **there is no client-side or server-side timer that cancels the booking when the hold expires**.
- **Mitigation needed**: A server-side cron or background job must expire `pending_payment` bookings after `hold_expires_at`. If one exists in the management API, it is not documented or verifiable from this codebase. **Severity: Critical**.

#### CRITICAL: PayPal create-order fails after booking created (Steps 4-7)

- **Scenario**: Booking is created successfully (step 4) with `state: 'pending_payment'`, but the subsequent `create-order` call (step 7) fails (network error, PayPal outage, management API error).
- **Consequence**: The booking exists in `pending_payment` state but the user sees "Unable to set up payment" with no recovery path except "Start a new booking" (which abandons the existing booking). The user's table hold is consumed but payment cannot be completed.
- **Current handling**: `setPaymentError(...)` and `setPaymentState('error')` -- display only. No retry mechanism. No way to re-attempt create-order for the same booking.
- **Mitigation needed**: Add a "Retry payment" button that re-calls `/api/table-bookings/paypal/create-order` with the same `bookingId`. **Severity: Critical**.

#### CRITICAL: PayPal capture fails after user approved payment (Steps 8-9)

- **Scenario**: User approves payment in PayPal, but the capture call fails (network error, timeout, upstream 5xx).
- **Consequence**: PayPal has authorized (or even captured) the funds on PayPal's side, but the management API never records the capture. The booking remains in `pending_payment`, and the user sees a payment error. Money may have been deducted from the user's account.
- **Current handling**: `onError` callback shows error message. No reconciliation.
- **Mitigation needed**: The management API should have a webhook or reconciliation job that matches PayPal capture events to bookings. The client should show a clear message: "Your payment may have been processed. Please call us." with the booking reference. **Severity: Critical**.

#### HIGH: Payment success is client-only state (Step 10)

- **Scenario**: `setPaymentState('confirmed')` is a purely client-side state change. If the user refreshes the page immediately after payment succeeds, there is no mechanism to restore the "confirmed" state. The booking would show as `pending_payment` from the original `result` (which came from step 4).
- **Consequence**: User sees stale state. May attempt to pay again, or be confused.
- **Mitigation**: After successful capture, re-fetch booking status from the server, or redirect to a confirmation page with the booking reference.

#### OK: Idempotency key handling

- The client generates `tbl_web_<uuid>` and sends it in the `Idempotency-Key` header.
- The BFF (`/api/table-bookings/route.ts`) passes it through to the upstream API: good.
- If the BFF generates its own key when the header is missing (line 368-369), this means retry after a network error would generate a *new* idempotency key and could create a duplicate booking. The client-side key is the correct approach, but **there is no retry logic** in `handleConfirmBooking` -- a network failure just shows an error. This is acceptable for now.

### FLOW 2: Phone Lookup + Customer Detection

**Steps**: Enter phone -> GET `/api/customers/lookup` -> parse response -> auto-fill

- **Failure mode**: API returns error -- handled correctly, sets `lookupState: 'idle'` and shows error.
- **Degraded mode**: `lookup_degraded: true` -- handled correctly, allows user to proceed with manual entry.
- **Race condition risk**: None significant. Only one lookup in flight at a time (no debounce needed since it's button-triggered).
- **Assessment**: Sound. No partial-failure risk.

### FLOW 3: Availability Check (handleFindTable -> runAvailabilitySearch)

**Steps**: Abort previous request -> GET availability -> parse -> pick closest slot -> if no slots, fetch alternatives in parallel

- **AbortController**: Correctly used. Previous controller is aborted before creating a new one. AbortError is caught and ignored. The controller ref is properly managed.
- **Parallel alternative fetching**: `loadNearestAlternatives` fires 3 parallel requests. Individual failures are caught and return `null`. No partial-failure risk.
- **Drinks fallback**: Fires after alternatives load. Failure caught, sets `null`. Safe.
- **Assessment**: Sound. Well-structured with proper cancellation.

### FLOW 4: Legacy BFF Submit (app/api/booking/submit/route.ts)

**Steps**: Parse body -> validate -> check service windows -> build request -> generate idempotency key -> POST to upstream

- **Idempotency key**: Generated server-side per request (`crypto.randomUUID()`). Not passed from client. This means if the client retries (e.g., network timeout), a new idempotency key is generated and a duplicate booking could be created. However, this is the legacy path and appears to be superseded by the management form's direct POST to `/api/table-bookings`.
- **Service window check failure**: Returns 503 with helpful message. Good.
- **Assessment**: The legacy BFF generates its own idempotency key per request, which does not protect against client retries. Low risk since this path appears deprecated.

---

## 2. Architecture Assessment

### Component Monolith: ManagementTableBookingForm.tsx (2319 lines)

**Severity: High (maintainability/correctness risk)**

This single component contains:
- ~40 `useState` hooks (counted: 34 explicit `useState` calls plus several derived values)
- 11 `useEffect` hooks with overlapping dependencies
- All 4 booking steps (find, choose, details, review)
- Payment flow UI
- Event suggestion system
- Sunday lunch pre-order system
- Mother's Day special logic
- Phone lookup flow

**Specific risks from this structure:**

1. **useEffect dependency overlap**: Multiple effects depend on `sundayLunch`, `purpose`, `selectedDateIsSunday`, `mothersDayMode`. The effects at lines 629-643, 686-724, 848-853, and 855-859 all toggle `sundayLunch` or `purpose` in response to each other. While React batches these state updates, the logical flow is very difficult to reason about. A change to one effect could create a cascading update cycle that is hard to test.

2. **Stale closure risk**: Functions like `handleConfirmBooking` close over many state values (`date`, `partySize`, `phone`, `firstName`, `lastName`, `email`, `purpose`, `sundayLunch`, etc.). Since this is a regular function (not wrapped in `useCallback`), it always captures current state via the render closure. This is correct but fragile -- any refactoring that introduces `useCallback` without proper deps would introduce stale closures.

3. **No form library**: The form does not use React Hook Form or any form state manager. All validation is manual and imperative. This makes it easy to miss validation paths (e.g., the `validateDetailsStep` function is called from both `handleContinueToReview` and `handleConfirmBooking`).

**Recommended decomposition:**
- Extract each step into a sub-component (`FindTableStep`, `ChooseTimeStep`, `DetailsStep`, `ReviewStep`)
- Extract booking state into a `useBookingForm` custom hook or `useReducer`
- Extract payment flow into a `usePaymentFlow` custom hook
- Extract availability fetching into a `useAvailability` custom hook

### Two Active Booking Paths

There are **three** API routes that can create bookings:
1. `/api/table-bookings` (POST) -- used by `ManagementTableBookingForm`
2. `/api/booking/submit` (POST) -- legacy BFF, used by older form/non-JS fallback
3. `/api/booking/agent` (POST) -- AI agent endpoint

All three ultimately call the upstream management API, but with different payload shapes, validation logic, and idempotency handling. This is a maintenance burden but not a correctness issue since they all converge on the same upstream.

**Risk**: The legacy BFF at `/api/booking/submit` has `any` typed `bookingData` and `bookingRequest` (lines 28, 144). Type safety is absent for this path.

---

## 3. Data Model Assessment

### Party Size Validation Mismatch

- **Client**: `min={1} max={50}` on the input, clamped via `Math.min(Math.max(parsed, 1), 50)` (line 1652)
- **BFF `/api/table-bookings`**: Validates `party_size` between 1 and 20 (line 269)
- **Consequence**: A user can select party size 21-50 on the form, submit, and get a validation error from the BFF. The error message is generic ("Party size must be between 1 and 20").
- **Severity**: Medium. Confusing UX. The client should enforce `max={20}` to match the server.

### Deposit Amount Calculation

- `SUNDAY_LUNCH_DEPOSIT_PER_PERSON_GBP = 10` used for both Sunday lunch deposits AND group deposits (7+ people).
- The `groupDepositAmount` is calculated as `partySize * SUNDAY_LUNCH_DEPOSIT_PER_PERSON_GBP` (line 602). This reuses the Sunday lunch constant for a conceptually different deposit. If the rates ever diverge, this will be a bug.
- **Severity**: Low. Works correctly today. Add a named constant for group deposits.

### Date Handling

- `today` is memoized with `useMemo(() => new Date().toISOString().slice(0, 10), [])` (line 525). The empty dependency array means it never updates if the user keeps the tab open past midnight. However, the `now` state updates every 30 seconds (line 517), so cutoff-sensitive logic is fine. The `today` minimum on the date picker could be stale after midnight.
- **Severity**: Low. Edge case.

---

## 4. Integration Robustness

### PayPal SDK Initialization

```tsx
<PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!, currency: 'GBP' }}>
```

- **Non-null assertion** (`!`) on `NEXT_PUBLIC_PAYPAL_CLIENT_ID`. If the env var is undefined, the PayPal SDK will receive `undefined` as the client ID. The SDK will likely fail to load, but the error may be unclear.
- **Severity**: Medium. Add a runtime guard: if the env var is missing, show a user-friendly error instead of rendering PayPal buttons.

### PayPal `createOrder` callback

```tsx
createOrder={() => Promise.resolve(orderId)}
```

- This returns the pre-created `orderId` from the management API. The PayPal SDK expects this to return an order ID. This is correct -- the order was already created server-side. But if `orderId` is null or invalid, PayPal will fail silently or show a generic error.
- **Severity**: Low. The `orderId` is only set when the create-order response contains it.

### Upstream API Key

- `ANCHOR_API_KEY` is checked for existence in the `/api/table-bookings` POST handler (line 298). Good.
- The PayPal routes use `process.env.ANCHOR_API_KEY` directly in the `Authorization` header without a null check. If the key is missing, the upstream will receive `Bearer undefined`.
- **Severity**: Medium. Add a guard in the PayPal routes.

---

## 5. Error Handling Audit

### Confirmed Bug: Mobile Party Size Input (Lines 1647-1654)

```tsx
onChange={(event) => {
  const raw = event.target.value
  if (raw === '') return    // <-- BUG: rejects empty string
  const parsed = Number.parseInt(raw, 10)
  if (Number.isNaN(parsed)) return
  setPartySize(Math.min(Math.max(parsed, 1), 50))
}}
```

- **Problem**: On mobile browsers, users typically clear the input field before typing a new number. When `raw === ''`, the handler returns without updating state. Since `value={partySize}` is a controlled number, React re-renders with the old value, making it impossible to clear and retype.
- **Fix**: Allow empty string by storing `partySize` as `number | ''`, or use a separate `partySizeInput` string state for the raw input value while keeping `partySize` as the validated number.
- **Severity**: Medium (confirmed UX bug, affects mobile users).

### Error Display

- Errors are shown via a global `{error && <Alert>}` at the top of the form (line 1607). This means errors from any step are shown regardless of which step is active. If a user navigates back and forward, stale errors could persist.
- The `setError(null)` calls are scattered across handlers (`handleBackToFind`, `handleBackToChoose`, `handleConfirmBooking`, etc.) but are not systematically cleared on step transitions.

[truncated at line 200 — original has 256 lines]
```

### `tasks/review-book-table/phase-2/implementation/changes-log.md`

```
# Book Table Form Remediation — Changes Log

## DEFECT-001 + DEFECT-003: Mobile party size input + cap to 20
**Status**: FIXED
**Files changed**:
- `components/features/TableBooking/ManagementTableBookingForm.tsx`
- `app/book-table/page.tsx`

**Changes**:
1. Added `partySizeDisplay` (string) state alongside existing `partySize` (number) state.
2. Input `value` now binds to `partySizeDisplay` instead of `partySize`.
3. `onChange` updates `partySizeDisplay` freely (including empty string), only syncing to `partySize` when valid.
4. Added `onBlur` handler that clamps 1-20 and syncs both states.
5. `handleFindTable` also syncs partySizeDisplay -> partySize before proceeding.
6. Changed `max={50}` to `max={20}` on the Input element.
7. Changed clamp ceiling from 50 to 20 in onChange handler.
8. Changed `defaultPartySize` clamp from 50 to 20.
9. `resetJourney` now resets `partySizeDisplay` alongside `partySize`.
10. `parsePartySize` in `app/book-table/page.tsx` now caps at 20 instead of 50.

**Test cases covered**: T-MOBILE-01, T-MOBILE-02, T-MOBILE-03, T-BOUND-08

---

## DEFECT-002: AI agent "card hold" language
**Status**: FIXED
**Files changed**: `app/api/booking/agent/route.ts`

**Changes**:
- Replaced "card hold" language with correct deposit policy language.
- partySize >= 7: mentions £10 per person deposit, deducted from final bill.
- partySize < 7: mentions £10 per person deposit, deducted from final bill.

**Test cases covered**: T-AGENT-01

---

## DEFECT-004: PayPal deposit screen missing "deducted from bill"
**Status**: FIXED
**Files changed**: `components/features/TableBooking/PayPalDepositSection.tsx`

**Changes**:
- Added reassurance text below deposit amount: "This deposit is deducted from your final bill."

**Test cases covered**: T-DEP-05

---

## DEFECT-005: Legacy BFF idempotency key
**Status**: FIXED
**Files changed**: `app/api/booking/submit/route.ts`

**Changes**:
- Now checks for client-provided `Idempotency-Key` header before generating a random UUID.

**Test cases covered**: T-BFF-03

---

## DEFECT-006: Sidebar copy inconsistencies
**Status**: FIXED
**Files changed**: `app/book-table/page.tsx`

**Changes**:
- "For larger groups, please call us." -> "For groups of 20+, please call us."
- "tables of 8+" -> "tables of 20+"

**Test cases covered**: N/A (copy fix)

---

## DEFECT-007: Date change doesn't clear stale state
**Status**: FIXED
**Files changed**: `components/features/TableBooking/ManagementTableBookingForm.tsx`

**Changes**:
- `handleDateChange` now clears `availability`, `alternativeSlots`, and `selectedTime` when the date changes.

**Test cases covered**: T-STATE-01

---

## DEFECT-008: AI agent requires email
**Status**: FIXED
**Files changed**: `app/api/booking/agent/route.ts`

**Changes**:
- Removed `!body.customer.email` from the required-field validation check.
- Email remains in the payload but is now optional.

**Test cases covered**: T-AGENT-02

---

## DEFECT-009: AI agent hardcodes sms_opt_in
**Status**: FIXED
**Files changed**: `app/api/booking/agent/route.ts`

**Changes**:
- Changed `sms_opt_in: true` to `sms_opt_in: body.customer.smsOptIn ?? false`.

**Test cases covered**: N/A
```

## Related Files (grep hints)

These files reference the basenames of changed files. They are hints for verification — not included inline. Read them only if a specific finding requires it.

```
AGENTS.md
CLAUDE.md
README.md
SSOT.json
app/[...unmatched]/page.tsx
app/about/page.tsx
app/accessibility/page.tsx
app/api/booking/agent/route.ts
app/api/booking/submit/route.ts
app/api/bookings/initiate/route.ts
```

## Workspace Conventions (`Cursor/CLAUDE.md`)

```markdown
# CLAUDE.md — Workspace Standards

Shared guidance for Claude Code across all projects. Project-level `CLAUDE.md` files take precedence over this one — always read them first.

## Default Stack

Next.js 15 App Router, React 19, TypeScript (strict), Tailwind CSS, Supabase (PostgreSQL + Auth + RLS), deployed on Vercel.

## Workspace Architecture

21 projects across three brands, plus shared tooling:

| Prefix | Brand | Examples |
|--------|-------|----------|
| `OJ-` | Orange Jelly | AnchorManagementTools, CheersAI2.0, Planner2.0, MusicBingo, CashBingo, QuizNight, The-Anchor.pub, DukesHeadLeatherhead.com, OrangeJelly.co.uk, WhatsAppVideoCreator |
| `GMI-` | GMI | MixerAI2.0 (canonical auth reference), TheCookbook, ThePantry |
| `BARONS-` | Barons | CareerHub, EventHub, BrunchLaunchAtTheStar, StPatricksDay, DigitalExperienceMockUp, WebsiteContent |
| (none) | Shared / test | Test, oj-planner-app |

## Core Principles

**How to think:**
- **Simplicity First** — make every change as simple as possible; minimal code impact
- **No Laziness** — find root causes; no temporary fixes; senior developer standards
- **Minimal Impact** — only touch what's necessary; avoid introducing bugs

**How to act:**
1. **Do ONLY what is asked** — no unsolicited improvements
2. **Ask ONE clarifying question maximum** — if unclear, proceed with safest minimal implementation
3. **Record EVERY assumption** — document in PR/commit messages
4. **One concern per changeset** — if a second concern emerges, park it
5. **Fail safely** — when in doubt, stop and request human approval

### Source of Truth Hierarchy

1. Project-level CLAUDE.md
2. Explicit task instructions
3. Existing code patterns in the project
4. This workspace CLAUDE.md
5. Industry best practices / framework defaults

## Ethics & Safety

AI MUST stop and request explicit approval before:
- Any operation that could DELETE user data or drop DB columns/tables
- Disabling authentication/authorisation or removing encryption
- Logging, sending, or storing PII in new locations
- Changes that could cause >1 minute downtime
- Using GPL/AGPL code in proprietary projects

## Communication

- When the user asks to "remove" or "clean up" something, clarify whether they mean a code change or a database/data cleanup before proceeding
- Ask ONE clarifying question maximum — if still unclear, proceed with the safest interpretation

## Debugging & Bug Fixes

- When fixing bugs, check the ENTIRE application for related issues, not just the reported area — ask: "Are there other places this same pattern exists?"
- When given a bug report: just fix it — don't ask for hand-holding
- Point at logs, errors, failing tests — then resolve them
- Zero context switching required from the user

## Code Changes

- Before suggesting new environment variables or database columns, check existing ones first — use `grep` to find existing env vars and inspect the current schema before proposing additions
- One logical change per commit; one concern per changeset

## Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- One task per subagent for focused execution

### 3. Task Tracking
- Write plan to `tasks/todo.md` with checkable items before starting
- Mark items complete as you go; document results when done

### 4. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules that prevent the same mistake; review lessons at session start

### 5. Verification Before Done
- Never mark a task complete without proving it works
- Run tests, check logs, demonstrate correctness
- Ask yourself: "Would a staff engineer approve this?"
- For non-trivial changes: pause and ask "is there a more elegant way?"

### 6. Codex Integration Hook
Uses OpenAI Codex CLI to audit, test and simulate — catches what Claude misses.

```
when: "running tests OR auditing OR simulating"
do:
  - run_skill(codex-review, target=current_task)
  - compare_outputs(claude_result, codex_result)
  - flag_discrepancies(threshold=medium)
  - merge_best_solution()
```

The full multi-specialist QA review skill lives in `~/.claude/skills/codex-qa-review/`. Trigger with "QA review", "codex review", "second opinion", or "check my work". Deploys four specialist agents (Bug Hunter, Security Auditor, Performance Analyst, Standards Enforcer) into a single prioritised report.

## Common Commands

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run lint      # ESLint (zero warnings enforced)
npm test          # Run tests (Vitest unless noted otherwise)
npm run typecheck # TypeScript type checking (npx tsc --noEmit)
npx supabase db push   # Apply pending migrations (Supabase projects)
```

## Coding Standards

### TypeScript
- No `any` types unless absolutely justified with a comment
- Explicit return types on all exported functions
- Props interfaces must be named (not inline anonymous objects for complex props)
- Use `Promise<{ success?: boolean; error?: string }>` for server action return types

### Frontend / Styling
- Use design tokens only — no hardcoded hex colours in components
- Always consider responsive breakpoints (`sm:`, `md:`, `lg:`)
- No conflicting or redundant class combinations
- Design tokens should live in `globals.css` via `@theme inline` (Tailwind v4) or `tailwind.config.ts`
- **Never use dynamic Tailwind class construction** (e.g., `bg-${color}-500`) — always use static, complete class names due to Tailwind's purge behaviour

### Date Handling
- Always use the project's `dateUtils` (typically `src/lib/dateUtils.ts`) for display
- Never use raw `new Date()` or `.toISOString()` for user-facing dates
- Default timezone: Europe/London
- Key utilities: `getTodayIsoDate()`, `toLocalIsoDate()`, `formatDateInLondon()`

### Phone Numbers
- Always normalise to E.164 format (`+44...`) using `libphonenumber-js`

## Server Actions Pattern

All mutations use `'use server'` functions (typically in `src/app/actions/` or `src/actions/`):

```typescript
'use server';
export async function doSomething(params): Promise<{ success?: boolean; error?: string }> {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };
  // ... permission check, business logic, audit log ...
  revalidatePath('/path');
  return { success: true };
}
```

## Database / Supabase

See `.claude/rules/supabase.md` for detailed patterns. Key rules:
- DB columns are `snake_case`; TypeScript types are `camelCase`
- Always wrap DB results with a conversion helper (e.g. `fromDb<T>()`)
- RLS is always on — use service role client only for system/cron operations
- Two client patterns: cookie-based auth client and service-role admin client

### Before Any Database Work
Before making changes to queries, migrations, server actions, or any code that touches the database, query the live schema for all tables involved:
```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name IN ('relevant_table') ORDER BY ordinal_position;
```
Also check for views referencing those tables — they will break silently if columns change:
```sql
SELECT table_name FROM information_schema.view_table_usage
WHERE table_name IN ('relevant_table');
```

### Migrations
- Always verify migrations don't conflict with existing timestamps
- Test the connection string works before pushing
- PostgreSQL views freeze their column lists — if underlying tables change, views must be recreated
- Never run destructive migrations (DROP COLUMN/TABLE) without explicit approval

## Git Conventions

See `.claude/rules/pr-and-git-standards.md` for full PR templates, branch naming, and reviewer checklists. Key rules:
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- Never force-push to `main`
- One logical change per commit
- Meaningful commit messages explaining "why" not just "what"

## Rules Reference

Core rules (always loaded from `.claude/rules/`):

| File | Read when… |
|------|-----------|
| `ui-patterns.md` | Building or modifying UI components, forms, buttons, navigation, or accessibility |
| `testing.md` | Adding, modifying, or debugging tests; setting up test infrastructure |
| `definition-of-ready.md` | Starting any new feature — check requirements are clear before coding |
| `definition-of-done.md` | Finishing any feature — verify all quality gates pass |
| `complexity-and-incremental-dev.md` | Scoping a task that touches 4+ files or involves schema changes |
| `pr-and-git-standards.md` | Creating branches, writing commit messages, or opening PRs |
| `verification-pipeline.md` | Before pushing — run the full lint → typecheck → test → build pipeline |
| `supabase.md` | Any database query, migration, RLS policy, or client usage |

Domain rules (auto-injected from `.claude/docs/` when you edit relevant files):

| File | Domain |
|------|--------|
| `auth-standard.md` | Auth, sessions, middleware, RBAC, CSRF, password reset, invites |
| `background-jobs.md` | Async job queues, Vercel Cron, retry logic |
| `api-key-auth.md` | External API key generation, validation, rotation |
| `file-export.md` | PDF, DOCX, CSV generation and download |
| `rate-limiting.md` | Upstash rate limiting, 429 responses |
| `qr-codes.md` | QR code generation (client + server) |
| `toast-notifications.md` | Sonner toast patterns |
| `email-notifications.md` | Resend email, templates, audit logging |
| `ai-llm.md` | LLM client, prompts, token tracking, vision |
| `payment-processing.md` | Stripe/PayPal two-phase payment flows |
| `data-tables.md` | TanStack React Table v8 patterns |

## Quality Gates

A feature is only complete when it passes the full Definition of Done checklist (`.claude/rules/definition-of-done.md`). At minimum: builds, lints, type-checks, tests pass, no hardcoded secrets, auth checks in place, code commented where complex.
```

## Project Conventions (`CLAUDE.md`)

```markdown
# CLAUDE.md — The Anchor Pub Website

Project-specific guidance. The workspace CLAUDE.md at `/Users/peterpitcher/Cursor/CLAUDE.md` covers general standards (TypeScript, Tailwind, Supabase, Git, testing, auth). Read this file for what's unique to this project.

---

## Stack

- **Next.js 14** App Router, TypeScript, Tailwind CSS, CVA
- **No database** — this is a marketing/booking website only; all data lives in the management app
- **Hosting:** Vercel | **DNS:** Cloudflare | **Analytics:** Google Tag Manager
- **Tests:** Jest (`npm test`) in `tests/`

---

## Relationship with OJ-AnchorManagementTools

These two applications form a paired system. Understanding their relationship is essential before making changes to anything involving bookings, hours, or availability.

### What each app does

| | The Anchor Website (`OJ-The-Anchor.pub`) | Management App (`OJ-AnchorManagementTools`) |
|---|---|---|
| **Purpose** | Customer-facing marketing site + booking flow | Staff/admin tool for managing the pub |
| **Users** | Public customers | Staff and managers |
| **Database** | None | Supabase (PostgreSQL) — sole source of truth |
| **Hosting** | Vercel (this repo) | Vercel (separate repo at `/Users/peterpitcher/Cursor/OJ-AnchorManagementTools`) |

### Data flow

```
Management App (Supabase DB)
        │
        │  REST API (ANCHOR_API_KEY auth)
        │  Base URL: management.orangejelly.co.uk
        ▼
  Website (this repo)
  Next.js API routes proxy the calls
  (protects API key, handles CORS, adds caching)
```

The website **never writes to any database directly**. All mutations (create booking, submit enquiry, etc.) go through the management API.

### Key API endpoints the website consumes

| Endpoint | Purpose |
|---|---|
| `GET /business/hours` | Regular opening hours + special hours overrides |
| `GET /table-bookings/availability` | Available booking slots for a given date/type |
| `POST /table-bookings` | Create a table booking |
| `GET /events` | Upcoming events |
| `GET /menus` | Food/drink menus |

### Special hours override pattern

The management app stores per-date overrides in a `special_hours` table. The website receives these via `/business/hours`. Critical fields:

- `kitchen: null` — kitchen is closed for that date
- `is_kitchen_closed: true` — explicit kitchen closure flag (defence-in-depth)
- `is_closed: true` — full venue closure
- `schedule_config: []` — custom booking schedule for the date

**Important:** `kitchen: null` must be treated as a deliberate "closed" signal — not as "data absent". Use `??` not `||` when resolving special vs regular kitchen data. Using `||` will cause `null` to fall through to regular hours. This has bitten us before (March 2026 bug).

### Booking type → kitchen dependency

| Booking type | Requires kitchen |
|---|---|
| `sunday_lunch` | Yes |
| `food` | Yes |
| `drinks` | No |

If `is_kitchen_closed` or `kitchen === null` for a date, food/sunday_lunch slots must return empty. Drinks slots are unaffected.

### Key files in this repo that touch the management API

| File | Role |
|---|---|
| `lib/api.ts` | Main API client — `anchorAPI.*` methods. Also contains `buildTableAvailabilityFromBusinessHours()` (fallback slot generator) |
| `lib/table-booking-service-windows.ts` | `resolveServiceRanges()` — converts business hours into bookable time slots |
| `lib/hours-utils.ts` | `getEffectiveDayHours()`, `isKitchenClosed()` — correct `??`-based utilities for hours logic |
| `app/api/*/route.ts` | API proxy routes — never expose `ANCHOR_API_KEY` client-side |

---

## Critical Business Rules

- **Brand:** Always "The Anchor" (not "The Anchor Pub") in customer-facing copy
- **Contact:** manager@the-anchor.pub | 01753 682707
- **Location:** Stanwell Moor, near Heathrow Airport
- **Monday kitchen:** Always closed unless a special hours record explicitly opens it
- **Sunday lunch:** Requires advance booking and prepayment; blocked if kitchen is closed for that date
- **No service:** No breakfast, delivery, Sky Sports, or guest ales
- **Verified copy:** `/docs/copy-assumptions.md` is the source of truth for operational claims used in page copy

---

## SEO & Domain

- **Canonical domain:** `https://www.the-anchor.pub` (with www — Cloudflare + Vercel)
- **Cloudflare TLS:** Must be "Full" or "Full (strict)" — never "Flexible" (causes redirect loops)

### Canonical URL pattern — DO NOT hardcode in root layout

```typescript
// app/layout.tsx — metadataBase only, NO alternates.canonical here
export const metadata: Metadata = {
  metadataBase: new URL('https://www.the-anchor.pub'),
}

// Individual pages — relative canonical
export const metadata: Metadata = {
  alternates: { canonical: './' },
}
```

Hardcoding `canonical` in the root layout makes every page claim to be the homepage. This was a past bug — don't repeat it.

---

## Architecture

```
app/                  Next.js App Router pages
  api/                Proxy routes to management API
  book-table/         Booking wizard flow
components/
  ui/                 Reusable primitives (Button, Input, Badge, etc.)
  features/           Business-domain components
  tracking/           GTM analytics components
lib/
  api.ts              Management API client + availability logic
  table-booking-service-windows.ts  Slot resolution
  hours-utils.ts      Business hours utilities
  gtm-events.ts       Analytics event helpers
  constants.ts        Business constants
public/               Static assets
docs/                 Documentation (api-integration.md, copy-assumptions.md, parking-api.md)
tests/                Jest test files
```

### Patterns

- **Default to Server Components.** Add `'use client'` only for interactivity.
- **API proxy pattern:** All calls to `management.orangejelly.co.uk` go through `app/api/*/route.ts`. Never call the management API directly from client components.
- **Hours single source of truth:** Use `lib/hours-utils.ts` utilities for any hours display logic. Do not re-implement hours parsing inline.
- **CVA for component variants** — use `cva()`, not ad-hoc Tailwind conditionals.

---

## Adding a New Page

```typescript
// app/new-route/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Title | The Anchor Stanwell Moor',
  description: 'Page description',
  alternates: { canonical: './' },
}

export default function Page() {
  return <>{/* content */}</>
}
```

Also add the route to `app/sitemap.ts`.

---

## Analytics

```typescript
'use client'
import { trackEventName } from '@/lib/gtm-events'

<Button onClick={() => trackEventName('source_location')}>Action</Button>
```

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `ANCHOR_API_KEY` | Auth key for management.orangejelly.co.uk |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager container ID |
| `NEXT_PUBLIC_AVIATIONSTACK_API_KEY` | Flight data (Heathrow parking feature) |
```

## Rule: `/Users/peterpitcher/Cursor/.claude/rules/definition-of-done.md`

```markdown
# Definition of Done (DoD)

A feature is ONLY complete when ALL applicable items pass. This extends the Quality Gates in the root CLAUDE.md.

## Code Quality

- [ ] Builds successfully — `npm run build` with zero errors
- [ ] Linting passes — `npm run lint` with zero warnings
- [ ] Type checks pass — `npx tsc --noEmit` clean (or project equivalent)
- [ ] No `any` types unless justified with a comment
- [ ] No hardcoded secrets or API keys
- [ ] No hardcoded hex colours — use design tokens
- [ ] Server action return types explicitly typed

## Testing

- [ ] All existing tests pass
- [ ] New tests written for business logic (happy path + at least 1 error case)
- [ ] Coverage meets project minimum (default: 80% on business logic)
- [ ] External services mocked — never hit real APIs in tests
- [ ] If no test suite exists yet, note this in the PR as tech debt

## Security

- [ ] Auth checks in place — server actions re-verify server-side
- [ ] Permission checks present — RBAC enforced on both UI and server
- [ ] Input validation complete — all user inputs sanitised (Zod or equivalent)
- [ ] No new PII logging, sending, or storing without approval
- [ ] RLS verified (Supabase projects) — queries respect row-level security

## Accessibility

- [ ] Interactive elements have visible focus styles
- [ ] Colour is not the sole indicator of state
- [ ] Modal dialogs trap focus and close on Escape
- [ ] Tables have proper `<thead>`, `<th scope>` markup
- [ ] Images have meaningful `alt` text
- [ ] Keyboard navigation works for all interactive elements

## Documentation

- [ ] Complex logic commented — future developers can understand "why"
- [ ] README updated if new setup, config, or env vars are needed
- [ ] Environment variables documented in `.env.example`
- [ ] Breaking changes noted in PR description

## Deployment

- [ ] Database migrations tested locally before pushing
- [ ] Rollback plan documented for schema changes
- [ ] No console.log or debug statements left in production code
- [ ] Verification pipeline passes (see `verification-pipeline.md`)
```

## Rule: `/Users/peterpitcher/Cursor/.claude/rules/supabase.md`

```markdown
# Supabase Conventions

## Client Patterns

Two Supabase client patterns — always use the correct one:

```typescript
// Server-side auth (anon key + cookie session) — use for auth checks:
const supabase = await getSupabaseServerClient();
const { data: { user } } = await supabase.auth.getUser();

// Server-side data (service-role, bypasses RLS) — use for system/cron operations:
const db = await getDb(); // or createClient() with service role
const { data } = await db.from("table").select("*").eq("id", id).single();

// Browser-only (client components):
const supabase = getSupabaseBrowserClient();
```

ESLint rules should prevent importing the admin/service-role client in client components.

## snake_case ↔ camelCase Conversion

DB columns are always `snake_case`; TypeScript types are `camelCase` with Date objects. Always wrap DB results:

```typescript
import { fromDb } from "@/lib/utils";
const record = fromDb<MyType>(dbRow); // converts snake_case keys + ISO strings → Date
```

All type definitions should live in a central types file (e.g. `src/types/database.ts`).

## Row Level Security (RLS)

- RLS is always enabled on all tables
- Use the anon-key client for user-scoped operations (respects RLS)
- Use the service-role client only for system operations, crons, and webhooks
- Never disable RLS "temporarily" — create a proper service-role path instead

## Migrations

```bash
npx supabase db push          # Apply pending migrations
npx supabase migration new    # Create a new migration file
```

- Migrations live in `supabase/migrations/`
- Full schema reference in `supabase/schema.sql` (paste into SQL Editor for fresh setup)
- Never run destructive migrations (DROP COLUMN/TABLE) without explicit approval
- Test migrations locally with `npx supabase db push --dry-run` before pushing (see `verification-pipeline.md`)

### Dropping columns or tables — mandatory function audit

When a migration drops a column or table, you MUST search for every function and trigger that references it and update them in the same migration. Failing to do so leaves silent breakage: PL/pgSQL functions that reference a dropped column/table throw an exception at runtime, and if any of those functions have an `EXCEPTION WHEN OTHERS THEN` handler, the error is swallowed and returned as a generic blocked/failure state — making the bug invisible until someone notices the feature is broken.

**Before writing any `DROP COLUMN` or `DROP TABLE`:**

```sql
-- Find all functions that reference the column or table
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_definition ILIKE '%column_or_table_name%'
  AND routine_type = 'FUNCTION';
```

Or search the migrations directory:
```bash
grep -r "column_or_table_name" supabase/migrations/ --include="*.sql" -l
```

For each function found: update it in the same migration to remove or replace the reference. Never leave a function referencing infrastructure that no longer exists.

This also applies to **triggers** — check trigger functions separately:
```bash
grep -r "column_or_table_name" supabase/migrations/ --include="*.sql" -n
```

## Auth

- Supabase Auth with JWT + HTTP-only cookies
- Auth checks happen in layout files or middleware
- Server actions must always re-verify auth server-side (never rely on UI hiding)
- Public routes must be explicitly allowlisted

## Audit Logging

All mutations (create, update, delete) in server actions must call `logAuditEvent()`:

```typescript
await logAuditEvent({
  user_id: user.id,
  operation_type: 'update',
  resource_type: 'thing',
  operation_status: 'success'
});
```
```

## Rule: `/Users/peterpitcher/Cursor/.claude/rules/ui-patterns.md`

```markdown
# UI Patterns & Component Standards

## Server vs Client Components

- Default to **Server Components** — only add `'use client'` when you need interactivity, hooks, or browser APIs
- Server Components can fetch data directly (no useEffect/useState for data loading)
- Client Components should receive data as props from server parents where possible

## Data Fetching & Display

Every data-driven UI must handle all three states:
1. **Loading** — skeleton loaders or spinners (not blank screens)
2. **Error** — user-facing error message or error boundary
3. **Empty** — meaningful empty state component (not just no content)

## Forms

- Use React Hook Form + Zod for validation where configured
- Validation errors displayed inline, not just console logs
- Required field indicators visible
- Loading/disabled state during submission (prevent double-submit)
- Server action errors surfaced to user via toast or inline message
- Form reset after successful submission where appropriate

## Buttons

Check every button for:
- Consistent variant usage (primary, secondary, destructive, ghost) — no ad-hoc Tailwind-only buttons
- Loading states on async actions (spinner/disabled during server action calls)
- Disabled states when form is invalid or submission in progress
- `type="button"` to prevent accidental form submission (use `type="submit"` only on submit buttons)
- Confirmation dialogs on destructive actions (delete, archive, bulk operations)
- `aria-label` on icon-only buttons

## Navigation

- Breadcrumbs on nested pages
- Active state on current nav item
- Back/cancel navigation returns to correct parent page
- New sections added to project navigation with correct permission gating
- Mobile responsiveness of all nav elements

## Permissions (RBAC)

- Every authenticated page must check permissions via the project's permission helper
- UI elements (edit, delete, create buttons) conditionally rendered based on permissions
- Server actions must re-check permissions server-side (never rely on UI hiding alone)

## Accessibility Baseline

These items are also enforced in the Definition of Done (`definition-of-done.md`):

- Interactive elements have visible focus styles
- Colour is not the only indicator of state
- Modal dialogs trap focus and close on Escape
- Tables use proper `<thead>`, `<th scope>` markup
- Images have meaningful `alt` text
- Keyboard navigation works for all interactive elements
```

---

_End of pack._
