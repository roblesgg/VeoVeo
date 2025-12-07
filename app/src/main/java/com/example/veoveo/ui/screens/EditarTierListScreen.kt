package com.example.veoveo.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.veoveo.R

// paso 2: organizar peliculas en las franjas de tier
@Composable
fun EditarTierListScreen(onVolverClick: () -> Unit = {}, onGuardarClick: () -> Unit = {}) {
    val font = FontFamily(Font(R.font.montserrat_alternates_semibold, FontWeight.SemiBold))
    val brush = Brush.verticalGradient(listOf(Color(0xFF1A1A2E), Color(0xFF4B0082)))

    BackHandler(onBack = onVolverClick)

    val obraMaestra = remember { mutableStateListOf<String>() }
    val muyBuena = remember { mutableStateListOf<String>() }
    val buena = remember { mutableStateListOf<String>() }
    val mala = remember { mutableStateListOf<String>() }
    val nefasta = remember { mutableStateListOf<String>() }
    val pool = remember { mutableStateListOf("Pelicula 1", "Pelicula 2", "Pelicula 3", "Pelicula 4", "Pelicula 5", "Pelicula 6") }

    Box(modifier = Modifier.fillMaxSize().background(brush)) {
        Column(modifier = Modifier.fillMaxSize().padding(top = 70.dp, start = 25.dp, end = 25.dp, bottom = 20.dp)) {
            Text("Organiza tu TierList", fontSize = 28.sp, color = Color.White, fontFamily = font, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(8.dp))
            Text("Pulsa en una pelicula para moverla", fontSize = 14.sp, color = Color.Gray, fontFamily = font)
            Spacer(Modifier.height(24.dp))

            Column(modifier = Modifier.weight(1f).fillMaxWidth().verticalScroll(rememberScrollState())) {
                TierZone("Obra Maestra", Color(0xFF3D2A54), obraMaestra, font)
                Spacer(Modifier.height(2.dp))
                TierZone("Muy Buena", Color(0xFF3D2A54), muyBuena, font)
                Spacer(Modifier.height(2.dp))
                TierZone("Buena", Color(0xFF3D2A54), buena, font)
                Spacer(Modifier.height(2.dp))
                TierZone("Mala", Color(0xFF3D2A54), mala, font)
                Spacer(Modifier.height(2.dp))
                TierZone("Nefasta", Color(0xFF3D2A54), nefasta, font)
                Spacer(Modifier.height(24.dp))

                Column(modifier = Modifier.fillMaxWidth()) {
                    Text("Peliculas disponibles", fontSize = 18.sp, color = Color.White, fontFamily = font, fontWeight = FontWeight.Bold)
                    Spacer(Modifier.height(12.dp))

                    if (pool.isEmpty()) {
                        Text("Todas las peliculas estan organizadas", fontSize = 14.sp, color = Color.Gray, fontFamily = font, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth())
                    } else {
                        LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            items(pool.toList()) { pelicula ->
                                Card(
                                    modifier = Modifier.width(100.dp).aspectRatio(1f),
                                    shape = RoundedCornerShape(12.dp),
                                    colors = CardDefaults.cardColors(containerColor = Color(0xFF2A2A3E)),
                                    onClick = { obraMaestra.add(pelicula); pool.remove(pelicula) }
                                ) {
                                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                                        Text(pelicula, color = Color.White, fontSize = 14.sp, fontFamily = font, textAlign = TextAlign.Center, modifier = Modifier.padding(8.dp))
                                    }
                                }
                            }
                        }
                    }
                }
                Spacer(Modifier.height(24.dp))
            }

            Button(
                onClick = onGuardarClick,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF6C63FF)),
                modifier = Modifier.fillMaxWidth().height(56.dp)
            ) {
                Text("Guardar TierList", color = Color.White, fontFamily = font, fontSize = 18.sp)
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

// componente zona de tier donde se pueden colocar peliculas
@Composable
fun TierZone(titulo: String, colorFondo: Color, peliculas: List<String>, font: FontFamily) {
    Row(modifier = Modifier.fillMaxWidth().height(100.dp), verticalAlignment = Alignment.CenterVertically) {
        Box(modifier = Modifier.width(90.dp).fillMaxHeight().background(colorFondo), contentAlignment = Alignment.CenterStart) {
            Text(titulo, fontSize = 14.sp, fontFamily = font, fontWeight = FontWeight.Bold, color = Color.White, modifier = Modifier.padding(start = 8.dp))
        }

        Box(modifier = Modifier.weight(1f).fillMaxHeight().background(Color.Black.copy(alpha = 0.3f)).padding(8.dp)) {
            if (peliculas.isEmpty()) {
                Text("", color = Color.Gray, fontSize = 14.sp, fontFamily = font, modifier = Modifier.align(Alignment.Center))
            } else {
                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxHeight()) {
                    items(peliculas) { pelicula ->
                        Card(
                            modifier = Modifier.width(60.dp).aspectRatio(0.7f),
                            shape = RoundedCornerShape(4.dp),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFF2A2A3E))
                        ) {
                            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                                Text(pelicula, color = Color.White, fontSize = 10.sp, fontFamily = font, textAlign = TextAlign.Center, modifier = Modifier.padding(4.dp))
                            }
                        }
                    }
                }
            }
        }
    }
}
