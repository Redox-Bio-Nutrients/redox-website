# Avatar

A person's face: their photo, else their initials on one of eight steady colours.

Static rendition hand-written from apps/web/src/components/Avatar.tsx (`Avatar`, `AvatarStack`).

- Initials (first and last word) in white (`avatar-ink`) on `avatar-1`…`avatar-8`, chosen by a hash of the person's id or email, the same in every theme. Sizes 18, 24, 32, 56, 80px; round.
- Hidden from screen readers when the name sits beside it; labelled with the name when it stands alone.
- Stacks overlap by 6px with a 2px ring in the card colour, then "+3".
