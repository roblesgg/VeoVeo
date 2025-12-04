package com.example.veoveo.ui.navigation

import androidx.compose.runtime.*
import com.example.veoveo.ui.screens.AjustesScreen
import com.example.veoveo.ui.screens.MainScreen
import com.example.veoveo.ui.screens.PerfilScreen

/**
 * NAVEGACION DE LA APP
 *
 * aqui van todas las pantallas de la aplicacion cuando el usuario YA esta logueado
 * esto incluye: main (con las 4 pestañas), perfil, ajustes, crear tierlist, etc
 *
 * este componente SOLO se muestra cuando el usuario SI esta logueado
 */
@Composable
fun AppNavigation(
    onCerrarSesion: () -> Unit  // esta funcion se ejecuta cuando el usuario cierra sesion
) {

    // estado para saber que pantalla de la app mostrar
    // empieza en "main" porque es la pantalla principal
    var pantallaApp by remember { mutableStateOf("main") }

    // decide que pantalla mostrar
    when (pantallaApp) {

        // pantalla principal con las 4 pestañas (descubrir, biblioteca, tierlists, social)
        "main" -> {
            MainScreen(
                // cuando le den al icono de perfil arriba a la derecha
                onNavigateToPerfil = {
                    pantallaApp = "perfil"
                }
            )
        }

        // pantalla de perfil (foto, nombre, opciones)
        "perfil" -> {
            PerfilScreen(
                // cuando le den al boton de ajustes
                onAjustesClick = {
                    pantallaApp = "ajustes"
                },

                // cuando le den al boton de bloqueados (por ahora no hace nada)
                onBloqueadosClick = {
                    // aqui ira: pantallaApp = "bloqueados"
                    // cuando creeis esa pantalla
                },

                // cuando le den al boton de desconectar
                onDesconectarClick = {
                    // llama a onCerrarSesion que viene de VeoVeoApp
                    // esto cambia usuarioLogueado a false en VeoVeoApp
                    // y nos lleva de vuelta a AuthNavigation (login)
                    onCerrarSesion()
                },

                // cuando le den a la flecha de volver
                onVolverClick = {
                    pantallaApp = "main"
                }
            )
        }

        // pantalla de ajustes
        "ajustes" -> {
            AjustesScreen(
                // cuando le den a la flecha de volver
                onVolverClick = {
                    pantallaApp = "perfil"
                }
            )
        }

        // aqui iriais añadiendo mas pantallas segun las vayais creando:

        // "crear-tierlist" -> {
        //     CrearTierListScreen(
        //         onVolverClick = { pantallaApp = "main" },
        //         onGuardar = { pantallaApp = "main" }
        //     )
        // }

        // "detalle-pelicula" -> {
        //     DetallePeliculaScreen(
        //         onVolverClick = { pantallaApp = "main" }
        //     )
        // }

        // etc...
    }
}
