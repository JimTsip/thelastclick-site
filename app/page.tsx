import Image from "next/image";
import BootScreen from "./components/BootScreen";
import ContactForm from "./components/ContactForm";
import Hud from "./components/Hud";
import TowerSceneMount from "./components/TowerSceneMount";
import { FLOORS, type Floor } from "./lib/floors";
import { GAMES, STUDIO_INSTAGRAM } from "./lib/games";

const PIXELS = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen"];
function FloorSection({ id, span, side, children }: Floor & { children: React.ReactNode }) {
  return <section className="floor" id={id} data-floor={id} data-side={side} style={{ "--span": span } as React.CSSProperties} aria-labelledby={id + "-title"}><div className="floor-inner">{children}</div></section>;
}
export default function Home() {
  const floor = (id: Floor["id"]) => FLOORS.find((f) => f.id === id)!;
  return <>
    <BootScreen />
    <a className="skip-link" href="#games">Skip to games</a>
    <div className="starfield" aria-hidden="true">{PIXELS.map((pixel) => <span key={pixel} className={"pixel pixel-" + pixel} />)}</div>
    <TowerSceneMount /><Hud />
    <header className="site-header">
      <a className="brand" href="#hero" aria-label="The Last Click home"><Image src="/TLC-logo.png" alt="The Last Click" width={200} height={148} priority /></a>
      <nav className="site-nav" aria-label="Main navigation"><a href="#games">Games</a><a href="#studio">Studio</a><a href="#contact">Contact</a></nav>
    </header>
    <main className="tower">
      <FloorSection {...floor("hero")}>
        <p className="studio-kicker">Independent game studio · Greece</p>
        <h1 id="hero-title"><span>Beyond the click.</span></h1>
        <p className="hero-chapter">A new chapter of play.</p>
        <p className="hero-tagline">The Last Click is an independent game studio based in Greece. We create BoomBoats, DADLINE: Family Rush and ShipDuel.</p>
        <a className="primary-link" href="#games">Explore our games <span aria-hidden="true">↘</span></a>
        <ul className="hero-games" aria-label="Meet our games">{GAMES.map((game) => <li key={game.id}><a href={"#" + game.id} aria-label={"Explore " + game.name}><Image src={game.logo} alt={game.name + " logo"} width={game.logoWidth} height={game.logoHeight} sizes="(max-width: 600px) 30vw, 240px" priority /></a></li>)}</ul>
      </FloorSection>
      <FloorSection {...floor("games")}>
        <p className="floor-eyebrow">Our games</p><h2 id="games-title">Find your next game.</h2>
        <p className="section-intro">Command a fleet. Run the family errands. Face a rival at sea.</p>
        <div className="games-grid">{GAMES.map((game) => <article className={"game-card game-card--" + game.id} id={game.id} key={game.id} aria-labelledby={game.id + "-title"}>
          <div className="game-art"><Image src={game.art} alt={game.artAlt} width={960} height={540} sizes="(max-width: 900px) 90vw, 30vw" /></div>
          <span className={"game-status " + (game.id === "shipduel" ? "game-status--soon" : "")}>{game.status}</span>
          <h3 id={game.id + "-title"}>{game.name}</h3><p className="game-invitation">{game.invitation}</p><p className="game-description">{game.description}</p>
          <div className="game-actions">
            {game.ios && <a href={game.ios} aria-label={"Download " + game.name + " on the App Store"}><Image src="/store-badges/app-store.png" alt="Download on the App Store" width={180} height={60} /></a>}
            {game.android && <a href={game.android} aria-label={"Get " + game.name + " on Google Play"}><Image src="/store-badges/google-play.png" alt="Get it on Google Play" width={180} height={60} /></a>}
            {!game.ios && <a className="text-link" href={STUDIO_INSTAGRAM}>Follow development <span aria-hidden="true">↗</span></a>}
          </div>
        </article>)}</div>
      </FloorSection>
      <FloorSection {...floor("gameplay")}>
        <p className="floor-eyebrow">Inside the games</p><h2 id="gameplay-title">This is how we play.</h2>
        <div className="gameplay-grid">{GAMES.map((game) => <figure className={"gameplay-capture gameplay-capture--" + game.id} key={game.id}>
          <a href={"#" + game.id} aria-label={"Explore " + game.name}><Image src={game.capture} alt={game.captureAlt} width={game.id === "shipduel" ? 1400 : 600} height={game.id === "shipduel" ? 650 : 1300} sizes="(max-width: 900px) 90vw, 40vw" /></a>
          <figcaption><strong>{game.name}</strong><span>{game.caption}</span>{game.id === "shipduel" && <small>Development gameplay · Coming soon</small>}</figcaption>
        </figure>)}</div>
      </FloorSection>
      <FloorSection {...floor("studio")}>
        <p className="floor-eyebrow">The studio</p><h2 id="studio-title">Made at The Last Click.</h2>
        <div className="studio-story">
          <p className="studio-lead">Games with character, humour and choices that matter.</p>
          <p>We are an independent game studio based in Greece. From the first sketch to the playable world, we bring our ideas to life through BoomBoats, DADLINE and ShipDuel.</p>
          <div className="studio-worlds">
            <div><span>01</span><h3>Make your move.</h3><p>A fleet hidden at sea. The square you choose changes what happens next.</p></div>
            <div><span>02</span><h3>Run the day.</h3><p>Everyday family chaos becomes a city adventure, one errand at a time.</p></div>
            <div><span>03</span><h3>Take the helm.</h3><p>Rival captains, cannon shots and the choice to keep sailing.</p></div>
          </div>
          <a className="text-link" href={STUDIO_INSTAGRAM}>Follow The Last Click <span aria-hidden="true">↗</span></a>
        </div>
      </FloorSection>
      <FloorSection {...floor("contact")}>
        <h2 id="contact-title">Let&rsquo;s talk games.</h2><p className="contact-body">Questions about our games, press enquiries or a collaboration? Get in touch.</p><ContactForm />
      </FloorSection>
    </main>
    <footer className="site-footer">
      <nav className="footer-links" aria-label="Footer navigation"><a href="#games">Games</a><a href="#studio">Studio</a><a href="#contact">Contact</a><a href={STUDIO_INSTAGRAM}>Instagram</a></nav>
      <p>The Last Click © 2026</p><p className="legal">THE LAST CLICK L.P. · Agiou Konstantinou 59-61, Maroussi 15124, Greece</p><p className="legal">GEMI Reg. No. 183032403000 · VAT EL802801218</p>
    </footer>
  </>;
}
