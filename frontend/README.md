# Drishya Frontend

A modern React.js frontend for the Drishya creator platform built with Vite, TailwindCSS, and Zustand.

## 🚀 Features

- **User Authentication** - Secure login/register with JWT
- **Video Management** - Upload, view, and manage videos
- **Social Features** - Like, comment, subscribe, and create playlists
- **Creator Tools** - AI-powered content generator
- **Responsive Design** - Mobile-friendly interface
- **State Management** - Zustand for simple global state
- **API Integration** - Axios with automatic token handling

## 📋 Tech Stack

- **React 18** - UI library
- **Vite 5** - Build tool & dev server
- **TailwindCSS 3** - Utility-first CSS
- **Zustand 4** - State management
- **Axios** - HTTP client
- **React Router 6** - Routing

## 🛠️ Setup

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Notification.jsx
│   │   ├── SearchBar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/               # Page components
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── Home.jsx
│   │   ├── Upload.jsx
│   │   ├── Watch.jsx
│   │   ├── Profile.jsx
│   │   ├── Channel.jsx
│   │   ├── SearchResults.jsx
│   │   ├── Playlist.jsx
│   │   ├── Settings.jsx
│   │   └── ContentGenerator.jsx
│   ├── services/            # API clients
│   │   ├── api.js          # Backend API
│   │   └── aiApi.js        # AI service API
│   ├── stores/              # Zustand stores
│   │   ├── authStore.js
│   │   ├── videoStore.js
│   │   └── uiStore.js
│   ├── hooks/               # Custom hooks
│   │   └── useAuth.js
│   ├── utils/               # Helper functions
│   │   └── helpers.js
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── index.html               # HTML template
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── .env.example
```

## 🔑 Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_AI_API_URL=http://localhost:8001/api/v1
```

## 🎨 Components

### Auth Pages

- **Login** - User authentication
- **Register** - New account creation

### Main Pages

- **Home** - Video feed with pagination
- **Upload** - Video upload with file management
- **Watch** - Video player with comments
- **Profile** - User profile management
- **Channel** - Creator channel view
- **SearchResults** - Search functionality
- **Playlist** - Playlist management
- **Settings** - Account settings
- **ContentGenerator** - AI-powered creation tools

### UI Components

- **Navbar** - Navigation bar with search
- **Sidebar** - Navigation menu
- **Notification** - Toast notifications
- **SearchBar** - Search input
- **ProtectedRoute** - Route protection

## 🔌 API Endpoints

All endpoints are automatically prefixed with `http://localhost:8000/api/v1`

### Authentication

- `POST /users/register` - Create account
- `POST /users/login` - Login
- `POST /users/logout` - Logout
- `GET /users/current-user` - Get current user

### Videos

- `GET /videos` - List videos
- `POST /videos/upload` - Upload video
- `GET /videos/:id` - Get single video
- `PATCH /videos/:id/update` - Update video
- `DELETE /videos/:id/delete` - Delete video

### Comments

- `POST /comments/:videoId` - Add comment
- `GET /comments/:videoId` - Get comments
- `PATCH /comments/:commentId` - Update comment
- `DELETE /comments/:commentId` - Delete comment

### Likes

- `POST /likes/toggle/video/:videoId` - Toggle like
- `GET /likes/video/:videoId` - Get video likes

### More endpoints available...

## 🤖 AI Service Integration

The frontend connects to the AI service for content generation:

```javascript
// Example: Generate video titles
const titles = await generatorAPI.generateVideoTitles(
  "Machine Learning",
  "Tech",
  "Beginners"
);
```

### Available AI Endpoints

- `POST /generate/video-titles` - Generate video titles
- `POST /generate/content-ideas` - Generate content ideas
- `POST /generate/thumbnail-suggestions` - Get thumbnail designs

## 🔐 Authentication Flow

1. User registers/logs in
2. Backend returns JWT token and user data
3. Token stored in localStorage
4. Token added to all API requests automatically
5. Token refreshed when expired (401 response)

## 📦 Build for Production

```bash
npm run build
```

The optimized build will be in the `dist/` directory.

## 🚀 Deployment

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm install -g netlify-cli
netlify deploy
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🐛 Troubleshooting

### API Connection Issues

- Verify backend is running on port 8000
- Check CORS settings in backend
- Verify .env variables are correct

### Styling Issues

- Clear node_modules and reinstall: `npm install`
- Clear build cache: `rm -rf dist`
- Restart dev server

### Module Not Found

- Run `npm install` to ensure all dependencies installed
- Clear node_modules cache: `npm cache clean --force`

## 📖 Documentation

- [React Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)
- [TailwindCSS Docs](https://tailwindcss.com/)
- [Zustand Docs](https://github.com/pmndrs/zustand)

## 📝 License

MIT

## 👥 Support

For issues or questions, please open an issue in the repository.

---

**Happy coding!** 🎬
