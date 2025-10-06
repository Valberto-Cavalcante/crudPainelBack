require('dotenv').config({ path: __dirname + '/.env' });
const db = require('./db');
const roleModel = require('./models/roleModel'); // ajusta o caminho se precisar

async function createAdminRoleIfNotExists() {
  try {
    console.log('Verificando se o role "admin" existe...');

    const existingAdminRole = await roleModel.getRoleByName(db, 'admin');

    if (existingAdminRole) {
      console.log('⚠️ Role "admin" já existe. Nada a fazer.');
      return;
    }

    console.log('Role "admin" não encontrado. Criando...');

    const roleData = {
      name: 'admin',
      description: 'Role administrativo com acesso total ao sistema'
    };

    const newRole = await roleModel.createRole(db, roleData);

    if (newRole) {
      console.log('✅ Role "admin" criado com sucesso!');
    } else {
      console.log('❌ Erro: Não foi possível criar o role "admin".');
    }

  } catch (err) {
    console.error('❌ Erro ao verificar/criar role "admin":', err);
  }
}

createAdminRoleIfNotExists().then(() => {
  console.log('🎉 Processo finalizado.');
  process.exit(0);
}).catch(err => {
  console.error('💥 Erro fatal:', err);
  process.exit(1);
}); 