import { User } from '../types';
import { isAdmin, isOrganizer } from './admins';

export const hasPrivilegedAccess = (userId: number): boolean => {
  return isAdmin(userId) || isOrganizer(userId);
};