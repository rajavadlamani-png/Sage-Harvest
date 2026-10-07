# Puja Vaani Prototype

This is an isolated browser-based experiment for replacing the current Gemini Live voice transport.

## Architecture under evaluation

SraVaani ASR → Sage Harvest retrieval → Gemini text → female TTS

The current page only embeds the official ARTPARK-IISc Hugging Face demos for SraVaani Live and DhVaani. No production Puja files are modified.

## Constraints

- No local software installation.
- Puja retains a female voice.
- Production Puja 33 remains untouched until the replacement is proven.

## Next engineering step

After browser testing confirms the hosted Vaani components, connect a hosted ASR result to the existing Sage Harvest knowledge retrieval and Gemini text-answer layer, then evaluate DhVaani as the female speech output.
