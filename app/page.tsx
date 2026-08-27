"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Word = { word: string; hint1: string; hint2: string };
type Level = { name: string; words: Word[] };
type Progress = { unlocked: number; best: number; done: number[] };

const w = (word: string, hint1: string, hint2: string): Word => ({ word, hint1, hint2 });

const WORD_BANK: Level[] = [
  {
    name: "Beginner",
    words: [
      w("TIGER", "A wild animal.", "Big cat with orange stripes."),
      w("OCEAN", "A huge body of water.", "Contains salt water, not fresh."),
      w("GUITAR", "A musical instrument.", "You strum its strings."),
      w("PLANET", "Found in space.", "Earth is one of these."),
      w("BANANA", "A yellow fruit.", "Monkeys love eating it."),
      w("CAMERA", "An electronic device.", "Used to take pictures."),
      w("BICYCLE", "A mode of transport.", "Has two wheels and pedals."),
      w("RAINBOW", "Appears in the sky.", "Colorful arc after rain."),
      w("MOUNTAIN", "A landform.", "Very tall and rocky."),
      w("CANDLE", "Gives light.", "Made of wax with a wick."),
      w("SPIDER", "A small creature.", "Has eight legs and spins webs."),
      w("UMBRELLA", "Used outdoors.", "Protects you from rain."),
      w("BLANKET", "Found in bedrooms.", "Keeps you warm at night."),
      w("WHISTLE", "Makes a sound.", "Blown by referees."),
    ],
  },
  {
    name: "Easy",
    words: [
      w("VOLCANO", "A landform.", "Can erupt with lava."),
      w("PENGUIN", "A bird.", "Cannot fly, lives in cold places."),
      w("GALAXY", "Found in the universe.", "A huge group of stars."),
      w("PYRAMID", "An ancient structure.", "Found in Egypt, triangle shaped."),
      w("COMPASS", "A small tool.", "Shows direction using magnetism."),
      w("DESERT", "A type of land.", "Very dry and sandy."),
      w("FESTIVAL", "A celebration.", "Often includes music and food."),
      w("GLACIER", "Found in cold regions.", "A slow-moving mass of ice."),
      w("CANYON", "A geography term.", "A deep valley with steep sides."),
      w("OASIS", "Found in deserts.", "A fertile spot with water."),
      w("PLATEAU", "A landform.", "A flat elevated area of land."),
    ],
  },
  {
    name: "Medium",
    words: [
      w("SYMPHONY", "Related to music.", "A long piece played by an orchestra."),
      w("LABYRINTH", "A tricky place.", "A complex maze of paths."),
      w("TELESCOPE", "A scientific device.", "Used to view distant stars."),
      w("AVALANCHE", "A natural disaster.", "A mass of snow sliding down a mountain."),
      w("CHAMELEON", "An animal.", "A lizard that changes color."),
      w("ECLIPSE", "A space event.", "When one object blocks another's light."),
      w("CATALYST", "A science term.", "Speeds up a chemical reaction."),
      w("PARADIGM", "An abstract concept.", "A typical example or pattern."),
      w("MOMENTUM", "A physics term.", "Mass in motion, hard to stop."),
      w("ANOMALY", "Something unusual.", "A deviation from the norm."),
      w("THRESHOLD", "A limit or boundary.", "The point something begins to happen."),
    ],
  },
  {
    name: "Expert",
    words: [
      w("PHILOSOPHY", "An academic subject.", "Study of knowledge and existence."),
      w("QUARANTINE", "A health-related term.", "Isolation to stop disease spreading."),
      w("SILHOUETTE", "A visual term.", "A dark outline against light."),
      w("METAMORPHOSIS", "A biology term.", "Transformation, like caterpillar to butterfly."),
      w("SERENDIPITY", "A pleasant experience.", "Finding something good by chance."),
      w("RENAISSANCE", "A historical period.", "A revival of art and culture in Europe."),
      w("ONOMATOPOEIA", "A language term.", "Words that imitate sounds, like buzz."),
      w("JUXTAPOSITION", "A literary technique.", "Placing two contrasting things together."),
      w("IDIOSYNCRASY", "A personal trait.", "A peculiar habit unique to someone."),
      w("PROCRASTINATE", "A common habit.", "Delaying tasks that should be done now."),
      w("CONSCIENTIOUS", "A personality trait.", "Careful and thorough in one's duties."),
    ],
  },
];

const MAX_ATTEMPTS = 3;
const ROUNDS = 5;
const SAVE_KEY = "secretWordProgress";
const THEME_KEY = "secretWordTheme";

export default function Home() {
  const [page, setPage] = useState<"welcome" | "levels" | "game" | "correct" | "wrong" | "complete">("welcome");
  const [progress, setProgress] = useState<Progress>({ unlocked: 1, best: 0, done: [] });
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [currentLevel, setCurrentLevel] = useState(0);
  const [round, setRound] = useState(0);
  const [wordList, setWordList] = useState<Word[]>([]);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [attempts, setAttempts] = useState(MAX_ATTEMPTS);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [guess, setGuess] = useState("");
  const [tried, setTried] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | "">("");
  const [showHint2, setShowHint2] = useState(false);

  useEffect(() => {
    const savedProgress = localStorage.getItem(SAVE_KEY);
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedProgress) {
      try {
        setProgress(JSON.parse(savedProgress));
      } catch {}
    }
    if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (wordList.length > 0) setCurrentWord(wordList[round]);
  }, [wordList, round]);

  function shuffle(array: Word[]) {
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function startLevel(levelIndex: number) {
    setCurrentLevel(levelIndex);
    setRound(0);
    setScore(0);
    setCorrect(0);
    setWordList(shuffle(WORD_BANK[levelIndex].words).slice(0, ROUNDS));
    setPage("game");
    resetRound();
  }

  function resetRound() {
    setAttempts(MAX_ATTEMPTS);
    setGuess("");
    setTried([]);
    setFeedback("");
    setFeedbackType("");
    setShowHint2(false);
  }

  function handleGuess(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!currentWord) return;
    const userGuess = guess.trim().toUpperCase();
    if (!userGuess) return;
    if (tried.includes(userGuess)) {
      setFeedback("Already tried that one!");
      setFeedbackType("error");
      setGuess("");
      return;
    }
    setTried((prev) => [...prev, userGuess]);
    userGuess === currentWord.word ? handleCorrect() : handleWrong();
  }

  function handleCorrect() {
    setScore((prev) => prev + 10);
    setCorrect((prev) => prev + 1);
    setFeedback("Nice one!");
    setFeedbackType("success");
    setTimeout(() => setPage("correct"), 700);
  }

  function handleWrong() {
    const newAttempts = attempts - 1;
    setAttempts(newAttempts);
    setGuess("");
    if (newAttempts === 2) {
      setShowHint2(true);
      setFeedback("Not quite! Here's a hint. 2 tries left.");
      setFeedbackType("error");
    } else if (newAttempts === 1) {
      setFeedback("Almost! 1 try left.");
      setFeedbackType("error");
    } else {
      setFeedback("Out of tries!");
      setFeedbackType("error");
      setTimeout(() => setPage("wrong"), 700);
    }
  }

  function nextRound() {
    const next = round + 1;
    if (next >= ROUNDS) return finishLevel();
    setRound(next);
    resetRound();
    setPage("game");
  }

  function finishLevel() {
    const newProgress = { ...progress };
    if (currentLevel === progress.unlocked - 1 && progress.unlocked < WORD_BANK.length) newProgress.unlocked += 1;
    if (!newProgress.done.includes(currentLevel)) newProgress.done = [...newProgress.done, currentLevel];
    if (score > newProgress.best) newProgress.best = score;
    setProgress(newProgress);
    setPage("complete");
  }

  const goToLevels = () => setPage("levels");
  const goHome = () => setPage("welcome");
  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));
  const progressPercent = Math.round((round / ROUNDS) * 100);
  const L = theme === "light";

  const cx = (...classes: (string | false | undefined)[]) => classes.filter(Boolean).join(" ");

  return (
    <div className={cx("page", L && "light")}>
      <div className="glow" />

      <nav className="navbar">
        <div className="nav-brand">
          <Image src="/images/logo.png" alt="app logo" width={40} height={40} />
          <span>Secret Word</span>
        </div>
        <button onClick={toggleTheme} aria-label="Toggle theme" className="theme-btn">
          <Image src={L ? "/images/moon-icon.png" : "/images/sun-icon.png"} alt="theme toggle icon" width={100} height={100} />
        </button>
      </nav>

      <main className="main">
        {page === "welcome" && (
          <section className="card center">
            <Image src="/images/logo.png" alt="crystal ball icon" width={76} height={76} style={{ display: "block", margin: "0 auto 20px" }} />
            <h1 className="heading grad-text">Secret Word</h1>
            <p className="text-muted muted">Think you can crack it? Guess the mystery word using sneaky clues!</p>
            <div className="stat-row">
              <div className="chip">
                <span className="stat-value">{progress.best}</span>
                <small className="muted">High Score</small>
              </div>
              <div className="chip">
                <span className="stat-value">{progress.done.length}/{WORD_BANK.length}</span>
                <small className="muted">Levels Beaten</small>
              </div>
            </div>
            <button onClick={goToLevels} className="btn-main" style={{ width: "100%", padding: "16px" }}>Let&apos;s Play!</button>
          </section>
        )}

        {page === "levels" && (
          <section className="card">
            <div className="top-row">
              <button onClick={goHome} className="icon-btn">
                <Image src="/images/back-arrow.svg" alt="back arrow icon" width={16} height={16} />
              </button>
              <h2 className="heading-sm">Pick Your Challenge</h2>
              <span className="hold" />
            </div>
            <div className="level-list">
              {WORD_BANK.map((level, index) => {
                const unlocked = index < progress.unlocked;
                const done = progress.done.includes(index);
                return (
                  <div
                    key={level.name}
                    onClick={() => unlocked && startLevel(index)}
                    className={cx("level-item", !unlocked && "locked", done && "done")}
                  >
                    <div className={cx("level-num", !unlocked && "locked-bg")}>
                      {unlocked ? index + 1 : <Image src="/images/lock-icon.png" alt="locked level icon" width={120} height={120} />}
                    </div>
                    <div className="level-info">
                      <strong>{level.name}</strong>
                      <span className="muted">5 words</span>
                    </div>
                    <span className={cx("tag", done ? "tag-done" : unlocked ? "tag-play" : "tag-locked", !done && !unlocked && "muted")}>
                      {done ? "Beaten" : unlocked ? "Play" : "Locked"}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {page === "game" && currentWord && (
          <section className="card">
            <div className="top-row">
              <button onClick={goToLevels} className="icon-btn">
                <Image src="/images/back-arrow.svg" alt="back arrow icon" width={16} height={16} />
              </button>
              <h2 className="heading-sm">Level {currentLevel + 1}: {WORD_BANK[currentLevel].name}</h2>
              <div className="score-box">
                <Image src="/images/star-icon.png" alt="star score icon" width={40} height={40} />
                <span>{score}</span>
              </div>
            </div>

            <div className="progress-info muted">
              <span>Word {round + 1} of {ROUNDS}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>

            <div className="attempts-row muted">
              <span>Tries Left</span>
              <div className="dots">
                {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
                  <div key={i} className={cx("dot", i >= attempts && "used")} />
                ))}
              </div>
            </div>

            <div className="hint-box">
              <div className="hint-line">
                <Image src="/images/lightbulb-icon.png" alt="lightbulb hint icon" width={50} height={50} style={{ marginTop: "2px", flexShrink: 0 }} />
                <span>{currentWord.hint1}</span>
              </div>
              {showHint2 && (
                <div className="hint-line">
                  <Image src="/images/lightbulb-icon.png" alt="lightbulb hint icon" width={50} height={50} style={{ marginTop: "2px", flexShrink: 0 }} />
                  <span>{currentWord.hint2}</span>
                </div>
              )}
            </div>

            <div className="word-display">
              {currentWord.word.split("").map((_, i) => (
                <div key={i} className="letter-box" />
              ))}
            </div>

            <form onSubmit={handleGuess} className="guess-form">
              <input
                type="text"
                placeholder="Take a guess..."
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                maxLength={20}
                autoComplete="off"
                className="guess-input"
              />
              <button type="submit" className="btn-main guess-btn">Guess!</button>
            </form>

            <p className={cx("feedback", feedbackType)}>{feedback}</p>
          </section>
        )}

        {page === "correct" && currentWord && (
          <section className="card center">
            <Image src="/images/success-check-icon.png" alt="green success checkmark icon" width={100} height={100} style={{ display: "block", margin: "0 auto 20px" }} />
            <h2 className="heading-sm" style={{ color: "var(--good)" }}>Boom! Got It!</h2>
            <p className="text-muted muted mt2">The word was <strong>{currentWord.word}</strong></p>
            <div className="points grad-text">+10 points</div>
            <button onClick={nextRound} className="btn-main" style={{ width: "100%", padding: "16px" }}>Next Word</button>
          </section>
        )}

        {page === "wrong" && currentWord && (
          <section className="card center">
            <Image src="/images/error-cross-icon.png" alt="red error cross icon" width={100} height={100} style={{ display: "block", margin: "0 auto 20px" }} />
            <h2 className="heading-sm" style={{ color: "var(--bad)" }}>So Close!</h2>
            <p className="text-muted muted mt2">The word was <strong>{currentWord.word}</strong></p>
            <button onClick={nextRound} className="btn-main" style={{ width: "100%", padding: "16px" }}>Next Word</button>
          </section>
        )}

        {page === "complete" && (
          <section className="card center">
            <Image src="/images/trophy-icon.png" alt="gold trophy icon" width={120} height={120} style={{ display: "block", margin: "0 auto 20px" }} />
            <h2 className="heading-sm">Level Crushed!</h2>
            <div className="stat-row mt5">
              <div className="chip">
                <span className="stat-value">{score}</span>
                <small className="muted">Score</small>
              </div>
              <div className="chip">
                <span className="stat-value">{correct}/{ROUNDS}</span>
                <small className="muted">Correct</small>
              </div>
            </div>
            <div className="btn-group">
              <button onClick={() => startLevel(currentLevel)} className="btn-alt">Play Again</button>
              <button onClick={goToLevels} className="btn-main" style={{ flex: 1, padding: "16px" }}>More Levels</button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}