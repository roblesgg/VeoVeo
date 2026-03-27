import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  actualizarEstadoPelicula, 
  actualizarValoracion, 
  agregarPelicula, 
  eliminarPelicula, 
  obtenerPeliculaUsuario 
} from '../../services/repositorioPeliculasUsuario';
import type { PeliculaUsuario } from '../../types/peliculaUsuario';
import type { MovieDetails } from '../../types/tmdb';

export function useUserMovieStatus(movieId: number, detalles: MovieDetails | null, providers?: any) {
  const { user } = useAuth();
  const [peliculaBib, setPeliculaBib] = useState<PeliculaUsuario | null>(null);
  const [bibCargando, setBibCargando] = useState(true);
  const [accionBib, setAccionBib] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recargarBiblioteca = useCallback(async () => {
    if (!user) {
      setPeliculaBib(null);
      setBibCargando(false);
      return;
    }
    setBibCargando(true);
    try {
      const p = await obtenerPeliculaUsuario(movieId);
      setPeliculaBib(p);
    } catch {
      setPeliculaBib(null);
    } finally {
      setBibCargando(false);
    }
  }, [movieId, user]);

  useEffect(() => {
    void recargarBiblioteca();
  }, [recargarBiblioteca]);

  const onPorVer = async () => {
    if (!user || !detalles) return;
    setAccionBib(true);
    try {
      if (peliculaBib?.estado === 'por_ver') {
        await eliminarPelicula(movieId);
      } else {
        if (peliculaBib) await eliminarPelicula(movieId);
        await agregarPelicula({
          idPelicula: movieId,
          titulo: detalles.title,
          rutaPoster: detalles.poster_path,
          estado: 'por_ver',
          valoracion: 0,
          fechaAnadido: Date.now(),
          fechaLanzamiento: detalles.release_date || undefined,
          providers: {
            flatrate: providers?.flatrate?.map((p: any) => p.provider_id) || [],
            rent: [...(providers?.rent || []), ...(providers?.buy || [])].map((p: any) => p.provider_id)
          },
        });
      }
      await recargarBiblioteca();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setAccionBib(false);
    }
  };

  const onToggleVista = async (valoracionFinal = 0) => {
    if (!user || !detalles) return;
    setAccionBib(true);
    try {
      if (peliculaBib?.estado === 'vista' && valoracionFinal === 0) {
        await eliminarPelicula(movieId);
      } else {
        if (peliculaBib?.estado === 'por_ver') {
          await actualizarEstadoPelicula(movieId, 'vista');
          if (valoracionFinal !== 0) await actualizarValoracion(movieId, valoracionFinal);
        } else {
          if (peliculaBib) await eliminarPelicula(movieId);
          await agregarPelicula({
            idPelicula: movieId,
            titulo: detalles.title,
            rutaPoster: detalles.poster_path,
            estado: 'vista',
            valoracion: valoracionFinal,
            fechaAnadido: Date.now(),
            fechaVisto: Date.now(),
            fechaLanzamiento: detalles.release_date || undefined,
            providers: {
              flatrate: providers?.flatrate?.map((p: any) => p.provider_id) || [],
              rent: [...(providers?.rent || []), ...(providers?.buy || [])].map((p: any) => p.provider_id)
            },
          });
        }
      }
      await recargarBiblioteca();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setAccionBib(false);
    }
  };

  const onActualizarValoracion = async (valor: number) => {
    if (!user || !peliculaBib) return;
    setAccionBib(true);
    try {
      await actualizarValoracion(movieId, valor);
      await recargarBiblioteca();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al valorar');
    } finally {
      setAccionBib(false);
    }
  };

  return {
    peliculaBib,
    bibCargando,
    accionBib,
    userError: error,
    onPorVer,
    onToggleVista,
    onActualizarValoracion,
    recargarBiblioteca
  };
}
