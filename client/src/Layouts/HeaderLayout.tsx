import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar/Navbar';
import { Outlet } from 'react-router-dom';
import LoginModal from '../components/Login/LoginModal';

const HeaderLayout = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [username, setUsername] = useState<string | null>(null);

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            setUsername(JSON.parse(user).name);
        }
    }, []);

    const handleLoginSuccess = (user: { name: string }) => {
        setUsername(user.name);
        localStorage.setItem('user', JSON.stringify(user));
    };

    return (
        <>
            <Navbar openModal={openModal} setUsername={setUsername} username = {username}/>
            <Outlet context={{ handleLoginSuccess }} />
            <LoginModal
                isOpen={isOpen}
                closeModal={closeModal}
                onLoginSuccess={handleLoginSuccess}
            />
        </>
    );
};

export default HeaderLayout;
