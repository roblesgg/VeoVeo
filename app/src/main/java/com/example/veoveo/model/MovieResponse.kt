package com.example.veoveo.model

import com.google.gson.annotations.SerializedName

// respuesta completa de la api de tmdb cuando buscamos peliculas
data class MovieResponse(
    @SerializedName("page") val page: Int, // pagina actual
    @SerializedName("results") val results: List<Movie>, // lista de peliculas
    @SerializedName("total_pages") val totalPages: Int // total de paginas
)

// info basica de una pelicula
data class Movie(
    @SerializedName("id") val id: Int, // identificador unico
    @SerializedName("title") val title: String, // titulo
    @SerializedName("overview") val overview: String, // sinopsis
    @SerializedName("poster_path") val posterPath: String?, // ruta del poster (puede ser null)
    @SerializedName("release_date") val releaseDate: String? // fecha de estreno
)