package com.example.veoveo.viewmodel

import android.net.Uri
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.veoveo.data.RepositorioUsuarios
import com.example.veoveo.model.Usuario
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeout
import kotlinx.coroutines.TimeoutCancellationException

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
        Log.d("ViewModelPerfil", "=== INICIANDO cargarPerfil ===")
        _cargando.value = true
        viewModelScope.launch {
            try {
                Log.d("ViewModelPerfil", "Intentando cargar perfil con timeout de 10s")
                withTimeout(10000L) {
                    Log.d("ViewModelPerfil", "Llamando a repositorio.obtenerPerfilUsuario()")
                    val resultado = repositorio.obtenerPerfilUsuario()
                    if (resultado.isSuccess) {
                        val usuario = resultado.getOrNull()
                        Log.d("ViewModelPerfil", "Perfil cargado exitosamente: ${usuario?.username}")
                        _usuario.value = usuario
                    } else {
                        Log.w("ViewModelPerfil", "No se pudo cargar perfil, creando uno por defecto")
                        // Si no existe, crear perfil por defecto
                        val resultadoCrear = repositorio.crearPerfilPorDefecto()
                        if (resultadoCrear.isSuccess) {
                            Log.d("ViewModelPerfil", "Perfil por defecto creado, recargando...")
                            // Intentar cargar de nuevo
                            val resultadoNuevo = repositorio.obtenerPerfilUsuario()
                            if (resultadoNuevo.isSuccess) {
                                val usuario = resultadoNuevo.getOrNull()
                                Log.d("ViewModelPerfil", "Perfil recargado: ${usuario?.username}")
                                _usuario.value = usuario
                            } else {
                                Log.e("ViewModelPerfil", "Error al recargar perfil")
                                _error.value = "No se pudo cargar el perfil. Verifica tu conexión."
                            }
                        } else {
                            Log.e("ViewModelPerfil", "Error al crear perfil por defecto")
                            _error.value = "No se pudo crear el perfil. Verifica tu conexión."
                        }
                    }
                }
            } catch (e: TimeoutCancellationException) {
                Log.e("ViewModelPerfil", "TIMEOUT al cargar perfil")
                _error.value = "La conexión está tardando demasiado. Inténtalo de nuevo."
            } catch (e: Exception) {
                Log.e("ViewModelPerfil", "ERROR al cargar perfil", e)
                _error.value = "Error de conexión: ${e.message}"
            } finally {
                _cargando.value = false
                Log.d("ViewModelPerfil", "=== FIN cargarPerfil ===")
            }
        }
    }

    /**
     * Actualiza el username del usuario (versión simplificada)
     */
    fun actualizarUsername(nuevoUsername: String) {
        Log.d("ViewModelPerfil", "=== INICIANDO actualizarUsername: $nuevoUsername ===")

        if (nuevoUsername.isBlank()) {
            Log.w("ViewModelPerfil", "Username vacío")
            _error.value = "El nombre de usuario no puede estar vacío"
            return
        }

        if (nuevoUsername.length < 3) {
            Log.w("ViewModelPerfil", "Username muy corto")
            _error.value = "El nombre de usuario debe tener al menos 3 caracteres"
            return
        }

        _actualizandoUsername.value = true
        viewModelScope.launch {
            try {
                Log.d("ViewModelPerfil", "Intentando actualizar con timeout de 15s")
                // Timeout de 15 segundos (más tiempo)
                withTimeout(15000L) {
                    // Actualizar en Firebase directamente (sin actualizar localmente primero)
                    Log.d("ViewModelPerfil", "Llamando a repositorio.actualizarUsername()")
                    val resultado = repositorio.actualizarUsername(nuevoUsername)
                    if (resultado.isSuccess) {
                        Log.d("ViewModelPerfil", "Actualización exitosa en Firebase")
                        // Actualizar el estado local solo después del éxito
                        val usuarioActual = _usuario.value
                        if (usuarioActual != null) {
                            _usuario.value = usuarioActual.copy(username = nuevoUsername)
                        }
                        _mensaje.value = "Nombre actualizado"
                        Log.d("ViewModelPerfil", "Estado local actualizado")
                    } else {
                        // Extraer mensaje de error real
                        val errorMsg = resultado.exceptionOrNull()?.message ?: "Error al actualizar"
                        Log.e("ViewModelPerfil", "Error al actualizar: $errorMsg")
                        _error.value = errorMsg
                    }
                }
            } catch (e: TimeoutCancellationException) {
                Log.e("ViewModelPerfil", "TIMEOUT al actualizar username")
                _error.value = "Timeout: Revisa tu conexión a Internet"
            } catch (e: Exception) {
                Log.e("ViewModelPerfil", "ERROR al actualizar username", e)
                _error.value = "Error: ${e.message}"
            } finally {
                _actualizandoUsername.value = false
                Log.d("ViewModelPerfil", "=== FIN actualizarUsername ===")
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
