package com.example.veoveo.utils

import android.content.Context
import android.content.SharedPreferences
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

// guarda y carga preferencias del usuario en el dispositivo
class PreferencesHelper(context: Context) {

    // archivo donde se guardan las preferencias
    private val prefs: SharedPreferences = context.getSharedPreferences(
        "VeoVeoPrefs",
        Context.MODE_PRIVATE
    )

    // gson convierte listas a texto y viceversa
    private val gson = Gson()

    companion object {
        private const val KEY_CARRUSELES_ACTIVOS = "carruseles_activos"
    }

    // guarda que generos estan activos en la pantalla principal
    fun guardarCarruselesActivos(carruseles: List<String>) {
        val json = gson.toJson(carruseles)
        prefs.edit().putString(KEY_CARRUSELES_ACTIVOS, json).apply()
    }

    // carga los generos activos (si no hay nada guardado devuelve los de por defecto)
    fun cargarCarruselesActivos(): List<String> {
        val json = prefs.getString(KEY_CARRUSELES_ACTIVOS, null)
        return if (json != null) {
            val type = object : TypeToken<List<String>>() {}.type
            gson.fromJson(json, type)
        } else {
            // primera vez que abre la app
            listOf("Terror", "Comedia", "Acción")
        }
    }
}
