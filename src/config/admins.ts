// Telegram user IDs of administrators and organizers
export const ADMIN_IDS = [
  283397879, // @username1
  987654321, // @username2
  // Add other admin IDs here
];

export const ORGANIZER_IDS = [
  234567890, // @organizer1
  345678901, // @organizer2
  // Add other organizer IDs here
];

export const isAdmin = (userId: number): boolean => {
  return ADMIN_IDS.includes(userId);
};

export const isOrganizer = (userId: number): boolean => {
  return ORGANIZER_IDS.includes(userId);
};

export const hasPrivilegedAccess = (userId: number): boolean => {
  return isAdmin(userId) || isOrganizer(userId);
};