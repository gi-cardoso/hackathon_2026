import './ui.css';
export function Stepper({ current, steps }: { current: number; steps: string[] }) { return <ol className="ui-stepper" aria-label="Etapas">{steps.map((step, index) => <li key={step} className={index + 1 <= current ? 'is-active' : ''}><span>{index + 1}</span><strong>{step}</strong></li>)}</ol>; }
