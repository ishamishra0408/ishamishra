import { TECH_ICONS } from "../data/tech";

/** One chip per technology, with its logo (or a letter badge when there's no logo). */
export function TechChips({ stack, small = false }: { stack: string[]; small?: boolean }) {
  const icon = small ? 13 : 18;
  return (
    <ul className={`tech${small ? " tech-sm" : ""}`} aria-label="Built with">
      {stack.map((t) => (
        <li key={t}>
          {TECH_ICONS[t] ? (
            <img src={TECH_ICONS[t]} alt="" width={icon} height={icon} />
          ) : (
            <span className="tech-badge" aria-hidden>
              {t[0]}
            </span>
          )}
          {t}
        </li>
      ))}
    </ul>
  );
}
