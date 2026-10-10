import Image from "next/image";
import BootScreen from "./components/BootScreen";
import ContactForm from "./components/ContactForm";
import Hud from "./components/Hud";
import TowerSceneMount from "./components/TowerSceneMount";
import { FLOORS, type Floor } from "./lib/floors";

const PIXELS = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen"];
function FloorSection({ id, span, side, children }: Floor & { children: React.ReactNode }) {
  return <section className={id === "hero" ? "floor" : "floor floor--editorial"} id={id} data-floor={id} data-side={side} style={{ "--span": span } as React.CSSProperties} aria-labelledby={id + "-title"}><div className="floor-inner">{children}</div></section>;
}
export default function Home() {
  const floor = (id: Floor["id"]) => FLOORS.find((f) => f.id === id)!;
  return <>
    <BootScreen />
    <a className="skip-link" href="#studio">Skip to studio</a>
    <div className="starfield" aria-hidden="true">{PIXELS.map((pixel) => <span key={pixel} className={"pixel pixel-" + pixel} />)}</div>
    <TowerSceneMount /><Hud />
    <header className="site-header">
      <a className="brand" href="#hero" aria-label="The Last Click home"><Image src="/TLC-logo.png" alt="The Last Click" width={200} height={148} priority /></a>
      <nav className="site-nav" aria-label="Main navigation"><a href="#studio">Studio</a><a href="#contact">Contact</a></nav>
    </header>
    <main className="tower">
      <FloorSection {...floor("hero")}>
        <p className="studio-kicker">Independent studio · Greece</p>
        <h1 id="hero-title"><span>Beyond the click.</span></h1>
        <p className="hero-chapter">A new chapter begins.</p>
        <p className="hero-tagline">The Last Click is an independent studio based in Greece. We bring ideas to life through thoughtful design and carefully crafted digital experiences.</p>
        <a className="primary-link" href="#studio">Meet the studio <span aria-hidden="true">↘</span></a>
      </FloorSection>
      <FloorSection {...floor("studio")}>
        <p className="floor-eyebrow">The studio</p><h2 id="studio-title">Ideas with purpose.</h2>
        <div className="studio-story">
          <p className="studio-lead">Curiosity starts the conversation. Care shapes the result.</p>
          <p>We are an independent studio based in Greece. We explore ideas, ask questions and work through the details that turn a first spark into something people can experience.</p>
          <p>From the earliest sketch to the final click, our focus is simple: clear thinking, thoughtful design and work we are proud to put into the world.</p>
        </div>
      </FloorSection>
      <FloorSection {...floor("contact")}>
        <h2 id="contact-title">Let&rsquo;s talk.</h2><p className="contact-body">Have an idea, a question or a collaboration in mind? We would love to hear from you.</p><ContactForm />
      </FloorSection>
    </main>
    <footer className="site-footer">
      <nav className="footer-links" aria-label="Footer navigation"><a href="#studio">Studio</a><a href="#contact">Contact</a></nav>
      <p>The Last Click © 2026</p><p className="legal">THE LAST CLICK L.P. · Agiou Konstantinou 59-61, Maroussi 15124, Greece</p><p className="legal">GEMI Reg. No. 183032403000 · VAT EL802801218</p>
    </footer>
  </>;
}
