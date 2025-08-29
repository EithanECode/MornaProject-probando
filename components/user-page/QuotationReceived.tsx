import React, { useState } from 'react';
import '@/app/user-page/styles/QuotationReceived.css';
import { Player } from '@lottiefiles/react-lottie-player';

// Importa tus archivos Lottie
import moneyBagLottie from '@/public/animations/wired-flat-298-coins-loop-spin.json';
import alarmClockLottie from '@/public/animations/wired-flat-236-alarm-clock-loop-cycle.json';
import editLottie from '@/public/animations/wired-flat-35-edit-hover-line.json';
import approveLottie from '@/public/animations/wired-flat-37-approve-checked-simple-hover-pinch.json';
import errorLottie from '@/public/animations/wired-flat-1140-error-hover-oscillate.json';

type QuotationReceivedProps = {
    quotation: {
        product: string;
        quantity: string;
        productPrice: string;
        internationalShipping: string;
        courierVenezuela: string;
        serviceCommission: string;
        total: string;
    };
    onSolicitarModificacion: () => void;
    onAceptarCotizacion: () => void;
    onRechazarPropuesta: () => void;
};

function QuotationReceived({ quotation, onSolicitarModificacion, onAceptarCotizacion, onRechazarPropuesta }: QuotationReceivedProps) {
    const [isEditHovered, setIsEditHovered] = useState(false);
    const [isApproveHovered, setIsApproveHovered] = useState(false);
    const [isErrorHovered, setIsErrorHovered] = useState(false);

    return (
        <div className="quotation-received-card">
            <div className="quotation-header-icon">
                <Player
                    autoplay={true} // Ahora la animación se reproduce automáticamente
                    loop={true} // Se repite de forma continua
                    src={moneyBagLottie}
                    className="lottie-icon"
                    style={{ height: '50px', width: '50px' }}
                />
            </div>
            <h2 className="quotation-title">Cotización Recibida</h2>
            <p className="quotation-subtitle">Revisa los detalles de tu cotización</p>

            <div className="response-time-notice">
                <Player
                    autoplay={true}
                    loop={true}
                    src={alarmClockLottie}
                    className="lottie-icon"
                    style={{ height: '24px', width: '24px', marginRight: '5px' }}
                />
                Plazo máximo para responder: 48 horas desde la recepción de esta cotización
            </div>

            <div className="quotation-details-grid">
                <div className="details-section">
                    <h3>Detalles de la Cotización</h3>
                    <div className="detail-row">
                        <span>Producto:</span>
                        <span>{quotation.product}</span>
                    </div>
                    <div className="detail-row">
                        <span>Cantidad:</span>
                        <span>{quotation.quantity}</span>
                    </div>
                    <div className="detail-row">
                        <span>Precio del producto:</span>
                        <span>{quotation.productPrice}</span>
                    </div>
                    <div className="detail-row">
                        <span>Envío Internacional:</span>
                        <span>{quotation.internationalShipping}</span>
                    </div>
                    <div className="detail-row">
                        <span>Courier en Venezuela:</span>
                        <span>{quotation.courierVenezuela}</span>
                    </div>
                    <div className="detail-row">
                        <span>Comisión de servicio:</span>
                        <span>{quotation.serviceCommission}</span>
                    </div>
                    <div className="total-row">
                        <span>Total:</span>
                        <span className="total-amount">{quotation.total}</span>
                    </div>
                </div>

                <div className="time-estimate-section">
                    <h3>Tiempo Estimado</h3>
                    <div className="estimate-box">
                        <span className="estimate-days">15-20 días</span>
                        <span className="estimate-label">Tiempo estimado de entrega</span>
                    </div>
                    <div className="quotation-actions">
                        <button
                            className="btn-modify"
                            onClick={onSolicitarModificacion}
                            onMouseEnter={() => setIsEditHovered(true)}
                            onMouseLeave={() => setIsEditHovered(false)}
                        >
                            <span className="btn-icon">
                                <Player
                                    key={isEditHovered ? 'edit-active' : 'edit-inactive'}
                                    autoplay={isEditHovered}
                                    loop={false}
                                    src={editLottie}
                                    className="lottie-icon"
                                    style={{ height: '20px', width: '20px', marginRight: '5px' }}
                                />
                            </span>
                            Solicitar Modificación
                        </button>
                        <button
                            className="btn-accept"
                            onClick={onAceptarCotizacion}
                            onMouseEnter={() => setIsApproveHovered(true)}
                            onMouseLeave={() => setIsApproveHovered(false)}
                        >
                            <span className="btn-icon">
                                <Player
                                    key={isApproveHovered ? 'approve-active' : 'approve-inactive'}
                                    autoplay={isApproveHovered}
                                    loop={true}
                                    src={approveLottie}
                                    className="lottie-icon"
                                    style={{ height: '20px', width: '20px', marginRight: '5px' }}
                                />
                            </span>
                            Aceptar Cotización
                        </button>
                        <button
                            className="btn-reject"
                            onClick={onRechazarPropuesta}
                            onMouseEnter={() => setIsErrorHovered(true)}
                            onMouseLeave={() => setIsErrorHovered(false)}
                        >
                            <span className="btn-icon">
                                <Player
                                    key={isErrorHovered ? 'error-active' : 'error-inactive'}
                                    autoplay={isErrorHovered}
                                    loop={true}
                                    src={errorLottie}
                                    className="lottie-icon"
                                    style={{ height: '20px', width: '20px', marginRight: '5px' }}
                                />
                            </span>
                            Rechazar Propuesta
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuotationReceived;