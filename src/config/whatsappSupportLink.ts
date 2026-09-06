// Direct WhatsApp click-to-chat link for Dr. Kapil Dev Sharma — lets
// prospective 30-Day Masterclass students ask about batch timing and
// enrollment before paying. Single source of truth so the dashboard hero
// and any future placement never risk drifting to two different numbers
// or pre-filled messages.
export const WHATSAPP_MASTERCLASS_INQUIRY_LINK =
  'https://wa.me/919540123161?text=Hi%20Dr.%20Kapil,%20I%20want%20to%20know%20more%20about%20the%2030-Day%20Quantum%20Speed%20Reading%20Masterclass'

// Same number, enrollment-intent message — for placements (like the
// /reviews success-stories page) where the visitor has already seen the
// proof and is ready to join, not just asking to learn more.
export const WHATSAPP_ENROLLMENT_INQUIRY_LINK =
  'https://wa.me/919540123161?text=Hi%20Dr.%20Kapil,%20I%20want%20to%20enroll%20in%20the%20Masterclass'

// Same number, Free Live Intro Session-specific message — for the
// QsrLiveIntroSession section on the QSR landing page. There's no
// booking/calendar backend for this session yet (see that component's
// own doc comment for exactly where to wire one in later) — WhatsApp is
// the real interim registration path, not a placeholder standing in for
// a missing form.
export const WHATSAPP_FREE_INTRO_SESSION_LINK =
  'https://wa.me/919540123161?text=Hi%20Dr.%20Kapil,%20I%20want%20to%20join%20the%20free%2045-minute%20live%20intro%20session'

// Same number, program-agnostic message — for the homepage's floating
// widget and FAQ section, where the visitor may be asking about any of
// the five offers (Masterclass, Retreats, Mentoring, Course, Habit App),
// not specifically the Masterclass.
export const WHATSAPP_GENERAL_INQUIRY_LINK =
  'https://wa.me/919540123161?text=Hi%20Dr.%20Kapil,%20I%20have%20a%20question%20about%20your%20programs'

// Same number, 11-Day Online Retreat-specific message — for the
// dedicated /retreats/online-11-day landing page. No Razorpay payment
// link exists for the retreats (unlike the Masterclass's real ₹4,999
// link) — pricing and batch enrollment are WhatsApp-inquiry-based today,
// so this is the real primary conversion path for that page, not a
// placeholder standing in for a missing checkout.
export const WHATSAPP_RETREAT_INQUIRY_LINK =
  'https://wa.me/919540123161?text=Hi%20Dr.%20Kapil,%20I%20want%20to%20secure%20my%20spot%20in%20the%2011-Day%20Online%20Psychic%20%26%20Spiritual%20Retreat'

// Same number, Residential Retreat-specific message — for the dedicated
// /retreats/residential landing page. Like the online retreat, there's no
// Razorpay payment link for the residential retreats (real pricing exists
// — ₹35,000/₹45,000 per person — but seat confirmation is handled
// personally by Dr. Kapil's team given the small-cohort, multi-venue
// logistics), so WhatsApp is the real primary booking path, not a
// placeholder standing in for a missing checkout.
export const WHATSAPP_RESIDENTIAL_INQUIRY_LINK =
  'https://wa.me/919540123161?text=Hi%20Dr.%20Kapil,%20I%20want%20to%20secure%20my%20seat%20in%20a%20Residential%20Retreat'

// Same number, 1-on-1 Personal Class-specific message — for the
// dedicated /mentoring/personal-class landing page. No hosted checkout
// or persisted application database exists for this offer (real pricing
// is fully customised per person, decided after the short conversation
// step) — WhatsApp is the real primary application path, same pattern
// as every other offer on this site without a dedicated backend yet.
export const WHATSAPP_MENTORING_INQUIRY_LINK =
  'https://wa.me/919540123161?text=Hi%20Dr.%20Kapil,%20I%20want%20to%20apply%20for%201-on-1%20Personal%20Class%20Mentoring'

// Same number, Quantum Mindset & Habit Builder-specific message — for
// the dedicated /programs/habit-builder landing page. The real
// conversion path there is the "Start Free" signup CTA, not WhatsApp —
// this is only for pre-signup questions (e.g. about the Day 8+ ₹99
// one-time payment), same "inquiry, not primary checkout" role every
// other WHATSAPP_*_INQUIRY_LINK on this page plays for its own program.
export const WHATSAPP_HABIT_BUILDER_INQUIRY_LINK =
  'https://wa.me/919540123161?text=Hi%20Dr.%20Kapil,%20I%20have%20a%20question%20about%20the%20Quantum%20Mindset%20%26%20Habit%20Builder'

// Same number, pre-application "Talk to Our Team" message — for a visitor
// on /franchise-individual who wants to ask a question first, not a
// substitute for the instant-apply link below.
export const WHATSAPP_FRANCHISE_TEAM_INQUIRY_LINK =
  'https://wa.me/919540123161?text=Hi%20Dr.%20Kapil,%20I%20have%20a%20question%20about%20the%20Trainer%20Partner%20Program'

// Same number, the actual primary conversion path on /franchise-individual —
// a single-tap "Apply Instantly via WhatsApp" CTA with no typed fields
// required upfront (replaced the old name/phone/city form, which added
// drop-off friction the WhatsApp conversation itself doesn't need; those
// details are simply given in the chat that opens).
export const WHATSAPP_FRANCHISE_INSTANT_APPLY_LINK =
  'https://wa.me/919540123161?text=Hi%20Dr.%20Kapil,%20I%20want%20to%20apply%20to%20become%20a%20certified%20Quantum%20Speed%20Reading%20trainer%20partner.'

// Same number, used by the Franchise/Individual Trainer application form
// (/franchise-individual) to hand off every submitted field — this is the
// real, primary submission path for that form (WhatsApp-first, per
// explicit instruction): opened directly on submit, not just an
// inquiry-before-paying link like the others in this file. The franchise
// page's own Server Action (submitFranchiseLead.ts) separately saves the
// same fields to `franchise_leads` as a best-effort backup record — that
// insert must never block or delay this WhatsApp redirect.
export function buildFranchiseApplicationWhatsAppLink(details: {
  name: string
  phone: string
  city: string
  background: string
  whyInterested: string
}): string {
  const lines = [
    'New Franchise Application',
    `Name: ${details.name}`,
    `Phone: ${details.phone}`,
    `City: ${details.city}`,
  ]
  if (details.background.trim().length > 0) {
    lines.push(`Background: ${details.background.trim()}`)
  }
  if (details.whyInterested.trim().length > 0) {
    lines.push(`Why interested: ${details.whyInterested.trim()}`)
  }
  return `https://wa.me/919540123161?text=${encodeURIComponent(lines.join('\n'))}`
}

// Same number, used by the Personal Class application form to hand off
// the name/phone/city/situation the visitor already typed — so Dr.
// Kapil's team has real context before the conversation starts, same
// technique as buildResidentialWhatsAppLink below.
export function buildMentoringApplicationWhatsAppLink(details: {
  name: string
  phone: string
  city: string
  situation: string
}): string {
  const lines = [
    'Hi Dr. Kapil, I want to apply for 1-on-1 Personal Class Mentoring.',
    `Name: ${details.name}`,
    `Phone: ${details.phone}`,
    `City: ${details.city}`,
  ]
  if (details.situation.trim().length > 0) {
    lines.push(`What I'm dealing with: ${details.situation.trim()}`)
  }
  return `https://wa.me/919540123161?text=${encodeURIComponent(lines.join('\n'))}`
}

// Same number, Overthinking Mastery Course-specific message — for the
// dedicated /mentoring/overthinking-course landing page. Checkout and
// billing for this offer happen entirely on Classplus (see
// overthinkingCoursePaymentLink.ts), not on this site — this WhatsApp
// link is only for pre-purchase questions, not the primary conversion
// path (the Classplus link is).
export const WHATSAPP_COURSE_INQUIRY_LINK =
  'https://wa.me/919540123161?text=Hi%20Dr.%20Kapil,%20I%20have%20a%20question%20about%20the%20Overthinking%20Mastery%20Course'

// Same number, for placements on /retreats/residential that know which
// specific date or room type the visitor is interested in (a roadmap
// date card, a pricing tier) — pre-filling that detail into the message
// removes a step for the visitor and gives Dr. Kapil's team useful
// context before the conversation even starts.
export function buildResidentialWhatsAppLink(detail: string): string {
  return `https://wa.me/919540123161?text=${encodeURIComponent(`Hi Dr. Kapil, I want to secure my seat — ${detail}`)}`
}
