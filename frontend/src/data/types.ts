export interface Merkmal {
  name: string;
  benennung: string;
  datentyp: 'Integer' | 'String' | 'Real';
  merkmalswerte: string[];
  einheit?: string;
  hidden?: boolean;
  readOnly?: boolean;
  value?: any;
}

export interface Gruppe {
  name: string;
  merkmale: Merkmal[];
  hidden?: boolean;
}

export interface Condition {
  merkmal: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=';
  value: string | number;
}

export interface Action {
  type: 'SetValue' | 'SetOptions' | 'SetReadOnly' | 'SetVisibility' | 'ClearManual' | 'SetManual' | 'SetInvalid';
  payload?: any;
  ruleIndex: number;
}

export interface Regel {
  targetMerkmal: string;
  conditions: Condition[][]; // Array of OR conditions, each of which is an array of AND conditions
  actions: Action[];
}
