describe("Signup & Login", () => {
  let randomString = Math.random().toString(36).substring(2)
  const user = {
    username: `auto-${randomString}`,
    email: `${randomString}@gmail.com`,
    password: 'andy'
  }

  it("Test Valid Signup", () => {
    cy.intercept("POST", "**/*.realworld.io/api/users").as("newUser")

    cy.visit("http://localhost:4200/")

    cy.get('li a[routerlink="/register"]').click()
    cy.url().should("include", "http://localhost:4200/register")

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
})
