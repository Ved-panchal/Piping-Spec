import { useRoutes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import HomePage from "../pages/Home"
import HeaderLayout from "../Layouts/HeaderLayout";

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
            path: "*",
            element: <ToastContainer />,
        },
    ])
} 

export default Router;