# Dante Clube

Construir o portal 'Dante Clube', o clube de benefícios oficial e gratuito do Universo Querido Dante.

Dados de integração do Supabase principal fornecidos pelo usuário:
URL principal: https://kpplssyiehosifuejobr.supabase.co
Anon Key principal: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwcGxzc3lpZWhvc2lmdWVqb2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3OTAwOTUsImV4cCI6MjEwMTM2NjA5NX0.lFhMcypc7raL_LiBMdYsxbKPgK29tso0sDwwg-MOaVc

Locked:
- Nome oficial do portal: Dante Clube. Rótulo de membro: 'Associado'.
- Identidade visual: Tema dark cósmico profundo (fundos em #0b0613 e #120a22), acentos em neon magenta/rose (#ff5e9d, #ec1170) combinando perfeitamente com o logotipo anexado (dc4a84ff-496e-45c5-9aea-ed33173f7d04), e verde esmeralda para status 'Ativo'. Sem dourado. Tipografia: Fraunces para títulos expressivos, Plus Jakarta Sans para interface e Fredoka para detalhes amigáveis.
- Logo e Avatar do Dante: Usar o logotipo oficial e o avatar circular recortado do Dante (do anexo dc4a84ff-496e-45c5-9aea-ed33173f7d04) como assets estáticos no projeto com cache local no navegador para consumo zero de transferência do Supabase.
- Home Pública (sem login):
  - Boas-vindas: 'Bem-vindo ao Dante Clube, o clube de benefícios do Universo Querido Dante. Participe, é grátis!'
  - Avatar circular oficial do Dante no topo com selo '100% Gratuito'.
  - Botão Primário: 'Entrar como Associado' (abre formulário com abas Login e Cadastro).
  - Botão Secundário: 'Acesso Parceiro & Gestão' (login para parceiros e admin).
  - Botão Terciário: 'Visitar Universo Dante' (link para https://queridodante.site).
  - Rodapé institucional: links para 'Termos de Uso', 'Diretrizes da Comunidade' e 'Política de Privacidade'.
- Autenticação e Cadastro de Associados:
  - Cadastro e login feitos diretamente no clube conectando ao Supabase do site principal (URL e Anon Key acima). Não exigir CPF. No cadastro, checkbox obrigatório de aceite dos Termos de Uso e Política de Privacidade.
  - Geração de Matrícula/ID do Associado no formato D-[SEQUENCIAL] iniciando em D-100 (ex: D-100, D-101, D-102...).
- Autenticação de Parceiros e ADMIN:
  - Autenticação local no banco do clube. Criar conta padrão de ADMIN já ativa e funcional (ex: admin@danteclube.com / senha segura exibida na tela de login de teste para facilitar acesso imediato).
- Navegação do Associado (4 abas inferiores fixas):
  1. Início: Cabeçalho com saudação e avatar do Dante, status do associado, grade de 'Acesso Rápido' com ícones circulares suaves inspirada no anexo a02d1819-9964-4769-b11d-75b2a4b410c0, e carrossel de destaques da semana.
  2. Benefícios: Aba única e unificada com campo de busca e filtros/sub-abas em pílulas deslizantes ('Todos', 'E-books', 'Lojas Online', 'Presencial'). Cards com capa/logo, tag de desconto, botão 'Copiar Cupom' com toast de feedback, e link de ação ('Abrir no Google Play', 'Ir para a Loja', ou 'Ver Endereço').
  3. Carteirinha: Crachá digital interativo inspirado nos anexos 0a3ec9b7-facf-42e4-8127-94e63e85b898 e c767643c-c869-4fb4-b191-fe431c9d153c:
     - Frente: Logotipo do Universo Dante no cabeçalho, avatar do usuário, nome, rótulo 'Associado', selo verde 'Ativo', ID em destaque (ex: D-100), data 'Desde' e texto 'Toque para virar'.
     - Verso (interativo ao clique): QR Code para validação rápida, código de validação, e botões 'Compartilhar' e 'Salvar PDF / Imagem'.
  4. Missões: Área de 'Missões & Recompensas' listando links de indicação e bônus externos (ex: Microsoft Rewards, Amazon) com instruções passo a passo para o leitor pontuar e resgatar prêmios nas plataformas terceiras. Sem sistema interno de pontos.
- Painel do Parceiro:
  - Gerenciar suas próprias ofertas e cupons.
  - Validador de Associados: tela rápida para consultar associado por ID (D-100) ou escanear QR Code, retornando status Ativo/Inativo e nome.
- Painel do ADMIN:
  - Gestão de Associados (inspirada no anexo 63327758-d7c5-4727-ac73-31a12ad0db5e): listar, buscar, ver dados e alterar status (Ativo / Descredenciado).
  - Gestão de Lojas e Ofertas: cadastrar lojas diretamente SEM necessidade de conta para o parceiro, com opção de definir cupom, link, e categoria.
  - Gestão (CRUD) de Categorias de Benefícios: criar, editar nome e ícone, e reordenar.
  - Editor das páginas institucionais: Termos de Uso, Diretrizes e Política de Privacidade.
  - Configuração do link para o Universo Dante.

Open:
- Banco de dados do clube no Lovable Cloud para armazenar lojas, categorias, cupons, status de associados do clube, ofertas e páginas institucionais.
- Estados vazios acolhedores, transições suaves, responsividade para celulares e desktops.
- Armazenamento em cache do avatar e logo para garantir performance rápida e economia de dados.

build a real working app, not a clickable prototype; the screen and kit files show layout, content and look (a wireframe's, structure only) and are never code to copy. The screens are the moments the user designed, not the whole product. Before building, walk through each flow as its user would and design what the pictures leave out, as a product designer would for this product: the steps a flow needs to finish and how the app responds to what the user does, including the moments its users will actually run into, like waiting on something or finding nothing yet. Add nothing a user of this product would never meet, and keep an app the user wants simple, simple. Never leave a step the product's core flows need as "coming soon", unless the brief says the user chose to. Where such a step needs an outside service, build every part up to it and say in your reply what's left to connect. Fill product gaps only, never a look the design set: an added step reuses the UI kit's tokens, chrome and parts and the nearest designed screen's layout, with no new visual direction. Look at every screen's picture before writing code; design.md says which picture or sheet holds each screen. Open the UI kit's shells and parts HTML for the header, tab bar, composer and components, not only its tokens. Use each finished screen's copy exactly as design.md lists it; never invent copy for one. A wireframe under design.md's Wireframes gives structure only: build it in the design's look, as design.md says. The screens' photos are placeholders for the mockups only: replace every photo design.md lists with the user's own upload for it, else as design.md says (a photo without people re-composed with imagegen--edit_image from it as a reference, a photo of people generated from its brief and never from the photo), and ship no set photo or its URL. For a design that came with no design.md, every photo on assets.lovable.dev or images.unsplash.com is a set photo: replace it with the user's own upload for it, else a new image generated for its slot, any person in it one who doesn't exist, never from the photo or a picture showing it. Build and check each screen at the canvas it was drawn at: phone 393×764, tablet landscape 1133×744, tablet portrait 744×1133, desktop 1280×832. After building, screenshot the app at those sizes and states, compare each finished screen with its picture, and fix every visual difference you didn't choose; check a wireframe's screen against its structure, never its grey look. End your reply with "Changed from the mockups": each deliberate change and why, and "Added beyond the mockups": each step, state or interaction you built that no screen shows.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/10a2a5d7-21b7-4667-a60c-b07786d09cbb).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
