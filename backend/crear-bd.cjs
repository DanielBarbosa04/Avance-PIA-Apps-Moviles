const m = require('mariadb');

const clave = process.env.DATABASE_PASSWORD;
if (!clave || clave === 'CONTRASENA') {
  console.log('Primero escribe tu contrasena en backend/.env (DATABASE_PASSWORD).');
  process.exit(1);
}

(async () => {
  const c = await m.createConnection({ host: '127.0.0.1', port: 3306, user: 'root', password: '' });
  await c.query('CREATE DATABASE IF NOT EXISTS dynamd');
  await c.query('CREATE DATABASE IF NOT EXISTS dynamd_shadow');
  await c.query("CREATE USER IF NOT EXISTS 'dynamd_app'@'localhost' IDENTIFIED BY ?", [clave]);
  await c.query("ALTER USER 'dynamd_app'@'localhost' IDENTIFIED BY ?", [clave]);
  await c.query("GRANT ALL PRIVILEGES ON dynamd.* TO 'dynamd_app'@'localhost'");
  await c.query("GRANT ALL PRIVILEGES ON dynamd_shadow.* TO 'dynamd_app'@'localhost'");
  await c.query('FLUSH PRIVILEGES');
  console.log('LISTO: base dynamd, base dynamd_shadow y usuario dynamd_app creados.');
  await c.end();
})().catch((e) => {
  console.log('FALLA:', e.code, e.message);
  process.exit(1);
});
