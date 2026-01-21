package com.example.veoveo.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.veoveo.data.AuthRepository
import com.google.firebase.auth.FirebaseUser
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

// maneja autenticacion de la app
class AuthViewModel : ViewModel() {

    private val repository = AuthRepository()

    // estado actual del login
    private val _authState = MutableStateFlow<AuthState>(AuthState.Initial)
    val authState: StateFlow<AuthState> = _authState.asStateFlow()

    // usuario logueado
    private val _currentUser = MutableStateFlow<FirebaseUser?>(null)
    val currentUser: StateFlow<FirebaseUser?> = _currentUser.asStateFlow()

    init {
        checkCurrentUser()
    }

    // verifica si ya hay usuario logueado al abrir la app
    private fun checkCurrentUser() {
        val user = repository.currentUser
        _currentUser.value = user
        if (user != null) {
            _authState.value = AuthState.Authenticated(user)
        }
    }

    // hace login con email y password
    fun loginWithEmail(email: String, password: String) {
        if (email.isBlank() || password.isBlank()) {
            _authState.value = AuthState.Error("Email y contraseña no pueden estar vacíos")
            return
        }

        _authState.value = AuthState.Loading

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

    // crea cuenta nueva con email y password
    fun registerWithEmail(email: String, password: String) {
        if (email.isBlank() || password.isBlank()) {
            _authState.value = AuthState.Error("Email y contraseña no pueden estar vacíos")
            return
        }

        if (password.length < 6) {
            _authState.value = AuthState.Error("La contraseña debe tener al menos 6 caracteres")
            return
        }

        _authState.value = AuthState.Loading

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

    // hace login con google
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

    // cierra sesion
    fun logout() {
        repository.logout()
        _currentUser.value = null
        _authState.value = AuthState.Initial
    }

    // envia email para resetear password
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

    // vuelve al estado inicial
    fun resetState() {
        _authState.value = AuthState.Initial
    }

    // elimina la cuenta del usuario actual
    fun deleteAccount() {
        _authState.value = AuthState.Loading

        viewModelScope.launch {
            val result = repository.deleteAccount()

            if (result.isSuccess) {
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

// estados posibles del proceso de autenticacion
sealed class AuthState {
    object Initial : AuthState()
    object Loading : AuthState()
    data class Authenticated(val user: FirebaseUser) : AuthState()
    data class Error(val message: String) : AuthState()
    object PasswordResetSent : AuthState()
}
