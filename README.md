# NOTELY – Frontend

NOTELY is a full-stack note-taking application that helps users create, manage, and organize their notes through a clean and responsive interface.

## Live Demo

[Open NOTELY](https://notelyy-drab.vercel.app/)

## Backend & API Documentation

- **Backend:** https://notely-five-pied.vercel.app/
- **API Documentation:** https://documenter.getpostman.com/view/40072844/2sBYPv3XuH

## Features

### Authentication
- User registration and login.
- Persistent authentication using access and refresh tokens.
- Automatic token refresh when the access token expires.
- Secure logout.

### Notes Management
- Create, edit, and delete notes.
- Pin important notes.
- Archive and restore notes.
- Move notes to trash.
- Restore deleted notes.
- Permanently delete notes.

### User Management
- View and update profile information.
- Change password.
- Delete account.

### Admin Dashboard
- View users and their information.
- Manage user accounts.
- Change user roles.
- View application statistics.

### User Interface
- Responsive design for desktop, tablet, and mobile.
- Green and gray color scheme.
- Loading indicators and skeleton loaders.
- Toast notifications for user feedback.

## Technologies Used

| Technology | Purpose |
|---|---|
| React 18 | Building the user interface |
| Vite | Development server and build tool |
| JavaScript | Application logic |
| Axios | API requests |
| React Router DOM | Client-side routing |
| Tailwind CSS | Styling |
| Lucide React | Icons |
| React Hot Toast | Notifications |

## Getting Started

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
cd notely-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:5000
```

Make sure the backend server is running and the API URL matches your backend configuration.

### 4. Start the Development Server

```bash
npm run dev
```

The application will be available at the local URL provided by Vite, usually:

`http://localhost:5173`

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## Authentication Flow

NOTELY uses access and refresh tokens to manage user authentication.

- The access token is stored in memory.
- The refresh token is stored in an HttpOnly cookie.
- Axios handles authenticated API requests.
- Expired access tokens can be refreshed automatically.
- User sessions are restored when the application starts.

## Project Structure

```text
notely-frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── routes/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── .env
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

*The structure above is illustrative; adjust it to match the actual project files.*

## Deployment

The frontend is deployed on Vercel:

https://notelyy-drab.vercel.app/

---

**NOTELY – Keep your thoughts organized.**
