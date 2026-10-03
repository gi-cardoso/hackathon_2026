# REST Client API Tests

Esta pasta contém a infraestrutura de testes HTTP baseada em arquivos `.http`.

## Pré-requisitos
1. Instale a extensão **REST Client** (autor: Huachao Mao) no VS Code.
2. Certifique-se de que o backend esteja em execução (por exemplo, `npm run dev`) e acessível em `http://localhost:3000`.

## Como Executar
Abra qualquer arquivo `.http` no VS Code. Você notará que a extensão adiciona um botão clicável `Send Request` (ou `Enviar Requisição`) acima de cada método HTTP. Basta clicar neste botão para disparar a chamada.

## Configuração de Variáveis
A variável `@baseUrl = http://localhost:3000/api` está configurada no topo dos arquivos. Isso previne duplicação da URL base.
Em casos futuros, quando rotas estiverem protegidas, você deve definir `@token = SEU_JWT_AQUI` no topo do arquivo correspondente e utilizá-la passando `Authorization: Bearer {{token}}` nos cabeçalhos.

## Ordem Recomendada
1. Execute **02-health.http** para confirmar que o sistema está no ar.
2. Execute **00-auth.http** para testar as capacidades de login. (Pegue o token daqui para uso manual em testes que exigirem, futuramente).
3. Execute **01-usuarios.http** para criar, buscar e deletar usuários. Aconselha-se atualizar a variável `@id_usuario` baseada no ID retornado após a criação de um usuário.

## Arquivos Disponíveis
* `00-auth.http`: Contém as chamadas relativas ao controlador de autenticação, englobando testes de sucesso no login interno e retornos de erro de validação/credenciais.
* `01-usuarios.http`: Contém todas as operações de CRUD da rota `/api/users`. Mapeia requisições `POST`, `GET`, `PUT` e `DELETE`, incluindo fluxos para ID inexistente e a validação do endpoint `PUT` (atualmente retornando 501 Não implementado).
* `02-health.http`: Contém chamadas para os endpoints não versionados ou públicos do sistema (Health Check, Root URL e validação de 404).

## Problemas Conhecidos Identificados (Issue Tracking)
De acordo com os requisitos de auditoria e validação desta suíte, identificou-se o seguinte:

- **Segurança nas Rotas de Usuário**: Atualmente, as rotas sob o módulo `/api/users` não se encontram integradas com o `AuthMiddleware`. Como não há middleware de proteção instanciado no `user.routes.ts`, as requisições estão **públicas**. Os arquivos do REST Client foram implementados baseados na *realidade* da arquitetura sem falsificar *headers* falsos de JWT, uma vez que a regra de negócio não deveria ser tocada.
- **Autorização (RBAC)**: Uma vez que as rotas estão públicas, não foi possível estruturar testes de Perfil/Autorização diretamente sobre módulos de negócio, devendo estes testes serem adicionados no futuro, quando os guardas forem devidamente ativados sobre os domínios.
