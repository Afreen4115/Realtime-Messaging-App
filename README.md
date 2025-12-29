# 💬 Real-Time Chat Application

A modern, full-stack real-time chat application built with microservices architecture. Features instant messaging, image sharing, online status indicators, and seamless user experience.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)

## ✨ Features

- 🔐 **User Authentication** - Secure login with OTP email verification
- 💬 **Real-Time Messaging** - Instant message delivery using Socket.io
- 📸 **Image Sharing** - Send and receive images with Cloudinary integration
- 👥 **Online Status** - See who's online in real-time
- ⌨️ **Typing Indicators** - Know when someone is typing
- ✅ **Read Receipts** - Message seen status tracking
- 📱 **Responsive Design** - Beautiful UI built with Tailwind CSS
- 🚀 **Microservices Architecture** - Scalable backend with separate services
- ⚡ **Redis Caching** - Fast data retrieval and session management
- 📧 **Async Email Service** - RabbitMQ-powered email notifications

## 🏗️ Architecture

This project follows a **microservices architecture** with the following services:

```
┌─────────────┐
│   Frontend  │  Next.js 15 + React 19 + TypeScript
└──────┬──────┘
       │
       ├──────────────┬──────────────┐
       │              │              │
┌──────▼──────┐ ┌────▼─────┐ ┌──────▼──────┐
│ User Service│ │Chat Service│ │Mail Service│
│  (Express)  │ │  (Express) │ │  (Express) │
│             │ │ + Socket.io│ │ + RabbitMQ │
└──────┬──────┘ └────┬──────┘ └──────┬──────┘
       │              │              │
       └──────┬───────┴──────┬───────┘
              │              │
       ┌──────▼──────┐ ┌─────▼──────┐
       │  MongoDB    │ │   Redis    │
       └─────────────┘ └────────────┘
```

### Services Overview

- **User Service** (`backend/user/`) - Handles user authentication, profile management, and user queries
- **Chat Service** (`backend/chat/`) - Manages chat rooms, messages, and real-time communication via Socket.io
- **Mail Service** (`backend/mail/`) - Processes email notifications asynchronously using RabbitMQ

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.4.5
- **UI Library**: React 19.1.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **State Management**: React Context API
- **Real-time**: Socket.io Client
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5.1.0
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose 8.17.0)
- **Cache**: Redis 5.6.1
- **Real-time**: Socket.io 4.8.1
- **Message Queue**: RabbitMQ (amqplib)
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer + Cloudinary
- **Email**: Nodemailer

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local or cloud instance)
- **Redis** (local or cloud instance)
- **RabbitMQ** (local or cloud instance)
- **Cloudinary Account** (for image uploads)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Afreen4115/Realtime-Messaging-App
cd Realtime-Messaging-App
```

### 2. Environment Variables

Create `.env` files in each service directory with the following variables:

#### Backend - User Service (`backend/user/.env`)
```env
PORT=3001
MONGODB_URI=your_mongodb_connection_string
REDIS_URL=your_redis_connection_string
JWT_SECRET=your_jwt_secret_key
RABBITMQ_URL=your_rabbitmq_connection_string
```

#### Backend - Chat Service (`backend/chat/.env`)
```env
PORT=3002
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
USER_SERVICE_URL=http://localhost:3001
```

#### Backend - Mail Service (`backend/mail/.env`)
```env
PORT=3003
RABBITMQ_URL=your_rabbitmq_connection_string
EMAIL_HOST=your_smtp_host
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

#### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_USER_SERVICE_URL=http://localhost:3001
NEXT_PUBLIC_CHAT_SERVICE_URL=http://localhost:3002
```

### 3. Install Dependencies

Install dependencies for all services:

```bash
# Root dependencies
npm install

# User Service
cd backend/user
npm install

# Chat Service
cd ../chat
npm install

# Mail Service
cd ../mail
npm install

# Frontend
cd ../../frontend
npm install
```

### 4. Build Services

Build TypeScript services:

```bash
# User Service
cd backend/user
npm run build

# Chat Service
cd ../chat
npm run build

# Mail Service
cd ../mail
npm run build
```

### 5. Start Services

Start each service in separate terminals:

**Terminal 1 - User Service:**
```bash
cd backend/user
npm start
```

**Terminal 2 - Chat Service:**
```bash
cd backend/chat
npm start
```

**Terminal 3 - Mail Service:**
```bash
cd backend/mail
npm start
```

**Terminal 4 - Frontend:**
```bash
cd frontend
npm run dev
```

### Development Mode

For development with hot-reload:

```bash
# In each service directory
npm run dev
```

## 📡 API Endpoints

### User Service (`http://localhost:3001/api/v1`)

- `POST /login` - User login (sends OTP)
- `POST /verify` - Verify OTP and authenticate
- `GET /me` - Get current user profile (Protected)
- `GET /user/all` - Get all users (Protected)
- `GET /user/:id` - Get user by ID (Protected)
- `POST /update/user` - Update user name (Protected)

### Chat Service (`http://localhost:3002/api/v1`)

- `POST /chat/new` - Create new chat (Protected)
- `GET /chat/all` - Get all user chats (Protected)
- `POST /message` - Send message (text/image) (Protected)
- `GET /message/:chatId` - Get messages by chat ID (Protected)

**WebSocket Events:**
- `connection` - User connects
- `join` - Join a chat room
- `sendMessage` - Send real-time message
- `typing` - Typing indicator
- `messageSeen` - Mark message as seen

## 🎨 Project Structure

```
CHAT-APP/
├── backend/
│   ├── user/              # User authentication service
│   │   ├── src/
│   │   │   ├── config/    # Database, Redis, RabbitMQ configs
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   ├── models/
│   │   │   └── routes/
│   │   └── package.json
│   ├── chat/              # Chat and messaging service
│   │   ├── src/
│   │   │   ├── config/    # Socket.io, Cloudinary configs
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   ├── models/
│   │   │   └── routes/
│   │   └── package.json
│   └── mail/              # Email notification service
│       ├── src/
│       │   └── consumer.ts # RabbitMQ consumer
│       └── package.json
├── frontend/              # Next.js frontend application
│   ├── src/
│   │   ├── app/           # Next.js app router pages
│   │   ├── components/    # React components
│   │   └── context/       # React context providers
│   └── package.json
└── README.md
```

## 🔒 Security Features

- JWT-based authentication
- Protected API routes with middleware
- CORS configuration
- Secure password handling
- OTP email verification
- Input validation and sanitization

## 🚧 Future Enhancements

- [ ] Group chat functionality
- [ ] File sharing (PDF, DOC, etc.)
- [ ] Voice messages
- [ ] Video calls
- [ ] Message search
- [ ] Chat archiving
- [ ] Dark mode toggle
- [ ] Push notifications
- [ ] End-to-end encryption

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👤 Author

**Your Name**

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🙏 Acknowledgments

- Socket.io for real-time communication
- Next.js team for the amazing framework
- MongoDB for the database solution
- All open-source contributors

---

⭐ If you found this project helpful, please give it a star!
```

This README includes:

1. Project overview with badges
2. Feature list
3. Architecture diagram
4. Tech stack breakdown
5. Prerequisites and setup
6. Environment variables
7. Installation and run instructions
8. API documentation
9. Project structure
10. Security notes
11. Future enhancements
12. Contributing guidelines

Customize:
- Replace `yourusername` with your GitHub username
- Update the Author section with your details
- Add any additional features or services
- Include deployment instructions if needed

Should I add sections for deployment, testing, or troubleshooting?
