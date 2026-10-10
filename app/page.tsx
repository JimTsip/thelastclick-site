import Image from "next/image";
import BootScreen from "./components/BootScreen";
import ContactForm from "./components/ContactForm";
import Hud from "./components/Hud";
import TowerSceneMount from "./components/TowerSceneMount";
import { FLOORS } from "./lib/floors";

/**
 * Decorative pixels. They are the background when WebGL is unavailable or
 * hasn't loaded yet; the 3D scene hides them once it takes over.
 */
const PIXELS = [
  "one", "two", "three", "four", "five", "six", "seven",
  "eight", "nine", "ten", "eleven", "twelve", "thirteen",
];

/**
 * Each service is a "class" on a character-select screen: a big pixel icon,
 * a name, and two lines. The icons are 8×8 sprites drawn with box-shadow in
 * CSS (see .sprite-*), so they cost no images and scale with the type.
 */
const SERVICES = [
  {
    sprite: "brain",
    title: "AI-first products",
    body: "From a sentence to something people use. Model, interface, plumbing — and the judgment about which one is the hard part.",
    stat: "IDEA → SHIPPED",
  },
  {
    sprite: "phone",
    title: "Mobile apps & games",
    body: "Native, from the first sketch to a passed review. Games included — we have shipped our own, so we know where it bites.",
    stat: "iOS + ANDROID",
  },
  {
    sprite: "grid",
    title: "Web apps & design systems",
    body: "Interfaces that stay coherent as they grow, and the system underneath that keeps them that way.",
    stat: "SYSTEM-FIRST",
  },
];

/** The scoreboard. Rank, name, dotted leader, the fact. */
const PROOF = [
  { rank: "1ST", title: "From brief to live", value: "The whole distance, every time" },
  { rank: "2ND", title: "AI in production", value: "Answering, deciding, doing real work" },
  { rank: "3RD", title: "We ship what we sell", value: "Built for ourselves first" },
];

/** The pipeline. Four stages, one line, arrows between. */
/** Four gates. AI is inside every one of them — that is the point. */
const PROCESS = [
  { step: "01", sprite: "target", title: "Frame", body: "AI reads the brief, the market and the edge cases with us. We find the real problem before anyone opens an editor." },
  { step: "02", sprite: "pencil", title: "Design", body: "AI drafts twenty directions; taste picks one. Decisions are cheap on a canvas and we make a lot of them, fast." },
  { step: "03", sprite: "hammer", title: "Build", body: "AI writes alongside us — weeks, not quarters. It raises the floor; judgment raises the ceiling." },
  { step: "04", sprite: "rocket", title: "Ship", body: "AI runs inside the product, and around it: monitoring, support, the next iteration. Compiling isn't finished." },
];

function FloorSection({
  id,
  span,
  side,
  children,
}: {
  id: string;
  span: number;
  side: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="floor"
      id={id}
      data-floor={id}
      data-side={side}
      style={{ "--span": span } as React.CSSProperties}
      aria-labelledby={`${id}-title`}
    >
      <div className="floor-inner">{children}</div>
    </section>
  );
}

export default function Home() {
  const floor = (id: string) => FLOORS.find((f) => f.id === id)!;

  return (
    <>
      <BootScreen />
      <a className="skip-link" href="#contact">
        Skip to contact
      </a>

      <div className="starfield" aria-hidden="true">
        {PIXELS.map((pixel) => (
          <span key={pixel} className={`pixel pixel-${pixel}`} />
        ))}
      </div>

      <TowerSceneMount />
      <Hud />

      <header className="site-header">
        <a className="brand" href="#hero" aria-label="The Last Click home">
          <Image src="/TLC-logo.png" alt="The Last Click" width={200} height={148} priority />
        </a>
        <a className="contact-link" href="#contact">
          Contact
        </a>
      </header>

      <main className="tower">
        <FloorSection {...floor("hero")}>
          <h1 id="hero-title">
            <span>AI First.</span>
            <span>Bold Ideas.</span>
            <span className="accent-line">One Last Click.</span>
          </h1>
          <p className="hero-tagline">
            We turn ambitious ideas into AI-powered products that actually work.
          </p>
          <p className="scroll-cue" aria-hidden="true">
            Scroll to descend
          </p>
        </FloorSection>

        <FloorSection {...floor("services")}>
          <p className="floor-eyebrow">What we build</p>
          <h2 id="services-title">Three things, done properly.</h2>
          <ul className="roster">
            {SERVICES.map((service, index) => (
              <li key={service.title} className="roster-card">
                <span className={`sprite sprite-${service.sprite}`} aria-hidden="true" />
                <span className="roster-index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{service.title}</h3>
                <p>{service.body}</p>
                <span className="roster-stat">{service.stat}</span>
              </li>
            ))}
          </ul>
        </FloorSection>

        <FloorSection {...floor("proof")}>
          <p className="floor-eyebrow">Track record</p>
          <h2 id="proof-title">Shipped, not shelved.</h2>
          <ol className="scoreboard">
            {PROOF.map((row) => (
              <li key={row.title} className="score-row">
                <span className="score-rank">{row.rank}</span>
                <h3 className="score-name">{row.title}</h3>
                <span className="score-leader" aria-hidden="true" />
                <span className="score-value">{row.value}</span>
              </li>
            ))}
          </ol>
        </FloorSection>

        <FloorSection {...floor("process")}>
          <p className="floor-eyebrow">How we work</p>
          <h2 id="process-title">Four gates, in order.</h2>
          <p className="floor-sub">AI-powered at every one of them.</p>
          <ol className="pipeline">
            {PROCESS.map((stage, index) => (
              <li key={stage.step} className="stage" style={{ "--i": index } as React.CSSProperties}>
                <span className={`sprite sprite-${stage.sprite}`} aria-hidden="true" />
                <span className="stage-number" aria-hidden="true">
                  {stage.step}
                </span>
                <h3>{stage.title}</h3>
                <p>{stage.body}</p>
              </li>
            ))}
          </ol>
        </FloorSection>

        <FloorSection {...floor("contact")}>
          <h2 id="contact-title">Let&rsquo;s build what should exist next.</h2>
          <p className="contact-body">
            Tell us the idea you cannot stop thinking about. We will tell you honestly
            whether we are the right people to build it.
          </p>
          <ContactForm />
        </FloorSection>
      </main>

      <footer className="site-footer">
        <p>The Last Click © 2026</p>
        <p className="legal">
          THE LAST CLICK L.P. · Agiou Konstantinou 59-61, Maroussi 15124, Greece
        </p>
        <p className="legal">GEMI Reg. No. 183032403000 · VAT EL802801218</p>
      </footer>
    </>
  );
}
