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

  const card = `rounded-3xl border p-6 shadow-xl ${L ? "bg-white border-[#4D55CC]/15" : "bg-[#17123D] border-[#B5A8D5]/15"}`;
  const chip = `rounded-2xl border p-4 ${L ? "bg-[#EFEDFA] border-[#4D55CC]/15" : "bg-[#21184D] border-[#B5A8D5]/15"}`;
  const muted = L ? "text-[#4A4370]" : "text-[#B5A8D5]";
  const gradText = "bg-[linear-gradient(135deg,#211684_0%,#4D55CC_50%,#7A73D1_100%)] bg-clip-text text-transparent";
  const btnMain =
    "min-h-[52px] rounded-2xl bg-[linear-gradient(135deg,#211684_0%,#4D55CC_50%,#7A73D1_100%)] text-[15px] font-semibold text-white shadow-[0_8px_24px_-4px_rgba(77,85,204,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-4px_rgba(77,85,204,0.55)] active:translate-y-0";

  return (
    <div className={`relative min-h-screen overflow-x-hidden transition-colors duration-300 ${L ? "bg-[#F8F7FF] text-[#211684]" : "bg-[#100B2E] text-[#F7F5FF]"}`}>
      <div
        className="pointer-events-none fixed inset-0 z-0 blur-[60px]"
        style={{ backgroundImage: "radial-gradient(circle at 15% 10%, rgba(122,115,209,0.28), transparent 40%), radial-gradient(circle at 85% 85%, rgba(33,22,132,0.25), transparent 40%)" }}
      />

      <nav className={`sticky top-0 z-[5] flex items-center justify-between border-b px-6 py-4 ${L ? "bg-[#F8F7FF] border-[#4D55CC]/15" : "bg-[#100B2E] border-[#B5A8D5]/15"}`}>
        <div className="flex items-center gap-3 font-bold text-[17px] justify-center">
          <Image src="/images/logo.png" alt="app logo" width={22} height={22} />
          <span>Secret Word</span>
        </div>
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className={`flex h-10 w-10 items-center justify-center rounded-full border transition-transform duration-200 hover:rotate-[20deg] ${L ? "bg-[#EFEDFA] border-[#4D55CC]/15" : "bg-[#21184D] border-[#B5A8D5]/15"}`}
        >
          <Image src={L ? "/images/moon-icon.png" : "/images/sun-icon.png"} alt="theme toggle icon" width={18} height={18} />
        </button>
      </nav>

      <main className="relative z-[1] mx-auto max-w-[460px] px-5 pb-16 pt-8 md:max-w-[500px]">
        {page === "welcome" && (
          <section className={`${card} text-center`}>
            <Image src="/images/crystal-ball-icon.png" alt="crystal ball icon" width={76} height={76} className="mx-auto mb-5" />
            <h1 className={`mb-3 text-[30px] font-extrabold leading-tight md:text-[34px] ${gradText}`}>Secret Word</h1>
            <p className={`mb-6 text-sm leading-relaxed ${muted}`}>Think you can crack it? Guess the mystery word using sneaky clues!</p>
            <div className="mb-6 flex gap-3">
              <div className={`${chip} flex flex-1 flex-col items-center gap-1`}>
                <span className="text-xl font-bold">{progress.best}</span>
                <small className={muted}>High Score</small>
              </div>
              <div className={`${chip} flex flex-1 flex-col items-center gap-1`}>
                <span className="text-xl font-bold">{progress.done.length}/{WORD_BANK.length}</span>
                <small className={muted}>Levels Beaten</small>
              </div>
            </div>
            <button onClick={goToLevels} className={`w-full py-4 ${btnMain}`}>Let&apos;s Play!</button>
          </section>
        )}

        {page === "levels" && (
          <section className={card}>
            <div className="mb-5 flex items-center justify-between">
              <button
                onClick={goHome}
                className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-transform duration-200 hover:-translate-x-0.5 ${L ? "bg-[#EFEDFA] border-[#4D55CC]/15" : "bg-[#21184D] border-[#B5A8D5]/15"}`}
              >
                <Image src="/images/back-arrow.svg" alt="back arrow icon" width={16} height={16} />
              </button>
              <h2 className="text-[19px] font-bold">Pick Your Challenge</h2>
              <span className="w-10" />
            </div>
            <div className="flex flex-col gap-3">
              {WORD_BANK.map((level, index) => {
                const unlocked = index < progress.unlocked;
                const done = progress.done.includes(index);
                return (
                  <div
                    key={level.name}
                    onClick={() => unlocked && startLevel(index)}
                    className={`flex items-center gap-4 rounded-2xl border p-4 transition-all duration-200 ${L ? "bg-[#EFEDFA] border-[#4D55CC]/15" : "bg-[#21184D] border-[#B5A8D5]/15"} ${!unlocked ? "cursor-not-allowed opacity-45" : "cursor-pointer hover:translate-x-1 hover:shadow-md"} ${done ? "border-[#4D55CC]" : ""}`}
                  >
                    <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl font-extrabold text-[17px] text-white ${unlocked ? "bg-[linear-gradient(135deg,#211684_0%,#4D55CC_50%,#7A73D1_100%)]" : L ? "bg-white" : "bg-[#17123D]"}`}>
                      {unlocked ? index + 1 : <Image src="/images/lock-icon.png" alt="locked level icon" width={18} height={18} />}
                    </div>
                    <div className="flex-1 text-left">
                      <strong className="block text-[15px]">{level.name}</strong>
                      <span className={`text-xs ${muted}`}>5 words</span>
                    </div>
                    <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${done ? "bg-[#4D55CC]/15 text-[#4D55CC]" : unlocked ? "bg-[#7A73D1]/15 text-[#7A73D1]" : `bg-[#B5A8D5]/15 ${muted}`}`}>
                      {done ? "Beaten" : unlocked ? "Play" : "Locked"}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {page === "game" && currentWord && (
          <section className={card}>
            <div className="mb-5 flex items-center justify-between">
              <button
                onClick={goToLevels}
                className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-transform duration-200 hover:-translate-x-0.5 ${L ? "bg-[#EFEDFA] border-[#4D55CC]/15" : "bg-[#21184D] border-[#B5A8D5]/15"}`}
              >
                <Image src="/images/back-arrow.svg" alt="back arrow icon" width={16} height={16} />
              </button>
              <h2 className="text-[19px] font-bold">Level {currentLevel + 1}: {WORD_BANK[currentLevel].name}</h2>
              <div className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${L ? "bg-[#EFEDFA] border-[#4D55CC]/15" : "bg-[#21184D] border-[#B5A8D5]/15"}`}>
                <Image src="/images/star-icon.png" alt="star score icon" width={16} height={16} />
                <span>{score}</span>
              </div>
            </div>

            <div className={`mb-2 flex justify-between text-xs ${muted}`}>
              <span>Word {round + 1} of {ROUNDS}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className={`mb-5 h-2 overflow-hidden rounded-full ${L ? "bg-[#EFEDFA]" : "bg-[#21184D]"}`}>
              <div className="h-full rounded-full bg-[linear-gradient(90deg,#211684_0%,#7A73D1_100%)] transition-[width] duration-300" style={{ width: `${progressPercent}%` }} />
            </div>

            <div className={`mb-5 flex items-center gap-3 text-[13px] ${muted}`}>
              <span>Tries Left</span>
              <div className="flex gap-2">
                {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
                  <div key={i} className={`h-3 w-3 rounded-full ${i >= attempts ? `border ${L ? "bg-[#EFEDFA] border-[#4D55CC]/15" : "bg-[#21184D] border-[#B5A8D5]/15"}` : "bg-[linear-gradient(90deg,#211684_0%,#7A73D1_100%)]"}`} />
                ))}
              </div>
            </div>

            <div className={`mb-6 rounded-2xl border-l-4 border-[#7A73D1] p-4 ${L ? "bg-[#EFEDFA]" : "bg-[#21184D]"}`}>
              <div className="flex items-start gap-3 text-sm">
                <Image src="/images/lightbulb-icon.png" alt="lightbulb hint icon" width={20} height={20} className="mt-0.5 flex-shrink-0" />
                <span>{currentWord.hint1}</span>
              </div>
              {showHint2 && (
                <div className={`mt-3 flex items-start gap-3 border-t border-dashed pt-3 text-sm ${L ? "border-[#4D55CC]/15" : "border-[#B5A8D5]/15"}`}>
                  <Image src="/images/lightbulb-icon.png" alt="lightbulb hint icon" width={20} height={20} className="mt-0.5 flex-shrink-0" />
                  <span>{currentWord.hint2}</span>
                </div>
              )}
            </div>

            <div className="mb-6 flex flex-wrap justify-center gap-2">
              {currentWord.word.split("").map((_, i) => (
                <div key={i} className="flex h-10 w-8 items-center justify-center border-b-[3px] border-[#7A73D1] text-lg font-bold md:h-11 md:w-9 md:text-xl" />
              ))}
            </div>

            <form onSubmit={handleGuess} className="mb-3 flex gap-3">
              <input
                type="text"
                placeholder="Take a guess..."
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                maxLength={20}
                autoComplete="off"
                className={`min-h-[52px] flex-1 rounded-2xl border-[1.5px] px-4 text-[15px] transition-shadow duration-200 focus:border-[#7A73D1] focus:outline-none focus:ring-[3px] focus:ring-[#7A73D1]/15 ${L ? "bg-[#EFEDFA] border-[#4D55CC]/15 text-[#211684]" : "bg-[#21184D] border-[#B5A8D5]/15 text-[#F7F5FF]"}`}
              />
              <button type="submit" className={`px-6 ${btnMain}`}>Guess!</button>
            </form>

            <p className={`min-h-[18px] text-center text-[13px] font-semibold ${feedbackType === "success" ? "text-[#4D55CC]" : feedbackType === "error" ? "text-[#DC2626]" : ""}`}>{feedback}</p>
          </section>
        )}

        {page === "correct" && currentWord && (
          <section className={`${card} text-center`}>
            <Image src="/images/success-check-icon.png" alt="green success checkmark icon" width={80} height={80} className="mx-auto mb-5" />
            <h2 className="text-[19px] font-bold text-[#4D55CC]">Boom! Got It!</h2>
            <p className={`mb-6 mt-2 text-sm leading-relaxed ${muted}`}>The word was <strong>{currentWord.word}</strong></p>
            <div className={`mb-6 text-[22px] font-extrabold ${gradText}`}>+10 points</div>
            <button onClick={nextRound} className={`w-full py-4 ${btnMain}`}>Next Word</button>
          </section>
        )}

        {page === "wrong" && currentWord && (
          <section className={`${card} text-center`}>
            <Image src="/images/error-cross-icon.png" alt="red error cross icon" width={80} height={80} className="mx-auto mb-5" />
            <h2 className="text-[19px] font-bold text-[#DC2626]">So Close!</h2>
            <p className={`mb-6 mt-2 text-sm leading-relaxed ${muted}`}>The word was <strong>{currentWord.word}</strong></p>
            <button onClick={nextRound} className={`w-full py-4 ${btnMain}`}>Next Word</button>
          </section>
        )}

        {page === "complete" && (
          <section className={`${card} text-center`}>
            <Image src="/images/trophy-icon.png" alt="gold trophy icon" width={80} height={80} className="mx-auto mb-5" />
            <h2 className="text-[19px] font-bold">Level Crushed!</h2>
            <div className="mb-6 mt-5 flex gap-3">
              <div className={`${chip} flex flex-1 flex-col items-center gap-1`}>
                <span className="text-xl font-bold">{score}</span>
                <small className={muted}>Score</small>
              </div>
              <div className={`${chip} flex flex-1 flex-col items-center gap-1`}>
                <span className="text-xl font-bold">{correct}/{ROUNDS}</span>
                <small className={muted}>Correct</small>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button onClick={() => startLevel(currentLevel)} className={`min-h-[52px] flex-1 rounded-2xl border py-4 text-[15px] font-semibold transition-colors duration-200 hover:-translate-y-0.5 ${L ? "bg-[#EFEDFA] border-[#4D55CC]/15 text-[#211684]" : "bg-[#21184D] border-[#B5A8D5]/15 text-[#F7F5FF]"}`}>Play Again</button>
              <button onClick={goToLevels} className={`flex-1 py-4 ${btnMain}`}>More Levels</button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}