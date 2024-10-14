import { useRoutes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import HomePage from "../pages/Home"
import HeaderLayout from "../Layouts/HeaderLayout";
import PipingSpecCreation from "../pages/PipingSpecCreation";

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
            path: "*",
            element: <ToastContainer />,
        },
        
    ])
} 

export default Router;