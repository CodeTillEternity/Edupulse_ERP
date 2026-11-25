import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Bus,
  MapPin,
  Users,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Compass,
  UserCheck,
  X,
  Shield,
  Gauge,
  Navigation,
  Printer,
  Download,
  Award
} from 'lucide-react';
import {
  getVehicles,
  createVehicle,
  getRoutes,
  createRoute,
  assignStudent,
  getAllAssignments,
} from '../../api/enterpriseOpsService';
import { useInstitutionStore } from '../../store/useInstitutionStore';

const EMPTY_ARRAY = [];

export default function TransportManager() {
  const queryClient = useQueryClient();
  const { institution } = useInstitutionStore();

  // Active Tab: 'routes' | 'vehicles' | 'assignments'
  const [activeTab, setActiveTab] = useState('routes');

  // Modal controls
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Form states
  const [vehicleForm, setVehicleForm] = useState({
    registrationNumber: '',
    capacity: 40,
    driverName: '',
  });

  const [routeForm, setRouteForm] = useState({
    routeName: '',
    stops: '',
    vehicleId: '',
    monthlyFee: '1500.00',
  });

  const [assignForm, setAssignForm] = useState({
    routeId: '',
    studentId: '',
    pickupStop: '',
  });

  // Search filter
  const [searchFilter, setSearchFilter] = useState('');

  // ==========================================
  // DATA QUERIES
  // ==========================================

  const {
    data: vehicles = EMPTY_ARRAY,
    isLoading: isLoadingVehicles,
  } = useQuery({
    queryKey: ['transportVehicles'],
    queryFn: getVehicles,
  });

  const {
    data: routes = EMPTY_ARRAY,
    isLoading: isLoadingRoutes,
  } = useQuery({
    queryKey: ['transportRoutes'],
    queryFn: getRoutes,
  });

  const {
    data: assignments = EMPTY_ARRAY,
    isLoading: isLoadingAssignments,
  } = useQuery({
    queryKey: ['transportAssignments'],
    queryFn: getAllAssignments,
  });

  // ==========================================
  // MUTATIONS
  // ==========================================

  const createVehicleMutation = useMutation({
    mutationFn: createVehicle,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transportVehicles'] });
      queryClient.invalidateQueries({ queryKey: ['naacMetrics'] });
      toast.success(`Vehicle ${data.registrationNumber} registered in fleet!`);
      setIsVehicleModalOpen(false);
      setVehicleForm({ registrationNumber: '', capacity: 40, driverName: '' });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Failed to register vehicle';
      toast.error(msg);
    },
  });

  const createRouteMutation = useMutation({
    mutationFn: createRoute,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transportRoutes'] });
      queryClient.invalidateQueries({ queryKey: ['naacMetrics'] });
      toast.success(`Route "${data.routeName}" created successfully!`);
      setIsRouteModalOpen(false);
      setRouteForm({ routeName: '', stops: '', vehicleId: '', monthlyFee: '1500.00' });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Failed to create route';
      toast.error(msg);
    },
  });

  const assignStudentMutation = useMutation({
    mutationFn: assignStudent,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transportAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['transportRoutes'] });
      queryClient.invalidateQueries({ queryKey: ['naacMetrics'] });
      toast.success(`Student assigned to ${data.routeName} at stop "${data.pickupStop}"!`);
      setIsAssignModalOpen(false);
      setAssignForm({ routeId: '', studentId: '', pickupStop: '' });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Failed to assign student';
      toast.error(msg);
    },
  });

  // ==========================================
  // METRICS & FILTERS
  // ==========================================

  const totalCapacity = useMemo(
    () => vehicles.reduce((sum, v) => sum + (Number(v.capacity) || 0), 0),
    [vehicles]
  );

  const totalAssignedPassengers = useMemo(
    () => routes.reduce((sum, r) => sum + (Number(r.assignedCount) || 0), 0),
    [routes]
  );

  const filteredRoutes = useMemo(() => {
    if (!searchFilter.trim()) return routes;
    const q = searchFilter.toLowerCase();
    return routes.filter(
      (r) =>
        r.routeName?.toLowerCase().includes(q) ||
        r.stops?.toLowerCase().includes(q) ||
        r.vehicleRegistrationNumber?.toLowerCase().includes(q) ||
        r.driverName?.toLowerCase().includes(q)
    );
  }, [routes, searchFilter]);

  const exportTransportCsv = () => {
    let headers = [];
    let rows = [];
    let fileSuffix = 'Manifest';

    if (activeTab === 'routes') {
      fileSuffix = 'Routes';
      headers = ['Route ID', 'Route Name', 'Assigned Vehicle', 'Driver Name', 'Stops / Key Waypoints', 'Monthly Fare (INR)', 'Occupancy / Capacity', 'Status'];
      rows = filteredRoutes.map((r) => [
        `RT-${r.id}`,
        r.routeName,
        r.vehicleRegistrationNumber || 'Unassigned',
        r.driverName || 'Unassigned',
        r.stops || '',
        `INR ${Number(r.monthlyFee || 0).toLocaleString('en-IN')}`,
        `${r.assignedCount || 0} / ${r.vehicleCapacity || 0} Seats`,
        (r.assignedCount || 0) >= (r.vehicleCapacity || 0) ? 'CAPACITY_REACHED' : 'SEATS_AVAILABLE'
      ]);
    } else if (activeTab === 'vehicles') {
      fileSuffix = 'Fleet';
      headers = ['Vehicle ID', 'Registration Number', 'Seating Capacity', 'Designated Driver', 'Active Status'];
      rows = vehicles.map((v) => [
        `VEH-${v.id}`,
        v.registrationNumber,
        `${v.capacity} Passengers`,
        v.driverName,
        'ROAD_COMPLIANT'
      ]);
    } else {
      fileSuffix = 'Passengers';
      headers = ['Assignment ID', 'Student ID', 'Assigned Route', 'Pickup / Drop Stop', 'Bus Fare Surcharge'];
      rows = assignments.map((a) => [
        `ASN-${a.id}`,
        `STU-${a.studentId}`,
        a.routeName,
        a.pickupStop,
        'Active Pass'
      ]);
    }

    const metaRows = [
      ['STATUTORY CAMPUS FLEET & TRANSPORT LOGISTICS DOSSIER', '', '', '', '', '', '', ''],
      ['Institution', institution.name || 'Central University System', '', '', '', '', '', ''],
      ['Institution Code', institution.code || 'CUS-01', '', '', '', '', '', ''],
      ['Campus Node', institution.campus || 'Main Campus', '', '', '', '', '', ''],
      ['Fleet Capacity', `${totalCapacity} Total Seats`, '', '', '', '', '', ''],
      ['Commuter Ridership', `${totalAssignedPassengers} Enrolled Riders`, '', '', '', '', '', ''],
      ['Generated On', new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }), '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '']
    ];

    const all = [...metaRows, headers, ...rows];
    const csvContent = 'data:text/csv;charset=utf-8,' + all.map((r) => r.map((c) => `"${(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `Transport_${fileSuffix}_${institution.code || 'INST'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloaded transport ${fileSuffix.toLowerCase()} report (CSV).`);
  };

  const handleOpenAssignModalForRoute = (routeId) => {
    setAssignForm((prev) => ({ ...prev, routeId: String(routeId) }));
    setIsAssignModalOpen(true);
  };

  const handleVehicleSubmit = (e) => {
    e.preventDefault();
    if (!vehicleForm.registrationNumber.trim() || !vehicleForm.driverName.trim()) {
      toast.error('Please fill in all vehicle details');
      return;
    }
    createVehicleMutation.mutate({
      registrationNumber: vehicleForm.registrationNumber.trim().toUpperCase(),
      capacity: Number(vehicleForm.capacity),
      driverName: vehicleForm.driverName.trim(),
    });
  };

  const handleRouteSubmit = (e) => {
    e.preventDefault();
    if (!routeForm.routeName.trim() || !routeForm.stops.trim() || !routeForm.vehicleId) {
      toast.error('Please fill in route name, stops, and select a vehicle');
      return;
    }
    createRouteMutation.mutate({
      routeName: routeForm.routeName.trim(),
      stops: routeForm.stops.trim(),
      vehicleId: Number(routeForm.vehicleId),
      monthlyFee: Number(routeForm.monthlyFee),
    });
  };

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    if (!assignForm.routeId || !assignForm.studentId) {
      toast.error('Please select a route and enter a student ID');
      return;
    }
    const targetRoute = routes.find((r) => r.id === Number(assignForm.routeId));
    if (targetRoute && targetRoute.vehicleCapacity && (targetRoute.assignedCount || 0) >= targetRoute.vehicleCapacity) {
      toast.error(`Route "${targetRoute.routeName}" has reached maximum vehicle capacity of ${targetRoute.vehicleCapacity} passengers.`);
      return;
    }
    assignStudentMutation.mutate({
      routeId: Number(assignForm.routeId),
      studentId: Number(assignForm.studentId),
      pickupStop: assignForm.pickupStop.trim() || 'Main Campus Gate',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
            <Bus className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs tracking-wider uppercase mb-1">
              <Award className="w-3.5 h-3.5" /> Institutional Fleet &amp; Commuter Services
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-medium normal-case">{institution.name || 'Central Campus'}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Transport &amp; Fleet Logistics</h1>
            <p className="text-sm text-slate-500 mt-1">
              Vehicle fleet registry, commuter route mapping, and real-time student seating capacity management.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 shadow-sm transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" /> Print Manifest
          </button>

          <button
            onClick={exportTransportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" /> Export CSV
          </button>

          {/* Tab Navigation */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('routes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'routes'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-4 h-4" />
              Routes ({routes.length})
            </button>
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'vehicles'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bus className="w-4 h-4" />
              Vehicles ({vehicles.length})
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'assignments'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Passengers ({assignments.length})
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Fleet Vehicles</p>
            <p className="text-2xl font-bold text-slate-900">{vehicles.length} Units</p>
            <p className="text-[10px] text-blue-600 font-semibold mt-0.5">Campus Bus Network</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Routes</p>
            <p className="text-2xl font-bold text-slate-900">{routes.length} Routes</p>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Commuter Corridors</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Fleet Seats</p>
            <p className="text-2xl font-bold text-slate-900">{totalCapacity} Capacity</p>
            <p className="text-[10px] text-purple-600 font-semibold mt-0.5">Certified Seating Units</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned Riders</p>
            <p className="text-2xl font-bold text-amber-600">{totalAssignedPassengers} Allocated</p>
            <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Registered Student Commuters</p>
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search routes by name, stop, or vehicle..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setIsVehicleModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Vehicle
          </button>
          <button
            onClick={() => setIsRouteModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Map Route
          </button>
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            Assign Student
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ROUTES VIEW WITH CAPACITY KPI CARDS                                */}
      {/* ========================================================================= */}
      {activeTab === 'routes' && (
        <div>
          {isLoadingRoutes ? (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2" />
              Loading transport routes...
            </div>
          ) : filteredRoutes.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400">
              <Bus className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-600">No transport routes configured.</p>
              <p className="text-xs text-slate-400 mt-1">Register a vehicle and map your first commuter route above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRoutes.map((route) => {
                const assigned = Number(route.assignedCount) || 0;
                const capacity = Number(route.vehicleCapacity) || 1;
                const percent = Math.min(100, Math.round((assigned / capacity) * 100));
                const isFull = assigned >= capacity;

                let barColor = 'bg-emerald-500';
                let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                if (percent >= 90) {
                  barColor = 'bg-rose-500';
                  badgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
                } else if (percent >= 70) {
                  barColor = 'bg-amber-500';
                  badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
                }

                return (
                  <div
                    key={route.id}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                          Route #{route.id}
                        </span>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badgeClass}`}>
                          {assigned} / {capacity} Seats ({percent}%)
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-blue-600 shrink-0" />
                        {route.routeName}
                      </h3>

                      <div className="mt-3 space-y-2 text-xs text-slate-600">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{route.stops || 'No key waypoints mapped'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Bus className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>
                            {route.vehicleRegistrationNumber || 'Unassigned'} • Driver: {route.driverName || 'Pending'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">₹{Number(route.monthlyFee || 0).toLocaleString('en-IN')}</span>
                          <span className="text-slate-400">/ month bus pass fee</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      <div>
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>Seating Capacity</span>
                          <span className="font-semibold">{percent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${percent}%` }} />
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenAssignModalForRoute(route.id)}
                        disabled={isFull}
                        className={`w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                          isFull
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 cursor-pointer'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        {isFull ? 'Vehicle Full (40/40)' : 'Assign Student Passenger'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FLEET VEHICLES REGISTER                                            */}
      {/* ========================================================================= */}
      {activeTab === 'vehicles' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Bus className="w-5 h-5 text-blue-600" />
              Institutional Fleet Vehicle Registry
            </h2>
            <button
              onClick={() => setIsVehicleModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Register Vehicle
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Vehicle ID</th>
                  <th className="py-3.5 px-4">Registration #</th>
                  <th className="py-3.5 px-4 text-center">Seating Capacity</th>
                  <th className="py-3.5 px-4">Designated Driver</th>
                  <th className="py-3.5 px-4 text-center">Road Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoadingVehicles ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2" />
                      Loading fleet vehicles...
                    </td>
                  </tr>
                ) : vehicles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No vehicles found in fleet. Click "New Vehicle" to register your first transport bus.
                    </td>
                  </tr>
                ) : (
                  vehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-500">#{v.id}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <Bus className="w-4 h-4 text-blue-600" />
                        {v.registrationNumber}
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                        {v.capacity} Passengers
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">{v.driverName}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Certified
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: STUDENT COMMUTER PASSENGER ASSIGNMENTS                              */}
      {/* ========================================================================= */}
      {activeTab === 'assignments' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              Registered Student Commuters
            </h2>
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Assign Pass
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Pass ID</th>
                  <th className="py-3.5 px-4">Student ID</th>
                  <th className="py-3.5 px-4">Assigned Route</th>
                  <th className="py-3.5 px-4">Pickup / Drop Stop</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoadingAssignments ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2" />
                      Loading commuter roster...
                    </td>
                  </tr>
                ) : assignments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No students currently assigned to transport routes.
                    </td>
                  </tr>
                ) : (
                  assignments.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-500">#{a.id}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700">Student #{a.studentId}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{a.routeName}</td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {a.pickupStop}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active Pass
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: REGISTER VEHICLE                                                 */}
      {/* ========================================================================= */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Bus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Register Fleet Vehicle</h3>
                  <p className="text-xs text-slate-500">Add an institutional bus to the logistics fleet</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsVehicleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVehicleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registration Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DL-01-AB-1234"
                  value={vehicleForm.registrationNumber}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, registrationNumber: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 font-mono uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Designated Driver Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Kumar"
                  value={vehicleForm.driverName}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, driverName: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Seating Passenger Capacity *
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  required
                  value={vehicleForm.capacity}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, capacity: Number(e.target.value) })}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-xs text-slate-400 mt-1">Certified seating units without standing allowance.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsVehicleModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createVehicleMutation.isPending}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {createVehicleMutation.isPending ? 'Registering...' : 'Register Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: MAP ROUTE                                                        */}
      {/* ========================================================================= */}
      {isRouteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Map Commuter Route</h3>
                  <p className="text-xs text-slate-500">Configure transit corridor and bus assignment</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRouteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRouteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Route Name / Corridor *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. North Campus - Downtown Express"
                  value={routeForm.routeName}
                  onChange={(e) => setRouteForm({ ...routeForm, routeName: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assign Vehicle *
                </label>
                <select
                  required
                  value={routeForm.vehicleId}
                  onChange={(e) => setRouteForm({ ...routeForm, vehicleId: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Choose Vehicle --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.registrationNumber} ({v.capacity} Seats) - Driver: {v.driverName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Key Transit Stops / Waypoints *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Metro Station, Central Square, Hospital Crossing, Campus Gate"
                  value={routeForm.stops}
                  onChange={(e) => setRouteForm({ ...routeForm, stops: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Monthly Bus Pass Fee (INR) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={routeForm.monthlyFee}
                    onChange={(e) => setRouteForm({ ...routeForm, monthlyFee: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRouteModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createRouteMutation.isPending}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {createRouteMutation.isPending ? 'Mapping Route...' : 'Create Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ASSIGN STUDENT PASS                                              */}
      {/* ========================================================================= */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Issue Commuter Bus Pass</h3>
                  <p className="text-xs text-slate-500">Allocate a student seat to a transit route</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Commuter Route *
                </label>
                <select
                  required
                  value={assignForm.routeId}
                  onChange={(e) => setAssignForm({ ...assignForm, routeId: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Choose Route --</option>
                  {routes.map((r) => {
                    const isFull = (r.assignedCount || 0) >= (r.vehicleCapacity || 0);
                    return (
                      <option key={r.id} value={r.id} disabled={isFull}>
                        {r.routeName} ({r.assignedCount || 0}/{r.vehicleCapacity || 0} seats){isFull ? ' - FULL' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Student Database ID *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 1"
                  value={assignForm.studentId}
                  onChange={(e) => setAssignForm({ ...assignForm, studentId: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Boarding / Drop Stop *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sector 14 Metro Crossing"
                  value={assignForm.pickupStop}
                  onChange={(e) => setAssignForm({ ...assignForm, pickupStop: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignStudentMutation.isPending}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {assignStudentMutation.isPending ? 'Assigning...' : 'Allocate Seat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}