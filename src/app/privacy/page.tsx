export const metadata = {
  title: "Privacy Policy — UniPath",
  description: "How UniPath handles the information you provide.",
};

const SECTIONS = [
  {
    title: "1. What we collect",
    body: "UniPath does not require an account. The match quiz, bookmarks, and filters run entirely in your browser session — answers like region, budget, GPA, and field of study are not sent to a server or stored after you close the tab.",
  },
  {
    title: "2. Contact form",
    body: "If you reach out through the Contact page, the message is sent from your own email client (via a mailto link) directly to us. We don't receive or log anything until your email is actually sent.",
  },
  {
    title: "3. Cookies & analytics",
    body: "UniPath does not use advertising trackers. Basic, anonymized hosting analytics (e.g. page load performance) may be collected by our hosting provider, Vercel, to keep the site fast and reliable.",
  },
  {
    title: "4. Third-party links",
    body: "University profile pages link out to each school's official website for applications and admissions. Once you leave UniPath, that university's own privacy policy applies.",
  },
  {
    title: "5. Changes to this policy",
    body: "If how we handle data changes, this page will be updated to reflect it.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-container-max px-md py-xl md:px-lg">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-xs font-display text-display-lg text-on-surface">
          Privacy Policy
        </h1>
        <p className="mb-lg font-caption text-caption text-on-surface-variant">
          Last updated 2026
        </p>
        <div className="space-y-lg">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2 className="mb-xs font-headline-sm text-headline-sm">{s.title}</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">{s.body}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
