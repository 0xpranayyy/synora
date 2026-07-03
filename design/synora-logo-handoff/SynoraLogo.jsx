// SynoraLogo.jsx — animated Synora logo reveal (React)
// Drop-in component. Requires SynoraLogo.css and synora-wordmark.webp.
//
// Usage:
//   import SynoraLogo from "./SynoraLogo";
//   <SynoraLogo width={520} />
//
// Notes:
// - Transparent background: inherits whatever is behind it (built for dark UIs).
// - Pure CSS keyframes over one raster image — no JS animation loop, GPU-cheap.
// - `wordmark` prop lets you point at the asset path your bundler resolves.

import "./SynoraLogo.css";
import wordmarkSrc from "./synora-wordmark.webp"; // or use a string path from /public

export default function SynoraLogo({
  width = 520,
  src = wordmarkSrc,
  className = "",
  style = {},
}) {
  // The mark keeps its native 640:219 aspect ratio.
  return (
    <div
      className={`synlogo ${className}`}
      style={{ width, aspectRatio: "640 / 219", ...style }}
    >
      {/* soft ambient halo behind the icon */}
      <div className="synlogo__halo" />

      {/* the S icon (left 29% of the mark) — scales out of the center spark */}
      <img className="synlogo__icon" src={src} alt="" aria-hidden="true" />

      {/* the SYNORA wordmark (accessible name lives here) */}
      <img className="synlogo__word" src={src} alt="Synora" />

      {/* specular shimmer, masked to the logo pixels */}
      <div
        className="synlogo__shimmer"
        style={{
          WebkitMaskImage: `url(${src})`,
          maskImage: `url(${src})`,
        }}
      />

      {/* center ignition: glow + 4-point cross flare + bright core */}
      <div className="synlogo__glow" />
      <div className="synlogo__ray synlogo__ray--v" />
      <div className="synlogo__ray synlogo__ray--h" />
      <div className="synlogo__core" />
    </div>
  );
}
