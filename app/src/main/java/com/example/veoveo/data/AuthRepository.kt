package com.example.veoveo.data

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.auth.GoogleAuthProvider
import kotlinx.coroutines.tasks.await

// maneja todo el login y registro con firebase
class AuthRepository {

    // firebase auth para autenticar usuarios
    private val auth: FirebaseAuth = FirebaseAuth.getInstance()

    // usuario que esta logueado ahora (null si no hay nadie)
    val currentUser: FirebaseUser?
        get() = auth.currentUser

    // login con email y contraseña
    suspend fun loginWithEmail(email: String, password: String): Result<FirebaseUser> {
        return try {
            val result = auth.signInWithEmailAndPassword(email, password).await()
            result.user?.let {
                Result.success(it)
            } ?: Result.failure(Exception("Error al iniciar sesión"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // crear cuenta nueva con email y contraseña
    suspend fun registerWithEmail(email: String, password: String): Result<FirebaseUser> {
        return try {
            val result = auth.createUserWithEmailAndPassword(email, password).await()
            result.user?.let {
                Result.success(it)
            } ?: Result.failure(Exception("Error al crear cuenta"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // login con cuenta de google
    suspend fun loginWithGoogle(idToken: String): Result<FirebaseUser> {
        return try {
            val credential = GoogleAuthProvider.getCredential(idToken, null)
            val result = auth.signInWithCredential(credential).await()
            result.user?.let {
                Result.success(it)
            } ?: Result.failure(Exception("Error al iniciar sesión con Google"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // cerrar sesion
    fun logout() {
        auth.signOut()
    }

    // envia email para recuperar contraseña
    suspend fun resetPassword(email: String): Result<Unit> {
        return try {
            auth.sendPasswordResetEmail(email).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // comprueba si hay alguien logueado
    fun isUserLoggedIn(): Boolean {
        return currentUser != null
    }

    // borra la cuenta del usuario (no se puede deshacer)
    suspend fun deleteAccount(): Result<Unit> {
        return try {
            currentUser?.delete()?.await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
