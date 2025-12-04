package com.example.veoveo.ui.screens

// ===== importaciones necesarias =====
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
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
                    0 -> {
                        // contenido de descubrir (por ahora solo texto)
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center  // centra el contenido
                        ) {
                            Text(
                                text = "descubrir coming soon",
                                fontSize = 30.sp,
                                color = Color.Gray
                            )
                        }
                    }
                    1 -> {
                        // contenido de biblioteca (por ahora solo texto)
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "biblioteca coming soon",
                                fontSize = 30.sp,
                                color = Color.Gray
                            )
                        }
                    }
                    2 -> {
                        // contenido de tierlists (por ahora solo texto)
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "tierlists coming soon",
                                fontSize = 30.sp,
                                color = Color.Gray
                            )
                        }
                    }
                    3 -> {
                        // contenido de social (por ahora solo texto)
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "social coming soon",
                                fontSize = 30.sp,
                                color = Color.Gray
                            )
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
                        .padding(16.dp)           // margen de 16dp
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.ic_perfil),
                        contentDescription = "Ir al Perfil",
                        contentScale = ContentScale.Crop,  // recorta la imagen para que encaje
                        modifier = Modifier
                            .size(40.dp)                   // tamaño de 40dp
                            .clip(CircleShape)             // forma circular
                            .border(                       // borde alrededor
                                width = 2.dp,
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

// ===== vista previa =====
@Preview(showBackground = true)
@Composable
fun MainScreenPreview() {
    MainScreen(onNavigateToPerfil = {})
}
