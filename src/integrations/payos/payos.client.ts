import PayOS from '@payos/node';
import { env } from '../../config/env';

// Initialize the PayOS SDK client with credentials
export const payOS = new PayOS(
  env.PAYOS_CLIENT_ID,
  env.PAYOS_API_KEY,
  env.PAYOS_CHECKSUM_KEY
);
