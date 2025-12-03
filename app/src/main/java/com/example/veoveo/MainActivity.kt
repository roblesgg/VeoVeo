package com.example.veoveo

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.example.veoveo.ui.screens.LoginScreen
import com.example.veoveo.ui.screens.MainScreen
import com.example.veoveo.ui.theme.VeoVeoTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            VeoVeoTheme {

                //el remember espara que aguante los cambios
                // Empieza en false para que se vea el login
                var mostrarPantallaPrincipal by remember { mutableStateOf(false) }

                //el cambio de vista
                if (mostrarPantallaPrincipal) {
                    //si es true esta logueado y puede etrar
                    MainScreen()
                } else {
                    //si es false va a hacer el loguin
                    LoginScreen(
                        logueado = {
                            //cambia a true duando se hagael loguin
                            mostrarPantallaPrincipal = true
                        }
                    )
                }
            }
        }
    }
}