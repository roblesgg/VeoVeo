package com.example.veoveo.model

/**
 * Modelo de datos para un usuario en Firestore
 */
data class Usuario(
    val uid: String = "",
    val username: String = "",
    val email: String = "",
    val fotoPerfil: String? = null,
    val amigos: List<String> = emptyList(), // Lista de UIDs de amigos
    val fechaCreacion: Long = System.currentTimeMillis()
)
