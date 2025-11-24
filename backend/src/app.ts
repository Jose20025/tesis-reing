import cors from 'cors';
import express from 'express';
import morgan from 'morgan';

import { billeterasController } from './features/billeteras/billeteras.controller';
import { comisionesController } from './features/comisiones/comisiones.controller';
import { gruposProductoController } from './features/grupos-producto/grupos-producto.controller';
import { marcasProductoController } from './features/marcas-producto/marcas-producto.controller';
import { proveedoresController } from './features/proveedores/proveedores.controller';
import { usuariosController } from './features/usuarios/usuarios.controller';
import { vendedoresController } from './features/vendedores/vendedores.controller';
import { zonasController } from './features/zonas/zonas.controller';
import { errorHandler } from './lib/error-handler';

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
app.use('/vendedores', vendedoresController);
app.use('/zonas', zonasController);
app.use('/billeteras', billeterasController);
app.use('/comisiones', comisionesController);
app.use('/grupos-producto', gruposProductoController);
app.use('/marcas-producto', marcasProductoController);
app.use('/proveedores', proveedoresController);

// Error handler
app.use(errorHandler);
