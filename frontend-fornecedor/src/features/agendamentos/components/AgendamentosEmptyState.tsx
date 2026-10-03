interface AgendamentosEmptyStateProps {
  title: string;
  description: string;
}

export function AgendamentosEmptyState({ title, description }: AgendamentosEmptyStateProps) {
  return (
    <div className="fornecedor-agendamentos-empty" role="status">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
