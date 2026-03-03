'use client';

import { X, Trash2, Hash, Plus, ImagePlus, Pencil, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Category } from '@/lib/types';
import Image from 'next/image';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAdd: (data: FormData) => void;
  onEdit: (id: string, data: FormData) => void; // New prop for editing
  onDelete: (id: string) => void;
}

export default function ManageCategoriesModal({ isOpen, onClose, categories, onAdd, onEdit, onDelete }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState('');

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up form when modal closes to prevent stale data
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setEditingId(null);
    setNewCatName('');
    setImageFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      const formData = new FormData();
      formData.append('name', newCatName);

      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (editingId) {
        onEdit(editingId, formData);
      } else {
        onAdd(formData);
      }

      resetForm();
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setNewCatName(cat.name);
    setPreviewUrl(cat.image || null);
    setImageFile(null); 
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

        {/* Add/Edit Section */}
        <div className="p-6 border-b border-gray-100 bg-white shrink-0 transition-colors duration-300">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-xs font-bold text-gray-900">
              {editingId ? 'Edit Category' : 'Add New Category'}
            </label>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-[10px] uppercase tracking-wider font-bold text-gray-400 hover:text-red-500 transition-colors"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">

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
              className={`px-6 h-11 text-white font-bold rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:active:scale-100 shrink-0
                ${editingId ? 'bg-gray-900 shadow-gray-200' : 'bg-brand-red shadow-red-100'}
              `}
              title={editingId ? "Save Changes" : "Add Category"}
            >
              {editingId ? <Check size={20} /> : <Plus size={20} />}
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
                <div
                  key={cat.id}
                  className={`bg-white p-3 rounded-xl border flex items-center justify-between shadow-sm group transition-all
                     ${editingId === cat.id ? 'border-gray-900 ring-1 ring-gray-900' : 'border-gray-100 hover:border-gray-300'}
                   `}
                >
                  <div className="flex items-center gap-3">

                    <div className="relative w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 overflow-hidden border border-gray-100 shrink-0">
                      {cat.image ? (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_URL}${cat.image}`}
                          alt={cat.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Hash size={16} />
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-gray-800">{cat.name}</h4>
                    </div>
                  </div>

                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => startEdit(cat)}
                      className={`p-2 rounded-lg transition-colors shrink-0
                          ${editingId === cat.id ? 'text-gray-900 bg-gray-100' : 'text-gray-300 hover:text-blue-500 hover:bg-blue-50'}
                        `}
                      title="Edit Category"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(cat.id)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                      title="Delete Category"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
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