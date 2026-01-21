package com.example.veoveo.model

// guarda las peliculas que el usuario ha marcado
data class PeliculaUsuario(
    val idPelicula: Int = 0, // id de la pelicula en tmdb
    val titulo: String = "", // nombre de la pelicula
    val rutaPoster: String? = null, // url del poster
    val estado: String = "por_ver", // puede ser "por_ver" o "vista"
    val valoracion: Int = 0, // estrellas que le da el usuario (0 a 5)
    val fechaAnadido: Long = System.currentTimeMillis() // cuando la añadio
) {
    // firebase necesita un constructor vacio
    constructor() : this(0, "", null, "por_ver", 0, System.currentTimeMillis())
}
