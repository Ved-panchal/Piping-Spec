import { ToastContainer } from 'react-toastify'
import "react-toastify/dist/ReactToastify.css";
import './App.css'
import Router from './routes'
// import CoatingProcessTable from './test';

function App() {
  return (
    <>
      <ToastContainer/>
      <Router/>
      {/* <CoatingProcessTable/> */}
    </>
  )
}

export default App
