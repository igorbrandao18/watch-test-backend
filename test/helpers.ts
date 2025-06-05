import { PrismaClient } from '../generated/prisma';
import { execSync } from 'child_process';
import { join } from 'path';
import { URL } from 'url';
import { v4 as uuid } from 'uuid';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load test environment variables
dotenv.config({ path: path.join(__dirname, '.env.test') });

let prisma: PrismaClient | null = null;
let currentSchema: string | null = null;

export const setupTestDatabase = async () => {
  // Clean up any existing test database
  await cleanupTestDatabase();

  // Set test environment
  process.env.NODE_ENV = 'test';
  
  const schemaId = `test_${uuid()}`;
  currentSchema = schemaId;

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Create a new schema URL with the test schema
  const url = new URL(process.env.DATABASE_URL);
  url.searchParams.set('schema', schemaId);
  const databaseUrl = url.toString();

  // Update DATABASE_URL to use the test schema
  process.env.DATABASE_URL = databaseUrl;

  // Create a new Prisma client instance with the test schema
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

  try {
    // Connect to the database
    await prisma.$connect();

    // Create the schema
    await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaId}"`);

    // Run migrations
    const prismaBinary = join(__dirname, '..', 'node_modules', '.bin', 'prisma');
    execSync(`${prismaBinary} migrate deploy`, {
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
      },
      stdio: 'inherit',
    });

    return prisma;
  } catch (error) {
    console.error('Error setting up test database:', error);
    await cleanupTestDatabase();
    throw error;
  }
};

export const cleanupTestDatabase = async () => {
  if (prisma) {
    try {
      await prisma.$disconnect();
    } catch (error) {
      console.error('Error disconnecting from test database:', error);
    }
  }

  if (currentSchema) {
    // Create a temporary client to drop the schema
    const tempPrisma = new PrismaClient();
    try {
      await tempPrisma.$connect();
      await tempPrisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${currentSchema}" CASCADE`);
    } catch (error) {
      console.error('Error cleaning up test database:', error);
    } finally {
      await tempPrisma.$disconnect();
    }
  }

  prisma = null;
  currentSchema = null;
}; 