/** Seamless ambient mesh — fades into page bg, no hard edges. */
export function HomeBackdrop() {
  return (
    <div className="home-backdrop" aria-hidden>
      <div className="home-backdrop-glow home-backdrop-glow-a" />
      <div className="home-backdrop-glow home-backdrop-glow-b" />
      <div className="home-backdrop-glow home-backdrop-glow-c" />
      <div className="home-backdrop-vignette" />
    </div>
  );
}