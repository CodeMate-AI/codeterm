import { v4 as uuidv4 } from 'uuid';

export const generateUniqueId = (): string => {
  return uuidv4(); // Generate a UUID v4
};
