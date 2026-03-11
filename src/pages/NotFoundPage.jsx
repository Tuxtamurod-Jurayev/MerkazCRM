import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="card">
      <h1>Sahifa topilmadi</h1>
      <p className="muted">Kiritilgan manzil noto'g'ri yoki mavjud emas.</p>
      <Link to="/">Bosh sahifaga qaytish</Link>
    </section>
  );
}
