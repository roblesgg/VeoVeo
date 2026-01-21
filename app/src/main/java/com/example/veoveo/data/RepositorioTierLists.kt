package com.example.veoveo.data

import android.util.Log
import com.example.veoveo.model.TierList
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import kotlinx.coroutines.tasks.await

/**
 * Repositorio para gestionar TierLists en Firebase
 */
class RepositorioTierLists {

    private val db = FirebaseFirestore.getInstance()
    private val auth = FirebaseAuth.getInstance()

    /**
     * Obtiene el UID del usuario actual
     */
    private fun getUidActual(): String? = auth.currentUser?.uid

    /**
     * Crea una nueva TierList
     */
    suspend fun crearTierList(tierList: TierList): Result<String> {
        return try {
            val uid = getUidActual() ?: return Result.failure(Exception("Usuario no autenticado"))

            // Generar ID único
            val docRef = db.collection("usuarios").document(uid)
                .collection("tierLists").document()

            val tierListConId = tierList.copy(
                id = docRef.id,
                creadorUid = uid,
                fechaCreacion = System.currentTimeMillis(),
                ultimaModificacion = System.currentTimeMillis()
            )

            docRef.set(tierListConId.toMap()).await()
            Log.d("RepositorioTierLists", "TierList creada: ${docRef.id}")
            Result.success(docRef.id)
        } catch (e: Exception) {
            Log.e("RepositorioTierLists", "Error al crear TierList", e)
            Result.failure(e)
        }
    }

    /**
     * Obtiene todas las TierLists del usuario actual
     */
    suspend fun obtenerTierLists(): Result<List<TierList>> {
        return try {
            val uid = getUidActual() ?: return Result.failure(Exception("Usuario no autenticado"))

            val snapshot = db.collection("usuarios").document(uid)
                .collection("tierLists")
                .orderBy("ultimaModificacion", Query.Direction.DESCENDING)
                .get()
                .await()

            val tierLists = snapshot.documents.mapNotNull { doc ->
                try {
                    TierList.fromMap(doc.id, doc.data ?: emptyMap())
                } catch (e: Exception) {
                    Log.e("RepositorioTierLists", "Error al parsear TierList ${doc.id}", e)
                    null
                }
            }

            Log.d("RepositorioTierLists", "TierLists obtenidas: ${tierLists.size}")
            Result.success(tierLists)
        } catch (e: Exception) {
            Log.e("RepositorioTierLists", "Error al obtener TierLists", e)
            Result.failure(e)
        }
    }

    /**
     * Obtiene una TierList específica por su ID
     */
    suspend fun obtenerTierList(tierListId: String): Result<TierList> {
        return try {
            val uid = getUidActual() ?: return Result.failure(Exception("Usuario no autenticado"))

            val doc = db.collection("usuarios").document(uid)
                .collection("tierLists")
                .document(tierListId)
                .get()
                .await()

            if (doc.exists()) {
                val tierList = TierList.fromMap(doc.id, doc.data ?: emptyMap())
                Result.success(tierList)
            } else {
                Result.failure(Exception("TierList no encontrada"))
            }
        } catch (e: Exception) {
            Log.e("RepositorioTierLists", "Error al obtener TierList", e)
            Result.failure(e)
        }
    }

    /**
     * Actualiza una TierList existente
     */
    suspend fun actualizarTierList(tierList: TierList): Result<Unit> {
        return try {
            val uid = getUidActual() ?: return Result.failure(Exception("Usuario no autenticado"))

            val tierListActualizada = tierList.copy(
                ultimaModificacion = System.currentTimeMillis()
            )

            db.collection("usuarios").document(uid)
                .collection("tierLists")
                .document(tierList.id)
                .set(tierListActualizada.toMap())
                .await()

            Log.d("RepositorioTierLists", "TierList actualizada: ${tierList.id}")
            Result.success(Unit)
        } catch (e: Exception) {
            Log.e("RepositorioTierLists", "Error al actualizar TierList", e)
            Result.failure(e)
        }
    }

    /**
     * Elimina una TierList
     */
    suspend fun eliminarTierList(tierListId: String): Result<Unit> {
        return try {
            val uid = getUidActual() ?: return Result.failure(Exception("Usuario no autenticado"))

            db.collection("usuarios").document(uid)
                .collection("tierLists")
                .document(tierListId)
                .delete()
                .await()

            Log.d("RepositorioTierLists", "TierList eliminada: $tierListId")
            Result.success(Unit)
        } catch (e: Exception) {
            Log.e("RepositorioTierLists", "Error al eliminar TierList", e)
            Result.failure(e)
        }
    }

    /**
     * Obtiene las TierLists públicas de un usuario específico
     */
    suspend fun obtenerTierListsDeUsuario(uid: String): Result<List<TierList>> {
        return try {
            val snapshot = db.collection("usuarios").document(uid)
                .collection("tierLists")
                .orderBy("ultimaModificacion", Query.Direction.DESCENDING)
                .get()
                .await()

            val tierLists = snapshot.documents.mapNotNull { doc ->
                try {
                    TierList.fromMap(doc.id, doc.data ?: emptyMap())
                } catch (e: Exception) {
                    Log.e("RepositorioTierLists", "Error al parsear TierList ${doc.id}", e)
                    null
                }
            }

            Log.d("RepositorioTierLists", "TierLists de usuario $uid obtenidas: ${tierLists.size}")
            Result.success(tierLists)
        } catch (e: Exception) {
            Log.e("RepositorioTierLists", "Error al obtener TierLists de usuario", e)
            Result.failure(e)
        }
    }
}
