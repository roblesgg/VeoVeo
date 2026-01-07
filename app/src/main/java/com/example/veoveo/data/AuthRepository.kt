package com.example.veoveo.data

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.auth.GoogleAuthProvider
import kotlinx.coroutines.tasks.await

/**
 * ===== AUTHREPOSITORY - REPOSITORIO DE AUTENTICACIÓN =====
 *
 * Esta clase maneja toda la lógica de autenticación con Firebase.
 * Aquí tenemos las funciones para login, registro, logout, etc.
 *
 * Usa Firebase Authentication para gestionar usuarios.
 */
class AuthRepository {

    // instancia de Firebase Authentication
    private val auth: FirebaseAuth = FirebaseAuth.getInstance()

    /**
     * Usuario actual logueado (null si no hay nadie logueado)
     */
    val currentUser: FirebaseUser?
        get() = auth.currentUser

    /**
     * ===== LOGIN CON EMAIL Y CONTRASEÑA =====
     *
     * Intenta hacer login con email y contraseña.
     *
     * @param email: el email del usuario
     * @param password: la contraseña del usuario
     * @return Result<FirebaseUser>: Success con el usuario si todo va bien, Failure si hay error
     */
    suspend fun loginWithEmail(email: String, password: String): Result<FirebaseUser> {
        return try {
            // intentamos hacer login con Firebase
            val result = auth.signInWithEmailAndPassword(email, password).await()

            // si el usuario no es null, devolvemos Success
            result.user?.let {
                Result.success(it)
            } ?: Result.failure(Exception("Error al iniciar sesión"))

        } catch (e: Exception) {
            // si hay algún error, devolvemos Failure con el error
            Result.failure(e)
        }
    }

    /**
     * ===== REGISTRO CON EMAIL Y CONTRASEÑA =====
     *
     * Crea una nueva cuenta con email y contraseña.
     *
     * @param email: el email del nuevo usuario
     * @param password: la contraseña del nuevo usuario
     * @return Result<FirebaseUser>: Success con el usuario si todo va bien, Failure si hay error
     */
    suspend fun registerWithEmail(email: String, password: String): Result<FirebaseUser> {
        return try {
            // creamos la cuenta en Firebase
            val result = auth.createUserWithEmailAndPassword(email, password).await()

            // si el usuario no es null, devolvemos Success
            result.user?.let {
                Result.success(it)
            } ?: Result.failure(Exception("Error al crear cuenta"))

        } catch (e: Exception) {
            // si hay algún error, devolvemos Failure con el error
            Result.failure(e)
        }
    }

    /**
     * ===== LOGIN CON GOOGLE =====
     *
     * Hace login usando una cuenta de Google.
     *
     * @param idToken: el token que viene de Google Sign-In
     * @return Result<FirebaseUser>: Success con el usuario si todo va bien, Failure si hay error
     */
    suspend fun loginWithGoogle(idToken: String): Result<FirebaseUser> {
        return try {
            // creamos las credenciales de Google
            val credential = GoogleAuthProvider.getCredential(idToken, null)

            // hacemos login con esas credenciales
            val result = auth.signInWithCredential(credential).await()

            // si el usuario no es null, devolvemos Success
            result.user?.let {
                Result.success(it)
            } ?: Result.failure(Exception("Error al iniciar sesión con Google"))

        } catch (e: Exception) {
            // si hay algún error, devolvemos Failure con el error
            Result.failure(e)
        }
    }

    /**
     * ===== LOGOUT =====
     *
     * Cierra la sesión del usuario actual.
     */
    fun logout() {
        auth.signOut()
    }

    /**
     * ===== RECUPERAR CONTRASEÑA =====
     *
     * Envía un email para resetear la contraseña.
     *
     * @param email: el email de la cuenta
     * @return Result<Unit>: Success si se envió el email, Failure si hay error
     */
    suspend fun resetPassword(email: String): Result<Unit> {
        return try {
            auth.sendPasswordResetEmail(email).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * ===== VERIFICAR SI HAY USUARIO LOGUEADO =====
     *
     * @return true si hay un usuario logueado, false si no
     */
    fun isUserLoggedIn(): Boolean {
        return currentUser != null
    }
}
