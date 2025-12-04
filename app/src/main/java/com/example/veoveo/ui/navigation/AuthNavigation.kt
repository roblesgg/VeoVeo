package com.example.veoveo.ui.navigation

import androidx.compose.runtime.*
import com.example.veoveo.ui.screens.LoginScreen

/**
 * NAVEGACION DE AUTENTICACION
 *
 * aqui van todas las pantallas relacionadas con login, registro, recuperar contraseña, etc
 * este componente SOLO se muestra cuando el usuario NO esta logueado
 *
 * por ahora solo tenemos LoginScreen pero mas tarde añadiremos:
 * - RegistroScreen (para crear cuenta nueva)
 * - RecuperarPasswordScreen (para recuperar contraseña)
 */
@Composable
fun AuthNavigation(
    onLoginExitoso: () -> Unit  // esta funcion se ejecuta cuando el usuario se loguea bien
) {

    // estado para saber que pantalla de autenticacion mostrar
    // por ahora solo tenemos login pero cuando tengais registro y demas
    // este estado servira para cambiar entre ellas
    var pantallaAuth by remember { mutableStateOf("login") }

    // decide que pantalla de autenticacion mostrar
    when (pantallaAuth) {
        "login" -> {
            LoginScreen(
                // cuando el login es exitoso llamamos a onLoginExitoso
                // esto hara que VeoVeoApp cambie usuarioLogueado a true
                // y nos lleve a AppNavigation
                logueado = onLoginExitoso

                // aqui irian mas callbacks para ir a otras pantallas:
                // irARegistro = { pantallaAuth = "registro" }
                // irARecuperar = { pantallaAuth = "recuperar" }
            )
        }

        // cuando creeis la pantalla de registro descomentar esto:
        // "registro" -> {
        //     RegistroScreen(
        //         onRegistroExitoso = onLoginExitoso,
        //         volverALogin = { pantallaAuth = "login" }
        //     )
        // }

        // cuando creeis la pantalla de recuperar contraseña:
        // "recuperar" -> {
        //     RecuperarPasswordScreen(
        //         volverALogin = { pantallaAuth = "login" }
        //     )
        // }
    }
}
