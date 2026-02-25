import { Link, type To } from 'react-router-dom';
import type { ReactNode } from 'react';

type PageShellProps = {
  title: string;
  backTo?: { to: To; label: string };
  children: ReactNode;
  className?: string;
};

export function PageShell({ title, backTo, children, className = '' }: PageShellProps) {
  return (
    <div className={`page ${className}`.trim()}>
      {backTo ? (
        <Link to={backTo.to} className="back">
          {backTo.label}
        </Link>
      ) : null}
      <h1>{title}</h1>
      {children}
    </div>
  );
}
