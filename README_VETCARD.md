# VetCard - Veterinary Clinic Appointment System

A modern, mobile-first web application for veterinary clinic appointments built with Vue 3, TypeScript, and Tailwind CSS.

## Features

- 📅 Interactive calendar for appointment scheduling
- 🏥 Clinic information display
- 👨‍⚕️ Veterinarians showcase
- 📱 Mobile-responsive design
- 🎨 Beautiful UI with Tailwind CSS and Flowbite

## Tech Stack

- **Vue 3** - Progressive JavaScript Framework
- **TypeScript** - Type-safe development
- **Vite** - Next-generation frontend tooling
- **Tailwind CSS** - Utility-first CSS framework
- **Flowbite Vue** - UI component library
- **Vue Router** - Official router for Vue.js
- **Pinia** - Vue Store

## Prerequisites

- Node.js v22.12.0 or higher (recommended: v22.22.0)
- npm v10.9.4 or higher

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd vetcard-public
```

2. Install dependencies:
```bash
npm install
```

## Development

Run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── assets/          # Static assets and styles
├── components/      # Reusable Vue components
├── router/          # Vue Router configuration
├── stores/          # Pinia stores
└── views/           # Page components
    ├── ClinicView.vue         # Main clinic information page
    ├── AppointmentView.vue    # Appointment booking page
    └── AboutView.vue          # About page
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test:unit` - Run unit tests
- `npm run type-check` - Run TypeScript type checking

## Pages

### Clinic Page (`/`)
- Displays clinic information
- Shows veterinarians
- Lists available services
- Contact information with click-to-call and maps integration

### Appointment Page (`/appointment`)
- Interactive calendar for date selection
- Time slot selection
- User information form
- Appointment confirmation

## Browser Support

### Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

### Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)

## License

Private

## Author

Created for VetCard veterinary clinic system
