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
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
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

// pantalla de perfil de un contacto con sus peliculas y tierlists
@Composable
fun ContactoScreen(
    nombreContacto: String = "Amigo 1",
    onVolverClick: () -> Unit = {},
    onBloquearClick: () -> Unit = {},
    onPeliculaClick: (Int) -> Unit = {}
) {
    val font = FontFamily(Font(R.font.montserrat_alternates_semibold, FontWeight.SemiBold))
    val brush = Brush.verticalGradient(listOf(Color(0xFF1A1A2E), Color(0xFF4B0082)))

    BackHandler(onBack = onVolverClick)

    var seccion by remember { mutableIntStateOf(0) }

    // IDs de películas reales de TMDB (temporal hasta conectar con Firebase)
    val peliculasVistas = remember { listOf(550, 278, 680, 155, 13) }
    val peliculasPorVer = remember { listOf(122, 497, 11) }
    val tierLists = remember { listOf("TierList 1", "TierList 2") }

    Box(modifier = Modifier.fillMaxSize().background(brush)) {
        Column(
            modifier = Modifier.fillMaxSize().padding(top = 70.dp, start = 25.dp, end = 25.dp, bottom = 20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Image(
                painterResource(R.drawable.ic_perfil),
                "perfil",
                contentScale = ContentScale.Crop,
                modifier = Modifier.size(100.dp).clip(CircleShape).border(3.dp, Color.White, CircleShape)
            )
            Spacer(Modifier.height(16.dp))
            Text(nombreContacto, fontSize = 28.sp, color = Color.White, fontFamily = font, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(24.dp))

            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                Text(
                    "Vistas",
                    fontSize = 16.sp,
                    color = if (seccion == 0) Color.White else Color.Gray,
                    fontFamily = font,
                    fontWeight = if (seccion == 0) FontWeight.Bold else FontWeight.Normal,
                    modifier = Modifier.clickable { seccion = 0 }
                )
                Text(
                    "Por Ver",
                    fontSize = 16.sp,
                    color = if (seccion == 1) Color.White else Color.Gray,
                    fontFamily = font,
                    fontWeight = if (seccion == 1) FontWeight.Bold else FontWeight.Normal,
                    modifier = Modifier.clickable { seccion = 1 }
                )
                Text(
                    "TierLists",
                    fontSize = 16.sp,
                    color = if (seccion == 2) Color.White else Color.Gray,
                    fontFamily = font,
                    fontWeight = if (seccion == 2) FontWeight.Bold else FontWeight.Normal,
                    modifier = Modifier.clickable { seccion = 2 }
                )
            }

            Spacer(Modifier.height(24.dp))

            LazyColumn(modifier = Modifier.weight(1f)) {
                when (seccion) {
                    0 -> {
                        val filas = peliculasVistas.chunked(3)
                        items(filas) { fila ->
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                fila.forEach { movieId ->
                                    Card(
                                        modifier = Modifier.weight(1f).height(180.dp).clickable { onPeliculaClick(movieId) },
                                        shape = RoundedCornerShape(12.dp),
                                        colors = CardDefaults.cardColors(containerColor = Color(0xFF2A2A3E))
                                    ) {
                                        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                                            Text("Película $movieId", color = Color.White, fontSize = 14.sp, fontFamily = font, textAlign = TextAlign.Center)
                                        }
                                    }
                                }
                                repeat(3 - fila.size) { Spacer(Modifier.weight(1f)) }
                            }
                            Spacer(Modifier.height(12.dp))
                        }
                    }
                    1 -> {
                        val filas = peliculasPorVer.chunked(3)
                        items(filas) { fila ->
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                fila.forEach { movieId ->
                                    Card(
                                        modifier = Modifier.weight(1f).height(180.dp).clickable { onPeliculaClick(movieId) },
                                        shape = RoundedCornerShape(12.dp),
                                        colors = CardDefaults.cardColors(containerColor = Color(0xFF2A2A3E))
                                    ) {
                                        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                                            Text("Película $movieId", color = Color.White, fontSize = 14.sp, fontFamily = font, textAlign = TextAlign.Center)
                                        }
                                    }
                                }
                                repeat(3 - fila.size) { Spacer(Modifier.weight(1f)) }
                            }
                            Spacer(Modifier.height(12.dp))
                        }
                    }
                    2 -> {
                        val filas = tierLists.chunked(2)
                        items(filas) { fila ->
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                                fila.forEach { tierlist ->
                                    Column(modifier = Modifier.weight(1f), horizontalAlignment = Alignment.CenterHorizontally) {
                                        Card(
                                            modifier = Modifier.fillMaxWidth().aspectRatio(1f),
                                            shape = RoundedCornerShape(12.dp),
                                            colors = CardDefaults.cardColors(containerColor = Color(0xFF2A2A3E))
                                        ) {
                                            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                                                Text(tierlist, color = Color.White, fontSize = 16.sp, fontFamily = font, textAlign = TextAlign.Center)
                                            }
                                        }
                                        Spacer(Modifier.height(8.dp))
                                        Text(tierlist, color = Color.White, fontSize = 14.sp, fontFamily = font, textAlign = TextAlign.Center)
                                    }
                                }
                                repeat(2 - fila.size) { Spacer(Modifier.weight(1f)) }
                            }
                            Spacer(Modifier.height(24.dp))
                        }
                    }
                }
            }

            Button(
                onClick = onBloquearClick,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFF5252)),
                modifier = Modifier.fillMaxWidth().height(50.dp)
            ) {
                Image(painterResource(R.drawable.ic_bloquear), "bloquear", Modifier.size(24.dp))
                Spacer(Modifier.size(8.dp))
                Text("Bloquear contacto", color = Color.White, fontFamily = font, fontSize = 16.sp)
            }
        }

        IconButton(
            onClick = onVolverClick,
            modifier = Modifier.align(Alignment.TopStart).padding(start = 20.dp, top = 25.dp)
        ) {
            Icon(Icons.AutoMirrored.Filled.ArrowBack, "volver", tint = Color.White, modifier = Modifier.size(28.dp))
        }
    }
}

@androidx.compose.ui.tooling.preview.Preview(showBackground = true)
@Composable
fun ContactoScreenPreview() {
    ContactoScreen()
}
