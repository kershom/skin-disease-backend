// Hardcoded admin emails
// Only these 4 emails can access the Admin Dashboard
export const ADMIN_EMAILS = [
  'ishasuraj2003@gmail.com',      // ← replace with real admin email 1
  'sanjanabaligar176@gmail.com',      // ← replace with real admin email 2
  'shamanair13@gmail.com',      // ← replace with real admin email 3
  'admin4@gmail.com',      // ← replace with real admin email 4
];

export const isAdmin = (email) => {
  return ADMIN_EMAILS.includes(email?.toLowerCase());
};