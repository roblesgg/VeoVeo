package com.example.veoveo.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.*
import androidx.compose.runtime.*
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
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.example.veoveo.R
import com.example.veoveo.model.Usuario
import com.example.veoveo.viewmodel.ViewModelSocial

@Composable
fun SocialScreen(
    onUsuarioClick: (String) -> Unit = {},
    onSolicitudesClick: () -> Unit = {},
    viewModel: ViewModelSocial = viewModel()
) {
    // Estados
    val resultadosBusqueda by viewModel.resultadosBusqueda.collectAsState()
    val amigos by viewModel.amigos.collectAsState()
    val solicitudesPendientes by viewModel.solicitudesPendientes.collectAsState()
    val cargando by viewModel.cargando.collectAsState()
    val mensaje by viewModel.mensaje.collectAsState()
    val error by viewModel.error.collectAsState()

    // Estados locales
    var busqueda by remember { mutableStateOf("") }
    var pestanaSeleccionada by remember { mutableStateOf(0) } // 0: Amigos, 1: Buscar

    // Cargar datos al iniciar
    LaunchedEffect(Unit) {
        viewModel.cargarAmigos()
        viewModel.cargarSolicitudesPendientes()
    }

    // Fuente
    val font = FontFamily(Font(R.font.montserrat_alternates_semibold, FontWeight.SemiBold))

    // Degradado
    val brush = Brush.verticalGradient(listOf(Color(0xFF1A1A2E), Color(0xFF4B0082)))

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(brush)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp)
        ) {
            Spacer(modifier = Modifier.height(20.dp))

            // Título
            Text(
                text = "Social",
                fontSize = 32.sp,
                color = Color.White,
                fontFamily = font,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Botón de solicitudes pendientes
            if (solicitudesPendientes.isNotEmpty()) {
                Button(
                    onClick = onSolicitudesClick,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFF5722)),
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        "Tienes ${solicitudesPendientes.size} solicitud(es) pendiente(s)",
                        fontFamily = font,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
                Spacer(modifier = Modifier.height(16.dp))
            }

            // Pestañas
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                Button(
                    onClick = { pestanaSeleccionada = 0 },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (pestanaSeleccionada == 0) Color(0xFF6C63FF) else Color.Transparent
                    ),
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Default.Person, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Amigos (${amigos.size})", fontFamily = font)
                }

                Spacer(modifier = Modifier.width(12.dp))

                Button(
                    onClick = { pestanaSeleccionada = 1 },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (pestanaSeleccionada == 1) Color(0xFF6C63FF) else Color.Transparent
                    ),
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Default.Search, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Buscar", fontFamily = font)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Contenido según la pestaña
            when (pestanaSeleccionada) {
                0 -> {
                    // Pestaña de amigos
                    Text(
                        text = "Mis amigos",
                        fontSize = 18.sp,
                        color = Color.White,
                        fontFamily = font,
                        fontWeight = FontWeight.Bold
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    if (amigos.isEmpty()) {
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "Aún no tienes amigos\nBúscalos en la pestaña de búsqueda",
                                fontSize = 16.sp,
                                color = Color.White.copy(alpha = 0.6f),
                                fontFamily = font,
                                textAlign = TextAlign.Center
                            )
                        }
                    } else {
                        LazyColumn(
                            modifier = Modifier.fillMaxSize()
                        ) {
                            items(amigos) { amigo ->
                                AmigoItem(
                                    usuario = amigo,
                                    onClick = { onUsuarioClick(amigo.uid) },
                                    font = font
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                            }
                        }
                    }
                }

                1 -> {
                    // Pestaña de búsqueda
                    OutlinedTextField(
                        value = busqueda,
                        onValueChange = {
                            busqueda = it
                            if (it.length >= 3) {
                                viewModel.buscarUsuarios(it)
                            }
                        },
                        label = { Text("Buscar usuarios...", fontFamily = font) },
                        leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF6C63FF),
                            unfocusedBorderColor = Color.White.copy(alpha = 0.5f),
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            focusedLabelColor = Color.White.copy(alpha = 0.7f),
                            unfocusedLabelColor = Color.White.copy(alpha = 0.5f)
                        ),
                        singleLine = true
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    if (busqueda.length < 3) {
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "Escribe al menos 3 caracteres\npara buscar usuarios",
                                fontSize = 16.sp,
                                color = Color.White.copy(alpha = 0.6f),
                                fontFamily = font,
                                textAlign = TextAlign.Center
                            )
                        }
                    } else if (resultadosBusqueda.isEmpty()) {
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "No se encontraron usuarios",
                                fontSize = 16.sp,
                                color = Color.White.copy(alpha = 0.6f),
                                fontFamily = font
                            )
                        }
                    } else {
                        LazyColumn(
                            modifier = Modifier.fillMaxSize()
                        ) {
                            items(resultadosBusqueda) { usuario ->
                                ResultadoBusquedaItem(
                                    usuario = usuario,
                                    esAmigo = amigos.any { it.uid == usuario.uid },
                                    onEnviarSolicitud = {
                                        viewModel.enviarSolicitudAmistad(usuario.uid)
                                    },
                                    font = font
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                            }
                        }
                    }
                }
            }

            // Mensajes
            mensaje?.let {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = it,
                    color = Color(0xFF4CAF50),
                    fontSize = 14.sp,
                    fontFamily = font,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth()
                )
                LaunchedEffect(it) {
                    kotlinx.coroutines.delay(3000)
                    viewModel.limpiarMensajes()
                }
            }

            error?.let {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = it,
                    color = Color(0xFFFF5252),
                    fontSize = 14.sp,
                    fontFamily = font,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth()
                )
                LaunchedEffect(it) {
                    kotlinx.coroutines.delay(3000)
                    viewModel.limpiarMensajes()
                }
            }
        }
    }
}

@Composable
fun AmigoItem(
    usuario: Usuario,
    onClick: () -> Unit,
    font: FontFamily
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF2A2A3E))
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            if (usuario.fotoPerfil != null) {
                AsyncImage(
                    model = usuario.fotoPerfil,
                    contentDescription = null,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .size(50.dp)
                        .clip(CircleShape)
                        .border(2.dp, Color.White, CircleShape)
                )
            } else {
                Image(
                    painter = painterResource(R.drawable.ic_perfil),
                    contentDescription = null,
                    modifier = Modifier
                        .size(50.dp)
                        .clip(CircleShape)
                        .border(2.dp, Color.White, CircleShape)
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Text(
                text = usuario.username,
                color = Color.White,
                fontSize = 16.sp,
                fontFamily = font,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

@Composable
fun ResultadoBusquedaItem(
    usuario: Usuario,
    esAmigo: Boolean,
    onEnviarSolicitud: () -> Unit,
    font: FontFamily
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF2A2A3E))
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                if (usuario.fotoPerfil != null) {
                    AsyncImage(
                        model = usuario.fotoPerfil,
                        contentDescription = null,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier
                            .size(50.dp)
                            .clip(CircleShape)
                            .border(2.dp, Color.White, CircleShape)
                    )
                } else {
                    Image(
                        painter = painterResource(R.drawable.ic_perfil),
                        contentDescription = null,
                        modifier = Modifier
                            .size(50.dp)
                            .clip(CircleShape)
                            .border(2.dp, Color.White, CircleShape)
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                Text(
                    text = usuario.username,
                    color = Color.White,
                    fontSize = 16.sp,
                    fontFamily = font,
                    fontWeight = FontWeight.Bold
                )
            }

            if (esAmigo) {
                Text(
                    text = "Amigo",
                    color = Color(0xFF4CAF50),
                    fontSize = 14.sp,
                    fontFamily = font
                )
            } else {
                IconButton(onClick = onEnviarSolicitud) {
                    Icon(
                        Icons.Default.Add,
                        contentDescription = "Enviar solicitud",
                        tint = Color(0xFF6C63FF)
                    )
                }
            }
        }
    }
}
