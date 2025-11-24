import type { NextFunction, Request, Response } from 'express';

import { Prisma } from '@/generated/prisma/client';

export class CustomHttpError extends Error {
  public httpCode: number;

  constructor(message: string, httpCode: number) {
    super(message);
    this.name = 'CustomError';
    this.httpCode = httpCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  let error = { ...err };
  error.message = err.message;

  // Log del error
  console.error(err);

  // Errores personalizados
  if (err instanceof CustomHttpError) {
    error = createError(err.message, err.httpCode);
  }

  // Errores de Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Ejemplo: Violación de restricción única
    if (err.code === 'P2002') {
      const message = `El valor proporcionado para el campo único ya existe. Detalles: ${err.meta?.target}`;
      error = createError(message, 409);
    }
    // Ejemplo: Registro no encontrado
    if (err.code === 'P2025' || err.code === 'P2016') {
      const message = 'El recurso requerido no fue encontrado.';
      error = createError(message, 404);
    }
  }

  // Error por defecto
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Error interno del servidor',
  });
}

function createError(message: string, statusCode: number): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
}
