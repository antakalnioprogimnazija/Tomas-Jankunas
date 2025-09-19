/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI } from '@google/genai';

// --- DATA FROM IMAGES ---

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


// --- DOM ELEMENTS ---

const navButtons = {
    reframer: document.getElementById('nav-reframer')!,
    explorer: document.getElementById('nav-explorer')!,
    guide: document.getElementById('nav-guide')!,
};
const contentSections = {
    reframer: document.getElementById('reframer-section')!,
    explorer: document.getElementById('explorer-section')!,
    guide: document.getElementById('guide-section')!,
};
const rephraseButton = document.getElementById('rephrase-button') as HTMLButtonElement;
const userInput = document.getElementById('user-input') as HTMLTextAreaElement;
const geminiOutput = document.getElementById('gemini-output') as HTMLDivElement;
const needsListContainer = document.getElementById('needs-list')!;
const feelingsMetContainer = document.getElementById('feelings-met')!;
const feelingsUnmetContainer = document.getElementById('feelings-unmet')!;
const feelingsTabs = document.querySelectorAll('.tab-link');
const feelingsTabContents = document.querySelectorAll('.tab-content');
// Share elements
const shareContainer = document.getElementById('share-container')!;
const shareButton = document.getElementById('share-button') as HTMLButtonElement;
const shareDropdown = document.getElementById('share-dropdown')!;
const copyButton = document.getElementById('copy-button') as HTMLButtonElement;
const emailButton = document.getElementById('email-button') as HTMLButtonElement;
// Modal elements
const modalContainer = document.getElementById('modal-container')!;
const modalTitle = document.getElementById('modal-title')!;
const modalBody = document.getElementById('modal-body')!;
const modalCloseButton = document.getElementById('modal-close-button')!;
const modalOverlay = document.getElementById('modal-overlay')!;
// Saved items elements
const savedItemsContainer = document.getElementById('saved-items-container')!;
const savedItemsList = document.getElementById('saved-items-list')!;
const noSavedItemsMessage = document.getElementById('no-saved-items')!;


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

        // Clean up potential markdown formatting from the response text
        const cleanedText = response.text.trim().replace(/^```\w*\s*|\s*```$/g, '').trim();
        geminiOutput.textContent = cleanedText;
        
        shareContainer.classList.remove('hidden');
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        geminiOutput.textContent = 'Atsiprašome, įvyko klaida. Bandykite dar kartą.';
        shareContainer.classList.add('hidden');
    } finally {
        rephraseButton.disabled = false;
        geminiOutput.classList.remove('loading');
    }
}

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
    modalContainer.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeModal() {
    modalContainer.classList.add('hidden');
    document.body.style.overflow = ''; // Restore scrolling
    const selected = document.querySelector('.item-list li.selected, #saved-items-list li.selected');
    if (selected) {
        selected.classList.remove('selected');
    }
}

function handleItemClick(event: Event) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('item-text')) {
        const listItem = target.closest('li');
        if (!listItem) return;

        const itemName = target.textContent!.toLowerCase();
        const explanation = itemExplanations[itemName] || 'Atsiprašome, šiam terminui paaiškinimo kol kas neturime.';
        
        const currentlySelected = document.querySelector('.item-list li.selected, #saved-items-list li.selected');
        if (currentlySelected) {
            currentlySelected.classList.remove('selected');
        }
        
        listItem.classList.add('selected');

        openModal(target.textContent!, explanation);
    }
}

// --- LOCAL STORAGE & SAVED ITEMS FUNCTIONS ---

const USER_INPUT_KEY = 'nvcAppUserInput';
const USER_AUDIENCE_KEY = 'nvcAppUserAudience';
const SAVED_ITEMS_KEY = 'nvcSavedItems';

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

function setupInteractiveExplorer() {
    const explorerSection = document.getElementById('explorer-section')!;
    explorerSection.addEventListener('click', handleItemClick);
    explorerSection.addEventListener('click', handleSaveClick);

    modalCloseButton.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !modalContainer.classList.contains('hidden')) {
            closeModal();
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

    // Close dropdown if clicked outside
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
    setupStatePersistence();
    setupShareInteractions();
    
    rephraseButton.addEventListener('click', handleRephrase);
    
    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleRephrase();
        }
    });

    console.log("NVC Guide Initialized");
}

init();