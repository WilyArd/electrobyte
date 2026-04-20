import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '../lib/api';

const CATEGORIES = ['COMPONENTS', 'PERIPHERALS', 'ACCESSORIES', 'STORAGE', 'NETWORKING', 'AUDIO'];

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: any | null; // If null, it's Add Mode. If not, it's Edit Mode.
}

export default function ProductModal({ isOpen, onClose, onSuccess, product }: ProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: CATEGORIES[0],
    image: '',
    featured: false,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        stock: product.stock.toString(),
        category: product.category,
        image: product.image,
        featured: product.featured || false,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: CATEGORIES[0],
        image: '',
        featured: false,
      });
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10),
    };

    try {
      if (product) {
        await api.put(`/api/admin/products/${product.id}`, payload);
      } else {
        await api.post('/api/admin/products', payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to save product:', err);
      alert('Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        
        {/* Backdrop overlay */}
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal panel */}
        <div className="relative inline-block align-bottom bg-navy-900 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-navy-700">
          <div className="bg-navy-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-navy-800 flex justify-between items-center">
            <h3 className="text-xl leading-6 font-semibold text-white" id="modal-title">
              {product ? 'Edit Product' : 'Add New Product'}
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4 space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1">Product Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-navy-950 border border-navy-700 rounded-lg py-2 px-3 text-white focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="Gaming Laptop X" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea required rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-navy-950 border border-navy-700 rounded-lg py-2 px-3 text-white focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="Detailed product description..."></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Price ($)</label>
                <input required type="number" step="0.01" min="0" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full bg-navy-950 border border-navy-700 rounded-lg py-2 px-3 text-white focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="99.99" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Stock</label>
                <input required type="number" min="0" step="1" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="w-full bg-navy-950 border border-navy-700 rounded-lg py-2 px-3 text-white focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="100" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-navy-950 border border-navy-700 rounded-lg py-2 px-3 text-white focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Image URL</label>
                <input required type="url" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} className="w-full bg-navy-950 border border-navy-700 rounded-lg py-2 px-3 text-white focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="https://example.com/image.jpg" />
              </div>

              <div className="sm:col-span-2 mt-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({...formData, featured: e.target.checked})} className="form-checkbox h-5 w-5 text-primary-600 rounded border-navy-700 bg-navy-950 focus:ring-primary-500 focus:ring-offset-navy-900" />
                  <span className="text-sm font-medium text-slate-300">Featured Product (Shows on homepage hero)</span>
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-navy-800 pt-5">
              <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 bg-navy-800 text-white rounded-lg hover:bg-navy-700 transition-colors text-sm font-medium disabled:opacity-50">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors text-sm font-medium flex items-center disabled:opacity-50">
                {loading ? (
                   <span className="flex items-center">
                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                     Saving...
                   </span>
                ) : 'Save Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
