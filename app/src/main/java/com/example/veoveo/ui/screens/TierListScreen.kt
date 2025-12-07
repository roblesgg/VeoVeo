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
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
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

// pantalla que muestra una tierlist especifica con sus franjas
@Composable
fun TierListScreen(
    onVolverClick: () -> Unit = {},
    onEditarClick: () -> Unit = {},
    onEliminarClick: () -> Unit = {},
    onPeliculaClick: (String) -> Unit = {}
) {
    val font = FontFamily(Font(R.font.montserrat_alternates_semibold, FontWeight.SemiBold))
    val brush = Brush.verticalGradient(listOf(Color(0xFF1A1A2E), Color(0xFF4B0082)))

    BackHandler(onBack = onVolverClick)

    val nombreTierList = "Mis Favoritas"
    val obraMaestra = remember { listOf("Pelicula 1", "Pelicula 2") }
    val muyBuena = remember { listOf("Pelicula 3", "Pelicula 4", "Pelicula 5") }
    val buena = remember { listOf("Pelicula 6") }
    val mala = remember { listOf("Pelicula 7", "Pelicula 8") }
    val nefasta = remember { listOf<String>() }

    Box(modifier = Modifier.fillMaxSize().background(brush)) {
        Column(
            modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState())
                .padding(top = 70.dp, bottom = 20.dp, start = 25.dp, end = 25.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Card(
                modifier = Modifier.width(200.dp).aspectRatio(1f),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF2A2A3E))
            ) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(nombreTierList, color = Color.White, fontSize = 18.sp, fontFamily = font, textAlign = TextAlign.Center)
                }
            }
            Spacer(Modifier.height(24.dp))
            Text(nombreTierList, fontSize = 28.sp, color = Color.White, fontFamily = font, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
            Spacer(Modifier.height(32.dp))

            TierRow("Obra Maestra", Color(0xFF3D2A54), obraMaestra, font, onPeliculaClick)
            Spacer(Modifier.height(2.dp))
            TierRow("Muy Buena", Color(0xFF3D2A54), muyBuena, font, onPeliculaClick)
            Spacer(Modifier.height(2.dp))
            TierRow("Buena", Color(0xFF3D2A54), buena, font, onPeliculaClick)
            Spacer(Modifier.height(2.dp))
            TierRow("Mala", Color(0xFF3D2A54), mala, font, onPeliculaClick)
            Spacer(Modifier.height(2.dp))
            TierRow("Nefasta", Color(0xFF3D2A54), nefasta, font, onPeliculaClick)
            Spacer(Modifier.height(32.dp))

            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Button(
                    onClick = onEditarClick,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF6C63FF)),
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Default.Edit, "editar", tint = Color.White)
                    Spacer(Modifier.width(8.dp))
                    Text("Editar", color = Color.White, fontFamily = font, fontSize = 16.sp)
                }
                Button(
                    onClick = onEliminarClick,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFF5252)),
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Default.Delete, "eliminar", tint = Color.White)
                    Spacer(Modifier.width(8.dp))
                    Text("Eliminar", color = Color.White, fontFamily = font, fontSize = 16.sp)
                }
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
fun TierListScreenPreview() {
    TierListScreen()
}

// componente que muestra una fila de tier con titulo y peliculas
@Composable
fun TierRow(titulo: String, colorFondo: Color, peliculas: List<String>, font: FontFamily, onPeliculaClick: (String) -> Unit = {}) {
    Row(
        modifier = Modifier.fillMaxWidth().height(100.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier.width(90.dp).fillMaxHeight().background(colorFondo),
            contentAlignment = Alignment.CenterStart
        ) {
            Text(titulo, fontSize = 14.sp, fontFamily = font, fontWeight = FontWeight.Bold, color = Color.White, modifier = Modifier.padding(start = 8.dp))
        }

        Box(
            modifier = Modifier.weight(1f).fillMaxHeight().background(Color.Black.copy(alpha = 0.3f)).padding(8.dp)
        ) {
            if (peliculas.isEmpty()) {
                Text("", color = Color.Gray, fontSize = 14.sp, fontFamily = font, modifier = Modifier.align(Alignment.Center))
            } else {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.fillMaxHeight()
                ) {
                    items(peliculas) { pelicula ->
                        Card(
                            modifier = Modifier.width(60.dp).aspectRatio(0.7f).clickable { onPeliculaClick(pelicula) },
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
