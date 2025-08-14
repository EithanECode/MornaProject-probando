import React from 'react';
import '../styles/OrderTracking.css';
import { Player } from '@lottiefiles/react-lottie-player';

// Importa tus archivos Lottie.
import checkmarkLottie from '../assets/lottie/wired-flat-37-approve-checked-simple-hover-wobble.json';
import purchaseLottie from '../assets/lottie/IWTFP3ADxQ.json';
import airplaneLottie from '../assets/lottie/Airplane.json';
import editDocumentIcon from '../assets/lottie/wired-flat-245-edit-document-hover-pinch.json';

type OrderTrackingProps = {
    orderId: string;
    orderData: any;
    onOpenSurvey: () => void;
};

function OrderTracking({ orderId, orderData, onOpenSurvey }: OrderTrackingProps) {
    // Generar fecha actual para la solicitud enviada
    const currentDate = new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    // Dummy data for tracking steps, replace with actual data from backend
    const trackingSteps = [
        {
            id: 'request_submitted',
            label: 'Solicitud Enviada',
            date: currentDate,
            icon: editDocumentIcon,
            color: 'green'
        },
        {
            id: 'payment_confirmed',
            label: 'Pago Confirmado',
            date: 'Pendiente',
            icon: checkmarkLottie,
            color: 'gray'
        },
        {
            id: 'product_purchased',
            label: 'Producto Comprado',
            date: 'Pendiente',
            icon: purchaseLottie,
            color: 'gray'
        },
        {
            id: 'in_transit',
            label: 'En Tránsito',
            date: 'Pendiente',
            icon: airplaneLottie,
            color: 'gray'
        },
        // Add more steps here
    ];

    const currentProgress = 25;
    const currentStatusText = "Tu solicitud ha sido enviada exitosamente. Pronto recibirás una cotización.";

    return (
        <div className="order-tracking-card">
            <div className="tracking-header-icon">
                <Player
                    autoplay={true}
                    loop={true}
                    src={purchaseLottie}
                    className="lottie-icon main-tracking-lottie"
                    style={{ height: '70px', width: '70px' }}
                />
            </div>
            <h2 className="tracking-title">Seguimiento del Pedido</h2>
            <p className="tracking-subtitle">Monitorea el progreso de tu pedido en tiempo real</p>

            <div className="tracking-steps-grid">
                {trackingSteps.map(step => (
                    <div key={step.id} className={`tracking-step-box ${step.color}`}>
                        <div className="step-icon-circle">
                            <Player
                                autoplay={true}
                                loop={true}
                                src={step.icon}
                                className="lottie-icon"
                                style={
                                    (step.id === 'product_purchased' || step.id === 'in_transit')
                                        ? { height: '60px', width: '60px' }
                                        : { height: '40px', width: '40px' }
                                }
                            />
                        </div>
                        <p className="step-label">{step.label}</p>
                        <p className="step-date">{step.date}</p>
                    </div>
                ))}
            </div>

            <div className="current-status-section">
                <h3>Estado Actual</h3>
                <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${currentProgress}%` }}></div>
                    <span className="progress-percentage">{currentProgress}% Completado</span>
                </div>
                <p className="status-text">{currentStatusText}</p>
                
                {orderData && (
                    <div className="order-summary">
                        <h4>Resumen de tu Solicitud</h4>
                        <div className="order-details">
                            <p><strong>Productos solicitados:</strong> {orderData.cartItems?.length || 0} producto(s)</p>
                            <p><strong>Tipo de envío:</strong> {
                                orderData.deliveryType === 'doorToWarehouse' ? 'Puerta a Puerta' :
                                orderData.deliveryType === 'air' ? 'Envío Aéreo' :
                                orderData.deliveryType === 'maritime' ? 'Envío Marítimo' : 
                                orderData.deliveryType
                            }</p>
                            <p><strong>Entrega en Venezuela:</strong> {orderData.deliveryVenezuela}</p>
                            <p><strong>Fecha de solicitud:</strong> {currentDate}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="tracking-actions">
                <button className="action-button survey" onClick={onOpenSurvey}>
                    {/* Se reemplaza el icono de emoji por el componente Player */}
                    <Player
                        autoplay
                        loop
                        src={editDocumentIcon}
                        style={{ height: '30px', width: '30px' }}
                    >
                    </Player> 
                    Encuesta
                </button>
            </div>
        </div>
    );
}

export default OrderTracking;