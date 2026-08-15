import Image from "next/image";
import { FLOORS } from "./lib/floors";

/**
 * Decorative pixels. They are the background when WebGL is unavailable or
 * hasn't loaded yet; the 3D scene hides them once it takes over.
 */
const PIXELS = [
  "one", "two", "three", "four", "five", "six", "seven",
  "eight", "nine", "ten", "eleven", "twelve", "thirteen",
];

const SERVICES = [
  {
    title: "AI-first products",
    body: "You bring the ambition. We take it from a sentence to something people can actually use — the model, the interface, the plumbing underneath, and the judgment about which of the three is actually the hard part.",
  },
  {
    title: "Mobile apps & games",
    body: "Native iOS and Android, from the first sketch to a passed review. We have walked our own work through both stores, so we know where they bite.",
  },
  {
    title: "Web apps & design systems",
    body: "Interfaces that stay coherent as they grow, and the system underneath that keeps them that way once more than one person is touching them.",
  },
];

const PROOF = [
  {
    title: "From idea to store",
    body: "Our own products go the whole distance — design, build, submission, review, release. Nothing gets handed off at the interesting part.",
  },
  {
    title: "iOS and Android",
    body: "Both platforms. Both review processes. Both sets of unwritten rules, learned the expensive way so you don't have to.",
  },
  {
    title: "We ship what we sell",
    body: "Every technique on this page came out of building something real first. We are our own most demanding client.",
  },
];

const PROCESS = [
  {
    step: "01",
    title: "Frame",
    body: "Find the real problem. Most briefs describe a solution — we go looking for what's underneath it before anyone opens an editor.",
  },
  {
    step: "02",
    title: "Design",
    body: "Draw it before building it. Decisions are cheap on a canvas and expensive in code.",
  },
  {
    step: "03",
    title: "Build",
    body: "Ship in weeks, not quarters. AI raises the floor, not the ceiling — taste and judgment still do the hard part.",
  },
  {
    step: "04",
    title: "Ship",
    body: "Through review and into hands. The work isn't finished when it compiles.",
  },
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
      <a className="skip-link" href="#contact">
        Skip to contact
      </a>

      <div className="starfield" aria-hidden="true">
        {PIXELS.map((pixel) => (
          <span key={pixel} className={`pixel pixel-${pixel}`} />
        ))}
      </div>

      <header className="site-header">
        <a className="brand" href="#hero" aria-label="The Last Click home">
          <Image src="/TLC-logo.png" alt="The Last Click" width={200} height={148} priority />
        </a>
        <a className="contact-link" href="mailto:hello@thelastclick.gr">
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
          <ul className="card-list">
            {SERVICES.map((service) => (
              <li key={service.title}>
                <h3>{service.title}</h3>
                <p>{service.body}</p>
              </li>
            ))}
          </ul>
        </FloorSection>

        <FloorSection {...floor("proof")}>
          <p className="floor-eyebrow">Track record</p>
          <h2 id="proof-title">Shipped, not shelved.</h2>
          <ul className="card-list">
            {PROOF.map((item) => (
              <li key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </li>
            ))}
          </ul>
        </FloorSection>

        <FloorSection {...floor("process")}>
          <p className="floor-eyebrow">How we work</p>
          <h2 id="process-title">Four gates, in order.</h2>
          <ol className="step-list">
            {PROCESS.map((item) => (
              <li key={item.step}>
                <span className="step-number" aria-hidden="true">
                  {item.step}
                </span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
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
          <a className="contact-cta" href="mailto:hello@thelastclick.gr">
            hello@thelastclick.gr
          </a>
        </FloorSection>
      </main>

      <footer className="site-footer">
        <p>The Last Click © 2026</p>
      </footer>
    </>
  );
}
