# API Configuration

## Environment Variables

The application uses environment variables to configure the API endpoint. Create a `.env` file in the root directory based on `.env.example`.

### For Local Development

```bash
VITE_API_BASE_URL=http://localhost
```

### For Production

```bash
VITE_API_BASE_URL=https://your-api-domain.com
```

## API Endpoint

The application fetches clinic data from:
```
GET {VITE_API_BASE_URL}/api/clinic-catalog/vet-card/{slug}
```

For example, if the slug is "my-clinic":
```
GET http://localhost/api/clinic-catalog/vet-card/my-clinic
```

## Expected API Response Format

The API should return a JSON object with the following structure:

```json
{
  "id": 7,
  "tenant_id": "35d44037-58d3-4fa2-8ce4-deb13d4bf6cb",
  "color": "#7e14b8",
  "clinic_name": "Barbos VC",
  "tagline": "Clinic for your pet!",
  "enable_appointment_button": true,
  "sections": [
    {
      "id": "doctors",
      "name": "Doctors",
      "visible": true,
      "order": 0
    },
    {
      "id": "services",
      "name": "Services",
      "visible": true,
      "order": 1
    },
    {
      "id": "openingHours",
      "name": "Opening Hours",
      "visible": true,
      "order": 2
    }
  ],
  "slug": "my-clinic",
  "phone": "+380660992330",
  "email": "my-clinic@gmail.com",
  "address": "ul. Piotra Skargi 33B/2, Stęszew",
  "logo_url": null,
  "service_ids": [1, 2],
  "doctor_ids": [11, 5, 2, 1],
  "opening_hours": {
    "monday": {
      "open": "09:00",
      "close": "18:00",
      "closed": true
    },
    "tuesday": {
      "open": "09:00",
      "close": "18:00",
      "closed": false
    }
  },
  "services": [
    {
      "id": 1,
      "name": "Wellness Exams"
    },
    {
      "id": 2,
      "name": "Vaccinations"
    }
  ],
  "doctors": [
    {
      "id": 1,
      "name": "Dr. John Doe",
      "specialization": "Veterinarian",
      "photo_url": "https://example.com/photo.jpg"
    }
  ],
  "gallery": [],
  "reviews": []
}
```

### Key Fields:

- **color**: Hex color code for branding (buttons, bullets, etc.)
- **clinic_name**: The clinic's display name
- **tagline**: Short description or slogan
- **enable_appointment_button**: Boolean to show/hide appointment button
- **sections**: Array defining which sections are visible and their order
- **opening_hours**: Object with days and their open/close times or "closed" status
- **services**: Array of service objects with id and name
- **doctors**: Array of doctor objects with id, name, specialization, and photo_url

## Routing

The application uses Vue Router with dynamic slug routing:

- `/:slug` - Displays the clinic page for the given slug (e.g., `/my-clinic`)
- `/appointment` - Appointment booking page
- `/about` - About page

## Testing

To test the application:

1. Make sure your API is running and accessible at the configured URL
2. Run the development server: `npm run dev`
3. Navigate to `http://localhost:5173/my-clinic` (or any other clinic slug)

The application will:
- Show a loading spinner while fetching data
- Display the clinic information if successful
- Show an error message if the API request fails
