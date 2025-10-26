import express from "express";
import { supabase } from "./connections/supabaseClient.js";
import { gemini } from "./connections/geminiClient.js";

const router = express.Router();

router.post("/gerar-plano", async (req, res) => {
  try {
    const { tema, etapa, disciplina } = req.body;

    if (!tema || !etapa || !disciplina) {
      return res
        .status(400)
        .json({ error: "Tema, etapa e disciplina são obrigatórios" });
    }

    const prompt = `Crie um plano de aula detalhado para a disciplina ${disciplina} ensinando ${tema} para um aluno da etapa ${etapa}.
O plano deve incluir os seguintes campos em JSON:
{
 "tema": "",
 "etapa": "",
 "disciplina": "",
 "introducao_ludica": "",
 "objetivo_bncc": "",
 "passo_a_passo": [],
 "rubrica_avaliacao": ""
}

Gere a resposta exatamente neste formato JSON para que possamos consumir no front-end.`;

    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const planoTexto = response.text;

    //convertendo a resposta para json
    let plano;
    try {
      plano = JSON.parse(planoTexto.replace(/```json|```/g, "").trim());
    } catch (err) {
      console.error("Erro ao parsear JSON do Gemini:", err);
      return res.status(500).json({ error: "Falha ao gerar plano de aula." });
    }

    //Pega o token do front (gerado pelo supabase)
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token de autenticação ausente." });
    }
    const token = authHeader.split(" ")[1];

    // Verificar token no Supabase
    const { data: userData, error: userError } = await supabase.auth.getUser(
      token
    );
    if (userError || !userData?.user) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }
    //depois de autenticar, pega o id do usuario no banco
    const userId = userData.user.id;

    //  Salvar no Supabase vinculando ao user_id
    const { data, error } = await supabase.from("plano_estudo").insert([
      {
        usuario_id: userId,
        disciplina: disciplina,
        tema: tema,
        etapa: plano.etapa,
        plano_json: plano,
      },
    ]);

    if (error) {
      console.error("Erro ao salvar no Supabase:", error);
      return res
        .status(500)
        .json({ error: "Não foi possível salvar no banco." });
    }

    res.json({ plano });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
});

router.get("/listar-planos", async (req, res) => {
  try {
    //pegando token do front
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token ausente." });
    }

    const token = authHeader.split(" ")[1];

    //autenticando usuario usando o token
    const { data: userData, error: userError } = await supabase.auth.getUser(
      token
    );

    if (userError || !userData?.user) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }

    const userId = userData.user.id;

    // Busca planos do usuário autenticado
    const { data, error } = await supabase
      .from("plano_estudo")
      .select("id, tema, disciplina, etapa, plano_json")
      .eq("usuario_id", userId)
      .order("id", { ascending: false });

    if (error) {
      console.error("Erro ao buscar planos:", error);
      return res.status(500).json({ error: "Erro ao buscar planos." });
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
});

// DELETE /excluir-plano/:id
router.delete("/excluir-plano/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "ID do plano ausente" });

    // Pega o token do header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token ausente." });
    }
    const token = authHeader.split(" ")[1];

    // Valida o usuário no Supabase
    const { data: userData, error: userError } = await supabase.auth.getUser(
      token
    );
    if (userError || !userData?.user) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }
    const userId = userData.user.id;

    // Exclui apenas se o plano pertencer ao usuário
    const { data, error } = await supabase
      .from("plano_estudo")
      .delete()
      .eq("id", id)
      .eq("usuario_id", userId);

    if (error) {
      console.error("Erro ao excluir plano:", error);
      return res
        .status(500)
        .json({ error: "Não foi possível excluir o plano." });
    }

    res.json({ message: "Plano excluído com sucesso." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
});

export default router;
