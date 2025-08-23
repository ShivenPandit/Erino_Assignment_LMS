const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Lead = require('../models/Lead');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Create a new lead
// @route   POST /api/leads
// @access  Private
router.post('/', protect, [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('company')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  body('state')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  body('source')
    .isIn(['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'])
    .withMessage('Invalid source value'),
  body('status')
    .optional()
    .isIn(['new', 'contacted', 'qualified', 'lost', 'won'])
    .withMessage('Invalid status value'),
  body('score')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Score must be between 0 and 100'),
  body('leadValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Lead value must be a positive number'),
  body('isQualified')
    .optional()
    .isBoolean()
    .withMessage('isQualified must be a boolean'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const leadData = {
      ...req.body,
      assignedTo: req.user.id
    };

    const lead = await Lead.create(leadData);

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: { lead }
    });
  } catch (error) {
    console.error('Create lead error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Lead with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create lead',
      error: error.message
    });
  }
});

// @desc    Get all leads with pagination and filtering
// @route   GET /api/leads
// @access  Private
router.get('/', protect, [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term too long'),
  query('status')
    .optional()
    .isIn(['new', 'contacted', 'qualified', 'lost', 'won'])
    .withMessage('Invalid status value'),
  query('source')
    .optional()
    .isIn(['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'])
    .withMessage('Invalid source value'),
  query('minScore')
    .optional()
    .isNumeric()
    .isInt({ min: 0, max: 100 })
    .withMessage('Min score must be between 0 and 100'),
  query('maxScore')
    .optional()
    .isNumeric()
    .isInt({ min: 0, max: 100 })
    .withMessage('Max score must be between 0 and 100'),
  query('minValue')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Min value must be a positive number'),
  query('maxValue')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Max value must be a positive number'),
  query('isQualified')
    .optional()
    .isIn(['true', 'false', '1', '0'])
    .withMessage('isQualified must be true, false, 1, or 0'),
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  query('sortBy')
    .optional()
    .isIn(['firstName', 'lastName', 'email', 'company', 'status', 'score', 'leadValue', 'createdAt', 'lastActivityAt'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
], async (req, res) => {
  try {
    console.log('Leads request received from user:', req.user?.email);
    console.log('Request cookies:', Object.keys(req.cookies || {}));
    console.log('Request query params:', req.query);
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      console.log('Query params:', req.query);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 10,
      search,
      status,
      source,
      minScore,
      maxScore,
      minValue,
      maxValue,
      isQualified,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    // Text search across multiple fields
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } }
      ];
    }

    // Exact matches
    if (status) filter.status = status;
    if (source) filter.source = source;
    if (isQualified !== undefined) filter.isQualified = isQualified === 'true';

    // Range filters
    if (minScore !== undefined || maxScore !== undefined) {
      filter.score = {};
      if (minScore !== undefined) filter.score.$gte = parseInt(minScore);
      if (maxScore !== undefined) filter.score.$lte = parseInt(maxScore);
    }

    if (minValue !== undefined || maxValue !== undefined) {
      filter.leadValue = {};
      if (minValue !== undefined) filter.leadValue.$gte = parseFloat(minValue);
      if (maxValue !== undefined) filter.leadValue.$lte = parseFloat(maxValue);
    }

    // Date filters
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with pagination
    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('assignedTo', 'firstName lastName email'),
      Lead.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      data: {
        leads,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage,
          hasPrevPage
        }
      }
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leads',
      error: error.message
    });
  }
});

// @desc    Get single lead by ID
// @route   GET /api/leads/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName email');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { lead }
    });
  } catch (error) {
    console.error('Get lead error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch lead',
      error: error.message
    });
  }
});

// @desc    Update lead
// @route   PUT /api/leads/:id
// @access  Private
router.put('/:id', protect, [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('company')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  body('state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  body('source')
    .optional()
    .isIn(['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'])
    .withMessage('Invalid source value'),
  body('status')
    .optional()
    .isIn(['new', 'contacted', 'qualified', 'lost', 'won'])
    .withMessage('Invalid status value'),
  body('score')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Score must be between 0 and 100'),
  body('leadValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Lead value must be a positive number'),
  body('isQualified')
    .optional()
    .isBoolean()
    .withMessage('isQualified must be a boolean'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    let lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Check if email is being updated and if it's already taken
    if (req.body.email && req.body.email !== lead.email) {
      const existingLead = await Lead.findOne({ email: req.body.email });
      if (existingLead) {
        return res.status(400).json({
          success: false,
          message: 'Lead with this email already exists'
        });
      }
    }

    // Update lead
    lead = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Lead updated successfully',
      data: { lead }
    });
  } catch (error) {
    console.error('Update lead error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Lead with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update lead',
      error: error.message
    });
  }
});

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    await Lead.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    console.error('Delete lead error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete lead',
      error: error.message
    });
  }
});

// @desc    Get lead statistics
// @route   GET /api/leads/stats/overview
// @access  Private
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const stats = await Lead.aggregate([
      {
        $group: {
          _id: null,
          totalLeads: { $sum: 1 },
          totalValue: { $sum: '$leadValue' },
          avgScore: { $avg: '$score' },
          avgValue: { $avg: '$leadValue' }
        }
      }
    ]);

    const statusStats = await Lead.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const sourceStats = await Lead.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      }
    ]);

    const qualifiedStats = await Lead.aggregate([
      {
        $group: {
          _id: '$isQualified',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {
          totalLeads: 0,
          totalValue: 0,
          avgScore: 0,
          avgValue: 0
        },
        byStatus: statusStats,
        bySource: sourceStats,
        byQualification: qualifiedStats
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

// @desc    Get lead analytics
// @route   GET /api/leads/analytics
// @access  Private
router.get('/analytics', protect, [
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get total leads
    const totalLeads = await Lead.countDocuments();

    // Get leads by status
    const statusStats = await Lead.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get leads by status for the time period
    const recentStatusStats = await Lead.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate totals for each status
    const newLeads = statusStats.find(s => s._id === 'new')?.count || 0;
    const contactedLeads = statusStats.find(s => s._id === 'contacted')?.count || 0;
    const qualifiedLeads = statusStats.find(s => s._id === 'qualified')?.count || 0;
    const wonLeads = statusStats.find(s => s._id === 'won')?.count || 0;
    const lostLeads = statusStats.find(s => s._id === 'lost')?.count || 0;

    // Get total value and average score
    const valueStats = await Lead.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: '$leadValue' },
          avgScore: { $avg: '$score' }
        }
      }
    ]);

    const totalValue = valueStats[0]?.totalValue || 0;
    const avgScore = Math.round(valueStats[0]?.avgScore || 0);

    // Calculate conversion rate (won / total)
    const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

    // Calculate monthly growth (simplified - comparing recent vs older periods)
    const olderStartDate = new Date();
    olderStartDate.setDate(olderStartDate.getDate() - (days * 2));
    const olderEndDate = new Date();
    olderEndDate.setDate(olderEndDate.getDate() - days);

    const recentCount = await Lead.countDocuments({ createdAt: { $gte: startDate } });
    const olderCount = await Lead.countDocuments({ 
      createdAt: { $gte: olderStartDate, $lt: olderEndDate } 
    });

    const monthlyGrowth = olderCount > 0 ? Math.round(((recentCount - olderCount) / olderCount) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalLeads,
        newLeads,
        contactedLeads,
        qualifiedLeads,
        wonLeads,
        lostLeads,
        totalValue,
        conversionRate,
        avgScore,
        monthlyGrowth
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
});

module.exports = router;
