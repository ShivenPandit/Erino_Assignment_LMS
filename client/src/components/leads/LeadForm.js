import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, User, Mail, Phone, Building, MapPin, Target, BarChart3, DollarSign, CheckCircle, FileText, Tag } from 'lucide-react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

const LeadForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [lead, setLead] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm();

  const watchedTags = watch('tags', []);

  // Check if editing
  useEffect(() => {
    if (id && id !== 'new') {
      setIsEditing(true);
      fetchLead();
    }
  }, [id]);

  // Fetch lead data for editing
  const fetchLead = async () => {
    try {
      const response = await api.get(`/api/leads/${id}`);
      if (response.data.success) {
        const leadData = response.data.data.lead;
        setLead(leadData);
        
        // Set form values
        Object.keys(leadData).forEach(key => {
          if (key !== '_id' && key !== '__v' && key !== 'assignedTo') {
            setValue(key, leadData[key]);
          }
        });
      }
    } catch (error) {
      console.error('Error fetching lead:', error);
      toast.error('Failed to fetch lead data');
      navigate('/dashboard');
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      if (isEditing) {
        await api.put(`/api/leads/${id}`, data);
        toast.success('Lead updated successfully');
      } else {
        await api.post('/api/leads', data);
        toast.success('Lead created successfully');
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving lead:', error);
      const message = error.response?.data?.message || 'Failed to save lead';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle tag input
  const handleTagInput = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const newTag = e.target.value.trim();
      const currentTags = watchedTags || [];
      
      if (!currentTags.includes(newTag)) {
        setValue('tags', [...currentTags, newTag]);
      }
      e.target.value = '';
    }
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    const currentTags = watchedTags || [];
    setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

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
        
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? 'Edit Lead' : 'Add New Lead'}
        </h1>
        <p className="mt-2 text-gray-600">
          {isEditing ? 'Update lead information and details' : 'Create a new lead in your system'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  id="lead-first-name"
                  type="text"
                  autoComplete="given-name"
                  className={`input pl-10 ${errors.firstName ? 'input-error' : ''}`}
                  placeholder="Enter first name"
                  {...register('firstName', {
                    required: 'First name is required',
                    minLength: {
                      value: 2,
                      message: 'First name must be at least 2 characters'
                    },
                    maxLength: {
                      value: 50,
                      message: 'First name cannot exceed 50 characters'
                    }
                  })}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-danger-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  id="lead-last-name"
                  type="text"
                  autoComplete="family-name"
                  className={`input pl-10 ${errors.lastName ? 'input-error' : ''}`}
                  placeholder="Enter last name"
                  {...register('lastName', {
                    required: 'Last name is required',
                    minLength: {
                      value: 2,
                      message: 'Last name must be at least 2 characters'
                    },
                    maxLength: {
                      value: 50,
                      message: 'Last name cannot exceed 50 characters'
                    }
                  })}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-danger-600">{errors.lastName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="lead-email"
                    type="email"
                    autoComplete="email"
                    className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                    placeholder="Enter email address"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Please enter a valid email'
                      }
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-danger-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    className={`input pl-10 ${errors.phone ? 'input-error' : ''}`}
                    placeholder="Enter phone number"
                    {...register('phone', {
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[\+]?[1-9][\d]{0,15}$/,
                        message: 'Please enter a valid phone number'
                      }
                    })}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-danger-600">{errors.phone.message}</p>
                )}
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
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  id="company"
                  type="text"
                  className={`input ${errors.company ? 'input-error' : ''}`}
                  placeholder="Enter company name"
                  {...register('company', {
                    required: 'Company name is required',
                    minLength: {
                      value: 2,
                      message: 'Company name must be at least 2 characters'
                    },
                    maxLength: {
                      value: 100,
                      message: 'Company name cannot exceed 100 characters'
                    }
                  })}
                />
                {errors.company && (
                  <p className="mt-1 text-sm text-danger-600">{errors.company.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  id="city"
                  type="text"
                  className={`input ${errors.city ? 'input-error' : ''}`}
                  placeholder="Enter city"
                  {...register('city', {
                    required: 'City is required',
                    minLength: {
                      value: 2,
                      message: 'City must be at least 2 characters'
                    },
                    maxLength: {
                      value: 50,
                      message: 'City cannot exceed 50 characters'
                    }
                  })}
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-danger-600">{errors.city.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  id="state"
                  type="text"
                  className={`input ${errors.state ? 'input-error' : ''}`}
                  placeholder="Enter state"
                  {...register('state', {
                    required: 'State is required',
                    minLength: {
                      value: 2,
                      message: 'State must be at least 2 characters'
                    },
                    maxLength: {
                      value: 50,
                      message: 'State cannot exceed 50 characters'
                    }
                  })}
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-danger-600">{errors.state.message}</p>
                )}
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
                <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2">
                  Lead Source *
                </label>
                <select
                  id="source"
                  className={`input ${errors.source ? 'input-error' : ''}`}
                  {...register('source', {
                    required: 'Lead source is required'
                  })}
                >
                  <option value="">Select source</option>
                  <option value="website">Website</option>
                  <option value="facebook_ads">Facebook Ads</option>
                  <option value="google_ads">Google Ads</option>
                  <option value="referral">Referral</option>
                  <option value="events">Events</option>
                  <option value="other">Other</option>
                </select>
                {errors.source && (
                  <p className="mt-1 text-sm text-danger-600">{errors.source.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  className="input"
                  {...register('status')}
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="lost">Lost</option>
                  <option value="won">Won</option>
                </select>
              </div>

              <div>
                <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-2">
                  Lead Score (0-100)
                </label>
                <input
                  id="score"
                  type="number"
                  min="0"
                  max="100"
                  className={`input ${errors.score ? 'input-error' : ''}`}
                  placeholder="Enter score"
                  {...register('score', {
                    min: {
                      value: 0,
                      message: 'Score cannot be less than 0'
                    },
                    max: {
                      value: 100,
                      message: 'Score cannot exceed 100'
                    }
                  })}
                />
                {errors.score && (
                  <p className="mt-1 text-sm text-danger-600">{errors.score.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="leadValue" className="block text-sm font-medium text-gray-700 mb-2">
                  Lead Value ($)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="leadValue"
                    type="number"
                    min="0"
                    step="0.01"
                    className={`input pl-10 ${errors.leadValue ? 'input-error' : ''}`}
                    placeholder="Enter value"
                    {...register('leadValue', {
                      min: {
                        value: 0,
                        message: 'Value cannot be negative'
                      }
                    })}
                  />
                </div>
                {errors.leadValue && (
                  <p className="mt-1 text-sm text-danger-600">{errors.leadValue.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <CheckCircle className="h-5 w-5" />
                  Is Qualified Lead?
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="true"
                      {...register('isQualified')}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="false"
                      {...register('isQualified')}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary-600" />
              <h2 className="text-lg font-medium text-gray-900">Additional Information</h2>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-6">
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows={4}
                  className={`input ${errors.notes ? 'input-error' : ''}`}
                  placeholder="Enter any additional notes about this lead"
                  {...register('notes', {
                    maxLength: {
                      value: 1000,
                      message: 'Notes cannot exceed 1000 characters'
                    }
                  })}
                />
                {errors.notes && (
                  <p className="mt-1 text-sm text-danger-600">{errors.notes.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="space-y-3">
                  <input
                    id="tags"
                    type="text"
                    placeholder="Type a tag and press Enter"
                    onKeyDown={handleTagInput}
                    className="input"
                  />
                  
                  {watchedTags && watchedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {watchedTags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                        >
                          <Tag className="h-3 w-3" />
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 text-primary-600 hover:text-primary-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary flex items-center gap-2"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isEditing ? 'Update Lead' : 'Create Lead'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeadForm;
