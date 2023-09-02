import { faker } from '@faker-js/faker';
import { createUser, logIn } from '../support/helper';
import api from '../support/page-objects/api';
import postData from '../fixtures/postData.json'

const email = faker.internet.email();
const pass = faker.internet.password();

describe('Check Posts API', () =>{

before('Register user', () => {
 createUser(email, pass);
})

it('Check status code and content-type', () => {
  cy.request("GET", "localhost:3000/posts").then((response) => {
    expect(response.status).to.eq(200);
    expect(response.headers['content-type']).to.include('application/json');
  })
})

it('Return only first 10 posts', () => {
  cy.request({
    method: 'GET',
    url: "/posts",
    qs: {
      _limit: 10,
    },
  }).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body).to.have.lengthOf(10);
    for (let i = 0; i < 10; i++) {
      expect(response.body[i].id).to.eq(i + 1);
    }
  })
})

it('Get posts with id = 55 and id = 60. Verify HTTP response status code. Verify id values of returned records.', () => {
  cy.request({
    method: 'GET',
    url: "/posts?id=55&id=60"
  }).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body[0].id).to.equal(55)
    expect(response.body[1].id).to.equal(60)
  });
})

it('Create post with non-existing entity ', () => {
  cy.request({
    method: 'POST',
    url: "/664/posts",
    failOnStatusCode: false,
  }).then((response) => {
    expect(response.status).to.eq(401);
  });
})

it('Create post with adding access token in header. Verify HTTP response status code. Verify post is created.', () => {

  cy.log('**Get id of the last existing post**')

  cy.request("GET", "localhost:3000/posts").then((response) => {
    expect(response.status).to.eq(200);
    expect(response.headers['content-type']).to.include('application/json');
    let arr = response.body;
    let lastEl = arr[arr.length - 1].id;
    let newPostId = lastEl + 1;

    cy.log('**Create data**')

    postData.title = faker.lorem.words(2);
    postData.text = faker.lorem.words(10);

    cy.log('**Log in**')

    logIn(email, pass).then((token) => {

      cy.log('**Create a post**')

      cy.request({
        method: 'POST',
        url: "/664/posts",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: {
          "userId": postData.userId,
          "title": postData.title,
          "text": postData.text,
        }
      }).then((response) => {

        cy.log('**Status code should be 201**')

        expect(response.status).to.eq(201);

        cy.log('**Post id should increase by 1**')

        expect(response.body.id).to.equal(newPostId)

        cy.log('**Correct info should be in the new post**')

        api.getPost(newPostId).then((response) => {
          expect(response.status).to.equal(200);
          expect(response.body.text).to.equal(postData.text);
          expect(response.body.title).to.equal(postData.title);
        });
      })
    })
  })
})

it('Create post entity and verify that the entity is created. Verify HTTP response status code. Use JSON in body.', () => {

  postData.title = faker.lorem.words(2);
  postData.text = faker.lorem.words(10);

  cy.log('**Get id of the last existing post**')

  cy.request("GET", "localhost:3000/posts").then((response) => {
    expect(response.status).to.eq(200);
    expect(response.headers['content-type']).to.include('application/json');
    let arr = response.body;
    let lastEl = arr[arr.length - 1].id;

    cy.log('**Log in**')

    logIn(email, pass).then((token) => {

      cy.log('**Create post**')

      api.createPost(token, postData).then((response) => {

        cy.log('**Check if post is created')

        expect(response.body.title).to.equal(postData.title);
        expect(response.body.id).to.equal(lastEl + 1);
      })
    })
  })
})

it('Create post entity and update the created entity. Verify HTTP response status code and verify that the entity is updated.', () => {

  logIn(email, pass).then((token) => {
    api.getNewUserID().then((newUserId) => {
      postData.userId = newUserId;
      api.createPost(token, postData).then((response) => {
        postData.id = response.body.id;
        postData.title = faker.lorem.words(1);
        postData.text = faker.lorem.words(11);

        cy.request({
          method: 'PUT',
          url: `/posts/${postData.id}`,
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          body: {
            "userId": postData.userId,
            "title": postData.title,
            "text": postData.text,
          }
        }).then((response) => {
          expect(response.status).to.equal(200);
          expect(response.body.title).to.equal(postData.title);
          expect(response.body.text).to.equal(postData.text);

        })
      })
    })
  })
})

it('Update non-existing entity. Verify HTTP response status code. ', () => {

  logIn(email, pass).then((token) => {
    postData.id = faker.number.int({ min: 2000, max: 9999 });

    cy.request({
      method: 'PUT',
      url: `/posts/${postData.id}`,
      failOnStatusCode: false,
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: {}
    }).then((response) => {
      expect(response.status).to.equal(404);
    })
  })
})

it('Delete non-existing post entity. Verify HTTP response status code.', () => {

  logIn(email, pass).then((token) => {
    api.getPosts().then((response) => {
      let arr = response.body;
      let nonexistingEl = arr[arr.length - 1].id + 3;

      cy.request({
        method: 'DELETE',
        url: `/posts/${nonexistingEl}`,
        failOnStatusCode: false,
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: {}
      }).then((response) => {
        expect(response.status).to.equal(404)
      })
    })
  })
})

it('Create post entity, update the created entity, and delete the entity. Verify HTTP response status code and verify that the entity is deleted.', () => {

  cy.log('**Login**')
  logIn(email, pass).then((token) => {

    cy.log('**get user id**')

    api.getNewUserID().then((newUserId) => {

      postData.userId = newUserId;
      postData.title = faker.lorem.words(2);
      postData.text = faker.lorem.words(10);

      cy.log('**Create post**')

      api.createPost(token, postData).then((response) => {
        postData.id = response.body.id;

        cy.log('**Check if post created**')

        api.getPost(postData.id).then((response) => {
          expect(response.status).to.equal(200);
          expect(response.body.text).to.equal(postData.text);
          expect(response.body.title).to.equal(postData.title);

        }).then(() => {

          cy.log('**Change post data**')

          postData.title = faker.lorem.words(1);
          postData.text = faker.lorem.words(11);

          cy.log('**Update post**')

          cy.request({
            method: 'PUT',
            url: `/posts/${postData.id}`,
            headers: {
              "Authorization": `Bearer ${token}`,
            },
            body: {
              "userId": postData.userId,
              "title": postData.title,
              "text": postData.text,
            }
          }).then((response) => {

            cy.log('**Check if the post is updated**')
            expect(response.status).to.equal(200);
            expect(response.body.title).to.equal(postData.title);
            expect(response.body.text).to.equal(postData.text);


            cy.log('**Delete post**')

            api.deletePost(postData.id, token).then((response) => {
              expect(response.status).to.equal(200)
            })

            cy.log('**Check if post does not exist**')

            cy.request({
              method: 'GET',
              url: `/posts/${postData.id}`,
              failOnStatusCode: false,
            }).then((response) => {
              expect(response.status).to.equal(404)
            })
          })
        })
      })
    })
  })
})
})
