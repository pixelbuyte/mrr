import { useEffect, useMemo, useState } from 'react';
import './App.css';

const storageKey = 'personal-daily-dashboard-state';

const defaultState = {
  name: 'Alex',
  mantra: 'Make today calm, focused, and useful.',
  priorities: [
    { id: 1, text: 'Plan the top three wins for today', done: false },
    { id: 2, text: 'Do one deep-work session before checking socials', done: false },
    { id: 3, text: 'Take a real break away from the screen', done: false },
  ],
  habits: [
    { id: 1, label: 'Hydrate', streak: 4, done: false },
    { id: 2, label: 'Move', streak: 2, done: false },
    { id: 3, label: 'Read', streak: 7, done: false },
    { id: 4, label: 'Reflect', streak: 3, done: false },
  ],
  focusMinutes: 25,
  mood: 'Energized',
  notes:
    'Quick notes, reminders, ideas, or anything you want to carry through the day.',
};

const moodOptions = ['Calm', 'Energized', 'Creative', 'Focused', 'Reflective'];
const quotes = [
  'The secret of getting ahead is getting started.',
  'Small steps every day become big changes.',
  'Do less, better.',
  'Attention is your most valuable daily budget.',
  'You do not need a perfect day to make progress.',
];

function readSavedState() {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
  } catch {
    return defaultState;
  }
}

function getGreeting(hour) {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(date) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

function App() {
  const [state, setState] = useState(readSavedState);
  const [newPriority, setNewPriority] = useState('');
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const completedPriorities = state.priorities.filter((item) => item.done).length;
  const completedHabits = state.habits.filter((habit) => habit.done).length;
  const totalItems = state.priorities.length + state.habits.length;
  const completedItems = completedPriorities + completedHabits;
  const progress = totalItems ? Math.round((completedItems / totalItems) * 100) : 0;
  const quote = useMemo(() => quotes[now.getDate() % quotes.length], [now]);

  function updateState(patch) {
    setState((current) => ({ ...current, ...patch }));
  }

  function togglePriority(id) {
    updateState({
      priorities: state.priorities.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item,
      ),
    });
  }

  function addPriority(event) {
    event.preventDefault();
    const text = newPriority.trim();
    if (!text) return;

    updateState({
      priorities: [
        ...state.priorities,
        { id: Date.now(), text, done: false },
      ],
    });
    setNewPriority('');
  }

  function removePriority(id) {
    updateState({
      priorities: state.priorities.filter((item) => item.id !== id),
    });
  }

  function toggleHabit(id) {
    updateState({
      habits: state.habits.map((habit) =>
        habit.id === id
          ? {
              ...habit,
              done: !habit.done,
              streak: habit.done ? Math.max(0, habit.streak - 1) : habit.streak + 1,
            }
          : habit,
      ),
    });
  }

  function resetDay() {
    updateState({
      priorities: state.priorities.map((item) => ({ ...item, done: false })),
      habits: state.habits.map((habit) => ({ ...habit, done: false })),
    });
  }

  return (
    <main className="app-shell">
      <section className="hero card">
        <div>
          <p className="eyebrow">{formatDate(now)}</p>
          <h1>
            {getGreeting(now.getHours())}, {state.name}
          </h1>
          <input
            className="name-input"
            aria-label="Your name"
            value={state.name}
            onChange={(event) => updateState({ name: event.target.value })}
          />
          <p className="mantra">{state.mantra}</p>
          <input
            className="mantra-input"
            aria-label="Daily mantra"
            value={state.mantra}
            onChange={(event) => updateState({ mantra: event.target.value })}
          />
        </div>
        <div className="clock-panel">
          <span>{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <p>{quote}</p>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat card">
          <span>{progress}%</span>
          <p>Daily momentum</p>
          <div className="meter" aria-label={`${progress}% complete`}>
            <div style={{ width: `${progress}%` }} />
          </div>
        </article>
        <article className="stat card">
          <span>{completedPriorities}/{state.priorities.length}</span>
          <p>Priority wins</p>
        </article>
        <article className="stat card">
          <span>{completedHabits}/{state.habits.length}</span>
          <p>Habits checked</p>
        </article>
        <article className="stat card">
          <span>{state.focusMinutes}</span>
          <p>Focus minutes</p>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="card priorities">
          <div className="section-title">
            <div>
              <p className="eyebrow">Top work</p>
              <h2>Today&apos;s priorities</h2>
            </div>
            <button type="button" className="ghost-button" onClick={resetDay}>
              Reset day
            </button>
          </div>

          <form className="add-row" onSubmit={addPriority}>
            <input
              aria-label="Add a priority"
              placeholder="Add a task or goal..."
              value={newPriority}
              onChange={(event) => setNewPriority(event.target.value)}
            />
            <button type="submit">Add</button>
          </form>

          <ul className="task-list">
            {state.priorities.map((item) => (
              <li key={item.id} className={item.done ? 'complete' : ''}>
                <button
                  type="button"
                  className="check"
                  aria-label={`Mark ${item.text} ${item.done ? 'incomplete' : 'complete'}`}
                  onClick={() => togglePriority(item.id)}
                >
                  {item.done ? '✓' : ''}
                </button>
                <span>{item.text}</span>
                <button
                  type="button"
                  className="delete-button"
                  aria-label={`Remove ${item.text}`}
                  onClick={() => removePriority(item.id)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </article>

        <article className="card focus-card">
          <p className="eyebrow">Deep work</p>
          <h2>Focus session</h2>
          <div className="focus-orb">
            <span>{state.focusMinutes}</span>
            <small>minutes</small>
          </div>
          <input
            type="range"
            min="5"
            max="90"
            step="5"
            value={state.focusMinutes}
            onChange={(event) => updateState({ focusMinutes: Number(event.target.value) })}
            aria-label="Focus minutes"
          />
          <p className="hint">
            Pick a time block, silence distractions, and finish one meaningful thing.
          </p>
        </article>

        <article className="card habits-card">
          <div className="section-title">
            <div>
              <p className="eyebrow">Consistency</p>
              <h2>Habit streaks</h2>
            </div>
          </div>
          <div className="habit-grid">
            {state.habits.map((habit) => (
              <button
                type="button"
                key={habit.id}
                className={`habit ${habit.done ? 'active' : ''}`}
                onClick={() => toggleHabit(habit.id)}
              >
                <span>{habit.label}</span>
                <strong>{habit.streak} day</strong>
              </button>
            ))}
          </div>
        </article>

        <article className="card mood-card">
          <p className="eyebrow">Check-in</p>
          <h2>Mood and energy</h2>
          <div className="mood-list">
            {moodOptions.map((mood) => (
              <button
                type="button"
                key={mood}
                className={state.mood === mood ? 'selected' : ''}
                onClick={() => updateState({ mood })}
              >
                {mood}
              </button>
            ))}
          </div>
          <p className="mood-summary">
            Current vibe: <strong>{state.mood}</strong>
          </p>
        </article>

        <article className="card notes-card">
          <p className="eyebrow">Capture</p>
          <h2>Daily notes</h2>
          <textarea
            value={state.notes}
            onChange={(event) => updateState({ notes: event.target.value })}
            aria-label="Daily notes"
          />
        </article>

        <article className="card plan-card">
          <p className="eyebrow">Evening review</p>
          <h2>Close the loop</h2>
          <ol>
            <li>What moved forward?</li>
            <li>What can be simplified tomorrow?</li>
            <li>Who or what deserves gratitude?</li>
          </ol>
        </article>
      </section>
    </main>
  );
}

export default App;
