# WhatsApp to Google Calendar Event Creator

This project is a Node.js application that automatically creates Google Calendar events from WhatsApp messages using Claude AI for natural language processing. It can understand event details from text messages and create calendar events with Google Meet integration when needed.

## Features

- 🤖 Natural Language Processing using Claude AI
- 📅 Automatic Google Calendar event creation
- 🎥 Google Meet integration for virtual meetings
- 📍 Location support for physical events
- ✉️ Automatic email invitations to attendees
- 🌎 Argentina timezone support (configurable)

## Prerequisites

Before you begin, ensure you have:
- Node.js (v18 or higher)
- A Google Cloud Platform account with Calendar API enabled
- An Anthropic API key for Claude AI
- Google Calendar API credentials

## Setup

1. Clone the repository:
```bash
git clone [your-repo-url]
cd autowpp-calendar
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
# Claude API Configuration
CLAUDE_API_KEY=your_claude_api_key_here

# Google Calendar API Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback
GOOGLE_REFRESH_TOKEN=your_refresh_token

# Attendee Configuration
ATTENDEE_EMAIL=your_email@example.com
```

4. Get your Google Calendar refresh token:
```bash
node scripts/get-refresh-token.js
```
Follow the browser prompts to authorize the application and copy the refresh token to your `.env` file.

## Usage

1. Start the server:
```bash
node app.js
```

2. Send a POST request to create an event:
```bash
curl -X POST http://localhost:3000/api/calendar/process-query \
-H "Content-Type: application/json" \
-d '{"query": "Mañana a las 15:00 tengo reunión con el equipo de desarrollo"}'
```

### Example Queries

The system understands natural language queries like:
- "Mañana a las 15:00 tengo reunión virtual con el equipo"
- "Almuerzo en La Piazza el viernes a las 13:00"
- "Llamada con el cliente el lunes que viene a las 10:00"

### Response Format

The API returns a JSON response with the created event details:
```json
{
  "message": "Event created successfully",
  "eventId": "event_id",
  "eventDetails": {
    "status": 200,
    "event": {
      "title": "Reunión de equipo",
      "description": "Reunión virtual con el equipo de desarrollo",
      "start": "2024-03-20T15:00:00-03:00",
      "end": "2024-03-20T16:00:00-03:00",
      "location": "Optional location",
      "conference": true
    }
  }
}
```

## Features in Detail

### Virtual Meetings
- Automatically creates Google Meet links for virtual meetings
- The specified attendee becomes the meeting organizer with full admin privileges
- Includes meeting join information in calendar invites

### Calendar Events
- Creates events in the specified timezone (default: America/Argentina/Buenos_Aires)
- Sends email invitations to attendees
- Includes location information for physical meetings
- Supports default reminders

### AI Processing
- Uses Claude AI to understand natural language event descriptions
- Extracts relevant event details (time, date, location, virtual/physical)
- Handles relative dates (tomorrow, next Monday, etc.)
- Supports Spanish language input

## Error Handling

The API returns appropriate error responses:
- 400: Invalid request body
- 500: Server error or invalid event details

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is licensed under the ISC License. 