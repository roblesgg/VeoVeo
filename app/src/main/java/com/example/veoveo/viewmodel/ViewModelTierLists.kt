package com.example.veoveo.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.veoveo.data.RepositorioTierLists
import com.example.veoveo.model.TierList
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * ViewModel para gestionar TierLists
 */
class ViewModelTierLists : ViewModel() {

    private val repositorio = RepositorioTierLists()

    // Lista de TierLists del usuario
    private val _tierLists = MutableStateFlow<List<TierList>>(emptyList())
    val tierLists: StateFlow<List<TierList>> = _tierLists.asStateFlow()

    // TierList actual que se está viendo/editando
    private val _tierListActual = MutableStateFlow<TierList?>(null)
    val tierListActual: StateFlow<TierList?> = _tierListActual.asStateFlow()

    // Estado de carga
    private val _cargando = MutableStateFlow(false)
    val cargando: StateFlow<Boolean> = _cargando.asStateFlow()

    // Mensajes de error
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    // Mensaje de éxito
    private val _mensaje = MutableStateFlow<String?>(null)
    val mensaje: StateFlow<String?> = _mensaje.asStateFlow()

    /**
     * Carga todas las TierLists del usuario
     */
    fun cargarTierLists() {
        Log.d("ViewModelTierLists", "Cargando TierLists...")
        _cargando.value = true
        viewModelScope.launch {
            val resultado = repositorio.obtenerTierLists()
            if (resultado.isSuccess) {
                _tierLists.value = resultado.getOrNull() ?: emptyList()
                Log.d("ViewModelTierLists", "TierLists cargadas: ${_tierLists.value.size}")
            } else {
                _error.value = "Error al cargar TierLists"
                Log.e("ViewModelTierLists", "Error al cargar", resultado.exceptionOrNull())
            }
            _cargando.value = false
        }
    }

    /**
     * Carga una TierList específica por su ID
     */
    fun cargarTierList(tierListId: String) {
        Log.d("ViewModelTierLists", "Cargando TierList: $tierListId")
        _cargando.value = true
        viewModelScope.launch {
            val resultado = repositorio.obtenerTierList(tierListId)
            if (resultado.isSuccess) {
                _tierListActual.value = resultado.getOrNull()
                Log.d("ViewModelTierLists", "TierList cargada: ${_tierListActual.value?.nombre}")
            } else {
                _error.value = "Error al cargar TierList"
                Log.e("ViewModelTierLists", "Error al cargar", resultado.exceptionOrNull())
            }
            _cargando.value = false
        }
    }

    /**
     * Crea una nueva TierList
     */
    fun crearTierList(tierList: TierList, onSuccess: () -> Unit = {}) {
        Log.d("ViewModelTierLists", "Creando TierList: ${tierList.nombre}")
        _cargando.value = true
        viewModelScope.launch {
            val resultado = repositorio.crearTierList(tierList)
            if (resultado.isSuccess) {
                _mensaje.value = "TierList creada exitosamente"
                cargarTierLists() // Recargar la lista
                onSuccess()
                Log.d("ViewModelTierLists", "TierList creada con ID: ${resultado.getOrNull()}")
            } else {
                _error.value = "Error al crear TierList"
                Log.e("ViewModelTierLists", "Error al crear", resultado.exceptionOrNull())
            }
            _cargando.value = false
        }
    }

    /**
     * Actualiza una TierList existente
     */
    fun actualizarTierList(tierList: TierList, onSuccess: () -> Unit = {}) {
        Log.d("ViewModelTierLists", "Actualizando TierList: ${tierList.id}")
        _cargando.value = true
        viewModelScope.launch {
            val resultado = repositorio.actualizarTierList(tierList)
            if (resultado.isSuccess) {
                _mensaje.value = "TierList actualizada"
                cargarTierLists() // Recargar la lista
                onSuccess()
                Log.d("ViewModelTierLists", "TierList actualizada: ${tierList.id}")
            } else {
                _error.value = "Error al actualizar TierList"
                Log.e("ViewModelTierLists", "Error al actualizar", resultado.exceptionOrNull())
            }
            _cargando.value = false
        }
    }

    /**
     * Elimina una TierList
     */
    fun eliminarTierList(tierListId: String, onSuccess: () -> Unit = {}) {
        Log.d("ViewModelTierLists", "Eliminando TierList: $tierListId")
        _cargando.value = true
        viewModelScope.launch {
            val resultado = repositorio.eliminarTierList(tierListId)
            if (resultado.isSuccess) {
                _mensaje.value = "TierList eliminada"
                cargarTierLists() // Recargar la lista
                onSuccess()
                Log.d("ViewModelTierLists", "TierList eliminada: $tierListId")
            } else {
                _error.value = "Error al eliminar TierList"
                Log.e("ViewModelTierLists", "Error al eliminar", resultado.exceptionOrNull())
            }
            _cargando.value = false
        }
    }

    /**
     * Establece la TierList actual
     */
    fun setTierListActual(tierList: TierList?) {
        _tierListActual.value = tierList
    }

    /**
     * Limpia los mensajes
     */
    fun limpiarMensajes() {
        _error.value = null
        _mensaje.value = null
    }
}
