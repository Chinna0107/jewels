const fs = require('fs');
let content = fs.readFileSync('/Users/hemanthkancharla/jewelsbe/routes/auth.js', 'utf8');

content = content.replace(
  "await pool.query('UPDATE users SET name=$1, phone=$2, password_hash=$3, phone_verified=FALSE, email_verified=FALSE WHERE email=$4', [name, phone, hash, email]);",
  "await pool.query('UPDATE users SET name=$1, phone=$2, password_hash=$3, country=$5, phone_verified=FALSE, email_verified=FALSE WHERE email=$4', [name, phone, hash, email, country || null]);"
);

content = content.replace(
  "await pool.query('INSERT INTO users (name, email, phone, password_hash, phone_verified, email_verified) VALUES ($1,$2,$3,$4,FALSE,FALSE)', [name, email, phone, hash]);",
  "await pool.query('INSERT INTO users (name, email, phone, password_hash, country, phone_verified, email_verified) VALUES ($1,$2,$3,$4,$5,FALSE,FALSE)', [name, email, phone, hash, country || null]);"
);

fs.writeFileSync('/Users/hemanthkancharla/jewelsbe/routes/auth.js', content);
console.log('patched auth.js');
