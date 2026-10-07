const test = require('node:test');
const assert = require('node:assert/strict');

const { createDataService, validateApiData } = require('../data-service.js');

const sampleData = {
  nombre: 'API de la Vecindad',
  version: '1.0',
  tipo: 'JSON estático',
  personajes: [
    { id: 'chavo', nombre: 'EL CHAVO', foto: 'images/chavo.jpg' }
  ],
  historias: {
    chavo: [
      {
        student: 'Hola',
        teacher: 'Hola',
        twist: 'Hola',
        labels: ['EL CHAVO'],
        faces: ['😋'],
        sfx: ['MIRA'],
        twistPhotos: ['images/chavo.jpg']
      }
    ]
  }
};

test('valida que los datos de la API coincidan con la estructura esperada', () => {
  assert.deepEqual(validateApiData(sampleData), sampleData);
});

test('usa el endpoint principal cuando la petición succeeds', async () => {
  let requestedUrl;
  const service = createDataService({
    endpoint: 'https://api.example.com/data',
    fallback: 'data.json',
    fetcher: async (url) => {
      requestedUrl = url;
      return {
        ok: true,
        status: 200,
        json: async () => sampleData
      };
    }
  });

  const result = await service.load();

  assert.equal(requestedUrl, 'https://api.example.com/data');
  assert.equal(result.source, 'online');
  assert.deepEqual(result.data, sampleData);
});

test('carga el archivo local cuando la conexión falla', async () => {
  const service = createDataService({
    endpoint: 'https://api.example.com/data',
    fallback: 'data.json',
    fetcher: async () => {
      throw new TypeError('Failed to fetch');
    },
    fallbackFetcher: async () => ({
      ok: true,
      status: 200,
      json: async () => sampleData
    })
  });

  const result = await service.load();

  assert.equal(result.source, 'offline');
  assert.deepEqual(result.data, sampleData);
});

test('mantiene el flujo seguro si tampoco existe el archivo local', async () => {
  const service = createDataService({
    endpoint: 'https://api.example.com/data',
    fallback: 'data.json',
    fetcher: async () => {
      throw new TypeError('Failed to fetch');
    },
    fallbackFetcher: async () => ({ ok: false, status: 503 })
  });

  await assert.rejects(service.load(), /No se pudieron cargar los datos/);
});
