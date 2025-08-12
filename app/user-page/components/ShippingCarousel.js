import React, { useState, useRef } from 'react';
import '../../src/styles/ShippingCarousel.css';
import { Player } from '@lottiefiles/react-lottie-player';
import airPlaneLottie from '../assets/lottie/FTQoLAnxbj.json';
import cargoShipLottie from '../assets/lottie/wired-flat-1337-cargo-ship-hover-pinch.json';
import woodenBoxLottie from '../assets/lottie/wired-flat-1356-wooden-box-hover-pinch.json';

const ShippingCarousel = ({ selectedValue, onSelect }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [hoveredOption, setHoveredOption] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [direction, setDirection] = useState('next');

    const options = [
        {
            value: 'doorToWarehouse',
            label: 'Puerta a Puerta (a nuestro almacén)',
            lottie: woodenBoxLottie,
            description: 'Recogemos en tu dirección y lo llevamos a nuestro almacén.'
        },
        {
            value: 'air',
            label: 'Envío Aéreo',
            lottie: airPlaneLottie,
            description: 'Envío rápido por vía aérea, ideal para paquetes pequeños.'
        },
        {
            value: 'maritime',
            label: 'Envío Marítimo',
            lottie: cargoShipLottie,
            description: 'Envío económico por vía marítima, ideal para grandes volúmenes.'
        },
    ];

    const goToNext = () => {
        if (isTransitioning) return;
        setDirection('next');
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentIndex((prevIndex) => 
                prevIndex === options.length - 1 ? 0 : prevIndex + 1
            );
            setTimeout(() => setIsTransitioning(false), 100);
        }, 300);
    };

    const goToPrevious = () => {
        if (isTransitioning) return;
        setDirection('prev');
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentIndex((prevIndex) => 
                prevIndex === 0 ? options.length - 1 : prevIndex - 1
            );
            setTimeout(() => setIsTransitioning(false), 100);
        }, 300);
    };

    const goToIndex = (index) => {
        if (isTransitioning || index === currentIndex) return;
        setDirection(index > currentIndex ? 'next' : 'prev');
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentIndex(index);
            setTimeout(() => setIsTransitioning(false), 100);
        }, 300);
    };

    const currentOption = options[currentIndex];

    return (
        <div className="shipping-carousel-container">
            <h3 className="carousel-title">Tipo de Envío</h3>
            
            <div className="carousel-content-wrapper">
                <button
                    type="button"
                    className="carousel-nav-button left"
                    onClick={goToPrevious}
                    aria-label="Opción anterior"
                >
                    &#8249;
                </button>
                
                <div className="carousel-content">
                    <div className="card-container">
                        <div
                            className={`shipping-card ${selectedValue === currentOption.value ? 'selected' : ''} ${isTransitioning ? `transitioning-${direction}` : ''}`}
                            onClick={() => onSelect(currentOption.value)}
                            onMouseEnter={() => setHoveredOption(currentOption.value)}
                            onMouseLeave={() => setHoveredOption(null)}
                        >
                            <div className="card-inner">
                                <div className="card-content">
                                    <div className="lottie-container">
                                        <Player
                                            key={`${currentOption.value}-${hoveredOption === currentOption.value || selectedValue === currentOption.value ? 'active' : 'inactive'}`}
                                            autoplay={hoveredOption === currentOption.value || selectedValue === currentOption.value}
                                            loop={true}
                                            src={currentOption.lottie}
                                            className="shipping-lottie-icon"
                                        />
                                    </div>
                                    <h4 className="shipping-card-title">{currentOption.label}</h4>
                                    <p className="shipping-card-description">{currentOption.description}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <button
                    type="button"
                    className="carousel-nav-button right"
                    onClick={goToNext}
                    aria-label="Siguiente opción"
                >
                    &#8250;
                </button>
            </div>

            {/* Contador y indicadores */}
            <div className="carousel-footer">
                <span className="carousel-counter">
                    {currentIndex + 1} / {options.length}
                </span>
                <div className="carousel-indicators">
                    {options.map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            className={`indicator ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => goToIndex(index)}
                            aria-label={`Ir a opción ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ShippingCarousel;