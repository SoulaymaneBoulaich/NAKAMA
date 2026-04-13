import React, { useState } from 'react';
import api from '../../api/axios';
import { X, ChevronRight, ChevronLeft, Upload, Info, Plus, Trash2 } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateCommunityModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Action',
    avatarUrl: '',
    bannerUrl: '',
    rules: ['']
  });

  const categories = ['Action', 'Romance', 'Fantasy', 'Sci-Fi', 'Slice of Life', 'Shonen', 'Seinen'];

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const updateRule = (index: number, value: string) => {
    const newRules = [...formData.rules];
    newRules[index] = value;
    setFormData({ ...formData, rules: newRules });
  };

  const addRule = () => setFormData({ ...formData, rules: [...formData.rules, ''] });
  const removeRule = (index: number) => {
    if (formData.rules.length === 1) return;
    setFormData({ ...formData, rules: formData.rules.filter((_, i) => i !== index) });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      setLoading(true);
      await api.post('/communities', {
        name: formData.name,
        description: formData.description,
        avatarUrl: formData.avatarUrl,
        bannerUrl: formData.bannerUrl
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create community');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-black/60 font-medium">
      <div className="bg-zinc-950 border border-[var(--border-color)] w-full max-w-xl rounded-[2.5rem] shadow-2xl shadow-red-900/10 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-10 pt-10 pb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black tracking-[0.3em] text-red-600 bg-red-600/10 px-2 py-0.5 rounded-full uppercase">Protocol 01</span>
              <h2 className="text-sm font-black text-zinc-500 tracking-widest uppercase">Community Forge</h2>
            </div>
            <h3 className="text-3xl font-black text-white italic tracking-tighter">
              {step === 1 ? 'BASIC SPECS' : step === 2 ? 'VISUAL CORE' : 'RULES OF ENGAGEMENT'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-900 rounded-full text-zinc-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-10 mb-8 flex gap-2">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-red-600 shadow-sm shadow-red-600/50' : 'bg-zinc-800'}`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="px-10 pb-10 flex-1 overflow-y-auto max-h-[60vh] scrollbar-hide">
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-900/50 text-red-400 text-sm rounded-2xl font-bold flex items-center gap-3">
              <Info size={18} /> {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-zinc-500 tracking-widest uppercase mb-2">Community Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Chainsaw Man Cult"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-zinc-900 border border-[var(--border-color)] rounded-2xl py-4 px-6 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-red-600/50 transition-all font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-zinc-500 tracking-widest uppercase mb-2">Detailed Purpose (Bio)</label>
                <textarea 
                  rows={4}
                  placeholder="What is this community about?"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-zinc-900 border border-[var(--border-color)] rounded-2xl py-4 px-6 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-red-600/50 transition-all font-bold resize-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-zinc-500 tracking-widest uppercase mb-2">Primary Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(c => (
                    <button
                      key={c}
                      onClick={() => setFormData({...formData, category: c})}
                      className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all ${
                        formData.category === c 
                        ? 'bg-red-600/10 border-red-600/50 text-red-500 shadow-lg shadow-red-600/5' 
                        : 'bg-zinc-900 border-[var(--border-color)] text-zinc-500 hover:border-zinc-700'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 text-center">
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-zinc-500 tracking-widest uppercase text-left">Avatar URL</label>
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-[var(--border-color)] flex items-center justify-center shrink-0 overflow-hidden shadow-lg shadow-black">
                    {formData.avatarUrl ? <img src={formData.avatarUrl} className="w-full h-full object-cover" /> : <Upload size={24} className="text-zinc-700" />}
                  </div>
                  <input 
                    type="text"
                    placeholder="https://..."
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData({...formData, avatarUrl: e.target.value})}
                    className="flex-1 bg-zinc-900 border border-[var(--border-color)] rounded-2xl py-4 px-6 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-red-600/50 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-black text-zinc-500 tracking-widest uppercase text-left">Banner URL</label>
                <div className="h-32 rounded-2xl bg-zinc-900 border border-[var(--border-color)] flex flex-col items-center justify-center overflow-hidden relative shadow-lg shadow-black">
                  {formData.bannerUrl ? (
                    <img src={formData.bannerUrl} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Upload size={24} className="text-zinc-700 mb-2" />
                      <span className="text-[10px] text-zinc-600 font-black uppercase">Cover Preview</span>
                    </>
                  )}
                </div>
                <input 
                  type="text"
                  placeholder="https://..."
                  value={formData.bannerUrl}
                  onChange={(e) => setFormData({...formData, bannerUrl: e.target.value})}
                  className="w-full bg-zinc-900 border border-[var(--border-color)] rounded-2xl py-4 px-6 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-red-600/50 font-bold"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-zinc-500 text-sm font-bold bg-zinc-900/50 p-4 rounded-2xl border border-dashed border-[var(--border-color)] mb-6">
                Establish the hierarchy. These will be displayed on your niche page.
              </p>
              {formData.rules.map((rule, index) => (
                <div key={index} className="flex gap-2 animate-in slide-in-from-left-4 duration-300">
                  <div className="bg-zinc-900 border border-[var(--border-color)] rounded-2xl flex items-center justify-center w-12 shrink-0 text-red-600/50 font-black italic">
                    {index + 1}
                  </div>
                  <input 
                    type="text"
                    placeholder="Rule description..."
                    value={rule}
                    onChange={(e) => updateRule(index, e.target.value)}
                    className="flex-1 bg-zinc-900 border border-[var(--border-color)] rounded-2xl py-4 px-6 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-red-600/50 font-bold"
                  />
                  <button 
                    onClick={() => removeRule(index)}
                    className="p-4 text-zinc-600 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
              <button 
                onClick={addRule}
                className="w-full py-4 rounded-2xl border border-dashed border-[var(--border-color)] text-zinc-500 hover:border-zinc-700 hover:text-zinc-300 font-bold transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} /> ADD RULE
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-10 py-8 bg-zinc-950 border-t border-zinc-900 flex justify-between">
          {step > 1 ? (
            <button 
              onClick={handleBack}
              className="flex items-center gap-2 text-zinc-500 hover:text-zinc-100 font-black tracking-widest text-sm transition-colors uppercase disabled:opacity-50"
              disabled={loading}
            >
              <ChevronLeft size={20} /> Back
            </button>
          ) : <div />}

          {step < 3 ? (
            <button 
              onClick={handleNext}
              disabled={!formData.name}
              className="flex items-center gap-2 bg-zinc-100 text-black hover:bg-white px-8 py-3 rounded-full font-black tracking-widest text-sm transition-all transform active:scale-95 disabled:opacity-20 uppercase"
            >
              Next <ChevronRight size={20} />
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 px-10 py-3 rounded-full font-black tracking-widest text-sm transition-all transform active:scale-95 shadow-xl shadow-red-900/20 uppercase"
            >
              {loading ? 'FORGING...' : 'FINALIZE FORGE'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateCommunityModal;
