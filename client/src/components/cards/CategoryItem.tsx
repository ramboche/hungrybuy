import Image from 'next/image';

interface Props {
  id: string;
  name: string;
  image: string;
  isActive: boolean;
  onClick: () => void;
}

export default function CategoryItem({ name, image, isActive, onClick }: Props) {
  return (
    <div 
      onClick={onClick}
      className="flex flex-col p-1 items-center gap-2 group cursor-pointer shrink-0"
    >
      <div 
        style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
        className={`
          relative w-20 h-20 rounded-full overflow-hidden flex items-center justify-center transition-all border-2
          ${isActive 
            ? 'bg-brand-red border-brand-red text-white shadow-lg shadow-red-200 scale-105' 
            : 'bg-white border-transparent hover:border-red-200' 
          }
      `}>
         {(!image || image === "") && (
           <div className={`relative z-10 text-xs font-bold text-center px-1 ${isActive ? 'text-white' : 'text-brand-red'}`}>
             {name}
           </div>
         )}
         
         {image && (
          <Image 
            src={image} 
            alt={name} 
            fill 
            className="object-cover" 
          />
         )}
      </div>
      
      <span className={`text-sm font-medium transition-colors text-center ${isActive ? 'text-brand-red font-bold' : 'text-brand-dark'}`}>
        {name}
      </span>
    </div>
  );
}