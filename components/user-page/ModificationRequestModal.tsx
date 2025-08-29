import React, { useState } from 'react';
import '@/app/user-page/styles/ModificationRequestModal.css';
import { Player } from '@lottiefiles/react-lottie-player'; // ¡Importa el Player!

// Importa el archivo Lottie para el icono de modificación
import editDocumentLottie from '@/public/animations/wired-flat-245-edit-document-hover-pinch.json';

type ModificationRequestModalProps = {
    onClose: () => void;
};

function ModificationRequestModal({ onClose }: ModificationRequestModalProps) {
    const [modificationType, setModificationType] = useState('');
    const [modificationDetails, setModificationDetails] = useState('');
    const attemptsLeft = 2; // Hardcoded for now based on image "2 de 3"

    const handleSubmitModification = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validaciones para campos requeridos
        if (!modificationType) {
            alert('Por favor, selecciona un tipo de modificación.');
            return;
        }
        if (!modificationDetails) {
            alert('Por favor, describe los cambios que deseas realizar.');
            return;
        }

        console.log('Solicitud de Modificación enviada:', {
            modificationType,
            modificationDetails
        });
        alert('Solicitud de modificación enviada. Nos pondremos en contacto pronto.');
        onClose(); // Close the modal
    };

    return (
        <div className="modal-overlay">
            <div className="modification-modal-content">
                <div className="modification-header">
                    {/* El Player ahora se reproduce automáticamente y en loop */}
                    <Player
                        autoplay={true} 
                        loop={true} 
                        src={editDocumentLottie}
                        className="lottie-icon"
                        style={{ height: '30px', width: '30px', marginRight: '10px' }}
                    />
                    Solicitud de Modificación
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>

                <div className="modification-body">
                    <p className="attempts-left-text">
                        Intentos restantes: {attemptsLeft} de 3. Después del tercer intento, la compra será rechazada automáticamente.
                    </p>

                    <form onSubmit={handleSubmitModification} className="modification-form">
                        <div className="form-group">
                            <label htmlFor="modificationType">Tipo de Modificación</label>
                            <select
                                id="modificationType"
                                value={modificationType}
                                onChange={(e) => setModificationType(e.target.value)}
                                className="select-input"
                                required
                            >
                                <option value="">Seleccionar tipo</option>
                                <option value="cantidad">Cambio de Cantidad</option>
                                <option value="especificaciones">Cambio de Especificaciones</option>
                                <option value="envio">Cambio de Tipo de Envío</option>
                                <option value="entrega">Cambio de Entrega en Venezuela</option>
                                <option value="otro">Otro</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="modificationDetails">Detalles de la Modificación</label>
                            <textarea
                                id="modificationDetails"
                                value={modificationDetails}
                                onChange={(e) => setModificationDetails(e.target.value)}
                                placeholder="Describe los cambios que deseas realizar..."
                                className="textarea-input"
                                rows={6}
                                required
                            ></textarea>
                        </div>
                        <div className="modal-buttons">
                            <button type="submit" className="btn-send-modification">
                                Enviar Modificación
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ModificationRequestModal;