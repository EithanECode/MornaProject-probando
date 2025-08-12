import React, { useState } from 'react';
import '../styles/OrderConfirmed.css';
import { Player } from '@lottiefiles/react-lottie-player';

// Importa tus archivos Lottie
import confettiLottie from '../assets/lottie/wired-flat-1103-confetti-hover-pinch.json';
import shareArrowLottie from '../assets/lottie/wired-flat-751-share-hover-slide.json';

type OrderConfirmedProps = {
    orderId: string;
    productName: string;
    totalPrice: string;
    onProceedToPayment: () => void;
};

function OrderConfirmed({ orderId, productName, totalPrice, onProceedToPayment }: OrderConfirmedProps) {
    // Estado para controlar el hover de la flecha
    const [isArrowHovered, setIsArrowHovered] = useState(false);

    return (
        <div className="order-confirmed-card">
            <div className="celebration-icon-container">
                <Player
                    autoplay={true} // Ahora la animación se reproduce automáticamente
                    loop={true} // Se repite de forma continua
                    src={confettiLottie}
                    className="lottie-icon"
                    style={{ height: '80px', width: '80px' }}
                />
            </div>
            <h2 className="confirmation-title">¡Orden Aceptada!</h2>
            <p className="confirmation-subtitle">Tu pedido ha sido confirmado y procesado</p>

            <div className="order-id-box">
                <span className="order-id-label">Número de Orden de Compra</span>
                <span className="confirmed-order-id">{orderId}</span>
            </div>

            <div className="confirmation-details-grid">
                <div className="summary-section">
                    <h3>Resumen del Pedido</h3>
                    <div className="detail-row">
                        <span>Producto:</span>
                        <span>{productName}</span>
                    </div>
                    <div className="detail-row">
                        <span>Total a pagar:</span>
                        <span className="total-amount-summary">{totalPrice}</span>
                    </div>
                    <div className="detail-row">
                        <span>Estado:</span>
                        <span className="order-status-confirmed">Confirmado</span>
                    </div>
                </div>

                <div className="next-steps-section">
                    <h3>Próximos Pasos</h3>
                    <ul className="next-steps-list">
                        <li><span className="step-bullet active"></span> Proceder al pago</li>
                        <li><span className="step-bullet"></span> Compra del producto</li>
                        <li><span className="step-bullet"></span> Envío internacional</li>
                        <li><span className="step-bullet"></span> Entrega en Venezuela</li>
                    </ul>
                </div>
            </div>

            <button
                className="proceed-to-payment-button"
                onClick={onProceedToPayment}
                onMouseEnter={() => setIsArrowHovered(true)}
                onMouseLeave={() => setIsArrowHovered(false)}
            >
                Proceder al Pago
                <span className="arrow-icon">
                    <Player
                        key={isArrowHovered ? 'arrow-active' : 'arrow-inactive'}
                        autoplay={isArrowHovered}
                        loop={false}
                        src={shareArrowLottie}
                        className="lottie-icon"
                        style={{ height: '24px', width: '24px', marginLeft: '10px' }}
                    />
                </span>
            </button>
        </div>
    );
}

export default OrderConfirmed;