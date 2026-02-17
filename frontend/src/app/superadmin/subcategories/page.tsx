'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Layers, 
  Plus, 
  Search, 
  RefreshCcw, 
  Edit2, 
  Trash2, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  Upload,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Image as ImageIcon,
  FolderOpen
} from 'lucide-react';
import adminService from '@/services/admin.service';
import { toast } from 'react-hot-toast';

// --- Types ---
interface Subcategory {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  image: string | null;
  isActive: boolean;
  createdAt: string;
  _count: {
    products: number;
  };
}

interface Category {
  id: string;
  name: string;
}

interface SummaryData {
  totalSubcategories: number;
  activeSubcategories: number;
  disabledSubcategories: number;
}

// --- Components ---

const StatusBadge = ({ isActive }: { isActive: boolean }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
    isActive 
      ? 'bg-[#E8F5E9] text-[#16A34A]' 
      : 'bg-[#FFEBEE] text-[#DC2626]'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isActive ? 'bg-[#16A34A]' : 'bg-[#DC2626]'}`} />
    {isActive ? 'Active' : 'Disabled'}
  </span>
);

export default function SubcategoryManagementPage() {
  // State
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState<SummaryData>({
    totalSubcategories: 0,
    activeSubcategories: 0,
    disabledSubcategories: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  
  // Form State
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    isActive: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Data
  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [subsRes, summaryRes, catsRes] = await Promise.all([
        adminService.getSubcategories({
          page: pagination.page,
          limit: pagination.limit,
          search,
          categoryId: categoryFilter || undefined,
          isActive: statusFilter === '' ? undefined : statusFilter === 'ACTIVE'
        }),
        adminService.getSubcategorySummary(),
        adminService.getCategories({ limit: 100 }) // Fetch all categories for dropdown
      ]);
      
      setSubcategories(subsRes.data.data || []);
      setPagination(prev => ({
        ...prev,
        total: subsRes.data.pagination?.total || 0,
        pages: subsRes.data.pagination?.totalPages || 1
      }));
      setSummary(summaryRes.data.data || { totalSubcategories: 0, activeSubcategories: 0, disabledSubcategories: 0 });
      
      // Handle the fact that getCategories might return { success: true, data: { data:[] } } or similar
      const catData = catsRes.data.data?.data || catsRes.data.data || [];
      // If it's the flattened version from my previous work, it will have .name directly
      setCategories(catData.map((c: any) => ({
        id: c.id,
        name: c.name || c.translations?.[0]?.name || 'Unnamed Category'
      })));
    } catch (error: any) {
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || 'Failed to fetch subcategories');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pagination.page, pagination.limit, search, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Handlers ---

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        return toast.error('Only JPG, PNG and WEBP are allowed');
      }
      if (file.size > 5 * 1024 * 1024) {
        return toast.error('Image size must be less than 5MB');
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.categoryId) {
      return toast.error('Name, Description and Category are required');
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('categoryId', formData.categoryId);
    data.append('isActive', String(formData.isActive));
    if (imageFile) data.append('image', imageFile);

    try {
      setFormLoading(true);
      await adminService.createSubcategory(data);
      toast.success('Subcategory created successfully');
      setShowAddModal(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create subcategory');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubcategory) return;

    const data = new FormData();
    if (formData.name) data.append('name', formData.name);
    if (formData.description) data.append('description', formData.description);
    if (formData.categoryId) data.append('categoryId', formData.categoryId);
    data.append('isActive', String(formData.isActive));
    if (imageFile) data.append('image', imageFile);

    try {
      setFormLoading(true);
      await adminService.updateSubcategory(selectedSubcategory.id, data);
      toast.success('Subcategory updated successfully');
      setShowEditModal(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update subcategory');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteSubcategory = async () => {
    if (!selectedSubcategory) return;
    
    if (selectedSubcategory._count.products > 0) {
      setShowDeleteModal(false);
      setShowWarningModal(true);
      return;
    }

    try {
      setFormLoading(true);
      await adminService.deleteSubcategory(selectedSubcategory.id);
      toast.success('Subcategory deleted successfully');
      setShowDeleteModal(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete subcategory');
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      categoryId: '',
      isActive: true
    });
    setImageFile(null);
    setImagePreview(null);
    setSelectedSubcategory(null);
  };

  const openEditModal = (sub: Subcategory) => {
    setSelectedSubcategory(sub);
    setFormData({
      name: sub.name,
      description: sub.description,
      categoryId: sub.categoryId,
      isActive: sub.isActive
    });
    setImagePreview(sub.image ? (sub.image.startsWith('http') ? sub.image : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001'}${sub.image}`) : null);
    setShowEditModal(true);
  };

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';

  // --- Render ---

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0205A6]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1E36]">Subcategory Management</h1>
          <p className="text-gray-500 text-sm italic font-medium">Define granular classifications for machinery inventory</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0205A6] text-white rounded-[10px] hover:bg-[#045870] transition-all font-semibold shadow-md active:scale-95"
        >
          <Plus size={18} />
          Add Subcategory
        </button>
      </div>

      {/* 2. Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Total Subcategories', value: summary.totalSubcategories, icon: Layers, color: '#0205A6' },
          { label: 'Active Subcategories', value: summary.activeSubcategories, icon: CheckCircle2, color: '#16A34A' },
          { label: 'Disabled Subcategories', value: summary.disabledSubcategories, icon: X, color: '#DC2626' },
        ].map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{card.label}</p>
              <h3 className="text-3xl font-black text-[#0A1E36] mt-1">{card.value}</h3>
            </div>
            <div className="p-3 rounded-2xl" style={{ backgroundColor: `${card.color}15` }}>
              <card.icon size={24} style={{ color: card.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Search & Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by subcategory name..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0205A6] focus:border-transparent transition-all text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <div className="relative flex-1 md:w-48">
             <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
             <select 
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0205A6] text-sm appearance-none cursor-pointer"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          {/* Status Filter */}
          <div className="relative flex-1 md:w-40">
             <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
             <select 
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0205A6] text-sm appearance-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="DISABLED">Disabled Only</option>
            </select>
          </div>
          <button 
            onClick={() => { setSearch(''); setStatusFilter(''); setCategoryFilter(''); }}
            className="p-2.5 text-gray-400 hover:text-[#0205A6] hover:bg-[#0205A6]/5 rounded-lg transition-colors border border-gray-200"
            title="Refresh"
          >
            <RefreshCcw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 4. Main Table */}
      <div className="bg-white rounded-[12px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Icon</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Subcategory</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Parent Category</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Products</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {subcategories.length > 0 ? subcategories.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center">
                        {sub.image ? (
                          <img 
                            src={sub.image.startsWith('http') ? sub.image : `${API_BASE_URL}${sub.image}`} 
                            alt={sub.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : <ImageIcon className="text-gray-300" size={16} />}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-[#0A1E36]">{sub.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-[#0205A6] rounded text-[10px] font-bold uppercase">
                      {sub.categoryName}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <p className="text-xs text-gray-500 truncate">{sub.description}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs font-black text-[#0A1E36]">{sub._count.products}</span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge isActive={sub.isActive} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(sub)}
                        className="p-2 text-gray-400 hover:text-[#0205A6] hover:bg-[#0205A6]/5 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => { setSelectedSubcategory(sub); setShowDeleteModal(true); }}
                        className="p-2 text-gray-400 hover:text-[#DC2626] hover:bg-[#DC2626]/5 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-gray-400 italic text-sm">
                    No subcategories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Page <span className="text-[#0A1E36]">{pagination.page}</span> of <span className="text-[#0A1E36]">{pagination.pages}</span> — Total <span className="text-[#0A1E36]">{pagination.total}</span> entries
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
              disabled={pagination.page === pagination.pages}
              className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* --- Modals --- */}

      {/* 5. ADD/EDIT MODAL */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1E36]/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 text-[#0A1E36]">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${showAddModal ? 'bg-[#0205A6]' : 'bg-[#045870]'} text-white`}>
                  {showAddModal ? <Plus size={20} /> : <Edit2 size={20} />}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{showAddModal ? 'New Subcategory' : 'Edit Subcategory'}</h2>
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Granular Hierarchy</p>
                </div>
              </div>
              <button 
                onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }} 
                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={showAddModal ? handleCreateSubcategory : handleUpdateSubcategory} className="p-6 space-y-5">
              {/* Image Upload */}
              <div className="flex flex-col items-center">
                <div 
                  className="w-full h-32 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <>
                      <div className="p-2.5 bg-white rounded-full shadow-sm text-gray-400 group-hover:text-[#0205A6] transition-colors">
                        <Upload size={20} />
                      </div>
                      <p className="mt-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Icon (Optional)</p>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/jpeg,image/png,image/webp" 
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Parent Category <span className="text-[#DC2626]">*</span></label>
                  <select
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0205A6] focus:bg-white focus:outline-none transition-all text-sm font-medium"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Subcategory Name <span className="text-[#DC2626]">*</span></label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0205A6] focus:bg-white focus:outline-none transition-all text-sm font-medium"
                    placeholder="e.g. Excavators"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Description <span className="text-[#DC2626]">*</span></label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0205A6] focus:bg-white focus:outline-none transition-all text-sm font-medium resize-none"
                  placeholder="Details about this sub-classification..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div>
                   <p className="text-xs font-bold text-[#0A1E36]">Active Status</p>
                   <p className="text-[10px] text-gray-500 italic">Visibility in marketplace filters</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.isActive ? 'bg-[#16A34A]' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 transition-all font-black text-[10px] uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className={`flex-1 px-4 py-3 text-white rounded-xl transition-all font-black text-[10px] uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg ${showAddModal ? 'bg-[#0205A6]' : 'bg-[#045870]'}`}
                >
                  {formLoading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                  {showAddModal ? 'Create' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1E36]/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[24px] shadow-2xl p-8 text-center animate-in zoom-in-95 duration-200 border-b-8 border-[#DC2626]">
            <div className="mx-auto w-16 h-16 rounded-full bg-[#DC2626]/10 text-[#DC2626] flex items-center justify-center mb-6">
              <Trash2 size={32} />
            </div>
            <h2 className="text-2xl font-black text-[#0A1E36] mb-3 uppercase tracking-tight">Remove Sub?</h2>
            <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-8">
              <p className="text-gray-600 text-xs leading-relaxed">
                Deleting <b className="text-[#DC2626]">{selectedSubcategory?.name}</b> is permanent.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 font-black text-[10px] uppercase tracking-widest transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubcategory}
                disabled={formLoading}
                className="flex-1 px-4 py-3 bg-[#DC2626] text-white rounded-xl hover:bg-red-700 font-black text-[10px] uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {formLoading && <Loader2 className="animate-spin" size={16} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. WARNING MODAL */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1E36]/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl p-8 text-center animate-in zoom-in-95 duration-200 border-b-8 border-[#FACC15]">
            <div className="mx-auto w-16 h-16 rounded-full bg-[#FACC15]/10 text-[#FACC15] flex items-center justify-center mb-6">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-2xl font-black text-[#0A1E36] mb-3 uppercase tracking-tight">Active Items Found</h2>
            <div className="bg-yellow-50 p-5 rounded-2xl border border-yellow-100 mb-8 text-left">
              <p className="text-gray-700 text-xs leading-relaxed mb-3">
                Subcategory <b>{selectedSubcategory?.name}</b> is currently linked to:
              </p>
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-yellow-200">
                 <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
                    <Layers size={20} />
                 </div>
                 <div>
                    <p className="text-lg font-black text-[#0A1E36]">{selectedSubcategory?._count.products}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Products</p>
                 </div>
              </div>
              <p className="text-gray-400 text-[10px] italic mt-4">
                Please reassign these products to another subcategory before deletion.
              </p>
            </div>
            <button
              onClick={() => setShowWarningModal(false)}
              className="w-full px-4 py-3 bg-[#0A1E36] text-white rounded-xl hover:bg-black font-black text-[10px] uppercase tracking-widest transition-all shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
