package com.example.veoveo.conexion

import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {
    // 1. Base URL según el comando curl
    private const val BASE_URL = "https://api.themoviedb.org/3/"

    // Pega aquí tu token largo (el que venía en <<access_token>>)
    private const val ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNjZmZjg3OWZlN2U5NTc1YTExNjVhZTY5YjdiYThjMyIsIm5iZiI6MTc2NTI4Mzg5Mi40NzksInN1YiI6IjY5MzgxODM0NTA3ZjU4NTM2Y2Y3Y2QzYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.h9zjlpzXNK4Sqlovfp_M-Gqo9le6mVBi2qlR5jPsLzw"

    private val client = OkHttpClient.Builder().apply {
        addInterceptor { chain ->
            val original = chain.request()

            // 2. Aquí traducimos los --header del curl
            val request = original.newBuilder()
                .header("Authorization", "Bearer $ACCESS_TOKEN")
                .header("accept", "application/json")
                .method(original.method, original.body)
                .build()

            chain.proceed(request)
        }
    }.build()

    val instance: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}