

# 🚀 Setup e Instalação

Este projeto é um Monorepo com Front-end e Back-end em subdiretórios. Siga os passos abaixo para configurar e instalar as dependências.

### Pré-requisitos
* **[Node.js]**
* **[Git]**

###  Clonar o Projeto

   Clone o repositório para sua máquina:


    
    git clone https://github.com/RafaelBerger/escribo-teste2.git
    cd escribo-teste2
    

### Instalar as Dependências

É necessário instalar as dependências em cada pasta (Front e Back).

1.  **Instalação de dependências Front-end:**
    ```bash
    cd ./escribo-front-teste2
    npm install
    ```
2.  **Instalação de dependências Back-end:**
    ```bash
    cd ../escribo-back-teste2
    npm install
    ```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz de cada pasta (`escribo-front-teste2` e `escribo-back-teste2`) e adicione as variáveis necessárias.

#### .ENV do Front-End

| Variável | Descrição |
| :--- | :--- |
| `VITE_SUPABASE_URL` | URL do seu projeto supabase (termina em: `.supabase.co`). |
| `VITE_SUPABASE_ANON_KEY` | Chave de conexão pública com o Supabase. |
| `VITE_BACKEND_URL` | URL do backend (produção ou local) |

#### .ENV do Back-End

| Variável | Descrição |
| :--- | :--- |
| `SUPABASE_URL` | URL do seu projeto supabase (termina em: `.supabase.co`)
| `SUPABASE_ANON_KEY` |  Chave de conexão pública com o Supabase. |
| `GEMINI_API_KEY` |  Chave da API do Gemini. |

### 4. Iniciar o Projeto

Para rodar a aplicação, abra **duas janelas de terminal** e execute o Back-end e o Front-end em paralelo.

1.  **Iniciar o Back-end (API):**
    Em uma janela do terminal:
    ```bash
    npm start
    ```

2.  **Iniciar o Front-end (Vite/Aplicação Web):**
    Na outra janela do terminal:
    ```bash
    npm run dev
    ```



# Tarefas do Teste 

#### (Etapas do Desenvolvimento)


## 1. Pesquisa e Escolha do Modelo





Escolhi **Gemini 2.5-Flash-Lite**. Esta versão é a mais eficiente em termos de **velocidade e custo-benefício** para a tarefa específica de geração de planos de aula, oferecendo a **menor latência**. Por ser um projeto de escopo focado e rápido, o Flash-Lite garante uma resposta mais rapida ao usuário. Caso o projeto escalasse para envolver prompts mais longos ou raciocínio complexo, migraríamos para o **Gemini 2.5 Flash**, que oferece uma janela de contexto maior e capacidades ligeiramente superiores, mantendo ainda a alta performance.



---

## 2: Modelagem de Dados



####  Scripts SQL de Criação das Tabelas

Não criei tabela de usuario pois o supabase ja tem uma area própria para armazenar e autenticar usuarios (referenciei os usuarios do supabase na FK)


**Estrutura da Tabela `plano_estudo`**

| Coluna | Tipo de Dados | Descrição |
| :--- | :--- | :--- |
| `id` | `uuid` | Chave primária. Identificador único do plano de estudo. |
| `usuario_id` | `uuid` | Chave estrangeira que referencia `auth.users.id`. Vincula o plano ao usuário que o criou, com exclusão em cascata (`on delete cascade`). |
| `disciplina` | `text` | Armazena a disciplina informada. |
| `tema` | `text` | Armazena o tema principal solicitado. |
| `etapa` | `text` | Armazena a etapa de ensino ou nível do plano. |
| `plano_json` | `jsonb` | Armazena a resposta completa e estruturada da IA em formato JSON, permitindo consultas eficientes. |
| `created_at` | `timestamp` | Timestamp automático da criação do registro. |


CRIAÇÃO DE TABELAS:
```bash
create table plano_estudo (
    id uuid primary key default uuid_generate_v4(),
    usuario_id uuid not null references auth.users(id) on delete cascade,
    disciplina text not null,
    tema text not null,
    etapa text not null,
    plano_json jsonb not null,
    created_at timestamp default now()
)

```










#  Desafios Encontrados e Soluções

Esta seção detalha os principais obstáculos técnicos superados durante o desenvolvimento do fluxo de trabalho.


### Desafio 1: Formatação do JSON na resposta do prompt da IA

O maior desafio inicial foi converter a resposta do prompt em JSON.

* **Solução:** O problema foi solucionado com o auxílio da própria IA para fazer essa converção.



### Desafio 2: Implementação da Autenticação e CRUD com Supabase

Houve uma curva de aprendizado na implementação do fluxo de autenticação do Supabase. A dificuldade era garantir que as operações de CRUD no banco de dados utilizassem corretamente o *token* de sessão do usuário para autorizar as ações.

* **Solução:** A solução envolveu um estudo para entender como utilizar o SDK do Supabase de forma coerente. Implementei a autenticação tanto no Front-end (para gerenciar a sessão) quanto no Back-end (para usar o token de sessão na validação das requisições de CRUD), garantindo a integridade dos dados e o uso correto das políticas de segurança.




# Decisões Técnicas Tomadas


### 1. Performance e Escolha da IA (Gemini 2.5 Flash-Lite)

A decisão primária foi garantir que o usuário recebesse o plano de aula o mais rápido possível.

* **Escolha:** Optamos pelo modelo **Gemini 2.5 Flash-Lite**.
* **Justificativa:** Para este tipo de aplicação (geração de conteúdo estruturado), o Flash-Lite oferece a **menor latência** e o melhor **custo-benefício**. A prioridade foi a **velocidade da resposta**, que é crucial para a experiência do usuário, sem comprometer a qualidade do plano de aula gerado pela IA. (Caso fosse um projeto maior, usaria o Gemini 2.5 Flash)

### 2. Segurança e Individualização (Página de Login e Autenticação)

A segurança e a individualização dos dados foram tratadas como requisitos essenciais.

* **Implementação:** Foi desenvolvida uma **página de Login completa**, utilizando o sistema de autenticação do **Supabase**.
* **Justificativa:** A implementação do Login não é apenas um requisito funcional, mas uma **decisão de segurança** que demonstra que a aplicação é capaz de:
    1.  **Isolar os dados:** Cada usuário só pode visualizar e salvar seus próprios planos de estudo, garantindo a privacidade.
    2.  **Validar o fluxo de autenticação:** Mostra que a integração do Supabase está completa, utilizando o token de sessão do usuário para autorizar todas as operações de CRUD no banco de dados.

