import dotenv from 'dotenv';
import DiscordClient from './client';

dotenv.config();
dotenv.config({ path: `.env.local`, override: true });

let client = new DiscordClient();
client.start();