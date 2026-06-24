import http from 'http';
import createApp from './app';
import { connectDatabase } from './config/database';
import { verifyEmailConnection } from './config/email';
import { env } from './config/env';

const startServer = async (): Promise<void> => {
  try {
    // 1. Connect to MongoDB
    await connectDatabase();

    // 2. Verify email (non-blocking warning)
    await verifyEmailConnection();

    // 3. Create Express app
    const app = createApp();
    const server = http.createServer(app);

    // 4. Start listening
    server.listen(env.PORT, () => {
      console.log(`\n🚀 MediSource API Server started`);
      console.log(`   ├── Environment : ${env.NODE_ENV}`);
      console.log(`   ├── Port        : ${env.PORT}`);
      console.log(`   ├── Base URL    : http://localhost:${env.PORT}/api/v1`);
      console.log(`   ├── Health      : http://localhost:${env.PORT}/api/v1/health`);
      console.log(`   └── Docs        : http://localhost:${env.PORT}/api/v1/health\n`);
    });

    // 5. Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      console.log(`\n📴 ${signal} received — shutting down gracefully...`);
      server.close(async () => {
        const { disconnectDatabase } = await import('./config/database');
        await disconnectDatabase();
        console.log('✅ Server closed');
        process.exit(0);
      });

      // Force close after 30 seconds
      setTimeout(() => {
        console.error('⏱️  Forcefully shutting down');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // 6. Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: Error) => {
      console.error('💥 Unhandled Rejection:', reason);
      server.close(() => process.exit(1));
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
