class QuizPage {

    thisQuiz = null;

    createQuestionDiv(question, index) {
        let answersString = "";
        question.answers.forEach(answer => {
            answersString += `<p><input class="option" type="radio" name="${question.id}" value="${answer.id}"> ${answer.value} </p>\n`;
        });
        return `<div class="question" id="${question.id}">
                      <p>Question ${index + 1}:
                          <p>
                              ${question.question}
                          </p>
                      </p>
                      <div class="answers">
                          ${answersString}
                      </div>
                  </div>\n`;
    }

    getQuestionById(id) {
        return this.thisQuiz.find(q => q.id == id)
    }

    verifyAnswer(questionNode) {
        const selectedAnswerSelector = "input:checked";
        const selectedAnswerNode = questionNode.querySelector(selectedAnswerSelector);

        const questionId = questionNode.id;
        const question = this.getQuestionById(questionId);

        const correctAnswerSelector = `[value="${question.key}"]`;
        const correctAnswerNode = questionNode.querySelector(correctAnswerSelector);
        correctAnswerNode.parentNode.classList.add("correct");

        const selectedAnswerId = selectedAnswerNode ? selectedAnswerNode.value : -1;

        let score = 0;

        if (question.key == selectedAnswerId) {
            score = 1;
        } else if (selectedAnswerId != -1) {
            selectedAnswerNode.parentNode.classList.add("wrong");
        }

        return score;
    }

    onSubmit() {
        const scoreContainerId = "scoreContainer";
        const optionClass = "option";
        const questionClass = "question";
        let userScore = 0;

        submitBtn.disabled = true;
        let answerOptions = quizContainer.getElementsByClassName(optionClass);
        let questionNodes = quizContainer.getElementsByClassName(questionClass);
        const scoreContainer = document.getElementById(scoreContainerId);

        for (const option of answerOptions) {
            option.disabled = true;
        }

        for (const question of questionNodes) {
            userScore += this.verifyAnswer(question);
        }
        scoreContainer.innerHTML = `<b>Your score is: ${userScore} out of ${this.thisQuiz.length}</b>`;
    }

    init() {
        const msgNotSupported = "Sorry web Storage is not supported!";
        const msgKey = "quiz";
        const msgNoQuiz =
            "No quiz questions available. Please ask your instructor to add questions using Admin page.";
        const quizContainerId = "quizContainer";
        const submitBtnId = "submitBtn";

        const quizContainer = document.getElementById(quizContainerId);
        const submitBtn = document.getElementById(submitBtnId);

        if (typeof Storage == "undefined") {
            document.write(msgNotSupported);
            window.stop();
        }

        this.thisQuiz = JSON.parse(localStorage.getItem(msgKey));

        submitBtn.disabled = true;

        if (!this.thisQuiz || this.thisQuiz.length == 0) {
            quizContainer.innerHTML = msgNoQuiz;
        } else {
            quizContainer.innerHTML = "";
            this.thisQuiz.forEach((question, index) => {
                quizContainer.innerHTML += this.createQuestionDiv(question, index);
            });

            submitBtn.disabled = false;
            submitBtn.onclick = () => this.onSubmit();
        }
    }
}

(function () {
    const page = new QuizPage();
    page.init();
})();
