export type XMLConfig = {
  stock: string;
  foil: boolean;
  bracket: number;
};

export type CardFile = {
  nameWithoutExtension: string;
  name: string;
  filename: string;
  path: string;
  renameTo?: string;
  hash: string;
  copies: number;
  back?: string
  isCardBack: boolean
};
