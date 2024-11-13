export async function getFileHash(filePath: string, algorithm: string = "SHA-256"): Promise<string> {
  const fileData = await Deno.readFile(filePath);
  const hashBuffer = await crypto.subtle.digest(algorithm, fileData);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}
