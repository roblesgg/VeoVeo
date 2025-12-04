package com.example.veoveo.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/**
 * AJUSTESSCREEN - PANTALLA DE AJUSTES
 *
 * aqui iran las opciones de configuracion de la app
 * por ahora esta vacia pero mas tarde añadireis:
 * - idioma
 * - notificaciones
 * - privacidad
 * - etc
 */
@Composable
fun AjustesScreen(
    onVolverClick: () -> Unit = {}  // cuando pulsan la flecha de volver
) {
    // el degradado del fondo (igual que en todas las pantallas)
    val brush = Brush.verticalGradient(
        colors = listOf(
            Color(0xFF1A1A2E), // azul oscuro arriba
            Color(0xFF4B0082)  // morado abajo
        )
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(brush = brush),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = "ajustes coming soon",
            fontSize = 30.sp,
            color = Color.Gray
        )
    }
}

// vista previa para android studio
@Preview(showBackground = true)
@Composable
fun AjustesScreenPreview() {
    AjustesScreen(onVolverClick = {})
}