export const API_URL = 'http://localhost:5500/';
// export const API_URL = 'https://staging.enginatrix.com/api/'

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
      otp:{
        sendOtp: "otp/send-otp",
        verifyOtp: "otp/verify-otp",
        resetPassword: "otp/reset-password",
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
      catrefs:{
        getall:'catref/getall',
        addorupdate:"catref/add-or-update"
      },
      dimensionalstandards:{
        create:"dimensional-standards/create",
        update:"dimensional-standards/update",
        getall:"dimensional-standards/getall",
        bycomponent:"dimensional-standards/by-component",
        delete:"dimensional-standards/delete",
        getbygtype:"dimensional-standards/getbygtype",
        addorupdate:"dimensional-standards/add-or-update"
      },
      valvsubtype:{
        getAll:"valvsubtype/getall",
        addorupdate:"valvsubtype/add-or-update",
      },
      constructiondesc:{
        getAll:"constructiondesc/getall",
        addorupdate:"constructiondesc/add-or-update",
      },
      pms:{
        // addItem:"items/create",
        // getallItem:"items/getbySpecId",
        // updateItem:"items/update",
        create:"pmsc/create",
        getallPms:"pmsc/getbySpecId",
        update:"pmsc/update",
        delete:"pmsc/delete",
        updateOrder:"pmsc/updateOrder"
      },
      output:{
        getAll:"output/generateReviewOutput",
        add:"items/create"
      },
      branch:{
        addOrUpdate:"branch_table/add-or-update",
        getall:"branch_table/getall",
      },
      unitWeight:{
        load:"unit-weight/load",
        update:"unit-weight/update-unit-weight",
        get:"unit-weight/filter"
      },
      subscriptions: {
        getUserSubscriptions: "subscriptions/user",
        getPlans: "subscriptions/plans",
        create: "subscriptions/create",
        update: "subscriptions/update",
        cancel: "subscriptions/cancel"
      },
      admin: {
        auth: {
          login: "admin/auth/login"
        },
        users: {
          getAll: "admin/users",
          getById: "admin/users", // append /{userId}
          create: "admin/users",
          update: "admin/users", // append /{userId}
          delete: "admin/users", // append /{userId}
          analytics: "admin/users/analytics"
        },
        subscriptions: {
          getAll: "admin/subscriptions",
          getById: "admin/subscriptions", // append /{subscriptionId}
          create: "admin/subscriptions",
          update: "admin/subscriptions", // append /{subscriptionId}
          delete: "admin/subscriptions", // append /{subscriptionId}
          plans: "admin/subscriptions/plans"
        }
      }
    },
};
  
