import { neon } from '@neondatabase/serverless';
import { config } from '../config/index.js';

export const sql = neon(config.dbUrl);