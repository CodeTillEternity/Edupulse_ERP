
import { useState } from 'react';
import {
  Search,
  Loader2,
  UserSquare2,
  Phone,
  MoreHorizontal,
  Trash,
  Mail,
  Download,
  Printer,
  MessageSquare,
  ShieldAlert,
  Users,
  Award,
} from 'lucide-react';
import { apiClient } from '../config/api';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { GuardianResponseDto } from '../types/guardian';
import { CreateGuardianDialog } from '../components/CreateGuardianDialog';
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

export default function GuardiansList() {
  const queryClient = useQueryClient();
  const { institution } = useInstitutionStore();
  const [search, setSearch] = useState('');
  const [emergencyOnly, setEmergencyOnly] = useState(false);

  const { data: responseData, isLoading, isError } = useQuery({
    queryKey: ['guardians'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/guardians');
      return res.data;
    }
  });

  // The backend wraps Guardian responses in ApiResponse.success(data)
  const guardians: GuardianResponseDto[] = responseData?.data || [];

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/api/v1/guardians/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guardians'] });
      toast.success('Guardian deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete guardian');
    }
  });

  const filteredGuardians = guardians.filter((g) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      g.fullName?.toLowerCase().includes(q) ||
      g.phone?.toLowerCase().includes(q) ||
      g.email?.toLowerCase().includes(q) ||
      g.occupation?.toLowerCase().includes(q) ||
      g.relation?.toLowerCase().includes(q);

    const matchesEmergency = !emergencyOnly || g.isEmergencyContact;
    return matchesSearch && matchesEmergency;
  });

  const emergencyCount = guardians.filter(g => g.isEmergencyContact).length;

  const exportGuardiansCsv = () => {
    if (filteredGuardians.length === 0) {
      toast.error('No guardian records to export.');
      return;
    }

    const headers = [
      'Guardian ID',
      'Full Name',
      'Relationship',
      'Contact Phone',
      'Email Address',
      'Occupation',
      'Emergency Contact',
      'Institution Name',
      'Campus Node',
      'Export Date'
    ];

    const rows = filteredGuardians.map((g) => [
      g.id,
      g.fullName,
      g.relation,
      g.phone,
      g.email || 'N/A',
      g.occupation || 'N/A',
      g.isEmergencyContact ? 'YES' : 'NO',
      institution.name || 'Central University System',
      institution.campus || 'Main Campus',
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
    link.setAttribute('download', `Guardian_Emergency_Directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Guardian directory exported to CSV.');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Guardians &amp; Emergency Contacts</h1>
          <p className="text-slate-500 text-sm">Parent and guardian contact registry with emergency broadcast capability.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={exportGuardiansCsv}
            disabled={filteredGuardians.length === 0}
            className="text-xs h-9 border-slate-300 hover:bg-slate-50 text-slate-700 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-indigo-600" /> Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            disabled={filteredGuardians.length === 0}
            className="text-xs h-9 border-slate-300 hover:bg-slate-50 text-slate-700 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5 text-slate-600" /> Print Directory
          </Button>
          <CreateGuardianDialog />
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Total Guardians</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{guardians.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Registered Contacts</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Emergency Listed</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-2">{emergencyCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Priority Emergency Dial</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Verified Phone</span>
            <Phone className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">
            {guardians.filter(g => g.phone).length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">WhatsApp / SMS Reachable</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Institutional Node</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-sm font-bold text-slate-900 mt-2 truncate">
            {institution.name || 'Central University'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Active Directory Scope</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-t-2xl border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              type="text" 
              placeholder="Search by name, phone, occupation..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border-slate-200 rounded-lg text-sm w-full h-10"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition">
            <input
              type="checkbox"
              checked={emergencyOnly}
              onChange={(e) => setEmergencyOnly(e.target.checked)}
              className="rounded text-rose-600 focus:ring-rose-500 w-3.5 h-3.5"
            />
            <span>Emergency Contacts Only</span>
          </label>
        </div>
        <div className="text-sm text-slate-500 font-medium">
          {filteredGuardians.length} {filteredGuardians.length === 1 ? 'guardian' : 'guardians'}
        </div>
      </div>

      <div className="bg-white rounded-b-2xl shadow-sm border border-slate-100 border-t-0 overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold px-6 py-4">Guardian Name</TableHead>
              <TableHead className="font-semibold px-6 py-4">Contact Info</TableHead>
              <TableHead className="font-semibold px-6 py-4">Relation</TableHead>
              <TableHead className="font-semibold px-6 py-4">Emergency</TableHead>
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
                <TableCell colSpan={5} className="h-24 text-center text-destructive">Failed to load guardians.</TableCell>
              </TableRow>
            ) : filteredGuardians.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                  No guardians found.<br/>
                  <span className="text-sm mt-1 block">Guardians will appear here once they are registered.</span>
                </TableCell>
              </TableRow>
            ) : (
              filteredGuardians.map((guardian) => (
                <TableRow key={guardian.id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                        <UserSquare2 className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{guardian.fullName}</div>
                        {guardian.occupation && <div className="text-xs text-slate-400">{guardian.occupation}</div>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center text-slate-600 text-sm font-mono">
                        <Phone className="w-3.5 h-3.5 mr-2 text-slate-400" />
                        {guardian.phone}
                      </div>
                      {guardian.email && (
                        <div className="flex items-center text-slate-500 text-xs">
                          <Mail className="w-3.5 h-3.5 mr-2 text-slate-400" />
                          {guardian.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {guardian.relation}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    {guardian.isEmergencyContact ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <ShieldAlert className="w-3 h-3 text-rose-600" /> Emergency
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs font-medium">Standard</span>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right text-slate-400">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="More options" className="text-slate-400 hover:text-slate-700">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {guardian.phone && (
                          <DropdownMenuItem
                            className="text-xs cursor-pointer"
                            onClick={() => {
                              const cleanPhone = guardian.phone.replace(/\D/g, '');
                              window.open(`https://wa.me/${cleanPhone}`, '_blank');
                            }}
                          >
                            <MessageSquare className="w-4 h-4 mr-2 text-emerald-600" /> WhatsApp Message
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={() => {
                          if(window.confirm(`Are you sure you want to delete guardian "${guardian.fullName}"?`)) deleteMutation.mutate(guardian.id);
                        }}>
                          <Trash className="w-4 h-4 mr-2" /> Delete Guardian
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






