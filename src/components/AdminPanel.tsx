import { useState, useRef, useEffect } from 'react';
import { TimelineData, TimelineEvent, AxisLabel } from '../types';
import { RichTextEditor } from './RichTextEditor';
import { Plus, Trash2, Save, MoveLeft, MoveRight, Download, Upload, LogOut, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { VisualTimelineEditor } from './VisualTimelineEditor';
// Simple password gate configuration without Firebase auth login


interface AdminPanelProps {
  data: TimelineData;
  onSave: (data: TimelineData) => void;
}

interface TagsInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  eventId: string;
}

function TagsInput({ value, onChange, placeholder, eventId }: TagsInputProps) {
  const [localVal, setLocalVal] = useState(value?.join(', ') || '');
  const prevEventIdRef = useRef(eventId);

  useEffect(() => {
    if (prevEventIdRef.current !== eventId) {
      setLocalVal(value?.join(', ') || '');
      prevEventIdRef.current = eventId;
    }
  }, [eventId, value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setLocalVal(newVal);
    const tags = newVal.split(/[,，]/).map(t => t.trim()).filter(Boolean);
    onChange(tags);
  };

  return (
    <input
      type="text"
      value={localVal}
      onChange={handleChange}
      placeholder={placeholder}
      className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-orange-500 outline-none"
    />
  );
}

const getDecodedSecret = (): string => {
  const list = [119, 117, 116, 104, 101, 114, 105, 110, 103, 32, 119, 97, 118, 101, 32, 109, 97, 98, 105, 110, 111, 103, 105];
  return list.map(c => String.fromCharCode(c)).join('');
};

const getStorageSessionKey = (): string => {
  return '_g_state_sess_';
};

const getEncryptedSessionValue = (): string => {
  const secret = getDecodedSecret();
  try {
    return btoa(secret + '_session_valid_active_role_root');
  } catch (e) {
    return 'obfuscated_sess_value_fallbk';
  }
};

export function AdminPanel({ data: initialData, onSave }: AdminPanelProps) {
  const [data, setData] = useState<TimelineData>(initialData);
  const [activeTab, setActiveTab] = useState<'events' | 'settings' | 'visual'>('events');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(data.events[0]?.id || null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(getStorageSessionKey()) === getEncryptedSessionValue();
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const activeEventIndex = data.events.findIndex(e => e.id === selectedEventId);
  const activeEvent = data.events[activeEventIndex];

  const handleSettingsChange = (field: keyof TimelineData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleEventChange = (field: keyof TimelineEvent, value: any) => {
    if (activeEventIndex === -1) return;
    const newEvents = [...data.events];
    newEvents[activeEventIndex] = { ...newEvents[activeEventIndex], [field]: value };
    setData({ ...data, events: newEvents });
  };


  const addNewEvent = () => {
    const newId = Date.now().toString();
    const newEvent: TimelineEvent = {
      id: newId,
      title: 'New Event',
      date: new Date().toISOString().split('T')[0],
      mediaType: 'image',
      mediaUrl: '',
      content: '<p style="font-family: monospace; font-size: 20px; font-weight: bold;">New event content</p>',
      referenceImages: [],
      backgroundColor: '#ffffff',
      category: 'General'
    };
    setData({ ...data, events: [...data.events, newEvent] });
    setSelectedEventId(newId);
  };

  const deleteCurrentEvent = () => {
    if (activeEventIndex === -1) return;
    if (!confirm('Are you sure you want to delete this event?')) return;
    const newEvents = data.events.filter(e => e.id !== selectedEventId);
    setData({ ...data, events: newEvents });
    setSelectedEventId(newEvents[0]?.id || null);
  };

  const handleSave = () => {
    onSave(data);
    alert('Saved successfully!');
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportBackup = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timeline_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.events) {
          setData(parsed);
          setSelectedEventId(parsed.events[0]?.id || null);
          alert('Database imported successfully!');
        } else {
          alert('Invalid backup file structure.');
        }
      } catch (err) {
        alert('Error parsing backup file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Helper for reference images editing (simple textarea separated by newlines)
  const refImagesStr = activeEvent?.referenceImages?.join('\n') || '';
  const handleRefImagesChange = (val: string) => {
    const arr = val.split('\n').map(s => s.trim()).filter(s => s !== '');
    handleEventChange('referenceImages', arr);
  };

  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === dropIndex) return;

    const newEvents = [...data.events];
    const [draggedItem] = newEvents.splice(draggedItemIndex, 1);
    newEvents.splice(dropIndex, 0, draggedItem);
    
    setData({ ...data, events: newEvents });
    setDraggedItemIndex(null);
  };  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const secret = getDecodedSecret();
    if (emailInput.trim() === secret && passwordInput === secret) {
      setIsAuthenticated(true);
      localStorage.setItem(getStorageSessionKey(), getEncryptedSessionValue());
      setLoginError('');
    } else {
      setLoginError('非權限認證帳號。請檢查您的電子郵件或密碼是否正確！');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(getStorageSessionKey());
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f0f4f9] items-center justify-center font-sans text-[#1f1f1f] relative z-20 p-4 select-none w-full">
        {/* Google Card */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-xl border border-[#e3e3e3] max-w-md w-full text-left relative flex flex-col min-h-[500px] justify-between">
           <div>
             {/* Google Logo */}
             <div className="mb-6">
               <svg className="h-6 w-auto" viewBox="0 0 24 24" fill="none">
                 <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                 <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                 <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                 <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
               </svg>
             </div>

             <h2 className="text-2xl font-normal text-[#1f1f1f] mb-2 tracking-tight">登入</h2>
             <p className="text-sm text-[#1f1f1f] mb-6">使用您的 Google 帳戶</p>
             
             <form onSubmit={handlePasswordSubmit} className="space-y-4">
               <div>
                 <div className="relative">
                   <input
                     type="text"
                     placeholder="電子郵件地址或電話號碼"
                     value={emailInput}
                     onChange={(e) => setEmailInput(e.target.value)}
                     className={`w-full bg-white border ${loginError ? 'border-[#d93025] focus:ring-[#d93025]' : 'border-[#747775] focus:border-[#0b57d0]'} rounded-lg px-4 py-3.5 text-base text-[#1f1f1f] focus:ring-1 outline-none transition-all placeholder:text-[#5f6368]`}
                     autoFocus
                   />
                 </div>
               </div>

               <div>
                 <div className="relative">
                   <input
                     type="password"
                     placeholder="輸入您的密碼"
                     value={passwordInput}
                     onChange={(e) => setPasswordInput(e.target.value)}
                     className={`w-full bg-white border ${loginError ? 'border-[#d93025] focus:ring-[#d93025]' : 'border-[#747775] focus:border-[#0b57d0]'} rounded-lg px-4 py-3.5 text-base text-[#1f1f1f] focus:ring-1 outline-none transition-all placeholder:text-[#5f6368]`}
                   />
                 </div>
               </div>

               {loginError && (
                 <div className="flex items-center gap-2 text-[#d93025] text-xs font-normal mt-1">
                   <svg className="w-4 h-4 fill-[#d93025]" viewBox="0 0 24 24">
                     <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                   </svg>
                   <span>{loginError}</span>
                 </div>
               )}

               <div className="text-xs text-[#0b57d0] hover:underline cursor-pointer font-medium pt-1">
                 忘記電子郵件地址？
               </div>
             </form>
           </div>

           <div className="mt-8">
             <div className="text-xs text-[#5f6368] mb-6 leading-relaxed">
               這不是您的電腦嗎？請使用訪客模式進行私密瀏覽。
               <span className="text-[#0b57d0] hover:underline cursor-pointer font-medium ml-1">瞭解詳情</span>
             </div>

             <div className="flex justify-between items-center">
               <span className="text-xs text-[#0b57d0] hover:text-[#0b57d0]/80 cursor-pointer font-medium">
                 建立帳戶
               </span>
               <button 
                 onClick={handlePasswordSubmit}
                 className="bg-[#0b57d0] hover:bg-[#0842a0] text-white font-medium px-6 py-2.5 rounded-full transition-all text-sm cursor-pointer shadow-none"
               >
                 下一步
               </button>
             </div>
           </div>
        </div>

        {/* Footer Language Selection and links */}
        <div className="max-w-md w-full mt-4 flex justify-between items-center text-xs text-[#5f6368] px-2">
          <div className="flex items-center gap-1 cursor-pointer hover:bg-black/5 rounded p-2">
            <span>中文 (繁體)</span>
            <svg className="w-3 h-3 text-[#5f6368]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </div>
          <div className="flex gap-4 p-2">
            <span className="hover:text-[#3c4043] cursor-pointer">說明</span>
            <span className="hover:text-[#3c4043] cursor-pointer">隱私權</span>
            <span className="hover:text-[#3c4043] cursor-pointer">條款</span>
          </div>
        </div>

        {/* Return link disguised subtle */}
        <div className="mt-6">
          <Link to="/" className="text-xs text-gray-400 hover:text-gray-600 underline">
            返回前台時間軸
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-transparent font-sans text-[#e0e0e0] font-sans selection:bg-orange-500/30 relative z-10">
      {/* Sidebar */}
      <div className="w-64 bg-[#1a1a20] border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/5 flex flex-col gap-3 bg-[#0f0f12]">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-white tracking-widest uppercase text-xs">CMS Panel</h2>
            <div className="flex gap-2">
              <button onClick={handleSave} className="text-orange-400 hover:text-orange-300 flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest bg-orange-500/10 hover:bg-orange-500/20 px-2 py-1 rounded transition-colors">
                <Save size={14} /> Save
              </button>
              <Link to="/" className="text-gray-400 hover:text-white text-[10px] uppercase font-bold tracking-widest px-2 py-1 border border-white/10 rounded hover:bg-white/5 transition-colors flex items-center py-1">
                Back
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-between bg-black/30 p-2 rounded border border-white/5">
             <div className="text-[10px] font-mono text-gray-400 truncate font-semibold">管理員已登入</div>
             <button onClick={handleLogout} className="text-gray-400 hover:text-red-450 p-1" title="Sign Out">
                 <LogOut size={12} />
             </button>
          </div>
        </div>
        
        <div className="flex p-2 gap-2 border-b border-white/5 flex-wrap">
          <button 
            className={`flex-1 min-w-[30%] py-1 text-[10px] uppercase tracking-widest font-bold rounded transition-colors ${activeTab === 'events' ? 'bg-white/10 text-white' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}
            onClick={() => setActiveTab('events')}
          >
            Events
          </button>
          <button 
            className={`flex-1 min-w-[30%] py-1 text-[10px] uppercase tracking-widest font-bold rounded transition-colors ${activeTab === 'visual' ? 'bg-white/10 text-white' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}
            onClick={() => setActiveTab('visual')}
          >
            Visual Edit
          </button>
          <button 
            className={`flex-1 min-w-[30%] py-1 text-[10px] uppercase tracking-widest font-bold rounded transition-colors ${activeTab === 'settings' ? 'bg-white/10 text-white' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>

        {activeTab === 'events' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {[...data.events]
              .sort((a, b) => (a.positionX ?? 0) - (b.positionX ?? 0))
              .map((event) => (
                <div 
                  key={event.id}
                  onClick={() => setSelectedEventId(event.id)}
                  className={`p-3 border-b border-white/5 cursor-pointer transition-colors ${selectedEventId === event.id ? 'bg-orange-500/10 border-l-4 border-l-orange-500' : 'hover:bg-white/5 border-l-4 border-l-transparent'}`}
                >
                  <div className="text-sm font-medium text-white truncate font-serif">{event.title || 'Untitled'}</div>
                  <div className="text-[10px] font-mono tracking-widest text-orange-500/70">{event.date}</div>
                </div>
              ))}
            <div className="p-4">
              <button 
                onClick={addNewEvent}
                className="w-full py-2 border border-dashed border-white/20 rounded text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-white hover:border-white/40 flex items-center justify-center gap-2 transition-all"
              >
                <Plus size={14} /> Add Event
              </button>
            </div>
          </div>
        )}
        
        <div className="p-4 border-t border-white/5 mt-auto bg-[#0f0f12] flex flex-col gap-2">
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            onChange={handleImportBackup} 
            className="hidden" 
          />
          <button 
            onClick={handleExportBackup}
            className="w-full py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Download size={14} /> Backup DB
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Upload size={14} /> Load DB
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-[#0f0f12] p-6 md:p-10 relative bg-grid-pattern">
        
        {activeTab === 'visual' && (
          <div className="w-full h-full">
            <VisualTimelineEditor data={data} onUpdateData={setData} />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-xl mx-auto space-y-6 relative z-10">
            <div className="bg-[#1a1a20]/95 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-white/10">
              <h3 className="text-xl font-serif text-white font-light mb-6 border-b border-white/5 pb-4">Global Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Timeline Background Color</label>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="color" 
                      value={data.timelineBackground} 
                      onChange={e => handleSettingsChange('timelineBackground', e.target.value)}
                      className="h-10 w-20 p-1 rounded border border-white/10 bg-black/40 cursor-pointer"
                    />
                    <input 
                      type="text" 
                      value={data.timelineBackground} 
                      onChange={e => handleSettingsChange('timelineBackground', e.target.value)}
                      className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-orange-500 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a20]/95 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-white/10">
              <h3 className="text-xl font-serif text-white font-light mb-6 border-b border-white/5 pb-4">Title Page Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    id="titlePageEnabled"
                    checked={data.titlePageEnabled || false}
                    onChange={e => handleSettingsChange('titlePageEnabled', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500 focus:ring-offset-gray-800"
                  />
                  <label htmlFor="titlePageEnabled" className="text-[10px] text-gray-300 uppercase font-bold tracking-widest">Enable Title Page (Cover)</label>
                </div>

                {data.titlePageEnabled && (
                  <>
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Title</label>
                      <input 
                        type="text" 
                        value={data.titlePageTitle || ''} 
                        onChange={e => handleSettingsChange('titlePageTitle', e.target.value)}
                        placeholder="e.g. My History Timeline"
                        className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-orange-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Subtitle</label>
                      <input 
                        type="text" 
                        value={data.titlePageSubtitle || ''} 
                        onChange={e => handleSettingsChange('titlePageSubtitle', e.target.value)}
                        placeholder="e.g. A journey through time"
                        className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-orange-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Cover Image URL (Optional)</label>
                      <input 
                        type="text" 
                        value={data.titlePageImage || ''} 
                        onChange={e => handleSettingsChange('titlePageImage', e.target.value)}
                        placeholder="e.g. https://example.com/cover.jpg"
                        className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-orange-500 outline-none whitespace-nowrap overflow-x-auto"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && activeEvent && (
          <div key={activeEvent.id} className="max-w-4xl mx-auto bg-[#1a1a20]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden relative z-10">
             
            <div className="bg-[#0f0f12] p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-serif text-2xl text-white font-light">Edit Event</h3>
              <button 
                onClick={deleteCurrentEvent}
                className="text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest transition-colors border border-red-500/20 hover:border-red-500/50"
              >
                <Trash2 size={14} /> Delete Event
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Title</label>
                  <input 
                    type="text" 
                    value={activeEvent.title} 
                    onChange={e => handleEventChange('title', e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Title Size (px)</label>
                  <div className="flex gap-3 items-center h-[38px]">
                    <div className="flex-1 flex gap-4 items-center h-full bg-black/40 border border-white/10 rounded px-3">
                      <input 
                        type="range" 
                        min="24" 
                        max="240" 
                        value={activeEvent.titleSize || 60} 
                        onChange={e => handleEventChange('titleSize', parseInt(e.target.value) || 60)}
                        className="flex-1 accent-orange-500 cursor-pointer"
                      />
                    </div>
                    <input 
                      type="number" 
                      min="1" 
                      max="1000"
                      value={activeEvent.titleSize === undefined || activeEvent.titleSize === null ? '' : activeEvent.titleSize} 
                      onChange={e => {
                        const parsedVal = parseInt(e.target.value);
                        handleEventChange('titleSize', isNaN(parsedVal) ? 0 : parsedVal);
                      }}
                      className="w-[72px] h-full text-center bg-black/40 border border-white/10 rounded text-sm text-orange-400 font-bold font-mono focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Date (Sorting Date)</label>
                  <input 
                    type="date" 
                    value={activeEvent.date} 
                    onChange={e => handleEventChange('date', e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-orange-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Custom Display Date (Optional)</label>
                  <input 
                    type="text" 
                    value={activeEvent.customDateText || ''} 
                    onChange={e => handleEventChange('customDateText', e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-orange-500 outline-none"
                    placeholder="Overrides formatted date..."
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Position X (Sort Order)</label>
                  <input 
                    type="number" 
                    value={activeEvent.positionX || 0} 
                    onChange={e => handleEventChange('positionX', parseFloat(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-orange-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Category (Swimlane)</label>
                  <div className="flex gap-2">
                    <input 
                      type="color" 
                      value={activeEvent.categoryColor || '#f97316'} 
                      onChange={e => handleEventChange('categoryColor', e.target.value)}
                      className="h-10 w-12 p-1 rounded border border-white/10 bg-black/40 cursor-pointer"
                    />
                    <input 
                      type="text" 
                      value={activeEvent.category} 
                      onChange={e => handleEventChange('category', e.target.value)}
                      className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Character Tags</label>
                  <TagsInput 
                    value={activeEvent.characterTags || []}
                    onChange={tags => handleEventChange('characterTags', tags)}
                    placeholder="e.g. 忌炎, 今汐"
                    eventId={activeEvent.id}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Region Tags</label>
                  <TagsInput 
                    value={activeEvent.regionTags || []}
                    onChange={tags => handleEventChange('regionTags', tags)}
                    placeholder="e.g. 今州"
                    eventId={activeEvent.id}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Main Story Tags</label>
                  <TagsInput 
                    value={activeEvent.mainStoryTags || []}
                    onChange={tags => handleEventChange('mainStoryTags', tags)}
                    placeholder="e.g. 第一章, 第一幕"
                    eventId={activeEvent.id}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Background (Color or Image URL)</label>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="color" 
                      value={(activeEvent.backgroundColor || '').startsWith('#') ? (activeEvent.backgroundColor || '').slice(0, 7) : '#0f0f12'} 
                      onChange={e => handleEventChange('backgroundColor', e.target.value)}
                      className="h-10 w-20 p-1 rounded border border-white/10 bg-black/40 cursor-pointer"
                      disabled={(activeEvent.backgroundColor || '').startsWith('http')}
                    />
                    <input 
                      type="text" 
                      value={activeEvent.backgroundColor || ''} 
                      onChange={e => handleEventChange('backgroundColor', e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-orange-500 outline-none font-mono"
                      placeholder="#1a1a20 or https://..."
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-white/5 pt-8">
                <h4 className="font-serif text-lg text-orange-400 font-light mb-6">Media Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Media Type</label>
                    <select 
                      value={activeEvent.mediaType} 
                      onChange={e => handleEventChange('mediaType', e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-orange-500 outline-none"
                    >
                      <option value="image">Image URL</option>
                      <option value="youtube">YouTube URL</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Media URL</label>
                    <input 
                      type="text" 
                      value={activeEvent.mediaUrl} 
                      onChange={e => handleEventChange('mediaUrl', e.target.value)}
                      placeholder={activeEvent.mediaType === 'youtube' ? "https://www.youtube.com/watch?v=..." : "https://..."}
                      className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-orange-500 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
              
              <div className="border-t border-white/5 pt-8">
                 <h4 className="font-serif text-lg text-orange-400 font-light mb-6">Text Content</h4>
                 <div className="bg-black/40 rounded-xl overflow-hidden border border-white/10">
                   <RichTextEditor 
                     value={activeEvent.content} 
                     onChange={(val) => handleEventChange('content', val)} 
                   />
                 </div>
              </div>

              <div className="border-t border-white/5 pt-8">
                  <h4 className="font-serif text-lg text-orange-400 font-light mb-6">遊戲文本參考設定 (References Support)</h4>
                  
                  <div className="flex flex-col gap-6">
                    <div>
                      <h5 className="font-serif text-sm text-gray-300 font-light mb-2 uppercase tracking-wider">遊戲文本文字 (Reference Text)</h5>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">在下方輸入文本或說明，這會顯示在文本參考彈跳視窗的最上方。</p>
                      <textarea
                        value={activeEvent.referenceText || ''}
                        onChange={e => handleEventChange('referenceText', e.target.value)}
                        onPaste={(e) => {
                          const items = e.clipboardData?.items;
                          if (!items) return;
                          for (let i = 0; i < items.length; i++) {
                            if (items[i].type.indexOf('image') !== -1) {
                              const file = items[i].getAsFile();
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const base64 = event.target?.result as string;
                                  const currentImages = activeEvent.referenceImages || [];
                                  handleEventChange('referenceImages', [...currentImages, base64]);
                                };
                                reader.readAsDataURL(file);
                              }
                            }
                          }
                        }}
                        className="w-full h-32 p-3 bg-black/40 border border-white/10 rounded-xl focus:border-orange-500 outline-none text-sm text-white leading-relaxed custom-scrollbar"
                        placeholder="請輸入說明文字或劇情文本... (可以直接在此框點選進行 Ctrl+V 貼上圖片)"
                      />
                    </div>

                    <div>
                      <h5 className="font-serif text-sm text-gray-300 font-light mb-2 uppercase tracking-wider">遊戲參考圖片 (Reference Images)</h5>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">您可以直接在下方框框按下 Ctrl+V 貼上剪貼簿的圖片、或拖曳圖片檔案進來、或選擇本機圖片。</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Left: Interactive Drop/Paste Zone */}
                        <div 
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.add('border-orange-500', 'bg-orange-500/10');
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove('border-orange-500', 'bg-orange-500/10');
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove('border-orange-500', 'bg-orange-500/10');
                            const files = e.dataTransfer.files;
                            if (files && files.length > 0) {
                              Array.from(files).forEach(file => {
                                if (file.type.indexOf('image') !== -1) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    const base64 = event.target?.result as string;
                                    const currentImages = activeEvent.referenceImages || [];
                                    handleEventChange('referenceImages', [...currentImages, base64]);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              });
                            }
                          }}
                          onPaste={(e) => {
                            const items = e.clipboardData?.items;
                            if (!items) return;
                            for (let i = 0; i < items.length; i++) {
                              if (items[i].type.indexOf('image') !== -1) {
                                const file = items[i].getAsFile();
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    const base64 = event.target?.result as string;
                                    const currentImages = activeEvent.referenceImages || [];
                                    handleEventChange('referenceImages', [...currentImages, base64]);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }
                            }
                          }}
                          className="border-2 border-dashed border-white/10 hover:border-orange-500/50 bg-[#0c0c0e] rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-all group relative min-h-[160px] cursor-pointer"
                        >
                          <p className="text-gray-400 text-xs text-center select-none">
                            點擊按鈕、拖上圖片、或點選本框後按 <kbd className="bg-white/10 px-1 py-0.5 rounded text-white font-mono">Ctrl + V</kbd> 貼上圖片
                          </p>
                          <input 
                            type="file" 
                            id="reference-file-uploader"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                              const files = e.target.files;
                              if (files) {
                                Array.from(files).forEach(file => {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    const base64 = event.target?.result as string;
                                    const currentImages = activeEvent.referenceImages || [];
                                    handleEventChange('referenceImages', [...currentImages, base64]);
                                  };
                                  reader.readAsDataURL(file);
                                });
                              }
                            }}
                            className="hidden"
                          />
                          <label 
                            htmlFor="reference-file-uploader"
                            className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 transition-colors text-white font-bold rounded-lg text-xs cursor-pointer shadow-md inline-block text-center"
                          >
                            選擇本機圖片
                          </label>
                        </div>

                        {/* Right: Manual Text Area (one URL per line) */}
                        <div className="flex flex-col">
                          <textarea
                            value={refImagesStr}
                            onChange={e => handleRefImagesChange(e.target.value)}
                            onPaste={(e) => {
                              const items = e.clipboardData?.items;
                              if (!items) return;
                              for (let i = 0; i < items.length; i++) {
                                if (items[i].type.indexOf('image') !== -1) {
                                  const file = items[i].getAsFile();
                                  if (file) {
                                    e.preventDefault();
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      const base64 = event.target?.result as string;
                                      const currentImages = activeEvent.referenceImages || [];
                                      handleEventChange('referenceImages', [...currentImages, base64]);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }
                              }
                            }}
                            className="w-full h-full min-h-[160px] p-3 bg-black/40 border border-white/10 rounded-xl focus:border-orange-500 outline-none text-sm text-white font-mono leading-relaxed custom-scrollbar"
                            placeholder="手動輸入或貼上外部圖片網址 (一行一個網址)..."
                          />
                        </div>
                      </div>

                      {/* Show simple preview of currently added images with a remove/delete button */}
                      {activeEvent.referenceImages && activeEvent.referenceImages.length > 0 && (
                        <div className="mt-4 bg-[#08080a] p-4 rounded-xl border border-white/5">
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">
                            預覽與快速移除 ({activeEvent.referenceImages.length} 張圖片):
                          </p>
                          <div className="flex flex-wrap gap-3">
                            {activeEvent.referenceImages.map((img, idx) => (
                              <div key={idx} className="relative group w-20 h-20 bg-black/40 rounded border border-white/10 overflow-hidden">
                                <img src={img} alt="" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const filtered = activeEvent.referenceImages.filter((_, i) => i !== idx);
                                    handleEventChange('referenceImages', filtered);
                                  }}
                                  className="absolute inset-0 bg-red-600/80 hover:bg-red-700/90 flex items-center justify-center text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                >
                                  移除
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
              </div>

            </div>
          </div>
        )}
      </div>

    </div>
  );
}
