import Image from "next/image";
import Link from "next/link";

const SIGNALS = [
  { label: "Atlas", role: "Research", state: "Synthesizing", x: "13%", y: "28%", delay: "0s" },
  { label: "Mira", role: "Build", state: "Shipping", x: "72%", y: "18%", delay: "-.8s" },
  { label: "Nova", role: "Social", state: "Draft ready", x: "79%", y: "69%", delay: "-1.5s" },
  { label: "Echo", role: "Ops", state: "Monitoring", x: "17%", y: "72%", delay: "-2.1s" },
];

const CAPABILITIES = [
  ["01", "Seat specialists", "Build a persistent roster of focused agents. Give each one context, tools, and a clear lane."],
  ["02", "Direct the floor", "Turn a goal into parallel work across research, build, social, and operations desks."],
  ["03", "Keep the gate", "Agents move fast. Every consequential send, spend, delete, or post still waits for you."],
];

export function LandingPage() {
  return (
    <div className="landing-shell">
      <header className="landing-nav">
        <Link href="/" className="brand-lockup" aria-label="AgentDesk home">
          <span className="brand-glyph"><BrandMark /></span>
          <span>agentdesk</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
          <a href="#system">System</a>
          <a href="#workflow">Workflow</a>
          <a href="#control">Control</a>
        </nav>
        <Link href="/dashboard" className="nav-launch">
          Enter the floor <Arrow />
        </Link>
      </header>

      <main>
        <section className="hero-section" id="system">
          <div className="hero-aurora" aria-hidden />
          <div className="hero-grid" aria-hidden />
          <div className="hero-copy">
            <div className="eyebrow landing-reveal" style={{ animationDelay: ".05s" }}>
              <span className="status-pulse" /> Autonomous work, under human command
            </div>
            <h1 className="landing-reveal" style={{ animationDelay: ".12s" }}>
              Your agents.<br />
              <span>One living system.</span>
            </h1>
            <p className="hero-lede landing-reveal" style={{ animationDelay: ".2s" }}>
              Seat a team of AI specialists, orchestrate work across desks, and keep every critical move behind a human gate.
            </p>
            <div className="hero-actions landing-reveal" style={{ animationDelay: ".28s" }}>
              <Link href="/dashboard" className="primary-cta">
                Open your desk <Arrow />
              </Link>
              <a href="#workflow" className="text-cta">
                See how it works <span>↓</span>
              </a>
            </div>
            <div className="hero-proof landing-reveal" style={{ animationDelay: ".36s" }}>
              <div className="proof-faces" aria-hidden>
                {["/agent-avatars/agent-005.png", "/agent-avatars/agent-018.png", "/agent-avatars/agent-031.png", "/agent-avatars/agent-044.png"].map((src) => (
                  <Image key={src} src={src} alt="" width={34} height={34} />
                ))}
              </div>
              <p><strong>120 specialist profiles</strong><br />ready to take a seat</p>
            </div>
          </div>

          <div className="hero-visual landing-reveal" style={{ animationDelay: ".22s" }} aria-label="Live agent coordination preview">
            <div className="visual-chrome">
              <span><i /> Floor / Command</span>
              <span className="chrome-id">AD–0921</span>
            </div>
            <div className="orbit-stage">
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <div className="orbit-cross" />
              <div className="core-node">
                <span className="core-scan" />
                <BrandMark />
                <small>YOU</small>
              </div>
              {SIGNALS.map((signal) => (
                <div
                  key={signal.label}
                  className="agent-signal"
                  style={{ left: signal.x, top: signal.y, animationDelay: signal.delay }}
                >
                  <span className="signal-dot" />
                  <div>
                    <strong>{signal.label}</strong>
                    <small>{signal.role} · {signal.state}</small>
                  </div>
                </div>
              ))}
              <svg className="connection-map" viewBox="0 0 800 620" preserveAspectRatio="none" aria-hidden>
                <path d="M398 304 C286 210 164 166 98 171 M406 298 C520 204 637 150 687 127 M410 318 C536 362 625 420 706 447 M389 320 C280 382 170 438 124 450" />
              </svg>
              <div className="telemetry-card telemetry-top">
                <span>Output velocity</span><strong>+38.2%</strong>
                <i><b style={{ width: "78%" }} /></i>
              </div>
              <div className="telemetry-card telemetry-bottom">
                <span>Human gates</span><strong>03</strong>
                <small>Waiting on your call</small>
              </div>
            </div>
            <div className="visual-footer">
              <span><i className="live-dot" /> 8 agents live</span>
              <span>Latency 42ms</span>
              <span>Guardrails armed</span>
            </div>
          </div>
        </section>

        <section className="signal-marquee" aria-label="Product principles">
          <div>
            {Array.from({ length: 2 }).map((_, index) => (
              <span key={index}>
                MULTI–AGENT ORCHESTRATION <i>✦</i> HUMAN–IN–THE–LOOP <i>✦</i> LIVE OPERATIONAL MEMORY <i>✦</i> WALLET–NATIVE CONTROL <i>✦</i>&nbsp;
              </span>
            ))}
          </div>
        </section>

        <section className="workflow-section" id="workflow">
          <div className="section-heading">
            <p className="eyebrow">A calmer command layer</p>
            <h2>Turn intent into<br /><em>coordinated motion.</em></h2>
            <p>AgentDesk makes parallel AI work legible. Every agent has a seat. Every task has a trail. Every risky action has a gate.</p>
          </div>
          <div className="capability-list">
            {CAPABILITIES.map(([index, title, body]) => (
              <article key={index}>
                <span>{index}</span>
                <div><h3>{title}</h3><p>{body}</p></div>
                <div className="capability-mark"><Arrow /></div>
              </article>
            ))}
          </div>
        </section>

        <section className="control-section" id="control">
          <div className="control-panel">
            <div className="control-copy">
              <p className="eyebrow">Human control, structurally enforced</p>
              <h2>Speed without<br />the stomach drop.</h2>
              <p>Your agents can research, build, and prepare actions independently. The consequential last step remains unmistakably yours.</p>
              <Link href="/approvals">Explore the approval gate <Arrow /></Link>
            </div>
            <div className="approval-stack" aria-label="Approval inbox preview">
              <div className="approval-meta"><span>03 actions waiting</span><small>Live queue</small></div>
              <article>
                <div className="approval-icon">↗</div>
                <div><small>EXTERNAL POST</small><strong>Publish launch thread to X</strong><p>Prepared by Nova · Social desk</p></div>
                <span className="risk-chip">Review</span>
              </article>
              <article>
                <div className="approval-icon">◎</div>
                <div><small>SPEND</small><strong>Increase research budget</strong><p>Requested by Atlas · Research desk</p></div>
                <span className="risk-chip">$48</span>
              </article>
              <div className="approval-action">
                <span><i /> Guardrails active</span>
                <button type="button">Approve selected <Arrow /></button>
              </div>
            </div>
          </div>
        </section>

        <section className="closing-section">
          <div className="closing-orbit" aria-hidden><span /></div>
          <p className="eyebrow">The floor is ready</p>
          <h2>Give your agents<br /><span>somewhere to work.</span></h2>
          <Link href="/dashboard" className="primary-cta">Enter AgentDesk <Arrow /></Link>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="brand-lockup"><span className="brand-glyph"><BrandMark /></span><span>agentdesk</span></div>
        <p>Your agents. One desk.</p>
        <span>© 2026 / SYSTEM ONLINE</span>
      </footer>
    </div>
  );
}

function BrandMark() {
  return (
    <Image
      src="/agentdesk-logo.png"
      alt=""
      width={512}
      height={512}
      className="brand-mark-image"
    />
  );
}

function Arrow() {
  return <svg viewBox="0 0 20 20" fill="none" aria-hidden><path d="M4 10h11M11 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
