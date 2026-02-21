'use client';

import { X, Camera, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Product, Category, FoodType } from '@/lib/types';
import Image from 'next/image';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  initialData?: Product | null;
  onSave: (formData: FormData, variants: { id?: string; label: string; price: number }[]) => void;
}

export default function AddProductModal({ isOpen, onClose, onSave, categories, initialData }: Props) {
  // --- Form State ---
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    image: '',
    inStock: true,
    foodType: 'NON_VEG' as FoodType,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [variants, setVariants] = useState<{ id?: string; label: string; price: string }[]>([]);
  const [preview, setPreview] = useState<string>('');

  const imageUrl = initialData?.image
    ? `${process.env.NEXT_PUBLIC_API_URL}${initialData.image}`
    : null;


  // --- Reset / Populate ---
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isOpen) {
        setImageFile(null);
        if (initialData) {
          setFormData({
            name: initialData.name,
            price: initialData.price ? String(initialData.price) : '',
            category: initialData.categoryId,
            description: initialData.description || '',
            image: initialData.image || '',
            inStock: initialData.isAvailable ?? true,
            foodType: initialData.foodType || 'NON_VEG',
          });
          setPreview(imageUrl || '');

          if (initialData.variants) {
            setVariants(initialData.variants.map(v => ({
              id: v.id,
              label: v.label,
              price: (v.price) ? String(v.price) : '',
            })));
          } else {
            setVariants([]);
          }

        } else {
          setFormData({
            name: '',
            price: '',
            category: categories[0]?.id || '',
            description: '',
            image: '',
            inStock: true,
            foodType: 'NON_VEG',
          });
          setVariants([]);
          setPreview('');
        }
      }
    }, 0)

    return () => clearTimeout(timer);

  }, [initialData, isOpen, categories, imageUrl]);

  // --- Handlers ---

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      setFormData({ ...formData, image: url });
      setImageFile(file);
    }
  };

  const handleAddVariant = () => {
    setVariants([...variants, { label: '', price: '' }]);
  };

  const updateVariant = (index: number, field: 'label' | 'price', value: string) => {
    const newVars = [...variants];
    newVars[index] = { ...newVars[index], [field]: value };
    setVariants(newVars);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const safePrice = formData.price === '' ? '0' : formData.price;

    const formattedVariants = variants
      .filter(v => v.label && v.price)
      .map(v => ({
        id: v.id,
        label: v.label,
        price: Math.round(parseFloat(v.price) * 100)
      }));

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', String(safePrice));
    data.append('categoryId', formData.category);
    data.append('foodType', formData.foodType);
    data.append('isAvailable', String(formData.inStock));

    if (imageFile) {
      data.append('image', imageFile);
    }

    onSave(data, formattedVariants);

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
          <h3 className="text-lg font-bold text-gray-900">
            {initialData ? 'Edit Item' : 'Add New Item'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="p-6 overflow-y-auto scrollbar-hide">
          <form id="product-form" onSubmit={handleSubmit} className="space-y-5">

            {/* Image Upload */}
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-2">Item Image</label>
              <div className="relative w-full h-40 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 flex flex-col items-center justify-center text-gray-400 hover:border-brand-red/50 hover:bg-red-50/10 transition-colors overflow-hidden group">
                {preview ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={preview}
                      alt="Preview"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      unoptimized={true}
                    />
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center mb-2 text-brand-red">
                      <Camera size={20} />
                    </div>
                    <span className="text-xs font-medium">Tap to upload image</span>
                  </>
                )}
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-2">Item Name</label>
              <input
                type="text" required placeholder="e.g. Spicy Chicken Burger"
                className="w-full h-12 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all"
                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Category & Type Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-2">Category</label>
                <div className="relative">
                  <select
                    className="w-full h-12 rounded-xl border border-gray-200 px-4 text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all"
                    value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              {/* Food Type */}
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-2">Type</label>
                <div className="flex h-12 rounded-xl bg-gray-50 p-1">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, foodType: 'VEG' })}
                    className={`flex-1 rounded-lg text-[10px] font-bold transition-all ${formData.foodType === 'VEG' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-400'}`}
                  >
                    VEG
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, foodType: 'NON_VEG' })}
                    className={`flex-1 rounded-lg text-[10px] font-bold transition-all ${formData.foodType === 'NON_VEG' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400'}`}
                  >
                    NON-VEG
                  </button>
                </div>
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-2">Base Price</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input
                  type="number" step="0.01" placeholder="0.00"
                  className="w-full h-12 rounded-xl border border-gray-200 pl-8 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all"
                  value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-2">Description</label>
              <textarea
                rows={3} placeholder="Describe ingredients..."
                className="w-full rounded-xl border border-gray-200 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all resize-none"
                value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* VARIANTS SECTION (New) */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-xs font-bold text-gray-900">Variants (Optional)</label>
                <button type="button" onClick={handleAddVariant} className="text-xs font-bold text-brand-red flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors">
                  <Plus size={14} /> Add Variant
                </button>
              </div>

              <div className="space-y-2">
                {variants.map((v, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      placeholder="Size/Type (e.g. Large)"
                      value={v.label}
                      onChange={e => updateVariant(idx, 'label', e.target.value)}
                      className="flex-2 h-10 border border-gray-200 rounded-lg px-3 text-xs focus:border-brand-red outline-none"
                    />
                    <div className="relative flex-1">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                      <input
                        type="number" step="0.01" placeholder="0.00"
                        value={v.price}
                        onChange={e => updateVariant(idx, 'price', e.target.value)}
                        className="w-full h-10 border border-gray-200 rounded-lg pl-5 pr-2 text-xs focus:border-brand-red outline-none"
                      />
                    </div>
                    <button type="button" onClick={() => removeVariant(idx)} className="w-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {variants.length === 0 && (
                  <div className="text-center py-2 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-[10px] text-gray-400">No variants added (e.g. Small, Large)</p>
                  </div>
                )}
              </div>
            </div>

            {/* In Stock Toggle */}
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox" id="stock"
                checked={formData.inStock} onChange={e => setFormData({ ...formData, inStock: e.target.checked })}
                className="w-5 h-5 rounded text-brand-red focus:ring-brand-red accent-brand-red"
              />
              <label htmlFor="stock" className="text-sm font-medium text-gray-700">Available in Stock</label>
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 flex flex-col gap-3 shrink-0">
          <button
            type="submit" form="product-form"
            className="w-full h-12 bg-brand-red text-white font-bold rounded-xl shadow-lg shadow-red-200 active:scale-95 transition-transform"
          >
            {initialData ? 'Update Item' : 'Save Item'}
          </button>
          <button onClick={onClose} className="w-full py-2 text-sm font-bold text-gray-500 hover:text-gray-800">
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}