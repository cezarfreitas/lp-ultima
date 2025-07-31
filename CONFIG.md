# Configuração do Sistema

Este sistema usa variáveis de ambiente para gerenciar configurações entre diferentes ambientes.

## Estrutura de Configuração

### Arquivos de Ambiente
- `.env` - Desenvolvimento local
- `.env.production` - Produção
- `.env.example` - Exemplo com todas as variáveis

### Módulo de Configuração
- `shared/config.ts` - Configuração centralizada e helpers de path

## Variáveis Principais

### Servidor
```env
NODE_ENV=development|production
PORT=8080
HOST=localhost
```

### Caminhos de Build
```env
BUILD_DIR=dist                 # Diretório de build do Vite
PUBLIC_DIR=public             # Diretório público alternativo
UPLOADS_DIR=uploads           # Diretório de uploads
STATIC_FILES_PATH=/app/public # Caminho absoluto em produção
```

### Base de Dados
```env
DB_HOST=148.230.78.129
DB_PORT=3307
DB_USER=ecko
DB_PASSWORD=***
DB_NAME=lp-ecko-db
DB_CONNECTION_LIMIT=10
```

## Como Usar

### Desenvolvimento
1. Copie `.env.example` para `.env`
2. Ajuste as variáveis conforme necessário
3. Execute `npm run dev`

### Produção (EasyPanel)
1. As variáveis são definidas automaticamente
2. Build usa `npm run build`
3. Servidor inicia com configuração de produção

## Helpers de Path

O módulo `shared/config.ts` oferece helpers para resolução de caminhos:

```typescript
import { config, paths } from './shared/config.js';

// Obter diretório de arquivos estáticos
const staticDir = paths.getStaticDir();

// Obter caminho do index.html
const indexPath = paths.getIndexPath();

// Obter diretório de uploads
const uploadsDir = paths.uploadsDir('subdir');
```

## Troubleshooting

### Problema: Arquivos estáticos não encontrados
- Verificar `BUILD_DIR` e `STATIC_FILES_PATH`
- Confirmar que `npm run build` gerou arquivos em `dist/`

### Problema: Configuração de base de dados
- Verificar variáveis `DB_*`
- Executar migração: `/migrate`

### Problema: Caminhos de upload
- Verificar `UPLOADS_DIR`
- Confirmar permissões de escrita
