// ==========================================
// 1. DATABASE CONFIGURATION & INITIALIZATION
// ==========================================
const SUPABASE_URL = "https://cmjhlvtolmbjumyffls.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_4DRlv_pUAl9upLZjjdJoGA_0IW2iV1A";
let _supabase = null;

// Safely initialize the client only if the Supabase SDK has been imported
if (typeof supabase !== 'undefined') {
    _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.warn("Supabase library script loader not found. Cloud sync capabilities will be offline.");
}

// ==========================================
// 2. SAVED STATE MANAGEMENT UTILITIES
// ==========================================

/**
 * Evaluates local storage for a valid active game cache.
 * Routes to the corresponding gameplay scene dynamically or opens the warning modal.
 */
function checkSaveGame() {
    let hasSavedProgress = localStorage.getItem("knightsTourSave");
    
    if (!hasSavedProgress) {
        const modal = document.getElementById("no-save-modal");
        if (modal) {
            modal.classList.add("active");
        } else {
            console.error("DOM Error: Element with ID 'no-save-modal' was not found in the current layout framework.");
        }
    } else {
        // --- FIX: Read the saved level type to know where to redirect ---
        // Defaults to competitor.html if specific mode wasn't cached
        let savedMode = localStorage.getItem("knightsTourSavedMode") || "competitor"; 
        window.location.href = `${savedMode}.html?load=true`;
    }
}

/**
 * Hides the alert panel interaction element smoothly.
 */
function closeModal() {
    const modal = document.getElementById("no-save-modal");
    if (modal) {
        modal.classList.remove("active");
    }
}

// ==========================================
// 3. PERSISTENT TELEMETRY SYNCHRONIZATION
// ==========================================

/**
 * Submits metrics records directly to the cloud storage table matrix.
 */
async function uploadGameScore(gameMode, tilesClearedCount, timeString) {
    if (!_supabase) {
        console.error("Database Core Inaccessible: Client tracking runtime was not successfully initiated.");
        return;
    }

    const activePlayer = localStorage.getItem("currentUser") || "Guest Player";
    
    // Send payload directly to the 'scoreboard' database structure
    const { data, error } = await _supabase
        .from('scoreboard') 
        .insert([{ 
            username: activePlayer, 
            mode: gameMode, 
            tiles_cleared: tilesClearedCount, 
            time: timeString 
         }]);

    if (error) {
        console.error("Supabase Telemetry Upload Exception Error:", error.message);
    } else {
        console.log("Telemetry analytics record securely synchronized with remote cloud storage.");
    }
}