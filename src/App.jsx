import { useState, useEffect } from "react";
import { supabase } from "./supabase";

// ─── Colors ────────────────────────────────────────────────────────────────
const C = {
  bg: "#0f1520", card: "#1a2332", cardBorder: "#2d3748", text: "#e2e8f0",
  sub: "#94a3b8", green: "#38a169", red: "#e53e3e", yellow: "#f6ad55",
  purple: "#805ad5", teal: "#38b2ac", amber: "#f6ad55",
};

// ─── Speak (Audio-first) ──────────────────────────────────────────────────
const speak = (text) => {
  if ("speechSynthesis" in window) {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.92; u.pitch = 1.0;
    speechSynthesis.speak(u);
  }
};

// ─── Reusable Components ──────────────────────────────────────────────────
const Card = ({ children, glow, style }) => (
  <div style={{
    background: C.card, borderRadius: 16, padding: "20px 24px", marginBottom: 16,
    border: `1px solid ${glow || C.cardBorder}`,
    boxShadow: glow ? `0 0 20px ${glow}33` : "none", ...style
  }}>{children}</div>
);

const Btn = ({ label, color, onClick, outline, style }) => (
  <button onClick={onClick} style={{
    width: "100%", padding: "14px 20px", borderRadius: 14, border: outline ? `2px solid ${color}` : "none",
    background: outline ? "transparent" : color, color: outline ? color : (color === C.yellow || color === C.green ? "#000" : "#fff"),
    fontSize: 16, fontWeight: 700, cursor: "pointer", marginBottom: 10, ...style
  }}>{label}</button>
);

const Overlay = ({ children, show }) => {
  if (!show) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, background: `${C.bg}f5`, zIndex: 100,
      display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
      padding: 32
    }}>{children}</div>
  );
};

// ─── Auth Screen ──────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) { setError(error.message); return; }
      setCheckEmail(true);
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) { setError(error.message); return; }
      onAuth(data.user);
    }
  };

  if (checkEmail) {
    return (
      <div style={{ maxWidth: 400, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <h1 style={{ color: C.amber, fontSize: 28, fontWeight: 900, letterSpacing: 2, marginBottom: 8 }}>SOVEREIGN SELF™</h1>
        <Card>
          <p style={{ fontSize: 18, fontWeight: 700, color: C.green, marginBottom: 12 }}>Check your email!</p>
          <p style={{ color: C.sub, fontSize: 14, lineHeight: 1.6 }}>
            We sent a confirmation link to <strong style={{ color: C.text }}>{email}</strong>. Click it to activate your account, then come back and log in.
          </p>
        </Card>
        <button onClick={() => { setCheckEmail(false); setMode("login"); }}
          style={{ background: "transparent", border: "none", color: C.teal, fontSize: 14, cursor: "pointer", marginTop: 16 }}>
          Back to login
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
      <h1 style={{ color: C.amber, fontSize: 28, fontWeight: 900, letterSpacing: 2, marginBottom: 4 }}>SOVEREIGN SELF™</h1>
      <p style={{ color: C.sub, fontSize: 13, marginBottom: 32 }}>Command Center</p>

      <Card>
        <div style={{ display: "flex", marginBottom: 20, borderRadius: 10, overflow: "hidden", border: `1px solid ${C.cardBorder}` }}>
          <button onClick={() => { setMode("login"); setError(""); }}
            style={{ flex: 1, padding: "10px", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer",
              background: mode === "login" ? C.green : "transparent", color: mode === "login" ? "#000" : C.sub }}>
            Log In
          </button>
          <button onClick={() => { setMode("signup"); setError(""); }}
            style={{ flex: 1, padding: "10px", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer",
              background: mode === "signup" ? C.teal : "transparent", color: mode === "signup" ? "#000" : C.sub }}>
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"
            required autoComplete="email"
            style={{
              width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${C.cardBorder}`,
              background: "#111827", color: C.text, fontSize: 15, marginBottom: 10, outline: "none"
            }}
          />
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (min 6 characters)"
            required minLength={6} autoComplete={mode === "signup" ? "new-password" : "current-password"}
            style={{
              width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${C.cardBorder}`,
              background: "#111827", color: C.text, fontSize: 15, marginBottom: 16, outline: "none"
            }}
          />
          {error && <p style={{ color: C.red, fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <Btn
            label={loading ? "..." : mode === "login" ? "Log In" : "Create Account"}
            color={mode === "login" ? C.green : C.teal}
            onClick={() => {}} // form handles submit
            style={{ opacity: loading ? 0.6 : 1 }}
          />
        </form>
      </Card>

      <p style={{ color: C.sub, fontSize: 11, marginTop: 24, opacity: 0.5 }}>Your data stays yours. Always.</p>
    </div>
  );
}

// ─── Main App (Dashboard) ─────────────────────────────────────────────────
function Dashboard({ user, onLogout }) {
  const [voltage, setVoltage] = useState(null);
  const [mission, setMission] = useState("");
  const [missionInput, setMissionInput] = useState("");
  const [missionLocked, setMissionLocked] = useState(false);
  const [showLaunch, setShowLaunch] = useState(true);
  const [launchStep, setLaunchStep] = useState("voltage");

  const [sprintMode, setSprintMode] = useState("sprint");
  const [sprintSeconds, setSprintSeconds] = useState(null);
  const [sprintActive, setSprintActive] = useState(false);
  const [sprintDone, setSprintDone] = useState(false);

  const [showStuck, setShowStuck] = useState(false);
  const [stuckStep, setStuckStep] = useState(0);

  const storageKey = `sovereign_demo_${user.id}`;

  // Load persisted state
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
      if (saved.voltage) { setVoltage(saved.voltage); setShowLaunch(false); }
      if (saved.mission) { setMission(saved.mission); setMissionLocked(true); }
    } catch { /* ignore */ }
  }, []);

  // Save state
  useEffect(() => {
    if (voltage) {
      localStorage.setItem(storageKey, JSON.stringify({ voltage, mission }));
    }
  }, [voltage, mission]);

  // Sprint timer
  useEffect(() => {
    if (sprintSeconds !== null && sprintSeconds > 0) {
      const id = setInterval(() => setSprintSeconds(t => {
        if (t <= 1) {
          clearInterval(id);
          setSprintActive(false);
          setSprintDone(true);
          speak(sprintMode === "sprint" ? "Sprint complete. Nice work." : "Marathon complete. Incredible focus.");
          return 0;
        }
        return t - 1;
      }), 1000);
      return () => clearInterval(id);
    }
  }, [sprintSeconds !== null && sprintSeconds > 0]);

  useEffect(() => {
    if (showLaunch) setTimeout(() => speak("Welcome to Sovereign Self. Let's check your energy level."), 500);
  }, []);

  const modeColor = voltage === "high" ? C.green : voltage === "medium" ? C.yellow : C.red;
  const modeLabel = voltage === "high" ? "FULL POWER" : voltage === "medium" ? "MAINTENANCE MODE" : "RECOVERY MODE";

  const startSprint = () => {
    const secs = sprintMode === "sprint" ? 20 * 60 : 50 * 60;
    setSprintSeconds(secs);
    setSprintActive(true);
    setSprintDone(false);
    speak(sprintMode === "sprint" ? "Sprint started. 20 minutes. Go." : "Marathon started. 50 minutes. Go.");
  };

  const resetDay = () => {
    localStorage.removeItem(storageKey);
    setVoltage(null); setMission(""); setMissionInput(""); setMissionLocked(false);
    setShowLaunch(true); setLaunchStep("voltage");
    setSprintSeconds(null); setSprintActive(false); setSprintDone(false);
    speak("Day reset. Let's start fresh.");
  };

  // ─── Morning Launch Overlay ──────────────────────────────────────────────
  const launchOverlay = (
    <Overlay show={showLaunch}>
      {launchStep === "voltage" && (<>
        <h1 style={{ color: C.amber, fontSize: 28, fontWeight: 900, letterSpacing: 2, marginBottom: 8 }}>SOVEREIGN SELF™</h1>
        <p style={{ color: C.sub, marginBottom: 32, textAlign: "center" }}>How's your battery right now?</p>
        <div style={{ width: "100%", maxWidth: 340 }}>
          <Btn label="⚡ HIGH — Let's go" color={C.green} onClick={() => { setVoltage("high"); speak("Full power. Let's set your mission."); setLaunchStep("mission"); }} />
          <Btn label="🟡 MEDIUM — Moderate" color={C.yellow} onClick={() => { setVoltage("medium"); speak("Maintenance mode. Light tasks today."); setLaunchStep("mission"); }} />
          <Btn label="🔴 LOW — Struggling" color={C.red} onClick={() => { setVoltage("low"); speak("Recovery mode. Rest is the mission today."); setShowLaunch(false); }} />
        </div>
      </>)}

      {launchStep === "mission" && (<>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>🎯 What matters most today?</h2>
        <p style={{ color: C.sub, marginBottom: 24 }}>One mission. That's all.</p>
        <div style={{ width: "100%", maxWidth: 340 }}>
          <input
            value={missionInput}
            onChange={e => setMissionInput(e.target.value)}
            placeholder="Type your mission..."
            style={{
              width: "100%", padding: "14px 16px", borderRadius: 12, border: `1px solid ${C.cardBorder}`,
              background: "#111827", color: C.text, fontSize: 16, marginBottom: 12, outline: "none"
            }}
          />
          {missionInput.trim() && (
            <Btn label="🔒 Lock Mission" color={modeColor} onClick={() => {
              setMission(missionInput.trim());
              setMissionLocked(true);
              speak("Mission locked. Let's go.");
              setShowLaunch(false);
            }} />
          )}
        </div>
      </>)}
    </Overlay>
  );

  // ─── I'm Stuck Overlay ──────────────────────────────────────────────────
  const stuckOverlay = (
    <Overlay show={showStuck}>
      {stuckStep === 0 && (<>
        <h2 style={{ color: C.teal, fontSize: 26, fontWeight: 900, marginBottom: 8 }}>🔴 Brain Stuck?</h2>
        <p style={{ color: C.sub, marginBottom: 24 }}>Don't think. Just follow.</p>
        <div style={{ width: "100%", maxWidth: 340 }}>
          <Btn label="Let's Reset →" color={C.teal} onClick={() => { setStuckStep(1); speak("Step 1. Stand up. Change your position."); }} />
        </div>
      </>)}
      {stuckStep === 1 && (<>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>1. STAND UP</h2>
        <p style={{ color: C.sub, marginBottom: 24 }}>Change your physical position. Now.</p>
        <div style={{ width: "100%", maxWidth: 340 }}>
          <Btn label="Done — I moved" color={C.teal} onClick={() => { setStuckStep(2); speak("Step 2. Get water. Hydrate your brain."); }} />
        </div>
      </>)}
      {stuckStep === 2 && (<>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>2. GET WATER</h2>
        <p style={{ color: C.sub, marginBottom: 24 }}>Hydrate. Your brain needs it.</p>
        <div style={{ width: "100%", maxWidth: 340 }}>
          <Btn label="Done — I drank" color={C.teal} onClick={() => { setStuckStep(3); speak("Good. Now take 3 deep breaths."); }} />
        </div>
      </>)}
      {stuckStep === 3 && (<>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>3. BREATHE</h2>
        <p style={{ color: C.sub, marginBottom: 24 }}>3 slow breaths. In through nose, out through mouth.</p>
        <div style={{ width: "100%", maxWidth: 340 }}>
          <Btn label="Done — I breathed" color={C.teal} onClick={() => { setStuckStep(4); speak("Reset complete. Your mission is still there. Go."); }} />
        </div>
      </>)}
      {stuckStep === 4 && (<>
        <h2 style={{ color: C.green, fontSize: 26, fontWeight: 900, marginBottom: 8 }}>✓ RESET COMPLETE</h2>
        <p style={{ color: C.sub, marginBottom: 8 }}>Your mission:</p>
        {mission && <Card glow={C.green} style={{ width: "100%", maxWidth: 340 }}><p style={{ fontWeight: 700, fontSize: 18 }}>🎯 {mission}</p></Card>}
        <div style={{ width: "100%", maxWidth: 340 }}>
          <Btn label="Back to work" color={C.green} onClick={() => { setShowStuck(false); setStuckStep(0); }} />
        </div>
      </>)}
    </Overlay>
  );

  // ─── Dashboard ──────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px", minHeight: "100vh" }}>
      {launchOverlay}
      {stuckOverlay}

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <button onClick={onLogout}
            style={{ background: "transparent", border: `1px solid ${C.cardBorder}`, color: C.sub, padding: "4px 12px", borderRadius: 8, fontSize: 11, cursor: "pointer" }}>
            Log out
          </button>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Sovereign Self™</h1>
        <p style={{ color: C.sub, fontSize: 13 }}>Command Center</p>
        <p style={{ color: C.sub, fontSize: 11, marginTop: 2 }}>{user.email}</p>
        {voltage && <p style={{ color: modeColor, fontSize: 12, fontWeight: 700, letterSpacing: 1, marginTop: 4 }}>● {modeLabel}</p>}
      </div>

      {/* Energy Status */}
      {voltage && (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 16, color: modeColor }}>⚡ Energy Status</p>
              <p style={{ color: C.sub, fontSize: 13 }}>
                {voltage === "high" ? "Full power — deep work" : voltage === "medium" ? "Moderate energy — light tasks" : "Low energy — rest & recover"}
              </p>
            </div>
            <button onClick={() => { setShowLaunch(true); setLaunchStep("voltage"); speak("Let's recheck your battery."); }}
              style={{ padding: "6px 14px", borderRadius: 10, border: "none", background: `${modeColor}22`, color: modeColor, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              Re-check
            </button>
          </div>
        </Card>
      )}

      {/* Sprint / Marathon Timer */}
      {voltage && voltage !== "low" && (
        <Card glow={sprintActive ? (sprintMode === "marathon" ? C.purple : C.green) : undefined}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 16 }}>{sprintMode === "sprint" ? "🎯" : "🏃"} Focus {sprintMode === "sprint" ? "Sprint" : "Marathon"}</p>
              <p style={{ color: C.sub, fontSize: 13, marginBottom: 8 }}>
                {sprintDone ? "Session complete!" : sprintActive ? (sprintMode === "sprint" ? "20-min burst — go!" : "50-min deep work — locked in") : "Tap mode to switch"}
              </p>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <button onClick={() => { if (!sprintActive) { setSprintMode("sprint"); setSprintDone(false); } }}
                  style={{ padding: "4px 12px", borderRadius: 12, border: "none", fontSize: 13, fontWeight: 600, cursor: sprintActive ? "default" : "pointer",
                    opacity: sprintActive && sprintMode !== "sprint" ? 0.4 : 1,
                    background: sprintMode === "sprint" ? C.green : "#111827", color: sprintMode === "sprint" ? "#000" : C.sub }}>Sprint 20m</button>
                <button onClick={() => { if (!sprintActive) { setSprintMode("marathon"); setSprintDone(false); } }}
                  style={{ padding: "4px 12px", borderRadius: 12, border: "none", fontSize: 13, fontWeight: 600, cursor: sprintActive ? "default" : "pointer",
                    opacity: sprintActive && sprintMode !== "marathon" ? 0.4 : 1,
                    background: sprintMode === "marathon" ? C.purple : "#111827", color: sprintMode === "marathon" ? "#fff" : C.sub }}>Marathon 50m</button>
              </div>
              {!sprintActive && !sprintDone && (
                <Btn label={`▶ Start ${sprintMode === "sprint" ? "Sprint" : "Marathon"}`}
                  color={sprintMode === "marathon" ? C.purple : C.green} onClick={startSprint}
                  style={{ width: "auto", padding: "10px 28px" }} />
              )}
              {sprintActive && (
                <button onClick={() => { setSprintSeconds(null); setSprintActive(false); speak("Session stopped."); }}
                  style={{ padding: "6px 20px", borderRadius: 12, border: `1px solid ${C.sub}44`, background: "transparent", color: C.sub, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>■ Stop</button>
              )}
              {sprintDone && (
                <Btn label="🔄 Go Again" color={sprintMode === "marathon" ? C.purple : C.green} onClick={() => { setSprintDone(false); setSprintSeconds(null); }}
                  style={{ width: "auto", padding: "10px 28px" }} />
              )}
            </div>
            <div style={{ textAlign: "center", minWidth: 80 }}>
              {sprintSeconds !== null && sprintSeconds > 0 ? (
                <div style={{ fontSize: 32, fontWeight: 700, color: sprintMode === "marathon" ? C.purple : C.green, background: "#111827",
                  borderRadius: 8, padding: "8px 10px", border: `1px solid ${sprintMode === "marathon" ? C.purple : C.green}` }}>
                  {Math.floor(sprintSeconds / 60)}:{String(sprintSeconds % 60).padStart(2, "0")}
                </div>
              ) : sprintDone ? (
                <div style={{ fontSize: 32, fontWeight: 700, color: C.green, background: "#111827", borderRadius: 8, padding: "8px 10px", border: `1px solid ${C.green}` }}>✓</div>
              ) : (
                <div style={{ fontSize: 32, fontWeight: 700, color: C.text, background: "#111827", borderRadius: 8, padding: "8px 10px",
                  border: `1px solid ${sprintMode === "marathon" ? C.purple : C.cardBorder}` }}>{sprintMode === "sprint" ? 20 : 50}</div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Mission Lock */}
      {missionLocked && (
        <Card glow={`${C.green}66`}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 16 }}>🎯 Today's Single Focus</p>
              <p style={{ fontWeight: 700, fontSize: 18, marginTop: 4 }}>{mission}</p>
            </div>
            <span style={{ background: `${C.green}22`, color: C.green, padding: "4px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>🔒 Locked</span>
          </div>
        </Card>
      )}

      {/* I'm Stuck Button */}
      {voltage && (
        <div style={{ textAlign: "center", margin: "32px 0" }}>
          <button onClick={() => { setShowStuck(true); setStuckStep(0); speak("Brain stuck? Don't think. Just follow."); }}
            style={{
              width: 100, height: 100, borderRadius: "50%", border: `3px solid ${C.teal}`,
              background: `${C.teal}22`, color: C.teal, fontSize: 15, fontWeight: 700, cursor: "pointer",
              boxShadow: `0 0 30px ${C.teal}22`
            }}>
            I'm Stuck
          </button>
          <p style={{ color: C.sub, fontSize: 12, marginTop: 8 }}>Press when you need help resetting</p>
        </div>
      )}

      {/* Reset Day */}
      {voltage && (
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button onClick={resetDay} style={{ background: "transparent", border: `1px solid ${C.cardBorder}`, color: C.sub, padding: "8px 20px", borderRadius: 10, fontSize: 12, cursor: "pointer" }}>
            Reset Day
          </button>
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: 40, paddingBottom: 20 }}>
        <p style={{ color: C.sub, fontSize: 11, opacity: 0.5 }}>Sovereign Self™ — Calibrated to your cognitive profile</p>
      </div>
    </div>
  );
}

// ─── Root App (Auth wrapper) ──────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <p style={{ color: C.sub, fontSize: 14 }}>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onAuth={setUser} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}
