import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function AdminLoginPage() {
  return (
    <div className="admin-login-shell">
      <Suspense
        fallback={
          <p style={{ textAlign: "center", fontSize: 13, color: "var(--admin-text-muted)" }}>
            Loading…
          </p>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
