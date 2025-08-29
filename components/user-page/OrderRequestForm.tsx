import React, { useState } from 'react';
import '@/app/user-page/styles/OrderRequestForm.css';
import { Player } from '@lottiefiles/react-lottie-player';

import DeliveryCarousel from './DeliveryCarousel';

import airPlaneLottie from '@/public/animations/FTQoLAnxbj.json';
import cargoShipLottie from '@/public/animations/wired-flat-1337-cargo-ship-hover-pinch.json';
import woodenBoxLottie from '@/public/animations/wired-flat-1356-wooden-box-hover-pinch.json';
import cameraLottie from '@/public/animations/wired-flat-61-camera-hover-flash.json';
import folderLottie from '@/public/animations/wired-flat-120-folder-hover-adding-files.json';
import linkLottie from '@/public/animations/wired-flat-11-link-unlink-hover-bounce.json';

// Tipos para los datos del formulario y la función de submit
export type CartItem = {
    requestType: string;
    productUrl: string | null;
    productImage: File | null;
    productDescription: string | null;
    quantity: number;
    technicalSpecs: string;
};

export type FormData = {
    cartItems: CartItem[];
    deliveryType: string;
    deliveryVenezuela: string;
    submittedAt: string;
};

interface OrderRequestFormProps {
    onSubmitForm: (formData: FormData) => void;
}

function OrderRequestForm({ onSubmitForm }: OrderRequestFormProps) {
    const [requestType, setRequestType] = useState('link');
    const [productUrl, setProductUrl] = useState('');
    const [productImage, setProductImage] = useState<File | null>(null);
    const [productDescription, setProductDescription] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [technicalSpecs, setTechnicalSpecs] = useState('');

    const [cartItems, setCartItems] = useState<CartItem[]>([]); // Lista de productos en el carrito

    const [deliveryType, setDeliveryType] = useState<string>('');
    const [deliveryVenezuela, setDeliveryVenezuela] = useState<string>('');

    const [hoveredDeliveryOption, setHoveredDeliveryOption] = useState<string | null>(null);
    const [hoveredShippingOption, setHoveredShippingOption] = useState<string | null>(null);
    const [isFolderHovered, setIsFolderHovered] = useState<boolean>(false);
    const [isCameraHovered, setIsCameraHovered] = useState<boolean>(false);
    const [isLinkHovered, setIsLinkHovered] = useState<boolean>(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProductImage(e.target.files[0]);
        }
    };

    const handleAddToCart = () => {
        // Validaciones
        if (!requestType) {
            alert('Por favor, selecciona cómo deseas solicitar tu producto (Link o Foto + Descripción).');
            return;
        }

        // 2. Validar la URL si se seleccionó la opción de Link
        if (requestType === 'link' && !productUrl) {
            alert('Por favor, ingresa la URL del producto.');
            return;
        }

        // 3. Validar imagen y descripción si se seleccionó la opción de Foto
        if (requestType === 'photo') {
            if (!productImage) {
                alert('Por favor, sube una imagen del producto.');
                return;
            }
            if (!productDescription) {
                alert('Por favor, ingresa una descripción del producto.');
                return;
            }
        }
        
        // 4. Validar la cantidad
        if (quantity < 1) {
            alert('La cantidad debe ser al menos 1.');
            return;
        }

        // Crea el objeto del producto
        const newProduct: CartItem = {
            requestType,
            productUrl: requestType === 'link' ? productUrl : null,
            productImage: requestType === 'photo' ? productImage : null,
            productDescription: requestType === 'photo' ? productDescription : null,
            quantity,
            technicalSpecs
        };

        // Agrega el producto al carrito
        setCartItems([...cartItems, newProduct]);

        // Limpia el formulario para el siguiente producto
        setRequestType('link');
        setProductUrl('');
        setProductImage(null);
        setProductDescription('');
        setQuantity(1);
        setTechnicalSpecs('');
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (cartItems.length === 0) {
            alert('Por favor, agrega al menos un producto a tu caja.');
            return;
        }

        if (!deliveryType) {
            alert('Por favor, selecciona un tipo de envío.');
            return;
        }

        // 6. Validar la opción de entrega en Venezuela
        if (!deliveryVenezuela) {
            alert('Por favor, selecciona una opción de entrega en Venezuela.');
            return;
        }

        const formData: FormData = {
            cartItems,
            deliveryType,
            deliveryVenezuela,
            submittedAt: new Date().toISOString()
        };

        console.log('Carrito:', cartItems);
        console.log('Tipo de envío:', deliveryType);
        console.log('Entrega en Venezuela:', deliveryVenezuela);
        alert('¡Solicitud enviada exitosamente! Ahora puedes seguir el progreso de tu pedido.');
        onSubmitForm(formData);
    };

    const handleRemoveFromCart = (index: number) => {
        const newCartItems = [...cartItems];
        newCartItems.splice(index, 1);
        setCartItems(newCartItems);
    };

    const handleEditFromCart = (index: number) => {
        const itemToEdit = cartItems[index];
        
        // Cargar los datos del producto a editar en el formulario
        setRequestType(itemToEdit.requestType);
        setProductUrl(itemToEdit.productUrl || '');
        setProductImage(itemToEdit.productImage || null);
        setProductDescription(itemToEdit.productDescription || '');
        setQuantity(itemToEdit.quantity);
        setTechnicalSpecs(itemToEdit.technicalSpecs || '');
        
        // Eliminar el elemento del carrito para que se pueda volver a agregar
        handleRemoveFromCart(index);
        
        // Scroll al formulario
                if (typeof window !== 'undefined') {
                    document.querySelector('.form-section')?.scrollIntoView({ behavior: 'smooth' });
                }
    };

    const isActiveAnimation = (optionName: string) => {
        return hoveredDeliveryOption === optionName || deliveryType === optionName;
    };

    return (
        <div className="order-request-card">
            <h2 className="card-title">Solicitud de Pedido</h2>
            <p className="card-subtitle">Cuéntanos qué producto deseas importar</p>

            <form onSubmit={handleSubmit} className="order-form">
                <div className="form-section">
                    <h3>¿Cómo deseas solicitar tu producto?</h3>
                    <div className="radio-group">
                        <label
                            className={`radio-option ${requestType === 'link' ? 'selected' : ''}`}
                            onMouseEnter={() => setIsLinkHovered(true)}
                            onMouseLeave={() => setIsLinkHovered(false)}
                        >
                            <input
                                type="radio"
                                name="requestType"
                                value="link"
                                checked={requestType === 'link'}
                                onChange={() => setRequestType('link')}
                            />
                            <div className="option-content">
                                <Player
                                    key={isLinkHovered ? 'link-active' : 'link-inactive'}
                                    autoplay={isLinkHovered}
                                    loop={false}
                                    src={linkLottie}
                                    className="delivery-lottie-icon"
                                    style={{ height: '30px', width: '30px', marginRight: '10px' }}
                                />
                                <div className="text-content">
                                    <span className="option-title">Link del Producto</span>
                                    <span className="option-description">Pega el enlace de cualquier tienda online</span>
                                </div>
                            </div>
                        </label>
                        <label
                            className={`radio-option ${requestType === 'photo' ? 'selected' : ''}`}
                            onMouseEnter={() => setIsCameraHovered(true)}
                            onMouseLeave={() => setIsCameraHovered(false)}
                        >
                            <input
                                type="radio"
                                name="requestType"
                                value="photo"
                                checked={requestType === 'photo'}
                                onChange={() => setRequestType('photo')}
                            />
                            <div className="option-content">
                                <Player
                                    key={isCameraHovered ? 'camera-active' : 'camera-inactive'}
                                    autoplay={isCameraHovered}
                                    loop={false}
                                    src={cameraLottie}
                                    className="delivery-lottie-icon"
                                    style={{ height: '30px', width: '30px', marginRight: '10px' }}
                                />
                                <div className="text-content">
                                    <span className="option-title">Foto + Descripción</span>
                                    <span className="option-description">Sube una imagen con descripción detallada</span>
                                </div>
                            </div>
                        </label>
                    </div>

                    {requestType === 'link' && (
                        <div className="form-group" style={{ marginTop: '20px' }}>
                            <label htmlFor="productUrl">URL del Producto</label>
                            <input
                                type="url"
                                id="productUrl"
                                value={productUrl}
                                onChange={(e) => setProductUrl(e.target.value)}
                                placeholder="https://ejemplo.com/producto"
                                className="text-input"
                                required={cartItems.length === 0}
                            />
                        </div>
                    )}

                    <div
                        className={`photo-description-section ${requestType === 'photo' ? 'visible' : ''}`}
                        style={{ marginTop: '20px' }}
                    >
                        <div
                            className="image-upload-area"
                            onMouseEnter={() => setIsFolderHovered(true)}
                            onMouseLeave={() => setIsFolderHovered(false)}
                        >
                            <Player
                                key={isFolderHovered ? 'folder-active' : 'folder-inactive'}
                                autoplay={isFolderHovered}
                                loop={false}
                                src={folderLottie}
                                className="delivery-lottie-icon-archivo"
                                style={{ height: '100px', width: '100px', marginRight: '10px' }}
                            />
                            <button
                                type="button"
                                className="select-image-button"
                                onClick={() => {
                                    const input = document.getElementById('productImageInput');
                                    if (input) {
                                        input.click();
                                    }
                                }}
                            >
                                Seleccionar Imagen
                            </button>
                            <input
                                type="file"
                                id="productImageInput"
                                accept="image/jpeg, image/png"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                            {productImage && <span className="file-name">{(productImage as File).name}</span>}
                            <span className="file-info">JPG, PNG, máximo 5MB</span>
                        </div>
                        <div className="form-group" style={{ marginTop: '20px' }}>
                            <label htmlFor="productDescription">Descripción del Producto</label>
                            <textarea
                                id="productDescription"
                                value={productDescription}
                                onChange={(e) => setProductDescription(e.target.value)}
                                placeholder="Describe el producto detalladamente..."
                                className="textarea-input"
                                rows={5}
                                required={cartItems.length === 0}
                            ></textarea>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Detalles del Pedido</h3>
                    <div className="form-group">
                        <label htmlFor="quantity">Cantidad</label>
                        <input
                            type="number"
                            id="quantity"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            min="1"
                            className="text-input"
                            required={cartItems.length === 0}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="technicalSpecs">Especificaciones Técnicas</label>
                        <textarea
                            id="technicalSpecs"
                            value={technicalSpecs}
                            onChange={(e) => setTechnicalSpecs(e.target.value)}
                            placeholder="Color, talla, modelo, características específicas, etc."
                            className="textarea-input"
                            rows={5}
                            required={cartItems.length === 0}
                        ></textarea>
                    </div>
                </div>

                {/* Lista del carrito */}
                <div className="cart-section">
                    <h3>Tu Caja</h3>
                    {cartItems.length > 0 ? (
                        <ul className="cart-items-list">
                            {cartItems.map((item, index) => (
                                <li key={index} className="cart-item">
                                    <div className="cart-item-content">
                                        <div className="cart-item-main-info">
                                            <div className="cart-item-header">
                                                <span className="cart-item-title">Producto {index + 1}</span>
                                                <span className="cart-item-quantity">Cantidad: {item.quantity}</span>
                                            </div>
                                            <div className="cart-item-details">
                                                {item.requestType === 'link' && item.productUrl && (
                                                    <span className="cart-item-url">
                                                        URL: {item.productUrl.length > 40 ? item.productUrl.substring(0, 40) + '...' : item.productUrl}
                                                    </span>
                                                )}
                                                {item.requestType === 'photo' && item.productDescription && (
                                                    <span className="cart-item-description">
                                                        Descripción: {item.productDescription.length > 40 ? item.productDescription.substring(0, 40) + '...' : item.productDescription}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="cart-item-actions">
                                            <button 
                                                type="button" 
                                                className="action-button edit-button" 
                                                onClick={() => handleEditFromCart(index)}
                                                title="Editar producto"
                                            >
                                                <svg viewBox="0 0 24 24" className="action-icon">
                                                    <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                                                </svg>
                                            </button>
                                            <button 
                                                type="button" 
                                                className="action-button delete-button" 
                                                onClick={() => handleRemoveFromCart(index)}
                                                title="Eliminar producto"
                                            >
                                                <svg viewBox="0 0 24 24" className="action-icon">
                                                    <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="empty-cart">
                            <p>Tu caja está vacía. Agrega productos para comenzar.</p>
                        </div>
                    )}
                    
                    <button type="button" className="add-to-cart-button" onClick={handleAddToCart}>
                        <span className="add-to-cart-text">Agregar a la Caja</span>
                        <Player
                            autoplay={true}
                            loop={true}
                            src={woodenBoxLottie}
                            className="add-to-cart-lottie"
                            style={{ height: '24px', width: '24px' }}
                        />
                    </button>
                </div>

                {/* Opciones de envío y entrega en Venezuela */}
                <div className="shipping-options">
                    <h3>Tipo de Envío</h3>
                    <div className="shipping-row-options">
                        <label
                            className={`shipping-option ${deliveryType === 'doorToWarehouse' ? 'selected' : ''}`}
                            onMouseEnter={() => setHoveredShippingOption('doorToWarehouse')}
                            onMouseLeave={() => setHoveredShippingOption(null)}
                        >
                            <input
                                type="radio"
                                name="deliveryType"
                                value="doorToWarehouse"
                                checked={deliveryType === 'doorToWarehouse'}
                                onChange={() => setDeliveryType('doorToWarehouse')}
                            />
                            <div className="shipping-option-content">
                                <div className="shipping-lottie-container">
                                    <Player
                                        key={hoveredShippingOption === 'doorToWarehouse' || deliveryType === 'doorToWarehouse' ? 'box-active' : 'box-inactive'}
                                        autoplay={hoveredShippingOption === 'doorToWarehouse' || deliveryType === 'doorToWarehouse'}
                                        loop={false}
                                        src={woodenBoxLottie}
                                        className="shipping-lottie-icon"
                                        style={{ height: '40px', width: '40px' }}
                                    />
                                </div>
                                <div className="shipping-text-content">
                                    <span className="shipping-option-title">Puerta a Puerta</span>
                                    <span className="shipping-option-description">Recogemos en tu dirección</span>
                                </div>
                            </div>
                        </label>
                        
                        <label
                            className={`shipping-option ${deliveryType === 'air' ? 'selected' : ''}`}
                            onMouseEnter={() => setHoveredShippingOption('air')}
                            onMouseLeave={() => setHoveredShippingOption(null)}
                        >
                            <input
                                type="radio"
                                name="deliveryType"
                                value="air"
                                checked={deliveryType === 'air'}
                                onChange={() => setDeliveryType('air')}
                            />
                            <div className="shipping-option-content">
                                <div className="shipping-lottie-container">
                                    <Player
                                        key={hoveredShippingOption === 'air' || deliveryType === 'air' ? 'air-active' : 'air-inactive'}
                                        autoplay={hoveredShippingOption === 'air' || deliveryType === 'air'}
                                        loop={false}
                                        src={airPlaneLottie}
                                        className="shipping-lottie-icon"
                                        style={{ height: '40px', width: '40px' }}
                                    />
                                </div>
                                <div className="shipping-text-content">
                                    <span className="shipping-option-title">Envío Aéreo</span>
                                    <span className="shipping-option-description">Envío rápido por vía aérea</span>
                                </div>
                            </div>
                        </label>
                        
                        <label
                            className={`shipping-option ${deliveryType === 'maritime' ? 'selected' : ''}`}
                            onMouseEnter={() => setHoveredShippingOption('maritime')}
                            onMouseLeave={() => setHoveredShippingOption(null)}
                        >
                            <input
                                type="radio"
                                name="deliveryType"
                                value="maritime"
                                checked={deliveryType === 'maritime'}
                                onChange={() => setDeliveryType('maritime')}
                            />
                            <div className="shipping-option-content">
                                <div className="shipping-lottie-container">
                                    <Player
                                        key={hoveredShippingOption === 'maritime' || deliveryType === 'maritime' ? 'maritime-active' : 'maritime-inactive'}
                                        autoplay={hoveredShippingOption === 'maritime' || deliveryType === 'maritime'}
                                        loop={false}
                                        src={cargoShipLottie}
                                        className="shipping-lottie-icon"
                                        style={{ height: '40px', width: '40px' }}
                                    />
                                </div>
                                <div className="shipping-text-content">
                                    <span className="shipping-option-title">Envío Marítimo</span>
                                    <span className="shipping-option-description">Envío económico por vía marítima</span>
                                </div>
                            </div>
                        </label>
                    </div>

                    <div className="delivery-section">
                        <DeliveryCarousel
                            selectedValue={deliveryVenezuela}
                            onSelect={setDeliveryVenezuela}
                        />
                    </div>
                    <button type="submit" className="submit-button">
                        Enviar Solicitud ✨
                    </button>
                </div>
            </form>
        </div>
    );
}

export default OrderRequestForm;