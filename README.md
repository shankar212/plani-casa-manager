# PlaniTec - Gestão de Obras

Sistema de gestão de obras desenvolvido para o programa **Minha Casa Minha Vida**. O PlaniTec é uma aplicação web progressiva (PWA) moderna que facilita o acompanhamento e gerenciamento de projetos de construção.

## 🚀 Tecnologias Utilizadas

Este projeto foi construído com uma stack moderna focada em performance e experiência do desenvolvedor:

- **Frontend Core**: [React](https://react.dev/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Componentes UI**: [shadcn/ui](https://ui.shadcn.com/) (baseado em Radix UI)
- **Gerenciamento de Estado/Data Fetching**: [TanStack Query](https://tanstack.com/query/latest)
- **Backend/Banco de Dados**: [Supabase](https://supabase.com/)
- **PWA**: [Vite PWA Plugin](https://vite-pwa-org.netlify.app/) para suporte offline e instalabilidade.
- **Gráficos e Animações**: [Recharts](https://recharts.org/) & [Framer Motion](https://www.framer.com/motion/)

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:
- [Node.js](https://nodejs.org/) (versão 18 ou superior recomendada)
- npm (geralmente vem com o Node.js)

## 🔧 Instalação e Execução

Siga os passos abaixo para rodar o projeto localmente:

1. **Clone o repositório**
   ```bash
   git clone <URL_DO_SEU_REPOSITORIO>
   cd PlaniTec
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente**
   Crie um arquivo `.env` na raiz do projeto (se necessário) com as credenciais do Supabase.

4. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

5. **Acesse a aplicação**
   Abra seu navegador em `http://localhost:8080`.

## 📦 Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento.
- `npm run build`: Cria a versão de produção na pasta `dist`.
- `npm run preview`: Visualiza a versão de produção localmente.
- `npm run lint`: Executa a verificação de código com ESLint.

## 📱 Funcionalidades PWA

O PlaniTec é um PWA totalmente configurado. Isso significa que ele pode ser instalado como um aplicativo nativo em dispositivos móveis e desktops, além de possuir estratégias de cache para funcionamento offline ou em redes instáveis.

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.
