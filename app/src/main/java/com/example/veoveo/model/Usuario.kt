package com.example.veoveo.model

// guarda la info de un usuario en firebase
data class Usuario(
    val uid: String = "", // identificador unico del usuario
    val username: String = "", // nombre de usuario
    val email: String = "", // correo electronico
    val fotoPerfil: String? = null, // url de la foto (puede estar vacia)
    val amigos: List<String> = emptyList(), // lista de ids de amigos
    val fechaCreacion: Long = System.currentTimeMillis() // cuando se creo la cuenta
)
