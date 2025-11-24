export enum TipoUsuario {
  ADMINISTRADOR = 'ADMINISTRADOR',
  VENDEDOR = 'VENDEDOR',
}

export interface Usuario {
  id: number;
  nombre: string;
  username: string;
  vendedorId: number | null;
  isActivo: boolean;
  tipo: TipoUsuario;
}

export type UsuarioApp = Pick<
  Usuario,
  'id' | 'nombre' | 'username' | 'vendedorId' | 'tipo' | 'isActivo'
>;
