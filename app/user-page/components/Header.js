import React, { useState } from 'react';
import '../styles/Header.css';
import { Player } from '@lottiefiles/react-lottie-player';
import truckAnimation from '../assets/lottie/wired-lineal-497-truck-delivery-loop-cycle.json';
//import {logo} from '../assets/lottie/logo.png'; // Asegúrate de que la ruta sea correcta
import {Home, Menu} from 'lucide-react';

function Header({ onOpenChat, onOpenTracking }) {
    const [isTruckHovered, setIsTruckHovered] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Nuevo estado

    const handleLogoClick = () => {
        setIsSidebarOpen(!isSidebarOpen); // Cambia el estado al hacer clic
    };

    const handleCloseSidebar = () => {
        setIsSidebarOpen(false); // Cierra la barra lateral
    };

    return (
        <header className="header">
            {/* Botón hamburguesa a la izquierda */}
            <button className="hamburger-button" onClick={handleLogoClick}>
                <Menu size={24} />
            </button>
            
            <div className="logo-container">
                <span className="logo-text">PitaExpress</span>
            </div>

            {/* Barra lateral */}
            <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <button className="close-sidebar-button" onClick={handleCloseSidebar}>
                    &times; {/* Icono de cerrar */}
                </button>
                {/* Contenido de la barra lateral (ejemplo) */}
                <h3>Menú</h3>
                <ul>
                    <li><a href="#">Opción 1</a></li>
                    <li><a href="#">Opción 2</a></li>
                    <li><a href="#">Opción 3</a></li>
                </ul>
            </div>

            <nav className="nav-buttons">
                <button className="nav-button chat-button" onClick={onOpenChat}>
                    <span className="dot"></span> Chat Soporte
                </button>
                <button
                    className="nav-button tracking-button"
                    onClick={onOpenTracking}
                    onMouseEnter={() => setIsTruckHovered(true)}
                    onMouseLeave={() => setIsTruckHovered(false)}
                >
                    <Player
                        key={isTruckHovered ? 'truck-anim-active' : 'truck-anim-inactive'}
                        autoplay={isTruckHovered}
                        loop={true}
                        src={truckAnimation}
                        style={{ height: '30px', width: '30px', marginRight: '10px' }}
                    />
                    Tracking
                </button>
            </nav>
        </header>
    );
}

export default Header;