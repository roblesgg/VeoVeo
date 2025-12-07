package com.example.veoveo.ui.screens

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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.veoveo.R

// pantalla de detalle de una pelicula con informacion completa
@Composable
fun PeliculaScreen(
    nombrePelicula: String = "Titulo de la Pelicula",
    onVolverClick: () -> Unit = {}
) {

    // fuente personalizada montserrat
    val font = FontFamily(Font(R.font.montserrat_alternates_semibold, FontWeight.SemiBold))

    // degradado de fondo morado oscuro
    val brush = Brush.verticalGradient(listOf(Color(0xFF1A1A2E), Color(0xFF4B0082)))

    // controla si cada seccion esta expandida o colapsada
    var descripcionExpandida by remember { mutableStateOf(false) }
    var repartoExpandido by remember { mutableStateOf(false) }
    var puntuacionExpandida by remember { mutableStateOf(false) }
    var amigosVieronExpandido by remember { mutableStateOf(false) }
    var amigosQuierenVerExpandido by remember { mutableStateOf(false) }

    // controla el estado de la pelicula (0=sin ver, 1=por ver, 2=vista)
    var estadoPelicula by remember { mutableStateOf(0) }

    // datos de ejemplo
    val descripcion = "Una historia epica sobre aventuras, accion y emociones. La pelicula sigue a un grupo de heroes en su viaje para salvar el mundo de una amenaza inminente. Con efectos visuales impresionantes y una banda sonora memorable."

    val reparto = listOf(
        "Actor Principal 1",
        "Actor Principal 2",
        "Actriz Secundaria 1",
        "Actor de Reparto 1",
        "Actor de Reparto 2"
    )

    val puntuacionMedia = 8.5f
    val totalVotos = 1234

    val amigosVieron = listOf("Amigo 1", "Amigo 2", "Amigo 3", "Amigo 4")
    val amigosQuierenVer = listOf("Amigo 5", "Amigo 6", "Amigo 7")

    // maneja el boton atras del dispositivo
    BackHandler(onBack = onVolverClick)

    // caja principal con degradado de fondo
    Box(modifier = Modifier.fillMaxSize().background(brush)) {

        // columna con scroll para todo el contenido
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(top = 70.dp, start = 25.dp, end = 25.dp, bottom = 30.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {

            // caratula de la pelicula
            Card(
                modifier = Modifier.width(200.dp).height(300.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF2A2A3E))
            ) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(
                        "Caratula",
                        color = Color.White,
                        fontSize = 16.sp,
                        fontFamily = font,
                        textAlign = TextAlign.Center
                    )
                }
            }

            Spacer(Modifier.height(24.dp))

            // titulo de la pelicula
            Text(
                nombrePelicula,
                fontSize = 28.sp,
                color = Color.White,
                fontFamily = font,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center
            )

            Spacer(Modifier.height(24.dp))

            // botones para anadir a por ver o marcar como vista
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // boton por ver
                Button(
                    onClick = { estadoPelicula = if (estadoPelicula == 1) 0 else 1 },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (estadoPelicula == 1) Color(0xFF6C63FF) else Color(0xFF2A2A3E)
                    ),
                    modifier = Modifier.weight(1f).height(70.dp)
                ) {
                    if (estadoPelicula == 1) {
                        Icon(Icons.Default.Check, null, tint = Color.White, modifier = Modifier.size(20.dp))
                        Spacer(Modifier.width(8.dp))
                    }
                    Text(
                        if (estadoPelicula == 1) "En Por Ver" else "Anadir a Por Ver",
                        color = Color.White,
                        fontFamily = font,
                        fontSize = 14.sp
                    )
                }

                // boton vista
                Button(
                    onClick = { estadoPelicula = if (estadoPelicula == 2) 0 else 2 },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (estadoPelicula == 2) Color(0xFF4CAF50) else Color(0xFF2A2A3E)
                    ),
                    modifier = Modifier.weight(1f).height(70.dp)
                ) {
                    if (estadoPelicula == 2) {
                        Icon(Icons.Default.Check, null, tint = Color.White, modifier = Modifier.size(20.dp))
                        Spacer(Modifier.width(8.dp))
                    }
                    Text(
                        if (estadoPelicula == 2) "Marcada Vista" else "Marcar como Vista",
                        color = Color.White,
                        fontFamily = font,
                        fontSize = 14.sp
                    )
                }
            }

            Spacer(Modifier.height(32.dp))

            // seccion descripcion
            SeccionDesplegable(
                titulo = "Descripcion",
                expandida = descripcionExpandida,
                onToggle = { descripcionExpandida = !descripcionExpandida },
                font = font
            ) {
                Text(
                    descripcion,
                    fontSize = 14.sp,
                    color = Color.White.copy(alpha = 0.9f),
                    fontFamily = font,
                    lineHeight = 20.sp,
                    modifier = Modifier.padding(16.dp)
                )
            }

            Spacer(Modifier.height(12.dp))

            // seccion reparto
            SeccionDesplegable(
                titulo = "Reparto",
                expandida = repartoExpandido,
                onToggle = { repartoExpandido = !repartoExpandido },
                font = font
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    reparto.forEach { actor ->
                        Text(
                            "• $actor",
                            fontSize = 14.sp,
                            color = Color.White.copy(alpha = 0.9f),
                            fontFamily = font,
                            modifier = Modifier.padding(vertical = 4.dp)
                        )
                    }
                }
            }

            Spacer(Modifier.height(12.dp))

            // seccion puntuacion
            SeccionDesplegable(
                titulo = "Puntuacion Media",
                expandida = puntuacionExpandida,
                onToggle = { puntuacionExpandida = !puntuacionExpandida },
                font = font
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.Star,
                            contentDescription = "estrella",
                            tint = Color(0xFFFFD700),
                            modifier = Modifier.size(40.dp)
                        )
                        Spacer(Modifier.width(8.dp))
                        Text(
                            puntuacionMedia.toString(),
                            fontSize = 36.sp,
                            color = Color.White,
                            fontFamily = font,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            "/10",
                            fontSize = 20.sp,
                            color = Color.White.copy(alpha = 0.7f),
                            fontFamily = font,
                            modifier = Modifier.padding(top = 8.dp)
                        )
                    }
                    Spacer(Modifier.height(8.dp))
                    Text(
                        "$totalVotos votos",
                        fontSize = 12.sp,
                        color = Color.White.copy(alpha = 0.6f),
                        fontFamily = font
                    )
                }
            }

            Spacer(Modifier.height(12.dp))

            // seccion amigos que la vieron
            SeccionDesplegable(
                titulo = "Amigos que la vieron",
                expandida = amigosVieronExpandido,
                onToggle = { amigosVieronExpandido = !amigosVieronExpandido },
                font = font
            ) {
                if (amigosVieron.isEmpty()) {
                    Text(
                        "Ningun amigo ha visto esta pelicula aun",
                        fontSize = 14.sp,
                        color = Color.White.copy(alpha = 0.6f),
                        fontFamily = font,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(16.dp)
                    )
                } else {
                    Column(modifier = Modifier.padding(16.dp)) {
                        amigosVieron.forEach { amigo ->
                            Row(
                                modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Image(
                                    painterResource(R.drawable.ic_perfil),
                                    contentDescription = "perfil",
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier
                                        .size(32.dp)
                                        .clip(CircleShape)
                                        .border(2.dp, Color.White, CircleShape)
                                )
                                Spacer(Modifier.width(12.dp))
                                Text(
                                    amigo,
                                    fontSize = 14.sp,
                                    color = Color.White,
                                    fontFamily = font
                                )
                            }
                        }
                    }
                }
            }

            Spacer(Modifier.height(12.dp))

            // seccion amigos que quieren verla
            SeccionDesplegable(
                titulo = "Amigos que quieren verla",
                expandida = amigosQuierenVerExpandido,
                onToggle = { amigosQuierenVerExpandido = !amigosQuierenVerExpandido },
                font = font
            ) {
                if (amigosQuierenVer.isEmpty()) {
                    Text(
                        "Ningun amigo quiere ver esta pelicula aun",
                        fontSize = 14.sp,
                        color = Color.White.copy(alpha = 0.6f),
                        fontFamily = font,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(16.dp)
                    )
                } else {
                    Column(modifier = Modifier.padding(16.dp)) {
                        amigosQuierenVer.forEach { amigo ->
                            Row(
                                modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Image(
                                    painterResource(R.drawable.ic_perfil),
                                    contentDescription = "perfil",
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier
                                        .size(32.dp)
                                        .clip(CircleShape)
                                        .border(2.dp, Color.White, CircleShape)
                                )
                                Spacer(Modifier.width(12.dp))
                                Text(
                                    amigo,
                                    fontSize = 14.sp,
                                    color = Color.White,
                                    fontFamily = font
                                )
                            }
                        }
                    }
                }
            }

            Spacer(Modifier.height(32.dp))
        }

        // boton de volver arriba izquierda
        IconButton(
            onClick = onVolverClick,
            modifier = Modifier
                .align(Alignment.TopStart)
                .padding(start = 20.dp, top = 25.dp)
        ) {
            Icon(
                Icons.AutoMirrored.Filled.ArrowBack,
                contentDescription = "volver",
                tint = Color.White,
                modifier = Modifier.size(28.dp)
            )
        }
    }
}

// componente reutilizable para secciones desplegables
@Composable
fun SeccionDesplegable(
    titulo: String,
    expandida: Boolean,
    onToggle: () -> Unit,
    font: FontFamily,
    contenido: @Composable () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF2A2A3E))
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {

            // cabecera clickable para expandir/contraer
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onToggle() }
                    .padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    titulo,
                    fontSize = 18.sp,
                    color = Color.White,
                    fontFamily = font,
                    fontWeight = FontWeight.Bold
                )
                Icon(
                    if (expandida) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                    contentDescription = if (expandida) "contraer" else "expandir",
                    tint = Color.White,
                    modifier = Modifier.size(24.dp)
                )
            }

            // contenido que se muestra solo si esta expandida
            if (expandida) {
                contenido()
            }
        }
    }
}

// vista previa
@androidx.compose.ui.tooling.preview.Preview(showBackground = true)
@Composable
fun PeliculaScreenPreview() {
    PeliculaScreen()
}
