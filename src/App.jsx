import React, { useState, useMemo, useCallback, useEffect } from "react";

import {
  createCourse,
  getCourseContent,
  getMe,
  importCommit,
  importPreview,
  listCourses,
  updateExam,
} from "./api.js";

// Topic colours, cycled by topic index when mapping API content into decks.
const DECK_PALETTE = [
  "#CCFF66",
  "#FFCC33",
  "#66CCFF",
  "#FF6699",
  "#FF9900",
  "#B8E986",
  "#E8B96A",
  "#E8896A",
  "#9A8CE8",
  "#6AD5E8",
  "#E86AB8",
];

// Map the JSON API course content into the study UI's per-exam track shape.
// Each exam becomes a self-contained track: its own questions, topic decks, and
// mock-exam parameters (examPass derived from the exam's percentage pass mark).
function contentToTracks(content) {
  const tracks = {};
  const trackKeys = [];
  for (const exam of content.exams || []) {
    const key = String(exam.id);
    trackKeys.push(key);
    const questions = [];
    const decks = [];
    (exam.topics || []).forEach((topic, i) => {
      decks.push({
        cat: topic.name,
        short: topic.name,
        color: DECK_PALETTE[i % DECK_PALETTE.length],
      });
      for (const question of topic.questions || []) {
        const opts = question.options || {};
        questions.push({
          id: question.id,
          cat: topic.name,
          q: question.text,
          A: opts.A,
          B: opts.B,
          C: opts.C,
          D: opts.D,
          correct: question.correct,
          explanation: question.explanation,
          source: question.source,
        });
      }
    });
    tracks[key] = {
      id: key,
      label: exam.name,
      title: exam.name,
      questions,
      decks,
      speciesCats: new Set(),
      examSize: exam.exam_size,
      examPass: Math.round((exam.pass_mark / 100) * exam.exam_size),
      passMarkPct: exam.pass_mark,
    };
  }
  return { tracks, trackKeys };
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const LETTERS = ["A", "B", "C", "D"];

function StudyApp({ tracks, trackKeys, courseName, onChangeCourse, onSettings }) {
  const [track, setTrack] = useState(trackKeys[0]); // which exam within the course
  // deck can be a cat string, "ALL", "ALL_SPECIES", or null (home)
  const [deck, setDeck] = useState(null);
  const [mode, setMode] = useState("mcq"); // "mcq" | "flash" | "exam" — persists across decks
  const [order, setOrder] = useState([]);
  const [pos, setPos] = useState(0);
  const [wrong, setWrong] = useState([]); // wrong letters tried on current question
  const [solved, setSolved] = useState(false); // current question answered correctly
  const [flipped, setFlipped] = useState(false); // flashcard revealed
  const [hits, setHits] = useState(0); // correct attempts (score numerator)
  const [tries, setTries] = useState(0); // total attempts (score denominator)
  // exam mode
  const [examAnswers, setExamAnswers] = useState({}); // id -> chosen letter (editable until submit)
  const [finished, setFinished] = useState(false); // exam results shown

  // Everything below is scoped to the active track.
  const activeTrack = tracks[track];
  const activeQuestions = activeTrack.questions;
  const activeDecks = activeTrack.decks;
  const speciesCats = activeTrack.speciesCats;
  const EXAM_SIZE = activeTrack.examSize;
  const PASS_PCT = activeTrack.passMarkPct;

  const byId = useMemo(
    () => Object.fromEntries(activeQuestions.map((q) => [q.id, q])),
    [activeQuestions]
  );
  const colorFor = useMemo(
    () => Object.fromEntries(activeDecks.map((d) => [d.cat, d.color])),
    [activeDecks]
  );

  const deckLabel = useMemo(() => {
    if (deck === "ALL") return "All questions";
    if (deck === "ALL_SPECIES") return "All species";
    const d = activeDecks.find((x) => x.cat === deck);
    return d ? d.short : "";
  }, [deck, activeDecks]);

  const deckColor = useMemo(() => {
    if (deck === "ALL") return "#f2f5fa";
    if (deck === "ALL_SPECIES") return "#9A8CE8";
    return colorFor[deck] || "#f2f5fa";
  }, [deck, colorFor]);

  const startDeck = useCallback(
    (d) => {
      let qs;
      if (d === "ALL") qs = activeQuestions;
      else if (d === "ALL_SPECIES") qs = activeQuestions.filter((q) => speciesCats.has(q.cat));
      else qs = activeQuestions.filter((q) => q.cat === d);
      let shuffled = shuffle(qs.map((q) => q.id));
      if (mode === "exam") shuffled = shuffled.slice(0, EXAM_SIZE);
      setDeck(d);
      setOrder(shuffled);
      setPos(0);
      setWrong([]);
      setSolved(false);
      setFlipped(false);
      setHits(0);
      setTries(0);
      setExamAnswers({});
      setFinished(false);
    },
    [mode, activeQuestions, speciesCats, EXAM_SIZE]
  );

  const q = byId[order[pos]];

  // Stable per-question option order — shuffled once per deck session so it
  // doesn't reshuffle when you navigate back and forth in the exam.
  const optOrders = useMemo(() => {
    const m = {};
    for (const id of order) m[id] = shuffle(LETTERS);
    return m;
  }, [order]);
  const optOrder = q ? optOrders[q.id] || LETTERS : [];

  const next = useCallback(() => {
    setWrong([]);
    setSolved(false);
    setFlipped(false);
    setPos((p) => (p + 1) % order.length);
  }, [order.length]);

  const choose = useCallback(
    (letter, e) => {
      if (e && e.currentTarget) e.currentTarget.blur();
      if (solved) return; // once solved, options are locked
      if (wrong.includes(letter)) return; // already-tried wrong option
      setTries((t) => t + 1);
      if (letter === q.correct) {
        setHits((h) => h + 1);
        setSolved(true);
      } else {
        setWrong((w) => [...w, letter]);
      }
    },
    [solved, wrong, q]
  );

  // Flashcard: self-grade counts as one attempt and advances.
  const grade = useCallback(
    (gotIt) => {
      setTries((t) => t + 1);
      if (gotIt) setHits((h) => h + 1);
      setFlipped(false);
      setPos((p) => (p + 1) % order.length);
    },
    [order.length]
  );

  // Exam: answers are editable and revisitable until submit. No feedback yet.
  const examChoose = useCallback(
    (letter, e) => {
      if (e && e.currentTarget) e.currentTarget.blur();
      if (q) setExamAnswers((a) => ({ ...a, [q.id]: letter }));
    },
    [q]
  );

  const examPrev = useCallback(() => setPos((p) => Math.max(0, p - 1)), []);
  const examGoNext = useCallback(
    () => setPos((p) => Math.min(order.length - 1, p + 1)),
    [order.length]
  );
  const examSubmit = useCallback(() => {
    const unanswered = order.filter((id) => !examAnswers[id]).length;
    if (
      unanswered > 0 &&
      !window.confirm(
        `${unanswered} question${unanswered === 1 ? "" : "s"} not answered. Submit anyway?`
      )
    )
      return;
    setFinished(true);
  }, [order, examAnswers]);

  // Exam results (computed when finished).
  const examResult = useMemo(() => {
    if (mode !== "exam") return null;
    let score = 0;
    const byCat = {};
    for (const id of order) {
      const qq = byId[id];
      if (!qq) continue;
      const picked = examAnswers[id];
      const ok = picked === qq.correct;
      if (ok) score += 1;
      const cat = qq.cat;
      if (!byCat[cat]) byCat[cat] = { correct: 0, total: 0 };
      byCat[cat].total += 1;
      if (ok) byCat[cat].correct += 1;
    }
    // Wrong / unanswered questions, for end-of-exam review.
    const review = [];
    for (const id of order) {
      const qq = byId[id];
      if (!qq) continue;
      const picked = examAnswers[id];
      if (picked !== qq.correct) review.push({ q: qq, picked });
    }
    const total = order.length;
    // Scale the pass threshold by the exam's percentage: an 80% exam on a
    // 10-question pool needs 8, not the nominal count. At least 1 to pass.
    const passNeeded = Math.max(1, Math.round((PASS_PCT / 100) * total));
    return { score, total, passNeeded, passed: score >= passNeeded, byCat, review };
  }, [mode, order, examAnswers, byId, PASS_PCT]);

  const correct = hits;

  // Count questions per deck for the home screen.
  const counts = useMemo(() => {
    const c = {};
    for (const qq of activeQuestions) c[qq.cat] = (c[qq.cat] || 0) + 1;
    return c;
  }, [activeQuestions]);

  // ── HOME ──────────────────────────────────────────────────────────────────
  if (!deck) {
    return (
      <div style={styles.root}>
        <div style={styles.wrap}>
          <div style={styles.topBar}>
            <span style={styles.topBarName}>{courseName}</span>
            <span style={styles.topBarLinks}>
              <button style={styles.linkBtn} onClick={onSettings}>
                Settings
              </button>
              <button style={styles.linkBtn} onClick={onChangeCourse}>
                Change course
              </button>
              <a style={styles.linkBtn} href="/accounts/logout/">
                Log out
              </a>
            </span>
          </div>
          <header style={styles.homeHeader}>
            <div style={styles.eyebrow}>{courseName}</div>
            <h1 style={styles.homeTitle}>{activeTrack.title}</h1>
            <p style={styles.homeSub}>
              {activeQuestions.length} questions across {activeDecks.length} topics. Pick an exam, mode, then a deck.
            </p>
          </header>

          {trackKeys.length > 1 && (
            <div style={styles.segment}>
              {trackKeys.map((k) => {
                const tr = tracks[k];
                return (
                  <button
                    key={tr.id}
                    style={{ ...styles.segBtn, ...(track === tr.id ? styles.segActive : {}) }}
                    onClick={() => setTrack(tr.id)}
                  >
                    {tr.label}
                  </button>
                );
              })}
            </div>
          )}

          <div style={styles.divider}>TEST MODE</div>

          <div style={styles.segment}>
            <button
              style={{ ...styles.segBtn, ...(mode === "mcq" ? styles.segActive : {}) }}
              onClick={() => setMode("mcq")}
            >
              Practice
            </button>
            <button
              style={{ ...styles.segBtn, ...(mode === "flash" ? styles.segActive : {}) }}
              onClick={() => setMode("flash")}
            >
              Flashcards
            </button>
            <button
              style={{ ...styles.segBtn, ...(mode === "exam" ? styles.segActive : {}) }}
              onClick={() => setMode("exam")}
            >
              Mock exam
            </button>
          </div>

          {mode === "exam" && (
            <p style={styles.examNote}>
              {EXAM_SIZE} questions across all topics. No feedback until the end. Pass mark {PASS_PCT}%.
            </p>
          )}

          <div style={{ ...styles.divider, marginTop: 22 }}>QUESTION BANKS</div>

          <button style={{ ...styles.deckRow, ...styles.deckAll }} onClick={() => startDeck("ALL")}>
            <span style={styles.deckName}>Everything</span>
            <span style={styles.deckCount}>{activeQuestions.length}</span>
          </button>
          {speciesCats.size > 0 && (
            <button style={{ ...styles.deckRow, ...styles.deckAllSpecies }} onClick={() => startDeck("ALL_SPECIES")}>
              <span style={styles.deckName}>All species (mixed)</span>
              <span style={styles.deckCount}>
                {activeDecks.filter((d) => speciesCats.has(d.cat)).reduce((s, d) => s + (counts[d.cat] || 0), 0)}
              </span>
            </button>
          )}

          <div style={styles.divider}>TOPICS</div>

          {activeDecks.map((d) => (
            <button
              key={d.cat}
              style={{ ...styles.deckRow, borderLeft: `4px solid ${d.color}` }}
              onClick={() => startDeck(d.cat)}
            >
              <span style={styles.deckName}>
                <span style={{ ...styles.deckDot, background: d.color }} />
                {d.short}
              </span>
              <span style={styles.deckCount}>{counts[d.cat] || 0}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── EXAM RESULTS ───────────────────────────────────────────────────────────
  if (mode === "exam" && finished && examResult) {
    const { score, total, passNeeded, passed, byCat, review } = examResult;
    const pct = total ? Math.round((score / total) * 100) : 0;
    return (
      <div style={styles.root}>
        <div style={styles.wrap}>
          <header style={styles.header}>
            <button style={styles.backBtn} onClick={() => setDeck(null)}>
              ‹ Decks
            </button>
            <div style={styles.deckTag}>
              <span style={{ ...styles.deckDot, background: deckColor }} />
              {activeTrack.label} · {deckLabel} · Mock exam
            </div>
            <span style={{ width: 38 }} />
          </header>

          <div
            style={{
              ...styles.card,
              borderTop: `3px solid ${passed ? "#CCFF66" : "#FF6699"}`,
              textAlign: "center",
              paddingTop: 30,
              paddingBottom: 30,
            }}
          >
            <div style={{ ...styles.resultVerdict, color: passed ? "#CCFF66" : "#FF6699" }}>
              {passed ? "PASS" : "FAIL"}
            </div>
            <div style={styles.resultScore}>
              {score}
              <span style={styles.resultScoreTotal}> / {total}</span>
            </div>
            <div style={styles.resultPct}>{pct}%</div>
            <div style={styles.resultThreshold}>
              Pass mark {PASS_PCT}% — {passNeeded} / {total}
              {total < EXAM_SIZE ? " (short deck)" : ""}
            </div>
          </div>

          <div style={styles.breakdownWrap}>
            <div style={styles.breakdownTitle}>BY TOPIC</div>
            {Object.entries(byCat)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([cat, { correct: c, total: t }]) => {
                const short = (activeDecks.find((d) => d.cat === cat) || {}).short || cat;
                const cpct = t ? Math.round((c / t) * 100) : 0;
                return (
                  <div key={cat} style={styles.breakdownRow}>
                    <span style={styles.breakdownName}>
                      <span style={{ ...styles.deckDot, background: colorFor[cat] || "#fff" }} />
                      {short}
                    </span>
                    <span style={styles.breakdownScore}>
                      <span style={styles.breakdownFrac}>{c}/{t}</span>
                      <span style={{ ...styles.breakdownPct, color: cpct >= 80 ? "#CCFF66" : cpct >= 50 ? "#FFCC33" : "#FF6699" }}>
                        {cpct}%
                      </span>
                    </span>
                  </div>
                );
              })}
          </div>

          {review.length > 0 && (
            <div style={styles.breakdownWrap}>
              <div style={styles.breakdownTitle}>REVIEW — {review.length} INCORRECT</div>
              {review.map(({ q: rq, picked }) => (
                <div key={rq.id} style={styles.reviewItem}>
                  <div style={styles.reviewQ}>{rq.q}</div>
                  <div style={{ ...styles.reviewLine, ...styles.reviewWrong }}>
                    <span style={styles.reviewLbl}>Your answer</span>
                    <span>{picked ? `${picked}. ${rq[picked]}` : "Not answered"}</span>
                  </div>
                  <div style={{ ...styles.reviewLine, ...styles.reviewRight }}>
                    <span style={styles.reviewLbl}>Correct</span>
                    <span>{rq.correct}. {rq[rq.correct]}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button style={styles.nextBtn} onClick={() => startDeck(deck)}>
            Retake mock exam →
          </button>
          <button style={{ ...styles.backBtn, width: "100%", padding: "13px 0", fontSize: 14 }} onClick={() => setDeck(null)}>
            Back to decks
          </button>
        </div>
      </div>
    );
  }

  // ── QUIZ ──────────────────────────────────────────────────────────────────
  return (
    <div style={styles.root}>
      <div style={styles.wrap}>
        <header style={styles.header}>
          <button style={styles.backBtn} onClick={() => setDeck(null)}>
            ‹ Decks
          </button>
          <div style={styles.deckTag}>
            <span style={{ ...styles.deckDot, background: deckColor }} />
            {deckLabel}
          </div>
          {mode === "exam" ? (
            // No restart during an exam — matches the real exam.
            <span style={{ width: 38 }} />
          ) : (
            <button style={styles.ghostBtn} onClick={() => startDeck(deck)}>
              ↻
            </button>
          )}
        </header>

        {q ? (
          <>
            <div style={{ ...styles.card, borderTop: `3px solid ${deckColor}` }}>
              <div style={styles.cardLabel}>
                <span style={{ color: colorFor[q.cat] || "#fff", display: "inline-flex", alignItems: "center", gap: 8 }}>
                  {(activeDecks.find((d) => d.cat === q.cat) || {}).short || q.cat}
                </span>
                <span style={styles.qNum}>
                  {pos + 1} / {order.length}
                </span>
              </div>
              <p style={styles.question}>{q.q}</p>

              {mode === "mcq" ? (
                <>
                  <div style={styles.options}>
                    {optOrder.map((letter) => {
                      const isAnswer = letter === q.correct;
                      const isWrong = wrong.includes(letter);
                      let s = { ...styles.option };
                      if (solved) {
                        // locked: highlight the correct answer, dim the rest
                        if (isAnswer) s = { ...s, ...styles.optCorrect };
                        else if (isWrong) s = { ...s, ...styles.optWrong };
                        else s = { ...s, ...styles.optDim };
                      } else if (isWrong) {
                        // marked wrong but question still open
                        s = { ...s, ...styles.optWrong };
                      }
                      const locked = solved || isWrong;
                      return (
                        <button
                          key={letter}
                          style={s}
                          onClick={(e) => choose(letter, e)}
                          disabled={locked}
                        >
                          <span>{q[letter]}</span>
                          {solved && isAnswer && <span style={styles.mark}>✓</span>}
                          {isWrong && <span style={styles.mark}>✕</span>}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : mode === "exam" ? (
                <>
                  <div style={styles.options}>
                    {optOrder.map((letter) => {
                      // Editable selection, no feedback — change it any time before submit.
                      const picked = examAnswers[q.id];
                      let s = { ...styles.option };
                      if (picked === letter) s = { ...s, ...styles.optSelected };
                      return (
                        <button
                          key={letter}
                          style={s}
                          onClick={(e) => examChoose(letter, e)}
                        >
                          <span>{q[letter]}</span>
                          {picked === letter && <span style={styles.mark}>●</span>}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div
                  style={styles.flashReveal}
                  onClick={() => !flipped && setFlipped(true)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if ((e.key === " " || e.key === "Enter") && !flipped) {
                      e.preventDefault();
                      setFlipped(true);
                    }
                  }}
                >
                  {flipped ? (
                    <div style={styles.answerBox}>
                      <div style={styles.answerLabel}>ANSWER</div>
                      <div style={styles.answerText}>{q[q.correct]}</div>
                    </div>
                  ) : (
                    <div style={styles.tapHint}>tap to reveal answer</div>
                  )}
                </div>
              )}
            </div>

            {mode === "mcq" ? (
              <button
                style={{ ...styles.nextBtn, opacity: solved ? 1 : 0.4, cursor: solved ? "pointer" : "not-allowed" }}
                onClick={next}
                disabled={!solved}
              >
                Next question →
              </button>
            ) : mode === "exam" ? (
              <>
                <div style={styles.examNav}>
                  <button
                    style={{ ...styles.navBtn, opacity: pos === 0 ? 0.4 : 1, cursor: pos === 0 ? "not-allowed" : "pointer" }}
                    onClick={examPrev}
                    disabled={pos === 0}
                  >
                    ‹ Previous
                  </button>
                  <button
                    style={{ ...styles.navBtn, opacity: pos + 1 >= order.length ? 0.4 : 1, cursor: pos + 1 >= order.length ? "not-allowed" : "pointer" }}
                    onClick={examGoNext}
                    disabled={pos + 1 >= order.length}
                  >
                    Next ›
                  </button>
                </div>
                <button style={styles.nextBtn} onClick={examSubmit}>
                  Submit exam →
                </button>
              </>
            ) : flipped ? (
              <div style={styles.gradeRow}>
                <button style={{ ...styles.gradeBtn, ...styles.missBtn }} onClick={() => grade(false)}>
                  ✕ Missed
                </button>
                <button style={{ ...styles.gradeBtn, ...styles.gotBtn }} onClick={() => grade(true)}>
                  ✓ Got it
                </button>
              </div>
            ) : (
              <button style={{ ...styles.nextBtn }} onClick={() => setFlipped(true)}>
                Reveal answer
              </button>
            )}
          </>
        ) : (
          <div style={styles.empty}>
            {mode === "exam"
              ? "No answered questions in this deck yet — try Hygiene or Everything."
              : "No questions."}
          </div>
        )}

        <footer style={styles.footer}>
          {mode === "exam" ? (
            <div style={styles.progressRow}>
              <span>Question {pos + 1} of {order.length}</span>
              <span style={{ opacity: 0.6 }}>{Object.keys(examAnswers).length} answered</span>
            </div>
          ) : (
            <div style={styles.progressRow}>
              <span>{tries} {tries === 1 ? "attempt" : "attempts"}</span>
              <span style={styles.scoreChips}>
                <span style={{ color: "#CCFF66" }}>✓ {correct}</span>
                <span style={{ color: "#FF6699" }}>✕ {tries - correct}</span>
                <span style={{ opacity: 0.6 }}>{tries ? Math.round((correct / tries) * 100) : 0}%</span>
              </span>
            </div>
          )}
          <div style={styles.track}>
            <div
              style={{
                ...styles.fill,
                width: order.length
                  ? `${(((mode === "exam"
                      ? Object.keys(examAnswers).length
                      : pos + (mode === "mcq" ? (solved ? 1 : 0) : flipped ? 1 : 0)) ) / order.length) * 100}%`
                  : "0%",
              }}
            />
          </div>
        </footer>
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "radial-gradient(120% 100% at 50% 0%, #12203a 0%, #0a1424 55%, #060c17 100%)",
    color: "#f2f5fa",
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    display: "flex",
    justifyContent: "center",
    padding: "24px 16px 40px",
    boxSizing: "border-box",
  },
  wrap: { width: "100%", maxWidth: 560 },

  // home
  homeHeader: { marginBottom: 22 },
  homeTitle: { margin: "4px 0 0", fontSize: 34, fontWeight: 800, letterSpacing: "-0.01em" },
  homeSub: { margin: "8px 0 0", color: "#8ea1c0", fontSize: 14.5 },
  segment: {
    display: "flex",
    gap: 4,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 4,
  },
  segBtn: {
    flex: 1,
    background: "transparent",
    border: "none",
    color: "#8ea1c0",
    borderRadius: 9,
    padding: "11px 0",
    fontSize: 14.5,
    fontWeight: 600,
    cursor: "pointer",
    outline: "none",
    transition: "all .15s",
  },
  segActive: { background: "rgba(242,245,250,0.12)", color: "#f2f5fa" },
  examNote: {
    margin: "12px 2px 0",
    fontSize: 13,
    lineHeight: 1.5,
    color: "#8ea1c0",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: "11px 13px",
  },
  resultVerdict: { fontSize: 15, fontWeight: 800, letterSpacing: "0.22em", marginBottom: 10 },
  resultScore: { fontSize: 56, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.02em" },
  resultScoreTotal: { fontSize: 26, fontWeight: 600, color: "#7f93b4" },
  resultPct: { fontSize: 20, fontWeight: 700, color: "#cdd8ea", marginTop: 8 },
  resultThreshold: { fontSize: 13, color: "#7f93b4", marginTop: 12 },
  breakdownWrap: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: "8px 6px",
    marginBottom: 16,
  },
  breakdownTitle: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.16em",
    color: "#5f75a0",
    padding: "10px 12px 6px",
  },
  breakdownRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "9px 12px",
    fontSize: 14,
  },
  breakdownName: { display: "inline-flex", alignItems: "center", gap: 9, color: "#dbe4f2" },
  breakdownScore: { display: "inline-flex", alignItems: "center", gap: 12 },
  breakdownFrac: { color: "#8ea1c0", fontVariantNumeric: "tabular-nums" },
  breakdownPct: { fontWeight: 700, fontVariantNumeric: "tabular-nums", minWidth: 42, textAlign: "right" },
  deckRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    background: "rgba(255,255,255,0.045)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 14,
    padding: "16px 18px",
    marginBottom: 10,
    color: "#eaf0f9",
    fontSize: 16,
    cursor: "pointer",
    outline: "none",
    textAlign: "left",
    transition: "background .12s",
  },
  deckAll: { background: "rgba(242,245,250,0.1)", borderColor: "rgba(242,245,250,0.3)", fontWeight: 700 },
  deckAllSpecies: { background: "rgba(154,140,232,0.12)", borderColor: "rgba(154,140,232,0.35)", fontWeight: 600 },
  deckName: { display: "inline-flex", alignItems: "center", gap: 11, fontWeight: 600 },
  deckDot: { width: 10, height: 10, borderRadius: "50%", display: "inline-block", flexShrink: 0 },
  deckCount: { color: "#7f93b4", fontSize: 14, fontWeight: 600, fontVariantNumeric: "tabular-nums" },
  divider: {
    fontSize: 11,
    letterSpacing: "0.18em",
    color: "#5f75a0",
    fontWeight: 700,
    margin: "20px 4px 12px",
  },

  // quiz header
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, gap: 10 },
  backBtn: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "#dbe4f2",
    borderRadius: 999,
    padding: "8px 14px",
    fontSize: 13,
    cursor: "pointer",
    outline: "none",
    flexShrink: 0,
  },
  deckTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    fontWeight: 600,
    color: "#cdd8ea",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
  ghostBtn: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "#dbe4f2",
    borderRadius: 999,
    width: 38,
    height: 38,
    fontSize: 15,
    cursor: "pointer",
    outline: "none",
    flexShrink: 0,
  },
  eyebrow: { fontSize: 11, letterSpacing: "0.18em", color: "#7f93b4", fontWeight: 600 },

  // top bar + auth/course shell
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  },
  topBarName: {
    fontSize: 13,
    fontWeight: 700,
    color: "#dbe4f2",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  topBarLinks: { display: "flex", gap: 14, flexShrink: 0 },
  linkBtn: {
    background: "none",
    border: "none",
    padding: 0,
    color: "#8fa3c4",
    fontSize: 12.5,
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "none",
    outline: "none",
  },
  shellCenter: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
    boxSizing: "border-box",
    background: "radial-gradient(120% 100% at 50% 0%, #12203a 0%, #0a1424 55%, #060c17 100%)",
    color: "#f2f5fa",
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  },
  shellCard: {
    width: "100%",
    maxWidth: 420,
    background: "rgba(255,255,255,0.045)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: "28px 26px 30px",
    boxShadow: "0 20px 50px -20px rgba(0,0,0,0.6)",
    textAlign: "center",
  },
  shellHeading: { fontSize: 22, fontWeight: 700, margin: "12px 0 8px" },
  shellText: { fontSize: 14.5, lineHeight: 1.5, color: "#aab8d1", margin: "0 0 22px" },
  shellCta: {
    display: "inline-block",
    background: "#CCFF66",
    color: "#0a1424",
    fontSize: 14.5,
    fontWeight: 700,
    padding: "12px 26px",
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    textDecoration: "none",
  },

  card: {
    background: "rgba(255,255,255,0.045)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: "22px 22px 24px",
    marginBottom: 14,
    backdropFilter: "blur(12px)",
    boxShadow: "0 20px 50px -20px rgba(0,0,0,0.6)",
  },
  cardLabel: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: 16,
  },
  qNum: { color: "#6d80a1", letterSpacing: "0.08em", fontVariantNumeric: "tabular-nums" },
  question: { fontSize: 18.5, lineHeight: 1.45, fontWeight: 600, margin: "0 0 20px" },

  // flashcard mode
  flashReveal: {
    minHeight: 96,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    outline: "none",
  },
  tapHint: {
    color: "#6076a0",
    fontSize: 13.5,
    letterSpacing: "0.04em",
    border: "1px dashed rgba(255,255,255,0.16)",
    borderRadius: 13,
    padding: "26px 20px",
    width: "100%",
    textAlign: "center",
  },
  answerBox: {
    width: "100%",
    background: "rgba(204,255,102,0.1)",
    border: "1px solid rgba(204,255,102,0.4)",
    borderRadius: 13,
    padding: "18px 18px",
  },
  answerLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.14em",
    color: "#CCFF66",
    marginBottom: 8,
  },
  answerText: { fontSize: 17, lineHeight: 1.5, fontWeight: 600, color: "#eaffcf" },
  gradeRow: { display: "flex", gap: 10, marginBottom: 26 },
  gradeBtn: {
    flex: 1,
    border: "none",
    borderRadius: 14,
    padding: "15px 0",
    fontSize: 15.5,
    fontWeight: 700,
    cursor: "pointer",
    outline: "none",
    transition: "transform .08s",
  },
  gotBtn: { background: "#CCFF66", color: "#12300a" },
  missBtn: {
    background: "rgba(255,102,153,0.15)",
    color: "#FF6699",
    border: "1px solid rgba(255,102,153,0.4)",
  },

  options: { display: "flex", flexDirection: "column", gap: 10 },
  option: {
    position: "relative",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    textAlign: "left",
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "#eaf0f9",
    borderRadius: 13,
    padding: "13px 15px",
    paddingRight: 42,
    fontSize: 14.5,
    lineHeight: 1.35,
    fontWeight: 500,
    cursor: "pointer",
    outline: "none",
    WebkitTapHighlightColor: "transparent",
    transition: "all .12s",
  },
  optCorrect: { background: "rgba(204,255,102,0.14)", borderColor: "#CCFF66", color: "#eaffcf" },
  optWrong: { background: "rgba(255,102,153,0.14)", borderColor: "#FF6699", color: "#ffdce8" },
  optSelected: { background: "rgba(255,255,255,0.13)", borderColor: "rgba(255,255,255,0.5)", color: "#fff" },
  optDim: { opacity: 0.42 },
  mark: {
    position: "absolute",
    right: 15,
    top: "50%",
    transform: "translateY(-50%)",
    fontWeight: 800,
    fontSize: 15,
    lineHeight: 1,
    pointerEvents: "none",
  },
  nextBtn: {
    width: "100%",
    background: "#f2f5fa",
    color: "#0a1424",
    border: "none",
    borderRadius: 14,
    padding: "15px 0",
    fontSize: 15.5,
    fontWeight: 700,
    marginBottom: 26,
    outline: "none",
    transition: "opacity .15s",
  },
  examNav: { display: "flex", gap: 10, marginBottom: 10 },
  navBtn: {
    flex: 1,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.16)",
    color: "#eaf0f9",
    borderRadius: 14,
    padding: "13px 0",
    fontSize: 14.5,
    fontWeight: 600,
    outline: "none",
    transition: "opacity .15s",
  },
  reviewItem: {
    padding: "12px 12px 6px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  reviewQ: {
    fontSize: 14,
    fontWeight: 600,
    color: "#eaf0f9",
    lineHeight: 1.4,
    marginBottom: 9,
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    flexWrap: "wrap",
  },
  reviewLine: {
    display: "flex",
    gap: 10,
    fontSize: 13.5,
    lineHeight: 1.4,
    padding: "5px 0",
  },
  reviewWrong: { color: "#ffb3cc" },
  reviewRight: { color: "#d6f5a3" },
  reviewLbl: {
    flexShrink: 0,
    width: 82,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "#7f93b4",
    paddingTop: 1,
  },
  empty: { padding: 40, textAlign: "center", color: "#7f93b4" },
  footer: { marginTop: 4 },
  progressRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 12.5,
    color: "#8ea1c0",
    marginBottom: 8,
  },
  scoreChips: { display: "flex", gap: 14, fontWeight: 600 },
  track: { height: 6, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" },
  fill: { height: "100%", background: "linear-gradient(90deg,#66CCFF,#CCFF66)", transition: "width .3s" },

  // create + upload course screens (shell)
  fieldWrap: { display: "block", marginBottom: 16 },
  fieldLabel: {
    display: "block",
    fontSize: 12.5,
    fontWeight: 600,
    color: "#8ea1c0",
    marginBottom: 7,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "#eaf0f9",
    borderRadius: 12,
    padding: "12px 14px",
    fontSize: 14.5,
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color .12s, box-shadow .12s",
  },
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "#eaf0f9",
    borderRadius: 12,
    padding: "12px 14px",
    fontSize: 14.5,
    lineHeight: 1.5,
    minHeight: 92,
    resize: "vertical",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color .12s, box-shadow .12s",
  },
  fieldFocus: { borderColor: "#CCFF66", boxShadow: "0 0 0 3px rgba(204,255,102,0.15)" },
  formError: { color: "#FF6699", fontSize: 13.5, margin: "2px 0 14px", lineHeight: 1.4 },
  formCancel: {
    display: "block",
    width: "100%",
    background: "none",
    border: "none",
    color: "#8ea1c0",
    fontSize: 13.5,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 12,
    outline: "none",
  },
  fileBtn: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    textAlign: "center",
    background: "rgba(255,255,255,0.06)",
    border: "1px dashed rgba(255,255,255,0.22)",
    color: "#dbe4f2",
    borderRadius: 12,
    padding: "14px 16px",
    fontSize: 14.5,
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: 16,
  },
  summaryWrap: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: "10px 12px",
    marginBottom: 14,
  },
  summaryExam: { marginBottom: 6 },
  summaryExamName: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#8ea1c0",
    padding: "6px 2px",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "7px 4px",
    fontSize: 14,
    color: "#dbe4f2",
    borderTop: "1px solid rgba(255,255,255,0.05)",
  },
  summaryTotals: {
    fontSize: 12.5,
    color: "#8ea1c0",
    fontWeight: 600,
    padding: "10px 4px 4px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    marginTop: 4,
  },
  errorList: {
    background: "rgba(255,102,153,0.08)",
    border: "1px solid rgba(255,102,153,0.3)",
    borderRadius: 12,
    padding: "10px 12px",
    marginBottom: 14,
  },
  errorRow: {
    display: "flex",
    gap: 10,
    fontSize: 13,
    color: "#FF6699",
    padding: "4px 0",
    lineHeight: 1.4,
  },
  errorRowNum: { flexShrink: 0, fontWeight: 700, minWidth: 54 },
  committedText: {
    color: "#CCFF66",
    fontSize: 14.5,
    fontWeight: 600,
    lineHeight: 1.5,
    marginBottom: 16,
  },

  // exam settings screen
  settingsRow: {
    background: "rgba(255,255,255,0.045)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: "16px 18px 18px",
    marginBottom: 14,
    boxShadow: "0 20px 50px -20px rgba(0,0,0,0.6)",
  },
  settingsExamName: {
    fontSize: 16,
    fontWeight: 700,
    color: "#eaf0f9",
    marginBottom: 12,
  },
  settingsFields: { display: "flex", gap: 12, marginBottom: 4 },
  settingsField: { flex: 1, display: "block" },
};

// Centered themed card used by every shell screen (loading / login / picker).
function ShellCard({ children }) {
  return (
    <div style={styles.shellCenter}>
      <div style={styles.shellCard}>{children}</div>
    </div>
  );
}

// Small hook: applies the lime focus ring to a themed field on focus.
function useFocusStyle(base) {
  const [focused, setFocused] = useState(false);
  return {
    style: focused ? { ...base, ...styles.fieldFocus } : base,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
  };
}

// Create-course screen: name + rubric, POSTs via createCourse, hands the new
// course back to the shell on success.
function CreateCourse({ onCreated, onCancel }) {
  const [name, setName] = useState("");
  const [rubric, setRubric] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const nameField = useFocusStyle(styles.input);
  const rubricField = useFocusStyle(styles.textarea);

  const submit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name is required");
      return;
    }
    setBusy(true);
    setError("");
    const course = await createCourse(trimmed, rubric.trim());
    setBusy(false);
    if (course) onCreated(course);
    else setError("Could not create the course. Please try again.");
  };

  return (
    <div style={styles.shellCenter}>
      <form style={{ ...styles.shellCard, textAlign: "left" }} onSubmit={submit}>
        <div style={styles.eyebrow}>DSC1 · QUESTION BANK</div>
        <h1 style={styles.shellHeading}>New course</h1>
        <label style={styles.fieldWrap}>
          <span style={styles.fieldLabel}>Course name</span>
          <input
            {...nameField}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. DSC1 Meat Hygiene"
            autoFocus
          />
        </label>
        <label style={styles.fieldWrap}>
          <span style={styles.fieldLabel}>Rubric (optional)</span>
          <textarea
            {...rubricField}
            value={rubric}
            onChange={(e) => setRubric(e.target.value)}
            placeholder="Notes about the exam, marking, or scope"
            rows={4}
          />
        </label>
        {error && <p style={styles.formError}>{error}</p>}
        <button
          type="submit"
          style={{ ...styles.shellCta, width: "100%", opacity: busy ? 0.6 : 1 }}
          disabled={busy}
        >
          {busy ? "Creating…" : "Create"}
        </button>
        <button type="button" style={styles.formCancel} onClick={onCancel}>
          Cancel
        </button>
      </form>
    </div>
  );
}

// Upload/import screen for a chosen course: pick a CSV, preview the parsed
// summary (with row errors), import, then hand off to study.
function UploadCourse({ course, onDone }) {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [committed, setCommitted] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const errors = (summary && summary.errors) || [];
  const total = summary ? summary.totals.rows : 0;

  const onPick = async (e) => {
    const picked = e.target.files && e.target.files[0];
    if (!picked) return;
    setFile(picked);
    setSummary(null);
    setCommitted(null);
    setError("");
    setBusy(true);
    try {
      setSummary(await importPreview(course.id, picked));
    } catch {
      setError("Could not read that file.");
    }
    setBusy(false);
  };

  const doImport = async () => {
    if (!file || errors.length) return;
    setBusy(true);
    setError("");
    const { ok, data } = await importCommit(course.id, file);
    setBusy(false);
    if (ok) setCommitted(data);
    else setError("Import failed — please check the file and try again.");
  };

  return (
    <div style={styles.shellCenter}>
      <div style={{ ...styles.shellCard, maxWidth: 480, textAlign: "left" }}>
        <div style={styles.eyebrow}>{course.name}</div>
        <h1 style={styles.shellHeading}>Upload questions</h1>
        <p style={{ ...styles.shellText, marginBottom: 18 }}>
          Choose a CSV to import exams, topics, and questions into this course.
        </p>

        <label style={styles.fileBtn}>
          {file ? file.name : "Choose CSV"}
          <input
            type="file"
            accept=".csv,text/csv"
            style={{ display: "none" }}
            onChange={onPick}
          />
        </label>

        {busy && !committed && <p style={styles.shellText}>Working…</p>}

        {summary && !committed && (
          <>
            <div style={styles.summaryWrap}>
              {summary.exams.map((ex) => (
                <div key={ex.name} style={styles.summaryExam}>
                  <div style={styles.summaryExamName}>{ex.name || "(no section)"}</div>
                  {ex.topics.map((t) => (
                    <div key={t.name} style={styles.summaryRow}>
                      <span>{t.name || "(no topic)"}</span>
                      <span style={styles.deckCount}>{t.questions}</span>
                    </div>
                  ))}
                </div>
              ))}
              <div style={styles.summaryTotals}>
                {summary.totals.rows} rows · {summary.totals.new} new ·{" "}
                {summary.totals.updated} updated
              </div>
            </div>

            {errors.length > 0 && (
              <div style={styles.errorList}>
                {errors.map((er, i) => (
                  <div key={i} style={styles.errorRow}>
                    <span style={styles.errorRowNum}>Row {er.row}</span>
                    <span>{er.message}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              style={{
                ...styles.shellCta,
                width: "100%",
                opacity: errors.length || busy ? 0.5 : 1,
                cursor: errors.length ? "not-allowed" : "pointer",
              }}
              onClick={doImport}
              disabled={!!errors.length || busy}
            >
              {busy ? "Importing…" : `Import ${total} question${total === 1 ? "" : "s"}`}
            </button>
          </>
        )}

        {committed && (
          <div>
            <div style={styles.committedText}>
              Imported {committed.questions_created} new · {committed.questions_updated}{" "}
              updated across {committed.exams} exam{committed.exams === 1 ? "" : "s"}.
            </div>
            <button
              style={{ ...styles.shellCta, width: "100%" }}
              onClick={() => onDone(course)}
            >
              Study now
            </button>
          </div>
        )}

        {error && <p style={styles.formError}>{error}</p>}
      </div>
    </div>
  );
}

// One editable Exam row inside the settings screen. Holds its own draft of
// exam_size / pass_mark; on Save it PATCHes and, on success, reflects the saved
// values and notifies the parent so the study content reloads.
function ExamSettingsRow({ course, exam, onSaved }) {
  const [size, setSize] = useState(String(exam.exam_size));
  const [mark, setMark] = useState(String(exam.pass_mark));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const sizeField = useFocusStyle(styles.input);
  const markField = useFocusStyle(styles.input);

  const save = async () => {
    setBusy(true);
    setError("");
    setSaved(false);
    const { ok, data } = await updateExam(
      course.id,
      exam.id,
      Number(size),
      Number(mark)
    );
    setBusy(false);
    if (ok) {
      setSize(String(data.exam_size));
      setMark(String(data.pass_mark));
      setSaved(true);
      onSaved();
    } else {
      const errs = (data && data.errors) || {};
      setError(errs.exam_size || errs.pass_mark || errs.detail || "Could not save.");
    }
  };

  return (
    <div style={styles.settingsRow}>
      <div style={styles.settingsExamName}>{exam.name}</div>
      <div style={styles.settingsFields}>
        <label style={styles.settingsField}>
          <span style={styles.fieldLabel}>Mock size</span>
          <input
            {...sizeField}
            type="number"
            min="1"
            value={size}
            onChange={(e) => {
              setSize(e.target.value);
              setSaved(false);
            }}
          />
        </label>
        <label style={styles.settingsField}>
          <span style={styles.fieldLabel}>Pass mark (%)</span>
          <input
            {...markField}
            type="number"
            min="1"
            max="100"
            value={mark}
            onChange={(e) => {
              setMark(e.target.value);
              setSaved(false);
            }}
          />
        </label>
      </div>
      {error && <p style={styles.formError}>{error}</p>}
      <button
        style={{ ...styles.shellCta, width: "100%", opacity: busy ? 0.6 : 1 }}
        onClick={save}
        disabled={busy}
      >
        {busy ? "Saving…" : saved ? "Saved ✓" : "Save"}
      </button>
    </div>
  );
}

// Exam settings screen: lists the current course's Exams, each with editable
// mock size and pass mark. Reached from the study top bar; "Back" returns to
// study. onSaved reloads the study content so the mock uses the new values.
function ExamSettings({ course, exams, onSaved, onBack }) {
  return (
    <div style={styles.root}>
      <div style={styles.wrap}>
        <div style={styles.topBar}>
          <span style={styles.topBarName}>{course.name}</span>
          <span style={styles.topBarLinks}>
            <button style={styles.linkBtn} onClick={onBack}>
              Back to study
            </button>
          </span>
        </div>
        <header style={styles.homeHeader}>
          <div style={styles.eyebrow}>{course.name}</div>
          <h1 style={styles.homeTitle}>Exam settings</h1>
          <p style={styles.homeSub}>
            Set each exam&apos;s mock size and pass mark. Saved values apply to the
            mock exam.
          </p>
        </header>
        {(exams || []).map((exam) => (
          <ExamSettingsRow
            key={exam.id}
            course={course}
            exam={exam}
            onSaved={onSaved}
          />
        ))}
        <button style={styles.formCancel} onClick={onBack}>
          Back to study
        </button>
      </div>
    </div>
  );
}

// Outer shell: gates on auth, picks a course, loads its content from the JSON
// API, then hands the mapped tracks to the study UI (StudyApp).
export default function App() {
  const [auth, setAuth] = useState(null); // null=loading, false=anon, object=user
  const [courses, setCourses] = useState(null); // null=not loaded yet
  const [course, setCourse] = useState(null); // selected course {id, name, ...}
  const [content, setContent] = useState(null); // loaded course content
  const [view, setView] = useState(null); // null | "create" | "upload" | "settings" (shell screens)

  useEffect(() => {
    // getMe() resolves to the user object or null (anon/403). Coerce null to
    // false so it doesn't collide with the `null` loading sentinel above.
    getMe().then((user) => setAuth(user || false));
  }, []);

  useEffect(() => {
    if (auth) listCourses().then(setCourses);
  }, [auth]);

  // Auto-select when the user owns exactly one course.
  useEffect(() => {
    if (courses && courses.length === 1 && !course) setCourse(courses[0]);
  }, [courses, course]);

  useEffect(() => {
    if (!course) return;
    setContent(null);
    getCourseContent(course.id).then(setContent);
  }, [course]);

  const changeCourse = useCallback(() => {
    setCourse(null);
    setContent(null);
  }, []);

  if (auth === null) {
    return (
      <ShellCard>
        <p style={styles.shellText}>Loading…</p>
      </ShellCard>
    );
  }

  if (auth === false) {
    return (
      <ShellCard>
        <div style={styles.eyebrow}>DSC1 · QUESTION BANK</div>
        <h1 style={styles.shellHeading}>Sign in to study</h1>
        <p style={styles.shellText}>Log in to load your course and start practising.</p>
        <a style={styles.shellCta} href="/accounts/login/">
          Log in
        </a>
      </ShellCard>
    );
  }

  if (courses === null) {
    return (
      <ShellCard>
        <p style={styles.shellText}>Loading your courses…</p>
      </ShellCard>
    );
  }

  // Shell screens (create / upload) take precedence over the picker and study
  // gates while the user is managing courses. They only apply once authed.
  if (view === "create") {
    return (
      <CreateCourse
        onCreated={(c) => {
          setCourse(c);
          setView("upload");
          listCourses().then(setCourses);
        }}
        onCancel={() => setView(null)}
      />
    );
  }

  if (view === "upload" && course) {
    return (
      <UploadCourse
        course={course}
        onDone={(c) => {
          setView(null);
          // Clone so the content-load effect re-fires and picks up the
          // freshly imported questions.
          setCourse({ ...c });
        }}
      />
    );
  }

  if (courses.length === 0) {
    return (
      <ShellCard>
        <div style={styles.eyebrow}>DSC1 · QUESTION BANK</div>
        <h1 style={styles.shellHeading}>No courses yet</h1>
        <p style={styles.shellText}>
          You don&apos;t have any courses to study. Create your first course to get started.
        </p>
        <button style={styles.shellCta} onClick={() => setView("create")}>
          Create your first course
        </button>
        <button style={styles.formCancel} onClick={() => (window.location.href = "/accounts/logout/")}>
          Log out
        </button>
      </ShellCard>
    );
  }

  if (!course) {
    return (
      <ShellCard>
        <div style={styles.eyebrow}>DSC1 · QUESTION BANK</div>
        <h1 style={styles.shellHeading}>Choose a course</h1>
        <p style={styles.shellText}>Pick which course you want to study.</p>
        <div style={styles.options}>
          {courses.map((c) => (
            <button key={c.id} style={styles.deckRow} onClick={() => setCourse(c)}>
              <span style={styles.deckName}>{c.name}</span>
            </button>
          ))}
        </div>
        <button style={styles.formCancel} onClick={() => setView("create")}>
          New course
        </button>
      </ShellCard>
    );
  }

  if (content === null) {
    return (
      <ShellCard>
        <p style={styles.shellText}>Loading {course.name}…</p>
      </ShellCard>
    );
  }

  if (view === "settings") {
    return (
      <ExamSettings
        course={course}
        exams={content.exams}
        onSaved={() => getCourseContent(course.id).then(setContent)}
        onBack={() => setView(null)}
      />
    );
  }

  const { tracks, trackKeys } = contentToTracks(content);

  if (trackKeys.length === 0) {
    return (
      <ShellCard>
        <div style={styles.eyebrow}>{course.name}</div>
        <h1 style={styles.shellHeading}>No questions yet</h1>
        <p style={styles.shellText}>This course has no exams or questions to study yet.</p>
        <button style={styles.shellCta} onClick={changeCourse}>
          Change course
        </button>
      </ShellCard>
    );
  }

  return (
    <StudyApp
      tracks={tracks}
      trackKeys={trackKeys}
      courseName={course.name}
      onChangeCourse={changeCourse}
      onSettings={() => setView("settings")}
    />
  );
}
