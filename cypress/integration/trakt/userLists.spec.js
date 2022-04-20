/// <reference types="cypress" />
describe('02: Trakt API User list ', () => {
	describe('02_001: Create, Update and Delete operations with users lists', () => {
		before(function () {
			cy.getAccessToken()
		})

		it('02_001_001: Should delete all User Lists', () => {
			cy.request({
				method: 'GET',
				url: `https://api.trakt.tv/users/mrajic/lists`,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${Cypress.env('access_token')}`,
					'trakt-api-version': Cypress.env('trakt_api_version'),
					'trakt-api-key': Cypress.env('client_id'),
				},
				failOnStatusCode: false,
			}).then(userCustomList => {
				const lists = Cypress.$.makeArray(userCustomList.body)
		
				lists.forEach(list => {
					cy.request({
						method: 'DELETE',
						url: `https://api.trakt.tv/users/${
							Cypress.env('user').username
						}/lists/${list.ids.slug}`,
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${Cypress.env('access_token')}`,
							'trakt-api-version': Cypress.env('trakt_api_version'),
							'trakt-api-key': Cypress.env('client_id'),
						},
						failOnStatusCode: false,
					}).then(response => {
						expect(response.status).to.be.eq(204)
					})
				})
			}) 
		})

		it('02_001_002: Should create private user list and not allow to see for user without authorization', () => {
			cy.createUserList('My first private list', 'private')
			cy.request({
				method: 'GET',
				url: `https://api.trakt.tv/users/${Cypress.env('user').username}/lists`,
				headers: {
					'Content-Type': 'application/json',
					'trakt-api-version': Cypress.env('trakt_api_version'),
					'trakt-api-key': Cypress.env('client_id'),
				},
				failOnStatusCode: false,
			}).then(userCustomList => {
				expect(userCustomList.body).to.be.empty
			})
		})

		it('02_001_003: Should show private list for authorized user', () => {
			cy.request({
				method: 'GET',
				url: `https://api.trakt.tv/users/${Cypress.env('user').username}/lists`,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${Cypress.env('access_token')}`,
					'trakt-api-version': Cypress.env('trakt_api_version'),
					'trakt-api-key': Cypress.env('client_id'),
				},
				failOnStatusCode: false,
			}).then(userCustomList => {
				expect(userCustomList.status).to.be.eq(200)
				expect(userCustomList.body[0].name).to.be.eq('My first private list')
			})
		})

		it('02_001_004: Should create public user list and get that list without authorization', () => {
			cy.createUserList('My public list-Star Wars', 'public')
			cy.request({
				method: 'GET',
				url: `https://api.trakt.tv/users/${Cypress.env('user').username}/lists`,
				headers: {
					'Content-Type': 'application/json',
					'trakt-api-version': Cypress.env('trakt_api_version'),
					'trakt-api-key': Cypress.env('client_id'),
				},
				failOnStatusCode: false,
			}).then(userCustomList => {
				expect(userCustomList.status).to.be.eq(200)
				expect(userCustomList.body[0].name).to.be.eq(
					'My public list-Star Wars'
				)
			})
		})

		it('02_001_005: Should get all user lists', () => {
			cy.request({
				method: 'GET',
				url: `https://api.trakt.tv/users/mrajic/lists`,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${Cypress.env('access_token')}`,
					'trakt-api-version': Cypress.env('trakt_api_version'),
					'trakt-api-key': Cypress.env('client_id'),
				},
				failOnStatusCode: false,
			}).then(response => {
				expect(response.status).to.be.eq(200)
			})
		})

		it('02_001_006: Should successfully delete user list', () => {
			cy.request({
				method: 'GET',
				url: `https://api.trakt.tv/users/mrajic/lists`,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${Cypress.env('access_token')}`,
					'trakt-api-version': Cypress.env('trakt_api_version'),
					'trakt-api-key': Cypress.env('client_id'),
				},
				failOnStatusCode: false,
			}).then(userCustomList => {
				expect(userCustomList.status).to.be.eq(200)
				expect(userCustomList.body[1].name).to.be.eq(
					'My public list-Star Wars'
				)

				cy.request({
					method: 'DELETE',
					url: `https://api.trakt.tv/users/${
						Cypress.env('user').username
					}/lists/${userCustomList.body[1].ids.slug}`,
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${Cypress.env('access_token')}`,
						'trakt-api-version': Cypress.env('trakt_api_version'),
						'trakt-api-key': Cypress.env('client_id'),
					},
					failOnStatusCode: false,
				}).then(response => {
					expect(response.status).to.be.eq(204)
				})
			})
		})

		it('02_001_007: Should successfully update one user list', () => {
			cy.request({
				method: 'GET',
				url: `https://api.trakt.tv/users/mrajic/lists`,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${Cypress.env('access_token')}`,
					'trakt-api-version': Cypress.env('trakt_api_version'),
					'trakt-api-key': Cypress.env('client_id'),
				},
				failOnStatusCode: false,
			}).then(userCustomList => {
				expect(userCustomList.status).to.be.eq(200)
				expect(userCustomList.body[0].name).to.be.eq('My first private list')

				cy.request({
					method: 'PUT',
					url: `https://api.trakt.tv/users/${
						Cypress.env('user').username
					}/lists/${userCustomList.body[0].ids.slug}`,
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${Cypress.env('access_token')}`,
						'trakt-api-version': Cypress.env('trakt_api_version'),
						'trakt-api-key': Cypress.env('client_id'),
					},
					failOnStatusCode: false,
					body: { name: 'Updated list' },
				}).then(response => {
					expect(response.status).to.be.eq(200)
				})
			})
		})
	})

	describe('02_002: Invalid scenarios with user lists', () => {
		before(function () {
			cy.getAccessToken()
		})

		it('02_002_001: Should return 401 when not authorized for create list', () => {
			cy.request({
				method: 'POST',
				url: `https://api.trakt.tv/users/${Cypress.env('user').username}/lists`,
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer with wrong token',
					'trakt-api-version': Cypress.env('trakt_api_version'),
					'trakt-api-key': Cypress.env('client_id'),
				},
				body: {
					name: 'Name of list',
					description: 'Some description for list',
					privacy: 'private',
					display_numbers: true,
					allow_comments: true,
					sort_by: 'rank',
					sort_how: 'asc',
				},
				failOnStatusCode: false,
			}).then(response => {
				expect(response.status).to.be.eq(401)
			})
		})

		it('02_002_002: Should return 404 when trying to delete list which not exist', () => {
			cy.request({
				method: 'DELETE',
				url: `https://api.trakt.tv/users/${
					Cypress.env('user').username
				}/lists/some-list`,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${Cypress.env('access_token')}`,
					'trakt-api-version': Cypress.env('trakt_api_version'),
					'trakt-api-key': Cypress.env('client_id'),
				},
				failOnStatusCode: false,
			}).then(response => {
				expect(response.status).to.be.eq(404)
			})
		})

		it('02_002_003: Should return 422 when trying to create list with no body', () => {
			cy.request({
				method: 'POST',
				url: `https://api.trakt.tv/users/${Cypress.env('user').username}/lists`,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${Cypress.env('access_token')}`,
					'trakt-api-version': Cypress.env('trakt_api_version'),
					'trakt-api-key': Cypress.env('client_id'),
				},
				failOnStatusCode: false,
			}).then(response => {
				expect(response.status).to.be.eq(422)
			})
		})
	})
})
