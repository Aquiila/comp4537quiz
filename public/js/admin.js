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

class QuizService {

    async getAllQuestions() {
        return await fetch('/question')
            .then(response => response.json());
    }

    updateQuestion(question) {
        console.log("updateQuestion: ", question);
        fetch('/question', {
            method: 'PUT', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(question) // body data type must match "Content-Type" header
        });
    }

    deleteQuestion(questionId) {
        console.log("deleteQuestion: ", questionId);
        fetch(`/question/${questionId}`, {
            method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
        });
    }

    createQuestion(question) {
        console.log("createQuestion: ", question);
        return fetch('/question', {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(question) // body data type must match "Content-Type" header
        }).then(response => response.json());
    }
}

class AdminPage {
    quiz = [];
    numOptions = 4;

    addBtn;

    quizService;

    questionLlbText = "Question Text";
    answersLblText = "Answers:";

    addBtnId = "addBtn";
    questionInputContainerId = "questionInputContainer";
    questionFormsClass = "questionForm";
    answerRadioBtnClass = "answer_radio";
    answerTextareaClass = "answer_area";
    questionTextareaClass = "qText";
    newNodeBtnClass = "newNodeBtn";

    questionInputContainer;

    async init() {
        this.quizService = new QuizService();

        this.questionInputContainer = document.getElementById(this.questionInputContainerId);

        this.addBtn = document.getElementById(this.addBtnId);
        this.addBtn.onclick = () => this.onAdd();

        this.quiz = await this.quizService.getAllQuestions();
        console.log(this.quiz);
        if (this.quiz.length === 0) {
            this.addQuestionForm();
        } else {
            this.populateQuestionForms();
        }
    }

    onUpdate(question) {
        console.log("onUpdate: ", question);
        this.quizService.updateQuestion(question);
    }

    onAdd() {
        this.addBtn.disabled = true;
        this.addQuestionForm();
    }

    onSave(question, node) {
        this.quizService.createQuestion(question)
            .then(q => {
                console.log("q", q);
                this.updateFormOnSave(node, q);
                this.addBtn.disabled = false;
            });
    }

    onDelete(questionId, node) {
        node.parentNode.removeChild(node);
        this.quizService.deleteQuestion(questionId);
    }

    onCancel(node) {
        node.parentNode.removeChild(node);
        this.addQuestionForm();
    }

    updateFormOnSave(node, question) {
        node.id = question.id;

        // TODO: change answer id

        const btnSave = document.createElement("input");
        btnSave.value = "Update";
        btnSave.type = "button";
        btnSave.onclick = () => this.onUpdate(this.getQuestionInputFromNode(node));

        const btnCancel = document.createElement("input");
        btnCancel.value = "Delete";
        btnCancel.type = "button";
        btnCancel.onclick = () => this.onDelete(question.id, node);

        const btnDiv = document.createElement("div");
        btnDiv.append(
            btnSave,
            btnCancel
        );

        const btnsToRemove = Array.from(node.getElementsByClassName(this.newNodeBtnClass));

        btnsToRemove.forEach(btn => {
            node.removeChild(btn);
        });

        node.append(
            btnDiv
        );
    }

    addQuestionForm(question = null) {
        const form = this.createQuestionForm(question);

        this.questionInputContainer.appendChild(form);
    }

    createQuestionForm(question) {
        // `<div class=${this.questionFormsClass}>
        //     <label>Question Text</label><br>
        //     <textarea class="qText" cols="30" rows="10"></textarea><br>
        //     <small>Answers:</small><br>
        //     ${answerForms}
        //     <input type="button" value="Update"></input>
        //     <input type="button" value="Delete"></input>
        // OR
        //     <input type="button" value="Save"></input>
        //     <input type="button" value="Cancel"></input>
        // </div>`;
        let questionId = -1;
        let questionText = "";
        let answers = null;
        let key = null;
        let btnSave;
        let btnCancel;

        const btnDiv = document.createElement("div");
        const questionDiv = document.createElement("div");

        if (question) {
            questionId = question.id;
            questionText = question.question;
            answers = question.answers;
            key = question.key;

            btnSave = document.createElement("input");
            btnSave.value = "Update";
            btnSave.type = "button";
            btnSave.onclick = () => this.onUpdate(this.getQuestionInputFromNode(questionDiv));

            btnCancel = document.createElement("input");
            btnCancel.value = "Delete";
            btnCancel.type = "button";
            btnCancel.onclick = () => this.onDelete(questionId, questionDiv);
        } else {
            btnSave = document.createElement("input");
            btnSave.value = "Save";
            btnSave.type = "button";
            btnSave.onclick = () => this.onSave(this.getQuestionInputFromNode(questionDiv), questionDiv);

            btnCancel = document.createElement("input");
            btnCancel.value = "Cancel";
            btnCancel.type = "button";
            btnCancel.onclick = () => this.onCancel(questionDiv);

            btnDiv.className = this.newNodeBtnClass;
        }

        btnDiv.append(
            btnSave,
            btnCancel
        );

        const questionTextNode = document.createTextNode(questionText);

        const questionLlb = document.createElement("label");
        questionLlb.append(this.questionLlbText);

        const questionTextarea = document.createElement("textarea");
        questionTextarea.classList.add(this.questionTextareaClass);
        questionTextarea.cols = "30";
        questionTextarea.rows = "10";
        questionTextarea.appendChild(questionTextNode);

        const answersLbl = document.createElement("small");
        answersLbl.append(this.answersLblText);

        questionDiv.classList.add(this.questionFormsClass);
        questionDiv.id = questionId;
        questionDiv.append(
            questionLlb,
            this.createBreak(),
            questionTextarea,
            this.createBreak(),
            answersLbl,
            this.createBreak()
        );

        for (let index = 0; index < this.numOptions; index++) {
            questionDiv.appendChild(this.createAnswerForm(index, questionId, answers, key));
        }

        questionDiv.append(
            btnDiv
        );

        return questionDiv;
    }

    createAnswerForm(index, questionId, answers, key) {
        // `<div>
        //     <input value="${index}" type="radio" name="counter" class="answer_radio">
        //     <textarea class="answer_area" cols="20" rows="1"></textarea>
        // </div>`;
        let answerText = "";
        let checked = false;
        
        //TODO: add answer ids

        if (answers && answers.length > 0) {
            answerText = answers[index].value;
            checked = answers[index].id == key;
        }

        const answerInput = document.createElement("input");
        answerInput.value = index;
        answerInput.type = "radio";
        answerInput.name = questionId;
        answerInput.checked = checked;
        answerInput.classList.add(this.answerRadioBtnClass);

        const answerTextNode = document.createTextNode(answerText);

        const answerTextarea = document.createElement("textarea");
        answerTextarea.classList.add(this.answerTextareaClass);
        answerTextarea.cols = "20";
        answerTextarea.rows = "1";
        answerTextarea.appendChild(answerTextNode);

        const answerDiv = document.createElement("div");
        answerDiv.appendChild(answerInput);
        answerDiv.appendChild(answerTextarea);

        return answerDiv;
    }

    createBreak() {
        return document.createElement("br");
    }

    populateQuestionForms() {
        for (const question of this.quiz) {
            this.addQuestionForm(question)
        }
    }

    getQuestionInputFromNode(node) {
        let currentQuestionText = node.getElementsByClassName(this.questionTextareaClass)[0].value;

        const answerNodes = node.getElementsByClassName(this.answerTextareaClass);
        const radioNodes = node.getElementsByClassName(this.answerRadioBtnClass);
        let answers = [];
        let correctAnswer;

        // TODO: change answer id logic
        for (let i = 0; i < this.numOptions; i++) {
            answers.push(new Answer(i, answerNodes[i].value));
            if (radioNodes[i].checked) {
                correctAnswer = i;
            }
        }

        return new Question(node.id, currentQuestionText, answers, correctAnswer);
    }

    // addOrUpdateQuiz(question) {
    //     const existingIndex = this.quiz.findIndex(q => q.id == question.id);
    //     if (existingIndex < 0) {
    //         this.quiz.push(question);
    //     } else {
    //         this.quiz[existingIndex] = question;
    //     }
    // }
}

(function () {
    const page = new AdminPage();
    page.init();
})();
