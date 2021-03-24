const express = require('express')
const app = express()
var path = require('path')
const mysql = require('mysql')

app.use(express.json());

const port = process.env.PORT || 8080

// Create connection
const db_connection = mysql.createConnection({
    host: "localhost",
    user: "isalabpr_quiz",
    password: "isalab05!",
    database: "isalabpr_quiz"
})

queryPromise = (queryText, values) => {
    return new Promise((resolve, reject) => {
        db_connection.query(queryText, values, (error, result) => {
            if (error) {
                reject(error);
            }
            resolve(result);
        });
    });
};


app.use(express.static(__dirname + '/../public'))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../frontend/index.html'))
})

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname + '/../frontend/admin.html'))
})

app.get('/student', (req, res) => {
    res.sendFile(path.join(__dirname + '/../frontend/student.html'))
})

app.get('/question', (req, res) => {
    const json = [
        { id: 1, question: "a question", answers: [], key: 5 },
        { id: 2, question: "a question", answers: [], key: 5 }
    ]

    db_connection.connect();

    try {

    } catch (error) {

    } finally {
        db_connection.end();
    }
    // db_connection.connect()

    // db_connection.query('SELECT 1 + 1 AS solution', function (err, rows, fields) {
    //     if (err) throw err

    //     console.log('The solution is: ', rows[0].solution)
    // })

    // db_connection.end()
    res.send(json);
})

app.put('/question', (req, res) => {
    console.log("PUT question", req.body);
    // db_connection.connect()

    // db_connection.query('SELECT 1 + 1 AS solution', function (err, rows, fields) {
    //     if (err) throw err

    //     console.log('The solution is: ', rows[0].solution)
    // })

    // db_connection.end()
    res.send("OK");
})

app.delete('/question/:id', (req, res) => {
    const { id } = req.params;
    console.log("DELETE question", id);
    // db_connection.connect()

    // db_connection.query('SELECT 1 + 1 AS solution', function (err, rows, fields) {
    //     if (err) throw err

    //     console.log('The solution is: ', rows[0].solution)
    // })

    // db_connection.end()
    res.send("OK");
})

class Question {
    constructor(id, qText, answers, correctAnswerId) {
        this.id = id;
        this.question = qText;
        this.answers = answers;
        this.key = correctAnswerId; //valid question id
    }
}

class Answer {
    constructor(id, value) {
        this.id = id;
        this.value = value;
    }
}

app.post('/question', async (req, res) => {
    console.log("POST question", req.body);

    db_connection.connect();

    const insertAnswerQuery = "INSERT INTO answer (Description) VALUES(?)";
    const insertQuestionQuery = "INSERT INTO question (Description, CorrectAnswer) VALUES(?, ?)";
    const insertQAPairQuery = "INSERT INTO questionanswer (QuestionId, AnswerId) VALUES(?, ?)";

    const question = req.body;
    let correctAnswer;

    try {
        // Insert answers
        for (let i = 0; i < question.answers.length; i++) {
            const answer = question.answers[i];

            let result = await queryPromise(insertAnswerQuery, [answer.value]);
            console.log(result);

            if (question.key === answer.id) {
                correctAnswer = result.insertId;
                console.log("correctAnswer: ", correctAnswer);
            }
            question.answers[i].id = result.insertId;
        }

        question.key = correctAnswer;


        // Insert question
        let result = await queryPromise(insertQuestionQuery, [question.question, question.key]);
        console.log('question result.insertId: ', result.insertId);
        question.id = result.insertId;


        // Insert question and answers ids in an associative table
        for (let i = 0; i < question.answers.length; i++) {
            queryPromise(insertQAPairQuery, [question.id, question.answers[i].id])
                .then((result) => console.log(result));
        }

        res.send(JSON.stringify(question));
    }
    catch (error) {
        res.status(500).send(JSON.stringify(error));
    } finally {
        db_connection.end();
    }

})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
