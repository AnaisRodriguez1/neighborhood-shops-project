// src/pages/MainPage.tsx
import { useNavigate } from 'react-router-dom';

export function MainPage() {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate('/login');
  };

  const goToRegister = () => {
    navigate('/register');
  };

  return (
    <div className="container">
      <h1 className="title">Bienvenido</h1>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button className="button" onClick={goToLogin}>
          Ingresar
        </button>
        <button className="button" onClick={goToRegister}>
          Registrarse
        </button>
      </div>
    </div>
  );
}
