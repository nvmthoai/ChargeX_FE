import React from "react";
import "./ConfirmDialog.css";

interface ConfirmDialogProps {
    title?: string;
    message?: string;
    button?: string;
    color?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    title = "Confirm",
    message = "Are you sure?",
    button = "CONFIRM",
    color = "#007bff",
    onConfirm,
    onCancel,
}) => {
    return (
        <div className="confirm-modal">
            <div className="modal-box">
                <div className="title">{title}</div>
                <div className="message">{message}</div>
                <div className="buttons">
                    <button
                        type="button"
                        onClick={onConfirm}
                        style={{ backgroundColor: color }}
                    >
                        <div className="text">{button}</div>
                    </button>
                    <button type="button" onClick={onCancel} className="cancel-btn">
                        <div className="text">CANCEL</div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;