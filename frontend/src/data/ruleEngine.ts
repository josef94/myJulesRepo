import { Gruppe, Regel, Condition } from './types';
import { parseErfassungsregeln } from './parser';

export const applyRules = (gruppen: Gruppe[], formValues: Record<string, any>): Gruppe[] => {
  const rules = parseErfassungsregeln();
  let newGruppen = JSON.parse(JSON.stringify(gruppen));

  for (const rule of rules) {
    const targetMerkmal = findMerkmal(newGruppen, rule.targetMerkmal);
    if (!targetMerkmal) continue;

    let ruleMatched = false;
    for (let i = 0; i < rule.conditions.length; i++) {
      const conditionGroup = rule.conditions[i];
      const conditionsMet = checkConditions(conditionGroup, formValues);

      if (conditionsMet) {
        ruleMatched = true;
        const actions = rule.actions.filter(a => a.ruleIndex === i);
        for (const action of actions) {
          switch (action.type) {
            case 'SetValue':
              targetMerkmal.value = action.payload;
              break;
            case 'SetReadOnly':
              targetMerkmal.readOnly = action.payload;
              break;
            case 'SetVisibility':
              targetMerkmal.hidden = !action.payload;
              break;
            case 'SetOptions':
                // This is a simplified implementation. A real implementation would
                // need to handle adding/removing options from the merkmalswerte array.
                if (action.payload.startsWith('+')) {
                    targetMerkmal.merkmalswerte = [...targetMerkmal.merkmalswerte, ...action.payload.substring(1).split('|')];
                } else if (action.payload.startsWith('-')) {
                    const optionsToRemove = action.payload.substring(1).split('|');
                    targetMerkmal.merkmalswerte = targetMerkmal.merkmalswerte.filter(o => !optionsToRemove.includes(o));
                }
                break;
            case 'ClearManual':
                // This would typically reset a manual override flag.
                // For now, we'll just log it.
                console.log('ClearManual action:', targetMerkmal.name);
                break;
            case 'SetManual':
                // This would typically set a manual override flag.
                console.log('SetManual action:', targetMerkmal.name);
                break;
            case 'SetInvalid':
                // This would typically mark the field as invalid.
                console.log('SetInvalid action:', targetMerkmal.name, action.payload);
                break;
          }
        }
        break; // Stop checking other rule conditions if one is met
      }
    }

    // Handle ELSE case (if no rule matched)
    if (!ruleMatched) {
        const elseActions = rule.actions.filter(a => a.ruleIndex === rule.conditions.length);
        for (const action of elseActions) {
            switch (action.type) {
                case 'SetValue':
                    targetMerkmal.value = action.payload;
                    break;
                case 'SetReadOnly':
                    targetMerkmal.readOnly = action.payload;
                    break;
                case 'SetVisibility':
                    targetMerkmal.hidden = !action.payload;
                    break;
            }
        }
    }
  }

  return newGruppen;
};

const findMerkmal = (gruppen: Gruppe[], merkmalName: string) => {
  for (const gruppe of gruppen) {
    const merkmal = gruppe.merkmale.find(m => m.name === merkmalName);
    if (merkmal) return merkmal;
  }
  return null;
};

const checkConditions = (conditions: Condition[], formValues: Record<string, any>): boolean => {
  if (!conditions || conditions.length === 0) return false;

  for (const condition of conditions) {
    const value = formValues[condition.merkmal];
    if (!checkCondition(value, condition.operator, condition.value)) {
      return false;
    }
  }
  return true;
};

const checkCondition = (value: any, operator: string, conditionValue: any): boolean => {
  switch (operator) {
    case '=':
      return value == conditionValue;
    case '!=':
      return value != conditionValue;
    case '>':
      return value > conditionValue;
    case '<':
      return value < conditionValue;
    case '>=':
      return value >= conditionValue;
    case '<=':
      return value <= conditionValue;
    default:
      return false;
  }
};
