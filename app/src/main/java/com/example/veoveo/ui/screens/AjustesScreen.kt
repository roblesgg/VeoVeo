package com.example.veoveo.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.veoveo.R


@Composable
fun AjustesScreen(
    onVolverClick: () -> Unit = {}  // cuando pulsan la flecha de volver
) {
    // el degradado del fondo
    val brush = Brush.verticalGradient(
        colors = listOf(
            Color(0xFF1A1A2E), // azul oscuro arriba
            Color(0xFF4B0082)  // morado abajo
        )
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(brush = brush)
    ) {
        // texto en el centro
        Text(
            text = "ajustes coming soon",
            fontSize = 30.sp,
            color = Color.Gray,
            modifier = Modifier.align(Alignment.Center)
        )

        // boton de atras arriba a la izquierda
        IconButton(
            onClick = { onVolverClick() },
            modifier = Modifier
                .align(Alignment.TopStart)
                .padding(20.dp)
        ) {
            Image(
                painter = painterResource(id = R.drawable.ic_atras),
                contentDescription = "Volver",
                modifier = Modifier.size(28.dp)
            )
        }
    }
}

// vista previa para android studio
@Preview(showBackground = true)
@Composable
fun AjustesScreenPreview() {
    AjustesScreen(onVolverClick = {})
}