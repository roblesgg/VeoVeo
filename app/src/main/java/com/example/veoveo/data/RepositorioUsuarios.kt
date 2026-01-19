package com.example.veoveo.data

import android.net.Uri
import com.example.veoveo.model.Usuario
import com.example.veoveo.model.SolicitudAmistad
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.FieldValue
import com.google.firebase.storage.FirebaseStorage
import kotlinx.coroutines.tasks.await
import java.util.UUID

/**
 * Repositorio para gestionar usuarios y relaciones sociales
 */
class RepositorioUsuarios {

    private val firestore = FirebaseFirestore.getInstance()
    private val auth = FirebaseAuth.getInstance()
    private val storage = FirebaseStorage.getInstance()

    /**
     * Obtiene el ID del usuario actual
     */
    private fun obtenerIdUsuario(): String? = auth.currentUser?.uid

    /**
     * Crea o actualiza el perfil de usuario
     */
    suspend fun crearOActualizarUsuario(usuario: Usuario): Result<Unit> {
        return try {
            firestore.collection("usuarios")
                .document(usuario.uid)
                .set(usuario)
                .await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Obtiene el perfil del usuario actual
     */
    suspend fun obtenerPerfilUsuario(): Result<Usuario> {
        val uid = obtenerIdUsuario() ?: return Result.failure(Exception("Usuario no autenticado"))

        return try {
            val doc = firestore.collection("usuarios")
                .document(uid)
                .get()
                .await()

            val usuario = doc.toObject(Usuario::class.java)
            if (usuario != null) {
                Result.success(usuario)
            } else {
                Result.failure(Exception("Usuario no encontrado"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Obtiene el perfil de un usuario por UID
     */
    suspend fun obtenerUsuarioPorUid(uid: String): Result<Usuario> {
        return try {
            val doc = firestore.collection("usuarios")
                .document(uid)
                .get()
                .await()

            val usuario = doc.toObject(Usuario::class.java)
            if (usuario != null) {
                Result.success(usuario)
            } else {
                Result.failure(Exception("Usuario no encontrado"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Actualiza el username (verifica que sea único)
     */
    suspend fun actualizarUsername(nuevoUsername: String): Result<Unit> {
        val uid = obtenerIdUsuario() ?: return Result.failure(Exception("Usuario no autenticado"))

        return try {
            // Verificar que el username no esté en uso
            val usuariosConMismoUsername = firestore.collection("usuarios")
                .whereEqualTo("username", nuevoUsername)
                .get()
                .await()

            // Si existe otro usuario con el mismo username, error
            if (!usuariosConMismoUsername.isEmpty && usuariosConMismoUsername.documents[0].id != uid) {
                return Result.failure(Exception("Este nombre de usuario ya está en uso"))
            }

            // Actualizar el username
            firestore.collection("usuarios")
                .document(uid)
                .update("username", nuevoUsername)
                .await()

            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Sube una foto de perfil a Firebase Storage y actualiza el usuario
     */
    suspend fun subirFotoPerfil(uri: Uri): Result<String> {
        val uid = obtenerIdUsuario() ?: return Result.failure(Exception("Usuario no autenticado"))

        return try {
            val nombreArchivo = "perfil_${uid}_${UUID.randomUUID()}.jpg"
            val ref = storage.reference.child("fotos_perfil/$nombreArchivo")

            ref.putFile(uri).await()
            val url = ref.downloadUrl.await().toString()

            // Actualizar en Firestore
            firestore.collection("usuarios")
                .document(uid)
                .update("fotoPerfil", url)
                .await()

            Result.success(url)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Busca usuarios por username (búsqueda parcial)
     */
    suspend fun buscarUsuariosPorUsername(query: String): Result<List<Usuario>> {
        if (query.isBlank()) return Result.success(emptyList())

        return try {
            // Firestore no tiene búsqueda parcial nativa, así que obtenemos todos y filtramos
            val snapshot = firestore.collection("usuarios")
                .get()
                .await()

            val usuarios = snapshot.documents
                .mapNotNull { it.toObject(Usuario::class.java) }
                .filter { it.username.contains(query, ignoreCase = true) && it.uid != obtenerIdUsuario() }
                .take(20) // Limitar a 20 resultados

            Result.success(usuarios)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Envía una solicitud de amistad
     */
    suspend fun enviarSolicitudAmistad(paraUid: String): Result<Unit> {
        val uid = obtenerIdUsuario() ?: return Result.failure(Exception("Usuario no autenticado"))

        return try {
            // Verificar que no sean ya amigos
            val usuarioActual = obtenerPerfilUsuario().getOrNull()
                ?: return Result.failure(Exception("Error al obtener perfil"))

            if (usuarioActual.amigos.contains(paraUid)) {
                return Result.failure(Exception("Ya son amigos"))
            }

            // Verificar que no exista ya una solicitud pendiente
            val solicitudesExistentes = firestore.collection("solicitudes_amistad")
                .whereEqualTo("deUid", uid)
                .whereEqualTo("paraUid", paraUid)
                .whereEqualTo("estado", "pendiente")
                .get()
                .await()

            if (!solicitudesExistentes.isEmpty) {
                return Result.failure(Exception("Ya enviaste una solicitud a este usuario"))
            }

            // Crear la solicitud
            val solicitud = SolicitudAmistad(
                id = UUID.randomUUID().toString(),
                deUid = uid,
                paraUid = paraUid,
                deUsername = usuarioActual.username,
                estado = "pendiente"
            )

            firestore.collection("solicitudes_amistad")
                .document(solicitud.id)
                .set(solicitud)
                .await()

            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Acepta una solicitud de amistad
     */
    suspend fun aceptarSolicitudAmistad(solicitudId: String): Result<Unit> {
        return try {
            // Obtener la solicitud
            val solicitudDoc = firestore.collection("solicitudes_amistad")
                .document(solicitudId)
                .get()
                .await()

            val solicitud = solicitudDoc.toObject(SolicitudAmistad::class.java)
                ?: return Result.failure(Exception("Solicitud no encontrada"))

            // Añadir a la lista de amigos de ambos usuarios
            firestore.collection("usuarios")
                .document(solicitud.deUid)
                .update("amigos", FieldValue.arrayUnion(solicitud.paraUid))
                .await()

            firestore.collection("usuarios")
                .document(solicitud.paraUid)
                .update("amigos", FieldValue.arrayUnion(solicitud.deUid))
                .await()

            // Actualizar estado de la solicitud
            firestore.collection("solicitudes_amistad")
                .document(solicitudId)
                .update("estado", "aceptada")
                .await()

            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Obtiene las solicitudes de amistad pendientes del usuario actual
     */
    suspend fun obtenerSolicitudesPendientes(): Result<List<SolicitudAmistad>> {
        val uid = obtenerIdUsuario() ?: return Result.failure(Exception("Usuario no autenticado"))

        return try {
            val snapshot = firestore.collection("solicitudes_amistad")
                .whereEqualTo("paraUid", uid)
                .whereEqualTo("estado", "pendiente")
                .get()
                .await()

            val solicitudes = snapshot.documents.mapNotNull { it.toObject(SolicitudAmistad::class.java) }
            Result.success(solicitudes)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Obtiene la lista de amigos del usuario actual con sus datos completos
     */
    suspend fun obtenerAmigos(): Result<List<Usuario>> {
        val uid = obtenerIdUsuario() ?: return Result.failure(Exception("Usuario no autenticado"))

        return try {
            val usuarioActual = obtenerPerfilUsuario().getOrNull()
                ?: return Result.failure(Exception("Error al obtener perfil"))

            if (usuarioActual.amigos.isEmpty()) {
                return Result.success(emptyList())
            }

            // Obtener datos de cada amigo
            val amigos = usuarioActual.amigos.mapNotNull { amigoUid ->
                try {
                    val doc = firestore.collection("usuarios")
                        .document(amigoUid)
                        .get()
                        .await()
                    doc.toObject(Usuario::class.java)
                } catch (e: Exception) {
                    null
                }
            }

            Result.success(amigos)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Elimina un amigo
     */
    suspend fun eliminarAmigo(amigoUid: String): Result<Unit> {
        val uid = obtenerIdUsuario() ?: return Result.failure(Exception("Usuario no autenticado"))

        return try {
            // Eliminar de ambas listas
            firestore.collection("usuarios")
                .document(uid)
                .update("amigos", FieldValue.arrayRemove(amigoUid))
                .await()

            firestore.collection("usuarios")
                .document(amigoUid)
                .update("amigos", FieldValue.arrayRemove(uid))
                .await()

            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
