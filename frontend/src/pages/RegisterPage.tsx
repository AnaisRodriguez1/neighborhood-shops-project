// src/pages/RegisterPage.tsx
import { useState } from 'react';
import { registerRequest } from '../api/authApi';
import { useNavigate } from 'react-router-dom';

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await registerRequest({ email, password, name });
      // Registro exitoso → ir al login
      navigate('/login');
    } catch (err: any) {
      if (err.response && err.response.data && Array.isArray(err.response.data.message)) {
        setErrors(err.response.data.message); // varios errores
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
        <h1 className="title">Register</h1>
        <form onSubmit={handleSubmit} className="form" noValidate>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
          />
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
          <button type="submit" className="button">Register</button>

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
