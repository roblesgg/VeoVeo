package com.example.veoveo.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
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
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.example.veoveo.R
import com.example.veoveo.model.PeliculaUsuario
import com.example.veoveo.viewmodel.ViewModelBiblioteca
import com.example.veoveo.viewmodel.ViewModelTierLists

// Pantalla que muestra una TierList específica con sus franjas
@Composable
fun TierListScreen(
    onVolverClick: () -> Unit = {},
    onEditarClick: () -> Unit = {},
    onEliminarClick: () -> Unit = {},
    onPeliculaClick: (Int) -> Unit = {},
    viewModelTierLists: ViewModelTierLists = viewModel(),
    viewModelBiblioteca: ViewModelBiblioteca = viewModel()
) {
    val font = FontFamily(Font(R.font.montserrat_alternates_semibold, FontWeight.SemiBold))
    val brush = Brush.verticalGradient(listOf(Color(0xFF1A1A2E), Color(0xFF4B0082)))

    BackHandler(onBack = onVolverClick)

    // Obtener TierList actual del ViewModel
    val tierListActual by viewModelTierLists.tierListActual.collectAsState()
    val peliculasVistas by viewModelBiblioteca.peliculasVistas.collectAsState()
    val cargando by viewModelBiblioteca.cargando.collectAsState()
    val cargandoTier by viewModelTierLists.cargando.collectAsState()

    // Estado para el diálogo de confirmación de eliminación
    var mostrarDialogoEliminar by remember { mutableStateOf(false) }

    // Cargar películas vistas
    LaunchedEffect(Unit) {
        viewModelBiblioteca.cargarPeliculas()
    }

    // Crear mapa de películas por ID para acceso rápido
    val peliculasMap = remember(peliculasVistas) {
        peliculasVistas.associateBy { it.idPelicula }
    }

    Box(modifier = Modifier.fillMaxSize().background(brush)) {
        if (cargando || cargandoTier) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Color.White)
            }
        } else {
            tierListActual?.let { tierList ->
                Column(
                    modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState())
                        .padding(top = 70.dp, bottom = 20.dp, start = 25.dp, end = 25.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Imagen de portada (mostrar primera película o placeholder)
                    Card(
                        modifier = Modifier.width(200.dp).aspectRatio(0.67f),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF2A2A3E))
                    ) {
                        val primerasPeliculas = tierList.todasLasPeliculas().take(4)
                        if (primerasPeliculas.isNotEmpty()) {
                            Box(modifier = Modifier.fillMaxSize()) {
                                // Mostrar grid 2x2 con las primeras 4 películas
                                Row(modifier = Modifier.fillMaxSize()) {
                                    Column(modifier = Modifier.weight(1f).fillMaxHeight()) {
                                        primerasPeliculas.getOrNull(0)?.let { id ->
                                            peliculasMap[id]?.rutaPoster?.let { poster ->
                                                AsyncImage(
                                                    model = "https://image.tmdb.org/t/p/w200$poster",
                                                    contentDescription = null,
                                                    contentScale = ContentScale.Crop,
                                                    modifier = Modifier.weight(1f).fillMaxWidth()
                                                )
                                            }
                                        }
                                        primerasPeliculas.getOrNull(1)?.let { id ->
                                            peliculasMap[id]?.rutaPoster?.let { poster ->
                                                AsyncImage(
                                                    model = "https://image.tmdb.org/t/p/w200$poster",
                                                    contentDescription = null,
                                                    contentScale = ContentScale.Crop,
                                                    modifier = Modifier.weight(1f).fillMaxWidth()
                                                )
                                            }
                                        }
                                    }
                                    Column(modifier = Modifier.weight(1f).fillMaxHeight()) {
                                        primerasPeliculas.getOrNull(2)?.let { id ->
                                            peliculasMap[id]?.rutaPoster?.let { poster ->
                                                AsyncImage(
                                                    model = "https://image.tmdb.org/t/p/w200$poster",
                                                    contentDescription = null,
                                                    contentScale = ContentScale.Crop,
                                                    modifier = Modifier.weight(1f).fillMaxWidth()
                                                )
                                            }
                                        }
                                        primerasPeliculas.getOrNull(3)?.let { id ->
                                            peliculasMap[id]?.rutaPoster?.let { poster ->
                                                AsyncImage(
                                                    model = "https://image.tmdb.org/t/p/w200$poster",
                                                    contentDescription = null,
                                                    contentScale = ContentScale.Crop,
                                                    modifier = Modifier.weight(1f).fillMaxWidth()
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                                Text(
                                    tierList.nombre,
                                    color = Color.White,
                                    fontSize = 18.sp,
                                    fontFamily = font,
                                    textAlign = TextAlign.Center,
                                    modifier = Modifier.padding(16.dp)
                                )
                            }
                        }
                    }
                    Spacer(Modifier.height(24.dp))

                    Text(
                        tierList.nombre,
                        fontSize = 28.sp,
                        color = Color.White,
                        fontFamily = font,
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center
                    )

                    if (tierList.descripcion.isNotEmpty()) {
                        Spacer(Modifier.height(8.dp))
                        Text(
                            tierList.descripcion,
                            fontSize = 14.sp,
                            color = Color.Gray,
                            fontFamily = font,
                            textAlign = TextAlign.Center
                        )
                    }

                    Spacer(Modifier.height(8.dp))
                    Text(
                        "${tierList.cantidadPeliculas()} películas",
                        fontSize = 14.sp,
                        color = Color.Gray,
                        fontFamily = font,
                        textAlign = TextAlign.Center
                    )

                    Spacer(Modifier.height(32.dp))

                    TierRow("Obra Maestra", Color(0xFF3D2A54), tierList.tierObraMaestra, peliculasMap, font, onPeliculaClick)
                    Spacer(Modifier.height(2.dp))
                    TierRow("Muy Buena", Color(0xFF3D2A54), tierList.tierMuyBuena, peliculasMap, font, onPeliculaClick)
                    Spacer(Modifier.height(2.dp))
                    TierRow("Buena", Color(0xFF3D2A54), tierList.tierBuena, peliculasMap, font, onPeliculaClick)
                    Spacer(Modifier.height(2.dp))
                    TierRow("Mala", Color(0xFF3D2A54), tierList.tierMala, peliculasMap, font, onPeliculaClick)
                    Spacer(Modifier.height(2.dp))
                    TierRow("Nefasta", Color(0xFF3D2A54), tierList.tierNefasta, peliculasMap, font, onPeliculaClick)
                    Spacer(Modifier.height(32.dp))

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        Button(
                            onClick = {
                                viewModelTierLists.setTierListActual(tierList)
                                onEditarClick()
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF6C63FF)),
                            modifier = Modifier.weight(1f).height(50.dp)
                        ) {
                            Icon(Icons.Default.Edit, "editar", tint = Color.White)
                            Spacer(Modifier.width(8.dp))
                            Text("Editar", color = Color.White, fontFamily = font, fontSize = 16.sp)
                        }
                        Button(
                            onClick = { mostrarDialogoEliminar = true },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFF5252)),
                            modifier = Modifier.weight(1f).height(50.dp)
                        ) {
                            Icon(Icons.Default.Delete, "eliminar", tint = Color.White)
                            Spacer(Modifier.width(8.dp))
                            Text("Eliminar", color = Color.White, fontFamily = font, fontSize = 16.sp)
                        }
                    }
                }
            } ?: run {
                // Si no hay TierList cargada
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(
                        "No se encontró la TierList",
                        color = Color.White,
                        fontSize = 18.sp,
                        fontFamily = font
                    )
                }
            }
        }

        IconButton(
            onClick = onVolverClick,
            modifier = Modifier.align(Alignment.TopStart).padding(start = 20.dp, top = 25.dp)
        ) {
            Icon(Icons.AutoMirrored.Filled.ArrowBack, "volver", tint = Color.White, modifier = Modifier.size(28.dp))
        }
    }

    // Diálogo de confirmación de eliminación
    if (mostrarDialogoEliminar) {
        AlertDialog(
            onDismissRequest = { mostrarDialogoEliminar = false },
            title = { Text("Eliminar TierList", fontFamily = font) },
            text = { Text("¿Estás seguro de que quieres eliminar esta TierList? Esta acción no se puede deshacer.", fontFamily = font) },
            confirmButton = {
                TextButton(
                    onClick = {
                        tierListActual?.let { tierList ->
                            viewModelTierLists.eliminarTierList(tierList.id) {
                                mostrarDialogoEliminar = false
                                onEliminarClick()
                            }
                        }
                    }
                ) {
                    Text("Eliminar", color = Color.Red, fontFamily = font)
                }
            },
            dismissButton = {
                TextButton(onClick = { mostrarDialogoEliminar = false }) {
                    Text("Cancelar", fontFamily = font)
                }
            }
        )
    }
}

// Componente que muestra una fila de tier con título y películas
@Composable
fun TierRow(
    titulo: String,
    colorFondo: Color,
    peliculasIds: List<Int>,
    peliculasMap: Map<Int, PeliculaUsuario>,
    font: FontFamily,
    onPeliculaClick: (Int) -> Unit = {}
) {
    Row(
        modifier = Modifier.fillMaxWidth().height(110.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier.width(90.dp).fillMaxHeight().background(colorFondo),
            contentAlignment = Alignment.CenterStart
        ) {
            Text(
                titulo,
                fontSize = 14.sp,
                fontFamily = font,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                modifier = Modifier.padding(start = 8.dp)
            )
        }

        Box(
            modifier = Modifier.weight(1f).fillMaxHeight().background(Color.Black.copy(alpha = 0.3f)).padding(8.dp)
        ) {
            if (peliculasIds.isEmpty()) {
                Text(
                    "Vacío",
                    color = Color.Gray,
                    fontSize = 12.sp,
                    fontFamily = font,
                    modifier = Modifier.align(Alignment.Center)
                )
            } else {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.fillMaxHeight()
                ) {
                    items(peliculasIds) { peliculaId ->
                        val pelicula = peliculasMap[peliculaId]
                        Card(
                            modifier = Modifier.width(60.dp).aspectRatio(0.67f).clickable {
                                onPeliculaClick(peliculaId)
                            },
                            shape = RoundedCornerShape(4.dp),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFF2A2A3E))
                        ) {
                            if (pelicula?.rutaPoster != null) {
                                AsyncImage(
                                    model = "https://image.tmdb.org/t/p/w200${pelicula.rutaPoster}",
                                    contentDescription = pelicula.titulo,
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier.fillMaxSize()
                                )
                            } else {
                                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                                    Text(
                                        pelicula?.titulo ?: "?",
                                        color = Color.White,
                                        fontSize = 9.sp,
                                        fontFamily = font,
                                        textAlign = TextAlign.Center,
                                        modifier = Modifier.padding(4.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
