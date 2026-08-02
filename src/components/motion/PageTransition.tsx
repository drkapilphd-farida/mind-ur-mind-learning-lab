// Sprint-12D — Motion Language™. One shared entrance used by every
// `template.tsx` in the Quantum Speed Reading™ experience — Next.js
// remounts `template.tsx` on every navigation (unlike `layout.tsx`), so
// this is what gives Dashboard → Journey → Exercise → Completion → Next
// Exercise one consistent transition instead of an instant swap.
// Reduced-motion fallback is handled globally (globals.css), so this is
// pure CSS — no client boundary, no JS state.
export function PageTransition({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <div className="animate-in fade-in slide-in-from-bottom-1 duration-(--duration-slow) ease-out">{children}</div>
}
