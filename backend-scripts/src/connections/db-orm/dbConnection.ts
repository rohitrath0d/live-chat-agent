// Prisma documentation upgrade
// If you use default output (node_modules/.prisma/client), you can still do:
// import {PrismaClient} from '@prisma/client';  -- but this doesnt work 

// If you use custom output path, the import changes:
import { PrismaClient } from '../../../prisma/generated/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = new PrismaClient({
  adapter
});