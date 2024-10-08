import  { useState } from 'react'
import Navbar from '../components/Navbar/Navbar'
import { Outlet } from 'react-router-dom'
import LoginModal from '../components/Login/LoginModal';

const HeaderLayout = () => {
    const [isOpen, setIsOpen] = useState(false);
    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);
  
  return (
    <>
     <Navbar openModal={openModal} />
     <Outlet/> 
     <LoginModal
        isOpen={isOpen}
        closeModal={closeModal}
      />
    </>
  )
}

export default HeaderLayout
