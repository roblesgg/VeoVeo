package com.example.veoveo.conexion

import com.example.veoveo.model.CreditsResponse
import com.example.veoveo.model.MovieDetails
import com.example.veoveo.model.MovieResponse
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

// define las llamadas que podemos hacer a la api de tmdb
interface ApiService {

    // busca peliculas por nombre
    @GET("search/movie")
    suspend fun buscarPeliculas(
        @Query("query") nombrePelicula: String,
        @Query("language") idioma: String = "es-ES"
    ): Response<MovieResponse>

    // busca peliculas por genero
    @GET("discover/movie")
    suspend fun buscarPeliculasporGenero(
        @Query("with_genres") generoId: String,
        @Query("language") idioma: String = "es-ES",
        @Query("sort_by") orden: String = "popularity.desc",
        @Query("page") pagina: Int = 1
    ): Response<MovieResponse>

    // obtiene info completa de una pelicula
    @GET("movie/{movie_id}")
    suspend fun obtenerDetallesPelicula(
        @Path("movie_id") movieId: Int,
        @Query("language") idioma: String = "es-ES"
    ): Response<MovieDetails>

    // obtiene el reparto y equipo de una pelicula
    @GET("movie/{movie_id}/credits")
    suspend fun obtenerCreditosPelicula(
        @Path("movie_id") movieId: Int,
        @Query("language") idioma: String = "es-ES"
    ): Response<CreditsResponse>
}