# LandlordPay Tracker

## Overview

LandlordPay Tracker is a comprehensive full-stack property management system I built to help landlords and property managers streamline their operations. The system addresses real-world challenges in rental property management, particularly in the Kenyan market, with integrated M-Pesa payments and automated tenant communications.

## 🚀 Live Demo

- **Frontend:** [https://landlordpaytracker.onrender.com](https://landlordpaytracker.onrender.com)
- **Backend API:** [https://mernstack-final-project.onrender.com](https://mernstack-final-project.onrender.com)
- **Database:** MongoDB Atlas (Cloud-hosted)

## ✨ Key Features

- **🔐 Secure Authentication:** JWT-based user authentication with role-based access (Admin, Landlord, Agent)
- **🏠 Property Management:** Complete property and unit management with floor/house distinction
- **👥 Tenant Management:** Comprehensive tenant profiles, assignment, and tracking
- **💳 Payment Integration:** M-Pesa Paybill integration for seamless rent collection
- **📱 Real-time Notifications:** Socket.io powered live updates and payment alerts
- **📊 Analytics Dashboard:** Interactive charts and reports using Recharts
- **📄 Invoice Management:** Automated invoice generation and payment history
- **🔔 SMS Notifications:** Africa's Talking integration for tenant communications
- **📱 Responsive Design:** Modern, mobile-first UI built with React and Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **Tailwind CSS** for modern, responsive styling
- **Recharts** for data visualization
- **Socket.io Client** for real-time features
- **React Router** for navigation

### Backend
- **Node.js** with Express.js framework
- **Socket.io** for real-time communication
- **MongoDB** with Mongoose ODM
- **JWT** for secure authentication
- **Express Rate Limiting** for API protection

### External APIs
- **M-Pesa Daraja API** for payment processing
- **Africa's Talking API** for SMS notifications
- **MongoDB Atlas** for cloud database hosting

### Deployment
- **Render** for both frontend and backend hosting
- **MongoDB Atlas** for cloud database

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- MongoDB Atlas account
- Africa's Talking account (for SMS features)
- M-Pesa Daraja sandbox credentials

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mAdsting/Mernstack-Final-Project.git
   cd Mernstack-Final-Project
   ```

2. **Install dependencies:**
   ```bash
   # Install frontend dependencies
   cd client && npm install
   
   # Install backend dependencies
   cd ../server && npm install
   ```

3. **Environment Configuration:**
   
        **Backend (`server/.env`):**
     ```env
     MONGO_URI=mongodb+srv://kitari:cashmoney@cluster0.6svqyos.mongodb.net/landlordpay
     JWT_SECRET=your_secure_jwt_secret_here
     CLIENT_URL=https://landlordpaytracker.onrender.com
     ADMIN_EMAIL=iikitari@gmail.com
     ADMIN_PASSWORD=your_admin_password_here
     
     # M-Pesa Configuration (Sandbox)
     MPESA_CONSUMER_KEY=O5QhQ8QdVQ2FZb1Q
     MPESA_CONSUMER_SECRET=Q2FZb1QO5QhQ8VQd
     MPESA_SHORTCODE=600999
     MPESA_PASSKEY=bfb279f9aa9bdbcf15e97dd71a467cd2bfb279f9aa9bdbcf15e97dd71a467cd2
     MPESA_CALLBACK_URL=https://18206c812938.ngrok-free.app/api/payments/mpesa/callback
     MPESA_ENV=sandbox
     
     # Africa's Talking Configuration
     AT_API_KEY=your_africas_talking_api_key
     AT_USERNAME=your_africas_talking_username
     ```

        **Frontend (`client/.env`):**
     ```env
     VITE_API_URL=https://mernstack-final-project.onrender.com
     ```
     
     **Production Environment Variables (Render):**
     
     **Frontend:**
     - `VITE_API_URL`: https://mernstack-final-project.onrender.com
     
     **Backend:**
     - `MONGO_URI`: mongodb+srv://kitari:cashmoney@cluster0.6svqyos.mongodb.net/landlordpay
     - `CLIENT_URL`: https://landlordpaytracker.onrender.com
     - `JWT_SECRET`: [Securely configured]
     - `ADMIN_EMAIL`: iikitari@gmail.com
     - `ADMIN_PASSWORD`: [Securely configured]

4. **Start development servers:**
   ```bash
   # Start backend (from server directory)
   cd server && npm run dev
   
   # Start frontend (from client directory)
   cd client && npm run dev
   ```

5. **Access the application:**
   - **Live Demo:** https://landlordpaytracker.onrender.com
   - **API Endpoint:** https://mernstack-final-project.onrender.com

## 🌐 Deployment

### Production Deployment

The application is currently deployed on **Render** for both frontend and backend services:

- **Frontend:** [https://landlordpaytracker.onrender.com](https://landlordpaytracker.onrender.com)
- **Backend API:** [https://mernstack-final-project.onrender.com](https://mernstack-final-project.onrender.com)

### Why Render?

- **Free Tier:** Generous free tier for both static sites and web services
- **Easy CI/CD:** Automatic deployments from GitHub
- **Full-Stack Support:** Can host both frontend and backend
- **SSL Certificates:** Automatic HTTPS provisioning
- **Global CDN:** Fast loading times worldwide
- **Environment Variables:** Secure configuration management

### Deployment Configuration

**Frontend Environment Variables:**
- `VITE_API_URL`: https://mernstack-final-project.onrender.com

**Backend Environment Variables:**
- `MONGO_URI`: mongodb+srv://kitari:cashmoney@cluster0.6svqyos.mongodb.net/landlordpay
- `CLIENT_URL`: https://landlordpaytracker.onrender.com
- `JWT_SECRET`: [Securely configured in Render]
- `ADMIN_EMAIL`: iikitari@gmail.com
- `ADMIN_PASSWORD`: [Securely configured in Render]

## 📱 Features in Detail

### Property Management
- Create and manage multiple properties
- Add individual units/houses with rent amounts
- Track occupancy and vacancy rates
- Property-specific analytics

### Tenant Management
- Register tenants with contact information
- Assign tenants to specific units
- Track rent payments and balances
- Generate tenant reports

### Payment Processing
- M-Pesa STK Push integration
- Real-time payment notifications
- Payment history and receipts
- Automated balance updates

### Analytics & Reporting
- Occupancy rate visualization
- Payment collection analytics
- Financial performance metrics
- Interactive charts and graphs

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/users` - Create new user (Admin only)

### Properties
- `GET /api/properties` - List properties
- `POST /api/properties` - Create property
- `GET /api/properties/:id` - Get property details
- `DELETE /api/properties/:id` - Delete property

### Tenants
- `GET /api/tenants` - List tenants
- `POST /api/tenants` - Create tenant
- `PUT /api/tenants/:id/pay` - Mark tenant as paid

### Payments
- `POST /api/payments/mpesa/initiate` - Initiate M-Pesa payment
- `POST /api/payments/mpesa/callback` - M-Pesa webhook

## 🤝 Contributing

This is a personal project built for educational purposes and real-world application. However, if you find any bugs or have suggestions for improvements, feel free to:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 About the Developer

**Ian Kitari** - Full-stack developer passionate about creating practical solutions for real-world problems. This project was developed as part of my learning journey and to address the specific needs of property management in the Kenyan market.

### Contact
- **GitHub:** [mAdsting](https://github.com/mAdsting)
- **Project Repository:** [Mernstack-Final-Project](https://github.com/mAdsting/Mernstack-Final-Project)
- **Email:** iikitari@gmail.com

## 🙏 Acknowledgments

- **M-Pesa Daraja API** for payment integration
- **Africa's Talking** for SMS services
- **MongoDB Atlas** for cloud database hosting
- **Render** for reliable hosting services
- **Open Source Community** for the amazing libraries and tools used in this project

---

**Built with ❤️ for the Kenyan property management community**