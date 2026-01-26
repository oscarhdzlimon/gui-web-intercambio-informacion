
# Guía de Implementación: TanStack Query en Búsqueda de Antecedentes

Este proyecto utiliza **@tanstack/angular-query-experimental** para gestionar el estado del servidor, la caché y la sincronización de datos asíncronos. A diferencia de un servicio convencional con `subscribe`, TanStack Query maneja automáticamente los estados de carga, error y persistencia en memoria.

## 1. Conceptos Fundamentales

### `queryKey` (La Identidad de la Data)

Es un arreglo que actúa como la **llave primaria** de la caché.

* **Uso en el proyecto:** `['antecedentes', this.paramBusqueda()]`.
* **Regla:** Cada vez que el signal `paramBusqueda` cambia, TanStack Query detecta que la llave es distinta y dispara automáticamente una nueva petición.

### `queryFn` (La Fuente de Verdad)

Es la función que devuelve una **Promesa**.

* **Uso:** Aunque nuestro servicio usa RxJS, transformamos el Observable a Promesa usando `lastValueFrom`. Esto permite que Query gestione el ciclo de vida del dato de forma más limpia.

---

## 2. Configuración de Tiempos (Caché vs. Frescura)

Para optimizar el rendimiento y evitar peticiones duplicadas al navegar entre pantallas, configuramos:

* **`staleTime` (5 minutos):** Es el tiempo que el dato se considera "fresco". Durante este periodo, si el usuario regresa a la pantalla de búsqueda, **no se realiza una petición HTTP**; la data se sirve instantáneamente desde la caché.
* **`gcTime` (10 minutos):** Es el tiempo de recolección de basura. Define cuánto tiempo permanecen los datos en memoria una vez que el componente se destruye (cuando el usuario sale de la sección).

---

## 3. Signals e Interoperabilidad

El proyecto utiliza **Signals de Angular** para integrarse con Query:

* **`this.antecedentesQuery.data()`**: Es un signal que contiene la respuesta del servidor.
* **`this.antecedentesQuery.isFetching()`**: Signal booleano que indica si hay una petición en vuelo (útil para mostrar *spinners* y evitar procesar datos viejos).
* **`enabled`**: Propiedad crítica que impide que la consulta se ejecute hasta que el contexto (`REF_SISTEMA`) esté descifrado.

---

## 4. Mutaciones (Escritura de Datos)

Para guardar asociaciones, usamos `injectMutation`. A diferencia de los Queries (Lectura), las Mutaciones se encargan de **modificar** datos y limpiar la caché.

```typescript
guardarAsociacionMutation = injectMutation(() => ({
  mutationFn: (data) => ... ,
  onSuccess: () => {
    // IMPORTANTE: Invalida la caché para forzar que las tablas se 
    // actualicen con los nuevos estados de "Asociado"
    this.queryClient.invalidateQueries({ queryKey: ['antecedentes'] });
  }
}));

```

---

## 5. El Flujo de Datos en el Componente

1. **Carga:** El componente recupera filtros del `BusquedaStateService`.
2. **Activación:** Una vez descifrado el expediente (`sistemasListos`), el `enabled` del Query pasa a `true`.
3. **Caché:** Si existe una búsqueda previa en `staleTime`, se muestra de inmediato.
4. **Efecto:** El `effect()` de Angular reacciona al `data()` de Query, mapea los resultados hacia los objetos visuales (como `nombreCompleto`) y refresca la UI.

## 6. Buenas Prácticas

1. **No suscribirse manualmente:** No uses `.subscribe()` sobre el resultado de la query. Usa el signal `.data()`.
2. **Reseteo de Queries:** Si necesitas limpiar la pantalla totalmente (borrar la caché), usa `this.queryClient.resetQueries({ queryKey: ['antecedentes'] })`.
3. **Invalidez:** Siempre que realices una acción que cambie los datos en la base de datos (Post/Put/Delete), llama a `invalidateQueries`.

## 7. Depuración con TanStack Query DevTools

Para entender qué está pasando con la caché en tiempo real, es fundamental conocer los estados por los que pasa una consulta. Esto evita confusiones cuando los datos parecen "no actualizarse".

### Estados de la Consulta

En las herramientas de desarrollo (o mediante signals), una query siempre estará en uno de estos estados:

* **Fresh (Verde):** Los datos están en caché y son válidos. No se harán peticiones HTTP.
* **Stale (Amarillo):** Los datos están en caché pero son "viejos". Al renderizar el componente, Query entregará estos datos instantáneamente pero disparará una petición de fondo para actualizarlos.
* **Fetching (Azul):** Hay una petición en curso.
* **Inactive (Gris):** Los datos están en caché pero ningún componente los está usando actualmente. Aquí es donde empieza el conteo del `gcTime`.

### Herramientas Sugeridas

Para proyectos Angular, se recomienda integrar el componente `<angular-query-devtools>` en el `app.component.html` (solo en ambiente de desarrollo). Esto abrirá un panel flotante que permite:

1. **Ver la `queryKey` exacta:** Útil para detectar si los parámetros de búsqueda se están enviando mal.
2. **Forzar Refetch:** Probar cómo reacciona la UI cuando los datos se actualizan.
3. **Invalidar Manualmente:** Ver cómo el sistema transita de datos viejos a nuevos.

---

## 8. Troubleshooting (Solución de Problemas Comunes)

| Problema | Causa Probable | Solución |
| --- | --- | --- |
| La tabla muestra datos de la búsqueda anterior por un segundo. | El `effect` no está validando `isFetching`. | Asegúrate de que el `effect` ignore los datos si `query.isFetching()` es verdadero. |
| El `gcTime` no parece funcionar. | Hay un componente oculto (quizás un modal) que sigue "escuchando" la query. | Verifica que los componentes se destruyan correctamente (`ngOnDestroy`). |
| La query no se dispara al regresar a la página. | El `staleTime` es muy largo y el componente no se reinició. | Esto es el comportamiento esperado. Si necesitas data fresca siempre, reduce `staleTime` a `0`. |

---
