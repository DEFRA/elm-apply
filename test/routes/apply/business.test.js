describe('GET /apply/businesses/{sbi}', () => {
  const config = require('../../../app/config')
  const restClient = require('../../../app/utils/rest-client')

  jest.mock('../../../app/utils/rest-client')

  const today = new Date().toISOString().slice(0, 10)
  const validSbi = '106599008'
  const getExistingSchemesUrl = `${config.complianceServiceUrl}/schemes/${validSbi}?date=${today}`
  const getExistingSchemesResponse = {
    res: {
      statusCode: 200
    },
    payload: {
      items: [
        {
          sbi: validSbi,
          schemeId: 's1',
          dateStart: '2017-08-01',
          dateEnd: '2019-01-01'
        }
      ]
    }
  }
  const getParcelsUrl = `${config.rpaLandServiceUrl}/LandParcels/MapServer/0/query?where=SBI=${validSbi}&outFields=*&f=geojson`
  const getParcelsResponse = {
    payload: {
      features: [
        {
          properties: {
            area_ha: 99,
            parcel_id: 1
          }
        }
      ]
    }
  }

  let createServer
  let server

  beforeAll(async () => {
    createServer = require('../../../app/server')
  })

  beforeEach(async () => {
    restClient.get.mockImplementation(url => {
      switch (url) {
        case getParcelsUrl:
          return getParcelsResponse

        case getExistingSchemesUrl:
          return getExistingSchemesResponse

        default:
          throw Error('restClient.get was called with an unexpected URL')
      }
    })

    server = await createServer()
    await server.initialize()
  })

  afterEach(async () => {
    jest.resetAllMocks()
    await server.stop()
  })

  test('fetches existing schemes data from compliance API', async () => {
    const options = {
      method: 'GET',
      url: `/apply/businesses/${validSbi}`
    }

    await server.inject(options)
    expect(restClient.get).toHaveBeenCalledWith(getExistingSchemesUrl)
  })

  test('fetches parcel data from RPA land API', async () => {
    const options = {
      method: 'GET',
      url: `/apply/businesses/${validSbi}`
    }

    await server.inject(options)
    expect(restClient.get).toHaveBeenCalledWith(getParcelsUrl)
  })

  test('returns 200 with HTML payload if SBI is valid', async () => {
    const options = {
      method: 'GET',
      url: `/apply/businesses/${validSbi}`
    }

    const response = await server.inject(options)

    expect(response.statusCode).toBe(200)
    expect(response.headers['content-type']).toBe('text/html; charset=utf-8')
  })

  test('rejects SBI of length other than 9 characters', async () => {
    const invalidSbis = [
      '12345678',
      '1234567890'
    ]

    for (const invalidSbi of invalidSbis) {
      const options = {
        method: 'GET',
        url: `/apply/businesses/${invalidSbi}`
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(400)
    }
  })

  test('rejects SBI containing a non-numeric character', async () => {
    // Note that some symbols are not tested here because they would cause a request to hit a different route: #?/\
    const disallowedCharacters = '!"£$%^&*()-=_+{}[]:@~;\'<>,.|abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

    for (const disallowedCharacter of disallowedCharacters) {
      const invalidSbi = disallowedCharacter.concat(validSbi.slice(1))
      const options = {
        method: 'GET',
        url: `/apply/businesses/${invalidSbi}`
      }

      const response = await server.inject(options)

      if (response.statusCode !== 400) {
        console.debug({ disallowedCharacter, invalidSbi, status: response.statusCode })
      }

      expect(response.statusCode).toBe(400)
    }
  })
})
