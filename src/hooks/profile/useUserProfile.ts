import { useCallback, useEffect, useState } from 'react';
import { 
  obtenerPerfilUsuario, 
  crearPerfilPorDefecto, 
  actualizarUsername, 
  actualizarFotoPerfil 
} from '../../services/repositorioUsuarios';
import { contarPeliculasPorEstado, listarPeliculasPorEstado } from '../../services/repositorioPeliculasUsuario';
import type { UsuarioPerfil } from '../../types/usuario';

export function useUserProfile() {
  const [usuario, setUsuario] = useState<UsuarioPerfil | null>(null);
  const [cargando, setCargando] = useState(true);
  const [stats, setStats] = useState({ vistas: 0, porVer: 0, resenas: 0 });
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const cargarPerfil = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      let u = await obtenerPerfilUsuario();
      if (!u) {
        await crearPerfilPorDefecto();
        u = await obtenerPerfilUsuario();
      }
      if (!u) throw new Error('No se pudo cargar el perfil');
      
      setUsuario(u);

      const [nVistas, nPorVer, vistasList] = await Promise.all([
        contarPeliculasPorEstado('vista'),
        contarPeliculasPorEstado('por_ver'),
        listarPeliculasPorEstado('vista')
      ]);

      setStats({
        vistas: nVistas,
        porVer: nPorVer,
        resenas: vistasList.filter(p => p.valoracion && p.valoracion !== 0).length
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarPerfil();
  }, [cargarPerfil]);

  const handleUpdateUsername = async (name: string) => {
    try {
      await actualizarUsername(name);
      setUsuario(prev => prev ? { ...prev, username: name } : null);
      setMensaje('Nombre actualizado');
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al actualizar');
      return false;
    }
  };

  const handleUpdateAvatar = async (url: string) => {
    try {
      await actualizarFotoPerfil(url);
      setUsuario(prev => prev ? { ...prev, fotoPerfil: url } : null);
      setMensaje('Foto actualizada');
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al actualizar foto');
      return false;
    }
  };

  return {
    usuario,
    cargando,
    stats,
    error,
    mensaje,
    setError,
    setMensaje,
    recargar: cargarPerfil,
    handleUpdateUsername,
    handleUpdateAvatar
  };
}
