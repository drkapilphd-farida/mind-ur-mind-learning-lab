export default function FrequencyDial(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 800 800"
      className="h-full w-full"
      aria-hidden="true"
      focusable="false"
    >
      <g className="origin-center animate-spin-slow">
        <circle cx="400" cy="400" r="180" fill="none" stroke="rgba(237,238,243,0.20)" strokeWidth="1" />
        <circle
          cx="400"
          cy="400"
          r="180"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="1"
          strokeDasharray="2 10"
          opacity="0.7"
        />
      </g>
      <g className="origin-center animate-spin-slow-rev">
        <circle cx="400" cy="400" r="270" fill="none" stroke="rgba(237,238,243,0.20)" strokeWidth="1" />
      </g>
      <g className="origin-center animate-spin-slow">
        <circle cx="400" cy="400" r="340" fill="none" stroke="rgba(237,238,243,0.20)" strokeWidth="1" />
        <circle
          cx="400"
          cy="400"
          r="340"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="1"
          strokeDasharray="2 10"
          opacity="0.7"
        />
      </g>
      <circle cx="400" cy="400" r="90" fill="none" stroke="rgba(237,238,243,0.20)" strokeWidth="1" opacity="0.6" />
    </svg>
  );
}
