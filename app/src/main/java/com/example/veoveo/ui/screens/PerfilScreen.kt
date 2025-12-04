package com.example.veoveo.ui.screens

// ===== importaciones necesarias =====
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.veoveo.R

/**
 * ===== PERFILSCREEN - PANTALLA DE PERFIL =====
 *
 * esta pantalla muestra la informacion del usuario y sus opciones
 * estructura super simple:
 *
 * Box principal {
 *   Column (todo el contenido) {
 *     - foto de perfil circular
 *     - nombre de usuario
 *     - Row con estadisticas
 *     - opciones (ajustes, bloqueados, desconectar)
 *   }
 *   IconButton (boton atras encima)
 * }
 *
 * componentes basicos que usa:
 * - Box: contenedor principal
 * - Column: para poner cosas en vertical
 * - Row: para poner cosas en horizontal
 * - Image: para la foto de perfil
 * - Text: para textos
 * - Spacer: para dar espacio entre elementos
 * - HorizontalDivider: lineas divisoras
 */
@Composable
fun PerfilScreen(
    onAjustesClick: () -> Unit = {},        // cuando pulsan ajustes
    onBloqueadosClick: () -> Unit = {},     // cuando pulsan bloqueados
    onDesconectarClick: () -> Unit = {},    // cuando pulsan desconectar
    onVolverClick: () -> Unit = {}          // cuando pulsan la flecha de volver
) {

    // volver atras con boton del movil
    BackHandler(onBack = { onVolverClick() })

    // fuente montserrat
    val montserratFontFamily = FontFamily(
        Font(R.font.montserrat_alternates_semibold, FontWeight.SemiBold)
    )

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
    Box(
        modifier = Modifier
            .fillMaxSize()              // ocupa toda la pantalla
            .background(brush = brush)  // le ponemos el degradado
    ) {

        // ===== columna con todo el contenido del perfil =====
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally  // centra todo horizontalmente
        ) {

            // espacio arriba para no chocar con el boton de atras
            Spacer(modifier = Modifier.height(60.dp))

            // ===== foto de perfil =====
            // imagen circular con borde blanco
            Image(
                painter = painterResource(id = R.drawable.ic_perfil),
                contentDescription = "Foto Perfil",
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .size(110.dp)
                    .clip(CircleShape)
                    .border(3.dp, Color.White, CircleShape)
            )

            Spacer(modifier = Modifier.height(16.dp))

            // ===== nombre de usuario =====
            Text(
                text = "User",
                color = Color.White,
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = montserratFontFamily
            )

            Spacer(modifier = Modifier.height(24.dp))

            // ===== fila de estadisticas =====
            // Row pone las 3 estadisticas en horizontal
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                EstadisticaItem("0", "Peliculas\nVistas")
                EstadisticaItem("0", "Seguidores")
                EstadisticaItem("0", "Reseñas")
            }

            Spacer(modifier = Modifier.height(40.dp))

            // ===== seccion de opciones =====
            // ahora sin Card, solo un Box con fondo semi-transparente
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp))  // esquinas redondeadas
                    .background(Color.Black.copy(alpha = 0.4f))  // fondo negro semi-transparente
                    .padding(16.dp)  // padding dentro del box
            ) {
                Column {

                    // ===== opcion 1: ajustes =====
                    OpcionPerfil(
                        texto = "Ajustes",
                        icono = Icons.Default.Settings,
                        onClick = onAjustesClick
                    )

                    Spacer(modifier = Modifier.height(8.dp))
                    HorizontalDivider(color = Color.Gray.copy(alpha = 0.3f))
                    Spacer(modifier = Modifier.height(8.dp))

                    // ===== opcion 2: bloqueados =====
                    OpcionPerfil(
                        texto = "Bloqueados",
                        icono = Icons.Default.Close,
                        onClick = onBloqueadosClick
                    )

                    Spacer(modifier = Modifier.height(8.dp))
                    HorizontalDivider(color = Color.Gray.copy(alpha = 0.3f))
                    Spacer(modifier = Modifier.height(8.dp))

                    // ===== opcion 3: desconectar =====
                    OpcionPerfil(
                        texto = "Desconectar",
                        icono = Icons.Default.ArrowForward,
                        esDestructivo = true,  // texto rojo
                        onClick = onDesconectarClick
                    )
                }
            }
        }

        // ===== boton de atras arriba a la izquierda =====
        // este boton va ENCIMA de todo
        IconButton(
            onClick = { onVolverClick() },
            modifier = Modifier
                .align(Alignment.TopStart)
                .padding(start = 20.dp, top = 50.dp)
        ) {
            Image(
                painter = painterResource(id = R.drawable.ic_atras),
                contentDescription = "Volver",
                modifier = Modifier.size(28.dp)
            )
        }
    }
}

/**
 * ===== ESTADISTICAITEM - COMPONENTE PARA CADA ESTADISTICA =====
 *
 * muestra un numero grande arriba y una etiqueta pequeña abajo
 */
@Composable
fun EstadisticaItem(numero: String, etiqueta: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        // fuente montserrat
        val montserratFontFamily = FontFamily(
            Font(R.font.montserrat_alternates_semibold, FontWeight.SemiBold)
        )

        Text(
            text = numero,
            color = Color.White,
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = etiqueta,
            color = Color.LightGray,
            fontSize = 12.sp,
            lineHeight = 14.sp,
            textAlign = TextAlign.Center,
            fontFamily = montserratFontFamily
        )
    }
}

/**
 * ===== OPCIONPERFIL - COMPONENTE PARA CADA OPCION =====
 *
 * fila con texto a la izquierda e icono a la derecha
 */
@Composable
fun OpcionPerfil(
    texto: String,
    icono: ImageVector,
    esDestructivo: Boolean = false,
    onClick: () -> Unit = {}
) {
    // fuente montserrat
    val montserratFontFamily = FontFamily(
        Font(R.font.montserrat_alternates_semibold, FontWeight.SemiBold)
    )

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 15.dp)
            .clickable { onClick() },
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = texto,
            color = if (esDestructivo) Color(0xFFFF5252) else Color.White,
            fontSize = 16.sp,
            fontWeight = FontWeight.Medium,
            fontFamily = montserratFontFamily

        )
        Icon(
            imageVector = icono,
            contentDescription = null,
            tint = Color.Gray,
            modifier = Modifier.size(20.dp)
        )
    }
}

// ===== vista previa =====
@Preview(showBackground = true)
@Composable
fun PerfilScreenPreview() {
    PerfilScreen(
        onAjustesClick = {},
        onBloqueadosClick = {},
        onDesconectarClick = {},
        onVolverClick = {}
    )
}
