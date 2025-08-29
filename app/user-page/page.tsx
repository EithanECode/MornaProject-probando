"use client";

// Force dynamic rendering to avoid SSR issues with document API
export const dynamic = 'force-dynamic';
import React, { useState } from 'react';
// import ReactDOM from 'react-dom/client';
import './styles/App.css';
import Header from '@/components/user-page/Header';
import ChatSupportModal from '@/components/user-page/ChatSupportModal';
import TrackingModal from '@/components/user-page/TrackingModal';
import QuotationReceived from '@/components/user-page/QuotationReceived';
import ModificationRequestModal from '@/components/user-page/ModificationRequestModal';
import OrderConfirmed from '@/components/user-page/OrderConfirmed';
import MakePayment from '@/components/user-page/MakePayment';
import OrderTracking from '@/components/user-page/OrderTracking';
import PaymentSuccessNotification from '@/components/user-page/PaymentSuccessNotification';
import SatisfactionSurveyModal from '@/components/user-page/SatisfactionSurveyModal';
import { FormData } from '@/components/user-page/OrderRequestForm';
import OrderRequestForm from '@/components/user-page/OrderRequestForm';

function Page() {
    // ...código de App...
    const [currentStep, setCurrentStep] = useState(1);
    const [showChatModal, setShowChatModal] = useState(false);
    const [showTrackingModal, setShowTrackingModal] = useState(false);
    const [showModificationModal, setShowModificationModal] = useState(false);
    const [showPaymentSuccessNotification, setShowPaymentSuccessNotification] = useState(false);
    const [showSurveyModal, setShowSurveyModal] = useState(false);
    const [orderData, setOrderData] = useState<FormData & { orderId?: string } | null>(null);
    const [ordersList, setOrdersList] = useState([
        {
            id: 'ORD-2024-001234',
            product: 'iPhone 15 Pro Max',
            price: '1,319.00',
            status: 'En Tránsito',
            progress: 60,
            statusColor: '#FFB300',
            submittedAt: '2024-01-15T10:30:00.000Z'
        },
        {
            id: 'ORD-2024-001233',
            product: 'MacBook Air M2',
            price: '1,199.00',
            status: 'Entregado',
            progress: 100,
            statusColor: '#66BB6A',
            submittedAt: '2024-01-10T14:20:00.000Z'
        }
    ]);

    const quotationDetails = {
        product: 'iPhone 15 Pro Max',
        quantity: '1 unidad',
        productPrice: '$1,199.00',
        internationalShipping: '$45.00',
        courierVenezuela: '$15.00',
        serviceCommission: '$60.00',
        total: '$1,319.00'
    };

    const handleOpenChat = () => setShowChatModal(true);
    const handleCloseChat = () => setShowChatModal(false);
    const handleOpenTracking = () => setShowTrackingModal(true);
    const handleCloseTracking = () => setShowTrackingModal(false);
    const handleOpenModification = () => setShowModificationModal(true);
    const handleCloseModification = () => setShowModificationModal(false);
    const handleOpenSurvey = () => setShowSurveyModal(true);
    const handleCloseSurvey = () => setShowSurveyModal(false);

    const generateOrderId = () => {
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `ORD-2024-${timestamp.toString().slice(-6)}${randomNum}`;
    };

    const addNewOrder = (formData: FormData) => {
        const orderId = generateOrderId();
        const productSummary = formData.cartItems.length === 1
            ? `${formData.cartItems.length} producto`
            : `${formData.cartItems.length} productos`;
        const newOrder = {
            id: orderId,
            product: productSummary,
            price: 'Pendiente',
            status: 'Solicitud Enviada',
            progress: 25,
            statusColor: '#4CAF50',
            submittedAt: formData.submittedAt,
            cartItems: formData.cartItems,
            deliveryType: formData.deliveryType,
            deliveryVenezuela: formData.deliveryVenezuela
        };
        setOrdersList(prevOrders => [newOrder, ...prevOrders]);
        return orderId;
    };

    const handleFormSubmit = (formData: FormData) => {
        const newOrderId = addNewOrder(formData);
        setOrderData({ ...formData, orderId: newOrderId });
        setCurrentStep(5);
    };

    const handleRejectProposal = () => {
        if (window.confirm('¿Estás seguro de que quieres rechazar la propuesta? Se regresará al inicio.')) {
            setCurrentStep(1);
        }
    };

    const handleAcceptQuotation = () => {
        setCurrentStep(3);
    };

    const handleProceedToPayment = () => {
        setCurrentStep(4);
    };

    const handlePaymentConfirmed = () => {
        setShowPaymentSuccessNotification(true);
        setTimeout(() => {
            setShowPaymentSuccessNotification(false);
            setCurrentStep(5);
        }, 2000);
    };

    return (
        <div className="App">
            <Header
                onOpenChat={handleOpenChat}
                onOpenTracking={handleOpenTracking}
            />
            <div className="main-content">
                {currentStep === 1 && (
                    <OrderRequestForm onSubmitForm={handleFormSubmit} />
                )}
                {currentStep === 2 && (
                    <QuotationReceived
                        quotation={quotationDetails}
                        onSolicitarModificacion={handleOpenModification}
                        onAceptarCotizacion={handleAcceptQuotation}
                        onRechazarPropuesta={handleRejectProposal}
                    />
                )}
                {currentStep === 3 && (
                    <OrderConfirmed
                        orderId="ORD-2024-001234"
                        productName={quotationDetails.product}
                        totalPrice={quotationDetails.total}
                        onProceedToPayment={handleProceedToPayment}
                    />
                )}
                {currentStep === 4 && (
                    <MakePayment
                        orderId="ORD-2024-001234"
                        totalAmount={quotationDetails.total}
                        onPaymentConfirmed={handlePaymentConfirmed}
                    />
                )}
                {currentStep === 5 && (
                    <OrderTracking
                        orderId={orderData?.orderId || "ORD-2024-001234"}
                        orderData={orderData}
                        onOpenSurvey={handleOpenSurvey}
                    />
                )}
            </div>
            {showChatModal && <ChatSupportModal onClose={handleCloseChat} />}
            {showTrackingModal && <TrackingModal onClose={handleCloseTracking} ordersList={ordersList} />}
            {showModificationModal && <ModificationRequestModal onClose={handleCloseModification} />}
            {showPaymentSuccessNotification && <PaymentSuccessNotification />}
            {showSurveyModal && <SatisfactionSurveyModal onClose={handleCloseSurvey} />}
        </div>
    );
}

// const container = document.getElementById('root');
// if (container) {
//   const root = ReactDOM.createRoot(container);
//   root.render(
//     <React.StrictMode>
//       <Page />
//     </React.StrictMode>
//   );
// }

export default Page;
