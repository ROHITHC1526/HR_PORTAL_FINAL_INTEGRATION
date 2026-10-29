import React from 'react';
import { usePortal, PortalApp } from '../../context/PortalContext';
import { Briefcase, Users, Check, Sparkles, X, Banknote, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AppLauncherModal: React.FC = () => {
  const { currentApp, setCurrentApp, isAppLauncherOpen, setIsAppLauncherOpen, activeRole } = usePortal();
  const navigate = useNavigate();

  if (!isAppLauncherOpen) return null;

  const handleSelectApp = (app: PortalApp) => {
    setCurrentApp(app);
    setIsAppLauncherOpen(false);
    if (app === 'recruit') {
      if (activeRole === 'employee') {
        navigate('/recruit/jobs-referrals');
      } else {
        navigate('/recruit/dashboard');
      }
    } else if (app === 'payroll') {
      navigate('/payroll/dashboard');
    } else if (app === 'expense') {
      navigate('/expenses/dashboard');
    } else {
      if (activeRole === 'employee') {
        navigate('/people/profile');
      } else {
        navigate('/people/directory');
      }
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]" 
        onClick={() => setIsAppLauncherOpen(false)}
      />
      <div className="app-launcher-menu">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Brightcone Workspace</span>
          </div>
          <button 
            onClick={() => setIsAppLauncherOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-1.5">
          {/* People App */}
          <button
            onClick={() => handleSelectApp('people')}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
              currentApp === 'people'
                ? 'bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-teal-500/20">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>People</span>
                  {currentApp === 'people' && (
                    <span className="text-[10px] bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 font-bold px-1.5 py-0.2 rounded">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {activeRole === 'admin' ? 'Company workforce & policies' : 'Personal profile, leave & attendance'}
                </div>
              </div>
            </div>
            {currentApp === 'people' && <Check className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
          </button>

          {/* Recruit App */}
          <button
            onClick={() => handleSelectApp('recruit')}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
              currentApp === 'recruit'
                ? 'bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Recruit</span>
                  {currentApp === 'recruit' && (
                    <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold px-1.5 py-0.2 rounded">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {activeRole === 'admin' ? 'Hiring pipelines & requisitions' : 'Open internal roles & referrals'}
                </div>
              </div>
            </div>
            {currentApp === 'recruit' && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
          </button>

          {/* Payroll App */}
          <button
            onClick={() => handleSelectApp('payroll')}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
              currentApp === 'payroll'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                <Banknote className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Payroll</span>
                  {currentApp === 'payroll' && (
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold px-1.5 py-0.2 rounded">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {activeRole === 'admin' ? 'Payroll runs, salary structures & compliance' : 'My payslips & salary info'}
                </div>
              </div>
            </div>
            {currentApp === 'payroll' && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
          </button>

          {/* Expense App */}
          <button
            onClick={() => handleSelectApp('expense')}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
              currentApp === 'expense'
                ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Expense</span>
                  {currentApp === 'expense' && (
                    <span className="text-[10px] bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-bold px-1.5 py-0.2 rounded">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {activeRole === 'admin' ? 'Office expenses & employee claims' : 'My reimbursement claims'}
                </div>
              </div>
            </div>
            {currentApp === 'expense' && <Check className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
          </button>
        </div>
      </div>
    </>
  );
};
