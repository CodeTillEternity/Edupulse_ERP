import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  BookOpen,
  BookMarked,
  Plus,
  Search,
  RotateCcw,
  Layers,
  CheckCircle2,
  Calendar,
  User,
  Hash,
  X,
  BookmarkCheck,
  Library,
  Download,
  Printer,
  Award
} from 'lucide-react';
import {
  getBooks,
  addBook,
  getActiveIssues,
  issueBook,
  returnBook,
} from '../../api/enterpriseOpsService';
import { useInstitutionStore } from '../../store/useInstitutionStore';

const EMPTY_ARRAY = [];

export default function LibraryManager() {
  const queryClient = useQueryClient();
  const { institution } = useInstitutionStore();

  // Active Tab: 'inventory' | 'circulation'
  const [activeTab, setActiveTab] = useState('inventory');

  // Search filter for inventory
  const [searchQuery, setSearchQuery] = useState('');

  // Add Book Modal state
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [newBookForm, setNewBookForm] = useState({
    title: '',
    author: '',
    isbn: '',
    totalCopies: 5,
  });

  // Issue Book Form state
  const [issueForm, setIssueForm] = useState({
    bookId: '',
    studentId: '',
  });

  // ==========================================
  // DATA QUERIES
  // ==========================================

  const {
    data: books = EMPTY_ARRAY,
    isLoading: isLoadingBooks,
  } = useQuery({
    queryKey: ['libraryBooks'],
    queryFn: getBooks,
  });

  const {
    data: activeIssues = EMPTY_ARRAY,
    isLoading: isLoadingIssues,
  } = useQuery({
    queryKey: ['libraryIssues'],
    queryFn: getActiveIssues,
  });

  // ==========================================
  // MUTATIONS
  // ==========================================

  const addBookMutation = useMutation({
    mutationFn: addBook,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['libraryBooks'] });
      queryClient.invalidateQueries({ queryKey: ['naacMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['complianceMetrics'] });
      toast.success(`Book "${data.title}" added to inventory successfully!`);
      setIsAddBookModalOpen(false);
      setNewBookForm({ title: '', author: '', isbn: '', totalCopies: 5 });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Failed to catalog book';
      toast.error(msg);
    },
  });

  const issueBookMutation = useMutation({
    mutationFn: issueBook,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['libraryIssues'] });
      queryClient.invalidateQueries({ queryKey: ['libraryBooks'] });
      queryClient.invalidateQueries({ queryKey: ['naacMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['complianceMetrics'] });
      toast.success(`Book issued successfully! Due date: ${data.dueDate}`);
      setIssueForm({ bookId: '', studentId: '' });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Failed to issue book';
      toast.error(msg);
    },
  });

  const returnBookMutation = useMutation({
    mutationFn: returnBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['libraryIssues'] });
      queryClient.invalidateQueries({ queryKey: ['libraryBooks'] });
      queryClient.invalidateQueries({ queryKey: ['naacMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['complianceMetrics'] });
      toast.success('Book returned successfully and inventory updated!');
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Failed to process book return';
      toast.error(msg);
    },
  });

  // ==========================================
  // DERIVED STATE & METRICS
  // ==========================================

  const filteredBooks = useMemo(() => {
    if (!searchQuery.trim()) return books;
    const q = searchQuery.toLowerCase();
    return books.filter(
      (b) =>
        b.title?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q) ||
        b.isbn?.toLowerCase().includes(q)
    );
  }, [books, searchQuery]);

  const totalTitlesCount = books.length;
  const totalVolumeCopies = useMemo(
    () => books.reduce((sum, b) => sum + (Number(b.totalCopies) || 0), 0),
    [books]
  );
  const totalAvailableCopies = useMemo(
    () => books.reduce((sum, b) => sum + (Number(b.availableCopies) || 0), 0),
    [books]
  );
  const activeCirculationCount = activeIssues.length;

  const exportInventoryCsv = () => {
    const headers = ['Book ID', 'Book Title', 'Author', 'ISBN', 'Total Volumes', 'Available Copies', 'Checked Out'];
    const rows = filteredBooks.map((b) => [
      `BK-${b.id}`,
      b.title,
      b.author,
      b.isbn,
      String(b.totalCopies),
      String(b.availableCopies),
      String((Number(b.totalCopies) || 0) - (Number(b.availableCopies) || 0))
    ]);

    const metaRows = [
      ['STATUTORY NAAC CRITERION 4.2 LIBRARY HOLDINGS DOSSIER', '', '', '', '', '', ''],
      ['Institution', institution.name || 'Central University System', '', '', '', '', ''],
      ['Institution Code', institution.code || 'CUS-01', '', '', '', '', ''],
      ['Campus Node', institution.campus || 'Main Campus', '', '', '', '', ''],
      ['Total Cataloged Titles', `${totalTitlesCount}`, '', '', '', '', ''],
      ['Total Volume Holdings', `${totalVolumeCopies}`, '', '', '', '', ''],
      ['Audit Timestamp', new Date().toISOString(), '', '', '', '', ''],
      ['', '', '', '', '', '', '']
    ];

    const all = [...metaRows, headers, ...rows];
    const csvContent = 'data:text/csv;charset=utf-8,' + all.map((r) => r.map((c) => `"${(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `Library_Catalog_${institution.code || 'INST'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloaded library catalog inventory (CSV).');
  };

  const exportCirculationCsv = () => {
    const headers = ['Issue ID', 'Book ID', 'Student ID', 'Issue Date', 'Due Date', 'Status'];
    const rows = activeIssues.map((i) => [
      `ISS-${i.id}`,
      `BK-${i.bookId}`,
      `STU-${i.studentId}`,
      i.issueDate,
      i.dueDate,
      'ACTIVE_LOAN'
    ]);

    const metaRows = [
      ['STATUTORY NAAC CRITERION 4.2.4 CIRCULATION REGISTER', '', '', '', '', ''],
      ['Institution', institution.name || 'Central University System', '', '', '', ''],
      ['Active Circulation Transactions', `${activeCirculationCount}`, '', '', '', ''],
      ['Generated On', new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }), '', '', '', ''],
      ['', '', '', '', '', '']
    ];

    const all = [...metaRows, headers, ...rows];
    const csvContent = 'data:text/csv;charset=utf-8,' + all.map((r) => r.map((c) => `"${(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `Library_Circulation_${institution.code || 'INST'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloaded active circulation register (CSV).');
  };

  const handleQuickIssue = (bookId) => {
    setIssueForm((prev) => ({ ...prev, bookId: String(bookId) }));
    setActiveTab('circulation');
  };

  const handleAddBookSubmit = (e) => {
    e.preventDefault();
    if (!newBookForm.title.trim() || !newBookForm.author.trim() || !newBookForm.isbn.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    addBookMutation.mutate({
      title: newBookForm.title.trim(),
      author: newBookForm.author.trim(),
      isbn: newBookForm.isbn.trim(),
      totalCopies: Number(newBookForm.totalCopies),
    });
  };

  const handleIssueSubmit = (e) => {
    e.preventDefault();
    if (!issueForm.bookId || !issueForm.studentId) {
      toast.error('Please select a book and specify the student ID');
      return;
    }
    issueBookMutation.mutate({
      bookId: Number(issueForm.bookId),
      studentId: Number(issueForm.studentId),
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
            <Library className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase mb-1">
              <Award className="w-3.5 h-3.5" /> NAAC Criterion 4.2 Resource Center
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-medium normal-case">{institution.name || 'Central University'}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Library &amp; Resource Center</h1>
            <p className="text-sm text-slate-500 mt-1">
              Catalog asset tracking, automated circulation, and multi-tenant student lending management.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 shadow-sm transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" /> Print Register
          </button>

          <button
            onClick={activeTab === 'inventory' ? exportInventoryCsv : exportCirculationCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>{activeTab === 'inventory' ? 'Export Catalog (CSV)' : 'Export Loans (CSV)'}</span>
          </button>

          {/* Tab Switcher Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'inventory'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Inventory ({totalTitlesCount})
            </button>
            <button
              onClick={() => setActiveTab('circulation')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'circulation'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              Circulation ({activeCirculationCount})
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Catalog Titles</p>
            <p className="text-2xl font-bold text-slate-900">{totalTitlesCount}</p>
            <p className="text-[10px] text-blue-600 font-semibold mt-0.5">NAAC 4.2.2 Compliant</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Volume</p>
            <p className="text-2xl font-bold text-slate-900">{totalVolumeCopies} Copies</p>
            <p className="text-[10px] text-purple-600 font-semibold mt-0.5">Physical &amp; Reference Assets</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Available on Shelf</p>
            <p className="text-2xl font-bold text-emerald-600">{totalAvailableCopies} Copies</p>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Ready for Issue</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <BookMarked className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Loans</p>
            <p className="text-2xl font-bold text-amber-600">{activeCirculationCount} Borrowed</p>
            <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Circulation Events Logged</p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: INVENTORY TAB                                                      */}
      {/* ========================================================================= */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog by title, author, or ISBN..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <button
              onClick={() => setIsAddBookModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Book Asset
            </button>
          </div>

          {/* Catalog Inventory Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Book Title &amp; Details</th>
                    <th className="py-3.5 px-4">Author</th>
                    <th className="py-3.5 px-4">ISBN</th>
                    <th className="py-3.5 px-4 text-center">Total Copies</th>
                    <th className="py-3.5 px-4 text-center">Available</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {isLoadingBooks ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mr-2" />
                        Loading catalog inventory...
                      </td>
                    </tr>
                  ) : filteredBooks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <BookOpen className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        No books found in catalog. Click "Add Book Asset" to register your first volume.
                      </td>
                    </tr>
                  ) : (
                    filteredBooks.map((book) => {
                      const isAvailable = (book.availableCopies || 0) > 0;
                      return (
                        <tr key={book.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-medium text-slate-900">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                <BookOpen className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">{book.title}</p>
                                <p className="text-xs text-slate-500">ID: #{book.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">{book.author}</td>
                          <td className="py-3.5 px-4 font-mono text-xs text-slate-500">{book.isbn}</td>
                          <td className="py-3.5 px-4 text-center font-medium text-slate-700">
                            {book.totalCopies}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                isAvailable
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isAvailable ? 'bg-emerald-500' : 'bg-rose-500'
                                }`}
                              />
                              {book.availableCopies} available
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              disabled={!isAvailable}
                              onClick={() => handleQuickIssue(book.id)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                isAvailable
                                  ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 cursor-pointer'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                              }`}
                            >
                              <BookmarkCheck className="w-3.5 h-3.5" />
                              Issue Copy
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CIRCULATION TAB                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'circulation' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Issue Book Form */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <BookmarkCheck className="w-5 h-5 text-indigo-600" />
              Issue Book to Student
            </h2>
            <form onSubmit={handleIssueSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Select Book Asset *
                </label>
                <select
                  value={issueForm.bookId}
                  onChange={(e) => setIssueForm({ ...issueForm, bookId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                >
                  <option value="">-- Choose Book --</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id} disabled={(b.availableCopies || 0) <= 0}>
                      {b.title} ({(b.availableCopies || 0)} avail.)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Student Database ID *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    value={issueForm.studentId}
                    onChange={(e) => setIssueForm({ ...issueForm, studentId: e.target.value })}
                    placeholder="e.g. 1"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    required
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">Provide student internal primary ID.</p>
              </div>

              <button
                type="submit"
                disabled={issueBookMutation.isPending}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {issueBookMutation.isPending ? 'Issuing Book...' : 'Confirm Book Loan'}
              </button>
            </form>
          </div>

          {/* Active Loans Table */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-indigo-600" />
                Active Student Circulation Loans
              </h2>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                {activeIssues.length} on loan
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Loan Record</th>
                    <th className="py-3.5 px-4">Student ID</th>
                    <th className="py-3.5 px-4">Issue Date</th>
                    <th className="py-3.5 px-4">Due Date</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {isLoadingIssues ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mr-2" />
                        Loading active circulation register...
                      </td>
                    </tr>
                  ) : activeIssues.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <BookMarked className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        No active loans currently in circulation.
                      </td>
                    </tr>
                  ) : (
                    activeIssues.map((issue) => (
                      <tr key={issue.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <Hash className="w-4 h-4 text-slate-400" />
                            <div>
                              <p className="font-semibold text-slate-900">Issue #{issue.id}</p>
                              <p className="text-xs text-slate-500">Book ID: #{issue.bookId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            Student #{issue.studentId}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <div className="flex items-center gap-1.5 text-xs">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {issue.issueDate}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                            <Calendar className="w-3.5 h-3.5 text-amber-500" />
                            {issue.dueDate}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => returnBookMutation.mutate(issue.id)}
                            disabled={returnBookMutation.isPending}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-200 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Return Book
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Book Asset Modal */}
      {isAddBookModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Add Book Asset</h3>
                  <p className="text-xs text-slate-500">Catalog a new title into institutional inventory</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddBookModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBookSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Book Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Operating Systems"
                  value={newBookForm.title}
                  onChange={(e) => setNewBookForm({ ...newBookForm, title: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Author / Editor *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Andrew S. Tanenbaum"
                  value={newBookForm.author}
                  onChange={(e) => setNewBookForm({ ...newBookForm, author: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ISBN Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 978-0133806083"
                    value={newBookForm.isbn}
                    onChange={(e) => setNewBookForm({ ...newBookForm, isbn: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total Volume Copies *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newBookForm.totalCopies}
                    onChange={(e) => setNewBookForm({ ...newBookForm, totalCopies: Number(e.target.value) })}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddBookModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addBookMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {addBookMutation.isPending ? 'Cataloging Asset...' : 'Register Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}