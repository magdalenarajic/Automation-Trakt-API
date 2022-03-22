/// <reference types="cypress" />
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
Cypress.Commands.add('verifyCode',(code, verificationUrl)=>{
    cy.visit(`https://trakt.tv/auth/signin`);
    cy.get('#user_login').type(Cypress.env('user').username);
    cy.get('#user_password').type(Cypress.env('user').password);
    cy.contains('Sign in').click();

    cy.visit(verificationUrl);
	cy.get('#code').type(code);
	cy.contains('Continue').click();
    cy.get('#auth-form-wrapper').should('be.visible')
	cy.get('input[name="commit"]').contains('Yes').click();
	cy.contains('Woohoo!').should('be.visible');
})