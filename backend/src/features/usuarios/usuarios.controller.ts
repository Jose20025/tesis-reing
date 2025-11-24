import { Router } from 'express';

import { createUsuarioSchema, loginUsuarioSchema } from './usuarios.schema';
import { UsuariosService } from './usuarios.service';

export const usuariosController = Router();

const service = new UsuariosService();

// Obtener todos los usuarios
usuariosController.get('/', async (_, res) => {
  const usuarios = await service.getAll();

  res.json(usuarios);
});

// Login de usuario
usuariosController.post('/login', async (req, res) => {
  const dataValidation = loginUsuarioSchema.safeParse(req.body);

  if (!dataValidation.success) {
    return res.status(400).json({
      error: 'Datos de login inválidos',
      details: dataValidation.error,
    });
  }

  const { username, password } = dataValidation.data;

  const usuario = await service.login(username, password);

  res.json(usuario);
});

// Registrar usuario
usuariosController.post('/registrar', async (req, res) => {
  const dataValidation = createUsuarioSchema.safeParse(req.body);

  if (!dataValidation.success) {
    return res.status(400).json({
      error: 'Datos de usuario inválidos',
      details: dataValidation.error,
    });
  }

  const nuevoUsuario = await service.register(dataValidation.data);

  res.status(201).json(nuevoUsuario);
});
