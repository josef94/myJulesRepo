import React, { useState } from 'react';
import { Regel } from '../data/types';

interface RuleEditorProps {
  regel: Regel;
  onSave: (newRegel: Regel) => void;
  onCancel: () => void;
}

const RuleEditor: React.FC<RuleEditorProps> = ({ regel, onSave, onCancel }) => {
  const [editedRegel, setEditedRegel] = useState<Regel>(regel);

  const handleConditionChange = (groupIndex: number, conditionIndex: number, field: string, value: any) => {
    const newRegel = { ...editedRegel };
    newRegel.conditions[groupIndex][conditionIndex] = { ...newRegel.conditions[groupIndex][conditionIndex], [field]: value };
    setEditedRegel(newRegel);
  };

  const handleActionChange = (actionIndex: number, field: string, value: any) => {
    const newRegel = { ...editedRegel };
    newRegel.actions[actionIndex] = { ...newRegel.actions[actionIndex], [field]: value };
    setEditedRegel(newRegel);
  };

  const handleSave = () => {
    onSave(editedRegel);
  };

  return (
    <div className="rule-editor">
      <h3>Edit Rule for {regel.targetMerkmal}</h3>
      <div className="conditions">
        <h4>Conditions</h4>
        {editedRegel.conditions.map((conditionGroup, index) => (
          <div key={index} className="condition-group">
            <h5>OR</h5>
            {conditionGroup.map((condition, cIndex) => (
              <div key={cIndex} className="condition">
                <input value={condition.merkmal} onChange={(e) => handleConditionChange(index, cIndex, 'merkmal', e.target.value)} />
                <select value={condition.operator} onChange={(e) => handleConditionChange(index, cIndex, 'operator', e.target.value)}>
                  <option value="=">=</option>
                  <option value="!=">!=</option>
                  <option value=">">&gt;</option>
                  <option value="<">&lt;</option>
                  <option value=">=">&gt;=</option>
                  <option value="<=">&lt;=</option>
                </select>
                <input value={condition.value} onChange={(e) => handleConditionChange(index, cIndex, 'value', e.target.value)} />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="actions">
        <h4>Actions</h4>
        {editedRegel.actions.map((action, index) => (
          <div key={index} className="action">
            <span>Rule {action.ruleIndex}: </span>
            <select value={action.type} onChange={(e) => handleActionChange(index, 'type', e.target.value)}>
              <option value="SetValue">SetValue</option>
              <option value="SetOptions">SetOptions</option>
              <option value="SetReadOnly">SetReadOnly</option>
              <option value="SetVisibility">SetVisibility</option>
              <option value="ClearManual">ClearManual</option>
              <option value="SetManual">SetManual</option>
              <option value="SetInvalid">SetInvalid</option>
            </select>
            <input value={action.payload} onChange={(e) => handleActionChange(index, 'payload', e.target.value)} />
          </div>
        ))}
      </div>
      <button onClick={handleSave}>Save</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
};

export default RuleEditor;
