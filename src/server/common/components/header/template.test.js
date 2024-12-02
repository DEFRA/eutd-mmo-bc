import { renderComponent } from '~/src/server/common/test-helpers/component-helpers.js'

describe('Header Component', () => {
  /** @type {CheerioAPI} */
  let $heading

  describe('Logged out', () => {
    beforeEach(() => {
      $heading = renderComponent('header', {
        loggedIn: false,
        serviceName: 'Check an Export Certificate',
        serviceUrl: '/'
      })
    })

    test('Should render app header component', () => {
      expect($heading('[data-module="govuk-header"]')).toHaveLength(1)
    })

    test('Should contain expected heading', () => {
      expect($heading('a.govuk-header__service-name').text().trim()).toBe(
        'Check an Export Certificate'
      )

      expect($heading('a[href="/"]')).toHaveLength(1)
    })

    test('Should not render the sign out button', () => {
      expect($heading('#signOutLink')).toHaveLength(0)
    })
  })

  describe('Logged in', () => {
    beforeEach(() => {
      $heading = renderComponent('header', {
        loggedIn: true,
        serviceName: 'Check an Export Certificate',
        serviceUrl: '/'
      })
    })

    test('Should render app header component', () => {
      expect($heading('[data-module="govuk-header"]')).toHaveLength(1)
    })

    test('Should render the sign out button', () => {
      expect($heading('#signOutLink')).toHaveLength(1)
    })
  })
})

/**
 * @import { CheerioAPI } from 'cheerio'
 */
