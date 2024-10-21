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
        getAllProjectByUser:"projects/GetAll/ByUser",
        update:"projects/update",
        delete:"projects/delete",
      },
      ratings:{
        getAll:"ratings/getall",
        addorupdate:"ratings/add-or-update"
      }
    },
};
  