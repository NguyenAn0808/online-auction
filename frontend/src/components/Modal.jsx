const Modal = ({ isOpen, title, children, size = "lg" }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-3xl",
  };

  return (
    <div className="modal-overlay">
      <div className={`modal-content ${sizeClasses[size]}`}>
        <div style={{ padding: "var(--space-lg)" }}>
          {title && <h2 className="modal-header">{title}</h2>}
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
