package com.example.veoveo.ui.screens

import androidx.activity.compose.BackHandler
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
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.veoveo.R

/**
 * MAINSCREEN - PANTALLA PRINCIPAL
 *
 * esta es la pantalla principal de la app cuando ya estas dentro
 * tiene la barra de navegacion de abajo con 4 pestañas:
 * - descubrir
 * - biblioteca
 * - tierlists
 * - social
 *
 * tambien tiene el icono de perfil arriba a la derecha
 * que al pulsarlo llama a onNavigateToPerfil
 */
@Composable
fun MainScreen(
    onNavigateToPerfil: () -> Unit = {}  // funcion que se ejecuta al pulsar el icono de perfil
) {

    // esta variable guarda que pestaña de abajo esta activa
    // 0 = descubrir
    // 1 = biblioteca
    // 2 = tierlists
    // 3 = social
    var paginaActual by remember { mutableIntStateOf(0) }

    // el degradado del fondo (igual que en login y perfil)
    val brush = Brush.verticalGradient(
        colors = listOf(
            Color(0xFF1A1A2E), // azul oscuro arriba
            Color(0xFF4B0082)  // morado abajo
        )
    )

    // caja principal que contiene todo
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(brush = brush)
    ) {

        // el esqueleto principal con la barra de navegacion de abajo
        Scaffold(
            // hacemos el scaffold transparente para que se vea el degradado
            containerColor = Color.Transparent,

            // barra de navegacion de abajo (las 4 pestañas)
            bottomBar = {
                // contenedor flotante para darle forma de capsula a la barra
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(start = 30.dp, end = 30.dp, bottom = 30.dp)
                        .clip(RoundedCornerShape(50.dp))
                        .background(Color.Black.copy(alpha = 0.3f)) // fondo semi-transparente
                ) {
                    NavigationBar(
                        containerColor = Color.Transparent,
                        tonalElevation = 0.dp,
                        modifier = Modifier.height(70.dp)
                    ) {
                        // pestaña descubrir
                        NavigationBarItem(
                            icon = {
                                Icon(
                                    painter = painterResource(id = R.drawable.descubrir),
                                    contentDescription = "Descubrir",
                                    modifier = Modifier.size(24.dp)
                                )
                            },
                            label = { Text("Descubrir", fontSize = 10.sp) },
                            selected = paginaActual == 0,
                            onClick = { paginaActual = 0 },
                            colors = navBarColors()
                        )

                        // pestaña biblioteca
                        NavigationBarItem(
                            icon = {
                                Icon(
                                    painter = painterResource(id = R.drawable.biblioteca),
                                    contentDescription = "Biblioteca",
                                    modifier = Modifier.size(24.dp)
                                )
                            },
                            label = { Text("Biblioteca", fontSize = 10.sp) },
                            selected = paginaActual == 1,
                            onClick = { paginaActual = 1 },
                            colors = navBarColors()
                        )

                        // pestaña tierlists
                        NavigationBarItem(
                            icon = {
                                Icon(
                                    painter = painterResource(id = R.drawable.tierlist),
                                    contentDescription = "TierLists",
                                    modifier = Modifier.size(24.dp)
                                )
                            },
                            label = { Text("TierLists", fontSize = 10.sp) },
                            selected = paginaActual == 2,
                            onClick = { paginaActual = 2 },
                            colors = navBarColors()
                        )

                        // pestaña social
                        NavigationBarItem(
                            icon = {
                                Icon(
                                    painter = painterResource(id = R.drawable.social),
                                    contentDescription = "Social",
                                    modifier = Modifier.size(24.dp)
                                )
                            },
                            label = { Text("Social", fontSize = 10.sp) },
                            selected = paginaActual == 3,
                            onClick = { paginaActual = 3 },
                            colors = navBarColors()
                        )
                    }
                }
            }
        ) { innerPadding ->

            // contenido central que cambia segun la pestaña seleccionada
            Box(
                modifier = Modifier
                    .padding(innerPadding)
                    .fillMaxSize()
            ) {

                // decide que contenido mostrar segun la pestaña activa
                when (paginaActual) {
                    0 -> Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("descubrir coming soon", fontSize = 30.sp, color = Color.Gray)
                    }
                    1 -> Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("biblioteca coming soon", fontSize = 30.sp, color = Color.Gray)
                    }
                    2 -> Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("tierlists coming soon", fontSize = 30.sp, color = Color.Gray)
                    }
                    3 -> Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("social coming soon", fontSize = 30.sp, color = Color.Gray)
                    }
                }

                // boton de perfil arriba a la derecha
                IconButton(
                    onClick = {
                        // cuando pulsan el icono de perfil llamamos a la funcion
                        // que nos pasaron desde AppNavigation
                        onNavigateToPerfil()
                    },
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(16.dp)
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.ic_perfil),
                        contentDescription = "Ir al Perfil",
                        contentScale = ContentScale.Crop,
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(Color.Gray)
                            .border(width = 2.dp, color = Color.DarkGray, shape = CircleShape)
                    )
                }
            }
        }
    }
}

// ===== funciones auxiliares =====

// colores de la barra de navegacion
@Composable
fun navBarColors() = NavigationBarItemDefaults.colors(
    selectedIconColor = Color(0xFF6C63FF),     // icono seleccionado: morado neon
    selectedTextColor = Color(0xFF6C63FF),     // texto seleccionado: morado neon
    unselectedIconColor = Color.Gray,          // icono no seleccionado: gris
    unselectedTextColor = Color.Gray,          // texto no seleccionado: gris
    indicatorColor = Color.Transparent         // sin indicador de fondo
)

// vista previa para android studio
@Preview(showBackground = true)
@Composable
fun MainScreenPreview() {
    MainScreen(onNavigateToPerfil = {})
}