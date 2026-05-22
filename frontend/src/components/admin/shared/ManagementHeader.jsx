export function ManagementHeader({ title, description, actionLabel, ActionIcon, onAction }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-2 border-foreground pb-4 gap-4">
      <div>
        <h2 className="text-4xl md:text-5xl font-serif italic leading-none">{title}</h2>
        <p className="text-xs mt-2 uppercase tracking-widest font-bold opacity-60">{description}</p>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-foreground text-background font-bold uppercase text-xs tracking-widest px-6 py-3 hover:bg-primary transition-colors flex items-center justify-center gap-2"
        >
          {ActionIcon && <ActionIcon className="w-4 h-4" />} {actionLabel}
        </button>
      )}
    </div>
  );
}
