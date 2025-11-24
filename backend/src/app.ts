import cors from 'cors';
import express from 'express';
import morgan from 'morgan';

import { usuariosController } from './features/usuarios/usuarios.controller';

export const app = express();

app.use(express.json());

app.use(
  cors({
    //   credentials: true,
    //   exposedHeaders: ['Content-Disposition', 'X-File-Ext', 'X-File-Name'],
  }),
);

app.use(morgan('dev'));

app.get('/', (_, res) => {
  res.json({
    success: true,
    message: 'API de Vendedores',
    version: '1.0.0',
  });
});

// Rutas
app.use('/usuarios', usuariosController);
