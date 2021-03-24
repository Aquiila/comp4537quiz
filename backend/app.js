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

const express = require('express')
const app = express()
var path = require('path')
const mysql = require('mysql')

app.use(express.json());

const port = process.env.PORT || 8080;

const host = "";
// const host = "/assignment";

// Create connection
const db_connection = mysql.createConnection({
    host: "localhost",
    user: "isalabpr_quiz",
    password: "isalab05!",
    database: "isalabpr_quiz"
})

db_connection.connect();

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


app.use('/', express.static(__dirname + '/../public'))
// app.use('/assignment', express.static(__dirname + '/../public'))

app.get(host + '/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../frontend/index.html'))
})

app.get(host + '/admin', (req, res) => {
    res.sendFile(path.join(__dirname + '/../frontend/admin.html'))
})

app.get(host + '/student', (req, res) => {
    res.sendFile(path.join(__dirname + '/../frontend/student.html'))
})

app.get(host + '/question', async (req, res) => {
    const getAllQuestionsQuery = "SELECT * FROM question";
    const getAnswersQuery = `SELECT a.Id, a.Description FROM answer AS a
                            INNER JOIN questionanswer AS qa ON a.Id = qa.AnswerId
                            WHERE qa.QuestionId = ?`;

    let questions = [];

    try {
        let qResults = await queryPromise(getAllQuestionsQuery);
        console.log("qResults: ", qResults);

        for (const qResult of qResults) {
            console.log("inside for loop: ", qResult.Id);
            let question = new Question(qResult.Id, qResult.Description, [], qResult.CorrectAnswer);
            let answers = [];

            let aResults = await queryPromise(getAnswersQuery, [question.id]);
            console.log("aResults", aResults);

            for (const aResult of aResults) {
                let answer = new Answer(aResult.Id, aResult.Description);
                answers.push(answer);
            }

            question.answers = answers;
            questions.push(question);
        }

        console.log("questions", questions);
        res.send(JSON.stringify(questions));
    } catch (error) {
        console.log(error);
        res.send(JSON.stringify(error));
    }
})

app.put(host + '/question', (req, res) => {
    console.log("PUT question", req.body);

    res.send("OK");
})

app.delete(host + '/question/:id', (req, res) => {
    const { id } = req.params;
    console.log("DELETE question", id);

    res.send("OK");
})

app.post(host + '/question', async (req, res) => {

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

            if (question.key === answer.id) {
                correctAnswer = result.insertId;
            }
            question.answers[i].id = result.insertId;
        }

        question.key = correctAnswer;


        // Insert question
        let result = await queryPromise(insertQuestionQuery, [question.question, question.key]);
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
    }

})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
