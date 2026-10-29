import React, { useState, useEffect } from 'react';
import { employeesApi } from '../../api/employees.api';
import {
  CompanyPolicy,
  EmployeeDocument,
  LetterRequest,
} from '../../types/employee.types';
import {
  FileText,
  Download,
  Upload,
  CheckCircle,
  X,
  FileCheck,
  Building,
  Calendar,
} from 'lucide-react';

export const DocumentsAndLettersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'policies' | 'my-documents' | 'letter-requests'>('policies');
  const [policies, setPolicies] = useState<CompanyPolicy[]>([]);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [letters, setLetters] = useState<LetterRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Policy Modal
  const [selectedPolicy, setSelectedPolicy] = useState<CompanyPolicy | null>(null);

  // Upload Document Modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [docName, setDocName] = useState('Degree certificate');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Request Letter Modal
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);
  const [letterType, setLetterType] = useState('Employment verification');
  const [addressedTo, setAddressedTo] = useState('HDFC Bank');
  const [letterPurpose, setLetterPurpose] = useState('Home loan application verification');
  const [requestingLetter, setRequestingLetter] = useState(false);

  const fetchAllData = async () => {
    try {
      const [policiesData, docsData, lettersData] = await Promise.all([
        employeesApi.getPolicies('BC-1038'),
        employeesApi.getMyDocuments('BC-1038'),
        employeesApi.getLetterRequests('BC-1038'),
      ]);
      setPolicies(policiesData);
      setDocuments(docsData);
      setLetters(lettersData);
    } catch (err) {
      console.error('Failed to load documents data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleAcknowledge = async (policyId: string) => {
    try {
      await employeesApi.acknowledgePolicy(policyId, 'BC-1038');
      setToastMessage('Policy acknowledged successfully!');
      setTimeout(() => setToastMessage(null), 4000);
      fetchAllData();
      if (selectedPolicy && selectedPolicy.id === policyId) {
        setSelectedPolicy((prev) => (prev ? { ...prev, acknowledged: true } : null));
      }
    } catch (err) {
      alert('Failed to acknowledge policy: ' + err);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }
    setUploadingDoc(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        try {
          await employeesApi.uploadDocument({
            employee_id: 'BC-1038',
            document_name: docName,
            file_name: selectedFile.name,
            file_data_base64: base64Data,
          });
          setToastMessage(`Document "${docName}" uploaded and verified successfully!`);
          setTimeout(() => setToastMessage(null), 4000);
          setIsUploadModalOpen(false);
          setSelectedFile(null);
          fetchAllData();
        } catch (err) {
          alert('Failed to save document on server: ' + err);
        } finally {
          setUploadingDoc(false);
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (err) {
      alert('Failed to process file: ' + err);
      setUploadingDoc(false);
    }
  };

  const handleRequestLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!letterType || !addressedTo) {
      alert('Please fill in letter type and recipient');
      return;
    }
    setRequestingLetter(true);
    try {
      await employeesApi.createLetterRequest({
        employee_id: 'BC-1038',
        employee_name: 'Rahul Varma',
        letter_type: letterType,
        addressed_to: addressedTo,
        purpose: letterPurpose,
      });
      setToastMessage(`Letter request for ${letterType} issued successfully!`);
      setTimeout(() => setToastMessage(null), 4000);
      setIsLetterModalOpen(false);
      fetchAllData();
    } catch (err) {
      alert('Failed to request letter: ' + err);
    } finally {
      setRequestingLetter(false);
    }
  };

  const downloadFile = (url?: string, defaultFilename = 'document.pdf') => {
    if (!url) {
      alert('No download URL available for this file.');
      return;
    }
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    const link = document.createElement('a');
    link.href = cleanUrl;
    link.target = '_blank';
    link.download = defaultFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-semibold border border-slate-700 animate-slideUp">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header matching Screenshots 3, 4, 5 */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>PEOPLE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Documents & letters
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Read and acknowledge policies, keep your documents up to date, and request letters.
        </p>
      </div>

      {/* Tabs matching Screenshots 3, 4, 5 */}
      <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('policies')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'policies'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Policies
        </button>

        <button
          onClick={() => setActiveTab('my-documents')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'my-documents'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          My documents
        </button>

        <button
          onClick={() => setActiveTab('letter-requests')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'letter-requests'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Letter requests
        </button>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: POLICIES (matching Screenshot 3) */}
      {/* =================================================================== */}
      {activeTab === 'policies' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Company policies
            </h2>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {policies.map((pol) => (
              <div
                key={pol.id}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {pol.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {pol.version}, updated {pol.updated_date}
                      {pol.acknowledgement_required ? ', acknowledgement required' : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => setSelectedPolicy(pol)}
                    className="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs transition-all cursor-pointer"
                  >
                    Read
                  </button>

                  {pol.acknowledgement_required && (
                    pol.acknowledged ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Acknowledged</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAcknowledge(pol.id)}
                        className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        Acknowledge
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: MY DOCUMENTS (matching Screenshot 4) */}
      {/* =================================================================== */}
      {activeTab === 'my-documents' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              My documents
            </h2>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors cursor-pointer"
            >
              Upload document
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/20">
                  <th className="px-6 py-3.5">DOCUMENT</th>
                  <th className="px-6 py-3.5">STATUS</th>
                  <th className="px-6 py-3.5 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white text-sm">
                      {doc.document_name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Verified</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => downloadFile(doc.download_url, `${doc.document_name.toLowerCase().replace(' ', '_')}.pdf`)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                        <span>Download</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: LETTER REQUESTS (matching Screenshot 5) */}
      {/* =================================================================== */}
      {activeTab === 'letter-requests' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Letter requests
            </h2>
            <button
              onClick={() => setIsLetterModalOpen(true)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors cursor-pointer"
            >
              Request a letter
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/20">
                  <th className="px-6 py-3.5">LETTER</th>
                  <th className="px-6 py-3.5">ADDRESSED TO</th>
                  <th className="px-6 py-3.5">REQUESTED</th>
                  <th className="px-6 py-3.5">STATUS</th>
                  <th className="px-6 py-3.5 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {letters.map((ltr) => (
                  <tr key={ltr.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white text-sm">
                      {ltr.letter_type}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {ltr.addressed_to}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {ltr.requested_date}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Issued</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => downloadFile(ltr.download_url, `letter_${ltr.id.toLowerCase()}.pdf`)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                        <span>Download</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Read Policy */}
      {selectedPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedPolicy.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedPolicy.version} · Updated on {selectedPolicy.updated_date}
                </p>
              </div>
              <button
                onClick={() => setSelectedPolicy(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Policy Summary
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedPolicy.content}
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <p>
                  <strong>1. Purpose & Scope:</strong> This document outlines Brightcone's official guidelines applicable to all full-time employees, contractors, and interns. Adherence ensures transparency, compliance, and mutual respect across distributed and hybrid workplaces.
                </p>
                <p>
                  <strong>2. Employee Responsibilities:</strong> Team members are expected to maintain integrity, uphold information security policies, and communicate transparently with managers and HR personnel.
                </p>
                <p>
                  <strong>3. Support & Redressal:</strong> Inquiries, disputes, or clarifications regarding this policy should be routed to People Operations via the HR Helpdesk.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
              <span className="text-xs text-slate-500">
                Status:{' '}
                <strong className={selectedPolicy.acknowledged ? 'text-emerald-600' : 'text-amber-600'}>
                  {selectedPolicy.acknowledged ? 'Acknowledged' : 'Pending acknowledgement'}
                </strong>
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedPolicy(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Close
                </button>
                {selectedPolicy.acknowledgement_required && !selectedPolicy.acknowledged && (
                  <button
                    onClick={() => handleAcknowledge(selectedPolicy.id)}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Acknowledge Policy
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Upload Document */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Upload employee document
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Store verified identity cards, certificates, and compliance records.
                </p>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFileUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Document Type
                </label>
                <select
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                >
                  <option value="PAN card">PAN card</option>
                  <option value="Aadhaar">Aadhaar</option>
                  <option value="Degree certificate">Degree certificate</option>
                  <option value="Passport">Passport</option>
                  <option value="Voter ID">Voter ID</option>
                  <option value="Relieving Letter">Relieving Letter</option>
                  <option value="Experience Certificate">Experience Certificate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Choose file (.pdf, .png, .jpg)
                </label>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    required
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {selectedFile && (
                    <div className="mt-2 text-xs font-semibold text-emerald-600">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingDoc || !selectedFile}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {uploadingDoc ? 'Uploading...' : 'Upload & verify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Request a Letter */}
      {isLetterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Request official letter
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generate instant corporate verification and embassy letters.
                </p>
              </div>
              <button
                onClick={() => setIsLetterModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestLetter} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Letter Type
                </label>
                <select
                  value={letterType}
                  onChange={(e) => setLetterType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                >
                  <option value="Employment verification">Employment verification</option>
                  <option value="Visa support letter">Visa support letter</option>
                  <option value="Salary confirmation letter">Salary confirmation letter</option>
                  <option value="Address proof certificate">Address proof certificate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Addressed To
                </label>
                <input
                  type="text"
                  value={addressedTo}
                  onChange={(e) => setAddressedTo(e.target.value)}
                  placeholder="e.g. HDFC Bank, US Consulate, Landlord"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Purpose / Notes
                </label>
                <textarea
                  value={letterPurpose}
                  onChange={(e) => setLetterPurpose(e.target.value)}
                  placeholder="State the purpose of this letter request..."
                  rows={3}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsLetterModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requestingLetter}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {requestingLetter ? 'Generating...' : 'Issue letter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsAndLettersPage;
