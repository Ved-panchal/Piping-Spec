import { ToastContainer } from 'react-toastify'
import "react-toastify/dist/ReactToastify.css";
import './App.css'
import Router from './routes'

function App() {
  return (
    <>
      <ToastContainer/>
      <Router/>
    </>
  )
}

export default App
