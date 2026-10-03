import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

type Props = { value: number | string; start?: boolean; locale?: string };

export default function AnimatedMetricValue({ value, start = true, locale }: Props) {
  const raw = String(value);
  const match = raw.match(/^([0-9][0-9\s,.\u202f]*)(%)?$/);
  const isNumeric = Boolean(match);
  const target = match ? Number(match[1].replace(/[^0-9]/g, '')) : 0;
  const suffix = match?.[2] ?? '';
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.8 });
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(reducedMotion ? target : 0);
  const current = useRef(display);

  useEffect(() => {
    if (!isNumeric) return;
    if (reducedMotion) {
      current.current = target;
      setDisplay(target);
      return;
    }
    if (!inView || !start) return;
    const from = current.current;
    const difference = target - from;
    if (!difference) return;
    let frame = 0;
    let began = 0;
    const tick = (now: number) => {
      if (!began) began = now;
      const progress = Math.min((now - began) / 1050, 1);
      const eased = 1 - (1 - progress) ** 3;
      const next = Math.round(from + difference * eased);
      current.current = next;
      setDisplay(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, start, target, reducedMotion, isNumeric]);

  if (!isNumeric) return <span>{raw}</span>;
  const shown = display === target ? raw : `${new Intl.NumberFormat(locale ?? 'en-US').format(display)}${suffix}`;
  return <span ref={ref} className="tabular-nums"><span aria-hidden="true">{shown}</span><span className="sr-only">{raw}</span></span>;
}
