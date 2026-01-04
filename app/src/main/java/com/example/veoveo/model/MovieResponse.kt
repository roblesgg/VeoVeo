package com.example.veoveo.model

import com.google.gson.annotations.SerializedName

// 1. Esta clase representa TODO el JSON que te llega (la "caja" grande)
data class MovieResponse(
    @SerializedName("page") val page: Int,
    @SerializedName("results") val results: List<Movie>, // Aquí está la lista que nos importa
    @SerializedName("total_pages") val totalPages: Int
)

// 2. Esta clase representa CADA película individual dentro de la lista
data class Movie(
    @SerializedName("id") val id: Int,

    @SerializedName("title") val title: String,

    @SerializedName("overview") val overview: String,

    // Puede ser null (?) porque algunas películas viejas no tienen póster
    @SerializedName("poster_path") val posterPath: String?,

    @SerializedName("release_date") val releaseDate: String?
)