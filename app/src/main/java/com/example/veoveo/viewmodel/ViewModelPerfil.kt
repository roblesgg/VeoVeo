package com.example.veoveo.viewmodel

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.veoveo.data.RepositorioUsuarios
import com.example.veoveo.data.RepositorioPeliculasUsuario
import com.example.veoveo.model.Usuario
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeout
import kotlinx.coroutines.TimeoutCancellationException

// maneja el perfil del usuario
class ViewModelPerfil : ViewModel() {

    private val repositorio = RepositorioUsuarios()
    private val repositorioPeliculas = RepositorioPeliculasUsuario()

    // usuario actual
    private val _usuario = MutableStateFlow<Usuario?>(null)
    val usuario: StateFlow<Usuario?> = _usuario.asStateFlow()

    // contadores
    private val _peliculasVistas = MutableStateFlow(0)
    val peliculasVistas: StateFlow<Int> = _peliculasVistas.asStateFlow()

    private val _cantidadAmigos = MutableStateFlow(0)
    val cantidadAmigos: StateFlow<Int> = _cantidadAmigos.asStateFlow()

    private val _cantidadResenas = MutableStateFlow(0)
    val cantidadResenas: StateFlow<Int> = _cantidadResenas.asStateFlow()

    // estado de carga general
    private val _cargando = MutableStateFlow(false)
    val cargando: StateFlow<Boolean> = _cargando.asStateFlow()

    // estado de carga para actualizar username
    private val _actualizandoUsername = MutableStateFlow(false)
    val actualizandoUsername: StateFlow<Boolean> = _actualizandoUsername.asStateFlow()

    // mensajes de error
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    // mensaje de exito
    private val _mensaje = MutableStateFlow<String?>(null)
    val mensaje: StateFlow<String?> = _mensaje.asStateFlow()

    // carga el perfil del usuario o lo crea si no existe
    fun cargarPerfil() {
        _cargando.value = true
        viewModelScope.launch {
            try {
                withTimeout(10000L) {
                    val resultado = repositorio.obtenerPerfilUsuario()
                    if (resultado.isSuccess) {
                        val usuario = resultado.getOrNull()
                        _usuario.value = usuario
                    } else {
                        val resultadoCrear = repositorio.crearPerfilPorDefecto()
                        if (resultadoCrear.isSuccess) {
                            val resultadoNuevo = repositorio.obtenerPerfilUsuario()
                            if (resultadoNuevo.isSuccess) {
                                val usuario = resultadoNuevo.getOrNull()
                                _usuario.value = usuario
                            } else {
                                _error.value = "No se pudo cargar el perfil. Verifica tu conexión."
                            }
                        } else {
                            _error.value = "No se pudo crear el perfil. Verifica tu conexión."
                        }
                    }
                }
                cargarContadores()
            } catch (e: TimeoutCancellationException) {
                _error.value = "La conexión está tardando demasiado. Inténtalo de nuevo."
            } catch (e: Exception) {
                _error.value = "Error de conexión: ${e.message}"
            } finally {
                _cargando.value = false
            }
        }
    }

    // carga contadores de peliculas, amigos y resenas
    private fun cargarContadores() {
        viewModelScope.launch {
            try {
                val peliculasResult = repositorioPeliculas.obtenerPeliculasPorEstado("vista")
                if (peliculasResult.isSuccess) {
                    _peliculasVistas.value = peliculasResult.getOrNull()?.size ?: 0
                }

                val amigosResult = repositorio.obtenerAmigos()
                if (amigosResult.isSuccess) {
                    _cantidadAmigos.value = amigosResult.getOrNull()?.size ?: 0
                }

                _cantidadResenas.value = 0
            } catch (e: Exception) {
                // error silencioso en contadores
            }
        }
    }

    // actualiza el username del usuario
    fun actualizarUsername(nuevoUsername: String) {
        if (nuevoUsername.isBlank()) {
            _error.value = "El nombre de usuario no puede estar vacío"
            return
        }

        if (nuevoUsername.length < 3) {
            _error.value = "El nombre de usuario debe tener al menos 3 caracteres"
            return
        }

        _actualizandoUsername.value = true
        viewModelScope.launch {
            try {
                withTimeout(15000L) {
                    val resultado = repositorio.actualizarUsername(nuevoUsername)
                    if (resultado.isSuccess) {
                        val usuarioActual = _usuario.value
                        if (usuarioActual != null) {
                            _usuario.value = usuarioActual.copy(username = nuevoUsername)
                        }
                        _mensaje.value = "Nombre actualizado"
                    } else {
                        val errorMsg = resultado.exceptionOrNull()?.message ?: "Error al actualizar"
                        _error.value = errorMsg
                    }
                }
            } catch (e: TimeoutCancellationException) {
                _error.value = "Timeout: Revisa tu conexión a Internet"
            } catch (e: Exception) {
                _error.value = "Error: ${e.message}"
            } finally {
                _actualizandoUsername.value = false
            }
        }
    }

    // actualiza la foto de perfil
    fun actualizarFotoPerfil(url: String) {
        _cargando.value = true
        viewModelScope.launch {
            val resultado = repositorio.actualizarFotoPerfil(url)
            if (resultado.isSuccess) {
                _mensaje.value = "Foto de perfil actualizada"
                cargarPerfil()
            } else {
                _error.value = resultado.exceptionOrNull()?.message
            }
            _cargando.value = false
        }
    }

    // limpia mensajes
    fun limpiarMensajes() {
        _error.value = null
        _mensaje.value = null
    }
}
