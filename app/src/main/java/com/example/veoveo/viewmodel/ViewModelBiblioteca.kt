package com.example.veoveo.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.veoveo.data.RepositorioPeliculasUsuario
import com.example.veoveo.model.PeliculaUsuario
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

// maneja la biblioteca del usuario
class ViewModelBiblioteca : ViewModel() {

    private val repositorio = RepositorioPeliculasUsuario()

    // peliculas por ver
    private val _peliculasPorVer = MutableStateFlow<List<PeliculaUsuario>>(emptyList())
    val peliculasPorVer: StateFlow<List<PeliculaUsuario>> = _peliculasPorVer.asStateFlow()

    // peliculas vistas
    private val _peliculasVistas = MutableStateFlow<List<PeliculaUsuario>>(emptyList())
    val peliculasVistas: StateFlow<List<PeliculaUsuario>> = _peliculasVistas.asStateFlow()

    // estado de carga
    private val _cargando = MutableStateFlow(false)
    val cargando: StateFlow<Boolean> = _cargando.asStateFlow()

    // mensajes de error
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    // carga las peliculas del usuario
    fun cargarPeliculas() {
        _cargando.value = true

        viewModelScope.launch {
            try {
                val resultadoPorVer = repositorio.obtenerPeliculasPorEstado("por_ver")
                if (resultadoPorVer.isSuccess) {
                    _peliculasPorVer.value = resultadoPorVer.getOrNull() ?: emptyList()
                } else {
                    _error.value = "Error al cargar películas por ver"
                }

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

    // agrega pelicula a por ver
    fun agregarAPorVer(idPelicula: Int, titulo: String, rutaPoster: String?) {
        viewModelScope.launch {
            val pelicula = PeliculaUsuario(
                idPelicula = idPelicula,
                titulo = titulo,
                rutaPoster = rutaPoster,
                estado = "por_ver"
            )

            _peliculasPorVer.value = _peliculasPorVer.value + pelicula

            val resultado = repositorio.agregarPelicula(pelicula)
            if (resultado.isSuccess) {
                cargarPeliculas()
            } else {
                _error.value = "Error al añadir película"
                _peliculasPorVer.value = _peliculasPorVer.value.filter { it.idPelicula != idPelicula }
            }
        }
    }

    // agrega pelicula a vistas
    fun agregarAVistas(idPelicula: Int, titulo: String, rutaPoster: String?) {
        viewModelScope.launch {
            val pelicula = PeliculaUsuario(
                idPelicula = idPelicula,
                titulo = titulo,
                rutaPoster = rutaPoster,
                estado = "vista"
            )

            _peliculasVistas.value = _peliculasVistas.value + pelicula

            val resultado = repositorio.agregarPelicula(pelicula)
            if (resultado.isSuccess) {
                cargarPeliculas()
            } else {
                _error.value = "Error al añadir película"
                _peliculasVistas.value = _peliculasVistas.value.filter { it.idPelicula != idPelicula }
            }
        }
    }

    // mueve pelicula de por ver a vista
    fun marcarComoVista(idPelicula: Int) {
        viewModelScope.launch {
            val pelicula = _peliculasPorVer.value.find { it.idPelicula == idPelicula }

            if (pelicula != null) {
                _peliculasPorVer.value = _peliculasPorVer.value.filter { it.idPelicula != idPelicula }
                _peliculasVistas.value = _peliculasVistas.value + pelicula.copy(estado = "vista")
            }

            val resultado = repositorio.actualizarEstadoPelicula(idPelicula, "vista")
            if (resultado.isSuccess) {
                cargarPeliculas()
            } else {
                _error.value = "Error al actualizar película"
                if (pelicula != null) {
                    _peliculasVistas.value = _peliculasVistas.value.filter { it.idPelicula != idPelicula }
                    _peliculasPorVer.value = _peliculasPorVer.value + pelicula
                }
            }
        }
    }

    // actualiza valoracion de pelicula
    fun actualizarValoracion(idPelicula: Int, valoracion: Int) {
        viewModelScope.launch {
            val resultado = repositorio.actualizarValoracion(idPelicula, valoracion)
            if (resultado.isSuccess) {
                cargarPeliculas()
            } else {
                _error.value = "Error al guardar valoración"
            }
        }
    }

    // elimina pelicula de la biblioteca
    fun eliminarPelicula(idPelicula: Int) {
        viewModelScope.launch {
            val peliculaPorVer = _peliculasPorVer.value.find { it.idPelicula == idPelicula }
            val peliculaVista = _peliculasVistas.value.find { it.idPelicula == idPelicula }

            _peliculasPorVer.value = _peliculasPorVer.value.filter { it.idPelicula != idPelicula }
            _peliculasVistas.value = _peliculasVistas.value.filter { it.idPelicula != idPelicula }

            val resultado = repositorio.eliminarPelicula(idPelicula)
            if (resultado.isSuccess) {
                cargarPeliculas()
            } else {
                _error.value = "Error al eliminar película"
                if (peliculaPorVer != null) {
                    _peliculasPorVer.value = _peliculasPorVer.value + peliculaPorVer
                }
                if (peliculaVista != null) {
                    _peliculasVistas.value = _peliculasVistas.value + peliculaVista
                }
            }
        }
    }

    // limpia el error
    fun limpiarError() {
        _error.value = null
    }
}
