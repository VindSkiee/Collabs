import {
  findUserByProvider,
  insertUser,
  updateUserByProvider,
} from "./users.repository.js";

export async function getOrCreateUser({
  provider,
  provider_id,
  email,
  username,
  picture,
}) {
  let user = await findUserByProvider(provider, provider_id);

  if (!user) {
    // user baru → insert
    user = await insertUser({
      provider,
      provider_id,
      email,
      username,
      picture,
    });
  } else {
    // user sudah ada → update info terbaru
    user = await updateUserByProvider({
      provider,
      provider_id,
      email,
      username,
      picture,
    });
  }

  return user;
}
