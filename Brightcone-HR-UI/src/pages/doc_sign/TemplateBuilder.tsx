import React, { useState } from 'react';
import { Upload, Send, PenTool, Plus, X } from 'lucide-react';
import { NewEnvelopeModal } from './components/NewEnvelopeModal';
import type { SignatureRequest } from './types';

interface TemplateCard {
  id: string;
  title: string;
  fieldsCount: number;
  usedTimes: number;
}

export const TemplateBuilder: React.FC = () => {
  const [templates, setTemplates] = useState<TemplateCard[]>([
    { id: '1', title: 'Offer letter', fieldsCount: 6, usedTimes: 24 },
    { id: '2', title: 'Employment agreement', fieldsCount: 9, usedTimes: 18 },
    { id: '3', title: 'NDA', fieldsCount: 4, usedTimes: 31 },
    { id: '4', title: 'Policy acknowledgement', fieldsCount: 2, usedTimes: 112 },
    { id: '5', title: 'Appraisal letter', fieldsCount: 3, usedTimes: 46 },
    { id: '6', title: 'F&F settlement', fieldsCount: 5, usedTimes: 7 },
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadCardOpen, setIsUploadCardOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Upload Template Form fields
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFields, setUploadFields] = useState('4');
  const [uploadCategory, setUploadCategory] = useState('Offers');
  const [uploadFile, setUploadFile] = useState('');

  const handleUseTemplate = (title: string) => {
    setSelectedTemplate(title);
    setIsModalOpen(true);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      alert('Please enter template title');
      return;
    }
    const newTpl: TemplateCard = {
      id: String(Date.now()),
      title: uploadTitle.trim(),
      fieldsCount: parseInt(uploadFields) || 4,
      usedTimes: 0,
    };
    setTemplates((prev) => [newTpl, ...prev]);
    setUploadTitle('');
    setUploadFile('');
    setIsUploadCardOpen(false);
    setToastMessage(`Template "${newTpl.title}" uploaded and added to library.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreated = (req: SignatureRequest) => {
    setToastMessage(`Sent "${req.title}" for signature to ${req.recipient.name}`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header matching Image 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-xs font-bold tracking-wider text-rose-500 uppercase">
              SIGN
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Templates
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Reusable documents with signature and form fields already placed.
          </p>
        </div>

        <button
          onClick={() => setIsUploadCardOpen(true)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-sm font-semibold flex items-center gap-2 transition-all shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Upload size={16} className="text-slate-500" />
          <span>Upload template</span>
        </button>
      </div>

      {/* Grid of Template Cards matching Image 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            {/* Document preview illustration matching Image 2 */}
            <div className="w-full h-32 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 p-3.5 relative flex flex-col justify-between mb-4">
              <div className="space-y-2">
                <div className="w-3/4 h-2 bg-slate-200 dark:bg-slate-800 rounded-full" />
                <div className="w-full h-1.5 bg-slate-200/80 dark:bg-slate-800/60 rounded-full" />
                <div className="w-5/6 h-1.5 bg-slate-200/80 dark:bg-slate-800/60 rounded-full" />
                <div className="w-2/3 h-1.5 bg-slate-200/80 dark:bg-slate-800/60 rounded-full" />
              </div>

              {/* Dashed red badge: Sign here */}
              <div className="self-end inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-dashed border-rose-300 dark:border-rose-800 bg-rose-50/60 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
                <PenTool size={11} />
                <span>Sign here</span>
              </div>
            </div>

            {/* Card info */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {tpl.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                {tpl.fieldsCount} fields · used {tpl.usedTimes} times
              </p>
            </div>

            {/* Blue Action button: Use template */}
            <button
              onClick={() => handleUseTemplate(tpl.title)}
              className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Send size={13} />
              <span>Use template</span>
            </button>
          </div>
        ))}
      </div>

      {/* Upload Template Card / Modal */}
      {isUploadCardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-[#10192A] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 pb-2 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Upload template</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Upload PDF or DOCX and configure signature form fields.
                </p>
              </div>
              <button
                onClick={() => setIsUploadCardOpen(false)}
                className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 pt-3 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  Template title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Master Services Agreement"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                    Category
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500"
                  >
                    <option value="Offers">Offers</option>
                    <option value="NDAs">NDAs</option>
                    <option value="Policies">Policies</option>
                    <option value="Agreements">Agreements</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                    Signature fields
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={uploadFields}
                    onChange={(e) => setUploadFields(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  Template Document (PDF / DOCX)
                </label>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setUploadFile(e.target.files[0].name);
                    }
                  }}
                  className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border file:border-slate-300 dark:file:border-slate-700 file:text-xs file:font-semibold file:bg-white dark:file:bg-slate-800 file:text-slate-800 dark:file:text-slate-200 hover:file:bg-slate-50 cursor-pointer"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadCardOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md transition-all cursor-pointer"
                >
                  Upload and Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <NewEnvelopeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreated}
        initialTemplate={selectedTemplate}
      />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl text-xs font-semibold animate-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
export default TemplateBuilder;
