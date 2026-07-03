/**
 * Animated Synora wordmark: the reveal ignites from the four-point star
 * at the center of the S icon, then wipes the wordmark in left-to-right
 * with a metallic light sweep. Loops every ~5.2s. Keyframes live in
 * app/globals.css (.synora-logo*); respects prefers-reduced-motion.
 */
export function SynoraLogo({
  width,
  className = "",
}: {
  /** Fixed pixel width. Omit to size via `className` (e.g. `w-full`). */
  width?: number;
  className?: string;
}) {
  return (
    <div
      className={`synora-logo ${className}`}
      style={{ width, aspectRatio: "640 / 219" }}
    >
      <div className="synora-logo-halo" />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="synora-logo-icon"
        src="/brand/synora-wordmark.webp"
        alt=""
        aria-hidden="true"
      />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="synora-logo-word"
        src="/brand/synora-wordmark.webp"
        alt="Synora"
      />

      <div
        className="synora-logo-shimmer"
        style={{
          WebkitMaskImage: "url(/brand/synora-wordmark.webp)",
          maskImage: "url(/brand/synora-wordmark.webp)",
        }}
      />

      <div className="synora-logo-glow" />
      <div className="synora-logo-ray synora-logo-ray-v" />
      <div className="synora-logo-ray synora-logo-ray-h" />
      <div className="synora-logo-core" />
    </div>
  );
}
