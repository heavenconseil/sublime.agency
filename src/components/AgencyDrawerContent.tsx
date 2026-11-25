// Contenu du drawer ouvert au clic sur le logo : services, références, presse, contact

const SERVICES = ["Generative Campaigns", "Conversational Bots", "AI Tools and Platforms"];

const WORK = [
  { client: "Motorola", title: "Styled With Moto", year: "2024" },
  { client: "Saint-Gobain", title: "7 Visions of the Future", year: "2025" },
  { client: "Westfield", title: "Where Future Meets Style", year: null },
  { client: "PFA × Hopscotch", title: "Mondial de l'Auto", year: "2024" },
];

// Du plus récent au plus ancien
const PRESS = [
  {
    outlet: "J'ai un pote dans la com",
    date: "13.10.2026",
    title: "heaven dresse le bilan de la première promotion de sa Sublime AI School",
    url: "https://jai-un-pote-dans-la.com/heaven-dresse-bilan-premiere-promotion-sublime-ai-school/",
  },
  {
    outlet: "CB News",
    date: "04.02.2026",
    title: "IA : heaven dévoile Sublime AI School",
    url: "https://www.cbnews.fr/node/98538",
  },
  {
    outlet: "CB News",
    date: "09.01.2026",
    title: "Heaven nomme Hedy Magroun directeur de création de Sublime",
    url: "https://www.cbnews.fr/node/97878",
  },
  {
    outlet: "CB News",
    date: "10.12.2025",
    title: "Sublime : le nouveau studio IA signé heaven",
    url: "https://www.cbnews.fr/node/97429",
  },
];

const SOCIALS = [
  { label: "Instagram", url: "https://www.instagram.com/sublime.heaven/" },
  { label: "LinkedIn", url: "https://www.linkedin.com/company/sublime-heaven" },
  { label: "YouTube", url: "https://www.youtube.com/@sublime-agency" },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[10px] uppercase tracking-[0.2em] opacity-40 mb-3">{children}</h3>;
}

const linkClass = "opacity-70 hover:opacity-100 transition-opacity underline-offset-4 hover:underline";

export default function AgencyDrawerContent() {
  return (
    <div className="flex flex-col items-center gap-8 md:gap-10 w-full max-w-3xl mx-auto px-4 md:px-8 py-8 md:py-10 text-center text-xs">
      {/* Services */}
      <div className="grid grid-cols-3 gap-4 md:gap-16 place-items-center w-full max-w-2xl">
        {SERVICES.map((service) => (
          <p key={service} className="opacity-70">{service}</p>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 w-full text-left">
        {/* Références */}
        <section>
          <SectionTitle>Selected work</SectionTitle>
          <ul className="space-y-2">
            {WORK.map((item) => (
              <li key={item.client} className="flex justify-between gap-4">
                <span>
                  <span className="opacity-90">{item.client}</span>
                  <span className="opacity-50"> — {item.title}</span>
                </span>
                {item.year && <span className="opacity-40 shrink-0">{item.year}</span>}
              </li>
            ))}
          </ul>
          <p className="mt-4 opacity-50">Grand Prix de la Créativité IA &amp; Data 2025</p>
        </section>

        {/* Presse */}
        <section>
          <SectionTitle>Press</SectionTitle>
          <ul className="space-y-3">
            {PRESS.map((article) => (
              <li key={article.url}>
                <a href={article.url} target="_blank" rel="noopener noreferrer" className={`block ${linkClass}`}>
                  <span className="block opacity-50 text-[10px]">{article.outlet} · {article.date}</span>
                  <span>{article.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Contact */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        <a href="mailto:sublime@heaven.fr" className={linkClass}>sublime@heaven.fr</a>
        {SOCIALS.map((social) => (
          <a key={social.url} href={social.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
            {social.label}
          </a>
        ))}
      </div>
    </div>
  );
}
