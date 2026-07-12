/* Ephemeral study loop — MCQ drill, flashcards, and mock exam.
   All state lives client-side; nothing is persisted, so anonymous share-link
   visitors and signed-in owners run the identical code. Data is read from the
   <script id="study-data"> JSON embedded by the study template. */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function study() {
  return {
    data: { name: "", exams: [] },
    examIdx: 0,
    deck: null, // topic name | "ALL" | null (home)
    mode: "mcq", // "mcq" | "flash" | "exam"
    order: [], // question ids for the active session
    optOrders: {}, // id -> shuffled ["A".."D"]
    byId: {},
    pos: 0,
    wrong: [],
    solved: false,
    flipped: false,
    hits: 0,
    tries: 0,
    examAnswers: {},
    finished: false,

    init() {
      const el = document.getElementById("study-data");
      if (el) this.data = JSON.parse(el.textContent);
    },

    // ── derived ──────────────────────────────────────────────
    get exam() {
      return this.data.exams[this.examIdx] || null;
    },
    get topics() {
      return this.exam ? this.exam.topics : [];
    },
    get questions() {
      const qs = [];
      for (const t of this.topics) for (const q of t.questions) qs.push({ ...q, cat: t.name });
      return qs;
    },
    get counts() {
      const c = {};
      for (const q of this.questions) c[q.cat] = (c[q.cat] || 0) + 1;
      return c;
    },
    colorFor(cat) {
      const t = this.topics.find((x) => x.name === cat);
      return t ? t.color : "#f2f5fa";
    },
    get q() {
      return this.byId[this.order[this.pos]] || null;
    },
    get optOrder() {
      return this.q ? this.optOrders[this.q.id] || ["A", "B", "C", "D"] : [];
    },
    get deckLabel() {
      if (this.deck === "ALL") return "All questions";
      return this.deck || "";
    },
    get deckColor() {
      if (this.deck === "ALL") return "#f2f5fa";
      return this.colorFor(this.deck);
    },

    // ── navigation ───────────────────────────────────────────
    setExam(i) {
      this.examIdx = i;
      this.deck = null;
      this.finished = false;
    },
    setMode(m) {
      this.mode = m;
    },
    home() {
      this.deck = null;
      this.finished = false;
    },
    startDeck(d) {
      const qs = d === "ALL" ? this.questions : this.questions.filter((q) => q.cat === d);
      let ids = shuffle(qs.map((q) => q.id));
      if (this.mode === "exam") ids = ids.slice(0, this.exam.examSize);
      this.byId = Object.fromEntries(this.questions.map((q) => [q.id, q]));
      const oo = {};
      for (const id of ids) oo[id] = shuffle(["A", "B", "C", "D"]);
      this.optOrders = oo;
      this.deck = d;
      this.order = ids;
      this.pos = 0;
      this.wrong = [];
      this.solved = false;
      this.flipped = false;
      this.hits = 0;
      this.tries = 0;
      this.examAnswers = {};
      this.finished = false;
    },

    // ── MCQ ──────────────────────────────────────────────────
    choose(letter) {
      if (this.solved || this.wrong.includes(letter)) return;
      this.tries++;
      if (letter === this.q.correct) {
        this.hits++;
        this.solved = true;
      } else {
        this.wrong.push(letter);
      }
    },
    optionClass(letter) {
      if (this.solved && letter === this.q.correct) return "correct";
      if (this.wrong.includes(letter)) return "wrong";
      return "";
    },
    next() {
      this.wrong = [];
      this.solved = false;
      this.flipped = false;
      this.pos = (this.pos + 1) % this.order.length;
    },

    // ── Flashcards ───────────────────────────────────────────
    grade(gotIt) {
      this.tries++;
      if (gotIt) this.hits++;
      this.flipped = false;
      this.pos = (this.pos + 1) % this.order.length;
    },

    // ── Mock exam ────────────────────────────────────────────
    examChoose(letter) {
      if (this.q) this.examAnswers[this.q.id] = letter;
    },
    examPrev() {
      this.pos = Math.max(0, this.pos - 1);
    },
    examGoNext() {
      this.pos = Math.min(this.order.length - 1, this.pos + 1);
    },
    get answeredCount() {
      return this.order.filter((id) => this.examAnswers[id]).length;
    },
    examSubmit() {
      const unanswered = this.order.length - this.answeredCount;
      if (
        unanswered > 0 &&
        !confirm(unanswered + " question(s) not answered. Submit anyway?")
      )
        return;
      this.finished = true;
    },
    get examResult() {
      let score = 0;
      const byCat = {};
      const review = [];
      for (const id of this.order) {
        const qq = this.byId[id];
        if (!qq) continue;
        const picked = this.examAnswers[id];
        const ok = picked === qq.correct;
        if (ok) score++;
        if (!byCat[qq.cat]) byCat[qq.cat] = { correct: 0, total: 0 };
        byCat[qq.cat].total++;
        if (ok) byCat[qq.cat].correct++;
        if (!ok) review.push({ q: qq, picked: picked || "—" });
      }
      const total = this.order.length;
      const passNeeded = Math.max(1, Math.round((this.exam.passMarkPct / 100) * total));
      const cats = Object.entries(byCat).map(([cat, v]) => ({
        cat,
        correct: v.correct,
        total: v.total,
        pct: Math.round((100 * v.correct) / v.total),
      }));
      return { score, total, passNeeded, passed: score >= passNeeded, cats, review };
    },
  };
}
