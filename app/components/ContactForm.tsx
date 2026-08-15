"use client";

import { FormEvent, useState } from "react";

/**
 * The contact form.
 *
 * Same relay as jimtsipoutas.com: formsubmit.co's AJAX endpoint, so a static
 * site can take enquiries with no server of its own. The address is on the
 * relay's side, not in the page — nothing here exposes hello@ to scrapers.
 *
 * Styled as the game's console rather than a web form: a prompt, three
 * fields, one command. See .console-* in globals.css.
 */
const CONTACT_RELAY = "https://formsubmit.co/ajax/hello@thelastclick.gr";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form).entries());
    const clean = (value: unknown, max: number) =>
      typeof value === "string" ? value.trim().slice(0, max) : "";

    // Honeypot: bots fill the hidden field, so answer "sent" and post nothing.
    if (clean(fields.website, 200)) {
      form.reset();
      setStatus("sent");
      return;
    }

    const name = clean(fields.name, 100);
    const email = clean(fields.email, 180);
    const message = clean(fields.message, 3000);

    if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch(CONTACT_RELAY, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          _subject: `New enquiry from ${name} — thelastclick.gr`,
          _template: "table",
          _captcha: "false",
          _url: "https://thelastclick.gr",
          name,
          email,
          message,
        }),
      });
      const result = (await response.json().catch(() => null)) as { success?: boolean | string } | null;
      const ok = result?.success === true || result?.success === "true";
      if (!response.ok || !ok) throw new Error("relay failed");
      form.reset();
      setStatus("sent");
      // The one thing on this page worth calling a conversion. gtag is loaded
      // by layout.tsx; guard so a blocked tag never breaks the form.
      const w = window as Window & { gtag?: (...args: unknown[]) => void };
      w.gtag?.("event", "contact_submit", { method: "console_form" });
    } catch {
      setStatus("error");
      const w = window as Window & { gtag?: (...args: unknown[]) => void };
      w.gtag?.("event", "contact_error", { method: "console_form" });
    }
  };

  return (
    <form className="console" onSubmit={submit} noValidate>
      <p className="console-line" aria-hidden="true">
        <span className="console-prompt">&gt;</span> new_project.init
      </p>

      <label className="console-field">
        <span className="console-label">name</span>
        <input name="name" type="text" autoComplete="name" required maxLength={100} />
      </label>

      <label className="console-field">
        <span className="console-label">email</span>
        <input name="email" type="email" autoComplete="email" required maxLength={180} />
      </label>

      <label className="console-field console-field--wide">
        <span className="console-label">the idea</span>
        <textarea name="message" rows={4} required maxLength={3000} />
      </label>

      <input
        className="console-honey"
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div className="console-actions">
        <button type="submit" className="console-submit" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send it"}
          <span aria-hidden="true"> ▸</span>
        </button>
        <p className="console-status" role="status" aria-live="polite">
          {status === "sent" && "Received. We read everything — expect a reply within two working days."}
          {status === "error" && "Something's missing — a name, a real email address and the idea."}
        </p>
      </div>
    </form>
  );
}
