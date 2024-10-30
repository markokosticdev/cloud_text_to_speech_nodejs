import { VoicesParamsAmazon } from "../../../src/amazon/voices/voices_params.js";
import { VoicesNameOptionsAmazon } from "../../../src/amazon/voices/voices_name_options.js";
import { HttpProxyBase } from "../../../src/common/http/http_proxy_base.js";

describe('VoicesParamsAmazon Tests', () => {
  test('should create with no parameters at all', () => {
    const params = new VoicesParamsAmazon();
    expect(params).toBeDefined();
    expect(params.nameOptions).toBeDefined();
    expect(params.httpProxy).toBeUndefined();
  });

  describe('VoicesParamsAmazon Tests for nameOptions', () => {
    test('should create with empty nameOptions constructor', () => {
      const params = new VoicesParamsAmazon({
        nameOptions: new VoicesNameOptionsAmazon(),
      });

      expect(params).toBeDefined();
      expect(params.nameOptions.maleNames).toBeUndefined();
      expect(params.nameOptions.femaleNames).toBeUndefined();
    });

    test('should create with maleNames and femaleNamesMapper present, ensuring the constraint is followed', () => {
      const params = new VoicesParamsAmazon({
        nameOptions: new VoicesNameOptionsAmazon({
          maleNames: ['John', 'Mike'],
          femaleNamesMapper: (voices, index) => voices[index].name,
        }),
      });

      expect(params).toBeDefined();
      expect(params.nameOptions.maleNames).toEqual(['John', 'Mike']);
      expect(params.nameOptions.maleNamesMapper).toBeUndefined();
      expect(params.nameOptions.femaleNames).toBeUndefined();
      expect(typeof params.nameOptions.femaleNamesMapper).toBe('function');
    });

    test('should create with maleNamesMapper and femaleNames present, ensuring the constraint is followed', () => {
      const params = new VoicesParamsAmazon({
        nameOptions: new VoicesNameOptionsAmazon({
          maleNamesMapper: (voices, index) => voices[index].name,
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
      const params = new VoicesParamsAmazon({
        nameOptions: new VoicesNameOptionsAmazon({
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
      const params = new VoicesParamsAmazon({
        nameOptions: new VoicesNameOptionsAmazon({
          maleNamesMapper: (voices, index) => voices[index].name,
        }),
      });

      expect(params).toBeDefined();
      expect(params.nameOptions.maleNames).toBeUndefined();
      expect(typeof params.nameOptions.maleNamesMapper).toBe('function');
      expect(params.nameOptions.femaleNames).toBeUndefined();
      expect(params.nameOptions.femaleNamesMapper).toBeUndefined();
    });

    test('should create with only femaleNames present', () => {
      const params = new VoicesParamsAmazon({
        nameOptions: new VoicesNameOptionsAmazon({
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
      const params = new VoicesParamsAmazon({
        nameOptions: new VoicesNameOptionsAmazon({
          femaleNamesMapper: (voices, index) => voices[index].name,
        }),
      });

      expect(params).toBeDefined();
      expect(params.nameOptions.femaleNames).toBeUndefined();
      expect(typeof params.nameOptions.femaleNamesMapper).toBe('function');
      expect(params.nameOptions.maleNames).toBeUndefined();
      expect(params.nameOptions.maleNamesMapper).toBeUndefined();
    });

    test('should create with neither maleNames/maleNamesMapper nor femaleNames/femaleNamesMapper', () => {
      const params = new VoicesParamsAmazon({
        nameOptions: new VoicesNameOptionsAmazon(),
      });

      expect(params).toBeDefined();
      expect(params.nameOptions.maleNames).toBeUndefined();
      expect(params.nameOptions.maleNamesMapper).toBeUndefined();
      expect(params.nameOptions.femaleNames).toBeUndefined();
      expect(params.nameOptions.femaleNamesMapper).toBeUndefined();
    });
  });

  describe('VoicesParamsAmazon Tests for httpProxy', () => {
    test('should create with only httpProxy parameter', () => {
      const params = new VoicesParamsAmazon({
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
