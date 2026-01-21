package com.example.veoveo.ui.navigation

import androidx.compose.runtime.*
import com.example.veoveo.ui.screens.AjustesScreen
import com.example.veoveo.ui.screens.MainScreen
import com.example.veoveo.ui.screens.PerfilScreen

// navegacion de la app
// muestra las pantallas cuando el usuario esta logueado
@Composable
fun AppNavigation(
    onCerrarSesion: () -> Unit
) {
    // controla que pantalla mostrar
    var pantallaApp by remember { mutableStateOf("main") }

    when (pantallaApp) {
        // pantalla principal con las 4 pestañas
        "main" -> {
            MainScreen(
                onNavigateToPerfil = {
                    pantallaApp = "perfil"
                }
            )
        }

        // pantalla de perfil
        "perfil" -> {
            PerfilScreen(
                onAjustesClick = {
                    pantallaApp = "ajustes"
                },
                onBloqueadosClick = {
                    // pendiente implementar
                },
                onDesconectarClick = {
                    onCerrarSesion()
                },
                onVolverClick = {
                    pantallaApp = "main"
                }
            )
        }

        // pantalla de ajustes
        "ajustes" -> {
            AjustesScreen(
                onVolverClick = {
                    pantallaApp = "perfil"
                },
                onCuentaEliminada = {
                    onCerrarSesion()
                }
            )
        }
    }
}
