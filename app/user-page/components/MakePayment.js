import React, { useState } from 'react';
import '../styles/MakePayment.css';
import { Player } from '@lottiefiles/react-lottie-player';

import alarmClockLottie from '../assets/lottie/wired-flat-236-alarm-clock-loop-cycle.json';
import generalCoinLottie from '../assets/lottie/wired-flat-290-coin-hover-pinch.json'; // Usado para iconos de dinero/moneda
import bankBuildingLottie from '../assets/lottie/wired-flat-403-museum-authority-hover-pinch.json'; // Para transferencia bancaria
import binanceLogoLottie from '../assets/lottie/wired-flat-2585-logo-binance-hover-pinch.json'; // Para Binance USDT
import shareArrowLottie from '../assets/lottie/wired-flat-259-share-arrow-hover-pointing.json'; // Para Zelle (implica compartir/transferir)
import folderAddingFilesLottie from '../assets/lottie/wired-flat-120-folder-hover-adding-files.json'; // Para subir comprobante
import approveCheckLottie from '../assets/lottie/wired-flat-37-approve-checked-simple-hover-pinch.json'; // Para el botón de confirmar pago

function MakePayment({ orderId, totalAmount, onPaymentConfirmed }) {
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const [referenceNumber, setReferenceNumber] = useState('');
    const [paymentProof, setPaymentProof] = useState(null);

    // Estados para controlar el hover de las animaciones Lottie restantes
    const [isBolivaresCategoryHovered, setIsBolivaresCategoryHovered] = useState(false);
    const [isDolaresCategoryHovered, setIsDolaresCategoryHovered] = useState(false);
    const [isUploadIconHovered, setIsUploadIconHovered] = useState(false);
    const [isConfirmCheckHovered, setIsConfirmCheckHovered] = useState(false);

    // Estados para controlar el hover de los emojis con animación CSS
    const [isPagoMovilEmojiHovered, setIsPagoMovilEmojiHovered] = useState(false);
    const [isPayPalEmojiHovered, setIsPayPalEmojiHovered] = useState(false);

    const paymentMethods = {
        bolivares: {
            title: 'Pago en Bolívares (Bs)',
            options: {
                pagoMovil: {
                    label: 'Pago Móvil (Validación automática)',
                    instructions: 'Realiza el pago móvil a: 0414-1234567 (Banco Venezuela) - El sistema validará automáticamente tu pago.'
                },
                transferenciaBancaria: {
                    label: 'Transferencia Bancaria (Validación automática)',
                    instructions: 'Realiza una transferencia a: Banco Mercantil C.A., Cta. Corriente 0105-0000-00-1234567890, RIF J-00000000-0, Titular: ImportaFácil C.A. - El sistema validará automáticamente tu pago.'
                }
            }
        },
        dolares: {
            title: 'Pago en Dólares ($)',
            options: {
                binanceUSDT: {
                    label: 'Binance USDT (Validación manual)',
                    instructions: 'Transfiere a nuestra billetera Binance USDT (TRC20): TXYABCDEF12345. Asegúrate de enviar el monto exacto. La validación es manual y puede tardar unas horas.'
                },
                zelle: {
                    label: 'Zelle (Validación manual)',
                    instructions: 'Envía a nuestro correo Zelle: correo@ejemplo.com. Asegúrate de incluir el número de orden en la descripción. La validación es manual y puede tardar unas horas.'
                },
                payPal: {
                    label: 'PayPal (Validación manual)',
                    instructions: 'Envía a nuestra cuenta PayPal: paypal@ejemplo.com. Por favor, cubre las comisiones de PayPal. La validación es manual y puede tardar unas horas.'
                }
            }
        }
    };

    const getInstructions = () => {
        if (!selectedPaymentMethod) {
            return "Selecciona un método de pago para ver las instrucciones";
        }
        for (const typeKey in paymentMethods) {
            if (paymentMethods[typeKey].options[selectedPaymentMethod]) {
                return paymentMethods[typeKey].options[selectedPaymentMethod].instructions;
            }
        }
        return "Instrucciones no disponibles para el método seleccionado.";
    };

    const handlePaymentProofChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setPaymentProof(e.target.files[0]);
        }
    };

    const handleSubmitPayment = (e) => {
        e.preventDefault();
        if (!selectedPaymentMethod) {
            alert('Por favor, selecciona un método de pago.');
            return;
        }
        if (!referenceNumber || !paymentProof) {
            alert('Por favor, ingresa el número de referencia y sube el comprobante de pago.');
            return;
        }

        console.log({
            orderId,
            totalAmount,
            selectedPaymentMethod,
            referenceNumber,
            paymentProof: paymentProof ? paymentProof.name : null
        });

        onPaymentConfirmed(); // Trigger the success notification and step change
        setReferenceNumber('');
        setPaymentProof(null);
        document.getElementById('paymentProofInput').value = ''; // Clear file input
    };

    return (
        <div className="make-payment-card">
            <div className="payment-header-icon">
                <Player
                    autoplay={true} // Se reproduce automáticamente
                    loop={true} // Se repite de forma continua
                    src={generalCoinLottie}
                    className="lottie-icon main-payment-lottie"
                    style={{ height: '70px', width: '70px' }}
                />
            </div>
            <h2 className="payment-title">Realizar el Pago</h2>
            <p className="payment-subtitle">
                Completa el pago de tu orden #{orderId} por un total de <span className="payment-amount">{totalAmount}</span>
            </p>

            <div className="payment-notice">
                <span className="clock-icon-wrapper">
                    <Player
                        autoplay={true} // Se reproduce automáticamente
                        loop={true} // Se repite de forma continua
                        src={alarmClockLottie}
                        className="lottie-icon"
                        style={{ height: '30px', width: '30px', marginRight: '5px' }}
                    />
                </span>
                Plazo máximo para pagar: 24 horas. Después de este tiempo, la orden será cancelada automáticamente.
            </div>

            <div className="payment-content-grid">
                <div className="left-column">
                    <div className="amount-to-pay-box">
                        <span className="amount-label">Monto a Pagar</span>
                        <span className="total-amount-display">{totalAmount}</span>
                        <span className="total-order-label">Total del pedido</span>
                    </div>

                    <h3>Métodos de Pago</h3>
                    <div className="payment-methods-group">
                        <div
                            className="payment-method-category bolivares-section"
                            onMouseEnter={() => setIsBolivaresCategoryHovered(true)}
                            onMouseLeave={() => setIsBolivaresCategoryHovered(false)}
                        >
                            <span className="category-header-icon">
                                <Player
                                    key={isBolivaresCategoryHovered ? 'bolivares-category-active' : 'bolivares-category-inactive'}
                                    autoplay={isBolivaresCategoryHovered}
                                    loop={false}
                                    src={generalCoinLottie}
                                    className="lottie-icon"
                                    style={{ height: '30px', width: '30px', marginRight: '5px' }}
                                />
                            </span>
                            <span className="category-header-title">{paymentMethods.bolivares.title}</span>
                            <div className="radio-options-container">
                                {Object.entries(paymentMethods.bolivares.options).map(([key, option]) => (
                                    <label key={key} className={`radio-option ${selectedPaymentMethod === key ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value={key}
                                            checked={selectedPaymentMethod === key}
                                            onChange={() => setSelectedPaymentMethod(key)}
                                        />
                                        <div className="option-content">
                                            {key === 'pagoMovil' && (
                                                <span
                                                    className={`method-icon ${isPagoMovilEmojiHovered ? 'hover-animation' : ''}`}
                                                    onMouseEnter={() => setIsPagoMovilEmojiHovered(true)}
                                                    onMouseLeave={() => setIsPagoMovilEmojiHovered(false)}
                                                >
                                                    📱
                                                </span>
                                            )}
                                            {key === 'transferenciaBancaria' && (
                                                <Player
                                                    key={'transfer-bank-lottie'}
                                                    autoplay={selectedPaymentMethod === key || isBolivaresCategoryHovered}
                                                    loop={false}
                                                    src={bankBuildingLottie}
                                                    className="lottie-icon"
                                                    style={{ height: '24px', width: '24px' }}
                                                />
                                            )}
                                            <span className="option-label">{option.label}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div
                            className="payment-method-category dolares-section"
                            onMouseEnter={() => setIsDolaresCategoryHovered(true)}
                            onMouseLeave={() => setIsDolaresCategoryHovered(false)}
                        >
                            <span className="category-header-icon">
                                <Player
                                    key={isDolaresCategoryHovered ? 'dolares-category-active' : 'dolares-category-inactive'}
                                    autoplay={isDolaresCategoryHovered}
                                    loop={false}
                                    src={generalCoinLottie}
                                    className="lottie-icon"
                                    style={{ height: '30px', width: '30px', marginRight: '5px' }}
                                />
                            </span>
                            <span className="category-header-title">{paymentMethods.dolares.title}</span>
                            <div className="radio-options-container">
                                {Object.entries(paymentMethods.dolares.options).map(([key, option]) => (
                                    <label key={key} className={`radio-option ${selectedPaymentMethod === key ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value={key}
                                            checked={selectedPaymentMethod === key}
                                            onChange={() => setSelectedPaymentMethod(key)}
                                        />
                                        <div className="option-content">
                                            {key === 'binanceUSDT' && (
                                                <Player
                                                    key={'binance-usdt-lottie'}
                                                    autoplay={selectedPaymentMethod === key || isDolaresCategoryHovered}
                                                    loop={false}
                                                    src={binanceLogoLottie}
                                                    className="lottie-icon"
                                                    style={{ height: '24px', width: '24px' }}
                                                />
                                            )}
                                            {key === 'zelle' && (
                                                <Player
                                                    key={'zelle-lottie'}
                                                    autoplay={selectedPaymentMethod === key || isDolaresCategoryHovered}
                                                    loop={false}
                                                    src={shareArrowLottie}
                                                    className="lottie-icon"
                                                    style={{ height: '24px', width: '24px' }}
                                                />
                                            )}
                                            {key === 'payPal' && (
                                                <span
                                                    className={`method-icon ${isPayPalEmojiHovered ? 'hover-animation' : ''}`}
                                                    onMouseEnter={() => setIsPayPalEmojiHovered(true)}
                                                    onMouseLeave={() => setIsPayPalEmojiHovered(false)}
                                                >
                                                    🅿️
                                                </span>
                                            )}
                                            <span className="option-label">{option.label}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="right-column">
                    <h3>Instrucciones de Pago</h3>
                    <div className="payment-instructions-box">
                        <p className="instructions-text">{getInstructions()}</p>
                    </div>

                    <h3>Comprobante de Pago</h3>
                    <p className="proof-instructions">Una vez realizado el pago, carga el comprobante aquí.</p>

                    <form onSubmit={handleSubmitPayment} className="payment-proof-form">
                        <div className="form-group">
                            <label htmlFor="referenceNumber">Número de Referencia/Transacción:</label>
                            <input
                                type="text"
                                id="referenceNumber"
                                value={referenceNumber}
                                onChange={(e) => setReferenceNumber(e.target.value)}
                                placeholder="Ej: 123456789"
                                className="text-input"
                                required
                            />
                        </div>

                        <div
                            className="file-upload-area"
                            onMouseEnter={() => setIsUploadIconHovered(true)}
                            onMouseLeave={() => setIsUploadIconHovered(false)}
                        >
                            <span className="upload-icon-wrapper">
                                <Player
                                    key={isUploadIconHovered ? 'upload-active' : 'upload-inactive'}
                                    autoplay={isUploadIconHovered}
                                    loop={true}
                                    src={folderAddingFilesLottie}
                                    className="lottie-icon"
                                    style={{ height: '40px', width: '40px' }}
                                />
                            </span>
                            <button type="button" className="select-file-button" onClick={() => document.getElementById('paymentProofInput').click()}>
                                Subir Comprobante
                            </button>
                            <input
                                type="file"
                                id="paymentProofInput"
                                accept="image/jpeg, image/png, application/pdf"
                                onChange={handlePaymentProofChange}
                                style={{ display: 'none' }}
                                required
                            />
                            {paymentProof && <span className="file-name">{paymentProof.name}</span>}
                            <span className="file-info">JPG, PNG, PDF. Max 10MB</span>
                        </div>

                        <button
                            type="submit"
                            className="submit-payment-button"
                            onMouseEnter={() => setIsConfirmCheckHovered(true)}
                            onMouseLeave={() => setIsConfirmCheckHovered(false)}
                        >
                            Confirmar Pago
                            <span className="check-icon-wrapper">
                                <Player
                                    key={isConfirmCheckHovered ? 'confirm-check-active' : 'confirm-check-inactive'}
                                    autoplay={isConfirmCheckHovered}
                                    loop={false}
                                    src={approveCheckLottie}
                                    className="lottie-icon"
                                    style={{ height: '24px', width: '24px', marginLeft: '10px' }}
                                />
                            </span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default MakePayment;