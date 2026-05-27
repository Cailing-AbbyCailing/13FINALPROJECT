// ==========================================
// 1. DATABASE CONFIGURATION & INITIALIZATION
// ==========================================
const SUPABASE_URL = "https://cmjhlvtolmbjumyffls.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_4DRlv_pUAl9upLZjjdJoGA_0IW2iV1A";
let _supabase = null;


try {
    if (typeof supabase !== 'undefined') {
        _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        console.warn("Supabase library script loader not found. Cloud sync capabilities will be offline.");
    }
} catch (e) {
    console.error("Failed to initialize Supabase:", e);
}

// ==========================================
// 2. MAIN MENU FUNCTIONALITIES
// ==========================================

function openNewGame() {
    console.log("New Game clicked");
    const modal = document.getElementById("new-game-modal") || document.getElementById("new game modal") || document.getElementById("new_game_modal");
    if (modal) {
        modal.style.setProperty("display", "flex", "important");
        modal.classList.add("active");
    } else {
        alert("Starting a New Game! (Modal element not found, check your HTML IDs)");
    }
}

function closeNewGame() {
    console.log("Cancel New Game clicked");
    const modal = document.getElementById("new-game-modal") || document.getElementById("new game modal") || document.getElementById("new_game_modal");
    if (modal) {
        modal.style.setProperty("display", "none", "important");
        modal.classList.remove("active");
    }
}

function openScoreboard() {
    console.log("History clicked");
    const modal = document.getElementById("scoreboard-modal") || document.getElementById("history-modal") || document.getElementById("history_modal");
    if (modal) {
        modal.style.setProperty("display", "flex", "important");
        modal.classList.add("active");
        
        const tableBody = document.getElementById("scoreboard-rows");
        if (tableBody && tableBody.innerHTML.trim() === "") {
            tableBody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:15px; color:#726891;">Loading records...</td></tr>`;
        }
    } else {
        alert("Opening Match History/Leaderboard...");
    }
}

function closeScoreboard() {
    const modal = document.getElementById("scoreboard-modal") || document.getElementById("history-modal") || document.getElementById("history_modal");
    if (modal) {
        modal.style.setProperty("display", "none", "important");
        modal.classList.remove("active");
    }
}


function openRules() {
    console.log("Rules clicked");
    const modal = document.getElementById("rules-modal") || document.getElementById("rules_modal");
    if (modal) {
        modal.style.setProperty("display", "flex", "important");
        modal.classList.add("active");
    } else {
        alert("How to Play: Move the Knight in an L-shape across the board without landing on the same tile twice!");
    }
}

function closeRules() {
    const modal = document.getElementById("rules-modal") || document.getElementById("rules_modal");
    if (modal) {
        modal.style.setProperty("display", "none", "important");
        modal.classList.remove("active");
    }
}

function exitGame() {
    console.log("Exit clicked");
    if (confirm("Are you sure you want to exit to the login page?")) {
        window.location.href = "index.html";
    }
}

// ==========================================
// 3. SAVED STATE MANAGEMENT UTILITIES
// ==========================================

function checkSaveGame() {
    try {
        let hasSavedProgress = localStorage.getItem("knightsTourSave");
        
        if (!hasSavedProgress) {
            const modal = document.getElementById("no-save-modal");
            if (modal) {
                modal.style.setProperty("display", "flex", "important");
                modal.classList.add("active");
            } else {
                alert("No saved game found to continue!");
            }
        } else {
            let savedMode = localStorage.getItem("knightsTourSavedMode") || "competitor"; 
            window.location.href = `${savedMode}.html?load=true`;
        }
    } catch (err) {
        console.error("Error reading saved progress state:", err);
    }
}

function closeModal() {
    const modals = document.querySelectorAll('.modal-overlay, #no-save-modal, #new-game-modal, #scoreboard-modal, #history-modal, #rules-modal');
    modals.forEach(modal => {
        modal.style.setProperty("display", "none", "important");
        modal.classList.remove("active");
    });
}

// ==========================================
// 4. PERSISTENT TELEMETRY SYNCHRONIZATION
// ==========================================

async function uploadGameScore(gameMode, tilesClearedCount, timeString) {
    if (!_supabase) {
        console.warn("Database offline. Score was saved locally but not synced online.");
        return;
    }

    const activePlayer = localStorage.getItem("currentUser") || "Guest Player";
    
    try {
        const { data, error } = await _supabase
            .from('scoreboard') 
            .insert([{ 
                username: activePlayer, 
                mode: gameMode, 
                tiles_cleared: parseInt(tilesClearedCount) || 0, 
                time: timeString 
             }]);

        if (error) console.error("Supabase error:", error.message);
    } catch (err) {
        console.error("Telemetry error:", err);
    }
}