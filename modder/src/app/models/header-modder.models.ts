export interface Rule {
  id: string;
  header: string;
  value: string;
  comment: string;
  enabled: boolean;
}

export interface Group {
  id: string;
  name: string;
  urlPattern: string;
  enabled: boolean;
  rules: Rule[];
}

export interface State {
  groups: Group[];
}

export interface ExportData {
  version: string;
  exportedAt: string;
  groups: Group[];
}

export interface ImportSelection {
  group: Group;
  selected: boolean;
}
