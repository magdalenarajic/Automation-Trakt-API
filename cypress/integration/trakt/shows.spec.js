describe('03: TV Shows Management', () => {
	beforeEach(function () {
		cy.wrap(Cypress.env('client_id')).as('client_id')
		cy.wrap(Cypress.env('client_secret')).as('client_secret')
	})

	before(function () {
		cy.getAccessToken()
	})

	describe('03_001: Searching for TV shows', () => {
		it('03_001_001: Should search and return the list of shows and episodes', () => {
			cy.request({
				method: 'GET',
				url: 'https://api.trakt.tv/search/show,episode?query=tron',
				headers: {
					'Content-Type': 'application/json',
					//Authorization: `Bearer ${Cypress.env('access_token')}`,
					'trakt-api-version': 2,
					'trakt-api-key': Cypress.env('client_id'),
				},
				failOnStatusCode: false,
			}).then($response => {
				expect($response.status).to.be.eq(200)
				$response.body.forEach(item => {
					expect(item).to.have.property('type')
					expect(item).to.have.property('score')
					expect(item).to.have.property('show')
					expect(item.show).to.have.property('title')
					expect(item.show).to.have.property('year')
					expect(item.show).to.have.property('ids')
					expect(item.show.ids).to.have.property('trakt')
					expect(item.show.ids).to.have.property('slug')
				})
			})
		})
	})

	describe('03_002: Get and checkin shows ', () => {
		it('03_002_001: Should get most recommended shows', () => {
			const period = 'yearly'
			cy.request({
				method: 'GET',
				url: `https://api.trakt.tv//shows/recommended/${period}`,
				headers: {
					'Content-Type': 'application/json',
					//Authorization: `Bearer ${Cypress.env('access_token')}`,
					'trakt-api-version': Cypress.env('trakt_api_version'),
					'trakt-api-key': Cypress.env('client_id'),
				},
				failOnStatusCode: false,
			}).then($response => {
				expect($response.status).to.be.eq(200)
			})
		})

		it('03_002_002: Should get one single show', () => {
			const name = 'game-of-thrones'
			cy.request({
				method: 'GET',
				url: `https://api.trakt.tv/shows/${name}?extended=full`,
				headers: {
					'Content-Type': 'application/json',
					//Authorization: `Bearer ${Cypress.env('access_token')}`,
					'trakt-api-version': Cypress.env('trakt_api_version'),
					'trakt-api-key': Cypress.env('client_id'),
				},
				failOnStatusCode: false,
			}).then($response => {
				expect($response.status).to.be.eq(200)
				expect($response.body).to.have.property('title')
				expect($response.body).to.have.property('year')
				expect($response.body).to.have.property('ids')
			})
		})

		it('03_002_003: Should checkin episode as watching ', () => {
			cy.deleteAnyActiveCheckins()

			const episode = {
				season: 1,
				number: 1,
			}
			const show = {
				title: 'Pride',
				year: 2008,
				ids: {
					trakt: 1,
					tvdb: 81189,
				},
			}
			cy.request({
				method: 'POST',
				url: 'https://api.trakt.tv/checkin',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${Cypress.env('access_token')}`,
					'trakt-api-version': Cypress.env('trakt_api_version'),
					'trakt-api-key': Cypress.env('client_id'),
				},
				body: {
					show: show,
					episode: episode,
					message: 'I am the one who knocks',
					app_version: '1.0',
					app_date: '2022-03-24',
				},
				failOnStatusCode: false,
			}).then($response => {
				expect($response.status).to.be.eq(201)

				// check checkin
				cy.request({
					method: 'GET',
					url: `https://api.trakt.tv/users/${
						Cypress.env('user').username
					}/watching`,
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${Cypress.env('access_token')}`,
						'trakt-api-version': Cypress.env('trakt_api_version'),
						'trakt-api-key': Cypress.env('client_id'),
					},
					failOnStatusCode: false,
				}).then($watched => {
					expect($watched.body)
						.to.have.property('action')
						.and.to.be.eq('checkin')
					expect($watched.body).to.have.property('started_at')
					expect($watched.body).to.have.property('show')
					expect($watched.body).to.have.property('episode')
					expect($watched.body.show.title).to.be.eq('Pride')
				})
			})
		})

		it('03_002_004: Should not allow checkin episode if already is being watched.', () => {
			const episode = {
				season: 1,
				number: 1,
			}
			const show = {
				title: 'Pride',
				year: 2008,
				ids: {
					trakt: 1,
					tvdb: 81189,
				},
			}
			cy.request({
				method: 'POST',
				url: 'https://api.trakt.tv/checkin',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${Cypress.env('access_token')}`,
					'trakt-api-version': Cypress.env('trakt_api_version'),
					'trakt-api-key': Cypress.env('client_id'),
				},
				body: {
					show: show,
					episode: episode,
					message: 'I am the one who knocks',
					app_version: '1.0',
					app_date: '2022-03-24',
				},
				failOnStatusCode: false,
			}).then($response => {
				expect($response.status).to.be.eq(409)
				expect($response.body).to.have.property('expires_at')
			})
		})
	})

	describe('03_003: Comments on TV shows and episodes', () => {
		it('03_003_001: Should add a valid comment to an show', () => {
			const show = {
				title: 'Breaking Bad',
				ids: {
					trakt: 1,
					slug: 'breaking-bad',
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
					show: show,
					comment: 'I like this serie so much.',
					spoiler: false,
				},
				failOnStatusCode: false,
			}).then($response => {
				expect($response.status).to.be.eq(201)
			})
		})

		it(`03_003_002: Should add a comment which doesn't pass validation(minimum 5 words)`, () => {
			const show = {
				title: 'Breaking Bad',
				ids: {
					trakt: 1,
					slug: 'breaking-bad',
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
					show: show,
					comment: 'Some short comment.',
					spoiler: false,
				},
				failOnStatusCode: false,
			}).then($response => {
				expect($response.status).to.be.eq(422)
				expect($response.body.errors.comment[0]).to.include(
					'must be at least 5 words'
				)
			})
		})

		it(`03_003_003: Should add a comment which doesn't pass validation (must bi written in English)`, () => {
			const season = {
				ids: {
					trakt: 16,
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
					season: season,
					comment: 'Neki komentar na hrvatskom jeziku.',
					spoiler: false,
				},
				failOnStatusCode: false,
			}).then($response => {
				expect($response.status).to.be.eq(422)
				expect($response.body.errors.comment[0]).to.include(
					'must be written in English'
				)
			})
		})
	})

	describe('03_004: TV shows and episodes - Invalid Scenarios', () => {
		it('03_004_001: Should return 401 when not authorized', () => {
			const show = {
				title: 'Breaking Bad',
				ids: {
					trakt: 1,
					slug: 'breaking-bad',
				},
			}
			cy.request({
				method: 'POST',
				url: 'https://api.trakt.tv/comments',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer and some wrong token',
					'trakt-api-version': Cypress.env('trakt_api_version'),
					'trakt-api-key': Cypress.env('client_id'),
				},
				body: {
					show: show,
					comment: 'I like this serie so much.',
					spoiler: false,
				},
				failOnStatusCode: false,
			}).then($response => {
				expect($response.status).to.be.eq(401)
			})
		})

		it('03_004_002: Should return 400 Bad Request when POST is used for GET', () => {
			const show = {
				title: 'Breaking Bad',
				ids: {
					trakt: 1,
					slug: 'breaking-bad',
				},
			}
			cy.request({
				method: 'POST',
				url: `https://api.trakt.tv/shows/trending`,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${Cypress.env('access_token')}`,
					'trakt-api-version': Cypress.env('trakt_api_version'),
					'trakt-api-key': Cypress.env('client_id'),
				},
				body: {
					show: show,
					app_version: '1.0',
					app_date: '2022-03-24',
				},
				failOnStatusCode: false,
			}).then($response => {
				expect($response.status).to.be.eq(400)
			})
		})

		it('03_004_003: Should return 404 Not Found - method exists, but no record found', function () {
			const show = 'game-of-thrones'
			cy.request({
				method: 'GET',
				url: `https://api.trakt.tv/movies/${show}`,
				headers: {
					'Content-Type': 'application/json',
					'trakt-api-version': 2,
					'trakt-api-key': Cypress.env('client_id'),
				},
				failOnStatusCode: false,
			}).then($response => {
				expect($response.status).to.be.eq(404)
			})
		})
	})
})
