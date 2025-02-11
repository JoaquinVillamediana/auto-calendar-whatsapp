import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

class GoogleService {
  constructor() {
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Set credentials immediately using the refresh token from env
    this.oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });
  }

  /**
   * Get a new access token using the stored refresh token
   * @returns {Promise<Object>} Object containing new access token info
   */
  async refreshAccessToken() {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      return {
        success: true,
        access_token: credentials.access_token,
        expiry_date: credentials.expiry_date
      };
    } catch (error) {
      console.error('Error refreshing access token:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get the OAuth2 client instance
   * @returns {OAuth2Client} The configured OAuth2 client
   */
  getClient() {
    return this.oauth2Client;
  }
}

export default new GoogleService();

