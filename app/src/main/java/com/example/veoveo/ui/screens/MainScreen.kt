package com.example.veoveo.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.veoveo.R

@OptIn(ExperimentalMaterial3Api::class) // Necesario para la TopBar
@Composable
fun MainScreen() {
    // Variable para saber en qué pestaña estamos
    var pagina by remember { mutableIntStateOf(0) }

    Scaffold(
        // 1. BARRA DE ARRIBA (PERFIL)
        topBar = {
            TopAppBar(
                title = { }, // Título vacío para que no ocupe espacio
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.Transparent // Fondo transparente
                ),
                actions = {
                    // ICONO A LA DERECHA
                    IconButton(onClick = {
                        // Al pulsar, vamos a la pantalla de Perfil (índice 3)
                        pagina = 3
                    }) {
                        Image(
                            painter = painterResource(id = R.drawable.ic_perfil), // Tu foto de perfil
                            contentDescription = "Ir al Perfil",
                            contentScale = ContentScale.Crop, // Recorta para llenar el círculo
                            modifier = Modifier
                                .size(32.dp)       // Tamaño pequeño
                                .clip(CircleShape) // ¡Lo hace redondo!
                                .background(Color.Gray) // Fondo por si la imagen es PNG transparente
                        )
                    }
                }
            )
        },

        // 2. BARRA DE ABAJO (NAVEGACIÓN)
        bottomBar = {
            NavigationBar(
                containerColor = Color.Black.copy(alpha = 0.8f)
            ) {
                // Item 0: Descubrir
                NavigationBarItem(
                    icon = {
                        Icon(
                            painter = painterResource(id = R.drawable.descubrir),
                            contentDescription = "Descubrir",
                            modifier = Modifier.size(24.dp)
                        )
                    },
                    label = { Text("Descubrir") },
                    selected = pagina == 0,
                    onClick = { pagina = 0 },
                    colors = navBarColors() // Uso la función de abajo para no repetir código
                )

                // Item 1: Biblioteca
                NavigationBarItem(
                    icon = {
                        Icon(
                            painter = painterResource(id = R.drawable.biblioteca),
                            contentDescription = "Biblioteca",
                            modifier = Modifier.size(24.dp)
                        )
                    },
                    label = { Text("Biblioteca") },
                    selected = pagina == 1,
                    onClick = { pagina = 1 },
                    colors = navBarColors()
                )

                // Item 2: TierLists
                NavigationBarItem(
                    icon = {
                        Icon(
                            painter = painterResource(id = R.drawable.tierlist),
                            contentDescription = "TierLists",
                            modifier = Modifier.size(24.dp)
                        )
                    },
                    label = { Text("TierLists") },
                    selected = pagina == 2,
                    onClick = { pagina = 2 },
                    colors = navBarColors()
                )

                // Item 3: Social
                NavigationBarItem(
                    icon = {
                        Icon(
                            painter = painterResource(id = R.drawable.social),
                            contentDescription = "Social",
                            modifier = Modifier.size(24.dp)
                        )
                    },
                    label = { Text("Social") },
                    selected = pagina == 3,
                    onClick = { pagina = 3 },
                    colors = navBarColors()
                )
            }
        }
    ) { innerPadding ->

        // 3. CONTENIDO CENTRAL
        Box(
            modifier = Modifier
                .padding(innerPadding)
                .fillMaxSize()
                .background(Color.Black)
        ) {
            when (pagina) {
                0 -> Mensaje("Descubrir coming soon")
                1 -> Mensaje("Biblioteca coming soon")
                2 -> Mensaje("Tierlists coming soon")
                3 -> PerfilScreen() // Llamamos a tu archivo Perfil.kt
            }
        }
    }
}

// --- FUNCIONES DE AYUDA ---

@Composable
fun Mensaje(texto: String) {
    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text(text = texto, color = Color.White, fontSize = 30.sp)
    }
}

@Composable
fun navBarColors() = NavigationBarItemDefaults.colors(
    selectedIconColor = Color(0xFF6C63FF),
    selectedTextColor = Color(0xFF6C63FF),
    unselectedIconColor = Color.Gray,
    unselectedTextColor = Color.Gray,
    indicatorColor = Color.Transparent
)

@Preview(showBackground = true)
@Composable
fun MainScreenPreview() {
    MainScreen()
}