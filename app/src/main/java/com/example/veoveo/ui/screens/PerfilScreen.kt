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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
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
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.example.veoveo.R
import com.example.veoveo.viewmodel.ViewModelPerfil

@Composable
fun PerfilScreen(
    onAjustesClick: () -> Unit = {},
    onBloqueadosClick: () -> Unit = {},
    onDesconectarClick: () -> Unit = {},
    onVolverClick: () -> Unit = {},
    viewModel: ViewModelPerfil = viewModel()
) {
    // Estados del ViewModel
    val usuario by viewModel.usuario.collectAsState()
    val cargando by viewModel.cargando.collectAsState()
    val actualizandoUsername by viewModel.actualizandoUsername.collectAsState()
    val error by viewModel.error.collectAsState()
    val mensaje by viewModel.mensaje.collectAsState()
    val peliculasVistas by viewModel.peliculasVistas.collectAsState()
    val cantidadAmigos by viewModel.cantidadAmigos.collectAsState()
    val cantidadResenas by viewModel.cantidadResenas.collectAsState()

    // Estados locales
    var mostrarDialogoUsername by remember { mutableStateOf(false) }
    var nuevoUsername by remember { mutableStateOf("") }

    // TODO: Implementar selector de imagen cuando se agregue Firebase Storage
    // Por ahora la funcionalidad de cambiar foto está deshabilitada

    // Cargar perfil al iniciar
    LaunchedEffect(Unit) {
        viewModel.cargarPerfil()
    }

    // Volver atrás con botón del dispositivo
    BackHandler(onBack = onVolverClick)

    // Fuente
    val font = FontFamily(Font(R.font.montserrat_alternates_semibold, FontWeight.SemiBold))

    // Degradado de fondo
    val brush = Brush.verticalGradient(listOf(Color(0xFF1A1A2E), Color(0xFF4B0082)))

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(brush = brush)
    ) {
        if (cargando) {
            // Pantalla de carga inicial
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Color.White)
            }
        } else if (usuario == null) {
            // Si no hay usuario y no está cargando, mostrar error
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = error ?: "Error al cargar el perfil",
                        color = Color(0xFFFF5252),
                        fontSize = 16.sp,
                        fontFamily = font,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(horizontal = 32.dp)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = { viewModel.cargarPerfil() },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF6C63FF))
                    ) {
                        Text("Reintentar", fontFamily = font)
                    }
                }
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Spacer(modifier = Modifier.height(60.dp))

                // Foto de perfil
                if (usuario?.fotoPerfil != null) {
                    AsyncImage(
                        model = usuario?.fotoPerfil,
                        contentDescription = "Foto Perfil",
                        contentScale = ContentScale.Crop,
                        modifier = Modifier
                            .size(110.dp)
                            .clip(CircleShape)
                            .border(3.dp, Color.White, CircleShape)
                    )
                } else {
                    Image(
                        painter = painterResource(id = R.drawable.ic_perfil),
                        contentDescription = "Foto Perfil",
                        contentScale = ContentScale.Crop,
                        modifier = Modifier
                            .size(110.dp)
                            .clip(CircleShape)
                            .border(3.dp, Color.White, CircleShape)
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Nombre de usuario con opción de editar
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.clickable {
                        nuevoUsername = usuario?.username ?: ""
                        viewModel.limpiarMensajes() // Limpiar mensajes antes de abrir el diálogo
                        mostrarDialogoUsername = true
                    }
                ) {
                    Text(
                        text = usuario?.username ?: "Usuario",
                        color = Color.White,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = font
                    )
                    Spacer(modifier = Modifier.size(8.dp))
                    Icon(
                        Icons.Default.Edit,
                        contentDescription = "Editar nombre",
                        tint = Color.White.copy(alpha = 0.7f),
                        modifier = Modifier.size(20.dp)
                    )
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Estadísticas
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    EstadisticaItem(peliculasVistas.toString(), "Peliculas\nVistas")
                    EstadisticaItem(cantidadAmigos.toString(), "Amigos")
                    EstadisticaItem(cantidadResenas.toString(), "Reseñas")
                }

                Spacer(modifier = Modifier.height(40.dp))

                // Opciones
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(20.dp))
                        .background(Color.Black.copy(alpha = 0.4f))
                        .padding(16.dp)
                ) {
                    Column {
                        OpcionPerfil(
                            texto = "Ajustes",
                            icono = Icons.Default.Settings,
                            onClick = onAjustesClick
                        )

                        Spacer(modifier = Modifier.height(8.dp))
                        HorizontalDivider(color = Color.Gray.copy(alpha = 0.3f))
                        Spacer(modifier = Modifier.height(8.dp))

                        OpcionPerfil(
                            texto = "Bloqueados",
                            icono = Icons.Default.Close,
                            onClick = onBloqueadosClick
                        )

                        Spacer(modifier = Modifier.height(8.dp))
                        HorizontalDivider(color = Color.Gray.copy(alpha = 0.3f))
                        Spacer(modifier = Modifier.height(8.dp))

                        OpcionPerfil(
                            texto = "Desconectar",
                            icono = Icons.Default.ArrowForward,
                            esDestructivo = true,
                            onClick = onDesconectarClick
                        )
                    }
                }

                // Mensajes de error/éxito
                error?.let {
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = it,
                        color = Color(0xFFFF5252),
                        fontSize = 14.sp,
                        fontFamily = font,
                        textAlign = TextAlign.Center
                    )
                    LaunchedEffect(it) {
                        kotlinx.coroutines.delay(3000)
                        viewModel.limpiarMensajes()
                    }
                }

                mensaje?.let {
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = it,
                        color = Color(0xFF4CAF50),
                        fontSize = 14.sp,
                        fontFamily = font,
                        textAlign = TextAlign.Center
                    )
                    LaunchedEffect(it) {
                        kotlinx.coroutines.delay(3000)
                        viewModel.limpiarMensajes()
                    }
                }
            }
        }

        // Botón de volver
        IconButton(
            onClick = onVolverClick,
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

    // Diálogo para editar username
    if (mostrarDialogoUsername) {
        AlertDialog(
            onDismissRequest = {
                if (!actualizandoUsername) mostrarDialogoUsername = false
            },
            title = {
                Text("Cambiar nombre de usuario", fontFamily = font)
            },
            text = {
                Column {
                    OutlinedTextField(
                        value = nuevoUsername,
                        onValueChange = { nuevoUsername = it },
                        label = { Text("Nuevo nombre", fontFamily = font) },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF6C63FF),
                            unfocusedBorderColor = Color.Gray
                        ),
                        singleLine = true,
                        enabled = !actualizandoUsername
                    )

                    if (actualizandoUsername) {
                        Spacer(modifier = Modifier.height(12.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(20.dp),
                                color = Color(0xFF6C63FF),
                                strokeWidth = 2.dp
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Guardando...", fontFamily = font, fontSize = 14.sp)
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.actualizarUsername(nuevoUsername)
                        // No cerramos el diálogo aquí, se cerrará cuando termine la carga
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF6C63FF)),
                    enabled = !actualizandoUsername && nuevoUsername.length >= 3
                ) {
                    Text("Guardar", fontFamily = font)
                }
            },
            dismissButton = {
                TextButton(
                    onClick = { mostrarDialogoUsername = false },
                    enabled = !actualizandoUsername
                ) {
                    Text("Cancelar", fontFamily = font)
                }
            }
        )
    }

    // Cerrar diálogo automáticamente cuando termine la actualización y haya un mensaje de éxito
    LaunchedEffect(actualizandoUsername, mensaje) {
        if (!actualizandoUsername && mensaje != null && mostrarDialogoUsername) {
            mostrarDialogoUsername = false
        }
    }
}

@Composable
fun EstadisticaItem(numero: String, etiqueta: String) {
    val font = FontFamily(Font(R.font.montserrat_alternates_semibold, FontWeight.SemiBold))

    Column(horizontalAlignment = Alignment.CenterHorizontally) {
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
            fontFamily = font
        )
    }
}

@Composable
fun OpcionPerfil(
    texto: String,
    icono: ImageVector,
    esDestructivo: Boolean = false,
    onClick: () -> Unit = {}
) {
    val font = FontFamily(Font(R.font.montserrat_alternates_semibold, FontWeight.SemiBold))

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
            fontFamily = font
        )
        Icon(
            imageVector = icono,
            contentDescription = null,
            tint = Color.Gray,
            modifier = Modifier.size(20.dp)
        )
    }
}

@Preview(showBackground = true)
@Composable
fun PerfilScreenPreview() {
    PerfilScreen()
}
