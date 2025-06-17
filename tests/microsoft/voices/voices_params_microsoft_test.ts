import { VoicesParamsMicrosoft } from '../../../src/microsoft/voices/voices_params.js';
import { VoicesNameOptionsMicrosoft } from '../../../src/microsoft/voices/voices_name_options.js';
import { HttpProxyBase } from '../../../src/common/http/http_proxy_base.js';

describe('VoicesParamsMicrosoft Tests', () => {
  test('should create with no parameters at all', () => {
    const params = new VoicesParamsMicrosoft();
    expect(params).toBeDefined();
    expect(params.nameOptions).toBeDefined();
    expect(params.httpProxy).toBeUndefined();
  });

  describe('VoicesParamsMicrosoft Tests for nameOptions', () => {
    test('should create with empty nameOptions constructor', () => {
      const params = new VoicesParamsMicrosoft({
        nameOptions: new VoicesNameOptionsMicrosoft(),
      });

      expect(params).toBeDefined();
      expect(params.nameOptions.maleNames).toBeUndefined();
      expect(params.nameOptions.femaleNames).toBeUndefined();
    });

    test('should create with maleNames and femaleNamesMapper present, ensuring the constraint is followed', () => {
      const params = new VoicesParamsMicrosoft({
        nameOptions: new VoicesNameOptionsMicrosoft({
          maleNames: ['John', 'Mike'],
          femaleNamesMapper: (voices, index): string => voices[index].name,
        }),
      });

      expect(params).toBeDefined();
      expect(params.nameOptions.maleNames).toEqual(['John', 'Mike']);
      expect(params.nameOptions.maleNamesMapper).toBeUndefined();
      expect(params.nameOptions.femaleNames).toBeUndefined();
      expect(typeof params.nameOptions.femaleNamesMapper).toBe('function');
    });

    test('should create with maleNamesMapper and femaleNames present, ensuring the constraint is followed', () => {
      const params = new VoicesParamsMicrosoft({
        nameOptions: new VoicesNameOptionsMicrosoft({
          maleNamesMapper: (voices, index): string => voices[index].name,
          femaleNames: ['Anna', 'Maria'],
        }),
      });

      expect(params).toBeDefined();
      expect(params.nameOptions.maleNames).toBeUndefined();
      expect(typeof params.nameOptions.maleNamesMapper).toBe('function');
      expect(params.nameOptions.femaleNames).toEqual(['Anna', 'Maria']);
      expect(params.nameOptions.femaleNamesMapper).toBeUndefined();
    });

    test('should create with only maleNames present', () => {
      const params = new VoicesParamsMicrosoft({
        nameOptions: new VoicesNameOptionsMicrosoft({
          maleNames: ['John', 'Mike'],
        }),
      });

      expect(params).toBeDefined();
      expect(params.nameOptions.maleNames).toEqual(['John', 'Mike']);
      expect(params.nameOptions.maleNamesMapper).toBeUndefined();
      expect(params.nameOptions.femaleNames).toBeUndefined();
      expect(params.nameOptions.femaleNamesMapper).toBeUndefined();
    });

    test('should create with only maleNamesMapper present', () => {
      const params = new VoicesParamsMicrosoft({
        nameOptions: new VoicesNameOptionsMicrosoft({
          maleNamesMapper: (voices, index): string => voices[index].name,
        }),
      });

      expect(params).toBeDefined();
      expect(params.nameOptions.maleNames).toBeUndefined();
      expect(typeof params.nameOptions.maleNamesMapper).toBe('function');
      expect(params.nameOptions.femaleNames).toBeUndefined();
      expect(params.nameOptions.femaleNamesMapper).toBeUndefined();
    });

    test('should create with only femaleNames present', () => {
      const params = new VoicesParamsMicrosoft({
        nameOptions: new VoicesNameOptionsMicrosoft({
          femaleNames: ['Anna', 'Maria'],
        }),
      });

      expect(params).toBeDefined();
      expect(params.nameOptions.femaleNames).toEqual(['Anna', 'Maria']);
      expect(params.nameOptions.femaleNamesMapper).toBeUndefined();
      expect(params.nameOptions.maleNames).toBeUndefined();
      expect(params.nameOptions.maleNamesMapper).toBeUndefined();
    });

    test('should create with only femaleNamesMapper present', () => {
      const params = new VoicesParamsMicrosoft({
        nameOptions: new VoicesNameOptionsMicrosoft({
          femaleNamesMapper: (voices, index): string => voices[index].name,
        }),
      });

      expect(params).toBeDefined();
      expect(params.nameOptions.femaleNames).toBeUndefined();
      expect(typeof params.nameOptions.femaleNamesMapper).toBe('function');
      expect(params.nameOptions.maleNames).toBeUndefined();
      expect(params.nameOptions.maleNamesMapper).toBeUndefined();
    });

    test('should create with neither maleNames/maleNamesMapper nor femaleNames/femaleNamesMapper', () => {
      const params = new VoicesParamsMicrosoft({
        nameOptions: new VoicesNameOptionsMicrosoft(),
      });

      expect(params).toBeDefined();
      expect(params.nameOptions.maleNames).toBeUndefined();
      expect(params.nameOptions.maleNamesMapper).toBeUndefined();
      expect(params.nameOptions.femaleNames).toBeUndefined();
      expect(params.nameOptions.femaleNamesMapper).toBeUndefined();
    });
  });

  describe('VoicesParamsMicrosoft Tests for httpProxy', () => {
    test('should create with only httpProxy parameter', () => {
      const params = new VoicesParamsMicrosoft({
        httpProxy: (): HttpProxyBase => {
          return new HttpProxyBase({
            headers: {
              HeaderName: 'HeaderValue',
            },
          });
        },
      });

      expect(params).toBeDefined();
      expect(typeof params.httpProxy).toBe('function');
    });
  });
});
