/**
 * @param {string} str
 */
export function slugify(str) {
  return str
    .replace(/[.,-/#!$%^&*;:{}=\-_`~()’]/g, '')
    .replace(/ +/g, '_')
    .toLowerCase()
}
