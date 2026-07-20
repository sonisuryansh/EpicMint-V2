import React, { useState } from 'react'

function Modal({ isOpen, onClose, title, children, size = 'lg' }) {
    if (!isOpen) return null

    return (
        <>
            <div className="modal-backdrop fade show"></div>
            <div className={`modal fade show d-block`} role="dialog">
                <div className={`modal-dialog modal-${size}`} role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{title}</h5>
                            <button
                                type="button"
                                className="btn-close"
                                aria-label="Close"
                                onClick={onClose}
                            ></button>
                        </div>
                        <div className="modal-body">{children}</div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Modal
