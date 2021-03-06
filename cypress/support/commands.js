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
Cypress.Commands.add('verifyCode', (code, verificationUrl) => {
	cy.visit('/auth/signin')
	cy.get('#user_login').type(Cypress.env('user').username)
	cy.get('#user_password').type(Cypress.env('user').password)
	cy.contains('Sign in').click()

	cy.visit(verificationUrl)
	cy.get('#code').type(code)
	cy.contains('Continue').click()
	cy.get('#auth-form-wrapper').should('be.visible')
	cy.get('input[name="commit"]').contains('Yes').click()
	cy.contains('Woohoo!').should('be.visible')
})

Cypress.Commands.add('getAccessToken', () => {
	cy.request({
		method: 'POST',
		url: 'https://api.trakt.tv/oauth/device/code',
		headers: {
			'Content-Type': 'application/json',
		},
		failOnStatusCode: false,
		body: {
			client_id: Cypress.env('client_id'),
		},
	}).then(response => {
		cy.verifyCode(response.body.user_code, response.body.verification_url).then(
			() => {
				cy.request({
					method: 'POST',
					url: 'https://api.trakt.tv/oauth/device/token',
					headers: {
						'Content-Type': 'application/json',
					},
					body: {
						code: response.body.device_code,
						client_id: Cypress.env('client_id'),
						client_secret: Cypress.env('client_secret'),
					},
				}).then(tokenResponse => {
					Cypress.env('access_token', tokenResponse.body.access_token)
					Cypress.env('refresh_token', tokenResponse.body.refresh_token)
				})
			}
		)
	})
})

Cypress.Commands.add('createUserList', (name, privacy) => {
	cy.request({
		method: 'POST',
		url: `https://api.trakt.tv/users/${Cypress.env('user').username}/lists`,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${Cypress.env('access_token')}`,
			'trakt-api-version': Cypress.env('trakt_api_version'),
			'trakt-api-key': Cypress.env('client_id'),
		},
		body: {
			name: name,
			description: 'Some description for list',
			privacy: privacy,
			display_numbers: true,
			allow_comments: true,
			sort_by: 'rank',
			sort_how: 'asc',
		},
		failOnStatusCode: false,
	}).then(response => {
		const resp = response
		cy.wrap(resp)
	})
})

Cypress.Commands.add('deleteAnyActiveCheckins', () => {
	cy.request({
		method: 'DELETE',
		url: `https://api.trakt.tv/checkin`,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${Cypress.env('access_token')}`,
			'trakt-api-version': Cypress.env('trakt_api_version'),
			'trakt-api-key': Cypress.env('client_id'),
		},
		failOnStatusCode: false,
	}).then(response => {
		const resp = response
		cy.wrap(resp)
	})
})

Cypress.Commands.add('addComment', movie => {
	cy.request({
		method: 'POST',
		url: 'https://api.trakt.tv/comments',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${Cypress.env('access_token')}`,
			'trakt-api-version': Cypress.env('trakt_api_version'),
			'trakt-api-key': Cypress.env('client_id'),
		},
		body: {
			movie: movie,
			comment: 'I like this movie so much!',
			spoiler: false,
		},
		failOnStatusCode: false,
	}).then(response => {
		const id = response.body.id
		return id
	})
})