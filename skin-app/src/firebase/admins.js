// Hardcoded admin emails
// Only these 4 emails can access the Admin Dashboard
export const ADMIN_EMAILS = [
  'admin1@gmail.com',      // ← replace with real admin email 1
  'admin2@gmail.com',      // ← replace with real admin email 2
  'admin3@gmail.com',      // ← replace with real admin email 3
  'admin4@gmail.com',      // ← replace with real admin email 4
];

export const isAdmin = (email) => {
  return ADMIN_EMAILS.includes(email?.toLowerCase());
};
