// src/pages/MainPage.tsx
import { useNavigate } from 'react-router-dom';

export function MainPage() {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="container">
      <h1 className="title">Bienvenido</h1>
      <button className="button" onClick={goToLogin}>
        Ir al Login
      </button>
    </div>
  );
}
