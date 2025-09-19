/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Type } from '@google/genai';
import jsPDF from 'jspdf';

// --- DATA ---

const needsData = {
    "Gerovė": ["judėjimas", "maitinimas", "poilsis", "stabilumas", "sveikata"],
    "Prasmė": ["dvasingumas", "galia", "pagalba", "prisidėjimas", "tikslas, rezultatas"],
    "Ryšys": ["abipusiškumas", "bendravimas", "empatija", "palytėjimas"],
    "Taika": ["buvimas", "pusiausvyra", "ramybė", "sąžinė", "sklandumas"],
    "Saugumas": ["globa", "pastovumas", "patikimumas", "tikėjimas", "tvarka, struktūra"],
    "Laisvė": ["integralumas", "nepriklausomumas", "pasirinkimas", "pilnatvė", "savarankiškumas"],
    "Meilė": ["gailestingumas", "intymumas", "prieraišumas", "šiluma", "švelnumas"],
    "Šventimas": ["dėkingumas", "džiaugsmas", "grožis", "priėmimas"],
    "Garbingumas": ["atitikimas", "atvirumas", "savęs pažinimas", "skaidrumas"],
    "Kūrybingumas": ["aistra", "įkvėpimas", "išraiškingumas", "žaidimas"],
    "Rūpestis": ["pagalba", "palaikymas", "pasitikėjimas", "svarstymas", "pagarba"],
    "Gedėjimas": ["atsinaujinimas", "dalijimasis", "dėkingumas", "pažeidžiamumas"],
    "Atsakomybė": ["dalyvavimas", "įsipareigojimas", "ryžtas", "pastovumas"],
    "Mokymasis": ["aiškinimasis", "integracija", "iššūkis", "kompetencija", "tyrinėjimas"],
    "Supratimas": ["aiškumas", "jausmingumas", "priėmimas", "susidomėjimas"],
    "Bendruomenė": ["bendradarbiavimas", "draugystė", "įtraukimas", "lygybė", "priklausymas"]
};

const feelingsMetData = {
    "Malonus": ["dėkingas", "džiaugsmingas", "išdidus", "įsidrąsinęs", "laimingas", "optimistiškas", "palengvėjęs", "pasitikintis", "patenkintas", "viltingas"],
    "Susidomėjęs": ["budrus", "energingas", "entuziastingas", "įkvėptas", "nustebęs", "sudirgęs", "susijaudinęs", "trokštantis", "žaismingas"],
    "Taikus": ["aiškus", "atsipalaidavęs", "gyvas", "maloniai", "pailsėjęs", "patogiai", "pilnatviškas", "ramus", "saugus", "stiprus"],
    "Mylintis": ["atviraširdis", "dėkingas", "draugiškas", "prielankus", "priimantis", "šiltas", "švelnus"]
};

const feelingsUnmetData = {
    "Išsigandęs": ["bailus", "baikštus", "budrus", "nervingas", "paklaikęs", "panikuojantis", "pasibaisėjęs", "praradęs viltį", "sudirgęs", "sunerimęs"],
    "Liūdnas": ["įsiskaudinęs", "nedrąsus", "nusiminęs", "skausmingas", "sunkus", "susikaustęs", "susirūpinęs", "tuščias"],
    "Piktas": ["apsunkęs", "įsiutęs", "įsižeidęs", "liūdnas", "pasipiktinęs", "pesimistiškas", "sudirgęs", "susierzinęs"],
    "Nusivylęs": ["bejėgis", "išsekęs", "kaltas", "nesaugus", "nuobodus", "pasibjaurėjęs", "susikrimtęs", "sustingęs"],
    "Sumišęs": ["abejingas", "audringas", "nesaugus", "nustebęs", "prieštaraujantis", "suglumęs", "sutrikęs"]
};

const itemExplanations: Record<string, string> = {
    'judėjimas': 'Poreikis fiziniam aktyvumui, kūno išraiškai ir laisvei judėti. Tai gyvybingumo ir energijos šaltinis.',
    'sveikata': 'Poreikis jaustis fiziškai ir emociškai gerai, būti stipriam ir gyvybingam.',
    'prisidėjimas': 'Poreikis jausti, kad tavo veiksmai kuria vertę ir teigiamai veikia kitus ar pasaulį.',
    'empatija': 'Poreikis būti išgirstam ir suprastam, jausti, kad kitas žmogus girdi ne tik žodžius, bet ir jausmus bei poreikius už jų.',
    'ramybė': 'Vidinės taikos ir pusiausvyros poreikis, kai protas ir jausmai yra harmonijoje.',
    'saugumas': 'Poreikis jaustis apsaugotam nuo fizinių ir emocinių grėsmių, pasitikėti aplinka.',
    'pasirinkimas': 'Poreikis savarankiškai priimti sprendimus, kurie atitinka asmenines vertybes ir norus.',
    'šiluma': 'Poreikis jausti emocinį artumą, priėmimą ir rūpestį iš kitų žmonių.',
    'džiaugsmas': 'Jausmas, kylantis patenkinus svarbius poreikius, pavyzdžiui, šventimo, bendrystės ar prasmės. Tai vidinė šviesa ir energija.',
    'atvirumas': 'Poreikis nuoširdumui, skaidrumui ir tiesai santykiuose su savimi ir kitais.',
    'bendradarbiavimas': 'Poreikis dirbti kartu su kitais siekiant bendrų tikslų, jausti komandinę dvasią.',
    'piktas': 'Signalas, kad svarbus poreikis, pvz., pagarbos, teisingumo ar saugumo, yra nepatenkintas. Pyktis kviečia atkreipti dėmesį į tai, kas mums svarbu, ir ieškoti pokyčių.',
    'liūdnas': 'Jausmas, kylantis praradus kažką svarbaus arba kai nepatenkinamas ryšio, meilės ar priklausymo poreikis.',
    'išsigandęs': 'Jausmas, kylantis susidūrus su grėsme ar nežinomybe, kai trūksta saugumo ar pasitikėjimo.',
    'nusivylęs': 'Jausmas, atsirandantis, kai lūkesčiai neatitinka realybės; dažnai susijęs su nepatenkintu vilties ar pasitikėjimo poreikiu.'
};

const feelingToNeedsMap: Record<string, string[]> = {
    'piktas': ['pagarba', 'teisingumas', 'autonomija', 'saugumas', 'supratimas'],
    'liūdnas': ['ryšys', 'meilė', 'priklausymas', 'supratimas', 'palaikymas', 'empatija'],
    'išsigandęs': ['saugumas', 'pasitikėjimas', 'aiškumas', 'palaikymas', 'ramybė'],
    'nusivylęs': ['pasitikėjimas', 'viltis', 'efektyvumas', 'pripažinimas'],
    'įsiskaudinęs': ['pagarba', 'empatija', 'pripažinimas', 'saugumas'],
    'susierzinęs': ['tvarka', 'ramybė', 'efektyvumas', 'bendradarbiavimas'],
    'sunerimęs': ['saugumas', 'aiškumas', 'ramybė', 'pasitikėjimas'],
    'vienišas': ['bendruomenė', 'ryšys', 'draugystė', 'šiluma'],
    'bejėgis': ['galia', 'pasirinkimas', 'savarankiškumas', 'palaikymas'],
    'kaltas': ['integralumas', 'atitikimas', 'pasitikėjimas', 'atleidimas']
};


const exampleSentences = [
    {
        feeling: "nusivylęs",
        need: "palaikymas",
        sentence: "Jaučiuosi nusivylęs, nes tikėjausi daugiau palaikymo ruošiant šį projektą."
    },
    {
        feeling: "susierzinęs",
        need: "tvarka",
        sentence: "Kai matau netvarką bendroje virtuvėje, jaučiuosi susierzinęs, nes man svarbi tvarkinga ir švari aplinka."
    },
    {
        feeling: "liūdnas",
        need: "ryšys",
        sentence: "Man liūdna, kai visą vakarą praleidi prie kompiuterio, nes man trūksta mūsų ryšio ir bendravimo."
    },
    {
        feeling: "išsigandęs",
        need: "saugumas",
        sentence: "Kai girdžiu pakeltą toną, išsigąstu, nes man reikia saugumo ir ramybės, kad galėčiau atvirai kalbėti."
    },
    {
        feeling: "įsiskaudinęs",
        need: "pagarba",
        sentence: "Jaučiuosi įsiskaudinęs dėl to komentaro, nes man labai svarbi abipusė pagarba."
    },
    {
        feeling: "vienišas",
        need: "bendruomenė",
        sentence: "Jaučiuosi vienišas, kai visi planus aptaria be manęs, nes man svarbu jaustis bendruomenės dalimi."
    }
];

const guessTheNeedGameData = [
    { statement: "Tu niekada manęs neklausai!", need: "supratimas", explanation: "Šis teiginys dažnai slepia jausmą, kad kitas asmuo negirdi gilesnės prasmės ar jausmų, o tai tiesiogiai susiję su poreikiu būti suprastam." },
    { statement: "Kodėl vėl palikai netvarką virtuvėje?", need: "tvarka, struktūra", explanation: "Prašymas palaikyti tvarką kyla iš poreikio aiškumui ir harmonijai aplinkoje, kuri padeda jaustis ramiau ir efektyviau." },
    { statement: "Man atsibodo viską daryti vienai.", need: "palaikymas", explanation: "Jausmas, kad viskas gula ant vieno žmogaus pečių, signalizuoja apie nepatenkintą pagalbos, bendradarbiavimo ir palaikymo poreikį." },
    { statement: "Tai pati kvailiausia idėja, kokią esu girdėjęs.", need: "pagarba", explanation: "Kritika, išsakyta kaip nuvertinimas, tiesiogiai pažeidžia poreikį būti gerbiamam ir vertinamam kaip lygiaverčiam asmeniui." },
    { statement: "Negaliu patikėti, kad pamiršai mūsų metines.", need: "svarstymas", explanation: "Užmirštos svarbios datos sukelia skausmą, nes tai paliečia gilų poreikį jausti, kad esi svarbus ir prisimenamas." },
    { statement: "Ar privalai taip garsiai kalbėti telefonu?", need: "ramybė", explanation: "Triukšmas aplinkoje gali trikdyti vidinę būseną, todėl šis prašymas kyla iš poreikio ramybei ir tylai." },
    { statement: "Aš tiesiog noriu pabūti vienas.", need: "nepriklausomumas", explanation: "Noras pabūti vienam yra susijęs su autonomijos ir asmeninės erdvės poreikiu, leidžiančiu atgauti jėgas ir susikaupti." },
    { statement: "Nustok man nurodinėti, ką daryti.", need: "pasirinkimas", explanation: "Pasipriešinimas nurodymams kyla iš fundamentalios laisvės ir pasirinkimo poreikio – noro savarankiškai priimti sprendimus." },
    { statement: "Aš taip pavargau nuo nuolatinės kritikos.", need: "priėmimas", explanation: "Nuolatinė kritika sukuria jausmą, kad nesi pakankamai geras. Už to slypi gilus poreikis būti priimtam tokiam, koks esi." },
    { statement: "Nežinau, ko iš manęs tikimasi šiame darbe.", need: "aiškumas", explanation: "Nežinomybė dėl lūkesčių kelia stresą ir neužtikrintumą, todėl kyla stiprus poreikis aiškumui ir struktūrai." },
];

const empatheticResponseGameData = [
    { 
        situation: "Man atsibodo, kad niekas nevertina mano pastangų.",
        correctResponse: "Ar jautiesi nusivylęs, nes tau svarbus tavo indėlio pripažinimas?",
        explanation: "Empatiškas spėjimas atspindi jausmą (nusivylęs) ir poreikį (pripažinimas), atverdamas kelią dialogui. Kiti variantai yra patarimai arba nuvertinimas.",
        incorrectResponses: ["Tiesiog mažiau stenkis, jei niekas nepastebi.", "Nereikia taip jautriai reaguoti.", "Aš tave suprantu, man irgi taip būna."]
    },
    { 
        situation: "Vėl pavėlavau į susirinkimą. Man taip gėda.",
        correctResponse: "Skamba taip, lyg jautiesi susikrimtęs, nes norėtum pasitikėjimo, kad gali laikytis susitarimų?",
        explanation: "Šis atsakymas švelniai įvardija jausmą (susikrimtęs) ir galimą gilų poreikį (pasitikėjimas), parodydamas supratimą be smerkimo.",
        incorrectResponses: ["Nieko tokio, visiems pasitaiko.", "Kitą kartą tiesiog išeik anksčiau.", "Na, taip, vėl vėluoji."]
    },
    { 
        situation: "Nežinau, ar man pavyks įgyvendinti šį projektą, jis atrodo per didelis.",
        correctResponse: "Ar jauti nerimą, nes tau reikia daugiau aiškumo ir palaikymo, kad jaustumeisi užtikrintai?",
        explanation: "Empatiškas atsakas atpažįsta nerimą ir įvardija konkrečius poreikius (aiškumas, palaikymas), kurie padėtų situaciją spręsti.",
        incorrectResponses: ["Viskas bus gerai, nepergyvenk.", "Tiesiog susidaryk planą ir viskas pavyks.", "Gal tau trūksta kompetencijos?"]
    },
    { 
        situation: "Mano vaikas manęs visiškai neklauso.",
        correctResponse: "Ar jautiesi bejėgė, nes tau svarbus bendradarbiavimas ir noras rasti ryšį su vaiku?",
        explanation: "Šis spėjimas padeda pereiti nuo „klausymo“ problemos prie gilesnių poreikių – bendradarbiavimo ir ryšio, kurie yra santykių pagrindas.",
        incorrectResponses: ["Turi būti griežtesnė.", "Vaikai yra vaikai, toks jų amžius.", "Suprantu, tai labai erzina."]
    }
];

const feelingsNeedsConnectionGameData = [
    { feeling: "piktas", correctNeed: "pagarba" },
    { feeling: "liūdnas", correctNeed: "ryšys" },
    { feeling: "vienišas", correctNeed: "bendruomenė" },
    { feeling: "išsigandęs", correctNeed: "saugumas" },
    { feeling: "susierzinęs", correctNeed: "tvarka, struktūra" },
    { feeling: "nusivylęs", correctNeed: "pasitikėjimas" },
    { feeling: "bejėgis", correctNeed: "galia" },
    { feeling: "sunerimęs", correctNeed: "ramybė" }
];


const lithuanianCorrections: Record<string, RegExp> = {
    'ačiū': /\baciu\b/gi,
    'prašau': /\bprasau\b/gi,
    'atsiprašau': /\batsiprasau\b/gi,
    'šiandien': /\bsiandien\b/gi,
    'ryšys': /\brysys\b/gi,
    'širdis': /\bsirdis\b/gi,
    'jaučiuosi': /\bjauciuosi\b/gi,
    'žmogus': /\bzmogus\b/gi,
    'kalbėti': /\bkalbeti\b/gi,
    'būti': /\bbuti\b/gi,
    'galėtum': /\bgaletum\b/gi,
    'norėčiau': /\bnoreciau\b/gi,
};

const allNeeds = Object.values(needsData).flat();
const allUnmetFeelings = Object.values(feelingsUnmetData).flat();

// --- MODULE-LEVEL STATE ---
let recognition: any = null; // Use `any` to avoid TS errors with vendor prefixes
// Game state
let score = 0;
let questionsAnswered = 0;
const TOTAL_QUESTIONS_PER_ROUND = 5;
const TIME_PER_QUESTION = 15; // seconds
let timeLeft = TIME_PER_QUESTION;
let timerInterval: number | null = null;
let isGameActive = false;
let currentGame: { statement: string; need: string; explanation: string; } | null = null;
let usedGameScenarios: number[] = [];
let currentERGame: { situation: string, correctResponse: string, explanation: string, incorrectResponses: string[] } | null = null;
let usedERScenarios: number[] = [];
let currentCFNGame: { feeling: string, correctNeed: string } | null = null;
let usedCFNScenarios: number[] = [];

// --- DOM ELEMENTS ---

const navButtons = {
    reframer: document.getElementById('nav-reframer')!,
    explorer: document.getElementById('nav-explorer')!,
    journey: document.getElementById('nav-journey')!,
    practice: document.getElementById('nav-practice')!,
    guide: document.getElementById('nav-guide')!,
};
const contentSections = {
    reframer: document.getElementById('reframer-section')!,
    explorer: document.getElementById('explorer-section')!,
    journey: document.getElementById('journey-section')!,
    practice: document.getElementById('practice-section')!,
    guide: document.getElementById('guide-section')!,
};
const rephraseButton = document.getElementById('rephrase-button') as HTMLButtonElement;
const userInput = document.getElementById('user-input') as HTMLTextAreaElement;
const micButton = document.getElementById('mic-button') as HTMLButtonElement;
const voiceSettingsButton = document.getElementById('voice-settings-button') as HTMLButtonElement;
const geminiOutput = document.getElementById('gemini-output') as HTMLDivElement;
const needsListContainer = document.getElementById('needs-list')!;
const feelingsMetContainer = document.getElementById('feelings-met')!;
const feelingsUnmetContainer = document.getElementById('feelings-unmet')!;
const feelingsTabs = document.querySelectorAll('.tab-link');
const feelingsTabContents = document.querySelectorAll('.tab-content');
// Example Sentence elements
const showExamplesButton = document.getElementById('show-examples-button') as HTMLButtonElement;
const examplesContainer = document.getElementById('examples-container') as HTMLDivElement;
// Situation Analyzer elements
const situationInput = document.getElementById('situation-input') as HTMLTextAreaElement;
const analyzeSituationButton = document.getElementById('analyze-situation-button') as HTMLButtonElement;
const situationOutput = document.getElementById('situation-output') as HTMLDivElement;
// Explorer lists toggle
const toggleExplorerListsButton = document.getElementById('toggle-explorer-lists-button') as HTMLButtonElement;
const exportExplorerButton = document.getElementById('export-explorer-button') as HTMLButtonElement;
const explorerContainer = document.getElementById('explorer-container') as HTMLDivElement;
// Share elements
const shareContainer = document.getElementById('share-container')!;
const shareButton = document.getElementById('share-button') as HTMLButtonElement;
const shareDropdown = document.getElementById('share-dropdown')!;
const copyButton = document.getElementById('copy-button') as HTMLButtonElement;
const emailButton = document.getElementById('email-button') as HTMLButtonElement;
const saveTxtButton = document.getElementById('save-txt-button') as HTMLButtonElement;
const savePdfButton = document.getElementById('save-pdf-button') as HTMLButtonElement;
// Modal elements
const modalContainer = document.getElementById('modal-container')!;
const modalTitle = document.getElementById('modal-title')!;
const modalBody = document.getElementById('modal-body')!;
const modalCloseButton = document.getElementById('modal-close-button')!;
const modalOverlay = document.getElementById('modal-overlay')!;
const modalRelatedContainer = document.getElementById('modal-related-container')!;
const modalRelatedTitle = document.getElementById('modal-related-title')!;
const modalRelatedList = document.getElementById('modal-related-list')!;
// Voice Settings Modal elements
const voiceModalContainer = document.getElementById('voice-modal-container')!;
const voiceModalOverlay = document.getElementById('voice-modal-overlay')!;
const voiceModalCloseButton = document.getElementById('voice-modal-close-button')!;
const languageSelect = document.getElementById('language-select') as HTMLSelectElement;
const saveVoiceSettingsButton = document.getElementById('save-voice-settings-button') as HTMLButtonElement;
// Saved items elements
const savedItemsContainer = document.getElementById('saved-items-container')!;
const savedItemsList = document.getElementById('saved-items-list')!;
const noSavedItemsMessage = document.getElementById('no-saved-items')!;

// --- Practice Game elements ---
const gameSelectionMenu = document.getElementById('game-selection-menu')!;
const gameContainerAll = document.getElementById('game-container-all')!;
const backToGamesButton = document.getElementById('back-to-games-button')!;
const gameViews = {
    'guess-need': document.getElementById('game-guess-need')!,
    'empathetic-response': document.getElementById('game-empathetic-response')!,
    'connect-feelings-needs': document.getElementById('game-connect-feelings-needs')!
};

// Guess the Need Game elements
const gameCard = document.getElementById('game-card')!;
const gameScenario = document.getElementById('game-scenario')!;
const gameOptionsContainer = document.getElementById('game-options')!;
const gameFeedback = document.getElementById('game-feedback')!;
const gameControlButton = document.getElementById('game-control-button') as HTMLButtonElement;
const gameStats = document.getElementById('game-stats')!;
const gameTimerDisplay = document.getElementById('game-timer-display')!;
const gameScoreDisplay = document.getElementById('game-score-display')!;
const gameSummary = document.getElementById('game-summary')!;
const finalScoreElement = document.getElementById('final-score')!;
const playAgainButton = document.getElementById('play-again-button') as HTMLButtonElement;

// Empathetic Response Game elements
const erGameScenario = document.getElementById('er-game-scenario')!;
const erGameOptionsContainer = document.getElementById('er-game-options')!;
const erGameFeedback = document.getElementById('er-game-feedback')!;
const erGameControlButton = document.getElementById('er-game-control-button') as HTMLButtonElement;

// Connect Feelings & Needs Game elements
const cfnDropZone = document.getElementById('cfn-drop-zone')!;
const cfnFeelingCard = document.getElementById('cfn-feeling-card')!;
const cfnDragOptionsContainer = document.getElementById('cfn-drag-options')!;
const cfnGameFeedback = document.getElementById('cfn-game-feedback')!;
const cfnGameControlButton = document.getElementById('cfn-game-control-button') as HTMLButtonElement;


// --- GEMINI API SETUP ---

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- RENDER FUNCTIONS ---

function createCategoryCard(title: string, items: string[]): string {
    const itemsHtml = items.map(item => `
        <li>
            <span class="item-text">${item}</span>
            <button class="save-btn" data-item-name="${item}" title="Išsaugoti terminą" aria-label="Išsaugoti ${item}">⭐</button>
        </li>
    `).join('');
    return `
        <div class="category-card">
            <h4>${title}</h4>
            <ul class="item-list">${itemsHtml}</ul>
        </div>
    `;
}

function renderData(container: HTMLElement, data: Record<string, string[]>) {
    container.innerHTML = Object.entries(data)
        .map(([category, items]) => createCategoryCard(category, items))
        .join('');
}

function renderExamples() {
    examplesContainer.innerHTML = exampleSentences.map(ex => `
        <div class="example-item">
            <p>"${ex.sentence}"</p>
            <div class="tags">
                <span class="tag feeling">Jausmas: ${ex.feeling}</span>
                <span class="tag need">Poreikis: ${ex.need}</span>
            </div>
        </div>
    `).join('');
}

// --- API CALL & SHARE FUNCTIONS ---

async function handleRephrase() {
    const prompt = userInput.value;
    if (!prompt.trim()) {
        geminiOutput.innerHTML = `<p class="placeholder">Įveskite sakinį, kurį norite performuluoti.</p>`;
        shareContainer.classList.add('hidden');
        return;
    }

    const selectedAudience = (document.querySelector('input[name="audience"]:checked') as HTMLInputElement)?.value || 'colleague';

    let audienceInstruction = '';
    switch (selectedAudience) {
        case 'child':
            audienceInstruction = "Prašymas skirtas vaikui. Pritaikyk kalbą, kad ji būtų paprasta, švelni ir tinkama amžiui. Sutelk dėmesį į aiškius, teigiamus veiksmus ir jausmų išreiškimą vaikui suprantamu būdu.";
            break;
        case 'partner':
            audienceInstruction = "Prašymas skirtas partneriui ar tėvams. Naudok toną, kuris skatina ryšį, abipusę pagarbą ir bendradarbiavimą. Laikykis prielaidos, kad tai lygiaverčių asmenų santykis.";
            break;
        case 'colleague':
            audienceInstruction = "Prašymas skirtas profesinei aplinkai – kolegai, mokytojui ar darbuotojui. Išlaikyk pagarbų, profesionalų toną, sutelktą į bendrus tikslus ir aiškius rezultatus.";
            break;
    }

    rephraseButton.disabled = true;
    shareContainer.classList.add('hidden');
    shareDropdown.classList.add('hidden');
    geminiOutput.innerHTML = 'Galvoju...';
    geminiOutput.classList.add('loading');

    try {
        const systemInstruction = `You are an expert in Nonviolent Communication (NVC) based on Marshall Rosenberg's principles. Your task is to help users rephrase their statements from vague, judgmental language into clear, constructive requests in Lithuanian.
Follow the four steps of NVC if possible, but prioritize a natural, conversational tone:
1. Observation (state facts without evaluation)
2. Feeling (express your emotion)
3. Need (identify the underlying need)
4. Request (make a clear, positive, and actionable request)

${audienceInstruction}

Example Input: "Norėčiau, kad susitvarkytum."
Example Output (for a partner/colleague): "Kai matau daiktus, išmėtytus ant grindų, jaučiuosi susirūpinęs, nes man svarbi tvarkinga ir jauki aplinka. Ar galėtum, prašau, sudėti daiktus į vietas?"

Now, rephrase the following user input:`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${systemInstruction}\n\n"${prompt}"`,
        });

        const cleanedText = response.text.trim().replace(/^```\w*\s*|\s*```$/g, '').trim();
        geminiOutput.textContent = cleanedText;
        
        shareContainer.classList.remove('hidden');

        const journeyData = getJourneyData();
        journeyData.rephrasedCount++;
        saveJourneyData(journeyData);

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        geminiOutput.textContent = 'Atsiprašome, įvyko klaida. Bandykite dar kartą.';
        shareContainer.classList.add('hidden');
    } finally {
        rephraseButton.disabled = false;
        geminiOutput.classList.remove('loading');
    }
}

async function handleAnalyzeSituation() {
    const situation = situationInput.value;
    if (!situation.trim()) {
        situationOutput.innerHTML = `<p class="placeholder">Prašome aprašyti situaciją.</p>`;
        situationOutput.classList.remove('hidden');
        return;
    }

    analyzeSituationButton.disabled = true;
    situationOutput.classList.remove('hidden');
    situationOutput.innerHTML = 'Analizuoju...';
    situationOutput.classList.add('loading');

    try {
        const systemInstruction = `You are an expert in Nonviolent Communication (NVC). Analyze the user's situation and identify potential unmet feelings and needs.
Respond ONLY with a JSON object.
The JSON object must have two keys: "feelings" (an array of strings) and "needs" (an array of strings).
For the "feelings" array, select the most relevant feelings from this list: ${JSON.stringify(allUnmetFeelings)}.
For the "needs" array, select the most relevant needs from this list: ${JSON.stringify(allNeeds)}.
The entire response must be in Lithuanian.
The user's situation is:`;

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                feelings: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                },
                needs: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        };

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${systemInstruction}\n\n"${situation}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const resultText = response.text.trim();
        const resultJson = JSON.parse(resultText) as { feelings: string[], needs: string[] };
        
        const journeyData = getJourneyData();
        journeyData.analyzedCount++;
        resultJson.feelings.forEach(feeling => {
            journeyData.identifiedFeelings[feeling] = (journeyData.identifiedFeelings[feeling] || 0) + 1;
        });
        resultJson.needs.forEach(need => {
            journeyData.identifiedNeeds[need] = (journeyData.identifiedNeeds[need] || 0) + 1;
        });
        saveJourneyData(journeyData);

        renderSituationAnalysis(resultJson);

    } catch (error) {
        console.error("Error analyzing situation:", error);
        situationOutput.innerHTML = '<p>Atsiprašome, įvyko klaida analizuojant situaciją. Bandykite dar kartą.</p>';
    } finally {
        analyzeSituationButton.disabled = false;
        situationOutput.classList.remove('loading');
    }
}

function renderSituationAnalysis(data: { feelings: string[], needs: string[] }) {
    if (!data || (!data.feelings?.length && !data.needs?.length)) {
        situationOutput.innerHTML = '<p>Nepavyko nustatyti galimų jausmų ar poreikių šioje situacijoje.</p>';
        return;
    }

    let html = '';

    if (data.feelings && data.feelings.length > 0) {
        html += `
            <h4>Galimi jausmai:</h4>
            <div class="suggestion-list">
                ${data.feelings.map(feeling => `<span class="suggestion-item item-text">${feeling}</span>`).join('')}
            </div>
        `;
    }

    if (data.needs && data.needs.length > 0) {
        html += `
            <h4>Galimi nepatenkinti poreikiai:</h4>
            <div class="suggestion-list">
                ${data.needs.map(need => `<span class="suggestion-item item-text">${need}</span>`).join('')}
            </div>
        `;
    }

    situationOutput.innerHTML = html;
}


// --- SHARE AND EXPORT FUNCTIONS ---

async function copyToClipboard() {
    const textToCopy = geminiOutput.textContent?.trim();
    if (!textToCopy) return;

    try {
        await navigator.clipboard.writeText(textToCopy);
        const originalText = copyButton.textContent;
        copyButton.textContent = 'Nukopijuota!';
        copyButton.disabled = true;
        setTimeout(() => {
            copyButton.textContent = originalText;
            copyButton.disabled = false;
            shareDropdown.classList.add('hidden');
        }, 2000);
    } catch (err) {
        console.error('Failed to copy text: ', err);
        alert('Nepavyko nukopijuoti teksto.');
        shareDropdown.classList.add('hidden');
    }
}

function shareViaEmail() {
    const textToShare = geminiOutput.textContent?.trim();
    if (!textToShare) return;
    
    const subject = encodeURIComponent('NVC Pasiūlymas');
    const body = encodeURIComponent(textToShare);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    shareDropdown.classList.add('hidden');
}

function shareAsTxt() {
    const textToSave = geminiOutput.textContent?.trim();
    if (!textToSave) return;

    const blob = new Blob([textToSave], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'nvc-pasiulymas.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    shareDropdown.classList.add('hidden');
}

function shareAsPdf() {
    const textToSave = geminiOutput.textContent?.trim();
    if (!textToSave) return;

    const doc = new jsPDF();

    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const usableWidth = pageWidth - (margin * 2);

    doc.setFontSize(12);
    try {
        doc.setFont('Helvetica', 'normal');
    } catch (e) {
        console.warn('Helvetica font not available, using default.');
    }

    const lines = doc.splitTextToSize(textToSave, usableWidth);
    doc.text(lines, margin, 20);

    doc.save('nvc-pasiulymas.pdf');
    shareDropdown.classList.add('hidden');
}

function exportExplorerToPdf() {
    const doc = new jsPDF();
    const margin = 15;
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const usableWidth = pageWidth - (margin * 2);
    let currentY = margin;

    const checkPageBreak = (neededHeight: number) => {
        if (currentY + neededHeight > pageHeight - margin) {
            doc.addPage();
            currentY = margin;
        }
    };
    
    try {
        doc.setFont('Helvetica', 'normal');
    } catch (e) {
        console.warn('Helvetica font not available, using default.');
    }

    doc.setFontSize(18);
    doc.text('Jausmų ir Poreikių Sąrašai (NVC)', pageWidth / 2, currentY, { align: 'center' });
    currentY += 15;

    const renderSection = (title: string, data: Record<string, string[]>) => {
        checkPageBreak(15);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(title, margin, currentY);
        currentY += 8;

        for (const [category, items] of Object.entries(data)) {
            checkPageBreak(12);
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.text(category, margin, currentY);
            currentY += 6;

            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            const itemLineHeight = 5;
            const itemIndent = margin + 5;

            for (const item of items) {
                const textWithBullet = `• ${item}`;
                const splitLines = doc.splitTextToSize(textWithBullet, usableWidth - (itemIndent - margin));
                const neededHeight = splitLines.length * itemLineHeight;

                checkPageBreak(neededHeight);
                
                doc.text(splitLines, itemIndent, currentY);
                currentY += neededHeight;
            }
            currentY += 4; // Space after category
        }
        currentY += 5; // Space after section
    };

    renderSection('Jausmai (kai poreikiai patenkinti)', feelingsMetData);
    renderSection('Jausmai (kai poreikiai nepatenkinti)', feelingsUnmetData);
    renderSection('Poreikiai', needsData);

    doc.save('NVC_Jausmai_ir_Poreikiai.pdf');
}


async function handleShare() {
    const textToShare = geminiOutput.textContent?.trim();
    if (!textToShare || geminiOutput.querySelector('.placeholder')) {
        return;
    }

    const shareData = {
        title: 'NVC Pasiūlymas',
        text: textToShare,
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            console.error('Share failed:', err);
        }
    } else {
        shareDropdown.classList.toggle('hidden');
    }
}


// --- MODAL & INTERACTIVITY FUNCTIONS ---
function openModal(title: string, content: string) {
    modalTitle.textContent = title;
    modalBody.textContent = content;

    const relatedNeeds = feelingToNeedsMap[title.toLowerCase()];
    if (relatedNeeds && relatedNeeds.length > 0) {
        modalRelatedTitle.textContent = 'Galimi susiję poreikiai:';
        modalRelatedList.innerHTML = relatedNeeds
            .map(need => `<button class="related-item-link" data-item-name="${need}">${need}</button>`)
            .join('');
        modalRelatedContainer.classList.remove('hidden');
    } else {
        modalRelatedContainer.classList.add('hidden');
    }

    modalContainer.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modalContainer.classList.add('hidden');
    if (voiceModalContainer.classList.contains('hidden')) {
        document.body.style.overflow = '';
    }
    const selected = document.querySelector('.item-list li.selected, #saved-items-list li.selected, .suggestion-item.selected');
    if (selected) {
        selected.classList.remove('selected');
    }
}

function openVoiceSettingsModal() {
    const settings = getVoiceSettings();
    languageSelect.value = settings.lang;
    voiceModalContainer.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeVoiceSettingsModal() {
    voiceModalContainer.classList.add('hidden');
    if (modalContainer.classList.contains('hidden')) {
        document.body.style.overflow = '';
    }
}

function handleItemClick(event: Event) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('item-text')) {
        const itemElement = target.closest('li, span');
        if (!itemElement) return;

        const itemName = target.textContent!.toLowerCase();
        const explanation = itemExplanations[itemName] || 'Atsiprašome, šiam terminui paaiškinimo kol kas neturime.';
        
        const currentlySelected = document.querySelector('.item-list li.selected, #saved-items-list li.selected, .suggestion-item.selected');
        if (currentlySelected) {
            currentlySelected.classList.remove('selected');
        }
        
        itemElement.classList.add('selected');

        openModal(target.textContent!, explanation);
    }
}

// --- LOCAL STORAGE & SAVED ITEMS FUNCTIONS ---

const USER_INPUT_KEY = 'nvcAppUserInput';
const USER_AUDIENCE_KEY = 'nvcAppUserAudience';
const SAVED_ITEMS_KEY = 'nvcSavedItems';
const VOICE_SETTINGS_KEY = 'nvcVoiceSettings';

interface VoiceSettings {
    lang: string;
}

function getVoiceSettings(): VoiceSettings {
    const saved = localStorage.getItem(VOICE_SETTINGS_KEY);
    return saved ? JSON.parse(saved) : { lang: 'lt-LT' };
}

function saveVoiceSettings(settings: VoiceSettings) {
    localStorage.setItem(VOICE_SETTINGS_KEY, JSON.stringify(settings));
}

function saveStateToLocalStorage() {
    localStorage.setItem(USER_INPUT_KEY, userInput.value);
    const selectedAudience = (document.querySelector('input[name="audience"]:checked') as HTMLInputElement)?.value;
    if (selectedAudience) {
        localStorage.setItem(USER_AUDIENCE_KEY, selectedAudience);
    }
}

function loadStateFromLocalStorage() {
    const savedInput = localStorage.getItem(USER_INPUT_KEY);
    if (savedInput) {
        userInput.value = savedInput;
    }

    const savedAudience = localStorage.getItem(USER_AUDIENCE_KEY);
    if (savedAudience) {
        const audienceRadioButton = document.querySelector(`input[name="audience"][value="${savedAudience}"]`) as HTMLInputElement;
        if (audienceRadioButton) {
            audienceRadioButton.checked = true;
        }
    }
}

function getSavedItems(): string[] {
    const saved = localStorage.getItem(SAVED_ITEMS_KEY);
    return saved ? JSON.parse(saved) : [];
}

function saveItems(items: string[]) {
    localStorage.setItem(SAVED_ITEMS_KEY, JSON.stringify(items));
}

function renderSavedItems() {
    const savedItems = getSavedItems();
    if (savedItems.length === 0) {
        savedItemsContainer.classList.add('hidden');
        noSavedItemsMessage.classList.remove('hidden');
        return;
    }

    savedItemsContainer.classList.remove('hidden');
    noSavedItemsMessage.classList.add('hidden');

    savedItemsList.innerHTML = savedItems.map(item => `
        <li>
            <span class="item-text">${item}</span>
            <button class="save-btn" data-item-name="${item}" title="Pašalinti terminą" aria-label="Pašalinti ${item}">⭐</button>
        </li>
    `).join('');
}

function updateAllSaveButtonsState() {
    const savedItems = getSavedItems();
    const allSaveButtons = document.querySelectorAll<HTMLButtonElement>('.save-btn');
    allSaveButtons.forEach(button => {
        const itemName = button.dataset.itemName;
        if (itemName && savedItems.includes(itemName)) {
            button.classList.add('saved');
            button.setAttribute('aria-label', `Pašalinti ${itemName}`);
            button.title = "Pašalinti terminą";
        } else {
            button.classList.remove('saved');
            button.setAttribute('aria-label', `Išsaugoti ${itemName}`);
            button.title = "Išsaugoti terminą";
        }
    });
}

function handleSaveClick(event: Event) {
    const target = event.target as HTMLElement;
    const saveButton = target.closest<HTMLButtonElement>('.save-btn');

    if (!saveButton) return;

    const itemName = saveButton.dataset.itemName;
    if (!itemName) return;

    let savedItems = getSavedItems();
    if (savedItems.includes(itemName)) {
        savedItems = savedItems.filter(i => i !== itemName);
    } else {
        savedItems.push(itemName);
    }
    saveItems(savedItems);

    renderSavedItems();
    updateAllSaveButtonsState();
}


// --- JOURNEY DASHBOARD ---

const JOURNEY_DATA_KEY = 'nvcJourneyData';

interface JourneyData {
    rephrasedCount: number;
    analyzedCount: number;
    identifiedFeelings: Record<string, number>;
    identifiedNeeds: Record<string, number>;
}

function getJourneyData(): JourneyData {
    const data = localStorage.getItem(JOURNEY_DATA_KEY);
    return data ? JSON.parse(data) : {
        rephrasedCount: 0,
        analyzedCount: 0,
        identifiedFeelings: {},
        identifiedNeeds: {}
    };
}

function saveJourneyData(data: JourneyData) {
    localStorage.setItem(JOURNEY_DATA_KEY, JSON.stringify(data));
}

function renderJourneyDashboard() {
    const container = contentSections.journey;
    const journeyData = getJourneyData();
    const savedItemsCount = getSavedItems().length;

    const totalActions = journeyData.rephrasedCount + journeyData.analyzedCount + savedItemsCount;

    if (totalActions === 0) {
        container.innerHTML = `
            <div class="journey-dashboard">
                <h2>Mano NVC kelionė</h2>
                <div class="journey-empty-state">
                    <h3>Jūsų kelionė dar neprasidėjo!</h3>
                    <p>Pradėkite naudotis <strong>Prašymų įrankiu</strong> arba <strong>Situacijos analizatoriumi</strong>, kad pamatytumėte savo progreso suvestinę.</p>
                </div>
            </div>
        `;
        return;
    }
    
    const renderCircularProgress = (count: number, goal: number, label: string, color: string) => {
        const progress = Math.min((count / goal) * 100, 100);
        const radius = 54;
        const circumference = 2 * Math.PI * radius;
        const offset = Math.max(0, circumference - (progress / 100) * circumference);

        return `
            <div class="stat-card progress-card">
                <div class="progress-circle-container">
                    <svg class="progress-circle" viewBox="0 0 120 120">
                        <circle class="progress-circle-bg" cx="60" cy="60" r="${radius}"></circle>
                        <circle class="progress-circle-bar" cx="60" cy="60" r="${radius}" transform="rotate(-90 60 60)" 
                                style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${offset}; stroke: ${color};"></circle>
                        <text class="progress-circle-text" x="50%" y="50%" dy=".3em" style="fill: ${color};">${count}</text>
                    </svg>
                </div>
                <div class="stat-label">${label}</div>
                <div class="stat-goal">Tikslas: ${goal}</div>
            </div>
        `;
    };

    const topFeelings = Object.entries(journeyData.identifiedFeelings)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    const maxFeelingCount = topFeelings.length > 0 ? topFeelings[0][1] : 0;

    const topNeeds = Object.entries(journeyData.identifiedNeeds)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    const maxNeedCount = topNeeds.length > 0 ? topNeeds[0][1] : 0;

    const renderProgressList = (items: [string, number][], maxCount: number, type: 'feeling' | 'need') => {
        if (items.length === 0) {
            return `<p class="placeholder">Dar neatpažinta jokių ${type === 'feeling' ? 'jausmų' : 'poreikių'}.</p>`;
        }
        return items.map(([name, count]) => `
            <div class="progress-item">
                <span class="progress-label">${name}</span>
                <div class="progress-bar-bg">
                    <div class="progress-bar" style="width: ${maxCount > 0 ? (count / maxCount) * 100 : 0}%"></div>
                </div>
                <span class="progress-value">${count}</span>
            </div>
        `).join('');
    };

    container.innerHTML = `
        <div class="journey-dashboard">
            <h2>Mano NVC kelionė</h2>
            <p>Jūsų progreso suvestinė, padedanti stebėti, kaip sekasi taikyti NVC principus.</p>
            <div class="journey-stats">
                ${renderCircularProgress(journeyData.rephrasedCount, 25, 'Performuluoti prašymai', 'var(--primary-color)')}
                ${renderCircularProgress(journeyData.analyzedCount, 25, 'Išanalizuotos situacijos', 'var(--secondary-color)')}
                <div class="stat-card">
                    <div class="stat-value">${savedItemsCount}</div>
                    <div class="stat-label">Išsaugoti terminai</div>
                </div>
            </div>
            <div class="progress-charts">
                <div class="chart-container">
                    <h3>Dažniausiai atpažinti jausmai</h3>
                    <div class="progress-list">
                        ${renderProgressList(topFeelings, maxFeelingCount, 'feeling')}
                    </div>
                </div>
                <div class="chart-container">
                    <h3>Dažniausiai atpažinti poreikiai</h3>
                    <div class="progress-list">
                        ${renderProgressList(topNeeds, maxNeedCount, 'need')}
                    </div>
                </div>
            </div>
            <div class="journey-actions">
                <button id="reset-journey-button">Iš naujo pradėti kelionę</button>
            </div>
        </div>
    `;

    document.getElementById('reset-journey-button')?.addEventListener('click', () => {
        if (confirm('Ar tikrai norite ištrinti visus savo kelionės duomenis? Šis veiksmas neatšaukiamas.')) {
            localStorage.removeItem(JOURNEY_DATA_KEY);
            renderJourneyDashboard();
        }
    });
}


// --- PRACTICE GAME FUNCTIONS ---

// --- Generic Helpers & Shuffling ---
function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// --- Game: Guess the Need ---
function generateGNOptions(correctNeed: string): string[] {
    const options: string[] = [correctNeed];
    const otherNeeds = allNeeds.filter(need => need !== correctNeed);
    while (options.length < 4 && otherNeeds.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherNeeds.length);
        options.push(otherNeeds.splice(randomIndex, 1)[0]);
    }
    return shuffleArray(options);
}

function stopGNTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateGNTimerDisplay() {
    gameTimerDisplay.textContent = String(timeLeft);
    const timerContainer = gameTimerDisplay.parentElement;
    if (timeLeft <= 5) {
        timerContainer?.classList.add('low-time');
    } else {
        timerContainer?.classList.remove('low-time');
    }
}

function handleGNTimeout() {
    if (!currentGame) return;

    gameFeedback.innerHTML = `Laikas baigėsi! Teisingas poreikis buvo <strong>${currentGame.need}</strong>. <p>${currentGame.explanation}</p>`;
    gameFeedback.className = 'game-feedback incorrect';
    gameFeedback.classList.remove('hidden');

    const correctButton = gameOptionsContainer.querySelector<HTMLButtonElement>(`[data-need="${currentGame.need}"]`);
    if (correctButton) correctButton.classList.add('correct');

    gameOptionsContainer.querySelectorAll('button').forEach(b => b.disabled = true);
    gameControlButton.textContent = 'Kita situacija';
    gameControlButton.disabled = false;
    questionsAnswered++;
}

function startGNTimer() {
    stopGNTimer();
    timeLeft = TIME_PER_QUESTION;
    updateGNTimerDisplay();
    timerInterval = window.setInterval(() => {
        timeLeft--;
        updateGNTimerDisplay();
        if (timeLeft <= 0) {
            stopGNTimer();
            handleGNTimeout();
        }
    }, 1000);
}

function renderNewGNRound() {
    if (questionsAnswered >= TOTAL_QUESTIONS_PER_ROUND) {
        endGNGame();
        return;
    }
    gameFeedback.classList.add('hidden');
    gameControlButton.disabled = true;
    gameOptionsContainer.querySelectorAll('button').forEach(b => {
        b.disabled = false;
        b.className = '';
    });
    if (usedGameScenarios.length === guessTheNeedGameData.length) usedGameScenarios = [];
    let scenarioIndex;
    do {
        scenarioIndex = Math.floor(Math.random() * guessTheNeedGameData.length);
    } while (usedGameScenarios.includes(scenarioIndex));
    usedGameScenarios.push(scenarioIndex);
    currentGame = guessTheNeedGameData[scenarioIndex];

    const options = generateGNOptions(currentGame.need);
    gameScenario.textContent = `„${currentGame.statement}“`;
    gameOptionsContainer.innerHTML = options.map(o => `<button data-need="${o}">${o}</button>`).join('');
    gameControlButton.textContent = 'Pasirinkite atsakymą...';
    startGNTimer();
}

function handleGNOptionClick(event: Event) {
    const target = event.target as HTMLElement;
    const selectedButton = target.closest<HTMLButtonElement>('button');
    if (!selectedButton || !currentGame || timerInterval === null) return;

    stopGNTimer();
    questionsAnswered++;
    const selectedNeed = selectedButton.dataset.need;
    const isCorrect = selectedNeed === currentGame.need;

    gameFeedback.classList.remove('hidden');
    if (isCorrect) {
        score++;
        gameScoreDisplay.textContent = String(score);
        gameFeedback.innerHTML = `<strong>Teisingai!</strong> <p>${currentGame.explanation}</p>`;
        gameFeedback.className = 'game-feedback correct';
        selectedButton.classList.add('correct');
    } else {
        gameFeedback.innerHTML = `Beveik. Teisingas poreikis buvo <strong>${currentGame.need}</strong>. <p>${currentGame.explanation}</p>`;
        gameFeedback.className = 'game-feedback incorrect';
        selectedButton.classList.add('incorrect');
        const correctButton = gameOptionsContainer.querySelector<HTMLButtonElement>(`[data-need="${currentGame.need}"]`);
        if (correctButton) correctButton.classList.add('correct');
    }

    gameOptionsContainer.querySelectorAll('button').forEach(b => b.disabled = true);
    if (questionsAnswered >= TOTAL_QUESTIONS_PER_ROUND) {
        gameControlButton.textContent = 'Žiūrėti rezultatus';
    } else {
        gameControlButton.textContent = 'Kita situacija';
    }
    gameControlButton.disabled = false;
}

function endGNGame() {
    isGameActive = false;
    stopGNTimer();
    gameCard.classList.add('hidden');
    gameSummary.classList.remove('hidden');
    finalScoreElement.innerHTML = `<span>${score}</span> iš ${TOTAL_QUESTIONS_PER_ROUND}`;
}

function startGNGame() {
    isGameActive = true;
    score = 0;
    questionsAnswered = 0;
    usedGameScenarios = [];
    gameScoreDisplay.textContent = '0';
    gameSummary.classList.add('hidden');
    gameCard.classList.remove('hidden');
    gameStats.classList.remove('hidden');
    gameControlButton.textContent = 'Kita situacija';
    renderNewGNRound();
}

// --- Game: Empathetic Response ---
function renderNewERRound() {
    erGameFeedback.classList.add('hidden');
    erGameControlButton.disabled = true;
    if (usedERScenarios.length === empatheticResponseGameData.length) usedERScenarios = [];

    let scenarioIndex;
    do {
        scenarioIndex = Math.floor(Math.random() * empatheticResponseGameData.length);
    } while (usedERScenarios.includes(scenarioIndex));
    usedERScenarios.push(scenarioIndex);
    currentERGame = empatheticResponseGameData[scenarioIndex];

    const options = shuffleArray([...currentERGame.incorrectResponses, currentERGame.correctResponse]);
    erGameScenario.textContent = `„${currentERGame.situation}“`;
    erGameOptionsContainer.innerHTML = options.map(option => `<button data-response="${option}">${option}</button>`).join('');
}

function handleEROptionClick(event: Event) {
    const target = event.target as HTMLElement;
    const selectedButton = target.closest<HTMLButtonElement>('button');
    if (!selectedButton || !currentERGame) return;

    const selectedResponse = selectedButton.dataset.response;
    const isCorrect = selectedResponse === currentERGame.correctResponse;
    erGameFeedback.classList.remove('hidden');

    if (isCorrect) {
        erGameFeedback.innerHTML = `<strong>Puikus empatiškas spėjimas!</strong> <p>${currentERGame.explanation}</p>`;
        erGameFeedback.className = 'game-feedback correct';
        selectedButton.classList.add('correct');
    } else {
        erGameFeedback.innerHTML = `<strong>Tai nėra empatiškas spėjimas.</strong> Pabandykime dar kartą. <p>${currentERGame.explanation}</p>`;
        erGameFeedback.className = 'game-feedback incorrect';
        selectedButton.classList.add('incorrect');
        const correctButton = erGameOptionsContainer.querySelector<HTMLButtonElement>(`[data-response="${currentERGame.correctResponse}"]`);
        if (correctButton) correctButton.classList.add('correct-outline');
    }

    erGameOptionsContainer.querySelectorAll('button').forEach(b => b.disabled = true);
    erGameControlButton.disabled = false;
}

// --- Game: Connect Feelings & Needs ---
function renderNewCFNRound() {
    cfnGameFeedback.classList.add('hidden');
    cfnGameControlButton.disabled = true;
    cfnDropZone.classList.remove('correct', 'incorrect');
    if (usedCFNScenarios.length === feelingsNeedsConnectionGameData.length) usedCFNScenarios = [];

    let scenarioIndex;
    do {
        scenarioIndex = Math.floor(Math.random() * feelingsNeedsConnectionGameData.length);
    } while (usedCFNScenarios.includes(scenarioIndex));
    usedCFNScenarios.push(scenarioIndex);
    currentCFNGame = feelingsNeedsConnectionGameData[scenarioIndex];

    const correctNeed = currentCFNGame.correctNeed;
    const options: string[] = [correctNeed];
    const otherNeeds = allNeeds.filter(need => need !== correctNeed);
    while (options.length < 4 && otherNeeds.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherNeeds.length);
        options.push(otherNeeds.splice(randomIndex, 1)[0]);
    }
    
    cfnFeelingCard.textContent = currentCFNGame.feeling;
    cfnDragOptionsContainer.innerHTML = shuffleArray(options).map(option =>
        `<div class="draggable-card" draggable="true" data-need="${option}">${option}</div>`
    ).join('');
}

function handleDragStart(e: DragEvent) {
    const target = e.target as HTMLElement;
    if (target.dataset.need && e.dataTransfer) {
        e.dataTransfer.setData('text/plain', target.dataset.need);
        target.classList.add('dragging');
    }
}
function handleDragEnd(e: DragEvent) {
    (e.target as HTMLElement).classList.remove('dragging');
}
function handleDragOver(e: DragEvent) {
    e.preventDefault();
    cfnDropZone.classList.add('drag-over');
}
function handleDragLeave() {
    cfnDropZone.classList.remove('drag-over');
}
function handleDrop(e: DragEvent) {
    e.preventDefault();
    if (!currentCFNGame || !e.dataTransfer) return;
    cfnDropZone.classList.remove('drag-over');
    const droppedNeed = e.dataTransfer.getData('text/plain');
    const isCorrect = droppedNeed === currentCFNGame.correctNeed;

    cfnGameFeedback.classList.remove('hidden');
    if (isCorrect) {
        cfnDropZone.classList.add('correct');
        cfnGameFeedback.innerHTML = `<strong>Teisingai!</strong> Jausmas „${currentCFNGame.feeling}“ dažnai signalizuoja apie nepatenkintą <strong>${currentCFNGame.correctNeed}</strong> poreikį.`;
        cfnGameFeedback.className = 'game-feedback correct';
    } else {
        cfnDropZone.classList.add('incorrect');
        cfnGameFeedback.innerHTML = `Beveik. Pabandykime kitą variantą.`;
        cfnGameFeedback.className = 'game-feedback incorrect';
    }
    
    cfnDragOptionsContainer.querySelectorAll('.draggable-card').forEach(card => {
        (card as HTMLElement).draggable = false;
        card.classList.add('disabled');
    });
    cfnGameControlButton.disabled = false;
}

// --- Main Game Setup ---
function setupPracticeGame() {
    // Game selection
    gameSelectionMenu.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const card = target.closest<HTMLButtonElement>('.game-selection-card');
        if (card && card.dataset.game) {
            const gameId = card.dataset.game as keyof typeof gameViews;
            gameSelectionMenu.classList.add('hidden');
            gameContainerAll.classList.remove('hidden');
            Object.values(gameViews).forEach(view => view.classList.add('hidden'));
            gameViews[gameId].classList.remove('hidden');

            // Start the selected game
            if (gameId === 'guess-need') startGame();
            if (gameId === 'empathetic-response') renderNewERRound();
            if (gameId === 'connect-feelings-needs') renderNewCFNRound();
        }
    });

    backToGamesButton.addEventListener('click', () => {
        gameContainerAll.classList.add('hidden');
        gameSelectionMenu.classList.remove('hidden');
        stopGNTimer();
        isGameActive = false;
    });

    // Guess the Need listeners
    gameControlButton.addEventListener('click', () => {
        if (!isGameActive) startGame();
        else renderNewGNRound();
    });
    playAgainButton.addEventListener('click', startGame);
    gameOptionsContainer.addEventListener('click', handleGNOptionClick);

    // Empathetic Response listeners
    erGameControlButton.addEventListener('click', renderNewERRound);
    erGameOptionsContainer.addEventListener('click', handleEROptionClick);

    // Connect Feelings & Needs listeners
    cfnGameControlButton.addEventListener('click', renderNewCFNRound);
    cfnDragOptionsContainer.addEventListener('dragstart', handleDragStart);
    cfnDragOptionsContainer.addEventListener('dragend', handleDragEnd);
    cfnDropZone.addEventListener('dragover', handleDragOver);
    cfnDropZone.addEventListener('dragleave', handleDragLeave);
    cfnDropZone.addEventListener('drop', handleDrop);
}

function startGame() {
    if (!isGameActive && gameViews['guess-need'].classList.contains('hidden')) {
        gameViews['guess-need'].classList.remove('hidden');
    }
    startGNGame();
}


// --- EVENT LISTENERS AND APP SETUP ---

function setupNavigation() {
    Object.values(navButtons).forEach(button => {
        button.addEventListener('click', () => {
            Object.values(navButtons).forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-current', 'false');
            });
            Object.values(contentSections).forEach(section => section.classList.remove('active'));

            button.classList.add('active');
            button.setAttribute('aria-current', 'page');
            const sectionId = button.id.replace('nav-', '') + '-section';
            document.getElementById(sectionId)?.classList.add('active');
        });
    });
}

function setupFeelingsTabs() {
    feelingsTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            feelingsTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const tabId = (tab as HTMLElement).dataset.tab;
            feelingsTabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id.includes(tabId!)) {
                    content.classList.add('active');
                }
            });
        });
    });
}

function setupExampleSentences() {
    showExamplesButton.addEventListener('click', () => {
        const isHidden = examplesContainer.classList.contains('hidden');
        if (isHidden) {
            if (examplesContainer.innerHTML.trim() === '') {
                renderExamples();
            }
            examplesContainer.classList.remove('hidden');
            showExamplesButton.textContent = 'Slėpti pavyzdžius';
        } else {
            examplesContainer.classList.add('hidden');
            showExamplesButton.textContent = 'Rodyti sakinių pavyzdžius';
        }
    });
}

function handleAutoCorrection(event: Event) {
    const input = event.target as HTMLTextAreaElement;
    const originalValue = input.value;
    const originalLength = originalValue.length;
    const cursorPosition = input.selectionStart;

    let correctedValue = originalValue;

    for (const [correct, incorrectRegex] of Object.entries(lithuanianCorrections)) {
        correctedValue = correctedValue.replace(incorrectRegex, (match) => {
            if (match === match.toUpperCase()) {
                return correct.toUpperCase();
            }
            if (match.charAt(0) === match.charAt(0).toUpperCase()) {
                return correct.charAt(0).toUpperCase() + correct.slice(1);
            }
            return correct;
        });
    }

    if (correctedValue !== originalValue) {
        const lengthDifference = correctedValue.length - originalLength;
        input.value = correctedValue;
        const newCursorPosition = cursorPosition + lengthDifference;
        input.setSelectionRange(newCursorPosition, newCursorPosition);
    }
}

function setupTextCorrection() {
    situationInput.addEventListener('input', handleAutoCorrection);
}

function setupInteractiveExplorer() {
    const explorerSection = document.getElementById('explorer-section')!;
    explorerSection.addEventListener('click', handleItemClick);
    explorerSection.addEventListener('click', handleSaveClick);

    analyzeSituationButton.addEventListener('click', handleAnalyzeSituation);
    exportExplorerButton.addEventListener('click', exportExplorerToPdf);
    setupExampleSentences();
    setupTextCorrection();

    toggleExplorerListsButton.addEventListener('click', () => {
        const isHidden = explorerContainer.classList.contains('hidden');
        explorerContainer.classList.toggle('hidden');
        if (isHidden) {
            toggleExplorerListsButton.textContent = 'Slėpti jausmų ir poreikių sąrašus';
        } else {
            toggleExplorerListsButton.textContent = 'Rodyti jausmų ir poreikių sąrašus';
        }
    });

    modalCloseButton.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !modalContainer.classList.contains('hidden')) {
            closeModal();
        }
    });

    modalRelatedList.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        if (target.classList.contains('related-item-link')) {
            const itemName = target.dataset.itemName;
            if (itemName) {
                const explanation = itemExplanations[itemName] || 'Atsiprašome, šiam terminui paaiškinimo kol kas neturime.';
                openModal(itemName, explanation);
            }
        }
    });
}

function setupVoiceSettings() {
    voiceSettingsButton.addEventListener('click', openVoiceSettingsModal);
    voiceModalCloseButton.addEventListener('click', closeVoiceSettingsModal);
    voiceModalOverlay.addEventListener('click', closeVoiceSettingsModal);
    saveVoiceSettingsButton.addEventListener('click', () => {
        const newSettings: VoiceSettings = { lang: languageSelect.value };
        saveVoiceSettings(newSettings);
        
        if (recognition) {
            if (micButton.classList.contains('listening')) {
                recognition.stop();
            }
            recognition.lang = newSettings.lang;
        }

        closeVoiceSettingsModal();
    });
}

function setupSpeechRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
        micButton.style.display = 'none';
        voiceSettingsButton.style.display = 'none';
        console.warn("Speech Recognition API not supported in this browser.");
        return;
    }

    const settings = getVoiceSettings();
    recognition = new SpeechRecognition();
    recognition.lang = settings.lang;
    recognition.interimResults = true;
    recognition.continuous = false;

    let isListening = false;
    let finalTranscript = '';

    recognition.onstart = () => {
        isListening = true;
        micButton.classList.add('listening');
        micButton.title = 'Sustabdyti įrašymą';
        micButton.setAttribute('aria-label', 'Sustabdyti įrašymą');
        finalTranscript = userInput.value;
    };

    recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += (finalTranscript ? ' ' : '') + event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        userInput.value = finalTranscript + interimTranscript;
    };

    recognition.onend = () => {
        isListening = false;
        micButton.classList.remove('listening');
        micButton.title = 'Įvesti balsu';
        micButton.setAttribute('aria-label', 'Įvesti balsu');
        userInput.dispatchEvent(new Event('input'));
    };

    recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        isListening = false;
        micButton.classList.remove('listening');
        micButton.title = 'Įvesti balsu';
        micButton.setAttribute('aria-label', 'Įvesti balsu');
    };

    micButton.addEventListener('click', () => {
        if (isListening) {
            recognition.stop();
        } else {
            recognition.lang = getVoiceSettings().lang;
            recognition.start();
        }
    });
}

function setupStatePersistence() {
    userInput.addEventListener('input', saveStateToLocalStorage);
    const audienceRadios = document.querySelectorAll('input[name="audience"]');
    audienceRadios.forEach(radio => {
        radio.addEventListener('change', saveStateToLocalStorage);
    });
}

function setupShareInteractions() {
    shareButton.addEventListener('click', handleShare);
    copyButton.addEventListener('click', copyToClipboard);
    emailButton.addEventListener('click', shareViaEmail);
    saveTxtButton.addEventListener('click', shareAsTxt);
    savePdfButton.addEventListener('click', shareAsPdf);

    document.addEventListener('click', (event) => {
        if (!shareContainer.contains(event.target as Node) && !shareDropdown.classList.contains('hidden')) {
            shareDropdown.classList.add('hidden');
        }
    });
}


function init() {
    loadStateFromLocalStorage();
    renderData(needsListContainer, needsData);
    renderData(feelingsMetContainer, feelingsMetData);
    renderData(feelingsUnmetContainer, feelingsUnmetData);

    renderSavedItems();
    updateAllSaveButtonsState();

    setupNavigation();
    setupFeelingsTabs();
    setupInteractiveExplorer();
    setupSpeechRecognition();
    setupVoiceSettings();
    setupStatePersistence();
    setupShareInteractions();
    setupPracticeGame();
    
    rephraseButton.addEventListener('click', handleRephrase);
    navButtons.journey.addEventListener('click', renderJourneyDashboard);
    
    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleRephrase();
        }
    });

    console.log("NVC Guide Initialized");
}

init();