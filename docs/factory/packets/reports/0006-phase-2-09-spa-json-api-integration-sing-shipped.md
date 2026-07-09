# Phase 2 · 09 · SPA <-> JSON API integration + single-origin Render deploy

- id: 0006-phase-2-09-spa-json-api-integration-sing
- stage: done
- kind: mixed
- priority: 6

## Artifacts
- triage.md: yes
- spec.md: yes
- plan.md: yes
- design/choice.md: yes
- reviews/synthesis.md: yes

## Recent events
- 2026-07-09T20:58:51Z stage.advance {'from': 'review', 'reason': 'review clean; browser verify next', 'to': 'verify'}
- 2026-07-09T21:05:25Z verify.green {'criteria': '7/7', 'tests': '25 backend + live browser walk (login->course->MCQ); 1 verify-caught bug fixed'}
- 2026-07-09T21:05:25Z stage.advance {'from': 'verify', 'reason': '7/7 verified incl browser walk', 'to': 'ship'}
- 2026-07-09T21:05:43Z ship.merged {'mode': 'auto', 'ref': '08df8cb25fb85c5406f3966468e994477a274885'}
- 2026-07-09T21:05:43Z stage.advance {'from': 'ship', 'reason': 'merged 08df8cb25fb85c5406f3966468e994477a274885; merged-tree tox green', 'to': 'done'}

## Respond
Reply in session, or use the factory CLI to record your
decision (for a design pause: `factory choice <id> <option>`),
then run `/factory:run` to resume.
