# VetCard Public - Veterinary Clinic Catalog & Appointment System

A modern, mobile-first web application for veterinary clinic catalog, appointments, and information display. The application provides an interactive platform for clinics to showcase their services, veterinarians, and allow clients to book appointments online.

## 🌟 Features

### Clinic Catalog
- 🏥 **Clinic Catalog** - Browse all available veterinary clinics
- 🔍 **Clinic Details** - View clinic information, services, doctors, opening hours
- 🎨 **Customizable Branding** - Dynamic theming based on clinic branding colors

### Appointment Booking
- 📅 **Interactive Calendar** - Easy-to-use calendar interface for scheduling
- ⏰ **Time Slot Selection** - Choose available time slots
- 🏢 **Branch Selection** - Select branch if clinic has multiple locations
- ✅ **Form Validation** - Complete form with all required fields

### User Experience
- 📱 **Mobile-Responsive Design** - Optimized for all device sizes (mobile-first)
- 💾 **Local Storage** - Save appointments and user profile for quick access
- 📋 **My Appointments** - View, filter (upcoming/past), and manage saved appointments
- 👤 **Auto-fill Forms** - Remember user data (name, phone, email) for future bookings

### Internationalization
- 🌐 **Multi-language Support** - Ukrainian (default) and English
- 🔄 **Language Switcher** - Easy language switching in catalog

### Technical
- 🔗 **API-Driven** - Fetches clinic data dynamically from a backend API
- 🌐 **Multi-Clinic Support** - Single application serving multiple clinics via slug routing
- 🚀 **SEO Ready** - Meta tags, Open Graph support

## 🛠️ Tech Stack

- **React 19** - Modern JavaScript library for building user interfaces
- **TypeScript** - Type-safe development with static typing
- **Vite** - Next-generation frontend build tool for fast development
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **React Router** - Client-side routing for single-page application
- **i18next** - Internationalization framework
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
├── assets/              # Static assets and global styles
│   └── icons/           # SVG icons
├── components/          # Reusable React components
│   ├── PetsIcon.tsx     # Pet icon component
│   └── LanguageSwitcher.tsx  # Language switcher component
├── data/                # Static data files
│   └── clinicMapping.json    # Clinic slug to tenant domain mapping
├── hooks/               # Custom React hooks
│   └── useDocumentMeta.ts    # SEO meta tags hook
├── i18n/                # Internationalization
│   ├── index.ts         # i18n configuration
│   └── locales/         # Translation files
│       ├── uk.json      # Ukrainian translations
│       └── en.json      # English translations
├── pages/               # Page components
│   ├── CatalogPage.tsx        # Clinic catalog (home page)
│   ├── ClinicPage.tsx         # Clinic information page
│   ├── AppointmentPage.tsx    # Appointment booking page
│   └── MyAppointmentsPage.tsx # User's saved appointments
├── services/            # API and storage services
│   ├── clinicApi.ts           # Clinic API client
│   ├── appointmentStorage.ts  # Appointment localStorage service
│   └── userStorage.ts         # User profile localStorage service
├── App.tsx              # Main application component with routing
└── main.tsx             # Application entry point
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot-reload
- `npm run build` - Type-check and build for production
- `npm run preview` - Preview production build locally
- `npm run test:unit` - Run unit tests with Vitest
- `npm run lint` - Lint code with ESLint

## 🌐 Routing

The application uses dynamic routing to support multiple clinics:

- `/` - Clinic catalog (home page)
- `/my-appointments` - User's saved appointments
- `/:slug` - Displays the clinic page for the given slug (e.g., `/my-clinic`)
- `/:slug/appointment` - Appointment booking page for the specified clinic

## 🔌 API Integration

The application fetches clinic data from a backend API. For detailed API configuration and expected response format, see [API_SETUP.md](API_SETUP.md).

**API Endpoints:**
```
GET {VITE_API_BASE_URL}/api/clinics/list                    # Get all clinics for catalog
GET {VITE_API_BASE_URL}/api/clinic-catalog/vet-card/{slug}  # Get clinic details by slug
POST {tenant_domain}/api/public/appointments                 # Create appointment (tenant-specific)
```

## 💾 Local Storage

The application uses localStorage for improved user experience:

| Key | Description |
|-----|-------------|
| `vetcard_appointments` | Saved appointments (up to 50) |
| `vetcard_user_profile` | User profile (name, phone, email) |
| `i18nextLng` | Selected language preference |

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
