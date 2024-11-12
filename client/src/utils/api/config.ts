// export const API_URL = 'http://localhost:5500/';
export const API_URL = 'https://piping-spec.onrender.com/'

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
      specs:{
        create:"specs/create",
        getSpec:"specs/{specId}",
        getAllSpecsByProject:"specs/project",
        update:"specs/update",
        delete:"specs/delete",
      },
      ratings:{
        getAll:"ratings/getall",
        addorupdate:"ratings/add-or-update"
      },
      schedules:{
        getall:'schedules/getall',
        addorupdate:'schedules/add-or-update'
      },
      sizes:{
        getall:'sizes/getall',
        addorupdate:'sizes/add-or-update'
      },
      components:{
        list:'components/getall',
        data:'componentdescs/getall',
        addorupdate:'componentdescs/add-or-update'
      },
      sizeranges:{
        getall:'sizeranges/getbyspecid',
        create:'sizeranges/create',
        update:'sizeranges/update',
        delete:'sizeranges/delete'
      },
      materials:{
        getall:'materials/getall',
        addorupdate:'materials/add-or-update',
      },
      dimensionalstandards:{
        create:"dimensional-standards/create",
        update:"dimensional-standards/update",
        getall:"dimensional-standards/getall",
        bycomponent:"dimensional-standards/by-component",
        delete:"/dimensional-standards/delete"
      },
      pms:{
        addItem:"pms/add-item",
        updateItem:"pms/update-item",
      },
      branch:{
        addOrUpdate:"branch_table/add-or-update",
        getall:"branch_table/getall",
      }
    },
};
  
