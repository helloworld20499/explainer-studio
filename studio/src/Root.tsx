import React from 'react';
import {Composition} from 'remotion';
import {Ep000, EP000_TOTAL} from './episodes/ep000/Main';
import {ThumbA, ThumbB, Ep000Short, SHORT_TOTAL} from './episodes/ep000/publish/Publish';
import {KitGallery} from './kit/Gallery';
import {LibraryPage, StatesPage, PictogramPage, PAGES} from './objlib/Gallery';
import {PatternsReel, PatternsSheet, REEL_TOTAL} from './patterns';

// Compositions per episode (scripts depend on these ids):
//   <ep>            final picture (silent; final.sh adds the mix)
//   <ep>-preview    with the voice, for checks in Remotion Studio
//   <ep>-animatic   Gate 2: voice + shot numbers + timecode + line text
//   <ep>-short      9:16 Short (publish.sh)
//   <ep>-thumb-<x>  thumbnails 1280x720 (publish.sh renders every id that starts with <ep>-thumb-)
const fr = (s: number) => Math.round(s * 30);
export const Root: React.FC = () => (
  <>
    <Composition id="ep000" component={Ep000} durationInFrames={fr(EP000_TOTAL)} fps={30} width={1920} height={1080} />
    <Composition id="ep000-preview" component={Ep000} defaultProps={{voice: true}} durationInFrames={fr(EP000_TOTAL)} fps={30} width={1920} height={1080} />
    <Composition id="ep000-animatic" component={Ep000} defaultProps={{voice: true, animatic: true}} durationInFrames={fr(EP000_TOTAL)} fps={30} width={1920} height={1080} />
    <Composition id="ep000-short" component={Ep000Short} durationInFrames={fr(SHORT_TOTAL)} fps={30} width={1080} height={1920} />
    <Composition id="ep000-thumb-a" component={ThumbA} durationInFrames={1} fps={30} width={1280} height={720} />
    <Composition id="ep000-thumb-b" component={ThumbB} durationInFrames={1} fps={30} width={1280} height={720} />
    <Composition id="kit-gallery" component={KitGallery} durationInFrames={150} fps={30} width={1920} height={1080} />
    {/* object library catalogue (scripts/render-library.sh) */}
    {Array.from({length: PAGES}, (_, p) => (['flat', 'whiteboard'] as const).map((look) => (
      <Composition key={`${look}${p}`} id={`objlib-${look}-${p + 1}`} component={LibraryPage} defaultProps={{page: p, look}} durationInFrames={150} fps={30} width={1920} height={1080} />
    )))}
    <Composition id="objlib-states" component={StatesPage} durationInFrames={150} fps={30} width={1920} height={1080} />
    <Composition id="objlib-pictograms" component={PictogramPage} durationInFrames={150} fps={30} width={1920} height={1080} />
    {/* explanation patterns (docs/patterns.md) */}
    <Composition id="patterns-reel" component={PatternsReel} durationInFrames={fr(REEL_TOTAL)} fps={30} width={1920} height={1080} />
    <Composition id="patterns-reel-whiteboard" component={PatternsReel} defaultProps={{look: 'whiteboard' as const}} durationInFrames={fr(REEL_TOTAL)} fps={30} width={1920} height={1080} />
    <Composition id="patterns-sheet" component={PatternsSheet} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="patterns-sheet-whiteboard" component={PatternsSheet} defaultProps={{look: 'whiteboard' as const}} durationInFrames={1} fps={30} width={1920} height={1080} />
  </>
);
