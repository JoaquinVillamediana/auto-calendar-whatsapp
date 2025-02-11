import { google } from 'googleapis';
import Anthropic from '@anthropic-ai/sdk';
import googleService from './google.service.js';
import dotenv from 'dotenv';

dotenv.config();

class CalendarService {
  constructor() {
    // Initialize Claude client
    this.anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });

    // Initialize calendar instance with the oauth2Client from Google service
    this.calendar = google.calendar({ 
      version: 'v3', 
      auth: googleService.getClient()
    });
  }

  async getEventDetailsFromClaude(query) {
    // Replace {{{TODAY-DATE}}} with current date in the prompt
    // const today = new Date().toISOString().split('T')[0];
    // const prompt = process.env.CLAUDE_PROMPT.replace('{{{TODAY-DATE}}}', today);

    // const claudeResponse = await this.anthropic.messages.create({
    //   model: "claude-3-sonnet-20240229",
    //   max_tokens: 1000,
    //   messages: [{
    //     role: "user",
    //     content: prompt + "\n\nQuery: " + query
    //   }]
    // });

    // return claudeResponse.content[0].text;
    return {
      status: 200,
      event: {
        title: "Cena en La Piazza",
        description: "Cena con amigos en el restaurante La Piazza.",
        start: "2025-02-11T18:00:00-03:00",
        end: "2025-02-11T19:00:00-03:00"
      }
    }
    
  }

  createEventObject(query, eventDetails) {
    try {
      const parsedDetails = typeof eventDetails === 'string' ? JSON.parse(eventDetails) : eventDetails;
      
      if (parsedDetails.status !== 200) {
        throw new Error('Could not parse event details from the message');
      }

      return {
        summary: parsedDetails.event.title,
        description: parsedDetails.event.description,
        start: {
          dateTime: parsedDetails.event.start,
          timeZone: 'America/Argentina/Buenos_Aires',
        },
        end: {
          dateTime: parsedDetails.event.end,
          timeZone: 'America/Argentina/Buenos_Aires',
        },
      };
    } catch (error) {
      console.error('Error parsing event details:', error);
      throw new Error('Failed to parse event details from Claude response');
    }
  }

  async createCalendarEvent(event) {
    try {
      const createdEvent = await this.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });
      return createdEvent.data;
    } catch (error) {
      // If token expired, refresh it and try again
      if (error.code === 401) {
        await googleService.refreshAccessToken();
        const createdEvent = await this.calendar.events.insert({
          calendarId: 'primary',
          resource: event,
        });
        return createdEvent.data;
      }
      throw error;
    }
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
      eventDetails: typeof eventDetails === 'string' ? JSON.parse(eventDetails) : eventDetails
    };
  }
}

export default new CalendarService(); 