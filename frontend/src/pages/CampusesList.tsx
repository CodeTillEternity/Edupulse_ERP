
import { useState } from 'react';
import { Search, Loader2, MapPin, MoreHorizontal, Trash, Download, Printer, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../config/api';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CampusResponse } from '../types/institution';
import { CreateCampusDialog } from '../components/CreateCampusDialog';
import { toast } from 'sonner';
import { useInstitutionStore } from '../store/useInstitutionStore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

export default function CampusesList() {
  const queryClient = useQueryClient();
  const { institution } = useInstitutionStore();
  const [search, setSearch] = useState('');

  const { data: campuses, isLoading, isError } = useQuery<CampusResponse[]>({
    queryKey: ['campuses'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/campuses');
      return res.data || [];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/api/v1/campuses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campuses'] });
      toast.success('Campus deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete campus');
    }
  });

  const filteredCampuses = campuses?.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.address?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const exportCampusesCsv = () => {
    if (filteredCampuses.length === 0) {
      toast.error('No campuses to export.');
      return;
    }

    const headers = [
      'Campus ID',
      'Campus Name',
      'Physical Address',
      'Institution Code',
      'Parent Institution',
      'Node Status',
      'Export Date'
    ];

    const rows = filteredCampuses.map((c) => [
      c.id,
      c.name,
      c.address,
      c.institutionId,
      institution.name || 'Central University System',
      'Active Operational Node',
      new Date().toISOString().split('T')[0]
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers, ...rows]
        .map((e) => e.map((cell) => `"${(cell ?? '').toString().replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Campus_Nodes_Directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Campus nodes directory exported to CSV.');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Campuses &amp; Regional Nodes</h1>
          <p className="text-slate-500 text-sm">Manage physical campus locations, affiliated extension centres, and node endpoints.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={exportCampusesCsv}
            disabled={filteredCampuses.length === 0}
            className="text-xs h-9 border-slate-300 hover:bg-slate-50 text-slate-700 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-indigo-600" /> Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            disabled={filteredCampuses.length === 0}
            className="text-xs h-9 border-slate-300 hover:bg-slate-50 text-slate-700 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5 text-slate-600" /> Print Directory
          </Button>
          <CreateCampusDialog />
        </div>
      </div>

      <div className="bg-white p-4 rounded-t-2xl border-b border-slate-100 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              type="text" 
              placeholder="Search campuses by name or location..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border-slate-200 rounded-lg text-sm w-full sm:w-72 h-10"
            />
          </div>
        </div>
        <div className="text-sm text-slate-500 font-medium">
          {filteredCampuses.length} campuses
        </div>
      </div>

      <div className="bg-white rounded-b-2xl shadow-sm border border-slate-100 border-t-0">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold px-6 py-4">Campus Node Name</TableHead>
              <TableHead className="font-semibold px-6 py-4">Physical Address</TableHead>
              <TableHead className="font-semibold px-6 py-4">Node Health</TableHead>
              <TableHead className="font-semibold px-6 py-4">Institution ID</TableHead>
              <TableHead className="font-semibold px-6 py-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                  <div className="flex justify-center items-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-destructive">Failed to load campuses.</TableCell>
              </TableRow>
            ) : filteredCampuses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                  No campuses found.<br/>
                  <span className="text-sm mt-1 block">Campuses will appear here once they are registered.</span>
                </TableCell>
              </TableRow>
            ) : (
              filteredCampuses.map((campus) => (
                <TableRow key={campus.id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                        <MapPin className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{campus.name}</div>
                        <div className="text-xs text-slate-400">Node Identifier #{campus.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-slate-600">
                    {campus.address}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active Operational
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      INST: {campus.institutionId}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right text-slate-400">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="More options" className="text-slate-400 hover:text-slate-700">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={() => {
                          if(window.confirm(`Are you sure you want to delete campus "${campus.name}"?`)) deleteMutation.mutate(campus.id);
                        }}>
                          <Trash className="w-4 h-4 mr-2" /> Delete Campus Node
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






