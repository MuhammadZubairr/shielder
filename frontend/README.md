# Shielder Frontend

Enterprise-grade frontend for the Shielder Digital Platform - Industrial Filters Management System.

## 🚀 Features

- **Modern Stack**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Authentication**: JWT-based authentication with protected routes
- **Multilingual**: Support for English and Arabic with RTL layout
- **State Management**: Zustand for global state
- **API Integration**: Axios with interceptors for token refresh
- **Type Safety**: Full TypeScript implementation
- **Responsive Design**: Mobile-first responsive design
- **Form Validation**: Client-side validation with clear error messages

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

## 🛠️ Installation

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.local.example .env.local
# Edit .env.local with your API URL
```

4. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## 🏃 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format code with Prettier
npm run type-check   # Check TypeScript types
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Homepage
│   │   ├── login/           # Login page
│   │   └── register/        # Register page
│   ├── components/          # Reusable components
│   │   └── providers/       # Context providers
│   ├── hooks/               # Custom React hooks
│   │   └── useAuth.ts       # Authentication hook
│   ├── services/            # API services
│   │   ├── api.service.ts   # Axios instance
│   │   └── auth.service.ts  # Auth API calls
│   ├── store/               # Zustand stores
│   │   └── auth.store.ts    # Auth state
│   ├── styles/              # Global styles
│   │   └── globals.css      # Tailwind + custom styles
│   ├── types/               # TypeScript types
│   │   └── index.ts         # Type definitions
│   └── utils/               # Utilities
│       └── constants.ts     # Constants and endpoints
├── public/                  # Static files
├── .cursorrules             # Coding standards
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies
```

## 🌐 Pages & Routes

### Public Pages
- `/` - Homepage
- `/login` - Login page
- `/register` - Registration page

### Protected Pages (Customer)
- `/customer/dashboard` - Customer dashboard
- `/customer/orders` - Order management
- `/customer/profile` - User profile

### Protected Pages (Admin)
- `/admin/dashboard` - Admin dashboard
- `/admin/products` - Product management
- `/admin/orders` - Order management
- `/admin/users` - User management
- `/admin/reports` - Analytics & reports

## 🔒 Authentication Flow

1. User registers or logs in
2. Backend returns JWT access token and refresh token
3. Tokens stored in localStorage
4. Access token sent in Authorization header for API requests
5. Token automatically refreshed when expired
6. Protected routes check authentication status

## 🌍 Multilingual Support

The application supports English and Arabic:

- User can select preferred language during registration
- RTL layout automatically applied for Arabic
- All UI strings managed in translation files
- API sends locale in Accept-Language header

## 📦 Deployment

### Deploy to Vercel

1. **Connect your repository to Vercel**
2. **Set environment variables:**
   - `NEXT_PUBLIC_API_URL`: Your backend API URL
3. **Deploy!**

The frontend will be automatically deployed on push to main branch.

### Manual Deployment

```bash
npm run build
npm start
```

## 🔧 Environment Variables

```env
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api/v1
```

## 🎨 Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Custom Components**: Reusable styled components
- **Responsive Design**: Mobile-first approach
- **RTL Support**: Full right-to-left support for Arabic

## 📝 Code Quality

This project follows strict coding standards defined in `.cursorrules`:

- TypeScript only
- Strict typing
- No hard-coded values
- Separation of concerns
- Modular architecture
- Reusable components

## 🤝 Contributing

Please follow the coding standards defined in `.cursorrules`.

## 📄 License

MIT License - Shielder Digital Platform
