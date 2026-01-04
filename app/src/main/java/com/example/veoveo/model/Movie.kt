package com.example.veoveo.model

import com.google.gson.annotations.SerializedName

data class Movie(
    @SerializedName("id") val id: Int,

    @SerializedName("title") val title: String,

    @SerializedName("overview") val overview: String,

    // Puede ser null (?) porque algunas películas viejas no tienen póster
    @SerializedName("poster_path") val posterPath: String?,

    @SerializedName("release_date") val releaseDate: String?
)
