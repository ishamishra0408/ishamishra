import { TECH_ICONS } from "../data/tech";

/** One chip per technology, with its logo (or a letter badge when there's no logo). With `limit`,
 *  the first few and a "+N" chip that names the rest. */
export function TechChips({ stack, small = false, limit }: { stack: string[]; small?: boolean; limit?: number }) {
  const icon = small ? 13 : 18;
  const shown = limit && stack.length > limit ? stack.slice(0, limit) : stack;
  const rest = stack.slice(shown.length);
  return (
    <ul className={`tech${small ? " tech-sm" : ""}`} aria-label="Built with">
      {shown.map((t) => (
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
      {rest.length > 0 && (
        <li className="tech-more" title={rest.join(", ")}>
          <span className="sr-only">and </span>+{rest.length}
          <span className="sr-only"> more: {rest.join(", ")}</span>
        </li>
      )}
    </ul>
  );
}
