package com.example.veoveo.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.combinedClickable
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
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
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
import com.example.veoveo.model.TierList
import com.example.veoveo.viewmodel.ViewModelBiblioteca
import com.example.veoveo.viewmodel.ViewModelTierLists

// Paso 2: Organizar películas en tiers
@OptIn(ExperimentalFoundationApi::class)
@Composable
fun EditarTierListScreen(
    onVolverClick: () -> Unit = {},
    onGuardarClick: () -> Unit = {},
    viewModelBiblioteca: ViewModelBiblioteca = viewModel(),
    viewModelTierLists: ViewModelTierLists = viewModel()
) {
    val font = FontFamily(Font(R.font.montserrat_alternates_semibold, FontWeight.SemiBold))
    val brush = Brush.verticalGradient(listOf(Color(0xFF1A1A2E), Color(0xFF4B0082)))

    BackHandler(onBack = onVolverClick)

    val tierListActual by viewModelTierLists.tierListActual.collectAsState()
    val peliculasVistas by viewModelBiblioteca.peliculasVistas.collectAsState()
    val cargando by viewModelBiblioteca.cargando.collectAsState()

    val obraMaestra = remember { mutableStateListOf<Int>() }
    val muyBuena = remember { mutableStateListOf<Int>() }
    val buena = remember { mutableStateListOf<Int>() }
    val mala = remember { mutableStateListOf<Int>() }
    val nefasta = remember { mutableStateListOf<Int>() }
    val pool = remember { mutableStateListOf<Int>() }

    // Estado para selección
    var peliculaSeleccionada by remember { mutableIntStateOf(-1) }
    var mostrarDialogoMover by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        viewModelBiblioteca.cargarPeliculas()
    }

    LaunchedEffect(tierListActual, peliculasVistas) {
        tierListActual?.let { tier ->
            val esNueva = tier.id.isEmpty()

            if (esNueva) {
                pool.clear()
                pool.addAll(tier.todasLasPeliculas())
                obraMaestra.clear()
                muyBuena.clear()
                buena.clear()
                mala.clear()
                nefasta.clear()
            } else {
                obraMaestra.clear()
                obraMaestra.addAll(tier.tierObraMaestra)
                muyBuena.clear()
                muyBuena.addAll(tier.tierMuyBuena)
                buena.clear()
                buena.addAll(tier.tierBuena)
                mala.clear()
                mala.addAll(tier.tierMala)
                nefasta.clear()
                nefasta.addAll(tier.tierNefasta)

                val todasLasPeliculas = tier.todasLasPeliculas()
                pool.clear()
                pool.addAll(todasLasPeliculas.filter { id ->
                    !obraMaestra.contains(id) && !muyBuena.contains(id) &&
                    !buena.contains(id) && !mala.contains(id) && !nefasta.contains(id)
                })
            }
        }
    }

    val peliculasMap = remember(peliculasVistas) {
        peliculasVistas.associateBy { it.idPelicula }
    }

    Box(modifier = Modifier.fillMaxSize().background(brush)) {
        Column(modifier = Modifier.fillMaxSize().padding(top = 70.dp, start = 25.dp, end = 25.dp, bottom = 20.dp)) {
            Text(
                tierListActual?.nombre ?: "Organiza tu TierList",
                fontSize = 28.sp,
                color = Color.White,
                fontFamily = font,
                fontWeight = FontWeight.Bold
            )
            Spacer(Modifier.height(8.dp))
            Text("Pulsa una película para moverla a otro tier", fontSize = 14.sp, color = Color.Gray, fontFamily = font)
            Spacer(Modifier.height(24.dp))

            if (cargando) {
                Box(modifier = Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Color.White)
                }
            } else {
                Column(modifier = Modifier.weight(1f).fillMaxWidth().verticalScroll(rememberScrollState())) {
                    TierZoneClickable("Obra Maestra", obraMaestra, peliculasMap, font) { id ->
                        peliculaSeleccionada = id
                        mostrarDialogoMover = true
                    }
                    Spacer(Modifier.height(2.dp))

                    TierZoneClickable("Muy Buena", muyBuena, peliculasMap, font) { id ->
                        peliculaSeleccionada = id
                        mostrarDialogoMover = true
                    }
                    Spacer(Modifier.height(2.dp))

                    TierZoneClickable("Buena", buena, peliculasMap, font) { id ->
                        peliculaSeleccionada = id
                        mostrarDialogoMover = true
                    }
                    Spacer(Modifier.height(2.dp))

                    TierZoneClickable("Mala", mala, peliculasMap, font) { id ->
                        peliculaSeleccionada = id
                        mostrarDialogoMover = true
                    }
                    Spacer(Modifier.height(2.dp))

                    TierZoneClickable("Nefasta", nefasta, peliculasMap, font) { id ->
                        peliculaSeleccionada = id
                        mostrarDialogoMover = true
                    }
                    Spacer(Modifier.height(24.dp))

                    Column(modifier = Modifier.fillMaxWidth()) {
                        Text("Películas disponibles (${pool.size})", fontSize = 18.sp, color = Color.White, fontFamily = font, fontWeight = FontWeight.Bold)
                        Spacer(Modifier.height(12.dp))

                        if (pool.isEmpty()) {
                            Text(
                                "Todas las películas están organizadas",
                                fontSize = 14.sp,
                                color = Color.Gray,
                                fontFamily = font,
                                textAlign = TextAlign.Center,
                                modifier = Modifier.fillMaxWidth().padding(vertical = 32.dp)
                            )
                        } else {
                            LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                items(pool.toList()) { peliculaId ->
                                    val pelicula = peliculasMap[peliculaId]
                                    PeliculaClickable(pelicula, font) {
                                        peliculaSeleccionada = peliculaId
                                        mostrarDialogoMover = true
                                    }
                                }
                            }
                        }
                    }
                    Spacer(Modifier.height(24.dp))
                }
            }

            Button(
                onClick = {
                    tierListActual?.let { tier ->
                        val tierListActualizada = tier.copy(
                            tierObraMaestra = obraMaestra.toList(),
                            tierMuyBuena = muyBuena.toList(),
                            tierBuena = buena.toList(),
                            tierMala = mala.toList(),
                            tierNefasta = nefasta.toList()
                        )

                        if (tier.id.isEmpty()) {
                            viewModelTierLists.crearTierList(tierListActualizada) {
                                onGuardarClick()
                            }
                        } else {
                            viewModelTierLists.actualizarTierList(tierListActualizada) {
                                onGuardarClick()
                            }
                        }
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF6C63FF)),
                modifier = Modifier.fillMaxWidth().height(56.dp)
            ) {
                Text("Guardar TierList", color = Color.White, fontFamily = font, fontSize = 18.sp)
            }
        }

        IconButton(
            onClick = onVolverClick,
            modifier = Modifier.align(Alignment.TopStart).padding(start = 20.dp, top = 25.dp)
        ) {
            Icon(Icons.AutoMirrored.Filled.ArrowBack, "volver", tint = Color.White, modifier = Modifier.size(28.dp))
        }
    }

    // Diálogo para mover película
    if (mostrarDialogoMover && peliculaSeleccionada != -1) {
        val pelicula = peliculasMap[peliculaSeleccionada]
        AlertDialog(
            onDismissRequest = { mostrarDialogoMover = false },
            title = { Text("Mover película", fontFamily = font) },
            text = {
                Column {
                    Text("¿A qué tier quieres mover '${pelicula?.titulo}'?", fontFamily = font)
                }
            },
            confirmButton = {
                Column(modifier = Modifier.fillMaxWidth()) {
                    TextButton(
                        onClick = {
                            obraMaestra.remove(peliculaSeleccionada)
                            muyBuena.remove(peliculaSeleccionada)
                            buena.remove(peliculaSeleccionada)
                            mala.remove(peliculaSeleccionada)
                            nefasta.remove(peliculaSeleccionada)
                            pool.remove(peliculaSeleccionada)
                            obraMaestra.add(peliculaSeleccionada)
                            mostrarDialogoMover = false
                        },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Obra Maestra", fontFamily = font)
                    }
                    TextButton(
                        onClick = {
                            obraMaestra.remove(peliculaSeleccionada)
                            muyBuena.remove(peliculaSeleccionada)
                            buena.remove(peliculaSeleccionada)
                            mala.remove(peliculaSeleccionada)
                            nefasta.remove(peliculaSeleccionada)
                            pool.remove(peliculaSeleccionada)
                            muyBuena.add(peliculaSeleccionada)
                            mostrarDialogoMover = false
                        },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Muy Buena", fontFamily = font)
                    }
                    TextButton(
                        onClick = {
                            obraMaestra.remove(peliculaSeleccionada)
                            muyBuena.remove(peliculaSeleccionada)
                            buena.remove(peliculaSeleccionada)
                            mala.remove(peliculaSeleccionada)
                            nefasta.remove(peliculaSeleccionada)
                            pool.remove(peliculaSeleccionada)
                            buena.add(peliculaSeleccionada)
                            mostrarDialogoMover = false
                        },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Buena", fontFamily = font)
                    }
                    TextButton(
                        onClick = {
                            obraMaestra.remove(peliculaSeleccionada)
                            muyBuena.remove(peliculaSeleccionada)
                            buena.remove(peliculaSeleccionada)
                            mala.remove(peliculaSeleccionada)
                            nefasta.remove(peliculaSeleccionada)
                            pool.remove(peliculaSeleccionada)
                            mala.add(peliculaSeleccionada)
                            mostrarDialogoMover = false
                        },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Mala", fontFamily = font)
                    }
                    TextButton(
                        onClick = {
                            obraMaestra.remove(peliculaSeleccionada)
                            muyBuena.remove(peliculaSeleccionada)
                            buena.remove(peliculaSeleccionada)
                            mala.remove(peliculaSeleccionada)
                            nefasta.remove(peliculaSeleccionada)
                            pool.remove(peliculaSeleccionada)
                            nefasta.add(peliculaSeleccionada)
                            mostrarDialogoMover = false
                        },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Nefasta", fontFamily = font)
                    }
                }
            },
            dismissButton = {
                TextButton(onClick = { mostrarDialogoMover = false }) {
                    Text("Cancelar", fontFamily = font)
                }
            }
        )
    }
}

@Composable
fun PeliculaClickable(
    pelicula: PeliculaUsuario?,
    font: FontFamily,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier.width(80.dp).aspectRatio(0.67f),
        shape = RoundedCornerShape(8.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF2A2A3E)),
        onClick = onClick
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
                    fontSize = 12.sp,
                    fontFamily = font,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(8.dp)
                )
            }
        }
    }
}

@Composable
fun TierZoneClickable(
    titulo: String,
    peliculas: MutableList<Int>,
    peliculasMap: Map<Int, PeliculaUsuario>,
    font: FontFamily,
    onPeliculaClick: (Int) -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth().height(110.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier.width(90.dp).fillMaxHeight().background(Color(0xFF3D2A54)),
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
            modifier = Modifier
                .weight(1f)
                .fillMaxHeight()
                .background(Color.Black.copy(alpha = 0.3f))
                .padding(8.dp)
        ) {
            if (peliculas.isEmpty()) {
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
                    items(peliculas.toList()) { peliculaId ->
                        val pelicula = peliculasMap[peliculaId]
                        PeliculaClickable(pelicula, font) {
                            onPeliculaClick(peliculaId)
                        }
                    }
                }
            }
        }
    }
}
