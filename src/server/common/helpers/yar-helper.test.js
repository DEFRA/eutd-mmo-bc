import {
  setYarValue,
  getYarValue,
  clearYarValue
} from '~/src/server/common/helpers/yar-helper.js'

describe('#yar-helper', () => {
  test('Should set a yar value', () => {
    const request = {
      yar: {
        set: jest.fn()
      }
    }
    setYarValue(request, 'certNumber', '123456')
    expect(request.yar.set.mock.calls[0][0]).toBe('certNumber')
    expect(request.yar.set.mock.calls[0][1]).toBe('123456')
  })

  test('Should get a yar value', () => {
    const request = {
      yar: {
        get: jest.fn().mockReturnValue('123456')
      }
    }
    const result = getYarValue(request, 'certNumber')
    expect(request.yar.get.mock.calls[0][0]).toBe('certNumber')
    expect(result).toBe('123456')
  })

  test('Should return null if yar does not exist', () => {
    const request = {}
    const result = getYarValue(request, 'certNumber')
    expect(result).toBeNull()
  })

  test('Should clear a yar value', () => {
    const request = {
      yar: {
        clear: jest.fn()
      }
    }
    clearYarValue(request, 'certNumber')
    expect(request.yar.clear.mock.calls[0][0]).toBe('certNumber')
  })
})
