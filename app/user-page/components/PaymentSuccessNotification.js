import React from 'react';
import '../styles/PaymentSuccessNotification.css';

function PaymentSuccessNotification() {
    return (
        <div className="payment-success-notification-container">
            <div className="payment-success-notification-box">
                <div className="success-icon">✔️</div>
                <div className="success-message">¡Pago Confirmado Exitosamente!</div>
                <div className="sub-message">Tu comprobante ha sido recibido y está en revisión.</div>
            </div>
        </div>
    );
}

export default PaymentSuccessNotification;