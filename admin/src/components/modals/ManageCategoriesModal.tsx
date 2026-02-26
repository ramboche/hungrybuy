'use client';

import { X, Trash2, Hash, Plus, ImagePlus } from 'lucide-react';
import { useState, useRef } from 'react';
import { Category } from '@/lib/types';
import Image from 'next/image';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAdd: (data: FormData) => void; 
  onDelete: (id: string) => void;
}

export default function ManageCategoriesModal({ isOpen, onClose, categories, onAdd, onDelete }: Props) {
  const [newCatName, setNewCatName] = useState('');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      const formData = new FormData();
      formData.append('name', newCatName);
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      onAdd(formData);

      setNewCatName('');
      setImageFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
          <h3 className="text-lg font-bold text-gray-900">Manage Categories</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Add New Section */}
        <div className="p-6 border-b border-gray-100 bg-white shrink-0">
          <label className="block text-xs font-bold text-gray-900 mb-3">Add New Category</label>
          <form onSubmit={handleAdd} className="flex gap-2">
            
            <input 
              type="text" 
              placeholder="e.g. Appetizers"
              className="flex-1 h-11 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              autoFocus 
            />

            <input 
              type="file" 
              accept="image/*"
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative w-11 h-11 shrink-0 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center overflow-hidden hover:bg-gray-100 transition-colors group"
              title={imageFile ? "Change Image" : "Upload Image"}
            >
              {previewUrl ? (
                <>
                  <Image src={previewUrl} alt="Preview" fill className="object-cover group-hover:opacity-50 transition-opacity" />
                  <ImagePlus size={16} className="text-gray-900 absolute opacity-0 group-hover:opacity-100 transition-opacity" />
                </>
              ) : (
                <ImagePlus size={20} className="text-gray-400" />
              )}
            </button>

            <button 
              type="submit"
              disabled={!newCatName.trim()}
              className="px-6 h-11 bg-brand-red text-white font-bold rounded-xl shadow-md shadow-red-100 active:scale-95 transition-transform flex items-center justify-center disabled:opacity-50 disabled:active:scale-100 shrink-0"
            >
              <Plus size={20} />
            </button>

          </form>
        </div>

        {/* List Section */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
           <div className="flex justify-between items-end mb-4">
              <span className="text-xs font-bold text-gray-500">Existing Categories ({categories.length})</span>
           </div>
           
           <div className="space-y-3">
             {categories.length > 0 ? (
               categories.map((cat) => (
                 <div key={cat.id} className="bg-white p-3 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm group hover:border-brand-red/30 transition-colors">
                    <div className="flex items-center gap-3">
                       
                       <div className="relative w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 overflow-hidden border border-gray-100 shrink-0">
                         {cat.image ? (
                           <Image 
                             src={`${cat.image}`} 
                             alt={cat.name} 
                             fill 
                             className="object-cover"
                             unoptimized 
                           />
                         ) : (
                           <Hash size={16} />
                         )}
                       </div>

                       <div>
                          <h4 className="text-sm font-bold text-gray-800">{cat.name}</h4>
                       </div>
                    </div>
                    <button 
                      onClick={() => onDelete(cat.id)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                      title="Delete Category"
                    >
                      <Trash2 size={16} />
                    </button>
                 </div>
               ))
             ) : (
               <div className="text-center py-10 text-gray-400 text-sm">
                 No categories found. Add one above!
               </div>
             )}
           </div>
        </div>

      </div>
    </div>
  );
}