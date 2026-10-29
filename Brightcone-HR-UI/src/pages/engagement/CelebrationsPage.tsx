import React, { useState, useMemo } from 'react';
import { Gift, Calendar, Star, Users, Search, Eye } from 'lucide-react';
import { useLiveEmployees, computeUpcomingCelebrations, CelebrationItem } from '../../utils/employeeSync';
import { DocDetailDrawer } from '../../components/common/DocDetailDrawer';

export const CelebrationsPage: React.FC = () => {
  const { employees } = useLiveEmployees();
  const [search, setSearch] = useState('');
  const [viewCelebration, setViewCelebration] = useState<CelebrationItem | null>(null);

  const allCelebrations = useMemo(() => {
    return computeUpcomingCelebrations(employees, 60);
  }, [employees]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allCelebrations;
    return allCelebrations.filter(
      (c) =>
        c.employeeName.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q) ||
        c.occasion.toLowerCase().includes(q) ||
        c.milestone.toLowerCase().includes(q)
    );
  }, [allCelebrations, search]);

  const todayCount = allCelebrations.filter((c) => c.daysUntil === 0).length;
  const next7DaysCount = allCelebrations.filter((c) => c.daysUntil <= 7).length;
  const birthdaysCount = allCelebrations.filter((c) => c.occasion === 'Birthday').length;
  const anniversariesCount = allCelebrations.filter((c) => c.occasion === 'Work anniversary').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Section matching Image 4 */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400">
          <span className="w-2 h-2 rounded-full bg-sky-500" />
          <span>CONNECT</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Birthday & work anniversary tracker
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Upcoming birthdays and work anniversaries in the next 60 days, from Employee master data.
        </p>
      </div>

      {/* 4 Stat Cards matching Image 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today */}
        <div className="bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/40 flex items-center justify-center text-sky-600 dark:text-sky-400 shadow-xs">
              <Gift size={18} />
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Today
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
            {todayCount}
          </div>
          <div className="text-[11px] text-slate-400">Celebrations today</div>
        </div>

        {/* Card 2: Next 7 days */}
        <div className="bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/40 flex items-center justify-center text-sky-600 dark:text-sky-400 shadow-xs">
              <Calendar size={18} />
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Next 7 days
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
            {next7DaysCount}
          </div>
          <div className="text-[11px] text-slate-400">Coming up this week</div>
        </div>

        {/* Card 3: Birthdays */}
        <div className="bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/40 flex items-center justify-center text-sky-600 dark:text-sky-400 shadow-xs">
              <Gift size={18} />
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Birthdays
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
            {birthdaysCount}
          </div>
          <div className="text-[11px] text-slate-400">Next 60 days</div>
        </div>

        {/* Card 4: Anniversaries */}
        <div className="bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/40 flex items-center justify-center text-sky-600 dark:text-sky-400 shadow-xs">
              <Star size={18} />
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Anniversaries
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
            {anniversariesCount}
          </div>
          <div className="text-[11px] text-slate-400">Next 60 days</div>
        </div>
      </div>

      {/* Main Table Card matching Image 4 */}
      <div className="bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl p-6 shadow-sm space-y-5">
        {/* Search Bar matching Image 4 */}
        <div className="max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Table matching Image 4 */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <tr>
                <th className="py-3 px-4">EMPLOYEE</th>
                <th className="py-3 px-4">OCCASION</th>
                <th className="py-3 px-4">DATE</th>
                <th className="py-3 px-4">WHEN</th>
                <th className="py-3 px-4">MILESTONE</th>
                <th className="py-3 px-4">DEPARTMENT</th>
                <th className="py-3 px-4 text-right"></th>
              </tr>
            </thead>

            {filtered.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/40 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-3 shadow-inner">
                        <Users size={22} />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
                        No birthdays or anniversaries in the next 60 days. Add dates of birth in Employee master data to track birthdays.
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
                  >
                    {/* Employee */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                          {item.avatarInitials}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {item.employeeName}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {item.employeeId}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Occasion */}
                    <td className="py-3.5 px-4">
                      {item.occasion === 'Birthday' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50">
                          <Gift size={12} className="text-rose-500" />
                          <span>Birthday</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                          <Star size={12} className="text-amber-500 fill-amber-500" />
                          <span>Work anniversary</span>
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {item.date}
                    </td>

                    {/* When */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs font-semibold ${
                          item.daysUntil === 0
                            ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                            : item.daysUntil <= 7
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {item.when}
                      </span>
                    </td>

                    {/* Milestone */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                      {item.milestone}
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {item.department}
                    </td>

                    {/* Actions: Eye icon */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setViewCelebration(item)}
                        title="View employee celebration details"
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

        {/* Footer info matching Image 4 */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
          <span>{filtered.length} rows</span>
          <span>Worked out from your live records</span>
        </div>
      </div>

      {/* Detail Drawer matching Image 2 */}
      {viewCelebration && (
        <DocDetailDrawer
          isOpen={!!viewCelebration}
          onClose={() => setViewCelebration(null)}
          title={`${viewCelebration.employeeName} (${viewCelebration.employeeId})`}
          subtitle={`${viewCelebration.occasion} · ${viewCelebration.department}`}
          status={viewCelebration.when}
          statusVariant="success"
          fields={[
            { label: 'Employee', value: viewCelebration.employeeName, avatar: { initials: viewCelebration.avatarInitials, subtitle: `${viewCelebration.employeeId} · ${viewCelebration.department}` } },
            { label: 'Occasion', value: viewCelebration.occasion },
            { label: 'Date', value: viewCelebration.date },
            { label: 'When', value: viewCelebration.when },
            { label: 'Milestone', value: viewCelebration.milestone },
            { label: 'Department', value: viewCelebration.department },
          ]}
          history={{
            status: viewCelebration.milestone,
            timestamp: `${viewCelebration.date}, 09:00 am`,
            actor: viewCelebration.employeeName,
          }}
          createdTimestamp={`Calculated from Employee master data records.`}
          onEdit={() => setViewCelebration(null)}
          onDelete={() => setViewCelebration(null)}
        />
      )}
    </div>
  );
};

export default CelebrationsPage;
