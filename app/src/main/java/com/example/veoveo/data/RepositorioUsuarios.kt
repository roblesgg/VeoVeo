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

// maneja usuarios y relaciones sociales
class RepositorioUsuarios {

    private val firestore = FirebaseFirestore.getInstance()
    private val auth = FirebaseAuth.getInstance()

    // devuelve el uid del usuario actual
    private fun obtenerIdUsuario(): String? = auth.currentUser?.uid

    // crea o actualiza el perfil de usuario
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

    // crea un perfil por defecto para el usuario actual
    suspend fun crearPerfilPorDefecto(): Result<Unit> = withContext(Dispatchers.IO) {
        val uid = obtenerIdUsuario()

        if (uid == null) {
            return@withContext Result.failure(Exception("Usuario no autenticado"))
        }

        val email = auth.currentUser?.email ?: "sin_email"

        return@withContext try {
            val usuario = Usuario(
                uid = uid,
                username = "Usuario_${uid.take(6)}", // username temporal unico
                email = email,
                fotoPerfil = null,
                amigos = emptyList()
            )

            firestore.collection("usuarios")
                .document(uid)
                .set(usuario)
                .await()

            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // obtiene el perfil del usuario actual
    suspend fun obtenerPerfilUsuario(): Result<Usuario> = withContext(Dispatchers.IO) {
        val uid = obtenerIdUsuario()

        if (uid == null) {
            return@withContext Result.failure(Exception("Usuario no autenticado"))
        }

        return@withContext try {
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

    // obtiene el perfil de un usuario por uid
    suspend fun obtenerUsuarioPorUid(uid: String): Result<Usuario> = withContext(Dispatchers.IO) {
        return@withContext try {
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

    // actualiza el username sin verificar duplicados
    suspend fun actualizarUsername(nuevoUsername: String): Result<Unit> = withContext(Dispatchers.IO) {
        val uid = obtenerIdUsuario() ?: return@withContext Result.failure(Exception("Usuario no autenticado"))

        return@withContext try {
            // usa set con merge por si el documento no existe
            firestore.collection("usuarios")
                .document(uid)
                .set(mapOf("username" to nuevoUsername), com.google.firebase.firestore.SetOptions.merge())
                .await()

            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // actualiza la url de la foto de perfil
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

    // busca usuarios por username (busqueda parcial)
    suspend fun buscarUsuariosPorUsername(query: String): Result<List<Usuario>> = withContext(Dispatchers.IO) {
        if (query.isBlank()) return@withContext Result.success(emptyList())

        return@withContext try {
            // firestore no tiene busqueda parcial, trae todos y filtra
            val snapshot = firestore.collection("usuarios")
                .get()
                .await()

            val usuarios = snapshot.documents
                .mapNotNull { it.toObject(Usuario::class.java) }
                .filter { it.username.contains(query, ignoreCase = true) && it.uid != obtenerIdUsuario() }
                .take(20) // limita a 20 resultados

            Result.success(usuarios)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // envia una solicitud de amistad
    suspend fun enviarSolicitudAmistad(paraUid: String): Result<Unit> = withContext(Dispatchers.IO) {
        val uid = obtenerIdUsuario() ?: return@withContext Result.failure(Exception("Usuario no autenticado"))

        return@withContext try {
            // verifica que no sean ya amigos
            val usuarioActual = obtenerPerfilUsuario().getOrNull()
                ?: return@withContext Result.failure(Exception("Error al obtener perfil"))

            if (usuarioActual.amigos.contains(paraUid)) {
                return@withContext Result.failure(Exception("Ya son amigos"))
            }

            // verifica que no exista ya una solicitud pendiente
            val solicitudesExistentes = firestore.collection("solicitudes_amistad")
                .whereEqualTo("deUid", uid)
                .whereEqualTo("paraUid", paraUid)
                .whereEqualTo("estado", "pendiente")
                .get()
                .await()

            if (!solicitudesExistentes.isEmpty) {
                return@withContext Result.failure(Exception("Ya enviaste una solicitud a este usuario"))
            }

            // crea la solicitud
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

    // acepta una solicitud de amistad
    suspend fun aceptarSolicitudAmistad(solicitudId: String): Result<Unit> = withContext(Dispatchers.IO) {
        return@withContext try {
            // obtiene la solicitud
            val solicitudDoc = firestore.collection("solicitudes_amistad")
                .document(solicitudId)
                .get()
                .await()

            val solicitud = solicitudDoc.toObject(SolicitudAmistad::class.java)
                ?: return@withContext Result.failure(Exception("Solicitud no encontrada"))

            // anade a la lista de amigos de ambos usuarios
            firestore.collection("usuarios")
                .document(solicitud.deUid)
                .update("amigos", FieldValue.arrayUnion(solicitud.paraUid))
                .await()

            firestore.collection("usuarios")
                .document(solicitud.paraUid)
                .update("amigos", FieldValue.arrayUnion(solicitud.deUid))
                .await()

            // actualiza estado de la solicitud
            firestore.collection("solicitudes_amistad")
                .document(solicitudId)
                .update("estado", "aceptada")
                .await()

            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // rechaza una solicitud de amistad
    suspend fun rechazarSolicitudAmistad(solicitudId: String): Result<Unit> = withContext(Dispatchers.IO) {
        return@withContext try {
            // actualiza estado de la solicitud a "rechazada"
            firestore.collection("solicitudes_amistad")
                .document(solicitudId)
                .update("estado", "rechazada")
                .await()

            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // obtiene las solicitudes de amistad pendientes del usuario actual
    suspend fun obtenerSolicitudesPendientes(): Result<List<SolicitudAmistad>> = withContext(Dispatchers.IO) {
        val uid = obtenerIdUsuario() ?: return@withContext Result.failure(Exception("Usuario no autenticado"))

        return@withContext try {
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

    // obtiene la lista de amigos del usuario actual con sus datos completos
    suspend fun obtenerAmigos(): Result<List<Usuario>> = withContext(Dispatchers.IO) {
        val uid = obtenerIdUsuario() ?: return@withContext Result.failure(Exception("Usuario no autenticado"))

        return@withContext try {
            val usuarioActual = obtenerPerfilUsuario().getOrNull()
                ?: return@withContext Result.failure(Exception("Error al obtener perfil"))

            if (usuarioActual.amigos.isEmpty()) {
                return@withContext Result.success(emptyList())
            }

            // obtiene datos de cada amigo
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

    // elimina un amigo
    suspend fun eliminarAmigo(amigoUid: String): Result<Unit> = withContext(Dispatchers.IO) {
        val uid = obtenerIdUsuario() ?: return@withContext Result.failure(Exception("Usuario no autenticado"))

        return@withContext try {
            // elimina de ambas listas
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

    // bloquea a un usuario
    suspend fun bloquearUsuario(usuarioUid: String): Result<Unit> = withContext(Dispatchers.IO) {
        val uid = obtenerIdUsuario() ?: return@withContext Result.failure(Exception("Usuario no autenticado"))

        return@withContext try {
            // primero elimina de amigos si lo son
            firestore.collection("usuarios")
                .document(uid)
                .update("amigos", FieldValue.arrayRemove(usuarioUid))
                .await()

            firestore.collection("usuarios")
                .document(usuarioUid)
                .update("amigos", FieldValue.arrayRemove(uid))
                .await()

            // anade a lista de bloqueados (crea el campo si no existe)
            firestore.collection("usuarios")
                .document(uid)
                .set(mapOf("bloqueados" to FieldValue.arrayUnion(usuarioUid)), com.google.firebase.firestore.SetOptions.merge())
                .await()

            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
