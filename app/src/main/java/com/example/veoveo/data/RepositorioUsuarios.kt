package com.example.veoveo.data

import android.net.Uri
import android.util.Log
import com.example.veoveo.model.Usuario
import com.example.veoveo.model.SolicitudAmistad
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.FieldValue
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.UUID

/**
 * Repositorio para gestionar usuarios y relaciones sociales
 */
class RepositorioUsuarios {

    private val firestore = FirebaseFirestore.getInstance()
    private val auth = FirebaseAuth.getInstance()

    /**
     * Obtiene el ID del usuario actual
     */
    private fun obtenerIdUsuario(): String? = auth.currentUser?.uid

    /**
     * Crea o actualiza el perfil de usuario
     */
    suspend fun crearOActualizarUsuario(usuario: Usuario): Result<Unit> = withContext(Dispatchers.IO) {
        return@withContext try {
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
     * Crea un perfil por defecto para el usuario actual
     */
    suspend fun crearPerfilPorDefecto(): Result<Unit> = withContext(Dispatchers.IO) {
        Log.d("RepositorioUsuarios", "=== crearPerfilPorDefecto ===")
        val uid = obtenerIdUsuario()

        if (uid == null) {
            Log.e("RepositorioUsuarios", "Usuario no autenticado al crear perfil")
            return@withContext Result.failure(Exception("Usuario no autenticado"))
        }

        val email = auth.currentUser?.email ?: "sin_email"
        Log.d("RepositorioUsuarios", "Creando perfil para UID: $uid, Email: $email")

        return@withContext try {
            val usuario = Usuario(
                uid = uid,
                username = "Usuario_${uid.take(6)}", // Username temporal único
                email = email,
                fotoPerfil = null,
                amigos = emptyList()
            )

            Log.d("RepositorioUsuarios", "Guardando usuario en Firestore: ${usuario.username}")
            firestore.collection("usuarios")
                .document(uid)
                .set(usuario)
                .await()

            Log.d("RepositorioUsuarios", "Perfil creado exitosamente")
            Result.success(Unit)
        } catch (e: Exception) {
            Log.e("RepositorioUsuarios", "Error al crear perfil por defecto", e)
            Result.failure(e)
        }
    }

    /**
     * Obtiene el perfil del usuario actual
     */
    suspend fun obtenerPerfilUsuario(): Result<Usuario> = withContext(Dispatchers.IO) {
        Log.d("RepositorioUsuarios", "=== obtenerPerfilUsuario ===")
        val uid = obtenerIdUsuario()

        if (uid == null) {
            Log.e("RepositorioUsuarios", "Usuario no autenticado")
            return@withContext Result.failure(Exception("Usuario no autenticado"))
        }

        Log.d("RepositorioUsuarios", "UID del usuario: $uid")

        return@withContext try {
            Log.d("RepositorioUsuarios", "Consultando Firestore: usuarios/$uid")
            val doc = firestore.collection("usuarios")
                .document(uid)
                .get()
                .await()

            Log.d("RepositorioUsuarios", "Documento existe: ${doc.exists()}")

            val usuario = doc.toObject(Usuario::class.java)
            if (usuario != null) {
                Log.d("RepositorioUsuarios", "Usuario obtenido: ${usuario.username}")
                Result.success(usuario)
            } else {
                Log.w("RepositorioUsuarios", "Usuario no encontrado en Firestore")
                Result.failure(Exception("Usuario no encontrado"))
            }
        } catch (e: Exception) {
            Log.e("RepositorioUsuarios", "Error al obtener perfil", e)
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
     * Actualiza el username (versión simplificada sin verificación de duplicados)
     */
    suspend fun actualizarUsername(nuevoUsername: String): Result<Unit> = withContext(Dispatchers.IO) {
        val uid = obtenerIdUsuario() ?: return@withContext Result.failure(Exception("Usuario no autenticado"))

        return@withContext try {
            Log.d("RepositorioUsuarios", "Actualizando username a: $nuevoUsername para UID: $uid")

            // Usar set con merge para asegurar que funcione aunque el documento no exista
            firestore.collection("usuarios")
                .document(uid)
                .set(mapOf("username" to nuevoUsername), com.google.firebase.firestore.SetOptions.merge())
                .await()

            Log.d("RepositorioUsuarios", "Username actualizado exitosamente")
            Result.success(Unit)
        } catch (e: Exception) {
            Log.e("RepositorioUsuarios", "Error al actualizar username", e)
            Result.failure(e)
        }
    }

    /**
     * Actualiza la URL de la foto de perfil
     */
    suspend fun actualizarFotoPerfil(url: String): Result<Unit> = withContext(Dispatchers.IO) {
        val uid = obtenerIdUsuario() ?: return@withContext Result.failure(Exception("Usuario no autenticado"))

        return@withContext try {
            firestore.collection("usuarios")
                .document(uid)
                .update("fotoPerfil", url)
                .await()

            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Busca usuarios por username (búsqueda parcial)
     */
    suspend fun buscarUsuariosPorUsername(query: String): Result<List<Usuario>> = withContext(Dispatchers.IO) {
        if (query.isBlank()) return@withContext Result.success(emptyList())

        return@withContext try {
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
