package com.example.veoveo.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.veoveo.conexion.RetrofitClient
import com.example.veoveo.model.Movie
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * ViewModel para manejar los carruseles de la pestaña Descubrir
 * Mantiene las películas de cada carrusel para evitar recargas innecesarias
 */
class ViewModelDescubrir : ViewModel() {

    // Mapa que guarda las películas de cada carrusel por su título
    private val _peliculasPorCarrusel = MutableStateFlow<Map<String, List<Movie>>>(emptyMap())
    val peliculasPorCarrusel: StateFlow<Map<String, List<Movie>>> = _peliculasPorCarrusel.asStateFlow()

    // Estado de carga para pull-to-refresh
    private val _cargando = MutableStateFlow(false)
    val cargando: StateFlow<Boolean> = _cargando.asStateFlow()

    /**
     * Carga películas para un carrusel específico si aún no las tiene
     */
    fun cargarCarrusel(titulo: String, generoId: String) {
        // Si ya tenemos películas para este carrusel, no hacer nada
        if (_peliculasPorCarrusel.value.containsKey(titulo)) {
            return
        }

        viewModelScope.launch {
            try {
                val paginaAleatoria = (1..20).random()
                val response = withContext(Dispatchers.IO) {
                    RetrofitClient.instance.buscarPeliculasporGenero(generoId, pagina = paginaAleatoria)
                }

                if (response.isSuccessful) {
                    val peliculas = (response.body()?.results ?: emptyList()) as List<Movie>

                    // Actualizamos el mapa agregando las nuevas películas
                    val mapaActualizado = _peliculasPorCarrusel.value.toMutableMap()
                    mapaActualizado[titulo] = peliculas
                    _peliculasPorCarrusel.value = mapaActualizado

                    Log.d("ViewModelDescubrir", "Carrusel '$titulo' cargado con ${peliculas.size} películas")
                }
            } catch (e: Exception) {
                Log.e("ViewModelDescubrir", "Error al cargar carrusel '$titulo'", e)
            }
        }
    }

    /**
     * Recarga TODOS los carruseles activos con películas nuevas
     * Se llama solo cuando el usuario hace pull-to-refresh
     */
    fun recargarTodosLosCarruseles(carruselesActivos: List<String>, obtenerIdGenero: (String) -> String) {
        _cargando.value = true

        viewModelScope.launch {
            try {
                val nuevoMapa = mutableMapOf<String, List<Movie>>()

                // Cargar cada carrusel activo con películas nuevas
                carruselesActivos.forEach { titulo ->
                    try {
                        val generoId = obtenerIdGenero(titulo)
                        val paginaAleatoria = (1..20).random()
                        val response = withContext(Dispatchers.IO) {
                            RetrofitClient.instance.buscarPeliculasporGenero(generoId, pagina = paginaAleatoria)
                        }

                        if (response.isSuccessful) {
                            val peliculas = (response.body()?.results ?: emptyList()) as List<Movie>
                            nuevoMapa[titulo] = peliculas
                        }
                    } catch (e: Exception) {
                        Log.e("ViewModelDescubrir", "Error al recargar carrusel '$titulo'", e)
                        // Mantener las películas anteriores si falla
                        _peliculasPorCarrusel.value[titulo]?.let { nuevoMapa[titulo] = it }
                    }
                }

                _peliculasPorCarrusel.value = nuevoMapa
                Log.d("ViewModelDescubrir", "Recarga completa: ${nuevoMapa.size} carruseles actualizados")

            } finally {
                _cargando.value = false
            }
        }
    }

    /**
     * Limpia las películas de un carrusel específico cuando se elimina
     */
    fun limpiarCarrusel(titulo: String) {
        val mapaActualizado = _peliculasPorCarrusel.value.toMutableMap()
        mapaActualizado.remove(titulo)
        _peliculasPorCarrusel.value = mapaActualizado
    }
}
