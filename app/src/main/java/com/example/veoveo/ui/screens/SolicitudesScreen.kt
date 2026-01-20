package com.example.veoveo.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.veoveo.R
import com.example.veoveo.viewmodel.ViewModelSocial

@Composable
fun SolicitudesScreen(
    onVolverClick: () -> Unit = {},
    viewModel: ViewModelSocial = viewModel()
) {
    val solicitudesPendientes by viewModel.solicitudesPendientes.collectAsState()
    val cargando by viewModel.cargando.collectAsState()
    val mensaje by viewModel.mensaje.collectAsState()
    val error by viewModel.error.collectAsState()

    // Cargar solicitudes al iniciar
    LaunchedEffect(Unit) {
        viewModel.cargarSolicitudesPendientes()
    }

    BackHandler(onBack = onVolverClick)

    val font = FontFamily(Font(R.font.montserrat_alternates_semibold, FontWeight.SemiBold))
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
            Spacer(modifier = Modifier.height(60.dp))

            Text(
                text = "Solicitudes de Amistad",
                fontSize = 28.sp,
                color = Color.White,
                fontFamily = font,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(24.dp))

            if (cargando) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = Color.White)
                }
            } else if (solicitudesPendientes.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No tienes solicitudes pendientes",
                        fontSize = 16.sp,
                        color = Color.White.copy(alpha = 0.6f),
                        fontFamily = font,
                        textAlign = TextAlign.Center
                    )
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(solicitudesPendientes) { solicitud ->
                        SolicitudCard(
                            username = solicitud.deUsername,
                            onAceptar = {
                                viewModel.aceptarSolicitud(solicitud.id)
                            },
                            onRechazar = {
                                viewModel.rechazarSolicitud(solicitud.id)
                            },
                            font = font
                        )
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

        // Botón de volver
        IconButton(
            onClick = onVolverClick,
            modifier = Modifier
                .align(Alignment.TopStart)
                .padding(start = 20.dp, top = 25.dp)
        ) {
            Icon(
                Icons.AutoMirrored.Filled.ArrowBack,
                contentDescription = "Volver",
                tint = Color.White,
                modifier = Modifier.size(28.dp)
            )
        }
    }
}

@Composable
fun SolicitudCard(
    username: String,
    onAceptar: () -> Unit,
    onRechazar: () -> Unit,
    font: FontFamily
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF2A2A3E))
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.weight(1f)
            ) {
                Image(
                    painter = painterResource(R.drawable.ic_perfil),
                    contentDescription = null,
                    modifier = Modifier
                        .size(60.dp)
                        .clip(CircleShape)
                        .border(2.dp, Color.White, CircleShape)
                )

                Spacer(modifier = Modifier.width(16.dp))

                Column {
                    Text(
                        text = username,
                        color = Color.White,
                        fontSize = 18.sp,
                        fontFamily = font,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Quiere ser tu amigo",
                        color = Color.White.copy(alpha = 0.6f),
                        fontSize = 14.sp,
                        fontFamily = font
                    )
                }
            }

            // Botones de aceptar y rechazar
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Botón rechazar
                IconButton(
                    onClick = onRechazar,
                    colors = IconButtonDefaults.iconButtonColors(
                        containerColor = Color(0xFFFF5252)
                    ),
                    modifier = Modifier.size(48.dp)
                ) {
                    Icon(
                        Icons.Default.Close,
                        contentDescription = "Rechazar",
                        tint = Color.White,
                        modifier = Modifier.size(24.dp)
                    )
                }

                // Botón aceptar
                IconButton(
                    onClick = onAceptar,
                    colors = IconButtonDefaults.iconButtonColors(
                        containerColor = Color(0xFF4CAF50)
                    ),
                    modifier = Modifier.size(48.dp)
                ) {
                    Icon(
                        Icons.Default.Check,
                        contentDescription = "Aceptar",
                        tint = Color.White,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }
        }
    }
}
