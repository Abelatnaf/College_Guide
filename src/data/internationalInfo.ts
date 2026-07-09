/**
 * Official government sources for studying as an international student in a
 * given country — visa/study-permit info, post-graduation work authorization,
 * and (where a government body ties one to the visa itself) English-language
 * test requirements. Same discipline as src/data/aidPolicy.ts: only genuine
 * official (.gov or equivalent) sources, and no numeric cutoffs, fees, or
 * processing times stated here since those change too often to keep current —
 * link out instead of restating a number that will go stale.
 *
 * Keyed by `country`, matching University.country exactly (not the coarser
 * Region enum) — visa/work-authorization rules are genuinely per-country.
 * A country NOT present here means it was never verified — never guess.
 */

export interface InternationalInfoEntry {
  country: string;
  visaInfoUrl: string;
  workAuthUrl?: string;
  testRequirementsUrl?: string;
  note: string;
  sourceUrl: string;
}

export const internationalInfo: Record<string, InternationalInfoEntry> = {
  "United States": {
    country: "United States",
    visaInfoUrl: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html",
    workAuthUrl: "https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-opt-for-f-1-students",
    note: "F-1 (academic) and M-1 (vocational) student visas are issued for approved programs of study; F-1 students may be authorized for Optional Practical Training (OPT), temporary work authorization directly related to their major, with an extension available to STEM graduates.",
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html",
  },
  "United Kingdom": {
    country: "United Kingdom",
    visaInfoUrl: "https://www.gov.uk/student-visa",
    workAuthUrl: "https://www.gov.uk/graduate-visa",
    testRequirementsUrl: "https://www.gov.uk/student-visa/knowledge-of-english",
    note: "Student visa route for study at a licensed UK education provider; the Graduate visa lets successful graduates remain and work in the UK for a set period after completing their course, with a longer period granted to doctoral graduates.",
    sourceUrl: "https://www.gov.uk/student-visa",
  },
  Canada: {
    country: "Canada",
    visaInfoUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html",
    workAuthUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/work/after-graduation/about.html",
    note: "Study permit issued by Immigration, Refugees and Citizenship Canada (IRCC) for study at a designated learning institution; the Post-Graduation Work Permit (PGWP) allows eligible graduates open work authorization in Canada, with the permit length generally tied to the length of the completed program.",
    sourceUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html",
  },
  Germany: {
    country: "Germany",
    visaInfoUrl: "https://www.auswaertiges-amt.de/en/visa-service/buergerservice/faq/08-studentenvisum-606690",
    workAuthUrl: "https://www.make-it-in-germany.com/en/study-vocational-training/studies-in-germany/prospects-after",
    note: "National (D) visa/residence permit for study, processed via the Federal Foreign Office and local Foreigners' Office; graduates of German institutions may convert to a residence permit for the purpose of seeking qualified employment matching their degree, then switch to a work-based residence title once they have an offer.",
    sourceUrl: "https://www.auswaertiges-amt.de/en/visa-service/buergerservice/faq/08-studentenvisum-606690",
  },
  France: {
    country: "France",
    visaInfoUrl: "https://france-visas.gouv.fr/en/etudiant",
    workAuthUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/F17319?lang=en",
    note: "Long-stay student visa (VLS-TS 'étudiant'), processed through the Études en France/Campus France procedure and France-Visas; graduates who reach at least a master's-equivalent qualification (and, under certain bilateral agreements, other levels) may obtain a temporary residence authorization to seek employment or start a business related to their studies.",
    sourceUrl: "https://france-visas.gouv.fr/en/etudiant",
  },
  Netherlands: {
    country: "Netherlands",
    visaInfoUrl: "https://ind.nl/en/residence-permits/study/student-residence-permit-for-university-or-higher-professional-education",
    workAuthUrl: "https://ind.nl/en/residence-permits/work/residence-permit-for-orientation-year",
    note: "Residence permit for study, generally applied for by the Dutch educational institution on the student's behalf through the Immigration and Naturalisation Service (IND); the 'orientation year' (zoekjaar) permit gives eligible recent graduates unrestricted access to the Dutch labour market to search for work or start a business.",
    sourceUrl: "https://ind.nl/en/residence-permits/study/student-residence-permit-for-university-or-higher-professional-education",
  },
  Switzerland: {
    country: "Switzerland",
    visaInfoUrl: "https://www.sem.admin.ch/sem/en/home/themen/aufenthalt.html",
    workAuthUrl: "https://www.sem.admin.ch/sem/en/home/themen/arbeit/faq.html",
    note: "Non-EU/EFTA nationals need a long-stay (type D) visa and cantonal residence permit for study, coordinated by the State Secretariat for Migration (SEM) and cantonal migration offices; graduates of a Swiss higher-education institution may be granted a further period after their studies to seek employment matching their qualifications.",
    sourceUrl: "https://www.sem.admin.ch/sem/en/home/themen/aufenthalt.html",
  },
  Ireland: {
    country: "Ireland",
    visaInfoUrl: "https://www.irishimmigration.ie/coming-to-study-in-ireland/",
    workAuthUrl: "https://www.irishimmigration.ie/my-situation-has-changed-since-i-arrived-in-ireland/third-level-graduate-programme/",
    note: "Non-EEA students need permission to study (a visa where applicable, plus Stamp 2 immigration permission) via the Immigration Service Delivery; the Third Level Graduate Programme (Stamp 1G) lets eligible graduates of recognised Irish awarding bodies remain and work while seeking graduate-level employment or a relevant employment permit.",
    sourceUrl: "https://www.irishimmigration.ie/coming-to-study-in-ireland/",
  },
  Sweden: {
    country: "Sweden",
    visaInfoUrl: "https://www.migrationsverket.se/en/you-want-to-apply/study.html",
    workAuthUrl: "https://www.migrationsverket.se/en/you-want-to-extend/study/look-for-work-after-completing-your-studies-in-sweden.html",
    note: "Residence permit for studies issued by the Swedish Migration Agency (Migrationsverket) for higher education; graduates may apply for a follow-on residence permit to look for work or explore starting a business in Sweden.",
    sourceUrl: "https://www.migrationsverket.se/en/you-want-to-apply/study.html",
  },
  Spain: {
    country: "Spain",
    visaInfoUrl: "https://www.exteriores.gob.es/Consulados/losangeles/en/ServiciosConsulares/Paginas/Consular/Visado-de-estudios.aspx",
    workAuthUrl: "https://www.inclusion.gob.es/en/web/migraciones/w/20.-autorizacion-de-residencia-para-busqueda-de-empleo-o-inicio-de-proyecto-empresarial",
    note: "Student visa/authorization issued through Spain's Ministry of Foreign Affairs (exteriores.gob.es) for study at an authorized institution; graduates who reach at least degree level (EQF Level 6) may apply, through the Ministry of Inclusion, Social Security and Migration, for a residence authorization to seek employment or pursue a business project related to their studies.",
    sourceUrl: "https://www.exteriores.gob.es/Consulados/losangeles/en/ServiciosConsulares/Paginas/Consular/Visado-de-estudios.aspx",
  },
  Denmark: {
    country: "Denmark",
    visaInfoUrl: "https://www.nyidanmark.dk/en-GB/You-want-to-apply/Study/Higher-Education",
    workAuthUrl: "https://www.nyidanmark.dk/en-GB/You-want-to-apply/Study/Study---job-seeking/Study---3-years-job-seeking",
    note: "Residence permit for higher education, processed by the Danish Agency for International Recruitment and Integration (SIRI); graduates of eligible programs can be granted a follow-on residence permit to seek employment in Denmark for a period after completing their studies.",
    sourceUrl: "https://www.nyidanmark.dk/en-GB/You-want-to-apply/Study/Higher-Education",
  },
  Austria: {
    country: "Austria",
    visaInfoUrl: "https://www.migration.gv.at/en/living-and-working-in-austria/study-in-austria/",
    workAuthUrl: "https://www.migration.gv.at/en/types-of-immigration/permanent-immigration/graduates/",
    note: "'Residence Permit – Student' for degree studies at a recognised Austrian higher-education institution; graduates may renew their permit for a period to seek employment or start a business, and can subsequently apply for a Red-White-Red Card without a labour-market test if they secure a matching job offer.",
    sourceUrl: "https://www.migration.gv.at/en/living-and-working-in-austria/study-in-austria/",
  },
  Finland: {
    country: "Finland",
    visaInfoUrl: "https://migri.fi/en/studying-in-finland",
    workAuthUrl: "https://migri.fi/en/seeking-work-after-graduation-or-completion-of-research",
    note: "Residence permit for studies issued by the Finnish Immigration Service (Migri) for degree studies exceeding 90 days; graduates may apply for a residence permit to seek work or start a business, and those who complete a Finnish degree can obtain a residence permit granting unrestricted work rights.",
    sourceUrl: "https://migri.fi/en/studying-in-finland",
  },
  Poland: {
    country: "Poland",
    visaInfoUrl: "https://mos.cudzoziemcy.gov.pl/en/informacje/na-studia_EN",
    workAuthUrl: "https://mos.cudzoziemcy.gov.pl/en/informacje/absolwent_EN/wprowadzenie_EN",
    note: "Temporary residence permit (or national visa) for the purpose of studies at an approved institution, administered by Poland's Office for Foreigners; graduates of Polish universities can obtain a one-time temporary residence permit to look for a job or set up a business, and graduation itself grants free access to the labour market.",
    sourceUrl: "https://mos.cudzoziemcy.gov.pl/en/informacje/na-studia_EN",
  },
  Norway: {
    country: "Norway",
    visaInfoUrl: "https://www.udi.no/en/want-to-apply/studies/",
    workAuthUrl: "https://www.udi.no/en/want-to-apply/work-immigration/job-seekers/",
    note: "Study permit issued by the Norwegian Directorate of Immigration (UDI) for non-EU/EEA nationals, which also grants limited part-time work rights while studying; graduates can apply for a job-seeker permit to remain in Norway and look for skilled work after completing their studies.",
    sourceUrl: "https://www.udi.no/en/want-to-apply/studies/",
  },
  Portugal: {
    country: "Portugal",
    visaInfoUrl: "https://aima.gov.pt/pt/estudar",
    workAuthUrl: "https://aima.gov.pt/pt/trabalhar/tendo-beneficiado-de-ar-para-estudantes-do-2-o-ou-3-o-ciclos-do-ensino-superior-ou-de-ar-para-investigacao-e-concluido-os-estudo",
    note: "Non-EU students generally need a national (D4) visa from the Foreign Ministry followed by a residence authorization from AIMA (Agência para a Integração, Migrações e Asilo); certain postgraduate or research graduates may use a follow-on residence period to seek employment or start a business related to their qualifications.",
    sourceUrl: "https://aima.gov.pt/pt/estudar",
  },
  "Czech Republic": {
    country: "Czech Republic",
    visaInfoUrl: "https://ipc.gov.cz/en/visa-and-residence-permit-types/third-country-nationals/long-term-residence-permits/long-term-residence-permit-in-the-czech-republic-for-the-purpose-of-studies/",
    workAuthUrl: "https://ipc.gov.cz/en/visa-and-residence-permit-types/third-country-nationals/long-term-residence-permits/long-term-residence-permit-for-the-purpose-of-seeking-employment-or-starting-a-business/",
    note: "Long-term residence permit for the purpose of studies, administered by the Ministry of the Interior; graduates who completed an accredited study programme may apply for a follow-on long-term residence permit to seek employment or start a business, which grants free access to the labour market.",
    sourceUrl: "https://ipc.gov.cz/en/visa-and-residence-permit-types/third-country-nationals/long-term-residence-permits/long-term-residence-permit-in-the-czech-republic-for-the-purpose-of-studies/",
  },
  Belgium: {
    country: "Belgium",
    visaInfoUrl: "https://dofi.ibz.be/en/themes/third-country-nationals/study",
    workAuthUrl: "https://dofi.ibz.be/en/themes/third-country-nationals/study/search-year-after-higher-studies",
    note: "Long-stay (type D) visa/residence permit for study, administered by Belgium's Immigration Office (Office des Étrangers / Dienst Vreemdelingenzaken); non-EEA graduates can extend their stay for a 'search year' with unrestricted labour-market access to look for work or start a business.",
    sourceUrl: "https://dofi.ibz.be/en/themes/third-country-nationals/study",
  },
  Italy: {
    country: "Italy",
    visaInfoUrl: "https://www.interno.gov.it/it/temi/immigrazione-e-asilo/modalita-dingresso/visto-e-permesso-soggiorno",
    note: "Entry visa for study purposes followed by a permesso di soggiorno per motivi di studio, issued through the Ministry of the Interior and local Questura; graduates of Italian institutions may in some cases convert their permit into one for job-seeking purposes ('attesa occupazione') for a period after completing their degree.",
    sourceUrl: "https://www.interno.gov.it/it/temi/immigrazione-e-asilo/modalita-dingresso/visto-e-permesso-soggiorno",
  },
  Australia: {
    country: "Australia",
    visaInfoUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
    workAuthUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/temporary-graduate-485",
    testRequirementsUrl: "https://immi.homeaffairs.gov.au/help-support/meeting-our-requirements/english-language",
    note: "Student visa (subclass 500) issued by the Department of Home Affairs, requiring proof of enrolment and satisfaction of the Genuine Student requirement; the Temporary Graduate visa (subclass 485) lets recent graduates live and work in Australia for a period that varies by qualification level, through its Post-Higher Education Work and other streams.",
    sourceUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
  },
  Japan: {
    country: "Japan",
    visaInfoUrl: "https://www.studyinjapan.go.jp/en/planning/immigration-procedures/",
    workAuthUrl: "https://www.studyinjapan.go.jp/en/work-in-japan/employment/status.html",
    note: "Prospective students obtain a Certificate of Eligibility and a 'Student' status of residence administered by the Immigration Services Agency; graduates who secure a job typically change status to a work-appropriate category such as Engineer/Specialist in Humanities/International Services, while those still job-hunting at graduation may change to a time-limited 'Designated Activities' status to continue their search.",
    sourceUrl: "https://www.studyinjapan.go.jp/en/planning/immigration-procedures/",
  },
  "South Korea": {
    country: "South Korea",
    visaInfoUrl: "https://www.studyinkorea.go.kr/ko/plan/visaAndStay.do",
    workAuthUrl: "https://gbr.mofa.go.kr/gb-en/brd/m_20265/view.do?seq=669262",
    note: "D-2 (degree program) or D-4 (non-degree/language program) student visa, issued through Korean diplomatic missions and administered domestically via immigration offices/HiKorea; graduates can apply to change status to the D-10 job-seeking visa to search for work or complete a related internship before transitioning to an employment-based visa.",
    sourceUrl: "https://www.studyinkorea.go.kr/ko/plan/visaAndStay.do",
  },
  India: {
    country: "India",
    visaInfoUrl: "https://boi.gov.in/boi/public/content/pages/c7950f94-1736-450c-b526-b7a747eac403",
    note: "Indian diplomatic missions issue a Student Visa for admission to a recognised educational institution, generally matching the duration of the course; holders must register with the Foreigners Regional Registration Office (FRRO) or via the e-FRRO portal after arrival. India does not currently offer a distinct, standardized post-study work-authorization program comparable to OPT or PGWP; working after graduation generally requires an employer-sponsored employment/business visa.",
    sourceUrl: "https://boi.gov.in/boi/public/content/pages/c7950f94-1736-450c-b526-b7a747eac403",
  },
  China: {
    country: "China",
    visaInfoUrl: "https://cs.mfa.gov.cn/wgrlh/lhqz/lhqzjjs/",
    note: "Long-term study in mainland China requires an X1 student visa, while shorter programs use the X2 student visa; visas are issued by Chinese diplomatic missions under Ministry of Foreign Affairs and National Immigration Administration rules, and X1 holders must convert to a local residence permit for study shortly after entry. There is no single nationwide, OPT-style post-graduation work-authorization program; graduates who want to work generally need an employer to sponsor a standard work permit and Z visa, though some cities offer streamlined pathways for graduates of qualifying universities.",
    sourceUrl: "https://cs.mfa.gov.cn/wgrlh/lhqz/lhqzjjs/",
  },
  "United Arab Emirates": {
    country: "United Arab Emirates",
    visaInfoUrl: "https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visas/residence-visa-for-studying-in-the-uae/student-visa",
    workAuthUrl: "https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visas/residence-visa-for-studying-in-the-uae/golden-visa-for-outstanding-students",
    note: "Student residence visas are typically sponsored by an accredited UAE university/college (or a parent) and administered by the Federal Authority for Identity, Citizenship, Customs & Port Security (ICP); high-achieving students and graduates from qualifying universities may instead obtain a long-term, self-sponsored Golden Visa that allows living and working in the UAE without needing an employer sponsor.",
    sourceUrl: "https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visas/residence-visa-for-studying-in-the-uae/student-visa",
  },
};

/** Look up verified international-student info for a country, or undefined if not yet verified. */
export function getInternationalInfo(country: string): InternationalInfoEntry | undefined {
  return internationalInfo[country];
}
