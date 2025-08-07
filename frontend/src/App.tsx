import React, { useEffect, useState } from 'react';
import { Gruppe } from './data/types';
import { parseMerkmalsdefinition } from './data/parser';
import './App.css';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import SelectField from './components/SelectField';
import TextField from './components/TextField';
import NumberField from './components/NumberField';
import { applyRules } from './data/ruleEngine';
import SortableGroup from './components/SortableGroup';
import SortableMerkmal from './components/SortableMerkmal';
import AddFieldForm from './components/AddFieldForm';
import RuleEditor from './components/RuleEditor';
import { saveData, loadData, lock, unlock } from './api';

function App() {
  const [gruppen, setGruppen] = useState<Gruppe[]>([]);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [rules, setRules] = useState<Regel[]>([]);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const [isAddingField, setIsAddingField] = useState(false);
  const [editingRule, setEditingRule] = useState<Regel | null>(null);
  const [user, setUser] = useState('user1'); // Simple user management
  const [isLocked, setIsLocked] = useState(false);
  const [lockedBy, setLockedBy] = useState('');
  const [merkmalsdefinitionText, setMerkmalsdefinitionText] = useState('');
  const [erfassungsregelnText, setErfassungsregelnText] = useState('');

  const loadDataFromText = () => {
    const parsedGruppen = parseMerkmalsdefinition(merkmalsdefinitionText);
    const parsedRules = parseErfassungsregeln(erfassungsregelnText);
    setRules(parsedRules);
    const initialValues: Record<string, any> = {};
    parsedGruppen.forEach(gruppe => {
      gruppe.merkmale.forEach(merkmal => {
        initialValues[merkmal.name] = merkmal.value || '';
      });
    });
    setFormValues(initialValues);
    setGruppen(applyRules(parsedGruppen, initialValues));
  };

  const handleSave = async () => {
    await saveData({ gruppen, formValues, rules });
    alert('Data saved!');
  };

  const handleLoad = async () => {
    const data = await loadData();
    setGruppen(data.gruppen);
    setFormValues(data.formValues);
    setRules(data.rules);
    alert('Data loaded!');
  };

  const handleLock = async () => {
    try {
      await lock(user);
      setIsLocked(true);
      setLockedBy(user);
      alert('Form locked!');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleUnlock = async () => {
    try {
      await unlock(user);
      setIsLocked(false);
      setLockedBy('');
      alert('Form unlocked!');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeIsGroup = gruppen.some(g => g.name === active.id);
      const overIsGroup = gruppen.some(g => g.name === over.id);

      if (activeIsGroup && overIsGroup) {
        setGruppen((items) => {
          const oldIndex = items.findIndex(g => g.name === active.id);
          const newIndex = items.findIndex(g => g.name === over.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      } else {
        // Dragging fields within a group
        const newGruppen = gruppen.map(g => {
            const oldIndex = g.merkmale.findIndex(m => m.name === active.id);
            const newIndex = g.merkmale.findIndex(m => m.name === over.id);
            if (oldIndex > -1 && newIndex > -1) {
                g.merkmale = arrayMove(g.merkmale, oldIndex, newIndex);
            }
            return g;
        });
        setGruppen(newGruppen);
      }
    }
  };

  const handleFieldChange = (merkmalName: string, value: any) => {
    const newFormValues = { ...formValues, [merkmalName]: value };
    setFormValues(newFormValues);
    setGruppen(applyRules(gruppen, newFormValues));
  };

  const handleAddField = (newField: any) => {
    const newGruppen = [...gruppen];
    newGruppen[newGruppen.length - 1].merkmale.push(newField);
    setGruppen(newGruppen);
    setIsAddingField(false);
  };

  const handleEditRule = (merkmalName: string) => {
    const rule = rules.find(r => r.targetMerkmal === merkmalName);
    if (rule) {
      setEditingRule(rule);
    }
  };

  const handleSaveRule = (newRule: Regel) => {
    const newRules = rules.map(r => r.targetMerkmal === newRule.targetMerkmal ? newRule : r);
    setRules(newRules);
    setEditingRule(null);
  };

  const renderField = (merkmal: any) => {
    const { datentyp, name } = merkmal;
    const value = formValues[name];

    switch (datentyp) {
      case 'String':
        return merkmal.merkmalswerte.length > 0 ? (
          <SelectField
            merkmal={merkmal}
            value={value}
            onChange={(val) => handleFieldChange(name, val)}
          />
        ) : (
          <TextField
            merkmal={merkmal}
            value={value}
            onChange={(val) => handleFieldChange(name, val)}
          />
        );
      case 'Integer':
      case 'Real':
        return (
          <NumberField
            merkmal={merkmal}
            value={value}
            onChange={(val) => handleFieldChange(name, val)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <h1>Novimat Form</h1>
      <div className="data-loader">
        <textarea
          placeholder="Paste Merkmalsdefinition data here"
          value={merkmalsdefinitionText}
          onChange={(e) => setMerkmalsdefinitionText(e.target.value)}
        />
        <textarea
          placeholder="Paste Erfassungsregeln data here"
          value={erfassungsregelnText}
          onChange={(e) => setErfassungsregelnText(e.target.value)}
        />
        <button onClick={loadDataFromText}>Load Data</button>
      </div>
      <div className="controls">
        <button onClick={handleSave}>Save</button>
        <button onClick={handleLoad}>Load</button>
        <button onClick={handleLock} disabled={isLocked}>Lock</button>
        <button onClick={handleUnlock} disabled={!isLocked || lockedBy !== user}>Unlock</button>
        <input value={user} onChange={(e) => setUser(e.target.value)} />
        {isLocked && <span>Locked by {lockedBy}</span>}
      </div>
      <button onClick={() => setIsAddingField(true)}>Add Field</button>
      {isAddingField && (
        <AddFieldForm
          onAddField={handleAddField}
          onCancel={() => setIsAddingField(false)}
        />
      )}
      {editingRule && (
        <RuleEditor
          regel={editingRule}
          onSave={handleSaveRule}
          onCancel={() => setEditingRule(null)}
        />
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={gruppen.map(g => g.name)}
          strategy={verticalListSortingStrategy}
        >
          <form>
            {gruppen.map(gruppe => (
              <SortableGroup key={gruppe.name} gruppe={gruppe}>
                <SortableContext
                  items={gruppe.merkmale.map(m => m.name)}
                  strategy={verticalListSortingStrategy}
                >
                  {gruppe.merkmale.map(merkmal => (
                    !merkmal.hidden && (
                      <SortableMerkmal key={merkmal.name} merkmal={merkmal}>
                        <label>{merkmal.benennung}</label>
                        <button onClick={() => handleEditRule(merkmal.name)}>Edit Rule</button>
                        {renderField(merkmal)}
                      </SortableMerkmal>
                    )
                  ))}
                </SortableContext>
              </SortableGroup>
            ))}
          </form>
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default App;
