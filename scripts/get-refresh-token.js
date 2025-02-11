import { OAuth2Client } from 'google-auth-library';
import http from 'http';
import url from 'url';
import open from 'open';
import dotenv from 'dotenv';

dotenv.config();

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/oauth2callback'
);

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
];

async function getRefreshToken() {
  const authorizeUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });

  // Create temporary server to handle the OAuth2 callback
  const server = http.createServer(async (req, res) => {
    try {
      const queryParams = url.parse(req.url, true).query;
      if (queryParams.code) {
        const { tokens } = await oauth2Client.getToken(queryParams.code);
        console.log('\nRefresh Token:', tokens.refresh_token);
        console.log('\nAdd this refresh token to your .env file as GOOGLE_REFRESH_TOKEN\n');
        res.end('Authentication successful! You can close this window.');
        server.close();
      }
    } catch (error) {
      console.error('Error getting tokens:', error);
      res.end('Authentication failed! Check the console for more details.');
      server.close();
    }
  });

  server.listen(3000, () => {
    console.log('Opening browser for authentication...');
    open(authorizeUrl);
  });
}

getRefreshToken(); 