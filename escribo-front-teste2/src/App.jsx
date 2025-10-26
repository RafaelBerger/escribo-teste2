import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "./supabaseClient";
import "./App.css";

function App() {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginSenha, setLoginSenha] = useState("");

  const [cadastroNome, setCadastroNome] = useState("");
  const [cadastroEmail, setCadastroEmail] = useState("");
  const [cadastroSenha, setCadastroSenha] = useState("");

  //Navegacao do react-router
  const navigate = useNavigate();

  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        localStorage.setItem("token", session.access_token);
        console.log("Token salvo no localStorage:", session.access_token);
      }
    });
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setMensagem("Entrando...");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginSenha,
    });

    if (data.session) {
      const token = data.session.access_token;
      localStorage.setItem("token", token);
    }

    if (error) {
      setMensagem("Erro no login: " + error.message);
    } else {
      setMensagem("Login realizado com sucesso!");
      console.log("Usuário logado:", data.user);
      navigate("/plano");
    }
  }

  async function handleCadastro(e) {
    e.preventDefault();
    setMensagem("Cadastrando");

    const { data, error } = await supabase.auth.signUp({
      email: cadastroEmail,
      password: cadastroSenha,
      options: {
        data: { nome: cadastroNome },
      },
    });

    if (error) {
      setMensagem("Erro ao cadastrar: " + error.message);
    } else {
      setMensagem("Cadastro realizado! Verifique seu e-mail.");
      console.log("Usuário criado:", data.user);
    }
  }

  return (
    <>
      <div className="container">
        <div className="form">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Senha"
              value={loginSenha}
              onChange={(e) => setLoginSenha(e.target.value)}
              required
            />
            <button type="submit">Entrar</button>
          </form>
        </div>

        <div className="divider"></div>

        <div className="form">
          <h2>Criar Conta</h2>
          <form onSubmit={handleCadastro}>
            <input
              type="text"
              placeholder="Nome completo"
              value={cadastroNome}
              onChange={(e) => setCadastroNome(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={cadastroEmail}
              onChange={(e) => setCadastroEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Senha"
              value={cadastroSenha}
              onChange={(e) => setCadastroSenha(e.target.value)}
              required
            />
            <button type="submit">Cadastrar</button>
          </form>
        </div>
      </div>

      {/* Mensagem de status */}
      {mensagem && <p className="mensagem">{mensagem}</p>}
    </>
  );
}

export default App;
