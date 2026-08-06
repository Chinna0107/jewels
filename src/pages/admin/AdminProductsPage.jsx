import React, { useEffect, useState } from "react";
import { Package, Plus, Trash2, Edit2, X, Save, Upload, Search } from "lucide-react";
import { motion } from "framer-motion";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

export function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState(null);
  
  const initialFormData = { 
    name: "", description: "", product_code: "", stock: 0, category: "", model: "", is_active: true, offer_id: "", allow_reviews: true,
    variants: [
      { color: "", images: [], sizes: [{ size: "", mrp: "", our_price: "", stock: 0, code: "", weight: "" }] }
    ],
    details: [],
    reviews: []
  };

  const [formData, setFormData] = useState(initialFormData);
  
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
      const [prodRes, catRes, offerRes] = await Promise.all([
        fetch(`${BACKEND_URL}/admin/products`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BACKEND_URL}/admin/categories`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BACKEND_URL}/admin/offers`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      const offerData = await offerRes.json();
      
      if (prodData.products) setProducts(prodData.products);
      if (catData.categories) setCategories(catData.categories);
      if (offerData.offers) setOffers(offerData.offers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e, variantIndex) => {
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
        const updatedVariants = [...formData.variants];
        updatedVariants[variantIndex].images = [...(updatedVariants[variantIndex].images || []), ...uploadedUrls];
        setFormData({ ...formData, variants: updatedVariants });
      }
    } catch (err) {
      console.error(err);
      alert("Upload error");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (variantIndex, imageIndex) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[variantIndex].images.splice(imageIndex, 1);
    setFormData({ ...formData, variants: updatedVariants });
  };

  const handleAdd = () => {
    setFormData(initialFormData);
    setEditProduct({});
    setIsNew(true);
  };

  const handleEdit = (product) => {
    // Handle backwards compatibility for old products
    let variants = product.variants;
    if (!variants || variants.length === 0) {
      const images = Array.isArray(product.images) && product.images.length > 0 
        ? product.images 
        : (product.image_url ? [product.image_url] : []);
      // migrate old size format
      const sizes = product.sizes ? product.sizes.map(s => ({
         size: s.size,
         mrp: s.price, 
         our_price: s.price,
         stock: s.stock || 0
      })) : [];
      
      variants = [{
        color: product.color || "",
        images: images,
        sizes: sizes
      }];
    }

    setFormData({ 
      ...product, 
      model: product.model || "", 
      offer_id: product.offer_id || "",
      variants: variants,
      details: product.details || [],
      reviews: product.reviews || [],
      allow_reviews: product.allow_reviews ?? true
    });
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const url = isNew ? `${BACKEND_URL}/admin/products` : `${BACKEND_URL}/admin/products/${editProduct.id}`;
      
      const payload = {
        ...formData,
        offer_id: formData.offer_id ? Number(formData.offer_id) : null
      };

      const res = await fetch(url, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { alert('Save failed: ' + (data.error || res.status)); return; }
      setEditProduct(null);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const addVariant = () => {
    setFormData({ ...formData, variants: [...formData.variants, { color: "", images: [], sizes: [{ size: "", mrp: "", our_price: "", stock: 0, code: "", weight: "" }] }] });
  };
  
  const removeVariant = (index) => {
    const updated = [...formData.variants];
    updated.splice(index, 1);
    setFormData({ ...formData, variants: updated });
  };

  const addReview = () => {
    setFormData({ ...formData, reviews: [...formData.reviews, { name: "", rating: 5, comment: "", color: "", size: "", date: new Date().toISOString() }] });
  };

  const removeReview = (index) => {
    const updated = [...formData.reviews];
    updated.splice(index, 1);
    setFormData({ ...formData, reviews: updated });
  };

  const updateReviewField = (index, field, value) => {
    const updated = [...formData.reviews];
    updated[index][field] = value;
    setFormData({ ...formData, reviews: updated });
  };

  const addDetail = () => {
    setFormData({ ...formData, details: [...(formData.details || []), { label: "", value: "" }] });
  };

  const removeDetail = (index) => {
    const updated = [...formData.details];
    updated.splice(index, 1);
    setFormData({ ...formData, details: updated });
  };

  const updateDetailField = (index, field, value) => {
    const updated = [...formData.details];
    updated[index][field] = value;
    setFormData({ ...formData, details: updated });
  };

  const addSizeToVariant = (vIndex) => {
    const updated = [...formData.variants];
    updated[vIndex].sizes.push({ size: "", mrp: "", our_price: "", stock: 0, code: "", weight: "" });
    setFormData({ ...formData, variants: updated });
  };
  
  const removeSizeFromVariant = (vIndex, sIndex) => {
    const updated = [...formData.variants];
    updated[vIndex].sizes.splice(sIndex, 1);
    setFormData({ ...formData, variants: updated });
  };
  
  const updateSizeField = (vIndex, sIndex, field, value) => {
    const updated = [...formData.variants];
    updated[vIndex].sizes[sIndex][field] = value;
    setFormData({ ...formData, variants: updated });
  };

  const updateVariantField = (vIndex, field, value) => {
    const updated = [...formData.variants];
    updated[vIndex][field] = value;
    setFormData({ ...formData, variants: updated });
  };
  
  const selectedCatObj = categories.find(c => c.name === formData.category);
  const availableModels = selectedCatObj?.models || [];

  const filteredProducts = products.filter(p => {
    const s = search.toLowerCase();
    const nameMatch = p.name?.toLowerCase().includes(s);
    const catMatch = p.category?.toLowerCase().includes(s);
    const codeMatch = p.product_code?.toLowerCase().includes(s) || (p.variants && p.variants.some(v => v.code?.toLowerCase().includes(s)));
    return nameMatch || catMatch || codeMatch;
  });

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
          <p className="text-[#08183A]/40 text-xs font-sans mt-0.5">Manage inventory, variants, and pricing</p>
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
                <th className="px-4 py-3 text-xs font-bold text-[#08183A]/60 uppercase tracking-wider">Code</th>
                <th className="px-4 py-3 text-xs font-bold text-[#08183A]/60 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-xs font-bold text-[#08183A]/60 uppercase tracking-wider">Variants</th>
                <th className="px-4 py-3 text-xs font-bold text-[#08183A]/60 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-[#08183A]/60 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#08183A]/5">
              {filteredProducts.map(product => {
                let variants = product.variants;
                if (!variants || variants.length === 0) {
                  variants = [{ color: product.color, images: product.images || [product.image_url] }];
                }
                const firstImg = variants[0]?.images?.[0];
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
                    <td className="px-4 py-3 text-sm text-[#08183A]/70">{product.product_code || "-"}</td>
                    <td className="px-4 py-3 text-sm text-[#08183A]/70">{product.category}</td>
                    <td className="px-4 py-3 text-sm text-[#08183A]/70">
                      <span className="text-[#08183A] font-semibold">{variants.length} color(s)</span>
                    </td>
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
                  <td colSpan="6" className="px-4 py-12 text-center text-[#08183A]/50">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
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
                
                <div className={availableModels.length === 0 ? 'col-span-1' : 'col-span-2'}>
                  <label className="text-xs font-sans font-semibold text-[#08183A]/70 mb-1 block">Active Offer</label>
                  <select value={formData.offer_id || ""} onChange={(e) => setFormData({ ...formData, offer_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#FDF8F0] border border-[#08183A]/10 focus:outline-none">
                    <option value="">No Offer</option>
                    {offers.filter(o => o.is_active).map(o => (
                      <option key={o.id} value={o.id}>{o.title} ({o.discount_percentage}% OFF)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-sans font-semibold text-[#08183A]/70 mb-1 block">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-[#FDF8F0] border border-[#08183A]/10 focus:outline-none resize-none" />
              </div>

              <div className="pt-3 border-t border-[#08183A]/10">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-serif font-bold text-[#08183A]">Variants (Colors & Sizes)</label>
                  <button onClick={addVariant} className="text-xs bg-[#08183A] text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-[#D4AF37]"><Plus className="w-3 h-3"/> Add Color Variant</button>
                </div>
                
                <div className="space-y-6">
                  {formData.variants.map((variant, vIndex) => (
                    <div key={vIndex} className="bg-gray-50 border border-gray-200 p-4 rounded-xl relative">
                      <button onClick={() => removeVariant(vIndex)} className="absolute top-3 right-3 text-red-500 hover:bg-red-100 p-1.5 rounded"><Trash2 className="w-4 h-4"/></button>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4 pr-10">
                        <div>
                          <label className="text-xs font-sans font-semibold text-[#08183A]/70 mb-1 block">Color Name</label>
                          <input value={variant.color} onChange={(e) => updateVariantField(vIndex, 'color', e.target.value)} placeholder="e.g. Gold, Rose Gold"
                            className="w-full px-3 py-2 rounded-lg bg-white border border-[#08183A]/10 focus:outline-none" />
                        </div>

                      </div>

                      {/* Images for this variant */}
                      <div className="mb-4">
                        <label className="text-xs font-sans font-semibold text-[#08183A]/70 mb-2 block">Images for {variant.color || 'this color'}</label>
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          {variant.images.map((imgUrl, imgIdx) => (
                            <div key={imgIdx} className="w-16 h-16 rounded-lg overflow-hidden border border-[#08183A]/20 relative group bg-white">
                              <img src={imgUrl} alt={`Preview`} className="w-full h-full object-cover" />
                              <button onClick={() => handleRemoveImage(vIndex, imgIdx)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 className="w-4 h-4 text-white" />
                              </button>
                            </div>
                          ))}
                          {variant.images.length === 0 && (
                            <div className="w-16 h-16 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-300">
                              <Package className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div>
                          <input type="file" id={`img_up_${vIndex}`} multiple accept="image/*" onChange={(e) => handleImageUpload(e, vIndex)} className="hidden" />
                          <label htmlFor={`img_up_${vIndex}`} className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-[#08183A] border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer">
                            <Upload className="w-3 h-3" /> {uploading ? "Uploading..." : "Upload Images"}
                          </label>
                        </div>
                      </div>

                      {/* Sizes for this variant */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-xs font-sans font-semibold text-[#08183A]/70">Sizes & Pricing for {variant.color || 'this color'}</label>
                          <button onClick={() => addSizeToVariant(vIndex)} className="text-[10px] bg-white border border-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-100 flex items-center gap-1"><Plus className="w-3 h-3"/> Add Size</button>
                        </div>
                        <div className="space-y-2">
                          {variant.sizes.map((sizeObj, sIndex) => (
                            <div key={sIndex} className="flex flex-wrap items-center gap-2 bg-white p-2 rounded border border-gray-200">
                              <input value={sizeObj.size} onChange={e => updateSizeField(vIndex, sIndex, 'size', e.target.value)} placeholder="Size (e.g. S, 10g)" className="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none min-w-[80px]" />
                              <input value={sizeObj.code || ""} onChange={e => updateSizeField(vIndex, sIndex, 'code', e.target.value)} placeholder="Code (e.g. RING-001-S)" className="w-32 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none" />
                              <input type="number" value={sizeObj.mrp} onChange={e => updateSizeField(vIndex, sIndex, 'mrp', e.target.value)} placeholder="MRP ($)" className="w-24 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none" />
                              <input type="number" value={sizeObj.our_price} onChange={e => updateSizeField(vIndex, sIndex, 'our_price', e.target.value)} placeholder="Our Price ($)" className="w-24 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none" />
                              <input type="number" value={sizeObj.stock} onChange={e => updateSizeField(vIndex, sIndex, 'stock', Number(e.target.value))} placeholder="Stock" className="w-20 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none" />
                              <input value={sizeObj.weight || ""} onChange={e => updateSizeField(vIndex, sIndex, 'weight', e.target.value)} placeholder="Weight (g)" className="w-24 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none" />
                              <button onClick={() => removeSizeFromVariant(vIndex, sIndex)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          ))}
                          {variant.sizes.length === 0 && <p className="text-[10px] text-gray-500">No sizes added.</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                  {formData.variants.length === 0 && <p className="text-sm text-gray-500 italic">No variants added. Please add at least one color variant.</p>}
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
                  <input type="checkbox" id="allow_reviews" checked={formData.allow_reviews ?? true} onChange={(e) => setFormData({ ...formData, allow_reviews: e.target.checked })}
                    className="w-4 h-4 text-[#08183A]" />
                  <label htmlFor="allow_reviews" className="text-sm font-sans font-semibold text-[#08183A] cursor-pointer">Allow Customer Reviews</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="is_festive" checked={formData.is_festive || false} onChange={(e) => setFormData({ ...formData, is_festive: e.target.checked })}
                    className="w-4 h-4 text-[#08183A]" />
                  <label htmlFor="is_festive" className="text-sm font-sans font-semibold text-[#08183A] cursor-pointer">Festive Collection</label>
                </div>
              </div>

              {/* Product Details Section */}
              <div className="pt-3 border-t border-[#08183A]/10">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-serif font-bold text-[#08183A]">Product Details</label>
                  <button onClick={addDetail} className="text-xs bg-[#08183A] text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-[#D4AF37]"><Plus className="w-3 h-3"/> Add Detail</button>
                </div>
                <p className="text-[10px] text-gray-400 mb-3">Add specs like Material, Weight, Purity, Finish, etc. These show in the "Details" tab on the product page.</p>
                <div className="space-y-2">
                  {(formData.details || []).map((detail, dIndex) => (
                    <div key={dIndex} className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200">
                      <input
                        value={detail.label}
                        onChange={e => updateDetailField(dIndex, 'label', e.target.value)}
                        placeholder="Label (e.g. Material)"
                        className="flex-1 px-2 py-1.5 bg-white border border-gray-200 rounded text-sm focus:outline-none"
                      />
                      <input
                        value={detail.value}
                        onChange={e => updateDetailField(dIndex, 'value', e.target.value)}
                        placeholder="Value (e.g. 18K Gold)"
                        className="flex-1 px-2 py-1.5 bg-white border border-gray-200 rounded text-sm focus:outline-none"
                      />
                      <button onClick={() => removeDetail(dIndex)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  ))}
                  {(!formData.details || formData.details.length === 0) && <p className="text-sm text-gray-500 italic">No product details added yet.</p>}
                </div>
              </div>

              {/* Reviews Section */}
              <div className="pt-3 border-t border-[#08183A]/10">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-serif font-bold text-[#08183A]">Reviews</label>
                  <button onClick={addReview} className="text-xs bg-[#08183A] text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-[#D4AF37]"><Plus className="w-3 h-3"/> Add Review</button>
                </div>
                
                <div className="space-y-4">
                  {formData.reviews.map((review, rIndex) => (
                    <div key={rIndex} className="bg-gray-50 border border-gray-200 p-4 rounded-xl relative">
                      <button onClick={() => removeReview(rIndex)} className="absolute top-3 right-3 text-red-500 hover:bg-red-100 p-1.5 rounded"><Trash2 className="w-4 h-4"/></button>
                      <div className="grid grid-cols-2 gap-3 pr-10 mb-3">
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Name</label>
                          <input value={review.name} onChange={e => updateReviewField(rIndex, 'name', e.target.value)} className="w-full px-2 py-1.5 text-sm bg-white border border-gray-200 rounded focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Rating</label>
                          <select value={review.rating} onChange={e => updateReviewField(rIndex, 'rating', Number(e.target.value))} className="w-full px-2 py-1.5 text-sm bg-white border border-gray-200 rounded focus:outline-none">
                            {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Color (Optional)</label>
                          <input value={review.color || ""} onChange={e => updateReviewField(rIndex, 'color', e.target.value)} className="w-full px-2 py-1.5 text-sm bg-white border border-gray-200 rounded focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Size (Optional)</label>
                          <input value={review.size || ""} onChange={e => updateReviewField(rIndex, 'size', e.target.value)} className="w-full px-2 py-1.5 text-sm bg-white border border-gray-200 rounded focus:outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Comment</label>
                        <textarea value={review.comment} onChange={e => updateReviewField(rIndex, 'comment', e.target.value)} rows={2} className="w-full px-2 py-1.5 text-sm bg-white border border-gray-200 rounded focus:outline-none resize-none" />
                      </div>
                    </div>
                  ))}
                  {formData.reviews.length === 0 && <p className="text-sm text-gray-500 italic">No reviews yet.</p>}
                </div>
              </div>
            </div>
            
            <div className="border-t border-[#08183A]/10 px-6 py-4 flex gap-3 shrink-0 bg-white">
              <button onClick={() => setEditProduct(null)} className="flex-1 px-4 py-2 bg-[#FDF8F0] text-[#08183A] rounded-xl font-semibold hover:bg-[#FDF8F0]/70">Cancel</button>
              <button onClick={handleSave} disabled={saving || uploading || !formData.name || formData.variants.length === 0} className="flex-1 px-4 py-2 bg-[#08183A] text-white rounded-xl font-semibold flex justify-center items-center gap-2 disabled:opacity-50 hover:bg-[#D4AF37] transition-colors">
                {saving ? "Saving..." : <><Save className="w-4 h-4" /> Save</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
