import { useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "./supabaseClient";
import "./plano.css";
import { useNavigate } from "react-router-dom";

export default function Plano() {
  const [tema, setTema] = useState("");
  const [etapa, setEtapa] = useState("");
  const [disciplina, setDisciplina] = useState("");
  const [carregando, setCarregando] = useState(false);

  const [resultado, setResultado] = useState(null);

  const [getResultado, setGetResultado] = useState([]);

  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleGerarPlano = async (e) => {
    e.preventDefault();
    setResultado(null);
    setCarregando(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/gerar-plano`,
        { tema, etapa, disciplina },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResultado(response.data.plano);
      setGetResultado((prev) => [
        {
          id: response.data.plano.id,
          tema: response.data.plano.tema,
          disciplina: response.data.plano.disciplina,
          etapa: response.data.plano.etapa,
          plano_json: response.data.plano,
        },
        ...prev,
      ]);
    } catch (error) {
      console.error("Erro ao gerar plano:", error);
      setResultado("Erro ao gerar plano de aula.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("Token não encontrado");
      return;
    }

    const fetchPlanos = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/listar-planos`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setGetResultado(response.data);
      } catch (error) {
        console.error("Erro ao buscar planos:", error);
      }
    };

    fetchPlanos();
  }, []);

  const handleExcluirPlano = async (e, id) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/excluir-plano/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Atualiza a lista removendo o plano deletado
      setGetResultado((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Erro ao excluir plano:", error);
    }
  };

  return (
    <>
      <aside className="sidebar">
        <h3 className="sidebar-title">Meus Planos</h3>

        <ul className="sidebar-list">
          {getResultado?.length === 0 && <li>Nenhum plano salvo.</li>}
          {getResultado.map((plano, index) => (
            <li
              key={plano.id || index}
              className="sidebar-item"
              onClick={() => setResultado(plano.plano_json)}
            >
              <strong>{plano.disciplina}</strong>
              <br /> <br /> {plano.tema}
              <br />
              <br />
              <button
                className="btn-excluir"
                onClick={(e) => handleExcluirPlano(e, plano.id)}
              >
                {" "}
                Excluir
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <button className="btn-logout" onClick={handleLogout}>
        Logout
      </button>

      <div className="container">
        <div className="form">
          <h2>Gerar Plano de Aula</h2>
          <form onSubmit={handleGerarPlano}>
            <input
              type="text"
              placeholder="Disciplina"
              value={disciplina}
              onChange={(e) => setDisciplina(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Tema/Tópico da aula"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Etapa / Ano escolar"
              value={etapa}
              onChange={(e) => setEtapa(e.target.value)}
              required
            />
            <button type="submit">Gerar plano de aula</button>
          </form>
        </div>

        {carregando === true && (
          <div className="resultado">
            <h3>Gerando plano, aguarde...</h3>
          </div>
        )}

        {resultado && (
          <div className="resultado">
            <h3>Plano gerado:</h3>
            <p>
              <strong>Disciplina:</strong> {resultado.disciplina}
            </p>
            <p>
              <strong>Tema:</strong> {resultado.tema}
            </p>
            <p>
              <strong>Etapa escolar:</strong> {resultado.etapa}
            </p>

            <p>
              <strong>Indrodução Lúdica:</strong> <br /> <br />{" "}
              {resultado.introducao_ludica}
            </p>

            <div className="passo-a-passo-container">
              <h4>Passo a Passo:</h4>

              <ul className="passo-lista">
                {resultado.passo_a_passo.map((passo, index) => (
                  <li key={index} className="passo-item">
                    <strong>{passo.titulo}</strong>
                    <p className="passo-descricao">{passo.descricao}</p>
                  </li>
                ))}
              </ul>
            </div>

            <p>
              <strong>Rubrica de avaliação:</strong> <br /> <br />
              {resultado.rubrica_avaliacao}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
