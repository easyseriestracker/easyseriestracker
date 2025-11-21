import { User } from '../types';
import { getShowDetails } from './tmdbService';

const NOTIFICATION_LOG_KEY = 'cinephile_notif_log';

const getNotificationLog = (): Record<string, number> => {
  const log = localStorage.getItem(NOTIFICATION_LOG_KEY);
  return log ? JSON.parse(log) : {};
};

const saveNotificationLog = (log: Record<string, number>) => {
  localStorage.setItem(NOTIFICATION_LOG_KEY, JSON.stringify(log));
};

export const checkAndNotify = async (user: User): Promise<string[]> => {
  // No API Key check needed anymore as we use public API

  const log = getNotificationLog();
  const notifications: string[] = [];
  const now = new Date();

  for (const item of user.watchlist) {
    const details = await getShowDetails(item.showId);
    
    if (details && details.next_episode_to_air) {
      const ep = details.next_episode_to_air;
      const airDate = new Date(ep.air_date);
      
      // Check if episode airs today or aired recently (within 24h)
      const diffTime = Math.abs(now.getTime() - airDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      // Notify if it aired today/yesterday or is about to air today
      const isRelevant = diffDays <= 1; 

      if (isRelevant) {
        const uniqueId = `${details.id}_S${ep.season_number}E${ep.episode_number}`;
        
        // SPAM PROTECTION
        if (!log[uniqueId]) {
          console.log(`
            --------------------------------------------------
            [MOCK EMAIL SERVICE]
            To: ${user.email}
            Subject: New Episode Alert: ${details.name}
            
            Hey ${user.username},
            
            A new episode of ${details.name} is airing!
            "${ep.name}" (S${ep.season_number}E${ep.episode_number})
            
            Overview: ${ep.overview || 'No description available.'}
            
            Happy Watching!
            - The Cinephile Team
            --------------------------------------------------
          `);

          notifications.push(`New episode of ${details.name} is out! (Email sent)`);
          
          // Mark as sent
          log[uniqueId] = Date.now();
        }
      }
    }
  }
  
  saveNotificationLog(log);
  return notifications;
};