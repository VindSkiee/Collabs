import { getOrCreateUser } from "./users.service.js";

export async function oauthCallbackHandler({ provider, provider_id, email, name: username, picture }) {
  try {
    const user = await getOrCreateUser({
      provider,
      provider_id,
      email,
      username,
      picture,
    });

    return user; // kembalikan ke caller (loginWithGoogle)
  } catch (error) {
    console.error("oauthCallbackHandler error:", error);
    throw error; // lempar ke caller
  }
}
