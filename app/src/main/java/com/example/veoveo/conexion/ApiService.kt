package com.example.veoveo.conexion

import com.example.veoveo.model.CreditsResponse
import com.example.veoveo.model.MovieDetails
import com.example.veoveo.model.MovieResponse
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

interface ApiService {

    // Traducimos: https://api.themoviedb.org/3/search/movie?query=...
    @GET("search/movie")
    suspend fun buscarPeliculas(
        @Query("query") nombrePelicula: String,
        @Query("language") idioma: String = "es-ES"
    ): Response<MovieResponse>

    @GET("discover/movie")
    suspend fun buscarPeliculasporGenero(
        @Query("with_genres") generoId: String,
        @Query("language") idioma: String = "es-ES",
        @Query("sort_by") orden: String = "popularity.desc",
        @Query("page") pagina: Int = 1
    ): Response<MovieResponse>

    /**
     * Obtiene los detalles completos de una película
     * Endpoint: GET /movie/{movie_id}
     */
    @GET("movie/{movie_id}")
    suspend fun obtenerDetallesPelicula(
        @Path("movie_id") movieId: Int,
        @Query("language") idioma: String = "es-ES"
    ): Response<MovieDetails>

    /**
     * Obtiene el reparto y equipo técnico de una película
     * Endpoint: GET /movie/{movie_id}/credits
     */
    @GET("movie/{movie_id}/credits")
    suspend fun obtenerCreditosPelicula(
        @Path("movie_id") movieId: Int,
        @Query("language") idioma: String = "es-ES"
    ): Response<CreditsResponse>
}