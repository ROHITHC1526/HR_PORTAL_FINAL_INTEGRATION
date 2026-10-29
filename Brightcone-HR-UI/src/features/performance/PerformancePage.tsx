import React, { useEffect, useState } from 'react';
import { performanceApi } from '../../api/performance.api';
import {
  Goal,
  PeerFeedback,
  ReviewCycleStatus,
} from '../../types/performance.types';
import {
  MessageSquare,
  PenTool,
  Check,
  CheckCircle,
  X,
  Plus,
} from 'lucide-react';

export const PerformancePage: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [feedbacks, setFeedbacks] = useState<PeerFeedback[]>([]);
  const [reviewStatus, setReviewStatus] = useState<ReviewCycleStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal states
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isSelfReviewModalOpen, setIsSelfReviewModalOpen] = useState(false);
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);

  // Form states
  const [feedbackTo, setFeedbackTo] = useState('BC-1019');
  const [feedbackToName, setFeedbackToName] = useState('Priya Menon');
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const [selfAccomplishments, setSelfAccomplishments] = useState(
    'Successfully delivered the distributed candidate ingestion pipeline and reduced p95 latency by 45%.'
  );
  const [selfRating, setSelfRating] = useState(4.8);
  const [submittingSelfReview, setSubmittingSelfReview] = useState(false);

  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDueDate, setNewGoalDueDate] = useState('Due Dec 31');
  const [newGoalCategory, setNewGoalCategory] = useState('Engineering');
  const [submittingGoal, setSubmittingGoal] = useState(false);

  const fetchData = async () => {
    try {
      const [goalsData, feedbackData, statusData] = await Promise.all([
        performanceApi.getGoals(),
        performanceApi.getFeedbacks('BC-1038'),
        performanceApi.getReviewStatus('BC-1038', 'H2 2026'),
      ]);
      const rahulGoals = goalsData.filter((g) => !g.employee_id || g.employee_id === 'BC-1038');
      setGoals(rahulGoals.length > 0 ? rahulGoals : goalsData);
      setFeedbacks(feedbackData);
      setReviewStatus(statusData);
    } catch (err) {
      console.error('Failed to load performance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProgressChange = async (id: number, newProgress: number) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, progress: newProgress } : g))
    );
    try {
      await performanceApi.updateGoalProgress(id, newProgress);
    } catch (err) {
      console.error('Failed to update goal progress:', err);
    }
  };

  const handleGiveFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setSubmittingFeedback(true);
    try {
      await performanceApi.createFeedback({
        from_employee_id: 'BC-1038',
        from_employee_name: 'Rahul Varma',
        to_employee_id: feedbackTo,
        to_employee_name: feedbackToName,
        feedback: feedbackText,
      });
      setToastMessage(`Feedback sent to ${feedbackToName} successfully!`);
      setTimeout(() => setToastMessage(null), 4000);
      setIsFeedbackModalOpen(false);
      setFeedbackText('');
      fetchData();
    } catch (err) {
      alert('Failed to send feedback: ' + err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleSubmitSelfReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingSelfReview(true);
    try {
      const updated = await performanceApi.submitSelfReview({
        employee_id: 'BC-1038',
        cycle: 'H2 2026',
        accomplishments: selfAccomplishments,
        rating: selfRating,
      });
      setReviewStatus(updated);
      setToastMessage('H2 2026 self-review submitted successfully!');
      setTimeout(() => setToastMessage(null), 4000);
      setIsSelfReviewModalOpen(false);
    } catch (err) {
      alert('Failed to submit self-review: ' + err);
    } finally {
      setSubmittingSelfReview(false);
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    setSubmittingGoal(true);
    try {
      await performanceApi.createGoal({
        employee_id: 'BC-1038',
        employee_name: 'Rahul Varma',
        title: newGoalTitle,
        category: newGoalCategory,
        target_date: newGoalDueDate,
        progress: 0,
        status: 'In Progress',
      });
      setToastMessage('New goal added successfully!');
      setTimeout(() => setToastMessage(null), 4000);
      setIsAddGoalModalOpen(false);
      setNewGoalTitle('');
      fetchData();
    } catch (err) {
      alert('Failed to add goal: ' + err);
    } finally {
      setSubmittingGoal(false);
    }
  };

  const isSubmitted = reviewStatus?.self_review_submitted;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-semibold border border-slate-700 animate-slideUp">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header matching Screenshot 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>PEOPLE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Goals & reviews
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            H2 2026 review. Self-reviews are due by Oct 25, 2026.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFeedbackModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-xs transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            <span>Give feedback</span>
          </button>

          <button
            onClick={() => setIsSelfReviewModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
          >
            <PenTool className="w-4 h-4" />
            <span>Write self-review</span>
          </button>
        </div>
      </div>

      {/* Review Cycle Card matching Screenshot 2 */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Review cycle</h2>

        {/* 5-step horizontal stepper */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Step 1: Goal setting (Completed / Green) */}
          <div className="rounded-xl border border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/30 p-3.5 flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Goal setting
            </span>
          </div>

          {/* Step 2: Self-review (Active Blue Card) */}
          <div
            className={`rounded-xl border-2 ${
              isSubmitted
                ? 'border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/30'
                : 'border-blue-500 bg-white dark:bg-slate-900 shadow-xs'
            } p-3.5 flex items-center gap-3`}
          >
            <div
              className={`w-6 h-6 rounded-full ${
                isSubmitted ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'
              } text-xs font-bold flex items-center justify-center shrink-0`}
            >
              {isSubmitted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '2'}
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Self-review
            </span>
          </div>

          {/* Step 3: Manager review */}
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3.5 flex items-center gap-3">
            <span className="w-6 h-6 rounded-full text-slate-400 font-bold text-xs flex items-center justify-center shrink-0">
              3
            </span>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Manager review
            </span>
          </div>

          {/* Step 4: Calibration */}
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3.5 flex items-center gap-3">
            <span className="w-6 h-6 rounded-full text-slate-400 font-bold text-xs flex items-center justify-center shrink-0">
              4
            </span>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Calibration
            </span>
          </div>

          {/* Step 5: Results shared */}
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3.5 flex items-center gap-3">
            <span className="w-6 h-6 rounded-full text-slate-400 font-bold text-xs flex items-center justify-center shrink-0">
              5
            </span>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Results shared
            </span>
          </div>
        </div>

        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 pt-1">
          Your self-review:{' '}
          <span className={`font-semibold ${isSubmitted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
            {isSubmitted ? 'Submitted' : 'Not submitted'}
          </span>
        </div>
      </div>

      {/* Bottom 2-Column Grid matching Screenshot 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: My goals */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">My goals</h2>
            <button
              onClick={() => setIsAddGoalModalOpen(true)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors cursor-pointer"
            >
              Add goal
            </button>
          </div>

          <div className="space-y-6">
            {goals.map((g) => (
              <div key={g.id} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white leading-tight">
                    {g.title}
                  </span>
                  <span className="text-slate-400 font-medium shrink-0 ml-3">
                    {g.target_date}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative flex-1 flex items-center">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={g.progress}
                      onChange={(e) => handleProgressChange(g.id, parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-9 text-right font-mono">
                    {g.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Feedback for you */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Feedback for you
          </h2>

          <div className="space-y-5">
            {feedbacks.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No feedback received yet.
              </div>
            ) : (
              feedbacks.map((fb) => {
                const initials = fb.from_employee_name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);
                return (
                  <div key={fb.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                      {initials}
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {fb.from_employee_name}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {fb.feedback}
                      </p>
                      <div className="text-[11px] text-slate-400">{fb.date}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal: Give Feedback */}
      {isFeedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Give peer feedback
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Share constructive appreciation and feedback with colleagues.
                </p>
              </div>
              <button
                onClick={() => setIsFeedbackModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGiveFeedback} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Recipient
                </label>
                <select
                  value={feedbackTo}
                  onChange={(e) => {
                    setFeedbackTo(e.target.value);
                    const name =
                      e.target.value === 'BC-1019'
                        ? 'Priya Menon'
                        : e.target.value === 'BC-1012'
                        ? 'Arjun Nair'
                        : 'Sneha Iyer';
                    setFeedbackToName(name);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                >
                  <option value="BC-1019">Priya Menon (Engineering Manager)</option>
                  <option value="BC-1012">Arjun Nair (Staff AI Engineer)</option>
                  <option value="BC-1031">Sneha Iyer (Product Designer)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Your feedback
                </label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Highlight key contributions, collaboration, and high impact work..."
                  rows={4}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFeedbackModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submittingFeedback ? 'Submitting...' : 'Send feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Write Self-Review */}
      {isSelfReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Write self-review (H2 2026)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Summarize your key achievements, deliverables, and self-evaluation.
                </p>
              </div>
              <button
                onClick={() => setIsSelfReviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSelfReview} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Key Accomplishments & Impact
                </label>
                <textarea
                  value={selfAccomplishments}
                  onChange={(e) => setSelfAccomplishments(e.target.value)}
                  rows={5}
                  required
                  placeholder="Detail systems launched, latency improvements, team mentorship, etc..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Self-evaluation rating (out of 5.0)</span>
                  <span className="text-blue-600 font-mono font-bold text-sm">
                    {selfRating.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min={1.0}
                  max={5.0}
                  step={0.1}
                  value={selfRating}
                  onChange={(e) => setSelfRating(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSelfReviewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSelfReview}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submittingSelfReview ? 'Submitting...' : 'Submit self-review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Goal */}
      {isAddGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Add new goal
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Define an OKR or milestone for the active performance cycle.
                </p>
              </div>
              <button
                onClick={() => setIsAddGoalModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddGoal} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  placeholder="e.g. Implement distributed rate-limiting in Rust"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newGoalCategory}
                    onChange={(e) => setNewGoalCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Leadership">Leadership</option>
                    <option value="Product">Product</option>
                    <option value="Delivery">Delivery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="text"
                    value={newGoalDueDate}
                    onChange={(e) => setNewGoalDueDate(e.target.value)}
                    placeholder="Due Dec 31"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddGoalModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingGoal}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submittingGoal ? 'Adding...' : 'Add goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformancePage;
