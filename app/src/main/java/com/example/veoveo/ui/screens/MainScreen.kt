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
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
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
import com.example.veoveo.R

// pantalla principal con 4 pestanas: descubrir, biblioteca, tierlists, social
@Composable
fun MainScreen(onNavigateToPerfil: () -> Unit = {}) {

    val montserratFont = FontFamily(Font(R.font.montserrat_alternates_semibold, FontWeight.SemiBold))

    var paginaActual by remember { mutableIntStateOf(0) }
    var pantallaTierList by remember { mutableIntStateOf(0) }
    var mostrarContactoSocial by remember { mutableStateOf(false) }

    val brush = Brush.verticalGradient(
        colors = listOf(Color(0xFF1A1A2E), Color(0xFF4B0082))
    )

    Box(modifier = Modifier.fillMaxSize().background(brush)) {
        Scaffold(
            containerColor = Color.Transparent,
            bottomBar = {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(start = 30.dp, end = 30.dp, bottom = 30.dp)
                        .clip(RoundedCornerShape(50.dp))
                        .background(Color.Black.copy(alpha = 0.3f))
                ) {
                    NavigationBar(
                        containerColor = Color.Transparent,
                        tonalElevation = 0.dp,
                        modifier = Modifier.height(80.dp)
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
            }
        ) { paddingValues ->
            Box(modifier = Modifier.padding(paddingValues).fillMaxSize()) {
                when (paginaActual) {
                    0 -> DescubrirTab(montserratFont)
                    1 -> BibliotecaTab(montserratFont)
                    2 -> TierListsTab(montserratFont, pantallaTierList) { pantallaTierList = it }
                    3 -> SocialTab(montserratFont) { mostrarContactoSocial = it }
                }
            }
        }

        // boton de perfil arriba derecha
        if (!(paginaActual == 2 && pantallaTierList != 0) && !mostrarContactoSocial) {
            IconButton(
                onClick = onNavigateToPerfil,
                modifier = Modifier.align(Alignment.TopEnd).padding(top = 25.dp, end = 25.dp).size(40.dp)
            ) {
                Image(
                    painter = painterResource(R.drawable.ic_perfil),
                    contentDescription = "perfil",
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.size(40.dp).clip(CircleShape).border(3.dp, Color.White, CircleShape)
                )
            }
        }
    }
}

// pestana descubrir
@Composable
fun DescubrirTab(font: FontFamily) {
    var buscar by remember { mutableStateOf(false) }
    var textoBuscar by remember { mutableStateOf("") }
    var modoEdicion by remember { mutableStateOf(false) }
    var mostrarDialogo by remember { mutableStateOf(false) }

    val carruselesDisponibles = remember {
        listOf("Terror 2025", "Mas vistas del ano", "Peliculas de los 2000",
               "Comedias clasicas", "Basado en amigos", "Accion y aventuras")
    }
    val carruselesActivos = remember {
        mutableStateListOf("Terror 2025", "Mas vistas del ano", "Peliculas de los 2000")
    }

    BackHandler(onBack = { if (buscar) buscar = false else if (modoEdicion) modoEdicion = false })

    Box(modifier = Modifier.fillMaxSize()) {
        Text("Descubrir", fontSize = 35.sp, color = Color.White, fontFamily = font,
            modifier = Modifier.align(Alignment.TopStart).padding(top = 25.dp, start = 25.dp))

        IconButton(
            onClick = { buscar = !buscar },
            modifier = Modifier.align(Alignment.TopEnd).padding(top = 20.dp, end = 130.dp)
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
                    .padding(start = 20.dp, end = 20.dp, top = 80.dp).height(60.dp)
            )
        }

        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(top = if (buscar) 150.dp else 80.dp, bottom = 80.dp)
        ) {
            items(carruselesActivos.toList()) { carrusel ->
                CarruselPeliculas(carrusel, modoEdicion, { carruselesActivos.remove(carrusel) }, font)
                Spacer(Modifier.height(16.dp))
            }

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
fun BibliotecaTab(font: FontFamily) {
    var buscar by remember { mutableStateOf(false) }
    var textoBuscar by remember { mutableStateOf("") }
    var seccion by remember { mutableIntStateOf(0) }

    val peliculasPorVer = remember { listOf("Pelicula 1", "Pelicula 2", "Pelicula 3", "Pelicula 4", "Pelicula 5", "Pelicula 6", "Pelicula 7", "Pelicula 8", "Pelicula 9") }
    val peliculasVistas = remember { listOf("Vista 1", "Vista 2", "Vista 3", "Vista 4", "Vista 5", "Vista 6") }

    BackHandler(onBack = { if (buscar) buscar = false })

    Box(modifier = Modifier.fillMaxSize()) {
        Text("Biblioteca", fontSize = 35.sp, color = Color.White, fontFamily = font,
            modifier = Modifier.align(Alignment.TopStart).padding(top = 25.dp, start = 25.dp))

        IconButton(
            onClick = { buscar = !buscar },
            modifier = Modifier.align(Alignment.TopEnd).padding(top = 20.dp, end = 130.dp)
        ) {
            Image(painterResource(R.drawable.ic_descubrir), "buscar", Modifier.size(35.dp))
        }

        Row(
            modifier = Modifier.align(Alignment.TopCenter).padding(top = 75.dp),
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
                top = if (buscar) 185.dp else 115.dp,
                bottom = 80.dp,
                start = 25.dp,
                end = 25.dp
            )
        ) {
            val peliculas = if (seccion == 0) peliculasPorVer else peliculasVistas
            val filas = peliculas.chunked(3)

            items(filas) { fila ->
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    fila.forEach { pelicula ->
                        Card(
                            modifier = Modifier.weight(1f).height(180.dp).clickable {},
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
fun TierListsTab(font: FontFamily, pantalla: Int, onPantallaChange: (Int) -> Unit) {
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
                    modifier = Modifier.align(Alignment.TopStart).padding(top = 25.dp, start = 25.dp))

                IconButton(
                    onClick = { buscar = !buscar },
                    modifier = Modifier.align(Alignment.TopEnd).padding(top = 20.dp, end = 130.dp)
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
                            .padding(start = 20.dp, end = 20.dp, top = 80.dp).height(60.dp)
                    )
                }

                LazyColumn(
                    modifier = Modifier.fillMaxSize().padding(
                        top = if (buscar) 150.dp else 80.dp,
                        bottom = 100.dp,
                        start = 25.dp,
                        end = 25.dp
                    )
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
                    modifier = Modifier.align(Alignment.BottomEnd).padding(bottom = 100.dp, end = 25.dp)
                ) {
                    Icon(Icons.Default.Add, "crear tierlist", Modifier.size(28.dp))
                }
            }
        }
        1 -> TierListScreen({ onPantallaChange(0) }, { onPantallaChange(2) }, { onPantallaChange(0) })
        2 -> CrearTierListScreen(
            { onPantallaChange(if (tierListSeleccionada.isNotEmpty()) 1 else 0) },
            { onPantallaChange(3) }
        )
        3 -> EditarTierListScreen({ onPantallaChange(2) }, { tierListSeleccionada = ""; onPantallaChange(0) })
    }
}

// pestana social
@Composable
fun SocialTab(font: FontFamily, onMostrarContacto: (Boolean) -> Unit) {
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
        onMostrarContacto(true)
        ContactoScreen(
            contactoSeleccionado,
            { mostrarContacto = false; onMostrarContacto(false) },
            { mostrarContacto = false; onMostrarContacto(false) }
        )
    } else {
        Box(modifier = Modifier.fillMaxSize()) {
            Text("Social", fontSize = 35.sp, color = Color.White, fontFamily = font,
                modifier = Modifier.align(Alignment.TopStart).padding(top = 25.dp, start = 25.dp))

            IconButton(
                onClick = { buscar = !buscar },
                modifier = Modifier.align(Alignment.TopEnd).padding(top = 20.dp, end = 80.dp)
            ) {
                Icon(Icons.Default.Add, "agregar", tint = Color.White, modifier = Modifier.size(35.dp))
            }

            if (buscar) {
                Column(
                    modifier = Modifier.align(Alignment.TopCenter).fillMaxWidth()
                        .padding(top = 80.dp, start = 20.dp, end = 20.dp)
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
                    top = if (buscar) 240.dp else 80.dp,
                    bottom = 80.dp,
                    start = 25.dp,
                    end = 25.dp
                )
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

// componente carrusel de peliculas
@Composable
fun CarruselPeliculas(titulo: String, modoEdicion: Boolean, onEliminar: () -> Unit, font: FontFamily) {
    val peliculas = remember { listOf("Pelicula 1", "Pelicula 2", "Pelicula 3", "Pelicula 4", "Pelicula 5", "Pelicula 6") }

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
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            contentPadding = PaddingValues(horizontal = 25.dp)
        ) {
            items(peliculas) { pelicula ->
                Card(
                    modifier = Modifier.width(120.dp).height(180.dp).clickable {},
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF2A2A3E))
                ) {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text(pelicula, color = Color.White, fontSize = 14.sp, fontFamily = font,
                            textAlign = TextAlign.Center, modifier = Modifier.padding(8.dp))
                    }
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
