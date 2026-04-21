import { useMemo, useState } from "react";

const moodOptions = [
  { id: "good", label: "Good", emoji: "🙂", card: "bg-[#fff7e7]", accent: "text-[#c28a1d]" },
  { id: "okay", label: "Okay", emoji: "😕", card: "bg-[#fff0f4]", accent: "text-[#c06b83]" },
  { id: "bad", label: "Bad", emoji: "🥲", card: "bg-[#eef4ff]", accent: "text-[#6a8fc9]" },
  { id: "great", label: "Great", emoji: "😍", card: "bg-[#f7f7df]", accent: "text-[#a5a534]" },
];

const now = new Date();
const currentMonth = now.getMonth();
const currentYear = now.getFullYear();

const initialEntries = {
  [`${currentYear}-${currentMonth + 1}-5`]: {
    mood: "good",
    note: "Felt more focused than usual and finished a few things.",
  },
  [`${currentYear}-${currentMonth + 1}-12`]: {
    mood: "great",
    note: "Went for a walk, had coffee and felt super relaxed. Productive day overall!",
  },
  [`${currentYear}-${currentMonth + 1}-${now.getDate()}`]: {
    mood: "great",
    note: "Today felt clean and productive. Worked on Averra and actually enjoyed the process.",
  },
};

function getMonthName(month, year) {
  return new Date(year, month, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function getDateKey(year, month, day) {
  return `${year}-${month + 1}-${day}`;
}

function buildCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const cells = [];

  for (let i = startOffset - 1; i >= 0; i -= 1) {
    cells.push({ day: daysInPrevMonth - i, current: false, type: "prev" });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ day, current: true, type: "current" });
  }

  const remainder = cells.length % 7;
  const nextDays = remainder === 0 ? 0 : 7 - remainder;

  for (let day = 1; day <= nextDays; day += 1) {
    cells.push({ day, current: false, type: "next" });
  }

  return cells;
}

function getMoodById(id) {
  return moodOptions.find((item) => item.id === id) || moodOptions[0];
}

export default function AverraMood() {
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [entries, setEntries] = useState(initialEntries);
  const [selectedMood, setSelectedMood] = useState("good");
  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const [note, setNote] = useState(
    initialEntries[getDateKey(currentYear, currentMonth, now.getDate())]?.note || ""
  );
  const [editorOpen, setEditorOpen] = useState(false);

  const calendar = useMemo(() => buildCalendar(year, month), [year, month]);

  const stats = useMemo(() => {
    return moodOptions.map((mood) => ({
      ...mood,
      total: Object.values(entries).filter((entry) => entry.mood === mood.id).length,
    }));
  }, [entries]);

  const selectedKey = getDateKey(year, month, selectedDay);
  const selectedEntry = entries[selectedKey];
  const selectedMoodInfo = selectedEntry ? getMoodById(selectedEntry.mood) : null;

  function openEditor(day) {
    const key = getDateKey(year, month, day);
    const entry = entries[key];

    setSelectedDay(day);
    setSelectedMood(entry?.mood || "good");
    setNote(entry?.note || "");
    setEditorOpen(true);
  }

  function closeEditor() {
    setEditorOpen(false);
  }

  function saveEntry() {
    const key = getDateKey(year, month, selectedDay);

    setEntries((prev) => ({
      ...prev,
      [key]: {
        mood: selectedMood,
        note: note.trim() || "No note for this day yet.",
      },
    }));

    setEditorOpen(false);
  }

  function changeMonth(direction) {
    if (direction === -1) {
      if (month === 0) {
        setMonth(11);
        setYear((prev) => prev - 1);
      } else {
        setMonth((prev) => prev - 1);
      }
    }

    if (direction === 1) {
      if (month === 11) {
        setMonth(0);
        setYear((prev) => prev + 1);
      } else {
        setMonth((prev) => prev + 1);
      }
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#ece8ff_0%,#f6f4ff_38%,#ffffff_100%)] p-6 text-slate-900">
      <div className="mx-auto grid max-w-7xl gap-6 rounded-[34px] border border-white/70 bg-white/40 p-4 shadow-[0_30px_80px_rgba(138,123,255,0.14)] backdrop-blur-xl lg:grid-cols-[320px_1fr]">
        <aside className="rounded-[28px] border border-white/60 bg-white/45 p-6 shadow-[0_20px_50px_rgba(140,120,255,0.08)] backdrop-blur-xl">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ffd36a] text-3xl shadow-inner">
              🙂
            </div>
            <div>
              <h1 className="text-[22px] font-semibold tracking-tight">Averra Mood</h1>
              <p className="text-sm text-slate-500">track your mood and daily notes</p>
            </div>
          </div>

          <div className="mb-5">
            <h2 className="mb-4 text-[18px] font-semibold tracking-tight text-slate-700">Mood Stats</h2>
            <div className="space-y-3">
              {stats.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between rounded-[22px] border border-white/70 ${item.card} px-4 py-4 shadow-sm`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-4xl leading-none">{item.emoji}</div>
                    <div>
                      <p className="text-[15px] font-semibold text-slate-700">{item.label}</p>
                      <p className="text-sm text-slate-500">days</p>
                    </div>
                  </div>
                  <span className={`text-3xl font-semibold ${item.accent}`}>{item.total}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => openEditor(now.getDate())}
            className="mb-8 flex w-full items-center justify-center gap-3 rounded-[18px] bg-gradient-to-r from-[#7f66ff] to-[#d6b7ff] px-4 py-4 text-lg font-semibold text-white shadow-[0_18px_35px_rgba(137,107,255,0.24)] transition active:scale-[0.98]"
          >
            <span className="text-xl">＋</span>
            Record Mood
          </button>

          <div className="mt-auto rounded-[26px] bg-white/45 p-3">
            <div className="mb-3 flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80"
                alt="averout"
                className="h-14 w-14 rounded-full object-cover ring-4 ring-[#d8d0ff]"
              />
              <div>
                <p className="text-[16px] font-semibold">averout</p>
                <p className="text-sm text-slate-500">@clqbs</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a className="flex h-11 w-11 items-center justify-center rounded-full bg-[#47a9ea] text-white" href="#" aria-label="Telegram">
                ✈️
              </a>
              <a className="flex h-11 w-11 items-center justify-center rounded-full bg-[#7f6cff] text-white" href="#" aria-label="Discord">
                💬
              </a>
              <a className="flex h-11 w-11 items-center justify-center rounded-full bg-[#8f72ff] text-white" href="#" aria-label="Brand">
                ◡̈
              </a>
            </div>
          </div>
        </aside>

        <main className="rounded-[28px] border border-white/60 bg-white/35 p-6 shadow-[0_20px_50px_rgba(140,120,255,0.08)] backdrop-blur-xl">
          <div className="grid gap-0 overflow-hidden rounded-[30px] border border-white/50 bg-white/20 xl:grid-cols-[300px_1fr]">
            <section className="border-b border-white/40 p-6 xl:border-b-0 xl:border-r">
              <h2 className="mb-5 text-[18px] font-semibold tracking-tight text-slate-700">Mood Stats</h2>
              <div className="space-y-4">
                {stats.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between rounded-[20px] border border-white/70 ${item.card} px-4 py-4 shadow-sm`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-4xl leading-none">{item.emoji}</div>
                      <div>
                        <p className="text-[16px] font-semibold text-slate-700">{item.label}</p>
                        <p className="text-sm text-slate-500">days</p>
                      </div>
                    </div>
                    <span className="text-4xl font-semibold tracking-tight text-slate-600">{item.total}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => changeMonth(-1)}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/70 bg-white/70 text-[#7f73ba] shadow-sm"
                    aria-label="Previous month"
                  >
                    ←
                  </button>
                  <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/70 bg-white/70 opacity-0">
                    x
                  </button>
                </div>

                <h2 className="text-[22px] font-semibold tracking-tight text-slate-700">{getMonthName(month, year)}</h2>

                <div className="flex items-center gap-3">
                  <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/70 bg-white/70 opacity-0">
                    x
                  </button>
                  <button
                    onClick={() => changeMonth(1)}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/70 bg-white/70 text-[#7f73ba] shadow-sm"
                    aria-label="Next month"
                  >
                    →
                  </button>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-7 gap-2 px-1 text-center text-sm font-medium uppercase tracking-wide text-[#9d97c8]">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendar.map((cell, index) => {
                  let displayMonth = month;
                  let displayYear = year;

                  if (cell.type === "prev") {
                    displayMonth = month === 0 ? 11 : month - 1;
                    displayYear = month === 0 ? year - 1 : year;
                  }

                  if (cell.type === "next") {
                    displayMonth = month === 11 ? 0 : month + 1;
                    displayYear = month === 11 ? year + 1 : year;
                  }

                  const key = getDateKey(displayYear, displayMonth, cell.day);
                  const entry = entries[key];
                  const mood = moodOptions.find((item) => item.id === entry?.mood);
                  const isToday = key === getDateKey(currentYear, currentMonth, now.getDate());

                  return (
                    <button
                      key={`${cell.day}-${index}`}
                      onClick={() => cell.current && openEditor(cell.day)}
                      className={`relative flex min-h-[82px] flex-col rounded-[18px] border border-white/60 px-3 py-3 text-left shadow-sm transition ${
                        cell.current ? "bg-white/65 hover:translate-y-[-1px]" : "bg-white/30 text-slate-300"
                      } ${isToday ? "ring-2 ring-[#d8cfff]" : ""}`}
                    >
                      <span className={`text-[15px] ${cell.current ? "text-slate-600" : "text-slate-300"}`}>{cell.day}</span>
                      {mood && cell.current ? <span className="mt-auto text-3xl leading-none">{mood.emoji}</span> : null}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 rounded-[28px] border border-white/60 bg-white/45 p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-[18px] font-semibold tracking-tight text-slate-700">Today's entry</h3>
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full bg-white/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#a89ef5]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#a89ef5]" />
                  </div>
                </div>

                <div className="rounded-[22px] border border-white/60 bg-white/80 p-5 shadow-inner">
                  <p className="mb-4 text-[15px] font-semibold text-slate-700">
                    Mood: {selectedEntry ? `${selectedMoodInfo.label} ${selectedMoodInfo.emoji}` : "No mood yet"}
                  </p>
                  <p className="max-w-2xl text-[16px] leading-8 text-slate-600">
                    {selectedEntry?.note || "Pick a day on the calendar and save a mood entry."}
                  </p>

                  <div className="mt-5 flex justify-end">
                    <button
                      onClick={() => openEditor(selectedDay)}
                      className="flex items-center gap-2 rounded-[16px] border border-[#ddd7ff] bg-white px-5 py-3 text-[15px] font-medium text-slate-700 shadow-sm"
                    >
                      ✎
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      {editorOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-[0_24px_60px_rgba(120,100,255,0.2)] backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold tracking-tight">Record Mood</h3>
                <p className="text-sm text-slate-500">Day {selectedDay} • {getMonthName(month, year)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={closeEditor}
                  className="rounded-[16px] border border-[#ddd7ff] bg-white px-4 py-3 font-medium text-slate-700"
                >
                  Close
                </button>
                <button
                  onClick={saveEntry}
                  className="rounded-[16px] bg-gradient-to-r from-[#7f66ff] to-[#d6b7ff] px-5 py-3 font-medium text-white shadow-[0_16px_30px_rgba(137,107,255,0.2)]"
                >
                  Save entry
                </button>
              </div>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {moodOptions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedMood(item.id)}
                  className={`flex items-center gap-3 rounded-[20px] border px-4 py-4 text-left transition ${
                    selectedMood === item.id
                      ? "border-[#b7a8ff] bg-white shadow-md"
                      : "border-white/70 bg-white/60"
                  }`}
                >
                  <span className="text-4xl">{item.emoji}</span>
                  <div>
                    <p className="font-semibold text-slate-700">{item.label}</p>
                    <p className="text-sm text-slate-500">track this feeling</p>
                  </div>
                </button>
              ))}
            </div>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write a short note about your day..."
              rows={5}
              className="w-full resize-none rounded-[22px] border border-white/70 bg-white/70 px-4 py-4 text-[15px] leading-7 outline-none focus:ring-2 focus:ring-[#d3c7ff]"
            />
          </div>
        </div>
      )}
    </div>
  );
}

console.assert(getDateKey(2025, 0, 5) === "2025-1-5", "getDateKey should build a simple date key");
console.assert(buildCalendar(2025, 3).length % 7 === 0, "Calendar should always fill complete weeks");
console.assert(getMoodById("good").label === "Good", "Known mood ids should resolve correctly");
console.assert(getMoodById("missing").label === "Good", "Unknown mood ids should fall back to the first mood option");
