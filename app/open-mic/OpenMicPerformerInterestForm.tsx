'use client'

import { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Alert,
  Button,
  Checkbox,
  CheckboxGroup,
  FormField,
  Input,
  Select,
  Textarea
} from '@/components/ui'
import { trackFormComplete, trackFormStart } from '@/lib/gtm-events'

type AvailabilityGeneral = 'weeknights' | 'weekends' | 'either'
type YesNoDepends = 'yes' | 'no' | 'depends'
type ExperienceLevel = 'none' | 'some' | 'regular'
type ContentRating = 'family_friendly' | 'mild_language' | 'adults_only'
type OriginalsCovers = 'original' | 'covers' | 'mix'
type BringOwnGear = 'yes' | 'no' | 'some'

const PERFORMER_TYPE_OPTIONS = [
  { value: 'Acoustic singer-songwriter', label: 'Acoustic singer-songwriter' },
  { value: 'Acoustic duo / trio', label: 'Acoustic duo / trio' },
  { value: 'Electric musician / band', label: 'Electric musician / band (future interest)' },
  { value: 'DJ', label: 'DJ (future interest)' },
  { value: 'Comedy', label: 'Comedy' },
  { value: 'Spoken word / poetry', label: 'Spoken word / poetry' },
  { value: 'Storytelling', label: 'Storytelling' },
  { value: 'Magic / close-up', label: 'Magic / close-up' },
  { value: 'Other', label: 'Other' }
] as const

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
  { value: 'sunday', label: 'Sun' }
] as const

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function splitLinks(value: string) {
  return value
    .split(/\r?\n|,|\s+/g)
    .map((v) => v.trim())
    .filter(Boolean)
    .slice(0, 10)
}

export function OpenMicPerformerInterestForm() {
  const [hasStarted, setHasStarted] = useState(false)

  const [fullName, setFullName] = useState('')
  const [useRealName, setUseRealName] = useState(false)
  const [actName, setActName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [baseLocation, setBaseLocation] = useState('')

  const [performerTypes, setPerformerTypes] = useState<string[]>([])
  const [performerTypeOther, setPerformerTypeOther] = useState('')
  const [bio, setBio] = useState('')

  const [youtubeLink, setYoutubeLink] = useState('')
  const [instagramLink, setInstagramLink] = useState('')
  const [tiktokLink, setTiktokLink] = useState('')
  const [soundcloudLink, setSoundcloudLink] = useState('')
  const [websiteLink, setWebsiteLink] = useState('')
  const [otherLinks, setOtherLinks] = useState('')

  const [instagramHandle, setInstagramHandle] = useState('')
  const [tiktokHandle, setTiktokHandle] = useState('')
  const [youtubeHandle, setYoutubeHandle] = useState('')

  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | ''>('')
  const [pronouns, setPronouns] = useState('')
  const [accessibilityNotes, setAccessibilityNotes] = useState('')

  const [availabilityGeneral, setAvailabilityGeneral] = useState<AvailabilityGeneral>('either')
  const [canStartAround8pm, setCanStartAround8pm] = useState<YesNoDepends>('yes')
  const [daysOfWeek, setDaysOfWeek] = useState<string[]>([])
  const [frequency, setFrequency] = useState<'one_off' | 'monthly' | 'anytime'>('anytime')
  const [dateNotes, setDateNotes] = useState('')

  const [setLengthMinutes, setSetLengthMinutes] = useState<'' | '5' | '10' | '15' | '20'>('')
  const [contentRating, setContentRating] = useState<ContentRating | ''>('')

  const [musicOriginalsCovers, setMusicOriginalsCovers] = useState<OriginalsCovers | ''>('')
  const [genres, setGenres] = useState('')

  const [needVocalMic, setNeedVocalMic] = useState(false)
  const [needDiBox, setNeedDiBox] = useState(false)
  const [needAuxInput, setNeedAuxInput] = useState(false)
  const [needKeyboardInput, setNeedKeyboardInput] = useState(false)
  const [techNeedsOther, setTechNeedsOther] = useState('')

  const [bringOwnGear, setBringOwnGear] = useState<BringOwnGear | ''>('')
  const [setupTimeMinutes, setSetupTimeMinutes] = useState('')
  const [performerCount, setPerformerCount] = useState('')
  const [specialRequirements, setSpecialRequirements] = useState('')

  const [consentDataStorage, setConsentDataStorage] = useState(false)
  const [consentMarketing, setConsentMarketing] = useState(false)
  const [consentMedia, setConsentMedia] = useState(false)

  const [honeypot, setHoneypot] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const includesOtherType = performerTypes.includes('Other')

  const isMusicPerformer = useMemo(() => {
    const musicTypes = new Set([
      'Acoustic singer-songwriter',
      'Acoustic duo / trio',
      'Electric musician / band',
      'DJ'
    ])
    return performerTypes.some((type) => musicTypes.has(type))
  }, [performerTypes])

  const handleStart = useCallback(() => {
    if (hasStarted) return
    setHasStarted(true)
    trackFormStart({
      formName: 'open_mic_performer_interest',
      source: 'open_mic_page',
      journey: 'open_mic'
    })
  }, [hasStarted])

  const payload = useMemo(() => {
    const links: Record<string, string[]> = {}

    if (youtubeLink.trim()) links.youtube = [youtubeLink.trim()]
    if (instagramLink.trim()) links.instagram = [instagramLink.trim()]
    if (tiktokLink.trim()) links.tiktok = [tiktokLink.trim()]
    if (soundcloudLink.trim()) links.soundcloud = [soundcloudLink.trim()]
    if (websiteLink.trim()) links.website = [websiteLink.trim()]

    const other = splitLinks(otherLinks)
    if (other.length > 0) links.other = other

    const socialHandles: Record<string, string> = {}
    if (instagramHandle.trim()) socialHandles.instagram = instagramHandle.trim()
    if (tiktokHandle.trim()) socialHandles.tiktok = tiktokHandle.trim()
    if (youtubeHandle.trim()) socialHandles.youtube = youtubeHandle.trim()

    const techNeeds: Record<string, unknown> = {
      vocal_mic: needVocalMic,
      di_box: needDiBox,
      aux_input_phone: needAuxInput,
      keyboard_input: needKeyboardInput
    }

    return {
      fullName: fullName.trim(),
      useRealName,
      actName: actName.trim() || null,
      email: email.trim(),
      phone: phone.trim(),
      baseLocation: baseLocation.trim(),
      performerTypes,
      performerTypeOther: performerTypeOther.trim() || null,
      bio: bio.trim(),
      links,
      socialHandles,
      experienceLevel: experienceLevel || null,
      pronouns: pronouns.trim() || null,
      accessibilityNotes: accessibilityNotes.trim() || null,
      availabilityGeneral,
      canStartAround8pm,
      availability: {
        daysOfWeek,
        frequency,
        dateNotes: dateNotes.trim() || null
      },
      setLengthMinutes: setLengthMinutes ? (Number(setLengthMinutes) as 5 | 10 | 15 | 20) : undefined,
      contentRating: contentRating || undefined,
      musicOriginalsCovers: musicOriginalsCovers || undefined,
      genres: genres
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean)
        .slice(0, 25),
      techNeeds,
      techNeedsOther: techNeedsOther.trim() || null,
      bringOwnGear: bringOwnGear || undefined,
      setupTimeMinutes: setupTimeMinutes ? Number(setupTimeMinutes) : undefined,
      performerCount: performerCount ? Number(performerCount) : undefined,
      specialRequirements: specialRequirements.trim() || null,
      consentDataStorage,
      consentMarketing,
      consentMedia,
      honeypot
    }
  }, [
    accessibilityNotes,
    actName,
    availabilityGeneral,
    bio,
    bringOwnGear,
    canStartAround8pm,
    consentDataStorage,
    consentMarketing,
    consentMedia,
    dateNotes,
    daysOfWeek,
    email,
    experienceLevel,
    frequency,
    fullName,
    genres,
    honeypot,
    instagramHandle,
    instagramLink,
    musicOriginalsCovers,
    needAuxInput,
    needDiBox,
    needKeyboardInput,
    needVocalMic,
    otherLinks,
    performerCount,
    performerTypeOther,
    performerTypes,
    phone,
    pronouns,
    setLengthMinutes,
    setupTimeMinutes,
    soundcloudLink,
    specialRequirements,
    techNeedsOther,
    tiktokHandle,
    tiktokLink,
    useRealName,
    websiteLink,
    youtubeHandle,
    youtubeLink,
    contentRating,
    baseLocation
  ])

  const validate = useCallback(() => {
    const nextErrors: Record<string, string> = {}

    if (!payload.fullName) nextErrors.fullName = 'Full name is required.'
    if (!useRealName && !actName.trim()) nextErrors.actName = 'Act/stage name is required (or tick “use my real name”).'
    if (!payload.email) nextErrors.email = 'Email is required.'
    if (payload.email && !isValidEmail(payload.email)) nextErrors.email = 'Please enter a valid email.'
    if (!payload.phone) nextErrors.phone = 'Mobile number is required.'
    if (!payload.baseLocation) nextErrors.baseLocation = 'Where you’re based is required.'
    if (payload.performerTypes.length === 0) nextErrors.performerTypes = 'Please select at least one performer type.'
    if (includesOtherType && !performerTypeOther.trim()) nextErrors.performerTypeOther = 'Please describe your performer type.'
    if (!payload.bio) nextErrors.bio = 'Short description / bio is required.'
    if (payload.bio && payload.bio.length > 800) nextErrors.bio = 'Bio must be 800 characters or fewer.'
    if (!consentDataStorage) nextErrors.consentDataStorage = 'Consent to store your details is required.'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }, [
    payload.bio,
    payload.email,
    payload.fullName,
    payload.performerTypes.length,
    payload.phone,
    payload.baseLocation,
    useRealName,
    actName,
    includesOtherType,
    performerTypeOther,
    consentDataStorage
  ])

  const resetForm = useCallback(() => {
    setFullName('')
    setUseRealName(false)
    setActName('')
    setEmail('')
    setPhone('')
    setBaseLocation('')
    setPerformerTypes([])
    setPerformerTypeOther('')
    setBio('')

    setYoutubeLink('')
    setInstagramLink('')
    setTiktokLink('')
    setSoundcloudLink('')
    setWebsiteLink('')
    setOtherLinks('')

    setInstagramHandle('')
    setTiktokHandle('')
    setYoutubeHandle('')

    setExperienceLevel('')
    setPronouns('')
    setAccessibilityNotes('')

    setAvailabilityGeneral('either')
    setCanStartAround8pm('yes')
    setDaysOfWeek([])
    setFrequency('anytime')
    setDateNotes('')

    setSetLengthMinutes('')
    setContentRating('')
    setMusicOriginalsCovers('')
    setGenres('')

    setNeedVocalMic(false)
    setNeedDiBox(false)
    setNeedAuxInput(false)
    setNeedKeyboardInput(false)
    setTechNeedsOther('')

    setBringOwnGear('')
    setSetupTimeMinutes('')
    setPerformerCount('')
    setSpecialRequirements('')

    setConsentDataStorage(false)
    setConsentMarketing(false)
    setConsentMedia(false)

    setHoneypot('')
    setErrors({})
  }, [])

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    handleStart()

    setStatus('idle')
    setMessage('')

    if (!validate()) {
      setStatus('error')
      setMessage('Please check the highlighted fields.')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/enquiry/open-mic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          consentDataStorage: true
        })
      })

      const responseBody = await response.json().catch(() => null)

      if (!response.ok) {
        const errorMessage =
          responseBody?.error ||
          'Sorry, we could not submit your details right now. Please call 01753 682707.'
        setStatus('error')
        setMessage(errorMessage)
        return
      }

      trackFormComplete({
        formName: 'open_mic_performer_interest',
        source: 'open_mic_page',
        journey: 'open_mic'
      })

      setStatus('success')
      setMessage("Thanks! We’ve received your details. We’ll be in touch when we’re booking upcoming nights.")
      resetForm()
    } catch (error) {
      console.error('Open mic performer interest form submission failed:', error)
      setStatus('error')
      setMessage('Sorry, something went wrong. Please call 01753 682707.')
    } finally {
      setSubmitting(false)
    }
  }, [handleStart, payload, resetForm, validate])

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-anchor-charcoal mb-2" id="register-interest">
        Register your interest
      </h2>
      <p className="text-sm text-gray-700 mb-6">
        Fill this in once and we’ll keep your details on file so we can invite you when we’re booking open mic nights and future performance events.
      </p>

      {status === 'success' && (
        <Alert variant="success" className="mb-6" title="Interest received">
          {message}
        </Alert>
      )}

      {status === 'error' && message && (
        <Alert variant="error" className="mb-6" title="Please check the form">
          {message}
        </Alert>
      )}

      <form className="space-y-6" onSubmit={handleSubmit} onFocusCapture={handleStart}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Full name *"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={errors.fullName}
            autoComplete="name"
          />

          <div className="space-y-3">
            <Checkbox
              label="Use my real name as my act name"
              checked={useRealName}
              onChange={(e) => setUseRealName(e.target.checked)}
            />
            {!useRealName && (
              <Input
                label="Stage / act name *"
                value={actName}
                onChange={(e) => setActName(e.target.value)}
                error={errors.actName}
              />
            )}
          </div>

          <Input
            label="Email *"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            autoComplete="email"
          />

          <Input
            label="Mobile number *"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={errors.phone}
            autoComplete="tel"
            helperText="This can be WhatsApp if you prefer."
          />

          <Input
            label="Where you’re based (town + postcode) *"
            value={baseLocation}
            onChange={(e) => setBaseLocation(e.target.value)}
            error={errors.baseLocation}
            helperText="Example: Stanwell Moor TW19"
          />
        </div>

        <CheckboxGroup
          testId="performer-types"
          label="Performer type(s) *"
          options={PERFORMER_TYPE_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label
          }))}
          value={performerTypes}
          onChange={setPerformerTypes}
          error={errors.performerTypes}
          helperText="Select all that apply — we’re starting acoustic, but we welcome all performer types for future events."
          required
        />

        {includesOtherType && (
          <Input
            label="Other performer type (please describe) *"
            value={performerTypeOther}
            onChange={(e) => setPerformerTypeOther(e.target.value)}
            error={errors.performerTypeOther}
          />
        )}

        <Textarea
          label="Short description / bio *"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          error={errors.bio}
          helperText="Max 800 characters."
          rows={5}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="YouTube link (optional)"
            value={youtubeLink}
            onChange={(e) => setYoutubeLink(e.target.value)}
            placeholder="https://youtube.com/…"
          />
          <Input
            label="Instagram link (optional)"
            value={instagramLink}
            onChange={(e) => setInstagramLink(e.target.value)}
            placeholder="https://instagram.com/…"
          />
          <Input
            label="TikTok link (optional)"
            value={tiktokLink}
            onChange={(e) => setTiktokLink(e.target.value)}
            placeholder="https://tiktok.com/@…"
          />
          <Input
            label="SoundCloud link (optional)"
            value={soundcloudLink}
            onChange={(e) => setSoundcloudLink(e.target.value)}
            placeholder="https://soundcloud.com/…"
          />
          <Input
            label="Website link (optional)"
            value={websiteLink}
            onChange={(e) => setWebsiteLink(e.target.value)}
            placeholder="https://…"
          />
          <Textarea
            label="Other links (optional)"
            value={otherLinks}
            onChange={(e) => setOtherLinks(e.target.value)}
            helperText="Paste multiple links on separate lines."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormField name="experience-level" label="Gigging experience (optional)">
            <Select
              id="experience-level"
              name="experience-level"
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value as any)}
            >
              <option value="">Prefer not to say</option>
              <option value="none">None yet</option>
              <option value="some">Some</option>
              <option value="regular">Regular</option>
            </Select>
          </FormField>
          <Input
            label="Preferred pronouns (optional)"
            value={pronouns}
            onChange={(e) => setPronouns(e.target.value)}
            placeholder="e.g. she/her"
          />
          <Input
            label="Accessibility needs (optional)"
            value={accessibilityNotes}
            onChange={(e) => setAccessibilityNotes(e.target.value)}
            placeholder="Anything we should know?"
          />
        </div>

        <div className="rounded-xl border border-gray-200 p-4 space-y-4">
          <h3 className="text-lg font-semibold text-anchor-charcoal">Availability</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField name="availability-general" label="I’m generally available" required>
              <Select
                id="availability-general"
                name="availability-general"
                value={availabilityGeneral}
                onChange={(e) => setAvailabilityGeneral(e.target.value as AvailabilityGeneral)}
              >
                <option value="weeknights">Weeknights</option>
                <option value="weekends">Weekends</option>
                <option value="either">Either</option>
              </Select>
            </FormField>
            <FormField name="can-start-around-8" label="I can start around 8pm" required>
              <Select
                id="can-start-around-8"
                name="can-start-around-8"
                value={canStartAround8pm}
                onChange={(e) => setCanStartAround8pm(e.target.value as YesNoDepends)}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="depends">Depends</option>
              </Select>
            </FormField>
          </div>

          <CheckboxGroup
            testId="days-of-week"
            label="Days of week (optional)"
            options={DAYS_OF_WEEK.map((day) => ({ value: day.value, label: day.label }))}
            value={daysOfWeek}
            onChange={setDaysOfWeek}
            helperText="If you have a preference, select the days you’re usually free."
            orientation="horizontal"
          />

          <FormField name="contact-frequency" label="How often should we contact you? (optional)">
            <Select
              id="contact-frequency"
              name="contact-frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as any)}
            >
              <option value="anytime">Happy to be contacted anytime</option>
              <option value="one_off">One-off (specific date) only</option>
              <option value="monthly">Monthly / occasional</option>
            </Select>
          </FormField>

          <Textarea
            label="Any dates you prefer / can’t do? (optional)"
            value={dateNotes}
            onChange={(e) => setDateNotes(e.target.value)}
            placeholder="Example: can’t do Fridays, free after 15th"
            rows={3}
          />
        </div>

        <div className="rounded-xl border border-gray-200 p-4 space-y-4">
          <h3 className="text-lg font-semibold text-anchor-charcoal">Set & content</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField name="set-length" label="Typical set length (optional)">
              <Select
                id="set-length"
                name="set-length"
                value={setLengthMinutes}
                onChange={(e) => setSetLengthMinutes(e.target.value as any)}
              >
                <option value="">Not sure yet</option>
                <option value="5">5 minutes</option>
                <option value="10">10 minutes</option>
                <option value="15">15 minutes</option>
                <option value="20">20 minutes</option>
              </Select>
            </FormField>
            <FormField name="content-rating" label="Content rating (optional)">
              <Select
                id="content-rating"
                name="content-rating"
                value={contentRating}
                onChange={(e) => setContentRating(e.target.value as any)}
              >
                <option value="">Prefer not to say</option>
                <option value="family_friendly">Family-friendly</option>
                <option value="mild_language">Mild language</option>
                <option value="adults_only">Adults-only material</option>
              </Select>
            </FormField>
            {isMusicPerformer ? (
              <FormField name="originals-covers" label="Originals / covers (optional)">
                <Select
                  id="originals-covers"
                  name="originals-covers"
                  value={musicOriginalsCovers}
                  onChange={(e) => setMusicOriginalsCovers(e.target.value as any)}
                >
                  <option value="">Prefer not to say</option>
                  <option value="original">Originals</option>
                  <option value="covers">Covers</option>
                  <option value="mix">Mix</option>
                </Select>
              </FormField>
            ) : (
              <div />
            )}
          </div>

          {isMusicPerformer && (
            <Input
              label="Genres (optional)"
              value={genres}
              onChange={(e) => setGenres(e.target.value)}
              helperText="Comma-separated (e.g. indie folk, pop, blues)."
            />
          )}
        </div>

        <div className="rounded-xl border border-gray-200 p-4 space-y-4">
          <h3 className="text-lg font-semibold text-anchor-charcoal">Tech & logistics</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">What do you need from us?</div>
              <Checkbox label="Vocal mic" checked={needVocalMic} onChange={(e) => setNeedVocalMic(e.target.checked)} />
              <Checkbox label="DI box" checked={needDiBox} onChange={(e) => setNeedDiBox(e.target.checked)} />
              <Checkbox label="Aux input (phone)" checked={needAuxInput} onChange={(e) => setNeedAuxInput(e.target.checked)} />
              <Checkbox label="Keyboard input" checked={needKeyboardInput} onChange={(e) => setNeedKeyboardInput(e.target.checked)} />
            </div>

            <Textarea
              label="Anything else you need? (optional)"
              value={techNeedsOther}
              onChange={(e) => setTechNeedsOther(e.target.value)}
              rows={4}
              placeholder="e.g. extra mic, stool, extra DI, lighting requests…"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField name="bring-own-gear" label="Do you bring your own gear? (optional)">
              <Select
                id="bring-own-gear"
                name="bring-own-gear"
                value={bringOwnGear}
                onChange={(e) => setBringOwnGear(e.target.value as any)}
              >
                <option value="">Not sure / varies</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="some">Some</option>
              </Select>
            </FormField>
            <Input
              label="Setup time (minutes, optional)"
              type="number"
              inputMode="numeric"
              value={setupTimeMinutes}
              onChange={(e) => setSetupTimeMinutes(e.target.value)}
              min={0}
              max={180}
            />
            <Input
              label="Number of performers in the act (optional)"
              type="number"
              inputMode="numeric"
              value={performerCount}
              onChange={(e) => setPerformerCount(e.target.value)}
              min={1}
              max={50}
            />
          </div>

          <Textarea
            label="Any special requirements? (optional)"
            value={specialRequirements}
            onChange={(e) => setSpecialRequirements(e.target.value)}
            rows={3}
            placeholder="Space, table, lighting, accessibility, etc."
          />
        </div>

        <div className="rounded-xl border border-gray-200 p-4 space-y-4">
          <h3 className="text-lg font-semibold text-anchor-charcoal">Consents</h3>

          <Checkbox
            label="I’m happy for The Anchor to store my details to contact me about performing. *"
            checked={consentDataStorage}
            onChange={(e) => setConsentDataStorage(e.target.checked)}
            error={errors.consentDataStorage}
            helperText="You can ask us to update or delete your details at any time."
          />

          <Checkbox
            label="I’d like occasional updates about events at The Anchor (optional)"
            checked={consentMarketing}
            onChange={(e) => setConsentMarketing(e.target.checked)}
          />

          <Checkbox
            label="I’m happy for photos/videos of my performance to be used on social media (optional)"
            checked={consentMedia}
            onChange={(e) => setConsentMedia(e.target.checked)}
          />

          <p className="text-xs text-gray-600">
            By submitting this form you agree to our{' '}
            <Link href="/privacy-policy" className="underline decoration-dotted">
              privacy policy
            </Link>
            .
          </p>
        </div>

        {/* Honeypot field (hidden) */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="company">Company</label>
          <input
            id="company"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
            {submitting ? 'Sending…' : 'Submit interest'}
          </Button>
          <p className="text-xs text-gray-600">
            Prefer to message? Call/WhatsApp{' '}
            <a className="underline decoration-dotted" href="tel:+441753682707">
              01753 682707
            </a>
            .
          </p>
        </div>
      </form>
    </div>
  )
}
