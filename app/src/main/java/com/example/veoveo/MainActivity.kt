package com.example.veoveo

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.example.veoveo.ui.navigation.VeoVeoApp
import com.example.veoveo.ui.theme.VeoVeoTheme

/**
 * MAINACTIVITY
 *
 * este es el punto de entrada de la app cuando se abre
 * aqui lo unico que hacemos es:
 * 1. aplicar el tema (colores, fuentes, etc)
 * 2. llamar a VeoVeoApp que es el cerebro de toda la navegacion
 *
 * toda la logica de navegacion esta en VeoVeoApp.kt
 * asi el mainactivity se queda super limpio
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            // aplicamos el tema de veoveo (colores morado, azul, etc)
            VeoVeoTheme {
                // llamamos al cerebro principal que gestiona toda la navegacion
                VeoVeoApp()
            }
        }
    }
}