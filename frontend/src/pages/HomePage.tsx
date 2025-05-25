export function HomePage() {
  const name = localStorage.getItem('name');
  const role = localStorage.getItem('role');

  return (
    <div className="container">
      <h1 className="title">Hola {role}/a {name}</h1>
    </div>
  );
}
