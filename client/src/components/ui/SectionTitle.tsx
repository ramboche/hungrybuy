interface Props {
  title: string;
  actionText?: string;
}

export default function SectionTitle({ title, actionText = "See all" }: Props) {
  return (
    <div className="flex justify-between items-center mb-4 px-1">
      <h2 className="text-2xl font-bold text-brand-dark">{title}</h2>
      <button className="text-brand-dark text-sm hover:text-brand-red transition-colors">
        {actionText}
      </button>
    </div>
  );
}