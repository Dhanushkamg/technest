import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, X, Upload, Loader2 } from 'lucide-react';
import type { Product } from '../../types';
import { getProductImage } from '../../utils/productImages';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onUpload: (id: number, file: File, isPrimary: boolean, sortOrder: number) => Promise<void>;
  isUploading: boolean;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  product,
  onUpload,
  isUploading,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPrimary, setIsPrimary] = useState(false);

  if (!isOpen || !product) return null;

  const currentImage = getProductImage(product);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      await onUpload(product.id, selectedFile, isPrimary, 0);
      setSelectedFile(null);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative z-10 w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-brand-500 dark:text-brand-400" />
              Manage Images
            </h3>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Upload images for <strong>{product.name}</strong>
            </div>

            {/* Current Primary Image */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex gap-3 items-center">
              <img src={currentImage} alt={product.name} className="w-12 h-12 rounded object-cover border border-slate-200 dark:border-slate-700" />
              <div className="text-xs">
                <p className="font-semibold text-slate-900 dark:text-white">Current Primary Image</p>
                <p className="text-slate-500 line-clamp-1">{product.images?.[0] || 'Placeholder'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Select New Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-950 dark:file:text-brand-400"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isPrimary} 
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" 
              />
              Set as primary image
            </label>

            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold transition-all disabled:opacity-50 text-xs"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {isUploading ? 'Uploading...' : 'Upload Image'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ImageUploadModal;
