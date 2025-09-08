
    // src/utils/verifyGoogleToken.js
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Verifies a Google ID token and returns user info
 * @param {string} tokenId - Google ID token from frontend
 * @returns {Promise<{email: string, name: string}>} - User payload
 */
export const verifyGoogleToken = async (tokenId) => {
  if (!tokenId) throw new Error("Google token is required");

  const ticket = await client.verifyIdToken({
    idToken: tokenId,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { email, name } = payload;

  if (!email || !name) {
    throw new Error("Google account missing required info");
  }

  return { email, name };
};
