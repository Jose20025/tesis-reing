import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

export const app = express();

app.use(express.json());

app.use(
  cors({
    //   credentials: true,
    //   exposedHeaders: ['Content-Disposition', 'X-File-Ext', 'X-File-Name'],
  })
);

app.use(morgan('dev'));

app.get('/', (_, res) => {
  res.json({
    success: true,
    message: 'API de Vendedores - Kais',
    version: '1.0.0',
  });
});
