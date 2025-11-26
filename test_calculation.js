// Test Mechanical Power Calculation
const RR = 15;          // breaths/min
const VTe = 0.5;        // liters
const Picco = 30;       // cmH2O
const Plateau = 25;     // cmH2O
const PEEP = 5;         // cmH2O

const MP = 0.098 * RR * VTe * (Picco - 0.5 * (Plateau - PEEP));

console.log('Input values:');
console.log('RR:', RR);
console.log('VTe:', VTe);
console.log('Picco:', Picco);
console.log('Plateau:', Plateau);
console.log('PEEP:', PEEP);
console.log('\nCalculation:');
console.log('MP =', MP.toFixed(1), 'J/min');
console.log('\nStatus:');
if (MP < 12) console.log('✅ NORMAL (< 12 J/min)');
else if (MP <= 17) console.log('⚠️ WARNING (12-17 J/min)');
else console.log('⛔ CRITICAL (> 17 J/min)');
