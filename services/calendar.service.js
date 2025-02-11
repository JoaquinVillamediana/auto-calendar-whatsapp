const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

class CalendarService {
  constructor() {
    // Initialize Claude client
    this.anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });

    // Initialize Google OAuth2 client
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Set credentials from environment variables
    this.oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    // Create Google Calendar instance
    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  async getEventDetailsFromClaude(query) {
    const claudeResponse = await this.anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: process.env.CLAUDE_PROMPT + "\n\nQuery: " + query
      }]
    });

    return claudeResponse.content[0].text;
  }

  createEventObject(query, eventDetails) {
    return {
      summary: 'Auto-generated Event',
      description: `Generated from query: ${query}\n\nDetails: ${eventDetails}`,
      start: {
        dateTime: new Date().toISOString(),
        timeZone: 'America/Argentina/Buenos_Aires',
      },
      end: {
        dateTime: new Date(Date.now() + 3600000).toISOString(),
        timeZone: 'America/Argentina/Buenos_Aires',
      },
    };
  }

  async createCalendarEvent(event) {
    const createdEvent = await this.calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });
    return createdEvent.data;
  }

  async processQuery(query) {
    if (!query) {
      throw new Error('Query is required');
    }

    const eventDetails = await this.getEventDetailsFromClaude(query);
    const event = this.createEventObject(query, eventDetails);
    const createdEvent = await this.createCalendarEvent(event);

    return {
      message: 'Event created successfully',
      eventId: createdEvent.id,
      eventDetails: eventDetails
    };
  }
}

module.exports = new CalendarService(); 