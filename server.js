const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const db = new sqlite3.Database(':memory:'); // 메모리 내 데이터베이스 사용

app.use(bodyParser.json());
app.use(cors());

// 데이터베이스 테이블 생성
db.serialize(() => {
    db.run("CREATE TABLE markers (id INTEGER PRIMARY KEY, lat REAL, lng REAL, name TEXT)");
});

// 마커 데이터 저장 엔드포인트
app.post('/api/markers', (req, res) => {
    const { lat, lng, name } = req.body;
    const stmt = db.prepare("INSERT INTO markers (lat, lng, name) VALUES (?, ?, ?)");
    stmt.run(lat, lng, name, function(err) {
        if (err) {
            res.status(500).send({ error: 'Database error' });
        } else {
            res.status(200).send({ id: this.lastID });
        }
    });
    stmt.finalize();
});

// 마커 데이터 가져오기 엔드포인트
app.get('/api/markers', (req, res) => {
    db.all("SELECT * FROM markers", (err, rows) => {
        if (err) {
            res.status(500).send({ error: 'Database error' });
        } else {
            res.status(200).json(rows);
        }
    });
});

// 마커 데이터 삭제 엔드포인트
app.delete('/api/markers/:id', (req, res) => {
    const { id } = req.params;
    const stmt = db.prepare("DELETE FROM markers WHERE id = ?");
    stmt.run(id, function(err) {
        if (err) {
            res.status(500).send({ error: 'Database error' });
        } else {
            res.status(200).send({ id });
        }
    });
    stmt.finalize();
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
