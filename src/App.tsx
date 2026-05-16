'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

type Difficulty = 'facil' | 'medio' | 'dificil';
type Operation = '+' | '-' | '×' | '÷';

interface Problem {
  a: number | null; // null = hueco (?)
  b: number | null; // null = hueco (?)
  operation: Operation;
  result: number;
  missingValue: number; // lo que debe escribir el niño
}

export const App: React.FC = () => {
  // ==================== GAME STATE ====================
  const [difficulty, setDifficulty] = useState<Difficulty>('facil');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(
    null
  );
  const [message, setMessage] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // ==================== GENERACIÓN DE EJERCICIOS (MEJORADA) ====================
  const generateProblem = useCallback((): Problem => {
    const ops: Operation[] = ['+', '-', '×', '÷'];
    const operation = ops[Math.floor(Math.random() * ops.length)];
    const blankSide = Math.random() > 0.5 ? 'a' : 'b'; // lado del hueco

    const ranges = {
      facil: { min: 1, max: 10 },
      medio: { min: 1, max: 20 },
      dificil: { min: 1, max: 50 }
    };
    const { min, max } = ranges[difficulty];

    let a: number, b: number, result: number, missingValue: number;

    if (operation === '+') {
      a = Math.floor(Math.random() * (max - min + 1)) + min;
      b = Math.floor(Math.random() * (max - min + 1)) + min;
      result = a + b;
      missingValue = blankSide === 'a' ? a : b;
    } else if (operation === '-') {
      // Aseguramos resultado positivo
      b = Math.floor(Math.random() * (max - min + 1)) + min;
      a = b + Math.floor(Math.random() * (max - min + 1)) + min;
      result = a - b;
      missingValue = blankSide === 'a' ? a : b;
    } else if (operation === '×') {
      a = Math.floor(Math.random() * (max - min + 1)) + min;
      b = Math.floor(Math.random() * (max - min + 1)) + min;
      result = a * b;
      missingValue = blankSide === 'a' ? a : b;
    } else {
      // División exacta
      b = Math.floor(Math.random() * (max / 2)) + 2;
      const cociente = Math.floor(Math.random() * (max / b)) + 2;
      a = b * cociente;
      result = a / b;
      missingValue = blankSide === 'a' ? a : b;
    }

    return {
      a: blankSide === 'a' ? null : a,
      b: blankSide === 'b' ? null : b,
      operation,
      result,
      missingValue
    };
  }, [difficulty]);

  const newProblem = () => {
    const newProb = generateProblem();
    setProblem(newProb);
    setUserAnswer('');
    setFeedback(null);
    setMessage('');
    setIsShaking(false);
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  // ==================== VERIFICACIÓN ====================
  const checkAnswer = () => {
    if (!problem) return;

    const numAnswer = parseInt(userAnswer);

    if (numAnswer === problem.missingValue) {
      const points = 10 + streak * 2;
      setScore((prev) => prev + points);
      setStreak((prev) => prev + 1);
      setFeedback('correct');
      setMessage(
        streak >= 3 ?
          '¡Increíble! ¡Racha maestra! 🔥'
        : '¡Excelente! ¡Muy bien! 🎉'
      );

      setTimeout(() => {
        newProblem();
      }, 1600);
    } else {
      setStreak(0);
      setFeedback('incorrect');
      setMessage('Casi… ¡Inténtalo de nuevo! 💪');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') checkAnswer();
  };

  // ==================== INICIALIZACIÓN ====================
  useEffect(() => {
    newProblem();
  }, [difficulty]);

  // ==================== SCROLL SUAVE ====================
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className='min-h-screen bg-[#f8f9fe] font-sans text-[#191c1f] overflow-x-hidden'>
      {/* Navbar */}
      <header className='fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md shadow-[0_4px_30px_rgba(31,42,55,0.10)]'>
        <nav className='max-w-7xl mx-auto px-5 md:px-8 py-4 flex justify-between items-center'>
          <div className='text-2xl font-bold text-[#236296]'>
            Aprende Matemáticas Jugando
          </div>

          <ul className='hidden md:flex gap-8 text-sm font-medium'>
            {[
              'hero',
              'quienes',
              'pasos-original',
              'evidencias',
              'propuesta',
              'juego'
            ].map((id) => (
              <li key={id}>
                <button
                  onClick={() => scrollTo(id)}
                  className='hover:text-[#236296] transition-colors capitalize'
                >
                  {id === 'quienes' ?
                    'Nosotros'
                  : id === 'pasos-original' ?
                    'Pasos'
                  : id}
                </button>
              </li>
            ))}
          </ul>

          <button
            onClick={() => scrollTo('juego')}
            className='bg-[#236296] text-white px-6 py-2.5 rounded-full font-bold shadow-[0_4px_0_#004a79] active:translate-y-[3px] active:shadow-none transition-all hover:brightness-110'
          >
            ¡Jugar Ahora!
          </button>
        </nav>
      </header>

      <main className='pt-20'>
        {/* HERO */}
        <section
          id='hero'
          className='relative min-h-[85vh] flex items-center justify-center bg-gradient-to-br from-[#8ec5ff] to-[#ffe08a] overflow-hidden'
        >
          <div className='absolute inset-0 opacity-30 text-8xl pointer-events-none'>
            <div className='absolute top-20 left-10 animate-float'>➕</div>
            <div className='absolute bottom-32 right-12 animate-float-delay'>
              ➖
            </div>
            <div className='absolute top-1/3 right-1/4 animate-float'>✖</div>
            <div className='absolute bottom-1/4 left-1/5 animate-float-delay'>
              ➗
            </div>
          </div>

          <div className='text-center z-10 px-6 max-w-4xl'>
            <h1 className='text-5xl md:text-6xl font-black text-[#191c1f] leading-tight mb-6'>
              ¡Aprende Matemáticas Jugando!
            </h1>
            <p className='text-xl md:text-2xl text-[#41474f] mb-10'>
              Descubre el increíble mundo de los números con desafíos divertidos
              creados especialmente para ti.
            </p>
            <button
              onClick={() => scrollTo('juego')}
              className='bg-[#236296] text-white text-2xl font-bold px-12 py-5 rounded-full shadow-[0_6px_0_#004a79] hover:brightness-110 active:translate-y-1 active:shadow-none transition-all'
            >
              ¡Jugar Ahora!
            </button>
          </div>
        </section>

        {/* QUIÉNES SOMOS */}
        <section
          id='quienes'
          className='py-20 px-5 md:px-8 max-w-6xl mx-auto text-center'
        >
          <h2 className='text-4xl font-bold text-[#236296] mb-10'>
            Quiénes somos
          </h2>
          <div className='max-w-4xl mx-auto aspect-video bg-gray-200 rounded-3xl overflow-hidden shadow-xl mb-8'>
            <iframe
              className='w-full h-full'
              src='https://www.youtube.com/embed/dQw4w9WgXcQ'
              title='Presentación del proyecto'
              allowFullScreen
            />
          </div>
          <p className='text-lg max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow border border-[#c1c7d0]'>
            Somos un equipo de estudiantes que creamos este juego para ayudar a
            los niños a aprender matemáticas sin aburrirse.
          </p>
        </section>

        {/* 7 PASOS */}
        <div className='grid md:grid-cols-2'>
          <section
            id='pasos-original'
            className='py-20 px-8 bg-[#f2f3f8]'
          >
            <div className='max-w-xl mx-auto'>
              <h2 className='text-3xl font-bold text-[#236296] mb-10'>
                7 pasos del Ingeniero
              </h2>
              <div className='space-y-8'>
                {[
                  'Identificar el problema',
                  'Investigar el contexto',
                  'Definir criterios y restricciones',
                  'Idear posibles soluciones',
                  'Planificar la mejor opción',
                  'Construir / Prototipar',
                  'Probar, evaluar y mejorar'
                ].map((text, i) => (
                  <div
                    key={i}
                    className='flex gap-6 items-start'
                  >
                    <div className='text-6xl font-black text-[#8ec5ff] w-20 text-right'>
                      {(i + 1).toString().padStart(2, '0')}
                    </div>
                    <div className='pt-4 text-lg'>{text}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section
            id='pasos-aplicados'
            className='py-20 px-8 bg-[#baeddb]'
          >
            <div className='max-w-xl mx-auto'>
              <h2 className='text-3xl font-bold text-[#1d4f41] mb-10'>
                7 pasos aplicados a nuestro problema
              </h2>
              <div className='space-y-8 text-[#1d4f41]'>
                {[
                  'Detectamos que muchos niños se frustran con las matemáticas',
                  'Investigamos cómo los juegos aumentan la motivación',
                  'Definimos: 4 operaciones, feedback inmediato y mensajes positivos',
                  'Ideamos un juego de llenar espacios en blanco',
                  'Diseñamos interfaz amigable con colores pastel',
                  'Construimos el prototipo web con React',
                  'Probamos, ajustamos dificultad y mejoramos la experiencia'
                ].map((text, i) => (
                  <div
                    key={i}
                    className='flex gap-6 items-start'
                  >
                    <div className='text-6xl font-black text-[#98cbb9] w-20 text-right'>
                      {(i + 1).toString().padStart(2, '0')}
                    </div>
                    <div className='pt-4'>{text}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* EVIDENCIAS */}
        <section
          id='evidencias'
          className='py-20 px-5 md:px-8 bg-white'
        >
          <h2 className='text-4xl font-bold text-center text-[#236296] mb-16'>
            ¿Por qué necesitamos este juego?
          </h2>
          <div className='grid md:grid-cols-2 gap-8 max-w-5xl mx-auto'>
            {[
              [
                'UNESCO (2024)',
                'Solo el 44% de los niños alcanza competencia mínima en matemáticas al terminar primaria.'
              ],
              [
                'PISA 2022 (OCDE)',
                'El rendimiento en matemáticas cayó casi 15 puntos entre 2018 y 2022.'
              ],
              [
                'TIMSS 2023',
                'Estados Unidos registró una de las caídas más fuertes en matemáticas en décadas.'
              ],
              [
                'Meta-análisis (2020)',
                'La gamificación mejora significativamente el rendimiento y reduce la ansiedad matemática.'
              ]
            ].map(([source, quote], i) => (
              <div
                key={i}
                className='bg-white border border-[#c1c7d0] rounded-3xl p-8 shadow-xl'
              >
                <p className='text-lg italic mb-4'>“{quote}”</p>
                <p className='text-sm text-gray-500 font-medium'>{source}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PROPUESTA */}
        <section
          id='propuesta'
          className='py-20 px-8 bg-[#8ec5ff] text-center'
        >
          <div className='max-w-4xl mx-auto'>
            <h2 className='text-4xl font-bold text-[#045285] mb-8'>
              Nuestra Propuesta de Solución
            </h2>
            <p className='text-xl text-[#045285] leading-relaxed bg-white/70 p-10 rounded-3xl'>
              Un juego interactivo donde los niños llenan los espacios en blanco
              en las cuatro operaciones básicas y reciben inmediatamente si la
              respuesta es correcta, con mensajes positivos y animaciones que
              los motivan a continuar.
            </p>
          </div>
        </section>

        {/* ====================== JUEGO ====================== */}
        <section
          id='juego'
          className='py-20 px-5 bg-[#baeddb] min-h-screen flex flex-col items-center'
        >
          <h2 className='text-5xl font-bold text-[#265749] mb-12'>
            Zona de Juego
          </h2>

          <div className='w-full max-w-2xl'>
            {/* Dificultad */}
            <div className='flex justify-center gap-3 mb-10'>
              {(['facil', 'medio', 'dificil'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-8 py-3 rounded-full font-bold transition-all ${difficulty === d ? 'bg-[#265749] text-white shadow-lg scale-110' : 'bg-white text-[#265749] hover:bg-[#98cbb9]'}`}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>

            <div
              className={`bg-white rounded-3xl p-10 shadow-2xl border-4 border-[#98cbb9] transition-all ${isShaking ? 'animate-shake' : ''}`}
            >
              {/* Stats */}
              <div className='flex justify-between mb-8 text-sm'>
                <div>
                  Puntos:{' '}
                  <span className='font-bold text-2xl text-[#236296]'>
                    {score}
                  </span>
                </div>
                <div>
                  Racha:{' '}
                  <span className='font-bold text-2xl text-[#e1c471]'>
                    {streak} 🔥
                  </span>
                </div>
              </div>

              {/* Ejercicio */}
              {problem && (
                <div className='text-center mb-10'>
                  <div className='text-6xl font-bold text-[#191c1f] flex items-center justify-center gap-6'>
                    {problem.a ?? '?'}{' '}
                    <span className='text-[#236296]'>{problem.operation}</span>
                    {problem.b ?? '?'} <span className='text-[#265749]'>=</span>{' '}
                    {problem.result}
                  </div>
                </div>
              )}

              {/* Input */}
              <input
                ref={inputRef}
                type='number'
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={handleKeyPress}
                className='w-full text-center text-6xl py-6 rounded-2xl border-4 border-[#8ec5ff] focus:border-[#236296] outline-none transition-all'
                placeholder='Escribe aquí'
                autoFocus
              />

              {/* Feedback */}
              {feedback && (
                <div
                  className={`mt-6 text-6xl text-center transition-all ${feedback === 'correct' ? 'text-green-500 scale-110' : 'text-red-500'}`}
                >
                  {feedback === 'correct' ? '🎉 ✅' : '😅 ❌'}
                </div>
              )}

              <p className='text-center mt-4 text-xl font-medium min-h-[28px]'>
                {message}
              </p>

              {/* Botones */}
              <div className='grid grid-cols-2 gap-4 mt-8'>
                <button
                  onClick={checkAnswer}
                  className='bg-[#236296] text-white py-5 rounded-full text-xl font-bold active:scale-95 transition-all shadow-[0_5px_0_#004a79]'
                >
                  Comprobar
                </button>
                <button
                  onClick={newProblem}
                  className='bg-[#ffe08a] text-[#725c12] py-5 rounded-full text-xl font-bold active:scale-95 transition-all'
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CREADORES */}
        <section className='bg-[#2e3134] text-white py-16 px-8 text-center'>
          <h3 className='text-2xl font-bold mb-6 text-[#ffe08a]'>Creadores</h3>
          <ul className='space-y-3 text-lg'>
            <li>María Guadalupe López García</li>
            <li>Carlos Eduardo Martínez Rivera</li>
            <li>Sofía Valentina Hernández Pérez</li>
          </ul>
        </section>

        {/* FOOTER */}
        <footer className='bg-[#191c1f] text-gray-400 py-12 px-8 text-center text-sm'>
          © 2026 Aprende Matemáticas Jugando • Hecho con ❤️ para niños que aman
          aprender
        </footer>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;700;800;900&display=swap');

        body { font-family: 'Nunito Sans', system-ui, sans-serif; }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-25px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delay { animation: float 8s ease-in-out infinite 2s; }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
};
