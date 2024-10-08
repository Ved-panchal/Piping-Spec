import React from 'react'
import Navbar from '../components/Navbar/Navbar'
import { Outlet } from 'react-router-dom'

const HeaderLayout = () => {
  return (
    <>
     <Navbar/>
     <Outlet/> 
    </>
  )
}

export default HeaderLayout
