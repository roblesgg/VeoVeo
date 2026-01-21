package com.example.veoveo.model

/**
 * Modelo de TierList para organizar películas en categorías/tiers
 */
data class TierList(
    val id: String = "",
    val nombre: String = "",
    val descripcion: String = "",
    val creadorUid: String = "",
    val fechaCreacion: Long = System.currentTimeMillis(),
    val ultimaModificacion: Long = System.currentTimeMillis(),

    // IDs de películas en cada tier
    val tierObraMaestra: List<Int> = emptyList(),
    val tierMuyBuena: List<Int> = emptyList(),
    val tierBuena: List<Int> = emptyList(),
    val tierMala: List<Int> = emptyList(),
    val tierNefasta: List<Int> = emptyList(),

    val publica: Boolean = false
) {
    /**
     * Convierte la TierList a un Map para guardar en Firestore
     */
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
        /**
         * Crea una TierList desde un Map de Firestore
         */
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

    /**
     * Obtiene todas las películas de todos los tiers
     */
    fun todasLasPeliculas(): List<Int> {
        return tierObraMaestra + tierMuyBuena + tierBuena + tierMala + tierNefasta
    }

    /**
     * Cuenta total de películas en la TierList
     */
    fun cantidadPeliculas(): Int = todasLasPeliculas().size
}
