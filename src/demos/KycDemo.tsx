import { useState } from "react";
import { Switch } from "../components/Controls";

type Flags = { expired: boolean; screenPhoto: boolean; sharedAccount: boolean };
type Decision = { id: "approve" | "fix" | "person" | "locked"; label: string; tone: "ok" | "warn" | "indigo" | "bad"; why: string };

// Illustrative policy, in the spirit of Agent KYCReady's Rego rules.
function decide(f: Flags): Decision {
  if (f.expired) return { id: "locked", label: "Locked.", tone: "bad", why: "Licence lapsed. Bookings stay locked." };
  if (f.screenPhoto) return { id: "fix", label: "Ask for a fix.", tone: "warn", why: "Photo of a screen. Driver is asked to retake it." };
  if (f.sharedAccount) return { id: "person", label: "Sent to a person.", tone: "indigo", why: "Shared account. A human decides, with evidence." };
  return { id: "approve", label: "Approved.", tone: "ok", why: "Every rule passes. Bookings open." };
}

const RULES: { id: Decision["id"]; text: string }[] = [
  { id: "locked", text: 'locked  if licence.expired' },
  { id: "fix", text: 'fix     if photo.is_screen' },
  { id: "person", text: 'person  if account.shared_with_strangers' },
  { id: "approve", text: 'approve otherwise' },
];

export function KycDemo() {
  const [flags, setFlags] = useState<Flags>({ expired: false, screenPhoto: false, sharedAccount: true });
  const [decided, setDecided] = useState<Decision | null>(null);
  const [nope, setNope] = useState(0);

  const set = (k: keyof Flags) => (v: boolean) => {
    setFlags((f) => ({ ...f, [k]: v }));
    setDecided(null);
    setNope(0);
  };

  return (
    <div className="stage">
      <div>
        <h3>You're the model. Try to approve a driver.</h3>
        <div className="panel">
          <div className="panel-title">What the model read</div>
          <Switch checked={flags.expired} onChange={set("expired")} label="Licence expired" />
          <Switch checked={flags.screenPhoto} onChange={set("screenPhoto")} label="Photo of a screen" />
          <Switch checked={flags.sharedAccount} onChange={set("sharedAccount")} label="Shared bank account" />
        </div>
        <div className="controls">
          <button key={nope} className={`btn ${nope ? "shake" : ""}`} onClick={() => setNope((n) => n + 1)}>
            Model: approve
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setNope(0);
              setDecided(decide(flags));
            }}
          >
            Ask the policy
          </button>
        </div>
        {nope > 0 && (
          <div className="verdict bad" key={`n${nope}`}>
            <b>Blocked.</b> Models can't approve anyone. Only the policy can.
          </div>
        )}
      </div>
      <div>
        <div className="code" aria-label="Policy rules">
          <span className="cm"># first match wins (illustrative)</span>
          {"\n"}
          {RULES.map((r) => (
            <span key={r.id}>
              <span className={decided?.id === r.id ? "hit" : ""}>{r.text}</span>
              {"\n"}
            </span>
          ))}
        </div>
        {decided && (
          <div className={`verdict ${decided.tone}`} key={decided.id + JSON.stringify(flags)}>
            <b>{decided.label}</b> {decided.why}
          </div>
        )}
        <p className="footnote">
          Simplified simulation of Agent KYCReady.{" "}
          <a href="https://agent-kycready.onrender.com" target="_blank" rel="noreferrer">
            Live demo ↗
          </a>
        </p>
      </div>
    </div>
  );
}
