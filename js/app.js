
const DB_KEY = "campslot_db_v8";
const SESSION_KEY = "lpu_CampSlot_session";

function seedDatabase() {
    if (localStorage.getItem(DB_KEY)) return;
    const today = new Date().toISOString().split("T")[0];
    const initialData = {
        users: [
            { id: 1, name: "Admin", email: "admin@lpu.in", password: "123", role: "admin", status: "approved", section: "", department: "Administration" },
            { id: 2, name: "Dr. Dhiraj Kapila", email: "faculty@lpu.in", password: "123", role: "faculty", status: "approved", section: "", department: "Internet Programming" },
            { id: 3, name: "Student", email: "student@lpu.in", password: "123", role: "student", status: "approved", section: "K4P26BH", department: "Computer Science" }
        ],
        blocks: [
            { id: 1, building_number: "34", block_name: "Block 34 - CSE", description: "School of Computer Science & Engineering" },
            { id: 2, building_number: "38", block_name: "Block 38 - Auditorium & Labs", description: "Central Seminar Halls & High-Performance Labs" }
        ],
        rooms: [
            { id: 1, room_number: "34-101", block_id: 1, capacity: 60, room_type: "Classroom" },
            { id: 2, room_number: "34-204", block_id: 1, capacity: 40, room_type: "Computer Lab" },
            { id: 3, room_number: "38-301", block_id: 2, capacity: 150, room_type: "Seminar Hall" },
            { id: 4, room_number: "38-105", block_id: 2, capacity: 80, room_type: "Lecture Hall" }
        ],
        schedule: [
            { id: 1, section: "K4P26BH", department: "Computer Science", day: "Monday", subject: "CSE326: Internet Programming", faculty_id: 2, room_id: 2, start_time: "09:00", end_time: "11:00" },
            { id: 2, section: "K4P26BH", department: "Computer Science", day: "Wednesday", subject: "CSE202: Data Structures", faculty_id: 2, room_id: 1, start_time: "11:00", end_time: "13:00" }
        ],
        bookings: [
            { id: 101, user_id: 2, room_id: 3, purpose: "Web Development Hackathon Briefing", booking_date: today, start_time: "14:00", end_time: "16:00", status: "Approved" },
            { id: 102, user_id: 2, room_id: 1, purpose: "Extra Doubt Clearing Session", booking_date: today, start_time: "16:00", end_time: "17:00", status: "Pending" }
        ]
    };
    localStorage.setItem(DB_KEY, JSON.stringify(initialData));
}

function getDB() {
    seedDatabase();
    return JSON.parse(localStorage.getItem(DB_KEY));
}

function saveDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function getSession() {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
}

function requireAuth(expectedRole) {
    const user = getSession();
    if (!user) { window.location.href = "login.html"; return null; }
    if (expectedRole && user.role !== expectedRole) { redirectDashboard(user.role); return null; }
    return user;
}

function redirectDashboard(role) {
    if (role === "admin") window.location.href = "admin_dashboard.html";
    else if (role === "faculty") window.location.href = "faculty_dashboard.html";
    else window.location.href = "student_dashboard.html";
}

function logout() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = "login.html";
}

function showFlash(msg, type = "success") {
    const box = document.getElementById("flash-box");
    if (!box) return;
    box.innerHTML = `<div class="flash ${type}">${msg}</div>`;
    setTimeout(() => { box.innerHTML = ""; }, 4000);
}

function timesOverlap(s1, e1, s2, e2) {
    return s1 < e2 && e1 > s2;
}

function getDayName(dateStr) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[new Date(dateStr + "T00:00:00").getDay()];
}

function checkRoomConflict(roomId, dateStr, startTime, endTime) {
    const db = getDB();
    const dayName = getDayName(dateStr);
    const schedConflict = db.schedule.find(s =>
        Number(s.room_id) === Number(roomId) &&
        s.day.toLowerCase() === dayName.toLowerCase() &&
        timesOverlap(startTime, endTime, s.start_time, s.end_time)
    );
    if (schedConflict) return `Conflict with scheduled class: ${schedConflict.subject} (${schedConflict.start_time}-${schedConflict.end_time})`;

    const bookConflict = db.bookings.find(b =>
        Number(b.room_id) === Number(roomId) &&
        b.booking_date === dateStr &&
        b.status !== "Rejected" &&
        timesOverlap(startTime, endTime, b.start_time, b.end_time)
    );
    if (bookConflict) return `Conflict with existing booking (${bookConflict.status}): ${bookConflict.purpose} (${bookConflict.start_time}-${bookConflict.end_time})`;

    return null;
}

seedDatabase();
