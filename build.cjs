const StyleDictionary = require('style-dictionary');
const { registerTransforms, permutateThemes } = require('@tokens-studio/sd-transforms');
const { promises } = require('fs');

registerTransforms(StyleDictionary, {
  expand: { composition: false, typography: false, border: false, shadow: false },
  excludeParentKeys: false,
});

StyleDictionary.registerTransform({
  type: 'value',
  name: 'myCustomTransform',
  matcher: (token) => {},
  transformer: (token) => {
    return token;
  },
});

const { fileHeader, formattedVariables } = StyleDictionary.formatHelpers;

async function run() {
  const $themes = JSON.parse(await promises.readFile('tokens/$themes.json', 'utf-8'));
  const themes = permutateThemes($themes, { seperator: '_' });
  const configs = Object.entries(themes).map(([name, tokensets]) => ({
    source: tokensets.map(tokenset => `tokens/${tokenset}.json`),
    platforms: {
			css: {
				buildPath: 'build/css/',
				transformGroup: 'tokens-studio',
				files: [
					{
						destination: `${name}.css`,
						format: 'css/variables',
					},
				],
			},
    },
  }));

  configs.forEach(cfg => {
    const sd = StyleDictionary.extend(cfg);
    sd.cleanAllPlatforms();
    sd.buildAllPlatforms();
  });
}

run();