export const metadata = {
  title: "Terms of Service — UniPath",
  description: "The terms that govern using UniPath.",
};

const SECTIONS = [
  {
    title: "1. Informational use only",
    body: "UniPath provides university and major information, comparisons, and a match quiz for research purposes. We are not affiliated with, and do not represent, any university listed on the site, and we do not process applications or admissions decisions.",
  },
  {
    title: "2. Accuracy of data",
    body: "Tuition, acceptance rates, deadlines, and rankings change frequently and may not always reflect the latest published figures. Always confirm critical details directly with a university's admissions office before making decisions.",
  },
  {
    title: "3. No guarantee of outcomes",
    body: "Match percentages and recommendations are generated from a scoring model based on the answers you provide. They are a research aid, not a prediction of admission, financial aid, or enrollment outcomes.",
  },
  {
    title: "4. Acceptable use",
    body: "You agree not to scrape, resell, or misrepresent UniPath's data, and not to use the site in any way that disrupts its availability for other students.",
  },
  {
    title: "5. Changes to these terms",
    body: "We may update these terms as the product evolves. Continued use of the site after a change means you accept the updated terms.",
  },
];

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-container-max px-md py-xl md:px-lg">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-xs font-headline-xl text-headline-xl-mobile md:text-headline-xl">
          Terms of Service
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
