describe('04: Updates, reply and likes on comments.', () => {
	before(function () {
		cy.getAccessToken()
	})

	it('04_001: Should post a comment on movie ', () => {
		const movie = {
			title: 'TRON: Legacy',
			year: 2010,
			ids: {
				trakt: 1,
				slug: 'tron-legacy-2010',
				imdb: 'tt1104001',
				tmdb: 20526,
			},
		}
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
				comment: 'I am not the danger!',
				spoiler: false,
			},
			failOnStatusCode: false,
		}).then(response => {
			expect(response.status).to.be.eq(201)
			expect(response.body).to.have.property('id')
		})
	})

	it('04_002: Should update a comment', () => {
		const movie = {
			title: 'The Dark Knight',
			year: 2008,
			ids: {
				trakt: 4,
				slug: 'the-dark-knight-2008',
				imdb: 'tt0468569',
				tmdb: 155,
			},
		}
		cy.addComment(movie).then(id => {
			cy.request({
				method: 'PUT',
				url: `https://api.trakt.tv/comments/${id}`,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${Cypress.env('access_token')}`,
					'trakt-api-version': Cypress.env('trakt_api_version'),
					'trakt-api-key': Cypress.env('client_id'),
				},
				body: {
					comment: 'This movie is really excited!',
					spoiler: false,
				},
				failOnStatusCode: false,
			}).then(response => {
				expect(response.status).to.be.eq(200)
			})
		})
	})

	it('04_003: Post a reply for comment and get replies for a comment', () => {
		const movie = {
			title: 'Guardians of the Galaxy',
			year: 2014,
			ids: {
				trakt: 28,
				slug: 'guardians-of-the-galaxy-2014',
				imdb: 'tt2015381',
				tmdb: 118340,
			},
		}
		cy.addComment(movie).then(id => {
			cy.request({
				method: 'POST',
				url: `https://api.trakt.tv/comments/${id}/replies`,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${Cypress.env('access_token')}`,
					'trakt-api-version': Cypress.env('trakt_api_version'),
					'trakt-api-key': Cypress.env('client_id'),
				},
				body: {
					comment: `Couldn't agree with your review.`,
					spoiler: false,
				},
				failOnStatusCode: false,
			}).then(response => {
				expect(response.status).to.be.eq(201)
			})

			cy.request({
				method: 'POST',
				url: `https://api.trakt.tv/comments/${id}/replies`,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${Cypress.env('access_token')}`,
					'trakt-api-version': Cypress.env('trakt_api_version'),
					'trakt-api-key': Cypress.env('client_id'),
				},
				body: {
					comment: 'I agree with your review.',
					spoiler: false,
				},
				failOnStatusCode: false,
			}).then(response => {
				expect(response.status).to.be.eq(201)
			})

			cy.request({
				method: 'GET',
				url: `https://api.trakt.tv/comments/${id}/replies`,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${Cypress.env('access_token')}`,
					'trakt-api-version': Cypress.env('trakt_api_version'),
					'trakt-api-key': Cypress.env('client_id'),
				},
				failOnStatusCode: false,
			}).then(response => {
				expect(response.status).to.be.eq(200)
				expect(response.body).to.have.length(2)
			})
		})
	})

	it('04_004: Should delete a comment or reply ', () => {
		const movie = {
			title: 'The Shawshank Redemption',
			year: 1994,
			ids: {
				trakt: 231,
				slug: 'the-shawshank-redemption-1994',
				imdb: 'tt0111161',
				tmdb: 278,
			},
		}
		cy.addComment(movie).then(id => {
			cy.request({
				method: 'DELETE',
				url: `https://api.trakt.tv/comments/${id}`,
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

	it('04_005: Should like a comment and after that remove like', () => {
		const movie = {
			title: 'The Matrix',
			year: 1999,
			ids: {
				trakt: 269,
				slug: 'the-matrix-1999',
				imdb: 'tt0133093',
				tmdb: 603,
			},
		}
		cy.addComment(movie).then(id => {
			cy.request({
				method: 'POST',
				url: `https://api.trakt.tv/comments/${id}/like`,
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
			cy.request({
				method: 'DELETE',
				url: `https://api.trakt.tv/comments/${id}/like`,
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
