#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

const tests = [
  'get-token.js',
  'test-user-setup.js', 
  'test-order.js',
  'test-websocket.js',
  'test-status-update.js',
  'test-websocket-complete.js'
];

async function runTest(testFile) {
  return new Promise((resolve) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 EJECUTANDO: ${testFile}`);
    console.log(`${'='.repeat(60)}`);
    
    const child = spawn('node', [testFile], {
      cwd: __dirname,
      stdio: 'inherit'
    });

    child.on('close', (code) => {
      console.log(`\n✅ ${testFile} terminó con código: ${code}`);
      resolve(code);
    });

    child.on('error', (error) => {
      console.error(`❌ Error ejecutando ${testFile}:`, error);
      resolve(1);
    });
  });
}

async function runAllTests() {
  console.log('🚀 INICIANDO SUITE DE TESTS PARA NEIGHBORHOOD SHOPS');
  console.log(`📅 Fecha: ${new Date().toLocaleString()}`);
  console.log(`📂 Directorio: ${__dirname}`);
  
  const results = [];
  
  for (const test of tests) {
    const result = await runTest(test);
    results.push({ test, result });
    
    // Pausa breve entre tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Resumen final
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 RESUMEN DE RESULTADOS');
  console.log(`${'='.repeat(60)}`);
  
  results.forEach(({ test, result }) => {
    const status = result === 0 ? '✅ ÉXITO' : '❌ FALLO';
    console.log(`${status} - ${test}`);
  });
  
  const failures = results.filter(r => r.result !== 0).length;
  const successes = results.filter(r => r.result === 0).length;
  
  console.log(`\n📈 ESTADÍSTICAS:`);
  console.log(`   ✅ Tests exitosos: ${successes}/${tests.length}`);
  console.log(`   ❌ Tests fallidos: ${failures}/${tests.length}`);
  console.log(`   📊 Tasa de éxito: ${Math.round((successes / tests.length) * 100)}%`);
  
  if (failures === 0) {
    console.log('\n🎉 ¡TODOS LOS TESTS PASARON EXITOSAMENTE!');
  } else {
    console.log(`\n⚠️  ${failures} test(s) presentaron problemas.`);
  }
}

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n🛑 Tests interrumpidos por el usuario');
  process.exit(0);
});

runAllTests().catch(console.error);
