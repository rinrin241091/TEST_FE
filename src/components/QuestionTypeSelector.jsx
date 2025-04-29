import React, { useState } from 'react';

const QuestionTypeSelector = ({ onSelectType }) => {
  const [selectedType, setSelectedType] = useState('multiple_choice');

  const questionTypes = [
    { id: 'multiple_choice', label: 'Multiple Choice' },
    { id: 'checkboxes', label: 'Checkboxes' },
    { id: 'true_false', label: 'True/False' }
  ];

  const handleTypeSelect = (typeId) => {
    setSelectedType(typeId);
    onSelectType(typeId);
  };

  return (
    <div className="question-type-selector">
      <h3>Question Type</h3>
      <div className="type-list">
        {questionTypes.map(type => (
          <button
            key={type.id}
            className={`type-button ${selectedType === type.id ? 'active' : ''}`}
            onClick={() => handleTypeSelect(type.id)}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionTypeSelector;