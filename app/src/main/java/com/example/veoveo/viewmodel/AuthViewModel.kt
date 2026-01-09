package com.example.veoveo.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.veoveo.data.AuthRepository
import com.google.firebase.auth.FirebaseUser
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * ===== AUTHVIEWMODEL - VIEWMODEL DE AUTENTICACIÓN =====
 *
 * Esta clase maneja el estado de la autenticación en la app.
 * Es el intermediario entre la UI (LoginScreen) y el Repository (AuthRepository).
 *
 * Usa StateFlow para que la UI se actualice automáticamente cuando cambia el estado.
 */
class AuthViewModel : ViewModel() {

    // instancia del repositorio
    private val repository = AuthRepository()

    // ===== ESTADO DE LA AUTENTICACIÓN =====
    // este StateFlow guarda el estado actual del login
    private val _authState = MutableStateFlow<AuthState>(AuthState.Initial)
    val authState: StateFlow<AuthState> = _authState.asStateFlow()

    // ===== USUARIO ACTUAL =====
    // guarda el usuario que está logueado
    private val _currentUser = MutableStateFlow<FirebaseUser?>(null)
    val currentUser: StateFlow<FirebaseUser?> = _currentUser.asStateFlow()

    /**
     * Inicialización - verifica si hay un usuario ya logueado
     */
    init {
        checkCurrentUser()
    }

    /**
     * ===== VERIFICAR SI HAY USUARIO LOGUEADO =====
     *
     * Al abrir la app, verifica si el usuario ya está logueado
     * (por ejemplo, si cerró la app pero no hizo logout)
     */
    private fun checkCurrentUser() {
        val user = repository.currentUser
        _currentUser.value = user
        if (user != null) {
            _authState.value = AuthState.Authenticated(user)
        }
    }

    /**
     * ===== LOGIN CON EMAIL =====
     *
     * Intenta hacer login con email y contraseña.
     *
     * @param email: el email del usuario
     * @param password: la contraseña
     */
    fun loginWithEmail(email: String, password: String) {
        // validación básica
        if (email.isBlank() || password.isBlank()) {
            _authState.value = AuthState.Error("Email y contraseña no pueden estar vacíos")
            return
        }

        // mostramos que estamos cargando
        _authState.value = AuthState.Loading

        // lanzamos la operación en un coroutine (operación asíncrona)
        viewModelScope.launch {
            val result = repository.loginWithEmail(email, password)

            _authState.value = if (result.isSuccess) {
                val user = result.getOrNull()!!
                _currentUser.value = user
                AuthState.Authenticated(user)
            } else {
                AuthState.Error(result.exceptionOrNull()?.message ?: "Error al iniciar sesión")
            }
        }
    }

    /**
     * ===== REGISTRO CON EMAIL =====
     *
     * Crea una nueva cuenta con email y contraseña.
     *
     * @param email: el email del nuevo usuario
     * @param password: la contraseña
     */
    fun registerWithEmail(email: String, password: String) {
        // validación básica
        if (email.isBlank() || password.isBlank()) {
            _authState.value = AuthState.Error("Email y contraseña no pueden estar vacíos")
            return
        }

        if (password.length < 6) {
            _authState.value = AuthState.Error("La contraseña debe tener al menos 6 caracteres")
            return
        }

        // mostramos que estamos cargando
        _authState.value = AuthState.Loading

        // lanzamos la operación en un coroutine
        viewModelScope.launch {
            val result = repository.registerWithEmail(email, password)

            _authState.value = if (result.isSuccess) {
                val user = result.getOrNull()!!
                _currentUser.value = user
                AuthState.Authenticated(user)
            } else {
                AuthState.Error(result.exceptionOrNull()?.message ?: "Error al crear cuenta")
            }
        }
    }

    /**
     * ===== LOGIN CON GOOGLE =====
     *
     * Hace login con Google.
     *
     * @param idToken: el token que viene de Google Sign-In
     */
    fun loginWithGoogle(idToken: String) {
        _authState.value = AuthState.Loading

        viewModelScope.launch {
            val result = repository.loginWithGoogle(idToken)

            _authState.value = if (result.isSuccess) {
                val user = result.getOrNull()!!
                _currentUser.value = user
                AuthState.Authenticated(user)
            } else {
                AuthState.Error(result.exceptionOrNull()?.message ?: "Error al iniciar sesión con Google")
            }
        }
    }

    /**
     * ===== LOGOUT =====
     *
     * Cierra la sesión del usuario.
     */
    fun logout() {
        repository.logout()
        _currentUser.value = null
        _authState.value = AuthState.Initial
    }

    /**
     * ===== RECUPERAR CONTRASEÑA =====
     *
     * Envía un email para resetear la contraseña.
     *
     * @param email: el email de la cuenta
     */
    fun resetPassword(email: String) {
        if (email.isBlank()) {
            _authState.value = AuthState.Error("Ingresa tu email")
            return
        }

        _authState.value = AuthState.Loading

        viewModelScope.launch {
            val result = repository.resetPassword(email)

            _authState.value = if (result.isSuccess) {
                AuthState.PasswordResetSent
            } else {
                AuthState.Error(result.exceptionOrNull()?.message ?: "Error al enviar email")
            }
        }
    }

    /**
     * ===== RESETEAR ESTADO =====
     *
     * Vuelve el estado a Initial (útil para limpiar errores)
     */
    fun resetState() {
        _authState.value = AuthState.Initial
    }

    /**
     * ===== BORRAR CUENTA =====
     *
     * Elimina permanentemente la cuenta del usuario actual.
     * ADVERTENCIA: Esta acción es irreversible.
     */
    fun deleteAccount() {
        _authState.value = AuthState.Loading

        viewModelScope.launch {
            val result = repository.deleteAccount()

            if (result.isSuccess) {
                // limpiamos el usuario y el estado
                _currentUser.value = null
                _authState.value = AuthState.Initial
            } else {
                _authState.value = AuthState.Error(
                    result.exceptionOrNull()?.message ?: "Error al eliminar cuenta"
                )
            }
        }
    }
}

/**
 * ===== ESTADOS DE AUTENTICACIÓN =====
 *
 * Estos son todos los estados posibles del proceso de login.
 * La UI usa estos estados para saber qué mostrar.
 */
sealed class AuthState {
    // Estado inicial (cuando abre la app o después de resetear)
    object Initial : AuthState()

    // Cargando (cuando está haciendo login/registro)
    object Loading : AuthState()

    // Usuario autenticado correctamente
    data class Authenticated(val user: FirebaseUser) : AuthState()

    // Hubo un error
    data class Error(val message: String) : AuthState()

    // Email de recuperación enviado
    object PasswordResetSent : AuthState()
}
