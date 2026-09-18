type MagicBallProps = {
  phase: 'ready' | 'shaking' | 'revealed';
  answer: string;
};

export default function MagicBall({ phase, answer }: MagicBallProps) {
  return (
    <div className="ball-stage" aria-hidden="true">
      <div className={`magic-ball magic-ball--${phase}`}>
        <div className="eight">8</div>
        <div className="answer-window">
          <div className="answer-triangle" />
          <span className="answer-text">{phase === 'revealed' ? answer || 'Still a mystery.' : ''}</span>
        </div>
      </div>
    </div>
  );
}
