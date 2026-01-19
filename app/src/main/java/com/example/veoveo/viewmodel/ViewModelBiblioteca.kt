package com.example.veoveo.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.veoveo.data.RepositorioPeliculasUsuario
import com.example.veoveo.model.PeliculaUsuario
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * ViewModel simple para gestionar la biblioteca del usuario
 */
class ViewModelBiblioteca : ViewModel() {

    private val repositorio = RepositorioPeliculasUsuario()

    // Películas por ver
    private val _peliculasPorVer = MutableStateFlow<List<PeliculaUsuario>>(emptyList())
    val peliculasPorVer: StateFlow<List<PeliculaUsuario>> = _peliculasPorVer.asStateFlow()

    // Películas vistas
    private val _peliculasVistas = MutableStateFlow<List<PeliculaUsuario>>(emptyList())
    val peliculasVistas: StateFlow<List<PeliculaUsuario>> = _peliculasVistas.asStateFlow()

    // Estado de carga
    private val _cargando = MutableStateFlow(false)
    val cargando: StateFlow<Boolean> = _cargando.asStateFlow()

    // Mensajes de error
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    /**
     * Carga las películas del usuario
     */
    fun cargarPeliculas() {
        _cargando.value = true

        viewModelScope.launch {
            try {
                // Cargar películas por ver
                val resultadoPorVer = repositorio.obtenerPeliculasPorEstado("por_ver")
                if (resultadoPorVer.isSuccess) {
                    _peliculasPorVer.value = resultadoPorVer.getOrNull() ?: emptyList()
                } else {
                    _error.value = "Error al cargar películas por ver"
                }

                // Cargar películas vistas
                val resultadoVistas = repositorio.obtenerPeliculasPorEstado("vista")
                if (resultadoVistas.isSuccess) {
                    _peliculasVistas.value = resultadoVistas.getOrNull() ?: emptyList()
                } else {
                    _error.value = "Error al cargar películas vistas"
                }
            } catch (e: Exception) {
                _error.value = "Error de conexión: ${e.message}"
            } finally {
                _cargando.value = false
            }
        }
    }

    /**
     * Añade una película a "Por Ver"
     */
    fun agregarAPorVer(idPelicula: Int, titulo: String, rutaPoster: String?) {
        viewModelScope.launch {
            val pelicula = PeliculaUsuario(
                idPelicula = idPelicula,
                titulo = titulo,
                rutaPoster = rutaPoster,
                estado = "por_ver"
            )

            // Actualizar UI inmediatamente
            _peliculasPorVer.value = _peliculasPorVer.value + pelicula

            val resultado = repositorio.agregarPelicula(pelicula)
            if (resultado.isSuccess) {
                // Ya actualizado localmente, solo recargar para sincronizar
                cargarPeliculas()
            } else {
                _error.value = "Error al añadir película"
                // Revertir cambio local si falla
                _peliculasPorVer.value = _peliculasPorVer.value.filter { it.idPelicula != idPelicula }
            }
        }
    }

    /**
     * Añade una película directamente a "Vista"
     */
    fun agregarAVistas(idPelicula: Int, titulo: String, rutaPoster: String?) {
        viewModelScope.launch {
            val pelicula = PeliculaUsuario(
                idPelicula = idPelicula,
                titulo = titulo,
                rutaPoster = rutaPoster,
                estado = "vista"
            )

            // Actualizar UI inmediatamente
            _peliculasVistas.value = _peliculasVistas.value + pelicula

            val resultado = repositorio.agregarPelicula(pelicula)
            if (resultado.isSuccess) {
                // Ya actualizado localmente, solo recargar para sincronizar
                cargarPeliculas()
            } else {
                _error.value = "Error al añadir película"
                // Revertir cambio local si falla
                _peliculasVistas.value = _peliculasVistas.value.filter { it.idPelicula != idPelicula }
            }
        }
    }

    /**
     * Mueve una película de "Por Ver" a "Vista"
     */
    fun marcarComoVista(idPelicula: Int) {
        viewModelScope.launch {
            // Encontrar la película en "Por Ver"
            val pelicula = _peliculasPorVer.value.find { it.idPelicula == idPelicula }

            if (pelicula != null) {
                // Actualizar UI inmediatamente
                _peliculasPorVer.value = _peliculasPorVer.value.filter { it.idPelicula != idPelicula }
                _peliculasVistas.value = _peliculasVistas.value + pelicula.copy(estado = "vista")
            }

            val resultado = repositorio.actualizarEstadoPelicula(idPelicula, "vista")
            if (resultado.isSuccess) {
                // Ya actualizado localmente, solo recargar para sincronizar
                cargarPeliculas()
            } else {
                _error.value = "Error al actualizar película"
                // Revertir cambio local si falla
                if (pelicula != null) {
                    _peliculasVistas.value = _peliculasVistas.value.filter { it.idPelicula != idPelicula }
                    _peliculasPorVer.value = _peliculasPorVer.value + pelicula
                }
            }
        }
    }

    /**
     * Actualiza la valoración de una película
     */
    fun actualizarValoracion(idPelicula: Int, valoracion: Int) {
        viewModelScope.launch {
            val resultado = repositorio.actualizarValoracion(idPelicula, valoracion)
            if (resultado.isSuccess) {
                cargarPeliculas() // Recargar para actualizar UI
            } else {
                _error.value = "Error al guardar valoración"
            }
        }
    }

    /**
     * Elimina una película de la biblioteca
     */
    fun eliminarPelicula(idPelicula: Int) {
        viewModelScope.launch {
            // Guardar copia para posible reversión
            val peliculaPorVer = _peliculasPorVer.value.find { it.idPelicula == idPelicula }
            val peliculaVista = _peliculasVistas.value.find { it.idPelicula == idPelicula }

            // Actualizar UI inmediatamente
            _peliculasPorVer.value = _peliculasPorVer.value.filter { it.idPelicula != idPelicula }
            _peliculasVistas.value = _peliculasVistas.value.filter { it.idPelicula != idPelicula }

            val resultado = repositorio.eliminarPelicula(idPelicula)
            if (resultado.isSuccess) {
                // Ya actualizado localmente, solo recargar para sincronizar
                cargarPeliculas()
            } else {
                _error.value = "Error al eliminar película"
                // Revertir cambio local si falla
                if (peliculaPorVer != null) {
                    _peliculasPorVer.value = _peliculasPorVer.value + peliculaPorVer
                }
                if (peliculaVista != null) {
                    _peliculasVistas.value = _peliculasVistas.value + peliculaVista
                }
            }
        }
    }

    /**
     * Limpia el mensaje de error
     */
    fun limpiarError() {
        _error.value = null
    }
}
