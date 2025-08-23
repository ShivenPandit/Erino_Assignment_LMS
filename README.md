# 🚀 Lead Management System

> A modern, full-stack web application for managing sales leads with advanced features, built with the MERN stack.

![React](https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green?style=for-the-badge&logo=mongodb)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-blue?style=for-the-badge&logo=tailwind-css)

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## 🌟 Overview

The **Lead Management System** is a comprehensive web application designed to help sales teams and businesses efficiently manage their sales leads. Built with modern web technologies, it provides an intuitive interface for tracking leads through their entire sales pipeline, from initial contact to conversion.

### 🎯 **Key Benefits**
- **Streamlined Lead Management**: Organize and track leads through customizable sales stages
- **Advanced Analytics**: Monitor lead performance and conversion rates
- **Team Collaboration**: Assign leads to team members and track progress
- **Data Export**: Export lead data for reporting and analysis
- **Mobile Responsive**: Access your leads from any device, anywhere

## 🛠️ Technology Stack

### **Frontend**
- **React 18**: Modern React with hooks and functional components
- **React Router**: Client-side routing and navigation
- **Tailwind CSS**: Utility-first CSS framework
- **AG Grid**: Professional data grid component
- **React Hook Form**: Advanced form management and validation
- **Lucide React**: Beautiful and consistent icon library
- **React Hot Toast**: User notification system

### **Backend**
- **Node.js**: JavaScript runtime environment
- **Express.js**: Fast, unopinionated web framework
- **MongoDB**: NoSQL database for flexible data storage
- **Mongoose**: Object Document Mapper for MongoDB
- **JWT**: JSON Web Token authentication
- **bcrypt**: Password hashing and security
- **Express Validator**: Input validation middleware

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ and npm
- MongoDB 6.0+ (local or Atlas)
- Git

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/lead-management-system.git
   cd lead-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   # Install backend dependencies
   cd server
   npm install
   
   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the `server/` directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/lead-management
   # Or use MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lead-management
   
   # CORS Configuration
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the application**
   ```bash
   # Start backend server (Terminal 1)
   cd server
   npm start
   
   # Start frontend (Terminal 2)
   cd client
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/health

### **Test Credentials**
- **Email**: `test@example.com`
- **Password**: `password123`

## 📁 Project Structure

```
lead-management-system/
├── client/                          # React frontend
│   ├── public/                     # Static files
│   ├── src/
│   │   ├── components/            # React components
│   │   │   ├── auth/             # Authentication components
│   │   │   ├── leads/            # Lead management components
│   │   │   ├── layout/           # Layout and navigation
│   │   │   └── settings/         # User settings
│   │   ├── contexts/             # React contexts
│   │   ├── utils/                # Utility functions
│   │   ├── App.js                # Main application component
│   │   └── index.js              # Application entry point
│   ├── package.json              # Frontend dependencies
│   └── tailwind.config.js        # Tailwind CSS configuration
├── server/                        # Node.js backend
│   ├── config/                   # Configuration files
│   ├── middleware/               # Express middleware
│   ├── models/                   # Mongoose models
│   ├── routes/                   # API routes
│   ├── index.js                  # Server entry point
│   ├── package.json              # Backend dependencies
│   └── seed.js                   # Database seeding script
├── README.md                     # Project documentation
└── SETUP.md                      # Setup instructions
```

## 🔧 Configuration

### **Database Setup**
The application uses MongoDB. You can either:
- Use a local MongoDB instance
- Use MongoDB Atlas (cloud service)

### **Environment Variables**
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)
- `JWT_SECRET`: Secret key for JWT tokens
- `MONGODB_URI`: MongoDB connection string
- `FRONTEND_URL`: Frontend URL for CORS

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
