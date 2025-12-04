package com.example.veoveo.ui.navigation

import androidx.compose.runtime.*
import androidx.compose.ui.tooling.preview.Preview

/**
 * CEREBRO PRINCIPAL DE LA APP
 *
 * este es el punto de entrada de toda la navegacion
 * decide si mostrar las pantallas de login o las pantallas de la app
 * dependiendo de si el usuario esta logueado o no
 *
 * mas tarde cuando metamos firebase aqui ira la logica de verificar
 * si el usuario tiene sesion activa
 */
@Composable
fun VeoVeoApp() {

    // este estado guarda si el usuario esta logueado o no
    // por ahora empieza en false para que salga el login
    // mas tarde esto vendra de firebase (comprobar si hay sesion activa)
    var usuarioLogueado by remember { mutableStateOf(false) }

    // aqui esta la magia:
    // si esta logueado -> muestra las pantallas de la app (main, perfil, etc)
    // si NO esta logueado -> muestra las pantallas de autenticacion (login, registro, etc)
    if (usuarioLogueado) {
        // ZONA DE LA APP (usuario ya dentro)
        AppNavigation(
            // esta funcion se ejecuta cuando el usuario le da a cerrar sesion
            onCerrarSesion = {
                usuarioLogueado = false
            }
        )
    } else {
        // ZONA DE AUTENTICACION (login, registro, recuperar contraseña)
        AuthNavigation(
            // esta funcion se ejecuta cuando el usuario se loguea correctamente
            onLoginExitoso = {
                usuarioLogueado = true
            }
        )
    }
}

// preview para ver como funciona
@Preview(showBackground = true)
@Composable
fun VeoVeoAppPreview() {
    VeoVeoApp()
}
