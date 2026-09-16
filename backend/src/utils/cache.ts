import NodeCache from 'node-cache';

// TTL default to 15 seconds for relatively real-time data, 
// ensuring we don't spam the DB if 50 users hit dashboard at once
export const cache = new NodeCache({ stdTTL: 15, checkperiod: 20 });

// Cache Keys
export const CACHE_KEYS = {
  DASHBOARD_STATS: 'admin_dashboard_stats',
  TICKET_CATEGORIES: 'ticket_categories',
  TICKET_PRIORITIES: 'ticket_priorities'
};
