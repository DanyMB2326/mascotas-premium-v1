/* global process */
/**
 * scripts/setAdminRole.js
 * ─────────────────────────────────────────────────────────────
 * Script de configuración inicial: asigna role='admin' a un
 * usuario ya registrado en Firebase Auth.
 *
 * USO:
 *   node scripts/setAdminRole.js <uid-del-usuario>
 *   node scripts/setAdminRole.js TJ3s8KxN2vQaBcDeFgHi
 *
 * REQUISITOS:
 *   npm install firebase-admin
 *   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
 *   (descarga serviceAccountKey desde Firebase Console →
 *    Configuración del proyecto → Cuentas de servicio)
 *
 * ⚠️  Ejecutar UNA SOLA VEZ para crear el primer admin.
 *     Después, el admin puede gestionar roles desde el panel.
 * ─────────────────────────────────────────────────────────────
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore }        from 'firebase-admin/firestore';
import { getAuth }             from 'firebase-admin/auth';
import { readFileSync }        from 'fs';

const uid = process.argv[2];

if (!uid) {
  console.error('❌  Uso: node scripts/setAdminRole.js <uid>');
  process.exit(1);
}

// Inicializa Admin SDK
const serviceAccount = JSON.parse(
  readFileSync('./serviceAccountKey.json', 'utf8')
);

initializeApp({ credential: cert(serviceAccount) });

const db   = getFirestore();
const auth = getAuth();

async function setAdmin(uid) {
  // 1. Verifica que el usuario exista en Auth
  const userRecord = await auth.getUser(uid);
  console.log(`✅  Usuario encontrado: ${userRecord.email}`);

  // 2. Actualiza el documento en Firestore
  await db.collection('users').doc(uid).set(
    {
      role:      'admin',
      updatedAt: new Date().toISOString(),
    },
    { merge: true }   // No sobreescribe campos existentes (mascotas, etc.)
  );

  console.log(`🔑  role='admin' asignado en Firestore para uid: ${uid}`);

  // 3. (Opcional) Establece Custom Claim en Firebase Auth
  //    Esto evita la lectura extra de Firestore en cada regla.
  //    Si lo habilitas, actualiza isAdmin() en firestore.rules:
  //      function isAdmin() {
  //        return isSignedIn() && request.auth.token.role == 'admin';
  //      }
  //
  // await auth.setCustomUserClaims(uid, { role: 'admin' });
  // console.log(`🏷️   Custom claim role='admin' establecido en Auth`);

  console.log('\n🎉  ¡Listo! El usuario puede acceder al dashboard en /admin');
}

setAdmin(uid).catch(err => {
  console.error('❌  Error:', err.message);
  process.exit(1);
});