import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Info } from 'lucide-react';
import './InfoHint.css';

export interface InfoHintProps {
  label: string;
  title?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  children: React.ReactNode;
}

export function InfoHint({ label, title, side = 'top', children }: InfoHintProps) {
  const [open, setOpen] = React.useState(false);
  const timeoutRef = React.useRef<number | null>(null);

  const handleMouseEnter = () => {
    if (window.matchMedia('(hover: hover)').matches) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (window.matchMedia('(hover: hover)').matches) {
      timeoutRef.current = window.setTimeout(() => setOpen(false), 200);
    }
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="info-hint-trigger"
          aria-label={label}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => {
            // Prevent event from bubbling if it's inside a label or other clickable
            e.preventDefault();
            setOpen((prev) => !prev);
          }}
        >
          <Info size={16} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="info-hint-content"
          side={side}
          sideOffset={8}
          collisionPadding={16}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {title && <div className="info-hint-title">{title}</div>}
          <div className="info-hint-body">{children}</div>
          <Popover.Arrow className="info-hint-arrow" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
