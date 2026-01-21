package com.example.veoveo

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.example.veoveo.ui.navigation.VeoVeoApp
import com.example.veoveo.ui.theme.VeoVeoTheme

// punto de entrada de la app
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            VeoVeoTheme {
                VeoVeoApp() // arranca la navegacion
            }
        }
    }
}