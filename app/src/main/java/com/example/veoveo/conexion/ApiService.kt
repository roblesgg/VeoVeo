package com.example.veoveo.conexion

import com.example.veoveo.model.MovieResponse
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Query

interface ApiService {

    // Traducimos: https://api.themoviedb.org/3/search/movie?query=...
    @GET("search/movie")
    suspend fun buscarPeliculas(
        @Query("query") nombrePelicula: String,
        @Query("language") idioma: String = "es-ES"
    ): Response<MovieResponse>

    suspend fun buscarPeliculasporGenero(
        @Query("with_genres") generoId: String,
        @Query("language") idioma: String = "es-ES",
        @Query("sort_by") orden: String = "popularity.desc"
    ): Response<MovieResponse>
}