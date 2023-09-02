export function createUser(email, pass) {
    cy.request({
        method: 'POST',
        url: "/register",
        body: {
            "email": email,
            "password": pass,
        },
    }).then((response) => {
        expect(response.status).to.eq(201);
    })
}

export function logIn(email, pass) {
      return cy.request({
        method: 'POST',
        url: "/login",
        body: {
            "email": email,
            "password": pass,
        },
    }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.accessToken).to.exist;
        const token = response.body.accessToken;
        return token;
    })
}
