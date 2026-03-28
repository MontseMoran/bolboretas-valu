import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/admin.scss";

function mapLoginError(error) {
  const message = String(error?.message || "").toLowerCase();

  if (message.includes("invalid login credentials")) {
    return "Usuario o contraseña incorrectos.";
  }

  if (message.includes("email not confirmed")) {
    return "La cuenta no tiene el correo confirmado.";
  }

  if (message.includes("too many requests")) {
    return "Demasiados intentos de acceso. Espera un momento y vuelve a probar.";
  }

  return error?.message || "No se pudo iniciar sesión.";
}

export default function Login() {
  const nav = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const stateMessage = location.state?.errorMsg;

    if (stateMessage) {
      setErrorMsg(stateMessage);
      nav(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, nav]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const normalizedEmail = `${username.trim().toLowerCase()}@gmail.com`;

      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        setErrorMsg(mapLoginError(error));
        return;
      }

      nav("/admin", { replace: true });
    } catch {
      setErrorMsg("Error inesperado al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth">
      <div className="admin-auth__card">
        <h1 className="admin-auth__title">Acceso al panel</h1>
        <p className="admin-auth__subtitle">
          Introduce el usuario y la contraseña de administración.
        </p>

        <form className="admin-auth__form" onSubmit={handleLogin}>
          <label className="admin-auth__label">Usuario</label>
          <input
            className="admin-auth__input"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />

          <label className="admin-auth__label">Contraseña</label>
          <div className="admin-auth__passwordWrap">
            <input
              className="admin-auth__input admin-auth__input--password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <button
              type="button"
              className="admin-auth__passwordToggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M3 3l18 18" />
                  <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                  <path d="M9.88 5.09A10.94 10.94 0 0 1 12 4.91c5 0 9.27 3.11 11 7.5a11.84 11.84 0 0 1-4.14 5.24" />
                  <path d="M6.61 6.61A11.83 11.83 0 0 0 1 12.41c1.73 4.39 6 7.5 11 7.5a10.94 10.94 0 0 0 5.16-1.26" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {errorMsg ? <div className="admin-auth__error">{errorMsg}</div> : null}

          <button className="admin-auth__btn" type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
