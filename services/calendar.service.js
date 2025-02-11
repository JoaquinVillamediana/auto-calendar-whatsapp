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
    // Obtener el día de la semana, el día del mes, el mes y el año
    const date = new Date();
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const dayOfWeek = daysOfWeek[date.getDay()];
    const dayOfMonth = date.getDate();
    const month = date.getMonth() + 1; // Months in JavaScript go from 0 to 11
    const year = date.getFullYear();

    // Format the date in the desired format
    const today = `${dayOfWeek} ${dayOfMonth} del mes ${month.toString().padStart(2, '0')} del año ${year}`;

    const prompt = process.env.CLAUDE_PROMPT.replace('{{{TODAY-DATE}}}', today);

    const claudeResponse = await this.anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      system: prompt,
      temperature: 0.5,
      messages: [{
        role: "user",
        content: query
      }]
    });
    console.log(claudeResponse.content[0].text);
    return claudeResponse.content[0].text;

    //TEST
    // return {
    //   status: 200,
    //   event: {
    //     title: "Cena en La Piazza",
    //     description: "Cena con amigos en el restaurante La Piazza.",
    //     start: "2025-02-11T14:00:00-03:00",
    //     end: "2025-02-11T15:00:00-03:00",
    //     location: "Av. Corrientes 1861, C1014AAA, Buenos Aires, Argentina",
    //     conference: true
    //   }
    // }

  }

  createEventObject(query, eventDetails) {
    try {
      const parsedDetails = typeof eventDetails === 'string' ? JSON.parse(eventDetails) : eventDetails;

      if (parsedDetails.status !== 200) {
        throw new Error('Could not parse event details from the message');
      }

      const attendeeEmail = process.env.ATTENDEE_EMAIL;

      const eventObject = {
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
        attendees: [
          {
            email: attendeeEmail,
            responseStatus: 'accepted',
            organizer: true
          }
        ],
        sendUpdates: 'all',
        guestsCanSeeOtherGuests: true,
        reminders: {
          useDefault: true
        },
        organizer: {
          email: attendeeEmail,
          displayName: attendeeEmail.split('@')[0],
          self: true
        }
      };

      // Add location if present
      if (parsedDetails.event.location) {
        eventObject.location = parsedDetails.event.location;
      }

      // Add Google Meet conference if requested
      if (parsedDetails.event.conference) {
        eventObject.conferenceData = {
          createRequest: {
            requestId: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            },
            status: {
              statusCode: 'success'
            }
          },
          entryPoints: [{
            entryPointType: 'video',
            uri: '',
            label: parsedDetails.event.title
          }],
          conferenceSolution: {
            key: {
              type: 'hangoutsMeet'
            },
            name: 'Google Meet'
          },
          conferenceId: '',
          signature: '',
          notes: '',
          parameters: {
            addAttendeePrivileges: true
          }
        };

        // Set the attendee as the conference owner
        eventObject.conferenceData.creator = {
          email: attendeeEmail,
          displayName: attendeeEmail.split('@')[0],
          self: false
        };
      }

      return eventObject;
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
        sendNotifications: true,
        conferenceDataVersion: 1
      });
      return createdEvent.data;
    } catch (error) {
      // If token expired, refresh it and try again
      if (error.code === 401) {
        await googleService.refreshAccessToken();
        const createdEvent = await this.calendar.events.insert({
          calendarId: 'primary',
          resource: event,
          sendNotifications: true,
          conferenceDataVersion: 1
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