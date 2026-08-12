import Link from "next/link";
import { IconSeo, IconWebDev, IconWorkflows } from "@/components/ServiceIcons";
import styles from "./page.module.css";

const faqs = [
  {
    q: "What does Raider Digital do?",
    a: "We design and build websites and the digital systems around them — how customers find you, take action online, and how your team handles the work that follows.",
  },
  {
    q: "Who is this for?",
    a: "Service businesses that need more than a brochure site: contractors, clinics, operators, shops, and other local teams where customers and staff need clear next steps online.",
  },
  {
    q: "How is this different from a typical web agency?",
    a: "We care about the website and the machinery behind it — intake, discovery, payments, and the staff workflows that handle exceptions when the real world does not match the form.",
  },
  {
    q: "How do I start a project?",
    a: "Use Start a Project to describe what you need in plain language, fill out a project brief, and send one clear request to Raider. Scope is confirmed after you send it — there is no surprise automated charge on the form.",
  },
  {
    q: "Do I have to chat with AI to start?",
    a: "No. You can fill out a project brief directly. Conversation is one way to help fill that brief when it is available — both paths create one clear project request, not a chatbot identity for Raider.",
  },
  {
    q: "What happens after I send a project request?",
    a: "Raider reviews the brief you sent and follows up on next steps. You keep a clear record of what you asked for instead of a loose email thread alone.",
  },
];

const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://raiderdigital.dev/#organization",
      name: "Raider Digital",
      url: "https://raiderdigital.dev/",
      logo: "https://raiderdigital.dev/images/raider/logo-horizontal.png",
    },
    {
      "@type": "WebSite",
      "@id": "https://raiderdigital.dev/#website",
      name: "Raider Digital",
      url: "https://raiderdigital.dev/",
      publisher: { "@id": "https://raiderdigital.dev/#organization" },
    },
    {
      "@type": "WebPage",
      "@id": "https://raiderdigital.dev/#webpage",
      url: "https://raiderdigital.dev/",
      name: "Raider Digital | Websites, Local SEO, and Workflows for Service Businesses",
      isPartOf: { "@id": "https://raiderdigital.dev/#website" },
      about: { "@id": "https://raiderdigital.dev/#organization" },
    },
    {
      "@type": "FAQPage",
      "@id": "https://raiderdigital.dev/#faq",
      mainEntity: faqs.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      })),
    },
  ],
};

export default function HomePage() {
  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      {/* Hero */}
      <section className={styles.hero} aria-labelledby="home-h1">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Websites · SEO · Workflows</p>
          <h1 id="home-h1" className={styles.h1}>
            Websites and systems that help service businesses{" "}
            <span className={styles.em}>get customers</span> and{" "}
            <span className={styles.em}>run work</span>
          </h1>
          <p className={styles.lead}>
            Raider Digital designs and builds customer-facing sites, local
            discovery, online intake, and the staff workflows that handle what
            happens next — including the messy exceptions when reality does not
            match the form.
          </p>
          <div className={styles.actions}>
            <Link href="/project-intake" className={styles.btnPrimary}>
              Start a Project
            </Link>
            <a href="#how-it-works" className={styles.btnSecondary}>
              How it works
            </a>
          </div>
        </div>
        {/* Compositional character art — CSS background layer (not semantic content) */}
        <div
          className={styles.heroMediaSurface}
          aria-hidden="true"
          role="presentation"
        />
      </section>

      {/* Direct answer */}
      <section className={styles.answer} aria-labelledby="answer-h2">
        <div className={styles.answerInner}>
          <h2 id="answer-h2" className={styles.h2}>
            Built for service businesses — not brochure theater
          </h2>
          <p>
            Start a project to describe what you need in plain language, or fill
            out a short project brief, and send one clear request to Raider. You
            do not have to pick a package or perform for a chatbot to get
            started.
          </p>
        </div>
      </section>

      {/* Services */}
      <section id="services" className={styles.services} aria-labelledby="services-h2">
        <div className={styles.sectionHead}>
          <p className={styles.eyebrowDark}>What we build</p>
          <h2 id="services-h2" className={styles.h2}>
            Three ways we help you grow
          </h2>
          <p className={styles.sectionLead}>
            Overview only — each area can go deeper on its own page later. For
            now, start a project and tell us where it hurts.
          </p>
        </div>
        <div className={styles.cards}>
          <article className={styles.card}>
            <div className={styles.cardIcon} aria-hidden>
              <IconWebDev />
            </div>
            <h3 className={styles.h3}>Web Development</h3>
            <p>
              Fast, modern sites built to look right, load cleanly, and convert
              visitors into customers — including redesigns and practical web
              apps when a brochure is not enough.
            </p>
            <ul className={styles.cardList}>
              <li>Custom, responsive design</li>
              <li>Performance-minded builds</li>
              <li>Maintainable structure</li>
            </ul>
          </article>
          <article className={styles.card}>
            <div className={`${styles.cardIcon} ${styles.cardIconSeo}`} aria-hidden>
              <IconSeo />
            </div>
            <h3 className={styles.h3}>SEO</h3>
            <p>
              Local discovery work that helps the right customers find you first
              — on Google, Maps, and the pages they land on after the click.
            </p>
            <ul className={styles.cardList}>
              <li>Google Business Profile support</li>
              <li>Local findability</li>
              <li>Content that answers real questions</li>
            </ul>
          </article>
          <article className={styles.card}>
            <div className={`${styles.cardIcon} ${styles.cardIconUx}`} aria-hidden>
              <IconWorkflows />
            </div>
            <h3 className={styles.h3}>UX/UI &amp; Workflows</h3>
            <p>
              Customer experiences and staff systems that make the next step
              obvious — forms, booking-style flows, handoffs, and exception paths
              when the real world gets messy.
            </p>
            <ul className={styles.cardList}>
              <li>Conversion-focused flows</li>
              <li>Intake and routing</li>
              <li>Staff-side clarity</li>
            </ul>
          </article>
        </div>
      </section>

      {/* How it works / Tell Raider */}
      <section id="how-it-works" className={styles.how} aria-labelledby="how-h2">
        <div className={styles.howGrid}>
          <div>
            <p className={styles.eyebrowDark}>Starting a project</p>
            <h2 id="how-h2" className={styles.h2}>
              Tell Raider what you need — or fill the brief yourself
            </h2>
            <p className={styles.sectionLead}>
              The goal is one clear <strong>project brief</strong>, not a
              chatbot conversation for its own sake. Describe the business
              problem in plain language, review what goes into the brief, and
              send it to Raider. Prefer typing it yourself? Use the form path on
              the project intake page.
            </p>
            <ol className={styles.steps}>
              <li>
                <strong>Describe the work</strong> — what you are trying to
                build, fix, or improve.
              </li>
              <li>
                <strong>Shape a project brief</strong> — structured facts Raider
                can act on, not a loose email thread alone.
              </li>
              <li>
                <strong>Send one request</strong> — we follow up on scope and
                next steps. No surprise automated charge on the form.
              </li>
            </ol>
            <Link href="/project-intake" className={styles.btnPrimary}>
              Start a Project
            </Link>
          </div>
          {/* Supplemental workflow illustration — HTML steps own meaning */}
          <div
            className={styles.howMediaSurface}
            aria-hidden="true"
            role="presentation"
          />
        </div>
      </section>

      {/* Systems vs agency */}
      <section className={styles.systems} aria-labelledby="systems-h2">
        <div className={styles.systemsInner}>
          <h2 id="systems-h2" className={styles.h2}>
            More than a thin marketing site
          </h2>
          <p>
            A typical agency often stops at the page. Raider starts there and
            keeps going: how customers take action, how staff gets notified, and
            what happens when the order, booking, or drop-off does not match what
            was purchased online.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className={styles.faq} aria-labelledby="faq-h2">
        <div className={styles.sectionHead}>
          <p className={styles.eyebrowDark}>FAQ</p>
          <h2 id="faq-h2" className={styles.h2}>
            Common questions
          </h2>
        </div>
        <div className={styles.faqList}>
          {faqs.map((item) => (
            <details key={item.q} className={styles.faqItem}>
              <summary>
                <h3 className={styles.faqQ}>{item.q}</h3>
              </summary>
              <p className={styles.faqA}>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA — reuse assistant once only as small crop feel via size */}
      <section className={styles.ctaBand} aria-labelledby="cta-h2">
        <div className={styles.ctaInner}>
          <div>
            <h2 id="cta-h2" className={styles.ctaTitle}>
              Ready to describe the project?
            </h2>
            <p className={styles.ctaLead}>
              Send a clear project request. We will follow up with next steps —
              no package picker required to start.
            </p>
          </div>
          <Link href="/project-intake" className={styles.btnPrimaryOnDark}>
            Start a Project
          </Link>
        </div>
      </section>
    </div>
  );
}
