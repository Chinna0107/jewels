import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Type, Link as LinkIcon } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

export function AdminSettingsPage() {
  const { token } = useAuthStore();
  const { showToast } = useToastStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [announcement, setAnnouncement] = useState({
    text: '',
    link: '',
    is_active: false
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/admin/settings/announcement`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.announcement) {
          setAnnouncement({
            text: data.announcement.text || '',
            link: data.announcement.link || '',
            is_active: data.announcement.is_active || false
          });
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
        showToast('Failed to load settings', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [token, showToast]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/settings/announcement`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(announcement)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Settings saved successfully!');
      } else {
        showToast(data.error || 'Failed to save settings', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#08183A]/20 border-t-[#08183A] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#08183A]">Site Settings</h1>
        <p className="text-[#08183A]/60 font-sans mt-1">Manage global website configuration</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#08183A]/10 shadow-sm overflow-hidden">
        <div className="border-b border-[#08183A]/10 px-6 py-4 flex items-center gap-3 bg-[#FDF8F0]">
          <AlertCircle className="w-5 h-5 text-[#D4AF37]" />
          <h2 className="font-bold text-[#08183A]">Header Announcement Bar</h2>
        </div>
        
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3 bg-[#08183A]/5 p-4 rounded-xl">
            <input 
              type="checkbox" 
              id="announcement_active"
              checked={announcement.is_active}
              onChange={(e) => setAnnouncement({...announcement, is_active: e.target.checked})}
              className="w-5 h-5 accent-[#08183A] cursor-pointer rounded"
            />
            <label htmlFor="announcement_active" className="font-bold text-[#08183A] cursor-pointer">
              Enable Announcement Bar
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-[#08183A]/70 mb-1.5 flex items-center gap-2">
                <Type className="w-4 h-4" /> Announcement Text
              </label>
              <input 
                type="text"
                placeholder="e.g. Free shipping on all orders over $500!"
                value={announcement.text}
                onChange={(e) => setAnnouncement({...announcement, text: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#08183A]/20 focus:outline-none focus:border-[#D4AF37] text-[#08183A]"
              />
            </div>
            
            <div>
              <label className="text-sm font-bold text-[#08183A]/70 mb-1.5 flex items-center gap-2">
                <LinkIcon className="w-4 h-4" /> Link URL (Optional)
              </label>
              <input 
                type="text"
                placeholder="e.g. /offers or https://example.com"
                value={announcement.link}
                onChange={(e) => setAnnouncement({...announcement, link: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#08183A]/20 focus:outline-none focus:border-[#D4AF37] text-[#08183A]"
              />
              <p className="text-xs text-[#08183A]/50 mt-1.5 ml-1">Leave blank if the text shouldn't be clickable.</p>
            </div>
          </div>
          
          <div className="pt-2">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-[#08183A] hover:bg-[#D4AF37] text-white px-6 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>Saving...</>
              ) : (
                <><Save className="w-4 h-4" /> Save Settings</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
