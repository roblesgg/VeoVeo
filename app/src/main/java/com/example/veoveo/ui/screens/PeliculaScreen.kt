package com.example.veoveo.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.example.veoveo.R
import com.example.veoveo.conexion.RetrofitClient
import com.example.veoveo.model.CastMember
import com.example.veoveo.model.MovieDetails
import com.example.veoveo.viewmodel.ViewModelBiblioteca
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

// pantalla de detalle de una pelicula con informacion completa
@Composable
fun PeliculaScreen(
    movieId: Int,
    onVolverClick: () -> Unit = {},
    viewModel: ViewModelBiblioteca = viewModel()
) {

    // fuente personalizada montserrat
    val font = FontFamily(Font(R.font.montserrat_alternates_semibold, FontWeight.SemiBold))

    // degradado de fondo morado oscuro
    val brush = Brush.verticalGradient(listOf(Color(0xFF1A1A2E), Color(0xFF4B0082)))

    // estados de carga
    var cargando by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var movieDetails by remember { mutableStateOf<MovieDetails?>(null) }
    var reparto by remember { mutableStateOf<List<CastMember>>(emptyList()) }

    // coroutine scope para llamadas a la API
    val scope = rememberCoroutineScope()

    // controla si cada seccion esta expandida o colapsada
    var descripcionExpandida by remember { mutableStateOf(false) }
    var repartoExpandido by remember { mutableStateOf(false) }
    var puntuacionExpandida by remember { mutableStateOf(false) }

    // Estado para el diálogo de valoración
    var mostrarDialogoValoracion by remember { mutableStateOf(false) }

    // Cargar películas del usuario para verificar el estado
    val peliculasPorVer by viewModel.peliculasPorVer.collectAsState()
    val peliculasVistas by viewModel.peliculasVistas.collectAsState()

    // Determinar el estado actual de la película (recalcula cuando cambian las listas)
    val peliculaEnBiblioteca = remember(peliculasPorVer, peliculasVistas, movieId) {
        peliculasPorVer.find { it.idPelicula == movieId } ?: peliculasVistas.find { it.idPelicula == movieId }
    }

    val estadoPelicula = remember(peliculasPorVer, peliculasVistas, movieId) {
        when {
            peliculasPorVer.any { it.idPelicula == movieId } -> 1
            peliculasVistas.any { it.idPelicula == movieId } -> 2
            else -> 0
        }
    }

    // DESHABILITADO TEMPORALMENTE: Cargar películas al iniciar
    // Comentado porque Firebase no está conectado y causa bloqueos
    // LaunchedEffect(Unit) {
    //     viewModel.cargarPeliculas()
    // }

    // Recargar cuando cambien las listas
    LaunchedEffect(peliculasPorVer, peliculasVistas) {
        // Forzar recomposición cuando cambien las listas
    }

    // cargar datos de la API cuando se monta el componente
    LaunchedEffect(movieId) {
        cargando = true
        error = null

        scope.launch {
            try {
                // llamadas a la API en paralelo
                val detallesResponse = withContext(Dispatchers.IO) {
                    RetrofitClient.instance.obtenerDetallesPelicula(movieId)
                }

                val creditosResponse = withContext(Dispatchers.IO) {
                    RetrofitClient.instance.obtenerCreditosPelicula(movieId)
                }

                if (detallesResponse.isSuccessful && detallesResponse.body() != null) {
                    movieDetails = detallesResponse.body()
                } else {
                    error = "No se pudieron cargar los detalles de la película"
                }

                if (creditosResponse.isSuccessful && creditosResponse.body() != null) {
                    // tomamos solo los primeros 10 actores para no sobrecargar la pantalla
                    reparto = creditosResponse.body()!!.cast.take(10)
                }

                cargando = false
            } catch (e: Exception) {
                error = "Error al cargar la película: ${e.message}"
                cargando = false
            }
        }
    }

    // maneja el boton atras del dispositivo
    BackHandler(onBack = onVolverClick)

    // caja principal con degradado de fondo
    Box(modifier = Modifier.fillMaxSize().background(brush)) {

        // mostrar loading, error, o contenido
        when {
            cargando -> {
                // pantalla de carga
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(
                        color = Color.White,
                        modifier = Modifier.size(50.dp)
                    )
                }
            }
            error != null -> {
                // pantalla de error
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = "Error",
                            fontSize = 24.sp,
                            color = Color.White,
                            fontFamily = font,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(Modifier.height(16.dp))
                        Text(
                            text = error ?: "Error desconocido",
                            fontSize = 14.sp,
                            color = Color.White.copy(alpha = 0.8f),
                            fontFamily = font,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(horizontal = 40.dp)
                        )
                        Spacer(Modifier.height(24.dp))
                        Button(
                            onClick = onVolverClick,
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF6C63FF))
                        ) {
                            Text("Volver", fontFamily = font)
                        }
                    }
                }
            }
            movieDetails != null -> {
                // columna con scroll para todo el contenido
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .verticalScroll(rememberScrollState())
                        .padding(top = 70.dp, start = 25.dp, end = 25.dp, bottom = 30.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {

                    // caratula de la pelicula con imagen real desde TMDB
                    Card(
                        modifier = Modifier.width(200.dp).height(300.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF2A2A3E))
                    ) {
                        if (movieDetails!!.posterPath != null) {
                            AsyncImage(
                                model = "https://image.tmdb.org/t/p/w500${movieDetails!!.posterPath}",
                                contentDescription = "Carátula de ${movieDetails!!.title}",
                                contentScale = ContentScale.Crop,
                                modifier = Modifier.fillMaxSize()
                            )
                        } else {
                            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                                Text(
                                    "Sin carátula",
                                    color = Color.White,
                                    fontSize = 16.sp,
                                    fontFamily = font,
                                    textAlign = TextAlign.Center
                                )
                            }
                        }
                    }

                    Spacer(Modifier.height(24.dp))

                    // titulo de la pelicula
                    Text(
                        movieDetails!!.title,
                        fontSize = 28.sp,
                        color = Color.White,
                        fontFamily = font,
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center
                    )

                    // año de lanzamiento y duración
                    if (movieDetails!!.releaseDate != null || movieDetails!!.runtime != null) {
                        Spacer(Modifier.height(8.dp))
                        Row(
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            if (movieDetails!!.releaseDate != null && movieDetails!!.releaseDate!!.isNotEmpty()) {
                                Text(
                                    movieDetails!!.releaseDate!!.split("-")[0], // solo el año
                                    fontSize = 14.sp,
                                    color = Color.White.copy(alpha = 0.7f),
                                    fontFamily = font
                                )
                            }
                            if (movieDetails!!.runtime != null && movieDetails!!.runtime!! > 0) {
                                if (movieDetails!!.releaseDate != null && movieDetails!!.releaseDate!!.isNotEmpty()) {
                                    Text(
                                        " • ",
                                        fontSize = 14.sp,
                                        color = Color.White.copy(alpha = 0.7f),
                                        fontFamily = font
                                    )
                                }
                                Text(
                                    "${movieDetails!!.runtime} min",
                                    fontSize = 14.sp,
                                    color = Color.White.copy(alpha = 0.7f),
                                    fontFamily = font
                                )
                            }
                        }
                    }

                    // géneros
                    if (movieDetails!!.genres.isNotEmpty()) {
                        Spacer(Modifier.height(12.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.Center
                        ) {
                            movieDetails!!.genres.take(3).forEach { genre ->
                                Card(
                                    modifier = Modifier.padding(horizontal = 4.dp),
                                    shape = RoundedCornerShape(20.dp),
                                    colors = CardDefaults.cardColors(
                                        containerColor = Color(0xFF6C63FF).copy(alpha = 0.3f)
                                    )
                                ) {
                                    Text(
                                        genre.name,
                                        fontSize = 12.sp,
                                        color = Color.White,
                                        fontFamily = font,
                                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                                    )
                                }
                            }
                        }
                    }

            Spacer(Modifier.height(24.dp))

            // botones para anadir a por ver o marcar como vista
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // boton por ver
                Button(
                    onClick = {
                        if (estadoPelicula == 1) {
                            // Eliminar de "Por Ver"
                            viewModel.eliminarPelicula(movieId)
                        } else {
                            // Añadir a "Por Ver"
                            if (estadoPelicula == 2) {
                                // Si está en "Vista", primero eliminarla
                                viewModel.eliminarPelicula(movieId)
                            }
                            viewModel.agregarAPorVer(
                                idPelicula = movieId,
                                titulo = movieDetails?.title ?: "",
                                rutaPoster = movieDetails?.posterPath
                            )
                        }
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (estadoPelicula == 1) Color(0xFF6C63FF) else Color(0xFF2A2A3E)
                    ),
                    modifier = Modifier.weight(1f).height(70.dp)
                ) {
                    if (estadoPelicula == 1) {
                        Icon(Icons.Default.Check, null, tint = Color.White, modifier = Modifier.size(20.dp))
                        Spacer(Modifier.width(8.dp))
                    }
                    Text(
                        if (estadoPelicula == 1) "En Por Ver" else "Anadir a Por Ver",
                        color = Color.White,
                        fontFamily = font,
                        fontSize = 14.sp
                    )
                }

                // boton vista
                Button(
                    onClick = {
                        if (estadoPelicula == 2) {
                            // Eliminar de "Vista"
                            viewModel.eliminarPelicula(movieId)
                        } else {
                            // Marcar como vista
                            if (estadoPelicula == 1) {
                                // Si está en "Por Ver", cambiar el estado
                                viewModel.marcarComoVista(movieId)
                            } else {
                                // Si no está en la biblioteca, agregarla directamente como vista
                                viewModel.agregarAVistas(
                                    idPelicula = movieId,
                                    titulo = movieDetails?.title ?: "",
                                    rutaPoster = movieDetails?.posterPath
                                )
                            }
                            mostrarDialogoValoracion = true
                        }
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (estadoPelicula == 2) Color(0xFF4CAF50) else Color(0xFF2A2A3E)
                    ),
                    modifier = Modifier.weight(1f).height(70.dp)
                ) {
                    if (estadoPelicula == 2) {
                        Icon(Icons.Default.Check, null, tint = Color.White, modifier = Modifier.size(20.dp))
                        Spacer(Modifier.width(8.dp))
                    }
                    Text(
                        if (estadoPelicula == 2) "Marcada Vista" else "Marcar como Vista",
                        color = Color.White,
                        fontFamily = font,
                        fontSize = 14.sp
                    )
                }
            }

            // Botón para cambiar valoración si ya está marcada como vista
            if (estadoPelicula == 2 && peliculaEnBiblioteca != null) {
                Spacer(Modifier.height(12.dp))
                Button(
                    onClick = { mostrarDialogoValoracion = true },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFFFFD700).copy(alpha = 0.3f)
                    ),
                    modifier = Modifier.fillMaxWidth().height(50.dp)
                ) {
                    Icon(Icons.Default.Star, null, tint = Color(0xFFFFD700), modifier = Modifier.size(20.dp))
                    Spacer(Modifier.width(8.dp))
                    Text(
                        if (peliculaEnBiblioteca.valoracion > 0) "Cambiar Valoracion (${peliculaEnBiblioteca.valoracion} ⭐)" else "Valorar Pelicula",
                        color = Color.White,
                        fontFamily = font,
                        fontSize = 14.sp
                    )
                }
            }

            Spacer(Modifier.height(32.dp))

            // seccion descripcion
            SeccionDesplegable(
                titulo = "Descripcion",
                expandida = descripcionExpandida,
                onToggle = { descripcionExpandida = !descripcionExpandida },
                font = font
            ) {
                Text(
                    if (movieDetails!!.overview.isNotEmpty()) movieDetails!!.overview else "No hay descripción disponible",
                    fontSize = 14.sp,
                    color = Color.White.copy(alpha = 0.9f),
                    fontFamily = font,
                    lineHeight = 20.sp,
                    modifier = Modifier.padding(16.dp)
                )
            }

            Spacer(Modifier.height(12.dp))

            // seccion reparto
            SeccionDesplegable(
                titulo = "Reparto",
                expandida = repartoExpandido,
                onToggle = { repartoExpandido = !repartoExpandido },
                font = font
            ) {
                if (reparto.isEmpty()) {
                    Text(
                        "No hay información del reparto disponible",
                        fontSize = 14.sp,
                        color = Color.White.copy(alpha = 0.6f),
                        fontFamily = font,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(16.dp)
                    )
                } else {
                    Column(modifier = Modifier.padding(16.dp)) {
                        reparto.forEach { actor ->
                            Text(
                                "• ${actor.name} (${actor.character})",
                                fontSize = 14.sp,
                                color = Color.White.copy(alpha = 0.9f),
                                fontFamily = font,
                                modifier = Modifier.padding(vertical = 4.dp)
                            )
                        }
                    }
                }
            }

            Spacer(Modifier.height(12.dp))

            // seccion puntuacion
            SeccionDesplegable(
                titulo = "Puntuacion Media",
                expandida = puntuacionExpandida,
                onToggle = { puntuacionExpandida = !puntuacionExpandida },
                font = font
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.Star,
                            contentDescription = "estrella",
                            tint = Color(0xFFFFD700),
                            modifier = Modifier.size(40.dp)
                        )
                        Spacer(Modifier.width(8.dp))
                        Text(
                            String.format("%.1f", movieDetails!!.voteAverage),
                            fontSize = 36.sp,
                            color = Color.White,
                            fontFamily = font,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            "/10",
                            fontSize = 20.sp,
                            color = Color.White.copy(alpha = 0.7f),
                            fontFamily = font,
                            modifier = Modifier.padding(top = 8.dp)
                        )
                    }
                    Spacer(Modifier.height(8.dp))
                    Text(
                        "${movieDetails!!.voteCount} votos",
                        fontSize = 12.sp,
                        color = Color.White.copy(alpha = 0.6f),
                        fontFamily = font
                    )
                }
            }

            Spacer(Modifier.height(32.dp))
                }
            }
        }

        // Diálogo de valoración
        if (mostrarDialogoValoracion) {
            DialogoValorarPelicula(
                tituloPelicula = movieDetails?.title ?: "",
                onDismiss = {
                    mostrarDialogoValoracion = false
                },
                onValorar = { valoracion ->
                    viewModel.actualizarValoracion(movieId, valoracion)
                    mostrarDialogoValoracion = false
                },
                font = font
            )
        }

        // boton de volver arriba izquierda (siempre visible)
        IconButton(
            onClick = onVolverClick,
            modifier = Modifier
                .align(Alignment.TopStart)
                .padding(start = 20.dp, top = 25.dp)
        ) {
            Icon(
                Icons.AutoMirrored.Filled.ArrowBack,
                contentDescription = "volver",
                tint = Color.White,
                modifier = Modifier.size(28.dp)
            )
        }
    }
}

// componente reutilizable para secciones desplegables
@Composable
fun SeccionDesplegable(
    titulo: String,
    expandida: Boolean,
    onToggle: () -> Unit,
    font: FontFamily,
    contenido: @Composable () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF2A2A3E))
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {

            // cabecera clickable para expandir/contraer
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onToggle() }
                    .padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    titulo,
                    fontSize = 18.sp,
                    color = Color.White,
                    fontFamily = font,
                    fontWeight = FontWeight.Bold
                )
                Icon(
                    if (expandida) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                    contentDescription = if (expandida) "contraer" else "expandir",
                    tint = Color.White,
                    modifier = Modifier.size(24.dp)
                )
            }

            // contenido que se muestra solo si esta expandida
            if (expandida) {
                contenido()
            }
        }
    }
}

// vista previa
@androidx.compose.ui.tooling.preview.Preview(showBackground = true)
@Composable
fun PeliculaScreenPreview() {
    // ID de una película popular para preview (550 = Fight Club)
    PeliculaScreen(movieId = 550)
}
