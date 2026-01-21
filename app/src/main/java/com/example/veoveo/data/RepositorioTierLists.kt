package com.example.veoveo.data

import android.util.Log
import com.example.veoveo.model.TierList
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import kotlinx.coroutines.tasks.await

// maneja tierlists en firebase
class RepositorioTierLists {

    private val db = FirebaseFirestore.getInstance()
    private val auth = FirebaseAuth.getInstance()

    // devuelve el uid del usuario actual
    private fun getUidActual(): String? = auth.currentUser?.uid

    // crea una nueva tierlist
    suspend fun crearTierList(tierList: TierList): Result<String> {
        return try {
            val uid = getUidActual() ?: return Result.failure(Exception("Usuario no autenticado"))

            // genera id unico
            val docRef = db.collection("usuarios").document(uid)
                .collection("tierLists").document()

            val tierListConId = tierList.copy(
                id = docRef.id,
                creadorUid = uid,
                fechaCreacion = System.currentTimeMillis(),
                ultimaModificacion = System.currentTimeMillis()
            )

            docRef.set(tierListConId.toMap()).await()
            Result.success(docRef.id)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // obtiene todas las tierlists del usuario actual
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
                    null
                }
            }

            Result.success(tierLists)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // obtiene una tierlist especifica por su id
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
            Result.failure(e)
        }
    }

    // actualiza una tierlist existente
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

            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // elimina una tierlist
    suspend fun eliminarTierList(tierListId: String): Result<Unit> {
        return try {
            val uid = getUidActual() ?: return Result.failure(Exception("Usuario no autenticado"))

            db.collection("usuarios").document(uid)
                .collection("tierLists")
                .document(tierListId)
                .delete()
                .await()

            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // obtiene las tierlists publicas de un usuario especifico
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
                    null
                }
            }

            Result.success(tierLists)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
