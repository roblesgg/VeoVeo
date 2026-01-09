package com.example.veoveo.ui.screens

// ===== importaciones necesarias =====
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
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

/**
 * ===== AJUSTESSCREEN - PANTALLA DE AJUSTES =====
 *
 * esta pantalla permite configurar la app y gestionar la cuenta
 *
 * tiene:
 * 1. boton para borrar cuenta (con confirmacion)
 * 2. boton de atras arriba a la izquierda para volver al perfil
 *
 * componentes basicos que usa:
 * - Box: contenedor principal
 * - Column: para organizar elementos verticalmente
 * - Button: boton de borrar cuenta
 * - AlertDialog: dialogo de confirmacion
 * - IconButton: boton con icono para volver
 */
@Composable
fun AjustesScreen(
    onVolverClick: () -> Unit = {},  // funcion que se ejecuta cuando pulsan la flecha de volver
    onCuentaEliminada: () -> Unit = {},  // funcion que se ejecuta cuando se elimina la cuenta
    viewModel: AuthViewModel = viewModel()  // el ViewModel de autenticación
) {
    // ===== estados =====
    val authState by viewModel.authState.collectAsState()
    var mostrarDialogoConfirmacion by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }

    // fuente montserrat
    val font = FontFamily(
        Font(R.font.montserrat_alternates_semibold, FontWeight.SemiBold)
    )

    // ===== reaccionar cuando se elimina la cuenta =====
    LaunchedEffect(authState) {
        when (authState) {
            is AuthState.Initial -> {
                // si volvió a Initial después de eliminar, la cuenta se eliminó exitosamente
                if (errorMessage.isEmpty() && !mostrarDialogoConfirmacion) {
                    onCuentaEliminada()
                }
            }
            is AuthState.Error -> {
                errorMessage = (authState as AuthState.Error).message
            }
            else -> {
                // no hacemos nada en otros casos
            }
        }
    }

    //volver atras con boton del movil
    BackHandler(onBack = { onVolverClick() })

    // ===== colores del fondo =====
    val brush = Brush.verticalGradient(
        colors = listOf(
            Color(0xFF1A1A2E), // azul oscuro arriba
            Color(0xFF4B0082)  // morado abajo
        )
    )

    // ===== contenedor principal =====
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(brush = brush)
    ) {

        // ===== contenido principal =====
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {

            // espacio arriba
            Spacer(modifier = Modifier.height(80.dp))

            // ===== titulo =====
            Text(
                text = "Ajustes",
                fontSize = 32.sp,
                color = Color.White,
                fontFamily = font,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(40.dp))

            // ===== mensaje de error =====
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

            // ===== indicador de carga =====
            if (authState is AuthState.Loading) {
                CircularProgressIndicator(
                    color = Color.White,
                    modifier = Modifier.padding(vertical = 16.dp)
                )
            }

            Spacer(modifier = Modifier.weight(1f))

            // ===== boton de borrar cuenta =====
            Button(
                onClick = {
                    mostrarDialogoConfirmacion = true
                    errorMessage = ""
                },
                enabled = authState !is AuthState.Loading,
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFFFF5252),  // rojo para acción destructiva
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

        // ===== boton de atras arriba a la izquierda =====
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

        // ===== dialogo de confirmacion =====
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
    }
}

// ===== vista previa =====
// esto sirve para ver la pantalla en android studio sin ejecutar el emulador
@Preview(showBackground = true)
@Composable
fun AjustesScreenPreview() {
    AjustesScreen(
        onVolverClick = {},
        onCuentaEliminada = {}
    )
}
