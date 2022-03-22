/// <reference types="cypress" />

describe('01: Trakt API Authorization', () => {
	beforeEach(function () {
		cy.wrap(Cypress.env('client_id')).as('client_id');
		cy.wrap(Cypress.env('client_secret')).as('client_secret');
	});

	describe('01_001: Device Authentication Code and Access Token Authorization', () => {
		it('01_001_001: Should obtain access tokens', function () {
			cy.request({
				method: 'POST',
				url: 'https://api.trakt.tv/oauth/device/code',
                failOnStatusCode: false,
				headers: {
					'Content-Type': 'application/json',
				},
				body: {
					client_id: Cypress.env('client_id'),
				},
			}).then($response => {
				expect($response.status).to.be.eq(200);
				expect($response.body).to.have.property('user_code');
				expect($response.body).to.have.property('verification_url');
				expect($response.body).to.have.property('expires_in');
				expect($response.body).to.have.property('interval');
            
				cy.verifyCode(
					$response.body.user_code,
					$response.body.verification_url
				).then(() => {
					cy.request({
						method: 'POST',
						url: 'https://api.trakt.tv/oauth/device/token',
						headers: {
							'Content-Type': 'application/json',
						},
						body: {
							code: $response.body.device_code,
							client_id: this.client_id,
							client_secret: this.client_secret,
						},
					})
				}) 
			})
		})
    })
})