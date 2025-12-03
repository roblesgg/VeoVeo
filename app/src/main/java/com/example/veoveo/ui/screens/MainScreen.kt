package com.example.veoveo.ui.screens

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.painterResource
import com.example.veoveo.R
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun MainScreen() {
    // Variable para saber en que pestaña estamos (0=Home, 1=Buscar, 2=Perfil)
    var pagina by remember { mutableIntStateOf(0) }

    //esto es un esqueleto de pantalla
    Scaffold(
        //barra de abajo
        bottomBar = {
            NavigationBar(
                containerColor = Color.Black.copy(alpha = 0.8f) //esto ees para que sea un poco transparente
            ) {
                //descubrir
                NavigationBarItem(
                    icon = { Icon(painter = painterResource(id=R.drawable.descubrir),
                        contentDescription = "Descubrir",
                        modifier = Modifier.size(24.dp)
                    ) },
                    label = { Text("Descubrir") },
                    selected = pagina == 0,
                    onClick = { pagina = 0 },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = Color(0xFF6C63FF), // Morado al seleccionar
                        selectedTextColor = Color(0xFF6C63FF),
                        unselectedIconColor = Color.Gray,
                        unselectedTextColor = Color.Gray,
                        indicatorColor = Color.Transparent // Quita el óvalo de fondo
                    )
                )
                //Biblioteca
                NavigationBarItem(
                    icon = { Icon(painter = painterResource(id=R.drawable.biblioteca),
                        contentDescription = "Bilioteca",
                        modifier = Modifier.size(24.dp)
                    ) },
                    label = { Text("Bilioteca") }, // "Vistas", "Por ver"...
                    selected = pagina == 1,
                    onClick = { pagina = 1 },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = Color(0xFF6C63FF),
                        selectedTextColor = Color(0xFF6C63FF),
                        unselectedIconColor = Color.Gray,
                        unselectedTextColor = Color.Gray,
                        indicatorColor = Color.Transparent
                    )
                )
                //TierLists
                NavigationBarItem(
                    icon = { Icon(painter = painterResource(id=R.drawable.tierlist),
                        contentDescription = "TierLists",
                        modifier = Modifier.size(24.dp)
                    ) },
                    label = { Text("TierLists") },
                    selected = pagina == 2,
                    onClick = { pagina = 2 },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = Color(0xFF6C63FF),
                        selectedTextColor = Color(0xFF6C63FF),
                        unselectedIconColor = Color.Gray,
                        unselectedTextColor = Color.Gray,
                        indicatorColor = Color.Transparent
                    )
                )
                //Social
                NavigationBarItem(
                    icon = { Icon(painter = painterResource(id=R.drawable.social),
                        contentDescription = "Social",
                        modifier = Modifier.size(24.dp)
                    ) },
                    label = { Text("Social") },
                    selected = pagina == 3,
                    onClick = { pagina = 3 },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = Color(0xFF6C63FF),
                        selectedTextColor = Color(0xFF6C63FF),
                        unselectedIconColor = Color.Gray,
                        unselectedTextColor = Color.Gray,
                        indicatorColor = Color.Transparent
                    )
                )
            }
        }
    ) { innerPadding ->
        //esto es lo que cambia
        //este box es del scaffold para que no borre lo de la barra de abajo
        Box(modifier = Modifier.padding(innerPadding)) {
            when (pagina) {
                0 -> Box(Modifier.fillMaxSize(), Alignment.Center){Text("Descubrir coming soon", color = Color.White, fontSize = 30.sp)}
                1 -> Box(Modifier.fillMaxSize(), Alignment.Center){Text("Biblioteca coming soon", color = Color.White, fontSize = 30.sp)}
                2 -> Box(Modifier.fillMaxSize(), Alignment.Center){Text("Tierlists coming soon", color = Color.White, fontSize = 30.sp)}
                3 -> Box(Modifier.fillMaxSize(), Alignment.Center){Text("Social coming soon", color = Color.White, fontSize = 30.sp)}
            }
        }
    }
}