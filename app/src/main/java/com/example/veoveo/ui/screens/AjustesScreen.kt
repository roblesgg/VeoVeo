package com.example.veoveo.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.veoveo.R
import com.example.veoveo.viewmodel.AuthState
import com.example.veoveo.viewmodel.AuthViewModel

// pantalla de ajustes
@Composable
fun AjustesScreen(
    onVolverClick: () -> Unit = {},
    onCuentaEliminada: () -> Unit = {},
    viewModel: AuthViewModel = viewModel()
) {
    val authState by viewModel.authState.collectAsState()
    var mostrarDialogoConfirmacion by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }
    var mostrarDialogoTMDB by remember { mutableStateOf(false) }

    val font = FontFamily(
        Font(R.font.montserrat_alternates_semibold, FontWeight.SemiBold)
    )

    LaunchedEffect(authState) {
        when (authState) {
            is AuthState.Initial -> {
                if (errorMessage.isEmpty() && !mostrarDialogoConfirmacion) {
                    onCuentaEliminada()
                }
            }
            is AuthState.Error -> {
                errorMessage = (authState as AuthState.Error).message
            }
            else -> {}
        }
    }

    BackHandler(onBack = { onVolverClick() })

    val brush = Brush.verticalGradient(
        colors = listOf(
            Color(0xFF1A1A2E),
            Color(0xFF4B0082)
        )
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(brush = brush)
    ) {

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {

            Spacer(modifier = Modifier.height(80.dp))

            Text(
                text = "Ajustes",
                fontSize = 32.sp,
                color = Color.White,
                fontFamily = font,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(40.dp))

            // Créditos de TMDB
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { mostrarDialogoTMDB = true },
                colors = CardDefaults.cardColors(
                    containerColor = Color.Black.copy(alpha = 0.4f)
                ),
                shape = RoundedCornerShape(16.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Datos de películas",
                            fontSize = 16.sp,
                            color = Color.White,
                            fontFamily = font,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Proporcionados por TMDB",
                            fontSize = 12.sp,
                            color = Color.LightGray,
                            fontFamily = font
                        )
                    }
                    Icon(
                        imageVector = Icons.Default.Info,
                        contentDescription = "Más información",
                        tint = Color(0xFF6C63FF),
                        modifier = Modifier.size(24.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            if (errorMessage.isNotEmpty()) {
                Text(
                    text = errorMessage,
                    color = Color(0xFFFF5252),
                    fontSize = 14.sp,
                    fontFamily = font,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                )
            }

            if (authState is AuthState.Loading) {
                CircularProgressIndicator(
                    color = Color.White,
                    modifier = Modifier.padding(vertical = 16.dp)
                )
            }

            Spacer(modifier = Modifier.weight(1f))

            Button(
                onClick = {
                    mostrarDialogoConfirmacion = true
                    errorMessage = ""
                },
                enabled = authState !is AuthState.Loading,
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFFFF5252),
                    disabledContainerColor = Color.Gray
                ),
                shape = RoundedCornerShape(30.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp)
            ) {
                Text(
                    "Borrar Cuenta",
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontFamily = font,
                    fontSize = 16.sp
                )
            }

            Spacer(modifier = Modifier.height(40.dp))
        }

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

        if (mostrarDialogoConfirmacion) {
            AlertDialog(
                onDismissRequest = { mostrarDialogoConfirmacion = false },
                title = {
                    Text(
                        "¿Borrar cuenta?",
                        fontFamily = font,
                        fontSize = 20.sp,
                        color = Color.White
                    )
                },
                text = {
                    Text(
                        "Esta acción es irreversible. Se eliminarán todos tus datos permanentemente.",
                        fontFamily = font,
                        fontSize = 14.sp,
                        color = Color.White.copy(alpha = 0.9f)
                    )
                },
                confirmButton = {
                    TextButton(
                        onClick = {
                            mostrarDialogoConfirmacion = false
                            viewModel.deleteAccount()
                        }
                    ) {
                        Text(
                            "Borrar",
                            fontFamily = font,
                            color = Color(0xFFFF5252),
                            fontWeight = FontWeight.Bold
                        )
                    }
                },
                dismissButton = {
                    TextButton(
                        onClick = { mostrarDialogoConfirmacion = false }
                    ) {
                        Text(
                            "Cancelar",
                            fontFamily = font,
                            color = Color.White
                        )
                    }
                },
                containerColor = Color(0xFF1A1A2E),
                textContentColor = Color.White
            )
        }

        if (mostrarDialogoTMDB) {
            AlertDialog(
                onDismissRequest = { mostrarDialogoTMDB = false },
                title = {
                    Text(
                        "Créditos TMDB",
                        fontFamily = font,
                        fontSize = 20.sp,
                        color = Color.White
                    )
                },
                text = {
                    Column {
                        Text(
                            "Esta aplicación utiliza la API de TMDB (The Movie Database) para obtener información sobre películas.",
                            fontFamily = font,
                            fontSize = 14.sp,
                            color = Color.White.copy(alpha = 0.9f)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            "This product uses the TMDB API but is not endorsed or certified by TMDB.",
                            fontFamily = font,
                            fontSize = 12.sp,
                            color = Color.LightGray,
                            fontWeight = FontWeight.Light
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            "https://www.themoviedb.org",
                            fontFamily = font,
                            fontSize = 12.sp,
                            color = Color(0xFF6C63FF)
                        )
                    }
                },
                confirmButton = {
                    TextButton(
                        onClick = { mostrarDialogoTMDB = false }
                    ) {
                        Text(
                            "Cerrar",
                            fontFamily = font,
                            color = Color(0xFF6C63FF),
                            fontWeight = FontWeight.Bold
                        )
                    }
                },
                containerColor = Color(0xFF1A1A2E),
                textContentColor = Color.White
            )
        }
    }
}

@Preview(showBackground = true)
@Composable
fun AjustesScreenPreview() {
    AjustesScreen(
        onVolverClick = {},
        onCuentaEliminada = {}
    )
}
