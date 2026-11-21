const PRESERVED_PRODUCT_NAME_WORDS: Record<string, string> = {
  fssai: "FSSAI",
  ims: "IMS",
  purvita: "PURVITA",
  sku: "SKU",
};

const LOWERCASE_PRODUCT_NAME_WORDS = new Set(["and", "for", "in", "of", "the", "with"]);

/** Present API and saved-order product names consistently in title case. */
export function formatProductName(name: string): string {
  return name.replace(/[A-Za-z]+(?:['’][A-Za-z]+)*/g, (word, offset: number) => {
    const lowerWord = word.toLowerCase();
    const preservedWord = PRESERVED_PRODUCT_NAME_WORDS[lowerWord];
    if (preservedWord) return preservedWord;
    if (offset > 0 && LOWERCASE_PRODUCT_NAME_WORDS.has(lowerWord)) return lowerWord;
    if (/[a-z]/.test(word) && /[A-Z]/.test(word.slice(1))) return word;

    return (
      `${lowerWord[0].toUpperCase()}${lowerWord.slice(1)}`
    );
  });
}
