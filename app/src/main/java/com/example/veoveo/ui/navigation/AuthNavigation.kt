package com.example.veoveo.ui.navigation

import androidx.compose.runtime.*
import com.example.veoveo.ui.screens.LoginScreen
import com.example.veoveo.ui.screens.RegisterScreen

/**
 * NAVEGACION DE AUTENTICACION
 *
 * aqui van todas las pantallas relacionadas con login, registro, recuperar contraseña, etc
 * este componente SOLO se muestra cuando el usuario NO esta logueado
 *
 * Incluye:
 * - LoginScreen (para iniciar sesión)
 * - RegisterScreen (para crear cuenta nueva)
 */
@Composable
fun AuthNavigation(
    onLoginExitoso: () -> Unit  // esta funcion se ejecuta cuando el usuario se loguea bien
) {

    // estado para saber que pantalla de autenticacion mostrar
    var pantallaAuth by remember { mutableStateOf("login") }

    // decide que pantalla de autenticacion mostrar
    when (pantallaAuth) {
        "login" -> {
            LoginScreen(
                // cuando el login es exitoso llamamos a onLoginExitoso
                // esto hara que VeoVeoApp cambie usuarioLogueado a true
                // y nos lleve a AppNavigation
                logueado = onLoginExitoso,
                // navega a la pantalla de registro
                onRegisterClick = { pantallaAuth = "registro" }
            )
        }

        "registro" -> {
            RegisterScreen(
                onRegisterSuccess = onLoginExitoso,  // cuando se registra correctamente, lo llevamos a la app
                onBackToLogin = { pantallaAuth = "login" }  // volver al login
            )
        }

        // cuando creeis la pantalla de recuperar contraseña:
        // "recuperar" -> {
        //     RecuperarPasswordScreen(
        //         volverALogin = { pantallaAuth = "login" }
        //     )
        // }
    }
}
