package com.example.veoveo.utils

import android.content.Context
import android.content.SharedPreferences
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

/**
 * Helper para gestionar SharedPreferences de la app
 */
class PreferencesHelper(context: Context) {

    private val prefs: SharedPreferences = context.getSharedPreferences(
        "VeoVeoPrefs",
        Context.MODE_PRIVATE
    )

    private val gson = Gson()

    companion object {
        private const val KEY_CARRUSELES_ACTIVOS = "carruseles_activos"
    }

    /**
     * Guarda la lista de carruseles activos
     */
    fun guardarCarruselesActivos(carruseles: List<String>) {
        val json = gson.toJson(carruseles)
        prefs.edit().putString(KEY_CARRUSELES_ACTIVOS, json).apply()
    }

    /**
     * Carga la lista de carruseles activos
     * Si no hay nada guardado, devuelve una lista con valores por defecto
     */
    fun cargarCarruselesActivos(): List<String> {
        val json = prefs.getString(KEY_CARRUSELES_ACTIVOS, null)
        return if (json != null) {
            val type = object : TypeToken<List<String>>() {}.type
            gson.fromJson(json, type)
        } else {
            // Valores por defecto si es la primera vez
            listOf("Terror", "Comedia", "Acción")
        }
    }
}
