import React, { useState } from 'react';
import { Phone, MapPin, MessageSquare, Mail, X, ArrowLeft, Send } from 'lucide-react';
import { triggerHapticTick } from '../../services/haptics';

interface Props {
  appId: string | null;
  onClose: () => void;
}

export const MiniAppModal: React.FC<Props> = ({ appId, onClose }) => {
  const [dialNumber, setDialNumber] = useState('');
  const [messages, setMessages] = useState<string[]>([
    'Stillhour session active: I will get back to you shortly!'
  ]);
  const [msgInput, setMsgInput] = useState('');

  if (!appId) return null;

  const handleDial = (digit: string) => {
    triggerHapticTick(900 + Number(digit || 0) * 80);
    setDialNumber((prev) => prev + digit);
  };

  const handleSendMsg = () => {
    if (!msgInput.trim()) return;
    setMessages((prev) => [...prev, msgInput.trim()]);
    setMsgInput('');
    triggerHapticTick(1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm h-[580px] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col text-white">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800/80 border-b border-slate-700">
          <button
            onClick={onClose}
            className="flex items-center gap-1 text-xs text-[#1FB5A8] font-bold hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Lock
          </button>
          <span className="text-xs font-semibold text-slate-300 capitalize">
            {appId === 'phone' ? 'Emergency Phone' : appId === 'maps' ? 'Maps Essential' : appId === 'messages' ? 'Messages Essential' : 'Essential App'}
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mini App Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col">
          {appId === 'phone' ? (
            <div className="flex-1 flex flex-col items-center justify-between">
              <div className="w-full text-center py-4">
                <span className="text-2xl font-mono tracking-widest text-[#1FB5A8] min-h-[36px] inline-block">
                  {dialNumber || 'Emergency / Dialer'}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Calls & Emergency dialer are never locked
                </p>
              </div>

              {/* Number Pad */}
              <div className="grid grid-cols-3 gap-3 w-64 max-w-full">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((d) => (
                  <button
                    key={d}
                    onClick={() => handleDial(d)}
                    className="w-16 h-16 rounded-full bg-slate-800 hover:bg-slate-700 text-xl font-bold flex items-center justify-center active:scale-95 transition-all text-white border border-slate-700"
                  >
                    {d}
                  </button>
                ))}
              </div>

              {/* Call Buttons */}
              <div className="flex items-center justify-center gap-6 mt-4 w-full">
                <button
                  onClick={() => {
                    triggerHapticTick(1600);
                    alert(`Simulated call to ${dialNumber || '911'} initiated.`);
                  }}
                  className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg active:scale-95"
                >
                  <Phone className="w-7 h-7" />
                </button>
                {dialNumber && (
                  <button
                    onClick={() => setDialNumber((prev) => prev.slice(0, -1))}
                    className="text-xs text-slate-400 hover:text-white px-3 py-2 bg-slate-800 rounded-xl"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ) : appId === 'maps' ? (
            <div className="flex-1 flex flex-col">
              <div className="relative flex-1 bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 flex flex-col items-center justify-center p-4 text-center">
                <MapPin className="w-12 h-12 text-blue-400 animate-bounce mb-2" />
                <h4 className="font-heading font-bold text-sm text-white mb-1">
                  Simulated Google Maps Navigation
                </h4>
                <p className="text-xs text-slate-400 max-w-xs">
                  Allowed essential application: provides turn-by-turn navigation while keeping distracting social media and video apps locked.
                </p>
                <div className="mt-4 px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-xl text-xs font-mono">
                  GPS Route Active · ETA 18 mins
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-3 flex-1 overflow-y-auto">
                {messages.map((m, idx) => (
                  <div key={idx} className="flex justify-end">
                    <div className="max-w-[80%] bg-[#1FB5A8] text-slate-900 rounded-2xl rounded-tr-sm p-3 text-xs font-medium">
                      {m}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-800">
                <input
                  type="text"
                  placeholder="Type an urgent message..."
                  value={msgInput}
                  onChange={(e) => setMsgInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMsg()}
                  className="flex-1 bg-slate-800 text-xs px-3 py-2.5 rounded-xl text-white outline-none border border-slate-700"
                />
                <button
                  onClick={handleSendMsg}
                  className="p-2.5 bg-[#1FB5A8] text-slate-900 rounded-xl hover:bg-[#1aa195]"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
