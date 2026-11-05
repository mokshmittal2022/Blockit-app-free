import React from 'react';
import { Phone, MapPin, MessageSquare, Mail, Music, Calculator, FileText, Check, X, ShieldAlert } from 'lucide-react';
import { EssentialApp } from '../../types';
import { triggerHapticTick } from '../../services/haptics';

interface Props {
  isOpen: boolean;
  apps: EssentialApp[];
  allowedAppIds: string[];
  onToggleApp: (appId: string) => void;
  onClose: () => void;
}

export const AllowedAppsModal: React.FC<Props> = ({
  isOpen,
  apps,
  allowedAppIds,
  onToggleApp,
  onClose
}) => {
  if (!isOpen) return null;

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Phone': return <Phone className="w-5 h-5 text-emerald-500" />;
      case 'MapPin': return <MapPin className="w-5 h-5 text-blue-500" />;
      case 'MessageSquare': return <MessageSquare className="w-5 h-5 text-amber-500" />;
      case 'Mail': return <Mail className="w-5 h-5 text-rose-500" />;
      case 'Music': return <Music className="w-5 h-5 text-purple-500" />;
      case 'Calculator': return <Calculator className="w-5 h-5 text-teal-500" />;
      case 'FileText': return <FileText className="w-5 h-5 text-yellow-500" />;
      default: return <Phone className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-[#16253B] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-[#243B5A] max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
              Essentials Allowed
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Only checked apps stay unlocked
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-[#1E324E]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Emergency Notice */}
        <div className="flex items-center gap-2 p-3 bg-amber-500/10 dark:bg-[#F2B84B]/10 rounded-2xl mb-3 border border-amber-500/20 text-xs text-amber-700 dark:text-[#F2B84B]">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>Emergency calls and dialer are always accessible by law.</span>
        </div>

        {/* Apps List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {apps.map((app) => {
            const isAllowed = allowedAppIds.includes(app.id) || app.isEmergencyDialer;
            return (
              <div
                key={app.id}
                onClick={() => {
                  if (app.isEmergencyDialer) return;
                  triggerHapticTick(1300);
                  onToggleApp(app.id);
                }}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  app.isEmergencyDialer
                    ? 'bg-slate-100/60 dark:bg-[#0F1B2D]/60 border-slate-200/50 dark:border-[#243B5A]/40 opacity-80 cursor-default'
                    : isAllowed
                    ? 'bg-teal-500/5 dark:bg-[#1FB5A8]/10 border-teal-500/30 dark:border-[#1FB5A8]/30'
                    : 'bg-white dark:bg-[#16253B] border-slate-200 dark:border-[#243B5A]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#0F1B2D] flex items-center justify-center">
                    {renderIcon(app.icon)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                      {app.name}
                      {app.isEmergencyDialer && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-mono">
                          LOCKED ON
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {app.packageName}
                    </p>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                    isAllowed
                      ? 'bg-[#1FB5A8] text-white'
                      : 'border-2 border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {isAllowed && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-3 bg-[#1FB5A8] hover:bg-[#1aa195] text-white font-bold text-xs rounded-xl shadow-md active:scale-98 transition-all"
        >
          Done
        </button>
      </div>
    </div>
  );
};
