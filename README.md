# VetCard Public - Veterinary Clinic Appointment System

A modern, mobile-first web application for veterinary clinic appointments and information display. The application provides an interactive platform for clinics to showcase their services, veterinarians, and allow clients to book appointments online.

## 🌟 Features

- 📅 **Interactive Appointment Booking** - Easy-to-use calendar interface for scheduling appointments
- 🏥 **Clinic Information Display** - Showcase clinic details, services, and opening hours
- 👨‍⚕️ **Veterinarians Showcase** - Display veterinarian profiles with photos and specializations
- 📱 **Mobile-Responsive Design** - Optimized for all device sizes
- 🎨 **Customizable Branding** - Dynamic theming based on clinic branding colors
- 🔗 **API-Driven** - Fetches clinic data dynamically from a backend API
- 🌐 **Multi-Clinic Support** - Single application serving multiple clinics via slug routing

## 🛠️ Tech Stack

- **React 19** - Modern JavaScript library for building user interfaces
- **TypeScript** - Type-safe development with static typing
- **Vite** - Next-generation frontend build tool for fast development
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **React Router** - Client-side routing for single-page application
- **Vitest** - Fast unit testing framework

## 📋 Prerequisites

- Node.js v20.19.0 or v22.12.0+ (see `engines` in package.json)
- npm v10.9.4 or higher

## 🚀 Getting Started

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Yurij2015/vet-card-public.git
cd vet-card-public
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure your API endpoint:
```env
VITE_API_BASE_URL=http://localhost
```

### Development

Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

Build the application for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── assets/           # Static assets and global styles
├── components/       # Reusable React components
├── pages/           # Page components
│   ├── ClinicPage.tsx          # Main clinic information page
│   └── AppointmentPage.tsx     # Appointment booking page
├── services/        # API service layer
│   └── clinicApi.ts            # Clinic API client
├── App.tsx          # Main application component with routing
└── main.tsx         # Application entry point
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot-reload
- `npm run build` - Type-check and build for production
- `npm run preview` - Preview production build locally
- `npm run test:unit` - Run unit tests with Vitest
- `npm run lint` - Lint code with ESLint

## 🌐 Routing

The application uses dynamic routing to support multiple clinics:

- `/` - Redirects to `/my-clinic` (default clinic)
- `/:slug` - Displays the clinic page for the given slug (e.g., `/my-clinic`)
- `/:slug/appointment` - Appointment booking page for the specified clinic

## 🔌 API Integration

The application fetches clinic data from a backend API. For detailed API configuration and expected response format, see [API_SETUP.md](API_SETUP.md).

**API Endpoint:**
```
GET {VITE_API_BASE_URL}/api/clinic-catalog/vet-card/{slug}
```

## 💻 Recommended IDE Setup

[Visual Studio Code](https://code.visualstudio.com/) with the following extensions:
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

## 🌐 Browser Support

Modern browsers with ES6+ support:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

**Recommended Browser Extensions:**
- [React Developer Tools](https://react.dev/learn/react-developer-tools)

## 📄 License

Private

## 👤 Author

Created for VetCard veterinary clinic system

---

For more detailed information about API setup and configuration, please refer to [API_SETUP.md](API_SETUP.md).
