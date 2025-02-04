const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const cors = require('cors');

const app = express();
const PORT = 5000;
app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

let schedules = []; // Temporary storage for schedules

// Upload and process Excel file
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    
    schedules = sheetData.map(row => ({
        time: row.Time,  // Assuming 'Time' is a column in Excel
        task: row.Task,  // Assuming 'Task' is a column in Excel
        notification: row.Notification || false,
        notes: row.Notes || '', // New: Notes for reference
        status: row.Status || 'Not Completed' // New: Status options
    }));
    
    res.json({ message: 'Schedule uploaded successfully', schedules });
});

// Get schedules
app.get('/schedules', (req, res) => {
    res.json(schedules);
});

// Update schedule status or reschedule
app.post('/update-schedule', (req, res) => {
    const { time, status, notes } = req.body;
    const schedule = schedules.find(s => s.time === time);
    if (schedule) {
        schedule.status = status || schedule.status;
        schedule.notes = notes || schedule.notes;
        res.json({ message: 'Schedule updated successfully', schedule });
    } else {
        res.status(404).json({ error: 'Schedule not found' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
