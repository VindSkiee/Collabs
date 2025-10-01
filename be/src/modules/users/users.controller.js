import { getOrCreateUser, getUserProfile } from "./users.service.js";

export async function oauthCallbackHandler({
  provider,
  provider_id,
  email,
  name: username,
  picture,
}) {
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

export async function getMyProfile(req, res, next) {
  try {
    // req.user.id didapat dari isAuthenticated middleware
    const profile = await getUserProfile(req.user.id);
    res.status(200).json({
      status: "success",
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/users/me
