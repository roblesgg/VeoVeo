package com.example.veoveo.ui.navigation

import androidx.compose.runtime.*
import com.example.veoveo.ui.screens.LoginScreen
import com.example.veoveo.ui.screens.RegisterScreen

// navegacion de autenticacion
// muestra las pantallas de login y registro cuando el usuario no esta logueado
@Composable
fun AuthNavigation(
    onLoginExitoso: () -> Unit
) {
    // controla que pantalla mostrar
    var pantallaAuth by remember { mutableStateOf("login") }

    when (pantallaAuth) {
        "login" -> {
            LoginScreen(
                logueado = onLoginExitoso,
                onRegisterClick = { pantallaAuth = "registro" }
            )
        }

        "registro" -> {
            RegisterScreen(
                onRegisterSuccess = onLoginExitoso,
                onBackToLogin = { pantallaAuth = "login" }
            )
        }
    }
}
