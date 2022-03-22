describe('Test - visit web site', () => { 
    it('TEST 00 - Visit web site',()=>{
        cy.visit(`${Cypress.env('baseUrl')}`)
    })
})