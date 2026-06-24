const { execSync } = require('child_process');
try {
  execSync('npx prisma validate', { stdio: 'inherit', env: { ...process.env, DATABASE_URL: "postgresql://dummy:dummy@localhost:5432/dummy" }});
} catch (e) {
  console.log("Failed");
}
