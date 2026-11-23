import { describe, expect, it } from 'vitest';
import { guessablePasswords, footprintScam, validateFootprint } from './labs';

const NOW = new Date(2026, 10, 23);
const valid = { city: 'Thiès', year: '1998', name: 'Awa', passion: 'Lutte' };

describe('footprint form', () => {
  it('accepts any real answers', () => {
    expect(validateFootprint(valid, NOW)).toEqual({});
    expect(validateFootprint({ city: 'Lagos', year: '1985', name: 'Chinedu', passion: 'Super Eagles' }, NOW)).toEqual({});
  });

  it('reports missing, too long and invalid years', () => {
    expect(validateFootprint({}, NOW)).toEqual({ city: 'required', year: 'required', name: 'required', passion: 'required' });
    expect(validateFootprint({ ...valid, year: '98' }, NOW).year).toBe('year');
    expect(validateFootprint({ ...valid, year: '2031' }, NOW).year).toBe('year');
    expect(validateFootprint({ ...valid, city: 'x'.repeat(41) }, NOW).city).toBe('tooLong');
    expect(validateFootprint({ ...valid, name: '   ' }, NOW).name).toBe('required');
  });

  it('builds guessable passwords from the answers, accents removed', () => {
    const pws = guessablePasswords(valid);
    expect(pws).toContain('Awa1998');
    expect(pws).toContain('Thies1998!');
    expect(new Set(pws).size).toBe(pws.length);
  });

  it('keeps names written in other scripts', () => {
    expect(guessablePasswords({ ...valid, name: 'محمد' })[0]).toBe('محمد1998');
  });

  it('uses the payment service of the user\'s country in the trap message', () => {
    expect(footprintScam(valid, 'fr', 'MTN MoMo')).toContain('par MTN MoMo');
  });
});
