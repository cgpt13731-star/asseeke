const questions = [
  "Сізге мектепте ұнай ма, әлде онша емес пе?",
  "Таңертең оянған кезде сіз әрқашан мектепке қуанышпен барасыз ба, әлде үйде отырғанды қалайсыз ба?",
  "Егер мұғалім ертең барлық оқушыларға мектепке барудың қажеті жоқ десе, сіз мектепке барар ма едіңіз, әлде үйде отырар ма едіңіз?",
  "Сізге қандай да бір сабақтардың тоқтатылғаны ұнай ма?",
  "Үй тапсырмасының берілмегенін қалайсыз ба?",
  "Мектепте тек үзілістер болғанын қалайсыз ба?",
  "Сіз ата-анаңызға мектеп туралы жиі айтасыз ба?",
  "Сізде онша қатал емес мұғалім болғанын қалайсыз ба?",
  "Сіздің сыныбыңызда достарыңыз көп пе?",
  "Сыныптастарыңыз сізге ұнай ма?"
];

const options = [
  { label: "Иә", score: 3 },
  { label: "Кейде", score: 2 },
  { label: "Жоқ", score: 1 }
];

const quotes = [
  "Адамның адамшылығы - ақыл, ғылым, жақсы ата, жақсы ана, жақсы құрбы, жақсы ұстаздан болады.",
  "Ғылым таппай мақтанба, орын таппай баптанба.",
  "Сен де бір кірпіш дүниеге, кетігін тап та, бар қалан.",
  "Еңбек қылсаң ерінбей, тояды қарның тіленбей."
];

const adviceBank = {
  high: "Сенің мектепке деген ынтаң жақсы. Осы қарқыныңды сақтап, күн сайын кішкентай мақсат қойып отыр.",
  medium: "Сенде жақсы әлеует бар. Сабақта өзіңе ұнайтын пәннен бастап белсендірек болып көр, мотивацияң біртіндеп күшейеді.",
  low: "Қазір саған қолдау мен жылы орта маңызды. Күн сайын бір жақсы нәрсені байқап жазып жүрсең, мектепке көзқарас та жеңілдей бастайды."
};

const moodByLevel = {
  high: {
    emoji: "😄",
    label: "Көңілді",
    summary: "Өзіңді сергек және сенімді сезінесің.",
    breathing: "4 секунд дем ал, 4 секунд ұстап тұр, 4 секунд дем шығар."
  },
  medium: {
    emoji: "🙂",
    label: "Жай ғана",
    summary: "Көңіл күйің тұрақты, аздап демалыс пайдалы.",
    breathing: "3 рет жай тыныс ал: дем ал, сәл күт, баяу дем шығар."
  },
  low: {
    emoji: "😟",
    label: "Мұңлы / алаңдау",
    summary: "Қазір саған тыныштық пен жұмсақ қолдау қажет.",
    breathing: "5 рет терең тыныс ал: 4 секунд дем ал, 6 секунд дем шығар."
  }
};

const STORAGE_KEY = "sana-ai-result";
let breathingTimer = null;

function getBreathingGuide(levelKey) {
  if (levelKey === "high") {
    return {
      title: "Сергек тыныс",
      guide: "Арқаңды тік ұстап отыр. Көзіңді жұмып, 4-4-4 ырғағымен 4 айналым жаса.",
      inhale: "4 секунд мұрынмен терең дем ал.",
      hold: "4 секунд тынысыңды ұстап тұр.",
      exhale: "4 секунд аузыңмен жайлап дем шығар."
    };
  }

  if (levelKey === "medium") {
    return {
      title: "Жайлы тыныс",
      guide: "Иығыңды бос ұстап, 3 айналым бойы тынысыңды бірқалыпты ретте.",
      inhale: "3 секунд баяу дем ал.",
      hold: "2 секунд тынысты ұстап тұр.",
      exhale: "4 секунд ақырын дем шығар."
    };
  }

  return {
    title: "Тыныштандыру тынысы",
    guide: "Өзіңді қауіпсіз сезініп отыр. 5 рет терең дем алып, денеңді босаңсыт.",
    inhale: "4 секунд терең дем ал.",
    hold: "2 секунд тынысыңды жұмсақ ұстап тұр.",
    exhale: "6 секунд өте баяу дем шығар."
  };
}

function getLevel(totalScore) {
  if (totalScore >= 25) {
    return { label: "Жоғары деңгей", key: "high" };
  }
  if (totalScore >= 18) {
    return { label: "Орташа деңгей", key: "medium" };
  }
  return { label: "Қолдау қажет", key: "low" };
}

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

function buildDescriptions(levelKey) {
  if (levelKey === "high") {
    return {
      motivation: "Оқу іс-әрекетіне қызығушылығы жоғары.",
      stability: "Эмоциялық тұрақтылығы жақсы деңгейде.",
      social: "Сынып ортасына бейімделуі сенімді."
    };
  }

  if (levelKey === "medium") {
    return {
      motivation: "Қызығушылығы бар, бірақ қосымша ынталандыру пайдалы.",
      stability: "Көңіл күйі көбіне тұрақты, кейде қолдау керек.",
      social: "Әлеуметтік байланыстары қалыптасып келеді."
    };
  }

  return {
    motivation: "Оқу мотивациясын жұмсақ түрде күшейту қажет.",
    stability: "Эмоциялық қолдау мен сенімді орта маңызды.",
    social: "Достық орта мен мұғалім қолдауы пайдалы болады."
  };
}

function createResultPayload(studentName, selectedAnswers) {
  const totalScore = selectedAnswers.reduce((sum, item) => sum + item.score, 0);
  const level = getLevel(totalScore);
  const motivationPercent = clamp(Math.round((totalScore / 30) * 100));
  const stabilityPercent = clamp(Math.round(motivationPercent * 0.88 + 8));
  const socialPercent = clamp(
    Math.round(
      ((selectedAnswers[6]?.score || 0) + (selectedAnswers[8]?.score || 0) + (selectedAnswers[9]?.score || 0)) /
        9 *
        100
    )
  );

  return {
    studentName,
    selectedAnswers,
    level,
    motivationPercent,
    stabilityPercent,
    socialPercent,
    descriptions: buildDescriptions(level.key),
    quote: quotes[totalScore % quotes.length],
    advice: adviceBank[level.key],
    mood: moodByLevel[level.key],
    breathingGuide: getBreathingGuide(level.key)
  };
}

function renderQuestions() {
  const form = document.getElementById("surveyForm");
  if (!form) {
    return;
  }

  form.innerHTML = questions
    .map((question, index) => {
      const name = `question-${index}`;
      const optionMarkup = options
        .map(
          (option) => `
            <label class="option">
              <input type="radio" name="${name}" value="${option.score}" data-label="${option.label}" />
              <span class="option-label">${option.label}</span>
            </label>
          `
        )
        .join("");

      return `
        <article class="question-card">
          <span class="question-number">${index + 1}</span>
          <p class="question-text">${question}</p>
          <div class="options">${optionMarkup}</div>
        </article>
      `;
    })
    .join("");
}

function initFormPage() {
  const submitBtn = document.getElementById("submitBtn");
  const nameInput = document.getElementById("studentName");

  if (!submitBtn || !nameInput) {
    return;
  }

  renderQuestions();

  submitBtn.addEventListener("click", () => {
    const studentName = nameInput.value.trim();

    if (!studentName) {
      alert("Алдымен оқушының атын жазыңыз.");
      nameInput.focus();
      return;
    }

    const selectedAnswers = questions.map((question, index) => {
      const selected = document.querySelector(`input[name="question-${index}"]:checked`);

      if (!selected) {
        return null;
      }

      return {
        question,
        score: Number(selected.value),
        label: selected.dataset.label
      };
    });

    if (selectedAnswers.includes(null)) {
      alert("Барлық 10 сұраққа жауап беру керек.");
      return;
    }

    const payload = createResultPayload(studentName, selectedAnswers);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    window.location.href = "./results.html";
  });
}

function initResultsPage() {
  const answersList = document.getElementById("answersList");
  const profileName = document.getElementById("profileName");

  if (!answersList || !profileName) {
    return;
  }

  const rawResult = localStorage.getItem(STORAGE_KEY);

  if (!rawResult) {
    window.location.href = "./index.html";
    return;
  }

  const data = JSON.parse(rawResult);

  answersList.innerHTML = data.selectedAnswers
    .map(
      (item, index) => `
        <div class="answer-item">
          <strong>${index + 1}. ${item.question}</strong>
          <span>${item.label}</span>
        </div>
      `
    )
    .join("");

  document.getElementById("motivationLevel").textContent = data.level.label;
  document.getElementById("motivationScore").textContent = `${data.motivationPercent}%`;
  document.getElementById("motivationText").textContent = data.descriptions.motivation;
  document.getElementById("stabilityScore").textContent = `${data.stabilityPercent}%`;
  document.getElementById("stabilityText").textContent = data.descriptions.stability;
  document.getElementById("socialScore").textContent = `${data.socialPercent}%`;
  document.getElementById("socialText").textContent = data.descriptions.social;
  document.getElementById("abayQuote").textContent = data.quote;
  document.getElementById("aiAdvice").textContent = data.advice;
  profileName.textContent = data.studentName;
  document.getElementById("moodEmoji").textContent = data.mood.emoji;
  document.getElementById("moodLabel").textContent = data.mood.label;
  document.getElementById("moodResultText").textContent = data.mood.summary;
  document.getElementById("breathingHint").textContent = data.mood.breathing;
  document.getElementById("breathingPlan").textContent = data.mood.breathing;

  const openBreathingGuide = document.getElementById("openBreathingGuide");
  const closeBreathingGuide = document.getElementById("closeBreathingGuide");
  const breathingModal = document.getElementById("breathingModal");
  const playButton = document.querySelector(".play-button");
  const startBreathingCycle = document.getElementById("startBreathingCycle");
  const stopBreathingCycle = document.getElementById("stopBreathingCycle");
  const breathingGuideTitle = document.getElementById("breathingGuideTitle");
  const breathingGuideText = document.getElementById("breathingGuideText");
  const stepInhale = document.getElementById("stepInhale");
  const stepHold = document.getElementById("stepHold");
  const stepExhale = document.getElementById("stepExhale");
  const breathingPhaseCircle = document.getElementById("breathingPhaseCircle");
  const breathingPhaseText = document.getElementById("breathingPhaseText");

  function stopCycle() {
    if (breathingTimer) {
      clearTimeout(breathingTimer);
      breathingTimer = null;
    }
    breathingPhaseCircle.className = "breathing-phase-circle";
    breathingPhaseText.textContent = "Дайындал";
  }

  function runCycle() {
    stopCycle();

    const phases = [
      { text: "Дем ал", className: "expand", delay: 4000 },
      { text: "Ұстап тұр", className: "hold", delay: 2000 },
      { text: "Дем шығар", className: "release", delay: 6000 }
    ];

    let index = 0;

    function nextPhase() {
      const phase = phases[index];
      breathingPhaseCircle.className = `breathing-phase-circle ${phase.className}`;
      breathingPhaseText.textContent = phase.text;
      index = (index + 1) % phases.length;
      breathingTimer = setTimeout(nextPhase, phase.delay);
    }

    nextPhase();
  }

  function openGuide() {
    breathingGuideTitle.textContent = data.breathingGuide.title;
    breathingGuideText.textContent = data.breathingGuide.guide;
    stepInhale.textContent = data.breathingGuide.inhale;
    stepHold.textContent = data.breathingGuide.hold;
    stepExhale.textContent = data.breathingGuide.exhale;
    breathingModal.classList.remove("hidden");
    breathingModal.setAttribute("aria-hidden", "false");
  }

  function closeGuide() {
    stopCycle();
    breathingModal.classList.add("hidden");
    breathingModal.setAttribute("aria-hidden", "true");
  }

  openBreathingGuide?.addEventListener("click", openGuide);
  playButton?.addEventListener("click", openGuide);
  closeBreathingGuide?.addEventListener("click", closeGuide);
  startBreathingCycle?.addEventListener("click", runCycle);
  stopBreathingCycle?.addEventListener("click", stopCycle);
  breathingModal?.addEventListener("click", (event) => {
    if (event.target === breathingModal) {
      closeGuide();
    }
  });
}

initFormPage();
initResultsPage();
