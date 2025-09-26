# 🍔 Cardápio Online

Sistema de cardápio online com pedidos via QR code desenvolvido com Docker, Laravel e React.

## 🚀 Tecnologias

- **Backend:** Laravel (PHP)
- **Frontend:** React.js
- **Database:** MySQL
- **Containerização:** Docker + Docker Compose
- **Deploy:** Google Cloud Run (para produção)

## 📦 Serviços Docker

- `mysql`: Banco de dados MySQL
- `backend`: API Laravel
- `frontend`: Aplicação React
- `phpmyadmin`: Interface de administração do MySQL

## 🛠️ Como executar

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/cardapio-online.git
cd cardapio-online

# Inicie os containers
docker-compose up --build

# Acesse as aplicações:
# Frontend: http://localhost:3000
# Backend:  http://localhost:8000  
# PHPMyAdmin: http://localhost:8080
```
## 👥 Desenvolvimento

Projeto Integrador desenvolvido pelos alunos da Univesp com Docker para garantir consistência entre ambientes.
