package com.example.veoveo.model

import com.google.gson.annotations.SerializedName

/**
 * ===== MOVIEDETAILS - DETALLES COMPLETOS DE UNA PELÍCULA =====
 *
 * Este modelo representa la respuesta completa de la API de TMDB
 * cuando pedimos los detalles de una película específica.
 *
 * Endpoint: GET /movie/{movie_id}
 */
data class MovieDetails(
    @SerializedName("id") val id: Int,

    @SerializedName("title") val title: String,

    @SerializedName("overview") val overview: String,

    @SerializedName("poster_path") val posterPath: String?,

    @SerializedName("backdrop_path") val backdropPath: String?,

    @SerializedName("release_date") val releaseDate: String?,

    @SerializedName("vote_average") val voteAverage: Double,

    @SerializedName("vote_count") val voteCount: Int,

    @SerializedName("runtime") val runtime: Int?,

    @SerializedName("genres") val genres: List<Genre>,

    @SerializedName("original_language") val originalLanguage: String,

    @SerializedName("popularity") val popularity: Double
)

/**
 * ===== GENRE - GÉNERO DE UNA PELÍCULA =====
 */
data class Genre(
    @SerializedName("id") val id: Int,
    @SerializedName("name") val name: String
)

/**
 * ===== CREDITSRESPONSE - RESPUESTA DEL ENDPOINT DE CRÉDITOS =====
 *
 * Este modelo representa la respuesta cuando pedimos el reparto de una película.
 * Endpoint: GET /movie/{movie_id}/credits
 */
data class CreditsResponse(
    @SerializedName("id") val id: Int,
    @SerializedName("cast") val cast: List<CastMember>,
    @SerializedName("crew") val crew: List<CrewMember>
)

/**
 * ===== CASTMEMBER - MIEMBRO DEL REPARTO =====
 */
data class CastMember(
    @SerializedName("id") val id: Int,
    @SerializedName("name") val name: String,
    @SerializedName("character") val character: String,
    @SerializedName("profile_path") val profilePath: String?,
    @SerializedName("order") val order: Int
)

/**
 * ===== CREWMEMBER - MIEMBRO DEL EQUIPO TÉCNICO =====
 */
data class CrewMember(
    @SerializedName("id") val id: Int,
    @SerializedName("name") val name: String,
    @SerializedName("job") val job: String,
    @SerializedName("department") val department: String,
    @SerializedName("profile_path") val profilePath: String?
)
