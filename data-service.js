(function (root, factory) {
  const api = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }

  root.ApiDataService = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const REQUIRED_FIELDS = ['nombre', 'version', 'tipo', 'personajes', 'historias'];

  function validateApiData(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new TypeError('La respuesta API no tiene una estructura de objeto válida.');
    }

    for (const field of REQUIRED_FIELDS) {
      if (!(field in value)) {
        throw new TypeError(`La respuesta API carece del campo requerido: ${field}`);
      }
    }

    if (!Array.isArray(value.personajes) || !value.personajes.every(persona => (
      persona &&
      typeof persona.id === 'string' &&
      typeof persona.nombre === 'string' &&
      typeof persona.foto === 'string'
    ))) {
      throw new TypeError('El campo personajes debe contener objetos con id, nombre y foto.');
    }

    if (!value.historias || typeof value.historias !== 'object' || Array.isArray(value.historias)) {
      throw new TypeError('El campo historias debe contener un objeto.');
    }

    for (const [characterId, histories] of Object.entries(value.historias)) {
      if (!Array.isArray(histories)) {
        throw new TypeError(`Las historias de ${characterId} deben ser un arreglo.`);
      }

      histories.forEach((history, index) => {
        if (!history || typeof history !== 'object') {
          throw new TypeError(`La historia ${index} de ${characterId} no es un objeto.`);
        }

        for (const field of ['student', 'teacher', 'twist', 'labels', 'faces', 'sfx', 'twistPhotos']) {
          if (!(field in history)) {
            throw new TypeError(`La historia ${index} de ${characterId} carece de ${field}.`);
          }
        }

        for (const field of ['labels', 'faces', 'sfx', 'twistPhotos']) {
          if (!Array.isArray(history[field]) || !history[field].every(item => typeof item === 'string')) {
            throw new TypeError(`El campo ${field} debe contener solo cadenas.`);
          }
        }
      });
    }

    return value;
  }

  async function readJson(response) {
    if (!response || typeof response.ok !== 'boolean' || typeof response.json !== 'function') {
      throw new TypeError('La respuesta no es una respuesta HTTP válida.');
    }

    if (!response.ok) {
      throw new Error(`La petición API terminó con HTTP ${response.status || 'desconocido'}.`);
    }

    return validateApiData(await response.json());
  }

  function createDataService(options) {
    const endpoint = options.endpoint;
    const fallback = options.fallback;
    const fetcher = options.fetcher || (typeof fetch === 'function' ? fetch.bind(globalThis) : null);
    const fallbackFetcher = options.fallbackFetcher || (typeof fetch === 'function' ? fetch.bind(globalThis) : null);

    async function load() {
      try {
        if (!fetcher) {
          throw new Error('La función fetch no está disponible.');
        }

        const onlineData = await readJson(await fetcher(endpoint));
        return { data: onlineData, source: 'online' };
      } catch (onlineError) {
        if (!fallbackFetcher) {
          throw new Error(`No se pudieron cargar los datos desde ${endpoint} ni desde ${fallback}.`);
        }

        try {
          const offlineData = await readJson(await fallbackFetcher(fallback));
          return { data: offlineData, source: 'offline' };
        } catch (fallbackError) {
          throw new Error(`No se pudieron cargar los datos desde ${endpoint} ni desde ${fallback}.`, {
            cause: { onlineError, fallbackError }
          });
        }
      }
    }

    return { load, getStatus: load };
  }

  return { createDataService, validateApiData, readJson };
});
