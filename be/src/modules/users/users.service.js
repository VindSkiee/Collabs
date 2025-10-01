import {
  findById,
  findUserByProvider,
  insertUser,
  updateUserByProvider,
} from "./users.repository.js";
import AppError from '../../utils/appError.js';


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

export async function getUserProfile(userId) {
    const user = await findById(userId);
    if (!user) {
      throw new AppError('Pengguna tidak ditemukan.', 404);
    }

    // Buat ID simpel secara dinamis dari UUID
    const simpleId = user.id.substring(0, 8);
    
    return {
      username: user.username,
      email: user.email,
      simpleId: simpleId,
    };
  
};
  