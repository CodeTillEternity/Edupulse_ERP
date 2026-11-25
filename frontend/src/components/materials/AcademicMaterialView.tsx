import React, { useState } from 'react';
import { PageFrame } from '../ui/PageFrame';
import {
  FileText,
  RefreshCw,
  Copy,
  Check,
  Search,
  Download,
  Printer,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { useInstitutionStore } from '../../store/useInstitutionStore';

export interface NotionBlock {
  id: string;
  type: string;
  plainText: string;
  language?: string;
  checked?: boolean;
  icon?: string;
}

export interface NotionPageData {
  pageId: string;
  title: string;
  courseCode: string;
  courseName: string;
  facultyName: string;
  lastSyncedAt: string;
  icon?: string;
  blocks: NotionBlock[];
}

const DEPARTMENT_CURRICULUM_HANDOUTS: NotionPageData[] = [
  {
    pageId: 'SYLL-CS302-RAFT',
    title: 'CS-302: Distributed Consensus & Raft Replicated State Machines',
    courseCode: 'CS-302',
    courseName: 'Advanced Distributed Systems',
    facultyName: 'Dr. Aris Thorne',
    lastSyncedAt: 'Semester Fall 2026',
    icon: '📘',
    blocks: [
      { id: 'b1', type: 'heading_1', plainText: '1. Safety & Liveness in Asynchronous Clusters' },
      { id: 'b2', type: 'paragraph', plainText: 'Raft decomposes consensus into Leader Election, Log Replication, and Safety guarantees. At most one leader can be elected in a given term using randomized election timeouts (150ms - 300ms).' },
      { id: 'b3', type: 'callout', icon: '📌', plainText: 'UGC Examination Note: Candidates must derive the Log Matching Property and explain why committing entries from previous terms requires an entry from the current term.' },
      { id: 'b4', type: 'heading_2', plainText: '2. RequestVote RPC Pseudocode' },
      { id: 'b5', type: 'code', language: 'typescript', plainText: 'interface RequestVoteArgs {\n  term: number;\n  candidateId: string;\n  lastLogIndex: number;\n  lastLogTerm: number;\n}' },
      { id: 'b6', type: 'heading_2', plainText: '3. Pre-Class Reading Checklist' },
      { id: 'b7', type: 'to_do', plainText: 'Review Ongaro & Ousterhout (2014) Section 5.4 Safety Proof', checked: true },
      { id: 'b8', type: 'to_do', plainText: 'Implement AppendEntries heartbeat RPC in Lab 3 Repository', checked: false },
    ]
  },
  {
    pageId: 'SYLL-SE404-K8S',
    title: 'SE-404: High-Availability Kubernetes Control Plane Topologies',
    courseCode: 'SE-404',
    courseName: 'Cloud Systems Architecture',
    facultyName: 'Prof. Elena Rostova',
    lastSyncedAt: 'Semester Fall 2026',
    icon: '⚙️',
    blocks: [
      { id: 'k1', type: 'heading_1', plainText: 'Stacked etcd vs External etcd Quorum Topologies' },
      { id: 'k2', type: 'paragraph', plainText: 'Production institutional clusters require an odd number of etcd consensus members (N=3 or N=5) to tolerate (N-1)/2 node failures without split-brain quorum loss.' },
      { id: 'k3', type: 'numbered_list_item', plainText: 'Configure API Server load balancer health checks on TCP/6443' },
      { id: 'k4', type: 'numbered_list_item', plainText: 'Enforce NetworkPolicy default-deny ingress between tenant namespaces' },
      { id: 'k5', type: 'numbered_list_item', plainText: 'Schedule PodDisruptionBudget minAvailable policies for stateful workloads' },
      { id: 'k6', type: 'to_do', plainText: 'Complete Helm Chart deployment verification worksheet', checked: false },
    ]
  },
  {
    pageId: 'SYLL-MA201-SVD',
    title: 'MA-201: Singular Value Decomposition & Spectral Decomposition',
    courseCode: 'MA-201',
    courseName: 'Applied Linear Algebra',
    facultyName: 'Dr. Marcus Vance',
    lastSyncedAt: 'Semester Fall 2026',
    icon: '📐',
    blocks: [
      { id: 'm1', type: 'heading_1', plainText: 'Eckart-Young-Mirsky Low-Rank Approximation Theorem' },
      { id: 'm2', type: 'paragraph', plainText: 'For any real or complex matrix A (m x n), the truncated SVD retains top-k singular values to provide the optimal rank-k approximation under both the Frobenius and spectral norms.' },
      { id: 'm3', type: 'callout', icon: '💡', plainText: 'Prerequisite: Orthogonal projections onto four fundamental subspaces (Column space, Nullspace, Row space, Left nullspace).' },
      { id: 'm4', type: 'to_do', plainText: 'Solve Assignment Set 4 (Problems 4.1 through 4.8)', checked: false },
    ]
  }
];

export const AcademicMaterialView: React.FC = () => {
  const { institution } = useInstitutionStore();
  const [pageIdInput, setPageIdInput] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<NotionPageData | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Syncs with the backend /api/v1/academic/notion/pages/{pageId}/sync
  const handleSyncNotionPage = async (pageIdToSync?: string) => {
    const targetId = (pageIdToSync || pageIdInput).trim();
    if (!targetId) {
      toast.error('Please enter a valid Notion Page ID');
      return;
    }

    const preset = DEPARTMENT_CURRICULUM_HANDOUTS.find((h) => h.pageId === targetId);
    if (preset && !pageIdToSync) {
      setCurrentPage(preset);
      toast.success(`Loaded institutional handout: ${preset.courseCode}`);
      return;
    }

    setIsSyncing(true);
    try {
      const response = await fetch(`/api/v1/academic/notion/pages/${targetId}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentPage({
          pageId: data.pageId || targetId,
          title: data.title || `Page ${targetId}`,
          courseCode: data.courseCode || 'ACAD',
          courseName: data.courseName || 'Course Notes',
          facultyName: data.facultyName || 'Faculty',
          lastSyncedAt: 'Just now',
          icon: data.icon || '📄',
          blocks: data.blocks || []
        });
        toast.success(`Synchronized Notion page: ${data.title || targetId}`);
      } else {
        if (preset) {
          setCurrentPage(preset);
          toast.success(`Loaded institutional handout: ${preset.courseCode}`);
        } else {
          setCurrentPage({
            pageId: targetId,
            title: `Document ${targetId}`,
            courseCode: 'ACAD',
            courseName: 'Course Notes',
            facultyName: 'Faculty Instructor',
            lastSyncedAt: 'Just now',
            icon: '📄',
            blocks: []
          });
          toast.info('Document initialized (empty blocks)');
        }
      }
    } catch {
      if (preset) {
        setCurrentPage(preset);
        toast.success(`Loaded institutional handout: ${preset.courseCode}`);
      } else {
        setCurrentPage({
          pageId: targetId,
          title: `Document ${targetId}`,
          courseCode: 'ACAD',
          courseName: 'Course Notes',
          facultyName: 'Faculty Instructor',
          lastSyncedAt: 'Just now',
          icon: '📄',
          blocks: []
        });
        toast.info('Document initialized (empty blocks)');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const copyCode = (blockId: string, code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCodeId(blockId);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const copyPageId = () => {
    if (!currentPage) return;
    navigator.clipboard?.writeText(currentPage.pageId);
    toast.success('Page ID copied');
  };

  const toggleTodo = (blockId: string) => {
    if (!currentPage) return;
    setCurrentPage(prev => {
      if (!prev) return null;
      return {
        ...prev,
        blocks: prev.blocks.map(b => (b.id === blockId ? { ...b, checked: !b.checked } : b))
      };
    });
  };

  const exportMarkdownHandout = () => {
    if (!currentPage) return;
    const lines = [
      `# ${currentPage.title}`,
      `> Institution: ${institution.name || 'Central University'} (${institution.code || 'INST'}) | Course: ${currentPage.courseCode} — ${currentPage.courseName} | Faculty: ${currentPage.facultyName}`,
      '',
      ...currentPage.blocks.map((b) => {
        if (b.type === 'heading_1') return `## ${b.plainText}\n`;
        if (b.type === 'heading_2') return `### ${b.plainText}\n`;
        if (b.type === 'heading_3') return `#### ${b.plainText}\n`;
        if (b.type === 'bulleted_list_item') return `- ${b.plainText}`;
        if (b.type === 'numbered_list_item') return `1. ${b.plainText}`;
        if (b.type === 'to_do') return `- [${b.checked ? 'x' : ' '}] ${b.plainText}`;
        if (b.type === 'code') return `\`\`\`${b.language || ''}\n${b.plainText}\n\`\`\`\n`;
        if (b.type === 'callout') return `> ${b.icon || ''} ${b.plainText}\n`;
        if (b.type === 'divider') return `---\n`;
        return `${b.plainText}\n`;
      }),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentPage.courseCode}_${currentPage.pageId}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported study handout as Markdown (${currentPage.courseCode}).`);
  };

  // Filter blocks based on search query
  const filteredBlocks = currentPage?.blocks.filter(b => {
    if (!searchQuery.trim()) return true;
    return b.plainText.toLowerCase().includes(searchQuery.toLowerCase());
  }) || [];

  let numberedCounter = 0;

  return (
    <PageFrame
      title="Faculty Notes & LMS Handout Repository"
      description={`${institution.name || 'Institutional'} synchronized lecture notes, CBCS reading lists, and Notion academic handouts.`}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Academics', href: '/dashboard/academics' },
        { label: 'Course Materials' }
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          {currentPage && (
            <>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-300"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Print Handout</span>
              </button>
              <button
                onClick={exportMarkdownHandout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-300"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export Markdown</span>
              </button>
              <button
                onClick={copyPageId}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-300"
                title="Copy Notion Page ID"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy ID</span>
              </button>
            </>
          )}
          <button
            onClick={() => handleSyncNotionPage()}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-medium"
            title="Sync live from Notion API"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync Live</span>
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Institutional Repository Quick-Load Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSyncNotionPage();
              }}
              className="flex items-center gap-2 flex-1 max-w-lg"
            >
              <input
                type="text"
                placeholder="Enter Notion Page ID (e.g. 1a2b3c4d5e6f...)"
                value={pageIdInput}
                onChange={(e) => setPageIdInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
              <button
                type="submit"
                disabled={isSyncing}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                Fetch Page
              </button>
            </form>

            {currentPage && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filter blocks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-44"
                  />
                </div>
                <span className="text-xs text-slate-500">
                  {currentPage.blocks.length} blocks
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 mr-1">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> Course Syllabi Handouts:
            </span>
            {DEPARTMENT_CURRICULUM_HANDOUTS.map((handout) => (
              <button
                key={handout.pageId}
                type="button"
                onClick={() => {
                  setPageIdInput(handout.pageId);
                  setCurrentPage(handout);
                  toast.success(`Opened syllabus handout: ${handout.courseCode}`);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  currentPage?.pageId === handout.pageId
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                {handout.courseCode} — {handout.courseName}
              </button>
            ))}
          </div>
        </div>

        {/* Document Reader Container */}
        <div
          data-testid="notion-document-container"
          className="bg-white border border-slate-200 rounded-xl p-8 max-w-4xl mx-auto min-h-[500px] shadow-xs"
        >
          {!currentPage ? (
            <div className="flex flex-col items-center justify-center h-80 text-center text-slate-400 space-y-2">
              <FileText className="w-10 h-10 text-slate-300" />
              <h3 className="text-sm font-semibold text-slate-700">Select a Course Handout or Sync Notion Page</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Choose a departmental course syllabus above or enter a Notion Page ID to render structured lecture notes.
              </p>
            </div>
          ) : currentPage.blocks.length === 0 ? (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-4">
                <div className="text-3xl mb-1">{currentPage.icon || '📄'}</div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{currentPage.title}</h1>
                <div className="text-xs text-slate-400 mt-1">Page ID: {currentPage.pageId}</div>
              </div>
              <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400 space-y-1">
                <p className="text-xs text-slate-500">This Notion page is currently empty (0 block children).</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Document Header */}
              <div className="border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{currentPage.icon || '📄'}</span>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded">
                    {currentPage.courseCode}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{currentPage.facultyName}</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{currentPage.title}</h1>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <span>Page ID: {currentPage.pageId}</span>
                  <span>•</span>
                  <span>Last synced: {currentPage.lastSyncedAt}</span>
                </div>
              </div>

              {/* Rendered Block Items */}
              <div className="space-y-3 pt-2">
                {filteredBlocks.map((block) => {
                  if (block.type !== 'numbered_list_item') {
                    numberedCounter = 0;
                  }
                  switch (block.type) {
                    case 'heading_1':
                      return (
                        <h2 key={block.id} className="text-xl font-bold text-slate-900 pt-3 border-b border-slate-100 pb-1">
                          {block.plainText}
                        </h2>
                      );

                    case 'heading_2':
                      return (
                        <h3 key={block.id} className="text-lg font-semibold text-slate-800 pt-2">
                          {block.plainText}
                        </h3>
                      );

                    case 'heading_3':
                      return (
                        <h4 key={block.id} className="text-sm font-semibold text-slate-800 pt-1">
                          {block.plainText}
                        </h4>
                      );

                    case 'paragraph':
                      return (
                        <p key={block.id} className="text-xs text-slate-700 leading-relaxed">
                          {block.plainText}
                        </p>
                      );

                    case 'bulleted_list_item':
                      return (
                        <div key={block.id} className="flex items-start space-x-2 text-xs text-slate-700 ml-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0"></span>
                          <span>{block.plainText}</span>
                        </div>
                      );

                    case 'numbered_list_item':
                      numberedCounter += 1;
                      return (
                        <div key={block.id} className="flex items-start space-x-2 text-xs text-slate-700 ml-2">
                          <span className="font-mono text-slate-400 text-xs">{numberedCounter}.</span>
                          <span>{block.plainText}</span>
                        </div>
                      );

                    case 'to_do':
                      return (
                        <div
                          key={block.id}
                          onClick={() => toggleTodo(block.id)}
                          className="flex items-center space-x-2.5 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                        >
                          <input
                            type="checkbox"
                            checked={!!block.checked}
                            onChange={() => {}}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-0"
                          />
                          <span className={block.checked ? 'line-through text-slate-400' : ''}>
                            {block.plainText}
                          </span>
                        </div>
                      );

                    case 'code':
                      return (
                        <div key={block.id} className="relative bg-slate-900 text-slate-100 rounded-lg p-3 text-xs font-mono my-2 overflow-x-auto">
                          <div className="flex justify-between items-center text-[10px] text-slate-400 pb-1 mb-2 border-b border-slate-800">
                            <span>{block.language || 'code'}</span>
                            <button
                              onClick={() => copyCode(block.id, block.plainText)}
                              className="hover:text-white flex items-center gap-1"
                            >
                              {copiedCodeId === block.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedCodeId === block.id ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                          <pre>{block.plainText}</pre>
                        </div>
                      );

                    case 'callout':
                      return (
                        <div key={block.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 flex items-start space-x-2">
                          <span className="text-base flex-shrink-0">{block.icon || 'ℹ️'}</span>
                          <span className="leading-relaxed">{block.plainText}</span>
                        </div>
                      );

                    case 'divider':
                      return <hr key={block.id} className="border-slate-200 my-3" />;

                    default:
                      return (
                        <div key={block.id} className="text-xs text-slate-700">
                          {block.plainText}
                        </div>
                      );
                  }
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageFrame>
  );
};

export default AcademicMaterialView;
