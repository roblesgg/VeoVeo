package com.example.veoveo.ui.screens

// ===== importaciones necesarias =====
// estas son las librerias que necesitamos para que funcione la pantalla

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
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import com.example.veoveo.R

/**
 * ===== LOGINSCREEN - PANTALLA DE LOGIN =====
 *
 * esta es la primera pantalla que ves al abrir la app
 * aqui el usuario pone su email y contraseña para entrar
 *
 * cuando el usuario le da al boton "iniciar sesion", se ejecuta la funcion logueado()
 * que viene de AuthNavigation y cambia el estado de usuarioLogueado a true
 *
 * componentes basicos que usa:
 * - Box: contenedor principal
 * - Column: para poner las cosas en vertical (una abajo de otra)
 * - Text: para mostrar textos
 * - OutlinedTextField: para escribir texto (email y contraseña)
 * - Button: botones
 * - Spacer: para dar espacio entre elementos
 */
@Composable
fun LoginScreen(
    logueado: () -> Unit  // esta funcion se ejecuta cuando el usuario pulsa iniciar sesion
) {

    // ===== colores del fondo =====
    // creamos un degradado de azul oscuro a morado
    // estos colores vienen del diseño de figma
    val brush = Brush.verticalGradient(
        colors = listOf(
            Color(0xFF1A1A2E), // azul oscuro arriba
            Color(0xFF4B0082)  // morado abajo
        )
    )


    val montserratFontFamily = FontFamily(
        Font(R.font.montserrat_alternates_semibold, FontWeight.SemiBold)
    )

    // ===== variables para lo que escribe el usuario =====
    // remember y mutableStateOf se usan para guardar lo que el usuario escribe
    // cuando el usuario escribe algo, la variable cambia y la pantalla se actualiza
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var mostrarError by remember { mutableStateOf(false) }  // para mostrar el mensaje de error

    // ===== contenedor principal =====
    // el Box es el contenedor que ocupa toda la pantalla
    Box(
        modifier = Modifier
            .fillMaxSize()                  // ocupa toda la pantalla
            .background(brush = brush),     // le ponemos el degradado de fondo
        contentAlignment = Alignment.Center // centra todo lo que hay dentro
    ) {

        // ===== columna vertical =====
        // la Column pone todos los elementos en vertical (uno debajo del otro)
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,  // centra horizontalmente
            modifier = Modifier.padding(32.dp)                   // margen de 32dp alrededor
        ) {

            // ===== logo/titulo =====
            // texto grande con el nombre de la app
            Text(
                text = "VeoVeo",
                fontSize = 48.sp,              // tamaño grande para el titulo
                fontWeight = FontWeight.Bold,  // texto en negrita
                fontFamily = montserratFontFamily,  // fuente montserrat
                color = Color.White            // color blanco
            )

            // espacio entre el titulo y los campos
            Spacer(modifier = Modifier.height(50.dp))

            // ===== campo de email =====
            // OutlinedTextField es un campo de texto con borde
            OutlinedTextField(
                value = email,                        // el valor actual del campo
                onValueChange = { email = it },       // cuando el usuario escribe, actualiza la variable
                label = {
                    Text("Email", color = Color.Gray,fontFamily = montserratFontFamily) // etiqueta que aparece arriba del campo
                },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.White,          // texto blanco cuando escribes
                    unfocusedTextColor = Color.White,        // texto blanco cuando no escribes
                    focusedBorderColor = Color(0xFF6C63FF), // borde morado cuando escribes
                    unfocusedBorderColor = Color.Gray,       // borde gris cuando no escribes
                    focusedContainerColor = Color.Transparent,   // fondo transparente cuando escribes
                    unfocusedContainerColor = Color.Transparent  // fondo transparente cuando no escribes
                ),
                modifier = Modifier
                    .fillMaxWidth()           // ocupa todo el ancho
                    .padding(bottom = 16.dp)  // margen abajo de 16dp
            )

            // ===== campo de contraseña =====
            // igual que el de email pero oculta lo que escribes
            OutlinedTextField(
                value = password,                     // el valor actual del campo
                onValueChange = { password = it },    // cuando el usuario escribe, actualiza la variable
                label = {
                    Text("Contraseña", color = Color.Gray,fontFamily = montserratFontFamily) // etiqueta del campo
                },
                visualTransformation = PasswordVisualTransformation(), // oculta las letras (pone •••)
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White,
                    focusedBorderColor = Color(0xFF6C63FF),
                    unfocusedBorderColor = Color.Gray,
                    focusedContainerColor = Color.Transparent,
                    unfocusedContainerColor = Color.Transparent
                ),
                modifier = Modifier
                    .fillMaxWidth()           // ocupa todo el ancho
                    .padding(bottom = 32.dp)  // margen abajo mas grande (32dp)
            )

            // ===== mensaje de error =====
            // si mostrarError es true, mostramos el mensaje en rojo
            if (mostrarError) {
                Text(
                    text = "Email/Contraseña incorrectos",
                    color = Color(0xFFFF5252),  // rojo
                    fontSize = 14.sp,
                    modifier = Modifier.padding(bottom = 16.dp),
                    fontFamily = montserratFontFamily
                )
            }

            // ===== boton de iniciar sesion =====
            Button(
                onClick = {
                    if ((email.equals("admin") && password.equals("admin"))||(email.equals("1234") && password.equals("1234"))) {
                        // si el email y la contraseña son correctos, ejecutamos logueado()
                        mostrarError = false  // quitamos el error
                        logueado()
                    } else {
                        // si son incorrectos, mostramos el error
                        mostrarError = true
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()   // ocupa todo el ancho
                    .height(50.dp),   // altura de 50dp
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color.Black  // fondo negro
                ),
                shape = RoundedCornerShape(12.dp) // esquinas redondeadas
            ) {
                Text(
                    "INICIAR SESIÓN",
                    color = Color.White,          // texto blanco
                    fontWeight = FontWeight.Bold,  // texto en negrita
                    fontFamily = montserratFontFamily

                )
            }

            // espacio entre botones
            Spacer(modifier = Modifier.height(16.dp))

            // ===== boton de google =====
            // boton alternativo para iniciar sesion con google
            // por ahora no hace nada (onClick vacio)
            Button(
                onClick = {
                    // en el futuro aqui ira la logica de google sign in
                },
                modifier = Modifier
                    .fillMaxWidth()   // ocupa todo el ancho
                    .height(50.dp),   // altura de 50dp
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color.White  // fondo blanco
                ),
                shape = RoundedCornerShape(12.dp) // esquinas redondeadas
            ) {
                Text(
                    "Continuar con Google",
                    color = Color.Black,  // texto negro
                    fontWeight = FontWeight.Bold,  // texto en negrita
                    fontFamily = montserratFontFamily
                )
            }
        }
    }
}

// ===== vista previa =====
// esto sirve para ver la pantalla en android studio sin ejecutar el emulador
@Preview(showBackground = true)
@Composable
fun LoginScreenPreview() {
    LoginScreen(logueado = {})
}
