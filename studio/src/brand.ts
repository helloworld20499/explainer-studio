// ONE place for the channel brand. Change this file (and the files in public/brand/) for a new channel.
// Everything in src/kit/ reads from here.
export const BRAND = {
  name: 'My Channel',                       // shown in the intro, outro, thumbnails, Short end card
  tagline: 'Big ideas, explained simply.',
  handle: '@mychannel',
  // logo files (optional): public/brand/logo-mark.png (square), public/brand/logo-horizontal.png.
  // When a file is missing, the kit draws the name as a word mark instead.
  logoMark: 'brand/logo-mark.png',
  logoHorizontal: 'brand/logo-horizontal.png',
  fonts: {title: 'Fredoka', body: 'Nunito'},      // inlined in src/kit/fontcss.ts (SIL Open Font License); title = titles, labels, numbers
  // How the object library is drawn: 'flat' (filled, picture-book) or 'whiteboard' (live marker drawing). One switch for the whole channel.
  render: 'flat' as 'flat' | 'whiteboard',
  colors: {
    bg: '#FBF6EC',      // page background
    wall: '#F5ECDC',    // default set background
    floor: '#E7D6B8',
    ink: '#1E2A44',     // outlines and text
    muted: '#7D8699',
    accent: '#EF6F5E',  // the one "look here" colour: last word of titles, spoken word in captions
    button: '#E2464F',  // subscribe button
  },
  // Concept colours for explainer pieces. One colour = one meaning in each video (write the meanings in the storyboard).
  science: {
    yellow: '#F4B63F', red: '#E2464F', blue: '#2E9BD6', orange: '#F08A3C', lilac: '#9B7BD0', lilacLight: '#CDBDEB',
    sky: '#BFE3F6', skyDeep: '#6FBDE6', cell: '#9BBF5A', cellLight: '#E4EFCB', cellDark: '#6E9338', white: '#FFFFFF',
  },
  // Optional series (playlists). The tag shows in the intro, thumbnails and the Short.
  series: {
    main: {name: 'Explained', color: '#A9C0D6'},
    quick: {name: 'Quick Facts', color: '#F1CFAE'},
  } as Record<string, {name: string; color: string}>,
};

// Cast. Leave empty for a narrator-only channel. Height = standing height in the 1920x1080 world (px).
// Images: brand/characters/library/<id>_<pose>.png on pure green #00FF00 (see docs/production-pipeline.md).
export const CAST: Record<string, {name: string; color: string; height: number}> = {
  host: {name: 'Host', color: '#7F9CB8', height: 700},
  buddy: {name: 'Buddy', color: '#D98C7E', height: 520},
};
