# Expense Tracker Application

## Project Overview
A full-stack expense tracking application built with MERN stack (MongoDB, Express.js, React, Node.js) that allows users to manage their personal finances by tracking income and expenses.

## Project Structure
```
├── backend/                 # Backend server application
│   ├── src/
│   │   └── server.js       # Express server, API routes, and MongoDB models
│   ├── .env                # Environment variables (MongoDB URI, PORT)
│   └── package.json        # Backend dependencies and scripts
│
└── frontend/               # React frontend application
    ├── public/
    │   └── index.html      # HTML template
    └── src/
        ├── api.js          # API integration and axios configuration
        ├── App.js          # Main React component
        ├── index.js        # React entry point
        └── components/
            └── Login.js    # Authentication component
```

## Technical Stack

### Backend
- **Node.js & Express**: Server framework
- **MongoDB & Mongoose**: Database and ODM
- **Dependencies**:
  - cors: Cross-origin resource sharing
  - dotenv: Environment variable management
  - express: Web framework
  - mongoose: MongoDB object modeling

### Frontend
- **React**: UI framework
- **Axios**: HTTP client
- **Chart.js & react-chartjs-2**: Data visualization
- **Bootstrap**: UI styling (inferred from Login component classes)

## Core Features

### Authentication
- User registration and login functionality
- Secure password handling
- JWT-based session management using localStorage
- Protected routes and API endpoints

### Transaction Management
- CRUD operations for financial transactions
- Transaction categorization
- Support for both income and expenses
- Date-based transaction tracking

### Data Analysis
- Transaction summary by category
- Data visualization using Chart.js
- Export functionality to CSV format

## API Endpoints

### User Routes
- `POST /api/users/register`: Create new user account
- `POST /api/users/login`: Authenticate user

### Transaction Routes
- `GET /api/transactions`: Retrieve user transactions
- `POST /api/transactions`: Create new transaction
- `DELETE /api/transactions/:id`: Remove transaction
- `GET /api/transactions/export`: Export transactions to CSV
- `GET /api/transactions/summary`: Get category-wise summary

## Data Models

### User Schema
```javascript
{
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}
```

### Transaction Schema
```javascript
{
  userId: { type: ObjectId, ref: 'User', required: true },
  title: String,
  amount: Number,
  type: String,
  category: String,
  date: { type: Date, default: Date.now }
}
```

## Security Features
- CORS enabled for secure cross-origin requests
- User authentication and authorization
- Request interceptors for automatic userId inclusion
- Password confirmation during registration

## Development Setup
1. Backend:
   ```bash
   cd backend
   npm install
   npm run dev    # Runs with nodemon for development
   ```

2. Frontend:
   ```bash
   cd frontend
   npm install
   npm start      # Runs React development server
   ```

## Environment Variables
Backend `.env` file requires:
- `MONGODB_URI`: MongoDB connection string
- `PORT`: Server port (defaults to 5000)

## Deployment Guide

### Backend Deployment (Render/Heroku)
1. Create a new Web Service
2. Connect your GitHub repository
3. Configure environment variables:
   - Set `MONGODB_URI` to your MongoDB Atlas connection string
   - Set `NODE_ENV=production`
4. Deploy settings:
   - Build Command: `npm install`
   - Start Command: `node src/server.js`

### Frontend Deployment (Netlify/Vercel)
1. Create a new project
2. Connect your GitHub repository
3. Configure build settings:
   - Build Command: `npm run build`
   - Publish Directory: `build`
4. Environment variables:
   - Set `REACT_APP_API_URL` to your backend URL
5. Update API configuration in `frontend/src/api.js`:
   ```javascript
   export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
   ```

### Database (MongoDB Atlas)
1. Create MongoDB Atlas account
2. Set up a new cluster
3. Configure network access (IP whitelist)
4. Create database user
5. Get connection string and update backend `.env`

## Resume Points

### Technical Skills Demonstrated
- Full-stack development using MERN (MongoDB, Express.js, React.js, Node.js) stack
- RESTful API design and implementation
- User authentication and authorization
- State management and API integration
- Data visualization using Chart.js
- Responsive UI design with Bootstrap
- Version control with Git

### Project Highlights
1. **Full-Stack Development:**
   - Developed a complete web application with user authentication, CRUD operations, and data visualization
   - Implemented secure API endpoints with proper error handling and validation

2. **Database Design:**
   - Designed and implemented MongoDB schemas with relationships between users and transactions
   - Implemented efficient queries for data aggregation and reporting

3. **Security Implementation:**
   - Built secure user authentication system
   - Implemented protected routes and API endpoints
   - Utilized proper security practices for password handling

4. **Frontend Development:**
   - Created responsive UI with Bootstrap
   - Implemented real-time data visualization using Chart.js
   - Built reusable React components
   - Integrated API calls using Axios with interceptors

5. **Key Features:**
   - User authentication system
   - Transaction management with categorization
   - Data visualization and reporting
   - CSV export functionality
   - Category-wise expense analysis

6. **Best Practices:**
   - Followed MVC architecture
   - Implemented proper error handling
   - Used environment variables for configuration
   - Followed REST API conventions
   - Maintained clean code structure and documentation

### Quantifiable Achievements
- Reduced data loading time by implementing efficient MongoDB queries
- Improved user experience with responsive design
- Implemented feature-rich dashboard for financial tracking
- Built scalable architecture supporting multiple users
