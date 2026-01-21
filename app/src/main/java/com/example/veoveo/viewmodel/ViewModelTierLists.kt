package com.example.veoveo.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.veoveo.data.RepositorioTierLists
import com.example.veoveo.model.TierList
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

// maneja tierlists
class ViewModelTierLists : ViewModel() {

    private val repositorio = RepositorioTierLists()

    // lista de tierlists del usuario
    private val _tierLists = MutableStateFlow<List<TierList>>(emptyList())
    val tierLists: StateFlow<List<TierList>> = _tierLists.asStateFlow()

    // tierlist actual que se esta viendo/editando
    private val _tierListActual = MutableStateFlow<TierList?>(null)
    val tierListActual: StateFlow<TierList?> = _tierListActual.asStateFlow()

    // estado de carga
    private val _cargando = MutableStateFlow(false)
    val cargando: StateFlow<Boolean> = _cargando.asStateFlow()

    // mensajes de error
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    // mensaje de exito
    private val _mensaje = MutableStateFlow<String?>(null)
    val mensaje: StateFlow<String?> = _mensaje.asStateFlow()

    // carga todas las tierlists del usuario
    fun cargarTierLists() {
        _cargando.value = true
        viewModelScope.launch {
            val resultado = repositorio.obtenerTierLists()
            if (resultado.isSuccess) {
                _tierLists.value = resultado.getOrNull() ?: emptyList()
            } else {
                _error.value = "Error al cargar TierLists"
            }
            _cargando.value = false
        }
    }

    // carga una tierlist especifica por id
    fun cargarTierList(tierListId: String) {
        _cargando.value = true
        viewModelScope.launch {
            val resultado = repositorio.obtenerTierList(tierListId)
            if (resultado.isSuccess) {
                _tierListActual.value = resultado.getOrNull()
            } else {
                _error.value = "Error al cargar TierList"
            }
            _cargando.value = false
        }
    }

    // crea una nueva tierlist
    fun crearTierList(tierList: TierList, onSuccess: () -> Unit = {}) {
        _cargando.value = true
        viewModelScope.launch {
            val resultado = repositorio.crearTierList(tierList)
            if (resultado.isSuccess) {
                _mensaje.value = "TierList creada exitosamente"
                cargarTierLists()
                onSuccess()
            } else {
                _error.value = "Error al crear TierList"
            }
            _cargando.value = false
        }
    }

    // actualiza una tierlist existente
    fun actualizarTierList(tierList: TierList, onSuccess: () -> Unit = {}) {
        _cargando.value = true
        viewModelScope.launch {
            val resultado = repositorio.actualizarTierList(tierList)
            if (resultado.isSuccess) {
                _mensaje.value = "TierList actualizada"
                cargarTierLists()
                onSuccess()
            } else {
                _error.value = "Error al actualizar TierList"
            }
            _cargando.value = false
        }
    }

    // elimina una tierlist
    fun eliminarTierList(tierListId: String, onSuccess: () -> Unit = {}) {
        _cargando.value = true
        viewModelScope.launch {
            val resultado = repositorio.eliminarTierList(tierListId)
            if (resultado.isSuccess) {
                _mensaje.value = "TierList eliminada"
                cargarTierLists()
                onSuccess()
            } else {
                _error.value = "Error al eliminar TierList"
            }
            _cargando.value = false
        }
    }

    // establece la tierlist actual
    fun setTierListActual(tierList: TierList?) {
        _tierListActual.value = tierList
    }

    // limpia mensajes
    fun limpiarMensajes() {
        _error.value = null
        _mensaje.value = null
    }
}
