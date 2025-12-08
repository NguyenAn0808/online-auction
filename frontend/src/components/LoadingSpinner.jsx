const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="card" style={{ padding: "var(--space-lg)" }}>
    <div className="text-center" style={{ padding: "var(--space-xl) 0" }}>
      <div
        className="spinner"
        style={{ margin: "0 auto var(--space-md)" }}
      ></div>
      <p className="text-pebble text-footnote">{message}</p>
    </div>
  </div>
);

export default LoadingSpinner;
