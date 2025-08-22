const mongoose = require('mongoose');
const User = require('./models/User');
const Lead = require('./models/Lead');
require('dotenv').config();

// Sample data for seeding
const sampleUsers = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    role: 'admin'
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    password: 'password123',
    role: 'user'
  },
  {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: 'password123',
    role: 'user'
  }
];

const sampleLeads = [
  // Technology Companies
  {
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.johnson@techcorp.com',
    phone: '+1234567890',
    company: 'TechCorp Solutions',
    city: 'San Francisco',
    state: 'CA',
    source: 'website',
    status: 'new',
    score: 85,
    leadValue: 50000,
    isQualified: true,
    notes: 'Interested in enterprise solutions',
    tags: ['enterprise', 'tech', 'high-value']
  },
  {
    firstName: 'Bob',
    lastName: 'Williams',
    email: 'bob.williams@innovate.com',
    phone: '+1234567891',
    company: 'InnovateTech',
    city: 'Austin',
    state: 'TX',
    source: 'google_ads',
    status: 'contacted',
    score: 72,
    leadValue: 35000,
    isQualified: false,
    notes: 'Follow up scheduled for next week',
    tags: ['startup', 'growing']
  },
  {
    firstName: 'Carol',
    lastName: 'Brown',
    email: 'carol.brown@datasys.com',
    phone: '+1234567892',
    company: 'DataSystems Inc',
    city: 'Seattle',
    state: 'WA',
    source: 'referral',
    status: 'qualified',
    score: 95,
    leadValue: 75000,
    isQualified: true,
    notes: 'Ready for proposal',
    tags: ['enterprise', 'data', 'qualified']
  },
  // Healthcare Companies
  {
    firstName: 'David',
    lastName: 'Miller',
    email: 'david.miller@healthcare.com',
    phone: '+1234567893',
    company: 'Healthcare Plus',
    city: 'Boston',
    state: 'MA',
    source: 'facebook_ads',
    status: 'new',
    score: 68,
    leadValue: 25000,
    isQualified: false,
    notes: 'Initial contact made',
    tags: ['healthcare', 'new']
  },
  {
    firstName: 'Eva',
    lastName: 'Davis',
    email: 'eva.davis@medtech.com',
    phone: '+1234567894',
    company: 'MedTech Innovations',
    city: 'San Diego',
    state: 'CA',
    source: 'events',
    status: 'contacted',
    score: 78,
    leadValue: 45000,
    isQualified: true,
    notes: 'Met at conference, very interested',
    tags: ['healthcare', 'medtech', 'conference']
  },
  // Financial Services
  {
    firstName: 'Frank',
    lastName: 'Garcia',
    email: 'frank.garcia@finance.com',
    phone: '+1234567895',
    company: 'Finance Solutions',
    city: 'New York',
    state: 'NY',
    source: 'website',
    status: 'qualified',
    score: 88,
    leadValue: 60000,
    isQualified: true,
    notes: 'Budget approved, moving forward',
    tags: ['finance', 'enterprise', 'budget-approved']
  },
  {
    firstName: 'Grace',
    lastName: 'Martinez',
    email: 'grace.martinez@banking.com',
    phone: '+1234567896',
    company: 'Banking Partners',
    city: 'Chicago',
    state: 'IL',
    source: 'referral',
    status: 'won',
    score: 100,
    leadValue: 100000,
    isQualified: true,
    notes: 'Contract signed, implementation starting',
    tags: ['finance', 'banking', 'won', 'implementation']
  },
  // Manufacturing
  {
    firstName: 'Henry',
    lastName: 'Anderson',
    email: 'henry.anderson@manufacturing.com',
    phone: '+1234567897',
    company: 'Manufacturing Co',
    city: 'Detroit',
    state: 'MI',
    source: 'google_ads',
    status: 'lost',
    score: 45,
    leadValue: 30000,
    isQualified: false,
    notes: 'Competitor won the deal',
    tags: ['manufacturing', 'lost', 'competitor']
  },
  {
    firstName: 'Ivy',
    lastName: 'Taylor',
    email: 'ivy.taylor@industrial.com',
    phone: '+1234567898',
    company: 'Industrial Solutions',
    city: 'Houston',
    state: 'TX',
    source: 'website',
    status: 'new',
    score: 65,
    leadValue: 40000,
    isQualified: false,
    notes: 'Initial inquiry about automation',
    tags: ['manufacturing', 'automation', 'new']
  },
  // Retail
  {
    firstName: 'Jack',
    lastName: 'Thomas',
    email: 'jack.thomas@retail.com',
    phone: '+1234567899',
    company: 'Retail Chain',
    city: 'Miami',
    state: 'FL',
    source: 'facebook_ads',
    status: 'contacted',
    score: 70,
    leadValue: 35000,
    isQualified: true,
    notes: 'Multiple store locations interested',
    tags: ['retail', 'multi-location', 'growing']
  }
];

// Generate additional leads with varied data
const generateAdditionalLeads = () => {
  const leads = [];
  const companies = [
    'Global Solutions', 'NextGen Tech', 'Future Systems', 'Smart Solutions',
    'Digital Innovations', 'Cloud Services', 'AI Technologies', 'Blockchain Corp',
    'IoT Solutions', 'Cybersecurity Plus', 'Data Analytics', 'Machine Learning Inc',
    'Quantum Computing', 'Virtual Reality', 'Augmented Reality', 'Robotics Corp',
    'Automation Systems', 'Smart Cities', 'Green Energy', 'Sustainable Tech'
  ];
  
  const cities = [
    'Los Angeles', 'Denver', 'Portland', 'Nashville', 'Charlotte', 'Atlanta',
    'Dallas', 'Phoenix', 'Las Vegas', 'Salt Lake City', 'Minneapolis', 'Kansas City',
    'St. Louis', 'Cleveland', 'Pittsburgh', 'Philadelphia', 'Baltimore', 'Washington DC',
    'Richmond', 'Orlando', 'Tampa', 'Jacksonville', 'New Orleans', 'Memphis'
  ];
  
  const states = [
    'CA', 'CO', 'OR', 'TN', 'NC', 'GA', 'TX', 'AZ', 'NV', 'UT', 'MN', 'MO',
    'KS', 'IL', 'OH', 'PA', 'MD', 'DC', 'VA', 'FL', 'LA', 'MS', 'AL', 'SC'
  ];

  for (let i = 0; i < 90; i++) {
    const firstName = `User${i + 1}`;
    const lastName = `Test${i + 1}`;
    const email = `user${i + 1}.test@example${i + 1}.com`;
    const company = companies[Math.floor(Math.random() * companies.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const state = states[Math.floor(Math.random() * states.length)];
    const source = ['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'][Math.floor(Math.random() * 6)];
    const status = ['new', 'contacted', 'qualified', 'lost', 'won'][Math.floor(Math.random() * 5)];
    const score = Math.floor(Math.random() * 101);
    const leadValue = Math.floor(Math.random() * 100000) + 10000;
    const isQualified = Math.random() > 0.5;
    
    leads.push({
      firstName,
      lastName,
      email,
      phone: `+1${Math.floor(Math.random() * 900000000) + 100000000}`,
      company,
      city,
      state,
      source,
      status,
      score,
      leadValue,
      isQualified,
      notes: `Generated lead ${i + 1} for testing purposes`,
      tags: [`test-${i + 1}`, source, status]
    });
  }
  
  return leads;
};

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Lead.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create users
    const createdUsers = await User.create(sampleUsers);
    console.log(`👥 Created ${createdUsers.length} users`);

    // Create leads with assigned users
    const allLeads = [...sampleLeads, ...generateAdditionalLeads()];
    const leadsWithUsers = allLeads.map((lead, index) => ({
      ...lead,
      assignedTo: createdUsers[index % createdUsers.length]._id
    }));

    const createdLeads = await Lead.create(leadsWithUsers);
    console.log(`📋 Created ${createdLeads.length} leads`);

    // Display test credentials
    console.log('\n🎯 Test Credentials:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    console.log('\n📊 Database seeded successfully!');
    console.log(`Total Users: ${createdUsers.length}`);
    console.log(`Total Leads: ${createdLeads.length}`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
