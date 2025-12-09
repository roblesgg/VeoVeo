package com.ejemplo.tuaplicacion.network // Android Studio pone esto solo

import okhttp3.OkHttpClient
import okhttp3.Request
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory // Asegúrate de importar tu interfaz

object RetrofitClient {
    // 1. Base URL según el comando curl
    private const val BASE_URL = "https://api.themoviedb.org/3/"

    // Pega aquí tu token largo (el que venía en <<access_token>>)
    private const val ACCESS_TOKEN = "TU_TOKEN_LARGO_AQUI"

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