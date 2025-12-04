package com.example.veoveo.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.border // <--- Añadido import faltante
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close // Sustituto seguro para Block
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.ArrowForward // Sustituto para ExitToApp/Chevron
import androidx.compose.material.icons.filled.Warning // Otro sustituto posible
import androidx.compose.material3.*
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
import androidx.compose.ui.text.style.TextAlign // <--- Añadido import faltante
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.veoveo.R
import androidx.compose.ui.tooling.preview.Preview

/**
 * PERFILSCREEN - PANTALLA DE PERFIL
 *
 * muestra la informacion del usuario: foto, nombre, estadisticas
 * y opciones: ajustes, bloqueados, desconectar
 */
@Composable
fun PerfilScreen(
    onAjustesClick: () -> Unit = {},        // cuando pulsan ajustes
    onBloqueadosClick: () -> Unit = {},     // cuando pulsan bloqueados
    onDesconectarClick: () -> Unit = {},    // cuando pulsan desconectar
    onVolverClick: () -> Unit = {}          // cuando pulsan la flecha de volver
) {
    val brush = Brush.verticalGradient(
        colors = listOf(
            Color(0xFF1A1A2E),
            Color(0xFF4B0082)
        )
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(brush = brush)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(60.dp))

        Image(
            painter = painterResource(id = R.drawable.ic_perfil),
            contentDescription = "Foto Perfil",
            contentScale = ContentScale.Crop,
            modifier = Modifier
                .size(110.dp)
                .clip(CircleShape)
                .border(2.dp, Color(0xFF1A1A2E), CircleShape)
        )

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "Maryluu_32",
            color = Color.White,
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(24.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            EstadisticaItem("129", "Películas\nVistas")
            EstadisticaItem("3680", "Seguidores")
            EstadisticaItem("93", "Reseñas")
        }

        Spacer(modifier = Modifier.height(40.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(
                containerColor = Color.Black.copy(alpha = 0.4f)
            )
        ) {
            Column(modifier = Modifier.padding(16.dp)) {

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
                    // He cambiado Block por Close (X) porque siempre viene incluido
                    icono = Icons.Default.Close,
                    onClick = onBloqueadosClick
                )

                Spacer(modifier = Modifier.height(8.dp))
                HorizontalDivider(color = Color.Gray.copy(alpha = 0.3f))
                Spacer(modifier = Modifier.height(8.dp))

                OpcionPerfil(
                    texto = "Desconectar",
                    // He cambiado ExitToApp por ArrowForward para evitar líos de AutoMirrored
                    icono = Icons.Default.ArrowForward,
                    esDestructivo = true,
                    onClick = onDesconectarClick
                )
            }
        }
    }
}

@Composable
fun EstadisticaItem(numero: String, etiqueta: String) {
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
            textAlign = TextAlign.Center
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
            fontWeight = FontWeight.Medium
        )

        Icon(
            imageVector = icono,
            contentDescription = null,
            tint = Color.Gray,
            modifier = Modifier.size(20.dp)
        )
    }
}

// vista previa para android studio
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