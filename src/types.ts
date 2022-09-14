export type IdType = number;

export type MeaningType = number;

// todo: add more
export type TagType = "KACH";

export type KindType = "DIRECT" | "MEANING" | "IDENTICAL";

export interface SourceType {
  value: string;
  meaning: MeaningType;
}

export interface ReferenceType {
  id: IdType;
  source: SourceType;
  kind: KindType;
  tags: TagType[];
}

export interface FieldType {
  value: string[]
}

export interface DefinitionType {
  value: FieldType[];
  tags: TagType[];
}

export type ValueType = ReferenceType | DefinitionType;

export interface TargetType {
  value: ValueType;
  meaning: MeaningType;
}

export interface EntryType {
  id: IdType;
  source: SourceType;
  target: TargetType[];
}
