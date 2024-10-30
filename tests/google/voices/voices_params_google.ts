import { VoicesParamsGoogle } from "../../../src/google/voices/voices_params.js";
import { VoicesNameOptionsGoogle } from "../../../src/google/voices/voices_name_options.js";
import { HttpProxyBase } from "../../../src/common/http/http_proxy_base.js";
import { VoiceNames } from "../../../src/common/voices/voices_names.js";

describe('VoicesParamsGoogle Tests', () => {
  test('should create with no parameters at all', () => {
    const params = new VoicesParamsGoogle();
    expect(params).toBeDefined();
    expect(params.nameOptions).toBeDefined();
    expect(params.httpProxy).toBeUndefined();
  });

  describe('VoicesParamsGoogle Tests for nameOptions', () => {
    test('should create with empty nameOptions constructor', () => {
      const params = new VoicesParamsGoogle({
        nameOptions: new VoicesNameOptionsGoogle(),
      });

      expect(params).toBeDefined();
      expect(params.nameOptions.maleNames).toEqual(VoiceNames.male);
      expect(params.nameOptions.femaleNames).toEqual(VoiceNames.female);
    });

    test('should create with maleNames and femaleNamesMapper present, ensuring the constraint is followed', () => {
      const params = new VoicesParamsGoogle({
        nameOptions: new VoicesNameOptionsGoogle({
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
      const params = new VoicesParamsGoogle({
        nameOptions: new VoicesNameOptionsGoogle({
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
      const params = new VoicesParamsGoogle({
        nameOptions: new VoicesNameOptionsGoogle({
          maleNames: ['John', 'Mike'],
        }),
      });

      expect(params).toBeDefined();
      expect(params.nameOptions.maleNames).toEqual(['John', 'Mike']);
      expect(params.nameOptions.maleNamesMapper).toBeUndefined();
      expect(params.nameOptions.femaleNames).toEqual(VoiceNames.female);
      expect(params.nameOptions.femaleNamesMapper).toBeUndefined();
    });

    test('should create with only maleNamesMapper present', () => {
      const params = new VoicesParamsGoogle({
        nameOptions: new VoicesNameOptionsGoogle({
          maleNamesMapper: (voices, index) => voices[index].name,
        }),
      });

      expect(params).toBeDefined();
      expect(params.nameOptions.maleNames).toBeUndefined();
      expect(typeof params.nameOptions.maleNamesMapper).toBe('function');
      expect(params.nameOptions.femaleNames).toEqual(VoiceNames.female);
      expect(params.nameOptions.femaleNamesMapper).toBeUndefined();
    });

    test('should create with only femaleNames present', () => {
      const params = new VoicesParamsGoogle({
        nameOptions: new VoicesNameOptionsGoogle({
          femaleNames: ['Anna', 'Maria'],
        }),
      });

      expect(params).toBeDefined();
      expect(params.nameOptions.femaleNames).toEqual(['Anna', 'Maria']);
      expect(params.nameOptions.femaleNamesMapper).toBeUndefined();
      expect(params.nameOptions.maleNames).toEqual(VoiceNames.male);
      expect(params.nameOptions.maleNamesMapper).toBeUndefined();
    });

    test('should create with only femaleNamesMapper present', () => {
      const params = new VoicesParamsGoogle({
        nameOptions: new VoicesNameOptionsGoogle({
          femaleNamesMapper: (voices, index) => voices[index].name,
        }),
      });

      expect(params).toBeDefined();
      expect(params.nameOptions.femaleNames).toBeUndefined();
      expect(typeof params.nameOptions.femaleNamesMapper).toBe('function');
      expect(params.nameOptions.maleNames).toEqual(VoiceNames.male);
      expect(params.nameOptions.maleNamesMapper).toBeUndefined();
    });

    test('should create with neither maleNames/maleNamesMapper nor femaleNames/femaleNamesMapper', () => {
      const params = new VoicesParamsGoogle({
        nameOptions: new VoicesNameOptionsGoogle(),
      });

      expect(params).toBeDefined();
      expect(params.nameOptions.maleNames).toEqual(VoiceNames.male);
      expect(params.nameOptions.maleNamesMapper).toBeUndefined();
      expect(params.nameOptions.femaleNames).toEqual(VoiceNames.female);
      expect(params.nameOptions.femaleNamesMapper).toBeUndefined();
    });
  });

  describe('VoicesParamsGoogle Tests for httpProxy', () => {
    test('should create with only httpProxy parameter', () => {
      const params = new VoicesParamsGoogle({
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
