# Task-4


# User Management App

This is a full-stack web application built with **React**, **Node.js**, **Express**, and **MySQL** that allows user registration, login, authentication via **JWT**, and admin-level user management (block, unblock, and delete).

## Features

- ✅ User Registration with Welcome screen
- ✅ Secure Login using JWT
- ✅ Persistent session via Local Storage
- ✅ Protected Dashboard
- ✅ Admin controls to:
  - List all users
  - Block / Unblock users
  - Delete users
- ✅ Real-time status updates (Active / Blocked)
- ✅ Responsive and clean front-end UI

## Technologies Used

### Frontend
- React
- React Router
- Axios
- CSS Modules

### Backend
- Node.js
- Express
- JSON Web Tokens (JWT)
- Bcrypt (for password hashing)
- MySQL (via MySQL2)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/user-management-app.git
cd user-management-app
````

### BACKEND SETUP  

Go to the backend/ folder.

Create a .env file and add your configuration:
````
PORT=5000
JWT_SECRET=your_jwt_secret
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=user_management
````


### Run 

````
npm install
npm start
````

### FrontEnd Setup
````
Go to the frontend/ folder.

Create a .env file and add:
````
### Run:
````
npm install
npm run dev
````
How Authentication Works

After logging in, a JWT token is stored in the browser's Local Storage.

For every protected API request, this token is sent in the Authorization header.

The backend validates the token before allowing access to restricted routes.


Thanks for watch work!!
