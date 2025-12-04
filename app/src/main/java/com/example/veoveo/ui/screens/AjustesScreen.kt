package com.example.veoveo.ui.screens

// ===== importaciones necesarias =====
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
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

/**
 * ===== AJUSTESSCREEN - PANTALLA DE AJUSTES =====
 *
 * esta pantalla es para configurar la app
 * por ahora solo muestra un texto de "coming soon"
 *
 * tiene 2 elementos:
 * 1. texto en el centro que dice "ajustes coming soon"
 * 2. boton de atras arriba a la izquierda para volver al perfil
 *
 * componentes basicos que usa:
 * - Box: contenedor principal
 * - Text: para el texto del centro
 * - IconButton: boton con icono para volver
 * - Image: la imagen del icono de atras
 */
@Composable
fun AjustesScreen(
    onVolverClick: () -> Unit = {}  // funcion que se ejecuta cuando pulsan la flecha de volver
) {

    // ===== colores del fondo =====
    // el mismo degradado de siempre
    val brush = Brush.verticalGradient(
        colors = listOf(
            Color(0xFF1A1A2E), // azul oscuro arriba
            Color(0xFF4B0082)  // morado abajo
        )
    )

    // ===== contenedor principal =====
    // Box es un contenedor donde puedes poner elementos uno encima del otro
    // y usar .align() para posicionarlos donde quieras
    Box(
        modifier = Modifier
            .fillMaxSize()              // ocupa toda la pantalla
            .background(brush = brush)  // le ponemos el degradado
    ) {

        // ===== texto en el centro =====
        // este texto aparece en el medio de la pantalla
        Text(
            text = "ajustes coming soon",
            fontSize = 30.sp,
            color = Color.Gray,
            modifier = Modifier.align(Alignment.Center)  // lo centra en el Box
        )

        // ===== boton de atras arriba a la izquierda =====
        // IconButton es un boton que contiene un icono
        IconButton(
            onClick = {
                // cuando pulsan el boton, ejecutamos onVolverClick()
                // que viene de AppNavigation y vuelve a la pantalla de perfil
                onVolverClick()
            },
            modifier = Modifier
                .align(Alignment.TopStart)  // lo pone arriba a la izquierda
                .padding(20.dp)             // margen de 20dp desde el borde
        ) {
            // icono de flecha hacia atras
            Image(
                painter = painterResource(id = R.drawable.ic_atras),
                contentDescription = "Volver",
                modifier = Modifier.size(28.dp)  // tamaño del icono
            )
        }
    }
}

// ===== vista previa =====
// esto sirve para ver la pantalla en android studio sin ejecutar el emulador
@Preview(showBackground = true)
@Composable
fun AjustesScreenPreview() {
    AjustesScreen(onVolverClick = {})
}
