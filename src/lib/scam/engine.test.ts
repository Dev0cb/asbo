import { describe, expect, it } from 'vitest';
import { analyzeMessage } from './engine';
import { analyzeUrl } from './url';
import { normalizeText } from './normalize';

const ids = (text: string) => analyzeMessage(text).signals.map((s) => s.id);

describe('scam engine — anonymised corpus', () => {
  it('flags the fake Wave portal as critical', () => {
    const r = analyzeMessage(
      'Bonjour cher client Wave ! Votre compte sera suspendu dans les 24 heures. Pour éviter le blocage, veuillez confirmer votre identité sur notre portail : https://wave-verification-example.com Saisissez votre numéro, votre code PIN et votre code OTP pour sécuriser votre compte.',
    );
    expect(r.verdict).toBe('critical');
    expect(r.score).toBeGreaterThanOrEqual(90);
    expect(r.combos).toContain('codeAndFakeSite');
    expect(r.signals.map((s) => s.id)).toEqual(
      expect.arrayContaining(['askCode', 'brandLink', 'suspendThreat', 'deadline', 'verifyIdentity']),
    );
  });

  it('separates a bare threat from a threat + link + code request', () => {
    const a = analyzeMessage('Votre compte sera suspendu dans 24 heures.');
    const b = analyzeMessage('Votre compte sera suspendu dans 24 heures. Cliquez ici bit.ly/x7Kq et communiquez votre code OTP.');
    expect(a.verdict).toBe('moderate');
    expect(b.verdict).toBe('critical');
  });

  it('catches the "wrong transfer, send it back" trick', () => {
    const r = analyzeMessage("Salam, j'ai envoyé 25 000 F sur ton numéro par erreur. Stp renvoie-moi ça au 77 123 45 67, c'est urgent.");
    expect(r.combos).toContain('refundTrap');
    expect(r.verdict).toBe('critical');
    expect(r.advice).toContain('refund');
  });

  it('catches WhatsApp account theft by code', () => {
    const r = analyzeMessage("Coucou, je t'ai envoyé un code à 6 chiffres par erreur, tu peux me le renvoyer stp ?");
    expect(r.combos).toContain('codeTheft');
    expect(r.verdict).toBe('critical');
  });

  it('catches the fake recruitment with fees', () => {
    const r = analyzeMessage('Nous recrutons 50 agents ! Salaire 250 000 FCFA. Frais de dossier : 5 000 F à envoyer par Wave au 78 000 11 22.');
    expect(r.combos).toContain('feeForGain');
    expect(r.verdict).toBe('critical');
  });

  it('catches lottery + fee', () => {
    const r = analyzeMessage('Félicitations ! Vous avez gagné 500 000 FCFA au tirage Orange. Payez d’abord 2 000 F de frais de retrait pour recevoir votre gain.');
    expect(r.verdict).toBe('critical');
  });

  it('catches the "new number" family scam', () => {
    const r = analyzeMessage("Maman c'est moi, j'ai changé de numéro. Envoie-moi 15 000 F sur Wave, c'est urgent.");
    expect(r.combos).toContain('familyMoney');
  });

  it('sees through spaced letters and invisible characters', () => {
    const r = analyzeMessage('Envoyez-nous votre c o d e O T P pour activer W​ave');
    expect(r.signals.map((s) => s.id)).toEqual(expect.arrayContaining(['askCode', 'obfuscated']));
  });

  it('flags a malicious APK link', () => {
    expect(ids('Installez la nouvelle appli Wave : http://wave-update.top/wave.apk')).toEqual(
      expect.arrayContaining(['apk', 'brandLink', 'suspiciousTld']),
    );
  });
});

describe('scam engine — other countries', () => {
  it('Kenya: M-Pesa "sent by mistake, send it back"', () => {
    const r = analyzeMessage('Hello, I have sent you Ksh 2,000 by mistake. Please send it back to 0712 345 678, it is urgent.');
    expect(r.combos).toContain('refundTrap');
    expect(r.verdict).toBe('critical');
  });

  it('a prize site asking for the PIN, in another currency', () => {
    const r = analyzeMessage('You have won GHS 500! Claim it now at https://momo-bonus.xyz and enter your PIN.');
    expect(r.signals.map((s) => s.id)).toEqual(expect.arrayContaining(['askCode', 'prize', 'suspiciousTld']));
    expect(r.verdict).toBe('critical');
  });

  it('account "suspended", verify via a suspicious link', () => {
    const r = analyzeMessage('Your account will be suspended within 24 hours. Verify your account at account-verify.top/login');
    expect(r.signals.map((s) => s.id)).toEqual(expect.arrayContaining(['suspendThreat', 'suspiciousTld', 'phishyWords']));
    expect(['high', 'critical']).toContain(r.verdict);
  });

  it('fake parcel fees with a link', () => {
    const r = analyzeMessage('Votre colis est en attente. Réglez les frais de livraison de 1,99 € ici : colis-suivi.click/paiement');
    expect(r.signals.map((s) => s.id)).toEqual(expect.arrayContaining(['upfrontFee', 'suspiciousTld']));
    expect(['moderate', 'high', 'critical']).toContain(r.verdict);
  });

  it('never calls a link "fake" for a brand whose domain we have not verified', () => {
    expect(analyzeUrl('https://yas.sn').flags).not.toContain('brandMismatch');
    expect(analyzeUrl('https://www.douanes.sn').flags).not.toContain('brandMismatch');
  });

  it('treats orange-sonatel.com as a look-alike, not an official domain', () => {
    const flags = analyzeUrl('https://orange-sonatel.com/verif').flags;
    expect(flags).not.toContain('official');
    expect(flags).toContain('brandMismatch');
  });

  it('a genuine M-Pesa confirmation stays low', () => {
    const r = analyzeMessage('QFX12ABC34 Confirmed. Ksh500.00 sent to JOHN KAMAU 0712345678 on 23/11/26 at 10:15 AM. New M-PESA balance is Ksh1,250.00.');
    expect(r.verdict).toBe('low');
  });

  it('does not take ordinary words for brand typos', () => {
    expect(analyzeUrl('https://save.com').flags).not.toContain('typosquat');
    expect(analyzeUrl('https://mood.com').flags).not.toContain('typosquat');
  });
});

describe('scam engine — legitimate messages stay low', () => {
  it('a real one-time code notice', () => {
    const r = analyzeMessage('Votre code de confirmation Wave est 482913. Ne le partagez avec personne, même pas un agent Wave.');
    expect(r.verdict).toBe('low');
    expect(r.signals.map((s) => s.id)).not.toContain('askCode');
  });

  it('awareness advice that mentions codes', () => {
    const r = analyzeMessage('Rappel : ne communiquez jamais votre code PIN, même à un agent.');
    expect(r.verdict).toBe('low');
  });

  it('a friendly message', () => {
    expect(analyzeMessage('Salut Awa, on se retrouve à 18h au marché Sandaga ?').verdict).toBe('low');
  });

  it('an official link to the real domain', () => {
    const r = analyzeMessage('Orange : découvrez nos offres sur https://www.orange.sn/offres');
    expect(r.verdict).not.toBe('critical');
    expect(r.signals.map((s) => s.id)).not.toContain('brandLink');
  });

  it('returns low for empty input', () => {
    expect(analyzeMessage('').verdict).toBe('low');
  });
});

describe('evidence', () => {
  it('quotes the original text, with case and accents, on whole words', () => {
    const r = analyzeMessage('Bonjour ! Votre compte sera SUSPENDU très bientôt.');
    const ev = r.signals.find((s) => s.id === 'suspendThreat')?.evidence;
    expect(ev).toBe('compte sera SUSPENDU');
  });
});

describe('url analyser', () => {
  it('spots typosquatting and brand look-alikes', () => {
    expect(analyzeUrl('https://wav3-secure.com').flags).toContain('typosquat');
    expect(analyzeUrl('https://orange-money-bonus.xyz').flags).toEqual(expect.arrayContaining(['brandMismatch', 'suspiciousTld']));
    expect(analyzeUrl('https://wave.com/fr').flags).toEqual(['official']);
    expect(analyzeUrl('http://192.168.4.20/login').flags).toEqual(expect.arrayContaining(['ip', 'phishyWords']));
    expect(analyzeUrl('https://xn--wve-xla.com').flags).toContain('punycode');
  });
});

describe('normaliser', () => {
  it('maps look-alike letters and flags them', () => {
    const n = normalizeText('Wаve'); // Cyrillic "а"
    expect(n.plain).toBe('wave');
    expect(n.obfuscated).toBe(true);
  });
});
