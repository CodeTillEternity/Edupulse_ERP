import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Loader2,
  Building2,
  MoreHorizontal,
  Trash,
  Download,
  Printer,
  Palette,
  ShieldCheck,
} from 'lucide-react';
import { apiClient } from '../config/api';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { InstitutionResponse } from '../types/institution';
import { CreateInstitutionDialog } from '../components/CreateInstitutionDialog';
import { useInstitutionStore } from '../store/useInstitutionStore';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

export default function InstitutionsList() {
  const queryClient = useQueryClient();
  const { institution: activeProfile } = useInstitutionStore();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: institutions = [], isLoading, isError } = useQuery<InstitutionResponse[]>({
    queryKey: ['institutions'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/institutions');
      return res.data || [];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/api/v1/institutions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
      toast.success('Institution deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete institution');
    }
  });

  const filteredInstitutions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return institutions;
    return institutions.filter(
      (inst) =>
        (inst.name || '').toLowerCase().includes(q) ||
        (inst.code || '').toLowerCase().includes(q) ||
        String(inst.id).includes(q)
    );
  }, [institutions, searchQuery]);

  const handleExportCsv = () => {
    if (filteredInstitutions.length === 0) {
      toast.error('No institutions available to export');
      return;
    }
    const headerLines = [
      `"${(activeProfile.name || 'Institutional ERP').replace(/"/g, '""')} — Institutions Directory"`,
      `"Exported At","${new Date().toISOString()}"`,
      '',
      'ID,Institution Name,Institution Code'
    ];
    const rows = filteredInstitutions.map((inst) =>
      [
        inst.id,
        `"${(inst.name || '').replace(/"/g, '""')}"`,
        `"${(inst.code || '').replace(/"/g, '""')}"`,
      ].join(',')
    );
    const blob = new Blob([[...headerLines, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `institutions-directory-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredInstitutions.length} institution record(s)`);
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Institutions Directory</h1>
          <p className="text-slate-500 text-sm">
            Manage top-level institutional tenants, node identifiers, and workspace branding profiles.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <Link to="/dashboard/institution-profile">
            <Button variant="outline" size="sm" className="gap-1.5 border-slate-200 text-slate-700">
              <Palette className="w-4 h-4" /> Branding Profile
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={isLoading || filteredInstitutions.length === 0}
            className="gap-1.5 border-slate-200 text-slate-700"
          >
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5 border-slate-200 text-slate-700"
          >
            <Printer className="w-4 h-4" /> Print Directory
          </Button>
          <CreateInstitutionDialog />
        </div>
      </div>

      {/* Institutional Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Configured Institutions
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{institutions.length}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Visible Directory Matches
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{filteredInstitutions.length}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <Search className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Active Workspace Tenant
            </div>
            <div className="text-sm font-bold text-slate-900 mt-1 truncate">
              {activeProfile.name || 'Institutional ERP'}
            </div>
            <div className="text-xs font-mono text-slate-500 mt-0.5">
              Code: {activeProfile.code || '—'} · {activeProfile.campus || 'Main Campus'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 print:hidden">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by institution name, code, or ID..."
                className="pl-9 pr-4 py-2 bg-slate-50 border-slate-200 rounded-lg text-sm w-full h-10"
              />
            </div>
            {searchQuery && (
              <Button variant="ghost" size="sm" onClick={() => setSearchQuery('')} className="text-xs text-slate-500">
                Clear
              </Button>
            )}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Showing {filteredInstitutions.length} of {institutions.length} institution(s)
          </div>
        </div>

        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold px-6 py-4">ID</TableHead>
              <TableHead className="font-semibold px-6 py-4">Institution Name</TableHead>
              <TableHead className="font-semibold px-6 py-4">Institution Code</TableHead>
              <TableHead className="font-semibold px-6 py-4 text-right print:hidden">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                  <div className="flex justify-center items-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-destructive">
                  Failed to load institutions.
                </TableCell>
              </TableRow>
            ) : filteredInstitutions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-48 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <Building2 className="w-8 h-8 text-slate-300 mb-2" />
                    <div className="font-medium text-slate-900">
                      {searchQuery ? 'No matching institutions found.' : 'No institutions configured yet.'}
                    </div>
                    <div className="text-sm mt-1">
                      {searchQuery
                        ? 'Try clearing or adjusting your search query.'
                        : 'Please add an institution to get started.'}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredInstitutions.map((inst) => (
                <TableRow key={inst.id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell className="px-6 py-4 font-mono text-xs text-slate-500">
                    #{inst.id}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-slate-600" />
                      </div>
                      <div className="font-semibold text-slate-900">{inst.name}</div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200/70">
                      {inst.code}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right text-slate-400 print:hidden">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="More options" className="text-slate-400 hover:text-slate-700">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive cursor-pointer"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete "${inst.name}"?`)) {
                              deleteMutation.mutate(inst.id);
                            }
                          }}
                        >
                          <Trash className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}






