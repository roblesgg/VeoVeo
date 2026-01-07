package com.example.veoveo.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.veoveo.R
import com.example.veoveo.viewmodel.AuthState
import com.example.veoveo.viewmodel.AuthViewModel

/**
 * ===== REGISTERSCREEN - PANTALLA DE REGISTRO =====
 *
 * Pantalla para crear una nueva cuenta.
 * Similar al LoginScreen pero con validación de contraseña.
 */
@Composable
fun RegisterScreen(
    onRegisterSuccess: () -> Unit,  // se ejecuta cuando el registro es exitoso
    onBackToLogin: () -> Unit,  // vuelve al login
    viewModel: AuthViewModel = viewModel()
) {
    // observamos el estado de autenticación
    val authState by viewModel.authState.collectAsState()

    // colores del fondo (mismo degradado que login)
    val brush = Brush.verticalGradient(
        colors = listOf(
            Color(0xFF1A1A2E),
            Color(0xFF4B0082)
        )
    )

    val montserratFontFamily = FontFamily(
        Font(R.font.montserrat_alternates_semibold, FontWeight.SemiBold)
    )

    // variables para los campos
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var errorMessage by remember { mutableStateOf("") }

    // reaccionar cuando el usuario se registra
    LaunchedEffect(authState) {
        when (authState) {
            is AuthState.Authenticated -> {
                errorMessage = ""
                onRegisterSuccess()
            }
            is AuthState.Error -> {
                errorMessage = (authState as AuthState.Error).message
            }
            else -> {}
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(brush = brush),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(32.dp)
        ) {
            // titulo
            Text(
                text = "Crear Cuenta",
                fontSize = 40.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = montserratFontFamily,
                color = Color.White
            )

            Spacer(modifier = Modifier.height(40.dp))

            // campo de email
            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = {
                    Text("Email", color = Color.Gray, fontFamily = montserratFontFamily)
                },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White,
                    focusedBorderColor = Color(0xFF6C63FF),
                    unfocusedBorderColor = Color.Gray,
                    focusedContainerColor = Color.Transparent,
                    unfocusedContainerColor = Color.Transparent
                ),
                shape = RoundedCornerShape(30.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp)
            )

            // campo de contraseña
            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = {
                    Text("Contraseña", color = Color.Gray, fontFamily = montserratFontFamily)
                },
                visualTransformation = PasswordVisualTransformation(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White,
                    focusedBorderColor = Color(0xFF6C63FF),
                    unfocusedBorderColor = Color.Gray,
                    focusedContainerColor = Color.Transparent,
                    unfocusedContainerColor = Color.Transparent
                ),
                shape = RoundedCornerShape(30.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp)
            )

            // campo de confirmar contraseña
            OutlinedTextField(
                value = confirmPassword,
                onValueChange = { confirmPassword = it },
                label = {
                    Text("Confirmar Contraseña", color = Color.Gray, fontFamily = montserratFontFamily)
                },
                visualTransformation = PasswordVisualTransformation(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White,
                    focusedBorderColor = Color(0xFF6C63FF),
                    unfocusedBorderColor = Color.Gray,
                    focusedContainerColor = Color.Transparent,
                    unfocusedContainerColor = Color.Transparent
                ),
                shape = RoundedCornerShape(30.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 32.dp)
            )

            // mensaje de error
            if (errorMessage.isNotEmpty()) {
                Text(
                    text = errorMessage,
                    color = Color(0xFFFF5252),
                    fontSize = 14.sp,
                    modifier = Modifier.padding(bottom = 16.dp),
                    fontFamily = montserratFontFamily
                )
            }

            // indicador de carga
            if (authState is AuthState.Loading) {
                CircularProgressIndicator(
                    color = Color.White,
                    modifier = Modifier.padding(bottom = 16.dp)
                )
            }

            // boton de registrarse
            Button(
                onClick = {
                    // validar que las contraseñas coincidan
                    if (password != confirmPassword) {
                        errorMessage = "Las contraseñas no coinciden"
                    } else {
                        errorMessage = ""
                        viewModel.registerWithEmail(email, password)
                    }
                },
                enabled = authState !is AuthState.Loading,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color.Black
                ),
                shape = RoundedCornerShape(30.dp)
            ) {
                Text(
                    "CREAR CUENTA",
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontFamily = montserratFontFamily
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // boton para volver al login
            TextButton(onClick = onBackToLogin) {
                Text(
                    "¿Ya tienes cuenta? Inicia sesión",
                    color = Color.White,
                    fontFamily = montserratFontFamily
                )
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun RegisterScreenPreview() {
    RegisterScreen(
        onRegisterSuccess = {},
        onBackToLogin = {}
    )
}
