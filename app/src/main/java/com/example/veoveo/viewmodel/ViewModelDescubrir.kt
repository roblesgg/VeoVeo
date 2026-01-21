package com.example.veoveo.viewmodel

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

// maneja carruseles de descubrir
class ViewModelDescubrir : ViewModel() {

    // guarda peliculas de cada carrusel por titulo
    private val _peliculasPorCarrusel = MutableStateFlow<Map<String, List<Movie>>>(emptyMap())
    val peliculasPorCarrusel: StateFlow<Map<String, List<Movie>>> = _peliculasPorCarrusel.asStateFlow()

    // estado de carga para pull-to-refresh
    private val _cargando = MutableStateFlow(false)
    val cargando: StateFlow<Boolean> = _cargando.asStateFlow()

    // carga peliculas para un carrusel si aun no las tiene
    fun cargarCarrusel(titulo: String, generoId: String) {
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

                    val mapaActualizado = _peliculasPorCarrusel.value.toMutableMap()
                    mapaActualizado[titulo] = peliculas
                    _peliculasPorCarrusel.value = mapaActualizado
                }
            } catch (e: Exception) {
                // error silencioso
            }
        }
    }

    // recarga todos los carruseles activos con peliculas nuevas
    fun recargarTodosLosCarruseles(carruselesActivos: List<String>, obtenerIdGenero: (String) -> String) {
        _cargando.value = true

        viewModelScope.launch {
            try {
                val nuevoMapa = mutableMapOf<String, List<Movie>>()

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
                        _peliculasPorCarrusel.value[titulo]?.let { nuevoMapa[titulo] = it }
                    }
                }

                _peliculasPorCarrusel.value = nuevoMapa

            } finally {
                _cargando.value = false
            }
        }
    }

    // limpia peliculas de un carrusel cuando se elimina
    fun limpiarCarrusel(titulo: String) {
        val mapaActualizado = _peliculasPorCarrusel.value.toMutableMap()
        mapaActualizado.remove(titulo)
        _peliculasPorCarrusel.value = mapaActualizado
    }
}
