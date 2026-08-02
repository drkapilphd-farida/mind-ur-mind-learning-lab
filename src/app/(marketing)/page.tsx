import { redirect } from 'next/navigation'

// One-Click Entry™ — app.mindurmind.org.in's root now goes straight to
// the real front door (see /welcome/page.tsx) instead of rendering the
// full marketing homepage (hero/audiences/pricing/FAQ) that used to live
// here. That content was built before the marketing site split into its
// own separate static deployment (www.mindurmind.org.in, outside this
// repo) — this app's own domain is meant to be the product itself, not a
// second copy of the marketing surface. The original JSX is fully
// preserved in git history (see this file's history before this commit)
// if it's ever needed again, e.g. repurposed at a different route.
export default function HomePage(): never {
  redirect('/welcome/choose-method')
}
