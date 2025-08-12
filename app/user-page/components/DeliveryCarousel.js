import React from 'react';
import '../styles/DeliveryCarousel.css';
import { Player } from '@lottiefiles/react-lottie-player';
import courierLottie from '../assets/lottie/wired-flat-18-delivery-truck.json';
import pickupLottie from '../assets/lottie/wired-flat-81-bank-office.json';

const DeliveryCarousel = ({ selectedValue, onSelect }) => {
    const options = [
        {
            value: 'courier',
            label: 'Envío por Courier',
            lottie: courierLottie,
            description: 'Recibe tu pedido directamente en tu domicilio u oficina.'
        },
        {
            value: 'pickup',
            label: 'Retiro en Oficinas',
            lottie: pickupLottie,
            description: 'Retira tu paquete en nuestras oficinas en Venezuela.'
        },
    ];

    return (
        <div className="delivery-carousel-container">
            <h3 className="carousel-title">Entrega en Venezuela</h3>
            <div className="delivery-carousel">
                {options.map(option => (
                    <div
                        key={option.value}
                        className={`delivery-card ${selectedValue === option.value ? 'selected' : ''}`}
                        onClick={() => onSelect(option.value)}
                    >
                        <Player
                            autoplay
                            loop
                            src={option.lottie}
                            className="delivery-lottie-icon-card"
                        />
                        <h4 className="delivery-card-title">{option.label}</h4>
                        <p className="delivery-card-description">{option.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DeliveryCarousel;