import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, Filter, Download, RefreshCw, Users } from 'lucide-react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';



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

  // Action button handlers
  const handleViewLead = useCallback((leadId) => {
    navigate(`/leads/${leadId}`);
  }, [navigate]);

  const handleEditLead = useCallback((leadId) => {
    navigate(`/leads/${leadId}/edit`);
  }, [navigate]);

  const handleDeleteLead = useCallback(async (leadId) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await api.delete(`/api/leads/${leadId}`);
        toast.success('Lead deleted successfully');
        fetchLeads(pagination.currentPage);
      } catch (error) {
        console.error('Error deleting lead:', error);
        toast.error('Failed to delete lead');
      }
    }
  }, [pagination.currentPage]);





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
        console.log('Sample lead data:', response.data.data.leads[0]);
        console.log('Leads count:', response.data.data.leads.length);
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
              <label htmlFor="search-leads" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                id="search-leads"
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search leads..."
                className="form-input w-full"
              />
            </div>
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                id="status-filter"
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
              <label htmlFor="source-filter" className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <select
                id="source-filter"
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
              <label htmlFor="qualified-filter" className="block text-sm font-medium text-gray-700 mb-1">Qualified</label>
              <select
                id="qualified-filter"
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
              <label htmlFor="min-score" className="block text-sm font-medium text-gray-700 mb-1">Min Score</label>
              <input
                id="min-score"
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
              <label htmlFor="max-score" className="block text-sm font-medium text-gray-700 mb-1">Max Score</label>
              <input
                id="max-score"
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
              <label htmlFor="min-value" className="block text-sm font-medium text-gray-700 mb-1">Min Value</label>
              <input
                id="min-value"
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
              <label htmlFor="max-value" className="block text-sm font-medium text-gray-700 mb-1">Max Value</label>
              <input
                id="max-value"
                type="number"
                value={filters.maxValue}
                onChange={(e) => handleFilterChange('maxValue', e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                className="form-input w-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label htmlFor="date-from" className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input
                id="date-from"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="form-input w-full"
              />
            </div>
            <div>
              <label htmlFor="date-to" className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <input
                id="date-to"
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
           <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-gray-50">
                 <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qualified</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                 {leads.map((lead) => (
                   <tr key={lead._id} className="hover:bg-gray-50">
                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                       {lead.firstName} {lead.lastName}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.email}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.company}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.phone}</td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                         lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                         lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                         lead.status === 'qualified' ? 'bg-green-100 text-green-800' :
                         lead.status === 'won' ? 'bg-emerald-100 text-emerald-800' :
                         lead.status === 'lost' ? 'bg-red-100 text-red-800' :
                         'bg-gray-100 text-gray-800'
                       }`}>
                         {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                       </span>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                       {lead.source.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.score}%</td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                       ${lead.leadValue?.toLocaleString() || 0}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                         lead.isQualified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                       }`}>
                         {lead.isQualified ? 'Yes' : 'No'}
                       </span>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                       {new Date(lead.createdAt).toLocaleDateString()}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                       <div className="flex items-center gap-2">
                         <button
                           className="px-2 py-1 text-blue-600 hover:text-blue-800 transition-colors border border-blue-200 rounded"
                           title="View Lead"
                           onClick={() => handleViewLead(lead._id)}
                           style={{ minWidth: '32px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                         >
                           <Eye className="h-4 w-4" />
                         </button>
                         <button
                           className="px-2 py-1 text-yellow-600 hover:text-yellow-800 transition-colors border border-yellow-200 rounded"
                           title="Edit Lead"
                           onClick={() => handleEditLead(lead._id)}
                           style={{ minWidth: '32px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                         >
                           <Edit className="h-4 w-4" />
                         </button>
                         <button
                           className="px-2 py-1 text-red-600 hover:text-red-800 transition-colors border border-red-200 rounded"
                           title="Delete Lead"
                           onClick={() => handleDeleteLead(lead._id)}
                           style={{ minWidth: '32px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                         >
                           <Trash2 className="h-4 w-4" />
                         </button>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
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
