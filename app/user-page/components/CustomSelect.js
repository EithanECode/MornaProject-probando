import React, { useState, useRef, useEffect } from 'react';
import '../../src/styles/CustomSelect.css';

const CustomSelect = ({ label, options, selectedValue, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const handleOptionClick = (value) => {
        onSelect(value);
        setIsOpen(false);
    };

    const selectedOption = options.find(option => option.value === selectedValue);

    return (
        <div className="custom-select-wrapper" ref={wrapperRef}>
            {label && <label className="custom-select-label">{label}</label>}
            <div className={`custom-select-container ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
                <div className="selected-option-display">
                    {selectedOption ? (
                        <>
                            <span className="option-icon">{selectedOption.icon}</span>
                            <span>{selectedOption.label}</span>
                        </>
                    ) : (
                        <span className="placeholder">Seleccionar opción</span>
                    )}
                </div>
                <span className="dropdown-arrow"></span>
            </div>
            {isOpen && (
                <div className="options-list">
                    {options.map(option => (
                        <div
                            key={option.value}
                            className={`select-option ${option.value === selectedValue ? 'selected' : ''}`}
                            onClick={() => handleOptionClick(option.value)}
                        >
                            <span className="option-icon">{option.icon}</span>
                            <span>{option.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;