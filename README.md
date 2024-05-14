# Cloud Text-To-Speech

![Npm Version](https://img.shields.io/npm/v/cloud-text-to-speech.svg?logo=npm)
![Npm Downloads Total](https://img.shields.io/npm/dt/cloud-text-to-speech.svg?logo=npm)
![Npm Downloads Week](https://img.shields.io/npm/dw/cloud-text-to-speech.svg?logo=npm)
![GitHub](https://img.shields.io/github/license/markokosticdev/cloud_text_to_speech_nodejs.svg?logo=github)
[![GitHub Sponsor](https://img.shields.io/badge/GitHub%20Sponsor-donate-yellow.svg?logo=github)](https://github.com/sponsors/markokosticdev)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-donate-yellow.svg?logo=buy-me-a-coffee)](https://www.buymeacoffee.com/markokostich)

Single interface to Google, Microsoft, and Amazon Text-To-Speech.
NodeJS implementation of:

- [Google Cloud Text-To-Speech API](https://cloud.google.com/text-to-speech)
- [Microsoft Azure Cognitive Text-To-Speech API](https://azure.microsoft.com/en-us/services/cognitive-services/text-to-speech)
- [Amazon Polly API](https://aws.amazon.com/polly)

## Features

- Universal implementation for accessing all providers with one interface.
- Separate implementation for every provider so we could access every functionality.
- Sanitize SSML input per provider so we send only supported SSML elements.
- Locale names in English and native language so we could display language selector.
- Fake name generation for Google voices that are generated randomly based on voice locale.
- Accessible configurable output format (per provider), rate, and pitch.

## Getting Started

There are essentially two ways to use Cloud Text-To-Speech:

- Universal: Using TtsUniversal to be able to configure the TTS provider dynamically and us it.
    - Single: Using `TtsProviders.google`, `TtsProviders.microsoft`, `TtsProviders.amazon` to use the single provider at a time.
    - Combine: Using `TtsProviders.combine` to combine all providers and get all voices at once.
- Provider: Using TtsGoogle, TtsMicrosoft, TtsAmazon to get the most from provider's API.

### Universal(Single)

To init configuration use:

```ts
//Do init once and run it before any other method
TtsUniversal.init({
  provider: TtsProviders.amazon,
  googleParams: { apiKey: "API-KEY" },
  microsoftParams: { subscriptionKey: "SUBSCRIPTION-KEY", region: "eastus" },
  amazonParams: { keyId: "KEY-ID", accessKey: "ACCESS-KEY", region: "us-east-1" },
  withLogs: true
});
```

To change provider use:

```ts
TtsUniversal.setProvider(TtsProviders.microsoft);
```

To get the list of all voices use:

```ts
//Get voices
const voicesResponse = await TtsUniversal.getVoices();
const voices = voicesResponse.voices;

//Print all available voices
console.log(voices);

//Pick an English Voice
const voice = voices.find((voice) => voice.locale.code.startsWith('en-'));
```

To convert TTS and get audio use:

```ts
//Generate Audio for a text
const text = "Amazon, Microsoft and Google Text-to-Speech API are awesome";

const ttsParams = new TtsParamsUniversal({
  voice: voice,
  audioFormat: AudioOutputFormatUniversal.mp3_64k,
  text: text,
  rate: 'slow', //optional
  pitch: 'default', //optional
});

const ttsResponse = await TtsUniversal.convertTts(ttsParams);

//Get the audio bytes.
const audioBytes = ttsResponse.audio;
```

### Universal(Combine)

To init configuration use:

```ts
//Do init once and run it before any other method
TtsUniversal.init({
  provider: TtsProviders.combine,
  googleParams: { apiKey: "API-KEY" },
  microsoftParams: { subscriptionKey: "SUBSCRIPTION-KEY", region: "eastus" },
  amazonParams: { keyId: "KEY-ID", accessKey: "ACCESS-KEY", region: "us-east-1" },
  withLogs: true
});
```

To change provider use:

```ts
TtsUniversal.setProvider(TtsProviders.combine);
```

To get the list of all voices use:

```ts
//Get voices
const voicesResponse = await TtsUniversal.getVoices();
const voices = voicesResponse.voices;

//Print all available voices
console.log(voices);

//Pick an English Voice
const voice = voices.find((voice) => voice.locale.code.startsWith('en-'));
```

To convert TTS and get audio use:

```ts
//Generate Audio for a text
const text = "Amazon, Microsoft and Google Text-to-Speech API are awesome";

const ttsParams = new TtsParamsUniversal({
  voice: voice,
  audioFormat: AudioOutputFormatUniversal.mp3_64k,
  text: text,
  rate: 'slow', //optional
  pitch: 'default', //optional
});

const ttsResponse = await TtsUniversal.convertTts(ttsParams);

//Get the audio bytes.
const audioBytes = ttsResponse.audio;
```

### Google

To init configuration use:

```ts
//Do init once and run it before any other method
TtsGoogle.init({
  params: { apiKey: 'API-KEY' },
  withLogs: true,
});
```

To get the list of all voices use:

```ts
//Get voices
const voicesResponse = await TtsGoogle.getVoices();
const voices = voicesResponse.voices;

//Print all voices
console.log(voices);

//Pick an English Voice
const voice = voices.find((voice) => voice.locale.code.startsWith('en-'));
```

To convert TTS and get audio use:

```ts
//Generate Audio for a text
const text = '<speak>Google<break time="2s"> Speech Service Text-to-Speech API is awesome!</speak>';

const ttsParams = new TtsParamsGoogle({
  voice: voice,
  audioFormat: AudioOutputFormatGoogle.mp3,
  text: text,
  rate: 'slow', //optional
  pitch: 'default', //optional
});

const ttsResponse = await TtsGoogle.convertTts(ttsParams);

//Get the audio bytes.
const audioBytes = ttsResponse.audio;
```

### Microsoft

To init configuration use:

```ts
//Do init once and run it before any other method
TtsMicrosoft.init({
  params: { subscriptionKey: 'SUBSCRIPTION-KEY', region: 'eastus' },
  withLogs: true,
});
```

To get the list of all voices use:

```ts
//Get voices
const voicesResponse = await TtsMicrosoft.getVoices();
const voices = voicesResponse.voices;

//Print all voices
console.log(voices);

//Pick an English Voice
const voice = voices.find((voice) => voice.locale.code.startsWith('en-'));
```

To convert TTS and get audio use:

```ts
//Generate Audio for a text
const text = '<speak>Microsoft<break time="2s"> Speech Service Text-to-Speech API is awesome!</speak>';

const ttsParams = new TtsParamsMicrosoft({
  voice: voice,
  audioFormat: AudioOutputFormatMicrosoft.audio48Khz192kBitrateMonoMp3,
  text: text,
  rate: 'slow', //optional
  pitch: 'default', //optional
});

const ttsResponse = await TtsMicrosoft.convertTts(ttsParams);

//Get the audio bytes.
const audioBytes = ttsResponse.audio;
```

### Amazon

To init configuration use:

```ts
//Do init once and run it before any other method
TtsAmazon.init({
  params: { keyId: 'KEY-ID', accessKey: 'ACCESS-KEY', region: 'us-east-1' },
  withLogs: true,
});
```

To get the list of all voices use:

```ts
//Get voices
const voicesResponse = await TtsAmazon.getVoices();
const voices = voicesResponse.voices;

//Print all voices
console.log(voices);

//Pick an English Voice
const voice = voices.find((voice) => voice.locale.code.startsWith('en-'));
```

To convert TTS and get audio use:

```ts
//Generate Audio for a text
const text = '<speak>Amazon<break time="2s"> Speech Service Text-to-Speech API is awesome!</speak>';

const ttsParams = new TtsParamsAmazon({
  voice: voice,
  audioFormat: AudioOutputFormatAmazon.mp3,
  text: text,
  rate: 'slow', // optional
  pitch: 'default', // optional
});

const ttsResponse = await TtsAmazon.convertTts(ttsParams);

//Get the audio bytes.
const audioBytes = ttsResponse.audio;
```

## Notes

There are things you should take care of:

- Securing of your API keys and credentials, they could be extracted from your web or mobile app.
- For fixing SSML/XML before passing it to TTS Params, you could use the [xmldom](https://www.npmjs.com/package/xmldom)
  package's,
  methods `(new XMLSerializer()).serializeToString(new DOMParser().parseFromString(ssml, 'text/xml'))`.
- Audio has uniform format for all providers, it is Uint8Array that you could use to play it or save it to file.
