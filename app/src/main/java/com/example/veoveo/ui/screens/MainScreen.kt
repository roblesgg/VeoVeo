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
// Importaciones de Liquid (necesarias para el efecto)
import io.github.fletchmckee.liquid.rememberLiquidState
import io.github.fletchmckee.liquid.liquefiable
import io.github.fletchmckee.liquid.liquid

@Composable
fun MainScreen() {

    // Esta variable es para guardar la pestaña que esta activa
    // 0 = Descubrir
    // 1 = Biblioteca
    // 2 = TierLists
    // 3 = Social
    // 4 = PERFIL.kt (pantalla separada SIN barras)
    var pagina by remember { mutableIntStateOf(0) }

    // Estado para el efecto liquido
    val liquidState = rememberLiquidState()

    // El degradado del fondo (igual que en Login y Perfil)
    val brush = Brush.verticalGradient(
        colors = listOf(
            Color(0xFF1A1A2E), // Azul oscuro arriba
            Color(0xFF4B0082)  // Morado abajo
        )
    )

    // ESTRUCTURA PRINCIPAL:
    // Movemos el Box con el fondo AQUI para que envuelva todo (incluida la barra)
    // Esto es necesario para que el efecto liquid sepa qué distorsionar
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(brush = brush) // Fondo con degradado
            .liquefiable(liquidState)  // Marcamos el fondo como distorsionable
    ) {

        //esto es para que no se enseñe el esqueleto si esta en alguna pestaña como perfil etc..
        if (pagina == 4) {
            //el backjhandle sirve para que cuando le das al boton de atras te lleve a la 0
            BackHandler {
                pagina = 0 // Vuelve a Descubrir
            }
            // Quitamos el Box de fondo que tenías aquí porque ya lo pusimos en el padre
            Box(
                modifier = Modifier.fillMaxSize()
            ) {
                // Botón de VOLVER arriba a la izquierda
                IconButton(
                    onClick = {
                        pagina = 0 // Vuelve a Descubrir
                    },
                    modifier = Modifier
                        .padding(16.dp)
                        .align(Alignment.TopStart) // Arriba a la izquierda
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Volver",
                        tint = Color.White,
                        modifier = Modifier.size(28.dp)
                    )
                }

                // Pantalla de perfil completa
                PerfilScreen()
            }

        } else {

            //el esqueleto con las bar
            Scaffold(
                // Hacemos el Scaffold transparente para que se vea el degradado del padre
                containerColor = Color.Transparent,

                // Barra de abajo navbar
                bottomBar = {
                    // CONTENEDOR FLOTANTE PARA LA BARRA
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            // Margen externo: lo separa de los lados y de abajo
                            .padding(start = 30.dp, end = 30.dp, bottom = 30.dp)
                            // Forma ovalada (cápsula)
                            .clip(RoundedCornerShape(50.dp))
                            // AQUI aplicamos el efecto liquido a la cápsula
                            .liquid(liquidState)
                    ) {
                        NavigationBar(
                            // Color transparente porque el color lo da el efecto liquid o el Box padre
                            containerColor = Color.Black.copy(alpha = 0.3f), // Un poco oscuro y transparente
                            tonalElevation = 0.dp, // Sin elevación por defecto
                            modifier = Modifier.height(70.dp) // Altura de la cápsula
                        ) {
                            //descubrir
                            NavigationBarItem(
                                icon = {
                                    Icon(
                                        painter = painterResource(id = R.drawable.descubrir),
                                        contentDescription = "Descubrir",
                                        modifier = Modifier.size(24.dp)
                                    )
                                },
                                label = { Text("Descubrir", fontSize = 10.sp) }, // Texto un pelin mas pequeño para que quepa

                                //si la pagina es 0 selected se pone true
                                selected = pagina == 0,

                                //si se pulsa se va a 0 que es descubrir
                                onClick = { pagina = 0 },

                                colors = navBarColors() //colores de la navbar
                            )

                            //biblioteca
                            NavigationBarItem(
                                icon = {
                                    Icon(
                                        painter = painterResource(id = R.drawable.biblioteca),
                                        contentDescription = "Biblioteca",
                                        modifier = Modifier.size(24.dp)
                                    )
                                },
                                label = { Text("Biblioteca", fontSize = 10.sp) },
                                selected = pagina == 1,
                                onClick = { pagina = 1 },
                                colors = navBarColors()
                            )

                            //tierliss
                            NavigationBarItem(
                                icon = {
                                    Icon(
                                        painter = painterResource(id = R.drawable.tierlist),
                                        contentDescription = "TierLists",
                                        modifier = Modifier.size(24.dp)
                                    )
                                },
                                label = { Text("TierLists", fontSize = 10.sp) },
                                selected = pagina == 2,
                                onClick = { pagina = 2 },
                                colors = navBarColors()
                            )

                            //social
                            NavigationBarItem(
                                icon = {
                                    Icon(
                                        painter = painterResource(id = R.drawable.social),
                                        contentDescription = "Social",
                                        modifier = Modifier.size(24.dp)
                                    )
                                },
                                label = { Text("Social", fontSize = 10.sp) },
                                selected = pagina == 3,
                                onClick = { pagina = 3 },
                                colors = navBarColors()
                            )
                        }
                    }
                }
            ) { innerPadding ->

                // Esto es lo del centro depende de la pantalla se ve unas cosas u otras
                // innerPadding es el espacio que ocupa la barra de abajo
                Box(
                    modifier = Modifier
                        .padding(innerPadding) // Para que no lo tape la barra de abajo
                        .fillMaxSize()         // Ocupa todo
                    // Quitamos el background de aqui porque ya esta en el padre global
                ) {

                    // Decide que se enseña segun el valor de pagina es un switch
                    when (pagina) {
                        0 -> Box(modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center)
                        {Text("Descubrir coming soon", fontSize = 30.sp, color = Color.Gray)}
                        1 -> Box(modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center)
                        {Text("Biblioteca coming soon", fontSize = 30.sp, color = Color.Gray)}
                        2 -> Box(modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center)
                        {Text("TierLists coming soon", fontSize = 30.sp, color = Color.Gray)}
                        3 -> Box(modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center)
                        {Text("Social coming soon", fontSize = 30.sp, color = Color.Gray)}
                    }

                    //perfil
                    IconButton(
                        onClick = {
                            // Va al indice 4 que es perfil
                            pagina = 4
                        },
                        modifier = Modifier
                            .align(Alignment.TopEnd) // Arriba a la derecha
                            .padding(16.dp) // separa del borde
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.ic_perfil),
                            contentDescription = "Ir al Perfil",
                            contentScale = ContentScale.Crop, // Recorta la foto
                            modifier = Modifier


                                .size(40.dp) // Un poco más grande ahora que está solo
                                .clip(CircleShape) // Lo hace circulo
                                .background(Color.Gray)
                                .border(width = 2.dp, color = Color.DarkGray, shape = CircleShape)
                        )
                    }
                }
            }
        }
    }
}

// Funciones extra

// Colores de la barra de navegación
@Composable
fun navBarColors() = NavigationBarItemDefaults.colors(
    selectedIconColor = Color(0xFF6C63FF),     // Icono seleccionado: morado
    selectedTextColor = Color(0xFF6C63FF),     // Texto seleccionado: morado
    unselectedIconColor = Color.Gray,          // Icono no seleccionado: gris
    unselectedTextColor = Color.Gray,          // Texto no seleccionado: gris
    indicatorColor = Color.Transparent         // Sin indicador de fondo
)

// Vista previa
@Preview(showBackground = true)
@Composable
fun MainScreenPreview() {
    MainScreen()
}