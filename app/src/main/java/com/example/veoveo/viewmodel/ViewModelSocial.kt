package com.example.veoveo.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.veoveo.data.RepositorioUsuarios
import com.example.veoveo.data.RepositorioPeliculasUsuario
import com.example.veoveo.model.Usuario
import com.example.veoveo.model.SolicitudAmistad
import com.example.veoveo.model.PeliculaUsuario
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * ViewModel para gestionar las funciones sociales
 */
class ViewModelSocial : ViewModel() {

    private val repositorioUsuarios = RepositorioUsuarios()
    private val repositorioPeliculas = RepositorioPeliculasUsuario()

    // Resultados de búsqueda
    private val _resultadosBusqueda = MutableStateFlow<List<Usuario>>(emptyList())
    val resultadosBusqueda: StateFlow<List<Usuario>> = _resultadosBusqueda.asStateFlow()

    // Lista de amigos
    private val _amigos = MutableStateFlow<List<Usuario>>(emptyList())
    val amigos: StateFlow<List<Usuario>> = _amigos.asStateFlow()

    // Solicitudes de amistad pendientes
    private val _solicitudesPendientes = MutableStateFlow<List<SolicitudAmistad>>(emptyList())
    val solicitudesPendientes: StateFlow<List<SolicitudAmistad>> = _solicitudesPendientes.asStateFlow()

    // Películas de un amigo específico
    private val _peliculasAmigo = MutableStateFlow<List<PeliculaUsuario>>(emptyList())
    val peliculasAmigo: StateFlow<List<PeliculaUsuario>> = _peliculasAmigo.asStateFlow()

    // Estado de carga
    private val _cargando = MutableStateFlow(false)
    val cargando: StateFlow<Boolean> = _cargando.asStateFlow()

    // Mensajes
    private val _mensaje = MutableStateFlow<String?>(null)
    val mensaje: StateFlow<String?> = _mensaje.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    /**
     * Busca usuarios por username
     */
    fun buscarUsuarios(query: String) {
        viewModelScope.launch {
            _cargando.value = true
            val resultado = repositorioUsuarios.buscarUsuariosPorUsername(query)
            if (resultado.isSuccess) {
                _resultadosBusqueda.value = resultado.getOrNull() ?: emptyList()
            } else {
                _error.value = resultado.exceptionOrNull()?.message
            }
            _cargando.value = false
        }
    }

    /**
     * Envía una solicitud de amistad
     */
    fun enviarSolicitudAmistad(paraUid: String) {
        viewModelScope.launch {
            val resultado = repositorioUsuarios.enviarSolicitudAmistad(paraUid)
            if (resultado.isSuccess) {
                _mensaje.value = "Solicitud enviada"
            } else {
                _error.value = resultado.exceptionOrNull()?.message
            }
        }
    }

    /**
     * Acepta una solicitud de amistad
     */
    fun aceptarSolicitud(solicitudId: String) {
        viewModelScope.launch {
            val resultado = repositorioUsuarios.aceptarSolicitudAmistad(solicitudId)
            if (resultado.isSuccess) {
                _mensaje.value = "Solicitud aceptada"
                cargarSolicitudesPendientes()
                cargarAmigos()
            } else {
                _error.value = resultado.exceptionOrNull()?.message
            }
        }
    }

    /**
     * Rechaza una solicitud de amistad
     */
    fun rechazarSolicitud(solicitudId: String) {
        viewModelScope.launch {
            val resultado = repositorioUsuarios.rechazarSolicitudAmistad(solicitudId)
            if (resultado.isSuccess) {
                _mensaje.value = "Solicitud rechazada"
                cargarSolicitudesPendientes()
            } else {
                _error.value = resultado.exceptionOrNull()?.message
            }
        }
    }

    /**
     * Carga la lista de amigos
     */
    fun cargarAmigos() {
        viewModelScope.launch {
            _cargando.value = true
            val resultado = repositorioUsuarios.obtenerAmigos()
            if (resultado.isSuccess) {
                _amigos.value = resultado.getOrNull() ?: emptyList()
            } else {
                _error.value = resultado.exceptionOrNull()?.message
            }
            _cargando.value = false
        }
    }

    /**
     * Carga las solicitudes de amistad pendientes
     */
    fun cargarSolicitudesPendientes() {
        viewModelScope.launch {
            val resultado = repositorioUsuarios.obtenerSolicitudesPendientes()
            if (resultado.isSuccess) {
                _solicitudesPendientes.value = resultado.getOrNull() ?: emptyList()
            }
        }
    }

    /**
     * Elimina un amigo
     */
    fun eliminarAmigo(amigoUid: String) {
        viewModelScope.launch {
            val resultado = repositorioUsuarios.eliminarAmigo(amigoUid)
            if (resultado.isSuccess) {
                _mensaje.value = "Amigo eliminado"
                cargarAmigos()
            } else {
                _error.value = resultado.exceptionOrNull()?.message
            }
        }
    }

    /**
     * Bloquea a un usuario
     */
    fun bloquearUsuario(usuarioUid: String) {
        viewModelScope.launch {
            val resultado = repositorioUsuarios.bloquearUsuario(usuarioUid)
            if (resultado.isSuccess) {
                _mensaje.value = "Usuario bloqueado"
                cargarAmigos()
            } else {
                _error.value = resultado.exceptionOrNull()?.message
            }
        }
    }

    /**
     * Carga las películas de un amigo específico
     */
    fun cargarPeliculasAmigo(amigoUid: String) {
        viewModelScope.launch {
            _cargando.value = true

            // Obtener películas por ver
            val porVerResult = repositorioPeliculas.obtenerPeliculasPorEstadoDeUsuario(amigoUid, "por_ver")
            val vistasResult = repositorioPeliculas.obtenerPeliculasPorEstadoDeUsuario(amigoUid, "vista")

            val peliculas = mutableListOf<PeliculaUsuario>()

            if (porVerResult.isSuccess) {
                peliculas.addAll(porVerResult.getOrNull() ?: emptyList())
            }

            if (vistasResult.isSuccess) {
                peliculas.addAll(vistasResult.getOrNull() ?: emptyList())
            }

            _peliculasAmigo.value = peliculas
            _cargando.value = false
        }
    }

    /**
     * Limpia mensajes
     */
    fun limpiarMensajes() {
        _mensaje.value = null
        _error.value = null
    }
}
