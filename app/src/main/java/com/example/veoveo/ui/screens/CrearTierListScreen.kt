package com.example.veoveo.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.example.veoveo.R
import com.example.veoveo.viewmodel.ViewModelBiblioteca
import com.example.veoveo.viewmodel.ViewModelTierLists

// Paso 1: Seleccionar películas para la TierList
@Composable
fun CrearTierListScreen(
    onVolverClick: () -> Unit = {},
    onSiguienteClick: (String, String, List<Int>) -> Unit = { _, _, _ -> },
    viewModelBiblioteca: ViewModelBiblioteca = viewModel()
) {
    val font = FontFamily(Font(R.font.montserrat_alternates_semibold, FontWeight.SemiBold))
    val brush = Brush.verticalGradient(listOf(Color(0xFF1A1A2E), Color(0xFF4B0082)))

    BackHandler(onBack = onVolverClick)

    // Estados
    var nombreTierList by remember { mutableStateOf("") }
    var descripcionTierList by remember { mutableStateOf("") }

    // Obtener películas del usuario
    val peliculasVistas by viewModelBiblioteca.peliculasVistas.collectAsState()
    val cargando by viewModelBiblioteca.cargando.collectAsState()

    // IDs de películas seleccionadas
    val peliculasSeleccionadas = remember { mutableStateListOf<Int>() }

    // Cargar películas al entrar
    LaunchedEffect(Unit) {
        viewModelBiblioteca.cargarPeliculas()
    }

    Box(modifier = Modifier.fillMaxSize().background(brush)) {
        Column(modifier = Modifier.fillMaxSize().padding(top = 70.dp, start = 25.dp, end = 25.dp, bottom = 20.dp)) {
            Text("Nueva TierList", fontSize = 32.sp, color = Color.White, fontFamily = font, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(24.dp))

            OutlinedTextField(
                value = nombreTierList,
                onValueChange = { nombreTierList = it },
                label = { Text("Nombre", color = Color.White, fontFamily = font) },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.White, unfocusedTextColor = Color.White,
                    focusedBorderColor = Color(0xFF6C63FF), unfocusedBorderColor = Color.White,
                    focusedContainerColor = Color.Transparent, unfocusedContainerColor = Color.Transparent
                ),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(16.dp))

            OutlinedTextField(
                value = descripcionTierList,
                onValueChange = { descripcionTierList = it },
                label = { Text("Descripción", color = Color.White, fontFamily = font) },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.White, unfocusedTextColor = Color.White,
                    focusedBorderColor = Color(0xFF6C63FF), unfocusedBorderColor = Color.White,
                    focusedContainerColor = Color.Transparent, unfocusedContainerColor = Color.Transparent
                ),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth().height(120.dp),
                maxLines = 4
            )
            Spacer(Modifier.height(24.dp))

            Text("Selecciona películas (${peliculasSeleccionadas.size} seleccionadas)", fontSize = 18.sp, color = Color.White, fontFamily = font)
            Spacer(Modifier.height(16.dp))

            // Indicador de carga
            if (cargando) {
                Box(modifier = Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Color.White)
                }
            } else if (peliculasVistas.isEmpty()) {
                Box(modifier = Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("No tienes películas vistas", color = Color.Gray, fontSize = 16.sp, fontFamily = font)
                        Spacer(Modifier.height(8.dp))
                        Text("Marca películas como vistas en tu biblioteca", color = Color.Gray, fontSize = 14.sp, fontFamily = font, textAlign = TextAlign.Center)
                    }
                }
            } else {
                LazyColumn(modifier = Modifier.weight(1f).fillMaxWidth()) {
                    val filas = peliculasVistas.chunked(2)
                    items(filas) { fila ->
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            fila.forEach { pelicula ->
                                val isSelected = peliculasSeleccionadas.contains(pelicula.idPelicula)
                                Column(
                                    modifier = Modifier.weight(1f).clickable {
                                        if (isSelected) peliculasSeleccionadas.remove(pelicula.idPelicula)
                                        else peliculasSeleccionadas.add(pelicula.idPelicula)
                                    },
                                    horizontalAlignment = Alignment.CenterHorizontally
                                ) {
                                    Box {
                                        Card(
                                            modifier = Modifier.fillMaxWidth().aspectRatio(0.67f),
                                            shape = RoundedCornerShape(12.dp),
                                            colors = CardDefaults.cardColors(
                                                containerColor = if (isSelected) Color(0xFF6C63FF) else Color(0xFF2A2A3E)
                                            )
                                        ) {
                                            if (pelicula.rutaPoster != null) {
                                                AsyncImage(
                                                    model = "https://image.tmdb.org/t/p/w200${pelicula.rutaPoster}",
                                                    contentDescription = pelicula.titulo,
                                                    contentScale = ContentScale.Crop,
                                                    modifier = Modifier.fillMaxSize()
                                                )
                                            } else {
                                                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                                                    Text(
                                                        pelicula.titulo,
                                                        color = Color.White,
                                                        fontSize = 14.sp,
                                                        fontFamily = font,
                                                        textAlign = TextAlign.Center,
                                                        modifier = Modifier.padding(8.dp)
                                                    )
                                                }
                                            }
                                        }
                                        Checkbox(
                                            checked = isSelected,
                                            onCheckedChange = {
                                                if (it) peliculasSeleccionadas.add(pelicula.idPelicula)
                                                else peliculasSeleccionadas.remove(pelicula.idPelicula)
                                            },
                                            colors = CheckboxDefaults.colors(
                                                checkedColor = Color.White,
                                                uncheckedColor = Color.White,
                                                checkmarkColor = Color(0xFF6C63FF)
                                            ),
                                            modifier = Modifier.align(Alignment.TopEnd).padding(4.dp).size(24.dp)
                                        )
                                    }
                                    Spacer(Modifier.height(8.dp))
                                    Text(
                                        pelicula.titulo,
                                        color = Color.White,
                                        fontSize = 12.sp,
                                        fontFamily = font,
                                        textAlign = TextAlign.Center,
                                        maxLines = 2
                                    )
                                }
                            }
                            repeat(2 - fila.size) { Spacer(Modifier.weight(1f)) }
                        }
                        Spacer(Modifier.height(16.dp))
                    }
                }
            }

            Button(
                onClick = {
                    onSiguienteClick(nombreTierList, descripcionTierList, peliculasSeleccionadas.toList())
                },
                enabled = nombreTierList.isNotBlank() && peliculasSeleccionadas.isNotEmpty(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF6C63FF),
                    disabledContainerColor = Color.Gray
                ),
                modifier = Modifier.fillMaxWidth().height(56.dp)
            ) {
                Text("Siguiente", color = Color.White, fontFamily = font, fontSize = 18.sp)
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
