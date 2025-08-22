import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, User, Mail, Phone, Building, MapPin, Target, BarChart3, DollarSign, CheckCircle, FileText, Tag, Calendar, Clock } from 'lucide-react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

const LeadDetail = () => {
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchLead();
  }, [id]);

  const fetchLead = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/leads/${id}`);
      if (response.data.success) {
        setLead(response.data.data.lead);
      }
    } catch (error) {
      console.error('Error fetching lead:', error);
      toast.error('Failed to fetch lead data');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
      try {
        setDeleting(true);
        await api.delete(`/api/leads/${id}`);
        toast.success('Lead deleted successfully');
        navigate('/dashboard');
      } catch (error) {
        console.error('Error deleting lead:', error);
        toast.error('Failed to delete lead');
      } finally {
        setDeleting(false);
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'badge-neutral',
      contacted: 'badge-info',
      qualified: 'badge-success',
      lost: 'badge-danger',
      won: 'badge-success'
    };
    return colors[status] || 'badge-neutral';
  };

  const getSourceColor = (source) => {
    return 'badge-info';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Lead not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-secondary flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {lead.firstName} {lead.lastName}
            </h1>
            <p className="mt-2 text-gray-600">{lead.company}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/leads/${id}/edit`)}
              className="btn-primary flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Lead
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="btn-danger flex items-center gap-2"
            >
              {deleting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
              </div>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">First Name</label>
                  <p className="text-gray-900 font-medium">{lead.firstName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Last Name</label>
                  <p className="text-gray-900 font-medium">{lead.lastName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <a href={`mailto:${lead.email}`} className="text-primary-600 hover:text-primary-800">
                      {lead.email}
                    </a>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <a href={`tel:${lead.phone}`} className="text-primary-600 hover:text-primary-800">
                      {lead.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-medium text-gray-900">Company Information</h2>
              </div>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Company Name</label>
                  <p className="text-gray-900 font-medium">{lead.company}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Location</label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{lead.city}, {lead.state}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lead Details */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-medium text-gray-900">Lead Details</h2>
              </div>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Lead Source</label>
                  <span className={`badge ${getSourceColor(lead.source)} capitalize`}>
                    {lead.source.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <span className={`badge ${getStatusColor(lead.status)} capitalize`}>
                    {lead.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Lead Score</label>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full" 
                        style={{ width: `${lead.score}%` }}
                      ></div>
                    </div>
                    <span className="text-gray-900 font-medium">{lead.score}/100</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Lead Value</label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900 font-medium">
                      ${lead.leadValue?.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Qualified Lead</label>
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`h-4 w-4 ${lead.isQualified ? 'text-success-600' : 'text-gray-400'}`} />
                    <span className={`badge ${lead.isQualified ? 'badge-success' : 'badge-neutral'}`}>
                      {lead.isQualified ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {(lead.notes || (lead.tags && lead.tags.length > 0)) && (
            <div className="card">
              <div className="card-header">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary-600" />
                  <h2 className="text-lg font-medium text-gray-900">Additional Information</h2>
                </div>
              </div>
              <div className="card-body space-y-6">
                {lead.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Notes</label>
                    <p className="text-gray-900 bg-gray-50 p-4 rounded-md">{lead.notes}</p>
                  </div>
                )}
                
                {lead.tags && lead.tags.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {lead.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                        >
                          <Tag className="h-3 w-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Quick Stats</h3>
            </div>
            <div className="card-body space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Lead Age</span>
                <span className="text-sm font-medium text-gray-900">
                  {lead.ageInDays || 0} days
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Last Activity</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(lead.lastActivityAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Timeline</h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Lead Created</p>
                    <p className="text-xs text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString()} at{' '}
                      {new Date(lead.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                {lead.lastActivityAt && lead.lastActivityAt !== lead.createdAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-success-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Last Updated</p>
                      <p className="text-xs text-gray-500">
                        {new Date(lead.lastActivityAt).toLocaleDateString()} at{' '}
                        {new Date(lead.lastActivityAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Assigned To */}
          {lead.assignedTo && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Assigned To</h3>
              </div>
              <div className="card-body">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {lead.assignedTo.firstName?.charAt(0)}{lead.assignedTo.lastName?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {lead.assignedTo.firstName} {lead.assignedTo.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{lead.assignedTo.email}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;
