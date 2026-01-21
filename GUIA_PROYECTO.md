# guia del proyecto veoveo

## que es esta app
app de peliculas donde puedes:
- buscar peliculas
- marcar peliculas como vistas o por ver
- crear rankings (tier lists)
- añadir amigos y ver sus peliculas
- valorar peliculas con estrellas

## estructura del proyecto

### modelos (model/)
clases que guardan datos:
- **Usuario.kt** - info del usuario (nombre, email, foto, amigos)
- **PeliculaUsuario.kt** - peliculas que el usuario guarda
- **SolicitudAmistad.kt** - peticiones de amistad
- **TierList.kt** - rankings de peliculas por niveles
- **MovieResponse.kt** - respuesta de la api de tmdb con lista de peliculas
- **MovieDetails.kt** - info completa de una pelicula (reparto, generos, etc)

### repositorios (data/)
clases que se conectan con firebase y tmdb:
- **AuthRepository.kt** - login, registro, logout
- **RepositorioPeliculasUsuario.kt** - guardar y cargar peliculas del usuario
- **RepositorioUsuarios.kt** - gestionar usuarios, amigos, buscar gente
- **RepositorioTierLists.kt** - crear y gestionar tier lists

### viewmodels (viewmodel/)
clases intermedias entre pantallas y repositorios:
- **AuthViewModel.kt** - gestiona login y registro
- **ViewModelBiblioteca.kt** - gestiona peliculas guardadas
- **ViewModelSocial.kt** - gestiona amigos y solicitudes
- **ViewModelPerfil.kt** - gestiona perfil del usuario
- **ViewModelTierLists.kt** - gestiona tier lists
- **ViewModelDescubrir.kt** - gestiona carruseles de peliculas

### pantallas (ui/screens/)
las pantallas que ve el usuario:
- **LoginScreen.kt** - pantalla de login
- **RegisterScreen.kt** - pantalla de registro
- **MainScreen.kt** - pantalla principal con 4 pestañas (descubrir, biblioteca, social, perfil)
- **PeliculaScreen.kt** - detalles de una pelicula
- **PerfilScreen.kt** - perfil del usuario
- **SocialScreen.kt** - buscar amigos y ver solicitudes
- **SolicitudesScreen.kt** - aceptar o rechazar solicitudes de amistad
- **BibliotecaAmigoScreen.kt** - ver peliculas de un amigo
- **TierListScreen.kt** - ver una tier list
- **CrearTierListScreen.kt** - crear nueva tier list
- **EditarTierListScreen.kt** - editar tier list existente
- **AjustesScreen.kt** - ajustes de la app
- **ContactoScreen.kt** - pantalla de contacto

### navegacion (ui/navigation/)
controla como se mueve el usuario entre pantallas:
- **VeoVeoApp.kt** - punto de entrada, decide si mostrar login o app principal
- **AuthNavigation.kt** - navegacion de login/registro
- **AppNavigation.kt** - navegacion dentro de la app (pantallas principales)

### conexion (conexion/)
se conecta con la api de tmdb:
- **RetrofitClient.kt** - configuracion para conectar con tmdb
- **ApiService.kt** - define las peticiones a la api (buscar peliculas, obtener detalles, etc)

### utilidades (utils/)
- **PreferencesHelper.kt** - guarda preferencias del usuario en el dispositivo (que generos mostrar)

### tema (ui/theme/)
- **Color.kt** - colores de la app
- **Type.kt** - estilos de texto
- **Theme.kt** - tema general (modo claro/oscuro)

### main
- **MainActivity.kt** - punto de entrada de la app

## como funciona

1. **al abrir la app**: MainActivity arranca VeoVeoApp
2. **VeoVeoApp verifica**: si hay usuario logueado muestra app principal, si no muestra login
3. **login/registro**: AuthViewModel usa AuthRepository para autenticar con firebase
4. **app principal**: MainScreen con 4 pestañas
   - **descubrir**: muestra carruseles de peliculas por genero (ViewModelDescubrir)
   - **biblioteca**: muestra peliculas guardadas (ViewModelBiblioteca)
   - **social**: buscar amigos, ver solicitudes (ViewModelSocial)
   - **perfil**: ver y editar perfil, crear tier lists (ViewModelPerfil, ViewModelTierLists)
5. **al pulsar pelicula**: navega a PeliculaScreen que muestra detalles y permite guardar
6. **guardar pelicula**: ViewModelBiblioteca usa RepositorioPeliculasUsuario para guardar en firebase

## tecnologias usadas

- **kotlin** - lenguaje
- **jetpack compose** - interfaz
- **firebase auth** - autenticacion
- **firebase firestore** - base de datos
- **retrofit** - peticiones http
- **tmdb api** - info de peliculas
- **coil** - cargar imagenes

## firebase estructura

```
usuarios/
  {uid}/
    - username
    - email
    - fotoPerfil
    - amigos[]

    peliculas/
      {idPelicula}/
        - titulo
        - rutaPoster
        - estado (por_ver o vista)
        - valoracion

    tierLists/
      {idTierList}/
        - nombre
        - descripcion
        - tierObraMaestra[]
        - tierMuyBuena[]
        - tierBuena[]
        - tierMala[]
        - tierNefasta[]

solicitudes_amistad/
  {idSolicitud}/
    - deUid
    - paraUid
    - deUsername
    - estado (pendiente, aceptada, rechazada)
```

## como estudiar el proyecto

1. empieza por los **modelos** - entender que datos guarda la app
2. luego **repositorios** - como se conecta con firebase y tmdb
3. luego **viewmodels** - como se gestiona la logica
4. luego **pantallas** - como se muestra al usuario
5. finalmente **navegacion** - como se conectan las pantallas

## tips para el tfg

- cada archivo tiene comentarios explicando que hace
- los comentarios son directos y simples
- toda la funcionalidad esta lista
- podeis añadir mas features si quereis
- estudiad primero los modelos y repositorios, son lo mas importante
