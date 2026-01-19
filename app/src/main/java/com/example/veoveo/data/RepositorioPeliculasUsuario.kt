package com.example.veoveo.data

import com.example.veoveo.model.PeliculaUsuario
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withTimeout

/**
 * Repositorio simple para gestionar las películas del usuario en Firestore
 */
class RepositorioPeliculasUsuario {

    private val firestore = FirebaseFirestore.getInstance()
    private val auth = FirebaseAuth.getInstance()

    /**
     * Obtiene el ID del usuario actual
     */
    private fun obtenerIdUsuario(): String? = auth.currentUser?.uid

    /**
     * Obtiene películas por estado (por_ver o vista)
     */
    suspend fun obtenerPeliculasPorEstado(estado: String): Result<List<PeliculaUsuario>> {
        val idUsuario = obtenerIdUsuario() ?: return Result.failure(Exception("Usuario no autenticado"))

        return try {
            // Timeout de 10 segundos para evitar bloqueos indefinidos
            withTimeout(10000) {
                val snapshot = firestore.collection("usuarios")
                    .document(idUsuario)
                    .collection("peliculas")
                    .whereEqualTo("estado", estado)
                    .get()
                    .await()

                val peliculas = snapshot.documents.mapNotNull { it.toObject(PeliculaUsuario::class.java) }
                Result.success(peliculas)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Añade una película a la biblioteca del usuario
     */
    suspend fun agregarPelicula(pelicula: PeliculaUsuario): Result<Unit> {
        val idUsuario = obtenerIdUsuario() ?: return Result.failure(Exception("Usuario no autenticado"))

        return try {
            firestore.collection("usuarios")
                .document(idUsuario)
                .collection("peliculas")
                .document(pelicula.idPelicula.toString())
                .set(pelicula)
                .await()

            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Actualiza el estado de una película (por_ver -> vista)
     */
    suspend fun actualizarEstadoPelicula(idPelicula: Int, nuevoEstado: String): Result<Unit> {
        val idUsuario = obtenerIdUsuario() ?: return Result.failure(Exception("Usuario no autenticado"))

        return try {
            firestore.collection("usuarios")
                .document(idUsuario)
                .collection("peliculas")
                .document(idPelicula.toString())
                .update("estado", nuevoEstado)
                .await()

            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Actualiza la valoración de una película
     */
    suspend fun actualizarValoracion(idPelicula: Int, valoracion: Int): Result<Unit> {
        val idUsuario = obtenerIdUsuario() ?: return Result.failure(Exception("Usuario no autenticado"))

        return try {
            firestore.collection("usuarios")
                .document(idUsuario)
                .collection("peliculas")
                .document(idPelicula.toString())
                .update("valoracion", valoracion)
                .await()

            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Elimina una película de la biblioteca
     */
    suspend fun eliminarPelicula(idPelicula: Int): Result<Unit> {
        val idUsuario = obtenerIdUsuario() ?: return Result.failure(Exception("Usuario no autenticado"))

        return try {
            firestore.collection("usuarios")
                .document(idUsuario)
                .collection("peliculas")
                .document(idPelicula.toString())
                .delete()
                .await()

            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Verifica si una película ya está en la biblioteca
     */
    suspend fun estaPeliculaEnBiblioteca(idPelicula: Int): Result<Boolean> {
        val idUsuario = obtenerIdUsuario() ?: return Result.failure(Exception("Usuario no autenticado"))

        return try {
            val doc = firestore.collection("usuarios")
                .document(idUsuario)
                .collection("peliculas")
                .document(idPelicula.toString())
                .get()
                .await()

            Result.success(doc.exists())
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Obtiene películas de otro usuario por estado
     */
    suspend fun obtenerPeliculasPorEstadoDeUsuario(uid: String, estado: String): Result<List<PeliculaUsuario>> {
        return try {
            val snapshot = firestore.collection("usuarios")
                .document(uid)
                .collection("peliculas")
                .whereEqualTo("estado", estado)
                .get()
                .await()

            val peliculas = snapshot.documents.mapNotNull { it.toObject(PeliculaUsuario::class.java) }
            Result.success(peliculas)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
