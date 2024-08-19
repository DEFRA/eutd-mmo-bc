export function setYarValue(request, key, value) {
  request.yar.set(key, value)
}

export function getYarValue(request, key) {
  if (request.yar) {
    return request.yar.get(key)
  }
  return null
}

export function clearYarValue(request, key) {
  request.yar.clear(key)
}
