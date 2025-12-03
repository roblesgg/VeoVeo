package com.example.veoveo

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.example.veoveo.ui.screens.LoginScreen // <--- IMPORTANTE: Importamos tu pantalla
import com.example.veoveo.ui.theme.VeoVeoTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge() // Esto hace que ocupe toda la pantalla (detrás de la hora y batería)

        setContent {
            // Aquí aplicamos el tema (colores, tipografía) de tu app
            VeoVeoTheme {
                // ¡Y aquí llamamos a tu pantalla!
                LoginScreen()
            }
        }
    }
}