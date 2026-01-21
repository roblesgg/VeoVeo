package com.example.veoveo.model

// guarda un ranking de peliculas organizadas por niveles
data class TierList(
    val id: String = "",
    val nombre: String = "",
    val descripcion: String = "",
    val creadorUid: String = "", // quien creo esta tier list
    val fechaCreacion: Long = System.currentTimeMillis(),
    val ultimaModificacion: Long = System.currentTimeMillis(),

    // cada tier guarda ids de peliculas
    val tierObraMaestra: List<Int> = emptyList(),
    val tierMuyBuena: List<Int> = emptyList(),
    val tierBuena: List<Int> = emptyList(),
    val tierMala: List<Int> = emptyList(),
    val tierNefasta: List<Int> = emptyList(),

    val publica: Boolean = false // si otros usuarios pueden verla
) {
    // convierte a mapa para guardarlo en firebase
    fun toMap(): Map<String, Any> {
        return mapOf(
            "id" to id,
            "nombre" to nombre,
            "descripcion" to descripcion,
            "creadorUid" to creadorUid,
            "fechaCreacion" to fechaCreacion,
            "ultimaModificacion" to ultimaModificacion,
            "tierObraMaestra" to tierObraMaestra,
            "tierMuyBuena" to tierMuyBuena,
            "tierBuena" to tierBuena,
            "tierMala" to tierMala,
            "tierNefasta" to tierNefasta,
            "publica" to publica
        )
    }

    companion object {
        // crea una tier list desde los datos de firebase
        fun fromMap(id: String, map: Map<String, Any>): TierList {
            return TierList(
                id = id,
                nombre = map["nombre"] as? String ?: "",
                descripcion = map["descripcion"] as? String ?: "",
                creadorUid = map["creadorUid"] as? String ?: "",
                fechaCreacion = map["fechaCreacion"] as? Long ?: System.currentTimeMillis(),
                ultimaModificacion = map["ultimaModificacion"] as? Long ?: System.currentTimeMillis(),
                tierObraMaestra = (map["tierObraMaestra"] as? List<*>)?.mapNotNull { (it as? Number)?.toInt() } ?: emptyList(),
                tierMuyBuena = (map["tierMuyBuena"] as? List<*>)?.mapNotNull { (it as? Number)?.toInt() } ?: emptyList(),
                tierBuena = (map["tierBuena"] as? List<*>)?.mapNotNull { (it as? Number)?.toInt() } ?: emptyList(),
                tierMala = (map["tierMala"] as? List<*>)?.mapNotNull { (it as? Number)?.toInt() } ?: emptyList(),
                tierNefasta = (map["tierNefasta"] as? List<*>)?.mapNotNull { (it as? Number)?.toInt() } ?: emptyList(),
                publica = map["publica"] as? Boolean ?: false
            )
        }
    }

    // junta todas las peliculas de todos los tiers
    fun todasLasPeliculas(): List<Int> {
        return tierObraMaestra + tierMuyBuena + tierBuena + tierMala + tierNefasta
    }

    // cuenta cuantas peliculas hay en total
    fun cantidadPeliculas(): Int = todasLasPeliculas().size
}
