
const questions = [
  {
    id: 1,
    text: "Podríamos relacionar el hecho de que una empresa venda software envenenado a sus clientes con el concepto de obsolescencia programada.",
    type: "verdadero_falso",
    options: ["Verdadero", "Falso"],
    correctAnswer: "Verdadero"
  },
  {
    id: 2,
    text: "Las máximas penas de multa que se le pueden poner, tal y como se contempla en el Código Penal, tanto a una persona física como a una jurídica son de 288.000 € y 9.000.000 € respectivamente.",
    type: "verdadero_falso",
    options: ["Verdadero", "Falso"],
    correctAnswer: "Verdadero"
  },
  {
    id: 3,
    text: "Los padres, tal como se indica en el Código Civil, son responsables penales de los delitos que a través de Internet sus hijos menores de edad pudieran cometer.",
    type: "verdadero_falso",
    options: ["Verdadero", "Falso"],
    correctAnswer: "Falso"
  },
  {
    id: 4,
    text: "La Guardia Civil ha detenido a 5 alumnos universitarios (...) ¿Aprecias la comisión de algún delito?",
    type: "opcion_multiple", // Respuesta única
    options: ["Descubrimiento y revelación de secretos", "Hurto", "Daños informáticos", "Estafa"],
    correctAnswer: "Descubrimiento y revelación de secretos"
  },
  {
    id: 5,
    text: "¿Cuál de los siguientes delitos cometieron estos ladrones? (Contexto: Robo en casa sin romper nada...)",
    type: "opcion_multiple", // Respuesta única
    options: ["Hurto", "Robo con fuerza", "Extorsión", "Daños"],
    correctAnswer: "Hurto"
  },
  {
    id: 6,
    text: "De camino al trabajo (...) ¿Cuál de las siguientes opciones es FALSA?",
    type: "identificar_falsa_verdadera", // Tratada como opción múltiple de respuesta única
    options: ["Se comete un delito de descubrimiento y revelación de secretos", "Los tipos me están amenazando"],
    correctAnswer: "NO PROPORCIONADA EN EL DOCUMENTO" // Necesitarías la respuesta correcta para evaluar
  },
  // NUEVA PREGUNTA DE EJEMPLO PARA SELECCIÓN MÚLTIPLE (VARIAS RESPUESTAS)
  {
    id: 7,
    text: "¿Cuáles de los siguientes son considerados lenguajes de programación orientados a objetos? (Selecciona todas las que apliquen)",
    type: "opcion_multiple_varias",
    options: ["Java", "C", "Python", "HTML"],
    correctAnswer: ["Java", "Python"] // Array con las respuestas correctas
  }
  // ... Añade aquí el resto de las preguntas extraídas del PDF.
];

let currentQuestionIndex = 0;
let userAnswers = new Array(questions.length).fill(null).map((_, i) => {
    // Para 'opcion_multiple_varias', userAnswers[i] será un array.
    // Para los otros tipos, será un string o null.
    return questions[i].type === "opcion_multiple_varias" ? [] : null;
});
let scoreCorrect = 0;
let scoreIncorrect = 0;
let questionAnsweredFlags = new Array(questions.length).fill(false); // Para evitar responder múltiples veces

const questionTextElement = document.getElementById('question-text');
const optionsContainerElement = document.getElementById('options-container');
const feedbackAreaElement = document.getElementById('feedback-area');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressIndicatorElement = document.getElementById('progress-indicator');
const completionMessageElement = document.getElementById('completion-message');
const scoreSummaryElement = document.getElementById('score-summary');
const questionAreaElement = document.getElementById('question-area');
const navigationButtonsElement = document.querySelector('.navigation-buttons');

function loadQuestion(index) {
    const question = questions[index];
    questionTextElement.textContent = question.text;
    optionsContainerElement.innerHTML = '';
    feedbackAreaElement.innerHTML = ''; // Limpiar feedback anterior

    question.options.forEach(optionText => {
        const optionId = `q${index}_option_${optionText.replace(/\s+/g, '_')}`; // ID único para el input
        
        if (question.type === "verdadero_falso" || question.type === "opcion_multiple" || question.type === "identificar_falsa_verdadera") {
            const button = document.createElement('button');
            button.textContent = optionText;
            button.classList.add('option');
            button.onclick = () => selectAnswer(index, optionText, button);
            
            // Si ya fue respondida, mostrar cómo fue
            if (questionAnsweredFlags[index]) {
                button.disabled = true;
                if (optionText === question.correctAnswer) {
                    button.classList.add('correct');
                }
                if (optionText === userAnswers[index] && optionText !== question.correctAnswer) {
                    button.classList.add('user-selected-incorrect');
                } else if (userAnswers[index] && optionText === userAnswers[index]) {
                     // Si es la correcta y la seleccionada por el usuario.
                    // La clase 'correct' ya la cubre.
                }
            }
            optionsContainerElement.appendChild(button);

        } else if (question.type === "opcion_multiple_varias") {
            const label = document.createElement('label');
            label.classList.add('option');
            label.setAttribute('for', optionId);

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = optionId;
            checkbox.name = `question-${question.id}`;
            checkbox.value = optionText;
            checkbox.onchange = (event) => handleCheckboxChange(index, optionText, event.target.checked, label);
            
            // Si ya fue respondida, mostrar cómo fue
            if (questionAnsweredFlags[index]) {
                checkbox.disabled = true;
                const isCorrectOption = question.correctAnswer.includes(optionText);
                const wasSelectedByUser = userAnswers[index].includes(optionText);

                if (isCorrectOption) {
                    label.classList.add('correct');
                }
                if (wasSelectedByUser && !isCorrectOption) {
                    label.classList.add('user-selected-incorrect');
                }
                if (wasSelectedByUser) {
                    checkbox.checked = true;
                }

            } else {
                 // Restaurar estado si se navega hacia atrás a una pregunta no finalizada
                if (Array.isArray(userAnswers[index]) && userAnswers[index].includes(optionText)) {
                    checkbox.checked = true;
                }
            }
            
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(optionText));
            optionsContainerElement.appendChild(label);
        }
    });

    if (questionAnsweredFlags[index] && questions[index].type === "opcion_multiple_varias") {
        // Si ya fue respondida y es de opción múltiple varias, mostrar feedback general si es necesario.
        // Esto se maneja mejor al momento de evaluar con 'nextQuestion'
    }

    updateNavigationButtons();
    updateProgressIndicator();
}

function handleCheckboxChange(questionIndex, optionText, isChecked, labelElement) {
    if (questionAnsweredFlags[questionIndex]) return; // No permitir cambios si ya se evaluó

    const currentSelections = userAnswers[questionIndex] || [];
    if (isChecked) {
        if (!currentSelections.includes(optionText)) {
            currentSelections.push(optionText);
        }
    } else {
        const idx = currentSelections.indexOf(optionText);
        if (idx > -1) {
            currentSelections.splice(idx, 1);
        }
    }
    userAnswers[questionIndex] = currentSelections;
}

function selectAnswer(questionIndex, selectedOption, buttonElement) {
    if (questionAnsweredFlags[questionIndex]) return; // Ya respondida y evaluada

    const question = questions[questionIndex];
    userAnswers[questionIndex] = selectedOption;
    questionAnsweredFlags[questionIndex] = true;

    const isCorrect = selectedOption === question.correctAnswer;

    if (isCorrect) {
        scoreCorrect++;
        buttonElement.classList.add('correct');
        feedbackAreaElement.textContent = "¡Correcto!";
        feedbackAreaElement.style.color = "green";
    } else {
        scoreIncorrect++;
        buttonElement.classList.add('user-selected-incorrect');
        feedbackAreaElement.textContent = `Incorrecto. La respuesta correcta era: ${question.correctAnswer}`;
        feedbackAreaElement.style.color = "red";
        // Resaltar la opción correcta
        optionsContainerElement.querySelectorAll('.option').forEach(optBtn => {
            if (optBtn.textContent === question.correctAnswer) {
                optBtn.classList.add('correct');
            }
            optBtn.disabled = true; // Deshabilitar todos los botones para esta pregunta
        });
    }
    // Deshabilitar todos los botones de opción para esta pregunta
     optionsContainerElement.querySelectorAll('.option').forEach(optBtn => {
        optBtn.disabled = true;
    });
}

function evaluateMultipleChoiceVarias(questionIndex) {
    if (questionAnsweredFlags[questionIndex]) return true; // Ya evaluada

    const question = questions[questionIndex];
    const userSelectedOptions = userAnswers[questionIndex] || [];
    const correctOptions = question.correctAnswer;
    
    questionAnsweredFlags[questionIndex] = true;
    let allCorrectlySelected = true;
    let anyIncorrectlySelected = false;

    // Comprobar si todas las correctas fueron seleccionadas y no se seleccionó ninguna incorrecta
    // Esta es una forma estricta de evaluar: para ser 100% correcta, debe coincidir exactamente.
    if (userSelectedOptions.length === correctOptions.length) {
        allCorrectlySelected = correctOptions.every(opt => userSelectedOptions.includes(opt));
    } else {
        allCorrectlySelected = false;
    }
    
    // También se podría puntuar parcialmente, pero para un contador simple de aciertos/fallos:
    if (allCorrectlySelected) {
        scoreCorrect++;
        feedbackAreaElement.textContent = "¡Correcto!";
        feedbackAreaElement.style.color = "green";
    } else {
        scoreIncorrect++;
        feedbackAreaElement.textContent = "Incorrecto. Revisa las selecciones.";
        feedbackAreaElement.style.color = "red";
    }

    // Aplicar estilos a las opciones (checkboxes y sus labels)
    const labels = optionsContainerElement.querySelectorAll('label.option');
    labels.forEach(label => {
        const checkbox = label.querySelector('input[type="checkbox"]');
        const optionValue = checkbox.value;
        checkbox.disabled = true; // Deshabilitar

        if (correctOptions.includes(optionValue)) {
            label.classList.add('correct');
        }
        if (userSelectedOptions.includes(optionValue) && !correctOptions.includes(optionValue)) {
            label.classList.add('user-selected-incorrect');
        }
    });
    return allCorrectlySelected;
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
    const currentQuestionType = questions[currentQuestionIndex].type;

    // Evaluar 'opcion_multiple_varias' si no ha sido evaluada aún
    if (currentQuestionType === "opcion_multiple_varias" && !questionAnsweredFlags[currentQuestionIndex]) {
        evaluateMultipleChoiceVarias(currentQuestionIndex);
    } else if (!questionAnsweredFlags[currentQuestionIndex]) {
        // Para otros tipos, si no se ha respondido (ej. el usuario no hizo clic en nada)
        // Podrías marcarla como incorrecta o simplemente no contarla.
        // Por ahora, si no es 'opcion_multiple_varias', el feedback es inmediato al hacer clic.
        // Si el usuario no ha hecho clic, y pulsa siguiente, podríamos considerarla no respondida / incorrecta.
        // Para este caso, asumimos que el usuario debe seleccionar algo en V/F y opcion_multiple antes de que se bloquee.
        // Si no seleccionó nada, y la pregunta no está bloqueada (answeredFlag = false), se puede marcar como no respondida.
        // Sin embargo, con el feedback inmediato, la pregunta se marca como 'answered' en el momento de la selección.
        // Si el usuario quiere saltar sin responder, eso es otro manejo.
        // Aquí asumimos que si no es 'opcion_multiple_varias', la evaluación/bloqueo ya ocurrió.
    }


    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion(currentQuestionIndex);
    } else {
        showCompletionMessage();
    }
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        // Si la pregunta actual es 'opcion_multiple_varias' y no ha sido evaluada,
        // no hay mucho que hacer al ir para atrás, las selecciones se mantienen.
        currentQuestionIndex--;
        loadQuestion(currentQuestionIndex);
        // Limpiar el feedback de la pregunta a la que se navega si se está volviendo a ella
        // y no ha sido contestada (aunque la lógica actual la marca contestada al primer intento)
        // Por simplicidad, la navegación hacia atrás muestra la pregunta en su estado ya contestado/evaluado.
    }
}

function showCompletionMessage() {
    questionAreaElement.style.display = 'none';
    navigationButtonsElement.style.display = 'none';
    progressIndicatorElement.style.display = 'none';
    completionMessageElement.style.display = 'block';
    scoreSummaryElement.textContent = `Aciertos: ${scoreCorrect} - Fallos: ${scoreIncorrect}`;
}

window.onload = () => {
    loadQuestion(currentQuestionIndex);
};