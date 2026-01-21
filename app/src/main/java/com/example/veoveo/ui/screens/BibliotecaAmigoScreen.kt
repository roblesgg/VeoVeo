package com.example.veoveo.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items as gridItems
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
import com.example.veoveo.model.TierList
import com.example.veoveo.viewmodel.ViewModelSocial
import com.example.veoveo.data.RepositorioUsuarios
import com.example.veoveo.data.RepositorioTierLists
import kotlinx.coroutines.launch

@Composable
fun BibliotecaAmigoScreen(
    amigoUid: String,
    onVolverClick: () -> Unit = {},
    onPeliculaClick: (Int) -> Unit = {},
    onTierListClick: (TierList) -> Unit = {},
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
    var cantidadAmigos by remember { mutableStateOf(0) }
    val scope = rememberCoroutineScope()
    val repositorioUsuarios = remember { RepositorioUsuarios() }
    val repositorioTierLists = remember { RepositorioTierLists() }

    // TierLists del amigo
    var tierListsAmigo by remember { mutableStateOf<List<TierList>>(emptyList()) }
    var cargandoTierLists by remember { mutableStateOf(false) }

    // Pestañas: 0 = Biblioteca, 1 = TierLists
    var pestanaActual by remember { mutableStateOf(0) }

    // Filtro biblioteca
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
            cantidadAmigos = 0
        }

        // Cargar TierLists del amigo
        scope.launch {
            cargandoTierLists = true
            val resultado = repositorioTierLists.obtenerTierListsDeUsuario(amigoUid)
            if (resultado.isSuccess) {
                tierListsAmigo = resultado.getOrNull()?.filter { it.publica } ?: emptyList()
            }
            cargandoTierLists = false
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
            0 -> peliculasAmigo.filter { it.estado == "por_ver" }
            1 -> peliculasAmigo.filter { it.estado == "vista" }
            else -> peliculasAmigo
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(brush)
    ) {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp)
        ) {
            item {
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

                    Spacer(modifier = Modifier.height(16.dp))

                    // Contadores
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = peliculasAmigo.filter { it.estado == "vista" }.size.toString(),
                                fontSize = 24.sp,
                                color = Color.White,
                                fontFamily = font,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Películas\nVistas",
                                fontSize = 12.sp,
                                color = Color.White.copy(alpha = 0.7f),
                                fontFamily = font,
                                textAlign = TextAlign.Center
                            )
                        }

                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = cantidadAmigos.toString(),
                                fontSize = 24.sp,
                                color = Color.White,
                                fontFamily = font,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Amigos",
                                fontSize = 12.sp,
                                color = Color.White.copy(alpha = 0.7f),
                                fontFamily = font
                            )
                        }

                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = tierListsAmigo.size.toString(),
                                fontSize = 24.sp,
                                color = Color.White,
                                fontFamily = font,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "TierLists",
                                fontSize = 12.sp,
                                color = Color.White.copy(alpha = 0.7f),
                                fontFamily = font
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Pestañas Biblioteca / TierLists
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    TabButton(
                        text = "Biblioteca",
                        selected = pestanaActual == 0,
                        onClick = { pestanaActual = 0 },
                        font = font,
                        modifier = Modifier.weight(1f)
                    )

                    Spacer(modifier = Modifier.width(12.dp))

                    TabButton(
                        text = "TierLists",
                        selected = pestanaActual == 1,
                        onClick = { pestanaActual = 1 },
                        font = font,
                        modifier = Modifier.weight(1f)
                    )
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
                        onVolverClick()
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
            }

            // Contenido según la pestaña
            when (pestanaActual) {
                0 -> {
                    // BIBLIOTECA
                    item {
                        // Filtros
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceEvenly
                        ) {
                            FilterChip(
                                selected = filtroSeleccionado == 0,
                                onClick = { filtroSeleccionado = 0 },
                                label = { Text("Por Ver", fontFamily = font) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = Color(0xFF6C63FF),
                                    selectedLabelColor = Color.White
                                )
                            )

                            FilterChip(
                                selected = filtroSeleccionado == 1,
                                onClick = { filtroSeleccionado = 1 },
                                label = { Text("Vistas", fontFamily = font) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = Color(0xFF4CAF50),
                                    selectedLabelColor = Color.White
                                )
                            )
                        }

                        Spacer(modifier = Modifier.height(16.dp))
                    }

                    // Grid de películas
                    if (cargando) {
                        item {
                            Box(
                                modifier = Modifier.fillMaxWidth().height(300.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                CircularProgressIndicator(color = Color.White)
                            }
                        }
                    } else if (peliculasFiltradas.isEmpty()) {
                        item {
                            Box(
                                modifier = Modifier.fillMaxWidth().height(300.dp),
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
                        }
                    }

                    // Grid de películas usando items
                    if (!cargando && peliculasFiltradas.isNotEmpty()) {
                        items(peliculasFiltradas.chunked(2)) { filaPeliculas ->
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                filaPeliculas.forEach { pelicula ->
                                    Box(modifier = Modifier.weight(1f)) {
                                        TarjetaPeliculaAmigo(
                                            pelicula = pelicula,
                                            onClick = { onPeliculaClick(pelicula.idPelicula) },
                                            font = font
                                        )
                                    }
                                }
                                if (filaPeliculas.size == 1) {
                                    Spacer(modifier = Modifier.weight(1f))
                                }
                            }
                            Spacer(modifier = Modifier.height(12.dp))
                        }
                    }
                }

                1 -> {
                    // TIERLISTS
                    if (cargandoTierLists) {
                        item {
                            Box(
                                modifier = Modifier.fillMaxWidth().height(300.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                CircularProgressIndicator(color = Color.White)
                            }
                        }
                    } else if (tierListsAmigo.isEmpty()) {
                        item {
                            Box(
                                modifier = Modifier.fillMaxWidth().height(300.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "No tiene TierLists públicas",
                                    fontSize = 16.sp,
                                    color = Color.White.copy(alpha = 0.6f),
                                    fontFamily = font,
                                    textAlign = TextAlign.Center
                                )
                            }
                        }
                    } else {
                        // Grid de TierLists
                        items(tierListsAmigo.chunked(2)) { filaTierLists ->
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(16.dp)
                            ) {
                                filaTierLists.forEach { tierlist ->
                                    Column(
                                        modifier = Modifier
                                            .weight(1f)
                                            .clickable { onTierListClick(tierlist) },
                                        horizontalAlignment = Alignment.CenterHorizontally
                                    ) {
                                        Card(
                                            modifier = Modifier.fillMaxWidth().aspectRatio(1f),
                                            shape = RoundedCornerShape(12.dp),
                                            colors = CardDefaults.cardColors(containerColor = Color(0xFF2A2A3E))
                                        ) {
                                            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                                                Column(
                                                    horizontalAlignment = Alignment.CenterHorizontally,
                                                    modifier = Modifier.padding(8.dp)
                                                ) {
                                                    Text(
                                                        tierlist.nombre,
                                                        color = Color.White,
                                                        fontSize = 16.sp,
                                                        fontFamily = font,
                                                        fontWeight = FontWeight.Bold,
                                                        textAlign = TextAlign.Center,
                                                        maxLines = 2,
                                                        overflow = TextOverflow.Ellipsis
                                                    )
                                                    Spacer(Modifier.height(8.dp))
                                                    Text(
                                                        "${tierlist.cantidadPeliculas()} películas",
                                                        color = Color.White.copy(alpha = 0.7f),
                                                        fontSize = 12.sp,
                                                        fontFamily = font
                                                    )
                                                }
                                            }
                                        }
                                        Spacer(Modifier.height(8.dp))
                                    }
                                }
                                if (filaTierLists.size == 1) {
                                    Spacer(modifier = Modifier.weight(1f))
                                }
                            }
                            Spacer(modifier = Modifier.height(16.dp))
                        }
                    }
                }
            }

            // Botones de acción al final
            item {
                Spacer(modifier = Modifier.height(24.dp))

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

                Spacer(modifier = Modifier.height(24.dp))
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
fun TabButton(
    text: String,
    selected: Boolean,
    onClick: () -> Unit,
    font: FontFamily,
    modifier: Modifier = Modifier
) {
    Button(
        onClick = onClick,
        colors = ButtonDefaults.buttonColors(
            containerColor = if (selected) Color(0xFF6C63FF) else Color(0xFF2A2A3E)
        ),
        modifier = modifier.height(48.dp),
        shape = RoundedCornerShape(12.dp)
    ) {
        Text(
            text = text,
            fontFamily = font,
            fontSize = 16.sp,
            fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal
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
        Box(modifier = Modifier.fillMaxSize()) {
            // Poster de la película
            if (pelicula.rutaPoster != null) {
                AsyncImage(
                    model = "https://image.tmdb.org/t/p/w200${pelicula.rutaPoster}",
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
                        pelicula.titulo,
                        color = Color.White,
                        fontSize = 12.sp,
                        fontFamily = font,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(8.dp)
                    )
                }
            }

            // Mostrar estrellas o emoji si está vista y tiene valoración
            if (pelicula.estado == "vista" && pelicula.valoracion != 0) {
                Box(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .background(
                            if (pelicula.valoracion == -1) Color(0xFF8B4513).copy(alpha = 0.9f)
                            else Color.Black.copy(alpha = 0.7f)
                        )
                        .padding(4.dp)
                ) {
                    if (pelicula.valoracion == -1) {
                        Text("💩", fontSize = 16.sp)
                    } else {
                        Row {
                            repeat(pelicula.valoracion) {
                                Text("⭐", fontSize = 12.sp)
                            }
                        }
                    }
                }
            }
        }
    }
}
