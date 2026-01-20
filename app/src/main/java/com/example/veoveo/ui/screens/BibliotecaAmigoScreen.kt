package com.example.veoveo.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
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
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.example.veoveo.R
import com.example.veoveo.model.PeliculaUsuario
import com.example.veoveo.viewmodel.ViewModelSocial
import com.example.veoveo.data.RepositorioUsuarios
import kotlinx.coroutines.launch

@Composable
fun BibliotecaAmigoScreen(
    amigoUid: String,
    onVolverClick: () -> Unit = {},
    onPeliculaClick: (Int) -> Unit = {},
    viewModel: ViewModelSocial = viewModel()
) {
    // Estados
    val peliculasAmigo by viewModel.peliculasAmigo.collectAsState()
    val cargando by viewModel.cargando.collectAsState()
    val mensaje by viewModel.mensaje.collectAsState()
    val error by viewModel.error.collectAsState()

    // Datos del amigo
    var nombreAmigo by remember { mutableStateOf("Amigo") }
    var fotoAmigo by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()
    val repositorioUsuarios = remember { RepositorioUsuarios() }

    // Filtro
    var filtroSeleccionado by remember { mutableStateOf(0) } // 0: Todas, 1: Por Ver, 2: Vistas

    // Diálogos de confirmación
    var mostrarDialogoCancelarAmistad by remember { mutableStateOf(false) }
    var mostrarDialogoBloquear by remember { mutableStateOf(false) }

    // Cargar datos
    LaunchedEffect(amigoUid) {
        viewModel.cargarPeliculasAmigo(amigoUid)

        // Cargar datos del amigo
        scope.launch {
            val resultado = repositorioUsuarios.obtenerUsuarioPorUid(amigoUid)
            if (resultado.isSuccess) {
                val amigo = resultado.getOrNull()
                nombreAmigo = amigo?.username ?: "Amigo"
                fotoAmigo = amigo?.fotoPerfil
            }
        }
    }

    BackHandler(onBack = onVolverClick)

    // Fuente
    val font = FontFamily(Font(R.font.montserrat_alternates_semibold, FontWeight.SemiBold))

    // Degradado
    val brush = Brush.verticalGradient(listOf(Color(0xFF1A1A2E), Color(0xFF4B0082)))

    // Filtrar películas
    val peliculasFiltradas = remember(peliculasAmigo, filtroSeleccionado) {
        when (filtroSeleccionado) {
            1 -> peliculasAmigo.filter { it.estado == "por_ver" }
            2 -> peliculasAmigo.filter { it.estado == "vista" }
            else -> peliculasAmigo
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(brush)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp)
        ) {
            Spacer(modifier = Modifier.height(60.dp))

            // Foto y nombre del amigo
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                if (fotoAmigo != null) {
                    AsyncImage(
                        model = fotoAmigo,
                        contentDescription = "Foto",
                        contentScale = ContentScale.Crop,
                        modifier = Modifier
                            .size(80.dp)
                            .clip(CircleShape)
                            .border(3.dp, Color.White, CircleShape)
                    )
                } else {
                    Image(
                        painter = painterResource(R.drawable.ic_perfil),
                        contentDescription = "Foto",
                        contentScale = ContentScale.Crop,
                        modifier = Modifier
                            .size(80.dp)
                            .clip(CircleShape)
                            .border(3.dp, Color.White, CircleShape)
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = nombreAmigo,
                    fontSize = 24.sp,
                    color = Color.White,
                    fontFamily = font,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = "${peliculasAmigo.size} películas",
                    fontSize = 14.sp,
                    color = Color.White.copy(alpha = 0.7f),
                    fontFamily = font
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Filtros
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                FilterChip(
                    selected = filtroSeleccionado == 0,
                    onClick = { filtroSeleccionado = 0 },
                    label = { Text("Todas", fontFamily = font) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = Color(0xFF6C63FF),
                        selectedLabelColor = Color.White
                    )
                )

                FilterChip(
                    selected = filtroSeleccionado == 1,
                    onClick = { filtroSeleccionado = 1 },
                    label = { Text("Por Ver", fontFamily = font) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = Color(0xFF6C63FF),
                        selectedLabelColor = Color.White
                    )
                )

                FilterChip(
                    selected = filtroSeleccionado == 2,
                    onClick = { filtroSeleccionado = 2 },
                    label = { Text("Vistas", fontFamily = font) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = Color(0xFF4CAF50),
                        selectedLabelColor = Color.White
                    )
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Botones de acción
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Botón cancelar amistad
                Button(
                    onClick = { mostrarDialogoCancelarAmistad = true },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFF9800)),
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(
                        Icons.Default.Person,
                        contentDescription = "Cancelar amistad",
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Cancelar amistad", fontFamily = font, fontSize = 14.sp)
                }

                // Botón bloquear
                Button(
                    onClick = { mostrarDialogoBloquear = true },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFF5252)),
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(
                        Icons.Default.Close,
                        contentDescription = "Bloquear",
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Bloquear", fontFamily = font, fontSize = 14.sp)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Mensajes
            mensaje?.let {
                Text(
                    text = it,
                    color = Color(0xFF4CAF50),
                    fontSize = 14.sp,
                    fontFamily = font,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth()
                )
                LaunchedEffect(it) {
                    kotlinx.coroutines.delay(2000)
                    viewModel.limpiarMensajes()
                    onVolverClick() // Volver a la pantalla anterior después de la acción
                }
                Spacer(modifier = Modifier.height(12.dp))
            }

            error?.let {
                Text(
                    text = it,
                    color = Color(0xFFFF5252),
                    fontSize = 14.sp,
                    fontFamily = font,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth()
                )
                LaunchedEffect(it) {
                    kotlinx.coroutines.delay(3000)
                    viewModel.limpiarMensajes()
                }
                Spacer(modifier = Modifier.height(12.dp))
            }

            // Grid de películas
            if (cargando) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = Color.White)
                }
            } else if (peliculasFiltradas.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No hay películas\nen esta categoría",
                        fontSize = 16.sp,
                        color = Color.White.copy(alpha = 0.6f),
                        fontFamily = font,
                        textAlign = TextAlign.Center
                    )
                }
            } else {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(peliculasFiltradas) { pelicula ->
                        TarjetaPeliculaAmigo(
                            pelicula = pelicula,
                            onClick = { onPeliculaClick(pelicula.idPelicula) },
                            font = font
                        )
                    }
                }
            }
        }

        // Botón de volver
        IconButton(
            onClick = onVolverClick,
            modifier = Modifier
                .align(Alignment.TopStart)
                .padding(start = 20.dp, top = 25.dp)
        ) {
            Icon(
                Icons.AutoMirrored.Filled.ArrowBack,
                contentDescription = "Volver",
                tint = Color.White,
                modifier = Modifier.size(28.dp)
            )
        }
    }

    // Diálogo de confirmación para cancelar amistad
    if (mostrarDialogoCancelarAmistad) {
        AlertDialog(
            onDismissRequest = { mostrarDialogoCancelarAmistad = false },
            title = {
                Text("Cancelar amistad", fontFamily = font)
            },
            text = {
                Text(
                    "¿Estás seguro de que quieres eliminar a $nombreAmigo de tus amigos?",
                    fontFamily = font
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.eliminarAmigo(amigoUid)
                        mostrarDialogoCancelarAmistad = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFF9800))
                ) {
                    Text("Cancelar amistad", fontFamily = font)
                }
            },
            dismissButton = {
                TextButton(onClick = { mostrarDialogoCancelarAmistad = false }) {
                    Text("Volver", fontFamily = font)
                }
            }
        )
    }

    // Diálogo de confirmación para bloquear
    if (mostrarDialogoBloquear) {
        AlertDialog(
            onDismissRequest = { mostrarDialogoBloquear = false },
            title = {
                Text("Bloquear usuario", fontFamily = font)
            },
            text = {
                Text(
                    "¿Estás seguro de que quieres bloquear a $nombreAmigo? Esta acción también cancelará la amistad.",
                    fontFamily = font
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.bloquearUsuario(amigoUid)
                        mostrarDialogoBloquear = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFF5252))
                ) {
                    Text("Bloquear", fontFamily = font)
                }
            },
            dismissButton = {
                TextButton(onClick = { mostrarDialogoBloquear = false }) {
                    Text("Cancelar", fontFamily = font)
                }
            }
        )
    }
}

@Composable
fun TarjetaPeliculaAmigo(
    pelicula: PeliculaUsuario,
    onClick: () -> Unit,
    font: FontFamily
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(220.dp)
            .clickable { onClick() },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF2A2A3E))
    ) {
        Box {
            if (pelicula.rutaPoster != null) {
                AsyncImage(
                    model = "https://image.tmdb.org/t/p/w500${pelicula.rutaPoster}",
                    contentDescription = pelicula.titulo,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
            } else {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Sin imagen",
                        color = Color.White.copy(alpha = 0.5f),
                        fontFamily = font,
                        fontSize = 12.sp
                    )
                }
            }

            // Badge de estado
            Box(
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(8.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(
                        if (pelicula.estado == "vista") Color(0xFF4CAF50)
                        else Color(0xFF6C63FF)
                    )
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Text(
                    text = if (pelicula.estado == "vista") "Vista" else "Por Ver",
                    color = Color.White,
                    fontSize = 10.sp,
                    fontFamily = font,
                    fontWeight = FontWeight.Bold
                )
            }

            // Título en la parte inferior
            Box(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth()
                    .background(Color.Black.copy(alpha = 0.7f))
                    .padding(8.dp)
            ) {
                Text(
                    text = pelicula.titulo,
                    color = Color.White,
                    fontSize = 12.sp,
                    fontFamily = font,
                    fontWeight = FontWeight.Bold,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
            }

            // Valoración si existe
            if (pelicula.estado == "vista" && pelicula.valoracion > 0) {
                Box(
                    modifier = Modifier
                        .align(Alignment.TopStart)
                        .padding(8.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color(0xFFFFD700).copy(alpha = 0.9f))
                        .padding(horizontal = 6.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = "${pelicula.valoracion} ⭐",
                        color = Color.Black,
                        fontSize = 10.sp,
                        fontFamily = font,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}
