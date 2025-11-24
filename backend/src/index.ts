import { app } from './app';
import { envConfig } from './config/env.config';
import { prisma } from './db/prisma';

async function startServer() {
  try {
    // Conectar a la base de datos
    await prisma.$connect();
    console.log('Conexión a la base de datos establecida.');

    // Iniciar el servidor
    app.listen(envConfig.PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${envConfig.PORT}`);
    });
  }
  catch (error) {
    console.error('Error iniciando el servidor:', error);

    process.exit(1);
  }
}

startServer();
