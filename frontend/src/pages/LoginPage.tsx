// src/pages/LoginPage.tsx
import { useState } from 'react';
import { loginRequest, checkAuthStatusRequest } from '../api/authApi';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const loginData = await loginRequest(email, password);
      localStorage.setItem('token', loginData.token);

      const userData = await checkAuthStatusRequest(loginData.token);

      if (Array.isArray(userData.roles) && userData.roles.length > 0) {
        localStorage.setItem('role', userData.roles[0]);
      } else {
        localStorage.setItem('role', 'SinRol');
      }

      localStorage.setItem('name', userData.name);
      localStorage.setItem('email', userData.email);

      window.location.href = '/home';
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message); // <-- Mostrar el mensaje real que mandó NestJS
      } else {
        setError('Error en login, revisa tus credenciales.');
      }
    }    
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">Login</h1>
        <form onSubmit={handleSubmit} className="form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input"
          />
          <button type="submit" className="button">Log In</button>
          {error && <p className="error">{error}</p>}
        </form>
      </div>
    </div>
  );
}
