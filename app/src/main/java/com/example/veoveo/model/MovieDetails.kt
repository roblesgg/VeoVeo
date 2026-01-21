package com.example.veoveo.model

import com.google.gson.annotations.SerializedName

// info completa de una pelicula de tmdb
data class MovieDetails(
    @SerializedName("id") val id: Int,
    @SerializedName("title") val title: String,
    @SerializedName("overview") val overview: String,
    @SerializedName("poster_path") val posterPath: String?,
    @SerializedName("backdrop_path") val backdropPath: String?, // imagen de fondo
    @SerializedName("release_date") val releaseDate: String?,
    @SerializedName("vote_average") val voteAverage: Double, // puntuacion media
    @SerializedName("vote_count") val voteCount: Int, // cuantos votos tiene
    @SerializedName("runtime") val runtime: Int?, // duracion en minutos
    @SerializedName("genres") val genres: List<Genre>, // lista de generos
    @SerializedName("original_language") val originalLanguage: String,
    @SerializedName("popularity") val popularity: Double
)

// genero de una pelicula (accion, drama, etc)
data class Genre(
    @SerializedName("id") val id: Int,
    @SerializedName("name") val name: String
)

// respuesta con el reparto de una pelicula
data class CreditsResponse(
    @SerializedName("id") val id: Int,
    @SerializedName("cast") val cast: List<CastMember>, // actores
    @SerializedName("crew") val crew: List<CrewMember> // equipo tecnico
)

// info de un actor
data class CastMember(
    @SerializedName("id") val id: Int,
    @SerializedName("name") val name: String, // nombre del actor
    @SerializedName("character") val character: String, // personaje que interpreta
    @SerializedName("profile_path") val profilePath: String?, // foto del actor
    @SerializedName("order") val order: Int // orden de importancia
)

// info de equipo tecnico (director, guionista, etc)
data class CrewMember(
    @SerializedName("id") val id: Int,
    @SerializedName("name") val name: String,
    @SerializedName("job") val job: String, // trabajo (director, guionista...)
    @SerializedName("department") val department: String, // departamento
    @SerializedName("profile_path") val profilePath: String?
)
