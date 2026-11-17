
describe('Inicio de sesión', () => {
  it('inicia sesión con un usuario de prueba', () => {
    cy.visit('/login')
    cy.get('input[autocomplete="username"]').type('ana')
    cy.get('input[type="password"]').type('ana-12345')
    cy.get('ion-button[type="submit"]').click()

    cy.url().should('include', '/publicaciones')
    cy.get('.usuario').should('have.text', 'ana')
  })

  it('no inicia sesión si la contraseña es incorrecta', () => {
    cy.visit('/login')
    cy.get('input[autocomplete="username"]').type('ana')
    cy.get('input[type="password"]').type('clave-incorrecta')
    cy.get('ion-button[type="submit"]').click()

    cy.window().its('localStorage').invoke('getItem', 'taller9-sesion').should('be.null')
  })

  it('cierra la sesión con el botón Salir', () => {

    cy.visitarConSesion('/publicaciones', 'ana', 'ana-12345')
    
    cy.contains('ion-button', 'Salir').click()
    
    cy.url().should('include', '/login')
    cy.window().its('localStorage').invoke('getItem', 'taller9-sesion').should('be.null')
  })
})