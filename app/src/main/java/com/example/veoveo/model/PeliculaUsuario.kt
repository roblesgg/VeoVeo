package com.example.veoveo.model

/**
 * Modelo simple para las películas guardadas por el usuario
 */
data class PeliculaUsuario(
    val idPelicula: Int = 0,              // ID de TMDB
    val titulo: String = "",              // Título de la película
    val rutaPoster: String? = null,       // Poster de la película
    val estado: String = "por_ver",       // "por_ver" o "vista"
    val valoracion: Int = 0,              // Valoración del usuario (0-5 estrellas)
    val fechaAnadido: Long = System.currentTimeMillis()  // Timestamp cuando se añadió
) {
    // Constructor sin parámetros requerido por Firestore
    constructor() : this(0, "", null, "por_ver", 0, System.currentTimeMillis())
}
