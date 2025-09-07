import { useRoutes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import HomePage from "../pages/Home"
import HeaderLayout from "../Layouts/HeaderLayout";
import PipingSpecCreation from "../pages/PipingSpecCreation";
import AdminLogin from "../pages/AdminLogin";
import EnhancedAdminDashboard from "../pages/EnhancedAdminDashboard";

const Router = () => {
    return useRoutes([
        {
            path:"/",
            element:<HeaderLayout/>,
            children:[{
                path:"/",
                element:<HomePage/>,
            }]
        },
        {
            path:"/services",
            children:[{
                path:"pipingspec-creation",
                element:<PipingSpecCreation/>,
            }]
        },
        {
            path: "/login/admin-panel",
            element: <AdminLogin />
        },
        {
            path: "/admin/dashboard",
            element: <EnhancedAdminDashboard />
        },
        {
            path: "*",
            element: <ToastContainer />,
        },
        
    ])
} 

export default Router;