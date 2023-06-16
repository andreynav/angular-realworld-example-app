describe("Signup & Login", () => {
  let randomString = Math.random().toString(36).substring(2)
  const user = {
    username: `auto-${randomString}`,
    email: `${randomString}@gmail.com`,
    password: 'andy'
  }

  beforeEach(() => {
    cy.visit("http://localhost:4200/")
  })

  it("Test Valid Signup", () => {
    cy.intercept("POST", "**/*.realworld.io/api/users").as("newUser")

    cy.get('li a[routerlink="/register"]').click()
    cy.url().should("include", "/register")

    cy.get('input[ng-reflect-name="username"]').type(user.username)
    cy.get('input[ng-reflect-name="email"]').type(user.email)
    cy.get('input[ng-reflect-name="password"]').type(user.password)
    cy.get('button').contains('Sign up').click()

    cy.url().should("include", "http://localhost:4200")
    cy.get('li a').contains(user.username)
    cy.wait('@newUser').then(({response}) => {
      expect(response.statusCode).to.eq(200)
      expect(response.body.user).to.have.property('email', user.email)
      expect(response.body.user).to.have.property('username', user.username)
      cy.log(JSON.stringify(response.body))
      expect(response.body.user).to.have.property('image')
      expect(response.body.user).to.have.property('token')
    })
  })

  it("Test Sign In", () => {
    cy.intercept("POST", "**/*.realworld.io/api/users/login").as("loginUser")

    cy.get('li a[href="/login"]').click()
    cy.url().should("include", "/login")

    cy.get('input[ng-reflect-name="email"]').type(user.email)
    cy.get('input[ng-reflect-name="password"]').type(user.password)
    cy.get('button').contains('Sign in').click()

    cy.url().should("include", "http://localhost:4200")
    cy.get('li a').contains(user.username)
    cy.wait('@loginUser').then(({request, response}) => {
      cy.log(JSON.stringify(response.body))
      cy.log(JSON.stringify(request.body))
    })
  })

  it.skip("Test Sign In & mock popular test", () => {
    cy.intercept("GET", "**/tags", {fixture: "popular-tags.json"}).as("popularTags")

    cy.get('li a[href="/login"]').click()
    cy.url().should("include", "/login")

    cy.get('input[ng-reflect-name="email"]').type(user.email)
    cy.get('input[ng-reflect-name="password"]').type(user.password)
    cy.get('button').contains('Sign in').click()

    cy.url().should("include", "http://localhost:4200")
    cy.get('li a').contains(user.username)
    cy.wait('@popularTags').then(({ response}) => {
      cy.log(JSON.stringify(response.body))
      expect(response.statusCode).to.eq(200)
      expect(response.body.tags).to.deep.eq(['React', 'Cypress', 'Redux', 'Reqct-query'])
    })
    cy.get('.tag-list').should('contain', 'React', 'Cypress', 'Redux', 'Reqct-query')
  })

  it("Mock global feed data", () => {
    cy.intercept("GET", "**/articles*", {fixture: "global-feed.json"}).as("globalFeed")

    cy.get('li a').contains('Global Feed').click()

    cy.wait('@globalFeed').then(({response}) => {
      cy.log(JSON.stringify(response.body))
      expect(response.statusCode).to.eq(200)
      expect(response.body.articles).to.have.length(2)
      expect(response.body.articles[0].slug).to.eq('Test title 1')
      expect(response.body.articles[0].title).to.eq('Test title 1')
      expect(response.body.articles[1].slug).to.eq('Test title 2')
      expect(response.body.articles[1].title).to.eq('Test title 2')
    })
  })

})
