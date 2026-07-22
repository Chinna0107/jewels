import React, { useEffect, useState } from "react";
import { Package, Plus, Trash2, Edit2, X, Save, Upload, Search } from "lucide-react";
import { motion } from "framer-motion";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

export function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState(null);
  
  const [formData, setFormData] = useState({ 
    name: "", description: "", sizes: [], stock: 0, image_url: "", images: [], color: "", category: "", model: "", is_active: true 
  });
  
  const [newSize, setNewSize] = useState({ size: "", price: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [prodRes, catRes] = await Promise.all([
        fetch(`${BACKEND_URL}/admin/products`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BACKEND_URL}/admin/categories`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      
      if (prodData.products) setProducts(prodData.products);
      if (catData.categories) setCategories(catData.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploading(true);
    
    try {
      const token = localStorage.getItem("token");
      const uploadedUrls = [];
      
      for (const file of files) {
        const fd = new FormData();
        fd.append("image", file);
        const res = await fetch(`${BACKEND_URL}/admin/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd
        });
        const data = await res.json();
        if (data.url) uploadedUrls.push(data.url);
      }
      
      if (uploadedUrls.length > 0) {
        setFormData(prev => ({ 
          ...prev, 
          images: [...(prev.images || []), ...uploadedUrls],
          image_url: prev.image_url || uploadedUrls[0] // fallback
        }));
      }
    } catch (err) {
      console.error(err);
      alert("Upload error");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== indexToRemove)
    }));
  };

  const handleAdd = () => {
    setFormData({ name: "", description: "", sizes: [], stock: 0, image_url: "", images: [], color: "", category: "", model: "", is_active: true });
    setNewSize({ size: "", price: "" });
    setEditProduct({});
    setIsNew(true);
  };

  const handleEdit = (product) => {
    const images = Array.isArray(product.images) && product.images.length > 0 
      ? product.images 
      : (product.image_url ? [product.image_url] : []);
      
    setFormData({ ...product, model: product.model || "", sizes: product.sizes || [], images, color: product.color || "" });
    setNewSize({ size: "", price: "" });
    setEditProduct(product);
    setIsNew(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete product?")) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`${BACKEND_URL}/admin/products/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const addSize = () => {
    if (newSize.size.trim() && newSize.price !== "") {
      setFormData({ ...formData, sizes: [...formData.sizes, { size: newSize.size.trim(), price: Number(newSize.price) }] });
      setNewSize({ size: "", price: "" });
    }
  };

  const removeSize = (index) => {
    const updated = [...formData.sizes];
    updated.splice(index, 1);
    setFormData({ ...formData, sizes: updated });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const url = isNew ? `${BACKEND_URL}/admin/products` : `${BACKEND_URL}/admin/products/${editProduct.id}`;
      
      // Ensure image_url has the first image for backward compatibility
      const payload = {
        ...formData,
        image_url: formData.images.length > 0 ? formData.images[0] : ""
      };

      await fetch(url, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      setEditProduct(null);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  const selectedCatObj = categories.find(c => c.name === formData.category);
  const availableModels = selectedCatObj?.models || [];

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-[#08183A]/20 border-t-[#08183A] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#08183A]">Products</h1>
          <p className="text-[#08183A]/40 text-xs font-sans mt-0.5">Manage inventory, sizes, and pricing</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#08183A]/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
              className="pl-9 pr-4 py-2 bg-white rounded-xl border border-[#08183A]/10 text-sm focus:outline-none w-full sm:w-64" />
          </div>
          <button onClick={handleAdd}
            className="flex items-center gap-2 bg-[#08183A] hover:bg-[#D4AF37] text-white px-4 py-2 rounded-xl font-semibold transition-colors whitespace-nowrap">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#08183A]/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FDF8F0] border-b border-[#08183A]/10">
                <th className="px-4 py-3 text-xs font-bold text-[#08183A]/60 uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-xs font-bold text-[#08183A]/60 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-xs font-bold text-[#08183A]/60 uppercase tracking-wider">Color</th>
                <th className="px-4 py-3 text-xs font-bold text-[#08183A]/60 uppercase tracking-wider">Sizes/Prices</th>
                <th className="px-4 py-3 text-xs font-bold text-[#08183A]/60 uppercase tracking-wider">Stock</th>
                <th className="px-4 py-3 text-xs font-bold text-[#08183A]/60 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-[#08183A]/60 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#08183A]/5">
              {filteredProducts.map(product => {
                const firstImg = (product.images && product.images.length > 0) ? product.images[0] : product.image_url;
                return (
                  <tr key={product.id} className="hover:bg-[#FDF8F0]/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-[#08183A]/10">
                          {firstImg ? (
                            <img src={firstImg} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400"><Package className="w-5 h-5" /></div>
                          )}
                        </div>
                        <div className="font-sans font-bold text-[#08183A] line-clamp-1">{product.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#08183A]/70">{product.category}</td>
                    <td className="px-4 py-3 text-sm text-[#08183A]/70">{product.color || "-"}</td>
                    <td className="px-4 py-3 text-sm text-[#08183A]/70">
                      {product.sizes && product.sizes.length > 0 ? (
                        <span className="text-[#08183A] font-semibold">{product.sizes.length} variant(s)</span>
                      ) : (
                        <span className="text-gray-400 text-xs">No sizes</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#08183A]/70">{product.stock}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {product.is_active ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(product)} className="p-1.5 text-[#08183A] hover:bg-[#08183A]/10 rounded"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(product.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-[#08183A]/50">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-white border-b border-[#08183A]/10 px-6 py-4 flex items-center justify-between shrink-0">
              <h2 className="font-serif text-xl font-bold text-[#08183A]">{isNew ? "Add" : "Edit"} Product</h2>
              <button onClick={() => setEditProduct(null)} className="text-[#08183A]/50 hover:text-[#08183A]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-sans font-semibold text-[#08183A]/70 mb-1 block">Product Name</label>
                  <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#FDF8F0] border border-[#08183A]/10 focus:outline-none" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-sans font-semibold text-[#08183A]/70 mb-1 block">Color</label>
                  <input value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} placeholder="e.g. Gold, Red"
                    className="w-full px-3 py-2 rounded-lg bg-[#FDF8F0] border border-[#08183A]/10 focus:outline-none" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-sans font-semibold text-[#08183A]/70 mb-1 block">Category</label>
                  <select value={formData.category} onChange={(e) => {
                      setFormData({ ...formData, category: e.target.value, model: "" });
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-[#FDF8F0] border border-[#08183A]/10 focus:outline-none">
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                
                {availableModels.length > 0 && (
                  <div>
                    <label className="text-xs font-sans font-semibold text-[#08183A]/70 mb-1 block">Model / Subcategory</label>
                    <select value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#FDF8F0] border border-[#08183A]/10 focus:outline-none">
                      <option value="">Select Model (Optional)</option>
                      {availableModels.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              
              <div className="pt-3 border-t border-[#08183A]/10">
                <label className="text-xs font-sans font-semibold text-[#08183A]/70 mb-2 block">Sizes and Pricing</label>
                <div className="space-y-2 mb-3">
                  {formData.sizes.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-[#FDF8F0] border border-[#08183A]/10 p-2 rounded-lg">
                      <span className="flex-1 font-semibold text-[#08183A] pl-2">{s.size}</span>
                      <span className="text-[#08183A] font-bold w-24">₹{s.price}</span>
                      <button onClick={() => removeSize(idx)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  {formData.sizes.length === 0 && (
                    <p className="text-xs text-[#08183A]/40 italic">No sizes added. Products require at least one size variant.</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <select value={newSize.size} onChange={(e) => setNewSize({ ...newSize, size: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg bg-white border border-[#08183A]/20 focus:outline-none focus:border-[#08183A]/50 text-sm">
                    <option value="">Select Size</option>
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                  </select>
                  <input type="number" value={newSize.price} onChange={(e) => setNewSize({ ...newSize, price: e.target.value })} placeholder="Price (₹)"
                    className="w-24 px-3 py-2 rounded-lg bg-white border border-[#08183A]/20 focus:outline-none focus:border-[#08183A]/50 text-sm" />
                  <button onClick={addSize} className="bg-[#FDF8F0] text-[#08183A] border border-[#08183A]/20 px-4 rounded-lg font-semibold hover:bg-[#08183A]/10 transition-colors">Add</button>
                </div>
              </div>

              <div>
                <label className="text-xs font-sans font-semibold text-[#08183A]/70 mb-1 block">Stock Quantity (Total)</label>
                <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FDF8F0] border border-[#08183A]/10 focus:outline-none" />
              </div>
              
              <div>
                <label className="text-xs font-sans font-semibold text-[#08183A]/70 mb-1 block">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-[#FDF8F0] border border-[#08183A]/10 focus:outline-none resize-none" />
              </div>
              
              <div>
                <label className="text-xs font-sans font-semibold text-[#08183A]/70 mb-2 block">Product Images (Multiple allowed)</label>
                
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  {formData.images.map((imgUrl, idx) => (
                    <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden border border-[#08183A]/20 relative group">
                      <img src={imgUrl} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                      <button onClick={() => handleRemoveImage(idx)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                  
                  {formData.images.length === 0 && (
                    <div className="w-16 h-16 rounded-lg bg-[#FDF8F0] border border-[#08183A]/10 flex-shrink-0 flex items-center justify-center text-[#08183A]/20">
                      <Package className="w-6 h-6" />
                    </div>
                  )}
                </div>

                <div>
                  <input type="file" id="prod_image" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <label htmlFor="prod_image" className="inline-flex items-center gap-2 bg-[#FDF8F0] hover:bg-[#FDF8F0]/70 text-[#08183A] border border-[#08183A]/20 px-3 py-1.5 rounded-lg text-sm font-semibold cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" /> {uploading ? "Uploading..." : "Upload Images"}
                  </label>
                  <p className="text-[10px] text-[#08183A]/40 mt-1">PNG, JPG up to 5MB. Select multiple files at once.</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-[#08183A]" />
                  <label htmlFor="is_active" className="text-sm font-sans font-semibold text-[#08183A] cursor-pointer">Active</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="is_bestseller" checked={formData.is_bestseller || false} onChange={(e) => setFormData({ ...formData, is_bestseller: e.target.checked })}
                    className="w-4 h-4 text-[#08183A]" />
                  <label htmlFor="is_bestseller" className="text-sm font-sans font-semibold text-[#08183A] cursor-pointer">Best Seller</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="is_trending" checked={formData.is_trending || false} onChange={(e) => setFormData({ ...formData, is_trending: e.target.checked })}
                    className="w-4 h-4 text-[#08183A]" />
                  <label htmlFor="is_trending" className="text-sm font-sans font-semibold text-[#08183A] cursor-pointer">Trending</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="is_offer" checked={formData.is_offer || false} onChange={(e) => setFormData({ ...formData, is_offer: e.target.checked })}
                    className="w-4 h-4 text-[#08183A]" />
                  <label htmlFor="is_offer" className="text-sm font-sans font-semibold text-[#08183A] cursor-pointer">Offers</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="is_festive" checked={formData.is_festive || false} onChange={(e) => setFormData({ ...formData, is_festive: e.target.checked })}
                    className="w-4 h-4 text-[#08183A]" />
                  <label htmlFor="is_festive" className="text-sm font-sans font-semibold text-[#08183A] cursor-pointer">Festive Collection</label>
                </div>
              </div>
            </div>
            
            <div className="border-t border-[#08183A]/10 px-6 py-4 flex gap-3 shrink-0 bg-white">
              <button onClick={() => setEditProduct(null)} className="flex-1 px-4 py-2 bg-[#FDF8F0] text-[#08183A] rounded-xl font-semibold hover:bg-[#FDF8F0]/70">Cancel</button>
              <button onClick={handleSave} disabled={saving || uploading || !formData.name || formData.sizes.length === 0} className="flex-1 px-4 py-2 bg-[#08183A] text-white rounded-xl font-semibold flex justify-center items-center gap-2 disabled:opacity-50 hover:bg-[#D4AF37] transition-colors">
                {saving ? "Saving..." : <><Save className="w-4 h-4" /> Save</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
