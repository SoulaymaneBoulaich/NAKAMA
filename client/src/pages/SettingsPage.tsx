import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppearance } from '../context/AppearanceContext';
import api from '../api/axios';
import type { Visibility } from '../../../shared/types';
import { 
  Lock, Eye, Palette, 
  Shield, User as UserIcon, CheckCircle, 
  Download, ChevronRight, Camera, MapPin, Phone, Mail, 
  Type, Maximize, AlertTriangle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type SettingsTab = 'identity' | 'contact' | 'appearance' | 'recommendations' | 'security' | 'privacy' | 'data';

const SettingsPage: React.FC = () => {
  const { user, refreshSession } = useAuth();
  const { settings: appearance, updateSettings: updateAppearance, themes, accents } = useAppearance();
  
  const [activeTab, setActiveTab] = useState<SettingsTab>('identity');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recData, setRecData] = useState<any>(null);

  // Form States
  const [profileForm, setProfileForm] = useState({
    username: user?.username || '',
    fullName: user?.fullName || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    banner: user?.banner || '',
    phoneNumber: user?.phoneNumber || '',
    location: user?.location || '',
  });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [privacyForm, setPrivacyForm] = useState({
    profileVisibility: 'PUBLIC' as Visibility,
    searchIndexable: true,
    showOnlineStatus: true,
    showActivityStatus: true,
    showStats: false,
    showTopTen: false,
    showFingerprint: false,
  });

  const [notificationForm, setNotificationForm] = useState({
    marketingEmails: true,
    systemAlerts: true,
    pushNotifications: true,
  });

  // Load Privacy/Notification settings
  useEffect(() => {
    const fetchFullSettings = async () => {
      try {
        const { data } = await api.get('/user/me/full-settings');
        setPrivacyForm({
          ...data.privacy,
          searchIndexable: data.identity.searchIndexable,
          showOnlineStatus: data.identity.showOnlineStatus,
          showActivityStatus: data.identity.showActivityStatus,
        });
        setNotificationForm(data.notifications || notificationForm);
        // Sync profile form too
        setProfileForm(prev => ({
          ...prev,
          fullName: data.identity.fullName || '',
          phoneNumber: data.identity.phoneNumber || '',
          location: data.identity.location || '',
        }));
      } catch (err) {
        console.error("Failed to fetch full settings", err);
      }
    };
    if (user) fetchFullSettings();
  }, [user]);

  const fetchRecSettings = async () => {
    try {
      await api.get('/api/recommendations/personalized?limit=5'); // Just to check if it works
      const affinityRes = await api.get('/api/recommendations/affinities');
      setRecData(affinityRes.data);
    } catch (err) {
      console.error("Failed to fetch rec settings", err);
    }
  };

  useEffect(() => {
    if (activeTab === 'recommendations' && user) {
      fetchRecSettings();
    }
  }, [activeTab, user]);

  const handleRegenerateCache = async () => {
    setLoading(true);
    try {
      await api.post('/api/recommendations/regenerate');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Cache regeneration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/user/me', profileForm);
      await refreshSession();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSecuritySave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await api.post('/user/me/change-password', {
        currentPassword: securityForm.currentPassword,
        newPassword: securityForm.newPassword,
      });
      setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Password update failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacySave = async () => {
    setLoading(true);
    try {
      await api.put('/user/me/privacy', privacyForm);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Privacy update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const { data } = await api.get('/user/me/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nakama_data_${user?.username}.json`;
      link.click();
    } catch (err) {
      setError("Export failed");
    }
  };

  const handleDeactivate = async () => {
    if (window.confirm("Are you sure you want to deactivate your account? You can reactivate it by logging back in within 30 days.")) {
      try {
        await api.delete('/user/me/deactivate');
        // Clear auth and redirect
        window.location.href = '/';
      } catch (err) {
        setError("Deactivation failed");
      }
    }
  };

  const tabs: { id: SettingsTab; label: string; icon: any }[] = [
    { id: 'identity', label: 'Identity', icon: UserIcon },
    { id: 'contact', label: 'Contact', icon: Mail },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'recommendations', label: 'Recommendations', icon: CheckCircle }, // Changed icon to checkcircle for now or find better
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'data', label: 'Account & Data', icon: Download },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-20 px-4 transition-colors duration-500">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <aside className="lg:w-72 flex-shrink-0">
          <div className="sticky top-28 space-y-2">
            <header className="px-4 mb-6">
              <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Command</h1>
              <p className="text-[var(--accent-primary)] text-xs font-bold uppercase tracking-[0.2em]">Profile Terminal</p>
            </header>
            
            <nav className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-lg transition-all group ${
                    activeTab === tab.id 
                      ? 'bg-[var(--accent-primary)] text-white shadow-lg shadow-[var(--accent-primary)]/20' 
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon size={18} className={activeTab === tab.id ? 'text-white' : 'group-hover:text-[var(--accent-primary)]'} />
                    <span className="text-sm font-bold uppercase tracking-tight">{tab.label}</span>
                  </div>
                  <ChevronRight size={14} className={activeTab === tab.id ? 'opacity-100' : 'opacity-0'} />
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-grow min-w-0">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-2xl">
            <AnimatePresence mode="wait">
              {activeTab === 'identity' && (
                <motion.div
                  key="identity"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-8 lg:p-12 space-y-10"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative group cursor-pointer">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[var(--bg-tertiary)] bg-[var(--bg-tertiary)]">
                        {profileForm.avatar ? (
                          <img src={profileForm.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            <UserIcon size={32} />
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full transition-opacity">
                        <Camera size={24} className="text-white" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white italic uppercase">Profile Identity</h2>
                      <p className="text-[var(--text-secondary)] text-sm uppercase font-bold tracking-widest">Public representation</p>
                    </div>
                  </div>

                  <form onSubmit={handleProfileSave} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-primary)]">Username</label>
                        <input 
                          type="text"
                          value={profileForm.username}
                          onChange={e => setProfileForm({...profileForm, username: e.target.value})}
                          className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl p-4 text-white focus:outline-none focus:border-[var(--accent-primary)] transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-primary)]">Full Name</label>
                        <input 
                          type="text"
                          value={profileForm.fullName}
                          onChange={e => setProfileForm({...profileForm, fullName: e.target.value})}
                          className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl p-4 text-white focus:outline-none focus:border-[var(--accent-primary)] transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-primary)]">Bio</label>
                        <span className={`text-[10px] font-bold ${profileForm.bio.length > 150 ? 'text-red-500' : 'text-gray-500'}`}>
                          {profileForm.bio.length}/200
                        </span>
                      </div>
                      <textarea 
                        rows={5}
                        maxLength={200}
                        value={profileForm.bio}
                        onChange={e => setProfileForm({...profileForm, bio: e.target.value})}
                        className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl p-4 text-white focus:outline-none focus:border-[var(--accent-primary)] transition-all resize-none"
                        placeholder="Share your story..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-primary)]">Avatar URL</label>
                        <input 
                          type="text"
                          value={profileForm.avatar}
                          onChange={e => setProfileForm({...profileForm, avatar: e.target.value})}
                          className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl p-4 text-white focus:outline-none focus:border-[var(--accent-primary)] transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-primary)]">Banner URL</label>
                        <input 
                          type="text"
                          value={profileForm.banner}
                          onChange={e => setProfileForm({...profileForm, banner: e.target.value})}
                          className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl p-4 text-white focus:outline-none focus:border-[var(--accent-primary)] transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-4 pt-4">
                      {success && <span className="text-green-500 text-xs font-bold uppercase tracking-widest">Saved Successfully</span>}
                      <button 
                        type="submit"
                        disabled={loading}
                        className="bg-white text-black px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[var(--accent-primary)] hover:text-white transition-all disabled:opacity-50"
                      >
                        {loading ? 'Processing...' : 'Sync Profile'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {activeTab === 'contact' && (
                <motion.div
                  key="contact"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-8 lg:p-12 space-y-10"
                >
                  <div>
                    <h2 className="text-2xl font-black text-white italic uppercase">Communication</h2>
                    <p className="text-[var(--text-secondary)] text-sm uppercase font-bold tracking-widest">How we reach you</p>
                  </div>

                  <form onSubmit={handleProfileSave} className="space-y-10">
                    <div className="grid grid-cols-1 gap-8">
                       <div className="flex items-start gap-4 p-6 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-2xl">
                        <Mail className="text-[var(--accent-primary)] mt-1" size={20} />
                        <div className="space-y-1 flex-grow">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Email Address</label>
                          <input 
                            type="email"
                            value={user?.email || ''}
                            readOnly
                            className="w-full bg-transparent text-white focus:outline-none opacity-60 cursor-not-allowed"
                          />
                          <p className="text-[9px] text-gray-600 uppercase font-black tracking-tighter">Primary identifier (Immutable)</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-6 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-2xl">
                        <Phone className="text-[var(--accent-primary)] mt-1" size={20} />
                        <div className="space-y-1 flex-grow">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Phone Number</label>
                          <input 
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            value={profileForm.phoneNumber}
                            onChange={e => setProfileForm({...profileForm, phoneNumber: e.target.value})}
                            className="w-full bg-transparent text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-6 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-2xl">
                        <MapPin className="text-[var(--accent-primary)] mt-1" size={20} />
                        <div className="space-y-1 flex-grow">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Location</label>
                          <input 
                            type="text"
                            placeholder="Tokyo, NEON-7"
                            value={profileForm.location}
                            onChange={e => setProfileForm({...profileForm, location: e.target.value})}
                            className="w-full bg-transparent text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-4 pt-4">
                      <button 
                         type="submit"
                        className="bg-white text-black px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[var(--accent-primary)] hover:text-white transition-all"
                      >
                        Push Updates
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {activeTab === 'appearance' && (
                <motion.div
                  key="appearance"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-8 lg:p-12 space-y-12"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-white italic uppercase">Aesthetics</h2>
                      <p className="text-[var(--text-secondary)] text-sm uppercase font-bold tracking-widest">Interface synchronization</p>
                    </div>
                    <CheckCircle className={success ? "text-green-500" : "text-gray-800"} size={24} />
                  </div>

                  {/* Theme Swatches */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-primary)]">Theme Matrix</label>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {themes.map(t => (
                        <button
                          key={t}
                          onClick={() => updateAppearance({ theme: t })}
                          className={`relative h-24 rounded-2xl overflow-hidden border-2 transition-all ${
                            appearance.theme === t ? 'border-[var(--accent-primary)] scale-105' : 'border-transparent hover:border-gray-700'
                          }`}
                        >
                          <div className={`absolute inset-0 theme-preview-${t.toLowerCase().replace(' ', '.')} flex items-center justify-center`}>
                            <span className="text-[10px] font-black uppercase italic tracking-tighter text-white drop-shadow-md text-center px-2">{t}</span>
                          </div>
                          {appearance.theme === t && (
                            <div className="absolute top-2 right-2 bg-[var(--accent-primary)] rounded-full p-1">
                              <CheckCircle size={10} className="text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Accent Colors */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-primary)]">Accent Frequency</label>
                    <div className="flex flex-wrap gap-3">
                      {accents.map(color => (
                        <button
                          key={color}
                          onClick={() => updateAppearance({ accentColor: color })}
                          className={`w-12 h-12 rounded-full border-4 transition-all ${
                            appearance.accentColor === color ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                          }`}
                          style={{ backgroundColor: 
                            color === 'White' ? '#FFFFFF' :
                            color === 'Vivid Purple' ? '#BE95FF' :
                            color === 'Crimson Red' ? '#DC2626' :
                            color === 'Pink Pastel' ? '#F5C2E7' :
                            color === 'Ivory Bronze' ? '#D4A373' :
                            color === 'Olive Green' ? '#A3B18A' :
                            color === 'Red' ? '#dc2626' : 
                            color === 'Indigo' ? '#6366f1' : 
                            color === 'Emerald' ? '#10b981' : 
                            color === 'Rose' ? '#f43f5e' : 
                            color === 'Amber' ? '#f59e0b' : '#0ea5e9' 
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {/* Typography */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-primary)]">Signal Font</label>
                      <div className="space-y-2">
                        {(['Sans-Serif', 'Serif', 'Monospace'] as const).map(f => (
                          <button
                            key={f}
                            onClick={() => updateAppearance({ typography: f })}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                              appearance.typography === f 
                                ? 'bg-[var(--bg-tertiary)] border-[var(--accent-primary)] text-white' 
                                : 'bg-[var(--bg-tertiary)] border-transparent text-gray-500 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Type size={18} />
                              <span className={`text-sm font-bold ${f === 'Serif' ? 'font-serif' : f === 'Monospace' ? 'font-mono' : ''}`}>{f}</span>
                            </div>
                            {appearance.typography === f && <CheckCircle size={14} className="text-[var(--accent-primary)]" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Layout Density */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-primary)]">Signal Density</label>
                      <div className="space-y-2">
                        {(['COMFORTABLE', 'COMPACT'] as const).map(d => (
                          <button
                            key={d}
                            onClick={() => updateAppearance({ layoutDensity: d })}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                              appearance.layoutDensity === d 
                                ? 'bg-[var(--bg-tertiary)] border-[var(--accent-primary)] text-white' 
                                : 'bg-[var(--bg-tertiary)] border-transparent text-gray-500 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Maximize size={18} />
                              <span className="text-sm font-bold uppercase tracking-tight">{d.toLowerCase()}</span>
                            </div>
                            {appearance.layoutDensity === d && <CheckCircle size={14} className="text-[var(--accent-primary)]" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'recommendations' && (
                <motion.div
                  key="recommendations"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 lg:p-12 space-y-12"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-white italic uppercase">Neural Alignment</h2>
                      <p className="text-[var(--text-secondary)] text-sm uppercase font-bold tracking-widest">Personalization frequency</p>
                    </div>
                  </div>

                  {/* Cache Status */}
                  <div className="p-8 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-3xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-6">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
                     </div>
                     <div className="space-y-6">
                        <div>
                          <h3 className="text-xl font-black text-white italic uppercase mb-1">Recommendation Engine</h3>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Status: Active & Synchronized</p>
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed max-w-xl">
                          The NAKAMA recommendation engine analyzes your interactions, ratings, and search behavior to calculate your unique tag affinities. This data is used to synthesize a personalized "Neural Resonance" feed in your Explore tab.
                        </p>
                        <button 
                          onClick={handleRegenerateCache}
                          disabled={loading}
                          className="px-8 py-4 bg-white text-black rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[var(--accent-primary)] hover:text-white transition-all disabled:opacity-50"
                        >
                          {loading ? 'Re-aligning...' : 'Regenerate Neural Cache'}
                        </button>
                     </div>
                  </div>

                  {/* Tag Affinities */}
                  <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-primary)]">Your Affinity Matrix</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recData && recData.length > 0 ? recData.map((affinity: any) => (
                        <div key={affinity.tag} className="p-4 bg-[var(--bg-tertiary)]/50 border border-[var(--border-color)] rounded-2xl space-y-3">
                           <div className="flex justify-between items-center">
                              <span className="text-xs font-black uppercase text-white tracking-widest italic">{affinity.tag}</span>
                              <span className="text-[10px] font-bold text-[var(--accent-primary)]">{(affinity.affinityScore * 10).toFixed(1)}%</span>
                           </div>
                           <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(affinity.affinityScore / 10) * 100}%` }}
                                className="h-full bg-[var(--accent-primary)]"
                              />
                           </div>
                        </div>
                      )) : (
                        <div className="col-span-full py-20 text-center border border-dashed border-white/5 rounded-3xl">
                           <p className="text-xs font-bold text-white/20 uppercase tracking-[0.2em]">Insufficent data to calculate resonance.</p>
                           <p className="text-[9px] text-white/10 uppercase font-black mt-2">Start interacting with anime to build your matrix.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}


              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-8 lg:p-12 space-y-10"
                >
                  <div>
                    <h2 className="text-2xl font-black text-white italic uppercase">Access Control</h2>
                    <p className="text-[var(--text-secondary)] text-sm uppercase font-bold tracking-widest">Encryption protocols</p>
                  </div>

                  <form onSubmit={handleSecuritySave} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Current Password</label>
                      <input 
                        type="password"
                        value={securityForm.currentPassword}
                        onChange={e => setSecurityForm({...securityForm, currentPassword: e.target.value})}
                        className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl p-4 text-white focus:outline-none focus:border-[var(--accent-primary)]"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">New Password</label>
                        <input 
                          type="password"
                          value={securityForm.newPassword}
                          onChange={e => setSecurityForm({...securityForm, newPassword: e.target.value})}
                          className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl p-4 text-white focus:outline-none focus:border-[var(--accent-primary)]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Confirm New Password</label>
                        <input 
                          type="password"
                          value={securityForm.confirmPassword}
                          onChange={e => setSecurityForm({...securityForm, confirmPassword: e.target.value})}
                          className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl p-4 text-white focus:outline-none focus:border-[var(--accent-primary)]"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex flex-col items-end gap-3">
                      {error && <span className="text-red-500 text-xs font-bold uppercase tracking-widest">{error}</span>}
                      {success && <span className="text-green-500 text-xs font-bold uppercase tracking-widest">Update Authorized</span>}
                      <button 
                        type="submit"
                        disabled={loading}
                        className="bg-white text-black px-12 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs hover:bg-[var(--accent-primary)] hover:text-white transition-all disabled:opacity-50"
                      >
                        {loading ? 'Processing...' : 'Recode Key'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {activeTab === 'privacy' && (
                <motion.div
                   key="privacy"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-8 lg:p-12 space-y-10"
                >
                  <div>
                    <h2 className="text-2xl font-black text-white italic uppercase">Cloaking</h2>
                    <p className="text-[var(--text-secondary)] text-sm uppercase font-bold tracking-widest">Visibility filters</p>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-primary)]">Public Visibility</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {(['PUBLIC', 'PRIVATE', 'UNLISTED'] as const).map(v => (
                        <button
                          key={v}
                          onClick={() => setPrivacyForm({...privacyForm, profileVisibility: v})}
                          className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                            privacyForm.profileVisibility === v ? 'border-[var(--accent-primary)] bg-[var(--bg-tertiary)]' : 'border-[var(--border-color)] hover:border-gray-700'
                          }`}
                        >
                          <Eye size={20} className={privacyForm.profileVisibility === v ? "text-[var(--accent-primary)]" : "text-gray-600"} />
                          <span className="text-xs font-black uppercase tracking-widest text-white">{v}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-[var(--border-color)]">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-primary)]">Global Signals</label>
                    <div className="space-y-3">
                      {[
                        { key: 'searchIndexable', label: 'Allow Search Engine Indexing', desc: 'Allow crawlers to discover your profile' },
                        { key: 'showOnlineStatus', label: 'Display Online Status', desc: 'Sync your heartbeat with others' },
                        { key: 'showActivityStatus', label: 'Broadcast Activity', desc: 'Show what you are currently watching/writing' },
                        { key: 'showStats', label: 'Display Statistics', desc: 'Expose total counts to visitors' },
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--border-color)]">
                          <div>
                            <p className="text-sm font-black text-white uppercase italic tracking-tighter">{item.label}</p>
                            <p className="text-[10px] text-gray-500 uppercase font-bold">{item.desc}</p>
                          </div>
                          <button 
                            onClick={() => setPrivacyForm({ ...privacyForm, [item.key]: !privacyForm[item.key as keyof typeof privacyForm] })}
                            className={`w-12 h-6 rounded-full transition-colors relative ${privacyForm[item.key as keyof typeof privacyForm] ? 'bg-[var(--accent-primary)]' : 'bg-gray-800'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${privacyForm[item.key as keyof typeof privacyForm] ? 'right-1' : 'left-1'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button 
                      onClick={handlePrivacySave}
                      className="bg-white text-black px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[var(--accent-primary)] hover:text-white transition-all"
                    >
                      Update Privacy
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'data' && (
                <motion.div
                  key="data"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-8 lg:p-12 space-y-12"
                >
                  <div>
                    <h2 className="text-2xl font-black text-white italic uppercase">Storage & Archive</h2>
                    <p className="text-[var(--text-secondary)] text-sm uppercase font-bold tracking-widest">Self-custody of existence</p>
                  </div>

                  <div className="group p-8 border border-[var(--border-color)] hover:border-blue-500/50 rounded-3xl bg-[var(--bg-tertiary)] transition-all">
                    <div className="flex items-start gap-4 mb-6">
                      <Download className="text-blue-500" size={32} />
                      <div>
                        <h3 className="text-xl font-black text-white italic uppercase mb-1">Mirror Download</h3>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Download a complete JSON record of all your ratings, posts, playlists, and profile data.</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleExportData}
                      className="w-full bg-blue-600/10 text-blue-500 border border-blue-600/20 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-600 hover:text-white transition-all"
                    >
                      Initialize Export
                    </button>
                  </div>

                  <div className="p-8 border-2 border-red-900/50 rounded-3xl bg-red-950/20">
                    <div className="flex items-start gap-4 mb-6">
                      <AlertTriangle className="text-red-600" size={32} />
                      <div>
                        <h3 className="text-xl font-black text-red-500 italic uppercase mb-1">Danger Zone</h3>
                        <p className="text-xs text-red-700 font-bold uppercase tracking-widest">Fragile operations. Proceed with extreme caution.</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-red-900/30">
                        <div>
                          <p className="text-sm font-black text-white uppercase italic tracking-tighter">Deactivate Account</p>
                          <p className="text-[10px] text-red-800 uppercase font-black">Account becomes invisible. Revokable within 30 days.</p>
                        </div>
                        <button 
                          onClick={handleDeactivate}
                          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all"
                        >
                          Execute
                        </button>
                      </div>
                      
                      <button className="w-full text-red-900 hover:text-red-500 text-[10px] font-black uppercase tracking-[0.3em] py-2 transition-all opacity-40 hover:opacity-100">
                        Request Permanent Termination
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      <style>{`
        .theme-preview-monochrome { background: linear-gradient(135deg, #000000 0%, #171717 100%); }
        .theme-preview-obsidian { background: linear-gradient(135deg, #0A0B10 0%, #1E293B 100%); }
        .theme-preview-crimson { background: linear-gradient(135deg, #0F0505 0%, #450A0A 100%); }
        .theme-preview-catppuccin { background: linear-gradient(135deg, #1E1E2E 0%, #313244 100%); }
        .theme-preview-ivory { background: linear-gradient(135deg, #FFFFF0 0%, #D4A373 100%); }
        .theme-preview-olive { background: linear-gradient(135deg, #1B2613 0%, #3A4D32 100%); }
        
        .density-compact .p-8 { padding: 1rem !important; }
        .density-compact .lg\\:p-12 { padding: 1.5rem !important; }
        .density-compact .space-y-10 > * + * { margin-top: 1.5rem !important; }
        .density-compact input, .density-compact textarea { padding: 0.75rem !important; }
        
        .font-mono { font-family: var(--font-mono), monospace !important; }
        .font-serif { font-family: Georgia, serif !important; }
      `}</style>
    </div>
  );
};

export default SettingsPage;
