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

// Same number, for placements on /retreats/residential that know which
// specific date or room type the visitor is interested in (a roadmap
// date card, a pricing tier) — pre-filling that detail into the message
// removes a step for the visitor and gives Dr. Kapil's team useful
// context before the conversation even starts.
export function buildResidentialWhatsAppLink(detail: string): string {
  return `https://wa.me/919540123161?text=${encodeURIComponent(`Hi Dr. Kapil, I want to secure my seat — ${detail}`)}`
}
