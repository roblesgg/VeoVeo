package com.example.veoveo.viewmodel

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.veoveo.data.RepositorioUsuarios
import com.example.veoveo.model.Usuario
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * ViewModel para gestionar el perfil del usuario
 */
class ViewModelPerfil : ViewModel() {

    private val repositorio = RepositorioUsuarios()

    // Usuario actual
    private val _usuario = MutableStateFlow<Usuario?>(null)
    val usuario: StateFlow<Usuario?> = _usuario.asStateFlow()

    // Estado de carga general
    private val _cargando = MutableStateFlow(false)
    val cargando: StateFlow<Boolean> = _cargando.asStateFlow()

    // Estado de carga específico para actualizar username
    private val _actualizandoUsername = MutableStateFlow(false)
    val actualizandoUsername: StateFlow<Boolean> = _actualizandoUsername.asStateFlow()

    // Mensajes de error
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    // Mensaje de éxito
    private val _mensaje = MutableStateFlow<String?>(null)
    val mensaje: StateFlow<String?> = _mensaje.asStateFlow()

    /**
     * Carga el perfil del usuario actual (o lo crea si no existe)
     */
    fun cargarPerfil() {
        _cargando.value = true
        viewModelScope.launch {
            try {
                val resultado = repositorio.obtenerPerfilUsuario()
                if (resultado.isSuccess) {
                    _usuario.value = resultado.getOrNull()
                } else {
                    // Si no existe, crear perfil por defecto
                    val resultadoCrear = repositorio.crearPerfilPorDefecto()
                    if (resultadoCrear.isSuccess) {
                        // Intentar cargar de nuevo
                        val resultadoNuevo = repositorio.obtenerPerfilUsuario()
                        if (resultadoNuevo.isSuccess) {
                            _usuario.value = resultadoNuevo.getOrNull()
                        } else {
                            _error.value = "No se pudo cargar el perfil. Verifica tu conexión."
                        }
                    } else {
                        _error.value = "No se pudo crear el perfil. Verifica tu conexión."
                    }
                }
            } catch (e: Exception) {
                _error.value = "Error de conexión: ${e.message}"
            } finally {
                _cargando.value = false
            }
        }
    }

    /**
     * Actualiza el username del usuario (versión simplificada)
     */
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
                // Actualizar localmente primero
                val usuarioActual = _usuario.value
                if (usuarioActual != null) {
                    _usuario.value = usuarioActual.copy(username = nuevoUsername)
                }

                // Actualizar en Firebase
                val resultado = repositorio.actualizarUsername(nuevoUsername)
                if (resultado.isSuccess) {
                    _mensaje.value = "Nombre actualizado"
                } else {
                    _error.value = "Error al actualizar"
                    // Revertir si falla
                    if (usuarioActual != null) {
                        _usuario.value = usuarioActual
                    }
                }
            } catch (e: Exception) {
                _error.value = "Error: ${e.message}"
            } finally {
                _actualizandoUsername.value = false
            }
        }
    }

    /**
     * Actualiza la foto de perfil (por ahora solo con URL)
     */
    fun actualizarFotoPerfil(url: String) {
        _cargando.value = true
        viewModelScope.launch {
            val resultado = repositorio.actualizarFotoPerfil(url)
            if (resultado.isSuccess) {
                _mensaje.value = "Foto de perfil actualizada"
                cargarPerfil() // Recargar perfil
            } else {
                _error.value = resultado.exceptionOrNull()?.message
            }
            _cargando.value = false
        }
    }

    /**
     * Limpia los mensajes
     */
    fun limpiarMensajes() {
        _error.value = null
        _mensaje.value = null
    }
}
