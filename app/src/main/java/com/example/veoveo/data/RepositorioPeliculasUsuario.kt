package com.example.veoveo.data

import com.example.veoveo.model.PeliculaUsuario
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withTimeout

// maneja las peliculas del usuario en firebase
class RepositorioPeliculasUsuario {

    private val firestore = FirebaseFirestore.getInstance()
    private val auth = FirebaseAuth.getInstance()

    // devuelve el id del usuario actual
    private fun obtenerIdUsuario(): String? = auth.currentUser?.uid

    // trae las peliculas del usuario segun el estado (por_ver o vista)
    suspend fun obtenerPeliculasPorEstado(estado: String): Result<List<PeliculaUsuario>> {
        val idUsuario = obtenerIdUsuario() ?: return Result.failure(Exception("Usuario no autenticado"))

        return try {
            withTimeout(10000) { // timeout de 10 segundos
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

    // añade una pelicula a la biblioteca del usuario
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

    // cambia el estado de una pelicula (de por_ver a vista por ejemplo)
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

    // cambia la valoracion en estrellas de una pelicula
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

    // elimina una pelicula de la biblioteca
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

    // comprueba si una pelicula ya esta en la biblioteca
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

    // trae las peliculas de otro usuario segun el estado
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
