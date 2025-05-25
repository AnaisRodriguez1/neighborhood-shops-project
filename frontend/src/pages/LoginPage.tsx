// src/pages/LoginPage.tsx
import { useState } from 'react';
import { loginRequest, checkAuthStatusRequest } from '../api/authApi';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]); // ahora es un array de errores

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
      if (err.response && err.response.data && Array.isArray(err.response.data.message)) {
        setErrors(err.response.data.message); // varios errores del backend
      } else if (err.response && err.response.data && err.response.data.message) {
        setErrors([err.response.data.message]); // un solo error
      } else {
        setErrors([]);
      }
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">Login</h1>
        <form onSubmit={handleSubmit} className="form" noValidate>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
          <button type="submit" className="button">Log In</button>

          {/* Mostrar lista de errores */}
          {errors.length > 0 && (
            <ul className="error-list">
              {errors.map((err, index) => (
                <li key={index} className="error">{err}</li>
              ))}
            </ul>
          )}
        </form>
      </div>
    </div>
  );
}
