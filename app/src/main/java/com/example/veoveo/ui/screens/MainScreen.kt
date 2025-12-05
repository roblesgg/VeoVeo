package com.example.veoveo.ui.screens

// ===== importaciones necesarias =====
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
import androidx.compose.runtime.toMutableStateList
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
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.veoveo.R

/**
 * ===== MAINSCREEN - PANTALLA PRINCIPAL =====
 *
 * esta es la pantalla principal cuando ya estas dentro de la app
 * tiene 2 partes importantes:
 *
 * 1. barra de navegacion de abajo (las 4 pestañas):
 *    - descubrir: para buscar peliculas y series nuevas
 *    - biblioteca: tus peliculas y series guardadas
 *    - tierlists: tus listas de rankings
 *    - social: para ver lo que hacen tus amigos
 *
 * 2. icono de perfil arriba a la derecha:
 *    - cuando lo pulsas te lleva a tu perfil
 *
 * componentes basicos que usa:
 * - Box: contenedor principal
 * - Scaffold: estructura basica con barra de navegacion
 * - NavigationBar: la barra de abajo con las 4 pestañas
 * - NavigationBarItem: cada pestaña individual
 * - IconButton: el boton del perfil
 * - Image: la imagen del perfil
 * - Text: textos
 */
@Composable
fun MainScreen(
    onNavigateToPerfil: () -> Unit = {}  // funcion que se ejecuta al pulsar el icono de perfil
) {

    //fuente
    val montserratFontFamily = FontFamily(
        Font(R.font.montserrat_alternates_semibold, FontWeight.SemiBold)
    )

    // ===== variable para saber que pestaña esta activa =====
    // 0 = descubrir
    // 1 = biblioteca
    // 2 = tierlists
    // 3 = social
    var paginaActual by remember { mutableIntStateOf(0) }

    // ===== colores del fondo =====
    // el mismo degradado que en login y perfil
    val brush = Brush.verticalGradient(
        colors = listOf(
            Color(0xFF1A1A2E), // azul oscuro arriba
            Color(0xFF4B0082)  // morado abajo
        )
    )

    // ===== contenedor principal =====
    Box(
        modifier = Modifier
            .fillMaxSize()              // ocupa toda la pantalla
            .background(brush = brush)  // le ponemos el degradado
    ) {

        // ===== scaffold =====
        // Scaffold es una estructura basica que nos da espacio para poner
        // contenido en el centro y una barra de navegacion abajo
        Scaffold(
            containerColor = Color.Transparent,  // hacemos el fondo transparente para ver el degradado

            // ===== barra de navegacion de abajo =====
            bottomBar = {
                // Box para darle forma redondeada a la barra
                Box(
                    modifier = Modifier
                        .fillMaxWidth()                              // ocupa todo el ancho
                        .padding(start = 30.dp, end = 30.dp, bottom = 30.dp)  // margen alrededor
                        .clip(RoundedCornerShape(50.dp))             // esquinas muy redondeadas (capsula)
                        .background(Color.Black.copy(alpha = 0.3f))  // fondo negro semi-transparente
                ) {
                    NavigationBar(
                        containerColor = Color.Transparent,  // fondo transparente
                        tonalElevation = 0.dp,               // sin sombra
                        modifier = Modifier.height(80.dp)    // altura de 80dp (mas grande)
                    ) {

                        // ===== pestaña 1: descubrir =====
                        NavigationBarItem(
                            icon = {
                                Icon(
                                    painter = painterResource(id = R.drawable.ic_descubrir),
                                    contentDescription = "Descubrir",
                                    modifier = Modifier.size(28.dp)  // tamaño del icono mas grande
                                )
                            },
                            label = null,  // sin texto
                            selected = paginaActual == 0,  // esta seleccionada si paginaActual es 0
                            onClick = { paginaActual = 0 },  // cuando la pulsan, cambia paginaActual a 0
                            colors = navBarColors()  // colores personalizados (ver funcion abajo)
                        )

                        // ===== pestaña 2: biblioteca =====
                        NavigationBarItem(
                            icon = {
                                Icon(
                                    painter = painterResource(id = R.drawable.ic_biblioteca),
                                    contentDescription = "Biblioteca",
                                    modifier = Modifier.size(28.dp)  // tamaño del icono mas grande
                                )
                            },
                            label = null,  // sin texto
                            selected = paginaActual == 1,
                            onClick = { paginaActual = 1 },
                            colors = navBarColors()
                        )

                        // ===== pestaña 3: tierlists =====
                        NavigationBarItem(
                            icon = {
                                Icon(
                                    painter = painterResource(id = R.drawable.ic_tierlist),
                                    contentDescription = "TierLists",
                                    modifier = Modifier.size(28.dp)  // tamaño del icono mas grande
                                )
                            },
                            label = null,  // sin texto
                            selected = paginaActual == 2,
                            onClick = { paginaActual = 2 },
                            colors = navBarColors()
                        )

                        // ===== pestaña 4: social =====
                        NavigationBarItem(
                            icon = {
                                Icon(
                                    painter = painterResource(id = R.drawable.ic_social),
                                    contentDescription = "Social",
                                    modifier = Modifier.size(28.dp)  // tamaño del icono mas grande
                                )
                            },
                            label = null,  // sin texto
                            selected = paginaActual == 3,
                            onClick = { paginaActual = 3 },
                            colors = navBarColors()
                        )
                    }
                }
            }
        ) { innerPadding ->

            // ===== contenido central =====
            // este Box muestra el contenido que cambia segun la pestaña
            Box(
                modifier = Modifier
                    .padding(innerPadding)  // respeta el espacio de la barra de navegacion
                    .fillMaxSize()          // ocupa todo el espacio restante
            ) {

                // ===== decide que mostrar segun la pestaña =====
                // when es como un switch en otros lenguajes
                when (paginaActual) {

                    //--------------------------------------------------------------------------
                    //Buscar
                    //--------------------------------------------------------------------------

                    0 -> {
                        // ===== VARIABLES DE ESTADO =====
                        var buscarPelis by remember { mutableStateOf(false) }
                        var buscar by remember { mutableStateOf("") }
                        var modoEdicion by remember { mutableStateOf(false) }
                        var mostrarDialogo by remember { mutableStateOf(false) }

                        // Lista de carruseles disponibles para elegir
                        val carruselesDisponibles = remember {
                            listOf(
                                "Terror 2025",
                                "Más vistas del año",
                                "Películas de los 2000",
                                "Comedias clásicas",
                                "Basado en amigos",
                                "Acción y aventuras",
                                "Documentales",
                                "Anime",
                                "Películas españolas"
                            )
                        }

                        // Lista de carruseles activos (los que ve el usuario)
                        val carruselesActivos = remember {
                            mutableStateListOf(
                                "Terror 2025",
                                "Más vistas del año",
                                "Películas de los 2000"
                            )
                        }

                        BackHandler(onBack = {
                            if (buscarPelis) {
                                buscarPelis = false
                            } else if (modoEdicion) {
                                modoEdicion = false
                            }
                        })

                        // ===== CONTENIDO DE DESCUBRIR =====
                        Box(
                            modifier = Modifier.fillMaxSize()
                        ) {

                            // ===== TÍTULO Y BOTONES SUPERIORES =====
                            // Título a la izquierda
                            Text(
                                text = "Descubrir",
                                fontSize = 35.sp,
                                color = Color.White,
                                fontFamily = montserratFontFamily,
                                modifier = Modifier
                                    .align(Alignment.TopStart)
                                    .padding(top = 25.dp, start = 25.dp)
                            )

                            // Botón de búsqueda
                            IconButton(
                                onClick = { buscarPelis = !buscarPelis },
                                modifier = Modifier
                                    .align(Alignment.TopEnd)
                                    .padding(top = 20.dp, end = 130.dp)
                            ) {
                                Image(
                                    painter = painterResource(id = R.drawable.ic_descubrir),
                                    contentDescription = "Buscar",
                                    modifier = Modifier.size(35.dp)
                                )
                            }

                            // ===== BARRA DE BÚSQUEDA =====
                            if (buscarPelis) {
                                OutlinedTextField(
                                    value = buscar,
                                    onValueChange = { buscar = it },
                                    label = {
                                        Text("Buscar", color = Color.White, fontFamily = montserratFontFamily, fontSize = 12.sp)
                                    },
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedTextColor = Color.White,
                                        unfocusedTextColor = Color.White,
                                        focusedBorderColor = Color(0xFF6C63FF),
                                        unfocusedBorderColor = Color.White,
                                        focusedContainerColor = Color.Transparent,
                                        unfocusedContainerColor = Color.Transparent
                                    ),
                                    shape = RoundedCornerShape(30.dp),
                                    modifier = Modifier
                                        .align(Alignment.TopCenter)
                                        .fillMaxWidth()
                                        .padding(start = 20.dp, end = 20.dp, top = 80.dp)
                                        .height(60.dp)
                                )
                            }

                            // ===== CARRUSELES =====
                            LazyColumn(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(top = if (buscarPelis) 150.dp else 80.dp, bottom = 20.dp)
                            ) {
                                // Mostrar cada carrusel activo
                                items(carruselesActivos.toList()) { tituloCarrusel ->
                                    CarruselPeliculas(
                                        titulo = tituloCarrusel,
                                        modoEdicion = modoEdicion,
                                        onEliminar = { carruselesActivos.remove(tituloCarrusel) },
                                        montserratFontFamily = montserratFontFamily
                                    )
                                    Spacer(modifier = Modifier.height(16.dp))
                                }

                                // Botón "Editar/Listo" al final
                                item {
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Button(
                                        onClick = { modoEdicion = !modoEdicion },
                                        colors = ButtonDefaults.buttonColors(
                                            containerColor = if (modoEdicion) Color(0xFFFF5252) else Color(0xFF6C63FF)
                                        ),
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(horizontal = 25.dp)
                                    ) {
                                        Icon(
                                            imageVector = if (modoEdicion) Icons.Default.Close else Icons.Default.Edit,
                                            contentDescription = if (modoEdicion) "Listo" else "Editar",
                                            tint = Color.White
                                        )
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text(
                                            text = if (modoEdicion) "Listo" else "Editar Listas",
                                            color = Color.White,
                                            fontFamily = montserratFontFamily,
                                            fontSize = 16.sp
                                        )
                                    }
                                    Spacer(modifier = Modifier.height(8.dp))
                                }

                                // Botón "Añadir Lista" (solo en modo edición)
                                if (modoEdicion) {
                                    item {
                                        Button(
                                            onClick = { mostrarDialogo = true },
                                            colors = ButtonDefaults.buttonColors(
                                                containerColor = Color(0xFF6C63FF)
                                            ),
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .padding(horizontal = 25.dp)
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.Add,
                                                contentDescription = "Añadir",
                                                tint = Color.White
                                            )
                                            Spacer(modifier = Modifier.width(8.dp))
                                            Text(
                                                text = "Añadir Lista",
                                                color = Color.White,
                                                fontFamily = montserratFontFamily,
                                                fontSize = 16.sp
                                            )
                                        }
                                    }
                                }
                            }

                            // ===== DIÁLOGO PARA AÑADIR LISTAS =====
                            if (mostrarDialogo) {
                                DialogoAñadirLista(
                                    carruselesDisponibles = carruselesDisponibles,
                                    carruselesActivos = carruselesActivos,
                                    onDismiss = { mostrarDialogo = false },
                                    onAñadir = { nuevaLista ->
                                        if (!carruselesActivos.contains(nuevaLista)) {
                                            carruselesActivos.add(nuevaLista)
                                        }
                                    },
                                    montserratFontFamily = montserratFontFamily
                                )
                            }
                        }
                    }
                    //--------------------------------------------------------------------------
                    //Biblioteca
                    //--------------------------------------------------------------------------
                    1 -> {
                        var buscarBiblioteca by remember { mutableStateOf(false) }
                        var buscar by remember { mutableStateOf("") }
                        BackHandler(onBack = { buscarBiblioteca=false })

                        // contenido de biblioteca
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center  // centra el contenido
                        ) {

                            // Título a la izquierda
                            Text(
                                text = "Biblioteca",
                                fontSize = 35.sp,
                                color = Color.White,
                                fontFamily = montserratFontFamily,
                                modifier = Modifier
                                    .align(Alignment.TopStart)
                                    .padding(top = 25.dp, start = 25.dp)
                            )

                            // Botón de búsqueda a la derecha
                            IconButton(
                                onClick = { buscarBiblioteca = !buscarBiblioteca },
                                modifier = Modifier
                                    .align(Alignment.TopEnd)
                                    .padding(top = 20.dp, end = 130.dp)
                            ) {
                                Image(
                                    painter = painterResource(id = R.drawable.ic_descubrir),
                                    contentDescription = "Buscar",
                                    modifier = Modifier.size(35.dp)
                                )
                            }
                            if (buscarBiblioteca){
                                Row (
                                    modifier = Modifier
                                        .align ( Alignment.TopCenter )
                                        .fillMaxWidth()
                                        .padding(top = 80.dp)

                                ){
                                    OutlinedTextField(
                                        value = buscar,
                                        onValueChange = { buscar = it },
                                        label = {
                                            Text("Buscar", color = Color.White,fontFamily = montserratFontFamily, fontSize = 12.sp)
                                        },
                                        colors = OutlinedTextFieldDefaults.colors(
                                            focusedTextColor = Color.White,
                                            unfocusedTextColor = Color.White,
                                            focusedBorderColor = Color(0xFF6C63FF), // borde morado cuando escribes
                                            unfocusedBorderColor = Color.White,
                                            focusedContainerColor = Color.Transparent,
                                            unfocusedContainerColor = Color.Transparent
                                        ),
                                        shape = RoundedCornerShape(30.dp), // esquinas redondeadas

                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(start = 70.dp, end = 20.dp)
                                            .size(60.dp)

                                    )
                                }
                            }

                        }
                    }
                    //--------------------------------------------------------------------------
                    //Tierlists
                    //--------------------------------------------------------------------------
                    2 -> {
                        var buscarTierList by remember { mutableStateOf(false) }
                        var buscar by remember { mutableStateOf("") }
                        BackHandler(onBack = { buscarTierList=false })

                        // contenido de tierlists
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center  // centra el contenido
                        ) {

                            // Título a la izquierda
                            Text(
                                text = "TierLists",
                                fontSize = 35.sp,
                                color = Color.White,
                                fontFamily = montserratFontFamily,
                                modifier = Modifier
                                    .align(Alignment.TopStart)
                                    .padding(top = 25.dp, start = 25.dp)
                            )

                            // Botón de búsqueda a la derecha
                            IconButton(
                                onClick = { buscarTierList = !buscarTierList },
                                modifier = Modifier
                                    .align(Alignment.TopEnd)
                                    .padding(top = 20.dp, end = 130.dp)
                            ) {
                                Image(
                                    painter = painterResource(id = R.drawable.ic_descubrir),
                                    contentDescription = "Buscar",
                                    modifier = Modifier.size(35.dp)
                                )
                            }
                            if (buscarTierList){
                                Row (
                                    modifier = Modifier
                                        .align ( Alignment.TopCenter )
                                        .fillMaxWidth()
                                        .padding(top = 80.dp)

                                ){
                                    OutlinedTextField(
                                        value = buscar,
                                        onValueChange = { buscar = it },
                                        label = {
                                            Text("Buscar", color = Color.White,fontFamily = montserratFontFamily, fontSize = 12.sp)
                                        },
                                        colors = OutlinedTextFieldDefaults.colors(
                                            focusedTextColor = Color.White,
                                            unfocusedTextColor = Color.White,
                                            focusedBorderColor = Color(0xFF6C63FF), // borde morado cuando escribes
                                            unfocusedBorderColor = Color.White,
                                            focusedContainerColor = Color.Transparent,
                                            unfocusedContainerColor = Color.Transparent
                                        ),
                                        shape = RoundedCornerShape(30.dp), // esquinas redondeadas

                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(start = 70.dp, end = 20.dp)
                                            .size(60.dp)

                                    )
                                }
                            }

                        }
                    }
                    //--------------------------------------------------------------------------
                    //Social
                    //--------------------------------------------------------------------------
                    3 -> {
                        var buscarSocial by remember { mutableStateOf(false) }
                        var buscar by remember { mutableStateOf("") }
                        BackHandler(onBack = { buscarSocial=false })

                        // contenido de social
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center  // centra el contenido
                        ) {

                            // Título a la izquierda
                            Text(
                                text = "Social",
                                fontSize = 35.sp,
                                color = Color.White,
                                fontFamily = montserratFontFamily,
                                modifier = Modifier
                                    .align(Alignment.TopStart)
                                    .padding(top = 25.dp, start = 25.dp)
                            )

                            // Botón de búsqueda a la derecha
                            IconButton(
                                onClick = { buscarSocial = !buscarSocial },
                                modifier = Modifier
                                    .align(Alignment.TopEnd)
                                    .padding(top = 20.dp, end = 130.dp)
                            ) {
                                Image(
                                    painter = painterResource(id = R.drawable.ic_descubrir),
                                    contentDescription = "Buscar",
                                    modifier = Modifier.size(35.dp)
                                )
                            }
                            if (buscarSocial){
                                Row (
                                    modifier = Modifier
                                        .align ( Alignment.TopCenter )
                                        .fillMaxWidth()
                                        .padding(top = 80.dp)

                                ){
                                    OutlinedTextField(
                                        value = buscar,
                                        onValueChange = { buscar = it },
                                        label = {
                                            Text("Buscar", color = Color.White,fontFamily = montserratFontFamily, fontSize = 12.sp)
                                        },
                                        colors = OutlinedTextFieldDefaults.colors(
                                            focusedTextColor = Color.White,
                                            unfocusedTextColor = Color.White,
                                            focusedBorderColor = Color(0xFF6C63FF), // borde morado cuando escribes
                                            unfocusedBorderColor = Color.White,
                                            focusedContainerColor = Color.Transparent,
                                            unfocusedContainerColor = Color.Transparent
                                        ),
                                        shape = RoundedCornerShape(30.dp), // esquinas redondeadas

                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(start = 70.dp, end = 20.dp)
                                            .size(60.dp)

                                    )
                                }
                            }

                        }
                    }
                }

                // ===== icono de perfil arriba a la derecha =====
                // este boton siempre esta visible encima de todo el contenido
                IconButton(
                    onClick = {
                        // cuando pulsan el icono, ejecutamos la funcion onNavigateToPerfil()
                        // que viene de AppNavigation y cambia pantallaApp a "perfil"
                        onNavigateToPerfil()
                    },
                    modifier = Modifier
                        .align(Alignment.TopEnd)  // lo ponemos arriba a la derecha
                        .padding(top = 25.dp, end = 25.dp)
                        .size(40.dp)
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.ic_perfil),
                        contentDescription = "Ir al Perfil",
                        contentScale = ContentScale.Crop,  // recorta la imagen para que encaje
                        modifier = Modifier
                            .size(40.dp)                   // tamaño de 40dp
                            .clip(CircleShape)             // forma circular
                            .border(                       // borde alrededor
                                width = 3.dp,
                                color = Color.White,
                                shape = CircleShape
                            )
                    )
                }
            }
        }
    }
}

// ===== funcion para los colores de la barra de navegacion =====
// esta funcion define los colores de los iconos
// todos los iconos son blancos (seleccionados y no seleccionados)
@Composable
fun navBarColors() = NavigationBarItemDefaults.colors(
    selectedIconColor = Color.White,       // icono seleccionado: blanco
    unselectedIconColor = Color.White,     // icono no seleccionado: blanco
    indicatorColor = Color.Transparent     // sin indicador de fondo
)

// ===== COMPONENTE: CARRUSEL DE PELÍCULAS =====
/**
 * Muestra un carrusel horizontal con películas
 * @param titulo Título del carrusel (ej: "Terror 2025")
 * @param modoEdicion Si está en true, muestra el botón de eliminar
 * @param onEliminar Función que se ejecuta al pulsar eliminar
 */
@Composable
fun CarruselPeliculas(
    titulo: String,
    modoEdicion: Boolean,
    onEliminar: () -> Unit,
    montserratFontFamily: FontFamily
) {
    // Películas fake para el carrusel (después se reemplazarán con datos de la API)
    val peliculasFake = remember {
        listOf(
            "Película 1", "Película 2", "Película 3",
            "Película 4", "Película 5", "Película 6"
        )
    }

    Column(
        modifier = Modifier.fillMaxWidth()
    ) {
        // ===== CABECERA DEL CARRUSEL =====
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 25.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            // Título del carrusel
            Text(
                text = titulo,
                fontSize = 20.sp,
                color = Color.White,
                fontFamily = montserratFontFamily,
                fontWeight = FontWeight.SemiBold
            )

            // Botón de eliminar (solo visible en modo edición)
            if (modoEdicion) {
                IconButton(
                    onClick = onEliminar,
                    modifier = Modifier.size(32.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Eliminar carrusel",
                        tint = Color(0xFFFF5252),
                        modifier = Modifier.size(24.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // ===== SCROLL HORIZONTAL DE PELÍCULAS =====
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 25.dp)
        ) {
            items(peliculasFake) { pelicula ->
                // Card de cada película
                Card(
                    modifier = Modifier
                        .width(120.dp)
                        .height(180.dp)
                        .clickable {
                            // Aquí irá la lógica para abrir los detalles de la película
                        },
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = Color(0xFF2A2A3E)
                    )
                ) {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        // Por ahora mostramos solo texto
                        // Después aquí irá la imagen del póster
                        Text(
                            text = pelicula,
                            color = Color.White,
                            fontSize = 14.sp,
                            fontFamily = montserratFontFamily,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(8.dp)
                        )
                    }
                }
            }
        }
    }
}

// ===== COMPONENTE: DIÁLOGO PARA AÑADIR LISTAS =====
/**
 * Diálogo que muestra todas las listas disponibles
 * para que el usuario pueda añadirlas a su página
 */
@Composable
fun DialogoAñadirLista(
    carruselesDisponibles: List<String>,
    carruselesActivos: List<String>,
    onDismiss: () -> Unit,
    onAñadir: (String) -> Unit,
    montserratFontFamily: FontFamily
) {
    // Listas seleccionadas para añadir
    val seleccionadas = remember { mutableStateListOf<String>() }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = "Añadir Listas",
                fontFamily = montserratFontFamily,
                fontSize = 20.sp,
                color = Color.White
            )
        },
        text = {
            // Lista de checkboxes con todas las opciones
            Column(
                modifier = Modifier.fillMaxWidth()
            ) {
                carruselesDisponibles.forEach { carrusel ->
                    // Solo mostrar si no está ya en carruseles activos
                    if (!carruselesActivos.contains(carrusel)) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    if (seleccionadas.contains(carrusel)) {
                                        seleccionadas.remove(carrusel)
                                    } else {
                                        seleccionadas.add(carrusel)
                                    }
                                }
                                .padding(vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Checkbox(
                                checked = seleccionadas.contains(carrusel),
                                onCheckedChange = { checked ->
                                    if (checked) {
                                        seleccionadas.add(carrusel)
                                    } else {
                                        seleccionadas.remove(carrusel)
                                    }
                                },
                                colors = CheckboxDefaults.colors(
                                    checkedColor = Color(0xFF6C63FF),
                                    uncheckedColor = Color.White
                                )
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = carrusel,
                                fontFamily = montserratFontFamily,
                                fontSize = 16.sp,
                                color = Color.White
                            )
                        }
                    }
                }
            }
        },
        confirmButton = {
            TextButton(
                onClick = {
                    // Añadir todas las listas seleccionadas
                    seleccionadas.forEach { lista ->
                        onAñadir(lista)
                    }
                    onDismiss()
                }
            ) {
                Text(
                    text = "Añadir",
                    fontFamily = montserratFontFamily,
                    color = Color(0xFF6C63FF)
                )
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text(
                    text = "Cancelar",
                    fontFamily = montserratFontFamily,
                    color = Color.White
                )
            }
        },
        containerColor = Color(0xFF1A1A2E),
        textContentColor = Color.White
    )
}

// ===== vista previa =====
@Preview(showBackground = true)
@Composable
fun MainScreenPreview() {
    MainScreen(onNavigateToPerfil = {})
}
