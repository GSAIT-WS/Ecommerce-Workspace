/**
 * Product description resolution for storefront product detail pages.
 *
 * Each product family on the catalog has a tailored description:
 *  - Chikkis: jowar peanut, kurmura peanut, sesame peanut
 *  - Combos: discovery / variety / family & sharing packs
 *  - Jars: jowar / sesame / kurmura peanut chikki jars
 *
 * Descriptions are resolved from the product name (case-insensitive keyword
 * match) so new IMS-synced products automatically fall back to a neutral text.
 */

export const JOWAR_PEANUT_CHIKKI_DESCRIPTION =
  "Jowar Peanut Chikki is a traditional Indian sweet snack made with crunchy peanuts, jowar millet and jaggery. Combining the goodness of traditional grains with the familiar taste of chikki, it makes for a delicious everyday snack.";

export const KURMURA_PEANUT_CHIKKI_DESCRIPTION =
  "PURVITA Kurmura Peanut Chikki is a traditional Indian sweet snack made with crunchy peanuts, crispy jowar kurmura and jaggery. It brings together a delightful crunch and the familiar sweetness of traditional chikki, making it a tasty snack for everyday enjoyment.";

export const SESAME_PEANUT_CHIKKI_DESCRIPTION =
  "PURVITA Sesame Peanut Chikki is a traditional Indian sweet snack made with crunchy peanuts, jowar millets, nutritious sesame seeds and jaggery. Combining the rich, nutty flavour of sesame with the familiar crunch of peanuts, it offers a delicious twist to a much-loved traditional treat.";

export const DISCOVERY_PACK_DESCRIPTION =
  "The PURVITA Discovery Pack is a charming 6-piece assortment, with 2 pieces of each chikki flavour — jowar peanut, kurmura peanut and sesame peanut — in one handy box. It’s a little taste of India’s traditional chikki range for true snack enthusiasts.";

export const VARIETY_PACK_DESCRIPTION =
  "The PURVITA Variety Pack is a 12-piece assortment, with 4 pieces of each chikki flavour — jowar peanut, kurmura peanut and sesame peanut. It’s the perfect sharing pack for chikki lovers who want the familiar crunch of every flavour.";

export const FAMILY_SHARING_PACK_DESCRIPTION =
  "The PURVITA Family and Sharing Pack is a generous 30-piece assortment, with 10 pieces of each chikki flavour — jowar peanut, kurmura peanut and sesame peanut. Built for family gatherings, gifting and stocking up, it brings a full spectrum of traditional chikki flavours to your pantry.";

export const JAR_JOWAR_DESCRIPTION =
  "The PURVITA Jowar Peanut Jar contains 50 pieces — crunchy peanuts, wholesome jowar millet and jaggery, packed for true chikki lovers who want big flavours.";

export const JAR_SESAME_DESCRIPTION =
  "The PURVITA Sesame Peanut Jar contains 50 pieces — crunchy peanuts, nutritious sesame seeds and wholesome jowar millet, sweetened with jaggery. Rich, nutty and satisfying, packed for generous everyday snacking.";

export const JAR_KURMURA_DESCRIPTION =
  "The PURVITA Kurmura Peanut Jar contains 50 pieces — crunchy peanuts, crisp kurmura millet and jaggery, made for those who crave an extra crunchy traditional chikki.";

export const DEFAULT_PRODUCT_DESCRIPTION =
  "PURVITA Chikki is a traditional Indian sweet snack made with crunchy peanuts, wholesome jowar millet and nutritious jaggery. Combining the goodness of traditional grains with the familiar taste of chikki, it makes for a delicious everyday snack.";

export function resolveProductDescription(name?: string | null): string {
  const key = (name ?? "").toLowerCase();

  if (/discovery/.test(key)) return DISCOVERY_PACK_DESCRIPTION;
  if (/variety/.test(key)) return VARIETY_PACK_DESCRIPTION;
  if (/family|sharing/.test(key)) return FAMILY_SHARING_PACK_DESCRIPTION;

  if (/jar/.test(key)) {
    if (/jowar/.test(key)) return JAR_JOWAR_DESCRIPTION;
    if (/sesame/.test(key)) return JAR_SESAME_DESCRIPTION;
    if (/kurmura/.test(key)) return JAR_KURMURA_DESCRIPTION;
  }

  if (/kurmura/.test(key)) return KURMURA_PEANUT_CHIKKI_DESCRIPTION;
  if (/sesame/.test(key)) return SESAME_PEANUT_CHIKKI_DESCRIPTION;
  if (/jowar/.test(key)) return JOWAR_PEANUT_CHIKKI_DESCRIPTION;

  return DEFAULT_PRODUCT_DESCRIPTION;
}
