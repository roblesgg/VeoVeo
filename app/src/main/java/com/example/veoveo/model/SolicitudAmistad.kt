package com.example.veoveo.model

/**
 * Modelo para solicitudes de amistad
 */
data class SolicitudAmistad(
    val id: String = "",
    val deUid: String = "",
    val paraUid: String = "",
    val deUsername: String = "",
    val estado: String = "pendiente", // pendiente, aceptada, rechazada
    val fecha: Long = System.currentTimeMillis()
)
