// Base64 encoded logo as backup solution
export const logoBase64 = "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3crect width='100' height='100' rx='15' fill='%236f42c1'/%3e%3ctext x='50' y='65' font-family='Arial Black' font-size='50' fill='white' text-anchor='middle' font-weight='900'%3eR%3c/text%3e%3c/svg%3e";

// Alternative text-based logo component
export const LogoComponent = ({ size = 32, className = "" }) => (
  <div 
    className={`d-flex align-items-center justify-content-center ${className}`}
    style={{
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: '#6f42c1',
      borderRadius: `${size * 0.25}px`,
      color: '#fff',
      fontWeight: '900',
      fontSize: `${size * 0.5}px`,
      fontFamily: 'Arial Black, sans-serif'
    }}
  >
    R
  </div>
);
