import Image from 'next/image';

interface Props {
  id?: string;
  name: string;
  image: string;
  isActive: boolean;
  onClick: () => void;
}

export default function CategoryItem({ name, image, isActive, onClick }: Props) {

  const imageUrl = image
    ? `${process.env.NEXT_PUBLIC_API_URL}${image}`
    : null;

  return (
    <div 
      onClick={onClick}
      className="flex flex-col items-center gap-1 cursor-pointer group w-14"
    >
      {/* Icon Circle */}
      <div 
        className={`
          relative w-14 h-14 m-1 rounded-full overflow-hidden flex items-center justify-center transition-all duration-300 shrink-0
          ${isActive 
            ? 'bg-brand-orange ring-2 ring-brand-orange ring-offset-2 ring-offset-white scale-100' 
            : 'bg-[#F6F6F6] hover:bg-gray-200' 
          }
      `}>
         {/* Fallback Text if no image */}
         {(!image || image === "") && (
           <div className={`relative z-10 text-[10px] leading-tight font-bold text-center px-1 wrap-break-word 
             ${isActive ? 'text-white' : 'text-gray-500'}
           `}>
             {name}
           </div>
         )}
         
         {/* Category Image */}
         {image && (
          <Image 
            src={imageUrl || ''} 
            alt={name} 
            fill 
            sizes="64px"
            className={`object-contain p-4 transition-all duration-300 
              ${isActive ? 'brightness-0 invert opacity-100' : 'opacity-60 group-hover:opacity-80'}
            `} 
          />
         )}
      </div>
      
      {/* Category Name */}
      <span className={`text-[8px] text-center font-bold transition-colors
        ${isActive ? 'text-brand-orange ' : 'text-gray-600 '}
      `}>
        {name}
      </span>
    </div>
  );
}