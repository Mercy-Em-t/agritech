const { execSync } = require('child_process');
try {
  execSync('npx prisma@5.22.0 validate', { stdio: 'inherit', env: { ...process.env, DATABASE_URL: "" }});
} catch (e) {
  console.log("Failed");
}
