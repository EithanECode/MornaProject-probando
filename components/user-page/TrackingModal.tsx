import React, { useState } from 'react';
import '@/app/user-page/styles/TrackingModal.css';
// Eliminamos la importación del Player de Lottie
// import { Player } from '@lottiefiles/react-lottie-player';

// Importa el archivo GIF directamente
import packageGif from '@/public/animations/package.gif'; // <--- Importa tu archivo GIF aquí

type TrackingModalProps = {
    onClose: () => void;
    ordersList: any[];
};

function TrackingModal({ onClose, ordersList }: TrackingModalProps) {
    const [orderNumber, setOrderNumber] = useState('');
    
    // Usar la lista de órdenes que viene desde App.js
    const orders = ordersList || [];

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('Searching for order:', orderNumber);
    };

    return (
        <div className="modal-overlay">
            <div className="tracking-modal-content">
                <div className="tracking-header">
                    {/* Reemplazamos el Player de Lottie por la etiqueta <img> para el GIF */}
                    <img
                        src={typeof packageGif === 'string' ? packageGif : packageGif.src} // Usamos el GIF importado
                        alt="Tracking Icon" // Texto alternativo para accesibilidad
                        style={{ height: '35px', width: '35px', marginRight: '10px' }} // Ajusta el tamaño y el margen
                        className="tracking-gif-icon" // Añadimos una clase para posibles estilos CSS
                    />
                    Tracking de Pedidos
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>

                <div className="search-section">
                    <form onSubmit={handleSearch} className="search-form">
                        <input
                            type="text"
                            placeholder="Ingresa tu número de orden..."
                            value={orderNumber}
                            onChange={(e) => setOrderNumber(e.target.value)}
                            className="search-input"
                        />
                        <button type="submit" className="search-button">
                            Buscar
                        </button>
                    </form>
                </div>

                <div className="order-list">
                    {orders.length === 0 ? (
                        <div className="no-orders">
                            <p>No hay órdenes registradas aún.</p>
                        </div>
                    ) : (
                        orders.map((order) => (
                            <div key={order.id} className="order-card" style={{} as React.CSSProperties}>
                                <div className="order-card-header">
                                    <span className="order-id">{order.id}</span>
                                    <span className="order-status" style={{ backgroundColor: order.statusColor }}>
                                        {order.status}
                                    </span>
                                </div>
                                <p className="order-details">
                                    {order.product} - ${order.price}
                                    {order.cartItems && (
                                        <span className="order-date">
                                            {' • '}
                                            {new Date(order.submittedAt).toLocaleDateString('es-ES', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    )}
                                </p>
                                <div className="progress-bar-container">
                                    <div
                                        className="progress-bar-fill"
                                        style={{ width: `${order.progress}%`, backgroundColor: order.statusColor }}
                                    ></div>
                                    <span className="progress-text">{order.progress}%</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default TrackingModal;