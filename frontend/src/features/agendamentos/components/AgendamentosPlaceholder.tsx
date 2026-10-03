interface AgendamentosPlaceholderProps {
  title: string;
  description: string;
}

export function AgendamentosPlaceholder({ title, description }: AgendamentosPlaceholderProps) {
  return (
    <div className="agendamentos-placeholder" role="status">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
