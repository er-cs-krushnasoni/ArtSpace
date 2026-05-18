import { useState, useEffect } from 'react';
import { Tag } from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import CategoryManager from '../../components/admin/categories/CategoryManager';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tenant/categories');
      setCategories(res.data.data || []);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Organise your products with category groups and values
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
          <Tag className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-600">{categories.length} group{categories.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <CategoryManager
        categories={categories}
        setCategories={setCategories}
        loading={loading}
      />
    </div>
  );
}