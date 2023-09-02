class Api {

  getPosts(){
    return cy.request({
      method: 'GET',
      url: '/posts'
    })
  }

  createPost(token, postData) {
    cy.log('**Create a post**')
   return cy.request({
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
    })
  }

  deletePost(id, token){
    return cy.request({
      method: 'DELETE',
      url: `/posts/${id}`,
      failOnStatus: false,
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: {}
    })
  }

  getUsers(){
    return cy.request({
      method: 'GET',
      url: "/users",
    })
  }
  getNewUserID(){
    return this.getUsers().then((response) => {
      let arr = response.body;
      let newUserID = arr[arr.length - 1].id;
      return newUserID;
    })
  }

  getPost(id){
    return cy.request({
      method: 'GET',
      url: `/posts/${id}`
    })
  }
}

export default new Api();

