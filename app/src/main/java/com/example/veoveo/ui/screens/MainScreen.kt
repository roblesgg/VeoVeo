package com.example.veoveo.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.veoveo.R
import kotlinx.coroutines.withContext
import com.example.veoveo.conexion.RetrofitClient
import kotlinx.coroutines.Dispatchers
import com.example.veoveo.model.Movie

// pantalla principal con 4 pestanas: descubrir, biblioteca, tierlists, social
@Composable
fun MainScreen(onNavigateToPerfil: () -> Unit = {}) {

    // fuente personalizada montserrat
    val montserratFont = FontFamily(Font(R.font.montserrat_alternates_semibold, FontWeight.SemiBold))

    // variable para controlar que pestaña esta activa (0=descubrir, 1=biblioteca, 2=tierlists, 3=social)
    var paginaActual by remember { mutableIntStateOf(0) }

    // variable para controlar subpantallas en tierlists
    var pantallaTierList by remember { mutableIntStateOf(0) }

    // variable para mostrar u ocultar pantalla de contacto en social
    var mostrarContactoSocial by remember { mutableStateOf(false) }

    // variable para controlar si se muestra la pantalla de pelicula
    var mostrarPelicula by remember { mutableStateOf(false) }

    // variable para guardar el nombre de la pelicula seleccionada
    var peliculaSeleccionada by remember { mutableStateOf("") }

    // degradado de fondo morado oscuro
    val brush = Brush.verticalGradient(
        colors = listOf(Color(0xFF1A1A2E), Color(0xFF4B0082))
    )

    // caja principal con degradado de fondo
    Box(modifier = Modifier.fillMaxSize().background(brush)) {

        // contenido principal que ocupa toda la pantalla
        Box(modifier = Modifier.fillMaxSize()) {
            // muestra la pantalla de pelicula si esta activa
            if (mostrarPelicula) {
                PeliculaScreen(
                    nombrePelicula = peliculaSeleccionada,
                    onVolverClick = { mostrarPelicula = false }
                )
            } else {
                // muestra las pestanas normales
                when (paginaActual) {
                    0 -> DescubrirTab(montserratFont) { pelicula ->
                        peliculaSeleccionada = pelicula
                        mostrarPelicula = true
                    }
                    1 -> BibliotecaTab(montserratFont) { pelicula ->
                        peliculaSeleccionada = pelicula
                        mostrarPelicula = true
                    }
                    2 -> TierListsTab(montserratFont, pantallaTierList,
                        onPantallaChange = { pantallaTierList = it },
                        onPeliculaClick = { pelicula ->
                            peliculaSeleccionada = pelicula
                            mostrarPelicula = true
                        }
                    )
                    3 -> SocialTab(montserratFont,
                        onContactoClick = { mostrarContactoSocial = it },
                        onPeliculaClick = { pelicula ->
                            peliculaSeleccionada = pelicula
                            mostrarPelicula = true
                        }
                    )
                }
            }
        }

        // barra de navegacion suelta encima del contenido (solo visible en pantallas principales)
        // Se oculta si: está viendo película, viendo perfil de amigo, o dentro de una tierlist (crear/ver/editar)
        if (!mostrarPelicula && !mostrarContactoSocial && !(paginaActual == 2 && pantallaTierList != 0)) {
            NavigationBar(
                containerColor = Color.Transparent,
                tonalElevation = 0.dp,
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth()
                    .padding(start = 30.dp, end = 30.dp, bottom = 30.dp)
                    .height(80.dp)
                    .clip(RoundedCornerShape(50.dp))
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(
                                Color(0xFF1A1A1A).copy(alpha = 0.95f),
                                Color(0xFF0D0D0D).copy(alpha = 0.98f)
                            )
                        )
                    )
            ) {
                NavigationBarItem(
                    icon = { Icon(painterResource(R.drawable.ic_descubrir), null, Modifier.size(28.dp)) },
                    label = null,
                    selected = paginaActual == 0,
                    onClick = { paginaActual = 0 },
                    colors = navBarColors()
                )
                NavigationBarItem(
                    icon = { Icon(painterResource(R.drawable.ic_biblioteca), null, Modifier.size(28.dp)) },
                    label = null,
                    selected = paginaActual == 1,
                    onClick = { paginaActual = 1 },
                    colors = navBarColors()
                )
                NavigationBarItem(
                    icon = { Icon(painterResource(R.drawable.ic_tierlist), null, Modifier.size(28.dp)) },
                    label = null,
                    selected = paginaActual == 2,
                    onClick = { paginaActual = 2 },
                    colors = navBarColors()
                )
                NavigationBarItem(
                    icon = { Icon(painterResource(R.drawable.ic_social), null, Modifier.size(28.dp)) },
                    label = null,
                    selected = paginaActual == 3,
                    onClick = { paginaActual = 3 },
                    colors = navBarColors()
                )
            }
        }

        // boton de perfil arriba derecha (se oculta en algunas pantallas)
        if (!(paginaActual == 2 && pantallaTierList != 0) && !mostrarContactoSocial && !mostrarPelicula) {
            IconButton(
                onClick = onNavigateToPerfil,
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(top = 50.dp, end = 25.dp)
                    .size(40.dp)
            ) {
                Image(
                    painter = painterResource(R.drawable.ic_perfil),
                    contentDescription = "perfil",
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .border(3.dp, Color.White, CircleShape)
                )
            }
        }
    }
}

// pestana descubrir
@Composable
fun DescubrirTab(font: FontFamily, onPeliculaClick: (String) -> Unit = {}) {

    // controla si se muestra el campo de busqueda
    var buscar by remember { mutableStateOf(false) }

    // texto que el usuario escribe en el buscador
    var textoBuscar by remember { mutableStateOf("") }

    // controla si esta en modo edicion (permite eliminar carruseles)
    var modoEdicion by remember { mutableStateOf(false) }

    // controla si se muestra el dialogo para anadir nuevos carruseles
    var mostrarDialogo by remember { mutableStateOf(false) }

    // lista de todos los carruseles disponibles
    val carruselesDisponibles = remember {
        listOf("Terror", "Más vistas del año", "Películas de los 2000",
               "Comedias clasicas", "Basado en amigos", "Accion y aventuras")
    }

    // lista de carruseles que se muestran actualmente en pantalla
    val carruselesActivos = remember {
        mutableStateListOf("Terror", "Comedia", "Acción")
    }

    // maneja el boton atras del dispositivo
    BackHandler(onBack = { if (buscar) buscar = false else if (modoEdicion) modoEdicion = false })

    Box(modifier = Modifier.fillMaxSize()) {

        // titulo de la seccion
        Text("Descubrir", fontSize = 35.sp, color = Color.White, fontFamily = font,
            modifier = Modifier.align(Alignment.TopStart).padding(top = 50.dp, start = 25.dp))

        // boton de lupa para abrir el buscador
        IconButton(
            onClick = { buscar = !buscar },
            modifier = Modifier.align(Alignment.TopEnd).padding(top = 45.dp, end = 130.dp)
        ) {
            Image(painterResource(R.drawable.ic_descubrir), "buscar", Modifier.size(35.dp))
        }

        // campo de texto para buscar peliculas (solo se muestra si buscar es true)
        if (buscar) {
            OutlinedTextField(
                value = textoBuscar,
                onValueChange = { textoBuscar = it },
                label = { Text("Buscar", color = Color.White, fontFamily = font, fontSize = 12.sp) },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White,
                    focusedBorderColor = Color(0xFF6C63FF),
                    unfocusedBorderColor = Color.White,
                    focusedContainerColor = Color.Transparent,
                    unfocusedContainerColor = Color.Transparent
                ),
                shape = RoundedCornerShape(30.dp),
                modifier = Modifier.align(Alignment.TopCenter).fillMaxWidth()
                    .padding(start = 20.dp, end = 20.dp, top = 105.dp).height(60.dp)
            )
        }

        // lista vertical con todos los carruseles de peliculas
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(top = if (buscar) 175.dp else 105.dp),
            contentPadding = PaddingValues(bottom = 110.dp)
        ) {
            // muestra cada carrusel activo
            items(carruselesActivos.toList()) { carrusel ->
                CarruselPeliculas(carrusel, modoEdicion, { carruselesActivos.remove(carrusel) }, font, onPeliculaClick)
                Spacer(Modifier.height(16.dp))
            }

            // boton para activar o desactivar el modo edicion
            item {
                Spacer(Modifier.height(8.dp))
                Button(
                    onClick = { modoEdicion = !modoEdicion },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (modoEdicion) Color(0xFFFF5252) else Color(0xFF6C63FF)
                    ),
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 25.dp)
                ) {
                    Icon(if (modoEdicion) Icons.Default.Close else Icons.Default.Edit, null, tint = Color.White)
                    Spacer(Modifier.width(8.dp))
                    Text(if (modoEdicion) "Listo" else "Editar Listas", color = Color.White, fontFamily = font, fontSize = 16.sp)
                }
                Spacer(Modifier.height(8.dp))
            }

            // boton para anadir nuevos carruseles (solo visible en modo edicion)
            if (modoEdicion) {
                item {
                    Button(
                        onClick = { mostrarDialogo = true },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF6C63FF)),
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 25.dp)
                    ) {
                        Icon(Icons.Default.Add, null, tint = Color.White)
                        Spacer(Modifier.width(8.dp))
                        Text("Anadir Lista", color = Color.White, fontFamily = font, fontSize = 16.sp)
                    }
                }
            }
        }

        // dialogo modal para seleccionar carruseles disponibles
        if (mostrarDialogo) {
            DialogoAnadirLista(
                carruselesDisponibles,
                carruselesActivos,
                { mostrarDialogo = false },
                { if (!carruselesActivos.contains(it)) carruselesActivos.add(it) },
                font
            )
        }
    }
}

// pestana biblioteca
@Composable
fun BibliotecaTab(font: FontFamily, onPeliculaClick: (String) -> Unit = {}) {
    var buscar by remember { mutableStateOf(false) }
    var textoBuscar by remember { mutableStateOf("") }
    var seccion by remember { mutableIntStateOf(0) }

    val peliculasPorVer = remember { listOf("Pelicula 1", "Pelicula 2", "Pelicula 3", "Pelicula 4", "Pelicula 5", "Pelicula 6", "Pelicula 7", "Pelicula 8", "Pelicula 9") }
    val peliculasVistas = remember { listOf("Vista 1", "Vista 2", "Vista 3", "Vista 4", "Vista 5", "Vista 6") }

    BackHandler(onBack = { if (buscar) buscar = false })

    Box(modifier = Modifier.fillMaxSize()) {
        Text("Biblioteca", fontSize = 35.sp, color = Color.White, fontFamily = font,
            modifier = Modifier.align(Alignment.TopStart).padding(top = 50.dp, start = 25.dp))

        IconButton(
            onClick = { buscar = !buscar },
            modifier = Modifier.align(Alignment.TopEnd).padding(top = 45.dp, end = 130.dp)
        ) {
            Image(painterResource(R.drawable.ic_descubrir), "buscar", Modifier.size(35.dp))
        }

        Row(
            modifier = Modifier.align(Alignment.TopCenter).padding(top = 100.dp),
            horizontalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            Text(
                "Por Ver",
                fontSize = 18.sp,
                color = if (seccion == 0) Color.White else Color.Gray,
                fontFamily = font,
                fontWeight = if (seccion == 0) FontWeight.Bold else FontWeight.Normal,
                modifier = Modifier.clickable { seccion = 0 }
            )
            Text(
                "Vistas",
                fontSize = 18.sp,
                color = if (seccion == 1) Color.White else Color.Gray,
                fontFamily = font,
                fontWeight = if (seccion == 1) FontWeight.Bold else FontWeight.Normal,
                modifier = Modifier.clickable { seccion = 1 }
            )
        }

        if (buscar) {
            OutlinedTextField(
                value = textoBuscar,
                onValueChange = { textoBuscar = it },
                label = { Text("Buscar", color = Color.White, fontFamily = font, fontSize = 12.sp) },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White,
                    focusedBorderColor = Color(0xFF6C63FF),
                    unfocusedBorderColor = Color.White,
                    focusedContainerColor = Color.Transparent,
                    unfocusedContainerColor = Color.Transparent
                ),
                shape = RoundedCornerShape(30.dp),
                modifier = Modifier.align(Alignment.TopCenter).fillMaxWidth()
                    .padding(start = 20.dp, end = 20.dp, top = 115.dp).height(60.dp)
            )
        }

        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(
                top = if (buscar) 185.dp else 140.dp,
                start = 25.dp,
                end = 25.dp
            ),
            contentPadding = PaddingValues(bottom = 110.dp)
        ) {
            val peliculas = if (seccion == 0) peliculasPorVer else peliculasVistas
            val filas = peliculas.chunked(3)

            items(filas) { fila ->
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    fila.forEach { pelicula ->
                        Card(
                            modifier = Modifier.weight(1f).height(180.dp).clickable { onPeliculaClick(pelicula) },
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFF2A2A3E))
                        ) {
                            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                                Text(pelicula, color = Color.White, fontSize = 14.sp, fontFamily = font,
                                    textAlign = TextAlign.Center, modifier = Modifier.padding(8.dp))
                            }
                        }
                    }
                    repeat(3 - fila.size) { Spacer(Modifier.weight(1f)) }
                }
                Spacer(Modifier.height(12.dp))
            }
        }
    }
}

// pestana tierlists
@Composable
fun TierListsTab(font: FontFamily, pantalla: Int, onPantallaChange: (Int) -> Unit, onPeliculaClick: (String) -> Unit = {}) {
    var buscar by remember { mutableStateOf(false) }
    var textoBuscar by remember { mutableStateOf("") }
    var tierListSeleccionada by remember { mutableStateOf("") }

    val tierLists = remember { listOf("Mis Favoritas", "Terror Clasico", "Accion 2024", "Comedias", "Sci-Fi") }

    BackHandler(onBack = {
        if (buscar) buscar = false
        else if (pantalla != 0) onPantallaChange(0)
    })

    when (pantalla) {
        0 -> {
            Box(modifier = Modifier.fillMaxSize()) {
                Text("TierLists", fontSize = 35.sp, color = Color.White, fontFamily = font,
                    modifier = Modifier.align(Alignment.TopStart).padding(top = 50.dp, start = 25.dp))

                IconButton(
                    onClick = { buscar = !buscar },
                    modifier = Modifier.align(Alignment.TopEnd).padding(top = 45.dp, end = 130.dp)
                ) {
                    Image(painterResource(R.drawable.ic_descubrir), "buscar", Modifier.size(35.dp))
                }

                if (buscar) {
                    OutlinedTextField(
                        value = textoBuscar,
                        onValueChange = { textoBuscar = it },
                        label = { Text("Buscar", color = Color.White, fontFamily = font, fontSize = 12.sp) },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            focusedBorderColor = Color(0xFF6C63FF),
                            unfocusedBorderColor = Color.White,
                            focusedContainerColor = Color.Transparent,
                            unfocusedContainerColor = Color.Transparent
                        ),
                        shape = RoundedCornerShape(30.dp),
                        modifier = Modifier.align(Alignment.TopCenter).fillMaxWidth()
                            .padding(start = 20.dp, end = 20.dp, top = 105.dp).height(60.dp)
                    )
                }

                LazyColumn(
                    modifier = Modifier.fillMaxSize().padding(
                        top = if (buscar) 175.dp else 105.dp,
                        start = 25.dp,
                        end = 25.dp
                    ),
                    contentPadding = PaddingValues(bottom = 130.dp)
                ) {
                    val filas = tierLists.chunked(2)
                    items(filas) { fila ->
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                            fila.forEach { tierlist ->
                                Column(
                                    modifier = Modifier.weight(1f).clickable {
                                        tierListSeleccionada = tierlist
                                        onPantallaChange(1)
                                    },
                                    horizontalAlignment = Alignment.CenterHorizontally
                                ) {
                                    Card(
                                        modifier = Modifier.fillMaxWidth().aspectRatio(1f),
                                        shape = RoundedCornerShape(12.dp),
                                        colors = CardDefaults.cardColors(containerColor = Color(0xFF2A2A3E))
                                    ) {
                                        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                                            Text(tierlist, color = Color.White, fontSize = 16.sp, fontFamily = font,
                                                textAlign = TextAlign.Center, modifier = Modifier.padding(8.dp))
                                        }
                                    }
                                    Spacer(Modifier.height(8.dp))
                                    Text(tierlist, color = Color.White, fontSize = 14.sp, fontFamily = font,
                                        textAlign = TextAlign.Center, maxLines = 2)
                                }
                            }
                            repeat(2 - fila.size) { Spacer(Modifier.weight(1f)) }
                        }
                        Spacer(Modifier.height(24.dp))
                    }
                }

                FloatingActionButton(
                    onClick = { onPantallaChange(2) },
                    containerColor = Color(0xFF6C63FF),
                    contentColor = Color.White,
                    modifier = Modifier.align(Alignment.BottomEnd).padding(bottom = 130.dp, end = 25.dp)
                ) {
                    Icon(Icons.Default.Add, "crear tierlist", Modifier.size(28.dp))
                }
            }
        }
        1 -> TierListScreen({ onPantallaChange(0) }, { onPantallaChange(2) }, { onPantallaChange(0) }, onPeliculaClick)
        2 -> CrearTierListScreen(
            { onPantallaChange(if (tierListSeleccionada.isNotEmpty()) 1 else 0) },
            { onPantallaChange(3) }
        )
        3 -> EditarTierListScreen({ onPantallaChange(2) }, { tierListSeleccionada = ""; onPantallaChange(0) })
    }
}

// pestana social
@Composable
fun SocialTab(font: FontFamily, onContactoClick: (Boolean) -> Unit, onPeliculaClick: (String) -> Unit = {}) {
    var buscar by remember { mutableStateOf(false) }
    var textoBuscar by remember { mutableStateOf("") }
    var mostrarMensaje by remember { mutableStateOf(false) }
    var mostrarContacto by remember { mutableStateOf(false) }
    var contactoSeleccionado by remember { mutableStateOf("") }

    val amigos = remember { listOf("Amigo 1", "Amigo 2", "Amigo 3", "Amigo 4", "Amigo 5", "Amigo 6", "Amigo 7", "Amigo 8", "Amigo 9", "Amigo 10") }

    BackHandler(onBack = {
        if (buscar) buscar = false
        else if (mostrarContacto) mostrarContacto = false
    })

    if (mostrarContacto) {
        onContactoClick(true)
        ContactoScreen(
            contactoSeleccionado,
            { mostrarContacto = false; onContactoClick(false) },
            { mostrarContacto = false; onContactoClick(false) },
            onPeliculaClick
        )
    } else {
        Box(modifier = Modifier.fillMaxSize()) {
            Text("Social", fontSize = 35.sp, color = Color.White, fontFamily = font,
                modifier = Modifier.align(Alignment.TopStart).padding(top = 50.dp, start = 25.dp))

            IconButton(
                onClick = { buscar = !buscar },
                modifier = Modifier.align(Alignment.TopEnd).padding(top = 45.dp, end = 80.dp)
            ) {
                Icon(Icons.Default.Add, "agregar", tint = Color.White, modifier = Modifier.size(35.dp))
            }

            if (buscar) {
                Column(
                    modifier = Modifier.align(Alignment.TopCenter).fillMaxWidth()
                        .padding(top = 105.dp, start = 20.dp, end = 20.dp)
                ) {
                    OutlinedTextField(
                        value = textoBuscar,
                        onValueChange = { textoBuscar = it },
                        label = { Text("Buscar amigo", color = Color.White, fontFamily = font, fontSize = 12.sp) },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            focusedBorderColor = Color(0xFF6C63FF),
                            unfocusedBorderColor = Color.White,
                            focusedContainerColor = Color.Transparent,
                            unfocusedContainerColor = Color.Transparent
                        ),
                        shape = RoundedCornerShape(30.dp),
                        modifier = Modifier.fillMaxWidth().height(60.dp)
                    )
                    Spacer(Modifier.height(12.dp))
                    Button(
                        onClick = { if (textoBuscar.isNotBlank()) { mostrarMensaje = true; textoBuscar = "" } },
                        enabled = textoBuscar.isNotBlank(),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF6C63FF),
                            disabledContainerColor = Color.Gray
                        ),
                        modifier = Modifier.fillMaxWidth().height(50.dp)
                    ) {
                        Text("Agregar", color = Color.White, fontFamily = font, fontSize = 16.sp)
                    }
                    if (mostrarMensaje) {
                        Spacer(Modifier.height(12.dp))
                        Text("Solicitud enviada", color = Color(0xFF32CD32), fontFamily = font, fontSize = 14.sp,
                            modifier = Modifier.align(Alignment.CenterHorizontally))
                    }
                }
            }

            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(
                    top = if (buscar) 265.dp else 105.dp,
                    start = 25.dp,
                    end = 25.dp
                ),
                contentPadding = PaddingValues(bottom = 110.dp)
            ) {
                items(amigos) { amigo ->
                    Row(
                        modifier = Modifier.fillMaxWidth().clickable {
                            contactoSeleccionado = amigo
                            mostrarContacto = true
                        }.padding(vertical = 12.dp),    
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Image(
                            painterResource(R.drawable.ic_perfil),
                            "perfil",
                            contentScale = ContentScale.Crop,
                            modifier = Modifier.size(50.dp).clip(CircleShape).border(2.dp, Color.White, CircleShape)
                        )
                        Spacer(Modifier.width(16.dp))
                        Text(amigo, fontSize = 18.sp, color = Color.White, fontFamily = font)
                    }
                }
            }
        }
    }
}

fun obtenerIdGenero(titulo: String): String {
    return when {
        titulo.contains("Terror", ignoreCase = true) -> "27"
        titulo.contains("Comedia", ignoreCase = true) -> "35"
        titulo.contains("Acción", ignoreCase = true) -> "28"
        titulo.contains("Aventura", ignoreCase = true) -> "12"
        titulo.contains("Ciencia Ficción", ignoreCase = true) || titulo.contains("Sci-Fi") -> "878"
        titulo.contains("Animación", ignoreCase = true) -> "16"
        // Si no coincide, devolvemos '28' (Acción) por defecto o una cadena vacía para manejarlo
        else -> "28"
    }
}

// componente carrusel de peliculas
@Composable
fun CarruselPeliculas(
    titulo: String,
    modoEdicion: Boolean,
    onEliminar: () -> Unit,
    font: FontFamily,
    onPeliculaClick: (String) -> Unit = {}
) {
    // 1. Estado para guardar las películas que vienen de la API
    var listaPeliculas by remember { mutableStateOf(emptyList<Movie>()) }

    // 2. Llamada a la API al cargar el componente
    LaunchedEffect(titulo) {
        val generoId = obtenerIdGenero(titulo)
        try {
            // Hacemos la llamada en un hilo secundario (IO)
            val response = withContext(Dispatchers.IO) {
                RetrofitClient.instance.buscarPeliculasporGenero(generoId)
            }
            if (response.isSuccessful) {
                // Actualizamos la lista con los resultados (si no es null)
                listaPeliculas = (response.body()?.results?:emptyList()) as List<Movie>
            }
        } catch (e: Exception) {
            e.printStackTrace() // Manejo básico de errores
        }
    }

    Column(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 25.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(titulo, fontSize = 20.sp, color = Color.White, fontFamily = font, fontWeight = FontWeight.SemiBold)
            if (modoEdicion) {
                IconButton(onClick = onEliminar, modifier = Modifier.size(32.dp)) {
                    Icon(Icons.Default.Close, "eliminar", tint = Color(0xFFFF5252), modifier = Modifier.size(24.dp))
                }
            }
        }
        Spacer(Modifier.height(12.dp))

        // 3. Mostramos la lista dinámica
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            contentPadding = PaddingValues(horizontal = 25.dp)
        ) {
            items(listaPeliculas) { movie ->
                Card(
                    // Pasamos el título o el ID al hacer click
                    modifier = Modifier.width(120.dp).height(180.dp).clickable { onPeliculaClick(movie.title) },
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF2A2A3E))
                ) {
                    // Usamos el posterPath que viene de la API
                    AsyncImage(
                        model = "https://image.tmdb.org/t/p/w200${movie.posterPath}",
                        contentDescription = movie.title,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )
                }
            }
        }
    }
}

// dialogo para anadir listas
@Composable
fun DialogoAnadirLista(
    disponibles: List<String>,
    activos: List<String>,
    onDismiss: () -> Unit,
    onAnadir: (String) -> Unit,
    font: FontFamily
) {
    val seleccionadas = remember { mutableStateListOf<String>() }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Anadir Listas", fontFamily = font, fontSize = 20.sp, color = Color.White) },
        text = {
            Column(modifier = Modifier.fillMaxWidth()) {
                disponibles.forEach { carrusel ->
                    if (!activos.contains(carrusel)) {
                        Row(
                            modifier = Modifier.fillMaxWidth().clickable {
                                if (seleccionadas.contains(carrusel)) seleccionadas.remove(carrusel)
                                else seleccionadas.add(carrusel)
                            }.padding(vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Checkbox(
                                checked = seleccionadas.contains(carrusel),
                                onCheckedChange = { if (it) seleccionadas.add(carrusel) else seleccionadas.remove(carrusel) },
                                colors = CheckboxDefaults.colors(checkedColor = Color(0xFF6C63FF), uncheckedColor = Color.White)
                            )
                            Spacer(Modifier.width(8.dp))
                            Text(carrusel, fontFamily = font, fontSize = 16.sp, color = Color.White)
                        }
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = { seleccionadas.forEach { onAnadir(it) }; onDismiss() }) {
                Text("Anadir", fontFamily = font, color = Color(0xFF6C63FF))
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancelar", fontFamily = font, color = Color.White)
            }
        },
        containerColor = Color(0xFF1A1A2E),
        textContentColor = Color.White
    )
}

// colores de la navbar
@Composable
fun navBarColors() = NavigationBarItemDefaults.colors(
    selectedIconColor = Color.White,
    unselectedIconColor = Color.White,
    indicatorColor = Color.Transparent
)

// ===== vista previa =====
// esto sirve para ver la pantalla en android studio sin ejecutar el emulador
@Preview(showBackground = true)
@Composable
fun MainScreenPreview() {
    MainScreen()
}