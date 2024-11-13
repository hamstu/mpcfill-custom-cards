export type XMLConfig = {
  stock: string;
  foil: boolean;
  bracket: number;
};

export type CardFile = {
  filename: string;
  nameWithoutExtension: string;
  path: string;
  copies: number;
  back?: string
  isCardBack: boolean
};
