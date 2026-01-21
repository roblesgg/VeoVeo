package com.example.veoveo.ui.navigation

import androidx.compose.runtime.*
import androidx.compose.ui.tooling.preview.Preview
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.veoveo.data.AuthRepository
import com.example.veoveo.viewmodel.AuthViewModel

// punto de entrada de la navegacion
// decide si mostrar pantallas de login o pantallas de la app segun estado de sesion
@Composable
fun VeoVeoApp() {
    val authViewModel: AuthViewModel = viewModel()
    val authRepository = remember { AuthRepository() }

    // verifica si hay sesion activa
    var usuarioLogueado by remember { mutableStateOf(authRepository.isUserLoggedIn()) }

    if (usuarioLogueado) {
        // muestra las pantallas de la app
        AppNavigation(
            onCerrarSesion = {
                authViewModel.logout()
                usuarioLogueado = false
            }
        )
    } else {
        // muestra las pantallas de autenticacion
        AuthNavigation(
            onLoginExitoso = {
                usuarioLogueado = true
            }
        )
    }
}

@Preview(showBackground = true)
@Composable
fun VeoVeoAppPreview() {
    VeoVeoApp()
}
