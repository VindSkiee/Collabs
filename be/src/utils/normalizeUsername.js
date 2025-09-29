export function normalizeUsername(raw) {
  if (!raw) return null;

  // ubah ke lowercase
  let username = raw.toLowerCase();

  // hapus semua angka
  username = username.replace(/\d+/g, "");

  // hapus karakter non-huruf (opsional)
  username = username.replace(/[^a-z]/g, "");

  return username;
}
