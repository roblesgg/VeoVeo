package com.example.veoveo.ui.screens

import androidx.compose.runtime.Composable
import androidx.compose.ui.tooling.preview.Preview

// Esta anotación es necesaria para usar TopAppBar (es experimental aún en Material3)
@Composable
fun AjustesScreen() {

}

// Esto sirve para ver la pantalla a la derecha sin ejecutar el emulador
@Preview(showBackground = true)
@Composable
fun AjustesScreenPreview() {
    AjustesScreen()
}