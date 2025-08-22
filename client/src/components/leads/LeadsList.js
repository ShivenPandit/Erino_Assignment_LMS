import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { Plus, Eye, Edit, Trash2, Filter, Download, RefreshCw, Users } from 'lucide-react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const LeadsList = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    source: '',
    minScore: '',
    maxScore: '',
    minValue: '',
    maxValue: '',
    isQualified: '',
    dateFrom: '',
    dateTo: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // AG Grid column definitions
  const columnDefs = useMemo(() => [
    {
      headerName: 'Name',
      field: 'firstName',
      valueGetter: (params) => `${params.data.firstName} ${params.data.lastName}`,
      sortable: true,
      filter: true,
      width: 150
    },
    {
      headerName: 'Email',
      field: 'email',
      sortable: true,
      filter: true,
      width: 200
    },
    {
      headerName: 'Company',
      field: 'company',
      sortable: true,
      filter: true,
      width: 150
    },
    {
      headerName: 'Phone',
      field: 'phone',
      sortable: true,
      filter: true,
      width: 130
    },
    {
      headerName: 'Status',
      field: 'status',
      sortable: true,
      filter: true,
      cellRenderer: (params) => {
        const status = params.data.status;
        const statusColors = {
          'new': 'bg-blue-100 text-blue-800',
          'contacted': 'bg-yellow-100 text-yellow-800',
          'qualified': 'bg-green-100 text-green-800',
          'won': 'bg-emerald-100 text-emerald-800',
          'lost': 'bg-red-100 text-red-800'
        };
        return `<span class="px-2 py-1 text-xs font-medium rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
      },
      width: 120
    },
    {
      headerName: 'Source',
      field: 'source',
      sortable: true,
      filter: true,
      valueGetter: (params) => params.data.source.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      width: 120
    },
    {
      headerName: 'Score',
      field: 'score',
      sortable: true,
      filter: true,
      valueGetter: (params) => `${params.data.score}%`,
      width: 120
    },
    {
      headerName: 'Value',
      field: 'leadValue',
      sortable: true,
      filter: true,
      valueGetter: (params) => `$${params.data.leadValue?.toLocaleString() || 0}`,
      width: 120
    },
    {
      headerName: 'Qualified',
      field: 'isQualified',
      sortable: true,
      filter: true,
      cellRenderer: (params) => {
        return params.data.isQualified ? 
          '<span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Yes</span>' :
          '<span class="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">No</span>';
      },
      width: 100
    },
    {
      headerName: 'Created',
      field: 'createdAt',
      sortable: true,
      filter: true,
      valueGetter: (params) => new Date(params.data.createdAt).toLocaleDateString(),
      width: 120
    },
    {
      headerName: 'Actions',
      field: 'actions',
      sortable: false,
      filter: false,
      cellRenderer: (params) => {
        return `
          <div class="flex items-center gap-2">
            <button class="p-1 text-gray-400 hover:text-primary-600 transition-colors" title="View Lead" onclick="window.viewLead('${params.data._id}')">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            </button>
            <button class="p-1 text-gray-400 hover:text-warning-600 transition-colors" title="Edit Lead" onclick="window.editLead('${params.data._id}')">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
            <button class="p-1 text-gray-400 hover:text-red-600 transition-colors" title="Delete Lead" onclick="window.deleteLead('${params.data._id}')">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        `;
      },
      width: 150
    }
  ], []);

  // AG Grid default column definitions
  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: false,
    suppressMenu: false,
    suppressMovableColumns: true,
    suppressSizeToFit: false
  }), []);

  // Fetch leads function wrapped in useCallback to prevent recreation
  const fetchLeads = useCallback(async (page = 1, customFilters = null) => {
    try {
      setLoading(true);
      
      const filtersToUse = customFilters || filters;
      const params = new URLSearchParams();
      
      // Add pagination params
      params.append('page', page.toString());
      params.append('limit', pagination.itemsPerPage.toString());
      
      // Add filter params
      Object.entries(filtersToUse).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value);
        }
      });

      console.log('Fetching leads with params:', params.toString());
      
      const response = await api.get(`/api/leads?${params}`);
      
      if (response.data.success) {
        console.log('Setting leads:', response.data.data.leads);
        setLeads(response.data.data.leads);
        // Update pagination with the new page
        const newPagination = {
          ...response.data.data.pagination,
          currentPage: page
        };
        setPagination(newPagination);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      console.error('Error details:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        data: error.response?.data
      });
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.itemsPerPage, user]);

  // Initial fetch - only if user is authenticated
  useEffect(() => {
    if (user && !authLoading) {
      fetchLeads();
    }
  }, [user, authLoading, fetchLeads]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    fetchLeads(1, filters);
  };

  // Clear filters
  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      status: '',
      source: '',
      minScore: '',
      maxScore: '',
      minValue: '',
      maxValue: '',
      isQualified: '',
      dateFrom: '',
      dateTo: ''
    };
    setFilters(clearedFilters);
    // Don't send empty filters - just fetch with default pagination
    fetchLeads(1, {});
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    fetchLeads(page, filters);
  };

  // Handle lead deletion
  const handleDeleteLead = async (leadId) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await api.delete(`/api/leads/${leadId}`);
        toast.success('Lead deleted successfully');
        fetchLeads(pagination.currentPage, filters);
      } catch (error) {
        console.error('Error deleting lead:', error);
        toast.error('Failed to delete lead');
      }
    }
  };

  // Export leads
  const exportLeads = () => {
    const csvContent = [
      ['Name', 'Email', 'Company', 'Phone', 'City', 'State', 'Source', 'Status', 'Score', 'Value', 'Qualified', 'Created'],
      ...leads.map(lead => [
        `${lead.firstName} ${lead.lastName}`,
        lead.email,
        lead.company,
        lead.phone,
        lead.city,
        lead.state,
        lead.source,
        lead.status,
        lead.score,
        lead.leadValue,
        lead.isQualified ? 'Yes' : 'No',
        new Date(lead.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Leads exported successfully');
  };

  // Set up global functions for AG Grid actions
  useEffect(() => {
    window.viewLead = (leadId) => navigate(`/leads/${leadId}`);
    window.editLead = (leadId) => navigate(`/leads/${leadId}/edit`);
    window.deleteLead = (leadId) => handleDeleteLead(leadId);
    
    // Cleanup function
    return () => {
      delete window.viewLead;
      delete window.editLead;
      delete window.deleteLead;
    };
  }, [navigate]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.firstName}! 👋</h1>
            <p className="text-primary-100 mt-2">Manage and track all your leads in one place</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/leads/new')}
              className="bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg px-4 py-2 text-white transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Lead
            </button>
            <button
              onClick={fetchLeads}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg px-4 py-2 text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Leads</p>
              <p className="text-3xl font-bold text-gray-900">{pagination.totalItems.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New Leads</p>
              <p className="text-3xl font-bold text-gray-900">
                {leads.filter(lead => lead.status === 'new').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <div className="w-6 h-6 bg-green-600 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Qualified</p>
              <p className="text-3xl font-bold text-gray-900">
                {leads.filter(lead => lead.status === 'qualified').length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <div className="w-6 h-6 bg-purple-600 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Won</p>
              <p className="text-3xl font-bold text-gray-900">
                {leads.filter(lead => lead.status === 'won').length}
              </p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <div className="w-6 h-6 bg-emerald-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search leads..."
                className="form-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="form-select w-full"
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <select
                value={filters.source}
                onChange={(e) => handleFilterChange('source', e.target.value)}
                className="form-select w-full"
              >
                <option value="">All Sources</option>
                <option value="website">Website</option>
                <option value="facebook_ads">Facebook Ads</option>
                <option value="google_ads">Google Ads</option>
                <option value="referral">Referral</option>
                <option value="events">Events</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Qualified</label>
              <select
                value={filters.isQualified}
                onChange={(e) => handleFilterChange('isQualified', e.target.value)}
                className="form-select w-full"
              >
                <option value="">All</option>
                <option value="true">Qualified</option>
                <option value="false">Not Qualified</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Score</label>
              <input
                type="number"
                value={filters.minScore}
                onChange={(e) => handleFilterChange('minScore', e.target.value)}
                placeholder="0"
                min="0"
                max="100"
                className="form-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Score</label>
              <input
                type="number"
                value={filters.maxScore}
                onChange={(e) => handleFilterChange('maxScore', e.target.value)}
                placeholder="100"
                min="0"
                max="100"
                className="form-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Value</label>
              <input
                type="number"
                value={filters.minValue}
                onChange={(e) => handleFilterChange('minValue', e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                className="form-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Value</label>
              <input
                type="number"
                value={filters.maxValue}
                onChange={(e) => handleFilterChange('maxValue', e.target.value)}
                placeholder="10000"
                min="0"
                step="0.01"
                className="form-input w-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="form-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="form-input w-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={applyFilters}
              className="btn-primary flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="btn-secondary"
            >
              Clear Filters
            </button>
                         <button
               onClick={() => fetchLeads(pagination.currentPage, filters)}
               className="btn-secondary flex items-center gap-2"
               disabled={loading}
             >
               <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
               Refresh
             </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {leads.length} of {pagination.totalItems} leads
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportLeads}
            className="btn-secondary flex items-center gap-2"
            disabled={leads.length === 0}
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

       {/* AG Grid */}
       <div className="card">
         <div className="card-header">
           <h3 className="text-lg font-medium text-gray-900">Leads Table</h3>
         </div>
         <div className="card-body p-0">
         {loading ? (
           <div className="flex items-center justify-center p-8">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
             <span className="ml-2 text-gray-600">Loading leads...</span>
           </div>
         ) : leads.length === 0 ? (
           <div className="flex flex-col items-center justify-center p-8 text-center">
             <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
               <Users className="h-8 w-8 text-gray-400" />
             </div>
             <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
             <p className="text-gray-600 mb-4">
               {Object.values(filters).some(v => v !== '') 
                 ? 'Try adjusting your filters or create a new lead.'
                 : 'Get started by creating your first lead.'
               }
             </p>
             <button
               onClick={() => navigate('/leads/new')}
               className="btn-primary flex items-center gap-2"
             >
               <Plus className="h-4 w-4" />
               Add Lead
             </button>
           </div>
         ) : (
                        <div className="ag-theme-alpine w-full" style={{ minHeight: '400px', height: 'auto' }}>
               <AgGridReact
                 columnDefs={columnDefs}
                 defaultColDef={defaultColDef}
                 rowData={leads}
                 pagination={false}
                 paginationPageSize={pagination.itemsPerPage}
                 domLayout="autoHeight"
                 suppressRowClickSelection={true}
                 suppressCellFocus={true}
                 suppressMovableColumns={true}
                 suppressMenuHide={true}
                 enableCellTextSelection={true}
                 rowSelection="single"
                 animateRows={true}
                 rowHeight={50}
                 suppressColumnVirtualisation={false}
                 suppressRowVirtualisation={false}
                 enableRangeSelection={false}
                 suppressCopyRowsToClipboard={true}
                 suppressExportSingleFileRichtextToCSV={true}
               />
             </div>
         )}
         </div>
       </div>

       {/* Pagination */}
       <div className="bg-white p-4 rounded-lg border border-gray-200">
         <div className="flex items-center justify-between">
           <div className="text-sm text-gray-600">
             {pagination.totalPages > 1 ? (
               <>
                 Page {pagination.currentPage} of {pagination.totalPages} • 
                 Showing {leads.length} of {pagination.totalItems} leads
               </>
             ) : (
               `Showing ${leads.length} of ${pagination.totalItems} leads`
             )}
           </div>
           {pagination.totalPages > 1 && (
             <div className="flex items-center gap-2">
               <button
                 onClick={() => handlePageChange(pagination.currentPage - 1)}
                 disabled={!pagination.hasPrevPage}
                 className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 Previous
               </button>
               <button
                 onClick={() => handlePageChange(pagination.currentPage + 1)}
                 disabled={!pagination.hasNextPage}
                 className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 Next
               </button>
             </div>
           )}
         </div>
       </div>
    </div>
  );
};

export default LeadsList;
