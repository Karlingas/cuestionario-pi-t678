// Este array 'questions' se incluiría en tu archivo script.js
const questions = [
  {
    id: 1,
    text: "Podríamos relacionar el hecho de que una empresa venda software envenenado a sus clientes con el concepto de obsolescencia programada.",
    type: "verdadero_falso",
    options: ["Verdadero", "Falso"],
    correctAnswer: "Verdadero" // Extraído del documento [cite: 1, 2]
  },
  {
    id: 2,
    text: "Las máximas penas de multa que se le pueden poner, tal y como se contempla en el Código Penal, tanto a una persona física como a una jurídica son de 288.000 € y 9.000.000 € respectivamente.",
    type: "verdadero_falso",
    options: ["Verdadero", "Falso"],
    correctAnswer: "Verdadero" // Extraído del documento [cite: 2, 3]
  },
  {
    id: 3,
    text: "Los padres, tal como se indica en el Código Civil, son responsables penales de los delitos que a través de Internet sus hijos menores de edad pudieran cometer.",
    type: "verdadero_falso",
    options: ["Verdadero", "Falso"],
    correctAnswer: "Falso" // Extraído del documento [cite: 3, 4]
  },
  {
    id: 4,
    text: "La Guardia Civil ha detenido a 5 alumnos universitarios por instalar un software en los ordenadores de diferentes laboratorios mediante el cual consiguieron las contraseñas de las cuentas de correo electrónico de al menos 27 profesores del centro, de donde sustrajeron todo tipo de documentación, información y archivos, fundamentalmente exámenes, que según parece era el objetivo perseguido. ¿Aprecias la comisión de algún delito?",
    type: "opcion_multiple",
    options: ["Descubrimiento y revelación de secretos", "Hurto", "Daños informáticos", "Estafa"],
    correctAnswer: "Descubrimiento y revelación de secretos" // Extraído del documento [cite: 92]
  },
  {
    id: 5,
    text: "¿Cuál de los siguientes delitos cometieron estos ladrones? (Contexto: Robo en casa sin romper nada, se llevaron equipos electrónicos)",
    type: "opcion_multiple",
    options: ["Hurto", "Robo con fuerza", "Extorsión", "Daños"],
    correctAnswer: "Hurto" // Extraído del documento [cite: 94]
  },
  {
    id: 6,
    text: "De camino al trabajo se acercan a ti dos tipos con cara de pocos amigos (tienen varias marcas carcelarias en la cara) que te sugieren la posibilidad de decirle a tu mujer que tienes una amante. A cambio de su silencio (y de no decirles nada ni a tu mujer ni, sobre todo a tu suegra, insistes tú), te piden que les indiques en qué consisten exactamente las medidas de seguridad informáticas del banco donde trabajas. ¿Cuál de las siguientes opciones es FALSA?",
    type: "identificar_falsa_verdadera", // Opcion_multiple donde se pide la falsa
    options: ["Se comete un delito de descubrimiento y revelación de secretos", "Los tipos me están amenazando"],
    correctAnswer: "NO PROPORCIONADA EN EL DOCUMENTO" // El documento no indica explícitamente cuál es la falsa en este formato. [cite: 100]
                                                 // Para una implementación real, necesitarías determinar la opción falsa.
  }
  // ... Añade aquí el resto de las preguntas extraídas del PDF.
];
let currentQuestionIndex = 0;
let userAnswers = new Array(questions.length).fill(null); // Para guardar respuestas (opcional avanzado)

const questionTextElement = document.getElementById('question-text');
const optionsContainerElement = document.getElementById('options-container');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressIndicatorElement = document.getElementById('progress-indicator');
const completionMessageElement = document.getElementById('completion-message');
const questionAreaElement = document.getElementById('question-area');
const navigationButtonsElement = document.querySelector('.navigation-buttons');

function loadQuestion(index) {
    const question = questions[index];
    questionTextElement.textContent = question.text;
    optionsContainerElement.innerHTML = ''; // Limpiar opciones anteriores

    question.options.forEach(option => {
        if (question.type === "verdadero_falso" || question.type === "identificar_falsa_verdadera") {
            const button = document.createElement('button');
            button.textContent = option;
            button.onclick = () => selectAnswer(index, option);
            if (userAnswers[index] === option) {
                button.classList.add('selected'); // Marcar si ya fue seleccionada
            }
            optionsContainerElement.appendChild(button);
        } else if (question.type === "opcion_multiple") {
            const label = document.createElement('label');
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = `question-${question.id}`;
            radio.value = option;
            radio.onclick = () => selectAnswer(index, option);
            if (userAnswers[index] === option) {
                radio.checked = true; // Marcar si ya fue seleccionada
            }
            label.appendChild(radio);
            label.appendChild(document.createTextNode(option));
            optionsContainerElement.appendChild(label);
        }
    });

    updateNavigationButtons();
    updateProgressIndicator();
}

function selectAnswer(questionIndex, answer) {
    userAnswers[questionIndex] = answer;
    // Para V/F y identificar_falsa_verdadera, podríamos querer deseleccionar otros visualmente
    if (questions[questionIndex].type === "verdadero_falso" || questions[questionIndex].type === "identificar_falsa_verdadera") {
        // Quitar 'selected' de otros botones para esta pregunta
        const buttons = optionsContainerElement.querySelectorAll('button');
        buttons.forEach(btn => btn.classList.remove('selected'));
        // Encontrar y marcar el botón seleccionado
        const selectedButton = Array.from(buttons).find(btn => btn.textContent === answer);
        if (selectedButton) {
            selectedButton.classList.add('selected');
        }
    }
    // Opcional: Guardar en localStorage
    // localStorage.setItem('userAnswers', JSON.stringify(userAnswers));
    console.log(`Pregunta ${questionIndex + 1} respondida con: ${answer}`); // Para depuración
}

function updateNavigationButtons() {
    prevBtn.disabled = currentQuestionIndex === 0;
    if (currentQuestionIndex === questions.length - 1) {
        nextBtn.textContent = 'Finalizar';
    } else {
        nextBtn.textContent = 'Siguiente';
    }
}

function updateProgressIndicator() {
    progressIndicatorElement.textContent = `Pregunta ${currentQuestionIndex + 1} de ${questions.length}`;
}

function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion(currentQuestionIndex);
    } else {
        // Finalizar cuestionario
        showCompletionMessage();
    }
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion(currentQuestionIndex);
    }
}

function showCompletionMessage() {
    questionAreaElement.style.display = 'none';
    navigationButtonsElement.style.display = 'none';
    progressIndicatorElement.style.display = 'none';
    completionMessageElement.style.display = 'block';
    // Opcional: Aquí podrías calcular y mostrar la puntuación si tienes las respuestas correctas
    // y la lógica de corrección implementada.
    // También podrías limpiar localStorage si ya no es necesario
    // localStorage.removeItem('userAnswers');
}

// Iniciar el cuestionario inmediatamente
window.onload = () => {
    // Opcional: Cargar respuestas guardadas si existen
    // const savedAnswers = JSON.parse(localStorage.getItem('userAnswers'));
    // if (savedAnswers && savedAnswers.length === questions.length) {
    //     userAnswers = savedAnswers;
    // }
    loadQuestion(currentQuestionIndex);
};