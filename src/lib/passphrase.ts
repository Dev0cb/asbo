// Passphrase word list + generator. The list is public (it ships in the
// bundle), so strength must come only from how many words are drawn at
// random, never from the attacker not knowing the list (Kerckhoffs).
import { wordlist as BIP39_FR } from '@scure/bip39/wordlists/french.js';

// Simple, easy-to-type local words (FR + Wolof) that give ASBO its flavour.
const LOCAL_WORDS = [
  'baobab', 'teranga', 'thieb', 'yassa', 'mafe', 'bissap', 'attaya', 'pirogue', 'lutte', 'sabar',
  'djembe', 'kora', 'goree', 'niokolo', 'casamance', 'sine', 'saloum', 'fleuve', 'dune', 'mangue',
  'arachide', 'mil', 'riz', 'poisson', 'lion', 'gazelle', 'pelican', 'tortue', 'dauphin', 'soleil',
  'lune', 'etoile', 'nuage', 'pluie', 'vent', 'orage', 'sable', 'ocean', 'vague', 'montagne',
  'riviere', 'foret', 'jardin', 'marche', 'village', 'quartier', 'maison', 'fenetre', 'porte', 'cahier',
  'crayon', 'livre', 'tableau', 'ecole', 'velo', 'moto', 'taxi', 'train', 'avion', 'bateau',
  'chemin', 'pont', 'route', 'place', 'stade', 'musique', 'guitare', 'tambour', 'danse', 'chanson',
  'poeme', 'conte', 'griot', 'sagesse', 'courage', 'patience', 'respect', 'jom', 'ndank', 'jamm',
  'xarit', 'ndaw', 'suba', 'guddi', 'ganaw', 'kanam', 'citron', 'banane', 'papaye', 'coco',
  'goyave', 'tamarin', 'gingembre', 'menthe', 'cafe', 'lait', 'pain', 'beignet', 'fataya', 'thiakry',
  'ngalakh', 'couscous', 'mbaxal', 'rouge', 'vert', 'jaune', 'bleu', 'violet', 'blanc', 'noir',
  'chat', 'chien', 'cheval', 'chevre', 'mouton', 'poule', 'chameau', 'hibou', 'lampe', 'bougie',
  'miroir', 'tapis', 'natte', 'calebasse', 'panier', 'cuillere', 'marmite', 'colline', 'plaine', 'savane',
  'desert', 'oasis', 'voisin', 'cousin', 'frere', 'soeur', 'oncle', 'tante', 'joyeux', 'brave',
  'parapluie', 'chapeau', 'boubou', 'sandale', 'ceinture', 'bracelet', 'collier', 'perle', 'tissu', 'wax',
  'radio', 'journal', 'lettre', 'timbre', 'boussole', 'horloge', 'cadenas', 'basket', 'arbitre', 'piment',
  'oignon', 'tomate', 'carotte', 'manioc', 'igname', 'gombo', 'aubergine', 'haricot', 'aigle', 'corbeau',
  'moineau', 'perroquet', 'flamant', 'heron', 'crabe', 'crevette', 'thiof', 'yaboy', 'lumiere', 'ombre',
  'glace', 'brume', 'aube', 'crepuscule', 'eclair', 'tonnerre', 'zebre', 'girafe', 'elephant', 'hyene',
  'singe', 'phacochere', 'antilope', 'buffle', 'crocodile', 'hippo',
];

export const stripAccents = (s: string): string => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * ~2,200 unique accent-free words: the French BIP39 list (2,048 words,
 * designed to be unambiguous) plus the local words above. 6 words drawn at
 * random from it ≈ 66 bits, even for an attacker who has the list.
 */
export const PASSPHRASE_WORDS: readonly string[] = Array.from(
  new Set([...LOCAL_WORDS, ...BIP39_FR.map(stripAccents)]),
);

export const PASSPHRASE_SET: ReadonlySet<string> = new Set(PASSPHRASE_WORDS);

export const DEFAULT_WORD_COUNT = 6;

/** Uniform integer in [0, max) from the CSPRNG, without modulo bias. */
export function secureRandomInt(max: number): number {
  if (!Number.isInteger(max) || max <= 0 || max > 2 ** 32) throw new RangeError('max out of range');
  const limit = Math.floor(2 ** 32 / max) * max;
  const buf = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(buf);
    if (buf[0] < limit) return buf[0] % max;
  }
}

/**
 * `count` random words joined by dashes, with a 2-digit number placed at a
 * random position (not always at the end, which attackers try first).
 */
export function generatePassphrase(words: readonly string[] = PASSPHRASE_WORDS, count = DEFAULT_WORD_COUNT): string {
  const picked = Array.from({ length: count }, () => words[secureRandomInt(words.length)]);
  const number = String(secureRandomInt(100)).padStart(2, '0');
  const at = secureRandomInt(count + 1);
  return [...picked.slice(0, at), number, ...picked.slice(at)].join('-');
}
