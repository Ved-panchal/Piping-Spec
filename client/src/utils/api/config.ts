export const API_URL = 'http://localhost:5500/';

export const api = {
    API_URL: {
      auth: {
        login: "auth/login",
      },
      user:{
        create: "users/registeruser",
        getUser: "users/User",
        update: "users/updateUser",
        delete: "users/deleteUser",
      },
      project:{
        create:"projects/create",
        getProject:"projects/{projectCode}",
        update:"projects/update",
        delete:"projects/delete",
      }
    },
};
  