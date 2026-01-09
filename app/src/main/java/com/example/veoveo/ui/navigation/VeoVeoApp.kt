package com.example.veoveo.ui.navigation

import androidx.compose.runtime.*
import androidx.compose.ui.tooling.preview.Preview
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.veoveo.data.AuthRepository
import com.example.veoveo.viewmodel.AuthViewModel

/**
 * CEREBRO PRINCIPAL DE LA APP
 *
 * este es el punto de entrada de toda la navegacion
 * decide si mostrar las pantallas de login o las pantallas de la app
 * dependiendo de si el usuario esta logueado o no
 *
 * ahora con firebase verifica si hay una sesion activa al iniciar
 */
@Composable
fun VeoVeoApp() {

    // viewmodel de autenticacion para manejar logout
    val authViewModel: AuthViewModel = viewModel()

    // repositorio para verificar si hay sesion activa
    val authRepository = remember { AuthRepository() }

    // este estado guarda si el usuario esta logueado o no
    // ahora verifica con firebase si hay una sesion activa
    var usuarioLogueado by remember { mutableStateOf(authRepository.isUserLoggedIn()) }

    // aqui esta la magia:
    // si esta logueado -> muestra las pantallas de la app (main, perfil, etc)
    // si NO esta logueado -> muestra las pantallas de autenticacion (login, registro, etc)
    if (usuarioLogueado) {
        // ZONA DE LA APP (usuario ya dentro)
        AppNavigation(
            // esta funcion se ejecuta cuando el usuario le da a cerrar sesion
            onCerrarSesion = {
                // primero cerramos sesion en firebase
                authViewModel.logout()
                // luego actualizamos el estado para mostrar el login
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
