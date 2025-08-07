import { Gruppe, Merkmal, Regel, Condition, Action } from './types';

export const parseMerkmalsdefinition = (data: string): Gruppe[] => {
  const lines = data.trim().split('\n');
  const gruppen: Gruppe[] = [];
  let currentGruppe: Gruppe | null = null;

  for (const line of lines) {
    const columns = line.split('\t').map(c => c.trim());
    const name = columns[0];

    if (!name) continue;

    if (name.endsWith('_MG')) {
      if (currentGruppe) {
        gruppen.push(currentGruppe);
      }
      currentGruppe = { name: columns[1] || name, merkmale: [] };
    } else if (currentGruppe && columns.length > 2) {
      const merkmal: Merkmal = {
        name,
        benennung: columns[1],
        datentyp: columns[2] as 'Integer' | 'String' | 'Real',
        merkmalswerte: [],
      };

      if (columns.length > 3 && columns[3]) {
        merkmal.merkmalswerte.push(columns[3]);
      }

      if (columns.length > 5 && columns[5]) {
        merkmal.einheit = columns[5];
      }

      currentGruppe.merkmale.push(merkmal);
    } else if (currentGruppe && columns.length > 3 && columns[3]) {
        // This handles multi-line merkmalswerte
        const lastMerkmal = currentGruppe.merkmale[currentGruppe.merkmale.length - 1];
        if(lastMerkmal) {
            lastMerkmal.merkmalswerte.push(columns[3]);
        }
    }
  }

  if (currentGruppe) {
    gruppen.push(currentGruppe);
  }

  return gruppen;
};

export const parseErfassungsregeln = (data: string): Regel[] => {
    const lines = data.trim().split('\n').slice(3);
    const regeln: Regel[] = [];
    let currentRuleLines: string[][] = [];

    for (const line of lines) {
        const columns = line.split('\t').map(c => c.trim());
        if (columns[0] && !['Bereich', 'Wert', 'Relevant', 'Multiselekt', 'Keine Eingabe', 'Info', 'Formel', 'Sichtbar'].includes(columns[0])) {
            if (currentRuleLines.length > 0) {
                const regel = parseRule(currentRuleLines);
                if (regel) {
                    regeln.push(regel);
                }
            }
            currentRuleLines = [columns];
        } else {
            currentRuleLines.push(columns);
        }
    }

    if (currentRuleLines.length > 0) {
        const regel = parseRule(currentRuleLines);
        if (regel) {
            regeln.push(regel);
        }
    }

    return regeln;
};

const parseRule = (ruleLines: string[][]): Regel | null => {
    if (ruleLines.length === 0) {
        return null;
    }

    const targetMerkmal = ruleLines[0][0];
    const conditions: Condition[][] = [];
    const actions: Action[] = [];

    let conditionLines: string[][] = [];
    let actionLines: string[][] = [];

    let parsingConditions = true;
    for (let i = 1; i < ruleLines.length; i++) {
        const line = ruleLines[i];
        if (['Bereich', 'Wert', 'Relevant', 'Multiselekt', 'Keine Eingabe', 'Info', 'Formel', 'Sichtbar'].includes(line[0])) {
            parsingConditions = false;
        }
        if (parsingConditions) {
            conditionLines.push(line);
        } else {
            actionLines.push(line);
        }
    }

    // Parse Conditions
    const numRules = ruleLines[0].length - 3;
    for (let i = 0; i < numRules; i++) {
        conditions.push([]);
    }

    for (const line of conditionLines) {
        const merkmal = line[1];
        const operator = line[2] as '=' | '!=' | '>' | '<' | '>=' | '<=';
        for (let i = 3; i < line.length; i++) {
            const value = line[i];
            if (value) {
                if (!conditions[i - 3]) {
                    conditions[i-3] = [];
                }
                conditions[i - 3].push({ merkmal, operator, value });
            }
        }
    }


    // Parse Actions
    for (const line of actionLines) {
        const actionType = line[0];
        for (let i = 3; i < line.length; i++) {
            const value = line[i];
            if (value) {
                const ruleIndex = i - 3;
                let action: Action | null = null;

                if (actionType === 'Bereich') {
                    action = { type: 'SetOptions', payload: value, ruleIndex };
                } else if (actionType === 'Wert') {
                    action = { type: 'SetValue', payload: value, ruleIndex };
                } else if (actionType === 'Keine Eingabe') {
                    action = { type: 'SetReadOnly', payload: value === 'WAHR', ruleIndex };
                } else if (actionType === 'Formel') {
                    if (value === 'SetManual') {
                        action = { type: 'SetManual', ruleIndex };
                    } else if (value === 'ClearManual') {
                        action = { type: 'ClearManual', ruleIndex };
                    } else if (value === 'SetInvalid(false)') {
                        action = { type: 'SetInvalid', payload: false, ruleIndex };
                    }
                }

                if (action) {
                    actions.push(action);
                }
            }
        }
    }

    return {
        targetMerkmal,
        conditions,
        actions,
    };
};
