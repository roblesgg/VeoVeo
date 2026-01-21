package com.example.veoveo.model

// guarda las solicitudes de amistad entre usuarios
data class SolicitudAmistad(
    val id: String = "", // identificador unico de la solicitud
    val deUid: String = "", // quien envia la solicitud
    val paraUid: String = "", // quien la recibe
    val deUsername: String = "", // nombre de quien envia
    val estado: String = "pendiente", // puede ser pendiente, aceptada o rechazada
    val fecha: Long = System.currentTimeMillis() // cuando se envio
)
