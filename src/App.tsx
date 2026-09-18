import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import MagicBall from './components/MagicBall';
import { answers } from './data/answers';
import { connectToDiscord, isDevelopmentPreview } from './lib/discord';

type ConnectionState =
  | { status: 'preview' | 'loading' | 'connected' }
  | { status: 'error'; message: string };

const SHAKE_DURATION = 1_000;

export default function App() {
  const [connection, setConnection] = useState<ConnectionState>({
    status: isDevelopmentPreview ? 'preview' : 'loading',
  });
  const [phase, setPhase] = useState<'ready' | 'shaking' | 'revealed'>('ready');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const askAgainRef = useRef<HTMLButtonElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const roundLocked = useRef(false);
  const focusOnReset = useRef(false);
  const canPlay = connection.status === 'preview' || connection.status === 'connected';

  useEffect(() => () => clearTimeout(timerRef.current), []);

  useEffect(() => {
    if (phase === 'revealed') askAgainRef.current?.focus({ preventScroll: true });
    if (phase === 'ready' && focusOnReset.current) {
      inputRef.current?.focus();
      focusOnReset.current = false;
    }
  }, [phase]);

  function shake(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedQuestion = question.replace(/\s+/g, ' ').trim();
    if (!canPlay || phase !== 'ready' || roundLocked.current || !normalizedQuestion) return;

    roundLocked.current = true;
    setQuestion(normalizedQuestion);
    setPhase('shaking');
    const selectedAnswer = answers[Math.floor(Math.random() * answers.length)] ?? 'Still a mystery.';
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : SHAKE_DURATION;
    timerRef.current = setTimeout(() => {
      setAnswer(selectedAnswer);
      setPhase('revealed');
      timerRef.current = undefined;
    }, duration);
  }

  function askAgain() {
    if (phase !== 'revealed') return;
    clearTimeout(timerRef.current);
    roundLocked.current = false;
    focusOnReset.current = true;
    setQuestion('');
    setAnswer('');
    setPhase('ready');
  }

  useEffect(() => {
    if (isDevelopmentPreview) return;
    let active = true;
    connectToDiscord().then(
      () => {
        if (active) setConnection({ status: 'connected' });
      },
      (error: unknown) => {
        if (active) {
          setConnection({
            status: 'error',
            message: error instanceof Error ? error.message : 'Please retry the Activity.',
          });
        }
      },
    );
    return () => { active = false; };
  }, []);

  return (
    <main>
      <header>
        <p className="eyebrow">A little mystery. A little luck.</p>
        <h1>Magic 8Ball</h1>
      </header>
      <div className="connection-status" role="status" aria-live="polite">
        {connection.status === 'preview' && (
          <p>Local preview · Outside Discord</p>
        )}
        {connection.status === 'loading' && <p>Connecting to Discord...</p>}
        {connection.status === 'connected' && <p>Discord Activity connected.</p>}
        {connection.status === 'error' && (
          <>
            <p>Unable to connect to Discord.</p>
            <p className="detail">{connection.message}</p>
          </>
        )}
      </div>
      {connection.status === 'error' && (
        <button onClick={() => window.location.reload()}>Retry</button>
      )}
      {canPlay && (
        <section aria-label="Ask the Magic 8-Ball" style={{ '--shake-duration': `${SHAKE_DURATION}ms` } as CSSProperties}>
          <div className="question-context">
            {phase === 'ready' ? <p>Some questions need a little magic.</p> : <p><span className="eyebrow">You asked</span><q>{question}</q></p>}
          </div>
          <MagicBall phase={phase} answer={answer} />
          <p className="round-status" role="status">
            {phase === 'ready' ? 'Ask. Shake. Leave it to fate.' : phase === 'shaking' ? 'Shaking… let fate decide.' : <>The ball has spoken.<span className="sr-only"> {answer || 'Still a mystery.'}</span></>}
          </p>
          <div className="round-controls">
            <form onSubmit={shake} className={phase === 'ready' ? undefined : 'inactive-form'} inert={phase !== 'ready'} aria-hidden={phase !== 'ready'}>
              <label htmlFor="question">Ask the Magic 8-Ball</label>
              <input
                ref={inputRef}
                id="question"
                type="text"
                placeholder="Will today be my lucky day?"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                maxLength={200}
                autoComplete="off"
                disabled={phase !== 'ready'}
                onKeyDown={(event) => {
                  // Enter confirms text, rather than submitting, during IME composition.
                  if (event.key === 'Enter' && (event.nativeEvent.isComposing || event.keyCode === 229)) {
                    event.preventDefault();
                  }
                }}
              />
              <button className="shake-button" type="submit" disabled={phase !== 'ready' || !question.trim()}>Shake</button>
            </form>
            {phase === 'revealed' && <button ref={askAgainRef} className="ask-again" onClick={askAgain}>Ask Again</button>}
            {phase === 'shaking' && <div className="anticipation" aria-hidden="true">A moment for the unknown.</div>}
          </div>
        </section>
      )}
    </main>
  );
}
