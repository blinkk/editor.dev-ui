# Changelog

## [3.12.0](https://www.github.com/blinkk/editor.dev-ui/compare/v3.11.1...v3.12.0) (2022-02-08)


### Features

* Communication with preview iframe. ([#255](https://www.github.com/blinkk/editor.dev-ui/issues/255)) ([38c7e52](https://www.github.com/blinkk/editor.dev-ui/commit/38c7e52e8fe422daf5ebecd57dd9161084cd7851))
* Partial list filtering by key using include/exclude filter. ([27b1b3c](https://www.github.com/blinkk/editor.dev-ui/commit/27b1b3c1eec138342545187c9bb8596936300d1b))


### Bug Fixes

* Fix the sorting of partials and the placement of priority config. ([624e607](https://www.github.com/blinkk/editor.dev-ui/commit/624e6072afd14b78f6a0e2bc7dd2415810f97188))

### [3.11.1](https://www.github.com/blinkk/editor.dev-ui/compare/v3.11.0...v3.11.1) (2021-11-30)


### Bug Fixes

* Allow delete modal to submit when the form is clean. ([#253](https://www.github.com/blinkk/editor.dev-ui/issues/253)) ([2663414](https://www.github.com/blinkk/editor.dev-ui/commit/2663414a4920eefd73eab70a1a5ca3e0d65abc0f))

## [3.11.0](https://www.github.com/blinkk/editor.dev-ui/compare/v3.10.2...v3.11.0) (2021-11-18)


### Features

* Floating menu for the site file operation. ([#247](https://www.github.com/blinkk/editor.dev-ui/issues/247)) ([841dd17](https://www.github.com/blinkk/editor.dev-ui/commit/841dd179da362e152c0b2037b20ec042ddf2fd88)), closes [#151](https://www.github.com/blinkk/editor.dev-ui/issues/151)
* List hover menu for more interaction options. ([#245](https://www.github.com/blinkk/editor.dev-ui/issues/245)) ([bf8dda3](https://www.github.com/blinkk/editor.dev-ui/commit/bf8dda3cbaf55eb036fdcbcf4bf15c77c4547429)), closes [#137](https://www.github.com/blinkk/editor.dev-ui/issues/137)


### Bug Fixes

* Show error message when requesting non-existent repository. ([#252](https://www.github.com/blinkk/editor.dev-ui/issues/252)) … ([15c1f30](https://www.github.com/blinkk/editor.dev-ui/commit/15c1f30568d49130b801f2f4db76265f6bfb9aa9))

### [3.10.2](https://www.github.com/blinkk/editor.dev-ui/compare/v3.10.1...v3.10.2) (2021-11-03)


### Bug Fixes

* Constructor validation using the zones to correctly match value. ([#243](https://www.github.com/blinkk/editor.dev-ui/issues/243)) ([a8d7054](https://www.github.com/blinkk/editor.dev-ui/commit/a8d7054ce5ad2675b7047d92b4affe75e5100fc7))

### [3.10.1](https://www.github.com/blinkk/editor.dev-ui/compare/v3.10.0...v3.10.1) (2021-11-02)


### Bug Fixes

* Keep existing preview state while loading a new file. ([#238](https://www.github.com/blinkk/editor.dev-ui/issues/238)) ([9191de5](https://www.github.com/blinkk/editor.dev-ui/commit/9191de50be671cd290413b71e2208f9852f23fde))
* Load the preview url without waiting for the file to load. ([#240](https://www.github.com/blinkk/editor.dev-ui/issues/240)) ([ebb72d2](https://www.github.com/blinkk/editor.dev-ui/commit/ebb72d2da83858ee7ed6efd559dbac2d97f80713))

## [3.10.0](https://www.github.com/blinkk/editor.dev-ui/compare/v3.9.0...v3.10.0) (2021-08-13)


### Features

* Delay validation on form modal. ([#225](https://www.github.com/blinkk/editor.dev-ui/issues/225)) ([92fc14a](https://www.github.com/blinkk/editor.dev-ui/commit/92fc14a2c8f3d288456ece9052563a46608867ac))
* File refresh icon for reloading the file (and partials). ([#236](https://www.github.com/blinkk/editor.dev-ui/issues/236)) ([b59521a](https://www.github.com/blinkk/editor.dev-ui/commit/b59521a2e64088f93521dbba86424b6bce73012c))
* GitHub authenticaion log out. ([#229](https://www.github.com/blinkk/editor.dev-ui/issues/229)) ([d793eb1](https://www.github.com/blinkk/editor.dev-ui/commit/d793eb10d1636d3931766e0be1b3a0b3cefa820d))
* Hidden partials and partial priority. ([#233](https://www.github.com/blinkk/editor.dev-ui/issues/233)) ([ab539bb](https://www.github.com/blinkk/editor.dev-ui/commit/ab539bb11683ee5410632b726f20b96ac68fd78c)), closes [#222](https://www.github.com/blinkk/editor.dev-ui/issues/222)
* Indexes on labels for lists and partials. ([4c8c210](https://www.github.com/blinkk/editor.dev-ui/commit/4c8c210dde3d050841096ceef553e4762442dabd))
* Manual refresh for preview. ([#237](https://www.github.com/blinkk/editor.dev-ui/issues/237)) ([a6fd369](https://www.github.com/blinkk/editor.dev-ui/commit/a6fd3690a74ade657e1a15bd13fe8d86c186a072)), closes [#133](https://www.github.com/blinkk/editor.dev-ui/issues/133)
* Media preview serving path from the preview server setting. ([#231](https://www.github.com/blinkk/editor.dev-ui/issues/231)) ([5a00242](https://www.github.com/blinkk/editor.dev-ui/commit/5a002426951dbb324a929ecec07841e038a9e997)), closes [#228](https://www.github.com/blinkk/editor.dev-ui/issues/228)
* Message when field values are invalid for field or missing field. ([#218](https://www.github.com/blinkk/editor.dev-ui/issues/218)) ([cc0cdf8](https://www.github.com/blinkk/editor.dev-ui/commit/cc0cdf847a92740ffe9deacdf6dea3e92cc46022)), closes [#154](https://www.github.com/blinkk/editor.dev-ui/issues/154) [#94](https://www.github.com/blinkk/editor.dev-ui/issues/94)
* Validation delay for forms and fields. ([#223](https://www.github.com/blinkk/editor.dev-ui/issues/223)) ([ffc24f7](https://www.github.com/blinkk/editor.dev-ui/commit/ffc24f7ab7aa7a7a4b093e377018582723a2d6e4))


### Bug Fixes

* Cleanup the default value for media field when used in lists. ([#227](https://www.github.com/blinkk/editor.dev-ui/issues/227)) ([b21762b](https://www.github.com/blinkk/editor.dev-ui/commit/b21762bebc183a038489c769c3683ac2ebe288a6))
* Coloring for icons in the list to only target non-special leafs. ([#230](https://www.github.com/blinkk/editor.dev-ui/issues/230)) ([c68543f](https://www.github.com/blinkk/editor.dev-ui/commit/c68543f7915c6e723464d4364f14a51a75402cf1)), closes [#177](https://www.github.com/blinkk/editor.dev-ui/issues/177)
* Sorting elements use updated focus handlers to not drag inputs. ([#226](https://www.github.com/blinkk/editor.dev-ui/issues/226)) ([4a5e008](https://www.github.com/blinkk/editor.dev-ui/commit/4a5e008de11c4d64a11b443519c94388f95e96a6))
* Upstream fix for zone based lost focus check ([a328f15](https://www.github.com/blinkk/editor.dev-ui/commit/a328f154aa8897ee1b1317c17359253164da56e9)), closes [#224](https://www.github.com/blinkk/editor.dev-ui/issues/224)

## [3.9.0](https://www.github.com/blinkk/editor.dev-ui/compare/v3.8.0...v3.9.0) (2021-08-10)


### Features

* Project breadcrumb links. ([#211](https://www.github.com/blinkk/editor.dev-ui/issues/211)) ([9f8a07d](https://www.github.com/blinkk/editor.dev-ui/commit/9f8a07dfc073541c34d4efcee2488b3d06ad1b29))


### Bug Fixes

* Clone of selective config causes global objects to be cloned. ([#217](https://www.github.com/blinkk/editor.dev-ui/issues/217)) ([120af68](https://www.github.com/blinkk/editor.dev-ui/commit/120af6889662bca4d9bc9c7c0e62000132e74bd1))
* Infinite loading when errors retrieving data ([#214](https://www.github.com/blinkk/editor.dev-ui/issues/214)) ([527de65](https://www.github.com/blinkk/editor.dev-ui/commit/527de65e5b6acfc230a180318cc6cd18a5aa7be1)), closes [#128](https://www.github.com/blinkk/editor.dev-ui/issues/128)
* Project type specific guessing of partials. ([#215](https://www.github.com/blinkk/editor.dev-ui/issues/215)) ([ef7920d](https://www.github.com/blinkk/editor.dev-ui/commit/ef7920d567a936bbcabd0db5af00c96740fe72f9)), closes [#213](https://www.github.com/blinkk/editor.dev-ui/issues/213)
* SVG path fill color to current color for theming. ([43b4d46](https://www.github.com/blinkk/editor.dev-ui/commit/43b4d4642a5f76cd9ccd95c29054b5964b852772))
* Updated onboarding flow to match newer mocks. ([#209](https://www.github.com/blinkk/editor.dev-ui/issues/209)) ([49ef330](https://www.github.com/blinkk/editor.dev-ui/commit/49ef33080e09e62efb094d09268cdad77b71e16a))

## [3.8.0](https://www.github.com/blinkk/editor.dev-ui/compare/v3.7.0...v3.8.0) (2021-08-04)


### Features

* Glob style filter. ([#193](https://www.github.com/blinkk/editor.dev-ui/issues/193)) ([2f5caed](https://www.github.com/blinkk/editor.dev-ui/commit/2f5caedb2e31f9b7a79c30856ea730ecc0ce4418))

## [3.7.0](https://www.github.com/blinkk/editor.dev-ui/compare/v3.6.0...v3.7.0) (2021-08-04)


### Features

* monochromatic color scheme ([#162](https://www.github.com/blinkk/editor.dev-ui/issues/162)) ([2264696](https://www.github.com/blinkk/editor.dev-ui/commit/22646969635199cbdaa7769ea8966e8425a03890))


### Bug Fixes

* Allow the state to handle errors as a read notification. ([4310284](https://www.github.com/blinkk/editor.dev-ui/commit/43102840cf3ce28747e8a0b87526a8caa7d74115)), closes [#167](https://www.github.com/blinkk/editor.dev-ui/issues/167)
* Footer for the menu with light/dark mode toggle. ([#168](https://www.github.com/blinkk/editor.dev-ui/issues/168)) ([1c1a1c7](https://www.github.com/blinkk/editor.dev-ui/commit/1c1a1c70830310d108f9793410888128d7eb301c))
* Missing auth fails the onboarding status. ([11a9862](https://www.github.com/blinkk/editor.dev-ui/commit/11a98625203e496e1e3d69c623a599c913fe6b0a)), closes [#169](https://www.github.com/blinkk/editor.dev-ui/issues/169)
* use deep copy for the selective config to prevent shared config ([#178](https://www.github.com/blinkk/editor.dev-ui/issues/178)) ([c50d00c](https://www.github.com/blinkk/editor.dev-ui/commit/c50d00ca259949bfe61b6d40da392aed72963689)), closes [#174](https://www.github.com/blinkk/editor.dev-ui/issues/174)
* UX messaging around the preview status. ([#166](https://www.github.com/blinkk/editor.dev-ui/issues/166)) ([a566536](https://www.github.com/blinkk/editor.dev-ui/commit/a566536ed041ade5e9e586612e225e2a520aeca3)), closes [#158](https://www.github.com/blinkk/editor.dev-ui/issues/158)

## [3.6.0](https://www.github.com/blinkk/editor.dev-ui/compare/v3.5.0...v3.6.0) (2021-08-02)


### Features

* editor history as a stand alone part of the state ([#160](https://www.github.com/blinkk/editor.dev-ui/issues/160)) ([36dc4e6](https://www.github.com/blinkk/editor.dev-ui/commit/36dc4e6af435d6138f68e8a6c73e3437da34494d))
* Use container queries for dynamically adjusting layout ([87fd033](https://www.github.com/blinkk/editor.dev-ui/commit/87fd0335de5043b11f4ce9492c4e612ceb2582c6))


### Bug Fixes

* color for unstyled button to be readable ([f7a1322](https://www.github.com/blinkk/editor.dev-ui/commit/f7a1322e16f8a96a819e321b2700b49b48b4046d))
* restrict history for local projects ([#161](https://www.github.com/blinkk/editor.dev-ui/issues/161)) ([adec8ec](https://www.github.com/blinkk/editor.dev-ui/commit/adec8ec229ecf965356288ac1089068d92ab2026))
* upstream fix for shared deep references for clean checks ([3f2a5e7](https://www.github.com/blinkk/editor.dev-ui/commit/3f2a5e7ab0a527e391b124fc9fe73e66cdc2df74)), closes [#136](https://www.github.com/blinkk/editor.dev-ui/issues/136)

## [3.5.0](https://www.github.com/blinkk/editor.dev-ui/compare/v3.4.1...v3.5.0) (2021-07-29)


### Features

* icon for project source ([#147](https://www.github.com/blinkk/editor.dev-ui/issues/147)) ([ed9487f](https://www.github.com/blinkk/editor.dev-ui/commit/ed9487f3d8280ee8d606dd8b40fc5454b8cfdfdc))
* onboarding in editor app  ([#157](https://www.github.com/blinkk/editor.dev-ui/issues/157)) ([600adf9](https://www.github.com/blinkk/editor.dev-ui/commit/600adf9ffcad7f900bb5029da779777ec7baa375))
* title updating with content changes ([#150](https://www.github.com/blinkk/editor.dev-ui/issues/150)) ([5312590](https://www.github.com/blinkk/editor.dev-ui/commit/5312590caca9529728e893e782c5718ea2b76ba9)), closes [#141](https://www.github.com/blinkk/editor.dev-ui/issues/141)


### Bug Fixes

* adjust default for desktop to have a height ([#130](https://www.github.com/blinkk/editor.dev-ui/issues/130)) ([724dbce](https://www.github.com/blinkk/editor.dev-ui/commit/724dbce276c691b9186fd58598bc079815e5d0c2))
* adjust filter to not filter only content yamls ([#142](https://www.github.com/blinkk/editor.dev-ui/issues/142)) ([02d0b60](https://www.github.com/blinkk/editor.dev-ui/commit/02d0b60d88ab86b4e2cf1ee5352dc7698dc75614)), closes [#110](https://www.github.com/blinkk/editor.dev-ui/issues/110)
* border color between panels of UI ([#146](https://www.github.com/blinkk/editor.dev-ui/issues/146)) ([112ca07](https://www.github.com/blinkk/editor.dev-ui/commit/112ca07910fc6f9deb64c177dff8420215816ed4))
* guess field label from key if no field present ([3ff3861](https://www.github.com/blinkk/editor.dev-ui/commit/3ff3861be9a3125a7d205c373e485ab7fab76b57)), closes [#129](https://www.github.com/blinkk/editor.dev-ui/issues/129)
* reload preview server config after creating or copying file ([#145](https://www.github.com/blinkk/editor.dev-ui/issues/145)) ([cdb6599](https://www.github.com/blinkk/editor.dev-ui/commit/cdb65992b520af3cd3ae335fe0b328e0fdadf083)), closes [#132](https://www.github.com/blinkk/editor.dev-ui/issues/132)
* style the variant for changes to the label and ability to clear ([#149](https://www.github.com/blinkk/editor.dev-ui/issues/149)) ([47f9936](https://www.github.com/blinkk/editor.dev-ui/commit/47f99363f09f95f8aebad0eaad315b4b2933cb84))
* support both `previewField` and `previewFields` for partials ([991d83b](https://www.github.com/blinkk/editor.dev-ui/commit/991d83b6b4a3f356d738f1ad9083ee5c0e168566))
* ui improvements for content and preview panes ([#140](https://www.github.com/blinkk/editor.dev-ui/issues/140)) ([9a87491](https://www.github.com/blinkk/editor.dev-ui/commit/9a874919cde00dd184642da3453a69aedcdfb443)), closes [#97](https://www.github.com/blinkk/editor.dev-ui/issues/97)
* update project type when the project type already exists ([#156](https://www.github.com/blinkk/editor.dev-ui/issues/156)) ([7db1548](https://www.github.com/blinkk/editor.dev-ui/commit/7db154833b61b2bae306517bb64c192af7e937b0))

### [3.4.1](https://www.github.com/blinkk/editor.dev-ui/compare/v3.4.0...v3.4.1) (2021-07-22)


### Bug Fixes

* action for creating missing file ([#126](https://www.github.com/blinkk/editor.dev-ui/issues/126)) ([1762d8c](https://www.github.com/blinkk/editor.dev-ui/commit/1762d8c53451b077b58a671c6e75c467c9b44048))
* data contamination with fields and raw selective editors. ([8b8abee](https://www.github.com/blinkk/editor.dev-ui/commit/8b8abee0fb020076f1d469730229f598c2a9cccd)), closes [#125](https://www.github.com/blinkk/editor.dev-ui/issues/125)
* refining how the selective fields are auto guessed. ([1762d8c](https://www.github.com/blinkk/editor.dev-ui/commit/1762d8c53451b077b58a671c6e75c467c9b44048))

## [3.4.0](https://www.github.com/blinkk/editor.dev-ui/compare/v3.3.0...v3.4.0) (2021-07-22)


### Features

* api error codes for common errors that the UI can handle ([bfd4eb9](https://www.github.com/blinkk/editor.dev-ui/commit/bfd4eb975f159e3e1ce849d5b05f024810e44c16)), closes [#108](https://www.github.com/blinkk/editor.dev-ui/issues/108)
* auto guess fields when no editor config available ([#121](https://www.github.com/blinkk/editor.dev-ui/issues/121)) ([50f0666](https://www.github.com/blinkk/editor.dev-ui/commit/50f06660605e6f307f53447b9e3c712b9ab8b3e3))


### Bug Fixes

* add partial not being passed correct state ([#117](https://www.github.com/blinkk/editor.dev-ui/issues/117)) ([cab0cf7](https://www.github.com/blinkk/editor.dev-ui/commit/cab0cf7449e298396aeff47b441816f5e0e427f5)), closes [#116](https://www.github.com/blinkk/editor.dev-ui/issues/116)
* reload files and file on workspace change ([#123](https://www.github.com/blinkk/editor.dev-ui/issues/123)) ([a1c5331](https://www.github.com/blinkk/editor.dev-ui/commit/a1c53318ee232cec7a982e808f9cf38b7598693d)), closes [#111](https://www.github.com/blinkk/editor.dev-ui/issues/111)

## [3.3.0](https://www.github.com/blinkk/editor.dev-ui/compare/v3.2.1...v3.3.0) (2021-07-20)


### Features

* dark/light mode toggle ([#102](https://www.github.com/blinkk/editor.dev-ui/issues/102)) ([79812bb](https://www.github.com/blinkk/editor.dev-ui/commit/79812bb1f3be1f13956a8be5b4eb2c3edba80d4b))
* recent file list for the empty editor state. ([#104](https://www.github.com/blinkk/editor.dev-ui/issues/104)) ([19bc23a](https://www.github.com/blinkk/editor.dev-ui/commit/19bc23aed9b25862a0a465135481964898b94408))
* recent workspaces list on dashboard ([#107](https://www.github.com/blinkk/editor.dev-ui/issues/107)) ([5d7116a](https://www.github.com/blinkk/editor.dev-ui/commit/5d7116a39dc7da94e174c9463e8623fbc1b24a22))
* screenshot generation for docs ([#113](https://www.github.com/blinkk/editor.dev-ui/issues/113)) ([79f5f0b](https://www.github.com/blinkk/editor.dev-ui/commit/79f5f0b43dd8b881a486472d24be66487f193625))
* website dark mode ([ffbf4b5](https://www.github.com/blinkk/editor.dev-ui/commit/ffbf4b51765c81f15592a08abb6a94d5b6ad0948))


### Bug Fixes

* absolute paths for preview server config ([0a8a755](https://www.github.com/blinkk/editor.dev-ui/commit/0a8a7550c71f65f69b5c3569ae43a909f42c14e2))
* auto field guessing for specific project types ([#105](https://www.github.com/blinkk/editor.dev-ui/issues/105)) ([5e0a7bb](https://www.github.com/blinkk/editor.dev-ui/commit/5e0a7bb2564fb48e9a872c63cf2122ca6f4af398)), closes [#95](https://www.github.com/blinkk/editor.dev-ui/issues/95)
* cleanup the menu list item coloring and variables ([#101](https://www.github.com/blinkk/editor.dev-ui/issues/101)) ([3ca4816](https://www.github.com/blinkk/editor.dev-ui/commit/3ca4816a68a4a2f6cce8627439203fea3b344fb9))
* constant preview pane and loading status ([#99](https://www.github.com/blinkk/editor.dev-ui/issues/99)) ([7b9a970](https://www.github.com/blinkk/editor.dev-ui/commit/7b9a970e8f674c54ff2d6bd5dbc054f51253f4fd))
* fix font issue with website ([0da8700](https://www.github.com/blinkk/editor.dev-ui/commit/0da8700f5307e94ea01ec72c8ab69703e0979f90))
* fix issue with cursor style and nested labels ([4800424](https://www.github.com/blinkk/editor.dev-ui/commit/4800424396d7e3786e0f514d2af0eeffe3c9b56d))
* fix the font stack [#114](https://www.github.com/blinkk/editor.dev-ui/issues/114) ([9279b6d](https://www.github.com/blinkk/editor.dev-ui/commit/9279b6de5ea4159e65a39298ef949bb312b3b6a6))
* improve legibility of ui type ([6ae951b](https://www.github.com/blinkk/editor.dev-ui/commit/6ae951b888fe1946358540e2b5397290b36312af))
* improved styling for onboarding to use grid boxes ([bc5535b](https://www.github.com/blinkk/editor.dev-ui/commit/bc5535b86490c215ba028b9bb66fbe2e691a518a))
* missing preview config handled outside default handler ([#109](https://www.github.com/blinkk/editor.dev-ui/issues/109)) ([f261161](https://www.github.com/blinkk/editor.dev-ui/commit/f261161b21a220c26f4a1cd41617103ed43fbaf3)), closes [#106](https://www.github.com/blinkk/editor.dev-ui/issues/106)
* separate messaging for missing preview config ([4013084](https://www.github.com/blinkk/editor.dev-ui/commit/40130848a7168ce7121b3573c7090b4a339b9e46))
* title for truncated files in the site menu ([7860f13](https://www.github.com/blinkk/editor.dev-ui/commit/7860f1328b87b39ec44f3b282f501a6107b5f79e))

### [3.2.1](https://www.github.com/blinkk/editor.dev-ui/compare/v3.2.0...v3.2.1) (2021-07-12)


### Bug Fixes

* move all colors into the scheme ([#89](https://www.github.com/blinkk/editor.dev-ui/issues/89)) ([f7ea0da](https://www.github.com/blinkk/editor.dev-ui/commit/f7ea0da7b63e066c81a99375fe74fcd080e7d333))
* only truncate file names on hover for file list ([#92](https://www.github.com/blinkk/editor.dev-ui/issues/92)) ([ba051df](https://www.github.com/blinkk/editor.dev-ui/commit/ba051df1e10bcf9d8786a68d413a73ad177ba843))
* promise callback queue and example api for preview server ([#96](https://www.github.com/blinkk/editor.dev-ui/issues/96)) ([7ffa5d1](https://www.github.com/blinkk/editor.dev-ui/commit/7ffa5d1b693cef9ab07e084f1ac642ea2049a01f))
* reload iframe after file save ([#88](https://www.github.com/blinkk/editor.dev-ui/issues/88)) ([5234f40](https://www.github.com/blinkk/editor.dev-ui/commit/5234f403d5a6e6369a671b3b09e4428936670106)), closes [#87](https://www.github.com/blinkk/editor.dev-ui/issues/87)
* saving a file updates the url after save ([#83](https://www.github.com/blinkk/editor.dev-ui/issues/83)) ([ca43785](https://www.github.com/blinkk/editor.dev-ui/commit/ca43785843307e434ff12e77db4c700d6f7b02aa)), closes [#82](https://www.github.com/blinkk/editor.dev-ui/issues/82)
* show hover effect and actions on focus for list item ([3d5723b](https://www.github.com/blinkk/editor.dev-ui/commit/3d5723b2414d5c1659acb7f77c9b91d712c72116))

## [3.2.0](https://www.github.com/blinkk/editor.dev-ui/compare/v3.1.0...v3.2.0) (2021-07-09)


### Features

* ability to do arbitrary string literals ([#73](https://www.github.com/blinkk/editor.dev-ui/issues/73)) ([f6a1981](https://www.github.com/blinkk/editor.dev-ui/commit/f6a198128c8e6297b82d3be658df16c47bd0bd1f))
* loading status for editor files ([04d23a6](https://www.github.com/blinkk/editor.dev-ui/commit/04d23a6e1f816517e6052dce8c9e3c7778d5e142)), closes [#78](https://www.github.com/blinkk/editor.dev-ui/issues/78)
* preview server configuration and usage ([#77](https://www.github.com/blinkk/editor.dev-ui/issues/77)) ([231ea48](https://www.github.com/blinkk/editor.dev-ui/commit/231ea485a7fd1dab06d4b121c14e28c5f93c3cf3))


### Bug Fixes

* fix an issue when the media preview is not a string ([#81](https://www.github.com/blinkk/editor.dev-ui/issues/81)) ([5f40ad6](https://www.github.com/blinkk/editor.dev-ui/commit/5f40ad6e05d6e1718cc85c3766b54d7cdf43ae24))
* fix issue with hover and selected list items ([#75](https://www.github.com/blinkk/editor.dev-ui/issues/75)) ([cf4f2ac](https://www.github.com/blinkk/editor.dev-ui/commit/cf4f2aca6e3f0c0d1f214b14964a48d89ae4636e))
* hide menu modal when starting to load file ([d4143ca](https://www.github.com/blinkk/editor.dev-ui/commit/d4143ca055adc10c840bc5769955e326441f7a7b))
* tighten up the menu to fit more content ([#76](https://www.github.com/blinkk/editor.dev-ui/issues/76)) ([dcca4f3](https://www.github.com/blinkk/editor.dev-ui/commit/dcca4f39ba837402fc70dacb8faa59f21f00aab2))

## [3.1.0](https://www.github.com/blinkk/editor.dev-ui/compare/v3.0.0...v3.1.0) (2021-07-01)


### Features

* github onboarding flow ([#71](https://www.github.com/blinkk/editor.dev-ui/issues/71)) ([a7acf86](https://www.github.com/blinkk/editor.dev-ui/commit/a7acf86a147794a173c02d65acd8ae102b80f4e7))

## [3.0.0](https://www.github.com/blinkk/editor.dev-ui/compare/v2.0.0...v3.0.0) (2021-06-25)


### ⚠ BREAKING CHANGES

* move `sass` into `src` directory (#69)

### Features

* Banner for unstable version of the docs to direct to stable. ([82f554c](https://www.github.com/blinkk/editor.dev-ui/commit/82f554c5548b5247747a559942769b994c20d72f))
* dark mode editor ([#68](https://www.github.com/blinkk/editor.dev-ui/issues/68)) ([2b89d4d](https://www.github.com/blinkk/editor.dev-ui/commit/2b89d4d04ebabbab4c392011b0d659092ddf5d1d))
* Dark mode for the website. ([a6ed3e1](https://www.github.com/blinkk/editor.dev-ui/commit/a6ed3e15e216643359fdf60c9aa1632a9fcfc9e8))
* website maintained local server ui ([#67](https://www.github.com/blinkk/editor.dev-ui/issues/67)) ([a6ed3e1](https://www.github.com/blinkk/editor.dev-ui/commit/a6ed3e15e216643359fdf60c9aa1632a9fcfc9e8))


### Bug Fixes

* bad css indentation ([15e4cd3](https://www.github.com/blinkk/editor.dev-ui/commit/15e4cd313a618d85c6907da9e59bd0d462ae7c2b))
* docker build with symlinked build files. ([dcd1b7d](https://www.github.com/blinkk/editor.dev-ui/commit/dcd1b7d2f738b0bbeb04c88336249a033d3e1927))
* logo on website header ([ee9afac](https://www.github.com/blinkk/editor.dev-ui/commit/ee9afacddd85433a8b7a1d0cf3fac96f58f93479))
* Media list add new and lock new items when field is locked. ([921df0c](https://www.github.com/blinkk/editor.dev-ui/commit/921df0c4bdee4068f376ddc270504da26fcb81ee))
* redirect missing trailing slashes when not found ([c34f778](https://www.github.com/blinkk/editor.dev-ui/commit/c34f7786e5ee65b42f476d86210414396ce1de21))
* remove copy of old github callback file ([2a04f79](https://www.github.com/blinkk/editor.dev-ui/commit/2a04f792976a827ed287023d4e02149ddd233835))
* serve static files after normal routing ([f5e6036](https://www.github.com/blinkk/editor.dev-ui/commit/f5e60365b50e51a6e50364c868322f23cc6eca37))
* trim the summary for the history to the first line ([35b3af3](https://www.github.com/blinkk/editor.dev-ui/commit/35b3af375a6c01231f553246b4b82307a4967df9))
* update footer and header styling ([d8c37e3](https://www.github.com/blinkk/editor.dev-ui/commit/d8c37e33c373b268135e6b4baae02cea6d5e38ae))
* website root using `cwd`. ([ff27ba7](https://www.github.com/blinkk/editor.dev-ui/commit/ff27ba72307ab8b0fa5c004284dd24e7ab045936))


### Code Refactoring

* move `sass` into `src` directory ([#69](https://www.github.com/blinkk/editor.dev-ui/issues/69)) ([995b41d](https://www.github.com/blinkk/editor.dev-ui/commit/995b41d996992c612edee481ab02de75a3a72869))

## [2.0.0](https://www.github.com/blinkk/editor.dev-ui/compare/v1.3.7...v2.0.0) (2021-06-22)


### ⚠ BREAKING CHANGES

* Media field improvements (#58)

### Features

* Media field improvements ([#58](https://www.github.com/blinkk/editor.dev-ui/issues/58)) ([d283b3e](https://www.github.com/blinkk/editor.dev-ui/commit/d283b3ea69c1e1b4b92b28236b13756e6620f972))


### Bug Fixes

* Add missing amagaki yaml type. ([8797645](https://www.github.com/blinkk/editor.dev-ui/commit/879764573bc59447cf8a1c8c4708e9c3a67625e4))
* correct documentation build for releases. ([c9ed85b](https://www.github.com/blinkk/editor.dev-ui/commit/c9ed85b7945f327559fa5929b27b8766248f6765))
* Html and Markdown fields support for image uploads ([#61](https://www.github.com/blinkk/editor.dev-ui/issues/61)) ([eb95c59](https://www.github.com/blinkk/editor.dev-ui/commit/eb95c59b2fe919f935b176a603aafdce1381cf75))
* Remove LiveEditor from default export. ([6c8de6b](https://www.github.com/blinkk/editor.dev-ui/commit/6c8de6bc929a4cf4cc61bfb23eefe2589c8be2df))
* Update label for media list expanded view to use label. ([fa962d4](https://www.github.com/blinkk/editor.dev-ui/commit/fa962d41a29adc0e7ec90a3720f712a43a771857))
* Upload file needs to use fetch until bent issue is fixed. ([#60](https://www.github.com/blinkk/editor.dev-ui/issues/60)) ([03b563d](https://www.github.com/blinkk/editor.dev-ui/commit/03b563dc924a67796d50605ed803087ed8f4c297))
* Use the path for input value in the media field. ([1bb86e3](https://www.github.com/blinkk/editor.dev-ui/commit/1bb86e37bd8475ac538952603cb2f383a0569384))

### [1.3.7](https://www.github.com/blinkk/editor.dev-ui/compare/v1.3.6...v1.3.7) (2021-06-17)


### Bug Fixes

* Adding tsc compile for the publish only. ([3d71c9b](https://www.github.com/blinkk/editor.dev-ui/commit/3d71c9b45ceb88e0b7ad3bf6b484c02f80274fd8))
* Simplify the yarn publishing process. ([5e30c55](https://www.github.com/blinkk/editor.dev-ui/commit/5e30c554fe4b4c5e2686b0662eeaaa1c86c9b241))

### [1.3.6](https://www.github.com/blinkk/editor.dev-ui/compare/v1.3.5...v1.3.6) (2021-06-16)


### Bug Fixes

* Pass the tag from release please to deploy to prod. ([fdf68cc](https://www.github.com/blinkk/editor.dev-ui/commit/fdf68ccbc25d44ed01bac7d55234a2dbbf93a4be))

### [1.3.5](https://www.github.com/blinkk/editor.dev-ui/compare/v1.3.4...v1.3.5) (2021-06-16)


### Bug Fixes

* Deploy on release creation. ([864d7f3](https://www.github.com/blinkk/editor.dev-ui/commit/864d7f35ca65386ff55abd318c4d1fb16e508ae2))

### [1.3.4](https://www.github.com/blinkk/editor.dev-ui/compare/v1.3.3...v1.3.4) (2021-06-16)


### Bug Fixes

* add deploy step after tagging. ([d6c87d1](https://www.github.com/blinkk/editor.dev-ui/commit/d6c87d11cd0dc578f3fbb769b35b43fd27071b9b))
* Remove deploy from the release please process. ([012a73e](https://www.github.com/blinkk/editor.dev-ui/commit/012a73ed0162b00137e6692ae9bf3b1d3aa456d9))

### [1.3.3](https://www.github.com/blinkk/editor.dev-ui/compare/v1.3.2...v1.3.3) (2021-06-16)


### Bug Fixes

* skip lib check when compiling for prod. ([30ae60a](https://www.github.com/blinkk/editor.dev-ui/commit/30ae60ad78e8dc0b161c6515e1a247ffa74ebd79))

### [1.3.2](https://www.github.com/blinkk/editor.dev-ui/compare/v1.3.1...v1.3.2) (2021-06-16)


### Bug Fixes

* Update release process to deploy production version. ([38d6f19](https://www.github.com/blinkk/editor.dev-ui/commit/38d6f1989a29505eb694a22648a630ec023309d5))

### [1.3.1](https://www.github.com/blinkk/editor.dev-ui/compare/v1.3.0...v1.3.1) (2021-06-16)


### Bug Fixes

* Update gcloud ids to be valid. ([b60c4c9](https://www.github.com/blinkk/editor.dev-ui/commit/b60c4c94fc77db7d8c8f2e3d0cfd0b41a96c0469))
* Update image ids for cloudbuild. ([3ea60a8](https://www.github.com/blinkk/editor.dev-ui/commit/3ea60a86e7d6230682bab9cab025c5ac330526d9))
* Using older version of tui editor. ([f56fdad](https://www.github.com/blinkk/editor.dev-ui/commit/f56fdada1da08e88ab0d64fdac003c51d184bb2d))

## [1.3.0](https://www.github.com/blinkk/editor.dev-ui/compare/v1.2.1...v1.3.0) (2021-06-15)


### Features

* Html and Markdown Fields ([#49](https://www.github.com/blinkk/editor.dev-ui/issues/49)) ([51c5c4d](https://www.github.com/blinkk/editor.dev-ui/commit/51c5c4de2ce3ff657aeefd63e36923d4ca61c612))

### [1.2.1](https://www.github.com/blinkk/editor.dev-ui/compare/v1.2.0...v1.2.1) (2021-05-21)


### Bug Fixes

* Release please release process for packaging. ([5daadd1](https://www.github.com/blinkk/editor.dev-ui/commit/5daadd170d1b26172a7fa79b3ff447e97d7cea0f))

## [1.2.0](https://www.github.com/blinkk/editor.dev-ui/compare/v1.1.0...v1.2.0) (2021-05-21)


### Features

* Dynamic remote media providers for editor server. ([#45](https://www.github.com/blinkk/editor.dev-ui/issues/45)) ([0f04cdc](https://www.github.com/blinkk/editor.dev-ui/commit/0f04cdc9bf7615ee184d37236d93b6487203c772))

## [1.1.0](https://www.github.com/blinkk/editor.dev-ui/compare/v1.0.24...v1.1.0) (2021-05-20)


### Features

* remote media upload ([#43](https://www.github.com/blinkk/editor.dev-ui/issues/43)) ([f7c73b3](https://www.github.com/blinkk/editor.dev-ui/commit/f7c73b335dd7f687f31e4fc68c3a9d3446e9393e))
