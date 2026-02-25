import { Link, type To } from 'react-router-dom';

type EmptyStateProps = {
  message: string;
  actionLabel: string;
  actionTo: To;
  className?: string;
};

export function EmptyState({ message, actionLabel, actionTo, className = '' }: EmptyStateProps) {
  return (
    <>
      <p className={className || 'empty-state-message'}>{message}</p>
      <Link to={actionTo} className="button">
        {actionLabel}
      </Link>
    </>
  );
}
