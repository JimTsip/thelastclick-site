import Image from "next/image";

const pixels = [
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
];

export default function Home() {
  return (
    <main className="landing-shell">
      <div className="violet-atmosphere" aria-hidden="true" />
      <div className="blue-atmosphere" aria-hidden="true" />

      {pixels.map((pixel) => (
        <span key={pixel} className={`pixel pixel-${pixel}`} aria-hidden="true" />
      ))}

      <header className="site-header">
        <a className="brand" href="#top" aria-label="The Last Click home">
          <Image src="/TLC-logo.png" alt="The Last Click" width={260} height={145} priority />
        </a>
        <a className="contact-link" href="mailto:hello@thelastclick.gr">
          Contact
        </a>
      </header>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <h1 id="hero-title">
          <span>AI First.</span>
          <span>Bold Ideas.</span>
          <span className="accent-line">One Last Click.</span>
        </h1>
        <p className="hero-tagline">
          We turn ambitious ideas into AI-powered products that actually work.
        </p>
      </section>

      <footer className="site-footer">
        <p>The Last Click © 2026</p>
      </footer>
    </main>
  );
}
