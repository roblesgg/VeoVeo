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
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
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
 * tiene varias partes:
 *
 * 1. boton de atras arriba a la izquierda
 * 2. foto de perfil circular en la parte de arriba
 * 3. nombre de usuario debajo de la foto
 * 4. estadisticas (peliculas vistas, seguidores, reseñas)
 * 5. tarjeta con opciones:
 *    - ajustes: para configurar la app
 *    - bloqueados: para ver usuarios bloqueados
 *    - desconectar: para cerrar sesion
 *
 * componentes basicos que usa:
 * - Box: contenedor principal
 * - Column: para poner cosas en vertical
 * - Row: para poner cosas en horizontal
 * - Image: para la foto de perfil
 * - Text: para textos
 * - Card: tarjeta con fondo semi-transparente
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

        // ===== columna con todo el contenido del perfil =====
        // esta Column tiene toda la info del usuario centrada
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally  // centra todo horizontalmente
        ) {

            // espacio arriba para no chocar con el boton de atras
            Spacer(modifier = Modifier.height(60.dp))

            // ===== foto de perfil =====
            // imagen circular con borde
            Image(
                painter = painterResource(id = R.drawable.ic_perfil),
                contentDescription = "Foto Perfil",
                contentScale = ContentScale.Crop,  // recorta la imagen para que encaje
                modifier = Modifier
                    .size(110.dp)                  // tamaño de 110dp
                    .clip(CircleShape)             // forma circular
                    .border(                       // borde alrededor
                        width = 2.dp,
                        color = Color(0xFF1A1A2E),
                        shape = CircleShape
                    )
            )

            // espacio entre foto y nombre
            Spacer(modifier = Modifier.height(16.dp))

            // ===== nombre de usuario =====
            Text(
                text = "Maryluu_32",
                color = Color.White,
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold
            )

            // espacio entre nombre y estadisticas
            Spacer(modifier = Modifier.height(24.dp))

            // ===== fila de estadisticas =====
            // Row pone las 3 estadisticas en horizontal (una al lado de otra)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly  // distribuye el espacio uniformemente
            ) {
                // cada estadistica usa la funcion EstadisticaItem (ver abajo)
                EstadisticaItem("129", "Peliculas\nVistas")
                EstadisticaItem("3680", "Seguidores")
                EstadisticaItem("93", "Reseñas")
            }

            // espacio entre estadisticas y tarjeta de opciones
            Spacer(modifier = Modifier.height(40.dp))

            // ===== tarjeta con opciones =====
            // Card es un contenedor con fondo y bordes redondeados
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),  // esquinas redondeadas
                colors = CardDefaults.cardColors(
                    containerColor = Color.Black.copy(alpha = 0.4f)  // fondo negro semi-transparente
                )
            ) {
                // columna dentro de la tarjeta
                Column(modifier = Modifier.padding(16.dp)) {

                    // ===== opcion 1: ajustes =====
                    OpcionPerfil(
                        texto = "Ajustes",
                        icono = Icons.Default.Settings,  // icono de engranaje
                        onClick = onAjustesClick         // funcion que viene de AppNavigation
                    )

                    // espacio y linea divisora
                    Spacer(modifier = Modifier.height(8.dp))
                    HorizontalDivider(color = Color.Gray.copy(alpha = 0.3f))  // linea gris semi-transparente
                    Spacer(modifier = Modifier.height(8.dp))

                    // ===== opcion 2: bloqueados =====
                    OpcionPerfil(
                        texto = "Bloqueados",
                        icono = Icons.Default.Close,     // icono de X
                        onClick = onBloqueadosClick      // funcion que viene de AppNavigation
                    )

                    // espacio y linea divisora
                    Spacer(modifier = Modifier.height(8.dp))
                    HorizontalDivider(color = Color.Gray.copy(alpha = 0.3f))
                    Spacer(modifier = Modifier.height(8.dp))

                    // ===== opcion 3: desconectar =====
                    OpcionPerfil(
                        texto = "Desconectar",
                        icono = Icons.Default.ArrowForward,  // icono de flecha
                        esDestructivo = true,                // true = texto rojo (accion peligrosa)
                        onClick = onDesconectarClick         // funcion que viene de AppNavigation
                    )
                }
            }
        }

        // ===== boton de atras arriba a la izquierda =====
        // este boton va ENCIMA de todo el contenido
        // por eso esta fuera de la Column y dentro del Box
        IconButton(
            onClick = {
                // cuando pulsan el boton, ejecutamos onVolverClick()
                // que viene de AppNavigation y vuelve a la pantalla main
                onVolverClick()
            },
            modifier = Modifier
                .align(Alignment.TopStart)  // lo pone arriba a la izquierda
                .padding(start = 20.dp, top = 50.dp)  // margen izquierda 20dp, arriba 50dp para bajarlo
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

/**
 * ===== ESTADISTICAITEM - COMPONENTE PARA CADA ESTADISTICA =====
 *
 * este componente muestra un numero grande arriba y una etiqueta pequeña abajo
 * se usa para mostrar: peliculas vistas, seguidores, reseñas
 *
 * parametros:
 * - numero: el numero que se muestra arriba (ej: "129")
 * - etiqueta: el texto que se muestra abajo (ej: "Peliculas\nVistas")
 */
@Composable
fun EstadisticaItem(numero: String, etiqueta: String) {
    // columna para poner el numero arriba y la etiqueta abajo
    Column(horizontalAlignment = Alignment.CenterHorizontally) {

        // numero grande
        Text(
            text = numero,
            color = Color.White,
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold
        )

        // etiqueta pequeña debajo
        Text(
            text = etiqueta,
            color = Color.LightGray,
            fontSize = 12.sp,
            lineHeight = 14.sp,              // altura de linea para textos con \n
            textAlign = TextAlign.Center     // centra el texto
        )
    }
}

/**
 * ===== OPCIONPERFIL - COMPONENTE PARA CADA OPCION DE LA TARJETA =====
 *
 * este componente muestra una fila con:
 * - texto a la izquierda (ej: "Ajustes")
 * - icono a la derecha (ej: engranaje)
 *
 * cuando lo pulsas, ejecuta la funcion onClick
 *
 * parametros:
 * - texto: el texto que se muestra (ej: "Ajustes")
 * - icono: el icono que se muestra (ej: Icons.Default.Settings)
 * - esDestructivo: si es true, el texto es rojo (para acciones peligrosas como desconectar)
 * - onClick: funcion que se ejecuta cuando lo pulsas
 */
@Composable
fun OpcionPerfil(
    texto: String,
    icono: ImageVector,
    esDestructivo: Boolean = false,
    onClick: () -> Unit = {}
) {
    // fila horizontal con el texto a la izquierda y el icono a la derecha
    Row(
        modifier = Modifier
            .fillMaxWidth()                  // ocupa todo el ancho
            .padding(vertical = 15.dp)       // margen vertical de 15dp
            .clickable { onClick() },        // cuando lo pulsas, ejecuta onClick
        verticalAlignment = Alignment.CenterVertically,        // centra verticalmente
        horizontalArrangement = Arrangement.SpaceBetween       // pone el texto y el icono en los extremos
    ) {

        // texto a la izquierda
        Text(
            text = texto,
            color = if (esDestructivo) Color(0xFFFF5252) else Color.White,  // rojo si es destructivo, blanco si no
            fontSize = 16.sp,
            fontWeight = FontWeight.Medium
        )

        // icono a la derecha
        Icon(
            imageVector = icono,
            contentDescription = null,
            tint = Color.Gray,          // color gris
            modifier = Modifier.size(20.dp)  // tamaño de 20dp
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
