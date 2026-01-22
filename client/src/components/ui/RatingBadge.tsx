import { Star } from 'lucide-react';

export default function RatingBadge({ rating }: { rating: number }) {
  return (
    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-sm text-xs font-bold z-10">
      <Star size={10} className="fill-brand-red text-brand-red" />
      <span>{rating}</span>
    </div>
  );
}