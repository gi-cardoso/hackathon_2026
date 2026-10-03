export function ModuleHeader({ title, children }: { title: string, children?: React.ReactNode }) {
  return (
    <div className="module-header">
      <h2>{title}</h2>
      {children && <div className="module-actions">{children}</div>}
    </div>
  );
}
