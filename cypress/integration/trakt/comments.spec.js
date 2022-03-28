describe('04: Updates, reply and likes on comments.', () => { 
    before(function(){
        cy.getAccessToken();
      });
    it('04_001: Should post a comment on movie ',()=> {
        const movie = {
            "title": "Guardians of the Galaxy",
            "year": 2014,
            "ids": {
              "trakt": 28,
              "slug": "guardians-of-the-galaxy-2014",
              "imdb": "tt2015381",
              "tmdb": 118340
            }
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
                   spoiler: false
            },
            failOnStatusCode: false,
          }).then($response =>{
            expect($response.status).to.be.eq(201)
            expect($response.body).to.have.property('id')
            cy.deleteComment($response.body.id)
          });
    });
    it('04_002: Should update a comment',()=> {
        cy.request({
            method: 'PUT',
            url: 'https://api.trakt.tv/comments/455781',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${Cypress.env('access_token')}`,
                'trakt-api-version': Cypress.env('trakt_api_version'),
              'trakt-api-key': Cypress.env('client_id'),
            },
            body: {
                   comment: `That movie is really excited!`,
                   spoiler: false
            },
            failOnStatusCode: false,
          }).then($response =>{
            expect($response.status).to.be.eq(200)
          });
    });

    it('04_003: Post a reply for comment',()=> {
        cy.request({
            method: 'POST',
            url: 'https://api.trakt.tv/comments/455782/replies',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${Cypress.env('access_token')}`,
                'trakt-api-version': Cypress.env('trakt_api_version'),
              'trakt-api-key': Cypress.env('client_id'),
            },
            body: {
                   comment: `Couldn't agree with your review.`,
                   spoiler: false
            },
            failOnStatusCode: false,
          }).then($response =>{
            expect($response.status).to.be.eq(201)
          });
    });

    it('04_004: Should delete a comment or reply ',()=> {
        const movie = {
            "title": "Guardians of the Galaxy",
            "year": 2014,
            "ids": {
              "trakt": 28,
              "slug": "guardians-of-the-galaxy-2014",
              "imdb": "tt2015381",
              "tmdb": 118340
            }
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
                   spoiler: false
            },
            failOnStatusCode: false,
          }).then($response =>{
            expect($response.status).to.be.eq(201)
            expect($response.body).to.have.property('id')
            const id = $response.body.id
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
          }).then($response =>{
            expect($response.status).to.be.eq(204)
          });
        });
    });
    it('04_005: Should get replies for a comment  ',()=> {
        cy.request({
            method: 'GET',
            url: 'https://api.trakt.tv/comments/455782/replies',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${Cypress.env('access_token')}`,
                'trakt-api-version': Cypress.env('trakt_api_version'),
              'trakt-api-key': Cypress.env('client_id'),
            },
            failOnStatusCode: false,
          }).then($response =>{
            expect($response.status).to.be.eq(200);
            console.log($response.body)
          });
    });
    it('04_006: Should like a comment',()=> {
        cy.request({
            method: 'POST',
            url: 'https://api.trakt.tv/comments/455782/like',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${Cypress.env('access_token')}`,
                'trakt-api-version': Cypress.env('trakt_api_version'),
              'trakt-api-key': Cypress.env('client_id'),
            },
            failOnStatusCode: false,
          }).then($response =>{
            expect($response.status).to.be.eq(204)
          });
    });

    it('04_007: Should remove like on a comment',()=> {
        cy.request({
            method: 'DELETE',
            url: 'https://api.trakt.tv/comments/455782/like',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${Cypress.env('access_token')}`,
                'trakt-api-version': Cypress.env('trakt_api_version'),
              'trakt-api-key': Cypress.env('client_id'),
            },
            failOnStatusCode: false,
          }).then($response =>{
            expect($response.status).to.be.eq(204)
          });
    });

})