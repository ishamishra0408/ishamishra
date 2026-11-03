import { useState } from "react";
import { views } from "../data/views";
import { useUI } from "../ui";
import { Modal } from "./Modal";

// Short scenarios: pick a call, then see mine and why.
export function QuizSheet({ onClose }: { onClose: () => void }) {
  const ui = useUI();
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [agreed, setAgreed] = useState(0);
  const done = idx >= views.length;
  const v = views[Math.min(idx, views.length - 1)];

  const next = () => {
    if (picked !== null && v.scenario.options[picked].agree) setAgreed((a) => a + 1);
    setPicked(null);
    const n = idx + 1;
    setIdx(n);
  };

  return (
    <Modal label="Test your calls" onClose={onClose} className="sheet">
      <button className="sheet-close btn btn-quiet" onClick={onClose} autoFocus>
        Close
      </button>
      {!done ? (
        <div className="quiz">
          <p className="muted">
            Call {idx + 1} of {views.length}
          </p>
          <p className="quiz-q">{v.scenario.prompt}</p>
          <div className="quiz-opts">
            {v.scenario.options.map((o, i) => (
              <button
                key={o.label}
                className={`quiz-opt ${picked === i ? (o.agree ? "yes" : "no") : ""}`}
                disabled={picked !== null}
                onClick={() => setPicked(i)}
              >
                {o.label}
              </button>
            ))}
          </div>
          {picked !== null && (
            <div className="quiz-reveal">
              <p>
                <b>{v.scenario.options[picked].agree ? "Same call as me." : "I'd call it differently."}</b> {v.scenario.reveal}
              </p>
              <button className="btn btn-accent" onClick={next}>
                {idx === views.length - 1 ? "See the score" : "Next call"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="quiz">
          <p className="quiz-score">
            {agreed + 0} of {views.length}
          </p>
          <p className="lead">calls the same as mine. Either way, it's a good conversation.</p>
          <button className="btn btn-accent" data-booking onClick={() => ui.openBooking()}>
            Book a call
          </button>
        </div>
      )}
    </Modal>
  );
}
