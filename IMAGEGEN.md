# Изображение для первого экрана

Режим: встроенный инструмент imagegen, одна генерация по изображению-референсу оборудования. Изображение не является подтверждённым портретом Мартина.

Оригинал в проекте: `output/imagegen/master-cleaning-original.png`, 1536 × 1024.
Оптимизированные версии: `dist/assets/images/master-cleaning-1600.webp` (1536 × 1024) и `dist/assets/images/master-cleaning-800.webp` (800 × 534).
Референс: `source/santoemma-sabrina-original.png`.

## Финальный промпт

```text
Use case: photorealistic-natural
Asset type: landscape hero photograph for a Moscow home upholstery cleaning specialist's website.
Input image 1 is an equipment reference, not the background or composition to reproduce. Match this specific compact Santoemma Sabrina extractor visibly and faithfully: a compact upright boxy two-part bright cobalt-blue textured plastic body, a horizontal seam separating the two stacked tanks, integrated blue top handle, silver-rimmed transparent top lid at one top corner, small metal front latch, black corrugated suction hose, and clear triangular upholstery extraction nozzle. Keep the equipment as real, compact professional machinery, with coherent proportions and physically plausible hose connections.
Scene/backdrop: bright tasteful real apartment, off-white walls, light wooden floor, light oatmeal linen couch, warm daylight from a window and one subtle green plant near the window.
Subject: exactly one adult male cleaning specialist, an illustrative anonymous worker, wearing a clean dark navy polo shirt and sand-colored work trousers. He is crouched beside the sofa and is carefully using the clear upholstery extraction nozzle against the sofa seat. His hand has a natural secure grip. The complete blue extractor stands prominently on the wooden floor beside him and is connected to the nozzle by the black corrugated hose in one physically plausible continuous path.
Style/medium: authentic premium interior editorial photography, natural skin and fabric textures, warm natural color, believable candid work scene, restrained photographic contrast.
Composition/framing: wide landscape 3:2 composition, worker and machine at center/right, show both worker and complete extractor fully, enough clean breathing room on all edges for responsive crops, inviting apartment space on the left. Camera at a natural low waist height, moderate wide lens without distorted anatomy or machine geometry.
Lighting/mood: warm soft daylight, relaxed clean inviting atmosphere, realistic soft shadows.
Constraints: exactly one image. No added text, no captions, no UI, no badges, no watermark. The worker is not a claimed likeness of any specific real person. Do not reproduce the white product-photo background. Avoid glossy artificial AI aesthetics, distorted hands, oversized machinery, duplicated hoses, floating equipment, or decorative cleaning tools.
```

## Крупный план чистки ткани

Режим: встроенный imagegen, одна генерация по двум референсам. Оригинал: `output/imagegen/upholstery-extraction-detail-original.png`, 1536 × 1024.
Версии для сайта: `dist/assets/images/upholstery-detail-1536.webp` и `dist/assets/images/upholstery-detail-800.webp`.
Референсы: `source/photo_12_2026-09-19_20-28-13.jpg` и `source/santoemma-sabrina-original.png`. Оба оригинала не изменялись.

Точный промпт второго вызова:

```text
Use case: photorealistic-natural
Asset type: wide landscape 3:2 close-up process photograph for a premium home upholstery cleaning website, the companion to warm natural apartment editorial photography.
Input images: image 1 is the primary reference for the actual translucent upholstery extraction nozzle and coarse woven sofa texture. Image 2 is the equipment reference for the exact Santoemma Sabrina hand wand geometry only. Preserve the real nozzle design: a long milky-clear/translucent cylindrical suction tube bending down into an angular wide triangular wedge head, flat straight contact lip, black retaining band and handle connection, slim blue solution feed tube along the underside, small realistic metal trigger. Do not include the blue extractor machine in this close-up.
Primary request: a photorealistic premium editorial macro/close-up of that real transparent triangular upholstery extraction head pressed flat against warm grey/taupe woven sofa seat fabric while being drawn slowly across it. Exactly one realistically proportioned technician hand enters from top/right and securely holds the black handle; the black corrugated hose is plausibly connected toward the right edge. No face or other body parts.
Main subject: the upholstery material itself, with richly visible crosshatched individual woven fibers across most of the image, believable tactile coarse weave and fine loose fiber detail. The nozzle's contact lip rests geometrically flush on the fabric. Fabric immediately under the head is only slightly darkened by moisture. Show a subtle freshly extracted path, without any sharp or dramatic before/after boundary. A few tiny moisture droplets and modest traces of soapy water are visible inside the translucent nozzle.
Composition/framing: close enough that the fabric texture remains prominent at mobile size. Wide horizontal landscape 3:2 frame. The nozzle contact head is in the middle-left and lower middle, the wand and one hand extend diagonally toward the upper right, fabric fills the foreground and background. A little sofa seat seam can softly establish context. Do not turn this into a product packshot.
Lighting/style: soft warm natural window light, restrained home documentary/editorial photography, realistic matte woven materials and natural skin, warm neutral tones consistent with an inviting daylight apartment. Shallow but not extreme depth of field: nozzle contact edge and most foreground fabric crisp, only far background softly blurred.
Constraints: exactly one image. No visible face, text, overlays, logos, captions, badges, watermarks, steam, spraying jets, excessive foam, hard before/after split, implausibly dramatic color change, plastic-looking cloth, extra fingers or hands. Match the reference nozzle closely and keep the suction tube, feed tube and hose physically coherent.
```
## Замена лица на первом экране

Встроенный imagegen, режим `identity-preserve`. Целевая сцена: `output/imagegen/master-cleaning-original.png`. Референс лица: `source/worker-face-reference-2026-09-19.png`.

Результат: `output/imagegen/master-cleaning-face-v2.png` (1536 × 1024). На сайте используются `dist/assets/images/master-cleaning-face-v2-1536.webp` и `dist/assets/images/master-cleaning-face-v2-800.webp`. Предыдущая сцена и оригиналы сохранены. Композиция, поза, одежда, интерьер и оборудование сохранены; изменено лицо и волосы по референсу.

Точный промпт:

```text
Use case: identity-preserve
Asset type: photorealistic edited hero photograph for an upholstery cleaning website.
Input images: Image 1 is the EDIT TARGET: the existing landscape photograph of a crouching worker cleaning a light sofa beside a blue Santoemma Sabrina extractor. Image 2 is the IDENTITY REFERENCE supplied by the user: the face to put on that worker.
Primary request: replace only the worker's facial identity, scalp/hairline, hair and facial hair in Image 1 with the recognizable likeness from Image 2. Closely preserve the reference person's facial proportions, high forehead with strongly receding/sparse hair on top, short dark side hair, full dark beard and moustache, nose, brows, cheeks and eyes. Reconstruct those identity features naturally at the existing worker's downward three-quarter head angle; keep him focused on the cleaning nozzle. Maintain the original head's realistic scale relative to the body and blend the jaw, beard and neck seamlessly.
Lighting/style: match the warm soft window daylight, color balance, skin texture, focus and photographic grain of Image 1. Do not copy the reference photo's haze, low resolution, backlighting or background.
Invariants: preserve the exact landscape composition and 3:2 aspect ratio of Image 1. Keep the body, crouching pose, hands, navy polo, sand trousers, footwear, sofa, upholstery nozzle, hose, complete blue Santoemma Sabrina machine, furniture, plants, interior, shadows, camera framing and background unchanged. Preserve the equipment's shape, scale and existing labeling. Change only the head/face/hair/beard region and the minimal neck transition required for natural integration.
Avoid: a generic lookalike, the original young worker's hairstyle, a full head of hair, enlarged head, unnatural face paste edges, distorted anatomy, extra people, added text, captions, badges or watermark. Return one finished photographic image.
```

## Новый портрет для первого экрана — 20 сентября

Встроенный imagegen, `identity-preserve`. Исходная сцена: `output/imagegen/master-cleaning-original.png`. Новый референс: `source/worker-face-reference-2026-09-20.png`.

Результат: `output/imagegen/master-cleaning-face-v3.png`, 1536 × 1024. Версии для сайта: `dist/assets/images/master-cleaning-face-v3-1536.webp` и `dist/assets/images/master-cleaning-face-v3-800.webp`. Использовано лицо и кепка с нового снимка, композиция рабочей сцены сохранена.

Точный промпт:

```text
Use case: identity-preserve
Asset type: updated photorealistic landscape hero photograph for the same upholstery cleaning website.
Input images: Image 1 is the EDIT TARGET and locked scene: a male worker crouched beside a pale sofa, cleaning it with a clear upholstery wand connected to a blue Santoemma Sabrina extractor. Image 2 is the NEW IDENTITY REFERENCE: use only the adult man's face and his baseball cap; ignore the partially visible other person and the portrait background.
Primary request: put the recognizable man from Image 2 into the existing worker's role in Image 1. Match the reference man's facial proportions, eyes, eyebrows, nose, slightly smiling mouth and short light beard/stubble and moustache. Include the reference's dark baseball cap with teal brim, fitted naturally on his head. This is a new identity reference; do not use a bald head or a long/full beard from earlier edits. Give the man a natural attentive expression, with his face at a gentle three-quarter angle, looking down toward his work but sufficiently visible to recognize his facial features.
Preserve: the worker's body, crouching pose, hands and grip, navy polo, tan work trousers, footwear, couch, pillows, clear extraction nozzle, hose, complete blue Santoemma Sabrina machine and its original label, apartment furniture and plants, floor, warm natural daylight, camera perspective, landscape 3:2 composition and all object positions. Change only the head/face/cap region and the small neck transition needed for a seamless result. Keep the original head scale relative to the body.
Style: authentic natural editorial photography. Reconstruct the face cleanly at the target photograph's quality; do not import the reference's compression, crop, tilted camera or background. Match light direction, shadows, natural skin texture and warm color balance. Anatomically coherent, natural integration.
Avoid: generic substitute facial features, heavy beard, bald scalp, oversized head, pasted face edges, extra people, changed equipment, added captions, badges, UI or watermark. Return one finished image at the same 1536 by 1024 composition.
```
