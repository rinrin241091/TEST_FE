import React from 'react';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QuestionTypeSelector from '../components/QuestionTypeSelector';
import FileUpload from '../components/common/FileUpload';
import '../styles/CreateQuestion.css';

function CreateQuestion() {
  const navigate = useNavigate();
  const [quizTitle, setQuizTitle] = useState('');
  const [questionType, setQuestionType] = useState('multiple_choice');
  const [questionText, setQuestionText] = useState('');
  const [answers, setAnswers] = useState([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);
  const [trueFalseAnswer, setTrueFalseAnswer] = useState(null);
  const [currentQuizId, setCurrentQuizId] = useState(null);
  const [questionCount, setQuestionCount] = useState(1);

  // Xử lý khi người dùng chọn loại câu hỏi
  const handleSelectType = (type) => {
    setQuestionType(type);
    // Reset answers khi chuyển loại câu hỏi
    setAnswers([
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ]);
    if (type === 'true_false') {
      setTrueFalseAnswer(null);
    }
  };

  // Xử lý khi người dùng upload file
  const handleFileContentChange = (content) => {
    setQuestionText(content);
  };

  // Thêm đáp án mới
  const addAnswer = () => {
    if (answers.length < 4) {
      setAnswers([...answers, { text: '', isCorrect: false }]);
    }
  };

  // Xóa đáp án
  const removeAnswer = (index) => {
    if (answers.length > 2) {
      const newAnswers = answers.filter((_, i) => i !== index);
      // Đảm bảo luôn có ít nhất một đáp án đúng cho multiple choice
      if (questionType === 'multiple_choice' && !newAnswers.some(a => a.isCorrect)) {
        newAnswers[0].isCorrect = true;
      }
      setAnswers(newAnswers);
    }
  };

  // Cập nhật nội dung đáp án
  const updateAnswerText = (index, text) => {
    const newAnswers = [...answers];
    newAnswers[index].text = text;
    setAnswers(newAnswers);
  };

  // Cập nhật đáp án đúng
  const updateCorrectAnswer = (index) => {
    const newAnswers = [...answers];
    if (questionType === 'multiple_choice') {
      // Multiple choice: chỉ cho phép chọn 1 đáp án đúng
      newAnswers.forEach((answer, i) => {
        answer.isCorrect = i === index;
      });
    } else {
      // Checkboxes: cho phép chọn nhiều đáp án đúng
      newAnswers[index].isCorrect = !newAnswers[index].isCorrect;
    }
    setAnswers(newAnswers);
  };

  // Tạo quiz mới
  const createNewQuiz = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: quizTitle || `Quiz ${new Date().toLocaleDateString()}`,
          description: '', // Có thể thêm trường này sau
          creator_id: 1, // Tạm thời hardcode, sau này sẽ lấy từ user đăng nhập
          is_public: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Không thể tạo quiz mới');
      }

      const data = await response.json();
      setCurrentQuizId(data.quiz_id); // Sử dụng quiz_id thay vì id
      return data.quiz_id;
    } catch (error) {
      console.error('Lỗi khi tạo quiz:', error);
      alert('Không thể tạo quiz mới: ' + error.message);
      return null;
    }
  };

  // Lưu câu hỏi
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra xem có ít nhất một đáp án đúng
    if ((questionType === 'multiple_choice' || questionType === 'checkboxes') && 
        !answers.some(answer => answer.isCorrect)) {
      alert('Vui lòng chọn ít nhất một đáp án đúng!');
      return;
    }

    // Kiểm tra nội dung câu hỏi
    if (!questionText.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi!');
      return;
    }

    // Kiểm tra nội dung các đáp án
    if (questionType !== 'true_false') {
      const emptyAnswers = answers.some(answer => !answer.text.trim());
      if (emptyAnswers) {
        alert('Vui lòng nhập nội dung cho tất cả các đáp án!');
        return;
      }
    }

    try {
      // Nếu chưa có quiz_id, tạo quiz mới
      let quizId = currentQuizId;
      if (!quizId) {
        quizId = await createNewQuiz();
        if (!quizId) return;
      }

      // Tạo câu hỏi
      const questionData = {
        quiz_id: quizId,
        question_text: questionText.trim(),
        question_type: questionType,
        time_limit: 60, // Mặc định 60 giây
        points: 1, // Mặc định 1 điểm
        created_at: new Date().toISOString()
      };

      console.log('Sending question data:', questionData);

      const questionResponse = await fetch('http://localhost:3000/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionData),
      });

      if (!questionResponse.ok) {
        const errorData = await questionResponse.json().catch(() => null);
        throw new Error(errorData?.message || 'Lỗi khi lưu câu hỏi');
      }

      const questionResult = await questionResponse.json();
      const questionId = questionResult.question_id;

      // Nếu là câu hỏi multiple choice hoặc checkboxes, tạo các đáp án
      if (questionType === 'multiple_choice' || questionType === 'checkboxes') {
        for (const answer of answers) {
          const answerData = {
            question_id: questionId,
            answer_text: answer.text.trim(),
            is_correct: answer.isCorrect ? 1 : 0
          };

          const answerResponse = await fetch('http://localhost:3000/api/answers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(answerData),
          });

          if (!answerResponse.ok) {
            throw new Error('Lỗi khi lưu đáp án');
          }
        }
      }
      // Nếu là câu hỏi true/false, tạo hai đáp án True và False
      else if (questionType === 'true_false') {
        const trueAnswer = {
          question_id: questionId,
          answer_text: 'True',
          is_correct: trueFalseAnswer === 'true' ? 1 : 0
        };

        const falseAnswer = {
          question_id: questionId,
          answer_text: 'False',
          is_correct: trueFalseAnswer === 'false' ? 1 : 0
        };

        await Promise.all([
          fetch('http://localhost:3000/api/answers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(trueAnswer),
          }),
          fetch('http://localhost:3000/api/answers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(falseAnswer),
          })
        ]);
      }

      alert('Câu hỏi đã được lưu thành công!');
      
      // Tăng số thứ tự câu hỏi
      setQuestionCount(prev => prev + 1);
      
      // Reset form cho câu hỏi tiếp theo
      setQuestionText('');
      setAnswers([
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ]);
      setTrueFalseAnswer(null);

    } catch (error) {
      console.error('Chi tiết lỗi:', error);
      alert(`Lỗi: ${error.message}`);
    }
  };

  return (
    <div className="create-question-page">
      <div className="sidebar">
        <QuestionTypeSelector onSelectType={handleSelectType} />
      </div>

      <div className="main-content">
        <div className="header">
          <button 
            className="done-btn"
            onClick={() => navigate('/quizzes')}
          >
            Done
          </button>
          <button className="preview-btn">Preview</button>
          <span className="question-counter">Câu hỏi #{questionCount}</span>
        </div>

        <form onSubmit={handleSubmit} className="question-form">
          {!currentQuizId && (
            <div className="form-group">
              <label>Tên Quiz:</label>
              <input
                type="text"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="Nhập tên quiz (không bắt buộc)"
                className="quiz-title-input"
              />
            </div>
          )}

          {/* Nhập câu hỏi */}
          <div className="form-group">
            <label>Nội dung câu hỏi:</label>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Nhập câu hỏi tại đây..."
              rows="4"
              required
            />
            <FileUpload onFileContentChange={handleFileContentChange} />
          </div>

          {/* Nhập đáp án (tùy loại câu hỏi) */}
          {(questionType === 'multiple_choice' || questionType === 'checkboxes') && (
            <div className="form-group">
              <label>
                Đáp án: 
                <span className="answer-hint">
                  {questionType === 'multiple_choice' 
                    ? ' (Chọn 1 đáp án đúng)' 
                    : ' (Có thể chọn nhiều đáp án đúng)'}
                </span>
              </label>
              {answers.map((answer, index) => (
                <div key={index} className="answer-item">
                  <input
                    type="text"
                    value={answer.text}
                    onChange={(e) => updateAnswerText(index, e.target.value)}
                    placeholder={`Đáp án ${index + 1}`}
                    required
                  />
                  <label>
                    <input
                      type={questionType === 'multiple_choice' ? 'radio' : 'checkbox'}
                      name={questionType === 'multiple_choice' ? 'correctAnswer' : `answer${index}`}
                      checked={answer.isCorrect}
                      onChange={() => updateCorrectAnswer(index)}
                    />
                    Đáp án đúng
                  </label>
                  {answers.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeAnswer(index)}
                      className="remove-answer-btn"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              ))}
              {answers.length < 4 && (
                <button type="button" onClick={addAnswer}>
                  Thêm đáp án
                </button>
              )}
            </div>
          )}

          {questionType === 'true_false' && (
            <div className="form-group">
              <label>Đáp án:</label>
              <label>
                <input
                  type="radio"
                  name="trueFalse"
                  value="true"
                  checked={trueFalseAnswer === 'true'}
                  onChange={() => setTrueFalseAnswer('true')}
                  required
                />
                True
              </label>
              <label>
                <input
                  type="radio"
                  name="trueFalse"
                  value="false"
                  checked={trueFalseAnswer === 'false'}
                  onChange={() => setTrueFalseAnswer('false')}
                  required
                />
                False
              </label>
            </div>
          )}

          <button type="submit" className="submit-btn">
            {currentQuizId ? 'Lưu và Thêm Câu Hỏi Tiếp' : 'Tạo Quiz và Lưu Câu Hỏi'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateQuestion;